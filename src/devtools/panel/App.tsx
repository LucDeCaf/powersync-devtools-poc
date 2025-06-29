import { useEffect, useRef, useState } from 'react';
import type { Message, PowerSyncTable } from '../../types';
import { TableView } from './views/TableView';
import './App.css';
import { SQLiteView } from './views/SQLiteView';
import { PortContext } from './context/PortContext';
import { ConnectionStatus } from './components/ConnectionStatus';

export default function App() {
    const portRef = useRef<chrome.runtime.Port | null>(null);

    // TableView
    // TODO: Move this logic to TableView.tsx
    const [schemas, setSchemas] = useState<PowerSyncTable[]>([]);
    const [tables, setTables] = useState<unknown[][]>([]);

    // Tabs
    const [tabIndex, setTabIndex] = useState(0);
    const tabs = [
        {
            name: 'Tables',
            render: () => <TableView schemas={schemas} tables={tables} />,
        },
        {
            name: 'SQLite',
            render: () => <SQLiteView />,
        },
    ];

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
                console.log('[PowerSyncPanel] Panel port disconnected');
                portRef.current = null;
            });

            // Tell service worker about the current devtools panel
            console.log('[PowerSyncPanel] Sending init message');
            portRef.current.postMessage({
                type: 'INIT',
                tabId: chrome.devtools.inspectedWindow.tabId,
            });
        }
    }, [tables, schemas]);

    const handlePortMessage = (message: Message, port: chrome.runtime.Port) => {
        switch (message.type) {
            case 'INIT_ACK':
                console.log('[PowerSyncPanel] Received ack');
                port.postMessage({
                    type: 'TABLES',
                });
                break;

            case 'TABLES':
                console.log('Tables received');
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
                            schema.options.name === message.data.tableName,
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
        }
    };

    return (
        <PortContext value={portRef.current}>
            <nav className='sticky top-0 left-0 flex justify-between w-full pl-2 pr-4 text-gray-400 bg-black border-b border-gray-700'>
                <div>
                    {tabs.map((tab, i) =>
                        i === tabIndex ? (
                            <button
                                onClick={() => setTabIndex(i)}
                                className='p-2 text-white hover:cursor-pointer'
                            >
                                {tab.name}
                            </button>
                        ) : (
                            <button
                                className='p-2 hover:cursor-pointer'
                                onClick={() => setTabIndex(i)}
                            >
                                {tab.name}
                            </button>
                        ),
                    )}
                </div>
                <ConnectionStatus />
            </nav>

            {tabs[tabIndex].render()}
        </PortContext>
    );
}
