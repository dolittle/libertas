// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import 'aurelia-polyfills';
import environment from './environment';

export function configure(aurelia: Aurelia) {
    alert('hello');

    aurelia.use
        .standardConfiguration()
        .feature(PLATFORM.moduleName('components/index'))
        .plugin(PLATFORM.moduleName('aurelia-animator-css'))
        .plugin(PLATFORM.moduleName('@dolittle/fluentui.aurelia'));

    if (environment.debug) {
        aurelia.use.developmentLogging();
    }

    if (environment.testing) {
        aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
    }

    aurelia.start().then(() => {
        aurelia.setRoot(PLATFORM.moduleName('app'));
    }).catch((reason: any) => {
        console.log(reason);
    });
}
