/** @type {} */
let devtoolsPort: chrome.runtime.Port | null;
const droppedMessages: any[] = [];

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'devtools-port') {
        devtoolsPort = port;

        devtoolsPort.onMessage.addListener((_message, _port) => {
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

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    console.log('Worker received: ', message);
    if (devtoolsPort) {
        devtoolsPort.postMessage(message);
    } else {
        // Add to queue
        droppedMessages.push(message);
    }

    // Needed to get TS off my case
    return undefined;
});

console.log('Worker init');
