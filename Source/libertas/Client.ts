// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Mongo } from './mongo';
import { MongoClient } from 'mongodb';
import { DataSourceBuilder, DataSourceBuilderCallback } from './dataSources/DataSourceBuilder';
import { IDataSource } from './dataSources';

/**
 * Represents the client - the entry for an integration connector
 */
export class Client {
    readonly dataSources: IDataSource[];

    /**
     * Initializes a new instance of {Client}.
     * @param {Mongo} _mongo Mongo wrapper.
     * @param {IDataSource[]} dataSources Data sources for the client.
     */
    constructor(private _mongo: Mongo, dataSources: IDataSource[]) {
        this.dataSources = dataSources;
    }

    /**
     * Initializes the client
     * @returns {Promise<void>} Async continuation.
     */
    async initialize(): Promise<void> {
        for (const dataSource of this.dataSources) {
            await dataSource.initialize();
        }
    }

    /**
     * Start configuring the client
     * @returns {ClientBuilder} The builder to build the client with
     */
    static configure(): ClientBuilder {
        const builder = new ClientBuilder();
        return builder;
    }
}

/**
 * Represents a builder for {Client}
 */
export class ClientBuilder {
    private _host: string = 'localhost';
    private _port: number = 27017;
    private _database: string = 'integration';
    private _dataSources: DataSourceBuilder[] = [];

    constructor() {
    }

    /**
     * Uses mongo for storing state for the connector.
     * @param {string} [host] Optional host name - default is 'localhost'.
     * @param {string} [port] Optional port - default is 27017.
     * @param {string} [database] Optional database name - default is 'integration'.
     * @returns {ClientBuilder} Builder for continuing configuration.
     */
    useMongo(host: string = 'localhost', port: number = 27017, database: string = 'integration'): ClientBuilder {
        this._host = host;
        this._port = port;
        this._database = database;
        return this;
    }

    /**
     * Configures a data source for the connector.
     * @param {string} name Name of the data source
     * @param {DataSourceBuilderCallback} callback Callback for configuring the data source.
     * @returns {ClientBuilder} Builder for continuing configuration.
     */
    withDataSource(name: string, callback: DataSourceBuilderCallback): ClientBuilder {
        const dataSourceBuilder = new DataSourceBuilder(name);
        callback(dataSourceBuilder);
        this._dataSources.push(dataSourceBuilder);
        return this;
    }

    /**
     * Builds an instance of the client.
     * @returns {Promise<Client>} Async result with client instance.
     */
    async build(): Promise<Client> {
        const url = `mongodb://${this._host}:${this._port}`;
        const mongoClient = await MongoClient.connect(url, { useUnifiedTopology: true });
        const db = mongoClient.db(this._database);
        const mongo = new Mongo(mongoClient, db);

        const dataSources = this._dataSources.map(_ => _.build(mongo));
        const client = new Client(mongo, dataSources);
        await client.initialize();

        return client;
    }
}
