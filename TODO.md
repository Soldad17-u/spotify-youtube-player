# 📋 TODO List - Spotify YouTube Player

## ✅ Concluído

### Backend Core
- [x] Backend FastAPI completo
- [x] Sistema de matching Spotify → YouTube
- [x] Cache inteligente com SQLite
- [x] Player engine com VLC
- [x] Busca de músicas
- [x] Reprodução com controles
- [x] Sistema de playlists
- [x] Controle de volume
- [x] Fila de reprodução
- [x] Documentação completa

### Frontend Core
- [x] Frontend Electron com interface moderna
- [x] Custom title bar
- [x] Sidebar navigation
- [x] Search view
- [x] Player bar

### Sprint 1 - Backend Advanced ✅
- [x] **Progress bar de reprodução** - posição + porcentagem
- [x] **Shuffle e repeat** - 3 modos (off/one/all)
- [x] **Auto-play próxima música** - monitoring thread
- [x] **Seek/scrubbing** - pular para qualquer posição
- [x] **Letras sincronizadas** - lyrics.ovh API
- [x] **Enhanced queue** - metadados completos

### Sprint 2 - Frontend Integration ✅
- [x] **Frontend para progress bar** - interactive draggable
- [x] **Frontend para letras** - dedicated lyrics view
- [x] **Hotkeys globais** - media keys + custom shortcuts
- [x] **Notificações desktop** - native OS notifications
- [x] **Toast notifications** - in-app animated messages
- [x] **Mini player mode** - compact 400x180px window
- [x] **Window controls** - IPC communication
- [x] **Enhanced queue UI** - visual queue with actions

### Sprint 3 - Advanced Backend ✅
- [x] **Equalizer** - 3-band (bass, mid, treble)
- [x] **Equalizer presets** - 9 built-in presets
- [x] **History tracking** - SQLite database
- [x] **Auto-tracking** - on playback end
- [x] **Favorites system** - like/unlike tracks
- [x] **Statistics** - listening stats dashboard
- [x] **Play stats** - most played, recent tracks

## 🔥 Em Desenvolvimento (Sprint 4)

### Frontend for Advanced Features
- [ ] **Equalizer UI** - sliders for bass/mid/treble
- [ ] **Preset selector** - dropdown with 9 presets
- [ ] **History view** - list of played tracks
- [ ] **Recent tracks** - no duplicates view
- [ ] **Most played** - top tracks list
- [ ] **Favorites view** - grid of liked tracks
- [ ] **Statistics widgets** - visual stats display
- [ ] **Heart button** - like/unlike current track

## 📅 Próximas Features

### Alta Prioridade

- [ ] **Download de playlists completas** - batch download with progress
- [ ] **Temas customizados** - dark/light themes, accent colors
- [ ] **Export/import** - backup favorites and settings
- [ ] **Keyboard shortcuts settings** - customize hotkeys

### Média Prioridade

- [ ] **Importar biblioteca local** - play local MP3s
- [ ] **Crossfade** - smooth transitions (3-10s)
- [ ] **Normalização de volume** - ReplayGain support
- [ ] **Pre-loading** - download next track in background
- [ ] **Search filters** - by year, genre, explicit
- [ ] **Lyrics sync** - highlight current line

### Baixa Prioridade

- [ ] **Scrobbling Last.fm** - track plays to Last.fm
- [ ] **Compartilhamento social** - share current track
- [ ] **Visualizador de áudio** - spectrum analyzer
- [ ] **Sleep timer** - auto-stop after X minutes
- [ ] **Exportar playlists** - save as M3U/PLS
- [ ] **Discord Rich Presence** - show what you're playing

## 🔧 Melhorias Técnicas

### Performance

- [x] **Monitoring thread** - background auto-play ✅
- [ ] **Streaming progressivo** - play while downloading
- [ ] **Compressão de cache** - reduce disk usage
- [ ] **Limpeza automática de cache** - remove old tracks (>30 days)
- [ ] **Multi-threading** - parallel downloads
- [ ] **Lazy loading** - virtualized lists for large playlists

### Qualidade

- [ ] **Fallback sources** - try SoundCloud if YouTube fails
- [ ] **Matching aprimorado** - audio fingerprinting
- [ ] **Detecção de qualidade** - select best bitrate
- [ ] **Validação de integridade** - verify complete downloads
- [ ] **Error recovery** - retry failed downloads

### Experiência do Usuário

- [ ] **Onboarding** - first-time tutorial
- [ ] **Atalhos visuais** - keyboard hints in UI
- [x] **Estado persistente** - queue, volume, EQ settings ✅
- [ ] **Configurações avançadas** - cache folder, quality, API keys
- [ ] **Modo offline** - indicate no internet
- [ ] **Search history** - remember recent searches

## 🐛 Bugs Conhecidos

- [ ] Volume slider não sincroniza com VLC em tempo real
- [ ] Primeira busca pode ser lenta (Spotify auth)
- [ ] Cache stats não atualizam automaticamente na UI
- [ ] Playlists muito grandes (>100 músicas) paginate incorrectly
- [ ] Window restore position not working on some systems

## 🎨 Design

- [ ] Animações de transição mais suaves
- [ ] Loading states mais informativos (skeleton screens)
- [ ] Feedback visual ao adicionar à fila
- [ ] Indicador de música atual na lista
- [ ] Drag and drop para reordenar fila
- [ ] Context menus (right-click)
- [ ] Album art zoom on hover

## 📱 Plataformas

- [ ] **App móvel** - React Native version
- [ ] **Web player** - browser-only version
- [ ] **CLI** - command-line interface
- [ ] **API pública** - allow third-party integrations
- [ ] **Browser extension** - control from browser

## 🔐 Segurança & Legal

- [ ] Rate limiting - prevent API abuse
- [ ] Criptografia de credenciais - secure storage
- [ ] Logs de auditoria - track important actions
- [ ] Disclaimer legal mais claro
- [ ] Opção de usar apenas fontes legítimas
- [ ] GDPR compliance for user data

## 📊 Analytics

- [x] **Estatísticas de uso** - local tracking ✅
- [x] **Músicas mais tocadas** - play count ✅
- [x] **Tempo total de escuta** - listening hours ✅
- [ ] **Artistas favoritos** - aggregate by artist
- [ ] **Gráficos de escuta** - charts over time
- [ ] **Genre breakdown** - listening habits by genre
- [ ] **Weekly/monthly reports** - listening summaries

---

## 💡 Ideias Futuras

- [ ] **AI DJ** - auto-create playlists by mood
- [ ] **Lyrics karaoke mode** - sing along with highlights
- [ ] **Modo party** - sync playback across devices
- [ ] **Reconhecimento de voz** - voice commands
- [ ] **Integração com smart home** - Alexa/Google Home
- [ ] **Collaborative playlists** - share with friends
- [ ] **Music quiz game** - guess the song

---

## 🏆 Milestones

### ✅ Sprint 1 (COMPLETO - Feb 19, 2026)

**Backend Core Features**
- Auto-play next track with monitoring thread
- Shuffle and repeat modes (off/one/all)
- Progress bar support (position + percentage)
- Seek functionality
- Lyrics fetching (lyrics.ovh API)
- Enhanced queue management

**Pull Request:** [#1](https://github.com/Soldad17-u/spotify-youtube-player/pull/1) ✅ Merged

---

### ✅ Sprint 2 (COMPLETO - Feb 19, 2026)

**Frontend Integration**
- Interactive progress bar with seek
- Shuffle/repeat UI buttons
- Lyrics panel view
- Global hotkeys (media keys + custom)
- Desktop + toast notifications
- Mini player mode (Ctrl+M)
- Window controls with IPC
- Enhanced queue UI

**Pull Request:** [#2](https://github.com/Soldad17-u/spotify-youtube-player/pull/2) ✅ Merged

---

### ✅ Sprint 3 (COMPLETO - Feb 19, 2026)

**Advanced Backend**
- 3-band Equalizer (bass, mid, treble)
- 9 EQ presets (flat, bass boost, vocal, etc)
- History tracking (SQLite)
- Auto-tracking on playback end
- Favorites/like system
- Listening statistics
- Play stats (most played, recent)

**Pull Request:** [#3](https://github.com/Soldad17-u/spotify-youtube-player/pull/3) ✅ Merged

---

### 🔄 Sprint 4 (In Progress - Feb 19, 2026)

**Frontend for Advanced Features**
- Equalizer UI with sliders
- Preset selector dropdown
- History view (recent, most played)
- Favorites grid view
- Statistics dashboard
- Heart button for current track
- Visual feedback for EQ changes
- Batch actions for history/favorites

**Target:** Feb 20, 2026

---

### 📅 Sprint 5 (Planned - Feb 21-23, 2026)

**Polish & Performance**
- Batch playlist download
- Theme customization system
- Export/import playlists
- Cache management UI
- Performance optimizations
- Bug fixes

**Target:** Feb 23, 2026

---

**Current Progress:** 25/60+ features completed (42%)

**Contribuições são bem-vindas!** Se quiser implementar alguma feature da lista, crie uma branch e abra um PR.