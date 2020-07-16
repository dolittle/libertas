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

interface EventFilterProperties extends NodeProperties {
    filterId: string;
    filterType: string;
    scopeId: string;
}

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'event-filter')
    class EventFilter extends Node {
        private _client?: Client;
        private _server?: DolittleRuntimeConfig;

        constructor(config: EventFilterProperties) {
            super(config);

            //this._server = this.getConfigurationFromNode(config.server);
            //this._client = this._server?.clientBuilder.build();
        }
    }
};
