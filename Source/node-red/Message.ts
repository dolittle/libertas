// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TenantId } from '@dolittle/sdk.execution';

export interface Message<T> {
    _msgid: string;
    topic: string;
    payload?: T;
}

export interface ExecutionContext {
    tenantId: TenantId;
}

export interface MessageWithExecutionContext<T> extends Message<T> {
    executionContext: ExecutionContext;
}