{
  // * ================================================================================

  // TODO 对复合活动页的支持有限，因为是位于 iframe 中，个别功能的逻辑目前失效  // Seognil LC 2025/01/09
  // 而且本来活动页的功能和普通的播放页也不一样，比如也没有网页全屏按钮。以后有需要再说吧

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

    /** 列表 动画（指向整个番剧） */
    "2.3.": "https://www.bilibili.com/bangumi/play/ss41410",
    /** 列表 动画（指向具体的集数） */
    "2.4.": "https://www.bilibili.com/bangumi/play/ep691614",

    /** 列表 up设定的合集 */
    "3.1.": "https://www.bilibili.com/video/BV1W7411F79S",
    /** 列表 up设定的合集 但是多层目录 */
    "3.2.": "https://www.bilibili.com/video/BV1m1sreSEoh",

    /** 列表 单bv的分p；分p的情况还挺多的，比如也可以嵌套在下面的 /list/ 里 */
    "3.4.": "https://www.bilibili.com/video/BV1hp4y1k7SV/?p=1",

    /** 多p 嵌套列表 */
    "3.5.": "https://www.bilibili.com/video/BV1EP41167eq",
    "3.6.": "https://www.bilibili.com/video/BV1EP41167eq?p=4",

    /** 生成列表 收藏夹 */
    "4.1.": "https://www.bilibili.com/list/ml62693834?oid=973735712&bvid=BV1944y1B7MJ&p=3",
    /** 生成列表 稍后再看 */
    "4.2.": "https://www.bilibili.com/list/watchlater?oid=113431445249673&bvid=BV1M4DTYKEfs",
    /** 生成列表 up主页的播放全部 */
    // "4.3.": "https://www.bilibili.com/medialist/play/7980111?from=space&business=space&sort_field=pubtime",
    /** 生成列表 up主页的播放全部（新格式） */
    "4.4.": "https://www.bilibili.com/list/7980111?from=space&business=space&sort_field=pubtime",

    /** 评论区图片快捷键 */
    "8.1.": "https://www.bilibili.com/video/BV13FBEYgEfT",

    /** 活动页 复合结构 不常用 */
    "9.1.": "https://www.bilibili.com/blackboard/activity-yXPfn575pD.html",
  };

  // * ================================================================================ utils fn

  /**
   * @typedef {Object} GlobalThings
   * @property {Object} player B 站的播放器控件
   * @property {Object} pswp B 站评论区图片控件 PhotoSwipe
   * @property {Object} __INITIAL_STATE__ data
   */

  /** @type {Window & typeof globalThis & GlobalThings} */
  // @ts-ignore
  const win = window;

  // * ----------------------------------------------------------------

  /** @returns {HTMLVideoElement | null} */
  const getBiliVideoElement = () => win.player?.mediaElement();

  /** @returns {HTMLElement | null} */
  const getWebFullButton = () => document.querySelector("#bilibili-player .bpx-player-ctrl-web");
  /** @returns {HTMLElement | null} */
  const getScreenFullButton = () => document.querySelector("#bilibili-player .bpx-player-ctrl-full");

  /** @returns {HTMLElement | null} */
  const getSubtitleButton = () => document.querySelector("#bilibili-player .bpx-player-ctrl-subtitle .bpx-common-svg-icon");

  // * ---------------------------------------------------------------- player custom toast

  /** @param {string} text */
  const toast = (text) => mediaControl.toast(getBiliVideoElement()?.parentElement, text);

  // * ----------------------------------------------------------------

  /**
   * 等待数据变更
   * @param { () => any } getDataFn
   * @param {{ interval?:number, timeout?:number }} [opts]
   */
  const waitUntilChanged = (getDataFn, opts) => {
    const prevData = getDataFn();
    return new Promise((res, rej) => {
      if (getDataFn() !== prevData) return res();

      const tick = setInterval(() => {
        if (getDataFn() !== prevData) {
          clearInterval(tick);
          clearTimeout(tock);
          res();
        }
      }, opts?.interval ?? 500);
      const tock = setTimeout(() => {
        clearInterval(tick);
        clearTimeout(tock);
        rej();
      }, opts?.timeout ?? 2147483647);
    });
  };

  // * ================================================================================ Automation

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
       * bugfix
       * 在一些情况下（比如视频合集页面），B 站会拉取用户配置，重新设置一次 handoff
       * 这个行为不是我想要的，**可能**会修改值我设定的值
       * 目前不清楚是什么时候怎么发生的，那么先简单用定时检测来重行覆盖
       */

      /** 仅当播放列表且非最后一集，才设置连播 */

      const hasPlaylistNext = () => {
        const cid = win.__INITIAL_STATE__.cid;
        const playlist = win.__INITIAL_STATE__.videoData.ugc_season?.sections.flatMap((e) => e.episodes) ?? win.__INITIAL_STATE__.videoData.pages;

        const hasNext = playlist.at(-1)?.cid !== cid;
        return hasNext;
      };

      /**
       * 0: 自动切集
       * 2: 播完暂停
       * @returns {Boolean} 返回=>是否进行了设置
       */
      const setHandoffLite = () => {
        const shouldHandoff = hasPlaylistNext();
        const currentIsHandoff = win.player.getHandoff() === 0;
        if (shouldHandoff === currentIsHandoff) return false;
        win.player.setHandoff(shouldHandoff ? 0 : 2);
        return true;
      };

      document.addEventListener(
        "play",
        (e) => {
          const bvEl = getBiliVideoElement();
          if (e.target !== bvEl) return;
          setHandoffLite();
        },
        true,
      );

      document.addEventListener("DOMContentLoaded", () => {
        setHandoffLite();
        const tick = setInterval(() => setHandoffLite(), 500);
        setTimeout(() => clearInterval(tick), 3000);
      });

      // @ts-ignore
      window.navigation.addEventListener("navigate", async () => {
        await waitUntilChanged(() => win.__INITIAL_STATE__?.videoData.cid);
        setHandoffLite();
      });
    }
  }

  // * ================================================================================ Hotkeys Handler

  {
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
      // * ---------------- copy clipboard
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        cleanUrlToClipboard();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
        snapshotToClipboard();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        subtitleToClipboard();
      }

      // * ---------------- gui control
      // 播放列表跳转用 B 站原生实现，也是 [ ]，不用自己写逻辑了
      // else if ((!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "[") || e.key === "PageUp") playlistJumpControl(-1);
      // else if ((!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "]") || e.key === "PageUp") playlistJumpControl(1);
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "b") toggleDanmaku();
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "c") getSubtitleButton()?.click();
      // * ---------------- fullscreen
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "t") getWebFullButton()?.click();
      else if (!(e.ctrlKey || e.metaKey || e.shiftKey) && e.key === "f") getScreenFullButton()?.click();
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

    // * ------------------------------------------------ copy url

    /**
     * 有一个bug，如果是番剧，ss地址指向的是番剧本身（根据用户上次观看 不确定集数），而ep指向的是具体集数
     * 不过也无所谓，连播时切换集数就会变成ep地址，而且复制番剧链接的需求比较少见2
     *
     * - 如果是私有列表，仅抓取 bvid
     * - 如果是公开的列表，仅抓取 bvid（目前只有播放全部）
     * - 其他情况（单视频等但是可能会有多p之类的参数）清理 search
     */
    const getCleanUrl = () => {
      const u = new URL(document.location.href);

      if (/\/list\//.test(u.href)) {
        const bvid = u.searchParams.get("bvid");
        const p = pickSearchParamsString(u.searchParams, ["p"]);
        const bvidUrl = `https://www.bilibili.com/video/${bvid}/${p}`;
        return bvidUrl;
      } else {
        const cleanSearch = pickSearchParamsString(u.searchParams, ["bvid", "oid", "sort_field", "p"]);
        const cleanUrl = u.href.replace(u.search, cleanSearch);
        return cleanUrl;
      }
    };

    /**
     * @param {URLSearchParams} s
     * @param {string[]} keys
     * @return {string} => ?key1=val1&key2=val2
     */
    const pickSearchParamsString = (s, keys) => {
      const nextS = new URLSearchParams();
      keys.forEach((key) => {
        const val = s.get(key);
        if (val === null || val === undefined) return;
        nextS.set(key, val);
      });
      const str = nextS.toString();
      return str ? `?${str}` : "";
    };

    const cleanUrlToClipboard = () => navigator.clipboard.writeText(getCleanUrl()).then(() => toast("复制地址"));

    // * ------------------------------------------------ copy snapshot

    /** 视频截图到剪贴板 */
    const snapshotToClipboard = () => {
      const video = getBiliVideoElement();
      if (!video) return;

      mediaControl.videoSnap(video).then(() => toast("复制截图"));
    };

    // * ------------------------------------------------ copy subtitle

    const fetchSubtitle = async () => {
      const { aid, cid } = win.__INITIAL_STATE__;
      if (!aid || !cid) return;

      const data = await fetch(`https://api.bilibili.com/x/player/wbi/v2?aid=${aid}&cid=${cid}`, { credentials: "include" }).then((e) => e.json());
      const suburl = data.data.subtitle.subtitles.find((e) => e.lan_doc.includes("中文"))?.subtitle_url;

      if (!suburl) return;

      const url = suburl.startsWith("//") ? "https:" + suburl : suburl;
      return fetch(url).then((e) => e.json());
    };

    const subtitleToClipboard = async () => {
      const d = await fetchSubtitle();
      if (!d) toast("获取字幕失败");

      const content = d.body?.map((e) => e.content).join("\n");
      navigator.clipboard.writeText(content).then(() => toast("复制字幕"));
    };

    // * ------------------------------------------------ danmaku

    /**
     * 采用软实现，只控制弹幕层的 opacity，不使用 B 站自带的实现（完全关闭弹幕层）
     * 通过 toggle container className 和 css 来直接实现，多快好省
     */
    const toggleDanmaku = () => {
      const attachTarget = document.querySelector("#bilibili-player") ?? document.querySelector("#shinonome");
      if (!attachTarget) return;
      const hidden = attachTarget.classList.toggle("danmaku-hidden");
      toast(hidden ? "弹幕层关" : "弹幕层开");
    };

    // * ------------------------------------------------ speed control

    const toastPlaybackSpeed = () => {
      const curRatio = getBiliVideoElement()?.playbackRate;
      curRatio && toast("倍速 " + curRatio.toFixed(3).replace(/\.?0+$/, ""));
    };

    const toastReplayStatus = () => {
      const isLooping = getBiliVideoElement()?.loop;
      toast(isLooping ? "开启循环" : "关闭循环");
    };

    // * ================================================================================ Block Original Hotkeys

    {
      /**
       * 我们上面已经调用 addEventListener 绑定好了一套快捷键。
       * 接着覆盖原生 addEventListener，当检测到关键按键时，停止函数执行。
       * 这样就能实现触发我们自己的快捷键，而不触发B站的快捷键。
       * 不过因为拦截了很多功能，所以个别功能需要要自己再实现一遍，比如 pswp 的快捷键
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
  }
}
