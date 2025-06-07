{
  /** @return {HTMLVideoElement} */
  const getVideo = () => document.querySelector("#movie_player video");

  // * ---------------------------------------------------------------- hotkey

  {
    document.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "")) return;

      const ytbVideo = getVideo();
      if (!ytbVideo) return;

      if (false) "";
      else if (e.key === "Backspace") mediaControl.setPlaybackJumpToPercent(ytbVideo, 0);
      else if (e.key === "[" || e.key === "PageUp") e.preventDefault(), playlistJump(-1);
      else if (e.key === "]" || e.key === "PageDown") e.preventDefault(), playlistJump(1);
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "s") mediaControl.videoSnap(ytbVideo);
    });

    // * ---------------- playlist control

    /** @param {-1|1} direction */
    const playlistJump = (direction) => {
      if (direction === -1) {
        // @ts-ignore
        document.querySelector("#movie_player .ytp-prev-button")?.click();
      } else if (direction === 1) {
        // @ts-ignore
        document.querySelector("#movie_player .ytp-next-button")?.click();
      }
    };
  }

  // * ---------------------------------------------------------------- progress bar

  {
    // * ---------------- calculation

    /**
     * 因为 列表、children、时间标签 都是动态加载的，所以不容易做缓存什么的
     * 简单的每次都计算，性能影响不会很大
     *
     * @param {HTMLElement} playlistEl
     * @returns {[number,number]} [current time, total time]
     */
    const calcTime = (playlistEl) => {
      const playlistItems = Array.from(playlistEl.querySelector("#items")?.children);

      const currentVideoIndex = playlistItems.findIndex((e) => e.attributes["selected"]);

      // @ts-ignore
      const timesList = playlistItems.map((e) => e.querySelector("span.ytd-thumbnail-overlay-time-status-renderer")?.innerText).map((e) => progressBar.readable2sec(e));

      return [
        //
        timesList.slice(0, currentVideoIndex).reduce((a, e) => a + e, 0) + getVideo()?.currentTime,
        timesList.reduce((a, e) => a + e, 0),
      ];
    };

    // * ---------------- start

    const mediasFlag = new WeakMap();

    /** 优化，仅当媒体播放时，挂载一次 update 事件 */
    document.addEventListener(
      "play",
      (e) => {
        const media = e.target;
        if (mediasFlag.has(media)) return;

        const shouldControl = media === getVideo();
        if (!shouldControl) return mediasFlag.set(media, false);

        const updateHandler = () => {
          // const isPlaylist = new URL(window.location.href).searchParams.get("list") !== null;
          // if (!isPlaylist) return;
          /** @type {HTMLElement} */
          const playlistEl = document.querySelector("#content ytd-playlist-panel-renderer");
          if (!playlistEl) return;

          const pb = progressBar;

          if (!playlistEl.contains(pb.pbEl)) {
            playlistEl.style.position = "relative";
            Object.assign(pb.pbEl.style, { position: "absolute", top: "0", right: "0", width: "100%" });
            Object.assign(pb.textEl.style, { right: "8px" });
            playlistEl.appendChild(pb.pbEl);
          }

          const [currentTime, totalTime] = calcTime(playlistEl);
          pb.updateProgressBar(currentTime, totalTime);
        };
        media.addEventListener("timeupdate", updateHandler);
        mediasFlag.set(media, updateHandler);
      },
      true
    );
  }

  // * ----------------------------------------------------------------
}
