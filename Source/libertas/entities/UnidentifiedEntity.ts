// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValue } from './PropertyValue';
import { EntityType } from './EntityType';

/**
 * Represents an unidentified entity.
 */
export class UnidentifiedEntity {

    /**
     * Gets the type of entity.
     */
    readonly entityType: EntityType;

    /**
     * Gets the values on the entity.
     */
    readonly values: PropertyValue[];

    /**
     * Creates an instance of unidentified entity.
     * @param {EntityType} entityType Type of entity
     * @param {...PropertyValue[]} values Values for the entity.
     */
    constructor(entityType: EntityType, ...values: PropertyValue[]) {
        this.entityType = entityType;
        this.values = values;
    }
}
