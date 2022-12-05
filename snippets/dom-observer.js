// * ---------------------------------------------------------------- delegate helper

const delegateEvent = (selector, eventName, handler) => {
  domObserver(selector, (node) => {
    node.removeEventListener(eventName, handler);
    node.addEventListener(eventName, handler);
  });
};

// * ---------------------------------------------------------------- dom observer

// TODO bug bf0cf9, won't catch ".pagehead-actions" while jumping at github.com // Seognil LC 2022/12/05

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

// * ---------------------------------------------------------------- dom observer seek

/**
 * another implement, use this if domObserver failed
 * logic is the same as previous one, but always use querySelectorAll to check nodes instead of Mutation Event (see bug bf0cf9)
 * may affects performance but much more reliable
 */

const domObserverSeek = (selector, debounceMs, callback) => {
  const set = new WeakSet();
  const callNodes = (mark = "new") => document.querySelectorAll(selector).forEach((n) => set.has(n) || (set.add(n), callback(n, mark)));

  callNodes("existed");
  let timer = null;
  const observer = new MutationObserver(() => (clearTimeout(timer), (timer = setTimeout(callNodes, debounceMs))));
  observer.observe(document, { attributes: false, childList: true, subtree: true });
};

// * ---------------------------------------------------------------- dom observer with log
