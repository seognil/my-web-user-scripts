// * ---------------------------------------------------------------- delegate helper

const delegateEvent = (selector, eventName, handler) => {
  domObserver(selector, (node) => {
    node.removeEventListener(eventName, handler);
    node.addEventListener(eventName, handler);
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

// * ---------------------------------------------------------------- dom observer with log

{
  const domObserver = (selector, callback, logMode) => {
    // * already loaded
    document.querySelectorAll(selector).forEach((node) => {
      console[logMode]?.("[domObserver] existed node", node);
      callback(node, "existed");
    });

    // * keep observering new nodes if match selector
    const observer = new MutationObserver((mutationList, observer) => {
      mutationList.forEach((mutation) => {
        mutation.addedNodes
          .filter((node) => node.matches?.(selector))
          .forEach((node) => {
            console.log("[domObserver] new node loaded", node);
            callback(node, "new");
          });
      });
    });
    observer.observe(document, { attributes: false, childList: true, subtree: true });
  };
}

// * ----------------------------------------------------------------
