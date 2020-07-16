// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { Node, registerNodeType } from '../../Node';
import { HttpAuthConfig } from '../http-auth-config/http-auth-config';

module.exports = function (RED: Red) {

    @registerNodeType(RED, 'http-auth-header')
    class HttpAuthHeader extends Node {
        private _authentication?: HttpAuthConfig;

        constructor(config: NodeProperties) {
            super(config);

            const c = config as any;
            this._authentication = RED.nodes.getNode(c.authentication) as any as HttpAuthConfig;

            const combined = `${this._authentication.username}:${this._authentication.password}`;
            const base64 = Buffer.from(combined).toString('base64');

            this.on('input', (msg) => {
                msg.headers = {};
                msg.headers.Authorization = `Basic ${base64}`;
                this.send(msg);
            });
        }
    }
};
