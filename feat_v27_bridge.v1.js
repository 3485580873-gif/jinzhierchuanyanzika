// feat_v27_bridge.v1.js
// 为上游 v27.7.5 的懒加载分片补齐本站缺少的少量 app 侧函数。
// 原则：只新增，不覆盖任何已有实现；任何异常都静默退回空值，不影响原有功能。
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  function pool(name) {
    try {
      var groups = (typeof data !== 'undefined' && data && data.groups) || [];
      var g = groups.find(function (x) {
        return x && (x.name || '') === name && (x.category || '主字卡') === 'TA心里话' && !x.off;
      });
      if (!g || !Array.isArray(g.cards)) return [];
      return g.cards.filter(function (c) {
        var t = cardText(c);
        return t && !voiceCardParts(t) && !cardIsOff(g, c);
      }).map(function (c) { return String(cardText(c) || '').trim(); }).filter(Boolean);
    } catch (e) { return []; }
  }

  if (typeof window.presetSayPool !== 'function') window.presetSayPool = pool;

  if (typeof window.presetSayList !== 'function') {
    window.presetSayList = function (name, label) {
      var pre = label ? (label + '：') : '';
      return pool(name).filter(function (t) { return !pre || t.indexOf(pre) === 0; })
        .map(function (t) { return pre ? t.slice(pre.length).trim() : t; })
        .filter(Boolean);
    };
  }

  if (typeof window.presetSayPick !== 'function') {
    window.presetSayPick = function (name, label) {
      var hit = window.presetSayList(name, label);
      return hit.length ? hit[Math.floor(Math.random() * hit.length)] : '';
    };
  }

  // 上游在收下一条消息后重排会话列表；本站对应的是 renderChatsList()
  if (typeof window.refreshChatsAfterMsg !== 'function') {
    window.refreshChatsAfterMsg = function () {
      try { if (typeof renderChatsList === 'function') renderChatsList(); } catch (e) {}
    };
  }

  // 顶栏安全区三档（上游 pages 分片会读它），本站没有这一档，给一个固定值兜底
  if (typeof window._safeTopMode !== 'function') {
    try { window._safeTopMode = function () { return 'auto'; }; } catch (e) {}
  }
})();
