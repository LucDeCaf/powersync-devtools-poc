const devtoolsConnection = chrome.runtime.connect({
    name: 'panel-port',
});

devtoolsConnection.onMessage.addListener((message, _) => {
    console.log('Panel received: ', message);
});
