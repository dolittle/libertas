// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';
import { ConfigurationNode, registerNodeType } from '@dolittle/node-red';

export interface InforM3Config {
    readonly endpoint: string;
    readonly username: string;
    readonly password: string;
}

interface InforM3ConfigProperties extends NodeProperties {
    readonly credentials: {
        readonly endpoint: string;
        readonly username: string;
        readonly password: string;
    };
}

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'infor-m3-config', {
        credentials: {
            endpoint: { type: 'text', required: true },
            username: { type: 'text', required: true },
            password: { type: 'password', required: true }
        }
    })
    class InforM3Config extends ConfigurationNode<InforM3ConfigProperties> implements InforM3Config {
        readonly endpoint: string = '';
        readonly username: string = '';
        readonly password: string = '';

        constructor(config: InforM3ConfigProperties) {
            super(config);

            this.endpoint = config.credentials.endpoint;
            this.username = config.credentials.username;
            this.password = config.credentials.password;
        }

        validate(config: InforM3ConfigProperties): boolean {
            return !!config.credentials.endpoint && !!config.credentials.username && !!config.credentials.password;
        }
    }
};
