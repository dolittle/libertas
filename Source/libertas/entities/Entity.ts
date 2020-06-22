// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import hash from 'object-hash';
import { PropertyValue } from './PropertyValue';
import { Property } from './Property';
import { EntityType } from './EntityType';
import { UnknownPropertyInEntity } from './UnknownPropertyInEntity';
import { EntityAsObject } from './EntityAsObject';
import { SourceId } from './SourceId';
import { Guid } from '@dolittle/rudiments';

/**
 * Represents an entity coming from a source.
 */
export class Entity {
    readonly sourceId: SourceId;

    /**
     * Initializes a new instance of {Entity}.
     * @param {EntityType} entityType Type of entity.
     * @param {Guid} id The unique identity for the entity.
     * @param {PropertyValue[]} values All the values on the entity
     */
    constructor(readonly entityType: EntityType, readonly id: Guid, readonly values: PropertyValue[]) {
        this.entityType = entityType;
        this.id = id;
        this.values = values;
        this.sourceId = this.entityType.getSourceIdFrom(...values);
    }

    /**
     * Get a value for a specific property.
     * @param {Property} property property to get value for.
     * @returns {PropertyValue}
     */
    getValueFor(property: Property): PropertyValue {
        const value = this.values.find(_ => _.property.name === property.name);
        if (!value) {
            throw new UnknownPropertyInEntity(property.name, this.entityType);
        }
        return value;
    }

    /**
     * Convert an entity to a plain old JS object.
     * @returns {EntityAsObject}
     */
    toObject(): EntityAsObject {
        const object: any = {};

        for (const value of this.values) {
            object[value.property.targetName] = value.value;
        }
        object.id = this.id;
        return object;
    }

    /**
     * Converts from object to entity
     * @param {EntityType} entityType Type of entity.
     * @param {*} object Object instance.
     * @returns {Entity} Entity instance.
     */
    static fromObject(entityType: EntityType, object: any): Entity {
        const values: PropertyValue[] = [];
        for (const property of entityType.properties) {
            values.push(new PropertyValue(property, object[property.targetName]));
        }
        const entity = new Entity(entityType, object.id, values);
        return entity;
    }

    /**
     * Get the hash of the entity.
     */
    getHashCode(): string {
        return hash(this.toObject());
    }
}
