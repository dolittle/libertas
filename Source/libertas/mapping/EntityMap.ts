// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EntityType } from '../entities';
import { PropertyMap } from './PropertyMap';

export class EntityMap {
    constructor(readonly source: EntityType, readonly destination: EntityType, readonly propertyMaps: PropertyMap[]) {
    }
}
