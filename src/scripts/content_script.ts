let serviceWorkerConnection: chrome.runtime.Port | null = null;
let heartbeatIntervalId: number | null = null;

function reconnectPort() {
    if (heartbeatIntervalId) {
        clearInterval(heartbeatIntervalId);
    }
    if (serviceWorkerConnection) {
        serviceWorkerConnection.disconnect();
    }

    serviceWorkerConnection = chrome.runtime.connect({
        name: 'content-script-port',
    });

    serviceWorkerConnection.onMessage.addListener((message, _port) => {
        log('Message received (WORKER):', message);
        window.postMessage(message);
    });
    serviceWorkerConnection.onDisconnect.addListener(() => {
        warn(
            'Service worker disconnected - attempting reconnection in 1 second',
        );
        clearInterval(heartbeatIntervalId!);
        heartbeatIntervalId = null;
        serviceWorkerConnection = null;
        setTimeout(reconnectPort, 1000);
    });

    // Send heartbeat message every 25 seconds
    heartbeatIntervalId = setInterval(() => {
        if (serviceWorkerConnection) {
            serviceWorkerConnection.postMessage({
                type: 'HEARTBEAT',
            });
        }
    }, 25000);

    // TODO: Send init?
}

window.addEventListener('message', (event) => {
    // Ignore messages from other origins
    if (event.origin !== window.location.origin) return;

    // Require the 'type' field
    if (!event.data.type) return;

    // Only respond to messages from powersync client
    if (!event.data.type.startsWith('POWERSYNC_CLIENT_')) return;

    // Forward messages to service worker
    if (serviceWorkerConnection) {
        log('Sending to worker:', event.data);
        serviceWorkerConnection.postMessage(event.data);
    } else {
        warn('Attempted to send message to disconnected service worker port');
    }
});

reconnectPort();

function log(...data: any[]) {
    console.log('[PowerSyncDevTools]', ...data);
}

function warn(...data: any[]) {
    console.warn('[PowerSyncDevTools] Warning:', ...data);
}

log('Initialized');
