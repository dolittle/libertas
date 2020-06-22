// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Represents a property in an entity.
 */
export class Property {
    readonly name: string;
    readonly targetName: string;
    readonly description: string;
    readonly identity: boolean;

    static unknown: Property = new Property('unknown', 'unknown', 'unknown', true);

    /**
     * Initializes a new instance of {Property}.
     * @param {string} name Name of the property.
     * @param {string} targetName Target name of the property when typically converted into other target.
     * @param {string} description Description of the property.
     * @param {boolean} identity Whether or not the property is part of the source identity.
     */
    constructor(name: string, targetName: string, description: string, identity: boolean = false) {
        this.name = name;
        this.targetName = targetName;
        this.description = description;
        this.identity = identity;
    }
}
