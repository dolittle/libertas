// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UnidentifiedEntity } from './UnidentifiedEntity';
import { Entity } from './Entity';

/**
 * Defines a system that is capable of converting from unidentified entities identified entities.
 */
export interface IUnidentifiedEntitiesToEntitiesConverter {

    /**
     * Convert from unidentified entities to identified entities.
     * @param {UnidentifiedEntity[]} entities Unidentified entities.
     * @returns {Entity[]} Identified entities.
     */
    convert(entities: UnidentifiedEntity[]): Promise<Entity[]>;
}
