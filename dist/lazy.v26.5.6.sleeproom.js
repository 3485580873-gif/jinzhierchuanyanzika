// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
(function () {
'use strict';
var SR_KEY = 'ordinal-sleeproom';
var AC = null, master = null;
var bgBus = null, trBus = null, whBus = null;
var live = new Map();
var playing = false;
var schedT = null;
var dropTimers = new Set();
var srMsgs = [];
var _setTab = 'live';
var bufs = {};
var whT = null, whNextK = '';
var whCount = 0;
var whSrc = null;
var whAir = null;
var srEndsAt = 0;
var dimG = null;
var compN = null;
var softN = null, cutN = null;
var whWet = null;
var whQ = [], whBusy = false;
var whNetDown = false;
var whPauseK = '';
var _awayAt = 0;
var _srDuckOn = false;
var SR_TR_GAIN = 1.5;
var _mkCtx = null;
var _srMode = 'live';
var _srMusic = { audio: null, id: '', who: '', timer: null, fade: null, seq: 0, planMode: '', planTid: '', planPlid: '', badOnce: false, shownSeg: -1 };
var _srMusicUrls = {};
var _srMusicLast = [];
var _srPlan = { plan: null, idx: -1, segT: null, segEndsAt: 0, view: 'list', edit: null, seg: null };
var _srPick = { open: false, target: '', back: 'list' };
function _esc(v) {
return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
});
}
function _srMsgId() { return 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36); }
function _srPush(who, text, kind) {
srMsgs.push({ id: _srMsgId(), who: who, text: String(text || ''), kind: kind || 'say' });
if (srMsgs.length > 80) srMsgs.splice(0, srMsgs.length - 80);
}
function _srSys(text) {
var d = new Date();
var hh = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
_srPush('sys', hh + ' · ' + text, 'sys');
}
function srRead() {
var o = null;
try { o = JSON.parse(localStorage.getItem(SR_KEY) || '{}'); } catch (e) { o = null; }
if (!o || typeof o !== 'object') o = {};
function num(v, d, lo, hi) { v = Number(v); if (!isFinite(v)) return d; return Math.min(hi, Math.max(lo, v)); }
var mates = (o.mates && typeof o.mates === 'object' && o.mates.length !== undefined)
? o.mates.filter(function (x) { return typeof x === 'string'; }) : [];
var mode = (o.whMode === 'long' || o.whMode === 'short') ? o.whMode : 'rand';
return {
vol: num(o.vol, 80, 0, 100),
volBg: num(o.volBg, 75, 0, 100),
volTrig: num(o.volTrig, 90, 0, 100),
volWh: num(o.volWh, 70, 0, 100),
max: Math.round(num(o.max, 3, 1, 4)),
gap: Math.round(num(o.gap, 45, 10, 180)),
dur: Math.round(num(o.dur, 3, 1, 10)),
auto: o.auto !== false,
sur: o.sur === true,
mates: mates,
whMode: mode,
whProb: Math.round(num(o.whProb, 35, 0, 100)),
whCap: Math.round(num(o.whCap, 3, 0, 10)),
whReuse: Math.round(num(o.whReuse, 35, 0, 100)),
whSpd: (o.whSpd === undefined || (Number(o.whSpd) === 0.6 && o.whSpdV !== 2)) ? 0.85 : num(o.whSpd, 0.85, 0.5, 1),
whSpdV: 2,
dmMin: Math.round(num(o.dmMin, 0, 0, 180)),
reverb: Math.round(num(o.reverb, 0, 0, 40)),
whAway: o.whAway !== false,
off: (o.off && typeof o.off === 'object') ? o.off : {},
mode: o.mode === 'custom' ? 'custom' : 'live',
bgmOn: o.bgmOn !== false,
bgmVol: Math.round(num(o.bgmVol, 30, 0, 60)),
bgmScope: (o.bgmScope === 'all' || o.bgmScope === 'ids') ? o.bgmScope : 'pure',
bgmIds: Array.isArray(o.bgmIds) ? o.bgmIds.filter(function (x) { return typeof x === 'string'; }) : [],
bgmGap: Math.round(num(o.bgmGap, 0, 0, 60)),
planId: typeof o.planId === 'string' ? o.planId : ''
};
}
function srWrite(p) {
var cur = srRead(), k;
for (k in p) cur[k] = p[k];
try { localStorage.setItem(SR_KEY, JSON.stringify(cur)); } catch (e) {}
}
function _srPlans() {
if (!Array.isArray(data.srPlans)) data.srPlans = [];
return data.srPlans;
}
function _srPlanById(id) {
var l = _srPlans();
for (var i = 0; i < l.length; i++) if (l[i] && l[i].id === id) return l[i];
return null;
}
function _srSavePlans() { try { save(); } catch (e) {} }
function _srSoundOf(id) {
for (var i = 0; i < SR_SOUNDS.length; i++) if (SR_SOUNDS[i].id === id) return SR_SOUNDS[i];
return null;
}
function _srTrackById(id) {
var t = (data.player && Array.isArray(data.player.tracks)) ? data.player.tracks : [];
for (var i = 0; i < t.length; i++) if (t[i] && t[i].id === id) return t[i];
return null;
}
function _srPlanTotal(p) {
var n = 0;
(p && p.segments || []).forEach(function (g) { n += Math.max(1, Number(g.durMin) || 1); });
return n;
}
function _srPlanRange(p, i) {
var m = 0, k;
for (k = 0; k < i; k++) m += Math.max(1, Number(p.segments[k].durMin) || 1);
var d = Math.max(1, Number(p.segments[i].durMin) || 1);
function hh(mm) { return ('0' + Math.floor(mm / 60)).slice(-2) + ':' + ('0' + (mm % 60)).slice(-2); }
return hh(m) + '–' + hh(m + d);
}
function _srPlayable(t) {
if (!t) return false;
if (t.src === 'file') return !!t.fid;
if (t.src === 'ncm') return !!t.nid;
return /^https?:\/\//i.test(String(t.src || ''));
}
var SR_PURE_HINT = /纯音乐|纯音乐伴奏|instrumental|inst\.|piano|钢琴|轻音乐|古筝|吉他|大提琴|小提琴|冥想|环境音|自然声|雨声|ost|原声|配乐|伴奏|lofi|ambient|chill|relax|sleep|cafe|bgm|白噪音|海浪|森林|古典|钢琴曲/i;
var SR_VOCAL_HINT = /演唱|人声|清唱|合唱|live\s*版|翻唱|cover|feat\.|ft\.|remix|dj|说唱|rap|歌词|作词/i;
function _srPureOf(t) {
var s = ((t && t.name) || '') + ' ' + ((t && t.artist) || '');
if (SR_VOCAL_HINT.test(s)) return false;
return SR_PURE_HINT.test(s);
}
function _srMusicPool() {
var s = srRead();
var all = (data.player && Array.isArray(data.player.tracks)) ? data.player.tracks : [];
var pool;
if (s.bgmScope === 'ids') {
var pick = {};
s.bgmIds.forEach(function (id) { pick[id] = 1; });
pool = all.filter(function (t) { return pick[t.id] && _srPlayable(t); });
} else {
pool = all.filter(function (t) { return _srPlayable(t) && (s.bgmScope === 'all' || _srPureOf(t)); });
}
var seen = {};
_srMusicLast.forEach(function (id) { seen[id] = 1; });
var out = pool.filter(function (t) { return !seen[t.id]; });
return out.length ? out : pool;
}
function _srMusicTrackOf(id, plid) {
if (plid) {
var pls = (data.player && Array.isArray(data.player.playlists)) ? data.player.playlists : [];
for (var i = 0; i < pls.length; i++) {
if (pls[i] && pls[i].id === plid) {
var ids = Array.isArray(pls[i].trackIds) ? pls[i].trackIds : [];
var list = ids.map(_srTrackById).filter(_srPlayable);
if (list.length) return list[Math.random() * list.length | 0];
}
}
return null;
}
return _srTrackById(id);
}
function _srTrackUrl(t) {
return new Promise(function (res) {
if (!t) return res('');
if (t.src === 'file') {
if (_srMusicUrls[t.id]) return res(_srMusicUrls[t.id]);
if (!window.idbGet || !t.fid) return res('');
Promise.resolve(window.idbGet('player-file:' + t.fid)).then(function (v) {
if (!v) return res('');
var u = '';
try {
if (typeof v === 'string') u = v;
else if (window.URL && URL.createObjectURL) u = URL.createObjectURL(v);
} catch (e) { u = ''; }
if (u) _srMusicUrls[t.id] = u;
res(u);
}).catch(function () { res(''); });
return;
}
if (t.src === 'ncm') {
if (!t.nid) return res('');
var load = (typeof ensureChunk === 'function') ? ensureChunk('player') : Promise.resolve(true);
Promise.resolve(load).then(function () {
if (typeof _plNcmRealUrl !== 'function') return res('');
Promise.resolve(_plNcmRealUrl(t.nid)).then(function (u) { res(u || ''); }).catch(function () { res(''); });
}).catch(function () { res(''); });
return;
}
res(/^https?:\/\//i.test(String(t.src || '')) ? t.src : '');
});
}
function _srMusicGain() {
var s = srRead(), dim = 1;
if (srEndsAt) {
var left = srEndsAt - Date.now();
if (left <= 120000) dim = Math.max(0.0001, left / 120000);
}
return Math.max(0, Math.min(1, (s.bgmVol / 100) * (s.vol / 100) * dim * (_srDuckOn ? 0.45 : 1)));
}
function _srMusicVolApply() {
var a = _srMusic.audio;
if (a) { try { a.volume = _srMusicGain(); } catch (e) {} }
}
function _srDuck(on) {
if (on === _srDuckOn) return;
_srDuckOn = on;
var s = srRead(), k = on ? 0.35 : 1;
if (AC) {
var t = AC.currentTime;
try { if (bgBus) bgBus.gain.setTargetAtTime((s.volBg / 100) * k, t, 0.18); } catch (e) {}
try { if (trBus) trBus.gain.setTargetAtTime((s.volTrig / 100) * k, t, 0.18); } catch (e) {}
}
_srMusicVolApply();
}
function _srMusicEl() {
if (_srMusic.audio) return _srMusic.audio;
var a = null;
try { a = new Audio(); } catch (e) { return null; }
a.preload = 'metadata';
a.addEventListener('ended', function () { _srMusicEnded(); });
_srMusic.audio = a;
return a;
}
function _srMusicPush(t, who, quiet) {
if (!t) return;
if (quiet && _srMusic.shownSeg === _srPlan.idx) return;
_srMusic.shownSeg = _srPlan.idx;
var nm = ((t.name || '未命名') + (t.artist ? ' · ' + t.artist : ''));
var line = who ? ('「' + _srMateName(who) + '」放了一首《' + nm + '》') : ('频道放了一首《' + nm + '》');
_srPush(who || 'sys', line, 'music');
renderSleepRoom();
}
function _srMusicPlay(t, who, quiet) {
if (!t) return Promise.resolve(false);
var seq = ++_srMusic.seq;
if (_srMusic.fade) { clearInterval(_srMusic.fade); _srMusic.fade = null; }
if (_srMusic.timer) { clearTimeout(_srMusic.timer); _srMusic.timer = null; }
return _srTrackUrl(t).then(function (u) {
if (seq !== _srMusic.seq) return false;
if (!u) { _srMusicBad('这一首暂时取不到声音，换一首'); return false; }
var a = _srMusicEl();
if (!a) return false;
try { a.src = u; a.volume = 0; } catch (e) { return false; }
var play = null;
try { play = a.play(); } catch (e) {}
if (play && play.catch) play.catch(function () { _srMusicBad('浏览器拦了自动播放，点一下开播或点一首'); });
_srMusic.id = t.id; _srMusic.who = who || '';
_srMusicLast.unshift(t.id); if (_srMusicLast.length > 20) _srMusicLast.length = 20;
_srMusicPush(t, who, quiet);
var target = _srMusicGain(), n = 0;
_srMusic.fade = setInterval(function () {
n++;
try { a.volume = Math.min(target, target * n / 30); } catch (e) {}
if (n >= 30) { clearInterval(_srMusic.fade); _srMusic.fade = null; }
}, 100);
return true;
});
}
function _srMusicBad(msg) {
if (_srMusic.badOnce) return;
_srMusic.badOnce = true;
_srSys(msg);
setTimeout(function () { _srMusic.badOnce = false; }, 8000);
}
function _srMusicStop() {
_srMusic.seq++;
if (_srMusic.timer) { clearTimeout(_srMusic.timer); _srMusic.timer = null; }
if (_srMusic.fade) { clearInterval(_srMusic.fade); _srMusic.fade = null; }
var a = _srMusic.audio;
if (a) {
(function fade() {
var v = 0;
try { v = a.volume; } catch (e) {}
if (v <= 0.01) { try { a.pause(); a.removeAttribute('src'); a.load(); } catch (e) {} return; }
try { a.volume = Math.max(0, v - 0.03); } catch (e) {}
_srMusic.fade = setTimeout(fade, 100);
})();
}
_srMusic.id = ''; _srMusic.planMode = ''; _srMusic.planTid = ''; _srMusic.planPlid = '';
}
function _srMusicNext(delay) {
if (!playing || srRead().mode !== 'live' || !srRead().bgmOn) return;
if (_srMusic.timer) clearTimeout(_srMusic.timer);
_srMusic.timer = setTimeout(function () {
if (!playing || srRead().mode !== 'live' || !srRead().bgmOn) return;
if (window.__plPlaying) { _srMusicNext(10000); return; }
var pool = _srMusicPool();
if (!pool.length) {
_srMusicBad(srRead().bgmScope === 'pure' ? '按「纯音乐」没筛出曲子，可以改成全部曲目，或去挑几首' : '播放器里还没有能放的歌，先去收几首');
return;
}
var t = pool[Math.random() * pool.length | 0];
var st = srRead();
var cast = (st.mates || []).filter(function (cid) { return _srMateOf(cid); });
var who = cast.length ? cast[Math.random() * cast.length | 0] : '';
_srMusicPlay(t, who, false);
}, delay == null ? 6000 : delay);
}
function _srMusicStart() {
if (!srRead().bgmOn) return;
_srMusicNext(6000);
}
function _srMusicEnded() {
if (!playing) return;
if (srRead().mode === 'custom' && _srPlan.seg) { _srPlanMusicNext(); return; }
if (srRead().mode === 'live') _srMusicNext(Math.max(0, srRead().bgmGap) * 60000);
}
function _srPlanMusic(seg) {
var m = (seg && seg.music) || { mode: 'none' };
if (m.mode === 'none') { _srMusicStop(); return; }
if (m.mode === 'track') {
var t = _srTrackById(m.tid);
if (!t) { _srSys('这一段选的歌没了，先播环境音'); _srMusicStop(); return; }
_srMusic.planMode = 'track'; _srMusic.planTid = m.tid; _srMusic.planPlid = '';
_srMusicPlay(t, '', false);
return;
}
if (m.mode === 'list') {
var t2 = _srMusicTrackOf('', m.plId);
if (!t2) { _srSys('这一段选的歌单不在了，先播环境音'); _srMusicStop(); return; }
_srMusic.planMode = 'list'; _srMusic.planTid = ''; _srMusic.planPlid = m.plId;
_srMusicPlay(t2, '', false);
return;
}
var pool = _srMusicPool();
if (!pool.length) { _srMusicStop(); return; }
_srMusic.planMode = 'taPure'; _srMusic.planTid = ''; _srMusic.planPlid = '';
var st = srRead();
var cast = (st.mates || []).filter(function (cid) { return _srMateOf(cid); });
var who = cast.length ? cast[Math.random() * cast.length | 0] : '';
_srMusicPlay(pool[Math.random() * pool.length | 0], who, true);
}
function _srPlanMusicNext() {
if (!_srPlan.seg) return;
var m = _srMusic.planMode;
if (m === 'track') { _srPlanMusic(_srPlan.seg); return; }
if (m === 'list') {
var t = _srMusicTrackOf('', _srMusic.planPlid);
if (t) _srMusicPlay(t, '', true);
else _srPlanMusic(_srPlan.seg);
return;
}
if (m === 'taPure') {
var pool = _srMusicPool();
if (!pool.length) return;
var st = srRead();
var cast = (st.mates || []).filter(function (cid) { return _srMateOf(cid); });
var who = cast.length ? cast[Math.random() * cast.length | 0] : '';
_srMusicPlay(pool[Math.random() * pool.length | 0], who, true);
}
}
function _srPlanApplySegment(seg, idx) {
var want = {}, labels = [];
(seg.bg || []).forEach(function (x) { var sd = _srSoundOf(x.sid); if (sd) { want[sd.id] = { sd: sd, vol: Math.max(0, Math.min(100, Number(x.vol) || 70)) }; labels.push(sd.name); } });
(seg.tr || []).forEach(function (x) { var sd = _srSoundOf(x.sid); if (sd) { want[sd.id] = { sd: sd, vol: Math.max(0, Math.min(100, Number(x.vol) || 70)) }; labels.push(sd.name); } });
Array.from(live.keys()).forEach(function (id) {
var L = live.get(id);
if (!want[id] && !(L && L.protect)) dropLayer(id, '');
});
Object.keys(want).forEach(function (id) {
if (!live.has(id)) addLayer(want[id].sd, 0, 'auto', { silent: true });
setLayerVol(id, want[id].vol);
});
_srPlanMusic(seg);
var nm = seg.name || ('第 ' + (idx + 1) + ' 段');
_srSys('第 ' + (idx + 1) + ' 段「' + nm + '」开始' + (labels.length ? '：' + labels.join('、') : ''));
renderSleepRoom();
}
function _srPlanNext() {
if (!playing || srRead().mode !== 'custom' || !_srPlan.plan) return;
var p = _srPlan.plan;
var segs = Array.isArray(p.segments) ? p.segments : [];
var next = _srPlan.idx + 1;
if (next >= segs.length) {
if (p.loop) next = 0;
else {
if (p.onEnd === 'stop') { _srSys('编排走完，下播了，晚安'); _srPlan.plan = null; _srPlan.idx = -1; _srPlan.segEndsAt = 0; goLive(); }
else _srSys('编排走完，最后一段继续响');
return;
}
}
var seg = segs[next];
if (!seg) return;
_srPlan.idx = next; _srPlan.seg = seg;
_srPlan.segEndsAt = Date.now() + Math.max(1, Number(seg.durMin) || 1) * 60000;
_srPlanApplySegment(seg, next);
if (_srPlan.segT) clearTimeout(_srPlan.segT);
_srPlan.segT = setTimeout(_srPlanNext, Math.max(1, Number(seg.durMin) || 1) * 60000);
}
function _srPlanStart() {
var s = srRead();
var p = _srPlanById(s.planId) || _srPlans()[0];
if (!p || !Array.isArray(p.segments) || !p.segments.length) { showToast('还没有编排，先加一段时间段'); return false; }
_srPlan.plan = p; _srPlan.idx = -1; _srPlan.seg = null;
_srPlanNext();
return true;
}
function _srPlanStop() {
if (_srPlan.segT) { clearTimeout(_srPlan.segT); _srPlan.segT = null; }
_srPlan.plan = null; _srPlan.idx = -1; _srPlan.seg = null; _srPlan.segEndsAt = 0;
}
function _srPlanLeftText() {
if (!_srPlan.segEndsAt) return '';
return Math.ceil(Math.max(0, _srPlan.segEndsAt - Date.now()) / 60000) + ' 分钟后换场';
}
function noise(w, kind) {
if (bufs[kind]) return bufs[kind];
var len = (w.sampleRate * 3) | 0;
var b = w.createBuffer(1, len, w.sampleRate), d = b.getChannelData(0), i, v;
if (kind === 'brown') {
var last = 0;
for (i = 0; i < len; i++) { v = Math.random() * 2 - 1; last = (last + 0.02 * v) / 1.02; d[i] = last * 3.5; }
} else if (kind === 'pink') {
var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
for (i = 0; i < len; i++) {
v = Math.random() * 2 - 1;
b0 = 0.99886 * b0 + v * 0.0555179; b1 = 0.99332 * b1 + v * 0.0750759;
b2 = 0.969 * b2 + v * 0.153852; b3 = 0.8665 * b3 + v * 0.3104856;
b4 = 0.55 * b4 + v * 0.5329522; b5 = -0.7616 * b5 - v * 0.016898;
d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + v * 0.5362) * 0.11;
b6 = v * 0.115926;
}
} else {
for (i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
}
var mean = 0;
for (i = 0; i < len; i++) mean += d[i];
mean /= len;
var drift = kind === 'white' ? 0 : (d[len - 1] - d[0]);
for (i = 0; i < len; i++) d[i] -= mean + drift * (i / (len - 1) - 0.5);
bufs[kind] = b;
return b;
}
function loop(w, kind) { var s = w.createBufferSource(); s.buffer = noise(w, kind); s.loop = true; return s; }
function filt(w, type, f, q) { var x = w.createBiquadFilter(); x.type = type; x.frequency.value = f; if (q) x.Q.value = q; return x; }
function gn(w, v2) { var g = w.createGain(); g.gain.value = v2; return g; }
function lfo(w, hz, depth, param, base) {
var o = w.createOscillator(); o.frequency.value = hz;
var g = gn(w, depth);
if (base !== undefined) param.value = base;
o.connect(g); g.connect(param); o.start();
return o;
}
var SR_AHEAD = 12;
var SR_REARM = 5000;
function every(minMs, maxMs, fn) {
var cur = { at: 0 }, dead = false, t = 0;
var panOf = (_mkCtx && _mkCtx.grp === 'tr' && _mkCtx.p && _mkCtx.p.pan)
? _mkCtx.p : null;
var span = function () { return (minMs + Math.random() * (maxMs - minMs)) / 1000; };
var step = function () {
if (dead || !AC) return;
var now = AC.currentTime, n = 0;
if (cur.at < now) cur.at = now + 0.06 + Math.random() * span();
while (cur.at < now + SR_AHEAD && n++ < 4000) {
if (panOf) { try { panOf.pan.setValueAtTime(Math.random() * 1.1 - 0.55, cur.at); } catch (e) {} }
fn(cur.at); cur.at += span();
}
t = setTimeout(step, SR_REARM);
};
step();
return function () { dead = true; clearTimeout(t); };
}
function stops() {
var l = Array.prototype.slice.call(arguments);
return function () { l.forEach(function (x) { try { x.stop(); } catch (e) {} }); };
}
var SR_SOUNDS = [
{ id: 'white', grp: 'bg', name: '白噪音', tip: '均匀的沙沙，盖住环境杂音', make: function (w, out) {
var s = loop(w, 'white'), f = filt(w, 'lowpass', 8000), g = gn(w, 0.55);
s.connect(f); f.connect(g); g.connect(out); s.start();
return stops(s);
} },
{ id: 'rain', grp: 'bg', name: '雨声', tip: '淅淅沥沥打在窗上', make: function (w, out) {
var s = loop(w, 'pink');
var hp = filt(w, 'highpass', 500), lp = filt(w, 'lowpass', 4200), base = gn(w, 0.42);
s.connect(hp); hp.connect(lp); lp.connect(base); base.connect(out); s.start();
var p = loop(w, 'white'), pf = filt(w, 'bandpass', 2800, 2.5), pg = gn(w, 0);
p.connect(pf); pf.connect(pg); pg.connect(out); p.start();
var drops = every(70, 380, function (t) {
var v = 0.03 + Math.random() * 0.1;
pg.gain.cancelScheduledValues(t);
pg.gain.setValueAtTime(Math.max(pg.gain.value, 0.0001), t);
pg.gain.linearRampToValueAtTime(v, t + 0.004);
pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.04 + Math.random() * 0.05);
});
return function () { drops(); stops(s, p)(); };
} },
{ id: 'waves', grp: 'bg', name: '海浪', tip: '一层一层漫上沙滩', make: function (w, out) {
var s = loop(w, 'brown'), lp = filt(w, 'lowpass', 520), sw = gn(w, 0.45);
s.connect(lp); lp.connect(sw); sw.connect(out); s.start();
var l1 = lfo(w, 0.08, 0.3, sw.gain, 0.45);
var l2 = lfo(w, 0.05, 230, lp.frequency, 520);
var f = loop(w, 'white');
var fh = filt(w, 'highpass', 2400), fl = filt(w, 'lowpass', 6000), fg = gn(w, 0.06);
f.connect(fh); fh.connect(fl); fl.connect(fg); fg.connect(out); f.start();
var l3 = lfo(w, 0.09, 0.05, fg.gain, 0.06);
return function () { stops(l1, l2, l3, s, f)(); };
} },
{ id: 'wind', grp: 'bg', name: '晚风', tip: '掠过树梢呜呜地走', make: function (w, out) {
var s = loop(w, 'white'), bp = filt(w, 'bandpass', 620, 1.6), g = gn(w, 0.45);
s.connect(bp); bp.connect(g); g.connect(out); s.start();
var l1 = lfo(w, 0.05, 320, bp.frequency, 620);
var l2 = lfo(w, 0.07, 0.2, g.gain, 0.45);
return function () { stops(l1, l2, s)(); };
} },
{ id: 'fan', grp: 'bg', name: '旧风扇', tip: '嗡嗡的低鸣，夏夜专用', make: function (w, out) {
var s = loop(w, 'brown'), lp = filt(w, 'lowpass', 320), g = gn(w, 0.6);
s.connect(lp); lp.connect(g); g.connect(out); s.start();
var o1 = w.createOscillator(); o1.frequency.value = 118;
var o2 = w.createOscillator(); o2.frequency.value = 236;
var og = gn(w, 0.035);
o1.connect(og); o2.connect(og); og.connect(out); o1.start(); o2.start();
return stops(s, o1, o2);
} },
{ id: 'fire', grp: 'bg', name: '篝火', tip: '木柴烧得噼啪响', make: function (w, out) {
var s = loop(w, 'brown'), lp = filt(w, 'lowpass', 380), base = gn(w, 0.42);
s.connect(lp); lp.connect(base); base.connect(out); s.start();
var l1 = lfo(w, 0.23, 0.1, base.gain, 0.42);
var c = loop(w, 'white'), cf = filt(w, 'highpass', 2600), cg = gn(w, 0);
c.connect(cf); cf.connect(cg); cg.connect(out); c.start();
var crackle = every(70, 600, function (t) {
var v = 0.03 + Math.random() * 0.18;
cg.gain.cancelScheduledValues(t);
cg.gain.setValueAtTime(Math.max(cg.gain.value, 0.0001), t);
cg.gain.linearRampToValueAtTime(v, t + 0.003);
cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.04);
});
return function () { crackle(); stops(l1, s, c)(); };
} },
{ id: 'crickets', grp: 'bg', name: '虫鸣', tip: '草丛里的蛐蛐，此起彼伏', make: function (w, out) {
var o = w.createOscillator(); o.frequency.value = 4300;
var o2 = w.createOscillator(); o2.frequency.value = 5400;
var g = gn(w, 0), g2 = gn(w, 0);
o.connect(g); g.connect(out); o2.connect(g2); g2.connect(out); o.start(); o2.start();
var chirp = function (gg, t) {
var n = 3 + (Math.random() * 3 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + k * 0.07;
gg.gain.setValueAtTime(0, t0);
gg.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.02, t0 + 0.008);
gg.gain.linearRampToValueAtTime(0, t0 + 0.035);
}
};
var a = every(700, 2600, function (t) { chirp(g, t); });
var b = every(1100, 3400, function (t) { chirp(g2, t); });
return function () { a(); b(); stops(o, o2)(); };
} },
{ id: 'heart', grp: 'bg', name: '心跳', tip: '贴着耳朵的那种安心', make: function (w, out) {
var o = w.createOscillator(); o.frequency.value = 52;
var g = gn(w, 0);
o.connect(g); g.connect(out); o.start();
var thud = function (t2, amp) {
var bs = w.createBufferSource(); bs.buffer = noise(w, 'brown');
var bf = filt(w, 'lowpass', 420);
var bg = gn(w, 0);
bs.connect(bf); bf.connect(bg); bg.connect(out);
bg.gain.setValueAtTime(0.0001, t2);
bg.gain.exponentialRampToValueAtTime(amp, t2 + 0.02);
bg.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.16);
bs.start(t2); bs.stop(t2 + 0.2);
};
var beat = every(950, 1250, function (t) {
thud(t, 0.62); thud(t + 0.32, 0.36);
g.gain.cancelScheduledValues(t);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.34, t + 0.02);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
g.gain.exponentialRampToValueAtTime(0.19, t + 0.34);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
});
return function () { beat(); stops(o)(); };
} },
{ id: 'train', grp: 'bg', name: '夜行火车', tip: '哐当哐当，摇着走', make: function (w, out) {
var s = loop(w, 'brown'), lp = filt(w, 'lowpass', 430), base = gn(w, 0.55);
s.connect(lp); lp.connect(base); base.connect(out); s.start();
var c = loop(w, 'white'), cf = filt(w, 'bandpass', 720, 3), cg = gn(w, 0);
c.connect(cf); cf.connect(cg); cg.connect(out); c.start();
var clack = every(700, 700, function (t) {
[0, 0.19].forEach(function (d, i) {
var t0 = t + d;
cg.gain.setValueAtTime(0.0001, t0);
cg.gain.exponentialRampToValueAtTime(i ? 0.14 : 0.22, t0 + 0.006);
cg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
});
});
return function () { clack(); stops(s, c)(); };
} },
{ id: 'stream', grp: 'bg', name: '溪流', tip: '浅滩上叮叮咚咚', make: function (w, out) {
var s = loop(w, 'white'), bp = filt(w, 'bandpass', 2400, 0.9), base = gn(w, 0.33);
s.connect(bp); bp.connect(base); base.connect(out); s.start();
var l1 = lfo(w, 0.3, 0.07, base.gain, 0.33);
var bubbles = every(200, 1200, function (t) {
var o = w.createOscillator();
o.frequency.setValueAtTime(420 + Math.random() * 260, t);
o.frequency.exponentialRampToValueAtTime(900 + Math.random() * 500, t + 0.09);
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t);
og.gain.exponentialRampToValueAtTime(0.05, t + 0.015);
og.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
o.start(t); o.stop(t + 0.14);
});
return function () { bubbles(); stops(l1, s)(); };
} },
{ id: 'chime', grp: 'bg', name: '晚风铃', tip: '很久才响一下，很远', make: function (w, out) {
var tones = [523.3, 587.3, 659.3, 784, 880];
return every(12000, 40000, function (t) {
var f = tones[Math.random() * tones.length | 0];
[[f, 0.05], [f * 2.76, 0.013]].forEach(function (p) {
var o = w.createOscillator(); o.frequency.value = p[0];
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t);
og.gain.exponentialRampToValueAtTime(p[1], t + 0.012);
og.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
o.start(t); o.stop(t + 3.8);
});
});
} },
{ id: 'snow', grp: 'bg', name: '雪夜', tip: '比晚风更闷更远，天地都盖住了', make: function (w, out) {
var s = loop(w, 'brown'), lp = filt(w, 'lowpass', 260), g = gn(w, 0.5);
s.connect(lp); lp.connect(g); g.connect(out); s.start();
var l1 = lfo(w, 0.04, 0.12, g.gain, 0.5);
var h = loop(w, 'white'), hf = filt(w, 'highpass', 6800), hg = gn(w, 0.012);
h.connect(hf); hf.connect(hg); hg.connect(out); h.start();
var l2 = lfo(w, 0.07, 0.006, hg.gain, 0.012);
return function () { stops(l1, l2, s, h)(); };
} },
{ id: 'hearth', grp: 'bg', name: '壁炉打盹', tip: '篝火和晚风叠好的一炉，烤着打盹', make: function (w, out) {
var s = loop(w, 'brown'), lp = filt(w, 'lowpass', 400), base = gn(w, 0.32);
s.connect(lp); lp.connect(base); base.connect(out); s.start();
var c = loop(w, 'white'), cf = filt(w, 'highpass', 2600), cg = gn(w, 0);
c.connect(cf); cf.connect(cg); cg.connect(out); c.start();
var crackle = every(70, 600, function (t) {
var v = 0.02 + Math.random() * 0.12;
cg.gain.cancelScheduledValues(t);
cg.gain.setValueAtTime(Math.max(cg.gain.value, 0.0001), t);
cg.gain.linearRampToValueAtTime(v, t + 0.003);
cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.04);
});
var wv = loop(w, 'white'), bp = filt(w, 'bandpass', 560, 1.4), wg = gn(w, 0.1);
wv.connect(bp); bp.connect(wg); wg.connect(out); wv.start();
var l1 = lfo(w, 0.05, 0.05, wg.gain, 0.1);
var l2 = lfo(w, 0.045, 160, bp.frequency, 560);
return function () { crackle(); stops(l1, l2, s, c, wv)(); };
} },
{ id: 'purr', grp: 'bg', name: '猫呼噜', tip: '趴在枕头边，喉咙里一刻不停', make: function (w, out) {
var s = loop(w, 'pink'), lp = filt(w, 'lowpass', 420), g = gn(w, 0.24);
s.connect(lp); lp.connect(g); g.connect(out); s.start();
var tr = w.createOscillator(); tr.type = 'triangle'; tr.frequency.value = 24 + Math.random() * 3;
var tg = gn(w, 0.18);
tr.connect(tg); tg.connect(g.gain); tr.start();
var body = gn(w, 0.9);
var l1 = lfo(w, 0.22, 0.12, body.gain, 0.9);
var chest = w.createOscillator(); chest.frequency.value = 42;
var cg = gn(w, 0.02);
chest.connect(cg); cg.connect(body); chest.start();
g.connect(body); body.connect(out);
return function () { stops(tr, chest, l1, s)(); };
} },
{ id: 'musicbox', grp: 'bg', name: '八音盒', tip: '叮……叮……，很久才落一个音', make: function (w, out) {
var SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5];
var idx = 2;
return every(1600, 5000, function (t) {
idx = Math.min(SCALE.length - 1, Math.max(0, idx + (Math.random() * 5 | 0) - 2));
var f = SCALE[idx];
var tick = w.createBufferSource(); tick.buffer = noise(w, 'white');
var tf = filt(w, 'bandpass', 3000, 8);
var tg = gn(w, 0);
tick.connect(tf); tf.connect(tg); tg.connect(out);
tg.gain.setValueAtTime(0.0001, t);
tg.gain.exponentialRampToValueAtTime(0.015, t + 0.002);
tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
tick.start(t, Math.random() * 2, 0.03);
[[f, 0.055], [f * 3.36, 0.014]].forEach(function (p) {
var o = w.createOscillator(); o.frequency.value = p[0];
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t + 0.11);
g.gain.exponentialRampToValueAtTime(p[1], t + 0.115);
g.gain.exponentialRampToValueAtTime(0.0001, t + 2.3);
o.start(t + 0.11); o.stop(t + 2.5);
});
if (Math.random() < 0.22) {
var f2 = SCALE[Math.min(SCALE.length - 1, idx + 2)];
var o2 = w.createOscillator(); o2.frequency.value = f2;
var g2 = gn(w, 0);
o2.connect(g2); g2.connect(out);
g2.gain.setValueAtTime(0.0001, t + 0.11);
g2.gain.exponentialRampToValueAtTime(0.03, t + 0.115);
g2.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
o2.start(t + 0.11); o2.stop(t + 2.3);
}
});
} },
{ id: 'choir', grp: 'bg', name: '唱诗铺底', tip: '很远的风琴，低低地哼着长音', make: function (w, out) {
var CHORDS = [[110, 164.8, 220], [87.3, 130.8, 174.6], [130.8, 196, 261.6], [98, 146.8, 196]];
var lp = filt(w, 'lowpass', 720), body = gn(w, 0.07);
lp.connect(body); body.connect(out);
var l1 = lfo(w, 0.06, 0.03, body.gain, 0.07);
var oscs = [];
CHORDS[0].forEach(function (f, ni) {
[0.9985, 1.0015].forEach(function (dt) {
var o = w.createOscillator(); o.frequency.value = f * dt;
var g = gn(w, 0.013);
o.connect(g); g.connect(lp); o.start();
oscs.push({ o: o, ni: ni, dt: dt });
});
});
var ci = 0;
var ch = every(16000, 34000, function (t) {
ci = (ci + 1) % CHORDS.length;
oscs.forEach(function (p) {
try { p.o.frequency.setTargetAtTime(CHORDS[ci][p.ni] * p.dt, t, 2.2); } catch (e) {}
});
});
return function () { ch(); stops(l1)(); oscs.forEach(function (p) { try { p.o.stop(); } catch (e) {} }); };
} },
{ id: 'cafe', grp: 'bg', name: '咖啡馆', tip: '远处的人在低声说话，听不清说什么', make: function (w, out) {
var s = loop(w, 'pink'), bp = filt(w, 'bandpass', 650, 0.8), g = gn(w, 0.09);
s.connect(bp); bp.connect(g); g.connect(out); s.start();
var l1 = lfo(w, 1.6, 0.035, g.gain, 0.09);
var l2 = lfo(w, 0.57, 0.03, g.gain, 0.09);
var l3 = lfo(w, 0.21, 0.025, g.gain, 0.09);
var air = loop(w, 'white'), af = filt(w, 'lowpass', 3000), ag = gn(w, 0.015);
air.connect(af); af.connect(ag); ag.connect(out); air.start();
var clink = every(5000, 14000, function (t) {
var f = 1300 + Math.random() * 500;
[[f, 0.03], [f * 2.32, 0.012]].forEach(function (p) {
var o = w.createOscillator(); o.frequency.value = p[0];
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t);
og.gain.exponentialRampToValueAtTime(p[1], t + 0.004);
og.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
o.start(t); o.stop(t + 0.45);
});
});
return function () { clink(); stops(l1, l2, l3, s, air)(); };
} },
{ id: 'thunder', grp: 'bg', name: '雷雨', tip: '大雨浇下来，远处隔着雷', make: function (w, out) {
var s = loop(w, 'pink');
var hp = filt(w, 'highpass', 420), lp = filt(w, 'lowpass', 5200), base = gn(w, 0.4);
s.connect(hp); hp.connect(lp); lp.connect(base); base.connect(out); s.start();
var p = loop(w, 'white'), pf = filt(w, 'bandpass', 2600, 2), pg = gn(w, 0);
p.connect(pf); pf.connect(pg); pg.connect(out); p.start();
var drops = every(40, 220, function (t) {
var v = 0.03 + Math.random() * 0.1;
pg.gain.cancelScheduledValues(t);
pg.gain.setValueAtTime(Math.max(pg.gain.value, 0.0001), t);
pg.gain.linearRampToValueAtTime(v, t + 0.003);
pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.03 + Math.random() * 0.04);
});
var boom = every(12000, 35000, function (t) {
var o = w.createOscillator(); o.type = 'sine';
o.frequency.setValueAtTime(70 + Math.random() * 30, t);
o.frequency.exponentialRampToValueAtTime(38, t + 2.2);
var g = gn(w, 0);
o.connect(g); g.connect(out);
var dur = 2 + Math.random() * 2.5;
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.22 + Math.random() * 0.1, t + 0.25 + Math.random() * 0.4);
g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
o.start(t); o.stop(t + dur + 0.2);
var r = loop(w, 'brown');
var rf = filt(w, 'lowpass', 220);
var rg = gn(w, 0);
r.connect(rf); rf.connect(rg); rg.connect(out);
rg.gain.setValueAtTime(0.0001, t);
rg.gain.linearRampToValueAtTime(0.12, t + 0.3);
rg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
r.start(t); r.stop(t + dur + 0.1);
});
return function () { drops(); boom(); stops(s, p)(); };
} },
{ id: 'tinroof', grp: 'bg', name: '雨打铁皮', tip: '铁皮屋顶上叮叮当当的雨', make: function (w, out) {
var s = loop(w, 'pink');
var bp = filt(w, 'bandpass', 1200, 0.8), base = gn(w, 0.22);
s.connect(bp); bp.connect(base); base.connect(out); s.start();
var ping = every(60, 260, function (t) {
if (Math.random() < 0.55) return;
var f = 900 + Math.random() * 1300;
var o = w.createOscillator(); o.frequency.value = f;
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.02 + Math.random() * 0.04, t + 0.003);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12 + Math.random() * 0.2);
o.start(t); o.stop(t + 0.4);
});
var p = loop(w, 'white'), pf = filt(w, 'highpass', 2500), pg = gn(w, 0.02);
p.connect(pf); pf.connect(pg); pg.connect(out); p.start();
return function () { ping(); stops(s, p)(); };
} },
{ id: 'cabin', grp: 'bg', name: '深夜机舱', tip: '引擎在脚下嗡嗡，灯都调暗了', make: function (w, out) {
var s = loop(w, 'brown'), lp = filt(w, 'lowpass', 460), g = gn(w, 0.5);
s.connect(lp); lp.connect(g); g.connect(out); s.start();
var o = w.createOscillator(); o.frequency.value = 62;
var og = gn(w, 0.03);
o.connect(og); og.connect(out); o.start();
var h = loop(w, 'white'), hf = filt(w, 'lowpass', 3600), hg = gn(w, 0.014);
h.connect(hf); hf.connect(hg); hg.connect(out); h.start();
var l1 = lfo(w, 0.06, 0.06, g.gain, 0.5);
return function () { stops(l1, s, o, h)(); };
} },
{ id: 'cicada', grp: 'bg', name: '蝉鸣', tip: '夏天午后，一浪一浪的蝉', make: function (w, out) {
var body = gn(w, 0.03);
var l1 = lfo(w, 0.09, 0.02, body.gain, 0.03);
body.connect(out);
var voices = [];
[4720, 4830, 5150].forEach(function (f) {
var o = w.createOscillator(); o.frequency.value = f;
var g = gn(w, 0.5);
o.connect(g); g.connect(body); o.start();
var am = w.createOscillator(); am.frequency.value = 48 + Math.random() * 8;
var amg = gn(w, 0.5);
am.connect(amg); amg.connect(g.gain); am.start();
voices.push(o, am);
});
return function () { stops(l1)(); voices.forEach(function (x) { try { x.stop(); } catch (e) {} }); };
} },
{ id: 'frogs', grp: 'bg', name: '青蛙池塘', tip: '稻田边此起彼伏的咕呱', make: function (w, out) {
var croak = function (t) {
var f = 260 + Math.random() * 180;
var o = w.createOscillator();
o.frequency.setValueAtTime(f, t);
o.frequency.linearRampToValueAtTime(f * 1.06, t + 0.35);
var g = gn(w, 0);
o.connect(g); g.connect(out);
var n = 5 + (Math.random() * 4 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + k * 0.055;
g.gain.setValueAtTime(0.0001, t0);
g.gain.linearRampToValueAtTime(0.035 + Math.random() * 0.02, t0 + 0.012);
g.gain.linearRampToValueAtTime(0.0001, t0 + 0.04);
}
o.start(t); o.stop(t + n * 0.055 + 0.05);
};
var a = every(900, 2800, function (t) { croak(t); });
var b = every(1400, 4200, function (t) { croak(t + 0.1); });
var c = every(2200, 6000, function (t) { croak(t + 0.05); });
var s = loop(w, 'pink'), bp = filt(w, 'bandpass', 800, 1), bg2 = gn(w, 0.05);
s.connect(bp); bp.connect(bg2); bg2.connect(out); s.start();
return function () { a(); b(); c(); stops(s)(); };
} },
{ id: 'underwater', grp: 'bg', name: '水底', tip: '潜进水里，世界都闷了', make: function (w, out) {
var s = loop(w, 'brown'), lp = filt(w, 'lowpass', 240), g = gn(w, 0.5);
s.connect(lp); lp.connect(g); g.connect(out); s.start();
var l1 = lfo(w, 0.07, 0.14, g.gain, 0.5);
var l2 = lfo(w, 0.05, 60, lp.frequency, 240);
var blub = every(900, 2600, function (t) {
var o = w.createOscillator();
o.frequency.setValueAtTime(180 + Math.random() * 120, t);
o.frequency.exponentialRampToValueAtTime(90 + Math.random() * 40, t + 0.12);
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t);
og.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
og.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
o.start(t); o.stop(t + 0.2);
});
return function () { blub(); stops(l1, l2, s)(); };
} },
{ id: 'library', grp: 'bg', name: '图书馆', tip: '安静的阅览室，翻页都放轻了', make: function (w, out) {
var air = loop(w, 'white'), af = filt(w, 'lowpass', 2600), ag = gn(w, 0.008);
air.connect(af); af.connect(ag); ag.connect(out); air.start();
var page = every(5000, 16000, function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 700, 1.2);
f.frequency.setValueAtTime(700, t);
f.frequency.exponentialRampToValueAtTime(3000, t + 0.2);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.045, t + 0.08);
g.gain.linearRampToValueAtTime(0.0001, t + 0.24);
s.start(t, Math.random() * 2, 0.3);
});
var scoot = every(14000, 40000, function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'brown');
var f = filt(w, 'bandpass', 320, 1.5);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.03, t + 0.1);
g.gain.linearRampToValueAtTime(0.0001, t + 0.35);
s.start(t, Math.random() * 2, 0.4);
});
return function () { page(); scoot(); stops(air)(); };
} },
{ id: 'radiator', grp: 'bg', name: '暖气片', tip: '水管里的水咕噜咕噜走过', make: function (w, out) {
var run = every(4000, 12000, function (t) {
var n = 5 + (Math.random() * 8 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + k * (0.08 + Math.random() * 0.12);
var o = w.createOscillator();
o.frequency.setValueAtTime(Math.max(120, 200 + Math.random() * 160 - k * 8), t0);
o.frequency.exponentialRampToValueAtTime(100 + Math.random() * 60, t0 + 0.06);
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.04, t0 + 0.01);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
o.start(t0); o.stop(t0 + 0.1);
}
});
var tick = every(9000, 26000, function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 2800, 9);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.05, t + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
s.start(t, Math.random() * 2, 0.04);
});
return function () { run(); tick(); };
} },
{ id: 'kettle', grp: 'bg', name: '烧水壶', tip: '嘶——地爬向哨音，响了就被提走', make: function (w, out) {
var s = loop(w, 'white');
var f = filt(w, 'bandpass', 1600, 1.2), g = gn(w, 0.012);
s.connect(f); f.connect(g); g.connect(out); s.start();
var w1 = w.createOscillator(); w1.frequency.value = 2150;
var w2 = w.createOscillator(); w2.frequency.value = 2640;
var wg = gn(w, 0);
w1.connect(wg); w2.connect(wg); wg.connect(out); w1.start(); w2.start();
var T = 0;
var tick = every(1000, 1000, function (t) {
T++;
if (T > 64) T = 0;
if (T < 24) {
g.gain.setTargetAtTime(0.012 + T * 0.0022, t, 1.2);
f.frequency.setTargetAtTime(1600 + T * 28, t, 1.2);
} else if (T < 40) {
g.gain.setTargetAtTime(0.065, t, 1.5);
wg.gain.setTargetAtTime(0.028, t, 2);
} else if (T < 46) {
wg.gain.setTargetAtTime(0, t, 0.4);
g.gain.setTargetAtTime(0.02, t, 0.8);
} else {
g.gain.setTargetAtTime(0.012, t, 2);
f.frequency.setTargetAtTime(1600, t, 2);
}
});
return function () { tick(); stops(s, w1, w2)(); };
} },
{ id: 'konbini', grp: 'bg', name: '深夜便利店', tip: '冷柜嗡嗡，门铃偶尔叮咚', make: function (w, out) {
var s = loop(w, 'brown'), lp = filt(w, 'lowpass', 400), g = gn(w, 0.4);
s.connect(lp); lp.connect(g); g.connect(out); s.start();
var o = w.createOscillator(); o.frequency.value = 100;
var og = gn(w, 0.02);
o.connect(og); og.connect(out); o.start();
var hum = loop(w, 'white'), hmf = filt(w, 'bandpass', 640, 0.7), hmg = gn(w, 0.02);
hum.connect(hmf); hmf.connect(hmg); hmg.connect(out); hum.start();
var air = loop(w, 'white'), af = filt(w, 'lowpass', 3200), ag = gn(w, 0.01);
air.connect(af); af.connect(ag); ag.connect(out); air.start();
var door = every(11000, 30000, function (t) {
var ch = w.createOscillator(); ch.frequency.value = 1320;
var cg = gn(w, 0);
ch.connect(cg); cg.connect(out);
cg.gain.setValueAtTime(0.0001, t);
cg.gain.exponentialRampToValueAtTime(0.04, t + 0.005);
cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
ch.start(t); ch.stop(t + 0.55);
var ch2 = w.createOscillator(); ch2.frequency.value = 990;
var cg2 = gn(w, 0);
ch2.connect(cg2); cg2.connect(out);
cg2.gain.setValueAtTime(0.0001, t + 0.18);
cg2.gain.exponentialRampToValueAtTime(0.03, t + 0.19);
cg2.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
ch2.start(t + 0.18); ch2.stop(t + 0.65);
[0.6, 1.1].forEach(function (d) {
var s2 = w.createBufferSource(); s2.buffer = noise(w, 'brown');
var f2 = filt(w, 'lowpass', 300);
var g2 = gn(w, 0);
s2.connect(f2); f2.connect(g2); g2.connect(out);
g2.gain.setValueAtTime(0.0001, t + d);
g2.gain.exponentialRampToValueAtTime(0.06, t + d + 0.01);
g2.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.12);
s2.start(t + d, Math.random() * 2, 0.16);
});
});
return function () { door(); stops(s, o, air)(); };
} },
{ id: 'guzheng', grp: 'bg', name: '古筝', tip: '叮咚的拨弦，弦一根根落在心里', make: function (w, out) {
var SCALE = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3];
var idx = 4;
var pluck = function (t0, f) {
var ts = t0 + 0.06;
[[1, 0.09, 2.2], [2, 0.05, 1.3], [3.01, 0.03, 0.8], [4.9, 0.014, 0.4]].forEach(function (p) {
[0.998, 1.002].forEach(function (dt) {
var o = w.createOscillator(); o.frequency.value = f * p[0] * dt;
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, ts);
g.gain.linearRampToValueAtTime(p[1], ts + 0.006);
g.gain.exponentialRampToValueAtTime(0.0001, ts + 0.006 + p[2]);
o.start(ts); o.stop(ts + 0.1 + p[2]);
});
});
};
return every(1400, 4500, function (t) {
idx = Math.min(SCALE.length - 1, Math.max(0, idx + (Math.random() * 5 | 0) - 2));
pluck(t, SCALE[idx]);
if (Math.random() < 0.2) {
for (var k = 1; k <= 3; k++) {
var j = Math.max(0, idx - k);
pluck(t + k * 0.09, SCALE[j]);
}
}
});
} },
{ id: 'cottage', grp: 'bg', name: '雨夜小屋', tip: '雨声＋壁炉＋猫呼噜，一键叠好的三件', make: function (w, out) {
var parts = [];
[{ id: 'rain', v: 1 }, { id: 'fire', v: 0.9 }, { id: 'purr', v: 0.75 }].forEach(function (p) {
for (var i = 0; i < SR_SOUNDS.length; i++) {
if (SR_SOUNDS[i].id === p.id) {
var sub = gn(w, p.v);
sub.connect(out);
parts.push(SR_SOUNDS[i].make(w, sub));
break;
}
}
});
return function () { parts.forEach(function (st) { try { st(); } catch (e) {} }); };
} },
{ id: 'tap', grp: 'tr', name: '指尖轻敲', tip: '指甲在木桌上，有一下没一下', make: function (w, out) {
var pan = w.createStereoPanner ? w.createStereoPanner() : gn(w, 1);
pan.connect(out);
return every(350, 2400, function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 900 + Math.random() * 1400, 5);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(pan);
if (w.createStereoPanner) pan.pan.setValueAtTime(Math.random() * 1.6 - 0.8, t);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.08 + Math.random() * 0.16, t + 0.004);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
s.start(t, Math.random() * 2, 0.1);
});
} },
{ id: 'type', grp: 'tr', name: '键盘声', tip: '有人在旁边轻轻打字', make: function (w, out) {
return every(70, 380, function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 2200 + Math.random() * 1800, 6);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.1 + Math.random() * 0.12, t + 0.003);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
s.start(t, Math.random() * 2, 0.06);
});
} },
{ id: 'page', grp: 'tr', name: '翻书', tip: '纸页哗啦一响', make: function (w, out) {
return every(2600, 8000, function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 700, 1.2);
f.frequency.setValueAtTime(700, t);
f.frequency.exponentialRampToValueAtTime(3400, t + 0.22);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.17, t + 0.09);
g.gain.linearRampToValueAtTime(0.0001, t + 0.26);
s.start(t, Math.random() * 2, 0.32);
});
} },
{ id: 'drip', grp: 'tr', name: '水滴', tip: '水龙头没拧紧，一滴一滴', make: function (w, out) {
return every(400, 3000, function (t) {
var o = w.createOscillator();
o.frequency.setValueAtTime(1150 + Math.random() * 350, t);
o.frequency.exponentialRampToValueAtTime(320 + Math.random() * 120, t + 0.14);
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.12 + Math.random() * 0.08, t + 0.006);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
o.start(t); o.stop(t + 0.22);
});
} },
{ id: 'pop', grp: 'tr', name: '泡泡纸', tip: '一个一个摁爆', make: function (w, out) {
var one = function (t) {
var o = w.createOscillator();
o.frequency.setValueAtTime(850 + Math.random() * 500, t);
o.frequency.exponentialRampToValueAtTime(240, t + 0.035);
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.14 + Math.random() * 0.12, t + 0.004);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
o.start(t); o.stop(t + 0.06);
};
return every(250, 1400, function (t) {
var n = 1 + (Math.random() * 4 | 0);
for (var k = 0; k < n; k++) one(t + k * (0.05 + Math.random() * 0.1));
});
} },
{ id: 'block', grp: 'tr', name: '木鱼', tip: '笃、笃、笃', make: function (w, out) {
var one = function (t) {
var o = w.createOscillator(); o.frequency.value = 580 + Math.random() * 80;
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.22, t + 0.004);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
o.start(t); o.stop(t + 0.12);
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 900, 7);
var ng = gn(w, 0);
s.connect(f); f.connect(ng); ng.connect(out);
ng.gain.setValueAtTime(0.0001, t);
ng.gain.exponentialRampToValueAtTime(0.16, t + 0.003);
ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
s.start(t, Math.random() * 2, 0.08);
};
return every(600, 3200, function (t) {
one(t);
if (Math.random() < 0.3) one(t + 0.14 + Math.random() * 0.1);
});
} },
{ id: 'knock', grp: 'tr', name: '叩门', tip: '隔一会儿，笃笃两三下', make: function (w, out) {
var one = function (t) {
var o = w.createOscillator(); o.frequency.value = 105;
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.4, t + 0.006);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
o.start(t); o.stop(t + 0.16);
var s = w.createBufferSource(); s.buffer = noise(w, 'brown');
var f = filt(w, 'lowpass', 420);
var ng = gn(w, 0);
s.connect(f); f.connect(ng); ng.connect(out);
ng.gain.setValueAtTime(0.0001, t);
ng.gain.exponentialRampToValueAtTime(0.2, t + 0.004);
ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
s.start(t, Math.random() * 2, 0.1);
};
return every(4000, 12000, function (t) {
var n = 2 + (Math.random() * 2 | 0);
for (var k = 0; k < n; k++) one(t + k * 0.34);
});
} },
{ id: 'clock', grp: 'tr', name: '挂钟', tip: '滴答，滴答，左一下右一下', make: function (w, out) {
var hi = false;
return every(1000, 1000, function (t) {
hi = !hi;
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', hi ? 2600 : 1900, 9);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.14, t + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
s.start(t, Math.random() * 2, 0.05);
});
} },
{ id: 'brush', grp: 'tr', name: '软刷', tip: '刷毛从耳边扫过去', make: function (w, out) {
return every(700, 2600, function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'lowpass', 1400);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
var dur = 0.25 + Math.random() * 0.5;
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.09, t + dur * 0.5);
g.gain.linearRampToValueAtTime(0.0001, t + dur);
s.start(t, Math.random() * 2, dur + 0.05);
});
} },
{ id: 'crinkle', grp: 'tr', name: '揉纸', tip: '纸在手里窸窸窣窣', make: function (w, out) {
var s = loop(w, 'white');
var f = filt(w, 'highpass', 2000);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out); s.start();
var off = every(1500, 6000, function (t) {
var n = 8 + (Math.random() * 14 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + Math.random() * 0.5;
g.gain.setValueAtTime(0.0001, t0);
g.gain.linearRampToValueAtTime(0.02 + Math.random() * 0.08, t0 + 0.004);
g.gain.linearRampToValueAtTime(0.0001, t0 + 0.012 + Math.random() * 0.02);
}
});
return function () { off(); stops(s)(); };
} },
{ id: 'beads', grp: 'tr', name: '珠串', tip: '捻珠子，轻轻碰撞', make: function (w, out) {
var one = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 2800 + Math.random() * 2200, 10);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.04 + Math.random() * 0.07, t + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
s.start(t, Math.random() * 2, 0.04);
};
return every(900, 4200, function (t) {
var n = 3 + (Math.random() * 6 | 0);
for (var k = 0; k < n; k++) one(t + Math.random() * 0.35);
});
} },
{ id: 'slime', grp: 'tr', name: '史莱姆', tip: '黏黏的一团，摁下去咕啾一声', make: function (w, out) {
var one = function (t) {
var o = w.createOscillator();
o.frequency.setValueAtTime(300 + Math.random() * 180, t);
o.frequency.exponentialRampToValueAtTime(85 + Math.random() * 40, t + 0.13);
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.1 + Math.random() * 0.06, t + 0.02);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
o.start(t); o.stop(t + 0.2);
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 1100, 3);
f.frequency.setValueAtTime(1100, t);
f.frequency.exponentialRampToValueAtTime(320, t + 0.1);
var ng = gn(w, 0);
s.connect(f); f.connect(ng); ng.connect(out);
ng.gain.setValueAtTime(0.0001, t);
ng.gain.linearRampToValueAtTime(0.05, t + 0.015);
ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
s.start(t, Math.random() * 2, 0.14);
};
return every(700, 2800, function (t) {
one(t);
if (Math.random() < 0.35) one(t + 0.12 + Math.random() * 0.12);
});
} },
{ id: 'wood', grp: 'tr', name: '敲木头', tip: '指节笃笃，敲在木头上', make: function (w, out) {
var one = function (t) {
var o = w.createOscillator(); o.type = 'triangle'; o.frequency.value = 170 + Math.random() * 50;
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.12, t + 0.005);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
o.start(t); o.stop(t + 0.12);
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 480 + Math.random() * 320, 4);
var ng = gn(w, 0);
s.connect(f); f.connect(ng); ng.connect(out);
ng.gain.setValueAtTime(0.0001, t);
ng.gain.exponentialRampToValueAtTime(0.16, t + 0.003);
ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
s.start(t, Math.random() * 2, 0.08);
};
return every(500, 2200, function (t) {
one(t);
if (Math.random() < 0.3) one(t + 0.13 + Math.random() * 0.08);
});
} },
{ id: 'earpick', grp: 'tr', name: '掏耳朵', tip: '鹅毛棒转一转，挖耳勺刮一刮', make: function (w, out) {
var pick = function (t) {
var n = 6 + (Math.random() * 9 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + k * (0.02 + Math.random() * 0.04);
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 4800 + Math.random() * 2400, 8);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.015 + Math.random() * 0.03, t0 + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.014);
s.start(t0, Math.random() * 2, 0.03);
}
};
var puff = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'lowpass', 2800);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
var dur = 0.4 + Math.random() * 0.35;
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.035, t + dur * 0.4);
g.gain.linearRampToValueAtTime(0.0001, t + dur);
s.start(t, Math.random() * 2, dur + 0.05);
};
return every(1200, 4200, function (t) { (Math.random() < 0.55 ? pick : puff)(t); });
} },
{ id: 'comb', grp: 'tr', name: '梳齿', tip: '梳齿一下一下刮过去', make: function (w, out) {
return every(900, 3200, function (t) {
var n = 8 + (Math.random() * 9 | 0);
var f0 = 2400 + Math.random() * 1400;
for (var k = 0; k < n; k++) {
var t0 = t + k * (0.016 + Math.random() * 0.014);
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', f0 + k * 60, 6);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.035 + Math.random() * 0.03, t0 + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.018);
s.start(t0, Math.random() * 2, 0.03);
}
});
} },
{ id: 'shuffle', grp: 'tr', name: '洗牌', tip: '纸牌哗啦啦理了一叠', make: function (w, out) {
return every(2600, 7200, function (t) {
var n = 4 + (Math.random() * 4 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + k * (0.05 + Math.random() * 0.08);
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 1200, 1.4);
f.frequency.setValueAtTime(1200 + Math.random() * 500, t0);
f.frequency.exponentialRampToValueAtTime(2600 + Math.random() * 800, t0 + 0.06);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.05, t0 + 0.02);
g.gain.linearRampToValueAtTime(0.0001, t0 + 0.07);
s.start(t0, Math.random() * 2, 0.1);
}
});
} },
{ id: 'nailglass', grp: 'tr', name: '敲玻璃', tip: '指甲笃笃敲在玻璃上，脆', make: function (w, out) {
var one = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 3400 + Math.random() * 1200, 9);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.1 + Math.random() * 0.08, t + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
s.start(t, Math.random() * 2, 0.04);
var o = w.createOscillator(); o.frequency.value = 1900 + Math.random() * 500;
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t);
og.gain.exponentialRampToValueAtTime(0.03, t + 0.004);
og.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
o.start(t); o.stop(t + 0.18);
};
return every(700, 3200, function (t) {
var n = 1 + (Math.random() * 4 | 0);
for (var k = 0; k < n; k++) one(t + k * (0.16 + Math.random() * 0.12));
});
} },
{ id: 'cup', grp: 'tr', name: '敲杯子', tip: '勺子碰上玻璃杯，当——', make: function (w, out) {
var one = function (t) {
var f = 1150 + Math.random() * 350;
[[f, 0.09], [f * 2.32, 0.035], [f * 4.1, 0.012]].forEach(function (p) {
var o = w.createOscillator(); o.frequency.value = p[0];
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(p[1], t + 0.005);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
o.start(t); o.stop(t + 1.0);
});
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var hf = filt(w, 'bandpass', 4200, 6);
var ng = gn(w, 0);
s.connect(hf); hf.connect(ng); ng.connect(out);
ng.gain.setValueAtTime(0.0001, t);
ng.gain.exponentialRampToValueAtTime(0.08, t + 0.002);
ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
s.start(t, Math.random() * 2, 0.05);
};
return every(1500, 6000, function (t) {
one(t);
if (Math.random() < 0.35) one(t + 0.2 + Math.random() * 0.15);
});
} },
{ id: 'wash', grp: 'tr', name: '洗头', tip: '温水浇下来，指腹在发间揉开泡沫', make: function (w, out) {
var s = loop(w, 'pink');
var bp = filt(w, 'bandpass', 950, 0.9), base = gn(w, 0.2);
s.connect(bp); bp.connect(base); base.connect(out); s.start();
var l1 = lfo(w, 0.13, 0.08, base.gain, 0.2);
var rub = loop(w, 'white');
var rf = filt(w, 'lowpass', 1100), rg = gn(w, 0);
rub.connect(rf); rf.connect(rg); rg.connect(out); rub.start();
var rubOff = every(1600, 3800, function (t) {
var dur = 0.7 + Math.random() * 0.9;
rg.gain.cancelScheduledValues(t);
rg.gain.setValueAtTime(0.0001, t);
rg.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.05, t + dur * 0.45);
rg.gain.linearRampToValueAtTime(0.0001, t + dur);
});
var splash = every(1300, 4200, function (t) {
var n = 2 + (Math.random() * 3 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + k * (0.03 + Math.random() * 0.08);
var sp = w.createBufferSource(); sp.buffer = noise(w, 'white');
var sf = filt(w, 'bandpass', 1600 + Math.random() * 1600, 2);
var sg = gn(w, 0);
sp.connect(sf); sf.connect(sg); sg.connect(out);
sg.gain.setValueAtTime(0.0001, t0);
sg.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.07, t0 + 0.006);
sg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05 + Math.random() * 0.05);
sp.start(t0, Math.random() * 2, 0.12);
}
});
return function () { rubOff(); splash(); stops(l1, s, rub)(); };
} },
{ id: 'aloe', grp: 'tr', name: '芦荟胶', tip: '胶黏黏地挖起来，慢慢抹开', make: function (w, out) {
var scoop = function (t) {
var o = w.createOscillator();
o.frequency.setValueAtTime(140 + Math.random() * 60, t);
o.frequency.exponentialRampToValueAtTime(60 + Math.random() * 20, t + 0.2);
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.13 + Math.random() * 0.05, t + 0.03);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
o.start(t); o.stop(t + 0.28);
var st = w.createOscillator();
st.frequency.setValueAtTime(220, t + 0.05);
st.frequency.exponentialRampToValueAtTime(520 + Math.random() * 200, t + 0.22);
st.frequency.exponentialRampToValueAtTime(180, t + 0.4);
var sg = gn(w, 0);
st.connect(sg); sg.connect(out);
sg.gain.setValueAtTime(0.0001, t + 0.05);
sg.gain.linearRampToValueAtTime(0.03, t + 0.2);
sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
st.start(t); st.stop(t + 0.46);
var s = w.createBufferSource(); s.buffer = noise(w, 'brown');
var f = filt(w, 'lowpass', 480);
var ng = gn(w, 0);
s.connect(f); f.connect(ng); ng.connect(out);
ng.gain.setValueAtTime(0.0001, t + 0.24);
ng.gain.linearRampToValueAtTime(0.06, t + 0.34);
ng.gain.linearRampToValueAtTime(0.0001, t + 0.55);
s.start(t + 0.2, Math.random() * 2, 0.4);
};
return every(1800, 5200, function (t) {
scoop(t);
if (Math.random() < 0.4) scoop(t + 0.7 + Math.random() * 0.5);
});
} },
{ id: 'rub', grp: 'tr', name: '搓手', tip: '掌心贴着掌心，一来一回地摩挲', make: function (w, out) {
var stroke = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'lowpass', 850);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
var dur = 0.25 + Math.random() * 0.2;
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.045 + Math.random() * 0.04, t + dur * 0.5);
g.gain.linearRampToValueAtTime(0.0001, t + dur);
s.start(t, Math.random() * 2, dur + 0.05);
};
return every(1200, 3000, function (t) {
stroke(t);
stroke(t + 0.35 + Math.random() * 0.15);
});
} },
{ id: 'tear', grp: 'tr', name: '撕纸', tip: '刺啦——一条撕开', make: function (w, out) {
return every(3500, 10000, function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 900, 1.6);
f.frequency.setValueAtTime(800 + Math.random() * 400, t);
f.frequency.exponentialRampToValueAtTime(2800 + Math.random() * 1000, t + 0.3);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.12, t + 0.05);
g.gain.setValueAtTime(0.12, t + 0.16);
g.gain.linearRampToValueAtTime(0.16, t + 0.2);
g.gain.linearRampToValueAtTime(0.0001, t + 0.34);
s.start(t, Math.random() * 2, 0.4);
});
} },
{ id: 'bag', grp: 'tr', name: '塑料袋', tip: '窸窸窣窣抖开来，比纸更亮更碎', make: function (w, out) {
var s = loop(w, 'white');
var f = filt(w, 'highpass', 3400);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out); s.start();
var off = every(1800, 7000, function (t) {
var n = 14 + (Math.random() * 18 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + Math.random() * 0.8;
g.gain.setValueAtTime(0.0001, t0);
g.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.06, t0 + 0.003);
g.gain.linearRampToValueAtTime(0.0001, t0 + 0.008 + Math.random() * 0.018);
}
});
var snap = every(2500, 8000, function (t) {
var o = w.createOscillator();
o.frequency.setValueAtTime(1300 + Math.random() * 600, t);
o.frequency.exponentialRampToValueAtTime(300, t + 0.03);
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.12, t + 0.003);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
o.start(t); o.stop(t + 0.06);
});
return function () { off(); snap(); stops(s)(); };
} },
{ id: 'ice', grp: 'tr', name: '冰块', tip: '冰块在杯子里碰来碰去', make: function (w, out) {
var clink = function (t) {
var f = 1900 + Math.random() * 900;
[[f, 0.07], [f * 1.83, 0.025]].forEach(function (p) {
var o = w.createOscillator(); o.frequency.value = p[0];
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(p[1], t + 0.004);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
o.start(t); o.stop(t + 0.26);
});
};
return every(900, 3800, function (t) {
var n = 2 + (Math.random() * 4 | 0);
for (var k = 0; k < n; k++) clink(t + Math.random() * 0.4);
});
} },
{ id: 'marble', grp: 'tr', name: '弹珠滚', tip: '木板上骨碌骨碌，滚一程停一程', make: function (w, out) {
var roll = function (t) {
var dt = 0.02 + Math.random() * 0.03;
var n = 6 + (Math.random() * 8 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + dt;
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 1400 + Math.random() * 1600, 6);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, t0 + 0.004);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
s.start(t0, Math.random() * 2, 0.05);
dt += 0.03 + Math.random() * 0.09;
}
var o = w.createOscillator(); o.type = 'triangle'; o.frequency.value = 160 + Math.random() * 50;
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t + dt);
og.gain.exponentialRampToValueAtTime(0.1, t + dt + 0.005);
og.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.07);
o.start(t + dt); o.stop(t + dt + 0.1);
};
return every(2000, 6000, function (t) { roll(t); });
} },
{ id: 'rice', grp: 'tr', name: '倒豆子', tip: '哗啦一小捧，滚几颗出来', make: function (w, out) {
var grain = function (t, v) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 3800 + Math.random() * 2200, 8);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(v, t + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.014);
s.start(t, Math.random() * 2, 0.03);
};
return every(2500, 7000, function (t) {
var n = 22 + (Math.random() * 18 | 0);
for (var k = 0; k < n; k++) grain(t + Math.random() * 0.6, 0.02 + Math.random() * 0.03);
var m = 3 + (Math.random() * 4 | 0);
for (var j = 0; j < m; j++) grain(t + 0.65 + Math.random() * 0.5, 0.012 + Math.random() * 0.015);
});
} },
{ id: 'pencil', grp: 'tr', name: '削铅笔', tip: '沙——沙——，刀片贴着木头走', make: function (w, out) {
var stroke = function (t, up) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 700, 1.2);
f.frequency.setValueAtTime(up ? 700 + Math.random() * 200 : 2200 + Math.random() * 400, t);
f.frequency.exponentialRampToValueAtTime(up ? 2400 + Math.random() * 400 : 750, t + 0.7);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
var dur = 0.55 + Math.random() * 0.3;
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.03, t + dur * 0.4);
g.gain.linearRampToValueAtTime(0.0001, t + dur);
s.start(t, Math.random() * 2, dur + 0.05);
};
return every(1800, 4000, function (t) {
stroke(t, true);
stroke(t + 0.85 + Math.random() * 0.25, false);
});
} },
{ id: 'cream', grp: 'tr', name: '涂面霜', tip: '比芦荟胶更闷更滑，慢慢抹匀', make: function (w, out) {
var smear = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'brown');
var f = filt(w, 'lowpass', 360);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
var dur = 0.7 + Math.random() * 0.8;
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.03, t + dur * 0.4);
g.gain.linearRampToValueAtTime(0.0001, t + dur);
s.start(t, Math.random() * 2, dur + 0.05);
};
var squelch = function (t) {
var o = w.createOscillator();
o.frequency.setValueAtTime(180 + Math.random() * 60, t);
o.frequency.exponentialRampToValueAtTime(85, t + 0.12);
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.06, t + 0.02);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
o.start(t); o.stop(t + 0.18);
};
return every(1500, 3800, function (t) {
smear(t);
if (Math.random() < 0.3) squelch(t + 0.3 + Math.random() * 0.3);
});
} },
{ id: 'soda', grp: 'tr', name: '汽水气泡', tip: '细密的小啵啵往杯口冒', make: function (w, out) {
var blip = function (t) {
var o = w.createOscillator();
o.frequency.setValueAtTime(1400 + Math.random() * 900, t);
o.frequency.exponentialRampToValueAtTime(2300 + Math.random() * 700, t + 0.012);
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.015 + Math.random() * 0.025, t + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.014);
o.start(t); o.stop(t + 0.02);
};
return every(900, 2500, function (t) {
var n = 6 + (Math.random() * 10 | 0);
for (var k = 0; k < n; k++) blip(t + Math.random() * 1.2);
});
} },
{ id: 'tea', grp: 'tr', name: '倒茶', tip: '咕嘟咕嘟斟进杯里，收尾磕一下', make: function (w, out) {
var one = function (t) {
var dur = 1.2 + Math.random() * 1.2;
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 1000, 1);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.04, t + 0.08);
g.gain.setValueAtTime(0.04, t + dur - 0.12);
g.gain.linearRampToValueAtTime(0.0001, t + dur);
s.start(t, Math.random() * 2, dur + 0.05);
var plop = function (t0) {
var o = w.createOscillator();
o.frequency.setValueAtTime(300 + Math.random() * 250, t0);
o.frequency.exponentialRampToValueAtTime(140 + Math.random() * 60, t0 + 0.05);
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t0);
og.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.04, t0 + 0.008);
og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
o.start(t0); o.stop(t0 + 0.09);
};
var pt = 0.05;
while (pt < dur - 0.1) { plop(t + pt); pt += 0.04 + Math.random() * 0.07; }
var cf = 1100 + Math.random() * 300;
[[cf, 0.05], [cf * 2.32, 0.018]].forEach(function (p) {
var o2 = w.createOscillator(); o2.frequency.value = p[0];
var g2 = gn(w, 0);
o2.connect(g2); g2.connect(out);
g2.gain.setValueAtTime(0.0001, t + dur + 0.12);
g2.gain.exponentialRampToValueAtTime(p[1], t + dur + 0.13);
g2.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.5);
o2.start(t + dur + 0.12); o2.stop(t + dur + 0.55);
});
};
return every(9000, 22000, function (t) { one(t); });
} },
{ id: 'candy', grp: 'tr', name: '糖果纸', tip: '拧开一颗，窸窸窣窣亮亮的碎响', make: function (w, out) {
var s = loop(w, 'white');
var f = filt(w, 'highpass', 5200);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out); s.start();
var off = every(1400, 4800, function (t) {
var n = 10 + (Math.random() * 12 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + Math.random() * 0.55;
g.gain.setValueAtTime(0.0001, t0);
g.gain.linearRampToValueAtTime(0.01 + Math.random() * 0.035, t0 + 0.002);
g.gain.linearRampToValueAtTime(0.0001, t0 + 0.006 + Math.random() * 0.008);
}
});
return function () { off(); stops(s)(); };
} },
{ id: 'foam', grp: 'tr', name: '搓泡沫', tip: '指腹蹭着泡沫板，吱——吱——', make: function (w, out) {
var squeal = function (t) {
var dur = 0.25 + Math.random() * 0.3;
var o = w.createOscillator();
var seg = 0.01 + Math.random() * 0.006;
for (var tt = 0; tt < dur; tt += seg) {
o.frequency.setValueAtTime(900 + Math.random() * 700, t + tt);
}
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.028 + Math.random() * 0.02, t + dur * 0.3);
g.gain.linearRampToValueAtTime(0.0001, t + dur);
o.start(t); o.stop(t + dur + 0.02);
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 1200, 2);
var ng = gn(w, 0);
s.connect(f); f.connect(ng); ng.connect(out);
ng.gain.setValueAtTime(0.0001, t);
ng.gain.linearRampToValueAtTime(0.02, t + dur * 0.4);
ng.gain.linearRampToValueAtTime(0.0001, t + dur);
s.start(t, Math.random() * 2, dur + 0.05);
};
return every(1300, 3200, function (t) {
squeal(t);
if (Math.random() < 0.45) squeal(t + 0.4 + Math.random() * 0.3);
});
} },
{ id: 'zipper', grp: 'tr', name: '拉链', tip: '刺啦一拉到底，头上磕一下', make: function (w, out) {
var pull = function (t) {
var dur = 0.4 + Math.random() * 0.6;
var dt = 0;
while (dt < dur) {
var t0 = t + dt;
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 2600 + Math.random() * 1600, 6);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.02 + Math.random() * 0.025, t0 + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.012);
s.start(t0, Math.random() * 2, 0.03);
dt += 0.012 + Math.random() * 0.012;
}
var o = w.createOscillator(); o.type = 'triangle'; o.frequency.value = 210 + Math.random() * 60;
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t + dur);
og.gain.exponentialRampToValueAtTime(0.09, t + dur + 0.004);
og.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06);
o.start(t + dur); o.stop(t + dur + 0.09);
};
return every(2200, 6500, function (t) { pull(t); });
} },
{ id: 'velcro', grp: 'tr', name: '撕魔术贴', tip: '刺啦——一条撕开的钩毛声', make: function (w, out) {
return every(2200, 6000, function (t) {
var dur = 0.22 + Math.random() * 0.3;
var dt = 0;
while (dt < dur) {
var t0 = t + dt;
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 2000 + Math.random() * 3000, 4);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
var v = (0.05 + Math.random() * 0.06) * (1 - dt / dur * 0.6);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(v, t0 + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.014);
s.start(t0, Math.random() * 2, 0.03);
dt += 0.008 + Math.random() * 0.014;
}
});
} },
{ id: 'stamp', grp: 'tr', name: '盖印章', tip: '啪嗒一记，落在纸上', make: function (w, out) {
var one = function (t) {
var o = w.createOscillator(); o.type = 'triangle'; o.frequency.value = 120 + Math.random() * 30;
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.2, t + 0.005);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
o.start(t); o.stop(t + 0.12);
var s = w.createBufferSource(); s.buffer = noise(w, 'brown');
var f = filt(w, 'lowpass', 420);
var ng = gn(w, 0);
s.connect(f); f.connect(ng); ng.connect(out);
ng.gain.setValueAtTime(0.0001, t);
ng.gain.exponentialRampToValueAtTime(0.14, t + 0.004);
ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
s.start(t, Math.random() * 2, 0.08);
var sw = w.createBufferSource(); sw.buffer = noise(w, 'white');
var sf = filt(w, 'bandpass', 1800, 2);
var sg = gn(w, 0);
sw.connect(sf); sf.connect(sg); sg.connect(out);
sg.gain.setValueAtTime(0.0001, t + 0.14);
sg.gain.linearRampToValueAtTime(0.02, t + 0.2);
sg.gain.linearRampToValueAtTime(0.0001, t + 0.3);
sw.start(t + 0.12, Math.random() * 2, 0.2);
};
return every(2000, 6000, function (t) { one(t); });
} },
{ id: 'typewriter', grp: 'tr', name: '打字机', tip: '咔嗒咔嗒一行字，到头「叮」一声', make: function (w, out) {
var key = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 2600 + Math.random() * 1200, 5);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.09 + Math.random() * 0.05, t + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
s.start(t, Math.random() * 2, 0.05);
var o = w.createOscillator(); o.frequency.value = 170 + Math.random() * 40;
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t);
og.gain.exponentialRampToValueAtTime(0.07, t + 0.003);
og.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
o.start(t); o.stop(t + 0.06);
};
var ding = function (t) {
var o = w.createOscillator(); o.frequency.value = 1150;
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.07, t + 0.005);
g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
o.start(t); o.stop(t + 1.2);
};
var slide = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 900, 1.5);
f.frequency.setValueAtTime(1400, t);
f.frequency.exponentialRampToValueAtTime(600, t + 0.24);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.05, t + 0.05);
g.gain.linearRampToValueAtTime(0.0001, t + 0.26);
s.start(t, Math.random() * 2, 0.3);
};
return every(3500, 9000, function (t) {
var n = 6 + (Math.random() * 8 | 0);
var dt = 0;
for (var k = 0; k < n; k++) { key(t + dt); dt += 0.08 + Math.random() * 0.13; }
ding(t + dt + 0.1);
slide(t + dt + 0.35);
});
} },
{ id: 'windkey', grp: 'tr', name: '上发条', tip: '咔哒咔哒拧几圈', make: function (w, out) {
var click = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 1900 + Math.random() * 900, 7);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.03, t + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.016);
s.start(t, Math.random() * 2, 0.03);
};
return every(3000, 8000, function (t) {
var turns = 2 + (Math.random() * 3 | 0);
var dt = 0;
for (var k = 0; k < turns; k++) {
var n = 5 + (Math.random() * 5 | 0);
for (var j = 0; j < n; j++) { click(t + dt); dt += 0.045 + Math.random() * 0.03; }
dt += 0.18 + Math.random() * 0.2;
}
});
} },
{ id: 'drawer', grp: 'tr', name: '开关抽屉', tip: '拉开一格，又推回去磕一下', make: function (w, out) {
var slide = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 500, 1.6);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
var dur = 0.28 + Math.random() * 0.2;
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.045, t + dur * 0.5);
g.gain.linearRampToValueAtTime(0.0001, t + dur);
s.start(t, Math.random() * 2, dur + 0.05);
};
var thud = function (t) {
var o = w.createOscillator(); o.type = 'triangle'; o.frequency.value = 95 + Math.random() * 25;
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.18, t + 0.005);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
o.start(t); o.stop(t + 0.13);
};
return every(4000, 10000, function (t) {
slide(t);
var gap = 0.5 + Math.random() * 0.8;
slide(t + gap);
thud(t + gap + 0.26);
});
} },
{ id: 'canopen', grp: 'tr', name: '开汽水罐', tip: '咔哒拉开，「呲——」气先冲出来', make: function (w, out) {
var one = function (t) {
[0, 0.05].forEach(function (d, i) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', i ? 3200 : 2400, 6);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t + d);
g.gain.exponentialRampToValueAtTime(i ? 0.14 : 0.08, t + d + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.02);
s.start(t + d, Math.random() * 2, 0.04);
});
var h = w.createBufferSource(); h.buffer = noise(w, 'white');
var hf = filt(w, 'bandpass', 2000, 0.8);
var hg = gn(w, 0);
h.connect(hf); hf.connect(hg); hg.connect(out);
hg.gain.setValueAtTime(0.0001, t + 0.05);
hg.gain.exponentialRampToValueAtTime(0.16, t + 0.09);
hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
h.start(t + 0.04, Math.random() * 2, 0.8);
for (var k = 0; k < 8; k++) {
var t0 = t + 0.35 + Math.random() * 0.9;
var o = w.createOscillator();
o.frequency.setValueAtTime(1500 + Math.random() * 700, t0);
o.frequency.exponentialRampToValueAtTime(2400 + Math.random() * 600, t0 + 0.012);
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t0);
og.gain.exponentialRampToValueAtTime(0.012 + Math.random() * 0.02, t0 + 0.002);
og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.014);
o.start(t0); o.stop(t0 + 0.02);
}
};
return every(8000, 20000, function (t) { one(t); });
} },
{ id: 'grinder', grp: 'tr', name: '磨咖啡豆', tip: '先裂几颗，再嗡嗡磨一程', make: function (w, out) {
var one = function (t) {
for (var k = 0; k < 5 + (Math.random() * 5 | 0); k++) {
var t0 = t + Math.random() * 0.5;
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 1500 + Math.random() * 1500, 5);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, t0 + 0.003);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
s.start(t0, Math.random() * 2, 0.05);
}
var g2 = w.createBufferSource(); g2.buffer = noise(w, 'brown');
var gf = filt(w, 'bandpass', 620, 1.2);
var gg = gn(w, 0);
g2.connect(gf); gf.connect(gg); gg.connect(out);
var dur = 1.6 + Math.random() * 1.6;
gg.gain.setValueAtTime(0.0001, t + 0.4);
gg.gain.linearRampToValueAtTime(0.14, t + 0.7);
gg.gain.setValueAtTime(0.14, t + 0.4 + dur - 0.2);
gg.gain.linearRampToValueAtTime(0.0001, t + 0.4 + dur);
g2.start(t + 0.4, Math.random() * 2, dur + 0.1);
var l1 = lfo(w, 3.1, 0.02, gg.gain, 0.14);
try { l1.stop(t + 0.4 + dur + 0.5); } catch (e) {}
};
return every(6000, 15000, function (t) { one(t); });
} },
{ id: 'chop', grp: 'tr', name: '切菜', tip: '笃笃笃有节奏的刀落在砧板上', make: function (w, out) {
var chop = function (t) {
var o = w.createOscillator(); o.type = 'triangle'; o.frequency.value = 110 + Math.random() * 50;
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.exponentialRampToValueAtTime(0.15 + Math.random() * 0.07, t + 0.004);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
o.start(t); o.stop(t + 0.1);
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'lowpass', 700);
var ng = gn(w, 0);
s.connect(f); f.connect(ng); ng.connect(out);
ng.gain.setValueAtTime(0.0001, t);
ng.gain.exponentialRampToValueAtTime(0.1, t + 0.003);
ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
s.start(t, Math.random() * 2, 0.06);
};
return every(1300, 3200, function (t) {
var n = 4 + (Math.random() * 5 | 0);
for (var k = 0; k < n; k++) chop(t + k * (0.22 + Math.random() * 0.12));
});
} },
{ id: 'simmer', grp: 'tr', name: '小火咕嘟', tip: '汤在锅里绵绵地冒小泡', make: function (w, out) {
var st = loop(w, 'white'), stf = filt(w, 'lowpass', 3800), stg = gn(w, 0.008);
st.connect(stf); stf.connect(stg); stg.connect(out); st.start();
var bub = every(180, 750, function (t) {
var n = 1 + (Math.random() * 3 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + k * (0.04 + Math.random() * 0.08);
var o = w.createOscillator();
o.frequency.setValueAtTime(240 + Math.random() * 200, t0);
o.frequency.exponentialRampToValueAtTime(120 + Math.random() * 60, t0 + 0.05);
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.025 + Math.random() * 0.03, t0 + 0.008);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
o.start(t0); o.stop(t0 + 0.09);
}
});
return function () { bub(); stops(st)(); };
} },
{ id: 'honey', grp: 'tr', name: '挤蜂蜜', tip: '黏稠的一线慢慢垂下来', make: function (w, out) {
var drip = function (t) {
var o = w.createOscillator();
o.frequency.setValueAtTime(160 + Math.random() * 50, t);
o.frequency.exponentialRampToValueAtTime(70 + Math.random() * 20, t + 0.5);
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.05, t + 0.15);
g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
o.start(t); o.stop(t + 0.6);
var p = w.createOscillator();
p.frequency.setValueAtTime(320 + Math.random() * 120, t + 0.55);
p.frequency.exponentialRampToValueAtTime(140, t + 0.62);
var pg = gn(w, 0);
p.connect(pg); pg.connect(out);
pg.gain.setValueAtTime(0.0001, t + 0.55);
pg.gain.exponentialRampToValueAtTime(0.04, t + 0.565);
pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.63);
p.start(t + 0.55); p.stop(t + 0.68);
};
return every(1500, 4000, function (t) {
var n = 1 + (Math.random() * 3 | 0);
for (var k = 0; k < n; k++) drip(t + k * (0.7 + Math.random() * 0.5));
});
} },
{ id: 'mahjong', grp: 'tr', name: '麻将洗牌', tip: '哗啦啦推倒重洗，牌面噼里啪啦', make: function (w, out) {
var wash = function (t) {
var dur = 1.5 + Math.random() * 1.0;
var dt = 0;
while (dt < dur) {
var t0 = t + dt;
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 1500 + Math.random() * 1700, 4);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.06, t0 + 0.003);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
s.start(t0, Math.random() * 2, 0.05);
if (Math.random() < 0.4) {
var o = w.createOscillator(); o.type = 'triangle'; o.frequency.value = 150 + Math.random() * 80;
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t0);
og.gain.exponentialRampToValueAtTime(0.05, t0 + 0.004);
og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
o.start(t0); o.stop(t0 + 0.08);
}
dt += 0.02 + Math.random() * 0.06;
}
};
return every(5000, 14000, function (t) {
wash(t);
if (Math.random() < 0.5) wash(t + 1.8 + Math.random() * 0.6);
});
} },
{ id: 'dice', grp: 'tr', name: '摇骰子', tip: '盅里哗啦一摇，扣在桌上', make: function (w, out) {
var shake = function (t) {
var dt = 0;
for (var k = 0; k < 6 + (Math.random() * 5 | 0); k++) {
var t0 = t + dt;
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 2400 + Math.random() * 1600, 5);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.06 + Math.random() * 0.05, t0 + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.02);
s.start(t0, Math.random() * 2, 0.04);
dt += 0.05 + Math.random() * 0.07;
}
return t + dt;
};
return every(4000, 10000, function (t) {
var t1 = shake(t);
var b = 2 + (Math.random() * 2 | 0);
var bt = t1 + 0.12;
for (var j = 0; j < b; j++) {
var o = w.createOscillator(); o.type = 'triangle'; o.frequency.value = 170 - j * 25 + Math.random() * 20;
var g = gn(w, 0);
o.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, bt);
g.gain.exponentialRampToValueAtTime(0.12 - j * 0.03, bt + 0.004);
g.gain.exponentialRampToValueAtTime(0.0001, bt + 0.05);
o.start(bt); o.stop(bt + 0.08);
bt += 0.12 + Math.random() * 0.08;
}
});
} },
{ id: 'snowstep', grp: 'tr', name: '踩雪', tip: '咯吱——一步一个脚印', make: function (w, out) {
var step = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'lowpass', 1300);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
var dur = 0.14 + Math.random() * 0.12;
var n = 8 + (Math.random() * 8 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + Math.random() * dur;
g.gain.setValueAtTime(0.0001, t0);
g.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.05, t0 + 0.004);
g.gain.linearRampToValueAtTime(0.0001, t0 + 0.012 + Math.random() * 0.012);
}
s.start(t, Math.random() * 2, dur + 0.05);
if (Math.random() < 0.4) {
var o = w.createOscillator();
o.frequency.setValueAtTime(700 + Math.random() * 300, t + dur * 0.4);
o.frequency.exponentialRampToValueAtTime(450 + Math.random() * 150, t + dur * 0.4 + 0.08);
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, t + dur * 0.4);
og.gain.linearRampToValueAtTime(0.02, t + dur * 0.4 + 0.03);
og.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.4 + 0.1);
o.start(t + dur * 0.4); o.stop(t + dur * 0.4 + 0.14);
}
};
return every(1300, 3800, function (t) {
step(t);
if (Math.random() < 0.55) step(t + 0.55 + Math.random() * 0.3);
});
} },
{ id: 'leafstep', grp: 'tr', name: '踩落叶', tip: '干爽的碎裂，一步沙沙', make: function (w, out) {
var step = function (t) {
var dur = 0.1 + Math.random() * 0.1;
var n = 12 + (Math.random() * 10 | 0);
for (var k = 0; k < n; k++) {
var t0 = t + Math.random() * dur;
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 2600 + Math.random() * 2400, 4);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.02 + Math.random() * 0.04, t0 + 0.002);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.012);
s.start(t0, Math.random() * 2, 0.03);
}
};
return every(1300, 3500, function (t) {
step(t);
if (Math.random() < 0.6) step(t + 0.5 + Math.random() * 0.3);
});
} },
{ id: 'branch', grp: 'tr', name: '折树枝', tip: '嘎——嘣！先弯后断', make: function (w, out) {
var one = function (t) {
var creak = w.createOscillator();
var cd = 0.3 + Math.random() * 0.3;
for (var tt = 0; tt < cd; tt += 0.018) {
creak.frequency.setValueAtTime(180 + Math.random() * 120, t + tt);
}
var cg = gn(w, 0);
creak.connect(cg); cg.connect(out);
cg.gain.setValueAtTime(0.0001, t);
cg.gain.linearRampToValueAtTime(0.05, t + cd * 0.5);
cg.gain.exponentialRampToValueAtTime(0.0001, t + cd);
creak.start(t); creak.stop(t + cd + 0.02);
var snap = t + cd + 0.05;
var s = w.createBufferSource(); s.buffer = noise(w, 'white');
var f = filt(w, 'bandpass', 1100, 1.5);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
g.gain.setValueAtTime(0.0001, snap);
g.gain.exponentialRampToValueAtTime(0.18, snap + 0.003);
g.gain.exponentialRampToValueAtTime(0.0001, snap + 0.05);
s.start(snap, Math.random() * 2, 0.08);
var o = w.createOscillator(); o.type = 'triangle'; o.frequency.value = 130 + Math.random() * 40;
var og = gn(w, 0);
o.connect(og); og.connect(out);
og.gain.setValueAtTime(0.0001, snap);
og.gain.exponentialRampToValueAtTime(0.14, snap + 0.004);
og.gain.exponentialRampToValueAtTime(0.0001, snap + 0.08);
o.start(snap); o.stop(snap + 0.11);
};
return every(4000, 10000, function (t) { one(t); });
} },
{ id: 'pokefire', grp: 'tr', name: '拨篝火', tip: '柴火被拨动，火星炸一下', make: function (w, out) {
var one = function (t) {
var s = w.createBufferSource(); s.buffer = noise(w, 'brown');
var f = filt(w, 'lowpass', 500);
var g = gn(w, 0);
s.connect(f); f.connect(g); g.connect(out);
var dur = 0.3 + Math.random() * 0.3;
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(0.09, t + dur * 0.5);
g.gain.linearRampToValueAtTime(0.0001, t + dur);
s.start(t, Math.random() * 2, dur + 0.05);
for (var k = 0; k < 4 + (Math.random() * 6 | 0); k++) {
var t0 = t + dur * 0.5 + Math.random() * 0.4;
var sp = w.createBufferSource(); sp.buffer = noise(w, 'white');
var sf = filt(w, 'highpass', 3200);
var sg = gn(w, 0);
sp.connect(sf); sf.connect(sg); sg.connect(out);
sg.gain.setValueAtTime(0.0001, t0);
sg.gain.exponentialRampToValueAtTime(0.02 + Math.random() * 0.05, t0 + 0.002);
sg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.015);
sp.start(t0, Math.random() * 2, 0.03);
}
};
return every(3000, 8000, function (t) { one(t); });
} }
];
function _nameOf(id) { for (var i = 0; i < SR_SOUNDS.length; i++) if (SR_SOUNDS[i].id === id) return SR_SOUNDS[i].name; return id; }
function _srRevIR(w, sec, decay) {
var len = Math.floor(w.sampleRate * sec);
var b = w.createBuffer(2, len, w.sampleRate);
for (var c = 0; c < 2; c++) {
var d = b.getChannelData(c);
for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
}
return b;
}
var _srKick = null, _srKickSaid = false;
function ensureAC() {
if (!AC) {
var Ctor = window.AudioContext || window.webkitAudioContext;
AC = new Ctor();
var s = srRead();
master = gn(AC, s.vol / 100);
var hp = filt(AC, 'highpass', 45);
var soft = filt(AC, 'lowpass', 7000);
var softCut = AC.createBiquadFilter();
softCut.type = 'peaking'; softCut.frequency.value = 4400; softCut.Q.value = 0.8; softCut.gain.value = -7;
softN = soft; cutN = softCut;
var comp = AC.createDynamicsCompressor();
comp.threshold.value = -18; comp.ratio.value = 4;
compN = comp;
dimG = gn(AC, 1);
master.connect(hp); hp.connect(soft); soft.connect(softCut); softCut.connect(dimG);
dimG.connect(comp); comp.connect(AC.destination);
bgBus = gn(AC, s.volBg / 100); bgBus.connect(master);
trBus = gn(AC, s.volTrig / 100); trBus.connect(master);
whBus = gn(AC, s.volWh / 100);
var whLp = filt(AC, 'lowpass', 5000);
var whSoft = gn(AC, 0.85);
whBus.connect(whLp); whLp.connect(whSoft); whSoft.connect(master);
whWet = null;
try {
var sconv = AC.createConvolver();
sconv.buffer = _srRevIR(AC, 2.2, 2.8);
var swet = gn(AC, srRead().reverb / 100 * 0.6);
whLp.connect(sconv); sconv.connect(swet); swet.connect(whSoft);
whWet = swet;
} catch (e) { whWet = null; }
whAir = null;
try {
var airSrc = loop(AC, 'pink');
var airF = filt(AC, 'bandpass', 1400, 0.6);
var airG = gn(AC, 0.0001);
airSrc.connect(airF); airF.connect(airG); airG.connect(whSoft); airSrc.start();
whAir = { src: airSrc, g: airG };
} catch (e) { whAir = null; }
}
if (AC.state === 'suspended') {
AC.resume().catch(function () {});
if (!_srKick) {
_srKick = function () {
try { if (AC.state === 'suspended') AC.resume().catch(function () {}); } catch (e0) {}
if (AC.state === 'running') {
document.removeEventListener('pointerdown', _srKick, true);
document.removeEventListener('touchend', _srKick, true);
_srKick = null;
}
};
document.addEventListener('pointerdown', _srKick, true);
document.addEventListener('touchend', _srKick, true);
}
if (!_srKickSaid) { _srKickSaid = true; _srSys('手机浏览器扣着声音——随便再点一下屏幕就放行'); }
}
return AC;
}
var SR_AIR_PEAK = 0.006;
function _srAirFollow(t, dur) {
if (!whAir) return;
try {
var g = whAir.g.gain;
g.cancelScheduledValues(t);
g.setValueAtTime(0.0001, t);
g.linearRampToValueAtTime(SR_AIR_PEAK, t + Math.min(0.5, Math.max(0.15, dur / 5)));
if (dur > 1.2) {
g.setValueAtTime(SR_AIR_PEAK, t + dur - 0.5);
g.linearRampToValueAtTime(0.0001, t + dur);
}
} catch (e) {}
}
function _srAirOff() {
if (!whAir || !AC) return;
try {
whAir.g.gain.cancelScheduledValues(AC.currentTime);
whAir.g.gain.setValueAtTime(0.0001, AC.currentTime);
} catch (e) {}
}
function _surOne(L, on) {
try {
if (L.lfo) { try { L.lfo.stop(); } catch (e) {} try { L.lfo.disconnect(); } catch (e) {} L.lfo = null; }
if (on && L.p && L.p.pan) {
L.p.pan.value = Math.random() * 0.6 - 0.3;
var o = AC.createOscillator(); o.frequency.value = 0.03 + Math.random() * 0.05;
var g = gn(AC, 0.5);
o.connect(g); g.connect(L.p.pan); o.start();
L.lfo = o;
} else if (L.p && L.p.pan) {
L.p.pan.setTargetAtTime(0, AC.currentTime, 0.4);
}
} catch (e) {}
}
function _surApply() {
var on = srRead().sur;
live.forEach(function (L) { _surOne(L, on); });
}
function _srWiden(w) {
var input = gn(w, 1), outN = gn(w, 1);
if (!w.createStereoPanner || !w.createDelay) { input.connect(outN); return { in: input, out: outN, kill: function () { try { input.disconnect(); outN.disconnect(); } catch (e) {} } }; }
var pL = w.createStereoPanner(), pR = w.createStereoPanner();
var dly = w.createDelay(0.05), gl = gn(w, 0.82), gr = gn(w, 0.62);
pL.pan.value = -1; pR.pan.value = 1; dly.delayTime.value = 0.010;
input.connect(gl); gl.connect(pL); pL.connect(outN);
input.connect(dly); dly.connect(gr); gr.connect(pR); pR.connect(outN);
return {
in: input, out: outN,
kill: function () {
try { input.disconnect(); gl.disconnect(); pL.disconnect(); dly.disconnect(); gr.disconnect(); pR.disconnect(); outN.disconnect(); } catch (e) {}
}
};
}
function addLayer(sd, secs, by, opts) {
if (!AC || live.has(sd.id)) return;
var g = gn(AC, 0);
var lg = gn(AC, 1);
var bus = sd.grp === 'tr' ? trBus : bgBus;
var p = AC.createStereoPanner ? AC.createStereoPanner() : gn(AC, 1);
var wide = null;
if (sd.grp === 'tr') {
wide = _srWiden(AC);
g.connect(lg); lg.connect(wide.in); wide.out.connect(p); p.connect(bus);
} else {
g.connect(lg); lg.connect(p); p.connect(bus);
}
var stop = function () {};
var plan = secs ? (Date.now() + secs * 1000) : 0;
var L = { stop: stop, g: g, lg: lg, p: p, wide: wide, lfo: null, vol: 100, grp: sd.grp,
plan: plan, protect: !!(opts && opts.protect), hbBy: (opts && opts.hbBy) || '' };
_mkCtx = L;
try { stop = sd.make(AC, g) || stop; } catch (e) {}
finally { _mkCtx = null; }
L.stop = stop;
g.gain.setValueAtTime(0.0001, AC.currentTime);
g.gain.linearRampToValueAtTime(sd.grp === 'tr' ? SR_TR_GAIN : 1, AC.currentTime + 1.8);
live.set(sd.id, L);
_surOne(L, srRead().sur);
if (secs) {
var t = setTimeout(function () {
dropTimers.delete(t);
dropLayer(sd.id, '');
}, secs * 1000);
dropTimers.add(t);
}
if (!(opts && opts.silent)) {
var nm = { id: _srMsgId(), who: '', text: '', kind: 'snd', snd: { id: sd.id, t0: Date.now(), t1: 0, plan: plan } };
if (opts && opts.text) {
nm.text = opts.text;
nm.who = by;
} else if (opts && opts.who) {
nm.who = opts.who;
nm.text = (sd.grp === 'tr' ? '拿出了助眠道具「' : '把背景音换成了「') + sd.name + '」';
} else if (by === 'me') {
nm.who = 'me'; nm.text = '你打开了「' + sd.name + '」';
} else {
var st = srRead();
var cast = (st.mates || []).filter(function (cid) { return _srMateOf(cid); });
if (cast.length) {
nm.who = cast[Math.random() * cast.length | 0];
nm.text = (sd.grp === 'tr' ? '拿出了助眠道具「' : '把背景音换成了「') + sd.name + '」';
} else {
nm.who = 'sys'; nm.text = '换上了「' + sd.name + '」';
}
}
srMsgs.push(nm);
if (srMsgs.length > 80) srMsgs.splice(0, srMsgs.length - 80);
L.msgId = nm.id;
}
renderSleepRoom();
}
function setLayerVol(id, v) {
var L = live.get(id);
if (!L || !AC) return;
L.vol = v;
try { L.lg.gain.setTargetAtTime(v / 100, AC.currentTime, 0.05); } catch (e) {}
}
function dropLayer(id, why) {
var L = live.get(id);
if (!L || !AC) return;
live.delete(id);
var t = AC.currentTime;
try {
L.g.gain.cancelScheduledValues(t);
L.g.gain.setValueAtTime(Math.max(L.g.gain.value, 0.0001), t);
L.g.gain.linearRampToValueAtTime(0.0001, t + 2);
} catch (e) {}
var tm = setTimeout(function () {
dropTimers.delete(tm);
try { L.stop(); } catch (e) {}
try { L.g.disconnect(); L.lg.disconnect(); L.p.disconnect(); } catch (e) {}
if (L.wide) L.wide.kill();
}, 2200);
dropTimers.add(tm);
var sm = null;
if (L.msgId) for (var si = 0; si < srMsgs.length; si++) if (srMsgs[si].id === L.msgId) sm = srMsgs[si];
if (sm && sm.snd && !sm.snd.t1) sm.snd.t1 = Date.now();
else if (why) _srSys(why);
renderSleepRoom();
}
function stopAll() { Array.from(live.keys()).forEach(function (id) { dropLayer(id, ''); }); }
function goLive() {
if (playing) {
playing = false;
srEndsAt = 0;
if (dimG && AC) { try { dimG.gain.cancelScheduledValues(AC.currentTime); dimG.gain.setValueAtTime(1, AC.currentTime); } catch (e) {} }
clearTimeout(schedT); schedT = null;
whStop();
_srPlanStop();
_srMusicStop();
_srDuck(false);
whQ.length = 0; whBusy = false;
stopAll();
_srSys('下播了，晚安');
} else {
ensureAC();
playing = true;
_srSys('开播了，晚安');
var sdm = srRead();
srEndsAt = sdm.dmMin > 0 ? (Date.now() + sdm.dmMin * 60000) : 0;
if (dimG) { try { dimG.gain.cancelScheduledValues(AC.currentTime); dimG.gain.setValueAtTime(1, AC.currentTime); } catch (e) {} }
if (sdm.mode === 'custom') _srPlanStart();
else {
if (sdm.auto) schedule(1500);
whStartSession();
_srMusicStart();
}
}
renderSleepRoom();
}
function schedule(afterMs) {
clearTimeout(schedT);
var s = srRead();
var ms = afterMs || s.gap * 1000 * (0.5 + Math.random());
schedT = setTimeout(dirig, ms);
}
function dirig() {
if (!playing || !srRead().auto) return;
var s = srRead();
var pool = SR_SOUNDS.filter(function (x) { return !s.off[x.id]; });
if (!pool.length) { schedule(); return; }
var active = Array.from(live.keys()).filter(function (id) {
var Lp = live.get(id);
return !(Lp && Lp.protect);
});
var addable = pool.filter(function (x) { return !live.has(x.id); });
var r = Math.random();
if (!active.length) {
if (addable.length) addRandom(addable, s);
} else if (active.length >= s.max || !addable.length) {
var id = active[Math.random() * active.length | 0];
dropLayer(id, '「' + _nameOf(id) + '」下播了');
if (r < 0.62 && addable.length && active.length - 1 < s.max) addRandom(addable, s);
} else {
addRandom(addable, s);
}
schedule();
}
function addRandom(addable, s) {
var sd = addable[Math.random() * addable.length | 0];
var mins = Math.max(1, Math.round(s.dur * (0.5 + Math.random())));
addLayer(sd, mins * 60, 'auto');
}
var SR_INVITE = {
ok: ['好呀……被子盖好等我，马上来。', '来啦来啦，你先躺好。', '嗯，今晚我守着你。'],
wait: ['等我一下……洗漱完就来。', '稍等我几分钟，别先睡着呀。', '好，我把手头这点事收个尾就来。'],
no: ['今晚就算了吧……你先睡，明天我陪你。', '今天不行，还有点事。改天换我点播。', '不了……今晚你想自己静静也挺好。晚安。'],
'in': ['我来了。闭眼，交给我。', '来了——声音会放得很轻很轻。', '到了。睡吧，我在。'],
bye: ['那我先去睡啦，晚安。', '好，你睡吧，晚安。', '嗯，晚安，好梦。']
};
function _invPick(k) { var a = SR_INVITE[k]; return a[Math.random() * a.length | 0]; }
function srInvite(cid) {
var s = srRead();
if (!s.mates || s.mates.indexOf(cid) >= 0) return;
if (!_srMateOf(cid)) return;
var name = _srMateName(cid);
_srSys('你轻声问「' + name + '」：今晚来哄睡吗？');
renderSleepRoom();
setTimeout(function () {
var r = Math.random();
if (r < 0.55) {
_srPush(cid, _invPick('ok'), 'say');
var st = srRead();
if (st.mates.indexOf(cid) < 0) { st.mates.push(cid); srWrite({ mates: st.mates }); }
_srSys('「' + name + '」进了频道');
_srPush(cid, _invPick('in'), 'say');
renderSleepRoom();
} else if (r < 0.80) {
_srPush(cid, _invPick('wait'), 'say');
renderSleepRoom();
setTimeout(function () {
var st2 = srRead();
if (st2.mates.indexOf(cid) >= 0) return;
if (!_srMateOf(cid)) return;
st2.mates.push(cid); srWrite({ mates: st2.mates });
_srSys('「' + name + '」悄悄进了频道');
_srPush(cid, _invPick('in'), 'say');
renderSleepRoom();
}, 15000 + Math.random() * 30000);
} else {
_srPush(cid, _invPick('no'), 'say');
_srSys('「' + name + '」今晚不来了');
renderSleepRoom();
}
}, 1200 + Math.random() * 2200);
}
function srSendAway(cid) {
var st = srRead();
var i = st.mates.indexOf(cid);
if (i < 0) return;
st.mates.splice(i, 1);
srWrite({ mates: st.mates });
_srSys('你把「' + _srMateName(cid) + '」送回了房间');
_srPush(cid, _invPick('bye'), 'say');
renderSleepRoom();
}
var SR_WH_PITCH = 0;
var SR_WH_VOL = 0.7;
function _srWhSynth(text, timbre) {
var t2 = String(text || '').replace(/([。！？])/g, '$1\n');
var s = srRead();
return mmSynth(t2, timbre, '', s.whSpd, SR_WH_PITCH, SR_WH_VOL, { persist: true });
}
var SR_WH_PRESETS = [
{ id: 'coax', name: '温柔哄睡', ask: '写一段温柔的哄睡话，像哄最爱的人睡觉，语速很慢。',
longs: ['睡吧……今天辛苦了。把手机放远一点，闭上眼睛。我在呢，哪儿也不去。呼吸放慢一点……对，就是这样。肩膀松下来，眉头也松开。今天所有的热闹，都留在今天了。明天醒来，会有新的太阳，还有我。晚安，做个好梦……我会一直在这里，陪着你睡着。',
'别刷手机了……把它交给我。你听，外面的世界都安静下来了，只剩下我的声音。想到什么都可以，不用抓住那些念头，让它们像云一样飘过去。你今天已经做得很好了，真的。剩下的交给夜晚。……睡吧，我守着你。'],
shorts: ['睡吧，我在。', '今晚有我守着你。', '眼睛闭上，交给我。', '别想了，明天再说。', '我陪你，慢慢睡。', '辛苦了，睡个好觉。'] },
{ id: 'story', name: '睡前小故事', ask: '写一段极短的睡前故事，声音很轻，结尾把人送睡着。',
longs: ['从前有一只小熊，每天晚上都会爬上山顶，看月亮升起来。月亮说：小熊，你又来啦。小熊说：嗯，我今天走了很远的路，累坏了。月亮就把最软的一缕光盖在它身上，像一床薄薄的被子。小熊打了个哈欠……山下的风轻轻的，虫鸣轻轻的，它就这样睡着了。你也是，盖好被子，睡吧。',
'云朵工厂每天晚上打烊以后，有一朵小云会留下来值班。它的任务，是给睡不着的人下一场最细最细的雨，沙沙、沙沙，像有人在很远的地方翻书。听着听着，值班的小云也会打瞌睡……今晚它飘到你窗外了。闭上眼睛，它开始下雨了。'],
shorts: ['故事讲完了，睡吧。', '小云在你窗外守夜呢。', '晚安，梦里见。', '盖好被子，明天接着讲。', '月亮把光调暗了。'] },
{ id: 'sheep', name: '数羊引导', ask: '写一段数羊引导，越数越慢、越数越含糊，最后数不下去睡着。',
longs: ['来，我们一起数羊。一只羊跳过去了……两只……第三只走得慢一点，没关系。第四只踩到了云，软软的。第五只……你已经不太数得清了，对吧？那就对了。数不清就不用数了，让它们自己跳。我在旁边看着呢，一只都不会跑丢。……睡吧。'],
shorts: ['第七只羊跳过去了。', '羊都数困了吧。', '数不清也没关系。', '让羊自己跳，你只管睡。'] },
{ id: 'praise', name: '夸夸今天', ask: '写一段夸奖，肯定今天所有的努力，然后温柔地把人送去睡觉。',
longs: ['今天你也辛苦了。那些做不完的事、说不出口的话，我都看在眼里。你已经很努力了，真的，比你自己以为的还要好。现在，把今天的自己轻轻放下吧。做得好的部分，留着；没做好的，明天再说。……你值得好好睡一觉。晚安，我最喜欢你。'],
shorts: ['你今天做得很好。', '我最喜欢你了。', '剩下的明天再说。', '你值得睡个好觉。'] },
{ id: 'murmur', name: '耳边碎碎念', ask: '写一段贴着耳朵的碎碎念，想到哪说到哪，越来越轻。',
longs: ['……睡着了吗？还没有啊。那我再讲两句，你不用回我。今晚的空气很好，被子也很暖。我数过了，你的睫毛在灯光下面，长长的。……好了，不逗你了。睡吧，呼吸慢一点，再慢一点。我就在这里，声音放得很低很低，像现在这样，一直陪着你。'],
shorts: ['……睡了吗？', '我在，小声点。', '睫毛都打架了吧。', '不说话了，你睡。', '晚安，明天见。'] },
{ id: 'breathe', name: '呼吸引导', ask: '写一段呼吸引导，带着数拍子，一段比一段慢。',
longs: ['跟我一起呼吸。吸气……一、二、三……呼气……一、二、三、四。再来一次，吸气……肩膀不要用力……呼气，把今天的力气都放掉。很好。……第三次，吸气的时候想想让你舒服的地方，呼气的时候什么都不想。你只剩呼吸了，其他都有我。……睡吧。'],
shorts: ['吸气……呼气……', '肩膀，松开。', '跟我一起呼吸。', '只剩呼吸了。'] }
];
var _wh = { open: false, cid: '', pid: 'coax', kind: 'long', prompt: '', custom: '', busy: false, text: '', url: '', err: '' };
function _srWhLib() {
if (!Array.isArray(data.srWhispers)) data.srWhispers = [];
return data.srWhispers;
}
function _srContacts() {
return (data.contacts || []).filter(function (c) { return c && c.kind !== 'group'; });
}
function _srMateOf(cid) {
return (data.contacts || []).find(function (c) { return c && c.id === cid; }) || null;
}
function _srTimbreOf(cid) {
var c = _srMateOf(cid);
return (c && c.mmTimbre) ? String(c.mmTimbre).trim() : '';
}
function _srMateName(cid) {
var c = _srMateOf(cid);
try { if (c && typeof chatNameOf === 'function') return chatNameOf(c) || (c && c.name) || 'TA'; } catch (e) {}
return (c && c.name) || 'TA';
}
function _srInvited() {
var s = srRead();
var withVoice = s.mates.filter(function (cid) { return _srTimbreOf(cid); });
if (withVoice.length) return withVoice;
return _srContacts().filter(function (c) { return c.mmTimbre; }).map(function (c) { return c.id; });
}
function _srAiReady(cid) {
try {
var b = bxCfg();
if (!b.on) return false;
var a = bxApiFor(cid);
return !!(a && a.model && a.key);
} catch (e) { return false; }
}
async function _srAiWrite(cid, kind, prompt) {
var a = bxApiFor(cid);
var sys = '你正在给一位最亲近的人说助眠轻语（哄睡电台）。直接输出轻语正文：不要解释、不要引号、不要旁白和舞台提示。'
+ '语气极轻、极软，句子短，多用停顿，像贴着耳朵说话。'
+ (kind === 'long' ? '长度约一百到一百五十字，是一段缓缓的睡前话。' : '就一句，十五字以内。');
var persona = '';
try { persona = (bxMate(cid) && bxMate(cid).persona) || ''; } catch (e) {}
if (persona) sys += '你说话要带着这个人设：' + persona;
var body = {
model: a.model,
messages: [
{ role: 'system', content: sys },
{ role: 'user', content: prompt || '随便说点什么，哄我睡觉。' }
],
temperature: 0.9,
max_tokens: kind === 'long' ? 600 : 120,
stream: false
};
var urls = _bxChatURLs(a);
var lastErr = null;
for (var i = 0; i < urls.length; i++) {
try {
var j = await _bxFetchJSON(urls[i], body, { api: a });
var c = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
var t = String(c || '').replace(/^["'「」\s]+|["'「」\s]+$/g, '').trim();
if (t) return t;
lastErr = new Error('AI 没写出可用的轻语');
} catch (e) { lastErr = e; }
}
throw lastErr || new Error('AI 没写出可用的轻语');
}
function _srWhRecord(cid, kind, text, src, use) {
text = String(text || '').trim();
if (!text) return null;
var lib = _srWhLib();
var hit = null, hitAt = -1;
for (var i = 0; i < lib.length; i++) if (lib[i] && lib[i].cid === cid && lib[i].text === text) { hit = lib[i]; hitAt = i; break; }
if (hit) {
hit.at = Date.now();
hit.kind = kind === 'short' ? 'short' : 'long';
hit.src = src || hit.src || 'manual';
if (use) { hit.n = Math.min(9999, (Number(hit.n) || 1) + 1); hit.lastAt = Date.now(); }
if (hitAt >= 0) lib.splice(hitAt, 1);
lib.unshift(hit);
} else {
hit = {
id: 'w' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
cid: cid || '', kind: kind === 'short' ? 'short' : 'long',
text: text.slice(0, 500), at: Date.now(), src: src || 'manual',
off: false, n: 1, lastAt: Date.now()
};
lib.unshift(hit);
if (lib.length > 300) lib.length = 300;
}
try { if (typeof flushSave === 'function') flushSave(); } catch (e) {}
return hit;
}
function _srWhUse(id) {
var w = _srWhLib().find(function (x) { return x.id === id; });
if (!w) return;
w.n = Math.min(9999, (Number(w.n) || 1) + 1);
w.lastAt = Date.now();
try { if (typeof flushSave === 'function') flushSave(); } catch (e) {}
}
function _srWhOn(id) {
var w = _srWhLib().find(function (x) { return x.id === id; });
return !!(w && !w.off);
}
function _srLibPick(cid, kind) {
var lib = _srWhLib().filter(function (w) { return w && w.text && !w.off; });
var pool = lib.filter(function (w) { return w.cid === cid && (!kind || w.kind === kind); });
if (!pool.length) pool = lib.filter(function (w) { return w.cid === cid; });
if (!pool.length) pool = lib.filter(function (w) { return !kind || w.kind === kind; });
if (!pool.length) return null;
return pool[Math.random() * pool.length | 0];
}
function _srPoolPick(kind, pid) {
var p = null;
if (pid) for (var i = 0; i < SR_WH_PRESETS.length; i++) if (SR_WH_PRESETS[i].id === pid) p = SR_WH_PRESETS[i];
if (!p) p = SR_WH_PRESETS[Math.random() * SR_WH_PRESETS.length | 0];
var arr = kind === 'long' ? p.longs : p.shorts;
return arr[Math.random() * arr.length | 0];
}
function _srWhStopSrc() {
if (whSrc) { try { whSrc.stop(); } catch (e) {} try { whSrc.disconnect(); } catch (e) {} whSrc = null; }
_srAirOff();
}
function _srWhQueue(mkUrl) {
if (whQ.length >= 2) {
_srSys('上一句还在念，这句先不排了');
renderSleepRoom();
return;
}
whQ.push(mkUrl);
_srWhPump();
}
function _srWhPump() {
if (whBusy || !whQ.length) return;
whBusy = true;
var f = whQ.shift();
Promise.resolve().then(f).then(function (u) { return _srWhPlayUrl(u); })
.catch(function (e) { showToast((e && e.message) || '没念出来'); })
.then(function () { whBusy = false; _srWhPump(); if (!whBusy && !whQ.length) _srDuck(false); });
}
function _srWhPlayUrl(url) {
ensureAC();
_srWhStopSrc();
return fetch(url).then(function (r) { return r.arrayBuffer(); })
.then(function (b) { return AC.decodeAudioData(b); })
.then(function (buf) {
var t = AC.currentTime;
_srDuck(true);
var g = gn(AC, 0.0001);
g.connect(whBus);
var s = AC.createBufferSource(); s.buffer = buf; s.connect(g);
var dur = buf.duration || 0;
try {
g.gain.setValueAtTime(0.0001, t);
g.gain.linearRampToValueAtTime(1, t + Math.min(0.35, Math.max(0.05, dur / 4)));
if (dur > 1.2) {
g.gain.setValueAtTime(1, t + dur - 0.5);
g.gain.linearRampToValueAtTime(0.0001, t + dur);
}
} catch (e) {}
_srAirFollow(t, dur);
s.start(t); s.stop(t + dur + 0.08);
s.onended = function () { try { g.disconnect(); } catch (e2) {} };
whSrc = s;
return new Promise(function (res) { s.onended = function () { try { g.disconnect(); } catch (e3) {} res(); }; });
});
}
function _srWhDownload(url, name) {
var a = document.createElement('a');
a.href = url; a.download = (name || '轻语') + '.mp3';
document.body.appendChild(a); a.click(); a.remove();
}
async function srWhSpeak(mates, kind, auto, reqText, want) {
mates = (mates || []).filter(function (m2) { return _srTimbreOf(m2); });
if (!mates.length) {
_srSys('还没有会说话的哄睡人——在 设置 → AI 给 TA 绑上 MiniMax 音色，再请进频道');
renderSleepRoom();
return false;
}
var cid = mates[Math.random() * mates.length | 0];
var timbre = _srTimbreOf(cid);
var s = srRead();
var text = '';
var reused = '';
if (want && want.libId) {
var lw = _srWhLib().find(function (x) { return x.id === want.libId; });
if (lw && !lw.off) { text = lw.text; reused = lw.id; }
} else if (want && want.raw) {
text = want.raw;
} else if (want && want.pid) {
text = _srPoolPick(kind, want.pid);
}
if (!text && reqText && _srAiReady(cid)) {
try { text = await _srAiWrite(cid, kind, reqText); } catch (e) { text = ''; }
}
if (!text && auto && !reqText && !want && Math.random() * 100 < s.whReuse) {
var lr = _srLibPick(cid, kind);
if (lr) { text = lr.text; reused = lr.id; }
}
if (!text) {
var w = _srLibPick(cid, kind);
text = w ? w.text : _srPoolPick(kind);
if (w) reused = w.id;
}
try {
var url = await _srWhSynth(text, timbre);
if (whNetDown) _whNetResume(false);
if (auto) whCount++;
if (reused) _srWhUse(reused);
_srWhRecord(cid, kind, text, auto ? 'auto' : (want && want.pid ? 'demand' : (reqText ? 'ai' : 'demand')), false);
_srPush(cid, text, 'wh');
_srWhQueue(function () { return Promise.resolve(url); });
renderSleepRoom();
return true;
} catch (e) {
if (auto && e && e.net) _whNetPause();
else _srSys('轻语没念出来：' + ((e && e.message) || '合成失败'));
renderSleepRoom();
return false;
}
}
function _whNetPause() {
if (!whNetDown) {
whPauseK = whNextK === 'long' ? 'long' : 'short';
whNetDown = true;
_srSys('连不上 MiniMax，自动轻语先停下了；网络回来自会接着念');
renderSleepRoom();
}
whStop();
}
function _whNetResume(say) {
if (!whNetDown) return;
if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
whNetDown = false;
var k = whPauseK === 'long' ? 'long' : 'short';
whPauseK = '';
if (!playing) return;
whNext(k, 6000 + Math.random() * 18000);
if (say) { _srSys('网络回来了，轻语接着念'); renderSleepRoom(); }
}
function whNext(kind, ms) {
clearTimeout(whT);
whNextK = kind;
whT = setTimeout(whFire, ms);
}
function whStartSession() {
clearTimeout(whT); whT = null;
whCount = 0;
if (typeof navigator === 'undefined' || navigator.onLine !== false) { whNetDown = false; whPauseK = ''; }
var m = srRead().whMode;
if (m === 'long') whNext('long', 18000 + Math.random() * 40000);
else if (m === 'short') whNext('short', 40000 + Math.random() * 80000);
else whNext('long', 18000 + Math.random() * 40000);
}
function whStop() { clearTimeout(whT); whT = null; whNextK = ''; }
function whFire() {
if (!playing) return;
var s = srRead();
if (s.whAway && _awayAt && Date.now() - _awayAt > 90000) { whNext('short', 25000); return; }
var mates = _srInvited();
if (!mates.length) { whNext('short', 60000); return; }
if (whNextK === 'long') {
srWhSpeak(mates, 'long', true);
if (s.whMode === 'rand') whNext('short', 60000 + Math.random() * 90000);
} else {
if (whCount >= s.whCap) { _srSys('今晚的自动轻语到上限了'); return; }
if (Math.random() * 100 >= s.whProb) { whNext('short', 45000 + Math.random() * 80000); return; }
srWhSpeak(mates, 'short', true);
whNext('short', 50000 + Math.random() * 100000);
}
}
var SR_DM_TR_SEC = 120;
function _srDemandSound(id) {
var sd = _srSoundOf(id);
if (!sd) { showToast('这件声音不在了'); return; }
ensureAC();
if (!playing) { playing = true; _srSys('开播了，晚安'); whStartSession(); if (srRead().mode === 'live') _srMusicStart(); }
if (live.has(sd.id)) dropLayer(sd.id, '');
var who = (_dm.cid && _srMateOf(_dm.cid)) ? _dm.cid : '';
addLayer(sd, sd.grp === 'tr' ? SR_DM_TR_SEC : 0, 'demand', { who: who });
if (srRead().auto) schedule();
renderSleepRoom();
}
function _srDemandMusic(tid) {
var t = _srTrackById(tid);
if (!t || !_srPlayable(t)) { showToast('这首歌暂时放不出来'); return; }
var who = (_dm.cid && _srMateOf(_dm.cid)) ? _dm.cid : '';
_srMusicPlay(t, who, false);
}
function _srDemandMusicRandom() {
var pool = _dmMusicTracks();
if (!pool.length) { showToast('播放器曲库里还没有能放的歌'); return; }
_srDemandMusic(pool[Math.random() * pool.length | 0].id);
}
function srDemand(item) {
if (item.type === 'snd') { _srDemandSound(item.id); return; }
if (item.type === 'music') { _srDemandMusic(item.id); return; }
if (item.type === 'bgmrand') { _srDemandMusicRandom(); return; }
if (item.type === 'ask') {
var q = String(item.text || '').trim();
if (!q) { showToast('先写一句想听什么'); return; }
_srPush('me', '点播了「' + (q.length > 26 ? q.slice(0, 26) + '…' : q) + '」', 'say');
renderSleepRoom();
var matesQ = _srInvited();
if (!matesQ.length) {
_srSys('频道里还没有会说话的 TA——点顶上「助眠频道」请一位进来');
renderSleepRoom();
return;
}
var cidQ = (item.cid && matesQ.indexOf(item.cid) >= 0) ? item.cid
: ((_dm.cid && matesQ.indexOf(_dm.cid) >= 0) ? _dm.cid : matesQ[Math.random() * matesQ.length | 0]);
if (_srAiReady(cidQ)) srWhSpeak([cidQ], _dm.kind, false, q);
else srWhSpeak([cidQ], _dm.kind, false, '', { raw: q });
return;
}
var label = item.type === 'lib' ? '轻语记录里的一条' : _dmPresetName(item.pid);
_srPush('me', '点播了「' + label + '」', 'say');
renderSleepRoom();
var mates = _srInvited();
if (!mates.length) {
_srSys('频道里还没有会说话的 TA——点顶上「助眠频道」请一位进来');
renderSleepRoom();
return;
}
var cid = (_dm.cid && mates.indexOf(_dm.cid) >= 0) ? _dm.cid : mates[Math.random() * mates.length | 0];
srWhSpeak([cid], _dm.kind, false, '', { pid: item.pid, libId: item.id });
}
var _dm = { open: false, cid: '', kind: 'long', tab: 'wh', ask: '' };
var SR_DM_TABS = [['wh', '轻语'], ['bg', '背景音'], ['tr', '触发音'], ['music', '背景音乐']];
var SR_DM_TIPS = { coax: '像哄最爱的人那样哄睡', story: '一段极短的睡前故事', sheep: '越数越慢的数羊', praise: '夸完今天再送睡', murmur: '贴着耳朵的碎碎念', breathe: '跟着拍子一呼一吸' };
function _dmPresetName(pid) {
for (var i = 0; i < SR_WH_PRESETS.length; i++) if (SR_WH_PRESETS[i].id === pid) return SR_WH_PRESETS[i].name;
return pid || '轻语';
}
function _dmMusicTracks() {
var all = (data.player && Array.isArray(data.player.tracks)) ? data.player.tracks : [];
var ok = all.filter(_srPlayable);
var pure = ok.filter(_srPureOf);
return pure.length ? pure : ok;
}
function srDmOpen() {
_dm.open = true;
if (!_dm.cid) { var m = _srInvited(); _dm.cid = m.length ? m[0] : ''; }
srDmPaint();
var mk = document.getElementById('srDmMask');
if (mk) mk.hidden = false;
}
function srDmClose() { _dm.open = false; var mk = document.getElementById('srDmMask'); if (mk) mk.hidden = true; }
function srDmPaint() {
var el = document.getElementById('srDmBody');
if (!el) return;
var mates = _srInvited();
var h = '';
h += '<p class="srp-dm-tip">四类都能点：轻语要花一次语音额度；背景音、触发音、背景音乐都是现场放，不花额度。</p>';
h += '<div class="srp-dm-lab">说给谁</div>';
if (mates.length) {
h += '<div class="contact-chip-row">' + mates.map(function (cid) {
return '<button type="button" class="contact-chip' + (_dm.cid === cid ? ' active' : '') + '" data-sr-dm-cid="' + _esc(cid) + '">'
+ _esc(_srMateName(cid)) + '</button>';
}).join('') + '</div>';
} else {
h += '<div class="srp-dm-none">频道里还没有 TA——点顶上「助眠频道」请一位进来（轻语要先去 设置 → AI 绑一个音色）。</div>';
}
h += '<div class="fchips" style="padding:0 0 4px">'
+ SR_DM_TABS.map(function (tb) {
return '<button type="button" class="scope-chip' + (_dm.tab === tb[0] ? ' on' : '') + '" data-sr-dm-tab="' + tb[0] + '">' + tb[1] + '</button>';
}).join('') + '</div>';
if (_dm.tab === 'wh') {
var dmAi = !!(_dm.cid && _srAiReady(_dm.cid));
h += '<div class="srp-dm-lab">想听什么<small>写一句要求，TA 按这个说；没接 AI 就直接照这句念</small></div>';
h += '<textarea class="sr-wh-ta sr-dm-ask" id="srDmAsk" placeholder="例如：说说今天下雨的声音，哄我睡">' + _esc(_dm.ask) + '</textarea>';
h += '<div class="sr-wh-acts"><button type="button" class="sr-wh-gen" data-sr-dm-askgo="1">'
+ (dmAi ? '让 TA 按这个说<small>AI 写一句 + 一次语音额度</small>' : '照这句念<small>没接 AI，只能把这句话直接念出来</small>')
+ '</button></div>';
if (!dmAi) h += '<div class="srp-dm-none">接好 AI（设置 → AI 接口）之后，这里写的要求才会变成 TA 自己的话。</div>';
h += '<div class="srp-dm-lab">这一句多长</div>';
h += '<div class="fchips" style="padding:0 0 4px">'
+ [['long', '长轻语（一百来字）'], ['short', '短轻语（一句话）']].map(function (pk) {
return '<button type="button" class="scope-chip' + (_dm.kind === pk[0] ? ' on' : '') + '" data-sr-dm-kind="' + pk[0] + '">' + pk[1] + '</button>';
}).join('') + '</div>';
h += '<div class="srp-dm-lab">出厂那几味<small>同一味多点几次，念的词也不一定一样</small></div>';
h += SR_WH_PRESETS.map(function (pp) {
return '<button type="button" class="srp-dm-row" data-sr-dm-pid="' + pp.id + '">'
+ '<span class="srp-dm-row-tx"><b>' + _esc(pp.name) + '</b><small>' + _esc(SR_DM_TIPS[pp.id] || '') + '</small></span>'
+ '<span class="srp-dm-go">花一次语音额度 ▸</span></button>';
}).join('');
var lib = _srWhLib().filter(function (w) { return w && w.text && !w.off; });
h += '<div class="srp-dm-lab">轻语记录<small>' + lib.length + ' 条可重复调用 · 在顶上【轻语记录】里管理</small></div>';
if (lib.length) {
h += lib.map(function (w) {
return '<button type="button" class="srp-dm-row" data-sr-dm-lib="' + _esc(w.id) + '">'
+ '<span class="srp-dm-row-tx"><b>' + _esc(_srMateName(w.cid)) + ' · ' + (w.kind === 'long' ? '长' : '短') + '</b>'
+ '<small>' + _esc(w.text.length > 40 ? w.text.slice(0, 40) + '…' : w.text) + '</small></span>'
+ '<span class="srp-dm-go">念这条 ▸</span></button>';
}).join('');
} else {
h += '<div class="srp-dm-none">记录还空着——TA 自己说的、你点播的都会自动收进去。</div>';
}
} else if (_dm.tab === 'bg') {
h += '<p class="srp-dm-tip">点一件＝由 TA 把它换上来，一直响着；再点别件就换掉。不花额度。</p>';
h += '<div class="srp-lib-grid">' + SR_SOUNDS.filter(function (sd) { return sd.grp === 'bg'; }).map(function (sd) {
var on = live.has(sd.id);
return '<button type="button" class="srp-lib-chip' + (on ? ' on' : '') + '" data-sr-dm-snd="' + sd.id + '" title="' + _esc(sd.tip) + '">'
+ '<b>' + _esc(sd.name) + '</b>' + (on ? '<i>♪</i>' : '') + '</button>';
}).join('') + '</div>';
var hbL = live.get('heart');
var ins = srRead().mates.filter(function (cid) { return _srMateOf(cid); });
h += '<div class="srp-dm-lab">贴着 TA 听心跳<small>同一时间只贴一颗；导播不会把它收走</small></div>';
h += ins.length ? ins.map(function (cid) {
var on = hbL && hbL.hbBy === cid;
return '<button type="button" class="srp-dm-row" data-sr-hb="' + _esc(cid) + '">'
+ '<span class="srp-dm-row-tx"><b>' + _esc(_srMateName(cid)) + '</b><small>' + (on ? '正贴着这一颗' : '耳边一记一记，稳稳的') + '</small></span>'
+ '<span class="srp-dm-go">' + (on ? '挪开 ▸' : '把耳朵贴过来 ▸') + '</span></button>';
}).join('') : '<div class="srp-dm-none">频道里还没有人——先请一位进来。</div>';
} else if (_dm.tab === 'tr') {
h += '<p class="srp-dm-tip">点一件＝TA 拿出来现场演一遍，响两分钟自己收。不花额度。</p>';
h += '<div class="srp-lib-grid">' + SR_SOUNDS.filter(function (sd) { return sd.grp === 'tr'; }).map(function (sd) {
var on = live.has(sd.id);
return '<button type="button" class="srp-lib-chip' + (on ? ' on' : '') + '" data-sr-dm-snd="' + sd.id + '" title="' + _esc(sd.tip) + '">'
+ '<b>' + _esc(sd.name) + '</b>' + (on ? '<i>♪</i>' : '') + '</button>';
}).join('') + '</div>';
} else {
var trs = _dmMusicTracks();
h += '<p class="srp-dm-tip">点一首＝TA 现在就放这一首；不碰播放器自己的播放记录，也不花额度。</p>';
h += '<div class="srp-dm-lab">背景音乐<small>' + (trs.length
? ('曲库里能放 ' + trs.length + ' 首，这里列前 ' + Math.min(12, trs.length) + ' 首')
: '播放器曲库里还没有能放的歌') + '</small></div>';
if (trs.length) {
h += '<button type="button" class="srp-dm-row" data-sr-dm-bgmrand="1">'
+ '<span class="srp-dm-row-tx"><b>随机来一首</b><small>从能放的曲子里掷一首</small></span>'
+ '<span class="srp-dm-go">放这首 ▸</span></button>';
h += trs.slice(0, 12).map(function (t) {
return '<button type="button" class="srp-dm-row" data-sr-dm-music="' + _esc(t.id) + '">'
+ '<span class="srp-dm-row-tx"><b>' + _esc(t.name || '未命名') + '</b><small>'
+ _esc((t.artist || '未知歌手') + (_srPureOf(t) ? ' · 纯音乐' : ' · 曲目')) + '</small></span>'
+ '<span class="srp-dm-go">放这首 ▸</span></button>';
}).join('');
} else {
h += '<div class="srp-dm-none">播放器曲库还空着——先去「播放器 → 曲库」收几首，或让 TA 推一首。</div>';
}
}
el.innerHTML = h;
}
function srWhOpen() { _wh.open = true; if (!_wh.cid) { var c = _srContacts().find(function (x) { return x.mmTimbre; }); _wh.cid = c ? c.id : ''; } srWhPaint(); }
function srWhClose() { _wh.open = false; var m = document.getElementById('srWhMask'); if (m) m.hidden = true; }
function _whTarget() { return _srMateOf(_wh.cid); }
function _whAsk() {
var p = String(_wh.prompt || '').trim();
if (p) return p;
for (var i = 0; i < SR_WH_PRESETS.length; i++) if (SR_WH_PRESETS[i].id === _wh.pid) return SR_WH_PRESETS[i].ask;
return '';
}
async function srWhGen(useAi) {
if (_wh.busy) return;
var c = _whTarget();
if (!c) { showToast('先选一位 TA'); return; }
var timbre = _srTimbreOf(c.id);
if (!timbre) {
var alt = null;
_srContacts().forEach(function (x) { if (!alt && _srTimbreOf(x.id)) alt = x; });
if (alt) {
_wh.cid = alt.id; c = alt; timbre = _srTimbreOf(alt.id);
showToast('「' + _srMateName(c.id) + '」没绑音色，先用「' + _srMateName(alt.id) + '」的念（绑定：设置 → AI）');
} else { showToast('还没有 TA 绑 MiniMax 音色——去 设置 → AI 给 TA 挑一个'); return; }
}
if (useAi && !_srAiReady(c.id)) { showToast('AI 没接好（设置 → AI → AI 接口）'); return; }
if (useAi && !_whAsk()) { showToast('先在上面写一句要求，或点一个方向'); return; }
if (!useAi && !_wh.custom.trim()) { showToast('先把文案写进下面的框'); return; }
_wh.busy = true; _wh.err = ''; _wh.text = ''; _wh.url = '';
srWhPaint();
try {
var text;
if (useAi) {
text = await _srAiWrite(c.id, _wh.kind, _whAsk());
} else {
text = _wh.custom.trim();
}
_wh.text = text;
srWhPaint();
_wh.url = await _srWhSynth(text, timbre);
_srWhRecord(c.id, _wh.kind, text, useAi ? 'ai' : 'manual', false);
} catch (e) {
_wh.err = (e && e.message) || '生成失败';
}
_wh.busy = false;
srWhPaint();
}
function srWhSave() {
if (!_wh.text) return;
var c = _whTarget();
var existed = _srWhLib().some(function (x) { return x.cid === (c ? c.id : '') && x.text === _wh.text; });
_srWhRecord(c ? c.id : '', _wh.kind, _wh.text, 'manual', false);
if (!existed) _srSys('一条轻语存进了记录');
showToast(existed ? '这条已经在轻语记录里了' : '存进轻语记录了');
srWhPaint(); renderSleepRoom();
}
function srWhPaint() {
var mask = document.getElementById('srWhMask');
var sheet = document.getElementById('srWhSheet');
if (!mask || !sheet) return;
if (!_wh.open) { mask.hidden = true; return; }
mask.hidden = false;
var h = '';
h += '<div class="sr-wh-bar">'
+ '<button type="button" class="srp-back" data-wh-act="close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>返回</button>'
+ '<span class="sr-wh-bar-t">轻语</span></div>';
h += '<div class="fs-sheet-body sr-wh-body">';
var cons = _srContacts();
h += '<div class="sr-wh-lab">说给谁听<small>轻语用这位绑好的 MiniMax 音色念</small></div>';
h += '<div class="contact-chip-row">' + (cons.length ? cons.map(function (c) {
var on = _wh.cid === c.id;
return '<button type="button" class="contact-chip' + (on ? ' active' : '') + '" data-wh-cid="' + _esc(c.id) + '">'
+ _esc(_srMateName(c.id)) + (c.mmTimbre ? '' : ' ·没绑音色') + '</button>';
}).join('') : '<span class="sr-none">还没有联系人</span>') + '</div>';
h += '<div class="sr-wh-lab">这一句多长</div>';
h += '<div class="fchips" style="padding:0 0 6px">'
+ [['long', '长轻语（一百来字）'], ['short', '短轻语（一句话）']].map(function (p) {
return '<button type="button" class="scope-chip' + (_wh.kind === p[0] ? ' on' : '') + '" data-wh-kind="' + p[0] + '">' + p[1] + '</button>';
}).join('') + '</div>';
h += '<div class="sr-wh-lab">想听 TA 说什么<small>写一句要求交给 AI；点上面的方向＝用那一味的默认要求</small></div>';
h += '<div class="fchips" style="padding:0 0 6px">'
+ SR_WH_PRESETS.map(function (p) {
return '<button type="button" class="scope-chip' + (_wh.pid === p.id && !_wh.prompt ? ' on' : '') + '" data-wh-pid="' + p.id + '">' + _esc(p.name) + '</button>';
}).join('')
+ '</div>';
h += '<textarea class="sr-wh-ta" id="srWhPrompt" placeholder="例如：用很轻的声音夸我今天很棒，然后哄我睡觉">' + _esc(_wh.prompt) + '</textarea>';
h += '<div class="sr-wh-lab">自己的轻语文案<small>写在这里就直接合成，不用 AI</small></div>';
h += '<textarea class="sr-wh-ta" id="srWhCustom" placeholder="例如：晚安……被子盖好，我在。">' + _esc(_wh.custom) + '</textarea>';
h += '<div class="sr-wh-acts">'
+ '<button type="button" class="sr-wh-gen" data-wh-act="gen">' + (_wh.busy ? '正在写……' : 'AI 写一句并合成<small>花一次文案额度＋一次语音额度</small>') + '</button>'
+ '<button type="button" class="sr-wh-gen ghost" data-wh-act="genraw"' + (_wh.busy ? ' disabled' : '') + '>只念下面这句<small>花一次语音额度</small></button>'
+ '</div>';
if (_wh.busy) h += '<div class="sr-wh-status">正在忙……写完自动开始合成。</div>';
if (_wh.err) h += '<div class="sr-wh-status bad">' + _esc(_wh.err) + '</div>';
if (_wh.text) {
h += '<div class="sr-wh-lab">这一句</div>';
h += '<div class="sr-wh-text">' + _esc(_wh.text) + '</div>';
if (_wh.url) {
h += '<div class="sr-wh-acts three">'
+ '<button type="button" class="sr-wh-mini" data-wh-act="play">▶ 再放一遍</button>'
+ '<button type="button" class="sr-wh-mini" data-wh-act="save">存进轻语记录</button>'
+ '<button type="button" class="sr-wh-mini" data-wh-act="dl">下载</button>'
+ '</div>';
}
}
var lib = _srWhLib();
var offN = lib.filter(function (w) { return w.off; }).length;
h += '<div class="sr-wh-lab">轻语记录<small>' + lib.length + ' 条' + (offN ? (' · 已禁用 ' + offN) : '') + ' · 全量在顶上【轻语记录】里管理</small></div>';
if (lib.length) {
h += lib.slice(0, 12).map(function (w) {
return '<div class="sr-wh-item' + (w.off ? ' off' : '') + '" data-wh-id="' + _esc(w.id) + '">'
+ '<div class="sr-wh-item-tx"><b>' + _esc(_srMateName(w.cid)) + '</b><i>' + (w.kind === 'long' ? '长' : '短') + '</i>' + (w.off ? '<i>已禁用</i>' : '')
+ '<span>' + _esc(w.text.length > 46 ? w.text.slice(0, 46) + '…' : w.text) + '</span></div>'
+ '<div class="sr-wh-item-acts">'
+ '<button type="button" class="sr-wh-mini" data-wh-play="' + _esc(w.id) + '">▶</button>'
+ '<button type="button" class="sr-wh-mini" data-wh-dl="' + _esc(w.id) + '">↓</button>'
+ '<button type="button" class="sr-wh-mini" data-wh-off="' + _esc(w.id) + '">' + (w.off ? '启' : '禁') + '</button>'
+ '<button type="button" class="sr-wh-mini" data-wh-del="' + _esc(w.id) + '">✕</button>'
+ '</div></div>';
}).join('');
} else {
h += '<div class="sr-none">记录还空着——TA 每说一句轻语都会自动收进来</div>';
}
h += '</div>';
sheet.innerHTML = h;
}
function _whPaintPrompt() {
var chips = document.querySelectorAll('#srWhSheet [data-wh-pid]');
for (var i = 0; i < chips.length; i++) {
chips[i].classList.toggle('on', chips[i].getAttribute('data-wh-pid') === _wh.pid && !_wh.prompt);
}
}
function srWhToggleLibPlay(id) {
var w = _srWhLib().find(function (x) { return x.id === id; });
if (!w) return;
var timbre = _srTimbreOf(w.cid);
if (!timbre) { showToast('这位没绑音色了，念不出来'); return; }
_srWhUse(w.id);
_srPush(w.cid, w.text, 'wh');
renderSleepRoom();
_srWhSynth(w.text, timbre).then(function (url) { _srWhQueue(function () { return Promise.resolve(url); }); })
.catch(function (e) { showToast((e && e.message) || '没念出来'); });
}
var _whLog = { open: false, tab: 'all', cid: '', sel: false, pick: {}, openId: '', busy: false, cancel: false, done: 0, total: 0 };
var SR_WH_SRC = { auto: '自动', demand: '点播', manual: '手写', ai: 'AI' };
function _whLogRecs() {
return _srWhLib().filter(function (w) {
if (!w || !w.text) return false;
if (_whLog.tab === 'on' && w.off) return false;
if (_whLog.tab === 'off' && !w.off) return false;
if (_whLog.cid && w.cid !== _whLog.cid) return false;
return true;
}).sort(function (a, b) { return (Number(b.at) || 0) - (Number(a.at) || 0); });
}
function _whLogTime(t) {
var d = new Date(Number(t) || Date.now());
return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
}
function _whLogWhoList() {
var out = [], seen = {};
_srWhLib().forEach(function (w) {
if (!w || !w.cid || seen[w.cid]) return;
seen[w.cid] = 1; out.push(w.cid);
});
return out;
}
function _whLogSelN() {
var n = 0;
Object.keys(_whLog.pick).forEach(function (id) { if (_whLog.pick[id]) n++; });
return n;
}
function _whLogFileName(w, used) {
var who = String(_srMateName(w.cid) || 'TA').replace(/[\\/:*?"<>|]/g, '_');
var d = new Date(Number(w.at) || Date.now());
var base = who + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '_' + ('0' + d.getHours()).slice(-2) + ('0' + d.getMinutes()).slice(-2);
var path = who + '/' + base + '.mp3';
if (used[path]) { used[path] += 1; path = who + '/' + base + '（' + used[path] + '）.mp3'; } else used[path] = 1;
return path;
}
function srWhLogOpen() {
_whLog.open = true; _whLog.sel = false; _whLog.pick = {}; _whLog.openId = '';
_whLog.busy = false; _whLog.cancel = false;
var m = document.getElementById('srWhLogMask');
if (m) m.hidden = false;
srWhLogPaint();
}
function srWhLogClose() {
if (_whLog.busy) _whLog.cancel = true;
_whLog.open = false;
var m = document.getElementById('srWhLogMask');
if (m) m.hidden = true;
}
function srWhLogPaint() {
if (!_whLog.open) return;
var sheet = document.getElementById('srWhLogSheet');
if (!sheet) return;
var mask = document.getElementById('srWhLogMask');
if (!mask) return;
var sc = 0, oldBody = sheet.querySelector('.sr-wh-body');
if (oldBody) sc = oldBody.scrollTop;
var all = _srWhLib();
var onN = all.filter(function (w) { return !w.off; }).length;
var offN = all.length - onN;
var recs = _whLogRecs();
var h = '';
h += '<div class="sr-wh-bar">'
+ '<button type="button" class="srp-back" data-srlg-act="close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>返回</button>'
+ '<span class="sr-wh-bar-t">轻语记录</span>'
+ '<button type="button" class="srlg-bar-b' + (_whLog.sel ? ' on' : '') + '" data-srlg-act="sel">' + (_whLog.sel ? '取消' : '批量下载') + '</button>'
+ '</div>';
h += '<div class="fs-sheet-body sr-wh-body">';
h += '<p class="srp-dm-tip">TA 每说一句轻语都会自动收在这里。禁用的不再被 TA 重复调用，但还能手动念、下载。</p>';
h += '<div class="srlg-stat">共 ' + all.length + ' 条 · 启用 ' + onN + ' 条' + (offN ? (' · 禁用 ' + offN + ' 条') : '') + '</div>';
var who = _whLogWhoList();
if (who.length > 1) {
h += '<div class="contact-chip-row">'
+ '<button type="button" class="contact-chip' + (!_whLog.cid ? ' active' : '') + '" data-srlg-cid="">全部 TA</button>'
+ who.map(function (cid) {
return '<button type="button" class="contact-chip' + (_whLog.cid === cid ? ' active' : '') + '" data-srlg-cid="' + _esc(cid) + '">' + _esc(_srMateName(cid)) + '</button>';
}).join('') + '</div>';
}
h += '<div class="fchips" style="padding:0 0 4px">'
+ [['all', '全部'], ['on', '启用'], ['off', '已禁用']].map(function (x) {
return '<button type="button" class="scope-chip' + (_whLog.tab === x[0] ? ' on' : '') + '" data-srlg-tab="' + x[0] + '">' + x[1] + '</button>';
}).join('') + '</div>';
if (!recs.length) {
h += '<div class="srlg-none">' + (all.length ? '这一档里没有记录。' : '记录还空着——开播后 TA 自己说的、你点播的都会自动收进来。') + '</div>';
} else {
h += recs.map(function (w) {
var op = _whLog.openId === w.id;
var pd = !!_whLog.pick[w.id];
return '<div class="srlg-row' + (w.off ? ' off' : '') + (pd ? ' pd' : '') + '">'
+ (_whLog.sel ? '<button type="button" class="srlg-pick' + (pd ? ' on' : '') + '" data-srlg-pick="' + _esc(w.id) + '" aria-label="选中">' + (pd ? '✓' : '') + '</button>' : '')
+ '<div class="srlg-main">'
+ '<div class="srlg-meta"><b>' + _esc(_srMateName(w.cid)) + '</b><i>' + (w.kind === 'long' ? '长' : '短') + '</i><i>' + _esc(SR_WH_SRC[w.src] || '手写') + '</i>'
+ '<em>' + _whLogTime(w.at) + (Number(w.n) > 1 ? (' · 用过 ' + w.n + ' 次') : '') + '</em></div>'
+ '<p class="srlg-tx' + (op ? ' open' : '') + '" data-srlg-open="' + _esc(w.id) + '">' + _esc(w.text) + '</p>'
+ '<div class="srlg-acts">'
+ '<button type="button" class="srlg-act" data-srlg-play="' + _esc(w.id) + '">▶ 念一遍</button>'
+ '<button type="button" class="srlg-act" data-srlg-dl="' + _esc(w.id) + '">↓ 下载</button>'
+ '<button type="button" class="srlg-act" data-srlg-off="' + _esc(w.id) + '">' + (w.off ? '恢复调用' : '禁用调用') + '</button>'
+ '<button type="button" class="srlg-act bad" data-srlg-del="' + _esc(w.id) + '">删除</button>'
+ '</div></div></div>';
}).join('');
}
h += '</div>';
if (_whLog.sel) {
var n = _whLogSelN();
h += '<div class="srlg-foot">'
+ '<button type="button" class="srlg-fbtn" data-srlg-act="all">' + (n && n === recs.length ? '清空选择' : '全选本页') + '</button>'
+ '<span>已选 ' + n + ' 条</span>'
+ '<button type="button" class="srlg-fbtn pri' + (_whLog.busy ? ' busy' : '') + '" data-srlg-act="dlsel">'
+ (_whLog.busy ? ('正在打包 ' + _whLog.done + '/' + _whLog.total + ' · 点一下取消') : ('下载所选（' + n + '）'))
+ '</button></div>';
}
sheet.innerHTML = h;
var nb = sheet.querySelector('.sr-wh-body');
if (nb) nb.scrollTop = sc;
mask.hidden = false;
}
function _srWhLogDlOne(id) {
var w = _srWhLib().find(function (x) { return x.id === id; });
if (!w) return;
var tb = _srTimbreOf(w.cid);
if (!tb) { showToast('这位没绑音色了，合成不出来'); return; }
showToast('正在合成，好了会自动下载…');
_srWhSynth(w.text, tb).then(function (u) {
_srWhUse(w.id);
_srWhDownload(u, '轻语-' + _srMateName(w.cid));
}).catch(function (e) { showToast((e && e.message) || '没合成出来'); });
}
function _srWhLogDel(id) {
var go = function () {
var lib = _srWhLib(), i;
for (i = 0; i < lib.length; i++) if (lib[i].id === id) { lib.splice(i, 1); break; }
delete _whLog.pick[id];
try { if (typeof flushSave === 'function') flushSave(); } catch (e) {}
srWhLogPaint(); renderSleepRoom();
showToast('删掉了');
};
if (typeof openModal === 'function') openModal('删掉这条轻语？', '删掉后记录里就没有了，也不会再被 TA 调用。', go, { noInput: true, okText: '删掉', danger: true });
else if (window.confirm('删掉这条轻语？')) go();
}
async function _srWhLogBatch() {
if (_whLog.busy) { _whLog.cancel = true; srWhLogPaint(); return; }
var rows = Object.keys(_whLog.pick).filter(function (id) { return _whLog.pick[id]; })
.map(function (id) { return _srWhLib().find(function (w) { return w.id === id; }); }).filter(Boolean);
if (!rows.length) { showToast('先勾几条'); return; }
_whLog.busy = true; _whLog.cancel = false; _whLog.done = 0; _whLog.total = rows.length;
srWhLogPaint();
var canZip = typeof _zipStore === 'function' && typeof _dataUrlBytes === 'function';
if (!canZip) showToast('打包件没加载，改成逐条下载');
var files = [], used = {}, okN = 0, failN = 0, tick = null;
try { if (typeof showProgress === 'function') tick = showProgress('正在合成轻语'); } catch (e) {}
var st = (typeof _dosStamp === 'function') ? _dosStamp(new Date()) : [0, 0];
for (var i = 0; i < rows.length; i++) {
if (_whLog.cancel) break;
var w = rows[i], tb = _srTimbreOf(w.cid);
if (!tb) { failN++; _whLog.done = i + 1; continue; }
try {
var u = await _srWhSynth(w.text, tb);
_srWhUse(w.id);
if (canZip) {
var bytes = _dataUrlBytes(u);
if (bytes) files.push({ name: _whLogFileName(w, used), bytes: bytes, time: st[0], date: st[1] });
else failN++;
} else {
_srWhDownload(u, '轻语-' + _srMateName(w.cid) + '-' + (i + 1));
}
okN++;
} catch (e2) { failN++; }
_whLog.done = i + 1;
if (tick) { try { tick(Math.round((i + 1) / rows.length * 90), '已合成 ' + (i + 1) + ' / ' + rows.length); } catch (e3) {} }
srWhLogPaint();
}
if (tick) { try { tick(100, '收尾'); setTimeout(function () { try { hideProgress(); } catch (e) {} }, 500); } catch (e) {} }
if (canZip && files.length) {
try {
var out = _zipStore(files);
var blob = new Blob([out], { type: 'application/zip' });
var url = URL.createObjectURL(blob);
var a = document.createElement('a');
a.href = url; a.download = '言字卡-轻语记录-' + (new Date().getMonth() + 1) + '月' + new Date().getDate() + '日.zip';
document.body.appendChild(a); a.click(); a.remove();
setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
} catch (e4) { showToast('打包失败：' + ((e4 && e4.message) || e4)); }
}
var wasCancel = _whLog.cancel;
_whLog.busy = false; _whLog.cancel = false; _whLog.pick = {}; _whLog.sel = false;
srWhLogPaint();
if (wasCancel) showToast('已取消，已经下好的 ' + okN + ' 条照常给你');
else if (!canZip) showToast('下载了 ' + okN + ' 条' + (failN ? ('，' + failN + ' 条失败') : ''));
else showToast('下载好了：' + okN + ' 条' + (failN ? ('，' + failN + ' 条没合成出来') : ''));
}
function _srTkText(m) {
var sd = m.snd || {};
var t0 = sd.t0 || Date.now();
var mm = function (sec) { return Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2); };
function hm(t) { var d = new Date(t); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
if (sd.t1) return hm(t0) + ' → ' + hm(sd.t1) + ' · 共 ' + mm(Math.max(0, Math.round((sd.t1 - t0) / 1000)));
var now = Date.now(), played = Math.max(0, Math.round((now - t0) / 1000));
if (sd.plan) return hm(t0) + ' 起 · 预计 ' + hm(sd.plan) + ' 收 · 还剩 ' + mm(Math.max(0, Math.round((sd.plan - now) / 1000)));
return hm(t0) + ' 起 · 不设时限 · 已播 ' + mm(played);
}
function _srLayerLeftText(id) {
var L = live.get(id);
if (!L) return '';
if (!L.plan) return '不设时限';
var sec = Math.max(0, Math.round((L.plan - Date.now()) / 1000));
return '还剩 ' + Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2);
}
var SR_TPL = [
{ name: '雨夜小屋', segs: [{ name: '入睡', dur: 45, bg: [['rain', 75], ['fire', 55]], tr: [['wood', 70]], music: 'taPure' }, { name: '深睡', dur: 45, bg: [['rain', 65], ['fire', 40]], tr: [], music: 'taPure' }] },
{ name: '深夜书房', segs: [{ name: '翻书', dur: 30, bg: [['white', 60]], tr: [['page', 65]], music: 'taPure' }, { name: '困了', dur: 30, bg: [['white', 45]], tr: [], music: 'taPure' }] },
{ name: '海边篝火', segs: [{ name: '听海', dur: 45, bg: [['waves', 70], ['fire', 50]], tr: [], music: 'taPure' }, { name: '火小了', dur: 45, bg: [['waves', 55], ['fire', 35]], tr: [], music: 'taPure' }] },
{ name: '空白编排', segs: [{ name: '入睡', dur: 30, bg: [['rain', 70]], tr: [], music: 'none' }] }
];
function _srId(pfx) { return pfx + Date.now().toString(36) + Math.floor(Math.random() * 1e5).toString(36); }
function _srTemplateMake(kind) {
var tpl = SR_TPL[kind] || SR_TPL[3];
var p = { id: _srId('sp'), name: tpl.name, loop: false, onEnd: 'hold', createdAt: Date.now(), updatedAt: Date.now(), segments: [] };
tpl.segs.forEach(function (x) {
p.segments.push({
id: _srId('sg'), name: x.name, durMin: x.dur,
bg: (x.bg || []).map(function (y) { return { sid: y[0], vol: y[1] }; }),
tr: (x.tr || []).map(function (y) { return { sid: y[0], vol: y[1] }; }),
music: { mode: x.music || 'none', tid: '', plId: '' },
whisper: 'follow'
});
});
return p;
}
function _srPlanNew(kind) {
var p = _srTemplateMake(kind);
if (kind === 'blank') p.name = '我的编排';
_srPlans().unshift(p);
srWrite({ planId: p.id });
_srSavePlans();
_srPlan.edit = p; _srPlan.view = 'edit';
_srPlanPaint();
}
function _srPlanDup(id) {
var p = _srPlanById(id);
if (!p) return;
var c = JSON.parse(JSON.stringify(p));
c.id = _srId('sp'); c.name = (p.name || '编排') + '（副本）'; c.createdAt = c.updatedAt = Date.now();
(c.segments || []).forEach(function (g) { g.id = _srId('sg'); });
_srPlans().unshift(c); _srSavePlans(); _srPlanPaint();
}
function _srPlanDel(id) {
var go = function () {
var l = _srPlans(), i;
for (i = 0; i < l.length; i++) if (l[i].id === id) { l.splice(i, 1); break; }
if (srRead().planId === id) srWrite({ planId: (_srPlans()[0] || {}).id || '' });
_srSavePlans(); _srPlan.view = 'list'; _srPlan.edit = null; _srPlan.seg = null; _srPlanPaint();
};
if (typeof openModal === 'function') openModal('删掉这套编排？', '删掉后它的时间段一起没了，以后可以重新建一套。', go, { noInput: true, okText: '删掉', danger: true });
else if (window.confirm('删掉这套编排？')) go();
}
function _srSetMode(m) {
m = m === 'custom' ? 'custom' : 'live';
if (srRead().mode === m) { renderSleepRoom(); return; }
if (playing) {
playing = false;
srEndsAt = 0;
clearTimeout(schedT); schedT = null;
whStop(); _srPlanStop(); _srMusicStop(); stopAll();
if (dimG && AC) { try { dimG.gain.cancelScheduledValues(AC.currentTime); dimG.gain.setValueAtTime(1, AC.currentTime); } catch (e) {} }
srWrite({ mode: m });
_srSys('切到' + (m === 'custom' ? '我的编排' : '联系人直播') + '，重新开播');
setTimeout(function () { if (!playing) goLive(); }, 350);
} else srWrite({ mode: m });
renderSleepRoom();
}
function _srPlanOpen() {
_srPlan.view = 'list'; _srPlan.edit = null; _srPlan.seg = null;
var m = document.getElementById('srPlanMask');
if (m) { m.hidden = false; _srPlanPaint(); }
}
function _srPlanClose() { var m = document.getElementById('srPlanMask'); if (m) m.hidden = true; }
function _srPlanUse(id) {
srWrite({ planId: id });
if (playing) { _srSetMode('custom'); return; }
_srSetMode('custom');
setTimeout(function () { if (!playing) goLive(); }, 80);
}
function _srPlanNameOf(p) { return (p && p.name) || '还没命名'; }
function _srPlanListHTML() {
var plans = _srPlans();
var h = '<div class="srp-lead">一段一段时间排好：每段放哪些背景音、勾哪些触发音、放什么音乐。开播后按顺序走，走完按你定的收尾。</div>';
h += '<div class="srp-sec"><div class="sr-sect">从模板新建<small>点一下复制一套，之后随便改</small></div><div class="fchips" style="padding:0 0 4px">';
SR_TPL.forEach(function (t, i) {
h += '<button type="button" class="scope-chip" data-sr-plan-new="' + i + '">' + _esc(t.name) + '</button>';
});
h += '</div></div>';
h += '<div class="srp-sec"><div class="sr-sect">我的编排<small>' + plans.length + ' 套</small></div>';
if (!plans.length) h += '<div class="sr-none">还没有编排——先套一套模板，或从「空白编排」开始。</div>';
plans.forEach(function (p) {
var n = (p.segments || []).length;
h += '<div class="sr-plan-row">'
+ '<button type="button" class="sr-plan-main" data-sr-plan-edit="' + _esc(p.id) + '">'
+ '<span class="sr-plan-nm">' + _esc(_srPlanNameOf(p)) + '<small>' + n + ' 段 · 共 ' + _srPlanTotal(p) + ' 分钟 · ' + (p.loop ? '循环开' : '循环关') + '</small></span></button>'
+ '<button type="button" class="sr-plan-go" data-sr-plan-start="' + _esc(p.id) + '">开始</button>'
+ '<button type="button" class="sr-plan-mini" data-sr-plan-dup="' + _esc(p.id) + '">复制</button>'
+ '<button type="button" class="sr-plan-mini" data-sr-plan-del="' + _esc(p.id) + '">删</button>'
+ '</div>';
});
h += '</div>';
return h;
}
function _srPlanEditHTML() {
var p = _srPlan.edit;
if (!p) return _srPlanListHTML();
var h = '<div class="srp-sec">'
+ '<div class="sr-sect">这套编排<small>名称、循环、走完怎么收</small></div>'
+ '<div class="sr-row">名称<small>最长 12 字</small></div>'
+ '<input id="srPlanNameEdit" type="text" maxlength="12" value="' + _esc(p.name || '') + '" placeholder="给这套编排起个名字">'
+ '<div class="sr-sw"><span class="sr-sw-tx"><b>循环播放<small>走完最后一段从第 1 段重来</small></b></span>'
+ '<span class="hub-tg' + (p.loop ? '' : ' off') + '" data-sr-plan-act="loop" role="switch" aria-checked="' + !!p.loop + '"></span></div>'
+ '<div class="sr-sect">走完最后一段</div><div class="fchips" style="padding:0 0 4px">'
+ [['hold', '保持最后一段'], ['stop', '自动下播']].map(function (x) {
return '<button type="button" class="scope-chip' + (p.onEnd === x[0] ? ' on' : '') + '" data-sr-plan-onend="' + x[0] + '">' + x[1] + '</button>';
}).join('')
+ '</div></div><div class="srp-sec"><div class="sr-sect">时间段<small>' + (p.segments || []).length + ' 段 · 共 ' + _srPlanTotal(p) + ' 分钟</small></div>';
(p.segments || []).forEach(function (g, i) {
h += '<div class="sr-plan-row">'
+ '<button type="button" class="sr-plan-main" data-sr-seg-edit="' + i + '">'
+ '<span class="sr-plan-nm">第 ' + (i + 1) + ' 段「' + _esc(g.name || '未命名') + '」<small>' + _srPlanRange(p, i) + ' · ' + (g.bg || []).length + ' 件底声 · ' + (g.tr || []).length + ' 件触发</small></span></button>'
+ '<button type="button" class="sr-plan-mini" data-sr-seg-move="' + i + ':-1">↑</button>'
+ '<button type="button" class="sr-plan-mini" data-sr-seg-move="' + i + ':1">↓</button>'
+ '<button type="button" class="sr-plan-mini" data-sr-seg-del="' + i + '">删</button>'
+ '</div>';
});
h += '<button type="button" class="sr-wh-mini big" data-sr-seg-add="1">＋ 添加一段</button></div>'
+ '<div class="pl-acts" style="padding:8px 0 16px"><button type="button" class="pl-btn" data-sr-plan-back="1">‹ 返回编排列表</button></div>';
return h;
}
function _srMusicTrackName(id) { var t = _srTrackById(id); return t ? (t.name + (t.artist ? ' · ' + t.artist : '')) : '（这首不在了）'; }
function _srPlaylistName(id) {
var l = (data.player && Array.isArray(data.player.playlists)) ? data.player.playlists : [];
for (var i = 0; i < l.length; i++) if (l[i] && l[i].id === id) return l[i].name || '歌单';
return '（歌单不在了）';
}
function _srSegHTML() {
var p = _srPlan.edit, g = _srPlan.seg;
if (!p || !g) return _srPlanEditHTML();
var sidOn = {};
(g.bg || []).forEach(function (x) { sidOn[x.sid] = 1; });
var trOn = {};
(g.tr || []).forEach(function (x) { sidOn[x.sid] = 1; trOn[x.sid] = 1; });
var h = '<div class="srp-sec"><div class="sr-sect">这一段<small>名称与时长</small></div>';
h += '<div class="sr-row">名称<small>最长 12 字</small></div><input id="srSegNameEdit" type="text" maxlength="12" value="' + _esc(g.name || '') + '" placeholder="这一段叫什么">';
h += '<div class="sr-row">持续<small>分钟</small></div><input id="srSegDurEdit" type="number" min="1" max="180" step="1" value="' + (Math.max(1, Number(g.durMin) || 1)) + '">';
h += '</div><div class="srp-sec"><div class="sr-sect">背景音<small>可多选，同时叠</small></div><div class="srp-lib-grid">';
SR_SOUNDS.filter(function (x) { return x.grp === 'bg'; }).forEach(function (sd) {
h += '<button type="button" class="srp-lib-chip' + (sidOn[sd.id] ? ' on' : '') + '" data-sr-seg-bg="' + _esc(sd.id) + '"><b>' + _esc(sd.name) + '</b></button>';
});
h += '</div>';
(g.bg || []).forEach(function (x) {
h += '<div class="sr-mix"><span class="sr-mix-nm">' + _esc((_srSoundOf(x.sid) || {}).name || x.sid) + '</span><input type="range" data-sr-seg-vol="bg:' + _esc(x.sid) + '" min="0" max="100" step="1" value="' + (Number(x.vol) || 70) + '"></div>';
});
h += '</div><div class="srp-sec"><div class="sr-sect">触发音<small>可多选，各按自己的节奏</small></div><div class="srp-lib-grid">';
SR_SOUNDS.filter(function (x) { return x.grp === 'tr'; }).forEach(function (sd) {
h += '<button type="button" class="srp-lib-chip' + (trOn[sd.id] ? ' on' : '') + '" data-sr-seg-tr="' + _esc(sd.id) + '"><b>' + _esc(sd.name) + '</b></button>';
});
h += '</div>';
(g.tr || []).forEach(function (x) {
h += '<div class="sr-mix"><span class="sr-mix-nm">' + _esc((_srSoundOf(x.sid) || {}).name || x.sid) + '</span><input type="range" data-sr-seg-vol="tr:' + _esc(x.sid) + '" min="0" max="100" step="1" value="' + (Number(x.vol) || 70) + '"></div>';
});
h += '</div><div class="srp-sec"><div class="sr-sect">音乐<small>本段只放一首／一副歌单</small></div><div class="fchips" style="padding:0 0 4px">'
+ [['none', '不播'], ['track', '指定一首'], ['list', '歌单随机'], ['taPure', '让 TA 挑纯音乐']].map(function (x) {
return '<button type="button" class="scope-chip' + (g.music.mode === x[0] ? ' on' : '') + '" data-sr-seg-music="' + x[0] + '">' + x[1] + '</button>';
}).join('') + '</div>';
if (g.music.mode === 'track') {
h += '<div class="sr-plan-row"><span class="sr-plan-nm">' + _esc(_srMusicTrackName(g.music.tid)) + '<small>点「换一首」从曲库挑</small></span>'
+ '<button type="button" class="sr-plan-mini" data-sr-seg-pick="track">换一首</button></div>';
} else if (g.music.mode === 'list') {
var pls = (data.player && Array.isArray(data.player.playlists)) ? data.player.playlists : [];
h += '<div class="fchips" style="padding:0 0 4px">' + (pls.length ? pls.map(function (l) {
return '<button type="button" class="scope-chip' + (g.music.plId === l.id ? ' on' : '') + '" data-sr-seg-pl="' + _esc(l.id) + '">' + _esc(l.name || '歌单') + '</button>';
}).join('') : '<span class="sr-none">播放器里还没有歌单</span>') + '</div>';
}
h += '</div><div class="srp-sec"><div class="sr-sect">轻语<small>这一段 TA 说不说</small></div><div class="fchips" style="padding:0 0 4px">'
+ [['follow', '跟随频道'], ['on', '本段一定有'], ['off', '本段不要']].map(function (x) {
return '<button type="button" class="scope-chip' + (g.whisper === x[0] ? ' on' : '') + '" data-sr-seg-wh="' + x[0] + '">' + x[1] + '</button>';
}).join('') + '</div></div>'
+ '<div class="pl-acts" style="padding:8px 0 16px"><button type="button" class="pl-btn" data-sr-seg-back="1">‹ 返回时间段</button></div>';
return h;
}
function _srPlanPaint() {
var body = document.getElementById('srPlanBody');
if (!body) return;
var title = document.getElementById('srPlanTitle');
var h = '';
var mode = _srPlan.view;
if (mode === 'edit' || mode === 'seg') {
if (title) title.firstChild.nodeValue = (_srPlan.edit ? _srPlanNameOf(_srPlan.edit) : '我的编排') + ' ';
} else if (title) title.firstChild.nodeValue = '我的编排 ';
if (mode === 'list') h = _srPlanListHTML();
else if (mode === 'edit') h = _srPlanEditHTML();
else h = _srSegHTML();
body.innerHTML = h;
}
function _srMusicOpen(target) {
_srPick.target = target; _srPick.open = true; _srPick.q = '';
var m = document.getElementById('srMusicMask');
if (m) { m.hidden = false; _srMusicPaint(); }
}
function _srMusicClose() {
_srPick.open = false;
var m = document.getElementById('srMusicMask');
if (m) m.hidden = true;
if (_srPlan.view === 'seg') _srPlanPaint();
}
function _srMusicPaint() {
var body = document.getElementById('srMusicBody');
if (!body) return;
var s = srRead(), q = String(_srPick.q || '').trim().toLowerCase();
var all = (data.player && Array.isArray(data.player.tracks)) ? data.player.tracks : [];
var list = all.filter(function (t) { return _srPlayable(t) && (!q || (((t.name || '') + ' ' + (t.artist || '')).toLowerCase().indexOf(q) >= 0)); });
var title = document.getElementById('srMusicTitle');
if (title) title.firstChild.nodeValue = (_srPick.target === 'ids' ? '挑背景音乐 ' : '选一首歌 ');
var h = '<div class="srp-lead">' + (_srPick.target === 'ids' ? '勾上的才进「只挑这几首」的随机池；不勾＝不参与。' : '点一首＝这一段固定放这一首；放完继续放它。') + '</div>';
h += '<div class="sr-rand-q"><input id="srMusicQ" type="text" placeholder="搜歌名或歌手" value="' + _esc(_srPick.q || '') + '"><button type="button" class="sr-wh-mini" data-sr-music-act="clear">清空</button></div>';
h += '<div class="srp-sec">' + (list.length ? list.map(function (t) {
var on = _srPick.target === 'ids' ? (s.bgmIds.indexOf(t.id) >= 0) : (_srPlan.seg && _srPlan.seg.music.tid === t.id);
return '<button type="button" class="sr-music-row' + (on ? ' on' : '') + '" data-sr-music-id="' + _esc(t.id) + '">'
+ '<span class="sr-music-nm">' + _esc(t.name || '未命名') + '<small>' + _esc(t.artist || (t.src === 'file' ? '本机文件' : '')) + '</small></span>'
+ '<i>' + (on ? '✓' : '') + '</i></button>';
}).join('') : '<div class="sr-none">' + (all.length ? '没有搜到' : '播放器里还没有歌') + '</div>') + '</div>';
body.innerHTML = h;
}
function _srSegAdd() {
var p = _srPlan.edit; if (!p) return;
var n = (p.segments || []).length + 1;
p.segments.push({ id: _srId('sg'), name: '第 ' + n + ' 段', durMin: 30, bg: [{ sid: 'rain', vol: 70 }], tr: [], music: { mode: 'none', tid: '', plId: '' }, whisper: 'follow' });
_srSavePlans(); _srPlanPaint();
}
function _srSegMove(i, d) {
var p = _srPlan.edit; if (!p || !p.segments) return;
var j = i + d;
if (j < 0 || j >= p.segments.length) return;
var t = p.segments[i]; p.segments[i] = p.segments[j]; p.segments[j] = t;
_srSavePlans(); _srPlanPaint();
}
function _srSegDel(i) {
var p = _srPlan.edit; if (!p || !p.segments) return;
if (p.segments.length <= 1) { showToast('至少留一段'); return; }
p.segments.splice(i, 1); _srSavePlans(); _srPlanPaint();
}
function _srPaintTop() {
var s = srRead();
var who = document.getElementById('srWho');
if (who) {
if (s.mode === 'custom' && playing && _srPlan.seg) {
who.textContent = '· 第 ' + (_srPlan.idx + 1) + ' 段「' + (_srPlan.seg.name || '') + '」' + (_srPlanLeftText() ? ' · ' + _srPlanLeftText() : '');
} else if (s.mode === 'custom') {
var p = _srPlanById(s.planId) || _srPlans()[0];
who.textContent = '· 我的编排' + (p ? '：' + _srPlanNameOf(p) : '');
} else {
who.textContent = playing ? ('· ' + live.size + ' 层在响')
: (s.mates.length ? ('· ' + s.mates.length + ' 人在频道') : '· 还没人');
}
}
var go = document.getElementById('srGoBtn');
if (go) {
go.textContent = playing ? '下 播' : '开 播';
go.classList.toggle('on', playing);
}
var dm = document.getElementById('srDmBtn'), pb = document.getElementById('srPlanBtn');
if (dm) dm.hidden = s.mode === 'custom';
if (pb) pb.hidden = s.mode !== 'custom';
var tabs = document.querySelectorAll('#srModeTabs [data-sr-mode-tab]');
for (var i = 0; i < tabs.length; i++) {
var on = tabs[i].getAttribute('data-sr-mode-tab') === s.mode;
tabs[i].classList.toggle('on', on);
tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
}
}
function _srPaintStream() {
var l = document.getElementById('srList');
if (!l) return;
if (!srMsgs.length) {
l.classList.add('is-empty');
l.innerHTML = '<div class="srp-empty"><em>SLEEP FM · 晚安电台</em><b>还没开播</b>'
+ '<span>点顶上「助眠频道」请一位 TA 进来哄睡；<br>左下角「开播」铺声音，右下角「点播一句」点具体内容。<br>TA 用了什么道具、换了什么背景音、轻语说了什么，<br>都会一条一条落在这里，每一层带自己的计时。</span></div>';
return;
}
var near = l.scrollHeight - l.scrollTop - l.clientHeight < 90;
var last = srMsgs[srMsgs.length - 1];
l.classList.remove('is-empty');
var h = '', prev = '';
for (var i = 0; i < srMsgs.length; i++) {
var m = srMsgs[i];
if (m.who === 'sys') {
h += '<div class="srp-sys">' + _esc(m.text) + '</div>';
prev = 'sys';
continue;
}
if (m.kind === 'music') {
var lab3 = m.who === 'me' ? '' : _srMateName(m.who);
var hop3 = prev !== m.who;
if (hop3 && lab3) h += '<div class="srp-nm2">' + _esc(lab3) + '<i class="i-wh"> ♪</i></div>';
h += '<div class="srp-row' + (m.who === 'me' ? ' me' : '') + (hop3 ? ' hop' : '') + '"><div class="srp-b">' + _esc(m.text)
+ '<span class="srp-mu">♪</span></div></div>';
prev = m.who;
continue;
}
if (m.kind === 'snd') {
var lab2 = m.who === 'me' ? '' : (m.who === 'sys' ? '导播' : _srMateName(m.who));
var key2 = m.who === 'sys' ? 'snd' : m.who;
var hop2 = prev !== key2;
if (hop2 && lab2) h += '<div class="srp-nm2">' + _esc(lab2) + '</div>';
h += '<div class="srp-row' + (m.who === 'me' ? ' me' : '') + (hop2 ? ' hop' : '') + '"><div class="srp-b">' + _esc(m.text)
+ '<span class="srp-tk" data-snd-t="' + _esc(m.id) + '">' + _esc(_srTkText(m)) + '</span></div></div>';
prev = key2;
continue;
}
var hop = prev !== m.who;
if (hop && m.who !== 'me') {
h += '<div class="srp-nm2">' + _esc(_srMateName(m.who)) + (m.kind === 'wh' ? '<i class="i-wh"> ♪</i>' : '') + '</div>';
}
h += '<div class="srp-row' + (m.who === 'me' ? ' me' : '') + (hop ? ' hop' : '') + '"><div class="srp-b">' + _esc(m.text)
+ (m.kind === 'wh' ? '<button type="button" class="srp-re" data-sr-replay="' + _esc(m.id) + '">▶ 放一遍</button>' : '')
+ '</div></div>';
prev = m.who;
}
l.innerHTML = h;
if (near || (last && last.who === 'me')) l.scrollTop = l.scrollHeight;
}
function _srSoundRows(grp, s) {
var rows = SR_SOUNDS.filter(function (sd) { return sd.grp === grp; });
var offN = rows.filter(function (sd) { return s.off[sd.id]; }).length;
return '<div class="sr-grp">' + (grp === 'bg' ? '背景音' : '触发音') + '<small>' + rows.length + ' 种 · 已关 ' + offN + '</small></div>'
+ '<div class="srp-lib-grid">' + rows.map(function (sd) {
var on = playing && live.has(sd.id);
var off = !!s.off[sd.id];
return '<button type="button" class="srp-lib-chip' + (on ? ' on' : '') + (off ? ' off' : '') + '" data-sr-play="' + sd.id + '" title="' + _esc(sd.tip) + '">'
+ '<b>' + _esc(sd.name) + '</b>' + (on ? '<i>♪</i>' : '') + '</button>';
}).join('') + '</div>';
}
function _srSlider(key, label, txt, min, max, step, val) {
return '<div class="sr-row">' + label + '<small>' + txt + '</small></div>'
+ '<input type="range" data-sr-set="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '">';
}
function _srSetDmMin(dmv) {
dmv = Number(dmv);
if (!isFinite(dmv) || dmv < 0) dmv = 0;
dmv = Math.min(180, Math.round(dmv));
srWrite({ dmMin: dmv });
if (playing) {
srEndsAt = dmv > 0 ? (Date.now() + dmv * 60000) : 0;
if (dimG && AC) { try { dimG.gain.cancelScheduledValues(AC.currentTime); dimG.gain.setValueAtTime(1, AC.currentTime); } catch (e) {} }
_srSys(dmv > 0 ? ('定好了：' + dmv + ' 分钟后收工') : '倒计时取消');
renderSleepRoom();
}
srSetPaint();
}
function srSetPaint() {
var body = document.getElementById('srSetBody');
if (!body) return;
var s = srRead();
var h = '';
if (_setTab === 'live') {
h += '<div class="srp-lead">开播之后人可以走——去别的页、锁屏，声音都留着。<b>「自动导播」</b>隔一阵自己叠一层——没收满就一直叠，叠满才收，你只管睡。</div>';
h += '<div class="srp-sec">';
h += '<div class="sr-live"><span class="sr-dot' + (playing ? ' on' : '') + '"></span>';
h += '<span class="sr-live-tx"><b>' + (playing ? ('直播中 · ' + live.size + ' 层在响') : '还没开播') + '</b>';
h += '<small>' + (playing ? (s.auto ? '导播开着，频道他来切' : '导播关了，声音全归你手动') : '先请哄睡人，再点开播') + '</small></span></div>';
h += '<button type="button" class="sr-go' + (playing ? ' sr-stop' : '') + '" data-sr-act="go">' + (playing ? '下 播' : '开 播') + '</button>';
h += '</div><div class="srp-sec">';
h += '<div class="sr-sect">自动导播<small>他来随机加层、收层、换台</small></div>';
h += '<div class="sr-sw"><span class="sr-sw-tx"><b>' + (s.auto ? '导播开' : '导播关') + '</b>';
h += '<small>' + (s.auto ? '开着＝频道会自己动' : '关着＝声音全归你手动') + '</small></span>';
h += '<span class="hub-tg' + (s.auto ? '' : ' off') + '" data-sr-act="auto" role="switch" aria-checked="' + s.auto + '"></span></div>';
h += _srSlider('max', '最多同时叠', s.max + ' 层', 1, 4, 1, s.max);
h += _srSlider('gap', '导播隔', s.gap + ' 秒上下动一次手', 10, 180, 5, s.gap);
h += _srSlider('dur', '随机一层播', s.dur + ' 分钟上下', 1, 10, 1, s.dur);
h += '</div><div class="srp-sec">';
h += '<div class="sr-sect">哄睡倒计时<small>到点总音量缓降两分钟后自己收工；人睡着电台自己关</small></div>';
h += '<div class="fchips" style="padding:0 0 4px">'
+ [[0, '不用'], [30, '30 分钟'], [45, '45 分钟'], [60, '60 分钟']].map(function (p) {
return '<button type="button" class="scope-chip' + (s.dmMin === p[0] ? ' on' : '') + '" data-sr-dmmin="' + p[0] + '">' + p[1] + '</button>';
}).join('') + '</div>';
h += '<div class="sr-row">自己定<small>1~180 分钟，开播中改也立刻生效</small></div>';
h += '<div class="sr-dm-custom">'
+ '<input id="srDmEdit" type="number" inputmode="numeric" min="1" max="180" step="1" placeholder="如 20" value="' + (s.dmMin > 0 ? s.dmMin : '') + '">'
+ '<button type="button" class="scope-chip" data-sr-dm-apply="1">定这个</button></div>';
h += '</div>';
} else if (_setTab === 'mix') {
h += '<div class="srp-lead">同族音量收成<b>一根杆</b>：背景音、触发音、轻语各一根，总音量再收一道；正在响的每一层在「混音台」里还有自己的杆。</div>';
h += '<div class="srp-sec">';
h += _srSlider('vol', '总音量', s.vol, 0, 100, 1, s.vol);
h += _srSlider('volBg', '背景音量', s.volBg, 0, 100, 1, s.volBg);
h += _srSlider('volTrig', '触发音音量', s.volTrig, 0, 100, 1, s.volTrig);
h += _srSlider('volWh', '轻语音量', s.volWh, 0, 100, 1, s.volWh);
h += '<div class="sr-sw"><span class="sr-sw-tx"><b>空间环绕<small>' + (s.sur ? '每一层都在慢慢转，耳朵跟着飘' : '关着＝声音各就各位') + '</small></b></span>'
+ '<span class="hub-tg' + (s.sur ? '' : ' off') + '" data-sr-act="sur" role="switch" aria-checked="' + s.sur + '"></span></div>';
h += _srSlider('reverb', '混响湿度（轻语）', s.reverb + '%', 0, 40, 5, s.reverb);
h += '</div><div class="srp-sec">';
h += '<div class="sr-sect">混音台<small>正在响的每一层一根杆，点名字收掉；名字下面是完整时间轴</small></div>';
if (playing && live.size) {
h += Array.from(live.keys()).map(function (id) {
var L = live.get(id);
return '<div class="sr-mix"><span class="sr-mix-nm" data-sr-drop="' + _esc(id) + '">' + _esc(_nameOf(id)) + ' <i>✕</i>'
+ '<small class="sr-mix-lf" data-mix-lf="' + _esc(id) + '">' + _esc(_srLayerLeftText(id)) + '</small></span>'
+ '<input type="range" data-sr-lv="' + _esc(id) + '" min="0" max="100" step="1" value="' + (L.vol || 100) + '"></div>';
}).join('');
} else {
h += '<div class="sr-none">' + (playing ? '导播在酝酿下一手…' : '还没有声音') + '</div>';
}
h += '</div>';
} else if (_setTab === 'music') {
var cur = _srMusic.id ? _srTrackById(_srMusic.id) : null;
h += '<div class="srp-lead">从播放器曲库里挑一首<strong>纯音乐</strong>垫在最底下，音量压得很低，不碰播放器自己的播放记录。</div>';
h += '<div class="srp-sec">';
h += '<div class="sr-sw"><span class="sr-sw-tx"><b>联系人挑背景音乐<small>' + (s.bgmOn ? '开着＝在场的人随机挑一首' : '关着＝助眠频道不碰播放器曲库') + '</small></b></span>'
+ '<span class="hub-tg' + (s.bgmOn ? '' : ' off') + '" data-sr-act="bgm" role="switch" aria-checked="' + !!s.bgmOn + '"></span></div>';
h += _srSlider('bgmVol', '音乐音量', s.bgmVol + ' / 60（垫底不抢雨声）', 0, 60, 1, s.bgmVol);
h += '<div class="sr-row">挑曲范围<small>纯音乐靠曲名／歌手关键词认</small></div><div class="fchips" style="padding:0 0 4px">'
+ [['pure', '只挑纯音乐'], ['all', '全部曲目'], ['ids', '只挑这几首']].map(function (x) {
return '<button type="button" class="scope-chip' + (s.bgmScope === x[0] ? ' on' : '') + '" data-sr-bgm-scope="' + x[0] + '">' + x[1] + '</button>';
}).join('') + '</div>';
h += _srSlider('bgmGap', '一首播完后', s.bgmGap ? ('隔 ' + s.bgmGap + ' 分钟再挑') : '立即换下一首', 0, 60, 1, s.bgmGap);
h += '<div class="sr-wh-acts"><button type="button" class="sr-wh-mini big" data-sr-act="bgm-pick">挑曲目<small>手动勾选要参与随机的几首</small></button>'
+ '<button type="button" class="sr-wh-mini big" data-sr-act="bgm-next">换一首<small>马上从池子里再挑一首</small></button></div>';
h += '<div class="sr-none">当前：' + (cur ? ('《' + _esc(cur.name) + '》') : (s.bgmOn ? '还没挑到' : '关着')) + '</div>';
h += '</div>';
} else if (_setTab === 'lib') {
h += '<div class="srp-lead">点一下格子＝<b>响／收</b>；<b>长按</b>＝这一件不参与导播的随机——默认全部参与，只关你不要的。每一件都是现场合成，一个音频文件都不占。</div>';
h += '<div class="srp-sec">' + _srSoundRows('bg', s) + '</div>';
h += '<div class="srp-sec">' + _srSoundRows('tr', s) + '</div>';
} else {
h += '<div class="srp-lead">轻语用 TA 绑好的 MiniMax 音色念，<b>要花语音额度</b>；说的话会落在频道里那面。出厂是「正常慢一点」那一档（0.85 倍速·正常音高·低通＋呼吸气音），嫌快就把「轻语速度」往左拖。</div>';
h += '<div class="srp-sec">';
h += '<div class="sr-sect">轻语节奏<small>TA 会自己开口的档位</small></div>';
h += '<div class="fchips" style="padding:0 0 4px">'
+ [['long', '长轻语'], ['short', '偶尔短句'], ['rand', '随机']].map(function (p) {
return '<button type="button" class="scope-chip' + (s.whMode === p[0] ? ' on' : '') + '" data-sr-mode="' + p[0] + '">' + p[1] + '</button>';
}).join('') + '</div>';
h += '<div class="sr-none">长＝开播后过一会儿来一段长的 ∶ 短＝隔一阵掷一次概率 ∶ 随机＝先一段长的，后面偶尔来短的</div>';
h += _srSlider('whProb', '自动触发概率', s.whProb + '%', 0, 100, 5, s.whProb);
h += _srSlider('whCap', '本场自动最多', s.whCap + ' 条', 0, 10, 1, s.whCap);
h += _srSlider('whReuse', '重复念旧的概率', s.whReuse + '% 的时候从【轻语记录】里翻一句', 0, 100, 5, s.whReuse);
h += _srSlider('whSpd', '轻语速度', s.whSpd.toFixed(2) + ' 倍（越低越慢）', 0.5, 1, 0.05, s.whSpd);
h += '<div class="sr-sw"><span class="sr-sw-tx"><b>人走了就先不念<small>切后台或锁屏超过 90 秒＝自动轻语先停，回来自动续（手动点播不受限）</small></b></span>'
+ '<span class="hub-tg' + (s.whAway ? '' : ' off') + '" data-sr-act="whaway" role="switch" aria-checked="' + s.whAway + '"></span></div>';
h += '</div><div class="srp-sec">';
h += '<div class="sr-sect">轻语记录<small>生成、下载、禁用与删除都在那一面</small></div>';
var lib = _srWhLib();
var offN = lib.filter(function (w) { return w.off; }).length;
var inv = _srInvited();
h += '<div class="sr-wh-acts">'
+ '<button type="button" class="sr-wh-mini big" data-sr-act="on-demand">点播一句<small>花一次语音额度</small></button>'
+ '<button type="button" class="sr-wh-mini big" data-sr-act="wh-lib">生成与控制<small>记录 ' + lib.length + ' 条' + (offN ? (' · 禁用 ' + offN) : '') + ' · 能说轻语 ' + inv.length + ' 位</small></button>'
+ '<button type="button" class="sr-wh-mini big" data-sr-act="wh-log">轻语记录<small>下载 · 禁用 · 删除</small></button>'
+ '</div>';
h += '</div>';
}
body.innerHTML = h;
}
function _srSetTabApply(name) {
_setTab = name;
var tabs = document.querySelectorAll('#srSetTabs .srp-settab');
for (var i = 0; i < tabs.length; i++) {
tabs[i].setAttribute('aria-selected', tabs[i].getAttribute('data-sr-set') === name ? 'true' : 'false');
}
srSetPaint();
}
function _srWhoPaint() {
var el = document.getElementById('srPeople');
if (!el) return;
var s = srRead();
var cons = _srContacts();
el.innerHTML = cons.length ? cons.map(function (c) {
var inCh = s.mates.indexOf(c.id) >= 0;
return '<button type="button" class="srp-p' + (inCh ? ' on' : '') + '" data-srp-person="' + _esc(c.id) + '">'
+ '<span class="srp-pn">' + _esc(_srMateName(c.id)) + (c.mmTimbre ? ' ♪' : '') + '</span>'
+ '<span class="srp-pc">' + (inCh ? '在频道 · 点一下送走' : '请 TA 进来') + '</span></button>';
}).join('') : '<div class="srp-none">还没有联系人——先到「更多 → 联系人」里建一位</div>';
}
function renderSleepRoom() {
_srPaintTop();
_srPaintStream();
var setMask = document.getElementById('srSetMask');
if (setMask && !setMask.hidden) srSetPaint();
}
setInterval(function () {
var l = document.getElementById('srList');
if (l) {
var sp = l.querySelectorAll('[data-snd-t]');
for (var i = 0; i < sp.length; i++) {
var mid = sp[i].getAttribute('data-snd-t');
for (var j = 0; j < srMsgs.length; j++) {
if (srMsgs[j].id === mid) { sp[i].textContent = _srTkText(srMsgs[j]); break; }
}
}
}
var mf = document.querySelectorAll('[data-mix-lf]');
for (var k = 0; k < mf.length; k++) {
var lid = mf[k].getAttribute('data-mix-lf');
mf[k].textContent = _srLayerLeftText(lid);
}
if (playing && srEndsAt) {
var left = srEndsAt - Date.now();
var who2 = document.getElementById('srWho');
if (who2) who2.textContent = left > 0 ? ('· ' + Math.max(0, Math.ceil(left / 60000)) + ' 分钟后收工') : '· 收工中…';
if (AC && dimG) {
try {
if (left <= 120000) dimG.gain.setTargetAtTime(Math.max(0.0001, left / 120000), AC.currentTime, 0.5);
} catch (e) {}
}
_srMusicVolApply();
if (left <= 0) {
srEndsAt = 0;
if (AC && dimG) { try { dimG.gain.cancelScheduledValues(AC.currentTime); dimG.gain.setValueAtTime(1, AC.currentTime); } catch (e) {} }
goLive();
}
}
}, 1000);
var view = document.getElementById('sleeproomView');
if (view) {
var backBtn = document.getElementById('srBack');
if (backBtn) backBtn.addEventListener('click', function () {
var bb = document.getElementById('backChatsBtn');
var to = (bb && bb.dataset.view) || 'more';
if (typeof showView === 'function') showView(to);
});
var whoBtn = document.getElementById('srWhoBtn');
if (whoBtn) whoBtn.addEventListener('click', function () {
_srWhoPaint();
var m = document.getElementById('srWhoMask');
if (m) m.hidden = false;
});
var setBtn = document.getElementById('srSetBtn');
if (setBtn) setBtn.addEventListener('click', function () {
var m = document.getElementById('srSetMask');
if (m) { m.hidden = false; srSetPaint(); }
});
var logBtn = document.getElementById('srWhLogBtn');
if (logBtn) logBtn.addEventListener('click', srWhLogOpen);
var goBtn = document.getElementById('srGoBtn');
if (goBtn) goBtn.addEventListener('click', goLive);
var dmBtn = document.getElementById('srDmBtn');
if (dmBtn) dmBtn.addEventListener('click', srDmOpen);
var planBtn = document.getElementById('srPlanBtn');
if (planBtn) planBtn.addEventListener('click', _srPlanOpen);
var _lpT = null, _lpFired = false;
view.addEventListener('pointerdown', function (e) {
var t = e.target && e.target.closest && e.target.closest('[data-sr-play]');
_lpFired = false;
if (!t) return;
var id2 = t.getAttribute('data-sr-play');
_lpT = setTimeout(function () {
_lpFired = true;
var st0 = srRead();
if (st0.off[id2]) delete st0.off[id2]; else st0.off[id2] = 1;
srWrite({ off: st0.off });
srSetPaint();
}, 550);
});
['pointerup', 'pointermove', 'pointercancel', 'pointerleave'].forEach(function (ev) {
view.addEventListener(ev, function () { if (_lpT) { clearTimeout(_lpT); _lpT = null; } });
});
view.addEventListener('click', function (e) {
var t = e.target;
if (!t || !t.closest) return;
var person = t.closest('[data-srp-person]');
if (person) {
var pid = person.getAttribute('data-srp-person');
var m0 = document.getElementById('srWhoMask');
if (m0) m0.hidden = true;
if (srRead().mates.indexOf(pid) >= 0) srSendAway(pid);
else srInvite(pid);
return;
}
if (t.closest('[data-srp-whoact="close"]')) { var m1 = document.getElementById('srWhoMask'); if (m1) m1.hidden = true; return; }
if (t.closest('[data-srp-setact="close"]')) { var m2 = document.getElementById('srSetMask'); if (m2) m2.hidden = true; return; }
if (t.closest('[data-srp-dmact="close"]')) { srDmClose(); return; }
var dmTab = t.closest('[data-sr-dm-tab]');
if (dmTab) { _dm.tab = dmTab.getAttribute('data-sr-dm-tab'); srDmPaint(); return; }
var dmSnd = t.closest('[data-sr-dm-snd]');
if (dmSnd) { var dsid = dmSnd.getAttribute('data-sr-dm-snd'); srDmClose(); srDemand({ type: 'snd', id: dsid }); return; }
var dmMusic = t.closest('[data-sr-dm-music]');
if (dmMusic) { var dtid = dmMusic.getAttribute('data-sr-dm-music'); srDmClose(); srDemand({ type: 'music', id: dtid }); return; }
if (t.closest('[data-sr-dm-bgmrand]')) { srDmClose(); srDemand({ type: 'bgmrand' }); return; }
var dmCid = t.closest('[data-sr-dm-cid]');
if (dmCid) { _dm.cid = dmCid.getAttribute('data-sr-dm-cid'); srDmPaint(); return; }
var dmKind = t.closest('[data-sr-dm-kind]');
if (dmKind) { _dm.kind = dmKind.getAttribute('data-sr-dm-kind'); srDmPaint(); return; }
if (t.closest('[data-sr-dm-askgo]')) {
var askTxt = String(_dm.ask || '').trim();
if (!askTxt) { showToast('先写一句想听什么'); return; }
var askCid = _dm.cid;
srDmClose();
srDemand({ type: 'ask', text: askTxt, cid: askCid });
return;
}
var dmRow = t.closest('[data-sr-dm-pid],[data-sr-dm-lib]');
if (dmRow) {
var item = dmRow.getAttribute('data-sr-dm-pid')
? { type: 'preset', pid: dmRow.getAttribute('data-sr-dm-pid') }
: { type: 'lib', id: dmRow.getAttribute('data-sr-dm-lib') };
srDmClose();
srDemand(item);
return;
}
var modeTab = t.closest('[data-sr-mode-tab]');
if (modeTab) { _srSetMode(modeTab.getAttribute('data-sr-mode-tab')); return; }
var bgmScope = t.closest('[data-sr-bgm-scope]');
if (bgmScope) { srWrite({ bgmScope: bgmScope.getAttribute('data-sr-bgm-scope') }); srSetPaint(); return; }
if (t.closest('[data-srp-planact="close"]')) { _srPlanClose(); return; }
if (t.closest('[data-srp-musicact="close"]')) { _srMusicClose(); return; }
var pn = t.closest('[data-sr-plan-new]');
if (pn) { var kx = Number(pn.getAttribute('data-sr-plan-new')); _srPlanNew(kx === 3 ? 'blank' : kx); return; }
var pEdit = t.closest('[data-sr-plan-edit]');
if (pEdit) { _srPlan.edit = _srPlanById(pEdit.getAttribute('data-sr-plan-edit')); _srPlan.view = 'edit'; _srPlanPaint(); return; }
var pStart = t.closest('[data-sr-plan-start]');
if (pStart) { _srPlanUse(pStart.getAttribute('data-sr-plan-start')); return; }
var pDup = t.closest('[data-sr-plan-dup]');
if (pDup) { _srPlanDup(pDup.getAttribute('data-sr-plan-dup')); return; }
var pDel = t.closest('[data-sr-plan-del]');
if (pDel) { _srPlanDel(pDel.getAttribute('data-sr-plan-del')); return; }
if (t.closest('[data-sr-plan-act="loop"]')) { if (_srPlan.edit) { _srPlan.edit.loop = !_srPlan.edit.loop; _srSavePlans(); _srPlanPaint(); } return; }
var pOnEnd = t.closest('[data-sr-plan-onend]');
if (pOnEnd) { if (_srPlan.edit) { _srPlan.edit.onEnd = pOnEnd.getAttribute('data-sr-plan-onend'); _srSavePlans(); _srPlanPaint(); } return; }
if (t.closest('[data-sr-plan-back]')) { _srPlan.view = 'list'; _srPlan.edit = null; _srPlan.seg = null; _srPlanPaint(); return; }
var segEdit = t.closest('[data-sr-seg-edit]');
if (segEdit) { _srPlan.seg = _srPlan.edit.segments[Number(segEdit.getAttribute('data-sr-seg-edit'))]; _srPlan.view = 'seg'; _srPlanPaint(); return; }
if (t.closest('[data-sr-seg-add]')) { _srSegAdd(); return; }
var segMove = t.closest('[data-sr-seg-move]');
if (segMove) { var mv = segMove.getAttribute('data-sr-seg-move').split(':'); _srSegMove(Number(mv[0]), Number(mv[1])); return; }
var segDel = t.closest('[data-sr-seg-del]');
if (segDel) { _srSegDel(Number(segDel.getAttribute('data-sr-seg-del'))); return; }
if (t.closest('[data-sr-seg-back]')) { _srPlan.view = 'edit'; _srPlan.seg = null; _srPlanPaint(); return; }
var segBg = t.closest('[data-sr-seg-bg]');
if (segBg) {
var g0 = _srPlan.seg, sid = segBg.getAttribute('data-sr-seg-bg');
if (g0) {
var arr = g0.bg || (g0.bg = []), at = -1;
for (var bi = 0; bi < arr.length; bi++) if (arr[bi].sid === sid) at = bi;
if (at >= 0) arr.splice(at, 1); else arr.push({ sid: sid, vol: 70 });
_srSavePlans(); _srPlanPaint();
}
return;
}
var segTr = t.closest('[data-sr-seg-tr]');
if (segTr) {
var g1 = _srPlan.seg, tid = segTr.getAttribute('data-sr-seg-tr');
if (g1) {
var arr2 = g1.tr || (g1.tr = []), at2 = -1;
for (var ti = 0; ti < arr2.length; ti++) if (arr2[ti].sid === tid) at2 = ti;
if (at2 >= 0) arr2.splice(at2, 1); else arr2.push({ sid: tid, vol: 70 });
_srSavePlans(); _srPlanPaint();
}
return;
}
var segMusic = t.closest('[data-sr-seg-music]');
if (segMusic) { if (_srPlan.seg) { _srPlan.seg.music.mode = segMusic.getAttribute('data-sr-seg-music'); _srSavePlans(); _srPlanPaint(); } return; }
if (t.closest('[data-sr-seg-pick="track"]')) { _srMusicOpen('track'); return; }
var segPl = t.closest('[data-sr-seg-pl]');
if (segPl) { if (_srPlan.seg) { _srPlan.seg.music.plId = segPl.getAttribute('data-sr-seg-pl'); _srSavePlans(); _srPlanPaint(); } return; }
var segWh = t.closest('[data-sr-seg-wh]');
if (segWh) { if (_srPlan.seg) { _srPlan.seg.whisper = segWh.getAttribute('data-sr-seg-wh'); _srSavePlans(); _srPlanPaint(); } return; }
var mRow = t.closest('[data-sr-music-id]');
if (mRow) {
var mid = mRow.getAttribute('data-sr-music-id');
if (_srPick.target === 'ids') {
var st0 = srRead(), ids = st0.bgmIds.slice(), pos = ids.indexOf(mid);
if (pos >= 0) ids.splice(pos, 1); else ids.push(mid);
srWrite({ bgmIds: ids }); _srMusicPaint();
} else if (_srPlan.seg) {
_srPlan.seg.music = { mode: 'track', tid: mid, plId: '' };
_srSavePlans(); _srMusicClose(); _srPlanPaint();
}
return;
}
if (t.closest('[data-sr-music-act="clear"]')) { _srPick.q = ''; _srMusicPaint(); return; }
var tabBtn = t.closest('[data-sr-set]');
if (tabBtn && tabBtn.classList.contains('srp-settab')) { _srSetTabApply(tabBtn.getAttribute('data-sr-set')); return; }
var reBtn = t.closest('[data-sr-replay]');
if (reBtn) {
var mm = null;
for (var k = 0; k < srMsgs.length; k++) if (srMsgs[k].id === reBtn.getAttribute('data-sr-replay')) mm = srMsgs[k];
if (mm) {
var tb = _srTimbreOf(mm.who);
if (!tb) { showToast('这位没绑音色了，念不出来'); return; }
_srWhSynth(mm.text, tb).then(function (u) { _srWhQueue(function () { return Promise.resolve(u); }); })
.catch(function (e2) { showToast((e2 && e2.message) || '没念出来'); });
}
return;
}
var drop = t.closest('[data-sr-drop]');
if (drop) { dropLayer(drop.getAttribute('data-sr-drop'), ''); return; }
var hbBtn = t.closest('[data-sr-hb]');
if (hbBtn) {
var hcid = hbBtn.getAttribute('data-sr-hb');
var Lh = live.get('heart');
var was = Lh ? Lh.hbBy : '';
if (Lh) dropLayer('heart', '');
if (was !== hcid) {
var hsd = null;
for (var hi = 0; hi < SR_SOUNDS.length; hi++) if (SR_SOUNDS[hi].id === 'heart') hsd = SR_SOUNDS[hi];
if (hsd) {
ensureAC();
if (!playing) { playing = true; _srSys('开播了，晚安'); whStartSession(); }
addLayer(hsd, 0, hcid, { protect: true, hbBy: hcid, text: '把耳朵贴过来……听我的心跳' });
}
}
srDmPaint();
return;
}
var dmApplyBtn = t.closest('[data-sr-dm-apply]');
if (dmApplyBtn) {
var dmInp = document.getElementById('srDmEdit');
var dmRaw = dmInp ? String(dmInp.value).trim() : '';
var dmNum = Math.round(Number(dmRaw));
if (!dmRaw || !isFinite(dmNum) || dmNum < 1) { showToast('填 1 到 180 分钟'); return; }
if (dmNum > 180) dmNum = 180;
_srSetDmMin(dmNum);
return;
}
var dmMinBtn = t.closest('[data-sr-dmmin]');
if (dmMinBtn) {
_srSetDmMin(Number(dmMinBtn.getAttribute('data-sr-dmmin')) || 0);
return;
}
var modeBtn = t.closest('[data-sr-mode]');
if (modeBtn) {
srWrite({ whMode: modeBtn.getAttribute('data-sr-mode') });
if (playing) whStartSession();
srSetPaint();
return;
}
var act = t.closest('[data-sr-act]');
if (act) {
var a = act.getAttribute('data-sr-act');
if (a === 'go') goLive();
else if (a === 'auto') {
var on = !srRead().auto;
srWrite({ auto: on });
if (on && playing) schedule(1500);
if (!on) clearTimeout(schedT);
srSetPaint();
} else if (a === 'sur') {
srWrite({ sur: !srRead().sur });
_surApply();
srSetPaint();
} else if (a === 'bgm') {
srWrite({ bgmOn: !srRead().bgmOn });
if (srRead().bgmOn && playing && srRead().mode === 'live') _srMusicStart();
if (!srRead().bgmOn) _srMusicStop();
srSetPaint();
} else if (a === 'bgm-pick') {
_srMusicOpen('ids');
} else if (a === 'bgm-next') {
if (!srRead().bgmOn) { showToast('先打开「联系人挑背景音乐」'); return; }
_srMusicNext(0);
} else if (a === 'on-demand') {
srDmOpen();
} else if (a === 'whaway') {
srWrite({ whAway: !srRead().whAway });
srSetPaint();
} else if (a === 'wh-lib') {
srWhOpen();
} else if (a === 'wh-log') {
srWhLogOpen();
}
return;
}
var row = t.closest('[data-sr-play]');
if (row) {
if (_lpFired) { _lpFired = false; return; }
var id = row.getAttribute('data-sr-play');
var sd = null;
for (var k2 = 0; k2 < SR_SOUNDS.length; k2++) if (SR_SOUNDS[k2].id === id) sd = SR_SOUNDS[k2];
if (!sd) return;
if (live.has(id)) { dropLayer(id, ''); return; }
ensureAC();
if (!playing) { playing = true; _srSys('开播了，晚安'); whStartSession(); if (srRead().mode === 'live') _srMusicStart(); }
addLayer(sd, 0, 'me');
if (srRead().auto) schedule();
renderSleepRoom();
}
});
view.addEventListener('input', function (e) {
var t = e.target;
if (!t || !t.getAttribute) return;
if (t.id === 'srDmAsk') { _dm.ask = t.value; return; }
var lv = t.getAttribute('data-sr-lv');
if (lv) { setLayerVol(lv, Number(t.value)); return; }
if (t.id === 'srPlanNameEdit' && _srPlan.edit) { _srPlan.edit.name = t.value.slice(0, 12); _srSavePlans(); return; }
if (t.id === 'srSegNameEdit' && _srPlan.seg) { _srPlan.seg.name = t.value.slice(0, 12); _srSavePlans(); return; }
if (t.id === 'srSegDurEdit' && _srPlan.seg) { _srPlan.seg.durMin = Math.max(1, Math.min(180, Math.round(Number(t.value) || 1))); _srSavePlans(); return; }
if (t.id === 'srMusicQ') {
_srPick.q = t.value;
var pos0 = t.selectionStart;
_srMusicPaint();
setTimeout(function () { var q0 = document.getElementById('srMusicQ'); if (q0) { q0.focus(); try { q0.setSelectionRange(pos0, pos0); } catch (e) {} } }, 0);
return;
}
var sv = t.getAttribute('data-sr-seg-vol');
if (sv && _srPlan.seg) {
var sp = sv.split(':'), grp = sp[0], sid = sp[1], arr = grp === 'bg' ? (_srPlan.seg.bg || []) : (_srPlan.seg.tr || []);
for (var ai = 0; ai < arr.length; ai++) if (arr[ai].sid === sid) arr[ai].vol = Number(t.value) || 0;
_srSavePlans(); return;
}
var key = t.getAttribute('data-sr-set');
if (!key) return;
var v = Number(t.value);
var st = srRead(), patch = {};
patch[key] = v;
srWrite(patch);
if (AC && master) {
if (key === 'vol') master.gain.setTargetAtTime(v / 100, AC.currentTime, 0.05);
else if (key === 'volBg' && bgBus) bgBus.gain.setTargetAtTime(v / 100, AC.currentTime, 0.05);
else if (key === 'volTrig' && trBus) trBus.gain.setTargetAtTime(v / 100, AC.currentTime, 0.05);
else if (key === 'volWh' && whBus) whBus.gain.setTargetAtTime(v / 100, AC.currentTime, 0.05);
else if (key === 'reverb' && whWet) whWet.gain.setTargetAtTime(v / 100 * 0.6, AC.currentTime, 0.05);
}
if (key === 'bgmVol' || key === 'vol') _srMusicVolApply();
var row = t.previousElementSibling;
if (row && row.classList && row.classList.contains('sr-row')) {
var val = row.querySelector('small');
if (val) {
if (key === 'vol' || key === 'volBg' || key === 'volTrig' || key === 'volWh') val.textContent = String(v);
else if (key === 'bgmVol') val.textContent = v + ' / 60（垫底不抢雨声）';
else if (key === 'bgmGap') val.textContent = v ? ('隔 ' + v + ' 分钟再挑') : '立即换下一首';
else if (key === 'max') val.textContent = v + ' 层';
else if (key === 'gap') val.textContent = v + ' 秒上下动一次手';
else if (key === 'dur') val.textContent = v + ' 分钟上下';
else if (key === 'whProb') val.textContent = v + '%';
else if (key === 'whCap') val.textContent = v + ' 条';
else if (key === 'whReuse') val.textContent = v + '% 的时候从【轻语记录】里翻一句';
else if (key === 'whSpd') val.textContent = v.toFixed(2) + ' 倍（越低越慢）';
else if (key === 'reverb') val.textContent = v + '%';
}
}
});
}
var planMask = document.getElementById('srPlanMask');
if (planMask) planMask.addEventListener('click', function (e) { if (e.target === planMask) _srPlanClose(); });
var musicMask = document.getElementById('srMusicMask');
if (musicMask) musicMask.addEventListener('click', function (e) { if (e.target === musicMask) _srMusicClose(); });
var dmMask = document.getElementById('srDmMask');
if (dmMask) dmMask.addEventListener('click', function (e) { if (e.target === dmMask) srDmClose(); });
var whMask = document.getElementById('srWhMask');
if (whMask) {
whMask.addEventListener('click', function (e) {
var t = e.target;
if (!t || !t.closest) return;
if (t === whMask) { srWhClose(); return; }
var cidBtn = t.closest('[data-wh-cid]');
if (cidBtn) { _wh.cid = cidBtn.getAttribute('data-wh-cid'); srWhPaint(); return; }
var kindBtn = t.closest('[data-wh-kind]');
if (kindBtn) { _wh.kind = kindBtn.getAttribute('data-wh-kind'); srWhPaint(); return; }
var pidBtn = t.closest('[data-wh-pid]');
if (pidBtn) { _wh.pid = pidBtn.getAttribute('data-wh-pid'); _wh.prompt = ''; srWhPaint(); return; }
var playBtn = t.closest('[data-wh-play]');
if (playBtn) { srWhToggleLibPlay(playBtn.getAttribute('data-wh-play')); return; }
var dlBtn = t.closest('[data-wh-dl]');
if (dlBtn) {
var w1 = _srWhLib().find(function (x) { return x.id === dlBtn.getAttribute('data-wh-dl'); });
if (w1) {
var tb1 = _srTimbreOf(w1.cid);
if (!tb1) { showToast('这位没绑音色了，合成不出来'); return; }
showToast('正在合成，好了会自动下载…');
_srWhSynth(w1.text, tb1).then(function (u) {
_srWhDownload(u, '轻语-' + _srMateName(w1.cid));
}).catch(function (e) { showToast((e && e.message) || '没合成出来'); });
}
return;
}
var delBtn = t.closest('[data-wh-del]');
if (delBtn) {
var did = delBtn.getAttribute('data-wh-del');
var lib = _srWhLib();
var wi = lib.findIndex(function (x) { return x.id === did; });
if (wi >= 0) {
lib.splice(wi, 1);
try { if (typeof flushSave === 'function') flushSave(); } catch (e2) {}
srWhPaint(); renderSleepRoom();
}
return;
}
var offBtn = t.closest('[data-wh-off]');
if (offBtn) {
var oid = offBtn.getAttribute('data-wh-off');
var ow = _srWhLib().find(function (x) { return x.id === oid; });
if (ow) {
ow.off = !ow.off;
try { if (typeof flushSave === 'function') flushSave(); } catch (e3) {}
srWhPaint(); renderSleepRoom();
showToast(ow.off ? '这条不再被重复调用' : '恢复调用了');
}
return;
}
var act = t.closest('[data-wh-act]');
if (act) {
var a = act.getAttribute('data-wh-act');
if (a === 'close') srWhClose();
else if (a === 'gen') srWhGen(true);
else if (a === 'genraw') srWhGen(false);
else if (a === 'save') srWhSave();
else if (a === 'play' && _wh.url) { _srWhQueue(function () { return Promise.resolve(_wh.url); }); }
else if (a === 'dl' && _wh.url) _srWhDownload(_wh.url, '轻语-' + _srMateName(_wh.cid));
return;
}
});
whMask.addEventListener('input', function (e) {
var t = e.target;
if (!t || !t.id) return;
if (t.id === 'srWhPrompt') { _wh.prompt = t.value; _whPaintPrompt(); }
else if (t.id === 'srWhCustom') { _wh.custom = t.value; }
});
}
var whLogMask = document.getElementById('srWhLogMask');
if (whLogMask) {
whLogMask.addEventListener('click', function (e) {
var t = e.target;
if (!t || !t.closest) return;
if (t === whLogMask) { srWhLogClose(); return; }
var act = t.closest('[data-srlg-act]');
if (act) {
var a = act.getAttribute('data-srlg-act');
if (a === 'close') srWhLogClose();
else if (a === 'sel') {
if (_whLog.busy) _whLog.cancel = true;
else { _whLog.sel = !_whLog.sel; _whLog.pick = {}; }
srWhLogPaint();
} else if (a === 'all') {
var rs = _whLogRecs();
var n0 = _whLogSelN();
if (n0 && n0 === rs.length) _whLog.pick = {};
else rs.forEach(function (w) { _whLog.pick[w.id] = true; });
srWhLogPaint();
} else if (a === 'dlsel') _srWhLogBatch();
return;
}
var cidB = t.closest('[data-srlg-cid]');
if (cidB) { _whLog.cid = cidB.getAttribute('data-srlg-cid'); _whLog.openId = ''; _whLog.pick = {}; srWhLogPaint(); return; }
var tabB = t.closest('[data-srlg-tab]');
if (tabB) { _whLog.tab = tabB.getAttribute('data-srlg-tab'); _whLog.openId = ''; _whLog.pick = {}; srWhLogPaint(); return; }
var pickB = t.closest('[data-srlg-pick]');
if (pickB) { var pid = pickB.getAttribute('data-srlg-pick'); _whLog.pick[pid] = !_whLog.pick[pid]; srWhLogPaint(); return; }
var openB = t.closest('[data-srlg-open]');
if (openB) { var oid = openB.getAttribute('data-srlg-open'); _whLog.openId = _whLog.openId === oid ? '' : oid; srWhLogPaint(); return; }
var playB = t.closest('[data-srlg-play]');
if (playB) { srWhToggleLibPlay(playB.getAttribute('data-srlg-play')); return; }
var dlB = t.closest('[data-srlg-dl]');
if (dlB) { _srWhLogDlOne(dlB.getAttribute('data-srlg-dl')); return; }
var offB = t.closest('[data-srlg-off]');
if (offB) {
var ow = _srWhLib().find(function (x) { return x.id === offB.getAttribute('data-srlg-off'); });
if (ow) {
ow.off = !ow.off;
try { if (typeof flushSave === 'function') flushSave(); } catch (e2) {}
srWhLogPaint(); renderSleepRoom();
showToast(ow.off ? '这条不再被重复调用' : '恢复调用了');
}
return;
}
var delB = t.closest('[data-srlg-del]');
if (delB) { _srWhLogDel(delB.getAttribute('data-srlg-del')); return; }
});
}
function srTeardown() {
clearTimeout(schedT); schedT = null;
whStop();
dropTimers.forEach(function (t) { clearTimeout(t); });
dropTimers.clear();
_srPlanStop();
_srMusicStop();
live.forEach(function (L) { try { L.stop(); } catch (e) {} });
live.clear();
_srWhStopSrc();
if (whAir) { try { whAir.src.stop(); } catch (e) {} whAir = null; }
srEndsAt = 0; dimG = null; whWet = null; whQ = []; whBusy = false; _awayAt = 0;
whNetDown = false; whPauseK = '';
softN = null; cutN = null;
try { if (AC) AC.close(); } catch (e) {}
AC = null; master = null; bgBus = null; trBus = null; whBus = null; compN = null;
playing = false;
}
document.addEventListener('visibilitychange', function () {
_awayAt = document.hidden ? Date.now() : 0;
if (!document.hidden) _whNetResume(false);
});
window.addEventListener('online', function () { _whNetResume(true); });
window.addEventListener('pagehide', function () {
clearTimeout(schedT); schedT = null;
whStop();
});
window.addEventListener('pageshow', function () {
if (playing && srRead().auto) schedule(2000);
_whNetResume(false);
if (playing && !whT && !whNetDown) whNext(whNextK || 'short', 3000 + Math.random() * 5000);
if (AC && AC.state === 'suspended') AC.resume().catch(function () {});
});
window.srTeardown = srTeardown;
window.renderSleepRoom = renderSleepRoom;
window.__srAudioProbe = function () {
return AC ? { ac: AC, master: master, bg: bgBus, tr: trBus, bufs: bufs, comp: compN, dim: dimG,
soft: softN, cut: cutN, airG: whAir ? whAir.g.gain.value : null } : null;
};
window.__srProbe = function () {
var layers = {};
live.forEach(function (L, id) {
layers[id] = { grp: L.grp || '', pan: (L.p && L.p.pan) ? L.p.pan.value : null, wide: !!L.wide };
});
return { mode: srRead().mode, playing: playing, live: Array.from(live.keys()),
plan: _srPlan.plan ? _srPlan.plan.name : '', idx: _srPlan.idx,
music: _srMusic.id, plans: _srPlans().length, bgmOn: srRead().bgmOn, bgmVol: srRead().bgmVol,
whNetDown: whNetDown, dmMin: srRead().dmMin, endsAt: srEndsAt, layers: layers };
};
})();
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['sleeproom'] = true;
