// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Node } from './Node';
import { NodeProperties, Red } from 'node-red';

export abstract class ConfigurationNode<T extends NodeProperties> extends Node {
    readonly isValid: boolean;

    constructor(config: T) {
        super(config);
        this.isValid = this.validate(config);

        if (!this.isValid) {
            this.status({
                fill: 'red',
                shape: 'ring',
                text: 'Invalid configuration'
            });
        }
    }

    abstract validate (config: T): boolean;
}