let panelPort: chrome.runtime.Port | null;
let contentScriptPort: chrome.runtime.Port | null;
const droppedMessagesFromContentScript: any[] = [];
const droppedMessagesFromPanel: any[] = [];

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'panel-port') {
        panelPort = port;

        // Forward messages from panel to content script
        panelPort.onMessage.addListener((message, _port) => {
            if (contentScriptPort) {
                contentScriptPort.postMessage(message);
            } else {
                // Add to queue
                droppedMessagesFromPanel.push(message);
            }
        });
        panelPort.onDisconnect.addListener(() => {
            panelPort = null;
        });

        // Resend dropped messages
        for (const message of droppedMessagesFromContentScript) {
            panelPort.postMessage(message);
        }
        droppedMessagesFromContentScript.length = 0;
    }

    if (port.name === 'content-script-port') {
        contentScriptPort = port;

        // Forward messages from content script to panel
        contentScriptPort.onMessage.addListener((message, _port) => {
            if (panelPort) {
                panelPort.postMessage(message);
            } else {
                // Add to queue
                droppedMessagesFromContentScript.push(message);
            }
        });

        contentScriptPort.onDisconnect.addListener(() => {
            contentScriptPort = null;
        });

        // Resend dropped messages
        for (const message of droppedMessagesFromPanel) {
            contentScriptPort.postMessage(message);
        }
        droppedMessagesFromPanel.length = 0;
    }
});

console.log('Worker initialized');
