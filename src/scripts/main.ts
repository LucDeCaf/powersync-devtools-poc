import * as Comlink from 'comlink';
import { type OpenAsyncDatabaseConnection } from '@powersync/web';
import { ClientManager } from './adapters/client/ClientManager';
import { PortConnectionManager } from '../library/adapters/background/PortConnectionManager';
import { Client } from './adapters/client/Client';
import type { Message } from '../types';
import { log, warn } from '../utils/loggers';
import { assertValidMessage } from '../utils/assertions';

const serviceWorkerConnection = new PortConnectionManager({
    portName: 'content-script-port',
});
const clientManager = new ClientManager();

serviceWorkerConnection.registerListener({
    messageReceived: onServiceWorkerMessage,
});
clientManager.registerListener({
    tablesChanged: onTablesChanged,
});

window.addEventListener('message', async (event) => {
    // Ignore messages from other origins
    if (event.origin !== window.location.origin) return;

    const message = event.data;
    if (!('type' in message)) return;
    if (!message.type.startsWith('POWERSYNC_CLIENT_')) return;

    // Use return to get TS to interpret message as Message
    if (!assertValidMessage(message)) return;

    // Remove prefix
    message.type = message.type.slice('POWERSYNC_CLIENT_'.length);

    // Special handling for new clients
    if (message.type === 'INIT') {
        const clientId = message.clientId;
        const { resolvedOptions } = message.data;

        const port = event.ports[0];
        const remote = Comlink.wrap<OpenAsyncDatabaseConnection>(port);
        const powersyncConnection = await remote(resolvedOptions);

        const client = new Client(clientId, powersyncConnection);
        clientManager.registerClient(client);
        log('New client registered:', clientId);
    }

    // Forward all messages to service worker
    if (serviceWorkerConnection) {
        log('Sending to worker:', event.data);
        serviceWorkerConnection.postMessage(event.data);
    } else {
        warn('Attempted to send message to disconnected service worker port');
    }
});

function onTablesChanged(clientId: string, tables: string[]) {
    // TODO
    log(`Tabls changed (${clientId}):`, tables);
}

function onServiceWorkerMessage(message: Message) {
    // TODO
    log('Service worker message received:', message);
}

log('Content script initialized');
