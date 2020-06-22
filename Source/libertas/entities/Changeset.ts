// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Entity } from './Entity';
import { PropertyValue } from './PropertyValue';

/**
 * Represents a changeset
 */
export class Changeset {
    readonly entity: Entity;
    readonly values: PropertyValue[];

    /**
     * Initializes a new instance of {ChangeSet}.
     * @param {Entity} entity The entity that has changes.
     * @param {PropertyValue[]} values The values representing the changes.
     */
    constructor(entity: Entity, ...values: PropertyValue[]) {
        this.entity = entity;
        this.values = values;
    }

    /**
     * Gets whether or not has changes
     */
    get hasChanges() {
        return this.values.length > 0;
    }

    /**
     * Create a full change set from an instance of en entity.
     * @param {Entity} entity Entity to create from.
     * @returns {Changeset} The changeset representing all values.
     */
    static fullChangeSetFrom(entity: Entity): Changeset {
        return new Changeset(entity, ...entity.values);
    }
}
