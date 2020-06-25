// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { Node } from '../../Node';

import { Client } from '@dolittle/sdk';
import { DolittleRuntimeConfig } from '../dolittle-runtime-config/dolittle-runtime-config';
import { Guid } from '@dolittle/rudiments';

module.exports = function (RED: Red) {

    class EventStore extends Node {
        server?: DolittleRuntimeConfig;

        private _client?: Client;

        constructor(config: NodeProperties) {
            super(RED);

            this.createNode(config);

            this.server = RED.nodes.getNode((config as any).server) as any as DolittleRuntimeConfig;
            if (this.server) {
                this._client = Client.for(this.server.microservice).build();
            }

            this.on('input', (msg) => {

                if (this._client) {
                    if (msg.payload &&
                        msg.payload.artifact &&
                        msg.payload.eventSourceId) {

                        this._client.executionContextManager.currentFor(this.server?.tenant || Guid.empty);
                        if (msg.payload.public) {
                            this._client.eventStore.commitPublic(msg.payload.content, msg.payload.eventSourceId, msg.payload.artifact);
                        } else {
                            this._client.eventStore.commit(msg.content, msg.payload.eventSourceId, msg.payload.artifact);
                        }
                    }
                }
            });
        }
    }

    EventStore.registerType(RED, 'event-store');
};
