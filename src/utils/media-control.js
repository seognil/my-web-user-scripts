// export { mediaControl };

const mediaControl = (() => {
  // * ----------------

  /**
   * @param {number} v
   * @param {[number, number]} range
   */
  const inRange = (v, [min, max]) => Math.min(Math.max(v, min), max);

  /**
   * 判断 node 是否匹配 selector 函数的查询结果
   * @param {HTMLElement} node
   * @param { () => HTMLElement | ArrayLike<HTMLElement> | void } selectorFn
   */
  const isMatchSelectorFn = (node, selectorFn) => {
    if (!node) return false;
    const n = selectorFn();
    if (!n) return false;
    return (n instanceof HTMLElement ? [n] : Array.from(n)).some((e) => e === node);
  };

  /** @returns HTMLMediaElement[] */
  // @ts-ignore
  const getMediaAll = () => [...document.getElementsByTagName("video"), ...document.getElementsByTagName("audio")];

  // * ----------------

  /**
   * 手动音量倍率放大，解决有些源声音太小的问题
   * @param {HTMLMediaElement} media
   * @param {number} ratio
   */
  const setVolumnRatio = (media, ratio) => {
    const setVolumnRatio = (audio, ratio) => {
      var audioCtx = new window.AudioContext();
      var source = audioCtx.createMediaElementSource(audio);

      var gainNode = audioCtx.createGain();
      gainNode.gain.value = ratio;
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
    };

    let did = false;
    media.addEventListener("play", () => {
      if (did) return;
      did = true;
      setVolumnRatio(media, ratio);
    });
  };

  // * ---------------- 播放 跳转

  /**
   * @param {HTMLMediaElement} media
   */
  const togglePlay = (media) => {
    media.paused ? media.play() : media.pause();
  };

  /**
   * @param {HTMLMediaElement} media
   * @param {number} percent // [0, 100]
   */
  const setPlaybackJumpToPercent = (media, percent) => {
    media.currentTime = media.duration * percent;
  };

  /**
   * @param {HTMLMediaElement} media
   * @param {number} delta
   */
  const setPlaybackJumpBySec = (media, delta) => {
    media.currentTime = inRange(media.currentTime + delta, [0, media.duration]);
  };

  // * ---------------- 自动暂停其他标签

  const bc = new BroadcastChannel("media-control");

  /**
   * 播放标识，由 页面加载时间（用来简单识别为不同的页面）、页面URL、媒体src 构成
   * 对于页面中的媒体来说，通常（简单防碰撞）这些是能快速获取的、固定的值，组合成唯一值
   *
   * @param {HTMLMediaElement} media */
  const getMediaIdentifier = (media) => {
    return {
      pageTime: performance.timeOrigin,
      url: location.href,
      mediaSrc: media.src,
    };
  };

  /**
   * @param {Object} a
   * @param {Object} b
   * just simple check code
   */
  const isSameMediaIdentifier = (a, b) => a.pageTime === b.pageTime && a.url === b.url && a.mediaSrc === b.mediaSrc;
  // [...Object.keys(a), ...Object.keys(b)].every((k) => a[k] === b[k]);

  /**
   * 仅当媒体开始播放后，才可能需要被暂停，那么
   *
   * 当播放后
   *    判断受控的媒体元素并暂存
   *    广播正在播放的媒体标识
   *
   * 当接收到媒体标识后
   *    只暂停记录的受控媒体
   *
   * 用 Set 而不是 WeakSet 因为可以遍历
   * @type {Set<WeakRef<HTMLMediaElement>>}
   */
  const set = new Set();

  bc.addEventListener("message", ({ data }) => {
    set.forEach((e) => {
      const media = e.deref();

      if (!media) return set.delete(e);

      if (media.paused) return;

      /** 或许由于 BroadcastChannel的机制，这个不可能会相同，不过还是检查一下以防万一 */
      if (!isSameMediaIdentifier(data, getMediaIdentifier(media))) {
        media.pause();
      }
    });
  });

  /**
   * 当有多个页面一起播放时，播放当前的媒体则自动暂停其他标签页的媒体
   * BroadcastChannel 仅限同源，姑且够用
   *
   * 满足 selector 的视为主要受控媒体（可以用来略过一些背景图视频或小窗预览视频，他们播放时一般无关紧要）
   * 当媒体播放时，进行受控标记，仅当受控媒体播放时，才暂停其他标签页的媒体
   *
   * @param { () => HTMLMediaElement | ArrayLike<HTMLMediaElement> | void } [selectorFn]
   */
  const enableGlobalSoloPlaying = (selectorFn = getMediaAll) => {
    /** @param {Event} e */
    const handler = (e) => {
      if (!(e.target instanceof HTMLMediaElement)) return;
      const media = e.target;

      const shouldControl = isMatchSelectorFn(media, selectorFn);

      if (!shouldControl) return;

      set.add(new WeakRef(media));

      bc.postMessage(getMediaIdentifier(media));
    };

    document.addEventListener("play", handler, true);

    /** disconnect fn */
    return () => document.removeEventListener("play", handler);
  };

  // * ---------------- 循环播放

  /**
   * 切换循环，可以指定传参，也可以自动切换
   * 当开启循环时，如果当前为播放结束，则视为要重新自动播放
   * @param {HTMLMediaElement} media
   * @param {boolean} [state]
   */
  const setReplayLoop = (media, state) => {
    const shouldLoop = state ?? !media.loop;
    media.loop = shouldLoop;

    if (shouldLoop && media.ended) media.play();
  };

  // * ---------------- 播放速度

  /** default rated speed value */
  let lastSpeed = 1.75;

  /**
   * 增减播放速度
   * @param {HTMLMediaElement} media
   * @param {number} delta
   * @param {[number,number]} range
   */
  const setPlaybackSpeedBy = (media, delta, range) => {
    const nextSpeed = inRange(media.playbackRate + delta, range);
    media.playbackRate = nextSpeed;
    if (nextSpeed != 1) lastSpeed = nextSpeed;
  };

  /**
   * 切换播放速度
   * @param {HTMLMediaElement} media
   */
  const togglePlaybackSpeed = (media) => {
    const curSpeed = media.playbackRate;
    media.playbackRate = curSpeed === 1 ? lastSpeed : 1;
  };

  // * ---------------- sound beep

  /**
   * 简单的 beep 声，可以用来做操作提示
   * @param {number} frequency 毫秒
   * @param {number} duration 毫秒
   */
  const SoundBeep = (frequency, duration) =>
    new Promise((resolve) => {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(context.destination);
      oscillator.start();
      setTimeout(function () {
        oscillator.stop();
        resolve();
      }, duration);
    });

  // * ---------------- export

  /**
   * 播放列表控制每个网站都不一样，还有网页全屏之类的功能，用模拟点击网页按钮来实现
   * 所以这里只封装对单个音视频的播放状态进行的控制
   */

  return {
    getMediaIdentifier,
    isSameMediaIdentifier,

    setVolumnRatio,
    enableGlobalSoloPlaying,
    togglePlay,
    setPlaybackJumpToPercent,
    setPlaybackJumpBySec,
    setReplayLoop,
    setPlaybackSpeedBy,
    togglePlaybackSpeed,

    SoundBeep,
  };
})();
