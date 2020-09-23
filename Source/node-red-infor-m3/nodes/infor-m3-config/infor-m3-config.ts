// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';
import { ConfigurationNode, registerNodeType } from '@dolittle/node-red';

export interface InforM3Config {
    readonly endpoint: string;
    readonly username: string;
    readonly password: string;
}

interface InforM3Credentials {
    readonly endpoint: string;
    readonly username: string;
    readonly password: string;
}

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'infor-m3-config', {
        credentials: {
            endpoint: { type: 'text', required: true },
            username: { type: 'text', required: true },
            password: { type: 'password', required: true }
        }
    })
    class InforM3Config extends ConfigurationNode<NodeProperties, InforM3Credentials> implements InforM3Config {
        readonly endpoint: string = '';
        readonly username: string = '';
        readonly password: string = '';

        constructor(config: NodeProperties) {
            super(config);

            if (this.credentials) {
                this.endpoint = this.credentials.endpoint;
                this.username = this.credentials.username;
                this.password = this.credentials.password;
            }
        }

        validate(config: NodeProperties, credentials?: InforM3Credentials): boolean {
            return !!credentials && !!credentials.endpoint && !!credentials.username && !!credentials.password;
        }
    }
};
