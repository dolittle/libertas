// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Node } from 'node-red';
import { Message } from './Message';
import { Constructor } from '@dolittle/rudiments';

export type SendCallback = (messages: any | any[] | any[][]) => void;
export type DoneCallback = (error?: Error) => void;

interface MessageHandlerNode<T, U extends Message<T>> extends Node {
    handle(message: U, send: SendCallback): void | Promise<void>;
}

export function messageHandlerNode<T, U extends Message<T>, V extends Constructor<MessageHandlerNode<T, U>>>(constructor: V) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);
            this.on('input', async (message: any, send: SendCallback, done: DoneCallback) => {
                // Pre-1.0 polyfills
                send = send || ((messages: any | any[] | any[][]) => this.send(messages));
                done = done || ((error?: Error) => { if (error) this.error(error, message); });

                try {
                    await this.handle(message as U, send);
                    done();
                } catch (error) {
                    done(error);
                }
            });
        }
    };
}
