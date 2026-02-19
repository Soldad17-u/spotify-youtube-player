// Window controls for Electron custom title bar
const { ipcRenderer } = require('electron');

// Window control buttons
const minimizeBtn = document.getElementById('minimizeBtn');
const maximizeBtn = document.getElementById('maximizeBtn');
const closeBtn = document.getElementById('closeBtn');

if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
        ipcRenderer.send('window-minimize');
    });
}

if (maximizeBtn) {
    maximizeBtn.addEventListener('click', () => {
        ipcRenderer.send('window-maximize');
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        ipcRenderer.send('window-close');
    });
}

// Listen for media keys from Electron
ipcRenderer.on('media-key', (event, action) => {
    console.log('Media key received:', action);
    
    switch(action) {
        case 'play-pause':
            document.getElementById('playPauseBtn')?.click();
            break;
        case 'next':
            document.getElementById('nextBtn')?.click();
            break;
        case 'previous':
            // Previous not fully implemented yet
            console.log('Previous track not implemented');
            break;
    }
});

// Listen for volume changes
ipcRenderer.on('volume-change', (event, direction) => {
    const volumeSlider = document.getElementById('volumeSlider');
    if (!volumeSlider) return;
    
    let currentVolume = parseInt(volumeSlider.value);
    
    if (direction === 'up') {
        currentVolume = Math.min(100, currentVolume + 5);
    } else if (direction === 'down') {
        currentVolume = Math.max(0, currentVolume - 5);
    }
    
    volumeSlider.value = currentVolume;
    volumeSlider.dispatchEvent(new Event('input'));
});

// Listen for mini mode changes
ipcRenderer.on('mini-mode-changed', (event, isMini) => {
    console.log('Mini mode changed:', isMini);
    document.body.classList.toggle('mini-mode', isMini);
});

// Helper to show notifications
window.showDesktopNotification = function(title, body, icon) {
    if (ipcRenderer) {
        ipcRenderer.send('show-notification', { title, body, icon });
    }
};

console.log('✅ Window controls and hotkeys initialized');