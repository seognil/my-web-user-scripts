{
  // * ----------------------------------------------------------------

  const main = () => {
    domObserver(".pagehead-actions", (ul) => {
      const BTN_ID = "github-online-editor-button";

      // * ----------------

      if (ul.querySelector(`#${BTN_ID}`)) return;

      // * ----------------

      const li = document.createElement("li");

      li.id = BTN_ID;
      li.classList.add("btn");
      li.style.padding = "3px 12px";
      li.style.backgroundColor = "var(--primary-2)";
      li.textContent = "+1s";

      ul.prepend(li);

      // * ----------------

      li.addEventListener("click", () => {
        const github1s = location.href.replace("github.com", "github1s.com");
        window.open(github1s);
      });
    });
  };

  // * ---------------------------------------------------------------- dom observer

  const domObserver = (selector, callback) => {
    // * ---------------- already loaded

    document.querySelectorAll(selector).forEach((node) => {
      console.log("[domObserver] existed node", node);
      callback(node);
    });

    // * ---------------- keep observering new nodes if matches selector

    const observer = new MutationObserver((mutationList, observer) => {
      mutationList.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!node.matches?.(selector)) return;
          console.log("[domObserver] new node loaded", node);
          callback(node);
        });
      });
    });

    observer.observe(document, {
      attributes: false,
      childList: true,
      subtree: true,
    });
  };

  // * ----------------------------------------------------------------

  main();
}
