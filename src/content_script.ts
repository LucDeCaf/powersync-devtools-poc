import type { SchemaChanged, StatusChanged } from './types';

document.addEventListener('powersyncDevtoolsInitAck', () => {
    // Setup listeners
    document.addEventListener(
        'powersyncSchemaChanged',
        (event: CustomEventInit<SchemaChanged>) => {
            chrome.runtime.sendMessage({
                type: 'CONTENT_SCRIPT_SCHEMA_CHANGED',
                data: event.detail,
            });
        }
    );
    document.addEventListener('powersyncInitialized', () => {
        chrome.runtime.sendMessage({
            type: 'CONTENT_SCRIPT_POWERSYNC_INITIALIZED',
        });
    });
    document.addEventListener(
        'powersyncStatusChanged',
        (event: CustomEventInit<StatusChanged>) => {
            chrome.runtime.sendMessage({
                type: 'CONTENT_SCRIPT_STATUS_CHANGED',
                data: event.detail,
            });
        }
    );
});

document.dispatchEvent(new CustomEvent('powersyncDevtoolsInit'));
