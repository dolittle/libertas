// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red, NodeId } from 'node-red';

import { Node, registerNodeType } from '../../Node';

import { Client } from '@dolittle/sdk';
import { FilterId, FilterEventCallback, PartitionedFilterEventCallback, PartitionedFilterResult } from '@dolittle/sdk.events.filtering';
import { EventContext, ScopeId } from '@dolittle/sdk.events';
import { CancellationSource } from '@dolittle/sdk.resilience';

import { DolittleRuntimeConfig } from '../dolittle-runtime-config/dolittle-runtime-config';

interface EventFilterProperties extends NodeProperties {
    server: string;
    filterId: string;
    filterType: string;
    scopeId: string;
}

enum FilterType {
    Unpartitioned = 'unpartitioned',
    Partitioned = 'partitioned',
    Public = 'public',
}

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'event-filter')
    class EventFilter extends Node {
        private _cancellationSource: CancellationSource;
        private _client?: Client;
        private _server?: DolittleRuntimeConfig;

        private _filterId: FilterId;
        private _filterType: FilterType;
        private _scopeId: ScopeId;

        constructor(config: EventFilterProperties) {
            super(config);

            this._cancellationSource = new CancellationSource();

            this._filterId = FilterId.from(config.filterId);
            this._scopeId = config.scopeId ? ScopeId.from(config.scopeId) : ScopeId.default;
            switch (config.filterType) {
                case 'partitioned':
                    this._filterType = FilterType.Partitioned;
                    break;
                case 'public':
                    this._filterType = FilterType.Public;
                    break;
                case 'unpartitioned':
                default:
                    this._filterType = FilterType.Unpartitioned;
            }

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
                    es.withFilters(f => {
                        if (this._filterType === FilterType.Public) {
                            f.createPublicFilter(this._filterId.value, __ => {
                                __.handle(this.createPartitionedFilterEventCallback());
                            });
                        } else {
                            f.createPrivateFilter(this._filterId.value, __ => {
                                const ___ = __.inScope(this._scopeId.value);
                                if (this._filterType === FilterType.Partitioned) {
                                    ___.partitioned().handle(this.createPartitionedFilterEventCallback());
                                } else {
                                    ___.handle(this.createFilterEventCallback());
                                }
                            });
                        }
                    });
                }).withCancellation(this._cancellationSource.cancellation).build();
        }

        createFilterEventCallback(): FilterEventCallback {
            return (event: any, context: EventContext) => new Promise<boolean>((resolve, reject) => {
                this.send({
                    context,
                    payload: event,
                    _filterEventPromise: {
                        partitioned: false,
                        resolve,
                        reject,
                    },
                });
            });
        }

        createPartitionedFilterEventCallback(): PartitionedFilterEventCallback {
            return (event: any, context: EventContext) => new Promise<PartitionedFilterResult>((resolve, reject) => {
                this.send({
                    executionContext: {
                        tenantId: context.executionContext.tenantId.toString(),
                    },
                    context: {
                        sequenceNumber: context.sequenceNumber,
                        eventSourceId: context.eventSourceId.toString(),
                        occured: context.occurred.toJSDate()
                    },
                    payload: event,
                    _filterEventPromise: {
                        partitioned: true,
                        resolve,
                        reject,
                    },
                });
            });
        }
    }
};
