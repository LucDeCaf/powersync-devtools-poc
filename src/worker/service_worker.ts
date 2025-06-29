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

        // contentScriptPort = port;
        // // Forward messages from content script to panel
        // contentScriptPort.onMessage.addListener((message, _port) => {
        //     // Strip off 'POWERSYNC_CLIENT_'
        //     console.log('SW CS: ', message.type);
        //     message.type = message.type.slice('POWERSYNC_CLIENT_'.length);
        //     if (panelPort) {
        //         panelPort.postMessage(message);
        //     } else {
        //         // Add to queue
        //         droppedMessagesFromContentScript.push(message);
        //     }
        // });
        // contentScriptPort.onDisconnect.addListener(() => {
        //     contentScriptPort = null;
        // });
        // // Resend dropped messages
        // for (const message of droppedMessagesFromPanel) {
        //     contentScriptPort.postMessage(message);
        // }
        // droppedMessagesFromPanel.length = 0;
    }
});

function initPanelPort(message: any, port: chrome.runtime.Port) {
    if (message.type === 'INIT' && typeof message.tabId === 'number') {
        const tabId = message.tabId;
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
    const contentScriptPort = contentScriptPorts.get(tabId);
    if (!contentScriptPort) {
        log(
            `Warning: Attempted to send message to disconnected content script port (${tabId}): `,
            message,
        );
        return;
    }

    // Ensure type field is present and correct
    if (!message.type) {
        log("Warning: Attempted to send message without 'type' field");
        return;
    }
    if (typeof message.type !== 'string') {
        log(
            `Warning: Attempted to send message with 'typeof message.type === "${typeof message.type}"'`,
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
    const panelPort = panelPorts.get(tabId);
    if (!panelPort) {
        log(
            `Warning: Attempted to send message to disconnected panel port (${tabId}): `,
            message,
        );
        return;
    }

    // Ensure type field is present and correct
    if (!message.type) {
        log("Warning: Attempted to send message without 'type' field");
        return;
    }
    if (typeof message.type !== 'string') {
        log(
            `Warning: Attempted to send message with 'typeof message.type === "${typeof message.type}"'`,
        );
        return;
    }
    if (!message.type.startsWith('POWERSYNC_CLIENT_')) {
        log(
            `Warning: Attempted to send message with incorrectly prefixed type "${message.type}"`,
        );
        return;
    }

    // Remove prefix from message type
    message.type = message.type.slice('POWERSYNC_CLIENT_'.length);

    // Send message
    log(`Message received (CS) (${tabId}): `, message);
    panelPort.postMessage(message);
}

// Helper
function log(...data: any[]) {
    console.log('[Service Worker]', ...data);
}

log('Initialized');
