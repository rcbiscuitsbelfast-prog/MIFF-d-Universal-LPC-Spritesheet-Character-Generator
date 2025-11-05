# ?? Render Deployment Checklist

Complete checklist for deploying the LPC Avatar Builder to Render.

## Pre-Deployment

- [ ] **Fork/Clone Repository**
  - Repository includes all necessary files
  - `.gitmodules` configured for LPC assets
  - `render.yaml` blueprint present

- [ ] **Verify Local Setup**
  ```bash
  npm install
  ./scripts/init-submodules.sh
  npm start
  # Test at http://localhost:3000
  ```

- [ ] **Test Health Endpoint**
  ```bash
  curl http://localhost:3000/health
  # Should return: {"status":"healthy",...}
  ```

- [ ] **Verify Module Structure**
  - [ ] `/modules/avatar-builder/` exists with all files
  - [ ] `/content/npcs/` has sample NPC presets
  - [ ] `/spritesheets/` accessible (symlink or direct)

## Render Account Setup

- [ ] **Create Render Account**
  - Sign up at https://render.com
  - Verify email address
  - Connect GitHub account

- [ ] **Add Payment Method** (if using paid plan)
  - Starter plan: $7/month with persistent disk
  - Or use free tier (no persistent disk)

## Deployment Method Selection

### Option A: Blueprint Deploy (Recommended)

- [ ] **Push Code to GitHub**
  ```bash
  git add .
  git commit -m "Prepare for Render deployment"
  git push origin master
  ```

- [ ] **Deploy via Blueprint**
  1. Go to https://dashboard.render.com
  2. Click "New +" ? "Blueprint"
  3. Connect your repository
  4. Select branch (master)
  5. Click "Apply"
  6. Wait for deployment (5-10 minutes)

### Option B: Manual Deploy

- [ ] **Create Web Service**
  1. Dashboard ? "New +" ? "Web Service"
  2. Connect repository
  3. Configure:
     - Name: `lpc-avatar-builder`
     - Region: Oregon
     - Branch: `master`
     - Runtime: Node
     - Build: `npm install && git submodule init && git submodule update --recursive`
     - Start: `npm start`

- [ ] **Add Environment Variables**
  ```
  NODE_ENV=production
  PORT=3000
  SPRITESHEETS_PATH=/opt/render/project/src/spritesheets
  PERSISTENT_DISK_PATH=/opt/render/project/data
  ```

- [ ] **Attach Persistent Disk**
  1. Service Settings ? "Disks"
  2. "Add Disk"
  3. Name: `lpc-assets`
  4. Mount: `/opt/render/project/data`
  5. Size: 10 GB

- [ ] **Deploy**
  - Click "Create Web Service"
  - Wait for build to complete

## Post-Deployment Verification

### Test Core Endpoints

- [ ] **Health Check**
  ```bash
  curl https://YOUR-APP.onrender.com/health
  ```
  Expected: `{"status":"healthy",...}`

- [ ] **Categories API**
  ```bash
  curl https://YOUR-APP.onrender.com/api/categories
  ```
  Expected: `{"categories":["body","hair","weapon",...]}`

- [ ] **NPCs API**
  ```bash
  curl https://YOUR-APP.onrender.com/api/npcs
  ```
  Expected: List of NPC presets

- [ ] **Metrics**
  ```bash
  curl https://YOUR-APP.onrender.com/api/metrics
  ```
  Expected: Server metrics with asset count

### Test Web Interface

- [ ] **Open Homepage**
  - Visit `https://YOUR-APP.onrender.com`
  - Should load the LPC Character Generator

- [ ] **Test Avatar Builder Demo**
  - Open `https://YOUR-APP.onrender.com/modules/avatar-builder/demo.html`
  - Verify character customization UI loads
  - Test animation preview
  - Try different body types/hair styles

- [ ] **Test Asset Loading**
  - Open browser DevTools ? Network tab
  - Verify sprite images load from `/spritesheets/`
  - Check for 404 errors

### Test Upload Functionality

- [ ] **Upload Test Asset**
  ```bash
  curl -X POST https://YOUR-APP.onrender.com/api/upload \
    -F "asset=@test-sprite.png" \
    -F "category=test" \
    -F "contributor=TestUser"
  ```
  Expected: `{"success":true,...}`

- [ ] **List Uploads**
  ```bash
  curl https://YOUR-APP.onrender.com/api/uploads
  ```
  Should show uploaded test asset

- [ ] **Access Uploaded File**
  ```bash
  curl -I https://YOUR-APP.onrender.com/uploads/asset-XXXXX.png
  ```
  Expected: HTTP 200

## Monitoring Setup

- [ ] **Configure Health Check**
  - Render automatically monitors `/health`
  - Verify in Service ? Settings ? Health Check
  - Path: `/health`
  - Frequency: 30s

- [ ] **Set Up Alerts** (Optional)
  - Service ? Settings ? Notifications
  - Add email for deployment failures
  - Add email for health check failures

- [ ] **Review Logs**
  - Service ? Logs tab
  - Verify structured JSON logging
  - Check for errors or warnings

## Performance Optimization

- [ ] **Verify Compression**
  ```bash
  curl -H "Accept-Encoding: gzip" -I https://YOUR-APP.onrender.com
  ```
  Should include: `Content-Encoding: gzip`

- [ ] **Check Cache Headers**
  ```bash
  curl -I https://YOUR-APP.onrender.com/spritesheets/body/bodies/male/walk/light.png
  ```
  Should include: `Cache-Control: public, max-age=86400`

- [ ] **Test Response Times**
  - Use Chrome DevTools ? Network
  - Assets should load in < 500ms
  - API responses < 200ms

## Optional: Custom Domain

- [ ] **Add Custom Domain**
  1. Service ? Settings ? Custom Domains
  2. Add domain: `lpc.yourdomain.com`
  3. Copy CNAME target

- [ ] **Update DNS**
  - Add CNAME record in your DNS provider
  - Point to Render's target
  - Wait for propagation (5-30 minutes)

- [ ] **Verify SSL**
  - Visit `https://lpc.yourdomain.com`
  - Check certificate (automatically provisioned)

## Troubleshooting

### Deployment Fails

- [ ] **Check Build Logs**
  - Service ? Events tab
  - Look for npm install errors
  - Verify submodule initialization

- [ ] **Common Issues**
  - [ ] Missing `package.json` dependencies
  - [ ] Git submodule not fetching
  - [ ] Build command incorrect
  - [ ] Node version mismatch

### Assets Not Loading

- [ ] **Verify Submodule**
  - Check build logs for submodule init
  - Ensure symlink created correctly
  - Verify spritesheet path in logs

- [ ] **Check File Permissions**
  - Symlink readable
  - Assets directory accessible

### Health Check Failing

- [ ] **Test Locally**
  ```bash
  npm start
  curl http://localhost:3000/health
  ```

- [ ] **Check Render Logs**
  - Look for startup errors
  - Verify port binding (3000)
  - Check asset path errors

### Persistent Disk Issues

- [ ] **Verify Mount Path**
  - Service ? Settings ? Disks
  - Ensure mount path matches: `/opt/render/project/data`

- [ ] **Check Disk Space**
  - View in Service ? Disks ? Usage
  - Increase size if needed

- [ ] **Test Write Access**
  - Try uploading a test file
  - Check upload API logs

## Security Hardening

- [ ] **Review Environment Variables**
  - No secrets in public repos
  - Use Render's secret management
  - Rotate keys periodically

- [ ] **Add Rate Limiting** (Recommended)
  - Implement in `server.js`
  - Limit uploads per IP
  - Protect API endpoints

- [ ] **Enable CORS** (if needed)
  - Configure allowed origins
  - Restrict API access

## Documentation

- [ ] **Update README**
  - Add deployment badge
  - Link to live demo
  - Document API endpoints

- [ ] **Create API Documentation**
  - Document all endpoints
  - Include request/response examples
  - Add authentication if implemented

- [ ] **Write User Guide**
  - How to use character builder
  - How to upload assets
  - How to create NPCs

## Community

- [ ] **Share Deployment**
  - Post on LPC community forums
  - Share on social media
  - Add to project README

- [ ] **Enable Contributions**
  - Document upload process
  - Create contribution guidelines
  - Set up moderation workflow

## Maintenance

- [ ] **Schedule Regular Checks**
  - Weekly health check review
  - Monthly dependency updates
  - Quarterly submodule updates

- [ ] **Backup Strategy**
  - Render auto-backs up persistent disk
  - Manual backup script for critical data
  - Git backup for NPC presets

- [ ] **Monitor Usage**
  - Track disk space usage
  - Monitor bandwidth
  - Review upload frequency

## Success Criteria

Your deployment is successful when:

? Health endpoint returns `{"status":"healthy"}`  
? Character builder UI loads and works  
? Sprites load from `/spritesheets/`  
? Assets can be uploaded to persistent disk  
? NPCs display correctly  
? Server logs show no errors  
? Response times are acceptable  
? SSL certificate is valid  

---

## Quick Test Script

Save as `test-deployment.sh`:

```bash
#!/bin/bash

URL="https://YOUR-APP.onrender.com"

echo "Testing deployment at $URL..."

# Health check
echo -n "Health check: "
curl -s $URL/health | grep -q "healthy" && echo "?" || echo "?"

# Categories
echo -n "Categories API: "
curl -s $URL/api/categories | grep -q "categories" && echo "?" || echo "?"

# NPCs
echo -n "NPCs API: "
curl -s $URL/api/npcs | grep -q "npcs" && echo "?" || echo "?"

# Homepage
echo -n "Homepage: "
curl -s -o /dev/null -w "%{http_code}" $URL | grep -q "200" && echo "?" || echo "?"

echo "Testing complete!"
```

---

**?? Deployment Complete!**

Your LPC Avatar Builder is now live on Render with:
- ? Persistent disk storage
- ? Git submodule assets
- ? Health monitoring
- ? Upload support
- ? Production-ready configuration

Visit your app at: `https://YOUR-APP.onrender.com`
