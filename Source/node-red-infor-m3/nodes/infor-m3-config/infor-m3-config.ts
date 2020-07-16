// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';
import { Node, registerNodeType } from '@dolittle/node-red';

export interface InforM3Config {
    name: string;
    endpoint: string;
    username: string;
    password: string;
}

module.exports = function (RED: Red) {

    @registerNodeType(RED, 'infor-m3-config', {
        credentials: {
            endpoint: { type: 'text', required: true },
            username: { type: 'text', required: true },
            password: { type: 'password', required: true }
        }
    })
    class InforM3Config extends Node implements InforM3Config {
        name: string = '';
        endpoint: string = '';
        username: string = '';
        password: string = '';

        constructor(config: NodeProperties) {
            super(config);

            const c = config as any;
            this.name = c.name;
            const credentials = (this as any).credentials;
            this.endpoint = credentials.endpoint;
            this.username = credentials.username;
            this.password = credentials.password;
        }
    }
};
