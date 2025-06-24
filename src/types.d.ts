// TODO: Validate these structures against docs / js lib
// TODO: Maybe ask Kobie if it's written down somewhere?

// TODO: Check for existing TS definitions / just use the Powersync lib
export type PowerSyncInitialized = {
    schema: PowerSyncSchema;
    tables: unknown[][];
};

export type PowerSyncSchema = {
    props: {
        [tableName: string]: PowerSyncTable & {
            _mappedColumns: {
                [columnName: string]: {
                    type: string;
                };
            };
        };
    };
    tables: PowerSyncTable[];
};

export type PowerSyncStatus = {
    options: {
        connected: boolean;
        connecting: boolean;
        dataFlow: {
            uploading: boolean;
            downloading: boolean;
            downloadError: Object; // TODO
        };
        hasSynced: boolean;
        priorityStatusEntries: Array; // TODO
    };
};

export type PowerSyncMessage =
    | {
          type: 'POWERSYNC_INITIALIZED';
          data: PowerSyncInitialized;
      }
    | ({
          type: 'POWERSYNC_TABLE_CHANGED';
      } & PowerSyncTableChanged)
    | {
          type: 'POWERSYNC_SCHEMA_CHANGED';
          data: PowerSyncSchema;
      }
    | {
          type: 'POWERSYNC_STATUS_CHANGED';
          data: PowerSyncStatus;
      };

export type PowerSyncTableChanged = {
    success: boolean;
    data: {
        tableName: string;
        queryResult: {
            insertId?: number;
            rows?: {
                _array: unknown[];
                length: number;
            };
            rowsAffected: number;
        };
    };
};

export type PowerSyncTable = {
    options: {
        name: string;
        ignoreEmptyUpdates: boolean;
        columns: {
            options: {
                name: string;
                type: string;
            };
        }[];
        indexes: {
            options: {
                columns: {
                    options: {
                        ascending: boolean;
                        name: string;
                    };
                };
                name: string;
            };
        }[];
        insertOnly: boolean;
        localOnly: boolean;
        name: string;
        trackMetadata: boolean;
        trackPrevious: boolean;
    };
};
