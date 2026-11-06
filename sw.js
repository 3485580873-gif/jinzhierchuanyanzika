// ===== 版本标记 v26.8.37（2026-11-06）：代码件并行双源（github.io + jsDelivr）+ 分片按 __CHUNK_OK__ 判整件。
//   v26.8.36：代码件按体积判真伪。
//   报障「一直白屏进不去打不开」，机器侧的来由：50KB 那条完整性下限是 2.7MB 单文件时代的尺子，
//   对现在的 2MB 主包与 900KB 主样式表等于没有——弱网下到 60KB 断线的半件照样落进代码账本；
//   而 codeCacheFirst 是「命中即返回、绝不重下」（这是故意的，见下），于是这条半件会**永远**是它：
//   主包语法不完整 ⇒ 整个 app 一行都不执行 ⇒ 每次打开都是白屏，刷新、关标签页、换网络都不好。
//   三处补：① 尺寸尺子按文件种类给足（见 minBytesFor）② 命中缓存也量一遍，不够就删掉重下
//   ③ activate 里做一次性大扫除（PURGE_TAG），把已经中毒的机器救回来——只做这一次，之后不再清。
// ===== v26.8.35：结构内联。<head> 里加了几行 criticalCss，一次只显示一页；主样式表 881KB 晚到也不会再让 45 个页面竖着堆出来。
// #545（换版后首访「加载不全」）：缓存账本一律**不带版号**。
//   旧代三个名字是 ordinal-v<ver>-static∶-data，每次 bump 就是两个新账本，activate 再把旧的两本全删掉
//   ＝**每换一次版本，缓存里那 3MB 代码件必然清零**；而入口引的两件又是内容寻址的新名字（也必然 miss）。
//   两者叠起来＝「一更新就必定全量重下」，重下那一趟只要网络打个嗝，屏上就是残缺的（报障那一屏）。
//   现在分三本，各自按自己的寿命管：
//   · ordinal-static：根十件（manifest∶icon∶入口那几张图）——几乎不变，有的就不重下。
//   · ordinal-code：外置代码件（dist/app.<ver>.css∶js）。文件名自带版号＝**内容寻址**：这一件一旦落盘就
//     永不变化，所以命中即返回、绝不后台重下（旧 SWR 那一发 cache:'reload' 每次打开都把 2MB 又下一遍）。
//     清理不按代做，按 URL 做（见 sweepCode），留最近两代。
//   · ordinal-nav：导航页 index.html。它是「每次都要最新的那一页」，但必须与 ordinal-code 成套才给
//     （见 navWithBundle）——不成套时宁可给缓存里那一份**完整能用**的旧页。
const STATIC_CACHE = 'ordinal-static';
const CODE_CACHE = 'ordinal-code';
const NAV_CACHE = 'ordinal-nav';

// ===== BUGS #3072 备份落盘通道：把文件放进这本账，用一条普通 http 地址交出去 =====
// 旧路只有一条 blob: ＋ <a download>：Chromium 系正常；但 Via 这类直接骑在系统 WebView 上的壳，
// 下载 blob 要先把字节经 JavaBridge（@JavascriptInterface 那条线程）抱回 Java 侧——文件一大
//（整包备份动辄几十上百 MB）那一趟直接把壳崩掉：屏上 toast「Exception Happended
// Thread[JavaBridge,5,main]」→ 应用闪退（vivo X300 · Via 实测；Via 仓库 #1087「无法保存 blob:
// 大型文件」同族）。这条路把字节写进 Cache API（磁盘账本，不过桥），下载走一条带
// Content-Disposition: attachment 的普通地址＝壳的自带下载器最熟的那条路。
const SAVE_CACHE = 'ordinal-save';
const SAVE_MARK = '/__save/';
const SAVE_TTL = 30 * 60 * 1000;   // 没被取走的暂存按这一限清（正常在下载那一下当场取走即删）

function saveDisposition(name) {
  const n = String(name || 'download');
  const ascii = n.replace(/[^\x20-\x7e]+/g, '_').replace(/["\\]/g, '_') || 'download';
  return 'attachment; filename="' + ascii + '"; filename*=UTF-8\'\'' + encodeURIComponent(n);
}

async function saveSweep(keepUrl) {
  try {
    const cache = await caches.open(SAVE_CACHE);
    const reqs = await cache.keys();
    const now = Date.now();
    for (const rq of reqs) {
      if (rq.url.indexOf(SAVE_MARK) < 0) continue;
      if (keepUrl && rq.url.split('?')[0] === keepUrl) continue;
      let old = 0;
      try { old = Number(new URL(rq.url).searchParams.get('t')) || 0; } catch (e) {}
      if (!keepUrl && now - old < SAVE_TTL) continue;
      try { await cache.delete(rq); } catch (e) {}
    }
  } catch (e) {}
}

async function saveServe(url) {
  const key = url.origin + url.pathname;   // 去查询串（页在地址上带了 ?t= 时间戳与文件名）
  try {
    const cache = await caches.open(SAVE_CACHE);
    const res = await cache.match(key);
    if (res) { try { await cache.delete(key); } catch (e) {} return res; }
  } catch (e) {}
  return new Response('gone', { status: 404 });
}

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-maskable.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
];

// 站点＝「一份薄入口 ＋ 两件合并件（dist/app.<ver>.css∶js）＋ 素材」：页面运行期不再请求任何
//   css/∶js/ 小文件（#474 二批把 84 发收成 2 发），所以这里也不按清单去预缓存上百件。
//   （2026-10-11 那次改成「薄入口＋运行时按 assemble.json 注片段」时这里跟着读清单；那套在双击
//    file:// 下整站起不来，10-12 收回，见 tools/_probe_file_url.js。）
//   assemble.json 仍是**源码**的唯一顺序表，由 tools/assemble.py 消费，不再进缓存。
// #431（薄入口化）：交付件清单由组装器写成 asset-manifest.json（{ver,files}），UPD_PREFETCH 预取落盘
// 按它念。
// ⚠ #474：安装期**不再预拉 asset-manifest 点名的代码件**。旧写法在 install 里把那一坨全走一遍
//   `cache:'reload'`＝与页面自己那些请求抢同一条弱网带宽（而且 reload 绕浏览器 HTTP 缓存＝同一件拉两遍），
//   正是「首访最难的时候最难」的形状。现在代码件由页面自己那一趟顺手入账（见 codeCacheFirst）：
//   页面要哪件、拉到了就存哪件，一次也不多发。根文件那十件仍旧预缓存（它们小∶且离线首屏靠它们），
//   #545 起再加一条「已经在的不再重下」。
async function precacheAll() {
  const cache = await caches.open(STATIC_CACHE);
  // 入口那两键（'./' 与 './index.html'）是**导航页**，必须每次装 SW 都重下（＝总留着最新那一页）；
  // 其余八件（manifest∶icon）内容几乎不变，有的就不重下。
  // 反过来做＝缓存里那份 index.html 停在装它的那一天，导航兜底拿它出来＝拿出一页早已过期的旧入口。
  const put = async (u, force) => {
    const abs = new URL(u, self.registration.scope).href;
    if (!force) { try { if (await cache.match(abs)) return; } catch (e) {} }
    try { await cache.add(new Request(abs, { cache: 'reload' })); } catch (e) {}
  };
  await Promise.all(STATIC_ASSETS.map((u) => put(u, /(^\.\/$|index\.html$)/.test(u))));
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAll());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await migrateIntoNewBooks();
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => /^ordinal-v\d+-/.test(k)).map((k) => caches.delete(k)));
    await purgeCodeOnce();   // v26.8.36：一次性大扫除，把已经缓存了半截主包的机器救回来
    await sweepCode();
    await saveSweep();   // BUGS #3072：上次会话没被取走的备份暂存清掉
  })());
  self.clients.claim();
});

// #545：换账本那一瞬间把旧本里的外置代码件与导航页搬过来，别让这次升级自己变成一次「缓存清零＝全量重下」。
// 只搬 dist/app.<ver>.css∶js 那一形状与导航页，旧本里别的杂件一律不搬（它们是上一代的账）。
// 键统一取「去查询串」的规范键＝与新账本的读写口径一致，否则搬过去也命中不了。
async function migrateIntoNewBooks() {
  let olds = [];
  try { olds = (await caches.keys()).filter((k) => /^ordinal-v\d+-/.test(k)); } catch (e) { return; }
  if (!olds.length) return;
  const code = await caches.open(CODE_CACHE);
  const nav = await caches.open(NAV_CACHE);
  for (const k of olds) {
    let c = null, reqs = [];
    try { c = await caches.open(k); reqs = await c.keys(); } catch (e) { continue; }
    for (const rq of reqs) {
      let p = '';
      try { p = new URL(rq.url).pathname; } catch (e) { continue; }
      const isCode = /\/(?:app|lazy)\.v[^/]+\.(css|js)$/.test(p);
      const isNav = /(^\/index\.html$|^\/$)/.test(p);
      if (!isCode && !isNav) continue;
      const key = rq.url.split('?')[0];
      try {
        const res = await c.match(rq);
        if (!res) continue;
        if (isCode) await code.put(key, res);
        else await nav.put(key, res);
      } catch (e) {}
    }
  }
}

// 代码件按 URL 清理而不是按代：只留最近两代的合并件（一代＝一对 css∶js），更早的删掉。
// 内容寻址的文件永不变，留着只为「上一代那一页还能成套」——超过两代的那一页早被新页替掉了。
async function sweepCode() {
  try {
    const code = await caches.open(CODE_CACHE);
    const reqs = await code.keys();
    const gens = {};
    for (const rq of reqs) {
      /* v26.8.30：这里以前是 /(?:app|lazy)\.(v[0-9.]+)\./——把 app 和 lazy 一起按版本号分代，
       * 只留最近两代。问题是 lazy 分片的名字带的是**它出生那一代**的号：
       * 当前这一版在用的是 lazy.v26.5.6.cards.js、lazy.v26.6.2.player.js、lazy.v27.7.5.divine.js，
       * 它们分属六个「代」，每开一次页面就被当成旧代删掉一批，
       * 下次进那一页又得重下 —— 预热永远是白干，弱网下就是「点了打不开」。
       * 现在只按代清主包（app.*，单件 2MB，才是真正该省的），分片一律留着：
       * 35 个分片加起来才 1.4MB，删了省不了多少，删错一次就是整页打不开。 */
      const m = /(?:^|\/)app\.(v[0-9.]+)\.(?:[a-z0-9-]+\.)?(css|js)$/.exec(rq.url);
      if (!m) continue;
      (gens[m[1]] = gens[m[1]] || []).push(rq);
    }
    const names = Object.keys(gens).sort(verDesc);
    for (const n of names.slice(3)) for (const rq of gens[n]) { try { await code.delete(rq); } catch (e) {} }
  } catch (e) {}
}
function verDesc(a, b) { return verNum(b) - verNum(a); }
function verNum(v) { const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(String(v || '')); return m ? (+m[1]) * 10000 + (+m[2]) * 100 + (+m[3]) : 0; }

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // 非 GET 一律放行（2026-10-27 BUGS #2126）：下面「页面导航」那条判据里有一句 url.pathname.endsWith('/')，
  // 它**不分方法**——一条发往 "/" 的 POST 会被当成导航、回一份缓存的 index.html，屏上还是 200，
  // 服务器一个字也没收到＝「假成功」（比报错更难查）。这条不是某一功能专属：缓存里没有写请求，
  // 换新无从谈起，SW 本来就不该碰 POST/PUT/DELETE。
  // ⚠ 当年是反馈表那条 POST 把它逼出来的（FEATURES #2127）；2026-10-27 反馈改成纯说明页、站内不再
  //   发任何请求，这一行**照旧留着**——它守的是「SW 不吞写请求」这件事本身，不是那张表。
  if (event.request.method !== 'GET') return;

  // BUGS #3072 备份落盘通道：先于「页面导航」那条判据——<a download> 那一发请求的 mode 就是
  // 'navigate'，落进 navWithBundle 会被当成导航页、整条通道作废。只认自己名下的地址，其余照旧。
  if (url.pathname.indexOf(SAVE_MARK) >= 0) {
    event.respondWith(saveServe(url));
    return;
  }

  // 页面导航：#545 起走「成套判定」——拿到最新那一页还不够，还得它引的那两件也在缓存里才肯交给屏上。
  // 单独把新页放出去＝把「有顶栏没内容」的空壳送上门（那一屏的来由见 html/head.html 里 #545 那段）。
  if (event.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    event.respondWith(navWithBundle(event));
    return;
  }

  // BUGS #415：version.json 完全放行、不拦截不缓存（mochi #157 同族移植）——
  // SW 对它的「网络优先」在弱网超时会回退缓存里的旧 version.json ⇒ 页面读到旧值以为已是
  // 最新＝「有新版却永远不提示、一直停在旧版」。放行后页面 fetch(cache:'reload') 直接走
  // 浏览器原生网络：要么真线上值、要么真失败，绝不拿旧缓存冒充。
  if (url.pathname.endsWith('/version.json')) return;

  // API / data requests: network-first
  if (url.pathname.endsWith('.json') || url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // #545：代码件（入口引的两件合并件∶开发版逐件引的 css∶js）**cache-first 且不后台重下**。
  // 这一族是内容寻址的（文件名带版号＝内容一变 URL 就变），落盘的那一件逐字不会变，所以：
  //   ① 命中就返回，绝不为了「确认它没变」再去网络上下一遍（旧 SWR 那一发 cache:'reload' ＝每次打开
  //      都把那 2MB 真下一遍，是「每次打开都慢」与「换版后首访必卡」共同的放大器）；
  //   ② 拿不到就是真没有，如实给 503——页面那一屏按它显示「载入没完成」并给出重载入口，
  //      而不是拿个空壳糊过去。
  if (/\.(css|js|html)$/.test(url.pathname)) {
    event.respondWith(codeCacheFirst(event.request));
    return;
  }

  // Static assets: cache-first
  event.respondWith(cacheFirst(event.request));
});

const NAV_TIMEOUT = 9000;    // v26.8.36：4.5s → 9s。github.io 现在常态 6~12s 才回第一包，4.5s 等于「永远判超时」，
                             // 永远走缓存那条兜底；那兜底又没查成套（见 navWithBundle 尾部），白屏就是这么来的。
                             // 9s 是折中：超了也还有一套能用的缓存页接着，不会更差。
const SYNC_MIN = 50000;      // 导航页完整性下限：低于 50KB 的 index.html 必是截断或错误页（页本身 130KB+）

/* v26.8.36 代码件体积尺子（解压后字节，cache 里存的就是解压后的那一份）。
 * 旧写法对所有代码件都用 SYNC_MIN=50000 —— 那是对 2.7MB 单文件入口的尺子；现在主包 2.04MB、
 * 主样式表 903KB，一份只剩 60KB 的半件照样「合格」，落盘后又被 cache-first 永久返回。
 * 这里的数按 2026-11-06 线上实测留了 ~30% 余量；将来主包瘦身到阈值以下，**必须同步改这里**，
 * 否则正品会被判成半件、每次打开都重下一遍（慢，但不会白屏——宁可慢也不能白）。 */
const MIN_MAIN_JS = 1200000;   // dist/app.v<ver>.js  实测 2042701
const MIN_MAIN_CSS = 600000;   // dist/app.v<ver>.css 实测  903132
const MIN_LAZY = 8000;         // dist/lazy.*.js      实测解压后最小 ~17KB
function minBytesFor(key) {
  if (/\/lazy\.v[^/]+\./.test(key)) return MIN_LAZY;
  if (/\/app\.v[^/]+\.js$/.test(key)) return MIN_MAIN_JS;
  if (/\/app\.v[^/]+\.css$/.test(key)) return MIN_MAIN_CSS;
  return SYNC_MIN;
}
// 这一版做过一次「清空代码账本」的抢救：中毒的机器不清就永远好不了。
// 换一个值＝再做一次全量重下（别轻易改，改一次所有用户下次开站重下 3MB）。
const PURGE_TAG = 'repair-2026-11-06-codeintegrity';
const META_CACHE = 'ordinal-meta';

// 量一份缓存件够不够长。读 blob 是解压后大小，与 minBytesFor 同一口径。
// 每次命中都真量一遍（约 5ms）：不能按 key 记「这件我验过」——账本里的东西会被 put 覆盖，
// 记过一次就等于给后来的半件发了免检通行证（这就是第一版没修好的原因）。
async function codeLooksWhole(res, key) {
  try {
    const blob = await res.clone().blob();
    if (blob.size < minBytesFor(key)) return false;
    if (/\/lazy\.v[^/]+\.js$/.test(key)) return /__CHUNK_OK__/.test(await blob.text());
    return true;
  } catch (e) { return true; }   // 量不出来就别拦，宁可放行也不要自己造成白屏
}

// 一张完整的入口页：至少 40KB（线上 460KB 原文）且有 </html> 收尾。
// 半截页在屏上就是白的，比旧页更糟 —— 旧页至少还能用。
function htmlWhole(t) {
  if (!t || t.length < 40000) return false;
  return /<\/html>\s*$/i.test(t.trim());
}

// activate 里的一次性大扫除。用一本只有一条记录的 meta 账存「已经清过哪一次」，
// 与 SW 版本号解耦：以后每次发版不再清（那正是 #545 想避免的「一更新就全量重下」）。
async function purgeCodeOnce() {
  try {
    const meta = await caches.open(META_CACHE);
    const hit = await meta.match('/__code_purge_tag__');
    const tag = hit ? await hit.text() : '';
    if (tag === PURGE_TAG) return;
    const code = await caches.open(CODE_CACHE);
    // 只删量出来不够长的那些：全清＝所有人下次开站重下 3MB，没必要。
    for (const rq of await code.keys()) {
      try {
        const r = await code.match(rq);
        if (!r) continue;
        const n = (await r.clone().blob()).size;
        if (n < minBytesFor(canon(rq.url))) await code.delete(rq);
      } catch (e) {}
    }
    // 导航账本里那张半截页也要清：它是白屏最直接的来源，留着就等于没救。
    try {
      const nav = await caches.open(NAV_CACHE);
      for (const rq of await nav.keys()) {
        let ok = false;
        try { const r = await nav.match(rq); ok = r ? htmlWhole(await r.clone().text()) : true; } catch (e) { ok = true; }
        if (!ok) await nav.delete(rq);
      }
    } catch (e) {}
    await meta.put('/__code_purge_tag__', new Response(PURGE_TAG));
  } catch (e) {}
}

// 规范键（去查询串）：导航∶代码件∶UPD_PREFETCH 三处读写同一本账，必须同一键才能互相命中
function canon(u) { const x = new URL(u); x.search = ''; return x.href; }
function navSibling(key) { return key.endsWith('/index.html') ? key.replace(/index\.html$/, '') : key + 'index.html'; }

// 这一页引了哪几件外置代码件（薄入口＝那两件 dist/app.<ver>.css∶js）
function distRefs(html) {
  const out = [];
  const re = /["']([^"']*app\.v[0-9.]+\.(?:css|js))["']/g;
  let m;
  while ((m = re.exec(html))) { if (out.indexOf(m[1]) < 0) out.push(m[1]); }
  return out;
}
async function codeHas(refs) {
  if (!refs.length) return false;
  const code = await caches.open(CODE_CACHE);
  for (const r of refs) {
    try { if (!(await code.match(new URL(r, self.registration.scope).href))) return false; } catch (e) { return false; }
  }
  return true;
}
async function fetchTimeout(request, ms) {
  const ac = (typeof AbortController === 'function') ? new AbortController() : null;
  let t = 0;
  if (ac) t = setTimeout(() => { try { ac.abort(); } catch (e) {} }, ms);
  // 2026-10-28 流量账：这一发正是「每次打开都重下整页入口」，压缩后 85KB×每一次导航。
  //   Netlify 上入口是 public,max-age=0,must-revalidate＝no-cache 仍是每次都问服务器，没变就回 304
  //   （0 字节），变了照旧拿新页，比 reload 省掉整页。github.io 上边缘缓存约 10 分钟，304 可能把
  //   上一版原样吐回来（#614 那一坑），所以那一族仍旧 reload、不碰。
  const mode = /\.github\.io$/i.test(location.hostname) ? 'reload' : 'no-cache';
  try {
    const r = await fetch(request, ac ? { cache: mode, signal: ac.signal } : { cache: mode });
    if (t) clearTimeout(t);
    return r;
  } catch (e) {
    if (t) clearTimeout(t);
    throw e;
  }
}

// ===== #545 导航：页面与它引的代码件必须**成套**才交给屏上 =====
// 三选一，按这个顺序：
//   ① 新页引的两件都在缓存里 ⇒ 上新页（最新的一页，且立刻能用）。
//   ② 新页的件还没落盘，而缓存里有一份**件齐全**的旧页 ⇒ 上旧页（用户看到的永远是一个能用的一页），
//      新页与它引的两件交给后台慢慢补齐；下次打开自然是新版的完整页。
//   ③ 缓存里连成套的旧页都没有（＝真·首访）⇒ 只能上新页：那一趟等网络的时间由开屏那根进度条扛着
//      （html/head.html 的 #545 那一屏），不再是「一句动静都没有的空白」。
// 网络那一发超时＝直接落到 ②／③；网络失败也是。旧写法 network-first 是「无限等网络、失败才回退」，
// 而挂起的连接永远等不到「失败」＝用户报的「每次都要刷新好几次」有一半是这一发造成的。
async function navWithBundle(event) {
  const request = event.request;
  const key = canon(request.url);
  const nav = await caches.open(NAV_CACHE);
  let fresh = null, text = '';
  try {
    fresh = await fetchTimeout(request, NAV_TIMEOUT);
    if (fresh && fresh.ok) text = await fresh.clone().text();
  } catch (e) { fresh = null; }
  /* v26.8.36：一张剖成两半的 index.html 也是 200、也引着那两件 dist，唯一的差别是它没有下半身。
   * 以前这种页会一路落进导航账本，之后每次打开都是纯白 —— 而且刷新无用（缓存-first 给的就是它）。
   * 判据只看两样：够不够长、有没有收尾。不合格就当这一发没拿到，走缓存那一份。 */
  if (fresh && !htmlWhole(text)) fresh = null;
  const cached = (await nav.match(key)) || (await nav.match(navSibling(key))) || (await caches.match(key));
  const ctext = cached ? await cached.clone().text() : '';

  // #614 版本守卫：github.io 的边缘缓存（约 10 分钟）可能把**上一版**的 index.html 原样吐回来。
  // 它引的旧 dist 件正好还在代码账本里（sweepCode 留两代）⇒ 下面的 codeHas 会判成「成套」，
  // 旧页于是被当成最新落账、连后台补下载都不触发＝升级过的机器原地退回旧版。
  // 判据只认 refs 里的版号：取到的那一页比账本里那一页**更旧**就不认它，直接给账本里那一份。
  const fv = htmlVer(text), cv = htmlVer(ctext);
  if (cached && fv && cv && fv < cv && (await codeHas(distRefs(ctext)))) return cached;

  if (fresh && fresh.ok && text) {
    const refs = distRefs(text);
    if (refs.length) {
      /* 服务器给的那一页比账本里的更新 ⇒ 直接给新页，不等它引的 dist 件全部落进缓存。
       * 成套判定本意是「别给一张缺资源的页」，可这张页缺的只是还没下过的 css/js，
       * 浏览器按需拉一次就有；反过来先给旧页的代价，是用户停在上一版（哪怕那一版是坏的），
       * 要连刷好几次才走到新版。版本号更高就是更新，这条判据已经够用。 */
      if (cached && fv && cv && fv > cv) {
        await navVerSave(nav, key, fresh.clone(), text);
        event.waitUntil(syncNew(key, fresh.clone(), refs, text));
        return fresh;
      }
      if (await codeHas(refs)) {
        await navVerSave(nav, key, fresh.clone(), text);
        return fresh;
      }
      if (cached) {
        const crefs = distRefs(ctext);
        if (crefs.length && (await codeHas(crefs))) {
          // 旧页成套 ⇒ 给旧页；新页那一套交给后台补（补齐了才会真正落进导航账本，见 syncNew）
          event.waitUntil(syncNew(key, fresh.clone(), refs, text));
          return cached;
        }
      }
      await navVerSave(nav, key, fresh.clone(), text);
      event.waitUntil(syncNew(key, fresh.clone(), refs, text));
      return fresh;
    }
    await navVerSave(nav, key, fresh.clone(), text);
    return fresh;
  }
  /* v26.8.36：这一段以前是「缓存里有就给」——不看那张页还站不站得住。
   * 十月底清过一次 dist 历史件（217 件），手机缓存里那页引的 app.v26.8.2x.js 已经不在了：
   * github.io 现在常常 6~12 秒才回第一包（NAV_TIMEOUT 4.5 秒必然超），于是**每一发导航都走这条**，
   * 每次都把那张引着死链的旧页送回去 ⇒ 主包 404 ⇒ 白屏，刷新一百次也一样。
   * 判据不能是「缓存里有没有」——第一次访问的人代码账本本来就是空的，那样等于把所有人一起误伤。
   * 只认一件事：那页引的主包在服务器上是不是真的 404 了。探测不到（慢、断网）一律按没死处理。 */
  if (cached) {
    const crefs = distRefs(ctext);
    if (!crefs.length || (await codeHas(crefs))) return cached;
    if (!(await refsGone(crefs))) return cached;
  }
  return fallbackPage();
}

// 只探主包那一件：它 404 就是死页，别的一概不算。
// 2.5 秒探不出来就放弃（当作没死）——这个分支只在「缓存页没有配套代码件」时才走到，平时不发请求。
async function refsGone(crefs) {
  const mainRef = crefs.filter((f) => /app\.v[0-9.]+\.js$/.test(f))[0];
  if (!mainRef) return false;
  try {
    const abs = new URL(mainRef, self.registration.scope).href;
    const r = await fetchTimeout(new Request(abs, { method: 'HEAD', cache: 'no-store' }), 2500);
    return !!r && (r.status === 404 || r.status === 410);
  } catch (e) { return false; }
}

// 白屏换成一个「能点」的页面：至少用户知道发生了什么，而且两个出口都在手边。
function fallbackPage() {
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>言字卡 · 载入没完成</title>
<style>
html,body{margin:0;height:100%}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
 background:#F7F7F5;color:#2f3136;text-align:center;padding:28px;
 font:15px/1.65 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}
h1{font-size:17px;margin:0}
p{margin:0;color:#8a8f99;font-size:13px;max-width:300px}
button{appearance:none;border:0;border-radius:12px;padding:11px 20px;font-size:15px;min-width:190px;
 background:#2f3136;color:#fff}
button.ghost{background:#e9eaee;color:#2f3136}
</style></head><body>
<h1>这次没载入成功</h1>
<p>缓存里那一页引的程序已经不在线上了。先用下面的「清一下再进」，之后就会正常。</p>
<button id="c" type="button">清一下再进</button>
<button id="r" class="ghost" type="button">只重新载入</button>
<script>
document.getElementById('r').onclick=function(){location.reload();};
document.getElementById('c').onclick=function(){
  var b=document.getElementById('c'); b.textContent='正在清理…'; b.disabled=true;
  var go=function(){location.reload();};
  if(window.caches&&caches.keys){
    caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k);}));})
      .then(go,go);
  } else { go(); }
};
<\/script></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function saveNav(nav, key, res) {
  try { nav.put(key, res.clone()); nav.put(navSibling(key), res.clone()); } catch (e) {}
}

// 一页引的 dist 合并件版号（#614）：0＝这一页不是薄入口（没有可比的版号，比不了就一律放行）
function htmlVer(html) {
  const refs = distRefs(html || '');
  let best = 0;
  for (let i = 0; i < refs.length; i++) {
    const m = /app\.(v[0-9.]+)\.(?:css|js)/.exec(refs[i]);
    if (m) best = Math.max(best, verNum(m[1]));
  }
  return best;
}

// 导航账本的唯一写手（#614）：只许「同版或更新」的那一页落账，旧页盖新页一律拒。
// 三处写手（navWithBundle ∶ syncNew ∶ UPD_PREFETCH）必须同一把尺——否则守护住门口、后门照进。
async function navVerSave(nav, key, res, text) {
  try {
    const old = (await nav.match(key)) || (await nav.match(navSibling(key)));
    if (old) {
      const ov = htmlVer(await old.clone().text());
      const nv = htmlVer(text);
      if (nv && ov && nv < ov) return false;
    }
  } catch (e) {}
  saveNav(nav, key, res);
  return true;
}

// 后台把新页引的那两件拉下来落进代码账本；**两件都齐了**才把新页本身写进导航账本。
// 只齐一半就写新页＝下次导航又变成「新页＋缺件」，用户又得再等一趟；不齐则导航账本里仍是旧页，
// 下次打开还是那一份完整能用的，直到哪一趟补满为止（补满即换，不需要用户再做任何事）。
// #614：同一套 refs 只准有一发在飞（旧写法每次导航都新起一发，弱网上两三个 3MB 抢同一条带宽＝谁也补不齐，
// iOS 冻一次 SW 就永远回到起点）；两件并发下，串行那一版把补包时间翻了一倍。
let _syncSig = '', _syncJob = null;
async function syncNew(key, freshRes, refs, text) {
  const sig = refs.join('|');
  if (_syncJob && _syncSig === sig) { try { await _syncJob; } catch (e) {} return; }
  _syncSig = sig;
  _syncJob = (async () => {
    const code = await caches.open(CODE_CACHE);
    const got = await Promise.all(refs.map((r) => {
      const abs = new URL(r, self.registration.scope).href;
      return fetch(abs).then((res) => {
        if (!res || !res.ok) return false;
        return res.clone().text().then((t) => {
          if (t.length < minBytesFor(canon(abs))) return false;   // v26.8.36：按件给尺子，2MB 主包下到 60KB 不许算数
          try { code.put(canon(abs), res); } catch (e) {}
          return true;
        });
      }).catch(() => false);
    }));
    if (got.length && got.every(Boolean)) {
      const nav = await caches.open(NAV_CACHE);
      await navVerSave(nav, key, freshRes, text || '');
    }
  })();
  try { await _syncJob; } catch (e) {}
  _syncJob = null;
}

async function codeCacheFirst(request) {
  const key = canon(request.url);
  const code = await caches.open(CODE_CACHE);
  try {
    const cached = await code.match(key);
    if (cached) {
      // v26.8.36：命中也要量。半件在这里放过去一次，这台机器就永远白屏（见文件头）。
      if (await codeLooksWhole(cached, key)) return cached;
      try { await code.delete(key); } catch (e) {}
    }
  } catch (e) {}
  let res = null;
  try { res = await fetchFast(request, key); } catch (e) { res = null; }
  if (res && res.ok) {
    const t = await res.clone().text();
    if (wholeEnough(t, key)) { try { code.put(key, res.clone()); } catch (e) {} }
    return res;
  }
  return new Response('Offline', { status: 503 });
}

/* v26.8.37：同源和镜像**同时发**，谁先拿到整件就用谁。
 * 线上实测（2026-11-06）：同一个 2MB 主包，github.io 149 秒 / jsDelivr 10 秒；
 * 播放器分片 309KB，github.io 弱网下根本过不了 45 秒那道坎。
 * 以前镜像只是页面侧的第三路兜底，而且要等两发各 45 秒才轮到它（90 秒）。
 * 放在 SW 这一层并行，弱网下第一条路就能走通。
 * 只对 github.io 生效；本地/自定义域名一律返回空，走原来那一发。 */
function mirrorUrl(key) {
  try {
    if (!/\.github\.io$/i.test(location.hostname)) return '';
    const u = new URL(key);
    const user = u.hostname.split('.')[0];
    const seg = u.pathname.split('/').filter(Boolean);   // 用户站的路径只有一段（/仓库/），
    const repo = seg[0] || '';                            // 不能像以前那样硬要两段
    if (!user || !repo) return '';
    const rest = seg.slice(1).join('/');
    if (!rest) return '';
    return 'https://cdn.jsdelivr.net/gh/' + user + '/' + repo + '@main/' + rest;
  } catch (e) { return ''; }
}
function fetchFast(request, key) {
  const p1 = fetch(request);
  const m = mirrorUrl(key);
  if (!m) return p1;
  if (typeof Promise.any !== 'function') return p1;   // 老 Safari（<14）没有 any，别为了兜底把主路搭进去
  const good = (p) => p.then((r) => {
    if (!r || !r.ok) throw new Error('bad');
    const ct = r.headers.get('content-type') || '';
    if (/text\/html/i.test(ct)) throw new Error('html');   // 镜像出错时回的是错误页，不能当代码用
    return r;
  });
  return Promise.any([good(p1), good(fetch(m, { mode: 'cors' }))]).catch(() => null);
}

/* 整件判定：分片结尾自带 (window.__CHUNK_OK__=...)[id]=true，
 * 一截断就没有它 —— 比单看体积准得多（小分片解压后才 17KB，体积下限没法给）。 */
function wholeEnough(t, key) {
  if (!t || t.length < minBytesFor(key)) return false;
  if (/\/lazy\.v[^/]+\.js$/.test(key)) return /__CHUNK_OK__/.test(t);
  return true;
}

/* v26.8.36：页面亲口说「我拿回来这一件是坏的」时，别等它自己对不上——直接删。
 * 页面侧在主包 onerror 或分片跑不出 __CHUNK_OK__ 时会发这条（含主包，不再只管分片）。 */
async function purgeCodeUrl(url) {
  try {
    const key = canon(url);
    const code = await caches.open(CODE_CACHE);
    await code.delete(key);
    
  } catch (e) {}
}

// 2026-10-28 流量账：后台那一发从 cache:'reload' 改成 cache:'no-cache' ＋ 一小时节流。
//   reload 是**无条件**重下：每一张牌面（32～47KB）每打开一次就整张再下一次，命中缓存也照走；
//   实测线上 402MB/小时里绝大部分是这一发（254 张牌面 × 每次打开）。no-cache 仍然强制向服务器
//   确认一次（内容真变了照样拿到新版，不会把旧图写回，FIX #038 的初衷不变），但内容没变时服务器
//   回 304、0 字节；一小时内重复命中连这一发也不发。SW 实例被回收后 _revAt 归零＝下次重新确认一次，
//   无害（正是想要的：实例活着就别重复问）。
const REV_TTL = 60 * 60 * 1000;
// 图片按**天**复检（BUGS #3098 二批）：牌面图预热进缓存之后，图鉴一开就是 158 张 cache-first 命中，
// 每张命中都触发一发 revLater＝每小时 158 发条件请求，弱网下纯白付往返（图这一族内容极少变，一天确认一次足够）。
const REV_TTL_IMG = 24 * 60 * 60 * 1000;
const _revAt = new Map();

function revLater(request) {
  const k = request.url;
  let img = false;
  try { img = /\.(webp|png|jpe?g|gif|svg)$/i.test(new URL(k).pathname); } catch (e) {}
  if (Date.now() - (_revAt.get(k) || 0) < (img ? REV_TTL_IMG : REV_TTL)) return;
  _revAt.set(k, Date.now());
  fetch(request, { cache: 'no-cache' }).then((response) => {
    if (response.ok) {
      caches.open(STATIC_CACHE).then((cache) => cache.put(request, response));
    }
  }).catch(() => {});
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    revLater(request);
    return cached;
  }
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'reload' });
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

// ===== BUGS #415：点「刷新进入新版」的预取落盘通道（mochi PRECACHE_NOW #157/#273/#629/#1047 同族移植）=====
// 弱网下裸 reload 的导航请求会超时回退旧缓存 index.html＝「刷了还在旧版」。页面点刷新先发
// UPD_PREFETCH，这里长超时把新版整包拉下来、校验完整后写进当前账本，回执 UPD_PREFETCH_DONE，
// 页面收到再 reload——导航即使超时，navWithBundle 的缓存兜底命中的就是刚落盘的新页。
// #431 起整包＝薄入口 index ＋ asset-manifest.json 清单里的全部外置件（css/js），波次推进。
// #545：落到**与导航同一本账**（ordinal-nav∶ordinal-code），否则页面自己那一趟（html/head.html
// 的 _bfRefetch）落的和导航读的不是同一本，预取了也命中不了。
// 幂等：页面 12s 重发唤醒被 iOS 冻结的 SW 实例（#1047），重复收到只是重复回执，无害。
self.addEventListener('message', (e) => {
  const data = e.data || {};
  if (data.type !== 'UPD_PREFETCH') return;
  const base = new URL('./', self.registration.scope).href;
  const done = () => { try { if (e.source && e.source.postMessage) e.source.postMessage({ type: 'UPD_PREFETCH_DONE' }); } catch (x) {} };
  (async () => {
    const nav = await caches.open(NAV_CACHE);
    const code = await caches.open(CODE_CACHE);
    const targets = [base + '?ts=' + Date.now(), base + 'index.html?ts=' + Date.now()];
    // #614：导航那两发带查询串＝绕开 github.io 那 10 分钟边缘缓存（canon 去查询串，账本键不变），
    // 否则「预取到的仍是边缘吐回来的上一版」会把这一条救命的通道也一起废掉。
    try {
      const m = await fetch('./asset-manifest.json', { cache: 'reload' }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      if (m && Array.isArray(m.files)) for (const f of m.files) targets.push(base + f);
      if (m && Array.isArray(m.lazy)) for (const f of m.lazy) targets.push(base + f);   // 首屏 JS 分片：换版后第一次进那几页不再现下
    } catch (x) {}
    const grab = (u) => fetch(u, { cache: 'reload' }).then((res) => {
      if (!res || !res.ok) return false;
      // 完整性校验（mochi #134 同理）：把截断的新版固化进缓存＝用户永远卡残缺版。
      // #431 体积闸从 500KB 降到 50KB：入口从 2.7MB 单文件瘦成 ~0.25MB，旧阈值会把合法新入口误判成截断。
      const isNav = /\.html(\?|$)/.test(u) || /\/$/.test(new URL(u, self.registration.scope).pathname);   // #614：带 ?ts= 的与根路径那一发都算导航页
      return res.clone().text().then(async (t) => {
        if (t.length < minBytesFor(canon(u))) return false;   // v26.8.36：同 codeCacheFirst 一把尺子，半件不许落盘
        if (isNav && !/<\/html>\s*$/i.test(t.trim())) return false;
        if (isNav) { await navVerSave(nav, canon(u), res, t); return true; }   // #614 与导航同一写手
        try { code.put(canon(u), res); } catch (x) {}
        return true;
      });
    }).catch(() => false);
    for (let i = 0; i < targets.length; i += 12) {
      await Promise.allSettled(targets.slice(i, i + 12).map(grab));
    }
  })().then(done).catch(done);
});

// 首屏 JS 分片（dist/lazy.v<ver>.<组>.js）：页面 load 之后才由 js/sw-register.js 发一发 LAZY_PREFETCH，
// 把这一版那几片补进代码账本——离线第一次进那些页也打得开。刻意不放进 install：安装期正是首屏最难的时候，
// 那时去拉分片就是与入口自己抢同一条弱网带宽（#474 二批那条铁律同一课）。
/* v26.8.34：页面说「这一件我拿回来是坏的」时，把它从代码账本里删掉。
 * 背景：codeCacheFirst 命中就返回，不看长度。上一次下到一半断掉的那半件一旦落盘，
 * 同地址永远拿回来还是它 —— 脚本跑不出 __CHUNK_OK__，那一页就**永远**打不开。
 * 页面侧在第一次失败后发这条消息，再用同一地址重试。 */
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type !== 'PURGE_CODE' || !d.url) return;
  const run = async () => {
    try {
      await purgeCodeUrl(new URL(d.url, self.registration.scope).href);
    } catch (x) {}
  };
  try { e.waitUntil(run()); } catch (x) { run(); }
});

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type !== 'LAZY_PREFETCH') return;
  const base = new URL('./', self.registration.scope).href;
  const run = async () => {
    let am = null;
    try { am = await fetch('./asset-manifest.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)); } catch (x) { return; }
    const list = (am && Array.isArray(am.lazy)) ? am.lazy : [];
    if (!list.length) return;
    const code = await caches.open(CODE_CACHE);
    /* v26.8.30：原来是一片一片 await，17 个分片在弱网下排成一条长队（每片 2~5 秒＝一分钟起）。
     * 改成 5 路并发：一片慢不拖住后面，整体从「分钟级」压到「十几秒」。 */
    /* v26.8.34：预取本来是"离线也打得开"，但它一开跑就是 17 个文件、1.4MB 全下，
     * 弱网下正好和用户点的那一页抢同一条带宽 —— 播放器 302KB、助眠 247KB 这两件
     * 是大头（占一半），Skip 掉它们，剩下的才是"小页秒开"的收益。
     * 并发也从 5 降到 2：抢得太狠，用户点的那一发就排不上。 */
    const jobs = list.filter((f) => /\.js$/.test(f)).filter((f) => !/\.(player|sleeproom)\.js$/.test(f));
    let cursor = 0;
    const worker = async () => {
      while (cursor < jobs.length) {
        const f = jobs[cursor++];
        let key = '';
        try { key = canon(base + f); } catch (x) { continue; }
        try { if (await code.match(key)) continue; } catch (x) {}
        try { await code.add(new Request(key, { cache: 'reload' })); } catch (x) {}
      }
    };
    await Promise.all([worker(), worker()]);
  };
  try { e.waitUntil(run()); } catch (x) { run(); }
});

// ===== BUGS #3072：页面把一份文件交进来，放进 SAVE_CACHE 那本账，回执里给一条可点击的普通地址 =====
// 字节住 Cache API（磁盘），不复制、不转 base64、不过 JavaBridge；地址只活一次——下载那一下取走即删。
// 页面侧的取数口在 js/utils.js 的 _swSaveStage（offerSaveBlob 弹卡那一刻就先搬，用户按键时多半已备好）。
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type !== 'SAVE_BLOB' || !d.blob || !d.token) return;
  const base = new URL('./', self.registration.scope).href;
  const url = base.replace(/\/$/, '') + SAVE_MARK.slice(0, -1) + '/' + d.token + '?t=' + Date.now();
  const reply = (ok) => { try { if (e.source && e.source.postMessage) e.source.postMessage({ type: 'SAVE_READY', token: d.token, url: ok ? url : '' }); } catch (x) {} };
  e.waitUntil((async () => {
    const cache = await caches.open(SAVE_CACHE);
    await cache.put(url.split('?')[0], new Response(d.blob, {
      headers: { 'Content-Type': d.mime || 'application/octet-stream', 'Content-Disposition': saveDisposition(d.name), 'Cache-Control': 'no-store' }
    }));
    saveSweep(url.split('?')[0]);   // 顺手清掉别人家没取走的（不 await，别拖慢回执）
    reply(true);
  })().catch(() => reply(false)));
});

// 后台弹窗点击（mochi 移植）：聚焦已有窗口 / 开新窗口，并 postMessage 通知页面端跳转。
// 页面可能已被系统回收（postMessage 落空），点击侧同时把 tag 写进 IDB，页面开机后自取一次（只认 3 分钟内的）。
function bgIdbSet(key, val) {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('ordinal-keep-db', 1);
      req.onupgradeneeded = () => { try { req.result.createObjectStore('files'); } catch (e) {} };
      req.onsuccess = () => {
        try {
          const tx = req.result.transaction('files', 'readwrite').objectStore('files').put(val, key);
          tx.onsuccess = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (e) { resolve(false); }
      };
      req.onerror = () => resolve(false);
    } catch (e) { resolve(false); }
  });
}

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const tag = (e.notification && e.notification.tag) || '';
  e.waitUntil((async () => {
    if (tag) { try { await bgIdbSet('__notify-click', JSON.stringify({ tag: tag, ts: Date.now() })); } catch (x0) {} }
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (cs && cs.length) {
      const c = cs[0];
      try { await c.focus(); } catch (x) {}
      try { c.postMessage({ type: 'MOCHI_NOTIFY_CLICK', tag: tag }); } catch (x) {}
      return;
    }
    try {
      const w = await self.clients.openWindow('./');
      if (w && w.postMessage) {
        for (let i = 0; i < 3; i++) {
          await new Promise((r) => setTimeout(r, 800));
          try { w.postMessage({ type: 'MOCHI_NOTIFY_CLICK', tag: tag }); } catch (x) { break; }
        }
      }
    } catch (x) {}
  })());
});
