// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var CJ_PRESENCE = {
near:   { label: '很近',     desc: '感觉就在身边' },
nearby: { label: '附近',     desc: 'TA 可能就在附近' },
far:    { label: '遥远',     desc: '能感觉到，但距离很远' },
unfelt: { label: '感觉不到', desc: '暂时无法感知 TA' },
gone:   { label: '离开',     desc: 'TA 暂时不在附近' }
};
var CJ_DIR = {
f:    { label: '正前方', arrow: '↑' },
fr:   { label: '右前方', arrow: '↗' },
r:    { label: '右侧',   arrow: '→' },
br:   { label: '右后方', arrow: '↘' },
b:    { label: '后方',   arrow: '↓' },
bl:   { label: '左后方', arrow: '↙' },
l:    { label: '左侧',   arrow: '←' },
fl:   { label: '左前方', arrow: '↖' },
side: { label: '身边' },
none: { label: '无法判断' }
};
var CJ_DIR_RING = [
{ k: 'f',  deg: -90 }, { k: 'fr', deg: -45 }, { k: 'r', deg: 0 },  { k: 'br', deg: 45 },
{ k: 'b',  deg: 90 },  { k: 'bl', deg: 135 }, { k: 'l', deg: 180 }, { k: 'fl', deg: 225 }
];
function _cjDirWeights(p) {
if (p === 'near')   return { f: 10, fr: 10, r: 10, br: 10, b: 10, bl: 10, l: 10, fl: 10, side: 20, none: 0 };
if (p === 'nearby') return { f: 8, fr: 8, r: 8, br: 8, b: 8, bl: 8, l: 8, fl: 8, side: 16, none: 20 };
if (p === 'far')    return { f: 2, fr: 2, r: 2, br: 2, b: 2, bl: 2, l: 2, fl: 2, side: 4, none: 76 };
return { none: 100 };
}
function _cjRollDir(p) { return _cjPickWeighted(_cjDirWeights(p)); }
var CJ_ACTIVITY = {
free:    { label: '空闲', desc: '现在比较适合交流' },
busy:    { label: '忙碌', desc: 'TA 手头有点事，不一定是在忙正事' },
rushed:  { label: '忙着', desc: '暂时不太方便' },
rest:    { label: '休息', desc: 'TA 正在休息' },
sleep:   { label: '睡着', desc: 'TA 那边已经入睡' },
unknown: { label: '未知', desc: '暂时不知道 TA 在做什么' }
};
var CJ_ACTIVITY_MUL = { free: 0.7, busy: 1.6, rushed: 2.6, rest: 1.3, sleep: 6, unknown: 1 };
var CJ_ACTIVITY_NR = { free: 0.5, busy: 1.8, rushed: 2.2, rest: 1.4, sleep: 3, unknown: 1 };
var CJ_DO = {
idle_blank: { a: ['free'],   label: '发呆',    w: 24, mul: 0.85, nr: 0.75, say: '坐着发呆，没在想什么' },
idle_phone: { a: ['free'],   label: '刷手机',  w: 22, mul: 0.95, nr: 0.85, say: '手机在手里，滑来滑去' },
idle_you:   { a: ['free'],   label: '想你',    w: 18, mul: 0.65, nr: 0.55, say: '什么也没做，就是在想你' },
idle_chore: { a: ['free'],   label: '弄点小事', w: 20, mul: 1.20, nr: 1.15, say: '在屋里收一收，一会儿就完' },
idle_out:   { a: ['free'],   label: '在外面',  w: 16, mul: 1.35, nr: 1.35, say: '在外头溜达，没什么急事' },
busy_work:  { a: ['busy'],   label: '真有事',  w: 26, mul: 1.25, nr: 1.30, say: '手上真有点事，回得慢，不是不回' },
busy_pet:   { a: ['busy'],   label: '贴贴',    w: 20, mul: 0.60, nr: 0.40, say: '正赖在你旁边，别的事都排后了' },
busy_rest:  { a: ['busy'],   label: '想休息',  w: 14, mul: 1.15, nr: 1.10, say: '撑着呢，心里已经想躺了' },
busy_fake:  { a: ['busy'],   label: '装忙',    w: 14, mul: 1.50, nr: 0.50, say: '其实在装忙，想等你先找我' },
busy_run:   { a: ['busy'],   label: '跑腿',    w: 12, mul: 1.20, nr: 1.20, say: '在外面跑一趟，脚没停' },
busy_zone:  { a: ['busy'],   label: '发呆',    w: 8,  mul: 0.85, nr: 0.70, say: '上着班神游，脑子放空' },
busy_think: { a: ['busy'],   label: '思考',    w: 6,  mul: 1.10, nr: 1.00, say: '脑子里正过一件事，慢一点' },
rush_hand:  { a: ['rushed'], label: '手忙',    w: 38, mul: 1.00, nr: 1.00, say: '两只手都占着，只能先应你一句' },
rush_dead:  { a: ['rushed'], label: '赶时间',  w: 32, mul: 1.35, nr: 1.50, say: '在赶一个点，过了这阵就好' },
rush_meet:  { a: ['rushed'], label: '应酬',    w: 30, mul: 1.15, nr: 1.30, say: '人在一桌人中间，心不在这儿' },
rest_lying: { a: ['rest'],   label: '躺着',    w: 38, mul: 0.80, nr: 0.80, say: '躺着没动，眼睛也没睁开' },
rest_nap:   { a: ['rest'],   label: '打盹',    w: 32, mul: 1.30, nr: 1.50, say: '迷糊了一会儿，半睡半醒' },
rest_music: { a: ['rest'],   label: '听歌',    w: 30, mul: 0.85, nr: 0.75, say: '戴着耳机听歌，脑子里是你' },
sleep:      { a: ['sleep'],  label: '睡了',    w: 100, mul: 1, nr: 1, flat: true, say: '我这边睡着了，醒过来第一件事是找你' },
unknown:    { a: ['unknown'], label: '说不清', w: 100, mul: 1, nr: 1, flat: true, say: '说不清我在做什么，反正没走' }
};
var CJ_SHICHEN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
var CJ_TIMEPART = {
wee:       { label: '凌晨', from: 0,  note: 'TA 那边是凌晨了' },
dawn:      { label: '清晨', from: 5,  note: 'TA 那边的清晨' },
morning:   { label: '上午', from: 8,  note: 'TA 那边是上午' },
noon:      { label: '午后', from: 12, note: 'TA 那边的午后' },
afternoon: { label: '下午', from: 14, note: 'TA 那边是下午' },
evening:   { label: '傍晚', from: 18, note: 'TA 那边的傍晚' },
night:     { label: '夜里', from: 21, note: 'TA 那边是夜里' }
};
var CJ_TIMEPART_ORDER = ['wee', 'dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'];
function _cjTimePartOf(en) {
const h = _cjWorldHour(en);
let k = 'wee';
for (const x of CJ_TIMEPART_ORDER) if (h >= CJ_TIMEPART[x].from) k = x;
return k;
}
function _cjTimeNote(en) {
const part = _cjTimePartOf(en);
let t = CJ_TIMEPART[part].note;
const asleep = en.a === 'sleep';
if ((part === 'night' || part === 'wee') && !asleep) t += '，这个点了还醒着';
else if (part !== 'night' && part !== 'wee' && asleep) t += '，这个点在睡';
return t;
}
var CJ_WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];
function _cjWorldDateLabel(en) {
const d = _cjWorldDate(en);
return (d.getMonth() + 1) + '月' + d.getDate() + '日 · 星期' + CJ_WEEK_CN[d.getDay()];
}
var CJ_MOODS = {
joy:       { label: '雀跃',     desc: '心情很好，说话都轻' },
soft:      { label: '柔软',     desc: '软软的，想挨着你' },
calm:      { label: '平静',     desc: '中性档 · 不是没有情绪' },
low:       { label: '低落',     desc: '有点提不起劲' },
irritable: { label: '烦躁',     desc: '坐不住，想缓一缓' },
hot:       { label: '燥热',     desc: '身上发热，不是心情的事' },
ache:      { label: '不舒服',   desc: '身上有点不对' },
flustered: { label: '心慌',     desc: '心跳有点乱' },
wronged:   { label: '委屈',     desc: '有一点委屈' },
tired:     { label: '累',       desc: '累了一天，脑子转得慢' },
sleepy:    { label: '困',       desc: '困得睁不开眼' },
numb:      { label: '没劲',     desc: '不是难过，是提不起力气' },
mute:      { label: '不想说话', desc: '这会儿不想开口' },
away:      { label: '走神',     desc: '人在，心飘走了一会儿' },
miss:      { label: '想念',     desc: '想见你，就现在' },
blank:     { label: '淡淡的',   desc: '说不上好也说不上不好' }
};
var CJ_MOOD_ORDER = ['joy', 'soft', 'calm', 'low', 'irritable', 'hot', 'ache', 'flustered',
'wronged', 'tired', 'sleepy', 'numb', 'mute', 'away', 'miss', 'blank'];
var CJ_MOOD_W = {
joy: 8, soft: 10, calm: 16, low: 6, irritable: 6, hot: 4, ache: 5, flustered: 3,
wronged: 4, tired: 7, sleepy: 5, numb: 4, mute: 5, away: 4, miss: 8, blank: 5
};
function _cjMoodRoll(cur) {
const w0 = (cur && CJ_MOOD_W[cur]) ? Object.assign({}, CJ_MOOD_W) : CJ_MOOD_W;
if (w0 !== CJ_MOOD_W) w0[cur] *= 1.6;
const a = _cjPickWeighted(w0);
if (a === 'calm') return ['calm', ''];
const w = {};
for (const k of CJ_MOOD_ORDER) if (k !== 'calm' && k !== a) w[k] = CJ_MOOD_W[k];
return [a, _cjPickWeighted(w)];
}
function _cjMoodPairLabel(a, b) {
const la = (CJ_MOODS[a] || CJ_MOODS.calm).label;
return b && CJ_MOODS[b] ? la + ' · ' + CJ_MOODS[b].label : la;
}
function _cjMood2(primary, second) {
return primary !== 'calm' && second && second !== 'calm' && CJ_MOODS[second] && second !== primary ? second : '';
}
var CJ_SG = {
on:   { label: '软着', desc: '语气软着，等你接一句' },
some: { label: '有一点', desc: '绕了一下，没直说' },
flat: { label: '平常',   desc: '中性档 · 不是没有' },
none: { label: '读不到', desc: '这一会儿感应不到' }
};
var CJ_SG_ORDER = ['on', 'some', 'flat', 'none'];
var CJ_SG_W = { on: 16, some: 22, flat: 36, none: 26 };
var CJ_BT = {
hit:  { label: '心口一热', desc: '离你近一点就想碰你' },
some: { label: '有点痒', desc: '动了一下，没到要说出口' },
flat: { label: '平平的', desc: '中性档 · 不是没有' },
none: { label: '没去留意', desc: '这一会儿没顾上感觉心口' }
};
var CJ_BT_ORDER = ['hit', 'some', 'flat', 'none'];
var CJ_BT_W = { hit: 14, some: 24, flat: 40, none: 22 };
var CJ_BT_MIN_MIN = 60, CJ_BT_MAX_MIN = 180;
var CJ_UND = {
got:   { label: '一说就懂' },
flat:  { label: '都听见了' },
half:  { label: '猜了一半' },
slip:  { label: '词没对上' },
again: { label: '想再说一遍' }
};
var CJ_UND_ORDER = ['got', 'flat', 'half', 'slip', 'again'];
var CJ_UND_W = { got: 26, flat: 24, half: 22, slip: 16, again: 12 };
var CJ_UND_MIN_MIN = 50, CJ_UND_MAX_MIN = 140;
var CJ_NG = {
clear:     { label: '没被什么占着', to: '' },
outer:     { label: '手边有东西',   to: '' },
taMood:    { label: '那边的情绪',   to: '情绪感知卡 · TA 那一组' },
taState:   { label: '那边的事情',   to: '世界感知卡 · 此刻那一格' },
yourState: { label: '你这头的事',   to: '情绪感知卡 · 你那一组' }
};
var CJ_NG_ORDER = ['clear', 'outer', 'taMood', 'taState', 'yourState'];
var CJ_NG_W = { clear: 42, outer: 15, taMood: 15, taState: 14, yourState: 14 };
var CJ_NG_MIN_MIN = 30, CJ_NG_MAX_MIN = 90;
var CJ_READ = {
bright: { label: '有劲',       desc: '状态不错，说话有精神' },
steady: { label: '跟平时一样', desc: 'TA 没读出什么异样' },
tired:  { label: '有点累',     desc: '像是没睡够' },
raw:    { label: '有点烦',     desc: '不太想绕' },
needy:  { label: '想说话',     desc: '像是憋着话，想找 TA' },
quiet:  { label: '想静静',     desc: '有点往后收，但不是躲' },
unk:    { label: '读不出',     desc: 'TA 够不着你的那一段时间' }
};
var CJ_READ_W = { bright: 11, steady: 24, tired: 14, raw: 12, needy: 13, quiet: 12, unk: 14 };
var CJ_CONN_LEVELS = [
{ k: 'hot',     label: '热线',   desc: '你一句我一句，接得住' },
{ k: 'smooth',  label: '通畅',   desc: '你发一句，TA 接得住' },
{ k: 'normal',  label: '平常',   desc: '有来有回，只是这一句还没接' },
{ k: 'slow',    label: '慢半拍', desc: 'TA 会回，只是这轮隔得比平时久' },
{ k: 'oneWay',  label: '单向',   desc: '这一阵只有一边在说' }
];
var CJ_SHICHEN_START = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
var CJ_HIDE_PROB_DEF = 10, CJ_HIDE_WAKE_DEF = 55;
var CJ_HIDE_FIRST_MIN = 40, CJ_HIDE_FIRST_MAX = 90;
var CJ_HIDE_GAP_MIN = 120, CJ_HIDE_GAP_MAX = 360;
var CJ_HIDE_COOL_MIN = 60;
var CJ_HIDE_SPANS = [
{ k: 'quiet', label: '想安静一会儿', note: '不想被看见。',              lo: 15,  hi: 35,  w: 55 },
{ k: 'tired', label: '有点累',       note: '暂时不想解释自己在做什么。', lo: 40,  hi: 120, w: 33 },
{ k: 'away',  label: '去了别处',     note: '没打算让人找到。',          lo: 120, hi: 360, w: 12 }
];
var CJ_PERCEIVE_PROB = { p: 70, a: 35, s: 45 };
var CJ_HIDE_EYE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12.5c2.2-2.6 5-4 8.5-4s6.3 1.4 8.5 4"/><path d="M6.2 14.8 4.8 17M12 15.2V18M17.8 14.8l1.4 2.2"/></svg>';
var CJ_TABS = [
{ k: 'state', name: '状态', cards: ['now', 'dir', 'conn', 'mood'] },
{ k: 'world', name: '世界', cards: ['time', 'today'] },
{ k: 'log',   name: '记录', cards: ['moodstrip', 'hist'] }
];
var CJ_TAB_KEY = 'ordinal-cjian-tab';
var _cjTab = 'state';
try { const _tv = localStorage.getItem(CJ_TAB_KEY); if (CJ_TABS.some(t => t.k === _tv)) _cjTab = _tv; } catch (e) {}
var _cjSel = '';
var _cjSelPinned = '';
var _cjLastApproach = 0;
var _cjPerceiveCd = 0;
var _cjEvCd = 0;
function _cjPad(n) { return (n < 10 ? '0' : '') + n; }
function _cjRi(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
function _cjShichenAt(hour) { return Math.floor(((hour + 1) % 24) / 2); }
function _cjEsc(v) { return escapeHTML(String(v == null ? '' : v)); }
function _cjRoot() { if (!data.cjian || typeof data.cjian !== 'object') data.cjian = { enabled: true, moodOn: true, sgOn: true, by: {} }; if (!data.cjian.by || typeof data.cjian.by !== 'object') data.cjian.by = {}; return data.cjian; }
function _cjContact(cid) { return (data.contacts || []).find(x => x.id === cid) || null; }
function _cjDeliver(msg, cid, line) {
msg.src = 'cjian';
if (line) msg.cjLine = line;
return _deliverToChat(msg, cid);
}
function _cjSingles() { return (data.contacts || []).filter(x => x.kind !== 'group'); }
function _cjIsGroup(cid) { const c = _cjContact(cid); return !!c && c.kind === 'group'; }
function _cjRollOffset() {
let v = _cjRi(10, 540) * (Math.random() < 0.5 ? -1 : 1);
if (v % 60 === 0) v += 17;
return v;
}
function _cjEntry(cid) {
const root = _cjRoot();
const now = Date.now();
if (!root.by[cid] || typeof root.by[cid] !== 'object') {
const mo0 = _cjMoodRoll();
const say0 = _cjMoodSay(mo0[0]);
const mr0 = _cjMoodRoll();
const rd0 = _cjPickWeighted(CJ_READ_W);
const rdSay0 = _cjReadSay(rd0);
root.by[cid] = { offsetMin: _cjRollOffset(), world: { hh: 0, mm: 0, last: 0, next: 0 },
p: 'nearby', sinceP: now,
dir: _cjRollDir('nearby'), sinceD: now,
a: 'free', sinceA: now,
status: '', sinceS: now, hist: [],
mo: mo0[0], mo2: mo0[1], sinceMo: now, cdMo: _cjRi(25, 70) * 60000, moSay: say0, moSayTs: say0 ? now : 0,
sg: _cjPickWeighted(CJ_SG_W), sinceSg: now, cdSg: _cjRi(15, 40) * 60000,
rd: rd0, sinceRd: now, cdRd: _cjRi(25, 70) * 60000, rdSay: rdSay0, rdSayTs: rdSay0 ? now : 0,
moRead: mr0[0], moRead2: mr0[1], sinceMoRead: now, cdMoRead: _cjRi(45, 110) * 60000,
bt: _cjPickWeighted(CJ_BT_W), btRead: _cjPickWeighted(CJ_BT_W), sinceBt: now, cdBt: _cjRi(CJ_BT_MIN_MIN, CJ_BT_MAX_MIN) * 60000,
un: _cjPickWeighted(CJ_UND_W), unYou: _cjPickWeighted(CJ_UND_W), sinceUn: now, cdUn: _cjRi(CJ_UND_MIN_MIN, CJ_UND_MAX_MIN) * 60000,
ng: _cjPickWeighted(CJ_NG_W), sinceNg: now, cdNg: _cjRi(CJ_NG_MIN_MIN, CJ_NG_MAX_MIN) * 60000,
sayNext: 0, spoken: [],
hideAt: 0, hideUntil: 0, hideWhy: '', hideTry: 0, hideNext: 0, hideEnd: 0,
weather: null };
}
const en = root.by[cid];
if (typeof en.offsetMin !== 'number' || !en.offsetMin) { en.offsetMin = _cjRollOffset(); save(); }
if (!CJ_DIR[en.dir]) { en.dir = _cjRollDir(CJ_PRESENCE[en.p] ? en.p : 'nearby'); en.sinceD = now; save(); }
if (!en.avK || !CJ_DO[en.avK]) {
const act0 = (en.a && CJ_ACTIVITY[en.a]) ? en.a : 'free';
en.avK = _cjRollDo(act0);
en.av = _cjDoSay(en.avK, act0, true);
save();
}
if (!en.status) { const s0 = _cjPickStatus(en); if (s0) { en.status = s0; en.sinceS = now; save(); } }
return en;
}
function _cjActOf(cid) {
const by = data.cjian && data.cjian.by;
const en = by ? by[cid] : null;
return (en && en.a && CJ_ACTIVITY[en.a]) ? en.a : '';
}
function _cjDoKeyOf(en) {
if (!en || !en.a || !CJ_ACTIVITY[en.a]) return '';
const k = en.avK;
if (!k || !CJ_DO[k]) return '';
return CJ_DO[k].a.indexOf(en.a) >= 0 ? k : '';
}
function _cjRollDo(actKey) {
if (CJ_DO[actKey] && CJ_DO[actKey].flat) return actKey;
const w = {};
for (const k in CJ_DO) if (CJ_DO[k].a.indexOf(actKey) >= 0) w[k] = CJ_DO[k].w;
return Object.keys(w).length ? _cjPickWeighted(w) : '';
}
function _cjCardsOf(g) {
return ((g && g.cards) || []).filter(c => { const t = cardText(c); return t && !voiceCardParts(t) && !cardIsOff(g, c); });
}
function _cjDoSay(famKey, actKey, allowBuiltin) {
const d = CJ_DO[famKey];
if (!d || !CJ_ACTIVITY[actKey]) return '';
const g = (data.groups || []).find(x => (x.name || '') === '此刻在做的话' && (x.category || '主字卡') === 'TA心里话' && !x.off);
const cards = _cjCardsOf(g).map(c => c.trim());
const own = cards.filter(c => c.indexOf(CJ_ACTIVITY[actKey].label + '·' + d.label + '：') === 0);
if (own.length) return own[Math.floor(Math.random() * own.length)].slice((CJ_ACTIVITY[actKey].label + '·' + d.label + '：').length).trim();
const gen = cards.filter(c => c.indexOf(CJ_ACTIVITY[actKey].label + '：') === 0 && c.indexOf('·') < 0);
if (gen.length) return gen[Math.floor(Math.random() * gen.length)].slice((CJ_ACTIVITY[actKey].label + '：').length).trim();
return allowBuiltin ? (d.say || '') : '';
}
function _cjDoText(en) {
const act = (en && en.a && CJ_ACTIVITY[en.a]) ? en.a : 'free';
if (act === 'sleep' || act === 'unknown') return '';
const k = _cjDoKeyOf(en);
if (!k) return '';
const cur = typeof en.av === 'string' ? en.av : '';
return cur || _cjDoSay(k, act, true);
}
function _cjDoMulOf(cid, tbl) {
const by = data.cjian && data.cjian.by;
const en = by ? by[cid] : null;
const k = _cjDoKeyOf(en);
const v = k ? CJ_DO[k][tbl] : 1;
return (typeof v === 'number' && v > 0) ? v : 1;
}
function cjActivityMul(cid, bh) {
if (bh && bh.asByState === false) return 1;
const base = CJ_ACTIVITY_MUL[_cjActOf(cid)];
const b = (typeof base === 'number' && base > 0) ? base : 1;
const mul = b * _cjDoMulOf(cid, 'mul');
return (typeof mul === 'number' && mul > 0) ? mul : 1;
}
function cjActivityNrMul(cid, bh) {
if (bh && bh.rnByState === false) return 1;
const base = CJ_ACTIVITY_NR[_cjActOf(cid)];
const b = (typeof base === 'number' && base > 0) ? base : 1;
const mul = b * _cjDoMulOf(cid, 'nr');
return (typeof mul === 'number' && mul > 0) ? mul : 1;
}
function _cjEnsureAll() {
const by = _cjRoot().by;
_cjSingles().forEach(c => { if (c && c.id && !by[c.id]) _cjEntry(c.id); });
}
var CJ_WEATHER = { sunny: '晴', cloudy: '多云', rain: '雨', wind: '风', snow: '雪' };
function _cjOffsetMin(en) { const v = en && en.offsetMin; return (typeof v === 'number' && isFinite(v)) ? Math.max(-1440, Math.min(1440, Math.round(v))) : 0; }
function _cjWorldDate(en) { return new Date(Date.now() + _cjOffsetMin(en) * 60000); }
function _cjDayKey(d) { return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function _cjEnsureWeather(en) {
const key = _cjDayKey(_cjWorldDate(en));
if (!en.weather || en.weather.day !== key || !CJ_WEATHER[en.weather.k]) {
const m = _cjWorldDate(en).getMonth();
let pool = [['sunny', 38], ['cloudy', 26], ['rain', 20], ['wind', 12]];
if (m >= 11 || m <= 1) pool = [['sunny', 34], ['cloudy', 24], ['snow', 20], ['wind', 14], ['rain', 4]];
else if (m >= 6 && m <= 8) pool = [['sunny', 34], ['cloudy', 22], ['rain', 30], ['wind', 6]];
const total = pool.reduce((s, x) => s + x[1], 0);
let rr = Math.random() * total, k = 'sunny';
for (const [kk, w] of pool) { rr -= w; if (rr < 0) { k = kk; break; } }
en.weather = { k, day: key };
}
return en.weather.k;
}
function _cjDaypart(h) { return h >= 21 || h < 5 ? 'night' : h < 8 ? 'dawn' : h < 17 ? 'day' : 'dusk'; }
function _cjWxSVG(k) {
const P = {
sunny: '<circle cx="12" cy="12" r="4.2"/><path d="M12 3.2v2.4M12 18.4v2.4M3.2 12h2.4M18.4 12h2.4M5.8 5.8l1.7 1.7M16.5 16.5l1.7 1.7M18.2 5.8l-1.7 1.7M7.5 16.5l-1.7 1.7"/>',
cloudy: '<path d="M7 15a4.5 4.5 0 1 1 .9-8.9A5.5 5.5 0 0 1 18.6 8 3.5 3.5 0 0 1 18 15z"/>',
rain: '<path d="M7 13a4.5 4.5 0 1 1 .9-8.9A5.5 5.5 0 0 1 18.6 6 3.5 3.5 0 0 1 18 13z"/><path d="M9 16l-1 2.6M13 16l-1 2.6M17 16l-1 2.6"/>',
wind: '<path d="M3 9h9a2.6 2.6 0 1 0-2.6-2.6M3 14h13a2.8 2.8 0 1 1-2.8 2.8"/>',
snow: '<path d="M7 13a4.5 4.5 0 1 1 .9-8.9A5.5 5.5 0 0 1 18.6 6 3.5 3.5 0 0 1 18 13z"/><path d="M9 17.5h.01M13 19.5h.01M16.5 17h.01M11 15.6h.01"/>'
};
return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${P[k] || P.sunny}</svg>`;
}
var CJ_MOON_TAG_SVG = '<svg class="cj-tag-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/></svg>';
function cjSkyFor(cid) {
try {
const en = _cjEntry(cid);
if (!en) return null;
const w = _cjEnsureWeather(en);
return { weather: w, weatherName: CJ_WEATHER[w] };
} catch (e) { return null; }
}
function _cjRemarkPick(weather) {
const g = (data.groups || []).find(x => (x.name || '') === '天气的话' && (x.category || '主字卡') === 'TA心里话' && !x.off);
const cards = _cjCardsOf(g);
if (!cards.length) return '';
const re = weather === 'rain' ? /雨/ : weather === 'snow' ? /雪/ : /风/;
const hit = cards.filter(c => re.test(c));
const pool = hit.length ? hit : cards;
return pool[Math.floor(Math.random() * pool.length)].trim();
}
function _cjHist(cid, e) {
const en = _cjEntry(cid);
if (_cjHiding(en) && ['s', 'a', 'p', 'o', 'n', 'm'].indexOf(e.k) >= 0) return;
if (!Array.isArray(en.hist)) en.hist = [];
en.hist.push(e);
if (en.hist.length > 80) en.hist.splice(0, en.hist.length - 80);
}
function _cjStatusPool() {
const g = (data.groups || []).find(x => (x.name || '') === '状态签名' && (x.category || '主字卡') === 'TA心里话' && !x.off);
return _cjCardsOf(g);
}
function _cjPoolSay(name, label) {
if (!label) return '';
const g = (data.groups || []).find(x => (x.name || '') === name && (x.category || '主字卡') === 'TA心里话' && !x.off);
const pre = label + '：';
const hit = _cjCardsOf(g).filter(c => c.trim().startsWith(pre));
if (!hit.length) return '';
return hit[Math.floor(Math.random() * hit.length)].trim().slice(pre.length).trim();
}
function _cjMoodSay(key) { return _cjPoolSay('情绪的话', (CJ_MOODS[key] || {}).label || ''); }
function _cjReadSay(key) { return _cjPoolSay('读到的你', (CJ_READ[key] || {}).label || ''); }
function _cjDoNote(en) {
const act = (en && en.a && CJ_ACTIVITY[en.a]) ? en.a : 'free';
if (act === 'sleep') return '<div class="cj-note">TA 那边似乎已经睡了。</div>';
if (act === 'unknown') return '';
const lead = { free: 'TA 闲着', busy: 'TA 在忙', rushed: 'TA 正忙着', rest: 'TA 在休息' }[act] || 'TA 那边';
const txt = _cjDoText(en);
return txt ? '<div class="cj-note">' + lead + '——' + _cjEsc(txt) + '</div>' : '<div class="cj-note">' + lead + '，具体在做什么没说。</div>';
}
function _cjSinceText(t) {
const m = Math.floor((Date.now() - (typeof t === 'number' ? t : 0)) / 60000);
if (m < 1) return '刚刚';
if (m < 60) return m + ' 分钟前';
if (m < 1440) return Math.floor(m / 60) + ' 小时前';
return Math.floor(m / 1440) + ' 天前';
}
function _cjNowLiveHTML(en) {
if (_cjHiding(en)) {
const sp = _cjHideSpanOf(en);
return `<div class="cj-hide-now">
        <span class="cj-hide-eye">${CJ_HIDE_EYE_SVG}</span>
        <span class="cj-hide-tx"><b class="cj-hide-t">TA 把状态收起来了</b>
          <i class="cj-hide-d">${_cjEsc(sp.label)}——${_cjEsc(sp.note)}</i>
          <i class="cj-hide-l">大约 ${_cjEsc(_cjHideLeftText(en))} 后重新显示</i></span>
      </div>
      <div class="cj-note">点下面的「感知此刻」，可以试着叫他一声。暂停期间 TA 的作息照旧，只是不把状态露出来。</div>`;
}
const p = CJ_PRESENCE[en.p] || CJ_PRESENCE.nearby;
const a = CJ_ACTIVITY[en.a] || CJ_ACTIVITY.free;
const d = CJ_DIR[CJ_DIR[en.dir] ? en.dir : 'none'];
const dTag = d && d.label !== '无法判断' ? `<span class="cj-tag cj-tag-d" title="你对 TA 方位的模糊感觉，不是精确定位">${_cjEsc(d.arrow ? d.arrow + ' ' + d.label : d.label)}</span>` : '';
return `<div class="cj-tags">
        <span class="cj-tag cj-tag-p" title="${_cjEsc(p.desc)}">${_cjEsc(p.label)}</span>${dTag}
        <span class="cj-tag cj-tag-a" title="${_cjEsc(a.desc)}">${en.a === 'sleep' ? CJ_MOON_TAG_SVG : ''}${_cjEsc(a.label)}</span>
      </div>
      ${_cjDoNote(en)}
      ${en.status ? `<div class="cj-status"><span class="cj-status-label">签名</span><span class="cj-status-txt">${_cjEsc(en.status)}</span><span class="cj-status-since">${_cjSinceText(en.sinceS)}</span></div>` : ''}`;
}
function _cjDirLiveHTML(en) {
if (_cjHiding(en)) {
const sp = _cjHideSpanOf(en);
return `<div class="cj-hide-dir"><b>TA 收起了状态，方向也读不到了</b><i>${_cjEsc(sp.label)} · 大约 ${_cjEsc(_cjHideLeftText(en))} 后重新显示</i></div>`;
}
const d = CJ_DIR[CJ_DIR[en.dir] ? en.dir : 'none'];
const p = CJ_PRESENCE[CJ_PRESENCE[en.p] ? en.p : 'nearby'];
const at = deg => { const rad = deg * Math.PI / 180; return { x: (50 + 36 * Math.cos(rad)).toFixed(2), y: (50 + 36 * Math.sin(rad)).toFixed(2) }; };
const dots = CJ_DIR_RING.map(x => {
const pt = at(x.deg), dd = CJ_DIR[x.k];
return `<i class="cj-dir-n${en.dir === x.k ? ' on' : ''}" style="left:${pt.x}%;top:${pt.y}%" title="${_cjEsc(dd.label)}">${dd.arrow}</i>`;
}).join('');
const dirTxt = d.label === '无法判断' ? '读不到' : (d.arrow ? d.arrow + ' ' : '') + d.label;
return `<div class="cj-compass">${dots}<span class="cj-dir-me">你</span></div>
      <div class="cj-dir-rows">
        <div class="cj-dir-row"><span class="cj-dir-k">方向</span><b class="cj-dir-v${d.label === '无法判断' ? ' mut' : ''}">${_cjEsc(dirTxt)}</b><span class="cj-dir-since">${_cjSinceText(en.sinceD)}</span></div>
        <div class="cj-dir-row"><span class="cj-dir-k">距离</span><b class="cj-dir-v">${_cjEsc(p.label)}</b><span class="cj-dir-since">${_cjSinceText(en.sinceP)}</span></div>
      </div>
      <div class="cj-note">不是精确定位，是你对 TA 的模糊感觉——离得远或感觉不到时，方向自然读不出来，读不到就不猜。</div>`;
}
function _cjNowPatch() {
if (!document.body || document.body.dataset.view !== 'cjian') return;
const box = $('#cjNowLive');
if (!box || !_cjSel || _cjIsGroup(_cjSel) || !_cjContact(_cjSel)) return;
const en = _cjEntry(_cjSel);
box.innerHTML = _cjNowLiveHTML(en);
const dbox = $('#cjDirLive');
if (dbox) dbox.innerHTML = _cjDirLiveHTML(en);
}
function _cjMoodPair(en) {
const root = _cjRoot();
const ta = CJ_MOODS[en.mo] ? en.mo : 'calm';
const you = CJ_MOODS[en.moRead] ? en.moRead : 'calm';
const ta2 = _cjMood2(ta, en.mo2), you2 = _cjMood2(you, en.moRead2);
const clash = ta === you;
const onCls = clash ? 'on same' : 'on';
const row = (k, k2) => [k, k2].filter((x, i) => x && CJ_MOODS[x] && (i === 0 || x !== k))
.map(x => `<span class="${x === k ? onCls : 'sub'}">${CJ_MOODS[x].label}</span>`).join('');
const say = (txt, at) => !txt ? '' : `<div class="cj-mood-say">${_cjEsc(txt)}</div><div class="cj-mood-say-at">${at}</div>`;
const beatClash = (CJ_BT[en.bt] ? en.bt : 'flat') === (CJ_BT[en.btRead] ? en.btRead : 'flat');
const unClash = (CJ_UND[en.un] ? en.un : 'flat') === (CJ_UND[en.unYou] ? en.unYou : 'flat');
const mark = (k, v, same) => `<span class="cj-mark"><span class="cj-mark-k">${k}</span><span class="cj-mark-v${same ? ' same' : ''}">${_cjEsc(v)}</span></span>`;
const btOf = k => CJ_BT[CJ_BT[k] ? k : 'flat'].label;
const unOf = k => CJ_UND[CJ_UND[k] ? k : 'flat'].label;
const marks = list => list.length ? `<div class="cj-marks">${list.join('')}</div>` : '';
const taMarks = marks([
root.sgOn === false ? '' : mark('语气', CJ_SG[CJ_SG[en.sg] ? en.sg : 'flat'].label, false),
root.btOn === false ? '' : mark('心动', btOf(en.bt), beatClash),
root.undOn === false ? '' : mark('说明白', unOf(en.un), unClash)
].filter(Boolean));
const youMarks = marks([
root.btOn === false ? '' : mark('读到的心动', btOf(en.btRead), beatClash),
root.undOn === false ? '' : mark('接住', unOf(en.unYou), unClash)
].filter(Boolean));
const taBody = _cjHiding(en)
? `<div class="cj-hide-inline"><span class="cj-hide-inline-k">暂隐</span>TA 把自己的心情收起来了，大约 ${_cjEsc(_cjHideLeftText(en))} 后重新显示。</div>`
: `<div class="cj-moods cj-moods-ta">${row(ta, ta2)}</div>
        ${say(en.moSay, `TA 自述 · ${_cjEsc(_cjClock(en.moSayTs))}`)}
        ${taMarks}`;
return `<div class="cj-read-pair">
      <div class="cj-read-line">
        <div class="cj-read-hd"><span class="cj-read-who">TA</span><span class="cj-read-note">TA 自己的心情</span></div>
        ${taBody}
      </div>
      <div class="cj-read-line">
        <div class="cj-read-hd"><span class="cj-read-who">你</span><span class="cj-read-note">TA 读到的你的心情</span></div>
        <div class="cj-moods cj-moods-read">${row(you, you2)}</div>
        ${root.readOn === false ? '' : say(en.rdSay, `TA 读你时说的 · ${_cjEsc(_cjClock(en.rdSayTs))}`)}
        ${youMarks}
      </div>
    </div>`;
}
function _cjGroupCards(name) {
const g = (data.groups || []).find(x => (x.name || '') === name && (x.category || '主字卡') === 'TA心里话' && !x.off);
return _cjCardsOf(g).map(c => c.trim());
}
function _cjGroupText(name, filterRe) {
const cards = _cjGroupCards(name);
const hit = filterRe ? cards.filter(c => filterRe.test(c)) : cards;
return hit.length ? hit[Math.floor(Math.random() * hit.length)] : '';
}
var CJ_FLASH_MIN_AGE = 3 * 86400000;
function _cjTsParse(dstr, tstr) {
const d = String(dstr || '').trim().replace(/[年月]/g, '/').replace(/日/g, '').replace(/-/g, '/');
const md = d.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
if (!md) return NaN;
const mt = String(tstr || '').trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
return new Date(+md[1], +md[2] - 1, +md[3], mt ? +mt[1] : 0, mt ? +mt[2] : 0, mt && mt[3] ? +mt[3] : 0).getTime();
}
function _cjOldOwnLine(cid) {
const ch = data.chats && data.chats[cid];
const msgs = (ch && Array.isArray(ch.msgs)) ? ch.msgs : [];
const cutoff = Date.now() - CJ_FLASH_MIN_AGE;
const pool = [];
for (const m of msgs) {
if (!m || m.from !== 'partner' || !m.text || m.text === '[表情包]' || m.sticker) continue;
if (m.recalled || m.sentAgain) continue;
const t = _cjTsParse(m.date, m.time);
if (isFinite(t) && t < cutoff) pool.push(typeof msgLiveText === 'function' ? msgLiveText(m) : m.text);
}
return pool.length ? pool[Math.floor(Math.random() * pool.length)] : '';
}
function _cjOldCollectedLine(cid) {
try {
const list = (typeof collectBookAt === 'function')
? collectBookAt('collect-msgs:' + cid)
: (JSON.parse(localStorage.getItem('collect-msgs:' + cid) || '[]') || []);
const cutoff = Date.now() - CJ_FLASH_MIN_AGE;
const pool = list.filter(x => x && x.by === 'ta' && (x.kind || 'msg') === 'msg' && x.text && x.text !== '[表情包]' && typeof x.ts === 'number' && x.ts < cutoff);
return pool.length ? pool[Math.floor(Math.random() * pool.length)].text : '';
} catch (e) { return ''; }
}
function _cjMileTop(tiers, v) {
let i = -1;
for (let k = 0; k < tiers.length; k++) if (v >= tiers[k]) i = k;
return i;
}
var CJ_MILE_NUM = [[7, /七天|7天/], [30, /三十天|30天/], [100, /一百|100/], [365, /三百六十五|365/], [500, /五百|500/], [1000, /一千|1000/], [2000, /两千|二千|2000/], [5000, /五千|5000/]];
function _cjMileText(kind, tier) {
const isMsg = kind === 'm';
const hit = _cjGroupCards('里程碑').filter(s => {
const saysMsg = /句/.test(s), saysDay = /天|日子/.test(s);
if (isMsg ? (saysDay && !saysMsg) : (saysMsg && !saysDay)) return false;
return !CJ_MILE_NUM.some(x => x[0] !== tier && x[1].test(s));
});
return hit.length ? hit[Math.floor(Math.random() * hit.length)] : '';
}
var CJ_SAY_MIN_MIN = 180, CJ_SAY_MAX_MIN = 480;
var CJ_SAY_MEMORY = 10;
function _cjAskWaiting(cid) {
const ch = data.chats && data.chats[cid];
const msgs = (ch && Array.isArray(ch.msgs)) ? ch.msgs : [];
return msgs.some(m => m && m.taAsk && m.taAsk.status === 'waiting');
}
function _cjSayCandidates(cid, en) {
const r = _cjRoot(), out = [];
const add = (line, text, extra) => { if (text) out.push(Object.assign({ line, text }, extra || {})); };
const stateOn = !_cjHiding(en);
const sayStatus = _cjPickStatus(en);
if (stateOn && sayStatus) add('status', sayStatus);
if (stateOn && r.moodOn !== false) add('mood', _cjMoodSay(CJ_MOODS[en.mo] ? en.mo : 'calm'));
if (r.readOn !== false) add('read', _cjReadSay(CJ_READ[en.rd] ? en.rd : 'unk'));
if (stateOn && r.sgOn !== false) add('soft', _cjPoolSay('示软的话', CJ_SG[CJ_SG[en.sg] ? en.sg : 'flat'].label));
if (stateOn && r.btOn !== false) add('beat', _cjPoolSay('心动的话', CJ_BT[CJ_BT[en.bt] ? en.bt : 'flat'].label));
if (stateOn && r.undOn !== false) add('und', _cjPoolSay('说明白的话', CJ_UND[CJ_UND[en.un] ? en.un : 'flat'].label));
if (stateOn && r.ngOn !== false) add('ng', _cjPoolSay('干扰的话', CJ_NG[CJ_NG[en.ng] ? en.ng : 'clear'].label));
if (stateOn) {
add('pres', _cjPoolSay('距离的话', CJ_PRESENCE[CJ_PRESENCE[en.p] ? en.p : 'nearby'].label));
add('dir', _cjPoolSay('方位的话', (CJ_DIR[CJ_DIR[en.dir] ? en.dir : 'none'] || {}).label));
const _actK = CJ_ACTIVITY[en.a] ? en.a : 'free';
add('act', _cjDoSay(_cjDoKeyOf(en), _actK, false) || _cjPoolSay('此刻在做的话', CJ_ACTIVITY[_actK].label));
}
if (r.timeOn !== false) add('hour', _cjPoolSay('时辰的话', CJ_TIMEPART[_cjTimePartOf(en)].label));
add('feel', _cjGroupText('体感'), { histK: 'f' });
const wk = _cjEnsureWeather(en);
if (wk === 'rain' || wk === 'snow' || wk === 'wind') add('sky', _cjRemarkPick(wk));
const hr = new Date().getHours();
if (stateOn && hr >= 5 && hr < 11) add('dream', _cjGroupText('梦境'), { histK: 'd' });
if (data.flashOn !== false) {
const old = Math.random() < 0.5 ? _cjOldOwnLine(cid) : _cjOldCollectedLine(cid);
const intro = old ? _cjGroupText('回忆引子', /收藏/.test(old) ? /收藏/ : null) : '';
if (old && intro) add('flash', intro, { follow: old });
}
if (data.taAskOn !== false && !_cjAskWaiting(cid) && typeof _taAskPick === 'function') {
const tc = _taAskPick(cid);
if (tc && tc.q) add('ask', tc.q, { card: { opts: tc.opts, status: 'waiting' } });
}
return out;
}
function _cjSayTick(cid, en, now) {
const next = typeof en.sayNext === 'number' && isFinite(en.sayNext) ? en.sayNext : 0;
if (!next) { en.sayNext = now + _cjRi(CJ_SAY_MIN_MIN, CJ_SAY_MAX_MIN) * 60000; return true; }
if (now < next) return false;
const spoken = Array.isArray(en.spoken) ? en.spoken : (en.spoken = []);
const pool = _cjSayCandidates(cid, en).filter(c => !spoken.includes(c.text) && !(c.follow && spoken.includes(c.follow)));
en.sayNext = now + _cjRi(CJ_SAY_MIN_MIN, CJ_SAY_MAX_MIN) * 60000;
const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
if (!pick) return true;
const msg = { id: nextId(), from: 'partner', text: pick.text, unread: true };
if (pick.card) msg.taAsk = pick.card;
_cjDeliver(msg, cid, pick.line);
if (pick.histK) _cjHist(cid, { k: pick.histK, t: pick.text, ts: now });
spoken.push(pick.text);
if (pick.follow) {
spoken.push(pick.follow);
setTimeout(() => { try { _cjDeliver({ id: nextId(), from: 'partner', text: pick.follow, unread: true }, cid, pick.line); } catch (e) {} }, 2200 + Math.random() * 2500);
}
if (spoken.length > CJ_SAY_MEMORY) spoken.splice(0, spoken.length - CJ_SAY_MEMORY);
return true;
}
var _cjMemScanCache = { key: null, totalMsgs: 0, firstTs: 0 };
function _cjMileScan() {
let n = 0;
const chs = data.chats || {};
for (const cid of Object.keys(chs)) {
const ms = chs[cid] && Array.isArray(chs[cid].msgs) ? chs[cid].msgs : [];
n += ms.length;
}
if (_cjMemScanCache.key === n) return _cjMemScanCache;
let totalMsgs = 0, firstTs = 0;
for (const cid of Object.keys(chs)) {
const ms = (chs[cid] && Array.isArray(chs[cid].msgs)) ? chs[cid].msgs : [];
totalMsgs += ms.length;
for (const m of ms) {
if (!m || m.from === 'system') continue;
const t = _cjTsParse(m.date, m.time);
if (isFinite(t) && (!firstTs || t < firstTs)) firstTs = t;
}
}
_cjMemScanCache = { key: n, totalMsgs, firstTs };
return _cjMemScanCache;
}
function cjMemoryTick() {
if (typeof _cjDeliver !== 'function' || typeof _deliverToChat !== 'function') return;
const now = Date.now();
const { totalMsgs, firstTs } = _cjMileScan();
const days = firstTs ? Math.floor((now - firstTs) / 86400000) : 0;
const MSG_MILE = [100, 500, 1000, 2000, 5000], DAY_MILE = [7, 30, 100, 365];
if (!data._mile) data._mile = { v: 2, m: -1, d: -1 };
else if (data._mile.v !== 2) data._mile = { v: 2, m: _cjMileTop(MSG_MILE, totalMsgs), d: _cjMileTop(DAY_MILE, days) };
const mIdx = _cjMileTop(MSG_MILE, totalMsgs), dIdx = _cjMileTop(DAY_MILE, days);
const mileNewM = mIdx > data._mile.m, mileNewD = dIdx > data._mile.d;
if ((mileNewM || mileNewD) && Math.random() < 0.7) {
const mileKind = mileNewM ? 'm' : 'd';
const mileTier = mileKind === 'm' ? MSG_MILE[mIdx] : DAY_MILE[dIdx];
const card = _cjMileText(mileKind, mileTier);
if (card) {
if (mileNewM) data._mile.m = mIdx;
if (mileNewD) data._mile.d = dIdx;
_cjHist('c0', { k: 'b', t: card, ts: now });
_cjDeliver({ id: nextId(), from: 'partner', text: card, unread: true }, (typeof mainChatId === 'function' ? mainChatId() : 'c0') || 'c0', 'mile');
showToast(mileKind === 'm' ? '你们的第 ' + mileTier + ' 句' : '你们在一起第 ' + mileTier + ' 天');
save();
}
}
}
function _cjPickStatus(en, avoid) {
const pool = _cjStatusPool().map(c => c.trim()).filter(Boolean);
if (!pool.length) return '';
const wk = en ? _cjEnsureWeather(en) : '';
const rx = wk === 'rain' ? /雨/ : wk === 'snow' ? /雪/ : wk === 'wind' ? /风/ : null;
let cand = pool;
if (avoid && pool.length > 1) { const rest = pool.filter(c => c !== avoid); if (rest.length) cand = rest; }
const w = cand.map(c => (rx && rx.test(c)) ? 3 : 1);
let rr = Math.random() * w.reduce((a, b) => a + b, 0);
for (let i = 0; i < cand.length; i++) { rr -= w[i]; if (rr < 0) return cand[i]; }
return cand[cand.length - 1];
}
function _cjWorldMinuteRaw(en) {
const d = _cjWorldDate(en);
return d.getHours() * 60 + d.getMinutes();
}
function _cjRollWorld(en, now) {
const wm = _cjWorldMinuteRaw(en);
const hh = Math.floor(wm / 60) % 24, mm = wm % 60;
const idx = _cjShichenAt(hh);
const stH = CJ_SHICHEN_START[idx];
const mInto = hh * 60 + mm - stH * 60;
const half = mInto < 60 ? CJ_SHICHEN[idx] + '初' : CJ_SHICHEN[idx] + '正';
return { hh, mm, half, sh: CJ_SHICHEN[idx], last: now, next: 1 + Math.random() * 7 };
}
function _cjOffsetLabel(en) {
const off = _cjOffsetMin(en);
if (!off) return '与现实同步';
const a = Math.abs(off), hh = Math.floor(a / 60), mm = a % 60;
return '比现实' + (off > 0 ? '快 ' : '慢 ') + (hh ? hh + ' 小时' : '') + (mm ? (hh ? ' ' : '') + mm + ' 分' : '');
}
function _cjWorldHour(en) {
const now = Date.now();
if (!en.world || !en.world.last || en.world.last > now || (now - en.world.last) / 36e5 >= (en.world.next || 0)) en.world = _cjRollWorld(en, now);
return en.world.hh;
}
function _cjPresenceWeights(wh) {
if (wh >= 23 || wh < 5) return { near: 8, nearby: 18, far: 26, unfelt: 33, gone: 15 };
if (wh < 9) return { near: 22, nearby: 30, far: 18, unfelt: 18, gone: 12 };
if (wh < 17) return { near: 18, nearby: 30, far: 20, unfelt: 20, gone: 12 };
if (wh < 22) return { near: 30, nearby: 32, far: 14, unfelt: 14, gone: 10 };
return { near: 20, nearby: 26, far: 20, unfelt: 22, gone: 12 };
}
function _cjActivityWeights(wh) {
if (wh >= 23 || wh < 6) return { free: 4, busy: 8, rushed: 4, rest: 12, sleep: 62, unknown: 10 };
if (wh < 9) return { free: 28, busy: 24, rushed: 14, rest: 10, sleep: 14, unknown: 10 };
if (wh < 12) return { free: 34, busy: 30, rushed: 18, rest: 2, sleep: 2, unknown: 14 };
if (wh < 14) return { free: 32, busy: 26, rushed: 16, rest: 16, sleep: 2, unknown: 8 };
if (wh < 18) return { free: 34, busy: 32, rushed: 18, rest: 4, sleep: 2, unknown: 10 };
if (wh < 21) return { free: 36, busy: 26, rushed: 16, rest: 8, sleep: 4, unknown: 10 };
return { free: 24, busy: 22, rushed: 14, rest: 18, sleep: 12, unknown: 10 };
}
function _cjPickWeighted(w) {
const keys = Object.keys(w);
const total = keys.reduce((s, k) => s + w[k], 0);
let acc = 0, rr = Math.random() * total;
for (const k of keys) { acc += w[k]; if (rr < acc) return k; }
return keys[keys.length - 1];
}
function _cjInertia(w, cur, stay) { const x = Object.assign({}, w); if (cur && x[cur] != null) x[cur] *= stay; return x; }
function _cjBias(w, en, fam) {
const b = en && en.evBias && en.evBias[fam];
if (!b || Date.now() >= (en.evBiasUntil || 0)) return w;
const x = Object.assign({}, w);
for (const k in b) if (x[k] != null) x[k] = Math.max(0, x[k] * b[k]);
return x;
}
function _cjRecentChatBoost(cid) {
const ch = data.chats && data.chats[cid];
const msgs = ch && Array.isArray(ch.msgs) ? ch.msgs : [];
const last = msgs[msgs.length - 1];
if (!last) return false;
const t = _cjTsParse(last.date, last.time);
return isFinite(t) && Date.now() - t < 30 * 60000;
}
function _cjLiveTalk(cid) {
const msgs = ((data.chats || {})[cid] || {}).msgs || [];
const t0 = Date.now() - 600000;
let n = 0;
for (let i = msgs.length - 1; i >= 0; i--) {
const m = msgs[i], t = _cjTsOf(m);
if (!m || (m.from !== 'me' && m.from !== 'partner')) continue;
if (!t || t < t0) break;
n++;
}
return n;
}
function _cjEvent(cid, kind) {
if (!cid || typeof _cjEntry !== 'function') return;
if (_cjRoot().enabled === false || _cjIsGroup(cid) || !_cjContact(cid)) return;
const now = Date.now();
if (now < (_cjEvCd || 0)) return;
_cjEvCd = now + 90000;
const en = _cjEntry(cid);
if (kind === 'meSent') en.evBias = { a: { free: 2.2, rest: 0.4 }, p: { near: 1.6, nearby: 1.6 } };
else if (kind === 'taReplied') en.evBias = { p: { near: 1.8, nearby: 1.8, gone: 0.3 } };
else if (kind === 'nr') en.evBias = { a: { busy: 2, rest: 1.6 }, ng: { outer: 2.2, taState: 1.8 } };
else return;
en.evBiasUntil = now + 120000;
}
var CJ_TALK_BLINK_PROB_DEF = 5;
function _cjTalkBlinkProbOf(r) {
const n = Number((r || _cjRoot()).talkBlinkProb);
return (typeof n === 'number' && isFinite(n)) ? Math.max(0, Math.min(100, Math.round(n))) : CJ_TALK_BLINK_PROB_DEF;
}
function cjTalkBlink(cid) {
const r = _cjRoot();
if (r.talkBlinkOn === false) return false;
if (r.enabled === false || !cid || _cjIsGroup(cid) || !_cjContact(cid)) return false;
const p = _cjTalkBlinkProbOf(r);
if (p <= 0 || Math.random() * 100 >= p) return false;
const en = _cjEntry(cid);
const now = Date.now();
if (typeof en.sinceA === 'number' && now - en.sinceA < CJ_WANT.a.holdMin * 60000) return false;
if (!_cjTurnActivity(cid, en, now)) return false;
if (typeof updateCjChip === 'function') { try { updateCjChip(); } catch (e) {} }
_cjNowPatch();
return true;
}
function cjSetTalkBlink(on) {
const r = _cjRoot();
const next = !!on;
if ((r.talkBlinkOn !== false) === next) return next;
r.talkBlinkOn = next;
save();
if (document.body && document.body.dataset.view === 'cjian') _cjRenderBody();
return next;
}
function cjSetTalkBlinkProb(v) {
const r = _cjRoot();
const n = Math.round(Number(v));
const p = (typeof n === 'number' && isFinite(n)) ? Math.max(0, Math.min(100, n)) : CJ_TALK_BLINK_PROB_DEF;
if (Number(r.talkBlinkProb) === p) return p;
r.talkBlinkProb = p;
save();
return p;
}
function _cjPredictPhrase(p, a) {
if (a === 'sleep' || a === 'rest') return '可能在休息';
if (a === 'unknown') return '此时尚不可知';
if (p === 'near') return '可能就在身边';
if (p === 'nearby') return a === 'free' ? '可能在附近' : (a === 'busy' ? '可能在忙点什么' : '可能较忙');
if (p === 'far') return '在远处';
if (p === 'gone') return '离开中';
return '可能感知不到';
}
var CJ_WANT = {
a: { holdMin: 6,  meanMin: 34 },
p: { holdMin: 10, meanMin: 52 },
d: { holdMin: 15, meanMin: 30 },
s: { holdMin: 12, meanMin: 66 }
};
var CJ_WANT_SLOW = { sleep: 3, unknown: 1.6 };
var _cjLastTickAt = 0;
function _cjWantGap(now) {
const gap = _cjLastTickAt ? Math.round((now - _cjLastTickAt) / 30000) : 1;
_cjLastTickAt = now;
return Math.max(1, Math.min(2880, gap));
}
function _cjWants(en, key, gapTicks, now) {
const c = CJ_WANT[key];
const since = en ? en['since' + key.toUpperCase()] : 0;
if (typeof since !== 'number' || !isFinite(since)) return true;
if (now - since < c.holdMin * 60000) return false;
const mean = c.meanMin * (key === 'a' && en && CJ_WANT_SLOW[en.a] ? CJ_WANT_SLOW[en.a] : 1);
const denom = Math.max(1, (mean - c.holdMin) * 2);
return Math.random() < 1 - Math.exp(-gapTicks / denom);
}
function _cjTurnActivity(cid, en, now) {
const oldA = en.a;
const wA = _cjActivityWeights(_cjWorldHour(en));
if (_cjLiveTalk(cid) >= 2) { wA.sleep = 0; wA.rest *= 0.3; wA.free *= 1.5; }
const w = _cjBias(wA, en, 'a');
if (w[oldA] != null) delete w[oldA];
if (!Object.keys(w).some(k => w[k] > 0)) return false;
en.a = _cjPickWeighted(w);
en.sinceA = now;
const oldK = _cjDoKeyOf({ a: oldA, avK: en.avK });
const newK = _cjRollDo(en.a);
en.avK = newK;
if (newK !== oldK || !en.av) en.av = _cjDoSay(newK, en.a, true);
if (newK !== oldK) {
const famLabel = (CJ_DO[newK] && !CJ_DO[newK].flat) ? (CJ_ACTIVITY[en.a].label + '·' + CJ_DO[newK].label) : CJ_ACTIVITY[en.a].label;
_cjHist(cid, { k: 'a', t: famLabel + (en.av ? '：' + en.av : ''), ts: now });
}
if (en.a !== oldA && typeof _asPullIn === 'function') _asPullIn(cid);
return true;
}
function _cjTurnPresence(cid, en, now) {
const w = _cjPresenceWeights(_cjWorldHour(en));
if (_cjRecentChatBoost(cid)) { w.near += 16; w.nearby += 16; w.far = Math.max(2, w.far - 8); w.unfelt = Math.max(2, w.unfelt - 8); w.gone = Math.max(2, w.gone - 6); }
if (_cjLiveTalk(cid) >= 2) { w.near += 10; w.nearby += 10; }
const w2 = _cjBias(w, en, 'p');
if (w2[en.p] != null) delete w2[en.p];
if (!Object.keys(w2).some(k => w2[k] > 0)) return false;
en.p = _cjPickWeighted(w2);
en.sinceP = now;
return true;
}
function _cjTurnDir(cid, en, now) {
const w = _cjDirWeights(CJ_PRESENCE[en.p] ? en.p : 'nearby');
if (w[en.dir] != null) delete w[en.dir];
if (!Object.keys(w).some(k => w[k] > 0)) return false;
en.dir = _cjPickWeighted(w);
en.sinceD = now;
return true;
}
function _cjTurnStatus(cid, en, now) {
const t = _cjPickStatus(en, en.status);
if (!t) return false;
en.status = t;
en.sinceS = now;
_cjHist(cid, { k: 's', t, ts: now });
return true;
}
function _cjHideProbOf(r) {
const n = Number((r || _cjRoot()).hideProb);
return (typeof n === 'number' && isFinite(n)) ? Math.max(0, Math.min(100, Math.round(n))) : CJ_HIDE_PROB_DEF;
}
function _cjHideWakeOf(r) {
const n = Number((r || _cjRoot()).hideWake);
return (typeof n === 'number' && isFinite(n)) ? Math.max(0, Math.min(100, Math.round(n))) : CJ_HIDE_WAKE_DEF;
}
function _cjHiding(en) {
if (!en) return false;
const at = Number(en.hideAt), until = Number(en.hideUntil);
return at > 0 && isFinite(at) && until > Date.now();
}
function _cjHideSpanOf(en) {
return CJ_HIDE_SPANS.find(s => s.k === en.hideWhy) || CJ_HIDE_SPANS[0];
}
function _cjHideLeftText(en) {
const m = Math.max(0, Math.ceil((Number(en.hideUntil) - Date.now()) / 60000));
if (m <= 1) return '不到 1 分钟';
if (m < 60) return m + ' 分钟';
const hh = Math.floor(m / 60), mm = m % 60;
return hh + ' 小时' + (mm ? ' ' + mm + ' 分' : '');
}
function _cjHideChanceOf(cid, en) {
if (typeof _cjLiveTalk === 'function' && _cjLiveTalk(cid) >= 2) return 0;
const wh = _cjWorldHour(en);
const mul = (wh >= 23 || wh < 7) ? 1.8 : (wh >= 7 && wh < 18 ? 0.8 : 1);
return _cjHideProbOf(_cjRoot()) * mul;
}
function _cjHideEnter(cid, en, now) {
const total = CJ_HIDE_SPANS.reduce((s, x) => s + x.w, 0);
let rr = Math.random() * total, span = CJ_HIDE_SPANS[0];
for (const s of CJ_HIDE_SPANS) { rr -= s.w; if (rr < 0) { span = s; break; } }
const durMin = _cjRi(span.lo, span.hi);
en.hideAt = now;
en.hideUntil = now + durMin * 60000;
en.hideWhy = span.k;
en.hideTry = 0;
_cjHist(cid, { k: 'h', t: '状态暂隐 · ' + span.label + '（约 ' + durMin + ' 分钟）', ts: now });
return true;
}
function _cjHideEnd(cid, en, now, byUser) {
if (!en.hideAt) return false;
delete en.hideAt; delete en.hideUntil; delete en.hideTry; delete en.hideWhy;
en.hideEnd = now;
en.hideNext = now + _cjRi(CJ_HIDE_GAP_MIN, CJ_HIDE_GAP_MAX) * 60000;
_cjHist(cid, { k: 'v', t: (byUser ? '状态恢复显示 · 你叫了一声' : '状态恢复显示'), ts: now });
return true;
}
function cjHideWakeChanceOf(en) {
const base = _cjHideWakeOf(_cjRoot());
if (!(base > 0)) return 0;
const n = (typeof en.hideTry === 'number' && isFinite(en.hideTry)) ? Math.max(0, Math.round(en.hideTry)) : 0;
return n >= 2 ? 100 : Math.min(100, base + n * 20);
}
function _cjHideTick(cid, en, now) {
const r = _cjRoot();
if (en.hideAt) {
if (r.hideOn === false || now >= en.hideUntil) return _cjHideEnd(cid, en, now, false);
return false;
}
if (r.hideOn === false) return false;
if (en.hideEnd && now - en.hideEnd < CJ_HIDE_COOL_MIN * 60000) return false;
const next = (typeof en.hideNext === 'number' && isFinite(en.hideNext)) ? en.hideNext : 0;
if (!next) { en.hideNext = now + _cjRi(CJ_HIDE_FIRST_MIN, CJ_HIDE_FIRST_MAX) * 60000; return true; }
if (now < next) return false;
const chance = _cjHideChanceOf(cid, en);
if (!(chance > 0)) return false;
en.hideNext = now + _cjRi(CJ_HIDE_GAP_MIN, CJ_HIDE_GAP_MAX) * 60000;
if (Math.random() * 100 < chance) return _cjHideEnter(cid, en, now);
return true;
}
function cjianTick() {
_cjEnsureAll();
const root = _cjRoot();
const now = Date.now();
const gapTicks = _cjWantGap(now);
let dirty = false;
for (const cid of Object.keys(root.by)) {
if (!_cjContact(cid)) { delete root.by[cid]; dirty = true; continue; }
const en = root.by[cid];
if (en.evBias && now >= (en.evBiasUntil || 0)) { delete en.evBias; delete en.evBiasUntil; }
if (!en.world || typeof en.world.last !== 'number' || en.world.last > now || (now - en.world.last) / 36e5 >= (en.world.next || 0)) {
en.world = _cjRollWorld(en, now); dirty = true;
}
if (_cjHideTick(cid, en, now)) dirty = true;
if (!_cjHiding(en) && root.enabled && now - en.sinceP >= 120 * 60000 && now - _cjLastApproach >= 20 * 60000 && Math.random() < 0.004) {
en.p = Math.random() < 0.1 ? 'near' : 'nearby';
en.sinceP = now;
en.dir = _cjRollDir(en.p); en.sinceD = now;
const _dNear = CJ_DIR[en.dir] ? en.dir : 'none';
const _dTxt = _dNear === 'side' ? '……' + _cjName(cid) + '好像就在你身边。'
: _dNear !== 'none' ? '……' + _cjName(cid) + '好像在你' + CJ_DIR[_dNear].label + '。'
: '……好像有什么靠近了。';
_cjHist(cid, { k: 'n', t: _dTxt, ts: now });
_cjLastApproach = now;
showToast(_dTxt);
dirty = true;
}
if (_cjWants(en, 'a', gapTicks, now)) { if (_cjTurnActivity(cid, en, now)) dirty = true; }
if (_cjWants(en, 'p', gapTicks, now)) { if (_cjTurnPresence(cid, en, now)) dirty = true; }
if (_cjWants(en, 'd', gapTicks, now)) { if (_cjTurnDir(cid, en, now)) dirty = true; }
if (_cjWants(en, 's', gapTicks, now)) { if (_cjTurnStatus(cid, en, now)) dirty = true; }
if (root.moodOn !== false && now - en.sinceMo >= en.cdMo) {
const pair = _cjMoodRoll(CJ_MOODS[en.mo] ? en.mo : 'calm');
en.sinceMo = now; en.cdMo = _cjRi(25, 70) * 60000; dirty = true;
const oldP = CJ_MOODS[en.mo] ? en.mo : 'calm', oldS = _cjMood2(oldP, en.mo2);
const nk = CJ_MOODS[pair[0]] ? pair[0] : 'calm', nk2 = _cjMood2(nk, pair[1]);
if (nk !== oldP || nk2 !== oldS) {
en.mo = nk; en.mo2 = nk2;
if (nk !== oldP) { en.moSay = _cjMoodSay(nk); en.moSayTs = en.moSay ? now : 0; }
_cjHist(cid, { k: 'm', t: _cjMoodPairLabel(nk, nk2) + (en.moSay ? '：' + en.moSay : ''), ts: now, ma: nk, mb: nk2 || '' });
}
}
if (root.moodOn !== false && now - en.sinceMoRead >= en.cdMoRead) {
const pairR = _cjMoodRoll();
en.sinceMoRead = now; en.cdMoRead = _cjRi(45, 110) * 60000; dirty = true;
const oldRP = CJ_MOODS[en.moRead] ? en.moRead : 'calm', oldRS = _cjMood2(oldRP, en.moRead2);
const nkR = CJ_MOODS[pairR[0]] ? pairR[0] : 'calm', nkR2 = _cjMood2(nkR, pairR[1]);
if (nkR !== oldRP || nkR2 !== oldRS) {
en.moRead = nkR; en.moRead2 = nkR2;
_cjHist(cid, { k: 'u', t: _cjMoodPairLabel(nkR, nkR2) + ' · TA 读到的你', ts: now });
}
}
if (root.sgOn !== false && now - en.sinceSg >= en.cdSg) {
const nk2 = _cjPickWeighted(CJ_SG_W);
en.sinceSg = now; en.cdSg = _cjRi(15, 40) * 60000; dirty = true;
if (nk2 !== en.sg) en.sg = CJ_SG[nk2] ? nk2 : 'flat';
}
const btCd = typeof en.cdBt === 'number' && en.cdBt >= CJ_BT_MIN_MIN * 60000 && en.cdBt <= CJ_BT_MAX_MIN * 60000 ? en.cdBt : 0;
const btSince = typeof en.sinceBt === 'number' && isFinite(en.sinceBt) ? en.sinceBt : 0;
if (root.btOn !== false && now - btSince >= btCd) {
const nkB = _cjPickWeighted(CJ_BT_W), nkB2 = _cjPickWeighted(CJ_BT_W);
en.sinceBt = now; en.cdBt = _cjRi(CJ_BT_MIN_MIN, CJ_BT_MAX_MIN) * 60000; dirty = true;
if (CJ_BT[nkB]) en.bt = nkB;
if (CJ_BT[nkB2]) en.btRead = nkB2;
}
const unCd = typeof en.cdUn === 'number' && en.cdUn >= CJ_UND_MIN_MIN * 60000 && en.cdUn <= CJ_UND_MAX_MIN * 60000 ? en.cdUn : 0;
const unSince = typeof en.sinceUn === 'number' && isFinite(en.sinceUn) ? en.sinceUn : 0;
if (root.undOn !== false && now - unSince >= unCd) {
const nkU = _cjPickWeighted(CJ_UND_W), nkU2 = _cjPickWeighted(CJ_UND_W);
en.sinceUn = now; en.cdUn = _cjRi(CJ_UND_MIN_MIN, CJ_UND_MAX_MIN) * 60000; dirty = true;
if (CJ_UND[nkU]) en.un = nkU;
if (CJ_UND[nkU2]) en.unYou = nkU2;
}
const ngCd = typeof en.cdNg === 'number' && en.cdNg >= CJ_NG_MIN_MIN * 60000 && en.cdNg <= CJ_NG_MAX_MIN * 60000 ? en.cdNg : 0;
const ngSince = typeof en.sinceNg === 'number' && isFinite(en.sinceNg) ? en.sinceNg : 0;
if (root.ngOn !== false && now - ngSince >= ngCd) {
const wN = Object.assign({}, CJ_NG_W);
if (_cjLiveTalk(cid) >= 2) wN.clear *= 2;
const nkN = _cjPickWeighted(_cjBias(_cjInertia(wN, en.ng, 1.7), en, 'ng'));
en.sinceNg = now; en.cdNg = _cjRi(CJ_NG_MIN_MIN, CJ_NG_MAX_MIN) * 60000; dirty = true;
if (CJ_NG[nkN]) en.ng = nkN;
}
if (root.readOn !== false && now - en.sinceRd >= en.cdRd) {
const nk3 = _cjPickWeighted(CJ_READ_W);
en.sinceRd = now; en.cdRd = _cjRi(25, 70) * 60000; dirty = true;
if (nk3 !== en.rd) {
en.rd = CJ_READ[nk3] ? nk3 : 'steady';
en.rdSay = _cjReadSay(en.rd);
en.rdSayTs = en.rdSay ? now : 0;
_cjHist(cid, { k: 'u', t: CJ_READ[en.rd].label + (en.rdSay ? '：' + en.rdSay : ''), ts: now });
}
}
if (_cjCardTick(cid, en, now)) dirty = true;
if (!_cjIsGroup(cid) && typeof _cjDeliver === 'function' && typeof nextId === 'function') {
if (_cjSayTick(cid, en, now)) dirty = true;
}
}
if (dirty) save();
cjMemoryTick();
updateCjChip();
_cjNowPatch();
}
function cjianPerceive(scope) {
const mode = scope === 'dir' ? 'dir' : 'now';
const cid = _cjSel || data.activeChat;
const c = _cjContact(cid);
if (!c || c.kind === 'group') { showToast('先选择一个联系人'); return null; }
if (Date.now() < _cjPerceiveCd) { showToast('刚刚才感知过，先等一等'); return null; }
_cjPerceiveCd = Date.now() + 3000;
const en = _cjEntry(cid);
const now = Date.now();
const lines = [];
const wasHidden = _cjHiding(en);
if (wasHidden) {
const p = cjHideWakeChanceOf(en);
const woke = p >= 100 || Math.random() * 100 < p;
if (!woke) {
const n = (typeof en.hideTry === 'number' && isFinite(en.hideTry)) ? Math.max(0, Math.round(en.hideTry)) : 0;
en.hideTry = Math.min(3, n + 1);
save();
return ['你安静地感受了一下，TA 那边没有回应。',
'状态还收着，大约 ' + _cjHideLeftText(en) + ' 后自己回来。' + (n + 1 < 3 ? '再试一次会更容易些。' : '')];
}
_cjHideEnd(cid, en, now, true);
lines.push('你叫了一声，「' + _cjName(cid) + '」好像重新愿意让你看见了。');
}
if (mode === 'dir') {
const oldD = en.dir;
if (!wasHidden && now - en.sinceD > 15 * 60000) {
en.dir = _cjRollDir(CJ_PRESENCE[en.p] ? en.p : 'nearby');
en.sinceD = now;
if (en.dir !== 'none') {
const dd0 = CJ_DIR[en.dir];
_cjHist(cid, { k: 'o', t: '方位 ' + (dd0.arrow ? dd0.arrow + ' ' : '') + dd0.label, ts: now });
}
}
const dd = CJ_DIR[en.dir] || CJ_DIR.none;
if (dd.label !== '无法判断') {
if (en.dir === 'side') {
lines.push(en.dir === oldD ? '还在你身边。' : '好像就在你身边。');
} else {
const aTxt = (dd.arrow ? dd.arrow + ' ' : '') + dd.label;
lines.push(en.dir === oldD ? '方位还是' + aTxt + '。' : '方位好像在' + aTxt + '。');
}
} else {
lines.push('这一会儿读不到方向。', '离得远或感觉不到的时候，方向本来就模糊。');
}
save();
return lines;
}
if (wasHidden) {
lines.push('TA 现在是' + CJ_ACTIVITY[en.a].label + ' · ' + CJ_PRESENCE[en.p].label + '。');
save();
return lines;
}
const chance = { near: 95, nearby: 75, far: 40, gone: 25, unfelt: 12 }[en.p] || 12;
const hit = Math.random() * 100 < chance;
if (hit) {
lines.push('你安静了一会儿。', '好像有人就在附近。');
const senseHit = presetSayPick('感知的话', '感觉到了');
if (senseHit) lines.push(senseHit);
} else {
const senseMiss = presetSayPick('感知的话', '没感觉到');
if (senseMiss) lines.push(senseMiss, '但这并不代表 TA 不在。');
}
let changed = false;
if (now - en.sinceP > 15 * 60000 && Math.random() * 100 < CJ_PERCEIVE_PROB.p) {
const r = Math.random();
en.p = r < 0.45 ? 'nearby' : (r < 0.75 ? 'unfelt' : (r < 0.9 ? 'near' : 'far'));
en.sinceP = now;
_cjHist(cid, { k: 'p', t: CJ_PRESENCE[en.p].label, ts: now });
lines.push('「' + _cjName(cid) + '」似乎改变了状态——现在' + CJ_PRESENCE[en.p].label + '。');
changed = true;
}
if (Math.random() * 100 < CJ_PERCEIVE_PROB.a && _cjTurnActivity(cid, en, now)) {
lines.push('「' + _cjName(cid) + '」好像换了换气——现在' + CJ_ACTIVITY[en.a].label + '。');
changed = true;
}
if (Math.random() * 100 < CJ_PERCEIVE_PROB.s && _cjTurnStatus(cid, en, now)) {
lines.push('签名像是换了：「' + en.status + '」。');
changed = true;
}
if (!changed) lines.push('你安静地感受了一下，TA 那边没什么变化。');
if (hit && Math.random() < 0.04) {
const tt = presetSayPick('碰到的触感');
if (tt) {
_cjHist(cid, { k: 't', t: tt, ts: now });
lines.push(tt);
}
}
save();
return lines;
}
function _cjName(cid) {
const c = _cjContact(cid);
return fixedNameOf(c) || partnerName();
}
function _cjTsOf(m) { const t = _cjTsParse(m.date, m.time); return isFinite(t) ? t : 0; }
function _cjClock(t) {
if (!t) return '—';
const d = new Date(t), n = new Date(), hm = _cjPad(d.getHours()) + ':' + _cjPad(d.getMinutes());
return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
? hm : (d.getMonth() + 1) + '/' + d.getDate() + ' ' + hm;
}
function _cjDur(sec) {
if (sec < 90) return Math.max(1, Math.round(sec)) + ' 秒';
if (sec < 5400) return Math.round(sec / 60) + ' 分';
return Math.round(sec / 180) / 10 + ' 时';
}
function cjConnOf(cid) {
const ch = (data.chats || {})[cid];
const msgs = (ch && Array.isArray(ch.msgs)) ? ch.msgs : [];
const now = Date.now();
const name = _cjName(cid);
const out = { level: null, label: '', desc: '', rank: 0, rows: [], note: '', reason: '', tag: '近 24 小时' };
const talk = [];
const sysTs = [];
for (let i = 0; i < msgs.length; i++) {
const m = msgs[i];
if (!m) continue;
const t = _cjTsOf(m);
if (!t) continue;
if (m.from === 'me' || m.from === 'partner') talk.push({ m: m, t: t });
else if (m.from === 'system') sysTs.push({ t: t, nr: String(m.text || '').indexOf('已读不回') >= 0 });
}
if (!talk.length) { out.reason = '这条线还没有可判的通信'; out.tag = '还没有通信'; return out; }
const WIN_MS = 86400000;
let win = [];
for (let i = 0; i < talk.length; i++) if (now - talk[i].t <= WIN_MS) win.push(talk[i]);
let span = WIN_MS;
if (!win.length) {
win = talk.slice(-6);
span = Math.max(1, now - win[0].t);
out.tag = '最近几轮';
}
let lastMe = null, lastTa = null, pending = 0;
for (let i = talk.length - 1; i >= 0; i--) {
const p = talk[i];
if (!lastMe && p.m.from === 'me') lastMe = p;
if (!lastTa && p.m.from === 'partner') lastTa = p;
}
for (let i = talk.length - 1; i >= 0 && talk[i].m.from === 'me'; i--) pending++;
out.rows = [['你最后发出', _cjClock(lastMe ? lastMe.t : 0)], [name + ' 最后回于', _cjClock(lastTa ? lastTa.t : 0)]];
const meN = win.filter(p => p.m.from === 'me').length;
const taN = win.filter(p => p.m.from === 'partner').length;
const sysWin = sysTs.filter(x => now - x.t <= span);
const nrN = sysWin.filter(x => x.nr).length;
const unreadTa = Math.max(0, Number(ch.unread) || 0);
const meTs = [];
for (let i = 0; i < talk.length; i++) if (talk[i].m.from === 'me') meTs.push(talk[i].t);
meTs.sort((a, b) => a - b);
const gaps = [];
for (let i = 0; i < win.length; i++) {
if (win[i].m.from !== 'partner') continue;
const bt = win[i].t;
let lo = 0, hi = meTs.length;
while (lo < hi) { const mid = (lo + hi) >> 1; if (meTs[mid] < bt) lo = mid + 1; else hi = mid; }
if (lo > 0) gaps.push((bt - meTs[lo - 1]) / 1000);
}
const rounds = gaps.length;
const medS = rounds ? gaps.slice().sort((a, b) => a - b)[Math.floor(rounds / 2)] : 0;
const bh = (data.chatSettings && data.chatSettings[cid]) || (cid === data.activeChat && data.behavior) || {};
const paceMax = Math.max(1, Number(bh.rsMax) || 40), paceMin = Math.min(paceMax, Math.max(1, Number(bh.rsMin) || 1));
let level, descAlt = '';
const waited = lastMe ? (now - lastMe.t) / 1000 : 0;
const waitedTa = lastTa ? (now - lastTa.t) / 1000 : 0;
if (meN === 0) {
level = waitedTa > paceMax * 3 ? 'oneWay' : 'normal';
if (level === 'normal') descAlt = 'TA 刚说了话，还没等到你接';
} else if (taN === 0) {
level = waited > paceMax * 3 ? 'oneWay' : 'normal';
if (level === 'normal') descAlt = '刚发出去，TA 还没到该回的时候';
} else if (pending > 0) level = waited > paceMax * 3 ? 'slow' : 'normal';
else level = (rounds >= 5 && taN * 5 >= meN * 3) ? 'hot' : 'smooth';
const idx = CJ_CONN_LEVELS.findIndex(x => x.k === level);
const def = CJ_CONN_LEVELS[idx];
out.level = level; out.rank = idx + 1; out.label = def.label; out.desc = descAlt || def.desc;
out.rows.push(['你连着发了几条，TA 都没回', pending + ' 句'], [name + ' 发来你没读', unreadTa + ' 句'],
['双向', `你 ${meN} 句 · ${name} ${taN} 句`]);
out.note = (rounds ? '你发出去到 ' + name + ' 回话，中位 ' + _cjDur(medS) + '（' + rounds + ' 轮）' : '还没有一轮完整的来回')
+ ' · 这条线自己的节奏 ' + paceMin + '–' + paceMax + ' 秒'
+ (nrN ? ' · 已读不回 ' + nrN + ' 次' : '');
return out;
}
function _cjNgLine(en) {
if (_cjRoot().ngOn === false) return '';
const k = CJ_NG[en.ng] ? en.ng : 'clear';
const lit = {
taMood: (CJ_MOODS[en.mo] ? en.mo : 'calm') !== 'calm',
yourState: (CJ_MOODS[en.moRead] ? en.moRead : 'calm') !== 'calm',
taState: ['busy', 'rushed', 'rest', 'sleep'].indexOf(en.a) >= 0
};
let at = '';
if (k !== 'clear') at = 'TA 说的 · ' + (lit[k] ? CJ_NG[k].to : _cjClock(en.sinceNg));
return `<div class="cj-ng"><span class="cj-ng-k">干扰</span><span class="cj-ng-v">${_cjEsc(CJ_NG[k].label)}</span>${at ? `<span class="cj-ng-at">${_cjEsc(at)}</span>` : ''}</div>`;
}
function _cjChipTake(b, hide, txt) {
const changed = (!!hide) !== b.hidden || (!hide && b.textContent !== txt);
b.hidden = !!hide;
if (!hide) b.textContent = txt;
if (changed && typeof _hbRefitSoon === 'function') { try { _hbRefitSoon(); } catch (e) {} }
}
function updateCjChip() {
const b = $('#cjChip');
if (!b || typeof data === 'undefined' || !data.activeChat) return;
const cid = data.activeChat;
if (_cjPopCid && _cjPopCid !== cid) cjPopClose();
if (_cjRoot().chipOn === false) { _cjChipTake(b, true, ''); return; }
const c = _cjContact(cid);
if (!c || c.kind === 'group') { _cjChipTake(b, true, ''); return; }
const en = _cjEntry(cid);
if (!en.world || !en.world.last) en.world = _cjRollWorld(en, Date.now());
const mood = _cjRoot().moodOn === false ? '' : _cjMoodPairLabel(en.mo, '');
let conn = null;
if (typeof cjConnOf === 'function') { const _c = cjConnOf(cid); if (_c.level === 'oneWay' || _c.level === 'slow') conn = _c; }
if (conn) b.dataset.conn = conn.level; else b.removeAttribute('data-conn');
const connTag = conn ? (conn.level === 'oneWay' ? '单向' : '慢半拍') : '';
const timeOn = _cjRoot().timeOn !== false;
if (_cjHiding(en)) {
b.removeAttribute('data-conn');
_cjChipTake(b, false, '暂隐' + (timeOn ? ' · TA那边 ' + _cjPad(en.world.hh) + ':' + _cjPad(en.world.mm) : ''));
} else {
_cjChipTake(b, false, CJ_ACTIVITY[en.a].label + (mood && !conn ? ' · ' + mood : '') + (connTag ? ' · ' + connTag : '') + (timeOn ? ' · TA那边 ' + _cjPad(en.world.hh) + ':' + _cjPad(en.world.mm) : ''));
}
if (_cjPopCid === cid) _cjPopPaint(cid);
}
var _cjHistF = 'all';
function _cjHistCat(k) { return k === 'm' || k === 'u' ? 'mood' : k === 'r' || k === 'd' || k === 'b' || k === 'f' ? 'said' : k === 'n' || k === 'p' || k === 's' || k === 'a' || k === 'o' || k === 't' || k === 'h' || k === 'v' ? 'sense' : 'old'; }
var CJ_HIST_F = [
{ k: 'all', name: '全部' }, { k: 'mood', name: '情绪' }, { k: 'said', name: 'TA 说的话' },
{ k: 'sense', name: '感知' }
];
function _cjDayLabel(ts) {
const d = new Date(ts), n = new Date();
const same = a => a.getFullYear() === n.getFullYear() && a.getMonth() === n.getMonth() && a.getDate() === n.getDate();
if (same(d)) return '今天';
const y = new Date(n.getTime() - 86400000);
if (d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate()) return '昨天';
return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}
function _cjHistList(en) {
const all = (en.hist || []).slice().reverse();
return _cjHistF === 'all' ? all : all.filter(e => _cjHistCat(e.k) === _cjHistF);
}
function _cjHistMonthLabel(key) {
const i = key.indexOf('-');
const y = Number(key.slice(0, i)), m = Number(key.slice(i + 1));
const n = new Date();
return y === n.getFullYear() ? m + '月' : y + '年' + m + '月';
}
var _cjHistOpen = new Set();
function _cjHistHTML(en) {
const all = (en.hist || []).length;
const list = _cjHistList(en);
if (!all) return '<div class="cj-empty">还没有记录</div>';
if (!list.length) return '<div class="cj-empty">这一类还没有记录</div>';
const hl = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()} ${_cjPad(d.getHours())}:${_cjPad(d.getMinutes())}`; };
const kName = e => e.k === 's' ? '签名' : e.k === 'n' ? '靠近' : e.k === 'o' ? '方位' : e.k === 't' ? '触碰' : e.k === 'r' ? '呢喃' : e.k === 'd' ? '梦' : e.k === 'b' ? '碑' : e.k === 'f' ? '体感' : e.k === 'm' ? '情绪' : e.k === 'u' ? '读你' : e.k === 'a' ? '在做' : e.k === 'h' ? '暂隐' : e.k === 'v' ? '恢复' : e.k === 'i' ? '我的' : '感知';
const item = e => `<div class="cj-hist-item"><span class="cj-hist-k k-${e.k}">${kName(e)}</span><span class="cj-hist-t">${_cjEsc(e.t)}</span><span class="cj-hist-ts">${hl(e.ts)}</span></div>`;
const withDays = items => {
let out = '', lastDay = '';
for (const e of items) {
const day = _cjDayLabel(e.ts);
if (day !== lastDay) { out += `<div class="cj-day-sep">${_cjEsc(day)}</div>`; lastDay = day; }
out += item(e);
}
return out;
};
const todays = [], months = new Map();
for (const e of list) {
if (_cjDayLabel(e.ts) === '今天') { todays.push(e); continue; }
const d = new Date(e.ts);
const key = d.getFullYear() + '-' + (d.getMonth() + 1);
if (!months.has(key)) months.set(key, []);
months.get(key).push(e);
}
let out = todays.length ? withDays(todays) : '';
for (const [key, items] of months) {
const open = _cjHistOpen.has(key);
out += `<div class="cj-hist-mh${open ? ' on' : ''}" data-cj-m="${key}"><span class="cj-hist-mlab">${_cjEsc(_cjHistMonthLabel(key))}</span><span class="cj-hist-mn">${items.length} 条</span><i class="cj-hist-marr"></i><span class="cj-hist-mln"></span></div>`
+ `<div class="cj-hist-mbody" data-cj-mb="${key}"${open ? '' : ' hidden'}>${withDays(items)}</div>`;
}
return out;
}
var _cjMsEvents = [];
var _cjMsOpen = new Set();
function _cjMoodKeysOf(e) {
if (e.ma && CJ_MOODS[e.ma]) return [e.ma, e.mb && CJ_MOODS[e.mb] && e.mb !== e.ma ? e.mb : ''];
const t = String(e.t || '');
for (const k of CJ_MOOD_ORDER) {
if (!t.startsWith(CJ_MOODS[k].label)) continue;
const m = t.slice(CJ_MOODS[k].label.length).match(/^ · (\S+)/);
const sec = m ? CJ_MOOD_ORDER.find(x => x !== k && CJ_MOODS[x].label === m[1]) || '' : '';
return [k, sec];
}
return ['calm', ''];
}
function _cjMsDayLabel(ts) {
const d = new Date(ts); d.setHours(0, 0, 0, 0);
const t = new Date(); t.setHours(0, 0, 0, 0);
const diff = Math.round((t - d) / 86400000);
return diff === 0 ? '今天' : diff === 1 ? '昨天' : (d.getMonth() + 1) + '/' + d.getDate();
}
function _cjMsStrip(en) {
const ev = (en.hist || []).filter(e => e.k === 'm').slice(-20);
_cjMsEvents = ev;
if (!ev.length) return '<div class="cj-empty">还没有情绪换档的记录</div>';
const lab = k => CJ_MOODS[k] ? CJ_MOODS[k].label : k;
const day0 = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
const groups = {}, order = [];
for (const e of ev) { const d = day0(e.ts); if (!groups[d]) { groups[d] = []; order.push(d); } groups[d].push(e); }
const lastTs = ev[ev.length - 1].ts;
const topDay = Math.max.apply(null, order);
const hm = ts => { const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const sections = order.slice().reverse().map(dk => {
const list = groups[dk];
const chips = list.map(e => {
const [a, b] = _cjMoodKeysOf(e);
const isNow = e.ts === lastTs;
return `<button type="button" class="ms-ev${isNow ? ' now' : ''}" data-ms-i="${ev.indexOf(e)}"><span class="ms-ev-at">${isNow ? '现在 · ' : ''}${_cjEsc(hm(e.ts))}</span><span class="ms-ev-mo">${_cjEsc(lab(a))}${b ? `<i class="ms-ev-sec">＋${_cjEsc(lab(b))}</i>` : ''}</span></button>`;
}).join('<i class="ms-ev-arr" aria-hidden="true"></i>');
const isTop = dk === topDay;
const open = isTop || _cjMsOpen.has(dk);
const hcls = 'ms-day-h' + (isTop ? '' : ' ms-day-tog') + (open && !isTop ? ' on' : '');
const hat = isTop ? '' : ` data-ms-d="${dk}"`;
return `<div class="ms-day${open ? '' : ' off'}"><div class="${hcls}"${hat}><span class="ms-day-name">${_cjEsc(_cjMsDayLabel(dk))}</span><span class="ms-day-n">换档 ${list.length} 次</span><i class="ms-day-ln"></i>${isTop ? '' : '<i class="ms-day-arr"></i>'}</div><div class="ms-flow"${open ? '' : ' hidden'}>${chips}</div></div>`;
}).join('');
const last = ev[ev.length - 1];
return `${sections}<div class="cj-ms-cap" id="cjMsCap">${_cjEsc(last.t)} · ${_cjEsc(_cjClock(last.ts))}</div>`;
}
function renderCjianPage() {
const _soloId = (typeof soloTargetId === 'function') ? soloTargetId() : '';
const _pin = _cjSelPinned; _cjSelPinned = '';
if (_soloId && !(_pin && _cjContact(_pin) && !_cjIsGroup(_pin))) _cjSel = _soloId;
if (!_cjSel || !_cjContact(_cjSel) || _cjIsGroup(_cjSel)) {
const list = _cjSingles();
const own = list.find(c => c.id === data.activeChat) || list[0];
_cjSel = own ? own.id : '';
}
cjianTick();
const hero = new Date();
const hIdx = _cjShichenAt(hero.getHours());
const stH = CJ_SHICHEN_START[hIdx];
const half = (hero.getHours() * 60 + hero.getMinutes()) - stH * 60 < 60 ? CJ_SHICHEN[hIdx] + '初' : CJ_SHICHEN[hIdx] + '正';
$('#cjHeroHalf').textContent = half;
$('#cjHeroRange').textContent = _cjPad(stH) + ':00–' + _cjPad((stH + 2) % 24) + ':59 · 现实此刻 ' + _cjPad(hero.getHours()) + ':' + _cjPad(hero.getMinutes());
const bar = $('#cjOwners');
bar.hidden = !!_soloId;
bar.innerHTML = _soloId ? '' : _cjSingles().map(c =>
`<button type="button" class="av-chip cj-ow${c.id === _cjSel ? ' on' : ''}" data-cj-cid="${_cjEsc(c.id)}"><span class="av-chip-name">${_cjEsc(c.chatName || c.name || 'TA')}</span></button>`
).join('');
const on = _soloId ? null : bar.querySelector('.cj-ow.on');
if (on) bar.scrollLeft = on.offsetLeft - (bar.clientWidth - on.offsetWidth) / 2;
const whoEl = $('#cjHeroWho');
if (whoEl) {
const wc = _cjContact(_cjSel);
if (_soloId && wc) {
whoEl.innerHTML = '<b>' + _cjEsc(wc.chatName || wc.name || 'TA') + '</b><i class="cj-hero-who-m">· 单人模式</i>';
whoEl.hidden = false;
} else { whoEl.innerHTML = ''; whoEl.hidden = true; }
}
_cjRenderBody();
}
function cjSetTimeOn(on) {
const r = _cjRoot();
const next = !!on;
if ((r.timeOn !== false) === next) return next;
r.timeOn = next;
save();
if (typeof updateCjChip === 'function') { try { updateCjChip(); } catch (e) {} }
if (_cjPopCid) _cjPopPaint(_cjPopCid);
if (document.body && document.body.dataset.view === 'cjian') _cjRenderBody();
return next;
}
function _cjTimeTgHTML(on) {
return `<button type="button" class="cj-tg hub-tg${on ? '' : ' off'}" data-cj-timeon="1" aria-pressed="${on ? 'true' : 'false'}" aria-label="${on ? '关闭时间感知' : '打开时间感知'}"></button>`;
}
function cjSetChipOn(on) {
const r = _cjRoot();
const next = !!on;
if ((r.chipOn !== false) === next) return next;
r.chipOn = next;
save();
if (typeof updateCjChip === 'function') { try { updateCjChip(); } catch (e) {} }
return next;
}
function cjSetHideOn(on) {
const r = _cjRoot();
const next = !!on;
if ((r.hideOn !== false) === next) return next;
r.hideOn = next;
if (!next) {
const now = Date.now();
for (const cid of Object.keys(r.by)) {
const en = r.by[cid];
if (en && _cjHiding(en)) _cjHideEnd(cid, en, now, false);
}
}
save();
if (typeof updateCjChip === 'function') { try { updateCjChip(); } catch (e) {} }
_cjNowPatch();
if (document.body && document.body.dataset.view === 'cjian') _cjRenderBody();
return next;
}
function cjSetHideProb(v) {
const r = _cjRoot();
const n = Math.round(Number(v));
const p = (typeof n === 'number' && isFinite(n)) ? Math.max(0, Math.min(100, n)) : CJ_HIDE_PROB_DEF;
if (Number(r.hideProb) === p) return p;
r.hideProb = p;
save();
return p;
}
function cjSetHideWake(v) {
const r = _cjRoot();
const n = Math.round(Number(v));
const p = (typeof n === 'number' && isFinite(n)) ? Math.max(0, Math.min(100, n)) : CJ_HIDE_WAKE_DEF;
if (Number(r.hideWake) === p) return p;
r.hideWake = p;
save();
return p;
}
function _cjSetCardHTML() {
const cid = _cjSel;
if (!cid || _cjIsGroup(cid) || !_cjContact(cid)) return '';
const en = _cjEntry(cid);
const cur = _cjCardProbOf(en);
const chips = [[0, '关'], [20, '少'], [CJ_CARD_PROB_DEF, '适中'], [65, '勤']].map(([v, n]) =>
`<button type="button" class="cj-chip-set${cur === v ? ' on' : ''}" data-cj-cardprob="${v}">${n}</button>`).join('');
const now = _cjCardProbRead(en) ? _cjCardProbRead(en) + ' · 连着三次没抽中，第四次必定发一张。' : '这一位现在不发卡。';
return `
    <div class="sx-sec">
      <div class="cj-set-row">
        <span class="cj-set-k"><b>感知卡</b><i>把此刻发进聊天</i></span>
      </div>
      <p class="sx-rng">大约每 1.5–5 小时看一次机会，抽中就把「${_cjEsc(_cjName(cid))}」此刻的感知（TA 侧六行＋「TA 读到的你」）发成一张卡落进聊天；连着三次没抽中，第四次必定发一张。夜深（23:00–07:00）与「主动消息管理」里关掉的那位，这段时间一次机会都不掷，等白天回来接着掷。档位只对这一位生效，每位各记各的。</p>
      <div class="cj-chips cj-card-prob">${chips}</div>
      <p class="cj-card-note">现在：${now}精确数值也可以去「聊天设置 → 主动 → 感知卡」填 0–100。</p>
      <div class="cj-card-foot"><button type="button" class="cj-btn cj-btn-sec" id="cjCardSend">现在发一张</button><span class="cj-card-foot-note">只发这一位 · 随时可关</span></div>
    </div>`;
}
function _cjSetHTML() {
const r = _cjRoot();
const on = r.hideOn !== false;
const prob = _cjHideProbOf(r), wake = _cjHideWakeOf(r);
const talkOn = r.talkBlinkOn !== false, talkProb = _cjTalkBlinkProbOf(r);
const talkProbRow = talkOn ? `
      <div class="sx-sec">
        <div class="sx-lb"><span>触发概率</span><i>${talkProb}%</i></div>
        <div class="cj-set-prob"><input type="number" id="cjTalkBlinkProb" class="cj-tb-num cj-set-num" min="0" max="100" step="1" inputmode="numeric" value="${talkProb}"><span class="cj-tb-u">%</span></div>
        <p class="sx-rng">0 ~ 100，出厂 5%。TA 主动发消息或回复你时，有小概率顺手换一档「此刻在做」；已读不回、多久来找你也跟着新的一档走。刚换过档的几分钟内不会再换。</p>
      </div>` : '';
const talkSec = `
    <div class="sx-sec">
      <div class="cj-set-row">
        <span class="cj-set-k"><b>TA 开口时状态可能变</b><i>出厂开启</i></span>
        <button type="button" class="cj-tg hub-tg${talkOn ? '' : ' off'}" data-cj-talkblink="1" aria-pressed="${talkOn ? 'true' : 'false'}" aria-label="${talkOn ? '关闭聊天触动换状态' : '打开聊天触动换状态'}"></button>
      </div>
      ${talkOn ? '' : '<p class="sx-rng">现在关着：TA 主动发消息或回复你时，不会顺手换「此刻在做」那一档。</p>'}
    </div>${talkProbRow}`;
const hideRows = on ? `
    <div class="sx-sec">
      <div class="sx-lb"><span>每次机会触发概率</span><i>${prob}%</i></div>
      <div class="cj-set-prob"><input type="number" id="cjHideProb" class="cj-tb-num cj-set-num" min="0" max="100" step="1" inputmode="numeric" value="${prob}"><span class="cj-tb-u">%</span></div>
      <p class="sx-rng">0 ~ 100。0＝TA 不再主动收起状态；出厂 10%。每位联系人各自一条机会钟，大约每 2–6 小时看一次；夜里更容易收起，白天更容易露出来，正聊着不会突然消失。收起后 15 分钟到 6 小时不等，到点自己回来。</p>
    </div>
    <div class="sx-sec">
      <div class="sx-lb"><span>暂停中点感知的唤醒概率</span><i>${wake}%</i></div>
      <div class="cj-set-prob"><input type="number" id="cjHideWake" class="cj-tb-num cj-set-num" min="0" max="100" step="1" inputmode="numeric" value="${wake}"><span class="cj-tb-u">%</span></div>
      <p class="sx-rng">0 ~ 100。0＝只能等 TA 自己回来；出厂 55%。第一次没叫应，第二次会更容易些，第三次一定回来。感知方位也算主动叫他。</p>
    </div>
    <div class="sx-sec">
      <div class="sx-lb"><span>感知一下也会顺手刷新状态</span><i>固定手感</i></div>
      <p class="sx-rng">点「感知此刻」时：距离超过 15 分钟有 70% 的机会重掷；「在做」有 35% 的机会换档；签名有 45% 的机会换一句。三轴各自掷，没中就说没读出变化。暂停期间这一发要先唤醒，叫应之后只报当下的状态。</p>
    </div>` : `
    <div class="sx-sec">
      <p class="sx-rng">现在已经关掉：TA 不会再主动收起状态，当前若有暂停也已经结束。重新打开就照出厂节奏继续。</p>
    </div>`;
return `<p class="sx-pane-lead">这一页管三件事：<b>TA 开口时会不会顺手换一档状态</b>、<b>TA 会不会主动把状态收起来</b>，以及<b>感知卡发不发、多勤地发</b>（档位按人各记各的）。都只改「怎么读／怎么显示」，不新增功能入口；关掉就回到最安静的样子。</p>
    ${talkSec}
    <div class="sx-sec">
      <div class="cj-set-row">
        <span class="cj-set-k"><b>TA 可以主动收起状态</b><i>出厂开启</i></span>
        <button type="button" class="cj-tg hub-tg${on ? '' : ' off'}" data-cj-hideon="1" aria-pressed="${on ? 'true' : 'false'}" aria-label="${on ? '关闭状态暂隐' : '打开状态暂隐'}"></button>
      </div>
      <p class="sx-rng">收起后屏上不显示假读数、也不留暂停前的旧读数；TA 的作息与「已读不回／多久来找你」的概率照旧，只是不给你看。</p>
    </div>
    ${hideRows}
    ${_cjSetCardHTML()}
    <div class="sx-sec">
      <button type="button" class="cj-btn cj-btn-sec" id="cjHideReset">恢复这一页的出厂</button>
    </div>`;
}
function _cjPaintSet() {
const host = $('#cjSetBody');
if (!host) return;
host.innerHTML = _cjSetHTML();
}
function _cjOpenSet() {
_cjPaintSet();
const m = $('#cjSetMask');
if (m) m.hidden = false;
}
function _cjCloseSet() { const m = $('#cjSetMask'); if (m) m.hidden = true; }
function _cjResetSet() {
const r = _cjRoot();
r.talkBlinkOn = true; r.talkBlinkProb = 5;
r.hideOn = true; r.hideProb = CJ_HIDE_PROB_DEF; r.hideWake = CJ_HIDE_WAKE_DEF;
const en0 = (_cjSel && _cjContact(_cjSel) && !_cjIsGroup(_cjSel)) ? _cjEntry(_cjSel) : null;
if (en0) { delete en0.cardProb; en0.cardNext = 0; }
save();
_cjPaintSet();
if (typeof updateCjChip === 'function') { try { updateCjChip(); } catch (e) {} }
_cjNowPatch();
if (document.body && document.body.dataset.view === 'cjian') _cjRenderBody();
showToast('已恢复出厂：TA 开口换状态开启 · 5% ∶ 状态暂隐开启 · 10% · 唤醒 55% ∶ 感知卡回出厂档');
}
function _cjRenderBody() {
const root = $('#cjBody');
if (!root) return;
const cid = _cjSel;
const c = _cjContact(cid);
if (!c) { root.innerHTML = '<div class="cj-empty">还没有联系人</div>'; return; }
const en = _cjEntry(cid);
const r = _cjRoot();
_cjWorldHour(en);
const w = en.world || {};
const histTotal = (en.hist || []).length;
const histN = _cjHistF === 'all' ? histTotal : _cjHistList(en).length;
const curSh = _cjShichenAt(w.hh || 0);
const shStrip = `<div class="cj-sh-strip">${CJ_SHICHEN.map((s, i) => `<i class="${(i <= 2 || i === 11) ? 'n ' : ''}${i === curSh ? 'on' : ''}">${s}</i>`).join('')}</div>`;
const todayRows = (() => {
const cur = curSh;
let out = '';
for (let k = 0; k < 12; k++) {
const idx = (cur + k) % 12;
const rowH = CJ_SHICHEN_START[idx];
const ph = k === 0 ? _cjPredictPhrase(en.p, en.a) : _cjPredictPhrase(_cjPickWeighted(_cjPresenceWeights(rowH)), _cjPickWeighted(_cjActivityWeights(rowH)));
out += `<div class="cj-today-row"><span class="cj-today-sh">${CJ_SHICHEN[idx]}时</span><span class="cj-today-range">${_cjPad(rowH)}:00–${_cjPad((rowH + 2) % 24)}:59</span><span class="cj-today-ph">${ph}</span></div>`;
}
return out;
})();
const conn = cjConnOf(cid);
const moodDesc = (CJ_MOODS[en.mo] || CJ_MOODS.calm).desc;
const moodTag = _cjHiding(en) ? '状态暂隐' : moodDesc;
const wxK = _cjEnsureWeather(en);
const msHtml = _cjMsStrip(en);
const skyBand = `<div class="cj-skyband" data-dp="${_cjDaypart(_cjWorldHour(en))}">
      <div class="cj-wx">${_cjWxSVG(wxK)}</div>
      <span class="cj-sky-cap">${_cjEsc(CJ_WEATHER[wxK])}</span>
      <div class="cj-sky-ghost"></div>
    </div>`;
root.innerHTML = `<div class="cj-tabs" id="cjTabs">${CJ_TABS.map(t => `<button type="button" class="cj-tab${t.k === _cjTab ? ' on' : ''}" data-cj-tab="${t.k}">${t.name}</button>`).join('')}</div>
    ${r.timeOn === false ? `<div class="cj-card" data-cj-card="time">
      <div class="cj-card-title">时间感知 <span class="cj-card-tag">已关闭</span>${_cjTimeTgHTML(false)}</div>
      <div class="cj-time-off">TA 那边的时间不再显示：这张卡、聊天顶栏那行时刻、速览小框里的时间与时辰，以及 TA 按时辰说出的那句话都停着。天气和其余读数不受影响，重新打开就原样回来。</div>
    </div>` : `<div class="cj-card" data-cj-card="time">
      <div class="cj-card-title">TA那边的时间 <span class="cj-card-tag">${_cjEsc(_cjOffsetLabel(en))}</span>${_cjTimeTgHTML(true)}</div>
      ${skyBand}
      <div class="cj-time-row"><span class="cj-time-hhmm">${_cjPad(w.hh || 0)}:${_cjPad(w.mm || 0)}</span><span class="cj-time-half">${_cjEsc(w.half || '')}</span><span class="cj-time-part">${_cjEsc(CJ_TIMEPART[_cjTimePartOf(en)].label)}</span></div>
      <div class="cj-time-date">${_cjEsc(_cjWorldDateLabel(en))}</div>
      <div class="cj-time-note">${_cjEsc(_cjTimeNote(en))}</div>
      <div class="cj-time-note">TA 那边的当地时间是随机定的 · 每隔 1 到 8 小时换一次</div>
    </div>`}
    <div class="cj-card" data-cj-card="now">
      <div class="cj-card-title">此刻感知</div>
      <div id="cjNowLive">${_cjNowLiveHTML(en)}</div>

    </div>
    <div class="cj-perceive-block">
      <div class="cj-perceive-bar">
        <button type="button" class="cj-btn" id="cjPerceiveBtn">感知此刻</button>
        <button type="button" class="cj-btn cj-btn-sec" id="cjPerceiveDirBtn">感知方位</button>
      </div>
      <div class="cj-perceive-result" id="cjPerceiveResult" hidden></div>
    </div>
    <div class="cj-card" data-cj-card="dir">
      <div class="cj-card-title">方位感知 <span class="cj-card-tag">模糊感觉 · 不是精确定位</span></div>
      <div id="cjDirLive">${_cjDirLiveHTML(en)}</div>
    </div>
    <div class="cj-card" data-cj-card="conn">
      <div class="cj-card-title">连接感知 <span class="cj-card-tag">${_cjEsc(conn.tag)}</span></div>
      ${conn.level ? `
        <div class="cj-conn-top"><span class="cj-conn-level">${_cjEsc(conn.label)}</span><span class="cj-conn-desc">${_cjEsc(conn.desc)}</span></div>
        <div class="cj-conn-scale">${CJ_CONN_LEVELS.map((x, i) => `<i${i < conn.rank ? ' class="on"' : ''}></i>`).join('')}</div>
        <div class="cj-conn-lab">${CJ_CONN_LEVELS.map(x => `<span>${x.label}</span>`).join('')}</div>`
        : `<div class="cj-conn-none">${_cjEsc(conn.reason)}</div>`}
      <div class="cj-facts">${conn.rows.map(r => `<span>${_cjEsc(r[0])}</span><b>${_cjEsc(r[1])}</b>`).join('')}</div>
      ${conn.note ? `<div class="cj-note">${_cjEsc(conn.note)}</div>` : ''}
      ${_cjNgLine(en)}
    </div>
    ${r.moodOn === false ? '' : `
    <div class="cj-card" data-cj-card="mood">
      <div class="cj-card-title">情绪感知 <span class="cj-card-tag">${_cjEsc(moodTag)}</span></div>
      ${_cjMoodPair(en)}
    </div>`}
    <div class="cj-card" data-cj-card="today">
      <div class="cj-card-title">TA 的今日 <span class="cj-card-tag">按十二时辰猜的，不是日程表</span></div>
      ${shStrip}
      <div class="cj-today">${todayRows}</div>
    </div>
    <div class="cj-card" data-cj-card="moodstrip">
      <div class="cj-card-title">情绪轨迹 <span class="cj-card-tag">近 ${_cjMsEvents.length} 次换档</span></div>
      ${msHtml}
    </div>
    <div class="cj-card" data-cj-card="hist">
      <div class="cj-card-title">历史记录 <span class="cj-card-tag" id="cjHistCount">${histN === histTotal ? histTotal + ' 条' : histN + '/' + histTotal + ' 条'}</span><button type="button" class="cj-clear" id="cjHistClear"${histTotal ? '' : ' hidden'}>清空</button></div>
      <div class="cj-chips cj-hist-f" id="cjHistF">${CJ_HIST_F.map(f => `<button type="button" class="cj-chip-set${f.k === _cjHistF ? ' on' : ''}" data-cj-hf="${f.k}">${f.name}</button>`).join('')}</div>
      <div class="cj-hist" id="cjHistList">${_cjHistHTML(en)}</div>
    </div>`;
const _g = {}; CJ_TABS.forEach(t => t.cards.forEach(c => { _g[c] = t.k; }));
root.querySelectorAll('[data-cj-card]').forEach(el => { el.dataset.cjGroup = _g[el.dataset.cjCard] || 'state'; });
root.dataset.cjCur = _cjTab;
}
function _cjPerceiveShow(mode) {
const lines = cjianPerceive(mode);
if (!lines) return;
_cjRenderBody();
const box = $('#cjPerceiveResult');
if (!box) return;
box.innerHTML = lines.map(l => `<p>${_cjEsc(l)}</p>`).join('');
box.hidden = false;
}
function bindCjianView() {
$('#cjOwners').addEventListener('click', e => {
const chip = e.target.closest('[data-cj-cid]');
if (!chip || chip.dataset.cjCid === _cjSel) return;
_cjSel = chip.dataset.cjCid;
_cjMsOpen.clear();
renderCjianPage();
});
$('#cjBody').addEventListener('click', e => {
const tt = e.target.closest('[data-cj-timeon]');
if (tt) { cjSetTimeOn(_cjRoot().timeOn === false); return; }
const tbt = e.target.closest('[data-cj-talkblink]');
if (tbt) { cjSetTalkBlink(_cjRoot().talkBlinkOn === false); return; }
const tb = e.target.closest('[data-cj-tab]');
if (tb) {
const k = tb.dataset.cjTab;
if (k === _cjTab) return;
_cjTab = k;
const body = $('#cjBody');
body.dataset.cjCur = k;
body.querySelectorAll('.cj-tab').forEach(b => b.classList.toggle('on', b.dataset.cjTab === k));
try { localStorage.setItem(CJ_TAB_KEY, k); } catch (err) {}
const pg = $('.cj-page');
if (pg) pg.scrollTop = 0;
return;
}
const pv = e.target.closest('#cjPerceiveBtn');
if (pv) { _cjPerceiveShow('now'); return; }
const pdv = e.target.closest('#cjPerceiveDirBtn');
if (pdv) { _cjPerceiveShow('dir'); return; }
const hc = e.target.closest('#cjHistClear');
if (hc) {
const sel = _cjSel;
openModal('清空历史', '', () => {
_cjEntry(sel).hist = [];
save();
_cjRenderBody();
}, { noInput: true, staticText: '清空这条时间线上的全部历史记录？不可恢复。', okText: '清空', danger: true });
return;
}
const mh = e.target.closest('[data-cj-m]');
if (mh) {
const key = mh.dataset.cjM;
const open = !_cjHistOpen.has(key);
if (open) _cjHistOpen.add(key); else _cjHistOpen.delete(key);
mh.classList.toggle('on', open);
const mb = document.querySelector('#cjBody [data-cj-mb="' + key + '"]');
if (mb) mb.hidden = !open;
return;
}
const hf = e.target.closest('[data-cj-hf]');
if (hf) {
_cjHistF = CJ_HIST_F.some(f => f.k === hf.dataset.cjHf) ? hf.dataset.cjHf : 'all';
document.querySelectorAll('#cjBody [data-cj-hf]').forEach(b => b.classList.toggle('on', b.dataset.cjHf === _cjHistF));
const en0 = _cjEntry(_cjSel);
const total = (en0.hist || []).length, n = _cjHistList(en0).length;
const cnt = $('#cjHistCount');
if (cnt) cnt.textContent = n === total ? total + ' 条' : n + '/' + total + ' 条';
const list = $('#cjHistList');
if (list) list.innerHTML = _cjHistHTML(en0);
return;
}
const md = e.target.closest('[data-ms-d]');
if (md) {
const key = Number(md.dataset.msD);
const open = !_cjMsOpen.has(key);
if (open) _cjMsOpen.add(key); else _cjMsOpen.delete(key);
md.classList.toggle('on', open);
const day = md.parentElement;
const box = day ? day.querySelector('.ms-flow') : null;
if (box) box.hidden = !open;
if (day) day.classList.toggle('off', !open);
return;
}
const ms = e.target.closest('[data-ms-i]');
if (ms) {
const ev = _cjMsEvents[Number(ms.dataset.msI)];
const cap = $('#cjMsCap');
if (ev && cap) cap.textContent = ev.t + ' · ' + _cjClock(ev.ts);
return;
}
});
const setBtn = $('#cjSetBtn');
if (setBtn) setBtn.addEventListener('click', _cjOpenSet);
const setClose = $('#cjSetClose');
if (setClose) setClose.addEventListener('click', _cjCloseSet);
const setMask = $('#cjSetMask');
if (setMask) setMask.addEventListener('click', e => { if (e.target === setMask) _cjCloseSet(); });
const setBody = $('#cjSetBody');
if (setBody) {
setBody.addEventListener('click', e => {
const cb = e.target.closest('[data-cj-cardprob]');
if (cb) {
const en = _cjEntry(_cjSel);
const p = Number(cb.dataset.cjCardprob) || 0;
if (_cjCardProbOf(en) !== p) { en.cardProb = p; en.cardNext = 0; save(); }
_cjPaintSet();
showToast(p ? '感知卡：大约每 1.5–5 小时看一次机会，抽中就发一张' : '感知卡已关');
return;
}
if (e.target.closest('#cjCardSend')) { cjCardSend(_cjSel); return; }
if (e.target.closest('[data-cj-talkblink]')) { cjSetTalkBlink(_cjRoot().talkBlinkOn === false); _cjPaintSet(); return; }
if (e.target.closest('[data-cj-hideon]')) { cjSetHideOn(_cjRoot().hideOn === false); _cjPaintSet(); return; }
if (e.target.closest('#cjHideReset')) { _cjResetSet(); return; }
});
setBody.addEventListener('change', e => {
if (!e.target) return;
if (e.target.id === 'cjTalkBlinkProb') {
const p = cjSetTalkBlinkProb(e.target.value);
e.target.value = p;
_cjPaintSet();
showToast(p ? 'TA 每次开口有 ' + p + '% 的机会顺手换一档状态' : '填 0 ＝这一掷关掉（开关也关着时同样不掷）');
} else if (e.target.id === 'cjHideProb') {
const p = cjSetHideProb(e.target.value);
e.target.value = p;
_cjPaintSet();
showToast(p ? '这一位每次机会约 ' + p + '% 会收起状态' : '已关：TA 不再主动收起状态');
} else if (e.target.id === 'cjHideWake') {
const p = cjSetHideWake(e.target.value);
e.target.value = p;
_cjPaintSet();
showToast(p ? '暂停中点感知，第一次 ' + p + '% 能叫回来' : '唤醒关着：只能等 TA 自己回来');
}
});
}
}
function openCjian(cid) {
_cjSelPinned = cid || '';
if (cid) _cjSel = cid;
showView('cjian');
}
var _cjPopCid = '';
function _cjPopRow(k, v, cls) {
return '<div class="cj-pop-row' + (cls ? ' ' + cls : '') + '"><span class="cj-pop-k">' + k + '</span><span class="cj-pop-v">' + _cjEsc(v) + '</span></div>';
}
function _cjSnapshot(cid) {
const en = _cjEntry(cid);
_cjWorldHour(en);
const conn = typeof cjConnOf === 'function' ? cjConnOf(cid) : null;
const connTxt = conn && conn.level ? conn.label + ' · ' + conn.desc : (conn ? conn.reason : '');
const w = en.world || {};
const root = _cjRoot();
const taTimeRow = { k: 'TA 那边', v: root.timeOn === false ? CJ_WEATHER[_cjEnsureWeather(en)]
: _cjPad(w.hh || 0) + ':' + _cjPad(w.mm || 0) + ' · ' + CJ_TIMEPART[_cjTimePartOf(en)].label + ' · ' + CJ_WEATHER[_cjEnsureWeather(en)] + ' · ' + _cjOffsetLabel(en) };
let ta;
if (_cjHiding(en)) {
const sp = _cjHideSpanOf(en);
ta = [{ k: '状态', v: '暂隐 · ' + sp.label + ' · 约 ' + _cjHideLeftText(en) + ' 后回来' },
{ k: '连接', v: connTxt }, taTimeRow];
} else {
const pk = CJ_PRESENCE[CJ_PRESENCE[en.p] ? en.p : 'nearby'];
const av = _cjDoText(en);
const dk = CJ_DIR[CJ_DIR[en.dir] ? en.dir : 'none'];
const dirTxt = dk && dk.label !== '无法判断' ? ' · ' + (dk.arrow ? dk.arrow + ' ' : '') + dk.label : '';
ta = [
{ k: '感知', v: pk.label + dirTxt + ' · ' + pk.desc },
{ k: '在做', v: CJ_ACTIVITY[CJ_ACTIVITY[en.a] ? en.a : 'free'].label + (av ? '——' + av : '') },
{ k: '签名', v: en.status || '—' },
{ k: '心情', v: _cjMoodPairLabel(en.mo, _cjMood2(CJ_MOODS[en.mo] ? en.mo : 'calm', en.mo2)) },
{ k: '连接', v: connTxt },
taTimeRow
];
}
const you = [];
if (root.moodOn !== false) {
you.push({ k: '心情', v: _cjMoodPairLabel(en.moRead, _cjMood2(CJ_MOODS[en.moRead] ? en.moRead : 'calm', en.moRead2)) });
if (root.btOn !== false) you.push({ k: '读到的心动', v: CJ_BT[CJ_BT[en.btRead] ? en.btRead : 'flat'].label });
if (root.undOn !== false) you.push({ k: '接住', v: CJ_UND[CJ_UND[en.unYou] ? en.unYou : 'flat'].label });
}
const say = (root.moodOn !== false && root.readOn !== false && en.rdSay) ? String(en.rdSay) : '';
return { at: Date.now(), who: _cjName(cid), ta: ta, you: you, say: say, sayAt: say ? (en.rdSayTs || 0) : 0 };
}
function _cjPopRows(cid) {
const s = _cjSnapshot(cid);
let html = s.ta.map((r, i) => _cjPopRow(r.k, r.v, i === 0 ? 'lead' : '')).join('');
if (s.you.length || s.say) {
let you = s.you.map(r => _cjPopRow(r.k, r.v)).join('');
if (s.say) {
you += '<div class="cj-pop-say"><div class="cj-pop-say-t">' + _cjEsc(s.say) + '</div>'
+ '<div class="cj-pop-say-at">TA 读你时说的 · ' + _cjEsc(_cjClock(s.sayAt)) + '</div></div>';
}
html += '<div class="cj-pop-sep"></div><div class="cj-pop-hd">你<span class="cj-pop-hd-n">TA 读到的你</span></div>'
+ '<div class="cj-pop-you">' + you + '</div>';
}
return html;
}
function _cjCardText(m) {
const d = (m && m.wcard) || null;
if (!d) return '';
const rows = (Array.isArray(d.ta) ? d.ta : []).concat(Array.isArray(d.you) ? d.you : []);
return rows.map(r => (r && r.k ? r.k + '：' : '') + ((r && r.v) || '')).join(' · ') + (d.say ? ' · ' + d.say : '');
}
function _cjWorldCardHTML(m) {  const d = (m && m.wcard) || {};
const ta = Array.isArray(d.ta) ? d.ta : [];
const you = Array.isArray(d.you) ? d.you : [];
if (!ta.length && !you.length) return '';
const row = r => '<div class="cjw-row"><span class="cjw-k">' + _cjEsc(r && r.k) + '</span><span class="cjw-v">' + _cjEsc(r && r.v) + '</span></div>';
let html = '<div class="bubble cjw-card" data-cjw-card="' + escapeHTML(String(m.id)) + '">'
+ '<div class="cjw-hd"><span class="cjw-t">世界感知</span><span class="cjw-who">' + _cjEsc(d.who || '') + '</span>'
+ '<span class="cjw-at">' + _cjEsc(_cjClock(d.at)) + '</span></div>'
+ '<div class="cjw-ta">' + ta.map(row).join('') + '</div>';
if (you.length) {
html += '<div class="cjw-you"><div class="cjw-shd"><b>你</b><i>TA 读到的你</i></div>' + you.map(row).join('') + '</div>';
}
if (d.say) {
html += '<div class="cjw-say"><p class="cjw-say-t">' + _cjEsc(d.say) + '</p>'
+ '<p class="cjw-say-at">TA 读你时说的 · ' + _cjEsc(_cjClock(d.sayAt)) + '</p></div>';
}
return html + '</div>';
}
var CJ_CARD_PROB_DEF = 40;
var CJ_CARD_MIN_MIN = 90, CJ_CARD_MAX_MIN = 300;
var CJ_CARD_FIRST_MIN = 30, CJ_CARD_FIRST_MAX = 90;
var CJ_CARD_CATCH_MAX = 3;
var CJ_CARD_MISS_MAX = 3;
function _cjCardProbOf(en) {
if (!en || typeof en.cardProb !== 'number' || !isFinite(en.cardProb)) return CJ_CARD_PROB_DEF;
return Math.min(100, Math.max(0, Math.round(en.cardProb)));
}
function _cjCardPerDay(p) {
if (!p) return '';
const n = 1440 / ((CJ_CARD_MIN_MIN + CJ_CARD_MAX_MIN) / 2) * p / 100;
return (n >= 1.5 ? String(Math.round(n)) : String(Math.round(n * 10) / 10)) + ' 张';
}
function _cjCardProbRead(en, factoryMark) {
const p = _cjCardProbOf(en);
if (!p) return '';
return '每次机会 ' + p + '%' + (factoryMark ? '（出厂）' : '') + ' · 这一位一天约 ' + _cjCardPerDay(p);
}
function cjCardSend(cid, silent) {
if (!cid || _cjIsGroup(cid) || !_cjContact(cid)) return false;
if (typeof _deliverToChat !== 'function' || typeof nextId !== 'function') return false;
const snap = _cjSnapshot(cid);
_cjDeliver({ id: nextId(), from: 'partner', text: '', unread: true, wcard: snap }, cid, 'card');
if (!silent) showToast('「' + _cjName(cid) + '」把此刻的感知发来了一张卡');
return true;
}
function _cjCardTick(cid, en, now) {
const p = _cjCardProbOf(en);
if (!p) {
if (en.cardNext || en.cardMiss) { delete en.cardNext; delete en.cardMiss; return true; }
return false;
}
const next = (typeof en.cardNext === 'number' && isFinite(en.cardNext)) ? en.cardNext : 0;
if (!next) { en.cardNext = now + _cjRi(CJ_CARD_FIRST_MIN, CJ_CARD_FIRST_MAX) * 60000; return true; }
if (now < next) return false;
if (typeof nightOn === 'function' && nightOn()) return false;
if (typeof chatSilentOn === 'function' && chatSilentOn(cid)) return false;
if (_cjHiding(en)) return false;
const slotMs = (CJ_CARD_MIN_MIN + CJ_CARD_MAX_MIN) / 2 * 60000;
const rounds = Math.min(CJ_CARD_CATCH_MAX, Math.max(1, Math.floor((now - next) / slotMs) + 1));
const miss = (typeof en.cardMiss === 'number' && en.cardMiss > 0) ? en.cardMiss : 0;
en.cardNext = now + _cjRi(CJ_CARD_MIN_MIN, CJ_CARD_MAX_MIN) * 60000;
let sent = false;
for (let i = 0; i < rounds; i++) {
if (miss + i >= CJ_CARD_MISS_MAX || Math.random() * 100 < p) { sent = true; break; }
}
en.cardMiss = sent ? 0 : Math.min(CJ_CARD_MISS_MAX, miss + rounds);
if (sent) cjCardSend(cid, true);
return true;
}
function cjPopOpen(cid) {
const pop = $('#cjPop'), mask = $('#cjPopMask');
if (!pop || !mask || !cid || _cjIsGroup(cid) || !_cjContact(cid)) return;
_cjPopCid = cid;
const who = $('#cjPopWho');
if (who) who.textContent = _cjName(cid);
pop.hidden = false; mask.hidden = false;
const body = $('#cjPopBody');
if (body) body.scrollTop = 0;
_cjPopPaint(cid);
}
function _cjPopPaint(cid) {
const pb = $('#cjPopBody'), pp = $('#cjPop');
if (!pb || !pp || pp.hidden) return;
pb.innerHTML = _cjPopRows(cid);
_cjPopHint();
}
function _cjPopHint() {
const pb = $('#cjPopBody');
if (!pb) return;
const over = pb.scrollHeight - pb.clientHeight > 2;
const atBottom = pb.scrollTop + pb.clientHeight >= pb.scrollHeight - 2;
pb.classList.toggle('is-more', over && !atBottom);
}
function cjPopClose() {
const pop = $('#cjPop'), mask = $('#cjPopMask');
if (pop) pop.hidden = true;
if (mask) mask.hidden = true;
_cjPopCid = '';
}
(function () {
const mask = $('#cjPopMask'), pop = $('#cjPop');
if (!mask || !pop) return;
mask.addEventListener('click', () => cjPopClose());
const x = $('#cjPopClose');
if (x) x.addEventListener('click', () => cjPopClose());
const more = $('#cjPopMore');
if (more) more.addEventListener('click', () => { const cid = _cjPopCid; cjPopClose(); if (cid) openCjian(cid); });
const pb = $('#cjPopBody');
if (pb) pb.addEventListener('scroll', () => _cjPopHint(), { passive: true });
window.addEventListener('resize', () => { if (!pop.hidden) _cjPopHint(); }, { passive: true });
})();
bindCjianView();
setInterval(function () { if (document.hidden) return; updateCjChip(); }, 20000);
var _cjChipEl = $('#cjChip');
if (_cjChipEl) _cjChipEl.addEventListener('click', () => cjPopOpen(data.activeChat));
if (typeof updateCjChip === 'function') { try { updateCjChip(); } catch (e) {} }
(function () {
const list = $('#messageList');
if (!list) return;
list.addEventListener('click', e => {
const opt = e.target.closest('[data-taq-opt]');
if (!opt) return;
const cardEl = opt.closest('[data-taq-id]');
if (!cardEl) return;
const m = data.messages.find(x => String(x.id) === cardEl.dataset.taqId);
if (!m || !m.taAsk || m.taAsk.status !== 'waiting') return;
const pick = String(opt.dataset.taqOpt || '');
if (!pick) return;
m.taAsk.pick = pick;
m.taAsk.status = 'answered';
data.messages.push({ id: nextId(), from: 'me', text: pick, quote: m.text, time: time(), date: new Date().toLocaleDateString('zh-CN') });
save();
if (typeof patchMessage === 'function') patchMessage(m);
if (typeof inLocateMode === 'function' && inLocateMode()) { try { jumpToLatest(); } catch (err) {} }
else renderMessages();
const reply = _cjGroupText('TA的回答');
if (reply) setTimeout(() => _cjDeliver({ id: nextId(), from: 'partner', text: reply, unread: true }, data.activeChat), 2200 + Math.random() * 2600);
});
})();
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['cjian'] = true;
