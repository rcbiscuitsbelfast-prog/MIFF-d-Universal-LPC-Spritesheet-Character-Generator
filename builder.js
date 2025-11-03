/**
 * LPC Character Builder - v4 WITH FULL CUSTOMIZATION
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
  lastFrameTime: 0,
  customization: {
    hair: 'none',
    hairColor: 'black',
    torso: 'none',
    legs: 'none',
    weapon: 'none',
    extras: []
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
      alert('LPC Character Builder v4\n\n1. Select body type\n2. Choose animation\n3. Pick direction\n4. Customize hair, clothes, weapons\n5. Export your character!');
    });
  }
  
  const btnNext = document.getElementById('next-customize');
  if (btnNext) {
    btnNext.addEventListener('click', openCustomizePanel);
  }
  
  // Customization panel controls
  const closePanel = document.getElementById('close-panel');
  const panelOverlay = document.getElementById('panel-overlay');
  
  if (closePanel) closePanel.addEventListener('click', closeCustomizePanel);
  if (panelOverlay) panelOverlay.addEventListener('click', closeCustomizePanel);
  
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.currentTarget.dataset.tab;
      switchTab(tabName);
    });
  });
  
  // Export button
  const btnExport = document.getElementById('btn-export');
  if (btnExport) {
    btnExport.addEventListener('click', exportCharacter);
  }
  
  // Initialize customization options
  loadCustomizationOptions();
}

function openCustomizePanel() {
  const panel = document.getElementById('customize-panel');
  const overlay = document.getElementById('panel-overlay');
  panel.classList.add('active');
  overlay.classList.add('active');
}

function closeCustomizePanel() {
  const panel = document.getElementById('customize-panel');
  const overlay = document.getElementById('panel-overlay');
  panel.classList.remove('active');
  overlay.classList.remove('active');
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  // Update tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });
}

async function loadCustomizationOptions() {
  try {
    // Load hair options
    const hairResponse = await fetch('/api/assets?category=hair');
    const hairData = await hairResponse.json();
    populateOptions('hair-list', hairData.items || [], 'hair');
    
    // Load torso options
    const torsoResponse = await fetch('/api/assets?category=torso');
    const torsoData = await torsoResponse.json();
    populateOptions('torso-list', torsoData.items || [], 'torso');
    
    // Load legs options
    const legsResponse = await fetch('/api/assets?category=legs');
    const legsData = await legsResponse.json();
    populateOptions('legs-list', legsData.items || [], 'legs');
    
    // Load weapon options
    const weaponResponse = await fetch('/api/assets?category=weapon');
    const weaponData = await weaponResponse.json();
    populateOptions('weapon-list', weaponData.items || [], 'weapon');
  } catch (e) {
    console.warn('Could not load customization options:', e);
    // Use fallback options
    populateFallbackOptions();
  }
}

function populateOptions(containerId, items, category) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'list-btn';
    btn.dataset[category] = item;
    btn.textContent = item.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
    btn.addEventListener('click', () => selectCustomization(category, item));
    container.appendChild(btn);
  });
}

function populateFallbackOptions() {
  // Basic hair options
  const hairList = document.getElementById('hair-list');
  ['long', 'short', 'ponytail', 'bald'].forEach(hair => {
    const btn = document.createElement('button');
    btn.className = 'list-btn';
    btn.dataset.hair = hair;
    btn.textContent = hair.charAt(0).toUpperCase() + hair.slice(1);
    btn.addEventListener('click', () => selectCustomization('hair', hair));
    hairList.appendChild(btn);
  });
}

function selectCustomization(category, value) {
  state.customization[category] = value;
  
  // Update UI
  document.querySelectorAll(`[data-${category}]`).forEach(btn => {
    btn.classList.toggle('active', btn.dataset[category] === value);
  });
  
  // Reload character with new customization
  loadCharacterLayers(state.currentGender, state.currentAnimation);
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
  
  // Draw body
  ctx.drawImage(
    state.bodySprite,
    sx, sy,
    CONFIG.spriteWidth, CONFIG.spriteHeight,
    0, 0,
    canvas.width, canvas.height
  );
  
  // Draw head if available
  if (state.headSprite) {
    ctx.drawImage(
      state.headSprite,
      sx, sy,
      CONFIG.spriteWidth, CONFIG.spriteHeight,
      0, 0,
      canvas.width, canvas.height
    );
  }
}

document.addEventListener('DOMContentLoaded', init);
