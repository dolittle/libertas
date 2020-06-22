// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Guid } from '@dolittle/rudiments';
import { IdentityIdentifier } from '../../IdentityIdentifier';
import { EntityType } from '../../EntityType';
import { UnidentifiedEntity } from '../../UnidentifiedEntity';
import sinon from 'sinon';

describe('when asking to identity and it it has no association yet', async () => {
    const identity = '9f924193-706a-466a-977a-2b3a3451b1fa';
    const entityType = new EntityType('', '');

    const repository = {
        associate: sinon.stub(),
        getAll() {
            return new Promise(resolve => {
                const map = new Map();
                resolve(map);
            });
        }
    };

    const entity = new UnidentifiedEntity(entityType);

    const identifier = new IdentityIdentifier(entityType, repository as any);
    const eventSourceId = await identifier.identify(entity);

    it('should return a new guid', () => eventSourceId.should.be.instanceOf(Guid));
    it('should associate identity and event source id', () => repository.associate.calledWith(identity, eventSourceId).should.be.true);
});
