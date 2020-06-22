// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EntityType } from '../entities';
import { EntityTypeInDataSource } from './EntityTypeInDataSource';

/**
 * Defines a data source
 */
export interface IDataSource {
    /**
     * Gets the name of the data source
     */
    readonly name: string;

    /**
     * Gets the entity types the data source supports
     */
    readonly entityTypes: EntityTypeInDataSource[];

    /**
     * Initializes the data source
     * @returns {Promise<void>} Async continuation.
     */
    initialize(): Promise<void>

    /**
     * Add an entity type to the data source.
     * @param {EntityType} type Entity type to add.
     */
    addEntityType(type: EntityType): void;
}
