import type { PowerSyncTable } from '../../../types';

export interface TableViewProps {
    schema: PowerSyncTable;
    data: unknown[];
}

export function TableView({ schema, data }: TableViewProps) {
    const tableName = schema.options.name;
    const columns = schema.options.columns;

    console.log(data);

    return (
        <div className='w-full overflow-x-scroll p-4'>
            <table className='w-max border-separate border-spacing-4 border rounded-md border-white'>
                <thead>
                    <tr>
                        <th></th>
                        {columns.map((col, i) => (
                            <th key={i}>
                                <div className='flex gap-4 justify-between'>
                                    <span className='font-medium'>
                                        {col.options.name}
                                    </span>
                                    <span className='font-bold text-gray-700'>
                                        {col.options.type}
                                    </span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.map((items: any, i) => (
                        <tr key={i}>
                            <td className='text-gray-600'>{i}</td>

                            {columns.map((col, j) => (
                                <td key={j} className='max-w-80 whitespace-wrap'>
                                    {items[col.options.name]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
