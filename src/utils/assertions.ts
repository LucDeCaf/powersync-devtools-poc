import type { Message } from '../types';

export function assertValidMessage(message: any): message is Message {
    const error = (reason: string) => {
        throw new Error(`Error validating message: ${reason}`);
    };

    if (typeof message !== 'object') {
        error('Message must be of type "object"');
    }

    const keys = Object.keys(message);
    if (keys.length !== 2 && keys.length !== 3) {
        error(`Invalid number of keys (${keys.length})`);
    }
    const requiredKeys = ['type', 'data', 'clientId'];
    for (const requiredKey of requiredKeys) {
        if (!keys.includes(requiredKey)) {
            error(`Missing required key "${requiredKey}"`);
        }
    }

    return true;
}
