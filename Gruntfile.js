/* global module */

module.exports = function(grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

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
                }]
            }
        },
        concat: {
            chrome: {
                src: [
                    'chrome/lib/js/prepare.js',
                    'chrome/lib/js/modules/*.js',
                    'chrome/lib/js/global.js'
                ],
                dest: 'chrome/lib/js/tools.js'
            },
            firefox: {
                src: [
                    'XPI/data/js/prepare.js',
                    'XPI/data/js/modules/*.js',
                    'XPI/data/js/global.js'
                ],
                dest: 'XPI/data/js/tools.js'
            }
        },
        clean: {
            chrome: [
                'chrome/lib/js/*.js',
                'chrome/lib/js/**/*.js',
                '!chrome/lib/js/tools.js'
            ],
            firefox: [
                'XPI/data/js/*.js',
                'XPI/data/js/**/*.js',
                '!XPI/data/js/tools.js'
            ]
        },
        watch: {
            chrome: {
                files: ['lib/*', 'lib/*/*', 'lib/*/*/*'],
                tasks: ['copy:chrome','concat:chrome','clean:chrome','babel:chrome']
            },
            firefox: {
                files: ['lib/*', 'lib/*/*', 'lib/*/*/*'],
                tasks: ['copy:firefox','concat:firefox','clean:firefox','babel:firefox']
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
            },
            firefox: {
                files: [{
                    expand: true,
                    cwd: 'XPI/data/js',
                    src: ['**/*.js'],
                    dest: 'XPI/data/js',
                    ext: '.js'
                }]
            }
        }
    });

    grunt.registerTask('default', ['copy','concat','clean','babel']);
    grunt.registerTask('chrome', ['copy:chrome', 'watch:chrome']);
    grunt.registerTask('firefox', ['copy:firefox', 'watch:firefox']);
    grunt.registerTask('develop', ['watch']);
};
