// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("tamifyDesktop", {
  isDesktop: true,
  platform: process.platform,
  version: "1.0.0",
  // Helper to open external links safely in system default browser if needed
  openExternal: (url) => {
    if (typeof url === "string" && (url.startsWith("https://") || url.startsWith("http://"))) {
      import_electron.ipcRenderer.invoke("tamify:open-external", url);
    }
  },
  // Get desktop application info
  getAppInfo: () => import_electron.ipcRenderer.invoke("tamify:get-app-info")
});
