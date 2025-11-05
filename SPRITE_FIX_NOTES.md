# Sprite Loading Issues & Fixes

## ?? Issues Found

### Issue 1: Headless Sprite ?
**Problem:** Body sprites don't include heads - they're separate layers
**Cause:** Loading body-only layer from `/body/bodies/{type}/`
**Impact:** Character appears without head

### Issue 2: Animations Not Showing ?
**Problem:** Only "cast" animation shows sprite
**Cause:** Different animations stored in separate sprite files
**Impact:** Most animations show nothing

### Issue 3: LPC Asset Structure
LPC sprites are **layered**:
- Body (no head)
- Head (separate)
- Hair (separate)
- Clothes (separate)
- Weapons (separate)

**We were only loading body layer!**

---

## ? Fixes Applied

### Fix 1: Multiple Path Fallback
Try loading sprites from multiple locations in order:

```javascript
const possiblePaths = [
  `/spritesheets/body/bodies/${gender}/${color}.png`,      // Full sheet
  `/spritesheets/body/bodies/${gender}/spellcast/${color}.png`,  // Animation-specific
  `/spritesheets/body/bodies/${gender}/walk/${color}.png`,
  `/spritesheets/${bodyType.path}/${color}.png`,          // Alternative
];
```

### Fix 2: Better Error Handling
- Try all paths sequentially
- Log each attempt
- Show helpful error messages
- Don't fail silently

---

## ?? Next Steps

### Phase 1.5: Add Head Layer ?
**Quick fix for headless issue:**

1. **Load two sprites:**
   - Body: `/body/bodies/{type}/{animation}/{color}.png`
   - Head: `/head/heads/{type}/{animation}/{color}.png`

2. **Composite on canvas:**
   ```javascript
   ctx.drawImage(bodySprite, ...);  // Draw body first
   ctx.drawImage(headSprite, ...);  // Draw head on top
   ```

3. **Result:** Complete character with head!

### Phase 2: Full Layer System ??
**Proper solution (later):**

1. Load all layers:
   - Body
   - Head
   - Eyes
   - Hair (selected style)
   - Clothes (selected outfit)
   - Weapon (if equipped)

2. Composite in correct order:
   ```
   shadow ? body ? head ? eyes ? torso ? legs ? 
   arms ? hair ? hat ? weapon ? shield
   ```

3. Cache composited result

---

## ?? LPC Sprite Structure

```
spritesheets/
??? body/
?   ??? bodies/
?       ??? male/
?       ?   ??? spellcast/
?       ?   ?   ??? light.png
?       ?   ?   ??? dark.png
?       ?   ?   ??? tanned.png
?       ?   ??? walk/
?       ?   ?   ??? light.png
?       ?   ??? hurt/
?       ?       ??? light.png
?       ??? female/
?       ??? child/
??? head/
?   ??? heads/
?       ??? human/
?           ??? male/
?           ?   ??? light.png
?           ??? female/
?               ??? light.png
??? hair/
    ??? short/
    ??? long/
    ??? curly/
```

**Each animation is a separate file!**

---

## ?? Temporary Workaround

For now, we're:
1. ? Trying multiple sprite paths
2. ? Better error handling
3. ? Still missing heads (will fix next)

**Current status:** Body loads, but headless. Need to add head layer next.

---

## ?? Immediate Action Plan

1. **Test current fix** ?
   - Deploy
   - Check if more animations show sprites now
   - Verify fallback paths work

2. **Add head layer** (Next commit)
   - Load body + head separately
   - Composite on canvas
   - Test with all animations

3. **Add hair** (Phase 2)
   - Load hair sprite
   - Add to layer stack
   - Allow style selection

---

**Status:** Fix deployed - testing sprite path fallbacks
**Next:** Add head layer to fix headless characters
