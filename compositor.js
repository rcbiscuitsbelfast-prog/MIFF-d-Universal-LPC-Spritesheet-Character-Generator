/**
 * Sprite Sheet Compositor
 * Creates a single master sprite sheet with all animations composited
 */

// Sprite sheet layout configuration
const SPRITE_LAYOUT = {
  frameWidth: 64,
  frameHeight: 64,
  sheetColumns: 13, // Maximum frames in any animation
  
  // Animation row mapping (each animation takes 4 rows for 4 directions)
  animationRows: {
    walk: 0,
    idle: 4,
    slash: 8,
    halfslash: 12,
    backslash: 16,
    spellcast: 20,
    shoot: 24,
    thrust: 28,
    hurt: 32,      // Single direction (only uses 1 row)
    jump: 33,
    run: 37,
    sit: 41,
    climb: 45,     // Single direction (only uses 1 row)
    combat_idle: 46,
    emote: 50
  }
};

// Calculate total sheet height
const TOTAL_ROWS = 54; // Enough for all animations
const SHEET_HEIGHT = TOTAL_ROWS * SPRITE_LAYOUT.frameHeight;
const SHEET_WIDTH = SPRITE_LAYOUT.sheetColumns * SPRITE_LAYOUT.frameWidth;

/**
 * Load all animations for a specific layer type
 */
async function loadAllAnimationsForLayer(basePath, color, animations) {
  const loadedAnimations = {};
  
  for (const [name, config] of Object.entries(animations)) {
    const animPath = `${basePath}/${config.dir}/${color}.png`;
    
    try {
      const img = await loadImage(animPath);
      loadedAnimations[name] = img;
      console.log(`? Loaded ${name} for ${basePath}`);
    } catch (e) {
      // Try walk as fallback
      if (config.dir !== 'walk') {
        try {
          const walkPath = `${basePath}/walk/${color}.png`;
          const img = await loadImage(walkPath);
          loadedAnimations[name] = img;
          console.log(`?? Using walk fallback for ${name}`);
        } catch (e2) {
          console.warn(`? Failed to load ${name} for ${basePath}`);
          loadedAnimations[name] = null;
        }
      } else {
        loadedAnimations[name] = null;
      }
    }
  }
  
  return loadedAnimations;
}

/**
 * Create composite sprite sheet with all layers
 */
async function createCompositeSpriteSheet(options) {
  console.log('?? Creating composite sprite sheet...');
  
  const {
    bodyType,
    bodyColor,
    headColor,
    hair,
    hairColor,
    torso,
    torsoColor,
    legs,
    legsColor,
    ears,
    earsColor,
    nose,
    noseColor,
    wings,
    wingsColor,
    tail,
    tailColor
  } = options;
  
  // Create master canvas
  const canvas = document.createElement('canvas');
  canvas.width = SHEET_WIDTH;
  canvas.height = SHEET_HEIGHT;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  
  // Load all animations for each layer
  const bodyPath = `/spritesheets/${CONFIG.bodyTypes[bodyType].path}`;
  const headPath = `/spritesheets/${CONFIG.bodyTypes[bodyType].headPath}`;
  
  console.log('?? Loading body animations...');
  const bodyAnimations = await loadAllAnimationsForLayer(bodyPath, bodyColor, CONFIG.animations);
  
  let headAnimations = {};
  if (CONFIG.bodyTypes[bodyType].loadHead) {
    console.log('?? Loading head animations...');
    headAnimations = await loadAllAnimationsForLayer(headPath, headColor, CONFIG.animations);
  }
  
  let hairAnimations = {};
  if (hair && hair !== 'none') {
    console.log('?? Loading hair animations...');
    const hairPath = `/spritesheets/hair/${hair}/adult`;
    hairAnimations = await loadAllAnimationsForLayer(hairPath, hairColor, CONFIG.animations);
  }
  
  let torsoAnimations = {};
  if (torso && torso !== 'none') {
    console.log('?? Loading torso animations...');
    const torsoPath = `/spritesheets/torso/clothes/${torso}/${bodyType}`;
    torsoAnimations = await loadAllAnimationsForLayer(torsoPath, torsoColor, CONFIG.animations);
  }
  
  let legsAnimations = {};
  if (legs && legs !== 'none') {
    console.log('?? Loading legs animations...');
    const legsPath = `/spritesheets/legs/${legs}/${bodyType}`;
    legsAnimations = await loadAllAnimationsForLayer(legsPath, legsColor, CONFIG.animations);
  }
  
  // Composite each animation
  for (const [animName, config] of Object.entries(CONFIG.animations)) {
    const startRow = SPRITE_LAYOUT.animationRows[animName];
    const directions = config.singleDirection ? 1 : 4;
    
    for (let dir = 0; dir < directions; dir++) {
      const targetRow = startRow + dir;
      const sourceY = dir * SPRITE_LAYOUT.frameHeight;
      const targetY = targetRow * SPRITE_LAYOUT.frameHeight;
      
      // Draw each layer in order
      const layers = [
        bodyAnimations[animName],
        legsAnimations[animName],
        torsoAnimations[animName],
        headAnimations[animName],
        hairAnimations[animName]
      ];
      
      for (const layer of layers) {
        if (layer) {
          ctx.drawImage(
            layer,
            0, sourceY,
            SHEET_WIDTH, SPRITE_LAYOUT.frameHeight,
            0, targetY,
            SHEET_WIDTH, SPRITE_LAYOUT.frameHeight
          );
        }
      }
    }
    
    console.log(`? Composited ${animName}`);
  }
  
  console.log('?? Composite sprite sheet complete!');
  
  // Convert canvas to image
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = URL.createObjectURL(blob);
    });
  });
}

/**
 * Get the row number for a specific animation and direction
 */
function getAnimationRow(animationName, direction) {
  const baseRow = SPRITE_LAYOUT.animationRows[animationName];
  const animConfig = CONFIG.animations[animationName];
  
  if (animConfig.singleDirection) {
    return baseRow;
  }
  
  const directionOffsets = {
    up: 0,
    left: 1,
    down: 2,
    right: 3
  };
  
  return baseRow + directionOffsets[direction];
}
