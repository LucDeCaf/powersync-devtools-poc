import { useState } from 'react';

export default function App() {
    const [schema, setSchema] = useState([]);

    const devtoolsConnection = chrome.runtime.connect({
        name: 'panel-port',
    });

    devtoolsConnection.onMessage.addListener((message, _) => {
        switch (message.type) {
            case 'POWERSYNC_SCHEMA_CHANGED':
                setSchema(message.data.schema.tables);
                console.log('Updated schema: ', message.data.schema.tables);
                break;

            default:
                console.log('Received: ', message);
                break;
        }
    });

    return (
        <>
            <nav className='sticky top-0 flex w-full gap-4 px-4 py-2 text-gray-400 bg-black border-b border-gray-700'>
                <button className='text-white'>Tables</button>
                <button>Queries</button>
            </nav>

            <div id='content' className='flex h-full'>
                <div className='h-full p-4 font-mono border-r border-gray-700 min-w-48'>
                    <div className='w-full mb-2 text-gray-400'>Tables</div>
                    <div className='flex flex-col'>
                        <button className='flex justify-between w-full text-left'>
                            <span>todos</span>
                            <span>&lt;</span>
                        </button>
                        <button className='text-left'>lists</button>
                    </div>
                    <div className='my-2 text-gray-400'>Internal</div>
                    <div className='flex flex-col'>
                        <button className='text-left'>_SCHEMA</button>
                        <button className='text-left'>_todos_6eacac</button>
                        <button className='text-left'>_lists_cfdb79</button>
                    </div>
                </div>

                <div className='w-full p-2'>
                    <table
                        id='demo-table'
                        className='border-separate divide-y border-spacing-x-4 border-spacing-y-2'
                    >
                        <thead>
                            <tr>
                                <th>todo_id</th>
                                <th>description</th>
                                <th>completed</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>91ab483c-7c48-4fa9-9392-6529eeb73406</td>
                                <td>Build devtools PoC</td>
                                <td>FALSE</td>
                            </tr>
                            <tr>
                                <td>96626838-e0c8-4412-84b2-e844162e9444</td>
                                <td>Study for English exam</td>
                                <td>FALSE</td>
                            </tr>
                            <tr>
                                <td>d9207451-6699-4eb2-83c5-4428498b1a73</td>
                                <td>Watch Youtube</td>
                                <td>TRUE</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
