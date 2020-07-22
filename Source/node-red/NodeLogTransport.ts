// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

//const Transport = require('winston-transport');
import { Node } from 'node-red';
import { LogEntry } from 'winston';
import Transport, { TransportStreamOptions } from 'winston-transport';

export class NodeLogTransport extends Transport {
    constructor(private readonly _node: Node, opts?: TransportStreamOptions) {
        super(opts);
    }

    log(entry: LogEntry, callback?: () => void) {
        // eslint-disable-next-line no-restricted-globals
        setImmediate(() => {
            this.emit('logged', entry);
        });

        switch (entry.level) {
            case 'trace':
                this._node.trace(entry.message);
                break;
            case 'debug':
                this._node.debug(entry.message);
                break;
            case 'warn':
                this._node.warn(entry.message);
                break;
            case 'error':
                this._node.error(entry.message);
                break;
            case 'info':
            default:
                this._node.log(entry.message);
        }

        if (callback) {
            callback();
        }
    }
}