const scrollProgress = (() => {
  // * ----------------

  /** @returns {number} 总滚动进度 [0,1] */
  const getScrollProgress = () => {
    // 获取已经滚动过的距离
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;

    // 获取文档的总高度
    const docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, document.documentElement.offsetHeight, document.body.offsetHeight, document.documentElement.clientHeight);

    // 获取视口的高度
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // 计算可滚动总距离
    const scrollableHeight = docHeight - windowHeight;

    // 计算滚动进度
    const scrollProgress = scrollTop / scrollableHeight;

    return scrollProgress;
  };

  // * ---------------- Components

  const pbEl = document.createElement("div");
  Object.assign(pbEl.style, { position: "fixed", left: 0, top: 0, width: "100%" });

  const barEl = document.createElement("div");
  pbEl.appendChild(barEl);
  Object.assign(barEl.style, { position: "absolute", height: "2px", backgroundColor: "red" });

  const textEl = document.createElement("span");
  pbEl.appendChild(textEl);
  Object.assign(textEl.style, { position: "absolute", top: "2px", left: "2px", padding: "2px 4px", fontSize: "20px", backgroundColor: "gray", color: "white" });

  // * ---------------- bind

  window.addEventListener("scroll", () => {
    if (!document.body.contains(pbEl)) document.body.append(pbEl);

    const progress = getScrollProgress();
    barEl.style.width = `${progress * 100}%`;
    textEl.style.left = `${progress * (window.innerWidth - textEl.clientWidth)}px`;
    textEl.textContent = `${(progress * 100).toFixed(1)}%`;
  });
})();
