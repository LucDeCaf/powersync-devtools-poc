import { createContext, useContext } from 'react';
import { Connector } from '../connector/Connector';

export const ConnectorContext = createContext<Connector>(new Connector());
export const useConnector = () => useContext(ConnectorContext);
