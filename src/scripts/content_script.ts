import type {
    PowerSyncSchema,
    PowerSyncStatus,
    PowerSyncInitialized,
    PowerSyncTableChanged,
} from '../types';

const serviceWorkerConnection = chrome.runtime.connect({
    name: 'content-script-port',
});

// TODO: Decide on naming scheme so I can just send messages straight through the content
// TODO: script without worrying about what the message actually says

document.addEventListener(
    'powersyncDevtoolsInitAck',
    (initEvent: CustomEventInit<PowerSyncInitialized>) => {
        console.log('Powersync client detected');

        // Setup listeners
        document.addEventListener(
            'powersyncSchemaChanged',
            (event: CustomEventInit<PowerSyncSchema>) => {
                // TODO: Invalidate powersync watchWithCallback listeners on changed tables
                serviceWorkerConnection.postMessage({
                    type: 'POWERSYNC_SCHEMA_CHANGED',
                    data: event.detail,
                });
            }
        );
        document.addEventListener(
            'powersyncStatusChanged',
            (event: CustomEventInit<PowerSyncStatus>) => {
                serviceWorkerConnection.postMessage({
                    type: 'POWERSYNC_STATUS_CHANGED',
                    data: event.detail,
                });
            }
        );
        document.addEventListener(
            'powersyncTableChanged',
            (event: CustomEventInit<PowerSyncTableChanged>) => {
                // TODO: Handle errors
                if (!event.detail) return;

                if (event.detail.success) {
                    serviceWorkerConnection.postMessage({
                        type: 'POWERSYNC_TABLE_CHANGED',
                        ...event.detail,
                    });
                } else {
                    // TODO: Handle failed queries
                }
            }
        );

        // Tell service worker about the current powersync connection
        serviceWorkerConnection.postMessage({
            type: 'POWERSYNC_INITIALIZED',
            data: {
                schema: initEvent.detail!.schema,
            },
        });

        // Register watched queries for tables in event.detail.schema
        const tableNames = initEvent.detail!.schema.tables.map(
            (table) => table.options.name
        );
        document.dispatchEvent(
            new CustomEvent('powersyncDevtoolsRegisterQueries', {
                detail: tableNames,
            })
        );
    }
);

document.dispatchEvent(new CustomEvent('powersyncDevtoolsInit'));
