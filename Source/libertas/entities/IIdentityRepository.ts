// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SourceId } from './SourceId';
import { Guid } from '@dolittle/rudiments';

/**
 * Defines the repository for working with entity identity identifiers.
 */
export interface IIdentityRepository {

    /**
     * Initialize
     * @returns {Promise<void>} Async continuation.
     */
    initialize(): Promise<void>;

    /**
     * Associate an entity identity with an event source identifier.
     * @param sourceId Entity identity to associate.
     * @param id UniqueId to associate with
     */
    associate(sourceId: SourceId, id: Guid): Promise<void>;

    /**
     * Get all associations.
     * @returns {Promise<Map<SourceId, Guid>>} All associations.
     */
    all(): Map<SourceId, Guid>;
}
