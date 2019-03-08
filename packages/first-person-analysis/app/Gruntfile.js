//NOTE "build" step here simply copies build folder. "yarn build" must be run first
//"yarn build" then copy:build also needs to be run before testing using NW config
module.exports = function (grunt) {
    grunt.initConfig({
        nwjs: {
            options: {
                build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
                mac: false, // We want to build it for mac
                win: true, // We want to build it for win
                linux32: false, // We don't need linux32
                linux64: false // We don't need linux64
            },
            src: ['./nw/**/*'] // Your node-webkit app
        },
        copy: {
            build: {
                expand: true,
                cwd: '../build',
                src: '**',
                dest: './nw'
            },
            deploy: {
                expand: true,
                cwd: 'webkitbuilds/first-person-analysis-nw/win64',
                src: '**',
                dest: 'L:\\sa_strategies\\Tools\\FirstPersonViewTool'
            },
        },
    });

    grunt.loadNpmTasks('grunt-nw-builder');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['copy:build', 'nwjs', 'copy:deploy']);

};