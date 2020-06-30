// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';
import { Node } from '@dolittle/node-red';

export interface InforM3Config {
    name: string;
    endpoint: string;
    username: string;
    password: string;
}

module.exports = function (RED: Red) {

    class InforM3Config extends Node implements InforM3Config {
        name: string = '';
        endpoint: string = '';
        username: string = '';
        password: string = '';

        constructor(config: NodeProperties) {
            super(RED);
            this.createNode(config);

            const c = config as any;
            this.name = c.name;
            const credentials = (this as any).credentials;
            this.endpoint = credentials.endpoint;
            this.username = credentials.username;
            this.password = credentials.password;
        }
    }

    InforM3Config.registerType(RED, 'infor-m3-config', {
        credentials: {
            endpoint: { type: 'text', required: true },
            username: { type: 'text', required: true },
            password: { type: 'password', required: true }
        }
    });
};
