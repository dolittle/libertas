// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { MicroserviceId } from '@dolittle/sdk.execution';

import { registerNodeType } from '../../Node';
import { ConfigurationNode } from '../../ConfigurationNode';
import { ClientBuilder, Client } from '@dolittle/sdk';

export interface DolittleRuntimeConfig {
    readonly microservice: MicroserviceId;
    readonly host: string;
    readonly port: number;

    readonly clientBuilder: ClientBuilder;
}

interface DolittleRuntimeProperties extends NodeProperties {
    readonly microservice: string;
    readonly host: string;
    readonly port: number;
}

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'dolittle-runtime-config')
    class DolittleRuntimeConfig extends ConfigurationNode<DolittleRuntimeProperties, void> implements DolittleRuntimeConfig {
        readonly microservice: MicroserviceId = MicroserviceId.notApplicable;
        readonly host: string = '';
        readonly port: number = 0;

        constructor(config: DolittleRuntimeProperties) {
            super(config);

            this.microservice = MicroserviceId.from(config.microservice);
            this.host = config.host;
            this.port = config.port;
        }

        validate(config: DolittleRuntimeProperties): boolean {
            // TODO: Should validate GUID here
            return config.port > 1000;
        }

        get clientBuilder(): ClientBuilder {
            return Client.forMicroservice(this.microservice).withRuntimeOn(this.host, this.port);
        }
    }
};
