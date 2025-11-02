# LPC Avatar Builder - Render Deployment Guide

Complete guide for deploying the LPC Avatar Builder on Render with persistent disk storage and Git submodule support.

## Why Render?

Unlike Vercel's read-only filesystem and ephemeral storage, Render provides:

- ? **Persistent Disk Storage** - Store uploaded assets permanently
- ? **Git Submodules** - Automatically fetch LPC asset submodules
- ? **Long-Running Server** - Express.js server with full Node.js capabilities
- ? **File Uploads** - Support contributor asset uploads
- ? **Asset Routing** - Direct access to spritesheets and uploads
- ? **Health Checks** - Built-in monitoring and auto-restart
- ? **Environment Variables** - Flexible configuration

---

## Prerequisites

Before deploying, ensure you have:

1. **Render Account** - Sign up at https://render.com
2. **GitHub Repository** - Fork or clone this repository
3. **LPC Assets** - Configured as a Git submodule (already set up)

---

## Quick Deploy to Render

### Option 1: One-Click Deploy (Blueprint)

1. **Push to GitHub** with the `render.yaml` file included
2. **Visit Render Dashboard**: https://dashboard.render.com
3. **Click "New +"** ? **"Blueprint"**
4. **Connect your repository**
5. **Click "Apply"** - Render will automatically:
   - Create the web service
   - Attach a 10GB persistent disk
   - Initialize Git submodules
   - Install dependencies
   - Start the server

### Option 2: Manual Setup

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" ? "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: lpc-avatar-builder
   Region: Oregon (US West)
   Branch: master
   Runtime: Node
   Build Command: npm install && git submodule init && git submodule update --recursive
   Start Command: npm start
   ```

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=3000
   SPRITESHEETS_PATH=/opt/render/project/src/spritesheets
   PERSISTENT_DISK_PATH=/opt/render/project/data
   ```

4. **Add Persistent Disk**
   - In your service settings, go to "Disks"
   - Click "Add Disk"
   - Name: `lpc-assets`
   - Mount Path: `/opt/render/project/data`
   - Size: 10 GB (or more for large uploads)

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

---

## Git Submodule Setup

The LPC assets are managed as a Git submodule for easy updates and version control.

### Initial Setup (Already Configured)

The `.gitmodules` file is already configured:

```ini
[submodule "assets/lpc"]
    path = assets/lpc
    url = https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator.git
    branch = master
```

### Local Development

```bash
# Clone with submodules
git clone --recursive https://github.com/YOUR-USERNAME/YOUR-REPO.git

# Or if already cloned
git submodule init
git submodule update --recursive

# Update submodules to latest
git submodule update --remote --merge
```

### Update Submodule

```bash
# Update to latest LPC assets
npm run submodule:update

# Or manually
cd assets/lpc
git pull origin master
cd ../..
git add assets/lpc
git commit -m "Update LPC assets submodule"
git push
```

---

## Directory Structure

```
/opt/render/project/
??? src/                          # Your application code
?   ??? server.js                 # Express server
?   ??? modules/
?   ?   ??? avatar-builder/       # Avatar builder module
?   ??? content/
?   ?   ??? npcs/                 # NPC presets
?   ??? assets/
?   ?   ??? lpc/                  # LPC assets (Git submodule)
?   ?       ??? spritesheets/     # 99,233+ sprite files
?   ??? spritesheets/             # Symlink ? assets/lpc/spritesheets
?
??? data/                         # Persistent disk (10GB)
    ??? uploads/                  # User-uploaded assets
        ??? *.png                 # Uploaded sprites
        ??? *.meta.json           # Upload metadata
```

---

## API Endpoints

### Health Check
```
GET /health
```

Returns server health status, asset counts, and disk availability.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T12:00:00Z",
  "uptime": 3600,
  "checks": {
    "assets": "ok",
    "persistentDisk": "ok",
    "spriteCount": 99233
  }
}
```

### List Assets
```
GET /api/assets?category=body
```

List available sprites in a category.

### Get Categories
```
GET /api/categories
```

List all asset categories (body, hair, weapon, etc).

### Get NPC Presets
```
GET /api/npcs
```

List all NPC presets.

### Save NPC Preset
```
POST /api/npcs
Content-Type: application/json

{
  "name": "Village Guard",
  "sprite": { ... },
  "path": [[0,0], [5,5]],
  "behavior": "patrol"
}
```

### Upload Asset
```
POST /api/upload
Content-Type: multipart/form-data

Fields:
  - asset: File (PNG or JSON)
  - category: string
  - contributor: string
  - license: string (default: CC-BY-SA-3.0)
```

**Response:**
```json
{
  "success": true,
  "file": {
    "originalName": "new-hair-style.png",
    "filename": "asset-1234567890.png",
    "size": 12345,
    "uploadedAt": "2025-11-02T12:00:00Z"
  },
  "url": "/uploads/asset-1234567890.png"
}
```

### List Uploads
```
GET /api/uploads
```

List all uploaded assets with metadata.

### Build Avatar
```
POST /api/build-avatar
Content-Type: application/json

{
  "body": { "type": "male", "color": "light" },
  "hair": { "style": "short", "color": "brown" }
}
```

Validates avatar configuration (actual rendering happens client-side).

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port |
| `SPRITESHEETS_PATH` | `/opt/render/project/src/spritesheets` | Path to sprites |
| `PERSISTENT_DISK_PATH` | `/opt/render/project/data` | Persistent storage |
| `MAX_FILE_SIZE` | `5242880` | Max upload size (5MB) |
| `ALLOWED_FORMATS` | `.png,.json` | Allowed file types |

### Persistent Disk

The persistent disk at `/opt/render/project/data` stores:

- **User uploads** - Contributor-submitted sprites
- **Upload metadata** - JSON files with license info
- **Custom presets** - User-created NPC configurations

**Important:** Data persists across deployments and restarts.

---

## Accessing Your Deployment

Once deployed, your app will be available at:

```
https://lpc-avatar-builder.onrender.com
```

Or your custom domain if configured.

### Test Endpoints

```bash
# Health check
curl https://your-app.onrender.com/health

# List categories
curl https://your-app.onrender.com/api/categories

# Get NPCs
curl https://your-app.onrender.com/api/npcs

# Metrics
curl https://your-app.onrender.com/api/metrics
```

---

## Monitoring and Logs

### View Logs

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. View real-time structured logs

Example log entry:
```json
{
  "level": "info",
  "message": "LPC Avatar Builder server started",
  "timestamp": "2025-11-02T12:00:00Z",
  "port": 3000,
  "env": "production"
}
```

### Health Monitoring

Render automatically monitors `/health` endpoint:
- **Frequency:** Every 30 seconds
- **Timeout:** 30 seconds
- **Auto-restart:** On 3 consecutive failures

---

## Contributor Upload Workflow

### 1. Upload New Asset

Users can upload custom sprites via the API:

```bash
curl -X POST https://your-app.onrender.com/api/upload \
  -F "asset=@new-sprite.png" \
  -F "category=hair" \
  -F "contributor=ArtistName" \
  -F "license=CC-BY-SA-3.0"
```

### 2. Review Uploads

```bash
curl https://your-app.onrender.com/api/uploads
```

### 3. Access Uploaded Assets

```
https://your-app.onrender.com/uploads/asset-1234567890.png
```

### 4. Integration

Uploaded assets can be used in avatar configurations:

```javascript
const avatar = await avatarModule.buildAvatar({
  body: { type: 'male', color: 'light' },
  hair: { 
    style: 'custom',
    path: '/uploads/asset-1234567890.png'
  }
});
```

---

## Scaling

### Plan Options

| Plan | RAM | Disk | Price |
|------|-----|------|-------|
| Starter | 512 MB | 10 GB | $7/month |
| Standard | 2 GB | 50 GB | $25/month |
| Pro | 4 GB | 100 GB | $85/month |

### Performance Tips

1. **Enable Compression** - Already configured in `server.js`
2. **Add Caching Headers** - Static assets cached for 1 day
3. **Use CDN** - Consider Cloudflare for global distribution
4. **Optimize Images** - Compress sprites before upload
5. **Add Redis** - Cache frequently accessed data

---

## Troubleshooting

### Submodule Not Loading

**Symptom:** Assets directory is empty

**Solution:**
```bash
# In your local repository
git submodule update --init --recursive
git add .
git commit -m "Initialize submodules"
git push
```

### Disk Space Full

**Symptom:** Upload fails with "No space left on device"

**Solution:**
1. Go to Render Dashboard ? Service ? Disks
2. Increase disk size (can be done without downtime)
3. Or clean up old uploads via SSH

### Assets Not Found

**Symptom:** 404 errors on sprite requests

**Solution:**
Check symlink exists:
```bash
# SSH into Render
ls -la spritesheets
# Should show: spritesheets -> assets/lpc/spritesheets

# Recreate if missing
ln -s assets/lpc/spritesheets spritesheets
```

### Health Check Failing

**Symptom:** Service keeps restarting

**Solution:**
1. Check logs for errors
2. Verify `/health` endpoint responds
3. Ensure assets path is correct
4. Check disk is mounted properly

---

## Security

### Upload Validation

- **File Size:** Limited to 5MB (configurable)
- **File Type:** Only PNG and JSON allowed
- **Filename:** Sanitized and timestamped
- **Metadata:** Stored separately for license tracking

### Rate Limiting

Add rate limiting for production:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Custom Domain

1. **Add Domain in Render**
   - Go to Service ? Settings ? Custom Domains
   - Add your domain (e.g., `lpc.yourdomain.com`)

2. **Update DNS**
   - Add CNAME record: `lpc.yourdomain.com` ? `your-app.onrender.com`

3. **SSL**
   - Automatically provisioned by Render (Let's Encrypt)

---

## Backup Strategy

### Persistent Disk Backup

Render automatically backs up persistent disks daily.

Manual backup:
```bash
# SSH into Render
cd /opt/render/project/data
tar -czf backup-$(date +%Y%m%d).tar.gz uploads/

# Download via SCP or upload to S3
```

### Git Backup

All code and NPC presets are version-controlled in Git.

```bash
# Backup NPC presets
git add content/npcs/
git commit -m "Backup NPC presets"
git push
```

---

## Development vs Production

### Local Development

```bash
# Clone with submodules
git clone --recursive https://github.com/YOUR-REPO.git

# Initialize submodules
./scripts/init-submodules.sh

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Production Deployment

Automatic deployment on push to `master` branch.

```bash
git add .
git commit -m "Update feature"
git push origin master
# Render auto-deploys
```

---

## Support

### Resources

- **Render Docs:** https://render.com/docs
- **LPC Community:** https://lpc.opengameart.org
- **GitHub Issues:** https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator/issues

### Common Questions

**Q: How do I update LPC assets?**
A: Run `npm run submodule:update` and push to trigger redeploy.

**Q: Can I use a different asset repository?**
A: Yes, edit `.gitmodules` to point to your fork.

**Q: How much does it cost?**
A: Starter plan ($7/month) is sufficient for most use cases.

**Q: Can I self-host?**
A: Yes, the server runs anywhere Node.js is supported (Docker, VPS, etc).

---

## Next Steps

1. ? **Deploy to Render** - Use the blueprint or manual setup
2. ? **Test health endpoint** - Verify deployment
3. ? **Upload test asset** - Test contributor workflow
4. ? **Configure domain** - Set up custom domain (optional)
5. ? **Monitor logs** - Watch for any issues
6. ? **Share with community** - Get feedback and contributions

---

**?? Your LPC Avatar Builder is now production-ready on Render!**
