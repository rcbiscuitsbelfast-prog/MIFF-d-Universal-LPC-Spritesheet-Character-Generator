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
