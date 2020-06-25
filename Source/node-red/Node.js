"use strict";
// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
class Node {
    constructor(RED) {
        this.red = RED;
    }
    createNode(config) {
        this.red.nodes.createNode(this, config);
    }
    static registerType(RED, type, opts) {
        RED.nodes.registerType(type, this.prototype.constructor, opts);
    }
}
exports.Node = Node;
//# sourceMappingURL=Node.js.map