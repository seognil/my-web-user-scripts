{
  /**
   * 处理一般播放列表的 总播放进度
   *
   * 不同 bvid 简单列表
   * https://www.bilibili.com/video/BV1W7411F79S/
   *
   * 同 bvid 简单列表
   * https://www.bilibili.com/video/BV1Q44y157Xh?p=6
   *
   * 多层列表 单 bvid
   * https://www.bilibili.com/video/BV12rYkzcEQ4
   *
   * 多层列表 单 bvid 多 p
   * https://www.bilibili.com/video/BV1EP41167eq/
   * https://www.bilibili.com/video/BV1EP41167eq?p=4
   *
   * 自制list 单 bvid 多 p
   * https://www.bilibili.com/list/ml62693834?oid=973735712&bvid=BV1944y1B7MJ&p=3
   *
   * 全部播放list 单 bvid 多 p
   * https://www.bilibili.com/list/7980111?from=space&business=space&sort_field=pubtime&bvid=BV18kakziE3h&p=2
   *
   */

  // * -------------------------------- build playlist time

  /** @type {Map<string, any>} */
  const fetchCache = new Map();

  /**
   * @typedef {Object} PlaylistTime
   * @property {[number,number]} all
   * @property {[number,number]} [sub]
   */

  const buildListTime = async (url = location.href) => {
    // * ---------------- params

    const u = new URL(url);

    const bvid = u.searchParams.get("bvid") ?? u.href.match(/\bBV[^/?]+\b/)?.[0];

    if (!bvid) return;

    const data =
      fetchCache.get(bvid) ??
      (await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`)
        .then((e) => e.json())
        .then((e) => {
          fetchCache.set(bvid);
          return e;
        }));

    const p = Number(u.searchParams.get("p") ?? 1);

    // * ---------------- build

    if (data.data.ugc_season) {
      const eps = data.data.ugc_season?.sections.flatMap((e) => e.episodes);
      const epIndex = eps?.findIndex((e) => e.bvid === bvid);
      const pages = eps?.find((e) => e.bvid === bvid).pages;
      const pageIndex = p - 1;

      const totalTimeAll = eps
        .flatMap((e) => e.pages)
        .map((e) => e.duration)
        .reduce((a, e) => a + e, 0);

      const beforeTimeAll = [...(epIndex > 0 ? eps.slice(0, epIndex).flatMap((e) => e.pages) : []), ...(pageIndex > 0 ? pages.slice(0, pageIndex) : [])].map((e) => e.duration).reduce((a, e) => a + e, 0);

      const TotalTimeSub = pages.map((e) => e.duration).reduce((a, e) => a + e, 0);

      const beforeTimeSub = (pageIndex > 0 ? pages.slice(0, pageIndex) : []).map((e) => e.duration).reduce((a, e) => a + e, 0);

      /** @type {PlaylistTime} */
      const result = {
        all: [beforeTimeAll, totalTimeAll],
        sub: [beforeTimeSub, TotalTimeSub],
      };
      const isSinglePage = pages.length <= 1;
      if (isSinglePage) delete result.sub;

      return result;
    } else {
      const pages = data.data.pages;
      const isSinglePage = pages.length <= 1;
      if (isSinglePage) return null;

      const pageIndex = p - 1;

      const totalTimeAll = pages.map((e) => e.duration).reduce((a, e) => a + e, 0);

      const beforeTimeAll = (pageIndex > 0 ? pages.slice(0, pageIndex) : []).map((e) => e.duration).reduce((a, e) => a + e, 0);

      /** @type {PlaylistTime} */
      const result = {
        all: [beforeTimeAll, totalTimeAll],
      };
      return result;
    }
  };

  // * -------------------------------- build bind

  /** @type { PlaylistTime | null } */
  let time = null;

  buildListTime().then((result) => (time = result));

  // @ts-ignore
  window.navigation.addEventListener("navigate", (event) => {
    buildListTime(event.destination.url).then((result) => (time = result));
  });

  // * -------------------------------- progress bar

  const pb = window.makeProgressBar();
  const pb2 = window.makeProgressBar();

  document.addEventListener(
    "loadstart",
    async (e) => {
      /** @type {HTMLMediaElement} */
      // @ts-ignore
      const media = window.player?.mediaElement();

      if (e.target !== media) return;

      media.addEventListener("timeupdate", () => {
        if (!time) return;

        /** 注：仅合集类型的视频，有带视频列表 */
        /** @type {HTMLElement} */
        const playlistEl = document.querySelector("#mirror-vdcon .video-pod, #mirror-vdcon .action-list-container");
        if (!playlistEl) return;

        const currentTime = media.currentTime;

        // * ---------------- main pb

        /** attach pb element */
        if (!playlistEl.contains(pb.pbEl)) {
          playlistEl.style.position = "relative";
          playlistEl.style.overflow = "initial";
          Object.assign(pb.pbEl.style, {
            position: "absolute",
            top: "0",
            right: "0",
            width: "100%",
          });
          Object.assign(pb.textEl.style, {
            left: "0",
            top: "0",
            transform: "translateY(-100%)",
            fontSize: "12px",
          });
          // ! setTimeout for 等待B站dom检测功能执行完
          setTimeout(() => {
            playlistEl.appendChild(pb.pbEl);
          }, 1500);
        }

        pb.updateProgressBar(time.all[0] + currentTime, time.all[1]);

        // * ---------------- sub pb

        if (time.sub) {
          pb2.pbEl.style.display = "initial";

          if (!playlistEl.contains(pb2.pbEl)) {
            Object.assign(pb2.pbEl.style, {
              position: "absolute",
              top: "0",
              right: "0",
              width: "100%",
            });
            Object.assign(pb2.barEl.style, {
              top: "2px",
            });
            Object.assign(pb2.textEl.style, {
              right: "0",
              top: "0",
              transform: "translateY(-100%)",
              fontSize: "12px",
            });
            // ! setTimeout for 等待B站dom检测功能执行完
            setTimeout(() => {
              playlistEl.appendChild(pb2.pbEl);
            }, 1500);
          }

          pb2.updateProgressBar(time.sub[0] + currentTime, time.sub[1]);
        } else {
          pb2.pbEl.style.display = "none";
        }
      });
    },
    true,
  );
}
