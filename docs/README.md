# 📸 Screenshots & Documentação

## Gerar Preview da Interface

```bash
# Instalar dependência
pip install pillow

# Gerar preview
python docs/generate_preview.py
```

O script gerará uma imagem em `docs/screenshots/ui-preview.png`

## Screenshots Reais

Para adicionar screenshots reais do app rodando:

1. Execute o aplicativo
2. Tire screenshots (Print Screen)
3. Salve em `docs/screenshots/`
4. Adicione ao README.md:

```markdown
![Busca](docs/screenshots/search.png)
![Player](docs/screenshots/player.png)
![Playlists](docs/screenshots/playlists.png)
```

## Estrutura de Screenshots

```
docs/
├── screenshots/
│   ├── ui-preview.png        # Preview gerado automaticamente
│   ├── search.png           # Screenshot da busca
│   ├── playing.png          # Player tocando música
│   ├── playlists.png        # Visualização de playlists
│   └── queue.png            # Fila de reprodução
├── generate_preview.py      # Script gerador
└── README.md               # Este arquivo
```

## Gravação de Vídeo Demo

Para criar um vídeo demo:

1. Use OBS Studio ou similar
2. Grave workflow típico:
   - Buscar música
   - Reproduzir
   - Navegar playlists
   - Adicionar à fila
   - Controles de volume
3. Exporte como GIF ou MP4
4. Adicione ao README principal

## Badges

Adicione ao README.md:

```markdown
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.9+-blue)
![Node](https://img.shields.io/badge/node-16+-green)
![Status](https://img.shields.io/badge/status-production--ready-success)
```