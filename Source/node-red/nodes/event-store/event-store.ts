import { NodeProperties, Red } from 'node-red';

import { Node } from '../../Node';

module.exports = function (RED: Red) {

    class EventStore extends Node {
        server?: any;

        constructor(config: NodeProperties) {
            super(RED);

            this.createNode(config);

            this.server = RED.nodes.getNode((config as any).server);

            this.on('input', (msg) => {
                this.send(msg);
            });
        }
    }

    EventStore.registerType(RED, 'event-store');
};
