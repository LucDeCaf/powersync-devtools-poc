import type { Message } from '../../../types';
import { assertValidMessage } from '../../../utils/assertions';
import { warn, error, log } from '../../../utils/loggers';
import { BaseObserver } from '@powersync/web';

export interface PortConnectionManagerOptions {
    portName: string;
}

export type PortConnectionManagerListener = {
    connected: () => void;
    disconnected: () => void;
    messageReceived: (message: Message) => void;
};

export class PortConnectionManager extends BaseObserver<PortConnectionManagerListener> {
    protected port: chrome.runtime.Port | null;
    protected heartbeatIntervalId: number | null;
    protected _portName: string;
    protected messageQueue: Message[];

    constructor(options: PortConnectionManagerOptions) {
        super();

        this.port = null;
        this.heartbeatIntervalId = null;
        this._portName = options.portName;
        this.messageQueue = [];

        this.reconnectPort();
    }

    get connected() {
        return this.port !== null;
    }

    get portName() {
        return this._portName;
    }

    postMessage(message: Message) {
        if (this.port) {
            this.flushMessageQueue();
            this.port.postMessage(message);
        } else {
            this.messageQueue.push(message);
        }
    }

    protected flushMessageQueue = () => {
        if (!this.port) return;

        this.messageQueue.reverse();
        for (const message of this.messageQueue) {
            this.port.postMessage(message);
        }
    };

    protected reconnectPort = () => {
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
        }
        if (this.port) {
            this.port.disconnect();
        }

        this.port = chrome.runtime.connect({
            name: this._portName,
        });

        this.port.onMessage.addListener(this._onMessage);
        this.port.onDisconnect.addListener(this._onDisconnect);

        // Send heartbeat message every 25 seconds
        this.heartbeatIntervalId = setInterval(() => {
            this.postMessage({
                type: 'HEARTBEAT',
                data: {},
            });
        }, 25000);

        this.flushMessageQueue();

        this.iterateListeners((cb) => cb.connected?.());
    };

    protected _onMessage = (message: any, _port: chrome.runtime.Port) => {
        try {
            if (!assertValidMessage(message)) return;
            this.iterateListeners((cb) => cb.messageReceived?.(message));
        } catch (e) {
            error(e);
            return;
        }
    };

    protected _onDisconnect = () => {
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
        }
        this.port = null;
        this.heartbeatIntervalId = null;

        warn('Port disconnected - attempting reconnect');

        this.iterateListeners((cb) => cb.disconnected?.());

        setTimeout(() => {
            this.reconnectPort();
        }, 1000);
    };
}
