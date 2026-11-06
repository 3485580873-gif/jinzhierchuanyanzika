// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var ANN_HEADUP = [7, 3, 1];
var ANN_MILE = [100, 200, 300, 365, 400, 520, 600, 700, 777, 800, 900, 1000, 1314, 2000, 3000, 4000, 5000, 10000];
function _annPad2(n) { return n < 10 ? '0' + n : '' + n; }
function _annToday() { const d = new Date(); return d.getFullYear() + '-' + _annPad2(d.getMonth() + 1) + '-' + _annPad2(d.getDate()); }
function _annNormDate(v) {
const s = String(v == null ? '' : v).trim();
let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
if (!m) m = /^(\d{4})(\d{2})(\d{2})$/.exec(s);
if (!m) m = /^(\d{4})[./](\d{1,2})[./](\d{1,2})$/.exec(s);
if (!m) return '';
const y = +m[1], mo = +m[2], d = +m[3];
if (y < 1900 || y > 2999 || mo < 1 || mo > 12 || d < 1 || d > 31) return '';
const dt = new Date(y, mo - 1, d);
if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return '';
return y + '-' + _annPad2(mo) + '-' + _annPad2(d);
}
function _annNormMD(v) {
const s = String(v == null ? '' : v).trim();
let m = /^(\d{1,2})-(\d{1,2})$/.exec(s);
if (!m) m = /^(\d{2})(\d{2})$/.exec(s);
if (!m) m = /^(\d{1,2})[./](\d{1,2})$/.exec(s);
if (!m) return '';
const mo = +m[1], d = +m[2];
if (mo < 1 || mo > 12 || d < 1 || d > 31) return '';
const dt = new Date(2024, mo - 1, d);
if (dt.getMonth() !== mo - 1 || dt.getDate() !== d) return '';
return _annPad2(mo) + '-' + _annPad2(d);
}
function _annToday0() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
function _annDays(since) {
const d = new Date(since + 'T00:00:00');
return Math.max(1, Math.round((_annToday0() - d) / 864e5));
}
function _annNext(start) {
const p = String(start).split('-');
const mo = +p[p.length - 2], d = +p[p.length - 1];
const ann = new Date(new Date().getFullYear(), mo - 1, d);
if (ann.getTime() < _annToday0().getTime()) ann.setFullYear(ann.getFullYear() + 1);
return { cd: Math.round((ann - _annToday0()) / 864e5), date: ann };
}
function annContactName(cid) {
if (!cid) return '通用';
const c = (data.contacts || []).find(x => x.id === cid);
return fixedNameOf(c) || '已删除的联系人';
}
function annReleaseContact(cid) {
let hit = false;
annList().forEach(a => { if (a.contactId === cid) { a.contactId = ''; hit = true; } });
if (hit) {
let firstMain = true;
annList().forEach(a => {
if (a.main && !a.contactId) { if (firstMain) firstMain = false; else a.main = false; }
});
}
return hit;
}
function renderAnniversary() {
const hero = $('#annHero');
if (!hero) return;
const cid = (typeof currentContact === 'function' && (currentContact() || {}).id) || '';
const main = annMainFor(cid);
if (!main) {
hero.innerHTML = '<div class="ann-hero-empty">还没有主纪念日<small>点「＋ 添加」，绑定一位联系人后 TA 就会按你设的概率在特定日子里到聊天里提起这件事；勾「设为主纪念日」还会让聊天首页显示你们的天数</small></div>';
} else if (main.yearly) {
const next = _annNext(main.date);
const who = main.contactId ? `和 ${escapeHTML(annContactName(main.contactId))}` : '通用 · 所有聊天都会显示';
const nextHtml = next.cd === 0
? '<span class="ann-hero-next today">今天就是纪念日</span>'
: `<span class="ann-hero-next">下次纪念日 还有 ${next.cd} 天 · ${next.date.getMonth() + 1} 月 ${next.date.getDate()} 日</span>`;
hero.innerHTML = `<div class="ann-hero-name">${escapeHTML(main.name || '纪念日')}</div><div class="ann-hero-days">${next.cd}<em>天</em></div><div class="ann-hero-date">每年 ${next.date.getMonth() + 1} 月 ${next.date.getDate()} 日 · ${who}</div>${nextHtml}`;
} else {
const next = _annNext(main.date);
const who = main.contactId ? `和 ${escapeHTML(annContactName(main.contactId))}` : '通用 · 所有聊天都会显示';
const nextHtml = next.cd === 0
? '<span class="ann-hero-next today">今天就是纪念日</span>'
: `<span class="ann-hero-next">下次纪念日 还有 ${next.cd} 天 · ${next.date.getMonth() + 1} 月 ${next.date.getDate()} 日</span>`;
hero.innerHTML = `<div class="ann-hero-name">${escapeHTML(main.name || '纪念日')}</div><div class="ann-hero-days">${ordSup(_annDays(main.date))}<em>天</em></div><div class="ann-hero-date">${main.date.split('-').join('.')} 起 · ${who}</div>${nextHtml}`;
}
renderAnnOwners();
renderAnnExtras();
}
function renderAnnExtras() {
const list = $('#annExtraList');
if (!list) return;
const tsOf = it => it.yearly ? _annNext(it.date).date.getTime() : new Date(it.date + 'T00:00:00').getTime();
const sorted = annList().slice().sort((a, b) => {
const ta = tsOf(a), tb = tsOf(b);
const t = _annToday0().getTime();
const ga = ta >= t ? 0 : 1, gb = tb >= t ? 0 : 1;
if (ga !== gb) return ga - gb;
return ta - tb;
});
const items = _annFilter === '__none' ? sorted.filter(it => !it.contactId)
: _annFilter ? sorted.filter(it => it.contactId === _annFilter) : sorted;
if (!items.length) {
list.innerHTML = _annFilter
? '<div class="ann-empty">这一档下还没有日子。</div>'
: '<div class="ann-empty">还没有添加。点下方按钮记一个日子，<b>绑定一位联系人</b>后 TA 就会按你设的概率，在那几天里到聊天里跟你说这件事</div>';
return;
}
const t0 = _annToday0().getTime();
const tStr = _annToday();
const tMD = tStr.slice(5), tY = +tStr.slice(0, 4);
list.innerHTML = items.map(it => {
let cls = '', label, dateStr;
if (it.yearly) {
const p = it.date.split('-');
dateStr = '每年 ' + (+p[0]) + '.' + (+p[1]);
const cd = _annNext(it.date).cd;
if (cd === 0) { cls = ' today'; label = '就是今天'; }
else { cls = ' count'; label = '还有 ' + cd + ' 天'; }
} else {
dateStr = it.date.split('-').join('.');
const diff = Math.round((new Date(it.date + 'T00:00:00').getTime() - t0) / 864e5);
if (diff > 0) { cls = ' count'; label = '还有 ' + diff + ' 天'; }
else if (diff === 0) { cls = ' today'; label = '就是今天'; }
else if (it.date.slice(5) === tMD) { cls = ' today'; label = `今天 ${tY - +it.date.slice(0, 4)} 周年`; }
else label = '已 ' + (-diff) + ' 天';
}
const who = it.contactId ? ` · 和 ${escapeHTML(annContactName(it.contactId))}` : '';
const mainTag = it.main ? '<i class="ann-extra-main">主</i>' : '';
const byTag = it.by === 'ta' ? '<i class="ann-extra-by">TA 加的</i>' : '';
const wc = annWishChance(it);
const whens = annWishWhen(it);
let talkHtml;
if (!wc.on) {
talkHtml = '<div class="ann-extra-talk off">TA 不会提起这条</div>';
} else if (!it.contactId) {
talkHtml = '<div class="ann-extra-talk warn">没绑定联系人，TA 不会在某个聊天里提起</div>';
} else {
const whenTxt = whens.length ? whens.map(w => w.when).join(' / ') : '当天';
talkHtml = `<div class="ann-extra-talk">${escapeHTML(annContactName(it.contactId))} 会在 ${escapeHTML(whenTxt)} 提起 · ${wc.prob}%</div>`;
}
return `<div class="ann-extra" data-id="${escapeHTML(it.id)}"><div class="ann-extra-info"><div class="ann-extra-name">${mainTag}${byTag}${escapeHTML(it.name)}</div><div class="ann-extra-date">${dateStr}${who}</div>${talkHtml}</div><span class="ann-extra-days${cls}">${label}</span><button class="ann-extra-star${it.main ? ' on' : ''}" data-id="${escapeHTML(it.id)}" aria-label="${it.main ? '取消主纪念日' : '设为主纪念日'}" title="设为主纪念日">★</button><button class="ann-extra-del" data-id="${escapeHTML(it.id)}" aria-label="删除">×</button></div>`;
}).join('');
}
function _annRefreshChat() {
if (typeof resetMessageRender === 'function') { resetMessageRender(); renderMessages(); }
}
function annWishChance(a) {
if (!a || a.wish === false) return { on: false, prob: 0 };
const p = (typeof a.wishProb === 'number') ? Math.max(0, Math.min(100, a.wishProb)) : 100;
return { on: p > 0, prob: p };
}
function annWishWhen(a) {
if (!a) return [];
const p = String(a.date || '').split('-');
const mo = +p[p.length - 2], d = +p[p.length - 1];
if (!mo || !d) return [];
const out = [];
const md = (m, dd) => (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
out.push({ when: '当天', date: md(mo, d) });
ANN_HEADUP.forEach(cd => {
const t = new Date(_annToday0().getTime() + cd * 864e5);
if (t.getMonth() + 1 === mo && t.getDate() === d) out.push({ when: cd === 1 ? '前一天' : '前 ' + cd + ' 天', date: md(mo, d) });
});
if (!a.yearly && /^\d{4}-/.test(a.date)) {
const tomorrow = _annDays(a.date) + 1;
if (ANN_MILE.includes(tomorrow)) out.push({ when: '满 ' + tomorrow + ' 天前夜', date: md(mo, d) });
}
return out;
}
var _ANN_CAL_NAV =
'<div class="ann-cal-nav">' +
'<button class="ann-cal-btn" data-nav="-12" title="上一年"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l-5-5 5-5"/><path d="M18 17l-5-5 5-5"/></svg></button>' +
'<button class="ann-cal-btn" data-nav="-1" title="上个月"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
'<span class="ann-cal-title"></span>' +
'<button class="ann-cal-btn" data-nav="1" title="下个月"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>' +
'<button class="ann-cal-btn" data-nav="12" title="下一年"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7l5 5-5 5"/><path d="M6 7l5 5-5 5"/></svg></button>' +
'</div>';
var _ANN_CAL_MONTHS =
'<div class="ann-cal-months">' +
Array.from({ length: 12 }, (_, i) => `<button type="button" class="ann-cal-m" data-m="${i}">${i + 1}月</button>`).join('') +
'</div>';
function _annCalPaint(panel, ym, sel, marks, matchMd) {
while (ym.m < 0) { ym.m += 12; ym.y--; }
while (ym.m > 11) { ym.m -= 12; ym.y++; }
const title = panel.querySelector('.ann-cal-title');
const grid = panel.querySelector('.ann-cal-grid');
if (!title || !grid) return;
title.textContent = ym.y + ' 年 ' + (ym.m + 1) + ' 月';
panel.querySelectorAll('.ann-cal-m').forEach(b => b.classList.toggle('on', +b.dataset.m === ym.m));
const days = new Date(ym.y, ym.m + 1, 0).getDate();
const startWd = new Date(ym.y, ym.m, 1).getDay();
const t = _annToday();
let html = ['日', '一', '二', '三', '四', '五', '六'].map(w => `<span class="ann-cal-wd">${w}</span>`).join('');
for (let i = 0; i < startWd; i++) html += '<span class="ann-cal-cell blank"></span>';
for (let d = 1; d <= days; d++) {
const ds = ym.y + '-' + _annPad2(ym.m + 1) + '-' + _annPad2(d);
const selCls = (ds === sel || (matchMd && ds.slice(5) === matchMd)) ? ' sel' : '';
let names = null;
if (marks && (marks.full.has(ds) || marks.md.has(ds.slice(5)))) {
names = ((marks.nameFull && marks.nameFull.get(ds)) || []).concat((marks.nameMd && marks.nameMd.get(ds.slice(5))) || []).join('、');
}
html += `<span class="ann-cal-cell${ds === t ? ' today' : ''}${selCls}${names ? ' mark' : ''}" data-d="${ds}"${names ? ` title="${escapeHTML('这天已有：' + names)}"` : ''}>${d}</span>`;
}
grid.innerHTML = html;
}
function _annCalNavBind(panel, ym, repaint) {
panel.querySelectorAll('.ann-cal-btn').forEach(b => b.addEventListener('click', () => {
ym.m += parseInt(b.dataset.nav, 10) || 0;
repaint();
}));
}
function _annCalMonthBind(panel, ym, repaint) {
const row = panel.querySelector('.ann-cal-months');
if (!row) return;
row.addEventListener('click', e => {
const b = e.target.closest('.ann-cal-m');
if (!b) return;
const m = parseInt(b.dataset.m, 10);
if (!(m >= 0 && m <= 11)) return;
ym.m = m;
repaint();
});
}
function _annCalGridBind(panel, ym, sel, repaint) {
panel.querySelector('.ann-cal-grid').addEventListener('click', e => {
const cell = e.target.closest('.ann-cal-cell[data-d]');
if (!cell) return;
sel.v = cell.dataset.d;
(repaint || (() => _annCalPaint(panel, ym, sel.v)))();
});
}
var _annEditorMask = null;
var _annFilter = '';
var _annUndoSnap = null;
var _annUndoTimer = null;
function openAnnEditor(entry, presetCid) {
const contacts = data.contacts || [];
let d0 = '';
if (entry) d0 = entry.yearly ? (_annToday().slice(0, 4) + '-' + (_annNormMD(entry.date) || '01-01')) : _annNormDate(entry.date);
const st = {
id: entry ? entry.id : null,
date: d0 || _annToday(),
cid: entry ? (entry.contactId || '') : (contacts.some(c => c.id === presetCid) ? presetCid : ''),
yearly: entry ? !!entry.yearly : false,
wish: entry ? entry.wish !== false : true,
wishProb: (entry && typeof entry.wishProb === 'number' && entry.wishProb >= 0 && entry.wishProb <= 100) ? entry.wishProb : 100,
};
if (!contacts.some(c => c.id === st.cid)) st.cid = '';
const p = st.date.split('-');
const ym = { y: +p[0], m: +p[1] - 1 };
const sel = { v: st.date };
const marks = { full: new Set(), md: new Set(), nameFull: new Map(), nameMd: new Map() };
annList().forEach(a => {
if (!a || !a.date || a.id === st.id) return;
if (a.yearly) {
marks.md.add(a.date);
const arr = marks.nameMd.get(a.date) || []; arr.push(a.name || '纪念日'); marks.nameMd.set(a.date, arr);
} else {
marks.full.add(a.date);
const arr = marks.nameFull.get(a.date) || []; arr.push(a.name || '纪念日'); marks.nameFull.set(a.date, arr);
}
});
if (_annEditorMask) _annEditorMask.remove();
const mask = document.createElement('div');
mask.className = 'ann-mask';
mask.innerHTML =
'<div class="ann-panel">' +
`<div class="ann-panel-head"><span class="ann-panel-title">${entry ? '编辑纪念日' : '添加纪念日 / 倒数日'}</span><button class="ann-panel-close">×</button></div>` +
'<input id="annEdName" class="ann-name-input" maxlength="16" placeholder="名称（如：在一起 / 生日 / 见面倒数）">' +
'<div class="ann-type-row"><button type="button" class="ann-type-chip" data-t="full">普通日期</button><button type="button" class="ann-type-chip" data-t="yearly">每年重复（生日等）</button></div>' +
'<div class="fchips ann-owners" id="annEdOwners"></div>' +
'<button type="button" class="ann-cal-sum" id="annCalSum" aria-expanded="false"></button>' +
'<div class="ann-off-row" id="annOffRow"><span>倒数日 · 还有几天</span><input type="text" id="annEdOffset" inputmode="numeric" placeholder="如 30"><em>自动填日期</em></div>' +
'<div class="ann-cal-fold" id="annCalFold" hidden>' + _ANN_CAL_NAV + _ANN_CAL_MONTHS + '<div class="ann-cal-grid"></div></div>' +
'<label class="ann-main-row"><input type="checkbox" id="annEdMain"><span>设为主纪念日 · 聊天首页「今天」会显示天数</span></label>' +
'<label class="ann-main-row"><input type="checkbox" id="annEdWish"><span>让 TA 到聊天里主动提起这件事</span></label>' +
'<div class="ann-prob-row" id="annProbRow"><span class="ann-prob-label">提起概率</span>' +
[100, 80, 60, 40, 20].map(v => `<button type="button" class="ann-prob-chip" data-p="${v}">${v}%</button>`).join('') +
'</div>' +
'<div class="ann-talk-when" id="annTalkWhen"></div>' +
'<p class="ann-type-hint"></p>' +
'<div class="ann-panel-foot"><button class="soft-btn ann-cancel">取消</button><button class="soft-btn ann-ok">保存</button></div>' +
'</div>';
(document.querySelector('.app-shell') || document.body).appendChild(mask);
const close = () => { mask.hidden = true; };
mask.querySelector('.ann-panel-close').addEventListener('click', close);
mask.querySelector('.ann-cancel').addEventListener('click', close);
mask.addEventListener('click', e => { if (e.target === mask) close(); });
const paintTalk = () => {
const box = mask.querySelector('#annTalkWhen');
const prow = mask.querySelector('#annProbRow');
if (!box || !prow) return;
if (!st.wish) { prow.hidden = true; box.hidden = true; return; }
box.hidden = false; prow.hidden = false;
const c = contacts.find(x => x.id === st.cid);
if (!c) { box.textContent = '还没绑定联系人 —— 这样 TA 不会到聊天里提起这件事（通用纪念日只记日期）'; box.className = 'ann-talk-when warn'; return; }
const whenTxt = annWishWhen({ date: st.yearly ? sel.v.slice(5) : sel.v, yearly: st.yearly })
.map(w => w.when).join(' / ') || '当天';
box.textContent = `${fixedNameOf(c) || 'TA'} 会在 ${whenTxt} 以 ${st.wishProb}% 的概率 跟你提起这件事`;
box.className = 'ann-talk-when';
};
const paintOwners = () => {
const row = mask.querySelector('#annEdOwners');
if (!row) return;
let html = `<button type="button" class="fchip${st.cid ? '' : ' on'}" data-cid="">不绑定</button>`;
contacts.forEach(c => {
html += `<button type="button" class="fchip${c.id === st.cid ? ' on' : ''}" data-cid="${escapeHTML(c.id)}">${escapeHTML(fixedNameOf(c) || '未命名')}${c.kind === 'group' ? ' · 群' : ''}</button>`;
});
row.innerHTML = html;
paintTalk();
};
mask.querySelector('#annEdOwners').addEventListener('click', e => {
const b = e.target.closest('.fchip'); if (!b) return;
st.cid = b.dataset.cid || ''; paintOwners();
});
const sumEl = mask.querySelector('#annCalSum');
const foldEl = mask.querySelector('#annCalFold');
const paintCalSum = () => { sumEl.textContent = _annCalSumText(sel.v, st.yearly); };
sumEl.addEventListener('click', () => {
const open = foldEl.hidden; foldEl.hidden = !open;
sumEl.setAttribute('aria-expanded', open ? 'true' : 'false');
});
const repaintCal = () => { _annCalPaint(mask, ym, sel.v, marks, st.yearly ? sel.v.slice(5) : ''); paintCalSum(); paintTalk(); };
const paintType = () => {
mask.querySelectorAll('.ann-type-chip').forEach(b => b.classList.toggle('on', (b.dataset.t === 'yearly') === st.yearly));
mask.querySelector('.ann-type-hint').textContent = st.yearly ? '每年重复：只记 月/日，到点自动倒数' : '未来日期自动倒数，过去日期自动累计';
mask.querySelector('#annOffRow').hidden = st.yearly;
repaintCal();
};
mask.querySelector('.ann-type-row').addEventListener('click', e => {
const b = e.target.closest('.ann-type-chip');
if (!b) return;
st.yearly = b.dataset.t === 'yearly';
paintType();
});
mask.querySelector('#annEdOffset').addEventListener('input', e => {
const n = parseInt(e.target.value, 10);
if (!isFinite(n)) return;
const dt = new Date(_annToday0().getTime() + n * 864e5);
const ds = dt.getFullYear() + '-' + _annPad2(dt.getMonth() + 1) + '-' + _annPad2(dt.getDate());
sel.v = ds; ym.y = dt.getFullYear(); ym.m = dt.getMonth();
if (!foldEl.hidden) _annCalPaint(mask, ym, sel.v, marks, st.yearly ? sel.v.slice(5) : '');
paintCalSum(); paintTalk();
});
const paintWish = () => { mask.querySelector('#annEdWish').checked = st.wish; paintTalk(); };
mask.querySelector('#annEdWish').addEventListener('change', e => { st.wish = e.target.checked; paintWish(); });
mask.querySelector('#annProbRow').addEventListener('click', e => {
const b = e.target.closest('.ann-prob-chip');
if (!b) return;
st.wishProb = +b.dataset.p || 100;
mask.querySelectorAll('.ann-prob-chip').forEach(x => x.classList.toggle('on', +x.dataset.p === st.wishProb));
paintTalk();
});
mask.querySelector('#annEdName').value = entry ? (entry.name || '') : '纪念日';
mask.querySelector('#annEdMain').checked = entry ? !!entry.main : false;
mask.querySelectorAll('.ann-prob-chip').forEach(x => x.classList.toggle('on', +x.dataset.p === st.wishProb));
_annCalNavBind(mask, ym, repaintCal);
_annCalMonthBind(mask, ym, repaintCal);
_annCalGridBind(mask, ym, sel, () => { repaintCal(); foldEl.hidden = true; sumEl.setAttribute('aria-expanded', 'false'); });
paintOwners();
paintType();
paintWish();
mask.querySelector('.ann-ok').addEventListener('click', () => {
const nameInput = mask.querySelector('#annEdName');
let name = (nameInput.value || '').trim();
if (!name) name = '纪念日';
const dsFull = _annNormDate(sel.v);
const dsMd = _annNormMD(sel.v.slice(5));
if (st.yearly ? !dsMd : !dsFull) { showToast('请选择日期'); return; }
const wantMain = mask.querySelector('#annEdMain').checked;
const cid = contacts.some(c => c.id === st.cid) ? st.cid : '';
if (!Array.isArray(data.anniversaries)) data.anniversaries = [];
let rec = st.id ? annList().find(a => a.id === st.id) : null;
if (!rec) { rec = { id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }; data.anniversaries.push(rec); }
rec.name = name; rec.date = st.yearly ? dsMd : dsFull; rec.yearly = st.yearly;
rec.contactId = cid; rec.main = wantMain;
rec.wish = st.wish; rec.wishProb = st.wishProb;
if (wantMain) annList().forEach(a => { if (a !== rec && a.main && a.contactId === cid) a.main = false; });
save();
_annEditorMask.hidden = true;
renderAnniversary();
if (wantMain || rec.main) _annRefreshChat();
showToast(entry ? '已保存' : '已添加');
});
_annEditorMask = mask;
mask.hidden = false;
}
function _annCalSumText(ds, yearly) {
const wd = ['日', '一', '二', '三', '四', '五', '六'];
const d = new Date(ds + 'T00:00:00');
if (isNaN(d.getTime())) return '选择日期';
const mo = d.getMonth() + 1, day = d.getDate(), w = '周' + wd[d.getDay()];
if (yearly) { const nx = _annNext(ds); return `每年 ${mo}月${day}日 · ${w}${nx.cd === 0 ? ' · 就是今天' : ' · 下次还有 ' + nx.cd + ' 天'}`; }
const diff = Math.round((d - _annToday0()) / 864e5);
const tail = diff > 0 ? ' · 还有 ' + diff + ' 天' : diff < 0 ? ' · 已过 ' + (-diff) + ' 天' : ' · 就是今天';
return `${d.getFullYear()}年${mo}月${day}日 · ${w}${tail}`;
}
function _annWishText(a, years) {
const name = (a.name || '').trim() || '纪念日';
if (years > 0) {
const pool = [
`今天是「${name}」${years}周年，这个日子我一直记着，往后的每一年也想和你一起过`,
`「${name}」${years}周年快乐，谢谢你陪我走了这么远`,
`又是一年「${name}」，${years}年了，还想和你继续走下去`,
];
return pool[Math.floor(Math.random() * pool.length)];
}
const pool = [
`今天是「${name}」的日子，我记着呢，祝你今天顺顺利利`,
`「${name}」到啦，这一天我等了很久，要开开心心的`,
`今天是「${name}」呀，想和你说：有你在真好`,
];
return pool[Math.floor(Math.random() * pool.length)];
}
function _annHeadsUpText(a, cd) {
const name = (a.name || '').trim() || '纪念日';
const when = cd === 1 ? '明天' : `还有 ${cd} 天`;
const pool = [
`悄悄说，${when}就到「${name}」了，我先记着`,
`翻日历才看到，「${name}」${when}就到了，到时候要好好过`,
`${when}就是「${name}」啦，已经开始期待了`,
];
return pool[Math.floor(Math.random() * pool.length)];
}
function _annMileText(a, mile) {
const name = (a.name || '').trim() || '在一起';
const pool = [
`明天，「${name}」就满 ${mile} 天啦`,
`明天是个小日子——「${name}」第 ${mile} 天`,
`明天就是我们「${name}」的第 ${mile} 天了，先跟你说一声`,
];
return pool[Math.floor(Math.random() * pool.length)];
}
function annWishTick() {
if (typeof isSchedulerLeader === 'function' && !isSchedulerLeader()) return;
const today = _annToday();
const md = today.slice(5), cy = today.slice(0, 4);
let changed = false, mentioned = false;
annList().forEach(a => {
if (!a || a.lastMention === today) return;
const yearly = !!a.yearly;
const isSameDay = yearly ? a.date === md : a.date === today;
const isAnniv = !yearly && !isSameDay && a.date.slice(5) === md && a.date.slice(0, 4) < cy;
const headsUp = !isSameDay && ANN_HEADUP.includes(_annNext(a.date).cd) ? _annNext(a.date).cd : 0;
let mile = 0;
if (!yearly && !isSameDay) {
const dTom = _annDays(a.date) + 1;
if (ANN_MILE.includes(dTom)) mile = dTom;
}
if (!isSameDay && !isAnniv && !headsUp && !mile) return;
const cid = a.contactId;
if (cid) {
const ch0 = (data.chats || {})[cid];
if (!ch0 || !Array.isArray(ch0.msgs)) return;
}
a.lastMention = today;
mentioned = true;
const prob = (typeof a.wishProb === 'number') ? Math.max(0, Math.min(100, a.wishProb)) : 100;
if (a.wish === false || Math.random() * 100 >= prob) return;
if (!cid) return;
const ch = (data.chats || {})[cid];
if (!ch || !Array.isArray(ch.msgs)) return;
const c = (data.contacts || []).find(x => x.id === cid);
let text;
if (isSameDay || isAnniv) {
const years = isAnniv ? (+cy - +a.date.slice(0, 4)) : 0;
text = _annWishText(a, years);
a.lastWish = today;
} else if (headsUp) text = _annHeadsUpText(a, headsUp);
else text = _annMileText(a, mile);
const msg = { id: (typeof nextId === 'function') ? nextId() : 'm' + Date.now(), from: 'partner', text, asBadge: true };
if (c && c.kind === 'group' && Array.isArray(c.members) && c.members.length) {
msg.sender = c.members[Math.floor(Math.random() * c.members.length)];
}
if (typeof _deliverToChat === 'function') _deliverToChat(msg, cid);
else { ch.msgs.push(msg); if (cid === data.activeChat) renderMessages(); }
changed = true;
});
if (mentioned) save();
if (changed) renderAnnExtras();
}
function renderAnnOwners() {
const row = $('#annOwners');
if (!row) return;
const l = annList();
if (l.length < 2) { row.hidden = true; row.innerHTML = ''; return; }
row.hidden = false;
const cnt = f => l.filter(f).length;
let html = `<button type="button" class="fchip${_annFilter === '' ? ' on' : ''}" data-f="">全部 ${l.length}</button>`;
html += `<button type="button" class="fchip${_annFilter === '__none' ? ' on' : ''}" data-f="__none">通用 ${cnt(a => !a.contactId)}</button>`;
(data.contacts || []).forEach(c => {
const n = cnt(a => a.contactId === c.id);
if (!n) return;
html += `<button type="button" class="fchip${_annFilter === c.id ? ' on' : ''}" data-f="${escapeHTML(c.id)}">${escapeHTML(fixedNameOf(c) || '未命名')} ${n}</button>`;
});
row.innerHTML = html;
}
function _annSetMain(id) {
const l = annList(); const rec = l.find(a => a.id === id);
if (!rec) return;
const turnOn = !rec.main;
l.forEach(a => { if ((a.contactId || '') === (rec.contactId || '')) a.main = false; });
rec.main = turnOn;
save(); renderAnniversary(); _annRefreshChat();
showToast(turnOn ? '已设为主纪念日' : '已取消主纪念日');
}
function _annRemove(id) {
const l = annList(); const rec = l.find(a => a.id === id);
if (!rec) return;
_annUndoSnap = l.slice();
data.anniversaries = l.filter(a => a.id !== id);
save(); renderAnniversary(); if (rec.main) _annRefreshChat();
const bar = $('#annUndo'); const nm = $('#annUndoName');
if (bar && nm) { nm.textContent = rec.name || '纪念日'; bar.hidden = false; }
if (_annUndoTimer) clearTimeout(_annUndoTimer);
_annUndoTimer = setTimeout(_annUndoHide, 5000);
}
function _annUndoHide() {
_annUndoSnap = null;
if (_annUndoTimer) { clearTimeout(_annUndoTimer); _annUndoTimer = null; }
const bar = $('#annUndo'); if (bar) bar.hidden = true;
}
function _annUndoRestore() {
if (!_annUndoSnap) { _annUndoHide(); return; }
data.anniversaries = _annUndoSnap;
const wasMain = _annUndoSnap.some(a => a && a.main);
save(); _annUndoHide(); renderAnniversary(); if (wasMain) _annRefreshChat();
showToast('已放回');
}
$('#annAddBtn') && $('#annAddBtn').addEventListener('click', () => openAnnEditor(null));
$('#annAddBtn2') && $('#annAddBtn2').addEventListener('click', () => openAnnEditor(null));
$('#annHero') && $('#annHero').addEventListener('click', () => {
const cid = (typeof currentContact === 'function' && (currentContact() || {}).id) || '';
openAnnEditor(annMainFor(cid) || null);
});
$('#annOwners') && $('#annOwners').addEventListener('click', e => {
const b = e.target.closest('.fchip');
if (!b) return;
_annFilter = b.dataset.f || '';
renderAnniversary();
});
$('#annUndoBtn') && $('#annUndoBtn').addEventListener('click', _annUndoRestore);
$('#annExtraList') && $('#annExtraList').addEventListener('click', e => {
const del = e.target.closest('.ann-extra-del');
if (del) { _annRemove(del.dataset.id); return; }
const star = e.target.closest('.ann-extra-star');
if (star) { _annSetMain(star.dataset.id); return; }
const row = e.target.closest('.ann-extra');
if (row) {
const rec = annList().find(a => a.id === row.dataset.id);
if (rec) openAnnEditor(rec);
}
});
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['anniv'] = true;
