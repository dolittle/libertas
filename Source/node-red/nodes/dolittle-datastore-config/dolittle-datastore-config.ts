// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { Node } from '../../Node';

module.exports = function (RED: Red) {

    class DolittleDataStoreConfig extends Node {
        name: string = '';
        host: string = '';
        port: number = 0;

        constructor(config: NodeProperties) {
            super(RED);

            const c = config as any;
            this.name = c.name;
            this.host = c.host;
            this.port = c.port;

            this.createNode(config);

            this.on('input', (msg) => {
                this.send(msg);
            });
        }
    }

    DolittleDataStoreConfig.registerType(RED, 'dolittle-datastore-config');
};
