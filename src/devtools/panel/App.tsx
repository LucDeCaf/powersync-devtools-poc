import { useEffect, useMemo, useState } from 'react';
import { TableView } from './views/TableView';
import { SQLiteView } from './views/SQLiteView';
import {
    ConnectionManagerContext,
    useConnectionManager,
} from './context/ConnectionManagerContext';
import { ConnectionStatus } from './components/ConnectionStatus';
import './App.css';

export default function App() {
    const connector = useConnectionManager();

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
        <ConnectionManagerContext value={connector}>
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
        </ConnectionManagerContext>
    );
}
