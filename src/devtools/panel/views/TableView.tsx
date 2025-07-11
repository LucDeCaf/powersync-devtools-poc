import { act, useEffect, useState } from 'react';
import { useBackground } from '../context/BackgroundContext';
import { useClient } from '../context/ClientContext';
import type { Table } from '../../../types';
import { log } from '../../../utils/loggers';

export function TableView() {
    const background = useBackground();
    const client = useClient();
    const [tables, setTables] = useState<Table[]>([]);
    const [activeTable, setActiveTable] = useState(0);

    useEffect(() => {
        if (!client) return;
        log('Client:', client);

        const deregister = background.registerListener({
            messageReceived: (message) => {
                switch (message.type) {
                    case 'TABLES_ACK':
                        if (message.data.clientId !== client.clientId) return;
                        setTables(message.data.tables);
                        break;
                }
            },
        });

        background.postMessage({
            type: 'TABLES',
            data: { clientId: client.clientId },
        });

        return deregister;
    }, [client]);

    useEffect(() => {
        log(
            'fts:',
            tables.find((t) => t.name === 'fts_todos_idx'),
        );
    }, [tables]);

    const rows =
        tables.at(activeTable)?.data.map((row: any, i) => (
            <tr key={i} className='align-top'>
                <td className='text-gray-600'>{i}</td>

                {tables[activeTable].schema.map((col, j) => {
                    let value = row[col.name];
                    if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    }

                    return (
                        <td key={j} className='max-w-80'>
                            {value}
                        </td>
                    );
                })}
            </tr>
        )) ?? [];

    return (
        // Remove height of navbar (2rem) from div - makes scrolling easier to control
        <div className='flex h-full overflow-hidden'>
            <div className='h-full p-4 overflow-y-auto font-mono border-r border-gray-700 min-w-48 max-w-80'>
                <div className='w-full mb-2 ml-2 text-gray-400'>Tables</div>
                <div className='flex flex-col whitespace-nowrap'>
                    {tables.map((table, i) => (
                        <button
                            key={i}
                            className='flex justify-between w-full text-left hover:cursor-pointer'
                            onClick={() => setActiveTable(i)}
                        >
                            {i === activeTable && (
                                <>
                                    <span className='font-mono overflow-ellipsis'>
                                        {table.name}
                                    </span>
                                    <span>&lt;</span>
                                </>
                            )}
                            {i !== activeTable && (
                                <span className='font-mono text-gray-400 overflow-ellipsis'>
                                    {table.name}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            <div className='relative w-full overflow-y-auto'>
                <div className='sticky top-0 left-0 flex items-center w-full text-gray-400 bg-black border-b border-gray-700'>
                    <div className='flex h-full *:px-4 py-2 *:border-r *:border-gray-600'>
                        <div className='font-mono'>
                            {tables.length > 0
                                ? tables[activeTable].name
                                : 'No table selected'}
                        </div>
                    </div>
                </div>

                {tables.length > 0 ? (
                    <>
                        <table className='border-separate rounded-md w-max border-spacing-4'>
                            <thead>
                                <tr>
                                    <th></th>
                                    {tables[activeTable].schema.map(
                                        (col, i) => (
                                            <th key={i}>
                                                <div className='flex justify-between gap-4'>
                                                    <span className='font-medium'>
                                                        {col.name}
                                                    </span>
                                                    <span className='font-bold text-gray-700'>
                                                        {col.type}
                                                    </span>
                                                </div>
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>

                            <tbody className='whitespace-wrap'>{rows}</tbody>
                        </table>

                        {tables[activeTable].data.length === 0 && (
                            <div className='pl-8 -mt-2 font-mono text-gray-400'>
                                No rows
                            </div>
                        )}
                    </>
                ) : (
                    <div className='px-4 py-2 font-mono text-gray-400'>...</div>
                )}
            </div>
        </div>
    );
}
