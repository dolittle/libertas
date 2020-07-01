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
        columns: string[] = [];

        constructor(config: NodeProperties) {
            super(RED);
            this.createNode(config);

            this.name = config.name;

            const c = config as any;
            this._server = RED.nodes.getNode(c.server) as any as InforM3Config;
            this.program = c.program;
            this.transaction = c.transaction;
            this.maxRecords = c.maxrecords;
            this.columns = c.columns;

            this.on('input', (msg) => {
                try {
                    const bulkRequest = new BulkRequest(this.program, this.maxRecords, this.transaction, this.columns);
                    for (const request of msg.payload) {
                        bulkRequest.addTransaction(request.record, request.transaction, request.columns);
                    }

                    fetch(`${this._server?.endpoint}/execute`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${Buffer.from(`${this._server?.username}:${this._server?.password}`).toString('base64')}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bulkRequest.serialize()),
                    }).then(result => {
                        if (result.status === 200 || result.status === 400) {
                            return result.json().then(data => {
                                if (data.wasTerminated) {
                                    this.error(`${data.terminationErrorType}: ${data.terminationReason}`);
                                } else {
                                    for (let n = 0; n < data.results.length; n++) {
                                        const element = data.results[n];
                                        const result = msg.payload[n].result = {
                                            records: element.records,
                                        } as any;
                                        if (element.errorMessage) {
                                            result.error = element.errorMessage;
                                        }
                                    }
                                    this.send(msg);
                                }
                            });
                        }
                        return result.text().then(text => {
                            this.error(`${result.status}: ${result.statusText}`, msg);
                        });
                    }).catch(error => {
                        this.error(error, msg);
                    });
                } catch (error) {
                    this.error(error, msg);
                }
            });
        }
    }

    InforM3Bulk.registerType(RED, 'infor-m3-bulk');
};
