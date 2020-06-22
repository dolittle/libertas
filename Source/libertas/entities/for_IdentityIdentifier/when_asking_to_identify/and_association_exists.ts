// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Guid } from '@dolittle/rudiments';
import { IdentityIdentifier } from '../../IdentityIdentifier';
import { EntityType } from '../../EntityType';
import { UnidentifiedEntity } from '../../UnidentifiedEntity';
import sinon from 'sinon';

describe('when asking to identity and association exists', async () => {
    const identity = '9f924193-706a-466a-977a-2b3a3451b1fa';
    const identityBuilder = {
        buildFor() {
            return identity;
        }
    };

    const entityType = new EntityType('', '');

    const associatedEventSourceId = Guid.parse('f795a91f-2758-4c02-8060-15226b62f9da');

    const repository = {
        associate: sinon.stub(),
        getAll() {
            return new Promise(resolve => {
                const map = new Map();
                map.set(identity, associatedEventSourceId);
                resolve(map);
            });
        }
    };

    const entity = new UnidentifiedEntity(entityType);

    const identifier = new IdentityIdentifier(entityType, repository as any);
    const eventSourceId = await identifier.identify(entity);

    it('should return associated identifier', () => eventSourceId.should.equal(associatedEventSourceId));
    it('should never associate', () => repository.associate.called.should.be.false);
});
