// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import * as path from 'path';

import { NodeProperties, Red } from 'node-red';

import { Node } from '../../Node';

import * as express from 'express';

module.exports = function (RED: Red) {

    const uiDir = path.dirname(require.resolve('./ui'));
    const staticBaseDir = path.resolve(uiDir, '../../wwwroot');
    RED.httpAdmin.use('/dolittle', express.static(staticBaseDir));

    class UI extends Node {
        constructor(config: NodeProperties) {
            super(RED);

            this.createNode(config);
        }
    }

    UI.registerType(RED, 'UI');
};