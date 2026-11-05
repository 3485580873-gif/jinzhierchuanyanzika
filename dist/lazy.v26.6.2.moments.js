// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
var _momentInterval = null;
/* 发布＝必须立刻落盘，不能等 save() 那 1.2 秒防抖：iOS 上点完发布就切走/被冻结，
 * 定时器还没跑到，主库里从来没写过这条。收据同步进 localStorage，主库确认后才撤。 */
function _pubPut(kind, cid, rec) {
try { if (typeof pubGuardPut === 'function' && rec && rec.id != null) pubGuardPut(kind, cid, rec); } catch (e) {}
}
function _pubFlush() {
try { if (typeof saveNow === 'function') { saveNow(); return; } } catch (e) {}
try { save(); } catch (e) {}
}
var _momentComposer = { mode: 'publish', momentId: null, commentId: null, imgs: [], sticker: '' };
var _mmCmtDraft = null;
var _mmCmtStkItems = [];
var _mmFilter = 'all';
var _mmBucket = 'all';
var _mmCmtOpen = {};
var _mmShown = {};
var _mmStkFor = null;
var _mmStkCur = '';
var _mmStkItems = [];
var _mmPick = null;
var MM_RENDER_CAP = 200;
var MM_CMT_PREVIEW = 2;
var MM_MAX_IMGS = 9;
var MM_NOTICE_MAX = 100;
function _mmCfg(cid) {
const base = Object.assign({}, (defaults && defaults.momentsSettings) || {});
Object.assign(base, (data && data.momentsSettings) || {});
const one = cid && data && data.momentsBy && data.momentsBy[cid];
return (one && typeof one === 'object') ? Object.assign(base, one) : base;
}
function _mmSet(cid, patch) {
if (!data.momentsBy) data.momentsBy = {};
const cur = (data.momentsBy[cid] && typeof data.momentsBy[cid] === 'object') ? data.momentsBy[cid] : {};
const next = Object.assign({}, cur);
Object.keys(patch).forEach(k => { if (patch[k] === null) delete next[k]; else next[k] = patch[k]; });
if (Object.keys(next).length) data.momentsBy[cid] = next; else delete data.momentsBy[cid];
save();
}
function _mmBh(cid) { return (data.chatSettings && data.chatSettings[cid]) || data.behavior; }
function _mmPeople() { return (data.contacts || []).filter(c => c && c.id && c.kind !== 'group'); }
function _mmWallOverride(who) {
if (!who || who === 'me') return { cover: data.momentsCover || '', avatar: data.momentsAvatar || '', name: data.momentsName || '' };
return Object.assign({ cover: '', avatar: '', name: '' }, (data.momentWalls || {})[who] || {});
}
function _mmChatFace(who) {
if (!who || who === 'me') return { name: chatMyName() || (data.me && data.me.name) || '我', avatar: chatMyAvatar() || (data.me && data.me.avatar) || '' };
const c = (data.contacts || []).find(x => x && x.id === who);
if (c) return { name: fixedNameOf(c), avatar: chatAvatarOf(c) };
return { name: (data.profile && data.profile.name) ? data.profile.name : TA_FALLBACK_NAME, avatar: '' };
}
function _mmWallOf(who) {
const o = _mmWallOverride(who), f = _mmChatFace(who);
return { cover: o.cover, avatar: o.avatar || f.avatar, name: o.name || f.name };
}
function _mmViewWho() { return _mmFilter === 'me' || _mmFilter === 'all' ? 'me' : _mmFilter; }
function _mmViewWall() { return _mmWallOf(_mmViewWho()); }
function _mmWallSet(who, patch) {
if (!who || who === 'me') {
Object.keys(patch || {}).forEach(k => {
const v = patch[k];
if (k === 'cover') data.momentsCover = v || '';
else if (k === 'avatar') data.momentsAvatar = v || '';
else if (k === 'name') data.momentsName = String(v || '').trim();
});
save();
return;
}
if (!data.momentWalls) data.momentWalls = {};
const cur = (data.momentWalls[who] && typeof data.momentWalls[who] === 'object') ? data.momentWalls[who] : {};
const next = Object.assign({}, cur);
Object.keys(patch).forEach(k => { if (patch[k]) next[k] = patch[k]; else delete next[k]; });
if (Object.keys(next).length) data.momentWalls[who] = next; else delete data.momentWalls[who];
save();
}
function _mmFaceRepaint() { _momentsKey = ''; renderMoments(); }
function momentPool(category, cid) {
return (data.groups || []).filter(g => g.category === category && groupUsableFor(g, cid)).flatMap(g => (g.cards || []).filter(c => !cardIsOff(g, c) && cardText(c))).map(cardText);
}
function momentRand(min, max) { return min + Math.random() * (max - min); }
function momentPick(arr) { return arr.length ? arr[Math.floor(Math.random() * arr.length)] : ''; }
function momentName(author) { return _mmWallOf(author).name; }
function momentAvatar(author) { return _mmWallOf(author).avatar; }
function _mmAgo(ts) {
if (typeof ts !== 'number' || !isFinite(ts)) return '';
const d = Date.now() - ts;
if (d < 0) return '刚刚';
if (d < 6e4) return '刚刚';
if (d < 36e5) return Math.floor(d / 6e4) + ' 分钟前';
if (d < 864e5) return Math.floor(d / 36e5) + ' 小时前';
if (d < 1728e5) return '昨天';
if (d < 6048e5) return Math.floor(d / 864e5) + ' 天前';
const dt = new Date(ts);
return (dt.getMonth() + 1) + ' 月 ' + dt.getDate() + ' 日';
}
function _mmBucketKey(ts) {
if (typeof ts !== 'number' || !isFinite(ts)) return 'older';
const now = new Date(), d = new Date(ts);
const day = 864e5;
if (Date.now() - ts < 7 * day) return 'week';
const sameYear = d.getFullYear() === now.getFullYear();
if (!sameYear && (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()) >= 7) return 'older';
return 'm:' + d.getFullYear() + '-' + d.getMonth();
}
function _mmBucketLabel(key, ts) {
if (key === 'week') return '本周';
if (key === 'older') return '更早';
const d = new Date(ts);
return (d.getMonth() + 1) + ' 月' + (d.getFullYear() === new Date().getFullYear() ? '' : ' · ' + d.getFullYear());
}
function composeMomentText(cid) {
const s = _mmCfg(cid);
const base = momentPool('主字卡', cid);
if (!base.length) return null;
const minN = Math.max(1, Number(s.minCardsInMoment) || 4);
const maxN = Math.max(minN, Number(s.maxCardsInMoment) || 15);
const n = Math.floor(momentRand(minN, maxN + 1));
const parts = [];
for (let i = 0; i < n; i++) parts.push(base[Math.floor(Math.random() * base.length)]);
let text = pyJoinCards(parts, _mmBh(cid));
if (Math.random() * 100 < (Number(s.useKaomojiProb) || 0)) { const k = momentPick(momentPool('颜文字', cid)); if (k) text += ' ' + k; }
if (Math.random() * 100 < (Number(s.useEmojiProb) || 0)) { const e = momentPick(momentPool('emoji', cid)); if (e) text += ' ' + e; }
const imgs = [];
const ps = partnerStickers(cid);
if (Math.random() * 100 < (Number(s.useStickerProb) || 0) && ps.length) imgs.push(momentPick(ps));
const pis = partnerImages(cid);
if (Math.random() * 100 < (Number(s.useImageProb) || 0) && pis.length) imgs.push(momentPick(pis));
return { text, imgs };
}
var MM_CMT_FALLBACK = ['嗯嗯', '好呀', '我知道啦', '我也这么觉得', '被你发现了', '记下了', '哈哈', '那你呢'];
function composeComment(cid) {
const s = _mmCfg(cid);
const base = momentPool('主字卡', cid);
let text = '';
if (base.length) {
const multi = Math.random() * 100 < (Number(s.multiCardProbability) || 60);
const n = multi ? Math.max(1, Math.floor(momentRand(1, Math.max(2, Number(s.maxCardsInComment) || 4) + 1))) : 1;
const parts = [];
for (let i = 0; i < n; i++) parts.push(base[Math.floor(Math.random() * base.length)]);
text = pyJoinCards(parts, _mmBh(cid));
}
if (!text) {
const _pl = (typeof presetSayList === 'function') ? presetSayList('评论的话') : null;
text = momentPick(_pl && _pl.length ? _pl : MM_CMT_FALLBACK);
}
const c = { text };
const ps = partnerStickers(cid);
if (Math.random() * 100 < (Number(s.useStickerInComment) || 0) && ps.length) c.sticker = momentPick(ps);
if (!c.sticker && Math.random() * 100 < (Number(s.useImageInComment) || 0)) {
const pis = partnerImages(cid);
if (pis.length) c.sticker = momentPick(pis);
}
if (Math.random() * 100 < (Number(s.useKaomojiInComment) || 0)) {
const km = momentPick(momentPool('颜文字', cid)); if (km) c.text += ' ' + km;
}
if (Math.random() * 100 < (Number(s.useEmojiInComment) || 0)) {
const em = momentPick(momentPool('emoji', cid)); if (em) c.text += ' ' + em;
}
return c;
}
function todayCountMoments(cid) {
const key = new Date().toLocaleDateString('zh-CN');
return (data.moments || []).filter(m => m.author === cid && m.date === key).length;
}
function nextMomentTimestamp(cid) {
const s = _mmCfg(cid);
const minW = Math.max(1, Number(s.minPublishIntervalMin) || 90);
const maxW = Math.max(minW, Number(s.maxPublishIntervalMin) || 480);
return Date.now() + momentRand(minW, maxW) * 60000;
}
function _mmTomorrowAt() {
const next = new Date();
next.setDate(next.getDate() + 1);
next.setHours(8 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);
return next.getTime();
}
function addMoment(author, content) {
if (!Array.isArray(data.moments)) data.moments = [];
const now = Date.now();
const m = {
id: nextId(),
author,
text: content.text || '',
imgs: (content.imgs || []).filter(v => typeof v === 'string' && v).slice(0, MM_MAX_IMGS),
video: typeof content.video === 'string' && content.video ? content.video : '',
vposter: typeof content.vposter === 'string' && content.vposter ? content.vposter : '',
vdur: Number(content.vdur) || 0,
ts: now,
time: time(),
date: new Date(now).toLocaleDateString('zh-CN'),
likes: [],
comments: []
};
if (m.video) m.imgs = [];
data.moments.push(m);
if (m.author === 'me') {
const at = mainChatId();
const p = Number(_mmCfg(at).taCollectProb) || 0;
if (p > 0 && typeof maybeCollectByTa === 'function') maybeCollectByTa({ kind: 'feed', text: m.text || '', imgs: m.imgs.slice(), fby: 'me' }, p, at);
}
if (m.author !== 'me' && typeof avlibFeed === 'function' && typeof AV_HEAT_MOMENT !== 'undefined') avlibFeed(m.author, AV_HEAT_MOMENT, 'moment');
return m;
}
function maybeMomentTick() {
if (!isSchedulerLeader()) return;
flushMomentReactions();
if (!data._nextMomentAtBy || typeof data._nextMomentAtBy !== 'object') data._nextMomentAtBy = {};
const people = _mmPeople();
const now = Date.now();
let touched = false;
for (const c of people) {
const cid = c.id;
const s = _mmCfg(cid);
if (typeof data._nextMomentAtBy[cid] !== 'number') { data._nextMomentAtBy[cid] = now + momentRand(120, 600) * 1000; touched = true; continue; }
const at = data._nextMomentAtBy[cid];
if (now < at) continue;
if (now - at > _SCHED_GRACE_MS) {
const fresh = (now - at) < 24 * 3600 * 1000 && !nightOn(at);
data._nextMomentAtBy[cid] = fresh ? now + momentRand(15, 70) * 1000 : nextMomentTimestamp(cid);
touched = true; continue;
}
data._nextMomentAtBy[cid] = now + 10 * 60000;
touched = true;
if (s.postEnabled === false) { data._nextMomentAtBy[cid] = nextMomentTimestamp(cid); continue; }
if (typeof nightOn === 'function' && nightOn()) { data._nextMomentAtBy[cid] = nextMomentTimestamp(cid); continue; }
const daily = Math.max(0, Number(s.dailyMaxMoments) || 0);
if (daily > todayCountMoments(cid) && Math.random() * 100 < Math.max(0, Number(s.publishProbability) || 0)) {
const content = composeMomentText(cid);
if (content) {
const m = addMoment(cid, content);
renderMoments();
notifyMomentActivity('post', Object.assign({ momentId: m.id }, content), cid);
_deliverToChat({ id: nextId(), from: 'system', text: momentName(cid) + ' 发了一条朋友圈 · 点开看', moment: m.id }, cid);
}
}
if (daily <= todayCountMoments(cid)) {
data._nextMomentAtBy[cid] = _mmTomorrowAt();
} else {
data._nextMomentAtBy[cid] = nextMomentTimestamp(cid);
const cooldown = Math.max(0, Number(s.publishCooldownMin) || 0) * 60000;
if (data._nextMomentAtBy[cid] - Date.now() < cooldown) data._nextMomentAtBy[cid] = Date.now() + cooldown;
}
}
if (touched) save();
}
function startMomentsScheduler() {
if (_momentInterval) return;
maybeMomentTick();
_momentInterval = setInterval(maybeMomentTick, 30 * 1000);
}
function pauseMomentsScheduler() {
if (_momentInterval) { clearInterval(_momentInterval); _momentInterval = null; }
}
function resumeMomentsScheduler() {
maybeMomentTick();
if (!_momentInterval) _momentInterval = setInterval(maybeMomentTick, 30 * 1000);
}
(function _mmSchReconcile() {
const go = () => { if (window.__mmSchPaused) pauseMomentsScheduler(); else startMomentsScheduler(); };
if (typeof data !== 'undefined' && data) { go(); return; }
document.addEventListener('ordinal-data-ready', go, { once: true });
})();
var _momentPopupTimer = null;
function addMomentNotice(kind, by, momentId) {
if (!Array.isArray(data.momentNotices)) data.momentNotices = [];
data.momentNotices.push({ id: nextId(), kind, by: by || 'partner', at: Date.now(), momentId: momentId || null, seen: false });
while (data.momentNotices.length > MM_NOTICE_MAX) data.momentNotices.shift();
save();
}
function momentNoticesUnread() { return (data.momentNotices || []).filter(n => n && !n.seen).length; }
function momentsUnreadTotal() { return momentNoticesUnread(); }
function markNoticesSeen() {
let changed = false;
(data.momentNotices || []).forEach(n => { if (n && !n.seen) { n.seen = true; changed = true; } });
if (changed) { save(); renderMomentNotices(); }
}
var _MOMENT_NOTIFY_MAP = { post: '发了一条新朋友圈', like: '赞了你的朋友圈', comment: '评论了你的朋友圈', reply: '回复了你的评论', returnlike: '回赞了你', resticker: '在配图上贴了一张贴纸' };
function _momentNoticeText(n) {
const who = momentName(n.by);
const act = _MOMENT_NOTIFY_MAP[n.kind] || '有了新动静';
const m = n.momentId != null ? _findMoment(n.momentId) : null;
const say = m ? String(m.text || '').slice(0, 30) : '';
return who + ' ' + act + (say ? '：' + say : '');
}
function _findMoment(id) { return (data.moments || []).find(m => String(m.id) === String(id)); }
function notifyMomentActivity(type, content, cid) {
const by = cid || mainChatId();
updateHomeIndex();
const s = _mmCfg(by);
addMomentNotice(type, by, content && content.momentId ? content.momentId : null);
if (s.momentPopup !== false && typeof bgNotifyCheck === 'function') {
const act = _MOMENT_NOTIFY_MAP[type] || '有了新动静';
const say = content && content.text ? screenSafeText(String(content.text)) : '';
bgNotifyCheck(momentName(by) + act + (say ? '：' + say.slice(0, 40) : ''), Date.now(), {
name: momentName(by), kind: 'feed', cid: by, src: 'moment'
});
}
if (s.momentPopup === false) return;
if (typeof deskPopSrcOn === 'function' && !deskPopSrcOn('moment')) return;
const popup = $('#momentPopup');
if (!popup) return;
const avatar = $('#momentPopupAvatar');
if (avatar) {
const src = momentAvatar(by);
avatar.innerHTML = src ? '<img src="' + escapeHTML(src) + '" alt="">' : avatarHTML(src, momentName(by));
}
const name = $('#momentPopupName'); if (name) name.textContent = momentName(by);
const act = $('#momentPopupAction'); if (act) act.textContent = _MOMENT_NOTIFY_MAP[type] || '';
const preview = $('#momentPopupPreview');
const txt = content && content.text ? content.text : '';
if (preview) {
if (txt) { preview.hidden = false; preview.textContent = txt; }
else { preview.hidden = true; preview.textContent = ''; }
}
popup.hidden = false;
popup.classList.remove('moment-popup-hide');
clearTimeout(_momentPopupTimer);
_momentPopupTimer = setTimeout(() => { popup.classList.add('moment-popup-hide'); }, 4000);
if (document.body.dataset.view === 'moments') renderMomentNotices();
}
function hideMomentPopup() {
clearTimeout(_momentPopupTimer);
const popup = $('#momentPopup'); if (popup) { popup.classList.add('moment-popup-hide'); }
}
function _mmToggleLike(momentId, who) {
const m = _findMoment(momentId);
if (!m) return false;
if (!Array.isArray(m.likes)) m.likes = [];
const had = m.likes.indexOf(who) >= 0;
m.likes = had ? m.likes.filter(a => a !== who) : m.likes.concat([who]);
save();
return !had;
}
function addLike(momentId, author) { if (_mmToggleLike(momentId, author)) renderMoments(); }
function addComment(momentId, author, content, replyTo) {
const m = _findMoment(momentId);
if (!m) return null;
if (!Array.isArray(m.comments)) m.comments = [];
const c = { id: nextId(), author, text: content.text || '', sticker: content.sticker || '', ts: Date.now(), time: time(), replyTo: replyTo || null };
m.comments.push(c);
save();
renderMoments();
return c;
}
function _queueMomentReaction(kind, delayMs, momentId, commentId, text, author) {
if (!Array.isArray(data._momentReactions)) data._momentReactions = [];
data._momentReactions.push({ at: Date.now() + Math.max(0, delayMs), kind, momentId, commentId: commentId || null, text: typeof text === 'string' ? text : undefined, author: author || 'partner' });
if (data._momentReactions.length > 50) data._momentReactions.splice(0, data._momentReactions.length - 50);
save();
}
function flushMomentReactions() {
const q = data._momentReactions;
if (!Array.isArray(q) || !q.length) return;
const now = Date.now();
const due = q.filter(x => x && typeof x.at === 'number' && x.at <= now);
if (!due.length) return;
data._momentReactions = q.filter(x => !(x && typeof x.at === 'number' && x.at <= now));
for (const item of due) {
const who = item.author || 'partner';
if (item.kind === 'like') {
if (!_findMoment(item.momentId)) continue;
_mmToggleLike(item.momentId, who);
notifyMomentActivity('like', { momentId: item.momentId }, who);
} else if (item.kind === 'comment') {
if (!_findMoment(item.momentId)) continue;
const c = composeComment(who);
if (c.text || c.sticker) {
c.momentId = item.momentId;
addComment(item.momentId, who, c);
notifyMomentActivity('comment', c, who);
}
} else if (item.kind === 'reply') {
const m = _findMoment(item.momentId);
const cmt = m && (m.comments || []).some(c => String(c.id) === String(item.commentId));
if (!m || !cmt) continue;
const c = composeComment(who);
if (c.text || c.sticker) {
c.momentId = item.momentId;
addComment(item.momentId, who, c, item.commentId);
notifyMomentActivity('reply', c, who);
}
} else if (item.kind === 'returnlike') {
const mine = (data.moments || []).filter(mm => mm.author === 'me').reverse().find(mm => !(mm.likes || []).includes(who));
if (mine) {
_mmToggleLike(mine.id, who);
notifyMomentActivity('returnlike', { momentId: mine.id }, who);
}
} else if (item.kind === 'resticker' || item.kind === 'sticker') {
const m = _findMoment(item.momentId);
if (!m) continue;
if (!Array.isArray(m.stickers)) m.stickers = [];
const p = _mmTaStickerPick(who);
if (!p) continue;
const dress = Math.random() < 0.5;
const sv = dress ? Math.round((0.7 + Math.random() * 0.8) * 100) / 100 : 1;
const rv = dress ? Math.round((Math.random() * 44 - 22) * 10) / 10 : 0;
m.stickers.push({ src: p.src, emoji: p.emoji, x: 4 + Math.random() * 92, y: 6 + Math.random() * 88, s: sv, r: rv, by: who });
notifyMomentActivity(item.kind, { momentId: m.id }, who);
} else if (item.kind === 'selfnote') {
if (!_findMoment(item.momentId)) continue;
if (item.text) addComment(item.momentId, who, { text: item.text });
}
}
save();
if (document.body.dataset.view === 'moments') renderMoments();
}
function schedulePartnerReactions(momentId) {
_mmPeople().forEach(c => {
const s = _mmCfg(c.id);
const likeProb = Math.max(0, Math.min(100, Number(s.likeProbability) || 0));
if (Math.random() * 100 < likeProb) {
const d = momentRand(Math.max(1, Number(s.likeMinSec) || 2), Math.max(1, Number(s.likeMaxSec) || 120)) * 1000;
_queueMomentReaction('like', d, momentId, null, undefined, c.id);
}
const cmtProb = Math.max(0, Math.min(100, Number(s.taCommentOnMyPostProbability) || 0));
if (Math.random() * 100 < cmtProb) {
const d = momentRand(Math.max(1, Number(s.commentMinSec) || 2), Math.max(1, Number(s.commentMaxSec) || 120)) * 1000;
_queueMomentReaction('comment', d, momentId, null, undefined, c.id);
}
const stkProb = Math.max(0, Math.min(100, Number(s.taStickerProbability) || 0));
if (stkProb > 0 && Math.random() * 100 < stkProb && _mmStickerable(_findMoment(momentId))) {
const d = momentRand(Math.max(1, Number(s.taStickerMinSec) || 2), Math.max(1, Number(s.taStickerMaxSec) || 120)) * 1000;
_queueMomentReaction('sticker', d, momentId, null, undefined, c.id);
}
});
}
function scheduleCommentResponse(momentId) {
const m = _findMoment(momentId);
const who = m && m.author;
if (!who || who === 'me') return;
_mmQueueOne('comment', who, momentId, null, 'commentProbability', 'commentMinSec', 'commentMaxSec');
}
function scheduleReplyResponse(momentId, myReplyId, replyToCommentId) {
const m = _findMoment(momentId);
const target = m && (m.comments || []).find(c => String(c.id) === String(replyToCommentId));
const who = target && target.author;
if (!who || who === 'me') return;
_mmQueueOne('reply', who, momentId, myReplyId, 'replyProbability', 'replyMinSec', 'replyMaxSec');
}
function _mmQueueOne(kind, cid, momentId, commentId, probKey, minKey, maxKey) {
const s = _mmCfg(cid);
const prob = Math.max(0, Math.min(100, Number(s[probKey]) || 0));
if (Math.random() * 100 >= prob) return;
const d = momentRand(Math.max(1, Number(s[minKey]) || 2), Math.max(1, Number(s[maxKey]) || 120)) * 1000;
_queueMomentReaction(kind, d, momentId, commentId, undefined, cid);
}
function scheduleReturnLike(cid) {
const s = _mmCfg(cid);
const prob = Math.max(0, Math.min(100, Number(s.returnLikeProbability) || 0));
if (Math.random() * 100 < prob) {
const d = momentRand(Math.max(1, Number(s.likeMinSec) || 2), Math.max(1, Number(s.likeMaxSec) || 120)) * 1000;
_queueMomentReaction('returnlike', d, null, null, undefined, cid);
}
}
function scheduleStickerReply(momentId) {
const m = _findMoment(momentId);
const who = m && m.author;
if (!who || who === 'me') return;
_mmQueueOne('resticker', who, momentId, null, 'stickerReplyProbability', 'stickerReplyMinSec', 'stickerReplyMaxSec');
}
function _mmCoverFit() { return data.momentsCoverFit === 'cover' ? 'cover' : 'contain'; }
function _mmCoverPos() { const n = Number(data.momentsCoverPosY); return isFinite(n) ? Math.max(0, Math.min(100, n)) : 50; }
function _mmCoverPaint(cover) {
const el = cover || $('#momentsCover'); if (!el) return;
const fit = _mmCoverFit();
el.dataset.coverFit = fit;
el.style.backgroundPosition = fit === 'cover' ? ('center ' + _mmCoverPos() + '%') : 'center';
}
function _mmCoverEcho() {
const fit = _mmCoverFit();
document.querySelectorAll('#mmSetSheet [data-mm-fit]').forEach(b => {
const on = b.dataset.mmFit === fit;
b.classList.toggle('on', on);
b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
const row = $('#mmCoverPosRow'); if (row) row.hidden = fit !== 'cover';
const pos = $('#mmCoverPos'); if (pos) pos.value = String(_mmCoverPos());
const val = $('#mmCoverPosVal'); if (val) val.textContent = _mmCoverPos() + '%';
}
function renderMomentsCover() {
const cover = $('#momentsCover'); if (!cover) return;
const w = _mmViewWall();
const has = !!w.cover;
cover.hidden = false;
cover.classList.toggle('mm-cover-default', !has);
cover.style.backgroundImage = has ? `url("${escapeHTML(w.cover)}")` : '';
_mmCoverPaint(cover);
const hint = $('#mcHint'); if (hint) hint.hidden = has;
const av = $('#mcAvatarImg');
if (av) {
const src = w.avatar;
av.innerHTML = src ? `<img src="${escapeHTML(src)}" alt="头像">` : avatarHTML('', w.name);
}
const nm = $('#mcName'); if (nm) nm.textContent = w.name;
const bk = $('#mcBackBtn'); if (bk) bk.hidden = _mmFilter === 'all';
}
function _bindMomentsCoverUI() {
let _mmPickWho = null;
const armPick = (input, who) => { if (input) { _mmPickWho = who; input.click(); } };
const bindPick = (input, maxEdge, key) => {
if (!input) return;
input.addEventListener('change', async e => {
const f = e.target.files && e.target.files[0];
e.target.value = '';
if (!f) return;
const d = await fileData(f, maxEdge);
if (!d) return;
_mmWallSet(_mmPickWho || _mmScopeWho(), key === 'cover' ? { cover: d } : { avatar: d });
_mmPickWho = null;
await save();
_mmFaceRepaint();
renderMomentsSettings();
});
};
const scopeWho = () => _mmScopeWho();
bindPick($('#momentsCoverInput'), (typeof _bgUploadEdge === 'function' ? _bgUploadEdge() : 1440), 'cover');
bindPick($('#momentsAvatarInput'), 400, 'avatar');
const on = (sel, fn) => { const el = $(sel); if (el) el.addEventListener('click', fn); };
on('#mcSetCover', () => armPick($('#momentsCoverInput'), scopeWho()));
on('#mcSetAvatar', () => armPick($('#momentsAvatarInput'), scopeWho()));
on('#mcClearCover', () => { _mmWallSet(scopeWho(), { cover: '' }); _mmFaceRepaint(); renderMomentsSettings(); });
on('#mcClearAvatar', () => { _mmWallSet(scopeWho(), { avatar: '' }); _mmFaceRepaint(); renderMomentsSettings(); });
on('#mcAvatarBtn', () => armPick($('#momentsAvatarInput'), _mmViewWho()));
const cov = $('#momentsCover');
if (cov) cov.addEventListener('click', e => {
if (e.target.closest('#mcAvatarBtn')) return;
armPick($('#momentsCoverInput'), _mmViewWho());
});
const sheet = $('#mmSetSheet');
if (sheet) sheet.addEventListener('click', e => {
const b = e.target.closest('[data-mm-fit]');
if (!b) return;
data.momentsCoverFit = b.dataset.mmFit === 'cover' ? 'cover' : 'contain';
save();
renderMomentsCover();
_mmCoverEcho();
});
const posIn = $('#mmCoverPos');
if (posIn) {
posIn.addEventListener('input', () => {
const n = Number(posIn.value);
data.momentsCoverPosY = isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 50;
const val = $('#mmCoverPosVal'); if (val) val.textContent = data.momentsCoverPosY + '%';
renderMomentsCover();
});
posIn.addEventListener('change', () => { save(); _mmCoverEcho(); });
}
if (cov) {
let drag = null, swallowClick = 0;
cov.addEventListener('touchstart', e => {
if (_mmCoverFit() !== 'cover') { drag = null; return; }
const t = e.touches[0];
drag = { x: t.clientX, y: t.clientY, p: _mmCoverPos(), t0: Date.now(), on: false };
}, { passive: true });
cov.addEventListener('touchmove', e => {
if (!drag) return;
const t = e.touches[0];
const dy = t.clientY - drag.y, dx = t.clientX - drag.x;
if (!drag.on) {
if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { drag = null; return; }
if (Math.abs(dy) < 8 || Date.now() - drag.t0 < 450) return;
drag.on = true;
showToast('上下拖动，挑封面露出的位置');
}
if (e.cancelable) e.preventDefault();
const h = cov.getBoundingClientRect().height || 1;
data.momentsCoverPosY = Math.max(0, Math.min(100, Math.round(drag.p - dy / h * 100)));
renderMomentsCover();
}, { passive: false });
const stopDrag = () => {
if (drag && drag.on) { save(); _mmCoverEcho(); swallowClick = Date.now() + 400; }
drag = null;
};
cov.addEventListener('touchend', stopDrag, { passive: true });
cov.addEventListener('touchcancel', stopDrag, { passive: true });
cov.addEventListener('click', e => {
if (Date.now() < swallowClick) { e.preventDefault(); e.stopPropagation(); }
}, true);
}
}
_bindMomentsCoverUI();
var _momentsKey = '';
function _mmMediaHtml(m, imgs) {
const stks = _mmStickersOf(m);
const cmtN = (m.comments || []).length;
const stkN = _mmStickersOf(m).length;
const picking = _mmPicking(m);
const vid = (typeof m.video === 'string') ? m.video : '';
if (!imgs.length && !vid && !stks.length && !picking) return '';
if (vid) {
const v = `<span class="mp-video"><video${videoAttrs(vid, m.vposter)} controls playsinline preload="metadata"></video></span>`;
return `<div class="mp-photos mm-has-video${picking ? ' mm-picking' : ''}">${v}${_mmStkHtml(stks)}</div>`;
}
const n = Math.min(imgs.length, MM_MAX_IMGS);
const cells = imgs.slice(0, n).map(src => `<span class="mp-cell"><img src="${escapeHTML(src)}" alt="图片"></span>`).join('');
const cls = imgs.length ? `mp-photos count-${Math.min(n, 3)}` : 'mp-photos mm-blank';
return `<div class="${cls}${picking ? ' mm-picking' : ''}">${cells}${_mmStkHtml(stks)}</div>`;
}
function _mmPicking(m) { return !!(_mmPick && String(_mmPick.id) === String(m.id)); }
function _mmStkHtml(list) {
return list.map((s, i) => {
const inner = s.src ? `<img src="${escapeHTML(s.src)}" alt="贴纸">` : `<b>${escapeHTML(s.emoji)}</b>`;
const sv = (typeof s.s === 'number' && isFinite(s.s)) ? s.s : 1;
const rv = (typeof s.r === 'number' && isFinite(s.r)) ? s.r : 0;
const tf = (sv !== 1 || rv !== 0) ? `;transform:translate(-50%,-50%) scale(${sv}) rotate(${rv}deg)` : '';
return s.by === 'me'
? `<button type="button" class="mm-stk" data-stk="${i}" style="left:${s.x}%;top:${s.y}%${tf}" aria-label="查看这张贴纸">${inner}</button>`
: `<span class="mm-stk" style="left:${s.x}%;top:${s.y}%${tf}">${inner}</span>`;
}).join('');
}
function _mmStkPool() {
const out = [], seen = {};
const add = (n, items) => {
const keep = items.filter(it => {
const k = it.emoji ? 'e' + it.emoji : it.src;
if (!k || seen[k]) return false;
seen[k] = 1;
return true;
});
if (keep.length) out.push({ n, items: keep });
};
add('最近', (data.stickerRecent || []).slice(0, 12).filter(v => typeof v === 'string' && v).map(src => ({ src })));
(data.stickerGroups || []).forEach(g => add('我的 · ' + (g.name || '未分组'), (g.imgs || []).filter(Boolean).map(src => ({ src }))));
add('我的', (data.stickers || []).filter(Boolean).map(src => ({ src })));
const isImg = g => g.category === '表情包' || g.category === '图片';
const owner = g => {
if (cardScope(g) === 'public') return '';
const c = (data.contacts || []).find(x => x && x.id === g.contactId);
return c ? (fixedNameOf(c) || '未命名') : '还没绑给谁';
};
const gs = {};
(data.groups || []).forEach(g => {
if (g.off || !isImg(g)) return;
const rows = (g.cards || []).filter(c => !cardIsOff(g, c)).map(cardImage).filter(Boolean).map(src => ({ src }));
const o = owner(g), k = (o ? o + ' · ' : '') + (g.name || '未分组');
if (rows.length) gs[k] = (gs[k] || []).concat(rows);
});
Object.keys(gs).forEach(k => add(k, gs[k]));
add('emoji 贴纸', (data.groups || []).filter(g => !g.off && g.category === 'emoji')
.flatMap(g => (g.cards || []).filter(c => !cardIsOff(g, c)).map(cardText).filter(Boolean))
.map(t => ({ emoji: t })));
add('我的 emoji', ((data.myText && data.myText.emoji) || [])
.flatMap(g => (g && g.items) || []).filter(t => typeof t === 'string' && t).map(t => ({ emoji: t })));
return out;
}
function _mmLikesLine(m) {
const likes = (m.likes || []);
if (!likes.length) return '';
const mine = likes.includes('me');
const others = likes.filter(a => a !== 'me');
if (!mine) return `<div class="mp-likes">${escapeHTML(_mmNameList(others))} 赞了</div>`;
if (!others.length) return `<div class="mp-likes">你赞了</div>`;
return `<div class="mp-likes">你和${escapeHTML(_mmNameList(others))} 赞了</div>`;
}
function _mmNameList(authors) {
const names = authors.map(a => momentName(a));
return names.length > 3 ? names.slice(0, 3).join('、') + ' 等其他人' : names.join('、');
}
function _mmCmtBarHtml(m, replyTo) {
const d = _mmCmtDraft;
if (!d || String(d.mid) !== String(m.id)) return '';
const ph = replyTo ? '回复 ' + momentName(replyTo.author) + '…' : '评论…';
const pv = d.sticker
? `<div class="mp-cmt-pv"><span class="mp-cmt-pvc"><img src="${escapeHTML(d.sticker)}" alt=""><button type="button" class="mp-cmt-pvx" data-cmt-rmstk aria-label="移除这张图">×</button></span></div>`
: '<div class="mp-cmt-pv" hidden></div>';
return `<div class="mp-cmt-bar" data-cmt-bar="${escapeHTML(String(m.id))}">
      ${pv}
      <div class="mp-cmt-row">
        <button type="button" class="mp-cmt-ico" data-cmt-sticker aria-label="表情包"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/><circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9.5" r="1" fill="currentColor" stroke="none"/></svg></button>
        <button type="button" class="mp-cmt-ico" data-cmt-image aria-label="图片"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5-9 9"/></svg></button>
        <textarea class="mp-cmt-in" rows="1" maxlength="500" placeholder="${escapeHTML(ph)}">${escapeHTML(d.text || '')}</textarea>
        <button type="button" class="mp-cmt-send" data-cmt-send>发送</button>
        <button type="button" class="mp-cmt-x" data-cmt-close aria-label="取消">×</button>
      </div>
      <div class="mp-cmt-stk" hidden></div>
    </div>`;
}
function _mmCommentsLine(m) {
const cs = (m.comments || []);
const draft = _mmCmtDraft && String(_mmCmtDraft.mid) === String(m.id) ? _mmCmtDraft : null;
const topBar = draft && !draft.cid ? _mmCmtBarHtml(m, null) : '';
if (!cs.length && !topBar) return '';
const collapsed = !_mmCmtOpen[m.id] && cs.length > MM_CMT_PREVIEW;
const cut = collapsed ? cs.length - MM_CMT_PREVIEW : 0;
const rows = cs.slice(cut).map(c => {
const who = momentName(c.author);
const reply = c.replyTo ? (() => { const r = cs.find(x => String(x.id) === String(c.replyTo)); return r ? `<i>回复 ${escapeHTML(momentName(r.author))}</i>` : ''; })() : '';
const body = (c.sticker ? `<img class="mp-cimg" src="${escapeHTML(c.sticker)}" alt="表情包">` : '') + escapeHTML(screenSafeText(c.text || ''));
const ago = _mmAgo(c.ts);
const when = (ago && ago !== '刚刚') ? `<span class="mp-cwhen">${escapeHTML(ago)}</span>` : '';
const row = `<div class="mp-cmt" data-cid="${c.id}"><span class="mp-cwho">${escapeHTML(who)}</span>${reply}<span class="mp-ctx">${body}</span>${when}<button type="button" class="mp-creply" data-comment-btn="${m.id}" aria-label="回复 ${escapeHTML(who)}">回复</button></div>`;
const bar = draft && draft.cid && String(draft.cid) === String(c.id) ? _mmCmtBarHtml(m, c) : '';
return row + bar;
}).join('');
const more = draft ? '' : (collapsed
? `<button type="button" class="mp-cmore" data-cmore="${m.id}">查看全部 ${cs.length} 条评论</button>`
: (cut === 0 && cs.length > MM_CMT_PREVIEW ? `<button type="button" class="mp-cmore" data-cmore="${m.id}">只看最近 ${MM_CMT_PREVIEW} 条</button>` : ''));
return `<div class="mp-comments">${rows}${more}${topBar}</div>`;
}
function _mmPostHtml(m) {
const name = momentName(m.author);
const liked = (m.likes || []).includes('me');
const imgs = _mmImgsOf(m);
const text = screenSafeText(m.text);
const cap = escapeHTML(text);
const cmtN = (m.comments || []).length;
const stkN = _mmStickersOf(m).length;
const picking = _mmPicking(m);
const acts = `<div class="mp-acts">
      <button type="button" class="mp-act${liked ? ' on' : ''}" data-like="${m.id}" aria-label="${liked ? '取消赞' : '赞'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-9.3-9A5.3 5.3 0 0112 6.4a5.3 5.3 0 019.3 5.6c-1.8 4.3-9.3 9-9.3 9z"/></svg><span>赞</span></button>
      <button type="button" class="mp-act" data-comment-btn="${m.id}" aria-label="评论"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z"/><circle cx="8.5" cy="10.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="10.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.5" cy="10.5" r="1.2" fill="currentColor" stroke="none"/></svg><span>评论</span>${cmtN ? `<span class="mp-act-n">${cmtN}</span>` : ''}</button>
      <button type="button" class="mp-act${picking ? ' on' : ''}" data-sticker="${m.id}" aria-label="贴纸"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0"/><circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9.5" r="1" fill="currentColor" stroke="none"/></svg><span>贴纸</span>${stkN ? `<span class="mp-act-n">${stkN}</span>` : ''}</button>
      <span class="mp-acts-end">
        <button type="button" class="mp-act${_mmCollected(m) ? ' on' : ''}" data-collect="${m.id}" aria-label="${_mmCollected(m) ? '取消收藏' : '收藏'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11a1 1 0 011 1v16l-6.5-4-6.5 4v-16a1 1 0 011-1z"/></svg><span>收藏</span></button>
        <button type="button" class="mp-act mp-del" data-del="${m.id}" aria-label="删除这条动态"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
      </span>
    </div>`;
return `<div class="moment-post" data-mid="${m.id}">
      <div class="mp-top"><span class="mp-av" data-who="${escapeHTML(m.author)}" role="button" aria-label="看 ${escapeHTML(name)} 的全部">${avatarHTML(momentAvatar(m.author), name)}</span><span class="mp-nm"><b data-who="${escapeHTML(m.author)}">${escapeHTML(name)}</b><span class="mp-when">${escapeHTML(_mmAgo(_mmTs(m)))}</span></span></div>
      ${text ? `<div class="mp-cap"><span class="mp-cap-t">${cap}</span></div>` : ''}
      ${picking ? `<div class="mm-pick-bar"><span>点配图上的位置放下这张贴纸</span><button type="button" data-stk-cancel>取消</button></div>` : ''}
      ${_mmMediaHtml(m, imgs)}
      ${acts}
      ${_mmLikesLine(m)}
      ${_mmCommentsLine(m)}
    </div>`;
}
function _mmImgsOf(m) {
if (Array.isArray(m.imgs) && m.imgs.length) return m.imgs.filter(v => typeof v === 'string' && v);
const out = [];
if (m.image) out.push(m.image);
if (m.sticker) out.push(m.sticker);
return out;
}
function _mmStickersOf(m) {
return (Array.isArray(m && m.stickers) ? m.stickers : []).filter(s => s && (s.src || s.emoji));
}
function _mmTs(m) {
if (typeof m.ts === 'number' && isFinite(m.ts)) return m.ts;
if (typeof m.date === 'string') { const d = new Date(m.date + ' ' + (m.time || '12:00')); const t = d.getTime(); if (isFinite(t)) return t; }
return 0;
}
function _mmCollected(m) {
if (typeof feedCollected !== 'function') return false;
return feedCollected(m.id);
}
function _mmBucketHtml(key, rows) {
const shown = _mmShown[key] || MM_RENDER_CAP;
const body = rows.slice(0, shown);
const more = rows.length > body.length
? `<button type="button" class="mp-more-btn" data-more="${escapeHTML(key)}">显示更早的 ${rows.length - body.length} 条</button>` : '';
return `<div class="mm-bucket">${body.map(_mmPostHtml).join('')}${more}</div>`;
}
function renderMomentNotices() {
const box = $('#momentNotices');
if (!box) return;
const list = (data.momentNotices || []).slice().reverse();
const dot = $('#mmNoticeDot');
if (dot) { const n = momentNoticesUnread(); dot.hidden = n === 0; dot.textContent = n > 9 ? '9+' : String(n); }
if (!list.length) { box.innerHTML = '<div class="mn-empty">还没有人动过你的朋友圈</div>'; return; }
box.innerHTML = list.map(n => `<button type="button" class="mn-row${n.seen ? '' : ' new'}" data-jump="${escapeHTML(String(n.momentId || ''))}" data-nid="${escapeHTML(String(n.id))}">
      <span class="mn-av">${avatarHTML(momentAvatar(n.by), momentName(n.by))}</span>
      <span class="mn-tx"><b>${escapeHTML(momentName(n.by))}</b> ${escapeHTML(_MOMENT_NOTIFY_MAP[n.kind] || '有了新动静')}</span>
      <span class="mn-when">${escapeHTML(_mmAgo(n.at))}</span>
    </button>`).join('');
}
function _mmVoiceless() {
const people = _mmFilter !== 'all' ? _mmPeople().filter(c => c.id === _mmFilter) : _mmPeople();
return people.filter(c => !momentPool('主字卡', c.id).length);
}
function renderMmQuiet() {
const row = $('#mmQuiet');
if (!row) return;
const gone = _mmVoiceless();
if (!gone.length) { row.hidden = true; row.innerHTML = ''; return; }
const who = gone.length === 1 ? fixedNameOf(gone[0]) : gone.length + ' 个人';
row.hidden = false;
row.innerHTML = '<span class="mm-quiet-tz">' + escapeHTML(who) + ' 的「主字卡」还是空的，暂时发不了朋友圈</span>'
+ '<button type="button" class="mc-chip" data-mm-cards>去字卡库</button>';
}
function _mmGoCards() {
if (typeof _cfGoCards === 'function') { _cfGoCards('public', '主字卡', ''); return; }
showView('cards');
}
function openMomentById(id) {
_mmFilter = 'all'; _mmBucket = 'all';
_momentsKey = '';
renderMoments();
const box = $('#momentsList');
const el = (id && box) ? box.querySelector('.moment-post[data-mid="' + CSS.escape(String(id)) + '"]') : null;
if (!el) { if (id) showToast('这条动态已经删掉了'); return false; }
el.scrollIntoView({ block: 'center' });
el.classList.add('flash');
setTimeout(() => el.classList.remove('flash'), 1400);
return true;
}
function renderMoments() {
const root = $('#momentsList');
if (!root) return;
renderMomentsCover();
renderMomentNotices();
let list = (data.moments || []).slice();
const owners = {};
list.forEach(m => { owners[m.author] = (owners[m.author] || 0) + 1; });
if (_mmFilter !== 'all' && !owners[_mmFilter]) _mmFilter = 'all';
renderMmQuiet();
list = list.filter(m => _mmFilter === 'all' || m.author === _mmFilter);
list.sort((a, b) => _mmTs(b) - _mmTs(a));
if (_mmPick && !list.some(m => String(m.id) === String(_mmPick.id)
&& (_mmBucket === 'all' || _mmBucketKey(_mmTs(m)) === _mmBucket))) _mmPick = null;
const buckets = [];
const byKey = {};
list.forEach(m => {
const k = _mmBucketKey(_mmTs(m));
if (!byKey[k]) { byKey[k] = { key: k, ts: _mmTs(m), rows: [] }; buckets.push(byKey[k]); }
if (_mmTs(m) > byKey[k].ts) byKey[k].ts = _mmTs(m);
byKey[k].rows.push(m);
});
const keys = buckets.map(b => b.key);
if (_mmBucket !== 'all' && keys.indexOf(_mmBucket) < 0 && keys.indexOf('week') >= 0) _mmBucket = 'week';
const tlist = $('#mmTimeList');
if (tlist) {
if (!list.length) { tlist.hidden = true; tlist.innerHTML = ''; }
else {
const rows = [{ k: 'all', n: '全部', c: list.length }].concat(keys.map(k => ({ k, n: _mmBucketLabel(k, byKey[k].ts), c: byKey[k].rows.length })));
tlist.hidden = false;
tlist.innerHTML = rows.map(o =>
`<button type="button" class="mm-time-row${_mmBucket === o.k ? ' on' : ''}" data-bucket="${escapeHTML(o.k)}"><span class="mm-time-n">${escapeHTML(o.n)}</span><span class="mm-time-c">${o.c} 条</span></button>`).join('');
}
}
const shown = buckets.filter(b => _mmBucket === 'all' || b.key === _mmBucket);
const key = [list.length, _mmFilter, _mmBucket, JSON.stringify(_mmShown), JSON.stringify(_mmCmtOpen),
_mmPick ? _mmPick.id : '',
_mmCmtDraft ? _mmCmtDraft.mid + ':' + (_mmCmtDraft.cid || '') + ':' + (_mmCmtDraft.sticker ? 1 : 0) : '',
list.map(m => m.id + ':' + (m.likes || []).length + ':' + (m.comments || []).length + ':' + _mmImgsOf(m).length + ':' + _mmStickersOf(m).length + ':' + (_mmCmtOpen[m.id] ? 1 : 0)).join(',')].join('|');
if (key === _momentsKey && root.children.length) return;
_momentsKey = key;
if (!list.length) {
root.innerHTML = '<div class="moments-empty"><span class="moments-empty-ic"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5-9 9"/></svg></span><p class="moments-empty-tz">还没有人发过朋友圈<br>点右上角「＋」发第一条</p></div>';
return;
}
root.innerHTML = shown.map(b => _mmBucketHtml(b.key, b.rows)).join('');
if (typeof hydrateVideos === 'function') { try { hydrateVideos(root); } catch (e) {} }
}
function openMomentComposer(mode, momentId, commentId) {
_momentComposer = { mode, momentId: momentId || null, commentId: commentId || null, imgs: [], sticker: '', video: '', vposter: '', vdur: 0 };
const mask = $('#momentModalMask'); if (!mask) return;
$('#momentModalTitle').textContent = mode === 'publish' ? '发一条' : (mode === 'comment' ? '评论' : '回复');
$('#momentModalSubmit').textContent = mode === 'publish' ? '发布' : '发送';
$('#momentModalInput').value = '';
const vbtn = $('#momentVideoBtn'); if (vbtn) vbtn.hidden = mode !== 'publish';
_mmSyncPicker();
$('#momentStickerGrid').hidden = true;
mask.hidden = false;
$('#momentModalInput').focus();
}
function closeMomentComposer() { const mask = $('#momentModalMask'); if (mask) mask.hidden = true; }
function _mmCmtBarEl() {
if (!_mmCmtDraft) return null;
return document.querySelector('.mp-cmt-bar[data-cmt-bar="' + CSS.escape(String(_mmCmtDraft.mid)) + '"]');
}
function openMomentComment(momentId, commentId) {
const m = _findMoment(momentId);
if (!m) return;
const same = _mmCmtDraft && String(_mmCmtDraft.mid) === String(momentId) && String(_mmCmtDraft.cid || '') === String(commentId || '');
if (!same) {
_mmCmtDraft = { mid: momentId, cid: commentId || null, text: '', sticker: '' };
_mmCmtStkItems = [];
if (commentId) _mmCmtOpen[momentId] = true;
_momentsKey = '';
renderMoments();
}
const bar = _mmCmtBarEl();
const ta = bar && bar.querySelector('.mp-cmt-in');
if (ta) setTimeout(() => { ta.focus(); if (bar.scrollIntoView) bar.scrollIntoView({ block: 'nearest' }); }, 40);
}
function closeMomentComment() {
if (!_mmCmtDraft) return;
_mmCmtDraft = null;
_mmCmtStkItems = [];
_momentsKey = '';
renderMoments();
}
function _mmCmtSyncPv() {
const bar = _mmCmtBarEl(), d = _mmCmtDraft;
if (!bar || !d) return;
const pv = bar.querySelector('.mp-cmt-pv');
if (!pv) return;
if (!d.sticker) { pv.hidden = true; pv.innerHTML = ''; return; }
pv.innerHTML = `<span class="mp-cmt-pvc"><img src="${escapeHTML(d.sticker)}" alt=""><button type="button" class="mp-cmt-pvx" data-cmt-rmstk aria-label="移除这张图">×</button></span>`;
pv.hidden = false;
}
function _mmCmtToggleStickers() {
const bar = _mmCmtBarEl();
if (!bar) return;
const grid = bar.querySelector('.mp-cmt-stk');
if (!grid) return;
if (!grid.hidden) { grid.hidden = true; return; }
const pool = _mmStkPool();
_mmCmtStkItems = pool.flatMap(g => g.items);
if (!_mmCmtStkItems.length) {
grid.innerHTML = '<span class="mp-cmt-stk-empty">还没有表情包，先到字卡库导入</span>';
grid.hidden = false;
return;
}
const token = ++_mmGridToken;
grid.innerHTML = '';
_mmGridFill(grid, _mmCmtStkItems.map((it, i) => it.emoji
? `<button type="button" class="mp-cmt-stk-cell mp-cmt-stk-word" data-cmt-stk-pick="${i}">${escapeHTML(it.emoji)}</button>`
: `<button type="button" class="mp-cmt-stk-cell" data-cmt-stk-pick="${i}"><img src="${escapeHTML(it.src)}" alt="表情包" loading="lazy" decoding="async"></button>`), token);
grid.hidden = false;
}
function _mmCmtPickSticker(i) {
const it = _mmCmtStkItems[i], d = _mmCmtDraft;
if (!it || !d) return;
const bar = _mmCmtBarEl();
const ta = bar && bar.querySelector('.mp-cmt-in');
if (it.emoji) {
if (ta) { ta.value = (ta.value || '') + it.emoji; d.text = ta.value; ta.focus(); }
return;
}
d.sticker = it.src;
_mmCmtSyncPv();
const grid = bar && bar.querySelector('.mp-cmt-stk');
if (grid) grid.hidden = true;
}
function _mmCmtRemoveSticker() {
if (!_mmCmtDraft) return;
_mmCmtDraft.sticker = '';
_mmCmtSyncPv();
}
function submitMomentComment() {
const d = _mmCmtDraft;
if (!d) return;
const bar = _mmCmtBarEl();
const ta = bar && bar.querySelector('.mp-cmt-in');
const text = (ta ? ta.value : (d.text || '')).trim();
if (!text && !d.sticker) {
showToast('写点什么或放一张图');
if (ta) ta.focus();
return;
}
const { mid, cid, sticker } = d;
_mmCmtDraft = null;
_mmCmtStkItems = [];
_momentsKey = '';
const added = addComment(mid, 'me', { text, sticker }, cid);
if (!added) { renderMoments(); return; }
_pubPut('mmcmt', String(mid), added);
_pubFlush();
if (cid) scheduleReplyResponse(mid, added.id, cid);
else scheduleCommentResponse(mid);
}
function _mmSyncPicker() {
const box = $('#momentPv');
if (!box) return;
if (_momentComposer.mode !== 'publish') {
const cell = _momentComposer.sticker
? `<span class="mpv-cell"><img src="${escapeHTML(_momentComposer.sticker)}" alt=""><button type="button" class="mpv-x" data-rm-stk="1" aria-label="移除这张">×</button></span>` : '';
box.innerHTML = cell;
box.hidden = !cell;
return;
}
if (_momentComposer.video) {
const cell = `<span class="mpv-cell mpv-video"><video${videoAttrs(_momentComposer.video, _momentComposer.vposter)} muted playsinline preload="metadata"></video><button type="button" class="mpv-x" data-rm-v="1" aria-label="移除这段视频">×</button></span>`;
box.innerHTML = cell;
box.hidden = false;
return;
}
const items = _momentComposer.imgs.map((src, i) =>
`<span class="mpv-cell"><img src="${escapeHTML(src)}" alt=""><button type="button" class="mpv-x" data-rm="${i}" aria-label="移除这张">×</button></span>`).join('');
const add = _momentComposer.imgs.length < MM_MAX_IMGS
? `<button type="button" class="mpv-add" id="momentPvAdd" aria-label="添加图片"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>` : '';
box.innerHTML = items + add;
box.hidden = !items && !add;
}
var _mmGridToken = 0;
var MM_GRID_FIRST = 20, MM_GRID_STEP = 24;
function _mmGridFill(grid, cells, token) {
let i = 0;
const paint = n => {
const end = Math.min(cells.length, i + n);
let html = '';
for (; i < end; i++) html += cells[i];
if (html) grid.insertAdjacentHTML('beforeend', html);
};
paint(Math.min(cells.length, MM_GRID_FIRST));
if (i >= cells.length) return;
const next = () => {
if (token !== _mmGridToken || !grid.isConnected) return;
paint(MM_GRID_STEP);
if (i < cells.length) setTimeout(next, 0);
};
setTimeout(next, 16);
}
var _mmGridSrcs = [];
function buildMomentStickerGrid() {
const grid = $('#momentStickerGrid');
if (!grid) return;
const token = ++_mmGridToken;
_mmGridSrcs = _mmStkPool().flatMap(g => g.items).map(it => it.src).filter(Boolean);
if (!_mmGridSrcs.length) {
grid.innerHTML = '<span class="empty">还没有表情包，先到字卡库导入</span>';
return;
}
grid.innerHTML = '';
_mmGridFill(grid, _mmGridSrcs.map((s, i) =>
`<img src="${escapeHTML(s)}" data-si="${i}" alt="表情包" loading="lazy" decoding="async">`), token);
}
function openMmStickerPanel(id) {
const m = _findMoment(id);
const sheet = $('#mmStkSheet');
if (!m || !sheet) return;
_mmCancelPick();
_mmStkFor = String(m.id);
_mmStkCur = '';
sheet.hidden = false;
renderMmStickerPanel();
}
function closeMmStickerPanel() {
const sheet = $('#mmStkSheet');
if (sheet) sheet.hidden = true;
_mmStkFor = null;
_mmStkItems = [];
}
function _mmStkPoolNow() {
return _mmStkPool();
}
function renderMmStickerPanel() {
const chips = $('#mmStkScopes'), body = $('#mmStkBody');
if (!body) return;
const token = ++_mmGridToken;
const keep = body.scrollTop;
const pool = _mmStkPoolNow();
if (!pool.length) {
_mmStkItems = [];
if (chips) { chips.innerHTML = ''; chips.hidden = true; }
body.innerHTML = '<span class="mm-stk-empty">还没有能贴的东西——先到字卡库的「表情包」或「图片」里存几张，或在表情包抽屉里建自己的一组</span>';
return;
}
const total = pool.reduce((n, g) => n + g.items.length, 0);
const rows = pool.filter(g => !_mmStkCur || g.n === _mmStkCur);
_mmStkItems = rows.flatMap(g => g.items);
if (chips) {
chips.hidden = pool.length < 2;
chips.innerHTML = [{ n: '', t: '全部 ' + total }]
.concat(pool.map(g => ({ n: g.n, t: g.n + ' ' + g.items.length })))
.map(o => `<button type="button" class="mm-ow${_mmStkCur === o.n ? ' on' : ''}" data-stk-g="${escapeHTML(o.n)}">${escapeHTML(o.t)}</button>`).join('');
}
body.innerHTML = '';
_mmGridFill(body, _mmStkItems.map((it, i) => it.emoji
? `<button type="button" class="mm-stk-cell mm-stk-word" data-stk-pick="${i}">${escapeHTML(it.emoji)}</button>`
: `<button type="button" class="mm-stk-cell" data-stk-pick="${i}"><img src="${escapeHTML(it.src)}" alt="贴纸" loading="lazy" decoding="async"></button>`), token);
body.scrollTop = keep;
}
function _mmStartPick(i) {
const it = _mmStkItems[i], m = _mmStkFor ? _findMoment(_mmStkFor) : null;
if (!it || !m) return;
_mmPick = { id: m.id, src: it.src || '', emoji: it.emoji || '' };
closeMmStickerPanel();
_momentsKey = '';
renderMoments();
const el = document.querySelector('#momentsList .moment-post[data-mid="' + CSS.escape(String(m.id)) + '"] .mp-photos');
if (el) el.scrollIntoView({ block: 'center' });
}
function _mmCancelPick() {
if (!_mmPick) return;
_mmPick = null;
_momentsKey = '';
renderMoments();
}
function _mmPlacePick(x, y) {
const p = _mmPick;
if (!p) return;
const m = _findMoment(p.id);
_mmPick = null;
if (!m) { _momentsKey = ''; renderMoments(); return; }
if (!Array.isArray(m.stickers)) m.stickers = [];
m.stickers.push({ src: p.src, emoji: p.emoji, x, y, s: 1, r: 0, by: 'me' });
save();
scheduleStickerReply(p.id);
_momentsKey = '';
renderMoments();
}
var _mmStkView = null;
var _mmCmtToChatAt = 0;
function _mmStickerable(m) {
return !!(m && (_mmImgsOf(m).length || (typeof m.video === 'string' && m.video)));
}
function _mmTaStickerImgs(who) {
const out = partnerStickers(who).slice();
(data.stickerGroups || []).forEach(g => {
if (!g || g.off) return;
(g.imgs || []).forEach(s => { if (typeof s === 'string' && s) out.push(s); });
});
(data.stickerRecent || []).forEach(s => { if (typeof s === 'string' && s) out.push(s); });
return out;
}
function _mmTaStickerEmojis(who) {
const out = momentPool('emoji', who).slice();
((data.myText && data.myText.emoji) || []).forEach(g => {
((g && g.items) || []).forEach(t => { if (typeof t === 'string' && t) out.push(t); });
});
return out;
}
function _mmTaStickerPick(who) {
const imgs = _mmTaStickerImgs(who);
if (imgs.length) return { src: momentPick(imgs), emoji: '' };
const ems = _mmTaStickerEmojis(who);
if (ems.length) return { src: '', emoji: momentPick(ems) };
return null;
}
function openMmStickerView(mid, i) {
const m = _findMoment(mid);
const n = _mmStickersOf(m).length;
if (!m || !n) return;
_mmStkView = { mid, i: Math.max(0, Math.min(n - 1, i)) };
const mask = $('#mmStkViewMask'); if (!mask) return;
mask.hidden = false;
_mmStkViewPaint();
}
function _mmStkViewClose() {
_mmStkView = null;
const mask = $('#mmStkViewMask'); if (mask) mask.hidden = true;
}
function _mmStkViewTurn(d) {
if (!_mmStkView) return;
const m = _findMoment(_mmStkView.mid);
const n = _mmStickersOf(m).length;
if (!n) return;
_mmStkView.i = (_mmStkView.i + d + n) % n;
_mmStkViewPaint();
}
function _mmStkViewDress(key, raw) {
if (!_mmStkView) return;
const m = _findMoment(_mmStkView.mid);
const s = _mmStickersOf(m)[_mmStkView.i];
if (!s || s.by !== 'me') return;
const v = Number(raw);
if (!isFinite(v)) return;
if (key === 's') s.s = Math.round(Math.min(2, Math.max(0.6, v / 100)) * 100) / 100;
else s.r = Math.round(Math.min(25, Math.max(-25, v)) * 10) / 10;
_mmStkViewPaint();
}
function _mmStkViewPaint() {
if (!_mmStkView) return;
const m = _findMoment(_mmStkView.mid);
const list = _mmStickersOf(m);
if (!list.length) { _mmStkViewClose(); return; }
if (_mmStkView.i >= list.length) _mmStkView.i = list.length - 1;
const s = list[_mmStkView.i];
const sv = (typeof s.s === 'number' && isFinite(s.s)) ? s.s : 1;
const rv = (typeof s.r === 'number' && isFinite(s.r)) ? s.r : 0;
const mine = s.by === 'me';
const stage = $('#mmStkViewStage');
if (stage) stage.innerHTML = s.src
? `<img src="${escapeHTML(s.src)}" alt="贴纸" style="transform:scale(${sv}) rotate(${rv}deg)">`
: `<b class="mm-stkv-word" style="transform:scale(${sv}) rotate(${rv}deg)">${escapeHTML(s.emoji)}</b>`;
const nav = $('#mmStkViewNav');
if (nav) {
nav.hidden = list.length < 2;
const nEl = $('#mmStkViewN'); if (nEl) nEl.textContent = (_mmStkView.i + 1) + ' / ' + list.length;
}
const dial = $('#mmStkViewDial'); if (dial) dial.hidden = !mine;
if (mine) {
const se = $('#mmStkViewS'); if (se) se.value = String(Math.round(sv * 100));
const re = $('#mmStkViewR'); if (re) re.value = String(Math.round(rv));
const svEl = $('#mmStkViewSV'); if (svEl) svEl.textContent = Math.round(sv * 100) + '%';
const rvEl = $('#mmStkViewRV'); if (rvEl) rvEl.textContent = Math.round(rv) + '°';
}
const del = $('#mmStkViewDel'); if (del) del.hidden = !mine;
const note = $('#mmStkViewNote');
if (note) note.textContent = mine
? '贴纸站在原位没动：拖动两枚滑杆现场改大小与转向，松手落账；被别的贴纸盖住的那张用上面那对 ‹ › 翻到。'
: '这张是 ' + momentName(s.by) + ' 贴的。被别的贴纸盖住、屏上点不到的那张，用上面那对 ‹ › 就能翻到。';
}
function _bindMmStkViewUI() {
const mask = $('#mmStkViewMask'); if (!mask) return;
mask.addEventListener('click', e => { if (e.target === mask) _mmStkViewClose(); });
$('#mmStkViewClose').onclick = _mmStkViewClose;
$('#mmStkViewPrev').onclick = () => _mmStkViewTurn(-1);
$('#mmStkViewNext').onclick = () => _mmStkViewTurn(1);
const se = $('#mmStkViewS'), re = $('#mmStkViewR');
if (se) {
se.addEventListener('input', () => _mmStkViewDress('s', se.value));
se.addEventListener('change', () => { save(); _momentsKey = ''; renderMoments(); });
}
if (re) {
re.addEventListener('input', () => _mmStkViewDress('r', re.value));
re.addEventListener('change', () => { save(); _momentsKey = ''; renderMoments(); });
}
$('#mmStkViewDel').onclick = () => {
if (!_mmStkView) return;
const mid = _mmStkView.mid, i = _mmStkView.i;
_mmStkViewClose();
_mmRemoveSticker(mid, i);
};
}
function _mmCmtToChat(mid, cid) {
const now = Date.now();
if (now - _mmCmtToChatAt < 800) return;
_mmCmtToChatAt = now;
const m = _findMoment(mid);
const c = m && (m.comments || []).find(x => String(x.id) === String(cid));
if (!c || c.author === 'me') return;
const who = c.author;
const text = String(c.text || '').trim();
if (!text || !data.chats[who]) { showToast('这条是图片，带不进聊天框；文字的可以长按带走。'); return; }
openModal('去聊天里说', '', () => {
data.chats[who].draft = text.slice(0, 500);
if (data.activeChat === who) data.chatDraft = data.chats[who].draft;
save();
switchChat(who);
if (typeof syncChatDraftToInput === 'function') syncChatDraftToInput();
showToast('带到与 ' + momentName(who) + ' 的聊天了，话已放进输入框');
}, { noInput: true, staticText: '把这条评论带进与「' + momentName(who) + '」的聊天，到了那边接着说。', okText: '去聊天' });
}
function _bindMmCmtToChatUI(list) {
if (!list) return;
let pressT = null, pressPt = null;
const clearPress = () => { if (pressT) { clearTimeout(pressT); pressT = null; } };
list.addEventListener('pointerdown', e => {
const row = e.target.closest('.mp-cmt');
if (!row || e.target.closest('button')) return;
pressPt = { x: e.clientX, y: e.clientY };
clearPress();
pressT = setTimeout(() => {
pressT = null;
const card = row.closest('.moment-post');
if (card) _mmCmtToChat(card.dataset.mid, row.dataset.cid);
}, 550);
});
list.addEventListener('pointermove', e => {
if (!pressT || !pressPt) return;
if (Math.abs(e.clientX - pressPt.x) > 10 || Math.abs(e.clientY - pressPt.y) > 10) clearPress();
});
list.addEventListener('pointerup', clearPress);
list.addEventListener('pointercancel', clearPress);
list.addEventListener('pointerleave', clearPress);
list.addEventListener('contextmenu', e => {
const row = e.target.closest('.mp-cmt');
if (!row || e.target.closest('button')) return;
e.preventDefault();
const card = row.closest('.moment-post');
if (card) _mmCmtToChat(card.dataset.mid, row.dataset.cid);
});
}
function _mmRemoveSticker(id, i) {
const m = _findMoment(id);
const list = m ? _mmStickersOf(m) : [];
const s = list[i];
if (!s || s.by !== 'me') return;
const at = (m.stickers || []).indexOf(s);
if (at < 0) return;
openModal('撤回这张贴纸', '', () => {
const cur = _findMoment(id);
if (!cur || !Array.isArray(cur.stickers)) return;
const now = cur.stickers.indexOf(s);
if (now < 0) return;
cur.stickers.splice(now, 1);
save();
_momentsKey = '';
renderMoments();
}, { noInput: true, staticText: '只撕这一张贴纸，动态本身不动。', okText: '撤回', danger: true });
}
function _bindMomentUI() {
const fab = $('#newMoment'); if (fab) fab.onclick = () => openMomentComposer('publish');
const close = $('#momentModalClose'); if (close) close.onclick = closeMomentComposer;
const mask = $('#momentModalMask');
if (mask) mask.addEventListener('click', e => { if (e.target === mask) closeMomentComposer(); });
const sbtn = $('#momentStickerBtn');
if (sbtn) sbtn.onclick = () => { buildMomentStickerGrid(); $('#momentStickerGrid').hidden = !$('#momentStickerGrid').hidden; };
const grid = $('#momentStickerGrid');
if (grid) grid.addEventListener('click', e => {
const img = e.target.closest('img[data-si]');
if (!img) return;
const src = _mmGridSrcs[+img.dataset.si];
if (!src) return;
if (_momentComposer.mode !== 'publish') {
_momentComposer.sticker = src;
_mmSyncPicker();
$('#momentStickerGrid').hidden = true;
return;
}
if (_momentComposer.imgs.length >= MM_MAX_IMGS) { showToast('最多 ' + MM_MAX_IMGS + ' 张'); return; }
_momentComposer.imgs.push(src);
_mmSyncPicker();
$('#momentStickerGrid').hidden = true;
});
const ibtn = $('#momentImageBtn');
if (ibtn) ibtn.onclick = () => $('#momentImageInput') && $('#momentImageInput').click();
const iin = $('#momentImageInput');
if (iin) iin.onchange = async e => {
const files = Array.from(e.target.files || []);
e.target.value = '';
if (!files.length) return;
if (_momentComposer.mode !== 'publish') {
const img = await fileData(files[0], 800, 0.86);
if (img) { _momentComposer.sticker = img; _mmSyncPicker(); }
if (files.length > 1) showToast('评论只放一张图，多出的没加进来');
return;
}
let dropped = 0;
for (const f of files) {
if (_momentComposer.imgs.length >= MM_MAX_IMGS) { dropped++; continue; }
const img = await fileData(f, 800, 0.86);
if (img) _momentComposer.imgs.push(img);
}
if (dropped) showToast('最多 ' + MM_MAX_IMGS + ' 张，多出的没加进来');
if (files.length && _momentComposer.imgs.length) { _momentComposer.video = ''; _momentComposer.vposter = ''; _momentComposer.vdur = 0; }
_mmSyncPicker();
};
const cin = $('#momentCommentImageInput');
if (cin) cin.onchange = async e => {
const f = (e.target.files || [])[0];
e.target.value = '';
const d = _mmCmtDraft;
if (!f || !d) return;
const img = await fileData(f, 800, 0.86);
if (img && _mmCmtDraft === d) { d.sticker = img; _mmCmtSyncPv(); }
};
const vbtn = $('#momentVideoBtn');
if (vbtn) vbtn.onclick = () => $('#momentVideoInput') && $('#momentVideoInput').click();
const vin = $('#momentVideoInput');
if (vin) vin.onchange = async e => {
const f = (e.target.files || [])[0];
e.target.value = '';
if (!f) return;
if (_momentComposer.mode !== 'publish') return;
const v = await videoData(f);
if (!v) return;
_momentComposer.video = v.src;
_momentComposer.vposter = v.poster || '';
_momentComposer.vdur = v.dur || 0;
if (_momentComposer.imgs.length) _momentComposer.imgs = [];
_mmSyncPicker();
};
const submit = $('#momentModalSubmit');
if (submit) submit.onclick = async () => {
const text = $('#momentModalInput').value.trim();
const { mode, momentId, commentId, imgs, sticker, video, vposter, vdur } = _momentComposer;
if (!text && !imgs.length && !sticker && !video) { showToast('写点什么或放一张图'); return; }
if (mode === 'publish') {
const m = addMoment('me', { text, imgs, video, vposter, vdur });
_pubPut('moment', '', m);
await _pubFlush();
closeMomentComposer();
_mmFilter = 'all'; _mmBucket = 'all';
renderMoments();
schedulePartnerReactions(m.id);
} else if (mode === 'comment') {
const cm = addComment(momentId, 'me', { text, sticker });
_pubPut('mmcmt', String(momentId), cm);
await _pubFlush();
closeMomentComposer();
scheduleCommentResponse(momentId);
} else {
const my = addComment(momentId, 'me', { text, sticker }, commentId);
if (my) { _pubPut('mmcmt', String(momentId), my); await _pubFlush(); }
closeMomentComposer();
if (my) scheduleReplyResponse(momentId, my.id, commentId);
}
};
const list = $('#momentsView');
if (list) list.addEventListener('click', e => {
const cbarSend = e.target.closest('[data-cmt-send]');
if (cbarSend) { submitMomentComment(); return; }
const cbarClose = e.target.closest('[data-cmt-close]');
if (cbarClose) { closeMomentComment(); return; }
const cbarStk = e.target.closest('[data-cmt-sticker]');
if (cbarStk) { _mmCmtToggleStickers(); return; }
const cbarImg = e.target.closest('[data-cmt-image]');
if (cbarImg) { const inp = $('#momentCommentImageInput'); if (inp) inp.click(); return; }
const cbarRm = e.target.closest('[data-cmt-rmstk]');
if (cbarRm) { _mmCmtRemoveSticker(); return; }
const cbarPick = e.target.closest('[data-cmt-stk-pick]');
if (cbarPick) { _mmCmtPickSticker(+cbarPick.dataset.cmtStkPick); return; }
const cmore = e.target.closest('[data-cmore]');
if (cmore) { _mmCmtOpen[cmore.dataset.cmore] = !_mmCmtOpen[cmore.dataset.cmore]; _momentsKey = ''; renderMoments(); return; }
const more = e.target.closest('[data-more]');
if (more) { const k = more.dataset.more; _mmShown[k] = (_mmShown[k] || MM_RENDER_CAP) + 100; _momentsKey = ''; renderMoments(); return; }
const who = e.target.closest('[data-who]');
if (who) {
const w = who.dataset.who;
if (!w) return;
const next = (w === _mmFilter) ? 'all' : w;
_mmFilter = next;
_momentsKey = '';
renderMoments();
if (next !== 'all') showToast('再点一次「' + momentName(next) + '」的头像或名字＝回到全部');
return;
}
const goCards = e.target.closest('[data-mm-cards]');
if (goCards) { _mmGoCards(); return; }
const likeBtn = e.target.closest('[data-like]');
if (likeBtn) {
const m = _findMoment(likeBtn.dataset.like);
if (!m) return;
const on = _mmToggleLike(m.id, 'me');
if (on && m.author !== 'me') scheduleReturnLike(m.author);
_momentsKey = '';
renderMoments();
return;
}
const colBtn = e.target.closest('[data-collect]');
if (colBtn) {
const m = _findMoment(colBtn.dataset.collect);
if (m && typeof collectFeed === 'function') collectFeed(m);
_momentsKey = '';
renderMoments();
return;
}
const delBtn = e.target.closest('[data-del]');
if (delBtn) {
const id = delBtn.dataset.del;
openModal('删除这条朋友圈', '', () => {
const gone = _findMoment(id);
if (gone && gone.video) videoDrop(gone.video);
data.moments = (data.moments || []).filter(x => String(x.id) !== String(id));
data.momentNotices = (data.momentNotices || []).filter(n => String(n.momentId) !== String(id));
save();
_momentsKey = '';
renderMoments();
}, { noInput: true, staticText: '删除后找不回来。', okText: '删除', danger: true });
return;
}
const cb = e.target.closest('[data-comment-btn]');
if (cb) {
const cid = e.target.closest('.mp-cmt');
const card = cb.closest('.moment-post');
const m = card ? _findMoment(card.dataset.mid) : null;
if (cid && m) {
const cm = (m.comments || []).find(x => String(x.id) === String(cid.dataset.cid));
if (cm) { openMomentComment(m.id, cm.id); return; }
}
openMomentComment(m ? m.id : cb.dataset.commentBtn, null);
return;
}
const cancel = e.target.closest('[data-stk-cancel]');
if (cancel) { _mmCancelPick(); return; }
const sbtn = e.target.closest('[data-sticker]');
if (sbtn) { openMmStickerPanel(sbtn.dataset.sticker); return; }
if (_mmPick) {
const ph = e.target.closest('.mp-photos');
if (ph) {
const r = ph.getBoundingClientRect();
if (r.width > 0 && r.height > 0) {
const x = Math.min(90, Math.max(4, (e.clientX - r.left) / r.width * 100));
const y = Math.min(90, Math.max(6, (e.clientY - r.top) / r.height * 100));
_mmPlacePick(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
}
return;
}
}
const stkBtn = e.target.closest('[data-stk]');
if (stkBtn) {
const card = stkBtn.closest('.moment-post');
if (card) openMmStickerView(card.dataset.mid, +stkBtn.dataset.stk);
return;
}
const photo = e.target.closest('.mp-cell');
if (photo) { const img = photo.querySelector('img'); if (img) openLightbox(img.getAttribute('src')); }
});
if (list) list.addEventListener('input', e => {
if (_mmCmtDraft && e.target.classList && e.target.classList.contains('mp-cmt-in')) _mmCmtDraft.text = e.target.value;
});
if (list) list.addEventListener('keydown', e => {
if (!_mmCmtDraft || !e.target.classList || !e.target.classList.contains('mp-cmt-in')) return;
if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
e.preventDefault();
submitMomentComment();
}
});
const stkSheet = $('#mmStkSheet');
if (stkSheet) stkSheet.addEventListener('click', e => {
if (e.target === stkSheet || e.target.closest('.fs-sheet-close')) { closeMmStickerPanel(); return; }
const g = e.target.closest('[data-stk-g]');
if (g) { _mmStkCur = g.dataset.stkG; renderMmStickerPanel(); return; }
const cell = e.target.closest('[data-stk-pick]');
if (cell) _mmStartPick(+cell.dataset.stkPick);
});
const nc = $('#mmNoticeClose');
if (nc) nc.onclick = () => { const sh = $('#mmNoticeSheet'); if (sh) sh.hidden = true; };
const ns = $('#mmNoticeSheet');
if (ns) ns.addEventListener('click', e => { if (e.target === ns) ns.hidden = true; });
const tb = $('#mmTimeBtn');
if (tb) tb.onclick = () => { renderMoments(); const sh = $('#mmTimeSheet'); if (sh) sh.hidden = false; };
const tsh = $('#mmTimeSheet');
if (tsh) tsh.addEventListener('click', e => {
if (e.target === tsh || e.target.closest('.fs-sheet-close')) { tsh.hidden = true; return; }
const row = e.target.closest('[data-bucket]');
if (row) { _mmBucket = row.dataset.bucket; tsh.hidden = true; _momentsKey = ''; renderMoments(); }
});
const nb = $('#mmNoticeBtn');
if (nb) nb.onclick = () => {
const sheet = $('#mmNoticeSheet');
if (!sheet) return;
sheet.hidden = !sheet.hidden;
if (!sheet.hidden) { renderMomentNotices(); markNoticesSeen(); }
};
const nbox = $('#momentNotices');
if (nbox) nbox.addEventListener('click', e => {
const row = e.target.closest('[data-jump]');
if (!row) return;
const id = row.dataset.jump;
const n = (data.momentNotices || []).find(x => String(x.id) === String(row.dataset.nid));
if (n) { n.seen = true; save(); }
if (n && momentNoticesUnread() === 0) updateHomeIndex();
const sheet = $('#mmNoticeSheet'); if (sheet) sheet.hidden = true;
openMomentById(id);
renderMomentNotices();
});
}
_bindMomentUI();
try { _bindMmStkViewUI(); } catch (e) {}
try { _bindMmCmtToChatUI($('#momentsView')); } catch (e) {}
var _mmScope = 'default';
var MM_SET_NUM = [
['publishProbability', 0, 100], ['dailyMaxMoments', 0, 99],
['minPublishIntervalMin', 1, 1440], ['maxPublishIntervalMin', 1, 1440], ['publishCooldownMin', 0, 1440],
['minCardsInMoment', 1, 99], ['maxCardsInMoment', 1, 99],
['useKaomojiProb', 0, 100], ['useEmojiProb', 0, 100], ['useStickerProb', 0, 100], ['useImageProb', 0, 100],
['multiCardProbability', 0, 100], ['maxCardsInComment', 1, 20],
['useStickerInComment', 0, 100], ['useImageInComment', 0, 100],
['useKaomojiInComment', 0, 100], ['useEmojiInComment', 0, 100],
['taCommentOnMyPostProbability', 0, 100],
['taStickerProbability', 0, 100], ['taStickerMinSec', 1, 3600], ['taStickerMaxSec', 1, 3600],
['stickerReplyProbability', 0, 100], ['stickerReplyMinSec', 1, 3600], ['stickerReplyMaxSec', 1, 3600],
['likeProbability', 0, 100], ['likeMinSec', 1, 3600], ['likeMaxSec', 1, 3600],
['commentProbability', 0, 100], ['commentMinSec', 1, 3600], ['commentMaxSec', 1, 3600],
['replyProbability', 0, 100], ['replyMinSec', 1, 3600], ['replyMaxSec', 1, 3600],
['returnLikeProbability', 0, 100], ['taCollectProb', 0, 100]
];
var MM_SET_ID = {
publishProbability: 'mmPublishProb', dailyMaxMoments: 'mmDailyMax',
minPublishIntervalMin: 'mmMinInterval', maxPublishIntervalMin: 'mmMaxInterval', publishCooldownMin: 'mmCooldown',
minCardsInMoment: 'mmMinCards', maxCardsInMoment: 'mmMaxCards',
useKaomojiProb: 'mmKaomojiProb', useEmojiProb: 'mmEmojiProb', useStickerProb: 'mmStickerProb', useImageProb: 'mmImageProb',
multiCardProbability: 'mmMultiCardProb', maxCardsInComment: 'mmMaxCardsInComment', useStickerInComment: 'mmCommentStickerProb',
useImageInComment: 'mmCommentImageProb',
useKaomojiInComment: 'mmCommentKaomojiProb', useEmojiInComment: 'mmCommentEmojiProb',
taCommentOnMyPostProbability: 'mmTaCommentPostProb',
taStickerProbability: 'mmTaStickerProb', taStickerMinSec: 'mmTaStickerMin', taStickerMaxSec: 'mmTaStickerMax',
stickerReplyProbability: 'mmStickerReplyProb', stickerReplyMinSec: 'mmStickerReplyMin', stickerReplyMaxSec: 'mmStickerReplyMax',
likeProbability: 'mmLikeProb', likeMinSec: 'mmLikeMin', likeMaxSec: 'mmLikeMax',
commentProbability: 'mmCommentProb', commentMinSec: 'mmCommentMin', commentMaxSec: 'mmCommentMax',
replyProbability: 'mmReplyProb', replyMinSec: 'mmReplyMin', replyMaxSec: 'mmReplyMax',
returnLikeProbability: 'mmReturnLikeProb', taCollectProb: 'mmTaCollectProb'
};
function _mmScopeCid() { return _mmScope === 'default' ? null : _mmScope; }
function _mmScopeWho() { return _mmScope === 'default' ? 'me' : _mmScope; }
function renderMomentsSettings() {
const sheet = $('#mmSetSheet');
if (!sheet) return;
const cid = _mmScopeCid();
const s = _mmCfg(cid);
MM_SET_NUM.forEach(([k, min, max]) => {
const el = $('#' + MM_SET_ID[k]);
if (!el) return;
el.min = min; el.max = max;
const v = Number(s[k]);
window.setNumSafe(el, isFinite(v) && String(s[k]) !== '' ? v : Number(defaults.momentsSettings[k]), defaults.momentsSettings[k]);
});
const en = $('#mmPostEnabled');
if (en) en.checked = s.postEnabled !== false;
const pop = $('#mmPopup');
if (pop) pop.checked = (data.momentsSettings || {}).momentPopup !== false;
const own = $('#mmOwnersSet');
if (own) {
const over = data.momentsBy || {};
const walls = data.momentWalls || {};
own.innerHTML = [{ id: 'default', n: '默认' }].concat(_mmPeople().map(c => {
const w = walls[c.id] || {};
const tag = (over[c.id] ? ' · 已调' : '') + (w.cover ? ' · 有封面' : '') + (w.avatar ? ' · 有头像' : '') + (w.name ? ' · 有昵称' : '');
return { id: c.id, n: fixedNameOf(c) + tag };
}))
.map(o => `<button type="button" class="mm-ow${_mmScope === o.id ? ' on' : ''}" data-mm-scope="${escapeHTML(o.id)}">${escapeHTML(o.n)}</button>`).join('');
}
const who = _mmScopeWho();
const ow = _mmWallOverride(who);
const face = _mmChatFace(who);
const eff = _mmWallOf(who);
const clr2 = $('#mcClearCover'); if (clr2) clr2.hidden = !ow.cover;
_mmCoverEcho();
const clrAv = $('#mcClearAvatar'); if (clrAv) clrAv.hidden = !ow.avatar;
const faceT = $('#mmFaceT'); if (faceT) faceT.textContent = who === 'me' ? '我的昵称与头像' : (face.name || '这一位') + ' 的昵称与头像';
const pv = $('#mmWallAvPv');
if (pv) pv.innerHTML = avatarHTML(eff.avatar, eff.name);
const nameIn = $('#mmWallName');
if (nameIn) {
nameIn.value = ow.name;
nameIn.dataset.who = who;
nameIn.placeholder = '留空＝跟随聊天里的「' + face.name + '」';
}
const wallNote = $('#mmWallNote');
if (wallNote) wallNote.textContent = who === 'me'
? '这一格是【我自己那一面】：这里换上的昵称/头像/封面只出现在朋友圈这一页（顶部那一屏与我发的每一条）。留空／不传＝跟随聊天里那份，聊天那边一个字不动。'
: taLabel('这一格是【他那一面】：这里换上的昵称/头像/封面只出现在朋友圈这一页（顶部那一屏∶他发的动态∶评论区∶点赞名单∶提醒簿）。留空／不传＝跟随聊天里那份，聊天那边一个字不动。要给另一位设，先在上面选到那一位。', who);
const pend = $('#mmPendingNote');
if (pend) {
const n = (data._momentReactions || []).filter(x => x && (x.kind === 'comment' || x.kind === 'reply')).length;
pend.textContent = n ? ('此刻还有 ' + n + ' 条回应排在路上：到点由 TA 自己落地，中间关掉页面也不会丢。') : '';
pend.hidden = !n;
}
const note = $('#mmScopeNote');
if (note) note.textContent = cid
? '只调这一位：没动过的格子跟随「默认」那一列；把某格填成与默认相同的值＝这一格恢复跟随。'
: taLabel('这一列是所有 TA 的默认值；单独调过的人记在他自己那一格。', '');
if (typeof renderShapeButtons === 'function') renderShapeButtons();
}
function saveMomentsNow() {
const cid = _mmScopeCid();
const src = _mmCfg(cid);
const patch = {};
MM_SET_NUM.forEach(([k, min, max]) => {
const el = $('#' + MM_SET_ID[k]);
if (!el) return;
const raw = numInputText(el.value);
if (raw === '') return;
let v = Math.floor(Number(raw));
if (!isFinite(v)) return;
v = Math.min(max, Math.max(min, v));
patch[k] = v;
window.setNumSafe(el, v);
});
const en = $('#mmPostEnabled');
if (en) patch.postEnabled = en.checked;
if (patch.minPublishIntervalMin != null && patch.maxPublishIntervalMin == null)
patch.maxPublishIntervalMin = Math.max(patch.minPublishIntervalMin, Number(src.maxPublishIntervalMin) || defaults.momentsSettings.maxPublishIntervalMin);
if (patch.maxPublishIntervalMin != null && patch.minPublishIntervalMin == null)
patch.minPublishIntervalMin = Math.min(patch.maxPublishIntervalMin, Number(src.minPublishIntervalMin) || defaults.momentsSettings.minPublishIntervalMin);
if (patch.minPublishIntervalMin != null && patch.maxPublishIntervalMin != null && patch.maxPublishIntervalMin < patch.minPublishIntervalMin)
patch.maxPublishIntervalMin = patch.minPublishIntervalMin;
if (patch.minCardsInMoment != null && patch.maxCardsInMoment == null)
patch.maxCardsInMoment = Math.max(patch.minCardsInMoment, Number(src.maxCardsInMoment) || defaults.momentsSettings.maxCardsInMoment);
if (patch.maxCardsInMoment != null && patch.minCardsInMoment == null)
patch.minCardsInMoment = Math.min(patch.maxCardsInMoment, Number(src.minCardsInMoment) || defaults.momentsSettings.minCardsInMoment);
if (patch.minCardsInMoment != null && patch.maxCardsInMoment != null && patch.maxCardsInMoment < patch.minCardsInMoment)
patch.maxCardsInMoment = patch.minCardsInMoment;
if (patch.likeMinSec != null && patch.likeMaxSec == null) patch.likeMaxSec = Math.max(patch.likeMinSec, Number(src.likeMaxSec) || 120);
if (patch.likeMaxSec != null && patch.likeMinSec == null) patch.likeMinSec = Math.min(patch.likeMaxSec, Number(src.likeMinSec) || 2);
if (patch.likeMinSec != null && patch.likeMaxSec != null && patch.likeMaxSec < patch.likeMinSec) patch.likeMaxSec = patch.likeMinSec;
if (patch.commentMinSec != null && patch.commentMaxSec == null) patch.commentMaxSec = Math.max(patch.commentMinSec, Number(src.commentMaxSec) || 180);
if (patch.commentMaxSec != null && patch.commentMinSec == null) patch.commentMinSec = Math.min(patch.commentMaxSec, Number(src.commentMinSec) || 3);
if (patch.commentMinSec != null && patch.commentMaxSec != null && patch.commentMaxSec < patch.commentMinSec) patch.commentMaxSec = patch.commentMinSec;
if (patch.replyMinSec != null && patch.replyMaxSec == null) patch.replyMaxSec = Math.max(patch.replyMinSec, Number(src.replyMaxSec) || 120);
if (patch.replyMaxSec != null && patch.replyMinSec == null) patch.replyMinSec = Math.min(patch.replyMaxSec, Number(src.replyMinSec) || 2);
if (patch.replyMinSec != null && patch.replyMaxSec != null && patch.replyMaxSec < patch.replyMinSec) patch.replyMaxSec = patch.replyMinSec;
if (cid) {
const base = _mmCfg(null);
const own = {};
Object.keys(patch).forEach(k => { own[k] = patch[k] === base[k] ? null : patch[k]; });
_mmSet(cid, own);
} else Object.assign(data.momentsSettings, patch);
const pop = $('#mmPopup');
const popBefore = !!(data.momentsSettings || {}).momentPopup;
if (pop) data.momentsSettings.momentPopup = pop.checked;
save();
const changed = Object.keys(patch).some(k => String(patch[k]) !== String(src[k]))
|| (!!pop && !!pop.checked !== popBefore);
if (changed) autoSaveToast('朋友圈设置已保存');
}
function openMomentsSettings() {
const mask = $('#mmSetMask');
if (!mask) return;
document.querySelectorAll('#mmSetSheet .mm-set-group').forEach(g => {
g.classList.remove('is-open');
const h = g.querySelector('.mm-set-gt');
if (h) h.setAttribute('aria-expanded', 'false');
});
const body = document.querySelector('#mmSetSheet .fs-sheet-body');
if (body) body.scrollTop = 0;
renderMomentsCover();
renderMomentsSettings();
mask.hidden = false;
}
function closeMomentsSettings() {
const mask = $('#mmSetMask');
if (mask) mask.hidden = true;
}
(function bindMomentsSettings() {
const acts = document.querySelector('#momentsView .mm-acts');
const topbar = document.querySelector('header.topbar');
if (acts && topbar) topbar.appendChild(acts);
const btn = $('#mmSetBtn'); if (btn) btn.onclick = openMomentsSettings;
const close = $('#mmSetClose'); if (close) close.onclick = closeMomentsSettings;
const mask = $('#mmSetMask');
if (mask) mask.addEventListener('click', e => { if (e.target === mask) closeMomentsSettings(); });
const sheet = $('#mmSetSheet');
if (sheet) { sheet.addEventListener('input', saveMomentsNow); sheet.addEventListener('change', saveMomentsNow); }
const own = $('#mmOwnersSet');
if (own) own.addEventListener('click', e => {
const b = e.target.closest('[data-mm-scope]');
if (!b) return;
saveMomentsNow();
_mmScope = b.dataset.mmScope;
renderMomentsSettings();
});
const jump = $('#mmSetJump');
if (jump) jump.addEventListener('click', e => {
const b = e.target.closest('[data-mm-jump]');
if (!b) return;
const g = $('#mmSet' + b.dataset.mmJump.toUpperCase());
const body = document.querySelector('#mmSetSheet .fs-sheet-body');
if (!g || !body) return;
g.classList.add('is-open');
const head = g.querySelector('.mm-set-gt');
if (head) head.setAttribute('aria-expanded', 'true');
requestAnimationFrame(() => {
const top = g.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 48;
body.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
});
});
document.querySelectorAll('#mmSetSheet .mm-set-group').forEach(g => {
const head = g.querySelector('.mm-set-gt');
if (!head) return;
const flip = () => {
const open = g.classList.toggle('is-open');
head.setAttribute('aria-expanded', open ? 'true' : 'false');
};
head.addEventListener('click', flip);
head.addEventListener('keydown', ev => {
if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); flip(); }
});
});
const nameIn = $('#mmWallName');
if (nameIn) nameIn.addEventListener('input', () => {
_mmWallSet(nameIn.dataset.who || _mmScopeWho(), { name: nameIn.value.trim() });
_mmFaceRepaint();
});
const pv = $('#momentPv');
if (pv) pv.addEventListener('click', e => {
const rm = e.target.closest('[data-rm]');
if (rm) { _momentComposer.imgs.splice(Number(rm.dataset.rm), 1); _mmSyncPicker(); return; }
if (e.target.closest('[data-rm-stk]')) { _momentComposer.sticker = ''; _mmSyncPicker(); return; }
if (e.target.closest('[data-rm-v]')) { _momentComposer.video = ''; _momentComposer.vposter = ''; _momentComposer.vdur = 0; _mmSyncPicker(); return; }
if (e.target.closest('#momentPvAdd')) { const inp = $('#momentImageInput'); if (inp) inp.click(); }
});
})();
var _momentPopup = $('#momentPopup');
if (_momentPopup) {
const _pc = $('#momentPopupClose');
if (_pc) _pc.onclick = hideMomentPopup;
_momentPopup.addEventListener('transitionend', () => {
if (_momentPopup.classList.contains('moment-popup-hide')) _momentPopup.hidden = true;
});
}
updateHomeIndex();
(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['moments'] = true;
