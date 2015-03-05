/* global module */

module.exports = function(grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-babel');

    grunt.initConfig({

        copy: {
            chrome: {
                files: [{
                    expand: true,
                    cwd: 'lib/',
                    src: '**',
                    dest: 'Chrome/lib'}]
            },
            firefox: {
                files: [{
                    expand: true,
                    cwd: 'lib/',
                    src: '**',
                    dest: 'XPI/data'
                }],
                options: {
                    process: function (content) {

                        // Gives the extension access to the DOM.
                        return content.replace(/window/g,"unsafeWindow");
                    }
                }
            }
        },
        watch: {
            chrome: {
                files: ['lib/*', 'lib/*/*', 'lib/*/*/*'],
                tasks: ['copy:chrome','babel:chrome']
            },
            firefox: {
                files: ['lib/*', 'lib/*/*', 'lib/*/*/*'],
                tasks: ['copy:firefox']
            }
        },
        babel: {
            chrome: {
                files: [{
                    expand: true,
                    cwd: 'chrome/lib/js',
                    src: ['**/*.js'],
                    dest: 'chrome/lib/js',
                    ext: '.js'
                }]
            }
        }
    });

    grunt.registerTask('default', ['copy','babel']);
    grunt.registerTask('chrome', ['copy:chrome', 'watch:chrome']);
    grunt.registerTask('firefox', ['copy:firefox', 'watch:firefox']);
    grunt.registerTask('develop', ['watch']);
};
