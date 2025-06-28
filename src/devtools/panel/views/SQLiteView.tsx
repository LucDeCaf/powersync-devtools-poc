import { useEffect, useState } from 'react';
import { usePort } from '../context/PortContext';
import { GenericTable } from '../components/Table';

export function SQLiteView() {
    const port = usePort();
    const [query, setQuery] = useState('');
    const [queryResult, setQueryResult] = useState<any[]>([]);

    useEffect(() => {
        if (port) {
            port.onMessage.addListener(handlePortMessage);
        }
    }, [port]);

    const runQuery = () => {
        if (!port) return;
        port.onMessage.addListener(handlePortMessage);

        let queryToRun = query;
        if (query === '') {
            queryToRun = 'select * from todos';
        }

        port.postMessage({
            type: 'QUERY',
            data: {
                query: queryToRun,
            },
        });
    };

    const handlePortMessage = (message: any, port: chrome.runtime.Port) => {
        if (message.type === 'QUERY_RESPONSE') {
            if (message.data.success) {
                console.log('Query received: ', message.data.data);
                setQueryResult(message.data.data);
            } else {
                // TODO: [error, setError] and error displaying
                setQueryResult([]);
                console.error(message.data.error);
            }
            port.onMessage.removeListener(handlePortMessage);
        }
    };

    if (!port) {
        return <div className='p-4 font-mono text-gray-400'>Disconnected</div>;
    }

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
