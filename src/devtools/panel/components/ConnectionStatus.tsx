import { useEffect, useState } from 'react';
import { usePort } from '../context/PortContext';
import type { PowerSyncStatus } from '../../../types';

export function ConnectionStatus() {
    const port = usePort();
    const [status, setStatus] = useState<PowerSyncStatus | null>(null);

    console.log(status);

    useEffect(() => {
        if (port) {
            port.onMessage.addListener((message, _port) => {
                if (message.type === 'STATUS') {
                    setStatus(message.data as PowerSyncStatus);
                }
            });
            port.postMessage({
                type: 'GET_STATUS',
            });
        }
    }, [port]);

    // Colours from TailwindCSS
    let connectionMessage = 'Uninitialized';
    let indicatorColour = 'oklch(55.1% 0.027 264.364)'; // gray-500

    if (status) {
        if (status.dataFlow.downloading) {
            connectionMessage = 'Downloading';
            indicatorColour = 'oklch(90.5% 0.182 98.111)'; // yellow-300
        } else if (status.dataFlow.uploading) {
            connectionMessage = 'Uploading';
            indicatorColour = 'oklch(90.5% 0.182 98.111)'; // yellow-300
        } else if (status.connected) {
            connectionMessage = 'Connected';
            indicatorColour = 'oklch(72.3% 0.219 149.579)'; // green-500
        } else if (status.connecting) {
            connectionMessage = 'Connecting';
            indicatorColour = 'oklch(52.7% 0.154 150.069)'; // green-700
        }
    }

    return (
        <div className='flex items-center justify-between w-24 text-gray-400'>
            <div
                className='w-2 rounded-full aspect-square'
                style={{ backgroundColor: indicatorColour }}
            ></div>
            <div>{connectionMessage}</div>
        </div>
    );
}
