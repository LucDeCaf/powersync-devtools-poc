import { useEffect, useState } from 'react';
import type { PowerSyncTable } from '../../../types';
import { usePort } from '../context/PortContext';

export function TableView() {
    const port = usePort();
    const [schemas, setSchemas] = useState<PowerSyncTable[]>([]);
    const [tables, setTables] = useState<unknown[][]>([]);
    const [activeTable, setActiveTable] = useState(0);

    useEffect(() => {
        if (port) {
            // Refresh message listener - makes sure that stateful vars are updated
            port.onMessage.removeListener(handlePortMessage);
            port.onMessage.addListener(handlePortMessage);
        }
    }, [port, schemas, tables]);

    const handlePortMessage = (message: any, _port: chrome.runtime.Port) => {
        switch (message.type) {
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

    const rows =
        tables[activeTable]?.map((row: any, i) => (
            <tr key={i}>
                <td className='text-gray-600'>{i}</td>
                <td className='max-w-80'>{row['id']}</td>

                {schemas[activeTable].options.columns.map((col, j) => (
                    <td key={j} className='max-w-80'>
                        {row[col.options.name]}
                    </td>
                ))}
            </tr>
        )) ?? [];

    return (
        <div className='flex h-full'>
            <div className='h-full p-4 font-mono border-r border-gray-700 min-w-48 max-w-80'>
                <div className='w-full mb-2 ml-2 text-gray-400 '>Tables</div>
                <div className='flex flex-col whitespace-nowrap'>
                    {schemas.map((schema, i) => (
                        <button
                            key={i}
                            className='flex justify-between w-full text-left hover:cursor-pointer'
                            onClick={() => setActiveTable(i)}
                        >
                            <span className='font-mono overflow-ellipsis'>
                                {schema.options.name}
                            </span>
                            {i === activeTable && <span>&lt;</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className='w-full overflow-x-scroll'>
                <div className='flex items-center justify-between w-full text-gray-400 border-b border-gray-700'>
                    {/* Left */}
                    <div className='flex h-full *:px-4 py-2 *:border-r *:border-gray-600'>
                        <div className='font-mono'>
                            {tables.length > 0
                                ? schemas[activeTable].options.name
                                : 'No table selected'}
                        </div>
                    </div>

                    {/* Right */}
                    <div className='h-full'></div>
                </div>

                {tables.length > 0 ? (
                    <>
                        <table className='border-separate rounded-md w-max border-spacing-4'>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>
                                        <div className='flex justify-between gap-4'>
                                            <span className='font-medium'>
                                                id
                                            </span>
                                            <span className='font-bold text-gray-700'>
                                                TEXT
                                            </span>
                                        </div>
                                    </th>
                                    {schemas[activeTable].options.columns.map(
                                        (col, i) => (
                                            <th key={i}>
                                                <div className='flex justify-between gap-4'>
                                                    <span className='font-medium'>
                                                        {col.options.name}
                                                    </span>
                                                    <span className='font-bold text-gray-700'>
                                                        {col.options.type}
                                                    </span>
                                                </div>
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>

                            <tbody className='whitespace-wrap'>{rows}</tbody>
                        </table>

                        {tables[activeTable].length === 0 && (
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
