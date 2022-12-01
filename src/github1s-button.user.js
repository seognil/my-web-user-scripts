// ==UserScript==
// @name         [LC] Github1s Button
// @description  Add github1s online editor button for github repo
// @version      beta
// @author       Seognil LC
// @license      AGPL-3.0-only
// @namespace    https://github.com/seognil/my-web-user-scripts
// @supportURL   https://github.com/seognil/my-web-user-scripts
// @updateURL    https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/github1s-button.user.js
// @downloadURL  https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/github1s-button.user.js
// @match        https://github.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @run-at       document-end
// @grant        none
// ==/UserScript==

{
  // * ----------------------------------------------------------------

  const github1s = () => {
    // * use observer to support dynamic page rendering/jumping
    domObserver(".pagehead-actions", (ul) => {
      const BTN_ID = "github-online-editor-button";

      // * ---------------- button already added

      if (ul.querySelector(`#${BTN_ID}`)) return;

      // * ---------------- create github1s button

      const li = document.createElement("li");

      li.id = BTN_ID;
      li.classList.add("btn");
      li.style.padding = "3px 12px";
      li.style.backgroundColor = "var(--primary-2)";
      li.textContent = "+1s";

      ul.prepend(li);

      // * ----------------

      li.addEventListener("click", () => {
        const github1sUrl = location.href.replace("github.com", "github1s.com");
        window.open(github1sUrl);
      });
    });
  };

  // * ---------------------------------------------------------------- dom observer

  const domObserver = (selector, callback) => {
    // * already loaded
    document.querySelectorAll(selector).forEach((node) => callback(node, "existed"));

    // * keep observering new nodes if match selector
    const observer = new MutationObserver((mutationList, observer) => {
      mutationList.forEach((mutation) => {
        mutation.addedNodes.filter((node) => node.matches?.(selector)).forEach((node) => callback(node, "new"));
      });
    });
    observer.observe(document, { attributes: false, childList: true, subtree: true });
  };

  // * ----------------------------------------------------------------

  const main = () => {
    github1s();
  };
  main();
}
