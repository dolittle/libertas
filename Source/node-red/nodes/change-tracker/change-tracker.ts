// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { Node } from '../../Node';

module.exports = function (RED: Red) {

    class ChangeTracker extends Node {
        constructor(config: NodeProperties) {
            super(RED);

            this.createNode(config);

            this.context().test = 'Forty two';

            this.on('input', (msg) => {
                //this.send(msg);

                this.send([
                    { payload: 'hello' },
                    { payload: 'world' }
                ]);
            });
        }
    }

    ChangeTracker.registerType(RED, 'change-tracker');
};
