import { contextBridge, ipcRenderer } from 'electron';

// Expose safe, isolated desktop APIs to the renderer
contextBridge.exposeInMainWorld('tamifyDesktop', {
  isDesktop: true,
  platform: process.platform,
  version: '1.0.0',
  // Helper to open external links safely in system default browser if needed
  openExternal: (url: string) => {
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      ipcRenderer.invoke('tamify:open-external', url);
    }
  },
  // Get desktop application info
  getAppInfo: () => ipcRenderer.invoke('tamify:get-app-info')
});
