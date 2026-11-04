// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var DEAL_COLS = 3;
var DEAL_ROWS = 5;
var DEAL_EXTRA = 1;
var DEAL_MAX = 8;
var DEAL_LP_MS = 500;
var DEAL_TA_WAIT = 900;
function _dlTitleOf(by) { return by === 'me' ? '你抽到的牌' : 'TA抽到的牌'; }
function _dlRecBy(d) {
const t = (d && d.title) || '';
return t === _dlTitleOf('me') ? 'me' : t === _dlTitleOf('ta') ? 'ta' : '';
}
var _dlStage = 'idle';
var _dlBusy = false;
var _dlShuffleQueued = false;
var _dlTaken = false;
var _dlHalfDone = false;
var _dlMode = 'me';
var _dlTaActive = false;
var _dlPool = [];
var _dlPileRows = DEAL_ROWS;
var _dlDrawn = [];
var _dlT1 = 0, _dlT2 = 0, _dlT3 = 0;
var _dlTPick = 0;
var _dlT4 = 0, _dlT5 = 0, _dlT6 = 0;
var _dlTaAutoT = 0;
var _dlTaAuto = true;
try { _dlTaAuto = localStorage.getItem('ordinal-deal-taauto') !== '0'; } catch (e) { }
var _dlShuffleSeq = 0;
var _dlPageId = null;
var _dlSession = [];
var _dlSessionOn = false;
var _dlSessionRound = 0;
var _dlSessionCid = '';
var _dlPendingReply = '';
var _dlQuietFlush = false;
function _dlQuietFlushOn() { return _dlQuietFlush; }
var _dlQuietEnter = false;
function _dl$(id) { return document.getElementById(id); }
function _dlWord(s) {
if (typeof taLabel !== 'function') return s;
return taLabel(s, _dlSessionCid || (typeof data !== 'undefined' && data && data.activeChat) || '');
}
function dealPool(cid) {
const id = cid || ((typeof mainChatId === 'function' && mainChatId()) || data.activeChat);
const out = [];
['主字卡', '颜文字', 'emoji'].forEach(cat => {
const list = (typeof _categoryCards === 'function') ? _categoryCards(cat, id) : [];
list.forEach(t => out.push({ cat: cat, text: t }));
});
const pics = (typeof partnerStickerPool === 'function') ? partnerStickerPool(id) : [];
pics.forEach(it => {
if (!it || !it.src) return;
out.push({ cat: (it.kind === 'image') ? '图片' : '表情包', img: it.src });
});
return out;
}
function _dlNext() {
if (!_dlPool.length) return null;
return _dlPool[Math.floor(Math.random() * _dlPool.length)];
}
function _dlPaintFace(card, got) {
const tx = card.querySelector('.dl-ptx');
if (!tx || !got) return;
if (got.img) {
tx.classList.add('dl-ptx-img');
tx.textContent = '';
tx.style.backgroundImage = 'url("' + String(got.img).replace(/"/g, '%22') + '")';
} else {
tx.textContent = got.text || '';
}
}
function _dlShuffle(a) {
for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
return a;
}
var DL_ROT = 22;
var DL_SC_MAX = 1.06;
function _dlFit(minRows) {
const half = _dlHalfOpen();
const cap = half ? 92 : 96;
const tb = _dl$('dealTable');
const r = tb ? tb.getBoundingClientRect() : null;
const W = (r && r.width > 80) ? r.width : (half ? 368 : 390);
const H = (r && r.height > 80) ? r.height : (half ? 300 : 292);
const rowK = rs => 1.871 + 1.425 * (rs - 1);
let rows = DEAL_ROWS;
while (rows > 3 && H / rowK(rows) < cap * 0.86) rows--;
if (minRows > rows) rows = minRows;
const cw = Math.max(46, Math.min(cap, W / (DEAL_COLS + 0.34), H / rowK(rows)));
const ch = cw * 1.5;
const k = Math.cos(DL_ROT * Math.PI / 180) * DL_SC_MAX, s = Math.sin(DL_ROT * Math.PI / 180) * DL_SC_MAX;
const hx = (cw * k + ch * s) / 2, hy = (cw * s + ch * k) / 2;
return {
cw: Math.round(cw), ch: Math.round(ch), W: W, H: H, cols: DEAL_COLS, rows: rows,
x0: hx + 2, x1: Math.max(hx + 2, W - hx - 2),
y0: hy + 2, y1: Math.max(hy + 2, H - hy - 2)
};
}
function _dlPlace(i, g) {
const cells = g.cols * g.rows;
const sx = (g.x1 - g.x0) / (g.cols - 1), sy = (g.y1 - g.y0) / (g.rows - 1);
let x, y;
if (i < cells) {
const col = i % g.cols, row = Math.floor(i / g.cols);
x = g.x0 + col * sx + (Math.random() - .5) * sx * .22;
y = g.y0 + row * sy + (Math.random() - .5) * sy * .18;
} else {
x = g.x0 + Math.random() * (g.x1 - g.x0);
y = g.y0 + Math.random() * (g.y1 - g.y0);
}
x = Math.min(g.x1, Math.max(g.x0, x));
y = Math.min(g.y1, Math.max(g.y0, y));
return { l: x / g.W * 100, t: y / g.H * 100 };
}
function _dlApplySize(table, g) {
if (!table) return;
table.style.setProperty('--dl-cw', g.cw + 'px');
table.style.setProperty('--dl-ch', g.ch + 'px');
}
function _dlRelayout() {
const table = _dl$('dealTable');
if (!table) return;
const live = Array.prototype.slice.call(table.querySelectorAll('.dl-pcard'));
if (!live.length) return;
const g = _dlFit(_dlHalfOpen() ? _dlPileRows : 0);
_dlApplySize(table, g);
const cards = live;
cards.forEach((c, i) => {
const p = c.classList.contains('is-gone') ? _dlPlace(i % (g.cols * g.rows), g) : _dlPlace(i, g);
c.style.left = p.l.toFixed(2) + '%';
c.style.top = p.t.toFixed(2) + '%';
if (!c.classList.contains('is-gone')) c.style.setProperty('--z', String(Math.round(120 + p.t)));
});
}
function _dealCardsOf(d) {
if (d && Array.isArray(d.cards) && d.cards.length) return d.cards;
if (d && Array.isArray(d.rounds) && d.rounds.length) {
const out = [];
d.rounds.forEach(r => { if (r && Array.isArray(r.cards)) r.cards.forEach(c => { if (c) out.push(c); }); });
if (out.length) return out;
}
return [{ cat: (d && d.cat) || '主字卡', text: (d && d.text) || '' }];
}
function _dealSaysAll(d) {
const one = arr => (Array.isArray(arr) ? arr : []).map(t => String(t || '').trim()).filter(Boolean);
if (d && Array.isArray(d.says)) return one(d.says);
if (!d || !Array.isArray(d.rounds)) return [];
return one(d.preSays).concat(d.rounds.reduce((acc, r) => acc.concat(one(r && r.says)), []));
}
function _dealRoundsOf(d) {
if (!d || !Array.isArray(d.rounds)) return null;
const rs = d.rounds.filter(r => r && Array.isArray(r.cards) && r.cards.length);
return rs.length > 1 ? rs : null;
}
function _dealFaceHTML(c) {
if (c && c.img) {
return '<p class="dl-line dl-line-img"><img class="dl-img" src="' + escapeHTML(c.img) +
'" alt="' + escapeHTML(c.cat || '图片') + '"></p>';
}
return '<p class="dl-line">' + escapeHTML((typeof screenSafeText === 'function') ? screenSafeText((c && c.text) || '') : ((c && c.text) || '')) + '</p>';
}
function _dealMiniHTML(c) {
if (c && c.img) {
return '<div class="dl-mini dl-mini-img"><img class="dl-img" src="' + escapeHTML(c.img) +
'" alt="' + escapeHTML(c.cat || '图片') + '"></div>';
}
return '<div class="dl-mini"><p class="dl-mtx">' +
escapeHTML((typeof screenSafeText === 'function') ? screenSafeText((c && c.text) || '') : ((c && c.text) || '')) +
'</p></div>';
}
function _dealCardHTML(m) {
const d = m.deal || {};
const cards = _dealCardsOf(d);
const n = cards.length;
const cats = [];
cards.forEach(c => { const k = (c && c.cat) || '主字卡'; if (cats.indexOf(k) < 0) cats.push(k); });
const rounds = _dealRoundsOf(d);
const hd = rounds
? '第 ' + rounds[0].round + '–' + rounds[rounds.length - 1].round + ' 轮 · ' + n + ' 张 · ' + cats.join('·')
: d.round
? '第 ' + d.round + ' 轮 · ' + n + ' 张 · ' + cats.join('·')
: (n > 1 ? n + ' 张 · ' + cats.join('·') : (cats[0] || '主字卡'));
const says = _dealSaysAll(d);
const saysHTML = says.length
? '<div class="dl-says">' + says.map(t =>
'<p class="dl-say"><i>你</i>' + escapeHTML((typeof screenSafeText === 'function') ? screenSafeText(t) : t) + '</p>').join('') + '</div>'
: '';
return '<div class="bubble dl-card' + (rounds ? ' is-multi' : '') + '" data-deal-id="' + escapeHTML(String(m.id)) + '">' +
'<div class="dl-hd"><b>' + escapeHTML(d.title || _dlTitleOf(d.by)) + '</b>' +
'<span>' + escapeHTML(hd) + '</span></div>' +
'<div class="dl-hand' + (rounds ? ' is-strip' : '') + '">' + cards.map(_dealMiniHTML).join('') + '</div>' +
saysHTML +
'<button type="button" class="dl-all" data-deal-all="' + escapeHTML(String(m.id)) + '">全部纸牌</button>' +
'</div>';
}
function dealBuildPile() {
const table = _dl$('dealTable');
if (!table) return [];
table.innerHTML = '';
table.classList.remove('has-pick');
const g = _dlFit();
_dlApplySize(table, g);
_dlPileRows = g.rows;
const cells = DEAL_COLS * g.rows, n = Math.min(_dlPool.length, cells + DEAL_EXTRA);
const cards = [];
for (let i = 0; i < n; i++) {
const c = document.createElement('button');
c.type = 'button';
c.className = 'dl-pcard';
c.setAttribute('aria-label', '抽这一张');
const p = _dlPlace(i, g);
const rot = (Math.random() * DL_ROT * 2 - DL_ROT).toFixed(1);
const sc = (0.88 + Math.random() * 0.18).toFixed(3);
c.style.left = p.l.toFixed(2) + '%';
c.style.top = p.t.toFixed(2) + '%';
c.style.setProperty('--rot', rot + 'deg');
c.style.setProperty('--sc', sc);
c.style.setProperty('--z', String(Math.round(120 + p.t)));
c.__dlCard = _dlPool[i] || null;
c.innerHTML = '<span class="dl-lift"><span class="dl-p3d">' +
'<span class="dl-pface dl-pb"><span class="dl-pem"></span></span>' +
'<span class="dl-pface dl-pf"><span class="dl-ptx"></span></span>' +
'</span></span>';
table.appendChild(c);
cards.push(c);
}
return cards;
}
function _dlSlot(c) {
const table = _dl$('dealTable');
if (!table || !c) return c;
const g = _dlFit(_dlPileRows);
_dlApplySize(table, g);
const p = _dlPlace(Math.floor(Math.random() * (DEAL_COLS * g.rows + DEAL_EXTRA)), g);
c.style.left = p.l.toFixed(2) + '%';
c.style.top = p.t.toFixed(2) + '%';
c.style.setProperty('--rot', (Math.random() * DL_ROT * 2 - DL_ROT).toFixed(1) + 'deg');
c.style.setProperty('--sc', (0.88 + Math.random() * 0.18).toFixed(3));
c.style.setProperty('--z', String(Math.round(120 + p.t)));
const tr = table.getBoundingClientRect();
c.style.setProperty('--in-dx', (tr.width / 2 - p.l / 100 * tr.width).toFixed(1) + 'px');
c.style.setProperty('--in-dy', (tr.height / 2 - p.t / 100 * tr.height).toFixed(1) + 'px');
return c;
}
function dealShuffleNow() {
if (_dlStage === 'settle' && !_dlTaken) { _dlShuffleQueued = true; return false; }
if (_dlStage !== 'pick' || _dlTaken) return false;
if (_dlBusy) { _dlShuffleQueued = true; return false; }
const table = _dl$('dealTable');
if (!table) return false;
const cards = Array.prototype.filter.call(table.querySelectorAll('.dl-pcard'), c => !c.classList.contains('is-gone'));
if (cards.length < 2) return false;
_dlTaAutoClear();
_dlBusy = true;
const seq = ++_dlShuffleSeq;
_dlShuffle(_dlPool);
cards.forEach((c, i) => { c.__dlCard = _dlPool[i] || null; });
table.classList.remove('is-riffle');
table.classList.add('is-gather');
cards.forEach((c, i) => {
c.style.transitionDelay = '0ms';
c.style.left = (50 + ((i % 5) - 2) * 0.7).toFixed(2) + '%';
c.style.top = (50 + ((i % 3) - 1) * 0.9).toFixed(2) + '%';
c.style.setProperty('--rot', (((i % 5) - 2) * 1.2).toFixed(1) + 'deg');
c.style.setProperty('--sc', '.95');
c.style.setProperty('--z', String(200 + i));
});
const note = _dl$('dealNote');
if (note) note.textContent = '洗牌中…';
window.clearTimeout(_dlT4); window.clearTimeout(_dlT5); window.clearTimeout(_dlT6);
_dlT4 = window.setTimeout(() => {
if (seq !== _dlShuffleSeq) return;
table.classList.add('is-riffle');
_dlT5 = window.setTimeout(() => {
if (seq !== _dlShuffleSeq) return;
table.classList.remove('is-riffle');
table.classList.remove('is-gather');
cards.forEach((c, i) => {
c.style.transitionDelay = (i * 16) + 'ms';
_dlSlot(c);
});
_dlT6 = window.setTimeout(() => {
if (seq !== _dlShuffleSeq) return;
cards.forEach(c => { c.style.transitionDelay = ''; });
_dlBusy = false;
if (note && _dlStage === 'pick') {
if (_dlMode !== 'ta') note.textContent = '洗好了 · 点一张翻 · 左右滑牌桌＝再洗';
else if (!_dlDrawn.length) {
note.textContent = _dlTaAuto ? _dlWord('洗好了 · 他马上自己抽 · 左右滑牌桌＝再洗')
: _dlWord('洗好了 · 按「让他抽」 · 左右滑牌桌＝再洗');
} else {
note.textContent = _dlTaActive ? _dlWord('洗好了 · 他接着抽这一轮 · 左右滑牌桌＝再洗')
: (_dlDrawn.length < DEAL_MAX ? _dlWord('洗好了 · 按「再让他抽」 · 左右滑牌桌＝再洗')
: _dlWord('洗好了 · 这一轮抽满了 · 按「发送至聊天」'));
}
}
if (_dlMode === 'ta' && _dlStage === 'pick' && !_dlDrawn.length) {
_dlTaAutoArm();
}
_dealSyncTake();
if (_dlShuffleQueued) { _dlShuffleQueued = false; window.setTimeout(dealShuffleNow, 0); }
}, 480 + cards.length * 16);
}, 300);
}, 340);
return true;
}
function dealReshuffle() {
if (_dlStage !== 'pick' || _dlTaken) return;
dealShuffleNow();
}
function _dealScatter(cards) {
const table = _dl$('dealTable');
if (!table || !cards.length) return 0;
const tr = table.getBoundingClientRect();
const cx = tr.width / 2, cy = tr.height / 2;
cards.forEach(c => {
const r = c.getBoundingClientRect();
c.style.setProperty('--in-dx', (cx - (r.left + r.width / 2 - tr.left)).toFixed(1) + 'px');
c.style.setProperty('--in-dy', (cy - (r.top + r.height / 2 - tr.top)).toFixed(1) + 'px');
c.classList.add('is-in');
});
cards.forEach((c, i) => { window.setTimeout(() => c.classList.remove('is-in'), 26 * i + 40); });
return 26 * cards.length + 40 + 480;
}
function _dlClearTimers() {
window.clearTimeout(_dlT1); window.clearTimeout(_dlT2); window.clearTimeout(_dlT3);
window.clearTimeout(_dlTPick);
window.clearTimeout(_dlT4); window.clearTimeout(_dlT5); window.clearTimeout(_dlT6);
_dlT1 = _dlT2 = _dlT3 = _dlT4 = _dlT5 = _dlT6 = 0;
_dlTPick = 0;
_dlTaAutoClear();
_dlShuffleSeq++;
_dlBusy = false;
_dlShuffleQueued = false;
_dlTaActive = false;
const table = _dl$('dealTable');
if (table) table.classList.remove('is-gather', 'is-riffle');
}
function _dealTakeLabel(n, hasText) {
if (_dlHalfOpen()) {
if (_dlMode === 'ta' && _dlStage === 'pick' && !n) {
if (_dlTaActive) return _dlWord('他正在抽…');
if (_dlTaAuto) return '马上抽';
return '再抽一轮';
}
return n ? '发送至聊天' : '再抽一轮';
}
if (_dlMode === 'ta' && _dlStage === 'pick' && !n && !hasText) {
if (_dlTaActive) return _dlWord('他正在抽…');
return _dlTaAuto ? '马上抽' : '再抽一轮';
}
if (n || hasText) return '收进这一场';
return '再抽一轮';
}
function _dlRoundHand() {
if (!_dlDrawn.length) return '';
const first = _dlDrawn[0].by || 'ta';
for (let i = 1; i < _dlDrawn.length; i++) if ((_dlDrawn[i].by || 'ta') !== first) return 'mix';
return first;
}
function _dealSyncTake() {
const bar = _dl$('dealTakeBar');
const take = _dl$('dealTake');
const end = _dl$('dealEnd');
const inp = _dl$('dealMsgInput');
const half = _dlHalfOpen();
const hasText = !half && !!(inp && inp.value.trim());
const n = _dlDrawn.length;
if (half) {
if (bar) bar.hidden = false;
if (end) end.hidden = true;
} else {
if (bar) bar.hidden = false;
if (end) end.hidden = !(n || hasText || _dlSession.length);
}
if (take) {
take.textContent = _dealTakeLabel(n, hasText);
take.disabled = _dlTaActive && !n;
}
const call = _dl$('dealCall');
if (call) {
const hand = _dlRoundHand();
const canCall = _dlStage === 'pick' && !_dlTaActive && n < DEAL_MAX &&
(n ? hand === 'ta' : !_dlTaAuto);
const showCall = _dlMode === 'ta' && canCall;
call.hidden = !showCall;
if (showCall) {
call.textContent = n ? _dlWord('再让他抽') : _dlWord('让他抽');
call.disabled = false;
}
}
const send = _dl$('dealMsgSend');
if (send) send.disabled = !hasText;
}
function _dealPaintDrawn() {
const box = _dl$('dealDrawn');
const note = _dl$('dealNote');
if (box) {
box.innerHTML = (!_dlDrawn.length)
? '<p class="dl-dempty">这一轮还没抽 · 点一张翻</p>'
: _dlDrawn.map(x => x.img
? '<div class="dl-drow"><span class="dl-dmini dl-dmini-img" aria-hidden="true" style="background-image:url(&quot;' +
escapeHTML(x.img) + '&quot;)"></span>' +
'<p class="dl-dtx">' + escapeHTML(x.cat || '图片') + '</p></div>'
: '<div class="dl-drow"><span class="dl-dmini" aria-hidden="true"><i></i></span>' +
'<p class="dl-dtx">' + escapeHTML((typeof screenSafeText === 'function') ? screenSafeText(x.text) : x.text) + '</p></div>').join('');
if (_dlDrawn.length) box.scrollTop = box.scrollHeight;
box.classList.toggle('is-hollow', !_dlDrawn.length);
box.classList.toggle('is-idle', _dlStage === 'idle' && !_dlDrawn.length && _dlPool.length > 0);
}
_dealSyncTake();
if (note) {
if (_dlHalfOpen()) {
if (_dlDrawn.length) {
if (_dlMode !== 'ta') note.textContent = '抽够了按「发送至聊天」· 点「洗牌」重撒一把';
else if (_dlTaActive) note.textContent = _dlWord('他抽完这一轮就自动发进聊天');
else if (_dlDrawn.length >= DEAL_MAX) note.textContent = '这一轮抽满了 · 按「发送至聊天」';
else note.textContent = _dlWord('他停在这儿了 · 按「再让他抽」接着抽');
} else if (_dlMode === 'ta' && _dlStage === 'pick') {
note.textContent = _dlTaActive ? _dlWord('他正在挑…')
: (_dlTaAuto ? _dlWord('他马上自己抽 · 左右滑牌桌＝先洗') : _dlWord('他等你叫 · 左右滑牌桌＝洗牌 · 按「让他抽」'));
} else {
note.textContent = _dlHalfDone ? '这一轮已经发进聊天 · 点「再抽一轮」接着抽' : '点一张翻 · 点「洗牌」或左右滑牌桌＝洗牌';
}
} else if (_dlDrawn.length) {
const _taHand = _dlMode === 'ta' && _dlRoundHand() === 'ta';
note.textContent = _dlDrawn.length >= DEAL_MAX
? '这一轮最多 ' + DEAL_MAX + ' 张 · 收进这一场，结束才发进聊天'
: (_taHand ? _dlWord('他抽了这一轮 · 按「再让他抽」接着抽 · 收进这一场，结束才发')
: '再点一张 · 收进这一场记下这一轮 · 结束才发进聊天');
} else if (_dlSession.length) {
note.textContent = '这一场已记 ' + _dlSession.length + ' 条 · 点「再抽一轮」接着抽 · 结束才发进聊天';
} else if (_dlMode === 'ta' && _dlStage === 'pick') {
note.textContent = _dlTaActive ? _dlWord('他正在挑…')
: (_dlTaAuto ? _dlWord('他马上自己抽 · 左右滑牌桌＝先洗 · 结束才发进聊天') : _dlWord('他等你叫 · 左右滑牌桌＝洗牌 · 按「让他抽」· 结束才发进聊天'));
} else {
note.textContent = '点「洗牌」或左右滑牌桌＝洗牌 · 点一张翻 · 结束才发进聊天';
}
}
}
function _dealPick(card) {
if (!card || _dlStage !== 'pick' || _dlBusy || _dlTaken) return;
if (_dlDrawn.length >= DEAL_MAX) { _dealPaintDrawn(); return; }
_dlTaAutoClear();
_dlBusy = true;
const got = card.__dlCard || _dlNext();
if (!got) { _dlBusy = false; return; }
card.__dlCard = got;
const _ix = _dlPool.indexOf(got);
if (_ix >= 0) _dlPool.splice(_ix, 1);
_dlPaintFace(card, got);
const table = _dl$('dealTable');
if (table) table.classList.add('has-pick');
const tr = table.getBoundingClientRect(), cr = card.getBoundingClientRect();
const rot = card.style.getPropertyValue('--rot') || '0deg';
const dx = (tr.left + tr.width / 2) - (cr.left + cr.width / 2);
const dy = (tr.top + tr.height * 0.40) - (cr.top + cr.height / 2);
card.classList.add('is-picked');
card.style.zIndex = '400';
const lift = card.querySelector('.dl-lift');
const _g = _dlFit(_dlPileRows);
const _sc = Math.max(1.1, Math.min(1.62, (tr.height * 0.86) / _g.ch, (tr.width * 0.9) / _g.cw));
if (lift) lift.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + _sc.toFixed(2) + ') rotate(-' + rot + ')';
const note = _dl$('dealNote');
if (note) note.textContent = _dlMode === 'ta' ? _dlWord('他抽了这一张') : '你抽了这一张';
const _pickSeq = _dlShuffleSeq;
_dlTPick = window.setTimeout(() => {
if (_pickSeq !== _dlShuffleSeq) return;
card.classList.add('is-face');
_dlT3 = window.setTimeout(() => {
if (_pickSeq !== _dlShuffleSeq) return;
const _got = card.__dlCard || { cat: '主字卡', text: '' };
_dlDrawn.push({ cat: _got.cat || '主字卡', img: _got.img, text: _got.text,
by: _dlMode === 'me' ? 'me' : 'ta' });
card.className = 'dl-pcard is-gone';
card.style.zIndex = '1';
card.innerHTML = '';
if (table) table.classList.remove('has-pick');
_dealPaintDrawn();
_dlBusy = false;
if (_dlShuffleQueued) { _dlShuffleQueued = false; window.setTimeout(dealShuffleNow, 0); }
}, 460);
}, 380);
}
function _dlTaWant() {
const bh = (data.activeChat && data.chatSettings && data.chatSettings[data.activeChat]) || data.behavior || defaults.behavior || {};
const lo = Math.max(1, Math.min(DEAL_MAX, Math.round(Number(bh.replyMin) || 1)));
const hi = Math.max(lo, Math.min(DEAL_MAX, Math.round(Number(bh.replyMax) || lo)));
return _ri(lo, hi);
}
function _dlTaAutoClear() {
if (_dlTaAutoT) { window.clearTimeout(_dlTaAutoT); _dlTaAutoT = 0; }
}
function _dlTaAutoArm() {
_dlTaAutoClear();
if (!_dlTaAuto) return;
if (_dlMode !== 'ta' || _dlStage !== 'pick' || _dlTaActive || _dlDrawn.length) return;
_dlTaAutoT = window.setTimeout(() => {
_dlTaAutoT = 0;
if (!_dlTaAuto) return;
if (_dlMode === 'ta' && _dlStage === 'pick' && !_dlTaActive && !_dlDrawn.length) _dlTaBegin();
}, DEAL_TA_WAIT);
}
function _dlTaAbort() {
_dlTaActive = false;
}
function _dlTaBegin() {
_dlTaAutoClear();
if (_dlMode !== 'ta' || _dlStage !== 'pick' || _dlTaActive) return;
_dlTaActive = true;
const want = Math.min(DEAL_MAX, _dlDrawn.length + _dlTaWant());
const done = () => { _dlTaActive = false; _dealSyncTake(); _dealPaintDrawn(); };
const finishTa = () => {
if (!_dlTaActive) { done(); return; }
if (_dlTaken || !_dlDrawn.length) { done(); return; }
_dlT2 = window.setTimeout(() => {
if (_dlMode === 'ta' && _dlHalfOpen() && !_dlTaken && _dlDrawn.length) dealSendAll();
_dlTaActive = false;
_dealSyncTake();
}, 560);
};
const takeTa = () => {
_dlT2 = 0;
if (!_dlTaActive) { _dealSyncTake(); return; }
if (_dlMode !== 'ta' || _dlStage !== 'pick') { _dlTaActive = false; _dealSyncTake(); return; }
if (_dlDrawn.length >= want) { if (_dlHalfOpen()) finishTa(); else done(); return; }
const left = Array.prototype.filter.call(document.querySelectorAll('#dealTable .dl-pcard:not(.is-gone)'), c => !c.classList.contains('is-picked'));
if (!left.length) { if (_dlHalfOpen()) finishTa(); else done(); return; }
if (_dlBusy) { _dlT2 = window.setTimeout(takeTa, 240); return; }
_dealPick(left[Math.floor(Math.random() * left.length)]);
_dlT2 = window.setTimeout(takeTa, 1500);
};
const note = _dl$('dealNote');
if (note) note.textContent = _dlWord('他正在挑…');
_dealSyncTake();
_dlT2 = window.setTimeout(takeTa, DEAL_TA_WAIT);
}
function _dlDealRec(round) {
const by = _dlMode === 'me' ? 'me' : 'ta';
return {
at: Date.now(),
cat: '主字卡',
title: _dlTitleOf(by),
by: by,
round: round || 0,
cards: _dlDrawn.map(x => {
const one = { cat: x.cat || '主字卡' };
if (x.img) one.img = x.img; else one.text = x.text || '';
return one;
})
};
}
function _dealFlush() {
if (_dlTaken || !_dlDrawn.length) return false;
const rec = _dlDealRec(0);
_dlTaken = true;
_dlStage = 'done';
_dlDrawn = [];
_deliverToChat({ id: nextId(), from: 'partner', src: 'deal', deal: rec }, data.activeChat);
return true;
}
function _dlWallImage() {
try {
const el = document.querySelector('#chatView .chat-bg');
const painted = el ? getComputedStyle(el, '::before').backgroundImage : '';
if (painted && painted !== 'none') return painted;
} catch (e) { }
const cs = getComputedStyle(document.body);
const chat = (cs.getPropertyValue('--chat-bg') || '').trim();
if (chat && chat !== 'none') {
return 'linear-gradient(rgba(255,255,255,var(--chat-wash-a,0)),rgba(255,255,255,var(--chat-wash-a,0))),' +
'linear-gradient(rgba(var(--ink-rgb),var(--chat-veil-a,0)),rgba(var(--ink-rgb),var(--chat-veil-a,0))),' + chat;
}
const desk = (cs.getPropertyValue('--desk-bg') || '').trim();
if (desk && desk !== 'none') {
return 'linear-gradient(rgba(255,255,255,var(--desk-wash-a,0)),rgba(255,255,255,var(--desk-wash-a,0))),' +
'linear-gradient(rgba(var(--ink-rgb),var(--desk-veil-a,.44)),rgba(var(--ink-rgb),var(--desk-veil-a,.44))),' + desk;
}
return 'none';
}
function _dlSyncWall() {
const dv = _dl$('dealView');
if (!dv) return;
try { dv.style.setProperty('--dl-page-wall', _dlWallImage()); } catch (e) { }
}
function _dlSyncCompH() {
const dv = _dl$('dealView'), c = _dl$('composer');
if (!dv) return;
const h = c ? Math.round(c.getBoundingClientRect().height) : 70;
dv.style.setProperty('--dl-comp-h', Math.max(48, h) + 'px');
}
function _dlSetBand(px) {
const dv = _dl$('dealView');
if (dv) dv.style.setProperty('--dl-half-band', Math.round(px) + 'px');
}
function _dlSyncBand() {
const shell = document.querySelector('.app-shell');
const H = (shell && shell.clientHeight) || window.innerHeight;
const list = _dl$('messageList');
const cards = list ? list.querySelectorAll('.dl-card') : [];
const last = cards.length ? cards[cards.length - 1].getBoundingClientRect() : null;
const comp = _dl$('composer');
const compH = comp ? Math.round(comp.getBoundingClientRect().height) : 70;
const want = last ? (H - last.top + 8 - compH) : 44;
_dlSetBand(Math.max(44, Math.min(want, Math.round(H * 0.25))));
}
function _dlHalfOpen() { return document.body.classList.contains('deal-half-open'); }
function _dlSyncModeChips() {
document.querySelectorAll('[data-deal-mode]').forEach(b => {
b.setAttribute('aria-pressed', b.dataset.dealMode === _dlMode ? 'true' : 'false');
});
document.querySelectorAll('[data-deal-taauto]').forEach(b => {
b.setAttribute('aria-pressed', (b.dataset.dealTaauto === '1') === _dlTaAuto ? 'true' : 'false');
});
const sub = _dl$('dealTaSub');
if (sub) sub.hidden = _dlMode !== 'ta';
}
function _dlPaintSub() {
const sub = _dl$('dealSub');
if (!sub) return;
if (_dlHalfOpen()) {
sub.textContent = _dlMode === 'ta'
? (_dlTaAuto ? _dlWord('他撒完就自己抽 · 左右滑牌桌＝先洗 · 抽完自动发进聊天')
: _dlWord('左右滑牌桌＝洗牌 · 按「让他抽」他才抽 · 抽完自动发进聊天'))
: '你抽够了按「发送至聊天」· 每一轮进聊天一条';
} else {
sub.textContent = _dlMode === 'ta'
? (_dlTaAuto ? _dlWord('他撒完就自己抽 · 左右滑牌桌＝先洗 · 收进这一场，结束才发')
: _dlWord('左右滑牌桌＝洗牌 · 按「让他抽」他才抽 · 收进这一场，结束才发'))
: '你从这一把里挑 · 左右滑牌桌可洗牌 · 收进这一场，结束才发进聊天';
}
}
function dealOpenHalf() {
if (document.body.classList.contains('deal-half-open')) return;
document.body.classList.add('deal-half-open');
_dlMode = 'ta';
_dlSyncModeChips();
_dlSessionOn = false;
_dlSession = [];
_dlSessionRound = 0;
_dlPendingReply = '';
_dlRenderSession();
_dlSyncCompH();
_dlSetBand(44);
dealEnter();
}
function _dlBackToLatest() {
if (document.body.dataset.view !== 'chat') return;
if (typeof inLocateMode === 'function' && inLocateMode()) { if (typeof jumpToLatest === 'function') jumpToLatest(); return; }
if (typeof renderMessages === 'function') renderMessages();
if (typeof scrollChatToBottom === 'function') scrollChatToBottom();
}
function dealHalfLeave() {
if (!document.body.classList.contains('deal-half-open')) return;
document.body.classList.remove('deal-half-open');
dealLeave();
_dlBackToLatest();
}
function dealHalfToFull() {
if (!document.body.classList.contains('deal-half-open')) return;
document.body.classList.remove('deal-half-open');
_dlSessionStart();
if (_dlDrawn.length && !_dlTaken) {
_dlSessionRound++;
_dlSession.push({ kind: 'deal', deal: _dlDealRec(_dlSessionRound) });
}
_dlDrawn = [];
_dlTaken = false;
_dlHalfDone = false;
_dlClearTimers();
_dlQuietEnter = false;
if (typeof showView === 'function') showView('deal');
}
function _dlSessionStart() {
_dlSessionOn = true;
_dlSession = [];
_dlSessionRound = 0;
_dlSessionCid = data.activeChat;
_dlPendingReply = '';
_dlRenderSession();
}
function _dlSessionDealHTML(e) {
const d = (e && e.deal) || {};
const cards = _dealCardsOf(d);
return '<div class="dl-sdeal"><div class="dl-sdeal-hd"><b>第 ' + (d.round || 1) + ' 轮</b>' +
'<span>' + cards.length + ' 张</span></div>' +
'<div class="dl-hand">' + cards.map(_dealMiniHTML).join('') + '</div></div>';
}
function _dlSessionMsgHTML(e) {
const m = (e && e.msg) || {};
const tx = m.text || (m.sticker ? '[表情包]' : (m.voice ? '[语音]' : (m.img ? '[图片]' : '')));
return '<div class="dl-smsg ' + (m.from === 'me' ? 'mine' : 'ta') + '"><p>' +
escapeHTML((typeof screenSafeText === 'function') ? screenSafeText(tx) : tx) + '</p></div>';
}
function _dlRenderSession() {
const body = _dl$('dealSessionBody');
const n = _dl$('dealSessionN');
if (n) n.textContent = _dlSession.length ? _dlSession.length + ' 条' : '';
if (!body) return;
if (!_dlSession.length) {
body.innerHTML = '<p class="dl-sempty">这一场还没记下牌 · 抽完点「收进这一场」</p>';
} else {
body.innerHTML = _dlSession.map(e => e.kind === 'deal' ? _dlSessionDealHTML(e) : _dlSessionMsgHTML(e)).join('');
body.scrollTop = body.scrollHeight;
}
}
function _dlCommitRound(text) {
const t = String(text || '').trim();
const hadCards = _dlDrawn.length > 0;
if (hadCards) {
_dlSessionRound++;
_dlSession.push({ kind: 'deal', deal: _dlDealRec(_dlSessionRound) });
_dlDrawn = [];
_dlTaken = true;
_dlStage = 'idle';
const table = _dl$('dealTable');
if (table) {
table.innerHTML = '<div class="dl-tempty"><span class="dl-tem-ico" aria-hidden="true"><i></i><i></i><i></i></span>' +
'<p>点「再抽一轮」撒新的一把</p></div>';
table.classList.remove('has-pick');
}
}
if (t) {
_dlSession.push({ kind: 'msg', msg: { from: 'me', text: t } });
const inp = _dl$('dealMsgInput');
if (inp) inp.value = '';
}
_dealPaintDrawn();
_dlRenderSession();
const note = _dl$('dealNote');
if (note) {
if (hadCards) note.textContent = '这一轮已记下 · 点「再抽一轮」接着抽 · 结束才发进聊天';
else if (t) note.textContent = _dlStage === 'pick'
? '这句已记下 · 还可以接着抽这一轮 · 结束才发进聊天'
: '这句已记下 · 点「再抽一轮」接着抽 · 结束才发进聊天';
}
_dealSyncTake();
}
function _dlMergeDeals(list) {
const rounds = [];
const bys = [];
const preSays = [];
let firstAt = 0;
(list || []).forEach(e => {
if (!e) return;
if (e.kind === 'deal' && e.deal) {
const d = e.deal;
const cards = _dealCardsOf(d);
if (!cards.length) return;
if (!firstAt) firstAt = d.at || 0;
rounds.push({ round: d.round || (rounds.length + 1), cards: cards, says: [] });
const by = d.by || _dlRecBy(d);
if (by && bys.indexOf(by) < 0) bys.push(by);
} else if (e.kind === 'msg' && e.msg && e.msg.from === 'me') {
const t = String(e.msg.text || '').trim();
if (!t) return;
(rounds.length ? rounds[rounds.length - 1].says : preSays).push(t);
}
});
if (!rounds.length) return null;
const by = bys.length === 1 ? bys[0] : 'mix';
const rec = {
at: firstAt || Date.now(),
cat: '主字卡',
title: (by === 'me' || by === 'ta') ? _dlTitleOf(by) : '抽到的牌',
by: by,
rounds: rounds
};
if (rounds.length === 1) rec.round = rounds[0].round;
if (preSays.length) rec.preSays = preSays;
return rec;
}
function _dlSessionFlush() {
if (!_dlSession.length) { _dlSessionOn = false; return false; }
const cid = _dlSessionCid || data.activeChat;
const list = _dlSession.slice();
_dlSession = [];
_dlSessionOn = false;
let lastMe = '';
const dealEntries = list.filter(e => e.kind === 'deal' && e.deal);
const msgEntries = list.filter(e => e.kind === 'msg' && e.msg && e.msg.from === 'me' && String(e.msg.text || '').trim());
if (msgEntries.length) lastMe = String(msgEntries[msgEntries.length - 1].msg.text || '').trim();
const merged = (dealEntries.length && (dealEntries.length > 1 || msgEntries.length))
? _dlMergeDeals(list) : null;
let mergedSent = false;
_dlQuietFlush = true;
try {
list.forEach(e => {
if (e.kind === 'deal') {
if (merged) {
if (!mergedSent) {
mergedSent = true;
_deliverToChat({ id: nextId(), from: 'partner', src: 'deal', deal: merged }, cid);
}
return;
}
_deliverToChat({ id: nextId(), from: 'partner', src: 'deal', deal: e.deal }, cid);
} else {
const m = e.msg || {};
if (merged && m.from === 'me' && String(m.text || '').trim()) {
if (typeof _cjEvent === 'function') _cjEvent(cid, 'meSent');
return;
}
const one = { id: nextId(), from: m.from === 'me' ? 'me' : 'partner', text: m.text || '' };
if (m.from === 'me' && m.text) lastMe = m.text;
_deliverToChat(one, cid);
if (m.from === 'me') {
if (typeof _cjEvent === 'function') _cjEvent(cid, 'meSent');
}
}
});
} finally {
_dlQuietFlush = false;
}
_dlPendingReply = lastMe;
_dlRenderSession();
return true;
}
function _dlEndTap() {
if (_dlHalfOpen()) return;
const inp = _dl$('dealMsgInput');
const t = inp ? (inp.value || '').trim() : '';
if (t || _dlDrawn.length) dealSendAll();
if (typeof showView === 'function') showView('chat');
}
function dealSendAll() {
_dlTaActive = false;
if (_dlHalfOpen()) {
if (!_dlDrawn.length) return;
_dealFlush();
_dlHalfDone = true;
_dealPaintDrawn();
try {
if (typeof renderMessages === 'function') renderMessages();
if (typeof scrollChatToBottom === 'function') scrollChatToBottom();
} catch (e) { }
window.requestAnimationFrame(_dlSyncBand);
return;
}
const inp = _dl$('dealMsgInput');
const text = inp ? (inp.value || '').trim() : '';
if (!text && !_dlDrawn.length) return;
_dlCommitRound(text);
}
function dealTakeTap() {
if (_dlHalfOpen()) {
if (_dlMode === 'ta' && _dlTaAuto && _dlStage === 'pick' && !_dlDrawn.length) {
if (!_dlTaActive) _dlTaBegin();
return;
}
if (!_dlDrawn.length) { dealEnter(); return; }
dealSendAll();
return;
}
const inp = _dl$('dealMsgInput');
const text = inp ? (inp.value || '').trim() : '';
if (_dlMode === 'ta' && _dlTaAuto && _dlStage === 'pick' && !text && !_dlDrawn.length) {
if (!_dlTaActive) _dlTaBegin();
return;
}
if (text || _dlDrawn.length) { dealSendAll(); return; }
dealEnter();
}
function dealLeave() {
document.body.classList.remove('deal-half-open');
_dlClearTimers();
if (_dlSessionOn) {
if (_dlDrawn.length && !_dlTaken) {
_dlSessionRound++;
_dlSession.push({ kind: 'deal', deal: _dlDealRec(_dlSessionRound) });
_dlDrawn = [];
}
const cid = _dlSessionCid || data.activeChat;
const had = _dlSession.length > 0;
_dlSessionFlush();
_dlTaken = false;
_dlStage = 'idle';
if (had) {
try {
if (typeof renderMessages === 'function') renderMessages();
if (typeof scrollChatToBottom === 'function') scrollChatToBottom();
if (typeof renderChatsList === 'function') renderChatsList();
} catch (e) { }
}
if (_dlPendingReply && cid) {
const t = _dlPendingReply;
_dlPendingReply = '';
try { if (typeof partnerReply === 'function') partnerReply(cid, t); } catch (e) { }
}
return;
}
const had = _dlDrawn.length > 0;
if (had && !_dlTaken) _dealFlush();
_dlTaken = false;
_dlStage = 'idle';
_dlDrawn = [];
if (had) _dealPaintDrawn();
}
function dealEnter() {
if (_dlQuietEnter) return;
if (_dlHalfOpen()) {
_dlSessionOn = false;
} else if (!_dlSessionOn) {
_dlSessionStart();
}
_dlRenderSession();
_dlSyncWall();
_dlSyncCompH();
_dlClearTimers();
_dlStage = 'settle';
_dlTaken = false;
_dlHalfDone = false;
_dlDrawn = [];
const page = _dl$('dealPage');
if (page) page.hidden = true;
/* 牌桌接管：列表页开着的标记一定要撤掉，否则牌桌那一套会被 visibility
 * 一直摁住，点「收起来」后整张桌子是空的 */
try { document.body.classList.remove('deal-page-open'); } catch (e) {}
const pool = dealPool(data.activeChat);
if (!pool.length) {
_dlStage = 'idle';
const note = _dl$('dealNote');
if (note) note.textContent = _dlWord('这一位还没有可取的主字卡（公用或绑给他的）· 先去字卡库添几张');
const table = _dl$('dealTable');
if (table) table.innerHTML = '';
const box = _dl$('dealDrawn'); if (box) box.innerHTML = '<p class="dl-dempty">这一位还没有可取的主字卡</p>';
const bar = _dl$('dealTakeBar'); if (bar) bar.hidden = true;
const msgbar = _dl$('dealMsgBar'); if (msgbar) msgbar.hidden = true;
const shb0 = _dl$('dealShuffle'); if (shb0) shb0.hidden = true;
return;
}
_dlPool = _dlShuffle(pool);
const shb1 = _dl$('dealShuffle'); if (shb1) shb1.hidden = false;
const msgbar2 = _dl$('dealMsgBar'); if (msgbar2) msgbar2.hidden = false;
_dealPaintDrawn();
_dlPaintSub();
const note = _dl$('dealNote');
if (note) note.textContent = '撒牌中…';
const cards = dealBuildPile();
const wait = _dealScatter(cards);
_dlT1 = window.setTimeout(() => {
_dlStage = 'pick';
_dealPaintDrawn();
if (_dlShuffleQueued) { _dlShuffleQueued = false; window.setTimeout(dealShuffleNow, 0); }
if (_dlMode === 'ta' && note) {
const taNote = _dlTaAuto ? _dlWord('他马上自己抽 · 左右滑牌桌＝先洗') : _dlWord('他等你叫 · 左右滑牌桌＝洗牌 · 按「让他抽」');
note.textContent = _dlHalfOpen() ? taNote : taNote + ' · 结束才发进聊天';
}
_dealSyncTake();
_dlTaAutoArm();
}, wait);
}
function dealSetMode(mode) {
const next = (mode === 'ta') ? 'ta' : 'me';
if (next !== _dlMode && _dlDrawn.length && !_dlTaken) {
if (_dlHalfOpen()) {
if (_dlTaActive) _dlTaAbort();
dealSendAll();
} else if (_dlSessionOn) {
_dlSessionRound++;
_dlSession.push({ kind: 'deal', deal: _dlDealRec(_dlSessionRound) });
}
}
_dlMode = next;
_dlSyncModeChips();
_dlPaintSub();
dealEnter();
}
function dealSetTaAuto(on) {
_dlTaAuto = !!on;
try { localStorage.setItem('ordinal-deal-taauto', _dlTaAuto ? '1' : '0'); } catch (e) { }
_dlSyncModeChips();
_dlPaintSub();
if (!_dlTaAuto) { _dlTaAutoClear(); _dlTaAbort(); }
else if (_dlStage === 'pick' && !_dlTaActive && _dlDrawn.length &&
_dlDrawn.length < DEAL_MAX && _dlRoundHand() === 'ta') _dlTaBegin();
else _dlTaAutoArm();
_dealPaintDrawn();
}
function _dealMsgOf(id) {
const sid = String(id);
const scan = st => {
if (!Array.isArray(st)) return null;
for (let i = st.length - 1; i >= 0; i--) { const m = st[i]; if (m && m.deal && String(m.id) === sid) return m; }
return null;
};
const chs = (data && data.chats) || {};
for (const cid of Object.keys(chs)) { const m = scan(chs[cid] && chs[cid].msgs); if (m) return m; }
return scan(data && data.messages);
}
function _dealSheetHTML(c, round) {
return '<div class="dl-sheet1">' + _dealFaceHTML(c) +
'<p class="dl-src1">取自 · ' + escapeHTML((c && c.cat) || '主字卡') +
(round ? ' · 第 ' + round + ' 轮' : '') + '</p></div>';
}
function _dlSaySheetHTML(t) {
return '<div class="dl-sayrow"><i>你</i><p>' +
escapeHTML((typeof screenSafeText === 'function') ? screenSafeText(t) : t) + '</p></div>';
}
function dealOpenPage(msgId) {
const m = _dealMsgOf(msgId);
const page = _dl$('dealPage');
if (!m || !page) return;
_dlQuietEnter = true;
if (typeof showView === 'function') showView('deal');
_dlQuietEnter = false;
_dlPageId = String(m.id);
const d = m.deal || {};
const cards = _dealCardsOf(d);
const rounds = _dealRoundsOf(d);
const sub = _dl$('dealPageSub');
const who = (typeof chatNameOf === 'function') ? chatNameOf() : '';
const _dby = _dlRecBy(d);
if (sub) sub.textContent = _dby === 'me' ? ('你抽的 ' + cards.length + ' 张')
: _dby === 'ta' ? ((who ? who : 'TA') + ' 抽的 ' + cards.length + ' 张')
: rounds ? ('这一场 ' + rounds.length + ' 轮 · ' + cards.length + ' 张')
: ((who ? who + ' 递来' : '递来') + ' ' + cards.length + ' 张');
const body = _dl$('dealPageBody');
if (body) {
const rows = [];
const pushSay = arr => (Array.isArray(arr) ? arr : []).forEach(t => {
const s = String(t || '').trim();
if (s) rows.push(_dlSaySheetHTML(s));
});
pushSay(d.preSays);
if (rounds) {
rounds.forEach(r => {
(r.cards || []).forEach(c => rows.push(_dealSheetHTML(c, r.round)));
pushSay(r.says);
});
} else {
cards.forEach(c => rows.push(_dealSheetHTML(c, 0)));
if (d && Array.isArray(d.rounds) && d.rounds[0]) pushSay(d.rounds[0].says);
}
pushSay(d.says);
body.innerHTML = rows.join('');
}
/* 从聊天里点开对方递来的纸牌时，showView('deal') 期间的 _dlQuietEnter
 * 会挡住 app.js 切视图时自动调用的那次 dealEnter()，于是牌桌没建牌、
 * --dl-page-wall 也没同步：列表页背后一片白（图一），点「收起来」后
 * 露出的是空白牌桌（图二），只有再点「我来抽 / 让TA抽 / 洗牌」才正常。
 * 这里在「牌桌还没建过牌」时补一次初始化，让卡片与桌面背景都就位；
 * 列表页随后再盖回来（dealEnter 内会把 dealPage 设为 hidden）。 */
try {
const tbl = _dl$('dealTable');
if (!tbl || !tbl.querySelector('.dl-pcard')) {
if (typeof dealEnter === 'function') dealEnter();
} else { _dlSyncWall(); _dlSyncCompH(); }
} catch (e) {}
page.hidden = false;
/* 列表页接管牌桌：只留「抽到的字卡」＋聊天背景，洗牌堆和底部说一句
 * 整体让位（见 feat_ui「七」节）。收起时由 dealClosePage / dealEnter 撤掉 */
try { document.body.classList.add('deal-page-open'); } catch (e) {}
}
function dealClosePage() {
const page = _dl$('dealPage');
if (page) page.hidden = true;
const body = _dl$('dealPageBody');
if (body) body.innerHTML = '';
_dlPageId = null;
try { document.body.classList.remove('deal-page-open'); } catch (e) {}
}
document.addEventListener('click', e => {
const t = e.target;
const all = t.closest('[data-deal-all]');
if (all) { dealOpenPage(all.dataset.dealAll); return; }
const mode = t.closest('[data-deal-mode]');
if (mode) { dealSetMode(mode.dataset.dealMode); return; }
const taAuto = t.closest('[data-deal-taauto]');
if (taAuto) { dealSetTaAuto(taAuto.dataset.dealTaauto === '1'); return; }
if (t.closest('#dealMsgSend')) { dealSendAll(); return; }
if (t.closest('[data-deal-shuffle]')) {
if (_dlStage === 'pick' && !_dlTaken) dealShuffleNow();
else if (_dlStage === 'idle' || _dlStage === 'done') dealEnter();
return;
}
if (t.closest('#dealCall')) {
if (!_dlTaActive) _dlTaBegin();
return;
}
if (t.closest('#dealTake')) { dealTakeTap(); return; }
if (t.closest('#dealEnd')) { _dlEndTap(); return; }
if (t.closest('[data-deal-full]')) { dealHalfToFull(); return; }
if (t.closest('#dealHalfX')) { dealHalfLeave(); return; }
const card = t.closest('.dl-pcard');
if (card) { _dealPick(card); return; }
if (t.closest('#dealPageBack')) { dealClosePage(); return; }
if (t.closest('#dealPageAgain')) { dealClosePage(); dealEnter(); return; }
});
(function () {
const inp = _dl$('dealMsgInput');
if (!inp) return;
inp.addEventListener('input', _dealSyncTake);
inp.addEventListener('keydown', e => {
if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); dealSendAll(); }
});
})();
var _dlSwiped = false;
(function () {
const table = _dl$('dealTable');
if (!table) return;
let sx = 0, sy = 0, down = false, fired = false;
const fire = () => {
if (!down || fired) return;
fired = true;
_dlSwiped = true;
dealReshuffle();
};
table.addEventListener('pointerdown', e => {
if (e.pointerType === 'mouse' && e.button !== 0) return;
down = true; fired = false; _dlSwiped = false;
sx = e.clientX; sy = e.clientY;
});
table.addEventListener('pointermove', e => {
if (!down || fired) return;
if (Math.abs(e.clientX - sx) > 12 || Math.abs(e.clientY - sy) > 12) fire();
});
table.addEventListener('pointerup', () => { down = false; });
table.addEventListener('contextmenu', e => e.preventDefault());
table.addEventListener('pointercancel', () => { down = false; });
table.addEventListener('click', e => {
if (!_dlSwiped) return;
_dlSwiped = false;
e.stopPropagation(); e.preventDefault();
}, true);
})();
(function () {
let t = 0;
window.addEventListener('resize', () => {
const on = _dlHalfOpen() || document.body.dataset.view === 'deal';
if (!on) return;
window.clearTimeout(t);
t = window.setTimeout(() => { t = 0; _dlSyncCompH(); _dlRelayout(); }, 180);
});
})();
(function () {
const tb = _dl$('dealTable');
if (!tb || typeof ResizeObserver !== 'function') return;
let t = 0, last = Math.round(tb.clientWidth) + 'x' + Math.round(tb.clientHeight);
const again = () => {
if (_dlStage === 'settle') { t = window.setTimeout(again, 260); return; }
t = 0;
_dlRelayout();
};
new ResizeObserver(() => {
const on = _dlHalfOpen() || document.body.dataset.view === 'deal';
if (!on) return;
const key = Math.round(tb.clientWidth) + 'x' + Math.round(tb.clientHeight);
if (key === last) return;
last = key;
window.clearTimeout(t);
t = window.setTimeout(again, 160);
}).observe(tb);
})();
(function () {
function bind() {
const bar = document.getElementById('composer');
const input = document.getElementById('messageInput');
if (!bar || !input) return;
const btn = bar.querySelector('.send-btn');
if (!btn) return;
let timer = 0, fired = false, x = 0, y = 0;
const cancel = () => { if (timer) { window.clearTimeout(timer); timer = 0; } btn.classList.remove('dl-pressing'); };
btn.addEventListener('pointerdown', e => {
if (e.pointerType === 'mouse' && e.button !== 0) return;
if (String(input.value || '').trim()) return;
cancel();
x = e.clientX; y = e.clientY;
btn.classList.add('dl-pressing');
timer = window.setTimeout(() => {
timer = 0;
btn.classList.remove('dl-pressing');
if (typeof runShortcut === 'function') { fired = runShortcut('send'); return; }
fired = true;
if (_dlHalfOpen()) {
if (typeof dealHalfLeave === 'function') dealHalfLeave();
return;
}
if (typeof dealOpenHalf === 'function') dealOpenHalf();
}, DEAL_LP_MS);
});
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => btn.addEventListener(ev, cancel));
btn.addEventListener('pointermove', e => {
if (timer && (Math.abs(e.clientX - x) > 8 || Math.abs(e.clientY - y) > 8)) cancel();
});
btn.addEventListener('contextmenu', e => e.preventDefault());
bar.addEventListener('click', e => {
if (!fired) return;
fired = false;
if (e.target.closest('.send-btn')) { e.stopPropagation(); e.preventDefault(); }
}, true);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
else bind();
})();
var DLTA_MAX_N = 5;
var DLTA_DEF_PROB = 6;
function dlTaCfg(cid) {
const by = (data && data.dlTaBy && typeof data.dlTaBy === 'object') ? data.dlTaBy : {};
const src = (cid && by[cid] && typeof by[cid] === 'object') ? by[cid] : {};
const p = (src.prob === undefined || src.prob === null || src.prob === '') ? NaN : Number(src.prob);
const cl = v => { const n = Math.round(Number(v)); return (v === undefined || v === null || v === '') ? 0 : (isFinite(n) ? Math.max(1, Math.min(DLTA_MAX_N, n)) : 0); };
const lo = cl(src.nMin) || 1, hi = cl(src.nMax) || 2;
return {
on: src.on !== false,
prob: isFinite(p) ? Math.max(0, Math.min(100, p)) : DLTA_DEF_PROB,
nMin: Math.min(lo, hi), nMax: Math.max(lo, hi)
};
}
function dlTaDraw(cid, cfg) {
const pool = (typeof _categoryCards === 'function') ? _categoryCards('主字卡', cid) : [];
if (!pool.length) return null;
const n = Math.min(pool.length, cfg.nMin + Math.floor(Math.random() * (cfg.nMax - cfg.nMin + 1)));
const rest = pool.slice(), cards = [];
while (cards.length < n && rest.length) {
const i = Math.floor(Math.random() * rest.length);
cards.push({ cat: '主字卡', text: rest.splice(i, 1)[0] });
}
if (!cards.length) return null;
return { at: Date.now(), cat: '主字卡', title: _dlTitleOf('ta'), by: 'ta', round: 0, cards: cards };
}
function dlTaMaybeSend(cid) {
try {
if (!cid) return false;
if (typeof _chatIsGroup === 'function' && _chatIsGroup(cid)) return false;
if (typeof vcCardNarrow === 'function' && vcCardNarrow(cid)) return false;
const cfg = dlTaCfg(cid);
if (!cfg.on || !(cfg.prob > 0)) return false;
if (!_rand(cfg.prob)) return false;
const rec = dlTaDraw(cid, cfg);
if (!rec) return false;
_deliverToChat({ id: nextId(), from: 'partner', src: 'deal', unread: true, deal: rec }, cid);
return true;
} catch (e) { return false; }
}
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['deal'] = true;
