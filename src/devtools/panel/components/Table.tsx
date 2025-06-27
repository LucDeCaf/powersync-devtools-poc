export function GenericTable({ data }: { data: unknown[] }) {
    const columns = data.length > 0 ? Object.keys(data[0]!) : [];

    return (
        <>
            {data.length > 0 && (
                <table className='block w-full overflow-scroll border border-separate border-gray-700 rounded-md border-spacing-4'>
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
                        {data.map((row: any, i) => (
                            <tr key={i}>
                                <td className='text-gray-600'>{i}</td>
                                {columns.map((col, j) => (
                                    <td key={j} className='max-w-80'>
                                        {row[col]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {data.length === 0 && (
                <div className='p-4 text-gray-400 border border-gray-700 rounded-md'>
                    No data
                </div>
            )}
        </>
    );
}
