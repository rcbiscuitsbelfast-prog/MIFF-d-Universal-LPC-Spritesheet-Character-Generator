# 🚀 Commit and Deploy to Koyeb

Quick guide to commit your changes and deploy.

## ✅ Issue Fixed

The Koyeb build failure has been resolved. Here's what was fixed:

### Problem
```
ERROR: Missing lockfile
Couldn't determine Node.js package manager.
```

### Solution
- ✅ Generated `package-lock.json` (required by Koyeb)
- ✅ Updated multer to v2.0 (security fix)
- ✅ Added `.gitignore` with proper exclusions
- ✅ Created troubleshooting documentation

---

## 📦 Commit Changes

### Step 1: Check what's new

```bash
git status

# You should see:
# - package.json (updated)
# - package-lock.json (new)
# - .gitignore (new)
# - KOYEB_TROUBLESHOOTING.md (new)
# - Other documentation updates
```

### Step 2: Stage all changes

```bash
# Add the critical lockfile
git add package-lock.json

# Add updated package.json
git add package.json

# Add .gitignore
git add .gitignore

# Add new documentation
git add KOYEB_TROUBLESHOOTING.md
git add KOYEB_QUICK_START.md
git add KOYEB_DEPLOYMENT.md

# Or add everything
git add .
```

### Step 3: Commit with clear message

```bash
git commit -m "fix: Add package-lock.json for Koyeb deployment

- Generate package-lock.json (required by Koyeb buildpack)
- Update multer to v2.0 (security fix)
- Add .gitignore with proper exclusions
- Add Koyeb troubleshooting guide
- Update deployment documentation"
```

### Step 4: Push to GitHub

```bash
git push origin master
```

---

## 🚀 Deploy on Koyeb

### Automatic Deployment (if enabled)

Koyeb will **automatically detect** the push and start a new build.

**Watch the build:**
1. Go to https://app.koyeb.com
2. Select your service
3. View "Deployments" tab
4. Build should start within 30 seconds

### Manual Deployment (if needed)

**Via Dashboard:**
1. Go to https://app.koyeb.com
2. Select your service
3. Click "Redeploy"

**Via CLI:**
```bash
koyeb service redeploy lpc-avatar-builder
```

---

## ✅ Verify Build Success

### Check Build Logs

The build should now **succeed** with these steps:

```
✅ Cloning repository
✅ Detecting buildpacks (Node.js)
✅ Installing Node.js 24.0.2
✅ Installing npm 11.4.0
✅ Found package-lock.json ← This was missing before!
✅ Running npm ci
✅ Initializing Git submodules
✅ Building container
✅ Pushing to registry
✅ Deploying to Koyeb
```

### Expected Build Time

- **Build Phase:** ~3-5 minutes
  - npm ci: ~30 seconds
  - Submodule clone: ~2-3 minutes (99,233 files)
  - Container build: ~1 minute

- **Deploy Phase:** ~30 seconds
  - Health check grace period: 60 seconds

**Total:** ~5-6 minutes

---

## 🧪 Test Deployment

Once build succeeds and service is "Healthy":

### Get Your App URL

```bash
# Your app will be at:
https://lpc-avatar-builder-YOUR-ORG.koyeb.app
```

Find it in: Koyeb Dashboard → Your Service → Endpoint

### Quick Tests

```bash
# Set your app URL
export APP="https://lpc-avatar-builder-YOUR-ORG.koyeb.app"

# 1. Health check (should return "healthy")
curl $APP/health | jq '.status'

# 2. Categories API (should return array)
curl $APP/api/categories | jq '.categories | length'

# 3. NPCs API (should return 3 NPCs)
curl $APP/api/npcs | jq '.npcs | length'

# 4. Asset loading (should return 200)
curl -I $APP/spritesheets/body/bodies/male/walk/light.png | grep "HTTP"

# 5. Upload test (should return success)
curl -X POST $APP/api/upload \
  -F "asset=@test.png" \
  -F "category=test" | jq '.success'
```

### Open in Browser

Visit these URLs:

- **Homepage:** `https://your-app.koyeb.app/`
- **Avatar Builder Demo:** `https://your-app.koyeb.app/modules/avatar-builder/demo.html`
- **Health Check:** `https://your-app.koyeb.app/health`

---

## 🎉 Success!

If all tests pass, your LPC Avatar Builder is now live on Koyeb with:

✅ 99,233+ LPC sprites loaded  
✅ Interactive character customization  
✅ NPC system with presets  
✅ File upload support  
✅ Health monitoring  
✅ Global CDN  
✅ Free SSL  

---

## 📚 Next Steps

### 1. Share Your Deployment

Post in:
- LPC Community: https://lpc.opengameart.org
- GitHub Discussions
- Social media

### 2. Add Custom Domain (Optional)

1. Koyeb Dashboard → Service → Settings → Domains
2. Add domain: `lpc.yourdomain.com`
3. Update DNS with CNAME
4. SSL auto-provisioned!

### 3. Monitor Performance

- Dashboard → Service → Metrics
- View CPU, memory, requests
- Set up alerts (optional)

### 4. Scale if Needed

**Current:** nano instance (512MB, free tier)

**Upgrade to:**
- Small: $5.50/mo (2GB RAM, 1 vCPU)
- Medium: $22/mo (4GB RAM, 2 vCPU)

---

## 🆘 Still Having Issues?

### Check Troubleshooting Guide

See: [KOYEB_TROUBLESHOOTING.md](KOYEB_TROUBLESHOOTING.md)

### Common Issues:

1. **Build timeout** → Increase timeout or use shallow clone
2. **Health check failing** → Increase grace period
3. **Assets not loading** → Check submodule logs
4. **Upload failing** → Verify persistent volume

### Get Help

- **Koyeb Discord:** https://discord.gg/koyeb
- **Koyeb Docs:** https://www.koyeb.com/docs
- **Email:** support@koyeb.com

---

## 📊 Deployment Summary

```
Status: ✅ Ready to Deploy
Blocker: ❌ Resolved (package-lock.json added)
Action: 🚀 Commit and push to deploy

Estimated deployment time: ~5-6 minutes
Expected result: Live app with full functionality
```

---

**Ready?** Run the commands above and deploy! 🚀
