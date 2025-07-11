import { assertValidMessage } from '../utils/assertions';

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
    if (!assertValidMessage(message)) return;

    if (message.type === 'PANEL_INIT') {
        const tabId = message.data.tabId;

        // Prevent registering multiple listeners for the same connection
        // Remove this listener and replace wtih the long-term one
        port.onMessage.removeListener(initPanelPort);
        log('New panel connection: ', tabId);

        panelPorts.set(tabId, port);
        port.onMessage.addListener((message, _port) =>
            handlePortMessage(message, tabId, contentScriptPorts),
        );
        port.onDisconnect.addListener(() => {
            panelPorts.delete(tabId);
            log(`Panel disconnected (${tabId})`);
        });
    }
}

function initContentScriptPort(message: any, port: chrome.runtime.Port) {
    if (!assertValidMessage(message)) return;

    if (
        message.type === 'CONTENT_SCRIPT_INIT' &&
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
        port.onMessage.addListener((message, _port) =>
            handlePortMessage(message, tabId, panelPorts),
        );
        port.onDisconnect.addListener(() => {
            contentScriptPorts.delete(tabId);
            log(`Content script disconnected (${tabId})`);
        });
    }
}

function handlePortMessage(
    message: any,
    tabId: number,
    responsePortSet: Map<number, chrome.runtime.Port>,
) {
    if (!assertValidMessage(message)) return;

    if (message.type === 'HEARTBEAT') {
        log(`Heartbeat (${tabId})`);
        return;
    }

    const responsePort = responsePortSet.get(tabId);
    if (responsePort) {
        log(`Sent message to ${responsePort.name}:`, message);
        responsePort.postMessage(message);
    } else {
        warn(`No response port found for tabId ${tabId}:`, message);
    }
}

// Helpers
function log(...data: any[]) {
    console.log('[Service Worker]', ...data);
}

function warn(...data: any[]) {
    console.warn('[Service Worker] Warning:', ...data);
}

log('Initialized');
