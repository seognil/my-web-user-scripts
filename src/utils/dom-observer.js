// * ---------------------------------------------------------------- dom observer all

/**
 * 对所有满足 selector 的节点，每个执行 callback
 * 因为有些网站是前端路由，所以也要监测界面更新后的 node
 * 一开始执行一次，然后 MutationObserver
 *
 * @param {string} selector
 * @param {(node: HTMLElement) => void} callback
 */
const domObserverAll = (selector, callback) => {
  const set = new WeakSet();

  /** @param  {Element} node */
  const emit = (node) => {
    if (set.has(node)) return;
    set.add(node);
    // @ts-ignore
    callback(node);
  };

  document.querySelectorAll(selector).forEach((n) => {
    emit(n);
  });

  const observer = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      mutation.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        const nodes = n.matches(selector) ? [n] : n.querySelectorAll(selector);
        nodes.forEach((n) => emit(n));
      });
    });
  });
  observer.observe(document, { attributes: false, childList: true, subtree: true });
};

// * ---------------------------------------------------------------- dom observer once

/**
 * 当发现满足 selector 的节点，执行一次 callback
 * 仅会执行一次
 * @param {string} selector
 * @param {(node: HTMLElement) => void} callback
 */
const domObserverOnce = (selector, callback) => {
  const node = document.querySelector(selector);
  if (node) {
    // @ts-ignore
    return callback(node);
  }

  const observer = new MutationObserver((mutationList, observer) => {
    mutationList.forEach((mutation) => {
      mutation.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return;
        const node = n.matches(selector) ? n : n.querySelector(selector);
        if (node) {
          // @ts-ignore
          callback(node);
          observer.disconnect();
        }
      });
    });
  });
  observer.observe(document, { attributes: false, childList: true, subtree: true });
};

// * ---------------------------------------------------------------- dom observer node removed

/**
 * 封装一个函数，监听 dom remove 时候执行 callback
 *
 * @deprecated not used yet
 *
 * @param {HTMLElement} node
 * @param {(node: HTMLElement) => void} callback
 */
const domObserverNodeRemoved = (node, callback) => {
  const observer = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      mutation.removedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        if (n === node || n.contains(node)) {
          callback(node);
          observer.disconnect();
        }
      });
    });
  });
  observer.observe(document.body, { attributes: false, childList: true, subtree: true });
};

// * ---------------------------------------------------------------- pending selectors

/**
 * 等待所有选择器的元素就绪，然后 resolve
 * 按需扫描每个 selector 直到就绪
 *
 * @deprecated not used yet
 *
 * @param {string[]} selectors
 * @returns {Promise<void>}
 */
const pendingSelectors = (selectors) => {
  /** @type (true|string)[] */
  const states = [...selectors];

  /**
   * @param {Element} node
   * @returns {boolean}
   */
  const incrementalScan = (node) => {
    states.forEach((e, i) => {
      if (e === true) return;
      if (node.matches(e) || node.querySelector(e)) {
        states[i] = true;
      }
    });
    return states.every((e) => e === true);
  };

  return new Promise((resolve) => {
    if (incrementalScan(document.body)) resolve();

    const observer = new MutationObserver((mutationList, observer) => {
      mutationList.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (incrementalScan(node)) {
            observer.disconnect();
            resolve();
          }
        });
      });
    });
    observer.observe(document, { attributes: false, childList: true, subtree: true });
  });
};
