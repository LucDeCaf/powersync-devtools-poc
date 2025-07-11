import type { ProxiedQueryResult } from '@powersync/web';

export type SQLiteTableInfoColumn = {
    cid: number;
    name: string;
    type: string;
    notnull: boolean;
    dflt_value: string;
    pk: number;
};

export type Table = {
    name: string;
    schema: SQLiteTableInfoColumn[];
    data: unknown[];
};

export type Message =
    | {
          type: 'HEARTBEAT';
          data: {};
      }
    | {
          type: 'PANEL_INIT';
          data: {
              tabId: number;
          };
      }
    | {
          type: 'CONTENT_SCRIPT_INIT';
          data: {};
      }
    | {
          type: 'CONTENT_SCRIPT_INIT_ACK';
          data: {};
      }
    | {
          type: 'CLIENTS';
          data: {};
      }
    | {
          type: 'CLIENTS_ACK';
          data: {
              clientIds: string[];
          };
      }
    | {
          type: 'TABLES';
          data: {
              clientId: string;
          };
      }
    | {
          type: 'TABLES_ACK';
          data: {
              tables: Table[];
              clientId: string;
          };
      }
    | {
          type: 'QUERY';
          data: {
              query: string;
              requestId: string;
              clientId: string;
          };
      }
    | {
          type: 'QUERY_ACK';
          data:
              | {
                    success: true;
                    queryResult: ProxiedQueryResult;
                    requestId: string;
                    clientId: string;
                }
              | {
                    success: false;
                    error: any;
                    requestId: string;
                    clientId: string;
                };
      }
    | {
          type: 'STATUS';
          data: {
              clientId: string;
          };
      }
    | {
          type: 'STATUS_ACK';
          data: {
              status: SyncStatusOptions;
              clientId: string;
          };
      };

export type MessageType = Message['type'];
