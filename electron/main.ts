import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import net from 'net';
import http from 'http';
import { fork, ChildProcess } from 'child_process';
import electronSquirrelStartup from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (electronSquirrelStartup) {
  app.quit();
  process.exit(0);
}

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let backendPort: number = 3000;

// Find an available port on 127.0.0.1
function getAvailablePort(preferredPort = 3000): Promise<number> {
  return new Promise((resolve) => {
    const testServer = net.createServer();
    testServer.unref();

    testServer.on('error', () => {
      // Preferred port in use, bind to any free dynamic port
      const randomServer = net.createServer();
      randomServer.unref();
      randomServer.listen(0, '127.0.0.1', () => {
        const addr = randomServer.address() as net.AddressInfo;
        const freePort = addr.port;
        randomServer.close(() => resolve(freePort));
      });
    });

    testServer.listen(preferredPort, '127.0.0.1', () => {
      const addr = testServer.address() as net.AddressInfo;
      const freePort = addr.port;
      testServer.close(() => resolve(freePort));
    });
  });
}

// Check if Express backend is responsive via /api/health
function checkServerReady(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/health',
        timeout: 1000
      },
      (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Poll readiness until ready or timeout (30 seconds)
async function waitForBackend(port: number, maxWaitMs = 30000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const isReady = await checkServerReady(port);
    if (isReady) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

// Locate server.cjs across development, production, and packaged Electron runtimes
function resolveServerScript(): string {
  const appPath = app.getAppPath();
  const candidates = [
    path.join(appPath, 'dist', 'server.cjs'),
    path.join(__dirname, '..', 'dist', 'server.cjs'),
    path.join(__dirname, 'server.cjs'),
    path.join(process.resourcesPath || '', 'app', 'dist', 'server.cjs'),
    path.join(process.resourcesPath || '', 'dist', 'server.cjs')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Fallback for dev mode where server.cjs might be built
  return path.join(appPath, 'dist', 'server.cjs');
}

// Locate application icon
function resolveAppIcon(): string | undefined {
  const appPath = app.getAppPath();
  const isWin = process.platform === 'win32';
  const iconCandidates = isWin
    ? [
        path.join(appPath, 'assets', 'icon.ico'),
        path.join(process.resourcesPath || '', 'assets', 'icon.ico'),
        path.join(appPath, 'public', 'icon.svg')
      ]
    : [
        path.join(appPath, 'assets', 'icon.png'),
        path.join(process.resourcesPath || '', 'assets', 'icon.png'),
        path.join(appPath, 'public', 'icon.svg')
      ];

  for (const iconPath of iconCandidates) {
    if (fs.existsSync(iconPath)) return iconPath;
  }
  return undefined;
}

// Launch bundled Express backend as isolated child process
async function startBackend(): Promise<number> {
  // If in dev mode and dev server is already running, check if it's accessible
  if (!app.isPackaged && process.env.TAMIFY_DEV_URL) {
    console.log(`[Tamify Desktop] Connecting to dev server at ${process.env.TAMIFY_DEV_URL}`);
    return 3000;
  }

  const port = await getAvailablePort(3000);
  backendPort = port;

  const serverScript = resolveServerScript();
  console.log(`[Tamify Desktop] Launching Express backend from ${serverScript} on port ${port}...`);

  // Use Electron's own runtime as node when packaged or spawn node
  const nodeExec = process.execPath;
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    TAMIFY_PORT: String(port),
    TAMIFY_HOST: '127.0.0.1',
    TAMIFY_ELECTRON: 'true',
    ELECTRON_SERVE_DIST: 'true',
    NODE_ENV: 'production'
  };

  // Safe API key fallback from user config if present
  const userConfigPath = path.join(app.getPath('userData'), 'tamify-config.json');
  if (fs.existsSync(userConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));
      if (config.GEMINI_API_KEY && !env.GEMINI_API_KEY) {
        env.GEMINI_API_KEY = config.GEMINI_API_KEY;
      }
    } catch (e) {
      console.warn('[Tamify Desktop] Could not parse user config:', e);
    }
  }

  backendProcess = fork(serverScript, [], {
    env,
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  });

  backendProcess.stdout?.on('data', (data) => {
    console.log(`[Tamify Server] ${data.toString().trim()}`);
  });

  backendProcess.stderr?.on('data', (data) => {
    console.error(`[Tamify Server Error] ${data.toString().trim()}`);
  });

  backendProcess.on('exit', (code, signal) => {
    console.log(`[Tamify Server] Process exited with code ${code}, signal ${signal}`);
    backendProcess = null;
  });

  const ready = await waitForBackend(port, 30000);
  if (!ready) {
    console.error(`[Tamify Desktop] Backend server failed to become ready on port ${port}`);
  } else {
    console.log(`[Tamify Desktop] Backend server verified responsive on http://127.0.0.1:${port}`);
  }

  return port;
}

// Terminate child backend process
function stopBackend() {
  if (backendProcess) {
    console.log('[Tamify Desktop] Stopping backend server...');
    try {
      backendProcess.send('shutdown');
    } catch {
      // IPC might be closed
    }

    try {
      backendProcess.kill('SIGTERM');
    } catch {
      // ignore
    }

    // Force kill if still running after 1.5s
    setTimeout(() => {
      if (backendProcess) {
        try {
          backendProcess.kill('SIGKILL');
        } catch {
          // ignore
        }
        backendProcess = null;
      }
    }, 1500);
  }
}

// Create native desktop window
function createMainWindow(port: number) {
  const iconPath = resolveAppIcon();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    title: 'Tamify',
    icon: iconPath,
    backgroundColor: '#0A0B0E',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Display window once ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Open external links in user's default system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  const targetUrl = process.env.TAMIFY_DEV_URL || `http://127.0.0.1:${port}`;
  console.log(`[Tamify Desktop] Loading URL: ${targetUrl}`);
  mainWindow.loadURL(targetUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Setup IPC handlers
ipcMain.handle('tamify:open-external', (_event, url: string) => {
  if (url.startsWith('https://') || url.startsWith('http://')) {
    shell.openExternal(url);
  }
});

ipcMain.handle('tamify:get-app-info', () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    isPackaged: app.isPackaged,
    backendPort
  };
});

// Application lifecycle
app.whenReady().then(async () => {
  try {
    const port = await startBackend();
    createMainWindow(port);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow(port);
      }
    });
  } catch (err) {
    console.error('[Tamify Desktop] Failed to initialize desktop shell:', err);
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('exit', () => {
  stopBackend();
});

process.on('SIGINT', () => {
  stopBackend();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopBackend();
  process.exit(0);
});
