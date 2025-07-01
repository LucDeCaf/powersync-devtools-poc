import { useEffect, useRef, useState } from 'react';
import type { Message, PowerSyncTable } from '../../types';
import { TableView } from './views/TableView';
import './App.css';
import { SQLiteView } from './views/SQLiteView';
import { PortContext } from './context/PortContext';
import { ConnectionStatus } from './components/ConnectionStatus';
import { log, warn } from './utils/loggers';

export default function App() {
    const [port, setPort] = useState<chrome.runtime.Port | null>(null);
    const [heartbeatIntervalId, setHeartbeatIntervalId] = useState<
        number | null
    >(null);

    // TableView
    // TODO: Move this logic to TableView.tsx

    // Tabs
    const [tabIndex, setTabIndex] = useState(0);
    const tabs = [
        {
            name: 'Tables',
            render: () => <TableView />,
        },
        {
            name: 'SQLite',
            render: () => <SQLiteView />,
        },
    ];

    // TODO: Make sure this works properly
    useEffect(() => {
        if (!port) {
            reconnectPort();
        }
    }, []);

    const reconnectPort = () => {
        if (heartbeatIntervalId) {
            clearInterval(heartbeatIntervalId);
        }
        if (port) {
            port.disconnect();
        }

        setPort(() => {
            const port = chrome.runtime.connect({ name: 'panel-port' });

            port.onMessage.addListener(handlePortMessage);
            port.onDisconnect.addListener(() => {
                log('SW connection disconnected - attempting reconnect');
                setPort(null);
                // Attempt to reconnect after 1 second
                setTimeout(() => reconnectPort(), 1000);
            });

            port.postMessage({
                type: 'INIT',
                tabId: chrome.devtools.inspectedWindow.tabId,
            });

            return port;
        });

        // Send heartbeat to service worker every 25 seconds
        setHeartbeatIntervalId(
            setInterval(() => {
                if (port) {
                    port.postMessage({
                        type: 'HEARTBEAT',
                    });
                }
            }, 25000),
        );
    };

    const handlePortMessage = (message: Message, port: chrome.runtime.Port) => {
        log('Message received:', message);

        switch (message.type) {
            case 'INIT_ACK':
                port.postMessage({
                    type: 'TABLES',
                });
                break;
        }
    };

    return (
        <PortContext value={port}>
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
