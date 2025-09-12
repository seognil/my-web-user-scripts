// * ------------------------------------------------ fetch hook

/**
 * @typedef {(url: RequestInfo | URL, response: Response) => void} FetchHandler
 */

if (!globalThis.fetchHook) {
  globalThis.fetchHook = (() => {
    /** @type {Set<FetchHandler>} */
    const handlers = new Set();

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (url, options) => {
      return originalFetch(url, options).then(async (response) => {
        handlers.forEach((h) => {
          try {
            h(url, response.clone());
          } catch (err) {
            console.error(err);
          }
        });
        return response;
      });
    };

    return {
      /** @param {FetchHandler} handler */
      add: (handler) => handlers.add(handler),
      /** @param {FetchHandler} handler */
      remove: (handler) => handlers.delete(handler),
    };
  })();
}

/**
 * fetch response 中间件
 * @type {{ add: (handler: FetchHandler) => void, remove: (handler: FetchHandler) => void }}
 */
var fetchHook = globalThis.fetchHook;

// * ------------------------------------------------ xhr hook

/**
 * @typedef {(xhr: XMLHttpRequest) => void} XhrHandler
 */

if (!globalThis.xhrHook) {
  globalThis.xhrHook = (() => {
    if (!globalThis.XMLHttpRequest) return { add: () => {}, remove: () => {} };

    /** @type {Set<XhrHandler>} */
    const handlers = new Set();

    const originalSend = globalThis.XMLHttpRequest.prototype.send;
    globalThis.XMLHttpRequest.prototype.send = function () {
      this.addEventListener("load", () => {
        handlers.forEach((h) => {
          try {
            h(this);
          } catch (err) {
            console.error(err);
          }
        });
      });
      return originalSend.apply(this, arguments);
    };

    return {
      /** @param {XhrHandler} handler */
      add: (handler) => handlers.add(handler),
      /** @param {XhrHandler} handler */
      remove: (handler) => handlers.delete(handler),
    };
  })();
}

/**
 * xhr response 中间件
 * @type {{ add: (handler: XhrHandler) => void, remove: (handler: XhrHandler) => void }}
 */
var xhrHook = globalThis.xhrHook;
