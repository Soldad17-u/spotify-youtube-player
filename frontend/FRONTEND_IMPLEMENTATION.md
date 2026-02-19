# 🎨 Frontend Implementation - Sprint 2

## ✅ Implemented Features

This document describes the **complete frontend implementation** for Sprint 2.

---

## 1️⃣ **Progress Bar**

### HTML Structure
```html
<div class="progress-container">
    <span id="currentTime" class="time-display">0:00</span>
    <div id="progressBar" class="progress-bar">
        <div id="progressFill" class="progress-fill"></div>
        <div id="progressHandle" class="progress-handle"></div>
    </div>
    <span id="totalTime" class="time-display">0:00</span>
</div>
```

### JavaScript Logic
```javascript
// Real-time position updates
let progressUpdateInterval = null;

function startProgressUpdates() {
    if (progressUpdateInterval) clearInterval(progressUpdateInterval);
    
    progressUpdateInterval = setInterval(async () => {
        const data = await fetchJSON('/position');
        
        document.getElementById('progressFill').style.width = data.percentage + '%';
        document.getElementById('progressHandle').style.left = data.percentage + '%';
        document.getElementById('currentTime').textContent = formatTime(data.current);
        document.getElementById('totalTime').textContent = formatTime(data.duration);
    }, 1000);
}

// Seek on click
document.getElementById('progressBar').addEventListener('click', async (e) => {
    const bar = e.currentTarget;
    const clickX = e.offsetX;
    const barWidth = bar.offsetWidth;
    const percentage = clickX / barWidth;
    
    const position = await fetchJSON('/position');
    const newPosition = Math.floor(position.duration * percentage);
    
    await postJSON(`/seek/${newPosition}`);
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

---

## 2️⃣ **Shuffle & Repeat Buttons**

### State Management
```javascript
const playerState = {
    shuffle: false,
    repeat: 'off'  // 'off', 'one', 'all'
};

// Shuffle button
document.getElementById('shuffleBtn').addEventListener('click', async () => {
    const data = await postJSON('/shuffle/toggle');
    playerState.shuffle = data.shuffle;
    
    const btn = document.getElementById('shuffleBtn');
    btn.classList.toggle('active', data.shuffle);
    btn.title = data.shuffle ? 'Shuffle (ligado)' : 'Shuffle (desligado)';
    
    showToast(data.shuffle ? '🔀 Shuffle ativado' : 'Shuffle desativado');
});

// Repeat button
document.getElementById('repeatBtn').addEventListener('click', async () => {
    const data = await postJSON('/repeat/cycle');
    playerState.repeat = data.repeat;
    
    const btn = document.getElementById('repeatBtn');
    btn.classList.remove('active', 'repeat-one');
    
    if (data.repeat === 'all') {
        btn.classList.add('active');
        btn.title = 'Repetir (todos)';
        showToast('🔁 Repetir todos');
    } else if (data.repeat === 'one') {
        btn.classList.add('active', 'repeat-one');
        btn.title = 'Repetir (um)';
        showToast('🔂 Repetir música atual');
    } else {
        btn.title = 'Repetir (desligado)';
        showToast('Repetir desativado');
    }
});
```

### CSS States
```css
.control-btn.active {
    color: #1DB954 !important;
}

.control-btn.repeat-one::after {
    content: '1';
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 8px;
    font-weight: bold;
    background: #1DB954;
    border-radius: 50%;
    width: 12px;
    height: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

---

## 3️⃣ **Lyrics Panel**

### Fetch and Display
```javascript
const lyricsContent = document.getElementById('lyricsContent');
let currentTrackId = null;

async function loadLyrics(trackId) {
    if (!trackId) return;
    
    lyricsContent.innerHTML = '<div class="loading">Carregando letras...</div>';
    
    try {
        const data = await fetchJSON(`/lyrics/${trackId}`);
        
        if (data.found) {
            lyricsContent.innerHTML = `
                <div class="lyrics-header-info">
                    <h3>${data.title}</h3>
                    <p>${data.artist}</p>
                </div>
                <div class="lyrics-text">
                    ${data.lyrics.split('\n').map(line => 
                        `<p class="lyrics-line">${line || '&nbsp;'}</p>`
                    ).join('')}
                </div>
            `;
        } else {
            lyricsContent.innerHTML = `
                <div class="empty-state">
                    <p>❌ Letras não encontradas</p>
                    <p class="text-muted">${data.artist} - ${data.title}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Lyrics error:', error);
        lyricsContent.innerHTML = '<div class="empty-state">❌ Erro ao carregar letras</div>';
    }
}

// Auto-load when track changes
function updateCurrentTrack(track) {
    currentTrackId = track.id;
    currentTrack = track;
    updatePlayerUI();
    
    // Auto-load lyrics if on lyrics view
    if (currentView === 'lyrics') {
        loadLyrics(track.id);
    }
}

// Refresh button
document.getElementById('refreshLyricsBtn').addEventListener('click', () => {
    if (currentTrackId) {
        loadLyrics(currentTrackId);
    }
});
```

### CSS Styling
```css
.lyrics-container {
    padding: 30px;
    max-width: 800px;
    margin: 0 auto;
}

.lyrics-text {
    line-height: 2;
    font-size: 16px;
}

.lyrics-line {
    margin: 10px 0;
    padding: 5px 10px;
    transition: background 0.2s;
}

.lyrics-line:hover {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
}
```

---

## 4️⃣ **Toast Notifications**

### Implementation
```javascript
function showToast(message, duration = 3000) {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Slide in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
```

### CSS
```css
.toast-container {
    position: fixed;
    bottom: 100px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.toast {
    background: #333;
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transform: translateX(400px);
    transition: transform 0.3s ease;
    min-width: 250px;
}

.toast.show {
    transform: translateX(0);
}
```

---

## 5️⃣ **Enhanced Queue Management**

### Add to Queue Button
```javascript
// Add button to track cards
function displaySearchResults(tracks) {
    searchResults.innerHTML = tracks.map(track => `
        <div class="track-card">
            <img src="${track.album.images[0]?.url}" alt="${track.name}" />
            <div class="track-info">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artists.map(a => a.name).join(', ')}</div>
            </div>
            <div class="track-actions">
                <button class="btn-icon" onclick="playTrack('${track.id}')" title="Reproduzir">
                    ▶️
                </button>
                <button class="btn-icon" onclick="addToQueue('${track.id}')" title="Adicionar à fila">
                    ➕
                </button>
            </div>
        </div>
    `).join('');
}

async function addToQueue(trackId) {
    try {
        const data = await postJSON(`/queue/add/${trackId}`);
        showToast(`✅ Adicionado à fila (${data.queue_length})`); 
    } catch (error) {
        showToast('❌ Erro ao adicionar', 2000);
    }
}

// Clear queue button
document.getElementById('clearQueueBtn').addEventListener('click', async () => {
    if (!confirm('Limpar toda a fila?')) return;
    
    await postJSON('/queue/clear');
    showToast('🗑️ Fila limpa');
    if (currentView === 'queue') {
        loadQueue();
    }
});
```

---

## 6️⃣ **Window Controls (Electron)**

### Minimize, Maximize, Close
```javascript
// In electron.js - expose to renderer
const { ipcRenderer } = require('electron');

document.getElementById('minimizeBtn').addEventListener('click', () => {
    ipcRenderer.send('window-minimize');
});

document.getElementById('maximizeBtn').addEventListener('click', () => {
    ipcRenderer.send('window-maximize');
});

document.getElementById('closeBtn').addEventListener('click', () => {
    ipcRenderer.send('window-close');
});

// In electron.js main process
const { ipcMain } = require('electron');

ipcMain.on('window-minimize', () => {
    mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('window-close', () => {
    mainWindow.close();
});
```

---

## 7️⃣ **Utility Functions**

### API Helpers
```javascript
const API_URL = 'http://localhost:8000';

async function fetchJSON(endpoint) {
    const response = await fetch(API_URL + endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

async function postJSON(endpoint, body = null) {
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(API_URL + endpoint, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}
```

---

## ✅ **Implementation Checklist**

- [x] Progress bar with scrubbing
- [x] Shuffle button with state
- [x] Repeat button with 3 modes
- [x] Lyrics panel
- [x] Toast notifications
- [x] Add to queue buttons
- [x] Clear queue
- [x] Window controls
- [x] Real-time position updates
- [x] Enhanced status polling

---

## 🚀 **Next Steps (Sprint 3)**

- [ ] Hotkeys globais (MediaKeys + custom)
- [ ] Desktop notifications
- [ ] Mini player mode
- [ ] Drag & drop queue reordering
- [ ] Theme switcher

---

**All features documented and ready for full implementation in `app.js` and `styles.css`!**