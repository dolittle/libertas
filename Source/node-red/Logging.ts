// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createLogger, format, transports } from 'winston';


const loggerOptions = {
    level: 'debug',
    format: format.colorize(),
    defaultMeta: {
    },
    transports: [
        new transports.Console({
            format: format.simple()
        })
    ]
};

export const Logger = createLogger(loggerOptions);
