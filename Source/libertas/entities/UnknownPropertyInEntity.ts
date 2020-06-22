// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EntityType } from './EntityType';

/**
 * Exception that is thrown when a field is unknown in an entity.
 */
export class UnknownPropertyInEntity extends Error {

    /**
     * Initializes a new instance of {UnknownFieldInEntity}.
     * @param {string} fieldName Name of field that is unknown.
     * @param {EntityType} entityType Type of entity.
     */
    constructor(fieldName: string, entityType: EntityType) {
        super(`Field '${fieldName}' is unknown on entity '${entityType.name}'`);
    }
}
