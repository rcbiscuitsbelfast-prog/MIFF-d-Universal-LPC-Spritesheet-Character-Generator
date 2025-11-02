/**
 * LPC Character Builder - FIXED VERSION
 * With head layer and per-animation sprite loading
 */

const CONFIG = {
  spriteWidth: 64,
  spriteHeight: 64,
  sheetColumns: 13,
  fps: 12,
  scale: 3,
  
  animations: {
    walk: { row: 0, frames: 9, fps: 12, dir: 'walk' },
    idle: { row: 0, frames: 1, fps: 1, dir: 'idle' },
    slash: { row: 0, frames: 6, fps: 12, dir: 'slash' },
    spellcast: { row: 0, frames: 7, fps: 12, dir: 'spellcast' },
    shoot: { row: 0, frames: 13, fps: 12, dir: 'shoot' },
    thrust: { row: 0, frames: 8, fps: 12, dir: 'thrust' },
    hurt: { row: 0, frames: 6, fps: 8, dir: 'hurt' }
  },
  
  directions: {
    up: 0,
    left: 1,
    down: 2,
    right: 3
  },
  
  bodyTypes: {
    male: { path: 'body/bodies/male', headPath: 'head/heads/human/male', bodyColor: 'light', headColor: 'light' },
    female: { path: 'body/bodies/female', headPath: 'head/heads/human/female', bodyColor: 'light', headColor: 'light' },
    child: { path: 'body/bodies/child', headPath: 'head/heads/human/child', bodyColor: 'light', headColor: null },
    teen: { path: 'body/bodies/teen', headPath: 'head/heads/human/male', bodyColor: 'light', headColor: 'light' }
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
  lastFrameTime: 0
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
  
  document.querySelectorAll('[data-animation]').forEach(button => {
    button.addEventListener('click', async (e) => {
      const animation = e.currentTarget.dataset.animation;
      if (animation === state.currentAnimation) return;
      
      document.querySelectorAll('[data-animation]').forEach(btn => btn.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      state.currentAnimation = animation;
      state.currentFrame = 0;
      
      const animText = document.getElementById('current-animation');
      if (animText) {
        animText.textContent = animation.charAt(0).toUpperCase() + animation.slice(1);
      }
      
      await loadCharacter(state.currentGender, animation);
    });
  });
  
  const btnHelp = document.getElementById('btn-help');
  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      alert('LPC Character Builder\n\nSelect body type and animation.\nHead layer will be added next!');
    });
  }
}

async function loadCharacter(gender, animation) {
  const bodyType = CONFIG.bodyTypes[gender];
  const animConfig = CONFIG.animations[animation];
  const animDir = animConfig.dir;
  
  // Load body sprite for this animation
  const bodyPaths = [
    `/spritesheets/${bodyType.path}/${animDir}/${bodyType.bodyColor}.png`,
    `/spritesheets/${bodyType.path}/${animDir}.png`,
    `/spritesheets/${bodyType.path}/${bodyType.bodyColor}.png`
  ];
  
  console.log(`?? Loading ${gender} ${animation}...`);
  console.log('Body paths:', bodyPaths);
  
  try {
    state.bodySprite = await loadImageWithFallback(bodyPaths);
  } catch (e) {
    console.error('Body failed:', e);
    state.bodySprite = null;
    return;
  }
  
  // Try to load head sprite
  // Child heads have different structure: flat files with no color subdirectory
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
    console.warn('Head not found, using body only');
    state.headSprite = null;
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
  const directionOffset = CONFIG.directions[state.currentDirection];
  
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
  
  // Draw head on top if available
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
