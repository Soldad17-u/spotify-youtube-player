const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage, Notification } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let miniMode = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        frame: true,
        backgroundColor: '#0f0f0f',
        icon: path.join(__dirname, 'assets/icon.png')
    });

    mainWindow.loadFile('index.html');

    // Dev tools (comment out for production)
    // mainWindow.webContents.openDevTools();

    // Setup hotkeys
    setupHotkeys();

    // Setup tray
    setupTray();

    // Handle window close
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function setupHotkeys() {
    // Media keys
    globalShortcut.register('MediaPlayPause', () => {
        mainWindow.webContents.send('hotkey', 'play-pause');
    });

    globalShortcut.register('MediaNextTrack', () => {
        mainWindow.webContents.send('hotkey', 'next');
    });

    globalShortcut.register('MediaPreviousTrack', () => {
        mainWindow.webContents.send('hotkey', 'previous');
    });

    globalShortcut.register('MediaStop', () => {
        mainWindow.webContents.send('hotkey', 'stop');
    });

    // Custom shortcuts
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
        mainWindow.webContents.send('hotkey', 'play-pause');
    });

    globalShortcut.register('CommandOrControl+Shift+Right', () => {
        mainWindow.webContents.send('hotkey', 'next');
    });

    globalShortcut.register('CommandOrControl+Shift+Left', () => {
        mainWindow.webContents.send('hotkey', 'previous');
    });

    globalShortcut.register('CommandOrControl+Shift+L', () => {
        mainWindow.webContents.send('hotkey', 'toggle-lyrics');
    });

    globalShortcut.register('CommandOrControl+Shift+M', () => {
        toggleMiniMode();
    });

    globalShortcut.register('CommandOrControl+Up', () => {
        mainWindow.webContents.send('hotkey', 'volume-up');
    });

    globalShortcut.register('CommandOrControl+Down', () => {
        mainWindow.webContents.send('hotkey', 'volume-down');
    });

    console.log('🎹 Hotkeys registered');
}

function setupTray() {
    const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/icon.png'));
    tray = new Tray(icon.resize({ width: 16, height: 16 }));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show', click: () => mainWindow.show() },
        { label: 'Mini Mode', click: () => toggleMiniMode() },
        { type: 'separator' },
        { label: 'Play/Pause', click: () => mainWindow.webContents.send('hotkey', 'play-pause') },
        { label: 'Next', click: () => mainWindow.webContents.send('hotkey', 'next') },
        { type: 'separator' },
        { label: 'Quit', click: () => {
            app.isQuitting = true;
            app.quit();
        }}
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('Spotify YouTube Player');

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

function toggleMiniMode() {
    if (!miniMode) {
        // Enter mini mode
        mainWindow.setSize(400, 150);
        mainWindow.setAlwaysOnTop(true);
        miniMode = true;
        mainWindow.webContents.send('mini-mode', true);
    } else {
        // Exit mini mode
        mainWindow.setSize(1200, 800);
        mainWindow.setAlwaysOnTop(false);
        miniMode = false;
        mainWindow.webContents.send('mini-mode', false);
    }
}

// IPC handlers
ipcMain.on('show-notification', (event, data) => {
    if (Notification.isSupported()) {
        const notification = new Notification({
            title: data.title || 'Now Playing',
            body: data.body,
            icon: data.icon || path.join(__dirname, 'assets/icon.png'),
            silent: false
        });
        notification.show();
    }
});

ipcMain.on('update-tray-tooltip', (event, text) => {
    if (tray) {
        tray.setToolTip(text);
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

console.log('🎵 Spotify YouTube Player started');
console.log('📍 Hot keys:');
console.log('   Ctrl+Shift+Space: Play/Pause');
console.log('   Ctrl+Shift+→: Next');
console.log('   Ctrl+Shift+←: Previous');
console.log('   Ctrl+Shift+L: Toggle Lyrics');
console.log('   Ctrl+Shift+M: Mini Mode');
console.log('   Ctrl+↑/↓: Volume');