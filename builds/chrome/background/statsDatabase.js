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
    i,
    createObjectStore = function (db) {
        'use strict';

        // Create an objectStore
        var objectStore = db.createObjectStore('CatStats', { keyPath: 'id' });
        for (i in columns) {
            if (!columns.hasOwnProperty(i)) {
                continue;
            }
            objectStore.createIndex(columns[i], columns[i], { unique: false });
        }
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
};

request.onupgradeneeded = function (event) {
    'use strict';
    db = event.target.result;
    createObjectStore(db);

};
