import { useState } from 'react';
import type { PowerSyncTable } from '../../../types';

export interface TableViewProps {
    schemas: PowerSyncTable[];
    tables: unknown[][];
}

export function TableView({ schemas, tables }: TableViewProps) {
    const [activeTable, setActiveTable] = useState(0);

    return (
        <div className='h-full flex'>
            <div className='h-full p-4 font-mono border-r border-gray-700 min-w-48 max-w-80'>
                <div className='w-full mb-2 ml-2 text-gray-400 '>Tables</div>
                <div className='flex flex-col whitespace-nowrap'>
                    {schemas.map((schema, i) => (
                        <button
                            key={i}
                            className='flex justify-between w-full text-left hover:cursor-pointer'
                            onClick={() => setActiveTable(i)}
                        >
                            <span className='overflow-ellipsis font-mono'>
                                {schema.options.name}
                            </span>
                            {i === activeTable && <span>&lt;</span>}
                        </button>
                    ))}
                </div>

                {/* <div className='m-2 text-gray-400'>Internal</div>
                <div className='flex flex-col whitespace-nowrap'>
                    <button className='text-left'>_SCHEMA</button>
                    <button className='text-left'>_todos_6eacac</button>
                    <button className='text-left'>_lists_cfdb79</button>
                </div> */}
            </div>

            <div className='w-full overflow-x-scroll'>
                {tables.length > 0 ? (
                    <table className='border-separate rounded-md w-max border-spacing-4'>
                        <thead>
                            <tr>
                                <th></th>
                                <th>
                                    <div className='flex justify-between gap-4'>
                                        <span className='font-medium'>id</span>
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
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody className='whitespace-wrap'>
                            {tables[activeTable].map((items: any, i) => (
                                <tr key={i}>
                                    <td className='text-gray-600'>{i}</td>
                                    <td className='max-w-80'>{items['id']}</td>

                                    {schemas[activeTable].options.columns.map(
                                        (col, j) => (
                                            <td key={j} className='max-w-80'>
                                                {items[col.options.name]}
                                            </td>
                                        )
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className='p-2 font-mono text-gray-400'>
                        No table selected
                    </div>
                )}
            </div>
        </div>
    );
}
