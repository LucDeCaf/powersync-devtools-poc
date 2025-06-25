const serviceWorkerConnection = chrome.runtime.connect({
    name: 'content-script-port',
});

window.addEventListener('message', (event) => {
    // Ignore messages from other origins
    if (event.origin !== window.location.origin) return;

    // Require the 'type' field
    if (!event.data.type) return;

    // Only respond to messages from powersync client
    if (!event.data.type.startsWith('POWERSYNC_CLIENT_')) return;

    // Forward messages to service worker
    serviceWorkerConnection.postMessage(event.data);
});

// Forward messages from devtools pane
serviceWorkerConnection.onMessage.addListener((message, _port) => {
    window.postMessage(message);
});
