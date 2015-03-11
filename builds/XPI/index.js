/* global require: false */
/* jshint esnext: true */

let pageMod = require("sdk/page-mod"),
    ss = require("sdk/simple-storage"),
    self = require('sdk/self'),
    data = self.data;

pageMod.PageMod({

    include: ['*.koalabeast.com','*.newcompte.fr'],
    contentScriptWhen: 'ready',
    contentScriptFile: [
        './main.js'
    ],
    contentScriptOptions: {
        uri: data.url(),
        menu: JSON.parse(data.load('json/defaults.json'))
    },
    contentStyleFile: [
        './css/tools.css'
    ],
    onAttach: function(worker) {
        'use strict';
        worker.port.on('getData', function(kind) {
            let response = {
                kind: kind,
                value: ss.storage[kind]
            };
            worker.port.emit('newData', response);
        });
        worker.port.on('setData', function(data) {
            if (typeof data === 'object') {
                for (let i in data) {
                    if (!data.hasOwnProperty(i)) {
                        continue;
                    }
                    ss.storage[i] = data[i];
                }
            }
        });
    }
});

