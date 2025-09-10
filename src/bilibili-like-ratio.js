{
  /**
   *
   * https://www.bilibili.com/
   * https://www.bilibili.com/c/douga/
   *
   * https://search.bilibili.com/all?keyword=%E7%A1%85%E8%B0%B7101
   *
   * https://www.bilibili.com/video/BV1L2h9zzEA3/
   */

  // * ---------------------------------------------------------------- stat data store

  /**
   * @typedef {Object} VideoStat
   * @property {string} title
   * @property {number} view
   * @property {number} like
   */

  /** @type {Map<string, VideoStat>} */
  const videoStatMap = new Map();

  // * ---------------------------------------------------------------- data collecting

  {
    // * -------------------------------- action set data

    /**
     * @param {string} bvid
     * @param {VideoStat} stat
     */
    const setStat = (bvid, stat) => {
      videoStatMap.set(bvid, stat);
    };

    // * -------------------------------- record with ssr data

    document.addEventListener("DOMContentLoaded", () => {
      /** @type {Window & {__pinia: Object}} */
      // @ts-ignore
      const win = window;

      /** home page ssr data */
      win.__pinia?.feed?.data.recommend.item
        .filter((e) => e.bvid)
        .forEach((e) => {
          setStat(e.bvid, {
            title: e.title,
            view: e.stat.view,
            like: e.stat.like,
          });
        });

      /** search page ssr data */
      win.__pinia?.searchResponse?.searchAllResponse.result[11].data
        .filter((e) => e.type === "video")
        .forEach((e) => {
          setStat(e.bvid, {
            title: e.title,
            view: e.play,
            like: e.like,
          });
        });

      win.__pinia?.searchTypeResponse?.searchTypeResponse.result
        .filter((e) => e.type === "video")
        .forEach((e) => {
          setStat(e.bvid, {
            title: e.title,
            view: e.play,
            like: e.like,
          });
        });
    });

    // * -------------------------------- record with fetch response

    /**
     * @param {RequestInfo | URL} resource
     * @param {Response} response
     */
    const middlewareHandler = async (resource, response) => {
      if (typeof resource !== "string") return;

      if (resource.includes("api.bilibili.com")) {
        if (resource.includes("/rcmd")) {
          const res = await response.clone().json();

          res.data.item?.forEach((e) => {
            setStat(e.bvid, {
              title: e.title,
              view: e.stat.view,
              like: e.stat.like,
            });
          });

          res.data.archives?.forEach((e) => {
            setStat(e.bvid, {
              title: e.title,
              view: e.stat.view,
              like: e.stat.like,
            });
          });
        }

        if (resource.includes("search/type")) {
          const res = await response.clone().json();
          res.data.result?.forEach((e) => {
            setStat(e.bvid, {
              title: e.title,
              view: e.play,
              like: e.like,
            });
          });
        }

        if (resource.includes("search/all/v2")) {
          const res = await response.clone().json();
          res.data.result?.[11]?.data
            .filter((data) => data.type === "video")
            .forEach((e) => {
              setStat(e.bvid, {
                title: e.title,
                view: e.play,
                like: e.like,
              });
            });
        }
      }
    };

    // * -------------------------------- override fetch

    const orignialFetch = window.fetch;
    window.fetch = (url, options) => {
      return orignialFetch(url, options).then(async (response) => {
        await middlewareHandler(url, response);
        return response;
      });
    };
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

    // * -------------------------------- rarity color

    /** @type {[number,string][]} */
    const colormap = [
      [0, "hsl(0 0% 80%)"],
      [3, "hsl(120 100% 80%)"],
      [6, "hsl(200 100% 70%)"],
      [8, "hsl(300 100% 70%)"],
      [10, "hsl(30 100% 60%)"],
    ];
    const ratioColor = (ratio) =>
      colormap.find((e, i, a) => {
        return e[0] <= ratio * 100 && ratio * 100 < (a[i + 1]?.[0] ?? Infinity);
      })[1];

    // * -------------------------------- list card mutation

    document.addEventListener("DOMContentLoaded", () => {
      domObserverAll(".bili-feed-card, .bili-video-card", (el) => {
        const barEl = el.querySelector(".bili-video-card__stats--left, .bili-cover-card__stats");

        if (!barEl) return;
        if (barEl?.querySelector(".like-ratio")) return;

        // * ---------------- data

        const url = el.querySelector("a")?.href;
        if (!url) return;
        const u = new URL(url);
        const bvid = u.searchParams.get("bvid") ?? u.href.match(/video\/([^/?]+)\b/)?.[1];

        const s = videoStatMap.get(bvid);
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

    // * -------------------------------- video page toolbar mutation

    {
      /** @type {Window & {__INITIAL_STATE__: Object}} */
      // @ts-ignore
      const win = window;

      // * ---------------- render

      const updater = () => {
        const s = win.__INITIAL_STATE__?.videoData.stat;
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

      // * ---------------- runner

      document.addEventListener("DOMContentLoaded", () => {
        // ! setTimeout for 等待B站dom检测功能执行完
        setTimeout(() => {
          domObserverOnce(".video-toolbar-left-main", updater);
        }, 2000);
      });

      // @ts-ignore
      window.navigation.addEventListener("navigate", updater);
    }
  }
}
