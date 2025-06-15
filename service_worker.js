/** @type {chrome.runtime.Port | null} */
let devtoolsPort;
const droppedMessages = [];

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'devtools-port') {
        devtoolsPort = port;

        devtoolsPort.onMessage.addListener((message, _) => {
            // TODO: Forward messages from devtools to content_script
        });
        devtoolsPort.onDisconnect.addListener(() => {
            devtoolsPort = null;
        });

        // Resend dropped messages
        for (const message of droppedMessages) {
            devtoolsPort.postMessage(message);
        }
        droppedMessages.length = 0;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Worker received: ', message);
    if (devtoolsPort) {
        devtoolsPort.postMessage(message);
    } else {
        // Add to queue
        droppedMessages.push(message);
    }
});

console.log('Worker init');
