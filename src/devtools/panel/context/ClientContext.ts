import { createContext, useContext } from 'react';

export type CurrentClientInfo = {
    clientId: string;
};

export const ClientContext = createContext<CurrentClientInfo | undefined>(
    undefined,
);
export const useClient = () => useContext(ClientContext);
