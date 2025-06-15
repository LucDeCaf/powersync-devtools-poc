const serviceWorkerConnection = chrome.runtime.connect({
    name: 'devtools-port',
});
/** @type {chrome.runtime.Port | null} */
let panelPort = null;
const droppedMessages = [];

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'panel-port') {
        panelPort = port;
        panelPort.onMessage.addListener((message, _) => {
            // TODO: Forward messages from panel to service_worker
        });
        panelPort.onDisconnect.addListener(() => {
            panelPort = null;
        });

        // Resend dropped messages
        for (const message of droppedMessages) {
            panelPort.postMessage(message);
        }
        droppedMessages.length = 0;
    }
});

serviceWorkerConnection.onMessage.addListener((message, _) => {
    if (panelPort) {
        panelPort.postMessage(message);
    } else {
        droppedMessages.push(message);
    }
});

chrome.devtools.panels.create(
    'PowerSync',
    null,
    'src/panel.html',
    (panel) => {}
);
