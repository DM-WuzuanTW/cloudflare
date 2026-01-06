const { app, BrowserWindow, ipcMain, safeStorage, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const cloudflare = require('./cloudflare-api');

// Configure Logging
log.transports.file.level = 'info';
// Force log path to be consistent
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs', 'main.log');
autoUpdater.logger = log;
log.info('App starting...');
log.info('Version:', app.getVersion());

// Auto Updater Config - TRULY SILENT
// autoDownload: true -> will download automatically without asking
// autoInstallOnAppQuit: true -> will install seamlessly when user closes the app
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Setup Auto Updater Events
function setupAutoUpdater() {
    // Explicitly set feed to ensure it finds the repo
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'DM-WuzuanTW',
        repo: 'cloudflare'
    });

    // Disable differential download to prevent some issues with unsigned apps
    autoUpdater.downloadedFile = false;

    // Use checkForUpdates() instead of checkForUpdatesAndNotify() to suppress system notifications
    autoUpdater.checkForUpdates();

    autoUpdater.on('checking-for-update', () => {
        log.info('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
        log.info('Update available:', info.version);
    });

    autoUpdater.on('update-not-available', () => {
        log.info('Update not available.');
    });

    autoUpdater.on('update-downloaded', (info) => {
        log.info('Update downloaded. It will be installed on quit.');
    });

    autoUpdater.on('error', (err) => {
        log.error('Update error:', err);
    });

    // Check every 30 minutes
    setInterval(() => {
        autoUpdater.checkForUpdates();
    }, 30 * 60 * 1000);
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
        autoHideMenuBar: true, // Hide menu bar
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        backgroundColor: '#111111',
        show: false
    });

    mainWindow.setMenu(null); // Completely remove default menu

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

    // System Handlers - Version & Manual Update
    ipcMain.handle('app:get-version', () => app.getVersion());
    ipcMain.handle('app:get-log-path', () => path.join(app.getPath('userData'), 'logs', 'main.log'));
    ipcMain.handle('app:open-log-folder', () => {
        const logDir = path.join(app.getPath('userData'), 'logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        shell.openPath(logDir);
        return true;
    });

    ipcMain.handle('app:check-update', async () => {
        try {
            const result = await autoUpdater.checkForUpdates();
            if (!result) return { success: false, error: 'No update info' };

            return {
                success: true,
                updateAvailable: result.updateInfo.version !== app.getVersion(),
                version: result.updateInfo.version
            };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
