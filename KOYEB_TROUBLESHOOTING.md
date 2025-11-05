# Koyeb Deployment Troubleshooting

Quick fixes for common Koyeb deployment issues.

---

## ? Error: "Missing lockfile"

### Error Message:
```
! Missing lockfile
! Couldn't determine Node.js package manager. Package manager lockfile not found.
! A lockfile from a supported package manager is required to install Node.js dependencies.
```

### Cause:
Koyeb's Node.js buildpack requires a lockfile for reproducible builds.

### Solution:

**Option 1: Generate package-lock.json (npm)**
```bash
npm install --package-lock-only
git add package-lock.json
git commit -m "Add package-lock.json for Koyeb"
git push
```

**Option 2: Use yarn.lock**
```bash
yarn install
git add yarn.lock
git commit -m "Add yarn.lock for Koyeb"
git push
```

**Option 3: Use pnpm-lock.yaml**
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "Add pnpm-lock.yaml for Koyeb"
git push
```

### Verify:
```bash
# Check lockfile exists
ls -lh package-lock.json

# Should show ~100-200KB file
```

---

## ? Build Fails: "Submodule not found"

### Error Message:
```
fatal: No url found for submodule path 'assets/lpc' in .gitmodules
```

### Solution:

**Step 1: Verify .gitmodules**
```bash
cat .gitmodules
# Should show:
# [submodule "assets/lpc"]
#   path = assets/lpc
#   url = https://github.com/...
```

**Step 2: Commit .gitmodules**
```bash
git add .gitmodules
git commit -m "Add submodule configuration"
git push
```

**Step 3: Test submodule locally**
```bash
git submodule init
git submodule update --recursive
ls assets/lpc/spritesheets/
```

---

## ? Build Timeout

### Error Message:
```
Build timed out after 10 minutes
```

### Cause:
Submodule clone taking too long (99,233+ files)

### Solution:

**Option 1: Increase build timeout**
1. Koyeb Dashboard ? Service ? Settings
2. Build Settings ? Timeout
3. Change from 10 min ? 15 min

**Option 2: Use shallow clone**

Update `.koyeb/app.yaml`:
```yaml
git:
  branch: master
  buildCommand: npm install && git submodule update --init --recursive --depth 1
  runCommand: npm start
```

Then:
```bash
git add .koyeb/app.yaml
git commit -m "Use shallow submodule clone"
git push
```

---

## ? Health Check Failing

### Error Message:
```
Health check failed - Service unhealthy
```

### Solution:

**Step 1: Check logs**
```bash
# Via Koyeb CLI
koyeb service logs lpc-avatar-builder --follow

# Look for:
# - Server started successfully
# - Port binding errors
# - Health endpoint errors
```

**Step 2: Increase grace period**
1. Dashboard ? Service ? Settings ? Health Check
2. Grace period: 60s ? 120s

**Step 3: Test health endpoint locally**
```bash
# SSH into instance (if available) or test locally
curl http://localhost:3000/health

# Should return:
# {"status":"healthy",...}
```

**Step 4: Verify environment variables**
```
NODE_ENV=production
PORT=3000
SPRITESHEETS_PATH=/app/spritesheets
PERSISTENT_DISK_PATH=/app/data
```

---

## ? Assets Not Loading (404 errors)

### Error Message:
```
GET /spritesheets/body/bodies/male/walk/light.png - 404
```

### Solution:

**Step 1: Verify submodule loaded**

Check build logs for:
```
Submodule 'assets/lpc' registered
Cloning into '/app/assets/lpc'...
Submodule path 'assets/lpc': checked out '...'
```

**Step 2: Check symlink created**

Server logs should show:
```json
{"level":"info","message":"Created symlink","from":"/app/spritesheets","to":"/app/assets/lpc/spritesheets"}
```

**Step 3: Verify paths in environment**
```bash
# In service settings, ensure:
SPRITESHEETS_PATH=/app/spritesheets
```

**Step 4: Test asset directly**
```bash
curl -I https://your-app.koyeb.app/spritesheets/body/bodies/male/walk/light.png

# Should return: HTTP/2 200
```

---

## ? Upload Fails

### Error Message:
```
POST /api/upload - 500 Internal Server Error
```

### Solution:

**Step 1: Verify persistent volume**
1. Dashboard ? Service ? Volumes
2. Ensure volume mounted at: `/app/data`

**Step 2: Check logs for permission errors**
```bash
koyeb service logs lpc-avatar-builder | grep "upload"

# Look for:
# - "Upload directory ready"
# - "EACCES" (permission denied)
# - "ENOSPC" (no space left)
```

**Step 3: Test upload endpoint**
```bash
curl -X POST https://your-app.koyeb.app/api/upload \
  -F "asset=@test.png" \
  -F "category=test" \
  -F "contributor=test"

# Should return:
# {"success":true,...}
```

**Step 4: Check disk space**
- Dashboard ? Service ? Metrics ? Disk Usage

---

## ? Memory Issues

### Error Message:
```
JavaScript heap out of memory
```

### Solution:

**Option 1: Increase instance size**
- nano (512MB) ? small (2GB)
- Dashboard ? Service ? Settings ? Instance Type

**Option 2: Add Node memory flags**

Update `package.json`:
```json
{
  "scripts": {
    "start": "node --max-old-space-size=512 server.js"
  }
}
```

**Option 3: Optimize asset loading**
- Use lazy loading
- Add pagination to API
- Reduce concurrent requests

---

## ? Port Binding Error

### Error Message:
```
Error: listen EADDRINUSE: address already in use :::3000
```

### Solution:

**Verify PORT environment variable:**
```bash
# In Koyeb dashboard:
PORT=3000  # Must match server.js

# In server.js, should be:
const PORT = process.env.PORT || 3000;
```

---

## ? CORS Issues

### Error Message (in browser):
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

### Solution:

**Server already has CORS enabled**, but if you need to restrict:

Update `server.js`:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://yourdomain.com');
  // ... rest of CORS headers
});
```

---

## ?? Slow Performance

### Symptoms:
- Slow page loads
- Long API responses
- High latency

### Solution:

**Step 1: Check region**
- Dashboard ? Service ? Settings ? Regions
- Choose closest to users: `fra` (EU), `was` (US), `sin` (Asia)

**Step 2: Enable CDN (automatic)**
- Verify CDN headers:
```bash
curl -I https://your-app.koyeb.app/spritesheets/body/bodies/male/walk/light.png
# Should include: x-cache: HIT
```

**Step 3: Monitor metrics**
- Dashboard ? Service ? Metrics
- Check CPU, memory, network

**Step 4: Add caching**
- Redis for API responses (optional)
- Browser caching (already configured)

---

## ?? Debug Mode

### Enable verbose logging:

**Update environment variables:**
```
LOG_LEVEL=debug
NODE_ENV=development
```

**View detailed logs:**
```bash
koyeb service logs lpc-avatar-builder --follow
```

---

## ?? Get Help

### Before asking for help, collect:

1. **Build logs** (full output)
2. **Runtime logs** (last 100 lines)
3. **Environment variables** (sanitized)
4. **Service configuration**

```bash
# Export logs
koyeb service logs lpc-avatar-builder > logs.txt

# Service info
koyeb service get lpc-avatar-builder > service-info.txt
```

### Support channels:

- **Koyeb Discord:** https://discord.gg/koyeb
- **Koyeb Docs:** https://www.koyeb.com/docs
- **Email:** support@koyeb.com
- **GitHub Issues:** (for LPC project issues)

---

## ? Quick Health Checklist

Run this after deployment:

```bash
# Set your app URL
export APP="https://your-app.koyeb.app"

# 1. Health check
echo "Testing health..."
curl -s $APP/health | jq '.status'
# Expected: "healthy"

# 2. Categories API
echo "Testing categories..."
curl -s $APP/api/categories | jq '.categories | length'
# Expected: number > 0

# 3. NPCs API
echo "Testing NPCs..."
curl -s $APP/api/npcs | jq '.npcs | length'
# Expected: 3

# 4. Asset loading
echo "Testing assets..."
curl -I $APP/spritesheets/body/bodies/male/walk/light.png 2>&1 | grep "HTTP"
# Expected: HTTP/2 200

# 5. Upload endpoint
echo "Testing upload..."
curl -X POST $APP/api/upload \
  -F "asset=@test.png" \
  -F "category=test" 2>&1 | grep "success"
# Expected: "success":true

echo "? All checks passed!"
```

---

## ?? Redeploy After Fixes

```bash
# Make your fixes
# ...

# Commit and push
git add .
git commit -m "Fix: [describe fix]"
git push

# Koyeb will auto-deploy
# Or manually trigger:
koyeb service redeploy lpc-avatar-builder
```

---

**Still stuck?** Check the full deployment guide: [KOYEB_DEPLOYMENT.md](KOYEB_DEPLOYMENT.md)
