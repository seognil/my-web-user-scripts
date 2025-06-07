const progressBar = (() => {
  // * ----------------

  /** Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment. */
  // <div style="position: absolute; top: 0px; right: 0px; width: 100%;">
  const tmp = `
    <div>
      <div style="position: absolute; height: 2px; background-color: red; width: 0%;"></div>
      <span style="position: absolute; top: 2px; right: 2px; font-size: 10px;">00:00:00 / 00:00:00</span>
    </div>
    `;
  /** progress bar container element */
  // const pbEl = new DOMParser().parseFromString(tmp, "text/html").body.firstElementChild;

  // * ----------------

  const pbEl = document.createElement("div");

  const barEl = document.createElement("div");
  pbEl.appendChild(barEl);
  Object.assign(barEl.style, { position: "absolute", height: "2px", backgroundColor: "red" });

  const textEl = document.createElement("span");
  pbEl.appendChild(textEl);
  Object.assign(textEl.style, { position: "absolute", top: "2px", right: "2px", fontSize: "10px", cursor: "pointer" });
  textEl.addEventListener("click", () => {
    const totalTime = textEl.textContent.split("/").at(1)?.trim();
    navigator.clipboard.writeText(totalTime);
  });

  // * ----------------

  /**
   * @param {number} currentTime
   * @param {number} totalTime
   */
  const updateProgressBar = (currentTime, totalTime) => {
    barEl.style.width = (currentTime / totalTime) * 100 + "%";
    textEl.textContent = sec2readable(currentTime) + " / " + sec2readable(totalTime);
  };

  // * ---------------------------------------------------------------- seconds utils

  /**
   * @param {string} timeStr hh:mm:ss
   * @returns {number} seconds
   */
  const readable2sec = (timeStr) => {
    if (!timeStr) return 0;

    const t = [0, 0, ...timeStr.split(":").map(Number)];
    const [hh, mm, ss] = t.slice(-3);
    return hh * 3600 + mm * 60 + ss;
  };

  /**
   * @param {number} s seconds
   * @returns {string} hh:mm:ss
   */
  const sec2readable = (s) => {
    const ss = ~~(s % 60);
    const mm = ~~((s % 3600) / 60);
    const hh = ~~(s / 3600);
    return [hh, mm, ss].map((e) => String(e).padStart(2, "0")).join(":");
  };

  return {
    pbEl,
    barEl,
    textEl,
    updateProgressBar,
    readable2sec,
    sec2readable,
  };
})();
