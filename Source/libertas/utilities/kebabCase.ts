// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Borrowed from: https://github.com/magnusdanielson/aureactwrapper
export function kebabCase(input: string): string {
    // Matches all places where a two upper case chars followed by a lower case char are and split them with an hyphen
    return input
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
        .toLowerCase();
}
