// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UnidentifiedEntity } from './UnidentifiedEntity';
import { Guid } from '@dolittle/rudiments';

/**
 * Defines a system that can identify entities.
 */
export interface IIdentityIdentifier {
    /**
     * Identifies an unidentified entity.
     * @param {UnidentifiedEntity} entity Unidentifed entity.
     * @returns {Guid} identify Identity in the form of an event source id.
     */
    identify(entity: UnidentifiedEntity): Guid;
}
