// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    EntityType,
    IEntityRepository,
    IEntityHashes,
    IChangeTracker,
    ChangeTracker,
    IIdentityRepository,
    IUnidentifiedEntitiesToEntitiesConverter,
    UnidentifiedEntitiesToEntitiesConverter,
    IIdentityIdentifier,
    IdentityIdentifier,
    UnidentifiedEntity
} from '../entities';

/**
 * Represents an entity type in data source
 */
export class EntityTypeInDataSource {
    readonly type: EntityType;
    readonly repository: IEntityRepository;
    readonly hashes: IEntityHashes;
    readonly identityRepository: IIdentityRepository;
    private _identityIdentifier?: IIdentityIdentifier;
    private _unidentifiedEntitiesConverter?: IUnidentifiedEntitiesToEntitiesConverter;
    private _changeTracker?: IChangeTracker;

    /**
     * Initializes a new instance of {EntityTypeInDataSource}.
     * @param {EntityType} type Type of entity.
     * @param {IEntityRepository} repository Entity repository.
     * @param {IEntityHashes} hashes Entity hash repository.
     * @param {IIdentityRepository} identityRepository Identity repository.
     */
    constructor(type: EntityType, repository: IEntityRepository, hashes: IEntityHashes, identityRepository: IIdentityRepository) {
        this.type = type;
        this.repository = repository;
        this.hashes = hashes;
        this.identityRepository = identityRepository;
    }

    /**
     * Gets the change tracker
     */
    get changeTracker(): IChangeTracker | undefined {
        return this._changeTracker;
    }

    /**
     * Handles unidentified entities
     * @param {UnidentifiedEntity[]} unidentifiedEntities Unidentified entities.
     * @returns {Promise<void>} Async continuation.
     */
    async handle(unidentifiedEntities: UnidentifiedEntity[]): Promise<void> {
        const entities = await this._unidentifiedEntitiesConverter?.convert(unidentifiedEntities) || [];
        this._changeTracker?.feed(...entities);
    }

    async initialize(): Promise<void> {
        await this.identityRepository.initialize();
        await this.hashes.initialize();

        this._identityIdentifier = new IdentityIdentifier(this.type, this.identityRepository);
        this._unidentifiedEntitiesConverter = new UnidentifiedEntitiesToEntitiesConverter(this._identityIdentifier);
        this._changeTracker = new ChangeTracker(this.type, this.hashes, this.repository);

        this._changeTracker.added.subscribe(async entity => {
            await this.repository.upsert(entity);
        });

        this._changeTracker.modified.subscribe(async changeSet => {
            await this.repository.upsert(changeSet.entity);
        });
    }
}
