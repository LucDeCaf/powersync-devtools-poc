document.addEventListener('powersyncDevtoolsInitAck', () => {
    // Setup listeners
    document.addEventListener('powersyncDevtoolsExecuteResult', (event) => {
        chrome.runtime.sendMessage({
            type: 'CONTENT_SCRIPT_EXECUTE',
            data: event.detail,
        });
    });
    document.addEventListener('powersyncSchemaChanged', (event) => {
        chrome.runtime.sendMessage({
            type: 'CONTENT_SCRIPT_SCHEMA_CHANGED',
            data: event.detail,
        });
    });
    document.addEventListener('powersyncInitialized', () => {
        chrome.runtime.sendMessage({
            type: 'CONTENT_SCRIPT_POWERSYNC_INITIALIZED',
        });
    });
    document.addEventListener('powersyncStatusChanged', (event) => {
        chrome.runtime.sendMessage({
            type: 'CONTENT_SCRIPT_STATUS_CHANGED',
            data: event.detail,
        });
    });

    // Testing code
    document.dispatchEvent(
        new CustomEvent('powersyncDevtoolsExecute', {
            detail: 'SELECT * FROM todos;',
        })
    );
});

document.dispatchEvent(new CustomEvent('powersyncDevtoolsInit'));
