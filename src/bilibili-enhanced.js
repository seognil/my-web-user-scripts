// import "./utils/media-control";

/**
 * @typedef {Object} GlobalThings
 * @property {Object} player B 站的播放器控件
 * @property {Object} pswp B 站评论区图片控件 PhotoSwipe
 */

/** @type {Window & typeof globalThis & GlobalThings} */
// @ts-ignore
const win = window;

{
  /**
   * 2025/01/07 更新
   * window.player：发现 B 站的播放器控件可以直接调用
   * 可以直接用控件来控制行为，个别需求不用基于页面元素的获取和点击来实现了
   *
   * 个别功能还需要识别页面元素或 URL
   * 现在 B 站基本只有 #bilibili-player 一套播放器组件了
   * 但是不同页面类型的链接还是不一样，有很多情况，比如番剧或者播放列表
   *
   * [video]
   *    获取<video>
   *    播放时间和倍速控制
   *
   * [control]
   *    自动连播
   *    弹幕（软开关）
   *    全屏
   *    重播
   */

  const s = {
    /** 视频 普通单个 */
    "1.1.": "https://www.bilibili.com/video/BV1ct4y1N7BQ/",

    /** 列表 电影 多集+PV */
    "2.1.": "https://www.bilibili.com/bangumi/play/ss48548",
    /** 列表 电影 多集+PV */
    "2.2.": "https://www.bilibili.com/bangumi/play/ep1113416",

    /** 列表 动画 */
    "2.3.": "https://www.bilibili.com/bangumi/play/ss41410",
    /** 列表 动画 */
    "2.4.": "https://www.bilibili.com/bangumi/play/ep691614",

    /** 列表 up设定的合集 */
    "3.1.": "https://www.bilibili.com/video/BV1W7411F79S",
    /** 列表 up设定的合集 但是多层目录 */
    "3.2.": "https://www.bilibili.com/video/BV1m1sreSEoh",

    /** 列表 单bv的分p；分p的情况还挺多的，比如也可以嵌套在下面的 /list/ 里 */
    "3.4.": "https://www.bilibili.com/video/BV1hp4y1k7SV/",

    /** 生成列表 收藏夹 */
    "4.1.": "https://www.bilibili.com/list/ml62693834?oid=973735712&bvid=BV1944y1B7MJ&p=3",
    /** 生成列表 稍后再看 */
    "4.2.": "https://www.bilibili.com/list/watchlater?oid=113431445249673&bvid=BV1M4DTYKEfs",
    /** 生成列表 up主页的播放全部 */
    "4.3.": "https://www.bilibili.com/medialist/play/7980111?from=space&business=space&sort_field=pubtime",

    /** 评论区图片快捷键 */
    "8.1.": "https://www.bilibili.com/video/BV13FBEYgEfT",

    /** 活动页 复合结构 不常用 */
    "9.1.": "https://www.bilibili.com/blackboard/activity-yXPfn575pD.html?spm_id_from=333.1007.0.0",
  };

  // * ========================================================================================================================

  /**
   * 如果是ss开头而不是ep开头的剧集，实际上不会链接携带是哪一集的信息，不过也无所谓，很少会碰到复制番剧链接的情况
   * 如果有分p，则获取分p
   * 如果是生成列表，则从 search 获取 bvid
   * 清除其他search
   */
  const getCleanUrl = () => {
    const u = new URL(document.location.href);
    const p = u.searchParams.get("p");
    const cleanSearch = p ? `?p=${p}` : "";
    if (/\/(list|medialist)\//.test(u.href)) {
      return `https://www.bilibili.com/video/${u.searchParams.get("bvid")}${cleanSearch}`;
    } else {
      return u.href.replace(u.search, cleanSearch);
    }
  };

  /** @returns {HTMLMediaElement | null} */
  const getBiliVideoElement = () => win.player.mediaElement();

  /** @returns {HTMLElement} */
  const getDanmuButton = () => win.player.getElements().container.querySelector(".bpx-player-dm-switch");

  /** @returns {NodeListOf<HTMLElement>} */
  const getDanmuLayer = () => win.player.getElements().videoArea.querySelectorAll(".bpx-player-row-dm-wrap, .bpx-player-cmd-dm-wrap");

  /** @returns {HTMLElement | null} */
  const getWebFullButton = () => document.querySelector("#bilibili-player .bpx-player-ctrl-web");
  /** @returns {HTMLElement | null} */
  const getScreenFullButton = () => document.querySelector("#bilibili-player .bpx-player-ctrl-full");

  // * ======================================================================================================================== Automation

  {
    // * ---------------------------------------------------------------- url relocation

    if (document.URL.match("/s/video/")) {
      location.replace(document.URL.replace("/s/video/", "/video/"));
    }

    // * ---------------------------------------------------------------- global solo playing

    document.addEventListener("DOMContentLoaded", () => {
      mediaControl.enableGlobalSoloPlaying(getBiliVideoElement);
    });

    // * ---------------------------------------------------------------- playlist autoplay config

    {
      /**
       * B 站的视频类型比较多，想把这些都视为播放列表
       * 抓数据结构的话有点麻烦了，而且后续不容易维护
       * 索性根据 UI 来判断，这样比较容易
       */
      const getHasPlaylistView = () =>
        Boolean(
          /** 剧集模式：电影和动画的模式 */
          document.querySelector(".main-container > .plp-r > [class^='eplist_ep_list_wrapper']") ??
            /** 合集模式：up设定的视频合集 */
            document.querySelector("#app .right-container .video-pod") ??
            /** 临时化的列表：收藏夹 稍后再看 播放全部 （这个 query 其实性能很好） */
            document.querySelector("#app .playlist-container--right .action-list-container #playlist-video-action-list-body")
        );

      /**
       * 当主视频播放时，判断是否处于播放列表中
       *
       * 如果是单视频，则关闭自动连播
       * 如果是列表视频，则开启自动连播
       *
       * 因为是前端路由，所以缓存计算结果，可能没什么必要，不过这样实现也无所谓
       * url（bvid 也行，用 url 比较简单） => 是否需要自动连播
       *
       * @type {Map<string, boolean>}
       */
      const map = new Map();

      const calcShouldHandoff = () => {
        const url = location.href;
        return map.has(url) ? map.get(url) : map.set(url, getHasPlaylistView()).get(url);
      };

      /**
       * 0: 自动切集
       * 2: 播完暂停
       * @returns {Boolean} 返回=>是否进行了设置
       */
      const setHandoffSmart = () => {
        const shouldHandoff = calcShouldHandoff();
        const currentIsHandoff = win.player.getHandoff() === 0;
        if (shouldHandoff === currentIsHandoff) return false;
        win.player.setHandoff(calcShouldHandoff() ? 0 : 2);
        return true;
      };

      let runBugfix = true;

      document.addEventListener(
        "play",
        (e) => {
          if (!(e.target instanceof HTMLMediaElement)) return;

          const bvEl = getBiliVideoElement();
          if (e.target !== bvEl) return;

          setHandoffSmart();

          // ! ----------------

          /**
           * bugfix
           * 在一些情况下（比如视频合集页面），B 站会拉取用户配置，重新设置一次 handoff
           * 这个行为不是我想要的，**可能**会修改值我设定的值
           * 不知道怎么做拦截或者等待他覆盖后的事件，简单用定时检测来实现
           * 前五秒做检查，应该足够了
           */
          if (runBugfix) {
            const tick = setInterval(() => {
              const changed = setHandoffSmart();

              if (changed) {
                clearInterval(tick);
                clearTimeout(tick2);
                runBugfix = false;
              }
            }, 1000);
            const tick2 = setTimeout(() => {
              clearInterval(tick);
              clearTimeout(tick2);
              runBugfix = false;
            }, 5000);
          }

          // ! ----------------
        },
        true
      );
    }
  }

  // * ======================================================================================================================== Hotkeys

  {
    // * ================================================================================ Custom Hotkeys Handler

    document.addEventListener("keydown", (e) => {
      // * skip inputing
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName ?? "")) return;

      const bvEl = getBiliVideoElement();
      if (!bvEl) return;

      const mc = mediaControl;
      const jumpStep = 1;
      const speedStep = 0.125;
      /** @type [number,number] */
      const speedRange = [0.125, 4];

      if (false) "";
      // * ---------------- copy clean url
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "c") {
        e.preventDefault();
        navigator.clipboard.writeText(getCleanUrl());
      }

      // * ---------------- gui control
      // 播放列表跳转用 B 站原生实现，也是 [ ]，不用自己写逻辑了
      // else if ((!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "[") || e.key === "PageUp") playlistJumpControl(-1);
      // else if ((!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "]") || e.key === "PageUp") playlistJumpControl(1);
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "c") toggleDanmuLayer();
      // * ---------------- fullscreen
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "t") {
        getWebFullButton()?.click();
        refreshDamnuLayer();
      } else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "f") {
        getScreenFullButton()?.click();
        refreshDamnuLayer();
      }
      // * ---------------- play time
      // TODO 重新播放可能有bug，会卡在第一帧画面，下次再碰到说 // Seognil LC 2025/01/08
      // TODO 有时候连续跳时间轴会卡顿，不知道什么原因，下次再碰到试试改成 player.seek 而不是直接 media.currentTime // Seognil LC 2025/01/08
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "Backspace") mc.setPlaybackJumpToPercent(bvEl, 0);
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.code === "Space") {
        e.preventDefault();
        mc.togglePlay(bvEl);
      } else if ((!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "q") || e.key === "ArrowLeft") {
        if (e.key === "ArrowLeft" && win.pswp?.isOpen) return win.pswp?.prev();
        mc.setPlaybackJumpBySec(bvEl, -jumpStep);
      } else if ((!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "e") || e.key === "ArrowRight") {
        if (e.key === "ArrowRight" && win.pswp?.isOpen) return win.pswp?.next();
        mc.setPlaybackJumpBySec(bvEl, +jumpStep);
      }
      // * ---------------- play speed
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "z") {
        mc.setPlaybackSpeedBy(bvEl, -speedStep, speedRange);
        toastPlaybackSpeed();
      } else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "x") {
        mc.setPlaybackSpeedBy(bvEl, +speedStep, speedRange);
        toastPlaybackSpeed();
      } else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "v") {
        mc.togglePlaybackSpeed(bvEl);
        toastPlaybackSpeed();
      }
      // * ---------------- loop
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "r") {
        mc.setReplayLoop(bvEl);
        toastReplayStatus();
      }
    });

    // * ================================================================================ Block Original Hotkeys

    {
      /**
       * 我们上面已经调用 addEventListener 绑定好了一套快捷键。
       * 接着覆盖原生 addEventListener，当检测到关键按键时，停止函数执行。
       * 这样就能实现触发我们自己的快捷键，而不触发B站的快捷键。
       * 不过因为拦截了很多功能，所以个别功能需要要自己实现
       */
      /**  */

      const legacyAddHandler = EventTarget.prototype.addEventListener;
      Object.defineProperty(EventTarget.prototype, "addEventListener", {
        get: function () {
          return function (...args) {
            const [eventname, fn, ...rest] = args;
            if (eventname === "keydown") {
              const hackFn = function (...args) {
                "OVERRIDE_FLAG";
                const [e] = args;
                /** 遮蔽快捷键，阻止触发 */
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

    // * ---------------------------------------------------------------- danmu

    let danmuShown = true;
    const toggleDanmuLayer = () => {
      danmuShown = !danmuShown;
      refreshDamnuLayer();
    };

    /**
     * 采用软实现，只控制弹幕层的 opacity，不使用 B 站的实现完全关闭
     * 切换全屏后，Dom 变化后需要重新设置，这里封装成一个方法来手动调用
     */
    const refreshDamnuLayer = () => {
      const danmuButton = getDanmuButton();
      const danmuLayer = getDanmuLayer();

      // @ts-ignore
      [danmuButton, ...danmuLayer].forEach((e) => (e.style.opacity = danmuShown ? 1 : 0));

      toast(danmuShown ? "弹幕层开" : "弹幕层关");
    };

    // * ---------------------------------------------------------------- speed control

    const toastPlaybackSpeed = () => {
      const curRatio = getBiliVideoElement()?.playbackRate;
      curRatio && toast("倍速 " + curRatio.toFixed(3).replace(/\.?0+$/, ""));
    };

    const toastReplayStatus = () => {
      const isLooping = getBiliVideoElement()?.loop;
      toast(isLooping ? "开启循环" : "关闭循环");
    };

    // * ---------------------------------------------------------------- player custom toast

    let toastTick = setTimeout(() => {});
    let toastEl = null;

    /** @param {string} text */
    const toast = (text) => {
      // * ---------------- prepare element

      const container = getBiliVideoElement()?.parentElement;
      if (!container) return null;

      if (!toastEl) {
        toastEl = document.createElement("div");
        toastEl.id = "lcdebug-toast"; // id for css binding
        container.appendChild(toastEl);
      }

      // * ---------------- action

      toastEl.textContent = text;
      toastEl.classList.add("shown");

      clearTimeout(toastTick);
      toastTick = setTimeout(() => toastEl?.classList.remove("shown"), 1000);
    };
  }
}

// * ======================================================================================================================== Deprecated Code

{
  /**
   * 除了活动页是 iframe 里的 #shinonome，其他现在都是 #bilibili-player
   *
   * #bilibili-player, #shinonome
   *    .bpx-player-video-wrap > video
   *
   * @returns {HTMLMediaElement | void}
   */
  const getBiliVideoElement = () => {
    // return document.querySelector("#bilibili-player video") ?? document.querySelector("#shinonome video");
    return document.getElementById("bilibili-player")?.getElementsByTagName("video").item(0) ?? document.getElementById("shinonome")?.getElementsByTagName("video").item(0);
  };

  /**
   * 自动切集 <input>
   * @returns {HTMLInputElement}
   */
  const getHandoffAutoplayInput = () => document.getElementById("bilibili-player")?.querySelector(".bpx-player-ctrl-setting-handoff input[value='0']");

  /**
   * 播完暂停 <input>
   * @returns {HTMLInputElement}
   */
  const getHandoffPauseInput = () => document.getElementById("bilibili-player")?.querySelector(".bpx-player-ctrl-setting-handoff input[value='2']");
}