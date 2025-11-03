/**
 * LPC Character Builder - v6.2 REAL ASSET LOADING
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
    emote: { row: 0, frames: 3, fps: 6, dir: 'emote', singleDirection: false }
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

const CATEGORIES = ['body', 'head', 'hair', 'torso', 'legs', 'feet', 'weapon'];

const state = {
  currentGender: 'male',
  currentAnimation: 'walk',
  currentDirection: 'down',
  currentFrame: 0,
  isPlaying: true,
  bodySprite: null,
  headSprite: null,
  hairSprite: null,
  torsoSprite: null,
  legsSprite: null,
  weaponSprite: null,
  bodyExtraSprite: null,
  headExtraSprite: null,
  lastFrameTime: 0,
  currentCategoryIndex: 0,
  customization: {
    bodyExtra: 'none',
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
      }
    });
  });
  
  const btnHelp = document.getElementById('btn-help');
  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      alert('LPC Character Builder v6\n\n1. Select body type\n2. Choose animation\n3. Click Customize\n4. Use ? ? arrows to navigate:\n   Body ? Head ? Hair ? Torso ? Legs\n5. Select items and colors\n6. See changes on sprite instantly!\n7. Export your character!');
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
    case 'feet':
      loadFeetOptions(container);
      break;
    case 'weapon':
      loadWeaponOptions(container);
      break;
  }
}

function loadBodyOptions(container) {
  const bodyExtras = ['wings', 'tail', 'fins'];
  
  let html = '<div class="content-subsection">';
  html += '<h3>Body Type</h3>';
  html += '<p style="text-align: center; color: #64748b; margin-bottom: 1rem;">Current: ' + state.currentGender + '</p>';
  html += '</div>';
  
  html += '<div class="content-subsection">';
  html += '<h3>Body Extras</h3>';
  html += '<div class="items-grid">';
  html += '<button class="item-card active" onclick="selectBodyExtra(\'none\')">None</button>';
  bodyExtras.forEach(extra => {
    html += `<button class="item-card" onclick="selectBodyExtra('${extra}')">${extra.charAt(0).toUpperCase() + extra.slice(1)}</button>`;
  });
  html += '</div></div>';
  
  container.innerHTML = html;
}

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
    // Fetch actual hair directories
    const response = await fetch('/api/assets?category=hair');
    const data = await response.json();
    
    // Get all hair style folders (filter out non-directories)
    const hairStyles = (data.items || []).filter(item => !item.includes('.'));
    console.log('Found hair styles:', hairStyles.length, hairStyles.slice(0, 10));
    
    // Get colors from a reference hair style (long)
    const anim = state.currentAnimation;
    const animConfig = CONFIG.animations[anim];
    const animDir = animConfig.dir;
    
    const colorsResponse = await fetch(`/api/assets?category=hair&subcategory=long&animation=${animDir}`);
    const colorsData = await colorsResponse.json();
    const hairColors = (colorsData.items || []).map(file => file.replace('.png', ''));
    console.log('Found hair colors:', hairColors.length, hairColors.slice(0, 10));
    
    let html = '<div class="content-subsection">';
    html += '<h3>Hair Style</h3>';
    html += '<div class="items-grid">';
    html += '<button class="item-card active" onclick="selectHairStyle(\'none\')">None</button>';
    hairStyles.forEach(style => {
      const displayName = style.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      html += `<button class="item-card" onclick="selectHairStyle('${style}')">${displayName}</button>`;
    });
    html += '</div></div>';
    
    html += '<div class="content-subsection">';
    html += '<h3>Hair Color</h3>';
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
  } catch (error) {
    console.error('Error loading hair options:', error);
    container.innerHTML = '<p style="text-align: center; color: red;">Error loading hair options</p>';
  }
}

async function loadTorsoOptions(container) {
  try {
    // Fetch actual torso/clothes directories
    const response = await fetch('/api/assets?category=torso');
    const data = await response.json();
    
    // Filter to get only "clothes" subdirectory, then fetch its contents
    const clothesResponse = await fetch('/spritesheets/torso/clothes');
    const clothesHtml = await clothesResponse.text();
    
    // Simple directory listing parse or use direct folder list
    // For now, use a curated list of known working items
    const torsoItems = ['blouse', 'blouse_longsleeve', 'corset', 'longsleeve', 'robe', 'shirt', 'shortsleeve', 'sleeveless', 'tunic', 'vest'];
    console.log('Found torso items:', torsoItems.length, torsoItems);
    
    // Get colors from a reference item
    const anim = state.currentAnimation;
    const animConfig = CONFIG.animations[anim];
    const animDir = animConfig.dir;
    const gender = state.currentGender;
    
    const colorsResponse = await fetch(`/api/assets?category=torso&subcategory=shirt&gender=${gender}&animation=${animDir}`);
    const colorsData = await colorsResponse.json();
    const colors = (colorsData.items || []).map(file => file.replace('.png', ''));
    console.log('Found torso colors:', colors.length, colors.slice(0, 10));
    
    let html = '<div class="content-subsection">';
    html += '<h3>Clothing</h3>';
    html += '<div class="items-grid">';
    html += '<button class="item-card active" onclick="selectTorso(\'none\')">None</button>';
    torsoItems.forEach(item => {
      const displayName = item.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      html += `<button class="item-card" onclick="selectTorso('${item}')">${displayName}</button>`;
    });
    html += '</div></div>';
    
    html += '<div class="content-subsection">';
    html += '<h3>Color</h3>';
    html += '<div class="colors-grid">';
    colors.forEach(color => {
      const bgColor = getColorHex(color);
      const active = color === state.customization.torsoColor ? 'active' : '';
      html += `<button class="color-card ${active}" style="background: ${bgColor};" onclick="selectTorsoColor('${color}')">`;
      html += `<div class="color-card-label">${color}</div>`;
      html += '</button>';
    });
    html += '</div></div>';
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading torso options:', error);
    container.innerHTML = '<p style="text-align: center; color: red;">Error loading torso options</p>';
  }
}

async function loadLegsOptions(container) {
  try {
    // Fetch actual legs directories
    const response = await fetch('/api/assets?category=legs');
    const data = await response.json();
    
    const legsItems = (data.items || []).filter(item => !item.includes('.'));
    console.log('Found legs items:', legsItems.length, legsItems);
    
    // Get colors from a reference item (pants2)
    const anim = state.currentAnimation;
    const animConfig = CONFIG.animations[anim];
    const animDir = animConfig.dir;
    const gender = state.currentGender;
    
    const colorsResponse = await fetch(`/api/assets?category=legs&subcategory=pants2&gender=${gender}&animation=${animDir}`);
    const colorsData = await colorsResponse.json();
    const colors = (colorsData.items || []).map(file => file.replace('.png', ''));
    console.log('Found legs colors:', colors.length, colors.slice(0, 10));
    
    let html = '<div class="content-subsection">';
    html += '<h3>Legwear</h3>';
    html += '<div class="items-grid">';
    html += '<button class="item-card active" onclick="selectLegs(\'none\')">None</button>';
    legsItems.forEach(item => {
      const displayName = item.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      html += `<button class="item-card" onclick="selectLegs('${item}')">${displayName}</button>`;
    });
    html += '</div></div>';
    
    html += '<div class="content-subsection">';
    html += '<h3>Color</h3>';
    html += '<div class="colors-grid">';
    colors.forEach(color => {
      const bgColor = getColorHex(color);
      const active = color === state.customization.legsColor ? 'active' : '';
      html += `<button class="color-card ${active}" style="background: ${bgColor};" onclick="selectLegsColor('${color}')">`;
      html += `<div class="color-card-label">${color}</div>`;
      html += '</button>';
    });
    html += '</div></div>';
    
    container.innerHTML = html;
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

window.selectTorso = function(item) {
  state.customization.torso = item;
  document.querySelectorAll('#category-content .item-card').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === item);
  });
  loadTorsoSprite();
};

window.selectTorsoColor = function(color) {
  state.customization.torsoColor = color;
  document.querySelectorAll('#category-content .color-card').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.color-card').classList.add('active');
  loadTorsoSprite();
};

window.selectLegs = function(item) {
  state.customization.legs = item;
  document.querySelectorAll('#category-content .item-card').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === item);
  });
  loadLegsSprite();
};

window.selectLegsColor = function(color) {
  state.customization.legsColor = color;
  document.querySelectorAll('#category-content .color-card').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.closest('.color-card').classList.add('active');
  loadLegsSprite();
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
  const canvas = document.getElementById('character-canvas');
  
  try {
    // Create a download link
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `lpc-character-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
      alert('? Character exported as PNG!\n\nFrame: ' + state.currentAnimation + ' (' + state.currentDirection + ')');
    });
  } catch (e) {
    console.error('Export failed:', e);
    alert('? Export failed. Please try again.');
  }
}

async function loadCharacter(gender, animation) {
  const bodyType = CONFIG.bodyTypes[gender];
  const animConfig = CONFIG.animations[animation];
  const animDir = animConfig.dir;
  
  console.log(`?? Loading ${gender} ${animation}...`);
  
  // Load body sprite for this animation
  const bodyPaths = [
    `/spritesheets/${bodyType.path}/${animDir}/${bodyType.bodyColor}.png`,
    `/spritesheets/${bodyType.path}/${animDir}.png`,
    `/spritesheets/${bodyType.path}/${bodyType.bodyColor}.png`
  ];
  
  console.log('Body paths:', bodyPaths);
  
  let newBodySprite;
  try {
    newBodySprite = await loadImageWithFallback(bodyPaths);
  } catch (e) {
    console.error(`? Animation "${animation}" not available for ${gender}`);
    return false; // Signal failure, keep current sprite
  }
  
  // Only update state if load was successful
  state.bodySprite = newBodySprite;
  
  // Try to load head sprite (if needed)
  // Child body includes head, so skip loading separate head
  if (!bodyType.loadHead) {
    console.log('?? Skipping head load (body includes head)');
    state.headSprite = null;
    return true; // Success
  }
  
  const headPaths = bodyType.headColor 
    ? [
        `/spritesheets/${bodyType.headPath}/${animDir}/${bodyType.headColor}.png`,
        `/spritesheets/${bodyType.headPath}/${animDir}.png`,
        `/spritesheets/${bodyType.headPath}/${bodyType.headColor}.png`
      ]
    : [
        `/spritesheets/${bodyType.headPath}/${animDir}.png`,
        `/spritesheets/${bodyType.headPath}/${animDir}/${bodyType.bodyColor}.png`
      ];
  
  console.log('Head paths:', headPaths);
  
  try {
    state.headSprite = await loadImageWithFallback(headPaths);
  } catch (e) {
    console.warn('?? Head not found, using body only');
    state.headSprite = null;
  }
  
  return true; // Success
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
  
  // Layer order (bottom to top): body ? legs ? torso ? head ? hair ? weapon
  
  // 1. Draw body
  ctx.drawImage(
    state.bodySprite,
    sx, sy,
    CONFIG.spriteWidth, CONFIG.spriteHeight,
    0, 0,
    canvas.width, canvas.height
  );
  
  // 2. Draw legs
  if (state.legsSprite) {
    ctx.drawImage(
      state.legsSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 3. Draw torso
  if (state.torsoSprite) {
    ctx.drawImage(
      state.torsoSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 4. Draw head
  if (state.headSprite) {
    ctx.drawImage(
      state.headSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 5. Draw hair
  if (state.hairSprite) {
    ctx.drawImage(
      state.hairSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
  
  // 6. Draw weapon
  if (state.weaponSprite) {
    ctx.drawImage(
      state.weaponSprite,
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
  
  // Hair path: /hair/{style}/adult/{animation}/{color}.png
  const paths = [
    `/spritesheets/hair/${hair}/adult/${animDir}/${color}.png`,
    `/spritesheets/hair/${hair}/${animDir}/${color}.png`,
    `/spritesheets/hair/${hair}/adult/${animDir}/black.png`
  ];
  
  console.log('Loading hair:', paths[0]);
  
  try {
    state.hairSprite = await loadImageWithFallback(paths);
    console.log('? Hair loaded!');
  } catch (e) {
    console.warn('Hair not found:', e);
    state.hairSprite = null;
  }
}

async function loadTorsoSprite() {
  if (state.customization.torso === 'none') {
    state.torsoSprite = null;
    console.log('Torso removed');
    return;
  }
  
  const item = state.customization.torso;
  const color = state.customization.torsoColor;
  const gender = state.currentGender;
  const anim = state.currentAnimation;
  const animConfig = CONFIG.animations[anim];
  const animDir = animConfig.dir;
  
  // Torso path: /torso/clothes/{item}/{gender}/{animation}/{color}.png
  const paths = [
    `/spritesheets/torso/clothes/${item}/${gender}/${animDir}/${color}.png`,
    `/spritesheets/torso/clothes/${item}/male/${animDir}/${color}.png`,
    `/spritesheets/torso/clothes/${item}/${animDir}/${color}.png`
  ];
  
  console.log('Loading torso:', paths[0]);
  
  try {
    state.torsoSprite = await loadImageWithFallback(paths);
    console.log('? Torso loaded!');
  } catch (e) {
    console.warn('Torso not found:', e);
    state.torsoSprite = null;
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
  
  // Legs path: /legs/{item}/{gender}/{animation}/{color}.png
  const paths = [
    `/spritesheets/legs/${item}/${gender}/${animDir}/${color}.png`,
    `/spritesheets/legs/${item}/male/${animDir}/${color}.png`,
    `/spritesheets/legs/${item}/${animDir}/${color}.png`
  ];
  
  console.log('Loading legs:', paths[0]);
  
  try {
    state.legsSprite = await loadImageWithFallback(paths);
    console.log('? Legs loaded!');
  } catch (e) {
    console.warn('Legs not found:', e);
    state.legsSprite = null;
  }
}


// Reload all customization sprites when animation changes
async function reloadAllCustomizationSprites() {
  console.log('?? Reloading all customization sprites for animation:', state.currentAnimation);
  
  const promises = [];
  
  if (state.customization.hair !== 'none') {
    promises.push(loadHairSprite());
  }
  
  if (state.customization.torso !== 'none') {
    promises.push(loadTorsoSprite());
  }
  
  if (state.customization.legs !== 'none') {
    promises.push(loadLegsSprite());
  }
  
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
