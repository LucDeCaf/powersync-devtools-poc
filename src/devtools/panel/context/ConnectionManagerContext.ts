import { createContext, useContext } from 'react';
import { PortConnectionManager } from '../../../library/adapters/background/PortConnectionManager';

export const ConnectionManagerContext = createContext<PortConnectionManager>(
    new PortConnectionManager({
        portName: 'panel-port',
    }),
);
export const useConnectionManager = () => useContext(ConnectionManagerContext);
