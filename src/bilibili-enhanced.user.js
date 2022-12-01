// ==UserScript==
// @name         [LC] Bilibili Enhanced
// @description  Custom Bilibili Hotkeys and automation
// @version      0.0.1
// @author       Seognil LC
// @license      AGPL-3.0-only
// @namespace    https://github.com/seognil/my-web-user-scripts
// @supportURL   https://github.com/seognil/my-web-user-scripts
// @updateURL    https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/bilibili-enhanced.user.js
// @downloadURL  https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/bilibili-enhanced.user.js
// @match        https://www.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @run-at       document-end
// @grant        none
// ==/UserScript==

{
  const getBiliVideo = () => document.querySelector("#bilibili-player, #bilibiliPlayer")?.querySelector(".bpx-player-video-wrap, .bilibili-player-video-wrap")?.querySelector("video");

  // * ================================================================================ analyze

  /**
   * 1. single normal https://www.bilibili.com/video/BV1ct4y1N7BQ/
   * 2. single movie https://www.bilibili.com/bangumi/play/ep399856
   * 3. playlist anime https://www.bilibili.com/bangumi/play/ss41410
   * 4. playlist anime https://www.bilibili.com/bangumi/play/ep691614
   * 5. playlist custom https://www.bilibili.com/video/BV1W7411F79S/
   * 6. playlist playall https://www.bilibili.com/medialist/play/7980111?from=space&business=space&sort_field=pubtime
   * 7. mix activity page https://www.bilibili.com/blackboard/activity-yXPfn575pD.html?spm_id_from=333.1007.0.0
   *
   * 8. playlist custom (multi page) https://www.bilibili.com/video/BV1hp4y1k7SV/
   *
   *
   * [player]
   *    getBiliVideo
   *
   *
   * [player control bar]
   *    checkAutoPlayForPlaylist
   *    danmu
   *    fullscreen
   *    replay
   * 1,5. bpx-player: normal, normal custom playlist
   * 2,3,4. squirtle: bangumi anime/movie
   * 6. bilibili-player: playall, mix activity
   *
   *
   * [playlist]
   *    checkAutoPlayForPlaylist
   *    playlistCutOff
   *
   * 8. multi page
   *
   */

  {
  }

  // * ================================================================================ style
  {
    const addGlobalStyle = (content) => {
      const head = document.head;
      if (!head) return;

      const node = document.createElement("style");
      node.type = "text/css";
      node.innerHTML = content;
      head.appendChild(node);
    };

    addGlobalStyle(`
      /* override player top title bar mask */
      .bpx-player-top-wrap .bpx-player-top-mask,
      .bilibili-player-video-top .bilibili-player-video-top-mask {
        background: none !important;
      }

      /* override player bottom control bar */
      .bpx-player-control-wrap,
      .bilibili-player-video-control-wrap {
        opacity: 0.7;
      }

      #mod-messager {
        position: absolute;
        bottom: 150px;
        left: 10px;

        display: flex;
        justify-content: center;
        align-items: center;

        background-color: hsla(0, 0%, 0%, 0.5);
        color: white;
        z-index: 1;
        opacity: 0;
        font-size: 20px;
        transition-duration: 500ms;
      }

      #mod-messager.shown {
        opacity: 1;
      }
    `);
  }

  // * ================================================================================ auto

  {
    // * ---------------------------------------------------------------- s/player auto jump

    if (document.URL.match("/s/video/")) {
      location.replace(document.URL.replace("/s/video/", "/video/"));
    }

    // * ---------------------------------------------------------------- pause other tabs

    {
      const bc = new BroadcastChannel("bilibili-control");

      const localId = Math.random().toString(16).slice(-6);
      let localVideo;

      bc.addEventListener("message", ({ data }) => {
        document.querySelectorAll("video").forEach((e) => {
          // * skip current video, only pause other videos
          if (localId === data.triggerId && e === localVideo) return;

          e.pause();
        });
      });

      document.addEventListener(
        "play",
        (e) => {
          // * skip misc videos (e.g. inline player)
          if (e.target !== getBiliVideo()) return;

          localVideo = e.target;
          bc.postMessage({ triggerId: localId });
        },
        true
      );
    }

    // * ---------------------------------------------------------------- playlist auto next

    {
      const checkAutoPlayForPlaylist = () => {
        const playlist = document.querySelector(".ep-list-wrapper ul, .video-section-list, .player-auxiliary-playlist-list, #multi_page .cur-list ul");

        // * ----------------

        // * 自动切集
        const autonext = document.querySelector(".bpx-player-ctrl-setting-handoff input[value='0'], .squirtle-handoff-auto, .bilibili-player-video-btn-setting-right-playtype input[value='1']");

        // * 播完暂停
        const stopnext = document.querySelector(".bpx-player-ctrl-setting-handoff input[value='2'], .squirtle-handoff-pause, .bilibili-player-video-btn-setting-right-playtype input[value='2']");

        // @ts-ignore
        playlist ? autonext?.click() : stopnext?.click();

        // * ---------------- fix incase of toolbar is lazy rendered (6.)

        // * auto play next switcher
        const autobutton = document.querySelector(".player-auxiliary-autoplay-switch input");

        playlist ? !autobutton.checked && autobutton.click() : autobutton.checked && autobutton.click();
      };

      document.addEventListener("play", checkAutoPlayForPlaylist, true);
    }
  }

  // * ======================================================================================================================== Hotkeys

  {
    // * ================================================================================ Custom Hotkeys Handler

    document.addEventListener("keydown", (e) => {
      // * skip inputing
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "")) return;

      if (false) "";
      // * ---------------- copy clean url
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "c") copyUrl(e);
      // * ---------------- original feature hotkey
      else if (e.key === "[" || e.key === "PageUp") playlistCutOff(-1);
      else if (e.key === "]" || e.key === "PageUp") playlistCutOff(1);
      else if (e.key === "c") toggleDanmu();
      else if (e.key === "t") toggleWebFull();
      else if (e.key === "f" && !(e.metaKey || e.ctrlKey)) toggleScreenFull();
      // * ---------------- time jump
      // else if ("1234567890".split("").some((v) => v === e.key)) setPlaybackJumpToPercent(e.key);
      else if (e.key === "Backspace") setPlaybackJumpToPercent(0);
      else if (e.key === "q" || e.key === "ArrowLeft") setPlaybackJumpBySec(-jumpStep);
      else if (e.key === "e" || e.key === "ArrowRight") setPlaybackJumpBySec(+jumpStep);
      else if (e.code === "Space") e.preventDefault(), togglePlay();
      // * ---------------- speed
      else if (e.key === "z") setPlaybackSpeedBy(-speedStep);
      else if (e.key === "x") setPlaybackSpeedBy(+speedStep);
      else if (e.key === "v") togglePlaybackSpeed();
      // * ---------------- loop
      else if (e.key === "r") setReplayLoop();
    });

    // * ================================================================================ Block Original Hotkeys

    {
      // * sentry walkaround

      const legacyAddHandler = EventTarget.prototype.addEventListener;
      Object.defineProperty(EventTarget.prototype, "addEventListener", {
        get: function () {
          return function (...args) {
            const [eventname, fn, ...rest] = args;
            if (eventname === "keydown") {
              const hackFn = function (...args) {
                ("OVERRIDE_FLAG");
                const [e] = args;
                const MASK_LIST = "qwert asdfg zxcvb 01234567890";
                if (MASK_LIST.includes(e.key) || ["ArrowLeft", "ArrowRight"].includes(e.key)) return;
                fn.call(this, ...args);
              };

              return legacyAddHandler.call(this, eventname, hackFn, ...rest);
            } else {
              return legacyAddHandler.call(this, ...args);
            }
          };
        },
        set: function () {},
      });

      const legacyRemoveHandler = EventTarget.prototype.removeEventListener;
      Object.defineProperty(EventTarget.prototype, "removeEventListener", {
        get: function () {
          return function (...args) {
            return legacyRemoveHandler.call(this, ...args);
          };
        },
        set: function () {},
      });
    }

    // * ================================================================================ Features

    // * ---------------------------------------------------------------- copy clean url

    const copyUrl = (e) => {
      e.preventDefault();
      const U = new URL(document.location);
      const url = U.href.replace(U.search, "");
      navigator.clipboard.writeText(url);
    };

    // * ---------------------------------------------------------------- playlist cut off

    const playlistCutOff = (delta) => {
      [
        // 3,4,
        { container: ".ep-list-wrapper ul", cur: ".ep-item.cursor", target: ".ep-item" },
        // 5,
        { container: ".video-section-list", cur: ".video-episode-card__info-playing", target: ".video-episode-card" },
        // 6,
        { container: ".player-auxiliary-playlist-list", cur: "li.on", target: ".clickitem" },
        // 8
        { container: "#multi_page .cur-list ul", cur: ".video-episode-card__info-playing", target: ".video-episode-card" },
      ].some((rule) => {
        const container = document.querySelector(rule.container);
        if (container) {
          const list = [...(container?.children ?? [])];
          const curIndex = list.findIndex((e) => e.matches(rule.cur) || e.querySelector(rule.cur));

          const sibling = list[curIndex + delta];
          const target = sibling?.matches(rule.target) ? sibling : sibling?.querySelector(rule.target);

          if (curIndex === -1 || !target) return false;
          // @ts-ignore
          return target.click(), true;
        }
      });
    };

    // * ---------------------------------------------------------------- danmu

    let danmuShown = true;

    const toggleDanmu = () => {
      danmuShown = !danmuShown;

      // 1,5, others
      const danmuButton = document.querySelectorAll(".bpx-player-dm-switch, .bilibili-player-video-danmaku-switch");
      const danmuLayer = document.querySelectorAll(".bpx-player-row-dm-wrap, .bpx-player-adv-dm-wrap, .bpx-player-bas-dm-wrap, .bpx-player-cmd-dm-wrap, .bilibili-player-video-danmaku");

      // @ts-ignore
      [...danmuButton, ...danmuLayer].forEach((e) => (e.style.opacity = danmuShown ? 1 : 0));

      messager(danmuShown ? "弹幕开" : "弹幕关");
    };

    // * ---------------------------------------------------------------- fullscreen

    const toggleWebFull = () => {
      // @ts-ignore
      document.querySelector(".bpx-player-ctrl-web, .squirtle-video-pagefullscreen, .bilibili-player-video-web-fullscreen")?.click();
    };

    const toggleScreenFull = () => {
      // @ts-ignore
      document.querySelector(".bpx-player-ctrl-full, .squirtle-video-fullscreen, .bilibili-player-video-btn-fullscreen")?.click();
    };

    // * ---------------------------------------------------------------- time jump

    const jumpStep = 2;

    const inRange = (v, [min, max]) => Math.min(Math.max(v, min), max);

    // * ----------------

    const setPlaybackJumpToPercent = (t) => {
      const video = getBiliVideo();
      if (!video) return;

      // * patch
      if (Number(t) === 0) return (video.currentTime = 0.35);

      video.currentTime = (video.duration / 10) * Number(t);
    };

    // * ----------------

    const setPlaybackJumpBySec = (delta) => {
      const video = getBiliVideo();
      if (!video) return;

      video.currentTime = inRange(video.currentTime + delta, [0, video.duration]);
    };

    // * ----------------

    const togglePlay = () => {
      const video = getBiliVideo();
      if (!video) return;

      video.paused ? video.play() : video.pause();
    };

    // * ---------------------------------------------------------------- speed control

    const speedStep = 0.15;
    const speedRange = [0.05, 12];
    const favSpeed = 1.75;
    let localSpeed = 1;

    const setPlaybackSpeedBy = (delta) => {
      const video = getBiliVideo();
      if (!video) return;
      // @ts-ignore
      localSpeed = inRange(video.playbackRate + delta, speedRange);
      video.playbackRate = localSpeed;
      showPlaybackSpeed();
    };

    const togglePlaybackSpeed = () => {
      const video = getBiliVideo();
      if (!video) return;
      const curSpeed = video.playbackRate;
      video.playbackRate = curSpeed === 1 ? (localSpeed === 1 ? favSpeed : localSpeed) : 1;
      showPlaybackSpeed();
    };

    const showPlaybackSpeed = () => {
      const curSpeed = getBiliVideo()?.playbackRate;
      curSpeed && messager("倍速 " + curSpeed.toFixed(2).replace(/\.?0+$/, ""));
    };

    // * ---------------------------------------------------------------- replay loop

    const setReplayLoop = () => {
      const input = document.querySelector(".bpx-player-ctrl-setting-loop input, input.squirtle-setting-loop, .bilibili-player-video-btn-setting-left-repeat input");

      if (input?.checked === true) {
        messager("关闭循环");

        input?.click();
      } else {
        messager("开启循环");

        input?.click();

        // * if video already ended, start replay immediately
        const video = getBiliVideo();
        if (!video) return;
        if (video.paused && video.currentTime >= video.duration) {
          setPlaybackJumpToPercent(0);
          video.play();
        }
      }
    };

    // * ---------------------------------------------------------------- helper indicator messager

    let indicatorTimer = -1;
    const messager = (text) => {
      // * ---------------- prepare indicator

      const wrap = document.querySelector(".bpx-player-video-wrap, .bilibili-player-video-wrap");
      if (!wrap) return null;

      let indicator = document.querySelector("#mod-messager");
      if (!indicator) {
        indicator = document.createElement("div");
        indicator.id = "mod-messager";
        wrap.appendChild(indicator);
      }

      // * ---------------- update indicator

      indicator.textContent = text;
      indicator.classList.add("shown");
      clearTimeout(indicatorTimer);
      indicatorTimer = setTimeout(() => indicator?.classList.remove("shown"), 1000);
    };
  }
}
