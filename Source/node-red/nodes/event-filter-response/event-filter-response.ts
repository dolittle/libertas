// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { EventContext, PartitionId } from '@dolittle/sdk.events';
import { PartitionedFilterResult } from '@dolittle/sdk.events.filtering';

import { Node, registerNodeType } from '../../Node';
import { messageHandlerNode, SendCallback } from '../../MessageHandlerNode';
import { Message } from '../../Message';

interface FilterEventPromise {
    partitioned?: boolean,
    resolve?: (result: boolean | PartitionedFilterResult) => void,
    reject?: (error: Error) => void,
}

interface PartitionedFilterResponse {
    shouldInclude?: boolean,
    partitionId?: PartitionId,
}

interface FilterEventResponse extends Message<boolean | PartitionedFilterResponse> {
    context?: EventContext,
    _filterEventPromise?: FilterEventPromise,
}

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'event-filter-response')
    @messageHandlerNode
    class EventFilterResponse extends Node {
        constructor(config: NodeProperties) {
            super(config);
        }

        handle(message: FilterEventResponse, send: SendCallback): void | Promise<void> {
            if (!message._filterEventPromise?.resolve || !message._filterEventPromise?.reject || message._filterEventPromise.partitioned === undefined) {
                this.error('Message does not originate from an Event Filter node or has been modified in between');
                return;
            }
            const promise = message._filterEventPromise;

            if (message.payload === undefined) {
                this.error('Message does not contain a payload');
                promise.reject!(new Error('Message does not contain a payload'));
                return;
            }

            if (promise.partitioned) {
                if (typeof message.payload !== 'object' || message.payload.shouldInclude === undefined || message.payload.partitionId === undefined) {
                    this.error('For Partitioned and Public filters the response should be a partitioned filter response');
                    promise.reject!(new Error('For Partitioned and Public filters the response should be a partitioned filter response'));
                    return;
                }

                promise.resolve!(new PartitionedFilterResult(message.payload.shouldInclude, message.payload.partitionId));

            } else {
                if (typeof message.payload !== 'boolean') {
                    this.error('For Unpartitioned filters the response should be a boolean');
                    promise.reject!(new Error('For Unpartitioned filters the response should be a boolean'));
                    return;
                }

                promise.resolve!(message.payload);
            }
        }
    }
};
