// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red, NodeId } from 'node-red';

import { Node, registerNodeType } from '../../Node';

import { Client } from '@dolittle/sdk';
import { ArtifactId } from '@dolittle/sdk.artifacts';
import { EventSourceId, CommitEventsResponse, CommittedEvents } from '@dolittle/sdk.events';

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

type Request = MessageWithExecutionContext<UncommittedEvent | UncommittedEvent[]>;
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

            let result: CommitEventsResponse;
            let committedEvents: any[] = [];
            let failed = false;

            const response = message as any;

            for (const event of events) {
                if (event.public) {
                    result = await this._client.eventStore.commitPublic(event, event.eventSourceId.value, event.artifact.value);
                } else {
                    result = await this._client.eventStore.commit(event.content, event.eventSourceId.value, event.artifact.value);
                }

                if (result.failed) {
                    response.payload = {
                        committed: false,
                        failureId: result.failure?.id.toString(),
                        failureReason: result.failure?.reason,
                    };
                    failed = true;
                    break;
                } else {
                    committedEvents = [...committedEvents, this.getEventsFrom(result.events)];
                }
            }

            if (!failed) {
                response.payload = {
                    committed: true,
                    events: committedEvents
                };
            }
            send(response);
        }

        private getEventsFrom(events: CommittedEvents) {
            return events.toArray().map(event => ({
                artifact: {
                    id: event.type.id.toString(),
                    generation: event.type.generation,
                },
                content: event.content,
                context: {
                    sequenceNumber: event.eventLogSequenceNumber,
                    eventSourceId: event.eventSourceId.toString(),
                    occurred: event.occurred.toString(),
                    public: event.isPublic,
                    executionContext: {
                        microserviceId: event.executionContext.microserviceId.toString(),
                        tenantId: event.executionContext.tenantId.toString(),
                        version: event.executionContext.version.toString(),
                        environment: event.executionContext.environment,
                        correlationId: event.executionContext.correlationId.toString(),
                        claims: event.executionContext.claims.toArray().map(claim => ({
                            key: claim.key,
                            value: claim.value,
                            valueType: claim.valueType,
                        })),
                    },
                },
            }));
        }
    }
};
