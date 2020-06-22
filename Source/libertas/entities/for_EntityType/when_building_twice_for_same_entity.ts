// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Property } from '../Property';
import { PropertyValue } from '../PropertyValue';
import { EntityType } from '../EntityType';

describe('when getting identity twice for same entity', () => {
    const firstProperty = new Property('firstProperty', 'firstProperty', '');
    const secondProperty = new Property('secondProperty', 'secondProperty', '');
    const firstPropertyValue = new PropertyValue(firstProperty, 'first');
    const secondPropertyValue = new PropertyValue(secondProperty, 'second');

    const entityType = new EntityType('', '', firstProperty, secondProperty);

    const firstIdentity = entityType.getSourceIdFrom(firstPropertyValue, secondPropertyValue);
    const secondIdentity = entityType.getSourceIdFrom(firstPropertyValue, secondPropertyValue);

    it('should return a string for first identity', () => (typeof firstIdentity === 'string').should.be.true);
    it('should return a string for second identity', () => (typeof secondIdentity === 'string').should.be.true);
    it('should return a value for first identity', () => (firstIdentity.length > 0).should.be.true);
    it('should return a value for second identity', () => (secondIdentity.length > 0).should.be.true);
    it('should return same identity', () => firstIdentity.should.equal(secondIdentity));
});
