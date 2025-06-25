import { createContext, useContext } from 'react';

export const PortContext = createContext<chrome.runtime.Port | null>(null);

export const usePort = () => useContext(PortContext);
