// App-level wiring for modern site shell

const byId = (id) => document.getElementById(id);

function toggleSidebar() {
  const open = document.body.classList.toggle('sidebar-open');
  byId('menuBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
}

function buildAnimBar() {
  const whichAnim = byId('whichAnim');
  const animBar = byId('animBar');
  if (!whichAnim || !animBar) return;
  const sync = () => {
    animBar.innerHTML = '';
    Array.from(whichAnim.options).forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = opt.text;
      btn.setAttribute('aria-pressed', String(opt.selected));
      btn.addEventListener('click', () => {
        whichAnim.value = opt.value;
        whichAnim.dispatchEvent(new Event('change', { bubbles: true }));
        animBar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
      });
      animBar.appendChild(btn);
    });
  };
  sync();
  whichAnim.addEventListener('change', sync);
}

async function mountChooserIntoSidebar() {
  const res = await fetch('../sources/source_index.html');
  const html = await res.text();
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const customizeForm = temp.querySelector('#customizeChar');
  if (!customizeForm) return;
  // Strip original header and credits from sidebar
  customizeForm.querySelector('#header-left')?.remove();
  customizeForm.querySelector('#preview-animations')?.remove();
  const credits = temp.querySelector('#credits');
  const advanced = temp.querySelector('#advanced');

  const sectionsHost = byId('customizeSections');
  sectionsHost.innerHTML = '';

  const headings = Array.from(customizeForm.querySelectorAll('h3'));
  for (const h3 of headings) {
    const title = h3.textContent.trim();
    const ul = h3.nextElementSibling;
    if (!ul || ul.tagName !== 'UL') continue;
    const details = document.createElement('details');
    details.open = false;
    const summary = document.createElement('summary');
    summary.textContent = title;
    details.appendChild(summary);
    details.appendChild(ul);
    sectionsHost.appendChild(details);
  }

  // Put Credits and Advanced as separate sections at the end of the page
  const sheet = document.querySelector('#sheet');
  if (credits) sheet.appendChild(credits);
  if (advanced) sheet.appendChild(advanced);
}

function wireNav() {
  byId('navExport').addEventListener('click', () => byId('saveAsPNG')?.click());
  byId('navImport').addEventListener('click', () => document.querySelector('.importFromClipboard')?.click());
  byId('navPreview').addEventListener('click', () => document.getElementById('spritesheet')?.scrollIntoView({ behavior: 'smooth' }));
  byId('navBatch').addEventListener('click', runBatchPrefabGeneration);
  byId('menuBtn').addEventListener('click', toggleSidebar);
  byId('resetCharacter').addEventListener('click', () => {
    const male = document.getElementById('sex-male');
    document.querySelectorAll('#customizeSections input[type=radio]').forEach(el => { el.checked = false; el.removeAttribute('checked'); });
    if (male) { male.checked = true; male.setAttribute('checked', 'checked'); }
    window.jHash?.val?.({});
    window.location.hash = '';
    // Trigger redraw via existing chargen hooks
    document.getElementById('resetAll')?.click();
  });
}

function wireCreatureType() {
  const sel = byId('creatureType');
  if (!sel) return;
  sel.addEventListener('change', (e) => {
    if (window.setCreatureType) window.setCreatureType(e.target.value);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  await mountChooserIntoSidebar();
  buildAnimBar();
  wireNav();
  wireCreatureType();
});

// --- Batch prefab generation ---
async function runBatchPrefabGeneration() {
  try {
    const roles = [
      'shopkeeper','student','retiree','mechanic','teacher','parent','toddler','teenager',
      'nurse','cashier','barista','driver','gardener','chef','delivery','clerk','coach','farmer','librarian','police',
      'mail','firefighter','janitor','server','babysitter','artist','musician','carpenter','plumber','electrician',
      'receptionist','security','groundskeeper','courier','volunteer','neighbor','friend','child','sibling','grandparent'
    ];

    const prefabDir = 'prefab';
    await ensureRootFolder(prefabDir);

    // Traits pools constrained to modern attire
    const sexes = ['male','female','teen','child'];
    const bodyColors = ['light','tan','brown','dark'];
    const headVariants = ['Human_male','Human_female','Human_male_small','Human_female_small','Human_male_gaunt','Human_male_plump','Human_female_elderly','Human_male_elderly','Human_child'];
    const shirts = ['tshirt','tshirt_vneck','tshirt_scoop','longsleeve','longsleeve_scoop','longsleeve_formal','cardigan','polo'];
    const legs = ['pants','pants2','leggings','shorts','skirt_straight'];
    const feet = ['shoes_basic','shoes_revised','boots_revised','sandals','socks'];
    const accessories = ['glasses','glasses_round','earring_left','earring_right','none'];

    const uniq = new Set();
    const count = 100;
    for (let i = 0; i < count; i++) {
      // Choose role
      const role = roles[i % roles.length];
      // Random traits
      const sex = pick(sexes);
      const color = pick(bodyColors);
      const head = pick(headVariants);
      const shirt = pick(shirts);
      const leg = pick(legs);
      const foot = pick(feet);
      const accessory = pick(accessories);

      const id = `prefab_${String(i+1).padStart(3,'0')}_${role}`;
      if (uniq.has(id)) { i--; continue; }
      uniq.add(id);

      // Apply to UI (simulate selections)
      setRadioSafely(`sex-${sex}`);
      setRadioSafely(`body-Body_color_${color}`);
      trySetHead(head, color);
      trySelectShirt(shirt);
      trySelectLeg(leg);
      trySelectFoot(foot);
      trySelectAccessory(accessory);

      // Redraw and wait a tick
      await new Promise(r => setTimeout(r, 50));
      if (window.jHash) jHash.val({});
      if (window.profiler) {}

      // Export spritesheet PNG blob
      const canvas = document.getElementById('spritesheet');
      const pngBlob = await canvasToBlobPolyfill(canvas);

      // Build metadata
      const meta = buildMetadata(role);

      // Save both files to root/prefab via in-browser download (stays in user Downloads). As a fallback, zip all.
      await saveAsFile(`${prefabDir}/${id}.png`, pngBlob);
      await saveAsFile(`${prefabDir}/${id}.json`, new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' }));
    }

    alert('Batch generation queued: 100 prefab files will download. Move the downloaded prefab folder into your repo main miff folder.');
  } catch (e) {
    console.error('Batch generation failed', e);
    alert('Batch generation failed: ' + e.message);
  }
}

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function setRadioSafely(id){ const el = document.getElementById(id); if (el) { el.checked = true; el.setAttribute('checked','checked'); el.click?.(); } }

function trySetHead(headVariant, color) {
  const id = `head-${headVariant}_${color}`;
  setRadioSafely(id);
}
function trySelectShirt(name){
  const ids = [
    `torso_clothes_tshirt_${name.split('tshirt_')[1]||''}`,
    `torso_clothes_${name}`,
    `torso_clothes_longsleeve_${name.split('longsleeve_')[1]||''}`
  ];
  for (const suffix of ids){
    const matches = Array.from(document.querySelectorAll(`[id^="torso_clothes-"]`)).filter(el=>el.id.includes(suffix));
    if (matches[0]) { matches[0].checked = true; matches[0].click?.(); return; }
  }
}
function trySelectLeg(name){ const el = Array.from(document.querySelectorAll(`[id^="legs-"]`)).find(e=>e.id.includes(name)); if (el){ el.checked=true; el.click?.(); }}
function trySelectFoot(name){ const el = Array.from(document.querySelectorAll(`[id^="feet-"]`)).find(e=>e.id.includes(name)); if (el){ el.checked=true; el.click?.(); }}
function trySelectAccessory(name){ if (name==='none') return; const el = Array.from(document.querySelectorAll(`[id^="facial-"]`)).find(e=>e.id.includes(name)); if (el){ el.checked=true; el.click?.(); }}

function buildMetadata(role){
  const frameCounts = window.animationFrameCounts || {};
  const dims = { frameSize: 64 };
  const anims = Object.keys(frameCounts).map(k=>({ tag: k, frames: frameCounts[k], timingMs: 125 }));
  const meta = { role, creatureType: (document.getElementById('creatureType')?.value)||'Humanoid', frame: dims, animations: anims };
  return meta;
}

async function canvasToBlobPolyfill(canvas){
  return await new Promise((resolve, reject)=>{
    if (!canvas) return reject(new Error('Canvas not found'));
    if (canvas.toBlob) canvas.toBlob(b=> b? resolve(b):reject(new Error('PNG failed')), 'image/png');
    else resolve(new Blob([canvas.toDataURL('image/png')], { type: 'image/png' }));
  });
}

async function ensureRootFolder(){ /* Browser cannot write to repo; files will download to user */ }

async function saveAsFile(filename, blob){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}
