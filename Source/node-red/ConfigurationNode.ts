// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Node } from './Node';
import { NodeProperties, Red } from 'node-red';

export abstract class ConfigurationNode<Tproperties extends NodeProperties, Tcredentials> extends Node {
    readonly isValid: boolean;
    readonly credentials?: Tcredentials;

    constructor(config: Tproperties) {
        super(config);
        this.credentials = (this as any).credentials as Tcredentials;
        this.isValid = this.validate(config, this.credentials);

        if (!this.isValid) {
            this.status({
                fill: 'red',
                shape: 'ring',
                text: 'Invalid configuration'
            });
        }
    }

    abstract validate (config: Tproperties, credentials?: Tcredentials): boolean;
}