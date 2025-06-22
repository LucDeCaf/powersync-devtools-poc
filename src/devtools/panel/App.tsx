import { useEffect, useRef, useState } from 'react';
import type { PowerSyncMessage, PowerSyncTable } from '../../types';
import { TableView } from './components/TableView';
import './App.css';

export default function App() {
    const portRef = useRef<chrome.runtime.Port | null>(null);
    const [activeTable, setActiveTable] = useState(0);
    const [tableSchemas, setTableSchemas] = useState<PowerSyncTable[]>([]);
    const [tables, setTables] = useState<unknown[][]>([]);

    console.log('schema: ', tableSchemas);

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
    }, [tables, tableSchemas]);

    const handlePortMessage = (
        message: PowerSyncMessage,
        _port: chrome.runtime.Port
    ) => {
        console.log('Panel received: ', message);
        switch (message.type) {
            case 'POWERSYNC_INITIALIZED':
                setTableSchemas(message.data.schema.tables);
                setTables(message.data.schema.tables.map(() => []));
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
                console.log('schema state: ', tableSchemas);
                setTables((prev) => {
                    const updatedTableIndex = tableSchemas.findIndex(
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
            <nav className='sticky top-0 flex w-full gap-4 px-4 py-2 text-gray-400 bg-black border-b border-gray-700'>
                <button className='text-white'>Tables</button>
                <button>Queries</button>
            </nav>

            <div id='content' className='flex h-full'>
                <div className='h-full p-4 font-mono border-r border-gray-700 min-w-48'>
                    <div className='w-full mb-2 text-gray-400'>Tables</div>
                    <div className='flex flex-col'>
                        <button className='flex justify-between w-full text-left'>
                            <span>todos</span>
                            <span>&lt;</span>
                        </button>
                        <button className='text-left'>lists</button>
                    </div>
                    <div className='my-2 text-gray-400'>Internal</div>
                    <div className='flex flex-col'>
                        <button className='text-left'>_SCHEMA</button>
                        <button className='text-left'>_todos_6eacac</button>
                        <button className='text-left'>_lists_cfdb79</button>
                    </div>
                </div>

                {tableSchemas.length > 0 ? (
                    <TableView
                        schema={tableSchemas[activeTable]}
                        data={tables[activeTable]}
                    />
                ) : (
                    <div>No tables</div>
                )}
            </div>
        </>
    );
}
