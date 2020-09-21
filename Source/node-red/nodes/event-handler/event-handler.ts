// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red, NodeId } from 'node-red';

import { Node, registerNodeType } from '../../Node';

import { Guid } from '@dolittle/rudiments';
import { Client } from '@dolittle/sdk';
import { Artifact, ArtifactId } from '@dolittle/sdk.artifacts';
import { EventContext, ScopeId } from '@dolittle/sdk.events';
import { FilterId, FilterEventCallback, PartitionedFilterEventCallback, PartitionedFilterResult } from '@dolittle/sdk.events.filtering';
import { EventHandlerId } from '@dolittle/sdk.events.handling';
import { CancellationSource } from '@dolittle/sdk.resilience';

import { DolittleRuntimeConfig } from '../dolittle-runtime-config/dolittle-runtime-config';
import { EventHandlerSignature } from '@dolittle/sdk.events.handling/Distribution/EventHandlerSignature';

interface EventHandlerProperties extends NodeProperties {
    server: string;
    eventHandlerId: string;
    partitioned: boolean;
    scopeId: string;
    artifacts: string[];
}

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'event-handler')
    class EventHandler extends Node {
        private _cancellationSource: CancellationSource;
        private _client?: Client;
        private _server?: DolittleRuntimeConfig;

        private _eventHandlerId: EventHandlerId;
        private _partitioned: boolean;
        private _scopeId: ScopeId;
        private _artifacts: ArtifactId[];


        constructor(config: EventHandlerProperties) {
            super(config);

            this._cancellationSource = new CancellationSource();

            this._eventHandlerId = EventHandlerId.from(config.eventHandlerId);
            this._partitioned = !!config.partitioned;
            this._scopeId = !!config.scopeId ? ScopeId.from(config.scopeId) : ScopeId.default;
            this._artifacts = config.artifacts.map(_ => ArtifactId.from(_));

            this.on('close', (done: () => void) => {
                this._cancellationSource.cancel();
                done();
            });

            this._server = this.getConfigurationFromNode(config.server);
            this._client = this._server?.clientBuilder
                .withLogging(_ => _.useWinston(w => {
                    w.level = 'debug';
                    w.transports = this._loggerTransport;
                }))
                .withEventStore(es => {
                    es.withEventHandlers(_ => {
                        _.createEventHandler(this._eventHandlerId.value, __ => {
                            __.inScope(this._scopeId.value);
                            if (this._partitioned) {
                                __.partitioned();
                            } else {
                                __.unpartitioned();
                            }
                            for (let n = 0; n < this._artifacts.length; n++) {
                                const artifact = this._artifacts[n];
                                __.handle(artifact.value, this.createHandleEventCallback(n, this._artifacts.length, artifact));
                            }
                        });
                    });
                })
                .withCancellation(this._cancellationSource.cancellation)
                .build();
        }

        createHandleEventCallback(output: number, outputs: number, artifact: ArtifactId): EventHandlerSignature<any> {
            return (event: any, context: EventContext) => new Promise<void>((resolve, reject) => {
                const msgs = new Array(outputs).fill(null);
                msgs[output] = {
                    executionContext: {
                        tenantId: context.executionContext.tenantId.toString(),
                    },
                    context: {
                        sequenceNumber: context.sequenceNumber,
                        eventSourceId: context.eventSourceId.toString(),
                        occured: context.occurred.toJSDate()
                    },
                    payload: event,
                    _handleEventPromise: {
                        resolve,
                        reject,
                    },
                };
                this.send(msgs);
            });
        }
    }
};
