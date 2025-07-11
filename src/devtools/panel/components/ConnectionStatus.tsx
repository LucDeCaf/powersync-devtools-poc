import { useEffect, useState } from 'react';
import { useBackground } from '../context/BackgroundContext';
import { useClient } from '../context/ClientContext';
import type { SyncStatusOptions } from '@powersync/web';

export function ConnectionStatus() {
    const background = useBackground();
    const client = useClient();
    const [status, setStatus] = useState<SyncStatusOptions | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!client) return;

        const cleanup = background.registerListener({
            messageReceived: (message) => {
                if (message.type !== 'STATUS_ACK') return;
                if (message.data.clientId !== client.clientId) return;

                setStatus(message.data.status);
                setLoading(false);
            },
        });

        setLoading(true);
        setStatus(null);

        background.postMessage({
            type: 'STATUS',
            data: {
                clientId: client.clientId,
            },
        });

        return cleanup;
    }, [client]);

    // Colours from TailwindCSS
    let connectionMessage = 'Disconnected';
    let indicatorColour = 'oklch(55.1% 0.027 264.364)'; // gray-500

    if (loading) {
        connectionMessage = 'Loading';
    } else if (status) {
        if (status.dataFlow) {
            if (status.dataFlow.downloading) {
                connectionMessage = 'Downloading';
                indicatorColour = 'oklch(90.5% 0.182 98.111)'; // yellow-300
            } else if (status.dataFlow.uploading) {
                connectionMessage = 'Uploading';
                indicatorColour = 'oklch(90.5% 0.182 98.111)'; // yellow-300
            }
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
