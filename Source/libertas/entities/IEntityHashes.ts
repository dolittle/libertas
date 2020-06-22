// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Entity } from './Entity';

/**
 * Defines a system that tracks entity changes based on the hash of the entity.
 */
export interface IEntityHashes {
    /**
     * Initializes the system
     * @returns Promise<void> Async continuation.
     */
    initialize(): Promise<void>;

    /**
     * Check if an entity exists.
     * @param {Entity} entity Entity to check for.
     * @returns {boolean} true if exists, false if not.
     */
    exists(entity: Entity): boolean;

    /**
     * Get whether or not an entity has changed.
     * @param {Entity} entity Entity to check if has changed.
     * @returns {boolean} true if has changed, false if not.
     */
    hasChanged(entity: Entity): boolean;

    /**
     * Update hash for entity.
     * @param {Entity} entity Entity to update for.
     * @return {Promise<void>} Async continuation.
     */
    update(entity: Entity): Promise<void>;
}
