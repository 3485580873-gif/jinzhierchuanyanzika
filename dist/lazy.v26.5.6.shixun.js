// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var SX_GAP_MIN = 1000;
var SX_GAP_MAX = 86400000;
var SX_PER_MIN = 1, SX_PER_MAX = 7;
var SX_CARD_MIN = 1, SX_CARD_MAX = 5;
var SX_ACT_PER_MIN = 1, SX_ACT_PER_MAX = 7;
var SX_ACT_CARD_MIN = 1, SX_ACT_CARD_MAX = 5;
var SX_PAGE = 300;
var SX_DAY_GAP = 3 * 3600 * 1000;
var SX_THEMES = ['white', 'gray', 'paper', 'custom'];
var SX_THEME_NAME = { white: '素白', gray: '雾灰', paper: '米纸', custom: '自定义' };
var SX_RADS = ['sharp', 'soft', 'round'];
var SX_RAD_NAME = { sharp: '锐', soft: '柔', round: '圆' };
var SX_PALETTES = [
{ k: 'cedar', name: '雪松', bg: '#f3f6f2', ta: '#ffffff', me: '#dfe7dd' },
{ k: 'indigo', name: '墨兰', bg: '#eef1f6', ta: '#fbfcff', me: '#ccd7e6' },
{ k: 'bean', name: '豆沙', bg: '#faf2f1', ta: '#fffaf9', me: '#f0d7d3' },
{ k: 'celadon', name: '青瓷', bg: '#eff5f2', ta: '#fcfffd', me: '#cfe4dc' },
{ k: 'dusk', name: '暮粉', bg: '#fbf1f5', ta: '#fffafc', me: '#f3d9e5' },
{ k: 'oat', name: '燕麦', bg: '#faf6ef', ta: '#fffdf8', me: '#e9dcc8' },
{ k: 'slate', name: '石板', bg: '#eef0f2', ta: '#ffffff', me: '#d5dbe1' },
{ k: 'night', name: '夜阑', bg: '#23252a', ta: '#2f3238', me: '#3a3f47', ink: '#f2f3f5' }
];
var SX_CST_DEF = { bg: '#f4f3f0', taBg: '#ffffff', meBg: '#e4e5e0' };
var SX_CST_VARS = ['--sx-bg', '--sx-ta-bg', '--sx-me-bg', '--sx-ink', '--sx-ta-ink', '--sx-me-ink',
'--sx-sub', '--sx-in-bg', '--sx-ta-line', '--sx-me-line', '--sx-hair', '--sx-well', '--sx-paper'];
var SX_PUNCT_KEYS = ['space', 'dou', 'per', 'ex', 'q', 'el', 'dash', 'nl'];
var SX_PUNCT_FIELD = { space: 'pyPunctSpace', dou: 'pyPunctDou', per: 'pyPunctPer', ex: 'pyPunctEx',
q: 'pyPunctQ', el: 'pyPunctEl', dash: 'pyPunctDash', nl: 'pyPunctNl' };
function _sxJoinCfg(b) {
const cfg = { pyEnabled: true, pyPunctEnabled: b.punct !== false };
const keys = Array.isArray(b.punctKeys) ? b.punctKeys : SX_PUNCT_KEYS;
SX_PUNCT_KEYS.forEach(k => { cfg[SX_PUNCT_FIELD[k]] = keys.indexOf(k) >= 0; });
return cfg;
}
function sxGap() { return SX_GAP_MIN + Math.floor(Math.random() * (SX_GAP_MAX - SX_GAP_MIN + 1)); }
function _sxPick(lo, hi) {
const a = Math.min(lo, hi), b = Math.max(lo, hi);
return a + Math.floor(Math.random() * (b - a + 1));
}
function _sxInt(v, lo, hi, def) {
const n = Math.round(Number(v));
return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : def;
}
function _sxSingles() { return (data && Array.isArray(data.contacts) ? data.contacts : []).filter(c => c && c.id && c.kind !== 'group'); }
function _sxIsSingle(cid) { return _sxSingles().some(c => c.id === cid); }
function sxCid() {
const list = _sxSingles();
if (!list.length) return '';
const cur = (data && data.activeChat) || '';
return list.some(c => c.id === cur) ? cur : list[0].id;
}
function _sxBy() {
if (!data) return {};
if (!data.shixun || typeof data.shixun !== 'object' || Array.isArray(data.shixun)) data.shixun = { by: {} };
if (!data.shixun.by || typeof data.shixun.by !== 'object' || Array.isArray(data.shixun.by)) data.shixun.by = {};
const sx = data.shixun;
if (sx.actSeed !== 1) {
Object.keys(sx.by).forEach(cid => {
const o = sx.by[cid];
if (o && typeof o === 'object' && !Array.isArray(o)) o.active = true;
});
sx.actSeed = 1;
try { if (typeof save === 'function') save(); } catch (e) {}
}
return data.shixun.by;
}
function sxBook(cid, create) {
if (!cid) return null;
const by = _sxBy();
let b = by[cid];
if (!b || typeof b !== 'object' || Array.isArray(b)) {
if (!create) return null;
b = by[cid] = { theme: 'white', active: true, perMin: 1, perMax: 3, cardMin: 1, cardMax: 3,
actPerMin: 1, actPerMax: 3, actCardMin: 1, actCardMax: 5,
msgs: [], nextAt: 0, nextFrom: 0, replyAt: 0, replyFrom: 0, unread: 0 };
}
if (SX_THEMES.indexOf(b.theme) < 0) b.theme = 'white';
b.active = b.active === undefined ? true : b.active === true;
b.actPerMin = _sxInt(b.actPerMin === undefined ? 1 : b.actPerMin, SX_ACT_PER_MIN, SX_ACT_PER_MAX, 1);
b.actPerMax = _sxInt(b.actPerMax === undefined ? 3 : b.actPerMax, SX_ACT_PER_MIN, SX_ACT_PER_MAX, 3);
b.actCardMin = _sxInt(b.actCardMin === undefined ? 1 : b.actCardMin, SX_ACT_CARD_MIN, SX_ACT_CARD_MAX, 1);
b.actCardMax = _sxInt(b.actCardMax === undefined ? 5 : b.actCardMax, SX_ACT_CARD_MIN, SX_ACT_CARD_MAX, 5);
if (b.actPerMin > b.actPerMax) b.actPerMin = b.actPerMax;
if (b.actCardMin > b.actCardMax) b.actCardMin = b.actCardMax;
const _perOld = _sxInt(b.per, SX_PER_MIN, SX_PER_MAX, 3);
const _cardOld = _sxInt(b.cards, SX_CARD_MIN, SX_CARD_MAX, 3);
b.perMin = _sxInt(b.perMin === undefined ? 1 : b.perMin, SX_PER_MIN, SX_PER_MAX, 1);
b.perMax = _sxInt(b.perMax === undefined ? _perOld : b.perMax, SX_PER_MIN, SX_PER_MAX, 3);
b.cardMin = _sxInt(b.cardMin === undefined ? 1 : b.cardMin, SX_CARD_MIN, SX_CARD_MAX, 1);
b.cardMax = _sxInt(b.cardMax === undefined ? _cardOld : b.cardMax, SX_CARD_MIN, SX_CARD_MAX, 3);
if (b.perMin > b.perMax) b.perMin = b.perMax;
if (b.cardMin > b.cardMax) b.cardMin = b.cardMax;
if ('per' in b) delete b.per;
if ('cards' in b) delete b.cards;
b.punct = b.punct === undefined ? true : b.punct === true;
b.punctKeys = Array.isArray(b.punctKeys)
? b.punctKeys.filter(k => SX_PUNCT_KEYS.indexOf(k) >= 0)
: SX_PUNCT_KEYS.slice();
if (!Array.isArray(b.msgs)) b.msgs = [];
else {
const out = [];
b.msgs.forEach(m => {
if (!m || typeof m !== 'object') return;
const text = typeof m.text === 'string' ? m.text : '';
if (!text) return;
const one = { id: m.id || nextId(), from: m.from === 'me' ? 'me' : 'partner', text: text, ts: Number(m.ts) || Date.now() };
const took = Math.round(Number(m.took));
if (isFinite(took) && took > 0) one.took = took;
if (m.via === 'reply' || m.via === 'active') one.via = m.via;
out.push(one);
});
b.msgs = out;
}
b.nextAt = Number(b.nextAt) || 0;
b.nextFrom = Number(b.nextFrom) || 0;
b.replyAt = Number(b.replyAt) || 0;
b.replyFrom = Number(b.replyFrom) || 0;
b.unread = Math.max(0, Math.min(999, Number(b.unread) || 0));
return b;
}
function sxEnsure(cid) {
const b = sxBook(cid, true);
if (b && b.active && !b.nextAt) { b.nextFrom = Date.now(); b.nextAt = b.nextFrom + sxGap(); }
return b;
}
function sxPool(cid) {
try {
const p = (typeof _speakerPool === 'function') ? _speakerPool(cid, '') : null;
const arr = (p && Array.isArray(p.mainCards)) ? p.mainCards.filter(t => typeof t === 'string' && t.trim()) : [];
return arr.filter((t, i) => arr.indexOf(t) === i);
} catch (e) { return []; }
}
function _sxLine(pool, lo, hi, join) {
if (!pool || !pool.length) return '';
const want = Math.max(1, Math.min(pool.length, _sxPick(lo, hi)));
const bag = pool.slice(), segs = [];
for (let i = 0; i < want && bag.length; i++) segs.push(bag.splice(Math.floor(Math.random() * bag.length), 1)[0]);
return String(pyJoinCards(segs, join || _sxJoinCfg({})) || '').trim();
}
function sxSpeak(cid, n, lo, hi, took, via) {
const b = sxBook(cid, true);
if (!b) return 0;
const pool = sxPool(cid);
if (!pool.length) return 0;
const l = _sxInt(lo === undefined ? b.cardMin : lo, SX_CARD_MIN, SX_CARD_MAX, b.cardMin);
const h = _sxInt(hi === undefined ? b.cardMax : hi, SX_CARD_MIN, SX_CARD_MAX, b.cardMax);
const join = _sxJoinCfg(b);
const t0 = Date.now();
let k = 0, firstIdx = -1;
for (let i = 0; i < n; i++) {
const line = _sxLine(pool, l, h, join);
if (!line) break;
if (firstIdx < 0) firstIdx = b.msgs.length;
b.msgs.push({ id: nextId(), from: 'partner', text: line, ts: t0 + i });
k++;
}
if (k && firstIdx >= 0) {
const ms = Math.round(Number(took));
if (isFinite(ms) && ms > 0) b.msgs[firstIdx].took = ms;
if (via === 'reply' || via === 'active') b.msgs[firstIdx].via = via;
}
return k;
}
function _sxDayKey(ts) { const d = new Date(ts); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function _sxWhen(ts) {
const d = new Date(ts), n = new Date();
const p = x => (x < 10 ? '0' : '') + x;
const hm = p(d.getHours()) + ':' + p(d.getMinutes());
if (_sxDayKey(ts) === _sxDayKey(n.getTime())) return hm;
if (_sxDayKey(ts) === _sxDayKey(n.getTime() - 86400000)) return '昨天 ' + hm;
if (d.getFullYear() === n.getFullYear()) return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 ' + hm;
return d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
}
function sxUnreadTotal() {
const by = _sxBy();
let n = 0;
Object.keys(by).forEach(cid => { if (_sxIsSingle(cid)) n += Math.max(0, Number(by[cid] && by[cid].unread) || 0); });
return n;
}
function sxBadge() {
if (typeof _setTileBadge === 'function') _setTileBadge('tileSxDot', sxUnreadTotal());
}
function _sxDur(ms) {
let n = Math.max(0, Math.round(Number(ms) || 0));
if (n < 60000) return Math.max(1, Math.round(n / 1000)) + ' 秒';
if (n < 3600000) return Math.round(n / 60000) + ' 分';
if (n < 86400000) {
const h = Math.floor(n / 3600000), m = Math.round((n % 3600000) / 60000);
return h + ' 小时' + (m ? ' ' + m + ' 分' : '');
}
const d = Math.floor(n / 86400000), h = Math.round((n % 86400000) / 3600000);
return d + ' 天' + (h ? ' ' + h + ' 小时' : '');
}
function sxTick() {
if (typeof data === 'undefined' || !data) return;
if (document.hidden && !(data.appearance && data.appearance.bgKeepAlive)) return;
const by = _sxBy();
const now = Date.now();
let dirty = false;
Object.keys(by).forEach(cid => { if (!_sxIsSingle(cid)) { delete by[cid]; dirty = true; } });
Object.keys(by).forEach(cid => {
const b = sxBook(cid, true);
if (!b) return;
if (!b.active) {
if (b.nextAt || b.nextFrom) { b.nextAt = 0; b.nextFrom = 0; dirty = true; }
} else if (!b.nextAt) {
b.nextFrom = now;
b.nextAt = now + sxGap();
dirty = true;
}
const replyDue = !!(b.replyAt && now >= b.replyAt);
const activeDue = !!(b.active && b.nextAt && now >= b.nextAt);
if (!replyDue && !activeDue) return;
const useAct = activeDue && !replyDue;
const want = useAct ? _sxPick(b.actPerMin, b.actPerMax) : _sxPick(b.perMin, b.perMax);
const dueAt = useAct ? b.nextAt : b.replyAt;
const fromAt = useAct ? b.nextFrom : b.replyFrom;
const took = (dueAt && fromAt && dueAt > fromAt) ? (dueAt - fromAt) : 0;
const added = sxSpeak(cid, want,
useAct ? b.actCardMin : b.cardMin,
useAct ? b.actCardMax : b.cardMax,
took, useAct ? 'active' : 'reply');
if (!added) return;
dirty = true;
if (replyDue) { b.replyAt = 0; b.replyFrom = 0; }
if (activeDue) { b.nextFrom = now; b.nextAt = now + sxGap(); }
_sxLand(cid, added);
});
if (dirty) save();
}
var _sxNew = 0;
function _sxSyncNew() {
const el = document.getElementById('sxNew');
if (!el) return;
el.hidden = _sxNew <= 0;
el.textContent = (_sxNew > 99 ? '99+' : String(_sxNew)) + ' 条新消息 ↓';
}
function _sxFlushNew() {
const n = _sxNew;
_sxNew = 0;
_sxSyncNew();
if (!n) return;
const cid = sxCid();
const b = cid ? sxBook(cid, true) : null;
if (!b) return;
b.unread = Math.min(999, b.unread + n);
sxBadge();
save();
}
function _sxLand(cid, added) {
const b = sxBook(cid, true);
if (!b) return;
const onPage = (document.body.dataset.view === 'shixun') && sxCid() === cid && !document.hidden;
if (!onPage) b.unread = Math.min(999, b.unread + added);
else if (b.unread) b.unread = 0;
sxBadge();
if (!onPage) { _sxPreNotice(cid, added); return; }
const list = document.getElementById('sxList');
const near = !list || (list.scrollHeight - list.scrollTop - list.clientHeight < 90);
if (!near) { _sxNew = Math.min(999, _sxNew + added); _sxSyncNew(); return; }
_sxPaintList(false);
const wm = document.getElementById('sxWhoMask');
if (wm && !wm.hidden) _sxPaintWho();
}
function _sxPreNotice(cid, added) {
const b = sxBook(cid, false);
if (!b || !b.msgs.length) return;
const last = b.msgs[b.msgs.length - 1];
const text = String((last && last.text) || '');
if (!text) return;
const nm = (typeof chatPartnerNameOf === 'function' ? chatPartnerNameOf(cid) : '') || partnerName();
const av = (typeof chatPartnerAvatarOf === 'function' ? chatPartnerAvatarOf(cid) : '') || '';
const line = added > 1 ? text + ' · 共 ' + added + ' 条' : text;
const go = () => {
try { if (typeof switchChat === 'function') switchChat(cid, true); } catch (e) {}
try { showView('shixun'); } catch (e2) {}
};
if (typeof showDeskPopup === 'function') {
try {
showDeskPopup({ uid: 'shixun:' + cid, src: 'shixun', name: nm, avatar: av, text: line, onClick: go });
} catch (e3) {}
}
if (typeof bgNotifyCheck === 'function') {
try {
bgNotifyCheck(line, Date.now(), {
name: nm, av: av, avFixed: true, cid: cid, kind: 'sx', src: 'shixun',
});
} catch (e4) {}
}
}
function _sxPaintHead(cid) {
const who = cid ? ((typeof chatPartnerNameOf === 'function' ? chatPartnerNameOf(cid) : '') || 'TA') : '';
const elN = document.getElementById('sxName');
if (elN) elN.textContent = who ? '· ' + who : '';
const caret = document.querySelector('#sxWho .sx-caret');
if (caret) {
if (_sxSingles().length <= 1) caret.setAttribute('hidden', '');
else caret.removeAttribute('hidden');
}
}
function _sxPaintWho() {
const box = document.getElementById('sxPeople');
if (!box) return;
const list = _sxSingles();
const cur = sxCid();
if (!list.length) {
box.innerHTML = '<p class="sx-none">还没有联系人。先去聊天页加一位 TA，再回来。</p>';
return;
}
box.innerHTML = list.map(c => {
const nm = (typeof chatPartnerNameOf === 'function' ? chatPartnerNameOf(c.id) : '') || 'TA';
const on = c.id === cur;
const bk = sxBook(c.id, false);
const un = bk ? Math.max(0, Number(bk.unread) || 0) : 0;
return '<button type="button" class="sx-p' + (on ? ' on' : '') + '" data-sx-cid="' + escapeHTML(c.id) + '">'
+ '<span class="sx-av" aria-hidden="true">' + escapeHTML(String(nm).slice(0, 1)) + '</span>'
+ '<span class="sx-pn">' + escapeHTML(nm) + '</span>'
+ (on ? '<span class="sx-pc">当前</span>' : (un ? '<span class="sx-pu">' + (un > 99 ? '99+' : un) + ' 条</span>' : ''))
+ '</button>';
}).join('');
$$('#sxPeople .sx-p').forEach(row => {
const cid = row.getAttribute('data-sx-cid');
const av = (typeof chatPartnerAvatarOf === 'function' ? chatPartnerAvatarOf(cid) : '') || '';
if (!av) return;
const el = row.querySelector('.sx-av');
if (el) { el.textContent = ''; el.style.backgroundImage = 'url("' + av.replace(/"/g, '%22') + '")'; }
});
}
function _sxOpenWho() { _sxPaintWho(); const m = document.getElementById('sxWhoMask'); if (m) m.hidden = false; }
function _sxCloseWho() { const m = document.getElementById('sxWhoMask'); if (m) m.hidden = true; }
function sxSwitchTo(cid) {
_sxCloseWho();
_sxFindClose();
if (!cid || cid === sxCid()) return;
_sxFlushNew();
_sxWin = SX_PAGE;
if (typeof switchChat === 'function') switchChat(cid, true);
renderShiXun();
}
function _sxNoteHTML() {
return '<button type="button" class="sx-note" data-sx-cards="1"><b>字卡库是空的</b>'
+ '<span>TA 只能拿你库里的字卡说话。点这里去字卡库加几张。</span></button>';
}
var _sxWin = SX_PAGE;
function _sxMore() {
const list = document.getElementById('sxList');
if (!list) return;
const h0 = list.scrollHeight, t0 = list.scrollTop;
_sxWin += SX_PAGE;
_sxPaintList(false);
list.scrollTop = t0 + (list.scrollHeight - h0);
}
function _sxPaintList(toBottom) {
const list = document.getElementById('sxList');
if (!list) return;
const cid = sxCid();
const b = cid ? sxBook(cid, true) : null;
const noWords = cid ? sxPool(cid).length === 0 : true;
if (!b || !b.msgs.length) {
list.classList.add('is-empty');
const lead = noWords
? 'TA 还没有开口过。'
: (b.active
? '你发一句，TA 会在 24 小时里的某一刻回。<br>它自己也会在某个时刻开口——什么时候，说不准。'
: '你发一句，TA 会在 24 小时里的某一刻回。<br>「联系人主动发信息」现在关着，它不会自己开口。');
list.innerHTML = '<div class="sx-empty"><em>SHIXUN</em><b>还没有消息</b><span>' + lead + '</span>'
+ (noWords ? _sxNoteHTML() : '') + '</div>';
_sxNew = 0;
_sxSyncNew();
return;
}
list.classList.remove('is-empty');
const nearBottom = toBottom || (list.scrollHeight - list.scrollTop - list.clientHeight < 90);
const total = b.msgs.length;
if (_sxWin < SX_PAGE) _sxWin = SX_PAGE;
const start = Math.max(0, total - _sxWin);
let html = '', lastTs = 0, lastFrom = '';
if (start > 0) {
html += '<button type="button" class="sx-more" data-sx-more="1">更早的 ' + start + ' 条</button>';
}
for (let i = start; i < total; i++) {
const m = b.msgs[i];
let broke = false;
if (!lastTs || _sxDayKey(m.ts) !== _sxDayKey(lastTs) || m.ts - lastTs > SX_DAY_GAP) {
html += '<div class="sx-day">' + escapeHTML(_sxWhen(m.ts)) + '</div>';
broke = true;
}
lastTs = m.ts;
if (m.from === 'partner' && (m.via === 'reply' || m.via === 'active' || Number(m.took) > 0)) {
const kind = m.via === 'active' ? 'act' : (m.via === 'reply' ? 'rep' : '');
const dur = Number(m.took) > 0 ? _sxDur(m.took) : '';
html += '<div class="sx-took' + (kind ? ' is-' + kind : '') + '">'
+ (kind ? '<span class="sx-tag">' + (kind === 'act' ? '主动' : '回复') + '</span>' : '')
+ '<span><span class="sx-tk-when">' + escapeHTML(_sxWhen(m.ts)) + '</span> 收到时讯'
+ (dur ? ' · 用时 ' + escapeHTML(dur) : '') + '</span>'
+ '</div>';
}
const hop = !broke && i > start && m.from !== lastFrom;
lastFrom = m.from;
html += '<div class="sx-row' + (m.from === 'me' ? ' me' : '') + (hop ? ' hop' : '') + '" data-sx-id="' + escapeHTML(String(m.id)) + '"><div class="sx-b">' + escapeHTML(m.text) + '</div></div>';
}
const tail = b.msgs[total - 1];
const waitMine = !!(b.replyAt && b.replyAt > Date.now());
if (waitMine && tail && tail.from === 'me') {
html += '<div class="sx-wait">' + (noWords ? '已送出 · 字卡库里还没有字卡，TA 说不出话' : '已送出 · 回话在 24 小时内随机到') + '</div>';
}
if (noWords) html += _sxNoteHTML();
list.innerHTML = html;
if (nearBottom) list.scrollTop = list.scrollHeight;
if (toBottom) _sxNew = 0;
_sxSyncNew();
}
function _sxSyncSend() {
const el = document.getElementById('sxInput');
const btn = document.getElementById('sxSend');
if (btn) btn.disabled = !el || !String(el.value || '').trim();
}
function _sxBar(id, lo, hi, min, max) {
const el = document.getElementById(id);
if (!el) return;
const span = Math.max(1, max - min);
const w = Math.max(6, (hi - lo) / span * 100);
const l = Math.min((lo - min) / span * 100, 100 - w);
el.style.left = l + '%';
el.style.width = w + '%';
}
function _sxPaintSet() {
sxApplyStyle();
const cid = sxCid();
if (!cid) return;
const b = sxBook(cid, true);
if (!b) return;
$$('#sxThemeChips .sx-chip').forEach(el => el.classList.toggle('on', el.dataset.sxTheme === b.theme));
_sxCstPaintRow();
const put = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
put('sxPerLoShow', b.perMin); put('sxPerHiShow', b.perMax);
put('sxCrdLoShow', b.cardMin); put('sxCrdHiShow', b.cardMax);
put('sxPerSum', b.perMin + ' ~ ' + b.perMax + ' 条');
put('sxCrdSum', b.cardMin + ' ~ ' + b.cardMax + ' 张');
const dis = (id, v) => { const el = document.getElementById(id); if (el) el.disabled = !!v; };
dis('sxPerLoCut', b.perMin <= SX_PER_MIN);
dis('sxPerLoAdd', b.perMin >= SX_PER_MAX);
dis('sxPerHiCut', b.perMax <= SX_PER_MIN);
dis('sxPerHiAdd', b.perMax >= SX_PER_MAX);
dis('sxCrdLoCut', b.cardMin <= SX_CARD_MIN);
dis('sxCrdLoAdd', b.cardMin >= SX_CARD_MAX);
dis('sxCrdHiCut', b.cardMax <= SX_CARD_MIN);
dis('sxCrdHiAdd', b.cardMax >= SX_CARD_MAX);
_sxBar('sxPerBar', b.perMin, b.perMax, SX_PER_MIN, SX_PER_MAX);
_sxBar('sxCrdBar', b.cardMin, b.cardMax, SX_CARD_MIN, SX_CARD_MAX);
const tg = document.getElementById('sxActTg');
if (tg) tg.classList.toggle('off', !b.active);
const actRow = document.getElementById('sxActRow');
if (actRow) {
actRow.setAttribute('aria-pressed', b.active ? 'true' : 'false');
actRow.classList.toggle('on', b.active);
}
put('sxActSum', b.active ? '已开启' : '关闭');
put('sxActState', b.active
? '已开启（出厂默认）：关着这一页、切到后台也排着，回来就到'
: '已关闭：TA 不会自己发时讯');
put('sxActPerLoShow', b.actPerMin); put('sxActPerHiShow', b.actPerMax);
put('sxActCrdLoShow', b.actCardMin); put('sxActCrdHiShow', b.actCardMax);
put('sxActPerSum', b.actPerMin + ' ~ ' + b.actPerMax + ' 条');
put('sxActCrdSum', b.actCardMin + ' ~ ' + b.actCardMax + ' 张');
dis('sxActPerLoCut', b.actPerMin <= SX_ACT_PER_MIN);
dis('sxActPerLoAdd', b.actPerMin >= SX_ACT_PER_MAX);
dis('sxActPerHiCut', b.actPerMax <= SX_ACT_PER_MIN);
dis('sxActPerHiAdd', b.actPerMax >= SX_ACT_PER_MAX);
dis('sxActCrdLoCut', b.actCardMin <= SX_ACT_CARD_MIN);
dis('sxActCrdLoAdd', b.actCardMin >= SX_ACT_CARD_MAX);
dis('sxActCrdHiCut', b.actCardMax <= SX_ACT_CARD_MIN);
dis('sxActCrdHiAdd', b.actCardMax >= SX_ACT_CARD_MAX);
_sxBar('sxActPerBar', b.actPerMin, b.actPerMax, SX_ACT_PER_MIN, SX_ACT_PER_MAX);
_sxBar('sxActCrdBar', b.actCardMin, b.actCardMax, SX_ACT_CARD_MIN, SX_ACT_CARD_MAX);
const ptg = document.getElementById('sxPunctTg');
if (ptg) ptg.classList.toggle('off', !b.punct);
const prow = document.getElementById('sxPunctRow');
if (prow) {
prow.setAttribute('aria-pressed', b.punct ? 'true' : 'false');
prow.classList.toggle('on', b.punct);
}
put('sxPunctSum', b.punct ? '已开启' : '关闭 · 固定空格');
const pchips = document.getElementById('sxPunctChips');
if (pchips) {
pchips.classList.toggle('dis', !b.punct);
$$('#sxPunctChips .sx-chip').forEach(el =>
el.classList.toggle('on', b.punctKeys.indexOf(el.dataset.pk) >= 0));
}
const keep = document.getElementById('sxKeepShow');
if (keep) keep.textContent = b.msgs.length + ' 条';
const sum = document.getElementById('sxIoSum');
if (sum) sum.textContent = b.msgs.length ? (b.msgs.length + ' 条 · 导出 / 导入 / 搜索') : '还没有记录';
const clr = document.getElementById('sxClear');
if (clr) clr.disabled = !b.msgs.length;
}
var SX_IO_APP = 'ordinal-shixun';
var SX_IO_NL = String.fromCharCode(10);
function _sxIoName(cid) {
const nm = (typeof chatPartnerNameOf === 'function' ? chatPartnerNameOf(cid) : '') || '';
return String(nm || 'TA');
}
function _sxIoSafe(s) {
const bad = '/\\:*?"<>|';
const src = String(s || '');
let out = '';
for (let i = 0; i < src.length; i++) {
const ch = src.charAt(i);
if (bad.indexOf(ch) < 0 && ch.charCodeAt(0) > 31) out += ch;
}
out = out.trim().slice(0, 20);
return out || '时讯';
}
function _sxIoFileName(cid, ext) {
const n = new Date();
const pad = v => (v < 10 ? '0' + v : String(v));
return '言字卡-时讯-' + _sxIoSafe(_sxIoName(cid)) + '-' + n.getFullYear() + pad(n.getMonth() + 1) + pad(n.getDate()) + '.' + ext;
}
function _sxIoStamp(ts) {
const d = new Date(Number(ts) || 0), p = x => (x < 10 ? '0' : '') + x;
return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}
function _sxIoDay(ts) {
const d = new Date(Number(ts) || 0);
return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
}
function sxIoTxtBody(cid) {
const b = sxBook(cid, true);
const arr = (b && b.msgs) || [];
const nm = _sxIoName(cid);
const lines = ['言字卡 · 时讯 · ' + nm,
'导出 ' + new Date().toLocaleString('zh-CN') + ' · 共 ' + arr.length + ' 条', ''];
let lastDay = '';
for (const m of arr) {
const dk = _sxIoDay(m.ts);
if (dk !== lastDay) { lines.push('—— ' + dk + ' ——'); lastDay = dk; }
const took = Number(m.took) > 0 ? ' · 用时 ' + _sxDur(m.took) : '';
lines.push(_sxIoStamp(m.ts) + ' ' + (m.from === 'me' ? '我' : 'TA') + '：' + String(m.text || '') + took);
}
return lines.join(SX_IO_NL);
}
function sxIoExport(kind) {
const cid = sxCid();
const b = cid ? sxBook(cid, true) : null;
const arr = (b && b.msgs) || [];
if (!arr.length) { if (typeof showToast === 'function') showToast('这一本还没有记录'); return; }
if (kind === 'txt') {
if (typeof saveBlobToDevice !== 'function') return;
saveBlobToDevice(new Blob([sxIoTxtBody(cid)], { type: 'text/plain;charset=utf-8' }), _sxIoFileName(cid, 'txt'));
if (typeof showToast === 'function') showToast('已导出 TXT · ' + arr.length + ' 条');
return;
}
let blob = null;
try {
blob = new Blob([JSON.stringify({
app: SX_IO_APP, v: 1, cid: cid, name: _sxIoName(cid),
exportedAt: Date.now(), count: arr.length, msgs: arr
})], { type: 'application/json' });
} catch (e) { if (typeof showToast === 'function') showToast('导出失败：这一本里有存不进文件的内容'); return; }
if (typeof offerSaveBlob === 'function') {
offerSaveBlob(blob, _sxIoFileName(cid, 'json'), {
title: '时讯记录已打包',
savedText: '已存好——去「文件」或下载列表里找这一本的备份'
});
}
}
function _sxIoSources(parsed) {
if (!parsed || typeof parsed !== 'object') return null;
if (parsed.app === SX_IO_APP && Array.isArray(parsed.msgs)) {
return [{ cid: String(parsed.cid || ''), name: String(parsed.name || ''), msgs: parsed.msgs, where: '这一本导出的' }];
}
if (Array.isArray(parsed.msgs)) {
return [{ cid: '', name: '', msgs: parsed.msgs, where: '一份只有记录的 JSON' }];
}
const wrap = (parsed.data && parsed.data.shixun) ? parsed.data : parsed;
const by = wrap && wrap.shixun && wrap.shixun.by;
if (by && typeof by === 'object' && !Array.isArray(by)) {
const out = [];
Object.keys(by).forEach(cid => {
const ms = by[cid] && by[cid].msgs;
if (!Array.isArray(ms) || !ms.length) return;
out.push({ cid: cid, name: _sxIoName(cid), msgs: ms, where: '整包备份里的一本时讯' });
});
if (out.length) return out;
}
return null;
}
function _sxIoKey(m) {
return String(m.from || '') + '\u001f' + String(Math.round(Number(m.ts) || 0)) + '\u001f' + String(m.text || '');
}
function _sxIoPlan(cid, incoming) {
const b = sxBook(cid, true);
if (!b) return null;
const ids = new Set(), keys = new Set();
b.msgs.forEach(m => {
if (!m) return;
if (m.id !== undefined && m.id !== null && m.id !== '') ids.add(String(m.id));
keys.add(_sxIoKey(m));
});
const items = [];
let dup = 0, bad = 0, renamed = 0;
for (const raw of (Array.isArray(incoming) ? incoming : [])) {
if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { bad++; continue; }
const from = raw.from === 'me' ? 'me' : (raw.from === 'partner' ? 'partner' : '');
const text = typeof raw.text === 'string' ? raw.text : '';
const ts = Number(raw.ts);
if (!from || !text || !isFinite(ts) || ts <= 0) { bad++; continue; }
const key = _sxIoKey({ from: from, ts: ts, text: text });
if (keys.has(key)) { dup++; continue; }
const one = { id: 0, from: from, text: text, ts: ts };
const took = Math.round(Number(raw.took));
if (isFinite(took) && took > 0) one.took = took;
if (raw.via === 'reply' || raw.via === 'active') one.via = raw.via;
const num = (typeof raw.id === 'number' && isFinite(raw.id)) ? raw.id : 0;
if (num && !ids.has(String(num))) one.id = num;
else { if (num) renamed++; one.id = nextId(); while (ids.has(String(one.id))) one.id = nextId(); }
ids.add(String(one.id)); keys.add(key);
items.push(one);
}
return { items: items, dup: dup, bad: bad, renamed: renamed, local: b.msgs.length };
}
function _sxIoApply(cid, plan) {
const b = sxBook(cid, true);
if (!b || !plan || !plan.items.length) return 0;
b.msgs = b.msgs.concat(plan.items).sort((x, y) => (Number(x.ts) || 0) - (Number(y.ts) || 0));
return plan.items.length;
}
var _sxPickTimer = 0, _sxPickClean = null;
function sxIoPick() {
const input = document.getElementById('sxIoFile');
if (!input) return;
let went = false;
const onAway = () => { went = true; };
const onVis = () => { if (document.hidden) went = true; };
try { window.addEventListener('blur', onAway); document.addEventListener('visibilitychange', onVis); } catch (e) {}
const clean = () => { try { window.removeEventListener('blur', onAway); document.removeEventListener('visibilitychange', onVis); } catch (e) {} };
_sxPickClean = clean;
try { input.click(); } catch (e) { clean(); _sxPickClean = null; if (typeof showToast === 'function') showToast('文件选择器起不来，换一个浏览器再试'); return; }
clearTimeout(_sxPickTimer);
_sxPickTimer = setTimeout(() => {
_sxPickTimer = 0;
clean(); _sxPickClean = null;
if (went) return;
if (typeof showToast === 'function') showToast('文件选择器没能弹出来：换 Safari／Chrome 打开本站，或先把文件存进「文件」App 再试', 6000);
}, 1600);
}
async function sxIoOnFile(e) {
const f = e.target.files && e.target.files[0];
e.target.value = '';
if (!f) return;
clearTimeout(_sxPickTimer); _sxPickTimer = 0;
if (_sxPickClean) { try { _sxPickClean(); } catch (err) {} _sxPickClean = null; }
let text = '';
try {
text = (typeof importPlain === 'function') ? await importPlain(f) : await f.text();
} catch (err) {
if (typeof showToast === 'function') showToast('这个文件读不到：先把它下载到本机（iCloud 里没下载的先下载）再选一次', 6000);
return;
}
let parsed = null;
try { parsed = JSON.parse(text); } catch (err) { if (typeof showToast === 'function') showToast('文件读不懂：请选「言字卡」导出的那份时讯记录文件'); return; }
finally { text = null; }
const cands = _sxIoSources(parsed);
if (!cands || !cands.length) { if (typeof showToast === 'function') showToast('这不是 言字卡 的时讯记录文件（里面没有记录）'); return; }
const cid = sxCid();
if (!cid) { if (typeof showToast === 'function') showToast('还没有联系人，先加一位再导入'); return; }
let one = cands.filter(x => x.cid && x.cid === cid)[0] || null;
if (!one) {
const nm = _sxIoName(cid);
const named = cands.filter(x => x.name && x.name === nm);
if (named.length === 1) one = named[0];
}
let guess = false;
if (!one && cands.length === 1) { one = cands[0]; guess = true; }
if (!one) { if (typeof showToast === 'function') showToast('这个文件里没有这位 TA 的时讯记录'); return; }
if (!Array.isArray(one.msgs) || !one.msgs.length) { if (typeof showToast === 'function') showToast('这个文件里没有时讯记录'); return; }
const plan = _sxIoPlan(cid, one.msgs);
if (!plan) { if (typeof showToast === 'function') showToast('这一本还没建起来，先发一句'); return; }
if (!plan.items.length) {
if (typeof showToast === 'function') {
showToast('没有新记录（' + plan.dup + ' 条都已在这一本里' + (plan.bad ? ' · 另有 ' + plan.bad + ' 条读不懂' : '') + '）');
}
return;
}
const curName = _sxIoName(cid);
const lines = [
'当前这一本：' + curName + ' · 现在 ' + plan.local + ' 条',
'文件里：' + (one.name || '未署名') + ' · ' + one.msgs.length + ' 条（' + one.where + '）',
'要并进去：新增 ' + plan.items.length + ' 条 · 重复跳过 ' + plan.dup + ' 条' + (plan.bad ? ' · 读不懂 ' + plan.bad + ' 条' : '') + (plan.renamed ? ' · 编号重复 ' + plan.renamed + ' 条（会自动换新号）' : ''),
'重复＝同一人、同一毫秒、同一句。导入只加不删，本地已有的一条不会被改掉。'
];
if (guess && one.name && one.name !== curName) {
lines.push('⚠ 文件写着「' + one.name + '」，你现在开的是「' + curName + '」——不是同一位就点取消。');
}
if (typeof openModal !== 'function') return;
openModal('导入时讯记录', '', () => {
const added = _sxIoApply(cid, plan);
_sxWin = SX_PAGE;
save();
if (sxCid() === cid) { _sxPaintSet(); _sxPaintList(true); sxBadge(); }
if (typeof showToast === 'function') showToast('已导入 ' + added + ' 条 · 跳过 ' + plan.dup + ' 条重复');
}, { noInput: true, okText: '导入 ' + plan.items.length + ' 条', staticText: lines.join(SX_IO_NL) });
}
function _sxFindMark(text, needle) {
const s = String(text || '');
const low = s.toLowerCase(), n = String(needle || '').toLowerCase();
if (!n) return escapeHTML(s);
let out = '', at = 0, guard = 0;
while (guard++ < 200) {
const k = low.indexOf(n, at);
if (k < 0) break;
out += escapeHTML(s.slice(at, k)) + '<mark>' + escapeHTML(s.slice(k, k + n.length)) + '</mark>';
at = k + n.length;
}
return out + escapeHTML(s.slice(at));
}
function _sxFindPaint(q) {
const box = document.getElementById('sxFindList');
if (!box) return;
const cid = sxCid();
const b = cid ? sxBook(cid, true) : null;
const msgs = (b && b.msgs) || [];
const needle = String(q || '').trim().toLowerCase();
if (!needle) {
box.innerHTML = '<p class="sx-find-none">这一本现在有 ' + msgs.length + ' 条记录。<br>输入一两个字，只在这一本里找。</p>';
return;
}
const hits = [];
for (let i = msgs.length - 1; i >= 0 && hits.length < 80; i--) {
const m = msgs[i];
if (!m || typeof m.text !== 'string' || !m.text) continue;
if (m.text.toLowerCase().indexOf(needle) < 0) continue;
hits.push({ i: i, m: m });
}
if (!hits.length) {
box.innerHTML = '<p class="sx-find-none">这一本里没有「' + escapeHTML(String(q || '').trim()) + '」。</p>';
return;
}
box.innerHTML = hits.map(h => '<button type="button" class="sx-find-row" data-sx-find="' + h.i + '">'
+ '<span class="sx-find-meta">' + escapeHTML(_sxWhen(h.m.ts)) + ' · ' + (h.m.from === 'me' ? '我' : 'TA') + '</span>'
+ '<span class="sx-find-tx">' + _sxFindMark(h.m.text, needle) + '</span></button>').join('');
}
function _sxFindOpen() {
const m = document.getElementById('sxFindMask');
if (!m) return;
const q = document.getElementById('sxFindInput');
if (q) q.value = '';
_sxFindPaint('');
m.hidden = false;
setTimeout(() => { try { if (q) q.focus(); } catch (e) {} }, 30);
}
function _sxFindClose() { const m = document.getElementById('sxFindMask'); if (m) m.hidden = true; }
function _sxJumpTo(i) {
const cid = sxCid();
const b = cid ? sxBook(cid, true) : null;
if (!b || !b.msgs[i]) return;
const start = Math.max(0, b.msgs.length - Math.max(_sxWin, SX_PAGE));
if (i < start) _sxWin = b.msgs.length - i + 30;
_sxFindClose();
_sxCloseSet();
_sxPaintList(false);
const list = document.getElementById('sxList');
const id = String(b.msgs[i].id);
const el = list ? list.querySelector('[data-sx-id="' + id.replace(/"/g, '') + '"]') : null;
if (!el) { if (typeof showToast === 'function') showToast('那一条已经不在这一本里了'); return; }
try { el.scrollIntoView({ block: 'center' }); }
catch (e) { list.scrollTop = Math.max(0, el.offsetTop - 80); }
el.classList.add('hit');
setTimeout(() => { try { el.classList.remove('hit'); } catch (e2) {} }, 1800);
}
function renderShiXun() {
const view = document.getElementById('shixunView');
if (!view) return;
_sxCloseSet();
_sxFindClose();
_sxWin = SX_PAGE;
sxApplyStyle();
sxApplyRad();
const cid = sxCid();
const list = document.getElementById('sxList');
const input = document.getElementById('sxInput');
const send = document.getElementById('sxSend');
if (!cid) {
_sxPaintHead('');
_sxThemeSet('white');
_sxNew = 0;
_sxSyncNew();
if (list) {
list.classList.add('is-empty');
list.innerHTML = '<div class="sx-empty"><em>SHIXUN</em><b>还没有联系人</b><span>时讯是跟某一位 TA 的一本慢一点的聊天。<br>先去聊天页加一位联系人，再回来。</span></div>';
}
if (input) { input.value = ''; input.disabled = true; }
_sxSyncSend();
sxBadge();
return;
}
const b = sxEnsure(cid);
if (!b) return;
if (b.unread) { b.unread = 0; save(); }
_sxThemeSet(b.theme);
_sxPaintHead(cid);
if (input) input.disabled = false;
_sxPaintList(true);
_sxSyncSend();
_sxPaintSet();
sxBadge();
}
function sxSend() {
const cid = sxCid();
if (!cid) return;
const el = document.getElementById('sxInput');
if (!el) return;
const text = String(el.value || '').trim();
if (!text) return;
const b = sxEnsure(cid);
if (!b) return;
const now = Date.now();
b.msgs.push({ id: nextId(), from: 'me', text: text, ts: now });
el.value = '';
_sxSyncSend();
if (!b.replyAt || b.replyAt <= now) { b.replyFrom = now; b.replyAt = now + sxGap(); }
if (b.active && !b.nextAt) { b.nextFrom = now; b.nextAt = now + sxGap(); }
save();
_sxPaintList(true);
}
var _sxSetTab = 'look';
function sxSetTabSet(k) {
const list = ['look', 'reply', 'active', 'keep'];
const key = list.indexOf(k) >= 0 ? k : 'look';
_sxSetTab = key;
const tabs = document.getElementById('sxSetTabs');
if (tabs) {
Array.prototype.forEach.call(tabs.querySelectorAll('[data-sx-set]'), b => {
const on = b.getAttribute('data-sx-set') === key;
b.setAttribute('aria-selected', on ? 'true' : 'false');
});
}
Array.prototype.forEach.call(document.querySelectorAll('#sxSetMask [data-sx-pane]'), p => {
p.hidden = p.getAttribute('data-sx-pane') !== key;
});
const body = document.querySelector('#sxSetMask .fs-sheet-body');
if (body) body.scrollTop = 0;
}
function _sxOpenSet() {
_sxPaintSet();
sxSetTabSet(_sxSetTab);
const m = document.getElementById('sxSetMask');
if (m) m.hidden = false;
}
function _sxCloseSet() { const m = document.getElementById('sxSetMask'); if (m) m.hidden = true; }
function _sxThemeSet(th) {
if (SX_THEMES.indexOf(th) < 0) th = 'white';
if (document.body) {
document.body.dataset.sxTheme = th;
if (th === 'custom') _sxPaintCustom(); else _sxClearCustom();
}
const view = document.getElementById('shixunView');
if (view) view.dataset.sxTheme = th;
}
function _sxHex(v) { return /^#[0-9a-fA-F]{6}$/.test(v || '') ? v.toLowerCase() : ''; }
function _sxBytes(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function _sxLin(c) { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }
function _sxLum(h) { const p = _sxBytes(h); return .2126 * _sxLin(p[0]) + .7152 * _sxLin(p[1]) + .0722 * _sxLin(p[2]); }
function _sxCtr(a, b) { const x = _sxLum(a) + .05, y = _sxLum(b) + .05; return x > y ? x / y : y / x; }
function _sxInkOn(bg) { return _sxCtr(bg, '#1b1b1b') >= _sxCtr(bg, '#ffffff') ? '#1b1b1b' : '#ffffff'; }
function _sxMix(a, b, t) {
const A = _sxBytes(a), B = _sxBytes(b);
const p = i => Math.round(A[i] * t + B[i] * (1 - t)).toString(16);
return '#' + [0, 1, 2].map(i => { const s = p(i); return s.length < 2 ? '0' + s : s; }).join('');
}
function _sxAlpha(hex, a) { const p = _sxBytes(hex); return 'rgba(' + p.join(',') + ',' + a + ')'; }
function _sxSetVar(k, v) { try { document.body.style.setProperty(k, v); } catch (e) {} }
function _sxCustomColors() {
const cid = (typeof sxCid === 'function') ? sxCid() : '';
const b = cid ? sxBook(cid, true) : null;
const c = (b && b.custom && typeof b.custom === 'object') ? b.custom : {};
return {
bg: _sxHex(c.bg) || SX_CST_DEF.bg,
taBg: _sxHex(c.taBg) || SX_CST_DEF.taBg,
meBg: _sxHex(c.meBg) || SX_CST_DEF.meBg,
ink: _sxHex(c.ink)
};
}
function _sxPaintCustom() {
const c = _sxCustomColors();
const ink = c.ink || _sxInkOn(c.bg);
const taInk = _sxInkOn(c.taBg), meInk = _sxInkOn(c.meBg);
_sxSetVar('--sx-bg', c.bg);
_sxSetVar('--sx-ta-bg', c.taBg);
_sxSetVar('--sx-me-bg', c.meBg);
_sxSetVar('--sx-ink', ink);
_sxSetVar('--sx-ta-ink', taInk);
_sxSetVar('--sx-me-ink', meInk);
_sxSetVar('--sx-sub', _sxMix(ink, c.bg, .5));
_sxSetVar('--sx-in-bg', c.taBg);
_sxSetVar('--sx-ta-line', _sxAlpha(taInk, .12));
_sxSetVar('--sx-me-line', _sxAlpha(meInk, .10));
_sxSetVar('--sx-hair', _sxAlpha(ink, .10));
_sxSetVar('--sx-well', _sxAlpha(ink, .045));
_sxSetVar('--sx-paper', c.bg);
}
function _sxClearCustom() { if (document.body) SX_CST_VARS.forEach(k => { try { document.body.style.removeProperty(k); } catch (e) {} }); }
function _sxCstPaintRow() {
const cid = sxCid();
const b = cid ? sxBook(cid, true) : null;
const on = !!(b && b.theme === 'custom');
const row = document.getElementById('sxCustomRow');
if (row) row.hidden = !on;
const c = _sxCustomColors();
const put = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
put('sxCstBg', c.bg);
put('sxCstTa', c.taBg);
put('sxCstMe', c.meBg);
put('sxCstInk', c.ink || _sxInkOn(c.bg));
const tag = document.getElementById('sxCstInkTag');
if (tag) tag.textContent = c.ink ? '手动' : '跟底色自动';
const back = document.getElementById('sxCstInkAuto');
if (back) back.hidden = !c.ink;
_sxPalPaint();
_sxPvPaint();
}
function _sxPalMatch() {
const c = _sxCustomColors();
const eq = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();
for (let i = 0; i < SX_PALETTES.length; i++) {
const p = SX_PALETTES[i];
if (eq(c.bg, p.bg) && eq(c.taBg, p.ta) && eq(c.meBg, p.me)) return p;
}
return null;
}
function _sxPalBuild() {
const box = document.getElementById('sxCstPal');
if (!box || box.children.length) return;
box.innerHTML = SX_PALETTES.map(p =>
'<button type="button" class="sx-pal-b" data-sx-pal="' + p.k + '" aria-pressed="false" title="' + p.name + '">' +
'<span class="sx-pal-dot" style="--sw-bg:' + p.bg + ';--sw-ta:' + p.ta + ';--sw-me:' + p.me + '"></span>' +
'<span>' + p.name + '</span>' +
'</button>').join('');
}
function _sxPalPaint() {
const box = document.getElementById('sxCstPal');
if (!box) return;
const hit = _sxPalMatch();
Array.prototype.forEach.call(box.querySelectorAll('[data-sx-pal]'), el => {
const on = !!hit && el.getAttribute('data-sx-pal') === hit.k;
el.classList.toggle('on', on);
el.setAttribute('aria-pressed', on ? 'true' : 'false');
});
}
function _sxPalApply(k) {
const p = SX_PALETTES.filter(x => x.k === k)[0];
if (!p) return;
const cid = sxCid();
const b = cid ? sxBook(cid, true) : null;
if (!b) return;
b.custom = { bg: p.bg, taBg: p.ta, meBg: p.me };
if (p.ink) b.custom.ink = p.ink;
b.theme = 'custom';
_sxThemeSet('custom');
save();
_sxPaintSet();
}
function _sxCstApply(persist, src) {
const cid = sxCid();
const b = cid ? sxBook(cid, true) : null;
if (!b) return;
const read = id => _sxHex((document.getElementById(id) || {}).value);
const bg = read('sxCstBg'), taBg = read('sxCstTa'), meBg = read('sxCstMe'), ink = read('sxCstInk');
if (bg || taBg || meBg || ink) {
if (!b.custom || typeof b.custom !== 'object') b.custom = {};
if (bg) b.custom.bg = bg;
if (taBg) b.custom.taBg = taBg;
if (meBg) b.custom.meBg = meBg;
if (src === 'ink' && ink) b.custom.ink = ink;
}
_sxThemeSet('custom');
_sxCstPaintRow();
if (persist && typeof save === 'function') save();
}
function _sxCstInkReset() {
const cid = sxCid();
const b = cid ? sxBook(cid, true) : null;
if (!b) return;
if (b.custom && typeof b.custom === 'object' && 'ink' in b.custom) delete b.custom.ink;
_sxThemeSet('custom');
_sxCstPaintRow();
if (typeof save === 'function') save();
}
var SX_STYLES = ['slip', 'bubble'];
function sxStyleView() {
if (typeof data === 'undefined' || !data || !data.shixun || typeof data.shixun !== 'object') return 'slip';
return data.shixun.style === 'bubble' ? 'bubble' : 'slip';
}
function sxApplyStyle() {
const view = document.getElementById('shixunView');
const k = sxStyleView();
if (view) view.classList.toggle('sx-slip', k === 'slip');
const row = document.getElementById('sxStyleRow');
if (row) {
const bs = row.querySelectorAll('[data-sx-style]');
for (let i = 0; i < bs.length; i++) {
const on = bs[i].getAttribute('data-sx-style') === k;
bs[i].classList.toggle('on', on);
bs[i].setAttribute('aria-pressed', on ? 'true' : 'false');
}
}
_sxPvPaint();
}
function sxStyleSet(k) {
if (typeof data === 'undefined' || !data) return;
if (!data.shixun || typeof data.shixun !== 'object' || Array.isArray(data.shixun)) data.shixun = { by: {} };
const next = k === 'bubble' ? 'bubble' : 'slip';
if (sxStyleView() === next) { sxApplyStyle(); return; }
data.shixun.style = next;
sxApplyStyle();
try { if (typeof save === 'function') save(); } catch (e) {}
_sxPaintSet();
}
function sxRadView() {
if (typeof data === 'undefined' || !data || !data.shixun || typeof data.shixun !== 'object') return 'soft';
return SX_RADS.indexOf(data.shixun.rad) >= 0 ? data.shixun.rad : 'soft';
}
function sxApplyRad() {
const k = sxRadView();
if (document.body) document.body.dataset.sxRad = k;
const row = document.getElementById('sxRadRow');
if (row) {
Array.prototype.forEach.call(row.querySelectorAll('[data-sx-rad]'), el => {
const on = el.getAttribute('data-sx-rad') === k;
el.classList.toggle('on', on);
el.setAttribute('aria-pressed', on ? 'true' : 'false');
});
}
_sxPvPaint();
}
function sxRadSet(k) {
if (typeof data === 'undefined' || !data) return;
if (!data.shixun || typeof data.shixun !== 'object' || Array.isArray(data.shixun)) data.shixun = { by: {} };
const next = SX_RADS.indexOf(k) >= 0 ? k : 'soft';
if (sxRadView() === next) { sxApplyRad(); return; }
data.shixun.rad = next;
sxApplyRad();
try { if (typeof save === 'function') save(); } catch (e) {}
}
function _sxPvPaint() {
const pv = document.getElementById('sxPv');
if (!pv) return;
const st = sxStyleView(), rd = sxRadView();
pv.classList.toggle('slip', st === 'slip');
const note = document.getElementById('sxPvNote');
if (note) {
let th = '素白';
const cid = (typeof sxCid === 'function') ? sxCid() : '';
const b = cid ? sxBook(cid, false) : null;
const cur = b ? b.theme : 'white';
if (cur === 'custom') { const p = _sxPalMatch(); th = p ? p.name : '自定义'; }
else th = SX_THEME_NAME[cur] || '素白';
note.textContent = (st === 'slip' ? '纸笺' : '气泡') + ' · ' + th + ' · ' + SX_RAD_NAME[rd] + '角';
}
}
(function sxBind() {
const input = document.getElementById('sxInput');
const send = document.getElementById('sxSend');
const setBtn = document.getElementById('sxSetBtn');
const setMask = document.getElementById('sxSetMask');
let composing = false;
if (input) {
input.addEventListener('input', _sxSyncSend);
input.addEventListener('compositionstart', () => { composing = true; });
input.addEventListener('compositionend', () => { composing = false; });
input.addEventListener('keydown', e => {
if (e.key !== 'Enter' || e.isComposing || composing || e.shiftKey) return;
e.preventDefault();
sxSend();
});
}
if (send) send.addEventListener('click', sxSend);
const listEl = document.getElementById('sxList');
if (listEl) {
listEl.addEventListener('scroll', () => {
if (!_sxNew) return;
if (listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight < 90) { _sxNew = 0; _sxSyncNew(); }
}, { passive: true });
listEl.addEventListener('click', e => {
const go = e.target.closest && e.target.closest('[data-sx-cards]');
if (go && typeof showView === 'function') { showView('cards'); return; }
const more = e.target.closest && e.target.closest('[data-sx-more]');
if (more) _sxMore();
});
}
const newBtn = document.getElementById('sxNew');
if (newBtn) newBtn.addEventListener('click', () => {
_sxNew = 0;
_sxSyncNew();
const l = document.getElementById('sxList');
if (l) l.scrollTop = l.scrollHeight;
});
const backBtn = document.getElementById('sxBack');
if (backBtn) backBtn.addEventListener('click', () => {
const bb = document.getElementById('backChatsBtn');
const to = (bb && bb.dataset.view) || 'more';
if (typeof showView === 'function') showView(to);
});
const whoBtn = document.getElementById('sxWho');
if (whoBtn) whoBtn.addEventListener('click', _sxOpenWho);
const whoClose = document.getElementById('sxWhoClose');
if (whoClose) whoClose.addEventListener('click', _sxCloseWho);
const whoMask = document.getElementById('sxWhoMask');
if (whoMask) whoMask.addEventListener('click', e => { if (e.target === whoMask) _sxCloseWho(); });
const people = document.getElementById('sxPeople');
if (people) people.addEventListener('click', e => {
const row = e.target.closest && e.target.closest('.sx-p');
if (row) sxSwitchTo(row.getAttribute('data-sx-cid'));
});
const whoMate = document.getElementById('sxWhoMate');
if (whoMate) whoMate.addEventListener('click', () => {
_sxCloseWho();
if (typeof showView === 'function') showView('mate');
});
if (setBtn) setBtn.addEventListener('click', _sxOpenSet);
const closeBtn = document.getElementById('sxSetClose');
if (closeBtn) closeBtn.addEventListener('click', _sxCloseSet);
if (setMask) setMask.addEventListener('click', e => { if (e.target === setMask) _sxCloseSet(); });
const ioHd = document.getElementById('sxIoHd');
const ioBd = document.getElementById('sxIoBd');
if (ioHd && ioBd) ioHd.addEventListener('click', () => {
const next = ioBd.hidden;
ioBd.hidden = !next;
ioHd.setAttribute('aria-expanded', next ? 'true' : 'false');
});
const ioJson = document.getElementById('sxIoJson'); if (ioJson) ioJson.addEventListener('click', () => sxIoExport('json'));
const ioTxt = document.getElementById('sxIoTxt'); if (ioTxt) ioTxt.addEventListener('click', () => sxIoExport('txt'));
const ioImp = document.getElementById('sxIoImport'); if (ioImp) ioImp.addEventListener('click', sxIoPick);
const ioFile = document.getElementById('sxIoFile'); if (ioFile) ioFile.addEventListener('change', sxIoOnFile);
const ioSearch = document.getElementById('sxIoSearch'); if (ioSearch) ioSearch.addEventListener('click', _sxFindOpen);
const findClose = document.getElementById('sxFindClose');
if (findClose) findClose.addEventListener('click', _sxFindClose);
const findMask = document.getElementById('sxFindMask');
if (findMask) findMask.addEventListener('click', e => { if (e.target === findMask) _sxFindClose(); });
const findIn = document.getElementById('sxFindInput');
if (findIn) findIn.addEventListener('input', () => _sxFindPaint(findIn.value));
const findList = document.getElementById('sxFindList');
if (findList) findList.addEventListener('click', e => {
const row = e.target.closest && e.target.closest('[data-sx-find]');
if (row) _sxJumpTo(Number(row.getAttribute('data-sx-find')));
});
const setTabs = document.getElementById('sxSetTabs');
if (setTabs) setTabs.addEventListener('click', e => {
const b = e.target.closest && e.target.closest('[data-sx-set]');
if (b) sxSetTabSet(b.getAttribute('data-sx-set'));
});
const chips = document.getElementById('sxThemeChips');
if (chips) chips.addEventListener('click', e => {
const btn = e.target.closest('.sx-chip');
if (!btn) return;
const cid = sxCid();
const b = sxBook(cid, true);
if (!b) return;
const th = btn.dataset.sxTheme;
if (SX_THEMES.indexOf(th) < 0 || b.theme === th) return;
b.theme = th;
_sxThemeSet(th);
save();
_sxPaintSet();
});
const styleRow = document.getElementById('sxStyleRow');
if (styleRow) styleRow.addEventListener('click', e => {
const btn = e.target.closest && e.target.closest('[data-sx-style]');
if (btn) sxStyleSet(btn.getAttribute('data-sx-style'));
});
[['sxCstBg', 'bg'], ['sxCstTa', 'ta'], ['sxCstMe', 'me'], ['sxCstInk', 'ink']].forEach(a => {
const el = document.getElementById(a[0]);
if (!el) return;
el.addEventListener('input', () => _sxCstApply(false, a[1]));
el.addEventListener('change', () => _sxCstApply(true, a[1]));
});
const inkAuto = document.getElementById('sxCstInkAuto');
if (inkAuto) inkAuto.addEventListener('click', _sxCstInkReset);
_sxPalBuild();
const pal = document.getElementById('sxCstPal');
if (pal) pal.addEventListener('click', e => {
const btn = e.target.closest && e.target.closest('[data-sx-pal]');
if (btn) _sxPalApply(btn.getAttribute('data-sx-pal'));
});
const radRow = document.getElementById('sxRadRow');
if (radRow) radRow.addEventListener('click', e => {
const btn = e.target.closest && e.target.closest('[data-sx-rad]');
if (btn) sxRadSet(btn.getAttribute('data-sx-rad'));
});
function bump(which, delta) {
const cid = sxCid();
const b = sxBook(cid, true);
if (!b) return;
if (which === 'perMin') {
b.perMin = _sxInt(b.perMin + delta, SX_PER_MIN, SX_PER_MAX, b.perMin);
if (b.perMin > b.perMax) b.perMax = b.perMin;
} else if (which === 'perMax') {
b.perMax = _sxInt(b.perMax + delta, SX_PER_MIN, SX_PER_MAX, b.perMax);
if (b.perMax < b.perMin) b.perMin = b.perMax;
} else if (which === 'cardMin') {
b.cardMin = _sxInt(b.cardMin + delta, SX_CARD_MIN, SX_CARD_MAX, b.cardMin);
if (b.cardMin > b.cardMax) b.cardMax = b.cardMin;
} else if (which === 'cardMax') {
b.cardMax = _sxInt(b.cardMax + delta, SX_CARD_MIN, SX_CARD_MAX, b.cardMax);
if (b.cardMax < b.cardMin) b.cardMin = b.cardMax;
} else if (which === 'actPerMin') {
b.actPerMin = _sxInt(b.actPerMin + delta, SX_ACT_PER_MIN, SX_ACT_PER_MAX, b.actPerMin);
if (b.actPerMin > b.actPerMax) b.actPerMax = b.actPerMin;
} else if (which === 'actPerMax') {
b.actPerMax = _sxInt(b.actPerMax + delta, SX_ACT_PER_MIN, SX_ACT_PER_MAX, b.actPerMax);
if (b.actPerMax < b.actPerMin) b.actPerMin = b.actPerMax;
} else if (which === 'actCardMin') {
b.actCardMin = _sxInt(b.actCardMin + delta, SX_ACT_CARD_MIN, SX_ACT_CARD_MAX, b.actCardMin);
if (b.actCardMin > b.actCardMax) b.actCardMax = b.actCardMin;
} else {
b.actCardMax = _sxInt(b.actCardMax + delta, SX_ACT_CARD_MIN, SX_ACT_CARD_MAX, b.actCardMax);
if (b.actCardMax < b.actCardMin) b.actCardMin = b.actCardMax;
}
save();
_sxPaintSet();
}
[['sxPerLoCut', 'perMin', -1], ['sxPerLoAdd', 'perMin', 1], ['sxPerHiCut', 'perMax', -1], ['sxPerHiAdd', 'perMax', 1],
['sxCrdLoCut', 'cardMin', -1], ['sxCrdLoAdd', 'cardMin', 1], ['sxCrdHiCut', 'cardMax', -1], ['sxCrdHiAdd', 'cardMax', 1],
['sxActPerLoCut', 'actPerMin', -1], ['sxActPerLoAdd', 'actPerMin', 1], ['sxActPerHiCut', 'actPerMax', -1], ['sxActPerHiAdd', 'actPerMax', 1],
['sxActCrdLoCut', 'actCardMin', -1], ['sxActCrdLoAdd', 'actCardMin', 1], ['sxActCrdHiCut', 'actCardMax', -1], ['sxActCrdHiAdd', 'actCardMax', 1]].forEach(a => {
const el = document.getElementById(a[0]);
if (el) el.addEventListener('click', () => bump(a[1], a[2]));
});
const actRow = document.getElementById('sxActRow');
if (actRow) actRow.addEventListener('click', () => {
const b = sxBook(sxCid(), true);
if (!b) return;
b.active = !b.active;
if (b.active) {
if (!b.nextAt) { b.nextFrom = Date.now(); b.nextAt = b.nextFrom + sxGap(); }
} else {
b.nextAt = 0;
b.nextFrom = 0;
}
save();
_sxPaintSet();
_sxPaintList(false);
if (typeof showToast === 'function') {
showToast(b.active ? '已开启：TA 会在 1 秒 ~ 24 小时里的某一刻自己发来' : '已关闭：TA 不会自己发时讯');
}
});
const pRow = document.getElementById('sxPunctRow');
if (pRow) pRow.addEventListener('click', () => {
const b = sxBook(sxCid(), true);
if (!b) return;
b.punct = !b.punct;
save();
_sxPaintSet();
if (typeof showToast === 'function') {
showToast(b.punct ? '已开启：每两张字卡中间随机抽一枚符号连接' : '已关闭：字卡之间固定用空格');
}
});
const pChips = document.getElementById('sxPunctChips');
if (pChips) pChips.addEventListener('click', e => {
const ch = e.target.closest('.sx-chip');
if (!ch) return;
const k = ch.dataset.pk;
if (!k || SX_PUNCT_KEYS.indexOf(k) < 0) return;
const b = sxBook(sxCid(), true);
if (!b) return;
if (b.punctKeys.indexOf(k) >= 0) {
if (b.punctKeys.length <= 1) { if (typeof showToast === 'function') showToast('至少保留一个拼接符号'); return; }
b.punctKeys = b.punctKeys.filter(x => x !== k);
} else {
b.punctKeys = SX_PUNCT_KEYS.filter(x => b.punctKeys.indexOf(x) >= 0 || x === k);
}
save();
_sxPaintSet();
});
const clr = document.getElementById('sxClear');
if (clr) clr.addEventListener('click', () => {
const b = sxBook(sxCid(), true);
if (!b || !b.msgs.length) { if (typeof showToast === 'function') showToast('这一本还没有记录'); return; }
if (typeof openModal !== 'function') return;
const n = b.msgs.length;
openModal('清空聊天记录', '', () => {
const bb = sxBook(sxCid(), true);
if (!bb) return;
bb.msgs = [];
bb.replyAt = 0;
bb.replyFrom = 0;
bb.unread = 0;
_sxNew = 0;
_sxWin = SX_PAGE;
if (bb.active && !bb.nextAt) { bb.nextFrom = Date.now(); bb.nextAt = bb.nextFrom + sxGap(); }
save();
_sxPaintSet();
_sxPaintList(true);
sxBadge();
if (typeof showToast === 'function') showToast('这一本已清空');
}, {
noInput: true, danger: true, okText: '确认清空',
staticText: '只删掉这一本慢聊天里的 ' + n + ' 条记录——这位 TA、字卡库、主题与上面那几组区间都不动。还没到的那一发回话也一并取消；TA 自己开口的钟照旧。清空后找不回来。'
});
});
if (document.body && typeof MutationObserver === 'function') {
try {
new MutationObserver(() => {
if (document.body.dataset.view === 'shixun') return;
_sxFlushNew();
_sxCloseSet();
_sxCloseWho();
_sxFindClose();
try { delete document.body.dataset.sxTheme; } catch (e) {}
try { delete document.body.dataset.sxRad; } catch (e) {}
_sxClearCustom();
}).observe(document.body, { attributes: true, attributeFilter: ['data-view'] });
} catch (e) {}
}
})();
var _sxStarted = false, _sxTries = 0;
function sxBoot() {
if (_sxStarted) return;
if (typeof data === 'undefined' || !data) {
if (++_sxTries < 40) setTimeout(sxBoot, 500);
return;
}
_sxStarted = true;
const cid = sxCid();
if (cid) {
const b = sxBook(cid, true);
if (b && b.active && !b.nextAt) { b.nextFrom = Date.now(); b.nextAt = b.nextFrom + sxGap(); save(); }
}
sxBadge();
sxTick();
setInterval(() => { if (document.hidden) return; sxTick(); }, 15000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) sxTick(); });
}
document.addEventListener('ordinal-data-ready', () => { _sxTries = 0; setTimeout(sxBoot, 0); });
window.addEventListener('load', () => setTimeout(sxBoot, 1200));
sxBoot();
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['shixun'] = true;
