{
  /** @return {HTMLMediaElement} */
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
    /** @return {HTMLMediaElement} */
    const getVideo = () => document.querySelector("#movie_player video");

    // * ---------------- calculation

    /**
     * 因为 列表、children、时间标签 都是动态加载的，所以不容易做缓存什么的
     * 简单的每次都计算，性能影响不会很大
     *
     * @returns {[number,number]} [current time, total time]
     */
    const calcTime = () => {
      const playlistItems = Array.from(document.querySelector("#content #playlist")?.querySelector("#items")?.children);

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

    let loaded = false;

    domObserverAll("#movie_player video", (e) => {
      e.addEventListener("timeupdate", () => {
        const isPlaylist = new URL(window.location.href).searchParams.get("list") !== null;
        if (!isPlaylist) return;

        const pb = progressBar;

        if (!loaded) {
          domObserverOnce("#content ytd-playlist-panel-renderer", (e) => {
            if (!e.contains(pb.pbEl)) {
              e.style.position = "relative";
              e.appendChild(pb.pbEl);
            }
            loaded = true;
          });
          return;
        }

        const [currentTime, totalTime] = calcTime();
        pb.updateProgressBar(currentTime, totalTime);
      });
    });
  }
}
