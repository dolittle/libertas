// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Observable } from 'rxjs';
import { Changeset } from './Changeset';
import { Entity } from './Entity';
import { EntityType } from './EntityType';

/**
 * Defines a system for tracking changes to entities.
 */
export interface IChangeTracker {
    readonly entityType: EntityType;
    readonly added: Observable<Entity>;
    readonly modified: Observable<Changeset>;

    feed(...entities: Entity[]): void;
}
