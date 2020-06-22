// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Entity } from './Entity';
import { Guid } from '@dolittle/rudiments';

/**
 * Defines repository for working with entities.
 */
export interface IEntityRepository {

    /**
     * Upsert a set of entities.
     * @param entities Entities to upsert.
     */
    upsert(...entities: Entity[]): Promise<void>;

    /**
     * Get entity based on the unique id.
     * @param {Guid} id Unique identifier of the entity.
     * @returns (Entity) The entity for the identifier.
     */
    getById(id: Guid): Promise<Entity>;
}
