// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var XN_LIB_CATS = ['主字卡', '颜文字', 'emoji', '表情包', '图片', '拍一拍', '语音'];
var XN_CATS = ['公用字卡', '专属字卡', '牌面图鉴', '聊天情绪', '逻辑连接词'];
var XN_REPLY_MIN = 1;
var XN_REPLY_MAX = 10;
var XN_REPLY_DEF = { mode: 'random', min: 1, max: 3 };
var XN_WISH_VIEWS = [
{ k: 'want',  t: '想收到',     cap: '他从你这儿想听到的', own: true },
{ k: 'model', t: '以为你会说', cap: '他印象里你会说的那句', own: true },
{ k: 'say',   t: '想说',       cap: '他手上还没递给你的',   own: false },
{ k: 'sent',  t: '实际发出',   cap: '他这一场真的递出来的', own: false }
];
var _xnInited = false;
var _xnCid = '';
var _xnPool = [];
var _xnFull = [];
var _xnHand = [];
var _xnHis = [];
var _xnSeq = [];
var _xnRetracted = [];
var _xnBusy = false;
var _xnWishView = 'want';
var _xnWish = [];
var _xnWishCache = { want: null, model: null, say: null, sent: null };
var _xnAudio = null;
var _xnFilterCat = '';
var _xnFilterGrp = '';
var _xnGrpPick = [];
var _xnGrpQ = '';
var _xnQuery = '';
var _xnPicked = [];
var _xnDrawerOpen = false;
var _xnSid = '';
var _xnSessionAt = 0;
var _xnPanelFolded = false;
var _xnBookTab = 'all';
var _xnSetTab = 'mode';
var _xnPinned = true;
var _xnSnapTop = 0;
function xn$(id) { return document.getElementById(id); }
function xnEsc(s) {
return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function xnSetWho() {
const el = xn$('xnWho');
if (!el) return;
let nm = '';
try { nm = (typeof chatPartnerNameOf === 'function') ? chatPartnerNameOf(_xnCid) : ''; } catch (e) {}
el.textContent = nm ? ' · ' + nm : '';
}
function xnTaWord() {
return (typeof taWordOf === 'function') ? taWordOf(_xnCid) : 'TA';
}
function xnTaPhrase(s) {
const w = xnTaWord();
return w === 'TA' ? w + ' ' + s : w + s;
}
function xnTaFitText(s) {
let t = (typeof taFit === 'function') ? taFit(s, _xnCid) : String(s == null ? '' : s);
if (/^TA[^\s]/.test(t)) t = 'TA ' + t.slice(2);
return t;
}
function xnPeople() {
const cs = (typeof data !== 'undefined' && data && data.contacts) || [];
return cs.filter(c => c && c.id && c.kind !== 'group');
}
function xnSwitchOpen() {
const pop = xn$('xnSwitch'), mask = xn$('xnSwitchMask'), btn = xn$('xnSwitchBtn');
if (!pop || !btn) return;
if (xnPeople().length < 2) { xnCloseSwitcher(); return; }
xnRenderSwitchList();
pop.hidden = false;
if (mask) mask.hidden = false;
btn.setAttribute('aria-expanded', 'true');
btn.classList.add('on');
const cur = pop.querySelector('.xn-srow.on');
if (cur && cur.scrollIntoView) {
try { cur.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {}
}
}
function xnCloseSwitcher() {
const pop = xn$('xnSwitch'), mask = xn$('xnSwitchMask'), btn = xn$('xnSwitchBtn');
if (pop) pop.hidden = true;
if (mask) mask.hidden = true;
if (btn) {
btn.setAttribute('aria-expanded', 'false');
btn.classList.remove('on');
}
}
function xnToggleSwitcher() {
const pop = xn$('xnSwitch');
if (pop && !pop.hidden) xnCloseSwitcher(); else xnSwitchOpen();
}
function xnRenderSwitchList() {
const list = xn$('xnSwitchList');
if (!list) return;
list.innerHTML = xnPeople().map(c => {
const nm = (typeof chatNameOf === 'function' ? chatNameOf(c) : '') || (typeof fixedNameOf === 'function' ? fixedNameOf(c) : '') || 'TA';
const av = (typeof chatAvatarOf === 'function' ? chatAvatarOf(c) : '') || '';
const on = c.id === _xnCid;
return '<button type="button" class="xn-srow' + (on ? ' on' : '') + '" role="option" aria-selected="' + (on ? 'true' : 'false') +
'" data-xn-cid="' + xnEsc(c.id) + '">' +
'<span class="avatar">' + avatarHTML(av) + '</span>' +
'<span class="xn-srow-name">' + xnEsc(nm) + '</span>' +
(on ? '<svg class="xn-srow-tick" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.8l5 5 10-11"/></svg>' : '') +
'</button>';
}).join('');
}
function xnRenderSwitcher() {
const btn = xn$('xnSwitchBtn');
const many = xnPeople().length > 1;
if (btn) {
btn.hidden = !many;
btn.style.display = many ? '' : 'none';
if (!many) xnCloseSwitcher();
}
const pop = xn$('xnSwitch');
if (many && pop && !pop.hidden) xnRenderSwitchList();
}
function xnSwitchCid(cid) {
if (!cid || cid === _xnCid) return;
const c = (data.contacts || []).find(x => x && x.id === cid);
if (!c || c.kind === 'group') return;
_xnCid = cid;
_xnPool = xnAllPool(cid);
_xnFull = xnAllowedPool(cid);
_xnHis = _xnFull.filter(x => !x.off);
_xnFilterCat = '';
_xnFilterGrp = '';
_xnQuery = '';
_xnPicked = [];
_xnWishView = 'want';
_xnWishCache = { want: null, model: null, say: null, sent: null };
try { if (_xnAudio) { _xnAudio.pause(); _xnAudio = null; } } catch (e) {}
xnCloseDrawer();
xnCloseQDrawer();
xnCloseAlbum();
xnCloseLook();
xnCloseSwitcher();
xnCardViewClose();
xnSetWho();
xnReplyCfgPaint();
xnRenderSwitcher();
xnRenderWishChips();
xnReset();
xnRestoreLast();
}
function xnLibPool(cid) {
const id = cid || ((typeof mainChatId === 'function' && mainChatId()) || (data && data.activeChat) || '');
const out = [], seen = {};
(data.groups || []).forEach(g => {
if (!g || g.preset || g.system) return;
const cat = g.category || '主字卡';
if (XN_LIB_CATS.indexOf(cat) < 0) return;
if (typeof groupUsableFor === 'function' && !groupUsableFor(g, id)) return;
const scopeCat = ((typeof cardScope === 'function' ? cardScope(g) : (g.scope === 'public' ? 'public' : 'own')) === 'public')
? '公用字卡' : '专属字卡';
const grp = g.name || cat;
(g.cards || []).forEach(c => {
const off = (typeof cardIsOff === 'function') ? !!cardIsOff(g, c) : false;
const img = (typeof cardImage === 'function') ? cardImage(c) : null;
if (img) {
const key = grp + '\u0001' + 'i|' + img.length + ':' + img.slice(0, 16) + ':' + img.slice(-8);
if (seen[key]) return;
seen[key] = 1;
out.push({ kind: 'img', img: img, src: grp, grp: grp, cat: cat, scopeCat: scopeCat, off: off, srcKind: 'lib' });
return;
}
if (cat === '表情包' || cat === '图片') return;
const v = (typeof voiceCardParts === 'function') ? voiceCardParts(c) : null;
if (v) {
const key = grp + '\u0001' + 'v|' + (v.name || '') + '|' + (v.tts || '') + '|' + String(v.data || '').length;
if (seen[key]) return;
seen[key] = 1;
out.push({ kind: 'voice', t: v.name || v.text || '语音', voice: v, src: grp, grp: grp, cat: cat, scopeCat: scopeCat, off: off, srcKind: 'lib' });
return;
}
if (cat === '语音') return;
const t = (typeof cardText === 'function') ? cardText(c)
: (typeof c === 'string' ? c : (c && typeof c.text === 'string' ? c.text : ''));
if (!t || !String(t).trim()) return;
if (typeof textCardOK === 'function' && !textCardOK(t)) return;
const key = grp + '\u0001' + 't|' + t;
if (seen[key]) return;
seen[key] = 1;
out.push({ kind: cat === '拍一拍' ? 'poke' : 'text', t: String(t), src: grp, grp: grp, cat: cat, scopeCat: scopeCat, off: off, srcKind: 'lib' });
});
});
return out;
}
function xnSrcView() {
const x = (typeof data !== 'undefined' && data && data.xinxun && typeof data.xinxun === 'object') ? data.xinxun : {};
const s = {
onlyDivine: !!x.onlyDivine,
addDivine: !!x.addDivine,
addEmotion: !!x.addEmotion,
addConnect: !!x.addConnect
};
if (!s.onlyDivine && !s.addDivine && !s.addEmotion && !s.addConnect && x.mode) {
if (x.mode === 'mix') s.addDivine = true;
else if (x.mode === 'divine') s.onlyDivine = true;
else if (x.mode === 'emo') s.addEmotion = true;
else if (x.mode === 'conn') s.addConnect = true;
}
return s;
}
function xnSrcIsLibOnly() {
const s = xnSrcView();
return !s.onlyDivine && !s.addDivine && !s.addEmotion && !s.addConnect;
}
function xnSrcDrawerMeta() {
return { title: '字卡抽屉', name: '字卡抽屉', ph: '搜索字卡 / 牌名 / 情绪词 / 连接词 / 分组' };
}
function xnSrcPaintDrawer() {
const dm = xnSrcDrawerMeta();
const title = xn$('xnDrawerTitle'); if (title) title.textContent = dm.title;
const name = xn$('xnLibName'); if (name) name.textContent = dm.name;
const s = xn$('xnSearch'); if (s) s.placeholder = dm.ph;
}
var _xnDivinePool = null;
var _xnDivineWait = null;
function xnDivinePool() {
if (_xnDivinePool) return _xnDivinePool;
if (typeof DIVINE_ALL === 'undefined' || !Array.isArray(DIVINE_ALL)) {
if (!_xnDivineWait && typeof ensureChunk === 'function') {
_xnDivineWait = ensureChunk('divine').then(ok => {
_xnDivineWait = null;
if (!ok) return;
_xnDivinePool = null;
if (typeof _xnPoolRebuild === 'function') _xnPoolRebuild();
});
}
return [];
}
const out = [];
DIVINE_ALL.forEach(c => {
if (!c) return;
const deck = c.deck === 'tarot' ? '塔罗' : '雷诺曼';
const hay = [c.cn, c.en, c.kw, c.core, c.rv, c.love, c.emo, c.st, c.stRv, c.int, c.intRv,
c.p, c.w2, c.pc, c.time, c.suit, c.note, deck, '牌面图鉴'].filter(Boolean).join(' ').toLowerCase();
out.push({
kind: 'img', img: divineArtOf(c), t: c.cn || c.en || '', en: c.en || '',
src: '牌面图鉴 · ' + deck, grp: deck, cat: '牌面图鉴', hay: hay,
divine: true, dkey: divineKeyOf(c), off: false, srcKind: 'divine'
});
});
_xnDivinePool = out;
return out;
}
function xnEmotionPool() {
if (typeof _emoGroups !== 'function' || typeof _emoCards !== 'function') return [];
const kinds = [
['mood', (typeof EMOTION_TAG_LABEL !== 'undefined' && EMOTION_TAG_LABEL.mood) || '情绪'],
['heart', (typeof EMOTION_TAG_LABEL !== 'undefined' && EMOTION_TAG_LABEL.heart) || '心意'],
['intent', (typeof EMOTION_TAG_LABEL !== 'undefined' && EMOTION_TAG_LABEL.intent) || '意图']
];
const out = [], seen = {};
kinds.forEach(([kind, label]) => {
let groups = [];
try { groups = _emoGroups(kind) || []; } catch (e) { groups = []; }
groups.forEach(g => {
let cards = [];
try { cards = _emoCards(kind, g) || []; } catch (e) { cards = []; }
cards.forEach(c => {
const word = String((c && typeof c === 'object' ? c.t : c) || '').trim();
if (!word || seen[word]) return;
seen[word] = 1;
out.push({
kind: 'text', t: word, cat: '聊天情绪', grp: label,
src: '聊天情绪 · ' + label, emo: true, emoKind: kind, emoGroup: g, srcKind: 'emo',
hay: [word, label, g, '聊天情绪'].filter(Boolean).join(' ').toLowerCase(), off: false
});
});
});
});
return out;
}
function xnConnectPool() {
if (typeof _emoGroups !== 'function' || typeof _emoCards !== 'function') return [];
let groups = [];
try { groups = _emoGroups('connect') || []; } catch (e) { groups = []; }
const out = [], seen = {};
groups.forEach(g => {
let cards = [];
try { cards = _emoCards('connect', g) || []; } catch (e) { cards = []; }
const label = (typeof EMOTION_CONNECT_LABEL !== 'undefined' && EMOTION_CONNECT_LABEL[g]) || g;
cards.forEach(c => {
const word = String(c || '').trim();
if (!word || seen[word]) return;
seen[word] = 1;
out.push({
kind: 'text', t: word, cat: '逻辑连接词', grp: label,
src: '逻辑连接词 · ' + label, conn: true, emoKind: 'connect', emoGroup: g, srcKind: 'conn',
hay: [word, label, g, '逻辑连接词'].filter(Boolean).join(' ').toLowerCase(), off: false
});
});
});
return out;
}
function xnAllPool(cid) {
return xnLibPool(cid).concat(xnDivinePool(), xnEmotionPool(), xnConnectPool());
}
function xnAllowedPool(cid) {
const s = xnSrcView();
if (s.onlyDivine) return xnDivinePool();
const out = xnLibPool(cid);
if (s.addDivine) Array.prototype.push.apply(out, xnDivinePool());
if (s.addEmotion) Array.prototype.push.apply(out, xnEmotionPool());
if (s.addConnect) Array.prototype.push.apply(out, xnConnectPool());
return out;
}
function xnSrcAllowed(kind) {
const s = xnSrcView();
if (s.onlyDivine) return kind === 'divine';
if (kind === 'lib') return true;
if (kind === 'divine') return s.addDivine;
if (kind === 'emo') return s.addEmotion;
if (kind === 'conn') return s.addConnect;
return true;
}
function xnSrcAllowedOf(c) {
return !c || !c.srcKind || xnSrcAllowed(c.srcKind);
}
var XN_SRC_ROWS = [
{ k: 'onlyDivine', t: '只用牌面图鉴', d: '打开后这一页只用 118 张牌面来交换，字卡库和下面三项都不加进来' },
{ k: 'addDivine', t: '追加牌面图鉴', d: '塔罗 78＋雷诺曼 40' },
{ k: 'addEmotion', t: '追加聊天情绪', d: '情绪／心意／意图' },
{ k: 'addConnect', t: '追加逻辑连接词', d: '应声／确认／追问／探问／转话／换角度／缓一缓／收尾' }
];
function xnRenderSrcRows() {
['xnModeRowSet', 'xnModeRow'].forEach(id => {
const host = xn$(id);
if (!host || host.dataset.xnSrcBuilt) return;
host.dataset.xnSrcBuilt = '1';
host.innerHTML = XN_SRC_ROWS.map(r =>
'<label class="ap-row xn-srcrow" data-xn-srcrow="' + r.k + '">' +
'<span>' + r.t + '<span style="display:block;font-size:11px;color:var(--muted)">' + r.d + '</span></span>' +
'<input type="checkbox" data-xn-src="' + r.k + '" style="width:18px;height:18px;flex:none;margin:0;accent-color:var(--ink)">' +
'</label>').join('');
});
}
function xnSrcSummary() {
const s = xnSrcView();
if (s.onlyDivine) return '只用牌面图鉴';
const parts = [];
if (s.addDivine) parts.push('牌面图鉴');
if (s.addEmotion) parts.push('聊天情绪');
if (s.addConnect) parts.push('逻辑连接词');
return parts.length ? '字卡库＋' + parts.join('＋') : '字卡库';
}
function xnSrcRenderAll() {
xnRenderSrcRows();
const s = xnSrcView();
Array.prototype.forEach.call(document.querySelectorAll('[data-xn-src]'), el => {
const k = el.getAttribute('data-xn-src');
el.checked = !!s[k];
el.disabled = !!(s.onlyDivine && k !== 'onlyDivine');
const row = el.closest ? el.closest('[data-xn-srcrow]') : null;
if (row) row.classList.toggle('is-off', el.disabled);
});
const sum = xn$('sumXnMode');
if (sum) sum.textContent = xnSrcSummary();
}
function xnSrcSet(key, on) {
const s = xnSrcView();
if (!(key in s)) return;
s[key] = !!on;
if (typeof data !== 'undefined' && data) {
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
data.xinxun.onlyDivine = !!s.onlyDivine;
data.xinxun.addDivine = !!s.addDivine;
data.xinxun.addEmotion = !!s.addEmotion;
data.xinxun.addConnect = !!s.addConnect;
data.xinxun.mode = '';
try { if (typeof flushSave === 'function') flushSave(); else if (typeof save === 'function') save(); } catch (e) {}
}
xnSrcRenderAll();
xnSrcPaintDrawer();
_xnPoolRebuild();
if (typeof showToast === 'function') showToast('心讯来源：' + xnSrcSummary());
}
function _xnPoolRebuild() {
const onPage = !!(document.body && document.body.dataset.view === 'xinxun');
if (!onPage) return;
_xnPool = xnAllPool(_xnCid);
_xnFull = xnAllowedPool(_xnCid);
_xnHand = _xnPool.slice();
_xnHis = _xnFull.filter(x => !x.off);
_xnFilterCat = '';
_xnFilterGrp = '';
_xnQuery = '';
_xnPicked = [];
const q = xn$('xnSearch'); if (q) q.value = '';
xnApplyFilter();
xnDealWish(true);
xnSyncPick();
if (_xnQOpen) xnQApply();
}
function xnCardCat(c) { return (c && (c.scopeCat || c.cat)) || '主字卡'; }
function xnCardTag(c) { return (c && c.cat) || '主字卡'; }
function xnCardGrp(c) { return (c && (c.grp || c.src)) || xnCardCat(c); }
function xnGrpKey(cat, tag, grp) { return cat + '\u0001' + tag + '\u0001' + grp; }
function xnFilterCats() {
const counts = {};
(_xnPool || []).forEach(c => {
const cat = xnCardCat(c);
counts[cat] = (counts[cat] || 0) + 1;
});
return XN_CATS.map(cat => ({ cat: cat, n: counts[cat] || 0 }));
}
function xnFilterGroups() {
const out = [], seen = {};
const srcOn = {
'牌面图鉴': xnSrcAllowed('divine'),
'聊天情绪': xnSrcAllowed('emo'),
'逻辑连接词': xnSrcAllowed('conn')
};
(_xnPool || []).forEach(c => {
if (!c) return;
if (!c.scopeCat && !srcOn[xnCardCat(c)]) return;
const cat = xnCardCat(c), tag = xnCardTag(c), grp = xnCardGrp(c);
if (_xnFilterCat && cat !== _xnFilterCat) return;
const key = xnGrpKey(cat, tag, grp);
if (!seen[key]) { seen[key] = { key: key, cat: cat, tag: tag, grp: grp, label: grp, n: 0 }; out.push(seen[key]); }
seen[key].n++;
});
const all = {}, perScope = {};
out.forEach(g => { all[g.grp] = (all[g.grp] || 0) + 1; });
out.forEach(g => { const k = g.cat + '\u0001' + g.grp; perScope[k] = (perScope[k] || 0) + 1; });
out.forEach(g => {
if (perScope[g.cat + '\u0001' + g.grp] > 1) g.label = g.grp + ' · ' + g.tag;
else if (all[g.grp] > 1) g.label = g.grp + ' · ' + g.cat;
});
return out;
}
function xnFilterPill(label, n, on, onclick) {
const b = document.createElement('button');
b.type = 'button';
b.className = 'xn-fpill';
b.setAttribute('aria-pressed', on ? 'true' : 'false');
const t = document.createElement('span');
t.textContent = label;
const c = document.createElement('span');
c.className = 'n';
c.textContent = n;
b.appendChild(t);
b.appendChild(c);
b.addEventListener('click', onclick);
return b;
}
function xnGrpFiltered() {
const q = (_xnGrpQ || '').trim().toLowerCase();
const rows = xnFilterGroups();
return q ? rows.filter(g => String(g.label).toLowerCase().indexOf(q) >= 0 || String(g.grp).toLowerCase().indexOf(q) >= 0) : rows;
}
function xnRenderGrpPick() {
const list = xn$('xnGrpList');
if (!list) return;
const rows = xnGrpFiltered();
_xnGrpPick = rows;
const q = (_xnGrpQ || '').trim();
const catN = _xnFilterCat ? ((xnFilterCats().filter(x => x.cat === _xnFilterCat)[0] || { n: 0 }).n) : _xnPool.length;
const allRow = q ? '' : '<button type="button" class="cards-pick-row group-pick-row" data-xn-grp-all="1"' + (!_xnFilterGrp ? ' data-active="true"' : '') +
'><span class="gp-name">全部分组</span><span class="gp-meta">' + catN + ' 张</span>' + (!_xnFilterGrp ? '<span class="gp-check">✓</span>' : '') + '</button>';
const btn = rows.map((g, i) => '<button type="button" class="cards-pick-row group-pick-row" data-xn-grp-i="' + i + '"' + (_xnFilterGrp === g.key ? ' data-active="true"' : '') +
'><span class="gp-name">' + xnEsc(g.label) + '</span><span class="gp-meta">' + g.n + ' 张</span>' + (_xnFilterGrp === g.key ? '<span class="gp-check">✓</span>' : '') + '</button>');
const tags = [];
rows.forEach(g => { if (tags.indexOf(g.tag) < 0) tags.push(g.tag); });
const order = XN_LIB_CATS;
tags.sort((a, b) => {
const ia = order.indexOf(a), ib = order.indexOf(b);
return (ia < 0 ? order.length : ia) - (ib < 0 ? order.length : ib);
});
const body = (tags.length > 1)
? tags.map(tag => '<div class="xn-grp-tag">' + xnEsc(tag) + '</div>' + rows.map((g, i) => (g.tag === tag ? btn[i] : '')).join('')).join('')
: btn.join('');
list.innerHTML = allRow + (rows.length ? body : '<div class="bind-empty">没有匹配的分组</div>');
const hint = xn$('xnGrpHint');
if (hint) {
const sv = xnSrcView(), add = [];
if (sv.onlyDivine || sv.addDivine) add.push('牌面图鉴');
if (sv.addEmotion) add.push('聊天情绪');
if (sv.addConnect) add.push('逻辑连接词');
hint.textContent = (_xnFilterCat ? '只列「' + _xnFilterCat + '」下的分组' : '列出你自己存的分组（公用＋绑给这一位的专属）' + (add.length ? '与已开启来源（' + add.join('／') + '）自己的分册' : '')) + '，按它原来所属的分类分开显示，点一行即筛。';
}
}
function xnOpenGrpPick() {
_xnGrpQ = '';
const inp = xn$('xnGrpSearch');
if (inp) inp.value = '';
xnRenderGrpPick();
const m = xn$('xnGrpMask');
if (m) m.hidden = false;
const on = xn$('xnGrpList') && xn$('xnGrpList').querySelector('[data-active="true"]');
if (on && on.scrollIntoView) { try { on.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
}
function xnCloseGrpPick() {
const m = xn$('xnGrpMask');
if (m) m.hidden = true;
}
function xnGrpPickBtn(n) {
const b = document.createElement('button');
b.type = 'button';
b.className = 'xn-fpill xn-fpick';
b.setAttribute('aria-haspopup', 'dialog');
b.setAttribute('aria-label', '打开分组列表');
const t = document.createElement('span');
t.textContent = '分组';
const c = document.createElement('span');
c.className = 'n';
c.textContent = n;
b.appendChild(t);
b.appendChild(c);
b.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>');
b.addEventListener('click', xnOpenGrpPick);
return b;
}
function xnRevealChip(row) {
const b = row && row.querySelector('.xn-fpill[aria-pressed=true]');
if (!b) return;
const r = row.getBoundingClientRect(), c = b.getBoundingClientRect();
if (c.left < r.left) row.scrollLeft -= (r.left - c.left) + 8;
else if (c.right > r.right) row.scrollLeft += (c.right - r.right) + 8;
}
function xnRenderFilters(cats, grps) {
const wrap = xn$('xnFilters'), catRow = xn$('xnFilterCats'), grpRow = xn$('xnFilterGrps');
if (!wrap || !catRow || !grpRow) return;
cats = cats || xnFilterCats();
grps = grps || xnFilterGroups();
const showCat = cats.length > 1;
const showGrp = grps.length > 1;
wrap.hidden = !showCat && !showGrp;
catRow.hidden = !showCat;
grpRow.hidden = !showGrp;
catRow.innerHTML = '';
grpRow.innerHTML = '';
if (showCat) {
cats.forEach(x => catRow.appendChild(xnFilterPill(x.cat, x.n, _xnFilterCat === x.cat, () => {
_xnFilterCat = (_xnFilterCat === x.cat) ? '' : x.cat;
_xnFilterGrp = '';
xnApplyFilter();
})));
}
if (showGrp) {
const inCat = _xnFilterCat ? ((cats.filter(x => x.cat === _xnFilterCat)[0] || { n: 0 }).n) : _xnPool.length;
if (grps.length > 6) grpRow.appendChild(xnGrpPickBtn(grps.length));
grpRow.appendChild(xnFilterPill('全部分组', inCat, !_xnFilterGrp, () => {
_xnFilterGrp = ''; xnApplyFilter();
}));
grps.forEach(g => grpRow.appendChild(xnFilterPill(g.label, g.n, _xnFilterGrp === g.key, () => {
_xnFilterGrp = (_xnFilterGrp === g.key) ? '' : g.key;
xnApplyFilter();
})));
}
if (showCat) xnRevealChip(catRow);
if (showGrp) xnRevealChip(grpRow);
}
function xnCardHay(c) {
return [c.t, c.en, c.kw, c.hay, c.src, c.cat, c.scopeCat, c.grp,
c.voice && ((c.voice.name || '') + ' ' + (c.voice.text || ''))]
.filter(Boolean).join(' ').toLowerCase();
}
function xnApplyFilter() {
const cats = xnFilterCats();
if (cats.length <= 1 || (_xnFilterCat && !cats.some(x => x.cat === _xnFilterCat))) _xnFilterCat = '';
const grps = xnFilterGroups();
if (grps.length <= 1 || (_xnFilterGrp && !grps.some(x => x.key === _xnFilterGrp))) _xnFilterGrp = '';
const q = (_xnQuery || '').trim().toLowerCase();
_xnHand = _xnPool.filter(c => {
if (_xnFilterCat && xnCardCat(c) !== _xnFilterCat) return false;
if (_xnFilterGrp && xnGrpKey(xnCardCat(c), xnCardTag(c), xnCardGrp(c)) !== _xnFilterGrp) return false;
if (q && xnCardHay(c).indexOf(q) < 0) return false;
return true;
});
const fanBox = xn$('xnFan');
if (fanBox) fanBox.classList.toggle('xn-grid-divine', _xnFilterCat === '牌面图鉴');
xnRenderFilters(cats, grps);
xnRenderFan();
xnSyncPick();
const lc = xn$('xnLibCount'); if (lc) lc.textContent = _xnPool.length + ' 张';
return _xnHand;
}
function xnCardSrc(c) {
if (!c) return '';
if (c.divine) return String(c.src || '牌面图鉴');
if (c.emo || c.conn || c.cat === '聊天情绪' || c.cat === '逻辑连接词') return String(c.src || c.cat || '聊天情绪');
const g = c.src ? ' · ' + c.src : '';
return '你' + g + ((c.kind === 'img' || c.kind === 'voice') ? ' 存的' : ' 写的');
}
function xnCardKey(c) {
if (!c) return '';
if (c.divine && c.dkey) return 'd|' + c.dkey;
if (c.kind === 'img') {
const s = String(c.img || '');
return 'i|' + s.length + ':' + s.slice(0, 16) + ':' + s.slice(-8);
}
if (c.kind === 'voice') {
const v = c.voice || {};
return 'v|' + (v.name || '') + '|' + (v.tts || '') + '|' + String(v.data || '').length;
}
return 't|' + (c.t || c.text || '');
}
function xnCardGroupOf(c) {
if (!c) return '';
if (c.grp) return String(c.grp);
const src = String(c.src || '');
const tail = src.indexOf('·') >= 0 ? src.slice(src.lastIndexOf('·') + 1).trim() : '';
if (c.divine) return tail || src || '牌面图鉴';
if (c.emo || c.conn || c.cat === '聊天情绪' || c.cat === '逻辑连接词') {
return tail || src || c.cat || '';
}
return src;
}
function xnCardKindOf(c) {
if (!c) return '';
if (c.divine || c.cat === '牌面图鉴') return '牌面图鉴';
if (c.emo || c.cat === '聊天情绪') return '聊天情绪';
if (c.conn || c.cat === '逻辑连接词') return '逻辑连接词';
return (c.cat || '主字卡') + (c.scopeCat ? ' · ' + c.scopeCat : '');
}
function _xnDupGroups(cards) {
const map = Object.create(null);
const all = [];
(cards || []).forEach(c => {
if (!c || c.retracted) return;
const k = xnCardKey(c);
if (!k) return;
let g = map[k];
if (!g) { g = { key: k, n: 0, me: 0, ta: 0, head: c }; map[k] = g; all.push(g); }
g.n++;
if (c.by === 'me') g.me++; else g.ta++;
});
return all.filter(g => g.n > 1).sort((a, b) => b.n - a.n);
}
function _xnDupLabel(c) {
if (!c) return '';
if (c.kind === 'img') return c.divine ? (c.text || c.t || '牌面图鉴') : '图片';
if (c.kind === 'voice') {
const v = c.voice || {};
return '语音 · ' + (v.name || v.text || c.text || '');
}
return String(c.text || c.t || '').replace(/\s+/g, ' ').trim();
}
function xnPlayVoice(card) {
const dataUrl = card && ((card.voice && card.voice.data) || card.data);
if (!dataUrl) return;
try {
if (_xnAudio) { _xnAudio.pause(); _xnAudio = null; }
_xnAudio = new Audio(dataUrl);
const p = _xnAudio.play();
if (p && p.catch) p.catch(() => {});
} catch (e) {}
}
function xnPlayPoke(card) {
const el = card && card.el && card.el.querySelector('.tx');
if (!el) return;
el.classList.remove('poked');
void el.offsetWidth;
el.classList.add('poked');
window.setTimeout(() => el.classList.remove('poked'), 520);
}
function xnPlayEffect(c) {
if (!c) return;
if (c.kind === 'voice') xnPlayVoice(c);
else if (c.kind === 'poke') xnPlayPoke(c);
}
var _xnLazyTimer = 0;
function xnLazyPaint() {
if (typeof initLazyImages !== 'function' || _xnLazyTimer) return;
_xnLazyTimer = setTimeout(() => {
_xnLazyTimer = 0;
try { initLazyImages(); } catch (e) {}
}, 0);
}
var XN_ART_TRIES = 2;
function _xnArtRetry(im) {
if (!im) return;
const src = im.getAttribute('data-src') || '';
if (!src || /^data:/i.test(src)) return;
const n = (+im.dataset.xnArtTry || 0) + 1;
if (n > XN_ART_TRIES) return;
im.dataset.xnArtTry = String(n);
im.dataset.imgFail = '';
try { im.classList.remove('img-fail'); } catch (e) {}
im.alt = im.dataset.alt0 || im.alt;
const base = src.replace(/[?&]dvt=x[^&]*/g, '');
im.dataset.src = base + (base.indexOf('?') < 0 ? '?' : '&') + 'dvt=x' + n;
try { if (typeof _lzReveal === 'function') _lzReveal(im); } catch (e) {}
}
function xnPaintCard(box, card, opts) {
if (!box) return;
opts = opts || {};
box.className = opts.base || '';
box.style.backgroundImage = '';
box.innerHTML = '';
if (!card) return;
const kind = card.kind || 'text';
if (kind === 'img' && card.img) {
box.classList.add('img');
const im = document.createElement('img');
im.className = opts.thumb ? 'xn-thumb-img' : 'xn-face-img';
im.alt = card.t || '图片卡';
im.decoding = 'async';
im.dataset.src = card.img;
im.setAttribute('data-lazy-img', 'true');
im.addEventListener('error', () => _xnArtRetry(im));
box.appendChild(im);
return;
}
if (kind === 'voice') {
box.classList.add('voice');
const name = card.t || card.text || (card.voice && (card.voice.text || card.voice.name)) || '语音';
if (opts.missing) { box.classList.remove('voice'); box.textContent = name + '（语音已不在字卡库）'; return; }
if (opts.noBtn) { box.textContent = '▶ ' + name; return; }
const btn = document.createElement('button');
btn.type = 'button';
btn.className = 'xn-vplay';
btn.setAttribute('aria-label', '播放这段语音');
btn.textContent = '▶';
btn.addEventListener('pointerdown', e => e.stopPropagation());
btn.addEventListener('click', e => { e.stopPropagation(); xnPlayVoice(card); });
const span = document.createElement('span');
span.className = 'xn-vname';
span.textContent = name;
box.appendChild(btn);
box.appendChild(span);
return;
}
if (card.cat === 'emoji' || card.cat === '颜文字') box.classList.add('emo');
if (card.cat === '颜文字') box.classList.add('kao');
if (kind === 'poke') box.classList.add('poke');
box.textContent = card.t || card.text || '';
}
var XN_FLIP_MS = 520;
function xnFaceMark(el, up, instant) {
if (!el) return;
if (!up || instant) { el.dataset.face = up ? 'fr' : 'bk'; return; }
el.classList.add('flipping');
window.setTimeout(() => { el.classList.remove('flipping'); if (el.isConnected) el.dataset.face = 'fr'; }, XN_FLIP_MS);
}
function xnCardEl(c) {
const b = document.createElement('div');
b.className = 'xn-dc ' + c.by + (c.up ? ' up' : '') + (c.retracted ? ' away' : '');
b.style.setProperty('--rot', c.rot.toFixed(2) + 'deg');
b.innerHTML =
'<div class="in3">' +
'<div class="fc bk"><span class="edge"></span><i class="bk-art" aria-hidden="true"></i><b>言</b>' +
(c.at ? '<span class="bk-tm">' + xnTimeText(c.at) + '</span>' : '') + '</div>' +
'<div class="fc fr"><span class="edge"></span><div class="tx"></div>' +
'<div class="meta"><span class="who">' + (c.by === 'me' ? '你 出' : xnTaPhrase('递')) + '</span>' +
(c.at ? '<span class="tm">' + xnTimeText(c.at) + '</span>' : '') + '</div>' +
'</div>' +
'</div>' +
'<span class="xn-gpeek" aria-hidden="true">' + xnEsc(xnCardSrc(c)) + '</span>';
xnPaintCard(b.querySelector('.tx'), c, { base: 'tx' });
b.dataset.id = c.id;
xnFaceMark(b, c.up, true);
xnBindCard(b, c);
return b;
}
function xnAddCard(by, card, quiet) {
const kind = card.kind || 'text';
const key = xnCardKey(card);
const base = by === 'me' ? -2.6 : 2.6;
const said = _xnSeq.filter(x => x.key === key && !x.retracted).length;
const prev = _xnSeq.length ? _xnSeq[_xnSeq.length - 1] : null;
const at = Number(card.at) || Date.now();
const c = {
id: 'xn' + (_xnSeq.length + 1), by: by, kind: kind, key: key, at: at,
text: card.t || (card.voice && card.voice.text) || '', img: card.img || '',
voice: card.voice || null, cat: card.cat || '', src: card.src || '', n: said + 1,
grp: card.emoGroup || card.grp || '', scopeCat: card.scopeCat || '',
divine: !!card.divine, dkey: card.dkey || '',
up: by === 'me', retracted: false, retracting: false, rot: base + (Math.random() * 1.5 - 0.75)
};
_xnSeq.push(c);
const el = xnCardEl(c);
el.classList.add('in');
c.el = el;
const table = xn$('xnTable');
if (table && (!prev || xnDayKey(prev.at) !== xnDayKey(c.at))) {
const day = document.createElement('div');
day.className = 'xn-day';
day.textContent = xnDayLabel(c.at);
table.appendChild(day);
}
table.appendChild(el);
xnLazyPaint();
xnTableSnap(el);
if (kind === 'img') xnSnapOnImg(el);
xnSyncSession();
if (by === 'ta' && !quiet) xnWishOnTaSent();
if (by === 'me' && !quiet) xnPlayEffect(c);
return c;
}
function xnTableSnap(el) {
const table = xn$('xnTable');
if (!table || !el || !el.isConnected) return;
table.scrollTop = table.scrollHeight;
_xnPinned = true;
_xnSnapTop = table.scrollTop;
}
var _xnTableRO = null, _xnTableROTarget = null;
function xnTableWatch(table) {
if (typeof ResizeObserver !== 'function') return;
const t = table || xn$('xnTable');
if (!t || t === _xnTableROTarget) return;
if (!_xnTableRO) _xnTableRO = new ResizeObserver(() => { if (_xnPinned) xnTableSnap(xnLastCardEl()); });
try { _xnTableRO.disconnect(); } catch (e) {}
_xnTableRO.observe(t);
_xnTableROTarget = t;
}
function xnLastCardEl() {
for (let i = _xnSeq.length - 1; i >= 0; i--) {
const e = _xnSeq[i].el;
if (e && e.isConnected && !e.hidden) return e;
}
return null;
}
function xnSnapOnImg(el) {
const im = el.querySelector('img.xn-face-img');
if (!im) return;
const again = () => {
if (!_xnPinned) return;
xnTableSnap(xnLastCardEl() || el);
};
if (im.getAttribute('src') && im.complete) { again(); return; }
im.addEventListener('load', again, { once: true });
im.addEventListener('error', again, { once: true });
}
function xnPinKeep() { if (_xnPinned) xnTableSnap(xnLastCardEl()); }
var XN_PEEK_MS = 420;
function xnBindCard(el, c) {
let t = 0, pt = 0, sx = 0, sy = 0, long = false, peeked = false, down = false, moved = false;
const clearPeek = () => {
if (pt) { clearTimeout(pt); pt = 0; }
peeked = false;
el.classList.remove('peeking');
};
const stop = () => {
if (t) { clearTimeout(t); t = 0; }
clearPeek();
el.classList.remove('hold');
};
el.addEventListener('pointerdown', e => {
if (e.pointerType === 'mouse' && e.button !== 0) return;
down = true; long = false; moved = false; sx = e.clientX; sy = e.clientY;
stop();
const who = (c.by === 'me' && c.up && e.target && e.target.closest) ? e.target.closest('.who') : null;
if (who) {
el.classList.add('hold');
t = setTimeout(() => { t = 0; long = true; el.classList.remove('hold'); xnRetract(c); }, 600);
return;
}
pt = setTimeout(() => { pt = 0; peeked = true; el.classList.add('peeking'); }, XN_PEEK_MS);
});
el.addEventListener('pointermove', e => {
if (!down || (!t && !pt)) return;
if (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10) { moved = true; stop(); }
});
el.addEventListener('pointerup', () => {
const wasDown = down;
down = false;
const wasPeek = peeked;
stop();
if (!wasDown) return;
if (long) { long = false; return; }
if (wasPeek) return;
if (moved) return;
if (!c.up && !c.retracted) {
c.up = true; el.classList.add('up');
xnFaceMark(el, true);
xnPlayEffect(c);
xnSyncSession();
return;
}
if (c.retracted) return;
xnCardViewOpen(c);
});
el.addEventListener('pointercancel', () => { down = false; stop(); });
el.addEventListener('contextmenu', e => e.preventDefault());
}
function xnRetract(c) {
if (c.by !== 'me' || c.retracted || c.retracting) return;
c.retracting = true;
const wasDown = !c.up;
if (wasDown) { c.up = true; c.el.classList.add('up'); xnFaceMark(c.el, true); }
const apply = () => {
if (!c.el.isConnected || c.retracted) { c.retracting = false; return; }
c.retracting = false; c.retracted = true;
c.el.classList.remove('hold');
c.el.classList.add('away');
_xnRetracted.push(c);
window.setTimeout(() => { if (c.retracted) { c.el.hidden = true; xnPinKeep(); } }, 260);
xnUpdateUndo();
xnSyncSession();
};
if (wasDown) { setTimeout(apply, 280); } else apply();
}
function xnPutBack() {
const c = _xnRetracted.pop();
if (!c) return;
c.retracted = false;
c.el.hidden = false;
c.el.classList.remove('away');
c.el.classList.add('back');
xnPinKeep();
window.setTimeout(() => c.el.classList.remove('back'), 340);
xnUpdateUndo();
xnSyncSession();
}
function xnUpdateUndo() {
const b = xn$('xnUndo');
const bar = xn$('xnBar');
const n = _xnRetracted.length;
if (b) {
b.hidden = n === 0;
b.textContent = n > 1 ? '放回去（' + n + '）' : '放回去';
}
if (bar) bar.hidden = n === 0;
}
var XN_FAN_PAGE = 40;
var XN_FAN_EDGE = 360;
var _xnFanShown = 0;
var _xnFanRaf = 0;
function xnMiniCard(card, idx, attr, picked) {
const locked = !xnSrcAllowedOf(card);
picked = picked && !locked;
const el = document.createElement('button');
el.type = 'button';
el.className = 'xn-mini xn-pickcard' + (card.kind === 'img' ? ' xn-mini-img' : '') +
(card.divine ? ' xn-divine' : '') + (locked ? ' is-locked' : '') + (picked ? ' is-picked' : '');
el.setAttribute('aria-pressed', picked ? 'true' : 'false');
el.dataset[attr] = idx;
if (locked) {
el.setAttribute('aria-disabled', 'true');
el.title = '这一来源没开启 · 去 心讯 → 来源 打开';
}
const src = xnCardSrc(card) + (locked ? ' · 未开启' : '');
const cname = card.divine ? String(card.t || '') : '';
el.innerHTML = '<p></p>' +
(cname ? '<span class="xn-cname">' + xnEsc(cname) + '</span>' : '') +
(locked ? '<span class="xn-lock">未开启</span>' : '') +
'<span class="ms" title="' + xnEsc(src) + '">' + xnEsc(src) + '</span>';
xnPaintCard(el.querySelector('p'), card, { base: '', noBtn: true, thumb: true });
return el;
}
function xnFanAppend(count) {
const fan = xn$('xnFan');
if (!fan) return;
const end = Math.min(_xnHand.length, _xnFanShown + count);
for (let i = _xnFanShown; i < end; i++) {
const card = _xnHand[i];
fan.appendChild(xnMiniCard(card, i, 'i', _xnPicked.indexOf(card) >= 0));
}
_xnFanShown = end;
xnLazyPaint();
}
function xnRenderFan() {
const fan = xn$('xnFan');
if (!fan) return;
fan.innerHTML = '';
fan.scrollLeft = 0;
fan.scrollTop = 0;
_xnFanShown = 0;
if (!_xnHand.length) {
fan.innerHTML = '<p class="xn-wempty">这一页还没有能用的卡 · 先去字卡库存几张</p>';
return;
}
xnFanAppend(XN_FAN_PAGE);
xnSyncPick();
}
function xnMaybeAppendFan() {
if (_xnFanRaf) return;
_xnFanRaf = requestAnimationFrame(() => {
_xnFanRaf = 0;
const fan = xn$('xnFan');
if (!fan || _xnFanShown >= _xnHand.length) return;
if (fan.scrollTop + fan.clientHeight >= fan.scrollHeight - XN_FAN_EDGE) xnFanAppend(XN_FAN_PAGE);
});
}
function xnPlayCards(list) {
const cards = (list || []).filter(Boolean);
if (!cards.length) return false;
if (_xnBusy) return false;
_xnBusy = true;
cards.forEach((m, i) => xnAddCard('me', m, i < cards.length - 1));
window.setTimeout(() => { xnTaTurn(); }, 950);
return true;
}
function xnPlayCard(m) { return xnPlayCards([m]); }
function xnPlayMine(i) { xnPlayCard(_xnHand[i]); }
function xnTogglePick(card, el) {
if (!card) return;
if (!xnSrcAllowedOf(card)) {
if (typeof showToast === 'function') showToast('这一来源没开启 · 去 心讯 → 来源 打开');
return;
}
const i = _xnPicked.indexOf(card);
if (i >= 0) _xnPicked.splice(i, 1); else _xnPicked.push(card);
if (el) {
const on = i < 0;
el.classList.toggle('is-picked', on);
el.setAttribute('aria-pressed', on ? 'true' : 'false');
}
xnSyncPick();
}
function xnSyncPick() {
const n = _xnPicked.length;
const pc = xn$('xnPickCount');
if (pc) pc.textContent = '已选 ' + n + ' 张';
const hint = xn$('xnPickHint');
if (hint) {
let locked = 0;
(_xnHand || []).forEach(c => { if (!xnSrcAllowedOf(c)) locked++; });
hint.textContent = '筛选后 ' + _xnHand.length + ' 张' +
(locked ? ' · ' + locked + ' 张未开启' : '') +
(n ? ' · 已选 ' + n + ' 张' : ' · 点字卡多选') + ' · 推到牌桌';
}
const clear = xn$('xnPickClear');
if (clear) clear.disabled = !n;
const push = xn$('xnPushBtn');
if (push) {
push.disabled = !n;
push.textContent = n > 1 ? '合并推到牌桌（' + n + '）' : '推到牌桌';
}
}
function xnOpenDrawer() {
_xnDrawerOpen = true;
xnCloseSwitcher();
xnCloseQDrawer();
_xnPicked = [];
_xnQuery = '';
_xnFilterCat = '';
_xnFilterGrp = '';
const s = xn$('xnSearch'); if (s) s.value = '';
xnSrcPaintDrawer();
const lc = xn$('xnLibCount'); if (lc) lc.textContent = _xnPool.length + ' 张';
const d = xn$('xnDrawer'); if (d) d.hidden = false;
xnApplyFilter();
xnSyncPick();
}
function xnCloseDrawer() {
_xnDrawerOpen = false;
xnCloseGrpPick();
const d = xn$('xnDrawer'); if (d) d.hidden = true;
}
function xnPushPicked() {
if (!_xnPicked.length) return;
if (_xnBusy) {
if (typeof showToast === 'function') showToast('等 ' + xnTaPhrase('接完这一手再推'));
return;
}
const picked = _xnPicked.slice();
_xnPicked = [];
xnSyncPick();
xnCloseDrawer();
xnPlayCards(picked);
}
var _xnQQ = '';
var _xnQHand = [];
var _xnQShown = 0;
var _xnQRaf = 0;
var _xnQOpen = false;
var XN_Q_PAGE = 20;
var XN_Q_MORE = 40;
var _xnQPoolRef = null;
var _xnQSig = '';
var _xnQFillPending = false;
var _xnQTypeT = 0;
var _xnHayPool = null;
var _xnHayArr = [];
var _xnQPicks = [];
function xnPickMode() {
let m = '';
try { if (typeof data !== 'undefined' && data && data.xinxun) m = data.xinxun.pickMode || ''; } catch (e) {}
return m === 'multi' ? 'multi' : 'one';
}
function xnPickModePaint() {
const b = xn$('xnQMode');
if (!b) return;
const multi = xnPickMode() === 'multi';
b.textContent = multi ? '多选' : '直接发';
b.classList.toggle('on', multi);
b.setAttribute('aria-pressed', multi ? 'true' : 'false');
b.title = multi ? '点一张选中 · 攒几张一起推 · 点一下改回直接发' : '点一张就推过去 · 点一下改多选';
}
function xnPickModeSet(v) {
const m = v === 'multi' ? 'multi' : 'one';
if (typeof data !== 'undefined' && data) {
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
data.xinxun.pickMode = m;
try {
if (typeof flushSave === 'function') flushSave();
else if (typeof save === 'function') save();
} catch (e) {}
}
if (m === 'one') _xnQPicks = [];
xnPickModePaint();
xnQApply();
}
function xnQPicksRefresh() {
const multi = xnPickMode() === 'multi';
const n = _xnQPicks.length;
const push = xn$('xnQPush');
if (push) {
push.hidden = !multi;
push.disabled = !n;
push.textContent = n > 1 ? '一起推（' + n + '）' : '推到牌桌';
}
const tip = document.querySelector('#xnQPane .xn-qtip');
if (tip) tip.textContent = multi ? (n ? '已选 ' + n + ' 张 · 再点一张可取消' : '点一张选中，可多选') : '点一张推过去';
}
function xnQPicksToggle(card, el) {
if (!card) return;
if (!xnSrcAllowedOf(card)) {
if (typeof showToast === 'function') showToast('这一来源没开启 · 去 心讯 → 来源 打开');
return;
}
const i = _xnQPicks.indexOf(card);
if (i >= 0) _xnQPicks.splice(i, 1); else _xnQPicks.push(card);
if (el) {
const on = i < 0;
el.classList.toggle('is-picked', on);
el.setAttribute('aria-pressed', on ? 'true' : 'false');
}
xnQPicksRefresh();
}
function xnQPushPicked() {
if (!_xnQPicks.length) return;
if (_xnBusy) {
if (typeof showToast === 'function') showToast('等 ' + xnTaPhrase('接完这一手再推'));
return;
}
const list = _xnQPicks.slice();
if (!xnPlayCards(list)) {
if (typeof showToast === 'function') showToast('等 ' + xnTaPhrase('接完这一手再推'));
return;
}
_xnQPicks = [];
xnCloseQDrawer();
}
function xnQDrawerSet(on) {
_xnQOpen = !!on;
const p = xn$('xnQPane'); if (p) p.hidden = !_xnQOpen;
const mk = xn$('xnQMask'); if (mk) mk.hidden = !_xnQOpen;
const btn = xn$('xnLibBtn');
if (btn) btn.setAttribute('aria-expanded', _xnQOpen ? 'true' : 'false');
const fold = xn$('xnQFold');
if (fold) fold.setAttribute('aria-expanded', _xnQOpen ? 'true' : 'false');
if (!_xnQOpen) {
const g0 = xn$('xnQGrid');
if (g0) Array.prototype.forEach.call(g0.querySelectorAll('.xn-mini.is-picked'), el => {
el.classList.remove('is-picked');
el.setAttribute('aria-pressed', 'false');
});
_xnQPicks = [];
return;
}
const s = xn$('xnQSearch'); if (s) s.value = _xnQQ;
xnQSearchPaint();
xnPickModePaint();
xnQFillSoon();
}
function xnQSearchPaint() {
const s = xn$('xnQSearch');
const b = xn$('xnQClear');
if (b) b.hidden = !(s && s.value);
}
function xnQFillSoon() {
if (_xnQFillPending) return;
_xnQFillPending = true;
let done = false;
const run = () => {
if (done) return;
done = true;
_xnQFillPending = false;
if (_xnQOpen) xnQApply();
};
window.setTimeout(run, 0);
window.setTimeout(run, 120);
}
function xnQFilterSoon() {
if (_xnQTypeT) window.clearTimeout(_xnQTypeT);
_xnQTypeT = window.setTimeout(() => {
_xnQTypeT = 0;
if (_xnQOpen) xnQApply();
}, 120);
}
function xnQDrawerToggle() { xnQDrawerSet(!_xnQOpen); }
function xnCloseQDrawer() { xnQDrawerSet(false); }
function xnQApply() {
const q = (_xnQQ || '').trim().toLowerCase();
const sig = q + '\u0001' + xnPickMode();
const g = xn$('xnQGrid');
if (g && _xnQPoolRef === _xnPool && _xnQSig === sig) { xnQPicksRefresh(); return; }
if (_xnHayPool !== _xnPool) { _xnHayPool = _xnPool; _xnHayArr = _xnPool.map(xnCardHay); }
_xnQHand = q ? _xnPool.filter((c, i) => _xnHayArr[i].indexOf(q) >= 0) : _xnPool.slice();
const n = xn$('xnQCount'); if (n) n.textContent = _xnQHand.length + ' 张';
if (g) { g.innerHTML = ''; g.scrollTop = 0; }
_xnQShown = 0;
xnQPicksRefresh();
if (!_xnQHand.length) {
_xnQPoolRef = _xnPool; _xnQSig = sig;
if (g) g.innerHTML = '<p class="xn-wempty">' + (q ? '没搜到这一张 · 换个词试试' : '这一页还没有能用的卡 · 先去字卡库存几张') + '</p>';
return;
}
xnQAppend(XN_Q_PAGE);
_xnQPoolRef = _xnPool; _xnQSig = sig;
}
function xnQAppend(count) {
const g = xn$('xnQGrid');
if (!g) return;
const end = Math.min(_xnQHand.length, _xnQShown + count);
const multi = xnPickMode() === 'multi';
for (let i = _xnQShown; i < end; i++) {
g.appendChild(xnMiniCard(_xnQHand[i], i, 'qi', multi && _xnQPicks.indexOf(_xnQHand[i]) >= 0));
}
_xnQShown = end;
xnLazyPaint();
}
function xnQMaybeAppend() {
if (_xnQRaf) return;
_xnQRaf = requestAnimationFrame(() => {
_xnQRaf = 0;
const g = xn$('xnQGrid');
if (!g || _xnQShown >= _xnQHand.length) return;
if (g.scrollTop + g.clientHeight >= g.scrollHeight - XN_FAN_EDGE) xnQAppend(XN_Q_MORE);
});
}
var XN_LOOK_DEF = { img: '', veil: 0, blur: 0, zoom: 100 };
function _xnLookClamp(v, min, max, dft) {
const n = Number(v);
return (v !== null && v !== '' && isFinite(n)) ? Math.max(min, Math.min(max, Math.round(n))) : dft;
}
function xnTimelineOn() {
if (typeof data === 'undefined' || !data || !data.xinxun || typeof data.xinxun !== 'object') return true;
return data.xinxun.timeline !== false;
}
function xnApplyTimeline() {
const root = xn$('xinxunView');
const on = xnTimelineOn();
if (root) root.classList.toggle('xn-no-timeline', !on);
const row = xn$('xnTimelineRow');
if (row) {
row.setAttribute('aria-checked', on ? 'true' : 'false');
row.title = on ? '关掉时间轴（只收起显示，记录照旧）' : '打开时间轴';
}
const tg = xn$('xnTimelineTg');
if (tg) tg.classList.toggle('off', !on);
}
function xnTimelineSet(on) {
if (typeof data === 'undefined' || !data) return;
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
data.xinxun.timeline = !!on;
xnApplyTimeline();
try { if (typeof save === 'function') save(); } catch (e) {}
}
var XN_BAR_DEF = { headLine: 'on', footLine: 'on', headVeil: 0, footVeil: 0 };
function xnBarView() {
const live = (typeof data !== 'undefined' && data && typeof data === 'object');
const b = (live && data.xinxun && typeof data.xinxun === 'object' && data.xinxun.bars &&
typeof data.xinxun.bars === 'object' && !Array.isArray(data.xinxun.bars)) ? data.xinxun.bars : {};
return {
headLine: b.headLine === 'off' ? 'off' : 'on',
footLine: b.footLine === 'off' ? 'off' : 'on',
headVeil: _xnLookClamp(b.headVeil, 0, 100, XN_BAR_DEF.headVeil),
footVeil: _xnLookClamp(b.footVeil, 0, 100, XN_BAR_DEF.footVeil)
};
}
function xnBarSet(patch) {
if (typeof data === 'undefined' || !data || typeof data !== 'object') return;
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
if (!data.xinxun.bars || typeof data.xinxun.bars !== 'object' || Array.isArray(data.xinxun.bars)) data.xinxun.bars = {};
Object.assign(data.xinxun.bars, patch || {});
xnApplyBars();
xnRenderBars();
}
function xnApplyBars() {
const root = xn$('xinxunView');
if (!root) return;
const v = xnBarView();
root.dataset.xnHeadline = v.headLine;
root.dataset.xnFootline = v.footLine;
const _tint = (key, t) => {
const attr = key === 'head' ? 'xnHeadtint' : 'xnFoottint';
const prop = key === 'head' ? '--xn-head-a' : '--xn-foot-a';
if (t > 0) {
root.dataset[attr] = 'on';
root.style.setProperty(prop, (t / 100).toFixed(3));
} else {
delete root.dataset[attr];
root.style.removeProperty(prop);
}
};
_tint('head', v.headVeil);
_tint('foot', v.footVeil);
const pv = xn$('xnLookPrev');
if (pv) {
pv.dataset.xnHeadline = v.headLine;
pv.dataset.xnFootline = v.footLine;
const _pv = (key, t) => {
const attr = key === 'head' ? 'xnHeadtint' : 'xnFoottint';
const prop = key === 'head' ? '--xn-pv-head-a' : '--xn-pv-foot-a';
if (t > 0) { pv.dataset[attr] = 'on'; pv.style.setProperty(prop, (t / 100).toFixed(3)); }
else { delete pv.dataset[attr]; pv.style.removeProperty(prop); }
};
_pv('head', v.headVeil);
_pv('foot', v.footVeil);
}
}
function xnRenderBars() {
const v = xnBarView();
const mark = (id, val) => {
const g = xn$(id);
if (g) g.querySelectorAll('.contact-chip').forEach(c => c.classList.toggle('active', c.dataset.v === val));
};
mark('xnHeadLine', v.headLine);
mark('xnFootLine', v.footLine);
const wrap = xn$('xnBarVeilWrap');
if (wrap) wrap.hidden = false;
const footWrap = xn$('xnFootVeilWrap');
if (footWrap) footWrap.hidden = false;
const R = (id, val) => {
const e = xn$(id); if (e) e.value = val;
const o = xn$(id + 'Out'); if (o) o.textContent = val + '%';
};
R('xnHeadVeil', v.headVeil);
R('xnFootVeil', v.footVeil);
}
function xnLookView() {
if (typeof data === 'undefined' || !data) {
return { img: '', veil: XN_LOOK_DEF.veil, blur: XN_LOOK_DEF.blur, zoom: XN_LOOK_DEF.zoom };
}
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
const b = (data.xinxun.bg && typeof data.xinxun.bg === 'object') ? data.xinxun.bg : {};
return {
img: typeof b.img === 'string' ? b.img : '',
veil: _xnLookClamp(b.veil, 0, 90, XN_LOOK_DEF.veil),
blur: _xnLookClamp(b.blur, 0, 24, XN_LOOK_DEF.blur),
zoom: _xnLookClamp(b.zoom, 100, 200, XN_LOOK_DEF.zoom)
};
}
function xnLookSet(patch) {
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
if (!data.xinxun.bg || typeof data.xinxun.bg !== 'object') data.xinxun.bg = {};
Object.assign(data.xinxun.bg, patch || {});
xnApplyLook();
xnRenderLook();
}
function xnApplyLook() {
const root = xn$('xinxunView');
if (!root) return;
xnApplyBars();
const v = xnLookView();
const on = !!v.img;
root.classList.toggle('has-bg', on);
const st = root.style;
if (!on) {
st.removeProperty('--xn-bg');
st.removeProperty('--xn-veil');
st.removeProperty('--xn-blur');
st.removeProperty('--xn-zoom');
return;
}
st.setProperty('--xn-bg', 'url("' + v.img + '")');
st.setProperty('--xn-veil', String(v.veil / 100));
st.setProperty('--xn-blur', v.blur + 'px');
st.setProperty('--xn-zoom', String(v.zoom / 100));
}
var XN_CARD_SKINS = [
{ k: 'plain', t: '素白', c: 'var(--surface)' },
{ k: 'paper', t: '米白', c: '#FAF5EA' },
{ k: 'mist', t: '雾蓝', c: '#E9EFF7' },
{ k: 'ash', t: '浅灰', c: '#EEEFF1' }
];
var XN_CARD_BACKS = [
{ k: 'post', t: '框印' },
{ k: 'ring', t: '环徽' },
{ k: 'diamond', t: '菱徽' },
{ k: 'circle', t: '圆章' },
{ k: 'plain', t: '净面' }
];
var XN_CARD_SHADOWS = [
{ k: 'none', t: '无' },
{ k: 'soft', t: '轻' },
{ k: 'deep', t: '重' }
];
var XN_CARD_STYLES = [
{ k: 'plain', t: '素白', card: { skin: 'plain', see: 40, radius: 3, back: 'post',
paper: false, frame: true, guard: false, imgFull: false, shadow: 'soft' } },
{ k: 'xuan', t: '宣纸', card: { skin: 'paper', see: 0, radius: 4, back: 'diamond',
paper: true, frame: true, guard: false, imgFull: true, shadow: 'soft' } },
{ k: 'mist', t: '雾面', card: { skin: 'mist', see: 55, radius: 10, back: 'ring',
paper: false, frame: false, guard: true, imgFull: false, shadow: 'soft' } },
{ k: 'glass', t: '玻璃', card: { skin: 'ash', see: 70, radius: 12, back: 'post',
paper: false, frame: false, guard: true, imgFull: true, shadow: 'deep' } },
{ k: 'min', t: '极简', card: { skin: 'ash', see: 0, radius: 0, back: 'plain',
paper: false, frame: false, guard: false, imgFull: true, shadow: 'none' } },
{ k: 'classic', t: '圆章', card: { skin: 'plain', see: 40, radius: 3, back: 'circle',
paper: false, frame: true, guard: false, imgFull: false, shadow: 'soft' } }
];
var XN_CARD_DEF = { skin: 'plain', see: 40, radius: 3, back: 'post',
paper: false, frame: true, guard: false, imgFull: false, shadow: 'soft' };
function _xnCardBool(v, def) {
if (v === undefined || v === null || v === '') return def;
if (typeof v === 'string') return v === '1' || v === 'true' || v === 'on';
return !!v;
}
function xnCardView() {
const live = (typeof data !== 'undefined' && data && typeof data === 'object');
const c = (live && data.xinxun && typeof data.xinxun === 'object' && data.xinxun.card &&
typeof data.xinxun.card === 'object' && !Array.isArray(data.xinxun.card))
? data.xinxun.card : {};
const hit = XN_CARD_SKINS.filter(s => s.k === c.skin)[0];
const back = XN_CARD_BACKS.filter(s => s.k === c.back)[0];
const shadow = XN_CARD_SHADOWS.filter(s => s.k === c.shadow)[0];
return {
skin: hit ? hit.k : XN_CARD_DEF.skin,
see: _xnLookClamp(c.see, 0, 80, XN_CARD_DEF.see),
radius: _xnLookClamp(c.radius, 0, 14, XN_CARD_DEF.radius),
back: back ? back.k : XN_CARD_DEF.back,
shadow: shadow ? shadow.k : XN_CARD_DEF.shadow,
paper: _xnCardBool(c.paper, XN_CARD_DEF.paper),
frame: _xnCardBool(c.frame, XN_CARD_DEF.frame),
guard: _xnCardBool(c.guard, XN_CARD_DEF.guard),
imgFull: _xnCardBool(c.imgFull, XN_CARD_DEF.imgFull)
};
}
function xnCardSet(patch) {
if (typeof data === 'undefined' || !data || typeof data !== 'object') return;
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
if (!data.xinxun.card || typeof data.xinxun.card !== 'object' || Array.isArray(data.xinxun.card)) data.xinxun.card = {};
Object.assign(data.xinxun.card, patch || {});
xnApplyCard();
xnRenderCardLook();
}
function xnApplyCard() {
const root = xn$('xinxunView');
if (!root) return;
const v = xnCardView();
root.dataset.xnCard = v.skin;
root.dataset.xnBack = v.back;
root.dataset.xnPaper = v.paper ? 'on' : 'off';
root.dataset.xnFrame = v.frame ? 'on' : 'off';
root.dataset.xnImg = v.imgFull ? 'full' : 'frame';
root.dataset.xnShadow = v.shadow;
const st = root.style;
st.setProperty('--xn-card-r', v.radius + 'px');
st.setProperty('--xn-card-alpha', (100 - v.see) + '%');
st.setProperty('--xn-card-blur', (8 + v.see * 0.15).toFixed(1) + 'px');
root.classList.toggle('has-card-see', v.see > 0);
root.classList.toggle('has-card-guard', v.guard && v.see > 0);
}
function _xnCardStyleOf(v) {
for (let i = 0; i < XN_CARD_STYLES.length; i++) {
const c = XN_CARD_STYLES[i].card;
if (v.skin === c.skin && v.see === c.see && v.radius === c.radius && v.back === c.back &&
v.paper === c.paper && v.frame === c.frame && v.guard === c.guard &&
v.imgFull === c.imgFull && v.shadow === c.shadow) return XN_CARD_STYLES[i].k;
}
return '';
}
function xnCardStyleSet(k) {
const hit = XN_CARD_STYLES.filter(s => s.k === k)[0];
if (!hit) return;
xnCardSet(Object.assign({}, hit.card));
}
function xnCardSetBack(k) {
if (!XN_CARD_BACKS.some(s => s.k === k)) return;
xnCardSet({ back: k });
}
function xnCardSetShadow(k) {
if (!XN_CARD_SHADOWS.some(s => s.k === k)) return;
xnCardSet({ shadow: k });
}
function _xnCardChipRow(host, list, attr, cur) {
if (!host) return;
if (!host.childElementCount) {
list.forEach(item => {
const b = document.createElement('button');
b.type = 'button';
b.className = 'contact-chip';
b.setAttribute(attr, item.k);
b.textContent = item.t;
host.appendChild(b);
});
}
host.querySelectorAll('[' + attr + ']').forEach(b => {
const on = b.getAttribute(attr) === cur;
b.classList.toggle('active', on);
b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
}
function _xnCardSwitch(rowId, tgId, on) {
const row = xn$(rowId);
if (row) row.setAttribute('aria-checked', on ? 'true' : 'false');
const tg = xn$(tgId);
if (tg) tg.classList.toggle('off', !on);
}
function xnRenderCardLook() {
const v = xnCardView();
const host = xn$('xnCardSkins');
if (host) {
if (!host.childElementCount) {
XN_CARD_SKINS.forEach(s => {
const b = document.createElement('button');
b.type = 'button';
b.className = 'xn-skin';
b.dataset.skin = s.k;
b.setAttribute('aria-label', '牌面底色 ' + s.t);
b.style.setProperty('--xn-skin', s.c);
const dot = document.createElement('i');
const name = document.createElement('span');
name.textContent = s.t;
b.appendChild(dot);
b.appendChild(name);
host.appendChild(b);
});
}
host.querySelectorAll('.xn-skin').forEach(b => {
b.setAttribute('aria-pressed', b.dataset.skin === v.skin ? 'true' : 'false');
});
}
const styleHost = xn$('xnCardStyles');
if (styleHost) {
const cur = _xnCardStyleOf(v);
if (!styleHost.childElementCount) {
XN_CARD_STYLES.forEach(s => {
const b = document.createElement('button');
b.type = 'button';
b.className = 'contact-chip';
b.dataset.style = s.k;
b.textContent = s.t;
styleHost.appendChild(b);
});
}
styleHost.querySelectorAll('[data-style]').forEach(b => {
const on = b.dataset.style === cur;
b.classList.toggle('active', on);
b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
const now = xn$('xnCardStyleNow');
if (now) {
const hit = cur ? XN_CARD_STYLES.filter(s => s.k === cur)[0] : null;
now.textContent = hit ? hit.t : '自定义';
}
}
_xnCardChipRow(xn$('xnCardBacks'), XN_CARD_BACKS, 'data-back', v.back);
_xnCardChipRow(xn$('xnCardShadows'), XN_CARD_SHADOWS, 'data-shadow', v.shadow);
_xnCardSwitch('xnCardTextureRow', 'xnCardTextureTg', v.paper);
_xnCardSwitch('xnCardFrameRow', 'xnCardFrameTg', v.frame);
_xnCardSwitch('xnCardGuardRow', 'xnCardGuardTg', v.guard);
_xnCardSwitch('xnCardImgRow', 'xnCardImgTg', v.imgFull);
const guardRow = xn$('xnCardGuardRow');
if (guardRow) guardRow.title = v.see > 0
? '给透明卡上的字加一层白色柔晕'
: '透出为 0 时不需要保字晕';
const R = (id, val, unit) => {
const e = xn$(id); if (e) e.value = val;
const o = xn$(id + 'Out'); if (o) o.textContent = val + unit;
};
R('xnCardSee', v.see, '%');
R('xnCardR', v.radius, 'px');
}
function xnLookPresetOf(img) {
if (!img || typeof BG_PRESETS === 'undefined' || typeof _bgPresetURL !== 'function') return null;
return BG_PRESETS.find(p => _bgPresetURL(p.id) === img) || null;
}
function xnRenderLook() {
xnApplyTimeline();
xnReplyCfgPaint();
xnRenderBars();
xnSrcRenderAll();
const v = xnLookView();
const on = !!v.img;
const pv = xn$('xnLookPrevBg');
if (pv) {
pv.style.backgroundImage = on ? 'url("' + v.img + '")' : 'none';
pv.style.setProperty('--xn-pv-veil', String(v.veil / 100));
pv.style.setProperty('--xn-pv-blur', v.blur + 'px');
pv.style.setProperty('--xn-pv-zoom', String(v.zoom / 100));
}
const knobs = xn$('xnLookKnobs'); if (knobs) knobs.hidden = !on;
xnRenderCardLook();
const clr = xn$('xnBgClear'); if (clr) clr.disabled = !on;
const R = (id, val, unit) => {
const e = xn$(id); if (e) e.value = val;
const o = xn$(id + 'Out'); if (o) o.textContent = val + unit;
};
R('xnBgVeil', v.veil, '%');
R('xnBgBlur', v.blur, 'px');
R('xnBgZoom', v.zoom, '%');
const st = xn$('xnLookState');
if (st) {
const p = on ? xnLookPresetOf(v.img) : null;
st.textContent = !on ? '这一页现在跟主题走（没有背景图）'
: (p ? '当前：预设「' + p.name + '」' : '当前：你自己的图片');
}
const host = xn$('xnBgPresets');
if (host) {
if (!host.childElementCount && typeof BG_PRESETS !== 'undefined' && typeof _bgPresetURL === 'function') {
BG_PRESETS.filter(p => !p.dark).forEach(p => {
const b = document.createElement('button');
b.type = 'button';
b.className = 'ap-bg-preset';
b.dataset.preset = p.id;
b.title = p.name;
b.setAttribute('aria-label', '预设背景 ' + p.name);
b.style.backgroundImage = 'url("' + _bgPresetURL(p.id) + '")';
host.appendChild(b);
});
}
host.querySelectorAll('.ap-bg-preset').forEach(b => {
b.classList.toggle('active', on && v.img === _bgPresetURL(b.dataset.preset));
});
}
}
function xnSetTabSet(k) {
const list = ['mode', 'reply', 'display', 'bg', 'face'];
const key = list.indexOf(k) >= 0 ? k : 'mode';
_xnSetTab = key;
const tabs = xn$('xnSetTabs');
if (tabs) {
Array.prototype.forEach.call(tabs.querySelectorAll('[data-xn-set]'), b => {
const on = b.getAttribute('data-xn-set') === key;
b.setAttribute('aria-selected', on ? 'true' : 'false');
});
}
Array.prototype.forEach.call(document.querySelectorAll('#xnLookSheet [data-xn-pane]'), p => {
p.hidden = p.getAttribute('data-xn-pane') !== key;
});
const wrap = xn$('xnLookPrevWrap');
const host = document.querySelector('#xnLookSheet [data-xn-pane="' + key + '"]');
if (wrap && host && (key === 'bg' || key === 'face')) host.insertBefore(wrap, host.firstChild);
const lookState = xn$('xnLookState');
if (lookState) lookState.hidden = key !== 'bg';
const body = document.querySelector('#xnLookSheet .fs-sheet-body');
if (body) body.scrollTop = 0;
}
function xnOpenLook() {
const m = xn$('xnLookMask');
if (!m) return;
xnCloseDrawer();
xnCloseSwitcher();
xnRenderLook();
xnSetTabSet('mode');
m.hidden = false;
}
function xnCloseLook() {
const m = xn$('xnLookMask');
if (m) m.hidden = true;
}
async function xnLookPickImage(file) {
if (!file) return;
const img = await fileData(file, _bgUploadEdge(), 0.8);
if (!img) return;
xnLookSet({ img: img, veil: 0, blur: 0, zoom: 100 });
await flushSave();
if (typeof showToast === 'function') showToast('背景已更新');
}
function xnLookPickPreset(id) {
if (typeof _bgPresetURL !== 'function') return;
const url = _bgPresetURL(id);
if (!url) return;
const p = xnLookPresetOf(url);
xnLookSet({ img: url, veil: 0, blur: 0, zoom: 100 });
flushSave();
if (typeof showToast === 'function') showToast(p ? '已换上预设「' + p.name + '」' : '已换上预设');
}
function _xnReplyInt(v) {
const n = Number(v);
return isFinite(n) ? Math.max(XN_REPLY_MIN, Math.min(XN_REPLY_MAX, Math.round(n))) : 0;
}
function xnReplyCfg() {
const x = (typeof data !== 'undefined' && data && data.xinxun && typeof data.xinxun === 'object') ? data.xinxun : {};
const mode = x.replyMode === 'one' ? 'one' : XN_REPLY_DEF.mode;
const min = _xnReplyInt(x.replyMin) || XN_REPLY_DEF.min;
let max = _xnReplyInt(x.replyMax) || XN_REPLY_DEF.max;
if (max < min) max = min;
return { mode: mode, min: min, max: max };
}
function xnReplyCount() {
const cfg = xnReplyCfg();
if (cfg.mode === 'one') return 1;
return cfg.min + Math.floor(Math.random() * (cfg.max - cfg.min + 1));
}
function xnReplyCfgPaint() {
const cfg = xnReplyCfg();
const host = xn$('xnReplyModes');
if (host) {
Array.prototype.forEach.call(host.querySelectorAll('[data-xn-replymode]'), b => {
const on = b.getAttribute('data-xn-replymode') === cfg.mode;
b.classList.toggle('active', on);
b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
}
const rmin = xn$('xnReplyMin'), rmax = xn$('xnReplyMax');
if (rmin) {
rmin.value = String(cfg.min);
const o = xn$('xnReplyMinOut'); if (o) o.textContent = cfg.min + ' 张';
}
if (rmax) {
rmax.value = String(cfg.max);
const o = xn$('xnReplyMaxOut'); if (o) o.textContent = cfg.max + ' 张';
}
const range = xn$('xnReplyRange');
if (range) range.hidden = cfg.mode === 'one';
const note = xn$('xnReplyNote');
if (note) {
note.textContent = cfg.mode === 'one'
? '不管这一轮你推几张，' + xnTaPhrase('只回一张。')
: '不管这一轮你推几张，' + xnTaPhrase('每轮在 ' + cfg.min + '~' + cfg.max + ' 张里随机回一个数。');
}
}
function xnReplyModeSet(mode) {
if (typeof data === 'undefined' || !data) return;
if (mode !== 'one' && mode !== 'random') return;
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
if (data.xinxun.replyMode === mode) return;
data.xinxun.replyMode = mode;
xnReplyCfgPaint();
try { if (typeof save === 'function') save(); } catch (e) {}
}
function xnReplyRangeSet(key, raw) {
if (typeof data === 'undefined' || !data) return;
const v = _xnReplyInt(raw);
if (!v) return;
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
const cfg = xnReplyCfg();
if (key === 'min') {
data.xinxun.replyMin = v;
if (cfg.max < v) data.xinxun.replyMax = v;
} else {
data.xinxun.replyMax = v;
if (cfg.min > v) data.xinxun.replyMin = v;
}
xnReplyCfgPaint();
}
function xnTaTurn() {
_xnBusy = false;
const n = xnReplyCount();
if (!_xnHis.length) {
if (typeof showToast === 'function') showToast(_xnPool.length ? xnTaPhrase('那一叠没有能自动用的卡 · 那几张都停用了') : '字卡库里还没有能用的卡 · 先去字卡库存几张');
return;
}
for (let i = 0; i < n; i++) {
const one = _xnHis[Math.floor(Math.random() * _xnHis.length)];
xnAddCard('ta', one, i < n - 1);
}
}
function xnReset() {
const table = xn$('xnTable');
if (table) table.innerHTML = '';
_xnSeq = [];
_xnRetracted = [];
_xnBusy = false;
xnNewSession();
_xnFull = xnAllowedPool(_xnCid);
_xnHis = _xnFull.filter(x => !x.off);
_xnWishCache = { want: null, model: null, say: null, sent: null };
xnUpdateUndo();
xnApplyFilter();
xnDealWish(true);
xnCloseAlbum();
}
function xnBook() {
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
if (!Array.isArray(data.xinxun.sessions)) data.xinxun.sessions = [];
return data.xinxun.sessions;
}
function xnNewSession() {
_xnSid = 'xn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
_xnSessionAt = Date.now();
}
function xnSyncSession() {
if (!_xnSeq.length) return null;
if (!_xnSid) xnNewSession();
const book = xnBook();
let rec = null;
for (let i = 0; i < book.length; i++) {
if (book[i] && book[i].id === _xnSid) { rec = book[i]; break; }
}
if (!rec) {
rec = { id: _xnSid, at: _xnSessionAt || Date.now(), cid: _xnCid, cards: [] };
book.push(rec);
}
rec.cards = _xnSeq.map(xnSnapshot);
rec.cid = _xnCid;
if (!rec.at) rec.at = _xnSessionAt || Date.now();
try { if (typeof save === 'function') save(); } catch (e) {}
const alb = xn$('xnAlbum');
if (alb && !alb.hidden) {
const body = xn$('xnAlbumBody');
const y = body ? body.scrollTop : 0;
const wasTail = body ? (body.scrollHeight - y - body.clientHeight <= 4) : false;
xnRenderAlbum();
if (body) body.scrollTop = wasTail ? body.scrollHeight : y;
}
return rec;
}
function xnSnapshot(c) {
const o = { by: c.by, kind: c.kind, text: c.text || '', src: c.src || '', cat: c.cat || '',
grp: c.grp || '', scopeCat: c.scopeCat || '',
up: !!c.up, retracted: !!c.retracted, n: c.n || 1, rot: typeof c.rot === 'number' ? c.rot : 0,
at: Number(c.at) || 0 };
if (c.kind === 'img') o.img = c.img || '';
if (c.divine) { o.divine = true; o.dkey = c.dkey || ''; }
if (c.kind === 'voice') o.voice = { name: (c.voice && c.voice.name) || c.text || '语音', tts: (c.voice && c.voice.tts) || '', text: (c.voice && c.voice.text) || c.text || '' };
return o;
}
function xnRestoreLast() {
const all = xnBook();
let rec = null;
for (let i = all.length - 1; i >= 0; i--) {
const s = all[i];
if (!s || !Array.isArray(s.cards) || !s.cards.length) continue;
const sid = s.cid || ((typeof mainChatId === 'function' && mainChatId()) || '');
if (sid === _xnCid) { rec = s; break; }
}
if (!rec) return;
_xnSid = rec.id;
_xnSessionAt = rec.at || Date.now();
_xnRetracted = [];
rec.cards.forEach(snap => {
const card = { kind: snap.kind || 'text', t: snap.text || '', img: snap.img || '',
voice: null, cat: snap.cat || '', src: snap.src || '',
grp: snap.grp || '', scopeCat: snap.scopeCat || '',
divine: !!snap.divine, dkey: snap.dkey || '',
at: Number(snap.at) || Number(rec.at) || 0 };
if (snap.kind === 'voice') {
const v = xnVoiceOf(snap);
card.voice = v || { name: snap.text || (snap.voice && snap.voice.name) || '语音',
tts: (snap.voice && snap.voice.tts) || '', text: (snap.voice && snap.voice.text) || snap.text || '' };
}
const live = xnAddCard(snap.by, card, true);
if (typeof snap.rot === 'number') {
live.rot = snap.rot;
if (live.el) live.el.style.setProperty('--rot', snap.rot.toFixed(2) + 'deg');
}
if (snap.up) { live.up = true; if (live.el) live.el.classList.add('up'); }
if (live.el) xnFaceMark(live.el, !!snap.up, true);
if (snap.retracted) {
live.retracted = true;
if (live.el) { live.el.classList.add('away'); live.el.hidden = true; }
_xnRetracted.push(live);
}
});
xnUpdateUndo();
xnSyncSession();
}
function xnPad2(n) { return (n < 10 ? '0' : '') + n; }
function xnDayKey(ts) {
const d = new Date(Number(ts) || 0);
return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
}
function xnDayLabel(ts) {
const d = new Date(Number(ts) || 0);
if (isNaN(d.getTime())) return '';
const now = new Date();
if (xnDayKey(d) === xnDayKey(now)) return '今天';
if (xnDayKey(d) === xnDayKey(now.getTime() - 864e5)) return '昨天';
const md = (d.getMonth() + 1) + '月' + d.getDate() + '日';
return d.getFullYear() === now.getFullYear() ? md : d.getFullYear() + '年' + md;
}
function xnTimeText(ts) {
const d = new Date(Number(ts) || 0);
if (isNaN(d.getTime())) return '';
return xnPad2(d.getHours()) + ':' + xnPad2(d.getMinutes()) + ':' + xnPad2(d.getSeconds());
}
function xnTimeAt(ts, baseTs) {
const t = Number(ts) || 0;
if (!t) return '';
const d = new Date(t);
if (isNaN(d.getTime())) return '';
if (baseTs && xnDayKey(t) !== xnDayKey(baseTs)) return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + xnTimeText(t);
return xnTimeText(t);
}
function xnVoiceOf(rec) {
if (!rec || rec.kind !== 'voice') return null;
if (rec.voice && rec.voice.data) return rec.voice;
const nm = rec.voice && rec.voice.name;
const hit = xnLibPool(_xnCid).find(x => x.kind === 'voice' && x.voice && x.voice.name === nm);
return hit ? hit.voice : null;
}
function xnBookTabsPaint() {
const box = xn$('xnAlbumTabs');
if (!box) return;
Array.prototype.forEach.call(box.querySelectorAll('[data-xn-booktab]'), b => {
b.setAttribute('aria-pressed', b.getAttribute('data-xn-booktab') === _xnBookTab ? 'true' : 'false');
});
}
function xnBookTabSet(tab) {
_xnBookTab = tab === 'dup' ? 'dup' : 'all';
xnRenderAlbum();
}
var XN_BOOK_ORDER_TXT = { desc: '逆时间', asc: '正时间' };
function xnRecAt(rec) {
if (!rec) return 0;
const cards = Array.isArray(rec.cards) ? rec.cards : [];
return Number(rec.at) || cards.reduce((a, c) => a || Number(c && c.at) || 0, 0) || 0;
}
function xnBookOrder() {
if (typeof data === 'undefined' || !data || !data.xinxun || typeof data.xinxun !== 'object') return 'desc';
return data.xinxun.bookOrder === 'asc' ? 'asc' : 'desc';
}
function xnBookOrderPaint() {
const b = xn$('xnBookOrder');
if (!b) return;
const o = xnBookOrder();
b.textContent = XN_BOOK_ORDER_TXT[o];
b.setAttribute('data-xn-bookorder', o);
b.setAttribute('aria-pressed', o === 'desc' ? 'true' : 'false');
b.title = o === 'desc'
? '现在是逆时间（最新的在最上面）· 点一下换成正时间'
: '现在是正时间（最早的在最上面）· 点一下换成逆时间';
}
function xnBookOrderSet(v) {
const o = v === 'asc' ? 'asc' : 'desc';
if (typeof data !== 'undefined' && data) {
if (!data.xinxun || typeof data.xinxun !== 'object') data.xinxun = { sessions: [] };
data.xinxun.bookOrder = o;
try { if (typeof save === 'function') save(); } catch (e) {}
}
xnRenderAlbum();
}
function xnBookOrderToggle() { xnBookOrderSet(xnBookOrder() === 'desc' ? 'asc' : 'desc'); }
function xnRenderAlbum() {
const body = xn$('xnAlbumBody');
if (!body) return;
xnBookTabsPaint();
xnBookOrderPaint();
const all = (data.xinxun && Array.isArray(data.xinxun.sessions)) ? data.xinxun.sessions : [];
const book = all.filter(s => s && Array.isArray(s.cards) && s.cards.length).slice();
if (book.every(s => xnRecAt(s))) book.sort((a, b) => xnRecAt(a) - xnRecAt(b));
if (xnBookOrder() === 'desc') book.reverse();
const dupCache = new Map();
const dupOf = rec => {
if (!dupCache.has(rec)) {
const groups = _xnDupGroups(rec.cards || []);
dupCache.set(rec, { groups, extra: groups.reduce((a, g) => a + g.n - 1, 0) });
}
return dupCache.get(rec);
};
const mode = _xnBookTab;
const list = mode === 'dup' ? book.filter(rec => dupOf(rec).groups.length) : book;
body.innerHTML = '';
if (!list.length) {
body.innerHTML = !book.length
? '<div class="xn-empty">卡册还是空的 ·<br>推一张就有了。</div>'
: '<div class="xn-empty">还没有重复出的牌 ·<br>同一张牌在一场里出了两次以上，才会记到这里。</div>';
return;
}
if (mode === 'dup' && list.length > 1) {
const extraAll = list.reduce((a, rec) => a + dupOf(rec).extra, 0);
const sum = document.createElement('div');
sum.className = 'xn-dlrep-sum';
sum.textContent = '共 ' + list.length + ' 场 · 重复 ' + extraAll + ' 次';
body.appendChild(sum);
}
let lastDay = '';
list.forEach(rec => {
const cards = rec.cards || [];
const retN = cards.filter(c => c.retracted).length;
const live = rec.id === _xnSid;
const recAt = xnRecAt(rec);
const dk = xnDayKey(recAt);
if (recAt && dk !== lastDay) {
const day = document.createElement('div');
day.className = 'xn-day';
day.textContent = xnDayLabel(recAt);
body.appendChild(day);
lastDay = dk;
}
const info = dupOf(rec);
const page = document.createElement('div');
page.className = 'xn-dlcard';
const nums = mode === 'dup'
? '重复 ' + info.extra + ' 次 · 共 ' + cards.length + ' 张'
: cards.length + ' 张' + (retN ? ' · 收回 ' + retN + '（还在手里）' : '') +
(info.extra ? ' · 重复 ' + info.extra + ' 次' : '');
page.innerHTML = '<div class="xn-dlhd"><b>' + (live ? '这一场 · 进行中' : '这一场') + '</b><span>' + nums +
(recAt ? '<i class="xn-dh-time"> · ' + xnEsc(xnTimeText(recAt)) + '</i>' : '') +
'</span></div>' + (mode === 'dup' ? '<div class="xn-dlrep"></div>' : '<div class="xn-dlhand"></div>');
if (mode === 'dup') {
page.querySelector('.xn-dlrep').innerHTML = info.groups.map(g => {
const label = _xnDupLabel(g.head);
return '<div class="xn-dlrep-row"><span class="xn-dlrep-x" title="' + xnEsc(label) + '">' +
xnEsc(label) + '</span><span class="xn-dlrep-n">×' + g.n + '</span></div>';
}).join('');
body.appendChild(page);
return;
}
const hand = page.querySelector('.xn-dlhand');
const colMe = document.createElement('div');
colMe.className = 'xn-dlcol me';
const colTa = document.createElement('div');
colTa.className = 'xn-dlcol ta';
[[colMe, 'me', '你 出'], [colTa, 'ta', xnTaPhrase('递')]].forEach(([box, k, label]) => {
const n = cards.filter(c => (c.by === 'me' ? 'me' : 'ta') === k).length;
const hd = document.createElement('div');
hd.className = 'xn-dlcolhd';
hd.innerHTML = '<b>' + xnEsc(label) + '</b><span>' + n + ' 张</span>';
box.appendChild(hd);
if (!n) {
const em = document.createElement('div');
em.className = 'xn-dlcolempty';
em.textContent = '这一场没有';
box.appendChild(em);
}
hand.appendChild(box);
});
const ordered = xnBookOrder() === 'desc' ? cards.slice().reverse() : cards;
ordered.forEach(c => {
const at = Number(c.at) || recAt;
const d = document.createElement('div');
d.className = 'xn-dlmini' + (c.retracted ? ' retracted' : '');
d.innerHTML = '<p></p><div class="xn-dlmeta"><span class="sd">' + (c.by === 'me' ? '你 出' : xnTaPhrase('递')) +
(c.retracted ? ' · 收回' : '') + '</span><span class="st">' + xnEsc(xnTimeAt(at, recAt)) + '</span><span class="sw">' +
(c.retracted ? '牌还在 · ' : '') + xnEsc(xnCardSrc(c)) + '</span></div>';
let painted = c, detail = c;
if (c.kind === 'voice') {
const v = xnVoiceOf(c);
painted = v ? { kind: 'voice', t: c.text || v.name, voice: v, cat: c.cat } : { kind: 'text', t: (c.text || (c.voice && c.voice.name) || '语音'), cat: '' };
if (!v) painted.t += '（语音已不在字卡库）';
detail = Object.assign({}, c, { voice: v || c.voice || null });
}
xnPaintCard(d.querySelector('p'), painted, { base: '' });
d.addEventListener('click', () => xnCardViewOpen(detail));
(c.by === 'me' ? colMe : colTa).appendChild(d);
});
body.appendChild(page);
});
xnLazyPaint();
body.scrollTop = xnBookOrder() === 'asc' ? body.scrollHeight : 0;
}
function xnShowAlbum(on) {
const el = xn$('xnAlbum');
if (!el) return;
if (on) {
xnCloseSwitcher(); _xnBookTab = 'all';
el.hidden = false;
xnRenderAlbum();
return;
}
el.hidden = true;
}
function xnCloseAlbum() {
const el = xn$('xnAlbum');
if (el) el.hidden = true;
}
function xnCardViewClose() {
const m = xn$('xnCvMask');
if (m) m.hidden = true;
try { if (_xnAudio) { _xnAudio.pause(); _xnAudio = null; } } catch (e) {}
}
function xnCardViewOpen(card) {
if (!card) return;
const mask = xn$('xnCvMask'), face = xn$('xnCvFace'), meta = xn$('xnCvMeta');
if (!mask || !face || !meta) return;
let paint = card, missing = false;
if ((card.kind || 'text') === 'voice' && !(card.voice && card.voice.data)) {
const v = xnVoiceOf(card);
if (v) paint = Object.assign({}, card, { voice: v });
else {
missing = true;
paint = { kind: 'text', t: card.text || (card.voice && card.voice.name) || '语音', cat: card.cat || '' };
}
}
xnPaintCard(face, paint, { base: 'xn-cv-face', missing: missing });
xnLazyPaint();
if ((paint.kind || 'text') === 'poke') {
const dot = document.createElement('span');
dot.className = 'xn-cv-pokedot';
dot.setAttribute('aria-hidden', 'true');
dot.textContent = '拍';
face.appendChild(dot);
}
const grp = xnCardGroupOf(card);
const kind = xnCardKindOf(card);
const at = Number(card.at) || 0;
const who = card.by === 'me' ? '你 出' : xnTaPhrase('递');
const rows = [];
rows.push('<div class="xn-cv-row group"><span>分组</span><b>' + xnEsc(grp || '—') + '</b></div>');
if (kind) rows.push('<div class="xn-cv-row"><span>分类</span><b>' + xnEsc(kind) + '</b></div>');
rows.push('<div class="xn-cv-row"><span>谁出的</span><b>' + xnEsc(who) +
(card.retracted ? ' · 已收回（牌还在手里）' : '') + '</b></div>');
if (at) {
rows.push('<div class="xn-cv-row"><span>时间</span><b>' + xnEsc(xnDayLabel(at) + ' ' + xnTimeText(at)) + '</b></div>');
}
if (Number(card.n) > 1) {
rows.push('<div class="xn-cv-row"><span>重复</span><b>这一场第 ' + Number(card.n) + ' 次出</b></div>');
}
if (missing) {
rows.push('<div class="xn-cv-row"><span>语音</span><b>这段录音已不在字卡库里，只剩名字</b></div>');
}
meta.innerHTML = rows.join('');
mask.hidden = false;
const body = document.querySelector('#xnCvMask .fs-sheet-body');
if (body) body.scrollTop = 0;
}
function xnPanelFoldSet(on) {
_xnPanelFolded = !!on;
const root = xn$('xinxunView');
if (root) root.classList.toggle('xn-folded', _xnPanelFolded);
const btn = xn$('xnPanelFold');
if (!btn) return;
const label = btn.querySelector('.xn-fold-t');
if (label) label.textContent = _xnPanelFolded ? '展开' : '折叠';
btn.setAttribute('aria-expanded', _xnPanelFolded ? 'false' : 'true');
btn.title = taLabel(_xnPanelFolded ? '展开「他在想什么」面板' : '折叠「他在想什么」面板', _xnCid);
const tab = xn$('xnMineTab');
if (tab) tab.setAttribute('aria-expanded', _xnPanelFolded ? 'false' : 'true');
}
function xnPanelFoldToggle() { xnPanelFoldSet(!_xnPanelFolded); }
function xnWishMode() {
let m = '';
try { if (typeof data !== 'undefined' && data && data.xinxun) m = data.xinxun.wishMode || ''; } catch (e) {}
return m === 'hold' ? 'hold' : 'auto';
}
function xnRenderWishMode() {
const btn = xn$('xnWishMode');
if (!btn) return;
const hold = xnWishMode() === 'hold';
btn.classList.toggle('on', hold);
btn.setAttribute('aria-pressed', hold ? 'true' : 'false');
btn.textContent = hold ? '已暂停' : '自动换';
const tip = hold ? '切换看法时不再换牌 · 点一下恢复自动' : '切换看法时自动换牌 · 点一下暂停';
btn.title = tip;
btn.setAttribute('aria-label', tip);
}
function xnWishModeSet(m) {
const v = m === 'hold' ? 'hold' : 'auto';
if (typeof data !== 'undefined' && data) {
if (!data.xinxun || typeof data.xinxun !== 'object') {
data.xinxun = { sessions: [], bg: { img: '', veil: 0, blur: 0, zoom: 100 } };
}
data.xinxun.wishMode = v;
try {
if (typeof flushSave === 'function') flushSave();
else if (typeof save === 'function') save();
} catch (e) {}
}
_xnWishCache = { want: null, model: null, say: null, sent: null };
if (v === 'hold' && _xnWish.length && _xnWishView !== 'sent') _xnWishCache[_xnWishView] = _xnWish.slice();
xnRenderWishMode();
if (typeof showToast === 'function') {
showToast(v === 'hold' ? '已暂停：切换看法不换牌，点右边刷新才换' : '已恢复自动换牌 · 每次切换看法都会换一手');
}
}
function xnWishCfg() { return XN_WISH_VIEWS.filter(v => v.k === _xnWishView)[0] || XN_WISH_VIEWS[0]; }
function xnPickN(pool, n) {
const p = (pool || []).slice(), out = [];
while (out.length < n && p.length) out.push(p.splice(Math.floor(Math.random() * p.length), 1)[0]);
return out;
}
function xnWishCacheOK(list) {
if (!Array.isArray(list) || !list.length) return false;
const keys = {};
(_xnPool || []).forEach(c => { keys[xnCardKey(c)] = 1; });
return list.every(c => keys[xnCardKey(c)]);
}
function xnSentWish() {
return _xnSeq.filter(c => c.by === 'ta').slice(-3).reverse()
.map(c => ({ kind: c.kind, t: c.text, img: c.img, voice: c.voice, cat: c.cat, src: c.src, retracted: c.retracted, ro: true }));
}
function xnWishOnTaSent() {
_xnWishCache.say = null;
if (_xnWishView === 'say' || _xnWishView === 'sent') xnDealWish(true);
}
function xnRenderWishChips() {
const box = xn$('xnWishChips');
if (!box) return;
const head = xn$('xnWishHead');
if (head) head.textContent = xnTaPhrase('在想什么');
box.innerHTML = '';
XN_WISH_VIEWS.forEach(v => {
const b = document.createElement('button');
b.type = 'button';
b.className = 'xn-wchip';
b.setAttribute('aria-pressed', v.k === _xnWishView ? 'true' : 'false');
b.textContent = v.t;
b.onclick = () => { _xnWishView = v.k; xnRenderWishChips(); xnDealWish(); };
box.appendChild(b);
});
}
function xnDealWish(force) {
const v = xnWishCfg();
if (v.k === 'sent') {
_xnWishCache.sent = null;
_xnWish = xnSentWish();
xnRenderWish();
return;
}
const hold = xnWishMode() === 'hold';
if (hold && !force && xnWishCacheOK(_xnWishCache[v.k])) {
_xnWish = _xnWishCache[v.k];
xnRenderWish();
return;
}
if (v.k === 'say') _xnWish = xnPickN(_xnHis, 3);
else _xnWish = xnPickN(_xnFull, 3);
if (hold) _xnWishCache[v.k] = _xnWish.slice();
xnRenderWish();
}
function xnRenderWish() {
const box = xn$('xnWishRow'), capEl = xn$('xnWishCap');
if (!box) return;
const v = xnWishCfg();
if (capEl) capEl.textContent = xnTaFitText(v.cap) + (v.own ? ' · 点一张推过去' : ' · 只能看');
box.innerHTML = '';
if (!_xnWish.length) {
let msg = _xnPool.length ? '还没有牌' : '字卡库还没有能用的卡';
if (v.k === 'sent' && _xnPool.length) msg = xnTaPhrase('这一场还没递过牌');
else if (v.k === 'say' && _xnPool.length) msg = xnTaPhrase('那一叠没有能自动用的卡');
box.innerHTML = '<p class="xn-wempty">' + msg + '</p>';
return;
}
_xnWish.forEach(w => {
const own = v.own;
const b = document.createElement(own ? 'button' : 'div');
if (own) b.type = 'button';
b.className = 'xn-wcard' + (own ? '' : ' ro') + (w.retracted ? ' retracted' : '');
b.innerHTML = '<p></p>';
xnPaintCard(b.querySelector('p'), w, { base: '', noBtn: true, thumb: true });
if (w.kind === 'img') b.setAttribute('aria-label', '图片卡 · ' + (w.src || '你存的'));
if (own) b.onclick = () => xnPlayWish(w);
box.appendChild(b);
});
xnLazyPaint();
}
function xnPlayWish(w) {
if (_xnBusy) return;
_xnBusy = true;
xnAddCard('me', w);
window.setTimeout(() => { xnTaTurn(); }, 950);
}
var _xnFrom = 'chat';
function xnSetFrom(view) { _xnFrom = view === 'chat' ? 'chat' : (view || 'more'); }
function _xnBackTarget() { return _xnFrom === 'chat' ? 'chat' : _xnFrom; }
var XN_BACK_ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
function xnPaintBack() {
const b = xn$('xnBack');
if (!b) return;
const toChat = _xnFrom === 'chat';
b.classList.toggle('xn-back-arrow', !toChat);
b.setAttribute('aria-label', toChat ? '回传讯' : '返回');
b.title = toChat ? '回传讯' : '返回';
b.innerHTML = toChat ? '‹ 传讯' : XN_BACK_ARROW;
}
function xinxunEnter() {
const keep = !!_xnCid && (data.contacts || []).some(c => c && c.id === _xnCid);
const cid = keep ? _xnCid : ((typeof mainChatId === 'function' && mainChatId()) || (data && data.activeChat) || '');
if (!_xnInited || cid !== _xnCid) {
_xnCid = cid;
_xnPool = xnAllPool(cid);
_xnFull = xnAllowedPool(cid);
_xnHand = _xnPool.slice();
_xnHis = _xnFull.filter(x => !x.off);
_xnFilterCat = '';
_xnFilterGrp = '';
_xnQuery = '';
_xnPicked = [];
_xnDrawerOpen = false;
_xnSeq = [];
_xnRetracted = [];
_xnBusy = false;
_xnInited = true;
xnSetWho();
xnReset();
xnRestoreLast();
} else {
_xnPool = xnAllPool(cid);
_xnFull = xnAllowedPool(cid);
_xnHis = _xnFull.filter(x => !x.off);
_xnQuery = '';
_xnPicked = [];
xnSetWho();
xnApplyFilter();
xnDealWish();
}
xnCloseDrawer();
xnCloseQDrawer();
xnCloseAlbum();
xnCloseLook();
xnCloseSwitcher();
xnPickModePaint();
xnApplyLook();
xnApplyCard();
xnApplyTimeline();
xnRenderSwitcher();
xnRenderWishChips();
xnRenderWishMode();
xnReplyCfgPaint();
xnSrcRenderAll();
xnSrcPaintDrawer();
xnPaintBack();
}
function xnOpenForChat(cid) {
_xnFrom = 'chat';
const c = ((typeof data !== 'undefined' && data && data.contacts) || []).find(x => x && x.id === cid && x.kind !== 'group');
if (c) {
if (_xnInited && _xnCid !== cid) xnSwitchCid(cid);
else _xnCid = cid;
}
if (typeof showView === 'function') showView('xinxun');
}
function xinxunLeave() {
try { if (_xnAudio) { _xnAudio.pause(); _xnAudio = null; } } catch (e) {}
xnCloseDrawer();
xnCloseQDrawer();
_xnPicked = [];
_xnQuery = '';
xnCloseAlbum();
xnCloseLook();
xnCloseSwitcher();
xnCardViewClose();
}
function xnBind() {
const root = xn$('xinxunView');
if (!root || root.dataset.xnBound) return;
root.dataset.xnBound = '1';
const back = xn$('xnBack');
if (back) back.addEventListener('click', () => { if (typeof showView === 'function') showView(_xnBackTarget()); });
const albumBtn = xn$('xnAlbumBtn');
if (albumBtn) albumBtn.addEventListener('click', () => xnShowAlbum(true));
const albumBack = xn$('xnAlbumBack');
if (albumBack) albumBack.addEventListener('click', xnCloseAlbum);
const albumTabs = xn$('xnAlbumTabs');
if (albumTabs) albumTabs.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-xn-booktab]') : null;
if (b) xnBookTabSet(b.getAttribute('data-xn-booktab'));
});
const bookOrder = xn$('xnBookOrder');
if (bookOrder) bookOrder.addEventListener('click', xnBookOrderToggle);
const cvClose = xn$('xnCardViewClose');
if (cvClose) cvClose.addEventListener('click', xnCardViewClose);
const cvMask = xn$('xnCvMask');
if (cvMask) cvMask.addEventListener('click', e => { if (e.target === cvMask) xnCardViewClose(); });
const swBtn = xn$('xnSwitchBtn');
if (swBtn) swBtn.addEventListener('click', xnToggleSwitcher);
const swList = xn$('xnSwitchList');
if (swList) swList.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-xn-cid]') : null;
if (b) xnSwitchCid(b.dataset.xnCid);
});
const swMask = xn$('xnSwitchMask');
if (swMask) swMask.addEventListener('click', xnCloseSwitcher);
root.addEventListener('keydown', e => {
if (e.key === 'Escape') { xnCloseSwitcher(); xnCloseGrpPick(); xnCloseLook(); xnCardViewClose(); xnCloseQDrawer(); }
});
const undo = xn$('xnUndo');
if (undo) undo.addEventListener('click', xnPutBack);
const tablePin = xn$('xnTable');
xnTableWatch(tablePin);
if (tablePin) tablePin.addEventListener('scroll', () => {
if (Math.abs(tablePin.scrollTop - _xnSnapTop) > 1) _xnPinned = false;
}, { passive: true });
const panelFold = xn$('xnPanelFold');
if (panelFold) panelFold.addEventListener('click', xnPanelFoldToggle);
const mineTab = xn$('xnMineTab');
if (mineTab) mineTab.addEventListener('click', () => xnPanelFoldSet(false));
const wishMode = xn$('xnWishMode');
if (wishMode) wishMode.addEventListener('click', () => { xnWishModeSet(xnWishMode() === 'hold' ? 'auto' : 'hold'); });
const wishBtn = xn$('xnWishBtn');
if (wishBtn) wishBtn.addEventListener('click', () => {
wishBtn.classList.add('spin');
window.setTimeout(() => wishBtn.classList.remove('spin'), 420);
xnDealWish(true);
});
const fan = xn$('xnFan');
if (fan) {
fan.addEventListener('scroll', xnMaybeAppendFan, { passive: true });
fan.addEventListener('click', e => {
const b = e.target.closest('.xn-mini');
if (!b || b.dataset.i == null) return;
const m = _xnHand[Number(b.dataset.i)];
if (m) xnTogglePick(m, b);
});
}
const lib = xn$('xnLibBtn');
if (lib) lib.addEventListener('click', xnQDrawerToggle);
const libSearch = xn$('xnLibSearch');
if (libSearch) libSearch.addEventListener('click', () => {
xnQDrawerSet(true);
const s = xn$('xnQSearch'); if (s) s.focus();
});
const libGo = xn$('xnLibGo');
if (libGo) libGo.addEventListener('click', xnOpenDrawer);
const qMask = xn$('xnQMask');
if (qMask) qMask.addEventListener('click', () => xnQDrawerSet(false));
const dback = xn$('xnDrawerBack');
if (dback) dback.addEventListener('click', xnCloseDrawer);
const search = xn$('xnSearch');
if (search) search.addEventListener('input', () => { _xnQuery = search.value; xnApplyFilter(); });
const qFull = xn$('xnQFull');
if (qFull) qFull.addEventListener('click', xnOpenDrawer);
const qSearch = xn$('xnQSearch');
if (qSearch) qSearch.addEventListener('input', () => {
_xnQQ = qSearch.value;
xnQSearchPaint();
xnQFilterSoon();
});
const qClear = xn$('xnQClear');
if (qClear) qClear.addEventListener('click', () => {
_xnQQ = '';
if (qSearch) { qSearch.value = ''; qSearch.focus(); }
xnQSearchPaint();
xnQApply();
});
const qGrid = xn$('xnQGrid');
if (qGrid) {
qGrid.addEventListener('scroll', xnQMaybeAppend, { passive: true });
qGrid.addEventListener('click', e => {
const b = e.target.closest('.xn-mini');
if (!b || b.dataset.qi == null) return;
const m = _xnQHand[Number(b.dataset.qi)];
if (!m) return;
if (xnPickMode() === 'multi') { xnQPicksToggle(m, b); return; }
if (!xnSrcAllowedOf(m)) {
if (typeof showToast === 'function') showToast('这一来源没开启 · 去 心讯 → 来源 打开');
return;
}
if (_xnBusy) {
if (typeof showToast === 'function') showToast('等 ' + xnTaPhrase('接完这一手再推'));
return;
}
xnPlayCard(m);
xnCloseQDrawer();
});
}
const qMode = xn$('xnQMode');
if (qMode) qMode.addEventListener('click', () => { xnPickModeSet(xnPickMode() === 'multi' ? 'one' : 'multi'); });
const qPush = xn$('xnQPush');
if (qPush) qPush.addEventListener('click', xnQPushPicked);
const qFold = xn$('xnQFold');
if (qFold) qFold.addEventListener('click', xnCloseQDrawer);
const pclear = xn$('xnPickClear');
if (pclear) pclear.addEventListener('click', () => { _xnPicked = []; xnRenderFan(); xnSyncPick(); });
const psh = xn$('xnPushBtn');
if (psh) psh.addEventListener('click', xnPushPicked);
const grpClose = xn$('xnGrpClose');
if (grpClose) grpClose.addEventListener('click', xnCloseGrpPick);
const grpMask = xn$('xnGrpMask');
if (grpMask) grpMask.addEventListener('click', e => { if (e.target === grpMask) xnCloseGrpPick(); });
const grpIn = xn$('xnGrpSearch');
if (grpIn) grpIn.addEventListener('input', () => { _xnGrpQ = grpIn.value; xnRenderGrpPick(); });
const grpList = xn$('xnGrpList');
if (grpList) grpList.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-xn-grp-all],[data-xn-grp-i]') : null;
if (!b) return;
if (b.hasAttribute('data-xn-grp-all')) _xnFilterGrp = '';
else {
const g = _xnGrpPick[Number(b.dataset.xnGrpI)];
if (!g) return;
_xnFilterGrp = g.key;
}
xnCloseGrpPick();
xnApplyFilter();
});
const lookBtn = xn$('xnLookBtn');
if (lookBtn) lookBtn.addEventListener('click', xnOpenLook);
const lookClose = xn$('xnLookClose');
if (lookClose) lookClose.addEventListener('click', xnCloseLook);
const lookMask = xn$('xnLookMask');
if (lookMask) lookMask.addEventListener('click', e => { if (e.target === lookMask) xnCloseLook(); });
const setTabs = xn$('xnSetTabs');
if (setTabs) setTabs.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-xn-set]') : null;
if (b) xnSetTabSet(b.getAttribute('data-xn-set'));
});
const tlRow = xn$('xnTimelineRow');
if (tlRow) tlRow.addEventListener('click', () => xnTimelineSet(!xnTimelineOn()));
const replyModes = xn$('xnReplyModes');
if (replyModes) replyModes.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-xn-replymode]') : null;
if (b) xnReplyModeSet(b.getAttribute('data-xn-replymode'));
});
[['xnReplyMin', 'min'], ['xnReplyMax', 'max']].forEach(([id, key]) => {
const el = xn$(id);
if (!el) return;
el.addEventListener('input', () => xnReplyRangeSet(key, el.value));
el.addEventListener('change', () => { flushSave(); });
});
const bgUp = xn$('xnBgUpload');
if (bgUp) bgUp.addEventListener('click', () => { const i = xn$('xnBgInput'); if (i) i.click(); });
const bgIn = xn$('xnBgInput');
if (bgIn) bgIn.addEventListener('change', async e => {
await xnLookPickImage(e.target.files && e.target.files[0]);
e.target.value = '';
});
const bgClr = xn$('xnBgClear');
if (bgClr) bgClr.addEventListener('click', async () => {
xnLookSet({ img: '', veil: 0, blur: 0, zoom: 100 });
await flushSave();
if (typeof showToast === 'function') showToast('已清除心讯背景');
});
const presetHost = xn$('xnBgPresets');
if (presetHost) presetHost.addEventListener('click', e => {
const b = e.target.closest('.ap-bg-preset');
if (b) xnLookPickPreset(b.dataset.preset);
});
const skinHost = xn$('xnCardSkins');
if (skinHost) skinHost.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('.xn-skin') : null;
if (!b || !b.dataset.skin) return;
xnCardSet({ skin: b.dataset.skin });
flushSave();
});
[['xnBgVeil', 'veil', 0, 90, '%'], ['xnBgBlur', 'blur', 0, 24, 'px'], ['xnBgZoom', 'zoom', 100, 200, '%']].forEach(([id, key, min, max, unit]) => {
const el = xn$(id);
if (!el) return;
const put = () => {
const val = _xnLookClamp(el.value, min, max, min);
const out = xn$(id + 'Out');
if (out) out.textContent = val + unit;
xnLookSet({ [key]: val });
};
el.addEventListener('input', put);
el.addEventListener('change', () => { flushSave(); });
});
[['xnCardSee', 'see', 0, 80, '%'], ['xnCardR', 'radius', 0, 14, 'px']].forEach(([id, key, min, max, unit]) => {
const el = xn$(id);
if (!el) return;
const put = () => {
const val = _xnLookClamp(el.value, min, max, min);
const out = xn$(id + 'Out');
if (out) out.textContent = val + unit;
xnCardSet({ [key]: val });
};
el.addEventListener('input', put);
el.addEventListener('change', () => { flushSave(); });
});
const stylesHost = xn$('xnCardStyles');
if (stylesHost) stylesHost.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-style]') : null;
if (!b) return;
xnCardStyleSet(b.dataset.style);
flushSave();
});
const backsHost = xn$('xnCardBacks');
if (backsHost) backsHost.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-back]') : null;
if (!b) return;
xnCardSetBack(b.dataset.back);
flushSave();
});
const shadowsHost = xn$('xnCardShadows');
if (shadowsHost) shadowsHost.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-shadow]') : null;
if (!b) return;
xnCardSetShadow(b.dataset.shadow);
flushSave();
});
[['xnCardTextureRow', 'paper'], ['xnCardFrameRow', 'frame'],
['xnCardGuardRow', 'guard'], ['xnCardImgRow', 'imgFull']].forEach(([id, key]) => {
const row = xn$(id);
if (!row) return;
row.addEventListener('click', () => {
const v = xnCardView();
xnCardSet({ [key]: !v[key] });
flushSave();
});
});
[['xnHeadLine', 'headLine'], ['xnFootLine', 'footLine']].forEach(([id, key]) => {
const row = xn$(id);
if (!row) return;
row.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('.contact-chip') : null;
if (!b || !b.dataset.v) return;
if (xnBarView()[key] === b.dataset.v) return;
xnBarSet({ [key]: b.dataset.v });
flushSave();
});
});
[['xnHeadVeil', 'headVeil'], ['xnFootVeil', 'footVeil']].forEach(([id, key]) => {
const el = xn$(id);
if (!el) return;
const put = () => {
const val = _xnLookClamp(el.value, 0, 100, 0);
const out = xn$(id + 'Out');
if (out) out.textContent = val + '%';
xnBarSet({ [key]: val });
};
el.addEventListener('input', put);
el.addEventListener('change', () => { flushSave(); });
});
window.addEventListener('resize', xnMaybeAppendFan);
xnRenderWishChips();
xnRenderWishMode();
xnReplyCfgPaint();
xnPanelFoldSet(_xnPanelFolded);
xnPickModePaint();
xnApplyTimeline();
xnApplyBars();
xnRenderBars();
xnRenderSwitcher();
const srcChange = e => {
const el = e.target && e.target.closest ? e.target.closest('[data-xn-src]') : null;
if (el) xnSrcSet(el.getAttribute('data-xn-src'), el.checked);
};
['xnModeRowSet', 'xnModeRow'].forEach(id => {
const row = xn$(id);
if (row) row.addEventListener('change', srcChange);
});
xnSrcRenderAll();
xnSetTabSet('mode');
}
(function xnBoot() {
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', xnBind, { once: true });
else xnBind();
})();
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['xinxun'] = true;
