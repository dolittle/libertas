// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EntityType } from './EntityType';

/**
 * Exception that is thrown when an entity is missing identity properties.
 */
export class MissingIdentityProperties extends Error {

    /**
     * Initializes a new instance of {MissingIdentityProperties}.
     * @param {EntityType} entityType Entity type that has missing identity properties.
     */
    constructor(entityType: EntityType) {
        super(`Missing identity properties for '${entityType.name}'`);
    }
}
