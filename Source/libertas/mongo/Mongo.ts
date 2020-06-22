// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { MongoClient, Db } from 'mongodb';

/**
 * Represents a wrapper for mongo
 */
export class Mongo {

    /**
     * Initializes a new instance of {Mongo}.
     * @param {MongoClient} client Mongo client.
     * @param {Db} database Database used.
     */
    constructor(readonly client: MongoClient, readonly database: Db) {
    }
}
