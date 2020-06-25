"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("../../Node");
class credentials {
    constructor() {
        this.username = '';
        this.password = '';
    }
}
module.exports = function (RED) {
    class HttpAuthConfig extends Node_1.Node {
        constructor(config) {
            super(RED);
            this.name = '';
            this.username = '';
            this.password = '';
            this.createNode(config);
            const c = config;
            this.name = c.name;
            this.username = this.credentials.username;
            this.password = this.credentials.password;
            this.on('input', (msg) => {
                this.send(msg);
            });
        }
    }
    HttpAuthConfig.registerType(RED, 'http-auth-config', {
        credentials: {
            username: { type: 'text' },
            password: { type: 'password' }
        }
    });
};
//# sourceMappingURL=http-auth-config.js.map