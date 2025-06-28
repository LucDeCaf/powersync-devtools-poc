import { useState } from 'react';

export interface GenericTableProps {
    data: unknown[];
    pageSize: number;
}

export function GenericTable({ data, pageSize }: GenericTableProps) {
    const [pageIndex, setPageIndex] = useState(0);
    const columns = data.length > 0 ? Object.keys(data[0]!) : [];

    const pages: unknown[][] = [];
    const pageCount = Math.ceil(data.length / pageSize);
    for (let i = 0; i < data.length; i += pageSize) {
        let endIndex: number | undefined = i + pageSize;
        if (endIndex >= data.length) {
            endIndex = undefined; // Take till end of array
        }
        pages.push(data.slice(i, endIndex));
        console.log('Page ', i + 1, data.slice(i, endIndex));
    }

    return (
        <>
            {data.length > 0 && (
                <div>
                    <div className='flex items-center border rounded-t-md border-b-0 border-gray-700 px-2'>
                        <div className='text-gray-400 text-lg'>
                            <button
                                className='hover:cursor-pointer hover:text-white p-2'
                                onClick={() =>
                                    setPageIndex((prev) =>
                                        prev === 0 ? prev : prev - 1,
                                    )
                                }
                            >
                                &lt;
                            </button>
                            <button
                                className='hover:cursor-pointer hover:text-white p-2'
                                onClick={() =>
                                    setPageIndex((prev) =>
                                        prev === pageCount - 1
                                            ? prev
                                            : prev + 1,
                                    )
                                }
                            >
                                &gt;
                            </button>
                        </div>
                        <div>
                            Page {pageIndex + 1} of {pageCount}
                        </div>
                    </div>
                    <table className='block w-full overflow-x-auto border border-separate border-gray-700 rounded-b-md border-spacing-4'>
                        <thead>
                            <tr>
                                <th></th>
                                {columns.map((col, i) => (
                                    <th key={i} className='min-w-40'>
                                        <div className='flex'>
                                            <span className='font-medium'>
                                                {col}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className='whitespace-wrap'>
                            {pages[pageIndex].map((row: any, i) => (
                                <tr key={i}>
                                    <td className='text-gray-600'>
                                        {pageIndex * pageSize + i}
                                    </td>
                                    {columns.map((col, j) => (
                                        <td key={j} className='max-w-80'>
                                            {row[col]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {data.length === 0 && (
                <div className='p-4 text-gray-400 border border-gray-700 rounded-md'>
                    No data
                </div>
            )}
        </>
    );
}
