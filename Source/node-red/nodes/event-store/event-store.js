"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("../../Node");
module.exports = function (RED) {
    class EventStore extends Node_1.Node {
        constructor(config) {
            super(RED);
            this.createNode(config);
            this.server = RED.nodes.getNode(config.server);
            this.on('input', (msg) => {
                this.send(msg);
            });
        }
    }
    EventStore.registerType(RED, 'event-store');
};
//# sourceMappingURL=event-store.js.map