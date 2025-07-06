import {
    BaseObserver,
    type AsyncDatabaseConnection,
    type BatchedUpdateNotification,
} from '@powersync/web';
import * as Comlink from 'comlink';

export type ClientListener = {
    tablesChanged: (tables: string[]) => void;
};

// Should map to a PowerSyncDatabase instance (i.e. a client) on the page
export class Client extends BaseObserver<ClientListener> {
    protected _clientId: string;
    protected _connection: AsyncDatabaseConnection | null;
    protected _connected: boolean = false;

    constructor(clientId: string, connection: AsyncDatabaseConnection) {
        super();

        this._clientId = clientId;
        this._connection = connection;
        this._connection.registerOnTableChange(
            Comlink.proxy(this._onTableChanged),
        );
        this._connected = true;
    }

    get clientId() {
        return this._clientId;
    }

    get connection() {
        return this._connection;
    }

    get connected() {
        return this._connected;
    }

    close() {
        this._connection?.close();
        this._connected = false;
    }

    protected _onTableChanged = (event: BatchedUpdateNotification) => {
        this.iterateListeners((cb) => cb.tablesChanged?.(event.tables));
    };
}
