// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var _EO_FOOT_TAIL = '词最长 12 个字，一行一个。「停用」是这条不再被抽到、词还留着；「删」是真从这一本拿走。这一本只在你这台设备上，出厂那一本不会因为这里改动一个字。逻辑连接词不在这页（它仍走出厂那 8 类）。';
var _eoTab = 'mood';
var _eoOpen = {};
var _eoPanelKind = 'mood';
var _eoPanelName = '';
function _eoTabOf() { return EMOTION_LIB_TABS.some(t => t.k === _eoTab) ? _eoTab : 'mood'; }
function _eoLabel(kind) { const t = EMOTION_LIB_TABS.find(x => x.k === kind); return t ? t.label : kind; }
function _eoOpenSet(kind, firstG) { if (!_eoOpen[kind]) _eoOpen[kind] = new Set(firstG ? [firstG] : []); return _eoOpen[kind]; }
function _eoGroupsOf(kind) { return _emoOwnGroupsOf(kind); }
function _eoCount(kind) {
const gs = _eoGroupsOf(kind);
let cards = 0, off = 0;
gs.forEach(g => (g.c || []).forEach(c => { cards++; if (c && c.off === true) off++; }));
return { groups: gs.length, cards, off, live: cards - off };
}
function _eoLiveAll() {
return EMOTION_OWN_KINDS.reduce((s, k) => s + _eoCount(k).live, 0);
}
function _eoOnlyNote(only, nLive) {
return only
? (nLive ? `现在只从你填的 ${nLive} 张里挑，出厂那一本一概不抽。` : '现在开着，可你一个词都抽不到（没填或全停用了）——标签会整枚不出来。')
: `现在：出厂那一本 + 你填的 ${nLive} 张 一起挑。`;
}
function _eoOddsText(only, nOwn, nNamed) {
const n = nOwn + nNamed;
if (only) return n ? `现在开着「只用我自设的」：这一档挂出的标签只从你填的 ${n} 张里抽，出厂的一张都不抽。`
: '现在开着「只用我自设的」，可这一档你一个词都没填（或全停用了）——那一枚标签不会挂出来。';
if (!n) return '这一档还没填词，全部走出厂那一本。';
const bits = [];
if (nOwn) {
const pct = Math.round(nOwn / (100 + nOwn) * 100);
bits.push('自己起的组共 ' + nOwn + ' 张：按张数计分，这一档大约每 ' + Math.max(2, Math.round(100 / nOwn + 1)) + ' 次里有 1 次用的是你的词（约 ' + pct + '%）');
}
if (nNamed) bits.push('挂进出厂那一组的 ' + nNamed + ' 张：跟着那一组自己的份额抽，和组里的出厂词等概率');
return bits.join('；') + '。';
}
function _eoGrpHint(only, name) {
return only
? `「只用我自设的」开着：这一组现在只抽你写的这几张，出厂「${name}」那一组的词暂时不抽。`
: `你的词并进出厂「${name}」那一组一起抽（吃那一组自己的份额）；这一页只列你写的那几张。`;
}
function _eoSplit(kind) {
let own = 0, named = 0;
_eoGroupsOf(kind).forEach(g => {
const live = _emoOwnCards(kind, g.g).length;
if (_emoFactoryGroupOf(kind, g.g)) named += live; else own += live;
});
return { own, named };
}
function _eoWordHTML(kind, gi, c, ci) {
/* 脏数据兜底：历史备份里可能出现裸字符串或 null 词条，
 * 直接取 c.t 会在 map 里抛错 → 整页空白且关不掉（卡死观感）。 */
if (typeof c === 'string') c = { t: c };
if (!c || typeof c !== 'object') c = { t: '' };
const word = String(c.t == null ? '' : c.t);
const off = c.off === true;
return `<span class="emo-word${off ? ' off' : ''}"><i>${escapeHTML(word)}</i>`
+ `<button type="button" class="emo-del" data-eo-del="${gi}:${ci}" aria-label="删掉${escapeHTML(word)}">删</button>`
+ `<button type="button" class="emo-off" data-eo-off="${gi}:${ci}">${off ? '启用' : '停用'}</button></span>`;
}
function _eoGrpHTML(kind, g, gi, open) {
const cs = Array.isArray(g.c) ? g.c : [];
const offN = cs.filter(c => c && c.off === true).length;
const named = !!_emoFactoryGroupOf(kind, g.g);
return `<div class="emo-grp${open ? ' open' : ''}" data-eo-grp="${gi}">`
+ `<button type="button" class="emo-grp-hd" data-eo-fold="${gi}" aria-expanded="${open ? 'true' : 'false'}">`
+ `<b>${escapeHTML(g.g)}</b><small>${cs.length} 张${offN ? ' · 停用 ' + offN + ' 张' : ''}${named ? ' · 挂进出厂那一组' : ''}</small><i class="emo-grp-ar" aria-hidden="true"></i></button>`
+ `<div class="emo-grp-bd"${open ? '' : ' hidden'}>`
+ `<div class="eo-acts"><button type="button" class="eo-act" data-eo-add="${gi}">＋ 加词</button>`
+ `<button type="button" class="eo-act" data-eo-rename="${gi}">改名</button>`
+ `<button type="button" class="eo-act eo-gdel" data-eo-gdel="${gi}">删组</button></div>`
+ (named ? `<p class="eo-hint">${escapeHTML(_eoGrpHint(_emoOwnOnly(), g.g))}</p>` : '')
+ (cs.length ? `<div class="emo-words">${cs.map((c, ci) => _eoWordHTML(kind, gi, c, ci)).join('')}</div>`
: `<p class="emo-empty">这一组还没有词 · 点上面「＋ 加词」填几个（一行一个）</p>`)
+ `</div></div>`;
}
function _eoPaintGroups() {
const kind = _eoTabOf();
const box = document.getElementById('eoGrps');
if (!box) return;
const gs = _eoGroupsOf(kind);
const open = _eoOpenSet(kind, gs[0] ? gs[0].g : '');
box.innerHTML = gs.length
? gs.map((g, gi) => { try { return _eoGrpHTML(kind, g, gi, open.has(g.g)); } catch (e) { return ''; } }).join('')
: `<div class="eo-none"><b>还没有自己填的词</b><span>两条路都行：挂进出厂那一档里的某一组（比如「喜悦与正向」，你的词跟那一组的出厂词一起抽），或者自己起一组。</span></div>`;
const note = document.getElementById('eoNote');
if (note) {
const n = _eoCount(kind);
note.textContent = `${_eoLabel(kind)} · ${n.groups} 组 ${n.cards} 张`
+ (n.off ? `，停用 ${n.off} 张` : '') + (n.cards && !n.live ? '：这一档现在一张都抽不到（全停用了）' : '');
}
const foot = document.getElementById('eoFoot');
if (foot) { const sp = _eoSplit(kind); foot.textContent = _eoOddsText(_emoOwnOnly(), sp.own, sp.named) + _EO_FOOT_TAIL; }
const onlyTx = document.querySelector('.eo-only-tx small');
if (onlyTx) onlyTx.textContent = _eoOnlyNote(_emoOwnOnly(), _eoLiveAll());
}
function renderEmoOwnPage() {
const box = document.getElementById('eoList');
if (!box) return;
const kind = _eoTabOf();
const only = _emoOwnOnly();
let h = `<p class="eo-lead">你自己填的情绪／心意／意图标签。分组的方式与出厂那一本一样：可以挂进出厂已有的那一组，也可以自己起一组。</p>`;
h += `<button type="button" class="eo-only${only ? ' on' : ''}" data-eo-only="1" aria-pressed="${only ? 'true' : 'false'}">`
+ `<span class="eo-only-tx"><b>只用我自设的</b><small>${escapeHTML(_eoOnlyNote(only, _eoLiveAll()))}</small></span>`
+ `<span class="hub-tg${only ? '' : ' off'}"></span></button>`;
h += `<div class="emo-chips" id="eoTabs">${EMOTION_LIB_TABS.map(t =>
    `<button type="button" class="scope-chip${kind === t.k ? ' on' : ''}" data-eo-tab="${t.k}">${escapeHTML(t.label)}</button>`).join('')}</div>`;
h += `<p class="eo-note" id="eoNote"></p>`;
h += `<button type="button" class="eo-add" data-eo-newgrp="1">＋ 新建一组</button>`;
h += `<p class="eo-alt"><button type="button" class="eo-act eo-act-big" data-eo-add="" >＋ 挂进出厂的那一组（喜悦与正向 ∶ 陪伴与守护 ∶ 回应…）</button></p>`;
h += `<div id="eoGrps"></div>`;
h += `<p class="eo-foot" id="eoFoot"></p>`;
box.innerHTML = h;
/* 渲染兜底：一旦某一步抛错（脏数据/接口缺失），给出可见的降级提示并把
 * 页面交还给用户，而不是留一片空白、返回键也失效的「卡死」状态。 */
try { _eoPaintGroups(); }
catch (e) {
const gr = document.getElementById('eoGrps');
if (gr) gr.innerHTML = '<div class="eo-none"><b>这一页暂时画不出来</b><span>数据里可能有一条坏词条挡住了渲染。点「清空重进」或从备份恢复一次即可修复；其余功能不受影响。</span></div>';
try { console.warn('[emoown] paint fail:', e); } catch (e2) {}
}
}
function _eoNewGroup(kind, name) {
const lib = _emoOwnLib();
if (!Array.isArray(lib[kind])) lib[kind] = [];
lib[kind].push({ g: name, c: [] });
_eoOpenSet(kind, '').add(name);
save();
return lib[kind].length - 1;
}
function _eoNameChecked(kind, name, exceptGi) {
let n = String(name || '').trim();
if (!n) { showToast('先起个分组名'); return ''; }
if (n.length > EMOTION_OWN_NAME_MAX) { n = n.slice(0, EMOTION_OWN_NAME_MAX); showToast('组名最长 ' + EMOTION_OWN_NAME_MAX + ' 个字，截到这一档存下'); }
const same = _eoGroupsOf(kind).findIndex((g, gi) => gi !== exceptGi && g && g.g === n);
if (same >= 0) { showToast('这一档里已经有「' + n + '」这一组'); return ''; }
return n;
}
function _eoAskGroupName(opts) {
if (typeof _askGroupName === 'function') { _askGroupName(opts); return; }
if (typeof ensureChunk !== 'function') { _askGroupName(opts); return; }
ensureChunk('cards').then(function (okk) {
if (okk && typeof _askGroupName === 'function') _askGroupName(opts);
else if (typeof showToast === 'function') showToast('这一组名没弹出来，网络好了再点一次');
});
}
function _eoAskNew(kind) {
_eoAskGroupName({
title: '新建一组 · ' + _eoLabel(kind),
hint: '起自己的名字（比如「就爱说的那几句」）；想挂进出厂那一组，也可以直接填它的原名，比如「喜悦与正向」。',
okText: '创建',
onOk: name => {
const n = _eoNameChecked(kind, name, -1);
if (!n) return;
_eoNewGroup(kind, n);
_eoTab = kind;
renderEmoOwnPage();
if (_emoFactoryGroupOf(kind, n)) showToast('已挂进出厂那一组「' + n + '」· 现在可以加词');
}
});
}
function _eoPanelPaint() {
const kind = _eoPanelKind;
const gs = _eoGroupsOf(kind);
if (!gs.some(g => g.g === _eoPanelName)) _eoPanelName = _eoPanelName && _emoFactoryGroupOf(kind, _eoPanelName) ? _eoPanelName : (gs[0] ? gs[0].g : '');
const row = document.getElementById('eoGrpRow');
if (row) row.innerHTML = gs.length
? gs.map(g => `<button type="button" class="fchip${g.g === _eoPanelName ? ' on' : ''}" data-eo-pick="${escapeHTML(g.g)}">${escapeHTML(g.g)}<span class="n">${(g.c || []).length}</span></button>`).join('')
: '<span class="cl-grp-empty">还没有自己的组 · 点下面那一排列一个，或点「＋ 自己起一名」</span>';
const facRow = document.getElementById('eoFacRow');
const mine = new Set(_emoOwnNames(kind));
if (facRow) {
const fac = _emoFactoryGroups(kind).filter(g => !mine.has(g));
facRow.innerHTML = fac.length
? fac.map(g => {
const n = _emoFactoryGroupOf(kind, g);
return `<button type="button" class="fchip${g === _eoPanelName ? ' on' : ''}" data-eo-pick-name="${escapeHTML(g)}">${escapeHTML(g)}<span class="n">${((n && n.c) || []).length}</span></button>`;
}).join('')
: '<span class="cl-grp-empty">出厂那一档里的组你都挂过了</span>';
}
const ti = document.getElementById('eoAddTi');
if (ti) ti.textContent = '加词 · ' + _eoLabel(kind);
}
function _eoPanelOpen(gi) {
const kind = _eoTabOf();
const gs = _eoGroupsOf(kind);
_eoPanelKind = kind;
_eoPanelName = (Number.isInteger(gi) && gi >= 0 && gs[gi]) ? gs[gi].g : '';
const inp = document.getElementById('eoInput');
if (inp) inp.value = '';
const nr = document.getElementById('eoNewRow'); if (nr) nr.hidden = true;
_eoPanelPaint();
const mask = document.getElementById('eoAddMask'); if (mask) mask.hidden = false;
if (inp) setTimeout(() => { try { inp.focus(); } catch (e) {} }, 60);
}
function _eoPanelClose() {
const m = document.getElementById('eoAddMask'); if (m) m.hidden = true;
const nr = document.getElementById('eoNewRow'); if (nr) nr.hidden = true;
_eoPanelName = '';
}
function _eoPanelSubmit() {
const kind = _eoPanelKind;
const name = String(_eoPanelName || '').trim();
if (!name) { _eoPanelPaint(); showToast('先选一组，或点「＋ 自己起一名」起一个'); return; }
const inp = document.getElementById('eoInput');
const raw = inp ? inp.value : '';
if (!String(raw).trim()) { showToast('先写一个词'); return; }
let g = _emoOwnGroup(kind, name);
const joining = !g && !!_emoFactoryGroupOf(kind, name);
if (!g) { const gi = _eoNewGroup(kind, name); g = _eoGroupsOf(kind)[gi]; }
if (!Array.isArray(g.c)) g.c = [];
const lines = String(raw).split(/\r\n|\r|\n|\u2028|\u2029/);
let added = 0, dup = 0, cut = 0;
for (const one of lines) {
const t = _emoOwnWordClean(one);
if (!t) continue;
if (String(one).trim().length > EMOTION_OWN_WORD_MAX) cut++;
if (g.c.some(c => c && c.t === t)) { dup++; continue; }
g.c.push({ t }); added++;
}
if (added) _eoOpenSet(kind, '').add(g.g);
/* 提交兜底：save() 或渲染抛错也不能把面板留在屏幕上关不掉。 */
try {
save();
_eoPanelClose();
_eoTab = kind;
renderEmoOwnPage();
} catch (err) {
try { _eoPanelClose(); } catch (e2) {}
try { renderEmoOwnPage(); } catch (e3) {}
showToast('加词时出了点问题，已退出填写框');
throw err;
}
showToast((added ? `加了 ${added} 个词` : (dup ? '这些这一组里已有' : '没加进一个词'))
+ (dup ? `，${dup} 个已有` : '') + (cut ? `，${cut} 个超 12 字截存` : '')
+ (joining && added ? ` · 挂进「${g.g}」那一组` : ''));
}
document.addEventListener('click', (ev) => {
const host = document.getElementById('eoList');
const mask = document.getElementById('eoAddMask');
const inPage = (host && host.contains(ev.target)) || (mask && mask.contains(ev.target));
if (!inPage) return;
const fold = ev.target.closest('[data-eo-fold]');
if (fold) {
const gi = Number(fold.dataset.eoFold);
const g = _eoGroupsOf(_eoTabOf())[gi];
if (!g) return;
const set = _eoOpenSet(_eoTabOf(), '');
const open = set.has(g.g);
if (open) set.delete(g.g); else set.add(g.g);
const grp = fold.closest('.emo-grp');
if (grp) {
grp.classList.toggle('open', !open);
const bd = grp.querySelector('.emo-grp-bd');
if (bd) bd.hidden = open;
}
fold.setAttribute('aria-expanded', open ? 'false' : 'true');
return;
}
if (ev.target.closest('[data-eo-tab]')) {
const t = ev.target.closest('[data-eo-tab]');
_eoTab = t.dataset.eoTab;
renderEmoOwnPage();
return;
}
if (ev.target.closest('[data-eo-only]')) {
const lib = _emoOwnLib();
lib.only = lib.only !== true;
save();
renderEmoOwnPage();
return;
}
if (ev.target.closest('[data-eo-newgrp]')) { _eoAskNew(_eoTabOf()); return; }
const add = ev.target.closest('[data-eo-add]');
if (add) { const raw = add.dataset.eoAdd; _eoPanelOpen(raw === '' ? -1 : Number(raw)); return; }
const rn = ev.target.closest('[data-eo-rename]');
if (rn) {
const gi = Number(rn.dataset.eoRename);
const g = _eoGroupsOf(_eoTabOf())[gi];
if (!g) return;
const kind = _eoTabOf();
_eoAskGroupName({
title: '改这一组的组名', hint: '只改名字，组里的词一个不动。', okText: '确定', value: g.g,
onOk: name => {
const n = _eoNameChecked(kind, name, gi);
if (!n) return;
const set = _eoOpenSet(kind, '');
if (set.has(g.g)) { set.delete(g.g); set.add(n); }
g.g = n; save(); renderEmoOwnPage();
if (_emoFactoryGroupOf(kind, n)) showToast('这一组现在挂进出厂「' + n + '」那一组一起抽');
}
});
return;
}
const gd = ev.target.closest('[data-eo-gdel]');
if (gd) {
const n = _eoCount(_eoTabOf()).groups;
if (!gd.classList.contains('arm')) {
document.querySelectorAll('.eo-gdel.arm').forEach(b => { if (b !== gd) _eoDisArm(b); });
if (n <= 1) {
gd.classList.add('arm');
gd.textContent = '这是最后一组，确认删？';
} else {
const cnt = (_eoGroupsOf(_eoTabOf())[Number(gd.dataset.eoGdel)] || {}).c;
gd.classList.add('arm');
gd.textContent = `确认删这组 ${(cnt || []).length} 个词？`;
}
clearTimeout(gd._eoArmT);
gd._eoArmT = setTimeout(() => _eoDisArm(gd), 2500);
return;
}
_eoDisArm(gd);
const kind = _eoTabOf();
const gi = Number(gd.dataset.eoGdel);
const lib = _emoOwnLib();
const gone = (lib[kind] || [])[gi];
if (gone) _eoOpenSet(kind, '').delete(gone.g);
lib[kind].splice(gi, 1);
save(); renderEmoOwnPage();
showToast('删掉了「' + ((gone && gone.g) || '') + '」');
return;
}
const sw = ev.target.closest('[data-eo-off]');
if (sw) {
const kind = _eoTabOf();
const [gi, ci] = String(sw.dataset.eoOff).split(':').map(Number);
const c = ((_eoGroupsOf(kind)[gi] || {}).c || [])[ci];
if (!c) return;
c.off = c.off === true ? false : true;
save();
_eoPaintGroups();
return;
}
const del = ev.target.closest('[data-eo-del]');
if (del) {
const kind = _eoTabOf();
const [gi, ci] = String(del.dataset.eoDel).split(':').map(Number);
const g = _eoGroupsOf(kind)[gi];
if (!g || !Array.isArray(g.c)) return;
const gone = g.c[ci];
g.c.splice(ci, 1);
save();
_eoPaintGroups();
if (gone) showToast('删掉了「' + gone.t + '」');
return;
}
const pick = ev.target.closest('[data-eo-pick], [data-eo-pick-name]');
if (pick) {
_eoPanelName = String(pick.dataset.eoPickName || pick.dataset.eoPick || '').trim();
_eoPanelPaint();
return;
}
if (ev.target.closest('#eoGrpNew')) {
const nr = document.getElementById('eoNewRow');
if (!nr) return;
nr.hidden = false;
const ni = document.getElementById('eoNewInput');
if (ni) { ni.value = ''; setTimeout(() => { try { ni.focus(); } catch (e) {} }, 30); }
return;
}
if (ev.target.closest('#eoNewNo')) { const nr = document.getElementById('eoNewRow'); if (nr) nr.hidden = true; return; }
if (ev.target.closest('#eoNewOk')) {
const ni = document.getElementById('eoNewInput');
const name = _eoNameChecked(_eoPanelKind, ni ? ni.value : '', -1);
if (!name) return;
const gi = _eoNewGroup(_eoPanelKind, name);
_eoPanelName = name;
const nr = document.getElementById('eoNewRow'); if (nr) nr.hidden = true;
_eoPanelPaint();
return;
}
if (ev.target.closest('#eoAddYes')) { _eoPanelSubmit(); return; }
if (ev.target.closest('#eoAddNo') || ev.target.closest('#eoAddClose')) { _eoPanelClose(); return; }
if (ev.target === mask) _eoPanelClose();
});
function _eoDisArm(btn) {
if (!btn) return;
clearTimeout(btn._eoArmT);
btn.classList.remove('arm');
btn.textContent = '删组';
}
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['emoown'] = true;
