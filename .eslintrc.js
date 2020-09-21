// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

module.exports = {
    extends: '@dolittle/typescript',
    root: true,
    parserOptions: {
        project: './Sources/*/tsconfig.json',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: [
        '**/*.d.ts',
        '**/node_modules',
        '**/dist',
        '**/out',
        '**/Distribution',
        '**/wallaby.conf.js',
        '**/coverage',
        '**/.eslintrc.js',
    ],
    rules: {
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/naming-convention': [
            'error',
            { selector: 'typeLike', format: ['PascalCase'], filter: { regex: '^(__String|[A-Za-z]+_[A-Za-z]+)$', match: false } },
            { selector: 'interface', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: true }, filter: { regex: '^I(Arguments|TextWriter|O([A-Z][a-z]+[A-Za-z]*)?)$', match: true } },
            { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allow', filter: { regex: '^(_{1,2}filename|_{1,2}dirname|_+|[A-Za-z]+_[A-Za-z]+)$', match: false } },
            { selector: 'function', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow', filter: { regex: '^[A-Za-z]+_[A-Za-z]+$', match: false } },
            { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow', filter: { regex: '^(_+|[A-Za-z]+_[A-Z][a-z]+)|RED$', match: false } },
            { selector: 'method', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow', filter: { regex: '^[A-Za-z]+_[A-Za-z]+$', match: false } },
            { selector: 'memberLike', format: ['camelCase'], leadingUnderscore: 'allow', filter: { regex: '^[A-Za-z]+_[A-Za-z]+$', match: false } },
            { selector: 'enumMember', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow', filter: { regex: '^[A-Za-z]+_[A-Za-z]+$', match: false } },
            // eslint-disable-next-line no-null/no-null
            { selector: 'property', format: null }
        ]
    }
};
