// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Collection, Binary } from 'mongodb';
import MUUID from 'uuid-mongodb';
import { MUUIDToGuid } from '../mongo/MUUIDToGuid';

import { Mongo } from '../mongo/Mongo';
import { IIdentityRepository } from './IIdentityRepository';
import { SourceId } from './SourceId';
import { EntityType } from './EntityType';
import { kebabCase } from '../utilities';
import { Guid } from '@dolittle/rudiments';

const EntityIdentitiesPostfix = '-identities';

class Document {
    sourceId!: SourceId;
    id!: Binary;
}

/**
 * Represents an implementation of {IEntityIdentityIdentifierRepository}
 */
export class IdentityRepository implements IIdentityRepository {
    private _collection?: Collection;
    private _all: Document[] = [];

    /**
     * Initializes a new instance of {EntityIdentityIdentifierRepository}.
     * @param {EntityType} _entityType The type of entity.
     * @param {Mongo} _mongo Mongo wrapper.
     */
    constructor(private _entityType: EntityType, private _mongo: Mongo) {
    }

    /** @inheritdoc */
    async initialize(): Promise<void> {
        const collection = this.collection();
        this._all = await collection.find().toArray() as Document[];
    }

    /** @inheritdoc */
    async associate(sourceId: SourceId, id: Guid): Promise<void> {
        await this.insertMapEntry(sourceId, id);
    }

    /** @inheritdoc */
    all(): Map<SourceId, Guid> {
        const identities: Map<SourceId, Guid> = new Map();
        for (const mapEntry of this._all) {
            identities.set(mapEntry.sourceId, MUUIDToGuid(mapEntry.id));
        }
        return identities;
    }

    private collection() {
        if (!this._collection) {
            const collectionName = `${kebabCase(this._entityType.name)}${EntityIdentitiesPostfix}`;
            this._collection = this._mongo.database.collection(collectionName);
        }
        return this._collection;
    }

    private async insertMapEntry(sourceId: SourceId, id: Guid) {
        const mapEntry = {
            sourceId: sourceId,
            id: MUUID.from(id.toString())
        } as Document;

        const collection = await this.collection();
        await collection.insertOne(mapEntry);
    }
}
