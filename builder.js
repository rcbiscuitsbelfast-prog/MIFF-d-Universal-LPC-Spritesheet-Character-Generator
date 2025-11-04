/**
 * LPC Character Builder - v6.5 ALL FIXES
 */

const CONFIG = {
  spriteWidth: 64,
  spriteHeight: 64,
  sheetColumns: 13,
  fps: 12,
  scale: 3,
  
  animations: {
    walk: { row: 0, frames: 9, fps: 12, dir: 'walk', singleDirection: false },
    idle: { row: 0, frames: 1, fps: 1, dir: 'idle', singleDirection: false },
    slash: { row: 0, frames: 6, fps: 12, dir: 'slash', singleDirection: false },
    halfslash: { row: 0, frames: 6, fps: 12, dir: 'halfslash', singleDirection: false },
    backslash: { row: 0, frames: 6, fps: 12, dir: 'backslash', singleDirection: false },
    spellcast: { row: 0, frames: 7, fps: 12, dir: 'spellcast', singleDirection: false },
    shoot: { row: 0, frames: 13, fps: 12, dir: 'shoot', singleDirection: false },
    thrust: { row: 0, frames: 8, fps: 12, dir: 'thrust', singleDirection: false },
    hurt: { row: 0, frames: 6, fps: 8, dir: 'hurt', singleDirection: true },
    jump: { row: 0, frames: 4, fps: 8, dir: 'jump', singleDirection: false },
    run: { row: 0, frames: 8, fps: 12, dir: 'run', singleDirection: false },
    sit: { row: 0, frames: 3, fps: 4, dir: 'sit', singleDirection: false },
    climb: { row: 0, frames: 6, fps: 8, dir: 'climb', singleDirection: true },
    combat_idle: { row: 0, frames: 2, fps: 4, dir: 'combat_idle', singleDirection: false },
    emote: { row: 0, frames: 3, fps: 6, dir: 'emote', singleDirection: false },
    // Removed watering, onehanded, slash_basic - these don't exist in LPC sprites
  },
  
  directions: {
    up: 0,
    left: 1,
    down: 2,
    right: 3
  },
  
  bodyTypes: {
    male: { path: 'body/bodies/male', headPath: 'head/heads/human/male', bodyColor: 'light', headColor: 'light', loadHead: true },
    female: { path: 'body/bodies/female', headPath: 'head/heads/human/female', bodyColor: 'light', headColor: 'light', loadHead: true },
    teen: { path: 'body/bodies/teen', headPath: 'head/heads/human/male', bodyColor: 'light', headColor: 'light', loadHead: true }
  }
};

const CATEGORIES = ['body', 'head', 'ears', 'nose', 'wings', 'tail', 'hair', 'torso', 'legs', 'feet', 'weapon'];

const state = {
  currentGender: 'male',
  currentAnimation: 'walk',
  currentDirection: 'down',
  currentFrame: 0,
  isPlaying: true,
  compositeSpriteSheet: null, // NEW: Single master sprite sheet
  bodySprite: null,
  headSprite: null,
  hairSprite: null,
  torsoSprite: null,
  legsSprite: null,
  weaponSprite: null,
  earsSprite: null,
  noseSprite: null,
  wingsSprite: null,
  tailSprite: null,
  bodyExtraSprite: null,
  headExtraSprite: null,
  lastFrameTime: 0,
  currentCategoryIndex: 0,
  excludeMale: false, // NEW: Gender filter
  excludeFemale: false, // NEW: Gender filter
  customization: {
    bodyExtra: 'none',
    ears: 'none',
    earsColor: 'white',
    nose: 'none',
    noseColor: 'light',
    wings: 'none',
    wingsColor: 'white',
    tail: 'none',
    tailColor: 'brown',
    headExtra: 'none',
    headExtraColor: 'brown',
    hair: 'none',
    hairColor: 'black',
    torso: 'none',
    torsoColor: 'white',
    legs: 'none',
    legsColor: 'brown',
    weapon: 'none'
  }
};

const elements = {
  loading: null,
  app: null,
  canvas: null,
  ctx: null
};

async function init() {
  console.log('Initializing LPC Builder...');
  
  elements.loading = document.getElementById('loading');
  elements.app = document.getElementById('app');
  elements.canvas = document.getElementById('character-canvas');
  elements.ctx = elements.canvas.getContext('2d');
  elements.ctx.imageSmoothingEnabled = false;
  
  setupEventListeners();
  await loadCharacter(state.currentGender, state.currentAnimation);
  
  elements.loading.classList.add('hidden');
  elements.app.classList.remove('hidden');
  
  // AUTO-ENTER CUSTOMIZATION MODE
  console.log('? Auto-entering customization...');
  const bodySelector = document.getElementById('body-selector');
  if (bodySelector) bodySelector.style.display = 'none';
  setTimeout(() => { enterCustomizeMode(); }, 100);
  
  requestAnimationFrame(animate);
  console.log('Ready!');
}

function setupEventListeners() {
  document.querySelectorAll('[data-gender]').forEach(button => {
    button.addEventListener('click', async (e) => {
      const gender = e.currentTarget.dataset.gender;
      if (gender === state.currentGender) return;
      
      document.querySelectorAll('[data-gender]').forEach(btn => btn.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      state.currentGender = gender;
      state.currentFrame = 0;
      
      await loadCharacter(gender, state.currentAnimation);
    });
  });
  
  document.querySelectorAll('[data-direction]').forEach(button => {
    button.addEventListener('click', (e) => {
      const direction = e.currentTarget.dataset.direction;
      if (direction === state.currentDirection) return;
      
      document.querySelectorAll('[data-direction]').forEach(btn => btn.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      state.currentDirection = direction;
      state.currentFrame = 0;
      
      const dirText = document.getElementById('current-direction');
      if (dirText) {
        dirText.textContent = direction.charAt(0).toUpperCase() + direction.slice(1);
      }
    });
  });
  
  document.querySelectorAll('[data-animation]').forEach(button => {
    button.addEventListener('click', async (e) => {
      const animation = e.currentTarget.dataset.animation;
      if (animation === state.currentAnimation) return;
      
      // Store previous animation in case we need to revert
      const previousAnimation = state.currentAnimation;
      
      document.querySelectorAll('[data-animation]').forEach(btn => btn.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      state.currentAnimation = animation;
      state.currentFrame = 0;
      
      const animText = document.getElementById('current-animation');
      if (animText) {
        animText.textContent = animation.charAt(0).toUpperCase() + animation.slice(1).replace('_', ' ');
      }
      
      // Try to load the new animation
      const success = await loadCharacter(state.currentGender, animation);
      
      // If load failed, revert to previous animation
      if (success === false) {
        console.log(`?? Reverting to ${previousAnimation}`);
        state.currentAnimation = previousAnimation;
        state.currentFrame = 0;
        
        // Revert button states
        document.querySelectorAll('[data-animation]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-animation="${previousAnimation}"]`)?.classList.add('active');
        
        if (animText) {
          animText.textContent = previousAnimation.charAt(0).toUpperCase() + previousAnimation.slice(1).replace('_', ' ');
        }
        return;
      }
      
      // RELOAD CUSTOMIZATIONS
      console.log('✅ Reloading...');
      try { await reloadAllCustomizationSprites(); } catch (e) { console.error('❌', e); }
    });
  });
  
  const btnHelp = document.getElementById('btn-help');
  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      alert('LPC Character Builder v7\n\n1. Select body type\n2. Choose animation\n3. Click Customize\n4. Use LEFT/RIGHT arrows to navigate:\n   Body → Head → Ears → Nose → Wings → Tail → Hair → Torso → Legs\n5. Select items and colors\n6. Use Exclude button to filter male/female items\n7. Export your character!');
    });
  }
  
  // Exclude button and panel
  const btnExclude = document.getElementById('btn-exclude');
  const excludePanel = document.getElementById('exclude-panel');
  const excludeMaleCheckbox = document.getElementById('exclude-male');
  const excludeFemaleCheckbox = document.getElementById('exclude-female');
  
  if (btnExclude && excludePanel) {
    btnExclude.addEventListener('click', (e) => {
      e.stopPropagation();
      excludePanel.classList.toggle('hidden');
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!excludePanel.contains(e.target) && e.target !== btnExclude) {
        excludePanel.classList.add('hidden');
      }
    });
  }
  
  if (excludeMaleCheckbox) {
    excludeMaleCheckbox.addEventListener('change', (e) => {
      state.excludeMale = e.target.checked;
      console.log('Exclude male items:', state.excludeMale);
      // Reload current category to apply filter
      const currentCategory = CATEGORIES[state.currentCategoryIndex];
      showCategory(currentCategory);
    });
  }
  
  if (excludeFemaleCheckbox) {
    excludeFemaleCheckbox.addEventListener('change', (e) => {
      state.excludeFemale = e.target.checked;
      console.log('Exclude female items:', state.excludeFemale);
      // Reload current category to apply filter
      const currentCategory = CATEGORIES[state.currentCategoryIndex];
      showCategory(currentCategory);
    });
  }
  
  // Customize button
  const btnCustomize = document.getElementById('btn-customize');
  if (btnCustomize) {
    btnCustomize.addEventListener('click', enterCustomizeMode);
  }
  
  // Back button
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', exitCustomizeMode);
  }
  
  // Category navigation
  const btnPrevCat = document.getElementById('prev-category');
  const btnNextCat = document.getElementById('next-category');
  if (btnPrevCat) btnPrevCat.addEventListener('click', () => navigateCategory(-1));
  if (btnNextCat) btnNextCat.addEventListener('click', () => navigateCategory(1));
  
  // Export button
  const btnExport = document.getElementById('btn-export');
  if (btnExport) {
    btnExport.addEventListener('click', exportCharacter);
  }
  
  // Initialize customization options
  loadCustomizationOptions();
}

function navigateCategory(direction) {
  state.currentCategoryIndex += direction;
  
  // Wrap around
  if (state.currentCategoryIndex < 0) state.currentCategoryIndex = CATEGORIES.length - 1;
  if (state.currentCategoryIndex >= CATEGORIES.length) state.currentCategoryIndex = 0;
  
  showCategory(CATEGORIES[state.currentCategoryIndex]);
}

async function showCategory(category) {
  const label = document.getElementById('current-category-label');
  const title = document.getElementById('section-title');
  const content = document.getElementById('category-content');
  
  if (label) label.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  if (title) title.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Load content for this category
  await loadCategoryContent(category, content);
}

function enterCustomizeMode() {
  // Hide body selector but KEEP animation bar
  document.getElementById('body-selector').classList.add('hidden');
  // Animation bar stays visible!
  
  // Show customization section and nav
  const customizeSection = document.getElementById('customize-section');
  if (customizeSection) customizeSection.classList.remove('hidden');
  
  const categoryNav = document.getElementById('category-nav');
  if (categoryNav) categoryNav.style.display = 'flex';
  
  // Show back button
  document.getElementById('btn-back').style.display = 'flex';
  
  // Show first category
  state.currentCategoryIndex = 0;
  showCategory(CATEGORIES[0]);
  
  // Add customize mode class to body
  document.body.classList.add('customize-mode');
}

function exitCustomizeMode() {
  // Show body selector and animation bar
  document.getElementById('body-selector').classList.remove('hidden');
  document.getElementById('animation-bar').style.display = 'block';
  
  // Hide customization section and nav
  const customizeSection = document.getElementById('customize-section');
  if (customizeSection) customizeSection.classList.add('hidden');
  
  const categoryNav = document.getElementById('category-nav');
  if (categoryNav) categoryNav.style.display = 'none';
  
  // Hide back button
  document.getElementById('btn-back').style.display = 'none';
  
  // Remove customize mode class
  document.body.classList.remove('customize-mode');
}

async function loadCategoryContent(category, container) {
  if (!container) return;
  
  container.innerHTML = '<p style="text-align: center; color: #64748b;">Loading options...</p>';
  
  switch(category) {
    case 'body':
      loadBodyOptions(container);
      break;
    case 'head':
      loadHeadOptions(container);
      break;
    case 'hair':
      await loadHairOptions(container);
      break;
    case 'torso':
      await loadTorsoOptions(container);
      break;
    case 'legs':
      await loadLegsOptions(container);
      break;
      case 'ears':
        loadEarsOptions(container);
        break;
      case 'nose':
        loadNoseOptions(container);
        break;
      case 'wings':
        loadWingsOptions(container);
        break;
      case 'tail':
        loadTailOptions(container);
        break;
      case 'feet':
        loadFeetOptions(container);
        break;
      case 'weapon':
        loadWeaponOptions(container);
        break;
  }
}

async function loadBodyOptions(container) {
  const bodyTypes = ['male', 'female', 'teen'];
  const bodyExtras = ['wings', 'tail', 'fins'];
  
  let html = '<div class="content-subsection">';
  html += '<h3>Body Type</h3>';
  html += '<div class="option-grid">';
  bodyTypes.forEach(type => {
    const active = state.currentGender === type ? 'active' : '';
    html += `<button class="option-btn ${active}" onclick="window.selectBodyType('${type}')">${type.charAt(0).toUpperCase() + type.slice(1)}</button>`;
  });
  html += '</div></div>';
  
  html += '<div class="content-subsection">';
  html += '<h3>Body Extras</h3>';
  html += '<div class="items-grid">';
  html += '<button class="item-card active" onclick="window.selectBodyExtra(\'none\')">None</button>';
  bodyExtras.forEach(extra => {
    html += `<button class="item-card" onclick="window.selectBodyExtra('${extra}')">${extra.charAt(0).toUpperCase() + extra.slice(1)}</button>`;
  });
  html += '</div></div>';
  
  container.innerHTML = html;
}

window.selectBodyType = async function(type) {
  console.log('Selecting body type:', type);
  const previousGender = state.currentGender;
  state.currentGender = type;
  
  // Update button states
  document.querySelectorAll('#category-content .option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Reload character
  await loadCharacter(type);
  
  // Reload all customization sprites for new body type
  if (previousGender !== type) {
    await reloadAllCustomizationSprites();
  }
};

function loadHeadOptions(container) {
  const headExtras = ['horns', 'ears_elven', 'ears_cat', 'antennae'];
  const colors = ['brown', 'black', 'white', 'gray'];
  
  let html = '<div class="content-subsection">';
  html += '<h3>Head Type</h3>';
  html += '<p style="text-align: center; color: #64748b; margin-bottom: 1rem;">Matches body type</p>';
  html += '</div>';
  
  html += '<div class="content-subsection">';
  html += '<h3>Head Extras</h3>';
  html += '<div class="items-grid">';
  html += '<button class="item-card active" onclick="selectHeadExtra(\'none\')">None</button>';
  headExtras.forEach(extra => {
    html += `<button class="item-card" onclick="selectHeadExtra('${extra}')">${extra.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</button>`;
  });
  html += '</div></div>';
  
  html += '<div class="content-subsection">';
  html += '<h3>Extra Color</h3>';
  html += '<div class="colors-grid">';
  colors.forEach(color => {
    const bgColor = getColorHex(color);
    html += `<button class="color-card" style="background: ${bgColor};" onclick="selectHeadExtraColor('${color}')">`;
    html += `<div class="color-card-label">${color}</div>`;
    html += '</button>';
  });
  html += '</div></div>';
  
  container.innerHTML = html;
}

async function loadHairOptions(container) {
  try {
    console.log('?? Loading hair options...');
    
    // Fetch actual hair directories
    const response = await fetch('/api/assets?category=hair');
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('?? Raw API response for hair:', data);
    
    // Get all hair style folders (filter out non-directories)
    const hairStyles = (data.items || []).filter(item => !item.includes('.'));
    console.log('? Found hair styles:', hairStyles.length, hairStyles);
    
    if (hairStyles.length === 0) {
      console.error('? No hair styles found!');
      // Fallback to known working styles
      hairStyles.push('long', 'page', 'ponytail', 'short', 'mohawk', 'curly', 'afro', 'bangs', 'braid');
    }
    
    // Get colors from a reference hair style (long)
    const anim = state.currentAnimation;
    const animConfig = CONFIG.animations[anim];
    const animDir = animConfig.dir;
    
    console.log(`?? Fetching colors for hair/long/${animDir}...`);
    const colorsResponse = await fetch(`/api/assets?category=hair&subcategory=long&animation=${animDir}`);
    if (!colorsResponse.ok) {
      throw new Error(`Colors API error: ${colorsResponse.status}`);
    }
    const colorsData = await colorsResponse.json();
    console.log('?? Raw colors response:', colorsData);
    const hairColors = (colorsData.items || []).map(file => file.replace('.png', ''));
    console.log('? Found hair colors:', hairColors.length, hairColors);
    
    let html = '<div class="content-subsection">';
    html += '<h3>Hair Style</h3>';
    html += `<p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem;">Found ${hairStyles.length} styles</p>`;
    html += '<div class="items-grid">';
    html += '<button class="item-card active" onclick="selectHairStyle(\'none\')">None</button>';
    hairStyles.forEach(style => {
      const displayName = style.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      html += `<button class="item-card" onclick="selectHairStyle('${style}')">${displayName}</button>`;
    });
    html += '</div></div>';
    
    html += '<div class="content-subsection">';
    html += '<h3>Hair Color</h3>';
    html += `<p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem;">Found ${hairColors.length} colors</p>`;
    html += '<div class="colors-grid">';
    hairColors.forEach(color => {
      const bgColor = getColorHex(color);
      const active = color === state.customization.hairColor ? 'active' : '';
      html += `<button class="color-card ${active}" style="background: ${bgColor};" onclick="selectHairColor('${color}')">`;
      html += `<div class="color-card-label">${color}</div>`;
      html += '</button>';
    });
    html += '</div></div>';
    
    container.innerHTML = html;
    console.log('? Hair options HTML generated');
  } catch (error) {
    console.error('? Error loading hair options:', error);
    container.innerHTML = `
      <p style="text-align: center; color: red; padding: 1rem;">
        Error loading hair options: ${error.message}
      </p>
      <p style="text-align: center; color: #64748b; font-size: 0.875rem;">
        Check browser console for details
      </p>
    `;
  }
}

async function loadTorsoOptions(container) {
  try {
    console.log('🔄 Loading torso options...');
    
    // Use curated list of known working items
    let torsoItems = ['blouse', 'blouse_longsleeve', 'corset', 'longsleeve', 'robe', 'shirt', 'shortsleeve', 'sleeveless', 'tunic', 'vest'];
    
    // APPLY GENDER FILTER
    torsoItems = filterItemsByGender('torso', torsoItems, state.excludeMale, state.excludeFemale);
    
    console.log('✅ Torso items (filtered):', torsoItems.length);
    
    // Get colors dynamically based on current item selection or default to shirt
    const selectedItem = state.customization.torso === 'none' ? 'shirt' : state.customization.torso;
    const anim = state.currentAnimation;
    const animConfig = CONFIG.animations[anim];
    const animDir = animConfig.dir;
    const gender = state.currentGender;
    
    console.log(`?? Fetching colors for torso/${selectedItem}/${gender}/${animDir}...`);
    const colorsResponse = await fetch(`/api/assets?category=torso&subcategory=${selectedItem}&gender=${gender}&animation=${animDir}`);
    const colorsData = await colorsResponse.json();
    let colors = (colorsData.items || []).map(file => file.replace('.png', ''));
    
    // Fallback colors if API returns empty
    if (colors.length === 0) {
      colors = ['white', 'black', 'blue', 'red', 'green', 'brown', 'gray', 'yellow'];
    }
    console.log('? Torso colors:', colors.length);
    
    let html = '<div class="content-subsection">';
    html += '<h3>Clothing</h3>';
    html += `<p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem;">Found ${torsoItems.length} items</p>`;
    html += '<div class="items-grid">';
    const activeItem = state.customization.torso || 'none';
    html += `<button class="item-card ${activeItem === 'none' ? 'active' : ''}" onclick="window.selectTorso('none')">None</button>`;
    torsoItems.forEach(item => {
      const displayName = item.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const active = activeItem === item ? 'active' : '';
      html += `<button class="item-card ${active}" onclick="window.selectTorso('${item}')">${displayName}</button>`;
    });
    html += '</div></div>';
    
    html += '<div class="content-subsection">';
    html += '<h3>Color</h3>';
    html += `<p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem;">Found ${colors.length} colors</p>`;
    html += '<div class="colors-grid">';
    colors.forEach(color => {
      const bgColor = getColorHex(color);
      const active = color === state.customization.torsoColor ? 'active' : '';
      html += `<button class="color-card ${active}" style="background: ${bgColor};" onclick="window.selectTorsoColor('${color}')">`;
      html += `<div class="color-card-label">${color}</div>`;
      html += '</button>';
    });
    html += '</div></div>';
    
    container.innerHTML = html;
    console.log('? Torso options HTML generated');
  } catch (error) {
    console.error('Error loading torso options:', error);
    container.innerHTML = '<p style="text-align: center; color: red;">Error loading torso options</p>';
  }
}

async function loadLegsOptions(container) {
  try {
    console.log('🔄 Loading legs options...');
    
    // Fetch actual legs directories
    const response = await fetch('/api/assets?category=legs');
    const data = await response.json();
    
    let legsItems = (data.items || []).filter(item => !item.includes('.'));
    
    // APPLY GENDER FILTER
    legsItems = filterItemsByGender('legs', legsItems, state.excludeMale, state.excludeFemale);
    
    console.log('✅ Legs items (filtered):', legsItems.length);
    
    // Get colors dynamically based on current selection or default
    const selectedItem = state.customization.legs === 'none' ? 'pants2' : state.customization.legs;
    const anim = state.currentAnimation;
    const animConfig = CONFIG.animations[anim];
    const animDir = animConfig.dir;
    const gender = state.currentGender;
    
    console.log(`?? Fetching colors for legs/${selectedItem}/${gender}/${animDir}...`);
    const colorsResponse = await fetch(`/api/assets?category=legs&subcategory=${selectedItem}&gender=${gender}&animation=${animDir}`);
    const colorsData = await colorsResponse.json();
    let colors = (colorsData.items || []).map(file => file.replace('.png', ''));
    
    // Fallback colors if API returns empty
    if (colors.length === 0) {
      colors = ['brown', 'black', 'blue', 'gray', 'white', 'green'];
    }
    console.log('? Legs colors:', colors.length);
    
    let html = '<div class="content-subsection">';
    html += '<h3>Legwear</h3>';
    html += `<p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem;">Found ${legsItems.length} items</p>`;
    html += '<div class="items-grid">';
    const activeItem = state.customization.legs || 'none';
    html += `<button class="item-card ${activeItem === 'none' ? 'active' : ''}" onclick="window.selectLegs('none')">None</button>`;
    legsItems.forEach(item => {
      const displayName = item.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const active = activeItem === item ? 'active' : '';
      html += `<button class="item-card ${active}" onclick="window.selectLegs('${item}')">${displayName}</button>`;
    });
    html += '</div></div>';
    
    html += '<div class="content-subsection">';
    html += '<h3>Color</h3>';
    html += `<p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem;">Found ${colors.length} colors</p>`;
    html += '<div class="colors-grid">';
    colors.forEach(color => {
      const bgColor = getColorHex(color);
      const active = color === state.customization.legsColor ? 'active' : '';
      html += `<button class="color-card ${active}" style="background: ${bgColor};" onclick="window.selectLegsColor('${color}')">`;
      html += `<div class="color-card-label">${color}</div>`;
      html += '</button>';
    });
    html += '</div></div>';
    
    container.innerHTML = html;
    console.log('? Legs options HTML generated');
  } catch (error) {
    console.error('Error loading legs options:', error);
    container.innerHTML = '<p style="text-align: center; color: red;">Error loading legs options</p>';
  }
}

function loadFeetOptions(container) {
  container.innerHTML = '<p style="text-align: center; color: #64748b;">Feet options coming soon</p>';
}

function loadWeaponOptions(container) {
  container.innerHTML = '<p style="text-align: center; color: #64748b;">Weapon options coming soon</p>';
}

function getColorHex(colorName) {
  const colors = {
    // Hair colors
    ash: '#b0b0b0',
    black: '#1a1a1a',
    blonde: '#f0c674',
    blue: '#4a90e2',
    carrot: '#ff6347',
    chestnut: '#8b4513',
    dark_brown: '#3d2817',
    dark_gray: '#4a4a4a',
    ginger: '#ff8c42',
    gold: '#ffd700',
    gray: '#808080',
    green: '#4caf50',
    light_brown: '#a0522d',
    navy: '#000080',
    orange: '#ff8800',
    pink: '#e91e63',
    purple: '#9c27b0',
    red: '#a0392e',
    ruby_red: '#e0115f',
    white: '#f0f0f0',
    // Clothing colors
    brown: '#8b6f47',
    bluegray: '#6699cc',
    charcoal: '#36454f',
    forest: '#228b22',
    lavender: '#e6e6fa',
    leather: '#c19a6b',
    maroon: '#800000',
    raven: '#1a1a1a',
    teal: '#008080',
    walnut: '#773f1a',
    yellow: '#ffeb3b'
  };
  return colors[colorName] || '#cccccc';
}

// Global functions for onclick handlers
window.selectHairStyle = function(style) {
  state.customization.hair = style;
  document.querySelectorAll('#category-content .item-card').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === style);
  });
  loadHairSprite();
};

window.selectHairColor = function(color) {
  state.customization.hairColor = color;
  document.querySelectorAll('#category-content .color-card').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.color-card').classList.add('active');
  loadHairSprite();
};

window.selectTorso = async function(item) {
  console.log('Selecting torso:', item);
  state.customization.torso = item;
  document.querySelectorAll('#category-content .item-card').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  await loadHairSprite();
  // Reload colors for this item
  const container = document.getElementById('category-content');
  if (container) {
    await loadTorsoOptions(container);
  }
};

window.selectTorsoColor = async function(color) {
  console.log('Selecting torso color:', color);
  state.customization.torsoColor = color;
  document.querySelectorAll('#category-content .color-card').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.color-card').classList.add('active');
  await loadHairSprite();
};

window.selectLegs = async function(item) {
  console.log('Selecting legs:', item);
  state.customization.legs = item;
  document.querySelectorAll('#category-content .item-card').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  await loadHairSprite();
  // Reload colors for this item
  const container = document.getElementById('category-content');
  if (container) {
    await loadLegsOptions(container);
  }
};

window.selectLegsColor = async function(color) {
  console.log('Selecting legs color:', color);
  state.customization.legsColor = color;
  document.querySelectorAll('#category-content .color-card').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.color-card').classList.add('active');
  await loadHairSprite();
};

async function loadCustomizationOptions() {
  // Hair styles
  const hairStyles = ['long', 'short', 'ponytail', 'braided', 'curly', 'mohawk', 'bald', 'afro', 'bob', 'bun'];
  populateItems('hair-styles', hairStyles, 'hair');
  
  // Hair colors
  const hairColors = [
    { name: 'black', color: '#1a1a1a' },
    { name: 'brown', color: '#3d2817' },
    { name: 'blonde', color: '#f0c674' },
    { name: 'red', color: '#a0392e' },
    { name: 'white', color: '#f0f0f0' },
    { name: 'gray', color: '#808080' },
    { name: 'blue', color: '#4a90e2' },
    { name: 'green', color: '#4caf50' },
    { name: 'pink', color: '#e91e63' },
    { name: 'purple', color: '#9c27b0' }
  ];
  populateColors('hair-colors', hairColors, 'hairColor');
  
  // Torso types
  const torsoTypes = ['clothes', 'armour', 'bandage', 'chainmail', 'jacket'];
  populateItems('torso-types', torsoTypes, 'torsoType');
  
  // Torso items (will load based on type selection)
  // Initially load clothes
  const clothesItems = ['shirt', 'blouse', 'robe', 'tunic', 'corset'];
  populateItems('torso-items', clothesItems, 'torso');
  
  // Legs types
  const legsTypes = ['pants', 'armour', 'formal', 'leggings'];
  populateItems('legs-types', legsTypes, 'legs');
  
  // Weapon types
  const weaponTypes = ['sword', 'blunt', 'magic', 'polearm', 'ranged'];
  populateItems('weapon-types', weaponTypes, 'weaponType');
  
  // Accessories
  const accessories = ['cape', 'backpack', 'shield', 'hat', 'quiver'];
  populateItems('accessory-items', accessories, 'accessory');
}

function populateItems(containerId, items, category) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '<button class="item-btn active" data-item="none">None</button>';
  
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'item-btn';
    btn.dataset.item = item;
    btn.textContent = item.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
    btn.addEventListener('click', () => selectItem(category, item, btn));
    container.appendChild(btn);
  });
}

function populateColors(containerId, colors, category) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  colors.forEach(colorObj => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.style.background = colorObj.color;
    btn.dataset.color = colorObj.name;
    btn.dataset.label = colorObj.name.charAt(0).toUpperCase() + colorObj.name.slice(1);
    btn.addEventListener('click', () => selectColor(category, colorObj.name, btn));
    container.appendChild(btn);
  });
  
  // Select first color by default
  if (colors.length > 0) {
    container.firstChild.classList.add('active');
  }
}

function selectItem(category, item, btn) {
  // Update active state
  btn.parentElement.querySelectorAll('.item-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Update state
  state.customization[category] = item;
  
  console.log(`Selected ${category}: ${item}`);
  
  // TODO: Reload character with new customization
  // loadCharacterWithCustomization();
}

function selectColor(category, color, btn) {
  // Update active state
  btn.parentElement.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Update state
  state.customization[category] = color;
  
  console.log(`Selected ${category}: ${color}`);
  
  // TODO: Reload character with new color
  // loadCharacterWithCustomization();
}

async function exportCharacter() {
  const link = document.createElement('a');
  link.download = `character-spritesheet-${state.currentGender}-${Date.now()}.png`;
  
  if (state.compositeCanvas) {
    state.compositeCanvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      console.log('✅ Full sprite sheet exported!', state.compositeCanvas.width, 'x', state.compositeCanvas.height);
    });
  } else {
    console.error('❌ No composite sprite sheet to export');
    alert('Please wait for character to load before exporting');
  }
}

async function loadCharacter(gender, animation) {
  state.currentGender = gender;
  state.currentAnimation = animation;
  state.currentFrame = 0;
  
  console.log('?? Building composite sprite sheet for', gender, '...');
  
  // BUILD COMPOSITE SPRITE SHEET
  try {
    const compositeResult = await createCompositeSpriteSheet({
      bodyType: gender,
      bodyColor: CONFIG.bodyTypes[gender].bodyColor,
      headColor: CONFIG.bodyTypes[gender].headColor,
      hair: state.customization.hair,
      hairColor: state.customization.hairColor,
      torso: state.customization.torso,
      torsoColor: state.customization.torsoColor,
      legs: state.customization.legs,
      legsColor: state.customization.legsColor,
      ears: state.customization.ears,
      earsColor: state.customization.earsColor,
      nose: state.customization.nose,
      noseColor: state.customization.noseColor,
      wings: state.customization.wings,
      wingsColor: state.customization.wingsColor,
      tail: state.customization.tail,
      tailColor: state.customization.tailColor
    });
    
    state.compositeSpriteSheet = compositeResult.image;
    state.compositeCanvas = compositeResult.canvas;
    
    console.log('? Composite sprite sheet ready!', compositeResult.width, 'x', compositeResult.height);
    
    return true;
  } catch (e) {
    console.error('? Failed to create composite sprite sheet:', e);
    return false;
  }
}

async function exportCharacter() {
  const link = document.createElement('a');
  link.download = `character-spritesheet-${state.currentGender}-${Date.now()}.png`;
  
  if (state.compositeCanvas) {
    state.compositeCanvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      console.log('✅ Full sprite sheet exported!', state.compositeCanvas.width, 'x', state.compositeCanvas.height);
    });
  } else {
    console.error('❌ No composite sprite sheet to export');
    alert('Please wait for character to load before exporting');
  }
}

function loadImageWithFallback(paths) {
  return new Promise((resolve, reject) => {
    let index = 0;
    
    const tryNext = () => {
      if (index >= paths.length) {
        console.error('? All paths failed:', paths);
        reject(new Error('All paths failed'));
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        console.log(`? Loaded: ${paths[index]} (${img.width}x${img.height})`);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`? Failed: ${paths[index]}`);
        index++;
        if (index < paths.length) {
          console.log('?? Trying fallback:', paths[index]);
          tryNext();
        } else {
          console.error('? All paths failed:', paths);
          reject(new Error('All paths failed'));
        }
      };
      img.src = paths[index];
    };
    
    tryNext();
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function animate(timestamp) {
  if (!state.isPlaying) {
    requestAnimationFrame(animate);
    return;
  }
  
  const animConfig = CONFIG.animations[state.currentAnimation];
  const frameDelay = 1000 / animConfig.fps;
  
  if (timestamp - state.lastFrameTime >= frameDelay) {
    state.currentFrame = (state.currentFrame + 1) % animConfig.frames;
    state.lastFrameTime = timestamp;
  }
  
  render();
  requestAnimationFrame(animate);
}

function render() {
  if (!state.bodySprite) return;
  
  const { ctx, canvas } = elements;
  const animConfig = CONFIG.animations[state.currentAnimation];
  
  // Single-direction animations (hurt, climb) only have 1 row
  const directionOffset = animConfig.singleDirection ? 0 : CONFIG.directions[state.currentDirection];
  
  const row = animConfig.row + directionOffset;
  const col = state.currentFrame;
  
  const sx = col * CONFIG.spriteWidth;
  const sy = row * CONFIG.spriteHeight;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Layer order (bottom to top): body → wings → tail → legs → torso → head → ears → nose → hair
  
  // 1. Draw body
  ctx.drawImage(
    state.bodySprite,
    sx, sy,
    CONFIG.spriteWidth, CONFIG.spriteHeight,
    0, 0,
    canvas.width, canvas.height
  );
  
  // 2. Draw wings (behind body)
  if (state.wingsSprite) {
    ctx.drawImage(
      state.wingsSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 3. Draw tail (behind body)
  if (state.tailSprite) {
    ctx.drawImage(
      state.tailSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 4. Draw legs
  if (state.legsSprite) {
    ctx.drawImage(
      state.legsSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 5. Draw torso
  if (state.torsoSprite) {
    ctx.drawImage(
      state.torsoSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 6. Draw head
  if (state.headSprite) {
    ctx.drawImage(
      state.headSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 7. Draw ears
  if (state.earsSprite) {
    ctx.drawImage(
      state.earsSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 8. Draw nose
  if (state.noseSprite) {
    ctx.drawImage(
      state.noseSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 9. Draw hair (top layer)
  if (state.hairSprite) {
    ctx.drawImage(
      state.hairSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
}

document.addEventListener('DOMContentLoaded', init);

// Sprite loading functions for customizations
async function loadHairSprite() {
  if (state.customization.hair === 'none') {
    state.hairSprite = null;
    console.log('Hair removed');
    return;
  }
  
  const hair = state.customization.hair;
  const color = state.customization.hairColor;
  const anim = state.currentAnimation;
  const animConfig = CONFIG.animations[anim];
  const animDir = animConfig.dir;
  
  // KEEP OLD SPRITE AS BACKUP
  const previousSprite = state.hairSprite;
  
  // Hair path: /hair/{style}/adult/{animation}/{color}.png
  const paths = [
    `/spritesheets/hair/${hair}/adult/${animDir}/${color}.png`,
    `/spritesheets/hair/${hair}/${animDir}/${color}.png`,
    `/spritesheets/hair/${hair}/adult/${animDir}/black.png`,
    `/spritesheets/hair/${hair}/adult/walk/${color}.png`
  ];
  
  console.log('Loading hair:', paths[0]);
  
  try {
    state.hairSprite = await loadImageWithFallback(paths);
    console.log('✅ Hair loaded!');
  } catch (e) {
    console.warn('⚠️ Hair not found, keeping previous:', e);
    // KEEP PREVIOUS SPRITE instead of setting to null
    state.hairSprite = previousSprite;
  }
}

async function loadTorsoSprite() {
  if (state.customization.torso === 'none') {
    state.torsoSprite = null;
    console.log('Torso removed');
    return;
  }
  const previousSprite = state.torsoSprite;
  
  const item = state.customization.torso;
  const color = state.customization.torsoColor;
  const gender = state.currentGender;
  const anim = state.currentAnimation;
  const animConfig = CONFIG.animations[anim];
  const animDir = animConfig.dir;
  
  // CRITICAL: Clothes often only have walk animation!
  // Try animation-specific first, then fallback to walk
  const paths = [
    `/spritesheets/torso/clothes/${item}/${gender}/${animDir}/${color}.png`,
    `/spritesheets/torso/clothes/${item}/male/${animDir}/${color}.png`,
    `/spritesheets/torso/clothes/${item}/female/${animDir}/${color}.png`,
    `/spritesheets/torso/clothes/${item}/${animDir}/${color}.png`,
    `/spritesheets/torso/clothes/${item}/${item}/${gender}/${animDir}/${color}.png`,
    // FALLBACK TO WALK if animation doesn't exist
    `/spritesheets/torso/clothes/${item}/${gender}/walk/${color}.png`,
    `/spritesheets/torso/clothes/${item}/male/walk/${color}.png`,
    `/spritesheets/torso/clothes/${item}/female/walk/${color}.png`,
    `/spritesheets/torso/clothes/${item}/walk/${color}.png`,
    `/spritesheets/torso/clothes/shirt/child/walk/${color}.png`
  ];
  
  console.log(`Loading torso: ${item} (${color}) for ${animDir}`);
  
  try {
    state.torsoSprite = await loadImageWithFallback(paths);
    console.log('✅ Torso loaded!');
  } catch (e) {
    console.warn('⚠️ Torso not found, removing:', e);
    state.torsoSprite = null; // Remove instead of keeping misaligned sprite
  }
}

async function loadLegsSprite() {
  if (state.customization.legs === 'none') {
    state.legsSprite = null;
    console.log('Legs removed');
    return;
  }
  
  const item = state.customization.legs;
  const color = state.customization.legsColor;
  const gender = state.currentGender;
  const anim = state.currentAnimation;
  const animConfig = CONFIG.animations[anim];
  const animDir = animConfig.dir;
  const paths = [
    `/spritesheets/legs/${item}/${gender}/${animDir}/${color}.png`,
    `/spritesheets/legs/${item}/male/${animDir}/${color}.png`,
    `/spritesheets/legs/${item}/female/${animDir}/${color}.png`,
    `/spritesheets/legs/${item}/${animDir}/${color}.png`,
    `/spritesheets/legs/skirts/${item}/${gender}/${animDir}/${color}.png`,
    `/spritesheets/legs/armour/${item}/${gender}/${animDir}/${color}.png`,
    `/spritesheets/legs/${item}/thin/${animDir}/${color}.png`,
    // FALLBACK TO WALK
    `/spritesheets/legs/${item}/${gender}/walk/${color}.png`,
    `/spritesheets/legs/${item}/male/walk/${color}.png`,
    `/spritesheets/legs/${item}/female/walk/${color}.png`,
    `/spritesheets/legs/${item}/walk/${color}.png`
  ];
  
  console.log(`Loading legs: ${item} (${color}) for ${animDir}`);
  
  try {
    state.legsSprite = await loadImageWithFallback(paths);
    console.log('? Legs loaded!');
  } catch (e) {
    console.warn('⚠️ Legs not found, removing:', e);
    state.legsSprite = null;
  }
}
async function reloadAllCustomizationSprites() {
  console.log('🔄 Rebuilding composite sprite sheet...');
  
  // REBUILD ENTIRE COMPOSITE SHEET (not individual sprites!)
  try {
    await loadCharacter(state.currentGender, state.currentAnimation);
    console.log('✅ Composite sheet rebuilt!');
  } catch (e) {
    console.error('❌ Failed to rebuild composite:', e);
  await Promise.all(promises);
  console.log('? All customization sprites reloaded');
}

// Global functions for body/head extras
window.selectBodyExtra = function(extra) {
  state.customization.bodyExtra = extra;
  document.querySelectorAll('#category-content .item-card').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === extra);
  });
  console.log('Body extra selected:', extra);
  // TODO: Load body extra sprite
};

window.selectHeadExtra = function(extra) {
  state.customization.headExtra = extra;
  document.querySelectorAll('#category-content .item-card').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().replace(/ /g, '_') === extra);
  });
  console.log('Head extra selected:', extra);
  // TODO: Load head extra sprite
};

window.selectHeadExtraColor = function(color) {
  state.customization.headExtraColor = color;
  document.querySelectorAll('#category-content .color-card').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.color-card').classList.add('active');
  console.log('Head extra color selected:', color);
  // TODO: Reload head extra sprite with color
};

// Load ears sprite
async function loadEarsSprite() {
  if (state.customization.ears === 'none') {
    state.earsSprite = null;
    return;
  }
  const item = state.customization.ears;
  const color = state.customization.earsColor;
  const anim = state.currentAnimation;
  const animConfig = CONFIG.animations[anim];
  const animDir = animConfig.dir;
  const previousSprite = state.earsSprite;
  
  const paths = [
    `/spritesheets/head/ears/${item}/adult/${animDir}/${color}.png`,
    `/spritesheets/head/ears/${item}/child/${animDir}/${color}.png`,
    `/spritesheets/head/ears/${item}/adult/${animDir}/white.png`,
    `/spritesheets/head/ears/${item}/child/${animDir}/white.png`,
    `/spritesheets/head/ears/${item}/adult/walk/${color}.png`,
    `/spritesheets/head/ears/${item}/child/walk/${color}.png`,
    `/spritesheets/head/ears/${item}/${animDir}/${color}.png`
  ];
  
  console.log(`Loading ears: ${item} (${color}) for ${animDir}`);
  
  try {
    state.earsSprite = await loadImageWithFallback(paths);
    console.log('✅ Ears loaded!');
  } catch (e) {
    console.warn('⚠️ Ears not found, removing:', e);
    state.earsSprite = null;
  }
}

// Load nose sprite
async function loadNoseSprite() {
  if (state.customization.nose === 'none') {
    state.noseSprite = null;
    return;
  }
  const item = state.customization.nose;
  const color = state.customization.noseColor;
  const anim = state.currentAnimation;
  const animConfig = CONFIG.animations[anim];
  const animDir = animConfig.dir;
  const previousSprite = state.noseSprite;
  
  const paths = [
    `/spritesheets/head/nose/${item}/adult/${animDir}/${color}.png`,
    `/spritesheets/head/nose/${item}/${animDir}/${color}.png`,
    `/spritesheets/head/nose/${item}/adult/walk/${color}.png`,
    `/spritesheets/head/nose/${item}/${animDir}/light.png`
  ];
  
  try {
    state.noseSprite = await loadImageWithFallback(paths);
    console.log('✅ Nose loaded!');
  } catch (e) {
    console.warn('⚠️ Nose not found, keeping previous');
    state.noseSprite = previousSprite;
  }
}

// Load wings sprite
async function loadWingsSprite() {
  if (state.customization.wings === 'none') {
    state.wingsSprite = null;
    return;
  }
  const item = state.customization.wings;
  const color = state.customization.wingsColor;
  const anim = state.currentAnimation;
  const animConfig = CONFIG.animations[anim];
  const animDir = animConfig.dir;
  const previousSprite = state.wingsSprite;
  
  // Wings have bg/ and fg/ folders, try both
  const paths = [
    `/spritesheets/body/wings/${item}/adult/bg/${animDir}/${color}.png`,
    `/spritesheets/body/wings/${item}/adult/fg/${animDir}/${color}.png`,
    `/spritesheets/body/wings/${item}/adult/${animDir}/${color}.png`,
    `/spritesheets/body/wings/${item}/${animDir}/${color}.png`,
    `/spritesheets/body/wings/${item}/adult/bg/walk/${color}.png`,
    `/spritesheets/body/wings/${item}/adult/fg/walk/${color}.png`,
    `/spritesheets/body/wings/${item}/adult/walk/${color}.png`,
    `/spritesheets/body/wings/${item}/adult/bg/${animDir}/white.png`,
    `/spritesheets/body/wings/${item}/adult/fg/${animDir}/white.png`
  ];
  
  console.log(`Loading wings: ${item} (${color}) for ${animDir}`);
  
  try {
    state.wingsSprite = await loadImageWithFallback(paths);
    console.log('✅ Wings loaded!');
  } catch (e) {
    console.warn('⚠️ Wings not found, removing:', e);
    state.wingsSprite = null;
  }
}

// Load tail sprite
async function loadTailSprite() {
  if (state.customization.tail === 'none') {
    state.tailSprite = null;
    return;
  }
  const item = state.customization.tail;
  const color = state.customization.tailColor;
  const anim = state.currentAnimation;
  const animConfig = CONFIG.animations[anim];
  const animDir = animConfig.dir;
  const previousSprite = state.tailSprite;
  
  const paths = [
    `/spritesheets/body/tail/${item}/adult/${animDir}/${color}.png`,
    `/spritesheets/body/tail/${item}/${animDir}/${color}.png`,
    `/spritesheets/body/tail/${item}/adult/walk/${color}.png`,
    `/spritesheets/body/tail/${item}/adult/${animDir}/brown.png`
  ];
  
  try {
    state.tailSprite = await loadImageWithFallback(paths);
    console.log('✅ Tail loaded!');
  } catch (e) {
    console.warn('⚠️ Tail not found, keeping previous');
    state.tailSprite = previousSprite;
  }
}


// Load ears options
async function loadEarsOptions(container) {
  try {
    const response = await fetch('/api/assets?category=head/ears');
    const data = await response.json();
    const items = (data.items || []).filter(item => !item.startsWith('.'));
    
    let html = '<div class="content-subsection">';
    html += '<h3>Ears</h3>';
    html += `<p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem;">Found ${items.length} styles</p>`;
    html += '<div class="items-grid">';
    const activeItem = state.customization.ears || 'none';
    html += `<button class="item-card ${activeItem === 'none' ? 'active' : ''}" onclick="window.selectEars('none')">None</button>`;
    items.forEach(item => {
      const displayName = item.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const active = activeItem === item ? 'active' : '';
      html += `<button class="item-card ${active}" onclick="window.selectEars('${item}')">${displayName}</button>`;
    });
    html += '</div></div>';
    
    // Colors
    const colors = ['white', 'light', 'tan', 'brown', 'dark', 'black', 'gray'];
    html += '<div class="content-subsection"><h3>Color</h3><div class="colors-grid">';
    colors.forEach(color => {
      const bgColor = getColorHex(color);
      const active = color === state.customization.earsColor ? 'active' : '';
      html += `<button class="color-card ${active}" style="background: ${bgColor};" onclick="window.selectEarsColor('${color}')">`;
      html += `<div class="color-card-label">${color}</div></button>`;
    });
    html += '</div></div>';
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading ears options:', error);
    container.innerHTML = '<p style="text-align: center; color: red;">Error loading ears options</p>';
  }
}

// Load nose options
async function loadNoseOptions(container) {
  try {
    const response = await fetch('/api/assets?category=head/nose');
    const data = await response.json();
    const items = (data.items || []).filter(item => !item.startsWith('.'));
    
    let html = '<div class="content-subsection">';
    html += '<h3>Nose</h3>';
    html += `<p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem;">Found ${items.length} styles</p>`;
    html += '<div class="items-grid">';
    const activeItem = state.customization.nose || 'none';
    html += `<button class="item-card ${activeItem === 'none' ? 'active' : ''}" onclick="window.selectNose('none')">None</button>`;
    items.forEach(item => {
      const displayName = item.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const active = activeItem === item ? 'active' : '';
      html += `<button class="item-card ${active}" onclick="window.selectNose('${item}')">${displayName}</button>`;
    });
    html += '</div></div>';
    
    // Colors
    const colors = ['light', 'tan', 'medium', 'brown', 'dark', 'peach'];
    html += '<div class="content-subsection"><h3>Color</h3><div class="colors-grid">';
    colors.forEach(color => {
      const bgColor = getColorHex(color);
      const active = color === state.customization.noseColor ? 'active' : '';
      html += `<button class="color-card ${active}" style="background: ${bgColor};" onclick="window.selectNoseColor('${color}')">`;
      html += `<div class="color-card-label">${color}</div></button>`;
    });
    html += '</div></div>';
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading nose options:', error);
    container.innerHTML = '<p style="text-align: center; color: red;">Error loading nose options</p>';
  }
}

// Load wings options
async function loadWingsOptions(container) {
  try {
    const response = await fetch('/api/assets?category=body/wings');
    const data = await response.json();
    const items = (data.items || []).filter(item => !item.startsWith('.'));
    
    let html = '<div class="content-subsection">';
    html += '<h3>Wings</h3>';
    html += `<p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem;">Found ${items.length} styles</p>`;
    html += '<div class="items-grid">';
    const activeItem = state.customization.wings || 'none';
    html += `<button class="item-card ${activeItem === 'none' ? 'active' : ''}" onclick="window.selectWings('none')">None</button>`;
    items.forEach(item => {
      const displayName = item.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const active = activeItem === item ? 'active' : '';
      html += `<button class="item-card ${active}" onclick="window.selectWings('${item}')">${displayName}</button>`;
    });
    html += '</div></div>';
    
    // Colors
    const colors = ['white', 'light', 'tan', 'brown', 'black', 'red', 'blue', 'green', 'purple'];
    html += '<div class="content-subsection"><h3>Color</h3><div class="colors-grid">';
    colors.forEach(color => {
      const bgColor = getColorHex(color);
      const active = color === state.customization.wingsColor ? 'active' : '';
      html += `<button class="color-card ${active}" style="background: ${bgColor};" onclick="window.selectWingsColor('${color}')">`;
      html += `<div class="color-card-label">${color}</div></button>`;
    });
    html += '</div></div>';
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading wings options:', error);
    container.innerHTML = '<p style="text-align: center; color: red;">Error loading wings options</p>';
  }
}

// Load tail options
async function loadTailOptions(container) {
  try {
    const response = await fetch('/api/assets?category=body/tail');
    const data = await response.json();
    const items = (data.items || []).filter(item => !item.startsWith('.'));
    
    let html = '<div class="content-subsection">';
    html += '<h3>Tail</h3>';
    html += `<p style="text-align: center; color: #64748b; font-size: 0.875rem; margin-bottom: 0.5rem;">Found ${items.length} styles</p>`;
    html += '<div class="items-grid">';
    const activeItem = state.customization.tail || 'none';
    html += `<button class="item-card ${activeItem === 'none' ? 'active' : ''}" onclick="window.selectTail('none')">None</button>`;
    items.forEach(item => {
      const displayName = item.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const active = activeItem === item ? 'active' : '';
      html += `<button class="item-card ${active}" onclick="window.selectTail('${item}')">${displayName}</button>`;
    });
    html += '</div></div>';
    
    // Colors
    const colors = ['brown', 'tan', 'gray', 'black', 'white', 'red', 'orange'];
    html += '<div class="content-subsection"><h3>Color</h3><div class="colors-grid">';
    colors.forEach(color => {
      const bgColor = getColorHex(color);
      const active = color === state.customization.tailColor ? 'active' : '';
      html += `<button class="color-card ${active}" style="background: ${bgColor};" onclick="window.selectTailColor('${color}')">`;
      html += `<div class="color-card-label">${color}</div></button>`;
    });
    html += '</div></div>';
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading tail options:', error);
    container.innerHTML = '<p style="text-align: center; color: red;">Error loading tail options</p>';
  }
}

// Selection handlers for new options
window.selectEars = async function(item) {
  state.customization.ears = item;
  await loadEarsSprite();
  await loadEarsOptions(document.getElementById('category-content'));
};

window.selectEarsColor = async function(color) {
  state.customization.earsColor = color;
  await loadEarsSprite();
};

window.selectNose = async function(item) {
  state.customization.nose = item;
  await loadNoseSprite();
  await loadNoseOptions(document.getElementById('category-content'));
};

window.selectNoseColor = async function(color) {
  state.customization.noseColor = color;
  await loadNoseSprite();
};

window.selectWings = async function(item) {
  state.customization.wings = item;
  await loadWingsSprite();
  await loadWingsOptions(document.getElementById('category-content'));
};

window.selectWingsColor = async function(color) {
  state.customization.wingsColor = color;
  await loadWingsSprite();
};

window.selectTail = async function(item) {
  state.customization.tail = item;
  await loadTailSprite();
  await loadTailOptions(document.getElementById('category-content'));
};

window.selectTailColor = async function(color) {
  state.customization.tailColor = color;
  await loadTailSprite();
};

};
