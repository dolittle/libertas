// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { Node } from '@dolittle/node-red';
import { ClientAPI } from './ClientAPI';


module.exports = function (RED: Red) {

    class InforM3 extends Node {
        private _clientAPI: ClientAPI;

        constructor(config: NodeProperties) {
            super(RED);

            this.createNode(config);

            this._clientAPI = new ClientAPI(RED, config);

            this.on('input', (msg) => {
                this.send([
                    { payload: 'hello' },
                    { payload: 'world' }
                ]);
            });
        }
    }

    InforM3.registerType(RED, 'infor-m3');
};
