// ==UserScript==
// @name         [LC] Remove GrayScale
// @description  remove css grayscale for usability
// @version      0.0.3
// @author       Seognil LC
// @license      AGPL-3.0-only
// @namespace    https://github.com/seognil/my-web-user-scripts
// @supportURL   https://github.com/seognil/my-web-user-scripts
// @updateURL    https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/remove-grayscale.user.js
// @downloadURL  https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/remove-grayscale.user.js
// @match        *://*/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

{
  const reverseGrayscale = () => {
    domObserver("*", (node) => {
      const style = getComputedStyle(node);
      ["filter", "-webkit-filter", "-moz-filter", "-ms-filter", "-o-filter"].some((prop) => {
        if (style[prop]?.match(/grayscale\(.*?\)/gi)) {
          console.debug("[reverse grayscale]", node);
          node.style.setProperty(prop, style[prop].replace(/grayscale\(.*?\)/gi, "grayscale(0)"), "important");
        }
      });
    });
  };

  // * ----------------------------------------------------------------

  const domObserver = (selector, callback) => {
    // * already loaded
    document.querySelectorAll(selector).forEach((node) => callback(node, "existed"));

    // * keep observering new nodes if match selector
    const observer = new MutationObserver((mutationList, observer) => {
      mutationList.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => node.matches?.(selector) && callback(node, "new"));
      });
    });
    observer.observe(document, { attributes: false, childList: true, subtree: true });
  };

  // * ----------------------------------------------------------------

  const main = () => {
    reverseGrayscale();
  };
  main();
}
