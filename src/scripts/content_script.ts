// import type {
//     PowerSyncSchema,
//     PowerSyncStatus,
//     PowerSyncInitialized,
//     PowerSyncTableChanged,
//     Message,
// } from '../types';

const serviceWorkerConnection = chrome.runtime.connect({
    name: 'content-script-port',
});

// document.addEventListener(
//     'powersyncDevtoolsInitAck',
//     (initEvent: CustomEventInit<PowerSyncInitialized>) => {
//         console.log('Powersync client acknowledged init');

//         // Setup listeners
//         document.addEventListener(
//             'powersyncSchemaChanged',
//             (event: CustomEventInit<PowerSyncSchema>) => {
//                 // TODO: Invalidate powersync watchWithCallback listeners on changed tables
//                 serviceWorkerConnection.postMessage({
//                     type: 'POWERSYNC_SCHEMA_CHANGED',
//                     data: event.detail,
//                 });
//             }
//         );
//         document.addEventListener(
//             'powersyncStatusChanged',
//             (event: CustomEventInit<PowerSyncStatus>) => {
//                 serviceWorkerConnection.postMessage({
//                     type: 'POWERSYNC_STATUS_CHANGED',
//                     data: event.detail,
//                 });
//             }
//         );
//         document.addEventListener(
//             'powersyncTableChanged',
//             (event: CustomEventInit<PowerSyncTableChanged>) => {
//                 // TODO: Handle errors
//                 if (!event.detail) return;

//                 if (event.detail.success) {
//                     serviceWorkerConnection.postMessage({
//                         type: 'POWERSYNC_TABLE_CHANGED',
//                         ...event.detail,
//                     });
//                 } else {
//                     // TODO: Handle failed queries
//                 }
//             }
//         );

//         // Tell service worker about the current powersync connection
//         serviceWorkerConnection.postMessage({
//             type: 'POWERSYNC_INITIALIZED',
//             data: {
//                 schema: initEvent.detail!.schema,
//                 tables: initEvent.detail!.tables,
//             },
//         });

//         // Register watched queries for tables in event.detail.schema
//         const tableNames = initEvent.detail!.schema.tables.map(
//             (table) => table.options.name
//         );
//         document.dispatchEvent(
//             new CustomEvent('powersyncDevtoolsRegisterQueries', {
//                 detail: tableNames,
//             })
//         );
//     }
// );

window.addEventListener('message', (event) => {
    // Ignore messages from other origins
    if (event.origin !== window.location.origin) return;

    // Require the 'type' field
    if (!('type' in event.data)) return;

    // Only respond to messages from powersync client
    if (!event.data.type.startsWith('POWERSYNC_CLIENT_')) return;

    // Remove 'POWERSYNC_CLIENT_'
    const messageType = event.data.type.slice(17);
    console.log(
        '[PowerSyncDevtools] Message received from devtools with type ' +
            messageType
    );

    // Forward messages to service worker
    event.data.type = messageType;
    serviceWorkerConnection.postMessage(event.data);
});

// Forward messages from devtools pane
serviceWorkerConnection.onMessage.addListener((message, _port) => {
    window.postMessage(message);
});
