// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { Node, registerNodeType } from '../../Node';

module.exports = function (RED: Red) {
    RED.httpAdmin.get('/entities', (req: any, res: any) => {
        res.send('Hello world');
    });

    @registerNodeType(RED, 'entities-sidebar')
    class EntitiesSidebar extends Node {
        constructor(config: NodeProperties) {
            super(config);
        }
    }
};
