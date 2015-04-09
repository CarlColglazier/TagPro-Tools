/* global indexedDB */

var db,
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
    createObjectStore;

createObjectStore = function (db) {
    'use strict';
    var objectStore = db.createObjectStore('CatStats', { keyPath: 'id' });
    columns.forEach(function (column) {
        objectStore.createIndex(column, column, { unique: false });
    });
};

request.onsuccess = function (event) {
    'use strict';
    db = event.target.result;
    if (db.setVersion) {
        if (db.version !== dbVersion) {
            var setVersion = db.setVersion(dbVersion);
            setVersion.onsuccess = function () {
                createObjectStore(db);
            };
        }
    }
    chrome.runtime.onMessage.addListener(
        function (request) {
            if (request.type === 'catstats') {
                var transaction = db.transaction(['CatStats'], 'readwrite'),
                    store = transaction.objectStore('CatStats');
                request.message.forEach(function (message) {
                    store.add(message);
                });
            }
        });
};

request.onupgradeneeded = function (event) {
    'use strict';
    db = event.target.result;
    createObjectStore(db);
};
