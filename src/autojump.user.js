// ==UserScript==
// @name         [LC] autojump target
// @version      beta
// @author       Seognil LC
// @license      AGPL-3.0-only
// @namespace    https://github.com/seognil/my-web-user-scripts
// @supportURL   https://github.com/seognil/my-web-user-scripts
// @updateURL    https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/autojump.user.js
// @downloadURL  https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/autojump.user.js
// @match        https://link.juejin.cn/*
// @match        https://link.zhihu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @run-at       document-start
// @grant        none
// ==/UserScript==

{
  const replacer = () => {
    const url = new URL(location.href).searchParams.get("target");
    if (url) location.replace(url);
  };

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
      e.preventDefault();
      replacer();
    }
  });

  replacer();
}
