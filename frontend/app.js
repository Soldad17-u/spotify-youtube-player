const axios = require('axios');

const API_URL = 'http://localhost:8000';

let currentView = 'search';
let isPlaying = false;
let currentTrack = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const playPauseBtn = document.getElementById('playPauseBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const playerAlbumArt = document.getElementById('playerAlbumArt');
const playerTrackName = document.getElementById('playerTrackName');
const playerArtistName = document.getElementById('playerArtistName');
const playlistsList = document.getElementById('playlistsList');
const playlistsContent = document.getElementById('playlistsContent');
const queueContent = document.getElementById('queueContent');

// Navigation
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
    }
}

// Search
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
    }
}

function displaySearchResults(tracks) {
    if (!tracks || tracks.length === 0) {
        searchResults.innerHTML = '<div class="empty-state">Nenhum resultado encontrado</div>';
        return;
    }
    
    searchResults.innerHTML = tracks.map(track => `
        <div class="track-card" data-track-id="${track.id}">
            <img src="${track.album.images[0]?.url || ''}" alt="${track.name}" />
            <div class="track-name">${track.name}</div>
            <div class="track-artist">${track.artists.map(a => a.name).join(', ')}</div>
            <button class="play-btn-overlay" onclick="playTrack('${track.id}')">▶️</button>
        </div>
    `).join('');
}

// Playback Controls
async function playTrack(trackId) {
    try {
        const response = await axios.post(`${API_URL}/play/${trackId}`);
        
        if (response.data.status === 'playing') {
            currentTrack = response.data.track;
            updatePlayerUI();
            isPlaying = true;
            playPauseBtn.textContent = '⏸️';
        }
    } catch (error) {
        console.error('Play error:', error);
        alert('❌ Erro ao reproduzir. Primeira vez pode demorar (download). Verifique console do backend.');
    }
}

playPauseBtn.addEventListener('click', async () => {
    try {
        if (isPlaying) {
            await axios.post(`${API_URL}/pause`);
            isPlaying = false;
            playPauseBtn.textContent = '▶️';
        } else {
            await axios.post(`${API_URL}/resume`);
            isPlaying = true;
            playPauseBtn.textContent = '⏸️';
        }
    } catch (error) {
        console.error('Play/Pause error:', error);
    }
});

nextBtn.addEventListener('click', async () => {
    try {
        const response = await axios.post(`${API_URL}/queue/next`);
        if (response.data.track) {
            currentTrack = response.data.track;
            updatePlayerUI();
        }
    } catch (error) {
        console.error('Next error:', error);
    }
});

function updatePlayerUI() {
    if (!currentTrack) return;
    
    playerTrackName.textContent = currentTrack.name;
    playerArtistName.textContent = currentTrack.artist;
    playerAlbumArt.src = currentTrack.image || '';
}

// Volume Control
volumeSlider.addEventListener('input', async (e) => {
    const volume = e.target.value;
    volumeValue.textContent = `${volume}%`;
    
    try {
        await axios.post(`${API_URL}/volume/${volume}`);
    } catch (error) {
        console.error('Volume error:', error);
    }
});

// Playlists
async function loadPlaylists() {
    try {
        const response = await axios.get(`${API_URL}/playlists`);
        const playlists = response.data.playlists;
        
        // Sidebar list
        const sidebarHTML = '<h3>Suas Playlists</h3>' + playlists.map(playlist => `
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
        searchResults.innerHTML = '<div class="empty-state">❌ Erro ao carregar músicas</div>';
    }
}

// Queue
async function loadQueue() {
    try {
        const response = await axios.get(`${API_URL}/queue`);
        const queue = response.data.queue;
        
        if (!queue || queue.length === 0) {
            queueContent.innerHTML = '<div class="empty-state">Nenhuma música na fila</div>';
            return;
        }
        
        // Fetch track details for each ID in queue
        const tracks = await Promise.all(
            queue.map(id => axios.get(`${API_URL}/track/${id}`))
        );
        
        queueContent.innerHTML = tracks.map(res => {
            const track = res.data;
            return `
                <div class="queue-item">
                    <img src="${track.album.images[2]?.url || ''}" alt="${track.name}" />
                    <div class="queue-item-info">
                        <div class="queue-item-name">${track.name}</div>
                        <div class="queue-item-artist">${track.artists.map(a => a.name).join(', ')}</div>
                    </div>
                    <button class="control-btn" onclick="playTrack('${track.id}')">▶️</button>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Queue error:', error);
        queueContent.innerHTML = '<div class="empty-state">❌ Erro ao carregar fila</div>';
    }
}

// Status polling (check player state every 5 seconds)
setInterval(async () => {
    try {
        const response = await axios.get(`${API_URL}/status`);
        isPlaying = response.data.is_playing;
        playPauseBtn.textContent = isPlaying ? '⏸️' : '▶️';
    } catch (error) {
        // Silently fail - backend might be down
    }
}, 5000);

// Load playlists on startup
setTimeout(loadPlaylists, 1000);

console.log('🎵 Spotify YouTube Player loaded');
console.log('🔗 Backend should be running at:', API_URL);