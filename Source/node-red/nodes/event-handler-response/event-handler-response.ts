// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { EventContext } from '@dolittle/sdk.events';

import { Node, registerNodeType } from '../../Node';
import { messageHandlerNode, SendCallback } from '../../MessageHandlerNode';
import { Message } from '../../Message';


interface HandleEventPromise {
    resolve?: () => void,
    reject?: (error: Error) => void,
}

interface EventHandlerResult {
    success?: boolean,
    failure?: any,
}

interface HandleEventResponse extends Message<boolean | EventHandlerResult> {
    context?: EventContext,
    _handleEventPromise?: HandleEventPromise,
}

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'event-handler-response')
    @messageHandlerNode
    class EventHandlerResponse extends Node {
        constructor(config: NodeProperties) {
            super(config);
        }

        handle(message: HandleEventResponse, send: SendCallback) {
            if (!message._handleEventPromise?.resolve || !message._handleEventPromise.reject) {
                this._logger.error('Message does not originate from an Event Handler node or has been modified in between');
                return;
            }
            const {resolve, reject} = message._handleEventPromise;

            const payload = message.payload;
            if (typeof payload !== 'boolean' && typeof payload !== 'object') {
                this._logger.error('Message does not contain a valid payload');
                reject(new Error('Message does not contain a valid payload'));
                return;
            }

            if (typeof payload === 'boolean') {
                if (payload) {
                    resolve();
                } else {
                    reject(new Error('Unknown failure'));
                }
            } else {
                if (typeof payload.success !== 'boolean') {
                    this._logger.error('payload.success must be a boolean');
                    reject(new Error('payload.success must be a boolean'));
                    return;
                }
                if (payload.success) {
                    resolve();
                } else {
                    if (typeof payload.failure === 'string') {
                        reject(new Error(payload.failure));
                    } else if (payload.failure) {
                        reject(new Error(JSON.stringify(payload.failure)));
                    } else {
                        reject(new Error('Unknown failure'));
                    }
                }
            }
        }
    }
};
