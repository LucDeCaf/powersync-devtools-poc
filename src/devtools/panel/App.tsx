import { useEffect, useRef, useState } from 'react';
import type { PowerSyncMessage, PowerSyncTable } from '../../types';
import { TableView } from './components/TableView';
import './App.css';

export default function App() {
    const portRef = useRef<chrome.runtime.Port | null>(null);
    const [schemas, setSchemas] = useState<PowerSyncTable[]>([]);
    const [tables, setTables] = useState<unknown[][]>([]);

    useEffect(() => {
        if (portRef.current) {
            // Reconnect listener
            portRef.current.onMessage.removeListener(handlePortMessage);
            // TODO: Find out if messages can be dropped in this gap
            portRef.current.onMessage.addListener(handlePortMessage);
        } else {
            // Create new port
            portRef.current = chrome.runtime.connect({ name: 'panel-port' });

            portRef.current.onMessage.addListener(handlePortMessage);
            portRef.current.onDisconnect.addListener(() => {
                console.log('Panel port disconnected');
                portRef.current = null;
            });
        }
    }, [tables, schemas]);

    const handlePortMessage = (
        message: PowerSyncMessage,
        _port: chrome.runtime.Port
    ) => {
        console.log('Panel received: ', message);
        switch (message.type) {
            case 'POWERSYNC_INITIALIZED':
                setSchemas(message.data.schema.tables);
                setTables(message.data.tables);
                break;

            case 'POWERSYNC_SCHEMA_CHANGED':
                // TODO: Should probably also re-fetch table data, but that's future me's problem
                // setTableSchemas(message.data.tables);
                // setTables(message.data.tables.map(() => []));
                break;

            case 'POWERSYNC_STATUS_CHANGED':
                // TODO: Display connection status
                break;

            case 'POWERSYNC_TABLE_CHANGED':
                // TODO: Error handling and stuff (success === false, table not in schema list, etc.)
                console.log('schema state: ', schemas);
                setTables((prev) => {
                    const updatedTableIndex = schemas.findIndex(
                        (schema) =>
                            schema.options.name === message.data.tableName
                    );
                    console.log('idx:', updatedTableIndex);
                    const newTables = prev.map((oldTable, i) => {
                        if (i === updatedTableIndex) {
                            return message.data.queryResult.rows!._array;
                        }
                        return oldTable;
                    });
                    console.log('New tables: ', newTables);

                    return newTables;
                });

                break;
        }
    };

    return (
        <>
            <nav className='sticky top-0 flex w-full px-4 py-2 text-gray-400 bg-black border-b border-gray-700 gap-4'>
                <button className='text-white'>Tables</button>
                <button>Queries</button>
            </nav>

            <TableView schemas={schemas} tables={tables} />
        </>
    );
}
