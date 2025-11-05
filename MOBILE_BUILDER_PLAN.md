# Mobile-First Character Builder - Development Plan

## ?? Goal
Build a mobile-first, touch-friendly LPC character builder with live animation preview.

---

## ?? Phased Development Plan

### Phase 1: Foundation (Current) ?
**Goal:** Display animated sprite with gender selection

**Features:**
- ? Canvas-based sprite rendering
- ? Single character centered on screen
- ? Automatic animation playback (walk cycle)
- ? Gender/body type selector (male/female)
- ? Mobile-responsive layout
- ? Touch-friendly controls

**Deliverables:**
- `builder.html` - Main builder interface
- `builder.css` - Mobile-first styles
- `builder.js` - Animation engine + gender selection

---

### Phase 2: Core Customization ??
**Goal:** Add essential customization options

**Features:**
- Hair style selector (10+ styles)
- Hair color picker (8+ colors)
- Skin tone selector (6+ tones)
- Live preview updates
- Category grouping (Body, Hair)
- Bottom animation selector (walk, idle, run)

**UI Components:**
- Side drawer menu (swipe or tap to open)
- Scrollable option lists
- Color swatches
- Animation thumbnails

---

### Phase 3: Clothing & Weapons ??
**Goal:** Full costume customization

**Features:**
- Clothing categories (torso, legs, feet)
- Weapon selection
- Accessory options (hats, capes, etc)
- Layer visibility toggles
- Equipment presets

**UI Components:**
- Expandable category sections
- Equipment slots
- Preview thumbnails
- Quick-swap presets

---

### Phase 4: Advanced Features ??
**Goal:** Power user features

**Features:**
- Export character (PNG, JSON)
- Import character from JSON
- Animation playback controls (play/pause, speed)
- Direction selector (up, down, left, right)
- Frame-by-frame preview
- Share URL generation

**UI Components:**
- Top navigation bar (Export, Import, Help)
- Animation control panel
- Share dialog
- Settings menu

---

### Phase 5: Polish & Optimization ??
**Goal:** Production-ready experience

**Features:**
- Loading states
- Error handling
- Offline support (PWA)
- Performance optimization
- Accessibility (ARIA labels, keyboard nav)
- Tutorial/onboarding
- Analytics (optional)

**UI Components:**
- Loading spinner
- Toast notifications
- Help overlay
- Tutorial tooltips

---

## ?? Design Principles

### Mobile-First
- Touch targets: minimum 44x44px
- Swipe gestures for navigation
- Single-column layout on mobile
- Responsive breakpoints: 320px, 768px, 1024px

### Performance
- Lazy load assets
- Canvas hardware acceleration
- Debounced updates
- Sprite sheet caching

### Accessibility
- High contrast mode
- Screen reader support
- Keyboard navigation
- Focus indicators

### User Experience
- Instant feedback
- Progressive disclosure
- Undo/redo support
- Autosave to localStorage

---

## ?? Layout Structure

```
???????????????????????????????????????
?  Top Nav [Export] [Import] [Help]  ? ? Fixed header
???????????????????????????????????????
?                                     ?
?         [Animated Sprite]           ? ? Main canvas area
?            Preview                  ?    (centered, responsive)
?                                     ?
???????????????????????????????????????
? [Walk][Jump][Attack][Cast][Idle]   ? ? Horizontal scroll
???????????????????????????????????????    animation selector

[? Menu]  ? Floating action button
            Opens side drawer with:
            - Body Type
            - Hair Style
            - Hair Color
            - Clothing
            - Weapons
            - Accessories
```

---

## ??? Tech Stack

**Frontend:**
- Vanilla JavaScript (no framework overhead)
- CSS Grid + Flexbox
- Canvas API for rendering
- LocalStorage for persistence

**Assets:**
- LPC spritesheets (99,233+ files)
- Loaded from `/spritesheets/` via existing server

**Performance:**
- RequestAnimationFrame for animation
- Image preloading
- Lazy loading for options
- Service Worker (Phase 5)

---

## ?? Success Metrics

### Phase 1 ?
- [ ] Character visible and animated
- [ ] Gender selection works
- [ ] Mobile responsive (320px+)
- [ ] <2s load time

### Phase 2
- [ ] All hair options selectable
- [ ] Live preview updates <100ms
- [ ] Side menu smooth open/close
- [ ] Touch scrolling works

### Phase 3
- [ ] All clothing categories functional
- [ ] Layer system works correctly
- [ ] No visual glitches
- [ ] 60fps animation

### Phase 4
- [ ] Export generates valid PNG
- [ ] Import loads character correctly
- [ ] Share URL works
- [ ] Cross-browser compatible

### Phase 5
- [ ] Works offline
- [ ] Lighthouse score >90
- [ ] WCAG 2.1 AA compliant
- [ ] User retention >50%

---

## ?? Current Status: Phase 1 - In Progress

**Next Steps:**
1. Create `builder.html` with basic layout
2. Implement canvas sprite renderer
3. Add walk animation loop
4. Add gender selector UI
5. Test on mobile devices

**Estimated Time:** 
- Phase 1: ~2 hours
- Phase 2: ~4 hours
- Phase 3: ~6 hours
- Phase 4: ~4 hours
- Phase 5: ~4 hours
- **Total: ~20 hours**

---

## ?? Notes

- Keep Phase 1 simple - just prove the concept
- Use existing avatar-builder module as backend
- Progressive enhancement - core features work without JS
- Test on real devices, not just emulators
- Get user feedback after each phase

---

**Let's build Phase 1!** ??
