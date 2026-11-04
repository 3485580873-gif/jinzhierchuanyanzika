// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var _call = null;
function callBusy() { return !!_call; }
var CALL_BG_HOLD_MS = 3 * 60 * 1000;
var _lastDragMoved = false;
var _holdTimer = null, _holdX = 0, _holdY = 0, _holdFired = false;
function _holdStart(e) {
if (!_call || e.target.closest('button')) return;
_holdX = e.clientX; _holdY = e.clientY; _holdFired = false;
const w = $('#callWindow'); if (w) w.classList.add('pressing');
clearTimeout(_holdTimer);
_holdTimer = setTimeout(() => { _holdTimer = null; _holdFired = true; _holdEnd(); endCall('user'); }, 520);
}
function _holdMove(e) {
if (!_holdTimer) return;
if (Math.abs(e.clientX - _holdX) > 8 || Math.abs(e.clientY - _holdY) > 8) _holdEnd();
}
function _holdEnd() {
clearTimeout(_holdTimer); _holdTimer = null;
const w = $('#callWindow'); if (w) w.classList.remove('pressing');
}
function _callFmt(ms) {
const s = Math.max(0, Math.floor(ms / 1000));
return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}
function _pickCallOutcome() {
const cs = callSettingsOf((_call && _call.cid) || data.activeChat);
const w = [
['answer', Number(cs.answerProb) || 0],
['reject', Number(cs.rejectProb) || 0],
['miss', Number(cs.missProb) || 0],
['busy', Number(cs.busyProb) || 0]
];
let sum = w.reduce((s, x) => s + x[1], 0);
if (sum <= 0) { w[0][1] = 60; w[1][1] = 15; w[2][1] = 15; w[3][1] = 10; sum = 100; }
let r = Math.random() * sum;
for (const [n, p] of w) { r -= p; if (r < 0) return n; }
return 'answer';
}
function _callCid() { return (_call && _call.cid) || data.activeChat || ''; }
function _callOwner() { return (data.contacts || []).find(x => x.id === _callCid()) || null; }
function _callName() { const c = _callOwner(); return (c && (c.chatName || c.name)) || 'TA'; }
function _callAvatarSrc() { const c = _callOwner(); return (c && (c.chatAvatar || c.avatar)) || ''; }
function _callMsg(text, call) {
const msg = { id: nextId(), from: 'system', text };
if (call) msg.call = call;
_deliverToChat(msg, _callCid());
}
function _callLogOpen(mode) {
const rec = {
id: nextId(), cid: _callCid(), mode: mode === 'video' ? 'video' : 'voice',
outcome: '', startAt: Date.now(), connAt: 0, incoming: !!(_call && _call.incoming),
endAt: 0, durationMs: 0, open: true,
greet: [], exprs: [], msgs: []
};
(data.callLogs = data.callLogs || []).push(rec);
if (data.callLogs.length > CALL_LOG_MAX) data.callLogs.splice(0, data.callLogs.length - CALL_LOG_MAX);
_vcSinkTail = null;
save();
return rec;
}
function _callLogGreet(seq) {
const rec = _call && _call.log;
if (!rec || !Array.isArray(seq)) return;
const have = new Set((rec.greet || []).map(g => (g.name || '') + '|' + (g.text || '') + '|' + (g.tts || '')));
seq.forEach(r => {
if (!r) return;
const g = { name: String(r.name || ''), text: String(r.text || ''), tts: String(r.tts || '') };
const k = g.name + '|' + g.text + '|' + g.tts;
if (have.has(k)) return;
have.add(k);
rec.greet.push(g);
});
try { save(); } catch (e) {}
}
function _callMsgsOf() { return (_call && _call.log && Array.isArray(_call.log.msgs)) ? _call.log.msgs : []; }
var _vcSinkTail = null;
function _callMsgSink(cid, msg) {
if (msg && msg.from === 'system') return null;
if (msg && msg.src === 'calendar') return null;
if (typeof _vc !== 'undefined' && _vc && _vc.msgs && _vc.cid === cid) return _vc.msgs;
if (msg && msg.from === 'partner' && _vcSinkTail && _vcSinkTail.cid === cid && Date.now() < _vcSinkTail.until) return _vcSinkTail.msgs;
return null;
}
function _callLogFinish() {
const rec = _call && _call.log;
if (!rec || !rec.open) return;
rec.open = false;
rec.endAt = Date.now();
rec.durationMs = Math.max(0, rec.endAt - (rec.startAt || rec.endAt));
try { save(); } catch (e) {}
}
var CALL_LIVE_KEY = 'ordinal-call-live';
var CALL_LIVE_SEEN_KEY = 'ordinal-call-live-seen';
var CALL_LIVE_BEAT_MS = 15000;
var _callBeatT = null;
function _callLiveWrite() {
const rec = _call && _call.log;
if (!rec || !rec.open) return;
const at = Date.now();
try {
sessionStorage.setItem(CALL_LIVE_KEY, JSON.stringify({
id: rec.id, cid: rec.cid, at, connAt: Number(rec.connAt) || 0, video: !!_call.video
}));
} catch (e) {}
try { localStorage.setItem(CALL_LIVE_SEEN_KEY, JSON.stringify({ id: rec.id, at })); } catch (e) {}
}
function _callLiveClear() {
if (_callBeatT) { clearInterval(_callBeatT); _callBeatT = null; }
try { sessionStorage.removeItem(CALL_LIVE_KEY); } catch (e) {}
try { localStorage.removeItem(CALL_LIVE_SEEN_KEY); } catch (e) {}
}
function _callLiveBeat(on) {
if (!on) { _callLiveClear(); return; }
_callLiveWrite();
if (!_callBeatT) _callBeatT = setInterval(_callLiveWrite, CALL_LIVE_BEAT_MS);
}
function _callLiveRead() {
try {
const o = JSON.parse(sessionStorage.getItem(CALL_LIVE_KEY) || 'null');
return (o && typeof o === 'object' && o.id != null) ? o : null;
} catch (e) { return null; }
}
try {
window.addEventListener('pagehide', () => {
if (_call && _call.log && _call.log.open) { try { _callLiveWrite(); } catch (e) {} }
});
} catch (e) {}
function _callResumeOn() { return data.callResumeOnReload !== false; }
var CALL_RESUME_HOSTS = ['#callResumeOnReload', '#mateCallResumeOnReload'];
function callResumeEcho() {
const on = _callResumeOn();
CALL_RESUME_HOSTS.forEach(sel => { const el = $(sel); if (el) el.checked = on; });
}
async function setCallResumeOnReload(on) {
const want = !!on;
const before = _callResumeOn();
data.callResumeOnReload = want;
callResumeEcho();
if (!want) _callLiveClear();
else if (_call && _call.log && _call.log.open) _callLiveBeat(true);
try { await flushSave(); } catch (e) {}
if (before !== want && typeof showToast === 'function') {
showToast(want ? '刷新页面不会再打断这一通' : '刷新页面会挂断这一通，它会记成「异常结束」');
}
return before !== want;
}
function _callLiveSeenAt(id) {
try {
const s = JSON.parse(localStorage.getItem(CALL_LIVE_SEEN_KEY) || 'null');
if (s && String(s.id) === String(id)) { const t = Number(s.at); if (isFinite(t) && t > 0) return t; }
} catch (e) {}
return 0;
}
function _callSettleDropped(rec, capMs) {
if (!rec || !rec.open) return false;
rec.open = false;
const conn = Number(rec.connAt) || 0;
const start = Number(rec.startAt) || Date.now();
if (conn > 0) {
rec.outcome = 'drop';
const seen = _callLiveSeenAt(rec.id);
let end = Math.max(conn, seen > conn ? seen : Math.min(Date.now(), conn + CALL_RESUME_MAX_MS));
if (capMs > 0) end = Math.min(end, conn + capMs);
rec.endAt = end;
rec.durationMs = Math.max(0, end - conn);
} else {
rec.outcome = rec.incoming ? 'miss' : 'cancel';
rec.endAt = start;
rec.durationMs = 0;
}
return true;
}
function _callResumeAttach(rec) {
_call = {
cid: rec.cid, state: 'connected', t0: Number(rec.connAt) || Date.now(),
timer: null, tick: null, video: rec.mode === 'video', resumed: true
};
_call.log = rec;
rec.open = true;
_callLiveBeat(true);
_callLayerWatch(true);
if (data.activeChat !== rec.cid && typeof switchChat === 'function') { try { switchChat(rec.cid, true); } catch (e) {} }
cfOpenOutgoing();
cfSetConnected();
_enterConnected(_call.t0, true);
if (_call.video) { try { cfEnterVideo(); } catch (e) {} }
return true;
}
function callRestoreOrSettle() {
if (_call) return false;
const logs = Array.isArray(data.callLogs) ? data.callLogs : [];
const live = _callLiveRead();
let keep = null;
if (live && _callResumeOn()) {
const rec = logs.find(r => r && String(r.id) === String(live.id));
const who = rec ? (data.contacts || []).find(c => c && c.id === rec.cid) : null;
if (rec && who && who.kind !== 'group' && rec.open && Number(rec.connAt) > 0) {
const at = Math.max(_callLiveSeenAt(rec.id), Number(live.at) || 0, Number(rec.connAt) || 0);
const cs = callSettingsOf(rec.cid);
const capMs = cs.noAutoHangup ? 0 : Math.max(1, Number(cs.callMaxLen) || 5) * 60000;
if (Date.now() - at <= CALL_RESUME_MAX_MS && !(capMs > 0 && Date.now() - Number(rec.connAt) > capMs)) keep = rec;
}
}
let changed = false;
for (const rec of logs) {
if (!rec || !rec.open || rec === keep) continue;
const cs = callSettingsOf(rec.cid);
const capMs = cs.noAutoHangup ? 0 : Math.max(1, Number(cs.callMaxLen) || 5) * 60000;
if (_callSettleDropped(rec, capMs)) changed = true;
}
if (keep) { _callResumeAttach(keep); changed = true; }
else _callLiveClear();
if (changed) { try { save(); } catch (e) {} }
return !!keep;
}
function _callGreetText(text, playing) {
const t = String(text || '');
const wrap = $('#cfVoiceWrap');
const list = $('#cfVoiceList');
if (!t) {
if (list) list.innerHTML = '';
if (wrap) { wrap.hidden = true; wrap.classList.remove('playing'); }
if (typeof mmCallGreetClear === 'function') mmCallGreetClear();
return;
}
if (wrap) { wrap.hidden = false; wrap.classList.toggle('playing', !!playing); }
if (!list) return;
if (playing) {
const row = document.createElement('div');
row.className = 'cf-vl-row playing';
const tx = document.createElement('span');
tx.className = 'cf-vl-tx';
tx.textContent = t;
row.appendChild(tx);
list.appendChild(row);
list.scrollTop = list.scrollHeight;
} else {
const cur = list.querySelector('.cf-vl-row.playing');
if (cur) cur.classList.remove('playing');
}
}
function _callGreetListReset() {
const l = $('#cfVoiceList');
if (l) { l.innerHTML = ''; l.scrollTop = 0; }
const w = $('#cfVoiceWrap');
if (w) w.classList.remove('playing');
}
function _recordCall(outcome, durationMs) {
(data.calls = data.calls || []).push({
id: nextId(),
cid: _callCid(),
outcome,
kind: (_call && _call.log && _call.log.mode === 'video') ? 'video' : 'voice',
durationMs: Math.max(0, Math.round(durationMs)),
duration: _callFmt(durationMs),
time: time(),
date: new Date().toLocaleDateString('zh-CN')
});
const rec = _call && _call.log;
if (rec) { rec.outcome = outcome; rec.durationMs = Math.max(0, Math.round(durationMs)); }
if (outcome === 'answer' && typeof avlibFeed === 'function' && typeof AV_HEAT_CALL !== 'undefined') avlibFeed(_callCid(), AV_HEAT_CALL, 'call');
save();
}
function _callSetStatus(text, cls) {
const el = $('#callStatus');
el.textContent = text;
el.className = 'call-status' + (cls ? ' ' + cls : '');
$('#callWindow').classList.toggle('connected', cls === 'connected');
const cf = $('#cfStatus');
if (cf && !cf.hidden && !$('#callFull').hidden) cf.textContent = text;
}
function _paintCallAvatar(srcArg) {
const src = (typeof srcArg === 'string') ? srcArg : _callAvatarSrc();
const html = avatarHTML(src);
$('#callAvatar').innerHTML = html;
$('#cfAvatar').innerHTML = html;
const _vcAv = document.getElementById('vcAvatar');
if (_vcAv) _vcAv.innerHTML = html;
const bare = !src;
[$('#callWindow').querySelector('.cw-av-disc'), $('#callFull').querySelector('.cf-av-disc'),
_vcAv ? _vcAv.parentElement : null]
.forEach(d => { if (d) d.classList.toggle('no-avatar', bare); });
}
var CALL_OVERLAY_SEL = '[class*="mask"]:not([hidden]), .pl-full:not([hidden])';
function _callLayerOpen() {
const b = document.body;
if (b.classList.contains('tune-on') || b.classList.contains('deal-half-open')) return true;
const sh = $('#appShell');
return !!(sh && sh.querySelector(CALL_OVERLAY_SEL));
}
function callSyncMiniView() {
const w = $('#callWindow');
if (!w || !_call) return;
if (!$('#callFull').hidden) return;
const want = !floatBoxShownHere() || _callLayerOpen();
if (w.hidden !== want) w.hidden = want;
}
function _callOpen() {
_paintCallAvatar();
$('#callWindow').hidden = !floatBoxShownHere() || _callLayerOpen();
}
var _callLayerObs = null;
function _callLayerWatch(on) {
if (!on) {
if (_callLayerObs) { try { _callLayerObs.disconnect(); } catch (e) {} _callLayerObs = null; }
return;
}
if (_callLayerObs || typeof MutationObserver !== 'function') return;
const sh = $('#appShell');
if (!sh) return;
_callLayerObs = new MutationObserver(() => { callSyncMiniView(); });
try {
_callLayerObs.observe(sh, { attributes: true, attributeFilter: ['hidden'], subtree: true });
_callLayerObs.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-view'] });
} catch (e) {}
}
function _callClose() {
_callClearRecover();
_callLogFinish();
_callLiveClear();
if (_call) { clearTimeout(_call.timer); clearInterval(_call.tick); _call = null; }
_vcTeardown();
_callLayerWatch(false);
stopRing();
_holdEnd();
if (typeof _callGreetText === 'function') { try { _callGreetText(''); } catch {} }
$('#callWindow').hidden = true;
const fullEl = $('#callFull');
if (fullEl) { fullEl.hidden = true; fullEl.classList.remove('connected'); }
_cfVideoFaceClear(fullEl);
try { if (data.appearance && data.appearance.bgKeepAlive) setBackgroundKeepAlive(true); } catch {}
try { if (!document.hidden) { resumeWriteScheduler(); } } catch {}
_scheduleNextIncomingCall();
}
/* ---------------- 通话恢复（刷新 / 闪退重进后弹窗） ----------------
 * 一通通话真正接通并持续 ≥5 秒后，把关键信息写进 localStorage。
 * 网站刷新或闪退重进后，若这条记录还在，就弹「是否恢复通话」：
 *   · 接受 → 重建 _call，并从原接通时刻继续计时（通话时长不归零）
 *   · 拒绝 → 清掉记录、关闭通话界面
 * 仅在通话真的连上满 5 秒才写记录，所以 5 秒内的短呼叫不会出现恢复弹窗。 */
var CALL_RECOVER_KEY = 'zika-call-recover';
function _callPersist() {
if (!_call || _call.state !== 'connected') return;
try {
const rec = { cid: _call.cid, video: !!_call.video, t0: _call.t0, nm: _callName() };
localStorage.setItem(CALL_RECOVER_KEY, JSON.stringify(rec));
} catch (e) {}
}
function _callClearRecover() {
if (_call && _call.recoverTimer) { clearTimeout(_call.recoverTimer); _call.recoverTimer = null; }
try { localStorage.removeItem(CALL_RECOVER_KEY); } catch (e) {}
}
function _callRecoveryCheck() {
if (_call) return;
let rec = null;
try { rec = JSON.parse(localStorage.getItem(CALL_RECOVER_KEY) || 'null'); } catch (e) { rec = null; }
if (!rec || !rec.cid) return;
const nm = rec.nm || 'TA';
const kind = rec.video ? '视频' : '语音';
openModal('恢复通话', nm + ' 正在和你' + kind + '通话，要接着聊吗？', function () {
/* 接受：重建并从原接通时刻继续 */
_callClearRecover();
_callResume(rec);
}, {
noInput: true,
okText: '恢复通话',
midBtn: { label: '拒绝恢复', onPick: function () {
_callClearRecover();
try { if (typeof showToast === 'function') showToast('已拒绝恢复通话'); } catch (e) {}
} }
});
}
function _callResume(rec) {
if (_call) return;
if (typeof _isGroupChat === 'function' && _isGroupChat()) { _callClearRecover(); return; }
_call = { cid: rec.cid, state: 'calling', t0: 0, timer: null, tick: null, video: !!rec.video };
_call.log = null;
_callLayerWatch(true);
if (typeof _callGreetText === 'function') { try { _callGreetText(''); } catch (e) {} }
_callSetStatus('正在恢复…', 'ringing');
cfOpenOutgoing();
const full = $('#callFull');
if (full) full.hidden = false;
$('#callWindow').hidden = true;
_enterConnected(rec.t0, true);
if (rec.video) { setTimeout(function () { if (_call && _call.state === 'connected' && typeof cfEnterVideo === 'function') { try { cfEnterVideo(); } catch (e) {} } }, 320); }
}
function chooseCallKind() {
if (_call) { expandCall(); return; }
if (typeof _isGroupChat === 'function' && _isGroupChat()) return;
const c = (typeof currentContact === 'function') ? currentContact() : null;
const nm = (c && (c.chatName || c.name)) || 'TA';
openModal('给 ' + nm + ' 打电话', '', () => startCall('voice'), {
noInput: true, okText: '语音通话', staticText: '选一种通话方式',
midBtn: { label: '视频通话', onPick: () => startCall('video') }
});
}
function startCall(kind) {
if (_call) return;
if (typeof _isGroupChat === 'function' && _isGroupChat()) return;
const cs = callSettingsOf(data.activeChat);
const video = kind === 'video';
_call = { cid: data.activeChat, state: 'calling', t0: 0, timer: null, tick: null, video };
_call.log = _callLogOpen(video ? 'video' : 'voice');
_callLiveBeat(true);
_callLayerWatch(true);
if (typeof _callGreetText === 'function') { try { _callGreetText(''); } catch (e) {} }
_callSetStatus('正在呼叫…', 'ringing');
cfOpenOutgoing();
if (!window.__callHoldHinted) { window.__callHoldHinted = true; try { showToast('点右上「—」收成小框 · 长按小框可挂断'); } catch (e) {} }
startRing(_call.cid, _call.video);
const rMin = Math.max(1, Number(cs.ringMin) || 2), rMax = Math.max(rMin, Number(cs.ringMax) || 5);
_call.timer = setTimeout(() => resolveCall(_pickCallOutcome()), (rMin + Math.random() * (rMax - rMin)) * 1000);
}
function resolveCall(outcome) {
if (!_call || _call.state !== 'calling') return;
stopRing();
const nm = _callName();
if (outcome === 'answer') {
_callMsg(nm + ' 接通了');
_enterConnected();
} else {
const map = { reject: [nm + ' 拒绝了', nm + ' 拒绝了你的通话'], miss: [nm + ' 没接', nm + ' 没接你的电话'], busy: [nm + ' 忙线中', nm + ' 忙线中，请稍后再试'] };
const [txt, msg] = map[outcome];
_call.state = 'ending';
_callSetStatus(txt, outcome);
_call.timer = setTimeout(() => { _callMsg(msg, { outcome, durationMs: 0, kind: _call.video ? 'video' : 'voice' }); _recordCall(outcome, 0); _callClose(); }, 1500);
}
}
function _enterConnected(atMs, resumed) {
_call.state = 'connected';
_call.t0 = (typeof atMs === 'number' && atMs > 0) ? atMs : Date.now();
if (_call.log) _call.log.connAt = _call.t0;
_callLiveWrite();
try { save(); } catch (e) {}
const full = !$('#callFull').hidden;
if (full) cfSetConnected();
else _callSetStatus('00:00', 'connected');
const elFull = document.getElementById('callFull');
const elCf = document.getElementById('cfStatus');
const elTimer = document.getElementById('cfTimer');
const elStatus = document.getElementById('callStatus');
_call.tick = setInterval(() => {
if (_call && _call.state === 'connected' && elCf && elStatus) {
if (elFull && !elFull.hidden) {
const d = _callFmt(Date.now() - _call.t0);
if (elTimer && !elTimer.hidden) elTimer.textContent = d; else elCf.textContent = d;
} else elStatus.textContent = _callFmt(Date.now() - _call.t0);
}
}, 1000);
try { setBackgroundKeepAlive(false); } catch {}
try { pauseWriteScheduler(); } catch {}
const cs = callSettingsOf(_call.cid);
if (!cs.noAutoHangup) {
const cMin = Math.max(1, Number(cs.callMinLen) || 1), cMax = Math.max(cMin, Number(cs.callMaxLen) || 5);
const span = (cMin + Math.random() * (cMax - cMin)) * 60000;
const left = resumed ? Math.max(15000, span - Math.max(0, Date.now() - _call.t0)) : span;
_call.timer = setTimeout(() => endCall('auto'), left);
}
if (_call.video && !resumed) {
setTimeout(() => { if (_call && _call.state === 'connected' && !_vc) { try { cfEnterVideo(); } catch (e) {} } }, 260);
}
if (!resumed && typeof mmCallGreet === 'function' && !_call.video) { const at = _call.cid; setTimeout(() => { if (_call && _call.state === 'connected') mmCallGreet(at); }, 600); }
/* 通话恢复：接通满 5 秒后才把关键信息落盘，刷新/闪退重进时弹「恢复通话」；
 * 短于 5 秒的呼叫不会写记录，自然也不会冒出恢复弹窗。 */
if (_call.recoverTimer) { clearTimeout(_call.recoverTimer); _call.recoverTimer = null; }
_call.recoverTimer = setTimeout(_callPersist, 5000);
}
function endCall() {
if (!_call) return;
const wasVideo = !!_call.video;
_vcTeardown();
const connected = _call.state === 'connected';
const durMs = connected ? Date.now() - _call.t0 : 0;
const dur = _callFmt(durMs);
const nm = _callName();
clearTimeout(_call.timer); clearInterval(_call.tick);
if (typeof mmStop === 'function') { try { mmStop(); } catch (e) {} }
if (typeof _callGreetText === 'function') { try { _callGreetText(''); } catch (e) {} }
const outcome = connected ? 'answer' : 'cancel';
_recordCall(outcome, durMs);
_callMsg(connected ? ('与 ' + nm + (wasVideo ? ' 的视频通话 · ' : ' 的通话 · ') + dur) : ('你取消了给 ' + nm + (wasVideo ? ' 的视频呼叫' : ' 的呼叫')),
{ outcome, durationMs: durMs, kind: wasVideo ? 'video' : 'voice' });
_callClose();
}
function cfMinimize() {
if (!_call) { if (typeof exitCallBgPreview === 'function') exitCallBgPreview(); return; }
const keepVideo = !!_call.video && _call.state === 'connected';
_vcTeardown(keepVideo);
$('#callFull').hidden = true;
_callOpen();
$('#callWindow').classList.toggle('connected', _call.state === 'connected');
if (_call.state === 'connected') _callSetStatus(_callFmt(Date.now() - _call.t0), 'connected');
if (keepVideo) _vcMiniEnter();
}
function expandCall() {
if (!_call) return;
const backToVideo = !!_call.video && _call.state === 'connected';
if (_call.state === 'connected') cfSetConnected();
else if (_call.incoming) cfOpen();
else cfOpenOutgoing();
$('#callFull').hidden = false;
$('#callWindow').hidden = true;
if (backToVideo) { _vcMiniLeave(); cfEnterVideo(); }
}
function _drag(el, target) {
if (!el) return;
let sx = 0, sy = 0, ox = 0, oy = 0, on = false, tw = 0, th = 0;
let px = 0, py = 0, pend = false;
const apply = () => {
pend = false;
if (on) target.style.transform = 'translate(' + px + 'px,' + py + 'px)';
};
el.addEventListener('pointerdown', e => {
const hit = e.target.closest('button');
if (hit && hit !== el) return;
on = true;
_lastDragMoved = false;
sx = e.clientX; sy = e.clientY;
const r = target.getBoundingClientRect();
ox = r.left; oy = r.top;
tw = r.width; th = r.height;
px = 0; py = 0; pend = false;
target.style.transform = 'none';
target.style.right = 'auto';
target.style.left = ox + 'px';
target.style.top = oy + 'px';
try { el.setPointerCapture(e.pointerId); } catch {}
e.preventDefault();
});
el.addEventListener('pointermove', e => {
if (!on) return;
if (Math.abs(e.clientX - sx) > 6 || Math.abs(e.clientY - sy) > 6) _lastDragMoved = true;
px = Math.max(4 - ox, Math.min(window.innerWidth - tw - 4 - ox, e.clientX - sx));
py = Math.max(4 - oy, Math.min(window.innerHeight - th - 4 - oy, e.clientY - sy));
if (!pend) {
pend = true;
if (typeof window.moFrame === 'function') window.moFrame(apply);
else requestAnimationFrame(apply);
}
});
const up = () => {
if (!on) return;
on = false;
target.style.left = (ox + px) + 'px';
target.style.top = (oy + py) + 'px';
target.style.transform = 'none';
};
el.addEventListener('pointerup', up);
el.addEventListener('pointercancel', up);
}
if ($('#callBtn')) $('#callBtn').onclick = chooseCallKind;
$('#callWindow') && $('#callWindow').addEventListener('pointerdown', _holdStart);
$('#callWindow') && $('#callWindow').addEventListener('pointermove', _holdMove);
window.addEventListener('pointerup', _holdEnd);
window.addEventListener('pointercancel', _holdEnd);
$('#callWindow') && $('#callWindow').addEventListener('click', () => {
if (_lastDragMoved) { _lastDragMoved = false; return; }
if (_holdFired) { _holdFired = false; return; }
expandCall();
});
if ($('#callWindow')) _drag($('#callWindow'), $('#callWindow'));
$('#callFull') && $('#callFull').addEventListener('click', () => { if ($('#callFull').dataset.preview) exitCallBgPreview(); });
function applyCallBg(cidArg) {
const full = $('#callFull');
if (!full) return;
const cid = (_call && _call.cid) ? _call.cid
: ((typeof cidArg === 'string' && cidArg) ? cidArg : (data.activeChat || ''));
const map = (data.callSettings && data.callSettings.callBgByCid) || {};
const src = (cid && typeof map[cid] === 'string') ? map[cid] : '';
if (src) {
full.style.setProperty('--call-bg', 'url("' + src + '")');
full.dataset.callbg = 'on';
} else {
full.style.removeProperty('--call-bg');
delete full.dataset.callbg;
}
}
function previewCallBg(cid) {
const full = $('#callFull');
if (!full || _call) return;
applyCallBg(cid);
const c = (cid && (data.contacts || []).find(x => x && x.id === cid))
|| (typeof currentContact === 'function' && currentContact()) || (data.contacts || [])[0] || null;
const nm = (c && typeof chatNameOf === 'function' && chatNameOf(c)) || (c && c.name) || 'TA';
$('#cfName').textContent = nm;
_paintCallAvatar(c ? chatAvatarOf(c) : '');
const st = $('#cfStatus');
st.hidden = false;
st.textContent = '背景预览 · 点任意处退出';
const _tpP = $('#cfType'); if (_tpP) _tpP.hidden = true;
_cfVideoFaceClear();
const tm = $('#cfTimer');
if (tm) tm.hidden = true;
full.classList.remove('connected');
$('#cfActionsIncoming').hidden = true;
$('#cfActionsConnected').hidden = true;
full.dataset.preview = 'on';
full.hidden = false;
}
function exitCallBgPreview() {
const full = $('#callFull');
if (!full || !full.dataset.preview) return;
delete full.dataset.preview;
full.hidden = true;
const st = $('#cfStatus');
if (st) { st.hidden = true; st.textContent = ''; }
}
function _callHideDeskPops() { if (typeof hideDeskPopup === 'function') { try { hideDeskPopup(); } catch (e) {} } }
function _cfVideoFaceApply() {
const full = $('#callFull');
if (!full) return;
if (!_call || !_call.video) { _cfVideoFaceClear(full); return; }
full.dataset.cfVideo = '1';
const map = (data.callSettings && data.callSettings.callBgByCid) || {};
const src = (_call.cid && typeof map[_call.cid] === 'string') ? map[_call.cid] : '';
const pic = src || _callAvatarSrc();
if (pic) full.style.setProperty('--cf-vid-bg', 'url("' + pic + '")');
else full.style.removeProperty('--cf-vid-bg');
}
function _cfVideoFaceClear(full) {
const el = full || $('#callFull');
if (!el) return;
delete el.dataset.cfVideo;
el.style.removeProperty('--cf-vid-bg');
}
function _cfTypePaint() {
const t = $('#cfType');
if (!t) return;
const vid = !!(_call && _call.video);
t.hidden = false;
const vI = $('#cfTypeVid'), pI = $('#cfTypePh');
if (vI) vI.hidden = !vid;
if (pI) pI.hidden = vid;
const tx = $('#cfTypeTx');
if (tx) tx.textContent = vid ? '视频通话' : '语音通话';
}
function cfOpen() {
applyCallBg();
_cfVideoFaceApply();
_cfTypePaint();
_callHideDeskPops();
$('#cfName').textContent = _callName();
_paintCallAvatar();
const _vid = !!(_call && _call.video);
const tp = $('#cfTopl'); if (tp) tp.textContent = _vid ? '视频通话' : '语音通话';
const st = $('#cfStatus');
st.hidden = false;
st.textContent = _vid ? '邀请你视频通话' : '邀请你语音通话';
const tm = $('#cfTimer');
if (tm) { tm.hidden = true; tm.textContent = '00:00'; }
const _vbtn0 = $('#cfVideoBtn'); if (_vbtn0) _vbtn0.hidden = true;
const _vab0 = $('#cfVideoAnsBtn'); if (_vab0) _vab0.hidden = _vid;
$('#cfActionsIncoming').classList.toggle('has-three', !_vid);
$('#callFull').classList.remove('connected');
$('#cfActionsIncoming').hidden = false;
$('#cfActionsConnected').hidden = true;
$('#callFull').hidden = false;
$('#callWindow').hidden = true;
}
function cfOpenOutgoing() {
applyCallBg();
_cfVideoFaceApply();
_cfTypePaint();
_callHideDeskPops();
$('#cfName').textContent = _callName();
_paintCallAvatar();
const tp = $('#cfTopl'); if (tp) tp.textContent = (_call && _call.video) ? '视频通话' : '语音通话';
const st = $('#cfStatus');
st.hidden = false;
st.textContent = $('#callStatus').textContent || '正在呼叫…';
const tm = $('#cfTimer');
if (tm) tm.hidden = true;
const _vbtn0 = $('#cfVideoBtn'); if (_vbtn0) _vbtn0.hidden = true;
$('#callFull').classList.remove('connected');
$('#cfActionsIncoming').hidden = true;
$('#cfEndBtn').querySelector('.cf-lb').textContent = '取消';
$('#cfActionsConnected').hidden = false;
$('#callFull').hidden = false;
}
function cfSetConnected() {
$('#cfActionsIncoming').hidden = true;
$('#cfActionsConnected').hidden = false;
$('#cfStatus').hidden = true;
const _tp0 = $('#cfType'); if (_tp0) _tp0.hidden = true;
if (_call && _call.video) {   }
else _cfVideoFaceClear();
$('#cfEndBtn').querySelector('.cf-lb').textContent = '挂断';
const _vbtn = $('#cfVideoBtn'); if (_vbtn) _vbtn.hidden = false;
const tm = $('#cfTimer');
if (tm) {
tm.hidden = false;
tm.textContent = _call && _call.state === 'connected' ? _callFmt(Date.now() - _call.t0) : '00:00';
}
$('#callFull').classList.add('connected');
}
function cfClose() {
$('#callFull').hidden = true;
}
function _scheduleNextIncomingCall() {
const cs = callSettingsOf(_incomingCid());
const min = Math.max(1, Math.min(1440, Number(cs.incomingMin) || 60));
const max = Math.max(min, Math.min(1440, Number(cs.incomingMax) || 180));
data._nextIncomingCallAt = Date.now() + (min + Math.random() * (max - min)) * 60000;
save();
}
function maybeTriggerIncomingCall() {
if (!isSchedulerLeader()) return;
const cs = callSettingsOf(_incomingCid());
if (cs.incomingEnable === false) {
if (typeof data._nextIncomingCallAt === 'number') { data._nextIncomingCallAt = undefined; save(); }
return;
}
const nextAt = typeof data._nextIncomingCallAt === 'number' ? data._nextIncomingCallAt : 0;
if (!nextAt || Date.now() - nextAt > _SCHED_GRACE_MS) {
_scheduleNextIncomingCall();
return;
}
if (Date.now() < nextAt) return;
if (typeof nightOn === 'function' && nightOn()) { _scheduleNextIncomingCall(); return; }
if (_call) { _scheduleNextIncomingCall(); return; }
data._nextIncomingCallAt = undefined;
save();
triggerIncomingCall();
}
function _incomingCid() {
const list = (data.contacts || []).filter(c => c && c.id && c.kind !== 'group');
if (!list.length) return '';
const act = data.activeChat;
return list.some(c => c.id === act) ? act : list[0].id;
}
function triggerIncomingCall() {
if (_call) { _scheduleNextIncomingCall(); return; }
const cid = _incomingCid();
if (!cid) { _scheduleNextIncomingCall(); return; }
const cs = callSettingsOf(cid);
const vp = Math.max(0, Math.min(100, Number(cs.incomingVideoProb) || 0));
const video = vp > 0 && Math.random() * 100 < vp;
_call = { cid, state: 'ring-inc', incoming: true, video, t0: 0, timer: null, tick: null };
_call.log = _callLogOpen(video ? 'video' : 'voice');
_callLiveBeat(true);
_callLayerWatch(true);
cfOpen();
startRing(_call.cid, _call.video);
if (typeof bgNotifyCheck === 'function') {
bgNotifyCheck(_callName() + (_call.video ? ' 邀请你视频通话' : ' 来电了'), Date.now(), {
name: _callName() + (_call.video ? '的视频通话来电' : '的来电'),
av: _callAvatarSrc(),
avFixed: true,
force: true,
callAlert: true,
callTag: _callName(),
cid: _call.cid,
kind: 'call'
});
}
_call.bgWait = !!document.hidden;
_call.timer = setTimeout(() => finishIncoming('miss'), _call.bgWait ? CALL_BG_HOLD_MS : _incRingMs());
}
function _incRingMs() {
const cs = callSettingsOf((_call && _call.cid) || '');
const rMin = Math.max(2, Number(cs.incomingRingMin) || 8);
const rMax = Math.max(rMin, Number(cs.incomingRingMax) || 15);
return (rMin + Math.random() * (rMax - rMin)) * 1000;
}
function answerIncoming(asVideo) {
if (!_call || _call.state !== 'ring-inc') return;
stopRing();
if (asVideo === true && !_call.video) { _call.video = true; if (_call.log) _call.log.mode = 'video'; }
cfSetConnected();
_callMsg('你接听了 ' + _callName() + (_call.video ? ' 的视频通话' : ' 的来电'));
_enterConnected();
}
function rejectIncoming() {
if (!_call || _call.state !== 'ring-inc') return;
stopRing();
_call.state = 'ending';
cfClose();
const nm = _callName();
const _vid = !!_call.video;
_recordCall('reject', 0);
_callMsg('你拒绝了 ' + nm + (_vid ? ' 的视频通话' : ' 的来电'), { outcome: 'reject', durationMs: 0, kind: _vid ? 'video' : 'voice' });
_callClose();
}
function finishIncoming(outcome) {
if (!_call || _call.state !== 'ring-inc') return;
stopRing();
_call.state = 'ending';
cfClose();
const nm = _callName();
const _vid = !!_call.video;
const rec = outcome === 'miss' ? 'miss' : 'cancel';
_recordCall(rec, 0);
_callMsg(outcome === 'miss' ? (nm + (_vid ? ' 的视频通话没接' : ' 的来电没接')) : (nm + (_vid ? ' 的视频通话已结束' : ' 的来电已结束')),
{ outcome: rec, durationMs: 0, kind: _vid ? 'video' : 'voice' });
_callClose();
}
try {
document.addEventListener('visibilitychange', function () {
if (!_call || _call.state !== 'ring-inc') return;
const hidden = document.visibilityState !== 'visible';
if (hidden === !!_call.bgWait) return;
_call.bgWait = hidden;
if (_call.timer) clearTimeout(_call.timer);
_call.timer = setTimeout(() => finishIncoming('miss'), hidden ? CALL_BG_HOLD_MS : _incRingMs());
});
} catch (e) {}
$('#cfAnswerBtn') && $('#cfAnswerBtn').addEventListener('click', () => answerIncoming(false));
$('#cfVideoAnsBtn') && $('#cfVideoAnsBtn').addEventListener('click', () => answerIncoming(true));
$('#cfRejectBtn') && $('#cfRejectBtn').addEventListener('click', rejectIncoming);
$('#cfEndBtn') && $('#cfEndBtn').addEventListener('click', () => endCall('user'));
$('#cfMinBtn') && $('#cfMinBtn').addEventListener('click', cfMinimize);
var VC_EXPRS = {
listen: [
['😊', '笑着听你说'], ['😌', '放松地靠着'], ['🤔', '歪头想了想'], ['😶', '望着你发呆'],
['🙈', '有点不好意思'], ['🫣', '偷偷看你'], ['😴', '困得直点头'], ['😪', '揉了揉眼睛'],
['😑', '一脸无语'], ['🥺', '委屈巴巴'], ['😐', '愣了一下'], ['🙂', '心情不错']
],
talk: [
['😃', '咧嘴笑了'], ['🤭', '捂着嘴笑'], ['😅', '挠了挠头'], ['😤', '鼓起腮帮子'],
['🥰', '眼里有光'], ['😢', '眼眶有点红'], ['😳', '越说越脸红'], ['😋', '说得正起劲']
]
};
var VC_EXPR_RATES = [60, 30, 16, 8, 3];
function _vcExprCfg() {
const d = (typeof defaults !== 'undefined' && defaults && defaults.videoCall) ? defaults.videoCall : {};
const v = (typeof data !== 'undefined' && data && data.videoCall) ? data.videoCall : {};
const num = (x, def, lo, hi) => {
const n = Number(x);
return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : def;
};
return {
mode: ((v.exprMode || d.exprMode) === 'event') ? 'event' : 'auto',
every: num(v.exprEvery, d.exprEvery == null ? 30 : d.exprEvery, 2, 300),
hold: num(v.exprHold, d.exprHold == null ? 6 : d.exprHold, 0, 120),
onConnect: num(v.exprOnConnect, d.exprOnConnect == null ? 100 : d.exprOnConnect, 0, 100),
onMsg: num(v.exprOnMsg, d.exprOnMsg == null ? 50 : d.exprOnMsg, 0, 100),
onReply: num(v.exprOnReply, d.exprOnReply == null ? 60 : d.exprOnReply, 0, 100)
};
}
function _vcExprChance(p) { return Math.random() * 100 < p; }
function _vcExprCooling(cfg) {
return !!(_vc && _vc.exprLast && (Date.now() - _vc.exprLast) < cfg.hold * 1000);
}
function _vcExprSchedule() {
if (!_vc) return;
const cfg = _vcExprCfg();
_vc.exprNext = Date.now() + Math.max(1000, cfg.every * (0.55 + Math.random() * 0.9) * 1000);
}
function _vcAwaitReplyTick() {
if (!_vc) return;
_vc.awaitReply = true;
const cfg = _vcExprCfg();
if (cfg.mode === 'auto' && !_vcExprCooling(cfg) && Math.random() < 0.5) _vcExprRoll('listen');
}
var _vc = null;
var _vcSpeakQ = [];
var _vcSpeaking = false;
var _vcSpeakHold = false;
var _vcQuote = null;
function vcInCall(cid) {
return !!(cid && _vc && _vc.cid === cid);
}
function vcInTail(cid) {
return !!(cid && _vcSinkTail && _vcSinkTail.cid === cid && Date.now() < _vcSinkTail.until);
}
function vcCardNarrow(cid) { return (vcInCall(cid) || vcInTail(cid)) && !(data.videoCall && data.videoCall.cardSend === true); }
function vcKindOn(cid, kind) {
if (!vcInCall(cid)) return true;
const vc = data.videoCall || {};
if (kind === 'sticker') return vc.stickerSend === true;
if (kind === 'image') return vc.imageSend === true;
if (kind === 'voice') return vc.voiceSend === true;
if (kind === 'poke') return vc.pokeSend === true;
return true;
}
function _vcAutoVoiceOn() { return !(data.videoCall && data.videoCall.autoVoice === false); }
function _vcMaxId(msgs) { let mx = 0; for (const m of (msgs || [])) { const n = Number(m && m.id); if (Number.isFinite(n) && n > mx) mx = n; } return mx; }
function _vcFmtTime(sec) { const s = Math.max(0, Math.floor(sec)); return Math.floor(s / 60) + "'" + (s % 60 < 10 ? '0' : '') + (s % 60) + '"'; }
function _vcMsgs() { return (_vc && Array.isArray(_vc.msgs)) ? _vc.msgs : []; }
function vcFastReply(cid) { return !!(typeof _vc !== 'undefined' && _vc && _vc.cid === cid); }
var VC_FILLERS = ['嗯', '嗯…', '等一下', '我在听'];
var _vcFillT = null, _vcFillLast = '';
function vcFillerSay(cid) {
if (!_vc || _vc.cid !== cid) return false;
const pool = VC_FILLERS.filter(t => t !== _vcFillLast);
const text = pool[Math.floor(Math.random() * pool.length)] || VC_FILLERS[0];
clearTimeout(_vcFillT);
_vcFillT = setTimeout(() => {
_vcFillT = null;
if (!_vc || _vc.cid !== cid || !_call || _call.state !== 'connected') return;
const stream = _vcMsgs();
if (!stream) return;
_vcFillLast = text;
stream.push({ id: nextId(), from: 'partner', text, time: time(), date: new Date().toLocaleDateString('zh-CN') });
try { save(); } catch (e) {}
}, 160 + Math.random() * 420);
return true;
}
function cfEnterVideo() {
if (!_call || _call.state !== 'connected' || _vc) return;
_vcMiniLeave();
_vcQuoteClear();
const cid = _callCid();
_callHideDeskPops();
if (data.activeChat !== cid && typeof switchChat === 'function') { try { switchChat(cid, true); } catch (e) {} }
_call.video = true;
if (_call.log) _call.log.mode = 'video';
_vc = { cid, msgs: _callMsgsOf(), lastId: 0, speakFrom: _vcMaxId(_callMsgsOf()), day: '', poll: null, exprT: null, rec: null, emoLog: _vcExprLog(), emoLive: null, emoT: null,
baseExp: null, exprLast: 0, exprNext: 0, awaitReply: false, stickPending: true };
const full = $('#callFull');
full.classList.add('vc-on');
if (typeof applyCallLook === 'function') { try { applyCallLook(); } catch (e) {} }
_vcApplyLook();
const _vcw = $('#vcWrap'); if (_vcw) _vcw.hidden = false;
$('#cfTopl').textContent = '视频通话';
const _vbb = $('#vcBackBtn'); if (_vbb) _vbb.hidden = false;
const _vhb = $('#vcHangBtn'); if (_vhb) _vhb.hidden = false;
$('#vcName').textContent = _callName();
$('#vcTimer').textContent = _callFmt(Date.now() - _call.t0);
_paintCallAvatar();
$('#vcStream').innerHTML = '';
$('#vcInput').value = '';
_vcRecUI();
_vcWakeOn();
const _cfgE = _vcExprCfg();
const _E0 = $('#vcExprE'), _T0 = $('#vcExprT');
if (_E0) _E0.textContent = '';
if (_T0) { _T0.textContent = ''; _T0.classList.remove('is-emo'); }
const _face0 = document.querySelector('#vcWrap .vc-face'); if (_face0) _face0.classList.remove('is-emo');
if (_cfgE.mode === 'event') {
if (_vcExprChance(_cfgE.onConnect)) _vcExprRoll('listen');
} else {
_vcExprRoll('listen');
_vcExprSchedule();
}
_vc.exprT = setInterval(_vcExprTick, 1000);
_vc.poll = setInterval(_vcPoll, 400);
_vcHotEcho();
if (_vcHandsFreeOn()) _vcHotStart();
}
function _vcApplyLook() {
const on = !(data.videoCall && data.videoCall.syncLook === false);
const ownCss = (typeof callLookHasCss === 'function') && callLookHasCss(_vc ? _vc.cid : '');
const s = document.getElementById('vcStream');
if (s) s.classList.add('chat-area');
if (!_vc) return;
try {
if (on && !ownCss) delete document.body.dataset.vcPlain;
else document.body.dataset.vcPlain = 'on';
} catch (e) {}
if (s) s.innerHTML = '';
_vc.lastId = 0; _vc.day = '';
_vc.stickPending = true;
}
function vcLeave() {
const wasCall = _call && _call.state === 'connected';
_vcTeardown();
if (wasCall && _call) cfSetConnected();
}
function _vcTeardown(keepKind) {
_vcMiniLeave();
clearTimeout(_vcFillT); _vcFillT = null; _vcFillLast = '';
if (_vc) {
clearInterval(_vc.poll); clearInterval(_vc.exprT); clearTimeout(_vc.emoT);
_vcStickStop();
if (_vc.rec) _vcRecAbort();
_vcHotStop();
if (!keepKind) _vcSinkTail = { cid: _vc.cid, msgs: _vc.msgs, until: Date.now() + 6000 };
_vc = null;
}
_vcSpeakQ = []; _vcSpeaking = false; _vcSpeakHold = false;
_vcQuoteClear();
_vcSkipNow = null;
_vcWakeOff();
if (typeof mmStop === 'function') { try { mmStop(); } catch (e) {} }
const full = $('#callFull');
if (full) full.classList.remove('vc-on');
const _vcw = $('#vcWrap'); if (_vcw) _vcw.hidden = true;
const tp = $('#cfTopl'); if (tp) tp.textContent = '语音通话';
const _vbb = $('#vcBackBtn'); if (_vbb) _vbb.hidden = true;
const _vhb = $('#vcHangBtn'); if (_vhb) _vhb.hidden = true;
try { delete document.body.dataset.vcPlain; } catch (e) {}
if (_call && !keepKind) _call.video = false;
if (!keepKind) _cfVideoFaceClear();
_vcEmoSheetClose();
}
function _vcExprLog() {
if (!_call) return [];
if (!Array.isArray(_call.exprLog)) _call.exprLog = [];
return _call.exprLog;
}
function _vcExprAt() { return _call ? _callFmt(Math.max(0, Date.now() - _call.t0)) : ''; }
var VC_EMO_TIME_KEY = 'ordinal-vcemo-time';
function _vcEmoTimeMode() {
try { if (localStorage.getItem(VC_EMO_TIME_KEY) === 'call') return 'call'; } catch (e) {}
return 'clock';
}
function _vcEmoClockText(ts) {
const t = Number(ts);
if (!Number.isFinite(t) || t <= 0) return '';
const d = new Date(t), p = n => String(n).padStart(2, '0');
return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}
function _vcEmoTimeText(e) {
if (!e) return '';
const clock = _vcEmoClockText(e.ts);
if (_vcEmoTimeMode() === 'clock') return clock || e.at || '';
return e.at || clock;
}
function _vcEmoTimePaint() {
const m = _vcEmoTimeMode();
document.querySelectorAll('#vcEmoTimeSw .vc-emo-tb').forEach(b => {
const on = b.getAttribute('data-vc-emo-time') === m;
b.setAttribute('aria-pressed', on ? 'true' : 'false');
b.classList.toggle('is-on', on);
});
}
function _vcEmoTimeSet(mode) {
const m = mode === 'call' ? 'call' : 'clock';
try { localStorage.setItem(VC_EMO_TIME_KEY, m); } catch (e) {}
_vcEmoTimePaint();
_vcEmoSheetRender();
}
function _vcExprPush(emoji, words, kind) {
const log = _vcExprLog();
if (!log) return null;
for (const e of log) e.live = false;
const rec = {
emoji: String(emoji || ''), words: String(words || ''),
at: _vcExprAt(), ts: Date.now(), kind: kind === 'emo' ? 'emo' : 'expr',
live: true,
seen: kind !== 'emo'
};
log.push(rec);
if (log.length > 60) log.splice(0, log.length - 60);
const crec = _call && _call.log;
if (crec) {
if (!Array.isArray(crec.exprs)) crec.exprs = [];
crec.exprs.push({ emoji: rec.emoji, words: rec.words, kind: rec.kind, ts: rec.ts });
if (crec.exprs.length > CALL_EXPR_MAX) crec.exprs.splice(0, crec.exprs.length - CALL_EXPR_MAX);
try { save(); } catch (e) {}
}
return rec;
}
function _vcExprRoll(mode) {
if (!_vc) return;
_vcEmoClear();
const pool = VC_EXPRS[(mode === 'listen' || mode === 'talk') ? mode : (_vcSpeaking ? 'talk' : 'listen')] || VC_EXPRS.listen;
const pick = pool[Math.floor(Math.random() * pool.length)];
const E = $('#vcExprE'), T = $('#vcExprT');
if (!E) return;
E.textContent = pick[0];
if (T) { T.textContent = pick[1]; T.classList.remove('is-emo'); }
const face = document.querySelector('#vcWrap .vc-face');
if (face) face.classList.remove('is-emo');
E.classList.remove('flip'); void E.offsetWidth; E.classList.add('flip');
_vc.baseExp = pick;
_vc.exprLast = Date.now();
_vcExprSchedule();
_vcExprPush(pick[0], pick[1], 'expr');
_vcEmoMissRefresh();
}
function _vcExprRestore() {
if (!_vc) return;
const pick = _vc.baseExp;
const E = $('#vcExprE'), T = $('#vcExprT');
if (E) E.textContent = pick ? pick[0] : '';
if (T) { T.textContent = pick ? pick[1] : ''; T.classList.remove('is-emo'); }
const face = document.querySelector('#vcWrap .vc-face');
if (face) face.classList.remove('is-emo');
_vcEmoMissRefresh();
}
function _vcExprIdle() { if (!_vc || _vc.emoLive) return; _vcExprRoll(); }
function _vcExprTick() {
if (!_vc) return;
if (_call && _call.state === 'connected') { const tm = $('#vcTimer'); if (tm) tm.textContent = _callFmt(Date.now() - _call.t0); }
const cfg = _vcExprCfg();
if (cfg.mode !== 'auto') return;
if (!_vc.exprNext) _vcExprSchedule();
if (!_vc.emoLive && Date.now() >= _vc.exprNext) _vcExprIdle();
}
var VC_EMO_HOLD_MS = 4500;
var VC_EMO_EMOJI = {
'喜悦与正向': ['😊', '😄', '🥰', '😌', '😁'],
'亲近与爱意': ['🥰', '💗', '😍', '🫶'],
'悲伤与低落': ['😢', '🥺', '😔', '😞'],
'愤怒与不满': ['😤', '😠', '🙄', '😒'],
'不安与恐惧': ['😟', '😰', '😨', '😣'],
'害羞与社交情绪': ['😳', '🙈', '🫣', '😶'],
'思考与复杂情绪': ['🤔', '🧐', '😯', '🤨'],
'自我情绪': ['😌', '😔', '🥹', '😶'],
'克制与隐藏': ['😐', '😑', '😶', '🫥'],
'中性与日常': ['🙂', '😌', '😶', '😐'],
'特殊表达情绪': ['🥺', '💭', '😊', '😶'],
'_mood': ['🥺', '😊', '😔', '😐'],
'_heart': ['💗', '🫶', '💞', '🤍'],
'_intent': ['💬', '👀', '🙂', '😶']
};
function _vcEmoTags(m) {
if (!m || m.from !== 'partner' || m.recalled) return [];
const all = (typeof _emoLiveIdx === 'function') ? _emoLiveIdx(m) : [];
const gone = Array.isArray(m.emoRetracted) ? m.emoRetracted : [];
return all.filter(o => gone.indexOf(o.i) < 0)
.map(o => ({ k: o.x.k, t: String(o.x.t).trim() })).filter(o => o.t);
}
function _vcEmoGroupOf(word) {
let lib = null;
try { lib = (typeof _emoLib === 'function') ? _emoLib() : null; } catch (e) {}
const gs = (lib && Array.isArray(lib.mood)) ? lib.mood : [];
for (const g of gs) {
if (!g || !Array.isArray(g.c)) continue;
if (g.c.some(c => c && c.t === word)) return g.g || '';
}
if (typeof _emoOwnGroupsOf === 'function') {
for (const g of _emoOwnGroupsOf('mood')) {
if (!g || !Array.isArray(g.c)) continue;
if (g.c.some(c => c && c.t === word)) return g.g || '';
}
}
return '';
}
function _vcEmoPickEmoji(tags) {
const mood = tags.find(x => x.k === 'mood');
let pool = null;
if (mood) pool = VC_EMO_EMOJI[_vcEmoGroupOf(mood.t)] || VC_EMO_EMOJI._mood;
if (!pool && tags.some(x => x.k === 'heart')) pool = VC_EMO_EMOJI._heart;
if (!pool) pool = VC_EMO_EMOJI._intent;
return pool[Math.floor(Math.random() * pool.length)];
}
function _vcFootOn() { return !!(data.videoCall && data.videoCall.footOn === true); }
function _vcEmoStrip(el) {
if (!el) return;
if (_vcFootOn()) return;
for (const sel of ['.msg-foot', '.emo-line', '.emo-recall', '.emo-recall-detail']) {
const ns = el.querySelectorAll(sel);
for (let i = 0; i < ns.length; i++) { try { ns[i].remove(); } catch (e) {} }
}
}
function _vcEmoReact(m) {
if (!_vc) return false;
const tags = _vcEmoTags(m);
if (!tags.length) return false;
const rec = _vcExprPush(_vcEmoPickEmoji(tags), tags.map(x => x.t).join(' · '), 'emo');
if (!rec) return false;
_vcEmoPaint(rec);
return true;
}
function _vcEmoPaint(rec) {
if (!_vc || !rec) return;
for (const e of _vcExprLog()) e.live = (e === rec);
_vc.emoLive = rec;
const E = $('#vcExprE'), T = $('#vcExprT');
if (E) {
E.textContent = rec.emoji;
E.classList.remove('flip'); void E.offsetWidth; E.classList.add('flip');
}
if (T) { T.textContent = rec.words; T.classList.add('is-emo'); }
const face = document.querySelector('#vcWrap .vc-face');
if (face) {
face.classList.add('is-emo');
face.classList.remove('emo-pop'); void face.offsetWidth; face.classList.add('emo-pop');
setTimeout(() => { try { face.classList.remove('emo-pop'); } catch (e) {} }, 620);
}
clearTimeout(_vc.emoT);
_vc.emoT = setTimeout(() => {
if (!_vc) return;
_vcEmoClear();
if (_vcExprCfg().mode === 'event') _vcExprRestore();
else _vcExprRoll();
}, VC_EMO_HOLD_MS);
_vcEmoMissRefresh();
}
function _vcEmoClear() {
if (!_vc) return;
if (_vc.emoT) { clearTimeout(_vc.emoT); _vc.emoT = null; }
if (!_vc.emoLive) return;
_vc.emoLive = null;
for (const e of _vcExprLog()) e.live = false;
_vcEmoMissRefresh();
}
function _vcEmoMissRefresh() {
const b = $('#vcEmoMiss');
if (!b) return;
const log = _vcExprLog();
if (!log || !log.length) { b.hidden = true; return; }
const miss = log.filter(e => e.kind === 'emo' && !e.live && !e.seen).length;
b.hidden = false;
b.textContent = miss ? ('错过的表情 ' + miss + ' ▾') : ('表情 · ' + log.length + ' ▾');
b.classList.toggle('is-new', miss > 0);
}
function _vcEmoSheetRender() {
const list = $('#vcEmoList');
if (!list) return;
const log = _vcExprLog();
if (!log.length) { list.innerHTML = '<p class="vc-emo-empty">这一通里还没有表情</p>'; return; }
list.innerHTML = log.slice().reverse().map(e =>
'<div class="vc-emo-row' + (e.live ? ' is-live' : '') + (e.kind === 'emo' ? ' is-emo' : '') + '">'
+ '<span class="vc-emo-face" aria-hidden="true">' + escapeHTML(e.emoji) + '</span>'
+ (e.kind === 'emo' ? '<span class="vc-emo-kind">情绪</span>' : '')
+ '<span class="vc-emo-words">' + escapeHTML(e.words) + '</span>'
+ '<span class="vc-emo-at">' + escapeHTML(_vcEmoTimeText(e)) + '</span></div>').join('');
}
function _vcEmoSheetOpen() {
const m = $('#vcEmoMask');
if (!m) return;
for (const e of _vcExprLog()) e.seen = true;
_vcEmoTimePaint();
_vcEmoSheetRender();
m.hidden = false;
_vcEmoMissRefresh();
}
function _vcEmoSheetClose() { const m = $('#vcEmoMask'); if (m) m.hidden = true; }
var _vcStickRaf = 0, _vcStickRO = null, _vcStickTarget = null, _vcStickCh = 0;
function _vcSnap() { const l = $('#vcStream'); if (l && l.clientHeight) l.scrollTop = l.scrollHeight; }
function _vcStickLoop() {
const list = $('#vcStream');
if (!list || typeof requestAnimationFrame !== 'function') return;
cancelAnimationFrame(_vcStickRaf);
const endAt = Date.now() + 1500;
let lastH = -1, stable = 0;
const tick = () => {
if (!_vc) return;
if (list.clientHeight) {
list.scrollTop = list.scrollHeight;
const h = list.scrollHeight;
if (h === lastH) { if (++stable >= 3) return; } else { stable = 0; lastH = h; }
}
if (Date.now() > endAt) return;
_vcStickRaf = requestAnimationFrame(tick);
};
_vcStickRaf = requestAnimationFrame(tick);
}
function _vcStickWatch() {
const list = $('#vcStream');
if (!list || typeof ResizeObserver !== 'function') return;
if (!_vcStickRO) {
_vcStickRO = new ResizeObserver(() => {
const ch = list.clientHeight;
const was = _vcStickCh; _vcStickCh = ch;
if (!_vc || !ch) return;
if (was === 0) { list.scrollTop = list.scrollHeight; _vcStickLoop(); }
});
}
if (_vcStickTarget === list) return;
try { _vcStickRO.disconnect(); } catch (e) {}
_vcStickCh = 0;
_vcStickRO.observe(list);
_vcStickTarget = list;
}
function _vcStickNow() { _vcSnap(); _vcStickWatch(); _vcStickLoop(); }
function _vcStickStop() {
cancelAnimationFrame(_vcStickRaf);
if (_vcStickRO) { try { _vcStickRO.disconnect(); } catch (e) {} }
_vcStickTarget = null; _vcStickCh = 0;
}
function _vcPoll() {
if (!_vc) return;
const list0 = $('#vcStream');
if (_vc.stickPending && list0 && list0.clientHeight) { _vc.stickPending = false; _vcStickNow(); }
const stream = _vcMsgs();
const fresh = [];
for (const m of stream) {
const n = Number(m && m.id);
if (Number.isFinite(n) && n > _vc.lastId) fresh.push(m);
}
if (!fresh.length) return;
_vc.lastId = _vcMaxId(stream);
const list = $('#vcStream');
const [miniImg, miniPartner, miniMine] = (typeof getMiniAvatarHTML === 'function') ? getMiniAvatarHTML() : ['', '', ''];
for (const m of fresh) {
try {
if (m.date && m.date !== _vc.day && typeof _buildDaySeparator === 'function') list.appendChild(_buildDaySeparator(m.date));
if (m.date) _vc.day = m.date;
const el = (typeof _buildMessageHTML === 'function') ? _buildMessageHTML(m, miniImg, miniMine, miniPartner, { hideAsr: !_vcAutoTransOn() }) : null;
if (el) { _vcEmoStrip(el); list.appendChild(el); }
} catch (e) {}
}
_vcStickNow();
let emoShown = false;
for (const m of fresh) {
if (!(Number(m && m.id) > (_vc.speakFrom || 0))) continue;
if (!_vcEmoTags(m).length) continue;
if (_vcEmoReact(m)) emoShown = true;
}
const cfgE = _vcExprCfg();
const hasPartner = fresh.some(m => m && m.from === 'partner');
const wasReply = !!(_vc && _vc.awaitReply) && hasPartner;
if (wasReply) _vc.awaitReply = false;
if (!emoShown) {
if (cfgE.mode === 'event') {
if (hasPartner) {
const p = wasReply ? cfgE.onReply : cfgE.onMsg;
if (_vcExprChance(p)) _vcExprRoll(hasPartner ? 'talk' : 'listen');
}
} else if (!_vcExprCooling(cfgE) && Math.random() < 0.6) {
_vcExprRoll(hasPartner ? 'talk' : 'listen');
}
}
if (_vcAutoVoiceOn()) {
let queued = false;
for (const m of fresh) if (Number(m && m.id) > (_vc.speakFrom || 0) && _vcSpeakableMsg(m)) { _vcSpeakQ.push(m); queued = true; }
if (queued) _vcSpeakPump();
}
}
function _vcSpeakableMsg(m) {
if (!m || m.from !== 'partner') return false;
if (m.ask || m.taAsk || m.game || m.deal || m.dv || m.call || m.co || m.invite || m.cardParts) return false;
return true;
}
var _vcSkipNow = null;
function _vcSkipActive() {
if (!_vcSkipNow) return false;
const f = _vcSkipNow; _vcSkipNow = null;
if (typeof mmStop === 'function') { try { mmStop(); } catch (e) {} }
f();
return true;
}
async function _vcPlayOne(url, btn) {
let wake = null;
const fin = new Promise(res => { wake = res; });
_vcSkipNow = () => { if (wake) { const f = wake; wake = null; try { f(); } catch (e) {} } };
const r = await mmPlayURL(url, btn, () => { if (wake) { const f = wake; wake = null; try { f(); } catch (e) {} } }, false);
if (r === 'error') return 'skip';
if (r === 'blocked') return 'blocked';
const bell = setTimeout(() => { if (wake) { const f = wake; wake = null; try { f(); } catch (e) {} } }, 120000);
try { await fin; } finally { clearTimeout(bell); }
return 'ok';
}
async function _vcSpeakOne(m) {
const list = $('#vcStream');
if (!list) return 'skip';
const el = list.querySelector('.message[data-id="' + m.id + '"]');
const face = document.querySelector('#vcWrap .vc-face');
if (el) {
el.classList.add('speaking');
try { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
}
if (face) face.classList.add('speaking');
let ret = 'skip';
try {
if (m.voice || m.tts) {
const btn = list.querySelector('.voice-play[data-voice-play="' + m.id + '"]');
ret = await _vcPlayOne(m.voice || m.tts, btn);
return ret;
}
const words = (typeof mmSpeakable === 'function') ? mmSpeakable(typeof msgLiveText === 'function' ? msgLiveText(m) : m.text) : '';
const owner = (typeof mmOwnerOf === 'function') ? mmOwnerOf(_vc.cid, m.sender) : null;
const timbre = (owner && owner.mmTimbre) ? String(owner.mmTimbre).trim() : '';
if (!words || !timbre || !mmUsable()) return 'skip';
const ownerId = owner ? owner.id : '';
const emo = (typeof mmEmotionOf === 'function') ? mmEmotionOf(m) : '';
const cached = mmLibraryLookup(words, timbre, ownerId, emo);
const url = cached || await mmSynth(words, timbre, emo);
if (cached) _mmCache.set(_mmStamp(words, timbre, emo), cached);
else mmSaveToLibrary(words, timbre, url, owner, emo);
const btn = list.querySelector('[data-speak="' + m.id + '"]');
ret = await _vcPlayOne(url, btn);
return ret;
} catch (e) { return ret; } finally {
_vcSkipNow = null;
if (el) el.classList.remove('speaking');
if (face) face.classList.remove('speaking');
}
}
function _vcSpeakPump() {
if (_vcSpeaking) return;
const m = _vcSpeakQ.shift();
if (!m || !_vc) { _vcSpeakQ = []; return; }
_vcSpeaking = true;
Promise.resolve(_vcSpeakOne(m)).catch(() => 'skip').then(r => {
_vcSpeaking = false;
if (!_vc) { _vcSpeakQ = []; return; }
if (r === 'blocked') {
_vcSpeakQ.unshift(m);
if (!_vcSpeakHold) {
_vcSpeakHold = true;
if (typeof mmOnUnlock === 'function') mmOnUnlock(() => { _vcSpeakHold = false; if (_vc) _vcSpeakPump(); });
}
return;
}
_vcSpeakPump();
});
}
(function _vcStreamBind() {
const list = document.getElementById('vcStream');
if (!list) return;
list.addEventListener('click', e => {
const speak = e.target.closest('[data-speak]');
const vp = e.target.closest('.voice-play');
if (speak || vp) { _vcSpeakQ = []; _vcSkipActive(); }
if (speak && typeof mmTogglePlay === 'function') { mmTogglePlay(speak, speak.getAttribute('data-speak')); return; }
if (vp) {
const id = vp.getAttribute('data-voice-play');
const m = _vcMsgs().find(x => String(x.id) === String(id));
if (m && (m.voice || m.tts) && typeof mmPlayURL === 'function') {
mmPlayURL(m.voice || m.tts, vp);
return;
}
}
if (e.target.closest('button, .ask-opt, .taq-opt, [data-gbtn]')) { showToast('这张卡回聊天页再操作'); return; }
if (e.target.closest('.message.speaking')) _vcSkipActive();
});
})();
var VC_MINI_GAP_MIN = 12, VC_MINI_GAP_MAX = 28;
var VC_MINI_FIRST_MIN = 6, VC_MINI_FIRST_MAX = 14;
var VC_MINI_HOLD_MS = 2200;
var _vcMini = null;
function _vcMiniCfg(cid) { return (typeof callSettingsOf === 'function') ? callSettingsOf(cid || '') : (data.callSettings || {}); }
function _vcMiniOn(cid) {
const cs = _vcMiniCfg(cid);
if (cs.miniVoiceEnable === false) return false;
return Math.max(0, Math.min(100, Number(cs.miniVoiceProb) || 0)) > 0;
}
function _vcMiniVisible() {
if (!_call || _call.state !== 'connected' || !_call.videoMini) return false;
if (document.visibilityState !== 'visible') return false;
if (!$('#callFull').hidden) return false;
const w = $('#callWindow');
return !!(w && !w.hidden);
}
function _vcMiniEnter() {
_vcMiniLeave();
if (!_call || _call.state !== 'connected' || !_call.video) return;
_call.videoMini = true;
_vcMini = { cid: _call.cid, rollT: null, hideT: null, busy: false, last: '' };
_vcMiniSchedule(VC_MINI_FIRST_MIN + Math.random() * (VC_MINI_FIRST_MAX - VC_MINI_FIRST_MIN));
}
function _vcMiniSchedule(sec) {
if (!_vcMini) return;
clearTimeout(_vcMini.rollT);
const s = (typeof sec === 'number') ? sec : (VC_MINI_GAP_MIN + Math.random() * (VC_MINI_GAP_MAX - VC_MINI_GAP_MIN));
_vcMini.rollT = setTimeout(_vcMiniRoll, Math.max(1000, s * 1000));
}
function _vcMiniLeave() {
if (_vcMini) { clearTimeout(_vcMini.rollT); clearTimeout(_vcMini.hideT); }
if (_vcMini && _vcMini.wake) { const w = _vcMini.wake; _vcMini.wake = null; try { w(); } catch (e) {} }
_vcMini = null;
if (_call) _call.videoMini = false;
_vcMiniCaption('');
}
function _vcMiniRoll() {
if (!_vcMini) return;
const at = _vcMini;
if (at.busy || !_vcMiniVisible() || !_vcMiniOn(at.cid)) { _vcMiniSchedule(); return; }
const p = Math.max(0, Math.min(100, Number(_vcMiniCfg(at.cid).miniVoiceProb) || 0));
if (Math.random() * 100 < p) _vcMiniSay();
_vcMiniSchedule();
}
function _vcMiniLine(cid, last) {
const pool = (typeof _categoryCards === 'function') ? _categoryCards('主字卡', cid) : [];
const rest = pool.filter(t => t && t !== last);
const bag = rest.length ? rest : pool;
return bag.length ? bag[Math.floor(Math.random() * bag.length)] : '';
}
function _vcMiniCaption(text, playing) {
const box = $('#cwSay'), tx = $('#cwSayTx');
if (!box || !tx) return;
const t = String(text || '');
if (!t) { box.hidden = true; box.classList.remove('playing'); tx.textContent = ''; return; }
tx.textContent = t;
box.hidden = false;
box.classList.toggle('playing', !!playing);
}
async function _vcMiniSay() {
if (!_vcMini) return;
const at = _vcMini;
const cid = at.cid;
const text = _vcMiniLine(cid, at.last);
if (!text) return;
const words = (typeof mmSpeakable === 'function') ? mmSpeakable(text) : text;
const owner = (typeof mmOwnerOf === 'function') ? mmOwnerOf(cid) : null;
const timbre = (owner && owner.mmTimbre) ? String(owner.mmTimbre).trim() : '';
if (!words || !timbre || !mmUsable()) return;
at.busy = true;
try {
const ownerId = owner ? owner.id : '';
const cached = mmLibraryLookup(words, timbre, ownerId);
const url = cached || await mmSynth(words, timbre);
if (_vcMini !== at) return;
if (cached) _mmCache.set(_mmStamp(words, timbre), cached);
else mmSaveToLibrary(words, timbre, url, owner);
const stream = _callMsgsOf();
if (!stream) return;
stream.push({ id: nextId(), from: 'partner', text: String(text), time: time(), date: new Date().toLocaleDateString('zh-CN') });
at.last = text;
try { save(); } catch (e) {}
_vcMiniCaption(text, true);
await new Promise(res => { at.wake = res; try { mmPlayURL(url, null, () => { at.wake = null; res(); }); } catch (e) { at.wake = null; res(); } });
at.wake = null;
if (_vcMini !== at) return;
_vcMiniCaption(text, false);
clearTimeout(at.hideT);
at.hideT = setTimeout(() => { if (_vcMini === at) _vcMiniCaption(''); }, VC_MINI_HOLD_MS);
} catch (e) {} finally {
if (_vcMini === at) at.busy = false;
}
}
function _vcMsgByDomId(id) {
const list = _vcMsgs();
for (let i = list.length - 1; i >= 0; i--) if (String(list[i] && list[i].id) === String(id)) return list[i];
return null;
}
function _vcQuoteSet(m) {
if (!_vc || !m || m.from === 'system') return false;
const words = (typeof quoteBodyOf === 'function') ? quoteBodyOf(m) : '';
if (!words) return false;
_vcQuote = m;
const tx = $('#vcQuoteTx'), bar = $('#vcQuoteBar');
if (tx) tx.textContent = '引用：' + words;
if (bar) bar.hidden = false;
return true;
}
function _vcQuoteClear() {
_vcQuote = null;
const bar = $('#vcQuoteBar');
if (bar) bar.hidden = true;
}
var _vcPressT = null, _vcPressX = 0, _vcPressY = 0;
function _vcPressEnd() { clearTimeout(_vcPressT); _vcPressT = null; }
$('#vcStream') && $('#vcStream').addEventListener('pointerdown', e => {
const el = e.target && e.target.closest ? e.target.closest('.message[data-id]') : null;
if (!el) return;
_vcPressX = e.clientX; _vcPressY = e.clientY;
_vcPressEnd();
_vcPressT = setTimeout(() => {
_vcPressT = null;
const m = _vcMsgByDomId(el.dataset.id);
if (!m) return;
if (m.from === 'me' && m.asr) {
try { if (navigator.vibrate) navigator.vibrate(8); } catch (e2) {}
_vcEditAsrText(m);
return;
}
if (m && _vcQuoteSet(m)) { try { if (navigator.vibrate) navigator.vibrate(8); } catch (e2) {} }
}, 520);
});
$('#vcStream') && $('#vcStream').addEventListener('pointerup', _vcPressEnd);
$('#vcStream') && $('#vcStream').addEventListener('pointercancel', _vcPressEnd);
$('#vcStream') && $('#vcStream').addEventListener('pointermove', e => {
if (!_vcPressT) return;
if (Math.abs(e.clientX - _vcPressX) > 8 || Math.abs(e.clientY - _vcPressY) > 8) _vcPressEnd();
});
$('#vcQuoteX') && $('#vcQuoteX').addEventListener('click', _vcQuoteClear);
async function _vcSendText() {
if (!_vc) return;
const inp = $('#vcInput');
const text = (inp.value || '').trim();
if (!text) return;
const cid = _vc.cid;
const stream = _vcMsgs();
if (typeof _pendingSweep === 'function') { try { _pendingSweep(); } catch (e) {} }
const msg = { id: nextId(), from: 'me', text, time: time(), date: new Date().toLocaleDateString('zh-CN') };
if (_vcQuote) { const q = (typeof quoteBodyOf === 'function') ? quoteBodyOf(_vcQuote) : ''; if (q) msg.quote = q; }
stream.push(msg);
inp.value = '';
_vcQuoteClear();
await save();
_vcAwaitReplyTick();
if (typeof partnerReply === 'function') partnerReply(cid, text);
}
var VCR_MAX = 60, VCR_MIN = 1;
var VCR_MIMES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', ''];
var _vcRecPending = false;
function _vcRecSupported() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && typeof MediaRecorder !== 'undefined'); }
function _vcKillStream(stream) { try { stream.getTracks().forEach(t => t.stop()); } catch (e) {} }
function vcRecToggle() {
if (!_vc) return;
if (_vcRecPending) return;
if (_vc.rec) { if (_vc.rec.state === 'rec') vcRecStop(); return; }
if (!_vcRecSupported()) { showToast('这个浏览器不能录音'); return; }
const at = _vc;
_vcRecPending = true;
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
_vcRecPending = false;
if (!_vc || _vc !== at) { _vcKillStream(stream); return; }
const mime = VCR_MIMES.filter(x => !x || (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x)))[0] || '';
let rec;
try { rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); }
catch (e) { _vcKillStream(stream); showToast('这个浏览器录不了音'); return; }
const R = _vc.rec = { state: 'rec', rec, chunks: [], mime, stream, t0: Date.now(), timer: null, url: '', dur: 0 };
rec.ondataavailable = e2 => { if (e2.data && e2.data.size) R.chunks.push(e2.data); };
rec.onerror = () => { _vcRecAbort(); showToast('录音没成，再试一次'); };
rec.onstop = () => _vcRecStopDone(R);
try { rec.start(); }
catch (e) { try { R.rec.onstop = null; } catch (e2) {} _vcKillStream(stream); if (_vc && _vc.rec === R) _vc.rec = null; _vcRecUI(); showToast('录音没起来，再点一次'); return; }
R.timer = setInterval(() => { if (_vc && _vc.rec === R) { const t = document.getElementById('vcRecTime'); if (t) t.textContent = _vcFmtTime((Date.now() - R.t0) / 1000); } }, 200);
R.asrOn = (_vcAutoTransOn() && typeof asrBegin === 'function') ? asrBegin() : false;
if (_vcAutoTransOn() && !R.asrOn) _vcAsrExplainOnce();
setTimeout(() => {
if (_vc && _vc.rec === R && R.state === 'rec' && R.rec.state !== 'recording') { _vcRecAbort(); showToast('录音没起来，再点一次'); }
}, 1500);
setTimeout(() => { if (_vc && _vc.rec === R && R.state === 'rec') vcRecStop(); }, VCR_MAX * 1000);
_vcRecUI();
}).catch(e => {
_vcRecPending = false;
const name = (e && e.name) || '';
showToast(name === 'NotAllowedError' || name === 'SecurityError' ? '麦克风没授权：去浏览器的站点设置里允许' : '麦克风用不了：' + ((e && e.message) || '未知原因'));
});
}
function vcRecStop() {
const R = _vc && _vc.rec;
if (!R || R.state !== 'rec') return;
R.state = 'stopping';
clearInterval(R.timer);
if (R.asrOn && typeof asrEnd === 'function') { try { R.asrP = asrEnd(); } catch (e) {} }
try { R.rec.stop(); } catch (e) { _vcRecAbort(); }
}
function _vcRecStopDone(R) {
_vcKillStream(R.stream);
const dur = (Date.now() - R.t0) / 1000;
if (!_vc || _vc.rec !== R) return;
if (dur < VCR_MIN || !R.chunks.length) { _vc.rec = null; _vcRecUI(); showToast('说话时间太短，没发出去'); return; }
const fr = new FileReader();
fr.onload = () => {
if (!_vc || _vc.rec !== R) return;
R.url = String(fr.result || ''); R.dur = dur;
_vcVoiceSend(R);
};
fr.onerror = () => { if (_vc && _vc.rec === R) { _vc.rec = null; _vcRecUI(); } showToast('录音没读出来，再试一次'); };
fr.readAsDataURL(new Blob(R.chunks, { type: R.mime || 'audio/webm' }));
}
function _vcRecAbort() {
if (typeof asrAbort === 'function') { try { asrAbort(); } catch (e) {} }
const R = _vc && _vc.rec;
if (!R) { _vcRecUI(); return; }
clearInterval(R.timer);
try { R.stream.getTracks().forEach(t => t.stop()); } catch (e) {}
if (R.state === 'rec' || R.state === 'stopping') { try { R.rec.onstop = null; R.rec.stop(); } catch (e) {} }
if (_vc) _vc.rec = null;
_vcRecUI();
}
function _vcRecUI() {
const bar = $('#vcRecBar'), row = $('#vcInputBar'), inp = $('#vcInput'), mic = $('#vcMicBtn'), send = $('#vcSendBtn');
if (!bar) return;
const R = _vc && _vc.rec;
if (!R) {
bar.hidden = true;
if (row) row.hidden = false;
if (inp) inp.hidden = false;
if (mic) mic.hidden = false;
if (send) send.hidden = false;
return;
}
if (row) row.hidden = true;
bar.hidden = false;
bar.innerHTML = '<span class="vc-rec-dot" aria-hidden="true"></span><span class="vc-rec-time" id="vcRecTime">0\'00</span>'
+ '<span class="vc-rec-tip">正在录音 · 停止就发送（最长一分钟）</span>'
+ '<button type="button" class="vc-rec-act pri" data-act="stop">停止并发送</button>'
+ '<button type="button" class="vc-rec-act" data-act="cancel">取消</button>';
}
async function _vcPushMyVoice(url, dur, withQuote, asrP) {
if (!_vc || !url) return false;
const cid = _vc.cid;
const msg = { id: nextId(), from: 'me', voice: url, dur: Math.round(dur * 10) / 10, time: time(), date: new Date().toLocaleDateString('zh-CN') };
if (withQuote && _vcQuote) { const q = (typeof quoteBodyOf === 'function') ? quoteBodyOf(_vcQuote) : ''; if (q) msg.quote = q; }
_vcMsgs().push(msg);
if (withQuote) _vcQuoteClear();
await save();
_vcAsrAttach(msg, asrP);
_vcAwaitReplyTick();
if (typeof partnerReply === 'function') partnerReply(cid, '');
return true;
}
function _vcAutoTransOn() {
return !(typeof data !== 'undefined' && data && data.videoCall && data.videoCall.autoTrans === false);
}
async function _vcAsrAttach(msg, asrP) {
if (!msg || !msg.voice || msg.from !== 'me') return;
if (!asrP) return;
if (!_vcAutoTransOn()) return;
let txt = '';
try { txt = await asrP; } catch (e) { txt = ''; }
txt = String(txt || '').trim();
if (!txt) { _vcAsrExplainOnce(); return; }
if (!_vcAutoTransOn()) return;
if (msg.asrEdit) return;
if (msg.text) return;
msg.text = txt;
msg.asr = 'auto';
touchMsgs(_callCid());
touchMsgs(data.activeChat);
try { await save(); } catch (e) {}
_vcPatchMsg(msg);
}
var _vcAsrSaid = false;
function _vcAsrExplainOnce() {
if (_vcAsrSaid) return;
const code = (typeof asrLastError === 'function') ? asrLastError() : '';
if (code === 'no-speech') return;
_vcAsrSaid = true;
let msg = '听写没成功（' + code + '），这一句没转成字';
if (!code || code === 'unsupported') msg = '这个浏览器没有听写接口，语音转不出字（iPhone 的 Safari 就是这样）';
else if (code === 'network') msg = '听写连不上语音服务（Chrome 走的是谷歌那边），这台机器上转不了';
else if (code === 'not-allowed' || code === 'service-not-allowed') msg = '浏览器没给听写权限，语音转不出字';
else if (code === 'audio-capture') msg = '麦克风被占着，这一句没转成字';
showToast(msg);
if (code !== 'audio-capture') {
data.videoCall = data.videoCall || {};
data.videoCall.autoTrans = false;
_vcCfgEcho();
try { flushSave(); } catch (e) {}
_vcRestream();
}
}
function _vcPatchMsg(m) {
if (!_vc || !m) return;
const list = $('#vcStream');
if (!list) return;
const el = [...list.querySelectorAll('.message')].find(x => String(x.dataset.id) === String(m.id));
if (!el) return;
let next = null;
try {
const [miniImg, miniPartner, miniMine] = (typeof getMiniAvatarHTML === 'function') ? getMiniAvatarHTML() : ['', '', ''];
next = _buildMessageHTML(m, miniImg, miniMine, miniPartner, { hideAsr: !_vcAutoTransOn() });
} catch (e) { return; }
if (!next) return;
el.replaceWith(next);
_vcStickNow();
}
function _vcEditAsrText(m) {
if (!m || typeof _openMsgEditSheet !== 'function') return;
_openMsgEditSheet(m, {
title: '改这行字',
note: '这行字是听写出来的，改完就以你写的为准（之后不会再被听写盖掉）。留空＝这一条不留文字，只剩语音。',
allowEmpty: true,
onSaved: () => { _vcPatchMsg(m); }
});
}
function _vcRestream() {
if (!_vc) return;
const s = $('#vcStream');
if (!s) return;
s.innerHTML = '';
_vc.lastId = 0; _vc.day = '';
_vc.stickPending = true;
}
async function _vcVoiceSend(R) {
if (!_vc || !R || !R.url) { _vcRecAbort(); return; }
if (_vc.rec === R) _vc.rec = null;
try { _vcRecUI(); } catch (e) {}
await _vcPushMyVoice(R.url, R.dur, true, R.asrP);
}
var VCR_HOT_SIL = 1200;
var VCR_HOT_MIN = 800;
var VCR_HOT_MAX = 30000;
var VCR_HOT_RMS = 0.02;
var VCR_HOT_BUDGET = 8 * 60 * 1000;
var VCR_HOT_BPS = 24000;
var _vcHot = null;
var _vcHotPending = false;
function _vcHandsFreeOn() { return !!(data.videoCall && data.videoCall.handsFree === true); }
function _vcHotSpeaking() {
if (_vcSpeaking === true) return true;
const face = document.querySelector('#vcWrap .vc-face');
return !!(face && face.classList.contains('speaking'));
}
function _vcHotRms(analyser, buf) {
try {
analyser.getFloatTimeDomainData(buf);
let sum = 0;
for (let i = 0; i < buf.length; i++) { const v = buf[i]; sum += v * v; }
return Math.sqrt(sum / buf.length);
} catch (e) { return 0; }
}
function _vcHotEcho() {
const on = _vcHandsFreeOn();
const box = $('#vcHandsFree'); if (box) box.checked = on;
const mic = $('#vcMicBtn');
if (mic) {
mic.classList.toggle('is-hot', on);
mic.setAttribute('aria-label', on ? '免提中：点一下收起免提' : '按住说话改为点击录音');
mic.title = on ? '免提中：点一下收起免提' : '发语音';
}
}
function _vcHotFail(msg) {
_vcHotStop();
if (data.videoCall) data.videoCall.handsFree = false;
_vcHotEcho();
try { flushSave(); } catch (e) {}
showToast(msg || '免提没开起来');
}
function _vcHotSegStart() {
const H = _vcHot;
if (!H || !_vc) return;
if (H.rec && H.rec.state !== 'inactive') return;
const mime = VCR_MIMES.filter(x => x && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x))[0] || '';
let rec = null;
try { rec = new MediaRecorder(H.stream, Object.assign({ audioBitsPerSecond: VCR_HOT_BPS }, mime ? { mimeType: mime } : {})); }
catch (e) {
try { rec = mime ? new MediaRecorder(H.stream, { mimeType: mime }) : new MediaRecorder(H.stream); }
catch (e2) { H.failAt = Date.now(); return; }
}
H.rec = rec; H.chunks = []; H.mime = rec.mimeType || mime || 'audio/webm';
H.segT0 = Date.now(); H.speech = 0; H.lastVoice = 0; H.voiced = false;
rec.ondataavailable = e => { if (e.data && e.data.size) H.chunks.push(e.data); };
rec.onstop = () => _vcHotCutDone(rec);
try { rec.start(250); } catch (e) { H.rec = null; }
}
function _vcHotDrop() {
const H = _vcHot; if (!H) return;
const rec = H.rec;
H.rec = null; H.chunks = [];
if (!rec) return;
try { rec.onstop = null; if (rec.state !== 'inactive') rec.stop(); } catch (e) {}
}
function _vcHotCutDone(rec) {
const H = _vcHot;
if (!H || H.rec !== rec) return;
const send = rec.__send === true;
const chunks = H.chunks.slice();
const mime = H.mime;
const dur = (Date.now() - H.segT0) / 1000;
H.rec = null; H.chunks = [];
if (!_vc || !send || !chunks.length || dur * 1000 < VCR_HOT_MIN) { if (!H.busy) _vcHotSegStart(); return; }
H.busy = true;
const fr = new FileReader();
fr.onload = () => {
H.busy = false;
if (!_vc || _vcHot !== H) return;
const url = String(fr.result || '');
if (!url) { _vcHotSegStart(); return; }
H.sentMs += dur * 1000;
_vcPushMyVoice(url, dur).then(() => {
if (!_vc || _vcHot !== H) return;
if (H.sentMs >= VCR_HOT_BUDGET) { setVcHandsFree(false, { reason: 'long' }); return; }
_vcHotSegStart();
}).catch(() => { if (_vc && _vcHot === H) _vcHotSegStart(); });
};
fr.onerror = () => { H.busy = false; if (_vc && _vcHot === H) _vcHotSegStart(); };
fr.readAsDataURL(new Blob(chunks, { type: mime || 'audio/webm' }));
}
function _vcHotTick() {
const H = _vcHot;
if (!H || !_vc || H.busy) return;
if (_vcHotSpeaking()) { _vcHotDrop(); return; }
if (H.ctx && H.ctx.state === 'suspended' && Date.now() - (H.resumeAt || 0) > 2000) {
H.resumeAt = Date.now();
try { H.ctx.resume(); } catch (e) {}
}
if (!H.rec) { if (Date.now() - (H.failAt || 0) > 1000) _vcHotSegStart(); return; }
if (H.rec.state === 'inactive') return;
if (H.rec.state !== 'recording') return;
const now = Date.now();
const rms = _vcHotRms(H.analyser, H.buf);
if (rms >= VCR_HOT_RMS) { H.voiced = true; H.lastVoice = now; H.speech += 100; }
const quiet = H.lastVoice ? now - H.lastVoice : 0;
if (H.voiced && H.speech >= VCR_HOT_MIN && quiet >= VCR_HOT_SIL) {
H.rec.__send = true;
try { H.rec.stop(); } catch (e) { _vcHotDrop(); }
return;
}
if (now - H.segT0 >= VCR_HOT_MAX) {
if (H.voiced) { H.rec.__send = true; try { H.rec.stop(); } catch (e) { _vcHotDrop(); } }
else _vcHotDrop();
}
}
async function _vcHotStart() {
if (!_vc || _vcHot || _vcHotPending) return;
if (!_vcRecSupported()) { _vcHotFail('这个浏览器不能录音'); return; }
const AC = window.AudioContext || window.webkitAudioContext;
if (!AC) { _vcHotFail('这个浏览器读不到麦克风的音量，免提用不了'); return; }
const at = _vc;
_vcHotPending = true;
let stream;
try {
stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
} catch (e) {
_vcHotPending = false;
const name = (e && e.name) || '';
_vcHotFail(name === 'NotAllowedError' || name === 'SecurityError' ? '麦克风没授权：去浏览器的站点设置里允许' : '麦克风用不了：' + ((e && e.message) || '未知原因'));
return;
}
_vcHotPending = false;
if (!_vc || _vc !== at || !_vcHandsFreeOn()) { _vcKillStream(stream); return; }
let ctx = null, analyser = null;
try {
ctx = new AC();
const src = ctx.createMediaStreamSource(stream);
analyser = ctx.createAnalyser();
analyser.fftSize = 1024;
src.connect(analyser);
if (ctx.resume) { try { await ctx.resume(); } catch (e) {} }
} catch (e) {
_vcKillStream(stream);
try { if (ctx && ctx.close) ctx.close(); } catch (e2) {}
_vcHotFail('麦克风的音量读不到，免提用不了');
return;
}
const H = _vcHot = { at, stream, ctx, analyser, buf: new Float32Array(analyser.fftSize || 1024),
rec: null, chunks: [], mime: '', segT0: 0, speech: 0, lastVoice: 0, voiced: false,
sentMs: 0, busy: false, timer: null };
H.timer = setInterval(_vcHotTick, 100);
_vcHotEcho();
_vcHotSegStart();
}
function _vcHotStop() {
const H = _vcHot;
if (!H) { _vcHotEcho(); return; }
_vcHot = null;
clearInterval(H.timer);
if (H.rec) { try { H.rec.onstop = null; if (H.rec.state !== 'inactive') H.rec.stop(); } catch (e) {} }
_vcKillStream(H.stream);
try { if (H.ctx && H.ctx.close) H.ctx.close(); } catch (e) {}
_vcHotEcho();
}
async function setVcHandsFree(on, opts) {
const want = !!on;
data.videoCall = data.videoCall || { autoVoice: true, syncLook: true, fillerProb: 18, handsFree: false };
data.videoCall.handsFree = want;
_vcHotEcho();
try { await flushSave(); } catch (e) {}
if (want) {
if (!_vc) return;
_vcHotStart();
showToast('免提开着：停下来说话就自动发出去');
} else {
_vcHotStop();
showToast(opts && opts.reason === 'long'
? '这一通的免提语音已经很长了，先替你关掉免提——想发点一下麦克风'
: '免提关了：点麦克风才录音');
}
}
var _vcWake = null;
async function _vcWakeOn() {
try {
if (!navigator.wakeLock || !navigator.wakeLock.request) return;
_vcWake = await navigator.wakeLock.request('screen');
} catch (e) {}
}
function _vcWakeOff() { try { if (_vcWake) _vcWake.release(); } catch (e) {} _vcWake = null; }
try {
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && _vc) _vcWakeOn(); });
} catch (e) {}
var VC_KIND_UI = [
['#vcStickerSend', 'stickerSend', '表情包'],
['#vcImageSend', 'imageSend', '图片'],
['#vcVoiceSend', 'voiceSend', '语音'],
['#vcPokeSend', 'pokeSend', '拍一拍']
];
function _vcCfgEcho() {
const c = $('#vcAutoVoice');
if (c) c.checked = _vcAutoVoiceOn();
const tr = $('#vcAutoTrans');
if (tr) tr.checked = _vcAutoTransOn();
const s = $('#vcSyncLook');
if (s) s.checked = !(data.videoCall && data.videoCall.syncLook === false);
const fp = $('#vcFillerProb');
if (fp) window.setNumSafe(fp, Math.max(0, Math.min(100, Number(data.videoCall && data.videoCall.fillerProb) || 0)));
const cs = $('#vcCardSend');
if (cs) cs.checked = !!(data.videoCall && data.videoCall.cardSend === true);
const fo = $('#vcFootOn');
if (fo) fo.checked = _vcFootOn();
VC_KIND_UI.forEach(([id, key]) => {
const el = $(id);
if (el) el.checked = !!(data.videoCall && data.videoCall[key] === true);
});
_vcHotEcho();
_vcExprEcho();
}
function _vcExprRateText(sec) {
const s = Number(sec) || 0;
if (s >= 90) return '约 ' + Math.round(s / 60) + ' 分钟';
return '约 ' + Math.round(s) + ' 秒';
}
function _vcExprPaintPanes(cfg) {
const auto = document.getElementById('vcExprAuto');
const ev = document.getElementById('vcExprEvent');
if (auto) auto.hidden = cfg.mode !== 'auto';
if (ev) ev.hidden = cfg.mode !== 'event';
document.querySelectorAll('#vcExprModes [data-vc-expr-mode]').forEach(b => {
const on = b.getAttribute('data-vc-expr-mode') === cfg.mode;
b.classList.toggle('active', on);
b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
const hint = document.getElementById('vcExprHint');
if (hint) {
hint.textContent = cfg.mode === 'event'
? '当前：只在接通、TA 发来消息、TA 回复你时按几率换；平时那张脸一直不动。'
: '当前：平均' + _vcExprRateText(cfg.every) + '换一次；同一张脸至少停 ' + Math.round(cfg.hold) + ' 秒，一串话不会每句都变。';
}
}
function _vcExprEcho() {
const cfg = _vcExprCfg();
_vcExprPaintPanes(cfg);
const q = (id, v) => window.setNumSafe(document.getElementById(id), Math.round(v));
q('vcExprEvery', cfg.every);
q('vcExprHold', cfg.hold);
q('vcExprOnConnect', cfg.onConnect);
q('vcExprOnMsg', cfg.onMsg);
q('vcExprOnReply', cfg.onReply);
document.querySelectorAll('#vcExprRates [data-vc-expr-every]').forEach(b => {
const v = Number(b.getAttribute('data-vc-expr-every'));
const on = Math.abs(v - cfg.every) < 0.5;
b.classList.toggle('active', on);
b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
}
async function _vcExprSet(key, val, opts) {
const cfg = _vcExprCfg();
const o = opts || {};
data.videoCall = data.videoCall || {};
if (key === 'exprMode') {
data.videoCall.exprMode = (val === 'event') ? 'event' : 'auto';
if (_vc) { _vc.awaitReply = false; if (data.videoCall.exprMode === 'auto') _vcExprSchedule(); }
_vcExprEcho();
try { await flushSave(); } catch (e) {}
if (!o.quiet) showToast(data.videoCall.exprMode === 'event' ? '表情只在接通、发消息、回复时换' : '表情会自己换：频率按下面那一档');
return data.videoCall.exprMode;
}
const raw = String(val == null ? '' : val).trim();
let v = (raw === '') ? NaN : Number(raw);
if (!Number.isFinite(v)) {
const dv = (typeof defaults !== 'undefined' && defaults && defaults.videoCall) ? defaults.videoCall[key] : NaN;
v = Number(dv);
}
if (!Number.isFinite(v)) {
const ck = { exprEvery: 'every', exprHold: 'hold', exprOnConnect: 'onConnect', exprOnMsg: 'onMsg', exprOnReply: 'onReply' }[key];
v = (ck && Number.isFinite(cfg[ck])) ? cfg[ck] : 0;
}
if (key === 'exprEvery') v = Math.max(2, Math.min(300, Math.round(v)));
else if (key === 'exprHold') v = Math.max(0, Math.min(120, Math.round(v)));
else v = Math.max(0, Math.min(100, Math.round(v)));
data.videoCall[key] = v;
if (key === 'exprEvery' && _vc && _vcExprCfg().mode === 'auto') _vcExprSchedule();
_vcExprEcho();
try { await flushSave(); } catch (e) {}
if (o.quiet) return v;
if (key === 'exprEvery') showToast('平均' + _vcExprRateText(v) + '换一次表情');
else if (key === 'exprHold') showToast('同一张脸至少停 ' + v + ' 秒');
return v;
}
$('#cfVideoBtn') && $('#cfVideoBtn').addEventListener('click', cfEnterVideo);
$('#vcEmoMiss') && $('#vcEmoMiss').addEventListener('click', _vcEmoSheetOpen);
$('#vcEmoClose') && $('#vcEmoClose').addEventListener('click', _vcEmoSheetClose);
$('#vcEmoMask') && $('#vcEmoMask').addEventListener('click', e => { if (e.target === $('#vcEmoMask')) _vcEmoSheetClose(); });
document.querySelectorAll('#vcEmoTimeSw .vc-emo-tb').forEach(b => {
b.addEventListener('click', () => _vcEmoTimeSet(b.getAttribute('data-vc-emo-time')));
});
$('#vcSyncLook') && $('#vcSyncLook').addEventListener('change', async e => {
data.videoCall = data.videoCall || { autoVoice: true, syncLook: true };
data.videoCall.syncLook = !!e.target.checked;
_vcApplyLook();
try { await flushSave(); } catch (e2) {}
showToast(e.target.checked ? '视频里的气泡会跟聊天气泡 CSS 走' : '视频里用默认气泡：聊天页不受影响');
});
$('#vcAutoVoice') && $('#vcAutoVoice').addEventListener('change', async e => {
data.videoCall = data.videoCall || { autoVoice: true };
data.videoCall.autoVoice = !!e.target.checked;
if (!data.videoCall.autoVoice) {
_vcSpeakQ = []; _vcSpeaking = false; _vcSpeakHold = false;
if (typeof mmStop === 'function') { try { mmStop(); } catch (e2) {} }
}
try { await flushSave(); } catch (e2) {}
showToast(e.target.checked ? 'TA 的消息会自动念出来' : '已关闭自动播放：点气泡上的小喇叭再听');
});
$('#vcAutoTrans') && $('#vcAutoTrans').addEventListener('change', async e => {
data.videoCall = data.videoCall || {};
data.videoCall.autoTrans = !!e.target.checked;
_vcAsrSaid = false;
try { await flushSave(); } catch (e2) {}
_vcRestream();
showToast(e.target.checked ? '已开启：用手机自带听写转成文字（免费）' : '已关闭：语音不再转文字，也不显示那些字');
});
$('#vcFillerProb') && $('#vcFillerProb').addEventListener('change', async e => {
const raw = String(e.target.value || '').trim();
const v = (raw === '') ? 18 : Math.max(0, Math.min(100, Math.round(Number(raw))));
const p = Number.isFinite(v) ? v : 18;
data.videoCall = data.videoCall || { autoVoice: true, syncLook: true, fillerProb: 18 };
data.videoCall.fillerProb = p;
e.target.value = String(p);
try { await flushSave(); } catch (e2) {}
showToast(p > 0 ? ('TA 会先应一声的几率：' + p + '%') : '已关掉：TA 不再先应一声');
});
$('#vcBackBtn') && $('#vcBackBtn').addEventListener('click', () => { vcLeave(); });
$('#vcHandsFree') && $('#vcHandsFree').addEventListener('change', e => { setVcHandsFree(!!e.target.checked); });
$('#vcCardSend') && $('#vcCardSend').addEventListener('change', async e => {
data.videoCall = data.videoCall || {};
data.videoCall.cardSend = !!e.target.checked;
try { await flushSave(); } catch (e2) {}
showToast(e.target.checked ? '视频通话里 TA 可以发卡片了' : '视频通话里不发卡片：只有字卡与语音');
});
$('#vcFootOn') && $('#vcFootOn').addEventListener('change', async e => {
data.videoCall = data.videoCall || {};
data.videoCall.footOn = !!e.target.checked;
try { await flushSave(); } catch (e2) {}
if (_vc) {
const s = $('#vcStream');
if (s) s.innerHTML = '';
_vc.lastId = 0; _vc.day = ''; _vc.stickPending = true;
}
showToast(e.target.checked ? '视频通话里显示气泡下方的注脚' : '视频通话里不显示气泡下方的注脚');
});
VC_KIND_UI.forEach(([sel, key, label]) => {
const el = $(sel);
if (!el) return;
el.addEventListener('change', async e => {
data.videoCall = data.videoCall || {};
data.videoCall[key] = !!e.target.checked;
try { await flushSave(); } catch (e2) {}
showToast(e.target.checked ? ('视频通话里 TA 可以发' + label + '了') : ('视频通话里 TA 不再发' + label));
});
});
document.querySelectorAll('#vcExprModes [data-vc-expr-mode]').forEach(b => {
b.addEventListener('click', () => _vcExprSet('exprMode', b.getAttribute('data-vc-expr-mode')));
});
document.querySelectorAll('#vcExprRates [data-vc-expr-every]').forEach(b => {
b.addEventListener('click', () => _vcExprSet('exprEvery', Number(b.getAttribute('data-vc-expr-every'))));
});
[['vcExprEvery', 'exprEvery'], ['vcExprHold', 'exprHold'], ['vcExprOnConnect', 'exprOnConnect'],
['vcExprOnMsg', 'exprOnMsg'], ['vcExprOnReply', 'exprOnReply']].forEach(([id, key]) => {
const el = document.getElementById(id);
if (!el) return;
el.addEventListener('change', async e => {
const v = await _vcExprSet(key, String(e.target.value || '').trim(), { quiet: true });
e.target.value = String(v);
});
});
CALL_RESUME_HOSTS.forEach(sel => {
const el = $(sel);
if (el) el.addEventListener('change', e => { setCallResumeOnReload(!!e.target.checked); });
});
$('#vcMicBtn') && $('#vcMicBtn').addEventListener('click', () => {
if (_vcHandsFreeOn()) { setVcHandsFree(false); return; }
vcRecToggle();
});
$('#vcSendBtn') && $('#vcSendBtn').addEventListener('click', _vcSendText);
$('#vcInput') && $('#vcInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); _vcSendText(); } });
$('#vcHangBtn') && $('#vcHangBtn').addEventListener('click', () => endCall('user'));
$('#vcRecBar') && $('#vcRecBar').addEventListener('click', e => {
const b = e.target.closest('[data-act]');
if (!b || !_vc || !_vc.rec) return;
const act = b.dataset.act;
if (act === 'stop') vcRecStop();
else if (act === 'cancel') _vcRecAbort();
});
var CL_TAB_KEY = 'ordinal-calllog-tab';
var CL_TABS = [['all', '全部'], ['voice', '语音'], ['video', '视频']];
var CL_OUT = { answer: '接通', reject: '已拒绝', miss: '未接', busy: '忙线', cancel: '已取消', drop: '异常结束' };
var _clTab = 'all';
var _clOpened = {};
var _clExOpened = {};
var _clVoice = {};
var _clCards = {};
var _clAudio = null, _clAudioBtn = null;
function _clTabOf() {
try {
const v = localStorage.getItem(CL_TAB_KEY);
if (v === 'voice' || v === 'video' || v === 'all') return v;
} catch (e) {}
return 'all';
}
function _clPad(n) { return String(n).padStart(2, '0'); }
function _clWhen(ms) {
const d = new Date(Number(ms) || Date.now());
if (!isFinite(d.getTime())) return '';
return _clPad(d.getMonth() + 1) + '-' + _clPad(d.getDate()) + ' ' + _clPad(d.getHours()) + ':' + _clPad(d.getMinutes());
}
function _clTimeOf(m) { return String((m && m.time) || ''); }
function _clStopAudio() {
if (_clAudio) { try { _clAudio.pause(); } catch (e) {} }
_clAudio = null;
if (_clAudioBtn) {
_clAudioBtn.classList.remove('playing');
_clAudioBtn.textContent = '▶';
_clAudioBtn = null;
}
}
function _clMsgText(m) {
if (!m) return '';
if (m.recalled) return '（撤回了一条消息）';
const t = String(m.text || '');
if (m.voice || m.tts) return t;
if (m.video) return t || '';
const card = (typeof _msgCardCap === 'function') ? _msgCardCap(m) : '';
if (card) return t && t !== '[表情包]' ? t + ' · ' + card : card;
if (m.sticker && (!t || t === '[表情包]')) return '';
return t;
}
function _clMsgRow(rec, m, nameOf) {
const who = m.from === 'me' ? '我' : (m.from === 'system' ? '·' : 'TA');
const cls = m.from === 'me' ? ' me' : (m.from === 'system' ? ' sys' : '');
const at = _clTimeOf(m);
const voiceUrl = m.voice || m.tts;
let inner = '';
if (voiceUrl) {
const key = rec.id + ':' + m.id;
_clVoice[key] = { url: voiceUrl, cap: String(m.text || '') };
const dur = Math.max(0, Math.round(Number(m.dur) || 0));
inner = '<span class="cl-voice"><button type="button" class="cl-vplay" data-cl-voice="' + escapeHTML(key) + '" aria-label="播放这条语音">▶</button>'
+ (dur ? '<span class="cl-vdur">' + dur + '″</span>' : '<span class="cl-vdur">语音</span>')
+ (_clMsgText(m) ? '<span>' + escapeHTML(screenSafeText(_clMsgText(m))) + '</span>' : '')
+ '</span>';
} else {
const txt = _clMsgText(m);
const isImg = !!(m.sticker || m.imgs || m.video) && (!txt || txt === '[表情包]');
if (isImg) {
const kind = m.video ? '视频' : (m.imgKind === 'image' || m.imgs ? '图片' : '表情包');
inner = '<span class="cl-tag">' + kind + '</span>';
} else if (m.dv) {
const key = rec.id + ':' + m.id;
_clCards[key] = { dv: m.dv, who: nameOf, cid: rec.cid };
const cap = (typeof dvBriefOf === 'function') ? dvBriefOf(m.dv) : '牌面';
inner = '<button type="button" class="cl-dvcard" data-cl-card="' + escapeHTML(key) + '">'
+ '<span class="cl-dvcard-t">占卜 · ' + escapeHTML(screenSafeText(cap)) + '</span>'
+ '<span class="cl-dvcard-c">看牌面 ›</span></button>';
} else {
inner = escapeHTML(screenSafeText(txt || ''));
}
}
if (!inner) return '';
return '<div class="cl-row' + cls + '"><span class="cl-who">' + who + '</span><div class="cl-bub">' + inner + '</div>'
+ (at ? '<span class="cl-at">' + escapeHTML(at) + '</span>' : '') + '</div>';
}
function _clGreetRows(rec) {
const gs = Array.isArray(rec.greet) ? rec.greet : [];
if (!gs.length) return '';
const rows = gs.map((g, i) => {
const key = rec.id + ':g' + i;
const url = (g.tts && typeof mmVoiceByStamp === 'function') ? mmVoiceByStamp(rec.cid, g.tts) : '';
if (url) _clVoice[key] = { url, cap: String(g.text || '') };
const txt = String(g.text || g.name || '语音') || '语音';
return '<div class="cl-grow"><span class="cl-who">TA</span><div class="cl-bub">'
+ (url ? '<span class="cl-voice"><button type="button" class="cl-vplay" data-cl-voice="' + escapeHTML(key) + '" aria-label="重播这句">▶</button></span>' : '')
+ escapeHTML(screenSafeText(txt)) + '</div></div>';
}).join('');
return '<div class="cl-greet"><div class="cl-gh">接通语音</div>' + rows + '</div>';
}
function _clExprRows(rec) {
const ex = (rec && Array.isArray(rec.exprs)) ? rec.exprs : [];
const runs = [];
for (const e of ex) {
if (!e) continue;
const emoji = String(e.emoji || ''), words = String(e.words || '');
if (!emoji && !words) continue;
const kind = e.kind === 'emo' ? 'emo' : 'expr';
const last = runs[runs.length - 1];
if (last && last.emoji === emoji && last.words === words && last.kind === kind) { last.n++; continue; }
runs.push({ emoji, words, kind, n: 1, ts: Number(e.ts) || 0 });
}
if (!runs.length) return '';
const on = _clExOpened[rec.id] ? ' is-open' : '';
const rows = runs.map(r =>
'<div class="cl-exrow' + (r.kind === 'emo' ? ' is-emo' : '') + '">'
+ '<span class="cl-exface" aria-hidden="true">' + escapeHTML(r.emoji) + '</span>'
+ (r.kind === 'emo' ? '<span class="cl-extag">情绪</span>' : '')
+ '<span class="cl-exwords">' + escapeHTML(r.words) + '</span>'
+ (r.n > 1 ? '<span class="cl-exn">×' + r.n + '</span>' : '')
+ '<span class="cl-exat">' + escapeHTML((typeof _vcEmoClockText === 'function') ? _vcEmoClockText(r.ts) : '') + '</span>'
+ '</div>').join('');
return '<div class="cl-exs' + on + '">'
+ '<button type="button" class="cl-exh" data-cl-exfold="' + escapeHTML(String(rec.id)) + '" aria-expanded="' + (on ? 'true' : 'false') + '">'
+ '<span class="cl-exh-t">这一通的表情 · ' + ex.length + '</span>'
+ '<span class="cl-exh-ar" aria-hidden="true"><svg viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.5 6.5 7l-5 5.5"/></svg></span>'
+ '</button>'
+ '<div class="cl-exb">' + rows + '</div>'
+ '</div>';
}
function renderCallLog() {
_clTab = _clTabOf();
const list = document.getElementById('callLogList');
if (!list) return;
_clStopAudio();
_clVoice = {};
_clCards = {};
const all = Array.isArray(data.callLogs) ? data.callLogs.slice().reverse() : [];
const recs = _clTab === 'all' ? all : all.filter(r => (r.mode === 'video') === (_clTab === 'video'));
const chips = document.getElementById('clChips');
if (chips) {
chips.innerHTML = CL_TABS.map(([k, label]) => {
const n = k === 'all' ? all.length : all.filter(r => (r.mode === 'video') === (k === 'video')).length;
const on = k === _clTab ? ' on' : '';
return '<button type="button" class="fchip' + on + '" data-cl-tab="' + k + '">' + label + (n ? ' ' + n : '') + '</button>';
}).join('');
}
if (!recs.length) {
list.innerHTML = '<div class="cl-empty">' + (all.length ? '这一档还没有通话记录' : '还没有通话记录<br>打通一次，这一页就记下来了') + '</div>';
return;
}
if (!Object.keys(_clOpened).length) _clOpened[recs[0].id] = true;
_listPageFill(list, recs.map(rec => {
const c = (data.contacts || []).find(x => x && x.id === rec.cid) || null;
const nm = (c && typeof chatNameOf === 'function' && chatNameOf(c)) || (c && (c.chatName || c.name)) || '已删除的联系人';
const avSrc = (c && typeof chatAvatarOf === 'function' && chatAvatarOf(c)) || '';
const av = avSrc ? '<img src="' + escapeHTML(avSrc) + '" alt="">' : escapeHTML(String(nm).slice(0, 1) || '?');
const mode = rec.mode === 'video' ? '视频' : '语音';
const out = CL_OUT[rec.outcome] || (rec.open ? '通话中' : '');
const dur = Number(rec.durationMs) > 0 ? _callFmt(rec.durationMs) : '';
const bad = rec.outcome === 'reject' || rec.outcome === 'miss' || rec.outcome === 'busy' || rec.outcome === 'cancel' || rec.outcome === 'drop';
const rows = (rec.msgs || []).map(m => _clMsgRow(rec, m, nm)).filter(Boolean).join('');
const greet = _clGreetRows(rec);
const exprs = _clExprRows(rec);
const body = (greet || rows || exprs)
? '<div class="clg-tx">' + greet + rows + exprs + '</div>'
: '<div class="clg-tx"><div class="cl-row sys"><span class="cl-who">·</span><div class="cl-bub">这一通没有留下内容</div></div></div>';
const open = _clOpened[rec.id] ? ' is-open' : '';
return '<article class="cl-rec' + open + '" data-cl-rec="' + escapeHTML(String(rec.id)) + '">'
+ '<button type="button" class="cl-rhead" data-cl-fold="' + escapeHTML(String(rec.id)) + '" aria-expanded="' + (open ? 'true' : 'false') + '">'
+ '<span class="cl-rav">' + av + '</span>'
+ '<span class="cl-rmain"><span class="cl-rname">' + escapeHTML(nm)
+ '<span class="cl-mode' + (rec.mode === 'video' ? ' video' : '') + '">' + mode + '通话</span></span>'
+ '<span class="cl-rsub">' + escapeHTML(_clWhen(rec.startAt))
+ (out ? ' · <span class="cl-out' + (bad ? ' bad' : '') + '">' + out + '</span>' : '')
+ (dur ? ' · ' + dur : '') + '</span></span>'
+ '<span class="cl-ar" aria-hidden="true"><svg viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 1.5 6.5 7l-5 5.5"/></svg></span>'
+ '</button>'
+ '<div class="cl-body">' + body + '</div>'
+ '</article>';
}), (n, t) => `已显示 ${n} / ${t} 通 · 继续滚动加载`);
}
(function _clBind() {
const chips = document.getElementById('clChips');
if (chips) chips.addEventListener('click', e => {
const b = e.target.closest('[data-cl-tab]');
if (!b) return;
const v = b.dataset.clTab;
if (v !== 'voice' && v !== 'video' && v !== 'all') return;
try { localStorage.setItem(CL_TAB_KEY, v); } catch (e2) {}
_clTab = v;
renderCallLog();
});
const list = document.getElementById('callLogList');
if (!list) return;
list.addEventListener('click', e => {
const exf = e.target.closest('[data-cl-exfold]');
if (exf) {
const box = exf.closest('.cl-exs');
const on = !(box && box.classList.contains('is-open'));
if (box) box.classList.toggle('is-open', on);
exf.setAttribute('aria-expanded', on ? 'true' : 'false');
_clExOpened[exf.dataset.clExfold] = on;
return;
}
const fold = e.target.closest('[data-cl-fold]');
if (fold) {
const id = fold.dataset.clFold;
const art = fold.closest('.cl-rec');
const on = !(art && art.classList.contains('is-open'));
if (art) art.classList.toggle('is-open', on);
fold.setAttribute('aria-expanded', on ? 'true' : 'false');
_clOpened[id] = on;
if (!on) _clStopAudio();
return;
}
const cb = e.target.closest('[data-cl-card]');
if (cb) {
const c = _clCards[cb.dataset.clCard];
if (c && c.dv && typeof dvOpenRec === 'function') dvOpenRec(c.dv, (c.who || 'TA') + ' 抽的', false, { cid: c.cid || '', lines: [] });
return;
}
const vb = e.target.closest('[data-cl-voice]');
if (!vb) return;
const row = _clVoice[vb.dataset.clVoice];
if (!row || !row.url) { if (typeof showToast === 'function') showToast('这段语音不在字卡库里了'); return; }
if (_clAudioBtn === vb && _clAudio && !_clAudio.paused) { _clStopAudio(); return; }
_clStopAudio();
let a;
try { a = new Audio(row.url); } catch (err) { if (typeof showToast === 'function') showToast('这段录音放不出来'); return; }
_clAudio = a; _clAudioBtn = vb;
vb.classList.add('playing'); vb.textContent = '■';
a.onended = _clStopAudio;
a.onerror = () => { _clStopAudio(); if (typeof showToast === 'function') showToast('这段录音放不出来'); };
const p = a.play();
if (p && p.catch) p.catch(() => { _clStopAudio(); if (typeof showToast === 'function') showToast('浏览器不让自动播，再点一次试试'); });
});
})();
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['call'] = true;
/* 模块加载（页面刷新/闪退重进后预加载）后，若有未结束的通话记录就弹恢复弹窗 */
try { _callRecoveryCheck(); } catch (e) {}
