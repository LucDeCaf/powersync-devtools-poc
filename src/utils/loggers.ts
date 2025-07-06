export function log(...data: any[]) {
    console.log('[PowerSyncDevtools]', ...data);
}

export function warn(...data: any[]) {
    console.warn('[PowerSyncDevtools] Warning:', ...data);
}

export function error(...data: any[]) {
    console.error('[PowerSyncDevtools] Warning:', ...data);
}
