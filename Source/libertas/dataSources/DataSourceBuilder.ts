// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DataSource } from './DataSource';
import { EntityType } from '../entities';
import { Mongo } from '../mongo';
import { IDataSource } from './IDataSource';

export type DataSourceBuilderCallback = (builder: DataSourceBuilder) => void;

export class DataSourceBuilder {
    private _entityTypes: EntityType[] = [];

    constructor(readonly name: string) {
    }

    build(mongo: Mongo): IDataSource {
        const dataSource = new DataSource(this.name, mongo);
        this._entityTypes.forEach(type => dataSource.addEntityType(type));
        return dataSource;
    }
}
