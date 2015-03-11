/* global module */

module.exports = function(grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');

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
        concat: {
            chrome: {
                src: [
                    'builds/chrome/lib/js/prepare.js',
                    'builds/chrome/lib/js/modules/*.js',
                    'builds/chrome/lib/js/global.js'
                ],
                dest: 'builds/chrome/lib/js/tools.js'
            },
            firefox: {
                src: [
                    'builds/XPI/data/js/prepare.js',
                    'builds/XPI/data/js/modules/*.js',
                    'builds/XPI/data/js/global.js'
                ],
                dest: 'builds/XPI/data/js/tools.js'
            }
        },
        less: {
            chrome: {
                files: {
                    "builds/chrome/lib/css/tools.css": "builds/chrome/lib/css/tools.less"
                }
            },
            firefox: {
                files: {
                    "builds/XPI/data/css/tools.css": "builds/XPI/data/css/tools.less"
                }
            }
        },
        clean: {
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
                tasks: ['copy:chrome','concat:chrome','less:chrome','clean:chrome','babel:chrome']
            },
            firefox: {
                files: ['lib/*', 'lib/*/*', 'lib/*/*/*'],
                tasks: ['copy:firefox','concat:firefox','less:firefox','clean:firefox','babel:firefox']
            }
        },
        babel: {
            chrome: {
                files: [{
                    expand: true,
                    cwd: 'chrome/lib/js',
                    src: ['**/*.js'],
                    dest: 'builds/chrome/lib/js',
                    ext: '.js'
                }]
            },
            firefox: {
                files: [{
                    expand: true,
                    cwd: 'XPI/data/js',
                    src: ['**/*.js'],
                    dest: 'builds/XPI/data/js',
                    ext: '.js'
                }]
            }
        }
    });

    grunt.registerTask('default', ['copy','concat','less','clean','babel']);
    grunt.registerTask('chrome', ['copy:chrome', 'watch:chrome']);
    grunt.registerTask('firefox', ['copy:firefox', 'watch:firefox']);
    grunt.registerTask('develop', ['watch']);
};