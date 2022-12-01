// ==UserScript==
// @name         [LC] YouTube Playlist Timer
// @description  Add a simple progress bar for youtube playlist
// @version      0.0.1
// @author       Seognil LC
// @license      AGPL-3.0-only
// @namespace    https://github.com/seognil/my-web-user-scripts
// @supportURL   https://github.com/seognil/my-web-user-scripts
// @updateURL    https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/youtube-playlist-timer.user.js
// @downloadURL  https://raw.githubusercontent.com/seognil/my-web-user-scripts/master/src/youtube-playlist-timer.user.js
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @run-at       document-end
// @grant        none
// ==/UserScript==

{
  // * ================================================================================ YoutubePlaylistTimer

  // * ---------------------------------------------------------------- seek video and bind timeupdate event

  const YoutubePlaylistTimer = () => {
    delegateEvent("video", "timeupdate", updatePlaylistTimer);
  };

  // * ---------------------------------------------------------------- update playlist timer when timeupdate

  const updatePlaylistTimer = () => {
    const isPlaylist = new URL(window.location.href).searchParams.get("list") !== null;
    if (!isPlaylist) return;

    const [progressBar, timeTextSpan] = prepareTimerDom();

    const [currentTime, totalTime] = getTime();

    progressBar.style.width = (currentTime / totalTime) * 100 + "%";
    timeTextSpan.textContent = prettySec(currentTime) + " / " + prettySec(totalTime);
  };

  // * ---------------------------------------------------------------- calc

  const getTime = () => {
    const playlistItems = [...document.querySelector("#content #playlist").querySelector("#items").children];

    const currentVideoIndex = playlistItems.findIndex((e) => e.attributes["selected"]);

    const timesList = playlistItems.map((e) => ToSec(e.querySelector("span.ytd-thumbnail-overlay-time-status-renderer")?.innerText));

    /** currentTime, totalTime */
    return [timesList.slice(0, currentVideoIndex).reduce((a, e) => a + e, 0) + ~~Number(document.querySelector("video")?.currentTime), timesList.reduce((a, e) => a + e, 0)];
  };

  // * ---------------------------------------------------------------- View Layer

  /*
    <div style="position: absolute; top: 0px; right: 0px; width: 100%;">
      <div style="position: absolute; height: 2px; background-color: red; width: 1.00522%;"></div>
      <span style="position: absolute; top: 2px; right: 2px;">00:01:19 / 02:10:59</span>
    </div>

    export progress and text node
  */
  const prepareTimerDom = () => {
    const parentContainer = document.querySelector("#content ytd-playlist-panel-renderer");

    // * ---------------- already loaded, fast return

    if (parentContainer?.querySelector("#youtube-player-timer")) {
      return parentContainer.querySelector("#youtube-player-timer")?.children;
    }

    // * ---------------- container view

    const timerContainer = document.createElement("div");

    timerContainer.id = "youtube-player-timer";

    Object.assign(timerContainer.style, {
      position: "absolute",
      top: "0",
      right: "0",
      width: "100%",
    });

    // * ---------------- progress

    const progressBar = document.createElement("div");
    timerContainer.appendChild(progressBar);
    Object.assign(progressBar.style, {
      position: "absolute",
      height: "2px",
      backgroundColor: "red",
    });

    // * ---------------- timer text

    const timeTextSpan = document.createElement("span");
    timerContainer.appendChild(timeTextSpan);
    Object.assign(timeTextSpan.style, {
      position: "absolute",
      top: "2px",
      right: "12px",
    });

    // * ---------------- append view

    parentContainer.style.position = "relative";
    parentContainer.appendChild(timerContainer);

    // * ----------------

    return [progressBar, timeTextSpan];
  };

  // * ================================================================================

  // * ---------------------------------------------------------------- utils

  // * ---------------- hh:mm:ss => sec

  const ToSec = (timeStr) => {
    if (timeStr === undefined) return 0;

    const t = timeStr.split(":").map(Number);

    if (t.length === 2) {
      const [mm, ss] = t;
      return mm * 60 + ss;
    } else if (t.length === 3) {
      const [hh, mm, ss] = t;
      return hh * 3600 + mm * 60 + ss;
    } else {
      return 0;
    }
  };

  // * ---------------- sec => hh:mm:ss

  const prettySec = (s) => {
    const ss = s % 60;
    const mm = ~~((s % 3600) / 60);
    const hh = ~~(s / 3600);
    return [hh, mm, ss].map((e) => String(e).padStart(2, "0")).join(":");
  };

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

  // * ================================================================================

  const main = () => {
    YoutubePlaylistTimer();
  };
  main();
}
