/**
 * LPC Character Builder - Phase 1
 * Mobile-first animated character builder
 */

// Configuration
const CONFIG = {
  spriteWidth: 64,
  spriteHeight: 64,
  sheetColumns: 13,
  fps: 12,
  scale: 3,
  
  // Animation definitions
  animations: {
    walk: { row: 8, frames: 9, fps: 12 },
    idle: { row: 8, frames: 1, fps: 1 },  // First frame of walk
    slash: { row: 12, frames: 6, fps: 12 },
    spellcast: { row: 0, frames: 7, fps: 12 },
    shoot: { row: 16, frames: 13, fps: 12 },
    thrust: { row: 4, frames: 8, fps: 12 },
    hurt: { row: 20, frames: 6, fps: 8 }
  },
  
  // Direction offsets
  directions: {
    up: 0,
    left: 1,
    down: 2,
    right: 3
  },
  
  // Body types
  bodyTypes: {
    male: { path: 'body/bodies/male', color: 'light' },
    female: { path: 'body/bodies/female', color: 'light' },
    child: { path: 'body/bodies/child', color: 'light' },
    teen: { path: 'body/bodies/teen', color: 'light' }
  }
};

// Application state
const state = {
  currentGender: 'male',
  currentAnimation: 'walk',
  currentDirection: 'down',
  currentFrame: 0,
  isPlaying: true,
  spriteImage: null,
  lastFrameTime: 0
};

// DOM elements
const elements = {
  loading: null,
  app: null,
  canvas: null,
  ctx: null,
  genderButtons: null,
  animationButtons: null,
  currentAnimationText: null,
  currentDirectionText: null
};

/**
 * Initialize the application
 */
async function init() {
  console.log('?? Initializing LPC Character Builder...');
  
  // Get DOM elements
  elements.loading = document.getElementById('loading');
  elements.app = document.getElementById('app');
  elements.canvas = document.getElementById('character-canvas');
  elements.ctx = elements.canvas.getContext('2d');
  elements.currentAnimationText = document.getElementById('current-animation');
  elements.currentDirectionText = document.getElementById('current-direction');
  
  // Disable image smoothing for pixel art
  elements.ctx.imageSmoothingEnabled = false;
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial sprite
  await loadSprite(state.currentGender);
  
  // Hide loading, show app
  elements.loading.classList.add('hidden');
  elements.app.classList.remove('hidden');
  
  // Start animation loop
  requestAnimationFrame(animate);
  
  console.log('? Character Builder ready!');
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Gender selection
  document.querySelectorAll('[data-gender]').forEach(button => {
    button.addEventListener('click', handleGenderChange);
  });
  
  // Animation selection
  document.querySelectorAll('[data-animation]').forEach(button => {
    button.addEventListener('click', handleAnimationChange);
  });
  
  // Navigation buttons (Phase 4)
  document.getElementById('btn-export')?.addEventListener('click', () => {
    showToast('Export feature coming in Phase 4!');
  });
  
  document.getElementById('btn-import')?.addEventListener('click', () => {
    showToast('Import feature coming in Phase 4!');
  });
  
  document.getElementById('btn-help')?.addEventListener('click', () => {
    showToast('Help: Select body type and animation to preview your character');
  });
}

/**
 * Handle gender/body type change
 */
async function handleGenderChange(event) {
  const button = event.currentTarget;
  const gender = button.dataset.gender;
  
  if (gender === state.currentGender) return;
  
  // Update button states
  document.querySelectorAll('[data-gender]').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');
  
  // Update state
  state.currentGender = gender;
  state.currentFrame = 0;
  
  // Show loading state
  button.classList.add('loading');
  
  // Load new sprite
  await loadSprite(gender);
  
  // Remove loading state
  button.classList.remove('loading');
  
  console.log(`? Changed gender to: ${gender}`);
}

/**
 * Handle animation change
 */
function handleAnimationChange(event) {
  const button = event.currentTarget;
  const animation = button.dataset.animation;
  
  if (animation === state.currentAnimation) return;
  
  // Update button states
  document.querySelectorAll('[data-animation]').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');
  
  // Update state
  state.currentAnimation = animation;
  state.currentFrame = 0;
  
  // Update UI
  elements.currentAnimationText.textContent = animation.charAt(0).toUpperCase() + animation.slice(1);
  
  console.log(`? Changed animation to: ${animation}`);
}

/**
 * Load sprite image for given gender
 */
async function loadSprite(gender) {
  return new Promise((resolve, reject) => {
    const bodyType = CONFIG.bodyTypes[gender];
    
    // Construct sprite path
    // Format: /spritesheets/body/bodies/{type}/walk/{color}.png
    // For Phase 1, we'll use walk spritesheet as it contains multiple animations
    const spritePath = `/spritesheets/${bodyType.path}/walk/${bodyType.color}.png`;
    
    console.log(`?? Loading sprite: ${spritePath}`);
    
    const img = new Image();
    
    img.onload = () => {
      state.spriteImage = img;
      console.log(`? Sprite loaded: ${img.width}x${img.height}`);
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.error('? Failed to load sprite:', spritePath);
      
      // Try alternative path (some sprites might be in different locations)
      const altPath = `/spritesheets/body/bodies/${gender}/${bodyType.color}.png`;
      console.log(`?? Trying alternative path: ${altPath}`);
      
      const altImg = new Image();
      altImg.onload = () => {
        state.spriteImage = altImg;
        console.log(`? Sprite loaded from alt path`);
        resolve(altImg);
      };
      altImg.onerror = () => {
        console.error('? Failed to load sprite from alt path');
        showToast('Failed to load character sprite');
        reject(error);
      };
      altImg.src = altPath;
    };
    
    img.src = spritePath;
  });
}

/**
 * Main animation loop
 */
function animate(timestamp) {
  if (!state.isPlaying) {
    requestAnimationFrame(animate);
    return;
  }
  
  const animConfig = CONFIG.animations[state.currentAnimation];
  const frameDelay = 1000 / animConfig.fps;
  
  // Update frame based on time
  if (timestamp - state.lastFrameTime >= frameDelay) {
    state.currentFrame = (state.currentFrame + 1) % animConfig.frames;
    state.lastFrameTime = timestamp;
  }
  
  // Render current frame
  render();
  
  // Continue animation
  requestAnimationFrame(animate);
}

/**
 * Render current frame to canvas
 */
function render() {
  if (!state.spriteImage) return;
  
  const { ctx, canvas } = elements;
  const animConfig = CONFIG.animations[state.currentAnimation];
  const directionOffset = CONFIG.directions[state.currentDirection];
  
  // Calculate source position in spritesheet
  const row = animConfig.row + directionOffset;
  const col = state.currentFrame;
  
  const sx = col * CONFIG.spriteWidth;
  const sy = row * CONFIG.spriteHeight;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw sprite
  ctx.drawImage(
    state.spriteImage,
    sx, sy,
    CONFIG.spriteWidth, CONFIG.spriteHeight,
    0, 0,
    canvas.width, canvas.height
  );
}

/**
 * Show toast notification
 */
function showToast(message, duration = 3000) {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(toast => toast.remove());
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Auto-remove
  setTimeout(() => {
    toast.remove();
  }, duration);
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging
if (typeof window !== 'undefined') {
  window.LPCBuilder = {
    state,
    CONFIG,
    loadSprite,
    showToast
  };
}
