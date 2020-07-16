// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red, NodeId } from 'node-red';

import { Node, registerNodeType } from '../../Node';

import { Guid } from '@dolittle/rudiments';
import { Client } from '@dolittle/sdk';
import { Artifact, ArtifactId } from '@dolittle/sdk.artifacts';
import { EventSourceId } from '@dolittle/sdk.events';

import { DolittleRuntimeConfig } from '../dolittle-runtime-config/dolittle-runtime-config';
import { MessageNode, SendCallback, MessageWithExecutionContext } from '../../MessageNode';

interface EventStoreProperties extends NodeProperties {
    server: NodeId;
}

interface UncommittedEvent {
    eventSourceId: EventSourceId,
    artifact: ArtifactId,
    content: any
}

interface CommitEventsRequest extends UncommittedEvent {
    public?: boolean;
    events?: UncommittedEvent[];
}

class CommitEventsResponse {
}

type Request = MessageWithExecutionContext<CommitEventsRequest>;
type Response = MessageWithExecutionContext<CommitEventsResponse>;

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'event-store')
    class EventStore extends MessageNode<Request, Response> {
        private _client?: Client;
        private _server?: DolittleRuntimeConfig;

        constructor(config: EventStoreProperties) {
            super(config);

            this._server = this.getConfigurationFromNode(config.server);
            this._client = this._server?.clientBuilder.build();
        }

        async handle(message: Request, send: SendCallback<Response>): Promise<void> {
            if (!this._client) {
                throw new Error('No client configured');
            }
            if (!message.executionContext) {
                throw new Error('No excecution context set');
            }
            if (!message.payload) {
                throw new Error('No payload');
            }
            const events = message.payload.events || [message.payload];

            // TODO: Commit more than one event
            this._client.executionContextManager.currentFor(message.executionContext.tenantId);
            const event = events[0];
            if (message.payload?.public) {
                await this._client.eventStore.commitPublic(event.content, event.eventSourceId, event.artifact);
            } else {
                await this._client.eventStore.commit(event.content, event.eventSourceId, event.artifact);
            }

            console.log('Inserted events');

            // TODO: Send some response back
        }
    }
};
