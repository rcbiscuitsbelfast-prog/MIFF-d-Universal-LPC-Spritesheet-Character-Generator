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
function listDirs(dir){ try { return fs.readdirSync(dir).map(f=>path.join(dir,f)).filter(p=>fs.existsSync(p)&&fs.statSync(p).isDirectory()); } catch { return []; } }
function findDirsContainingWalkPngs(root){
  const out = [];
  const stack = [root];
  while (stack.length){
    const d = stack.pop();
    const walkDir = path.join(d, 'walk');
    if (exists(walkDir) && listPngs(walkDir).length>0){ out.push(d); continue; }
    stack.push(...listDirs(d));
  }
  return out;
}

function exists(p){ try { fs.accessSync(p); return true; } catch { return false; } }

function exec(cmd){ return execSync(cmd, { stdio: 'inherit' }); }

function newBlankCanvas(dst){ exec(`magick convert -size ${SHEET_W}x${SHEET_H} canvas:none "${dst}"`); }

function compositeOnto(dst, src, y){ if (!exists(src)) return; exec(`magick composite -geometry +0+${y} "${src}" "${dst}" "${dst}"`); }

function overlayAsset(dst, assetDir, file){
  for (const anim of animOrder){
    const y = baseAnimations[anim];
    const p = typeof file === 'string' ? path.join(assetDir, anim, file) : path.join(file.dir || assetDir, anim, file.file);
    if (exists(p)) compositeOnto(dst, p, y);
  }
}

// Curated modern selections
function collectCandidates(){
  const c = {};
  c.body = {};
  for (const sex of ['male','female','teen','child']){
    const walkDir = path.join(SPRITES, 'body', 'bodies', sex, 'walk');
    c.body[sex] = listPngs(walkDir).map(f=>({ dir: path.join(SPRITES,'body','bodies',sex), file: f }));
  }

  // Heads (humans only), collect directories that contain per-animation subfolders
  const headRoots = findDirsContainingWalkPngs(path.join(SPRITES, 'head', 'heads', 'human'));
  c.head = headRoots.flatMap(d=> listPngs(path.join(d,'walk')).map(f=>({ dir: d, file: f })));
  // Filter out weird colors
  const badHead = /(zombie|green|lavender|pale_green|bright_green|fur_|alien|orc|troll|vampire|skeleton|minotaur|rabbit|rat|sheep|pig|mouse|boarman|goblin|wolf|lizard|jack|wartotaur)/i;
  c.head = c.head.filter(h=>!badHead.test(h.file) && !badHead.test(h.dir));

  const torsoRoot = path.join(SPRITES, 'torso', 'clothes');
  const torsoDirs = findDirsContainingWalkPngs(torsoRoot).filter(d=>!/(armor|chainmail|robe|tabard|vest|cape|kimono|dress)/i.test(d));
  c.torso = torsoDirs.flatMap(d=> listPngs(path.join(d,'walk')).map(f=>({ dir: d, file: f })));

  const legsRoot = path.join(SPRITES, 'legs');
  const legsDirs = findDirsContainingWalkPngs(legsRoot).filter(d=>/(pants|leggings|shorts|skirt)/i.test(d));
  c.legs = legsDirs.flatMap(d=> listPngs(path.join(d,'walk')).map(f=>({ dir: d, file: f })));

  const feetRoot = path.join(SPRITES, 'feet');
  const feetDirs = findDirsContainingWalkPngs(feetRoot).filter(d=>/(shoes|boots|sandals|socks)/i.test(d));
  c.feet = feetDirs.flatMap(d=> listPngs(path.join(d,'walk')).map(f=>({ dir: d, file: f })));

  const facialRoot = path.join(SPRITES, 'facial');
  const glassesDirs = findDirsContainingWalkPngs(facialRoot).filter(d=>/(glasses)/i.test(d));
  c.glasses = glassesDirs.flatMap(d=> listPngs(path.join(d,'walk')).map(f=>({ dir: d, file: f })));
  
  // Hair: choose a variety of styles, per sex/age buckets where available
  const hairRoot = path.join(SPRITES, 'hair');
  const hairDirs = findDirsContainingWalkPngs(hairRoot).filter(d=>!/(spiked_liberty|porcupine|wizard|helmet|hood)/i.test(d));
  c.hair = hairDirs.flatMap(d=> listPngs(path.join(d,'walk')).map(f=>({ dir: d, file: f })));
  return c;
}

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function roleList(){
  return [
    'Shopkeeper','Student','Retiree','Mechanic','Teacher','Parent','Toddler','Teenager',
    'Nurse','Cashier','Barista','Driver','Gardener','Chef','Delivery','Clerk','Coach','Farmer','Librarian','Police',
    'Mail','Firefighter','Janitor','Server','Babysitter','Artist','Musician','Carpenter','Plumber','Electrician',
    'Receptionist','Security','Groundskeeper','Courier','Volunteer','Neighbor','Friend','Child','Sibling','Grandparent'
  ];
}

function firstNameList(){
  return ['Alex','Avery','Bailey','Blake','Cameron','Casey','Charlie','Dakota','Drew','Elliot','Emerson','Finley','Harper','Hayden','Jamie','Jesse','Jordan','Jules','Kai','Logan','Max','Mica','Morgan','Noah','Parker','Quinn','Reese','Riley','Robin','Rowan','Sage','Sam','Shawn','Skyler','Taylor','Toby','Tyler','Wren','Zoe','Maya','Olivia','Emma','Liam','Noel','Nora','Hugo','Ivy','June','Eva','Luca','Leo','Milo','Ada','Ella','Isla','Mara','Gwen','Ruth','Sara','Owen','Oona','Asha','Aria','Ari','Cole','Evan','Ian','Nina','Iris','Kara','Kian','Ava','Asha','Arlo','Zara','Zane','Theo','Tess','Tia','Una','Vera','Violet','Wade','Wes','Yara','Yuri'];
}

function writeMetadata(filepath, meta){ fs.writeFileSync(filepath, JSON.stringify(meta, null, 2)); }

function buildMetadata(role){
  const frameCounts = { spellcast:7, thrust:8, walk:9, slash:6, shoot:13, hurt:6, climb:6, idle:2, jump:5, sit:3, emote:3, run:8, combat_idle:2, backslash:13, halfslash:7 };
  const anims = Object.entries(frameCounts).map(([tag, frames])=>({ tag, frames, timingMs: 125 }));
  return { role, creatureType: 'Humanoid', frame: { frameSize: FRAME, sheetWidth: SHEET_W, sheetHeight: SHEET_H }, animations: anims };
}

function generateOne(index, candidates, role, sex){
  const names = firstNameList();
  const first = names[index % names.length];
  const id = `prefab_${String(index+1).padStart(3,'0')}_${first}_${role}`;
  const outPng = path.join(OUTDIR, `${id}.png`);
  const outJson = path.join(OUTDIR, `${id}.json`);

  // Start fresh sheet
  newBlankCanvas(outPng);

  // Layer order: body, legs, feet, torso, head, hair, glasses
  const bodyFile = rand(candidates.body[sex] || []);
  if (bodyFile) overlayAsset(outPng, bodyFile.dir, bodyFile);

  const leg = rand(candidates.legs);
  if (leg) overlayAsset(outPng, leg.dir, leg.file);

  const foot = rand(candidates.feet);
  if (foot) overlayAsset(outPng, foot.dir, foot.file);

  const torso = rand(candidates.torso);
  if (torso) overlayAsset(outPng, torso.dir, torso.file);

  const headFile = rand(candidates.head);
  if (headFile) overlayAsset(outPng, headFile.dir, headFile);

  const hair = Math.random() < 0.9 ? rand(candidates.hair) : null;
  if (hair) overlayAsset(outPng, hair.dir, hair.file);

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

