import * as Comlink from 'comlink';
import { type OpenAsyncDatabaseConnection } from '@powersync/web';
import { ClientManager } from './adapters/client/ClientManager';
import { PortConnectionManager } from '../library/adapters/background/PortConnectionManager';
import { Client } from './adapters/client/Client';
import type { Message, Table } from '../types';
import { error, log, warn } from '../utils/loggers';

const background = new PortConnectionManager({
    portName: 'content-script-port',
});
const clientManager = new ClientManager();

background.registerListener({
    messageReceived: onBackgroundMessage,
});
clientManager.registerListener({
    tablesChanged: onTablesChanged,
    // Post when client state changes to the devtools
    clientRegistered: () => {
        background.postMessage({
            type: 'CLIENTS_ACK',
            data: {
                clientIds: clientManager.clientIds,
            },
        });
    },
    clientRemoved: () => {
        background.postMessage({
            type: 'CLIENTS_ACK',
            data: {
                clientIds: clientManager.clientIds,
            },
        });
    },
});

// Only listens for POWERSYNC_CLIENT_INIT messages
window.addEventListener('message', async (event) => {
    // Ignore messages from other origins
    if (event.origin !== window.location.origin) return;

    const message = event.data;
    if (!('type' in message)) return;
    if (typeof message.type !== 'string') return;

    if (message.type === 'POWERSYNC_CLIENT_INIT') {
        const clientId = message.clientId;
        const { resolvedOptions } = message.data;

        const port = event.ports[0];
        const remote = Comlink.wrap<OpenAsyncDatabaseConnection>(port);
        const powersyncConnection = await remote(resolvedOptions);

        const client = new Client(clientId, powersyncConnection);
        clientManager.registerClient(client);
        log('New client registered:', clientId);
    }
});

function onTablesChanged(clientId: string, tables: string[]) {
    // TODO
    log(`Tables changed (${clientId}):`, tables);
}

async function onBackgroundMessage(message: Message) {
    // Use if statement to prevent name collisions (somehow, vars in separate branches can collide)
    if (message.type === 'CLIENTS') {
        background.postMessage({
            type: 'CLIENTS_ACK',
            data: {
                clientIds: clientManager.clientIds,
            },
        });
        return;
    }

    if (message.type === 'TABLES') {
        const client = clientManager.getClient(message.data.clientId);
        if (!client) {
            warn(
                `Attempted to retrieve tables for nonexistant client "${message.data.clientId}"`,
            );
            return;
        }

        const db = client.connection;
        if (!db || !client.connected) {
            // This should never happen, but it's safer to handle anyways
            warn(`Attempted to use disconnected client "${client.clientId}"`);
            clientManager.removeClient(client.clientId);
            return;
        }

        // Fetch table's names, then use table_info and SELECT * to get its schema and data
        const tableNames = (await db.execute('PRAGMA table_list')).rows._array;
        Promise.all(
            tableNames.map(async (table) => {
                const tableName = table.name;
                const schemaResult = await db.execute(
                    `PRAGMA table_info(${tableName})`,
                );
                const dataResult = await db.execute(
                    `SELECT * FROM ${tableName}`,
                );
                return {
                    name: tableName,
                    schema: schemaResult.rows._array,
                    data: dataResult.rows._array,
                } satisfies Table;
            }),
        ).then((tables) =>
            background.postMessage({
                type: 'TABLES_ACK',
                data: {
                    clientId: message.data.clientId,
                    tables,
                },
            }),
        );
        return;
    }

    if (message.type === 'QUERY') {
        const clientId = message.data.clientId;
        const requestId = message.data.requestId;

        const client = clientManager.getClient(clientId);
        if (!client) {
            warn(
                `Attempted to retrieve tables for nonexistant client "${clientId}"`,
            );
            return;
        }

        const db = client.connection;
        if (!db || !client.connected) {
            // This should never happen, but it's safer to handle anyways
            warn(`Attempted to use disconnected client "${clientId}"`);
            clientManager.removeClient(clientId);
            return;
        }

        try {
            const queryResult = await db.execute(message.data.query);
            background.postMessage({
                type: 'QUERY_ACK',
                data: {
                    success: true,
                    queryResult,
                    clientId,
                    requestId,
                },
            });
        } catch (e) {
            error('Error executing query:', e);

            background.postMessage({
                type: 'QUERY_ACK',
                data: {
                    success: false,
                    error: e,
                    clientId,
                    requestId,
                },
            });
        }

        return;
    }

    warn('Unexpected message received from background:', message);
}

background.postMessage({
    type: 'CONTENT_SCRIPT_INIT',
    data: {},
});

log('Initialized');
