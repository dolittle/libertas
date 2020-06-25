"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Node_1 = require("../../Node");
module.exports = function (RED) {
    class ChangeTracker extends Node_1.Node {
        constructor(config) {
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
//# sourceMappingURL=change-tracker.js.map