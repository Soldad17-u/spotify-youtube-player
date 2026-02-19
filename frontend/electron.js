const { app, BrowserWindow, globalShortcut, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow;
let isMiniMode = false;
let normalBounds = { width: 1200, height: 800 };

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'hidden',
    frame: false,
    show: false // Don't show until ready
  });

  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Register global shortcuts
  registerGlobalShortcuts();

  // Window controls IPC handlers
  setupWindowControls();

  // Abre DevTools em modo desenvolvimento
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Save bounds before close
  mainWindow.on('close', () => {
    if (!isMiniMode) {
      normalBounds = mainWindow.getBounds();
    }
  });
}

function registerGlobalShortcuts() {
  // Media keys
  globalShortcut.register('MediaPlayPause', () => {
    console.log('MediaPlayPause pressed');
    if (mainWindow) {
      mainWindow.webContents.send('media-key', 'play-pause');
    }
  });

  globalShortcut.register('MediaNextTrack', () => {
    console.log('MediaNextTrack pressed');
    if (mainWindow) {
      mainWindow.webContents.send('media-key', 'next');
    }
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    console.log('MediaPreviousTrack pressed');
    if (mainWindow) {
      mainWindow.webContents.send('media-key', 'previous');
    }
  });

  // Custom shortcuts
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    console.log('Custom play/pause pressed');
    if (mainWindow) {
      mainWindow.webContents.send('media-key', 'play-pause');
    }
  });

  globalShortcut.register('CommandOrControl+Right', () => {
    console.log('Next track (arrow) pressed');
    if (mainWindow) {
      mainWindow.webContents.send('media-key', 'next');
    }
  });

  globalShortcut.register('CommandOrControl+Left', () => {
    console.log('Previous track (arrow) pressed');
    if (mainWindow) {
      mainWindow.webContents.send('media-key', 'previous');
    }
  });

  // Mini mode toggle
  globalShortcut.register('CommandOrControl+M', () => {
    console.log('Toggle mini mode');
    toggleMiniMode();
  });

  // Volume controls
  globalShortcut.register('CommandOrControl+Up', () => {
    if (mainWindow) {
      mainWindow.webContents.send('volume-change', 'up');
    }
  });

  globalShortcut.register('CommandOrControl+Down', () => {
    if (mainWindow) {
      mainWindow.webContents.send('volume-change', 'down');
    }
  });

  console.log('✅ Global shortcuts registered');
}

function setupWindowControls() {
  // Minimize
  ipcMain.on('window-minimize', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  // Maximize/Restore
  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  // Close
  ipcMain.on('window-close', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  // Mini mode toggle
  ipcMain.on('toggle-mini-mode', () => {
    toggleMiniMode();
  });

  // Show notification
  ipcMain.on('show-notification', (event, { title, body, icon }) => {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title,
        body,
        icon: icon || path.join(__dirname, 'assets', 'icon.png'),
        silent: false
      });

      notification.show();

      notification.on('click', () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      });
    }
  });
}

function toggleMiniMode() {
  if (!mainWindow) return;

  if (isMiniMode) {
    // Exit mini mode - restore normal size
    mainWindow.setSize(normalBounds.width, normalBounds.height);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.center();
    isMiniMode = false;
    console.log('Mini mode OFF');
  } else {
    // Enter mini mode - compact player
    normalBounds = mainWindow.getBounds();
    mainWindow.setSize(400, 180);
    mainWindow.setAlwaysOnTop(true);
    isMiniMode = true;
    console.log('Mini mode ON');
  }

  // Notify renderer about mode change
  mainWindow.webContents.send('mini-mode-changed', isMiniMode);
}

app.whenReady().then(() => {
  createWindow();

  // Request notification permission
  if (Notification.isSupported()) {
    console.log('✅ Notifications supported');
  }
});

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
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
  console.log('✅ Global shortcuts unregistered');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

console.log('🎵 Spotify YouTube Player Electron starting...');
console.log('📌 Hotkeys registered:');
console.log('   - MediaPlayPause (or Ctrl/Cmd+Shift+Space)');
console.log('   - MediaNextTrack (or Ctrl/Cmd+Right)');
console.log('   - MediaPreviousTrack (or Ctrl/Cmd+Left)');
console.log('   - Ctrl/Cmd+M (toggle mini mode)');
console.log('   - Ctrl/Cmd+Up/Down (volume)');