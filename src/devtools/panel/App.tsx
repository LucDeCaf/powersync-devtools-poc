import { useEffect, useRef, useState } from 'react';
import type { Message, PowerSyncTable } from '../../types';
import { TableView } from './components/TableView';
import './App.css';

export default function App() {
    const portRef = useRef<chrome.runtime.Port | null>(null);
    const [schemas, setSchemas] = useState<PowerSyncTable[]>([]);
    const [tables, setTables] = useState<unknown[][]>([]);

    // TODO: Attach port in such a way that the listener doesn't need to be reconnected on state change
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
                console.log('[PowerSyncDevtools] Panel port disconnected');
                portRef.current = null;
            });

            // Request initalization data
            portRef.current.postMessage({
                type: 'POWERSYNC_DEVTOOLS_INIT',
            });
        }
    }, [tables, schemas]);

    const handlePortMessage = (
        message: Message,
        _port: chrome.runtime.Port
    ) => {
        console.log('[PowerSyncDevtools] Panel received message: ', message);

        switch (message.type) {
            case 'INIT_ACK':
                setSchemas(message.data.schema.tables);
                setTables(message.data.tables);
                break;

            case 'TABLE_CHANGED':
                // TODO: Error handling and stuff (success === false, table not in schema list, etc.)
                // Map over tables and change the data where the tables were changed
                // TODO: Seeing as onChange returns a list of tables, maybe send a list of updates instead of many single updates?
                setTables((prev) => {
                    const updatedTableIndex = schemas.findIndex(
                        (schema) =>
                            schema.options.name === message.data.tableName
                    );
                    const newTables = prev.map((oldTable, i) => {
                        if (i === updatedTableIndex) {
                            return message.data.data;
                        }
                        return oldTable;
                    });

                    return newTables;
                });

                break;

            default:
                console.warn(
                    '[PowerSyncDevtools] Panel received unknown message type: ',
                    message.type
                );
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
