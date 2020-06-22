// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Property } from '../Property';
import { PropertyValue } from '../PropertyValue';
import { EntityType } from '../EntityType';
import { UnknownPropertyInEntity } from '../UnknownPropertyInEntity';

describe('when getting identity for entity with missing property', () => {
    const firstProperty = new Property('firstProperty', 'firstProperty', '', true);
    const secondProperty = new Property('secondProperty', 'secondProperty', '');
    const secondPropertyValue = new PropertyValue(secondProperty, 'second');

    const entityType = new EntityType('', '', firstProperty, secondProperty);

    let result: any = undefined;

    try {
        entityType.getSourceIdFrom(secondPropertyValue);
    } catch (ex) {
        result = ex;
    }

    it('should thrown unknown property in entity', () => result.should.be.instanceOf(UnknownPropertyInEntity));
});
