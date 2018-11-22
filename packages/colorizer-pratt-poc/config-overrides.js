const rewireYarnWorkspaces = require('react-app-rewire-yarn-workspaces');
const rewireWebpackOutput = require('react-app-rewire-output');

module.exports = function override(config, env) {
    console.log('rewireYarnWorkspaces');
    if (env !== 'development') {
        config = rewireWebpackOutput(config, env, {
            publicPath: './',
        });
    }
    return rewireYarnWorkspaces(config, env);
};