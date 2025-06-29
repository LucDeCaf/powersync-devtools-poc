const panelPorts = new Map<number, chrome.runtime.Port>();
const contentScriptPorts = new Map<number, chrome.runtime.Port>();

chrome.runtime.onConnect.addListener((port) => {
    // Handle new devtools panel opened
    if (port.name === 'panel-port') {
        port.onMessage.addListener(initPanelPort);
    }

    // Handle new page with Powersync instance loaded
    if (port.name === 'content-script-port') {
        port.onMessage.addListener(initContentScriptPort);
    }
});

function initPanelPort(message: any, port: chrome.runtime.Port) {
    if (message.type === 'INIT' && typeof message.tabId === 'number') {
        const tabId = message.tabId;

        // Prevent registering multiple listeners for the same connection
        // Remove this listener and replace wtih the long-term one
        port.onMessage.removeListener(initPanelPort);
        log('New panel connection: ', message.tabId);

        panelPorts.set(tabId, port);
        port.onMessage.addListener((message, port) =>
            handlePanelPortMessage(message, port, tabId),
        );
        port.onDisconnect.addListener(() => {
            panelPorts.delete(message.tabId);
            log(`Panel disconnected (${tabId})`);
        });

        port.postMessage({
            type: 'INIT_ACK',
        });
    }
}

function handlePanelPortMessage(
    message: any,
    _port: chrome.runtime.Port,
    tabId: number,
) {
    // Ensure type field is present and correct
    if (!message.type) {
        warn("Attempted to send message without 'type' field");
        return;
    }
    if (typeof message.type !== 'string') {
        warn(
            `Attempted to send message with 'typeof message.type === "${typeof message.type}"'`,
        );
        return;
    }

    // Message sent just to keep the worker alive
    if (message.type === 'HEARTBEAT') {
        log('Heartbeat (Panel)');
        return;
    }

    const contentScriptPort = contentScriptPorts.get(tabId);
    if (!contentScriptPort) {
        warn(
            `Attempted to send message to disconnected content script port (${tabId}): `,
            message,
        );
        return;
    }

    // Add prefix to message type
    message.type = 'POWERSYNC_DEVTOOLS_' + message.type;

    // Send message
    log(`Message received (PANEL) (${tabId}): `, message);
    contentScriptPort.postMessage(message);
}

function initContentScriptPort(message: any, port: chrome.runtime.Port) {
    if (
        message.type === 'POWERSYNC_CLIENT_INIT' &&
        // Require a tab ID to be present
        port.sender &&
        port.sender.tab &&
        port.sender.tab.id
    ) {
        const tabId = port.sender.tab.id;

        // Prevent registering multiple listeners for the same connection
        // Remove this listener and replace wtih the long-term one
        port.onMessage.removeListener(initContentScriptPort);
        log('New content script connection: ', tabId);

        contentScriptPorts.set(tabId, port);
        port.onMessage.addListener((message, port) =>
            handleContentScriptPortMessage(message, port, tabId),
        );
        port.onDisconnect.addListener(() => {
            contentScriptPorts.delete(message.tabId);
            log(`Content script disconnected (${tabId})`);
        });

        // Send init to panel if open
        const panelPort = panelPorts.get(tabId);
        log('Matching panel port found - spoofing init');
        if (panelPort) {
            panelPort.postMessage({
                type: 'INIT_ACK',
            });
        }

        port.postMessage({
            type: 'POWERSYNC_CLIENT_INIT_ACK',
        });
    }
}

function handleContentScriptPortMessage(
    message: any,
    port: chrome.runtime.Port,
    tabId: number,
) {
    // Ensure type field is present and correct
    if (!message.type) {
        warn("Attempted to send message without 'type' field");
        return;
    }
    if (typeof message.type !== 'string') {
        warn(
            `Attempted to send message with 'typeof message.type === "${typeof message.type}"'`,
        );
        return;
    }

    // Message sent just to keep the worker alive
    if (message.type === 'HEARTBEAT') {
        log('Heartbeat (CS)');
        return;
    }

    if (!message.type.startsWith('POWERSYNC_CLIENT_')) {
        warn(
            `Attempted to send message with incorrectly prefixed type "${message.type}"`,
        );
        return;
    }

    const panelPort = panelPorts.get(tabId);
    if (!panelPort) {
        warn(
            `Attempted to send message to disconnected panel port (${tabId}): `,
            message,
        );
        return;
    }

    // Remove prefix from message type
    message.type = message.type.slice('POWERSYNC_CLIENT_'.length);

    // Send message
    log(`Message received (CS) (${tabId}): `, message);
    panelPort.postMessage(message);
}

// Helpers
function log(...data: any[]) {
    console.log('[Service Worker]', ...data);
}

function warn(...data: any[]) {
    console.warn('[Service Worker] Warning:', ...data);
}

log('Initialized');
