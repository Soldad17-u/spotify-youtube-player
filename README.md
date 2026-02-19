# Spotify YouTube Player

> Player de música híbrido que usa API do Spotify para busca/metadados e YouTube para streaming de áudio

## 🎵 Características

- **Sem anúncios** - reprodução direta do áudio do YouTube
- **Interface moderna** - busca e navegação usando dados do Spotify
- **Cache inteligente** - armazena músicas localmente para reprodução rápida
- **Matching avançado** - algoritmo que encontra a melhor correspondência Spotify → YouTube
- **Playlists** - importa e reproduz suas playlists do Spotify
- **Controles completos** - play, pause, próxima, volume, shuffle

## 🛠️ Stack Tecnológico

### Backend
- Python 3.9+
- FastAPI (API REST)
- Spotipy (Spotify API wrapper)
- yt-dlp (extração de áudio do YouTube)
- python-vlc (engine de reprodução)
- SQLite (cache)

### Frontend
- Electron + React
- TailwindCSS
- Axios (HTTP client)

## 🚀 Instalação

### Pré-requisitos

1. **Python 3.9+**
```bash
python --version
```

2. **Node.js 16+**
```bash
node --version
```

3. **VLC Media Player**
   - Linux: `sudo apt install vlc`
   - macOS: `brew install vlc`
   - Windows: [Download VLC](https://www.videolan.org/vlc/)

4. **FFmpeg**
   - Linux: `sudo apt install ffmpeg`
   - macOS: `brew install ffmpeg`
   - Windows: [Download FFmpeg](https://ffmpeg.org/download.html)

### Configuração

#### 1. Clone o repositório
```bash
git clone https://github.com/Soldad17-u/spotify-youtube-player.git
cd spotify-youtube-player
```

#### 2. Configure o Backend

```bash
cd backend
pip install -r requirements.txt
```

Crie um arquivo `.env` na pasta `backend/`:

```env
SPOTIFY_CLIENT_ID=seu_client_id_aqui
SPOTIFY_CLIENT_SECRET=seu_client_secret_aqui
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
```

**Como obter credenciais do Spotify:**
1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crie um novo app
3. Copie Client ID e Client Secret
4. Adicione `http://localhost:8888/callback` nas Redirect URIs

#### 3. Configure o Frontend

```bash
cd ../frontend
npm install
```

## ▶️ Executar

### Terminal 1 - Backend
```bash
cd backend
python main.py
```
Servidor rodando em: `http://localhost:8000`

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
Aplicação Electron abrirá automaticamente

## 📚 Como Usar

1. **Buscar música** - digite na barra de busca
2. **Reproduzir** - clique no botão play ao lado da música
3. **Primeira reprodução** - pode demorar alguns segundos (download + cache)
4. **Reproduções seguintes** - instantâneas (usa cache)
5. **Playlists** - acesse suas playlists do Spotify na barra lateral

## 📁 Estrutura do Projeto

```
spotify-youtube-player/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── music_matcher.py     # Lógica de matching Spotify-YouTube
│   ├── audio_cache.py       # Sistema de cache
│   ├── audio_player.py      # Engine de reprodução VLC
│   ├── requirements.txt     # Dependências Python
│   └── .env                 # Credenciais (criar manualmente)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Componente principal
│   │   ├── components/      # Componentes React
│   │   └── index.js         # Entry point
│   ├── public/
│   ├── package.json
│   └── electron.js          # Electron main process
├── cache/                   # Arquivos de áudio em cache (criado automaticamente)
└── README.md
```

## ⚠️ Aviso Legal

Este projeto é **apenas para fins educacionais**. O uso da API do Spotify e extração de áudio do YouTube pode violar os Termos de Serviço dessas plataformas. Use por sua conta e risco.

**Alternativas legítimas:**
- Spotify Premium (sem anúncios)
- YouTube Music Premium
- Deezer Premium
- Apple Music

## 📝 Roadmap

- [ ] Sistema de equalização
- [ ] Letras sincronizadas
- [ ] Scrobbling para Last.fm
- [ ] Suporte a múltiplas fontes (SoundCloud, Bandcamp)
- [ ] App móvel (React Native)
- [ ] Modo offline completo
- [ ] Importar biblioteca local de músicas

## 🤝 Contribuir

Contribuições são bem-vindas! Abra uma issue ou pull request.

## 📝 Licença

MIT License - veja LICENSE para detalhes.

---

**Desenvolvido por [Daniel Calixto](https://github.com/Soldad17-u)**