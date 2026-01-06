const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    login: (email, key) => ipcRenderer.invoke('auth:login', { email, key }),
    checkAuth: () => ipcRenderer.invoke('auth:check'),
    logout: () => ipcRenderer.invoke('auth:logout'),
    invoke: (method, ...args) => ipcRenderer.invoke('cf:invoke', method, ...args),

    // System
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    checkUpdate: () => ipcRenderer.invoke('app:check-update')
});
