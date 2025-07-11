import type { Message } from '../types';

export function assertValidMessage(message: any): message is Message {
    const error = (reason: string) => {
        throw new Error(
            `Error validating message: ${reason}: ${JSON.stringify(message)}`,
        );
    };

    if (typeof message !== 'object') {
        error('Message must be of type "object"');
    }

    const keys = Object.keys(message);
    if (keys.length !== 2) {
        error(`Invalid number of keys (${keys.length})`);
    }

    const validKeys = ['type', 'data'];
    for (const key of keys) {
        if (!validKeys.includes(key)) {
            error(`Missing key "${key}"`);
        }
    }

    // TODO: Validate message types and their data fields

    return true;
}
