/* ===========================================================================
 * feat_perf.v1.js —— 帧率自适应 + 滚动期降级
 *
 * 设计三条原则：
 *   1. 平时一个开关都不加：默认全效果，只有真掉帧才降级。
 *   2. 绝不常驻 rAF：采样只跑 20 帧（约 0.3 秒），采完立刻停，不烧电。
 *   3. 降级可回滚：进 perf-lite 后 20 秒复查一次，顺了自动摘掉，最多来回 3 次。
 *
 * 触发采样的时机只挑「用户正在感知流畅度」的那几个：滚动停下、切视图、
 * 首屏稳定后。别的时候不采样，免得自己变成耗电源。
 * ======================================================================== */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  var html = document.documentElement;
  if (html.dataset.perfLayer === '1') return;
  html.dataset.perfLayer = '1';

  var raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (f) { return setTimeout(function () { f(Date.now()); }, 16); };
  var caf = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : clearTimeout;

  /* ------------------------------------------------------------------
   * 一、滚动期降级
   * 用捕获阶段监听，这样每个可滚动容器（.view / #messageList / .dl-page-body
   * / 各种 sheet 列表）的滚动都能收到，不用逐个绑定。
   * ---------------------------------------------------------------- */
  var scrolling = false, sTimer = 0;
  function onScroll() {
    if (!scrolling) {
      scrolling = true;
      html.classList.add('perf-scrolling');
    }
    if (sTimer) clearTimeout(sTimer);
    sTimer = setTimeout(function () {
      sTimer = 0;
      scrolling = false;
      html.classList.remove('perf-scrolling');
      sample();  /* 滚动刚结束＝用户刚感受到卡不卡，这时候量最准 */
    }, 160);
  }
  try {
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  } catch (e) {
    try { window.addEventListener('scroll', onScroll, false); } catch (e2) {}
  }

  /* ------------------------------------------------------------------
   * 二、帧率采样：20 帧，超 26ms 记一次「慢」
   * ---------------------------------------------------------------- */
  var sampling = false, degradeN = 0, liteOff = false;

  function measure(cb) {
    var n = 0, prev = 0, slow = 0;
    function tick(t) {
      if (prev) {
        var d = t - prev;
        if (d > 26) slow += 1;      /* >26ms 就是掉到 40fps 以下 */
      }
      prev = t;
      n += 1;
      if (n < 20) { raf(tick); return; }
      cb(slow);
    }
    raf(tick);
  }

  function sample() {
    if (sampling || liteOff) return;
    if (document.hidden) return;
    if (document.body && document.body.dataset.kb === 'on') return;  /* 键盘弹出时不判，那是必然慢 */
    sampling = true;
    measure(function (slow) {
      sampling = false;
      if (slow >= 10 && !html.classList.contains('perf-lite') && degradeN < 3) {
        html.classList.add('perf-lite');
        degradeN += 1;
        setTimeout(recheck, 20000);
      }
    });
  }

  /* 进了降级模式，20 秒后复查；顺了就摘掉，还慢就继续留着再等 20 秒 */
  function recheck() {
    if (document.hidden) { setTimeout(recheck, 20000); return; }
    measure(function (slow) {
      if (slow <= 3) {
        html.classList.remove('perf-lite');
        liteOff = true;             /* 已经证明能跑顺，本次会话不再自我降级 */
      } else {
        setTimeout(recheck, 20000);
      }
    });
  }

  /* ------------------------------------------------------------------
   * 三、切视图后采样（切页卡不卡，用户最敏感）
   * ---------------------------------------------------------------- */
  var vTimer = 0, lastView = (document.body && document.body.dataset.view) || '';
  function watchView() {
    var v = (document.body && document.body.dataset.view) || '';
    if (v === lastView) return;
    lastView = v;
    if (vTimer) clearTimeout(vTimer);
    vTimer = setTimeout(sample, 420);   /* 等进场动画走完再量 */
  }
  try {
    new MutationObserver(watchView).observe(document.body, { attributes: true, attributeFilter: ['data-view'] });
  } catch (e) {}

  /* ------------------------------------------------------------------
   * 四、首屏稳定后量一次（这时最容易暴露「初始化太重」）
   * ---------------------------------------------------------------- */
  setTimeout(sample, 5200);
  setTimeout(sample, 11000);

  /* 页面隐藏时把降级开关摘掉：回到前台重新判断，避免在后台被误判 */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (scrolling) { scrolling = false; }
      if (settleT) { clearTimeout(settleT); settleT = 0; }
      html.classList.remove('perf-scrolling');
    }
  });

  /* ------------------------------------------------------------------
   * 五、回前台的第一秒
   *
   * 从别的 App 切回来，同一帧里会同时发生：三十来个 visibilitychange 回调、
   * 保活音频重建、图片懒加载补扫、消息重绘、还有浏览器把后台被回收的纹理
   * 重新上传。这时候任何一次点击（尤其是点输入框弹键盘）都要排在它们后面，
   * 用户感知就是「点一下没反应，慢半拍」。
   * 借用现成的滚动降级样式，把这一秒的毛玻璃先关掉 —— 减少一次整层重采样，
   * 让点击先排上队。视觉上几乎看不出差别。
   * ---------------------------------------------------------------- */
  var settleT = 0;
  function fgSettle() {
    if (html.classList.contains('perf-lite')) return;   /* 已经全降级，不必再切 */
    html.classList.add('perf-scrolling');
    if (settleT) clearTimeout(settleT);
    settleT = setTimeout(function () {
      settleT = 0;
      if (!scrolling) html.classList.remove('perf-scrolling');
    }, 900);
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) fgSettle();
  });
  window.addEventListener('pageshow', fgSettle);

  window.__PERF_LAYER__ = {
    lite: function () { return html.classList.contains('perf-lite'); },
    sample: sample
  };
})();
