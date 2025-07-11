import { createContext, useContext } from 'react';
import { PortConnectionManager } from '../../../library/adapters/background/PortConnectionManager';

export const BackgroundContext = createContext<
    PortConnectionManager | undefined
>(undefined);

export const useBackground: () => PortConnectionManager = () => {
    const value = useContext(BackgroundContext);

    if (!value) {
        throw new Error(
            'useBackground must be called within a BackgroundContext provider',
        );
    }

    return value;
};
