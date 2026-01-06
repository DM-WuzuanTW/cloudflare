const { app, BrowserWindow, ipcMain, safeStorage, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const cloudflare = require('./cloudflare-api');

// Auto Updater Config
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Setup Auto Updater Events
function setupAutoUpdater() {
    autoUpdater.on('update-available', () => {
        console.log('Update available. Downloading...');
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded. It will be installed on quit.');
        // Optional: Notify renderer to show a "Update Ready" badge
    });

    autoUpdater.on('error', (err) => {
        console.error('Update error:', err);
    });

    // Check immediately
    autoUpdater.checkForUpdatesAndNotify();

    // Check every hour
    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 60 * 60 * 1000);
}

// Store path
const userDataPath = app.getPath('userData');
const STORE_PATH = path.join(userDataPath, 'user-secrets.json');

// Helper to save secrets
function saveSecrets(email, apiKey) {
    if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption is not available on this OS.');
    }
    const encryptedKey = safeStorage.encryptString(apiKey);
    fs.writeFileSync(STORE_PATH, JSON.stringify({
        email,
        key: encryptedKey.toString('base64')
    }));
}

// Helper to load secrets
function loadSecrets() {
    if (!fs.existsSync(STORE_PATH)) return null;
    try {
        const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
        const buffer = Buffer.from(data.key, 'base64');
        const decryptedKey = safeStorage.decryptString(buffer);
        return { email: data.email, key: decryptedKey };
    } catch (error) {
        console.error("Failed to load secrets:", error);
        return null;
    }
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        // Premium Look: Transparent background for glass effect? 
        // Usually standard window is better for functionality, but let's try a dark theme default
        backgroundColor: '#1a1a1a',
        show: false
    });

    // Load Vite dev server or build
    // For dev: http://localhost:5173 
    // For prod: dist/index.html
    // We'll assume dev for now or check args
    const isDev = !app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    setupAutoUpdater();
    createWindow();

    // IPC Handlers
    ipcMain.handle('auth:login', async (event, { email, key }) => {
        // 1. Verify
        cloudflare.init(email, key);
        await cloudflare.verifyToken();
        // 2. Save
        saveSecrets(email, key);
        return { success: true };
    });

    ipcMain.handle('auth:check', async () => {
        const secrets = loadSecrets();
        if (!secrets) return { authenticated: false };

        // Init API
        cloudflare.init(secrets.email, secrets.key);
        try {
            await cloudflare.verifyToken();
            return { authenticated: true, email: secrets.email };
        } catch (e) {
            return { authenticated: false, error: 'Saved token invalid' };
        }
    });

    ipcMain.handle('auth:logout', async () => {
        if (fs.existsSync(STORE_PATH)) {
            fs.unlinkSync(STORE_PATH);
        }
        cloudflare.client = null;
        return { success: true };
    });

    ipcMain.handle('cf:invoke', async (event, method, ...args) => {
        if (!cloudflare.client) throw new Error('Not authenticated');
        if (typeof cloudflare[method] !== 'function') throw new Error(`Method ${method} not found`);

        return await cloudflare[method](...args);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
