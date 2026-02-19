# 🎵 Spotify YouTube Player

> Player de música híbrido completo que usa a API do Spotify para busca/metadados e YouTube para streaming de áudio - **sem anúncios**

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.9+-blue)
![Node](https://img.shields.io/badge/node-16+-green)
![Status](https://img.shields.io/badge/status-production--ready-success)

## ✨ Características

### 🎶 Reprodução
- **Sem anúncios** - reprodução direta do áudio do YouTube
- **Cache inteligente** - primeira reprodução baixa, próximas instantâneas
- **Controles completos** - play, pause, próxima, volume
- **Fila de reprodução** - adicione músicas para tocar depois

### 🔍 Busca e Descoberta
- **Interface moderna** - busca rápida usando dados do Spotify
- **Playlists** - importa e reproduz suas playlists do Spotify
- **Recomendações** - aproveita o catálogo rico do Spotify
- **Matching avançado** - algoritmo inteligente Spotify → YouTube

### 💾 Performance
- **SQLite cache** - armazenamento eficiente de músicas
- **VLC engine** - reprodução de alta qualidade
- **Async API** - backend não-bloqueante
- **Electron app** - interface desktop nativa

## 📸 Screenshots

```
[Em breve - adicione screenshots após rodar o app]
```

## 🛠️ Stack Tecnológico

### Backend
- **Python 3.9+** - linguagem principal
- **FastAPI** - framework web moderno e rápido
- **Spotipy** - wrapper oficial da API do Spotify
- **yt-dlp** - extração de áudio do YouTube (fork mantido do youtube-dl)
- **python-vlc** - engine de reprodução de áudio
- **SQLite** - banco de dados leve para cache

### Frontend
- **Electron** - framework para apps desktop cross-platform
- **HTML/CSS/JavaScript** - interface web moderna
- **Axios** - cliente HTTP para comunicação com backend

## 🚀 Instalação Rápida

### Pré-requisitos

Você precisa ter instalado:

1. **Python 3.9+** - [Download](https://www.python.org/downloads/)
2. **Node.js 16+** - [Download](https://nodejs.org/)
3. **VLC Media Player** - [Download](https://www.videolan.org/vlc/)
4. **FFmpeg** - [Instruções](https://ffmpeg.org/download.html)

> 📚 **Guia detalhado de instalação:** Veja [INSTALL.md](INSTALL.md) para instruções completas passo a passo

### Setup Rápido

```bash
# 1. Clone o repositório
git clone https://github.com/Soldad17-u/spotify-youtube-player.git
cd spotify-youtube-player

# 2. Backend setup
cd backend
pip install -r requirements.txt

# 3. Configure credenciais do Spotify
cp .env.example .env
# Edite .env com suas credenciais do Spotify Developer Dashboard

# 4. Frontend setup
cd ../frontend
npm install
```

### Obter Credenciais do Spotify

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crie um novo app
3. Adicione `http://localhost:8888/callback` nas Redirect URIs
4. Copie Client ID e Client Secret para o arquivo `.env`

## ▶️ Como Usar

### Iniciar o Backend

```bash
cd backend
python main.py
```

✅ Servidor rodando em: `http://localhost:8000`  
📚 Documentação da API: `http://localhost:8000/docs`

### Iniciar o Frontend

Em outro terminal:

```bash
cd frontend
npm start
```

O aplicativo Electron abrirá automaticamente! 🎉

### Usando o Player

1. **Buscar** - Digite nome da música, artista ou álbum
2. **Reproduzir** - Clique no botão play na música desejada
3. **Primeira vez** - Pode demorar 10-30 segundos (baixando e cacheando)
4. **Próximas vezes** - Reprodução instantânea do cache local!
5. **Playlists** - Acesse suas playlists do Spotify na barra lateral
6. **Controles** - Use os botões na barra inferior (play/pause/next/volume)

## 📁 Estrutura do Projeto

```
spotify-youtube-player/
├── backend/                  # API Python
│   ├── main.py              # Servidor FastAPI
│   ├── music_matcher.py     # Algoritmo de matching
│   ├── audio_cache.py       # Sistema de cache
│   ├── audio_player.py      # Engine VLC
│   ├── requirements.txt     # Dependências Python
│   ├── .env.example         # Template de configuração
│   └── .env                 # Suas credenciais (não commitar!)
├── frontend/                # App Electron
│   ├── electron.js          # Main process
│   ├── index.html           # Interface
│   ├── styles.css           # Estilos
│   ├── app.js               # Lógica da aplicação
│   └── package.json         # Dependências Node
├── cache/                   # Músicas em cache (gerado automaticamente)
├── README.md               # Este arquivo
├── INSTALL.md              # Guia detalhado de instalação
├── TODO.md                 # Roadmap e features futuras
├── LICENSE                 # Licença MIT
└── .gitignore              # Arquivos ignorados pelo Git
```

## 🔧 Desenvolvimento

### Rodar em Modo Desenvolvimento

```bash
# Backend com auto-reload
cd backend
uvicorn main:app --reload

# Frontend com DevTools
cd frontend
npm run dev
```

### Testar a API

Acesse `http://localhost:8000/docs` para a interface Swagger interativa.

**Endpoints principais:**

```
GET  /search?q={query}           # Buscar músicas
POST /play/{track_id}            # Reproduzir música
POST /pause                      # Pausar
POST /resume                     # Retomar
GET  /playlists                  # Listar playlists
GET  /playlist/{id}              # Músicas de uma playlist
POST /queue/add/{track_id}       # Adicionar à fila
POST /queue/next                 # Próxima da fila
GET  /queue                      # Ver fila
POST /volume/{level}             # Ajustar volume (0-100)
GET  /status                     # Status do player
```

## 🐛 Solução de Problemas

### Backend não inicia

```bash
# Reinstale dependências
cd backend
pip install -r requirements.txt --force-reinstall

# Verifique se porta 8000 está livre
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/macOS
```

### Erro: "VLC not found"

- Certifique-se que VLC está instalado
- Windows: Reinstale VLC 64-bit
- Linux: `sudo apt install vlc python3-vlc`
- macOS: `brew install vlc`

### Música não toca

1. Verifique logs no terminal do backend
2. Primeira reprodução demora (download)
3. Se erro persistir, tente outra música
4. Música pode não estar no YouTube

### Frontend não conecta

- Confirme que backend está rodando (`http://localhost:8000`)
- Verifique firewall/antivírus
- Reinicie ambos backend e frontend

> 📚 Mais ajuda em [INSTALL.md](INSTALL.md)

## ⚠️ Aviso Legal

**Este projeto é apenas para fins educacionais e uso pessoal.**

O uso da API do Spotify combinado com extração de áudio do YouTube pode violar os Termos de Serviço de ambas as plataformas. Este software é fornecido "como está", sem garantias. Use por sua própria conta e risco.

### Alternativas Legítimas

Se você gosta de música, considere suportar artistas e plataformas:

- **[Spotify Premium](https://www.spotify.com/premium/)** - R$ 21,90/mês, sem anúncios
- **[YouTube Music Premium](https://music.youtube.com/)** - R$ 28,90/mês
- **[Deezer HiFi](https://www.deezer.com/)** - Alta qualidade
- **[Apple Music](https://www.apple.com/apple-music/)** - Integrado ao ecossistema Apple

## 📝 Roadmap

Veja [TODO.md](TODO.md) para lista completa de features planejadas.

### Próximas Features

- [ ] Progress bar de reprodução
- [ ] Shuffle e repeat
- [ ] Letras sincronizadas
- [ ] Equalizer
- [ ] Hotkeys globais
- [ ] Mini player mode
- [ ] Histórico de reprodução
- [ ] Sistema de favoritos
- [ ] Temas customizados
- [ ] App móvel

## 🤝 Contribuir

Contribuições são muito bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Áreas que precisam de ajuda

- Melhorar algoritmo de matching
- Adicionar testes unitários
- Otimizar performance do cache
- Design de ícones e UI
- Documentação e traduções

## 📝 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

Copyright (c) 2026 Daniel Calixto

## 👨‍💻 Autor

**Daniel Calixto**  
GitHub: [@Soldad17-u](https://github.com/Soldad17-u)

---

## ⭐ Star History

Se este projeto foi útil, considere dar uma estrela! ⭐

---

**Desenvolvido com ❤️ para quem quer ouvir música sem interrupções**

🎵 **Aproveite sua música!**