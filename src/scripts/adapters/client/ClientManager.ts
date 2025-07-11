import { BaseObserver } from '@powersync/web';
import { Client } from './Client';

export type ClientManagerListener = {
    clientRegistered: (client: Client) => void;
    clientRemoved: (client: Client) => void;
    tablesChanged: (clientId: string, tables: string[]) => void;
};

export class ClientManager extends BaseObserver<ClientManagerListener> {
    protected clients: Map<string, Client>;

    constructor() {
        super();
        this.clients = new Map();
    }

    /**
     * Get an unordered list of the `clientId` of every client registered to the client manager.
     */
    get clientIds(): string[] {
        return Array.from(this.clients.keys());
    }

    registerClient(client: Client) {
        if (!client.connected) {
            throw new Error(
                'Failed to register client: Client is disconnected',
            );
        }

        const clientId = client.clientId;
        this.clients.set(clientId, client);

        client.registerListener({
            tablesChanged: (tables) => {
                this.iterateListeners((cb) =>
                    cb.tablesChanged?.(clientId, tables),
                );
            },
        });

        this.iterateListeners((cb) => cb.clientRegistered?.(client));
    }

    getClient(clientId: string) {
        return this.clients.get(clientId);
    }

    removeClient(clientId: string) {
        const client = this.clients.get(clientId);
        if (client) {
            client.close();
            this.clients.delete(clientId);
            this.iterateListeners((cb) => cb.clientRemoved?.(client));
        }
    }

    forEach(cb: (client: Client) => void) {
        return this.clients.forEach((client) => cb(client));
    }
}
