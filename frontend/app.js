const axios = require('axios');

const API_URL = 'http://localhost:8000';

let currentView = 'search';
let isPlaying = false;
let currentTrack = null;
let isDraggingProgress = false;

// Cache for favorites (avoid repeated API calls)
let favoritesCache = new Set();

// DOM Elements - Player
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const playPauseBtn = document.getElementById('playPauseBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const playerAlbumArt = document.getElementById('playerAlbumArt');
const playerTrackName = document.getElementById('playerTrackName');
const playerArtistName = document.getElementById('playerArtistName');

// Progress bar
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressHandle = document.getElementById('progressHandle');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');

// Views
const playlistsList = document.getElementById('playlistsList');
const playlistsContent = document.getElementById('playlistsContent');
const queueContent = document.getElementById('queueContent');
const lyricsContent = document.getElementById('lyricsContent');
const historyContent = document.getElementById('historyContent');
const favoritesContent = document.getElementById('favoritesContent');
const equalizerContent = document.getElementById('equalizerContent');

// State
let shuffleMode = false;
let repeatMode = 'off';

// ========== NAVIGATION ==========

document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
        const view = item.dataset.view;
        switchView(view);
    });
});

function switchView(view) {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === view);
    });
    
    document.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === `${view}View`);
    });
    
    currentView = view;
    
    // Auto-load data
    if (view === 'playlists' && playlistsContent.innerHTML.includes('Carregando')) {
        loadPlaylists();
    } else if (view === 'queue') {
        loadQueue();
    } else if (view === 'lyrics' && currentTrack) {
        loadLyrics(currentTrack.id);
    } else if (view === 'history') {
        loadHistory();
    } else if (view === 'favorites') {
        loadFavorites();
    } else if (view === 'equalizer') {
        loadEqualizer();
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
    
    searchResults.innerHTML = '<div class="loading">🔍 Buscando...</div>';
    
    try {
        const response = await axios.get(`${API_URL}/search`, {
            params: { q: query, limit: 30 }
        });
        
        displaySearchResults(response.data.tracks);
    } catch (error) {
        console.error('Search error:', error);
        showToast('Erro ao buscar músicas', 'error');
        searchResults.innerHTML = '<div class="empty-state">❌ Erro ao buscar</div>';
    }
}

async function displaySearchResults(tracks) {
    if (!tracks || tracks.length === 0) {
        searchResults.innerHTML = '<div class="empty-state">Nenhum resultado encontrado</div>';
        return;
    }
    
    searchResults.innerHTML = '';
    
    for (const track of tracks) {
        const isFav = await isTrackFavorited(track.id);
        
        const card = document.createElement('div');
        card.className = 'track-card';
        card.innerHTML = `
            <img class="track-cover" src="${track.album.images[0]?.url || ''}" alt="${track.name}" />
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
                <button class="btn-icon favorite-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${track.id}', this)" title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                    ${isFav ? '❤️' : '🤍'}
                </button>
            </div>
        `;
        searchResults.appendChild(card);
    }
}

// ========== PLAYBACK CONTROLS ==========

async function playTrack(trackId) {
    try {
        showToast('Carregando música...', 'info');
        const response = await axios.post(`${API_URL}/play/${trackId}`);
        
        if (response.data.status === 'playing') {
            currentTrack = response.data.track;
            updatePlayerUI();
            isPlaying = true;
            updatePlayPauseButton();
            showToast(`▶️ ${currentTrack.name}`, 'success');
            
            // Show desktop notification
            if (window.showDesktopNotification) {
                window.showDesktopNotification(
                    'Tocando agora',
                    `${currentTrack.name} - ${currentTrack.artist}`
                );
            }
        }
    } catch (error) {
        console.error('Play error:', error);
        showToast('Erro ao reproduzir (primeira vez pode demorar)', 'error');
    }
}

playPauseBtn.addEventListener('click', async () => {
    try {
        if (isPlaying) {
            await axios.post(`${API_URL}/pause`);
            isPlaying = false;
        } else {
            await axios.post(`${API_URL}/resume`);
            isPlaying = true;
        }
        updatePlayPauseButton();
    } catch (error) {
        console.error('Play/Pause error:', error);
    }
});

nextBtn.addEventListener('click', async () => {
    try {
        const response = await axios.post(`${API_URL}/next`);
        if (response.data.track) {
            currentTrack = response.data.track;
            updatePlayerUI();
            showToast(`⏭️ ${currentTrack.name}`, 'info');
        } else {
            showToast('Fila vazia', 'warning');
        }
    } catch (error) {
        console.error('Next error:', error);
    }
});

function updatePlayPauseButton() {
    playPauseBtn.innerHTML = isPlaying ? 
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>' :
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}

function updatePlayerUI() {
    if (!currentTrack) return;
    
    playerTrackName.textContent = currentTrack.name || 'Desconhecido';
    playerArtistName.textContent = currentTrack.artist || '-';
    
    if (currentTrack.album_art) {
        playerAlbumArt.src = currentTrack.album_art;
    }
}

// ========== SHUFFLE & REPEAT ==========

shuffleBtn.addEventListener('click', async () => {
    try {
        const response = await axios.post(`${API_URL}/shuffle/toggle`);
        shuffleMode = response.data.shuffle;
        shuffleBtn.classList.toggle('active', shuffleMode);
        shuffleBtn.title = `Shuffle (${shuffleMode ? 'ligado' : 'desligado'})`;
        showToast(`Shuffle ${shuffleMode ? 'ON' : 'OFF'}`, 'info');
    } catch (error) {
        console.error('Shuffle error:', error);
    }
});

repeatBtn.addEventListener('click', async () => {
    try {
        const response = await axios.post(`${API_URL}/repeat/cycle`);
        repeatMode = response.data.repeat;
        
        repeatBtn.classList.toggle('active', repeatMode !== 'off');
        
        const modeText = {
            'off': 'desligado',
            'one': 'repetir uma',
            'all': 'repetir tudo'
        };
        
        repeatBtn.title = `Repetir (${modeText[repeatMode]})`;
        showToast(`Repeat: ${modeText[repeatMode]}`, 'info');
    } catch (error) {
        console.error('Repeat error:', error);
    }
});

// ========== PROGRESS BAR ==========

progressBar.addEventListener('click', (e) => {
    if (isDraggingProgress) return;
    seekToPosition(e);
});

progressHandle.addEventListener('mousedown', () => {
    isDraggingProgress = true;
});

document.addEventListener('mousemove', (e) => {
    if (isDraggingProgress) {
        seekToPosition(e);
    }
});

document.addEventListener('mouseup', () => {
    isDraggingProgress = false;
});

function seekToPosition(event) {
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    const duration = parseFloat(totalTime.dataset.seconds) || 0;
    const newPosition = (percentage / 100) * duration;
    
    if (newPosition >= 0 && newPosition <= duration) {
        axios.post(`${API_URL}/seek/${Math.floor(newPosition)}`);
    }
}

async function updatePosition() {
    try {
        const response = await axios.get(`${API_URL}/position`);
        const { current, duration, percentage } = response.data;
        
        if (!isDraggingProgress) {
            progressFill.style.width = `${percentage}%`;
            progressHandle.style.left = `${percentage}%`;
        }
        
        currentTime.textContent = formatTime(current);
        totalTime.textContent = formatTime(duration);
        totalTime.dataset.seconds = duration;
    } catch (error) {
        // Silent fail
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

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

// ========== QUEUE ==========

async function addToQueue(trackId) {
    try {
        await axios.post(`${API_URL}/queue/add/${trackId}`);
        showToast('Adicionado à fila', 'success');
    } catch (error) {
        console.error('Add to queue error:', error);
        showToast('Erro ao adicionar à fila', 'error');
    }
}

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
                <img class="queue-cover" src="${track.album_art || ''}" alt="${track.name}" />
                <div class="queue-item-info">
                    <div class="queue-item-name">${track.name}</div>
                    <div class="queue-item-artist">${track.artist}</div>
                </div>
                <span class="queue-duration">${formatTime(track.duration || 0)}</span>
                <button class="control-btn" onclick="playTrack('${track.id}')" title="Reproduzir">▶️</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Queue error:', error);
        queueContent.innerHTML = '<div class="empty-state">❌ Erro ao carregar fila</div>';
    }
}

document.getElementById('clearQueueBtn')?.addEventListener('click', async () => {
    try {
        await axios.post(`${API_URL}/queue/clear`);
        showToast('Fila limpa', 'info');
        loadQueue();
    } catch (error) {
        console.error('Clear queue error:', error);
    }
});

// ========== LYRICS ==========

async function loadLyrics(trackId) {
    if (!trackId) {
        lyricsContent.innerHTML = '<div class="empty-state">Reproduza uma música para ver as letras</div>';
        return;
    }
    
    lyricsContent.innerHTML = '<div class="loading">Buscando letras...</div>';
    
    try {
        const response = await axios.get(`${API_URL}/lyrics/${trackId}`);
        
        if (response.data.found) {
            lyricsContent.innerHTML = `
                <div class="lyrics-header-info">
                    <h3>${response.data.title}</h3>
                    <p>${response.data.artist}</p>
                </div>
                <div class="lyrics-text">${response.data.formatted}</div>
            `;
        } else {
            lyricsContent.innerHTML = '<div class="empty-state">😢 Letras não encontradas</div>';
        }
    } catch (error) {
        console.error('Lyrics error:', error);
        lyricsContent.innerHTML = '<div class="empty-state">❌ Erro ao buscar letras</div>';
    }
}

document.getElementById('refreshLyricsBtn')?.addEventListener('click', () => {
    if (currentTrack) {
        loadLyrics(currentTrack.id);
    }
});

// ========== HISTORY ==========

async function loadHistory() {
    try {
        historyContent.innerHTML = '<div class="loading">Carregando histórico...</div>';
        
        const [recentRes, mostPlayedRes] = await Promise.all([
            axios.get(`${API_URL}/history/recent`, { params: { limit: 20 } }),
            axios.get(`${API_URL}/history/most-played`, { params: { limit: 10 } })
        ]);
        
        const recent = recentRes.data.tracks;
        const mostPlayed = mostPlayedRes.data.tracks;
        
        historyContent.innerHTML = `
            <div class="history-section">
                <h3>🕒 Tocadas Recentemente</h3>
                <div class="history-grid">
                    ${recent.map(track => `
                        <div class="track-card" onclick="playTrack('${track.track_id}')">
                            <div class="track-name">${track.track_name}</div>
                            <div class="track-artist">${track.artist}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="history-section">
                <h3>🔥 Mais Tocadas</h3>
                <div class="most-played-list">
                    ${mostPlayed.map((track, i) => `
                        <div class="most-played-item">
                            <span class="rank">#${i + 1}</span>
                            <div class="track-info">
                                <div class="track-name">${track.track_name}</div>
                                <div class="track-artist">${track.artist}</div>
                            </div>
                            <span class="play-count">${track.play_count} plays</span>
                            <button class="btn-icon" onclick="playTrack('${track.track_id}')">▶️</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('History error:', error);
        historyContent.innerHTML = '<div class="empty-state">❌ Erro ao carregar histórico</div>';
    }
}

// ========== FAVORITES ==========

async function isTrackFavorited(trackId) {
    if (favoritesCache.has(trackId)) return true;
    
    try {
        const response = await axios.get(`${API_URL}/favorites/check/${trackId}`);
        if (response.data.is_favorite) {
            favoritesCache.add(trackId);
        }
        return response.data.is_favorite;
    } catch (error) {
        return false;
    }
}

async function toggleFavorite(trackId, buttonElement) {
    try {
        const isFav = await isTrackFavorited(trackId);
        
        if (isFav) {
            await axios.delete(`${API_URL}/favorites/${trackId}`);
            favoritesCache.delete(trackId);
            buttonElement.innerHTML = '🤍';
            buttonElement.classList.remove('active');
            buttonElement.title = 'Adicionar aos favoritos';
            showToast('Removido dos favoritos', 'info');
        } else {
            await axios.post(`${API_URL}/favorites/${trackId}`);
            favoritesCache.add(trackId);
            buttonElement.innerHTML = '❤️';
            buttonElement.classList.add('active');
            buttonElement.title = 'Remover dos favoritos';
            showToast('Adicionado aos favoritos', 'success');
        }
    } catch (error) {
        console.error('Favorite toggle error:', error);
        showToast('Erro ao atualizar favoritos', 'error');
    }
}

async function loadFavorites() {
    try {
        favoritesContent.innerHTML = '<div class="loading">Carregando favoritos...</div>';
        
        const response = await axios.get(`${API_URL}/favorites`);
        const favorites = response.data.favorites;
        
        if (!favorites || favorites.length === 0) {
            favoritesContent.innerHTML = '<div class="empty-state">💔 Nenhum favorito ainda</div>';
            return;
        }
        
        favoritesContent.innerHTML = `
            <div class="favorites-header">
                <h3>❤️ Suas Músicas Favoritas (${favorites.length})</h3>
            </div>
            <div class="results-grid">
                ${favorites.map(track => `
                    <div class="track-card">
                        <img class="track-cover" src="${track.album_art || ''}" alt="${track.track_name}" />
                        <div class="track-info">
                            <div class="track-name">${track.track_name}</div>
                            <div class="track-artist">${track.artist}</div>
                        </div>
                        <div class="track-actions">
                            <button class="btn-icon" onclick="playTrack('${track.track_id}')">▶️</button>
                            <button class="btn-icon active" onclick="removeFavorite('${track.track_id}')">❤️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Favorites error:', error);
        favoritesContent.innerHTML = '<div class="empty-state">❌ Erro ao carregar favoritos</div>';
    }
}

async function removeFavorite(trackId) {
    try {
        await axios.delete(`${API_URL}/favorites/${trackId}`);
        favoritesCache.delete(trackId);
        showToast('Removido dos favoritos', 'info');
        loadFavorites();
    } catch (error) {
        console.error('Remove favorite error:', error);
    }
}

// ========== EQUALIZER ==========

async function loadEqualizer() {
    try {
        const [settingsRes, presetsRes] = await Promise.all([
            axios.get(`${API_URL}/equalizer`),
            axios.get(`${API_URL}/equalizer/presets`)
        ]);
        
        const settings = settingsRes.data;
        const presets = presetsRes.data.presets;
        
        equalizerContent.innerHTML = `
            <div class="eq-header">
                <h3>🎚️ Equalizer</h3>
                <button id="eqToggle" class="btn-secondary ${settings.enabled ? 'active' : ''}">
                    ${settings.enabled ? 'ON' : 'OFF'}
                </button>
            </div>
            
            <div class="eq-presets">
                <label>Presets:</label>
                <select id="eqPresetSelect" class="eq-preset-select">
                    <option value="">Selecione um preset...</option>
                    ${Object.keys(presets).map(preset => `
                        <option value="${preset}">${preset.replace(/_/g, ' ').toUpperCase()}</option>
                    `).join('')}
                </select>
            </div>
            
            <div class="eq-sliders">
                <div class="eq-band">
                    <label>Bass</label>
                    <input type="range" id="bassSlider" min="-12" max="12" value="${settings.bass}" step="1" />
                    <span id="bassValue">${settings.bass}dB</span>
                </div>
                
                <div class="eq-band">
                    <label>Mid</label>
                    <input type="range" id="midSlider" min="-12" max="12" value="${settings.mid}" step="1" />
                    <span id="midValue">${settings.mid}dB</span>
                </div>
                
                <div class="eq-band">
                    <label>Treble</label>
                    <input type="range" id="trebleSlider" min="-12" max="12" value="${settings.treble}" step="1" />
                    <span id="trebleValue">${settings.treble}dB</span>
                </div>
            </div>
            
            <button id="eqReset" class="btn-secondary">Reset to Flat</button>
        `;
        
        setupEqualizerListeners();
    } catch (error) {
        console.error('Equalizer error:', error);
        equalizerContent.innerHTML = '<div class="empty-state">❌ Erro ao carregar equalizer</div>';
    }
}

function setupEqualizerListeners() {
    // Toggle
    document.getElementById('eqToggle')?.addEventListener('click', async (e) => {
        try {
            const response = await axios.post(`${API_URL}/equalizer/toggle`);
            e.target.textContent = response.data.enabled ? 'ON' : 'OFF';
            e.target.classList.toggle('active', response.data.enabled);
            showToast(`Equalizer ${response.data.enabled ? 'ON' : 'OFF'}`, 'info');
        } catch (error) {
            console.error('EQ toggle error:', error);
        }
    });
    
    // Presets
    document.getElementById('eqPresetSelect')?.addEventListener('change', async (e) => {
        const preset = e.target.value;
        if (!preset) return;
        
        try {
            await axios.post(`${API_URL}/equalizer/preset/${preset}`);
            showToast(`Preset: ${preset}`, 'success');
            loadEqualizer();
        } catch (error) {
            console.error('Preset error:', error);
        }
    });
    
    // Sliders
    ['bass', 'mid', 'treble'].forEach(band => {
        const slider = document.getElementById(`${band}Slider`);
        const valueSpan = document.getElementById(`${band}Value`);
        
        slider?.addEventListener('input', (e) => {
            valueSpan.textContent = `${e.target.value}dB`;
        });
        
        slider?.addEventListener('change', async (e) => {
            try {
                await axios.post(`${API_URL}/equalizer/band/${band}/${e.target.value}`);
            } catch (error) {
                console.error('Slider error:', error);
            }
        });
    });
    
    // Reset
    document.getElementById('eqReset')?.addEventListener('click', async () => {
        try {
            await axios.post(`${API_URL}/equalizer/preset/flat`);
            showToast('EQ reset to flat', 'info');
            loadEqualizer();
        } catch (error) {
            console.error('Reset error:', error);
        }
    });
}

// ========== PLAYLISTS ==========

async function loadPlaylists() {
    try {
        const response = await axios.get(`${API_URL}/playlists`);
        const playlists = response.data.playlists;
        
        // Sidebar
        playlistsList.innerHTML = '<h3>Suas Playlists</h3>' + playlists.slice(0, 10).map(playlist => `
            <button class="playlist-item" onclick="loadPlaylistTracks('${playlist.id}')">
                ${playlist.name}
            </button>
        `).join('');
        
        // Main view
        playlistsContent.innerHTML = playlists.map(playlist => `
            <div class="playlist-card" onclick="loadPlaylistTracks('${playlist.id}')">
                <img src="${playlist.images[0]?.url || ''}" alt="${playlist.name}" />
                <div class="playlist-name">${playlist.name}</div>
                <div class="playlist-description">${playlist.description || `${playlist.tracks?.total || 0} músicas`}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Playlists error:', error);
    }
}

async function loadPlaylistTracks(playlistId) {
    switchView('search');
    searchResults.innerHTML = '<div class="loading">Carregando playlist...</div>';
    
    try {
        const response = await axios.get(`${API_URL}/playlist/${playlistId}`);
        displaySearchResults(response.data.tracks);
    } catch (error) {
        console.error('Playlist tracks error:', error);
        searchResults.innerHTML = '<div class="empty-state">❌ Erro</div>';
    }
}

// ========== TOAST NOTIFICATIONS ==========

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    }[type] || 'ℹ️';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('toast-show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== POLLING & INIT ==========

// Update position every second
setInterval(updatePosition, 1000);

// Poll status
setInterval(async () => {
    try {
        const response = await axios.get(`${API_URL}/status`);
        isPlaying = response.data.is_playing;
        shuffleMode = response.data.shuffle;
        repeatMode = response.data.repeat;
        
        updatePlayPauseButton();
        shuffleBtn.classList.toggle('active', shuffleMode);
        repeatBtn.classList.toggle('active', repeatMode !== 'off');
    } catch (error) {
        // Silent
    }
}, 5000);

// Init
setTimeout(loadPlaylists, 1000);

console.log('🎵 Spotify YouTube Player v3.0 loaded');
console.log('🔗 Backend:', API_URL);
console.log('✨ Features: Search, Play, Queue, Lyrics, History, Favorites, Equalizer');