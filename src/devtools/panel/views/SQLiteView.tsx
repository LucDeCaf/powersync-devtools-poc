import { useEffect, useState } from 'react';
import { useConnectionManager } from '../context/ConnectionManagerContext';
import { GenericTable } from '../components/Table';

export function SQLiteView() {
    const connector = useConnectionManager();
    const [query, setQuery] = useState('');
    const [queryResult, setQueryResult] = useState<any[]>([]);

    useEffect(() => {
        connector.addListener('QUERY_RESPONSE', handleQueryResponse);
    }, []);

    const handleQueryResponse = (data: any) => {
        if (data.success) {
            console.log('Query received: ', data.data);
            setQueryResult(data.data);
        } else {
            // TODO: [error, setError] and error displaying
            setQueryResult([]);
            console.error(data.error);
        }
        connector.removeListener('QUERY_RESPONSE');
    };

    const runQuery = () => {
        connector.addListener('QUERY_RESPONSE', handleQueryResponse);

        let queryToRun = query;
        if (query === '') {
            queryToRun = 'select * from todos';
        }

        connector.sendMessage('QUERY', {
            query: queryToRun,
        });
    };

    return (
        <div className='flex flex-col p-4 gap-2'>
            <label htmlFor='query' className='text-gray-400'>
                Query
            </label>
            <div className='flex mb-2'>
                <input
                    type='text'
                    id='query'
                    className='w-full p-2 pl-4 border border-gray-700 rounded-l-md focus:outline-none'
                    placeholder='SELECT * FROM todos;'
                    onChange={(e) => setQuery(e.target.value)}
                    value={query}
                />
                <button
                    onClick={() => runQuery()}
                    className='w-40 p-2 border border-gray-500 rounded-r-md hover:cursor-pointer'
                >
                    Execute
                </button>
            </div>

            {/* TODO: Generic table component */}
            <div className='text-gray-400'>Result</div>
            <GenericTable data={queryResult} pageSize={10} />
        </div>
    );
}
