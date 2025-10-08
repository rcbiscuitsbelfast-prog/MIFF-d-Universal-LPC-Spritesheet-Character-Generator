/*
 Automated prefab generator for modern small-town characters.
 - Composes LPC-style spritesheets by layering existing asset sheets with ImageMagick.
 - Outputs 100 PNG + JSON files into /workspace/prefab
 - Requires ImageMagick (magick) available in PATH.
*/

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

// Sheet geometry
const FRAME = 64;
const SHEET_W = 832;
const SHEET_H = 3456;

// Humanoid base rows (match chargen)
const baseAnimations = {
  spellcast: 0,
  thrust: 4 * FRAME,
  walk: 8 * FRAME,
  slash: 12 * FRAME,
  shoot: 16 * FRAME,
  hurt: 20 * FRAME,
  climb: 21 * FRAME,
  idle: 22 * FRAME,
  jump: 26 * FRAME,
  sit: 30 * FRAME,
  emote: 34 * FRAME,
  run: 38 * FRAME,
  combat_idle: 42 * FRAME,
  backslash: 46 * FRAME,
  halfslash: 50 * FRAME,
};

const animOrder = Object.keys(baseAnimations);

const ROOT = '/workspace';
const SPRITES = path.join(ROOT, 'spritesheets');
const OUTDIR = path.join(ROOT, 'prefab');

function ensureDir(dir){ if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function listPngs(dir){ try { return fs.readdirSync(dir).filter(f=>f.endsWith('.png')); } catch { return []; } }

function exists(p){ try { fs.accessSync(p); return true; } catch { return false; } }

function exec(cmd){ return execSync(cmd, { stdio: 'inherit' }); }

function newBlankCanvas(dst){ exec(`magick convert -size ${SHEET_W}x${SHEET_H} canvas:none "${dst}"`); }

function compositeOnto(dst, src, y){ if (!exists(src)) return; exec(`magick composite -geometry +0+${y} "${src}" "${dst}" "${dst}"`); }

function overlayAsset(dst, assetDir, file){
  for (const anim of animOrder){
    const y = baseAnimations[anim];
    const p = path.join(assetDir, anim, file);
    if (exists(p)) compositeOnto(dst, p, y);
  }
}

// Curated modern selections
function collectCandidates(){
  const c = {};
  c.body = {
    male: listPngs(path.join(SPRITES, 'body', 'bodies', 'male')), 
    female: listPngs(path.join(SPRITES, 'body', 'bodies', 'female')),
    teen: listPngs(path.join(SPRITES, 'body', 'bodies', 'teen')),
    child: listPngs(path.join(SPRITES, 'body', 'bodies', 'child')),
  };

  c.head = listPngs(path.join(SPRITES, 'head', 'heads')).filter(f=>/human|male|female|child/i.test(f));

  const torsoDir = path.join(SPRITES, 'torso', 'clothes');
  c.torso = fs.readdirSync(torsoDir).flatMap(sub=>{
    const d = path.join(torsoDir, sub);
    if (!fs.statSync(d).isDirectory()) return [];
    if (/armor|chainmail|robe|tabard|vest|cape|kimono|dress/i.test(sub)) return [];
    return listPngs(d).map(f=>({ dir: d, file: f }));
  });

  const legsDir = path.join(SPRITES, 'legs');
  c.legs = [];
  for (const sub of ['pants','pants2','leggings','shorts','skirts_plain','skirt_straight']){
    const d = fs.existsSync(path.join(legsDir, sub)) ? path.join(legsDir, sub) : null;
    if (d) c.legs.push(...listPngs(d).map(f=>({ dir: d, file: f })));
  }

  const feetDir = path.join(SPRITES, 'feet');
  c.feet = [];
  for (const sub of ['shoes_basic','shoes_revised','boots_revised','sandals','socks']){
    const d = fs.existsSync(path.join(feetDir, sub)) ? path.join(feetDir, sub) : null;
    if (d) c.feet.push(...listPngs(d).map(f=>({ dir: d, file: f })));
  }

  const facialDir = path.join(SPRITES, 'facial');
  c.glasses = [];
  for (const sub of ['glasses','glasses_round','glasses_shades','glasses_secretary']){
    const d = fs.existsSync(path.join(facialDir, sub)) ? path.join(facialDir, sub) : null;
    if (d) c.glasses.push(...listPngs(d).map(f=>({ dir: d, file: f })));
  }
  return c;
}

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function roleList(){
  return [
    'shopkeeper','student','retiree','mechanic','teacher','parent','toddler','teenager',
    'nurse','cashier','barista','driver','gardener','chef','delivery','clerk','coach','farmer','librarian','police',
    'mail','firefighter','janitor','server','babysitter','artist','musician','carpenter','plumber','electrician',
    'receptionist','security','groundskeeper','courier','volunteer','neighbor','friend','child','sibling','grandparent'
  ];
}

function writeMetadata(filepath, meta){ fs.writeFileSync(filepath, JSON.stringify(meta, null, 2)); }

function buildMetadata(role){
  const frameCounts = { spellcast:7, thrust:8, walk:9, slash:6, shoot:13, hurt:6, climb:6, idle:2, jump:5, sit:3, emote:3, run:8, combat_idle:2, backslash:13, halfslash:7 };
  const anims = Object.entries(frameCounts).map(([tag, frames])=>({ tag, frames, timingMs: 125 }));
  return { role, creatureType: 'Humanoid', frame: { frameSize: FRAME, sheetWidth: SHEET_W, sheetHeight: SHEET_H }, animations: anims };
}

function generateOne(index, candidates, role, sex){
  const id = `prefab_${String(index+1).padStart(3,'0')}_${role}`;
  const outPng = path.join(OUTDIR, `${id}.png`);
  const outJson = path.join(OUTDIR, `${id}.json`);

  // Start fresh sheet
  newBlankCanvas(outPng);

  // Layer order: body, legs, feet, torso, head, glasses
  const bodyDir = path.join(SPRITES, 'body', 'bodies', sex);
  const bodyFile = rand(candidates.body[sex] || []);
  if (bodyFile) overlayAsset(outPng, bodyDir, bodyFile);

  const leg = rand(candidates.legs);
  if (leg) overlayAsset(outPng, leg.dir, leg.file);

  const foot = rand(candidates.feet);
  if (foot) overlayAsset(outPng, foot.dir, foot.file);

  const torso = rand(candidates.torso);
  if (torso) overlayAsset(outPng, torso.dir, torso.file);

  const headDir = path.join(SPRITES, 'head', 'heads');
  const headFile = rand(candidates.head);
  if (headFile) overlayAsset(outPng, headDir, headFile);

  const glass = Math.random() < 0.3 ? rand(candidates.glasses) : null;
  if (glass) overlayAsset(outPng, glass.dir, glass.file);

  // Write metadata
  writeMetadata(outJson, buildMetadata(role));
  return { id, outPng };
}

function main(){
  // Check magick presence
  try { spawnSync('magick',['-version'],{stdio:'ignore'}); } catch { throw new Error('ImageMagick (magick) is required'); }
  ensureDir(OUTDIR);
  const roles = roleList();
  const candidates = collectCandidates();
  const sexes = ['male','female','teen','child'];
  const generated = [];
  for (let i=0;i<100;i++){
    const role = roles[i % roles.length];
    const sex = sexes[i % sexes.length];
    generated.push(generateOne(i, candidates, role, sex));
  }
  console.log('Generated', generated.length, 'prefabs in', OUTDIR);
}

if (require.main === module){
  main();
}

