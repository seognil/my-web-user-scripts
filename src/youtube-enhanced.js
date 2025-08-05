{
  // * ---------------------------------------------------------------- situations

  const s = {
    //
    /**
     * channel's home, mini player
     * https://www.youtube.com/@MrBeast
     */
    1: "#container > #c4-player > .html5-video-container > video[src]",

    /**
     * main player, mini player
     * https://www.youtube.com/watch?v=mwKJfNYwvm8
     */
    2: "#container > #movie_player > .html5-video-container > video[src]",

    /**
     * short player
     * https://www.youtube.com/shorts/V6In4tmd-w8
     */
    3: "#container > #shorts-player > .html5-video-container > video[src]",
  };

  // * ---------------------------------------------------------------- get video elements

  const getVideos = () => {
    /** @type {HTMLVideoElement} */
    const channelVideo = document.querySelector("#c4-player video");
    /** @type {HTMLVideoElement} */
    const shortVideo = document.querySelector("#shorts-player video");
    /** @type {HTMLVideoElement} */
    const normalVideo = document.querySelector("#movie_player video");

    const href = location.href;

    /** 主 video */
    const main = href.includes("youtube.com/@") ? channelVideo : href.includes("youtube.com/shorts") ? shortVideo : normalVideo;

    /** 所有 video 元素 */
    const videos = [channelVideo, shortVideo, normalVideo].filter((e) => e);

    return { main, videos };
  };

  // * ---------------------------------------------------------------- global solo playing

  document.addEventListener("DOMContentLoaded", () => {
    mediaControl.enableGlobalSoloPlaying(() => getVideos().videos);
  });

  // * ---------------------------------------------------------------- auto set resolution

  {
    const setResolution = () => {
      const maxHqLimit = [
        //
        // "hd2160",
        "hd1440",
        "hd1080",
        "hd720",
      ];

      const node = document.querySelector("#movie_player");
      /** @type string[] */
      // @ts-ignore
      const resolutions = node.getAvailableQualityLevels();
      const nextRes = resolutions.find((e) => maxHqLimit.includes(e));

      // @ts-ignore
      node.setPlaybackQualityRange(nextRes);
    };

    domObserverOnce("#movie_player", (node) => {
      /** after initial page load */
      setResolution();

      /** after video src changed */
      node.querySelector("video").addEventListener("loadstart", setResolution);
    });
  }

  // * ---------------------------------------------------------------- hotkey

  {
    document.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "")) return;

      const ytbVideo = getVideos().main;
      if (!ytbVideo) return;

      // * ----------------

      const mc = mediaControl;
      const jumpStep = 1;
      const speedStep = 0.125;
      /** @type [number,number] */
      const speedRange = [0.125, 4];

      // * ----------------

      /** @param {string} text */
      const toast = (text) => mediaControl.toast(ytbVideo.parentElement.parentElement, text);

      /** @param {HTMLVideoElement} video */
      const toastPlaybackSpeed = (video) => {
        const curRatio = video?.playbackRate;
        curRatio && toast("倍速 " + curRatio.toFixed(3).replace(/\.?0+$/, ""));
      };

      // * ----------------

      if (false) "";
      // * ---------------- playlist
      else if (e.key === "[" || e.key === "PageUp") e.preventDefault(), playlistJump(-1);
      else if (e.key === "]" || e.key === "PageDown") e.preventDefault(), playlistJump(1);
      // * ---------------- play speed
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "z") {
        mc.setPlaybackSpeedBy(ytbVideo, -speedStep, speedRange);
        toastPlaybackSpeed(ytbVideo);
      } else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "x") {
        mc.setPlaybackSpeedBy(ytbVideo, +speedStep, speedRange);
        toastPlaybackSpeed(ytbVideo);
      } else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "v") {
        mc.togglePlaybackSpeed(ytbVideo);
        toastPlaybackSpeed(ytbVideo);
      }
      // * ---------------- jump
      else if (e.key === "Backspace") mediaControl.setPlaybackJumpToPercent(ytbVideo, 0);
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "q") mc.setPlaybackJumpBySec(ytbVideo, -jumpStep);
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "e") mc.setPlaybackJumpBySec(ytbVideo, +jumpStep);
      // * ---------------- snap
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "s") {
        mediaControl.videoSnap(ytbVideo);
        toast("复制截图");
      }
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
        timesList.slice(0, currentVideoIndex).reduce((a, e) => a + e, 0) + getVideos().main?.currentTime,
        timesList.reduce((a, e) => a + e, 0),
      ];
    };

    // * ---------------- start

    const mediasFlag = new WeakMap();

    document.addEventListener(
      "loadstart",
      (e) => {
        const media = e.target;
        if (mediasFlag.has(media)) return;

        const shouldControl = media === getVideos().main;
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
