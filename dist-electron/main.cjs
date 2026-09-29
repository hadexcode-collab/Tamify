var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_net = __toESM(require("net"), 1);
var import_http = __toESM(require("http"), 1);
var import_child_process = require("child_process");
var import_electron_squirrel_startup = __toESM(require("electron-squirrel-startup"), 1);
if (import_electron_squirrel_startup.default) {
  import_electron.app.quit();
  process.exit(0);
}
var mainWindow = null;
var backendProcess = null;
var backendPort = 3e3;
function getAvailablePort(preferredPort = 3e3) {
  return new Promise((resolve) => {
    const testServer = import_net.default.createServer();
    testServer.unref();
    testServer.on("error", () => {
      const randomServer = import_net.default.createServer();
      randomServer.unref();
      randomServer.listen(0, "127.0.0.1", () => {
        const addr = randomServer.address();
        const freePort = addr.port;
        randomServer.close(() => resolve(freePort));
      });
    });
    testServer.listen(preferredPort, "127.0.0.1", () => {
      const addr = testServer.address();
      const freePort = addr.port;
      testServer.close(() => resolve(freePort));
    });
  });
}
function checkServerReady(port) {
  return new Promise((resolve) => {
    const req = import_http.default.get(
      {
        hostname: "127.0.0.1",
        port,
        path: "/api/health",
        timeout: 1e3
      },
      (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}
async function waitForBackend(port, maxWaitMs = 3e4) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const isReady = await checkServerReady(port);
    if (isReady) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}
function resolveServerScript() {
  const appPath = import_electron.app.getAppPath();
  const candidates = [
    import_path.default.join(appPath, "dist", "server.cjs"),
    import_path.default.join(__dirname, "..", "dist", "server.cjs"),
    import_path.default.join(__dirname, "server.cjs"),
    import_path.default.join(process.resourcesPath || "", "app", "dist", "server.cjs"),
    import_path.default.join(process.resourcesPath || "", "dist", "server.cjs")
  ];
  for (const candidate of candidates) {
    if (import_fs.default.existsSync(candidate)) {
      return candidate;
    }
  }
  return import_path.default.join(appPath, "dist", "server.cjs");
}
function resolveAppIcon() {
  const appPath = import_electron.app.getAppPath();
  const isWin = process.platform === "win32";
  const iconCandidates = isWin ? [
    import_path.default.join(appPath, "assets", "icon.ico"),
    import_path.default.join(process.resourcesPath || "", "assets", "icon.ico"),
    import_path.default.join(appPath, "public", "icon.svg")
  ] : [
    import_path.default.join(appPath, "assets", "icon.png"),
    import_path.default.join(process.resourcesPath || "", "assets", "icon.png"),
    import_path.default.join(appPath, "public", "icon.svg")
  ];
  for (const iconPath of iconCandidates) {
    if (import_fs.default.existsSync(iconPath)) return iconPath;
  }
  return void 0;
}
async function startBackend() {
  if (!import_electron.app.isPackaged && process.env.TAMIFY_DEV_URL) {
    console.log(`[Tamify Desktop] Connecting to dev server at ${process.env.TAMIFY_DEV_URL}`);
    return 3e3;
  }
  const port = await getAvailablePort(3e3);
  backendPort = port;
  const serverScript = resolveServerScript();
  console.log(`[Tamify Desktop] Launching Express backend from ${serverScript} on port ${port}...`);
  const nodeExec = process.execPath;
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    TAMIFY_PORT: String(port),
    TAMIFY_HOST: "127.0.0.1",
    TAMIFY_ELECTRON: "true",
    ELECTRON_SERVE_DIST: "true",
    NODE_ENV: "production"
  };
  const userConfigPath = import_path.default.join(import_electron.app.getPath("userData"), "tamify-config.json");
  if (import_fs.default.existsSync(userConfigPath)) {
    try {
      const config = JSON.parse(import_fs.default.readFileSync(userConfigPath, "utf8"));
      if (config.GEMINI_API_KEY && !env.GEMINI_API_KEY) {
        env.GEMINI_API_KEY = config.GEMINI_API_KEY;
      }
    } catch (e) {
      console.warn("[Tamify Desktop] Could not parse user config:", e);
    }
  }
  backendProcess = (0, import_child_process.fork)(serverScript, [], {
    env,
    stdio: ["pipe", "pipe", "pipe", "ipc"]
  });
  backendProcess.stdout?.on("data", (data) => {
    console.log(`[Tamify Server] ${data.toString().trim()}`);
  });
  backendProcess.stderr?.on("data", (data) => {
    console.error(`[Tamify Server Error] ${data.toString().trim()}`);
  });
  backendProcess.on("exit", (code, signal) => {
    console.log(`[Tamify Server] Process exited with code ${code}, signal ${signal}`);
    backendProcess = null;
  });
  const ready = await waitForBackend(port, 3e4);
  if (!ready) {
    console.error(`[Tamify Desktop] Backend server failed to become ready on port ${port}`);
  } else {
    console.log(`[Tamify Desktop] Backend server verified responsive on http://127.0.0.1:${port}`);
  }
  return port;
}
function stopBackend() {
  if (backendProcess) {
    console.log("[Tamify Desktop] Stopping backend server...");
    try {
      backendProcess.send("shutdown");
    } catch {
    }
    try {
      backendProcess.kill("SIGTERM");
    } catch {
    }
    setTimeout(() => {
      if (backendProcess) {
        try {
          backendProcess.kill("SIGKILL");
        } catch {
        }
        backendProcess = null;
      }
    }, 1500);
  }
}
function createMainWindow(port) {
  const iconPath = resolveAppIcon();
  mainWindow = new import_electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    title: "Tamify",
    icon: iconPath,
    backgroundColor: "#0A0B0E",
    autoHideMenuBar: true,
    webPreferences: {
      preload: import_path.default.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      import_electron.shell.openExternal(url);
    }
    return { action: "deny" };
  });
  const targetUrl = process.env.TAMIFY_DEV_URL || `http://127.0.0.1:${port}`;
  console.log(`[Tamify Desktop] Loading URL: ${targetUrl}`);
  mainWindow.loadURL(targetUrl);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
import_electron.ipcMain.handle("tamify:open-external", (_event, url) => {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    import_electron.shell.openExternal(url);
  }
});
import_electron.ipcMain.handle("tamify:get-app-info", () => {
  return {
    version: import_electron.app.getVersion(),
    platform: process.platform,
    isPackaged: import_electron.app.isPackaged,
    backendPort
  };
});
import_electron.app.whenReady().then(async () => {
  try {
    const port = await startBackend();
    createMainWindow(port);
    import_electron.app.on("activate", () => {
      if (import_electron.BrowserWindow.getAllWindows().length === 0) {
        createMainWindow(port);
      }
    });
  } catch (err) {
    console.error("[Tamify Desktop] Failed to initialize desktop shell:", err);
    import_electron.app.quit();
  }
});
import_electron.app.on("before-quit", () => {
  stopBackend();
});
import_electron.app.on("window-all-closed", () => {
  stopBackend();
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
process.on("exit", () => {
  stopBackend();
});
process.on("SIGINT", () => {
  stopBackend();
  process.exit(0);
});
process.on("SIGTERM", () => {
  stopBackend();
  process.exit(0);
});
