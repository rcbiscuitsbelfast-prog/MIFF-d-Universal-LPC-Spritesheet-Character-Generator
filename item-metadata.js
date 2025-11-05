/**
 * Item Gender Metadata
 * Tags all customization items with gender information
 */

const ITEM_METADATA = {
  // Hair styles (generally unisex)
  hair: {
    long: { gender: ['male', 'female', 'teen'] },
    short: { gender: ['male', 'female', 'teen'] },
    messy: { gender: ['male', 'female', 'teen'] },
    ponytail: { gender: ['male', 'female', 'teen'] },
    braid: { gender: ['female', 'teen'] },
    bangs: { gender: ['female', 'teen'] },
    cowlick: { gender: ['male', 'teen'] },
    shorthawk: { gender: ['male', 'teen'] },
    longhawk: { gender: ['male', 'female', 'teen'] },
    plain: { gender: ['male', 'female', 'teen'] },
    wavy: { gender: ['female', 'teen'] },
    curly: { gender: ['female', 'teen'] },
    beard: { gender: ['male'] },
    mustache: { gender: ['male'] }
  },
  
  // Torso items
  torso: {
    blouse: { gender: ['female'] },
    blouse_longsleeve: { gender: ['female'] },
    corset: { gender: ['female'] },
    longsleeve: { gender: ['male', 'female', 'teen'] },
    robe: { gender: ['male', 'female', 'teen'] },
    shirt: { gender: ['male', 'teen'] },
    shortsleeve: { gender: ['male', 'female', 'teen'] },
    sleeveless: { gender: ['male', 'female', 'teen'] },
    tunic: { gender: ['male', 'female', 'teen'] },
    tunic_sara: { gender: ['female'] },
    vest: { gender: ['male', 'female', 'teen'] },
    vest_open: { gender: ['male', 'teen'] }
  },
  
  // Legs items
  legs: {
    pants: { gender: ['male', 'female', 'teen'] },
    pants2: { gender: ['male', 'female', 'teen'] },
    skirt: { gender: ['female'] },
    dress: { gender: ['female'] },
    armour: { gender: ['male', 'female', 'teen'] },
    thin: { gender: ['female', 'teen'] }
  },
  
  // Ears (generally unisex)
  ears: {
    elven: { gender: ['male', 'female', 'teen'] },
    cat: { gender: ['male', 'female', 'teen'] },
    dragon: { gender: ['male', 'female', 'teen'] },
    wolf: { gender: ['male', 'female', 'teen'] },
    big: { gender: ['male', 'female', 'teen'] },
    down: { gender: ['male', 'female', 'teen'] },
    hang: { gender: ['male', 'female', 'teen'] },
    long: { gender: ['male', 'female', 'teen'] },
    medium: { gender: ['male', 'female', 'teen'] },
    avyon: { gender: ['male', 'female', 'teen'] },
    lykon: { gender: ['male', 'female', 'teen'] },
    zabos: { gender: ['male', 'female', 'teen'] }
  },
  
  // Nose (generally unisex)
  nose: {
    big: { gender: ['male', 'female', 'teen'] },
    button: { gender: ['male', 'female', 'teen'] },
    elderly: { gender: ['male', 'female'] },
    large: { gender: ['male', 'female', 'teen'] },
    straight: { gender: ['male', 'female', 'teen'] }
  },
  
  // Wings (unisex)
  wings: {
    bat: { gender: ['male', 'female', 'teen'] },
    dragonfly: { gender: ['male', 'female', 'teen'] },
    feathered: { gender: ['male', 'female', 'teen'] },
    lizard: { gender: ['male', 'female', 'teen'] },
    lunar: { gender: ['male', 'female', 'teen'] },
    monarch: { gender: ['male', 'female', 'teen'] },
    pixie: { gender: ['male', 'female', 'teen'] }
  },
  
  // Tail (unisex)
  tail: {
    cat: { gender: ['male', 'female', 'teen'] },
    fluffy: { gender: ['male', 'female', 'teen'] },
    lizard: { gender: ['male', 'female', 'teen'] },
    wolf: { gender: ['male', 'female', 'teen'] }
  }
};

/**
 * Get gender tags for an item
 */
function getItemGender(category, itemName) {
  if (ITEM_METADATA[category] && ITEM_METADATA[category][itemName]) {
    return ITEM_METADATA[category][itemName].gender;
  }
  // Default: available for all genders if not specified
  return ['male', 'female', 'teen'];
}

/**
 * Check if item should be excluded based on filters
 */
function shouldExcludeItem(category, itemName, excludeMale, excludeFemale) {
  const genders = getItemGender(category, itemName);
  
  if (excludeMale && excludeFemale) {
    // If both excluded, only show unisex items (those with both tags)
    return !(genders.includes('male') && genders.includes('female'));
  }
  
  if (excludeMale) {
    // Exclude items ONLY for males
    return genders.includes('male') && !genders.includes('female');
  }
  
  if (excludeFemale) {
    // Exclude items ONLY for females
    return genders.includes('female') && !genders.includes('male');
  }
  
  return false; // Don't exclude
}

/**
 * Filter items based on gender exclusions
 */
function filterItemsByGender(category, items, excludeMale, excludeFemale) {
  if (!excludeMale && !excludeFemale) {
    return items; // No filtering
  }
  
  return items.filter(item => {
    return !shouldExcludeItem(category, item, excludeMale, excludeFemale);
  });
}
