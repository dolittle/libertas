// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Observable, Subject, from } from 'rxjs';
import { filter, flatMap, map } from 'rxjs/operators';
import { Changeset } from './Changeset';
import { Entity } from './Entity';
import { EntityType } from './EntityType';
import { IEntityHashes } from './entities/IEntityHashes';
import { IEntityRepository } from './IEntityRepository';
import { PropertyValue } from './PropertyValue';
import { IChangeTracker } from './IChangeTracker';

class EntityWithDetails {
    entity!: Entity;
    exists!: boolean;
}

export class ChangeTracker implements IChangeTracker {
    private _entities: Subject<EntityWithDetails> = new Subject<EntityWithDetails>();
    readonly entityType: EntityType;
    readonly added: Observable<Entity>;
    readonly modified: Observable<Changeset>;

    constructor(entityType: EntityType, private _hashes: IEntityHashes, private _repository: IEntityRepository) {
        this.entityType = entityType;

        this.added = this._entities.pipe(
            filter(_ => !_.exists),
            map(_ => _.entity));

        this.modified = this._entities.pipe(
            filter(_ => _.exists),
            filter(_ => _hashes.hasChanged(_.entity)),
            flatMap(async (_) => this.createChangeSetFrom(_.entity)),
            filter(_ => _.hasChanges));

        this.added.subscribe(async _ => _hashes.update(_));
        this.modified.subscribe(_ => _hashes.update(_.entity));
    }

    feed(...entities: Entity[]): void {
        for (const entity of entities) {
            this._entities.next({ entity, exists: this._hashes.exists(entity) });
        }
    }

    private async createChangeSetFrom(newEntity: Entity): Promise<Changeset> {
        const existingEntity = await this._repository.getById(newEntity.id);
        const changes: PropertyValue[] = [];
        for (const property of this.entityType.properties) {
            const existingValue = existingEntity.getValueFor(property);
            const newValue = newEntity.getValueFor(property);
            if (newValue.value !== existingValue.value) {
                changes.push(new PropertyValue(property, newValue.value, existingValue.value));
            }
        }
        return new Changeset(newEntity, ...changes);
    }
}
