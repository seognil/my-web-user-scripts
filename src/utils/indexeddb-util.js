var dbUtil = (() => {
  /**
   * @param {string} dbName
   * @param {string} tableName
   */
  const openDB = (dbName, tableName) =>
    new Promise((resolve) => {
      const request = indexedDB.open(dbName);

      request.onsuccess = (e) => {
        // @ts-ignore
        const db = e.target.result;

        // 检查是否已有该 store
        if (db.objectStoreNames.contains(tableName)) {
          resolve(db);
        } else {
          db.close();
          // 升级版本，创建新表
          const newRequest = indexedDB.open(dbName, db.version + 1);
          newRequest.onupgradeneeded = (ev) => {
            // @ts-ignore
            ev.target.result.createObjectStore(tableName);
          };
          // @ts-ignore
          newRequest.onsuccess = (ev) => resolve(ev.target.result);
        }
      };
    });

  /**
   * @param {string} dbName
   * @param {string} tableName
   * @param {string|number} key
   * @param {any} value
   */
  const putItem = async (dbName, tableName, key, value) =>
    new Promise(async (resolve, reject) => {
      const db = await openDB(dbName, tableName);
      const tx = db.transaction(tableName, "readwrite");
      const store = tx.objectStore(tableName);
      store.put(value, key);
      tx.oncomplete = () => resolve(true);
    });

  /**
   * @param {string} dbName
   * @param {string} tableName
   * @returns {Promise<any[]>}
   */
  const getAllItems = async (dbName, tableName) =>
    new Promise(async (resolve) => {
      const db = await openDB(dbName, tableName);
      const tx = db.transaction(tableName, "readonly");
      tx.objectStore(tableName).getAll().onsuccess = (e) => resolve(e.target.result);
    });

  return {
    put: putItem,
    getAll: getAllItems,
  };
})();
