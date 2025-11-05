# LPC Avatar Builder - Koyeb Deployment Guide

Complete guide for deploying the LPC Avatar Builder on Koyeb with persistent storage and Git submodule support.

## Why Koyeb?

Koyeb provides an excellent platform with:

- ? **Free Tier** - Nano instances at no cost (2 services)
- ? **Persistent Volumes** - Store uploaded assets permanently
- ? **Git Submodules** - Automatically fetch LPC assets
- ? **Global CDN** - Fast content delivery worldwide
- ? **Auto-Scaling** - Scale based on traffic
- ? **Zero Downtime** - Rolling deployments
- ? **Free SSL** - Automatic HTTPS certificates
- ? **Docker Support** - Use Dockerfile or buildpacks

### Koyeb vs Render

| Feature | Koyeb | Render |
|---------|-------|--------|
| Free Tier | ? 2 services | ? Limited |
| Persistent Storage | ? Volumes (10GB) | ? Disk (10GB) |
| Git Submodules | ? Built-in | ? Built-in |
| Build Time | ~3-5 min | ~5-8 min |
| Cold Start | ~5 sec | ~10 sec |
| Global CDN | ? Yes | ? No |
| Price (Paid) | $5.50/mo | $7/mo |

---

## Quick Deploy to Koyeb

### Option 1: One-Click Deploy (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Koyeb deployment config"
   git push origin master
   ```

2. **Visit Koyeb**
   - Go to https://app.koyeb.com/services/new?step=importProject&type=git
   - Sign in or create account

3. **Connect Repository**
   - Click "GitHub" ? Authorize Koyeb
   - Select your repository
   - Branch: `master`

4. **Configure Service** (auto-detected from .koyeb/app.yaml)
   - Name: `lpc-avatar-builder`
   - Build command: `npm install && npm run submodule:init`
   - Run command: `npm start`
   - Port: `3000`

5. **Add Persistent Volume**
   - Enable "Persistent Volume"
   - Mount path: `/app/data`
   - Size: `10 GB`

6. **Deploy!**
   - Click "Deploy"
   - Wait 3-5 minutes
   - Your app will be live at: `https://lpc-avatar-builder-YOUR-ORG.koyeb.app`

### Option 2: Using Koyeb CLI

```bash
# Install Koyeb CLI
npm install -g @koyeb/cli

# Login
koyeb login

# Deploy from YAML
koyeb app init --config .koyeb/app.yaml

# Or deploy directly
koyeb service create lpc-avatar-builder \
  --git github.com/YOUR-USERNAME/YOUR-REPO \
  --git-branch master \
  --git-build-command "npm install && npm run submodule:init" \
  --git-run-command "npm start" \
  --ports 3000:http \
  --routes /:3000 \
  --instance-type nano \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --env SPRITESHEETS_PATH=/app/spritesheets \
  --env PERSISTENT_DISK_PATH=/app/data \
  --volume uploads:/app/data:10
```

---

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Ensure all files are committed
git status

# Generate package-lock.json (REQUIRED by Koyeb)
npm install --package-lock-only

# Initialize submodules locally (test)
git submodule init
git submodule update --recursive

# Test locally
npm install
npm start
curl http://localhost:3000/health

# Commit lockfile and push to GitHub
git add package-lock.json
git commit -m "Add package-lock.json for Koyeb"
git push origin master
```

?? **Critical:** Koyeb's buildpack requires a lockfile (`package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`) for reproducible builds. Without it, the build will fail.

### 2. Create Koyeb Account

1. Visit https://app.koyeb.com/auth/signup
2. Sign up with GitHub, Google, or Email
3. Verify your email
4. (Optional) Add payment method for paid instances

### 3. Import Project

1. **Go to**: https://app.koyeb.com/services/new?step=importProject&type=git
2. **Connect GitHub**:
   - Click "GitHub"
   - Authorize Koyeb app
   - Select your repository
3. **Configure Git**:
   - Repository: `YOUR-USERNAME/YOUR-REPO`
   - Branch: `master` (or `main`)
   - Auto-deploy: ? Enabled

### 4. Configure Build

Koyeb will auto-detect from `package.json`, or configure manually:

**Build Configuration:**
```
Builder: Buildpack (Node.js) or Dockerfile
Build command: npm install && npm run submodule:init
Run command: npm start
```

**Environment Variables:**
```
NODE_ENV=production
PORT=3000
SPRITESHEETS_PATH=/app/spritesheets
PERSISTENT_DISK_PATH=/app/data
MAX_FILE_SIZE=5242880
```

### 5. Configure Instance

**Instance Type:**
- **Nano** (Free tier): 512 MB RAM, 0.1 vCPU
- **Small**: 2 GB RAM, 1 vCPU ($5.50/mo)
- **Medium**: 4 GB RAM, 2 vCPU ($22/mo)
- **Large**: 8 GB RAM, 4 vCPU ($88/mo)

**Scaling:**
```
Min instances: 1
Max instances: 1 (or more for auto-scaling)
```

**Region** (choose closest to users):
```
- fra (Frankfurt, Germany) - Europe
- was (Washington DC, USA) - North America East
- sin (Singapore) - Asia Pacific
```

### 6. Add Persistent Volume

**Critical for storing uploads!**

1. In service settings, find "Persistent Storage"
2. Click "Add Volume"
3. Configure:
   ```
   Name: uploads
   Mount path: /app/data
   Size: 10 GB (or more)
   ```
4. Save

### 7. Configure Health Check

Auto-configured from `.koyeb/app.yaml`, or set manually:

```
Protocol: HTTP
Path: /health
Port: 3000
Grace period: 60 seconds
Interval: 30 seconds
Timeout: 10 seconds
```

### 8. Deploy

1. Review all settings
2. Click "Deploy"
3. Monitor build logs in real-time
4. Wait for "Healthy" status (~5 minutes)

---

## Post-Deployment

### Verify Deployment

```bash
# Get your app URL
export KOYEB_URL="https://lpc-avatar-builder-YOUR-ORG.koyeb.app"

# Health check
curl $KOYEB_URL/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "uptime": 123,
#   "checks": {
#     "assets": "ok",
#     "persistentDisk": "ok",
#     "spriteCount": 99233
#   }
# }

# Test API
curl $KOYEB_URL/api/categories
curl $KOYEB_URL/api/npcs

# Test upload
curl -X POST $KOYEB_URL/api/upload \
  -F "asset=@test-sprite.png" \
  -F "category=test" \
  -F "contributor=TestUser"
```

### Access Your App

**Main URL:**
```
https://lpc-avatar-builder-YOUR-ORG.koyeb.app
```

**Key Endpoints:**
- Homepage: `/`
- Avatar Builder Demo: `/modules/avatar-builder/demo.html`
- Health Check: `/health`
- API Docs: `/api/categories`

### View Logs

**Via Web Dashboard:**
1. Go to https://app.koyeb.com
2. Select your service
3. Click "Logs" tab
4. View real-time structured logs

**Via CLI:**
```bash
koyeb service logs lpc-avatar-builder --follow
```

### Monitor Metrics

**Web Dashboard:**
- CPU usage
- Memory usage
- Network traffic
- Request rate
- Response times

---

## Configuration

### Environment Variables

Set in Koyeb dashboard or via `.koyeb/app.yaml`:

```yaml
env:
  - name: NODE_ENV
    value: production
  - name: PORT
    value: "3000"
  - name: SPRITESHEETS_PATH
    value: /app/spritesheets
  - name: PERSISTENT_DISK_PATH
    value: /app/data
  - name: MAX_FILE_SIZE
    value: "5242880"
```

### Persistent Volumes

**Directory Structure:**
```
/app/
??? data/                    # Persistent volume
?   ??? uploads/            # User-uploaded assets
?       ??? *.png
?       ??? *.meta.json
??? spritesheets/           # Symlink ? assets/lpc/spritesheets
??? assets/
    ??? lpc/                # Git submodule (99,233 sprites)
```

**Volume Features:**
- Persists across deployments
- Survives instance restarts
- Backed up automatically
- Can be resized without downtime

---

## Git Submodules on Koyeb

### How It Works

1. **Build Phase**: Koyeb clones your repo
2. **Submodule Init**: `npm run submodule:init` runs automatically
3. **Symlink Creation**: Server creates `spritesheets` ? `assets/lpc/spritesheets`
4. **Asset Serving**: Express serves files from `/spritesheets/`

### Verify Submodules Loaded

Check build logs for:
```
Submodule 'assets/lpc' (https://github.com/...) registered
Cloning into '/app/assets/lpc'...
Submodule path 'assets/lpc': checked out '...'
```

### Update Submodules

To pull latest LPC assets:

```bash
# Locally
git submodule update --remote --merge
git add assets/lpc
git commit -m "Update LPC assets to latest"
git push

# Koyeb will auto-deploy with new assets
```

---

## Custom Domain

### Add Your Domain

1. **In Koyeb Dashboard:**
   - Service ? Settings ? Domains
   - Click "Add Domain"
   - Enter: `lpc.yourdomain.com`

2. **Update DNS:**
   - Add CNAME record:
     ```
     lpc.yourdomain.com ? YOUR-APP.koyeb.app
     ```
   - Or use Koyeb's nameservers for full management

3. **SSL Certificate:**
   - Automatically provisioned (Let's Encrypt)
   - Renews automatically
   - Zero configuration needed

### Verify SSL

```bash
curl -I https://lpc.yourdomain.com
# Should include: HTTP/2 200
```

---

## Scaling & Performance

### Auto-Scaling

Edit `.koyeb/app.yaml`:
```yaml
scaling:
  min: 1
  max: 5  # Scale up to 5 instances
```

**Triggers:**
- CPU > 80%
- Memory > 85%
- Request queue depth

### Performance Tips

1. **Enable CDN** (automatic on Koyeb)
2. **Use Compression** (already enabled in server.js)
3. **Cache Assets** (already configured)
4. **Optimize Images** (compress sprites before upload)
5. **Add Redis** (optional, for session caching)

### Instance Sizing

**Nano (Free):**
- Good for: Development, testing, low traffic
- Limits: 512 MB RAM, 0.1 vCPU
- Concurrent users: ~10-50

**Small ($5.50/mo):**
- Good for: Production, moderate traffic
- Limits: 2 GB RAM, 1 vCPU
- Concurrent users: ~100-500

**Medium ($22/mo):**
- Good for: High traffic, multiple regions
- Limits: 4 GB RAM, 2 vCPU
- Concurrent users: ~500-2000

---

## Troubleshooting

### Build Fails

**Check build logs** for common issues:

1. **Submodule not cloning:**
   ```bash
   # Ensure .gitmodules is committed
   git add .gitmodules
   git commit -m "Add submodules config"
   git push
   ```

2. **npm install fails:**
   ```bash
   # Check package.json is valid
   npm install  # Test locally first
   ```

3. **Build timeout:**
   - Increase build timeout in settings
   - Or reduce dependencies

### Health Check Failing

**Symptoms:** Service shows "Unhealthy"

**Solutions:**

1. **Check logs:**
   ```bash
   koyeb service logs lpc-avatar-builder
   ```

2. **Verify health endpoint:**
   ```bash
   # SSH into instance (if available)
   curl http://localhost:3000/health
   ```

3. **Common fixes:**
   - Increase grace period (60s ? 90s)
   - Check PORT environment variable
   - Verify server is binding to 0.0.0.0

### Assets Not Loading

**Symptoms:** 404 errors on sprite requests

**Solutions:**

1. **Check submodules initialized:**
   - View build logs for submodule output
   - Ensure `npm run submodule:init` succeeded

2. **Verify symlink:**
   ```javascript
   // In server.js logs, check for:
   "Created symlink: spritesheets -> assets/lpc/spritesheets"
   ```

3. **Check paths:**
   ```bash
   # Correct paths on Koyeb:
   /app/assets/lpc/spritesheets/  # Actual files
   /app/spritesheets/             # Symlink
   ```

### Upload Fails

**Symptoms:** Upload returns 500 error

**Solutions:**

1. **Check volume mounted:**
   - Dashboard ? Service ? Volumes
   - Ensure `/app/data` is mounted

2. **Verify permissions:**
   - Logs should show: "Created directory: /app/data/uploads"

3. **Check disk space:**
   - Dashboard ? Service ? Metrics
   - Monitor volume usage

---

## Cost Optimization

### Free Tier Usage

**Koyeb Free Tier Includes:**
- 2 nano instances
- $5.50/month credit
- No credit card required

**Optimize for free tier:**
```yaml
instance:
  type: nano  # Use free instance

scaling:
  min: 1  # Single instance
  max: 1  # No auto-scaling

volumes:
  - size: 10  # Minimum volume size
```

### Monitor Usage

**Dashboard ? Billing:**
- View current usage
- Set budget alerts
- Track costs per service

---

## Backup & Disaster Recovery

### Automatic Backups

Koyeb automatically backs up:
- ? Persistent volumes (daily)
- ? Service configuration
- ? Environment variables

### Manual Backup

**Backup uploaded assets:**
```bash
# Via Koyeb CLI (if available)
koyeb volume backup uploads

# Or download via API
curl https://YOUR-APP.koyeb.app/api/uploads > backups/uploads.json

# Download actual files
for file in $(cat backups/uploads.json | jq -r '.uploads[].filename'); do
  curl -O https://YOUR-APP.koyeb.app/uploads/$file
done
```

### Restore from Backup

1. **Create new volume** from backup
2. **Update service** to use new volume
3. **Redeploy**

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Koyeb

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive
      
      - name: Deploy to Koyeb
        run: |
          curl -X POST https://app.koyeb.com/v1/deployments \
            -H "Authorization: Bearer ${{ secrets.KOYEB_TOKEN }}" \
            -d '{"service": "lpc-avatar-builder"}'
```

---

## Comparison: Koyeb vs Other Platforms

| Feature | Koyeb | Render | Vercel | Railway |
|---------|-------|--------|--------|---------|
| Free Tier | ? 2 services | ? Limited | ? Hobby | ? $5 credit |
| Persistent Storage | ? Volumes | ? Disks | ? No | ? Volumes |
| Git Submodules | ? Yes | ? Yes | ?? Limited | ? Yes |
| Global CDN | ? Yes | ? No | ? Yes | ? No |
| Build Time | ~3-5 min | ~5-8 min | ~2-3 min | ~3-5 min |
| Cold Start | ~5s | ~10s | ~2s | ~5s |
| Min Price | $5.50/mo | $7/mo | $20/mo | $5/mo |

**Recommendation:** Koyeb is ideal for this project! ?

---

## Quick Reference

### Koyeb URLs
- Dashboard: https://app.koyeb.com
- Docs: https://www.koyeb.com/docs
- CLI: https://www.koyeb.com/docs/cli
- Status: https://status.koyeb.com

### Common Commands

```bash
# View services
koyeb service list

# View logs
koyeb service logs lpc-avatar-builder --follow

# Restart service
koyeb service restart lpc-avatar-builder

# Update service
koyeb service update lpc-avatar-builder --env NODE_ENV=production

# View volumes
koyeb volume list
```

---

## Next Steps

1. ? **Deploy Now**: https://app.koyeb.com/services/new?step=importProject&type=git
2. ? **Test Endpoints**: Use RENDER_DEPLOYMENT_CHECKLIST.md (works for Koyeb too)
3. ? **Add Custom Domain**: Configure in Koyeb dashboard
4. ? **Monitor**: Set up alerts and metrics
5. ? **Share**: Post your deployment in LPC community!

---

## Support

### Koyeb Support
- Docs: https://www.koyeb.com/docs
- Discord: https://discord.gg/koyeb
- Email: support@koyeb.com

### Project Support
- GitHub Issues: https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator/issues
- LPC Community: https://lpc.opengameart.org

---

**?? Ready to deploy on Koyeb!**

Your LPC Avatar Builder will be live in ~5 minutes.

Start here: https://app.koyeb.com/services/new?step=importProject&type=git
