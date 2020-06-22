import { NodeProperties, Red } from 'node-red';

import { Node } from '../../Node';

export interface DolittleRuntimeConfig {
    name: string;
    host: string;
    port: number;
}

module.exports = function (RED: Red) {

    class DolittleRuntimeConfig extends Node implements DolittleRuntimeConfig {
        name: string = '';
        host: string = '';
        port: number = 0;

        constructor(config: NodeProperties) {
            super(RED);

            const c = config as any;
            this.name = c.name;
            this.host = c.host;
            this.port = c.port;

            this.createNode(config);

            this.on('input', (msg) => {
                this.send(msg);
            });
        }
    }

    DolittleRuntimeConfig.registerType(RED, 'dolittle-runtime-config');
};
