// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var statsScope = 'all';
var STATS_TABS = [
{ k: 'overview', name: '概览' },
{ k: 'hours', name: '时段' },
{ k: 'cards', name: '字卡' },
{ k: 'calls', name: '通话' },
{ k: 'listen', name: '听歌' },
{ k: 'timeline', name: '时光线' },
];
var STATS_TAB_KEY = 'ordinal-stats-tab';
var statsTab = 'overview';
var _statsTabLoaded = false;
function _statsTabLoad() {
if (_statsTabLoaded) return;
_statsTabLoaded = true;
let v = null;
try { v = localStorage.getItem(STATS_TAB_KEY); } catch (e) { }
statsTab = STATS_TABS.some(x => x.k === v) ? v : 'overview';
}
function _statsTabSet(k) {
if (!STATS_TABS.some(x => x.k === k) || k === statsTab) return;
statsTab = k;
try { localStorage.setItem(STATS_TAB_KEY, k); } catch (e) { }
}
function _statsScopeMsgs() {
if (statsScope !== 'all' && data.chats && data.chats[statsScope]) return data.chats[statsScope].msgs || [];
let all = [];
for (const c of data.contacts || []) { const ch = data.chats && data.chats[c.id]; if (ch && ch.msgs) all = all.concat(ch.msgs); }
return all;
}
function _statsNum(n) {
const v = Math.max(0, Math.round(Number(n) || 0));
return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function _statsStreak(daySet) {
const dayNo = [];
for (const k of daySet) {
const d = new Date(String(k).replace(/-/g, '/'));
if (isNaN(d.getTime())) continue;
dayNo.push(Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000));
}
if (!dayNo.length) return 0;
const uniq = [...new Set(dayNo)].sort((a, b) => a - b);
let best = 1, run = 1;
for (let i = 1; i < uniq.length; i++) {
if (uniq[i] === uniq[i - 1] + 1) { run++; if (run > best) best = run; }
else run = 1;
}
return best;
}
function _statsBarsHTML(cnt, opts) {
const o = opts || {};
const max = cnt.length ? Math.max(...cnt) : 0;
const bars = cnt.map((v, i) => `<div class="stats-hour${max > 0 && v === max ? ' hi' : ''}"${o.tip ? ` title="${escapeHTML(o.tip(v, i))}"` : ''}><i style="height:${max ? Math.max(Math.round(v / max * 100), 1) : 1}%"></i></div>`).join('');
const x = (o.labels || []).map(s => `<span>${escapeHTML(String(s))}</span>`).join('');
const note = max ? (o.peak ? `<p class="stats-note">${escapeHTML(o.peak)}</p>` : '') : '<p class="stats-note">这一项还没有记录。</p>';
return `<div class="stats-hours${o.sm ? ' sm' : ''}">${bars}</div>` + (x ? `<div class="stats-hours-x">${x}</div>` : '') + note;
}
function _statsMonthCells(tsList) {
let firstTs = 0;
tsList.forEach(ts => { if (ts && (!firstTs || ts < firstTs)) firstTs = ts; });
const now = new Date();
const cur = { y: now.getFullYear(), m: now.getMonth() };
if (!firstTs) return { cells: [], cut: 0, cur };
const f = new Date(firstTs);
let span = (cur.y - f.getFullYear()) * 12 + (cur.m - f.getMonth()) + 1;
const cut = Math.max(0, span - 24);
span = Math.min(span, 24);
const cells = [];
for (let i = 0; i < span; i++) {
const d = new Date(cur.y, cur.m - (span - 1 - i), 1);
cells.push({ y: d.getFullYear(), m: d.getMonth(), n: 0 });
}
tsList.forEach(ts => {
const d = new Date(ts);
const c = cells.find(x => x.y === d.getFullYear() && x.m === d.getMonth());
if (c) c.n++;
});
return { cells, cut, cur };
}
function _statsMonthLabel(c, cur) {
return (c.y === cur.y ? '' : c.y + '年') + (c.m + 1) + '月';
}
function _statsTrendHTML(tsList) {
const buckets = _statsMonthCells(tsList);
const cells = buckets.cells;
const cur = buckets.cur;
if (cells.length < 2) {
const only = cells.length ? cells[0].n : 0;
return `<p class="stats-note">记录还在第一个月里 · 本月 ${only} 句</p>`;
}
const max = Math.max(...cells.map(c => c.n)) || 1;
const pts = cells.map((c, i) => `${(i / (cells.length - 1) * 300).toFixed(1)},${(56 - c.n / max * 46).toFixed(1)}`);
const thisM = cells[cells.length - 1], lastM = cells[cells.length - 2];
let right = '本月 ' + thisM.n + ' 句';
if (lastM.n > 0) {
const diff = Math.round((thisM.n - lastM.n) / lastM.n * 100);
right = '本月 ' + thisM.n + ' 句 · ' + (diff === 0 ? '与上月持平' : (diff > 0 ? '↑' : '↓') + Math.abs(diff) + '%');
}
return `<svg class="stats-trend" viewBox="0 0 300 64" aria-hidden="true"><polyline points="${pts.join(' ')}"/><circle cx="300" cy="${(56 - thisM.n / max * 46).toFixed(1)}" r="3"/></svg>` +
`<div class="stats-trend-x"><span>${escapeHTML(_statsMonthLabel(cells[0], cur))}</span><span>${escapeHTML(right)}</span></div>`;
}
var _statsAggCache = { key: '', full: false, v: null };
function _statsAgg(msgs, scope, full) {
const today = new Date().toLocaleDateString('zh-CN');
const key = scope + '|' + today + '|' + (data._rev || 0) + '|' + msgs.length;
if (_statsAggCache.key === key && (_statsAggCache.full || !full)) return _statsAggCache.v;
const total = msgs.length;
let mine = 0, partner = 0, sys = 0;
const typeCnt = { text: 0, sticker: 0, cardParts: 0, ask: 0, quote: 0, recall: 0, game: 0 };
const days = new Set();
const hourCnt = new Array(24).fill(0);
let first = null, last = null;
const classify = m => {
if (m.recalled) return 'recall';
if (m.ask) return 'ask';
if (m.game) return 'game';
if (m.sticker) return 'sticker';
if (Array.isArray(m.cardParts) && m.cardParts.length) return 'cardParts';
if (m.quote || m.quoteImg) return 'quote';
return 'text';
};
const dayCnt = [];
for (let i = 6; i >= 0; i--) { const x = new Date(); x.setDate(x.getDate() - i); dayCnt.push({ label: (x.getMonth() + 1) + '/' + x.getDate(), key: x.toLocaleDateString('zh-CN'), n: 0 }); }
const dayCntByKey = {};
dayCnt.forEach(x => { dayCntByKey[x.key] = x; });
if (full) {
for (const m of msgs) {
if (m.from === 'system') sys++;
else if (m.from === 'me') mine++;
else partner++;
const cat = m.from === 'system' ? null : classify(m);
if (cat) typeCnt[cat]++;
if (m.date) { days.add(m.date); const _dc = dayCntByKey[m.date]; if (_dc) _dc.n++; }
const t = m.time || '';
if (t) {
const h = parseInt(String(t).split(':')[0], 10);
if (h >= 0 && h <= 23) hourCnt[h]++;
const stamp = (m.date ? m.date + ' ' : '') + t;
if (!first || stamp < first) first = stamp;
if (!last || stamp > last) last = stamp;
}
}
} else {
for (const m of msgs) { if (m && m.date) days.add(m.date); }
}
const dayCount = days.size;
const avg = dayCount ? (total / dayCount).toFixed(1) : '0';
const streak = _statsStreak(days);
const v = { total, mine, partner, sys, typeCnt, hourCnt, first, last, dayCount, avg, streak, dayCnt };
_statsAggCache = { key, full: !!full, v };
return v;
}
function renderStats() {
const el = $('#statsOutput'); if (!el) return;
const msgs = _statsScopeMsgs();
const A = _statsAgg(msgs, statsScope, statsTab === 'overview');
const total = A.total, mine = A.mine, partner = A.partner, sys = A.sys;
const typeCnt = A.typeCnt, hourCnt = A.hourCnt, first = A.first, last = A.last;
const dayCount = A.dayCount, avg = A.avg, streak = A.streak, dayCnt = A.dayCnt;
const allTs = [];
if (statsTab === 'timeline') {
for (const cid of Object.keys(data.chats || {})) {
const ms = (data.chats[cid] && Array.isArray(data.chats[cid].msgs)) ? data.chats[cid].msgs : [];
for (const m of ms) { const t = _tsOf(m.date, m.time); if (t) allTs.push(t); }
}
}
const typeNames = { text: '文字', sticker: '表情包 / 图片', cardParts: '多字卡', ask: '问问TA', quote: '引用', recall: '撤回', game: '游戏卡' };
const maxType = Math.max(1, ...Object.values(typeCnt));
const typeBars = Object.keys(typeNames).map(k => {
const n = typeCnt[k];
const w = n ? Math.round(n / maxType * 100) : 0;
const pct = total ? Math.round(n / total * 100) : 0;
return `<div class="stats-bar-row"><span class="stats-bar-label">${typeNames[k]}</span><div class="stats-bar-track"><i style="width:${w}%"></i></div><b>${n}<em>${pct}%</em></b></div>`;
}).join('');
const hourMax = hourCnt.length ? Math.max(...hourCnt) : 0;
const peakHour = hourCnt.findIndex(v => hourMax > 0 && v === hourMax);
const hourBars = _statsBarsHTML(hourCnt, {
labels: ['0', '6', '12', '18', '24'],
tip: (v, i) => i + ':00 共 ' + v + ' 条',
peak: '最热闹的是 ' + peakHour + ' 点 · 说了 ' + hourCnt[peakHour] + ' 句'
});
const _annMain = (typeof annMainFor === 'function') ? annMainFor(statsScope !== 'all' ? statsScope : '') : null;
const _annDated = (_annMain && !_annMain.yearly) ? _annMain : null;
let accompany;
if (_annDated) {
const d = Math.max(0, Math.floor((Date.now() - new Date(_annDated.date + 'T00:00:00').getTime()) / 86400000));
const who = _annDated.contactId ? `（和 ${escapeHTML(annContactName(_annDated.contactId))}）` : '';
accompany = `自${who}纪念日 <b>${d}</b> 天以来，「${escapeHTML(partnerName())}」一直陪在你身边`;
} else if (first) {
const _firstTs = new Date(String(first).replace(/-/g, '/')).getTime();
const _days = Math.floor((Date.now() - _firstTs) / 86400000);
accompany = Number.isFinite(_days) && _days >= 0
? `从第一条消息（<b>${escapeHTML(first)}</b>）收录的 <b>${_days}</b> 天前起，「${escapeHTML(partnerName())}」被你收进心里了`
: `从第一条消息（<b>${escapeHTML(first)}</b>）起，「${escapeHTML(partnerName())}」被你收进心里了`;
} else {
accompany = `还没有聊天记录，去和「${escapeHTML(partnerName())}」聊聊天吧`;
}
const weekMax = dayCnt.reduce((mx, x) => Math.max(mx, x.n), 0);
const peakDay = dayCnt.find(x => x.n === weekMax);
const weekBars = _statsBarsHTML(dayCnt.map(x => x.n), {
sm: true,
labels: dayCnt.map(x => x.label),
tip: (v, i) => dayCnt[i].label + ' 共 ' + v + ' 条',
peak: '这七天里 ' + (peakDay ? peakDay.label : '') + ' 说得最多 · ' + (peakDay ? peakDay.n : 0) + ' 条'
});
_statsTabLoad();
let lTotal = 0, lTracks = 0, lWeek = 0;
try {
const lplx = _plRoot();
const playsAll = (lplx && lplx.plays && typeof lplx.plays === 'object' && !Array.isArray(lplx.plays)) ? lplx.plays : {};
const weekAgo = Date.now() - 7 * 86400000;
Object.keys(playsAll).forEach(k => {
const v = playsAll[k] || {};
const n = Math.max(0, Math.floor(Number(v.n) || 0));
if (!n) return;
lTotal += n; lTracks++;
if (Number(v.last) >= weekAgo) lWeek++;
});
} catch (e) {}
let lsn = null;
try { lsn = (typeof plListenStat === 'function') ? plListenStat() : null; } catch (e) {}
const durText = (typeof plDurText === 'function') ? plDurText : (n => String(Math.max(0, Math.floor(Number(n) || 0))) + ' 秒');
const panels = {
overview: `<div class="stats-sec">
      <div class="stats-accompany">${accompany}</div>
      <div class="stats-hour-label">说得多少</div>
      <div class="stats-lines">
        <div><span>我发送</span><b>${_statsNum(mine)} 条</b></div>
        <div><span>对方发送</span><b>${_statsNum(partner)} 条</b></div>
        <div><span>系统消息</span><b>${_statsNum(sys)} 条</b></div>
        <div><span>平均每天</span><b>${avg} 条</b></div>
        <div><span>最早互动</span><b>${first ? escapeHTML(first) : '—'}</b></div>
        <div><span>最近互动</span><b>${last ? escapeHTML(last) : '—'}</b></div>
      </div>
      <div class="stats-hour-label">说是哪种消息</div>
      <div class="stats-bars">${typeBars}</div>
      <p class="stats-note">共 ${total} 条消息：含 ${typeCnt.sticker} 张表情包/图片、${typeCnt.quote} 次引用、${typeCnt.recall} 条撤回、${typeCnt.ask} 张问问TA卡片、${typeCnt.cardParts} 次一句话由多张字卡拼成的回复、${typeCnt.game} 张游戏卡。</p>
    </div>`,
hours: `<div class="stats-sec"><div class="stats-hour-label">一天里哪几个钟头说得最多</div>${hourBars}<div class="stats-hour-label">近 7 天每天条数</div>${weekBars}</div>`,
cards: `<div class="stats-sec">
      <div class="stats-switch" id="statsCardSwitch"><button class="stats-switch-btn" data-side="partner">联系人</button><button class="stats-switch-btn" data-side="me">我的</button></div>
      <div id="statsCardRank"></div>
    </div>`,
calls: `<div class="stats-sec">${statsTab === 'calls' ? callStatsHTML() : ''}</div>`,
listen: `<div class="stats-sec">
      <div class="stats-grid">
        <div class="stats-tile"><b>${_statsNum(lTotal)}</b><span>总播放次数</span></div>
        <div class="stats-tile"><b>${_statsNum(lTracks)}</b><span>听过的曲目</span></div>
        <div class="stats-tile"><b>${_statsNum(lWeek)}</b><span>近 7 天听过</span></div>
      </div>
      <div id="statsListenRank"></div>
      <div class="stats-hour-label">一起听时长</div>
      <div class="stats-grid">
        <div class="stats-tile"><b>${escapeHTML(durText(lsn ? lsn.todayCo : 0))}</b><span>今日一起听</span></div>
        <div class="stats-tile"><b>${escapeHTML(durText(lsn ? lsn.totalCo : 0))}</b><span>累计一起听</span></div>
        <div class="stats-tile"><b>${escapeHTML(durText(lsn ? lsn.totalAll : 0))}</b><span>累计总听歌</span></div>
      </div>
      <p class="stats-note">只数「开播」：切歌、单曲循环重放都算一次，一首听到一半停掉也算一次。听歌次数是整个应用合在一起算的，不分是哪一位。时长只记音频真在往前走的那一段；拖动进度条／跳段不计时。</p>
    </div>`,
timeline: `<div class="stats-sec">${statsTab === 'timeline' ? _statsTimelineHTML(allTs) : ''}</div>`,
};
const listenOnly = statsTab === 'listen';
el.innerHTML = `
    ${listenOnly ? '' : '<div class="stats-scope" id="statsScope"></div>'}
    ${listenOnly ? '' : `<div class="stats-grid">
      <div class="stats-tile"><b>${_statsNum(total)}</b><span>消息条数</span></div>
      <div class="stats-tile"><b>${_statsNum(dayCount)}</b><span>聊天天数</span></div>
      <div class="stats-tile"><b>${_statsNum(streak)}</b><span>连续天数</span></div>
    </div>`}
    <div class="stats-tabs" id="statsTabs">${STATS_TABS.map(t => `<button type="button" class="stats-tab${statsTab === t.k ? ' active' : ''}" data-stats-tab="${t.k}">${t.name}</button>`).join('')}</div>
    <div class="stats-panel" data-tab="${statsTab}">${panels[statsTab]}</div>
  `;
const tabsEl = $('#statsTabs');
if (tabsEl) tabsEl.onclick = e => {
const b = e.target.closest('.stats-tab'); if (!b) return;
_statsTabSet(b.dataset.statsTab);
renderStats();
};
const scopeEl = el.querySelector('#statsScope');
if (scopeEl) {
const chips = [{ id: 'all', label: '全部' }]
.concat((data.contacts || []).map(c => ({ id: c.id, label: (c.kind === 'group' ? '群·' : '') + c.name })));
scopeEl.innerHTML = chips.map(c => `<button type="button" class="scope-chip${statsScope === c.id ? ' on' : ''}" data-scope="${escapeHTML(c.id)}">${escapeHTML(c.label)}</button>`).join('');
scopeEl.onclick = function (e) {
const b = e.target.closest('.scope-chip'); if (!b) return;
statsScope = b.dataset.scope;
renderStats();
};
}
const sw = $('#statsCardSwitch');
if (sw) {
sw.querySelector('[data-side="' + statsCardSide + '"]').classList.add('on');
sw.onclick = function (e) {
const b = e.target.closest('.stats-switch-btn'); if (!b) return;
statsCardSide = b.dataset.side;
sw.querySelectorAll('.stats-switch-btn').forEach(x => x.classList.remove('on'));
b.classList.add('on');
buildCardRank(statsCardSide);
};
}
if (statsTab === 'cards') buildCardRank(statsCardSide);
if (statsTab === 'listen') _statsListenFill();
}
function _statsListenFill() {
const el = document.getElementById('statsListenRank'); if (!el) return;
let playsAll = {};
try { const p = _plRoot(); if (p && p.plays && typeof p.plays === 'object') playsAll = p.plays; } catch (e) {}
const tracks = Object.keys(playsAll)
.map(id => { const t = plById(id); return t ? { t, n: Math.max(0, Math.floor(Number(playsAll[id] && playsAll[id].n) || 0)) } : null; })
.filter(x => x && x.n > 0);
if (!tracks.length) { el.innerHTML = '<div class="stats-empty">还没有听过歌 · 在播放器里放一首就有了</div>'; return; }
tracks.sort((a, b) => b.n - a.n);
const libTag = {};
const rows = tracks.slice(0, 50).map(x => {
const k = x.t.name + (x.t.artist ? ' · ' + x.t.artist : '');
libTag[k] = (typeof _plSrcLabel === 'function') ? _plSrcLabel(x.t) : '';
return [k, x.n];
});
const moreNote = tracks.length > rows.length ? `<div class="stats-empty">仅显示前 ${rows.length} 首，共听过 ${tracks.length} 首</div>` : '';
_statsRankFill(el, rows, libTag, moreNote);
}
var statsCardSide = 'partner';
function callStatsHTML() {
const all = data.calls || [];
const calls = statsScope === 'all' ? all : all.filter(c => (c && c.cid) === statsScope);
const legacy = statsScope === 'all' ? all.filter(c => !c || !c.cid).length : 0;
const total = calls.length;
if (!total) return '<p class="stats-note">' + (statsScope === 'all' ? '还没有通话记录。' : '这位还没有通话记录。') + '</p>';
const cnt = { answer: 0, reject: 0, miss: 0, busy: 0, cancel: 0 };
let durMs = 0;
for (const c of calls) { cnt[c.outcome] = (cnt[c.outcome] || 0) + 1; if (c.durationMs) durMs += c.durationMs; }
const answered = cnt.answer;
const unconnected = total - answered;
const min = Math.floor(durMs / 60000), sec = Math.round((durMs % 60000) / 1000);
const durStr = min + ':' + String(sec).padStart(2, '0');
const parts = [];
parts.push(`接通 ${answered} 通`);
parts.push(`未接 ${cnt.miss} 通`);
parts.push(`忙线 ${cnt.busy} 通`);
parts.push(`拒绝 ${cnt.reject} 通`);
if (cnt.cancel) parts.push(`取消 ${cnt.cancel} 通`);
const vidN = calls.filter(c => c && c.kind === 'video').length;
const voiN = calls.filter(c => c && c.kind === 'voice').length;
const legacyK = total - vidN - voiN;
const kindNote = (vidN || voiN) ? ` 其中视频 ${vidN} 通、语音 ${voiN} 通${legacyK ? '（另有 ' + legacyK + ' 通更早的没记类型）' : ''}。` : '';
return `
    <div class="stats-grid">
      <div class="stats-tile"><b>${_statsNum(total)}</b><span>总通话</span></div>
      <div class="stats-tile"><b>${_statsNum(answered)}</b><span>已接通</span></div>
      <div class="stats-tile"><b>${durStr}</b><span>累计时长</span></div>
    </div>
    <p class="stats-note">未接通 ${unconnected} 通。共 ${total} 通：${parts.join('、')}。${kindNote}${legacy ? '另有更早的 ' + legacy + ' 通 · 那时还没记下是谁。' : ''}</p>`;
}
function _statsRankFill(el, rows, libTag, moreNote) {
const maxN = Math.max(1, rows.length ? rows[0][1] : 1);
const totalN = rows.reduce((s, [, n]) => s + n, 0);
const rankTop = 10;
el.innerHTML = rows.map(([k, n], i) => {
const cat = libTag[k];
const w = Math.max(1, Math.round(n / maxN * 100));
const pct = totalN ? Math.round(n / totalN * 100) : 0;
const tag = cat ? `<span class="ck-tag">${escapeHTML(cat)}</span>` : '<span class="ck-tag hist">历史</span>';
const row = `<div class="ck-row"${i < rankTop ? '' : ' hidden'}><span class="ck-rk">${i + 1}</span><div class="ck-head">${tag}<b class="ck-text">${escapeHTML(k)}</b></div><div class="ck-track"><i style="width:${w}%"></i></div><em class="ck-cnt">${n}<i>${pct}%</i></em></div>`;
if (i === rankTop - 1 && rows.length > rankTop) {
return row + `<button type="button" class="stats-more" data-rank-more>展开其余 ${rows.length - rankTop} 张</button>`;
}
return row;
}).join('') + (moreNote || '');
const more = el.querySelector('[data-rank-more]');
if (more) more.onclick = () => {
el.querySelectorAll('.ck-row[hidden]').forEach(r => { r.hidden = false; });
more.remove();
};
}
function buildCardRank(side) {
const el = $('#statsCardRank'); if (!el) return;
const who = side === 'me' ? '我的' : '联系人';
const lib = cardLibIndex();
const freq = {};
for (const m of _statsScopeMsgs()) {
if (!m || m.from !== side) continue;
if (m.sticker) continue;
let frags = [];
if (Array.isArray(m.cardParts) && m.cardParts.length) frags = m.cardParts;
else if (typeof msgLiveText === 'function' ? msgLiveText(m) : m.text) frags = [msgLiveText(m)];
else continue;
for (const f of frags) {
const k = String(f).trim();
if (k) freq[k] = (freq[k] || 0) + 1;
}
}
const rows = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 50);
if (!rows.length) { el.innerHTML = `<div class="stats-empty">「${who}」还没有字卡记录</div>`; return; }
const kinds = Object.keys(freq).length;
_statsRankFill(el, rows, lib, kinds > rows.length ? `<div class="stats-empty">仅显示前 ${rows.length} 张，共 ${kinds} 种</div>` : '');
}
function _tsOf(dateStr, timeStr) {
const t = new Date(`${dateStr || ''} ${timeStr || ''}`).getTime();
return isFinite(t) ? t : 0;
}
function _statsTimelineHTML(tsList) {
const items = [];
const push = (ts, label, detail) => { if (ts) items.push({ ts, label, detail: detail || '' }); };
let firstMsg = 0, totalMsgs = 0;
for (const cid of Object.keys(data.chats || {})) {
const ms = (data.chats[cid] && Array.isArray(data.chats[cid].msgs)) ? data.chats[cid].msgs : [];
totalMsgs += ms.length;
}
(tsList || []).forEach(t => { if (t && (!firstMsg || t < firstMsg)) firstMsg = t; });
if (firstMsg) {
const d = new Date(firstMsg);
push(firstMsg, '第一次对话', `${d.getFullYear()} 年 ${d.getMonth() + 1} 月的一切从这里开始`);
}
let firstCall = null;
for (const c of (data.calls || [])) { const t = _tsOf(c.date, c.time || '00:00:00'); if (t && (!firstCall || t < firstCall.ts)) firstCall = { ts: t, c }; }
if (firstCall) push(firstCall.ts, '第一次通话', (firstCall.c.duration || '00:00') + ' · ' + (firstCall.c.date || ''));
let firstRecv = null, firstSent = null;
for (const m of (data.receivedLetters || [])) {
const t = _tsOf(m.postmark, m.time || '12:00:00');
if (t && (!firstRecv || t < firstRecv.ts)) firstRecv = { ts: t, m };
}
for (const m of (data.sentLetters || [])) {
const t = _tsOf(m.postmark, m.time || '12:00:00');
if (t && (!firstSent || t < firstSent.ts)) firstSent = { ts: t, m };
}
if (firstRecv) push(firstRecv.ts, '收到第一封来信', (firstRecv.m.text || '').slice(0, 24) + '…');
if (firstSent) push(firstSent.ts, '寄出第一封信', (firstSent.m.text || '').slice(0, 24) + '…');
let firstFav = null, firstTaFav = null;
try {
for (const b of collectBooks()) {
for (const f of collectBookAt(b.key)) {
if (!f || !f.ts) continue;
if ((f.by || 'me') === 'ta') { if (!firstTaFav || f.ts < firstTaFav.ts) firstTaFav = f; }
if (!firstFav || f.ts < firstFav.ts) firstFav = f;
}
}
} catch (e) {}
if (firstFav) { const d = new Date(firstFav.ts); push(firstFav.ts, '第一次收藏', `「${(firstFav.text || '').slice(0, 18)}」`); }
if (firstTaFav) { const d = new Date(firstTaFav.ts); push(firstTaFav.ts, partnerName() + ' 第一次收藏你的话', `「${(firstTaFav.text || '').slice(0, 18)}」`); }
let firstNear = null, firstDream = null;
for (const cid of Object.keys((data.cjian || {}).by || {})) {
for (const e of ((data.cjian.by[cid] || {}).hist || [])) {
if (e.k === 'n' && (!firstNear || e.ts < firstNear.ts)) firstNear = e;
if (e.k === 'd' && (!firstDream || e.ts < firstDream.ts)) firstDream = e;
}
}
if (firstNear) push(firstNear.ts, '第一次「好像有什么靠近了」', '');
if (firstDream) push(firstDream.ts, '第一个梦', `「${(firstDream.t || '').slice(0, 18)}」`);
const MSG_MILE = [100, 500, 1000, 2000, 5000];
const reached = MSG_MILE.filter(n => totalMsgs >= n);
for (const a of (data.anniversaries || [])) {
if (!a || !a.date) continue;
let t, detail = a.date;
if (a.yearly) {
const p = a.date.split('-');
const now = new Date();
t = new Date(now.getFullYear(), +p[0] - 1, +p[1]).getTime();
detail = '每年 ' + (+p[0]) + '.' + (+p[1]);
} else {
t = new Date(a.date + 'T00:00:00').getTime();
}
if (t) push(t, '纪念日 · ' + (a.name || '那一天'), detail);
}
items.sort((a, b) => a.ts - b.ts);
const fmt = ts => { const d = new Date(ts); return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`; };
const days = firstMsg ? Math.floor((Date.now() - firstMsg) / 86400000) + 1 : 0;
let html = _statsTrendHTML(tsList || []) + `<div class="tl-head">相伴第 <b>${days}</b> 天 · 说过 <b>${totalMsgs}</b> 句${reached.length ? ' · 已跨过 ' + reached.join('/') + ' 句' : ''}</div>`;
if (!items.length) return html + '<div class="tl-empty">时间线会随着你们的记录慢慢长出来</div>';
html += '<div class="stats-tl">' + items.map(it => `<div class="tl-item"><span class="tl-dot"></span><div class="tl-main"><div class="tl-date">${fmt(it.ts)}</div><div class="tl-label">${it.label}</div>${it.detail ? `<div class="tl-detail">${escapeHTML(it.detail)}</div>` : ''}</div></div>`).join('') + '</div>';
return html;
}
var lsScope = 'all';
var LS_TABS = [
{ k: 'overview', name: '概览' },
{ k: 'cards', name: '字卡' },
{ k: 'months', name: '按月' },
{ k: 'hours', name: '时段' },
{ k: 'types', name: '类型' },
];
var LS_TAB_KEY = 'ordinal-letterstats-tab';
var lsTab = 'overview';
var _lsTabLoaded = false;
function _lsTabLoad() {
if (_lsTabLoaded) return;
_lsTabLoaded = true;
let v = null;
try { v = localStorage.getItem(LS_TAB_KEY); } catch (e) { }
lsTab = LS_TABS.some(x => x.k === v) ? v : 'overview';
}
function _lsTabSet(k) {
if (!LS_TABS.some(x => x.k === k) || k === lsTab) return;
lsTab = k;
try { localStorage.setItem(LS_TAB_KEY, k); } catch (e) { }
}
function _lsRows() {
const out = [];
(data.sentLetters || []).forEach(m => { if (m) out.push({ m, sent: true, cid: m.cid || mainChatId() }); });
(data.receivedLetters || []).forEach(m => { if (m) out.push({ m, sent: false, cid: m.cid || mainChatId() }); });
return lsScope === 'all' ? out : out.filter(r => r.cid === lsScope);
}
function _lsTs(m) {
const p = _mbParsePostmark(m && m.postmark);
if (!p) return 0;
const t = /(\d{1,2}):(\d{2})/.exec((m && m.time) || '');
return new Date(p.y, p.m - 1, p.d, t ? +t[1] : 0, t ? +t[2] : 0).getTime() || 0;
}
function _lsCards(rows) {
const freq = {}, catCnt = {}, libTag = {};
const cache = {};
let hits = 0, miss = 0, taLetters = 0, perN = 0, perSum = 0, perMax = 0;
rows.filter(r => !r.sent).forEach(r => {
const segs = cardSegs(r.m.text || '');
if (!segs.length) return;
taLetters++;
const key = lsScope === 'all' ? '' : r.cid;
if (!cache[key]) cache[key] = cardLibIndex(key || undefined);
const lib = cache[key];
let n = 0;
segs.forEach(s => {
const cat = lib[s];
if (cat === undefined) { miss++; return; }
if (libTag[s] === undefined) libTag[s] = cat;
freq[s] = (freq[s] || 0) + 1;
catCnt[cat] = (catCnt[cat] || 0) + 1;
hits++; n++;
});
perN++; perSum += n; if (n > perMax) perMax = n;
});
return { freq, catCnt, libTag, hits, miss, taLetters, kinds: Object.keys(freq).length, perN, perSum, perMax };
}
function _lsBarRow(label, n, max, total) {
const w = n ? Math.round(n / Math.max(1, max) * 100) : 0;
const pct = total ? Math.round(n / total * 100) : 0;
return `<div class="stats-bar-row"><span class="stats-bar-label">${escapeHTML(label)}</span><div class="stats-bar-track"><i style="width:${w}%"></i></div><b>${n}<em>${pct}%</em></b></div>`;
}
function renderLetterStats() {
const el = $('#lsOutput'); if (!el) return;
const rows = _lsRows();
const sent = rows.filter(r => r.sent), recv = rows.filter(r => !r.sent);
const card = _lsCards(rows);
const wordsOf = list => list.reduce((s, r) => s + String(r.m.text || '').length, 0);
const sentWords = wordsOf(sent), recvWords = wordsOf(recv);
const perAvg = card.perN ? (Math.round(card.perSum / card.perN * 10) / 10) : 0;
const days = new Set(), hourCnt = new Array(24).fill(0), tsList = [];
let first = 0, last = 0;
rows.forEach(r => {
const ts = _lsTs(r.m);
if (ts) {
days.add(new Date(ts).toLocaleDateString('zh-CN'));
tsList.push(ts);
if (!first || ts < first) first = ts;
if (ts > last) last = ts;
const hm = /(\d{1,2}):(\d{2})/.exec(r.m.time || '');
if (hm) { const h = +hm[1]; if (h >= 0 && h <= 23) hourCnt[h]++; }
}
});
const fmt = ts => { if (!ts) return '—'; const d = new Date(ts); return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate(); };
const dayCnt = [];
for (let i = 6; i >= 0; i--) {
const d = new Date(); d.setDate(d.getDate() - i);
const key = d.toLocaleDateString('zh-CN');
let n = 0; rows.forEach(r => { const ts = _lsTs(r.m); if (ts && new Date(ts).toLocaleDateString('zh-CN') === key) n++; });
dayCnt.push({ label: (d.getMonth() + 1) + '/' + d.getDate(), n });
}
const hourMax = Math.max(...hourCnt);
const peakHour = hourCnt.findIndex(v => hourMax > 0 && v === hourMax);
const hourBars = _statsBarsHTML(hourCnt, {
labels: ['0', '6', '12', '18', '24'],
tip: (v, i) => i + ':00 共 ' + v + ' 封',
peak: '最热闹的是 ' + peakHour + ' 点 · 写了 ' + hourCnt[peakHour] + ' 封'
});
const weekMax = Math.max(...dayCnt.map(x => x.n));
const peakDay = dayCnt.find(x => weekMax > 0 && x.n === weekMax);
const weekBars = _statsBarsHTML(dayCnt.map(x => x.n), {
sm: true,
labels: dayCnt.map(x => x.label),
tip: (v, i) => dayCnt[i].label + ' 写了 ' + v + ' 封',
peak: '这七天里 ' + (peakDay ? peakDay.label : '') + ' 写得最多 · ' + (peakDay ? peakDay.n : 0) + ' 封'
});
const mo = _statsMonthCells(tsList);
const moLabelsAll = mo.cells.map(c => _statsMonthLabel(c, mo.cur));
const moLabels = moLabelsAll.length > 8
? [moLabelsAll[0], moLabelsAll[Math.floor((moLabelsAll.length - 1) / 2)], moLabelsAll[moLabelsAll.length - 1]]
: moLabelsAll;
const moMax = Math.max(0, ...mo.cells.map(c => c.n));
const moPeak = mo.cells.find(c => moMax > 0 && c.n === moMax);
const monthBars = tsList.length
? _statsBarsHTML(mo.cells.map(c => c.n), {
sm: true,
labels: moLabels,
tip: (v, i) => _statsMonthLabel(mo.cells[i], mo.cur) + ' 写了 ' + v + ' 封',
peak: '写得最多的是 ' + (moPeak ? _statsMonthLabel(moPeak, mo.cur) : '') + ' · ' + (moPeak ? moPeak.n : 0) + ' 封'
+ (mo.cut ? '（更早的 ' + mo.cut + ' 个月没有显示在这里）' : '')
})
: `<p class="stats-note">${rows.length ? '这些信的邮戳拆不出年月日（旧档那种只写「9/28」的），按月这一节量不出来。' : '还没有信，按月这一节没有东西可画。'}</p>`;
const kindCnt = {
'TA 主动写的': recv.filter(r => (r.m.kind || 'proactive') !== 'reply').length,
'TA 回你的': recv.filter(r => r.m.kind === 'reply').length,
'你寄出的': sent.length,
'夹了图的': rows.filter(r => !!r.m.img).length
};
const kindMax = Math.max(1, ...Object.values(kindCnt));
const kindBars = Object.keys(kindCnt).map(k => _lsBarRow(k, kindCnt[k], kindMax, sent.length + recv.length)).join('');
const catKeys = Object.keys(card.catCnt).sort((a, b) => card.catCnt[b] - card.catCnt[a]);
const catMax = Math.max(1, ...catKeys.map(k => card.catCnt[k]));
const catBars = catKeys.length
? catKeys.map(k => _lsBarRow(k, card.catCnt[k], catMax, card.hits)).join('')
: '<div class="stats-empty">TA 的信里还没比到库里的字卡</div>';
const rankRows = Object.entries(card.freq).sort((a, b) => b[1] - a[1]).slice(0, 50);
_lsTabLoad();
const panels = {
overview: `<div class="stats-sec">
      <div class="stats-lines">
        <div><span>TA 的信共</span><b>${_statsNum(recvWords)} 字</b></div>
        <div><span>你写的信共</span><b>${_statsNum(sentWords)} 字</b></div>
        <div><span>写信天数</span><b>${days.size} 天</b></div>
        <div><span>最早一封</span><b>${fmt(first)}</b></div>
        <div><span>最近一封</span><b>${fmt(last)}</b></div>
      </div>
    </div>`,
cards: `<div class="stats-sec">
      <div class="stats-hour-label">用了多少张卡</div>
      <div class="stats-lines">
        <div><span>用掉字卡</span><b>${_statsNum(card.hits)} 张</b></div>
        <div><span>TA 一封平均几张</span><b>${perAvg} 张</b></div>
        <div><span>一封最多几张</span><b>${card.perMax} 张</b></div>
        <div><span>出现过的卡</span><b>${card.kinds} 种 · ${catKeys.length} 类</b></div>
      </div>
      <div class="stats-hour-label">哪几句被抽到最多</div>
      <div id="lsRank"></div>
      <p class="stats-note">「用掉字卡」是把 TA 信里的句子和你现在的字卡库比对出来的，另有 ${card.miss} 段没比对上——你删过或改过的句子、以及绑给别人的专属卡，都算在这一段里）。你寄出去的是你自己打的字，不算进抽卡这一格。</p>
    </div>`,
months: `<div class="stats-sec">${monthBars}</div>`,
hours: `<div class="stats-sec"><div class="stats-hour-label">一天里哪几个钟头写得最多</div>${hourBars}<div class="stats-hour-label">近 7 天每天封数</div>${weekBars}</div>`,
types: `<div class="stats-sec">
      <div class="stats-hour-label">信是哪一类</div>
      <div class="stats-bars">${kindBars}</div>
      <div class="stats-hour-label">信里的卡是哪一类</div>
      <div class="stats-bars">${catBars}</div>
      <p class="stats-note">「夹了图」是同一批信里的另一件事（一封主动信也可能夹着图），所以这一行的百分比不按封数归一。</p>
    </div>`,
};
el.innerHTML = `
    <div class="stats-scope" id="lsScope"></div>
    <div class="stats-grid">
      <div class="stats-tile"><b>${_statsNum(recv.length)}</b><span>收到的信</span></div>
      <div class="stats-tile"><b>${_statsNum(sent.length)}</b><span>寄出的信</span></div>
      <div class="stats-tile"><b>${_statsNum(sentWords + recvWords)}</b><span>总字数</span></div>
    </div>
    <div class="stats-tabs" id="lsTabs">${LS_TABS.map(t => `<button type="button" class="stats-tab${lsTab === t.k ? ' active' : ''}" data-ls-tab="${t.k}">${t.name}</button>`).join('')}</div>
    <div class="stats-panel" data-tab="${lsTab}">${panels[lsTab]}</div>
  `;
const tabsEl = $('#lsTabs');
if (tabsEl) tabsEl.onclick = e => {
const b = e.target.closest('.stats-tab'); if (!b) return;
_lsTabSet(b.dataset.lsTab);
renderLetterStats();
};
const scopeEl = el.querySelector('#lsScope');
if (scopeEl) {
const chips = [{ id: 'all', label: '全部' }].concat((data.contacts || []).map(c => ({ id: c.id, label: fixedNameOf(c) })));
scopeEl.innerHTML = chips.map(c => `<button type="button" class="scope-chip${lsScope === c.id ? ' on' : ''}" data-scope="${escapeHTML(c.id)}">${escapeHTML(c.label)}</button>`).join('');
scopeEl.onclick = e => {
const b = e.target.closest('.scope-chip'); if (!b) return;
lsScope = b.dataset.scope;
renderLetterStats();
};
}
const rankEl = $('#lsRank');
if (rankEl) {
if (!rankRows.length) {
rankEl.innerHTML = '<div class="stats-empty">TA 还没有写信，或信里的句子都没比到库里的卡</div>';
} else {
_statsRankFill(rankEl, rankRows, card.libTag,
card.kinds > rankRows.length ? `<div class="stats-empty">仅显示前 ${rankRows.length} 张，共 ${card.kinds} 种</div>` : '');
}
}
}
function _rhNum(v) { return Math.max(0, Math.min(100, Number(v) || 0)); }
function _rhPct(v) {
const n = Math.round(_rhNum(v) * 10) / 10;
return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)) + '%';
}
function _rhMul(v) { return String(Math.round((Number(v) || 1) * 100) / 100); }
function _rhFamOf(cid, key) {
const en = (data.cjian && data.cjian.by) ? data.cjian.by[cid] : null;
if (!en || !key) return '';
const k = (typeof _cjDoKeyOf === 'function') ? _cjDoKeyOf(en) : '';
const d = (k && typeof CJ_DO !== 'undefined') ? CJ_DO[k] : null;
return (d && !d.flat && d.label) ? d.label : '';
}
function _rhNameOf(cid, c) {
if (c && c.kind === 'group') return c.name || '这个群';
try { if (typeof chatPartnerNameOf === 'function') return chatPartnerNameOf(cid) || (c && c.name) || 'TA'; } catch (e) {}
return (c && c.name) || 'TA';
}
function _rhLiveData() {
const cid = data.activeChat;
if (!cid) return null;
const c = (data.contacts || []).find(x => x && x.id === cid) || null;
const isGroup = !!(c && c.kind === 'group');
const bh = (cid === data.activeChat)
? (data.behavior || (data.chatSettings && data.chatSettings[cid]) || defaults.behavior || {})
: ((data.chatSettings && data.chatSettings[cid]) || defaults.behavior || {});
const D = (typeof defaults !== 'undefined' && defaults.behavior) ? defaults.behavior : {};
const baseRn = _rhNum(bh.rnProb != null ? bh.rnProb : D.rnProb);
const baseStray = _rhNum(bh.strayProb != null ? bh.strayProb : D.strayProb);
const rnOn = bh.rnOn !== false;
const strayOn = bh.strayOn !== false;
const byState = bh.rnByState !== false;
const mul = (byState && typeof cjActivityNrMul === 'function') ? cjActivityNrMul(cid, bh) : 1;
const effRn = _rhNum(baseRn * mul);
const actKey = (typeof _cjActOf === 'function') ? _cjActOf(cid) : '';
const actLabel = (actKey && typeof CJ_ACTIVITY !== 'undefined' && CJ_ACTIVITY[actKey]) ? CJ_ACTIVITY[actKey].label : '';
const pStray = strayOn ? baseStray / 100 : 0;
const pRn = rnOn ? effRn / 100 : 0;
const total = (1 - (1 - pStray) * (1 - pRn)) * 100;
return { cid, c, isGroup, baseRn, baseStray, rnOn, strayOn, byState, mul, effRn, actKey, actLabel, fam: _rhFamOf(cid, actKey), total };
}
function _rhFamTableHTML(base0) {
if (typeof CJ_DO === 'undefined' || typeof CJ_ACTIVITY === 'undefined') return '';
const base = _rhNum(base0) || 20;
const head = `<div class="rh-tr rh-th" role="row"><span>TA 在做什么</span><span>族倍率</span><span>你填 ${base} 时</span></div>`;
let out = '';
Object.keys(CJ_ACTIVITY).forEach(act => {
const fams = Object.keys(CJ_DO).filter(k => (CJ_DO[k].a || []).indexOf(act) >= 0);
if (!fams.length) return;
const b = (typeof CJ_ACTIVITY_NR !== 'undefined' && CJ_ACTIVITY_NR[act] > 0) ? CJ_ACTIVITY_NR[act] : 1;
const flat = fams.length === 1 && CJ_DO[fams[0]].flat;
const ps = fams.map(k => base * b * (Number(CJ_DO[k].nr) || 1));
const lo = _rhPct(Math.min.apply(null, ps)), hi = _rhPct(Math.max.apply(null, ps));
out += `<div class="rh-tr rh-grp" role="row"><span>${escapeHTML(CJ_ACTIVITY[act].label)} · ×${_rhMul(b)}</span><span>${flat ? '不分族' : fams.length + ' 族'}</span><span>${lo === hi ? lo : lo + '–' + hi}</span></div>`;
if (flat) return;
fams.forEach((k, i) => {
const d = CJ_DO[k];
out += `<div class="rh-tr rh-sub" role="row"><span>${escapeHTML(d.label)}</span><span>×${_rhMul(d.nr)}</span><span>${_rhPct(ps[i])}</span><span class="rh-say">${escapeHTML(d.say || '')}</span></div>`;
});
});
return out ? head + out : '';
}
function renderReplyHelp() {
const box = document.getElementById('rhLive');
if (!box) return;
const famBox = document.getElementById('rhFamTable');
if (famBox) famBox.innerHTML = _rhFamTableHTML(20);
const d = _rhLiveData();
if (!d) { box.innerHTML = ''; box.hidden = true; return; }
box.hidden = false;
const who = escapeHTML(_rhNameOf(d.cid, d.c));
const swTxt = !d.rnOn && !d.strayOn ? '两枚都关着'
: !d.rnOn ? '「已读不回」关着'
: !d.strayOn ? '「话没挤过来」关着'
: '两枚都开着';
const go = '<button type="button" class="rh-go" data-rh-go>去「回复节奏」调整</button>';
if (d.isGroup) {
box.innerHTML = `
      <div class="rh-live-top"><span class="rh-live-kicker">此刻这一本 · 群聊</span><span class="rh-live-who">${who}</span></div>
      <p class="rh-live-main">群聊里「已读不回」按<b>每位成员各自</b>的档抽；「话没挤过来」这一枚在群聊里不抽。</p>
      <div class="rh-live-rows">
        <div class="rh-live-row"><span>本群底座（没单独设过的成员跟随这里）</span><b>${_rhPct(d.baseRn)}</b></div>
        <div class="rh-live-row"><span>「允许已读不回」</span><b>${d.rnOn ? '开' : '关'}</b></div>
        <div class="rh-live-row"><span>「按此刻在做什么浮动」</span><b>${d.byState ? '开 · 每位成员按各自状态' : '关'}</b></div>
      </div>
      <p class="rh-live-note">每位成员点进自己的单聊还能单独设；这一页显示的是本群这份底座。</p>
      ${go}`;
return;
}
let stateLine;
if (!d.byState) stateLine = '随状态浮动已关（×1）';
else if (!d.actKey) stateLine = '读不到 TA 此刻在做什么（×1）';
else stateLine = '此刻：' + d.actLabel + (d.fam ? ' · ' + d.fam : '') + '（×' + _rhMul(d.mul) + '）';
const main = (d.rnOn || d.strayOn)
? `按现在的设置，这一轮大约 <b>${_rhPct(d.total)}</b> 不会给你正文。`
: '两枚都关着：每一轮都会给你正文。';
box.innerHTML = `
    <div class="rh-live-top"><span class="rh-live-kicker">此刻这一本</span><span class="rh-live-who">${who}</span></div>
    <p class="rh-live-main">${main}</p>
    <div class="rh-live-rows">
      <div class="rh-live-row"><span>话没挤过来</span><b>${_rhPct(d.baseStray)}${d.strayOn ? '' : '（已关）'}</b></div>
      <div class="rh-live-row"><span>已读不回</span><b>${_rhPct(d.baseRn)} × ${_rhMul(d.mul)} = ${_rhPct(d.effRn)}${d.rnOn ? '' : '（已关）'}</b></div>
      <div class="rh-live-row"><span>TA 此刻</span><b>${escapeHTML(stateLine)}</b></div>
      <div class="rh-live-row"><span>两枚开关</span><b>${swTxt}</b></div>
    </div>
    <p class="rh-live-note">这个数只代表此刻；TA 的状态每 8–25 分钟变一次，换一程就重新算。连发很多条不会把上面的数变小，原因见下面「为什么连发十几条」。</p>
    ${go}`;
}
function _replyHelpGoMate() {
if (typeof showView === 'function') showView('mate');
const openSpeed = () => {
const card = document.querySelector('#mateView .setting-card[data-fold="speed"]');
if (!card) return false;
if (card.classList.contains('open')) return true;
card.classList.add('open');
try { card.scrollIntoView({ block: 'start' }); } catch (e) {}
return true;
};
setTimeout(openSpeed, 120);
setTimeout(() => {
const card = document.querySelector('#mateView .setting-card[data-fold="speed"]');
if (card && !card.classList.contains('open')) openSpeed();
}, 420);
}
(function () {
const v = document.getElementById('replyHelpView');
if (!v) return;
v.addEventListener('click', e => {
if (!e.target.closest('[data-rh-go]')) return;
_replyHelpGoMate();
});
})();
var _diagRenderLock = false;
function renderDiag() {
if (_diagRenderLock) return;
_diagRenderLock = true;
requestAnimationFrame(() => { _diagRenderLock = false; });
const out = $('#diagOutput');
if (out) out.textContent = getDiagnosticInfo();
}
function startFPSMeasure() {
if (window._diagFPSMeasuring) return;
window._diagFPSMeasuring = true;
let frames = 0;
const start = performance.now();
(function tick() {
frames++;
if (performance.now() - start < 1000) requestAnimationFrame(tick);
else {
window._diagFPS = frames;
window._diagFPSMeasuring = false;
renderDiag();
}
})();
}
function iosFitInp() {
const d = document, de = d.documentElement, b = d.body;
const vv = window.visualViewport, fit = window.__iosFit || null;
const innerH = window.innerHeight, innerW = window.innerWidth;
const wide = [];
try {
const all = b.querySelectorAll('main,section,div,input,textarea,button,img,table,pre,svg');
for (let i = 0; i < all.length && i < 3000; i++) {
const el = all[i];
const r = el.getBoundingClientRect();
if (r.width > 0 && r.right > innerW + 1) {
wide.push((el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '') + ' 超宽' + Math.round(r.right - innerW) + 'px'));
if (wide.length >= 3) break;
}
}
} catch (e) {}
const small = [];
try {
const eds = b.querySelectorAll('input,textarea');
for (let i = 0; i < eds.length && i < 200; i++) {
const el = eds[i], t = (el.getAttribute('type') || '').toLowerCase();
if (['checkbox', 'radio', 'range', 'file', 'color', 'button', 'submit', 'reset', 'hidden', 'image'].indexOf(t) >= 0) continue;
const r = el.getBoundingClientRect();
if (r.width < 2 || r.height < 2) continue;
const fs = parseFloat(getComputedStyle(el).fontSize) || 0;
if (fs > 0 && fs < 16) small.push(((el.id ? '#' + el.id : el.className ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase())) + '=' + fs + 'px');
}
} catch (e) {}
const shell = d.querySelector('.app-shell'), sr = shell ? shell.getBoundingClientRect() : null;
let shellHidden = false;
try { shellHidden = !!shell && getComputedStyle(shell).display === 'none'; } catch (e) {}
let cvLeft = 0;
try {
d.querySelectorAll('.view').forEach(v => {
try { if (getComputedStyle(v).contentVisibility === 'auto') cvLeft++; } catch (e) {}
});
} catch (e) {}
return {
uaIOS: /iPhone|iPad|iPod/.test(String(navigator.userAgent || '')),
pin: de.classList.contains('ios-pin'), forced: !!(fit && fit.forced),
edge: window.__kbEdge || null,
edgeSaved: (() => { try { return JSON.parse(localStorage.getItem('ordinal-kb-edge') || 'null'); } catch (e) { return null; } })(),
fsPage: (() => { try { return !!(document.fullscreenElement || document.webkitFullscreenElement); } catch (e) { return false; } })(),
offValve: /[?&]iosfit=off\b/.test(String(location.search || '')),
kbFixOff: b.dataset.kbFix === 'off',
fit: fit, kb: !!(fit && fit.kb),
scale: vv ? (vv.scale || 1) : 1, vvH: vv ? Math.round(vv.height) : 0,
dy: vv ? Math.round(vv.offsetTop || 0) : 0,
innerH: innerH, innerW: innerW,
docOverY: de.scrollHeight - de.clientHeight, docOverX: de.scrollWidth - de.clientWidth,
shellBottom: sr ? Math.round(sr.bottom) : 0, shellH: sr ? Math.round(sr.height) : 0, shellHidden: shellHidden,
wide: wide, small: small, cvLeft: cvLeft,
last: fit ? fit.last : null, log: fit ? (fit.log || []) : []
};
}
function iosFitJudge(inp) {
const F = [];
const add = (ok, name, detail) => F.push({ ok: !!ok, name: name, detail: detail || '' });
if (!inp.uaIOS) add(true, 'iOS 硬化闸门', '非 iOS，本段判据只作参考');
else add(inp.pin, 'iOS 硬化闸门', inp.pin
? '在位' + (inp.forced ? '（?iosfit=force 试跑）' : '') + '：钉文档∶16px 地板∶.view 退出跳过渲染' + (inp.kbFixOff ? '；但 body[data-kbFix=off] 开着（#361 那把人工退路＝不压壳也不捞框）' : '')
: '未挂载——' + (inp.offValve ? '地址栏带了 iosfit=off' : '地址栏并没有带 iosfit=off＝闸门件没跑起来，多半是缓存里那份旧产物（先看开屏公告那一行版号）') + '，下面那些 ✗ 都是「本来就没开」不是「开了坏」');
const over = Math.max(inp.docOverY, inp.docOverX);
add(over <= 2, '整页可拖余量', over <= 2 ? '文档＝布局口（纵向 ' + inp.docOverY + 'px∶横向 ' + inp.docOverX + 'px）'
: '纵向 +' + inp.docOverY + 'px∶横向 +' + inp.docOverX + 'px → 整页可被拖着滚出可视区' + (inp.wide.length ? '；横向越界元素：' + inp.wide.join(' · ') : ''));
const scaled = Math.abs(inp.scale - 1) > 0.01;
add(!scaled, '页面缩放 scale', !scaled ? '1.00（无自动放大∶无双指缩放）'
: inp.scale.toFixed(2) + ' → ' + (inp.scale > 1 ? '页面被放大（iOS 对 <16px 输入框聚焦的强制放大／用户双指），_vvApply 按 #435 那把闸不补偿' : '页面被缩小（典型成因＝内容横向溢出，iOS 缩到能装下）'));
add(!inp.small.length, '输入框 16px 地板', inp.small.length ? inp.small.length + ' 枚可见可编辑控件字号 <16px（iOS 聚焦即整页放大）：' + inp.small.slice(0, 3).join(' · ') : '无一枚 <16px');
add(true, '键盘在场', inp.kb ? ('开着：可视带 ' + inp.vvH + 'px（布局口 ' + inp.innerH + 'px，差 ' + (inp.innerH - inp.vvH) + 'px）∶视觉口平移 ' + inp.dy + 'px') : '收起（可视带＝布局口 ' + inp.innerH + 'px）');
if (inp.kb) {
const gap = Math.abs(inp.shellBottom - (inp.dy + inp.vvH));
add(gap <= 24, '壳与可视带贴合', gap <= 24 ? '壳底边＝带底边（差 ' + gap + 'px）' : '差 ' + gap + 'px → 壳没跟着可视带走（补偿未生效或被摘）');
} else add(true, '壳与可视带贴合', '键盘收起，不判');
const L = inp.last;
if (!L) add(true, '焦点框可视带', '未采到（本机这一轮没聚焦过可编辑控件，或聊天输入栏那一面归 _vvApply 压壳管）');
else if (L.inside) add(true, '焦点框可视带', (L.id ? '#' + L.id : L.cls || '框') + ' 在带内' + (L.moved ? '（捞过 ' + L.moved + 'px）' : '（无需捞）'));
else if (L.noScroller) add(true, '焦点框可视带', (L.id ? '#' + L.id : L.cls || '框') + ' 不在滚动容器里→位置交给压壳那一段（壳底边看 ⑥ 那行）');
else add(false, '焦点框可视带', (L.id ? '#' + L.id : L.cls || '框') + ' 被挤出带外 ' + L.out + 'px（带 ' + L.band + '∶框 ' + L.box + '∶scale ' + L.scale + '）');
if (!inp.kb) {
if (inp.shellHidden || !inp.shellH) add(true, 'dvh 与布局口', '壳还没上屏（0 高' + (inp.shellHidden ? '·display:none' : '') + '：开屏公告那一帧，或初始化没跑起来）→ 不判；在桌面上点「刷新」重算这一屏');
else {
const d2 = Math.abs(inp.shellH - inp.innerH);
add(d2 <= 4, 'dvh 与布局口', d2 <= 4 ? '同数（' + inp.shellH + 'px）' : '差 ' + d2 + 'px → 壳高与可视区不等（地址栏收放中／残留），这一族正是抖的来源');
}
} else add(true, 'dvh 与布局口', '键盘开着，不判');
add(inp.cvLeft === 0 || !inp.pin, '.view 跳过渲染', inp.cvLeft === 0 ? '全部已退出（#004·#316 那一族在 iOS 上收干净）'
: inp.cvLeft + ' 面还挂着 auto（#359 那条几何契约靠 contain，不靠它）');
const edgeOpen = (() => {
const lg = (inp.log || []).slice().reverse().find(e => e.kb && e.gap != null);
if (lg) return lg;
const e = inp.edge;
return e && e.kb && e.gap != null ? e : null;
})();
const edgeSavedOpen = (() => {
const s = inp.edgeSaved && inp.edgeSaved.open;
return s && s.kb && s.gap != null ? s : null;
})();
const edgeUse = edgeOpen || edgeSavedOpen;
if (!edgeUse) add(true, '输入栏与可视带底', '本轮未采到（没弹过键盘＝无沿可记，这一行不是故障）');
else {
const g = Math.round(edgeUse.gap);
const buried = g < -2;
add(!buried && g <= 12, '输入栏与可视带底', (edgeOpen ? '' : '上一轮·') + (buried ? '底边越出可视带 ' + (-g) + 'px → 这一条栏被截在带子外面（先查「栏位位置」的输入栏杆）' : g <= 12 ? '差 ' + g + 'px（贴着可视带底）' : '差 ' + g + 'px → 输入栏与键盘之间那条带子') +
'；现场：底内距 ' + (edgeUse.pad != null ? edgeUse.pad : '未记') + '∶布局口 ' + (edgeUse.ih != null ? edgeUse.ih + 'px' : '未记') +
'∶视觉口 ' + (edgeUse.vvH != null ? edgeUse.vvH + 'px' : '未记') + '∶壳补偿 ' + (edgeUse.sh || '无') +
(edgeUse.tf && edgeUse.tf !== '0px' ? '∶输入栏被「栏位位置」挪过 ' + edgeUse.tf : ''));
}
return F;
}
function iosFitLines() {
let inp = null, F = [];
try { inp = iosFitInp(); F = iosFitJudge(inp); } catch (e) { return ['✗ 判定器出错：' + String((e && e.message) || e)]; }
const L = F.map(f => (f.ok ? '✓ ' : '✗ ') + f.name + (f.detail ? '：' + f.detail : ''));
const log = (inp && inp.log) || [];
L.push(log.length ? '键盘沿（最近 6 条）：' + log.slice(-6).map(e => new Date(e.t).toLocaleTimeString('zh-CN') + (e.kb ? ' 开→' + e.h + 'px' : ' 收') + (e.dy ? '∥平移' + e.dy : '')).join(' · ') : '键盘沿：本轮未采到（没弹过键盘＝无沿可记，这一行不是故障）');
const e = inp && inp.edge;
L.push(e ? ('键盘沿·输入栏到带底：' + (e.kb ? '键盘开着' : '键盘收起') + ' → ' + (e.gap != null ? e.gap + 'px' : '未记') +
'（底内距 ' + (e.pad != null ? e.pad : '未记') + '∶布局口 ' + (e.ih != null ? e.ih + 'px' : '未记') + '∶视觉口 ' + (e.vvH != null ? e.vvH + 'px' : '未记') +
'∶壳补偿 ' + (e.sh || '无') + (e.mode && e.mode !== 'auto' ? '∶排障开关 ?kb=' + e.mode : '') + '）' + (e.kb ? '' : '｜收起那一沿的读数＝正常底部内距，不判'))
: '键盘沿·输入栏到带底：本轮未采到（这一轮还没弹过键盘）');
return L;
}
function diagGuardLines() {
const out = ['--- 数据落盘状态（「丢记录」类反馈先看这几行）---'];
let g = null;
try { if (typeof dataGuardState === 'function') g = dataGuardState(); } catch (e) {}
if (!g) { out.push('落盘读数: 接不上主库那道闸（dataGuardState 不在）'); return out; }
out.push('主库读取: ' + (g.readFail ? ('这一趟没读到（' + g.readFail + '）·为防盖掉已有存档，这一趟不写主库') : '正常'));
out.push('主库写入: ' + (g.writeFail ? ('写不进去（' + g.writeFail + '）·这些改动只活在内存里，关掉页面就没了') : '正常'));
if (g.readDetail) out.push('读取错误原文: ' + g.readDetail);
if (g.writeDetail) out.push('写入错误原文: ' + g.writeDetail);
if (g.writeFail) {
const mb = (n) => (typeof _dbMB === 'function' && n ? _dbMB(n) : '');
out.push('写不进的原因: ' + (g.writeCause === 'big'
? ('整份太大（约 ' + mb(g.writeBytes) + '，剔掉图片语音后那一小份约 ' + mb(g.liteBytes) + ' 写得进去）→ 去 设置→数据→存储 压小图片')
: g.writeCause === 'space' ? '这台设备不给写（配额∶空间）→ 腾空间，并在同一页申请持久存储'
: '还没量出来（档本来就不大∶或剔掉图片语音也小不了多少）'));
if (g.writeDismissed) out.push('屏上那条: 已被「知道了」收起（只本趟∶重新起页照旧说·这一格读数不受影响）');
}
out.push('工作模式: ' + (g.lsMode ? '已降级：备用副本就是唯一那一份（主库用不了）' : '正常：数据住 IndexedDB'));
out.push('备用副本: ' + (typeof lsMirrorShapeText === 'function' ? lsMirrorShapeText() : '形状读不到'));
if (g.mirrorUntrusted) out.push('较新副本: 拒绝过一份——' + g.mirrorUntrusted);
return out;
}
function diagBlurLines() {
const out = ['--- 实时模糊（这一屏正在跑几层采样）---'];
const de = document.documentElement, b = document.body;
const gates = [];
if (de.classList.contains('ios-pin')) gates.push('iOS 常驻不糊');
if (de.classList.contains('mo-lite')) gates.push('弱机常驻不糊');
if (de.classList.contains('frost-lite')) gates.push('省电档（列表磨砂＝关）');
out.push('降级档: ' + (gates.length ? gates.join(' ∶ ') : '无（此刻全站都在真磨砂）'));
try {
const view = b.querySelector('.view.active') || b.querySelector('#' + (b.dataset.view || '') + 'View');
const fam = {};
let total = 0, scanned = 0;
const root = view || b;
const all = root.querySelectorAll('*');
for (let i = 0; i < all.length; i++) {
const el = all[i];
let cs;
try { cs = getComputedStyle(el); } catch (e) { continue; }
const bf = cs.backdropFilter || cs.webkitBackdropFilter || '';
if (!bf || bf === 'none') continue;
const r = el.getBoundingClientRect();
if (!(r.width > 0 && r.height > 0)) continue;
scanned++;
const key = (el.id ? '#' + el.id : (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase()));
const m = /blur\(([^)]+)\)/.exec(bf);
const rad = m ? m[1] : '?';
fam[key] = fam[key] || { n: 0, rad: rad };
fam[key].n++;
total++;
}
out.push('活动面: ' + (view ? (view.id || '（未命名）') : '（读不到，扫了整页）') + ' ∶ 在糊的元素 ' + total + ' 枚');
const keys = Object.keys(fam).sort((a, b2) => fam[b2].n - fam[a].n).slice(0, 10);
keys.forEach(k => out.push('  ' + k + ' ×' + fam[k].n + '  →  ' + fam[k].rad));
if (!total) out.push('  （此刻没有一层在采样：这一屏全是实底/半透不糊）');
} catch (e) { out.push('（模糊读数取不到：' + String((e && e.message) || e) + '）'); }
try {
const cs = getComputedStyle(b);
const _num = (v, unit) => { v = (v || '').trim(); if (!v) return '—'; return /[%a-z]/i.test(v) ? v : v + unit; };
out.push('开关: 卡片毛玻璃=' + (b.dataset.apFrost === 'on' ? '开' : '关')
+ ' ∶ 气泡磨砂=' + (b.dataset.apFrostBubble === 'on' ? '开' : '关')
+ ' ∶ 桌面壁纸=' + (b.dataset.apDesk === 'on' ? '开' : '关'));
out.push('旋钮: 磨砂强度 ' + _num(cs.getPropertyValue('--frost-blur'), 'px')
+ ' ∶ 磨砂浓度 ' + _num(cs.getPropertyValue('--frost-alpha'), '%')
+ ' ∶ 卡片浓度 ' + _num(cs.getPropertyValue('--frost-fill'), '%')
+ ' ∶ 壁纸磨砂 ' + _num(cs.getPropertyValue('--desk-ui-blur'), 'px'));
} catch (e) {}
out.push('· 读法：层数越多＝每帧要重采样越多（十几层往上，安卓上滚动就会掉帧发热）；');
out.push('  想减它：设置 → 外观 →「卡片通透」→「列表磨砂」拨到「关」＝逐条重复面一律不采样。');
return out;
}
function getDiagnosticInfo() {
const d = data || {};
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
let gpuInfo = '未知';
if (gl) {
const ext = gl.getExtension('WEBGL_debug_renderer_info');
if (ext) {
gpuInfo = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '未知';
} else {
gpuInfo = gl.getParameter(gl.RENDERER) || '未知';
}
}
const ua = navigator.userAgent;
const platform = navigator.platform || '未知';
const language = navigator.language || navigator.userLanguage || '未知';
const languages = (navigator.languages || [language]).join(', ');
const uaParsed = (() => {
const r = { device: '未知', os: '未知', browser: '未知', version: '', webview: false };
if (/iPhone|iPad|iPod/.test(ua)) {
r.os = 'iOS ' + (ua.match(/OS (\d+[_\.]\d+(?:[_\.]\d+)?)/)?.[1]?.replace(/_/g, '.') || '');
r.device = /iPad/.test(ua) ? 'iPad' : /iPod/.test(ua) ? 'iPod' : 'iPhone';
} else if (/Android/.test(ua)) {
r.os = 'Android ' + (ua.match(/Android (\d+(?:\.\d+)?)/)?.[1] || '');
r.device = (ua.match(/;\s*([^;)]+?)\s*Build\//)?.[1] || 'Android设备').trim();
} else if (/Windows NT/.test(ua)) {
const v = ua.match(/Windows NT (\d+\.\d+)/)?.[1];
r.os = 'Windows ' + (v === '10.0' ? '10/11' : v || '');
} else if (/Mac OS X/.test(ua)) {
r.os = 'macOS ' + (ua.match(/Mac OS X (\d+_\d+(?:_\d+)?)/)?.[1]?.replace(/_/g, '.') || '');
} else if (/Linux/.test(ua)) {
r.os = 'Linux';
}
if (/CriOS\/(\d+)/.test(ua)) { r.browser = 'Chrome iOS'; r.version = ua.match(/CriOS\/(\d+(?:\.\d+)?)/)?.[1] || ''; }
else if (/FxiOS\/(\d+)/.test(ua)) { r.browser = 'Firefox iOS'; r.version = ua.match(/FxiOS\/(\d+(?:\.\d+)?)/)?.[1] || ''; }
else if (/EdgiOS\/(\d+)/.test(ua)) { r.browser = 'Edge iOS'; r.version = ua.match(/EdgiOS\/(\d+(?:\.\d+)?)/)?.[1] || ''; }
else if (/Edg\/(\d+)/.test(ua)) { r.browser = 'Edge'; r.version = ua.match(/Edg\/(\d+(?:\.\d+)?)/)?.[1] || ''; }
else if (/Firefox\/(\d+)/.test(ua)) { r.browser = 'Firefox'; r.version = ua.match(/Firefox\/(\d+(?:\.\d+)?)/)?.[1] || ''; }
else if (/Chrome\/(\d+)/.test(ua)) { r.browser = 'Chrome'; r.version = ua.match(/Chrome\/(\d+(?:\.\d+)?)/)?.[1] || ''; }
else if (/Safari\/(\d+)/.test(ua)) { r.browser = 'Safari'; r.version = ua.match(/Version\/(\d+(?:\.\d+)?)/)?.[1] || ua.match(/Safari\/(\d+)/)?.[1] || ''; }
r.webview = /; wv\)/.test(ua) || /WebView/.test(ua) || (r.browser === 'Chrome' && !/Safari\//.test(ua));
return r;
})();
const uaData = navigator.userAgentData;
const uaDataStr = uaData ? `${uaData.platform || '?'} / ${(uaData.brands || []).map(b => `${b.brand}=${b.version}`).join(', ')}` : '不支持';
const orientation = screen.orientation ? screen.orientation.type : '未知';
const angle = screen.orientation ? (screen.orientation.angle || '?') : '?';
const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? '深色' : '浅色';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '启用' : '未启用';
const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches ? '启用' : '未启用';
const pointerMQ = window.matchMedia('(pointer: coarse)').matches ? 'coarse(触摸)'
: window.matchMedia('(pointer: fine)').matches ? 'fine(精确)' : 'none';
const hoverMQ = window.matchMedia('(hover: none)').matches ? 'none(无悬停)'
: window.matchMedia('(hover: hover)').matches ? 'hover(可悬停)' : '未知';
const forcedColors = window.matchMedia('(forced-colors: active)').matches ? '启用' : '未启用';
const invertedColors = window.matchMedia('(inverted-colors: inverted)').matches ? '反色' : '正常';
const cssTests = {
'container-queries': CSS.supports('container-type: inline-size'),
':has()': CSS.supports('selector(:has(*))'),
'aspect-ratio': CSS.supports('aspect-ratio: 1'),
'grid': CSS.supports('display: grid'),
'flexbox': CSS.supports('display: flex'),
'css-grid': CSS.supports('display: grid'),
'subgrid': CSS.supports('grid-template-rows: subgrid'),
'calc()': CSS.supports('width: calc(1px + 1px)'),
'var()': CSS.supports('color: var(--x)'),
'overscroll-behavior': CSS.supports('overscroll-behavior: contain'),
'scroll-behavior:smooth': CSS.supports('scroll-behavior: smooth'),
'touch-action:manipulation': CSS.supports('touch-action: manipulation'),
'-webkit-fill-available': CSS.supports('width: -webkit-fill-available'),
'dvh/svh/lvh': CSS.supports('height: 100dvh') && CSS.supports('height: 100svh') && CSS.supports('height: 100lvh'),
};
const webkitTests = (() => {
const el = document.createElement('div');
el.style.cssText = 'position:fixed;top:0;left:0;visibility:hidden;';
document.body.appendChild(el);
const r = {};
el.style.webkitOverflowScrolling = 'touch';
r['-webkit-overflow-scrolling:touch'] = el.style.webkitOverflowScrolling === 'touch' ? '支持' : '不支持';
el.style.webkitTapHighlightColor = 'transparent';
r['-webkit-tap-highlight-color'] = el.style.webkitTapHighlightColor === 'transparent' ? '支持' : '不支持';
el.style.webkitTextSizeAdjust = '100%';
r['-webkit-text-size-adjust'] = el.style.webkitTextSizeAdjust === '100%' ? '支持' : '不支持';
document.body.removeChild(el);
return r;
})();
const isInFrame = window !== window.top;
const isInIframe = !!window.frameElement;
const isPWA = !!window.matchMedia('(display-mode: standalone)').matches;
const isFullscreen = !!window.matchMedia('(display-mode: fullscreen)').matches;
const isMinimalUI = !!window.matchMedia('(display-mode: minimal-ui)').matches;
const referrer = document.referrer || '(直接访问)';
const currentUrl = location.href;
const iosStandalone = navigator.standalone === true ? '是(主屏)' : '否';
const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.content || '未设置';
const hardwareConcurrency = navigator.hardwareConcurrency || '未知';
const touchPoints = navigator.maxTouchPoints;
const errorList = diagReadErrs().slice(-5);
const errorCount = diagReadErrs().length;
const scrollX = window.pageXOffset || 0;
const scrollY = window.pageYOffset || 0;
const docHeight = document.documentElement.scrollHeight;
const docClientHeight = document.documentElement.clientHeight;
const totalElements = document.querySelectorAll('*').length;
const imgCount = document.querySelectorAll('img').length;
const inputCount = document.querySelectorAll('input, textarea, select').length;
let zoomLevel = '未知';
try {
const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
const sw = screen.width;
if (vw > 0 && sw > 0) {
zoomLevel = (sw / vw).toFixed(2) + (vw === sw ? ' (正常)' : ' ⚠️ 可能缩放');
}
} catch { zoomLevel = '检测失败'; }
const apiTests = {
'Cache API': 'caches' in window,
'BroadcastChannel': 'BroadcastChannel' in window,
'Web Animations API': 'animate' in document.documentElement,
'Share API': 'share' in navigator,
'Notifications': 'Notification' in window,
'Vibration API': 'vibrate' in navigator,
'Wake Lock API': 'wakeLock' in navigator,
'Barcode API': 'BarcodeDetector' in window,
'Face/Touch ID': 'PublicKeyCredential' in window,
'Clipboard read': !!navigator.clipboard?.readText,
'structuredClone': typeof structuredClone === 'function',
'crypto.randomUUID': !!crypto?.randomUUID,
'scheduler.postTask': !!navigator.scheduler?.postTask,
'requestIdleCallback': typeof requestIdleCallback === 'function',
'inputmode attr': (() => { const i = document.createElement('input'); i.setAttribute('inputmode', 'numeric'); return i.inputMode === 'numeric'; })(),
'enterkeyhint attr': (() => { const i = document.createElement('input'); i.setAttribute('enterkeyhint', 'go'); return i.enterKeyHint === 'go'; })(),
'DeviceMotion权限': typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function',
};
let perfData = null;
try {
const perf = performance.getEntriesByType('navigation')[0];
const t0 = perf && perf.startTime != null ? perf.startTime : 0;
if (perf) perfData = {
unload: (perf.unloadEventEnd - perf.unloadEventStart).toFixed(0) + 'ms',
redirect: (perf.redirectEnd - perf.redirectStart).toFixed(0) + 'ms',
dns: (perf.domainLookupEnd - perf.domainLookupStart).toFixed(0) + 'ms',
tcp: (perf.connectEnd - perf.connectStart).toFixed(0) + 'ms',
ttfb: (perf.responseStart - perf.requestStart).toFixed(0) + 'ms',
response: (perf.responseEnd - perf.responseStart).toFixed(0) + 'ms',
domParse: (perf.domInteractive - t0).toFixed(0) + 'ms',
load: perf.loadEventEnd ? (perf.loadEventEnd - t0).toFixed(0) + 'ms' : '尚未触发 load',
};
} catch {   }
const perfMem = performance.memory ? {
used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) + 'MB',
total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1) + 'MB',
limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(0) + 'MB',
} : null;
let vvInfo = '不支持';
let keyboardHeight = '无';
if (typeof visualViewport !== 'undefined') {
const kh = visualViewport.height - window.innerHeight;
keyboardHeight = kh > 50 ? kh + 'px（推算值，工具栏收展可能误报）' : '无';
vvInfo = `height=${Math.round(visualViewport.height)}px offsetTop=${Math.round(visualViewport.offsetTop)}px scale=${visualViewport.scale} pageLeft=${Math.round(visualViewport.pageLeft)} pageTop=${Math.round(visualViewport.pageTop)}`;
}
const visibilityState = document.visibilityState;
let gpuAccel = '未知';
try {
if (gl) {
const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
gpuAccel = gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '未知';
} else {
gpuAccel = '不支持（无 WebGL 上下文）';
}
} catch { gpuAccel = '检测失败'; }
const isSecure = window.isSecureContext;
const protocol = location.protocol;
const viewportMeta = (() => {
const meta = document.querySelector('meta[name="viewport"]');
if (!meta) return '未找到 viewport meta';
return meta.getAttribute('content') || '(空)';
})();
const viewportFit = viewportMeta.includes('viewport-fit=cover') ? 'viewport-fit=cover ✓'
: viewportMeta.includes('viewport-fit=contain') ? 'viewport-fit=contain'
: 'viewport-fit 未设置（安全区域可能无效）';
const themeColor = document.querySelector('meta[name="theme-color"]')?.content || '未设置';
const safeArea = (() => {
const el = document.createElement('div');
el.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);visibility:hidden;';
document.body.appendChild(el);
const cs = getComputedStyle(el);
const r = `top=${cs.paddingTop} bottom=${cs.paddingBottom} left=${cs.paddingLeft} right=${cs.paddingRight}`;
document.body.removeChild(el);
return r;
})();
const vpUnits = (() => {
const units = ['vh', 'dvh', 'svh', 'lvh'];
const r = {};
units.forEach(u => {
const el = document.createElement('div');
el.style.cssText = `position:fixed;top:0;left:0;width:0;height:100${u};visibility:hidden;`;
document.body.appendChild(el);
r[u] = Math.round(el.getBoundingClientRect().height) + 'px';
document.body.removeChild(el);
});
return r;
})();
const rootFontSize = getComputedStyle(document.documentElement).fontSize;
const lsTest = (() => {
try {
const k = '__diag_test__';
localStorage.setItem(k, '1');
localStorage.removeItem(k);
return '正常';
} catch (e) { return '异常: ' + e.name; }
})();
const lsSize = (() => {
let total = 0;
try {
for (let i = 0; i < localStorage.length; i++) {
const k = localStorage.key(i);
total += k.length + (localStorage.getItem(k) || '').length;
}
} catch {}
return (total / 1024).toFixed(1) + 'KB';
})();
const fps = window._diagFPS || '测量中...';
let swStatus = window._diagSW || '检测中…';
if (!window._diagSW && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
navigator.serviceWorker.getRegistration().then(reg => {
window._diagSW = reg ? `已注册 (${reg.scope})` : '未注册';
renderDiag();
}).catch(() => { window._diagSW = '不可用（file://）'; renderDiag(); });
} else if (!window._diagSW && !('serviceWorker' in navigator)) {
window._diagSW = '不支持';
}
let idbStatus = window._diagIDB || '检测中…';
if (!window._diagIDB) {
if (!window.indexedDB) {
window._diagIDB = '不支持';
} else {
idbStatus = '支持（需测试）';
try {
const testDB = indexedDB.open('__diag_test__', 1);
testDB.onupgradeneeded = () => testDB.result.createObjectStore('test');
testDB.onsuccess = () => {
window._diagIDB = '正常';
testDB.result.close();
indexedDB.deleteDatabase('__diag_test__');
renderDiag();
};
testDB.onerror = () => { window._diagIDB = '异常'; };
} catch { window._diagIDB = '异常'; }
}
}
let batteryInfo = window._diagBattery || '不支持（该浏览器无 getBattery 接口）';
if (!window._diagBattery && navigator.getBattery) {
navigator.getBattery().then(battery => {
const level = Math.round((battery.level || 0) * 100) + '%';
const charging = battery.charging ? '充电中 ⚡' : (battery.chargingTime === Infinity ? '未充电' : `充电剩余 ${battery.chargingTime}s`);
window._diagBattery = `电量 ${level} - ${charging}`;
renderDiag();
}).catch(() => { window._diagBattery = '读取失败'; });
}
return [
`=== 言字卡 · 诊断信息 ===`,
`生成时间: ${new Date().toLocaleString('zh-CN')}`,
``,
`--- 报修速览（与「反馈」页那段同一份）---`,
...(typeof fbMetaLines === 'function' ? fbMetaLines() : ['（读不到：反馈页那份机器信息不在这版里）']),
``,
`--- 设备信息 ---`,
`平台: ${platform}`,
`用户代理: ${ua}`,
`UA解析: ${uaParsed.device} / ${uaParsed.os} / ${uaParsed.browser} ${uaParsed.version}${uaParsed.webview ? ' [WebView]' : ''}`,
`UA Client Hints: ${uaDataStr}`,
`语言: ${language}`,
`可用语言: ${languages}`,
`CPU 核心数: ${hardwareConcurrency}`,
`触摸点数: ${touchPoints}`,
`内存 (.deviceMemory): ${navigator.deviceMemory || '不支持'}`,
``,
`--- 屏幕与视口 ---`,
`屏幕分辨率: ${screen.width} × ${screen.height}`,
`可用屏幕(avail): ${screen.availWidth} × ${screen.availHeight}`,
`outer 尺寸: ${window.outerWidth} × ${window.outerHeight}`,
`屏幕色深: ${screen.colorDepth}bit`,
`设备像素比: ${window.devicePixelRatio || '未知'}`,
`视口: ${window.innerWidth} × ${window.innerHeight}`,
`CSS可视区域: ${typeof visualViewport !== 'undefined' ? `${visualViewport.width}px × ${visualViewport.height}px` : '不支持'}`,
`根字号: ${rootFontSize}`,
`安全区域(实测): ${safeArea}`,
`视口单位实测: 100vh=${vpUnits.vh} 100dvh=${vpUnits.dvh} 100svh=${vpUnits.svh} 100lvh=${vpUnits.lvh}`,
`Zoom: ${zoomLevel}`,
``,
`--- 系统偏好 ---`,
`深色模式: ${darkMode}`,
`屏幕方向: ${orientation} (${angle}°)`,
`减少动态效果: ${reducedMotion}`,
`减少透明度: ${reducedTransparency}`,
`pointer: ${pointerMQ}`,
`hover: ${hoverMQ}`,
`forced-colors: ${forcedColors}`,
`inverted-colors: ${invertedColors}`,
``,
`--- 运行环境 ---`,
`页面模式: ${isInFrame ? (isInIframe ? 'iframe 嵌入' : '嵌套框架') : (isPWA ? 'PWA 应用' : (isFullscreen ? '全屏' : (isMinimalUI ? 'minimal-ui' : '普通网页')))} `,
`iOS standalone: ${iosStandalone}`,
`apple-mobile-web-app-capable: ${appleMeta}`,
`当前 URL: ${currentUrl}`,
`来源页面: ${referrer}`,
`安全上下文: ${isSecure ? '是 (HTTPS)' : '否 (HTTP)'}`,
`协议: ${protocol}`,
`viewport meta: ${viewportMeta}`,
`viewport-fit: ${viewportFit}`,
`theme-color: ${themeColor}`,
``,
`--- 浏览器能力 ---`,
`IndexedDB: ${idbStatus}`,
`localStorage: ${typeof localStorage !== 'undefined' ? '支持' : '不支持'} (写入:${lsTest}, 已用:${lsSize})`,
`Service Worker: ${swStatus}`,
`WebGL: ${!!gl ? '支持' : '不支持'}`,
`GPU: ${gpuInfo}`,
`网络在线: ${navigator.onLine ? '在线' : '离线'}`,
`在线协议: ${navigator.onLine ? (navigator.connection ? navigator.connection.effectiveType : '未知') : '离线'}`,
`连接类型: ${navigator.connection ? navigator.connection.effectiveType + (navigator.connection.type ? ' (' + navigator.connection.type + ')' : '（该内核不暴露网络类型）') : '不支持'}`,
`JS堆内存: ${perfMem ? `used=${perfMem.used} total=${perfMem.total} limit=${perfMem.limit}` : '不支持'}`,
`电池: ${batteryInfo}`,
`GPU 渲染: ${gpuAccel}`,
``,
`--- CSS 特性支持 ---`,
...Object.entries(cssTests).map(([k, v]) => `${k}: ${v ? '✓' : '✗'}`),
...Object.entries(webkitTests).map(([k, v]) => `${k}: ${v}`),
``,
`--- 键盘与 visualViewport ---`,
`visualViewport: ${vvInfo}`,
`键盘高度: ${keyboardHeight}`,
``,
`--- iOS 视口与键盘适配判定 ---`,
...iosFitLines(),
``,
`--- 页面状态 ---`,
`滚动位置: x=${scrollX}, y=${scrollY}`,
`文档高度: ${docHeight}px, 可视高度: ${docClientHeight}px`,
`DOM 元素总数: ${totalElements}`,
`图片数: ${imgCount}, 表单控件数: ${inputCount}`,
`焦点在: ${(() => { try { const a = document.activeElement; if (!a || a === document.body) return '（无·body）'; return (a.tagName || '?').toLowerCase() + (a.id ? '#' + a.id : '') + (a.className ? '.' + String(a.className).split(' ')[0] : ''); } catch (e) { return '取不到'; } })()}`,
`聊天输入框: ${(() => { try { const i = document.getElementById('messageInput'); if (!i) return '不在 DOM'; return '值 ' + String(i.value || '').length + ' 字 · 只读 ' + (i.readOnly ? '是' : '否') + ' · 禁用 ' + (i.disabled ? '是' : '否') + ' · 可见 ' + (i.offsetParent === null ? '否' : '是'); } catch (e) { return '取不到'; } })()}`,
`页面错误数: ${errorCount}`,
`可见性: ${visibilityState}`,
``,
`--- 页面性能 ---`,
`DOM 解析: ${perfData ? perfData.domParse : '不支持'}`,
`首字节 (TTFB): ${perfData ? perfData.ttfb : '不支持'}`,
`页面加载: ${perfData ? perfData.load : '不支持'}`,
`rAF 实测帧率: ${fps} fps`,
``,
`--- API 支持 ---`,
...Object.entries(apiTests).map(([k, v]) => `${k}: ${v ? '✓' : '✗'}`),
``,
`--- 错误列表 (最近5条) ---`,
...(errorList.length ? errorList.map(e => `[${e.time}] ${e.type}: ${e.msg}`) : ['(无)']),
``,
`--- 应用状态 ---`,
`当前主题: ${d.theme || 'white'}`,
`头像形状: ${d.avatarShape || 'circle'}（聊天）`,
`朋友圈头像形状: ${d.momentsAvatarShape || 'circle'}`,
`联系人: ${(d.contacts || []).length}（群 ${(d.contacts || []).filter(c => c && c.kind === 'group').length}）`,
`活跃会话: ${d.activeChat ? d.activeChat : '（空·没有归属）'}`,
`消息数: ${d.messages?.length || 0}`,
`字卡分组: ${d.groups?.length || 0}`,
`总字卡数: ${d.groups?.reduce((s, g) => s + (g.cards?.length || 0), 0) || 0}`,
`表情包数: ${d.stickers?.length || 0}`,
`收到信件: ${d.receivedLetters?.length || 0}`,
`寄出信件: ${d.sentLetters?.length || 0}`,
`纪念日: ${d.anniversary || '未设置'}`,
`存储与体积: 见「设置 → 数据 → 存储」折叠卡（占用读数与清理只有那一处宿主，这里不再各印一份）`,
``,
...diagGuardLines(),
``,
`--- 功能检测 ---`,
`clipboard.writeText: ${!!navigator.clipboard?.writeText ? '支持' : '不支持'}`,
`IntersectionObserver: ${!!IntersectionObserver ? '支持' : '不支持'}`,
`CSS env(safe-area-inset-*): 支持`,
`pointer events: ${'ontouchstart' in window ? '触摸屏' : '鼠标'}`,
].join('\n');
}
function env(name) {
try {
return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
} catch { return '?'; }
}
function screenInfoText() {
const out = [];
const inp = (() => { try { return iosFitInp(); } catch (e) { return null; } })();
out.push('=== 言字卡 · 屏幕信息 ===');
out.push('生成时间: ' + new Date().toLocaleString('zh-CN'));
out.push('');
out.push('--- 视口与屏幕 ---');
try {
out.push('屏幕分辨率: ' + screen.width + ' × ' + screen.height);
out.push('视口(布局口): ' + window.innerWidth + ' × ' + window.innerHeight);
const vv = window.visualViewport;
if (vv) out.push('视觉口: ' + Math.round(vv.width) + ' × ' + Math.round(vv.height) + 'px offsetTop=' + Math.round(vv.offsetTop || 0) + 'px scale=' + (vv.scale || 1));
out.push('设备像素比: ' + (window.devicePixelRatio || 1));
out.push('页面模式: ' + (function () { try { return matchMedia('(display-mode: standalone)').matches ? 'PWA 应用' : '普通网页'; } catch (e) { return '未知'; } })());
out.push('全屏模式: ' + (inp && inp.fsPage ? '开（requestFullscreen）' : '关'));
out.push('iOS standalone: ' + (navigator.standalone === true ? '是(主屏)' : '否'));
} catch (e) { out.push('（视口读数取不到：' + String((e && e.message) || e) + '）'); }
try {
const d = document.createElement('div');
d.style.cssText = 'position:fixed;left:-9999px;top:0;width:0;height:100dvh;padding-bottom:env(safe-area-inset-bottom,0px)';
document.body.appendChild(d);
const cs = getComputedStyle(d);
const probe = (v) => { d.style.height = v; return Math.round(parseFloat(getComputedStyle(d).height)) || 0; };
out.push('视口单位: 100vh=' + probe('100vh') + 'px 100dvh=' + probe('100dvh') + 'px 100svh=' + probe('100svh') + 'px 100lvh=' + probe('100lvh') + 'px');
out.push('底部安全区(env): ' + cs.paddingBottom);
d.remove();
} catch (e) { out.push('（视口单位读数取不到：' + String((e && e.message) || e) + '）'); }
out.push('页面缩放 Zoom: ' + (inp ? inp.scale.toFixed(2) : '?'));
out.push('排障开关: ' + (window.__kbForce && window.__kbForce !== 'auto' ? ('?kb=' + window.__kbForce + '（在位的排障档）') : '出厂（不带参数）'));
out.push('');
out.push('--- 键盘与输入栏 ---');
try { iosFitLines().forEach(l => out.push(l)); } catch (e) { out.push('（键盘那一族读数取不到：' + String((e && e.message) || e) + '）'); }
const e2 = window.__kbEdge;
if (e2) out.push('键盘沿现场(原始): ' + JSON.stringify(e2));
const eS = (inp && inp.edgeSaved) || null;
if (eS && (eS.open || eS.close)) {
if (eS.open) out.push('键盘沿·上一轮(开): ' + JSON.stringify(eS.open));
if (eS.close) out.push('键盘沿·上一轮(关): ' + JSON.stringify(eS.close));
} else out.push('键盘沿·上一轮: 本机还没存过（装上一版之后开过一次键盘就会记下来）');
out.push('');
try { diagBlurLines().forEach(l => out.push(l)); } catch (e) { out.push('（实时模糊读数取不到：' + String((e && e.message) || e) + '）'); }
out.push('');
out.push('--- 怎么读这三行 ---');
out.push('· 判定器那十条 ✓/✗ 是结论层：✗ 的那几条就是要修的地方（红字不是故障清单，是「这一项没达标」）。');
out.push('· 「输入栏与可视带底」与「键盘沿·输入栏到带底」里的 px＝屏上那条带子有多高：>12px 才叫带子。');
out.push('· 底内距＝输入栏自己的内距（安全区那一笔在这）∶壳补偿＝壳上那行内联高度（空＝没压，交给 dvh 让位）。');
out.push('· 若「输入栏与可视带底」判 ✓（0~12px）而屏上<b>仍有一条带子</b>：那一条在页面之外（输入法窗口自己的顶栏／浏览器窗口底色），网页画不进去；地址栏加 ?kb=overlay 再试一次＝页面留在键盘后面，那条带子后面就换成聊天自己的背景。判 ✗ 写着「越出可视带」＝输入栏这条<b>栏本身</b>被挪到带子外面（聊天设置 → 界面与磨砂 → 栏位位置那根杆），不是键盘的锅。');
return out.join('\n');
}
function renderScreenInfo() {
const out = document.getElementById('screenOut');
if (!out) return;
try { out.textContent = screenInfoText(); }
catch (e) { out.textContent = '屏幕信息生成失败：' + String((e && e.message) || e); }
}
(function initDiagnostic() {
const output = $('#diagOutput');
if (!output) return;
function refresh() {
startFPSMeasure();
output.textContent = getDiagnosticInfo();
}
refresh();
const _diagFold = output.closest('.fold');
if (_diagFold) {
const _hd = _diagFold.querySelector('.fold-hd');
if (_hd) _hd.addEventListener('click', () => { setTimeout(refresh, 0); });
}
$('#diagCopy')?.addEventListener('click', async () => {
showToast((await copyTextToClipboard(output.textContent)) ? '已复制' : '复制失败，请手动选择文本复制');
});
$('#diagRefresh')?.addEventListener('click', refresh);
const _docxExport = (text, fname) => {
const run = () => {
if (typeof docxBlobFromText !== 'function') { showToast('导不出来，网络好了再点一次'); return; }
const blob = docxBlobFromText(text);
const r = saveBlobToDevice(blob, fname);
showToast(r === 'none' ? '这台设备的浏览器不支持直接存文件' : (r === 'native' ? '已存进「下载/言字卡」' : '已导出 DOCX'));
};
if (typeof docxBlobFromText === 'function') { run(); return; }
if (typeof ensureChunk !== 'function') { run(); return; }
ensureChunk('cards').then(ok => {
if (ok && typeof docxBlobFromText === 'function') run();
else showToast('导不出来，网络好了再点一次');
});
};
const sOut = $('#screenOut');
if (sOut) {
const sRefresh = () => { try { renderScreenInfo(); } catch (e) {} };
sRefresh();
$('#screenCopy')?.addEventListener('click', async () => {
showToast((await copyTextToClipboard(sOut.textContent)) ? '已复制' : '复制失败，请手动选择文本复制');
});
$('#screenRefresh')?.addEventListener('click', sRefresh);
$('#screenExport')?.addEventListener('click', () => _docxExport(sOut.textContent, '言字卡-屏幕信息.docx'));
}
$('#screenEntry')?.addEventListener('click', () => { if (typeof showView === 'function') showView('screen'); });
$('#diagExport')?.addEventListener('click', () => {
const blob = new Blob([output.textContent], { type: 'text/plain;charset=utf-8' });
const r = saveBlobToDevice(blob, '言字卡-诊断信息.txt');
showToast(r === 'none' ? '这台设备的浏览器不支持直接存文件' : (r === 'native' ? '已存进「下载/言字卡」' : '已导出 TXT'));
});
})();
var CK_LABEL = { ok: '过', warn: '要看', bad: '不通', none: '没试' };
var CK_MARK = { ok: '✓', warn: '!', bad: '✗', none: '·' };
var _ckRes = {};
var _ckBusy = {};
var _ckAt = 0;
var _ckNote = '';
var CK_FREE = ['store', 'space', 'img', 'words', 'active', 'css', 'font', 'num', 'build', 'fit', 'bg', 'bxconf', 'bxconn', 'bxgate'];
function _ckTxt(segs) {
return segs.map(g => String(typeof g === 'string' ? g : g.v)).join('');
}
function _ckHtml(segs) {
return segs.map(g => {
const s = String(typeof g === 'string' ? g : g.v);
const k = (typeof g === 'object' && g.k) || '';
if (k === 'b') return '<b>' + escapeHTML(s) + '</b>';
if (k === 'w') return '<span class="ckx-who">' + escapeHTML(s) + '</span>';
return escapeHTML(s);
}).join('');
}
function _ckR(s, ...t) { return { s: s, t: t }; }
var CK_NOHOST = w => _ckR('bad', '这一行查不了：', { k: 'w', v: w }, ' 没给页面用（写它的那一件没把这一只口挂出来）＝这一行是死的，不是没问题');
function _ckCan(fn) { return typeof window[fn] === 'function'; }
function _ckGo(tab, fold, hit) {
if (typeof _hubGoFold !== 'function') { try { showView('settings'); } catch (e) {} }
else _hubGoFold(tab, fold);
if (!hit) return;
setTimeout(() => {
const el = document.getElementById(hit);
if (!el) return;
el.classList.add('ap-hit');
setTimeout(() => el.classList.remove('ap-hit'), 1600);
try { el.scrollIntoView({ block: 'center' }); } catch (e) {}
}, 120);
}
async function _ckStoreTrial() {
if (typeof dbWriteProbe !== 'function') return CK_NOHOST('db.js 的存试探针');
const r = await dbWriteProbe();
if (r.mode === 'ls') {
return r.ok ? _ckR('ok', '本机那一份：写得进、读得回、也擦干净了')
: _ckR('bad', '本机那一份写不进去（', { k: 'w', v: String(r.err || '') }, '）——这一趟改的东西关掉页面就没了');
}
if (r.step === 'open') return _ckR('bad', '本机存档打不开（', { k: 'w', v: String(r.err || '') }, '），所以现在什么都存不下');
if (r.step === 'write') return _ckR('bad', '写不进去（', { k: 'w', v: String(r.err || '') }, '）——这一趟改的东西只活在内存里，关掉页面就没了');
if (!r.ok) return _ckR('bad', '写进去了，读回来的却不是那一枚——本机存档已经不可信，先导一份出来再说');
const tail = r.left ? ['·只是那一格测试记录没擦掉（几十字节，不影响你的东西）'] : [];
return _ckR('ok', '真存了一条测试记录：写得进、读回来一字不差、也擦干净了', ...tail);
}
function _ckBackupText(obj) {
const raw = String((obj && obj.raw) || '');
if (!raw.trim()) return _ckR('none', '没选文件，所以没验（选了也只是**读它**，不会导进来）');
let d = null;
try { d = JSON.parse(raw); } catch (e) { return _ckR('bad', '这份文件不是能读的 JSON（', { k: 'w', v: String((e && e.message) || e).slice(0, 60) }, '）'); }
if (!d || typeof d !== 'object' || !d.chats) return _ckR('bad', '这份里没有会话那一段——多半不是本站导出的那份');
if (typeof _importStats !== 'function') return CK_NOHOST('_importStats');
const st = _importStats(d);
const cur = typeof _exportPayloadShape === 'function' ? _exportPayloadShape(data) : null;
const cst = cur ? _importStats(cur) : null;
const bits = [];
if (st.msgs) bits.push(st.msgs + ' 条消息');
if (st.contacts) bits.push(st.contacts + ' 位');
if (st.cards) bits.push(st.cards + ' 张字卡');
if (st.letters) bits.push(st.letters + ' 封信');
if (st.moments) bits.push(st.moments + ' 条朋友圈');
const p = ['这份装了 ', { k: 'b', v: bits.join('∶') || '一样都没有' }, ''];
if (obj.name) p.push('（', { k: 'w', v: String(obj.name).slice(0, 24) }, '）');
let s = 'ok';
let imgN = 0;
try {
if (typeof stWalkImages === 'function') { const imgs = []; stWalkImages(d, [], 0, imgs, typeof stAliasSkip === 'function' ? stAliasSkip(d) : {}); imgN = imgs.length; }
} catch (e) {}
if (imgN) p.push(' ∶ 图和语音 ', { k: 'b', v: imgN + ' 项', }, '带在里面');
const vidN = typeof videoCount === 'function' ? videoCount() : 0;
if (vidN) { s = 'warn'; p.push(' ∶ 但视频 ', { k: 'w', v: vidN + ' 段', }, '带不走（那几段只存在这台设备上，换机那天才知道＝没了）'); }
if (cst) {
const gap = [];
if (cst.msgs !== st.msgs) gap.push('消息 现在 ' + cst.msgs + ' ∶ 这份 ' + st.msgs);
if (cst.contacts !== st.contacts) gap.push('人 现在 ' + cst.contacts + ' ∶ 这份 ' + st.contacts);
if (cst.cards !== st.cards) gap.push('字卡 现在 ' + cst.cards + ' ∶ 这份 ' + st.cards);
if (gap.length) p.push(' ∶ 和你现在这份比 ', { k: 'w', v: gap.join('∶') }, '（差多少不一定是坏：导完之后你又聊过的话就这么多）');
}
return { s: s, t: p };
}
function _ckBrokenImgs() {
const out = { n: 0, scanned: 0, bad: [], waiting: 0, waitAlt: [], offscreen: 0 };
try {
const all = document.images || [];
for (let i = 0; i < all.length && i < 400; i++) {
const im = all[i];
const addr = String(im.getAttribute('src') || im.getAttribute('data-src') || '');
if (!addr.trim()) continue;
if (!String(im.getAttribute('src') || '').trim()) {
const r = im.getBoundingClientRect();
if (!r.width && !r.height) { out.offscreen++; continue; }
out.waiting++;
if (out.waitAlt.length < 3) out.waitAlt.push(String(im.alt || im.id || '（这一张）').slice(0, 16));
continue;
}
if (!im.complete) continue;
out.scanned++;
if (im.naturalWidth === 0) {
out.n++;
if (out.bad.length < 3) out.bad.push(String(im.alt || im.id || '（这一张）').slice(0, 16));
}
}
} catch (e) {}
return out;
}
function _ckImgHeads() {
const out = { n: 0, cut: 0, where: [] };
try {
if (typeof stWalkImages !== 'function' || typeof stAliasSkip !== 'function' || typeof data === 'undefined' || !data) return null;
const imgs = [];
stWalkImages(data, [], 0, imgs, stAliasSkip(data));
out.n = imgs.length;
imgs.forEach(it => {
const s = String(it.raw || '');
const comma = s.indexOf(',');
if (comma < 0 || comma > s.length - 8) { out.cut++; if (out.where.length < 2) out.where.push(typeof stPathText === 'function' ? stPathText(it.trail) : '（一处）'); }
});
} catch (e) { return null; }
return out;
}
async function _ckImgTrial() {
const b = _ckBrokenImgs(), h = _ckImgHeads();
const parts = [];
if (h && h.cut) parts.push('存档里有 ', { k: 'b', v: h.cut + ' 张图片数据断了一半' }, '（', { k: 'w', v: h.where.join('∶') }, '）——屏上就是空白一块');
else parts.push(h ? ('存档里 ' + h.n + ' 张图，都是完整的') : '图片这一项读不到');
if (b.n) parts.push(' ∶ 屏上还有 ', { k: 'b', v: b.n + ' 张开不了' }, '（', { k: 'w', v: b.bad.join('∶') }, '）');
if (b.waiting) parts.push(' ∶ 另有 ', { k: 'b', v: b.waiting + ' 张在屏上却没去取图' }, '（', { k: 'w', v: b.waitAlt.join('∶') }, '）——滑一下那一屏，或退出这一页再进来');
const s = (h && h.cut) || b.n || b.waiting ? 'bad' : 'ok';
const note = '查的屏上那 ' + b.scanned + ' 张' + (b.offscreen ? ' ∶ 还有 ' + b.offscreen + ' 张住在没打开的那几页里（没轮到它，不算坏）' : '');
return { s: s, t: parts, note: note };
}
async function _ckSpaceTrial() {
if (typeof storageScan !== 'function') return CK_NOHOST('storageScan');
let r = await storageScan();
if (!r) { await new Promise(res => setTimeout(res, 700)); r = await storageScan(); }
if (!r) return _ckR('bad', '这一行没跑完：本机存储那一栏自己读不动');
const p = [];
if (r.est) p.push('占了 ', { k: 'b', v: stFmt(r.est.usage) }, ' ∶ 这台设备还能放 ', { k: 'b', v: stFmt(r.est.quota) });
else p.push('这台设备的浏览器没把占用报给我们');
p.push(' ∶ 图 ', { k: 'b', v: (r.imgN || 0) + ' 张' }, ' 共 ', { k: 'b', v: stFmt(r.imgTotal || 0) });
if (r.dup && r.dup.waste > 0) p.push('（同一张图存了 ' + r.dup.kinds + ' 份，多占 ', { k: 'w', v: stFmt(r.dup.waste) }, '，要压小去 设置 → 数据 → 存储）');
const persist = r.persisted;
let s = 'ok';
if (persist === false) { s = 'warn'; p.push(' ∶ 还没拿到「不会被自动清掉」那一句'); }
else if (persist === null) p.push(' ∶ 这台设备没有申请那一步的接口（这样打开的网页被系统整站清掉是可能的）');
return { s: s, t: p, persisted: persist };
}
var CK_TEST_MARK = '【测试】这一句是刚查的';
async function _ckReplyTrial() {
const o = typeof currentContact === 'function' ? currentContact() : null;
if (!o) return _ckR('warn', '现在没选中谁——先在聊天页点开一位，这一发才知道问的是他');
const cid = o.id;
if (typeof partnerReply !== 'function') return CK_NOHOST('partnerReply');
const before = (data.chats && data.chats[cid] && data.chats[cid].msgs) ? data.chats[cid].msgs.length : 0;
const t0 = Date.now();
const mine = { id: (typeof nextId === 'function' ? nextId() : Date.now()), from: 'me', text: CK_TEST_MARK, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), date: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate() };
if (!data.chats[cid]) data.chats[cid] = { msgs: [], unread: 0, draft: '' };
data.chats[cid].msgs.push(mine);
if (cid === data.activeChat) { try { data.messages = data.chats[cid].msgs; } catch (e) {} }
const ids = [mine.id];
try { renderMessages(); } catch (e) {}
try { save(); } catch (e) {}
try { partnerReply(cid, CK_TEST_MARK); } catch (e) { return _ckR('bad', '话是发出去了，但他那边那一条链没跑起来（', { k: 'w', v: String((e && e.message) || e).slice(0, 40) }, '）'); }
let first = 0, n = 0, quiet = 0;
for (let i = 0; i < 62; i++) {
await new Promise(res => setTimeout(res, 400));
const ms = (data.chats[cid] && data.chats[cid].msgs) || [];
const nowN = ms.length - before - 1;
if (nowN > n) { if (!first) first = Date.now() - t0; n = nowN; quiet = 0; }
else if (n > 0) quiet++;
ms.forEach(m => { if (m && m.id && ids.indexOf(m.id) < 0 && m.from !== 'me') ids.push(m.id); });
const busy = typeof _pendingBusy === 'function' ? _pendingBusy(cid) : false;
if (n > 0 && quiet >= 5 && !busy) break;
}
try { save(); } catch (e) {}
const undo = { label: '撤掉刚才那几条（我的与他接的）', act: () => _ckWithdraw(cid, before) };
if (!n) {
const why = [];
if (typeof chatSilentOn === 'function' && chatSilentOn(cid)) why.push('他在「不再主动找我」那份名单里（只影响他自己开口，回话不受影响）');
if (typeof nightOn === 'function' && nightOn()) why.push('此刻是夜里那一档');
return { s: 'bad', t: ['等了 25 秒，他没有回话', ...why.map(w => ' ∶ ' + w), ' ∶ 屏上那条「', { k: 'w', v: CK_TEST_MARK }, '」是刚发的，可以撤'], cid: cid, undo: { label: '撤掉我刚发的那一条', act: () => _ckWithdraw(cid, before) } };
}
return {
s: 'ok', t: ['他回了 ∶ ', { k: 'b', v: (Math.round(first / 100) / 10) + ' 秒' }, ' 接话 ∶ 一共 ', { k: 'b', v: n + ' 条' }, '（等他这一轮说完）'],
cid: cid, ids: ids, undo: undo,
keep: { label: '就留着，不撤', act: async () => _ckR('ok', '留下了——那就当正常说过一次话') }
};
}
async function _ckWithdraw(cid, before) {
const ms = (data.chats[cid] && data.chats[cid].msgs) || [];
let n = 0;
for (let i = ms.length - 1; i >= before; i--) {
const m = ms[i];
if (!m || m.src) continue;
if (m.from === 'me' && m.text !== CK_TEST_MARK) continue;
const id = m.id; ms.splice(i, 1); n++;
try { if (typeof msgJournalDropMsg === 'function') msgJournalDropMsg(cid, id); } catch (e) {}
}
if (cid === data.activeChat) { try { data.messages = ms; } catch (e) {} }
try { flushSave(); } catch (e) { try { save(); } catch (x) {} }
try { renderMessages(); } catch (e) {}
return _ckR('ok', '撤掉了这一发的 ', n + ' 条', cid === data.activeChat ? '（聊天页已经回到你原来那一屏）' : '');
}
var CK_TTS_LINE = '这一句是刚查的，用来听他的声音通不通';
function _ckVoiceOwner() {
const o = typeof currentContact === 'function' ? currentContact() : null;
if (!o) return { none: true };
if (o.kind === 'group') {
const ms = (o.members || []).filter(Boolean);
const ready = ms.filter(nm => { try { return mmTtsReady(mmOwnerOf(o.id, nm)); } catch (e) { return false; } });
return { group: true, total: ms.length, ready: ready.length, owner: ready.length ? mmOwnerOf(o.id, ready[0]) : null, names: ms.filter(nm => !(ready.indexOf(nm) >= 0)) };
}
return { single: true, name: o.name, ready: mmTtsReady(o), owner: o };
}
async function _ckVoiceTrial() {
if (!_ckCan('mmSettings')) return CK_NOHOST('mmSettings');
const v = mmSettings() || {};
if (!v.on) return _ckR('bad', '声音的总开关没勾，全站一个字也不会念出来');
if (!String(v.key || '').trim()) return _ckR('bad', '要填的那一串密钥还空着（MiniMax 开放平台那一串），所以念不出来');
const who = _ckVoiceOwner();
if (who.none) return _ckR('warn', '现在没选中谁——先在聊天页点开一位，这一发才知道问的是他的声音');
if (who.group && !who.ready) return _ckR('bad', '群里 ' + who.total + ' 位都没绑声音（', { k: 'w', v: (who.names || []).slice(0, 3).join('∶') }, '）——一人一号，不借别人的声音');
if (who.single && !who.ready) return _ckR('bad', '这位还没绑声音，气泡上也不会有小喇叭');
const owner = who.owner;
const timbre = String(owner.mmTimbre || '').trim();
let url = null;
try { url = typeof mmLibraryLookup === 'function' ? mmLibraryLookup(CK_TTS_LINE, timbre, owner.id) : null; } catch (e) {}
if (url) {
const played = await _mmPlayNow(url);
return played ? _ckR('ok', '放了库里存好的那一句（', { k: 'w', v: owner.name || '这位' }, '）——一次都没花')
: _ckR('warn', '声音已经有了（库里那句），但这台设备不让你这样点开它——先点一下屏幕任何地方再试');
}
return {
s: 'warn', t: ['库里没有这一句，所以先不放（放就得现合成一次）。要真听，按下面那枚——', { k: 'b', v: '会花一次额度' }],
pay: { label: '真念一句（会花一次额度）', act: async () => {
try {
const u = await mmSynth(CK_TTS_LINE, timbre);
const played = await _mmPlayNow(u);
try { mmSaveToLibrary(CK_TTS_LINE, timbre, u, owner); } catch (e) {}
return played ? _ckR('ok', '念出来了也放进他那本声音的卡里了——下次同句同音色就一次都不花')
: _ckR('warn', '合成成功了，但这台设备不让这样开播（浏览器拦自动播放）：声音已经拿到，再点一次就响');
} catch (e) { return _ckR('bad', '念不成：', { k: 'w', v: String((e && e.message) || e).slice(0, 80) }, '——哪一道门断了，去 设置 → AI 按「检测为什么没声音」'); }
} }
};
}
async function _ckActiveTrial() {
const o = typeof currentContact === 'function' ? currentContact() : null;
const p = [];
let s = 'ok';
if (_ckCan('silentStatusText')) p.push(_ckCan('chatSilentOn') && o && chatSilentOn(o.id) ? '他在「不用他主动找我」那份名单里，所以不会自己冒出来（回你话不受影响）' : '名单：' + silentStatusText());
else return CK_NOHOST('silentStatusText');
if (o && _ckCan('chatProbOf') && chatProbOf(o.id) === 0) { s = 'warn'; p.push(' ∶ 这位的频率填的是 0＝从不'); }
if (_ckCan('nightOn') && _ckCan('nightStatusText')) {
if (nightOn()) { s = s === 'ok' ? 'warn' : s; p.push(' ∶ 此刻正卡在夜里那一档（23:00–07:00），这一段他不会自己来'); }
}
if (typeof chatProbOf === 'function' && o && chatProbOf(o.id) > 0) p.push(' ∶ 频率 ' + chatProbOf(o.id) + '%');
return { s: s, t: p };
}
async function _ckWordsTrial() {
const o = typeof currentContact === 'function' ? currentContact() : null;
if (!o) return _ckR('warn', '现在没选中谁——字卡是他一本你一本，得分开看');
if (o.kind === 'group') return _ckR('warn', '这是一个群：群里谁开口用谁那本字卡，点开那位本人的单聊才量得准');
if (!_ckCan('_cfStat') || !_ckCan('_cfItems')) {
const ok = (typeof ensureChunk === 'function') ? await ensureChunk('cardfit') : false;
if (!ok || !_ckCan('_cfStat') || !_ckCan('_cfItems')) return CK_NOHOST('字卡适应度那两把尺');
}
let items;
try { items = _cfItems(_cfStat(o.id)) || []; } catch (e) { return _ckR('bad', '这一行没跑完：', { k: 'w', v: String((e && e.message) || e) }); }
const bad = items.filter(x => x.lv === 0), mid = items.filter(x => x.lv === 1);
if (!bad.length && !mid.length) return _ckR('ok', '这位的 ' + items.length + ' 样内容现在都抽得出来');
const parts = [];
if (bad.length) parts.push(bad.length + ' 样一句都抽不出来（', { k: 'w', v: bad.map(x => x.k).join('∶') }, '）');
if (mid.length) parts.push((bad.length ? ' ∶ ' : '') + mid.length + ' 样翻来覆去就那几句（', { k: 'w', v: mid.map(x => x.k).join('∶') }, '）');
return _ckR(bad.length ? 'bad' : 'warn', ...parts, '——他说话就靠这些∶缺哪一类就少那一种');
}
async function _ckNotifyTrial() {
if (!_ckCan('nbPermState')) return CK_NOHOST('nbPermState');
const perm = nbPermState();
if (perm === 'unsupported') return _ckR('warn', '这样打开的网页没有通知这条路（要它就得部署成 https，或装到桌面从主屏幕打开）');
if (perm === 'denied') return _ckR('bad', '通知被拒过一次，浏览器不再问第二遍——得自己去系统或浏览器设置里放行');
if (perm === 'default') return _ckR('warn', '这台设备还没被问过要不要允许：先按 设置 → 通知 那一格里那枚开关，同意之后再来按一次');
if (typeof window.bgNotifyCheck !== 'function') return CK_NOHOST('bgNotifyCheck');
const ap = (typeof data !== 'undefined' && data && data.appearance) || {};
if (!ap.bgNotify) return _ckR('bad', '站里的通知开关没勾，这一发压根不会弹出去（不是这台设备不让）——先去 设置 → 通知 那一格勾上，再回来按一次');
const errBefore = String(window.__bgLastNotifyError || '');
const sentBefore = (typeof window.bgNotifyGateStats === 'function' ? (window.bgNotifyGateStats() || {}).sent : null);
window.bgNotifyCheck('这是一条测试通知', Date.now(), { force: true, late: true, name: '检测功能' });
await new Promise(res => setTimeout(res, 700));
const errAfter = String(window.__bgLastNotifyError || '');
const sentAfter = (typeof window.bgNotifyGateStats === 'function' ? (window.bgNotifyGateStats() || {}).sent : null);
if (errAfter && errAfter !== errBefore) {
return _ckR('bad', '弹不出来：', { k: 'w', v: errAfter.slice(0, 70) }, '（这台设备不让这样弹窗，或那一条路被系统压住了）');
}
if (sentBefore !== null && sentAfter !== null && sentAfter === sentBefore) {
return { s: 'warn', ask: true, t: ['这一发没报错，也没被记账那一栏算成「已发出」∶ 两条读数都摆在这儿', { k: 'b', v: '屏上有没有出现？' }] };
}
return { s: 'warn', ask: true, t: ['这一发没报错 ∶ 但能不能看见只有你自己知道', { k: 'b', v: '屏上有没有出现？' }] };
}
async function _ckNotifySeen(yes) {
if (yes) return _ckR('ok', '看得见——那这条链是通的');
return _ckR('bad', '看不见——多半是系统的省电把它压住了；那一段排障六步在 设置 → 通知 那一格里（下面那枚直接带你过去）');
}
function _ckBgDur(ms) {
ms = Number(ms) || 0;
if (ms < 1000) return ms ? '不到 1 秒' : '0 秒';
const sec = Math.round(ms / 1000);
if (sec < 60) return sec + ' 秒';
const min = Math.floor(sec / 60);
if (min < 60) return min + ' 分' + (sec % 60 ? ' ' + (sec % 60) + ' 秒' : '');
return Math.floor(min / 60) + ' 时' + (min % 60) + ' 分';
}
async function _ckBgTrial() {
const ap = (typeof data !== 'undefined' && data && data.appearance) || {};
if (!ap.bgKeepAlive) return _ckR('warn', '那枚开关没勾：切后台一整页就被冻住，那一段时间里的消息与通知都没有');
if (typeof window.__kaProbe !== 'function') return CK_NOHOST('__kaProbe');
const p = window.__kaProbe() || {};
if (!p.keep || !p.audio) return _ckR('bad', '开关开着，引擎却没起来（这一页此刻并没有在放那段声音）——把保活关一下再开，或回这一页点一下屏幕');
let s = 'ok';
const out = ['开关开着，引擎在跑'];
const paused = p.audio.paused !== false;
if (paused && p.music) out.push(' ∶ 这一刻没放＝', { k: 'b', v: '给播放器让位' }, '（歌那条声音就是页面还活着的凭据，一停它自动接上）');
else if (paused && p.fgHold) out.push(' ∶ 这一刻没放＝', { k: 'b', v: '你正在这一页上动手，它故意按住省电' }, '（手停 ' + Math.round((Number(p.fgIdleMs) || 15000) / 1000) + ' 秒或切后台自动接上——这不是坏了）');
else if (paused) { s = 'bad'; out.push(' ∶ ', { k: 'w', v: '这一刻音频停着：这一段后台不发消息、不弹通知' }, '（回这一页点一下就恢复；老是停在这儿的是别的 App 或系统把这条通道拿走了）'); }
else out.push(' ∶ 音频在放 ·', p.noduck ? '不占你正在听的那条声音' : '占着声音通道（通知栏有那条「后台保活」）');
const ev = p.ev || {};
if (Number(ev.maxHidden)) out.push(' ∶ 这一趟开页面以来，后台最长连续挂过 ', { k: 'b', v: _ckBgDur(ev.maxHidden) }, '（挂得住＝系统在后台留着这一页）');
else out.push(' ∶ 这一趟还没切到过后台，上面那句「挂得住」要切出去一会儿才量得出');
if (Number(ev.fb)) out.push(' ∶ 不占声音那条通道被系统挂起过 ', { k: 'b', v: ev.fb + ' 次' }, '（已经自动换成另一条）');
if (Number(ev.died)) { if (s === 'ok') s = 'warn'; out.push(' ∶ 这一页被系统整个收回去过 ', { k: 'w', v: ev.died + ' 次' }, '——那几段的后台消息是回来才补上的，通知当时弹不出'); }
out.push(' ∶ 页面开着时来消息', (ap.deskPopup === false ? '不会' : '会'), '在屏顶挂一条横幅');
if (typeof popSrcBook === 'function') {
const _offOf = w => POP_SRC_KEYS.filter(k => (popSrcBook(w) || {})[k] === false).map(k => POP_SRC_LABEL[k]);
const _offD = _offOf('desk'), _offB = _offOf('bg');
if (_offD.length) out.push(' ∶ 顶部横幅', { k: 'w', v: '不弹 ' + _offD.join('·') }, '（设置→提醒 里那排「弹窗哪些来源」没勾）');
if (_offB.length) out.push(' ∶ 系统通知', { k: 'w', v: '不弹 ' + _offB.join('·') }, '（那一排「通知哪些来源」没勾）');
}
return { s: s, t: out };
}
async function _ckCssTrial(which) {
const a = typeof _apView === 'function' ? (_apView() || {}) : null;
if (!a) return CK_NOHOST('_apView');
const raw = String(which === 'font' ? (a.customGlobalFontCss || a.customFontCss || '') : (a.customBubbleCss || '')).trim();
const who = (typeof currentContact === 'function' && currentContact()) ? (currentContact().name || '这位') : '全站';
if (!raw) return _ckR('ok', which === 'font' ? '你没写过自己的字体样式∶这一条没什么可查（现在用的是站点那一套）' : '你没写过自己的气泡样式∶这一条没什么可查（现在用的是站点那一套）');
const st = document.createElement('style');
st.textContent = raw;
document.head.appendChild(st);
let rules = [];
try { rules = st.sheet ? [...st.sheet.cssRules] : []; }
catch (e) { try { document.head.removeChild(st); } catch (x) {} return _ckR('bad', '这段样式浏览器整份读不了（', { k: 'w', v: String((e && e.message) || e).slice(0, 60) }, '）'); }
const blocks = (raw.match(/\{/g) || []).length;
const dropped = Math.max(0, blocks - rules.length);
const miss = [];
rules.forEach(r => {
const sel = r.selectorText;
if (!sel) return;
sel.split(',').forEach(one => {
let ok = true, hit = null;
try { hit = document.querySelector(one.trim()); } catch (e) { ok = false; }
if (!ok || !hit) miss.push((ok ? one.trim() : one.trim().slice(0, 24)) + (ok ? '' : '（这句写法看不懂）'));
});
});
let painted = null, deadVar = false;
if (which !== 'font') {
try { if (typeof _bubblePaintProbe === 'function') painted = _bubblePaintProbe(); } catch (e) {}
try {
const el = document.querySelector('.bubble');
if (el && typeof _bubblePaintDecl === 'function') deadVar = !!(_bubblePaintDecl(el) || {}).dead;
} catch (e) {}
}
try { document.head.removeChild(st); } catch (e) {}
const p = ['你这 ', { k: 'b', v: blocks + ' 条' }, ' ∶ ', { k: 'b', v: rules.length + ' 条被收下' }];
let s = 'ok';
if (dropped) { s = 'bad'; p.push(' ∶ ', { k: 'w', v: dropped + ' 条整条被丢掉' }, '（写法不合规矩，最常见是少一个右括号或那一行选择器打错）'); }
if (miss.length) { s = s === 'bad' ? 'bad' : 'warn'; p.push(' ∶ 没套上的 ', { k: 'w', v: miss.length + ' 处' }, '（', { k: 'w', v: miss.slice(0, 2).join('∶') }, '）——屏上没有这样东西：气泡是 .bubble，那些卡各有各的名字'); }
if (painted && painted.part && painted.part.bad) { s = 'bad'; p.push(' ∶ 现在这套下去气泡**画不出东西**（你写的这几条落到一个没有值的变量上）'); }
else if (deadVar) { s = 'warn'; p.push(' ∶ 有用到站点里没有的变量，那几条等于没写'); }
p.push(' ∶ 现在生效的是 ', { k: 'w', v: who }, ' 那一份');
return { s: s, t: p };
}
async function _ckBuildTrial() {
const here = typeof window.APP_VER === 'string' ? window.APP_VER : '';
const proto = String(location.protocol || '');
if (proto === 'file:') return _ckR('warn', '这样双击本地文件的：从来不比线上（这一页是 ', { k: 'w', v: here || '读不到' }, '）');
let online = '', manifest = '';
try { const j = await (await fetch('./version.json?ts=' + Date.now(), { cache: 'reload' })).json(); online = String(j.ver || ''); } catch (e) { return _ckR('bad', '问不到线上那一版（', { k: 'w', v: String((e && e.message) || e).slice(0, 40) }, '）'); }
try { const m = await (await fetch('./asset-manifest.json?ts=' + Date.now(), { cache: 'reload' })).json(); manifest = (m.files || []).join(' '); } catch (e) {}
const n = s => String(s || '').replace(/^v/, '');
const inName = n((manifest.match(/app\.v(\d+\.\d+\.\d+)/) || [])[1] || '');
const p = ['屏上 ', { k: 'b', v: here || '读不到' }, ' ∶ 线上 ', { k: 'b', v: online || '读不到' }];
if (inName) p.push(' ∶ 那两份文件叫 app.v' + inName);
if (n(here) && n(here) === n(online) && (!inName || inName === n(here))) {
p.push(' ∶ 是同一版');
if (window.__updChecked === undefined) p.push('（开屏那一次比版没跑完，这一发是当场重问的）');
return _ckR('ok', ...p);
}
return _ckR('bad', ...p, ' ∶ 对不上——彻底关掉浏览器再重开一次（缓存里那一版还在给你用）');
}
async function _ckFitTrial() {
if (!_ckCan('iosFitInp')) return CK_NOHOST('iosFitInp');
let inp = null;
try { inp = iosFitInp(); } catch (e) { return _ckR('bad', '这一行没跑完：', { k: 'w', v: String((e && e.message) || e) }); }
const wide = (inp && inp.wide) || [], small = (inp && inp.small) || [];
if (wide.length) return _ckR('bad', { k: 'b', v: wide.length + ' 枚超出屏幕右边' }, '（', { k: 'w', v: wide.join('∶') }, '）——这一族会把整页自动缩小');
if (small.length) return _ckR('warn', { k: 'b', v: small.length + ' 个输入框字不到 16px' }, '（', { k: 'w', v: small.join('∶') }, '）');
return _ckR('ok', '没有超出屏幕的东西 ∶ 看得见的输入框字都不小');
}
async function _ckNumTrial() {
if (!_ckCan('numInputText')) return CK_NOHOST('numInputText');
const cases = [['５０', '50'], ['１２３', '123'], ['2０', '20']];
const bad = cases.filter(c => { try { return numInputText(c[0]) !== c[1]; } catch (e) { return true; } });
const p = [];
let s = 'ok';
if (bad.length) {
s = 'bad';
p.push('全角键盘打的数认不出：' + bad.map(c => c[0]).join('∶') + '——填进去会被当成没填，格子自己弹回旧数');
} else {
p.push('全角键盘打的数认得出：５０→50 ∶ １２３→123 ∶ 混着打 2０→20');
}
if (typeof window.setNumSafe !== 'function') {
s = 'bad';
p.push(' ∶ 「你正敲着的那一格不被程序顶掉」的守卫也不在——想填 30 会被顶成 53');
} else if (s === 'ok') {
p.push(' ∶ 「你正敲着的那一格不被程序顶掉」的守卫也在');
}
p.push(' ∶ 填数的地方＝聊天设置∶信箱设置∶朋友圈设置∶收藏设置∶问问TA∶通话设置——哪一格填了照旧回弹，就按「反馈」报来');
return { s: s, t: p };
}
var CK_TRIALS = [
{ sec: '这台设备存不存得住', rows: [
{ id: 'store', k: '存一条试试', run: _ckStoreTrial },
{ id: 'backup', k: '这份备份能不能用', pick: true, cost: '只读不导入', run: _ckBackupText, goLabel: '挑一份来验' },
{ id: 'exp', k: '现在就导一份', cost: '本机存一份文件', run: async () => _ckExportTrial(), free: false },
{ id: 'img', k: '图片和头像能不能开', run: _ckImgTrial },
{ id: 'space', k: '占多少 ∶ 会不会被自动清掉', run: _ckSpaceTrial,
do: { label: '去要那一句', cost: '会弹一次授权', act: async () => {
if (typeof storageAct !== 'function') return CK_NOHOST('storageAct');
storageAct('persist');
return _ckR('warn', '已经问了：给没给要等浏览器答一句，再按一次上面那枚看结果');
} } }
] },
{ sec: '他说不说话', rows: [
{ id: 'reply', k: '真发一句，看他回不回', cost: '落一条·测完可撤', run: _ckReplyTrial },
{ id: 'words', k: '他那本字卡抽不抽得出话', run: _ckWordsTrial,
go: { view: 'cardfit', label: '看逐项那一屏' } },
{ id: 'voice', k: '真念一句给你听', cost: '先查库·不花额度', run: _ckVoiceTrial,
go: { tab: 'sound', fold: 'mx', hit: 'mxCheck', label: '去那一格查八道门' } },
{ id: 'active', k: '他会不会自己来找我', run: _ckActiveTrial,
go: { view: 'silent', label: '去那份名单' } }
] },
{ sec: '消息弹不弹给你看', rows: [
{ id: 'notify', k: '真弹一条系统通知', cost: '屏上会真出现一条', run: _ckNotifyTrial,
go: { tab: 'notify', fold: 'bg', hit: 'testNotify', label: '去那六步排障' } },
{ id: 'bg', k: '切后台还在不在跑', run: _ckBgTrial,
go: { tab: 'notify', fold: 'bg', hit: 'bgKeepAlive', label: '去这两枚开关' } }
] },
{ sec: '屏上这一套对不对', rows: [
{ id: 'css', k: '我改的气泡样式生没生效', run: () => _ckCssTrial('bubble'),
go: { view: 'apcss', label: '去改写那一段' } },
{ id: 'font', k: '我改的字体样式生没生效', run: () => _ckCssTrial('font'),
go: { view: 'fontcss', label: '去改写那一段' } },
{ id: 'num', k: '全角数字认不认得', run: _ckNumTrial },
{ id: 'build', k: '是不是线上那一版', cost: '发两发查版本', run: _ckBuildTrial },
{ id: 'fit', k: '屏上看看不看得见', run: _ckFitTrial }
] },
{ sec: 'AI 接口通不通', rows: [
{ id: 'bxconf', k: '配置齐不齐', run: _ckBxConf,
go: { view: 'bangxie', label: '去填那一页' } },
{ id: 'bxconn', k: '能不能连通 ∶ Key 认不认', cost: '只读模型名单', run: _ckBxConn },
{ id: 'bxgate', k: '两道总闸各开着没有', run: _ckBxGate,
go: { view: 'bangxie', label: '去那两枚开关' } },
{ id: 'bxtry', k: '真写一张', cost: '会花一次额度', run: _ckBxTry }
] }
];
function _ckBxConf() {
if (typeof bxCfg !== 'function') return CK_NOHOST('bxCfg');
const c = bxCfg();
const api = (typeof _bxApiEditCfg === 'function') ? _bxApiEditCfg() : c.api;
const miss = [];
if (!api.base) miss.push('地址');
if (!api.model) miss.push('模型');
const head = '帮写总开关' + (c.on ? '开着' : '关着（关着＝全站零请求，出厂如此不算问题）')
+ ' ∶ 地址' + (api.base ? '填了' : '没填')
+ ' ∶ Key' + (String(api.key || '').trim() ? '填了' : '没填（本地 Ollama 可以不填）')
+ ' ∶ 模型' + (api.model ? '是 ' + api.model : '没填');
if (miss.length) return _ckR('bad', head, '。缺 ' + miss.join('与') + '：去「更多 → 帮写字卡 → 接口」补上');
return _ckR('ok', head);
}
async function _ckBxConn() {
if (typeof _bxFetchJSON !== 'function' || typeof _bxModelsURLs !== 'function') return CK_NOHOST('帮写那套传输（js/bangxie.js）');
const api = (typeof _bxApiEditCfg === 'function') ? _bxApiEditCfg() : bxCfg().api;
try {
let ids = [], lastErr = null;
for (const u of _bxModelsURLs(api)) {
try {
const j = await _bxFetchJSON(u, null, { api });
ids = (typeof _bxModelIds === 'function') ? _bxModelIds(j) : [];
if (ids.length) break;
} catch (e) {
if (!(api.kind === 'minimax' && e && (e.status === 404 || e.status === 405))) throw e;
lastErr = e;
}
}
if (ids.length) return _ckR('ok', '连上了，Key 被这个接口认下来；它报了 ' + ids.length + ' 个模型');
if (lastErr && api.kind === 'minimax') return _ckR('warn', '几个名单口都问了都没有（最后：' + lastErr.message + '）不算失败；模型照内置候选填，直接按「真写一张」');
return _ckR('warn', '连上了，但没读到模型名单（这一档不判失败）；模型照手填的用，可以按下面那发「真写一张」');
} catch (e) {
return _ckR('bad', (typeof _bxWhy === 'function') ? _bxWhy(e, api) : String((e && e.message) || e));
}
}
function _ckBxGate() {
if (typeof bxCfg !== 'function') return CK_NOHOST('bxCfg');
if (typeof aidvCfg !== 'function') return CK_NOHOST('aidvCfg');
const bx = bxCfg().on;
const av = aidvCfg().on === true;
const tail = (bx || av) ? '' : '。两道都关＝哪一面都不会发请求；要用哪面就到「更多 → 帮写字卡」开哪面';
return _ckR((bx || av) ? 'ok' : 'warn',
'帮写总开关' + (bx ? '开着' : '关着') + ' ∶ 占卜的「AI 解读」' + (av ? '开着' : '关着') + '（两道各管各的面）' + tail);
}
async function _ckBxTry() {
if (typeof bxTryQuiet !== 'function') return CK_NOHOST('bxTryQuiet');
try {
const r = await bxTryQuiet();
return _ckR('ok', '写出来了：「' + (r.text || '') + '」', (r.usage && r.usage.all) ? { k: 'w', v: '（用量 ' + r.usage.in + '/' + r.usage.out + ' tokens）' } : '');
} catch (e) {
if (e && e.busy) return _ckR('warn', String(e.message || e));
return _ckR('bad', (typeof _bxWhy === 'function') ? _bxWhy(e) : String((e && e.message) || e));
}
}
async function _ckExportTrial() {  const btn = document.getElementById('exportAll');
if (!btn) return CK_NOHOST('设置 → 数据 里那枚「导出全部数据」');
let last = 0;
try { last = Number(localStorage.getItem('lastBackupAt')) || 0; } catch (e) {}
btn.click();
await new Promise(res => setTimeout(res, 1200));
let now = 0;
try { now = Number(localStorage.getItem('lastBackupAt')) || 0; } catch (e) {}
if (now && now !== last) return _ckR('ok', '已经交出去了（这一刻起「多久没备份」那一笔重新起算）——文件名 言字卡-全部数据.json');
return _ckR('warn', '按下去了，但没看见「存下来了」那一笔：这台设备可能弹了一个保存框等你选地方');
}
function _ckPickFile() {
return new Promise(res => {
const inp = document.getElementById('ckFile');
if (!inp) { res({ raw: '' }); return; }
inp.onchange = () => {
const f = inp.files && inp.files[0];
if (!f) { res({ raw: '' }); return; }
const fr = new FileReader();
fr.onload = () => res({ raw: String(fr.result || ''), name: f.name });
fr.onerror = () => res({ raw: '' });
try { fr.readAsText(f); } catch (e) { res({ raw: '' }); }
};
inp.click();
});
}
async function _ckRun(row) {
if (_ckBusy[row.id]) return;
_ckBusy[row.id] = 1;
_ckNote = '';
renderCheckPage();
let r;
try {
const arg = row.pick ? await _ckPickFile() : undefined;
r = await row.run(arg);
} catch (e) { r = _ckR('bad', '这一行没跑完：', { k: 'w', v: String((e && e.message) || e).slice(0, 90) }); }
_ckBusy[row.id] = 0;
_ckRes[row.id] = r || _ckR('bad', '这一行什么都没回');
renderCheckPage();
}
async function _ckDo(row, spec) {
if (!spec || _ckBusy[row.id]) return;
_ckBusy[row.id] = 1;
_ckNote = '';
renderCheckPage();
let r;
try { r = await spec.act(); } catch (e) { r = _ckR('bad', '这一发没跑完：', { k: 'w', v: String((e && e.message) || e).slice(0, 90) }); }
_ckBusy[row.id] = 0;
_ckRes[row.id] = r || _ckR('ok', '按下去了');
renderCheckPage();
}
async function _ckRunAll() {
if (_ckBusy.__all) return;
_ckBusy.__all = 1;
_ckNote = '';
renderCheckPage();
const rows = CK_TRIALS.reduce((a, s) => a.concat(s.rows), []).filter(r => CK_FREE.indexOf(r.id) >= 0);
for (const row of rows) {
_ckBusy[row.id] = 1; renderCheckPage();
try { _ckRes[row.id] = (await row.run()) || _ckR('bad', '这一行什么都没回'); }
catch (e) { _ckRes[row.id] = _ckR('bad', '这一行没跑完：', { k: 'w', v: String((e && e.message) || e).slice(0, 90) }); }
_ckBusy[row.id] = 0; renderCheckPage();
}
_ckBusy.__all = 0;
_ckAt = Date.now();
const firstBad = CK_ALL().find(r => (_ckRes[r.id] || {}).s === 'bad');
_ckNote = firstBad ? '· 已翻到第一处不通' : '';
renderCheckPage();
if (firstBad) {
const el = document.querySelector('.ckx-row[data-ck-row="' + firstBad.id + '"]');
if (el) { try { el.scrollIntoView({ block: 'center' }); } catch (e) {} }
}
}
var CK_ALL = () => CK_TRIALS.reduce((a, s) => a.concat(s.rows), []);
function checkText() {
const rows = CK_ALL();
const bad = rows.filter(r => (_ckRes[r.id] || {}).s === 'bad').length, warn = rows.filter(r => (_ckRes[r.id] || {}).s === 'warn').length;
const untried = rows.filter(r => !_ckRes[r.id]).length;
const L = [];
L.push('=== 言字卡 · 检测功能 ===');
L.push('版号 ' + (window.APP_VER || '（读不到）') + ' · ' + new Date().toLocaleString('zh-CN'));
L.push('试过 ' + (rows.length - untried) + ' 发 ∶ 不通 ' + bad + ' ∶ 要看 ' + warn + ' ∶ 还没试 ' + untried + '（没试不等于没问题）');
const o = typeof currentContact === 'function' ? currentContact() : null;
L.push('现在这位：' + (o ? (o.name || o.id) : '（没选中会话）'));
L.push('机型：' + String(navigator.userAgent || ''));
CK_TRIALS.forEach(sec => {
L.push('');
L.push('【' + sec.sec + '】');
sec.rows.forEach(r => {
const x = _ckRes[r.id];
L.push(CK_MARK[x ? x.s : 'none'] + ' ' + r.k + '：' + (x ? _ckTxt(x.t) : '没试'));
});
});
return L.join('\n');
}
function _ckBtns(row) {
const out = [];
const r = _ckRes[row.id];
const busy = !!_ckBusy[row.id];
if (!row.pick) out.push({ k: 'run', label: busy ? '正在跑…' : (r ? '再试一次' : '试一下'), cost: row.cost || '', dis: busy });
if (row.pick) out.push({ k: 'file', label: row.goLabel || '挑一份来验', cost: row.cost || '', dis: busy });
if (!busy && row.do && (!r || r.s !== 'ok')) out.push({ k: 'do', label: row.do.label, cost: row.do.cost || '' });
if (!busy && r && r.pay) out.push({ k: 'pay', label: r.pay.label });
if (!busy && r && r.undo) out.push({ k: 'undo', label: r.undo.label });
if (!busy && r && r.keep) out.push({ k: 'keep', label: r.keep.label });
if (!busy && r && r.ask) { out.push({ k: 'seen1', label: '看见了' }); out.push({ k: 'seen0', label: '没看见' }); }
if (!busy && row.go) out.push({ k: 'go', label: row.go.label });
return out;
}
function renderCheckPage() {
const host = document.getElementById('ckBody');
if (!host) return;
const rows = CK_ALL();
const untried = rows.filter(r => !_ckRes[r.id]).length;
const bad = rows.filter(r => (_ckRes[r.id] || {}).s === 'bad').length, warn = rows.filter(r => (_ckRes[r.id] || {}).s === 'warn').length;
const sum = document.getElementById('ckSum');
if (sum) sum.innerHTML = _ckBusy.__all
? '正在一发一发跑（不要代价的那几发，一两秒）…'
: (untried === rows.length
? '还没有一发跑过。'
: '跑过 ' + (rows.length - untried) + ' 发 ∶ ' + (bad ? '<b>' + bad + '</b> 发不通' : '没有不通的') + ' ∶ ' + warn + ' 发要看' + (untried ? ' ∶ 还有 ' + untried + ' 发没试' : '') + _ckNote);
const run = document.getElementById('ckRun');
if (run) { run.textContent = _ckBusy.__all ? '正在跑…' : '把不要代价的都跑一遍'; run.disabled = !!_ckBusy.__all; }
host.innerHTML = CK_TRIALS.map(sec => {
const b = sec.rows.filter(r => (_ckRes[r.id] || {}).s === 'bad').length;
return '<div class="fit-sec"><div class="fit-sec-h">' + escapeHTML(sec.sec)
+ '<span class="fit-sec-sub">' + (b ? b + ' 发不通' : sec.rows.length + ' 发') + '</span></div><div class="fit-items ckx-sec">'
+ sec.rows.map(row => {
const r = _ckRes[row.id];
const s = r ? (r.s || 'none') : 'none';
const txt = r ? '<div class="fit-item-t">' + _ckHtml(r.t) + '</div>' : '';
const btns = _ckBtns(row).map(x => '<button type="button" class="soft-btn ckx-btn' + (x.k === 'run' && s === 'bad' ? ' ckx-btn-warn' : '') + '" data-ck="' + escapeHTML(row.id) + '" data-ck-k="' + x.k + '"' + (x.dis ? ' disabled' : '') + '>' + escapeHTML(x.label) + (x.cost ? '<i>' + escapeHTML(x.cost) + '</i>' : '') + '</button>').join('');
return '<div class="ckx-row ckx-s-' + s + '" data-ck-row="' + escapeHTML(row.id) + '">'
+ '<div class="fit-item"><div class="ckx-head"><span class="fit-item-k">' + escapeHTML(row.k)
+ '</span><span class="fit-item-lv">' + (CK_LABEL[s] || '没试') + '</span></div>'
+ txt + '</div>'
+ (btns ? '<div class="ckx-btns">' + btns + '</div>' : '') + '</div>';
}).join('') + '</div></div>';
}).join('');
}
async function _ckClick(e) {
const btn = e.target.closest ? e.target.closest('.ckx-btn') : null;
if (!btn) return;
const id = btn.getAttribute('data-ck'), k = btn.getAttribute('data-ck-k');
const row = CK_ALL().find(r => r.id === id);
if (!row) return;
if (k === 'run' || k === 'file') { await _ckRun(row); return; }
if (k === 'do') { await _ckDo(row, row.do); return; }
const r = _ckRes[id] || {};
if (k === 'pay') { await _ckDo(row, r.pay); return; }
if (k === 'undo') { await _ckDo(row, r.undo); return; }
if (k === 'keep') { await _ckDo(row, r.keep); return; }
if (k === 'seen1' || k === 'seen0') { _ckRes[id] = await _ckNotifySeen(k === 'seen1'); renderCheckPage(); return; }
if (k === 'go') {
const g = row.go;
if (g.view) { try { showView(g.view); } catch (x) {} return; }
if (g.tab) { _ckGo(g.tab, g.fold, g.hit); return; }
}
}
async function _ckCopyNow() {
const txt = checkText();
const ok = await copyTextToClipboard(txt);
try { showToast(ok ? '已复制这一屏（没试过的行也一起抄走了）' : '没复制成：这台设备不给剪贴板·长按这一段选中复制，或去 设置 → 数据 → 诊断信息 导出一份'); } catch (e) {}
}
(function _ckBoot() {
const run = document.getElementById('ckRun'), cp = document.getElementById('ckCopy'), body = document.getElementById('ckBody');
if (run) run.addEventListener('click', _ckRunAll);
if (cp) cp.addEventListener('click', _ckCopyNow);
if (body) body.addEventListener('click', _ckClick);
})();
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['pages'] = true;
