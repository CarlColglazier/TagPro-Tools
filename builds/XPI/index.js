/* global require: false */
/* jshint esnext: true */

let pageMod = require('sdk/page-mod'),
    ss = require('sdk/simple-storage'),
    self = require('sdk/self'),
    // jshint unused:false
    { indexedDB, IDBKeyRange } = require('sdk/indexed-db'),
    data = self.data,
    db,
    dbVersion = 1,
    request = indexedDB.open('GameStats', dbVersion),
    columns = [
        'id',
        'timestamp',
        'auth',
        'name',
        'plusminus',
        'minutes',
        'score',
        'tags',
        'pops',
        'grabs',
        'drops',
        'hold',
        'captures',
        'prevent',
        'returns',
        'support',
        'team',
        'team_captures',
        'opponent_captures',
        'arrival',
        'departure',
        'bombtime',
        'tagprotime',
        'griptime',
        'speedtime'
    ],
    createObjectStore = function (db) {
        'use strict';

        // Create an objectStore
        var objectStore = db.createObjectStore('CatStats', { keyPath: 'id' });
        for (let i in columns) {
            if (!columns.hasOwnProperty(i)) {
                continue;
            }
            objectStore.createIndex(columns[i], columns[i], { unique: false });
        }
    };

request.onsuccess = function (event) {
    'use strict';
    db = event.target.result;
};

request.onupgradeneeded = function (event) {
    'use strict';
    db = event.target.result;
    createObjectStore(db);
};

pageMod.PageMod({

    include: ['*.koalabeast.com', '*.newcompte.fr'],
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
    onAttach: function (worker) {
        'use strict';
        worker.port.on('getData', function (kind) {
            let response = {
                kind: kind,
                value: ss.storage[kind] || {}
            };
            worker.port.emit('newData', response);
        });
        worker.port.on('setData', function (data) {
            if (typeof data === 'object') {
                for (let i in data) {
                    if (!data.hasOwnProperty(i)) {
                        continue;
                    }
                    ss.storage[i] = data[i];
                }
            }
        });
        worker.port.on('generic message', function (request) {
            if (request.type === 'catstats') {
                var i,
                    transaction = db.transaction(['CatStats'], 'readwrite'),
                    store = transaction.objectStore('CatStats');
                for (i in request.message) {
                    if (!request.message.hasOwnProperty(i)) {
                        continue;
                    }
                    store.add(request.message[i]);
                }
            }
        });
    }
});

