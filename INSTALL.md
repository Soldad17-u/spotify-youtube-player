# 📦 Guia de Instalação Completo

## Pré-requisitos

### 1. Python 3.9+

**Windows:**
```bash
# Download de: https://www.python.org/downloads/
# Durante instalação, marque "Add Python to PATH"

# Verifique:
python --version
```

**Linux:**
```bash
sudo apt update
sudo apt install python3 python3-pip
python3 --version
```

**macOS:**
```bash
brew install python3
python3 --version
```

### 2. Node.js 16+

**Windows/macOS:**
- Download de: https://nodejs.org/

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

### 3. VLC Media Player

**Windows:**
- Download de: https://www.videolan.org/vlc/
- Instalar versão 64-bit

**Linux:**
```bash
sudo apt install vlc
```

**macOS:**
```bash
brew install vlc
```

### 4. FFmpeg

**Windows:**
- Download de: https://ffmpeg.org/download.html
- Extrair e adicionar ao PATH

**Linux:**
```bash
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

---

## 🚀 Instalação do Projeto

### Passo 1: Clone o repositório

```bash
git clone https://github.com/Soldad17-u/spotify-youtube-player.git
cd spotify-youtube-player
```

### Passo 2: Configure o Backend

```bash
cd backend

# Crie ambiente virtual (recomendado)
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Instale dependências
pip install -r requirements.txt
```

### Passo 3: Configure Credenciais do Spotify

1. Acesse: https://developer.spotify.com/dashboard
2. Faça login com sua conta Spotify
3. Clique em "Create app"
4. Preencha:
   - **App name:** Spotify YouTube Player
   - **App description:** Personal music player
   - **Redirect URI:** `http://localhost:8888/callback`
5. Copie **Client ID** e **Client Secret**

6. Crie arquivo `.env` na pasta `backend/`:

```bash
cp .env.example .env
```

7. Edite `.env` e adicione suas credenciais:

```env
SPOTIFY_CLIENT_ID=cole_seu_client_id_aqui
SPOTIFY_CLIENT_SECRET=cole_seu_client_secret_aqui
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
```

### Passo 4: Configure o Frontend

```bash
cd ../frontend
npm install
```

---

## ▶️ Executar o Aplicativo

### Terminal 1 - Backend (deixar rodando)

```bash
cd backend

# Ative ambiente virtual se não estiver ativo
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate

python main.py
```

Você verá:
```
🎵 Starting Spotify YouTube Player API...
🔗 Server: http://localhost:8000
📚 Docs: http://localhost:8000/docs
INFO:     Started server process
```

### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

O aplicativo Electron abrirá automaticamente!

---

## ✅ Teste a Instalação

1. **Verifique o backend:**
   - Abra navegador em: http://localhost:8000/docs
   - Você verá a interface Swagger da API

2. **Teste no aplicativo:**
   - Busque por uma música (ex: "Bohemian Rhapsody")
   - Clique para tocar
   - **Primeira vez:** pode demorar 10-30 segundos (baixando do YouTube)
   - **Próximas vezes:** toca instantaneamente (cache)

3. **Verifique suas playlists:**
   - Clique em "Playlists" na barra lateral
   - Suas playlists do Spotify devem aparecer

---

## 🐛 Solução de Problemas

### Erro: "VLC not found"

**Windows:**
- Certifique-se que VLC está instalado
- Reinstale python-vlc: `pip install --force-reinstall python-vlc`

**Linux:**
```bash
sudo apt install vlc python3-vlc
```

### Erro: "FFmpeg not found"

```bash
# Verifique se está instalado:
ffmpeg -version

# Se não, instale conforme instruções acima
```

### Erro: "Could not find matching YouTube video"

- Música pode não estar disponível no YouTube
- Tente outra música
- Algoritmo de matching pode precisar ajustes

### Backend não inicia

```bash
# Verifique se todas as dependências foram instaladas:
cd backend
pip install -r requirements.txt --force-reinstall

# Verifique se porta 8000 está livre:
# Windows:
netstat -ano | findstr :8000
# Linux/macOS:
lsof -i :8000
```

### Frontend não conecta ao backend

- Verifique se backend está rodando (Terminal 1)
- Confirme que está acessível em: http://localhost:8000
- Verifique firewall/antivírus

---

## 🎯 Próximos Passos

- Explore as playlists do Spotify
- Teste diferentes buscas
- Ajuste o volume
- Confira o cache crescendo (estatísticas na barra lateral)

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs no terminal do backend
2. Abra DevTools no Electron (View > Toggle Developer Tools)
3. Crie uma issue no GitHub com logs de erro

Bom uso! 🎵