// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Property } from './Property';

/**
 * Represents a value in an entity.
 */
export class PropertyValue {
    value: any;
    previousValue?: any;

    /**
     * Initializes a new instance of {EntityValue}.
     * @param property Property the value is for.
     * @param {*} value Actual value.
     * @param {*} [previousValue] Previous value, if any.
     */
    constructor(readonly property: Property, value: any, previousValue?: any) {
        this.value = value;
        this.previousValue = previousValue;
    }
}
