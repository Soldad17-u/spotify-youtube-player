# 📋 TODO List - Spotify YouTube Player

## ✅ Concluído

- [x] Backend FastAPI completo
- [x] Sistema de matching Spotify → YouTube
- [x] Cache inteligente com SQLite
- [x] Player engine com VLC
- [x] Frontend Electron com interface moderna
- [x] Busca de músicas
- [x] Reprodução com controles
- [x] Sistema de playlists
- [x] Controle de volume
- [x] Fila de reprodução
- [x] Documentação completa

## 🚧 Em Desenvolvimento

- [ ] Progress bar de reprodução
- [ ] Shuffle e repeat
- [ ] Botão de adicionar à fila
- [ ] Seek/scrubbing na timeline

## 📅 Próximas Features

### Alta Prioridade

- [ ] **Auto-play próxima música** - quando acabar, tocar próxima da fila automaticamente
- [ ] **Letras sincronizadas** - integração com API de letras
- [ ] **Equalizer** - controles de graves, médios, agudos
- [ ] **Hotkeys globais** - Play/pause, next, prev com teclado
- [ ] **Notificações** - mostrar música atual quando mudar
- [ ] **Mini player mode** - modo compacto flutuante

### Média Prioridade

- [ ] **Download de playlists completas** - pré-cache de playlist inteira
- [ ] **Histórico de reprodução** - ver músicas tocadas recentemente
- [ ] **Favoritos** - sistema de curtir músicas
- [ ] **Temas customizados** - dark/light themes, cores personalizadas
- [ ] **Importar biblioteca local** - tocar MP3s locais também
- [ ] **Crossfade** - transição suave entre músicas
- [ ] **Normalização de volume** - ReplayGain

### Baixa Prioridade

- [ ] **Scrobbling Last.fm** - registrar músicas tocadas
- [ ] **Compartilhamento social** - compartilhar música atual
- [ ] **Visualizador de áudio** - spectrum analyzer animado
- [ ] **Sleep timer** - desligar após X minutos
- [ ] **Filtros de busca** - por ano, gênero, etc
- [ ] **Exportar playlists** - salvar como M3U/PLS

## 🔧 Melhorias Técnicas

### Performance

- [ ] **Pre-loading** - carregar próxima música em background
- [ ] **Streaming progressivo** - começar a tocar enquanto baixa
- [ ] **Compressão de cache** - reduzir espaço em disco
- [ ] **Limpeza automática de cache** - remover músicas antigas
- [ ] **Multi-threading** - download paralelo de múltiplas músicas

### Qualidade

- [ ] **Fallback sources** - tentar SoundCloud se YouTube falhar
- [ ] **Matching aprimorado** - usar audio fingerprinting
- [ ] **Detecção de qualidade** - escolher melhor bitrate disponível
- [ ] **Validação de integridade** - verificar se download foi completo

### Experiência do Usuário

- [ ] **Onboarding** - tutorial na primeira vez
- [ ] **Atalhos visuais** - dicas de teclado na interface
- [ ] **Estado persistente** - lembrar última música, volume, etc
- [ ] **Configurações avançadas** - pasta de cache, qualidade, etc
- [ ] **Modo offline** - indicar quando sem internet

## 🐛 Bugs Conhecidos

- [ ] Player às vezes não retoma após pause
- [ ] Volume slider não sincroniza em tempo real
- [ ] Primeira busca pode ser lenta (autenticação Spotify)
- [ ] Cache stats não atualizam automaticamente
- [ ] Playlists muito grandes (>100 músicas) não carregam todas

## 🎨 Design

- [ ] Animações de transição mais suaves
- [ ] Loading states mais informativos
- [ ] Feedback visual ao adicionar à fila
- [ ] Indicador de música atual na lista
- [ ] Drag and drop para reordenar fila

## 📱 Plataformas

- [ ] **App móvel** - React Native ou Flutter
- [ ] **Web player** - versão browser pura
- [ ] **CLI** - interface de linha de comando
- [ ] **API pública** - permitir integrações externas

## 🔐 Segurança & Legal

- [ ] Rate limiting para evitar abuse
- [ ] Criptografia de credenciais
- [ ] Logs de auditoria
- [ ] Disclaimer legal mais claro
- [ ] Opção de usar apenas fontes legítimas

## 📊 Analytics

- [ ] Estatísticas de uso (local)
- [ ] Músicas mais tocadas
- [ ] Tempo total de escuta
- [ ] Artistas favoritos
- [ ] Gráficos de escuta ao longo do tempo

---

## 💡 Ideias Malucas

- [ ] **AI DJ** - criar playlists automaticamente baseado em mood
- [ ] **Integração com trading bot** - tocar música baseado em performance do bot 😄
- [ ] **Modo party** - sincronizar reprodução entre múltiplos dispositivos
- [ ] **Reconhecimento de voz** - comandos tipo "tocar rock dos anos 80"
- [ ] **Integração com smart home** - controlar via Alexa/Google Home

---

**Contribuições são bem-vindas!** Se quiser implementar alguma feature da lista, crie uma branch e abra um PR.