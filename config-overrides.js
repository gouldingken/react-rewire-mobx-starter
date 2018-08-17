const { injectBabelPlugin } = require("react-app-rewired");
const rewireMobX = require("react-app-rewire-mobx");
const rewireWebpackOutput = require('react-app-rewire-output');

module.exports = function override(config, env) {
    config = injectBabelPlugin("babel-plugin-styled-components", config);
    config = rewireMobX(config, env);

    if (env !== 'development') {
        config = rewireWebpackOutput(config, env, {
            publicPath: './',
        });
    }

    return config;
};