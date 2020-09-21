// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NodeProperties, Red } from 'node-red';

import { Node, registerNodeType } from '../../Node';
import { messageHandlerNode, SendCallback } from '../../MessageHandlerNode';
import { MessageWithExecutionContext } from '../../Message';
import { TenantId } from '@dolittle/sdk.execution';
import { Guid } from '@dolittle/rudiments';

interface SetExecutionContextProperties extends NodeProperties {
    tenantId?: string;
}

module.exports = function (RED: Red) {
    @registerNodeType(RED, 'set-execution-context')
    @messageHandlerNode
    class SetExecutionContext extends Node {
        private _tenantId?: TenantId;

        constructor(config: SetExecutionContextProperties) {
            super(config);

            if (config.tenantId) {
                this._tenantId = TenantId.from(config.tenantId);
            }
        }

        handle(message: MessageWithExecutionContext<any>, send: SendCallback) {
            if (message.executionContext === undefined) {
                message.executionContext = {};
            }

            if (this._tenantId !== undefined) {
                message.executionContext.tenantId = this._tenantId;
            }

            send(message);
        }
    }
};
