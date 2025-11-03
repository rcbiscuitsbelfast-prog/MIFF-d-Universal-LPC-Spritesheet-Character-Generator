# ?? Version 5.0 - Category-Based Customization

## Major UX Overhaul

### Problem in v4:
- Customize button was under sprite (confusing placement)
- Side panel was cluttered and hard to navigate
- Random non-functional buttons at bottom
- Not following original LPC website's logical flow

### Solution in v5:
Complete redesign with category-based system matching original LPC workflow!

## New User Flow

```
1. Select Body Type (? Male / ? Female / ?? Teen)
   ?
2. Click "Customize Character ?" button (below body types)
   ?
3. Body type buttons REPLACED with customization categories
   ?
4. Expand categories to customize:
   - ?? Hair ? Style + Color
   - ?? Torso ? Type + Item + Color
   - ?? Legs ? Type + Color
   - ?? Feet ? Type
   - ? Weapon ? Type + Item
   - ?? Accessories ? Items
   ?
5. Click "? Back" to return to body selection
   ?
6. Click "?? Export" to download
```

## Key Features

### 1. ? Proper Button Placement
- **Customize button** now under body type selection (logical flow)
- **Body types removed** when in customize mode
- **Animation bar hidden** during customization
- **Back button** appears in top nav to exit customize mode

### 2. ? Category Accordion System
**6 Main Categories** (expand/collapse):
- **?? Hair**
  - Style: long, short, ponytail, braided, curly, mohawk, bald, afro, bob, bun
  - Color: 10 colors (black, brown, blonde, red, white, gray, blue, green, pink, purple)
  
- **?? Torso**
  - Type: clothes, armour, bandage, chainmail, jacket
  - Item: shirt, blouse, robe, tunic, corset (changes based on type)
  - Color: Per-item colors
  
- **?? Legs**
  - Type: pants, armour, formal, leggings
  - Color: Per-type colors
  
- **?? Feet**
  - Type: Various footwear options
  
- **? Weapon**
  - Type: sword, blunt, magic, polearm, ranged
  - Item: Specific weapons per type
  
- **?? Accessories**
  - Items: cape, backpack, shield, hat, quiver

### 3. ? Hierarchical Selection
**Follows original LPC logic**:
1. Select category (e.g., Torso)
2. Select type (e.g., Clothes)
3. Select specific item (e.g., Shirt)
4. Select color variant

**Example flow**:
```
Torso ? Clothes ? Shirt ? Red
Legs ? Pants ? Leggings ? Blue
Hair ? Long ? Blonde
Weapon ? Sword ? Longsword
```

### 4. ? Color Pickers
- **Visual color swatches** (not just text)
- **10 hair colors** with real color previews
- **Per-item color variants**
- **Active state highlighting**

### 5. ? Fixed Bottom Buttons Issue
- **Animation bar hidden** during customize mode
- Only shows when in body selection mode
- Clean, uncluttered interface
- No random non-functional buttons

## Technical Implementation

### HTML Structure
```html
<div id="body-selector">
  <!-- Step 1: Body types + Customize button -->
</div>

<div id="customize-categories" class="hidden">
  <!-- Step 2: Accordion categories -->
  <div class="category-section">
    <button class="category-btn">Hair ?</button>
    <div class="category-content">
      <div class="subcategory">
        <h4>Style</h4>
        <div class="item-list">...</div>
      </div>
      <div class="subcategory">
        <h4>Color</h4>
        <div class="color-list">...</div>
      </div>
    </div>
  </div>
</div>
```

### CSS Features
- `.category-btn` - Accordion header with gradient
- `.category-content` - Expandable content (max-height animation)
- `.item-list` - Grid layout for items (100px min)
- `.color-list` - Grid layout for colors (60px squares)
- `.item-btn` - Individual item buttons with hover/active states
- `.color-btn` - Color swatches with visual preview

### JavaScript Functions
```javascript
enterCustomizeMode()     // Hide body selector, show categories
exitCustomizeMode()      // Show body selector, hide categories
toggleCategory(name)     // Expand/collapse accordion
selectItem(cat, item)    // Select item from list
selectColor(cat, color)  // Select color variant
```

## User Experience Improvements

### Before (v4):
? Customize button under sprite (confusing)
? Side panel with tabs (cluttered)
? Random buttons at bottom (broken)
? Hard to find options
? No logical hierarchy

### After (v5):
? Customize button under body types (clear flow)
? Accordion categories (organized)
? Animation bar hidden when customizing (clean)
? Easy to find options
? Follows original LPC logic

## State Management
```javascript
state.customization = {
  hair: 'long',
  hairColor: 'blonde',
  torsoType: 'clothes',
  torso: 'shirt',
  torsoColor: 'red',
  legs: 'pants',
  legsColor: 'blue',
  feet: 'none',
  weaponType: 'sword',
  weapon: 'longsword',
  accessory: 'cape'
}
```

## Mobile Optimization
- Touch-friendly buttons (48px minimum)
- Accordion prevents scroll overload
- One category open at a time
- Clear visual hierarchy
- No side panels (works better on mobile)

## Deploy

```bash
git add builder.html builder.js builder.css V5_CHANGES.md
git commit -m "v5: Category-based customization + fix UX

MAJOR UX OVERHAUL:
- Move customize button under body type selection
- Replace body types with category accordion when customizing
- Hide animation bar during customize mode
- Add Back button to exit customize mode
- 6 main categories with hierarchical selection
- Visual color pickers with 10 colors
- Follows original LPC website logic
- Fixed random bottom buttons issue

CATEGORIES:
- Hair (style + color)
- Torso (type + item + color)
- Legs (type + color)
- Feet (type)
- Weapon (type + item)
- Accessories (items)

IMPROVEMENTS:
- Cleaner, more intuitive flow
- Better mobile experience
- Organized hierarchical selection
- No more cluttered side panel
- Animation bar hidden when not needed
- Updated to v5"
git push origin cursor/build-modular-lpc-character-system-45d7
```

## Testing Checklist

? Body type selection works
? Customize button below body types
? Click Customize ? body types hidden, categories shown
? Animation bar hidden in customize mode
? Back button appears and works
? Categories expand/collapse
? Only one category open at a time
? Item selection works
? Color selection works
? Active states highlight correctly
? Mobile responsive
? No random buttons at bottom
? Export still works

## Future Enhancements (v6)
- Actually load sprites for selections
- Render customized character in real-time
- Save/load presets
- More item variations
- Animation preview in customize mode
