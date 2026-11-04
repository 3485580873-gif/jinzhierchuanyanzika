// 本件由 tools/assemble.py 生成·勿手改：首屏 JS 分片（进这一页那一刻才取），源＝js/ 那些拆分件
(function () {
const acts = document.querySelector('#playerView .pl-head-btns');
const topbar = document.querySelector('header.topbar');
if (acts && topbar) topbar.appendChild(acts);
})();
var PL_MODE_NAME = { order: '顺序', loopOne: '单曲循环', shuffle: '随机' };
var PL_FILE_MAX = 25 * 1024 * 1024;
var PL_KEEP_INV = 30;
var PL_FILE_KEY = 'player-file:';
var PL_COOL_MUL = 3;
var PL_TA_PAUSE_PCT = 3;
var PL_TA_PAUSE_HOLD_MAX = 9000;
var PL_NCM_API = 'https://api.injahow.cn/meting/';
var PL_NCM_METING = ['https://api.qijieya.cn/meting/', 'https://api.injahow.cn/meting/'];
var PL_NCM_URL_BASES = (function () { const l = []; PL_NCM_METING.concat([PL_NCM_API]).forEach(function (b) { const s = String(b || '').trim().replace(/\/+$/, '') + '/'; if (s.length > 1 && l.indexOf(s) < 0) l.push(s); }); return l; })();
var PL_NCM_SEARCH_API = 'https://api.i-meto.com/meting/api';
var PL_SEARCH_VKEYS = 'https://api.vkeys.cn/v2/music/netease';
var PL_SEARCH_MS = 7000;
var PL_SEARCH_MS2 = 6000;
var PL_SEARCH_MAX = 60;
var PL_NCM_ACC_API = 'https://netease-cloud-music-api-backup-flame.vercel.app';
var PL_GRP = [
['invite', '邀你 · TA 主动开口', '回完话掷一次·隔够久才再邀'],
['act', '替你动手', '放着歌的时候 TA 插的手'],
['lyric', '摘一句', 'TA 借你在听的这首说话'],
['invrep', '邀 TA 的答复', '我开口邀 TA·三档合计当 100 读'],
];
var PL_SET_TABS = [
['companion', '陪伴'],
['perms', 'TA 的行为'],
['play', '播放'],
['account', '账号'],
['more', '其他'],
];
var plState = { tab: 'find', setTab: 'companion', favWho: 'mine', listWho: 'mine', list: '', listSort: 'added', perm: '', full: false, lrc: (typeof data === 'undefined' || !data || data.lyricOn !== false), vol: false, libKw: '', libSort: 'added', source: false, daily: false, ncmList: '', addTo: '', artist: '' };
var plFindType = '1';
var plBatchOn = false;
var plBatchSel = new Set();
var plPickFrom = '';
var plAudio = null, plCur_ = null, plInvite = null, plMenu = null, plBound = false;
var plFloatOn = !!(typeof data !== 'undefined' && data && data.plFloatOn);
var plCoNoBind = false;
var plInviteAny = false;
var plEl = null, plWaEl = null, plWaCtx = null, plWaNode = null, plWaGain = null, plWaBroken = false, _plOnlineDuckNoted = false;
var plTaFavTimer = 0, plPauseTimer = 0, plResumeTimer = 0, plPauseDone = '', plPauseOn = false, plPauseAt = 0;
var plListenLastCur = -1, plListenSavedAt = 0;
var plTaInviteTimer = 0;
var plInvAnswerTimers = {};
var plInvLaterTimers = {};
var plDelConfirm = 0;
function _plCfg(cid) {
const base = Object.assign({}, _plRoot().settings);
_plClampPerms(base);
const own = (data.playerBy || {})[cid || ''];
if (!own || typeof own !== 'object' || Array.isArray(own)) return base;
const merged = Object.assign(base, own);
_plClampPerms(merged);
return merged;
}
function _plCfgSet(cid, patch) {
if (!data.playerBy || typeof data.playerBy !== 'object' || Array.isArray(data.playerBy)) data.playerBy = {};
const id = cid || '';
if (!data.playerBy[id] || typeof data.playerBy[id] !== 'object') {
const c = _plCfg(id);
data.playerBy[id] = {};
PL_PERMS.forEach(p => { data.playerBy[id][p.k] = c[p.k]; });
}
const cur = data.playerBy[id];
Object.keys(patch).forEach(k => { cur[k] = patch[k]; });
const chk = {}; PL_PERMS.forEach(p => { chk[p.k] = cur[p.k]; });
_plClampPerms(chk);
Object.keys(chk).forEach(k => { cur[k] = chk[k]; });
save();
return cur;
}
function _plCoolEnd(cid) {
const map = _plRoot().coolEndBy || {};
const n = Number(map[cid || '']);
return Number.isFinite(n) && n > 0 ? n : 0;
}
function _plCoolSet(cid) {
const cfg = _plCfg(cid);
const lo = Math.max(1, cfg.cooldownMin | 0), hi = lo * PL_COOL_MUL;
const mins = lo + Math.floor(Math.random() * (hi - lo + 1));
const p = _plRoot();
if (!p.coolEndBy || typeof p.coolEndBy !== 'object' || Array.isArray(p.coolEndBy)) p.coolEndBy = {};
p.coolEndBy[cid || ''] = Date.now() + mins * 60000;
save();
return mins;
}
function _plTaFav(cid) {
const o = (data.playerBy || {})[cid || ''];
return o && Array.isArray(o.favs) ? o.favs.filter(x => typeof x === 'string') : [];
}
function plTaFav(cid, trackId) {
if (!cid || !trackId) return false;
const list = _plTaFav(cid).slice();
if (list.indexOf(trackId) >= 0) return false;
list.unshift(trackId);
if (!data.playerBy || typeof data.playerBy !== 'object' || Array.isArray(data.playerBy)) data.playerBy = {};
if (!data.playerBy[cid] || typeof data.playerBy[cid] !== 'object') _plCfgSet(cid, {});
data.playerBy[cid].favs = list.slice(0, 200);
save();
return true;
}
function _plTaOwners() {
const by = data.playerBy || {};
return ((data.contacts || []).filter(c => c && c.kind !== 'group').map(c => c.id))
.filter(id => Array.isArray(by[id] && by[id].favs) && by[id].favs.length);
}
function _plListOwners() {
const by = data.playerBy || {};
return ((data.contacts || []).filter(c => c && c.kind !== 'group').map(c => c.id))
.filter(id => Array.isArray(by[id] && by[id].ownLists) && by[id].ownLists.length);
}
function _plTaListOf(cid, listId) {
return _plTaOwnLists(cid).find(x => x && x.id === listId) || null;
}
function _plTaListRows(l) {
const seen = new Set();
return (Array.isArray(l && l.items) ? l.items : []).filter(it => {
if (!it || !it.nid || seen.has(String(it.nid))) return false;
seen.add(String(it.nid));
return true;
}).map(it => {
const id = 'ncm' + it.nid;
const own = plById(id);
return { id: id, nid: String(it.nid), name: String(it.name || '').trim() || ('网易云 ' + it.nid),
artist: String(it.artist || '').trim(), src: 'ncm', dur: Number(it.dur) || (own && own.dur) || 0,
pic: (own && own.pic) || String(it.pic || '') };
});
}
function _plNcmCookie() { return String(_plRoot().ncmCookie || '').trim().replace(/^MUSIC_U=/i, ''); }
function _plNcmApi() {
const p = _plRoot();
return String(p.ncmApi || p.ncmRelay || '').trim().replace(/\/+$/, '');
}
function _plNcmBase() { return _plNcmApi() || PL_NCM_ACC_API; }
function _plNcmNative() { try { return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()); } catch (e) { return false; } }
function _plNcmMixed(proto, base) {
if (_plNcmNative()) return false;
const p = String(proto || (typeof location !== 'undefined' ? location.protocol : '') || '');
const b = String(base || _plNcmBase() || '');
if (p !== 'https:' || !/^http:\/\//i.test(b)) return false;
try { const h = new URL(b).hostname; if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]') return false; } catch (e) {}
return true;
}
var plNcmUrlIdx = 0;
var plNcmUrlPend = -1;
var plNcmBaseTried = {};
var plNcmRealTried = {};
var plHealTry = {};
var PL_NCM_HEAL_MAX = 3;
var plTrialPrev = null;
var plTrialSeen = {};
function _plNcmUrl(nid, at) {
const i = (typeof at === 'number' && at >= 0 && at < PL_NCM_URL_BASES.length) ? at : plNcmUrlIdx;
return PL_NCM_URL_BASES[i] + '?server=netease&type=url&id=' + encodeURIComponent(String(nid));
}
function _plNextNcmBase() {
plNcmBaseTried[plNcmUrlIdx] = 1;
for (let i = 0; i < PL_NCM_URL_BASES.length; i++) if (!plNcmBaseTried[i]) { plNcmBaseTried[i] = 1; return i; }
return -1;
}
function _plHealReset() { plNcmBaseTried = {}; plNcmRealTried = {}; plHealTry = {}; plNcmUrlPend = -1; plTrialPrev = null; plTrialSeen = {}; }
var plNcmDeadAt = 0;
function _plNcmAsk(path, ms) {
const base = _plNcmBase(); if (!base) return Promise.resolve('');
if (_plNcmMixed()) { plNcmSayWhy = 'mixed'; return Promise.resolve(''); }
if (_plNcmDeadNow()) return Promise.resolve('');
const sep = path.indexOf('?') >= 0 ? '&' : '?';
const ck = _plNcmCookie();
return _plFetchText(base + path + sep + 'timestamp=' + Date.now() + (ck ? '&cookie=' + encodeURIComponent('MUSIC_U=' + ck) : ''), ms || 12000);
}
function _plNcmJSON(txt) { try { return JSON.parse(String(txt || '')); } catch (e) { return null; } }
async function _plNcmList(g) {
if (!g) return [];
if (g.as === 'list') {
const j = _plNcmJSON(await _plNcmAsk('/playlist/detail?id=' + encodeURIComponent(String(g.id)), 14000));
const pl = j && j.playlist ? j.playlist : null;
if (!pl || !Array.isArray(pl.tracks)) return [];
return pl.tracks.map(x => _plNcmRow(x)).filter(Boolean);
}
const j = _plNcmJSON(await _plNcmAsk('/song/detail?ids=' + encodeURIComponent(String(g.id)), 12000));
const arr = j && Array.isArray(j.songs) ? j.songs : [];
return arr.map(x => _plNcmRow(x)).filter(Boolean);
}
function _plNcmRow(s) {
if (!s || !s.id) return null;
const ar = Array.isArray(s.ar) ? s.ar : (Array.isArray(s.artists) ? s.artists : []);
const alb = s.al || s.album || null;
return { nid: String(s.id), name: String(s.name || '').trim(), artist: ar.map(x => x && x.name).filter(Boolean).join(' / '),
dur: Math.round(Number(s.dt || s.duration || 0) / 1000) || 0,
pic: _plPicFix(String((alb && (alb.picUrl || alb.blurPicUrl || alb.albumPicurl || alb.coverImgUrl)) || s.pic || s.cover || '')),
arId: ar.map(x => x && x.id).filter(Boolean).join(','), alId: alb && alb.id ? String(alb.id) : '' };
}
function _plNcmDeadNow() { return !!plNcmDeadAt && Date.now() - plNcmDeadAt < 60000; }
async function _plNcmRealUrl(nid) {
if (!nid || !_plNcmBase()) return '';
if (_plNcmDeadNow()) return '';
let u = '';
const pref = String(_plRoot().ncmQuality || '');
const lvs = pref === 'standard' ? ['standard']
: pref === 'exhigh' ? ['exhigh', 'standard']
: (_plNcmCookie() ? ['lossless', 'exhigh', 'standard'] : ['exhigh', 'standard']);
const askMs = _plNcmApi() ? 6000 : 3500;
for (let i = 0; i < lvs.length; i++) {
const txt = await _plNcmAsk('/song/url/v1?id=' + encodeURIComponent(String(nid)) + '&level=' + lvs[i], askMs);
if (!txt) { if (!_plNcmMixed()) plNcmDeadAt = Date.now(); return ''; }
const j = _plNcmJSON(txt);
u = j && j.data && j.data[0] && j.data[0].url ? String(j.data[0].url) : '';
if (u) break;
}
if (u) plNcmDeadAt = 0;
return u ? _plNcmFixUrl(u) : '';
}
function _plNcmFixUrl(u) {
const s = String(u || ''); if (!s) return '';
const api = _plNcmApi().toLowerCase();
if (api && s.toLowerCase().indexOf(api) === 0) return s;
return s.replace(/^http:\/\//i, 'https://');
}
function _plPicFix(u) {
const s = String(u || '').trim(); if (!s) return '';
if (plPicDeadHost(s)) return '';
const api = _plNcmApi().toLowerCase();
if (api && s.toLowerCase().indexOf(api) === 0) return s;
return _plPic126(s.replace(/^http:\/\//i, 'https://'), false);
}
var PL_PIC_SZ = '500y500', PL_PIC_SZ_BIG = '800y800';
var plPicHi = {}, plPicPending = {}, plPicDead = {}, plPicQueue = [], plPicBusy = 0;
function _plIs126(u) { return /^https?:\/\/[^/]*music\.126\.net\//i.test(String(u || '')); }
function _plPic126(u, big) {
const s = String(u || ''); if (!s || !_plIs126(s)) return s;
const sz = big ? PL_PIC_SZ_BIG : PL_PIC_SZ;
return /[?&]param=/i.test(s) ? s.replace(/([?&]param=)[^&]*/i, '$1' + sz)
: s + (s.indexOf('?') >= 0 ? '&' : '?') + 'param=' + sz;
}
function _plPicHi(u, big) {
const s = String(u || ''); if (!s) return s;
const d = _plPic126(s, big); if (d !== s) return d;
const hit = plPicHi[s]; return hit ? _plPic126(hit, big) : s;
}
function _plPicUpgrade(url) {
const s = String(url || ''); if (!s || _plIs126(s)) return;
if (plPicHi[s] || plPicPending[s]) return;
if (plPicDead[s] && Date.now() - plPicDead[s] < 600000) return;
if (typeof fetch !== 'function') { plPicDead[s] = Date.now(); return; }
plPicPending[s] = 1; plPicQueue.push(s); _plPicPump();
}
function _plPicPump() {
while (plPicBusy < 4 && plPicQueue.length) {
const s = plPicQueue.shift(); plPicBusy++;
fetch(s, { method: 'HEAD', redirect: 'follow' })
.then(r => { const f = String((r && r.url) || ''); const d = _plPic126(f, false);
if (d && d !== f) { plPicHi[s] = f; _plPicSwap(s, d); } })
.catch(() => { plPicDead[s] = Date.now(); })
.finally(() => { plPicBusy--; delete plPicPending[s]; _plPicPump(); });
}
}
function _plPicSwap(o, n) {
try {
const q = 'img[data-src="' + o.replace(/"/g, '\\"') + '"]';
document.querySelectorAll(q).forEach(im => { im.setAttribute('data-src', n); });
document.querySelectorAll('img[src="' + o.replace(/"/g, '\\"') + '"]').forEach(im => { im.setAttribute('src', n); });
} catch (e) {}
let changed = false;
(plTracks() || []).forEach(t => { if (t && t.pic === o) { t.pic = n; changed = true; } });
if (changed) {
try { save(); } catch (e) {}
const c = plCur();
if (c && c.pic === n) _plMediaSync(c, _plPlayingNow());
}
try {
const cvb = document.querySelector('#playerFull .pl-cover-box');
if (cvb) { cvb.dataset.pic = ''; if (typeof renderPlayerFull === 'function') renderPlayerFull(); }
} catch (e) {}
}
var plQrKey = '', plQrTimer = 0, plQrSay = '', plQrImg = '', plNcmProfile = null, plNcmSyncAt = 0,
plFindKw = '', plFindSay = '', plFindRows = null, plFindBad = false, plFindCut = false, plSearchTok = 0,
plNcmDaily = [], plNcmDailySay = '', plNcmDailySeq = 0,
plNcmLists = [], plNcmListsSay = '', plNcmListsSeq = 0, plNcmSayWhy = '';
function _plNcmLogged() { return !!_plNcmCookie(); }
function _plNcmResetMine() { plNcmProfile = null; plNcmSyncAt = 0; plNcmSayWhy = ''; plNcmDaily = []; plNcmDailySay = ''; plNcmLists = []; plNcmListsSay = ''; closePlayerDaily(); closePlayerNcmList(); }
function _plNcmName() { return (plNcmProfile && String(plNcmProfile.nickname || '')) || ''; }
function _plNcmStopQr() { if (plQrTimer) { clearTimeout(plQrTimer); plQrTimer = 0; } }
function _plCookieIn(s) { const m = String(s || '').match(/MUSIC_U=([^;]+)/); return m ? m[1] : ''; }
function _plNcmSyncProfile(force) {
if (!_plNcmLogged()) { plNcmProfile = null; return Promise.resolve(null); }
if (!force && plNcmProfile && Date.now() - plNcmSyncAt < 60000) return Promise.resolve(plNcmProfile);
return _plNcmAsk('/login/status', 8000).then(txt => {
const j = _plNcmJSON(txt);
const p = (j && j.data && j.data.profile) || (j && j.profile) || null;
if (p) { plNcmProfile = { uid: String(p.userId || ''), nickname: String(p.nickname || ''), avatar: String(p.avatarUrl || '') }; plNcmSyncAt = Date.now(); plNcmSayWhy = ''; }
else plNcmSayWhy = txt ? 'cookie' : (_plNcmMixed() ? 'mixed' : 'down');
return plNcmProfile;
}).catch(() => { plNcmSayWhy = plNcmSayWhy || 'down'; return plNcmProfile; });
}
function _plNcmAccWhy() {
if (!_plNcmLogged()) return 'off';
if (_plNcmMixed() || plNcmSayWhy === 'mixed') return 'mixed';
if (plNcmSayWhy === 'cookie') return 'cookie';
if (plNcmSayWhy === 'down' || _plNcmDeadNow()) return 'down';
if (!plNcmProfile) return 'unverified';
return '';
}
function _plNcmAccLabel(why) {
const w = why || _plNcmAccWhy();
return w === 'mixed' ? '本站是 https · 拦掉了局域网 http 接口'
: w === 'down' ? '已存票据 · 接口没答上'
: w === 'cookie' ? '票据过期了 · 重填一次'
: w === 'unverified' ? '已存票据 · 还没验证通'
: w === '' ? '已登录' : '未登录';
}
function _plNcmAccSay(why) {
const w = why || _plNcmAccWhy();
const who = _plNcmApi() ? '那台接口' : '公开那台接口';
return w === 'mixed' ? '本站是 https，而你填的那台是局域网 http＝浏览器整条拦掉（那台机器没坏）。「每日推荐∶我的歌单∶会员歌完整版」这三件现在用不上——换一台 https 的接口，或照那枚指引把本站也用局域网地址打开'
: w === 'down' ? who + '没答上＝「每日推荐∶我的歌单∶会员歌完整版」这三件现在用不上·这跟票据过期不是一件事'
+ (_plNcmApi() ? '（它还在跑吗？手机与它在同一个网络吗？）' : '（别人共享的机器·2026-10-28 实测 15 秒不回，不是等一会儿就好·要这三件得填你自己那台）')
: w === 'unverified' ? '票据存了，可' + who + '没答上（一次也没验证通过）＝「每日推荐∶我的歌单∶会员歌完整版」多半同样取不到·点「测一下那台」问一句就知道'
: w === 'cookie' ? '接口答了，但取不到这个账号＝MUSIC_U 多半过期了，重新复制一份填进来'
: '';
}
var PL_NCM_API_SAY = '没填＝没有一台稳的接口（公开那台 2026-10-28 实测 15 秒不回）。要日推∶歌单∶会员完整版就填你自己那台·线上站是 https·这里也得填 https 的地址';
function _plNcmAccWarn() {
const why = _plNcmAccWhy();
const say = _plNcmAccSay(why);
if (!say) return '';
return '<div class="pl-note">' + escapeHTML(say) +
' <button type="button" class="pl-link" data-pl-act="ncmhelp">怎么弄一台自己的接口</button></div>';
}
var PL_NCM_SELFHELP =
'登录能多得到三样：每日推荐∶我的歌单∶会员歌完整版。这三样不是本站跑的——它要有一台答话的「网易云接口」（中转），本站只负责问它；票据（MUSIC_U）只存在你自己设备上，本站不代存、也不把它发给第三台机器。\n\n'
+ '一·登（有一条通着的接口就能登，两条路随便挑）\n'
+ '① 二维码登录：点「二维码登录」，用手机上的网易云 App 扫屏上的码——最省事，票据自动存好。\n'
+ '② 手填 MUSIC_U：电脑浏览器打开 music.163.com 并登录 → 按 F12 → Application（应用）→ Cookies → 找到名叫 MUSIC_U 的那一条 → 复制它的值 → 粘进「手填 MUSIC_U」。\n'
+ '没填自己接口时用的是公开兜底那台；它是别人共享的机器、随时可能是死的，登之前先点「测一下那台」看一眼读数。\n\n'
+ '二·弄一台通着的接口（三选一，软件都不要钱）\n'
+ 'A·自己电脑＋免费隧道（推荐，约十分钟，出门在外也能用）\n'
+ '　1. 电脑装 Node.js，命令行敲：npx NeteaseCloudMusicApi（默认听 3000 端口，窗口别关）；\n'
+ '　2. 再开一个命令行装隧道：winget install Cloudflare.cloudflared；\n'
+ '　3. 起隧道：cloudflared tunnel --url http://localhost:3000 —— 它会打印一条 https://xxx.trycloudflare.com 的地址；\n'
+ '　4. 把那条 https 地址填进「网易云接口地址」→ 点「测一下那台」确认通。\n'
+ '　⚠ 这条地址电脑重启后会变，变了要重填一次；电脑关机＝接口答不上，站点会自动退回放免费歌，不会报错卡死。\n'
+ 'B·局域网直连（不经过公网，但只在一件事成立时行得通）\n'
+ '　手机与电脑连同一个 Wi-Fi，手机输 http://电脑IP:3000——前提是本站也要用局域网地址打开。本站若是 https（比如部署在网上那份），浏览器会把「去问局域网 http」整条拦掉，填了地址也一样不通，这不是那台没跑。\n'
+ 'C·VPS／有域名的机器（一次配好长期不变）\n'
+ '　把同一套跑起来、套上 https，再把那个 https 地址填进「网易云接口地址」。\n\n'
+ '三·不想折腾接口？\n'
+ '不登录照旧放免费歌，「发现」里随时能搜；大部分会员歌会退回公开接口取整曲，只有「无损」那一档必须要你自己的接口。登录是加成不是闸门。\n\n'
+ '（站内原本兜底的那台公开实例 2026-10-28 实测 15 秒不回，随时可能是死的——这三件能不能用，以「测一下那台」那句读数为准。）';
function plNcmSelfHelp() {
window.openModal('怎么弄一台自己的接口', '', () => {}, { noInput: true, okText: '知道了', staticText: PL_NCM_SELFHELP });
}
function plNcmQrStart() {
_plNcmStopQr();
plQrImg = ''; plQrSay = '正在取二维码…'; renderPlayerNcm();
_plNcmAsk('/login/qr/key', 9000).then(txt => {
const j = _plNcmJSON(txt);
const key = (j && j.data && j.data.unikey) ? String(j.data.unikey) : '';
if (!key) { plQrSay = '没取到二维码·那台没答上（过一会儿再试，或改用手填 MUSIC_U）'; renderPlayerNcm(); return; }
plQrKey = key;
return _plNcmAsk('/login/qr/create?key=' + encodeURIComponent(key) + '&qrimg=true', 12000).then(t2 => {
const j2 = _plNcmJSON(t2);
const img = (j2 && j2.data && j2.data.qrimg) ? String(j2.data.qrimg) : '';
if (!img) { plQrSay = '拿到了钥匙，但二维码图没取到·再点一次'; renderPlayerNcm(); return; }
plQrImg = img; plQrSay = '用网易云 App 扫一下'; renderPlayerNcm();
plQrPoll(0);
});
}).catch(() => { plQrSay = '连不上那台服务器（过一会儿再试）'; renderPlayerNcm(); });
}
function plQrPoll(n) {
if (!plQrKey) return;
_plNcmAsk('/login/qr/check?key=' + encodeURIComponent(plQrKey), 9000).then(txt => {
const j = _plNcmJSON(txt);
const code = j && Number(j.code);
if (code === 800) { plQrImg = ''; plQrSay = '二维码过期了·再点一次登录'; renderPlayerNcm(); return; }
if (code === 802) { plQrSay = '扫到了·在手机上点一下确认'; renderPlayerNcm(); }
if (code === 803) {
const ck = _plCookieIn(j && j.cookie);
if (!ck) { plQrImg = ''; plQrSay = '手机上确认了，但没拿到票据·再点一次'; renderPlayerNcm(); return; }
_plRoot().ncmCookie = ck; save();
plQrImg = ''; plQrSay = '登录成功'; plNcmSayWhy = ''; _plNcmResetMine();
_plNcmSyncProfile(true).then(() => { renderPlayerNcm(); renderPlayerSettings(); renderPlayerAll(); showToast('网易云登录成功' + (_plNcmName() ? ' · ' + _plNcmName() : '')); });
return;
}
if (n > 72) { plQrImg = ''; plQrSay = '等太久了·再点一次登录'; renderPlayerNcm(); return; }
plQrTimer = setTimeout(() => plQrPoll(n + 1), 2500);
}).catch(() => { plQrTimer = setTimeout(() => plQrPoll(n + 1), 3000); });
}
function plNcmLogout() {
_plNcmStopQr();
plQrKey = ''; plQrImg = ''; plQrSay = ''; _plNcmResetMine();
_plRoot().ncmCookie = ''; save(); flushSave();
renderPlayerNcm(); renderPlayerSettings(); renderPlayerAll();
showToast('已退出网易云；免费歌照旧能放');
}
function openPlayerNcm() { _plNcmSyncProfile(false).then(() => { if (plState.ncm) renderPlayerNcm(); }); if (!plQrKey) plQrSay = ''; plState.ncm = 1; renderPlayerNcm(); _plMask('plNcmMask', true); }
function closePlayerNcm() { _plNcmStopQr(); plState.ncm = 0; _plMask('plNcmMask', false); }
function renderPlayerNcm() {
const box = document.getElementById('plNcmBody'); if (!box) return;
const logged = _plNcmLogged(), nm = _plNcmName();
const st = plQrImg
? '<div class="pl-qr"><img src="' + plQrImg + '" alt="网易云登录二维码"></div><div class="pl-qr-st">' + escapeHTML(plQrSay) + '</div>'
: (plQrSay ? '<div class="pl-qr-st">' + escapeHTML(plQrSay) + '</div>' : '');
box.innerHTML =
'<div class="pl-set-lab">网易云账号<span>' + escapeHTML(_plNcmAccLabel()) + '</span></div>' +
(logged
? '<div class="pl-song">' + (plNcmProfile && plNcmProfile.avatar
? '<img class="pl-qava" src="' + escapeHTML(plNcmProfile.avatar) + '" alt="">' : _plNoteSvg()) +
'<span class="pl-tx"><span class="pl-nm">' + escapeHTML(nm || '网易云账号') + '</span>' +
'<span class="pl-ar">' + escapeHTML(_plNcmAccWhy() ? '票据只在这台设备上 · 会员完整版还要一台答话的接口'
: '会员歌取完整版 · 票据只在这台设备上') + '</span></span></div>'
: '<div class="pl-note">不登录照旧放免费歌。手填 MUSIC_U 不用装任何东西；二维码登录要用网易云 App 扫一下。</div>') +
_plNcmAccWarn() +
st +
'<div class="pl-set-row" data-pl-act="ncmapi"><span class="pl-tx"><b>网易云接口地址</b><small>' +
escapeHTML(_plNcmApi() || PL_NCM_API_SAY) +
'</small></span><span class="pl-chev">改</span></div>' +
'<div class="pl-set-row" data-pl-act="ncmtest"><span class="pl-tx"><b>测一下那台</b><small>它到底答不答·会员歌能不能取到完整版</small></span><span class="pl-chev">测</span></div>' +
'<div class="pl-acts">' +
(logged
? '<button type="button" class="pl-btn" data-pl-act="ncmqr">换个号登</button><button type="button" class="pl-btn" data-pl-act="ncmout">退出登录</button>'
: '<button type="button" class="pl-btn pri" data-pl-act="ncmcookie">手填 MUSIC_U</button>' +
'<button type="button" class="pl-btn" data-pl-act="ncmqr">二维码登录</button>') +
'</div>' +
'<div class="pl-note">搜歌不用登录：播放器第一格「发现」随时能搜（走公开接口）。登录与那两把清单（每日推荐∶我的歌单）用的是上面那一台接口。 <button type="button" class="pl-link" data-pl-act="ncmhelp">怎么弄一台自己的接口</button></div>';
}
function plNcmTest() {
const base = _plNcmBase();
if (_plNcmMixed(location.protocol, base)) {
showToast('这台地址是 http，而本站是 https＝浏览器会当混合内容整条拦掉（不是那台没跑）；换 https 那台，或用局域网 http 直接打开本站');
return;
}
showToast('正在问 ' + (base.replace(/^https?:\/\//, '').split('/')[0] || '那台') + ' …');
_plNcmAsk('/login/status', 8000).then(txt => {
if (!txt) { plNcmDeadAt = Date.now(); showToast('这台没答上（连不上／超时／地址写错）·换一台，或确认手机与它同一网络'); renderPlayerNcm(); return; }
plNcmDeadAt = 0;
_plHealReset(); _plFailReset();
const j = _plNcmJSON(txt);
const p = (j && j.data && j.data.profile) || (j && j.profile) || null;
if (!p) { plNcmSayWhy = 'cookie'; showToast('接口答了，但取不到账号＝cookie 多半过期了，重新复制一份 MUSIC_U'); renderPlayerNcm(); return; }
plNcmSayWhy = '';
plNcmProfile = { uid: String(p.userId || ''), nickname: String(p.nickname || ''), avatar: String(p.avatarUrl || '') };
plNcmSyncAt = Date.now();
showToast('接口答上了 · ' + (p.nickname || '已登录') + '·会员歌取完整版这条路是通的');
renderPlayerNcm(); renderPlayerAll();
});
}
function plNcmApiSet() {
window.openModal('网易云接口地址', _plNcmApi(), v => {
const s = String(v || '').trim().replace(/\/+$/, '');
if (s && !/^https?:\/\/\S+$/i.test(s)) { showToast('填一整条地址，例 https://你的域名:3000；局域网那种 http 地址只有「本站也用局域网打开」时才用得上'); return; }
_plRoot().ncmApi = s; save(); flushSave();
plNcmDeadAt = 0;
_plHealReset(); _plFailReset();
plNcmProfile = null; plNcmSayWhy = ''; plNcmSyncAt = 0;
plNcmDaily = []; plNcmDailySay = ''; plNcmLists = []; plNcmListsSay = '';
closePlayerDaily(); closePlayerNcmList();
renderPlayerNcm(); renderPlayerSettings();
if (!s) { renderPlayerAll(); showToast('清空了＝落回公开那台兜底实例（它 2026-10-28 实测 15 秒不回＝那三件多半取不到）'); return; }
_plNcmSyncProfile(true).then(pf => {
renderPlayerNcm(); renderPlayerAll();
showToast(pf && pf.nickname ? '接口已接上 · ' + pf.nickname
: '地址存了·' + (_plNcmAccSay() || '这一台暂时也没答上'));
});
}, { staticText: '留空＝用公开那台兜底实例（2026-10-28 本机实测 15 秒不回，别指望它）。要「每日推荐∶我的歌单∶会员歌完整版」就得有一台答话的接口——自己那台最稳：跑一台 NeteaseCloudMusicApi（怎么跑见「怎么弄一台自己的接口」那一弹），把它的地址填这里。\n⚠ 本站是 https 时这里只能填 https 的地址：填局域网那种 http 会被浏览器按混合内容整条拦掉（填了也白填）；要用局域网那台，就把本站也用局域网地址在手机上打开。\n本站不代存你的票据，也不把它发给第三台机器。' });
}
function _plArLinksHTML(artist, arId) {
const s = String(artist || '').trim();
if (!s) return '未知歌手';
const ids = String(arId || '').split(',');
return s.split(' / ').map(x => x.trim()).filter(Boolean).map((nm, i) =>
'<span class="pl-ar-link" data-pl-act="aropen" data-ar-id="' + escapeHTML(ids[i] || '') + '" data-ar-nm="' + escapeHTML(nm) + '">' + escapeHTML(nm) + '</span>').join(' / ');
}
function _plFindResInnerHTML() {
if (plFindSay) {
const again = (plFindBad && plFindKw) ? '<div class="pl-acts"><button type="button" class="pl-btn" data-pl-act="ncmretry">再问一遍</button></div>' : '';
return '<div class="pl-add-log"><div' + (plFindBad ? ' class="bad"' : '') + '>' + escapeHTML(plFindSay) + '</div></div>' + again;
}
if (!Array.isArray(plFindRows)) return '';
if (plFindType === '100') {
return plFindRows.map(r =>
'<button type="button" class="pl-res pl-ar-row" data-pl-act="aropen" data-ar-id="' + escapeHTML(r.aid || '') + '" data-ar-nm="' + escapeHTML(r.name || '') + '">' +
_plCovHTML(r.pic) +
'<span class="pl-tx"><b>' + escapeHTML(r.name || '未知歌手') + '</b>' + (r.alias ? '<small>' + escapeHTML(r.alias) + '</small>' : '') + '</span>' +
'<span class="pl-chev">›</span></button>').join('') +
'<div class="pl-note">点一位＝看 TA 的主页（有接口＝头像·简介·热门歌·播放全部；没有＝按名字拢一批 TA 的歌）。回搜歌点上面「单曲」。</div>';
}
const rows = plFindRows.map(r => {
const id = 'ncm' + r.nid;
const inLib = (typeof plById === 'function') && !!plById(id);
const picked = plBatchOn && plBatchSel.has(id);
const attr = ' data-nid="' + escapeHTML(r.nid) + '" data-nm="' + escapeHTML(r.name) +
'" data-ar="' + escapeHTML(r.artist) + '" data-du="' + (r.dur || 0) + '" data-dp="' + escapeHTML(r.pic || '') + '" data-ar-id="' + escapeHTML(r.arId || '') + '"';
return '<div class="pl-res-wrap' + (picked ? ' sel' : '') + (plBatchOn && inLib ? ' off' : '') + '" data-pl-find="' + escapeHTML(id) + '">' +
(plBatchOn ? '<span class="pl-batch-chk' + (inLib ? ' void' : '') + '" aria-hidden="true"></span>' : '') +
'<button type="button" class="pl-res" data-pl-act="ncmplay"' + attr + '>' +
_plCovHTML(r.pic) +
'<span class="pl-tx"><b>' + escapeHTML(r.name || ('网易云 ' + r.nid)) + '</b><small>' + _plArLinksHTML(r.artist, r.arId) +
(r.dur ? ' · ' + _plDur(r.dur) : '') + '</small></span>' +
'<span class="pl-chev' + (inLib ? ' in-lib' : '') + '">' + (inLib ? '在库' : '播') + '</span></button>' +
'<span class="pl-res-slot">' + (inLib || plBatchOn ? '' : '<button type="button" class="pl-res-add" data-pl-act="ncmadd"' + attr + '>收</button>') + '</span>' +
'</div>';
}).join('');
let notIn = 0;
plFindRows.forEach(r => { if (r && r.nid && !(typeof plById === 'function' && plById('ncm' + r.nid))) notIn++; });
const batch = (!plBatchOn && plFindRows.length > 1 && notIn > 0)
? '<div class="pl-acts"><button type="button" class="pl-btn" data-pl-batch="enter">勾选要收的 · 本页 ' + notIn + ' 首还没收</button></div>' : '';
const cut = plFindCut ? '<div class="pl-note">只列了前 ' + PL_SEARCH_MAX + ' 条 · 把歌名或歌手写准一点能缩小范围</div>' : '';
return batch + rows + cut;
}
function _plFindResHTML() { return '<div id="plSearchRes">' + _plFindResInnerHTML() + '</div>'; }
function renderPlayerFind() {
const body = document.getElementById('plBody'); if (!body) return;
_plLazy();
const kwEl = document.getElementById('plSearchKw');
if (kwEl && kwEl.value) plFindKw = kwEl.value;
body.innerHTML = '<div class="pl-find">' +
'<div class="pl-set-lab">搜一首<span>' + (_plNcmApi() ? '走你的接口 · 更稳' : '公开接口 · 抽风时填自己那台') + '</span></div>' +
'<div class="pl-search"><span class="pl-search-box"><input type="text" class="pl-in pl-search-in" id="plSearchKw" placeholder="歌名或歌手" autocomplete="off" spellcheck="false" value="' + escapeHTML(plFindKw) + '"><button type="button" class="pl-search-x" data-pl-act="ncmclear" aria-label="清空搜索词">×</button></span><button type="button" class="pl-btn" data-pl-act="ncmsearch">搜索</button></div>' +
'<div class="pl-find-type"><button type="button" class="pl-type-tab" data-pl-act="ftype" data-ft="1"' + (plFindType === '1' ? ' data-on="1"' : '') + '>单曲</button><button type="button" class="pl-type-tab" data-pl-act="ftype" data-ft="100"' + (plFindType === '100' ? ' data-on="1"' : '') + '>歌手</button></div>' +
_plFindResHTML() +
'<div class="pl-ncm-sec" id="plRandSec">' + _plRandHTML() + '</div>' +
'<div id="plNcmSec">' + _plNcmDiscoverHTML() + '</div>' +
(plFindSay ? '' : '<div class="pl-note">点一行＝收进曲库并开始播放；右边那枚「收」＝只收不播（不动正在放的这首）；「勾选要收的」＝挑着几首一起收（已经在库的那几行会灰掉）。要整个歌单请走右上「添加」贴链接那一条。</div>') +
'</div>';
if (_plNcmLogged()) {
if (!plNcmDaily.length && !plNcmDailySay) plNcmDailyLoad();
if (!plNcmLists.length && !plNcmListsSay) plNcmListsLoad();
}
}
function _plNcmDiscoverHTML() {
const hasRes = !plFindSay && Array.isArray(plFindRows) && plFindRows.length > 0;
const open = (plState.ncmOpen === undefined || plState.ncmOpen === null) ? !hasRes : !!plState.ncmOpen;
const hd = '<div class="pl-ncm-sec-hd">网易云<span>' +
'<button type="button" class="pl-link" data-pl-act="ncmfold">' + (open ? '收起' : '展开') + '</button>' +
(_plNcmLogged() ? '<button type="button" class="pl-link" data-pl-act="ncmlistsrefresh">重新取歌单</button>' : '') +
'</span></div>';
if (!_plNcmLogged()) {
return '<div class="pl-ncm-sec">' + hd +
(open
? '<button type="button" class="pl-set-row pl-ncm-entry" data-pl-act="ncm">' +
'<span class="pl-tx"><b>登录网易云</b><small>登录后可看「每日推荐」与「我的歌单」·这两样还得有一台答话的接口（本站不代跑）</small></span>' +
'<span class="pl-chev">登录</span></button>'
: '') + '</div>';
}
const dc = (plNcmDaily[0] || {}).pic || '';
const sub = plNcmDaily.length ? _plToday() + ' · ' + plNcmDaily.length + ' 首' : (plNcmDailySay || '点开取今天这一份');
const daily = '<button type="button" class="pl-ncm-daily" data-pl-act="ncmdaily">' +
'<span class="pl-ncm-daily-cov">' + (dc ? _plNetImg(dc) : _plNoteSvg()) + '</span>' +
'<span class="pl-ncm-daily-tx"><b>每日推荐</b><small>' + escapeHTML(sub) + '</small></span>' +
'<span class="pl-chev">›</span></button>';
const lists = plNcmLists.length
? '<div class="pl-ncm-sub">我的歌单</div><div class="pl-ncm-strip">' + plNcmLists.map(r =>
'<button type="button" class="pl-ncm-cell" data-pl-act="ncmlist" data-pid="' + escapeHTML(r.id) + '" data-pnm="' + escapeHTML(r.name) + '">' +
'<span class="pl-ncm-cell-cov">' + (r.cover ? _plNetImg(r.cover) : _plNoteSvg()) + '</span>' +
'<span class="pl-ncm-cell-nm">' + escapeHTML(r.name) + '</span>' +
'<span class="pl-ncm-cell-n">' + (r.count || 0) + ' 首</span></button>').join('') + '</div>'
: '<div class="pl-ncm-sub">我的歌单</div><div class="pl-ncm-empty">' + escapeHTML(plNcmListsSay || '正在取你的歌单…') + '</div>';
return '<div class="pl-ncm-sec">' + hd +
_plNcmAccWarn() +
(open ? daily + lists : '') + '</div>';
}
function _plNcmPaintDiscover() {
const box = document.getElementById('plNcmSec');
if (box) box.innerHTML = _plNcmDiscoverHTML();
_plLazy();
}
function openPlayerSource() { plState.source = true; closePlayerDaily(); closePlayerNcmList(); const v = document.getElementById('plSourceFull'); if (v) v.hidden = false; renderPlayerSource(); }
function closePlayerSource() { closePlayerDaily(); closePlayerNcmList(); plState.source = false; const v = document.getElementById('plSourceFull'); if (v) v.hidden = true; }
function renderPlayerSource() {
const box = document.getElementById('plSourceBody'); if (!box || !plState.source) return;
const logged = _plNcmLogged(), nm = _plNcmName();
box.innerHTML =
'<div class="pl-src-grp">' +
'<div class="pl-src-hd">网易云音乐<span>' + escapeHTML(_plNcmAccLabel()) + (logged && nm ? ' · ' + escapeHTML(nm) : '') + '</span></div>' +
'<div class="pl-set-row" data-pl-act="ncm"><span class="pl-tx"><b>' + (logged ? escapeHTML(nm || '网易云账号') : '登录网易云') + '</b><small>' + (logged ? '票据只在这台设备上 · 点开可退出/换号' : '手填 MUSIC_U 或扫码 · 会员完整版还要有一台答话的接口') + '</small></span><span class="pl-chev">' + (logged ? '›' : '登录') + '</span></div>' +
'<div class="pl-set-row" data-pl-act="ncmapi"><span class="pl-tx"><b>网易云接口地址</b><small>' + escapeHTML(_plNcmApi() || PL_NCM_API_SAY) + '</small></span><span class="pl-chev">改</span></div>' +
_plNcmAccWarn() +
'<div class="pl-note">每日推荐与我的歌单在「发现」那一格（点播放器页签第一枚）；这里只管登录与接口。</div>' +
'</div>' +
'<div class="pl-note">搜索、每日推荐与我的歌单都在「发现」；这里只管账号与接口。票据只存在这台设备上，本站不代存也不外发。 <button type="button" class="pl-link" data-pl-act="ncmhelp">怎么弄一台自己的接口</button></div>';
}
function plNcmDailyLoad() {
const seq = ++plNcmDailySeq;
plNcmDaily = []; plNcmDailySay = '正在取每日推荐…'; _plNcmPaintDiscover(); renderPlayerDaily(); renderPlayerSource();
_plNcmAsk('/recommend/songs', 14000).then(txt => {
if (seq !== plNcmDailySeq) return;
const j = _plNcmJSON(txt);
const arr = (j && j.data && Array.isArray(j.data.dailySongs)) ? j.data.dailySongs : [];
plNcmDaily = arr.slice(0, 30).map(x => _plNcmRow(x)).filter(Boolean);
plNcmDailySay = plNcmDaily.length ? '' : _plNcmWhyNoAnswer(txt);
_plNcmPaintDiscover(); renderPlayerDaily(); renderPlayerSource();
}).catch(() => { if (seq !== plNcmDailySeq) return; plNcmDailySay = '这一趟没走通（过一会儿再重新取）'; _plNcmPaintDiscover(); renderPlayerDaily(); renderPlayerSource(); });
}
function plNcmListsLoad() {
const seq = ++plNcmListsSeq;
plNcmLists = []; plNcmListsSay = '正在取你的歌单…'; _plNcmPaintDiscover(); renderPlayerSource();
const go = uid => {
_plNcmAsk('/user/playlist?uid=' + encodeURIComponent(uid) + '&limit=30&offset=0', 14000).then(txt => {
if (seq !== plNcmListsSeq) return;
const j = _plNcmJSON(txt);
const arr = (j && Array.isArray(j.playlist)) ? j.playlist : ((j && j.data && Array.isArray(j.data.playlist)) ? j.data.playlist : []);
plNcmLists = arr.filter(x => x && x.id).map(x => ({ id: String(x.id), name: String(x.name || '歌单'), count: Number(x.trackCount) || 0,
cover: _plPicFix(String(x.coverImgUrl || x.picUrl || '')) }));
plNcmListsSay = plNcmLists.length ? '' : _plNcmWhyNoAnswer(txt);
_plNcmPaintDiscover(); renderPlayerSource();
}).catch(() => { if (seq !== plNcmListsSeq) return; plNcmListsSay = '这一趟没走通（过一会儿再重新取）'; _plNcmPaintDiscover(); renderPlayerSource(); });
};
const uid = plNcmProfile && plNcmProfile.uid;
if (uid) { go(uid); return; }
_plNcmSyncProfile(true).then(pf => {
if (seq !== plNcmListsSeq) return;
if (pf && pf.uid) go(pf.uid);
else { plNcmListsSay = plNcmSayWhy === 'cookie' ? '票据取不到账号信息（cookie 过期了·重填一次 MUSIC_U）'
: plNcmSayWhy === 'down' ? _plNcmWhyNoAnswer('') : ''; renderPlayerSource(); }
});
}
function _plNcmWhyNoAnswer(txt) {
if (txt) return '没取到东西（这一趟要登录网易云才有·私密歌单也一样）';
return _plNcmAccSay() || '这一问那台没回包（本站不代跑它，只问它）·过一会儿点「重新取」';
}
var plNcmListId = '', plNcmListSongs = [], plNcmListSay = '', plNcmListSeq = 0, plNcmListMeta = null;
function _plToday() { const d = new Date(); return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate(); }
function openPlayerDaily() {
plState.daily = true;
const v = document.getElementById('plDailyFull'); if (v) v.hidden = false;
renderPlayerDaily();
if (!plNcmDaily.length && !plNcmDailySay) plNcmDailyLoad();
}
function closePlayerDaily() { plState.daily = false; const v = document.getElementById('plDailyFull'); if (v) v.hidden = true; }
function openPlayerNcmList(pid, pnm) {
const meta = plNcmLists.find(x => String(x.id) === String(pid)) || { id: String(pid || ''), name: String(pnm || '歌单'), count: 0, cover: '' };
if (!meta.id) return;
plNcmListId = String(meta.id);
plState.ncmList = plNcmListId;
plNcmListMeta = { name: meta.name || '歌单', count: Number(meta.count) || 0, cover: meta.cover || '' };
plNcmListSongs = []; plNcmListSay = '';
const v = document.getElementById('plNcmFull'); if (v) v.hidden = false;
renderPlayerNcmList();
plNcmListLoad(plNcmListId);
}
function closePlayerNcmList() { plState.ncmList = ''; plNcmListId = ''; const v = document.getElementById('plNcmFull'); if (v) v.hidden = true; }
var plArtistId = '', plArtistNm = '', plArtistRows = [], plArtistSay = '', plArtistMeta = null, plArtistSeq = 0;
function openPlayerArtist(aid, nm) {
aid = String(aid || '').trim(); nm = String(nm || '').trim();
if (!aid && !nm) return;
plArtistId = aid; plArtistNm = nm || ('网易云歌手 ' + aid);
plArtistRows = []; plArtistSay = ''; plArtistMeta = null;
plState.artist = plArtistId || plArtistNm;
const v = document.getElementById('plArtistFull'); if (v) v.hidden = false;
renderPlayerArtist();
plArtistLoad();
}
function closePlayerArtist() { plState.artist = ''; const v = document.getElementById('plArtistFull'); if (v) v.hidden = true; }
function plArtistLoad() {
const seq = ++plArtistSeq;
const take = rows => {
if (seq !== plArtistSeq) return;
plArtistRows = (rows || []).filter(s => s && s.nid);
plArtistSay = plArtistRows.length ? '' : '没取到 TA 的歌（要联网；真主页还得有一台答话的接口·「音源 · 账号」里填）';
renderPlayerArtist();
};
if (plArtistId && _plNcmApi() && !_plNcmDeadNow()) {
plArtistSay = '正在取 TA 的主页…'; renderPlayerArtist();
_plNcmAsk('/artists?id=' + encodeURIComponent(plArtistId), 14000).then(txt => {
if (seq !== plArtistSeq) return;
const j = _plNcmJSON(txt);
const a = j && j.artist ? j.artist : null;
if (a) plArtistMeta = { cover: _plPicFix(String(a.img1v1Url || a.picUrl || a.avatar || '')),
desc: String(a.briefDesc || ''), alias: Array.isArray(a.alias) ? a.alias.filter(Boolean).join(' · ') : '' };
const rows = j && Array.isArray(j.hotSongs) ? j.hotSongs.map(_plNcmRow).filter(Boolean) : [];
if (rows.length) { take(rows); return; }
_plArtistAggr(take, seq);
});
return;
}
_plArtistAggr(take, seq);
}
function _plArtistAggr(take, seq) {
plArtistSay = '按名字先拢一批「' + plArtistNm + '」的歌…'; renderPlayerArtist();
const srcs = PL_SEARCH_SRC.filter(s => !s.own || _plNcmApi());
Promise.all(srcs.map(s => _plSearchOne(s, plArtistNm, PL_SEARCH_MS))).then(list => {
if (seq !== plArtistSeq) return;
const seen = {}; const rows = [];
(list || []).forEach(r => { (r && Array.isArray(r.rows) ? r.rows : []).forEach(x => { if (x && x.nid && !seen['k' + x.nid]) { seen['k' + x.nid] = 1; rows.push(x); } }); });
take(rows.slice(0, PL_SEARCH_MAX));
});
}
function renderPlayerArtist() {
const box = document.getElementById('plArtistBody'); if (!box || !plState.artist) return;
_plLazy();
const m = plArtistMeta || {};
const sub = m.alias || (plArtistId ? '网易云歌手' : '按名字拢出来的歌 · 不是真主页');
box.innerHTML = _plNcmHeroHTML(plArtistNm, sub, m.cover || '', plArtistSay, 'artist', plArtistRows.length) +
(m.desc ? '<details class="pl-artist-note"><summary>简介</summary><div>' + escapeHTML(String(m.desc).slice(0, 1200)) + '</div></details>' : '') +
(plArtistRows.length ? plArtistRows.map((r, i) => _plNcmSongRowHTML(r, i)).join('') : '');
}
function plNcmListLoad(pid) {
const seq = ++plNcmListSeq;
plNcmListSongs = []; plNcmListSay = '正在取这个歌单…'; renderPlayerNcmList();
const take = songs => {
if (seq !== plNcmListSeq) return;
plNcmListSongs = songs.filter(s => s && s.nid);
plNcmListSay = plNcmListSongs.length ? '' : '这个歌单没取到歌（要联网；私密歌单要填你自己那台）';
renderPlayerNcmList();
};
if (_plNcmApi()) {
_plNcmAsk('/playlist/detail?id=' + encodeURIComponent(String(pid)), 14000).then(txt => {
if (seq !== plNcmListSeq) return;
const j = _plNcmJSON(txt);
const pl = j && j.playlist ? j.playlist : null;
if (pl) {
plNcmListMeta = {
name: String(pl.name || (plNcmListMeta && plNcmListMeta.name) || '歌单'),
count: Number(pl.trackCount) || 0,
cover: _plPicFix(String(pl.coverImgUrl || (plNcmListMeta && plNcmListMeta.cover) || ''))
};
}
const songs = pl && Array.isArray(pl.tracks) ? pl.tracks.map(_plNcmRow).filter(Boolean) : [];
if (songs.length) { take(songs); return; }
_plMetingSongs('playlist', pid).then(take);
});
return;
}
_plMetingSongs('playlist', pid).then(take);
}
function _plNcmHeroHTML(title, sub, cover, say, kind, n) {
return '<div class="pl-ncm-hero">' +
'<span class="pl-ncm-cov">' + (cover ? _plNetImg(cover) : _plNoteSvg()) + '</span>' +
'<span class="pl-ncm-hero-tx"><b>' + escapeHTML(title) + '</b><small>' + escapeHTML(sub) + '</small>' +
(say ? '<small class="pl-ncm-say">' + escapeHTML(say) + '</small>' : '') + '</span></div>' +
'<div class="pl-ncm-ops">' +
'<button type="button" class="pl-ncm-op pri" data-pl-act="ncmplayall" data-src="' + kind + '"' + (n ? '' : ' disabled') + '>播放全部</button>' +
'<button type="button" class="pl-ncm-op" data-pl-act="ncmimportall" data-src="' + kind + '"' + (n ? '' : ' disabled') + '>收进曲库</button>' +
'</div>';
}
function _plNcmSongRowHTML(r, i) {
const id = 'ncm' + r.nid;
const cur = _plRoot().current === id;
return '<button type="button" class="pl-row pl-ncm-song' + (cur ? ' now' : '') + '" data-pl-act="ncmplay"' +
' data-nid="' + escapeHTML(r.nid) + '" data-nm="' + escapeHTML(r.name || '') + '" data-ar="' + escapeHTML(r.artist || '') +
'" data-du="' + (r.dur || 0) + '" data-dp="' + escapeHTML(r.pic || '') + '" data-ar-id="' + escapeHTML(r.arId || '') + '">' +
'<span class="pl-ncm-no">' + (i + 1) + '</span>' + _plCovHTML(r.pic) +
'<span class="pl-tx"><span class="pl-nm">' + escapeHTML(r.name || ('网易云 ' + r.nid)) + '</span>' +
'<span class="pl-ar">' + _plArLinksHTML(r.artist, r.arId) + '</span></span>' +
'<span class="pl-du">' + (_plDur(r.dur) || '—') + '</span></button>';
}
function renderPlayerDaily() {
const box = document.getElementById('plDailyBody'); if (!box || !plState.daily) return;
_plLazy();
const rows = plNcmDaily, first = rows[0] || {};
box.innerHTML = _plNcmHeroHTML('每日推荐', _plToday() + ' · 网易云按你的口味挑的 · ' + (rows.length || 0) + ' 首',
first.pic || '', plNcmDailySay, 'daily', rows.length) +
(rows.length ? rows.map((r, i) => _plNcmSongRowHTML(r, i)).join('') : '');
}
function renderPlayerNcmList() {
const box = document.getElementById('plNcmListBody'); if (!box || !plState.ncmList) return;
_plLazy();
const meta = plNcmListMeta || {}, rows = plNcmListSongs, first = rows[0] || {};
const ti = document.getElementById('plnTitle'); if (ti) ti.textContent = meta.name || '歌单';
box.innerHTML = _plNcmHeroHTML(meta.name || '歌单',
'网易云 · ' + (meta.count || rows.length || 0) + ' 首' + (meta.count && rows.length && meta.count !== rows.length ? ' · 屏上 ' + rows.length + ' 首' : ''),
meta.cover || first.pic || '', plNcmListSay, 'list', rows.length) +
(rows.length ? rows.map((r, i) => _plNcmSongRowHTML(r, i)).join('') : '');
}
function _plNcmSongsOf(src) { return src === 'daily' ? plNcmDaily : src === 'artist' ? plArtistRows : plNcmListSongs; }
function _plNcmIntoLibrary(songs) {
let got = 0, dup = 0;
(songs || []).forEach(s => {
if (!s || !s.nid || s.drop) return;
const id = 'ncm' + s.nid;
if (plById(id)) { dup++; return; }
got++;
_plPushTrack({ id: id, nid: String(s.nid), name: s.name || ('网易云 ' + s.nid), artist: s.artist || '',
src: 'ncm', dur: Number(s.dur) || 0, pic: s.pic || '', vip: plVipKnown[String(s.nid)] === 1 ? 1 : 0, added: Date.now() });
});
return { got: got, dup: dup };
}
async function _plNcmPlayAll(src) {
const songs = _plNcmSongsOf(src).filter(s => s && s.nid);
if (!songs.length) { showToast('这一份还没有歌可放'); return; }
await _plNcmVipGate(songs);
const list = songs.filter(s => !s.drop);
if (!list.length) { showToast('这一份里的歌都放不出来·先去掉那几首会员歌曲再试'); return; }
const r = _plNcmIntoLibrary(list);
plPlayId('ncm' + list[0].nid);
renderPlayerAll();
showToast(r.got ? '收了 ' + r.got + ' 首进曲库 · 从第一首开始放' : '从第一首开始放');
}
async function _plNcmImportAll(src) {
const songs = _plNcmSongsOf(src).filter(s => s && s.nid);
if (!songs.length) { showToast('这一份还没有歌可收'); return; }
await _plNcmVipGate(songs);
const list = songs.filter(s => !s.drop);
if (!list.length) { showToast('这一份里的歌都放不出来·没有可收的'); return; }
const r = _plNcmIntoLibrary(list);
renderPlayerAll();
showToast(r.got ? '收了 ' + r.got + ' 首进曲库' + (r.dup ? ' · ' + r.dup + ' 首已经有了' : '') : '这一份的歌都在曲库里了');
}
async function plNcmImport(pid, nm) {
nm = String(nm || '歌单');
plNcmListsSay = '《' + nm + '》正在取清单…'; renderPlayerSource();
let songs = [];
if (_plNcmApi()) songs = await _plNcmList({ as: 'list', id: pid });
if (!songs.length) songs = await _plMetingSongs('playlist', pid);
songs = songs.filter(s => s && s.nid);
if (!songs.length) { plNcmListsSay = '《' + nm + '》没取到清单（要联网；私密歌单要填你自己那台）'; renderPlayerSource(); return; }
await _plNcmVipGate(songs, () => { plNcmListsSay = plVipSay; renderPlayerSource(); });
const list = songs.filter(s => !s.drop);
if (!list.length) { plNcmListsSay = '《' + nm + '》里的歌都放不出整曲·没收进来'; renderPlayerSource(); return; }
const r = _plNcmIntoLibrary(list);
const dropped = songs.length - list.length;
plNcmListsSay = '《' + nm + '》收了 ' + r.got + ' 首' + (dropped ? '·去掉 ' + dropped + ' 首会员歌曲' : '')
+ (r.got < list.length ? '·其余 ' + (list.length - r.got) + ' 首已经在库里' : '');
renderPlayerAll();
showToast(r.got ? '收了 ' + r.got + ' 首进曲库' : '这一单的歌都在曲库里了');
}
function _plVkeysRows(txt) {
let j = null; try { j = JSON.parse(String(txt || '')); } catch (e) { return null; }
if (!j || typeof j !== 'object' || Number(j.code) !== 200) return null;
const arr = Array.isArray(j.data) ? j.data : [];
return arr.map(x => {
if (!x || typeof x !== 'object') return null;
const nid = String(x.id || x.song_id || '').trim();
if (!/^\d+$/.test(nid)) return null;
const artist = String(x.singer || x.artist || '').split(/[\/、,，]/).map(s => s.trim()).filter(Boolean).join(' / ');
return { nid, name: String(x.song || x.name || '').trim(), artist, dur: 0, pic: _plPicFix(String(x.cover || x.pic || '')) };
}).filter(Boolean);
}
function _plMetoRows(txt) {
const s = String(txt || '').trim();
if (!s) return null;
let j = null; try { j = JSON.parse(s); } catch (e) { return null; }
if (!Array.isArray(j) && j && typeof j === 'object' && j.error) return null;
return _plMetingList(s);
}
function _plOwnRows(txt) {
const j = _plNcmJSON(txt);
if (!j || typeof j !== 'object') return null;
const arr = (j.result && Array.isArray(j.result.songs)) ? j.result.songs
: (j.data && Array.isArray(j.data.songs)) ? j.data.songs : null;
if (!arr) return null;
return arr.map(x => {
if (!x || !x.id) return null;
return { nid: String(x.id), name: String(x.name || '').trim(),
artist: (Array.isArray(x.artists) ? x.artists : []).map(a => a && a.name).filter(Boolean).join(' / '),
dur: Math.round(Number(x.duration || 0) / 1000) || 0,
pic: _plPicFix(String((x.album && (x.album.picUrl || x.album.blurPicUrl)) || (x.al && (x.al.picUrl || x.al.blurPicUrl)) || x.pic || '')),
arId: (Array.isArray(x.artists) ? x.artists : []).map(a => a && a.id).filter(Boolean).join(','),
alId: (x.album && x.album.id) ? String(x.album.id) : '' };
}).filter(Boolean);
}
function _plOwnArtistRows(txt) {
const j = _plNcmJSON(txt);
if (!j || typeof j !== 'object') return null;
const arr = (j.result && Array.isArray(j.result.artists)) ? j.result.artists : null;
if (!arr) return null;
return arr.map(x => {
if (!x || !x.id) return null;
return { aid: String(x.id), name: String(x.name || '').trim(),
alias: (Array.isArray(x.alias) ? x.alias.filter(Boolean).join(' · ') : ''),
pic: _plPicFix(String(x.img1v1Url || x.picUrl || x.avatar || '')) };
}).filter(Boolean);
}
var PL_SEARCH_SRC = [
{ id: 'own', name: '你自己那台', own: true, path: q => '/search?keywords=' + encodeURIComponent(q) + '&limit=50&type=1', parse: _plOwnRows },
{ id: 'vkeys', name: 'vkeys', url: q => PL_SEARCH_VKEYS + '?word=' + encodeURIComponent(q) + '&num=50', parse: _plVkeysRows },
{ id: 'meto', name: 'i-meto', url: q => PL_NCM_SEARCH_API + '?server=netease&type=search&id=' + encodeURIComponent(q), parse: _plMetoRows },
{ id: 'qjy', name: 'qijieya', url: q => PL_NCM_METING[0] + '?server=netease&type=search&id=' + encodeURIComponent(q), parse: _plMetoRows },
];
function _plSearchOne(src, q, ms) {
return new Promise(resolve => {
const fin = rows => resolve({ id: src.id, name: src.name, rows: Array.isArray(rows) ? rows : null });
let p;
try {
p = src.own ? _plNcmAsk(src.path(q), ms) : _plFetchTextFresh(src.url(q), ms);
} catch (e) { fin(null); return; }
Promise.resolve(p).then(txt => fin(src.parse(String(txt || '')))).catch(() => fin(null));
});
}
function _plSearchRace(q, ms, only, onMore) {
const srcs = PL_SEARCH_SRC.filter(s => (!s.own || _plNcmApi()) && (!only || only.indexOf(s.id) >= 0));
const stat = { rows: null, spoke: [], quiet: [], cut: false };
if (!srcs.length) return Promise.resolve(stat);
return new Promise(resolve => {
const merged = [], seen = new Set();
let left = srcs.length, settled = false;
const out = () => { stat.rows = merged.slice(); return stat.rows; };
const settle = () => { if (settled) return; settled = true; if (merged.length) out(); resolve(stat); };
srcs.forEach(src => {
_plSearchOne(src, q, ms).then(r => {
const cutWas = stat.cut;
let fresh = 0;
(Array.isArray(r.rows) ? r.rows : []).forEach(x => {
if (!x || !x.nid || seen.has(x.nid)) return;
if (merged.length >= PL_SEARCH_MAX) { stat.cut = true; return; }
seen.add(x.nid); merged.push(x); fresh++;
});
if (!r.rows || !r.rows.length) (r.rows ? stat.spoke : stat.quiet).push(r.name);
const cutNow = stat.cut && !cutWas;
if (merged.length) {
if (!settled) { out(); settle(); }
else if ((fresh || cutNow) && onMore) { try { onMore(out(), stat.cut); } catch (e) {} }
}
if (--left === 0) {
merged.sort((A, B) => (_plSearchHitRank(A.name, q) - _plSearchHitRank(B.name, q)));
if (settled) { if (onMore) { try { onMore(out(), stat.cut); } catch (e) {} } }
else { if (merged.length) out(); resolve(stat); }
}
});
});
});
}
function _plSearchHitRank(name, q) {
const nm = String(name || '').trim().toLowerCase();
const qn = String(q || '').trim().toLowerCase();
if (!qn || !nm) return 2;
if (nm === qn) return 0;
if (nm.indexOf(qn) === 0) return 1;
return 2;
}
function _plFindSayPaint(text) {
const box = document.getElementById('plSearchRes');
if (!box) return;
box.innerHTML = '<div class="pl-add-log"><div>' + escapeHTML(text) + '</div></div>';
}
async function plNcmSearch(kw) {
_plFindBatchOff();
const q = String(kw || '').trim();
if (!q) { plFindRows = null; plFindKw = ''; plFindCut = false; plFindSay = '先打两个字（歌名或歌手）'; plFindBad = true; renderPlayerFind(); return; }
const tok = ++plSearchTok;
plFindKw = q;
{ const _kw0 = document.getElementById('plSearchKw'); if (_kw0) _kw0.value = q; }
plFindRows = null; plFindSay = '正在搜「' + q + '」…'; plFindBad = false; plFindCut = false;
renderPlayerFind();
if (plFindType === '100') {
if (!_plNcmApi()) {
plFindRows = null; plFindBad = true; plFindCut = false;
plFindSay = '搜歌手要有一台答话的网易云接口（「音源 · 账号」里填地址）· 搜歌不用，先切回「单曲」';
renderPlayerFind(); return;
}
const txt = await _plNcmAsk('/search?keywords=' + encodeURIComponent(q) + '&limit=30&type=100', 12000);
if (tok !== plSearchTok) return;
const rows = _plOwnArtistRows(txt);
if (!rows) { plFindRows = null; plFindBad = true; plFindCut = false; plFindSay = '接口没答上·过一会儿再试'; renderPlayerFind(); return; }
if (rows.length) { plFindRows = rows; plFindSay = ''; plFindBad = false; }
else { plFindRows = null; plFindBad = true; plFindCut = false; plFindSay = '没搜到叫「' + q + '」的歌手'; }
renderPlayerFind(); return;
}
const more = (rows, cut) => {
if (tok !== plSearchTok) return;
plFindRows = rows; plFindSay = ''; plFindBad = false; plFindCut = !!cut;
const box = document.getElementById('plSearchRes');
if (box) { box.innerHTML = _plFindResInnerHTML(); try { _plLazy(); } catch (e) {} }
};
let st = await _plSearchRace(q, PL_SEARCH_MS, null, more);
if (tok !== plSearchTok) return;
if (!st.rows && !st.spoke.length) {
_plFindSayPaint('那几台都没答上，换一条路再问一遍…');
st = await _plSearchRace(q, PL_SEARCH_MS2, null, more);
if (tok !== plSearchTok) return;
}
plFindCut = !!st.cut;
if (st.rows && st.rows.length) {
plFindRows = st.rows; plFindSay = ''; plFindBad = false;
} else {
plFindRows = null; plFindBad = true; plFindCut = false;
plFindSay = st.spoke.length
? '没搜到「' + q + '」（' + st.spoke.join('、') + ' 答了，都说没有这一首）· 换个词，或者直接贴歌单链接'
: '搜歌的几台公开接口都没答上（' + (st.quiet.join('、') || '公开实例') + '）· 过一会儿再试' +
(_plNcmApi() ? '' : '；想稳就在设置里填一台自己的网易云接口');
}
if (plState.tab === 'find') renderPlayerFind();
}
var PL_RAND_WORDS = [
'华语 经典', '粤语 流行', '民谣 吉他', '古风 国风', '说唱', '摇滚', '电子 舞曲', '节奏布鲁斯',
'爵士', '钢琴曲 纯音乐', '新世纪 轻音乐', '动漫 日语', '韩语 流行', '欧美 流行', '拉丁', '乡村音乐',
'老歌 八十年代', '情歌', '深夜 安静', '治愈', '轻快', '影视原声', '游戏音乐', '女声', '男声', '合唱',
];
var PL_RAND_ASK_MS = 8000;
var PL_RAND_RECENT = 24;
var PL_RAND_BAN_MAX = 200;
var PL_RAND_VIP_TRY = 5;
var PL_RAND_FAV_MAX = 30;
var plRandBusy = false, plRandSay = '', plRandBad = false, plRandRecent = [], plRandLastWord = '';
var plRandAbort = false;
var plRandLast = null;
function _plRandWord() {
const p = _plRoot();
if (p.randBy === 'takeover') return _plRandWordTa();
const blocked = Array.isArray(p.randBlockWords) ? p.randBlockWords : [];
const favs = Array.isArray(p.randFavWords) ? p.randFavWords.filter(w => blocked.indexOf(w) < 0) : [];
const base = favs.length ? favs : PL_RAND_WORDS;
let pool = base.filter(w => w !== plRandLastWord && blocked.indexOf(w) < 0);
if (!pool.length) pool = base.filter(w => blocked.indexOf(w) < 0);
if (!pool.length) pool = PL_RAND_WORDS.filter(w => blocked.indexOf(w) < 0);
if (!pool.length) pool = PL_RAND_WORDS;
const w = pool[Math.floor(Math.random() * pool.length)] || PL_RAND_WORDS[0];
plRandLastWord = w;
return w;
}
function _plRandRecPush(nid) {
plRandRecent.unshift(nid);
if (plRandRecent.length > PL_RAND_RECENT) plRandRecent.length = PL_RAND_RECENT;
}
function plLastBan() { return !!plRandLast && !_plRandBanned(plRandLast.nid); }
function _plRandSayPaint() {
const el = document.getElementById('plRandSay'); if (!el) return;
const tx = document.getElementById('plRandSayTx');
if (tx) { tx.textContent = plRandSay || ''; } else { el.textContent = plRandSay || ''; }
const btn = document.getElementById('plRandSayBan');
if (btn) btn.hidden = !(plLastBan());
el.hidden = !(plRandSay || plLastBan());
el.className = 'pl-note' + (plRandBad ? ' bad' : '');
}
async function plRandPush(opts) {
if (plRandBusy) return false;
plRandBusy = true;
plRandAbort = false;
const inviteOnly = !!(opts && opts.inviteOnly);
try {
plRandSay = '正在掷…（在途时再点「推一首」＝取消）'; plRandBad = false; _plRandSayPaint();
let rows = [], tried = 0, st = null;
while (tried++ < 2) {
st = await _plSearchRace(_plRandWord(), PL_RAND_ASK_MS);
if (plRandAbort) { plRandBad = false; plRandSay = '已取消这一发'; _plRandSayPaint(); return false; }
rows = Array.isArray(st.rows) ? st.rows : [];
if (rows.length) break;
}
const spoke = st && Array.isArray(st.spoke) ? st.spoke : [];
const quiet = st && Array.isArray(st.quiet) ? st.quiet : [];
if (!rows.length) {
plRandBad = true;
plRandSay = spoke.length
? '那两个词没搜到东西（' + spoke.join('、') + ' 答了，都说没有）· 再点一次'
: '搜歌的那几台公开接口都没答上（' + (quiet.join('、') || '公开实例') + '）· 过一会儿再推';
_plRandSayPaint();
try { showToast(plRandSay); } catch (e) {}
return false;
}
const pool = rows.filter(r => r && r.nid && !_plVipSkippable(String(r.nid)));
let list = pool.filter(r => !_plRandBanned(String(r.nid)) && plRandRecent.indexOf(String(r.nid)) < 0);
if (!list.length) list = pool.filter(r => !_plRandBanned(String(r.nid)));
if (!list.length) {
plRandBad = true;
plRandSay = pool.length
? '那一批发回来的都被你屏蔽了·到下面「屏蔽歌曲」里移出来，或者换一个词再推'
: '那一批发回来的歌都放不出整曲·换一个词再推';
_plRandSayPaint();
try { showToast(plRandSay); } catch (e) {}
return false;
}
if (!_plNcmCookie() && _plRandNoVip()) {
const cand = list.slice();
_plTaShuffleArr(cand);
const batch = cand.slice(0, PL_RAND_VIP_TRY);
await Promise.all(batch.map(r => Promise.resolve(_plNcmVipOne(String(r.nid))).catch(() => {})));
if (plRandAbort) { plRandBad = false; plRandSay = '已取消这一发'; _plRandSayPaint(); return false; }
const good = batch.filter(r => plVipKnown[String(r.nid)] !== 1);
if (!good.length) {
plRandBad = true;
plRandSay = '这一批发回来的歌都放不出整曲（多半是会员歌·登录你的网易云会员账号就能听完整版）·换一个词再推';
_plRandSayPaint();
try { showToast(plRandSay); } catch (e) {}
return false;
}
list = good;
}
const s = list[Math.floor(Math.random() * list.length)];
const id = 'ncm' + s.nid;
const existed = !!plById(id);
if (!existed) _plPushTrack({ id, nid: String(s.nid), name: s.name || ('网易云 ' + s.nid),
artist: s.artist || '', src: 'ncm', dur: Number(s.dur) || 0, pic: s.pic || '', added: Date.now() });
_plRandRecPush(String(s.nid));
plRandLast = { nid: String(s.nid), name: s.name || ('网易云 ' + s.nid), artist: s.artist || '' };
const songName = s.name || ('网易云 ' + s.nid);
if (inviteOnly) {
const invCid = String((opts && opts.cid) || '');
const ok = invCid ? plSendInvite(invCid, id, false, true) : false;
if (ok) {
const pp = _plRoot();
if (!pp.coolEndBy || typeof pp.coolEndBy !== 'object' || Array.isArray(pp.coolEndBy)) pp.coolEndBy = {};
pp.coolEndBy[invCid] = Date.now() + (120 + Math.floor(Math.random() * 120)) * 60000;
save();
}
plRandBad = false;
plRandSay = ok ? '邀你听《' + songName + '》· 卡片已送到聊天' : '这一发没送出去·过一会儿再试';
renderPlayerAll();
_plRandPaint();
return ok;
}
plPlayId(id);
renderPlayerAll();
plRandBad = false;
const taCid = _plRandTaCid();
const taName = _plRandTaName();
plRandSay = '推的是《' + songName + '」' +
(taName ? '· ' + taName + ' 推给你的' : '') +
(existed ? '（曲库里本来有这首·直接播它）' : ' · 已收进曲库');
if (taCid) _plChatNote(taCid, { id: nextId(), from: 'system', text: taName + ' 推了一首：《' + songName + '》' });
_plRandPaint();
return true;
} finally {
plRandBusy = false;
plRandAbort = false;
}
}
function _plRandTaCid() {
const p = _plRoot();
if (p.randBy !== 'ta' && p.randBy !== 'takeover') return '';
const chosen = String(p.randTaCid || '');
const has = id => !!(data.contacts || []).find(x => x && x.id === id && x.kind !== 'group');
if (chosen && has(chosen)) return chosen;
const withCid = _plWith();
if (withCid && has(withCid)) return withCid;
const c = _plSingles()[0];
return c ? c.id : '';
}
function _plRandTaName() {
const id = _plRandTaCid(); if (!id) return '';
const c = (data.contacts || []).find(x => x && x.id === id);
return c ? fixedNameOf(c) : '';
}
function _plRandAutoPush(when) {
const p = _plRoot();
if (p.randBy !== 'ta' || when === 'manual') return plRandPush();
const prob = Math.max(0, Math.min(100, Number(p.randTaProb)));
if (!(Math.random() * 100 < prob)) return false;
return plRandPush();
}
function _plRandWordTa() {
let pool = PL_RAND_WORDS.filter(w => w !== plRandLastWord);
if (!pool.length) pool = PL_RAND_WORDS;
const w = pool[Math.floor(Math.random() * pool.length)] || PL_RAND_WORDS[0];
plRandLastWord = w;
return w;
}
function _plTakeoverTurn(when) {
if (when === 'manual') return plRandPush();
const cid = _plRandTaCid();
if (cid && (data.contacts || []).some(c => c && c.id === cid)) {
const cfg = _plCfg(cid);
const acts = [
{ pr: cfg.taListProb, fn: _plTaListShuffle },
{ pr: cfg.taDelProb, fn: _plTaDelOne },
{ pr: cfg.taNewListProb, fn: _plTaNewList },
{ pr: cfg.taAddProb, fn: _plTaAddOne }
];
let acc = 0;
const r = Math.random() * 100;
for (const a of acts) {
acc += a.pr;
if (r < acc) return !!a.fn(cid);
}
}
return plRandPush();
}
function _plTaScope(cid) { return _plCfg(cid).taListScope === 'mine' ? 'mine' : 'ta'; }
function _plTaOwnLists(cid) {
if (!data.playerBy[cid] || typeof data.playerBy[cid] !== 'object') data.playerBy[cid] = {};
const o = data.playerBy[cid];
if (!Array.isArray(o.ownLists)) o.ownLists = [];
return o.ownLists;
}
function _plTaSay(cid, text) { _plChatNote(cid, { id: nextId(), from: 'system', text: _plName(cid) + ' ' + text }); }
function _plTaShuffleArr(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } }
function _plTaListShuffle(cid) {
if (_plTaScope(cid) === 'mine') {
const lists = _plRoot().playlists;
if (!Array.isArray(lists) || !lists.length) return false;
const l = lists[lists.length - 1];
if (!Array.isArray(l.trackIds) || l.trackIds.length < 2) return false;
_plTaShuffleArr(l.trackIds);
save(); _plTaSay(cid, '把《' + (l.name || '歌单') + '》重新排了一遍'); renderPlayerAll();
return true;
}
const lists = _plTaOwnLists(cid);
if (!lists.length) return false;
const l = lists[lists.length - 1];
if (!Array.isArray(l.items) || l.items.length < 2) return false;
_plTaShuffleArr(l.items);
save(); _plTaSay(cid, '把自己的《' + (l.name || '歌单') + '》重新排了一遍');
return true;
}
function _plTaDelOne(cid) {
const curId = _plRoot().current;
if (_plTaScope(cid) === 'mine') {
const pool = plTracks().filter(t => t && t.id !== curId);
if (!pool.length) return false;
const victim = pool[Math.floor(Math.random() * pool.length)];
plRemoveTrack(victim.id);
_plTaSay(cid, '把《' + (victim.name || '一首歌') + '》从你的曲库删掉了');
return true;
}
const lists = _plTaOwnLists(cid);
if (!lists.length) return false;
const l = lists[lists.length - 1];
const pool = (l.items || []).filter(it => it && it.nid);
if (!pool.length) return false;
const victim = pool[Math.floor(Math.random() * pool.length)];
l.items = l.items.filter(it => it !== victim);
save(); _plTaSay(cid, '从自己的《' + (l.name || '歌单') + '》里拿掉了《' + (victim.name || '一首歌') + '》');
return true;
}
var PL_TA_LIST_NAMES = ['深夜电台', '雨天听的歌', '走路专用', '老歌回味', '心跳歌单', '凌晨四点', '周末早晨'];
function _plTaListName(base, lists) {
if (!lists.some(l => l && l.name === base)) return base;
let i = 2;
while (lists.some(l => l && l.name === base + ' ' + i)) i++;
return base + ' ' + i;
}
function _plTaNewList(cid) {
const base = PL_TA_LIST_NAMES[Math.floor(Math.random() * PL_TA_LIST_NAMES.length)];
if (_plTaScope(cid) === 'mine') {
const p = _plRoot();
if (!Array.isArray(p.playlists)) p.playlists = [];
if (p.playlists.length >= 30) return false;
const name = _plTaListName(base, p.playlists);
p.playlists.push({ id: 'pl' + Date.now().toString(36), name, trackIds: [], created: Date.now() });
save(); _plTaSay(cid, '新建了一份歌单《' + name + '》——还没放歌进去'); renderPlayerAll();
return true;
}
const lists = _plTaOwnLists(cid);
if (lists.length >= 30) return false;
const name = _plTaListName(base, lists);
lists.push({ id: 'tol' + Date.now().toString(36), name, items: [], created: Date.now() });
save(); _plTaSay(cid, '新建了一份自己的歌单《' + name + '》');
return true;
}
function _plTaAddOne(cid) {
const scope = _plTaScope(cid);
let list = null;
if (scope === 'ta') {
const lists = _plTaOwnLists(cid);
if (!lists.length) return false;
list = lists[lists.length - 1];
}
const word = _plRandWordTa();
_plSearchRace(word, PL_RAND_ASK_MS).then(st => {
const rows = (st && Array.isArray(st.rows) ? st.rows : []).filter(r => r && r.nid && !_plVipSkippable(String(r.nid)));
if (!rows.length) return;
const s = rows[Math.floor(Math.random() * rows.length)];
if (scope === 'mine') {
const id = 'ncm' + s.nid;
if (!plById(id)) _plPushTrack({ id, nid: String(s.nid), name: s.name || ('网易云 ' + s.nid),
artist: s.artist || '', src: 'ncm', dur: Number(s.dur) || 0, pic: s.pic || '', added: Date.now() });
_plTaSay(cid, '把《' + (s.name || ('网易云 ' + s.nid)) + '》加进了你的曲库');
renderPlayerAll();
return;
}
list.items.push({ nid: String(s.nid), name: s.name || ('网易云 ' + s.nid), artist: s.artist || '', at: Date.now() });
save(); _plTaSay(cid, '把《' + (s.name || ('网易云 ' + s.nid)) + '》加进了自己的《' + (list.name || '歌单') + '》');
}).catch(() => {});
return true;
}
function plPlayTaItem(cid, listId, nid) {
const l = _plTaOwnLists(cid).find(x => x && x.id === listId);
const it = l && (l.items || []).find(x => x && x.nid === String(nid));
if (!it) return;
const id = 'ncm' + nid;
if (!plById(id)) _plPushTrack({ id, nid: String(nid), name: it.name || ('网易云 ' + nid),
artist: it.artist || '', src: 'ncm', dur: 0, pic: '', added: Date.now() });
plPlayId(id);
renderPlayerAll();
}
function plRandFavSet(word, on) {
const p = _plRoot();
if (!Array.isArray(p.randFavWords)) p.randFavWords = [];
word = String(word || '').trim();
if (!word) return false;
const i = p.randFavWords.indexOf(word);
if (on && i < 0) {
if (p.randFavWords.length >= PL_RAND_FAV_MAX) {
try { showToast('喜欢的风格存满了（' + PL_RAND_FAV_MAX + ' 个）·先删几个再加'); } catch (e) {}
return false;
}
p.randFavWords.push(word);
if (!Array.isArray(p.randBlockWords)) p.randBlockWords = [];
const bi = p.randBlockWords.indexOf(word);
if (bi >= 0) p.randBlockWords.splice(bi, 1);
}
if (!on && i >= 0) p.randFavWords.splice(i, 1);
save();
_plRandPaint();
return on;
}
function plRandBySet(mode) {
const p = _plRoot();
mode = (mode === 'ta' || mode === 'takeover') ? mode : '';
if ((p.randBy || '') === mode) return mode;
p.randBy = mode;
save();
_plRandPaint();
return mode;
}
function plRandTaSet(cid) {
const p = _plRoot();
cid = String(cid || '');
if (p.randTaCid === cid) cid = '';
p.randTaCid = cid;
save();
_plRandPaint();
return cid;
}
function plRandTaProbSet(v) {
const p = _plRoot();
const n = Math.round(Number(v));
p.randTaProb = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 30;
save();
return p.randTaProb;
}
function plRandFavAdd() {
const inp = document.getElementById('plRandFavQ');
const w = String((inp && inp.value) || '').trim();
if (!w) { try { showToast('先写一个风格或歌手名'); } catch (e) {} return false; }
const okAdd = plRandFavSet(w, true);
if (okAdd && inp) inp.value = '';
return okAdd;
}
function plRandFavBulk(on) {
const p = _plRoot();
p.randFavWords = on ? PL_RAND_WORDS.slice() : [];
save();
_plRandPaint();
return p.randFavWords.length;
}
async function plRandPushQ() {
if (plRandBusy) return false;
const q = String((document.getElementById('plRandQ') || {}).value || '').trim();
if (!q) { try { showToast('先写一首歌名·或「歌名 歌手」'); } catch (e) {} return false; }
plRandBusy = true;
plRandAbort = false;
plRandSay = '在找《' + q + '》…（在途时再点「推这首」＝取消）'; plRandBad = false; _plRandSayPaint();
const st = await _plSearchRace(q, PL_RAND_ASK_MS);
if (plRandAbort) { plRandAbort = false; plRandBusy = false; plRandBad = false; plRandSay = '已取消这一发'; _plRandSayPaint(); return false; }
const rows = (st && Array.isArray(st.rows) ? st.rows : []).filter(r => r && r.nid && !_plVipSkippable(String(r.nid)));
plRandBusy = false;
const quiet = st && Array.isArray(st.quiet) ? st.quiet : [];
if (!rows.length) {
plRandBad = true;
plRandSay = quiet.length
? '没搜到《' + q + '》能整首放的·换个写法再试'
: '搜歌的那几台公开接口都没答上（' + (quiet.join('、') || '公开实例') + '）· 过一会儿再试';
_plRandSayPaint();
try { showToast(plRandSay); } catch (e) {}
return false;
}
const exact = rows.find(r => String(r.name || '').trim() === q);
const s = exact || rows[0];
const id = 'ncm' + s.nid;
const existed = !!plById(id);
if (!existed) _plPushTrack({ id, nid: String(s.nid), name: s.name || ('网易云 ' + s.nid),
artist: s.artist || '', src: 'ncm', dur: Number(s.dur) || 0, pic: s.pic || '', added: Date.now() });
_plRandRecPush(String(s.nid));
plRandLast = { nid: String(s.nid), name: s.name || ('网易云 ' + s.nid), artist: s.artist || '' };
plPlayId(id);
renderPlayerAll();
plRandBad = false;
const taCid = _plRandTaCid();
const taName = _plRandTaName();
plRandSay = '推的是《' + (s.name || ('网易云 ' + s.nid)) + '」' + (taName ? '· ' + taName + ' 推给你的' : '') +
(exact ? '' : '（没找到一模一样的名字·推了最接近的这首）') + (existed ? '·曲库里本来有' : ' · 已收进曲库');
if (taCid) _plChatNote(taCid, { id: nextId(), from: 'system', text: taName + ' 推了一首：《' + (s.name || ('网易云 ' + s.nid)) + '》' });
_plRandPaint();
return true;
}
function plRandAutoSet(on) {
const p = _plRoot();
on = !!on;
if (!!p.randAuto === on) return on;
p.randAuto = on;
save();
_plRandPaint();
return on;
}
function plRandNoVipSet(on) {
const p = _plRoot();
on = !!on;
if (!!p.randNoVip === on) return on;
p.randNoVip = on;
save();
_plRandPaint();
return on;
}
function _plRandBanned(nid) {
const ban = _plRoot().randBan;
return Array.isArray(ban) && ban.some(b => b && String(b.nid) === String(nid));
}
function plRandBlockSet(word, on) {
const p = _plRoot();
if (!Array.isArray(p.randBlockWords)) p.randBlockWords = [];
const i = p.randBlockWords.indexOf(word);
if (on && i < 0) {
p.randBlockWords.push(word);
if (!Array.isArray(p.randFavWords)) p.randFavWords = [];
const fi = p.randFavWords.indexOf(word);
if (fi >= 0) p.randFavWords.splice(fi, 1);
}
if (!on && i >= 0) p.randBlockWords.splice(i, 1);
save();
_plRandPaint();
return on;
}
function plRandBanSet(nid, on, meta) {
const p = _plRoot();
if (!Array.isArray(p.randBan)) p.randBan = [];
nid = String(nid || '');
if (!nid) return false;
const i = p.randBan.findIndex(b => b && String(b.nid) === nid);
if (on && i < 0) {
p.randBan.unshift({ nid, name: (meta && meta.name) || '', artist: (meta && meta.artist) || '', at: Date.now() });
if (p.randBan.length > PL_RAND_BAN_MAX) p.randBan.length = PL_RAND_BAN_MAX;
}
if (!on && i >= 0) p.randBan.splice(i, 1);
save();
_plRandPaint();
return on;
}
function _plRandHTML() {
const p = _plRoot(), on = !!p.randAuto, novip = !!p.randNoVip;
const blocked = Array.isArray(p.randBlockWords) ? p.randBlockWords : [];
const favs = Array.isArray(p.randFavWords) ? p.randFavWords : [];
const ban = Array.isArray(p.randBan) ? p.randBan : [];
const by = p.randBy === 'ta' ? 'ta' : p.randBy === 'takeover' ? 'takeover' : '';
const taCid = _plRandTaCid();
const taName = _plRandTaName();
const favChips = PL_RAND_WORDS.map(w => {
const f = favs.indexOf(w) >= 0;
return '<button type="button" class="scope-chip' + (f ? ' on' : '') + '" data-pl-act="randfav" data-pl-word="' + escapeHTML(w) + '">' +
(f ? '✓ ' : '') + escapeHTML(w) + '</button>';
}).join('');
const favOwn = favs.filter(w => PL_RAND_WORDS.indexOf(w) < 0).map(w =>
'<button type="button" class="scope-chip on" data-pl-act="randfav" data-pl-word="' + escapeHTML(w) + '">✓ ' + escapeHTML(w) + ' ×</button>').join('');
const blockChips = PL_RAND_WORDS.map(w => {
const b = blocked.indexOf(w) >= 0;
return '<button type="button" class="scope-chip' + (b ? ' blocked' : '') + '" data-pl-act="randblock" data-pl-word="' + escapeHTML(w) + '">' + escapeHTML(w) + '</button>';
}).join('');
const taChips = _plSingles().map(c => '<button type="button" class="contact-chip' + (taCid === c.id ? ' active' : '') +
'" data-pl-act="randtacid" data-pl-cid="' + escapeHTML(c.id) + '">' + escapeHTML(fixedNameOf(c)) + '</button>').join('');
const scopeMine = _plRoot().settings.taListScope === 'mine';
const ownLists = by === 'takeover' && taCid ? _plTaOwnLists(taCid) : [];
const ownRows = ownLists.map(l => '<div class="pl-rand-ban-row"><i>' + escapeHTML(l.name || '歌单') + '</i><small>' +
(l.items || []).length + ' 首</small><button type="button" data-pl-act="taplay" data-pl-cid="' + escapeHTML(taCid) +
'" data-pl-list="' + escapeHTML(l.id) + '">播</button></div>').join('');
const banRows = ban.length
? ban.map(b => '<div class="pl-rand-ban-row"><i>' + escapeHTML(b.name || ('网易云 ' + b.nid)) + '</i><small>' + escapeHTML(b.artist || '') + '</small>' +
'<button type="button" aria-label="解除屏蔽" data-pl-act="randunban" data-pl-nid="' + escapeHTML(String(b.nid)) + '">×</button></div>').join('')
: '<div class="pl-note" style="margin:6px 0 0">还没有屏蔽的歌·推到不喜欢的，点上面那行「屏蔽这首」。</div>';
const byOpts = [
{ m: '', t: '系统随机', d: '掷风格词搜一批·完全随机挑一首·TA 不参与' },
{ m: 'ta', t: '联系人推歌', d: '你点「推一首」由' + (taName || '选中的那位') + '出手；这首放完后按概率再推，没推就可能切歌或换播放模式' },
{ m: 'takeover', t: 'TA 接管', d: '曲终由' + (taName || '选中的那位') + '全权决定——推新歌、动歌单（按权限卡里那四格的概率·破坏性的出厂关）、也可能什么都不做·他自己挑歌不看你的风格名单' }
].map(o => '<button type="button" class="pl-rand-opt' + (by === o.m ? ' on' : '') + '" data-pl-act="randby" data-pl-mode="' + o.m + '">' +
'<span class="pl-tx"><b>' + o.t + '</b><small>' + o.d + '</small></span>' +
'<i class="pl-rand-opt-mark" aria-hidden="true">' + (by === o.m ? '✓' : '') + '</i></button>').join('');
return '<div class="pl-ncm-sec-hd">随机推送<span>公开接口 · 不用登录</span></div>' +
'<div class="pl-note">' + (by === 'ta'
? '默认由选中的那位推：按你的风格词搜一首新歌·收进曲库并开播；这首放完后他按下面的概率决定还推不推，没推就可能切歌或换播放模式。'
: '掷一个曲风词去搜一批·从这批里完全随机挑一首·收进曲库并开播·要联网。') + '</div>' +
'<div class="pl-acts"><button type="button" class="pl-btn pri" data-pl-act="randpush">推一首</button></div>' +
'<div class="pl-rand-q"><input id="plRandQ" type="text" placeholder="想要哪首？输入歌名或「歌名 歌手」" maxlength="60">' +
'<button type="button" class="pl-btn" data-pl-act="randpushone">推这首</button></div>' +
'<details class="set-adv pl-rand-how" data-pl-dt="by"><summary>' +
'<span class="pl-rand-how-lab">推歌方式</span>' +
'<span class="pl-rand-how-cur">' +
(by === 'ta' ? '联系人推歌 · ' + (taName || '未选人') + ' · 曲终 ' + Math.max(0, Math.min(100, Math.round(Number(p.randTaProb) || 0))) + '%'
: by === 'takeover' ? 'TA 接管 · ' + (taName || '未选人') : '系统随机') + '</span></summary>' +
'<div class="pl-rand-opt-wrap">' + byOpts + '</div>' +
(by !== '' ? '<div class="pl-rand-ta">' +
'<div class="pl-note">推歌的那位' + (by === 'ta' ? '（曲终按下面的概率出手）' : '（接管全权）') + '：</div>' +
'<div class="contact-chip-row" style="margin-bottom:6px">' + (taChips || '<span class="pl-note" style="margin:0">还没有可以聊的联系人·先去添加一位</span>') + '</div>' +
(by === 'ta' ? '<div class="pl-rand-prob"><span class="pl-tx"><b>曲终出手概率</b><small>每一发续推掷一次·没中＝这次不推，可能切歌或换播放模式</small></span>' +
'<input type="number" min="0" max="100" step="1" value="' + Math.max(0, Math.min(100, Math.round(Number(p.randTaProb) || 0))) + '" onchange="plRandTaProbSet(this.value)"><i>%</i></div>' : '') +
(by === 'takeover' ? '<div class="pl-rand-prob"><span class="pl-tx"><b>歌单动作落在哪本账</b><small>他动歌单时改谁的·改完都在聊天里说一声</small></span>' +
'<span class="pl-rand-modes">' +
'<button type="button" class="scope-chip' + (!scopeMine ? ' on' : '') + '" data-pl-act="randscope" data-pl-scope="ta">他自己的歌单</button>' +
'<button type="button" class="scope-chip' + (scopeMine ? ' on' : '') + '" data-pl-act="randscope" data-pl-scope="mine">我的曲库与歌单</button></span></div>' +
(taCid ? '<div class="pl-note">他自己的歌单（' + ownLists.length + ' 份）·点「播」整份顺序开播：</div>' +
(ownRows || '<div class="pl-note" style="margin:4px 0 0">还没有·等他自己建，或在权限卡里把「新建歌单」打开</div>') : '') : '') +
'</div>' : '') + '</details>' +
'<div class="pl-set-row" data-pl-act="randauto"><span class="pl-tx"><b>曲终自动续推</b><small>' +
'开着＝一首放完先按「曲终出手概率」问选中的那位要不要推新歌；没推就按他的播放设置切歌/随机/换模式，仍没有才正常下一首。' +
'队列里排好的下一首仍优先；推不到就停下来说实话，不拿库里的旧歌冒充推到的</small></span>' +
'<span class="hub-tg' + (on ? '' : ' off') + '" aria-hidden="true"></span></div>' +
'<div class="pl-set-row" data-pl-act="randnovip"><span class="pl-tx"><b>禁止推送会员歌曲</b><small>' +
'默认不勾＝会员歌也照推：碰上了播放器会自动换一台给整曲的接口，实在只给试听就放试听（登录会员号就是完整版）。' +
'勾上＝推之前先量一遍，只推公开接口量得出整曲的·推歌会慢一点</small></span>' +
'<span class="hub-tg' + (novip ? '' : ' off') + '" aria-hidden="true"></span></div>' +
'<details class="set-adv" data-pl-dt="fav"><summary>随机到的风格（' +
(favs.length ? '勾了 ' + favs.length + ' 个·只掷勾的' : '没勾＝全部都可能掷到') + '）</summary>' +
'<div class="pl-rand-bulk"><button type="button" data-pl-act="randfavbulk" data-pl-on="1">全选</button>' +
'<button type="button" data-pl-act="randfavbulk" data-pl-on="0">清空</button></div>' +
'<div class="pl-rand-chips">' + favChips + favOwn + '</div>' +
'<div class="pl-rand-q"><input id="plRandFavQ" type="text" placeholder="没有合意的？自己写一个（歌手名也行）" maxlength="20">' +
'<button type="button" class="pl-btn" data-pl-act="randfavadd">加进喜欢的</button></div>' +
'<div class="pl-note">这一份就是网易云随机推送能掷到的全部风格（26 个）·加上你自己写的。勾上的（✓）＝只从勾的里掷·取消勾选的那几个掷不到·全不勾＝不限风格。写歌手名的效果＝从他的歌里随机推·TA 接管档不看这份名单。</div></details>' +
'<details class="set-adv" data-pl-dt="words"><summary>屏蔽风格（已屏蔽 ' + blocked.length + ' 个）</summary>' +
'<div class="pl-rand-chips">' + blockChips + '</div>' +
'<div class="pl-note">划掉的＝掷词时跳过·全划掉＝这一掷不限风格·与「喜欢的」互斥·TA 接管档不看这份名单。点一下切换。</div></details>' +
'<details class="set-adv" data-pl-dt="ban"><summary>屏蔽歌曲（已屏蔽 ' + ban.length + ' 首）</summary>' +
'<div class="pl-rand-ban">' + banRows + '</div>' +
'<div class="pl-note">屏蔽只管「随机推送」·曲库里的记录不动·也不影响搜索和收藏·自己点名的「推这首」不受它管。</div></details>' +
'<div class="pl-note pl-rand-say' + (plRandBad ? ' bad' : '') + '" id="plRandSay"' + ((plRandSay || plLastBan()) ? '' : ' hidden') + '>' +
'<span id="plRandSayTx">' + escapeHTML(plRandSay) + '</span>' +
'<button type="button" id="plRandSayBan"' + (plLastBan() ? '' : ' hidden') + ' data-pl-act="randbanlast">屏蔽这首</button></div>';
}
function _plRandPaint() {
const box = document.getElementById('plRandSec');
if (!box) return;
const open = {};
box.querySelectorAll('details[data-pl-dt]').forEach(d => { open[d.dataset.plDt] = d.open; });
box.innerHTML = _plRandHTML();
box.querySelectorAll('details[data-pl-dt]').forEach(d => { if (open[d.dataset.plDt]) d.open = true; });
}
function plPlayable(t) {
if (!t) return false;
if (t.src === 'file') return !!t.fid;
if (t.src === 'ncm') return !!t.nid;
return /^https?:\/\//i.test(String(t.src || ''));
}
function plSrcOf(t) {
if (!t) return '';
if (t.src === 'ncm') return t.nid ? _plNcmUrl(t.nid) : '';
return /^https?:\/\//i.test(String(t.src || '')) ? t.src : '';
}
function _plDur(sec) {
const n = Number(sec);
if (!Number.isFinite(n) || n <= 0) return '';
const m = Math.floor(n / 60), s = Math.floor(n % 60);
return m + ':' + (s < 10 ? '0' : '') + s;
}
function _plDurText(t) { return t && t.dur ? _plDur(t.dur) : ''; }
function _plName(cid) {
const c = (data.contacts || []).find(x => x && x.id === cid);
return fixedNameOf(c) || '那位';
}
function _plSingles() { return (data.contacts || []).filter(c => c && c.kind !== 'group'); }
function _plPushTrack(o) {
const p = _plRoot();
if (!Array.isArray(p.tracks)) p.tracks = [];
p.tracks.push(o);
save();
return o;
}
function plRemoveTracks(ids) {
const set = new Set(Array.isArray(ids) ? ids : [ids]);
if (!set.size) return;
const p = _plRoot();
const victims = plTracks().filter(t => set.has(t.id));
p.tracks = plTracks().filter(t => !set.has(t.id));
if (plPre && set.has(plPre.id)) plPre = null;
victims.forEach(t => {
if (t.fid && plObjUrls[t.fid]) { try { URL.revokeObjectURL(plObjUrls[t.fid]); } catch (e) {} delete plObjUrls[t.fid]; }
});
if (Array.isArray(p.recent)) p.recent = p.recent.filter(x => x && !set.has(x.tid));
if (p.plays && typeof p.plays === 'object') set.forEach(id => { delete p.plays[id]; });
victims.forEach(t => {
delete plPos[t.id]; delete plOkAt[t.id]; delete plUrlAt[t.id];
if (t.src === 'file' && t.fid && window.idbDelete) {
try { const r = window.idbDelete(PL_FILE_KEY + t.fid); if (r && r.catch) r.catch(() => {}); } catch (e) {}
}
});
if (Array.isArray(p.favs)) p.favs = p.favs.filter(x => !set.has(x));
if (Array.isArray(p.queue)) p.queue = p.queue.filter(x => !set.has(x));
(Array.isArray(p.playlists) ? p.playlists : []).forEach(l => { if (Array.isArray(l.trackIds)) l.trackIds = l.trackIds.filter(x => !set.has(x)); });
if (set.has(p.current)) { p.current = ''; _plStopAudio(); }
save();
renderPlayerAll();
}
function plRemoveTrack(id) { plRemoveTracks([id]); }
function _plMediaSync(t, playing) {
window.__plMediaOn = !!t;
try {
if (!('mediaSession' in navigator) || !navigator.mediaSession) return;
if (!t) { try { navigator.mediaSession.playbackState = 'none'; } catch (e) {} return; }
if (window.MediaMetadata) {
try {
const art = [];
if (t.pic) { try { art.push({ src: new URL(String(t.pic), location.href).href, sizes: '512x512' }); } catch (e) {} }
art.push({ src: 'icon-512.png', sizes: '512x512', type: 'image/png' });
navigator.mediaSession.metadata = new window.MediaMetadata({
title: t.name || '未知歌曲', artist: t.artist || '未知歌手', album: '言字卡',
artwork: art
});
} catch (e) {}
}
try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch (e) {}
const bind = (act, fn) => { try { navigator.mediaSession.setActionHandler(act, fn); } catch (e) {} };
bind('play', () => { const a = _plAudio(); if (a && a.paused) { _plWantSet(true); const r = a.play(); if (r && r.catch) r.catch(() => {}); } _plMediaSync(plCur(), true); });
bind('pause', () => { const a = _plAudio(); if (a && !a.paused) a.pause(); _plWantSet(false); _plMediaSync(plCur(), false); });
bind('previoustrack', () => plPrev());
bind('nexttrack', () => plNext(false));
bind('stop', () => _plStopAudio());
const dur = (plAudio && Number.isFinite(plAudio.duration) && plAudio.duration) ? plAudio.duration : 1;
bind('seekbackward', () => plSeekRatio(Math.max(0, ((plAudio && plAudio.currentTime) || 0) - 10) / dur));
bind('seekforward', () => plSeekRatio(Math.min(0.999, (((plAudio && plAudio.currentTime) || 0) + 10) / dur)));
bind('seekto', d => {
const du = (plAudio && Number.isFinite(plAudio.duration)) ? plAudio.duration : 0;
if (du && d && Number.isFinite(d.seekTime)) plSeekRatio(Math.max(0, Math.min(0.999, d.seekTime / du)));
});
_plMediaPos();
} catch (e) {}
}
function _plMediaPos() {
try {
if (!('mediaSession' in navigator) || !navigator.mediaSession) return;
const a = plAudio;
if (!a || !a.src) return;
if (!Number.isFinite(a.duration) || a.duration <= 0) return;
navigator.mediaSession.setPositionState({
duration: a.duration,
playbackRate: a.playbackRate || 1,
position: Math.max(0, Math.min(a.currentTime || 0, a.duration))
});
} catch (e) {}
}
var plVolBroken = false, plVolMuteAt = 0.8, plVolWarned = false;
function _plVolGet() { const v = _plRoot().volume; return (typeof v === 'number' && isFinite(v) && v >= 0 && v <= 1) ? v : 0.8; }
function _plVolApply(v, quiet) {
const p = _plRoot();
p.volume = Math.max(0, Math.min(1, Number(v)));
if (!isFinite(p.volume)) p.volume = 0.8;
save();
try { if (plEl) plEl.volume = p.volume; } catch (e) {}
try { if (plWaEl) plWaEl.volume = p.volume; } catch (e) {}
try { if (plWaGain) plWaGain.gain.value = p.volume; } catch (e) {}
const inp = document.getElementById('plVol'); if (inp) inp.value = String(Math.round(p.volume * 100));
const btn = document.getElementById('plVolBtn'); if (btn) btn.dataset.on = p.volume > 0 ? '1' : '0';
if (!quiet && plVolBroken && !plVolWarned) { plVolWarned = true; try { showToast('这台设备不让网页调音量·请用侧键或系统音量条'); } catch (e) {} }
}
function _plPlayQuiet(a) { try { const r = a && a.play ? a.play() : null; if (r && r.catch) r.catch(() => {}); } catch (e) {} }
(function _plVolProbe() {
try { const a = new Audio(); a.volume = 0.42; plVolBroken = a.volume !== 0.42; } catch (e) { plVolBroken = true; }
})();
function _plWire(el) {
el.preload = 'metadata';
el.addEventListener('timeupdate', _plPaint);
el.addEventListener('loadedmetadata', () => {
const t = plCur();
if (_plTrialCheck(el, t)) return;
if (t && !t.dur && Number.isFinite(el.duration) && el.duration > 0) {
t.dur = Math.round(el.duration); save();
}
_plPaint();
_plMediaPos();
});
el.addEventListener('ended', plOnEnded);
el.addEventListener('seeked', _plMediaPos);
el.addEventListener('play', ev => {
if (ev && ev.target !== plAudio) return;
if (plRoting) { plRoting = false; _plStatePub(); return; }
_plClearTaTimers(); plPauseOn = false; _plScheduleTa(plCur()); _plPaint();
try { if (typeof plLyricArm === 'function') plLyricArm(plCur()); } catch (e) {}
_plWantSet(true); _plBgResumeClear(); _plStatePub();
plStallCt = -1; plStallAt = 0; plStallHealAt = 0;
_plMediaPos();
});
el.addEventListener('pause', ev => {
if (ev && ev.target !== plAudio) return;
if (!plPauseOn) _plClearTaTimers();
_plStatePub();
if (plWant && !plPauseOn) _plBgResumeArm();
_plPaint();
_plMediaPos();
});
el.addEventListener('playing', () => {
if (plNcmUrlPend >= 0 && plNcmUrlPend !== plNcmUrlIdx) {
const better = plTrialPrev == null
|| (Number.isFinite(el.duration) && el.duration > plTrialPrev + 15);
if (better) {
plNcmUrlIdx = plNcmUrlPend;
try { showToast('换一台接口才放得出来·往后就用这台'); } catch (e) {}
}
plNcmUrlPend = -1; plTrialPrev = null;
} else if (plNcmUrlPend >= 0) { plNcmUrlPend = -1; }
_plFailReset();
});
el.addEventListener('error', () => { plTrialPrev = null; _plPaint(); _plHeal(ok => { if (!ok) _plSayLoadFail(); }); });
return el;
}
var plPos = {};
var plOkAt = {};
var plUrlAt = {};
var plStartAt = 0;
var PL_POS_TAIL_SEC = 5;
function _plPosDrop(id) {
if (!id) return;
delete plPos[id];
const m = _plRoot().pos;
if (m && typeof m === 'object' && !Array.isArray(m) && m[id]) { delete m[id]; save(); }
}
function _plSeekBack(el, t) {
const pos = plPos[t.id];
if (!pos || pos < 5) return;
const go = () => {
const d = Number.isFinite(el.duration) ? el.duration : (Number(t.dur) || 0);
if (d && pos >= d - PL_POS_TAIL_SEC) {
_plPosDrop(t.id);
try { el.currentTime = 0; } catch (e) {}
return;
}
try { el.currentTime = d ? Math.max(0, Math.min(pos, d - 1)) : pos; } catch (e) {}
};
if (el.readyState >= 1) go();
else el.addEventListener('loadedmetadata', go, { once: true });
}
var PL_POS_KEEP = 60;
var plPosSavedAt = 0;
function _plPosRecall(t) {
if (!t || plPos[t.id] !== undefined) return;
const m = _plRoot().pos;
const v = m && m[t.id];
const sec = v && Number(v.sec);
if (!Number.isFinite(sec) || sec <= 5) return;
const d = Number(t.dur) || 0;
if (d && sec >= d - PL_POS_TAIL_SEC) { _plPosDrop(t.id); return; }
plPos[t.id] = sec;
}
function _plPosSave(force) {
const t = plCur(); if (!t) return;
const sec = Number(plPos[t.id]);
if (!Number.isFinite(sec) || sec < 5) return;
const _a = plAudio;
const _d = (_a && Number.isFinite(_a.duration) && _a.duration > 0) ? _a.duration : (Number(t.dur) || 0);
if (_d && sec >= _d - PL_POS_TAIL_SEC) { if (force) _plPosDrop(t.id); return; }
const p = _plRoot();
if (!p.pos || typeof p.pos !== 'object' || Array.isArray(p.pos)) p.pos = {};
const prev = p.pos[t.id];
if (!force && prev && Math.abs(Number(prev.sec) - Math.round(sec)) < 3) return;
p.pos[t.id] = { sec: Math.round(sec), at: Date.now() };
Object.keys(p.pos).sort((a, b) => (p.pos[b].at || 0) - (p.pos[a].at || 0)).slice(PL_POS_KEEP).forEach(k => delete p.pos[k]);
save();
}
function _plCurBaseIdx(src) {
const s = String(src || '');
for (let i = 0; i < PL_NCM_URL_BASES.length; i++) if (s.indexOf(PL_NCM_URL_BASES[i]) === 0) return i;
return -1;
}
function _plTrialCheck(el, t) {
if (!t || t.src !== 'ncm' || !t.nid) return false;
const d = el.duration;
if (!Number.isFinite(d) || d <= 0) return false;
const cur = _plCurBaseIdx(el.src);
if (cur < 0) return false;
if (d >= 60) { delete plTrialSeen[t.id]; return false; }
const heard = plTrialSeen[t.id] || (plTrialSeen[t.id] = {});
heard[cur] = d;
let nb = -1;
for (let i = 0; i < PL_NCM_URL_BASES.length; i++) if (!(i in heard)) { nb = i; break; }
if (nb < 0) {
if (!heard._said) { heard._said = 1; try { showToast('会员歌匿名只取到试听片段·登录网易云拿完整版'); } catch (e) {} }
return true;
}
plTrialPrev = d;
plNcmUrlPend = nb;
plUrlAt[t.id] = Date.now();
try { el.src = _plNcmUrl(t.nid, nb); } catch (e) { return true; }
el.addEventListener('loadedmetadata', () => { _plSeekBack(el, t); _plPlayQuiet(el); }, { once: true });
_plPlayQuiet(el);
return true;
}
function _plHeal(done) {
const t = plCur();
if (!t || t.src !== 'ncm' || !t.nid) { done(false); return; }
const n = (plHealTry[t.id] || 0) + 1;
if (n > PL_NCM_HEAL_MAX) { done(false); return; }
plHealTry[t.id] = n;
const relay = (u, at) => {
if (plCur() !== t) { done(false); return; }
if (!u) { done(false); return; }
plUrlAt[t.id] = Date.now();
const a = _plAudio();
try { a.src = u; } catch (e) { done(false); return; }
if (typeof at === 'number') plNcmUrlPend = at;
_plMediaSync(t, true);
a.addEventListener('loadedmetadata', () => { _plSeekBack(a, t); _plPlayQuiet(a); }, { once: true });
_plPlayQuiet(a);
done(true);
};
if (_plNcmCookie() && plOkAt[t.id] && !plNcmRealTried[t.id]) {
plNcmRealTried[t.id] = 1;
showToast('这条地址过期了·正在重新取…');
_plNcmRealUrl(t.nid).then(u => { if (u) relay(u); else { const nb = _plNextNcmBase(); relay(nb < 0 ? '' : _plNcmUrl(t.nid, nb), nb); } });
return;
}
const nb = _plNextNcmBase();
if (nb < 0) { done(false); return; }
showToast('这台接口没答上·换一台再取…');
relay(_plNcmUrl(t.nid, nb), nb);
}
function _plEl() {
if (plEl) return plEl;
try { plEl = new Audio(); } catch (e) { return null; }
return _plWire(plEl);
}
function _plWaEl() {
if (plWaBroken) return null;
try {
const AC = window.AudioContext || window.webkitAudioContext;
if (!AC) { plWaBroken = true; return null; }
if (!plWaCtx) { try { plWaCtx = new AC(); } catch (e) { plWaBroken = true; return null; } }
if (plWaCtx.state !== 'running') { try { const rr = plWaCtx.resume(); if (rr && rr.catch) rr.catch(function () {}); } catch (e) {} }
if (plWaCtx.state !== 'running') return null;
if (!plWaEl) {
const el = new Audio(); _plWire(el);
plWaNode = plWaCtx.createMediaElementSource(el);
plWaGain = plWaCtx.createGain();
plWaNode.connect(plWaGain); plWaGain.connect(plWaCtx.destination);
plWaEl = el;
}
return plWaEl;
} catch (e) { plWaBroken = true; return null; }
}
function plNoDuckOn() { try { return !!(data && data.appearance && data.appearance.plNoDuck); } catch (e) { return false; } }
function _plPickEl(t) {
if (t && t.src === 'file' && plNoDuckOn() && !document.hidden) { const w = _plWaEl(); if (w) { plAudio = w; _plOnly(w); return w; } }
plAudio = _plEl(); _plOnly(plAudio); return plAudio;
}
function _plAudio() { if (plAudio) return plAudio; plAudio = _plEl(); return plAudio; }
var plWant = false;
var plRoting = false;
var plBgResumeTimers = [], plBgResumeFails = 0, plBgResumeFailAt = 0;
function _plPlayingNow() { return !!(plAudio && plAudio.src && !plAudio.paused && !plAudio.ended); }
function _plStatePub() {
const on = _plPlayingNow();
try { window.__plPlaying = on; } catch (e) {}
try { if (window.__bgMusicState) window.__bgMusicState(on); } catch (e) {}
}
var plBgWatchTimer = 0;
var plStallCt = -1, plStallAt = 0, plStallHealAt = 0;
var PL_BG_WATCH_MS = 30000;
var PL_STALL_HEAL_MS = 25000;
var PL_STALL_COOL_MS = 90000;
function _plBgWatchMs() { try { if (typeof window.__plBgWatchMs === 'number') return Math.max(200, window.__plBgWatchMs); } catch (e) {} return PL_BG_WATCH_MS; }
function _plStallMs() { try { if (typeof window.__plStallMs === 'number') return Math.max(200, window.__plStallMs); } catch (e) {} return PL_STALL_HEAL_MS; }
function _plTaPauseHoldMs() { try { if (typeof window.__plTaPauseMaxMs === 'number') return Math.max(200, window.__plTaPauseMaxMs); } catch (e) {} return PL_TA_PAUSE_HOLD_MAX; }
function _plBgWatchStop() { if (plBgWatchTimer) { clearTimeout(plBgWatchTimer); plBgWatchTimer = 0; } }
function _plBgWatchArm() {
if (plBgWatchTimer || !plWant) return;
plBgWatchTimer = setTimeout(function () {
plBgWatchTimer = 0;
if (!plWant) return;
if (plPauseOn) {
if (plPauseAt && Date.now() - plPauseAt >= _plTaPauseHoldMs()) plResumeByTa();
} else {
const a = plAudio;
if (a && a.src && !a.ended) {
if (a.paused) _plBgResumeTry();
else _plStallCheck(a);
}
}
_plBgWatchArm();
}, _plBgWatchMs());
}
function _plWantSet(on) {
plWant = !!on;
if (!plWant) { _plBgResumeClear(); _plBgWatchStop(); }
else _plBgWatchArm();
}
function _plStallMark(ct) {
if (ct !== plStallCt) { plStallCt = ct; plStallAt = Date.now(); }
}
function _plStallCheck(a) {
if (!a || a.paused || a.ended || !a.src) return;
const ct = Number(a.currentTime) || 0;
if (ct !== plStallCt) { plStallCt = ct; plStallAt = Date.now(); return; }
if (!plStallAt) { plStallAt = Date.now(); return; }
if (Date.now() - plStallAt < _plStallMs()) return;
if (plStallHealAt && Date.now() - plStallHealAt < PL_STALL_COOL_MS) return;
const t = plCur();
if (!t) return;
plStallHealAt = Date.now();
plStallAt = Date.now();
if (t.src === 'ncm') {
try { _plHeal(ok => { if (!ok) _plSayLoadFail(); }); } catch (e) {}
return;
}
const pos = ct;
try {
a.load();
const go = function () {
try { a.currentTime = Math.max(0, pos - 1); } catch (e) {}
_plPlayQuiet(a);
};
if (a.readyState >= 1) go(); else a.addEventListener('loadedmetadata', go, { once: true });
} catch (e) {}
}
function _plOnly(el) {
try { if (plEl && plEl !== el && !plEl.paused) plEl.pause(); } catch (e) {}
try { if (plWaEl && plWaEl !== el && !plWaEl.paused) plWaEl.pause(); } catch (e) {}
}
function _plMoveTo(el) {
const from = plAudio;
if (!from || !el || from === el) return false;
const pos = Number.isFinite(from.currentTime) ? from.currentTime : 0;
const wasPl = !from.paused && !from.ended;
try { if (String(el.src || '') !== String(from.src || '')) el.src = from.src; else if (!el.src) return false; } catch (e) { return false; }
plRoting = true;
plAudio = el;
try { from.pause(); } catch (e) {}
_plOnly(el);
const go = function () {
try { el.currentTime = pos; } catch (e) {}
_plVolApply(_plVolGet(), true);
if (wasPl) {
const p = el.play();
if (p && p.catch) p.catch(function () { if (_plAudio() === el && plWant) _plBgResumeArm(); });
}
_plPaint();
_plStatePub();
};
if (el.readyState >= 1) go(); else el.addEventListener('loadedmetadata', go, { once: true });
_plMediaSync(plCur(), wasPl);
_plStatePub();
setTimeout(function () { plRoting = false; }, 1500);
return true;
}
function _plBgRoute() {
const t = plCur();
if (!t || !plAudio) return;
if (document.hidden) {
if (plAudio === plWaEl && t.src === 'file') _plMoveTo(_plEl());
return;
}
if (plAudio === plEl && t.src === 'file' && plNoDuckOn()) { const w = _plWaEl(); if (w) _plMoveTo(w); }
}
function _plBgResumeClear() { plBgResumeTimers.forEach(clearTimeout); plBgResumeTimers = []; }
function _plBgResumeArm() {
if (!plWant || plPauseOn) return;
_plBgResumeClear();
[300, 1500, 5000, 12000].forEach(function (d) {
plBgResumeTimers.push(setTimeout(function () { try { _plBgResumeTry(); } catch (e) {} }, d));
});
plBgResumeTimers.push(setTimeout(function () { if (plWant && plAudio && plAudio.paused) _plBgResumeArm(); }, 12000));
}
function _plBgResumeTry() {
if (!plWant || plPauseOn) return;
if (plBgResumeFails >= 6 && Date.now() - plBgResumeFailAt < 60000) return;
const a = plAudio, t = plCur();
if (!a || !t || !a.src || !a.paused || a.ended) return;
const p = a.play();
if (p && p.then) p.then(function () { plBgResumeFails = 0; }, function () { plBgResumeFails++; plBgResumeFailAt = Date.now(); });
}
function _plBgResumeFront() {
if (!plWant || plPauseOn) return;
_plBgResumeClear();
plBgResumeFails = 0;
const a = plAudio;
if (a && a.src && a.paused) _plBgResumeTry();
_plStatePub();
}
document.addEventListener('visibilitychange', function () {
try { _plBgRoute(); } catch (e) {}
if (document.visibilityState === 'visible') { try { _plBgResumeFront(); } catch (e) {} }
});
window.__plBgProbe = function () {
try {
return {
route: plAudio === plWaEl ? 'wa' : (plAudio === plEl ? 'el' : '?'),
waState: plWaCtx ? plWaCtx.state : 'none',
playing: _plPlayingNow(),
pub: !!window.__plPlaying,
want: plWant,
pauseOn: plPauseOn,
rot: plRoting,
resuming: plBgResumeTimers.length,
elSrc: !!(plEl && plEl.src), waSrc: !!(plWaEl && plWaEl.src),
elPaused: plEl ? !!plEl.paused : null, waPaused: plWaEl ? !!plWaEl.paused : null,
noDuck: plNoDuckOn(), hidden: !!document.hidden
};
} catch (e) { return { err: String((e && e.message) || e) }; }
};
var PL_FAIL_STREAK = 3;
var plFailSaidFor = '';
var plFailRun = 0, plFailRunId = '', plFailWhy = '', plFailStreakOn = false;
function _plFailReset() {
if (!plFailRun && !plFailStreakOn) return;
plFailRun = 0; plFailRunId = ''; plFailWhy = ''; plFailStreakOn = false;
try { _plSubPaint(); } catch (e) {}
}
function _plFailWhy(t) {
if (!t) return { why: '没有这一首', msg: '没有要放的曲子' };
if (t.src === 'ncm') {
if (_plIsVipTrack(t)) return { why: '这首是会员歌曲', msg: '这首是网易云会员歌曲·没登录放不出整曲（曲库顶上那枚「去掉会员歌」能一次清掉）' };
if (!_plNcmCookie()) return { why: '要先登录网易云', msg: '这首是会员专享·要先登录网易云（「添加」→ 网易云账号）' };
if (_plNcmDeadNow() || plNcmSayWhy === 'down') return { why: '网易云接口那台没答上', msg: '网易云接口那台没答上＝这首取不到声音·去「设置 → 网易云接口地址」改一台' };
if (!plNcmProfile) return { why: 'cookie 还没验证通', msg: 'cookie 存了但还没验证通：去「网易云账号」点一下「测一下那台」' };
return { why: '这个号放不出这一首', msg: '这首在网易云没有可放的地址（会员专享，或这个号没有这项权益）' };
}
if (t.src === 'qq') return { why: 'QQ 音乐已下线', msg: 'QQ 音乐已下线（登录一直不成功·这个音源已删除）' };
if (t.src === 'file') return { why: '本机字节不在了', msg: '这首的本机字节已经不在了（换过设备或清过存储）' };
return { why: '地址失效或设备不支持', msg: '这一首放不出来（地址失效，或这台设备不支持）' };
}
function _plSayLoadFail() {
const t = plCur(); if (!t || plFailSaidFor === t.id) return;
plFailSaidFor = t.id;
const w = _plFailWhy(t);
let msg = w.msg;
try {
const p = _plRoot();
if (p.withCid && p.current === t.id) {
plCoNoBind = true;
_plCoDropPatch(p.withCid);
msg += '· 这次一起听没听成';
setTimeout(() => { try { renderPlayerAll(); } catch (e) {} }, 0);
}
} catch (e) {}
try { showToast(msg); } catch (e) {}
if (plFailRunId !== t.id) { plFailRunId = t.id; plFailRun++; plFailWhy = w.why; }
if (plFailRun >= PL_FAIL_STREAK && !plFailStreakOn) {
plFailStreakOn = true;
_plWantSet(false);
_plClearTaTimers();
try { showToast('连着 ' + plFailRun + ' 首都放不出来·先停在这里（' + w.why + '）'); } catch (e) {}
}
try { _plSubPaint(); } catch (e) {}
}
function _plFailStreakTx() { return plFailStreakOn ? '连着 ' + PL_FAIL_STREAK + ' 首都放不出来 · ' + (plFailWhy || '先看上面那一句') : ''; }
function _plStopAudio() {
_plClearTaTimers();
_plWantSet(false);
plPre = null;
if (plAudio) { try { plAudio.pause(); plAudio.removeAttribute('src'); plAudio.load(); } catch (e) {} }
_plOnly(null);
_plMediaSync(null);
_plStatePub();
_plPaint();
}
var plObjUrls = {};
function _plObjUrlKeep(fid, u) { try { if (plObjUrls[fid]) URL.revokeObjectURL(plObjUrls[fid]); } catch (e) {} plObjUrls[fid] = u; return u; }
function _plValToSrc(fid, v) {
if (v && typeof v === 'object' && typeof v.size === 'number') {
try { return _plObjUrlKeep(fid, URL.createObjectURL(v)); } catch (e) { return ''; }
}
const s = String(v || '');
if (!s || !/^data:/i.test(s) || typeof fetch !== 'function') return s;
return fetch(s).then(r => r.blob()).then(b => {
try { if (window.idbSet) window.idbSet(PL_FILE_KEY + fid, b); } catch (e) {}
return _plObjUrlKeep(fid, URL.createObjectURL(b));
}).catch(() => s);
}
function _plFileSrc(fid) { return window.idbGet(PL_FILE_KEY + fid).then(v => _plValToSrc(fid, v)); }
function plLoad(t) {
if (!t) return false;
plFailSaidFor = '';
delete plHealTry[t.id]; delete plNcmRealTried[t.id]; delete plTrialSeen[t.id]; plTrialPrev = null;
if (plPre && plPre.id !== t.id) plPre = null;
const a = _plPickEl(t); if (!a) { showToast('这台设备放不了音频'); return false; }
if (!plPlayable(t)) {
showToast(t.src === 'file' ? '这首的本机字节已经不在了（换过设备或清过存储）'
: t.src === 'qq' ? 'QQ 音乐已下线·不能再放了（这个音源已删除）'
: t.src === 'ncm' ? '这一首没记下网易云的歌曲号，取不到声音' : '这一首没有可播的地址');
return false;
}
if (t.src === 'file') {
if (!window.idbGet) { showToast('这台设备读不到本机存储'); return false; }
plCur_ = t;
if (plPre && plPre.id === t.id && plPre.url) {
const v = plPre.url; plPre = null;
Promise.resolve(_plValToSrc(t.fid, v)).then(u => {
if (plCur_ !== t || !u) return;
try { a.src = u; } catch (e) { return; }
plStart(t);
}).catch(() => { if (plCur_ === t) showToast('读这首的时候出错了'); });
return true;
}
_plFileSrc(t.fid).then(u => {
if (plCur_ !== t) return;
if (!u) { showToast('这首的音频字节已经不在了'); return; }
try { a.src = u; } catch (e) { return; }
plStart(t);
}).catch(() => { if (plCur_ === t) showToast('读这首的时候出错了'); });
return true;
}
if (t.src === 'ncm' && _plNcmCookie()) {
plCur_ = t;
if (plPre && plPre.id === t.id && plPre.url) {
const u0 = plPre.url; plPre = null;
try { a.src = u0; } catch (e) { return false; }
plStart(t);
return true;
}
_plNcmRealUrl(t.nid).then(u => {
if (plCur_ !== t) return;
try { a.src = u || plSrcOf(t); } catch (e) { return; }
plStart(t);
});
return true;
}
try { a.src = plSrcOf(t); } catch (e) { return false; }
plStart(t);
return true;
}
function plPlayId(id) {
const t = plById(id); if (!t) return;
const p = _plRoot();
if (p.sleepEndQ) { p.sleepEndQ = false; save(); renderPlayerFull(); }
plLoad(t);
}
var plPicMiss = {};
function _plCoverBackfill(t) {
if (!t || t.src !== 'ncm' || !t.nid) return;
if (t.pic && _plIs126(t.pic)) return;
const id = t.id, at = Date.now();
if (plPicMiss[id] && at - plPicMiss[id] < 120000) return;
plPicMiss[id] = at;
const done = pic => {
if (!pic) return;
const cur = plById(id);
if (!cur) return;
if (cur.pic && _plIs126(cur.pic)) return;
cur.pic = pic; save();
if (plCur() === cur) {
try { const cvb = document.querySelector('#playerFull .pl-cover-box'); if (cvb) cvb.dataset.pic = ''; } catch (e) {}
renderPlayerAll();
_plMediaSync(plCur(), _plPlayingNow());
}
};
const askMeting = () => {
const urls = [PL_NCM_API].concat(PL_NCM_METING).map(base =>
base + '?server=netease&type=song&id=' + encodeURIComponent(String(t.nid)));
return Promise.all(urls.map(u => _plFetchText(u, 8000))).then(texts => {
for (let i = 0; i < texts.length; i++) {
const rows = _plMetingList(texts[i]);
if (rows.length && rows[0].pic) return rows[0].pic;
}
return '';
});
};
_plNcmAsk('/song/detail?ids=' + encodeURIComponent(String(t.nid)), 8000).then(txt => {
const j = _plNcmJSON(txt);
const one = j && Array.isArray(j.songs) ? j.songs[0] : null;
const pic = one ? _plNcmRow(one).pic : '';
if (pic) { done(pic); return; }
return askMeting().then(done);
}).catch(() => { askMeting().then(done); });
}
function plStart(t) {
const p = _plRoot(), a = _plAudio();
plCoNoBind = false;
plCoAutoBind();
p.current = t.id;
plStartAt = Date.now();
plListenLastCur = -1;
p.recent = [{ tid: t.id, at: Date.now() }]
.concat((Array.isArray(p.recent) ? p.recent : []).filter(x => x && x.tid !== t.id)).slice(0, 100);
if (!p.plays || typeof p.plays !== 'object' || Array.isArray(p.plays)) p.plays = {};
const pn = p.plays[t.id] || { n: 0, last: 0 };
p.plays[t.id] = { n: (Math.floor(Number(pn.n)) || 0) + 1, last: Date.now() };
save();
plUrlAt[t.id] = Date.now();
_plWantSet(true);
_plOnly(a);
_plVolApply(_plVolGet(), true);
_plMediaSync(t, true);
if (_plFloatLrcOn()) { try { plLrcEnsure(); } catch (e) {} }
_plPosRecall(t);
_plSeekBack(a, t);
if (a) a.addEventListener('playing', () => {
plOkAt[t.id] = Date.now();
if (plLyrFollowPend && Date.now() - plLyrFollowPend.at > 900000) plLyrFollowPend = null;
if (plLyrFollowPend && plLyrFollowPend.tid === t.id) {
const fp = plLyrFollowPend; plLyrFollowPend = null;
setTimeout(() => { try { if (!plLyrBlocked(fp.cid, t)) plLyrSend(fp.cid, t); } catch (e) {} }, 1200 + Math.random() * 1200);
}
}, { once: true });
if (a && a.play) {
const r = a.play();
if (r && r.catch) r.catch(err => {
try { showToast((err && err.name === 'NotAllowedError') ? '浏览器拦了自动播放·点一下播放键就响' : '这一首放不出来（链接可能过期了）'); } catch (e2) {}
});
}
_plStatePub();
if (plNoDuckOn() && t && t.src !== 'file' && !_plOnlineDuckNoted) { _plOnlineDuckNoted = true; try { showToast('在线音源会占用音频通道，其他 App 的声音会被暂停（浏览器限制，做不到边听边放）'); } catch (e) {} }
_plCoverBackfill(t);
renderPlayerPlayState();
return true;
}
function plToggle() {
const t = plCur(), a = _plAudio();
if (!t) { plOpenFull(true); return; }
if (!a) return;
const want = !!a.paused;
if (want) {
if (!a.src && !plLoad(t)) return;
_plOnly(a); _plWantSet(true);
const r = a.play(); if (r && r.catch) r.catch(() => showToast('这一首放不出来（链接可能过期了）'));
} else { _plWantSet(false); a.pause(); }
_plMediaSync(t, want);
_plStatePub();
_plPaint();
}
function plReplay() {
const t = plCur();
if (!t) { showToast('还没挑一首·先放一首'); return; }
_plPosDrop(t.id);
const a = _plAudio();
if (!a || !a.src) { plLoad(t); return; }
_plWantSet(true);
_plOnly(a);
try { a.currentTime = 0; } catch (e) {}
const r = a.play(); if (r && r.catch) r.catch(() => showToast('这一首放不出来（链接可能过期了）'));
_plMediaSync(t, true);
_plStatePub();
_plPaint();
}
function plPauseByTa() {
const a = plAudio; if (!a || a.paused) return false;
plPauseOn = true;
plPauseAt = Date.now();
try { a.pause(); } catch (e) {}
return true;
}
function plResumeByTa() {
const a = plAudio; plPauseOn = false;
if (!a || !a.paused) return;
_plWantSet(true);
const r = a.play(); if (r && r.catch) r.catch(() => {});
}
function _plFromQueue() {
const p = _plRoot();
if (!Array.isArray(p.queue) || !p.queue.length) return false;
let id = '', guard = 0;
while (p.queue.length && guard++ < 50) {
id = p.queue.shift();
const t = plById(id);
if (t && plPlayable(t)) { save(); plLoad(t); return true; }
}
save();
return false;
}
function _plNextOf(byTa) {
const p = _plRoot();
if (!byTa && Array.isArray(p.queue) && p.queue.length) {
for (let i = 0; i < p.queue.length; i++) { const t = plById(p.queue[i]); if (t && plPlayable(t)) return t; }
return null;
}
const list = plTracks().filter(plPlayable);
if (!list.length) return null;
if (p.mode === 'loopOne' && !byTa && plCur()) return null;
if (p.mode === 'shuffle') {
const c = plCur();
if (c && list.length > 1) {
const rest = list.filter(t => t.id !== c.id);
return rest[Math.floor(Math.random() * rest.length)];
}
return list[Math.floor(Math.random() * list.length)];
}
const i = list.findIndex(t => t.id === p.current);
return list[(i + 1) % list.length];
}
function plNext(byTa, skipAuto) {
if (!byTa && _plFromQueue()) return;
const p = _plRoot();
if (p.randAuto && !skipAuto) { _plRandAutoPush('manual'); return; }
if (p.mode === 'loopOne' && !byTa) { const c = plCur(); if (c) { delete plPos[c.id]; const a = _plAudio(); if (a) { try { a.currentTime = 0; } catch (e) {} plStart(c); } return; } }
const t = _plNextOf(byTa);
if (t) plLoad(t);
}
var PL_PREFETCH_SEC = 15;
var plPre = null;
var plPreBusy = '';
function _plPrefetchTick() {
const a = plAudio;
if (!a || !a.src || a.paused || a.ended) return;
if (!Number.isFinite(a.duration) || a.duration <= 0 || a.duration - a.currentTime > PL_PREFETCH_SEC) return;
const p = _plRoot();
if (p.sleepEnd) return;
const qn = Array.isArray(p.queue) && p.queue.length;
if (p.sleepEndQ && !qn) return;
if (!qn && p.mode === 'shuffle') return;
if (!qn && p.randAuto) return;
const nx = _plNextOf(false);
if (!nx || nx.id === (plCur() && plCur().id)) { plPre = null; return; }
if (plPre && plPre.id === nx.id) return;
if (plPreBusy === nx.id) return;
const _preDone = () => { if (plPreBusy === nx.id) plPreBusy = ''; };
if (nx.src === 'file' && nx.fid && window.idbGet) {
plPreBusy = nx.id;
window.idbGet(PL_FILE_KEY + nx.fid).then(v => {
const c = plCur();
if (v && c && c.id !== nx.id) plPre = { id: nx.id, url: v };
_preDone();
}).catch(() => { _preDone(); });
} else if (nx.src === 'ncm' && _plNcmCookie() && nx.nid) {
plPreBusy = nx.id;
_plNcmRealUrl(nx.nid).then(u => {
const c = plCur();
if (u && c && c.id !== nx.id) plPre = { id: nx.id, url: u };
_preDone();
}).catch(() => { _preDone(); });
}
}
function _plPrevOf() {
const p = _plRoot(), cur = plCur();
const rec = Array.isArray(p.recent) ? p.recent : [];
for (let i = 0; i < rec.length; i++) {
const x = rec[i];
if (!x || !x.tid || (cur && x.tid === cur.id)) continue;
const t = plById(x.tid);
if (t && plPlayable(t)) return t;
}
const list = plTracks().filter(plPlayable);
if (!list.length) return null;
const i = cur ? list.findIndex(t => t.id === cur.id) : -1;
return list[(i - 1 + list.length) % list.length];
}
function plPrev() {
const t = _plPrevOf();
if (t) plLoad(t);
}
function plCycleMode() {
const p = _plRoot(); const i = PL_MODES.indexOf(p.mode);
p.mode = PL_MODES[(i + 1) % PL_MODES.length] || 'order'; save();
_plPaint();
const md = document.getElementById('plfMode');
if (md) md.innerHTML = _plModeSvg(p.mode) + '<span>' + escapeHTML(PL_MODE_NAME[p.mode] || '顺序') + '</span>';
}
function plSeekRatio(r) {
const a = _plAudio(); if (!a) return;
const d = Number.isFinite(a.duration) ? a.duration : 0;
if (!d) return;
try { a.currentTime = Math.max(0, Math.min(d - 0.2, d * r)); } catch (e) {}
_plPaint();
}
function plOnEnded() {
const et = plCur();
if (et) _plPosDrop(et.id);
if (et && plStartAt && Date.now() - plStartAt < 3000 && !(Number(et.dur) > 0 && et.dur <= 5)) {
plStartAt = 0;
_plSayLoadFail();
_plPaint();
return;
}
if (_plRoot().sleepEnd) { _plRoot().sleepEnd = false; save(); _plWantSet(false); _plPaint(); return; }
if (_plRoot().sleepEndQ) { if (_plFromQueue()) return; _plRoot().sleepEndQ = false; save(); _plWantSet(false); _plPaint(); return; }
if (_plFromQueue()) return;
const pp = _plRoot();
if (pp.randAuto && pp.randBy === 'takeover') { _plTakeoverTurn('ended'); return; }
if (pp.randAuto && pp.randBy === 'ta') {
if (_plRandAutoPush('ended')) return;
if (plTaAutoAction()) return;
plNext(false, true);
return;
}
if (!pp.randAuto && plTaAutoAction()) return;
plNext(false);
}
function renderPlayerAll() {
renderPlayerPage();
renderPlayerFull();
renderPlayerSource();
renderPlayerDaily();
renderPlayerNcmList();
renderPlFloat();
}
function _plTabsHTML() {
const p = _plRoot();
const n = id => {
if (id === 'lib') return plTracks().length;
if (id === 'list') return (Array.isArray(p.playlists) ? p.playlists : []).length;
return (Array.isArray(p.invites) ? p.invites : []).length;
};
return [['find', '发现', ''], ['lib', '曲库', n('lib')], ['list', '歌单', n('list')],
['fav', '收藏', (Array.isArray(p.favs) ? p.favs : []).filter(plById).length + _plTaAll().length], ['rec', '一起听', n('rec')]]
.map(x => '<button type="button" class="stats-tab' + (plState.tab === x[0] ? ' active' : '') + '" data-pl-tab="' + x[0] + '">' +
x[1] + (x[2] !== '' ? '<i>' + x[2] + '</i>' : '') + '</button>').join('');
}
function _plTaAll() {
const out = [];
_plTaOwners().forEach(cid => _plTaFav(cid).forEach(id => { const t = plById(id); if (t) out.push(Object.assign({}, t, { _cid: cid })); }));
return out;
}
function _plNetImg(url, big) {
const s = String(url || ''); if (!s) return '';
const hi = _plPicHi(s, big);
if (hi === s) _plPicUpgrade(s);
return '<img data-src="' + escapeHTML(hi) + '" data-lazy-img="true" alt="" onerror="this.remove()">';
}
function _plLazy() {
if (_plLazy.q) return;
_plLazy.q = true;
Promise.resolve().then(() => {
_plLazy.q = false;
try { if (typeof initLazyImages === 'function') initLazyImages(); } catch (e) {}
});
}
function _plCovHTML(pic) {
const ph = _plNoteSvg();
if (!pic) return '<span class="pl-cov">' + ph + '</span>';
return '<span class="pl-cov">' + ph + _plNetImg(pic) + '</span>';
}
var plPicFetched = {}, plPicSearched = {}, _plPicSearching = false;
function _plBackfillPics() {
const need = plTracks().filter(t => t.src === 'ncm' && t.nid && !t.pic && !plPicFetched[t.nid]);
if (need.length && _plNcmApi()) {
need.slice(0, 60).forEach(t => { plPicFetched[t.nid] = 1; });
const ids = need.slice(0, 60).map(t => t.nid).join(',');
_plNcmAsk('/song/detail?ids=' + encodeURIComponent(ids), 14000).then(txt => {
const j = _plNcmJSON(txt);
const arr = (j && Array.isArray(j.songs)) ? j.songs : [];
let changed = false;
arr.forEach(s => {
const nid = String(s.id || ''); const alb = s.al || s.album; const pic = (alb && (alb.picUrl || alb.blurPicUrl)) || '';
if (!pic) return; const t = plTracks().find(x => x.src === 'ncm' && x.nid === nid);
if (t && !t.pic) { t.pic = pic; changed = true; }
});
if (changed) { save(); renderPlayerAll(); }
_plSearchBackfillPics();
}).catch(() => { _plSearchBackfillPics(); });
} else {
_plSearchBackfillPics();
}
}
async function _plSearchBackfillPics() {
if (_plPicSearching) return;
_plPicSearching = true;
try {
while (true) {
const t = plTracks().find(x => x.src === 'ncm' && x.nid && !x.pic && !plPicSearched[x.nid]);
if (!t) break;
plPicSearched[t.nid] = 1;
const kw = String((t.name || '') + ' ' + (t.artist || '')).trim();
if (kw) {
try {
const st = await _plSearchRace(kw, PL_SEARCH_MS, ['vkeys', 'qjy']);
const rows = st.rows || [];
const hit = rows.find(r => String(r.nid) === t.nid);
const pic = hit ? String(hit.pic || '') : '';
if (pic && !t.pic) { t.pic = pic; save(); renderPlayerAll(); }
} catch (e) {}
}
await new Promise(r => setTimeout(r, 400));
}
} finally { _plPicSearching = false; }
}
function _plRowHTML(t, i, o) {
o = o || {};
const cur = _plRoot().current === t.id;
const picked = plBatchOn && plBatchSel.has(t.id);
const taPlay = o.taPlay ? ' data-pl-taplay="' + escapeHTML(String(o.taPlay)) + '"' : '';
const bits = [];
if (t.artist) bits.push(escapeHTML(t.artist));
if (o.cid) bits.push(escapeHTML(_plName(o.cid)));
const tag = t.src === 'file' ? '本机' : t.src === 'qq' ? 'QQ（已下线）' : t.src === 'ncm' ? '网易云' : '';
if (tag) bits.push(tag);
if (_plIsVipTrack(t)) bits.push('会员');
return '<div class="pl-row' + (cur ? ' now' : '') + (picked ? ' sel' : '') + '"' + taPlay + ' data-pl-id="' + escapeHTML(t.id) + '">' +
(plBatchOn ? '<span class="pl-batch-chk" aria-hidden="true"></span>' : '') +
_plCovHTML(t.pic) +
'<span class="pl-tx">' +
'<span class="pl-nm' + (cur ? ' now' : '') + '">' + escapeHTML(t.name) + '</span>' +
'<span class="pl-ar">' + bits.join(' · ') + '</span></span>' +
'<span class="pl-du">' + (_plDurText(t) || '—') + '</span>' +
(plBatchOn || o.noMenu ? '' : '<button type="button" class="pl-more" data-pl-menu="' + escapeHTML(t.id) + '" aria-label="这一首还能做什么">' +
'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="19" cy="12" r="1.6"></circle></svg></button>') +
'</div>';
}
function _plSecHTML(ti, sub, n, act) {
return '<div class="pl-sec"><span class="pl-sec-t">' + escapeHTML(ti) + '</span>' +
(sub ? '<span class="pl-sec-s">' + escapeHTML(sub) + '</span>' : '') +
(n ? '<span class="pl-sec-n">' + n + ' 首</span>' : '') +
(act || '') + '</div>';
}
function _plLibBarHTML() {
const sort = plState.libSort || 'added';
return '<div class="pl-search"><span class="pl-search-box"><input type="text" class="pl-in pl-search-in" id="plLibKw" placeholder="在曲库里搜·歌名或歌手" autocomplete="off" spellcheck="false" value="' + escapeHTML(plState.libKw || '') + '"><button type="button" class="pl-search-x" data-pl-act="libclear" aria-label="清空搜索词">×</button></span></div>' +
'<div class="pl-chips">' + [['added', '最近添加'], ['name', '歌名'], ['artist', '歌手']]
.map(x => '<button type="button" class="scope-chip' + (sort === x[0] ? ' on' : '') + '" data-pl-libsort="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>';
}
var PL_ROWS_FIRST = 40, PL_ROWS_STEP = 40;
var _plChunkToken = 0;
function _plChunkAbort() { _plChunkToken++; }
function _plChunkFill(id, parts) {
_plChunkToken++;
const token = _plChunkToken;
if (parts.length <= PL_ROWS_FIRST) return;
let i = PL_ROWS_FIRST;
const step = () => {
if (token !== _plChunkToken) return;
const box = document.getElementById(id); if (!box) return;
box.insertAdjacentHTML('beforeend', parts.slice(i, i + PL_ROWS_STEP).join(''));
i += PL_ROWS_STEP;
if (i < parts.length) requestAnimationFrame(step);
else _plLazy();
};
requestAnimationFrame(step);
}
function _plLibRows() {
const kw = String(plState.libKw || '').trim().toLowerCase();
const sort = plState.libSort || 'added';
let rows = plTracks().slice().reverse();
if (kw) rows = rows.filter(t => String(t.name || '').toLowerCase().indexOf(kw) >= 0 || String(t.artist || '').toLowerCase().indexOf(kw) >= 0);
if (sort === 'name') rows = rows.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hans-CN'));
else if (sort === 'artist') rows = rows.slice().sort((a, b) => String(a.artist || '').localeCompare(String(b.artist || ''), 'zh-Hans-CN'));
return rows;
}
function _plLibHeadHTML(rows) {
const kw = String(plState.libKw || '').trim();
const sort = plState.libSort || 'added';
const sortName = sort === 'name' ? '按歌名' : sort === 'artist' ? '按歌手' : '按添加先后倒过来';
const sub = sortName + (kw ? ' · 搜到 ' + rows.length + ' 首' : '');
if (!rows.length) {
return kw ? _plEmptyHTML('没有含「' + kw + '」的曲子')
: _plEmptyHTML('曲库还是空的·添几首进来 TA 才有得邀你', { attr: 'data-pl-add="1"', t: '添加歌曲' });
}
const vip = (!_plNcmCookie() && rows.some(t => t.src === 'ncm' && t.nid))
? '<button type="button" class="pl-link pl-vip-drop" data-pl-act="vipdrop">去掉会员歌</button>' : '';
return _plSecHTML('曲库', sub, rows.length, '<span class="pl-sec-acts">' + (plBatchOn ? ''
: vip + '<button type="button" class="pl-link pl-batch-open" data-pl-batch="enter">批量管理</button>') +
'</span>');
}
function _plRecentHTML() {
const kw = String(plState.libKw || '').trim();
if (kw || plBatchOn) return '';
const rows = (Array.isArray(_plRoot().recent) ? _plRoot().recent : []).map(x => plById(x && x.tid)).filter(Boolean).slice(0, 8);
if (!rows.length) return '';
return _plSecHTML('最近播放', '', rows.length,
'<span class="pl-sec-acts"><button type="button" class="pl-link" data-pl-recentplay="1">接着听</button></span>') +
rows.map((t, i) => _plRowHTML(t, i)).join('');
}
function _plRecentPlayAll() {
const p = _plRoot();
const list = (Array.isArray(p.recent) ? p.recent : []).map(x => plById(x && x.tid)).filter(t => t && plPlayable(t));
if (!list.length) { showToast('最近播放里没有放得出的曲子'); return; }
p.queue = list.slice(1).map(t => t.id);
save();
plPlayId(list[0].id);
}
function _plLibRowsPaint() {
const box = document.getElementById('plLibRows'); if (!box) return;
const rows = _plLibRows();
if (!rows.length) { _plChunkAbort(); box.innerHTML = _plLibHeadHTML(rows); return; }
const parts = rows.map((t, i) => _plRowHTML(t, i));
box.innerHTML = _plRecentHTML() + _plLibHeadHTML(rows) + parts.slice(0, PL_ROWS_FIRST).join('');
_plChunkFill('plLibRows', parts);
}
function _plEmptyHTML(ti, btn) {
return '<div class="pl-empty"><span>' + escapeHTML(ti) + '</span>' +
(btn ? '<button type="button" class="pl-link" ' + btn.attr + '>' + escapeHTML(btn.t) + '</button>' : '') + '</div>';
}
function _plFindFreeIds() {
return (Array.isArray(plFindRows) ? plFindRows : [])
.filter(r => r && r.nid && !(typeof plById === 'function' && plById('ncm' + r.nid)))
.map(r => 'ncm' + r.nid);
}
function _plBatchIdsForTab() {
if (plState.tab === 'find') return _plFindFreeIds();
if (plState.tab === 'lib') return _plLibRows().map(t => t.id);
if (plState.tab === 'list') {
const l = _plListOf(plState.list);
return l && Array.isArray(l.trackIds) ? l.trackIds.filter(id => !!plById(id)) : [];
}
return [];
}
function _plBatchBarInner() {
const n = plBatchSel.size;
const dis = n ? 'false' : 'true';
const listTab = plState.tab === 'list';
const findTab = plState.tab === 'find';
return '<div class="pl-batch-hd"><b>已选 ' + n + ' 首</b><span class="pl-batch-tools">' +
'<button type="button" data-pl-batch="all">' + (findTab ? '全选未收的' : '全选') + '</button>' +
'<button type="button" data-pl-batch="exit">退出</button></span></div>' +
'<div class="pl-batch-acts">' +
(findTab ? '<button type="button" class="pl-batch-btn pri" data-pl-batch="add" aria-disabled="' + dis + '">收进曲库</button>'
: '<button type="button" class="pl-batch-btn pri" data-pl-batch="to" aria-disabled="' + dis + '">加入歌单</button>' +
(listTab ? '<button type="button" class="pl-batch-btn" data-pl-batch="unlist" aria-disabled="' + dis + '">移出这个歌单</button>' : '') +
'<button type="button" class="pl-batch-btn danger" data-pl-batch="del" aria-disabled="' + dis + '">删掉</button>') +
'</div>';
}
function plBatchPaint() {
const bar = document.getElementById('plBatchBar');
if (bar) { bar.hidden = !plBatchOn; bar.innerHTML = plBatchOn ? _plBatchBarInner() : ''; }
document.querySelectorAll('#playerView .pl-row[data-pl-id]').forEach(row => {
row.classList.toggle('sel', plBatchOn && plBatchSel.has(row.dataset.plId));
});
document.querySelectorAll('#playerView .pl-res-wrap[data-pl-find]').forEach(row => {
row.classList.toggle('sel', plBatchOn && plBatchSel.has(row.dataset.plFind));
});
const now = document.getElementById('plNow');
if (now && plBatchOn) { now.hidden = true; now.innerHTML = ''; }
}
function _plFindBatchOff() {
if (!plBatchOn) return;
plBatchOn = false; plBatchSel.clear();
plBatchPaint();
try { renderPlNow(); } catch (e) {}
}
function plBatchEnter() {
if (plState.tab !== 'lib' && plState.tab !== 'list' && plState.tab !== 'find') { showToast('这一页没有可批量管理的曲子'); return; }
if (!_plBatchIdsForTab().length) { showToast(plState.tab === 'find' ? '这一页都收进曲库了' : '这一页还没有曲子'); return; }
plBatchOn = true; plBatchSel.clear();
renderPlayerPage();
}
function plBatchExit() { plBatchOn = false; plBatchSel.clear(); renderPlayerPage(); }
function plBatchToggle(id) {
if (!id) return;
if (plBatchSel.has(id)) plBatchSel.delete(id); else plBatchSel.add(id);
plBatchPaint();
}
function plBatchSelectAll() {
const ids = _plBatchIdsForTab();
if (!ids.length) { showToast('这一页还没有曲子'); return; }
if (plBatchSel.size === ids.length && ids.length) plBatchSel.clear();
else ids.forEach(id => plBatchSel.add(id));
plBatchPaint();
}
function plBatchUnlist() {
if (!plBatchSel.size) { showToast('先勾几首'); return; }
const l = _plListOf(plState.list); if (!l) return;
const n = plBatchSel.size;
l.trackIds = (Array.isArray(l.trackIds) ? l.trackIds : []).filter(id => !plBatchSel.has(id));
save();
plBatchOn = false; plBatchSel.clear();
renderPlayerPage();
showToast('从《' + l.name + '》移出 ' + n + ' 首 · 曲子还在曲库');
}
function plBatchDelete() {
if (!plBatchSel.size) { showToast('先勾几首'); return; }
const ids = Array.from(plBatchSel);
window.openModal('从曲库删掉 ' + ids.length + ' 首？', '', () => {
plBatchOn = false; plBatchSel.clear();
plRemoveTracks(ids);
showToast('已从曲库删掉 ' + ids.length + ' 首');
}, { noInput: true, okText: '删掉', danger: true, staticText: '歌单与收藏里也会一起拿掉；本机文件连字节一起删。这一步找不回。' });
}
function plBatchAddFind() {
if (!plBatchSel.size) { showToast('先勾几首'); return; }
const p = _plRoot();
if (!Array.isArray(p.tracks)) p.tracks = [];
const byId = {};
(Array.isArray(plFindRows) ? plFindRows : []).forEach(r => { if (r && r.nid) byId['ncm' + r.nid] = r; });
let got = 0, had = 0;
plBatchSel.forEach(id => {
const r = byId[id];
if (!r || (typeof plById === 'function' && plById(id))) { had++; return; }
p.tracks.push({ id, nid: r.nid, name: String(r.name || '').trim() || ('网易云 ' + r.nid),
artist: String(r.artist || '').trim(), src: 'ncm', dur: Number(r.dur) || 0, pic: String(r.pic || ''), added: Date.now() });
got++;
});
if (got) save();
plBatchOn = false; plBatchSel.clear();
renderPlayerPage();
showToast(got ? '收了 ' + got + ' 首 · 没动正在放的这首' + (had ? '·另有 ' + had + ' 首本来就在库里' : '')
: '这几首本来就在曲库里了');
}
function openPlPick(from) {
plPickFrom = from;
renderPlPick();
_plMask('plPickMask', true);
}
function closePlPick() { plPickFrom = ''; _plMask('plPickMask', false); }
function renderPlPick() {
const box = document.getElementById('plPickBody'); if (!box) return;
const lists = Array.isArray(_plRoot().playlists) ? _plRoot().playlists : [];
const ids = plPickFrom === 'batch' ? Array.from(plBatchSel) : (plPickFrom ? [plPickFrom] : []);
const n = ids.filter(id => !!plById(id)).length;
const row = l => {
const has = Array.isArray(l.trackIds) ? l.trackIds.length : 0;
const allIn = ids.length && ids.every(id => (Array.isArray(l.trackIds) ? l.trackIds.indexOf(id) >= 0 : false));
return '<button type="button" class="pl-set-row pl-pick-row" data-pl-pick="' + escapeHTML(l.id) + '">' +
'<span class="pl-tx"><b>' + escapeHTML(l.name) + '</b><small>这个歌单里有 ' + has + ' 首</small></span>' +
'<span class="pl-chev">' + (allIn ? '已在' : '收') + '</span></button>';
};
box.innerHTML = '<div class="pl-set-lab">收进哪个歌单<span>' + n + ' 首</span></div>' +
(lists.length ? lists.map(row).join('') : '<div class="pl-set-note">还没有歌单·下面先建一个，建好就把这几首收进去。</div>') +
'<button type="button" class="pl-set-row pl-pick-row" data-pl-pick="__new">' +
'<span class="pl-tx"><b>新建歌单…</b><small>建好就把这 ' + n + ' 首收进去</small></span><span class="pl-chev">›</span></button>' +
'<div class="pl-note">已经在那个歌单里的不会重复收；歌单只是索引，曲子仍住在曲库里。</div>';
}
function plPickInto(pid) {
const l = _plListOf(pid); if (!l) return;
const ids = plPickFrom === 'batch' ? Array.from(plBatchSel) : (plPickFrom ? [plPickFrom] : []);
if (!ids.length) { showToast('没有选中的曲子'); return; }
if (!Array.isArray(l.trackIds)) l.trackIds = [];
let added = 0, dup = 0;
ids.forEach(id => {
if (!plById(id)) return;
if (l.trackIds.indexOf(id) >= 0) { dup++; return; }
l.trackIds.push(id); added++;
});
save();
const wasBatch = plPickFrom === 'batch';
closePlPick();
if (wasBatch) { plBatchOn = false; plBatchSel.clear(); }
renderPlayerAll();
showToast(added ? '收进《' + l.name + '》' + added + ' 首' + (dup ? '·' + dup + ' 首本来就在' : '')
: '这些本来就在《' + l.name + '》里');
}
function plPickNew() {
window.openModal('新歌单叫什么', '', v => {
const name = String(v || '').trim();
if (!name) return;
const p = _plRoot();
if (!Array.isArray(p.playlists)) p.playlists = [];
const l = { id: 'pl' + Date.now().toString(36), name, trackIds: [], created: Date.now() };
p.playlists.push(l); plState.list = l.id; save();
plPickInto(l.id);
});
}
function renderPlNow() {
const el = document.getElementById('plNow'); if (!el) return;
if (plBatchOn) { el.hidden = true; el.innerHTML = ''; return; }
_plLazy();
const t = plCur();
if (!t) { el.hidden = true; el.innerHTML = ''; return; }
el.hidden = false;
_plCoverBackfill(t);
const playing = !!(plAudio && !plAudio.paused && !plAudio.ended);
const withWho = _plRoot().withCid ? ' · ' + escapeHTML(_plName(_plRoot().withCid)) + ' 在陪你听' : '';
const qn = (Array.isArray(_plRoot().queue) ? _plRoot().queue : []).length;
el.innerHTML = '<div class="pl-dock" data-pl-now="1">' +
'<span class="pl-dock-prog"><b id="plNowFill"></b></span>' +
'<span class="pl-dock-av" aria-hidden="true"><span class="pl-av-ch">' + escapeHTML((t.name || '♪').slice(0, 1)) + '</span>' + (t.pic ? '<img class="pl-dock-img" src="' + escapeHTML(t.pic) + '" alt="" onload="this.dataset.ok=1" onerror="this.remove()">' : '') + '</span>' +
'<span class="pl-dock-tx"><b>' + escapeHTML(t.name) + '</b><small>' + escapeHTML(_plSrcLabel(t)) + ' · <span id="plNowCur">0:00</span>' +
(t.dur ? ' / <span id="plNowLeft">' + _plDur(t.dur) + '</span>' : '') + withWho + '</small></span>' +
'<span class="pl-now-tag" id="plNowTag">' + (playing ? '播放中' : '已暂停') + '</span>' +
'<button type="button" class="pl-dock-btn pl-dock-q" id="plNowQueue" aria-label="播放队列"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg><i id="plNowQueueN"' + (qn ? '' : ' hidden') + '>' + (qn || '') + '</i></button>' +
'<button type="button" class="pl-dock-btn" id="plNowPrev" aria-label="上一首"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>' +
'<button type="button" class="pl-dock-play" id="plNowPlay" data-on="0" aria-label="播放或暂停"><svg class="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><svg class="i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>' +
'<button type="button" class="pl-dock-btn" id="plNowNext" aria-label="下一首"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>' +
'</div>';
}
function plFloatShow() {
const pv = document.getElementById('playerView');
if (pv && pv.classList.contains('active') && !_plFloatLrcOn()) return;
if (!plCur() && !plCur_) return;
plFloatOn = true;
renderPlFloat();
}
function plFloatHide() {
plFloatOn = false;
if (_plFloatLrcOn()) { _plFloatLrcSet(false); try { _plLrcPaint(); } catch (e) {} }
renderPlFloat();
}
var _plFloatBtnAt = 0;
var PL_FLOAT_LRC_KEY = 'ordinal-plfloat-lrc';
function _plFloatLrcOn() { try { return localStorage.getItem(PL_FLOAT_LRC_KEY) !== '0'; } catch (e) { return true; } }
function _plFloatLrcSet(v) { try { localStorage.setItem(PL_FLOAT_LRC_KEY, v ? '1' : '0'); } catch (e) {} }
function _plFloatLrcIdxNow() {
if (!Array.isArray(plLrcLines) || !plLrcLines.length) return -1;
const cur = plAudio && Number.isFinite(plAudio.currentTime) ? plAudio.currentTime : 0;
let i = -1;
for (let k = 0; k < plLrcLines.length; k++) { if (plLrcLines[k].t <= cur + 0.25) i = k; else break; }
return i;
}
function _plFloatLrcLineNow() {
const i = _plFloatLrcIdxNow();
return (i >= 0 && plLrcLines[i] && plLrcLines[i].txt) ? plLrcLines[i].txt : '';
}
function _plFloatLrcNextNow() {
if (!Array.isArray(plLrcLines) || !plLrcLines.length) return '';
const i = _plFloatLrcIdxNow();
for (let k = i + 1; k < plLrcLines.length; k++) {
if (plLrcLines[k] && plLrcLines[k].txt) return plLrcLines[k].txt;
}
return '';
}
function _plFloatLrcRowsNow(t) {
const cur = _plFloatLrcLineNow();
if (cur) return { big: cur, small: _plFloatLrcNextNow() || (t ? t.name : '') };
const who = _plRoot().withCid ? ' · ' + _plName(_plRoot().withCid) + ' 在陪你听' : '';
return { big: t ? t.name : '', small: plLrcSay ? _plFloatLrcSayShort() : ((t ? _plSrcLabel(t) : '') + who) };
}
function _plFloatLrcSayShort() {
const s = String(plLrcSay || '');
if (!s) return '';
if (s.indexOf('正在取') >= 0) return '正在取歌词…';
if (s.indexOf('没连上') >= 0) return '歌词没取到 · 进整屏歌词面可重试';
if (s.indexOf('没有词') >= 0) return '这一首没有词（多半是纯音乐）';
if (s.indexOf('还没配') >= 0) return '这一首还没配歌词';
if (s.indexOf('时间轴') >= 0) return '这份歌词文件没有时间轴';
return s.length > 18 ? s.slice(0, 17) + '…' : s;
}
function _plFloatReserve() {
const list = document.getElementById('messageList'); if (!list) return;
let pad = 0;
try {
const el = document.getElementById('plFloat');
if (el && !el.hidden && plFloatOn && _plFloatListShown(list)) {
const fr = el.getBoundingClientRect(), lr = list.getBoundingClientRect();
if (fr.height > 0 && lr.height > 0 && fr.top < lr.bottom && fr.bottom > lr.bottom - fr.height - 12) {
const last = list.lastElementChild;
const cur = parseFloat(list.style.getPropertyValue('--plfloat-pad')) || 0;
if (last) {
const sMax = list.scrollHeight - list.clientHeight;
const G = last.getBoundingClientRect().bottom + list.scrollTop - sMax;
pad = Math.max(0, Math.round(G + cur - fr.top + 8));
} else pad = Math.round(lr.bottom - fr.top) + 8;
}
}
} catch (e) { pad = 0; }
try {
const want = pad > 0 ? pad + 'px' : '';
if (list.style.getPropertyValue('--plfloat-pad') === want) return;
if (want) list.style.setProperty('--plfloat-pad', want);
else list.style.removeProperty('--plfloat-pad');
} catch (e) { return; }
}
function _plFloatListShown(list) { const cs = getComputedStyle(list); return cs.display !== 'none' && cs.visibility !== 'hidden'; }
var plFloatWasOn = false;
function renderPlFloat() {
const el = document.getElementById('plFloat'); if (!el) return;
const t = plCur() || plCur_;
const pv = document.getElementById('playerView');
if ((!plFloatOn && !_plFloatLrcOn()) || !t || !floatBoxShownHere() || (pv && pv.classList.contains('active') && !_plFloatLrcOn())) { el.hidden = true; plFloatWasOn = false; _plFloatMenuClose(); _plFloatReserve(); return; }
el.hidden = false;
if (!plFloatWasOn) {
plFloatWasOn = true;
el.classList.remove('pl-float-in');
void el.offsetWidth;
el.classList.add('pl-float-in');
}
el.classList.toggle('pl-float-wide', _plFloatLrcOn());
el.classList.toggle('pl-float-lrc', _plFloatLrcOn());
_plFloatPosApply(el);
_plLazy();
const playing = !!(plAudio && !plAudio.paused && !plAudio.ended);
const withWho = _plRoot().withCid ? ' · ' + escapeHTML(_plName(_plRoot().withCid)) + ' 在陪你听' : '';
let fBig = escapeHTML(t.name), fSmall = escapeHTML(_plSrcLabel(t)) + withWho;
if (_plFloatLrcOn()) {
const rows = _plFloatLrcRowsNow(t);
fBig = escapeHTML(rows.big); fSmall = escapeHTML(rows.small);
}
const favOn = !!(Array.isArray(_plRoot().favs) && _plRoot().favs.indexOf(t.id) >= 0);
const HEART = 'M12 20.1c-.3 0-.6-.1-.8-.3C8.6 17.6 3 13.6 3 9.1 3 6.3 5.2 4.2 8 4.2c1.6 0 3.1.7 4 1.9 1-1.2 2.4-1.9 4-1.9 2.8 0 5 2.1 5 4.9 0 4.5-5.6 8.5-8.2 10.6-.2.2-.5.4-.8.4z';
el.innerHTML = '<span class="pl-float-av" aria-hidden="true"><span class="pl-av-ch">' + escapeHTML((t.name || '♪').slice(0, 1)) + '</span>' + (t.pic ? '<img class="pl-float-img" src="' + escapeHTML(t.pic) + '" alt="" onload="this.dataset.ok=1" onerror="this.remove()">' : '') + '</span>' +
'<span class="pl-float-tx"><b>' + fBig + '</b><small>' + fSmall + '</small></span>' +
'<button type="button" class="pl-float-btn" id="plFloatPrev" aria-label="上一首"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 6h2v12H7zM18 18V6l-8.5 6z"/></svg></button>' +
'<button type="button" class="pl-float-btn" id="plFloatPlay" data-on="' + (playing ? '1' : '0') + '" aria-label="播放或暂停"><svg class="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><svg class="i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>' +
'<button type="button" class="pl-float-btn" id="plFloatNext" aria-label="下一首"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 6h2v12h-2zM6 6v12l8.5-6z"/></svg></button>' +
'<button type="button" class="pl-float-btn" id="plFloatFav" data-on="' + (favOn ? '1' : '0') + '" aria-label="收藏" aria-pressed="' + (favOn ? 'true' : 'false') + '"><svg class="i-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="' + HEART + '"/></svg><svg class="i-heart-on" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + HEART + '"/></svg></button>';
_plFloatReserve();
_plFloatMenuPlace();
}
var PL_FLOAT_HOLD_MS = 500;
var _plFloatHoldTimer = 0, _plFloatHoldFired = false;
function _plFloatHoldCancel() { if (_plFloatHoldTimer) { clearTimeout(_plFloatHoldTimer); _plFloatHoldTimer = 0; } }
function _plFloatMenuPaint() {
const el = document.getElementById('plFloatMenu'); if (!el) return;
const on = _plFloatLrcOn();
const has = !!(plLrcLines && plLrcLines.length);
el.innerHTML = '<button type="button" class="pl-fm-b' + (on ? ' on' : '') + '" data-pl-fm="lrc" aria-pressed="' + (on ? 'true' : 'false') + '">显示歌词</button>' +
'<button type="button" class="pl-fm-b' + (!on ? ' on' : '') + '" data-pl-fm="name" aria-pressed="' + (!on ? 'true' : 'false') + '">显示歌名</button>' +
(function(){ const c = plCur(); if (!c) return '';
const f = Array.isArray(_plRoot().favs) && _plRoot().favs.indexOf(c.id) >= 0;
return '<button type="button" class="pl-fm-b' + (f ? ' on' : '') + '" data-pl-fm="fav" aria-pressed="' + (f ? 'true' : 'false') + '">' + (f ? '取消收藏' : '收藏') + '</button>'; })() +
(on && !has ? '<span class="pl-fm-say">' + escapeHTML(plLrcSay || '这一首还没取到词') + '</span>' : '');
}
function _plFloatMenuOpen() {
const el = document.getElementById('plFloatMenu'); if (!el) return;
_plFloatMenuPaint();
el.hidden = false;
_plFloatMenuPlace();
}
function _plFloatMenuClose() { const el = document.getElementById('plFloatMenu'); if (el) el.hidden = true; }
function _plFloatMenuToggle() {
const el = document.getElementById('plFloatMenu'); if (!el) return;
if (el.hidden) _plFloatMenuOpen(); else _plFloatMenuClose();
}
function _plFloatMenuPlace() {
const el = document.getElementById('plFloatMenu'); if (!el || el.hidden) return;
const f = document.getElementById('plFloat');
if (!f || f.hidden) { _plFloatMenuClose(); return; }
try {
const r = f.getBoundingClientRect();
const op = el.offsetParent ? el.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
const mw = el.offsetWidth, mh = el.offsetHeight;
let top = r.top - mh - 8;
if (top < 8) top = Math.min(window.innerHeight - mh - 8, r.bottom + 8);
const left = Math.max(8, Math.min(r.left, window.innerWidth - mw - 8));
el.style.left = Math.round(left - op.left) + 'px';
el.style.top = Math.round(top - op.top) + 'px';
} catch (e) {}
}
function _plFloatLrcModeSet(on) {
_plFloatLrcSet(on);
if (on) { try { plLrcEnsure(); } catch (e) {} }
try { _plLrcPaint(); } catch (e) {}
renderPlFloat();
_plFloatMenuPaint();
if (on && plState.full) { try { showToast(floatBoxShownHere() ? '悬浮歌词已开 · 收回整屏就能看到小框' : '悬浮歌词已开 · 小框设为只在聊天页显示，回聊天页就能看到'); } catch (e) {} }
}
var PL_FLOAT_POS_KEY = 'ordinal-plfloat-pos';
var PL_FLOAT_W = 272;
var PL_FLOAT_W_LRC = 336;
function _plFloatW(vw, el) {
const wide = !!(el && el.classList && el.classList.contains('pl-float-wide'));
return Math.max(140, Math.min(wide ? PL_FLOAT_W_LRC : PL_FLOAT_W, (vw || window.innerWidth) - 28));
}
var _plFloatDragMoved = false, _plFloatDragging = false;
function _plFloatPosGet() {
try {
const v = JSON.parse(localStorage.getItem(PL_FLOAT_POS_KEY) || 'null');
return (v && isFinite(v.l) && isFinite(v.t) && isFinite(v.w) && v.w > 0) ? v : null;
} catch (e) { return null; }
}
function _plFloatPosSet(l, t, w) {
try { localStorage.setItem(PL_FLOAT_POS_KEY, JSON.stringify({ l: Math.round(l), t: Math.round(t), w: Math.round(w) })); } catch (e) {}
}
var _plFloatSafeTop = -1;
function _plFloatTopMin() {
try {
if (_plFloatSafeTop < 0) {
let p = 0;
document.querySelectorAll('.chat-head').forEach(el => { const v = parseFloat(getComputedStyle(el).paddingTop) || 0; if (v > p) p = v; });
_plFloatSafeTop = Math.round(p);
}
return _plFloatSafeTop + 4;
} catch (e) { return 4; }
}
function _plFloatPosApply(el) {
const p = _plFloatPosGet();
if (!el || !p) return;
if (_plFloatDragging) return;
const vw = window.innerWidth, vh = window.innerHeight;
const w = _plFloatW(vw, el);
const h = el.offsetHeight || 50;
el.style.right = 'auto'; el.style.bottom = 'auto';
el.style.width = w + 'px';
el.style.left = Math.round(p.l) + 'px'; el.style.top = Math.round(p.t) + 'px';
const r = el.getBoundingClientRect();
const dl = r.left - p.l, dt = r.top - p.t;
const l = Math.max(4 - dl, Math.min(p.l, vw - w - 4 - dl));
const t = Math.max(_plFloatTopMin() - dt, Math.min(p.t, vh - h - 4 - dt));
if (Math.abs(l - p.l) > .5) el.style.left = Math.round(l) + 'px';
if (Math.abs(t - p.t) > .5) el.style.top = Math.round(t) + 'px';
}
function _plFloatDragInit() {
const el = document.getElementById('plFloat');
if (!el || el.dataset.dragBound) return;
el.dataset.dragBound = '1';
el.addEventListener('animationend', () => { el.classList.remove('pl-float-in'); try { _plFloatPosApply(el); _plFloatReserve(); } catch (e) {} });
let on = false, sx = 0, sy = 0, ox = 0, oy = 0, tw = 0, th = 0, px = 0, py = 0, pend = false;
let dl = 0, dt = 0;
const apply = () => { pend = false; if (on) el.style.transform = 'translate(' + px + 'px,' + py + 'px)'; };
el.addEventListener('pointerdown', e => {
if (e.button != null && e.button !== 0) return;
on = true; _plFloatDragging = true; _plFloatDragMoved = false;
_plFloatHoldFired = false; _plFloatHoldCancel();
_plFloatHoldTimer = setTimeout(() => { _plFloatHoldTimer = 0; _plFloatHoldFired = true; try { _plFloatMenuToggle(); } catch (err) {} }, PL_FLOAT_HOLD_MS);
sx = e.clientX; sy = e.clientY;
const r = el.getBoundingClientRect();
ox = el.offsetLeft; oy = el.offsetTop; tw = r.width; th = r.height;
dl = r.left - ox; dt = r.top - oy;
px = 0; py = 0; pend = false;
el.classList.remove('pl-float-in');
el.style.transform = 'none';
el.style.right = 'auto'; el.style.bottom = 'auto';
el.style.left = ox + 'px'; el.style.top = oy + 'px';
try { el.setPointerCapture(e.pointerId); } catch (err) {}
});
el.addEventListener('pointermove', e => {
if (!on) return;
if (!_plFloatDragMoved && (Math.abs(e.clientX - sx) > 6 || Math.abs(e.clientY - sy) > 6)) {
_plFloatDragMoved = true;
_plFloatHoldCancel();
_plFloatMenuClose();
tw = _plFloatW(window.innerWidth, el);
el.style.width = tw + 'px';
th = el.offsetHeight;
}
px = Math.max(4 - dl - ox, Math.min(window.innerWidth - tw - 4 - dl - ox, e.clientX - sx));
py = Math.max(_plFloatTopMin() - dt - oy, Math.min(window.innerHeight - th - 4 - dt - oy, e.clientY - sy));
if (!pend) {
pend = true;
if (typeof window.moFrame === 'function') window.moFrame(apply);
else requestAnimationFrame(apply);
}
});
const up = () => {
if (!on) return;
on = false; _plFloatDragging = false;
_plFloatHoldCancel();
const l = ox + px, t = oy + py;
el.style.transform = 'none';
el.style.left = Math.round(l) + 'px'; el.style.top = Math.round(t) + 'px';
const rr = el.getBoundingClientRect();
const ww = rr.width || tw, hh = rr.height || th;
const dl2 = rr.left - l, dt2 = rr.top - t;
const l2 = Math.round(Math.max(4 - dl2, Math.min(l, window.innerWidth - ww - 4 - dl2)));
const t2 = Math.round(Math.max(_plFloatTopMin() - dt2, Math.min(t, window.innerHeight - hh - 4 - dt2)));
if (Math.abs(l2 - l) > .5) el.style.left = l2 + 'px';
if (Math.abs(t2 - t) > .5) el.style.top = t2 + 'px';
if (_plFloatDragMoved) _plFloatPosSet(l2, t2, ww);
_plFloatReserve();
};
el.addEventListener('pointerup', up);
el.addEventListener('pointercancel', up);
}
function _plAutoRelay() {
try {
const port = String(location.port || '');
if (port !== '8710' && !/^\/app(\/|$)/.test(location.pathname)) return;
const host = location.hostname; if (!host) return;
const p = _plRoot(); let changed = false;
if (!String(p.ncmApi || '').trim()) { p.ncmApi = 'http://' + host + ':8711'; changed = true; }
if (changed) save();
} catch (e) {}
}
function _plSubPaint() {
const sub = document.getElementById('plSub'); if (!sub) return;
if (plVipSay) { sub.textContent = plVipSay; return; }
const streak = _plFailStreakTx();
if (streak) { sub.textContent = streak; return; }
const p = _plRoot();
const n = plTracks().length, can = plTracks().filter(plPlayable).length, curT = plCur();
if (p.withCid) {
sub.textContent = _plName(p.withCid) + ' 在陪你听' + (curT ? ' · 正在放《' + curT.name + '》' : ' · 还没挑歌（曲库挑一首就是）');
return;
}
if (!n) { sub.textContent = '还没有曲子 · 点「添加」'; return; }
sub.textContent = (can !== n) ? (n + ' 首 · ' + can + ' 首能放') : '';
}
function renderPlayerPlayState() {
_plSubPaint();
const curId = String(_plRoot().current || '');
try {
document.querySelectorAll('#playerView .pl-row[data-pl-id]').forEach(row => {
const on = !!curId && row.dataset.plId === curId;
row.classList.toggle('now', on);
const nm = row.querySelector('.pl-nm');
if (nm) nm.classList.toggle('now', on);
});
} catch (e) {}
renderPlNow();
renderPlayerFull();
renderPlFloat();
const qm = document.getElementById('plQueueMask');
if (qm && !qm.hidden) renderPlayerQueue();
}
function renderPlayerPage() {
const body = document.getElementById('plBody'), tabs = document.getElementById('plTabs');
if (!body) return;
if (plBatchOn && plState.tab !== 'lib' && plState.tab !== 'list' && plState.tab !== 'find') { plBatchOn = false; plBatchSel.clear(); }
_plChunkAbort();
_plAutoRelay();
_plLazy();
const p = _plRoot();
plCoAutoBind();
_plTaInviteArm();
_plSubPaint();
if (tabs) tabs.innerHTML = _plTabsHTML(); renderPlNow();
_plBackfillPics();
const tab = plState.tab;
if (tab === 'find') { renderPlayerFind(); plBatchPaint(); return; }
if (tab === 'lib') {
body.innerHTML = _plLibBarHTML() + '<div id="plLibRows"></div>';
_plLibRowsPaint();
plBatchPaint();
return;
}
if (tab === 'fav') {
const owners = _plTaOwners();
if (plState.favWho !== 'mine' && owners.indexOf(plState.favWho) < 0) plState.favWho = 'mine';
const chips = owners.length ? '<div class="pl-chips">' + [['mine', '我的']].concat(owners.map(id => [id, _plName(id)]))
.map(x => '<button type="button" class="scope-chip' + (plState.favWho === x[0] ? ' on' : '') + '" data-pl-favwho="' + escapeHTML(x[0]) + '">' + escapeHTML(x[1]) + '</button>').join('') + '</div>' : '';
if (plState.favWho === 'mine') {
const rows = (Array.isArray(p.favs) ? p.favs : []).map(plById).filter(Boolean);
if (rows.length) {
const parts = rows.map((t, i) => _plRowHTML(t, i));
body.innerHTML = chips + _plSecHTML('我的收藏', '', rows.length) + '<div id="plFavRows">' + parts.slice(0, PL_ROWS_FIRST).join('') + '</div>';
_plChunkFill('plFavRows', parts);
} else { _plChunkAbort(); body.innerHTML = chips + _plEmptyHTML(owners.length ? '「我的」收藏还空着·在某一行上点 ⋯ 就能收' : '还没有收藏过一首·在某一行上点 ⋯ 就能收'); }
plBatchPaint();
return;
}
const rows = _plTaFav(plState.favWho).map(id => { const t = plById(id); return t ? Object.assign({}, t, { _cid: plState.favWho }) : null; }).filter(Boolean);
if (rows.length) {
const parts = rows.map((t, i) => _plRowHTML(t, i, { cid: t._cid }));
body.innerHTML = chips + _plSecHTML(_plName(plState.favWho) + ' 收进来的', '', rows.length) + '<div id="plFavRows">' + parts.slice(0, PL_ROWS_FIRST).join('') + '</div>';
_plChunkFill('plFavRows', parts);
} else { _plChunkAbort(); body.innerHTML = chips + _plEmptyHTML('这个歌单里还没有曲子'); }
plBatchPaint();
return;
}
if (tab === 'list') {
const owners = _plListOwners();
if (plState.listWho !== 'mine' && owners.indexOf(plState.listWho) < 0) plState.listWho = 'mine';
const whoChips = owners.length ? '<div class="pl-chips">' + [['mine', '我的']].concat(owners.map(id => [id, _plName(id)]))
.map(x => '<button type="button" class="scope-chip' + (plState.listWho === x[0] ? ' on' : '') +
'" data-pl-listowner="' + escapeHTML(x[0]) + '">' + escapeHTML(x[1]) + '</button>').join('') + '</div>' : '';
if (plState.listWho !== 'mine') {
plBatchOn = false; plBatchSel.clear();
const cid = plState.listWho, taLists = _plTaOwnLists(cid);
if (!taLists.length) { _plChunkAbort(); body.innerHTML = whoChips + _plEmptyHTML('这位 TA 还没有新建歌单'); plBatchPaint(); return; }
if (!plState.list || !taLists.some(x => x.id === plState.list)) plState.list = taLists[0].id;
const l = taLists.find(x => x.id === plState.list);
const lsort = plState.listSort || 'added';
let rows = _plTaListRows(l);
if (lsort === 'name') rows = rows.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hans-CN'));
else if (lsort === 'artist') rows = rows.slice().sort((a, b) => String(a.artist || '').localeCompare(String(b.artist || ''), 'zh-Hans-CN'));
const sortChips = rows.length ? '<div class="pl-chips pl-chips-sub">' + [['added', '本来的顺序'], ['name', '歌名'], ['artist', '歌手']]
.map(x => '<button type="button" class="scope-chip' + (lsort === x[0] ? ' on' : '') + '" data-pl-listsort="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' : '';
const parts = rows.map((t, i) => _plRowHTML(t, i, { taPlay: cid, noMenu: true }));
body.innerHTML = whoChips + '<div class="pl-chips">' + taLists.map(x => '<button type="button" class="scope-chip' + (x.id === l.id ? ' on' : '') +
'" data-pl-list="' + escapeHTML(x.id) + '">' + escapeHTML(x.name) + '</button>').join('') + '</div>' + sortChips +
_plSecHTML(l.name, '来自 ' + _plName(cid), rows.length, rows.length
? '<span class="pl-sec-acts"><button type="button" class="pl-link pl-playall" data-pl-taplayall="' + escapeHTML(cid) +
'" data-pl-list="' + escapeHTML(l.id) + '">播放全部</button></span>' : '') +
(rows.length
? '<div id="plTaListRows">' + parts.slice(0, PL_ROWS_FIRST).join('') + '</div>'
: _plEmptyHTML('这个歌单还空着'));
_plChunkFill('plTaListRows', parts);
plBatchPaint();
return;
}
const lists = Array.isArray(p.playlists) ? p.playlists : [];
if (!lists.length) {
if (plBatchOn) { plBatchOn = false; plBatchSel.clear(); }
body.innerHTML = whoChips + _plEmptyHTML('还没有歌单', { attr: 'data-pl-newlist="1"', t: '新建歌单' }); plBatchPaint(); return;
}
if (!plState.list || !lists.some(l => l.id === plState.list)) plState.list = lists[0].id;
const l = lists.find(x => x.id === plState.list);
const ids = Array.isArray(l.trackIds) ? l.trackIds : [];
const lsort = plState.listSort || 'added';
let rows = ids.map(plById).filter(Boolean);
if (lsort === 'name') rows = rows.slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hans-CN'));
else if (lsort === 'artist') rows = rows.slice().sort((a, b) => String(a.artist || '').localeCompare(String(b.artist || ''), 'zh-Hans-CN'));
const sortChips = rows.length ? '<div class="pl-chips pl-chips-sub">' + [['added', '本来的顺序'], ['name', '歌名'], ['artist', '歌手']]
.map(x => '<button type="button" class="scope-chip' + (lsort === x[0] ? ' on' : '') + '" data-pl-listsort="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' : '';
body.innerHTML = whoChips + '<div class="pl-chips">' + lists.map(x => '<button type="button" class="scope-chip' + (x.id === l.id ? ' on' : '') +
'" data-pl-list="' + escapeHTML(x.id) + '">' + escapeHTML(x.name) + '</button>').join('') +
'<button type="button" class="scope-chip pl-more-chip" data-pl-lists="1" aria-label="歌单管理：新建·改名·删掉" title="歌单管理：新建·改名·删掉">⋯</button></div>' + sortChips +
(rows.length
? (function () {
const parts = rows.map((t, i) => _plRowHTML(t, i));
const html = _plSecHTML(l.name, '', rows.length, '<span class="pl-sec-acts">' + (plBatchOn ? ''
: '<button type="button" class="pl-link pl-batch-open" data-pl-batch="enter">批量管理</button>') +
'<button type="button" class="pl-link pl-playall" data-pl-playall="' + escapeHTML(l.id) + '">播放全部</button></span>') +
'<div id="plListRows">' + parts.slice(0, PL_ROWS_FIRST).join('') + '</div>';
_plChunkFill('plListRows', parts);
return html;
})()
: (_plChunkAbort(), _plEmptyHTML('这个歌单还空着·在某一首上点 ⋯ 就能收进来', { attr: 'data-pl-golib="1"', t: '去曲库挑几首' })));
plBatchPaint();
return;
}
body.innerHTML = _plRecHTML();
plBatchPaint();
}
function _plListenHTML() {
const L = plListenStat();
const max = Math.max.apply(null, L.week.map(x => x.co).concat([0]));
const bars = L.week.map(x => '<div class="stats-hour' + (max && x.co === max ? ' hi' : '') +
'" title="' + escapeHTML(x.label + ' · ' + plDurText(x.co)) + '"><i style="height:' +
(max ? Math.max(1, Math.round(x.co / max * 100)) : 1) + '%"></i></div>').join('');
const xs = L.week.map(x => '<span>' + escapeHTML(x.label) + '</span>').join('');
return '<div class="pl-sec"><span class="pl-sec-t">一起听的时长</span><span class="pl-sec-s">只记音频真在走的那一段</span></div>' +
'<div class="stats-grid pl-listen-grid">' +
'<div class="stats-tile"><b id="plLsTodayCo">' + escapeHTML(plDurText(L.todayCo)) + '</b><span>今日一起听</span></div>' +
'<div class="stats-tile"><b id="plLsTotalCo">' + escapeHTML(plDurText(L.totalCo)) + '</b><span>累计一起听</span></div>' +
'<div class="stats-tile"><b id="plLsTotalAll">' + escapeHTML(plDurText(L.totalAll)) + '</b><span>累计总听歌</span></div>' +
'</div>' +
'<div class="stats-hour-label pl-listen-lab">近 7 天一起听</div>' +
'<div class="stats-hours sm pl-listen-bars">' + bars + '</div>' +
'<div class="stats-hours-x pl-listen-x">' + xs + '</div>' +
'<p class="stats-note pl-listen-note">今日只算本机这一天；打开「一个人听」时那一段不记进一起听，但仍记进总听歌。拖动进度条／跳段不计时。</p>';
}
function _plLsPaint() {
if (typeof plListenStat !== 'function') return;
const L = plListenStat();
const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
set('plLsTodayCo', plDurText(L.todayCo));
set('plLsTotalCo', plDurText(L.totalCo));
set('plLsTotalAll', plDurText(L.totalAll));
}
function _plRecHTML() {
const listen = _plListenHTML();
const all = (Array.isArray(_plRoot().invites) ? _plRoot().invites : []).slice(-PL_KEEP_INV).slice().reverse();
if (!all.length) return listen + _plEmptyHTML('还没有 TA 邀你听过歌');
const whos = [];
all.forEach(v => { if (v && v.cid && whos.indexOf(v.cid) < 0) whos.push(v.cid); });
if (plState.recWho && whos.indexOf(plState.recWho) < 0) plState.recWho = '';
const inv = plState.recWho ? all.filter(v => v && v.cid === plState.recWho) : all;
const doneN = all.filter(v => v && v.status !== 'waiting').length;
const chips = '<div class="pl-chips">' +
[['', '全部']].concat(whos.map(id => [id, _plName(id)]))
.map(x => '<button type="button" class="scope-chip' + (String(plState.recWho || '') === x[0] ? ' on' : '') +
'" data-pl-recwho="' + escapeHTML(x[0]) + '">' + escapeHTML(x[1]) + '</button>').join('') +
(doneN ? '<button type="button" class="scope-chip" data-pl-act="recclear">清掉已答完的 ' + doneN + ' 条</button>' : '') +
'</div>';
return listen + _plSecHTML('TA 邀你听过', '最近 ' + inv.length + ' 条') + chips + inv.map(v => {
const t = plById(v.trackId);
const st = { waiting: '等你回话', yes: '一起听了', switch: '切过去听了', later: '先放一放', no: '没答应' }[v.status] || '—';
return '<div class="pl-rec' + (v.status === 'waiting' ? ' wait' : '') + '" data-pl-inv="' + escapeHTML(v.id) + '">' +
'<span class="pl-who">' + escapeHTML(_plName(v.cid)) + '</span>' +
'<span class="pl-nm">' + escapeHTML(v.trackId ? (t ? t.name : '这首已经不在了') : '不限歌 · 一起听') + '</span>' +
'<span class="pl-stt">' + st + '</span><span class="pl-when">' + _plWhen(v.at) + '</span>' +
(v.mood ? '<span class="pl-mood">' + escapeHTML(v.mood) + '</span>' : '') + '</div>';
}).join('');
}
function _plWhen(ts) {
const n = Number(ts); if (!Number.isFinite(n) || !n) return '';
const d = new Date(n);
return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
}
function _plMoodNow() {
const p = _plRoot(), t = plCur();
if (!t || !p.withCid) return '';
const list = Array.isArray(p.invites) ? p.invites : [];
for (let i = list.length - 1; i >= 0; i--) {
const v = list[i];
if (v && v.cid === p.withCid && v.trackId === t.id && v.mood &&
(v.status === 'yes' || v.status === 'switch')) return v.mood;
}
return '';
}
function renderPlayerFull() {
const v = document.getElementById('playerFull'); if (!v) return;
v.hidden = !plState.full;
if (!plState.full) return;
_plLazy();
const t = plCur(), p = _plRoot();
if (t) _plCoverBackfill(t);
const nm = document.getElementById('plfName'), ar = document.getElementById('plfArtist');
if (nm) nm.textContent = t ? t.name : '还没挑一首';
if (ar) ar.innerHTML = t ? ((t.artist ? _plArLinksHTML(t.artist, t.arId) + ' · ' : '') + escapeHTML(_plSrcLabel(t))) : '在下面挑一首，或点「添加」';
{ const mo = document.getElementById('plfMood');
if (mo) { const mt = _plMoodNow(); mo.hidden = !mt; if (mt) mo.textContent = mt; } }
{ const fb = document.getElementById('plfFloatBtn');
if (fb) { const _on = (plFloatOn || _plFloatLrcOn()) ? '1' : '0'; fb.dataset.on = _on; fb.setAttribute('aria-pressed', _on === '1' ? 'true' : 'false'); } }
const md = document.getElementById('plfMode'); if (md) md.innerHTML = _plModeSvg(p.mode) + '<span>' + escapeHTML(PL_MODE_NAME[p.mode] || '顺序') + '</span>';
const fq = document.getElementById('plfFav');
if (fq) {
const on = !!(t && Array.isArray(p.favs) && p.favs.indexOf(t.id) >= 0);
fq.dataset.on = on ? '1' : '0';
fq.setAttribute('aria-pressed', on ? 'true' : 'false');
fq.setAttribute('aria-disabled', t ? 'false' : 'true');
}
{ const mo = document.getElementById('plfMore'); if (mo) mo.setAttribute('aria-disabled', t ? 'false' : 'true'); }
const qn = document.getElementById('plfQueue');
if (qn) { const n = (Array.isArray(p.queue) ? p.queue : []).length; qn.textContent = n ? String(n) : ''; qn.hidden = !n; }
const who = document.getElementById('plfWith');
if (who) {
const w = (plCur() && p.withCid) ? p.withCid : '';
const meAv = (typeof chatMyAvatar === 'function' ? chatMyAvatar(w) : '') || (data.me && data.me.avatar) || '';
const meNm = (typeof chatMyName === 'function' ? chatMyName(w) : '') || '我';
const playing = !!(plAudio && !plAudio.paused && !plAudio.ended);
const eq = '<span class="pl-f-eq' + (playing ? '' : ' paused') + '" id="plfEq" aria-hidden="true"><i></i><i></i><i></i></span>';
if (w) {
const c = (data.contacts || []).find(x => x && x.id === w) || null;
const taAv = (typeof chatAvatarOf === 'function' ? chatAvatarOf(c) : (c && c.avatar)) || '';
who.innerHTML = '<button type="button" class="pl-f-who-row" data-pl-endco="1">' +
_plAvStackHTML(meAv, meNm, taAv, _plName(w), '') +
'<b>' + escapeHTML(_plName(w)) + '</b><span class="pl-f-who-do">在陪你听</span>' + eq +
'<span class="pl-f-who-go">›</span></button>';
} else {
who.innerHTML = '<button type="button" class="pl-f-who-row inv" data-pl-invitenow="' + escapeHTML(t ? t.id : '') + '">' +
_plAvStackHTML(meAv, meNm, '', '', '＋') +
'<span class="pl-f-who-do">挑一位陪你听</span><span class="pl-f-who-go">›</span></button>';
}
}
const nx = document.getElementById('plfNext');
if (nx) {
const q = Array.isArray(p.queue) ? p.queue : [];
const nt = q.length ? plById(q[0]) : null;
nx.hidden = !nt;
nx.innerHTML = nt ? ('<span class="pl-f-next-lab">接下来</span>' +
'<span class="pl-f-next-song">' + escapeHTML(nt.name) + '</span>' +
(q.length > 1 ? '<span class="pl-f-next-rest">还有 ' + (q.length - 1) + ' 首</span>' : '') +
'<span class="pl-f-who-go">›</span>') : '';
}
{ const sb = document.getElementById('plfSleepBtn'), st = document.getElementById('plfSleepTx');
if (st) st.textContent = _plSleepGet() ? _plSleepLeftText() : (p.sleepEnd ? '播完这首' : (p.sleepEndQ ? '播完队列' : '定时'));
if (sb) sb.dataset.on = (_plSleepGet() || p.sleepEnd || p.sleepEndQ) ? '1' : '0'; }
{ const inp = document.getElementById('plVol'); if (inp) inp.value = String(Math.round(_plVolGet() * 100));
const vb = document.getElementById('plVolBtn'); if (vb) vb.dataset.on = _plVolGet() > 0 ? '1' : '0';
const vr = document.getElementById('plfVolRow'); if (vr) vr.hidden = !plState.vol;
const vo = document.getElementById('plfVolOpen');
if (vo) { vo.dataset.on = _plVolGet() > 0 ? '1' : '0'; vo.setAttribute('aria-expanded', plState.vol ? 'true' : 'false'); }
if (plVolBroken && !plVolWarned) { plVolWarned = true; try { showToast('这台设备不让网页调音量·请用侧键或系统音量条'); } catch (e) {} } }
const cover = document.querySelector('#playerFull .pl-cover');
const lrcBox = document.getElementById('plfLrc'), lrcBtn = document.getElementById('plfLrcBtn');
if (lrcBtn) lrcBtn.dataset.on = plState.lrc ? '1' : '0';
if (cover) cover.hidden = !!plState.lrc;
if (lrcBox) lrcBox.hidden = !plState.lrc;
if (plState.lrc || _plFloatLrcOn()) plLrcEnsure();
const cvb = document.querySelector('#playerFull .pl-cover-box');
if (cvb) { const want = (t && t.pic) ? String(t.pic) : ''; if (cvb.dataset.pic !== want) { cvb.dataset.pic = want;
cvb.innerHTML = want ? _plNetImg(want, true) : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
const im = cvb.querySelector('img');
if (im) im.addEventListener('error', () => {
if (cvb.dataset.pic !== want) return;
cvb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
}, { once: true }); } }
v.classList.toggle('lrc-on', !!plState.lrc);
_plPaint();
}
function _plPaint() {
const a = plAudio, t = plCur();
const cur = a && Number.isFinite(a.currentTime) ? a.currentTime : 0;
if (a && !a.paused && !a.ended) _plStallMark(cur);
const dur = (a && Number.isFinite(a.duration) && a.duration > 0) ? a.duration : (t && t.dur ? t.dur : 0);
const pct = dur ? Math.max(0, Math.min(100, cur / dur * 100)) : 0;
const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
set('plTimeFull', _plDur(cur) || '0:00');
set('plNowCur', _plDur(cur) || '0:00');
set('plLeft', dur ? '-' + _plDur(Math.max(0, dur - cur)) : '');
set('plNowLeft', dur ? _plDur(dur) : '');
['plFillFull', 'plNowFill'].forEach(id => { const el = document.getElementById(id); if (el) el.style.width = pct + '%'; });
['plKnobFull'].forEach(id => { const el = document.getElementById(id); if (el) el.style.setProperty('--pl-p', (pct / 100).toFixed(4)); });
const playing = !!(a && !a.paused && !a.ended);
if (t && playing && cur > 1 && !(dur && cur >= dur - PL_POS_TAIL_SEC)) plPos[t.id] = cur;
if (t && playing && cur > 5 && Date.now() - plPosSavedAt > 8000) { plPosSavedAt = Date.now(); _plPosSave(); }
{ const eq = document.getElementById('plfEq'); if (eq) eq.classList.toggle('paused', !playing); }
['plPlayFull', 'plNowPlay'].forEach(id => { const el = document.getElementById(id); if (el) el.dataset.on = playing ? '1' : '0'; });
const tg = document.getElementById('plNowTag'); if (tg) { tg.textContent = playing ? '播放中' : '已暂停'; tg.classList.toggle('on', playing); }
const fb = document.getElementById('plFloatPlay'); if (fb) fb.dataset.on = playing ? '1' : '0';
{ const fp = document.getElementById('plFloat'); if (fp) fp.style.setProperty('--pl-p', (pct / 100).toFixed(4)); }
_plSleepTick();
_plPrefetchTick();
_plListenTick(t, playing, cur);
_plLsPaint();
{ const sb = document.getElementById('plfSleepBtn'), st = document.getElementById('plfSleepTx');
if (st) { const want = _plSleepGet() ? _plSleepLeftText() : (_plRoot().sleepEnd ? '播完这首' : (_plRoot().sleepEndQ ? '播完队列' : '定时'));
if (st.textContent !== want) st.textContent = want; }
if (sb) sb.dataset.on = (_plSleepGet() || _plRoot().sleepEnd || _plRoot().sleepEndQ) ? '1' : '0'; }
_plLrcFollow();
}
var plLrcKey = '', plLrcLines = null, plLrcSay = '', plLrcIdx = -1;
var plLrcHold = 0;
var PL_LRC_SZ_KEY = 'ordinal-pl-lrcsz';
var PL_LRC_SIZES = [14, 16, 19];
function _plLrcSz() {
let v = 0; try { v = Number(localStorage.getItem(PL_LRC_SZ_KEY)); } catch (e) {}
return PL_LRC_SIZES.indexOf(v) >= 0 ? v : 14;
}
function _plLrcParse(txt) {
const out = [];
String(txt || '').split(/\r?\n/).forEach(line => {
const stamps = line.match(/\[\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?\]/g);
if (!stamps) return;
const body = line.replace(/\[[^\]]*\]/g, '').trim();
stamps.forEach(m => {
const q = m.match(/\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/);
if (!q) return;
const t = Number(q[1]) * 60 + Number(q[2]) + (q[3] ? Number((q[3] + '00').slice(0, 3)) / 1000 : 0);
out.push({ t, txt: body });
});
});
out.sort((a, b) => a.t - b.t);
return out;
}
var plMetingStat = { asked: 0, spoke: 0 };
var PL_LRC_METING = ['https://api.moeyao.cn/meting/'];
function _plMetingBases() {
const list = [];
const push = b => {
let s = String(b || '').trim().replace(/\/+$/, ''); if (!s) return;
s += '/';
if (list.indexOf(s) < 0) list.push(s);
};
push(_plNcmApi()); push(PL_NCM_API); PL_NCM_METING.forEach(push); PL_LRC_METING.forEach(push);
return list;
}
function _plMetingTextAny(path, ms, ok) {
const urls = _plMetingBases().map(base => base + path);
plMetingStat = { asked: urls.length, spoke: 0 };
return new Promise(resolve => {
let done = false, round = 0;
const run = tmo => {
let left = urls.length;
if (!left) { resolve(''); return; }
const give = txt => {
if (txt && txt.trim()) plMetingStat.spoke++;
if (done) return;
if (txt && txt.trim() && (!ok || ok(txt))) { done = true; resolve(txt); return; }
if (--left > 0) return;
if (++round < 2) setTimeout(() => run(Math.min(8000, tmo)), 800);
else resolve('');
};
urls.forEach(u => { try { _plFetchTextFresh(u, tmo || 8000).then(give); } catch (e) { give(''); } });
};
run(ms || 8000);
});
}
var plLrcTextMemo = new Map();
function _plLyricTextAny(nid, ms, ok) {
const id = String(nid || '');
if (!id) return Promise.resolve('');
const memo = plLrcTextMemo.get(id);
if (memo) { plLrcTextMemo.delete(id); plLrcTextMemo.set(id, memo); return Promise.resolve(memo); }
const q = encodeURIComponent(id);
const pickLyric = raw => {
let j = null; try { j = JSON.parse(String(raw || '')); } catch (e) { return ''; }
if (!j) return '';
if (j.lyric || j.lrc && typeof j.lrc === 'string') return String(j.lyric || j.lrc);
if (j.lrc && j.lrc.lyric) return String(j.lrc.lyric);
return '';
};
const mine = _plNcmApi();
return new Promise(resolve => {
let left = 3, settled = false;
const win = txt => {
if (settled) return;
settled = true;
plLrcTextMemo.set(id, txt);
while (plLrcTextMemo.size > 6) plLrcTextMemo.delete(plLrcTextMemo.keys().next().value);
resolve(txt);
};
const give = txt => {
if (settled) return;
if (txt && txt.trim() && (!ok || ok(txt))) { win(txt); return; }
if (--left === 0) { settled = true; resolve(''); }
};
_plMetingTextAny('?server=netease&type=lrc&id=' + q, ms, ok).then(give);
_plFetchTextFresh(PL_LYRIC_API + q, ms || 12000).then(raw => give(pickLyric(raw))).catch(() => give(''));
if (mine) _plFetchTextFresh(mine + '/lyric?id=' + q, ms || 12000).then(raw => give(pickLyric(raw))).catch(() => give(''));
else give('');
});
}
var plLrcFailKey = '', plLrcFailAt = 0;
var PL_LRC_RETRY_MS = 90000;
var plLrcBusyKey = '', plLrcTryN = 0, plLrcRetryTimer = 0;
function plLrcEnsure(force) {
const t = plCur();
if (force) { plLrcFailKey = ''; plLrcFailAt = 0; plLrcTryN = 0; if (plLrcRetryTimer) { clearTimeout(plLrcRetryTimer); plLrcRetryTimer = 0; } }
if (t && t.lrc) {
const lk = 'file:' + t.id;
if (plLrcKey === lk && plLrcLines && plLrcLines.length) return;
plLrcKey = lk; plLrcLines = _plLrcParse(t.lrc); plLrcSay = plLrcLines.length ? '' : '这份歌词文件里没有时间轴';
plLrcIdx = -1; _plLrcPaint(); return;
}
const key = t && t.src === 'ncm' ? String(t.nid || '') : '';
if (key !== plLrcKey) {
plLrcTryN = 0;
if (plLrcRetryTimer) { clearTimeout(plLrcRetryTimer); plLrcRetryTimer = 0; }
}
if (key === plLrcKey && plLrcLines) {
if (plLrcLines.length) return;
if (!force && plLrcFailKey === key && Date.now() - plLrcFailAt < PL_LRC_RETRY_MS) return;
}
if (!key) {
plLrcKey = ''; plLrcLines = []; plLrcIdx = -1;
plLrcSay = t ? '这一首还没配歌词' : '';
_plLrcPaint(); return;
}
if (plLrcBusyKey === key) { _plLrcPaint(); return; }
plLrcBusyKey = key;
plLrcKey = key; plLrcLines = null; plLrcSay = '正在取歌词…'; plLrcIdx = -1; _plLrcPaint();
const done = raw => {
if (plLrcBusyKey === key) plLrcBusyKey = '';
if (plLrcKey !== key) return;
plLrcLines = _plLrcParse(raw);
if (plLrcLines.length) { plLrcSay = ''; plLrcFailKey = ''; plLrcTryN = 0; }
else {
const auto = plState.lrc && plLrcTryN < 2;
plLrcSay = plMetingStat.spoke
? '没取到歌词：这首歌没有词（多半是纯音乐）'
: '没取到歌词：几个歌词地址都没连上（网络或运营商挡了这类站点）' + (auto ? '· 正在自动再试' : '· 点「重新取一次」再试');
plLrcFailKey = key; plLrcFailAt = Date.now();
if (auto) {
plLrcTryN++;
clearTimeout(plLrcRetryTimer);
plLrcRetryTimer = setTimeout(() => {
plLrcRetryTimer = 0;
if (plState.lrc && plLrcKey === key && !(plLrcLines && plLrcLines.length)) { plLrcFailKey = ''; plLrcFailAt = 0; plLrcEnsure(); }
}, 4000 * plLrcTryN);
}
}
_plLrcPaint();
renderPlFloat();
if (plLrcLines.length) _plLrcTrFetch(key);
};
_plLyricTextAny(key, 12000, txt => _plLrcParse(txt).length > 0).then(done);
}
var plLrcTrDone = {};
function _plLrcTrFetch(key) {
const mine = _plNcmApi(); if (!mine || plLrcTrDone[key]) return;
plLrcTrDone[key] = 1;
_plFetchTextFresh(mine + '/lyric?id=' + encodeURIComponent(key) + '&timestamp=' + Date.now(), 12000).then(raw => {
let j = null; try { j = JSON.parse(String(raw || '')); } catch (e) { return; }
if (!j) return;
const tr = (j.trans && j.trans.lyric) || (j.tlyric && j.tlyric.lyric) || '';
if (!String(tr).trim()) return;
const map = [];
String(tr).split(/\r?\n/).forEach(line => {
const st = line.match(/\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/); if (!st) return;
const t = Number(st[1]) * 60 + Number(st[2]) + (st[3] ? Number((st[3] + '00').slice(0, 3)) / 1000 : 0);
const body = line.replace(/\[[^\]]*\]/g, '').trim();
if (body) map.push({ t: t, txt: body });
});
if (!map.length) return;
let hit = 0;
(plLrcLines || []).forEach(l => {
if (l.tr) return;
let best = '', bd = 1.5;
map.forEach(m => { const d = Math.abs(m.t - l.t); if (d <= bd) { bd = d; best = m.txt; } });
if (best) { l.tr = best; hit++; }
});
if (hit && plLrcKey === key) _plLrcPaint();
}).catch(() => {});
}
function _plLrcPaint() {
const box = document.getElementById('plfLrc'); if (!box) return;
const canRetry = !!plLrcSay && !(plLrcLines && plLrcLines.length) && !!plLrcFailKey && plLrcFailKey === plLrcKey;
const lt = plCur();
const canOwn = !!lt && (!(lt.src === 'ncm' && lt.nid) || !!lt.lrc);
const sz = _plLrcSz();
box.style.setProperty('--lrc-fs', sz + 'px');
const hasLrc = !!(plLrcLines && plLrcLines.length);
const sizes = '<div class="pl-lrc-sizes">' +
'<span class="pl-lrc-sizes-l">' + ((lt && lt.lrc) ? '<button type="button" class="pl-link pl-lrc-edit" data-pl-act="lrcedit">编辑歌词</button>' : '') +
'<button type="button" class="pl-lrc-sz' + (_plFloatLrcOn() ? ' on' : '') + '" data-pl-act="lrcfloat" aria-label="悬浮歌词开关" aria-pressed="' + (_plFloatLrcOn() ? 'true' : 'false') + '">悬浮歌词</button>' + '</span>' +
(hasLrc ? '<span class="pl-lrc-sizes-r">' + PL_LRC_SIZES.map(s =>
'<button type="button" class="pl-lrc-sz' + (s === sz ? ' on' : '') + '" data-pl-lrcsz="' + s + '"' +
' aria-label="歌词字号' + (s === 14 ? '小' : s === 16 ? '中' : '大') + '">' + (s === 14 ? '小' : s === 16 ? '中' : '大') + '</button>').join('') + '</span>' : '') + '</div>';
box.innerHTML = sizes +
(plLrcSay ? '<div class="pl-lrc-say">' + escapeHTML(plLrcSay) +
(canRetry ? '<button type="button" class="pl-link pl-lrc-retry" data-pl-act="lrcagain">重新取一次</button>' : '') +
(canOwn ? '<button type="button" class="pl-link pl-lrc-retry" data-pl-act="lrcedit">' + (lt && lt.lrc ? '编辑这份歌词' : '配一份歌词') + '</button>' : '') + '</div>' : '') +
(plLrcLines || []).map(l => '<div class="pl-lrc-line" data-lrc-t="' + l.t + '">' + (l.txt ? escapeHTML(l.txt) : '&nbsp;') +
(l.tr ? '<span class="pl-lrc-tr">' + escapeHTML(l.tr) + '</span>' : '') + '</div>').join('');
box.scrollTop = 0; plLrcIdx = -1;
}
function _plLrcFollow() {
const cur = plAudio && Number.isFinite(plAudio.currentTime) ? plAudio.currentTime : 0;
const has = Array.isArray(plLrcLines) && !!plLrcLines.length;
if (plState.lrc && has) {
const box = document.getElementById('plfLrc');
if (box && !box.hidden) {
let i = -1;
for (let k = 0; k < plLrcLines.length; k++) { if (plLrcLines[k].t <= cur + 0.25) i = k; else break; }
if (i !== plLrcIdx) {
plLrcIdx = i;
const els = box.querySelectorAll('.pl-lrc-line');
els.forEach((el, k) => el.classList.toggle('on', k === i));
const el = els[i];
if (el && Date.now() - plLrcHold > 5000) box.scrollTop = el.offsetTop - box.clientHeight / 2 + el.offsetHeight / 2;
}
}
}
_plFloatLrcFollow();
}
function _plFloatLrcFollow() {
const el = document.getElementById('plFloat');
if (!el || el.hidden || !_plFloatLrcOn()) return;
const t = plCur() || plCur_;
if (!t) return;
const rows = _plFloatLrcRowsNow(t);
const b = el.querySelector('.pl-float-tx b');
const sm = el.querySelector('.pl-float-tx small');
if (b && b.textContent !== rows.big) b.textContent = rows.big;
if (sm && sm.textContent !== rows.small) sm.textContent = rows.small;
}
var PL_LYRIC_API = 'https://music-api.gdstudio.xyz/api.php?types=lyric&source=netease&id=';
var PL_LYRIC_COOL_MIN = 12;
var PL_LYRIC_MELODY_PCT = 25;
var PL_LYRIC_SEG_SEC = 26;
var plLyrMemo = new Map();
var plLyrDone = {};
var plLyricTimer = 0;
function _plLyrCjk(s) {
const t = String(s || '').replace(/\s+/g, '');
if (!t) return 0;
let n = 0;
for (const ch of t) { const c = ch.codePointAt(0); if (c >= 0x4e00 && c <= 0x9fff) n++; }
return n / t.length;
}
var PL_LYRIC_CREDIT = /^(作词|作曲|编曲|制作人|和声|和声编写|吉他|贝斯|鼓|键盘|弦乐|录音|录音工程|录音助理|混音|母带|监制|出品|企划|统筹|词|曲|lyrics?|composer|arranger|producer|mixing|mastering)/i;
function _plLyrIsCredit(txt) {
const m = /^\s*([^:：]{1,12})\s*[:：]\s*\S+/.exec(String(txt || ''));
return !!(m && PL_LYRIC_CREDIT.test(m[1].trim()));
}
var PL_LYRIC_JUNK = /^[\s\.\,\!\?\;\:\-—…·、，。！？；：""''"'()（）\[\]【】~～\|/\\]*$/;
function _plLyrClean(list) {
const out = [];
(Array.isArray(list) ? list : []).forEach(x => {
const txt = String((x && x.txt) || '').replace(/\s+/g, ' ').trim();
if (!txt || PL_LYRIC_JUNK.test(txt)) return;
if (txt.length > 40) return;
if (_plLyrIsCredit(txt)) return;
const at = out.findIndex(y => y.txt === txt);
if (at >= 0) { out[at].n = (out[at].n || 1) + 1; return; }
out.push({ t: Number(x.t) || 0, txt: txt, n: 1 });
});
return out;
}
function plLyrPick(clean, maxN) {
const list = (Array.isArray(clean) ? clean : []).filter(x => x && x.txt);
if (!list.length) return [];
const hooks = list.filter(x => (x.n || 1) >= 2);
let idx;
if (hooks.length) {
const h = hooks[Math.floor(Math.random() * hooks.length)];
const at = list.indexOf(h);
idx = Math.max(0, Math.min(list.length - 1, at + [0, 1, -1][Math.floor(Math.random() * 3)]));
} else {
idx = Math.max(0, Math.min(list.length - 1, Math.round(list.length * 0.4)));
}
const cap = Math.max(1, Math.min(4, Math.round(Number(maxN) || 4)));
const want = 1 + Math.floor(Math.random() * cap);
const start = Math.max(0, Math.min(idx, list.length - want));
return list.slice(start, start + want);
}
function _plLyrTrFor(one, trs) {
if (!one || !Array.isArray(trs) || !trs.length) return '';
let best = null, bd = 1e9;
trs.forEach(x => { const d = Math.abs((Number(x.t) || 0) - (Number(one.t) || 0)); if (d < bd) { bd = d; best = x; } });
if (!best || bd > 0.3) return '';
const tr = String(best.txt || '').trim();
if (!tr || tr === String(one.txt || '').trim()) return '';
if (_plLyrCjk(one.txt) >= 0.5 && _plLyrCjk(tr) >= 0.5) return '';
return tr;
}
var plLrcSheetId = '';
function _plLrcSheetPaint() {
const box = document.getElementById('plLrcBody'); if (!box) return;
const t = plById(plLrcSheetId);
if (!t) { box.innerHTML = '<div class="pl-note">这一首已经不在曲库里了。</div>'; return; }
const n = t.lrc ? _plLrcParse(t.lrc).length : 0;
const stTx = n ? ' · 已有 ' + n + ' 行歌词' : (t.lrc ? ' · 现有这份没有时间轴' : ' · 还没配歌词');
box.innerHTML =
'<div class="pl-song">' + _plNoteSvg() + '<span class="pl-tx"><span class="pl-nm">' + escapeHTML(t.name) + '</span>' +
'<span class="pl-ar">' + escapeHTML((t.artist ? t.artist + ' · ' : '') + _plSrcLabel(t)) + stTx + '</span></span></div>' +
'<div class="pl-acts"><button type="button" class="pl-btn pri" data-pl-act="lrcpick">选择 .lrc 文件</button>' +
(t.lrc ? '<button type="button" class="pl-btn" data-pl-act="lrcwipe">移除歌词</button>' : '') + '</div>' +
'<div class="pl-set-lab">或者直接编辑<span>一行一句 · 行首要带时间轴 [00:12.34]</span></div>' +
'<textarea class="pl-in pl-lrc-ta" id="plLrcTa" rows="9" spellcheck="false" placeholder="[00:00.00]第一句&#10;[00:05.20]第二句">' +
escapeHTML(t.lrc || '') + '</textarea>' +
'<div class="pl-acts"><button type="button" class="pl-btn pri" data-pl-act="lrcsave">保存歌词</button></div>' +
'<div class="pl-note">本地文件与直链的歌没有可取的在线歌词，才需要在这里配一份；网易云的歌会按号码自己去取。配好的歌词跟着这一首存进曲库，备份也带上。</div>';
}
function openPlayerLyrics(id) {
const t = plById(id); if (!t) { showToast('这首已经不在曲库里了'); return; }
plLrcSheetId = id;
_plLrcSheetPaint();
_plMask('plLrcMask', true);
}
function closePlayerLyrics() { plLrcSheetId = ''; _plMask('plLrcMask', false); }
function _plLrcApplyText(txt, fromFile) {
const t = plById(plLrcSheetId); if (!t) return false;
const lines = _plLrcParse(txt);
if (!lines.length) {
showToast(fromFile ? '这份文件里没有时间轴（要 [mm:ss.xx] 那种）' : '还没有带时间轴的句子（行首写成 [00:12.34]）');
return false;
}
t.lrc = String(txt || ''); save();
if (plCur() === t) { plLrcKey = ''; plLrcLines = null; plLrcSay = ''; if (plState.lrc) plLrcEnsure(true); }
_plLrcSheetPaint();
renderPlayerAll();
showToast('配上了 · ' + lines.length + ' 行歌词');
return true;
}
function plPickLyricFile(id) {
const t = plById(id); if (!t) return;
if (typeof mochiFilePick !== 'function') return;
mochiFilePick({ id: 'lrc', accept: '.lrc,text/plain', onFiles: fs => {
const f = fs && fs[0]; if (!f) return;
if (f.size > 512 * 1024) { showToast('这份歌词太大了（超过 512KB）'); return; }
const rd = new FileReader();
rd.onload = () => {
const txt = String(rd.result || '');
const ta = document.getElementById('plLrcTa');
if (ta) ta.value = txt;
_plLrcApplyText(txt, true);
};
rd.onerror = () => showToast('这份文件读不出来');
rd.readAsText(f, 'utf-8');
}});
}
function plLyrFetch(t) {
if (t && t.lrc) return Promise.resolve({ lines: _plLrcParse(t.lrc), trs: [] });
const nid = (t && t.src === 'ncm') ? String(t.nid || '') : '';
if (!nid) return Promise.resolve(null);
const hit = plLyrMemo.get(nid);
if (hit) { plLyrMemo.delete(nid); plLyrMemo.set(nid, hit); return Promise.resolve(hit); }
const keep = obj => {
plLyrMemo.set(nid, obj);
while (plLyrMemo.size > 6) plLyrMemo.delete(plLyrMemo.keys().next().value);
return obj;
};
return _plFetchTextFresh(PL_LYRIC_API + encodeURIComponent(nid), 12000).then(txt => {
let j = null;
try { j = JSON.parse(String(txt || '')); } catch (e) { j = null; }
const lrc = (j && (j.lyric || j.lrc)) ? String(j.lyric || j.lrc) : '';
if (!lrc) return null;
return keep({ lines: _plLrcParse(lrc), trs: _plLrcParse((j && j.tlyric) || '') });
}).catch(() => null).then(obj => {
if (obj) return obj;
return _plMetingTextAny('?server=netease&type=lrc&id=' + encodeURIComponent(nid), 12000, txt => _plLrcParse(txt).length >= 4)
.then(raw => {
const lines = _plLrcParse(raw);
return lines.length ? keep({ lines: lines, trs: [] }) : null;
}).catch(() => null);
});
}
function _plLyrCid() {
const withCid = _plWith();
if (withCid) return withCid;
const cid = (data && typeof data.activeChat === 'string') ? data.activeChat : '';
const c = (data.contacts || []).find(x => x && x.id === cid);
return (c && c.kind !== 'group') ? cid : '';
}
function _plLyrCoolEnd(cid) {
const m = _plRoot().lyricCoolBy || {};
const n = Number(m[cid || '']);
return Number.isFinite(n) && n > 0 ? n : 0;
}
function _plLyrCoolSet(cid) {
const p = _plRoot();
if (!p.lyricCoolBy || typeof p.lyricCoolBy !== 'object' || Array.isArray(p.lyricCoolBy)) p.lyricCoolBy = {};
p.lyricCoolBy[cid || ''] = Date.now() + PL_LYRIC_COOL_MIN * 60000;
save();
}
function plLyrBlocked(cid, t) {
if (data.lyricOn === false) return 'off';
if (!cid) return 'no-cid';
if (!t) return 'no-track';
if (typeof _chatIsGroup === 'function' && _chatIsGroup(cid)) return 'group';
if (plLyrDone[t.id] && Date.now() - plLyrDone[t.id] < 30 * 60000) return 'done';
if (Date.now() < _plLyrCoolEnd(cid)) return 'cool';
const msgs = ((data.chats && data.chats[cid] && data.chats[cid].msgs) || []).slice(-6);
if (msgs.some(m => m && m.from === 'system' && !m.co && m.text && t.name && String(m.text).indexOf(t.name) >= 0)) return 'said';
return '';
}
function plLyrK(cid, t) {
let k = 1;
if (t) {
const inv = (_plRoot().invites || []).some(v => v && v.cid === cid && v.trackId === t.id && v.manual === false);
if (inv) k *= 1.6;
if (_plTaFav(cid).indexOf(t.id) >= 0) k *= 1.4;
}
const h = new Date().getHours();
if (h >= 23 || h < 3) k *= 1.2;
return k;
}
function plLyrRoll(cid, t) {
const cfg = _plCfg(cid);
const base = Number(cfg.lyricProb) || 0;
if (!(base > 0)) return false;
const p = Math.min(100, base * plLyrK(cid, t));
return Math.random() * 100 < p;
}
function plLyrDeliver(cid, t, pay) {
if (typeof vcCardNarrow === 'function' && vcCardNarrow(cid)) return false;
const ch = data.chats && data.chats[cid];
if (!ch || !Array.isArray(ch.msgs)) return false;
const msg = {
id: nextId(), from: 'partner', unread: true, src: 'music',
lyr: {
mode: pay && pay.mode === 'melody' ? 'melody' : 'lyric',
tid: t.id, name: String(t.name || ''), artist: String(t.artist || ''), nid: String(t.nid || ''),
lines: (pay && Array.isArray(pay.lines)) ? pay.lines : [],
seg: (pay && Array.isArray(pay.seg)) ? pay.seg : null,
dur: Number(t.dur) || 0,
at: Date.now(), hook: !!(pay && pay.hook)
}
};
try {
const e = (typeof _emotionForMessage === 'function')
? _emotionForMessage(cid, (msg.lyr.lines || []).map(x => x.txt).join(' '))
: null;
if (e && e.tags && e.tags.length) msg.emo = e.tags;
if (msg.lyr.mode === 'lyric' && typeof _meantEligible === 'function' && _meantEligible(msg)) {
const bh = (typeof _gbhMerged === 'function') ? _gbhMerged(cid, '') : null;
if (bh) {
if (data.referOn !== false && _rand(bh.referProb)) msg.refer = rollRefer();
if (data.meantOn !== false && _rand(bh.meantProb)) msg.meant = rollMeant();
}
}
} catch (e) {}
plLyrDone[t.id] = Date.now();
_plLyrCoolSet(cid);
_deliverToChat(msg, cid);
return true;
}
function plLyrSend(cid, t) {
if (typeof vcCardNarrow === 'function' && vcCardNarrow(cid)) return false;
return plLyrFetch(t).then(got => {
const clean = got ? _plLyrClean(got.lines) : [];
const dur = Number(t.dur) || 0;
const canLyric = clean.length >= 4;
const melody = (!canLyric || Math.random() * 100 < PL_LYRIC_MELODY_PCT);
if (!melody) {
const win = plLyrPick(clean, Number(_plCfg(cid).lyricMax) || 4);
if (!win.length) return false;
const trs = got.trs || [];
const lines = win.map(x => ({ t: x.t, txt: x.txt, tr: _plLyrTrFor(x, trs) }));
const start = Math.max(0, Number(lines[0].t) || 0);
return plLyrDeliver(cid, t, { mode: 'lyric', lines: lines, hook: (win[0].n || 1) >= 2, seg: [start, dur ? Math.min(dur - 2, start + PL_LYRIC_SEG_SEC) : start + PL_LYRIC_SEG_SEC] });
}
if (!dur || dur < 40) return false;
let start;
if (canLyric) { const win = plLyrPick(clean); start = Math.max(0, Number((win[0] || {}).t) || 0); }
else start = dur * (0.45 + (Math.random() * 0.16 - 0.08));
start = Math.max(0, Math.min(dur - 6, start));
return plLyrDeliver(cid, t, { mode: 'melody', lines: [], hook: false, seg: [start, Math.min(dur - 2, start + PL_LYRIC_SEG_SEC)] });
}).catch(() => false);
}
function plLyricArm(t) {
if (plLyricTimer) { clearTimeout(plLyricTimer); plLyricTimer = 0; }
const cid = _plLyrCid();
if (!cid || !t) return false;
if (plLyrBlocked(cid, t)) return false;
if (!(Number(_plCfg(cid).lyricProb) > 0)) return false;
plLyricTimer = setTimeout(() => {
plLyricTimer = 0;
try {
const a = plAudio;
if (!a || a.paused || _plRoot().current !== t.id) return;
if (!(Number(a.currentTime) > 8)) return;
const c2 = _plLyrCid() || cid;
if (c2 !== cid) return;
if (plLyrBlocked(cid, t)) return;
if (!plLyrRoll(cid, t)) return;
plLyrSend(cid, t);
} catch (e) {}
}, 12000 + Math.random() * 28000);
return true;
}
var plLyrFollowPend = null;
function plLyricInviteFollow(cid, t) {
try {
if (!cid || !t || data.lyricOn === false) return false;
if (typeof _chatIsGroup === 'function' && _chatIsGroup(cid)) return false;
if (plLyrBlocked(cid, t)) return false;
if (!(Number(_plCfg(cid).lyricInviteProb) > 0)) return false;
if (Math.random() * 100 >= Number(_plCfg(cid).lyricInviteProb)) return false;
plLyrFollowPend = { cid: cid, tid: t.id, at: Date.now() };
return true;
} catch (e) { return false; }
}
var plDiagBusy = false, plDiagAt = 0, plDiagRows = null;
function plLyricDiag() {
if (plDiagBusy) return;
plDiagBusy = true; plDiagRows = null;
renderPlayerSettings();
const t = plCur() || plCur_;
const nid = (t && t.src === 'ncm') ? String(t.nid || '') : '';
const rows = [{ label: '这一页的版本', val: String(window.APP_VER || '?') }];
const jobs = [];
const probe = (name, url, parseLines) => {
const t0 = Date.now();
jobs.push(_plFetchTextFresh(url, 12000).then(raw => {
const lines = parseLines ? parseLines(raw) : _plLrcParse(raw).length;
return { name, ok: lines > 0, sec: ((Date.now() - t0) / 1000).toFixed(1), lines: lines };
}).catch(() => ({ name, ok: false, sec: '—', lines: 0 })));
};
if (nid) {
_plMetingBases().forEach((b, i) => probe('公开接口 ' + (i + 1), b + '?server=netease&type=lrc&id=' + encodeURIComponent(nid)));
probe('gdstudio（带译文）', PL_LYRIC_API + encodeURIComponent(nid),
raw => { try { return _plLrcParse(JSON.parse(raw).lyric || '').length; } catch (e) { return 0; } });
const mine = _plNcmApi();
if (mine) probe('你自己填的接口', mine + '/lyric?id=' + encodeURIComponent(nid),
raw => { try { const j = JSON.parse(raw); return _plLrcParse((j.lrc && j.lrc.lyric) || j.lyric || '').length; } catch (e) { return 0; } });
}
Promise.all(jobs).then(list => {
list.forEach(x => rows.push({ label: x.name, val: x.ok ? ('通 · ' + x.sec + 's · ' + x.lines + ' 行') : ('没答上 · ' + x.sec + 's') }));
rows.push({ label: '这一首', val: !t ? '现在没有在放的歌'
: (nid ? (String(t.name || '') + '（nid ' + nid + '）') : (String(t.name || '') + '：不是网易云的歌，没有歌词可取')) });
const cid = _plLyrCid();
const why = (cid && t) ? (plLyrBlocked(cid, t) || '') : 'no-cid';
const WHY = {
'': '可以掷（还差一首真在响的歌 + 那一发概率）',
off: '总开关关着 → 更多 · 使用大全 · 摘一句',
'no-cid': '没有主语：当前会话不是单聊（一起听的那位也会优先）',
'no-track': '现在没在放歌', group: '群聊不摘',
done: '这一首 30 分钟内已经摘过（换一首或等 30 分钟）',
cool: '这一位还在冷却 · 还剩 ' + Math.max(0, Math.ceil((_plLyrCoolEnd(cid) - Date.now()) / 60000)) + ' 分钟',
said: '这一首已经在聊天里留过别的系统小字（同曲互斥，换一首）'
};
const who = cid || data.activeChat || '';
rows.push({ label: '摘一句', val: (Number(_plCfg(who).lyricProb) || 0) + '% · ' + (WHY[why] || why) });
plDiagRows = rows; plDiagBusy = false; plDiagAt = Date.now();
renderPlayerSettings();
});
}
var plLyrLogOpen = '';
var plLyrLogWho = 'all';
function _plLyrScan() {
const out = [];
const chats = (data && data.chats) || {};
Object.keys(chats).forEach(cid => {
const msgs = (chats[cid] && Array.isArray(chats[cid].msgs)) ? chats[cid].msgs : [];
msgs.forEach(m => {
if (m && m.lyr && !m.recalled) out.push({ cid: cid, mid: m.id, lyr: m.lyr, at: Number(m.lyr.at) || Number(m.at) || 0 });
});
});
out.sort((a, b) => b.at - a.at);
return out;
}
function _plLyrTime(ms) {
const d = new Date(Number(ms) || 0);
if (!d.getFullYear()) return '';
return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
}
function _plLyrDayKey(ms) {
const d = new Date(Number(ms) || 0);
if (!d.getFullYear()) return '';
return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
function _plLyrDayLabel(ms) {
const d = new Date(Number(ms) || 0);
if (!d.getFullYear()) return '';
const now = new Date();
const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
const diff = Math.round((today - day) / 86400000);
if (diff === 0) return '今天';
if (diff === 1) return '昨天';
if (d.getFullYear() === now.getFullYear()) return (d.getMonth() + 1) + '月' + d.getDate() + '日';
return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
}
function _plLyrSegText(seg) {
if (!Array.isArray(seg)) return '';
return (typeof _lcClock === 'function')
? (_lcClock(seg[0]) + ' – ' + _lcClock(seg[1]))
: (Math.round(Number(seg[0]) || 0) + 's – ' + Math.round(Number(seg[1]) || 0) + 's');
}
function renderPlLyrLog() {
const box = document.getElementById('plLyrLogBody'); if (!box) return;
const all = _plLyrScan();
if (!all.length) {
box.innerHTML = '<div class="pl-note">还没有记录 —— TA 从你正在听的这首里摘的句子（「摘一句」与「这一段」两张卡）会出现在这里。</div>';
return;
}
const whoName = {}, whoNums = {}, whoOrder = [];
all.forEach(r => {
if (!whoName[r.cid]) {
const c = ((data && data.contacts) || []).find(x => x && x.id === r.cid);
whoName[r.cid] = chatNameOf(c) || '已离开的人';
whoNums[r.cid] = 0; whoOrder.push(r.cid);
}
whoNums[r.cid]++;
});
const many = whoOrder.length > 1;
const rows = plLyrLogWho === 'all' ? all : all.filter(r => r.cid === plLyrLogWho);
let html = '<div class="pl-lyrl-sum">共 ' + all.length + ' 张 · 点一行展开看全文</div>';
if (many) {
html += '<div class="pl-lyrl-chips">' +
'<button type="button" class="scope-chip' + (plLyrLogWho === 'all' ? ' on' : '') + '" data-pl-lyr-who="all">全部<i>' + all.length + '</i></button>' +
whoOrder.map(cid => '<button type="button" class="scope-chip' + (plLyrLogWho === cid ? ' on' : '') + '" data-pl-lyr-who="' + escapeHTML(String(cid)) + '">' + escapeHTML(whoName[cid]) + '<i>' + whoNums[cid] + '</i></button>').join('') +
'</div>';
}
if (!rows.length) {
box.innerHTML = html + '<div class="pl-note">这一位现在没有摘句记录 · 点「全部」看所有记录。</div>';
return;
}
let lastDay = '', dayFirst = true;
rows.forEach(r => {
const l = r.lyr || {};
const melody = l.mode === 'melody';
const lines = Array.isArray(l.lines) ? l.lines : [];
const seg = Array.isArray(l.seg) ? l.seg : null;
const c = ((data && data.contacts) || []).find(x => x && x.id === r.cid);
const name = chatNameOf(c) || '已离开的人';
const dk = _plLyrDayKey(r.at);
if (dk !== lastDay) {
lastDay = dk;
html += '<div class="pl-lyrl-day' + (dayFirst ? ' first' : '') + '">' + escapeHTML(_plLyrDayLabel(r.at)) + '</div>';
dayFirst = false;
}
const first = melody ? ('这一段 · ' + _plLyrSegText(seg))
: ((lines[0] && lines[0].txt) ? screenSafeText(lines[0].txt) : '摘一句');
const more = melody
? (seg ? '<span class="pl-lyrl-seg">这一段 · ' + _plLyrSegText(seg) + '</span>' : '')
: (lines.length
? '<span class="pl-lyrl-lines">' + lines.map(x =>
'<span class="pl-lyrl-line"><b>' + escapeHTML(screenSafeText(x.txt)) + '</b>' +
(x.tr ? '<small>' + escapeHTML(screenSafeText(x.tr)) + '</small>' : '') + '</span>').join('') + '</span>'
: '');
const src = l.name ? '《' + escapeHTML(String(l.name)) + '》' + (l.artist ? ' · ' + escapeHTML(String(l.artist)) : '') : '';
const on = !!(r.mid && String(r.mid) === plLyrLogOpen);
html += '<div class="pl-lyrl-row' + (on ? ' on' : '') + '" data-pl-lyr-toggle="' + escapeHTML(String(r.mid || '')) + '">' +
'<span class="avatar pl-lyrl-ava">' + avatarHTML(chatAvatarOf(c)) + '</span>' +
'<span class="pl-lyrl-main">' +
'<span class="pl-lyrl-who"><b>' + escapeHTML(name) + '</b></span>' +
'<span class="pl-lyrl-first">' + escapeHTML(first) + '</span>' +
'<span class="pl-lyrl-more">' +
more +
(src ? '<span class="pl-lyrl-src">' + src + '</span>' : '') +
'<button type="button" class="pl-lyrl-go" data-pl-lyr-go="' + escapeHTML(String(r.cid)) + '" data-pl-lyr-mid="' + escapeHTML(String(r.mid || '')) + '">去聊天里看这条 ›</button>' +
'</span>' +
'</span>' +
'<span class="pl-lyrl-side"><i>' + escapeHTML(_plLyrTime(r.at)) + '</i><span class="pl-chev">›</span></span>' +
'</div>';
});
box.innerHTML = html;
}
function openPlayerLyrLog() {
closePlayerDaily(); closePlayerNcmList(); closePlayerSource();
plLyrLogOpen = ''; plLyrLogWho = 'all';
const v = document.getElementById('plLyrLogFull'); if (v) v.hidden = false;
renderPlLyrLog();
}
function closePlayerLyrLog() {
plLyrLogOpen = ''; plLyrLogWho = 'all';
const v = document.getElementById('plLyrLogFull'); if (v) v.hidden = true;
}
function _plLyrGo(cid, mid) {
closePlayerLyrLog();
if (cid && data.chats && data.chats[cid] && typeof switchChat === 'function') switchChat(cid);
else if (typeof showView === 'function') showView('chat');
if (mid && typeof jumpToMessage === 'function') setTimeout(() => jumpToMessage(mid), 80);
}
document.addEventListener('click', e => {
const el = e.target.closest('.lc-card[data-lc-tid]');
if (!el) return;
const tid = el.dataset.lcTid;
if (!tid) return;
const t = plById(tid);
if (!t) { try { showToast('这首已经不在曲库里了'); } catch (e2) {} return; }
const isSeg = el.hasAttribute('data-lc-seg');
const seg = String(el.dataset.lcSeg || '').split('-');
const start = Number(seg[0]);
const cur = plCur();
const alreadyHere = !!(cur && cur.id === tid);
if (isSeg || alreadyHere) {
try { if (typeof showView === 'function') showView('player'); } catch (e2) {}
}
if (alreadyHere) {
if (isSeg && Number.isFinite(start) && start > 0) {
try {
const a = plAudio;
if (a) a.currentTime = Math.min(start, Number.isFinite(a.duration) ? a.duration - 1 : start);
} catch (e3) {}
}
return;
}
try {
plPlayId(tid);
if (isSeg && Number.isFinite(start) && start > 0) {
const seek = () => {
const a = plAudio;
if (!a || _plRoot().current !== tid) return;
try { a.currentTime = Math.min(start, Number.isFinite(a.duration) ? a.duration - 1 : start); } catch (e3) {}
};
setTimeout(seek, 420);
}
} catch (e2) {}
});
function plCoPickNow(cid) {
plState.tab = 'lib';
showView('player');
renderPlayerPage();
try { showToast('挑一首放起来 · ' + _plName(cid) + ' 在陪你听'); } catch (e) {}
}
function plCoAutoBind() {
try {
const p = _plRoot();
if (p.coOff) return '';
if (plCoNoBind) return '';
const ok = cid => !!cid && (data.contacts || []).some(c => c && c.id === cid && c.kind !== 'group');
if (p.withCid && ok(p.withCid)) return p.withCid;
p.withCid = '';
const singles = _plSingles();
if (!singles.length) return '';
let cid = ok(data.activeChat) ? data.activeChat : '';
if (!cid) {
const last = singles.slice().sort((a, b) =>
(((data.chats[b.id] || {}).msgs || []).length) - (((data.chats[a.id] || {}).msgs || []).length))[0];
cid = last ? last.id : '';
}
if (!cid) return '';
p.withCid = cid; save();
return cid;
} catch (e) { return ''; }
}
function plSetCoWho(cid) {
try {
const p = _plRoot();
p.coOff = !cid;
p.withCid = cid || '';
plCoNoBind = false;
save();
renderPlayerFull(); renderPlayerPage(); renderPlayerSettings();
try { renderPlFloat(); } catch (e) {}
showToast(cid ? _plName(cid) + ' 在陪你听' : '现在一个人听 · 想找回就在整屏页点「挑一位陪你听」');
} catch (e) {}
}
function _plCoDropPatch(cid, off) {
const p = _plRoot(); let dirty = false;
if (off && !p.coOff) { p.coOff = true; dirty = true; }
if (cid && p.withCid === cid) { p.withCid = ''; dirty = true; }
if (dirty) save();
(Array.isArray(p.invites) ? p.invites : []).forEach(v => {
if (v && v.cid === cid && (v.status === 'yes' || v.status === 'switch')) { try { _plPatchCo(v); } catch (e) {} }
});
}
function _plChatNote(cid, msg, force) {
if (!force && !_plCfg(cid).taChatNote) return;
_deliverToChat(msg, cid);
}
function _plClearTaTimers() {
if (plTaFavTimer) { clearTimeout(plTaFavTimer); plTaFavTimer = 0; }
if (plPauseTimer) { clearTimeout(plPauseTimer); plPauseTimer = 0; }
if (plResumeTimer) { clearTimeout(plResumeTimer); plResumeTimer = 0; }
if (plLyricTimer) { clearTimeout(plLyricTimer); plLyricTimer = 0; }
plPauseOn = false;
plPauseAt = 0;
}
function _plScheduleTa(t) {
if (!t) return;
const cid = _plWith(); if (!cid) return;
const cfg = _plCfg(cid), id = t.id;
if (cfg.taFavProb > 0 && _plTaFav(cid).indexOf(id) < 0) {
plTaFavTimer = setTimeout(() => {
plTaFavTimer = 0;
const a = plAudio;
if (!a || a.paused || _plRoot().current !== id) return;
if (Math.random() * 100 >= cfg.taFavProb) return;
if (plTaFav(cid, id)) {
_plChatNote(cid, { id: nextId(), from: 'system', text: _plName(cid) + ' 把你正在听的《' + t.name + '》收进了自己的收藏' });
renderPlayerAll();
}
}, 10000 + Math.floor(Math.random() * 15000));
}
if (cfg.taPauseEn && plPauseDone !== id) {
plPauseTimer = setTimeout(() => {
plPauseTimer = 0;
if (document.hidden || _plRoot().current !== id) return;
if (Math.random() * 100 >= PL_TA_PAUSE_PCT) return;
if (!plPauseByTa()) return;
plPauseDone = id;
const a = plAudio; if (a) { try { a.currentTime = Math.max(0, (Number.isFinite(a.currentTime) ? a.currentTime : 0) - 0.05); } catch (e) {} }
_plChatNote(cid, { id: nextId(), from: 'system', text: _plName(cid) + ' 按了一下暂停' });
plResumeTimer = setTimeout(() => {
plResumeTimer = 0;
if (_plRoot().current !== id) { plPauseOn = false; return; }
plResumeByTa();
_plChatNote(cid, { id: nextId(), from: 'system', text: _plName(cid) + ' 又帮你按了播放' });
}, 3000 + Math.floor(Math.random() * 5000));
}, 10000 + Math.floor(Math.random() * 15000));
}
}
function plMaybeRequest(cid) {
try {
if (document.hidden) return;
const c = (data.contacts || []).find(x => x && x.id === cid);
if (!c || c.kind === 'group') return;
if (typeof vcCardNarrow === 'function' && vcCardNarrow(cid)) return;
const cfg = _plCfg(cid);
let list = plTracks().filter(plPlayable);
const sure = list.filter(x => x.src !== 'ncm' || plOkAt[x.id]);
if (sure.length) list = sure;
if (!cfg.reqProb || !list.length) return;
const cooling = Date.now() < _plCoolEnd(cid);
if (!cooling) {
if (Math.random() * 100 >= cfg.reqProb) return;
const pick = list[Math.floor(Math.random() * list.length)];
_plCoolSet(cid);
plSendInvite(cid, pick.id);
return;
}
if (!cfg.taReserveProb || !plCur() || !plById(_plRoot().current)) return;
if (Math.random() * 100 >= cfg.taReserveProb) return;
const cand = list.filter(x => x.id !== _plRoot().current && (_plRoot().queue || []).indexOf(x.id) < 0);
if (!cand.length) return;
const t = cand[Math.floor(Math.random() * cand.length)];
_plCoolSet(cid);
_plReserve(cid, t);
} catch (e) {}
}
var PL_TA_INVITE_NEXT_KEY = 'ordinal-pl-ta-invite-next';
function _plTaInviteOn() { return _plRoot().taInviteOn !== false; }
function plTaInviteSet(on) {
_plRoot().taInviteOn = !!on;
if (on) _plTaInviteArm();
save();
renderPlayerSettings();
try { showToast(on ? 'TA 会偶尔推一首歌来邀你一起听' : '已关掉 TA 的随机推歌邀请'); } catch (e) {}
}
function _plTaInviteNextGet() {
try { return Number(localStorage.getItem(PL_TA_INVITE_NEXT_KEY)) || 0; } catch (e) { return 0; }
}
function _plTaInviteNextSet(ts) {
try { localStorage.setItem(PL_TA_INVITE_NEXT_KEY, String(Math.max(0, Math.floor(Number(ts) || 0)))); } catch (e) {}
if (!ts) { try { localStorage.removeItem(PL_TA_INVITE_NEXT_KEY); } catch (e) {} }
}
function _plTaInviteArm() {
if (!_plTaInviteOn()) return;
if (!_plTaInviteNextGet()) _plTaInviteNextSet(Date.now() + (8 + Math.floor(Math.random() * 17)) * 60000);
if (plTaInviteTimer) return;
plTaInviteTimer = setInterval(_plTaInviteTick, 60 * 1000);
}
function _plTaInviteTick() {
if (!_plTaInviteOn()) return;
const next = _plTaInviteNextGet();
if (next && Date.now() < next) return;
_plTaInviteNextSet(Date.now() + (15 + Math.floor(Math.random() * 26)) * 60000);
Promise.resolve(_plTaInviteTry()).catch(() => {});
}
async function _plTaInviteTry() {
if (!_plTaInviteOn()) return false;
const p = _plRoot(), now = Date.now();
const singles = _plSingles();
if (!singles.length) return false;
const invs = Array.isArray(p.invites) ? p.invites : [];
const cands = singles.filter(c => {
if (!c || !c.id) return false;
if (invs.some(v => v && v.cid === c.id && v.status === 'waiting' && !v.manual)) return false;
return !(_plCoolEnd(c.id) > now);
});
if (!cands.length) return false;
const c = cands[Math.floor(Math.random() * cands.length)];
const playable = plTracks().filter(plPlayable);
if (playable.length) {
const pool = playable.length > 1 ? playable.filter(t => t && t.id !== p.current) : playable;
const t = pool[Math.floor(Math.random() * pool.length)];
if (!t) return false;
const ok = plSendInvite(c.id, t.id, false, true);
if (ok) {
if (!p.coolEndBy || typeof p.coolEndBy !== 'object' || Array.isArray(p.coolEndBy)) p.coolEndBy = {};
p.coolEndBy[c.id] = now + (120 + Math.floor(Math.random() * 120)) * 60000;
save();
renderPlayerAll(); renderPlayerSettings();
}
return ok;
}
return Promise.resolve(plRandPush({ inviteOnly: true, cid: c.id })).catch(() => false);
}
function _plListenTick(t, playing, cur) {
if (!t || !playing) { plListenLastCur = -1; return; }
if (plListenLastCur < 0) { plListenLastCur = cur; return; }
const d = cur - plListenLastCur;
plListenLastCur = cur;
if (!(d > 0) || d > 5) return;
const p = _plRoot();
if (!p.listen || typeof p.listen !== 'object' || Array.isArray(p.listen)) p.listen = { all: 0, co: 0, days: {} };
const L = p.listen;
if (!L.days || typeof L.days !== 'object' || Array.isArray(L.days)) L.days = {};
const k = _plDayKey();
const day = L.days[k] || (L.days[k] = { all: 0, co: 0 });
L.all = Math.max(0, (Number(L.all) || 0) + d);
day.all = Math.max(0, (Number(day.all) || 0) + d);
if (p.withCid) {
L.co = Math.max(0, (Number(L.co) || 0) + d);
day.co = Math.max(0, (Number(day.co) || 0) + d);
}
const keys = Object.keys(L.days);
if (keys.length > 180) keys.sort().slice(0, keys.length - 180).forEach(x => delete L.days[x]);
if (Date.now() - plListenSavedAt >= 20000) { plListenSavedAt = Date.now(); save(); }
}
function plPendingInvite(cid) {
const list = _plRoot().invites;
if (!Array.isArray(list)) return null;
for (let i = list.length - 1; i >= 0; i--) {
const v = list[i];
if (v && v.manual && v.cid === cid && v.status === 'waiting') return v;
}
return null;
}
function _plInvText(cid, t, manual) {
return t ? (manual ? '你邀 ' + _plName(cid) + ' 一起听《' + t.name + '》' : _plName(cid) + ' 想和你一起听《' + t.name + '》')
: (manual ? '你邀 ' + _plName(cid) + ' 一起听 · 不限歌' : _plName(cid) + ' 想和你一起听 · 不限歌');
}
function plSendInvite(cid, trackId, manual, force) {
const p = _plRoot();
const t = trackId ? plById(trackId) : null;
if (trackId && !t) return false;
if (!cid) return false;
if (!data.chats || typeof data.chats !== 'object') data.chats = {};
if (!data.chats[cid] || !Array.isArray(data.chats[cid].msgs)) data.chats[cid] = { msgs: [], unread: 0, draft: '' };
if (manual) {
const wantId = t ? t.id : '';
const old = plPendingInvite(cid);
if (old) {
if (old.trackId !== wantId) {
old.trackId = wantId;
old.at = Date.now();
const om = (data.chats[cid].msgs || []).filter(x => x && x.co === old.id).pop();
if (om) { om.text = _plInvText(cid, t, true); if (typeof patchMessage === 'function') patchMessage(om); }
touchMsgs(cid);
save();
renderPlayerAll();
showToast('这一条改成了' + (t ? '《' + t.name + '》' : '不限歌') + '·还在等 TA 回话');
} else {
showToast('这一条已经送出去了·还在等 TA 回话');
}
_plScheduleInviteAnswer(cid, old.id);
return true;
}
if (p.withCid === cid && (!t || p.current === t.id)) {
showToast(t ? '你已经在和 ' + _plName(cid) + ' 听《' + t.name + '》了' : '你已经在和 ' + _plName(cid) + ' 一起听了');
return true;
}
const laterOld = (p.invites || []).filter(x => x && x.manual && x.cid === cid && x.status === 'later').pop();
if (laterOld) {
if (laterOld.trackId === wantId) {
showToast(_plName(cid) + ' 说了等一会儿·马上回来一起听');
return true;
}
if (plInvLaterTimers[laterOld.id]) { clearTimeout(plInvLaterTimers[laterOld.id]); delete plInvLaterTimers[laterOld.id]; }
laterOld.trackId = wantId;
laterOld.status = 'waiting';
laterOld.at = Date.now();
const omLate = (data.chats[cid].msgs || []).filter(x => x && x.co === laterOld.id).pop();
if (omLate) { omLate.text = _plInvText(cid, t, true); if (typeof patchMessage === 'function') patchMessage(omLate); }
touchMsgs(cid);
save();
_plScheduleInviteAnswer(cid, laterOld.id);
_plPatchCo(laterOld);
renderPlayerAll();
showToast('这一条改成了' + (t ? '《' + t.name + '》' : '不限歌') + '·重新等 TA 回话');
return true;
}
}
const inv = { id: 'iv' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
cid, trackId: t ? t.id : '', at: Date.now(), status: 'waiting', manual: !!manual };
if (!manual && t) inv.mood = _plPickSayRand(_plSayPool(PL_MOOD_NAME));
p.invites = (Array.isArray(p.invites) ? p.invites : []).concat([inv]).slice(-PL_KEEP_INV * 2);
save();
const coMsg = { id: nextId(), from: 'system', text: _plInvText(cid, t, !!manual), player: inv.id, co: inv.id };
if (!manual) {
try {
const e = (typeof _emotionForMessage === 'function')
? _emotionForMessage(cid, t ? ('一起听《' + t.name + '》') : '一起听')
: null;
if (e && e.tags && e.tags.length) coMsg.emo = e.tags;
const bh = (typeof _gbhMerged === 'function') ? _gbhMerged(cid, '') : null;
if (bh && (typeof _meantEligible !== 'function' || _meantEligible(coMsg))) {
if (data.referOn !== false && _rand(bh.referProb)) coMsg.refer = rollRefer();
if (data.meantOn !== false && _rand(bh.meantProb)) coMsg.meant = rollMeant();
}
} catch (e) {}
}
if (!manual) {
const sayInv = _plPickInvSay(cid, _plSayPool(t ? PL_SAY_NAMES.invSay : PL_SAY_NAMES.invSayAny));
if (sayInv) _plChatNote(cid, { id: nextId(), from: 'partner', text: sayInv }, force);
}
_plChatNote(cid, coMsg, force);
if (!manual && inv.mood) _plChatNote(cid, { id: nextId(), from: 'partner', text: inv.mood }, force);
if (manual) { _plScheduleInviteAnswer(cid, inv.id); showToast('邀请送到了·等 ' + _plName(cid) + ' 回话'); }
if (!manual && t) { try { plLyricInviteFollow(cid, t); } catch (e) {} }
renderPlayerAll();
return true;
}
var PL_SAY_NAMES = {
ansYes: '我同意后TA说', ansYesAny: '我同意后TA说（不限歌）',
ansLater: '我先放一放后TA说', ansLaterAny: '我先放一放后TA说（不限歌）',
later: 'TA答复我·等一会儿', laterAny: 'TA答复我·等一会儿（不限歌）',
no: 'TA答复我·不听', noAny: 'TA答复我·不听（不限歌）',
invSay: 'TA邀我听歌时说', invSayAny: 'TA邀我听歌时说（不限歌）'
};
var PL_MOOD_NAME = '这首歌的心情';
function _plSayPool(name) {
const g = (data.groups || []).find(x => x && (x.name || '') === name && (x.category || '主字卡') === 'TA心里话' && !x.off);
return ((g && g.cards) || []).filter(c => { const t = cardText(c); return t && !voiceCardParts(t) && !cardIsOff(g, c); }).map(cardText);
}
function _plPickSay(pool, seed) {
let h = 0; const k = String(seed || '');
for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
return pool && pool.length ? pool[h % pool.length] : '';
}
function _plPickSayRand(pool) {
return pool && pool.length ? pool[Math.floor(Math.random() * pool.length)] : '';
}
var plInvSayLast = {};
function _plPickInvSay(cid, pool) {
if (!pool || !pool.length) return '';
if (pool.length === 1) return pool[0];
const last = plInvSayLast[cid || ''];
const cand = pool.filter(s => s !== last);
const pick = cand.length ? cand[Math.floor(Math.random() * cand.length)] : pool[Math.floor(Math.random() * pool.length)];
plInvSayLast[cid || ''] = pick;
return pick;
}
function _plPatchCo(v) {
try {
const co = ((data.chats && data.chats[v.cid] && data.chats[v.cid].msgs) || []).filter(x => x && x.co === v.id).pop();
if (co && typeof patchMessage === 'function') patchMessage(co);
} catch (e) {}
}
function _plInviteAnswerYes(v, t, say) {
const p = _plRoot();
v.status = 'yes';
p.withCid = v.cid;
p.coOff = false;
if (t && p.current !== t.id) { _plPosDrop(t.id); if (p.current) plQueueNext(t.id); else plLoad(t); }
else if (t && p.current === t.id) {
const a = plAudio;
if (a && a.src && a.paused && !a.ended) { _plWantSet(true); const r = a.play(); if (r && r.catch) r.catch(() => {}); }
}
save();
_deliverToChat({ id: nextId(), from: 'partner', text: say || (t ? '好啊，一起听《' + t.name + '》' : '好啊，一起听') }, v.cid);
_plPatchCo(v);
renderPlayerAll();
showToast(t ? _plName(v.cid) + ' 答应了·一起听《' + t.name + '》' : _plName(v.cid) + ' 答应了·陪你一起听');
}
function _plScheduleInviteAnswer(cid, id) {
if (plInvAnswerTimers[id]) { clearTimeout(plInvAnswerTimers[id]); delete plInvAnswerTimers[id]; }
const wait = 6000 + Math.floor(Math.random() * 9000);
plInvAnswerTimers[id] = setTimeout(() => {
delete plInvAnswerTimers[id];
const p = _plRoot();
const v = (p.invites || []).find(x => x && x.id === id);
if (!v || v.status !== 'waiting' || !v.manual) return;
const t = v.trackId ? plById(v.trackId) : null;
if (v.trackId && !t) return;
const cfg = _plCfg(v.cid);
const r = Math.random() * 100;
if (r < cfg.invYesProb) {
_plInviteAnswerYes(v, t);
} else if (r < cfg.invYesProb + cfg.invLaterProb) {
v.status = 'later';
save();
const sayLater = _plPickSay(_plSayPool(v.trackId ? PL_SAY_NAMES.later : PL_SAY_NAMES.laterAny), v.id);
if (sayLater) _deliverToChat({ id: nextId(), from: 'partner', text: sayLater }, v.cid);
_plPatchCo(v);
renderPlayerAll();
showToast(_plName(v.cid) + ' 说等一会儿·过阵子再来');
if (plInvLaterTimers[id]) { clearTimeout(plInvLaterTimers[id]); delete plInvLaterTimers[id]; }
plInvLaterTimers[id] = setTimeout(() => {
delete plInvLaterTimers[id];
const v2 = (_plRoot().invites || []).find(x => x && x.id === id);
if (!v2 || v2.status !== 'later' || !v2.manual) return;
const t2 = v2.trackId ? plById(v2.trackId) : null;
if (v2.trackId && !t2) return;
_plInviteAnswerYes(v2, t2, t2 ? '好啦·来听《' + t2.name + '》啦' : '好啦·来陪你听啦');
}, 40000 + Math.floor(Math.random() * 40000));
} else {
v.status = 'no';
save();
const sayNo = _plPickSay(_plSayPool(v.trackId ? PL_SAY_NAMES.no : PL_SAY_NAMES.noAny), v.id);
if (sayNo) _deliverToChat({ id: nextId(), from: 'partner', text: sayNo }, v.cid);
_plPatchCo(v);
renderPlayerAll();
showToast(v.trackId ? _plName(v.cid) + ' 没答应这首·歌还在你手上' : _plName(v.cid) + ' 这回没答应一起听');
}
}, wait);
}
function _plReserve(cid, t) {
const p = _plRoot();
if (!Array.isArray(p.queue)) p.queue = [];
const qi = p.queue.indexOf(t.id);
if (qi >= 0) p.queue.splice(qi, 1);
p.queue.unshift(t.id);
save();
_plChatNote(cid, { id: nextId(), from: 'system', text: _plName(cid) + ' 预订了下一首：《' + t.name + '》' });
renderPlayerAll();
}
function plTaAutoAction() {
const p0 = _plRoot();
const cid = p0.randBy === 'ta' ? _plRandTaCid() : _plWith();
if (!cid) return false;
const cfg = _plCfg(cid), list = plTracks().filter(plPlayable);
if (list.length < 2) return false;
const cur = _plRoot().current;
const pNext = cfg.taNextProb, pRand = cfg.taRandProb, pMode = cfg.taModeProb;
const r = Math.random() * 100;
if (r < pNext) {
const others = list.filter(x => x.id !== cur);
const t = others[Math.floor(Math.random() * others.length)]; if (!t) return false;
_plChatNote(cid, { id: nextId(), from: 'system', text: _plName(cid) + ' 切到了《' + t.name + '》' });
plLoad(t); return true;
}
if (r < pNext + pRand) {
const t = list[Math.floor(Math.random() * list.length)]; if (!t) return false;
_plChatNote(cid, { id: nextId(), from: 'system', text: _plName(cid) + ' 随机挑了《' + t.name + '》' });
plLoad(t); return true;
}
if (r < pNext + pRand + pMode) {
plCycleMode();
_plChatNote(cid, { id: nextId(), from: 'system', text: _plName(cid) + ' 把播放换成了' + (PL_MODE_NAME[_plRoot().mode] || '顺序') });
plNext(false, true);
return true;
}
return false;
}
function _plMask(id, on) {
['plAskMask', 'plAddMask', 'plSetMask', 'plMenuMask', 'plLrcMask', 'plNcmMask', 'plQueueMask', 'plSleepMask', 'plListsMask', 'plPickMask'].forEach(m => { const el = document.getElementById(m); if (el && m !== id) el.hidden = true; });
const el = document.getElementById(id); if (el) el.hidden = !on;
if (!on && (id === 'plPickMask' || id === '')) plPickFrom = '';
if (!on && (id === 'plLrcMask' || id === '')) plLrcSheetId = '';
}
function openPlayerInvite(id) {
const v = plInviteOf(id);
if (!v) { showToast('这条邀请已经不在了'); return; }
plInvite = v.id;
_plInvitePanel(v);
_plMask('plAskMask', true);
}
function closePlayerInvite() { plInvite = null; _plMask('plAskMask', false); }
function _plModeSvg(mode) {
const p = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
if (mode === 'shuffle') return '<svg viewBox="0 0 24 24" ' + p + '><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>';
if (mode === 'loopOne') return '<svg viewBox="0 0 24 24" ' + p + '><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>';
return '<svg viewBox="0 0 24 24" ' + p + '><path d="M4 6h11M4 12h7M4 18h11"/><path d="M17.5 13.2v4.6l4-2.3z" fill="currentColor" stroke="none"/></svg>';
}
function openPlayerQueue() { renderPlayerQueue(); _plMask('plQueueMask', true); }
function closePlayerQueue() { _plMask('plQueueMask', false); }
function renderPlayerQueue() {
const box = document.getElementById('plQueueBody'); if (!box) return;
_plLazy();
const p = _plRoot(), cur = plCur();
const q = (Array.isArray(p.queue) ? p.queue : []).map(plById).filter(Boolean);
const row = (t, now) => '<div class="pl-q-row' + (now ? ' now' : '') + '" data-pl-qid="' + escapeHTML(t.id) + '">' +
(now ? '' : '<button type="button" class="pl-q-grip" aria-label="按住拖动排序"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="5.5" r="1.7"/><circle cx="15" cy="5.5" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18.5" r="1.7"/><circle cx="15" cy="18.5" r="1.7"/></svg></button>') +
_plCovHTML(t.pic) +
'<span class="pl-tx"><span class="pl-nm">' + escapeHTML(t.name) + '</span>' +
'<span class="pl-ar">' + escapeHTML((t.artist ? t.artist + ' · ' : '') + _plSrcLabel(t) + (t.dur ? ' · ' + _plDur(t.dur) : '')) + '</span></span>' +
(now ? '<span class="pl-q-tag">正在播</span>'
: '<button type="button" class="pl-q-mv" data-pl-qmove="up" data-pl-qid="' + escapeHTML(t.id) + '" aria-label="上移">↑</button>' +
'<button type="button" class="pl-q-mv" data-pl-qmove="down" data-pl-qid="' + escapeHTML(t.id) + '" aria-label="下移">↓</button>' +
'<button type="button" class="pl-q-del" data-pl-qdel="' + escapeHTML(t.id) + '" aria-label="从队列里拿掉">×</button>') +
'</div>';
let html = cur ? row(cur, true) : '<div class="pl-empty"><span>还没在播任何一首</span></div>';
html += q.length ? q.map(t => row(t, false)).join('') : '<div class="pl-empty"><span>队列是空的 · 在某一首上点 ⋯ → 「下一首播」就能排进来</span></div>';
html += '<div class="pl-q-acts"><button type="button" class="pl-btn" data-pl-act="qclear"' + (q.length ? '' : ' disabled') + '>清空队列</button></div>';
box.innerHTML = html;
}
function plQueueRemove(id) {
const p = _plRoot();
if (!Array.isArray(p.queue)) return;
p.queue = p.queue.filter(x => x !== id); save();
renderPlayerQueue(); renderPlayerFull();
}
function plQueueMove(id, dir) {
const p = _plRoot();
if (!Array.isArray(p.queue)) return;
const i = p.queue.indexOf(id); if (i < 0) return;
const j = dir === 'up' ? i - 1 : i + 1;
if (j < 0 || j >= p.queue.length) return;
const tmp = p.queue[i]; p.queue[i] = p.queue[j]; p.queue[j] = tmp;
save(); renderPlayerQueue(); renderPlayerFull();
}
function _plQueueDragInit() {
const box = document.getElementById('plQueueBody'); if (!box || box.__qdrag) return;
box.__qdrag = 1;
let drag = null;
box.addEventListener('pointerdown', e => {
const grip = e.target.closest ? e.target.closest('.pl-q-grip') : null;
if (!grip || e.button) return;
const row = grip.closest('.pl-q-row');
if (!row || row.classList.contains('now')) return;
e.preventDefault();
drag = { row: row, pid: e.pointerId, moved: false };
try { grip.setPointerCapture(e.pointerId); } catch (x) {}
row.classList.add('drag');
});
box.addEventListener('pointermove', e => {
if (!drag || e.pointerId !== drag.pid) return;
const rows = Array.prototype.slice.call(box.querySelectorAll('.pl-q-row'));
const t = rows.find(o => { const b = o.getBoundingClientRect(); return e.clientY >= b.top && e.clientY <= b.bottom; });
if (!t || t === drag.row) return;
const tb = t.getBoundingClientRect();
box.insertBefore(drag.row, e.clientY < tb.top + tb.height / 2 ? t : t.nextSibling);
drag.moved = true;
});
const done = e => {
if (!drag || (e.pointerId !== undefined && e.pointerId !== drag.pid)) return;
drag.row.classList.remove('drag');
const moved = drag.moved; drag = null;
const p = _plRoot(), curId = plCur() && plCur().id;
if (!moved) { renderPlayerQueue(); return; }
const ids = Array.prototype.map.call(box.querySelectorAll('.pl-q-row[data-pl-qid]'), el => el.dataset.plQid)
.filter(id => id && id !== curId);
p.queue = ids; save();
renderPlayerQueue(); renderPlayerFull();
};
box.addEventListener('pointerup', done);
box.addEventListener('pointercancel', done);
}
function plQueueClear() {
_plRoot().queue = []; save();
renderPlayerQueue(); renderPlayerFull();
}
function _plSleepGet() { const v = _plRoot().sleepAt; return (typeof v === 'number' && isFinite(v) && v > 0) ? v : 0; }
function _plSleepLeftText() {
const s = Math.max(0, Math.round((_plSleepGet() - Date.now()) / 1000));
return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
}
function _plSleepSet(mins) {
_plRoot().sleepAt = Date.now() + mins * 60000;
_plRoot().sleepEnd = false; _plRoot().sleepEndQ = false;
save(); renderPlayerFull(); renderPlayerSleep();
try { showToast('定时 ' + mins + ' 分钟 · 到点自动暂停'); } catch (e) {}
}
function _plSleepEndSong() {
_plRoot().sleepAt = 0; _plRoot().sleepEnd = true; _plRoot().sleepEndQ = false;
save(); renderPlayerFull(); renderPlayerSleep();
try { showToast('播完这首就停 · 不再往下切'); } catch (e) {}
}
function _plSleepEndQueue() {
_plRoot().sleepAt = 0; _plRoot().sleepEnd = false; _plRoot().sleepEndQ = true;
save(); renderPlayerFull(); renderPlayerSleep();
try { showToast('播完整个队列就停'); } catch (e) {}
}
function _plSleepCancel() {
_plRoot().sleepAt = 0; _plRoot().sleepEnd = false; _plRoot().sleepEndQ = false;
save(); renderPlayerFull(); renderPlayerSleep();
try { showToast('定时已取消'); } catch (e) {}
}
function _plSleepTick() {
const at = _plSleepGet(); if (!at || Date.now() < at) return;
_plRoot().sleepAt = 0; save();
const a = plAudio;
_plWantSet(false);
if (a && !a.paused) { try { a.pause(); } catch (e) {} }
_plMediaSync(plCur(), false);
_plPaint();
try { showToast('定时停止到了 · 已暂停'); } catch (e) {}
}
function openPlayerSleep() { renderPlayerSleep(); _plMask('plSleepMask', true); }
function closePlayerSleep() { _plMask('plSleepMask', false); }
function renderPlayerSleep() {
const box = document.getElementById('plSleepBody'); if (!box) return;
const p = _plRoot();
const on = !!_plSleepGet() || !!p.sleepEnd || !!p.sleepEndQ;
const chip = m => '<button type="button" class="scope-chip" data-pl-sleep="' + m + '">' + m + ' 分钟</button>';
box.innerHTML =
'<div class="pl-set-lab">到点就停<span>只停播放 · 不关页面</span></div>' +
'<div class="pl-sleep-st' + (on ? '' : ' muted') + '">' + (on
? (_plSleepGet() ? '正在计时 · 还有 ' + _plSleepLeftText() + ' 到点'
: (p.sleepEnd ? '播完正在放的这一首就停' : '播完整个队列就停（队列放空那一刻）'))
: '还没设定时 · 到点会自动暂停，并说一声「定时停止到了」') + '</div>' +
'<div class="pl-sleep-opts">' + [15, 30, 45, 60, 90, 120].map(chip).join('') +
'<button type="button" class="scope-chip" data-pl-sleep="end">播完这首</button>' +
'<button type="button" class="scope-chip" data-pl-sleep="qend">播完队列</button></div>' +
(on ? '<div class="pl-q-acts"><button type="button" class="pl-btn" data-pl-act="sleepcancel">取消定时</button></div>' : '') +
'<div class="pl-note">定时只活在播放器里：到点暂停正在放的那首，不会动别的。刷新页面计时照旧算（记的是到点的钟点）。</div>';
}
function _plInvitePanel(v) {
const box = document.getElementById('plAskBody'); if (!box) return;
const t = plById(v.trackId), cur = plCur();
const who = _plName(v.cid);
const nmTx = v.trackId ? (t ? t.name : '这首已经不在了') : '不限歌 · 一起听';
const sameSong = !v.trackId || (cur && cur.id === v.trackId);
const ansTx = { yes: sameSong ? '你在和 TA 一起听' : '一起听过这一首', switch: '你切过去听了', later: '先放一放',
no: (v.trackId ? '这一首没一起听' : '这回没一起听') }[v.status] || '这一条已经答过了';
if (v.status !== 'waiting') {
box.innerHTML = '<div class="pl-ask-hd"><span>' + ansTx + '</span><i>Answered</i></div>' +
'<div class="pl-song">' + _plNoteSvg() + '<span class="pl-tx"><span class="pl-nm">' + escapeHTML(nmTx) + '</span>' +
'<span class="pl-ar">' + escapeHTML(who) + ' 那天起的头 · ' + _plWhen(v.at) + '</span></span></div>' +
(v.mood ? '<div class="pl-mood">' + escapeHTML(v.mood) + '</div>' : '') +
(!v.trackId && !cur ? '<div class="pl-note">还没放歌 · 去曲库挑一首放起来，那就是一起听的这一首。</div>' : '') +
'<div class="pl-note">答过一次就定了，这一条不再改。</div>';
return;
}
const noSong = (v.trackId && !t) ? ' data-pl-ask-dead="1" aria-disabled="true"' : '';
const playing = _plPlayingNow();
const nowTx = (playing && cur && t) ? (cur.id !== t.id ? ' · 你正在播另一首' : ' · 正在播这一首') : '';
box.innerHTML = '<div class="pl-ask-hd"><span>想和你一起听</span><i>Player invite</i></div>' +
'<div class="pl-song">' + _plNoteSvg() + '<span class="pl-tx"><span class="pl-nm">' + escapeHTML(nmTx) + '</span>' +
'<span class="pl-ar">' + escapeHTML(t ? ((t.artist ? t.artist + ' · ' : '') + (t.dur ? _plDur(t.dur) : '')) : '不限歌 · 你放什么 TA 听什么') + '</span>' +
'<span class="pl-ar">' + escapeHTML(who) + escapeHTML(nowTx) + '</span></span></div>' +
(v.mood ? '<div class="pl-mood">' + escapeHTML(v.mood) + '</div>' : '') +
'<div class="pl-acts"><button type="button" class="pl-btn pri" data-pl-ask="yes"' + noSong + '>一起听</button>' +
'<button type="button" class="pl-btn" data-pl-ask="later">先放一放</button></div>' +
'<div class="pl-note">' + (v.trackId
? '「一起听」＝马上切到 ' + escapeHTML(who) + ' 这一首，从现在起曲终那几掷都算在 ' + escapeHTML(who) + ' 名下；「先放一放」不算拒绝也不放歌。这一条记进「记录」。'
: '这一条不带歌：' + escapeHTML(who) + ' 只是想陪你听——「一起听」＝从现在起曲终那几掷算在 TA 名下，不替你挑歌也不切歌。') + '</div>';
}
function _plAvStackHTML(mine, mineName, other, otherName, ghost) {
const one = (src, nm) => '<i class="pl-av">' +
(src ? '<span class="av-tx">' + escapeHTML(String(nm || '我').trim().slice(0, 1) || '我') + '</span><img src="' + escapeHTML(src) + '" alt="" loading="lazy" decoding="async" onload="this.dataset.ok=1" onerror="this.remove()">' : escapeHTML(String(nm || '我').trim().slice(0, 1) || '我')) + '</i>';
return '<span class="pl-avs">' +
((other || otherName) ? one(other, otherName) : (ghost ? '<i class="pl-av gh">' + escapeHTML(ghost) + '</i>' : '')) +
one(mine, mineName) + '</span>';
}
function openPlayerInviteFor(id) {
const t = plById(id || _plRoot().current);
if (!_plSingles().length) { showToast('还没有可邀的人·先在首页加一位联系人'); return; }
plMenu = t ? t.id : '';
plInviteAny = !t;
plInvitePick();
_plMask('plMenuMask', true);
}
function _plSheetTitle(ti) {
const el = document.querySelector('#plMenuMask .fs-sheet-ti');
if (el) el.textContent = ti;
}
function _plNoteSvg() {
return '<span class="pl-cv"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></span>';
}
function plAnswerInvite(kind) {
const v = plInvite && plInviteOf(plInvite);
if (!v || v.status !== 'waiting') {
showToast('这一条已经答过了');
closePlayerInvite(); renderPlayerAll();
return;
}
const t = v.trackId ? plById(v.trackId) : null;
if (kind === 'yes' || kind === 'switch') {
if (v.trackId && !t) { showToast('这首已经不在曲库里了·没法一起听'); return; }
_plRoot().withCid = v.cid;
_plRoot().coOff = false;
if (!t) {
plState.tab = 'lib';
if (document.body.dataset.view === 'player') renderPlayerPage();
showToast(_plRoot().current ? '已和' + _plName(v.cid) + '一起听 · 你正在放的这首就是'
: '已和' + _plName(v.cid) + '一起听 · 打开播放器挑一首就一起放');
} else if (_plRoot().current !== t.id) {
_plPosDrop(t.id); const ok = plLoad(t);
if (!ok) showToast('这首没放出来·一起听还挂着，但先没有声音');
else if (t.src === 'ncm' && _plNcmCookie()) showToast('正在取《' + t.name + '》的地址…');
else showToast('已和' + _plName(v.cid) + '一起听《' + t.name + '》');
if (ok) plFloatShow();
} else if (!_plPlayingNow()) {
plReplay();
showToast('已和' + _plName(v.cid) + '一起听 · 这首从头放');
plFloatShow();
} else {
showToast('已和' + _plName(v.cid) + '一起听 · 正在放这首');
plFloatShow();
}
}
v.status = kind;
save();
try {
const ansName = (kind === 'yes' || kind === 'switch')
? (v.trackId ? PL_SAY_NAMES.ansYes : PL_SAY_NAMES.ansYesAny)
: (kind === 'later' ? (v.trackId ? PL_SAY_NAMES.ansLater : PL_SAY_NAMES.ansLaterAny) : '');
const say = ansName ? _plPickSayRand(_plSayPool(ansName)) : '';
if (say) _deliverToChat({ id: nextId(), from: 'partner', text: say }, v.cid);
} catch (e) {}
_plPatchCo(v);
closePlayerInvite();
renderPlayerAll();
}
function _plAddToChipsHTML() {
const lists = Array.isArray(_plRoot().playlists) ? _plRoot().playlists : [];
if (plState.addTo && !lists.some(l => l.id === plState.addTo)) plState.addTo = '';
const chip = (id, name) => '<button type="button" class="scope-chip' + (String(plState.addTo || '') === id ? ' on' : '') +
'" data-pl-addto="' + escapeHTML(id) + '">' + escapeHTML(name) + '</button>';
return chip('', '只进曲库') + lists.map(l => chip(l.id, l.name)).join('') +
'<button type="button" class="scope-chip pl-add-new" data-pl-addnew="1">＋ 新建</button>';
}
function _plAddToPaint() {
const box = document.getElementById('plAddToChips');
if (box) box.innerHTML = _plAddToChipsHTML();
}
function _plAddToTarget(ids) {
const pid = String(plState.addTo || '');
if (!pid || !Array.isArray(ids) || !ids.length) return;
const l = _plListOf(pid); if (!l) return;
if (!Array.isArray(l.trackIds)) l.trackIds = [];
let added = 0;
ids.forEach(id => { if (id && l.trackIds.indexOf(id) < 0) { l.trackIds.push(id); added++; } });
if (added) { save(); try { showToast('顺手收进《' + l.name + '》' + added + ' 首'); } catch (e) {} }
}
function openPlayerAdd() {
const box = document.getElementById('plAddBody');
if (box) box.innerHTML =
'<button type="button" class="pl-addfile" data-pl-act="file">' +
'<span class="pl-addfile-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></svg></span>' +
'<span class="pl-tx"><b>从这台设备选音频文件</b><small>手机或电脑里的歌 · 字节存在本机、不进备份 · 一次最多 100 个 · 曲库里已有的会跳过</small></span>' +
'<span class="pl-chev">›</span>' +
'</button>' +
'<div class="pl-set-lab">贴一条链接<span>网易云歌单/单曲 ∶ 纯数字号码 ∶ 音频直链</span></div>' +
'<textarea class="pl-in" id="plPaste" rows="3" spellcheck="false" placeholder="想一次导入整个网易云歌单：在 App/网页里点「分享→复制链接」，把那条 music.163.com 的完整歌单链接贴这里（一行一条，可一次贴好几条）"></textarea>' +
'<div class="pl-acts"><button type="button" class="pl-btn pri" data-pl-act="paste">识别并添加</button></div>' +
'<div class="pl-set-lab">收进哪个歌单<span>默认只进曲库·可选</span></div>' +
'<div class="pl-chips" id="plAddToChips">' + _plAddToChipsHTML() + '</div>' +
'<div class="pl-add-log" id="plAddLog"></div>' +
'<div class="pl-note">认得出∶收进来∶取不到，每一行都写在下面这一栏里——不悄悄丢掉任何一条。<br>'
+ '链接这一路取的是免费音质：网易云付费与 VIP 那部分要登录网易云才放得开。<br>'
+ '没登录时这一单会先量一遍（一首一问），量出放不出的会员歌曲会问一句要不要去掉。</div>';
_plMask('plAddMask', true);
}
function closePlayerAdd() { _plMask('plAddMask', false); }
function _plGuess(line) {
const s = String(line || '').trim();
if (!s) return null;
if (/163cn\.tv/i.test(s)) return { kind: 'no', why: '这是网易云的短链接·要再跳一次才拿得到号码，请打开它之后把地址栏那条完整链接贴进来' };
if (/163\.com|netease/i.test(s) || /^\d{4,13}$/.test(s)) {
const m = s.match(/playlist[\/?#&!=]*(?:id=)?(\d{4,})/i) || s.match(/[?&]id=(\d{4,})/) || s.match(/\/(?:song|playlist)\/(\d{4,})/i);
const id = m ? m[1] : (/^\d{4,13}$/.test(s) ? s : '');
if (!id) return { kind: 'no', why: '网易云链接里没找到号码（歌单或单曲的完整地址都行）' };
if (/album/i.test(s)) return { kind: 'no', why: '网易云专辑这一类取不到（公开接口只认歌单与单曲）·换成歌单或单曲的链接就行' };
return { kind: 'ncm', id, as: /playlist/i.test(s) ? 'list' : 'song' };
}
if (/y\.qq\.com|qqmusic|c\.y\.qq\.com/i.test(s)) return { kind: 'no', why: 'QQ 音乐已下线（登录一直不成功·功能已删除）·换成网易云链接或音频直链' };
return /^https?:\/\//i.test(s) ? { kind: 'url', id: s } : { kind: 'no', why: '认不出这一行（网易云歌单∶单曲∶纯数字号码∶音频直链，一行一条）' };
}
function _plHash(s) {
let h = 0; const x = String(s);
for (let i = 0; i < x.length; i++) h = (h * 31 + x.charCodeAt(i)) | 0;
return Math.abs(h).toString(36);
}
function _plFetchText(url, ms) {
return new Promise(resolve => {
let done = false;
const fin = () => { if (!done) { done = true; clearTimeout(timer); resolve(''); } };
let controller = null; try { controller = new AbortController(); } catch (e) {}
const timer = setTimeout(() => { try { controller && controller.abort(); } catch (e) {} fin(); }, ms || 14000);
fetch(url, controller ? { signal: controller.signal } : undefined)
.then(r => (r && r.ok) ? r.text() : '')
.then(t => { if (!done) { done = true; clearTimeout(timer); resolve(typeof t === 'string' ? t : ''); } })
.catch(fin);
});
}
function _plFetchTextFresh(url, ms) {
const s = String(url || '');
const u = s + (s.indexOf('?') >= 0 ? '&' : '?') + '_t=' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
return new Promise(resolve => {
let done = false;
const fin = () => { if (!done) { done = true; clearTimeout(timer); resolve(''); } };
let controller = null; try { controller = new AbortController(); } catch (e) {}
const timer = setTimeout(() => { try { controller && controller.abort(); } catch (e) {} fin(); }, ms || 14000);
fetch(u, controller ? { signal: controller.signal, cache: 'no-store' } : { cache: 'no-store' })
.then(r => (r && r.ok) ? r.text() : '')
.then(t => { if (!done) { done = true; clearTimeout(timer); resolve(typeof t === 'string' ? t : ''); } })
.catch(fin);
});
}
function _plMetingList(txt) {
let j = null; try { j = JSON.parse(String(txt || '')); } catch (e) { return []; }
if (!Array.isArray(j)) j = (j && typeof j === 'object') ? [j] : [];
return j.map(t => {
if (!t || typeof t !== 'object') return null;
const m = String(t.url || '').match(/[?&]id=(\d{4,})/);
const nid = m ? m[1] : String(t.id || '');
if (!/^\d+$/.test(nid)) return null;
return { nid, name: String(t.name || t.title || '').trim(), artist: String(t.artist || t.author || '').trim(), pic: _plPicFix(String(t.pic || t.cover || '')) };
}).filter(Boolean);
}
async function _plMetingSongs(type, id) {
for (let h = 0; h < PL_NCM_METING.length; h++) {
const rows = _plMetingList(await _plFetchText(PL_NCM_METING[h] + '?server=netease&type=' + type + '&id=' + encodeURIComponent(String(id)), 9000));
if (rows.length) return rows;
}
return [];
}
var PL_NCM_FULL_MIN = 800000;
var PL_NCM_VIP_MS = 6000;
var PL_NCM_VIP_RUNS = 4;
var PL_NCM_VIP_MAX = 300;
var plVipKnown = {};
var plVipBusy = false;
var plVipSay = '';
function _plNcmHead(url, ms) {
return new Promise(resolve => {
let done = false;
const fin = r => { if (!done) { done = true; clearTimeout(timer); resolve(r); } };
let controller = null; try { controller = new AbortController(); } catch (e) {}
const timer = setTimeout(() => { try { controller && controller.abort(); } catch (e) {} fin({ st: 0, bytes: 0 }); }, ms || PL_NCM_VIP_MS);
const o = controller ? { method: 'HEAD', signal: controller.signal } : { method: 'HEAD' };
fetch(url, o)
.then(r => fin({ st: (r && Number(r.status)) || 0,
bytes: (r && r.headers && typeof r.headers.get === 'function') ? (Number(r.headers.get('content-length')) || 0) : 0 }))
.catch(() => fin({ st: 0, bytes: 0 }));
});
}
async function _plNcmVipOne(nid) {
let answered = 0;
for (let i = 0; i < PL_NCM_URL_BASES.length; i++) {
const r = await _plNcmHead(_plNcmUrl(nid, i));
if (!r.bytes) continue;
answered++;
if (r.bytes >= PL_NCM_FULL_MIN) { plVipKnown[nid] = 0; return 0; }
}
const v = answered ? 1 : -1;
if (v === 1) plVipKnown[nid] = 1;
return v;
}
function _plVipScan(nids, onEach) {
const list = (nids || []).filter(Boolean).filter(nid => plVipKnown[nid] === undefined);
const bump = () => { if (typeof onEach === 'function') { try { onEach(); } catch (e) {} } };
if (!list.length || plVipBusy) return Promise.resolve().then(() => { bump(); });
plVipBusy = true; plVipSay = '正在看哪几首是会员歌曲 · 0/' + list.length;
try { _plSubPaint(); } catch (e) {}
return new Promise(resolve => {
let i = 0, live = 0, done = 0;
const step = () => {
if (i < list.length) {
const nid = list[i++]; live++;
Promise.resolve(_plNcmVipOne(nid)).then(() => { done++; bump(); }).catch(() => {}).then(() => {
live--;
try { plVipSay = '正在看哪几首是会员歌曲 · ' + done + '/' + list.length; _plSubPaint(); } catch (e) {}
step();
});
return;
}
if (!live) { plVipBusy = false; plVipSay = ''; try { _plSubPaint(); } catch (e) {} resolve(); }
};
for (let k = 0; k < Math.min(PL_NCM_VIP_RUNS, list.length); k++) step();
});
}
function _plIsVipTrack(t) { return !!t && t.src === 'ncm' && Number(t.vip) === 1 && !_plNcmCookie(); }
function _plRandNoVip() { return !!_plRoot().randNoVip; }
function _plVipSkippable(nid) { return _plRandNoVip() && !_plNcmCookie() && plVipKnown[String(nid)] === 1; }
function _plVipTodo() {
return plTracks().filter(t => t && t.src === 'ncm' && t.nid && plVipKnown[t.nid] === undefined).slice(0, PL_NCM_VIP_MAX).map(t => t.nid);
}
function _plNcmVipGate(songs, onEach) {
const list = (songs || []).filter(s => s && s.nid && !plById('ncm' + s.nid));
if (!list.length || _plNcmCookie() || plVipBusy) return Promise.resolve();
const ask = list.slice(0, PL_NCM_VIP_MAX);
return _plVipScan(ask.map(s => String(s.nid)), onEach).then(() => {
const vip = list.filter(s => plVipKnown[String(s.nid)] === 1);
if (!vip.length) return;
return new Promise(go => {
let fin = false;
const once = () => { if (fin) return; fin = true; go(); };
const more = list.length > ask.length ? '\n这一趟只量了前 ' + ask.length + ' 首·其余 ' + (list.length - ask.length) + ' 首下次再量。' : '';
window.openModal('这一单里有 ' + vip.length + ' 首是会员歌曲', '', () => {
const set = {}; vip.forEach(s => { set[String(s.nid)] = 1; });
(songs || []).forEach(s => { if (s && set[String(s.nid)]) s.drop = 1; });
once();
}, {
noInput: true, okText: '去掉这 ' + vip.length + ' 首',
staticText: '没登录网易云·这几首要会员才听得了：能用的那几台接口要么只给 30 秒试听，要么压根不给声音。\n'
+ '去掉＝这一批不收进曲库；点「取消」＝都留着，曲库里那一行会挂一枚「会员」小标。'
+ '\n要听完整版得有一台答话的接口（登录只给票据·接口才是干活的那台）：音源 → 「怎么弄一台自己的接口」。' + more,
onCancel: once
});
});
});
}
function plNcmVipDrop() {
if (plVipBusy) { showToast('正在看上一批·看完这就来'); return; }
if (_plNcmCookie()) { showToast('登录了网易云·会员歌取的是完整版·不用清'); return; }
const pool = plTracks().filter(t => t && t.src === 'ncm' && t.nid);
if (!pool.length) { showToast('曲库里没有网易云的歌'); return; }
const known = () => pool.filter(t => Number(t.vip) === 1 || plVipKnown[t.nid] === 1);
const todo = _plVipTodo();
const ask = () => {
const ids = known().map(t => t.id);
if (!ids.length) { showToast('查过了·这一本里没有放不出的会员歌曲'); return; }
const left = pool.filter(t => plVipKnown[t.nid] === undefined).length;
window.openModal('去掉这 ' + ids.length + ' 首会员歌曲？', '', () => {
plRemoveTracks(ids);
showToast('已去掉 ' + ids.length + ' 首' + (left ? '·这一本还剩 ' + left + ' 首没量' : ''));
}, {
noInput: true, okText: '去掉这 ' + ids.length + ' 首', danger: true,
staticText: '这几首要网易云会员才放得开·没登录要么只给 30 秒试听，要么压根不给声音。\n'
+ '删掉＝曲库∶各本歌单∶收藏里一起摘掉，这一步找不回；想再收回来重新贴一次链接就行。'
+ (left ? '\n这一趟只量了 ' + (pool.length - left) + ' 首·还有 ' + left + ' 首没量到（再按一次接着量）。' : '')
});
};
if (!todo.length) { ask(); return; }
_plVipScan(todo).then(() => {
pool.forEach(t => { if (plVipKnown[t.nid] === 1) t.vip = 1; else if (plVipKnown[t.nid] === 0) t.vip = 0; });
save(); renderPlayerPage(); ask();
});
}
async function plAddPaste(text) {
const log = document.getElementById('plAddLog');
const btn = document.querySelector('#plAddMask [data-pl-act="paste"]');
const lines = String(text || '').split(/\r?\n/).map(s => String(s).trim()).filter(Boolean);
const row = msg => { if (!log) return null; const d = document.createElement('div'); d.textContent = msg; log.appendChild(d); return d; };
const say = (d, msg, bad) => { if (!d) return; d.textContent = msg; if (bad) d.className = 'bad'; };
if (!lines.length) { row('先贴一条链接，再按「识别并添加」'); return; }
if (btn) { btn.disabled = true; btn.textContent = '正在取…'; }
let added = 0;
const newIds = [];
for (let i = 0; i < lines.length; i++) {
const g = _plGuess(lines[i]);
let head = '在看这一行…';
if (g && g.kind === 'ncm') head = (g.as === 'list' ? '网易云歌单 ' : '网易云单曲 ') + g.id + ' · 正在取清单';
const d = row(head);
if (!g || g.kind === 'no') { say(d, g && g.why ? g.why : '认不出这一行', true); continue; }
if (g.kind === 'ncm') {
let songs = _plNcmApi() ? await _plNcmList(g) : [];
if (!songs.length) songs = await _plMetingSongs(g.as === 'list' ? 'playlist' : 'song', g.id);
let got = 0, dup = 0, dropped = 0;
await _plNcmVipGate(songs, () => { if (d && plVipSay) d.textContent = plVipSay; });
songs.forEach(s => {
if (s && s.drop) { dropped++; return; }
const id = 'ncm' + s.nid;
if (plById(id)) { dup++; return; }
got++; added++; newIds.push(id);
_plPushTrack({ id, nid: s.nid, name: s.name || ('网易云 ' + s.nid), artist: s.artist, src: 'ncm', dur: Number(s.dur) || 0, pic: s.pic || '',
vip: plVipKnown[String(s.nid)] === 1 ? 1 : 0, added: Date.now() });
});
say(d, got ? '收了 ' + got + ' 首' + (dup ? '·' + dup + ' 首已经有了' : '') + (dropped ? '·去掉 ' + dropped + ' 首会员歌曲' : '')
: songs.length ? (dropped ? '放不出的 ' + dropped + ' 首去掉了·其余都已经在歌单里' : '这一单里的歌都在这个歌单里了')
: '没取到清单（公开接口那两台都没答上，或那一单是私有的）', !got && !songs.length);
continue;
}
const lid = 'lk' + _plHash(g.id);
if (plById(lid)) { say(d, '这条直链已经在了'); continue; }
_plPushTrack({ id: lid, name: decodeURIComponent((g.id.split('/').pop() || '未命名').split('?')[0]).slice(0, 60) || '未命名',
artist: '', src: g.id, dur: 0, added: Date.now() });
added++; newIds.push(lid); say(d, '收了（直链）');
}
_plAddToTarget(newIds);
if (btn) { btn.disabled = false; btn.textContent = '识别并添加'; }
renderPlayerAll();
}
function openPlayerSettings(cid) {
if (cid) plState.perm = cid;
if (!plState.perm) plState.perm = '__base';
renderPlayerSettings();
_plNcmSyncProfile(false).then(() => renderPlayerSettings());
_plMask('plSetMask', true);
}
function closePlayerSettings() { _plMask('plSetMask', false); }
function renderPlayerSettings() {
const box = document.getElementById('plSetBody'); if (!box) return;
const who = plState.perm || '__base';
const permChips = [['__base', '默认']].concat(_plSingles().map(c => [c.id, fixedNameOf(c) || c.name || c.id]))
.map(x => '<button type="button" class="scope-chip' + (who === x[0] ? ' on' : '') + '" data-pl-permwho="' + escapeHTML(x[0]) + '">' + escapeHTML(x[1]) + '</button>').join('');
const cfg = who === '__base' ? _plClampPerms(Object.assign({}, _plRoot().settings)) : _plCfg(who);
const own = who !== '__base' && !!((data.playerBy || {})[who]);
const curCo = _plRoot().withCid || '';
const coChips = _plSingles().map(c => [c.id, fixedNameOf(c) || c.name || c.id])
.concat([['', '一个人听']])
.map(x => '<button type="button" class="scope-chip' + (curCo === x[0] ? ' on' : '') + '" data-pl-co-who="' + escapeHTML(x[0]) + '">' + escapeHTML(x[1]) + '</button>').join('');
const coNote = curCo
? _plName(curCo) + ' 在陪你听 · 听歌默认就和 TA 一起听，不会自己结束。想换人点上面的名字；想一个人听，点「一个人听」。'
: '现在一个人听 · 想找回陪伴就点上面任一位；下次开播也不会自己回来。';
const qName = { '': '自动（尽量无损）', exhigh: '高音质 320k', standard: '省流量 128k' }[String(_plRoot().ncmQuality || '')] || '自动（尽量无损）';
const tab = PL_SET_TABS.some(x => x[0] === plState.setTab) ? plState.setTab : 'companion';
const tabs = '<div class="stats-tabs pl-set-tabs" id="plSetTabs" role="tablist">' +
PL_SET_TABS.map(x => '<button type="button" class="stats-tab' + (tab === x[0] ? ' active' : '') +
'" data-pl-settab="' + x[0] + '" role="tab" aria-selected="' + (tab === x[0] ? 'true' : 'false') + '">' + x[1] + '</button>').join('') +
'</div>';
const panels = {
companion: '<div class="pl-set-lab">陪着听<span>全局一份·听歌默认就在一起</span></div>' +
'<div class="pl-chips pl-set-chips">' + coChips + '</div>' +
'<div class="pl-set-note">' + escapeHTML(coNote) + '</div>' +
'<div class="pl-set-note">今日一起听 ' + escapeHTML(plDurText(plListenStat().todayCo)) +
' · 累计 ' + escapeHTML(plDurText(plListenStat().totalCo)) + '（在「一起听」那一格看近 7 天）。</div>',
perms: '<div class="pl-set-lab">TA 的行为<span>' +
(who === '__base' ? '按人各存·没调过的人用「默认」' : '正在改「' + fixedNameOf((data.contacts || []).find(c => c && c.id === who)) + '」自己那套') +
'</span></div>' +
'<div class="pl-chips pl-set-chips">' + permChips + '</div>' +
PL_GRP.map(g => {
const rows = PL_PERMS.filter(p => p.g === g[0]);
if (!rows.length) return '';
return '<div class="pl-set-lab">' + g[1] + '<span>' + g[2] + '</span></div>' +
(g[0] === 'invrep' ? _plInvRatio(cfg) : '') +
rows.map(p => _plPermRow(p, cfg[p.k], own)).join('');
}).join('') +
'<div class="pl-set-lab">TA 自己的邀请<span>全局一份·低频随机·不打断正在放的这首</span></div>' +
'<label class="pl-perm pl-perm-sw"><span class="pl-perm-t"><b>让 TA 偶尔推歌来邀你一起听</b>' +
'<small>曲库空着也可以——TA 会去公开的网易云接口找一首放得出整曲的歌，收进曲库并把「一起听」卡片送到你们那一本聊天。' +
'卡片只等你自己按；每位 TA 约 2~4 小时最多邀一次。关掉＝这条钟整条不掷，已经送出的卡不受影响。</small></span>' +
'<input type="checkbox" class="pl-perm-in" id="plTaInviteIn"' + (_plTaInviteOn() ? ' checked' : '') + '></label>' +
'<details class="set-adv" data-pl-dt="chatnote"><summary>聊天里说一声 · 按人调</summary>' +
'<div class="pl-set-lab">聊天里说一声<span>这一格管的是「吭不吭声」，不是「做不做」</span></div>' +
PL_PERMS.filter(p => p.sec === 'chat').map(p => _plPermRow(p, cfg[p.k], own)).join('') + '</details>',
play: '<div class="pl-set-lab">播放<span>全局一份·与按人无关</span></div>' +
'<div class="pl-set-lab">音质<span>只对网易云在线源生效</span></div>' +
'<details class="set-adv" data-pl-dt="quality"><summary>现在是「' + escapeHTML(qName) + '」</summary>' +
'<div class="pl-chips pl-set-chips">' + [['', '自动（尽量无损）'], ['exhigh', '高音质 320k'], ['standard', '省流量 128k']].map(x =>
'<button type="button" class="scope-chip' + (String(_plRoot().ncmQuality || '') === x[0] ? ' on' : '') + '" data-pl-quality="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
'<div class="pl-set-note">自动＝登录后先要无损、拿不到再退 320k／128k；未登录一律从 320k 起。本机文件与直链不受这一格影响。</div></details>' +
'<div class="pl-set-lab">声道<span>本机文件与在线源各有一档</span></div>' +
'<label class="pl-perm pl-perm-sw"><span class="pl-perm-t"><b>不抢其他 App 的声音</b><small>本机上传的歌走混音通道，播放时不挤掉你在听的音乐/视频；切到后台会自动换成媒体通道把它接着放完（系统在后台会挂起混音通道，不换就听不见了），回前台再换回来。在线音源受浏览器限制做不到，播放时仍会占用音频通道、暂停其他 App</small></span>' +
'<input type="checkbox" class="pl-perm-in" data-pl-noduck' + (plNoDuckOn() ? ' checked' : '') + '></label>' +
'<div class="pl-set-note">音量条在整屏播放页底排的「音量」里：点一下就在进度条上方展开。默认收起是为了屏上只留一条横向轴线（进度）。电脑上还可以用空格播放/暂停、← → 各退/进 5 秒。</div>',
account: '<div class="pl-set-lab">账号与自检<span>全局一份·与按人无关</span></div>' +
'<div class="pl-set-row" data-pl-act="gosource"><span class="pl-tx"><b>网易云音乐</b><small>' +
(_plNcmLogged() ? '已登录' + (_plNcmName() ? '（' + escapeHTML(_plNcmName()) + '）' : '') : '未登录') +
'·登录与接口地址都在「音源」那一页管</small></span><span class="pl-chev">›</span></div>' +
'<div class="pl-set-row" data-pl-act="lyricdiag"><span class="pl-tx"><b>歌词与摘句 · 现场查</b><small>' +
(plDiagBusy ? '正在查（最多等十来秒）…' : (plDiagAt ? '查过了 · 再点一次重查（换网络／填好接口地址后照这个看变化）' : '问一遍每一路歌词接口，并把这一首与摘一句那几项设置一起念出来')) +
'</small></span><span class="pl-chev">' + (plDiagBusy ? '…' : '查') + '</span></div>' +
(plDiagRows ? '<div class="pl-diag">' + plDiagRows.map(r =>
'<div class="pl-diag-row"><b>' + escapeHTML(r.label) + '</b><span>' + escapeHTML(r.val) + '</span></div>').join('') + '</div>' : ''),
more: '<div class="pl-set-lab">危险区<span>清了找不回</span></div>' +
'<div class="pl-set-row danger" data-pl-act="wipe"><span class="pl-tx"><b>清空曲库</b><small>歌单与收藏一起清·正在播的会停下' +
(plDelConfirm ? ' —— 再点一次就清' : '') + '</small></span><span class="pl-chev">' + (plDelConfirm ? '确认' : '›') + '</span></div>'
};
box.innerHTML = tabs + PL_SET_TABS.map(x => '<div class="pl-set-panel" data-pl-setpane="' + x[0] + '"' +
(tab === x[0] ? '' : ' hidden') + '>' + panels[x[0]] + '</div>').join('');
}
function _plInvRatio(cfg) {
const seg = [['答应', Number(cfg.invYesProb) || 0], ['等一会儿', Number(cfg.invLaterProb) || 0], ['拒绝', Number(cfg.invNoProb) || 0]];
const sum = seg[0][1] + seg[1][1] + seg[2][1];
return '<div class="pl-ratio" aria-hidden="true">' + seg.map((s, i) =>
'<i data-i="' + i + '"' + (sum && s[1] ? ' style="width:' + Math.max(4, Math.round(s[1] / sum * 100)) + '%"' : '') + '></i>').join('') + '</div>' +
'<div class="pl-ratio-lg">' + (sum
? seg.map(s => s[0] + ' ' + s[1]).join(' ∶ ')
: taLabel('三档都是 0＝TA 一律拒绝·想让他搭理就抬一格', _plTaCid())) + '</div>';
}
function _plTaCid() {
const w = (typeof plState !== 'undefined' && plState && plState.perm) || '';
return (w && w !== '__base') ? w : '';
}
function _plPermRow(p, v, own) {
const val = p.bool ? (v ? 1 : 0) : Number(v);
const tag = p.bool ? 'label' : 'div';
return '<' + tag + ' class="pl-perm' + (p.bool ? ' pl-perm-sw' : '') + '" data-pl-perm="' + p.k + '">' +
'<span class="pl-perm-t"><b>' + escapeHTML(p.t) + '</b>' + (own ? '<em>已单独设过</em>' : '') + '<small>' + escapeHTML(taLabel(p.hint, _plTaCid())) + '</small></span>' +
(p.bool
? '<input type="checkbox" class="pl-perm-in" data-pl-perm-in="' + p.k + '"' + (val ? ' checked' : '') + '>'
: '<span class="pl-num"><button type="button" class="stp-min" data-pl-step="-1" aria-label="调小">−</button>' +
'<input type="text" inputmode="numeric" class="pl-num-in" data-pl-perm-in="' + p.k + '" value="' + val + '" min="' + p.min + '" max="' + p.max + '" step="1">' +
'<button type="button" class="stp-max" data-pl-step="1" aria-label="调大">+</button>' +
(p.u ? '<em>' + escapeHTML(p.u) + '</em>' : '') + '</span>') + '</' + tag + '>';
}
function _plPermWrite(k, v) {
const who = plState.perm || '__base';
const patch = {}; patch[k] = v;
if (who === '__base') { Object.assign(_plRoot().settings, patch); _plClampPerms(_plRoot().settings); save(); }
else _plCfgSet(who, patch);
renderPlayerSettings();
renderPlayerAll();
}
function openPlayerMenu(id) {
const t = plById(id); if (!t) return;
const p = _plRoot();
const faved = Array.isArray(p.favs) && p.favs.indexOf(id) >= 0;
const lists = Array.isArray(p.playlists) ? p.playlists : [];
const box = document.getElementById('plMenuBody'); if (!box) return;
plMenu = id;
plInviteAny = false;
_plSheetTitle('这一首');
box.innerHTML = '<div class="pl-song">' + _plNoteSvg() + '<span class="pl-tx"><span class="pl-nm">' + escapeHTML(t.name) + '</span>' +
'<span class="pl-ar">' + escapeHTML((t.artist ? t.artist + ' · ' : '') + _plSrcLabel(t) + (t.dur ? ' · ' + _plDur(t.dur) : '')) + '</span></span></div>' +
'<div class="pl-set-row" data-pl-act="rename"><span class="pl-tx"><b>改个名字</b><small>曲库里显示的名字·直链与本机文件也能改</small></span><span class="pl-chev">›</span></div>' +
(plCur() && plCur().id === id ? '<div class="pl-set-row" data-pl-act="replay"><span class="pl-tx"><b>重播这一首</b><small>把进度拨回 0:00 从头再放一遍</small></span><span class="pl-chev">›</span></div>' : '') +
'<div class="pl-set-row" data-pl-act="queue"><span class="pl-tx"><b>下一首播</b><small>排进队列·' + ((p.queue || []).length ? '现在 ' + (p.queue || []).length + ' 首待发' : '队列现在是空的') + '</small></span><span class="pl-chev">›</span></div>' +
'<div class="pl-set-row" data-pl-act="fav"><span class="pl-tx"><b>' + (faved ? '取消收藏' : '收藏这一首') + '</b><small>' + (faved ? '从「收藏」那一面拿掉' : '进我自己的那一本') + '</small></span><span class="pl-chev">›</span></div>' +
'<div class="pl-set-row" data-pl-act="invite"><span class="pl-tx"><b>邀 TA 一起听</b><small>' + (_plSingles().length ? taLabel('点开挑一位·把这一首送到他那一本会话里', '') : '还没有可邀的人') + '</small></span><span class="pl-chev">›</span></div>' +
(lists.length ? '<div class="pl-set-lab">收进哪个歌单</div>' + lists.map(l => '<div class="pl-set-row' +
(Array.isArray(l.trackIds) && l.trackIds.indexOf(id) >= 0 ? ' on' : '') + '" data-pl-act="tolist" data-pl-to="' + escapeHTML(l.id) + '"><span class="pl-tx"><b>' +
escapeHTML(l.name) + '</b><small>' + (Array.isArray(l.trackIds) && l.trackIds.indexOf(id) >= 0 ? '已经在这个歌单里' : '这个歌单里有 ' + (Array.isArray(l.trackIds) ? l.trackIds.length : 0) + ' 首') + '</small></span><span class="pl-chev">›</span></div>').join('') : '') +
'<div class="pl-set-row" data-pl-act="newtolist"><span class="pl-tx"><b>新建歌单…</b><small>建好就把这一首收进去</small></span><span class="pl-chev">›</span></div>' +
((t.src === 'ncm' && t.nid) ? '' :
'<div class="pl-set-row" data-pl-act="lrcfile"><span class="pl-tx"><b>' + (t.lrc ? '歌词 · 已配上' : '配上歌词') +
'</b><small>' + (t.lrc ? '选一份新 .lrc，或直接改这份文字' : '上传 .lrc 或直接贴文字 · 配一次一直跟着这首') + '</small></span><span class="pl-chev">›</span></div>') +
'<div class="pl-set-row danger" data-pl-act="del"><span class="pl-tx"><b>从曲库删掉</b><small>' + (t.src === 'file' ? '本机字节一起删' : '只删这一条记录') + '</small></span><span class="pl-chev">›</span></div>';
_plMask('plMenuMask', true);
}
function plInvitePick() {
const box = document.getElementById('plMenuBody'), t = plById(plMenu);
const cs = _plSingles().slice().sort((a, b) =>
(((data.chats[b.id] || {}).msgs || []).length) - (((data.chats[a.id] || {}).msgs || []).length));
if (!box || !cs.length) return;
const any = plInviteAny || !t;
_plSheetTitle('邀人一起听');
const mode = t ? '<div class="pl-inv-mode">' +
'<button type="button" class="pl-inv-sw' + (any ? '' : ' on') + '" data-pl-invmode="song">就这首</button>' +
'<button type="button" class="pl-inv-sw' + (any ? ' on' : '') + '" data-pl-invmode="any">不限歌 · 一起听</button>' +
'</div>' : '';
box.innerHTML = '<div class="pl-set-lab">邀谁一起听<span>' + (any ? '不限歌' : '带这一首') + '</span></div>' +
(t ? '<div class="pl-song">' + _plNoteSvg() + '<span class="pl-tx"><span class="pl-nm">' + escapeHTML(t.name) + '</span>' +
'<span class="pl-ar">' + escapeHTML((t.artist ? t.artist + ' · ' : '') + _plSrcLabel(t)) + '</span></span></div>' : '') + mode +
cs.map(c => {
const nm = fixedNameOf(c) || c.name || c.id;
const msgs = (data.chats[c.id] || {}).msgs || [];
const av = c.avatar ? '<img src="' + escapeHTML(c.avatar) + '" alt="" onerror="this.remove()">' : escapeHTML(String(nm).trim().slice(0, 1) || '?');
return '<button type="button" class="pl-inv-row" data-pl-invto="' + escapeHTML(c.id) + '">' +
'<span class="pl-inv-av">' + av + '</span>' +
'<span class="pl-tx"><b>' + escapeHTML(nm) + '</b><small>' +
(msgs.length ? '已有会话 · ' + msgs.length + ' 条' : '还没有聊过·邀了就新开一本') + '</small></span>' +
'<span class="pl-chev">邀</span></button>';
}).join('') +
'<div class="pl-note">' + (any
? '「不限歌」＝只把 TA 拉进来：TA 答应了就陪你听你正在放的那一首，不替 TA 挑歌也不排队。'
: '送出去之后，你们那个会话里会多一张「一起听」卡，这首排进队列（你没在放就当场放）。') +
' TA 可能答应、说等一会儿，也可能不答应——那三档在「设置 → TA 的主动行为」里按人调。</div>' +
'<button type="button" class="pl-link" data-pl-act="back">回去</button>';
}
function closePlayerMenu() { plMenu = null; _plMask('plMenuMask', false); }
function plCoPick() {
plMenu = null;
const box = document.getElementById('plMenuBody');
if (!_plSingles().length) { showToast('还没有可聊的人·先在首页加一位联系人'); return; }
if (!box) return;
const cur = _plRoot().withCid;
const cs = _plSingles().slice().sort((a, b) =>
(((data.chats[b.id] || {}).msgs || []).length) - (((data.chats[a.id] || {}).msgs || []).length));
_plSheetTitle('谁陪你听');
box.innerHTML = '<div class="pl-set-lab">谁陪你听<span>点一位就换过去·不用邀</span></div>' +
cs.map(c => {
const nm = fixedNameOf(c) || c.name || c.id;
const msgs = (data.chats[c.id] || {}).msgs || [];
const av = c.avatar ? '<img src="' + escapeHTML(c.avatar) + '" alt="" onerror="this.remove()">' : escapeHTML(String(nm).trim().slice(0, 1) || '?');
return '<button type="button" class="pl-inv-row' + (cur === c.id ? ' on' : '') + '" data-pl-co-to="' + escapeHTML(c.id) + '">' +
'<span class="pl-inv-av">' + av + '</span>' +
'<span class="pl-tx"><b>' + escapeHTML(nm) + '</b><small>' +
(msgs.length ? '已有会话 · ' + msgs.length + ' 条' : '还没有聊过·点他就新开一本') + '</small></span>' +
'<span class="pl-chev">' + (cur === c.id ? '陪着' : '›') + '</span></button>';
}).join('') +
'<div class="pl-note">听歌默认就和当前聊天的那位一起听，不会自己结束。点一位＝从现在起他陪你听；想一个人放歌，点下面那枚。</div>' +
'<div class="pl-set-row" data-pl-act="co-alone"><span class="pl-tx"><b>一个人听</b><small>结束陪伴·下次开播也不会自己回来</small></span><span class="pl-chev">›</span></div>' +
'<button type="button" class="pl-link" data-pl-act="back">回去</button>';
_plMask('plMenuMask', true);
}
var PL_FILE_BATCH = 100;
var plFileBusy = '';
function plAddFiles(files) {
const all = Array.from(files || []);
if (!all.length) return;
if (plFileBusy) { try { showToast('这一批还在收·' + plFileBusy); } catch (e) {} return; }
const list = all.slice(0, PL_FILE_BATCH), over = all.length - list.length;
const have = {};
plTracks().forEach(t => { if (t && t.src === 'file') { const k = String(t.name || ''); (have[k] = have[k] || []).push(Number(t.fsize) || 0); } });
const isDup = (nm, size) => (have[nm] || []).some(s => !s || !size || s === size);
const ids = [];
let ok = 0, dup = 0, big = 0, bad = 0, at = 0;
let prog = null;
const tick = () => {
const done = ok + dup + big + bad;
plFileBusy = done >= list.length ? '' : '正在收 ' + (done + 1) + ' / ' + list.length;
const mask = document.getElementById('plAddMask'), box = document.getElementById('plAddLog');
if (!mask || !box || mask.hidden) return;
if (!plFileBusy) { if (prog) { try { prog.parentNode.removeChild(prog); } catch (e) {} prog = null; } return; }
if (!prog) { prog = document.createElement('div'); box.appendChild(prog); }
prog.textContent = plFileBusy + (dup ? ' · 已跳过重复 ' + dup + ' 首' : '');
};
const finish = () => {
tick();
_plAddToTarget(ids);
_plAddEnd(ok, over, { dup: dup, big: big, bad: bad });
};
const one = () => {
if (at >= list.length) { finish(); return; }
const f = list[at++];
const nm = String((f && f.name) || '未命名').replace(/\.[a-z0-9]{2,5}$/i, '');
const size = Number(f && f.size) || 0;
tick();
if (!size) { bad++; setTimeout(one, 0); return; }
if (size > PL_FILE_MAX) { big++; setTimeout(one, 0); return; }
if (isDup(nm, size)) { dup++; setTimeout(one, 0); return; }
have[nm] = (have[nm] || []).concat([size]);
const id = 'tr' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
const fid = 'f' + id;
const put = window.idbSet ? window.idbSet(PL_FILE_KEY + fid, f) : Promise.reject(new Error('no idb'));
Promise.resolve(put).then(() => {
ok++;
_plPushTrack({ id, name: nm, artist: '', src: 'file', fid, fsize: size, dur: 0, added: Date.now() });
ids.push(id);
one();
}).catch(() => { bad++; one(); });
};
one();
}
function _plAddEnd(n, over, sk) {
renderPlayerAll();
sk = sk || {};
const bits = [];
if (sk.dup) bits.push('跳过 ' + sk.dup + ' 首（曲库里已经有了）');
if (sk.big) bits.push(sk.big + ' 个超过 ' + Math.round(PL_FILE_MAX / 1048576) + 'MB');
if (sk.bad) bits.push(sk.bad + ' 个读不出来');
if (over) bits.push('多出的 ' + over + ' 个这次没看（一次最多 ' + PL_FILE_BATCH + ' 个）');
const msg = n ? '本机文件收了 ' + n + ' 首' + (bits.length ? ' · ' + bits.join(' · ') : '')
: '一首都没收进来' + (bits.length ? '（' + bits.join(' · ') + '）' : '（太大或读不出来）');
const mask = document.getElementById('plAddMask'), log = document.getElementById('plAddLog');
if (mask && log && !mask.hidden) { const d = document.createElement('div'); if (!n) d.className = 'bad'; d.textContent = msg; log.appendChild(d); }
else showToast(msg);
}
function _plListOf(id) { return (Array.isArray(_plRoot().playlists) ? _plRoot().playlists : []).find(x => x && x.id === id) || null; }
function _plListRef(who, id) {
if ((who || 'mine') === 'mine') {
const l = _plListOf(id);
return l ? { l: l, who: 'mine' } : null;
}
const l = _plTaListOf(who, id);
return l ? { l: l, who: who } : null;
}
function openListMenu(id, who) {
const ref = _plListRef(who, id); if (!ref) return;
const l = ref.l;
const n = ref.who === 'mine' ? (Array.isArray(l.trackIds) ? l.trackIds.length : 0) : _plTaListRows(l).length;
const owner = ref.who === 'mine' ? '' : '（' + _plName(ref.who) + ' 新建）';
window.openModal('歌单「' + l.name + '」' + owner, '', () => _plListRename(l.id, ref.who), {
noInput: true, okText: '改名',
staticText: '这个歌单里有 ' + n + ' 首。可以改个名字，或者把它删掉——删的只是歌单，曲子还在曲库里。',
midBtn: { label: '删掉', onPick: () => _plListDelete(l.id, ref.who) }
});
}
function _plListRename(id, who) {
const ref = _plListRef(who, id); if (!ref) return;
const l = ref.l;
window.openModal('改个名字', l.name, v => {
const nm = String(v || '').trim().slice(0, 24);
if (!nm || nm === l.name) return;
l.name = nm; save(); renderPlayerAll(); renderPlayerLists(); showToast('改名了');
});
}
function _plListDelete(id, who) {
const ref = _plListRef(who, id); if (!ref) return;
const l = ref.l;
window.openModal('删掉「' + l.name + '」？', '', () => {
if (ref.who === 'mine') {
const p = _plRoot();
p.playlists = (Array.isArray(p.playlists) ? p.playlists : []).filter(x => x && x.id !== id);
} else {
const lists = _plTaOwnLists(ref.who);
const i = lists.indexOf(ref.l);
if (i >= 0) lists.splice(i, 1);
}
if (plState.list === id && plState.listWho === ref.who) plState.list = '';
save(); renderPlayerAll(); renderPlayerLists(); showToast('删掉了 · 里面的曲子还在曲库');
}, { noInput: true, okText: '删掉', danger: true, staticText: '只删这个歌单。里面的曲子不会被删，想再收一个随时能建。' });
}
function openPlayerLists() { renderPlayerLists(); _plMask('plListsMask', true); }
function closePlayerLists() { _plMask('plListsMask', false); }
function _plListDupN(l) {
const ids = Array.isArray(l && l.trackIds) ? l.trackIds : [];
return ids.length - new Set(ids).size;
}
function plListDedupe(id) {
const l = _plListOf(id); if (!l) return;
const ids = Array.isArray(l.trackIds) ? l.trackIds : [];
const seen = new Set(), out = [];
ids.forEach(x => { if (!seen.has(x)) { seen.add(x); out.push(x); } });
const n = ids.length - out.length;
if (!n) { showToast('这个歌单里没有重复的'); renderPlayerLists(); return; }
l.trackIds = out; save();
renderPlayerLists(); renderPlayerPage();
showToast('《' + l.name + '》清掉 ' + n + ' 处重复');
}
function renderPlayerLists() {
const box = document.getElementById('plListsBody'); if (!box) return;
const groups = [{ who: 'mine', label: '我的歌单', lists: Array.isArray(_plRoot().playlists) ? _plRoot().playlists : [] }];
_plListOwners().forEach(cid => groups.push({ who: cid, label: _plName(cid) + ' 新建的歌单', lists: _plTaOwnLists(cid) }));
const total = groups.reduce((s, g) => s + g.lists.length, 0);
const row = (l, who) => {
const mine = who === 'mine';
const n = mine ? (Array.isArray(l.trackIds) ? l.trackIds.length : 0) : _plTaListRows(l).length;
const dup = mine ? _plListDupN(l) : 0;
const on = l.id === plState.list && who === plState.listWho;
return '<div class="pl-lst-row' + (on ? ' on' : '') + '">' +
'<button type="button" class="pl-lst-main" data-pl-lopen="' + escapeHTML(l.id) + '" data-pl-listwho="' + escapeHTML(who) + '">' +
'<span class="pl-lst-nm">' + escapeHTML(l.name) + '</span>' +
'<span class="pl-lst-n">' + n + ' 首</span></button>' +
'<span class="pl-lst-acts">' +
(dup ? '<button type="button" class="pl-lst-btn" data-pl-ldedupe="' + escapeHTML(l.id) + '">去重 ' + dup + '</button>' : '') +
'<button type="button" class="pl-lst-btn" data-pl-lrename="' + escapeHTML(l.id) + '" data-pl-listwho="' + escapeHTML(who) + '">改名</button>' +
'<button type="button" class="pl-lst-btn danger" data-pl-ldelete="' + escapeHTML(l.id) + '" data-pl-listwho="' + escapeHTML(who) + '">删掉</button>' +
'</span></div>';
};
box.innerHTML =
(total
? '<div class="pl-set-lab">共 ' + total + ' 个歌单<span>点歌单名就打开</span></div>' +
groups.filter(g => g.lists.length).map(g =>
'<div class="pl-set-lab">' + escapeHTML(g.label) + '</div>' +
g.lists.map(l => row(l, g.who)).join('')).join('')
: '<div class="pl-set-note">还没有歌单·先建一个。</div>') +
'<div class="pl-lst-new"><button type="button" class="pl-btn" data-pl-newlist="1">新建歌单</button></div>' +
'<div class="pl-set-note">删掉的只是歌单本身，里面的曲子还在曲库里。在歌单页长按某个歌单，也能直接管它。</div>';
}
function plNewList() {
window.openModal('新歌单叫什么', '', v => {
const name = String(v || '').trim();
if (!name) return;
const p = _plRoot();
if (!Array.isArray(p.playlists)) p.playlists = [];
const l = { id: 'pl' + Date.now().toString(36), name, trackIds: [], created: Date.now() };
p.playlists.push(l); plState.list = l.id; save();
renderPlayerAll(); renderPlayerLists();
});
}
function plPlayListAll(id) {
const l = _plListOf(id); if (!l) return;
const ids = (Array.isArray(l.trackIds) ? l.trackIds : []).map(x => plById(x)).filter(Boolean).filter(plPlayable);
if (!ids.length) { showToast('这个歌单里没有能放的曲子'); return; }
const p = _plRoot();
p.queue = ids.slice(1).map(x => x.id);
save(); plPlayId(ids[0].id);
}
function plPlayTaListAll(cid, id) {
const l = _plTaListOf(cid, id); if (!l) return;
const rows = _plTaListRows(l).filter(plPlayable);
if (!rows.length) { showToast('这个歌单里没有能放的曲子'); return; }
const p = _plRoot();
if (!Array.isArray(p.tracks)) p.tracks = [];
rows.forEach(t => {
if (!plById(t.id)) p.tracks.push({ id: t.id, nid: t.nid, name: t.name, artist: t.artist, src: 'ncm',
dur: Number(t.dur) || 0, pic: t.pic || '', added: Date.now() });
});
p.queue = rows.slice(1).map(x => x.id);
save(); plPlayId(rows[0].id);
}
function plToggleFav(id) {
const p = _plRoot();
if (!Array.isArray(p.favs)) p.favs = [];
const i = p.favs.indexOf(id);
if (i >= 0) p.favs.splice(i, 1); else p.favs.unshift(id);
save();
renderPlayerAll();
return i < 0;
}
function plAddToList(listId, trackId) {
const p = _plRoot();
const l = (Array.isArray(p.playlists) ? p.playlists : []).find(x => x.id === listId);
if (!l) return false;
if (!Array.isArray(l.trackIds)) l.trackIds = [];
if (l.trackIds.indexOf(trackId) >= 0) return false;
l.trackIds.push(trackId);
save();
renderPlayerAll();
return true;
}
function plQueueNext(id) {
const p = _plRoot();
if (!Array.isArray(p.queue)) p.queue = [];
const i = p.queue.indexOf(id);
if (i >= 0) p.queue.splice(i, 1);
p.queue.unshift(id);
save();
renderPlayerAll();
}
function plWipeLibrary() {
const p = _plRoot();
const ids = new Set(plTracks().map(t => t.fid).filter(Boolean));
p.tracks = []; p.playlists = []; p.favs = []; p.queue = []; p.current = '';
_plStopAudio();
if (window.idbDelete) ids.forEach(fid => window.idbDelete(PL_FILE_KEY + fid).catch(() => {}));
save();
renderPlayerAll();
renderPlayerSettings();
}
function bindPlayerOnce() {
if (plBound) return;
plBound = true;
_plFloatDragInit();
document.addEventListener('pointerdown', e => {
const m = document.getElementById('plFloatMenu'); if (!m || m.hidden) return;
if (e.target && e.target.closest && (e.target.closest('#plFloatMenu') || e.target.closest('#plFloat'))) return;
_plFloatMenuClose();
}, true);
_plQueueDragInit();
{ const lb = document.getElementById('plfLrc');
if (lb) { const hold = () => { plLrcHold = Date.now(); };
lb.addEventListener('touchstart', hold, { passive: true });
lb.addEventListener('wheel', hold, { passive: true }); } }
if (!window.__plFloatReserveBound) {
window.__plFloatReserveBound = 1;
window.addEventListener('resize', () => { _plFloatSafeTop = -1; try { _plFloatReserve(); } catch (e) {} });
window.addEventListener('orientationchange', () => { _plFloatSafeTop = -1; try { setTimeout(_plFloatReserve, 260); } catch (e) {} });
}
document.addEventListener('click', e => {
if (_plFloatDragMoved) {
_plFloatDragMoved = false;
if (e.target && e.target.closest && e.target.closest('#plFloat')) return;
}
if (_plFloatHoldFired) {
_plFloatHoldFired = false;
if (e.target && e.target.closest && e.target.closest('#plFloat')) return;
}
const hit = sel => e.target.closest ? e.target.closest(sel) : null;
const settab = hit('[data-pl-settab]');
if (settab) {
plState.setTab = settab.dataset.plSettab || 'companion';
document.querySelectorAll('#plSetBody [data-pl-settab]').forEach(x => {
const on = x.dataset.plSettab === plState.setTab;
x.classList.toggle('active', on); x.setAttribute('aria-selected', on ? 'true' : 'false');
});
document.querySelectorAll('#plSetBody [data-pl-setpane]').forEach(x => { x.hidden = x.dataset.plSetpane !== plState.setTab; });
return;
}
const tab = hit('[data-pl-tab]');
if (tab) { plBatchOn = false; plBatchSel.clear(); plState.tab = tab.dataset.plTab; renderPlayerPage(); return; }
const recwho = hit('[data-pl-recwho]');
if (recwho) { plState.recWho = recwho.dataset.plRecwho || ''; renderPlayerPage(); return; }
const tawho = hit('[data-pl-favwho]');
if (tawho) { plState.favWho = tawho.dataset.plFavwho; renderPlayerPage(); return; }
const libSort = hit('[data-pl-libsort]');
if (libSort) { plState.libSort = libSort.dataset.plLibsort; renderPlayerPage(); return; }
const qpref = hit('[data-pl-quality]');
if (qpref) { _plRoot().ncmQuality = qpref.dataset.plQuality || ''; save(); renderPlayerSettings(); showToast('音质已设为「' + qpref.textContent + '」'); return; }
const coWho = hit('[data-pl-co-who]');
if (coWho) { plSetCoWho(coWho.dataset.plCoWho || ''); return; }
const coTo = hit('[data-pl-co-to]');
if (coTo) { closePlayerMenu(); plSetCoWho(coTo.dataset.plCoTo || ''); return; }
const plsort = hit('[data-pl-listsort]');
if (plsort) { plState.listSort = plsort.dataset.plListsort || 'added'; renderPlayerPage(); return; }
if (hit('[data-pl-golib]')) { plBatchOn = false; plBatchSel.clear(); plState.tab = 'lib'; renderPlayerPage(); return; }
if (hit('[data-pl-recentplay]')) { _plRecentPlayAll(); return; }
const bat = hit('[data-pl-batch]');
if (bat) {
const k = bat.dataset.plBatch;
if (k === 'enter') { plBatchEnter(); return; }
if (k === 'exit') { plBatchExit(); return; }
if (k === 'all') { plBatchSelectAll(); return; }
if (k === 'to') { if (!plBatchSel.size) { showToast('先勾几首'); return; } openPlPick('batch'); return; }
if (k === 'unlist') { plBatchUnlist(); return; }
if (k === 'del') { plBatchDelete(); return; }
if (k === 'add') { plBatchAddFind(); return; }
return;
}
const pick = hit('[data-pl-pick]');
if (pick) {
const pid = pick.dataset.plPick;
if (pid === '__new') { plPickNew(); return; }
plPickInto(pid); return;
}
if (hit('#plPickClose')) { closePlPick(); return; }
const addto = hit('[data-pl-addto]');
if (addto) {
plState.addTo = addto.dataset.plAddto || '';
document.querySelectorAll('#plAddBody [data-pl-addto]').forEach(x => x.classList.toggle('on', String(x.dataset.plAddto || '') === String(plState.addTo || '')));
return;
}
if (hit('[data-pl-addnew]')) {
window.openModal('新歌单叫什么', '', v => {
const name = String(v || '').trim(); if (!name) return;
const p = _plRoot(); if (!Array.isArray(p.playlists)) p.playlists = [];
const l = { id: 'pl' + Date.now().toString(36), name, trackIds: [], created: Date.now() };
p.playlists.push(l); plState.addTo = l.id; save();
_plAddToPaint();
showToast('新歌单《' + name + '》· 这一批会收进去');
});
return;
}
const pall = hit('[data-pl-playall]');
if (pall) { plPlayListAll(pall.dataset.plPlayall); return; }
const taSong = hit('[data-pl-taplay]');
if (taSong && taSong.dataset.plId) {
plPlayTaItem(String(taSong.dataset.plTaplay || ''), plState.list, String(taSong.dataset.plId).replace(/^ncm/i, ''));
renderPlayerFull(); return;
}
const taPlayAll = hit('[data-pl-taplayall]');
if (taPlayAll) { plPlayTaListAll(String(taPlayAll.dataset.plTaplayall || ''), String(taPlayAll.dataset.plList || '')); return; }
const listOwner = hit('[data-pl-listowner]');
if (listOwner) {
const who = String(listOwner.dataset.plListowner || 'mine');
const ls = who === 'mine' ? _plRoot().playlists : _plTaOwnLists(who);
plBatchOn = false; plBatchSel.clear();
plState.listWho = who;
plState.list = (Array.isArray(ls) && ls[0]) ? ls[0].id : '';
renderPlayerPage(); return;
}
const lst = hit('[data-pl-list]');
if (lst) {
if (plState.tab === 'list' && lst.dataset.plList === plState.list) { openListMenu(lst.dataset.plList, plState.listWho); return; }
plBatchOn = false; plBatchSel.clear();
plState.list = lst.dataset.plList; renderPlayerPage(); return;
}
const who = hit('[data-pl-permwho]');
if (who) { plState.perm = who.dataset.plPermwho; renderPlayerSettings(); return; }
const menu = hit('[data-pl-menu]');
if (menu) { e.stopPropagation(); openPlayerMenu(menu.dataset.plMenu); return; }
const ask = hit('[data-pl-ask]');
if (ask) {
if (ask.dataset.plAskDead) { showToast('这首已经不在曲库里了·没法一起听'); return; }
plAnswerInvite(ask.dataset.plAsk); return;
}
const invmode = hit('[data-pl-invmode]');
if (invmode) { plInviteAny = invmode.dataset.plInvmode === 'any'; plInvitePick(); return; }
const invto = hit('[data-pl-invto]');
if (invto) {
const tid = plInviteAny ? '' : plMenu;
if (plSendInvite(invto.dataset.plInvto, tid, true)) closePlayerMenu();
else showToast('这一首已经不在曲库里了·换一首再邀');
return;
}
const act = hit('[data-pl-act]');
if (act) { _plAct(act.dataset.plAct, act); return; }
const nd = hit('[data-pl-noduck]');
if (nd) return;
const perm = hit('[data-pl-perm-in]');
if (perm) return;
const step = hit('[data-pl-step]');
if (step) {
const row = step.closest('.pl-perm'); const inp = row && row.querySelector('[data-pl-perm-in]');
if (row && inp) { const k = inp.dataset.plPermIn; const cell = PL_PERMS.find(x => x.k === k);
if (cell) { const n = Math.max(cell.min, Math.min(cell.max, (Number(inp.value) || cell.d) + (Number(step.dataset.plStep) || 0)));
inp.value = n; _plPermWrite(k, n); } }
return;
}
const idlePlay = hit('#plNowIdlePlay');
if (idlePlay) { if (plTracks().some(plPlayable)) plNext(false); else openPlayerAdd(); return; }
if (hit('#plPlay') || hit('#plPlayFull') || hit('#plNowPlay')) { plToggle(); return; }
if (hit('#plNextBtn') || hit('#plNowNext')) { plNext(false); return; }
if (hit('#plPrevBtn') || hit('#plNowPrev')) { plPrev(); return; }
if (hit('#plFloatPrev')) { plPrev(); return; }
if (hit('#plFloatPlay')) { plToggle(); return; }
if (hit('#plFloatNext')) { plNext(false); return; }
if (hit('#plFloatFav')) {
const c = plCur();
if (!c) { showToast('还没挑一首·收藏要先有一首在放'); return; }
const added = plToggleFav(c.id);
showToast(added ? '已收藏 · 在播放器的「收藏」里' : '已取消收藏');
return;
}
const fm = hit('[data-pl-fm]');
if (fm) {
if (fm.dataset.plFm === 'fav') {
const c = plCur();
if (!c) { showToast('还没挑一首·收藏要先有一首在放'); return; }
const added = plToggleFav(c.id);
showToast(added ? '已收藏 · 在播放器的「收藏」里' : '已取消收藏');
_plFloatMenuPaint();
return;
}
_plFloatLrcModeSet(fm.dataset.plFm !== 'name'); _plFloatMenuClose(); return;
}
if (hit('#plFloat')) { plOpenFull(true); return; }
if (hit('#plNowQueue')) { openPlayerQueue(); return; }
if (hit('[data-pl-now]')) { plOpenFull(true); return; }
if (hit('#plFullClose') || hit('#plfBack')) { plOpenFull(false); return; }
if (hit('#plfLib')) { plGoLib(); return; }
if (hit('#plfMode')) { plCycleMode(); renderPlayerFull(); return; }
if (hit('#plfQueueBtn')) { openPlayerQueue(); return; }
if (hit('#plfSleepBtn')) { openPlayerSleep(); return; }
if (hit('#plfVolOpen')) { plState.vol = !plState.vol; renderPlayerFull(); return; }
if (hit('#plfNext')) { openPlayerQueue(); return; }
if (hit('#plQueueClose')) { closePlayerQueue(); return; }
if (hit('#plSleepClose')) { closePlayerSleep(); return; }
const qdel = hit('[data-pl-qdel]');
if (qdel) { plQueueRemove(qdel.dataset.plQdel); return; }
const qmv = hit('[data-pl-qmove]');
if (qmv) { plQueueMove(qmv.dataset.plQid, qmv.dataset.plQmove); return; }
const slp = hit('[data-pl-sleep]');
if (slp) { const v = slp.dataset.plSleep; if (v === 'end') _plSleepEndSong(); else if (v === 'qend') _plSleepEndQueue(); else _plSleepSet(Number(v) || 15); return; }
if (hit('#plVolBtn')) {
const now = _plVolGet();
if (now > 0) { plVolMuteAt = now; _plVolApply(0); } else _plVolApply(plVolMuteAt || 0.8);
return;
}
const invNow = hit('[data-pl-invitenow]');
if (invNow) { plCoPick(); return; }
if (hit('[data-pl-endco]')) {
const p2 = _plRoot(); _plCoDropPatch(p2.withCid, true);
renderPlayerFull(); renderPlayerPage(); try { renderPlFloat(); } catch (e) {}
showToast('已结束一起听 · 想找回就在整屏页点「挑一位陪你听」'); return;
}
if (hit('#plfLrcBtn')) { plState.lrc = !plState.lrc; if (typeof data !== 'undefined' && data) data.lyricOn = plState.lrc; try { save(); } catch (e) {} renderPlayerFull(); if (plState.lrc) plLrcEnsure(true); return; }
const lrcl = hit('[data-lrc-t]');
if (lrcl) { const a = plAudio, tt = Number(lrcl.dataset.lrcT); if (a && Number.isFinite(tt)) { plLrcHold = 0; try { a.currentTime = tt; } catch (e2) {} } return; }
const lsz = hit('[data-pl-lrcsz]');
if (lsz) { try { localStorage.setItem(PL_LRC_SZ_KEY, lsz.dataset.plLrcsz); } catch (e2) {} _plLrcPaint(); return; }
if (hit('#plfFloatBtn')) {
const nowAt = Date.now();
if (nowAt - _plFloatBtnAt < 500) return;
_plFloatBtnAt = nowAt;
const wasOn = plFloatOn || _plFloatLrcOn();
if (wasOn) { plFloatHide(); if (typeof data !== 'undefined' && data) { data.plFloatOn = false; try { save(); } catch (e) {} } showToast('悬浮小框已收起 · 想再要就点亮这枚「小框」'); }
else { plFloatOn = true; renderPlFloat(); if (typeof data !== 'undefined' && data) { data.plFloatOn = true; try { save(); } catch (e) {} } showToast('悬浮小框已开 · 回聊天页就能看到'); }
renderPlayerFull();
return;
}
if (hit('#plfFav')) {
const c = plCur();
if (!c) { showToast('还没挑一首·收藏要先有一首在放'); return; }
const added = plToggleFav(c.id);
renderPlayerFull();
showToast(added ? '已收藏 · 在播放器的「收藏」里' : '已取消收藏');
return;
}
if (hit('#plfMore')) {
const c = plCur();
if (!c) { showToast('还没挑一首·先放一首再管它'); return; }
openPlayerMenu(c.id);
return;
}
if (hit('#plLyrLogBtn')) { openPlayerLyrLog(); return; }
if (hit('#pllBack')) { closePlayerLyrLog(); return; }
const lyrl = hit('[data-pl-lyr-go]');
if (lyrl) { _plLyrGo(lyrl.dataset.plLyrGo, lyrl.dataset.plLyrMid); return; }
const lyrwho = hit('[data-pl-lyr-who]');
if (lyrwho) { plLyrLogWho = lyrwho.dataset.plLyrWho || 'all'; plLyrLogOpen = ''; renderPlLyrLog(); return; }
const lyrtog = hit('[data-pl-lyr-toggle]');
if (lyrtog) {
const mid = lyrtog.dataset.plLyrToggle || '';
plLyrLogOpen = (mid && plLyrLogOpen === mid) ? '' : mid;
renderPlLyrLog();
return;
}
if (hit('#plPermBtn')) { openPlayerSettings(); return; }
if (hit('#plSourceBtn')) { openPlayerSource(); return; }
if (hit('#plsBack') || hit('#plSourceClose')) { closePlayerSource(); return; }
if (hit('#pldBack')) { closePlayerDaily(); return; }
if (hit('#plaBack')) { closePlayerArtist(); return; }
if (hit('#pldRefresh')) { plNcmDailyLoad(); return; }
if (hit('#plnBack')) { closePlayerNcmList(); return; }
if (hit('#plAddBtn') || hit('[data-pl-add]')) { openPlayerAdd(); return; }
if (hit('[data-pl-newlist]')) { plNewList(); return; }
if (hit('[data-pl-lists]')) { openPlayerLists(); return; }
if (hit('#plListsClose')) { closePlayerLists(); return; }
const lren = hit('[data-pl-lrename]');
if (lren) { _plListRename(lren.dataset.plLrename, lren.dataset.plListwho || 'mine'); return; }
const ldel = hit('[data-pl-ldelete]');
if (ldel) { _plListDelete(ldel.dataset.plLdelete, ldel.dataset.plListwho || 'mine'); return; }
const ldd = hit('[data-pl-ldedupe]');
if (ldd) { plListDedupe(ldd.dataset.plLdedupe); return; }
const lopn = hit('[data-pl-lopen]');
if (lopn) { plBatchOn = false; plBatchSel.clear(); plState.listWho = lopn.dataset.plListwho || 'mine'; plState.list = lopn.dataset.plLopen; renderPlayerPage(); closePlayerLists(); return; }
if (hit('#plNcmClose')) { closePlayerNcm(); plDelConfirm = 0; return; }
if (hit('#plSetClose') || hit('#plAddClose') || hit('#plAskClose') || hit('#plMenuClose') || hit('#plLrcClose')) { _plMask('', false); plDelConfirm = 0; return; }
const inv = hit('[data-pl-inv]');
if (inv) { openPlayerInvite(inv.dataset.plInv); return; }
const row = hit('.pl-row');
if (row && row.dataset.plId) {
if (plBatchOn) { plBatchToggle(row.dataset.plId); return; }
plPlayId(row.dataset.plId); renderPlayerFull(); return;
}
if (e.target.classList && e.target.classList.contains('fs-sheet-mask')) { _plMask('', false); plDelConfirm = 0; }
}, true);
document.addEventListener('change', e => {
const taInv = e.target.closest ? e.target.closest('#plTaInviteIn') : null;
if (taInv) { plTaInviteSet(!!taInv.checked); return; }
const nd = e.target.closest ? e.target.closest('[data-pl-noduck]') : null;
if (nd) { try { if (!data.appearance) data.appearance = {}; data.appearance.plNoDuck = !!nd.checked; save(); } catch (x) {}
try { showToast(nd.checked ? '已开启：本机上传的歌不再挤掉其他 App 的声音（在线音源仍会占用声道）' : '已关闭：播放器会照常占用音频通道'); } catch (x) {}
renderPlayerSettings(); return; }
const inp = e.target.closest ? e.target.closest('[data-pl-perm-in]') : null;
if (!inp) return;
const k = inp.dataset.plPermIn, cell = PL_PERMS.find(x => x.k === k); if (!cell) return;
_plPermWrite(k, cell.bool ? (inp.checked ? 1 : 0) : inp.value);
});
document.addEventListener('input', e => {
const r = e.target && e.target.closest ? e.target.closest('#plVol') : null;
if (r) { _plVolApply(Number(r.value) / 100, true); return; }
const kw = e.target && e.target.closest ? e.target.closest('#plLibKw') : null;
if (kw) {
plState.libKw = kw.value;
if (plLibKwTimer) clearTimeout(plLibKwTimer);
plLibKwTimer = setTimeout(() => { _plLibRowsPaint(); _plLazy(); }, 150);
}
});
let plLibKwTimer = 0;
document.addEventListener('keydown', e => {
if (e.key === 'Enter' && e.target && e.target.id === 'plLibKw') {
plState.libKw = e.target.value;
_plLibRowsPaint();
_plLazy();
try { e.target.blur(); } catch (x) {}
return;
}
if (!e.target || e.target.id !== 'plSearchKw') return;
if (e.key !== 'Enter') return;
e.preventDefault();
Promise.resolve(plNcmSearch(e.target.value)).catch(() => {});
});
}
function _plAct(kind, el) {
const p = _plRoot();
if (kind === 'file') {
window.mochiFilePick({ id: 'player', accept: 'audio/*', multiple: true, onFiles: fs => plAddFiles(fs) });
return;
}
if (kind === 'paste') {
const el = document.getElementById('plPaste');
Promise.resolve(plAddPaste(el ? el.value : '')).catch(() => {});
return;
}
if (kind === 'newlist') { plNewList(); return; }
if (kind === 'replay') { closePlayerMenu(); plReplay(); return; }
if (kind === 'qclear') { plQueueClear(); return; }
if (kind === 'sleepcancel') { _plSleepCancel(); return; }
if (kind === 'ncm') { openPlayerNcm(); return; }
if (kind === 'ncmapi') { plNcmApiSet(); return; }
if (kind === 'lyricdiag') { plLyricDiag(); return; }
if (kind === 'lrcagain') { plLrcEnsure(true); return; }
if (kind === 'lrcfloat') { _plFloatLrcModeSet(!_plFloatLrcOn()); return; }
if (kind === 'gosource') { closePlayerSettings(); openPlayerSource(); return; }
if (kind === 'ncmtest') { plNcmTest(); return; }
if (kind === 'ncmhelp') { plNcmSelfHelp(); return; }
if (kind === 'ncmdailyrefresh') { plNcmDailyLoad(); return; }
if (kind === 'ncmlistsrefresh') { plNcmListsLoad(); return; }
if (kind === 'ncmfold') {
const hasRes = !plFindSay && Array.isArray(plFindRows) && plFindRows.length > 0;
const cur = (plState.ncmOpen === undefined || plState.ncmOpen === null) ? !hasRes : !!plState.ncmOpen;
plState.ncmOpen = !cur;
_plNcmPaintDiscover();
return;
}
if (kind === 'recclear') {
const p2 = _plRoot();
const done = (p2.invites || []).filter(v => v && v.status !== 'waiting');
if (!done.length) { showToast('没有已答完的记录'); return; }
window.openModal('清掉已答完的邀请记录？', '', () => {
p2.invites = (p2.invites || []).filter(v => v && v.status === 'waiting');
if (plState.recWho && !(p2.invites || []).some(v => v && v.cid === plState.recWho)) plState.recWho = '';
save(); renderPlayerPage();
try { showToast('清了 ' + done.length + ' 条记录'); } catch (e) {}
}, {
noInput: true, okText: '清掉 ' + done.length + ' 条', danger: true,
staticText: '只清「已答完的」（一起听了／没答应／先放一放这些），等你回话的那几条不动。' +
'⚠ 聊天里那些一起听卡还在，但卡上的角标会变成「这条邀请已经不在了」——清了找不回。'
});
return;
}
if (kind === 'ncmdaily') { openPlayerDaily(); return; }
if (kind === 'randpush') {
if (plRandBusy) { plRandAbort = true; try { showToast('这就取消'); } catch (e) {} return; }
plRandPush(); return;
}
if (kind === 'randauto') { plRandAutoSet(!_plRoot().randAuto); return; }
if (kind === 'randnovip') { plRandNoVipSet(!_plRoot().randNoVip); return; }
if (kind === 'randblock') {
const w = String(el.dataset.plWord || '');
if (w) plRandBlockSet(w, !Array.isArray(_plRoot().randBlockWords) || _plRoot().randBlockWords.indexOf(w) < 0);
return;
}
if (kind === 'randunban') { plRandBanSet(String(el.dataset.plNid || ''), false); return; }
if (kind === 'randbanlast') {
if (!plRandLast) return;
const meta = plRandLast;
plRandLast = null;
plRandBanSet(meta.nid, true, meta);
try { showToast('记下了·以后不再随机推这首'); } catch (e) {}
return;
}
if (kind === 'randfav') {
const w = String(el.dataset.plWord || '');
if (w) plRandFavSet(w, !Array.isArray(_plRoot().randFavWords) || _plRoot().randFavWords.indexOf(w) < 0);
return;
}
if (kind === 'randfavadd') { plRandFavAdd(); return; }
if (kind === 'randfavbulk') { plRandFavBulk(String(el.dataset.plOn || '') === '1'); return; }
if (kind === 'randpushone') {
if (plRandBusy) { plRandAbort = true; try { showToast('这就取消'); } catch (e) {} return; }
plRandPushQ(); return;
}
if (kind === 'randby') { plRandBySet(String(el.dataset.plMode || '')); return; }
if (kind === 'randtacid') { plRandTaSet(String(el.dataset.plCid || '')); return; }
if (kind === 'randscope') {
const p = _plRoot();
const s = String(el.dataset.plScope || '') === 'mine' ? 'mine' : 'ta';
if (p.settings.taListScope !== s) { p.settings.taListScope = s; save(); _plRandPaint(); }
return;
}
if (kind === 'taplay') { plPlayTaItem(String(el.dataset.plCid || ''), String(el.dataset.plList || ''), String(el.dataset.plNid || '')); return; }
if (kind === 'ncmlist') { openPlayerNcmList(el.dataset.pid, el.dataset.pnm); return; }
if (kind === 'aropen') { openPlayerArtist(el.dataset.arId || '', el.dataset.arNm || ''); return; }
if (kind === 'ftype') {
const t = String(el.dataset.ft || '1') === '100' ? '100' : '1';
if (t !== plFindType) {
plFindType = t; plFindRows = null; plFindSay = ''; plFindBad = false; plFindCut = false;
renderPlayerFind();
if (plFindKw) Promise.resolve(plNcmSearch(plFindKw)).catch(() => {});
}
return;
}
if (kind === 'ncmplayall') { Promise.resolve(_plNcmPlayAll(el.dataset.src)).catch(() => {}); return; }
if (kind === 'ncmimportall') { Promise.resolve(_plNcmImportAll(el.dataset.src)).catch(() => {}); return; }
if (kind === 'vipdrop') { plNcmVipDrop(); return; }
if (kind === 'ncmqr') { plNcmQrStart(); return; }
if (kind === 'ncmout') { plNcmLogout(); return; }
if (kind === 'ncmplay' || kind === 'ncmadd') {
const nid = String(el.dataset.nid || '');
if (!nid) return;
const id = 'ncm' + nid;
if (plBatchOn && kind === 'ncmplay') {
if (typeof plById === 'function' && plById(id)) { try { showToast('这首本来就在曲库里'); } catch (e) {} return; }
plBatchToggle(id);
return;
}
const existed = !!plById(id);
if (!existed) _plPushTrack({ id, nid, name: String(el.dataset.nm || '').trim() || ('网易云 ' + nid),
artist: String(el.dataset.ar || '').trim(), src: 'ncm', dur: Number(el.dataset.du) || 0, pic: String(el.dataset.dp || ''), added: Date.now() });
if (kind === 'ncmplay') { plPlayId(id); renderPlayerAll(); return; }
const box = document.getElementById('plSearchRes');
if (box) { box.innerHTML = _plFindResInnerHTML(); try { _plLazy(); } catch (e) {} }
{ const tabs = document.getElementById('plTabs'); if (tabs) tabs.innerHTML = _plTabsHTML(); }
try { showToast(existed ? '这一首本来就在曲库里' : '收进曲库了 · 没动正在放的这首'); } catch (e) {}
return;
}
if (kind === 'ncmimport') {
Promise.resolve(plNcmImport(String(el.dataset.pid || ''), String(el.dataset.pnm || ''))).catch(() => {});
return;
}
if (kind === 'ncmsearch') {
const kw = document.getElementById('plSearchKw');
Promise.resolve(plNcmSearch(kw ? kw.value : '')).catch(() => {});
return;
}
if (kind === 'ncmclear') {
++plSearchTok;
_plFindBatchOff();
plFindKw = ''; plFindRows = null; plFindSay = ''; plFindBad = false; plFindCut = false;
{ const kw0 = document.getElementById('plSearchKw'); if (kw0) kw0.value = ''; }
renderPlayerFind();
const kw = document.getElementById('plSearchKw');
if (kw) { try { kw.focus(); } catch (e) {} }
return;
}
if (kind === 'libclear') {
plState.libKw = '';
const kw = document.getElementById('plLibKw');
if (kw) { kw.value = ''; try { kw.focus(); } catch (e) {} }
_plLibRowsPaint();
try { _plLazy(); } catch (e) {}
return;
}
if (kind === 'ncmretry') {
Promise.resolve(plNcmSearch(plFindKw)).catch(() => {});
return;
}
if (kind === 'ncmcookie') {
window.openModal('网易云 Cookie（MUSIC_U 的值）', _plNcmCookie(), v => {
const s = String(v || '').trim().replace(/^MUSIC_U=/i, '');
if (s && !/^[A-Za-z0-9%._-]+$/.test(s)) { showToast('只贴 MUSIC_U 那一串值本身，别把整段 Cookie 一起贴进来'); return; }
p.ncmCookie = s; save(); flushSave(); renderPlayerSettings(); renderPlayerAll();
if (plState.ncm) renderPlayerNcm();
if (!s) { _plNcmResetMine(); showToast('清空了＝已退出网易云'); return; }
_plNcmResetMine();
_plNcmSyncProfile(true).then(pf => {
renderPlayerNcm(); renderPlayerSettings(); renderPlayerAll();
showToast(pf && pf.nickname ? '网易云登录成功 · ' + pf.nickname
: '票据存了·' + (_plNcmAccSay() || '这一台接口还没答上（本站不代跑它，只问它）'));
});
}, { staticText: '拿法：电脑浏览器登录 music.163.com → F12（右键·检查）→ 应用 / Application → Cookies → music.163.com → 复制 MUSIC_U 那一行的值。只填值本身；填了还要有一台答话的接口才见得着「每日推荐∶我的歌单∶会员歌完整版」（票据只在本机·接口不是本站跑的）；想退出登录就把这里清空按确定。' });
return;
}
if (kind === 'wipe') {
if (!plDelConfirm) { plDelConfirm = Date.now(); renderPlayerSettings(); setTimeout(() => { if (plDelConfirm && Date.now() - plDelConfirm > 2400) { plDelConfirm = 0; renderPlayerSettings(); } }, 2500); return; }
plDelConfirm = 0; plWipeLibrary(); return;
}
if (kind === 'rename' && plMenu) {
const id = plMenu, t = plById(id); if (!t) { closePlayerMenu(); return; }
window.openModal('给这一首改个名字', t.name, v => {
const nm = String(v || '').trim();
if (!nm) { showToast('名字不能是空的'); return; }
const tt = plById(id); if (!tt) { showToast('这首已经不在曲库里了'); return; }
tt.name = nm.slice(0, 80); save(); closePlayerMenu(); renderPlayerAll();
if (plCur() === tt) { try { _plMediaSync(tt, !!(plAudio && !plAudio.paused)); } catch (e) {} }
showToast('改名了');
}, { okText: '改名' });
return;
}
if (kind === 'queue' && plMenu) { plQueueNext(plMenu); closePlayerMenu(); return; }
if (kind === 'fav' && plMenu) { plToggleFav(plMenu); closePlayerMenu(); return; }
if (kind === 'lrcfile' && plMenu) { const id = plMenu; closePlayerMenu(); openPlayerLyrics(id); return; }
if (kind === 'lrcedit') {
const t = plCur();
if (!t) { showToast('还没挑一首·先放一首再配歌词'); return; }
openPlayerLyrics(t.id); return;
}
if (kind === 'lrcpick') { if (plLrcSheetId) plPickLyricFile(plLrcSheetId); return; }
if (kind === 'lrcsave') {
const ta = document.getElementById('plLrcTa');
const txt = ta ? String(ta.value || '') : '';
if (!txt.trim()) { showToast('歌词是空的·要清空请点「移除歌词」'); return; }
_plLrcApplyText(txt, false);
return;
}
if (kind === 'lrcwipe') {
const t = plById(plLrcSheetId); if (!t) return;
t.lrc = ''; save();
if (plCur() === t) { plLrcKey = ''; plLrcLines = null; plLrcSay = '这一首还没配歌词'; _plLrcPaint(); }
_plLrcSheetPaint(); renderPlayerAll();
showToast('歌词已移除');
return;
}
if (kind === 'del' && plMenu) { const id = plMenu; closePlayerMenu(); plRemoveTrack(id); return; }
if (kind === 'tolist' && plMenu && el.dataset.plTo) {
const lid = el.dataset.plTo, l = _plListOf(lid), added = plAddToList(lid, plMenu);
closePlayerMenu();
showToast(added ? '收进《' + (l ? l.name : '歌单') + '》' : '这一首本来就在那个歌单里');
return;
}
if (kind === 'newtolist' && plMenu) {
const id = plMenu;
window.openModal('新歌单叫什么', '', v => {
const name = String(v || '').trim(); if (!name) return;
const p2 = _plRoot(); if (!Array.isArray(p2.playlists)) p2.playlists = [];
const l = { id: 'pl' + Date.now().toString(36), name, trackIds: [], created: Date.now() };
p2.playlists.push(l); plState.list = l.id; save();
plAddToList(l.id, id);
closePlayerMenu();
showToast('新歌单《' + name + '》· 收了这一首');
});
return;
}
if (kind === 'co-alone') { closePlayerMenu(); plSetCoWho(''); return; }
if (kind === 'back') { if (plMenu) openPlayerMenu(plMenu); else closePlayerMenu(); return; }
if (kind === 'invite' && plMenu) {
if (!_plSingles().length) { showToast('还没有可邀的人'); return; }
plInvitePick();
return;
}
}
function plOpenFull(on) {
plState.full = !!on;
renderPlayerFull();
}
function plGoLib() {
plOpenFull(false);
plState.tab = 'lib';
try {
if (document.body.dataset.view !== 'player' && typeof showView === 'function') showView('player');
else if (typeof renderPlayerPage === 'function') renderPlayerPage();
} catch (e) {}
}
function plBindSeek(id, trackEl) {
const el = document.getElementById(id); if (!el || el.dataset.plBound) return;
el.dataset.plBound = '1';
const ratio = ev => {
const r = (trackEl || el).getBoundingClientRect();
if (!r.width) return 0;
const x = (ev.touches && ev.touches[0] ? ev.touches[0].clientX : ev.clientX) - r.left;
return Math.max(0, Math.min(1, x / r.width));
};
el.addEventListener('pointerdown', ev => { el.setPointerCapture && el.setPointerCapture(ev.pointerId); plSeekRatio(ratio(ev)); });
el.addEventListener('pointermove', ev => { if (ev.buttons) plSeekRatio(ratio(ev)); });
}
bindPlayerOnce();
plBindSeek('plProgFull');
document.addEventListener('pause', function (e) { if (e.target === plAudio) _plPosSave(true); }, true);
window.addEventListener('pagehide', function () { try { _plPosSave(true); } catch (e) {} });
function plSeekBy(d) {
const a = plAudio; if (!a) return;
const dur = Number.isFinite(a.duration) ? a.duration : 0;
if (!dur) return;
try { a.currentTime = Math.max(0, Math.min(dur - 0.5, (Number(a.currentTime) || 0) + d)); } catch (e) {}
}
document.addEventListener('keydown', function (e) {
if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
const el = e.target || {};
const tag = String(el.tagName || '').toUpperCase();
if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable) return;
const onPlayer = (document.body.dataset.view === 'player') || !!plState.full;
if (!onPlayer) return;
if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); plToggle(); return; }
if (e.code === 'ArrowLeft') { e.preventDefault(); plSeekBy(-5); return; }
if (e.code === 'ArrowRight') { e.preventDefault(); plSeekBy(5); return; }
});
(function () {
let lp = 0, x = 0, y = 0;
const stop = function () { if (lp) { clearTimeout(lp); lp = 0; } };
document.addEventListener('pointerdown', function (e) {
const chip = e.target && e.target.closest ? e.target.closest('[data-pl-list]') : null;
if (!chip) return;
const id = chip.dataset.plList; x = e.clientX; y = e.clientY;
lp = setTimeout(function () { lp = 0; try { openListMenu(id, plState.listWho); } catch (err) {} }, 500);
}, true);
document.addEventListener('pointermove', function (e) {
if (lp && (Math.abs(e.clientX - x) > 8 || Math.abs(e.clientY - y) > 8)) stop();
}, true);
document.addEventListener('pointerup', stop, true);
document.addEventListener('pointercancel', stop, true);
})();

(window.__CHUNK_OK__ = window.__CHUNK_OK__ || {})['player'] = true;
/* 播放器设置持久化：刷新 / 闪退重进后恢复「歌词」「悬浮小框」。
 * 开关存在 data.lyricOn / data.plFloatOn（切换时已落盘），这里在 chunk
 * 就绪后补一次渲染，把状态重新画出来，不必再手动重设一遍。 */
(function () {
const boot = () => {
try { if (typeof renderPlayerFull === 'function') renderPlayerFull(); } catch (e) {}
try { if (typeof renderPlFloat === 'function') renderPlFloat(); } catch (e) {}
try { if (plState.lrc && typeof plLrcEnsure === 'function') plLrcEnsure(); } catch (e) {}
};
if (document.readyState === 'complete') setTimeout(boot, 0);
else window.addEventListener('load', () => setTimeout(boot, 0), { once: true });
})();
