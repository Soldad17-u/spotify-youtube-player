# 🤝 Contributing to Spotify YouTube Player

First off, thank you for considering contributing! It's people like you that make this project great.

---

## 📜 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing](#testing)

---

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of:

- Age
- Body size
- Disability
- Ethnicity
- Gender identity
- Experience level
- Nationality
- Personal appearance
- Race
- Religion
- Sexual identity and orientation

### Our Standards

**Examples of encouraged behavior:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Examples of unacceptable behavior:**

- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of unacceptable behavior may be reported to daniel.calixto@cs.cruzeirodosul.edu.br.

---

## 🐛 How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report:**

1. Check the [existing issues](https://github.com/Soldad17-u/spotify-youtube-player/issues)
2. Check the [TODO.md](TODO.md) - it might be a known issue
3. Try the latest version

**How to submit a good bug report:**

Use the bug report template and include:

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Python/Node versions)
- Error messages/logs

### Suggesting Features

**Before suggesting a feature:**

1. Check [TODO.md](TODO.md) - might already be planned
2. Search existing issues

**How to submit a good feature request:**

- Clear title
- Detailed description
- Use cases
- Mockups (if UI-related)
- Implementation ideas (optional)

### Contributing Code

**Good first issues:**

Look for issues labeled:
- `good first issue`
- `help wanted`
- `beginner-friendly`

**Areas that need help:**

- Bug fixes
- Documentation
- Tests
- UI/UX improvements
- Performance optimization
- New features

---

## 🛠️ Development Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- Git
- VLC Media Player
- Code editor (VS Code recommended)

### Fork and Clone

```bash
# Fork the repo on GitHub, then:

git clone https://github.com/YOUR-USERNAME/spotify-youtube-player.git
cd spotify-youtube-player

# Add upstream remote
git remote add upstream https://github.com/Soldad17-u/spotify-youtube-player.git
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install dev dependencies
pip install pytest black flake8 mypy

# Copy environment file
cp .env.example .env
# Edit .env with your Spotify credentials

# Run
python main.py
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Web Setup

```bash
cd web

# Install
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Dev server
npm run dev
```

### Mobile Setup

```bash
cd mobile

# Install
npm install

# Start Expo
npm start
```

---

## 📐 Coding Standards

### Python (Backend)

**Style Guide:** PEP 8

**Tools:**
```bash
# Format code
black .

# Lint
flake8 .

# Type checking
mypy .
```

**Example:**
```python
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException


def search_tracks(query: str, limit: int = 20) -> Dict[str, Any]:
    """Search for tracks on Spotify.
    
    Args:
        query: Search query string
        limit: Maximum number of results (default: 20)
        
    Returns:
        Dictionary with search results
        
    Raises:
        HTTPException: If search fails
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Implementation
    return {"tracks": []}
```

### TypeScript/JavaScript

**Style Guide:** Airbnb + Prettier

**Tools:**
```bash
# Format
npm run format

# Lint
npm run lint

# Type check
npm run type-check
```

**Example:**
```typescript
interface Track {
  id: string;
  name: string;
  artist: string;
  duration: number;
}

const playTrack = async (trackId: string): Promise<void> => {
  try {
    const response = await api.post(`/play/${trackId}`);
    if (!response.ok) {
      throw new Error('Failed to play track');
    }
  } catch (error) {
    console.error('Play error:', error);
    throw error;
  }
};
```

### React Components

```tsx
import React, { useState, useEffect } from 'react';

interface PlayerProps {
  trackId: string;
  onPlay?: () => void;
}

const Player: React.FC<PlayerProps> = ({ trackId, onPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Effect logic
  }, [trackId]);

  return (
    <div className="player">
      {/* JSX */}
    </div>
  );
};

export default Player;
```

---

## 📝 Commit Guidelines

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semi colons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
# Feature
feat(player): add shuffle mode

# Bug fix
fix(api): correct track duration calculation

# Documentation
docs(readme): update installation instructions

# Refactor
refactor(cache): simplify cache management logic

# Performance
perf(search): optimize search algorithm

# Breaking change
feat(api)!: change endpoint structure

BREAKING CHANGE: API endpoints now use /v2 prefix
```

### Branch Naming

```
feature/description
fix/description
docs/description
refactor/description
```

**Examples:**
```
feature/add-lyrics-display
fix/player-crash-on-pause
docs/update-contributing-guide
refactor/simplify-api-calls
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make your changes**
   - Write code
   - Add tests
   - Update docs

4. **Test locally**
   ```bash
   # Backend tests
   cd backend
   pytest
   
   # Frontend tests
   cd frontend
   npm test
   
   # Lint
   npm run lint
   ```

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

### Submitting PR

1. Go to GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out PR template:
   - Description of changes
   - Related issues
   - Screenshots (if UI)
   - Checklist

### PR Template

```markdown
## Description

Brief description of what this PR does.

## Related Issues

Fixes #123
Related to #456

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tested locally
- [ ] Added new tests
- [ ] All tests passing

## Screenshots (if applicable)

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. Maintainer will review within 2-3 days
2. Address feedback
3. Update PR
4. Once approved, it will be merged

### After Merge

1. Delete your branch
   ```bash
   git branch -d feature/my-feature
   git push origin --delete feature/my-feature
   ```

2. Update your main
   ```bash
   git checkout main
   git pull upstream main
   ```

---

## 📁 Project Structure

```
spotify-youtube-player/
├── backend/              # Python FastAPI
│   ├── main.py           # Entry point
│   ├── music_matcher.py  # Core logic
│   ├── audio_player.py   # VLC wrapper
│   ├── equalizer.py      # Audio EQ
│   ├── visualizer.py     # FFT viz
│   └── tests/            # Backend tests
│
├── frontend/           # Electron app
│   ├── src/
│   ├── public/
│   └── electron.js
│
├── web/                # Next.js app
│   ├── app/
│   ├── components/
│   └── lib/
│
├── mobile/             # React Native
│   ├── src/
│   └── App.tsx
│
├── docs/               # Documentation
│   ├── deployment/
│   └── architecture/
│
├── README.md
├── TODO.md
├── CONTRIBUTING.md    # This file
└── LICENSE
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# With coverage
pytest --cov=.

# Specific test
pytest tests/test_player.py

# Watch mode
pytest-watch
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Writing Tests

**Backend (pytest):**
```python
import pytest
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_search():
    response = client.get("/search?q=test")
    assert response.status_code == 200
    assert "tracks" in response.json()
```

**Frontend (Jest):**
```typescript
import { render, screen } from '@testing-library/react';
import Player from './Player';

test('renders player', () => {
  render(<Player trackId="123" />);
  expect(screen.getByText('Play')).toBeInTheDocument();
});
```

---

## 💬 Communication

- **GitHub Issues**: Bug reports, feature requests
- **Pull Requests**: Code contributions
- **Discussions**: Questions, ideas
- **Email**: daniel.calixto@cs.cruzeirodosul.edu.br

---

## 🎉 Recognition

Contributors will be:
- Listed in README
- Credited in release notes
- Appreciated forever! ❤️

---

## 📚 Resources

- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [React Native Docs](https://reactnative.dev)
- [Git Workflow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ❓ Questions?

Don't hesitate to ask! Open an issue or reach out.

**Thank you for contributing!** 🚀