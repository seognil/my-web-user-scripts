// ==UserScript==
// @name         [LC] GitHub VSCode Button
// @description  Add an online editor button for github repo
// @version      0.0.2
// @author       Seognil LC
// @license      AGPL-3.0-only
// @namespace    https://github.com/seognil/my-web-user-scripts
// @supportURL   https://github.com/seognil/my-web-user-scripts
// @updateURL    https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/github-vscode-button.user.js
// @downloadURL  https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/github-vscode-button.user.js
// @match        https://github.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @run-at       document-end
// @grant        none
// ==/UserScript==

{
  // * ----------------------------------------------------------------

  const githubVSCode = () => {
    // * use observer to support dynamic page rendering/jumping
    domObserverSeek(".pagehead-actions", 100, (ul) => {
      const BTN_ID = "github-vscode-button";

      // * ---------------- button already added

      if (ul.querySelector(`#${BTN_ID}`)) return;

      // * ---------------- create button

      const li = document.createElement("li");
      li.id = BTN_ID;

      const a = document.createElement("a");
      a.classList.add("btn", "btn-sm");
      a.style.color = "var(--blue)";
      a.textContent = "Dev";

      a.href = `https://vscode.dev/github${document.location.pathname}`;

      li.append(a);
      ul.prepend(li);
    });
  };

  // * ---------------------------------------------------------------- dom observer

  const domObserverSeek = (selector, debounceMs, callback) => {
    const set = new WeakSet();
    const callNodes = (mark = "new") => document.querySelectorAll(selector).forEach((n) => set.has(n) || (set.add(n), callback(n, mark)));

    callNodes("existed");
    let timer = null;
    const observer = new MutationObserver(() => (clearTimeout(timer), (timer = setTimeout(callNodes, debounceMs))));
    observer.observe(document, { attributes: false, childList: true, subtree: true });
  };

  // * ----------------------------------------------------------------

  const main = () => {
    githubVSCode();
  };
  main();
}
