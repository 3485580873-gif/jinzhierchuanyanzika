// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var G_UNITS = { merge: '分', g2048: '分', pop: '分', link: '分' };
function _gSfxStep(n) { return Math.max(0, Math.min(12, Math.round((Number(n) || 0) * 1.4))); }
var G_SKILLS = ['merge', 'g2048', 'pop', 'link'];
var G_MERGE_VAL = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
var G_START_TA = { g2048: [128, 256, 384, 512], merge: [60, 100, 160, 240], pop: [500, 800, 1100, 1500], link: [140, 220, 300, 380] };
var G_NAMES = { merge: '合成大西瓜', g2048: '2048', pop: '消灭星星', link: '连连看' };
var G_SAY_LBL = { beat: '破了我的数', best: '又创新高', lose: '输得有点多', mid: '还差一点' };
var G_MODE_CN = { solo: '自己玩', coop: '一起合作', vs: '比分对战' };
function _gPick(arr, r) { return arr[Math.floor(r * arr.length) % arr.length]; }
function _gContact(cid) { return (data.contacts || []).find(c => c.id === cid) || (data.contacts || [])[0] || null; }
function _gSingles() { return (data.contacts || []).filter(c => c.kind !== 'group'); }
function _gName(cid) { const c = _gContact(cid); return c ? (fixedNameOf(c) || 'TA') : 'TA'; }
function _gScore(cid, game) {
if (!data.games || !data.games.scores) return { best: 0, plays: 0, ta: 0 };
if (!data.games.scores[cid]) data.games.scores[cid] = {};
if (!data.games.scores[cid][game]) data.games.scores[cid][game] = { best: 0, plays: 0, ta: 0 };
return data.games.scores[cid][game];
}
function _gSoloScore(game) {
if (!data.games || typeof data.games !== 'object') return { best: 0, plays: 0 };
if (!data.games.solo || typeof data.games.solo !== 'object' || Array.isArray(data.games.solo)) data.games.solo = {};
if (!data.games.solo[game] || typeof data.games.solo[game] !== 'object') data.games.solo[game] = { best: 0, plays: 0 };
return data.games.solo[game];
}
function _gBook(game) { return _gSkillMode(game) === 'solo' ? _gSoloScore(game) : _gScore(data.games.with, game); }
function _gBoardBox(wrap) {
const r = wrap.getBoundingClientRect();
const pane = wrap.closest('.game-pane');
const sc = wrap.closest('.view');
const cs = getComputedStyle(wrap);
let below = 0;
if (pane) for (const el of pane.children) {
if (el === wrap) continue;
const ecs = getComputedStyle(el);
if (ecs.position === 'absolute' || ecs.position === 'fixed') continue;
const b = el.getBoundingClientRect();
if (b.height > 0 && b.top >= r.top - 1) below += b.height + (parseFloat(ecs.marginTop) || 0);
}
const w = Math.max(0, r.width - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0));
const sr = sc ? sc.getBoundingClientRect() : { top: 0 };
const vh = sc ? sc.clientHeight : (window.visualViewport ? window.visualViewport.height : window.innerHeight);
const top = sc ? (r.top - sr.top + sc.scrollTop) : r.top;
const padB = pane ? (parseFloat(getComputedStyle(pane).paddingBottom) || 0) : 0;
return { w, h: Math.max(0, vh - top - (parseFloat(cs.paddingTop) || 0) - below - padB) };
}
function _gBoxInner(el, w) {
const cs = getComputedStyle(el);
return Math.max(40, w - (parseFloat(cs.borderLeftWidth) || 0) - (parseFloat(cs.borderRightWidth) || 0));
}
function _gEffPG(pad, gap) {
if (_gFull) return [Math.max(2, pad - 4), Math.max(2, gap - 4)];
return [pad, gap];
}
function _gSetCellVars(box, pad, gap, cw, ch) {
box.style.setProperty('--pad', pad + 'px');
box.style.setProperty('--gap', gap + 'px');
box.style.setProperty('--cw', cw.toFixed(2) + 'px');
box.style.setProperty('--ch', ch.toFixed(2) + 'px');
}
function _gFitGrid(sel, ar) {
const el = $(sel);
if (!el || !el.parentElement) return;
const box = _gBoardBox(el.parentElement);
if (box.w < 40) return;
const avail = _gBoxInner(el, box.w);
const w = Math.min(avail, box.h > 0 ? box.h * ar : avail);
el.style.width = Math.round(w) + 'px';
el.style.height = Math.round(w / ar) + 'px';
}
function _gFitBoards(game, _retry) {
const pane = $(G_PANE[game]);
if (!pane) return;
if (!pane.getBoundingClientRect().width) {
if (!_retry) requestAnimationFrame(() => _gFitBoards(game, 1));
return;
}
if (game === 'g2048') _gFitGrid('#g2048Grid', 1);
else if (game === 'pop') _gFitGrid('#popGrid', 1);
else if (game === 'link') _gFitGrid('#linkGrid', LINK_COLS / LINK_ROWS);
else if (game === 'merge') gMergeSize();
}
var _gFull = false;
function _gFullIcon(on) {
return on
? '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1 4.5h3.5V1M11 4.5H7.5V1M1 7.5h3.5V11M11 7.5H7.5V11" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 1H1v3.5M7.5 1H11v3.5M4.5 11H1V7.5M7.5 11H11V7.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
}
function _gFullBtnHTML() {
return `<button type="button" class="merge-scheme gf-btn" data-gfull="1" aria-pressed="${_gFull ? 'true' : 'false'}">${_gFullIcon(_gFull)}<span>${_gFull ? '退出' : '全屏'}</span></button>`;
}
function _gSyncFull() {
$$('[data-gfull]').forEach(b => {
const s = b.querySelector('span'); if (s) s.textContent = _gFull ? '退出' : '全屏';
const ic = b.querySelector('svg'); if (ic) ic.outerHTML = _gFullIcon(_gFull);
b.setAttribute('aria-pressed', _gFull ? 'true' : 'false');
});
if (_gFull) document.body.dataset.gameFull = 'on'; else delete document.body.dataset.gameFull;
}
function _gEnsureFullBtn(game) {
const pane = $(G_PANE[game]);
const row = pane && pane.querySelector('.merge-modes');
if (!row || row.querySelector('[data-gfull]')) return;
row.insertAdjacentHTML('beforeend', _gFullBtnHTML());
}
function _gSetFull(on) {
if (_gFull === on) return;
_gFull = on;
_gSyncFull();
const scv = $('#gamesView'); if (scv) scv.scrollTop = 0;
try { if (on) history.pushState({ gfull: 1 }, ''); else if (history.state && history.state.gfull) history.back(); } catch (e) {}
const tab = data.games && data.games.tab;
if (_gPhaseOf(tab) === 'playing') {
_gFitBoards(tab);
if (tab === 'g2048') g2048Render();
if (tab === 'pop') _popRender();
if (tab === 'link') _linkRender();
if (tab === 'merge') gMergeDraw();
} else _gamesRenderReady();
}
window.addEventListener('popstate', () => { if (_gFull && !(history.state && history.state.gfull)) _gSetFull(false); });
var G_PANE = { merge: '#gameMerge', g2048: '#game2048', pop: '#gamePop', link: '#gameLink' };
var _gPhase = '';
var _gPhaseGame = '';
var _gAskTimer = 0;
function _gPhaseOf(game) { return (_gPhaseGame === game) ? _gPhase : ''; }
function _gSetPhase(p, game) {
_gPhase = p || '';
_gPhaseGame = game || '';
if (_gAskTimer) { clearTimeout(_gAskTimer); _gAskTimer = 0; }
}
function renderGames() {
if (!data.games || !$('#gamesView')) return;
const singles = _gSingles();
if (!singles.some(c => c.id === data.games.with)) {
data.games.with = (singles[0] || {}).id || 'c0';
save();
}
_gamesRenderWho();
const tabs = $$('#gamesTabs .games-tab');
tabs.forEach(t => t.classList.toggle('active', t.dataset.game === data.games.tab));
const tab = data.games.tab;
const on = _gPhaseOf(tab) === 'playing';
$('#gameMerge').hidden = tab !== 'merge' || !on;
$('#game2048').hidden = tab !== 'g2048' || !on;
$('#gamePop').hidden = tab !== 'pop' || !on;
$('#gameLink').hidden = tab !== 'link' || !on;
const rd = $('#gamesReady');
if (rd) rd.hidden = on;
_gamesRenderReady();
_gSyncFull();
if (!on) return;
_gamesRenderTaLine(data.games.tab);
_gFitBoards(tab);
if (data.games.tab === 'merge') { gMergeBoot(); _gMergeApplyMode(); gMergeLoopKick(); if (_gMergeMode() === 'vs') _gamesEnsureChallenge('merge'); }
if (data.games.tab === 'g2048') g2048Boot();
if (data.games.tab === 'pop') { gPopBoot(); _gPopApplyMode(); }
if (data.games.tab === 'link') { gLinkBoot(); _gLinkApplyMode(); }
_gamesEnsureChallenge(data.games.tab);
}
function _gamesRenderReady() {
const box = $('#gamesReady');
if (!box) return;
const game = data.games.tab;
const phase = _gPhaseOf(game);
const mode = _gSkillMode(game);
const solo = mode === 'solo';
const c = _gContact(data.games.with) || {};
const sc = _gScore(data.games.with, game);
const book = _gBook(game);
const co = _gCoopBook(game);
const label = G_LABELS[game] || '游戏';
const nm = escapeHTML(_gName(data.games.with));
box.innerHTML =
`<div class="gr-top"><b>${escapeHTML(label)}</b><span>${solo ? '挑玩法 · 点开始' : '挑个人 · 挑玩法 · 点开始'}</span></div>`
+ (solo ? '' : `<div class="gr-who" id="grWho">${_gSingles().map(x =>
        `<button type="button" class="games-ow${x.id === data.games.with ? ' on' : ''}" data-gwho="${x.id}"><span class="avatar">${avatarHTML(x.avatar)}</span>${escapeHTML(fixedNameOf(x) || 'TA')}</button>`).join('')}</div>`)
+ `<div class="gr-modes" id="grModes">${['solo', 'coop', 'vs'].map(m =>
        `<button type="button" class="merge-scheme${m === mode ? ' on' : ''}" data-grmode="${m}">${G_MODE_CN[m]}</button>`).join('') + _gFullBtnHTML()}</div>`
+ `<div class="gr-note" id="grNote">${solo
        ? '自己玩 · 不惊动任何人，局终只在屏上报一声'
        : (mode === 'coop' ? '一起合作 · ' + nm + ' 答应才开局' : '比分对战 · ' + nm + ' 答应才开局')}</div>`
+ `<div class="gr-best" id="grBest">${mode === 'coop'
        ? `一起玩最高 ${co.best} · 玩过 ${co.plays} 局`
        : `最高 ${book.best} ${G_UNITS[game] || '分'} · 玩过 ${book.plays} 局${mode === 'vs' && sc.ta > 0 ? ' · TA 挑战 ' + sc.ta : ''}`}</div>`
+ `<button type="button" class="game-btn primary gr-go" id="grGo"${phase === 'waiting' ? ' disabled' : ''}>${phase === 'waiting' ? '等 TA 答应…' : (mode === 'solo' ? '开始游戏' : '邀请 ' + nm + ' 一起玩')}</button>`;
if (game === 'pop') {
const gb = $('#grBest');
if (gb) gb.textContent = mode === 'coop'
? `一起最高 第 ${co.lvl || 0} 关 · 玩过 ${co.plays} 局`
: `最高 第 ${book.lvl || 0} 关${mode === 'vs' && sc.ta > 0 ? ` · TA 挑战 第 ${_popLvlOfScore(sc.ta)} 关` : ''}`;
const gn = $('#grNote');
if (gn && solo) gn.textContent = '逐关闯关 · 每关够目标分才进下一关，不惊动任何人';
}
if (phase === 'waiting') {
const note = $('#grNote');
if (note) note.innerHTML = '<span class="gr-wait">已发邀请 · 等 ' + nm + ' 回话</span>';
}
}
function _gCoopBook(game) {
const sc = _gScore(data.games.with, game);
const co = sc.coop;
return co && typeof co === 'object' ? co : { best: 0, plays: 0 };
}
function _gSetModeOf(game, m) {
const setter = {
merge: _gMergeSetMode, g2048: _g2048SetMode,
pop: _gPopSetMode, link: _gLinkSetMode
}[game];
if (setter) setter(m);
}
function _gStart(game) {
game = game || data.games.tab;
const mode = _gSkillMode(game);
if (mode === 'solo') { _gBegin(game); return; }
const cid = data.games.with;
const label = G_LABELS[game] || '游戏';
_gSetPhase('waiting', game);
_gamesRenderReady();
const askSay = presetSayPick('邀他开局');
if (askSay) _deliverToChat({ id: nextId(), from: 'me', text: askSay.replace('{g}', label) }, cid);
_gAskTimer = setTimeout(() => {
_gAskTimer = 0;
if (_gPhaseOf(game) !== 'waiting' || data.games.tab !== game) return;
const yes = Math.random() < 0.62;
if (yes) {
const yesSay = presetSayPick('他答应开局');
if (yesSay) _deliverToChat({ id: nextId(), from: 'partner', text: yesSay }, cid);
_gBegin(game);
} else {
const noSay = presetSayPick('他拒绝开局');
if (noSay) _deliverToChat({ id: nextId(), from: 'partner', text: noSay }, cid);
_gSetPhase('', '');
renderGames();
showToast('TA 这会儿不想玩 · 这局没开成');
}
}, 2000 + Math.random() * 4000);
}
function _gBegin(game) {
_gSetPhase('playing', game);
renderGames();
showToast(G_LABELS[game] + ' 开始');
}
function _gamesRenderWho() {
const box = $('#gamesWho');
if (!box) return;
box.innerHTML = _gSingles().map(c =>
`<button type="button" class="games-ow${c.id === data.games.with ? ' on' : ''}" data-gwho="${c.id}"><span class="avatar">${avatarHTML(c.avatar)}</span>${escapeHTML(fixedNameOf(c) || 'TA')}</button>`
).join('');
}
function _gSkillMode(game) {
return game === 'merge' ? _gMergeMode() : game === 'g2048' ? _g2048Mode()
: game === 'pop' ? _gPopMode() : game === 'link' ? _gLinkMode() : 'solo';
}
function _gLineBox(game) { return '#taLine' + (game === 'g2048' ? '2048' : game.charAt(0).toUpperCase() + game.slice(1)); }
function _gModeChrome(game) {
const mode = _gSkillMode(game);
const tl = $(_gLineBox(game));
if (tl) tl.hidden = mode !== 'vs';
const pane = $(G_PANE[game]);
if (pane) pane.querySelectorAll('[data-gshare]').forEach(b => { b.hidden = mode === 'solo'; });
if (mode === 'solo') { const w = $('#gamesWho'); if (w) w.hidden = true; }
_gEnsureFullBtn(game);
return mode;
}
function _gamesRenderTaLine(game) {
_gModeChrome(game);
if (_gSkillMode(game) !== 'vs') return;
const box = $(_gLineBox(game));
if (!box) return;
const c = _gContact(data.games.with) || {};
const sc = _gScore(data.games.with, game);
const last = _gLast[game];
const L = _gLive[game];
let right, cap, note, hot = false;
if (L && L.playing) {
right = L.score; cap = '实时'; hot = true;
note = '正在和你同时玩 · 挑战 ' + (sc.ta > 0 ? sc.ta : '–');
} else if (L && L.done && last && last.taScore != null) {
right = last.taScore; cap = '终局'; hot = !last.win;
note = (last.win ? '你赢了 · ' : 'TA 赢了 · ') + (L.note || 'TA 的成绩定格');
} else if (sc.ta > 0) {
right = sc.ta; cap = '挑战';
note = last && last.beaten ? '「行，这把我认了」' : '「先过了我这一关再说」';
} else {
right = '–'; cap = '挑战'; note = '正在想一个数……';
}
if (game === 'pop') {
if (right !== '–') right = '第' + _popLvlOfScore(Number(right) || 0) + '关';
if (L && L.playing) note = '正在和你同时闯关 · 挑战 ' + (sc.ta > 0 ? '第' + _popLvlOfScore(sc.ta) + '关' : '–');
else if (!(L && L.done) && sc.ta > 0) note = last && last.beaten ? '「行，这把我认了」' : '「先过了我第' + _popLvlOfScore(sc.ta) + '关再说」';
}
if (game === 'pop') {
if (right !== '–') right = '第' + _popLvlOfScore(Number(right) || 0) + '关';
if (L && L.playing) note = '正在和你同时闯关 · 挑战 ' + (sc.ta > 0 ? '第' + _popLvlOfScore(sc.ta) + '关' : '–');
else if (!(L && L.done) && sc.ta > 0) note = last && last.beaten ? '「行，这把我认了」' : '「先过了我第' + _popLvlOfScore(sc.ta) + '关再说」';
}
box.className = 'ta-line' + (last && (last.beaten || last.win) ? ' done' : '');
box.innerHTML = `<span class="avatar">${avatarHTML(c.avatar)}</span>`
+ `<div class="ta-tt"><b>${escapeHTML(_gName(data.games.with))}</b><span>${note}</span></div>`
+ `<div class="ta-score${hot ? ' live' : ''}"><b>${right}</b><span>${cap}</span></div>`;
}
function _gamesSetTab(g) {
if (!G_PANE[g]) return;
if (data.games.tab === g) return;
data.games.tab = g;
save();
_gSetPhase(_gPhaseOf(g), g);
renderGames();
}
function _gamesSetWho(cid) {
if (!cid || cid === data.games.with) return;
if (!_gSingles().some(c => c.id === cid)) return;
data.games.with = cid;
save();
const wRow = $('#gamesWho');
if (wRow) wRow.hidden = true;
if (_gPhaseOf(data.games.tab) !== 'playing') {
_gSetPhase('', '');
renderGames();
return;
}
if (data.games.tab === 'g2048' && _g2048Mode() !== 'solo' && _g2048.tiles) g2048Restart();
if (data.games.tab === 'pop' && _gPopMode() !== 'solo' && _pop.cells) gPopRestart();
if (data.games.tab === 'link' && _gLinkMode() !== 'solo' && _link.tiles) gLinkRestart();
renderGames();
showToast('现在和 ' + _gName(cid) + ' 一起玩');
}
var _gLive = {};
var _gLiveTimer = 0;
function _gTaTarget(game) {
const sc = _gScore(data.games.with, game);
const base = sc.ta > 0 ? sc.ta : ({ g2048: 300, merge: 160, pop: 900, link: 260 }[game]);
return Math.max(1, Math.round(base * (0.75 + Math.random() * 0.5)));
}
function _gTaLiveStart(game) {
const L = _gLive[game];
if (L && L.playing) return;
_gLive[game] = { score: 0, target: _gTaTarget(game), playing: true, done: false, note: '', t: 0 };
if (!_gLiveTimer) _gLiveTimer = setInterval(_gLiveTick, 1000);
if (document.body.dataset.view === 'games' && data.games.tab === game) _gamesRenderTaLine(game);
}
function _gLiveTick() {
let any = false;
for (const game of G_SKILLS) {
const L = _gLive[game];
if (!L || !L.playing) continue;
any = true;
L.t++;
L.score += game === 'g2048' ? 6 + Math.floor(Math.random() * 16) : game === 'pop' ? 16 + Math.floor(Math.random() * 38) : game === 'link' ? 8 + Math.floor(Math.random() * 20) : 3 + Math.floor(Math.random() * 9);
if (Math.random() < 0.1) L.score += 24 + Math.floor(Math.random() * 40);
if (L.score >= L.target) { L.score = L.target; L.playing = false; L.done = true; }
if (document.body.dataset.view === 'games' && data.games.tab === game) _gamesRenderTaLine(game);
}
if (!any && _gLiveTimer) { clearInterval(_gLiveTimer); _gLiveTimer = 0; }
}
function _gTaLiveFinal(game) {
const L = _gLive[game];
if (!L) return null;
if (L.playing) { L.playing = false; L.done = true; }
return L.score;
}
var _gLast = {};
var _gTaTimers = {};
function _gamesEnsureChallenge(game) {
const cid = data.games.with;
if (!G_START_TA[game]) return;
if (_gPhaseOf(game) === 'playing') return;
const sc = _gScore(cid, game);
if (sc.ta > 0) return;
if (_gTaTimers[cid + game]) return;
_gTaTimers[cid + game] = setTimeout(() => {
delete _gTaTimers[cid + game];
if (!data.games || !data.contacts) return;
if (_gPhaseOf(game) === 'playing') return;
if (game === 'merge' && _gMergeMode() !== 'vs') return;
if (game === 'g2048' && _g2048Mode() !== 'vs') return;
if (game === 'pop' && _gPopMode() !== 'vs') return;
if (game === 'link' && _gLinkMode() !== 'vs') return;
const s = _gScore(cid, game);
if (s.ta > 0) return;
const range = G_START_TA[game];
let ta;
if (s.best > 0) ta = Math.ceil(s.best * (1.2 + Math.random() * 0.4) / 10) * 10;
else ta = _gPick(range, Math.random());
s.ta = ta;
save();
const openSay = presetSayPick('挑战开场白', G_NAMES[game]);
if (openSay) _deliverToChat({
id: nextId(), from: 'partner',
text: openSay.replace('{n}', ta),
game: { kind: 'challenge', game, ta }
}, cid);
if (document.body.dataset.view === 'games') { _gamesRenderTaLine(game); _gamesRenderWho(); }
}, 8000 + Math.random() * 20000);
}
function _gShare(game) {
if (game === 'g2048' && _g2048Mode() === 'coop') { _g2048CoopShare(); return; }
if (game === 'pop' && _gPopMode() === 'coop') { _gPopCoopShare(); return; }
if (game === 'link' && _gLinkMode() === 'coop') { _gLinkCoopShare(); return; }
const last = _gLast[game];
const sc = _gScore(data.games.with, game);
const score = last ? last.score : sc.best;
if (!score) { showToast('先玩一局再告诉 TA'); return; }
const beaten = sc.ta > 0 && score >= sc.ta;
const isBest = score >= sc.best && score > 0;
_deliverToChat({
id: nextId(), from: 'me',
text: beaten ? '挑战成功！' : (last && last.taScore != null ? (last.win ? '这局比你多，服不服？' : '这局输你一分都不止…再来') : '给你看我的成绩：'),
game: { kind: 'score', game, score, best: sc.best, ta: sc.ta, beaten, newBest: isBest && score === sc.best && last, taScore: last && last.taScore, win: last && last.win }
}, data.games.with);
const delay = 1400 + Math.random() * 2600;
setTimeout(() => {
if (!data.games || !data.contacts) return;
const s = _gScore(data.games.with, game);
let say;
if (beaten) {
say = presetSayPick('比分的话', G_SAY_LBL.beat);
s.ta = 0;
delete _gLast[game];
save();
setTimeout(() => {
if (!data.games) return;
_gamesEnsureChallenge(game);
if (document.body.dataset.view === 'games' && data.games.tab === game) _gamesRenderTaLine(game);
}, 30000 + Math.random() * 40000);
} else if (last && last.taScore != null && last.win === false) say = presetSayPick('比分的话', G_SAY_LBL.lose);
else if (last && last.taScore != null && last.win) say = presetSayPick('比分的话', G_SAY_LBL.best);
else if (isBest && last) say = presetSayPick('比分的话', G_SAY_LBL.best);
else if (s.ta > 0 && score < s.ta * 0.6) say = presetSayPick('比分的话', G_SAY_LBL.lose);
else say = presetSayPick('比分的话', G_SAY_LBL.mid);
if (say) _deliverToChat({ id: nextId(), from: 'partner', text: say }, data.games.with);
}, delay);
showToast('战绩已发给 ' + _gName(data.games.with));
}
var _g2048 = { tiles: null, score: 0, over: false, _id: 0, _els: new Map(), prev: null, bestTier: 0,
mode: 'solo', turn: 'me', taTimer: 0, lastTa: '', gotTile: false };
var G2048_PAD = 10, G2048_GAP = 9;
var G2048_DIR_CN = { left: '左', right: '右', up: '上', down: '下' };
function g2048Boot(force) {
g2048RenderSkins();
_g2048SchemesInit();
if (_g2048.tiles && !force) { _g2048ApplyMode(); g2048Render(); return; }
g2048Restart();
}
function _g2048SchemesInit() {
if (!data.games.g2048Skins || typeof data.games.g2048Skins !== 'object' || Array.isArray(data.games.g2048Skins)) data.games.g2048Skins = {};
if (!Array.isArray(data.games.g2048SkinSchemes)) data.games.g2048SkinSchemes = [];
else data.games.g2048SkinSchemes = data.games.g2048SkinSchemes.filter(s => s && typeof s === 'object' && typeof s.id === 'string' && s.name && typeof s.skins === 'object' && s.skins && !Array.isArray(s.skins)).slice(0, 6);
if (typeof data.games.g2048SkinScheme !== 'string') data.games.g2048SkinScheme = '';
if (!data.games.g2048SkinSchemes.length && Object.keys(data.games.g2048Skins).length) {
data.games.g2048SkinSchemes.push({ id: 'gs' + Date.now().toString(36), name: '方案 1', skins: Object.assign({}, data.games.g2048Skins) });
data.games.g2048SkinScheme = data.games.g2048SkinSchemes[0].id;
save();
}
}
function g2048Restart() {
_g2048.tiles = [];
_g2048.score = 0;
_g2048.over = false;
_g2048.gotTile = false;
_g2048.prev = null;
_g2048.bestTier = 0;
if (_g2048.taTimer) { clearTimeout(_g2048.taTimer); _g2048.taTimer = 0; }
_g2048.turn = 'me';
_g2048.lastTa = '';
if (_g2048._els) _g2048._els.forEach(el => el.remove());
_g2048._els = new Map();
delete _gLast.g2048;
delete _gLive.g2048;
const ov = $('#g2048Over');
if (ov) ov.textContent = '';
g2048Spawn(); g2048Spawn();
g2048Render();
_g2048ApplyMode();
}
function g2048Spawn() {
const used = new Set(_g2048.tiles.filter(t => !t.dead).map(t => t.r * 4 + t.c));
const empty = [];
for (let i = 0; i < 16; i++) if (!used.has(i)) empty.push(i);
if (!empty.length) return;
const idx = empty[Math.floor(Math.random() * empty.length)];
_g2048.tiles.push({ id: ++_g2048._id, v: Math.random() < 0.9 ? 2 : 4, r: Math.floor(idx / 4), c: idx % 4, spawn: true });
}
function _g2048Color(v) {
const map = { 2: '#f6f3ea', 4: '#f0e8d5', 8: '#e9d9b4', 16: '#e0be8a', 32: '#d9a06b', 64: '#cf7f52', 128: '#c0614a', 256: '#b34f42', 512: '#a83f3a', 1024: '#9c3040', 2048: '#8c2238' };
return map[v] || '#6e1a30';
}
function _g2048TileSkin(el, t) {
const img = (data.games.g2048Skins || {})[t.v];
if (img) {
el.style.background = 'var(--surface)';
el.innerHTML = `<img src="${img}" alt="" draggable="false"><i class="g2048-num">${t.v}</i>`;
return;
}
el.style.background = _g2048Color(t.v);
const fs = t.v >= 1024 ? 16 : (t.v >= 128 ? 19 : 22);
el.innerHTML = `<b style="font-size:${fs}px;color:${t.v <= 4 ? '#1a1c22' : '#fff'}">${t.v}</b>`;
}
function g2048Render() {
const box = $('#g2048Grid');
if (!box || !_g2048.tiles) return;
let bg = box.querySelector('.g2048-bg');
if (!bg) {
bg = document.createElement('div');
bg.className = 'g2048-bg';
bg.innerHTML = '<i></i>'.repeat(16);
box.appendChild(bg);
}
const W = box.clientWidth || 320, H = box.clientHeight || W;
const pg = _gEffPG(G2048_PAD, G2048_GAP), PAD = pg[0], GAP = pg[1];
const cw = (W - PAD * 2 - GAP * 3) / 4;
const ch = (H - PAD * 2 - GAP * 3) / 4;
_gSetCellVars(box, PAD, GAP, cw, ch);
const posOf = t => `translate(${Math.round(t.c * (cw + GAP))}px,${Math.round(t.r * (ch + GAP))}px)`;
const els = _g2048._els;
const alive = new Set();
for (const t of _g2048.tiles) {
if (t.dead) {
const el = els.get(t.id);
if (el) { el.style.transform = posOf(t); els.delete(t.id); setTimeout(() => el.remove(), 220); }
continue;
}
let el = els.get(t.id);
if (!el) {
el = document.createElement('div');
el.className = 'g2048-tile';
el.dataset.tid = t.id;
els.set(t.id, el);
box.appendChild(el);
}
alive.add(t.id);
if (t.mergedNow) { el.classList.remove('merged'); void el.offsetWidth; el.classList.add('merged'); }
else if (t.spawn) el.classList.add('spawn');
_g2048TileSkin(el, t);
el.style.transform = posOf(t);
t.spawn = false; t.mergedNow = false;
}
els.forEach((el, id) => { if (!alive.has(id)) { el.remove(); els.delete(id); } });
_g2048.tiles = _g2048.tiles.filter(t => !t.dead);
}
function _g2048ScoreView(bump) {
const wrap = $('#g2048ScoreWrap');
const coop = _g2048Mode() === 'coop';
if (wrap) {
wrap.innerHTML = (coop ? '我们 <b id="g2048Score">' : '本局 <b id="g2048Score">')
+ _g2048.score + '</b> · ' + (coop ? '一人一手' : '滑动合并');
}
const el = $('#g2048Score');
if (!el) return;
if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
}
function _g2048FloatScore(n, r, c) {
const box = $('#g2048Grid');
if (!box) return;
const f = document.createElement('span');
f.className = 'g2048-float';
f.textContent = '+' + n;
if (r != null) {
const g = _g2048Geom();
if (g) {
f.style.left = (c * g.sx + g.cw / 2) + 'px';
f.style.top = (r * g.sy + g.ch / 2) + 'px';
}
}
box.appendChild(f);
setTimeout(() => f.remove(), 800);
}
function g2048RefreshStat() {
const el = $('#g2048Stat');
if (!el) return;
const cid = data.games.with;
if (_g2048Mode() === 'coop') {
const co = _g2048CoopScore(cid);
el.textContent = `合作最高 ${co.best} 分 · ${co.plays} 局${co.tile ? ' · 一起合出过 2048' : ''}`;
_g2048CoopRender();
return;
}
const sc = _gBook('g2048');
el.textContent = `最高 ${sc.best} · ${sc.plays} 局${_g2048Mode() === 'vs' && sc.ta > 0 ? ` · 挑战 ${sc.ta}` : ''}`;
}
function _g2048Step(dir) {
const cells = new Map();
_g2048.tiles.forEach(t => cells.set(t.r * 4 + t.c, t));
let moved = false, gain = 0;
const born = [];
for (let i = 0; i < 4; i++) {
const line = [];
for (let j = 0; j < 4; j++) {
if (dir === 'left') line.push([i, j]);
else if (dir === 'right') line.push([i, 3 - j]);
else if (dir === 'up') line.push([j, i]);
else line.push([3 - j, i]);
}
let slot = 0, last = null;
for (const [r, c] of line) {
const t = cells.get(r * 4 + c);
if (!t) continue;
const [tr, tc] = line[slot];
if (last && last.v === t.v && !last.mergedNow) {
t.r = tr; t.c = tc; t.dead = true;
last.v *= 2; last.mergedNow = true;
gain += last.v; moved = true;
born.push(last);
} else {
if (t.r !== tr || t.c !== tc) moved = true;
t.r = tr; t.c = tc;
last = t; slot++;
}
}
}
return { moved, gain, born };
}
function _g2048AfterMove(res, byTa) {
if (res.gain) {
_g2048.score += res.gain;
const at = res.born[0];
if (at) _g2048FloatScore(res.gain, at.r, at.c); else _g2048FloatScore(res.gain);
}
g2048Spawn();
g2048Render();
if (res.born.length) {
let top = 0;
res.born.forEach(t => { if (t.v > top) top = t.v; });
const firstBig = res.born.some(t => t.v > _g2048.bestTier && t.v >= 128);
playSfx(firstBig ? 'mile' : 'blend', { step: _gSfxStep(Math.log2(top)), weak: !!byTa });
}
res.born.forEach(t => {
_g2048Burst(t);
if (t.v > _g2048.bestTier && t.v >= 128) {
_g2048.bestTier = t.v;
showToast('本局首次合出 ' + t.v + '！');
if (_g2048Mode() === 'coop') _g2048CoopMilestone(t.v);
}
});
_g2048ScoreView(!!res.gain);
g2048RefreshStat();
}
function g2048Move(dir) {
if (_g2048.over || !_g2048.tiles) return;
const mode = _g2048Mode();
if (mode === 'coop' && _g2048.turn === 'ta') return;
const snap = _g2048.tiles.filter(t => !t.dead).map(t => ({ v: t.v, r: t.r, c: t.c }));
const snapScore = _g2048.score;
const res = _g2048Step(dir);
if (!res.moved) {
if (_g2048Stuck()) _g2048Finish();
return;
}
_g2048.prev = { tiles: snap, score: snapScore };
if (mode === 'vs') _gTaLiveStart('g2048');
_g2048AfterMove(res);
if (_g2048Stuck()) { _g2048Finish(); return; }
if (mode === 'coop') _g2048TaSchedule();
}
function _g2048Mode() {
const m = data.games && data.games.g2048Mode;
return ['solo', 'coop', 'vs'].includes(m) ? m : 'solo';
}
function _g2048CoopScore(cid) {
const sc = _gScore(cid, 'g2048');
if (!sc.coop || typeof sc.coop !== 'object' || Array.isArray(sc.coop)) sc.coop = { best: 0, plays: 0, tile: false };
const co = sc.coop;
if (typeof co.best !== 'number' || !isFinite(co.best) || co.best < 0) co.best = 0;
if (typeof co.plays !== 'number' || !isFinite(co.plays) || co.plays < 0) co.plays = 0;
if (co.tile !== true) co.tile = false;
return co;
}
function _g2048ApplyMode() {
const mode = _g2048Mode();
_g2048.mode = mode;
_g2048.turn = 'me';
_gModeChrome('g2048');
const cl = $('#coopLine2048'); if (cl) cl.hidden = mode !== 'coop';
$$('#g2048Modes .merge-scheme').forEach(b => b.classList.toggle('on', b.dataset.gmode === mode));
_g2048ScoreView(false);
if (mode === 'coop') _g2048CoopRender(); else _gamesRenderTaLine('g2048');
g2048RefreshStat();
}
function _g2048SetMode(m) {
if (!['solo', 'coop', 'vs'].includes(m) || _g2048Mode() === m) return;
data.games.g2048Mode = m;
save();
g2048Restart();
}
function _g2048CoopRender() {
const box = $('#coopLine2048');
if (!box) return;
const c = _gContact(data.games.with) || {};
const nm = _gName(data.games.with);
let say;
if (_g2048.over) say = '这局推完了 · 重新开始或换个玩法';
else if (_g2048.turn === 'ta') say = nm + ' 正在想往哪儿推…';
else if (_g2048.lastTa) say = 'TA 刚往' + _g2048.lastTa + '推了一把 · 该你了';
else say = '你滑一手，TA 滑一手';
box.innerHTML = `<span class="avatar">${avatarHTML(c.avatar)}</span>`
+ `<div class="ta-tt"><b>和 ${escapeHTML(nm)} 一起</b><span>${escapeHTML(say)}</span></div>`
+ `<div class="ta-score${_g2048.over ? '' : ' live'}"><b>${_g2048.score}</b><span>我们</span></div>`;
}
function _g2048CoopMilestone(v) {
const co = _g2048CoopScore(data.games.with);
if (v === 2048 && !co.tile) { co.tile = true; save(); }
if (v === 2048) _g2048.gotTile = true;
}
function _g2048CoopEnd(score) {
const co = _g2048CoopScore(data.games.with);
co.plays++;
if (score > co.best) co.best = score;
_gLast.g2048 = { score, coop: true };
save();
playSfx('over');
g2048RefreshStat();
_gEndReport('g2048', score, { coop: true, ach: _g2048.gotTile ? G_NAMES.g2048 : null });
}
function _g2048CoopShare() {
const co = _g2048CoopScore(data.games.with);
const score = _g2048.score || co.best;
if (!score) { showToast('先一起推一局再告诉 TA'); return; }
const cid = data.games.with;
_deliverToChat({
id: nextId(), from: 'me', text: '这局是我们俩推的，' + score + ' 分',
game: { kind: 'score', game: 'g2048', score, best: co.best, ta: 0, beaten: false, newBest: score >= co.best && score > 0 }
}, cid);
setTimeout(() => {
if (!data.games || !data.contacts) return;
const coShareSay = presetSayPick('合作共享成绩');
if (coShareSay) _deliverToChat({ id: nextId(), from: 'partner', text: coShareSay }, cid);
}, 1400 + Math.random() * 2600);
showToast('已发给 ' + _gName(cid));
}
var G2048_SNAKE = [15, 14, 13, 12, 8, 9, 10, 11, 7, 6, 5, 4, 0, 1, 2, 3];
function _g2048GridOf() {
const g = new Array(16).fill(0);
_g2048.tiles.forEach(t => { if (!t.dead) g[t.r * 4 + t.c] = t.v; });
return g;
}
function _g2048Sim(g0, dir) {
const out = new Array(16).fill(0);
let gain = 0, moved = false;
for (let i = 0; i < 4; i++) {
const idx = [];
for (let j = 0; j < 4; j++) {
idx.push(dir === 'left' ? i * 4 + j : dir === 'right' ? i * 4 + 3 - j : dir === 'up' ? j * 4 + i : (3 - j) * 4 + i);
}
const vals = idx.map(k => g0[k]).filter(v => v);
const line = [];
for (let k = 0; k < vals.length; k++) {
if (k + 1 < vals.length && vals[k] === vals[k + 1]) { line.push(vals[k] * 2); gain += vals[k] * 2; k++; }
else line.push(vals[k]);
}
for (let j = 0; j < 4; j++) {
const v = line[j] || 0;
out[idx[j]] = v;
if (v !== g0[idx[j]]) moved = true;
}
}
return { g: out, gain, moved };
}
function _g2048Eval(g, gain) {
let s = 0, empty = 0, mx = 0;
for (let i = 0; i < 16; i++) {
const v = g[i];
if (!v) { empty++; continue; }
s += G2048_SNAKE[i] * v;
if (v > mx) mx = v;
}
return s + empty * 900 + gain * 240 + mx * 12;
}
function _g2048TaPick() {
const g0 = _g2048GridOf();
const legal = [];
for (const dir of ['left', 'right', 'up', 'down']) {
const s = _g2048Sim(g0, dir);
if (s.moved) legal.push({ dir, v: _g2048Eval(s.g, s.gain) });
}
if (!legal.length) return '';
if (Math.random() < 0.12) return legal[Math.floor(Math.random() * legal.length)].dir;
legal.sort((a, b) => b.v - a.v);
const near = legal.filter(x => legal[0].v - x.v <= 1200);
return near[Math.floor(Math.random() * near.length)].dir;
}
function _g2048TaSchedule() {
if (_g2048.taTimer) clearTimeout(_g2048.taTimer);
_g2048.turn = 'ta';
_g2048CoopRender();
_g2048.taTimer = setTimeout(_g2048TaMove, 760 + Math.random() * 1000);
}
function _g2048TaMove() {
_g2048.taTimer = 0;
_g2048.turn = 'me';
if (_g2048Mode() !== 'coop' || _g2048.over || data.games.tab !== 'g2048' || document.body.dataset.view !== 'games') return;
const dir = _g2048TaPick();
if (!dir) { _g2048Finish(); return; }
const res = _g2048Step(dir);
if (!res.moved) { _g2048CoopRender(); return; }
_g2048.lastTa = G2048_DIR_CN[dir] || '';
_g2048AfterMove(res, true);
if (_g2048Stuck()) { _g2048Finish(); return; }
_g2048CoopRender();
}
function _g2048Finish() {
if (_g2048.over) return;
_g2048.over = true;
if (_g2048.taTimer) { clearTimeout(_g2048.taTimer); _g2048.taTimer = 0; }
_g2048.turn = 'me';
const mode = _g2048Mode();
if (mode === 'coop') _g2048CoopEnd(_g2048.score);
else _gGameEnd('g2048', _g2048.score, mode === 'solo' ? { noTa: true } : undefined);
_g2048OverView();
}
function _g2048Geom() {
const box = $('#g2048Grid');
if (!box) return null;
const W = box.clientWidth || 320, H = box.clientHeight || W;
const pg = _gEffPG(G2048_PAD, G2048_GAP), PAD = pg[0], GAP = pg[1];
const cw = (W - PAD * 2 - GAP * 3) / 4;
const ch = (H - PAD * 2 - GAP * 3) / 4;
return { box, pad: PAD, gap: GAP, cw, ch, sx: cw + GAP, sy: ch + GAP };
}
function _g2048Burst(t) {
const g = _g2048Geom();
if (!g) return;
const b = document.createElement('i');
b.className = 'g2048-burst' + (t.v >= 128 ? ' gold' : '');
b.style.width = g.cw + 'px';
b.style.height = g.ch + 'px';
b.style.transform = `translate(${Math.round(t.c * g.sx)}px,${Math.round(t.r * g.sy)}px)`;
g.box.appendChild(b);
setTimeout(() => b.remove(), 520);
}
function g2048Undo() {
if (!_g2048.prev || !_g2048.tiles) return;
const prev = _g2048.prev;
_g2048.prev = null;
if (_g2048.taTimer) { clearTimeout(_g2048.taTimer); _g2048.taTimer = 0; }
_g2048.turn = 'me';
_g2048.lastTa = '';
_g2048.tiles.forEach(t => { const el = _g2048._els.get(t.id); if (el) el.remove(); });
_g2048._els.clear();
_g2048.tiles = prev.tiles.map(s => ({ id: ++_g2048._id, v: s.v, r: s.r, c: s.c }));
_g2048.score = prev.score;
_g2048.over = false;
const ov = $('#g2048Over');
if (ov) ov.textContent = '';
g2048Render();
_g2048ScoreView(false);
g2048RefreshStat();
showToast(_g2048Mode() === 'coop' ? '退回你上一手之前（TA 那手也跟着退）' : '退回一步');
}
function _g2048OverView() {
const ov = $('#g2048Over');
if (!ov) return;
if (_g2048Mode() === 'coop') {
ov.textContent = `这局我们一起推了 ${_g2048.score} 分${_g2048.bestTier >= 2048 ? ' · 还合出了 2048' : ''}`;
return;
}
ov.textContent = `局终 · ${_g2048.score} 分${_gLast.g2048 && _gLast.g2048.beaten ? ' · 挑战告捷' : ''}`;
}
function _g2048Stuck() {
const g = new Array(16).fill(0);
_g2048.tiles.forEach(t => { if (!t.dead) g[t.r * 4 + t.c] = t.v; });
if (g.some(v => !v)) return false;
for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
if (c < 3 && g[r * 4 + c] === g[r * 4 + c + 1]) return false;
if (r < 3 && g[r * 4 + c] === g[(r + 1) * 4 + c]) return false;
}
return true;
}
function _g2048SkinSchemes() {
if (!data.games || !Array.isArray(data.games.g2048SkinSchemes)) data.games.g2048SkinSchemes = [];
return data.games.g2048SkinSchemes;
}
function _g2048SkinSchemeOn() {
return _g2048SkinSchemes().find(s => s.id === data.games.g2048SkinScheme) || null;
}
function _g2048SchemeUse(id) {
const sc = id ? _g2048SkinSchemes().find(s => s.id === id) : null;
if (id && !sc) return;
const fresh = {};
if (sc) Object.keys(sc.skins).forEach(k => { if (sc.skins[k]) fresh[k] = sc.skins[k]; });
data.games.g2048Skins = fresh;
data.games.g2048SkinScheme = sc ? sc.id : '';
save();
g2048RenderSkins(); g2048Render();
showToast(sc ? '已切到「' + sc.name + '」' : '已切回配色字面');
}
function _g2048SchemeSave() {
const list = _g2048SkinSchemes();
if (list.length >= 6) { showToast('方案最多存 6 套，删一套再存'); return; }
const cur = data.games.g2048Skins || {};
const skins = {};
Object.keys(cur).forEach(k => { if (cur[k]) skins[k] = cur[k]; });
if (!Object.keys(skins).length) { showToast('先传几张图再存'); return; }
let n = 1;
while (list.some(s => s.name === '方案 ' + n)) n++;
list.push({ id: 'gs' + Date.now().toString(36) + Math.floor(Math.random() * 99), name: '方案 ' + n, skins });
data.games.g2048SkinScheme = list[list.length - 1].id;
save();
g2048RenderSkins();
showToast('已存「方案 ' + n + '」，随时切');
}
function _g2048SchemeDel(id) {
const list = _g2048SkinSchemes();
const i = list.findIndex(s => s.id === id);
if (i < 0) return;
const gone = list.splice(i, 1)[0];
if (data.games.g2048SkinScheme === id) data.games.g2048SkinScheme = '';
save();
g2048RenderSkins();
showToast('已删「' + gone.name + '」');
}
var _skinBatchBusy = false;
async function _gSkinsBatch(files, slots, put) {
if (_skinBatchBusy) return { ok: 0, tooBig: 0 };
_skinBatchBusy = true;
const r = { ok: 0, tooBig: 0 };
try {
for (let i = 0; i < files.length && i < slots.length; i++) {
if (files[i].size > (typeof IMG_INPUT_MAX === 'number' ? IMG_INPUT_MAX : MAX_FILE_SIZE)) { r.tooBig++; continue; }
const durl = await fileData(files[i], 320, 0.85);
if (!durl) continue;
put(slots[i], durl);
r.ok++;
}
} finally { _skinBatchBusy = false; }
return r;
}
function g2048RenderSkins() {
const box = $('#g2048Skins');
if (!box) return;
const skins = data.games.g2048Skins || {};
const on = data.games.g2048SkinScheme || '';
box.innerHTML = `<div class="merge-skin-row">`
+ `<button type="button" class="merge-scheme${on === '' ? ' on' : ''}" data-gscheme="">配色字面</button>`
+ _g2048SkinSchemes().map(s => `<button type="button" class="merge-scheme${s.id === on ? ' on' : ''}" data-gscheme="${s.id}">${escapeHTML(s.name)}<u data-gsdel="${s.id}" title="删这套">×</u></button>`).join('')
+ `<button type="button" class="merge-scheme add" id="g2048SchemeSave">＋存为方案</button>`
+ `<button type="button" class="merge-scheme add" id="g2048SkinBatchBtn">一次传一套</button>`
+ `</div>`
+ `<div class="g2048-skins-t">给数字传一张图，合成到它就变成它 · 上面整套装成方案，玩着随时切<br>「一次传一套」按你选的先后从 2 铺到 2048，已有的格子直接换掉（一次最多 11 张，不够就只铺前几格）</div>`
+ `<div class="g2048-skin-grid">` + G_MERGE_VAL.map(v => {
const im = skins[v];
return `<button type="button" class="g2048-skin${im ? ' has' : ''}" data-gskin="${v}" aria-label="${im ? '更换' : '上传'}${v}的图片">`
+ (im ? `<img src="${im}" alt="" draggable="false"><span>${v}</span>`
: `<i style="background:${_g2048Color(v)};color:${v <= 4 ? '#1a1c22' : '#fff'}">${v}</i>`)
+ (im ? `<u data-gskinx="${v}" aria-label="移除${v}的图片">×</u>` : '')
+ `</button>`;
}).join('') + `</div>`
+ `<button type="button" class="game-btn g2048-skin-reset" id="g2048SkinReset">这套全部恢复配色字面</button>`;
}
var _g2048SkinPick = 0;
var _merge = { balls: [], fx: [], cur: 2, next: 3, score: 0, over: false, dangerT: 0, dropX: 0, aim: false, w: 320, h: 380, raf: 0, cool: 0, scorePop: 0, bestTier: 0, mode: 'solo', coop: { taAt: 0 }, gotMelon: false };
var _mergeImgs = {};
var _mergeSkinTier = -1, _mergeSkinOpen = false;
function _gEaseBack(k) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); }
function _mergeImg(t) {
const url = data.games && data.games.mergeSkins && data.games.mergeSkins[t];
if (!url) return null;
let im = _mergeImgs[t];
if (!im || im.src !== url) { im = new Image(); im.src = url; _mergeImgs[t] = im; }
return im.complete && im.naturalWidth ? im : null;
}
function gMergeSize() {
const cv = $('#mergeCv');
if (!cv || !cv.parentElement) return;
const box = _gBoardBox(cv.parentElement);
if (box.w < 40) return;
const avail = _gBoxInner(cv, box.w);
const ar = 340 / 380;
const w = Math.round(Math.min(avail, box.h > 0 ? box.h * ar : avail));
const h = Math.round(w / ar);
const dpr = window.devicePixelRatio || 1;
cv.style.width = w + 'px'; cv.style.height = h + 'px';
cv.width = w * dpr; cv.height = h * dpr;
_merge.w = w; _merge.h = h;
cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
}
function gMergeBoot(force) {
const cv = $('#mergeCv');
if (!cv) return;
gMergeSize();
if (!data.games.mergeSkins) data.games.mergeSkins = {};
if (!Array.isArray(data.games.mergeSkinSchemes)) data.games.mergeSkinSchemes = [];
if (typeof data.games.mergeSkinScheme !== 'string') data.games.mergeSkinScheme = '';
if (!data.games.mergeSkinSchemes.length && Object.keys(data.games.mergeSkins).length) {
data.games.mergeSkinSchemes.push({ id: 'ms' + Date.now().toString(36), name: '方案 1', skins: Object.assign({}, data.games.mergeSkins) });
data.games.mergeSkinScheme = data.games.mergeSkinSchemes[0].id;
save();
}
for (let i = 0; i < 11; i++) _mergeImg(i);
if (!_merge.balls.length || force) gMergeRestart();
else { gMergeRefreshStat(); _gMergeRail(); }
}
function gMergeRestart() {
_merge.balls = []; _merge.fx = []; _merge.score = 0; _merge.over = false; _merge.dangerT = 0; _merge.cool = 0;
_merge.aim = false; _merge.bestTier = 0; _merge.scorePop = 0; _merge.gotMelon = false;
_merge.mode = _gMergeMode();
_merge.coop = { taAt: _merge.mode === 'coop' ? Date.now() + 1800 : 0 };
_merge.cur = Math.floor(Math.random() * 5);
_merge.next = Math.floor(Math.random() * 5);
delete _gLast.merge;
delete _gLive.merge;
gMergeRefreshStat(); _gMergeRail();
}
function _gMergeMode() { return (data.games && data.games.mergeMode) || 'solo'; }
function _gMergeCoopScore(cid) {
const sc = _gScore(cid, 'merge');
if (!sc.coop || typeof sc.coop !== 'object') sc.coop = { best: 0, plays: 0, melon: false };
return sc.coop;
}
function _gMergeApplyMode() {
const mode = _gMergeMode();
_merge.mode = mode;
_gModeChrome('merge');
const cl = $('#coopLine'); if (cl) cl.hidden = mode !== 'coop';
$$('#mergeModes .merge-scheme').forEach(b => b.classList.toggle('on', b.dataset.mmode === mode));
if (mode === 'coop') _gMergeCoopRender();
gMergeRefreshStat();
}
function _gMergeSetMode(m) {
if (!['solo', 'coop', 'vs'].includes(m) || _gMergeMode() === m) return;
data.games.mergeMode = m;
save();
gMergeRestart();
_gMergeApplyMode();
showToast(m === 'coop' ? '和 ' + _gName(data.games.with) + ' 一起玩：你丢一颗，TA 也丢一颗' : (m === 'solo' ? '自己玩，练手无压力' : '比分对战，可别输给 TA'));
}
function _gMergeCoopRender() {
const box = $('#coopLine');
if (!box) return;
const co = _gContact(data.games.with) || {};
const goal = Math.min(10, _merge.bestTier + 1);
box.innerHTML = `<span class="avatar">${avatarHTML(co.avatar)}</span>`
+ `<div class="ta-tt"><b>和 ${escapeHTML(_gName(data.games.with))} 一起</b><span>${_merge.over ? '这罐攒完了 · 满了再来一罐' : '一起的目标：' + G_FRUITS[goal].n + (goal === 10 ? '（大西瓜！）' : '')}</span></div>`
+ `<div class="ta-score${_merge.over ? '' : ' live'}"><b>${_merge.score}</b><span>这罐</span></div>`;
}
function _gMergeCoopEnd(score) {
const co = _gMergeCoopScore(data.games.with);
co.plays++;
if (score > co.best) co.best = score;
save();
playSfx('over');
if (document.body.dataset.view === 'games' && data.games.tab === 'merge') gMergeRefreshStat();
_gEndReport('merge', score, { coop: true, ach: _merge.gotMelon ? G_NAMES.merge : null });
}
function _gMergeRail() {
const rail = $('#mergeRail');
if (!rail) return;
const skins = (data.games && data.games.mergeSkins) || {};
rail.innerHTML = G_FRUITS.map((f, i) => {
const face = skins[i] ? `<img src="${skins[i]}" alt="">` : `<i style="background:radial-gradient(circle at 34% 30%,${f.c[0]},${f.c[1]})"></i>`;
return `<b class="${i === _merge.cur ? 'on' : (i === _merge.next && i !== _merge.cur ? 'nx' : '')}">${face}</b>`;
}).join('');
}
function gMergeRefreshStat() {
const el = $('#mergeStat');
if (!el) return;
const cid = data.games.with;
if (_gMergeMode() === 'coop') {
const co = _gMergeCoopScore(cid);
el.textContent = `合作最高 ${co.best} 分 · ${co.plays} 罐${co.melon ? ' · 合出过大西瓜' : ''}`;
_gMergeCoopRender();
return;
}
const sc = _gBook('merge');
el.textContent = `最高 ${sc.best} · ${sc.plays} 局${sc.ta > 0 ? ` · 挑战 ${sc.ta}` : ''}`;
}
function gMergeLoopKick() {
if (_merge.raf) return;
const step = () => {
_merge.raf = 0;
const active = document.body.dataset.view === 'games' && data.games && data.games.tab === 'merge' && !$('#gameMerge').hidden;
if (!active) return;
gMergePhysics();
gMergeDraw();
_merge.raf = requestAnimationFrame(step);
};
_merge.raf = requestAnimationFrame(step);
}
function _mergeHit(b, axis, power) {
if (power < 1.4) return;
const amt = Math.min(0.32, power * 0.05);
if (amt > Math.abs(b.sq || 0)) { b.sq = amt; b.sqv = 0; b.sqA = axis; }
}
function _mergeFxSpawn(tier, x, y, r) {
const f = G_FRUITS[tier];
const big = tier === 10;
_merge.fx.push({ type: 'ring', x, y, r, life: big ? 480 : 360, t: 0, c: f.c[1] });
const n = big ? 26 : 10;
for (let i = 0; i < n; i++) {
const a = Math.random() * Math.PI * 2, sp = (big ? 2.2 : 1.4) + Math.random() * (big ? 3.2 : 2);
_merge.fx.push({ type: 'drop', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, r: 1.5 + Math.random() * 2.2, life: 480 + Math.random() * 300, t: 0, c: [f.c[0], f.c[1], '#fff'][i % 3] });
}
}
function _mergeSupported(b, balls, R) {
const rb = R(b.tier);
if (b.y > _merge.h - rb - 0.8) return true;
for (const o of balls) {
if (o === b || o.y <= b.y + 0.01) continue;
if (Math.hypot(o.x - b.x, o.y - b.y) < rb + R(o.tier) + 1.2) return true;
}
return false;
}
function gMergePhysics() {
const R = t => G_FRUITS[t].r * (_merge.w / 340);
const balls = _merge.balls;
if (_merge.mode === 'coop' && !_merge.over && Date.now() >= (_merge.coop.taAt || 0)) {
_merge.coop.taAt = Date.now() + 1100 + Math.random() * 1400;
const t = Math.floor(Math.random() * 5);
const x = 24 + Math.random() * (_merge.w - 48);
const r = R(t);
_merge.balls.push({ x, y: 30 + r, vx: 0, vy: 0.5, tier: t, born: Date.now(), sq: 0, sqv: 0, sqA: 0, rot: 0, va: 0, ta: true });
if (Math.random() < 0.3) _merge.fx.push({ type: 'txt', x, y: 30 + r * 2 + 10, val: 'TA 丢了一颗', life: 800, t: 0, c: 'rgba(26,28,34,.55)' });
_gMergeCoopRender();
}
for (const b of balls) b.gnd = _mergeSupported(b, balls, R);
for (const b of balls) {
if (b.sq === undefined) { b.sq = 0; b.sqv = 0; b.sqA = 0; b.rot = 0; b.va = 0; }
const r = R(b.tier);
b.px = b.x;
b.vy += 0.34;
b.x += b.vx; b.y += b.vy;
if (!b.gnd) {
b.rot += b.va;
b.va *= 0.985;
if (Math.abs(b.va) < 0.002) b.va = 0;
}
if (b.x < r) { b.x = r; if (b.vx < 0) { const v = -b.vx; _mergeHit(b, 0, v); b.vx = v * 0.45; if (v > 1.4) b.va += Math.min(0.06, v * 0.02); } }
if (b.x > _merge.w - r) { b.x = _merge.w - r; if (b.vx > 0) { const v = b.vx; _mergeHit(b, 0, v); b.vx = -v * 0.45; if (v > 1.4) b.va -= Math.min(0.06, v * 0.02); } }
if (b.y > _merge.h - r) {
b.y = _merge.h - r;
if (b.vy > 0) { _mergeHit(b, Math.PI / 2, Math.abs(b.vy)); b.vy = -Math.abs(b.vy) * 0.24; }
b.vx *= 0.86;
b.gnd = true;
}
if (b.y < r + 2) { b.y = r + 2; if (b.vy < 0) b.vy = 0; }
b.sqv += -0.22 * b.sq; b.sqv *= 0.8; b.sq += b.sqv;
if (Math.abs(b.sq) < 0.003 && Math.abs(b.sqv) < 0.003) { b.sq = 0; b.sqv = 0; }
}
for (let pass = 0; pass < 2; pass++) {
for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
const a = balls[i], b = balls[j];
if (a.dead || b.dead) continue;
const dx = b.x - a.x, dy = b.y - a.y;
const rr = R(a.tier) + R(b.tier);
const dist = Math.hypot(dx, dy) || 0.01;
if (dist < rr) {
if (a.tier === b.tier && a.tier < 10 && dist < rr - 1) {
a.dead = b.dead = true;
const nt = a.tier + 1;
const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
_merge.balls.push({ x: mx, y: my, vx: (Math.random() - 0.5) * 1.2, vy: -1, tier: nt, dead: false, born: Date.now(), sq: 0, sqv: 0, sqA: 0, rot: 0, va: 0 });
_mergeFxSpawn(nt, mx, my, R(nt));
playSfx(nt >= 6 && nt > _merge.bestTier ? 'mile' : 'blend', { step: _gSfxStep(nt), weak: !!(a.ta || b.ta) });
if (nt > _merge.bestTier) {
_merge.bestTier = nt;
_merge.fx.push({ type: 'txt', x: mx, y: my - R(nt) - 10, val: nt === 10 ? '大西瓜！' : G_FRUITS[nt].n + '！', life: 900, t: 0, c: '#1a1c22' });
if (_merge.mode === 'coop' && nt === 10) {
_merge.gotMelon = true;
const co = _gMergeCoopScore(data.games.with);
if (!co.melon) { co.melon = true; save(); }
}
}
_merge.score += G_MERGE_VAL[nt];
_merge.scorePop = Date.now();
gMergeRefreshStat();
continue;
}
const push = (rr - dist) / 2;
const nx = dx / dist, ny = dy / dist;
a.x -= nx * push; a.y -= ny * push;
b.x += nx * push; b.y += ny * push;
const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
const vn = rvx * nx + rvy * ny;
if (vn < 0) {
const imp = vn * 0.38;
a.vx += nx * imp; a.vy += ny * imp;
b.vx -= nx * imp; b.vy -= ny * imp;
const axis = Math.atan2(ny, nx);
_mergeHit(a, axis, Math.abs(vn) * 0.6);
_mergeHit(b, axis, Math.abs(vn) * 0.6);
const spin = Math.abs(vn) > 1.4 ? (rvx * ny - rvy * nx) * 0.004 : 0;
a.va -= spin; b.va += spin;
}
}
}
}
for (const b of balls) {
if (!b.gnd) continue;
const roll = (b.x - b.px) / R(b.tier);
if (Math.abs(roll) < 0.0008) { b.va = 0; continue; }
b.rot += roll; b.va = roll;
}
for (const p of _merge.fx) {
p.t += 16;
if (p.type === 'drop') { p.vy += 0.22; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; }
else if (p.type === 'txt') p.y -= 0.7;
}
_merge.fx = _merge.fx.filter(p => p.t < p.life);
_merge.balls = _merge.balls.filter(b => !b.dead);
const lineY = 64;
let danger = false;
for (const b of _merge.balls) {
if (Date.now() - (b.born || 0) > 1200 && b.y - R(b.tier) < lineY) danger = true;
}
if (danger) {
_merge.dangerT += 16;
if (_merge.dangerT > 2000 && !_merge.over) {
_merge.over = true;
if (_merge.mode === 'coop') _gMergeCoopEnd(_merge.score);
else _gGameEnd('merge', _merge.score, _merge.mode === 'solo' ? { noTa: true } : undefined);
if (_merge.mode === 'coop') _gMergeCoopRender();
}
} else _merge.dangerT = 0;
}
function _gMergeBallFace(ctx, tier, x, y, r, rot, sq, sqA, born) {
const f = G_FRUITS[tier];
let s = 1;
if (born) { const age = (Date.now() - born) / 300; if (age < 1) s = Math.max(0.05, _gEaseBack(age)); }
ctx.save();
ctx.translate(x, y);
if (sq) { ctx.rotate(sqA); ctx.scale(1 - sq, 1 + sq * 0.8); ctx.rotate(-sqA); }
ctx.rotate(rot || 0);
ctx.scale(s, s);
const img = _mergeImg(tier);
if (img) {
ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
const k = Math.max(r * 2 / img.naturalWidth, r * 2 / img.naturalHeight);
ctx.drawImage(img, -img.naturalWidth * k / 2, -img.naturalHeight * k / 2, img.naturalWidth * k, img.naturalHeight * k);
ctx.beginPath(); ctx.arc(0, 0, r, 0, 7);
const hl = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r);
hl.addColorStop(0, 'rgba(255,255,255,.42)');
hl.addColorStop(0.55, 'rgba(255,255,255,.05)');
hl.addColorStop(1, 'rgba(26,28,34,.12)');
ctx.fillStyle = hl; ctx.fill();
} else {
const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.2, 0, 0, r);
g.addColorStop(0, f.c[0]); g.addColorStop(1, f.c[1]);
ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = g; ctx.fill();
if (r >= 16) {
ctx.rotate(-(rot || 0));
ctx.fillStyle = 'rgba(255,255,255,.92)';
ctx.font = `${Math.max(9, r * 0.28)}px sans-serif`;
ctx.textAlign = 'center';
ctx.fillText(f.n, 0, 3);
}
}
ctx.restore();
}
function gMergeDraw() {
const cv = $('#mergeCv');
if (!cv) return;
const ctx = cv.getContext('2d');
const W = _merge.w, H = _merge.h;
const now = Date.now();
const dpr = window.devicePixelRatio || 1;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
ctx.clearRect(0, 0, W, H);
const danger = _merge.dangerT > 0;
ctx.setLineDash([5, 5]);
ctx.strokeStyle = danger ? `rgba(194,85,75,${(0.45 + 0.3 * Math.abs(Math.sin(now / 130))).toFixed(2)})` : 'rgba(26,28,34,.2)';
ctx.beginPath(); ctx.moveTo(6, 64); ctx.lineTo(W - 6, 64); ctx.stroke();
ctx.setLineDash([]);
ctx.font = '9px sans-serif';
ctx.fillStyle = danger ? 'rgba(194,85,75,.75)' : 'rgba(26,28,34,.4)';
ctx.textAlign = 'right';
ctx.fillText(danger ? '警戒线 · 快满了' : '警戒线', W - 10, 60);
const R = t => G_FRUITS[t].r * (W / 340);
if (!_merge.over && now >= _merge.cool) {
const r = R(_merge.cur);
const x = _merge.dropX || W / 2;
const y = 30 + r;
ctx.globalAlpha = 0.35;
ctx.setLineDash([3, 5]);
ctx.strokeStyle = 'rgba(26,28,34,.3)';
ctx.beginPath(); ctx.moveTo(x, y + r + 4); ctx.lineTo(x, H - 8); ctx.stroke();
ctx.setLineDash([]);
ctx.globalAlpha = 1;
_gMergeBallFace(ctx, _merge.cur, x, y, r, 0, 0);
}
for (const b of _merge.balls) _gMergeBallFace(ctx, b.tier, b.x, b.y, R(b.tier), b.rot, b.sq, b.sqA, b.born);
for (const p of _merge.fx) {
const k = p.t / p.life;
if (p.type === 'drop') {
ctx.globalAlpha = 1 - k;
ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - k * 0.5), 0, 7); ctx.fillStyle = p.c; ctx.fill();
} else if (p.type === 'ring') {
ctx.globalAlpha = (1 - k) * 0.7;
ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.6 + k * 1.1), 0, 7);
ctx.strokeStyle = p.c; ctx.lineWidth = 2.5 * (1 - k) + 0.5; ctx.stroke(); ctx.lineWidth = 1;
} else if (p.type === 'txt') {
ctx.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
ctx.fillStyle = p.c;
ctx.font = '600 14px Georgia,serif';
ctx.textAlign = 'center';
ctx.fillText(p.val, p.x, p.y);
}
ctx.globalAlpha = 1;
}
const pop = Math.max(0, 1 - (now - _merge.scorePop) / 220);
ctx.save();
ctx.translate(12, 30);
ctx.scale(1 + pop * 0.22, 1 + pop * 0.22);
ctx.fillStyle = 'rgba(26,28,34,.78)';
ctx.font = '20px Georgia,serif';
ctx.textAlign = 'left';
ctx.fillText(String(_merge.score), 0, 0);
ctx.restore();
if (_merge.over) {
ctx.fillStyle = 'rgba(240,242,246,.5)';
ctx.fillRect(0, 0, W, H);
const pw = Math.min(W - 48, 230), ph = 96, px = (W - pw) / 2, py = H / 2 - ph / 2 - 10;
ctx.save();
ctx.shadowColor = 'rgba(24,32,54,.16)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
ctx.fillStyle = 'rgba(255,255,255,.94)';
_gRoundRect(ctx, px, py, pw, ph, 18);
ctx.restore();
ctx.fillStyle = '#1a1c22';
ctx.font = '600 16px sans-serif';
ctx.textAlign = 'center';
ctx.fillText(_merge.mode === 'coop' ? '这罐我们攒了 ' + _merge.score + ' 分' : '罐子满了 · ' + _merge.score + ' 分', W / 2, py + 42);
ctx.fillStyle = 'rgba(26,28,34,.5)';
ctx.font = '11px sans-serif';
ctx.fillText('点「重新开始」再来一局', W / 2, py + 66);
}
}
function _gSkinSchemes() {
if (!data.games || !Array.isArray(data.games.mergeSkinSchemes)) data.games.mergeSkinSchemes = [];
return data.games.mergeSkinSchemes;
}
function _gSkinSchemeOn() {
return _gSkinSchemes().find(s => s.id === data.games.mergeSkinScheme) || null;
}
function _gMergeSkinsRender() {
const box = $('#mergeSkins');
if (!box) return;
const skins = (data.games && data.games.mergeSkins) || {};
const on = data.games.mergeSkinScheme || '';
box.innerHTML = `<div class="merge-skin-row">`
+ `<button type="button" class="merge-scheme${on === '' ? ' on' : ''}" data-mscheme="">默认水果</button>`
+ _gSkinSchemes().map(s => `<button type="button" class="merge-scheme${s.id === on ? ' on' : ''}" data-mscheme="${s.id}">${escapeHTML(s.name)}<u data-msdel="${s.id}" title="删这套">×</u></button>`).join('')
+ `<button type="button" class="merge-scheme add" id="mergeSchemeSave">＋存为方案</button>`
+ `<button type="button" class="merge-scheme add" id="mergeSkinBatchBtn">一次传一套</button>`
+ `</div>`
+ `<div class="merge-skins-t">点哪颗换哪颗，当场就玩（图只存本机）· 上面整套装成方案，玩着随时切<br>「一次传一套」按你选的先后从樱桃铺到西瓜，已有的那颗直接换掉（一次最多 11 张，不够就只铺前几颗）</div>`
+ `<div class="merge-skin-grid">`
+ G_FRUITS.map((f, i) => `<button type="button" class="merge-skin${skins[i] ? ' has' : ''}" data-mskin="${i}">`
+ (skins[i] ? `<img src="${skins[i]}" alt=""><u data-mclear="${i}" title="恢复默认">×</u>` : `<i style="background:radial-gradient(circle at 34% 30%,${f.c[0]},${f.c[1]})"></i>`)
+ `<span>${f.n}</span></button>`).join('')
+ `</div>`
+ `<button type="button" class="game-btn merge-skin-reset" id="mergeSkinReset">这套全部恢复默认水果</button>`;
}
function _gMergeSkinClear(t) {
if (!data.games.mergeSkins || !data.games.mergeSkins[t]) return;
delete data.games.mergeSkins[t];
const sc = _gSkinSchemeOn();
if (sc) delete sc.skins[t];
delete _mergeImgs[t];
save();
_gMergeSkinsRender(); _gMergeRail();
showToast(G_FRUITS[t].n + ' 恢复默认');
}
function _gMergeSchemeUse(id) {
const sc = id ? _gSkinSchemes().find(s => s.id === id) : null;
if (id && !sc) return;
const fresh = {};
if (sc) Object.keys(sc.skins).forEach(k => { fresh[k] = sc.skins[k]; });
data.games.mergeSkins = fresh;
data.games.mergeSkinScheme = sc ? sc.id : '';
Object.keys(_mergeImgs).forEach(k => delete _mergeImgs[k]);
save();
_gMergeSkinsRender(); _gMergeRail();
showToast(sc ? '已切到「' + sc.name + '」' : '已切回默认水果');
}
function _gMergeSchemeSave() {
const list = _gSkinSchemes();
if (list.length >= 6) { showToast('方案最多存 6 套，删一套再存'); return; }
const cur = data.games.mergeSkins || {};
const skins = {};
Object.keys(cur).forEach(k => { if (cur[k]) skins[k] = cur[k]; });
if (!Object.keys(skins).length) { showToast('先换几颗再存'); return; }
let n = 1;
while (list.some(s => s.name === '方案 ' + n)) n++;
list.push({ id: 'ms' + Date.now().toString(36) + Math.floor(Math.random() * 99), name: '方案 ' + n, skins });
data.games.mergeSkinScheme = list[list.length - 1].id;
save();
_gMergeSkinsRender();
showToast('已存「方案 ' + n + '」，随时切');
}
function _gMergeSchemeDel(id) {
const list = _gSkinSchemes();
const i = list.findIndex(s => s.id === id);
if (i < 0) return;
const gone = list.splice(i, 1)[0];
if (data.games.mergeSkinScheme === id) data.games.mergeSkinScheme = '';
save();
_gMergeSkinsRender();
showToast('已删「' + gone.name + '」');
}
function _gRoundRect(ctx, x, y, w, h, r) {
ctx.beginPath();
ctx.moveTo(x + r, y);
ctx.arcTo(x + w, y, x + w, y + h, r);
ctx.arcTo(x + w, y + h, x, y + h, r);
ctx.arcTo(x, y + h, x, y, r);
ctx.arcTo(x, y, x + w, y, r);
ctx.fill();
}
var G_POP_COLORS = [
{ n: '红', c: ['#ec8a80', '#d26055'] },
{ n: '橙', c: ['#f4b06a', '#e08a38'] },
{ n: '绿', c: ['#96cf8e', '#64a95e'] },
{ n: '蓝', c: ['#8ab8e6', '#5488c2'] },
{ n: '紫', c: ['#b6a0e8', '#8a70c6'] }
];
var POP_N = 10, POP_PAD = 8, POP_GAP = 4;
function POP_LVL_T(l) { return 800 + (Math.max(1, l | 0) - 1) * 400; }
function POP_LVL_C(l) { return Math.min(G_POP_COLORS.length, 3 + Math.floor((Math.max(1, l | 0) - 1) / 3)); }
var POP_LVL_CLEAR = 2000;
function _popLvlOfScore(s) {
s = Math.max(0, Number(s) || 0);
let lvl = 1, cum = POP_LVL_T(1);
while (s >= cum && lvl < 999) { lvl++; cum += POP_LVL_T(lvl); }
return lvl - 1 > 0 ? lvl - 1 : 1;
}
var _pop = { cells: null, score: 0, over: false, _id: 0, _els: new Map(), _pos: new Map(), mode: 'solo', turn: 'me', taTimer: 0, lastTa: '', lvl: 1, lvlScore: 0, target: POP_LVL_T(1), colorN: POP_LVL_C(1) };
function _gPopMode() {
const m = data.games && data.games.popMode;
return ['solo', 'coop', 'vs'].includes(m) ? m : 'solo';
}
function _gPopCoopScore(cid) {
const sc = _gScore(cid, 'pop');
if (!sc.coop || typeof sc.coop !== 'object' || Array.isArray(sc.coop)) sc.coop = { best: 0, plays: 0, clear: false, lvl: 0 };
const co = sc.coop;
if (typeof co.best !== 'number' || !isFinite(co.best) || co.best < 0) co.best = 0;
if (typeof co.plays !== 'number' || !isFinite(co.plays) || co.plays < 0) co.plays = 0;
if (co.clear !== true) co.clear = false;
if (typeof co.lvl !== 'number' || !isFinite(co.lvl) || co.lvl < 0) co.lvl = 0;
return co;
}
function gPopBoot(force) {
if (_pop.cells && !force) { _gPopApplyMode(); _popRender(); return; }
gPopRestart();
}
function _popBuildBoard() {
_pop.cells = new Array(POP_N * POP_N).fill(null);
for (let i = 0; i < POP_N * POP_N; i++) _pop.cells[i] = { id: ++_pop._id, v: Math.floor(Math.random() * _pop.colorN) };
}
function gPopRestart() {
_pop.lvl = 1;
_pop.lvlScore = 0;
_pop.target = POP_LVL_T(1);
_pop.colorN = POP_LVL_C(1);
_popBuildBoard();
_pop.score = 0;
_pop.over = false;
_pop._pos.clear();
_pop.turn = 'me';
_pop.lastTa = '';
if (_pop.taTimer) { clearTimeout(_pop.taTimer); _pop.taTimer = 0; }
if (_pop._els) { _pop._els.forEach(el => el.remove()); _pop._els.clear(); }
delete _gLast.pop;
delete _gLive.pop;
const ov = $('#popOver');
if (ov) ov.textContent = '';
_popRender();
_popScoreView(false);
gPopRefreshStat();
_gPopApplyMode();
}
function _popColorGrid() { return _pop.cells.map(b => b ? b.v : -1); }
function _popGroupsOf(g) {
const seen = new Array(POP_N * POP_N).fill(false);
const groups = [];
for (let i = 0; i < POP_N * POP_N; i++) {
if (g[i] < 0 || seen[i]) continue;
const col = g[i];
const st = [i], grp = [];
seen[i] = true;
while (st.length) {
const x = st.pop();
grp.push(x);
const r = Math.floor(x / POP_N), c = x % POP_N;
if (r > 0 && !seen[x - POP_N] && g[x - POP_N] === col) { seen[x - POP_N] = true; st.push(x - POP_N); }
if (r < POP_N - 1 && !seen[x + POP_N] && g[x + POP_N] === col) { seen[x + POP_N] = true; st.push(x + POP_N); }
if (c > 0 && !seen[x - 1] && g[x - 1] === col) { seen[x - 1] = true; st.push(x - 1); }
if (c < POP_N - 1 && !seen[x + 1] && g[x + 1] === col) { seen[x + 1] = true; st.push(x + 1); }
}
if (grp.length >= 2) groups.push(grp);
}
return groups;
}
function _popSettle() {
const cols = [];
for (let c = 0; c < POP_N; c++) {
const col = [];
for (let r = POP_N - 1; r >= 0; r--) { const b = _pop.cells[r * POP_N + c]; if (b) col.push(b); }
cols.push(col);
}
const live = cols.filter(a => a.length);
_pop.cells = new Array(POP_N * POP_N).fill(null);
live.forEach((col, nc) => col.forEach((b, i) => { _pop.cells[(POP_N - 1 - i) * POP_N + nc] = b; }));
}
function _popGeom() {
const box = $('#popGrid');
if (!box) return null;
const W = box.clientWidth || 320, H = box.clientHeight || W;
const pg = _gEffPG(POP_PAD, POP_GAP), PAD = pg[0], GAP = pg[1];
const cw = (W - PAD * 2 - GAP * (POP_N - 1)) / POP_N;
const ch = (H - PAD * 2 - GAP * (POP_N - 1)) / POP_N;
return { box, pad: PAD, gap: GAP, cw, ch, sx: cw + GAP, sy: ch + GAP };
}
function _popRender() {
const g = _popGeom();
if (!g) return;
_gSetCellVars(g.box, g.pad, g.gap, g.cw, g.ch);
let bg = g.box.querySelector('.pop-bg');
if (!bg) {
bg = document.createElement('div');
bg.className = 'pop-bg';
bg.innerHTML = '<i></i>'.repeat(POP_N * POP_N);
g.box.appendChild(bg);
}
for (let i = 0; i < POP_N * POP_N; i++) {
const b = _pop.cells[i];
if (!b) continue;
let el = _pop._els.get(b.id);
if (!el) {
el = document.createElement('div');
el.className = 'pop-tile';
const col = G_POP_COLORS[b.v];
el.style.background = `radial-gradient(circle at 34% 30%,${col.c[0]},${col.c[1]})`;
_pop._els.set(b.id, el);
g.box.appendChild(el);
el.classList.add('in');
el.style.animationDelay = ((Math.floor(i / POP_N) + i % POP_N) * 22) + 'ms';
setTimeout(() => { el.classList.remove('in'); el.style.animationDelay = ''; }, 1300);
}
el.dataset.pidx = i;
let delay = 0;
const prev = _pop._pos.get(b.id);
if (prev != null && prev !== i) {
const fr = Math.floor(i / POP_N) - Math.floor(prev / POP_N);
const fc = Math.abs((i % POP_N) - (prev % POP_N));
delay = Math.max(0, fr) * 22 + fc * 16;
}
el.style.transitionDelay = delay ? delay + 'ms' : '';
_pop._pos.set(b.id, i);
el.style.transform = `translate(${Math.round((i % POP_N) * g.sx)}px,${Math.round(Math.floor(i / POP_N) * g.sy)}px)`;
}
}
function _popBurst(x, y, size) {
const box = $('#popGrid');
if (!box) return;
const b = document.createElement('i');
b.className = 'pop-burst';
b.style.width = b.style.height = size + 'px';
b.style.left = x + 'px';
b.style.top = y + 'px';
box.appendChild(b);
setTimeout(() => b.remove(), 560);
}
function popTap(idx) {
if (_pop.over || !_pop.cells) return;
if (_gPopMode() === 'coop' && _pop.turn === 'ta') return;
const grp = _popGroupAt(idx);
if (grp) { _popDoPop(grp); return; }
const b = _pop.cells[idx];
const el = b && _pop._els.get(b.id);
if (el) { el.classList.add('no'); setTimeout(() => el.classList.remove('no'), 320); }
}
function _popGroupAt(idx) {
if (!_pop.cells[idx]) return null;
const grp = _popGroupsOf(_popColorGrid());
return grp.find(g => g.indexOf(idx) >= 0) || null;
}
function _popDoPop(grp, opts) {
opts = opts || {};
const n = grp.length;
const g0 = _popGeom();
let cx = 0, cy = 0;
if (g0) {
cx = (grp.reduce((s, i) => s + (i % POP_N), 0) / n) * g0.sx + g0.cw / 2;
cy = (grp.reduce((s, i) => s + Math.floor(i / POP_N), 0) / n) * g0.sy + g0.ch / 2;
}
grp.forEach((i, k) => {
const b = _pop.cells[i];
if (!b) return;
const el = _pop._els.get(b.id);
if (el) {
el.classList.add('bye');
el.style.animationDelay = (k % 5) * 30 + 'ms';
setTimeout(() => el.remove(), 560);
_pop._els.delete(b.id);
_pop._pos.delete(b.id);
}
_pop.cells[i] = null;
});
const gain = n * n * 5;
playSfx('blend', { step: _gSfxStep(n), weak: !!opts.ta });
_pop.score += gain;
_pop.lvlScore += gain;
_popSettle();
if (_gPopMode() === 'vs' && !opts.ta) _gTaLiveStart('pop');
if (g0) {
_popBurst(cx, cy, Math.min(120, ((g0.cw + g0.ch) / 2) * 1.4 + n * 4));
_popFloatScore('+' + gain, cx, cy);
} else _popFloatScore('+' + gain);
_popScoreView(true);
if (n >= 8) showToast(n + ' 连消！');
setTimeout(() => {
if (!data.games) return;
_popRender();
const more = _popGroupsOf(_popColorGrid());
if (!more.length) { _popLevelResolve(!!opts.ta); return; }
if (_gPopMode() === 'coop') {
if (!opts.ta) {
_popTaSchedule();
} else _gPopCoopRender();
}
}, 240);
}
function _popTaSchedule() {
if (_pop.taTimer) clearTimeout(_pop.taTimer);
_pop.turn = 'ta';
_gPopCoopRender();
_pop.taTimer = setTimeout(_popTaMove, 760 + Math.random() * 1000);
}
function _popSimPop(g0, grp) {
const ng = g0.slice();
grp.forEach(i => { ng[i] = -1; });
const cols = [];
for (let c = 0; c < POP_N; c++) {
const col = [];
for (let r = POP_N - 1; r >= 0; r--) if (ng[r * POP_N + c] >= 0) col.push(ng[r * POP_N + c]);
cols.push(col);
}
const live = cols.filter(a => a.length);
const out = new Array(POP_N * POP_N).fill(-1);
live.forEach((col, nc) => col.forEach((v, i) => { out[(POP_N - 1 - i) * POP_N + nc] = v; }));
return out;
}
function _popTaPick() {
const g0 = _popColorGrid();
const groups = _popGroupsOf(g0);
if (!groups.length) return null;
if (Math.random() < 0.12) return groups[Math.floor(Math.random() * groups.length)];
const scored = groups.map(grp => {
const nxt = _popGroupsOf(_popSimPop(g0, grp));
return { grp, v: grp.length * grp.length * 5 + (nxt.length ? Math.max.apply(null, nxt.map(x => x.length)) * 14 : 0) };
});
scored.sort((a, b) => b.v - a.v);
const near = scored.filter(x => scored[0].v - x.v <= 60);
return near[Math.floor(Math.random() * near.length)].grp;
}
function _popTaMove() {
_pop.taTimer = 0;
_pop.turn = 'me';
if (_gPopMode() !== 'coop' || _pop.over || data.games.tab !== 'pop' || document.body.dataset.view !== 'games') return;
const grp = _popTaPick();
if (!grp) { _popLevelResolve(true); return; }
_pop.lastTa = G_POP_COLORS[_pop.cells[grp[0]].v].n;
_popDoPop(grp, { ta: true });
}
function _popScoreView(bump) {
const wrap = $('#popScoreWrap');
const coop = _gPopMode() === 'coop';
if (wrap) {
wrap.innerHTML = '第 ' + _pop.lvl + ' 关 · ' + (coop ? '我们 <b id="popScore">' : '本关 <b id="popScore">')
+ _pop.lvlScore + '</b> / 目标 ' + _pop.target;
}
const el = $('#popScore');
if (el && bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
}
function _popFloatScore(txt, x, y) {
const box = $('#popGrid');
if (!box) return;
const f = document.createElement('span');
f.className = 'pop-float';
f.textContent = txt;
if (x != null) { f.style.left = x.toFixed(1) + 'px'; f.style.top = y.toFixed(1) + 'px'; }
box.appendChild(f);
setTimeout(() => f.remove(), 800);
}
function gPopRefreshStat() {
const el = $('#popStat');
if (!el) return;
const cid = data.games.with;
if (_gPopMode() === 'coop') {
const co = _gPopCoopScore(cid);
el.textContent = `合作最高 第 ${co.lvl || 0} 关 · ${co.plays} 局${co.clear ? ' · 一起清过盘' : ''}`;
_gPopCoopRender();
return;
}
const sc = _gBook('pop');
el.textContent = `最高 第 ${sc.lvl || 0} 关${_gPopMode() === 'vs' && sc.ta > 0 ? ` · 挑战 第 ${_popLvlOfScore(sc.ta)} 关` : ''}`;
}
function _gPopApplyMode() {
const mode = _gPopMode();
_pop.mode = mode;
_pop.turn = 'me';
_gModeChrome('pop');
const cl = $('#coopLinePop'); if (cl) cl.hidden = mode !== 'coop';
$$('#popModes .merge-scheme').forEach(b => b.classList.toggle('on', b.dataset.pmode === mode));
_popScoreView(false);
if (mode === 'coop') _gPopCoopRender(); else _gamesRenderTaLine('pop');
gPopRefreshStat();
}
function _gPopSetMode(m) {
if (!['solo', 'coop', 'vs'].includes(m) || _gPopMode() === m) return;
data.games.popMode = m;
save();
gPopRestart();
showToast(m === 'coop' ? '和 ' + _gName(data.games.with) + ' 一起玩：你消一片，TA 消一片' : (m === 'solo' ? '自己玩，练手无压力' : '比分对战，可别输给 TA'));
}
function _gPopCoopRender() {
const box = $('#coopLinePop');
if (!box) return;
const c = _gContact(data.games.with) || {};
const nm = _gName(data.games.with);
let say;
if (_pop.over) say = `第 ${_pop.lvl} 关没过去 · 重新开始或换个玩法`;
else if (_pop.turn === 'ta') say = nm + ' 正在挑哪一片…';
else if (_pop.lastTa) say = 'TA 刚消了一片' + _pop.lastTa + '的 · 该你了';
else say = `你消一片，TA 消一片 · 合力冲第 ${_pop.lvl} 关`;
box.innerHTML = `<span class="avatar">${avatarHTML(c.avatar)}</span>`
+ `<div class="ta-tt"><b>和 ${escapeHTML(nm)} 一起</b><span>${escapeHTML(say)}</span></div>`
+ `<div class="ta-score${_pop.over ? '' : ' live'}"><b>${_pop.score}</b><span>我们</span></div>`;
}
function _gPopCoopEnd(score, cleared) {
const co = _gPopCoopScore(data.games.with);
co.plays++;
if (score > co.best) co.best = score;
if (cleared) co.clear = true;
_gLast.pop = { score, coop: true };
save();
if (!cleared) playSfx('over');
gPopRefreshStat();
_gEndReport('pop', score, { coop: true, cleared });
}
function _gPopCoopShare() {
const co = _gPopCoopScore(data.games.with);
const score = _pop.score || co.best;
if (!score) { showToast('先一起消一盘再告诉 TA'); return; }
const cid = data.games.with;
_deliverToChat({
id: nextId(), from: 'me', text: '这盘是我们俩消的，' + score + ' 分',
game: { kind: 'score', game: 'pop', score, best: co.best, ta: 0, beaten: false, newBest: score >= co.best && score > 0 }
}, cid);
setTimeout(() => {
if (!data.games || !data.contacts) return;
const coShareSay = presetSayPick('合作共享成绩');
if (coShareSay) _deliverToChat({ id: nextId(), from: 'partner', text: coShareSay }, cid);
}, 1400 + Math.random() * 2600);
showToast('已发给 ' + _gName(cid));
}
function _popRecordLvl(l) {
if (_gPopMode() === 'coop') {
const co = _gPopCoopScore(data.games.with);
if (l > (co.lvl || 0)) co.lvl = l;
return;
}
const sc = _gBook('pop');
if (l > (sc.lvl || 0)) sc.lvl = l;
}
function _popLevelResolve(byTa) {
if (_pop.over) return;
const cleared = _pop.cells.every(c => !c);
if (cleared) {
_pop.score += POP_LVL_CLEAR;
_pop.lvlScore += POP_LVL_CLEAR;
const gf = _popGeom();
if (gf) _popFloatScore('全清 +' + POP_LVL_CLEAR, gf.box.clientWidth / 2, gf.box.clientHeight / 2); else _popFloatScore('全清 +' + POP_LVL_CLEAR);
playSfx('clear');
}
if (_pop.lvlScore >= _pop.target) {
_popRecordLvl(_pop.lvl);
save();
const done = _pop.lvl;
_pop.lvl++;
_pop.target = POP_LVL_T(_pop.lvl);
_pop.colorN = POP_LVL_C(_pop.lvl);
_pop.lvlScore = 0;
_pop._pos.clear();
if (_pop._els) { _pop._els.forEach(el => el.remove()); _pop._els.clear(); }
_popBuildBoard();
_popRender();
_popScoreView(false);
gPopRefreshStat();
showToast('第 ' + done + ' 关通过 · 进入第 ' + _pop.lvl + ' 关');
if (_gPopMode() === 'coop') {
if (byTa) { _pop.turn = 'me'; _gPopCoopRender(); }
else _popTaSchedule();
}
return;
}
_gPopFinish();
}
function _gPopFinish() {
if (_pop.over) return;
_pop.over = true;
if (_pop.taTimer) { clearTimeout(_pop.taTimer); _pop.taTimer = 0; }
_pop.turn = 'me';
const cleared = _pop.cells.every(c => !c);
const mode = _gPopMode();
_popRecordLvl(_pop.lvl);
if (mode === 'coop') {
const co = _gPopCoopScore(data.games.with);
if (cleared && !co.clear) { co.clear = true; save(); }
_gPopCoopEnd(_pop.score, cleared);
} else {
_gGameEnd('pop', _pop.score, { noTa: mode === 'solo', quiet: cleared, cleared });
}
const ov = $('#popOver');
if (ov) {
if (mode === 'coop') ov.textContent = `第 ${_pop.lvl} 关没过去 · 我们一起消到 ${_pop.score} 分${cleared ? ' · 整盘清空！' : ''}`;
else ov.textContent = `倒在第 ${_pop.lvl} 关 · 本关 ${_pop.lvlScore}/${_pop.target}${_gLast.pop && _gLast.pop.beaten ? ' · 挑战告捷' : ''}`;
}
}
var G_LINK_TINTS = [
['#f2a09a', '#d96a5f'], ['#f6c489', '#e09a4a'], ['#f2d97e', '#d9b44a'], ['#a9d9a2', '#78b871'],
['#8fd0c8', '#57a89e'], ['#9ed4e8', '#6aa8c8'], ['#a3c6ee', '#7296d6'], ['#c9b4f2', '#a184de'],
['#f2b4cd', '#de86ac'], ['#e8b8a0', '#cf8a66'], ['#c8d49a', '#9cb068'], ['#b8c4cc', '#8a98a4']
];
var G_LINK_ICONS = [
'<path d="M12 20S4.8 15.2 2.9 10.8A5.1 5.1 0 0 1 12 6.2a5.1 5.1 0 0 1 9.1 4.6C19.2 15.2 12 20 12 20Z"/>',
'<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8Z"/>',
'<path d="M20.2 13.6A8.2 8.2 0 1 1 10.4 3.8a6.6 6.6 0 0 0 9.8 9.8Z"/>',
'<path d="M7 18.5h10.2a3.8 3.8 0 0 0 .5-7.57A6 6 0 0 0 6.2 12a3.6 3.6 0 0 0 .8 6.5Z"/>',
'<path d="M5.5 19C5.5 10 12.5 5 20 5c0 8.5-5.5 14-13 14Z"/><path d="M5.5 19c2.5-5 6.5-8.5 10.5-10"/>',
'<path d="M5 5.5h11v6.5a5.5 5.5 0 0 1-11 0Z"/><path d="M16 7h2.2a2.4 2.4 0 0 1 0 4.8H16"/><path d="M4.5 20h12"/>',
'<circle cx="8.5" cy="8.5" r="4.5"/><path d="M11.7 11.7 20 20M17 17l2-2M14.5 14.5l2-2"/>',
'<path d="M6 16.5v-5a6 6 0 0 1 12 0v5l1.8 2.5H4.2Z"/><path d="M10 21.5a2.2 2.2 0 0 0 4 0"/>',
'<path d="M12 3.5a9 9 0 0 1 9 8.5H3a9 9 0 0 1 9-8.5Z"/><path d="M12 12v6.5a2.2 2.2 0 0 0 4.4 0"/>',
'<path d="M3.5 12c2.8-3.8 6.8-5.8 10.5-5.8l6.5 5.8-6.5 5.8C10.3 17.8 6.3 15.8 3.5 12Z"/><circle cx="15.5" cy="12" r="1"/>',
'<path d="M9 3.5 4.5 5v15.5L9 19l6 1.5 4.5-1.5V3.5L15 5 9 3.5Z"/><path d="M9 3.5V19M15 5v15.5"/>',
'<path d="M8 5h8a2 2 0 0 1 2 2v12l-6-3-6 3V7a2 2 0 0 1 2-2Z"/>',
'<path d="M9 18V6.5l9-2V16"/><circle cx="6.8" cy="18" r="2.3"/><circle cx="15.8" cy="16" r="2.3"/>',
'<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M4 12h16M12 8v12"/><path d="M8.5 8c-2 0-3-1.2-3-2.5S7 3 8.5 3c2 0 3.5 2.5 3.5 5 0-2.5 1.5-5 3.5-5 1.5 0 3 .9 3 2.5S18 8 15.5 8"/>',
'<path d="M12 3v18M3.8 7.5l16.4 9M20.2 7.5l-16.4 9"/>',
'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19"/>'
];
var LINK_ROWS = 8, LINK_COLS = 10, LINK_PAD = 8, LINK_GAP = 4;
var LINK_PAIR_PT = 10, LINK_COMBO_PT = 5, LINK_CLEAR_PT = 100;
var _link = { tiles: null, sel: null, score: 0, over: false, _id: 0, left: 0, streakAt: 0, faces: [], reshuffles: 0, mode: 'solo', turn: 'me', taTimer: 0, lastTa: false, _els: new Map() };
function _gLinkMode() {
const m = data.games && data.games.linkMode;
return ['solo', 'coop', 'vs'].includes(m) ? m : 'solo';
}
function _gLinkCoopScore(cid) {
const sc = _gScore(cid, 'link');
if (!sc.coop || typeof sc.coop !== 'object' || Array.isArray(sc.coop)) sc.coop = { best: 0, plays: 0, clear: false };
const co = sc.coop;
if (typeof co.best !== 'number' || !isFinite(co.best) || co.best < 0) co.best = 0;
if (typeof co.plays !== 'number' || !isFinite(co.plays) || co.plays < 0) co.plays = 0;
if (co.clear !== true) co.clear = false;
return co;
}
function _gLinkSkins() {
if (!data.games.linkSkins || typeof data.games.linkSkins !== 'object' || Array.isArray(data.games.linkSkins)) data.games.linkSkins = {};
return data.games.linkSkins;
}
function _gLinkSkinSchemes() {
if (!data.games || !Array.isArray(data.games.linkSkinSchemes)) data.games.linkSkinSchemes = [];
return data.games.linkSkinSchemes;
}
function _gLinkSkinSchemeOn() {
return _gLinkSkinSchemes().find(s => s.id === data.games.linkSkinScheme) || null;
}
function _linkStickerImgs() {
const imgs = [];
(data.stickerRecent || []).forEach(u => { if (typeof u === 'string' && u) imgs.push(u); });
(data.stickerGroups || []).forEach(g => { if (g && Array.isArray(g.imgs)) g.imgs.forEach(u => { if (typeof u === 'string' && u) imgs.push(u); }); });
(data.stickers || []).forEach(u => { if (typeof u === 'string' && u) imgs.push(u); });
const seen = new Set(), out = [];
for (const u of imgs) { if (!seen.has(u)) { seen.add(u); out.push(u); } }
return out;
}
function _linkKinds() {
const skins = _gLinkSkins();
const imgs = _linkStickerImgs();
const kinds = [];
for (let i = 0; i < 12; i++) {
if (skins[i]) kinds.push({ img: skins[i] });
else if (imgs[i]) kinds.push({ img: imgs[i] });
else kinds.push({ icon: i });
}
return kinds;
}
function gLinkBoot(force) {
if (!data.games.linkSkins || typeof data.games.linkSkins !== 'object' || Array.isArray(data.games.linkSkins)) data.games.linkSkins = {};
if (!Array.isArray(data.games.linkSkinSchemes)) data.games.linkSkinSchemes = [];
if (typeof data.games.linkSkinScheme !== 'string') data.games.linkSkinScheme = '';
if (_link.tiles && !force) { _gLinkApplyMode(); _linkRender(); return; }
gLinkRestart();
}
function _gLinkSkinsRender() {
const box = $('#linkSkins');
if (!box) return;
const skins = _gLinkSkins();
const on = data.games.linkSkinScheme || '';
box.innerHTML = `<div class="merge-skin-row">`
+ `<button type="button" class="merge-scheme${on === '' ? ' on' : ''}" data-lsch="">设计图腾</button>`
+ _gLinkSkinSchemes().map(s => `<button type="button" class="merge-scheme${s.id === on ? ' on' : ''}" data-lsch="${s.id}">${escapeHTML(s.name)}<u data-lschdel="${s.id}" title="删这套">×</u></button>`).join('')
+ `<button type="button" class="merge-scheme add" id="linkSchemeSave">＋存为方案</button>`
+ `<button type="button" class="merge-scheme add" id="linkSkinBatchBtn">一次传一套</button>`
+ `</div>`
+ `<div class="g2048-skins-t">点哪格换哪格，当场就玩（图只存本机）· 没传图的格子会自动拿表情包库的图补位<br>「一次传一套」按你选的先后从第 1 格铺到第 12 格，已有的格子直接换掉（一次最多 12 张，超大图跳过）</div>`
+ `<div class="link-skin-grid">` + [...Array(12).keys()].map(i => {
const im = skins[i];
return `<button type="button" class="link-skin${im ? ' has' : ''}" data-lskin="${i}" aria-label="更换第${i + 1}格的图">`
+ (im ? `<img src="${im}" alt="" draggable="false">` : _linkFaceHTML(i))
+ (im ? `<u data-lskinx="${i}" aria-label="移除第${i + 1}格的图">×</u>` : '')
+ `</button>`;
}).join('') + `</div>`
+ `<button type="button" class="game-btn link-skin-reset" id="linkSkinReset">这套全部恢复默认图腾</button>`;
}
function _gLinkSkinsAfter() {
const bx = $('#linkSkins');
if (bx && !bx.hidden) _gLinkSkinsRender();
_link.faces = _linkKinds();
if (_link.tiles) {
_link._els.forEach(el => el.remove());
_link._els.clear();
_linkRender();
}
}
function _gLinkSkinSlotPut(i, durl) {
_gLinkSkins()[i] = durl;
const sc = _gLinkSkinSchemeOn();
if (sc) sc.skins[i] = durl;
save();
_gLinkSkinsAfter();
}
function _gLinkSkinClear(i) {
if (!_gLinkSkins()[i]) return;
delete data.games.linkSkins[i];
const sc = _gLinkSkinSchemeOn();
if (sc) delete sc.skins[i];
save();
_gLinkSkinsAfter();
showToast('第 ' + (i + 1) + ' 格恢复默认');
}
function _gLinkSchemeUse(id) {
const sc = id ? _gLinkSkinSchemes().find(s => s.id === id) : null;
if (id && !sc) return;
const fresh = {};
if (sc) Object.keys(sc.skins).forEach(k => { if (sc.skins[k]) fresh[k] = sc.skins[k]; });
data.games.linkSkins = fresh;
data.games.linkSkinScheme = sc ? sc.id : '';
save();
_gLinkSkinsAfter();
showToast(sc ? '已切到「' + sc.name + '」' : '已切回设计图腾');
}
function _gLinkSchemeSave() {
const list = _gLinkSkinSchemes();
if (list.length >= 6) { showToast('方案最多存 6 套，删一套再存'); return; }
const cur = _gLinkSkins();
const skins = {};
Object.keys(cur).forEach(k => { if (cur[k]) skins[k] = cur[k]; });
if (!Object.keys(skins).length) { showToast('先传几张图再存'); return; }
let n = 1;
while (list.some(s => s.name === '方案 ' + n)) n++;
list.push({ id: 'ls' + Date.now().toString(36) + Math.floor(Math.random() * 99), name: '方案 ' + n, skins });
data.games.linkSkinScheme = list[list.length - 1].id;
save();
const bx = $('#linkSkins');
if (bx && !bx.hidden) _gLinkSkinsRender();
showToast('已存「方案 ' + n + '」，随时切');
}
function _gLinkSchemeDel(id) {
const list = _gLinkSkinSchemes();
const i = list.findIndex(s => s.id === id);
if (i < 0) return;
const gone = list.splice(i, 1)[0];
if (data.games.linkSkinScheme === id) data.games.linkSkinScheme = '';
save();
const bx = $('#linkSkins');
if (bx && !bx.hidden) _gLinkSkinsRender();
showToast('已删「' + gone.name + '」');
}
var _linkSkinPick = -1;
function gLinkRestart() {
_link.faces = _linkKinds();
const pairs = LINK_ROWS * LINK_COLS / 2;
const deck = [];
for (let i = 0; i < pairs; i++) { const k = Math.floor(Math.random() * _link.faces.length); deck.push(k, k); }
for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
_link.tiles = deck.map(k => ({ id: ++_link._id, k }));
_link.score = 0;
_link.over = false;
_link.sel = null;
_link.left = LINK_ROWS * LINK_COLS;
_link.streakAt = 0;
_link.reshuffles = 0;
_link.turn = 'me';
_link.lastTa = false;
if (_link.taTimer) { clearTimeout(_link.taTimer); _link.taTimer = 0; }
delete _gLast.link;
delete _gLive.link;
const ov = $('#linkOver');
if (ov) ov.textContent = '';
_linkRender();
_linkScoreView(false);
gLinkRefreshStat();
_gLinkApplyMode();
}
function _linkGeom() {
const box = $('#linkGrid');
if (!box) return null;
const W = box.clientWidth || 320, H = box.clientHeight || W;
const pg = _gEffPG(LINK_PAD, LINK_GAP), PAD = pg[0], GAP = pg[1];
const cw = (W - PAD * 2 - GAP * (LINK_COLS - 1)) / LINK_COLS;
const ch = (H - PAD * 2 - GAP * (LINK_ROWS - 1)) / LINK_ROWS;
return { box, pad: PAD, gap: GAP, cw, ch, sx: cw + GAP, sy: ch + GAP };
}
function _linkFaceHTML(k) {
const f = _link.faces[k];
if (!f) return '';
if (f.img) return `<img src="${f.img}" alt="" draggable="false">`;
const t = G_LINK_TINTS[f.icon % G_LINK_TINTS.length];
return `<i class="link-ic" style="background:linear-gradient(155deg,${t[0]},${t[1]})"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${G_LINK_ICONS[f.icon]}</svg></i>`;
}
function _linkRender() {
const g = _linkGeom();
if (!g) return;
_gSetCellVars(g.box, g.pad, g.gap, g.cw, g.ch);
let bg = g.box.querySelector('.link-bg');
if (!bg) {
bg = document.createElement('div');
bg.className = 'link-bg';
bg.innerHTML = '<i></i>'.repeat(LINK_ROWS * LINK_COLS);
g.box.appendChild(bg);
}
const alive = new Set();
for (let i = 0; i < LINK_ROWS * LINK_COLS; i++) {
const t = _link.tiles[i];
if (!t) continue;
alive.add(t.id);
let el = _link._els.get(t.id);
if (!el) {
el = document.createElement('button');
el.type = 'button';
el.className = 'link-tile';
el.innerHTML = _linkFaceHTML(t.k);
_link._els.set(t.id, el);
g.box.appendChild(el);
el.classList.add('in');
el.style.animationDelay = ((Math.floor(i / LINK_COLS) + i % LINK_COLS) * 14) + 'ms';
setTimeout(() => { el.classList.remove('in'); el.style.animationDelay = ''; }, 1000);
}
el.dataset.lidx = i;
el.classList.toggle('sel', _link.sel === i);
el.style.transform = `translate(${Math.round((i % LINK_COLS) * g.sx)}px,${Math.round(Math.floor(i / LINK_COLS) * g.sy)}px)` + (_link.sel === i ? ' scale(1.08)' : '');
}
_link._els.forEach((el, id) => { if (!alive.has(id)) { el.remove(); _link._els.delete(id); } });
}
function _linkPath(a, b) {
const R = LINK_ROWS + 2, C = LINK_COLS + 2;
const occ = new Uint8Array(R * C);
for (let r = 0; r < LINK_ROWS; r++) for (let c = 0; c < LINK_COLS; c++) if (_link.tiles[r * LINK_COLS + c]) occ[(r + 1) * C + (c + 1)] = 1;
const ar = Math.floor(a / LINK_COLS) + 1, ac = a % LINK_COLS + 1;
const br = Math.floor(b / LINK_COLS) + 1, bc = b % LINK_COLS + 1;
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const best = new Int8Array(R * C).fill(9);
let queue = [[ar, ac, -1, 0, [[ar, ac]]]];
best[ar * C + ac] = 0;
while (queue.length) {
const cur = queue.shift();
const r = cur[0], c = cur[1], dir = cur[2], turns = cur[3], path = cur[4];
for (let d = 0; d < 4; d++) {
const nr = r + DIRS[d][0], nc = c + DIRS[d][1];
if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
if (occ[nr * C + nc] && !(nr === br && nc === bc)) continue;
const nt = dir === -1 ? turns : (d === dir ? turns : turns + 1);
if (nt > 2) continue;
const npath = (dir === -1 || d === dir) ? path : path.concat([[r, c]]);
if (nr === br && nc === bc) return { turns: nt, pts: npath.concat([[nr, nc]]) };
if (nt >= best[nr * C + nc]) continue;
best[nr * C + nc] = nt;
queue.push([nr, nc, d, nt, npath]);
}
}
return null;
}
function _linkMatches() {
const out = [];
const t = _link.tiles;
for (let i = 0; i < t.length; i++) {
if (!t[i]) continue;
for (let j = i + 1; j < t.length; j++) {
if (t[j] && t[j].k === t[i].k && _linkPath(i, j)) out.push([i, j]);
}
}
return out;
}
function _linkDrawLine(pts, color) {
const g = _linkGeom();
if (!g || !pts || pts.length < 2) return;
let svg = g.box.querySelector('.link-lines');
if (!svg) {
svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('class', 'link-lines');
g.box.appendChild(svg);
}
const W = g.box.clientWidth, H = g.box.clientHeight;
svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
const cx = p => Math.max(2, Math.min(W - 2, (p[1] - 1) * g.sx + g.cw / 2));
const cy = p => Math.max(2, Math.min(H - 2, (p[0] - 1) * g.sy + g.ch / 2));
const d = pts.map((p, i) => (i ? 'L' : 'M') + cx(p).toFixed(1) + ' ' + cy(p).toFixed(1)).join(' ');
const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
el.setAttribute('d', d);
el.setAttribute('class', 'link-line');
if (color) el.style.stroke = color;
el.setAttribute('pathLength', '100');
svg.appendChild(el);
setTimeout(() => el.remove(), 620);
}
function linkTap(i) {
if (_link.over || !_link.tiles || !_link.tiles[i]) return;
if (_gLinkMode() === 'coop' && _link.turn === 'ta') return;
if (_link.sel === i) { _link.sel = null; _linkRender(); return; }
if (_link.sel == null) { _link.sel = i; _linkRender(); return; }
const a = _link.sel;
if (_link.tiles[a].k === _link.tiles[i].k) {
const path = _linkPath(a, i);
if (path) { _linkDoMatch(a, i, path); return; }
}
_link.sel = i; _linkRender();
const el = _link._els.get(_link.tiles[i] && _link.tiles[i].id);
if (el) { el.classList.add('no'); setTimeout(() => el.classList.remove('no'), 320); }
}
function _linkDoMatch(a, b, path, opts) {
opts = opts || {};
const ta = _link.tiles[a], tb = _link.tiles[b];
const ea = ta && _link._els.get(ta.id);
const eb = tb && _link._els.get(tb.id);
_link.tiles[a] = null;
_link.tiles[b] = null;
_link.left -= 2;
_link.sel = null;
let gain = LINK_PAIR_PT;
const now = Date.now();
const chained = now - _link.streakAt < 4000;
if (chained) gain += LINK_COMBO_PT;
_link.streakAt = now;
_link.score += gain;
playSfx('blend', { step: _gSfxStep(chained ? 4 : 0), weak: !!opts.ta });
const kc = ta && G_LINK_TINTS[ta.k % G_LINK_TINTS.length];
_linkDrawLine(path.pts, kc ? kc[1] : null);
[ea, eb].forEach((el, k) => {
if (!el) return;
el.classList.remove('sel');
el.classList.add('bye');
el.style.animationDelay = (90 + k * 40) + 'ms';
setTimeout(() => el.remove(), 520);
});
if (ta) _link._els.delete(ta.id);
if (tb) _link._els.delete(tb.id);
if (_gLinkMode() === 'vs' && !opts.ta) _gTaLiveStart('link');
setTimeout(() => {
if (!data.games) return;
const g = _linkGeom();
if (g) {
const mx = ((a % LINK_COLS) + (b % LINK_COLS)) / 2 * g.sx + g.cw / 2;
const my = (Math.floor(a / LINK_COLS) + Math.floor(b / LINK_COLS)) / 2 * g.sy + g.ch / 2;
_linkFloat((chained ? '连对 +' : '+') + gain, mx, my);
}
_linkRender();
_linkScoreView(true);
if (!_link.left) { setTimeout(_gLinkFinish, 480); return; }
if (!_linkMatches().length) _linkReshuffle();
if (_gLinkMode() === 'coop') {
if (!opts.ta) _linkTaSchedule();
else _gLinkCoopRender();
}
}, 300);
}
function _linkReshuffle() {
const alive = [];
_link.tiles.forEach(t => { if (t) alive.push(t); });
for (let tries = 0; tries < 80; tries++) {
for (let i = alive.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = alive[i]; alive[i] = alive[j]; alive[j] = t; }
let k = 0;
_link.tiles = _link.tiles.map(t => t ? alive[k++] : null);
if (_linkMatches().length) break;
}
_link.reshuffles++;
showToast('没有能连的了，自动洗了一轮牌');
}
function _linkTaSchedule() {
if (_link.taTimer) clearTimeout(_link.taTimer);
_link.turn = 'ta';
_gLinkCoopRender();
_link.taTimer = setTimeout(_linkTaMove, 760 + Math.random() * 1000);
}
function _gLinkTaPick() {
const ms = _linkMatches();
if (!ms.length) return null;
if (Math.random() < 0.12) return ms[Math.floor(Math.random() * ms.length)];
const scored = ms.map(pr => { const p = _linkPath(pr[0], pr[1]); return { pr, v: (p ? p.turns : 2) * 10 + Math.random() * 6 }; });
scored.sort((a, b) => a.v - b.v);
return scored[0].pr;
}
function _linkTaMove() {
_link.taTimer = 0;
_link.turn = 'me';
if (_gLinkMode() !== 'coop' || _link.over || data.games.tab !== 'link' || document.body.dataset.view !== 'games') return;
const pr = _gLinkTaPick();
if (!pr) { _gLinkFinish(); return; }
_link.lastTa = true;
_linkDoMatch(pr[0], pr[1], _linkPath(pr[0], pr[1]), { ta: true });
}
function _linkScoreView(bump) {
const wrap = $('#linkScoreWrap');
const coop = _gLinkMode() === 'coop';
if (wrap) {
wrap.innerHTML = (coop ? '我们 <b id="linkScore">' : '本局 <b id="linkScore">')
+ _link.score + '</b> · ' + (coop ? '一人一对' : '剩 ' + _link.left + ' 块');
}
const el = $('#linkScore');
if (el && bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
}
function _linkFloat(txt, x, y) {
const box = $('#linkGrid');
if (!box) return;
const f = document.createElement('span');
f.className = 'link-float';
f.textContent = txt;
if (x != null) { f.style.left = x.toFixed(1) + 'px'; f.style.top = y.toFixed(1) + 'px'; }
box.appendChild(f);
setTimeout(() => f.remove(), 800);
}
function gLinkRefreshStat() {
const el = $('#linkStat');
if (!el) return;
const cid = data.games.with;
if (_gLinkMode() === 'coop') {
const co = _gLinkCoopScore(cid);
el.textContent = `合作最高 ${co.best} 分 · ${co.plays} 局${co.clear ? ' · 一起连完过' : ''}`;
_gLinkCoopRender();
return;
}
const sc = _gBook('link');
el.textContent = `最高 ${sc.best} · ${sc.plays} 局${_gLinkMode() === 'vs' && sc.ta > 0 ? ` · 挑战 ${sc.ta}` : ''}`;
}
function _gLinkApplyMode() {
const mode = _gLinkMode();
_link.mode = mode;
_link.turn = 'me';
_gModeChrome('link');
const cl = $('#coopLineLink'); if (cl) cl.hidden = mode !== 'coop';
$$('#linkModes .merge-scheme').forEach(b => b.classList.toggle('on', b.dataset.lmode === mode));
_linkScoreView(false);
if (mode === 'coop') _gLinkCoopRender(); else _gamesRenderTaLine('link');
gLinkRefreshStat();
}
function _gLinkSetMode(m) {
if (!['solo', 'coop', 'vs'].includes(m) || _gLinkMode() === m) return;
data.games.linkMode = m;
save();
gLinkRestart();
showToast(m === 'coop' ? '和 ' + _gName(data.games.with) + ' 一起玩：你连一对，TA 连一对' : (m === 'solo' ? '自己玩，练手无压力' : '比分对战，可别输给 TA'));
}
function _gLinkCoopRender() {
const box = $('#coopLineLink');
if (!box) return;
const c = _gContact(data.games.with) || {};
const nm = _gName(data.games.with);
let say;
if (_link.over) say = '这盘连完了 · 重新开始或换个玩法';
else if (_link.turn === 'ta') say = nm + ' 正在找那一对…';
else if (_link.lastTa) say = 'TA 刚连走一对 · 该你了';
else say = '你连一对，TA 连一对';
box.innerHTML = `<span class="avatar">${avatarHTML(c.avatar)}</span>`
+ `<div class="ta-tt"><b>和 ${escapeHTML(nm)} 一起</b><span>${escapeHTML(say)}</span></div>`
+ `<div class="ta-score${_link.over ? '' : ' live'}"><b>${_link.score}</b><span>我们</span></div>`;
}
function _gLinkCoopEnd(score, cleared) {
const co = _gLinkCoopScore(data.games.with);
co.plays++;
if (score > co.best) co.best = score;
if (cleared) co.clear = true;
_gLast.link = { score, coop: true };
save();
if (!cleared) playSfx('over');
gLinkRefreshStat();
_gEndReport('link', score, { coop: true, cleared });
}
function _gLinkCoopShare() {
const co = _gLinkCoopScore(data.games.with);
const score = _link.score || co.best;
if (!score) { showToast('先一起连一盘再告诉 TA'); return; }
const cid = data.games.with;
_deliverToChat({
id: nextId(), from: 'me', text: '这盘是我们俩连的，' + score + ' 分',
game: { kind: 'score', game: 'link', score, best: co.best, ta: 0, beaten: false, newBest: score >= co.best && score > 0 }
}, cid);
setTimeout(() => {
if (!data.games || !data.contacts) return;
const coShareSay = presetSayPick('合作共享成绩');
if (coShareSay) _deliverToChat({ id: nextId(), from: 'partner', text: coShareSay }, cid);
}, 1400 + Math.random() * 2600);
showToast('已发给 ' + _gName(cid));
}
function _gLinkFinish() {
if (_link.over) return;
_link.over = true;
if (_link.taTimer) { clearTimeout(_link.taTimer); _link.taTimer = 0; }
_link.turn = 'me';
_link.sel = null;
const cleared = !_link.left;
if (cleared) {
_link.score += LINK_CLEAR_PT;
_linkFloat('全清 +' + LINK_CLEAR_PT);
playSfx('clear');
}
const mode = _gLinkMode();
if (mode === 'coop') {
const co = _gLinkCoopScore(data.games.with);
if (cleared && !co.clear) { co.clear = true; save(); }
_gLinkCoopEnd(_link.score, cleared);
} else {
_gGameEnd('link', _link.score, { noTa: mode === 'solo', quiet: cleared, cleared });
}
const ov = $('#linkOver');
if (ov) {
if (mode === 'coop') ov.textContent = `这盘我们一起连了 ${_link.score} 分${cleared ? ' · 整盘连完！' : ''}`;
else ov.textContent = `局终 · ${_link.score} 分${cleared ? ' · 全清 +100' : ''}${_link.reshuffles ? ' · 洗了 ' + _link.reshuffles + ' 轮牌' : ''}${_gLast.link && _gLast.link.beaten ? ' · 挑战告捷' : ''}`;
}
}
function _gRoundCard(game, score, o) {
if (o.coop) {
const co = _gCoopBook(game);
return { kind: 'score', game, score, best: co.best, ta: 0, beaten: false, newBest: score >= co.best && score > 0, lvl: game === 'pop' ? (co.lvl || 0) : undefined };
}
const sc = _gBook(game);
const last = _gLast[game] || {};
return {
kind: 'score', game, score, best: sc.best, ta: sc.ta,
beaten: sc.ta > 0 && score >= sc.ta, newBest: !!o.newBest,
taScore: last.taScore == null ? null : last.taScore,
win: last.win == null ? undefined : !!last.win,
lvl: game === 'pop' ? (sc.lvl || 0) : undefined
};
}
function _gEndReport(game, score, o) {
o = o || {};
if (_gSkillMode(game) === 'solo') return;
const cid = data.games.with;
if (!cid) return;
let text = '';
if (o.coop) {
const ach = o.ach;
if (ach) {
text = presetSayPick('合作成就', ach);
if (text && !/分/.test(text)) text += '我们' + score + ' 分。';
} else if (o.cleared && (game === 'pop' || game === 'link')) {
text = presetSayPick('合作全清', G_NAMES[game]);
} else {
text = presetSayPick('合作局终报分').replace('{n}', score);
}
} else {
text = presetSayPick('局终报分', G_NAMES[game] || G_NAMES.merge)
.replace('{n}', score).replace('{m}', o.moves == null ? 0 : o.moves).replace('{l}', o.lines == null ? 0 : o.lines);
if (o.cleared && (game === 'pop' || game === 'link')) text = presetSayPick('合作全清', G_NAMES[game]);
}
const card = _gRoundCard(game, score, o);
_deliverToChat({ id: nextId(), from: 'me', game: card, text: o.coop ? '这局是我们俩的' : '' }, cid);
setTimeout(() => {
if (!data.games || !data.contacts) return;
if (text) _deliverToChat({ id: nextId(), from: 'partner', text }, cid);
if (!o.coop && o.newBest) {
setTimeout(() => {
if (!data.games || !data.contacts) return;
const bestSay = presetSayPick('破纪录');
if (bestSay) _deliverToChat({ id: nextId(), from: 'partner', text: bestSay }, cid);
}, 1400 + Math.random() * 1400);
}
}, 700 + Math.random() * 900);
}
function _gGameEnd(game, score, opts) {
const sc = _gBook(game);
sc.plays++;
const beaten = !(opts && opts.noTa) && sc.ta > 0 && score >= sc.ta;
const taScore = _gTaLiveFinal(game);
const newBest = score > sc.best && score > 0;
_gLast[game] = { score, beaten: beaten || (sc.best > 0 && score > sc.best), taScore, win: taScore != null ? score > taScore : undefined };
if (score > sc.best) sc.best = score;
save();
if (!(opts && opts.quiet)) playSfx(beaten || (taScore != null && score > taScore) ? 'win' : 'over');
_gEndReport(game, score, {
newBest, moves: opts && opts.moves, lines: opts && opts.lines, cleared: opts && opts.cleared
});
if (document.body.dataset.view === 'games' && data.games.tab === game) {
_gamesRenderTaLine(game);
if (game === 'merge') gMergeRefreshStat();
if (game === 'g2048') g2048RefreshStat();
if (game === 'pop') gPopRefreshStat();
if (game === 'link') gLinkRefreshStat();
}
}
(function () {
document.addEventListener('click', e => {
const tab = e.target.closest('#gamesTabs .games-tab');
if (tab) { _gamesSetTab(tab.dataset.game); return; }
const grm = e.target.closest('#gamesReady [data-grmode]');
if (grm) { _gSetModeOf(data.games.tab, grm.dataset.grmode); _gSetPhase('', ''); renderGames(); return; }
if (e.target.closest('#grGo')) { _gStart(data.games.tab); return; }
if (e.target.closest('[data-gfull]')) { _gSetFull(!_gFull); return; }
const mm = e.target.closest('[data-mmode]');
if (mm) { _gMergeSetMode(mm.dataset.mmode); return; }
const gm = e.target.closest('[data-gmode]');
if (gm) { _g2048SetMode(gm.dataset.gmode); return; }
const pm = e.target.closest('[data-pmode]');
if (pm) { _gPopSetMode(pm.dataset.pmode); return; }
const lm = e.target.closest('[data-lmode]');
if (lm) { _gLinkSetMode(lm.dataset.lmode); return; }
const lsch = e.target.closest('[data-lsch]');
if (lsch) { _gLinkSchemeUse(lsch.dataset.lsch); return; }
const lschd = e.target.closest('[data-lschdel]');
if (lschd) { _gLinkSchemeDel(lschd.dataset.lschdel); return; }
const lss = e.target.closest('#linkSchemeSave');
if (lss) { _gLinkSchemeSave(); return; }
const lsbb = e.target.closest('#linkSkinBatchBtn');
if (lsbb) { const f = $('#linkSkinBatch'); if (f) f.click(); return; }
const lsx = e.target.closest('[data-lskinx]');
if (lsx) { _gLinkSkinClear(+lsx.dataset.lskinx); return; }
const lsk = e.target.closest('[data-lskin]');
if (lsk) { _linkSkinPick = +lsk.dataset.lskin; const f = $('#linkSkinFile'); if (f) f.click(); return; }
const lsr = e.target.closest('#linkSkinReset');
if (lsr) {
data.games.linkSkins = {};
const sc = _gLinkSkinSchemeOn();
if (sc) sc.skins = {};
save(); _gLinkSkinsAfter(); showToast('这套已恢复默认图腾');
return;
}
const lskb = e.target.closest('#linkSkinBtn');
if (lskb) { const bx = $('#linkSkins'); if (bx) { bx.hidden = !bx.hidden; if (!bx.hidden) _gLinkSkinsRender(); } return; }
const who = e.target.closest('[data-gwho]');
if (who) { _gamesSetWho(who.dataset.gwho); return; }
const wo = e.target.closest('.ta-line .avatar, .cat-st');
if (wo) { const w = $('#gamesWho'); if (w) w.hidden = !w.hidden; return; }
const share = e.target.closest('[data-gshare]');
if (share) { _gShare(share.dataset.gshare); return; }
const mclr = e.target.closest('[data-mclear]');
if (mclr) { _gMergeSkinClear(+mclr.dataset.mclear); return; }
const msdel = e.target.closest('[data-msdel]');
if (msdel) { _gMergeSchemeDel(msdel.dataset.msdel); return; }
const msch = e.target.closest('[data-mscheme]');
if (msch) { _gMergeSchemeUse(msch.dataset.mscheme); return; }
const mss = e.target.closest('#mergeSchemeSave');
if (mss) { _gMergeSchemeSave(); return; }
const msb = e.target.closest('#mergeSkinBatchBtn');
if (msb) { const bf = $('#mergeSkinBatch'); if (bf) bf.click(); return; }
const msk = e.target.closest('[data-mskin]');
if (msk) { _mergeSkinTier = +msk.dataset.mskin; const f = $('#mergeSkinFile'); if (f) f.click(); return; }
const msr = e.target.closest('#mergeSkinReset');
if (msr) {
data.games.mergeSkins = {};
const sc = _gSkinSchemeOn();
if (sc) sc.skins = {};
Object.keys(_mergeImgs).forEach(k => delete _mergeImgs[k]);
save(); _gMergeSkinsRender(); _gMergeRail(); showToast('已恢复默认水果');
return;
}
const skb = e.target.closest('#mergeSkinBtn');
if (skb) { _mergeSkinOpen = !_mergeSkinOpen; const bx = $('#mergeSkins'); if (bx) { bx.hidden = !_mergeSkinOpen; if (_mergeSkinOpen) _gMergeSkinsRender(); } return; }
const gsc = e.target.closest('[data-gsdel]');
if (gsc) { _g2048SchemeDel(gsc.dataset.gsdel); return; }
const gsch = e.target.closest('[data-gscheme]');
if (gsch) { _g2048SchemeUse(gsch.dataset.gscheme); return; }
const gss = e.target.closest('#g2048SchemeSave');
if (gss) { _g2048SchemeSave(); return; }
const gsb = e.target.closest('#g2048SkinBatchBtn');
if (gsb) { const bf = $('#g2048SkinBatch'); if (bf) bf.click(); return; }
const skx = e.target.closest('[data-gskinx]');
if (skx) {
const k = skx.dataset.gskinx;
delete data.games.g2048Skins[k];
const sc = _g2048SkinSchemeOn();
if (sc) delete sc.skins[k];
save(); g2048RenderSkins(); g2048Render(); showToast('已移除，这个数字回到配色字面'); return;
}
const sk = e.target.closest('[data-gskin]');
if (sk) { _g2048SkinPick = +sk.dataset.gskin; const f = $('#g2048SkinFile'); if (f) f.click(); return; }
const skr = e.target.closest('#g2048SkinReset');
if (skr) {
data.games.g2048Skins = {};
const sc = _g2048SkinSchemeOn();
if (sc) sc.skins = {};
save(); g2048RenderSkins(); g2048Render(); showToast('这套已恢复配色字面'); return;
}
const gskb = e.target.closest('#g2048SkinBtn');
if (gskb) { const bx = $('#g2048Skins'); if (bx) { bx.hidden = !bx.hidden; if (!bx.hidden) g2048RenderSkins(); } return; }
const gbtn = e.target.closest('[data-gbtn]');
if (gbtn) {
const [kind, arg] = gbtn.dataset.gbtn.split(':');
if (kind === 'play') { showView('games'); _gSetPhase('', arg); _gamesSetTab(arg); return; }
if (kind === 'coop') {
showView('games');
const key = { g2048: 'g2048Mode', pop: 'popMode', link: 'linkMode', merge: 'mergeMode' }[arg];
if (key) { data.games[key] = 'coop'; save(); }
_gSetPhase('', arg);
_gamesSetTab(arg);
return;
}
return;
}
});
const mr = $('#mergeRestart');
if (mr) mr.addEventListener('click', () => { gMergeRestart(); });
const gr = $('#g2048Restart');
if (gr) gr.addEventListener('click', () => { g2048Restart(); });
const pr = $('#popRestart');
if (pr) pr.addEventListener('click', () => { gPopRestart(); });
const lr = $('#linkRestart');
if (lr) lr.addEventListener('click', () => { gLinkRestart(); });
const lsf = $('#linkSkinFile');
if (lsf) lsf.addEventListener('change', async () => {
const file = lsf.files && lsf.files[0];
lsf.value = '';
if (!file || _linkSkinPick < 0) return;
const durl = await fileData(file, 320, 0.85);
if (!durl) return;
_gLinkSkinSlotPut(_linkSkinPick, durl);
showToast('第 ' + (_linkSkinPick + 1) + ' 格换好了，下一局就是它');
_linkSkinPick = -1;
});
const lbt = $('#linkSkinBatch');
if (lbt) lbt.addEventListener('change', async () => {
const files = Array.from(lbt.files || []);
lbt.value = '';
if (!files.length) return;
const r = await _gSkinsBatch(files, [...Array(12).keys()], (i, durl) => _gLinkSkinSlotPut(i, durl));
showToast('换好 ' + r.ok + ' 张' + (r.tooBig ? ' · ' + r.tooBig + ' 张过大没收' : ''));
});
const pg = $('#popGrid');
if (pg) pg.addEventListener('click', e => {
const t = e.target.closest('[data-pidx]');
if (t) popTap(+t.dataset.pidx);
});
const lg = $('#linkGrid');
if (lg) lg.addEventListener('click', e => {
const t = e.target.closest('.link-tile');
if (t) linkTap(+t.dataset.lidx);
});
const cvM = $('#mergeCv');
if (cvM) {
const setX = e => {
const rect = cvM.getBoundingClientRect();
_merge.dropX = Math.max(14, Math.min(_merge.w - 14, e.clientX - rect.left));
};
cvM.addEventListener('pointerdown', e => {
if (_merge.over) return;
_merge.aim = true;
setX(e);
try { if (cvM.setPointerCapture) cvM.setPointerCapture(e.pointerId); } catch (eC) {}
e.preventDefault();
});
const _mergeCancel = () => { _merge.aim = false; };
cvM.addEventListener('pointercancel', _mergeCancel);
cvM.addEventListener('lostpointercapture', _mergeCancel);
cvM.addEventListener('pointermove', e => {
if (_merge.over) return;
if (_merge.aim || e.pointerType === 'mouse') setX(e);
});
cvM.addEventListener('pointerup', e => {
if (!_merge.aim) return;
_merge.aim = false;
if (_merge.over || Date.now() < _merge.cool) return;
setX(e);
const r = G_FRUITS[_merge.cur].r * (_merge.w / 340);
_merge.balls.push({ x: _merge.dropX, y: 30 + r, vx: 0, vy: 0.5, tier: _merge.cur, born: Date.now(), sq: 0, sqv: 0, sqA: 0, rot: 0, va: 0 });
if (_merge.mode === 'vs') _gTaLiveStart('merge');
else if (_merge.mode === 'coop') _merge.coop.taAt = Date.now() + 1000 + Math.random() * 1200;
_merge.cur = _merge.next;
_merge.next = Math.floor(Math.random() * 5);
_merge.cool = Date.now() + 420;
_gMergeRail();
gMergeLoopKick();
});
}
const sf = $('#mergeSkinFile');
if (sf) sf.addEventListener('change', async () => {
const file = sf.files && sf.files[0];
sf.value = '';
if (!file || _mergeSkinTier < 0) return;
const durl = await fileData(file, 320, 0.85);
if (!durl) return;
if (!data.games.mergeSkins) data.games.mergeSkins = {};
data.games.mergeSkins[_mergeSkinTier] = durl;
const sc = _gSkinSchemeOn();
if (sc) sc.skins[_mergeSkinTier] = durl;
delete _mergeImgs[_mergeSkinTier];
save();
_gMergeSkinsRender(); _gMergeRail();
showToast(G_FRUITS[_mergeSkinTier].n + ' 换好了，掉下来就是它');
});
const mbf = $('#mergeSkinBatch');
if (mbf) mbf.addEventListener('change', async () => {
const files = Array.prototype.slice.call(mbf.files || []);
mbf.value = '';
if (!files.length) return;
if (!data.games.mergeSkins) data.games.mergeSkins = {};
const sc = _gSkinSchemeOn();
const r = await _gSkinsBatch(files, G_FRUITS.map((f, i) => i), (t, durl) => {
data.games.mergeSkins[t] = durl;
if (sc) sc.skins[t] = durl;
delete _mergeImgs[t];
});
if (!r.ok) { if (r.tooBig) showToast(r.tooBig + ' 张过大，一张都没铺上'); return; }
save();
_gMergeSkinsRender(); _gMergeRail();
if (r.tooBig) showToast(r.tooBig + ' 张过大，没铺上');
});
const skf = $('#g2048SkinFile');
if (skf) skf.addEventListener('change', async () => {
const file = skf.files && skf.files[0];
skf.value = '';
if (!file || !_g2048SkinPick) return;
const durl = await fileData(file, 320, 0.85);
if (!durl) return;
if (!data.games.g2048Skins) data.games.g2048Skins = {};
data.games.g2048Skins[_g2048SkinPick] = durl;
const sc = _g2048SkinSchemeOn();
if (sc) sc.skins[_g2048SkinPick] = durl;
save();
g2048RenderSkins(); g2048Render();
showToast('合成到 ' + _g2048SkinPick + ' 就会变成这张图');
_g2048SkinPick = 0;
});
const g2bf = $('#g2048SkinBatch');
if (g2bf) g2bf.addEventListener('change', async () => {
const files = Array.prototype.slice.call(g2bf.files || []);
g2bf.value = '';
if (!files.length) return;
if (!data.games.g2048Skins) data.games.g2048Skins = {};
const sc = _g2048SkinSchemeOn();
const r = await _gSkinsBatch(files, G_MERGE_VAL, (v, durl) => {
data.games.g2048Skins[v] = durl;
if (sc) sc.skins[v] = durl;
});
if (!r.ok) { if (r.tooBig) showToast(r.tooBig + ' 张过大，一张都没铺上'); return; }
save();
g2048RenderSkins(); g2048Render();
if (r.tooBig) showToast(r.tooBig + ' 张过大，没铺上');
});
const gu = $('#g2048Undo');
if (gu) gu.addEventListener('click', () => g2048Undo());
const ggrid = $('#g2048Grid');
if (ggrid) {
let mx = 0, my = 0, mon = false;
ggrid.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; mx = e.clientX; my = e.clientY; mon = true; });
ggrid.addEventListener('pointerup', e => {
if (!mon || e.pointerType !== 'mouse') return; mon = false;
const dx = e.clientX - mx, dy = e.clientY - my;
if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
g2048Move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
});
}
const pane2048 = $('#game2048');
if (pane2048) {
let sx = 0, sy = 0, on = false;
pane2048.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; on = true; }, { passive: true });
pane2048.addEventListener('touchend', e => {
if (!on) return; on = false;
const t = e.changedTouches[0];
const dx = t.clientX - sx, dy = t.clientY - sy;
if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
g2048Move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
}, { passive: true });
}
document.addEventListener('keydown', e => {
if (document.body.dataset.view !== 'games' || !data.games) return;
if (e.key === 'Escape') { if (_gFull) _gSetFull(false); return; }
if (data.games.tab === 'g2048') {
const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
if (map[e.key]) { e.preventDefault(); g2048Move(map[e.key]); }
return;
}
});
let _gRefitRaf = 0;
function _gRefitActive() {
if (_gRefitRaf) return;
_gRefitRaf = requestAnimationFrame(() => {
_gRefitRaf = 0;
if (document.body.dataset.view !== 'games' || !data.games) return;
const tab = data.games.tab;
if (_gPhaseOf(tab) !== 'playing') { _gamesRenderReady(); return; }
_gFitBoards(tab);
if (tab === 'g2048') g2048Render();
if (tab === 'pop') _popRender();
if (tab === 'link') _linkRender();
if (tab === 'merge') gMergeDraw();
});
}
window.addEventListener('resize', _gRefitActive);
window.addEventListener('orientationchange', _gRefitActive);
if (window.visualViewport) window.visualViewport.addEventListener('resize', _gRefitActive);
})();

(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['games'] = true;
