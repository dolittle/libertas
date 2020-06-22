// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EntityType, EntityRepository, EntityHashes, IdentityRepository } from '../entities';
import { IDataSource } from './IDataSource';
import { Mongo } from '../mongo';
import { EntityTypeInDataSource } from './EntityTypeInDataSource';

/**
 * Represents an implementation of {IDataSource}
 */
export class DataSource implements IDataSource {

    /** @inheritdoc */
    readonly name: string;

    /** @inheritdoc */
    readonly entityTypes: EntityTypeInDataSource[] = [];

    /**
     * Initializes a new instance of {DataSource}
     * @param {string} name Name of the data source
     */
    constructor(name: string, private _mongo: Mongo) {
        this.name = name;
    }

    /** @inheritdoc */
    async initialize(): Promise<void> {
        for (const entityType of this.entityTypes) {
            await entityType.initialize();
        }
    }

    /** @inheritdoc */
    addEntityType(type: EntityType) {
        this.entityTypes.push(new EntityTypeInDataSource(
            type,
            new EntityRepository(type, this._mongo),
            new EntityHashes(type, this._mongo),
            new IdentityRepository(type, this._mongo)
        ));
    }
}
