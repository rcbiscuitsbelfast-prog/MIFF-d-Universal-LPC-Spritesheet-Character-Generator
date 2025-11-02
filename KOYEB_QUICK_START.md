# ?? Koyeb Quick Start - LPC Avatar Builder

Deploy your LPC Avatar Builder to Koyeb in 5 minutes!

## Option 1: One-Click Deploy (Fastest)

### 1. Prepare Repository

```bash
# Generate package-lock.json (REQUIRED by Koyeb)
npm install --package-lock-only

# Ensure everything is committed
git add package-lock.json package.json
git add .
git commit -m "Ready for Koyeb deployment"
git push origin master
```

?? **Important:** Koyeb requires `package-lock.json` for reproducible builds. Make sure it's committed!

### 2. Deploy to Koyeb

**Click here to deploy:** ??

https://app.koyeb.com/services/new?step=importProject&type=git

### 3. Configure in Koyeb Dashboard

**Step 1: Select Repository**
- Connect GitHub
- Choose your repository
- Branch: `master`

**Step 2: Build Configuration** (auto-detected)
```
Build command: npm install && npm run submodule:init
Run command: npm start
```

**Step 3: Instance & Scaling**
```
Instance type: nano (Free tier)
Regions: fra (Frankfurt)
Min instances: 1
Max instances: 1
```

**Step 4: Environment Variables**
```
NODE_ENV=production
PORT=3000
SPRITESHEETS_PATH=/app/spritesheets
PERSISTENT_DISK_PATH=/app/data
```

**Step 5: Persistent Volume**
```
? Enable Persistent Volume
Name: uploads
Mount path: /app/data
Size: 10 GB
```

**Step 6: Health Check**
```
Protocol: HTTP
Path: /health
Port: 3000
Grace period: 60s
```

### 4. Deploy!

Click "Deploy" ? Wait ~3-5 minutes ? Your app is live! ??

---

## Option 2: Using Koyeb CLI

### Install CLI

```bash
npm install -g @koyeb/cli
```

### Login

```bash
koyeb login
```

### Deploy

```bash
# Quick deploy
koyeb app init --config .koyeb/app.yaml

# Or manually
koyeb service create lpc-avatar-builder \
  --git github.com/YOUR-USERNAME/YOUR-REPO \
  --git-branch master \
  --git-build-command "npm install && npm run submodule:init" \
  --git-run-command "npm start" \
  --ports 3000:http \
  --routes /:3000 \
  --instance-type nano \
  --regions fra \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --env SPRITESHEETS_PATH=/app/spritesheets \
  --env PERSISTENT_DISK_PATH=/app/data \
  --volume uploads:/app/data:10
```

---

## Verify Deployment

### Get Your App URL

Your app will be available at:
```
https://lpc-avatar-builder-YOUR-ORG.koyeb.app
```

Find it in: Koyeb Dashboard ? Your Service ? Endpoint

### Test Endpoints

```bash
# Save your URL
export APP_URL="https://lpc-avatar-builder-YOUR-ORG.koyeb.app"

# Health check
curl $APP_URL/health
# Expected: {"status":"healthy",...}

# List categories
curl $APP_URL/api/categories
# Expected: {"categories":["body","hair","weapon",...]}

# List NPCs
curl $APP_URL/api/npcs
# Expected: {"npcs":[...]}

# Test upload
curl -X POST $APP_URL/api/upload \
  -F "asset=@test-sprite.png" \
  -F "category=test" \
  -F "contributor=YourName"
# Expected: {"success":true,...}
```

### Open in Browser

Visit these URLs:

- **Homepage:** `https://your-app.koyeb.app/`
- **Avatar Builder Demo:** `https://your-app.koyeb.app/modules/avatar-builder/demo.html`
- **Health Check:** `https://your-app.koyeb.app/health`

---

## Troubleshooting

### Build Failed?

**Check build logs:**
1. Koyeb Dashboard ? Your Service ? Logs
2. Look for errors in build phase

**Common issues:**

? **Submodule not loading:**
```bash
# Ensure .gitmodules is committed
git add .gitmodules
git commit -m "Add submodules"
git push
```

? **npm install fails:**
```bash
# Test locally first
npm install
# If successful, push package-lock.json
git add package-lock.json
git push
```

### Health Check Failing?

**Solution 1: Increase grace period**
- Dashboard ? Service ? Settings ? Health Check
- Grace period: 60s ? 90s

**Solution 2: Check logs**
```bash
koyeb service logs lpc-avatar-builder --follow
```

Look for:
- Server started successfully
- Port 3000 bound
- Health endpoint responding

### Assets Not Loading?

**Verify submodules initialized:**

Check build logs for:
```
Submodule 'assets/lpc' registered
Cloning into '/app/assets/lpc'...
```

**Test asset access:**
```bash
curl $APP_URL/spritesheets/body/bodies/male/walk/light.png
# Should return image (not 404)
```

### Upload Fails?

**Check persistent volume:**
1. Dashboard ? Service ? Volumes
2. Ensure volume is mounted at `/app/data`
3. Check logs for permission errors

---

## Next Steps

### 1. Test Character Builder

Open the demo:
```
https://your-app.koyeb.app/modules/avatar-builder/demo.html
```

- Try customizing a character
- Test different animations
- Save and load characters
- Export spritesheet

### 2. Add Custom Domain

**In Koyeb Dashboard:**
1. Service ? Settings ? Domains
2. Add domain: `lpc.yourdomain.com`
3. Update DNS with CNAME record
4. SSL automatically provisioned!

### 3. Monitor Performance

**Dashboard ? Service:**
- View real-time metrics
- CPU and memory usage
- Request rate
- Response times

### 4. Share with Community

Post your deployment:
- LPC Community: https://lpc.opengameart.org
- GitHub Discussions
- Social media

---

## Cost & Limits

### Free Tier (Nano Instance)

**What's included:**
- ? 512 MB RAM
- ? 0.1 vCPU
- ? 10 GB persistent volume
- ? Free SSL
- ? Global CDN
- ? Auto-deploy from Git

**Limits:**
- 2 free services max
- Good for ~50 concurrent users
- Perfect for development/testing

### Upgrade to Paid (Optional)

**Small Instance - $5.50/month:**
- 2 GB RAM
- 1 vCPU
- Better for production traffic
- ~500 concurrent users

---

## Quick Reference

### Koyeb URLs
- **Deploy:** https://app.koyeb.com/services/new?step=importProject&type=git
- **Dashboard:** https://app.koyeb.com
- **Docs:** https://www.koyeb.com/docs
- **Status:** https://status.koyeb.com

### CLI Commands
```bash
# View services
koyeb service list

# View logs
koyeb service logs lpc-avatar-builder

# Restart service
koyeb service restart lpc-avatar-builder

# View volumes
koyeb volume list
```

### Support
- Discord: https://discord.gg/koyeb
- Docs: https://www.koyeb.com/docs
- Email: support@koyeb.com

---

## Success! ??

Your LPC Avatar Builder is now live on Koyeb with:

? 99,233+ LPC sprites loaded  
? Interactive character builder  
? NPC system with presets  
? Upload support for contributors  
? Health monitoring  
? Auto-scaling ready  
? Free SSL certificate  
? Global CDN  

**Your app:** `https://lpc-avatar-builder-YOUR-ORG.koyeb.app`

For detailed documentation, see: [KOYEB_DEPLOYMENT.md](KOYEB_DEPLOYMENT.md)

---

**Need help?** Check the full guide: [KOYEB_DEPLOYMENT.md](KOYEB_DEPLOYMENT.md)
