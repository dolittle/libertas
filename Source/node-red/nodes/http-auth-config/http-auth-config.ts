// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { Node, registerNodeType } from '../../Node';

export interface HttpAuthConfig {
    name: string;
    username: string;
    password: string;
}

module.exports = function (RED: Red) {

    @registerNodeType(RED, 'http-auth-config', {
        credentials: {
            username: { type: 'text' },
            password: { type: 'password' }
        }
    })
    class HttpAuthConfig extends Node implements HttpAuthConfig {
        name: string = '';
        username: string = '';
        password: string = '';

        constructor(config: NodeProperties) {
            super(config);

            const c = config as any;
            this.name = c.name;
            this.username = (this as any).credentials.username;
            this.password = (this as any).credentials.password;


            this.on('input', (msg) => {
                this.send(msg);
            });
        }
    }
};
