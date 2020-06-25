"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("../../Node");
module.exports = function (RED) {
    class HttpAuthHeader extends Node_1.Node {
        constructor(config) {
            super(RED);
            this.createNode(config);
            const c = config;
            this._authentication = RED.nodes.getNode(c.authentication);
            const combined = `${this._authentication.username}:${this._authentication.password}`;
            const base64 = Buffer.from(combined).toString('base64');
            this.on('input', (msg) => {
                msg.headers = {};
                msg.headers.Authorization = `Basic ${base64}`;
                this.send(msg);
            });
        }
    }
    HttpAuthHeader.registerType(RED, 'http-auth-header');
};
//# sourceMappingURL=http-auth-header.js.map