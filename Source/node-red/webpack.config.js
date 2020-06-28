const path = require('path');
const envPath = path.resolve(process.cwd(), 'dolittle.env');
require('dotenv').config({ path: envPath });

process.env.DOLITTLE_WEBPACK_OUT = path.resolve(process.cwd(), 'Distribution', 'wwwroot');

const webpack = require('@dolittle/typescript.webpack.aurelia').webpack;
const config = webpack(__dirname, config => {
    config.resolve.alias['aurelia-binding'] = path.resolve(path.join(__dirname, '../../'), 'node_modules/aurelia-binding');
    config.watch = true;
    config.devServer = {
        historyApiFallback: true,
        port: 8081,
        proxy: {
            '/flows': {
                target:'http://localhost:1880',
                pathRewrite: {'^/flows' : ''}
            }
        }
    };

    return config;
});

module.exports = config;
