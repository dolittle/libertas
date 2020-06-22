// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UnidentifiedEntity } from './UnidentifiedEntity';
import { Entity } from './Entity';
import { IUnidentifiedEntitiesToEntitiesConverter } from './IUnidentifiedEntitiesToEntitiesConverter';
import { IIdentityIdentifier } from './IIdentityIdentifier';

/**
 * Represents an implementation of {IUnidentifiedEntitiesToEntitiesConverter}.
 */
export class UnidentifiedEntitiesToEntitiesConverter implements IUnidentifiedEntitiesToEntitiesConverter {

    /**
     * Initializes a new instance of {UnidentifiedEntitiesToEntitiesConverter}.
     * @param {IIdentityIdentifierManager} _entityIdentifierManager Entity identity identifiers
     */
    constructor(private _identityIdentifer: IIdentityIdentifier) {
    }

    /** @inheritdoc */
    async convert(entities: UnidentifiedEntity[]): Promise<Entity[]> {
        const converted: Entity[] = [];

        for (const entity of entities) {
            const eventSourceId = this._identityIdentifer.identify(entity);
            converted.push(new Entity(entity.entityType, eventSourceId, entity.values));
        }

        return converted;
    }
}
