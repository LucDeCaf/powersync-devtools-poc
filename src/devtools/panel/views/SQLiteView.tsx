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

    if (!port) {
        return <div className='p-4 text-gray-400 font-mono'>Disconnected</div>;
    }

    const runQuery = () => {
        console.log('run call');
        port.postMessage({
            type: 'QUERY',
            data: {
                query,
            },
        });
    };

    const handlePortMessage = (message: any, _port: chrome.runtime.Port) => {
        if (message.type === 'QUERY_RESPONSE') {
            console.log('response gotten');
            if (message.data.success) {
                console.log('success');
                setQueryResult(message.data.data);
            } else {
                // TODO: [error, setError] and error displaying
                setQueryResult([]);
                console.error(message.data.error);
            }
        }
    };

    return (
        <div className='p-4 flex flex-col gap-2'>
            <label htmlFor='query' className='text-gray-400'>
                Query
            </label>
            <div className='flex mb-2'>
                <input
                    type='text'
                    id='query'
                    className='p-2 pl-4 border rounded-l-md border-gray-700 focus:outline-none w-full'
                    placeholder='SELECT * FROM todos;'
                    onChange={(e) => setQuery(e.target.value)}
                    value={query}
                />
                <button
                    onClick={() => runQuery()}
                    className='p-2 border-gray-500 border rounded-r-md w-40 hover:cursor-pointer'
                >
                    Execute
                </button>
            </div>

            {/* TODO: Generic table component */}
            <div className='text-gray-400'>Result</div>
            <GenericTable data={queryResult} />
        </div>
    );
}
