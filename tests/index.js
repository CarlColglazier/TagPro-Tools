/* jshint devel: true */
require('tagpro-testbed');
var path = require('path'),
    childProcess = require('child_process'),
    phantomjs = require('phantomjs'),
    binPath = phantomjs.path,
    childArgs = [
        path.join(__dirname, 'test.js')
    ];

childProcess.execFile(binPath, childArgs, function (err, stdout, stderr) {
    'use strict';
    if (err) {
        throw(err);
    }
    if (stderr) {
        console.err(stderr);
    }
    var exit_code = 0,
        output = JSON.parse(stdout);
    output.forEach(function (result) {
        if (result.value === false) {
            exit_code = 1;
        }
        console.log(result.value + ' - ' + result.description);
    });
    process.exit(exit_code);
});
