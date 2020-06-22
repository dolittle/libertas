// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Binary } from 'mongodb';
import MUUID from 'uuid-mongodb';

import { IEntityHashes } from './entities/IEntityHashes';
import { Entity } from './Entity';
import { Mongo } from '../mongo/Mongo';
import { EntityType } from './EntityType';
import { kebabCase } from '../utilities/kebabCase';
import { MUUIDToGuid } from '../mongo/MUUIDToGuid';

const EntityCollectionPostfix = '-hashes';

class Document {
    id!: Binary;
    hash!: string;
}

/**
 * Represents an implementation of {IEntityHashes}.
 */
export class EntityHashes implements IEntityHashes {
    private _map: Map<string, string> = new Map();

    /**
     * Initializes a new instance of {EntityHashes}.
     * @param {EntityType} _entityType The type of entity.
     * @param {Mongo} _mongo Mong wrapper.
     */
    constructor(private _entityType: EntityType, private _mongo: Mongo) {
    }

    /** @inheritdoc */
    async initialize(): Promise<void> {
        const all = await this.collection().find().toArray() as Document[];
        for (const document of all ) {

            this._map.set((MUUIDToGuid(document.id)).toString(), document.hash);
        }
    }

    /** @inheritdoc */
    exists(entity: Entity): boolean {
        return this._map.has(entity.id.toString());
    }

    /** @inheritdoc */
    hasChanged(entity: Entity): boolean {
        const hash = entity.getHashCode();
        return this._map.get(entity.id.toString()) !== hash;
    }

    /** @inheritdoc */
    async update(entity: Entity): Promise<void> {
        const hash = entity.getHashCode();
        this._map.set(entity.id.toString(), hash);

        const document = {
            id: MUUID.from(entity.id.toString()),
            hash: hash
        } as Document;

        await this.collection().updateOne({ id: document.id}, { $set: document }, { upsert: true });
    }

    private collection() {
        const collectionName = `${kebabCase(this._entityType.name)}${EntityCollectionPostfix}`;
        return this._mongo.database.collection(collectionName);
    }
}
