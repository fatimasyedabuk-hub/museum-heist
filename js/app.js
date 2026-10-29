/* THE MUSEUM HEIST – vanilla JS (CCT 360 Interactive Discovery)
   Structure: 1) data  2) state + localStorage  3) helpers  4) navigation  5) scene renderers  6) modals  7) events  8) init
   One state object `S` is the single source of truth; every click updates S, saves it, then re-renders the scene. */
const IMG = 'assets/images/';
const KEY = 'museumHeist.v1';
const NEED_INTERVIEWS = 2, NEED_FINAL = 3;

/* ---------- Data ---------- */
const SCENES = [
  { id: 1, name: 'Introduction', icon: 'map', bg: 'museum-exterior.jpg' },
  { id: 2, name: 'Investigation Board', icon: 'notebook', bg: 'investigation-board.jpg' },
  { id: 3, name: 'Gallery', icon: 'search', bg: 'gallery.jpg' },
  { id: 4, name: 'Security Room', icon: 'cctv', bg: 'security-room.jpg', },
  { id: 5, name: 'Suspect Interviews', icon: 'lock', bg: 'suspect-interviews.jpg', need: NEED_INTERVIEWS },
  { id: 6, name: 'Final Reveal', icon: 'fingerprint', bg: 'final-reveal.jpg', need: NEED_FINAL }
];
const ICON_FILES = { search: 'search-icon.png', map: 'map-icon.png', notebook: 'icon-notebook.png', lock: 'lock-icon.png', fingerprint: 'finger-print.png', cctv: 'cctv-icon.png' };
const ico = n => n === 'arrow' ? '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>' : `<img class="ico pic" src="assets/icons/${ICON_FILES[n]}" alt="">`;

const CLUES = {
  plaque: { name: 'Gallery Plaque', img: 'clue-gallery-plaque.jpg', where: 3,
    text: 'The plaque beside the empty frame reads: “The Moonlit Garden — Cannot be transferred before 9:30 p.m.” The lender made this a strict condition of the loan.',
    why: 'Anyone moving the painting before 9:30 p.m. knew the rule and broke it on purpose.' },
  fabric: { name: 'Frame Fabric', img: 'clue-frame-fabric.jpg', where: 3,
    text: 'A frayed scrap of dark, coarse-woven packing cloth is snagged on the corner of the gilded frame. It was torn off as the painting was lifted out and wrapped.',
    why: 'The cloth is not conservation material. It is the heavy dark packing cloth kept in the registrar’s store, used for wrapping crates.' },
  badge: { name: 'Badge Log', img: 'clue-badge-log.jpg', where: 4,
    text: 'Access log, Service Corridor, 8:42 p.m.: badge “M. Vale” swiped through. No alarm was raised.',
    why: 'Somebody used Mara Vale’s badge 48 minutes before the painting was allowed to move.' },
  slip: { name: 'Transfer Slip', img: 'clue-transfer-slip.jpg', where: 4,
    text: 'Transfer Slip, Crate No. 17. Authorised by M. Vale. Time: 8:44 p.m. The signature is written fast and the time is crossed over once.',
    why: 'A crate was authorised for transfer at 8:44, long before 9:30, and the signature is the curator’s.' }
};
const CLUE_IDS = Object.keys(CLUES);

const SUSPECTS = {
  mara: { name: 'Mara Vale', role: 'Museum Curator', img: 'mara-vale.jpg',
    intro: 'Poised and exacting, Mara has run the Moonlit Garden exhibition from the start. She holds all-area clearance.',
    sus: 'She had all-area clearance and was the last to handle the loan paperwork.',
    q: [
      { t: 'Where were you at 8:40 tonight?', a: 'In my office, reviewing the loan paperwork for the Moonlit Garden. Alone, I’m afraid.' },
      { t: 'Tell me about the Moonlit Garden.', a: 'Our centrepiece. A private lender gave it on loan to us. It is priceless, and I have guarded it fiercely.' },
      { t: 'The plaque says it cannot move before 9:30.', need: 'plaque', a: 'A condition of the lender. Everyone on staff knows it. Why would anyone break it?' },
      { t: 'Your badge opened the Service Corridor at 8:42.', need: 'badge', a: 'Badges get left on desks. Anyone could have picked mine up.', flag: 'Contradiction: she said she was alone in her office at 8:40, yet claims she lost track of her badge.' },
      { t: 'This transfer slip is signed “M. Vale”, 8:44.', need: 'slip', a: 'I sign dozens of slips a night. I… do not remember this one.', flag: 'She does not deny the signature, only the memory of it.' },
      { t: 'This dark cloth was caught on the frame. Whose is it?', need: 'fabric', a: 'The registrar’s store keeps cloth like that. My department, yes, but dozens of people can open that store.', flag: 'She admits the cloth comes from her own department.' }
    ] },
  iris: { name: 'Iris Chen', role: 'Art Conservator', img: 'iris-chen.jpg',
    intro: 'Quiet and meticulous, Iris works late in the conservation lab and knows the Moonlit Garden’s every brushstroke.',
    sus: 'She works late, knows the painting intimately, and was alone in the lab.',
    q: [
      { t: 'What is your role here?', a: 'I clean and stabilise paintings. I know the Moonlit Garden better than anyone and I would never harm it.' },
      { t: 'Where were you tonight?', a: 'In the conservation lab until about nine, cleaning a Dutch panel. The lab door logs will confirm it, ask security.' },
      { t: 'Could the painting be moved before 9:30?', need: 'plaque', a: 'Not without the lender’s consent. It is fragile. I warned the curator twice about moving it between rooms.' },
      { t: 'Does this cloth come from your lab?', need: 'fabric', a: 'No. We use acid-free tissue and white cotton. That dark, rough weave is packing cloth from the registrar’s store, not ours.', flag: 'Clears Iris: the fabric does not match conservation materials.' },
      { t: 'What do you make of the covered trolley on CCTV?', need: 'trolley', a: 'That is a registrar’s crate trolley. We never wheel paintings under cloth. We carry them flat, with two people.', flag: 'Points away from the conservation lab.' }
    ] },
  leo: { name: 'Leo Grant', role: 'Head of Security', img: 'leo-grant.jpg',
    intro: 'Leo runs the security desk, and the cameras. He has been defensive since the theft was discovered.',
    sus: 'He controls the cameras and admits he left the monitor room at 8:30.',
    q: [
      { t: 'Where were you tonight?', a: 'At the monitor desk, except one short walk at 8:30 to check a faulty camera in the east corridor.' },
      { t: 'Were any alarms triggered?', a: 'None. That bothers me. The painting left the building without a single alert.' },
      { t: 'Whose badge is in the Service Corridor log?', need: 'badge', a: 'M. Vale. Curators have all-area clearance, so the system accepted it. I flagged nothing in real time. That is on me.', flag: 'Confirms the badge belongs to the curator.' },
      { t: 'Why did nobody challenge the trolley?', need: 'trolley', a: 'Cameras 05 and 07 were on the staff schedule loop. A curator moving a crate looks routine. My mistake, not my crime.', flag: 'A security lapse, not a crime.' },
      { t: 'The transfer slip is dated 8:44.', need: 'slip', a: 'Dock slips need a curatorial signature. I only check the manifest, not who signs.', flag: 'Responsibility returns to the signer.' }
    ] }
};

const FEEDS = {
  hallway: { name: 'Hallway', img: 'cctv-hallway.jpg', cam: 'CAM 03', time: '20:38:12',
    text: 'The gallery hallway is empty and calm. The busts on their plinths are untouched. Minutes later, at 8:42 p.m., the access log records a badge swipe at the Service Corridor door.',
    clue: 'badge', btn: 'Pull the access log' },
  trolley: { name: 'Trolley', img: 'cctv.trolley.jpg', alt: 'cctv-trolley.jpg', cam: 'CAM 05', time: '20:44:03',
    text: 'A trolley rolls through the service corridor with a large flat shape draped in cloth. This is 8:44 p.m., 46 minutes before the painting was permitted to move.' },
  loading: { name: 'Loading Bay', img: 'cctv-loading.jpg', cam: 'CAM 07', time: '20:46:17',
    text: 'Two minutes later the same covered trolley waits by the doors to the loading bay. The dock paperwork for it is on the clipboard: the Transfer Slip for Crate 17.',
    clue: 'slip', btn: 'Take the dock paperwork' }
};

const HOTSPOTS = [
  { id: 'empty', x: 50.5, y: 44, label: 'Empty frame', text: 'The gilded frame is bare. The Moonlit Garden hung here until tonight. The painting was lifted out cleanly, not cut, so the thief knew exactly how it was hung.' },
  { id: 'plaque', x: 59, y: 52, label: 'Wall plaque', clue: 'plaque', text: 'A small placard sits beside the frame. You read it closely...' },
  { id: 'fabric', x: 56.6, y: 31.5, label: 'Frame corner', clue: 'fabric', text: 'Something dark is caught on the carved corner of the frame...' },
  { id: 'case', x: 27, y: 53, label: 'Display case', text: 'A glass case with a marble bust. It is locked and untouched. Whoever came here wanted only the painting.' },
  { id: 'floor', x: 74, y: 80, label: 'Polished floor', text: 'Faint wheel tracks cross the polished floor toward the service corridor. Something heavy was rolled out on a cart.' }
];

/* ---------- State ---------- */
const blank = () => ({ clues: {}, feeds: {}, asked: {}, scene: 1, begun: false });
let S = load();
function load() { try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY))); } catch (e) { return blank(); } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } }
const count = () => CLUE_IDS.filter(c => S.clues[c]).length;
const has = k => k === 'trolley' ? !!(S.feeds.trolley || S.feeds.loading) : !!S.clues[k];
let ui = { feed: 'hallway', suspect: 'mara', accuse: null, hot: null };

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const img = (f, alt, cls = '', alt2 = '') => `<img class="${cls}" src="${IMG + f}" alt="${alt}" loading="lazy" ${alt2 ? `data-alt="${alt2}"` : ''}>`;
document.addEventListener('error', e => {
  const t = e.target;
  if (t.tagName !== 'IMG') return;
  if (t.dataset.alt) { t.src = IMG + t.dataset.alt; delete t.dataset.alt; return; }
  t.classList.add('missing');
}, true);
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2800); }
function lockedMsg(sc) { return `Locked: collect ${sc.need} clues first (you have ${count()}).`; }
const isOpen = id => { const sc = SCENES[id - 1]; return !sc.need || count() >= sc.need; };

function collect(id) {
  if (S.clues[id]) return false;
  S.clues[id] = true; save(); renderChrome();
  const c = count();
  toast(`Clue collected: ${CLUES[id].name} (${c}/4)` + (c === NEED_INTERVIEWS ? ' – Interviews unlocked!' : c === NEED_FINAL ? ' – Final Reveal unlocked!' : ''));
  return true;
}

/* ---------- Navigation ---------- */
function go(n) {
  const sc = SCENES[n - 1];
  if (!sc) return;
  if (n > 1 && !S.begun) S.begun = true;
  if (!isOpen(n)) { toast(lockedMsg(sc)); return; }
  S.scene = n; save();
  document.querySelectorAll('.scene').forEach(s => s.classList.toggle('show', s.id === 's' + n));
  $('#topbar').hidden = n === 1;
  renderScene(n); renderChrome();
  if (location.hash !== '#scene-' + n) history.pushState(null, '', '#scene-' + n);
  window.scrollTo({ top: 0 });
  const h = $('#s' + n + ' h1, #s' + n + ' h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
}
function renderChrome() {
  $('#nav').innerHTML = SCENES.map(sc => {
    const open = isOpen(sc.id);
    return `<button data-go="${sc.id}" class="${S.scene === sc.id ? 'on' : ''} ${open ? '' : 'locked'}" aria-label="${sc.name}${open ? '' : ' (locked)'}" ${S.scene === sc.id ? 'aria-current="page"' : ''}>${ico(open ? sc.icon : 'lock')}<span>${sc.name}</span></button>`;
  }).join('');
  $('#tracker').innerHTML = `<span>Clues ${count()}/4</span><span class="pips">${CLUE_IDS.map(c => `<i class="pip ${S.clues[c] ? 'got' : ''}" title="${CLUES[c].name}"></i>`).join('')}</span>`;
}

/* ---------- Scene renderers ---------- */
function shell(n, inner) {
  const el = $('#s' + n);
  el.style.setProperty('--bg', `url("../${IMG}${SCENES[n - 1].bg}")`);
  el.innerHTML = inner;
}
const nextBtns = (...ns) => `<div class="sec">${ns.map(n => `<button class="btn out" data-go="${n}">${ico(SCENES[n - 1].icon)} ${SCENES[n - 1].name}</button> `).join('')}</div>`;

function renderScene(n) { [null, s1, s2, s3, s4, s5, s6][n](); }

function s1() {
  const title = 'The Museum Heist'.split(' ').map((word, w) =>
    `<span class="w">${[...word].map((ch, i) => `<span style="animation-delay:${(0.5 + (w * 4 + i) * 0.06).toFixed(2)}s">${ch}</span>`).join('')}</span>`).join(' ');
  shell(1, `<div class="s1-bg" aria-hidden="true"></div><div class="s1-fog" aria-hidden="true"></div>
    <div class="hero"><div class="wrap intro">
      <p class="stamp">Case file No. 17 · Confidential</p>
      <p class="eyebrow">A detective mystery</p>
      <h1 aria-label="The Museum Heist">${title}</h1>
      <div class="rule" aria-hidden="true"><i></i></div>
      <p class="tag">An interactive mystery. Six scenes. One stolen painting. Can you uncover the truth?</p>
      <p class="trio" aria-hidden="true"><span>Priceless.</span> <span>Guarded.</span> <span>Gone.</span></p>
      <p class="lead late">Last night, <em>The Moonlit Garden</em>, the crown of the museum’s collection, vanished from its frame. No alarm. No forced door. You are the detective. Search the rooms, review the footage and question the suspects.</p>
      <p class="late"><button class="btn glow" data-go="2">${S.begun ? 'Continue Investigation' : 'Begin Investigation'} ${ico('arrow')}</button></p>
      <p class="hint late">Gather evidence before you accuse anyone. Two clues unlock the interviews. Three unlock the final accusation.</p>
      ${S.begun ? '<p class="hint late"><button class="btn out" data-act="restart">Start over</button></p>' : ''}
      <p class="hint late"><em>The truth is always in the details.</em></p></div></div>`);
}

function s2() {
  const done = count();
  shell(2, `<div class="wrap">
    <p class="eyebrow">Scene 2 · Investigation Board</p><h2>Investigation Board</h2><p class="purpose">The main navigation area: choose which rooms to explore.</p>
    <p class="lead" style="margin-left:0">Four pieces of evidence, three suspects. Click a card to read it. Undiscovered clues must be found in the rooms.</p>
    <h3 class="sec">Suspects</h3>
    <div class="grid g3">${Object.entries(SUSPECTS).map(([k, p]) => `<button class="card person" data-suspect="${k}"><img src="${IMG + p.img}" alt="Portrait of ${p.name}"><div class="pad"><h3>${p.name}</h3><p>${p.role}</p></div></button>`).join('')}</div>
    <h3 class="sec">Evidence (${done}/4)</h3>
    <div class="grid g4">${CLUE_IDS.map(id => { const c = CLUES[id], g = S.clues[id];
      return `<button class="card ${g ? 'got' : 'unk'}" data-clue="${id}"><img src="${IMG + c.img}" alt="${g ? c.name : 'Undiscovered clue'}"><div class="pad"><h3>${g ? c.name : 'Undiscovered'}</h3><p>${g ? 'Tap to review' : 'Hint: look in the ' + SCENES[c.where - 1].name}</p></div></button>`; }).join('')}</div>
    <div class="sec panel"><strong>Where next?</strong> Gather clues in the Gallery and the Security Room. Interviews open at 2 clues, the Final Reveal at 3.</div>
    ${nextBtns(3, 4, 5, 6)}</div>`);
}

function s3() {
  const h = HOTSPOTS.find(x => x.id === ui.hot);
  shell(3, `<div class="wrap">
    <p class="eyebrow">Scene 3 · Gallery</p><h2>Gallery</h2><p class="purpose">Interact with paintings and objects to discover hidden clues.</p>
    <p class="lead" style="margin-left:0">The Moonlit Garden hung here. Search the room. Pulsing circles mark things worth a closer look.</p>
    <div class="imgbox">${img('gallery.jpg', 'The dark museum gallery where the painting hung')}
      <div class="empty" style="left:45.8%;top:33%;width:9.4%;height:22.5%" aria-hidden="true">Missing</div>
      ${HOTSPOTS.map(p => `<button class="hot ${S.clues[p.clue] ? 'got' : ''} ${ui.hot === p.id ? 'on' : ''}" style="left:${p.x}%;top:${p.y}%" data-hot="${p.id}" aria-label="${p.label}${S.clues[p.clue] ? ' (collected)' : ''}"></button>`).join('')}</div>
    <div class="panel sec" aria-live="polite">${h ? `<h3>${h.label}</h3><p>${h.text}</p>${h.clue ? (S.clues[h.clue] ? `<p class="ok">✓ ${CLUES[h.clue].name} collected.</p>` : `<button class="btn" data-take="${h.clue}">Collect ${CLUES[h.clue].name}</button>`) : ''}` : '<p>Select a hotspot to investigate. Two objects here could be evidence.</p>'}</div>
    ${nextBtns(2, 4)}</div>`);
}

function s4() {
  const f = FEEDS[ui.feed];
  S.feeds[ui.feed] = true; save();
  const seen = Object.keys(FEEDS).filter(k => S.feeds[k]).length;
  shell(4, `<div class="wrap">
    <p class="eyebrow">Scene 4 · Security Room</p><h2>Security Room</h2><p class="purpose">Investigate the security footage and access logs.</p>
    <p class="lead" style="margin-left:0">Review all three camera feeds in order. The footage points to paper evidence you can collect.</p>
    <div class="split"><div>
      <div class="imgbox monitor">${img(f.img, f.name + ' CCTV footage', '', f.alt || '')}<div class="ov"><span>${f.cam} · ${f.name.toUpperCase()}</span><span class="rec">REC ${f.time}</span></div></div>
      <div class="feeds" role="tablist">${Object.entries(FEEDS).map(([k, x]) => `<button role="tab" aria-selected="${k === ui.feed}" class="${k === ui.feed ? 'on' : ''}" data-feed="${k}">${img(x.img, x.name, '', x.alt || '')}<span>${x.cam} · ${x.name}</span></button>`).join('')}</div>
    </div><div class="panel" aria-live="polite">
      <h3>${f.name} <small style="font:600 .8rem var(--sans);color:var(--gold-l)">${f.time}</small></h3><p>${f.text}</p>
      ${f.clue ? (S.clues[f.clue] ? `<p class="ok">✓ ${CLUES[f.clue].name} collected.</p>` : `<button class="btn" data-take="${f.clue}">${f.btn}</button>`) : '<p class="no">Note the trolley’s timestamp. Compare it with the plaque’s 9:30 p.m. rule.</p>'}
      <p style="font-size:.85rem;color:var(--gold-l)">Feeds reviewed: ${seen}/3</p></div></div>
    ${nextBtns(2, 3, 5)}</div>`);
}

function s5() {
  const p = SUSPECTS[ui.suspect], asked = S.asked[ui.suspect] || {};
  shell(5, `<div class="wrap">
    <p class="eyebrow">Scene 5 · Suspect Interviews</p><h2>Suspect Interviews</h2><p class="purpose">Question each suspect and choose your dialogue options.</p>
    <div class="tabs">${Object.entries(SUSPECTS).map(([k, x]) => `<button class="btn ${k === ui.suspect ? '' : 'out'}" data-suspect-tab="${k}">${x.name}</button>`).join('')}</div>
    <div class="row"><div style="flex:0 0 230px;min-width:200px"><img class="portrait" src="${IMG + p.img}" alt="Portrait of ${p.name}"><h3 style="margin-top:.8rem">${p.name}</h3><p class="eyebrow">${p.role}</p><p>${p.intro}</p></div>
    <div><h3>Questions</h3>${p.q.map((q, i) => { const ok = !q.need || has(q.need), done = asked[i];
      return `<button class="q ${done ? 'done' : ''}" data-ask="${i}" ${ok ? '' : 'disabled'}>${ok ? '' : '🔒 '}${ok ? q.t : 'Locked. Find more evidence (' + (q.need === 'trolley' ? 'review the trolley or loading CCTV' : CLUES[q.need].name) + ')'}</button>`; }).join('')}
      <div class="log panel" aria-live="polite" style="margin-top:1rem"><h4>Interview notes</h4>${Object.keys(asked).length ? p.q.map((q, i) => asked[i] ? `<div class="line ${q.flag ? 'flag' : ''}"><div class="you">You: ${q.t}</div><div>“${q.a}”</div>${q.flag ? `<div class="flag-t">⚠ ${q.flag}</div>` : ''}</div>` : '').join('') : '<p>Nothing asked yet.</p>'}</div></div></div>
    ${nextBtns(2, 3, 4, 6)}</div>`);
}

function s6() {
  const ready = count() >= NEED_FINAL, R = S.result;
  shell(6, `<div class="wrap">
    <p class="eyebrow">Scene 6 · Final Reveal</p><h2>Final Reveal</h2><p class="purpose">Review your evidence, accuse a suspect, and discover the ending.</p>
    ${R ? resultHTML(R) : `<p class="lead" style="margin-left:0">You have ${count()} of 4 clues. Choose carefully: you only get one accusation.</p>
    <div class="panel">${CLUE_IDS.map(c => `<p style="margin:.2rem 0" class="${S.clues[c] ? 'ok' : 'no'}">${S.clues[c] ? '✓' : '✗'} ${CLUES[c].name}${S.clues[c] ? '' : ' (undiscovered)'}</p>`).join('')}</div>
    <h3 class="sec">Who stole The Moonlit Garden?</h3>
    <div class="grid g3">${Object.entries(SUSPECTS).map(([k, x]) => `<button class="card person ${ui.accuse === k ? 'sel' : ''}" data-accuse="${k}" aria-pressed="${ui.accuse === k}"><img src="${IMG + x.img}" alt="Portrait of ${x.name}"><div class="pad"><h3>${x.name}</h3><p>${x.role}</p></div></button>`).join('')}</div>
    <div class="sec"><button class="btn red" data-act="accuse" ${ui.accuse && ready ? '' : 'disabled'}>${ui.accuse ? 'Accuse ' + SUSPECTS[ui.accuse].name : 'Select a suspect'}</button></div>
    ${nextBtns(3, 4, 5)}`}</div>`);
}

function resultHTML(R) {
  const right = R.who === 'mara', n = R.clues;
  const verdict = right ? (n === 4 ? 'Case closed. A perfect case.' : 'Mara Vale is arrested. The case holds, but you missed a link.') : 'The case collapses. You accused the wrong person.';
  const support = CLUE_IDS.map(c => `<li class="${R.have.includes(c) ? 'ok' : 'no'}">${R.have.includes(c) ? '✓' : '✗ Missed:'} <strong>${CLUES[c].name}</strong>: ${CLUES[c].why}</li>`).join('');
  return `<div class="panel"><h3 style="color:var(--gold-l)">${verdict}</h3>
    <p>You accused <strong>${SUSPECTS[R.who].name}</strong> with ${n}/4 clues.</p>
    <h4>What really happened</h4>
    <p>Mara Vale, the curator, arranged a private sale of <em>The Moonlit Garden</em> before the loan could end. At <strong>8:42 p.m.</strong> she used her own badge to enter the Service Corridor. At <strong>8:44</strong> she signed a transfer slip for Crate 17 and wheeled the painting out under dark packing cloth (<strong>CAM 05</strong>). By <strong>8:46</strong> it was at the loading bay (<strong>CAM 07</strong>). She broke the plaque’s 9:30 p.m. rule because she planned to have the theft blamed on someone else.</p>
    <h4>How the evidence fits</h4><ul>${support}</ul>
    <h4>Why the others looked suspicious</h4>
    <ul>${['iris', 'leo'].map(k => `<li><strong>${SUSPECTS[k].name}</strong>: ${SUSPECTS[k].sus} ${k === 'iris' ? 'But the cloth is not from the conservation lab.' : 'But the badge and slip both point to the curator. His failing was negligence.'}</li>`).join('')}</ul>
    ${right ? '' : `<p class="no">${R.who === 'iris' ? 'Iris’s lab never uses coarse packing cloth.' : 'Leo only watched the cameras. The badge and signature were Mara’s.'}</p>`}</div>
    <div class="sec"><button class="btn" data-act="restart">Restart the investigation</button> <button class="btn out" data-go="2">Review the board</button></div>`;
}

/* ---------- Modals ---------- */
function openClue(id) {
  const c = CLUES[id], got = S.clues[id];
  $('#modal-card').innerHTML = got
    ? `${img(c.img, c.name)}<div class="pad"><span class="badge">Evidence collected</span><h3 id="modal-title">${c.name}</h3><p>${c.text}</p><p class="why"><strong>Why it matters:</strong> ${c.why}</p><button class="btn" data-act="close">Close</button></div>`
    : `<div class="pad"><span class="badge">Undiscovered</span><h3 id="modal-title">Unknown evidence</h3><p>You have not found this clue yet. Try the <strong>${SCENES[c.where - 1].name}</strong>.</p><button class="btn" data-act="close" data-then="${c.where}">Go to the ${SCENES[c.where - 1].name}</button> <button class="btn out" data-act="close">Close</button></div>`;
  showModal();
}
function openSuspect(k) {
  const p = SUSPECTS[k];
  $('#modal-card').innerHTML = `<img src="${IMG + p.img}" alt="Portrait of ${p.name}" style="background:#fff"><div class="pad"><span class="badge">${p.role}</span><h3 id="modal-title">${p.name}</h3><p>${p.intro}</p><button class="btn" data-act="close" ${isOpen(5) ? `data-then="5" data-who="${k}"` : ''}>${isOpen(5) ? 'Interview ' + p.name.split(' ')[0] : 'Close'}</button> ${isOpen(5) ? '<button class="btn out" data-act="close">Close</button>' : '<p class="no" style="margin-top:.8rem">Interviews unlock at 2 clues.</p>'}</div>`;
  showModal();
}
let lastFocus;
function showModal() { lastFocus = document.activeElement; $('#modal').hidden = false; $('#modal-card button').focus(); }
function hideModal() { $('#modal').hidden = true; if (lastFocus) lastFocus.focus(); }

/* ---------- Events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('button,[data-go]'); if (!t) { if (e.target.id === 'modal') hideModal(); return; }
  const d = t.dataset;
  if (d.go) return go(+d.go);
  if (d.clue) return openClue(d.clue);
  if (d.suspect) return openSuspect(d.suspect);
  if (d.hot) { ui.hot = d.hot; return s3(); }
  if (d.take) { collect(d.take); return renderScene(S.scene); }
  if (d.feed) { ui.feed = d.feed; return s4(); }
  if (d.suspectTab) { ui.suspect = d.suspectTab; return s5(); }
  if (d.ask !== undefined) { (S.asked[ui.suspect] = S.asked[ui.suspect] || {})[d.ask] = true; save(); s5(); return; }
  if (d.accuse) { ui.accuse = d.accuse; return s6(); }
  if (d.act === 'accuse' && ui.accuse && count() >= NEED_FINAL) { S.result = { who: ui.accuse, clues: count(), have: CLUE_IDS.filter(c => S.clues[c]) }; save(); return s6(); }
  if (d.act === 'close') { hideModal(); if (d.who) ui.suspect = d.who; if (d.then) go(+d.then); return; }
  if (d.act === 'restart') {
    if (!confirm('Restart the investigation? All collected clues will be cleared.')) return;
    try { localStorage.removeItem(KEY); } catch (er) { }
    S = blank(); ui = { feed: 'hallway', suspect: 'mara', accuse: null, hot: null };
    go(1); toast('Investigation reset.');
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) hideModal(); });
window.addEventListener('popstate', () => { const n = +(location.hash.match(/scene-(\d)/) || [])[1]; if (n) go(n); });

/* ---------- Init ---------- */
(function init() {
  const stage = $('#stage');
  stage.innerHTML = SCENES.map(s => `<section class="scene" id="s${s.id}" aria-label="${s.name}"></section>`).join('');
  const hashN = +(location.hash.match(/scene-(\d)/) || [])[1];
  go(hashN && isOpen(hashN) ? hashN : (isOpen(S.scene) ? S.scene : 1));
})();
