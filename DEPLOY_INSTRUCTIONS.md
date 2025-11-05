# ?? CRITICAL: Deploy New Mobile Builder

## ?? Issue
The user is still seeing the OLD index.html. The new builder.html isn't being seen.

## ? Changes Made

### 1. BRIGHT GREEN Background
- Changed body background to `#00ff00` (bright green)
- This makes it IMMEDIATELY obvious if new version is loaded
- Title changed to "?? NEW Mobile Builder v2.0"

### 2. Fixed Mobile Layout
- Canvas moved up significantly
- Better centered on mobile portrait
- Canvas size: 240x240px (larger, more visible)
- Less padding on mobile
- Centered containers

### 3. Test File Created
- `TEST_NEW_VERSION.html` - Simple green screen test
- Visit this first to verify new files are being served

---

## ?? DEPLOY NOW

### Step 1: Verify Files Locally
```bash
# Check files exist
ls -lh builder.html builder.css builder.js TEST_NEW_VERSION.html

# Should show all 4 files with recent timestamps
```

### Step 2: Commit Everything
```bash
# Stage all files
git add builder.html builder.css builder.js
git add TEST_NEW_VERSION.html
git add server.js
git add DEPLOY_INSTRUCTIONS.md

# Commit with clear message
git commit -m "fix: Add NEW mobile builder with green background test

CRITICAL: This is the NEW version with:
- Bright green background (test indicator)
- Fixed mobile portrait layout
- Larger, centered canvas (240x240px)
- Test file to verify deployment

If you don't see GREEN background, old files are still cached!"

# Push to trigger Koyeb deploy
git push origin master
```

### Step 3: Wait for Deploy
- Go to https://app.koyeb.com
- Watch deployment logs
- Wait ~2-3 minutes for build

### Step 4: Test (IN THIS ORDER)

**A. Test the test file first:**
```
https://sore-lacie-miff-64894a37.koyeb.app/TEST_NEW_VERSION.html
```
**Expected:** Green screen with "NEW VERSION WORKING!"

**B. If test file works, try builder:**
```
https://sore-lacie-miff-64894a37.koyeb.app/builder.html
```
**Expected:** Green background, large centered character

**C. Root URL (should redirect):**
```
https://sore-lacie-miff-64894a37.koyeb.app/
```
**Expected:** Redirects to builder.html

---

## ?? If Still Seeing Old Version

### Issue 1: Files Not Deployed
**Check:**
```bash
# SSH into Koyeb (if possible) or check logs
# Look for files in deployment
```

**Solution:**
- Verify git push succeeded
- Check Koyeb deployment logs
- Look for build errors

### Issue 2: Browser Cache
**Solution:**
```bash
# Hard refresh
Ctrl+Shift+R (Chrome/Firefox)
Cmd+Shift+R (Mac)

# Or clear cache
Chrome: Settings ? Privacy ? Clear browsing data
```

### Issue 3: CDN Cache (Koyeb)
**Solution:**
- Wait 5 minutes for CDN cache to clear
- Or add query parameter: `?v=2` to URL
- Example: `https://sore-lacie-miff-64894a37.koyeb.app/builder.html?v=2`

### Issue 4: Wrong File Being Served
**Check server.js redirect:**
```javascript
app.get('/', (req, res) => {
  res.redirect(301, '/builder.html');
});
```

**Test direct file access:**
- Try accessing /builder.html directly
- If that works but / doesn't, server redirect is broken

---

## ?? Expected Results

### ? Test File (TEST_NEW_VERSION.html)
- Green background (#00ff00)
- White text box
- "NEW VERSION WORKING!" message

### ? Builder (builder.html)
- Green background (#00ff00)
- Top nav: "?? NEW Mobile Builder"
- Large character (240x240px)
- Centered on screen
- Body type buttons below
- Animation bar at bottom

### ? Mobile Portrait
- Character visible without scrolling
- Well centered
- Touch-friendly buttons
- No horizontal scroll

---

## ?? What Changed

| File | Change | Why |
|------|--------|-----|
| `builder.css` | Background: `#00ff00` | Obvious new version indicator |
| `builder.css` | Canvas: 240x240px | Larger, more visible |
| `builder.css` | Less padding | Fits on mobile portrait |
| `builder.html` | Title: "?? NEW Mobile Builder v2.0" | Clear in browser tab |
| `builder.html` | H1: "?? NEW Mobile Builder" | Clear on page |
| `server.js` | Root redirects to builder.html | Homepage is new builder |
| `TEST_NEW_VERSION.html` | Simple green test page | Verify deployment |

---

## ? Success Criteria

After deploying, you should see:

1. **TEST_NEW_VERSION.html** = Green screen ?
2. **builder.html** = Green background with builder ?
3. **Root URL** = Redirects to builder.html ?
4. **Mobile portrait** = Character visible and centered ?

If you see GREEN, the new version is working! ??

If you still see the OLD purple gradient, something is wrong with deployment.

---

## ?? Still Not Working?

If after all this you still see the old version:

1. Check Koyeb deployment logs for errors
2. Verify git push actually sent the files
3. Try incognito/private browsing mode
4. Check if files exist on server
5. Look for error messages in browser console (F12)

**Report back with:**
- What you see at TEST_NEW_VERSION.html
- What you see at builder.html
- What you see at root URL
- Any error messages

---

**DEPLOY NOW and report what you see!** ??
