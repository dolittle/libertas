// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';
import { Node, registerNodeType, messageHandlerNode } from '@dolittle/node-red';
import fetch from 'node-fetch';
import { InforM3Config } from '../infor-m3-config/infor-m3-config';
import { SendCallback } from '@dolittle/node-red/Distribution/MessageHandlerNode';
import { Message } from '@dolittle/node-red/Distribution/Message';

interface InforM3BulkProperties extends NodeProperties {
    server: string;
    name: string;
    program: string;
    transaction: string;
    maxrecords: string;
    maxbulk: string;
    maxparallel: string;
    columns: string[];
}

export class BulkRequestTransaction {
    private _transaction: string;
    private _record: any;
    private _selectedColumns?: string[];

    constructor(transaction: string, record: any, columns?: string[]) {
        this._transaction = transaction;
        this._record = record;
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

interface BulkRequestMessage extends Message<any | any[]> {}

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'infor-m3-bulk')
    @messageHandlerNode
    class InforM3Bulk extends Node {
        private _server?: InforM3Config;
        private _program: string;
        private _transaction: string;
        private _maxRecords: number;
        private _maxBulk: number;
        private _maxParallel: number;
        private _columns: string[];

        constructor(config: InforM3BulkProperties) {
            super(config);

            this._server = this.getConfigurationFromNode(config.server);
            this._program = config.program;
            this._transaction = config.transaction;
            this._maxRecords = parseInt(config.maxrecords, 10) || 0;
            this._maxBulk = parseInt(config.maxbulk, 10) || 0;
            this._maxParallel = parseInt(config.maxparallel, 10) || 1;
            this._columns = config.columns || [];
        }

        async handle(message: BulkRequestMessage, send: SendCallback) {
            try {
                const transactions = (Array.isArray(message.payload) ? message.payload : [message.payload]) as any[];

                const bulks: any[][] = [];

                if (this._maxBulk > 0) {
                    let bulkCount = transactions.length / this._maxBulk;
                    if (Math.floor(bulkCount) !== bulkCount) bulkCount = Math.ceil(bulkCount);

                    let position = 0;
                    for (let n = 0; n < bulkCount; n++) {
                        bulks.push(transactions.slice(position, position + this._maxBulk));
                        position += this._maxBulk;
                    }
                } else {
                    bulks.push(transactions);
                }

                const progress = {
                    completed: 0,
                    total: bulks.length,
                };
                const processors: Promise<void>[] = [];
                for (let n = 0; n < this._maxParallel; n++) {
                    processors.push(this.startProcessing(message, bulks, progress, send));
                }
                await Promise.all(processors);

                send([null, message]);
            } catch (error) {
                this.error(error, message);
            }
        }

        async startProcessing(msg: any, bulks: any[][], progress: any, send: (msgs: any[]) => void) {
            while (true) {
                const bulk = bulks.pop();
                if (!bulk) return;

                await this.processBulk(bulk);
                progress.completed += 1;
                this.sendStatusMessage(msg, progress, send);
            }
        }

        sendStatusMessage(msg: any, progress: any, send: (msgs: any[]) => void) {
            const statusMessage = { payload: {
                completed: progress.completed,
                total: progress.total,
            }} as any;
            for (const key in msg) {
                if (key !== '_msgid' && key !== 'payload') {
                    statusMessage[key] = msg[key];
                }
            }
            send([statusMessage, null]);
        }

        async processBulk(bulk: any[]) {
            const bulkRequest = new BulkRequest(this._program, this._maxRecords, this._transaction, this._columns);
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
};
