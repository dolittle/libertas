// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Node } from './Node';
import { NodeProperties } from 'node-red';
import { TenantId } from '@dolittle/sdk.execution';

export type SendCallback<T> = (messages: T | T[] | T[][]) => void;
export type DoneCallback = (error?: Error) => void;

export interface Message<T> {
    _msgid: string;
    topic: string;
    payload?: T;
}

export interface ExecutionContext {
    tenantId: TenantId;
}

export interface MessageWithExecutionContext<T> extends Message<T> {
    executionContext: ExecutionContext;
}

export abstract class MessageNode<T,U> extends Node {
    constructor(config: NodeProperties) {
        super(config);
        this.on('input', this.handleInternal.bind(this));
    }

    async abstract handle (message: T, send: SendCallback<U>): Promise<void>;

    private async handleInternal(message: any, send: SendCallback<U>, done: DoneCallback) {
        // Pre-1.0 polyfills
        send = send || ((messages: U | U[] | U[][]) => this.send(messages));
        done = done || ((error?: Error) => { if (error) this.error(error, message); });

        try {
            await this.handle(message as T, send);
            done();
        } catch (error) {
            done(error);
        }
    }
}