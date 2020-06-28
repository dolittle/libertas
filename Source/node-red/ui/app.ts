// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { autoinject } from 'aurelia-dependency-injection';
import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration } from 'aurelia-router';

@autoinject
export class App {
    router: Router | undefined;

    configureRouter(config: RouterConfiguration, router: Router) {
        config.options.pushState = true;
        config.options.root = '/dolittle';
        config.map([
            { route: ['', '/'], name: 'Index', moduleId: PLATFORM.moduleName('index'), nav: true }
        ]);

        this.router = router;
    }
}
