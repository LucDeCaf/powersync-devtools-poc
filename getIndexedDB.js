(async () => {
    if (!('indexedDB' in window)) {
        return {
            success: false,
            error: 'indexedDB not supported in current environment.',
        };
    }
    if (!('databases' in window.indexedDB)) {
        return {
            success: false,
            error: 'indexedDB.databases not supported in current environment.',
        };
    }
    const dbs = await indexedDB.databases();
    return { success: true, databases: dbs };
})();
