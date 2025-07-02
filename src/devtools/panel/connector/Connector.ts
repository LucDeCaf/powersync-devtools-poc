export type Listener = (data: any) => void;

type Message = { type: string; data?: any };

export class Connector {
    private port: chrome.runtime.Port | null;
    private heartbeatIntervalId: number | null;
    private listeners: Map<string, Listener>;
    private sendQueue: Message[];

    onDisconnect: (() => void) | null = null;

    constructor() {
        this.port = null;
        this.heartbeatIntervalId = null;
        this.listeners = new Map();
        this.sendQueue = [];

        this._onMessage = this._onMessage.bind(this);
        this._onDisconnect = this._onDisconnect.bind(this);
    }

    get connected() {
        return this.port !== null;
    }

    public reconnect() {
        this.disconnect();

        this.port = chrome.runtime.connect({ name: 'panel-port' });
        this.port.onDisconnect.addListener(this._onDisconnect);
        this.port.onMessage.addListener(this._onMessage);

        this.heartbeatIntervalId = setInterval(() => {
            if (this.port) {
                this.port.postMessage({
                    type: 'HEARTBEAT',
                });
            }
        }, 25000);

        // Use postMessage directly because tabId is not usually a valid field
        this.port.postMessage({
            type: 'INIT',
            tabId: chrome.devtools.inspectedWindow.tabId,
        });
        this._flushSendQueue();
    }

    public disconnect() {
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
        }
        if (this.port) {
            this.port.disconnect();
        }
        this.port = null;
        this.heartbeatIntervalId = null;
    }

    public addListener(type: string, listener: Listener) {
        this.listeners.set(type, listener);
    }

    public removeListener(type: string): boolean {
        return this.listeners.delete(type);
    }

    public sendMessage(type: string, data?: any) {
        const message = { type, data };

        if (!this.port) {
            this.sendQueue.push(message);
            return;
        }

        this._flushSendQueue();
        this.port.postMessage(message);
    }

    private _onMessage(message: any, _port: chrome.runtime.Port) {
        // Ignore messages with invalid structure
        if (typeof message !== 'object') return;
        if (!('type' in message)) return;
        if (typeof message.type !== 'string') return;

        const messageType: string = message.type;
        const messageData = 'data' in message ? message.data : undefined;

        const listener = this.listeners.get(messageType);
        if (listener) listener(messageData);
    }

    private _onDisconnect(_port: chrome.runtime.Port) {
        this.port = null;
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
        }

        // Run user-defined callback
        if (this.onDisconnect) this.onDisconnect();
    }

    private _flushSendQueue(): boolean {
        if (!this.port) return false;

        this.sendQueue.reverse();
        for (const message of this.sendQueue) {
            this.port.postMessage(message);
        }
        this.sendQueue.length = 0;

        return true;
    }
}
