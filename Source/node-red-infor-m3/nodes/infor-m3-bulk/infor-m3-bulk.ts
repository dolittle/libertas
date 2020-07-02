// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';
import { Node } from '@dolittle/node-red';
import fetch from 'node-fetch';
import { InforM3Config } from 'nodes/infor-m3-config/infor-m3-config';

export interface InforM3Bulk {
    name: string;
    program: string;
    transaction: string;
    maxRecords: number;
    maxBulk: number;
    maxParallel: number;
    columns: string[];
}

export class BulkRequestTransaction {
    private _transaction: string;
    private _record: any;
    private _selectedColumns?: string[];

    constructor(transaction: string, record: any, columns?: string[]) {
        this._transaction = transaction;
        this._record = record,
            this._selectedColumns = columns;
    }

    serialize(): any {
        return {
            transaction: this._transaction,
            record: this._record,
            selectedColumns: this._selectedColumns,
        };
    }
}

export class BulkRequest {
    private _program: string;
    private _maxReturnedRecords: number;
    private _transactions: BulkRequestTransaction[] = [];
    private _defaultTransaction?: string;
    private _defaultColumns?: string[];

    constructor(program: string, maxReturnedRecords: number, transaction?: string, columns?: string[]) {
        this._program = program;
        this._maxReturnedRecords = maxReturnedRecords;
        this._defaultTransaction = transaction;
        this._defaultColumns = columns;
    }

    get program(): string {
        return this._program;
    }

    get maxReturnedRecords(): number {
        return this._maxReturnedRecords;
    }

    addTransaction(record: any, transaction?: string, columns?: string[]) {
        const actualTransaction = transaction || this._defaultTransaction;
        if (!actualTransaction) {
            throw new Error('Transaction must be defined on BulkRequest or per Transaction');
        }
        if (!record) {
            throw new Error('Record must be defined per Transaction');
        }
        this._transactions.push(new BulkRequestTransaction(actualTransaction!, record, columns || this._defaultColumns));
    }

    serialize(): any {
        return {
            program: this._program,
            maxReturnedRecords: this._maxReturnedRecords || 0,
            transactions: this._transactions.map(transaction => transaction.serialize()),
        };
    }
}

module.exports = function (RED: Red) {

    class InforM3Bulk extends Node implements InforM3Bulk {
        private _server?: InforM3Config;
        name: string = '';
        program: string = '';
        transaction: string = '';
        maxRecords: number = 0;
        maxBulk: number = 0;
        maxParallel: number = 1;
        columns: string[] = [];

        constructor(config: NodeProperties) {
            super(RED);
            this.createNode(config);

            this.name = config.name;

            const c = config as any;
            this._server = RED.nodes.getNode(c.server) as any as InforM3Config;
            this.program = c.program;
            this.transaction = c.transaction;
            this.maxRecords = parseInt(c.maxrecords, 10) || 0;
            this.maxBulk = parseInt(c.maxbulk, 10) || 0;
            this.maxParallel = parseInt(c.maxparallel, 10) || 1;
            this.columns = c.columns;

            this.on('input', async (msg: any, send: (msgs: any[]) => void, done: (err?: any) => void) => {
                // Pre-1.0 polyfills
                send = send || ((msgs: any[]) => this.send(msgs));
                done = done || ((err?: any) => { if (err) this.error(err, msg); });

                try {
                    const transactions = (Array.isArray(msg.payload) ? msg.payload : [msg.payload]) as any[];

                    const bulks: any[][] = [];

                    if (this.maxBulk > 0) {
                        let bulkCount = transactions.length / this.maxBulk;
                        if (Math.floor(bulkCount) !== bulkCount) bulkCount = Math.ceil(bulkCount);

                        let position = 0;
                        for (let n = 0; n < bulkCount; n++) {
                            bulks.push(transactions.slice(position, position + this.maxBulk));
                            position += this.maxBulk;
                        }
                    } else {
                        bulks.push(transactions);
                    }

                    for (let n = 0; n < bulks.length; n++) {
                        const bulk = bulks[n];
                        await this.processBulk(bulk);
                        
                        const statusMessage = { payload: {
                            index: n,
                            count: bulks.length,
                        }} as any;
                        for (const key in msg) {
                            if (key != '_msgid' && key != 'payload') {
                                statusMessage[key] = msg[key];
                            }
                        }
                        send([statusMessage, null]);
                    }

                    send([null, msg]);
                    done();
                } catch (error) {
                    done(error);
                }
            });
        }

        async processBulk(bulk: any[]) {
            const bulkRequest = new BulkRequest(this.program, this.maxRecords, this.transaction, this.columns);
            for (const request of bulk) {
                bulkRequest.addTransaction(request.record, request.transaction, request.columns);
            }

            const response = await fetch(`${this._server?.endpoint}/execute`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${this._server?.username}:${this._server?.password}`).toString('base64')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bulkRequest.serialize()),
            });

            if (response.status === 200 || response.status === 400) {
                const data = await response.json();
                if (data.wasTerminated) {
                    throw new Error(`${data.terminationErrorType}: ${data.terminationReason}`);
                } else {
                    for (let n = 0; n < bulk.length; n++) {
                        const transaction = bulk[n];
                        const result = data.results[n];
                        if (result) {
                            bulk[n].result = {
                                records: result.records,
                                error: result.errorMessage
                            };
                        } else {
                            bulk[n].result = {
                                records: [],
                                error: 'No result returned',
                            };
                        }
                    }
                }
            } else {
                throw new Error(`${response.status}: ${response.statusText}`);
            }
        }
    }

    InforM3Bulk.registerType(RED, 'infor-m3-bulk');
};
