/* ============================================================================
 * feat_mine.js —— 叠加在原站 v26.0.5 上的「我的功能」补丁
 * ----------------------------------------------------------------------------
 * 内容全部照搬我自己那版网站的 OSS 实现（原样，不是简化版）：
 *   1. 云端图库核心：OSS V4 签名 / 压缩直传 / oss:// 引用现场签名复活 / 批量迁移
 *   2. 云端数据备份与恢复：整份数据传到 OSS backup/ 前缀，5 分钟自动备份 + 手动 + 从云端恢复
 *   3. 设置页「云端图库」折叠卡片：和原版一模一样的位置、按钮、文案
 *   4. 设置页操作分支：保存并测试 / 测试 / 迁移 / 断开 / 备份 / 恢复 / 自动备份开关
 *   5. v26 适配层：让原站的图片渲染认识 oss://、上传走 OSS、storageAct 接管 OSS 分支
 *   6. img.src 钩子：把解析器交给 feat_oss_boot.v3.js 装好的 setter，
 *      任何 `img.src = 'oss://…'` 都能显示（一起听卡片头像就是这么没的）
 *
 * 不改原站任何源码，只做运行时 patch。原站更新时只需换基底、重贴这个文件。
 * ========================================================================== */
(function () {
  'use strict';

  var MINE_VER = 'v1.0.0';
  var MINE_LOG = function () { try { console.log.apply(console, ['[mine]'].concat([].slice.call(arguments))); } catch (e) {} };

/* ============================================================================
 * 第 1 部分：云端图库核心（照搬原版，OSS V4 签名 + 上传 + 迁移 + 复活）
 * ========================================================================== */

/* ===== 云端图库（阿里云 OSS · V4 私有签名直链，与 milk 同款） =====
 * 新图片压缩后直接传 OSS，存档里只留一条 oss:// 引用；显示时现场签名读取。
 * 配置和 milk 通用：同一套 Bucket / 地域 / AccessKey 填进来就能用。
 * 签名用的是 OSS V4（OSS4-HMAC-SHA256）——阿里云已经停用了旧版 V1 签名，
 * 继续用 V1 必然 403（错误码 0002-00000080）。私有 Bucket 就能用，不用开公共读。
 * 密钥只保存在本机。
 */
const OSS_CFG_KEY = '__oss-cfg';
const OSS_UPLOAD_MIN = 2048;

/* ---------- 同步 SHA-256 / HMAC-SHA256（纯 JS） ----------
 * OSS V4 签名要能在同步渲染路径上算出来——图片的 src 是同步拼出来的，
 * 等不了 crypto.subtle 的 Promise，所以这里自己写一份同步版。 */
const _OSS_SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);
function _ossRotr(x, n) { return ((x >>> n) | (x << (32 - n))) >>> 0; }
function _ossUtf8(s) {
  try { return new TextEncoder().encode(String(s == null ? '' : s)); }
  catch (e) { return new Uint8Array(0); }
}
function _ossSha256(input) {
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const len = input.length;
  const total = ((len + 9 + 63) >> 6) << 6;
  const msg = new Uint8Array(total);
  msg.set(input);
  msg[len] = 0x80;
  const dv = new DataView(msg.buffer);
  const bitLen = len * 8;
  dv.setUint32(total - 8, Math.floor(bitLen / 4294967296));
  dv.setUint32(total - 4, bitLen >>> 0);
  const w = new Uint32Array(64);
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15], y = w[i - 2];
      const s0 = (_ossRotr(x, 7) ^ _ossRotr(x, 18) ^ (x >>> 3));
      const s1 = (_ossRotr(y, 17) ^ _ossRotr(y, 19) ^ (y >>> 10));
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let i = 0; i < 64; i++) {
      const S1 = _ossRotr(e, 6) ^ _ossRotr(e, 11) ^ _ossRotr(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const t1 = (h + S1 + ch + _OSS_SHA256_K[i] + w[i]) >>> 0;
      const S0 = _ossRotr(a, 2) ^ _ossRotr(a, 13) ^ _ossRotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) odv.setUint32(i * 4, H[i]);
  return out;
}
function _ossHmacSha256(keyBytes, msgBytes) {
  const B = 64;
  let k = keyBytes;
  if (k.length > B) k = _ossSha256(k);
  const oKey = new Uint8Array(B), iKey = new Uint8Array(B);
  for (let i = 0; i < B; i++) { oKey[i] = 0x5c; iKey[i] = 0x36; }
  for (let i = 0; i < k.length; i++) { oKey[i] ^= k[i]; iKey[i] ^= k[i]; }
  const inner = new Uint8Array(B + msgBytes.length);
  inner.set(iKey); inner.set(msgBytes, B);
  const ih = _ossSha256(inner);
  const outer = new Uint8Array(B + 32);
  outer.set(oKey); outer.set(ih, B);
  return _ossSha256(outer);
}
function _ossBytesToHex(b) {
  let hex = '';
  for (let i = 0; i < b.length; i++) { const h = b[i].toString(16); hex += (h.length === 1 ? '0' : '') + h; }
  return hex;
}
function _ossSha256Hex(str) { return _ossBytesToHex(_ossSha256(_ossUtf8(str))); }

/* ---------- OSS V4 签名（照抄 milk：OSS4-HMAC-SHA256） ---------- */
const OSS_V4_ALGO = 'OSS4-HMAC-SHA256';
const OSS_V4_MAX_EXPIRES = 604800;
function _ossEncode(str, encodeSlash) {
  let t = encodeURIComponent(String(str == null ? '' : str)).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
  if (!encodeSlash) t = t.replace(/%2F/g, '/');
  return t;
}
function _ossIso8601(d) {
  const p = n => (n < 10 ? '0' + n : '' + n);
  return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + 'T'
    + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds()) + 'Z';
}
function _ossDateStamp(d) {
  const p = n => (n < 10 ? '0' + n : '' + n);
  return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate());
}
function _ossV4SignedUrl(cfg, method, objectKey, extraQuery, contentType, expiresSeconds, when) {
  const now = when || new Date();
  const dateTime = _ossIso8601(now);
  const dateStamp = _ossDateStamp(now);
  const region = String(cfg.region || '').replace(/^oss-/, '');
  const host = cfg.bucket + '.' + cfg.region + '.aliyuncs.com';
  const scope = dateStamp + '/' + region + '/oss/aliyun_v4_request';
  const query = {};
  if (extraQuery) { for (const k in extraQuery) { if (Object.prototype.hasOwnProperty.call(extraQuery, k)) query[k] = String(extraQuery[k]); } }
  query['x-oss-signature-version'] = OSS_V4_ALGO;
  query['x-oss-credential'] = cfg.ak + '/' + scope;
  query['x-oss-date'] = dateTime;
  query['x-oss-expires'] = String(Math.min(Math.max(Number(expiresSeconds) || 120, 1), OSS_V4_MAX_EXPIRES));
  query['x-oss-additional-headers'] = 'host';
  const qKeys = Object.keys(query).sort();
  const canonicalQuery = qKeys.map(k => _ossEncode(k, true) + '=' + _ossEncode(query[k], true)).join('&');
  const canonicalUri = '/' + cfg.bucket + '/' + (objectKey ? _ossEncode(objectKey, false) : '');
  const requestPath = '/' + (objectKey ? _ossEncode(objectKey, false) : '');
  const hdrs = { 'host': host };
  if (contentType) hdrs['content-type'] = contentType;
  const hKeys = Object.keys(hdrs).sort();
  const canonicalHeaders = hKeys.map(k => k + ':' + hdrs[k]).join('\n') + '\n';
  const canonicalRequest = [method, canonicalUri, canonicalQuery, canonicalHeaders, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const stringToSign = [OSS_V4_ALGO, dateTime, scope, _ossSha256Hex(canonicalRequest)].join('\n');
  const kDate = _ossHmacSha256(_ossUtf8('aliyun_v4' + cfg.sk), _ossUtf8(dateStamp));
  const kRegion = _ossHmacSha256(kDate, _ossUtf8(region));
  const kService = _ossHmacSha256(kRegion, _ossUtf8('oss'));
  const kSigning = _ossHmacSha256(kService, _ossUtf8('aliyun_v4_request'));
  const signature = _ossBytesToHex(_ossHmacSha256(kSigning, _ossUtf8(stringToSign)));
  return 'https://' + host + requestPath + '?' + canonicalQuery + '&x-oss-signature=' + _ossEncode(signature, true);
}

/* ---------- OSS 错误码 -> 人话 ---------- */
function _ossCodeOf(txt) { const m = /<Code>([^<]+)<\/Code>/.exec(txt || ''); return m ? m[1] : ''; }
function _ossMsgOf(txt) { const m = /<Message>([^<]+)<\/Message>/.exec(txt || ''); return m ? m[1] : ''; }
function _ossFriendly(code, message, status) {
  if (code === 'InvalidAccessKeyId') return 'AccessKey ID 不对';
  if (code === 'SignatureDoesNotMatch') return 'AccessKey Secret 不对';
  if (code === 'NoSuchBucket') return '找不到这个 Bucket：Bucket 名和地域是不是对不上';
  if (code === 'AccessDenied') return '权限不够：这个 AccessKey 没有这个 Bucket 的读写权限';
  if (code === 'InvalidArgument') return '参数不对：地域要写 oss-cn-hangzhou 这种完整 ID';
  if (code === 'RequestTimeTooSkewed') return '设备时间不准：请把系统时间调成自动同步';
  if (code === 'SecurityTokenExpired') return '临时凭证过期了：重新填一次 AccessKey';
  if (code === '0002-00000080') return '这个 Bucket 还在用已被停用的旧版签名：请到阿里云控制台升级 Bucket 后再试';
  if (code === 'NoSuchKey') return '云端找不到这个文件';
  if (code === 'EntityTooLarge') return '文件太大：超出单次上传上限';
  if (status === 403) return '权限被拒绝（403）：查一下 AccessKey 权限、Bucket 地域，以及 Bucket 是否还在用旧版签名';
  if (status === 404) return '资源不存在（404）：Bucket 名或地域填错了';
  if (!status) return '网络不通：检查网络，以及 Bucket 有没有开跨域(CORS)';
  return message || ('请求失败（HTTP ' + status + '）');
}

/* OSS 配置读取：三通道（内存 → 主数据 IndexedDB → localStorage 独立键）
 * 为什么要内存缓存：以前每次都从存储读，保存完立刻读回可能还是旧值/空，
 * 于是出现「测试连接成功了，状态却还是未连接」的怪象。
 * 为什么要独立 localStorage 键：主键 ordinal-bg-__oss-cfg 会被
 * App 的数据镜像挤爆配额，写入被 catch 静默吞掉 → 配置丢失。
 */
let __ossCfgMem = null;
/* OSS 配置读取：四路来源，**字段级合并**。
 * 为什么不能"第一个有 bucket 的就整体返回"：
 *   data.oss 会被整份镜像进 localStorage，镜像一写不下（配额满）就可能只剩
 *   bucket/ak 而丢了 sk；旧写法会先返回这份"缺 sk"的，于是 localStorage 里
 *   那份带 sk 的再也轮不到 —— 表现就是「刷新后又要重填密钥、云端图片不出来」。
 * 现在：谁有 sk 就用谁的，四个来源各出各的力，凑成一份完整的。 */
function ossCfgLoad() {
  const cands = [];
  try { if (__ossCfgMem && __ossCfgMem.bucket) cands.push(__ossCfgMem); } catch (e) {}
  try { if (typeof data === 'object' && data && data.oss && data.oss.bucket) cands.push(data.oss); } catch (e) {}
  try { const s = localStorage.getItem('ordinal-oss-cfg'); const c = s ? JSON.parse(s) : null; if (c && c.bucket) cands.push(c); } catch (e) {}
  try { const s = gGet(OSS_CFG_KEY); const c = s ? JSON.parse(s) : null; if (c && c.bucket) cands.push(c); } catch (e) {}
  /* sk 单独再存一小格：整份镜像写不下时，这一小格还在 */
  try { const sk = localStorage.getItem('ordinal-oss-sk'); if (sk) cands.push({ bucket: '~', sk: sk }); } catch (e) {}
  if (!cands.length) return null;
  const m = { bucket: '', region: '', ak: '', sk: '', publicRead: false, connectedAt: 0 };
  for (const c of cands) {
    if (!c) continue;
    if (c.bucket && c.bucket !== '~' && !m.bucket) m.bucket = c.bucket;
    if (c.region && !m.region) m.region = c.region;
    if (c.ak && !m.ak) m.ak = c.ak;
    if (c.sk && !m.sk) m.sk = c.sk;          /* ★ sk 从任何一个来源补齐 */
    if (c.publicRead) m.publicRead = true;
    if (c.connectedAt && !m.connectedAt) m.connectedAt = c.connectedAt;
  }
  if (!m.bucket) return null;
  __ossCfgMem = m;
  return m;
}
/* OSS 配置并入主数据 data.oss：和字卡/聊天走同一条 IndexedDB 通道，刷新/闪退都不丢 */
/* OSS 配置保存：内存 + 主数据(IndexedDB) + localStorage 独立键，三处都写。
 * 写完立刻 flushSave()，不等 1.2 秒防抖 —— 之前「保存后刷新就没了」
 * 就是因为防抖窗口内进程被杀。
 * localStorage 写入失败不静默：记到 __ossCfgLsFail，设置页会提示。
 */
let __ossCfgLsFail = false;
function ossCfgSave(c) {
  try { __ossCfgMem = c; } catch (e) {}
  try { if (typeof data === 'object' && data) { data.oss = c; save(); } } catch (e) {}
  try {
    localStorage.setItem('ordinal-oss-cfg', JSON.stringify(c));
    __ossCfgLsFail = false;
  } catch (e) { __ossCfgLsFail = true; }
  /* SK 单独再存一小格：整份数据镜像写不下时，这一小格还是写得进的，
     下次刷新还能把密钥找回来（不然就得重填）。 */
  try { if (c && c.sk) localStorage.setItem('ordinal-oss-sk', String(c.sk)); } catch (e) {}
  try { flushSave(); } catch (e) {}
  try { _ossUrlCacheClear(); } catch (e2) {}
  /* 配置刚存好 → 立刻把页面上还挂着占位图 / 原始 oss:// 引用的云端图片
   * 重新解析出来，不用等用户手动刷新。 */
  try { setTimeout(function () { try { ossReviveImgs(); } catch (e) {} }, 80); } catch (e) {}
}
function ossCfgClear() {
  /* 顺序要紧：先把 localStorage 两个键清掉，再写 data.oss 并 save()。
     因为 save() 被「云端自动备份」包了一层，它内部会调 ossReady() → ossCfgLoad()，
     而 ossCfgLoad() 会顺手把读到的东西写回 __ossCfgMem。
     以前是先 save() 后清 localStorage，于是那一刻配置又被从 localStorage
     读回内存缓存，表现成「点了断开还是显示已连接」。
     最后再兜一次内存缓存，确保彻底断开。 */
  try { localStorage.removeItem('ordinal-oss-cfg'); } catch (e) {}
  try { localStorage.removeItem('ordinal-oss-sk'); } catch (e) {}
  try { __ossCfgMem = null; } catch (e) {}
  try { if (typeof data === 'object' && data) { data.oss = null; save(); } } catch (e) {}
  try { __ossCfgMem = null; } catch (e) {}
  try { _ossUrlCacheClear(); } catch (e2) {}
}
/* 就绪判定：只要 Bucket/地域/AK/SK 四项齐全就算就绪。
 * 原来还要求 connectedAt，一旦那一个字段没落盘就永远「未连接」，
 * 于是所有 oss:// 引用都解析不出来 → 头像/背景/表情全白。 */
function ossReady() { const c = ossCfgLoad(); return !!(c && c.bucket && c.region && c.ak && c.sk); }
function ossHost(cfg) { return cfg.bucket + '.' + cfg.region + '.aliyuncs.com'; }

/* 签名 URL 缓存：同一张图只签一次。
 * 之前每渲染一次就重签一次 -> URL 每次都变 -> 浏览器缓存全部失效 -> 图一张张重下 -> 越看越卡。 */
const _OSS_URL_CACHE = new Map();
const OSS_URL_TTL = 6 * 24 * 3600;
/* 缓存要装得下「全站所有图」。以前是 500，可一个用了几年的站点有 5000+ 张图，
 * 一轮遍历就把 500 格冲干净，第二轮等于从零再算一遍（实测 5369 张 332ms，
 * 第二轮仍是 339ms，缓存完全没用上）。
 * 后来提到 8000 —— 还是不够：同一张图在缓存里占两个 key（缩略 w720 一个、
 * 原图一个），5369 张其实是 10738 条，8000 格照样装不下，翻到后面仍在重算。
 * 现在 32000：够 1.5 万张图（3 万条），约 29MB 字符串。这点内存跟图片解码
 * 比起来微不足道 —— 720px 缩略解一张就是 2MB 位图。 */
const OSS_URL_CACHE_MAX = 32000;
function _ossUrlCacheClear() { try { _OSS_URL_CACHE.clear(); } catch (e) {} }
function _ossUrlCacheGet(k) {
  const hit = _OSS_URL_CACHE.get(k);
  if (!hit) return '';
  if (hit.exp <= Date.now()) { _OSS_URL_CACHE.delete(k); return ''; }
  /* 命中就挪到队尾。原来是先进先出：一口气看 8000 张，最早那批就被挤掉了，
   * 往回翻又要重签。挪一下之后，淘汰的永远是「最久没看过」的那张。 */
  try { _OSS_URL_CACHE.delete(k); _OSS_URL_CACHE.set(k, hit); } catch (e) {}
  return hit.url;
}
function _ossUrlCacheSet(k, url) {
  try {
    if (_OSS_URL_CACHE.size >= OSS_URL_CACHE_MAX) {
      const it = _OSS_URL_CACHE.keys().next();
      if (!it.done) _OSS_URL_CACHE.delete(it.value);
    }
    _OSS_URL_CACHE.set(k, { url: url, exp: Date.now() + OSS_URL_TTL * 1000 });
  } catch (e) {}
}
/* w：要多少像素宽。传了就把 x-oss-process 一起签进 query（V4 签名的 query
 * 参与计算，直接拼参数会 SignatureDoesNotMatch，必须签进去）。 */
function ossSignedGetUrl(cfg, key, ttlSec, w) {
  const ck = cfg.bucket + '|' + cfg.region + '|' + cfg.ak + '|' + key + (w ? '|w' + w : '');
  if (!ttlSec) { const hit = _ossUrlCacheGet(ck); if (hit) return hit; }
  const ttl = Math.min(Math.max(Number(ttlSec) || OSS_URL_TTL, 60), OSS_V4_MAX_EXPIRES);
  const q = w ? { 'x-oss-process': 'image/resize,w_' + w + '/quality,q_80' } : {};
  const url = _ossV4SignedUrl(cfg, 'GET', key, q, '', ttl);
  if (!ttlSec) _ossUrlCacheSet(ck, url);
  return url;
}

const OSS_SCHEME = 'oss://';
function ossIsRef(v) { return typeof v === 'string' && v.indexOf(OSS_SCHEME) === 0; }
/* 云端图库没连上时，图片位置显示一张看得懂的占位图。
 * 以前这里返回空串 -> <img src=""> -> 一片白，完全看不出是没配置还是图挂了。 */
/* 云图占位：只给 <img> 用，尺寸小（48x48），不会像背景图那样被 cover 拉满全屏。
 * 背景图（style）解析失败时一律不注入占位，避免糊住整个页面。 */
const OSS_MISS_PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">'
  + '<rect width="48" height="48" rx="8" fill="#eef0f3"/>'
  + '<text x="24" y="29" font-size="11" fill="#9aa1aa" text-anchor="middle" font-family="sans-serif">云图</text>'
  + '</svg>');

function ossDisplayUrl(v, w) {
  if (!ossIsRef(v)) return v;
  let cfg = null;
  try { cfg = ossCfgLoad(); } catch (e) { cfg = null; }
  const key = v.slice(OSS_SCHEME.length);
  if (!cfg || !cfg.bucket) return '';
  const region = String(cfg.region || '').replace(/^oss-/, '');
  if (cfg.sk) {
    try { const u = ossSignedGetUrl(cfg, key, null, w); if (u) return u; } catch (e) {}
  }
  if (region && cfg.publicRead) {
    const base = 'https://' + cfg.bucket + '.' + region + '.aliyuncs.com/' + key;
    return w ? base + '?x-oss-process=' + encodeURIComponent('image/resize,w_' + w + '/quality,q_80') : base;
  }
  return '';
}
/* 统一的图片地址解析：oss:// 引用 → 签名直链；解析不出来给一张 48x48 小占位。
 * 所有把图片地址内联进 HTML 的地方都要走它（头像库 / 表情包 / 朋友圈 / 印象簿…），
 * 否则 oss:// 引用会原样进 <img src>，浏览器加载不了 → 一片空白。
 * 返回 [url, ref]：[1] 是要写进 src 的地址，[2] 是原始 oss:// 引用（有则需要 data-oss-ref）。 */
/* ---------- 缩略图 ----------
 * 云端图是原尺寸的：一张 3000px 的手机截图，浏览器要解成 3000×3000×4B ≈ 34MB
 * 的位图，878 张就是 GB 级（诊断里那 1638MB 主要就是这笔）。
 * 列表和气泡里实际只显示两三百点宽，720px 足够，解码内存直接降到 1/17。
 * 三个前提，缺一不可，所以都做了兜底：
 *   1) 处理参数必须签进 URL（V4 的 query 参与签名）；
 *   2) gif 不能过处理（会被压成静图，表情包就死了）；
 *   3) bucket 没开图片处理时，第一张失败就全局关掉缩略、逐张回退原图。
 */
var OSS_THUMB_W = 720;
var _ossThumbOff = false;
function ossThumbIsOff() { return _ossThumbOff; }
function ossThumbOff() { _ossThumbOff = true; }
function ossThumbOK(key) {
  if (_ossThumbOff) return false;
  return !/\.gif($|\?)/i.test(String(key || ''));
}
function ossThumbURL(v) {
  if (typeof v !== 'string' || v.indexOf(OSS_SCHEME) !== 0) return v;
  var key = v.slice(OSS_SCHEME.length);
  if (!ossThumbOK(key)) { try { return ossDisplayUrl(v); } catch (e) { return ''; } }
  var u = '';
  try { u = ossDisplayUrl(v, OSS_THUMB_W); } catch (e) { u = ''; }
  if (u) return u;
  try { return ossDisplayUrl(v); } catch (e) { return ''; }
}
function ossKeyFromUrl(u) {
  try {
    var s = String(u || '');
    var i = s.indexOf('.aliyuncs.com/');
    if (i < 0) return '';
    var rest = s.slice(i + '.aliyuncs.com/'.length);
    var j = rest.indexOf('?');
    if (j >= 0) rest = rest.slice(0, j);
    return decodeURIComponent(rest);
  } catch (e) { return ''; }
}
function ossFullURL(u) {
  if (typeof u !== 'string' || u.indexOf('x-oss-process') < 0) return u;
  var key = ossKeyFromUrl(u);
  if (!key) return u;
  var f = '';
  try { f = ossDisplayUrl(OSS_SCHEME + key); } catch (e) { f = ''; }
  return f || u;
}
function ossImgURL(s, w) {
  if (typeof s !== 'string' || !s) return [s, ''];
  if (typeof ossIsRef !== 'function' || !ossIsRef(s)) return [s, ''];
  let u = '';
  try { u = ossDisplayUrl(s, w); } catch (e) { u = ''; }
  if (u) return [u, ''];
  return [OSS_MISS_PLACEHOLDER, s];
}
/* 「这是一个图片地址」的统一判断：本地 data:image 与云端 oss:// 引用都算。
 * 以前很多清洗逻辑只认 data:image，图片一上传到云端变成 oss:// 引用，
 * 就被当坏数据删掉 —— 头像库因此刷新后清空（显示 0）。 */
function ossIsImgAddr(v) {
  if (typeof v !== 'string' || !v) return false;
  if (v.indexOf('data:image/') === 0) return true;
  try { return (typeof ossIsRef === 'function') ? ossIsRef(v) : false; } catch (e) { return false; }
}


/* 把「oss:// → 签名直链」的解析器交给 boot 里装好的 img.src 钩子。
 * 没有这一步，凡是 img.src = 云端引用的地方（一起听卡片头像、动态生成的
 * 各种小图）都会先被浏览器判成坏地址、再被 onerror 删掉。 */
try {
  window.__IMG_RESOLVE = function (v) {
    if (typeof v !== 'string' || v.indexOf(OSS_SCHEME) !== 0) return { url: v, ref: '' };
    var u = '';
    try { u = ossDisplayUrl(v); } catch (e) { u = ''; }
    if (u) return { url: u, ref: v };
    return { url: OSS_MISS_PLACEHOLDER, ref: v };
  };
} catch (e) {}

/* 只要地址的版本（不需要 data-oss-ref 时用） */
function ossImgSrc(s) {
  const r = ossImgURL(s);
  return r[0];
}
/* 生成带 data-oss-ref 的 img 属性尾巴（可复活时用） */
function ossImgRefAttr(ref) {
  return ref ? ` data-oss-ref="${escapeHTML(ref)}"` : '';
}

/* 配置修好后，把页面上还挂着占位图 / 原始 oss:// 引用的云端图片重新解析成真图。
 * 没有这一步，用户得手动刷新才能看到图回来。
 * 注意：这里不能调用 fixStyle（它在观察器 IIFE 内部，外部取不到），
 * 所以背景图的替换逻辑在这里内联一份。 */
function ossReviveImgs() {
  try {
    /* 1) 之前解析失败、挂着占位图的 */
    var list = document.querySelectorAll('img[data-oss-ref]');
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var ref = el.getAttribute('data-oss-ref');
      if (!ref) continue;
      var u = ossDisplayUrl(ref);
      if (u) { el.setAttribute('src', u); el.removeAttribute('data-oss-ref'); }
    }
    /* 2) 直接把 oss:// 写进 src、还没被观察器处理的 */
    var raw = document.querySelectorAll('img[src^="oss://"]');
    for (var k = 0; k < raw.length; k++) {
      var e2 = raw[k];
      var r2 = e2.getAttribute('src');
      if (!r2) continue;
      var u2 = ossDisplayUrl(r2);
      if (u2) { e2.setAttribute('src', u2); e2.removeAttribute('data-oss-ref'); }
      else { e2.setAttribute('data-oss-ref', r2); e2.setAttribute('src', OSS_MISS_PLACEHOLDER); }
    }
    /* 3) 背景图（style 里的 oss://）—— 内联替换逻辑 */
    var st = document.querySelectorAll('[style*="oss://"]');
    for (var j = 0; j < st.length; j++) {
      try {
        var e3 = st[j];
        var sv = e3.getAttribute('style');
        if (!sv || sv.indexOf('oss://') < 0) continue;
        var nsv = sv.replace(/oss:\/\/[^"')\s]+/g, function (m) { return ossDisplayUrl(m) || m; });
        if (nsv !== sv) e3.setAttribute('style', nsv);   /* 不变就不写，否则又触发观察器 */
      } catch (e) {}
    }
    /* 放行所有「上一轮解析失败」的元素，让它们重新试一次 */
    try { if (window.__ossFxEpochBump) window.__ossFxEpochBump(); } catch (e) {}
  } catch (e) {}
}

async function ossTestConn(cfg) {
  /* 1) 先读：GET /?max-keys=1（验桶名 / 地域 / 密钥） */
  let listRes;
  try {
    listRes = await fetch(_ossV4SignedUrl(cfg, 'GET', '', { 'max-keys': '1' }, '', 120), { method: 'GET' });
  } catch (e) {
    throw new Error('连不上阿里云（' + ((e && e.message) || e) + '）：检查网络、Bucket 地域，以及 Bucket 的跨域(CORS)设置');
  }
  if (!listRes.ok) {
    const t = await listRes.text().catch(() => '');
    throw new Error(_ossFriendly(_ossCodeOf(t), _ossMsgOf(t), listRes.status));
  }
  /* 2) 再写：PUT 一个探针（验写权限） */
  const probe = 'media/__ping_' + Date.now().toString(36) + '.txt';
  let putRes;
  try {
    putRes = await fetch(_ossV4SignedUrl(cfg, 'PUT', probe, {}, 'text/plain', 120), {
      method: 'PUT', body: new Blob(['ok'], { type: 'text/plain' })
    });
  } catch (e) {
    throw new Error('连不上阿里云（' + ((e && e.message) || e) + '）：检查网络与 Bucket 的跨域(CORS)设置');
  }
  if (!putRes.ok) {
    const t = await putRes.text().catch(() => '');
    throw new Error('能读但不能写：' + _ossFriendly(_ossCodeOf(t), _ossMsgOf(t), putRes.status));
  }
  /* 3) 读回来（验签名对不对） */
  let getRes;
  try { getRes = await fetch(_ossV4SignedUrl(cfg, 'GET', probe, {}, '', 120), { method: 'GET' }); }
  catch (e) { throw new Error('连不上阿里云（' + ((e && e.message) || e) + '）：检查网络与 Bucket 的跨域(CORS)设置'); }
  if (!getRes.ok) {
    const t = await getRes.text().catch(() => '');
    throw new Error('写进去了却读不回来：' + _ossFriendly(_ossCodeOf(t), _ossMsgOf(t), getRes.status));
  }
  try { await fetch(_ossV4SignedUrl(cfg, 'DELETE', probe, {}, '', 120), { method: 'DELETE' }); } catch (e) {}
  return true;
}

async function ossCompressIfNeeded(dataUrl, maxBytes) {
  try {
    if (typeof dataUrl !== 'string' || dataUrl.indexOf('data:image/') !== 0) return dataUrl;
    if (Math.floor(dataUrl.length * 0.75) <= maxBytes) return dataUrl;
    var mime = (/^data:([^;]+)/.exec(dataUrl) || [,'image/jpeg'])[1];
    var outMime = (mime === 'image/png' || mime === 'image/webp' || mime === 'image/avif') ? 'image/jpeg' : mime;
    var img = new Image();
    img.src = dataUrl;
    try { if (img.decode) await img.decode(); else await new Promise(function (r) { img.onload = r; img.onerror = r; }); } catch (e) {}
    var w = img.naturalWidth || 0, h = img.naturalHeight || 0;
    if (!w || !h) return dataUrl;
    var scale = 1;
    while (w * h * scale * scale * 0.75 > maxBytes && scale > 0.1) scale -= 0.1;
    var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
    var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    var cx = cv.getContext('2d'); cx.drawImage(img, 0, 0, cw, ch);
    var q = 0.85, out = cv.toDataURL(outMime, q);
    while (out.length * 0.75 > maxBytes && q > 0.4) { q -= 0.1; out = cv.toDataURL(outMime, q); }
    return out;
  } catch (e) { return dataUrl; }
}

async function ossUploadDataUrl(dataUrl, cat) {
  if (typeof ossCompressIfNeeded === 'function') { try { dataUrl = await ossCompressIfNeeded(dataUrl, 5242880); } catch (e) {} }
  const cfg = ossCfgLoad();
  if (!cfg) return null;
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  const mime = m[1];
  const extMap = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp', 'image/avif': 'avif', 'image/svg+xml': 'svg' };
  const ext = extMap[mime] || 'png';
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const key = 'media/' + (cat || 'misc') + '/' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + '.' + ext;
  const fileMB = bytes.length / 1024 / 1024;
  const expires = Math.min(Math.max(Math.ceil(fileMB / 10) * 60, 120), 600);
  const url = _ossV4SignedUrl(cfg, 'PUT', key, {}, mime, expires);
  let res;
  try {
    res = await fetch(url, { method: 'PUT', body: new Blob([bytes], { type: mime }) });
  } catch (e) {
    throw new Error('连不上阿里云（' + ((e && e.message) || e) + '）：检查网络与 Bucket 的跨域(CORS)设置');
  }
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(_ossFriendly(_ossCodeOf(t), _ossMsgOf(t), res.status));
  }
  return OSS_SCHEME + key;
}

function _ossIsImgStr(v) {
  return typeof v === 'string' && v.length > OSS_UPLOAD_MIN && v.indexOf('data:image/') === 0;
}

async function ossMaybeUpload(src, cat) {
  if (!_ossIsImgStr(src)) return src;
  if (!ossReady()) {
    /* 没连上云端图库：图片只能留在本机。明确说一声，
     * 否则用户会以为「上传了」，实际根本没传，刷新后就没了。 */
    if (typeof showToast === 'function') {
      showToast('云端图库没连上，这张图只存在本机——去 设置 → 云端图库 填好 Bucket/地域/AK/SK 并保存', 5000);
    }
    return src;
  }
  try {
    const url = await ossUploadDataUrl(src, cat || 'upload');
    return url || src;
  } catch (e) {
    console.warn('[oss] 上传失败，这张图先存本地：', e);
    if (typeof showToast === 'function') {
      showToast('这张图没传到云端（只存了本机）：' + String((e && e.message) || e).slice(0, 80), 5000);
    }
    return src;   
  }
}

const _fileDataRaw = fileData;
fileData = function (file, maxEdge, quality) {
  return _fileDataRaw(file, maxEdge, quality).then(src => ossMaybeUpload(src, 'img'));
};

async function ossMigrateAll(onProg) {
  if (!ossReady()) throw new Error('先保存并测试连接');
  const hits = [];
  (function walk(o, depth) {
    if (!o || typeof o !== 'object' || depth > 40) return;
    if (Array.isArray(o)) {
      for (let i = 0; i < o.length; i++) {
        const v = o[i];
        if (_ossIsImgStr(v)) hits.push({ o: o, k: i });
        else if (v && typeof v === 'object') walk(v, depth + 1);
      }
      return;
    }
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (_ossIsImgStr(v)) hits.push({ o: o, k: k });
      else if (v && typeof v === 'object') walk(v, depth + 1);
    }
  })(data, 0);
  const total = hits.length;
  if (!total) return { total: 0, ok: 0, fail: 0, savedBytes: 0 };
  let ok = 0, fail = 0, savedBytes = 0, idx = 0;
  const CONC = 3;
  async function worker() {
    while (idx < hits.length) {
      const i = idx++;
      const h = hits[i];
      const src = h.o[h.k];
      try {
        const url = await ossUploadDataUrl(src, 'migrated');
        if (url) { savedBytes += src.length - url.length; h.o[h.k] = url; ok++; }
        else fail++;
      } catch (e) { fail++; }
      if (typeof onProg === 'function') onProg(ok + fail, total, ok, fail);
      if ((ok + fail) % 20 === 0) { try { await flushSave(); } catch (e) {} }
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  try { await flushSave(); } catch (e) {}
  return { total, ok, fail, savedBytes };
}


/* 兜底解析器：不管图片走哪条渲染路径，只要 DOM 里出现 oss:// 引用就替换成签名 URL */
(function _ossDomResolver() {
  /* 这一段以前是「闪退」的元凶：全局 MutationObserver 一有变动就对整棵子树做两次
   * querySelectorAll（img[src^=oss://] 与 [style*=oss://]），而聊天页每来一条消息
   * 就会变动几十次 -> 每次变动都全树扫两遍 -> 主线程被占满 -> 页面像崩了一样。
   * 现在改成：只处理「新增的那一小块」，而且一帧只处理一批。 */
  var R = null;
  var pending = [];
  var rafId = 0;
  /* ★ 写回前一律先比对新旧值。
   * 这一条是「全站卡死」的根治点：setAttribute 即使写入同样的字符串，
   * 浏览器也会派发一条 attribute mutation；而我们的观察器又在监听 src/style，
   * 于是「写 -> 触发 -> 再写」自激成死循环，主线程被自己刷满。
   * 实测未修前：页面静止不动，2 秒仍产生 2405 次 DOM 变更。 */
  function same(el, attr, val) {
    try { return el.getAttribute(attr) === val; } catch (e) { return false; }
  }
  function setRef(el, attr) {
    try {
      var v = el.getAttribute(attr);
      if (!v || !R(v)) return;
      var u = ossDisplayUrl(v);
      if (u) {
        if (!same(el, attr, u)) el.setAttribute(attr, u);
        if (el.getAttribute('data-oss-ref')) el.removeAttribute('data-oss-ref');
        return;
      }
      /* 解析不出来：给一张 48x48 的小占位（不会糊屏），并保留 data-oss-ref
       * 以便配置修好后能自动重新解析。已经是占位态就什么都不做。 */
      if (el.getAttribute('data-oss-ref') === v && same(el, attr, OSS_MISS_PLACEHOLDER)) return;
      if (el.getAttribute('data-oss-ref') !== v) el.setAttribute('data-oss-ref', v);
      if (!same(el, attr, OSS_MISS_PLACEHOLDER)) el.setAttribute(attr, OSS_MISS_PLACEHOLDER);
    } catch (e) {}
  }
  /* 背景图：解析成功就换掉；解析不了就原样保留，但记一笔「这一轮试过了」，
   * 否则同一个元素会被无限重试（上面 setRef 注释里说的那种死循环）。 */
  var fxEpoch = 1;
  var fxSeen = new WeakMap();
  function fixStyle(el) {
    try {
      if (!el || !el.getAttribute) return;
      var st = el.getAttribute('style');
      if (!st || st.indexOf('oss://') < 0) return;
      if (fxSeen.get(el) === fxEpoch) return;
      var nv = st.replace(/oss:\/\/[^"')\s]+/g, function (m) { return ossDisplayUrl(m) || m; });
      if (nv === st) { fxSeen.set(el, fxEpoch); return; }
      el.setAttribute('style', nv);
      fxSeen.delete(el);
    } catch (e) {}
  }
  /* 配置变了（填好密钥 / 断开重连）→ 放行所有等待复活的元素 */
  window.__ossFxEpochBump = function () { try { fxEpoch++; } catch (e) {} };
  function resolveNode(root, shallow) {
    try {
      if (!root || root.nodeType !== 1) return;
      R = (typeof ossIsRef === 'function') ? ossIsRef : null;
      if (!R) return;
      if (root.tagName === 'IMG') { setRef(root, 'src'); setRef(root, 'data-src'); }
      fixStyle(root);
      /* 属性变更（src/style 被改）只需要处理这一个元素本身；
       * 以前不管三七二十一都扫两遍子树，聊天页一长就是 O(节点数^2)。 */
      if (shallow) return;
      if (root.querySelectorAll) {
        var imgs = root.querySelectorAll('img[src^="oss://"], img[data-src^="oss://"]');
        for (var i = 0; i < imgs.length; i++) { setRef(imgs[i], 'src'); setRef(imgs[i], 'data-src'); }
        var styled = root.querySelectorAll('[style*="oss://"]');
        for (var j = 0; j < styled.length; j++) fixStyle(styled[j]);
      }
    } catch (e) {}
  }
  function flush() {
    rafId = 0;
    var list = pending;
    pending = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].el) resolveNode(list[i].el, list[i].shallow);
    }
  }
  function push(node, shallow) {
    if (!node || node.nodeType !== 1) return;
    for (var i = 0; i < pending.length; i++) {
      if (pending[i] && pending[i].el === node) {
        if (!shallow) pending[i].shallow = false;   /* 深扫优先 */
        return;
      }
    }
    if (pending.length > 400) return;                /* 极端情况下不无限堆 */
    pending.push({ el: node, shallow: !!shallow });
    if (!rafId) { try { rafId = requestAnimationFrame(flush); } catch (e) { flush(); } }
  }
  function boot() {
    try {
      R = (typeof ossIsRef === 'function') ? ossIsRef : null;
      resolveNode(document.body);
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type === 'childList') {
            for (var k = 0; k < m.addedNodes.length; k++) push(m.addedNodes[k], false);
          } else if (m.type === 'attributes') {
            if (m.attributeName === 'src' || m.attributeName === 'data-src' || m.attributeName === 'style') push(m.target, true);
          }
        }
      }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'data-src', 'style'] });
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* 启动自检：存档里有云端图片、但云端图库没连上时，主动说一句，
 * 免得用户对着一片空白猜「到底修没修」。 */
(function _ossHealthHint() {
  function probe() {
    try {
      if (typeof ossReady === 'function' && ossReady()) return;
      let cnt = 0;
      try {
        const n = Math.min(localStorage.length, 200);
        for (let i = 0; i < n; i++) {
          const k = localStorage.key(i);
          if (!k) continue;
          const val = localStorage.getItem(k);
          if (!val || val.indexOf('oss://') < 0) continue;
          const m = val.match(/oss:\/\//g);
          if (m) cnt += m.length;
          if (cnt >= 3) break;
        }
      } catch (e) {}
      if (cnt <= 0) return;
      if (typeof showToast === 'function') {
        showToast('有图片存在云端，但云端图库没连上：设置 → 云端图库，把 Bucket / 地域 / AK / SK 填一次并测试连接，图片就能全部恢复', 9000);
      }
    } catch (e) {}
  }
  setTimeout(probe, 3200);
})();

(function _ossInjectStyle() {
  if (document.getElementById('oss-form-style')) return;
  const st = document.createElement('style');
  st.id = 'oss-form-style';
  st.textContent = '.oss-form{display:flex;flex-direction:column;gap:8px;padding:4px 0 8px}'
    + '.oss-in{width:100%;box-sizing:border-box;padding:9px 12px;border-radius:10px;border:1px solid rgba(128,128,128,.35);background:transparent;color:inherit;font-size:13px;outline:none}'
    + '.oss-in:focus{border-color:var(--accent,#6aa9ff)}';
  document.head.appendChild(st);
})();

/* ============================================================================
 * 第 2 部分：云端数据备份与恢复（照搬原版，5 分钟自动 + 手动 + 恢复）
 * ========================================================================== */

/* ============================================================
 * 云端数据备份与恢复（阿里云 OSS）
 * ------------------------------------------------------------
 * 之前 OSS 只负责存图片（media/ 前缀），数据备份只落在本机文件里——
 * 一旦这台设备的存储被系统清掉，就没有第二份能救的。
 * 这里补上两条路：
 *   · 备份：把整份数据打包成 JSON，PUT 到 OSS 的 backup/ 前缀
 *   · 恢复：从 OSS 拉一份回来，走和「导入全部数据」同一套校验/合并逻辑
 * 备份文件里不含 OSS 密钥（_exportPayload 已经剔除 sk）。
 * ============================================================ */
const OSS_BACKUP_PREFIX = 'backup/';

function _ossXmlText(s) {
  return String(s == null ? '' : s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(Number(d)); })
    .replace(/&amp;/g, '&');
}

/* 列 Bucket 里的对象。
   OSS 回的是 ListBucketResult（XML），这里用正则解析而不用 DOMParser——
   手机上 XML 命名空间常让 getElementsByTagName 取不到节点。 */
async function ossListObjects(prefix, maxKeys) {
  const cfg = ossCfgLoad();
  if (!cfg) throw new Error('还没配置云端图库');
  const url = _ossV4SignedUrl(cfg, 'GET', '', {
    prefix: String(prefix || ''),
    'max-keys': String(maxKeys || 200)
  }, '', 300);
  let res;
  try {
    res = await fetch(url, { method: 'GET' });
  } catch (e) {
    throw new Error('连不上阿里云（' + ((e && e.message) || e) + '）：检查网络与 Bucket 的跨域(CORS)设置');
  }
  if (!res.ok) {
    const t = await res.text().catch(function () { return ''; });
    if (res.status === 404) return [];
    throw new Error(_ossFriendly(_ossCodeOf(t), _ossMsgOf(t), res.status));
  }
  const xml = await res.text();
  const out = [];
  const re = /<Contents>([\s\S]*?)<\/Contents>/g;
  let m;
  while ((m = re.exec(xml))) {
    const blk = m[1];
    const pick = function (tag) {
      const mm = new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>').exec(blk);
      return mm ? _ossXmlText(mm[1]) : '';
    };
    const key = pick('Key');
    if (!key) continue;
    out.push({ key: key, size: Number(pick('Size') || 0), last: pick('LastModified') });
  }
  return out;
}

/* 把一份备份（Blob）PUT 上 OSS，返回对象键 */
async function ossUploadBackupBlob(blob, filename) {
  const cfg = ossCfgLoad();
  if (!cfg) throw new Error('还没配置云端图库');
  const key = (OSS_BACKUP_PREFIX + filename).replace(/^\/+/, '');
  const ct = (blob && blob.type) ? blob.type : 'application/json';
  const url = _ossV4SignedUrl(cfg, 'PUT', key, {}, ct, 900);
  let res;
  try {
    res = await fetch(url, { method: 'PUT', body: blob });
  } catch (e) {
    throw new Error('连不上阿里云（' + ((e && e.message) || e) + '）：检查网络与 Bucket 的跨域(CORS)设置');
  }
  if (!res.ok) {
    const t = await res.text().catch(function () { return ''; });
    throw new Error(_ossFriendly(_ossCodeOf(t), _ossMsgOf(t), res.status));
  }
  return key;
}

/* 从 OSS 拉一份备份的原文 */
async function ossDownloadText(key) {
  const cfg = ossCfgLoad();
  if (!cfg) throw new Error('还没配置云端图库');
  const url = ossSignedGetUrl(cfg, key, 900);
  let res;
  try {
    res = await fetch(url, { method: 'GET' });
  } catch (e) {
    throw new Error('连不上阿里云（' + ((e && e.message) || e) + '）');
  }
  if (!res.ok) {
    const t = await res.text().catch(function () { return ''; });
    throw new Error(_ossFriendly(_ossCodeOf(t), _ossMsgOf(t), res.status));
  }
  return await res.text();
}

/* 手动备份：把当前这台设备的全部数据整份传上 OSS */
async function ossBackupNow(silent) {
  if (!ossReady()) throw new Error('还没配置云端图库：去 设置 → 云端图库 填 Bucket / 地域 / AccessKey');
  if (_ossRestoreLock) throw new Error('正在从云端恢复，先别上传——等恢复完再备份');
  let payload = null, blob = null;
  try { payload = _exportPayload(); }
  catch (e) { throw new Error('整理数据失败：' + ((e && e.message) || e)); }
  try { blob = await buildJsonBlob(payload, null); }
  catch (e) { throw new Error('这一份没能写成文件：这台设备当下腾不出这么多内存。先在 设置 → 数据 → 存储 清掉用不上的大图，再试一次'); }
  payload = null;
  const d = new Date();
  const pad = function (n) { return (n < 10 ? '0' : '') + n; };
  const name = 'zika-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate())
    + '-' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + '.json';
  const upBytes = blob ? blob.size : 0;
  const key = await ossUploadBackupBlob(blob, name);
  blob = null;
  /* 手动备份成功后：若这份已小于安全阈值，说明数据已瘦身，自动备份恢复 */
  try { if (upBytes && upBytes < OSS_AUTO_SAFE_BYTES) _ossAutoTooBig = false; } catch (e) {}
  try { localStorage.setItem('ossAutoBackupAt', String(Date.now())); } catch (e) {}
  try { ossRenderBackupList(); } catch (e) {}
  if (!silent) { try { showToast('已备份到云端：' + name, 4500); } catch (e) {} }
  return key;
}

/* 从 OSS 恢复一份备份：下载 → 校验 → 合并/覆盖 → 落盘。
   校验规则和「导入全部数据」保持一致，行为也一致（可选择合并或覆盖）。 */
async function ossRestoreFromKey(key) {
  const raw = await ossDownloadText(key);
  _ossRestoreLock = true;
  try {
    const ok = await ossApplySnapshot(raw, true);
    if (ok === false) _ossRestoreLock = false;
    return ok;
  } catch (e) {
    _ossRestoreLock = false;
    throw e;
  }
}

/* ---------- 自动（实时）备份：改完数据就自己存，你不用点任何东西 ---------- */
let _ossAutoTimer = null, _ossAutoBusy = false, _ossAutoLastAt = 0;
const OSS_AUTO_MIN_GAP = 60000;   /* 两次自动上传之间至少隔 60 秒，别把流量烧光 */
const OSS_AUTO_DEBOUNCE = 10000;  /* 停下来 10 秒没再改，就传 */
const OSS_AUTO_MAX_BYTES = 15 * 1024 * 1024;  /* 超过 15MB 不自动传（太大了，先迁移图片） */
const OSS_AUTO_SAFE_BYTES = 4 * 1024 * 1024;  /* 超过此体积不再在主线程自动序列化，避免卡顿/发烫 */
let _ossAutoTooBig = false;     /* 上一次自动备份发现数据过大 → 暂停自动备份，改由手动/迁移后恢复 */
let _ossAutoTooBigWarned = false;
/* 等主线程空闲：优先 requestIdleCallback，Safari 没有就退化成一次 setTimeout，
   再套一层「最多等 ms 毫秒」的兜底，避免一直排不上队就永远不备份。 */
function _ossIdle(ms) {
  return new Promise(function (res) {
    var done = false;
    var fin = function () { if (done) return; done = true; res(); };
    try {
      if (typeof requestIdleCallback === 'function') requestIdleCallback(fin, { timeout: ms });
      else fin();
    } catch (e) { fin(); }
    setTimeout(fin, ms);
  });
}
function _ossAutoOn() {
  try { return localStorage.getItem('ossAutoBackup') !== 'off'; } catch (e) { return true; }
}
function _ossAutoKick(force) {
  if (!ossReady() || !_ossAutoOn()) return;
  /* ★ 恢复期间一律不上传：半状态数据传上去比不传更糟 */
  if (_ossRestoreLock) return;
  /* 数据过大：活跃使用期间不排自动备份，避免每次改动都在主线程序列化十几 MB 导致卡顿、手机发烫 */
  if (_ossAutoTooBig) return;
  try { clearTimeout(_ossAutoTimer); } catch (e) {}
  const gap = Date.now() - _ossAutoLastAt;
  if (force) {
    /* 关页面/切后台：距上次不到 20 秒就不折腾了，省得每次切出去都传一遍 */
    if (gap < 20000) return;
    _ossAutoTimer = setTimeout(function () { _ossAutoRun(); }, 0);
    return;
  }
  /* 距离上次上传还不满一分钟，就等够了一并传 */
  const wait = Math.max(OSS_AUTO_DEBOUNCE, OSS_AUTO_MIN_GAP - gap);
  _ossAutoTimer = setTimeout(function () { _ossAutoRun(); }, wait);
}
async function _ossAutoRun() {
  if (_ossAutoBusy || _ossRestoreLock || !ossReady() || !_ossAutoOn() || _ossAutoTooBig) return;
  /* ★★ 最要紧的一道闸：本地实质为空时**绝不上传**。
     应用启动时本来就会走一次 save()，不加这道闸，
     启动那一刻会把一份空数据传上去，把云端那份好数据盖掉。 */
  if (_ossLocalLooksEmpty()) return;
  _ossAutoBusy = true;
  try {
    /* 序列化整份 data（几 MB 的 JSON.stringify）是纯主线程活，撞上打字/滚动
       就是一记几十毫秒的卡顿，iPhone 上还会顺带发热。先等主线程空下来再干。 */
    await _ossIdle(1200);
    let payload = _exportPayload();
    let blob = await buildJsonBlob(payload, null);
    if (blob.size > OSS_AUTO_MAX_BYTES) {
      console.warn('[oss] 数据太大，先把图片迁到云端再自动备份');
      payload = null; blob = null;
      return;
    }
    if (blob.size >= OSS_AUTO_SAFE_BYTES) {
      /* 体积过大：在主线程 JSON.stringify 十几 MB 会冻结界面好几秒
         （打字/切界面卡顿、手机发烫）。暂停自动备份，等把图片迁到云端图库、
         数据变小后自动恢复。手动「备份数据到云端」仍可传。 */
      _ossAutoTooBig = true;
      _ossAutoMaybeWarnTooBig();
      payload = null; blob = null;
      return;
    }
    await ossUploadBackupBlob(blob, 'auto/zika-latest.json');
    payload = null; blob = null;
    _ossAutoLastAt = Date.now();
    try { localStorage.setItem('ossAutoBackupAt', String(Date.now())); } catch (e) {}
  } catch (e) {
    console.warn('[oss] 自动备份没成功：', e);
  } finally { _ossAutoBusy = false; }
}
function _ossAutoMaybeWarnTooBig() {
  if (_ossAutoTooBigWarned) return;
  _ossAutoTooBigWarned = true;
  try { showToast('数据过大，已暂停自动备份以防卡顿：去 设置 → 数据 → 云端图库 把图片迁到云端，或在 设置 → 云端图库 点「备份数据到云端」手动备份', 6000); } catch (e) {}
}

/* 定时存档：每隔 5 分钟自动往云端存一份。
   —— 这是你要的「用着的时候自动间隔备份」：开着 OSS 就行，什么都不用点。
   另外改完数据停下来 10 秒也会立刻存一次，关页面/切后台再补一次。 */
const OSS_AUTO_INTERVAL = 10 * 60 * 1000;
try {
  setInterval(function () { try { _ossAutoRun(); } catch (e) {} }, OSS_AUTO_INTERVAL);
} catch (e) {}
/* 把 save() 包一层：任何一次存盘都会排一次自动备份 */
try {
  if (typeof save === 'function' && !save.__ossAutoHooked) {
    const _saveRaw = save;
    const _saveHooked = function () {
      const r = _saveRaw.apply(this, arguments);
      try { _ossAutoKick(); } catch (e) {}
      return r;
    };
    _saveHooked.__ossAutoHooked = true;
    save = _saveHooked;
  }
} catch (e) {}

/* ---------- 云端备份列表 ---------- */
async function ossRenderBackupList() {
  const el = document.getElementById('ossBackupList');
  if (!el) return;
  try { el.innerHTML = '<div class="st-note small">正在看云端备份…</div>'; } catch (e) {}
  let list = [];
  try { list = await ossListObjects(OSS_BACKUP_PREFIX, 200); }
  catch (e) {
    try { el.innerHTML = '<div class="st-note small">读不到云端备份：' + escapeHTML(String((e && e.message) || e)) + '</div>'; } catch (e2) {}
    return;
  }
  if (!list.length) {
    try { el.innerHTML = '<div class="st-note small">云端还没有备份文件。点上面的「备份数据到云端」传一份上来。</div>'; } catch (e) {}
    return;
  }
  list.sort(function (a, b) { return String(b.last || '').localeCompare(String(a.last || '')); });
  const rows = [];
  for (const it of list) {
    const t = it.last ? new Date(it.last).toLocaleString('zh-CN') : '时间未知';
    const sz = it.size > 1048576 ? (it.size / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(it.size / 1024)) + 'KB';
    const auto = it.key.indexOf('/auto/') >= 0 ? '（自动）' : '';
    rows.push('<div class="st-note small" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">'
      + '<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;">' + escapeHTML(t + ' ' + auto + ' · ' + sz)
      + '<br><span style="opacity:.55">' + escapeHTML(it.key) + '</span></span>'
      + '<button type="button" class="soft-btn" data-st-act="oss-restore-key" data-oss-key="' + escapeHTML(it.key) + '">恢复这份</button>'
      + '</div>');
  }
  try {
    el.innerHTML = '<div class="st-note small"><b>云端备份（' + list.length + ' 份）</b>· 选一份就能恢复到这台设备</div>' + rows.join('');
  } catch (e) {}
}

/* ============================================================
 * 云端备份 · 启动自检与自动备份锁
 * ------------------------------------------------------------
 * 做法照 evanlu 的 cloud-sync-engine：
 *   · 启动时自检——本地实质为空、但云端存着备份 → 主动问用户要不要恢复
 *   · 问之前先锁死同步——否则「空数据」会被当成最新状态传上去，
 *     把云端那份好数据覆盖掉（这是这类同步最容易犯的错）
 *   · 恢复过程中也锁死——半状态数据传上去比不传更糟
 *   · 恢复时保住本机的 OSS 密钥（备份文件里不含 sk）
 * ============================================================ */
let _ossRestoreLock = false;   /* 等待用户选择/正在恢复 → 禁止一切上传 */
let _ossStartChecked = false;

/* 本机是不是"实质上没有数据"（新装、或数据被系统清掉了） */
function _ossLocalLooksEmpty() {
  try {
    if (!data || typeof data !== 'object') return true;
    const hasFlow = Array.isArray(data.messages)
      ? data.messages.length > 0
      : (data.chats && typeof data.chats === 'object' ? Object.keys(data.chats).length > 0 : false);
    if (hasFlow) return false;
    const arr = ['groups', 'stickers', 'sentLetters', 'receivedLetters'];
    for (const k of arr) { if (Array.isArray(data[k]) && data[k].length) return false; }
    return true;
  } catch (e) { return false; }
}

/* 云端备份里解出可用的 payload（解不出就返回 null） */
function _ossPickSnapshotPayload(obj) {
  try {
    if (!obj || typeof obj !== 'object') return null;
    const p = (!obj.profile && obj.data && obj.data.profile) ? obj.data : obj;
    const hasFlow = Array.isArray(p.messages)
      || (p.chats && typeof p.chats === 'object' && !Array.isArray(p.chats));
    if (!p.profile || !p.behavior || !hasFlow) return null;
    if (!Array.isArray(p.groups) || !Array.isArray(p.stickers)
      || !Array.isArray(p.sentLetters) || !Array.isArray(p.receivedLetters)) return null;
    return p;
  } catch (e) { return null; }
}

/* 恢复数据后强制「清掉 Service Worker 缓存再重载」。
 * 否则 PWA 的 SW 会用缓存里的【旧版 app 外壳】去渲染刚恢复进来的【新数据】，
 * 于是启动渲染错乱（所有视图堆叠、排版崩坏、像没样式）。清缓存后 reload 必然走网络取最新外壳。 */
function kaHardReload() {
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      Promise.resolve(caches.keys()).then(function (ks) {
        return Promise.all((ks || []).map(function (k) { try { return caches.delete(k); } catch (e) { return null; } }));
      }).then(function () { location.reload(); }).catch(function () { location.reload(); });
      return;
    }
  } catch (e) {}
  location.reload();
}

/* 把云端备份写回本机。restoreOss=true 时会保住本机的 OSS 密钥。 */
async function ossApplySnapshot(raw, restoreOss) {
  let incoming = null, payload = null;
  try { incoming = JSON.parse(raw); }
  catch (e) { throw new Error('云端备份解不开，不像是一份 JSON 备份'); }
  payload = _ossPickSnapshotPayload(incoming);
  if (!payload) throw new Error('这份云端备份缺了必需的东西（消息／字卡／表情包／信件），看着不像 言字卡 导出的文件');
  const incBooks = Array.isArray(payload.collectBooks) ? payload.collectBooks : null;
  if (incBooks) { try { delete payload.collectBooks; } catch (e) {} }
  const incLayout = (payload.uiLayout && typeof payload.uiLayout === 'object' && !Array.isArray(payload.uiLayout)) ? payload.uiLayout : null;
  if (incLayout) { try { delete payload.uiLayout; } catch (e) {} }
  /* 先问用户是合并还是覆盖 */
  const mode = await _importPreview(payload, incBooks, incLayout);
  if (mode === 'cancel') return false;
  /* 保住本机的 OSS 配置：备份文件里没有 sk，覆盖过去就连不上云端了 */
  let keepOss = null;
  try { keepOss = ossCfgLoad(); } catch (e) {}
  const incOss = (payload.oss && typeof payload.oss === 'object') ? payload.oss : null;
  data = mode === 'merge' ? _mergeImportData(payload) : ensureData(payload);
  try {
    if (keepOss && keepOss.bucket) {
      data.oss = keepOss;
    } else if (incOss && incOss.bucket) {
      data.oss = incOss;   /* 有 bucket/地域/AK，SK 需要用户再填一次 */
    }
  } catch (e) {}
  try { if (typeof markTreeFull === 'function') markTreeFull(); } catch (e) {}
  try { if (typeof msgJournalClear === 'function') msgJournalClear(); } catch (e) {}
  /* 整库替换/合并后，兜底强制把全部对话消息全量重写进 MSGS_STORE。
   * split 模式下 _doSave 默认只写"脏"对话，刚导入进来的新消息相对旧签名虽是"新"的，
   * 但为避免任何脏标记/签名比对的遗漏，这里直接强制全量写——
   * 否则会出现"壳写进 all、消息却没落盘"，刷新后聊天只剩空壳、像没存住。 */
  try {
    if (typeof _splitWanted === 'function' && _splitWanted(data)) { _splitMode = true; }
    if (typeof _msgsDirtyAll !== 'undefined') { _msgsDirtyAll = true; }
  } catch (e) {}
  const saved = await flushSave();
  if (!saved) throw new Error('这一份没能写进本机主存储：先在 设置 → 数据 → 存储 清掉用不上的大图腾点空间，再试一次');
  /* 回读验证：flushSave 声称写成功了，但有些浏览器（尤其 iOS Safari PWA）
   * 在大体积写入时会"假装成功"却在事务里悄悄丢弃。这里把刚写进主库的那条
   * 读回来，确认它真的落地——否则恢复看起来成功、刷新却回到旧数据，
   * 用户完全无从排查。读不到/不一致就明确报错，而不是静默丢数据。 */
  const ok = await _ossVerifyPersisted();
  if (!ok) throw new Error('这一份没能真正写进本机主存储（写入被浏览器丢弃了）：这台设备存储空间可能不够，或浏览器限制了写入。请先清理一些空间再恢复一次。');
  /* 收藏册：云端备份里带着 collectBooks，前面为了不污染主库已临时摘出，
   * 这里在主库落盘后再单独写回 localStorage（每本一个 collect:cid 键）。
   * 不调这一步，恢复后收藏会整批消失——用户看到的"收藏没存进备份"其实是恢复时丢了。 */
  if (incBooks && incBooks.length && typeof collectImportBooks === 'function') {
    try {
      const fb = collectImportBooks(incBooks, mode === 'merge' ? 'merge' : 'over');
      if (fb && fb.failed) { try { showToast('收藏册有 ' + fb.failed + ' 本没写回本机（存储满了或浏览器不让写）'); } catch (e) {} }
    } catch (e) {}
  }
  if (incLayout && typeof uiLayoutImport === 'function') {
    try { uiLayoutImport(incLayout, mode === 'merge' ? 'merge' : 'over'); } catch (e) {}
  }
  return true;
}

/* 读回主库 all 记录，确认刚恢复的数据确实落地（_savedAt 与内存一致、且 chats 还在） */
function _ossVerifyPersisted() {
  try {
    if (typeof indexedDB === 'undefined' || !indexedDB) return true; /* 没 IndexedDB 就别拦着，交给降级逻辑 */
    const dbName = (typeof DB_NAME !== 'undefined' && DB_NAME) ? DB_NAME : 'ordinal-db';
    const store = (typeof STORE !== 'undefined' && STORE) ? STORE : 'data';
    return new Promise(function (resolve) {
      let done = false;
      const fin = function (v) { if (!done) { done = true; resolve(v); } };
      let db;
      const req = indexedDB.open(dbName);
      req.onerror = function () { fin(true); };
      req.onsuccess = function () {
        try {
          db = req.result;
          const tx = db.transaction(store, 'readonly');
          const rq = tx.objectStore(store).get('all');
          rq.onerror = function () { fin(false); };
          rq.onsuccess = function () {
            const rec = rq.result;
            try {
              if (!rec) { fin(false); return; }
              const want = data && typeof data._savedAt === 'number' ? data._savedAt : null;
              if (want && rec._savedAt !== want) { fin(false); return; }
              if (!rec.chats || typeof rec.chats !== 'object') { fin(false); return; }
              /* split 模式下 STORE 里只是空壳，真正的消息在 MSGS_STORE。
               * 这里再核对主对话的消息条数是否真的落了盘，
               * 防止"壳写进去了、消息却没写"导致刷新后消息全空。 */
              if (rec._split === 1) {
                try {
                  const chats = (data && data.chats) || {};
                  let pick = (data && data.activeChat) || '';
                  if (!chats[pick] || !Array.isArray(chats[pick].msgs) || !chats[pick].msgs.length) {
                    for (const cid in chats) { if (chats[cid] && Array.isArray(chats[cid].msgs) && chats[cid].msgs.length) { pick = cid; break; } }
                  }
                  if (pick && chats[pick] && Array.isArray(chats[pick].msgs) && chats[pick].msgs.length) {
                    const wantN = chats[pick].msgs.length;
                    const mstore = (typeof MSGS_STORE !== 'undefined' && MSGS_STORE) ? MSGS_STORE : 'msgs';
                    const mtx = db.transaction(mstore, 'readonly');
                    const mrq = mtx.objectStore(mstore).get(pick);
                    mrq.onerror = function () { fin(false); };
                    mrq.onsuccess = function () {
                      const mrec = mrq.result;
                      if (!mrec || !Array.isArray(mrec.msgs) || mrec.msgs.length !== wantN) { fin(false); return; }
                      fin(true);
                    };
                    return;
                  }
                } catch (e2) { /* 读不到就放行，交给上面那道壳校验 */ }
              }
              fin(true);
            } catch (e) { fin(false); }
          };
        } catch (e) { fin(false); }
      };
      setTimeout(function () { fin(false); }, 8000);
    });
  } catch (e) { return true; }
}

/* 启动自检：本地空、但云端有备份 → 问用户要不要拉回来 */
async function ossCheckRestoreOnStart() {
  if (_ossStartChecked || _ossRestoreLock) return;
  if (!ossReady()) return;
  if (!_ossLocalLooksEmpty()) return;
  let raw = null;
  try { raw = await ossDownloadText('auto/zika-latest.json'); }
  catch (e) { return; }   /* 云端没有这一份 → 没有可恢复的，静默 */
  if (!raw) return;
  let obj = null;
  try { obj = JSON.parse(raw); } catch (e) { return; }
  if (!_ossPickSnapshotPayload(obj)) return;
  _ossStartChecked = true;
  /* 关键：在用户做出选择之前锁死上传——本地此刻是空的，
     要是让防抖把它传上去，云端那份好数据就被空数据盖掉了。 */
  _ossRestoreLock = true;
  const when = (function () {
    try {
      const at = Number(localStorage.getItem('ossAutoBackupAt') || 0) || 0;
      return at ? new Date(at).toLocaleString('zh-CN') : '上一次';
    } catch (e) { return '上一次'; }
  })();
  const kb = Math.max(1, Math.round(raw.length / 1024));
  try {
    if (typeof openModal === 'function') {
      openModal('云端有备份', '', async function () {
        try {
          const p2 = showProgress('正在从云端恢复');
          p2(25, '正在写回这台设备…');
          await progressYield();
          const ok = await ossApplySnapshot(raw, true);
          hideProgress();
          if (ok === false) { _ossRestoreLock = false; return; }
          showToast('已从云端恢复', 4000);
          setTimeout(kaHardReload, 1200);   /* 清 SW 缓存再重载，避免旧外壳渲染新数据导致排版崩坏 */
        } catch (e) {
          hideProgress();
          _ossRestoreLock = false;
          showToast(String((e && e.message) || e), 8000);
        }
      }, {
        noInput: true,
        okText: '恢复',
        onCancel: function () { _ossRestoreLock = false; },
        staticText: '这台设备上现在没有找到数据，但云端存着一份备份（' + when + '，约 ' + kb + ' KB）。\n\n要把它恢复到这台设备吗？恢复之后，你在这台设备上新增的内容会接着往云端同步。'
      });
    } else { _ossRestoreLock = false; }
  } catch (e) { _ossRestoreLock = false; }
}

/* 配置自愈：OSS 配置存在两个地方（localStorage 独立键 + 主数据 data.oss）。
   以前只写不读、也不互填——哪一边丢了就再也读不回来，于是"保存不���住"。
   这里在数据加载完后比对两边：缺哪边就补哪边，SK 只在本机、从另一边补。 */
function ossCfgHeal() {
  try {
    /* 清掉内存缓存，让 ossCfgLoad() 重新做一次字段级合并 */
    __ossCfgMem = null;
    const m = ossCfgLoad();
    if (!m) return;
    /* 回写 localStorage：缺哪个字段补哪个 */
    try {
      const s = localStorage.getItem('ordinal-oss-cfg');
      const cur = s ? JSON.parse(s) : null;
      if (!cur || !cur.bucket || !cur.region || !cur.ak || !cur.sk) {
        localStorage.setItem('ordinal-oss-cfg', JSON.stringify(m));
      }
    } catch (e) {}
    /* 回写主数据 data.oss */
    try {
      if (typeof data === 'object' && data) {
        const cur = data.oss;
        if (!cur || !cur.bucket || !cur.region || !cur.ak || !cur.sk) {
          data.oss = m; save();
        }
      }
    } catch (e) {}
    /* SK 小格 */
    try { if (m.sk && localStorage.getItem('ordinal-oss-sk') !== m.sk) localStorage.setItem('ordinal-oss-sk', String(m.sk)); } catch (e) {}
  } catch (e) {}
}

/* 存好配置后：把设置页那个摘要刷新一下。
   （不再顺手去跑「云端有备份」的恢复询问——你不要一进网站就被问那个。） */
try {
  const _ossSaveRaw = ossCfgSave;
  ossCfgSave = function (c) {
    const r = _ossSaveRaw.apply(this, arguments);
    try { setTimeout(function () { try { cloudRefreshStatus(); } catch (e) {} }, 60); } catch (e) {}
    return r;
  };
} catch (e) {}

/* 启动时**不**自动弹恢复窗、**不**自动用云端覆盖本地——
   要恢复由用户自己在 设置 → 云端图库 →「从云端恢复」里点。
   这里只保留函数本体，供手动路径与日后需要时调用。 */
try {
  document.addEventListener('ordinal-data-ready', function () {
    /* 数据加载完 → 配置自愈（两边互填）+ 刷新设置页摘要 */
    try { ossCfgHeal(); } catch (e) {}
    try { cloudRefreshStatus(); } catch (e) {}
  });
  setTimeout(function () { try { ossCfgHeal(); } catch (e) {} }, 3000);
} catch (e) {}

/* 关页面/切后台时尽快补一次上传（iOS Safari 关页签时那一次机会） */
try {
  window.addEventListener('pagehide', function () {
    try { _ossAutoKick(true); } catch (e) {}
  });
  document.addEventListener('visibilitychange', function () {
    try { if (document.hidden) _ossAutoKick(true); } catch (e) {}
  });
} catch (e) {}

/* ============================================================================
 * 第 3 部分：设置页「云端图库」面板（照搬原版渲染）
 * ========================================================================== */

/* 清点本机还有多少张图没上云。
 * 只读字符串的 length，不复制、不切分，几百 MB 的库也能在几十毫秒内数完。 */
function _ossAuditImgs() {
  let local = 0, localBytes = 0, cloud = 0;
  function look(v) {
    if (typeof v !== 'string') return false;
    if (v.length > 2048 && v.indexOf('data:image/') === 0) { local++; localBytes += v.length; return true; }
    if (v.indexOf('oss://') === 0) { cloud++; return true; }
    return false;
  }
  try {
    (function walk(o, depth) {
      if (!o || typeof o !== 'object' || depth > 40) return;
      if (Array.isArray(o)) {
        for (let i = 0; i < o.length; i++) {
          const v = o[i];
          if (!look(v) && v && typeof v === 'object') walk(v, depth + 1);
        }
        return;
      }
      for (const k in o) {
        const v = o[k];
        if (!look(v) && v && typeof v === 'object') walk(v, depth + 1);
      }
    })(data, 0);
  } catch (e) {}
  return { local: local, localBytes: localBytes, cloud: cloud };
}

/* 把清点结果写进卡片。大数据下遍历要几十毫秒，放空闲时段做，别打断点击。 */
function fillOssAudit() {
  const el = document.getElementById('ossAudit');
  if (!el) return;
  const run = function () {
    try {
      const a = _ossAuditImgs();
      const mb = a.localBytes / 1048576;
      const sz = mb >= 1 ? (mb.toFixed(1) + ' MB') : (Math.max(1, Math.round(a.localBytes / 1024)) + ' KB');
      if (!a.local) {
        el.innerHTML = a.cloud
          ? '<b>本机图片都在云端了</b>（云端引用 ' + a.cloud + ' 张）——数据里只剩链接，不占本地体积，没有要传的。'
          : '<b>数据里没找到图片</b>（本地 0 张、云端 0 张）——可能是数据还没加载完，或者图片存在别的地方。';
      } else {
        el.innerHTML = '<b>本机还有 ' + a.local + ' 张图没上云</b>，约 ' + sz
          + '；已上云 ' + a.cloud + ' 张。点上面的「迁移本地图片到云端（省空间）」就能把它们搬上去。';
      }
    } catch (e) { el.textContent = ''; }
  };
  if (typeof requestIdleCallback === 'function') requestIdleCallback(run, { timeout: 1500 });
  else setTimeout(run, 60);
}

function cloudRender() {
  const body = document.getElementById('cloudBody');
  if (!body) return;
  const p = [];
  let _oss = null;
  try { _oss = ossCfgLoad(); } catch (e) {}
  const _ossOn = !!( _oss && _oss.bucket && _oss.region && _oss.ak && _oss.sk );
  p.push('<div class="st-hero"><b>云端图库</b><span>图片存在阿里云 OSS，本地只留一条引用——存档更轻、打开更快、备份文件也更小</span></div>');
  if (typeof __ossCfgLsFail !== 'undefined' && __ossCfgLsFail) {
    p.push(stNote('<b>本机存储写不进去了</b>：这台设备的存储空间被占满，新的改动可能存不住。请到「设置 → 数据」导出一次备份并清理大图，然后重填下面的配置。', false));
  }
  if (_ossOn) {
    p.push(stNote('已连接 <b>' + escapeHTML(_oss.bucket) + '</b>（' + escapeHTML(_oss.region) + '）——新的图片直接传云端，本地只留链接，不占存档。', true));
    p.push('<div class="st-foot">'
      + '<button type="button" class="soft-btn" data-st-act="oss-test">测试连接</button> '
      + '<button type="button" class="soft-btn" data-st-act="oss-migrate">迁移本地图片到云端（省空间）</button> '
      + '<button type="button" class="soft-btn" data-st-act="oss-off">断开</button></div>');
    p.push('<div class="st-note" id="ossAudit">正在清点本机图片…</div>');
    p.push(stNote('「迁移本地图片到云端（省空间）」会把库里还留在本地的图片一张张传上去，存好的那条链接换成云端引用；传完本地就轻了。已经上过云的不重复传。', true));
    p.push(stNote('<b>传的时候别切走页面、别锁屏</b>：浏览器在后台会暂停上传。中途停下来也没关系——每 20 张落一次盘，再点一次会接着传，已经上云的不重复传。', true));
    /* ── 数据备份：把整份数据传上云，换设备/清缓存都不怕 ── */
    let _autoOn = true, _lastAt = 0;
    try { _autoOn = _ossAutoOn(); } catch (e) {}
    try { _lastAt = Number(localStorage.getItem('ossAutoBackupAt') || 0) || 0; } catch (e) {}
    const _lastTxt = _lastAt ? new Date(_lastAt).toLocaleString('zh-CN') : '还没备份过';
    p.push('<div class="st-hero" style="margin-top:14px;"><b>云端数据备份</b><span>整份数据（聊天记录／字卡／表情包／设置）传到 OSS，换设备或本地被清都能拉回来</span></div>');
    p.push('<div class="st-foot">'
      + '<button type="button" class="soft-btn" data-st-act="oss-backup">立刻手动存一份</button> '
      + '<button type="button" class="soft-btn" data-st-act="oss-restore">从云端恢复</button> '
      + '</div>');
    p.push('<div class="st-note small">'
      + '<b>自动备份默认开着</b>——<b>每隔 5 分钟自动存一次</b>，改完东西停下来 10 秒也立刻存一次。你<b>什么都不用点</b>。'
      + '<br><label style="display:flex;align-items:center;gap:6px;cursor:pointer;margin-top:4px;">'
      + '<input type="checkbox" data-st-act="oss-auto-toggle"' + (_autoOn ? ' checked' : '') + '> '
      + '要自动备份（一般别关）</label>'
      + '<br>上次自动备份：' + escapeHTML(_lastTxt) + '　·　备份文件不含 OSS 密钥</div>');
    p.push(stNote('想立刻存档就点「立刻手动存一份」；想把云端那份拉回来看，点「从云端恢复」。', true));
    p.push('<div id="ossBackupList"></div>');
    /* ── 本机保险箱：清洗前的原始存档 ──
       v26 的清洗逻辑会「只认 data:image」，云端引用 oss:// 会被当坏数据删掉。
       就算哪天又碰上这种坑，这里也留着一份没被洗过的原件。 */
    p.push('<div class="st-hero" style="margin-top:14px;"><b>本机保险箱</b><span>每次启动、数据有变化时先把原始存档原样留一份（含 oss:// 引用）。万一以后哪个版本又误删了图，从这里把引用捞回来</span></div>');
    p.push('<div class="st-foot"><button type="button" class="soft-btn" data-st-act="oss-vault">导出最新一份原始存档</button></div>');
    p.push('<div class="st-note small" id="vaultInfo">正在读…</div>');
    /* 配置存在哪：出问题时一眼看出是"没存上"还是"读不出来" */
    try {
      const _w = [];
      if (typeof data === 'object' && data && data.oss && data.oss.bucket) _w.push('主库');
      try { if (localStorage.getItem('ordinal-oss-cfg')) _w.push('本机'); } catch (e) {}
      try { if (localStorage.getItem('ordinal-oss-sk')) _w.push('密钥'); } catch (e) {}
      p.push('<div class="st-note small">配置存在：' + (_w.length ? escapeHTML(_w.join(' · ')) : '（无）')
        + '　·　密钥（SK）存在：' + (localStorage.getItem('ordinal-oss-sk') ? '是' : '否（需重填一次）') + '</div>');
    } catch (e) {}
  } else {
    p.push(stNote('把图片存进阿里云 OSS，本地只留一条引用——存档立马变轻、打开更快、备份文件也小。和 milk 那套一样：私有 Bucket 就能用，显示时现场签名读取，<b>不用开公共读</b>。同一套 Bucket / 地域 / AccessKey 填进来即可，密钥只存在这台设备上。', true));
    p.push('<div class="oss-form">'
      + '<input id="ossInBucket" class="oss-in" placeholder="Bucket 名" value="' + escapeHTML((_oss && _oss.bucket) || '') + '">'
      + '<input id="ossInRegion" class="oss-in" placeholder="地域 ID，如 oss-cn-hangzhou" value="' + escapeHTML((_oss && _oss.region) || '') + '">'
      + '<input id="ossInAk" class="oss-in" placeholder="AccessKey ID" value="' + escapeHTML((_oss && _oss.ak) || '') + '">'
      + '<input id="ossInSk" class="oss-in" type="password" placeholder="AccessKey Secret' + ((_oss && _oss.sk) ? '（已保存，留空不变）' : '') + '" value="">'
      + '</div>');
    p.push('<div class="st-foot"><button type="button" class="soft-btn" data-st-act="oss-save">保存并测试连接</button></div>');
    p.push(stNote('用的是阿里云 OSS 的新版签名（V4 / OSS4-HMAC-SHA256），和 milk 一致；旧版签名阿里云已经停用，用旧版一定 403。Bucket 需要允许本站来源的跨域（CORS），否则浏览器不让读。', true));
    p.push(stNote('连上之后，这一块下面还会多出「<b>云端数据备份</b>」：把整份数据传到 OSS，换设备或本地被清都能拉回来。', true));
  }
  p.push('<div class="st-note small" id="cloudProgress"></div>');
  body.innerHTML = p.join('');
  if (_ossOn) { try { setTimeout(function () { fillVaultInfo(); }, 0); } catch (e) {} try { fillOssAudit(); } catch (e) {} }
}

/* 保险箱摘要：有几份、最新那份什么时候、里面挂了多少张图 */
function fillVaultInfo() {
  const el = document.getElementById('vaultInfo');
  if (!el) return;
  let p = null;
  try { p = (typeof window.__vaultList === 'function') ? window.__vaultList() : null; } catch (e) {}
  if (!p) { el.textContent = '保险箱没启用（启动脚本没加载）。'; return; }
  Promise.resolve(p).then(function (keys) {
    if (!keys || !keys.length) {
      el.innerHTML = '还没有快照。下次打开站点时会自动留一份。';
      return;
    }
    const last = keys[keys.length - 1];
    const ts = Number(String(last).replace(/^v/, '')) || 0;
    const when = ts ? new Date(ts).toLocaleString('zh-CN') : last;
    el.innerHTML = '共 <b>' + keys.length + '</b> 份，最新一份：<b>' + escapeHTML(when) + '</b>';
    try {
      window.__vaultGet(last).then(function (v) {
        if (!v) return;
        let total = 0, oss = 0;
        const walk = function (x) {
          if (typeof x === 'string') { if (x.indexOf('data:image/') === 0) total++; else if (x.indexOf('oss://') === 0) { total++; oss++; } return; }
          if (x && typeof x === 'object') { for (const k in x) walk(x[k]); }
        };
        try { walk(v); } catch (e) {}
        const by = (v.avlib && v.avlib.by) || {};
        let avN = 0;
        try { for (const k of Object.keys(by)) avN += ((by[k] && by[k].av) || []).length; } catch (e) {}
        el.innerHTML = '共 <b>' + keys.length + '</b> 份，最新一份：<b>' + escapeHTML(when) + '</b>'
          + '<br>里面挂着 <b>' + total + '</b> 张图，其中云端引用 <b>' + oss + '</b> 张；头像库 <b>' + avN + '</b> 张';
      })['catch'](function () {});
    } catch (e) {}
  })['catch'](function () {
    el.textContent = '读保险箱失败。';
  });
}

/* 云端连接状态摘要。
   以前这段逻辑只塞在 cloudViewShown 里，而 cloudViewShown 只在「用户点开那个折叠卡片」
   或者保存/迁移/断开之后才会被调��——于是设置页一打开，那个摘要永远是 index.html 里
   写死的「未连接」，哪怕配置好端端躺在本地存储里。刷新后看起来就像"没保存上"。
   现在：设置页一显示就刷新，数据加载完再刷新一次，展开卡片也刷新。 */
function cloudRefreshStatus() {
  const sum = document.getElementById('sumCloud');
  if (!sum) return;
  let c = null;
  try { c = ossCfgLoad(); } catch (e) {}
  if (c && c.bucket) sum.textContent = '已连 ' + c.bucket;
  else if (typeof __ossCfgLsFail !== 'undefined' && __ossCfgLsFail) sum.textContent = '本机存储写不进';
  else sum.textContent = '未连接';
}

function cloudViewShown() {
  const card = document.querySelector('.setting-card[data-fold="cloud"]');
  cloudRefreshStatus();
  if (card && card.classList.contains('open')) { try { cloudRender(); } catch (e) {} }
}


/* ============================================================================
 * 第 4 部分：设置页操作分支（照搬派生站 storageAct 的 OSS 段）
 * 返回 false 表示「不是我管的动作」，交给原站 storageAct 处理。
 * ========================================================================== */
function _mineOssAct(act, btn) {
  if (!act || String(act).indexOf('oss-') !== 0) return false;
  // ── 云端图库操作 ──
  if (act === 'oss-save') {
    const _v = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const cfg = { bucket: _v('ossInBucket'), region: _v('ossInRegion'), ak: _v('ossInAk'), sk: _v('ossInSk') };
    const old = ossCfgLoad() || {};
    if (!cfg.sk && old.sk) cfg.sk = old.sk;
    if (!cfg.bucket || !cfg.region || !cfg.ak || !cfg.sk) { showToast('Bucket、地域、AccessKey 都要填上'); return; }
    stArm(btn, async () => {
      try {
        await ossTestConn(cfg);
        cfg.connectedAt = Date.now();
        ossCfgSave(cfg);
        showToast('云端图库连上啦：新图片会直接传云端');
        try { cloudRender(); } catch (e) {}
        try { cloudViewShown(); } catch (e) {}
        try { ossReviveImgs(); } catch (e) {}
        return storageScan();
      } catch (e) { showToast(String(e && e.message || e), 6000); }
    });
    return;
  }
  if (act === 'oss-test') {
    stArm(btn, async () => {
      const cfg = ossCfgLoad();
      if (!cfg) { showToast('还没配置'); return; }
      try { await ossTestConn(cfg); showToast('连接正常：能传能读'); }
      catch (e) { showToast(String(e && e.message || e), 6000); }
    });
    return;
  }
  if (act === 'oss-migrate') {
    stArm(btn, async () => {
      const res = await ossMigrateAll((done, total, ok, fail) => {
        const pr = document.getElementById('cloudProgress') || document.getElementById('stProgress');
        if (pr) pr.textContent = '正在传图 ' + done + '/' + total + '（成功 ' + ok + (fail ? ' · 失败 ' + fail : '') + '）';
      });
      if (!res.total) showToast('本机图片都已经在云端了，没有要传的');
      else showToast('传完啦：' + res.ok + ' 张上云' + (res.fail ? '，' + res.fail + ' 张没传成（还留在本地）' : '') + '，本地省下约 ' + (res.savedBytes / 1024 / 1024).toFixed(1) + 'MB');
      try { cloudRender(); } catch (e) {}
      try { cloudViewShown(); } catch (e) {}
      return storageScan();
    });
    return;
  }
  if (act === 'oss-off') {
    ossCfgClear();
    showToast('已断开云端图库（云端的图片还能正常显示，新图片会存回本地）');
    try { cloudRender(); } catch (e) {}
    try { cloudViewShown(); } catch (e) {}
    _stMsg = ''; _stScanBuffered();
    return;
  }
  /* ── 云端数据备份 / 恢复 ── */
  if (act === 'oss-auto-toggle') {
    const on = !!(btn && btn.checked);
    try { localStorage.setItem('ossAutoBackup', on ? 'on' : 'off'); } catch (e) {}
    showToast(on ? '改完数据会自动备份到云端' : '自动备份已关');
    try { cloudRender(); } catch (e) {}
    return;
  }
  if (act === 'oss-backup') {
    stArm(btn, async () => {
      const pr = document.getElementById('cloudProgress');
      try { if (pr) pr.textContent = '正在把数据打包上传…'; } catch (e) {}
      try {
        await ossBackupNow(false);
        try { if (pr) pr.textContent = '已备份到云端。'; } catch (e) {}
      } catch (e) {
        const msg = String((e && e.message) || e);
        try { if (pr) pr.textContent = '备份没成功：' + msg; } catch (e) {}
        showToast(msg, 7000);
      }
    });
    return;
  }
  if (act === 'oss-restore') {
    stArm(btn, async () => {
      try { await ossRenderBackupList(); }
      catch (e) { showToast(String((e && e.message) || e), 6000); }
    });
    return;
  }
  if (act === 'oss-restore-key') {
    const key = (btn && btn.dataset && btn.dataset.ossKey) ? btn.dataset.ossKey : '';
    if (!key) return;
    stArm(btn, async () => {
      const pr = document.getElementById('cloudProgress');
      try { if (pr) pr.textContent = '正在从云端取回「' + key + '」…'; } catch (e) {}
      try {
        const p2 = showProgress('正在从云端恢复');
        p2(20, '正在下载备份…');
        await progressYield();
        p2(60, '正在写回这台设备…');
        await progressYield();
        const ok = await ossRestoreFromKey(key);
        hideProgress();
        if (ok === false) { try { if (pr) pr.textContent = '已取消恢复。'; } catch (e) {} return; }
        try { if (pr) pr.textContent = '恢复好了，正在重新加载…'; } catch (e) {}
        showToast('已从云端恢复', 4000);
        setTimeout(kaHardReload, 1200);   /* 清 SW 缓存再重载，避免旧外壳渲染新数据导致排版崩坏 */
      } catch (e) {
        hideProgress();
        const msg = String((e && e.message) || e);
        try { if (pr) pr.textContent = '恢复失败：' + msg; } catch (e2) {}
        showToast(msg, 8000);
      }
    });
    return;
  }
  if (act === 'oss-vault') {
    stArm(btn, async () => {
      const pr = document.getElementById('cloudProgress');
      try {
        const keys = await (window.__vaultList ? window.__vaultList() : []);
        if (!keys || !keys.length) { showToast('保险箱里还没有快照：下次打开站点时自动留一份', 5000); return; }
        const last = keys[keys.length - 1];
        if (pr) pr.textContent = '正在取出 ' + last + ' …';
        const v = await (window.__vaultGet ? window.__vaultGet(last) : null);
        if (!v) { showToast('这一份读不出来', 6000); return; }
        const blob = new Blob([JSON.stringify(v)], { type: 'application/json' });
        const sizeText = (blob.size >= 1048576) ? ((blob.size / 1048576).toFixed(2) + ' MB') : ((blob.size / 1024).toFixed(1) + ' KB');
        if (typeof offerSaveBlob === 'function') {
          offerSaveBlob(blob, '言字卡-原始存档-' + last + '.json', {
            title: '原始存档已生成',
            sizeText: sizeText,
            savedText: '原始存档已存好 —— 去「文件」或下载列表里找「言字卡-原始存档-' + last + '.json」'
          });
        } else {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = '言字卡-原始存档-' + last + '.json';
          document.body.appendChild(a); a.click(); a.remove();
        }
        if (pr) pr.textContent = '已导出 ' + last + '（' + sizeText + '）';
      } catch (e) {
        const msg = String((e && e.message) || e);
        if (pr) pr.textContent = '导出失败：' + msg;
        showToast(msg, 7000);
      }
    });
    return;
  }
  return false;
}

/* ============================================================================
 * 第 5 部分：v26 适配层
 * ========================================================================== */

/* --- 5.1 让原站的 imageSrcOf() 认识 oss:// 引用 ---------------------------
   v26 的 imageSrcOf 只认 data: / http 图片，oss:// 会被当成坏数据过滤掉，
   云端图片就全显示不出来。这里把 oss:// 现场签名成直链。 */
try {
  var _imgRaw = imageSrcOf;
  var _mineImageSrcOf = function (v) {
    var s = typeof v === 'string' ? v.trim() : '';
    if (s && s.indexOf('oss://') === 0) {
      try {
        var u = ossDisplayUrl(s);
        if (u) return u;
        return (typeof OSS_MISS_PLACEHOLDER === 'string') ? OSS_MISS_PLACEHOLDER : '';
      } catch (e) { return ''; }
    }
    return _imgRaw.apply(this, arguments);
  };
  _mineImageSrcOf.__minePatched = true;
  imageSrcOf = _mineImageSrcOf;
  try { window.imageSrcOf = _mineImageSrcOf; } catch (e) {}
} catch (e) { MINE_LOG('patch imageSrcOf 失败', e); }

/* --- 5.2 上传走 OSS：fileData 被 core 段接管 ---------------------------------
   core 段里已经做了 `fileData = function(...)`，这里只确认结果。 */

/* --- 5.3 storageAct 接管 OSS 动作 ----------------------------------------- */
try {
  var _stActRaw = storageAct;
  var _mineStorageAct = function (act, btn) {
    try { if (_mineOssAct(act, btn) !== false) return; } catch (e) { MINE_LOG('oss 动作出错', e); }
    return _stActRaw.apply(this, arguments);
  };
  _mineStorageAct.__minePatched = true;
  storageAct = _mineStorageAct;
  try { window.storageAct = _mineStorageAct; } catch (e) {}
} catch (e) { MINE_LOG('patch storageAct 失败', e); }

/* --- 5.4 折叠卡片展开时渲染面板（和原站 storage 卡片同一套机制）----------- */
try {
  document.addEventListener('click', function (e) {
    var hd = e.target && e.target.closest ? e.target.closest('.fold-hd') : null;
    if (!hd) return;
    var card = hd.closest('.fold');
    if (!card || card.dataset.fold !== 'cloud') return;
    if (card.classList.contains('open')) {
      setTimeout(function () { try { cloudRender(); } catch (e) {} }, 0);
    }
  });
} catch (e) {}

/* --- 5.5 设置页一显示就刷新摘要（不然永远停在 HTML 里写死的「未连接」）---- */
try {
  var _svRaw = showView;
  var _mineShowView = function (name) {
    var r = _svRaw.apply(this, arguments);
    try {
      if (name === 'settings') setTimeout(function () { try { cloudRefreshStatus(); } catch (e) {} }, 60);
    } catch (e) {}
    return r;
  };
  _mineShowView.__minePatched = true;
  showView = _mineShowView;
  try { window.showView = _mineShowView; } catch (e) {}
} catch (e) { MINE_LOG('patch showView 失败', e); }

/* --- 5.6 数据就绪后：配置自愈 + 刷新摘要 + 复活云端图片 ------------------ */
try {
  document.addEventListener('ordinal-data-ready', function () {
    try { ossCfgHeal(); } catch (e) {}
    try { cloudRefreshStatus(); } catch (e) {}
    try { ossReviveImgs(); } catch (e) {}
  });
} catch (e) {}
setTimeout(function () {
  try { ossCfgHeal(); } catch (e) {}
  try { cloudRefreshStatus(); } catch (e) {}
  try { ossReviveImgs(); } catch (e) {}
}, 3000);

/* --- 5.7 备份里不带 OSS 密钥（安全） --------------------------------------
   v26 的 _exportPayload() 就是整份 data，而 data.oss 里躺着明文 SK。
   备份文件（本地导出、云端自动备份）都会带上它 —— 一旦 Bucket 开了公共读
   或者备份被转发出去，等于把整个 Bucket 交出去。
   这里统一把 sk 摘掉，只留 bucket/地域/AK，恢复时用本机已存的 sk。 */
try {
  if (typeof _exportPayload === 'function' && !_exportPayload.__minePatched) {
    var _expRaw = _exportPayload;
    var _mineExportPayload = function () {
      var p = _expRaw.apply(this, arguments);
      try {
        if (p && p.oss && typeof p.oss === 'object') {
          var c = {};
          for (var k in p.oss) { if (Object.prototype.hasOwnProperty.call(p.oss, k) && k !== 'sk') c[k] = p.oss[k]; }
          c.__needSk = true;          /* 提示：这份备份恢复后要重填一次密钥 */
          p.oss = c;
        }
      } catch (e) {}
      return p;
    };
    _mineExportPayload.__minePatched = true;
    _exportPayload = _mineExportPayload;
    try { window._exportPayload = _mineExportPayload; } catch (e) {}
  }
} catch (e) { MINE_LOG('patch _exportPayload 失败', e); }

/* --- 5.8 调试导出（手机端排障用）---------------------------------------- */
try {
  /* 这些函数原来只在 IIFE 里，主包（app.js）用 typeof 探测时永远拿不到，
   * 于是 oss:// 引用在主包里解析成空串 —— 云端图在很多地方其实一直靠
   * img.src setter 那条钩子兜着。显式挂出来，两条路都能走通。 */
  try {
    window.ossDisplayUrl = ossDisplayUrl;
    window.ossImgURL = ossImgURL;
    window.ossImgSrc = ossImgSrc;
    window.ossThumbURL = ossThumbURL;
    window.ossFullURL = ossFullURL;
    window.ossThumbOff = ossThumbOff;
    window.ossThumbIsOff = ossThumbIsOff;
    window.ossKeyFromUrl = ossKeyFromUrl;
    window.ossCfgLoad = ossCfgLoad;
    window.ossIsRef = ossIsRef;
  } catch (e) {}
  window.__mine = {
    ver: MINE_VER,
    cfgLoad: function () { return ossCfgLoad(); },
    cfgSave: function (c) { return ossCfgSave(c); },
    cfgClear: function () { return ossCfgClear(); },
    ready: function () { return ossReady(); },
    signedUrl: function (cfg, m, k, q, ct, exp, when) { return _ossV4SignedUrl(cfg, m, k, q || {}, ct || '', exp || 900, when || new Date()); },
    displayUrl: function (ref) { return ossDisplayUrl(ref); },
    upload: function (dataUrl, cat) { return ossUploadDataUrl(dataUrl, cat || 'misc'); },
    migrate: function (cb) { return ossMigrateAll(cb); },
    testConn: function (cfg) { return ossTestConn(cfg); },
    revive: function () { return ossReviveImgs(); },
    backupNow: function () { return ossBackupNow(false); },
    restoreKey: function (k) { return ossRestoreFromKey(k); },
    renderPanel: function () { return cloudRender(); },
    refreshStatus: function () { return cloudRefreshStatus(); },
    localLooksEmpty: function () { return _ossLocalLooksEmpty(); },
    vaultList: function () { return (window.__vaultList ? window.__vaultList() : []); },
    vaultGet: function (k) { return (window.__vaultGet ? window.__vaultGet(k) : null); }
  };
} catch (e) {}

MINE_LOG('补丁就位', MINE_VER);
})();
