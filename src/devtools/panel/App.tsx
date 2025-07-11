import { useEffect, useMemo, useRef, useState } from 'react';
import { TableView } from './views/TableView';
import { SQLiteView } from './views/SQLiteView';
import { BackgroundContext } from './context/BackgroundContext';
import { ConnectionStatus } from './components/ConnectionStatus';
import './App.css';
import { PortConnectionManager } from '../../library/adapters/background/PortConnectionManager';
import { ClientContext, type CurrentClientInfo } from './context/ClientContext';
import { log } from '../../utils/loggers';

export default function App() {
    // TODO: Client selector component
    const [clients, setClients] = useState<CurrentClientInfo[]>([]);
    const [currentClient, setCurrentClient] = useState(0);

    const background = useRef(
        new PortConnectionManager({ portName: 'panel-port' }),
    );

    // Fetch initial clients
    useEffect(() => {
        background.current.registerListener({
            messageReceived: (message) => {
                log('Panel received:', message);
                if (message.type !== 'CLIENTS_ACK') return;

                log('Updating clients');
                setClients(() =>
                    message.data.clientIds.map(
                        (clientId) =>
                            ({
                                clientId,
                            }) satisfies CurrentClientInfo,
                    ),
                );
            },
        });

        background.current.postMessage({
            type: 'PANEL_INIT',
            data: {
                tabId: chrome.devtools.inspectedWindow.tabId,
            },
        });

        background.current.postMessage({
            type: 'CLIENTS',
            data: {},
        });
    }, []);

    useEffect(() => {
        log('Clients:', clients);
    }, [clients]);

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

    return (
        <BackgroundContext value={background.current}>
            <ClientContext value={clients.at(currentClient)}>
                <nav className='flex items-center justify-between w-full h-8 px-2 overflow-y-auto text-gray-400 bg-black border-b border-gray-700'>
                    <div>
                        {tabs.map((tab, i) =>
                            i === tabIndex ? (
                                <button
                                    key={i}
                                    onClick={() => setTabIndex(i)}
                                    className='p-2 text-white hover:cursor-pointer'
                                >
                                    {tab.name}
                                </button>
                            ) : (
                                <button
                                    key={i}
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

                <main className='w-full h-[calc(100vh-2rem)]'>
                    {tabs[tabIndex].render()}
                </main>
            </ClientContext>
        </BackgroundContext>
    );
}
