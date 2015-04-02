/* global module */

module.exports = function (grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.initConfig({

        copy: {
            chrome: {
                files: [{
                    expand: true,
                    cwd: 'lib/',
                    src: '**',
                    dest: 'builds/Chrome/lib'}]
            },
            firefox: {
                files: [{
                    expand: true,
                    cwd: 'lib/',
                    src: '**',
                    dest: 'builds/XPI/data'
                }]
            }
        },
        browserify: {
            dist: {
                files: {
                    'lib/js/tools.js': 'lib/js/app.js'
                },
                options: {
                    transform: ['babelify']
                }
            }
        },
        less: {
            chrome: {
                files: {
                    'builds/chrome/lib/css/tools.css': 'builds/chrome/lib/css/tools.less'
                }
            },
            firefox: {
                files: {
                    'builds/XPI/data/css/tools.css': 'builds/XPI/data/css/tools.less'
                }
            }
        },
        clean: {
            dist: [
                'lib/js/tools.js'
            ],
            chrome: [
                'builds/chrome/lib/js/*.js',
                'builds/chrome/lib/js/**/*.js',
                'builds/chrome/lib/css/*.less',
                '!builds/chrome/lib/js/tools.js'
            ],
            firefox: [
                'builds/XPI/data/js/*.js',
                'builds/XPI/data/js/**/*.js',
                'builds/XPI/data/css/*.less',
                '!builds/XPI/data/js/tools.js'
            ]
        },
        watch: {
            chrome: {
                files: ['lib/*', 'lib/*/*', 'lib/*/*/*'],
                tasks: ['browserify', 'copy:chrome', 'less:chrome', 'clean']
            },
            firefox: {
                files: ['lib/*', 'lib/*/*', 'lib/*/*/*'],
                tasks: ['browserify', 'copy:firefox', 'less:firefox', 'clean']
            }
        }
    });

    grunt.registerTask('default', ['browserify', 'copy', 'less', 'clean']);
    grunt.registerTask('chrome', ['copy:chrome', 'watch:chrome']);
    grunt.registerTask('firefox', ['copy:firefox', 'watch:firefox']);
    grunt.registerTask('develop', ['watch']);
};
