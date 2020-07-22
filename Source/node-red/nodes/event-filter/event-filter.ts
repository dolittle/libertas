// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red, NodeId } from 'node-red';

import { Node, registerNodeType } from '../../Node';

import { Guid } from '@dolittle/rudiments';
import { Client } from '@dolittle/sdk';
import { Artifact, ArtifactId } from '@dolittle/sdk.artifacts';
import { FilterId, FilterEventCallback, PartitionedFilterEventCallback, PartitionedFilterResult } from '@dolittle/sdk.events.filtering';
import { ScopeId } from '@dolittle/sdk.events.handling';
import { CancellationSource } from '@dolittle/sdk.resilience';

import { DolittleRuntimeConfig } from '../dolittle-runtime-config/dolittle-runtime-config';
import { EventContext } from '@dolittle/sdk.events';

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

            this._filterId = Guid.as(config.filterId);
            this._scopeId = config.scopeId ? Guid.as(config.scopeId) : Guid.empty;
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
                .configureLogging(_ => {
                    _.level = 'debug';
                    _.transports = this._loggerTransport;
                })
                .withFilters(_ => {
                _.for(this._filterId, __ => {
                    if (this._filterType === FilterType.Public) {
                        __.public().handle(this.createPartitionedFilterEventCallback());
                    } else {
                        const ___ = __.private().inScope(this._scopeId);
                        if (this._filterType === FilterType.Partitioned) {
                            ___.partitioned().handle(this.createPartitionedFilterEventCallback());
                        } else {
                            ___.handle(this.createFilterEventCallback());
                        }
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
                    context,
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
