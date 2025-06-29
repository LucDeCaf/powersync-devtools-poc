import { useEffect, useRef, useState } from 'react';
import type { Message, PowerSyncTable } from '../../types';
import { TableView } from './views/TableView';
import './App.css';
import { SQLiteView } from './views/SQLiteView';
import { PortContext } from './context/PortContext';
import { ConnectionStatus } from './components/ConnectionStatus';
import { log, warn } from './utils/loggers';

export default function App() {
    const portRef = useRef<chrome.runtime.Port | null>(null);
    const heartbeatIntervalId = useRef<number | null>(null);

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

    // TODO: Make sure this works properly
    useEffect(() => {
        if (!portRef.current) {
            reconnectPort((port) => {
                // Tell service worker about the current devtools panel
                port.postMessage({
                    type: 'INIT',
                    tabId: chrome.devtools.inspectedWindow.tabId,
                });
            });
        }
    }, []);

    useEffect(() => {
        if (portRef.current) {
            // Refresh message listener - makes sure that stateful vars are updated
            portRef.current.onMessage.removeListener(handlePortMessage);
            portRef.current.onMessage.addListener(handlePortMessage);
        }
    }, [schemas, tables]);

    const reconnectPort = (cb?: (port: chrome.runtime.Port) => void) => {
        if (heartbeatIntervalId.current) {
            clearInterval(heartbeatIntervalId.current);
        }
        if (portRef.current) {
            portRef.current.disconnect();
        }

        portRef.current = chrome.runtime.connect({ name: 'panel-port' });

        portRef.current.onMessage.addListener(handlePortMessage);
        portRef.current.onDisconnect.addListener(() => {
            log('SW connection disconnected - attempting reconnect');
            portRef.current = null;
            // Attempt to reconnect after 1 second
            setTimeout(() => reconnectPort(), 1000);
        });

        // Send heartbeat to service worker every 25 seconds
        heartbeatIntervalId.current = setInterval(() => {
            if (portRef.current) {
                portRef.current.postMessage({
                    type: 'HEARTBEAT',
                });
            }
        }, 25000);

        // TODO: Should we always send INIT after a reconnect?

        if (cb) cb(portRef.current);
    };

    const handlePortMessage = (message: Message, port: chrome.runtime.Port) => {
        log('Message received:', message);

        switch (message.type) {
            case 'INIT_ACK':
                port.postMessage({
                    type: 'TABLES',
                });
                break;

            case 'TABLES':
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
