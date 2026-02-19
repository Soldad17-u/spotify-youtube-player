const axios = require('axios');

const API_URL = 'http://localhost:8000';

let currentView = 'search';
let isPlaying = false;
let currentTrack = null;
let shuffleEnabled = false;
let repeatMode = 'off'; // 'off', 'one', 'all'
let progressUpdateInterval = null;
let isDraggingProgress = false;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const playPauseBtn = document.getElementById('playPauseBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const muteBtn = document.getElementById('muteBtn');
const playerAlbumArt = document.getElementById('playerAlbumArt');
const playerTrackName = document.getElementById('playerTrackName');
const playerArtistName = document.getElementById('playerArtistName');
const playlistsList = document.getElementById('playlistsList');
const playlistsContent = document.getElementById('playlistsContent');
const queueContent = document.getElementById('queueContent');
const clearQueueBtn = document.getElementById('clearQueueBtn');
const lyricsContent = document.getElementById('lyricsContent');
const refreshLyricsBtn = document.getElementById('refreshLyricsBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressHandle = document.getElementById('progressHandle');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');

// ========== NAVIGATION ==========

document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        const view = item.dataset.view;
        switchView(view);
    });
});

function switchView(view) {
    // Update sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === view);
    });
    
    // Update main content
    document.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === `${view}View`);
    });
    
    currentView = view;
    
    // Load data for view
    if (view === 'playlists' && playlistsContent.innerHTML.includes('Carregando')) {
        loadPlaylists();
    } else if (view === 'queue') {
        loadQueue();
    } else if (view === 'lyrics' && currentTrack) {
        loadLyrics(currentTrack.id);
    }
}

// ========== SEARCH ==========

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    searchResults.innerHTML = '<div class="loading">Buscando...</div>';
    
    try {
        const response = await axios.get(`${API_URL}/search`, {
            params: { q: query, limit: 30 }
        });
        
        displaySearchResults(response.data.tracks);
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<div class="empty-state">❌ Erro ao buscar. Verifique se o backend está rodando.</div>';
        showToast('Erro ao buscar músicas', 'error');
    }
}

function displaySearchResults(tracks) {
    if (!tracks || tracks.length === 0) {
        searchResults.innerHTML = '<div class="empty-state">Nenhum resultado encontrado</div>';
        return;
    }
    
    searchResults.innerHTML = tracks.map(track => `
        <div class="track-card" data-track-id="${track.id}">
            <img src="${track.album.images[0]?.url || ''}" alt="${track.name}" class="track-cover" />
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

// ========== PLAYBACK CONTROL ==========

window.playTrack = async function(trackId) {
    try {
        const response = await axios.post(`${API_URL}/play/${trackId}`);
        
        if (response.data.status === 'playing') {
            currentTrack = response.data.track;
            updatePlayerUI();
            isPlaying = true;
            updatePlayPauseIcon();
            startProgressUpdates();
            showToast(`Tocando: ${currentTrack.name}`, 'success');
            
            // Auto-load lyrics if in lyrics view
            if (currentView === 'lyrics') {
                loadLyrics(trackId);
            }
        }
    } catch (error) {
        console.error('Play error:', error);
        showToast('Erro ao reproduzir. Primeira vez pode demorar.', 'error');
    }
};

playPauseBtn.addEventListener('click', async () => {
    try {
        if (isPlaying) {
            await axios.post(`${API_URL}/pause`);
            isPlaying = false;
            stopProgressUpdates();
        } else {
            await axios.post(`${API_URL}/resume`);
            isPlaying = true;
            startProgressUpdates();
        }
        updatePlayPauseIcon();
    } catch (error) {
        console.error('Play/Pause error:', error);
        showToast('Erro ao pausar/retomar', 'error');
    }
});

nextBtn.addEventListener('click', async () => {
    try {
        const response = await axios.post(`${API_URL}/next`);
        if (response.data.track) {
            currentTrack = response.data.track;
            updatePlayerUI();
            isPlaying = true;
            updatePlayPauseIcon();
            showToast(`Próxima: ${currentTrack.name}`, 'info');
            
            if (currentView === 'lyrics') {
                loadLyrics(currentTrack.id);
            }
        } else {
            showToast('Fila vazia', 'info');
        }
    } catch (error) {
        console.error('Next error:', error);
        showToast('Erro ao pular música', 'error');
    }
});

function updatePlayPauseIcon() {
    playPauseBtn.innerHTML = isPlaying ?
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>' :
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}

function updatePlayerUI() {
    if (!currentTrack) return;
    
    playerTrackName.textContent = currentTrack.name || 'Desconhecido';
    playerArtistName.textContent = currentTrack.artist || '-';
    playerAlbumArt.src = currentTrack.album_art || '';
    playerAlbumArt.style.display = currentTrack.album_art ? 'block' : 'none';
    
    document.title = `${currentTrack.name} - Spotify YouTube Player`;
}

// ========== PROGRESS BAR ==========

function startProgressUpdates() {
    if (progressUpdateInterval) return;
    
    progressUpdateInterval = setInterval(updateProgress, 1000);
    updateProgress(); // Immediate update
}

function stopProgressUpdates() {
    if (progressUpdateInterval) {
        clearInterval(progressUpdateInterval);
        progressUpdateInterval = null;
    }
}

async function updateProgress() {
    if (isDraggingProgress) return;
    
    try {
        const response = await axios.get(`${API_URL}/position`);
        const { current, duration, percentage } = response.data;
        
        if (duration > 0) {
            progressFill.style.width = `${percentage}%`;
            progressHandle.style.left = `${percentage}%`;
            currentTime.textContent = formatTime(current);
            totalTime.textContent = formatTime(duration);
        }
    } catch (error) {
        // Silently fail
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Seek on click
progressBar.addEventListener('click', async (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    
    try {
        // Get total duration
        const response = await axios.get(`${API_URL}/position`);
        const { duration } = response.data;
        
        if (duration > 0) {
            const newPosition = Math.floor((duration * percentage) / 100);
            await axios.post(`${API_URL}/seek/${newPosition}`);
            updateProgress();
        }
    } catch (error) {
        console.error('Seek error:', error);
    }
});

// Drag progress handle
let startX = 0;
let startPercentage = 0;

progressHandle.addEventListener('mousedown', (e) => {
    isDraggingProgress = true;
    startX = e.clientX;
    const currentWidth = parseFloat(progressFill.style.width) || 0;
    startPercentage = currentWidth;
    
    document.addEventListener('mousemove', onProgressDrag);
    document.addEventListener('mouseup', onProgressDragEnd);
    
    e.preventDefault();
});

function onProgressDrag(e) {
    if (!isDraggingProgress) return;
    
    const bar = progressBar;
    const rect = bar.getBoundingClientRect();
    const deltaX = e.clientX - startX;
    const deltaPercentage = (deltaX / rect.width) * 100;
    let newPercentage = startPercentage + deltaPercentage;
    
    newPercentage = Math.max(0, Math.min(100, newPercentage));
    
    progressFill.style.width = `${newPercentage}%`;
    progressHandle.style.left = `${newPercentage}%`;
}

async function onProgressDragEnd(e) {
    if (!isDraggingProgress) return;
    
    document.removeEventListener('mousemove', onProgressDrag);
    document.removeEventListener('mouseup', onProgressDragEnd);
    
    const finalPercentage = parseFloat(progressFill.style.width) || 0;
    
    try {
        const response = await axios.get(`${API_URL}/position`);
        const { duration } = response.data;
        
        if (duration > 0) {
            const newPosition = Math.floor((duration * finalPercentage) / 100);
            await axios.post(`${API_URL}/seek/${newPosition}`);
        }
    } catch (error) {
        console.error('Seek error:', error);
    }
    
    isDraggingProgress = false;
}

// ========== SHUFFLE & REPEAT ==========

shuffleBtn.addEventListener('click', async () => {
    try {
        const response = await axios.post(`${API_URL}/shuffle/toggle`);
        shuffleEnabled = response.data.shuffle;
        
        shuffleBtn.classList.toggle('active', shuffleEnabled);
        shuffleBtn.title = `Shuffle (${shuffleEnabled ? 'ligado' : 'desligado'})`;
        
        showToast(`Shuffle ${shuffleEnabled ? 'ativado' : 'desativado'}`, 'info');
    } catch (error) {
        console.error('Shuffle error:', error);
        showToast('Erro ao alternar shuffle', 'error');
    }
});

repeatBtn.addEventListener('click', async () => {
    try {
        const response = await axios.post(`${API_URL}/repeat/cycle`);
        repeatMode = response.data.repeat;
        
        repeatBtn.classList.remove('repeat-off', 'repeat-one', 'repeat-all');
        repeatBtn.classList.add(`repeat-${repeatMode}`);
        repeatBtn.classList.toggle('active', repeatMode !== 'off');
        
        const modeText = {
            'off': 'desligado',
            'one': 'repetir uma',
            'all': 'repetir todas'
        }[repeatMode];
        
        repeatBtn.title = `Repetir (${modeText})`;
        showToast(`Modo: ${modeText}`, 'info');
    } catch (error) {
        console.error('Repeat error:', error);
        showToast('Erro ao alternar repeat', 'error');
    }
});

// ========== VOLUME ==========

volumeSlider.addEventListener('input', async (e) => {
    const volume = e.target.value;
    volumeValue.textContent = `${volume}%`;
    
    try {
        await axios.post(`${API_URL}/volume/${volume}`);
    } catch (error) {
        console.error('Volume error:', error);
    }
});

muteBtn.addEventListener('click', () => {
    const currentVolume = parseInt(volumeSlider.value);
    
    if (currentVolume > 0) {
        volumeSlider.dataset.previousVolume = currentVolume;
        volumeSlider.value = 0;
        volumeValue.textContent = '0%';
        axios.post(`${API_URL}/volume/0`);
    } else {
        const previousVolume = volumeSlider.dataset.previousVolume || 70;
        volumeSlider.value = previousVolume;
        volumeValue.textContent = `${previousVolume}%`;
        axios.post(`${API_URL}/volume/${previousVolume}`);
    }
});

// ========== QUEUE ==========

window.addToQueue = async function(trackId) {
    try {
        const response = await axios.post(`${API_URL}/queue/add/${trackId}`);
        showToast(`Adicionado à fila (${response.data.queue_length} músicas)`, 'success');
    } catch (error) {
        console.error('Add to queue error:', error);
        showToast('Erro ao adicionar à fila', 'error');
    }
};

async function loadQueue() {
    try {
        const response = await axios.get(`${API_URL}/queue`);
        const queue = response.data.queue;
        
        if (!queue || queue.length === 0) {
            queueContent.innerHTML = '<div class="empty-state">Nenhuma música na fila</div>';
            return;
        }
        
        queueContent.innerHTML = queue.map((track, index) => `
            <div class="queue-item">
                <span class="queue-index">${index + 1}</span>
                <img src="${track.album_art || ''}" alt="${track.name}" class="queue-cover" />
                <div class="queue-item-info">
                    <div class="queue-item-name">${track.name}</div>
                    <div class="queue-item-artist">${track.artist}</div>
                </div>
                <span class="queue-duration">${formatTime(track.duration || 0)}</span>
                <button class="btn-icon" onclick="playTrack('${track.id}')" title="Reproduzir">▶️</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Queue error:', error);
        queueContent.innerHTML = '<div class="empty-state">❌ Erro ao carregar fila</div>';
    }
}

clearQueueBtn.addEventListener('click', async () => {
    try {
        await axios.post(`${API_URL}/queue/clear`);
        queueContent.innerHTML = '<div class="empty-state">Nenhuma música na fila</div>';
        showToast('Fila limpa', 'info');
    } catch (error) {
        console.error('Clear queue error:', error);
        showToast('Erro ao limpar fila', 'error');
    }
});

// ========== LYRICS ==========

async function loadLyrics(trackId) {
    if (!trackId) {
        lyricsContent.innerHTML = '<div class="empty-state"><p>Reproduza uma música para ver as letras</p></div>';
        return;
    }
    
    lyricsContent.innerHTML = '<div class="loading">Buscando letras...</div>';
    
    try {
        const response = await axios.get(`${API_URL}/lyrics/${trackId}`);
        
        if (response.data.found) {
            const lyrics = response.data.lyrics;
            lyricsContent.innerHTML = `
                <div class="lyrics-header-info">
                    <h3>${response.data.title}</h3>
                    <p>${response.data.artist}</p>
                </div>
                <div class="lyrics-text">${lyrics.replace(/\n/g, '<br>')}</div>
            `;
        } else {
            lyricsContent.innerHTML = `
                <div class="empty-state">
                    <p>😔 Letras não encontradas</p>
                    <p class="lyrics-track-info">${response.data.title} - ${response.data.artist}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Lyrics error:', error);
        lyricsContent.innerHTML = '<div class="empty-state">❌ Erro ao buscar letras</div>';
    }
}

refreshLyricsBtn.addEventListener('click', () => {
    if (currentTrack) {
        loadLyrics(currentTrack.id);
    } else {
        showToast('Nenhuma música tocando', 'info');
    }
});

// ========== PLAYLISTS ==========

async function loadPlaylists() {
    try {
        const response = await axios.get(`${API_URL}/playlists`);
        const playlists = response.data.playlists;
        
        // Sidebar list
        const sidebarHTML = '<h3>Suas Playlists</h3>' + playlists.slice(0, 10).map(playlist => `
            <button class="playlist-item" onclick="loadPlaylistTracks('${playlist.id}')">
                ${playlist.name}
            </button>
        `).join('');
        playlistsList.innerHTML = sidebarHTML;
        
        // Main view grid
        const mainHTML = playlists.map(playlist => `
            <div class="playlist-card" onclick="loadPlaylistTracks('${playlist.id}')">
                <img src="${playlist.images[0]?.url || ''}" alt="${playlist.name}" />
                <div class="playlist-name">${playlist.name}</div>
                <div class="playlist-description">${playlist.description || `${playlist.tracks.total} músicas`}</div>
            </div>
        `).join('');
        playlistsContent.innerHTML = mainHTML;
    } catch (error) {
        console.error('Playlists error:', error);
        playlistsContent.innerHTML = '<div class="empty-state">❌ Erro ao carregar playlists</div>';
        showToast('Erro ao carregar playlists', 'error');
    }
}

window.loadPlaylistTracks = async function(playlistId) {
    switchView('search');
    searchResults.innerHTML = '<div class="loading">Carregando playlist...</div>';
    
    try {
        const response = await axios.get(`${API_URL}/playlist/${playlistId}`);
        displaySearchResults(response.data.tracks);
    } catch (error) {
        console.error('Playlist tracks error:', error);
        searchResults.innerHTML = '<div class="empty-state">❌ Erro ao carregar músicas</div>';
        showToast('Erro ao carregar playlist', 'error');
    }
};

// ========== TOAST NOTIFICATIONS ==========

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('toast-show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== STATUS POLLING ==========

setInterval(async () => {
    try {
        const response = await axios.get(`${API_URL}/status`);
        const status = response.data;
        
        isPlaying = status.is_playing;
        shuffleEnabled = status.shuffle;
        repeatMode = status.repeat;
        
        // Update UI
        shuffleBtn.classList.toggle('active', shuffleEnabled);
        repeatBtn.classList.remove('repeat-off', 'repeat-one', 'repeat-all');
        repeatBtn.classList.add(`repeat-${repeatMode}`);
        repeatBtn.classList.toggle('active', repeatMode !== 'off');
        
        if (status.current_track && !currentTrack) {
            currentTrack = status.current_track;
            updatePlayerUI();
        }
    } catch (error) {
        // Silently fail - backend might be down
    }
}, 5000);

// ========== INITIALIZATION ==========

setTimeout(loadPlaylists, 1000);

console.log('🎵 Spotify YouTube Player v2.0 loaded');
console.log('🔗 Backend:', API_URL);
console.log('✨ Features: Auto-play, Shuffle, Repeat, Seek, Lyrics');