// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import hash from 'object-hash';
import { Property } from './Property';
import { UnknownPropertyInEntity } from './UnknownPropertyInEntity';
import { MissingIdentityProperties } from './MissingIdentityProperties';
import { PropertyValue } from './PropertyValue';
import { SourceId } from './SourceId';

/**
 * Represents the definition of an entity.
 */
export class EntityType {
    readonly properties: Property[];
    readonly identityProperties: Property[];

    static unknown: EntityType = new EntityType('Unknown', 'Unknown', Property.unknown);

    /**
     * Initializes a new instance of {EntityType}.
     * @param {string} name Name of entity.
     * @param {...Property[]} properties Property definitions for the entity.
     */
    constructor(readonly name: string, readonly description: string, ...properties: Property[]) {
        this.name = name;
        this.description = description;
        this.properties = properties;
        this.identityProperties = this.properties.filter((_: Property) => _.identity);
        this.throwIfMissingIdentityProperties();
    }

    /**
     * Check if entity has a specific property.
     * @param {string} name Name of property.
     */
    hasProperty(name: string): boolean {
        return this.properties.find(_ => _.name === name) !== undefined;
    }

    /**
     * Get a specific property by name.
     * @param {string} name Name of property.
     * @throws {UnknownPropertyInEntity} When property is unknown.
     */
    getPropertyByName(name: string): Property {
        const property = this.properties.find(_ => _.name === name);
        if (!property) {
            throw new UnknownPropertyInEntity(name, this);
        }
        return property;
    }

    /**
     * Gets identity from given values.
     * @param {...PropertyValue[]} values Values to get the identity from.
     * @returns {SourceId} Identity from given values.
     */
    getSourceIdFrom(...values: PropertyValue[]): SourceId {
        let identifierString = '';

        for (const property of this.identityProperties) {
            const value = values.find(_ => _.property.name === property.name);
            if (!value) {
                throw new UnknownPropertyInEntity(property.name, this);
            }
            identifierString += value.value.toString();
        }
        return hash(identifierString);
    }


    private throwIfMissingIdentityProperties() {
        if (this.identityProperties.length === 0) {
            throw new MissingIdentityProperties(this);
        }
    }
}

