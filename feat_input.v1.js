/* ===========================================================================
 * feat_input.v1.js — 聊天输入框「打字往下走」
 *
 * 旧站（v22.x）的输入框是 <textarea rows="1">，配一个 _msgInputGrow()：
 *   空着 → 回到单行高（34px），不占地方
 *   打字变长 → 一行一行往下长
 *   长到两行（约 60px）→ 不再长高，改成框内上下滚动
 * 好处是底栏总高度恒定，输入变长不会把整条底栏往上顶、把聊天记录挤走。
 *
 * v26 把元素退化成了单行 <input>：文字一长只能往左滚，前面写的全看不见。
 * index.html 里已经换回 textarea，这里补上让高度跟着内容走的那段逻辑。
 *
 * 高度常量必须和 feat_ui.v1.css 里 .composer-row textarea 的
 * min-height / max-height 保持一致，否则会出现「明明一行却有个滚动条」。
 * =========================================================================== */
(function () {
  'use strict';

  var MIN_H = 34;    /* 单行高：16px 字 × 1.35 行高 + 上下各 6px 内边距 */
  var MAX_H = 60;    /* 两行封顶：第三行会超出去，改成框内滚动 */
  var GROW_AT = 44;  /* 超过这个高度就认为「已经不止一行」，按钮要跟着贴底 */

  function getEl() {
    return document.getElementById('messageInput');
  }

  /**
   * 按内容算高度。
   * 必须先置 auto 再读 scrollHeight —— 不置 auto 的话，元素已经有固定高度，
   * scrollHeight 只会返回「当前高度或内容高度」里的大者，永远缩不回去，
   * 表现为删字之后框子还停在高位。
   */
  function grow(target) {
    var el = target || getEl();
    if (!el || el.tagName !== 'TEXTAREA') return;

    try {
      var row = el.closest ? el.closest('.composer-row') : null;
      /* 末尾的空白（含换行）不算内容，否则删完字还留着一行空位 */
      var txt = String(el.value || '').replace(/\s+$/, '');

      el.style.height = 'auto';
      var sh = el.scrollHeight || MIN_H;
      var h = txt ? Math.min(sh, MAX_H) : MIN_H;

      el.style.height = Math.max(MIN_H, h) + 'px';
      /* 内容超出上限才允许框内滚动，否则隐藏滚动条（长内容时 iMessage 那样的观感） */
      el.style.overflowY = (txt && sh > MAX_H) ? 'auto' : 'hidden';

      if (row) {
        try { row.classList.toggle('grow', h > GROW_AT); } catch (e) {}
      }
    } catch (e) {}
  }

  /* 主程序（以及下面的适配层）在切会话、恢复草稿、发送完清空之后可以直接调 */
  window.__msgInputGrow = grow;

  function bindComposer() {
    var el = getEl();
    if (!el || el.__growBound) return !!el;
    el.__growBound = 1;

    el.addEventListener('input', function () { grow(el); });
    el.addEventListener('focus', function () { grow(el); });

    /* 回车发送后主程序会清空 value，但清空是异步的（发送流程里有 await），
     * 所以等一拍再量。capture 阶段先挂上，保证不管谁先谁后都能收到。 */
    el.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && !ev.isComposing && ev.keyCode !== 229) {
        setTimeout(function () { grow(el); }, 40);
      }
    }, true);

    /* 粘贴长文本：paste 事件先于 value 更新，隔一拍再量 */
    el.addEventListener('paste', function () {
      setTimeout(function () { grow(el); }, 30);
    }, true);

    grow(el);
    return true;
  }

  /* 输入框是 index.html 里的静态节点，但主程序可能在某些流程里把它重置，
   * 所以第一次没绑上就多试几次（不轮询，只补几次） */
  var tries = 0;
  (function ensure() {
    if (bindComposer()) return;
    if (++tries > 20) return;
    setTimeout(ensure, 400);
  })();

  /* 发送按钮点完也要回单行高（发送失败、或者只有图没字时 value 是空的） */
  try {
    var sendBtn = document.querySelector('#composer .send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        setTimeout(function () { grow(); }, 60);
      }, true);
    }
  } catch (e) {}

  /* 切换页面回来（比如从设置页返回聊天）时，输入框可能刚被重新显示，
   * 高度要重算一次，不然恢复草稿后会停在旧高度上 */
  try {
    if (typeof window.showView === 'function' && !window.showView.__growPatched) {
      var _showView = window.showView;
      var _sv = function () {
        var r = _showView.apply(this, arguments);
        setTimeout(function () { grow(); }, 80);
        return r;
      };
      _sv.__growPatched = true;
      window.showView = _sv;
      try { showView = _sv; } catch (e) {}
    }
  } catch (e) {}

  /* 旋转屏幕 / 键盘弹出导致可视区变化时，行高会跟着变，重新量一次 */
  try {
    window.addEventListener('resize', function () { grow(); });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', function () { grow(); });
    }
  } catch (e) {}
})();
