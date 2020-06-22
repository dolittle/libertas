// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Guid } from '@dolittle/rudiments';
import { Binary } from 'mongodb';

export function MUUIDToGuid(binary: Binary) {
    const bytes = [
        binary.buffer[3], binary.buffer[2], binary.buffer[1], binary.buffer[0],
        binary.buffer[5], binary.buffer[4],
        binary.buffer[7], binary.buffer[6],
        binary.buffer[8], binary.buffer[9],
        binary.buffer[10], binary.buffer[11], binary.buffer[12], binary.buffer[13], binary.buffer[14], binary.buffer[15]
    ];
    return new Guid(bytes);
}
