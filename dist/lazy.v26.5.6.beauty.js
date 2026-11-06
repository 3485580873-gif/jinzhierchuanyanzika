// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var AC_TABS = ['css', 'author', 'cards', 'cardcss', 'help'];
var AC_TAB_KEY = 'ordinal-apcss-tab';
var _acTab = 'css';
function _acTabApply() {
$$('#apcssTabs .mate-tag').forEach(b => b.classList.toggle('on', b.dataset.actab === _acTab));
$$('#apcssView .ac-grp').forEach(g => { g.hidden = g.dataset.acgrp !== _acTab; });
const pv = { bub: _acTab === 'css', cards: _acTab === 'cards' || _acTab === 'cardcss' };
$$('#apcssView [data-acpv]').forEach(el => { el.hidden = !pv[el.dataset.acpv]; });
_apcssPvSync();
}
function _apcssPvSync() {
const act = $('#apCardFam .contact-chip.active');
const cur = (act && act.dataset.apcfam) || '';
$$('#apcssView .ac-pv-it').forEach(it => {
const host = it.querySelector('.ac-pv-host');
it.hidden = !host || host.hidden || (_acTab === 'cardcss' && it.dataset.acfam !== cur);
});
}
function _acTabSet(t) {
if (AC_TABS.indexOf(t) < 0 || t === _acTab) return;
_acTab = t;
try { localStorage.setItem(AC_TAB_KEY, t); } catch (e) {}
_acTabApply();
}
(function _acTabInit() {
let v = '';
try { v = localStorage.getItem(AC_TAB_KEY) || ''; } catch (e) {}
if (AC_TABS.indexOf(v) >= 0) _acTab = v;
_acTabApply();
const row = $('#apcssTabs');
if (row) row.addEventListener('click', e => {
const b = e.target.closest('[data-actab]');
if (b) _acTabSet(b.dataset.actab);
});
})();
(function _apAuthorLibGo() {
const b = document.getElementById('apOpenAuthorLib');
if (b) b.onclick = () => { if (typeof showView === 'function') showView('authorlib'); };
})();
var _AC_CSS = [
'.pv{box-sizing:border-box;padding:10px 14px;background:#f2f2f2;',
'background-image:radial-gradient(circle,#dfdfdf 1px,rgba(0,0,0,0) 1.2px);background-size:13px 13px;',
"font-family:'MS Sans Serif','Microsoft YaHei','PingFang SC',sans-serif;color:#1c1c1e;",
'display:flex;flex-direction:column;gap:10px}',
'.message{display:flex;gap:8px;align-items:flex-end}',
'.message.mine{justify-content:flex-end}',
'.mini-avatar{width:40px;height:40px;flex:none;border-radius:50%;background:#fff;',
'border:1px solid #3b3b3b;color:#22334f;display:flex;align-items:center;justify-content:center;font-size:14px}',
'.initial-person{display:grid;place-items:center;width:100%;height:100%;border-radius:inherit;color:var(--person-ink,#8a8a8e)}',
'.initial-person svg{width:24px;height:24px;display:block}',
'.bubble-wrap{max-width:78%;display:flex;flex-direction:column;min-width:0}',
'.bubble{position:relative;font-size:14.5px;line-height:1.55;padding:10px 14px;border-radius:6px 20px 20px 20px;',
'background:#ffffff;color:#1c1c1e;border:0;word-break:break-word;white-space:pre-wrap}',
'.message.mine .bubble{border-radius:20px 6px 20px 20px;background:#cfe0f5}',
'.ft-time{font-size:11px;line-height:1.45;margin-top:5px;color:rgba(28,28,30,.34)}',
'.message.mine .ft-time{text-align:right}'
].join('');
var _AC_MINI = [
'<div class="message"><span class="mini-avatar"><span class="initial-person">' + PERSON_ICON + '</span></span>',
'<span class="bubble-wrap"><span class="bubble">像这样陪你聊天</span>',
'<span class="ft-time">21:30</span></span></div>',
'<div class="message mine"><span class="bubble-wrap"><span class="bubble">好呀，收到啦</span>',
'<span class="ft-time">21:31</span></span><span class="mini-avatar"><span class="initial-person">' + PERSON_ICON + '</span></span></div>'
].join('');
function _acCur() {
const a = (typeof _apView === 'function') ? _apView() : {};
return String((a && a.customBubbleCss) || '').trim();
}
function _acApply(id) {
if (typeof LL_BUB_PRESETS === 'undefined' || !Array.isArray(LL_BUB_PRESETS)) return;
const p = LL_BUB_PRESETS.filter(x => String(x.id) === String(id))[0];
if (!p) return;
if (typeof _apCanWrite === 'function' && !_apCanWrite()) return;
if (typeof _caSh !== 'function') return;
_caSh().customBubbleCss = String(p.css || '');
if (typeof applyAppearance === 'function') applyAppearance();
if (typeof renderApSettings === 'function') renderApSettings();
_acPaint();
if (typeof flushSave === 'function') flushSave();
if (typeof showToast === 'function') showToast(p.css ? ('已换上「' + p.name + '」') : '已回到默认气泡');
}
function _acPaint() {
const host = $('#apBubLib');
if (!host || typeof LL_BUB_PRESETS === 'undefined' || !Array.isArray(LL_BUB_PRESETS)) return;
const cur = _acCur();
host.innerHTML = LL_BUB_PRESETS.map(p => {
const on = String(p.css || '').trim() === cur;
return '<button type="button" class="ac-lib-item" data-apbubpre="' + escapeHTML(String(p.id || '')) + '"'
+ (on ? ' data-cur="1"' : '') + '>'
+ '<span class="ac-lib-nm">' + escapeHTML(String(p.name || ''))
+ (on ? '<span class="ac-lib-cur">当前</span>' : '') + '</span>'
+ '<span class="ac-lib-th" data-th="' + escapeHTML(String(p.id || '')) + '"></span>'
+ '</button>';
}).join('');
LL_BUB_PRESETS.forEach(p => {
const box = host.querySelector('.ac-lib-th[data-th="' + String(p.id || '').replace(/"/g, '\\"') + '"]');
if (!box || !box.attachShadow) return;
const root = box.attachShadow({ mode: 'open' });
const st = document.createElement('style');
st.textContent = _AC_CSS + '\n' + String(p.css || '');
const wrap = document.createElement('div');
wrap.className = 'pv';
wrap.innerHTML = _AC_MINI;
root.appendChild(st);
root.appendChild(wrap);
});
if (!host.__acBound) {
host.__acBound = 1;
host.addEventListener('click', e => {
const b = e.target.closest('[data-apbubpre]');
if (b) _acApply(b.dataset.apbubpre);
});
}
}
function renderApCssPage() {
const c = (typeof currentContact === 'function') ? currentContact() : null;
const nm = (c && typeof chatNameOf === 'function') ? chatNameOf(c) : 'TA';
const lead = $('#apcssLead');
if (lead) lead.textContent = '只改 ' + (nm || 'TA') + ' 的聊天气泡与卡片 · 别的页面与别位 TA 都不动';
const pa = $('#apcssPrevAv'), ma = $('#apcssPrevMe');
if (pa && typeof avatarHTML === 'function') {
const src = (c && typeof chatAvatarOf === 'function') ? chatAvatarOf(c) : '';
pa.innerHTML = avatarHTML(src || '');
}
if (ma && typeof avatarHTML === 'function') {
const mAv = (typeof chatMyAvatar === 'function') ? chatMyAvatar() : '';
ma.innerHTML = avatarHTML(mAv || '');
}
_apcssPrevCards();
renderApCardCss();
_acPaint();
if (typeof renderApSettings === 'function') renderApSettings();
}
function _apcssPrevDv(dvHost, av) {
let html = '';
try {
const pile = (typeof DIVINE_PILES === 'object' && DIVINE_PILES) ? (DIVINE_PILES.tarot || DIVINE_PILES.lenormand || null) : null;
const cards = (pile && typeof divineKeyOf === 'function') ? pile.slice(0, 3).map(c => ({ k: divineKeyOf(c), u: true })) : [];
if (cards.length && typeof _dvChatCardHTML === 'function') {
html = _dvChatCardHTML({ id: 'apcss-prev', from: 'me', dv: { sp: 'three', cards: cards, at: Date.now() } });
}
} catch (e) { html = ''; }
dvHost.innerHTML = html ? '<span class="bubble-wrap">' + html + '<span class="message-meta"><span class="ft-time">21:33</span></span></span>' + av : '';
dvHost.hidden = !html;
if (typeof _apcssPvSync === 'function') _apcssPvSync();
if (!html && typeof DIVINE_PILES === 'undefined' && typeof ensureChunk === 'function') {
ensureChunk('divine').then(ok => { if (ok) _apcssPrevDv(dvHost, av); });
}
}
function _apcssPrevCards() {
const _avHTML = src => '<span class="mini-avatar">' + avatarHTML(src || '') + '</span>';
const av = _avHTML((typeof chatMyAvatar === 'function') ? chatMyAvatar() : '');
const _c0 = (typeof currentContact === 'function') ? currentContact() : null;
const taAv = _avHTML((_c0 && typeof chatAvatarOf === 'function') ? chatAvatarOf(_c0) : '');
const askHost = $('#apcssPrevAsk');
if (askHost) {
let html = '';
try {
if (typeof _askCardHTML === 'function') {
html = _askCardHTML({ from: 'me', text: '今晚想听我讲哪一类？', ask: { kind: 'choice', opts: ['小时候的事', '今天遇到的', '你随便编一个'], status: 'waiting' } });
}
} catch (e) { html = ''; }
askHost.innerHTML = html ? '<span class="bubble-wrap ask-wrap">' + html + '<span class="message-meta"><span class="ft-time">21:32</span></span></span>' + av : '';
askHost.hidden = !html;
}
const dvHost = $('#apcssPrevDv');
if (dvHost) _apcssPrevDv(dvHost, av);
const lcHost = $('#apcssPrevLc');
if (lcHost) {
let html = '';
try {
if (typeof _lcChatCardHTML === 'function') {
const one = _lcChatCardHTML({ from: 'partner', lyr: {
mode: 'lyric', tid: '', dur: 269, name: '晴天', artist: '周杰伦',
lines: [{ t: 28.9, txt: '故事的小黄花', tr: 'The little yellow flower of the story' },
{ t: 32.4, txt: '从出生那年就飘着', tr: "It's been drifting since that year" }] } });
const two = _lcChatCardHTML({ from: 'partner', lyr: {
mode: 'melody', tid: '', dur: 269, seg: [112, 138], name: '晴天', artist: '周杰伦', lines: [] } });
const row = (card, tm) => '<div class="message">' + taAv
+ '<span class="bubble-wrap">' + card
+ '<span class="message-meta"><span class="ft-time">' + tm + '</span></span></span></div>';
html = (one ? row(one, '21:34') : '') + (two ? row(two, '21:35') : '');
}
} catch (e) { html = ''; }
lcHost.innerHTML = html;
lcHost.hidden = !html;
}
const clHost = $('#apcssPrevCl');
if (clHost) {
let el = null;
try {
if (typeof _coCardEl === 'function') {
const p = (typeof _plRoot === 'function') ? _plRoot() : (data.player = data.player || {});
if (!Array.isArray(p.invites)) p.invites = [];
const fake = { id: 'apcss-prev-co', cid: '', trackId: '', status: 'waiting', manual: true };
p.invites.push(fake);
let miniMine = '';
try { if (typeof getMiniAvatarHTML === 'function') miniMine = getMiniAvatarHTML()[2] || ''; } catch (e2) {}
try { el = _coCardEl({ id: 'apcss-prev-cl', from: 'system', co: fake.id }, '', miniMine); }
finally { p.invites = p.invites.filter(x => x !== fake); }
}
} catch (e) { el = null; }
clHost.innerHTML = '';
if (el) clHost.appendChild(el);
clHost.hidden = !el;
}
const taqHost = $('#apcssPrevTaask');
if (taqHost) {
let html = '';
try {
if (typeof _taAskCardHTML === 'function') {
html = _taAskCardHTML({ id: 'apcss-prev-taq', from: 'partner', text: '今天有没有哪一刻想起我？',
taAsk: { opts: ['有呀', '偶尔', '一直在想'], status: 'waiting' } });
}
} catch (e) { html = ''; }
taqHost.innerHTML = html ? taAv + '<span class="bubble-wrap ask-wrap">' + html
+ '<span class="message-meta"><span class="ft-time">21:32</span></span></span>' : '';
taqHost.hidden = !html;
}
const dealHost = $('#apcssPrevDeal');
if (dealHost) {
let html = '';
try {
if (typeof _dealCardHTML === 'function') {
html = _dealCardHTML({ id: 'apcss-prev-deal', from: 'me', deal: {
at: Date.now(), cat: '主字卡', title: '递给你的牌', by: 'ta', round: 1,
cards: [{ text: '今天晚上有点想你。' }, { text: '过来抱一下。' }] } });
}
} catch (e) { html = ''; }
dealHost.innerHTML = html ? '<span class="bubble-wrap">' + html
+ '<span class="message-meta"><span class="ft-time">21:33</span></span></span>' + av : '';
dealHost.hidden = !html;
}
const favHost = $('#apcssPrevFav');
if (favHost) {
let html = '';
try {
if (typeof _favChatCardHTML === 'function') {
html = _favChatCardHTML({ id: 'apcss-prev-fav', from: 'partner', fav: {
text: '今天路过那家店，想起你上次说的那句话。', reason: '这句我也记着', ts: Date.now(), kind: 'msg' } });
}
} catch (e) { html = ''; }
favHost.innerHTML = html ? taAv + '<span class="bubble-wrap">' + html
+ '<span class="message-meta"><span class="ft-time">21:34</span></span></span>' : '';
favHost.hidden = !html;
}
const cjwHost = $('#apcssPrevCjw');
if (cjwHost) {
let html = '';
try {
if (typeof _cjWorldCardHTML === 'function') {
html = _cjWorldCardHTML({ id: 'apcss-prev-cjw', from: 'partner', wcard: {
at: Date.now(), who: (_c0 && typeof chatNameOf === 'function') ? chatNameOf(_c0) : 'TA',
ta: [
{ k: '感知', v: '附近 · → 右侧 · TA 可能就在附近' },
{ k: '在做', v: '忙碌——在外面跑一趟，脚没停' },
{ k: '签名', v: '在等你先开口' },
{ k: '心情', v: '想念 · 雀跃' },
{ k: '连接', v: '慢半拍 · TA 会回，只是这轮隔得比平时久' },
{ k: 'TA 那边', v: '04:10 · 凌晨 · 多云 · 比现实快 6 小时 58 分' }
],
you: [{ k: '心情', v: '柔软 · 没劲' }, { k: '读到的心动', v: '心口一热' }, { k: '接住', v: '都听见了' }],
say: '说吧说吧，我今天想听你讲', sayAt: Date.now()
} });
}
} catch (e) { html = ''; }
cjwHost.innerHTML = html ? taAv + '<span class="bubble-wrap">' + html
+ '<span class="message-meta"><span class="ft-time">21:35</span></span></span>' : '';
cjwHost.hidden = !html;
}
const calHost = $('#apcssPrevCal');
if (calHost) {
let html = '';
try {
if (typeof _calCardHTML === 'function') {
html = _calCardHTML({ id: 'apcss-prev-cal', from: 'partner', cal: {
at: Date.now(), k: 'happy', e: '😊', t: '开心',
note: '早上好，今天什么事都顺，想第一时间告诉你' } });
}
} catch (e) { html = ''; }
calHost.innerHTML = html ? taAv + '<span class="bubble-wrap">' + html
+ '<span class="message-meta"><span class="ft-time">21:36</span></span></span>' : '';
calHost.hidden = !html;
}
if (typeof _apcssPvSync === 'function') _apcssPvSync();
}
var _apCardFam = 'ask';
var _apCardPrevHost = {
ask: 'apcssPrevAsk', taask: 'apcssPrevTaask', divine: 'apcssPrevDv', listen: 'apcssPrevCl',
lyric: 'apcssPrevLc', deal: 'apcssPrevDeal', fav: 'apcssPrevFav', cjw: 'apcssPrevCjw', cal: 'apcssPrevCal'
};
function _apCardFamOf(k) {
return (typeof AP_CARD_FAMS === 'object' && Array.isArray(AP_CARD_FAMS))
? (AP_CARD_FAMS.find(f => f.k === k) || AP_CARD_FAMS[0]) : null;
}
function renderApCardCss() {
if (typeof AP_CARD_FAMS !== 'object' || !Array.isArray(AP_CARD_FAMS)) return;
const fam = _apCardFamOf(_apCardFam);
if (!fam) return;
const a = (typeof _apView === 'function') ? (_apView() || {}) : {};
const val = String(a['cardCss' + fam.suf] || '');
const ta = $('#apCardCssText');
if (ta) ta.value = val;
$$('#apCardFam [data-apcfam]').forEach(b => {
const f = _apCardFamOf(b.dataset.apcfam);
b.classList.toggle('active', b.dataset.apcfam === fam.k);
b.dataset.dot = (f && String(a['cardCss' + f.suf] || '').trim()) ? '1' : '0';
});
const st = $('#apCardCssStatus');
if (st) st.textContent = val.trim()
? '「' + fam.name + '」已有单独样式 · 只作用于这一族'
: '「' + fam.name + '」还没有单独样式';
if (typeof _apcssPvSync === 'function') _apcssPvSync();
}
async function apCardCssApply() {
const fam = _apCardFamOf(_apCardFam);
if (!fam || typeof _caSh !== 'function') return;
const ta = $('#apCardCssText');
const val = String((ta && ta.value) || '').trim();
_caSh()['cardCss' + fam.suf] = val;
if (typeof applyAppearance === 'function') applyAppearance();
renderApCardCss();
if (typeof renderFoldSummaries === 'function') renderFoldSummaries();
if (typeof save === 'function') save();
if (typeof flushSave === 'function') { try { await flushSave(); } catch (e) {} }
if (typeof showToast === 'function') showToast(val
? '「' + fam.name + '」的卡片样式已更新'
: '已清空「' + fam.name + '」的单独样式');
}
(function _apCardBind() {
const row = $('#apCardFam');
if (row) row.addEventListener('click', e => {
const b = e.target.closest('[data-apcfam]');
if (!b || b.dataset.apcfam === _apCardFam) return;
_apCardFam = b.dataset.apcfam;
renderApCardCss();
const host = $('#' + (_apCardPrevHost[_apCardFam] || 'apcssLive'));
if (host && host.scrollIntoView) { try { host.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (err) {} }
});
const ap = $('#apCardCssApply');
if (ap) ap.addEventListener('click', apCardCssApply);
const cl = $('#apCardCssClear');
if (cl) cl.addEventListener('click', () => {
const ta = $('#apCardCssText');
if (ta) ta.value = '';
apCardCssApply();
});
})();
var AP_PV_MAX = 16;
var _apPvLast = '';
function _apPvTaNow() {
const ca = (data && data.chatAppearance && data.chatAppearance[data.activeChat]) || {};
const out = {};
Object.keys(ca).forEach(k => { if (AP_PV_TA_SKIP.indexOf(k) < 0) out[k] = ca[k]; });
return out;
}
function _apPvGlobNow() {
const ap = (data && data.appearance) || {};
const d = (typeof defaults === 'object' && defaults.appearance) || {};
const out = {};
AP_GLOB_KEYS.forEach(k => {
if (!(k in ap)) return;
if (_apPvNorm(ap[k]) === _apPvNorm(d[k])) return;
out[k] = ap[k];
});
const sh = (data && data.avatarShape) || 'circle';
if (sh !== ((typeof defaults === 'object' && defaults.avatarShape) || 'circle')) out.avatarShape = sh;
const msh = (data && data.myAvatarShape) || 'circle';
if (msh !== ((typeof defaults === 'object' && defaults.myAvatarShape) || 'circle')) out.myAvatarShape = msh;
return out;
}
function _apPvNorm(v) {
if (v === null || typeof v !== 'object') return JSON.stringify(v);
if (Array.isArray(v)) return '[' + v.map(_apPvNorm).join(',') + ']';
return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + _apPvNorm(v[k])).join(',') + '}';
}
function _apPvTaDiff(ta) {
const d = (typeof defaults === 'object' && defaults.chatAppearanceDefault) || {};
return Object.keys(ta || {}).filter(k => _apPvNorm(ta[k]) !== _apPvNorm(d[k])).length;
}
function _apPvGlobDiff(g) {
if (!g || typeof g !== 'object') return 0;
const d = (typeof defaults === 'object' && defaults.appearance) || {};
let n = 0;
AP_GLOB_KEYS.forEach(k => { if (k in g && _apPvNorm(g[k]) !== _apPvNorm(d[k])) n++; });
if (g.avatarShape && g.avatarShape !== ((typeof defaults === 'object' && defaults.avatarShape) || 'circle')) n++;
if (g.myAvatarShape && g.myAvatarShape !== ((typeof defaults === 'object' && defaults.myAvatarShape) || 'circle')) n++;
return n;
}
function _apPvLib() {
if (!data.apPresets || typeof data.apPresets !== 'object' || Array.isArray(data.apPresets)) data.apPresets = {};
return data.apPresets;
}
function _apPvList() {
const lib = _apPvLib();
return Object.keys(lib).map(k => lib[k]).filter(p => p && typeof p === 'object' && p.id)
.sort((x, y) => (Number(y.at) || 0) - (Number(x.at) || 0));
}
function _apPvNow() {
const a = (typeof _apView === 'function') ? (_apView() || {}) : {};
const _n = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
const _c = (v, lo, hi, d) => Math.min(hi, Math.max(lo, Math.round(_n(v, d))));
const cardCss = {};
if (typeof AP_CARD_FAMS === 'object' && Array.isArray(AP_CARD_FAMS)) {
AP_CARD_FAMS.forEach(f => { cardCss[f.k] = String(a['cardCss' + f.suf] || ''); });
}
return {
css: a.customBubbleCss || '',
fontCss: a.customGlobalFontCss || '',
cardCss: cardCss,
sw: {
cards: a.bubcssCards !== false, divine: a.bubcssDivine !== false,
listen: a.bubcssListen !== false, lyric: a.bubcssLyric !== false,
deal: a.bubcssDeal === true, cjw: a.bubcssCjw !== false,
fav: a.bubcssFav !== false, cal: a.bubcssCal !== false
},
bg: {
img: a.chatBg || '',
luma: (typeof a.chatBgLuma === 'number' && isFinite(a.chatBgLuma)) ? a.chatBgLuma : null,
veil: _c(a.bgVeil, 0, 100, 0),
wash: _c(a.bgWash, 0, 90, 0),
x: _c(a.bgPosX, 0, 100, 50), y: _c(a.bgPosY, 0, 100, 50),
zoom: _c(a.bgZoom, 100, 300, 100),
fit: (a.bgFit === 'contain' || a.bgFit === 'repeat') ? a.bgFit : 'cover',
range: (a.bgRange === 'page' || a.bgRange === 'msg') ? a.bgRange : 'bars'
},
ta: _apPvTaNow(),
glob: _apPvGlobNow()
};
}
function _apPvSame(p, now) {
now = now || _apPvNow();
const bg = p.bg || {}, sw = p.sw || {};
const cc = p.cardCss || {};
const cardSame = (typeof AP_CARD_FAMS === 'object' && Array.isArray(AP_CARD_FAMS))
? AP_CARD_FAMS.every(f => String(cc[f.k] || '') === String((now.cardCss || {})[f.k] || ''))
: true;
const legacySame = (p.css || '') === now.css
&& (p.fontCss || '') === now.fontCss
&& cardSame
&& (bg.img || '') === now.bg.img
&& (sw.cards !== false) === now.sw.cards
&& (sw.divine !== false) === now.sw.divine
&& (sw.listen !== false) === now.sw.listen
&& (sw.lyric !== false) === now.sw.lyric
&& (sw.deal === true) === now.sw.deal
&& (sw.cjw !== false) === now.sw.cjw
&& (sw.fav !== false) === now.sw.fav
&& (sw.cal !== false) === now.sw.cal;
if (!legacySame) return false;
if (p.ta || p.glob) {
if (_apPvNorm(p.ta || {}) !== _apPvNorm(now.ta || {})) return false;
if (p.glob && _apPvNorm(p.glob) !== _apPvNorm(now.glob || {})) return false;
}
return true;
}
function _apPvDate(at) {
const t = Number(at) || 0;
if (!t) return '旧';
const d = new Date(t);
return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}
function _apPvBits(p) {
const bits = [];
if (p.css) bits.push('气泡');
if (p.fontCss) bits.push('字体');
if (p.bg && p.bg.img) bits.push('背景图');
if (typeof AP_CARD_FAMS === 'object' && Array.isArray(AP_CARD_FAMS)) {
const n = AP_CARD_FAMS.filter(f => String((p.cardCss || {})[f.k] || '').trim()).length;
if (n) bits.push('卡片 ' + n);
}
const tn = _apPvTaDiff(p.ta) + _apPvGlobDiff(p.glob);
if (tn) bits.push('外观 ' + tn + ' 项');
if (!bits.length) bits.push('空套');
return bits;
}
function _apPvRender() {
const host = $('#apPvList');
const list = _apPvList();
const empty = $('#apPvEmpty');
if (empty) empty.hidden = list.length > 0;
const cnt = $('#apPvN');
if (cnt) cnt.textContent = list.length ? (list.length + ' / ' + AP_PV_MAX) : '';
const saveBtn = $('#apPvSave');
if (saveBtn) saveBtn.disabled = list.length >= AP_PV_MAX;
if (typeof _apPvTrayRender === 'function') _apPvTrayRender();
if (!host) return;
let now = null;
try { now = _apPvNow(); } catch (e) { now = null; }
host.innerHTML = list.map(p => {
const bg = p.bg || {};
const cur = now ? _apPvSame(p, now) : false;
const dirty = !cur && _apPvLast === p.id;
const bits = _apPvBits(p);
bits.push(_apPvDate(p.at));
const thStyle = bg.img ? ' style="background-image:url(' + bg.img + ')"' : '';
return '<div class="ap-pv-row' + (cur ? ' on' : '') + '" data-pv="' + escapeHTML(p.id) + '">'
+ '<button type="button" class="ap-pv-main" aria-pressed="' + (cur ? 'true' : 'false') + '">'
+ '<span class="ap-pv-th' + (bg.img ? ' has-img' : '') + '"' + thStyle + ' aria-hidden="true"><i class="ap-pv-b ap-pv-b1"></i><i class="ap-pv-b ap-pv-b2"></i></span>'
+ '<span class="ap-pv-tx"><span class="ap-pv-nm">' + escapeHTML(p.name || '未命名方案') + '</span>'
+ '<span class="ap-pv-meta">' + bits.map(b => escapeHTML(b)).join(' · ') + '</span></span>'
+ '<span class="ap-pv-cur">' + (cur ? '当前' : (dirty ? '已改' : '')) + '</span>'
+ '</button>'
+ '<span class="ap-pv-acts">'
+ '<button type="button" class="ap-pv-a" data-act="cover" title="用现在的样子覆盖这一套">存</button>'
+ '<button type="button" class="ap-pv-a" data-act="rename" title="给这一套改个名字">改名</button>'
+ '<button type="button" class="ap-pv-a" data-act="del" title="删掉这一套方案">删</button>'
+ '</span></div>';
}).join('');
}
function _apPvSave() {
const lib = _apPvLib();
const n = Object.keys(lib).length;
if (n >= AP_PV_MAX) { showToast('最多存 ' + AP_PV_MAX + ' 套，先删一套再存'); return; }
const now = _apPvNow();
const anyCard = Object.keys(now.cardCss || {}).some(k => String(now.cardCss[k] || '').trim());
const detail = _apPvTaDiff(now.ta) + _apPvGlobDiff(now.glob);
if (!now.css && !now.fontCss && !now.bg.img && !anyCard && !detail) { showToast('这一位还没改过任何东西，没有可存的'); return; }
const dflt = '方案 ' + (n + 1);
openModal('保存当前为一套', dflt, v => {
const name = String(v || '').trim().slice(0, 24) || dflt;
const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
lib[id] = Object.assign({ id: id, name: name, at: Date.now() }, now);
_apPvLast = id;
_apPvRender();
showToast('已存为一套：' + name);
save();
flushSave();
}, { okText: '保存' });
}
async function _apPvApply(id) {
const p = _apPvLib()[id];
if (!p) return;
if (typeof _caSh !== 'function' || typeof _apSh !== 'function') return;
let ca = _caSh(), ap = _apSh();
const sw = p.sw || {}, bg = p.bg || {};
if (p.ta && typeof p.ta === 'object' && !Array.isArray(p.ta)) {
const clean = {};
Object.keys(p.ta).forEach(k => { if (AP_PV_TA_SKIP.indexOf(k) < 0) clean[k] = p.ta[k]; });
data.chatAppearance[data.activeChat] = clean;
ca = data.chatAppearance[data.activeChat];
}
ca.customBubbleCss = p.css || '';
ca.bubcssCards = sw.cards !== false;
ca.bubcssDivine = sw.divine !== false;
ca.bubcssListen = sw.listen !== false;
ca.bubcssLyric = sw.lyric !== false;
ca.bubcssDeal = sw.deal === true;
ca.bubcssCjw = sw.cjw !== false;
ca.bubcssFav = sw.fav !== false;
ca.bubcssCal = sw.cal !== false;
if (typeof AP_CARD_FAMS === 'object' && Array.isArray(AP_CARD_FAMS)) {
AP_CARD_FAMS.forEach(f => {
ca['cardCss' + f.suf] = String((p.cardCss && p.cardCss[f.k]) || '');
});
}
ca.chatBg = bg.img || '';
ca.chatBgLuma = (typeof bg.luma === 'number' && isFinite(bg.luma)) ? bg.luma : null;
ca.bgVeil = Math.min(100, Math.max(0, Math.round(Number(bg.veil) || 0)));
ca.bgWash = Math.min(90, Math.max(0, Math.round(Number(bg.wash) || 0)));
ca.bgPosX = Math.min(100, Math.max(0, Math.round(typeof bg.x === 'number' && isFinite(bg.x) ? bg.x : 50)));
ca.bgPosY = Math.min(100, Math.max(0, Math.round(typeof bg.y === 'number' && isFinite(bg.y) ? bg.y : 50)));
ca.bgZoom = Math.min(300, Math.max(100, Math.round(Number(bg.zoom) || 100)));
ca.bgFit = (bg.fit === 'contain' || bg.fit === 'repeat') ? bg.fit : 'cover';
ca.bgRange = (bg.range === 'page' || bg.range === 'msg') ? bg.range : 'bars';
ca.bgFullbars = ca.bgRange !== 'msg';
ap.customGlobalFontCss = p.fontCss || '';
ap.customGlobalFontName = '';
if (p.glob && typeof p.glob === 'object' && !Array.isArray(p.glob)) {
AP_GLOB_KEYS.forEach(k => {
if (k in p.glob) ap[k] = p.glob[k];
else if (AP_GLOB_KEEP.indexOf(k) < 0) delete ap[k];
});
data.avatarShape = p.glob.avatarShape || ((typeof defaults === 'object' && defaults.avatarShape) || 'circle');
data.myAvatarShape = p.glob.myAvatarShape || ((typeof defaults === 'object' && defaults.myAvatarShape) || 'circle');
}
_apPvLast = id;
if (typeof applyAppearance === 'function') applyAppearance();
if (typeof renderApCssPage === 'function') renderApCssPage();
else if (typeof renderApSettings === 'function') renderApSettings();
if (typeof renderFoldSummaries === 'function') renderFoldSummaries();
if (typeof _apPvTrayRender === 'function') _apPvTrayRender();
showToast('已换上「' + (p.name || '未命名方案') + '」');
save();
await flushSave();
}
function _apPvCover(id) {
const p = _apPvLib()[id];
if (!p) return;
openModal('用现在的样子覆盖这一套？', '', () => {
const now = _apPvNow();
p.css = now.css; p.fontCss = now.fontCss; p.sw = now.sw; p.bg = now.bg;
p.cardCss = now.cardCss; p.ta = now.ta; p.glob = now.glob;
p.at = Date.now();
_apPvLast = id;
_apPvRender();
showToast('已覆盖「' + (p.name || '未命名方案') + '」');
save();
flushSave();
}, { okText: '覆盖', noInput: true, staticText: '「' + (p.name || '未命名方案') + '」会换成现在屏幕上的整套外观（三样素材＋配色/形状/时间/栏边＋全站排版）；聊天里正在用的样式不动。' });
}
function _apPvRename(id) {
const p = _apPvLib()[id];
if (!p) return;
openModal('给这一套改个名字', p.name || '', v => {
const nm = String(v || '').trim().slice(0, 24);
if (!nm || nm === p.name) return;
p.name = nm;
_apPvRender();
save();
flushSave();
}, { okText: '保存' });
}
function _apPvDel(id) {
const lib = _apPvLib(), p = lib[id];
if (!p) return;
openModal('删掉这一套方案？', '', () => {
delete lib[id];
if (_apPvLast === id) _apPvLast = '';
_apPvRender();
showToast('已删掉「' + (p.name || '未命名方案') + '」');
save();
flushSave();
}, { okText: '删除', danger: true, noInput: true, staticText: '「' + (p.name || '未命名方案') + '」从列表里消失。聊天里现在这套样式不会跟着变——要撤先换回别的方案或无样式。' });
}
function _apPvTrayRender() {
const pairs = [['#tunePvList', '#tunePvEmpty', '#tunePvN'], ['#matePvList', '#matePvEmpty', '#matePvN']];
if (!pairs.some(([h]) => $(h))) return;
const list = _apPvList();
let now = null;
try { now = _apPvNow(); } catch (e) { now = null; }
const html = list.map(p => {
const cur = now ? _apPvSame(p, now) : false;
return '<div class="ap-pv-row' + (cur ? ' on' : '') + '" data-pv="' + escapeHTML(p.id) + '">'
+ '<button type="button" class="ap-pv-main" aria-pressed="' + (cur ? 'true' : 'false') + '">'
+ '<span class="ap-pv-tx"><span class="ap-pv-nm">' + escapeHTML(p.name || '未命名方案') + '</span>'
+ '<span class="ap-pv-meta">' + _apPvBits(p).map(b => escapeHTML(b)).join(' · ') + '</span></span>'
+ '<span class="ap-pv-cur">' + (cur ? '当前' : '') + '</span></button></div>';
}).join('');
pairs.forEach(([h, e, n]) => {
const host = $(h);
if (!host) return;
const empty = $(e);
if (empty) empty.hidden = list.length > 0;
const cnt = $(n);
if (cnt) cnt.textContent = list.length ? (list.length + ' / ' + AP_PV_MAX) : '';
host.innerHTML = html;
});
}
document.addEventListener('click', e => {
const row = e.target && e.target.closest ? e.target.closest('#tunePvList .ap-pv-row, #matePvList .ap-pv-row') : null;
if (!row) return;
_apPvApply(row.dataset.pv);
});
(function _apPvBind() {
const host = $('#apPvList');
if (host) host.addEventListener('click', e => {
const row = e.target.closest('.ap-pv-row');
if (!row) return;
const id = row.dataset.pv;
const actEl = e.target.closest('[data-act]');
if (actEl) {
const act = actEl.dataset.act;
if (act === 'cover') _apPvCover(id);
else if (act === 'rename') _apPvRename(id);
else if (act === 'del') _apPvDel(id);
return;
}
_apPvApply(id);
});
const saveBtn = $('#apPvSave');
if (saveBtn) saveBtn.addEventListener('click', _apPvSave);
})();
var LL_MAX = { bg: 16, bub: 32, font: 16, quote: 24 };
var LL_EDGE = 1280;
var _LL_RETRO_CSS = `body[data-ap-bubble=tail] .message:not(.mine) .bubble::before{
  left:-6px;bottom:8px;width:6px;height:6px;transform:none;border-radius:0;
  border:1px solid #3b3b3b;border-right:0;border-top:0;background:#ffffff;
}
body[data-ap-bubble=tail] .message.mine .bubble::before{
  right:-6px;bottom:8px;width:6px;height:6px;transform:none;border-radius:0;
  border:1px solid #3b3b3b;border-left:0;border-top:0;background:#91b1e2;
}
.message .bubble.bubble:not(.ask-card):not(.taask-card):not(.dv-card):not(.cl-card):not(.lc-card):not(.dl-card):not(.favc-card):not(.cjw-card){
  background:#ffffff;
  color:#1c1c1e;
  border:1px solid #3b3b3b;
  border-radius:0;
  box-shadow:inset 1px 1px 0 #ffffff,inset -1px -1px 0 #9a9a9a,2px 2px 0 rgba(80,104,152,.20);
  padding:calc(var(--bub-pad-y,10px) + 14px) var(--bub-pad-x,14px) var(--bub-pad-y,10px);
  font-family:'MS Sans Serif','Microsoft YaHei','PingFang SC',sans-serif;
  font-size:14px;
  line-height:1.62;
  letter-spacing:.2px;
  text-shadow:none;
}
.message:not(.mine) .bubble.bubble:not(.ask-card):not(.taask-card):not(.dv-card):not(.cl-card):not(.lc-card):not(.dl-card):not(.favc-card):not(.cjw-card):not(.sticker-message)::after,
.message:not(.mine) .bubble.sticker-message::after{
  content:"";
  position:absolute;
  left:0;right:0;top:0;
  height:14px;
  border-bottom:1px solid #506898;
  background-color:#91b1e2;
  background-image:
    linear-gradient(180deg,rgba(255,255,255,.45),rgba(255,255,255,0) 55%),
    linear-gradient(180deg,#ffffff,#d4d4d4),
    linear-gradient(180deg,#ffffff,#d4d4d4),
    linear-gradient(180deg,#ffffff,#d4d4d4);
  background-position:0 0,right 4px top 3px,right 14px top 3px,right 24px top 3px;
  background-size:100% 14px,9px 8px,9px 8px,9px 8px;
  background-repeat:no-repeat;
  border-radius:0;
  pointer-events:none;
}
.message.mine .bubble.bubble:not(.ask-card):not(.taask-card):not(.dv-card):not(.cl-card):not(.lc-card):not(.dl-card):not(.favc-card):not(.cjw-card){
  background:#91b1e2;
  color:#16243d;
  padding:var(--bub-pad-y,10px) var(--bub-pad-x,14px);
  box-shadow:inset 1px 1px 0 rgba(255,255,255,.55),inset -1px -1px 0 rgba(80,104,152,.55),2px 2px 0 rgba(80,104,152,.20);
}`;
var _LL_AQUA_CSS = `.message .bubble.bubble:not(.ask-card):not(.taask-card):not(.dv-card):not(.cl-card):not(.lc-card):not(.dl-card):not(.favc-card):not(.cjw-card):not(.recalled):not(.recall-peek-inline){
  background-color:#f2fbff;
  background-image:linear-gradient(180deg,#fbfeff 0%,#eaf6fc 62%,#e0f1f9 100%);
  border:1px solid #d6e8f1;
  border-bottom:2px solid #cbe2ee;
  border-radius:16px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 -6px 10px -8px rgba(70,130,160,.25),0 3px 6px -3px rgba(40,90,120,.16),0 14px 24px -18px rgba(24,84,116,.5);
  color:#1e3c48;
  letter-spacing:.02em;
  line-height:1.62;
}
.message.mine .bubble.bubble:not(.ask-card):not(.taask-card):not(.dv-card):not(.cl-card):not(.lc-card):not(.dl-card):not(.favc-card):not(.cjw-card):not(.recalled):not(.recall-peek-inline){
  background-color:#cfebf7;
  background-image:linear-gradient(180deg,#e4f7fe 0%,#c9e9f6 60%,#b8dff0 100%);
  border-color:#b3d9ea;
  border-bottom-color:#a3cfe2;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.9),inset 0 -6px 10px -8px rgba(40,110,145,.28),0 3px 6px -3px rgba(30,90,120,.18),0 14px 24px -18px rgba(16,74,108,.5);
  color:#123541;
}
body[data-ap-bubble=tail] .message:not(.mine) .bubble.bubble::before,
body[data-ap-bubble=imsg] .message:not(.mine) .bubble.bubble::before{
  border-left-color:#d6e8f1;
  border-bottom-color:#cbe2ee;
  background:#e6f4fb;
}
body[data-ap-bubble=tail] .message.mine .bubble.bubble::before,
body[data-ap-bubble=imsg] .message.mine .bubble.bubble::before{
  background:#bcdff0;
}`;
var _LL_CAP_CSS = `.message .bubble.bubble:not(.ask-card):not(.taask-card):not(.dv-card):not(.cl-card):not(.lc-card):not(.dl-card):not(.favc-card):not(.cjw-card):not(.recalled):not(.recall-peek-inline){
  background-color:#ffffff;
  background-image:linear-gradient(180deg,#ffffff 0%,#fafafb 52%,#eff0f3 100%);
  border:1px solid rgba(0,0,0,.09);
  border-radius:18px;
  box-shadow:inset 0 1px 0 #ffffff,0 3px 0 rgba(0,0,0,.10),0 14px 24px -14px rgba(0,0,0,.42);
  color:#141518;
  letter-spacing:.02em;
  line-height:1.6;
}
.message.mine .bubble.bubble:not(.ask-card):not(.taask-card):not(.dv-card):not(.cl-card):not(.lc-card):not(.dl-card):not(.favc-card):not(.cjw-card):not(.recalled):not(.recall-peek-inline){
  background-color:#f9cdd9;
  background-image:linear-gradient(180deg,#fde3ea 0%,#f9d0da 54%,#f4b3c4 100%);
  border:1px solid rgba(178,96,118,.28);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.90),0 3px 0 rgba(178,96,118,.28),0 14px 24px -14px rgba(130,50,76,.42);
  color:#4a1f2e;
}
body[data-ap-bubble=tail] .message:not(.mine) .bubble.bubble::before,
body[data-ap-bubble=imsg] .message:not(.mine) .bubble.bubble::before{
  border-left-color:rgba(0,0,0,.09);
  border-bottom-color:rgba(0,0,0,.09);
  background:#eff0f3;
}
body[data-ap-bubble=tail] .message.mine .bubble.bubble::before,
body[data-ap-bubble=imsg] .message.mine .bubble.bubble::before{
  background:#f4b3c4;
}`;
var LL_BUB_PRESETS = [
{
id: 'sysbub-default',
name: '默认气泡（原版）',
css: ''
},
{
id: 'sysbub-milk',
name: '液态玻璃 · 柔白',
css: '.bubble{background:linear-gradient(152deg,rgba(255,255,255,.86) 0%,rgba(246,250,254,.52) 40%,rgba(238,244,251,.44) 70%,rgba(250,252,255,.60) 100%)!important;'
+ '-webkit-backdrop-filter:blur(20px) saturate(175%) brightness(1.03)!important;backdrop-filter:blur(20px) saturate(175%) brightness(1.03)!important;'
+ 'border:1px solid rgba(255,255,255,.86)!important;'
+ 'box-shadow:inset 0 1px 0 rgba(255,255,255,1),inset 0 -1px 0 rgba(255,255,255,.60),inset 0 -18px 24px -16px rgba(90,110,140,.12),0 10px 24px -14px rgba(38,58,92,.18),0 2px 6px -3px rgba(38,58,92,.08)!important}'
},
{
id: 'sysbub-aqua',
name: '水色浅蓝',
css: _LL_AQUA_CSS
},
{
id: 'sysbub-cap',
name: '键帽 · 粉白',
css: _LL_CAP_CSS
},
{
id: 'sysbub-retro',
name: '复古小框',
css: _LL_RETRO_CSS
}
];
function _llBubPreset(id) {
const k = String(id || '');
for (let i = 0; i < LL_BUB_PRESETS.length; i++) if (LL_BUB_PRESETS[i].id === k) return LL_BUB_PRESETS[i];
return null;
}
var LL_TABS = ['plan', 'bg', 'bub', 'font', 'quote', 'rand'];
var LL_TAB_KEY = 'ordinal-looklib-tab';
var _llTab = 'plan';
function _llWhoSync() {
const who = $('#llRandOwners');
if (!who) return;
const n = (data && Array.isArray(data.contacts)) ? _apRandContacts().length : 0;
who.hidden = (_llTab === 'font') || n < 2;
}
function _llTabApply() {
const row = $('#llTags');
if (!row) return;
$$('#llTags .mate-tag').forEach(b => b.classList.toggle('on', b.dataset.lltab === _llTab));
$$('#looklibView .ll-sec[data-ll-tab]').forEach(g => { g.hidden = g.dataset.llTab !== _llTab; });
_llWhoSync();
}
function _llTabSet(t) {
if (LL_TABS.indexOf(t) < 0 || t === _llTab) return;
_llTab = t;
try { localStorage.setItem(LL_TAB_KEY, t); } catch (e) {}
_llTabApply();
}
(function _llTabInit() {
let v = '';
try { v = localStorage.getItem(LL_TAB_KEY) || ''; } catch (e) {}
if (LL_TABS.indexOf(v) >= 0) _llTab = v;
_llTabApply();
const row = $('#llTags');
if (row) row.addEventListener('click', e => {
const b = e.target.closest('[data-lltab]');
if (b) _llTabSet(b.dataset.lltab);
});
})();
var _llEdit = { bg: false, bub: false, font: false, quote: false };
function _llBox() {
if (!data || typeof data !== 'object') return { bg: {}, bub: {}, font: {} };
if (!data.apAssets || typeof data.apAssets !== 'object' || Array.isArray(data.apAssets)) data.apAssets = {};
const r = data.apAssets;
['bg', 'bub', 'font', 'quote'].forEach(k => {
if (!r[k] || typeof r[k] !== 'object' || Array.isArray(r[k])) r[k] = {};
});
return r;
}
function _llMap(kind) { return _llBox()[kind]; }
function _llList(kind) {
const m = _llMap(kind);
return Object.keys(m).map(k => m[k]).filter(it => it && it.id)
.sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
}
function _llNid() { return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function _llDate(at) {
const t = Number(at) || 0;
if (!t) return '旧';
const d = new Date(t);
return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}
function _llKB(n) {
const v = Number(n) || 0;
return v >= 1024 ? (v / 1024).toFixed(1) + ' KB' : Math.round(v) + ' B';
}
function _llBaseName(nm) {
return String(nm || '').replace(/\.[^.\\/]+$/, '').trim().slice(0, 20);
}
function _llCurVal(kind) {
if (kind === 'quote') return _llQuoteSig(_llQuoteSnap());
if (kind === 'bg') return (typeof _caSh === 'function' ? (_caSh().chatBg || '') : '');
if (kind === 'bub') return (typeof _caSh === 'function' ? String(_caSh().customBubbleCss || '').trim() : '');
return (typeof _apSh === 'function' ? String(_apSh().customGlobalFontCss || '').trim() : '');
}
function _llFind(kind, val) {
if (!val) return '';
const m = _llMap(kind);
if (kind === 'quote') {
const ks = Object.keys(m);
for (let i = 0; i < ks.length; i++) { const it = m[ks[i]]; if (it && _llQuoteSig(it.style) === val) return ks[i]; }
return '';
}
const keys = Object.keys(m);
for (let i = 0; i < keys.length; i++) {
const it = m[keys[i]];
if (!it) continue;
if (kind === 'bg' ? it.img === val : String(it.css || '').trim() === String(val).trim()) return keys[i];
}
return '';
}
function _llAdd(kind, item) {
const m = _llMap(kind);
const key = (kind === 'quote') ? _llQuoteSig(item.style) : (kind === 'bg' ? (item.img || '') : String(item.css || '').trim());
if (!key) return '';
const dup = _llFind(kind, key);
if (dup) return dup;
if (Object.keys(m).length >= LL_MAX[kind]) {
showToast('最多存 ' + LL_MAX[kind] + ' 份，先删一份再存');
return '';
}
const id = _llNid();
let mx = 0;
Object.keys(m).forEach(k => { const t = Number(m[k] && m[k].at) || 0; if (t > mx) mx = t; });
m[id] = Object.assign({ id: id, at: Math.max(Date.now(), mx + 1) }, item);
return id;
}
function _llItem(kind, id) {
if (kind === 'bub') {
const p = _llBubPreset(id);
if (p) return p;
}
if (kind === 'bg') {
const p = (typeof _bgAlbumItem === 'function') ? _bgAlbumItem(id) : null;
if (p) return { id: p.id, name: p.name, img: _bgAlbumURL(p.id) };
}
const m = _llMap(kind);
return (m && m[id]) || null;
}
async function _llApply(kind, id) {
const it = _llItem(kind, id);
if (!it) return;
if (kind === 'bg') {
if (!it.img) return;
const ca = _caSh();
ca.chatBg = it.img;
ca.chatBgLuma = (typeof it.luma === 'number' && isFinite(it.luma)) ? it.luma : null;
if (ca.chatBgLuma == null && typeof _imgLuma === 'function') {
try {
const lum = await _imgLuma(it.img);
ca.chatBgLuma = (typeof lum === 'number' && isFinite(lum)) ? Math.round(lum * 1000) / 1000 : null;
it.luma = ca.chatBgLuma;
} catch (e) {}
}
} else if (kind === 'quote') {
const ca = _caSh();
QUOTE_STYLE_KEYS.forEach(k => { if (it.style && k in it.style) ca[k] = it.style[k]; });
applyAppearance();
if (typeof resetMessageRender === 'function') resetMessageRender();
if (typeof renderMessages === 'function') renderMessages();
renderApSettings();
if (typeof renderQuoteFramePage === 'function') { try { renderQuoteFramePage(); } catch (e) {} }
if (typeof renderFoldSummaries === 'function') renderFoldSummaries();
showToast('已换上「' + (it.name || '未命名') + '」');
save();
await flushSave();
return;
} else if (kind === 'bub') {
_caSh().customBubbleCss = String(it.css || '');
} else {
const s = _apSh();
s.customGlobalFontCss = String(it.css || '');
s.customGlobalFontName = '';
}
applyAppearance();
renderApSettings();
if (typeof renderFoldSummaries === 'function') renderFoldSummaries();
showToast('已换上「' + (it.name || '未命名') + '」');
save();
await flushSave();
}
function _llRender() {
_llRenderBg();
_llRenderCss('bub');
_llRenderCss('font');
_llRenderQuote();
_llPaintEdit();
_llMarkCur();
_llSum();
_apRandRender();
}
function _llSum() {
const el = $('#sumLookLib');
const el2 = $('#sumLookLibG');
if (!el && !el2) return;
const bits = [];
const n = k => Object.keys(_llMap(k)).length;
const np = (data && data.apPresets && typeof data.apPresets === 'object') ? Object.keys(data.apPresets).length : 0;
if (np) bits.push(np + ' 套方案');
if (n('bg')) bits.push(n('bg') + ' 张图');
if (n('bub')) bits.push(n('bub') + ' 份气泡');
if (n('font')) bits.push(n('font') + ' 份字体');
if (n('quote')) bits.push(n('quote') + ' 套引用框');
const txt = bits.length ? bits.join(' · ') : '整套方案 · 背景图 · 气泡样式 · 字体样式 · 引用框样式';
if (el) el.textContent = txt;
if (el2) el2.textContent = txt;
}
var AP_RAND_HEAT_MSG = 3;
var AP_RAND_COOLDOWN_MS = 60 * 60 * 1000;
var AP_RAND_WHY = { msg: '聊得正密', letter: '信刚到', call: '刚通过电话' };
var AP_RAND_RATES = {
1: { need: 60, max: 1, name: '很少' },
2: { need: 25, max: 2, name: '偶尔' },
3: { need: 10, max: 4, name: '常换' }
};
var AP_RAND_DEFAULT_RATE = 2;
function _apRandRoot() {
if (!data.apRand || typeof data.apRand !== 'object' || Array.isArray(data.apRand)) data.apRand = { by: {} };
if (!data.apRand.by || typeof data.apRand.by !== 'object' || Array.isArray(data.apRand.by)) data.apRand.by = {};
return data.apRand;
}
function _apRandNewPool() {
return { bub: [], bg: [], en: false, rate: AP_RAND_DEFAULT_RATE,
heat: 0, why: '', whyAt: 0, day: '', dayN: 0, last: 0, lastWhy: '' };
}
function _apRandRead(cid) {
const by = (data && data.apRand && data.apRand.by) ? data.apRand.by : null;
const p = by ? by[cid] : null;
return (p && typeof p === 'object' && !Array.isArray(p)) ? p : null;
}
function _apRandPool(cid) {
const by = _apRandRoot().by;
if (!by[cid] || typeof by[cid] !== 'object' || Array.isArray(by[cid])) by[cid] = _apRandNewPool();
const p = by[cid];
['bub', 'bg'].forEach(k => { if (!Array.isArray(p[k])) p[k] = []; });
if (p.rate !== 1 && p.rate !== 2 && p.rate !== 3) p.rate = AP_RAND_DEFAULT_RATE;
if (typeof p.en !== 'boolean') p.en = false;
if (typeof p.heat !== 'number' || !isFinite(p.heat)) p.heat = 0;
return p;
}
function _apRandContacts() { return (data.contacts || []).filter(c => c && c.id && c.kind !== 'group'); }
function _apRandCid() {
const list = _apRandContacts();
if (list.some(c => c.id === data.activeChat)) return data.activeChat;
return (list[0] && list[0].id) || '';
}
function _apRandCfg(pool) { return AP_RAND_RATES[pool && pool.rate] || AP_RAND_RATES[AP_RAND_DEFAULT_RATE]; }
function _apRandDayKey(ts) { const d = ts ? new Date(ts) : new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function _apRandQuiet() { const h = new Date().getHours(); return h >= 23 || h < 8; }
function _apRandCooled(pool) {
const t = Number(pool && pool.last) || 0;
return t > 0 && Date.now() - t < AP_RAND_COOLDOWN_MS;
}
function _apRandWhyFresh(pool) {
const txt = pool && typeof pool.why === 'string' ? pool.why : '';
if (!txt) return '';
const at = Number(pool.whyAt) || 0;
return at && _apRandDayKey(at) === _apRandDayKey() ? txt : '';
}
function _apRandBook(cid) {
if (!data.chatAppearance) data.chatAppearance = {};
if (!data.chatAppearance[cid]) data.chatAppearance[cid] = Object.assign({}, defaults.chatAppearanceDefault);
return data.chatAppearance[cid];
}
function _apRandCur(kind, cid) {
const b = (data.chatAppearance && data.chatAppearance[cid]) || {};
return kind === 'bg' ? String(b.chatBg || '') : String(b.customBubbleCss || '').trim();
}
function _apRandCands(pool, cid) {
const out = [];
if (!pool || !cid) return out;
const curBub = _apRandCur('bub', cid), curBg = _apRandCur('bg', cid);
(pool.bub || []).forEach(id => {
const it = _llItem('bub', id);
if (!it || String(it.css || '').trim() === curBub) return;
out.push({ k: 'bub', it: it });
});
(pool.bg || []).forEach(id => {
const it = _llItem('bg', id);
if (!it || !it.img || it.img === curBg) return;
out.push({ k: 'bg', it: it });
});
return out;
}
function aprandFeed(cid, weight, kind) {
const c = (data.contacts || []).find(x => x && x.id === cid);
if (!c || c.kind === 'group') return;
const pool = _apRandRead(cid);
if (!pool || !pool.en || _apRandCooled(pool)) return;
if (!_apRandCands(pool, cid).length) return;
const w = Number(weight) || 0;
if (w <= 0) return;
pool.heat = Math.min((Number(pool.heat) || 0) + w, 999);
const why = AP_RAND_WHY[kind] || '';
if (why) { pool.why = why; pool.whyAt = Date.now(); }
}
function aprandTick() {
if (typeof isSchedulerLeader === 'function' && !isSchedulerLeader()) return;
_apRandContacts().forEach(c => {
const pool = _apRandRead(c.id);
if (!pool || !pool.en) return;
if (_apRandQuiet() || _apRandCooled(pool)) return;
const cfg = _apRandCfg(pool);
const dk = _apRandDayKey();
if (pool.day !== dk) { pool.day = dk; pool.dayN = 0; }
if ((Number(pool.dayN) || 0) >= cfg.max) return;
if ((Number(pool.heat) || 0) < cfg.need) return;
const cands = _apRandCands(pool, c.id);
if (!cands.length) { pool.heat = 0; pool.why = ''; pool.whyAt = 0; return; }
const hit = cands[Math.floor(Math.random() * cands.length)];
const why = _apRandWhyFresh(pool);
pool.heat = 0; pool.why = ''; pool.whyAt = 0;
pool.dayN = (Number(pool.dayN) || 0) + 1;
pool.last = Date.now();
pool.lastWhy = why;
_apRandApply(c.id, hit.k, hit.it, why);
});
}
function _apRandApply(cid, kind, it, why) {
const ca = _apRandBook(cid);
if (kind === 'bub') {
ca.customBubbleCss = String(it.css || '');
} else {
ca.chatBg = it.img || '';
ca.chatBgLuma = (typeof it.luma === 'number' && isFinite(it.luma)) ? it.luma : null;
}
const cm = (data.contacts || []).find(x => x && x.id === cid);
const nm = (cm && chatNameOf(cm)) || 'TA';
if (cid === data.activeChat) {
if (typeof applyAppearance === 'function') applyAppearance();
if (document.body.dataset.view === 'looklib') { _llMarkCur(); _apRandRender(); }
showToast(nm + (kind === 'bub' ? ' 换了一种气泡样式' : ' 换了一张聊天背景') + (why ? '（' + why + '）' : ''));
}
save();
if (typeof flushSave === 'function') flushSave();
}
function _apRandDropId(kind, id) {
const by = (data && data.apRand && data.apRand.by) ? data.apRand.by : null;
if (!by) return;
Object.keys(by).forEach(cid => {
const p = by[cid];
if (!p || !Array.isArray(p[kind])) return;
const i = p[kind].indexOf(id);
if (i >= 0) p[kind].splice(i, 1);
});
}
function _apRandRender() {
const owners = $('#llRandOwners');
if (!owners) return;
const list = _apRandContacts();
_llWhoSync();
const sec = $('#llRandSec');
if (sec) sec.hidden = !list.length;
const cid = _apRandCid();
const activeId = (data && data.activeChat) || '';
owners.innerHTML = list.map(c =>
'<button type="button" class="av-chip' + (c.id === activeId ? ' on' : '') + '" data-ll-rand-cid="' + escapeHTML(c.id) + '">'
+ '<span class="avatar av-chip-ava">' + avatarHTML(chatAvatarOf(c)) + '</span>'
+ '<span class="av-chip-name">' + escapeHTML(chatNameOf(c) || 'TA') + '</span></button>'
).join('');
const on = owners.querySelector('.av-chip.on');
if (on) owners.scrollLeft = on.offsetLeft - (owners.clientWidth - on.offsetWidth) / 2;
if (!cid) return;
const pool = _apRandPool(cid);
const cfg = _apRandCfg(pool);
$$('#llRandEn .contact-chip').forEach(b => b.classList.toggle('active', (b.dataset.v === 'on') === !!pool.en));
$$('#llRandRate .contact-chip').forEach(b => b.classList.toggle('active', Number(b.dataset.v) === pool.rate));
const bubList = LL_BUB_PRESETS.concat(_llList('bub'));
const bubHost = $('#llRandBubPool');
if (bubHost) bubHost.innerHTML = bubList.map(it => {
const hit = pool.bub.indexOf(it.id) >= 0;
return '<button type="button" class="contact-chip' + (hit ? ' active' : '') + '" data-ll-rand-bub="' + escapeHTML(it.id) + '">' + escapeHTML(it.name || '未命名') + '</button>';
}).join('');
const bgList = _llList('bg');
const bgHost = $('#llRandBgPool');
const empty = $('#llRandEmpty');
if (empty) {
empty.hidden = bgList.length > 0;
empty.textContent = bgList.length ? '' : '背景图库还空着——先去「背景图」那一档传几张，再回来勾上它们。';
}
if (bgHost) bgHost.innerHTML = bgList.map(it => {
const hit = pool.bg.indexOf(it.id) >= 0;
return '<div class="ll-cell' + (hit ? ' on' : '') + '" data-ll-rand-bg="' + escapeHTML(it.id) + '">'
+ '<button type="button" class="ll-pick" aria-pressed="' + (hit ? 'true' : 'false') + '" title="点一下入池／出池">'
+ '<span class="ll-thumb" style="background-image:url(' + it.img + ')" aria-hidden="true"><span class="ll-cur">' + (hit ? '入池' : '') + '</span></span>'
+ '</button></div>';
}).join('');
const n = $('#llRandN');
if (n) n.textContent = (pool.bub.length + pool.bg.length) ? (pool.bub.length + ' 份气泡 · ' + pool.bg.length + ' 张图') : '';
const note = $('#llRandNote');
if (note) {
const needN = Math.max(1, Math.round(cfg.need / AP_RAND_HEAT_MSG));
let s = '「' + cfg.name + '」：TA 回你大约 ' + needN + ' 句话的工夫，可能换一样；一天最多 ' + cfg.max + ' 次，夜里（23:00–08:00）不换。';
if (!(pool.bub.length + pool.bg.length)) s += '现在还没勾东西——点上面的名字或缩略图，勾上就会轮到。';
else if (!pool.en) s += '开关关着，先点「开」。';
if (pool.last) s += '上次：' + _llDate(pool.last) + (pool.lastWhy ? '（' + pool.lastWhy + '）' : '') + '。';
note.textContent = s;
}
}
function _llPaintEdit() {
[['bg', '#llBgEdit'], ['bub', '#llBubEdit'], ['font', '#llFontEdit'], ['quote', '#llQuoteEdit']].forEach(([kind, sel]) => {
const b = $(sel);
if (!b) return;
const on = !!_llEdit[kind];
b.textContent = on ? '完成' : '管理';
b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
[['bg', '#llBgEditRow', '把当前这张存进来'],
['bub', '#llBubEditRow', '把当前这段气泡 CSS 存进来'],
['font', '#llFontEditRow', '把当前这段字体 CSS 存进来'],
['quote', '#llQuoteEditRow', '把这一位的引用框样式存进来']].forEach(([kind, sel, label]) => {
const host = $(sel);
if (!host) return;
if (!_llEdit[kind]) {
host.hidden = true;
host.innerHTML = '';
delete host.dataset.kind;
return;
}
host.hidden = false;
if (host.dataset.kind !== kind || !host.firstElementChild) {
host.dataset.kind = kind;
host.innerHTML = '<button type="button" class="ll-addrow" data-act="savecur">' + escapeHTML(label) + '</button>';
}
});
}
function _llRenderBg() {
const host = $('#llBgGrid');
if (!host) return;
const list = _llList('bg');
const empty = $('#llBgEmpty');
if (empty) empty.hidden = list.length > 0;
const cnt = $('#llBgN');
if (cnt) cnt.textContent = list.length ? (list.length + ' / ' + LL_MAX.bg) : '';
const cur = _llCurVal('bg');
const edit = !!_llEdit.bg;
const cell = it => {
const on = !!it.img && it.img === cur;
const bg = it.img ? ' style="background-image:url(' + it.img + ')"' : '';
return '<div class="ll-cell' + (on ? ' on' : '') + '" data-id="' + escapeHTML(it.id) + '">'
+ '<button type="button" class="ll-pick" aria-pressed="' + (on ? 'true' : 'false') + '" title="换上这一张">'
+ '<span class="ll-thumb"' + bg + ' aria-hidden="true"><span class="ll-cur">' + (on ? '当前' : '') + '</span></span>'
+ '</button>'
+ (edit && !it.sys ? '<button type="button" class="ll-x" data-act="del" aria-label="从库里删掉这张">×</button>' : '')
+ '</div>';
};
const alb = (typeof BG_ALBUM !== 'undefined') ? BG_ALBUM : [];
host.innerHTML = (alb.length ? '<p class="ll-sub">内置图鉴 · 点一下就换</p>' : '')
+ alb.map(p => cell({ id: p.id, img: (typeof _bgAlbumURL === 'function') ? _bgAlbumURL(p.id) : '', sys: true })).join('')
+ (alb.length ? '<p class="ll-sub">我存的</p>' : '')
+ list.map(it => cell(it)).join('');
}
function _llCssRow(kind, it, on, edit, sys) {
const meta = sys ? ('内置 · ' + (String(it.css || '').trim() ? '点一下就换' : '出厂那一套')) : (_llKB(String(it.css || '').length) + ' · ' + _llDate(it.at));
return '<div class="ap-pv-row' + (on ? ' on' : '') + (sys ? ' is-sys' : '') + '" data-id="' + escapeHTML(it.id) + '">'
+ '<button type="button" class="ap-pv-main" aria-pressed="' + (on ? 'true' : 'false') + '" title="换上这一份">'
+ '<span class="ap-pv-th ll-th-a" aria-hidden="true">' + (kind === 'bub' ? 'Aa' : '字') + '</span>'
+ '<span class="ap-pv-tx"><span class="ap-pv-nm">' + escapeHTML(it.name || '未命名') + '</span>'
+ '<span class="ap-pv-meta">' + escapeHTML(meta) + '</span></span>'
+ '<span class="ap-pv-cur">' + (on ? '当前' : '') + '</span>'
+ '</button>'
+ ((edit && sys) ? '<span class="ap-pv-acts">'
+ '<button type="button" class="ap-pv-a" data-act="savecopy" title="把这一款存进我的库">存一份</button>'
+ '</span>' : '')
+ ((edit && !sys) ? '<span class="ap-pv-acts">'
+ '<button type="button" class="ap-pv-a" data-act="rename" title="给这一份改个名字">改名</button>'
+ '<button type="button" class="ap-pv-a" data-act="del" title="从库里删掉这一份">删</button>'
+ '</span>' : '')
+ '</div>';
}
function _llRenderCss(kind) {
const host = $('#' + (kind === 'bub' ? 'llBubList' : 'llFontList'));
if (!host) return;
const list = _llList(kind);
const sys = (kind === 'bub') ? LL_BUB_PRESETS : [];
const empty = $('#' + (kind === 'bub' ? 'llBubEmpty' : 'llFontEmpty'));
if (empty) empty.hidden = sys.length ? list.length > 0 : (list.length + sys.length) > 0;
const cnt = $('#' + (kind === 'bub' ? 'llBubN' : 'llFontN'));
if (cnt) cnt.textContent = list.length ? (list.length + ' / ' + LL_MAX[kind]) : '';
const cur = _llCurVal(kind);
const edit = !!_llEdit[kind];
const _cssOn = it => String(it.css || '').trim() === cur;
host.innerHTML = (sys.length ? '<p class="ll-sub">作者自带</p>' : '')
+ sys.map(it => _llCssRow(kind, it, _cssOn(it), edit, true)).join('')
+ (sys.length ? '<p class="ll-sub">我存的</p>' : '')
+ list.map(it => _llCssRow(kind, it, _cssOn(it), edit, false)).join('');
}
function _llQuoteSnap() {
const ca = (typeof _caSh === 'function') ? _caSh() : {};
const o = {};
const d = defaults.chatAppearanceDefault || {};
QUOTE_STYLE_KEYS.forEach(k => { o[k] = (ca[k] === undefined) ? d[k] : ca[k]; });
return o;
}
function _llQuoteSig(st) {
const o = {};
const d = defaults.chatAppearanceDefault || {};
QUOTE_STYLE_KEYS.forEach(k => { o[k] = (st && st[k] !== undefined) ? st[k] : d[k]; });
return JSON.stringify(o);
}
function _llQuoteMeta(st) {
const f = ({ auto: '自动', embed: '嵌在气泡里', merge: '连成一块', float: '浮在上方' })[st.quoteForm] || '自动';
const fo = st.quoteFollow === 'off' ? '不跟气泡' : (st.quoteFollow === 'on' ? '始终跟气泡' : '自动跟气泡');
return f + ' · ' + fo;
}
function _llQuoteRow(it, on, edit) {
const meta = _llQuoteMeta(it.style || {}) + ' · ' + _llDate(it.at);
return '<div class="ap-pv-row' + (on ? ' on' : '') + '" data-id="' + escapeHTML(it.id) + '">'
+ '<button type="button" class="ap-pv-main" aria-pressed="' + (on ? 'true' : 'false') + '" title="换上这一套">'
+ '<span class="ap-pv-th ll-th-a" aria-hidden="true">引</span>'
+ '<span class="ap-pv-tx"><span class="ap-pv-nm">' + escapeHTML(it.name || '未命名') + '</span>'
+ '<span class="ap-pv-meta">' + escapeHTML(meta) + '</span></span>'
+ '<span class="ap-pv-cur">' + (on ? '当前' : '') + '</span>'
+ '</button>'
+ (edit ? '<span class="ap-pv-acts">'
+ '<button type="button" class="ap-pv-a" data-act="rename" title="给这一套改个名字">改名</button>'
+ '<button type="button" class="ap-pv-a" data-act="del" title="从库里删掉这一套">删</button>'
+ '</span>' : '')
+ '</div>';
}
function _llRenderQuote() {
const host = $('#llQuoteList');
if (!host) return;
const list = _llList('quote');
const cur = _llCurVal('quote');
const empty = $('#llQuoteEmpty');
if (empty) empty.hidden = list.length > 0;
const cnt = $('#llQuoteN');
if (cnt) cnt.textContent = list.length ? (list.length + ' / ' + LL_MAX.quote) : '';
host.innerHTML = list.map(it => _llQuoteRow(it, _llQuoteSig(it.style) === cur, !!_llEdit.quote)).join('');
}
function _llMarkCur() {
['bg', 'bub', 'font', 'quote'].forEach(kind => {
const host = $('#' + (kind === 'bg' ? 'llBgGrid' : (kind === 'bub' ? 'llBubList' : (kind === 'font' ? 'llFontList' : 'llQuoteList'))));
if (!host) return;
const cur = _llCurVal(kind);
host.querySelectorAll('[data-id]').forEach(row => {
const it = _llItem(kind, row.dataset.id);
const on = !!it && (kind === 'bg' ? (!!it.img && it.img === cur)
: (kind === 'quote' ? _llQuoteSig(it.style) === cur : (String(it.css || '').trim() === cur)));
row.classList.toggle('on', on);
const tag = row.querySelector('.ll-cur') || row.querySelector('.ap-pv-cur');
if (tag) tag.textContent = on ? '当前' : '';
const main = row.querySelector('.ll-pick') || row.querySelector('.ap-pv-main');
if (main) main.setAttribute('aria-pressed', on ? 'true' : 'false');
});
});
}
function _llReadText(file) {
return new Promise(resolve => {
const r = new FileReader();
r.onload = () => resolve(typeof r.result === 'string' ? r.result : '');
r.onerror = () => resolve('');
r.readAsText(file);
});
}
async function _llUploadBg(files) {
const arr = [].slice.call(files || []);
if (!arr.length) return;
let added = 0, lastId = '';
for (let i = 0; i < arr.length; i++) {
const f = arr[i];
const img = await fileData(f, LL_EDGE, 0.8);
if (!img) continue;
let luma = null;
if (typeof _imgLuma === 'function') {
try {
const v = await _imgLuma(img);
luma = (typeof v === 'number' && isFinite(v)) ? Math.round(v * 1000) / 1000 : null;
} catch (e) {}
}
const existed = !!_llFind('bg', img);
const id = _llAdd('bg', { name: _llBaseName(f.name) || '背景', img: img, luma: luma });
if (id && !existed) added++;
if (id) lastId = id;
}
_llRender();
if (!lastId) { save(); await flushSave(); return; }
await _llApply('bg', lastId);
if (added > 1) showToast('已存进库 ' + added + ' 张');
}
async function _llUploadCss(kind, files) {
const arr = [].slice.call(files || []);
if (!arr.length) return;
let added = 0, lastId = '';
for (let i = 0; i < arr.length; i++) {
const f = arr[i];
if (f.size > MAX_FILE_SIZE) { showToast('「' + (f.name || '文件') + '」超过 5MB，装不进存档'); continue; }
const text = await _llReadText(f);
if (!text || !text.trim()) { showToast('「' + (f.name || '文件') + '」是空的，没有可存的内容'); continue; }
const css = text.trim();
const existed = !!_llFind(kind, css);
const id = _llAdd(kind, { name: _llBaseName(f.name) || (kind === 'bub' ? '气泡样式' : '字体样式'), css: css });
if (id && !existed) added++;
if (id) lastId = id;
}
_llRender();
if (!lastId) { save(); await flushSave(); return; }
await _llApply(kind, lastId);
if (added > 1) showToast('已存进库 ' + added + ' 份');
}
function _llSaveSysBub(id) {
const p = LL_BUB_PRESETS.filter(x => String(x.id) === String(id))[0];
if (!p) return;
const val = String(p.css || '').trim();
if (!val) { showToast('「' + p.name + '」是出厂那一套，没有 CSS 可存'); return; }
const dup = _llFind('bub', val);
if (dup) { _llMarkCur(); showToast('这一份已经在库里了'); return; }
if (_llList('bub').length >= LL_MAX.bub) { showToast('最多存 ' + LL_MAX.bub + ' 份，先删一份再存'); return; }
openModal('把这一款存进我的库', String(p.name || '').slice(0, 20), v => {
const name = String(v || '').trim().slice(0, 20) || String(p.name || '气泡样式');
const id2 = _llAdd('bub', { name: name, css: val });
if (!id2) return;
_llRender();
showToast('已存进库：' + name);
save();
flushSave();
}, { okText: '存进库', maxlength: 20 });
}
function _llSaveCur(kind) {
if (kind === 'quote') {
const qval = _llCurVal('quote');
if (_llFind('quote', qval)) { _llMarkCur(); showToast('这一套已经在库里了'); return; }
if (_llList('quote').length >= LL_MAX.quote) { showToast('最多存 ' + LL_MAX.quote + ' 套，先删一套再存'); return; }
const qd = '引用框样式 ' + (_llList('quote').length + 1);
openModal('给这一套起个名字', qd, v => {
const name = String(v || '').trim().slice(0, 20) || qd;
const id = _llAdd('quote', { name: name, style: _llQuoteSnap() });
if (!id) return;
_llRender();
showToast('已存进库：' + name);
save();
flushSave();
}, { okText: '存进库', maxlength: 20 });
return;
}
const val = _llCurVal(kind);
if (!val) {
showToast(kind === 'bg' ? '这一位还没有背景图，先在「添加」里传一张'
: (kind === 'bub' ? '这一位的气泡 CSS 还空着，先去「气泡 CSS」页写一段' : '字体 CSS 还空着，先去「全站字体」页写一段'));
return;
}
const dup = _llFind(kind, val);
if (dup) { _llMarkCur(); showToast('这一份已经在库里了'); return; }
if (_llList(kind).length >= LL_MAX[kind]) { showToast('最多存 ' + LL_MAX[kind] + ' 份，先删一份再存'); return; }
const n = _llList(kind).length;
const dflt = (kind === 'bg' ? '背景 ' : (kind === 'bub' ? '气泡样式 ' : '字体样式 ')) + (n + 1);
openModal('给这一份起个名字', dflt, v => {
const name = String(v || '').trim().slice(0, 20) || dflt;
const item = (kind === 'bg')
? { name: name, img: val, luma: (typeof _caSh().chatBgLuma === 'number' && isFinite(_caSh().chatBgLuma)) ? _caSh().chatBgLuma : null }
: { name: name, css: val };
const id = _llAdd(kind, item);
if (!id) return;
_llRender();
showToast('已存进库：' + name);
save();
flushSave();
}, { okText: '存进库', maxlength: 20 });
}
function _llRename(kind, id) {
const it = _llMap(kind)[id];
if (!it) return;
openModal('给这一份改个名字', it.name || '', v => {
const nm = String(v || '').trim().slice(0, 20);
if (!nm || nm === it.name) return;
it.name = nm;
_llRender();
save();
flushSave();
}, { okText: '保存', maxlength: 20 });
}
function _llDel(kind, id) {
const m = _llMap(kind), it = m[id];
if (!it) return;
openModal('从库里删掉这一份？', '', () => {
delete m[id];
_apRandDropId(kind, id);
_llRender();
showToast('已删掉「' + (it.name || '未命名') + '」');
save();
flushSave();
}, {
okText: '删除', danger: true, noInput: true,
staticText: (kind === 'bg' ? '只从收藏里拿掉这一张。' : '只从收藏里拿掉「' + (it.name || '未命名') + '」。')
+ '聊天里此刻正在用的样式不会跟着变——要换回去，去点另一份。'
});
}
function renderLookLibPage() {
const c = (typeof currentContact === 'function') ? currentContact() : null;
const nm = (c && typeof chatNameOf === 'function') ? chatNameOf(c) : 'TA';
const lead = $('#looklibLead');
if (lead) lead.textContent = '正在改「' + (nm || 'TA') + '」 · 方案存整套外观，三本素材库各换一样；点一下就换上';
_llRender();
_llTabApply();
if (typeof renderApSettings === 'function') renderApSettings();
else if (typeof _apPvRender === 'function') _apPvRender();
}
(function _llBind() {
const bg = $('#llBgGrid');
if (bg) bg.addEventListener('click', e => {
const cell = e.target.closest('[data-id]');
if (!cell) return;
const act = e.target.closest('[data-act]');
if (act) { if (act.dataset.act === 'del') _llDel('bg', cell.dataset.id); return; }
_llApply('bg', cell.dataset.id);
});
[['bub', '#llBubList'], ['font', '#llFontList'], ['quote', '#llQuoteList']].forEach(([kind, sel]) => {
const host = $(sel);
if (!host) return;
host.addEventListener('click', e => {
const row = e.target.closest('[data-id]');
if (!row) return;
const act = e.target.closest('[data-act]');
if (act) {
if (act.dataset.act === 'rename') _llRename(kind, row.dataset.id);
else if (act.dataset.act === 'del') _llDel(kind, row.dataset.id);
else if (act.dataset.act === 'savecopy') _llSaveSysBub(row.dataset.id);
return;
}
_llApply(kind, row.dataset.id);
});
});
[['bg', '#llBgEditRow'], ['bub', '#llBubEditRow'], ['font', '#llFontEditRow'], ['quote', '#llQuoteEditRow']].forEach(([kind, sel]) => {
const host = $(sel);
if (!host) return;
host.addEventListener('click', e => {
if (e.target.closest('[data-act=savecur]')) _llSaveCur(kind);
});
});
[['bg', '#llBgEdit'], ['bub', '#llBubEdit'], ['font', '#llFontEdit'], ['quote', '#llQuoteEdit']].forEach(([kind, sel]) => {
const b = $(sel);
if (b) b.addEventListener('click', () => { _llEdit[kind] = !_llEdit[kind]; _llRender(); });
});
const up = (btnSel, inputSel, fn) => {
const b = $(btnSel), inp = $(inputSel);
if (b && inp) b.addEventListener('click', () => inp.click());
if (inp) inp.addEventListener('change', async e => {
const files = [].slice.call(e.target.files || []);
e.target.value = '';
await fn(files);
});
};
up('#llBgUpload', '#llBgInput', files => _llUploadBg(files));
up('#llBubUpload', '#llBubInput', files => _llUploadCss('bub', files));
up('#llFontUpload', '#llFontInput', files => _llUploadCss('font', files));
const _rrSave = () => { save(); if (typeof flushSave === 'function') flushSave(); };
const _rrRe = () => { _apRandRender(); _rrSave(); };
const rOwners = $('#llRandOwners');
if (rOwners) rOwners.addEventListener('click', e => {
const chip = e.target.closest('[data-ll-rand-cid]');
if (!chip) return;
const cid = chip.dataset.llRandCid;
if (!cid || cid === ((data && data.activeChat) || '')) return;
if (typeof switchChat === 'function') switchChat(cid, true);
else { data.activeChat = cid; }
renderLookLibPage();
});
const rEn = $('#llRandEn');
if (rEn) rEn.addEventListener('click', e => {
const b = e.target.closest('[data-v]');
if (!b) return;
const cid = _apRandCid(); if (!cid) return;
_apRandPool(cid).en = (b.dataset.v === 'on');
_rrRe();
});
const rRate = $('#llRandRate');
if (rRate) rRate.addEventListener('click', e => {
const b = e.target.closest('[data-v]');
if (!b) return;
const cid = _apRandCid(); if (!cid) return;
const n = Number(b.dataset.v);
if (n !== 1 && n !== 2 && n !== 3) return;
_apRandPool(cid).rate = n;
_rrRe();
});
const rBub = $('#llRandBubPool');
if (rBub) rBub.addEventListener('click', e => {
const b = e.target.closest('[data-ll-rand-bub]');
if (!b) return;
const cid = _apRandCid(); if (!cid) return;
const pool = _apRandPool(cid), id = b.dataset.llRandBub;
const i = pool.bub.indexOf(id);
if (i >= 0) pool.bub.splice(i, 1); else pool.bub.push(id);
_rrRe();
});
const rBg = $('#llRandBgPool');
if (rBg) rBg.addEventListener('click', e => {
const cell = e.target.closest('[data-ll-rand-bg]');
if (!cell) return;
const cid = _apRandCid(); if (!cid) return;
const pool = _apRandPool(cid), id = cell.dataset.llRandBg;
const i = pool.bg.indexOf(id);
if (i >= 0) pool.bg.splice(i, 1); else pool.bg.push(id);
_rrRe();
});
const go = $('#mateLookLibBtn');
if (go) go.addEventListener('click', () => { if (typeof showView === 'function') showView('looklib'); });
const go1b = $('#globalLookLibBtn');
if (go1b) go1b.addEventListener('click', () => { if (typeof showView === 'function') showView('looklib'); });
const go2 = $('#apcssLibBtn');
if (go2) go2.addEventListener('click', () => { if (typeof showView === 'function') showView('looklib'); });
const go3 = $('#apPvLiveSave');
if (go3) go3.addEventListener('click', () => {
if (typeof showView === 'function') showView('chat');
if (typeof tuneOpen === 'function') tuneOpen('plan');
});
})();
var _spEditCid = '';
var SP_PRESETS = {
now:    { soloBg: 'plain', soloImg: '', soloTone: 'std',   soloToneInk: '', soloToneA: 7, soloFace: 62, soloBlur: 0, soloRadius: 'auto',  soloR: 14, soloH: 52, soloShowAv: true, soloShowName: true,  soloShowSub: true,  soloShowGo: true, soloFont: 13.5, soloEdge: true, soloAvShape: '', soloAvR: 10 },
silver: { soloBg: 'chat',  soloImg: '', soloTone: 'std',   soloToneInk: '', soloToneA: 7, soloFace: 62, soloBlur: 6, soloRadius: 'auto',  soloR: 14, soloH: 52, soloShowAv: true, soloShowName: true,  soloShowSub: true,  soloShowGo: true, soloFont: 13.5, soloEdge: true, soloAvShape: '', soloAvR: 10 },
clean:  { soloBg: 'plain', soloImg: '', soloTone: 'light', soloToneInk: '', soloToneA: 5, soloFace: 62, soloBlur: 0, soloRadius: 'round', soloR: 14, soloH: 44, soloShowAv: true, soloShowName: false, soloShowSub: true,  soloShowGo: true, soloFont: 13,   soloEdge: false, soloAvShape: '', soloAvR: 10 }
};
function _spTarget() {
if (soloTuneOpen()) return soloTargetId();
const list = soloCandidates();
if (_spEditCid && list.some(c => c.id === _spEditCid)) return _spEditCid;
return soloTargetId() || (list[0] ? list[0].id : '');
}
function _spBook(cid) {
if (!cid) return null;
if (!data.chatAppearance) data.chatAppearance = {};
if (!data.chatAppearance[cid] || typeof data.chatAppearance[cid] !== 'object') {
data.chatAppearance[cid] = Object.assign({}, defaults.chatAppearanceDefault);
}
return data.chatAppearance[cid];
}
function _spWho(cid) {
const c = (data.contacts || []).find(x => x.id === cid);
return (c && typeof chatNameOf === 'function') ? (chatNameOf(c) || _soloName(cid)) : _soloName(cid);
}
function _spRenderWho(cid) {
const row = document.getElementById('sfWhoRow');
if (!row) return;
const list = soloCandidates();
const key = list.map(c => c.id).join(',');
if (row.getAttribute('data-ids') !== key) {
row.setAttribute('data-ids', key);
row.innerHTML = list.map(c => '<button type="button" class="contact-chip" data-spcid="' + escapeHTML(c.id) + '">' + escapeHTML(_spWho(c.id)) + '</button>').join('');
}
row.hidden = !list.length;
Array.prototype.forEach.call(row.querySelectorAll('[data-spcid]'), b => {
b.classList.toggle('active', b.getAttribute('data-spcid') === cid);
});
}
function _spFitPreview() {
const wrap = document.getElementById('sfPreviewWrap');
const box = document.getElementById('sfPreviewBox');
if (!wrap || !box || wrap.hidden) return;
const w = wrap.clientWidth;
if (!w) return;
const wv = parseFloat(box.style.getPropertyValue('--sp-w')) || 100;
const base = 390 * (wv / 100);
const z = Math.min(1, w / base);
box.style.width = base + 'px';
box.style.transform = z >= 1 ? 'none' : 'scale(' + (Math.round(z * 1000) / 1000) + ')';
wrap.style.height = Math.round(box.offsetHeight * z) + 'px';
}
function renderSoloPreview(rebuild) {
const wrap = document.getElementById('sfPreviewWrap');
const box = document.getElementById('sfPreviewBox');
if (!wrap || !box) return;
const cid = _spTarget();
const c = cid ? (data.contacts || []).find(x => x.id === cid) : null;
if (!c || !_spHasRows(cid)) { wrap.hidden = true; box.innerHTML = ''; return; }
const k = soloPeekCfg(cid);
wrap.hidden = false;
if (rebuild) box.innerHTML = _spHTML(c, k);
_spApplyLook(box, k);
const body = box.querySelector('.sp-body');
if (body) body.scrollTop = body.scrollHeight;
_spFitPreview();
}
function renderSoloFramePage() {
const cid = _spTarget();
_spRenderWho(cid);
const has = !!cid;
const wrap = document.getElementById('sfPreviewWrap');
const ctl = document.getElementById('sfCtl');
const empty = document.getElementById('sfEmpty');
if (empty) empty.hidden = has;
if (wrap) wrap.hidden = !has;
if (ctl) ctl.hidden = !has;
if (has) { renderSoloTuneControls(); renderSoloPreview(true); }
renderSoloTuneEntry();
}
function renderSoloTuneEntry() {
const el = document.getElementById('sumSoloTune');
const btn = document.getElementById('sfTuneEntry');
const note = document.getElementById('sfNote');
const cid = _spTarget();
const solo = soloTargetId();
if (!cid) {
if (el) el.textContent = '还没有单聊联系人：先在通讯录里加一位';
if (btn) { btn.disabled = true; btn.title = '先添加一位单聊联系人'; }
if (note) note.textContent = '';
return;
}
const k = soloPeekCfg(cid);
const toneTxt = { light: '更浅', std: '标准', deep: '更深', custom: '自定义' }[k.soloTone] || '标准';
const rTxt = k.soloRadius === 'custom' ? ('圆角 ' + k.soloR + 'px')
: ({ auto: '跟随卡片', sharp: '更利落', round: '更圆' }[k.soloRadius] || '跟随卡片');
const look = k.soloBg === 'chat'
? ('透聊天背景 · 白纱 ' + k.soloFace + '% · 磨砂 ' + k.soloBlur + 'px')
: (k.soloBg === 'img'
? ('自己的图 · 白纱 ' + k.soloFace + '% · 磨砂 ' + k.soloBlur + 'px')
: ('素色 · ' + toneTxt));
if (el) el.textContent = '「' + _spWho(cid) + '」· ' + look + ' · ' + k.soloH + '% · ' + rTxt;
const canTune = !!solo && cid === solo;
if (btn) {
btn.disabled = !canTune;
btn.title = canTune
? '回会话页打开边看边调（调的就是会话页那块真框）'
: (solo ? '边看边调只作用于当前单人模式那一位；这一位请直接在上面预览下调' : '先在 设置 → 通知 开启单人模式');
}
if (note) {
if (!_spHasRows(cid)) note.textContent = '这一位还没有可读的聊天记录：会话页那块框不会上屏，先聊一句再回来调。';
else if (canTune) note.textContent = '这块就是会话页那块真框的缩小版：下面每一格都当场生效；点「边看边调」回会话页看真框。';
else if (solo) note.textContent = '这一位不是当前单人模式那一位：预览可直接调（按人各存一份）；「边看边调」只作用于「' + _spWho(solo) + '」。';
else note.textContent = '还没有开启单人模式：预览可直接调；要让会话页出现这块框，去 设置 → 通知 选一位。';
}
}
function _spMatchPreset(k) {
const keys = ['soloBg', 'soloTone', 'soloToneInk', 'soloToneA', 'soloFace', 'soloBlur', 'soloRadius', 'soloR', 'soloH', 'soloShowAv', 'soloShowName', 'soloShowSub', 'soloShowGo', 'soloFont', 'soloEdge', 'soloAvShape', 'soloAvR'];
return Object.keys(SP_PRESETS).find(pk => keys.every(key => {
const a = SP_PRESETS[pk][key], b = k[key];
return a === b;
})) || '';
}
function renderSoloTuneControls() {
const cid = _spTarget();
const k = cid ? soloPeekCfg(cid) : null;
if (!k) return;
const scope = document.getElementById('soloTuneScope');
if (scope) scope.textContent = '只改「' + _spWho(cid) + '」这一位：按人各存一份，不动别人';
const mark = (rowId, val) => {
const r = document.getElementById(rowId);
if (r) Array.prototype.forEach.call(r.querySelectorAll('[data-v]'), b => b.classList.toggle('active', b.getAttribute('data-v') === val));
};
mark('sfBgRow', k.soloBg);
mark('sfToneRow', k.soloTone);
mark('sfRadiusRow', k.soloRadius);
mark('sfAvShapeRow', k.soloAvShape);
mark('sfPresetRow', _spMatchPreset(k));
mark('sfHFixRow', k.soloHFix ? 'fix' : 'auto');
const warm = document.getElementById('sfWarmRow');
if (warm) Array.prototype.forEach.call(warm.querySelectorAll('[data-v]'), b => {
b.classList.toggle('active', k.soloTone === 'custom' && (b.getAttribute('data-v') || '').toLowerCase() === (k.soloToneInk || '').toLowerCase());
});
const show = (id, on) => { const e = document.getElementById(id); if (e) e.hidden = !on; };
show('sfImgWrap', k.soloBg === 'img');
show('sfFaceWrap', k.soloBg === 'chat' || k.soloBg === 'img');
show('sfRwrap', k.soloRadius === 'custom');
show('sfAvRwrap', k.soloAvShape === 'custom');
show('sfToneCust', k.soloTone === 'custom');
const toneWrap = document.getElementById('sfToneRowWrap');
if (toneWrap) toneWrap.hidden = k.soloBg !== 'plain';
const chatWrap = document.getElementById('sfChatWrap');
if (chatWrap) {
const noChat = k.soloBg === 'chat' && !k.img;
chatWrap.hidden = k.soloBg !== 'chat';
const hint = document.getElementById('sfChatHint');
if (hint) hint.textContent = noChat
? '这一位还没有聊天背景图：先去 TA 的设置 → 外观 传一张，再回这里选「透聊天背景图」。'
: '这一位有聊天背景图：这块框会跟着它走（那边换图，这边也跟着换）。';
}
const thumb = document.getElementById('sfImgThumb');
if (thumb) {
const own = (k.soloBg === 'img' && k.img) ? k.img : '';
thumb.hidden = !own;
thumb.style.backgroundImage = own ? 'url("' + own + '")' : '';
}
const setRange = (id, v, suf) => {
const el = document.getElementById(id); if (el) el.value = String(v);
const out = document.getElementById(id + 'Out'); if (out) out.value = v + suf;
};
setRange('sfFace', k.soloFace, '%');
setRange('sfBlur', k.soloBlur, 'px');
setRange('sfH', k.soloH, '%');
setRange('sfR', k.soloR, 'px');
setRange('sfAvR', k.soloAvR, 'px');
setRange('sfFont', k.soloFont, 'px');
setRange('sfToneA', k.soloToneA, '%');
setRange('sfW', k.soloW, '%');
setRange('sfGlow', k.soloGlow, '');
setRange('sfLh', k.soloLh, '');
const ink = document.getElementById('sfToneInk');
if (ink) ink.value = k.soloToneInk || '#111111';
const chk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };
chk('sfAv', k.soloShowAv); chk('sfName', k.soloShowName); chk('sfSub', k.soloShowSub); chk('sfGo', k.soloShowGo);
chk('sfEdge', k.soloEdge); chk('sfPaper', k.soloPaper);
const txt = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v || ''; };
txt('sfSubTxt', k.soloSub); txt('sfGoTxt', k.soloGoTxt);
const col = (id, v, dv) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v || dv; };
col('sfBubTa', k.soloBubTa, '#f7e8c3'); col('sfBubMe', k.soloBubMe, '#ffffff');
}
function _spRefresh(rebuild, doSave, skipCtl) {
const edit = _spTarget();
const solo = soloTargetId();
const real = document.getElementById('soloPeek');
if (edit && solo && edit === solo && real && !real.hidden) {
if (rebuild) renderSoloPeek();
else _spApplyLook(real, soloPeekCfg(solo));
}
if (!skipCtl) renderSoloTuneControls();
if (!soloTuneOpen()) renderSoloPreview(rebuild);
renderSoloTuneEntry();
if (doSave !== false) save();
}
function _spApplyTab(sec) {
const tabs = document.getElementById('soloTuneTabs');
if (tabs) Array.prototype.forEach.call(tabs.querySelectorAll('.tune-tab'), t => {
t.classList.toggle('on', t.getAttribute('data-solo-sec') === sec);
});
const host = document.getElementById('soloTuneBody') || document.getElementById('sfCtl');
if (!host) return;
Array.prototype.forEach.call(host.querySelectorAll('[data-solo-body]'), s => {
s.hidden = s.getAttribute('data-solo-body') !== sec;
});
if (host.id === 'soloTuneBody') host.scrollTop = 0;
}
function _spMoveControls(toTray) {
const pageHost = document.getElementById('sfCtl');
const trayBody = document.getElementById('soloTuneBody');
if (!pageHost || !trayBody) return;
const secs = Array.prototype.slice.call(document.querySelectorAll('[data-solo-body]'));
secs.forEach(s => (toTray ? trayBody : pageHost).appendChild(s));
if (toTray) _spApplyTab('bg');
else secs.forEach(s => { s.hidden = false; });
}
function soloTuneOpen() {
const p = document.getElementById('soloTunePanel');
return !!p && !p.hidden;
}
function _spSpacer(on) {
const view = document.getElementById('chatsView');
if (!view) return;
const old = document.getElementById('soloTuneSpacer');
if (!on) { if (old && old.parentNode) old.parentNode.removeChild(old); return; }
const tray = document.getElementById('soloTunePanel');
const h = tray ? Math.round(tray.getBoundingClientRect().height) : 0;
const sp = old || document.createElement('div');
sp.id = 'soloTuneSpacer';
sp.setAttribute('aria-hidden', 'true');
sp.style.flex = 'none';
sp.style.height = (h + 12) + 'px';
if (!sp.parentNode) view.appendChild(sp);
}
function soloTuneKeepVisible() {
const p = document.getElementById('soloTunePanel');
const view = document.getElementById('chatsView');
const box = document.getElementById('soloPeek');
if (!p || p.hidden || !view || !box || box.hidden) return;
_spSpacer(true);
const visible = Math.max(140, p.getBoundingClientRect().top - view.getBoundingClientRect().top);
const top = box.getBoundingClientRect().top - view.getBoundingClientRect().top + view.scrollTop;
const bottom = top + box.offsetHeight;
view.scrollTop = Math.max(0, bottom - visible + 12);
}
function openSoloTune() {
const cid = soloTargetId();
if (!cid) { showToast('先在 设置 → 通知 开启单人模式，并选一位联系人'); return false; }
if (_spTarget() !== cid) {
showToast('「边看边调」只作用于当前单人模式那一位；这一位请直接在上面预览下调');
return false;
}
if (!_spHasRows(cid)) { showToast('「' + _spWho(cid) + '」还没有可预览的聊天记录：先聊一句，再回来边看边调'); return false; }
const p = document.getElementById('soloTunePanel');
if (!p) return false;
if (typeof showView === 'function' && document.body.dataset.view !== 'chats') showView('chats');
_spMoveControls(true);
p.hidden = false;
p.style.bottom = '';
_spSpacer(true);
renderSoloTuneControls();
renderSoloTuneEntry();
requestAnimationFrame(() => requestAnimationFrame(() => {
if (typeof renderSoloPeek === 'function') renderSoloPeek();
renderSoloTuneControls();
soloTuneKeepVisible();
}));
return true;
}
function closeSoloTune() {
const p = document.getElementById('soloTunePanel');
if (!p || p.hidden) return;
p.hidden = true;
p.style.bottom = '';
_spSpacer(false);
_spMoveControls(false);
renderSoloFramePage();
}
(function bindSoloTune() {
const jump = document.getElementById('soloFramePageBtn');
if (jump) jump.addEventListener('click', () => { if (typeof showView === 'function') showView('soloframe'); });
const entry = document.getElementById('sfTuneEntry');
if (entry) entry.addEventListener('click', () => { openSoloTune(); });
const who = document.getElementById('sfWhoRow');
if (who) who.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-spcid]') : null;
if (!b) return;
_spEditCid = b.getAttribute('data-spcid');
renderSoloFramePage();
});
const p = document.getElementById('soloTunePanel');
if (p) {
p.addEventListener('animationend', e => {
if (String(e.animationName || '').indexOf('tuneIn') >= 0) soloTuneKeepVisible();
});
const close = () => closeSoloTune();
const fold = document.getElementById('soloTuneFold'); if (fold) fold.addEventListener('click', close);
const x = document.getElementById('soloTuneClose'); if (x) x.addEventListener('click', close);
const tabs = document.getElementById('soloTuneTabs');
if (tabs) tabs.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-solo-sec]') : null;
if (!b) return;
_spApplyTab(b.getAttribute('data-solo-sec'));
requestAnimationFrame(soloTuneKeepVisible);
});
}
const bindRow = (rowId, key) => {
const r = document.getElementById(rowId);
if (!r) return;
r.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-v]') : null;
if (!b) return;
const book = _spBook(_spTarget()); if (!book) return;
const val = b.getAttribute('data-v');
if (key === 'soloBg' && val === 'chat' && !book.chatBg) {
showToast('这一位还没有聊天背景图：先去 TA 的设置 → 外观 传一张，再回来选「透聊天背景图」');
return;
}
if (key === 'soloBg' && val === 'img' && !book.soloImg) {
book.soloBg = 'img';
_spRefresh(false);
showToast('选好了：下面点「上传一张」，这张图只给这块框用');
return;
}
book[key] = val;
if (key === 'soloTone' && val !== 'custom') {   }
_spRefresh(false);
});
};
bindRow('sfBgRow', 'soloBg');
bindRow('sfToneRow', 'soloTone');
bindRow('sfRadiusRow', 'soloRadius');
bindRow('sfAvShapeRow', 'soloAvShape');
const hfix = document.getElementById('sfHFixRow');
if (hfix) hfix.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-v]') : null;
if (!b) return;
const book = _spBook(_spTarget()); if (!book) return;
book.soloHFix = b.getAttribute('data-v') === 'fix';
_spRefresh(false);
});
const warmRow = document.getElementById('sfWarmRow');
if (warmRow) warmRow.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-v]') : null;
if (!b) return;
const book = _spBook(_spTarget()); if (!book) return;
book.soloToneInk = b.getAttribute('data-v');
book.soloToneA = Number(b.getAttribute('data-a')) || 55;
book.soloTone = 'custom';
_spRefresh(false);
showToast('暖色已铺上：下面「深浅 → 自定义」里还能再细调');
});
const presetRow = document.getElementById('sfPresetRow');
if (presetRow) presetRow.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-v]') : null;
if (!b) return;
const preset = SP_PRESETS[b.getAttribute('data-v')];
const book = _spBook(_spTarget());
if (!preset || !book) return;
if (preset.soloBg === 'chat' && !book.chatBg) {
showToast('「素银」要透这一位的聊天背景图：先去 TA 的设置 → 外观 传一张');
return;
}
Object.keys(preset).forEach(k => { book[k] = preset[k]; });
_spRefresh(true);
});
[['sfFace', 'soloFace', '%'], ['sfBlur', 'soloBlur', 'px'], ['sfH', 'soloH', '%'],
['sfR', 'soloR', 'px'], ['sfFont', 'soloFont', 'px'], ['sfToneA', 'soloToneA', '%'],
['sfW', 'soloW', '%'], ['sfGlow', 'soloGlow', ''], ['sfLh', 'soloLh', ''], ['sfAvR', 'soloAvR', 'px']].forEach(it => {
const el = document.getElementById(it[0]);
if (!el) return;
el.addEventListener('input', () => {
const book = _spBook(_spTarget()); if (!book) return;
book[it[1]] = Number(el.value);
if (it[1] === 'soloR') book.soloRadius = 'custom';
if (it[1] === 'soloToneA') book.soloTone = 'custom';
if (it[1] === 'soloAvR') book.soloAvShape = 'custom';
const out = document.getElementById(it[0] + 'Out'); if (out) out.value = el.value + it[2];
_spRefresh(false, false);
});
el.addEventListener('change', () => { save(); soloTuneKeepVisible(); });
});
const ink = document.getElementById('sfToneInk');
if (ink) ink.addEventListener('input', () => {
const book = _spBook(_spTarget()); if (!book) return;
book.soloToneInk = ink.value;
book.soloTone = 'custom';
_spRefresh(false);
});
const inkRst = document.getElementById('sfToneInkRst');
if (inkRst) inkRst.addEventListener('click', () => {
const book = _spBook(_spTarget()); if (!book) return;
book.soloToneInk = '';
book.soloTone = 'std';
_spRefresh(false);
});
[['sfAv', 'soloShowAv'], ['sfName', 'soloShowName'], ['sfSub', 'soloShowSub'], ['sfGo', 'soloShowGo'], ['sfEdge', 'soloEdge']].forEach(it => {
const el = document.getElementById(it[0]);
if (!el) return;
el.addEventListener('change', () => {
const book = _spBook(_spTarget()); if (!book) return;
book[it[1]] = !!el.checked;
_spRefresh(true);
});
});
const paper = document.getElementById('sfPaper');
if (paper) paper.addEventListener('change', () => {
const book = _spBook(_spTarget()); if (!book) return;
book.soloPaper = !!paper.checked;
_spRefresh(false);
});
[['sfSubTxt', 'soloSub'], ['sfGoTxt', 'soloGoTxt']].forEach(it => {
const el = document.getElementById(it[0]);
if (!el) return;
el.addEventListener('input', () => {
const book = _spBook(_spTarget()); if (!book) return;
book[it[1]] = el.value.slice(0, 16);
_spRefresh(true, false, true);
});
el.addEventListener('change', () => { save(); renderSoloTuneEntry(); });
});
[['sfBubTa', 'soloBubTa'], ['sfBubMe', 'soloBubMe']].forEach(it => {
const el = document.getElementById(it[0]);
if (!el) return;
el.addEventListener('input', () => {
const book = _spBook(_spTarget()); if (!book) return;
book[it[1]] = el.value;
_spRefresh(false);
});
});
[['sfBubTaRst', 'soloBubTa'], ['sfBubMeRst', 'soloBubMe']].forEach(it => {
const el = document.getElementById(it[0]);
if (!el) return;
el.addEventListener('click', () => {
const book = _spBook(_spTarget()); if (!book) return;
book[it[1]] = '';
_spRefresh(false);
});
});
const imgPick = document.getElementById('sfImgPick');
const imgInput = document.getElementById('sfImgInput');
if (imgPick && imgInput) imgPick.addEventListener('click', () => imgInput.click());
if (imgInput) imgInput.addEventListener('change', async e => {
if (!e.target.files[0]) return;
const book = _spBook(_spTarget());
const img = await fileData(e.target.files[0], 1280, 0.82);
e.target.value = '';
if (!img || !book) return;
book.soloImg = img;
book.soloBg = 'img';
_spRefresh(true);
showToast('这一块框的图已换好');
});
const imgClear = document.getElementById('sfImgClear');
if (imgClear) imgClear.addEventListener('click', () => {
const book = _spBook(_spTarget()); if (!book) return;
book.soloImg = '';
if (book.soloBg === 'img') book.soloBg = 'plain';
_spRefresh(true);
});
const reset = document.getElementById('sfReset');
if (reset) reset.addEventListener('click', () => {
const book = _spBook(_spTarget()); if (!book) return;
const d = defaults.chatAppearanceDefault;
Object.keys(d).forEach(k => { if (k.indexOf('solo') === 0) book[k] = d[k]; });
_spRefresh(true);
});
let _spRzRaf = 0;
window.addEventListener('resize', () => {
if (document.body.dataset.view !== 'soloframe') return;
if (_spRzRaf) return;
_spRzRaf = requestAnimationFrame(() => { _spRzRaf = 0; _spFitPreview(); });
});
renderSoloFramePage();
})();
function _qfCid() {
if (typeof _caCid === 'function') return _caCid();
return (data && data.activeChat) ? data.activeChat : '';
}
function _qfWho() {
const cid = _qfCid();
const c = (data.contacts || []).find(x => x && x.id === cid);
if (c && typeof chatNameOf === 'function') return chatNameOf(c);
return '';
}
var _QF_THUMB = 'data:image/svg+xml;utf8,' + encodeURIComponent(
'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="48"><rect width="96" height="48" fill="#d8d8dd"/></svg>');
function _qfPreviewHTML(form) {
const lead = '<span class="reply-lead">引用：</span>';
const q1 = '<div class="reply-quote">' + lead + '昨天你说的那句</div>';
const q2 = '<div class="reply-quote quote-img">' + lead + '<img class="quote-thumb" src="' + _QF_THUMB + '" alt="引用的图片"><span class="quote-words">那张图</span></div>';
const bub = t => '<div class="bubble">' + t + '</div>';
const one = (mine, q, text) => {
const inner = (form === 'embed') ? bub(q + text) : (q + bub(text));
return '<div class="message' + (mine ? ' mine' : '') + '"><div class="bubble-wrap">' + inner + '</div></div>';
};
return one(false, q1, '今天我们说点别的') + one(true, q1, '我在') + one(false, q2, '就这张');
}
function _qfRenderPreview() {
const box = document.getElementById('qfPrev');
const wrap = document.getElementById('qfPrevWrap');
if (!box || !wrap) return;
const a = _qfView();
box.innerHTML = _qfPreviewHTML(a.quoteForm || 'auto');
}
function _qfView() {
if (typeof _apView === 'function') return _apView();
return (data && data.chatAppearance && data.chatAppearance[_qfCid()]) || {};
}
function _qfSet(key, val, rerender) {
if (!_qfCid()) {
if (typeof showToast === 'function') showToast('先在聊天列表里选一位联系人：引用框按人各存一份');
return false;
}
if (typeof _caSh === 'function') _caSh()[key] = val;
else if (data.chatAppearance) {
if (!data.chatAppearance[_qfCid()]) data.chatAppearance[_qfCid()] = Object.assign({}, defaults.chatAppearanceDefault);
data.chatAppearance[_qfCid()][key] = val;
}
if (typeof applyAppearance === 'function') applyAppearance();
if (rerender) {
if (typeof resetMessageRender === 'function') { try { resetMessageRender(); } catch (e) {} }
if (typeof renderMessages === 'function') { try { renderMessages(); } catch (e) {} }
}
if (typeof save === 'function') save();
_qfEcho();
return true;
}
function _qfMarkChip(sel, v) {
const row = document.querySelector(sel);
if (!row) return;
row.querySelectorAll('.contact-chip').forEach(c => c.classList.toggle('active', c.dataset.v === v));
}
function _qfEcho() {
const a = _qfView();
const has = !!_qfCid();
const ctl = document.getElementById('qfCtl');
const wrap = document.getElementById('qfPrevWrap');
const empty = document.getElementById('qfEmpty');
const lead = document.getElementById('qfLead');
if (empty) empty.hidden = has;
if (ctl) ctl.hidden = !has;
if (wrap) wrap.hidden = !has;
if (lead) {
const nm = _qfWho();
lead.textContent = has
? ('正在改 ' + (nm || '这位 TA') + ' 聊天里那块「引用：…」· 按人各存一份，不动别人')
: '还没有选中的会话：先在聊天列表里点开一位';
}
if (!has) return;
_qfMarkChip('#qfFormRow', a.quoteForm || 'auto');
_qfMarkChip('#qfFollowRow', a.quoteFollow || 'auto');
_qfMarkChip('#qfFollowShapeRow', a.quoteFollowShape !== 'off' ? 'on' : 'off');
_qfMarkChip('#qfFollowBgRow', a.quoteFollowBg !== 'off' ? 'on' : 'off');
_qfMarkChip('#qfFollowInkRow', a.quoteFollowInk !== 'off' ? 'on' : 'off');
_qfMarkChip('#qfBorderRow', a.quoteBorder || 'none');
_qfMarkChip('#qfBarStyleRow', a.quoteBarStyle || 'solid');
_qfMarkChip('#qfShadowRow', a.quoteShadow || 'none');
_qfMarkChip('#qfFsRow', a.quoteFs || 'follow');
_qfMarkChip('#qfLhRow', a.quoteLh || 'normal');
_qfMarkChip('#qfLeadRow', a.quoteLead || 'auto');
_qfMarkChip('#qfWidthRow', a.quoteWidth || 'bubble');
_qfMarkChip('#qfThumbRow', a.quoteThumb || 'mid');
const _num = (sel, outSel, v, d, unit, txt) => {
const e = document.querySelector(sel);
if (e) e.value = (typeof v === 'number' && isFinite(v)) ? v : d;
const o = document.querySelector(outSel);
if (o) o.textContent = txt != null ? txt : ((typeof v === 'number' && isFinite(v)) ? (v + unit) : '默认');
};
const _hex = (sel, v, d) => {
const e = document.querySelector(sel);
if (e) e.value = (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) ? v : d;
};
_num('#qfAlpha', '#qfAlphaOut', a.quoteAlpha, 100, '%');
_num('#qfBorderW', '#qfBorderWOut', a.quoteBorderW, 1, 'px');
_num('#qfBarW', '#qfBarWOut', a.quoteBarW, 0, 'px', (typeof a.quoteBarW === 'number' && a.quoteBarW > 0) ? (a.quoteBarW + 'px') : '默认');
_num('#qfRadius', '#qfRadiusOut', a.quoteRadius, 12, 'px', (typeof a.quoteRadius === 'number' && isFinite(a.quoteRadius)) ? (Math.round(a.quoteRadius) + 'px') : '跟随');
_num('#qfPad', '#qfPadOut', a.quotePad ? parseInt(a.quotePad, 10) : null, 6, 'px', a.quotePad ? a.quotePad : '默认');
_num('#qfWidthPct', '#qfWidthPctOut', a.quoteWidthPct, 80, '%');
_num('#qfLines', '#qfLinesOut', a.quoteLines, 0, ' 行', (typeof a.quoteLines === 'number' && a.quoteLines > 0) ? (a.quoteLines + ' 行') : '不限');
_hex('#qfBg', a.quoteBg, '#ffffff');
_hex('#qfBar', a.quoteBar, '#616162');
_hex('#qfInk', a.quoteInk, '#717174');
_hex('#qfBorderColor', a.quoteBorderColor, '#e6e6ea');
const ta = document.getElementById('qfCss');
if (ta && !ta.dataset.dirty) ta.value = String(a.customQuoteCss || '');
_qfRenderPreview();
const note = document.getElementById('qfNote');
if (note) {
const f = a.quoteFollow || 'auto';
const hasCss = !!String(a.customBubbleCss || '').trim();
note.textContent = (f === 'auto')
? ('跟随气泡：这一位' + (hasCss ? '写了气泡 CSS ⇒ 现在跟着它走' : '没写气泡 CSS ⇒ 不跟（等于现在的样子）'))
: (f === 'on' ? '跟随气泡：始终跟着这一位的气泡走' : '跟随气泡：不跟，上面每一格都归你说了算');
}
}
function renderQuoteFramePage() {
_qfEcho();
renderQuoteFrameEntry();
}
function renderQuoteFrameEntry() {
const el = document.getElementById('sumQuoteFrame');
if (!el) return;
if (!_qfCid()) { el.textContent = '先在聊天列表里点开一位'; return; }
const a = _qfView();
const formTxt = ({ auto: '自动', embed: '嵌在气泡里', merge: '与气泡连成一块', float: '浮在气泡上方' })[a.quoteForm || 'auto'] || '自动';
const follow = a.quoteFollow || 'auto';
const followOn = (follow === 'on') || (follow === 'auto' && !!String(a.customBubbleCss || '').trim());
el.textContent = formTxt + ' · ' + (followOn ? '跟随气泡' : '不跟随气泡');
}
(function _qfBindEntry() {
const bind = () => {
['#quoteFramePageBtn', '#apQuoteLibBtn'].forEach(sel => {
const b = document.querySelector(sel);
if (!b || b.dataset.qfEntry) return;
b.dataset.qfEntry = '1';
b.addEventListener('click', () => { if (typeof showView === 'function') showView('quoteframe'); });
});
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
else bind();
})();
(function _qfBind() {
const _rows = [
['#qfFormRow', 'quoteForm', true],
['#qfFollowRow', 'quoteFollow', false],
['#qfFollowShapeRow', 'quoteFollowShape', false],
['#qfFollowBgRow', 'quoteFollowBg', false],
['#qfFollowInkRow', 'quoteFollowInk', false],
['#qfBorderRow', 'quoteBorder', false],
['#qfBarStyleRow', 'quoteBarStyle', false],
['#qfShadowRow', 'quoteShadow', false],
['#qfFsRow', 'quoteFs', false],
['#qfLhRow', 'quoteLh', false],
['#qfLeadRow', 'quoteLead', false],
['#qfWidthRow', 'quoteWidth', false],
['#qfThumbRow', 'quoteThumb', false]
];
const _ready = () => !document.getElementById('qfCtl');
const _bindRows = () => {
_rows.forEach(([sel, key, rerender]) => {
const row = document.querySelector(sel);
if (!row || row.dataset.qfBound) return;
row.dataset.qfBound = '1';
row.addEventListener('click', e => {
const btn = e.target.closest ? e.target.closest('.contact-chip') : null;
if (!btn || !btn.dataset || !btn.dataset.v) return;
_qfSet(key, btn.dataset.v, rerender);
});
});
};
const _bindRanges = () => {
const _rng = (sel, outSel, key, parse, txt) => {
const el = document.querySelector(sel);
if (!el || el.dataset.qfBound) return;
el.dataset.qfBound = '1';
el.addEventListener('input', () => {
const v = parse(el.value);
if (v == null) return;
const o = document.querySelector(outSel);
if (o) o.textContent = txt ? txt(v) : (v + '');
_qfSet(key, v, false);
});
};
_rng('#qfAlpha', '#qfAlphaOut', 'quoteAlpha', v => parseInt(v, 10), v => v + '%');
_rng('#qfBorderW', '#qfBorderWOut', 'quoteBorderW', v => parseInt(v, 10), v => v + 'px');
_rng('#qfBarW', '#qfBarWOut', 'quoteBarW', v => parseInt(v, 10), v => (v > 0 ? v + 'px' : '默认'));
_rng('#qfRadius', '#qfRadiusOut', 'quoteRadius', v => parseInt(v, 10), v => v + 'px');
_rng('#qfPad', '#qfPadOut', 'quotePad', v => parseInt(v, 10), v => v + 'px');
_rng('#qfWidthPct', '#qfWidthPctOut', 'quoteWidthPct', v => parseInt(v, 10), v => v + '%');
_rng('#qfLines', '#qfLinesOut', 'quoteLines', v => parseInt(v, 10), v => (v > 0 ? v + ' 行' : '不限'));
};
const _bindColors = () => {
const _col = (sel, rstSel, key) => {
const inp = document.querySelector(sel);
if (inp && !inp.dataset.qfBound) {
inp.dataset.qfBound = '1';
inp.addEventListener('input', () => _qfSet(key, inp.value, false));
}
const rst = document.querySelector(rstSel);
if (rst && !rst.dataset.qfBound) {
rst.dataset.qfBound = '1';
rst.addEventListener('click', () => _qfSet(key, '', false));
}
};
_col('#qfBg', '#qfBgRst', 'quoteBg');
_col('#qfBar', '#qfBarRst', 'quoteBar');
_col('#qfInk', '#qfInkRst', 'quoteInk');
_col('#qfBorderColor', '#qfBorderColorRst', 'quoteBorderColor');
};
const _bindText = () => {
const ta = document.getElementById('qfCss');
if (ta && !ta.dataset.qfBound) {
ta.dataset.qfBound = '1';
ta.addEventListener('input', () => { ta.dataset.dirty = '1'; });
}
const apply = document.getElementById('qfCssApply');
if (apply && !apply.dataset.qfBound) {
apply.dataset.qfBound = '1';
apply.addEventListener('click', () => {
if (ta) { ta.dataset.dirty = ''; _qfSet('customQuoteCss', ta.value.trim(), false); }
});
}
const clr = document.getElementById('qfCssClear');
if (clr && !clr.dataset.qfBound) {
clr.dataset.qfBound = '1';
clr.addEventListener('click', () => {
if (ta) { ta.value = ''; ta.dataset.dirty = ''; }
_qfSet('customQuoteCss', '', false);
});
}
const sample = (sel, text) => {
const btn = document.querySelector(sel);
if (!btn || btn.dataset.qfBound) return;
btn.dataset.qfBound = '1';
btn.addEventListener('click', () => {
if (!ta) return;
ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + text;
ta.dataset.dirty = '1';
if (typeof showToast === 'function') showToast('写进框里了：看一眼再点「应用这一段」');
});
};
sample('#qfCssSample1', '.reply-quote{border-radius:0;border-left:none;background:#f2f2f3}');
sample('#qfCssSample2', '.reply-quote{background:rgba(255,255,255,.35);backdrop-filter:blur(6px);border:1px solid rgba(0,0,0,.08)}');
};
const _bindSaveLib = () => {
const b = document.getElementById('qfSaveLib');
if (!b || b.dataset.qfBound) return;
b.dataset.qfBound = '1';
b.addEventListener('click', () => {
if (!_qfCid()) { if (typeof showToast === 'function') showToast('先在聊天列表里选一位联系人'); return; }
if (typeof _llSaveCur === 'function') _llSaveCur('quote');
else if (typeof showToast === 'function') showToast('美化库这会儿没加载上，稍后再试');
});
};
const _bindReset = () => {
const rst = document.getElementById('qfReset');
if (!rst || rst.dataset.qfBound) return;
rst.dataset.qfBound = '1';
rst.addEventListener('click', () => {
if (!_qfCid()) { if (typeof showToast === 'function') showToast('先在聊天列表里选一位联系人'); return; }
const keys = ['quoteForm', 'quoteFollow', 'quoteBorder', 'quoteBorderColor', 'quoteBorderW',
'quoteBarStyle', 'quoteBarW', 'quoteAlpha', 'quoteFs', 'quoteInk', 'quoteLh', 'quoteLead',
'quoteFollowShape', 'quoteFollowBg', 'quoteFollowInk',
'quoteWidth', 'quoteWidthPct', 'quoteLines', 'quoteThumb', 'quoteShadow', 'quotePad',
'quoteRadius', 'quoteBg', 'quoteBar', 'customQuoteCss'];
const d = defaults.chatAppearanceDefault;
if (typeof _caSh === 'function') {
const book = _caSh();
keys.forEach(k => { book[k] = (k in d) ? d[k] : ''; });
}
const ta = document.getElementById('qfCss');
if (ta) { ta.value = ''; ta.dataset.dirty = ''; }
if (typeof applyAppearance === 'function') applyAppearance();
if (typeof renderMessages === 'function') { try { renderMessages(); } catch (e) {} }
if (typeof save === 'function') save();
_qfEcho();
if (typeof showToast === 'function') showToast('这一位的引用框已回到出厂');
});
};
const _bindAll = () => {
if (_ready()) return;
_bindRows(); _bindRanges(); _bindColors(); _bindText(); _bindSaveLib(); _bindReset();
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _bindAll);
else _bindAll();
})();
var CALL_LOOK_DEF = {
mineColor: 'auto', mineText: 'auto', partnerColor: 'auto', partnerText: 'auto', css: '', dvCss: '',
bubShape: 'auto', bubRadius: '', bubPad: '', bubAlpha: '',
avShape: 'auto', avShow: 'auto', timeShow: 'auto', rowDensity: 'auto'
};
var CALL_LOOK_SHAPE_R = {
round: ['6px 20px 20px 20px', '20px 6px 20px 20px'],
tail: ['12px', '12px'],
square: ['12px', '12px'],
sharp: ['0', '0']
};
var CALL_LOOK_HOSTS = ['#vcStream', '#callLookPrev'];
var CALL_LOOK_CARD_GUARD = ':not(.ask-card):not(.taask-card):not(.dv-card):not(.cl-card):not(.lc-card):not(.dl-card):not(.favc-card):not(.cjw-card)';
var CALL_LOOK_MINE = {
ink: ['#111111', '#ffffff'], gray: ['#8a8a8e', '#ffffff'], forest: ['#3f3f43', '#ffffff'],
coffee: ['#8e8e92', '#ffffff'], mist: ['#a9c3e2', '#22303f'], blossom: ['#e4bdc3', '#3c2327'],
mint: ['#bfe0cc', '#20362a'], white: ['#ffffff', '#111111']
};
var CALL_LOOK_PART = {
ink: ['#4a4038', '#ffffff'], gray: ['#8a8a8e', '#ffffff'], forest: ['#3f3f43', '#ffffff'],
coffee: ['#8e8e92', '#ffffff'], mist: ['#a9c3e2', '#22303f'], blossom: ['#e4bdc3', '#3c2327'],
mint: ['#bfe0cc', '#20362a'], white: ['#ffffff', '#1a1c22']
};
function _clkMap() {
if (!data.callLookBy || typeof data.callLookBy !== 'object' || Array.isArray(data.callLookBy)) data.callLookBy = {};
return data.callLookBy;
}
function _clkCid(cid) { return (typeof cid === 'string' && cid) ? cid : (data.activeChat || ''); }
function callLookOf(cid) {
const k = _clkCid(cid);
const o = k ? _clkMap()[k] : null;
return Object.assign({}, CALL_LOOK_DEF, (o && typeof o === 'object' && !Array.isArray(o)) ? o : {});
}
function _clkSh(cid) {
const k = _clkCid(cid);
if (!k) return null;
const m = _clkMap();
if (!m[k] || typeof m[k] !== 'object' || Array.isArray(m[k])) m[k] = Object.assign({}, CALL_LOOK_DEF);
const o = m[k];
Object.keys(CALL_LOOK_DEF).forEach(key => { if (o[key] === undefined) o[key] = CALL_LOOK_DEF[key]; });
return o;
}
function callLookHasCss(cid) { return !!String(callLookOf(cid).css || '').trim(); }
function callLookHasAny(cid) {
const k = _clkCid(cid);
const o = callLookOf(k);
if (['mineColor', 'mineText', 'partnerColor', 'partnerText', 'bubShape', 'avShape', 'avShow', 'timeShow', 'rowDensity']
.some(x => o[x] && o[x] !== 'auto')) return true;
if (['bubRadius', 'bubPad', 'bubAlpha'].some(x => o[x] !== '' && o[x] !== null && o[x] !== undefined)) return true;
if (String(o.css || '').trim() || String(o.dvCss || '').trim()) return true;
const bg = (data.callSettings && data.callSettings.callBgByCid) || {};
return !!(k && bg[k]);
}
var _CLK_ROOT = /^(?:html\s+body|html(?=\s|$)|body(?=$|[\s>+~.:#\[])|:root(?=$|[\s>+~.:#\[]))/i;
var _CLK_BUB = /(^|[\s>+~])(\.bubble)((?:::?[a-zA-Z-]+(?:\([^()]*\))?)*)$/;
function _clkOne(host, p) {
const raw = p.trim();
let t = raw.replace(_CLK_ROOT, '').trim();
if (!t) return host;
t = t.replace(_CLK_BUB, (m, sep, bub, pseudo) => sep + bub + CALL_LOOK_CARD_GUARD + pseudo);
return host + ' ' + t;
}
function _clkOneDv(host, p) {
let t = p.trim().replace(_CLK_ROOT, '').trim();
let mine = false;
if (/^\.mine(?=$|[\s>+~.:#\[])/.test(t)) { mine = true; t = t.replace(/^\.mine/, '').trim(); }
const root = host + ' .message' + (mine ? '.mine' : '') + ' .bubble.dv-card';
if (!t) return root;
if (/^\.bubble(?=$|[\s>+~.:#\[])/.test(t)) t = t.replace(/^\.bubble/, '').trim();
else if (/^\.dv-card(?=$|[\s>+~.:#\[])/.test(t)) t = t.replace(/^\.dv-card/, '').trim();
if (!t) return root;
return /^(:{1,2}|\[)/.test(t) ? root + t : root + ' ' + t;
}
function _clkDeclImp(inner) {
let out = '', seg = '', i = 0;
const flush = () => {
const t = seg.trim(); seg = '';
if (!t) return;
if (/!\s*important$/i.test(t)) { out += t + ';'; return; }
out += (/^[-a-zA-Z_]+\s*:/.test(t) ? t + ' !important' : t) + ';';
};
while (i < inner.length) {
const c = inner[i];
if (c === '"' || c === "'") {
const q = c; seg += c; i++;
while (i < inner.length) { seg += inner[i]; const hit = inner[i] === q && inner[i - 1] !== '\\'; i++; if (hit) break; }
continue;
}
if (c === '(') {
let dep = 0;
while (i < inner.length) { seg += inner[i]; if (inner[i] === '(') dep++; else if (inner[i] === ')') { dep--; i++; break; } i++; }
continue;
}
if (c === ';') { flush(); i++; continue; }
seg += c; i++;
}
flush();
return out;
}
function _clkScope(css, one, hosts, forceImp) {  const H = hosts || CALL_LOOK_HOSTS;
const _sel = s => s.split(',').map(p => p.trim()).filter(Boolean)
.map(p => H.map(h => one(h, p)).join(', ')).join(', ');
const _scan = s => {
let res = '', out = '', i = 0;
while (i < s.length) {
const c = s[i];
if (c === '"' || c === "'") {
const q = c; out += c; i++;
while (i < s.length) { out += s[i]; const hit = s[i] === q && s[i - 1] !== '\\'; i++; if (hit) break; }
continue;
}
if (c === '/' && s[i + 1] === '*') {
const e = s.indexOf('*/', i + 2);
const seg = e < 0 ? s.slice(i) : s.slice(i, e + 2);
out += seg; i += seg.length; continue;
}
if (c === '{') {
let dep = 1, j = i + 1;
while (j < s.length && dep > 0) {
if (s[j] === '"' || s[j] === "'") { const q = s[j]; j++; while (j < s.length && !(s[j] === q && s[j - 1] !== '\\')) j++; j++; continue; }
if (s[j] === '/' && s[j + 1] === '*') { const e = s.indexOf('*/', j + 2); j = e < 0 ? s.length : e + 2; continue; }
if (s[j] === '{') dep++; else if (s[j] === '}') dep--;
j++;
}
if (dep !== 0) return null;
const inner = s.slice(i + 1, j - 1);
if (out.trim().charAt(0) === '@') {
const at = (out.trim().match(/^@([\w-]+)/) || ['', ''])[1].toLowerCase();
const nests = at === 'media' || at === 'supports' || at === 'layer' || at === 'container' || at === 'scope' || at === 'document';
const sub = nests ? _scan(inner) : inner;
res += out + '{' + (sub === null ? inner : sub) + '}';
} else {
res += _sel(out) + '{' + (forceImp ? _clkDeclImp(inner) : inner) + '}';
}
out = ''; s = s.slice(j); i = 0; continue;
}
out += c; i++;
}
return res + out;
};
try { const r = _scan(css); return r === null ? '' : r; } catch (e) { return ''; }
}
function _clkNum(v, lo, hi) {
if (v === '' || v === null || v === undefined) return null;
const n = Number(v);
if (!isFinite(n)) return null;
return Math.max(lo, Math.min(hi, Math.round(n)));
}
function _clkLayoutCss(o) {
const sel = CALL_LOOK_HOSTS.join(', ');
const out = [];
const toks = [];
const shape = (o.bubShape && o.bubShape !== 'auto' && CALL_LOOK_SHAPE_R[o.bubShape]) ? o.bubShape : '';
const radius = _clkNum(o.bubRadius, 0, 40);
const pad = _clkNum(o.bubPad, 4, 24);
const alpha = _clkNum(o.bubAlpha, 30, 100);
const avShape = (o.avShape && o.avShape !== 'auto') ? o.avShape : '';
const avShow = (o.avShow === 'on' || o.avShow === 'off') ? o.avShow : '';
const timeShow = (o.timeShow === 'on' || o.timeShow === 'off') ? o.timeShow : '';
const density = (o.rowDensity === 'cozy' || o.rowDensity === 'compact') ? o.rowDensity : '';
if (shape) {
toks.push('--bub-r:' + CALL_LOOK_SHAPE_R[shape][0]);
toks.push('--bub-r-mine:' + CALL_LOOK_SHAPE_R[shape][1]);
}
if (radius !== null) {
toks.push('--bub-r:' + radius + 'px');
toks.push('--bub-r-mine:' + radius + 'px');
}
if (pad !== null) {
toks.push('--bub-pad-y:' + pad + 'px');
toks.push('--bub-pad-x:' + (pad + 4) + 'px');
}
if (alpha !== null && alpha < 100) {
toks.push('--bub-bg-base:color-mix(in srgb,var(--bubble-glass) ' + alpha + '%,transparent)');
if (!(o.mineColor && o.mineColor !== 'auto')) toks.push('--bub-bg-mine:color-mix(in srgb,var(--mine) ' + alpha + '%,transparent)');
if (!(o.partnerColor && o.partnerColor !== 'auto')) toks.push('--bub-bg-partner:color-mix(in srgb,var(--partner-bubble) ' + alpha + '%,transparent)');
}
if (toks.length) out.push(sel + '{' + toks.join(';') + '}');
if (shape === 'tail') {
out.push(sel + ' .bubble{position:relative;border:none}');
out.push(sel + ' .message:not(.mine) .bubble::before{content:"";position:absolute;left:-5px;bottom:8px;width:10px;height:10px;background:inherit;border-left:1px solid var(--line);border-bottom:1px solid var(--line);transform:rotate(45deg);border-bottom-left-radius:2px}');
out.push(sel + ' .mine .bubble::before{content:"";position:absolute;right:-5px;bottom:8px;width:10px;height:10px;background:inherit;transform:rotate(45deg);border-bottom-right-radius:2px}');
}
if (avShape === 'rounded') out.push(sel + ' .mini-avatar{border-radius:var(--r-s);overflow:hidden}');
else if (avShape === 'square') out.push(sel + ' .mini-avatar{border-radius:4px;overflow:hidden}');
else if (avShape === 'circle') out.push(sel + ' .mini-avatar{border-radius:50%;overflow:clip}');
if (avShow === 'off') out.push(sel + ' .message .mini-avatar{display:none}');
else if (avShow === 'on') out.push(sel + ' .message .mini-avatar{display:flex}');
if (timeShow === 'off') out.push(sel + ' .ft-time{display:none}');
else if (timeShow === 'on') out.push(sel + ' .ft-time{display:inline}');
if (density === 'compact') out.push(sel + ' .message{margin:0 0 1px}');
else if (density === 'cozy') out.push(sel + ' .message{margin:0 0 12px}');
return out.join('\n');
}
function _clkTextVal(sel) {
if (!sel || sel === 'auto') return '';
if (_isHexColor(sel)) return sel;
if (sel === 'white') return '#ffffff';
if (sel === 'black') return '#111111';
if (sel === 'gold') return 'var(--gold-ink)';
return '';
}
function _clkVarCss(o, alpha) {
const mineOn = !!(o.mineColor && o.mineColor !== 'auto');
const partOn = !!(o.partnerColor && o.partnerColor !== 'auto');
const mineTxt = _clkTextVal(o.mineText);
const partTxt = _clkTextVal(o.partnerText);
const A = (typeof alpha === 'number' && alpha < 100) ? alpha : 100;
const MIX = c => A < 100 ? 'color-mix(in srgb,' + c + ' ' + A + '%,transparent)' : c;
if (!mineOn && !partOn && !mineTxt && !partTxt && A === 100) return '';
const M = CALL_LOOK_MINE[o.mineColor] || null;
const P = CALL_LOOK_PART[o.partnerColor] || null;
const mineBg = _isHexColor(o.mineColor) ? o.mineColor : (M ? M[0] : '');
const partBg = _isHexColor(o.partnerColor) ? o.partnerColor : (P ? P[0] : '');
const mineInk = mineTxt || (M ? M[1] : '') || (mineBg ? _autoInk(mineBg) : '');
const partInk = partTxt || (P ? P[1] : '') || (partBg ? _autoInk(partBg) : '');
const d = [];
if (mineBg) d.push('--mine:' + mineBg, '--mine-tint:' + mineBg, '--bub-bg-mine:' + MIX('var(--mine-tint)'));
if (mineInk && (mineBg || mineTxt)) d.push('--mine-text:' + mineInk, '--mine-bubble-ink:' + mineInk);
if (partBg) d.push('--partner-bubble:' + partBg, '--bub-bg-partner:' + MIX('var(--partner-bubble)'));
if (partInk && (partBg || partTxt)) d.push('--partner-text:' + partInk);
const rules = [];
const push = (side, bg, ink) => {
const dd = [];
if (bg) dd.push('background:' + MIX(bg));
if (ink) dd.push('color:' + ink);
if (!dd.length) return;
const sel = side === 'mine' ? ' .message.mine .bubble' : ' .message:not(.mine) .bubble';
rules.push(CALL_LOOK_HOSTS.map(h => h + sel + CALL_LOOK_CARD_GUARD + '{' + dd.join(';') + '}').join('\n'));
};
if (mineBg || mineTxt) push('mine', mineBg, mineInk);
if (partBg || partTxt) push('part', partBg, partInk);
const decl = d.length ? CALL_LOOK_HOSTS.map(h => h + '{' + d.join(';') + '}').join('\n') : '';
return [decl].concat(rules).filter(Boolean).join('\n');
}
function _clkDvLegible() {
return CALL_LOOK_HOSTS.map(h =>
h + ' .message .bubble.dv-card{--dv-card-fg:var(--partner-text,var(--ink));'
+ '--dv-card-mut:color-mix(in srgb,var(--dv-card-fg) 62%,transparent);'
+ '--dv-card-hair:color-mix(in srgb,var(--dv-card-fg) 18%,transparent)}\n'
+ h + ' .message.mine .bubble.dv-card{--dv-card-fg:var(--mine-text,var(--ink))}'
).join('\n');
}
function applyCallLook() {
const b = document.body;
const cid = (typeof _call !== 'undefined' && _call && _call.cid) ? _call.cid : _clkCid();
const o = callLookOf(cid);
const css = String(o.css || '').trim();
const dv = String(o.dvCss || '').trim();
const alpha = _clkNum(o.bubAlpha, 30, 100);
const vars = _clkVarCss(o, alpha);
const lay = _clkLayoutCss(o);
let el = document.getElementById('ordinal-call-look-style');
if (!css && !dv && !vars && !lay) {
if (el) el.remove();
delete b.dataset.vcLook;
return false;
}
b.dataset.vcLook = 'on';
if (!el) { el = document.createElement('style'); el.id = 'ordinal-call-look-style'; }
document.head.appendChild(el);
el.textContent = [vars, lay, dv ? _clkDvLegible() : '', dv ? _clkScope(dv, _clkOneDv, null, true) : '', css ? _clkScope(css, _clkOne) : '']
.filter(Boolean).join('\n');
return true;
}
function _clkName(cid) {
const k = _clkCid(cid);
const c = (data.contacts || []).find(x => x && x.id === k);
if (!c) return 'TA';
return (typeof chatNameOf === 'function' ? chatNameOf(c) : c.name) || 'TA';
}
function _clkPaintDots(hostSel, cur, table, kind, label) {
const host = document.querySelector(hostSel);
if (!host) return;
const autoTxt = kind === 'color' ? '跟随聊天' : '跟随色板';
const cls = kind === 'color' ? 'ap-dot' : 'ap-dot ap-txt';
const dot = (v, style, txt, title) => '<button type="button" class="' + cls + (v === 'auto' ? ' ap-dot-auto' : '') + '"'
+ ' data-v="' + v + '"' + (style ? ' style="' + style + '"' : '') + ' title="' + title + '" aria-label="' + title + '">' + txt + '</button>';
let html = dot('auto', '', kind === 'color' ? '' : '随', autoTxt);
if (kind === 'color') {
Object.keys(table).forEach(k => { html += dot(k, '--dot:' + table[k][0], '', _clkColorName(k)); });
} else {
html += dot('white', 'background:#4a4a4a;color:#fff', 'A', '白色');
html += dot('black', '', 'A', '黑色');
html += dot('gold', 'color:var(--gold-ink)', 'A', '金色');
}
const isCust = _isHexColor(cur);
html += '<label class="ap-dot ap-dot-cust" title="自定义颜色"><input type="color" value="'
+ (isCust ? cur : (kind === 'color' ? '#3a3a3c' : '#ffffff')) + '" aria-label="自定义' + label + '"></label>';
host.innerHTML = html;
host.querySelectorAll('[data-v]').forEach(btn => btn.classList.toggle('active', !isCust && btn.dataset.v === (cur || 'auto')));
if (isCust) {
const lab = host.querySelector('.ap-dot-cust');
if (lab) { lab.classList.add('active'); lab.style.setProperty('--dot', cur); }
}
}
function _clkColorName(k) {
return ({ ink: '墨黑', gray: '烟灰', forest: '炭灰', coffee: '浅灰', mist: '雾蓝', blossom: '樱粉', mint: '薄荷', white: '雪白' })[k] || k;
}
function _clkState(txt) { const el = document.querySelector('#clkCssStatus'); if (el) el.textContent = txt; }
function _clkDvState(txt) { const el = document.querySelector('#clkDvState'); if (el) el.textContent = txt; }
function _clkPaintPrev() {
const host = document.querySelector('#callLookPrev');
if (!host) return;
const cid = _clkCid();
const c = (data.contacts || []).find(x => x && x.id === cid);
const taAv = document.getElementById('clkPrevAvTa');
if (taAv && typeof avatarHTML === 'function') { taAv.className = ''; taAv.innerHTML = avatarHTML(typeof chatAvatarOf === 'function' ? chatAvatarOf(c) : ''); }
const meAv = document.getElementById('clkPrevAvMe');
if (meAv && typeof avatarHTML === 'function') { meAv.className = ''; meAv.innerHTML = avatarHTML((data.me && data.me.avatar) || ''); }
const bg = (data.callSettings && data.callSettings.callBgByCid && data.callSettings.callBgByCid[cid]) || '';
host.style.backgroundImage = bg ? 'url("' + bg + '")' : '';
host.classList.toggle('has-img', !!bg);
const dvHost = document.querySelector('#clkPrevDv');
if (!dvHost) return;
_clkPaintPrevDv(dvHost);
}
function _clkPaintPrevDv(dvHost) {
let html = '';
try {
const pile = (typeof DIVINE_PILES === 'object' && DIVINE_PILES) ? (DIVINE_PILES.tarot || DIVINE_PILES.lenormand || null) : null;
const cards = (pile && typeof divineKeyOf === 'function') ? pile.slice(0, 3).map(c => ({ k: divineKeyOf(c), u: true })) : [];
if (cards.length && typeof _dvChatCardHTML === 'function') {
html = _dvChatCardHTML({ id: 'clk-prev', from: 'partner', dv: { sp: 'three', cards: cards, at: Date.now() } });
}
} catch (e) { html = ''; }
dvHost.innerHTML = html
? '<div class="message"><span class="bubble-wrap">' + html
+ '<span class="message-meta"><span class="ft-time">21:33</span></span></span></div>'
: '';
dvHost.hidden = !html || _clkTab !== 'dvcss';
if (!html && typeof DIVINE_PILES === 'undefined' && typeof ensureChunk === 'function') {
ensureChunk('divine').then(ok => { if (ok) _clkPaintPrevDv(dvHost); });
}
}
function _clkPaintSets() {
const o = callLookOf();
document.querySelectorAll('#callLookView [data-clk-set]').forEach(row => {
const cur = o[row.dataset.clkSet] || 'auto';
row.querySelectorAll('.contact-chip').forEach(ch => ch.classList.toggle('active', ch.dataset.v === cur));
});
const num = (sel, outSel, key, lo, hi, def, autoTxt, unit) => {
const v = _clkNum(o[key], lo, hi);
const el = document.querySelector(sel), out = document.querySelector(outSel);
if (el) el.value = String(v === null ? def : v);
if (out) out.textContent = v === null ? autoTxt : v + unit;
};
num('#clkBubRadius', '#clkBubRadiusOut', 'bubRadius', 0, 40, 20, '跟随形状', 'px');
num('#clkBubPad', '#clkBubPadOut', 'bubPad', 4, 24, 10, '跟随聊天', 'px');
num('#clkBubAlpha', '#clkBubAlphaOut', 'bubAlpha', 30, 100, 100, '跟随聊天', '%');
}
var CLK_TABS = ['bg', 'color', 'layout', 'css', 'dvcss'];
var _clkTab = 'bg';
function _clkTabApply() {
document.querySelectorAll('#callLookView [data-clk-tab]').forEach(el => {
el.toggleAttribute('data-clk-off', el.dataset.clkTab !== _clkTab);
});
document.querySelectorAll('#clkNav [data-clk-tab-btn]').forEach(b => {
const on = b.dataset.clkTabBtn === _clkTab;
b.classList.toggle('on', on);
b.setAttribute('aria-selected', on ? 'true' : 'false');
});
const dv = document.querySelector('#clkPrevDv');
if (dv) dv.hidden = _clkTab !== 'dvcss' || !dv.innerHTML;
}
function renderCallLookPage() {
const o = callLookOf();
const nm = _clkName();
const lead = document.querySelector('#clkLead');
if (lead) lead.textContent = '只改「' + nm + '」的视频通话那一面 · 聊天页与别位 TA 都不动';
const src = (data.callSettings && data.callSettings.callBgByCid && data.callSettings.callBgByCid[_clkCid()]) || '';
const prev = document.querySelector('#clkBgPreview');
if (prev) {
prev.style.backgroundImage = src ? 'url("' + src + '")' : '';
prev.textContent = src ? '' : '未设置（沿用原来的雾蓝底）';
}
const clr = document.querySelector('#clkBgClear');
if (clr) clr.disabled = !src;
_clkPaintDots('#clkMineColor', o.mineColor, CALL_LOOK_MINE, 'color', '我的气泡底色');
_clkPaintDots('#clkPartnerColor', o.partnerColor, CALL_LOOK_PART, 'color', '对方气泡底色');
_clkPaintDots('#clkMineText', o.mineText, null, 'text', '我的气泡文字色');
_clkPaintDots('#clkPartnerText', o.partnerText, null, 'text', '对方气泡文字色');
_clkPaintSets();
const ta = document.querySelector('#clkCss');
if (ta) ta.value = String(o.css || '');
_clkState(String(o.css || '').trim() ? '已应用 · ' + String(o.css).trim().length + ' 字符' : '未设置（视频里跟聊天页那段一样）');
const dv = document.querySelector('#clkDvCss');
if (dv) dv.value = String(o.dvCss || '');
_clkDvState(String(o.dvCss || '').trim() ? '已应用 · ' + String(o.dvCss).trim().length + ' 字符' : '未设置（用卡自己的卡面）');
applyCallLook();
_clkPaintPrev();
}
function _clkCommit(msg, dvToo) {
const o = _clkSh();
if (!o) return;
applyCallLook();
if (dvToo) _clkPaintPrev();
try { save(); } catch (e) {}
if (typeof _vc !== 'undefined' && _vc) {
const s = document.getElementById('vcStream');
if (s) s.innerHTML = '';
_vc.lastId = 0; _vc.day = '';
}
if (typeof renderFoldSummaries === 'function') renderFoldSummaries();
if (msg && typeof showToast === 'function') showToast(msg);
}
function _clkBindDots(hostSel, key) {
const host = document.querySelector(hostSel);
if (!host) return;
host.addEventListener('click', e => {
const btn = e.target.closest ? e.target.closest('[data-v]') : null;
if (!btn || !host.contains(btn)) return;
const o = _clkSh();
if (!o) return;
o[key] = btn.dataset.v;
renderCallLookPage();
_clkCommit('');
});
host.addEventListener('input', e => {
const inp = e.target;
if (!inp || inp.tagName !== 'INPUT' || inp.getAttribute('type') !== 'color') return;
const o = _clkSh();
if (!o) return;
o[key] = inp.value;
host.querySelectorAll('[data-v]').forEach(b => b.classList.remove('active'));
const lab = host.querySelector('.ap-dot-cust');
if (lab) { lab.classList.add('active'); lab.style.setProperty('--dot', inp.value); }
applyCallLook();
_clkPaintPrev();
try { save(); } catch (err) {}
if (typeof _vc !== 'undefined' && _vc) {
const s = document.getElementById('vcStream');
if (s) s.innerHTML = '';
_vc.lastId = 0; _vc.day = '';
}
});
}
(function _clkBindPage() {
const nav = document.getElementById('clkNav');
if (nav) nav.addEventListener('click', e => {
const b = e.target.closest ? e.target.closest('[data-clk-tab-btn]') : null;
if (!b || !nav.contains(b)) return;
_clkTab = b.dataset.clkTabBtn;
_clkTabApply();
});
_clkTabApply();
_clkBindDots('#clkMineColor', 'mineColor');
_clkBindDots('#clkPartnerColor', 'partnerColor');
_clkBindDots('#clkMineText', 'mineText');
_clkBindDots('#clkPartnerText', 'partnerText');
const layCard = document.querySelector('#clkLayoutCard');
if (layCard) {
layCard.addEventListener('click', e => {
const chip = e.target.closest ? e.target.closest('[data-clk-set] .contact-chip') : null;
if (!chip || !layCard.contains(chip)) return;
const row = chip.closest('[data-clk-set]');
const key = row && row.dataset.clkSet;
if (!key) return;
const o = _clkSh();
if (!o) return;
o[key] = chip.dataset.v;
_clkPaintSets();
_clkCommit('');
});
const rngDef = { bubPad: 10, bubAlpha: 100 };
const rng = (sel, key) => {
const el = document.querySelector(sel);
if (!el) return;
el.addEventListener('input', () => {
const o = _clkSh();
if (!o) return;
const v = Number(el.value);
o[key] = (rngDef[key] !== undefined && v === rngDef[key]) ? '' : v;
_clkPaintSets();
applyCallLook();
_clkPaintPrev();
});
el.addEventListener('change', () => { try { save(); } catch (err) {} });
};
rng('#clkBubRadius', 'bubRadius');
rng('#clkBubPad', 'bubPad');
rng('#clkBubAlpha', 'bubAlpha');
const rst = document.querySelector('#clkBubRadiusRst');
if (rst) rst.addEventListener('click', () => {
const o = _clkSh();
if (!o) return;
o.bubRadius = '';
_clkPaintSets();
_clkCommit('气泡圆角已交回「气泡形状」');
});
}
const bgUp = document.querySelector('#clkBgUpload'), bgInp = document.querySelector('#clkBgInput'), bgClr = document.querySelector('#clkBgClear');
const bgFull = document.querySelector('#clkBgFullBtn');
if (bgFull) bgFull.addEventListener('click', () => {
const cid = _clkCid();
if (!cid) { if (typeof showToast === 'function') showToast('先在通讯录里加一位单聊联系人'); return; }
if (typeof previewCallBg === 'function') previewCallBg(cid);
});
if (bgUp && bgInp) {
bgUp.addEventListener('click', () => bgInp.click());
bgInp.addEventListener('change', async e => {
const f = e.target.files && e.target.files[0];
e.target.value = '';
if (!f) return;
const cid = _clkCid();
if (!cid) { if (typeof showToast === 'function') showToast('先在通讯录里加一位单聊联系人'); return; }
const img = await fileData(f, (typeof _bgUploadEdge === 'function') ? _bgUploadEdge() : 1600, 0.82);
if (!img) return;
if (!data.callSettings) data.callSettings = {};
if (!data.callSettings.callBgByCid || typeof data.callSettings.callBgByCid !== 'object') data.callSettings.callBgByCid = {};
data.callSettings.callBgByCid[cid] = img;
renderCallLookPage();
if (typeof applyCallBg === 'function') applyCallBg(cid);
try { save(); } catch (err) {}
if (typeof renderFoldSummaries === 'function') renderFoldSummaries();
if (typeof showToast === 'function') showToast('已换「' + _clkName(cid) + '」的通话背景');
});
}
if (bgClr) bgClr.addEventListener('click', () => {
const cid = _clkCid();
const map = (data.callSettings && data.callSettings.callBgByCid) || {};
if (!cid || !map[cid]) return;
delete map[cid];
renderCallLookPage();
if (typeof applyCallBg === 'function') applyCallBg(cid);
try { save(); } catch (err) {}
if (typeof renderFoldSummaries === 'function') renderFoldSummaries();
if (typeof showToast === 'function') showToast('已清除「' + _clkName(cid) + '」的通话背景');
});
const cssTa = document.querySelector('#clkCss');
const cssApply = document.querySelector('#clkCssApply');
if (cssApply && cssTa) cssApply.addEventListener('click', () => {
const o = _clkSh();
if (!o) return;
o.css = String(cssTa.value || '');
_clkState(String(o.css).trim() ? '已应用 · ' + String(o.css).trim().length + ' 字符' : '未设置（视频里跟聊天页那段一样）');
_clkCommit('通话气泡 CSS 已应用');
});
const cssClr = document.querySelector('#clkCssClear');
if (cssClr && cssTa) cssClr.addEventListener('click', () => {
const o = _clkSh();
if (!o) return;
o.css = '';
cssTa.value = '';
_clkState('未设置（视频里跟聊天页那段一样）');
_clkCommit('已清空通话气泡 CSS');
});
const cssUp = document.querySelector('#clkCssUpload'), cssInp = document.querySelector('#clkCssInput');
if (cssUp && cssInp) {
cssUp.addEventListener('click', () => cssInp.click());
cssInp.addEventListener('change', e => {
const f = e.target.files && e.target.files[0];
e.target.value = '';
if (!f) return;
const rd = new FileReader();
rd.onload = () => {
if (cssTa) cssTa.value = String(rd.result || '');
const o = _clkSh();
if (o) { o.css = String(rd.result || ''); _clkState('已应用 · ' + String(o.css).trim().length + ' 字符'); _clkCommit('已读入一份 CSS'); }
};
rd.readAsText(f);
});
}
const dvTa = document.querySelector('#clkDvCss');
const dvApply = document.querySelector('#clkDvApply');
if (dvApply && dvTa) dvApply.addEventListener('click', () => {
const o = _clkSh();
if (!o) return;
o.dvCss = String(dvTa.value || '');
_clkDvState(String(o.dvCss).trim() ? '已应用 · ' + String(o.dvCss).trim().length + ' 字符' : '未设置（用卡自己的卡面）');
_clkCommit('占卜卡片 CSS 已应用', true);
});
const dvClr = document.querySelector('#clkDvClear');
if (dvClr && dvTa) dvClr.addEventListener('click', () => {
const o = _clkSh();
if (!o) return;
o.dvCss = '';
dvTa.value = '';
_clkDvState('未设置（用卡自己的卡面）');
_clkCommit('已清空占卜卡片 CSS', true);
});
})();
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['beauty'] = true;
