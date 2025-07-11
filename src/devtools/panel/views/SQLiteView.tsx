import { useEffect, useState } from 'react';
import { useBackground } from '../context/BackgroundContext';
import { GenericTable } from '../components/Table';
import { useClient } from '../context/ClientContext';
import type { ProxiedQueryResult } from '@powersync/web';
import { error } from '../../../utils/loggers';
import { v4 as uuidv4 } from 'uuid';

export function SQLiteView() {
    const background = useBackground();
    const client = useClient();
    const [query, setQuery] = useState('');
    const [requestId, setRequestId] = useState<string | null>(null);
    const [queryResult, setQueryResult] = useState<ProxiedQueryResult | null>(
        null,
    );

    useEffect(() => {
        if (!client) return;

        return background.registerListener({
            messageReceived: (message) => {
                if (message.type !== 'QUERY_ACK') return;
                if (message.data.clientId !== client.clientId) return;
                if (message.data.requestId !== requestId) return;

                if (!message.data.success) {
                    error('Error executing query:', message.data.error);
                    return;
                }

                setRequestId(null);
                setQueryResult(message.data.queryResult);
            },
        });
    }, [client, requestId]);

    const runQuery = () => {
        if (!client) return;

        let queryToRun = query;
        if (query === '') {
            queryToRun = 'select * from todos';
        }

        const newRequestId = uuidv4();

        setRequestId(newRequestId);
        setQueryResult(null);

        background.postMessage({
            type: 'QUERY',
            data: {
                query: queryToRun,
                requestId: newRequestId,
                clientId: client.clientId,
            },
        });
    };

    return (
        <div className='flex flex-col h-full p-4 overflow-y-scroll gap-2'>
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
            <GenericTable data={queryResult?.rows._array ?? []} pageSize={10} />
        </div>
    );
}
