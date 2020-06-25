"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("../../Node");
module.exports = function (RED) {
    class DolittleDataStoreConfig extends Node_1.Node {
        constructor(config) {
            super(RED);
            this.name = '';
            this.host = '';
            this.port = 0;
            const c = config;
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
//# sourceMappingURL=dolittle-datastore-config.js.map