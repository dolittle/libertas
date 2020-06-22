// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Guid } from '@dolittle/rudiments';
import { UnidentifiedEntity } from './UnidentifiedEntity';
import { IIdentityIdentifier } from './IIdentityIdentifier';
import { EntityType } from './EntityType';
import { IIdentityRepository } from './IIdentityRepository';
import { SourceId } from './SourceId';

/**
 * Represents an implementation of {ICanIdentifyEntities}.
 */
export class IdentityIdentifier implements IIdentityIdentifier {
    private _identities: Map<SourceId, Guid> = new Map();

    /**
     * Initializes a new instance of {EntityIdentityIdentifier}.
     * @param {EntityType} _entityType Type of entity.
     * @param {IIdentityRepository} _repository Entity identity repository.
     */
    constructor(private _entityType: EntityType, private _repository: IIdentityRepository) {
        this._identities = _repository.all();
    }

    /** @inheritdoc */
    identify(entity: UnidentifiedEntity): Guid {
        const identity = entity.entityType.getSourceIdFrom(...entity.values);
        if (this._identities.has(identity)) {
            return this._identities.get(identity) || Guid.empty;
        } else {
            const eventSourceId = Guid.create();
            this._identities.set(identity, eventSourceId);
            this._repository.associate(identity, eventSourceId);
            return eventSourceId;
        }
    }
}
