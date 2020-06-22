import { NodeProperties, Red } from 'node-red';

import { Node } from '../../Node';

class credentials {
    username: string = '';
    password: string = '';
}

export interface HttpAuthConfig {
    name: string;
    username: string;
    password: string;
}

module.exports = function (RED: Red) {

    class HttpAuthConfig extends Node implements HttpAuthConfig {
        name: string = '';
        username: string = '';
        password: string = '';

        constructor(config: NodeProperties) {
            super(RED);
            this.createNode(config);

            const c = config as any;
            this.name = c.name;
            this.username = (this as any).credentials.username;
            this.password = (this as any).credentials.password;


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
