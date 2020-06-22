// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Collection } from 'mongodb';
import MUUID from 'uuid-mongodb';

import { Mongo } from '../mongo/Mongo';
import { IEntityRepository } from './IEntityRepository';
import { Entity } from './Entity';
import { EntityType } from './EntityType';
import { kebabCase } from '../utilities/kebabCase';
import { MUUIDToGuid } from '../mongo/MUUIDToGuid';
import { Guid } from '@dolittle/rudiments';

/**
 * Represents an implementation of {IEntityRepository}.
 */
export class EntityRepository implements IEntityRepository {

    /**
     * Initializes a new instance of {EntityRepository}.
     * @param {Mongo} _mongo Mongo wrapper.
     */
    constructor(private _entityType: EntityType, private _mongo: Mongo) {
    }

    /** @inheritdoc */
    async upsert(...entities: Entity[]) {
        const collection: Collection = this.collection();

        for (const entity of entities) {
            const entityAsObject = { ...entity.toObject(), ...{ id: MUUID.from(entity.id.toString()) } };
            await collection.updateOne({ id: entityAsObject.id }, { $set: entityAsObject }, { upsert: true });
        }
    }

    /** @inheritdoc */
    async getById(id: Guid): Promise<Entity> {
        const collection: Collection = this.collection();
        const query = {
            id: MUUID.from(id.toString())
        };
        const entityAsObject = await collection.findOne(query);
        entityAsObject.id = MUUIDToGuid(entityAsObject.id);
        const entity = Entity.fromObject(this._entityType, entityAsObject);
        return entity;
    }

    private collection() {
        const collectionName = `${kebabCase(this._entityType.name)}`;
        return this._mongo.database.collection(collectionName);
    }
}
