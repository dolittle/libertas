// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red, NodeId } from 'node-red';

import { Node, registerNodeType } from '../../Node';

import { Guid } from '@dolittle/rudiments';
import { Client } from '@dolittle/sdk';
import { Artifact, ArtifactId } from '@dolittle/sdk.artifacts';
import { EventSourceId } from '@dolittle/sdk.events';

import { DolittleRuntimeConfig } from '../dolittle-runtime-config/dolittle-runtime-config';
import { MessageWithExecutionContext } from '../../Message';
import { messageHandlerNode, SendCallback } from '../../MessageHandlerNode';

interface EventStoreProperties extends NodeProperties {
    server: NodeId;
}

interface UncommittedEvent {
    eventSourceId: EventSourceId,
    artifact: ArtifactId,
    content: any
    public?: boolean;
}

class CommitEventsResponse {
}

type Request = MessageWithExecutionContext<UncommittedEvent | UncommittedEvent[]>;
type Response = MessageWithExecutionContext<CommitEventsResponse>;

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'event-store')
    @messageHandlerNode
    class EventStore extends Node {
        private _client?: Client;
        private _server?: DolittleRuntimeConfig;

        constructor(config: EventStoreProperties) {
            super(config);

            this._server = this.getConfigurationFromNode(config.server);
            this._client = this._server?.clientBuilder.withLogging(_ => _.useWinston(w => w.transports = this._loggerTransport)).build();

            // TODO: Setup on close to handle stopping gracefully
        }

        async handle(message: Request, send: SendCallback): Promise<void> {
            if (!this._client) {
                throw new Error('No client configured');
            }
            if (!message.executionContext || !message.executionContext.tenantId) {
                throw new Error('No tenant id configured in the execution context');
            }
            if (!message.payload) {
                throw new Error('No payload');
            }

            const events = Array.isArray(message.payload) ? message.payload : [message.payload];

            this._client.executionContextManager.forTenant(message.executionContext.tenantId);
            await this._client.eventStore.commit(events);

            console.log('Inserted events');

            // TODO: Send some response back
        }
    }
};
