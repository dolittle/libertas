// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Red, NodeProperties } from 'node-red';

import { IncomingMessage, ServerResponse } from 'http';

import { MongoClient, Db } from 'mongodb';
import fetch from 'node-fetch';

import xml2js from 'xml2js';

export class ClientAPI {
    constructor(RED: Red, config: NodeProperties) {
        RED.httpNode.get('/dolittle/m3', async (req: IncomingMessage, res: any) => {
            const conf = config as any;
            const dataStore = RED.nodes.getNode(conf.datastore) as any;
            const runtime = RED.nodes.getNode(conf.runtime) as any;
            const baseUrl = conf.url;
            const username = conf.username;
            const password = conf.password;

            const mongoUrl = `mongodb://${dataStore.host}:${dataStore.port}`;
            const mongo = await MongoClient.connect(mongoUrl);
            const db = mongo.db(dataStore.database);
            const entityTypes = db.collection('entity-types');
            const result = await entityTypes.find().toArray();
            if (result) {

                //https://s-rorlso2-tst.ad.infranet:31008/m3api-rest/execute/MRS001MI/LstPrograms;maxrecs=0

                if (result.length === 0) {
                    const url = `${baseUrl}/execute/MRS001MI/LstPrograms;maxrecs=10`;
                    const combined = `${username}:${password}`;
                    console.log(combined);
                    const base64 = Buffer.from(combined).toString('base64');
                    const options = {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'text/xml',
                            'Authorization': `Basic ${base64}`
                        }
                    };

                    try {
                        const response = await fetch(url, options);
                        const result = await response.text();
                        console.log(result);

                        const document = await xml2js.parseStringPromise(result);
                        res.json(document);
                        return;
                    } catch (ex) {
                        console.log(ex);
                    }
                }

                res.json(result);
            } else {
                res.json({ hello: 'world' });
            }
        });
    }
}
