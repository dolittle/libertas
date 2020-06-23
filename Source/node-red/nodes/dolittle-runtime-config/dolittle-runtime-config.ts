// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { Node } from '../../Node';

export interface DolittleRuntimeConfig {
    tenant: string;
    microservice: string;
    name: string;
    host: string;
    port: number;
}

module.exports = function (RED: Red) {

    class DolittleRuntimeConfig extends Node implements DolittleRuntimeConfig {
        tenant: string = '';
        microservice: string = '';
        name: string = '';
        host: string = '';
        port: number = 0;

        constructor(config: NodeProperties) {
            super(RED);

            const c = config as any;
            this.tenant = c.tenant;
            this.microservice = c.microservice;
            this.name = c.name;
            this.host = c.host;
            this.port = c.port;

            this.createNode(config);
        }
    }

    DolittleRuntimeConfig.registerType(RED, 'dolittle-runtime-config');
};
