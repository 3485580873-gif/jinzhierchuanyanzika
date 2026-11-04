/* ============================================================================
 * feat_oss_boot.v2.js —— 换基底时的「数据接管 + 抢救」前置脚本
 * ----------------------------------------------------------------------------
 * 必须在主程序 app.v26.0.5.js 之前执行（defer 顺序在前）。
 *
 * 一、库名接管
 *   我原来那版的库名是按路径派生的 ordinal-db-jinzhierchuanyanzika，
 *   原站 v26 写死 ordinal-db。同一个 origin，名字不同 —— 不接管的话，
 *   手机上原来的聊天记录、字卡、表情包在 v26 壳里会「看起来全没了」。
 *   做法：把 'ordinal-db' 重定向到旧库名，直接读原来那份数据。不复制、不删除。
 *
 * 二、图片地址判定 window.__IMGOK()
 *   v26 内部有一批清洗逻辑只认 'data:image' 开头，图片一旦搬到云端
 *   （存档里只留一条 oss:// 引用），就会被当成坏数据删掉、还会写回库 ——
 *   这就是「换基底后头像库/背景图清零」的根因。
 *   patch_v26.py 已把这些判断改成调用本函数；这里提供实现。
 *   注意：必须同步定义，dist/app.v26.0.5.js 执行时就会用到。
 *
 * 三、图片地址解析钩子（见下方「四」）
 *   让 img.src = 'oss://…' 这种赋值也能显示，而不是被浏览器判成坏地址、
 *   再被 onerror 把 <img> 删掉（一起听卡片的头像就是这么没的）。
 *
 * 四、原始存档保险箱（第一次真正的后悔药）
 *   在 v26 清洗任何数据之前，把库里那份原始 data 原样复制一份到独立库
 *   'ordinal-raw-vault'（v26 完全不知道这个库的存在，也不会去写它）。
 *   以后无论哪个版本的清洗逻辑又误删了什么，都能从保险箱里把原始引用捞回来。
 *   启动时最多占一次写入，每小时只存一份，最多留 5 份，超 60MB 跳过。
 * ========================================================================== */
(function () {
  'use strict';

  /* ---------- 二、图片地址判定（必须最先就绪） ---------- */
  try {
    window.__IMGOK = function (v) {
      if (typeof v !== 'string') return false;
      var s = v.trim();
      if (!s) return false;
      if (s.indexOf('data:image/') === 0) return true;
      if (s.indexOf('oss://') === 0) return true;            /* 阿里云 OSS 引用 */
      if (s.indexOf('https://') === 0) return true;          /* 远端直链 */
      if (s.indexOf('http://') === 0) return true;
      if (s.indexOf('blob:') === 0) return true;             /* 本次会话内的 blob */
      return false;
    };
  } catch (e) {}

  try {
    var seg = (location.pathname.split('/').filter(Boolean)[0] || 'root');
    var OLD_DB = (seg === 'chat') ? 'ordinal-db' : ('ordinal-db-' + seg);
    var OLD_LS = (seg === 'chat') ? 'ordinal-data' : ('ordinal-data-' + seg);

    /* ---- 1) localStorage 主数据镜像：旧键 → 新键（同步，立即完成） ---- */
    try {
      if (OLD_LS !== 'ordinal-data') {
        var ov = localStorage.getItem(OLD_LS);
        var nv = localStorage.getItem('ordinal-data');
        if (ov && !nv) localStorage.setItem('ordinal-data', ov);
      }
    } catch (e) {}

    /* ---- 2) IndexedDB 库名重定向 ------------------------------------- */
    var REAL_DB = OLD_DB;
    if (OLD_DB !== 'ordinal-db') {
      var redirect = function (name) {
        return (name === 'ordinal-db') ? OLD_DB : name;
      };
      try {
        var instOpen = indexedDB.open.bind(indexedDB);
        Object.defineProperty(indexedDB, 'open', {
          configurable: true,
          writable: true,
          value: function (name, ver) {
            var n = redirect(name);
            return (arguments.length > 1) ? instOpen(n, ver) : instOpen(n);
          }
        });
      } catch (e1) {}
      try {
        if (typeof IDBFactory !== 'undefined' && IDBFactory.prototype) {
          var proto = IDBFactory.prototype;
          var pOpen = proto.open;
          proto.open = function (name, ver) {
            var n = redirect(name);
            return (arguments.length > 1) ? pOpen.call(this, n, ver) : pOpen.call(this, n);
          };
          var pDel = proto.deleteDatabase;
          if (pDel) {
            proto.deleteDatabase = function (name) {
              return pDel.call(this, redirect(name));
            };
          }
        }
      } catch (e2) {}
    }
    try { window.__MINE_DB_NAME = REAL_DB; } catch (e) {}


  /* ---------- 四、图片地址解析钩子（让任何 img.src = 'oss://…' 都能显示） ----------
   * 为什么必须在 boot 里装：主程序渲染时经常直接
   *     img.src = someOssRef
   * 走的是 HTMLImageElement.prototype.src 的 setter，不经过任何我们的渲染函数，
   * 浏览器拿到 oss:// 会立刻判定加载失败 → 有些地方 onerror 里还把 <img> 整个删掉
   * （一起听卡片就是这样：头像位置只剩一个空圈）。
   * 这里在最早的时机把 setter 包一层：遇到 oss:// 就地换成签名直链；
   * 解析器还没就绪时先给占位图并打上 data-oss-ref，等 feat_oss 就绪后自动复活。
   * innerHTML / setAttribute 那条路走不到 setter，由 feat_oss 里的 MutationObserver 兜底。 */
  try {
    window.__IMG_PH__ = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">'
      + '<rect width="48" height="48" rx="8" fill="#eef0f3"/>'
      + '<text x="24" y="29" font-size="11" fill="#9aa1aa" text-anchor="middle" font-family="sans-serif">\u4e91\u56fe</text>'
      + '</svg>');
  } catch (e) {}

  /* 默认解析器：feat_oss.v3.js 加载后会被替换成真正的签名逻辑 */
  try {
    if (typeof window.__IMG_RESOLVE !== 'function') {
      window.__IMG_RESOLVE = function (v) {
        if (typeof v === 'string' && v.indexOf('oss://') === 0) {
          return { url: window.__IMG_PH__, ref: v };
        }
        return { url: v, ref: '' };
      };
    }
  } catch (e) {}

  try {
    var _desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (_desc && typeof _desc.set === 'function' && !_desc.set.__minePatched) {
      var _nativeSet = _desc.set;
      var _nativeGet = _desc.get;
      var _mineSet = function (v) {
        try {
          if (typeof v === 'string' && v.indexOf('oss://') === 0) {
            var r = null;
            try { r = window.__IMG_RESOLVE(v); } catch (e1) { r = null; }
            var url = (r && r.url) || window.__IMG_PH__;
            var ref = (r && r.ref) || (url ? '' : v);
            /* 同一个引用重复赋值时不要重复写：每次 setAttribute / 赋值都会派发
             * attribute mutation，被观察器接住再处理一轮 —— 页面静止也会空转。 */
            if (this.getAttribute('data-oss-ref') === v && this.getAttribute('src') === url) return;
            if (ref) { try { this.setAttribute('data-oss-ref', ref); } catch (e2) {} }
            return _nativeSet.call(this, url);
          }
        } catch (e4) {}
        return _nativeSet.call(this, v);
      };
      _mineSet.__minePatched = true;
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: true,
        enumerable: _desc.enumerable,
        get: _nativeGet,
        set: _mineSet
      });
    }
  } catch (e) {}

    /* ---- 3) 原始存档保险箱 ------------------------------------------- */
    /*
     * 只在「这份库里确实有东西」时才动；任何一步出错都静默放弃，
     * 绝不影响正常启动。
     */
    var VAULT_DB = 'ordinal-raw-vault';
    var VAULT_STORE = 'snap';
    var VAULT_KEEP = 5;
    var VAULT_MAX_BYTES = 60 * 1024 * 1024;
    var VAULT_GAP = 60 * 60 * 1000;      /* 同一小时内不重复存 */

    function openVault() {
      return new Promise(function (res, rej) {
        var req;
        try {
          req = indexedDB.open(VAULT_DB, 1);
        } catch (e) { rej(e); return; }
        req.onupgradeneeded = function () {
          try {
            var db = req.result;
            if (!db.objectStoreNames.contains(VAULT_STORE)) {
              db.createObjectStore(VAULT_STORE);
            }
          } catch (e) {}
        };
        req.onsuccess = function () { res(req.result); };
        req.onerror = function () { rej(req.error); };
        req.onblocked = function () { rej(new Error('blocked')); };
      });
    }

    function readRaw() {
      /* 用同一个重定向后的名字打开（不走版本号，避开升级冲突） */
      return new Promise(function (res, rej) {
        var req;
        try { req = indexedDB.open(REAL_DB); } catch (e) { rej(e); return; }
        req.onupgradeneeded = function () { /* 不该发生：库不存在时让主程序自己建 */ };
        req.onsuccess = function () {
          var db = req.result;
          try {
            if (!db.objectStoreNames.contains('data')) { db.close(); res(null); return; }
            var tx = db.transaction('data', 'readonly');
            var q = tx.objectStore('data').get('all');
            q.onsuccess = function () { var v = q.result || null; db.close(); res(v); };
            q.onerror = function () { try { db.close(); } catch (e) {} rej(q.error); };
            tx.onabort = function () { try { db.close(); } catch (e) {} rej(new Error('abort')); };
          } catch (e) { try { db.close(); } catch (e2) {} rej(e); }
        };
        req.onerror = function () { rej(req.error); };
        req.onblocked = function () { rej(new Error('blocked')); };
      });
    }

    function countRefs(o) {
      /* 粗算这份数据里到底挂了多少张图：data:image + oss:// */
      var n = 0, oss = 0;
      var walk = function (v, d) {
        if (d > 12 || v == null) return;
        var t = typeof v;
        if (t === 'string') {
          if (v.indexOf('data:image/') === 0) n++;
          else if (v.indexOf('oss://') === 0) { n++; oss++; }
          return;
        }
        if (t !== 'object') return;
        if (Array.isArray(v)) { for (var i = 0; i < v.length; i++) walk(v[i], d + 1); return; }
        for (var k in v) { if (Object.prototype.hasOwnProperty.call(v, k)) walk(v[k], d + 1); }
      };
      try { walk(o, 0); } catch (e) {}
      return { total: n, oss: oss };
    }

    function vaultSnap() {
      openVault().then(function (vdb) {
        /* 看上一份存的时间，太近就不折腾 */
        var ready = new Promise(function (res) {
          try {
            var tx = vdb.transaction(VAULT_STORE, 'readonly');
            var os = tx.objectStore(VAULT_STORE);
            var keysReq = os.getAllKeys();
            keysReq.onsuccess = function () { res((keysReq.result || []).slice().sort()); };
            keysReq.onerror = function () { res([]); };
          } catch (e) { res([]); }
        });
        return ready.then(function (keys) {
          var last = 0, lastSig = '';
          try { last = Number(localStorage.getItem('__vaultAt') || 0) || 0; } catch (e) {}
          try { lastSig = String(localStorage.getItem('__vaultSig') || ''); } catch (e) {}
          return readRaw().then(function (raw) {
            if (!raw || typeof raw !== 'object') { vdb.close(); return; }
            var stat = countRefs(raw);
            if (!stat.total) { vdb.close(); return; }        /* 空库不占地方 */
            /* 指纹：联系人/会话/消息 + 图片引用数。变了就存，没变就按间隔来 */
            var sig;
            try {
              sig = [Object.keys(raw.chats || {}).length,
                     (raw.contacts || []).length,
                     (Array.isArray(raw.messages) ? raw.messages.length : 0),
                     stat.total, stat.oss].join('|');
            } catch (e) { sig = ''; }
            if (sig && sig === lastSig && last && Date.now() - last < VAULT_GAP) { vdb.close(); return; }
            var json;
            try { json = JSON.stringify(raw); } catch (e) { vdb.close(); return; }
            if (!json || json.length > VAULT_MAX_BYTES) { vdb.close(); return; }
            var ts = Date.now();
            var key = 'v' + ts;
            return new Promise(function (res) {
              try {
                var tx = vdb.transaction(VAULT_STORE, 'readwrite');
                tx.objectStore(VAULT_STORE).put(raw, key);
                tx.oncomplete = function () { res(true); };
                tx.onerror = function () { res(false); };
                tx.onabort = function () { res(false); };
              } catch (e) { res(false); }
            }).then(function (ok) {
              if (!ok) { vdb.close(); return; }
              try { localStorage.setItem('__vaultAt', String(ts)); } catch (e) {}
              try { localStorage.setItem('__vaultSig', sig || ''); } catch (e) {}
              try { localStorage.setItem('__vaultLast', key); } catch (e) {}
              try { localStorage.setItem('__vaultRefs', stat.total + '/' + stat.oss); } catch (e) {}
              /* 超出保留份数：删最旧的 */
              var all = keys.concat([key]).sort();
              var drop = all.slice(0, Math.max(0, all.length - VAULT_KEEP));
              if (!drop.length) { vdb.close(); return; }
              return new Promise(function (res) {
                try {
                  var tx2 = vdb.transaction(VAULT_STORE, 'readwrite');
                  var os2 = tx2.objectStore(VAULT_STORE);
                  drop.forEach(function (k) { try { os2.delete(k); } catch (e) {} });
                  tx2.oncomplete = function () { res(); };
                  tx2.onerror = function () { res(); };
                } catch (e) { res(); }
              }).then(function () { vdb.close(); });
            });
          }, function () { vdb.close(); });
        }, function () { vdb.close(); });
      })['catch'](function () {});
    }

    /* 立即发起（defer 顺序保证在主程序 open 之前入队），后续全异步 */
    try { vaultSnap(); } catch (e) {}

    /* ---- 4) 给「设置 → 存储」看的入口：导出保险箱 ---------------------- */
    /* 外部补丁 feat_oss.v1.js 会读这两个函数 */
    window.__vaultList = function () {
      return openVault().then(function (vdb) {
        return new Promise(function (res) {
          try {
            var tx = vdb.transaction(VAULT_STORE, 'readonly');
            var q = tx.objectStore(VAULT_STORE).getAllKeys();
            q.onsuccess = function () { var ks = (q.result || []).slice().sort(); vdb.close(); res(ks); };
            q.onerror = function () { vdb.close(); res([]); };
          } catch (e) { res([]); }
        });
      })['catch'](function () { return []; });
    };
    window.__vaultGet = function (key) {
      return openVault().then(function (vdb) {
        return new Promise(function (res) {
          try {
            var tx = vdb.transaction(VAULT_STORE, 'readonly');
            var q = tx.objectStore(VAULT_STORE).get(key);
            q.onsuccess = function () { var v = q.result || null; vdb.close(); res(v); };
            q.onerror = function () { vdb.close(); res(null); };
          } catch (e) { res(null); }
        });
      })['catch'](function () { return null; });
    };
  } catch (e) {}
})();
