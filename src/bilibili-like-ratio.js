{
  /**
   *
   * https://www.bilibili.com/
   * https://www.bilibili.com/c/douga/
   *
   * https://search.bilibili.com/all?keyword=%E7%A1%85%E8%B0%B7101
   *
   * https://www.bilibili.com/video/BV1L2h9zzEA3/
   *
   * https://www.bilibili.com/list/watchlater?oid=113431445249673&bvid=BV1M4DTYKEfs
   *
   * https://www.bilibili.com/bangumi/play/ss41410
   * https://www.bilibili.com/bangumi/play/ep691614
   */

  // * ================================================================================ analysis

  /** 本地 indexedDB，用于后续分析 */

  const dbPut = (tableName, key, value) => {
    // console.log("[lcdebug 4e850b]", tableName, key, value);
    dbUtil.put("bilibili-videos", tableName, key, value);
  };

  // * ================================================================================ rarity color

  /** @type {[number,string][]} */
  const colormap = [
    [0, "hsl(0 0% 80%)"],
    [4, "hsl(120 100% 80%)"],
    [6, "hsl(200 100% 70%)"],
    [8, "hsl(300 100% 70%)"],
    [10, "hsl(30 100% 60%)"],
  ];
  const ratioColor = (ratio) =>
    colormap.find((e, i, a) => {
      return e[0] <= ratio * 100 && ratio * 100 < (a[i + 1]?.[0] ?? Infinity);
    })?.[1] ?? "black";

  // * ================================================================================ card list

  // * ---------------------------------------------------------------- bvid data

  /**
   * @typedef {Object} CardVideoStat
   * @property {number} view
   * @property {number} like
   */

  /** @type {Map<string, CardVideoStat & Record<any,any>>} */
  const cardStatMap = new Map();

  const isCardPage =
    location.pathname === "/" ||
    location.pathname.startsWith("/c/") ||
    //
    location.host.startsWith("search");

  {
    // * -------------------------------- action set data

    /**
     * @param {string} bvid
     * @param {CardVideoStat & Record<any,any>} stat
     */
    const setCardStat = (bvid, stat) => {
      cardStatMap.set(bvid, stat);
      dbPut("list", bvid, stat);
    };

    // * -------------------------------- record with ssr data

    document.addEventListener("DOMContentLoaded", () => {
      /** @type {Window & {__pinia:Object}} */
      // @ts-ignore
      const win = window;

      /** home page ssr data */
      win.__pinia?.feed?.data.recommend.item
        .filter((e) => e.bvid)
        .forEach((e) => {
          setCardStat(e.bvid, {
            bvid: e.bvid,
            cid: e.cid,
            author: e.owner.name,
            title: e.title,
            view: e.stat.view,
            like: e.stat.like,
          });
        });

      /** search page ssr data */
      win.__pinia?.searchResponse?.searchAllResponse.result[11].data
        .filter((e) => e.type === "video")
        .forEach((e) => {
          setCardStat(e.bvid, {
            bvid: e.bvid,
            aid: e.aid,
            author: e.author,
            title: e.title,
            view: e.play,
            like: e.like,
          });
        });

      /** search page ssr data (while search query) */
      win.__pinia?.searchTypeResponse?.searchTypeResponse.result
        ?.filter((e) => e.type === "video")
        .forEach((e) => {
          setCardStat(e.bvid, {
            bvid: e.bvid,
            aid: e.aid,
            author: e.author,
            title: e.title,
            view: e.play,
            like: e.like,
          });
        });
    });

    // * -------------------------------- record with fetch response

    fetchHook.add(async (resource, response) => {
      if (!isCardPage) return;

      if (typeof resource !== "string") return;

      if (resource.includes("api.bilibili.com")) {
        if (resource.includes("/rcmd")) {
          const res = await response.json();

          /** home page load more */
          res.data.item?.forEach((e) => {
            setCardStat(e.bvid, {
              bvid: e.bvid,
              cid: e.cid,
              author: e.owner.name,
              title: e.title,
              view: e.stat.view,
              like: e.stat.like,
            });
          });

          /** c page load more */
          res.data.archives?.forEach((e) => {
            setCardStat(e.bvid, {
              bvid: e.bvid,
              aid: e.aid,
              cid: e.cid,
              author: e.author.name,
              title: e.title,
              view: e.stat.view,
              like: e.stat.like,
            });
          });
        }

        /** search page update query */
        if (resource.includes("search/type")) {
          const res = await response.json();
          res.data.result?.forEach((e) => {
            setCardStat(e.bvid, {
              bvid: e.bvid,
              aid: e.aid,
              author: e.author,
              title: e.title,
              view: e.play,
              like: e.like,
            });
          });
        }

        /** search page clear query */
        if (resource.includes("search/all/v2")) {
          const res = await response.json();
          res.data.result?.[11]?.data
            .filter((data) => data.type === "video")
            .forEach((e) => {
              setCardStat(e.bvid, {
                bvid: e.bvid,
                aid: e.aid,
                author: e.author,
                title: e.title,
                view: e.play,
                like: e.like,
              });
            });
        }
      }
    });
  }

  // * ---------------------------------------------------------------- render

  {
    // * -------------------------------- thumbsup element

    const thumbsup = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="18" height="18" fill="#ffffff"
    style="margin-right:2px;">
    <path
        d="M594.176 151.168a34.048 34.048 0 0 0-29.184 10.816c-11.264 13.184-15.872 24.064-21.504 40.064l-1.92 5.632c-5.632 16.128-12.8 36.864-27.648 63.232-25.408 44.928-50.304 74.432-86.208 97.024-23.04 14.528-43.648 26.368-65.024 32.576v419.648a4569.408 4569.408 0 0 0 339.072-4.672c38.72-2.048 72-21.12 88.96-52.032 21.504-39.36 47.168-95.744 63.552-163.008a782.72 782.72 0 0 0 22.528-163.008c0.448-16.832-13.44-32.256-35.328-32.256h-197.312a32 32 0 0 1-28.608-46.336l0.192-0.32 0.64-1.344 2.56-5.504c2.112-4.8 5.12-11.776 8.32-20.16 6.592-17.088 13.568-39.04 16.768-60.416 4.992-33.344 3.776-60.16-9.344-84.992-14.08-26.688-30.016-33.728-40.512-34.944zM691.84 341.12h149.568c52.736 0 100.864 40.192 99.328 98.048a845.888 845.888 0 0 1-24.32 176.384 742.336 742.336 0 0 1-69.632 178.56c-29.184 53.44-84.48 82.304-141.76 85.248-55.68 2.88-138.304 5.952-235.712 5.952-96 0-183.552-3.008-244.672-5.76-66.432-3.136-123.392-51.392-131.008-119.872a1380.672 1380.672 0 0 1-0.768-296.704c7.68-72.768 70.4-121.792 140.032-121.792h97.728c13.76 0 28.16-5.504 62.976-27.456 24.064-15.104 42.432-35.2 64.512-74.24 11.904-21.184 17.408-36.928 22.912-52.8l2.048-5.888c6.656-18.88 14.4-38.4 33.28-60.416a97.984 97.984 0 0 1 85.12-32.768c35.264 4.096 67.776 26.88 89.792 68.608 22.208 42.176 21.888 84.864 16 124.352a342.464 342.464 0 0 1-15.424 60.544z m-393.216 477.248V405.184H232.96c-40.448 0-72.448 27.712-76.352 64.512a1318.912 1318.912 0 0 0 0.64 282.88c3.904 34.752 32.96 61.248 70.4 62.976 20.8 0.96 44.8 1.92 71.04 2.816z"
        fill="currentColor">
    </path>
</svg>
`;

    const shadow = document.createElement("div");
    shadow.innerHTML = thumbsup.trim();
    const thumbsupEl = shadow.firstElementChild;

    // * -------------------------------- list card mutation

    document.addEventListener("DOMContentLoaded", () => {
      if (!isCardPage) return;

      domObserverAll(".bili-feed-card, .bili-video-card", (el) => {
        const barEl = el.querySelector(".bili-video-card__stats--left, .bili-cover-card__stats");

        if (!barEl) return;
        if (barEl?.querySelector(".like-ratio")) return;

        // * ---------------- data

        const url = el.querySelector("a")?.href;
        if (!url) return;
        const u = new URL(url);
        const bvid = u.searchParams.get("bvid") ?? u.href.match(/video\/([^/?]+)\b/)?.[1];

        const s = cardStatMap.get(bvid);
        if (!s) return;
        const ratio = s.view === 0 ? 0 : s.like / s.view;

        // * ---------------- elements

        /** @type {HTMLElement} */
        // @ts-ignore
        const itemEl = barEl.firstElementChild.cloneNode();
        itemEl.classList.add("like-ratio");

        itemEl.appendChild(thumbsupEl.cloneNode(true));

        /** @type {HTMLElement} */
        // @ts-ignore
        const textEl = barEl.firstElementChild.querySelector("span").cloneNode();
        textEl.textContent = (ratio * 100).toFixed(1) + "%";

        textEl.style.color = ratioColor(ratio);

        itemEl.appendChild(textEl);

        // * ---------------- render

        if (barEl.classList.contains("bili-cover-card__stats")) {
          barEl.insertBefore(itemEl, barEl.children[2]);
        } else {
          barEl.appendChild(itemEl);
        }
      });
    });
  }

  // * ================================================================================ bvid videos

  {
    /**
     * @typedef {Object} VideoStat
     * @property {number} view
     * @property {number} like
     * @property {number} coin
     * @property {number} favorite
     * @property {number} share
     */

    /** @type {Map<string, VideoStat & Record<any,any>>} */
    const videoStatMap = new Map();

    /**
     * @param {string} bvid
     * @param {VideoStat & Record<any,any>} stat
     */
    const setVideoStat = (bvid, stat) => {
      videoStatMap.set(bvid, stat);
      dbPut("bvid", bvid, stat);
    };

    // * -------------------------------- ssr bind

    document.addEventListener("DOMContentLoaded", () => {
      /** @type {Window & {__INITIAL_STATE__:Object}} */
      // @ts-ignore
      const win = window;
      const s = win.__INITIAL_STATE__?.videoData;
      if (!s) return;

      setVideoStat(s.bvid, {
        bvid: s.bvid,
        aid: s.aid,
        cid: s.cid,
        author: s.owner.name,
        title: s.title,
        view: s.stat.view,
        like: s.stat.like,
        coin: s.stat.coin,
        favorite: s.stat.favorite,
        share: s.stat.share,
      });

      // ! 等待一段时间，不然B站会二次刷新，原因未知
      setTimeout(() => {
        updater();
      }, 2000);
    });

    // * -------------------------------- navigation bind

    // @ts-ignore
    window.navigation.addEventListener("navigate", (e) => {
      updater(e.destination.url);
    });

    // * -------------------------------- xhr bind

    xhrHook.add(async (xhr) => {
      if (xhr.responseURL.includes("api.bilibili.com") && xhr.responseURL.includes("/detail?")) {
        const res = JSON.parse(xhr.responseText);
        const v = res.data.View;
        setVideoStat(v.bvid, {
          bvid: v.bvid,
          aid: v.aid,
          cid: v.cid,
          author: v.owner.name,
          title: v.title,
          view: v.stat.view,
          like: v.stat.like,
          coin: v.stat.coin,
          favorite: v.stat.favorite,
          share: v.stat.share,
        });
        updater();
      }
    });

    // * -------------------------------- render

    /**
     * @param {string} [targetUrl]
     */
    const updater = (targetUrl) => {
      const url = targetUrl ?? location.href;
      const bvid = new URL(url).searchParams.get("bvid") ?? url.match(/\bBV[^/?]+\b/)?.[0];
      const s = videoStatMap.get(bvid);
      if (!s) return;

      const d = [s.like, s.coin, s.favorite, s.share];
      const el = document.querySelector(".video-toolbar-left-main");
      const isInitial = !el.classList.contains("like-ratio");
      el.classList.add("like-ratio");
      Array.from(el.children).forEach((e, i) => {
        /** @type {HTMLElement} */
        const container = e.querySelector(".video-toolbar-left-item");
        if (!container) return;

        /** @type {HTMLElement} */
        // @ts-ignore
        const span = isInitial ? document.createElement("span") : container.lastElementChild;

        if (isInitial) {
          span.style.filter = "brightness(80%)";
          span.style.whiteSpace = "pre-wrap";
          container.style.width = "auto";
          container.appendChild(span);
        }

        const ratio = d[i] / s.view;
        span.style.color = ratioColor(ratio);
        span.textContent = ` =${(ratio * 100).toFixed(1)}%`;
      });
    };
  }

  // * ================================================================================ bangumi videos

  {
    /**
     * @typedef {Object} BangumiStat
     * @property {number} view
     * @property {number} like
     * @property {number} coin
     * @property {number} favorite
     * @property {number} share
     */

    /** @type {Map<number, BangumiStat & Record<any,any>>} */
    const bangumiStatMap = new Map();

    /**
     * @param {number} epid
     * @param {BangumiStat & Record<any,any>} stat
     */
    const setBangumiStat = (epid, stat) => {
      bangumiStatMap.set(epid, {
        ...(bangumiStatMap.get(epid) ?? {}),
        ...stat,
      });

      dbPut("bvid", epid, bangumiStatMap.get(epid));
    };

    // * -------------------------------- ssr bind

    document.addEventListener("DOMContentLoaded", () => {
      /** @type {Window & {__NEXT_DATA__:Object}} */
      // @ts-ignore
      const win = window;
      if (!win.__NEXT_DATA__) return;

      const r = win.__NEXT_DATA__.props.pageProps.dehydratedState.queries[0].state.data.data.result;
      const info = r.supplement.ogv_episode_info;

      const d = win.__NEXT_DATA__.props.pageProps.dehydratedState.queries[1].state.data;
      const stat = d.stat;

      setBangumiStat(info.episode_id, {
        bvid: r.arc.bvid,
        aid: r.arc.aid,
        cid: r.arc.cid,
        season_id: d.season_id,
        season_title: d.season_title,
        episode_id: info.episode_id,
        episode_title: info.long_title,
        view: stat.views,
        like: stat.likes,
        coin: stat.coins,
        favorite: stat.favorites,
        share: stat.share,
      });
      updater();
    });

    // * -------------------------------- navigation bind

    // @ts-ignore
    window.navigation.addEventListener("navigate", (e) => {
      updater(e.destination.url);
    });

    // * -------------------------------- xhr bind (video info)

    xhrHook.add((xhr) => {
      if (xhr.responseURL.includes("api.bilibili.com")) {
        if (xhr.responseURL.includes("/playview?")) {
          const res = JSON.parse(xhr.responseText);

          const info = res.data.supplement.ogv_episode_info;
          const arc = res.data.arc;
          // @ts-ignore
          setBangumiStat(info.episode_id, {
            bvid: arc.bvid,
            aid: arc.aid,
            cid: arc.cid,
            episode_id: info.episode_id,
            episode_title: info.long_title,
          });
        }
      }
    });

    // * -------------------------------- xhr bind (ratio)

    xhrHook.add((xhr) => {
      if (xhr.responseURL.includes("api.bilibili.com") && xhr.responseURL.includes("info?ep_id")) {
        const res = JSON.parse(xhr.responseText);

        setBangumiStat(res.data.episode_id, res.data.stat);
        updater();
      }
    });

    // * -------------------------------- render

    /**
     * @param {string} [targetUrl]
     */
    const updater = (targetUrl) => {
      // @ts-ignore
      const url = targetUrl ?? document.querySelector("link[rel=canonical]").href;
      if (!url.includes("/bangumi/")) return;

      const epid = url.match(/\/ep(\d+)\b/)?.[1];
      const s = bangumiStatMap.get(Number(epid));
      if (!s) return;

      const d = [s.like, s.coin, s.favorite, s.share];
      const el = document.querySelector(".toolbar-left");
      const isInitial = !el.classList.contains("like-ratio");
      el.classList.add("like-ratio");
      d.forEach((e, i) => {
        /** @type {HTMLElement} */
        // @ts-ignore
        const container = el.children[i];
        if (!container) return;

        /** @type {HTMLElement} */
        // @ts-ignore
        const span = isInitial ? document.createElement("span") : container.lastElementChild;

        if (isInitial) {
          span.style.filter = "brightness(80%)";
          span.style.whiteSpace = "pre-wrap";
          container.style.width = "auto";
          container.appendChild(span);
        }

        const ratio = d[i] / s.view;
        span.style.color = ratioColor(ratio);
        span.textContent = ` =${(ratio * 100).toFixed(1)}%`;
      });
    };
  }
}
