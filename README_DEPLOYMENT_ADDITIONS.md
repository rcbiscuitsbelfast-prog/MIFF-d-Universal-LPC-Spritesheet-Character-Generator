# Deployment Additions for README.md

Add these sections to the main README.md to document deployment capabilities.

---

## ?? Deployment on Render

This project is production-ready for deployment on [Render](https://render.com) with persistent disk storage and Git submodule support.

### Why Render?

Unlike Vercel's read-only filesystem, Render provides:
- ? **Persistent Disk** - Store uploaded assets permanently
- ? **Git Submodules** - Automatic LPC asset fetching
- ? **Long-Running Server** - Full Node.js/Express support
- ? **File Uploads** - Accept contributor submissions
- ? **Health Monitoring** - Automatic restart on failure

### Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or manually:

1. **Fork this repository**
2. **Sign up at** [render.com](https://render.com)
3. **Create New Web Service**
   - Connect your GitHub repository
   - Runtime: Node
   - Build Command: `npm install && git submodule init && git submodule update --recursive`
   - Start Command: `npm start`
4. **Add Persistent Disk**
   - Mount Path: `/opt/render/project/data`
   - Size: 10 GB
5. **Deploy!**

Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## ?? Avatar Builder Module

A modular character system for building and managing LPC character sprites.

### Features

- ?? **Layered Composition** - Composite body + clothes + hair + weapon
- ??? **99,233+ Sprites** - Full LPC asset library support
- ? **Live Preview** - Interactive character customization UI
- ?? **NPC System** - Preset-based NPC spawning with patrol paths
- ?? **MIFF Module** - Clean API for game engine integration
- ?? **Cloud Upload** - Contributor asset submission support

### Quick Start

```javascript
// Initialize module
const avatarModule = MIFF.AvatarBuilder.create();
await avatarModule.init();

// Build character
const hero = await avatarModule.buildAvatar({
  body: { type: 'male', color: 'light' },
  hair: { style: 'short', color: 'brown' },
  weapon: 'weapon/sword/longsword.png'
});

// Get animation frame
const frame = avatarModule.getFrame(hero, 'walk', 'down', 0);
ctx.drawImage(frame, x, y);
```

Full API documentation: [modules/avatar-builder/README.md](modules/avatar-builder/README.md)

---

## ?? API Endpoints

When deployed, the following endpoints are available:

### Health & Monitoring
- `GET /health` - Server health status
- `GET /api/metrics` - Performance metrics

### Assets
- `GET /api/categories` - List asset categories
- `GET /api/assets?category=body` - List assets in category
- `GET /spritesheets/{path}` - Access sprite files

### NPCs
- `GET /api/npcs` - List NPC presets
- `POST /api/npcs` - Create NPC preset

### Uploads
- `POST /api/upload` - Upload contributor asset
- `GET /api/uploads` - List uploaded assets
- `GET /uploads/{filename}` - Access uploaded file

Full API documentation: [DEPLOYMENT.md#api-endpoints](DEPLOYMENT.md#api-endpoints)

---

## ?? Configuration

### Environment Variables

```bash
NODE_ENV=production
PORT=3000
SPRITESHEETS_PATH=/opt/render/project/src/spritesheets
PERSISTENT_DISK_PATH=/opt/render/project/data
MAX_FILE_SIZE=5242880
```

See [.env.example](.env.example) for all options.

### Git Submodules

LPC assets are managed as a Git submodule:

```bash
# Initialize submodules
git submodule init
git submodule update --recursive

# Update to latest assets
git submodule update --remote --merge
```

---

## ?? Docker Deployment

Alternative deployment using Docker:

```bash
# Build image
docker build -t lpc-avatar-builder .

# Run container
docker run -p 3000:3000 -v $(pwd)/data:/data lpc-avatar-builder

# Or use docker-compose
docker-compose up -d
```

---

## ?? Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[RENDER_DEPLOYMENT_CHECKLIST.md](RENDER_DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[modules/avatar-builder/README.md](modules/avatar-builder/README.md)** - Avatar Builder API
- **[modules/avatar-builder/QUICK_START.md](modules/avatar-builder/QUICK_START.md)** - 5-minute guide
- **[modules/avatar-builder/INTEGRATION_GUIDE.md](modules/avatar-builder/INTEGRATION_GUIDE.md)** - Integration walkthrough

---

## ?? Contributing Assets

### Upload via API

```bash
curl -X POST https://your-app.onrender.com/api/upload \
  -F "asset=@your-sprite.png" \
  -F "category=hair" \
  -F "contributor=YourName" \
  -F "license=CC-BY-SA-3.0"
```

### Via Pull Request

1. Add your sprite to appropriate category in `spritesheets/`
2. Update `CREDITS.csv` with attribution
3. Submit pull request

All contributions must follow LPC licensing requirements.

---

## ?? Project Stats

- **Module Size:** 108KB
- **Lines of Code:** 1,641 (module) + server
- **Sprites Supported:** 99,233+
- **NPC Presets:** 3 (extendable)
- **Dependencies:** 4 (production)

---

## ?? Live Demo

Visit the live deployment: [https://lpc-avatar-builder.onrender.com](https://lpc-avatar-builder.onrender.com)

*Note: Replace with your actual deployed URL*

---
