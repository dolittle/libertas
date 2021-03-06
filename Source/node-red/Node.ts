// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Node as NRNode, NodeProperties, Red, NodeId } from 'node-red';
import { Logger, createLogger } from 'winston';
import Transport from 'winston-transport';

import { NodeLogTransport } from './NodeLogTransport';

export abstract class Node {
    private readonly _red: Red;
    private readonly _config: NodeProperties;

    protected readonly _loggerTransport: Transport;
    protected readonly _logger: Logger;

    protected constructor(config: NodeProperties) {
        this._red = Object.getPrototypeOf(this).RED;
        this._config = config;

        this._loggerTransport = new NodeLogTransport(this);
        this._logger = createLogger({
            transports: this._loggerTransport,
        });

        this.name = config.name;

        this.createNode();
    }

    public getConfigurationFromNode<T>(id: NodeId): T | undefined {
        const node = this._red.nodes.getNode(id);
        if (!!node) {
            return node as unknown as T;
        } else {
            return undefined;
        }
    }

    private createNode(): void {
        this._red.nodes.createNode(this, this._config);
    }
}

export interface Node extends NRNode {
}

export function registerNodeType(RED: Red, type: string, options?: any) {
    return function (target: any) {
        target.prototype.RED = RED;
        RED.nodes.registerType(type, target.prototype.constructor, options);
    };
}