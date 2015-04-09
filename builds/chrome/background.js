/*global chrome */

// GLOBALS
var TOOLS_settings,
    new_request = new XMLHttpRequest(), // Request default settings and populate storage.
    data;

data = {
    get: function (request, callback) {
        'use strict';
        chrome.storage.local.get(request, function (results) {
            if (results[request]) {
                callback(results[request]);
            } else {
                callback(results);
            }
        });
    },
    add: function (request) {
        'use strict';
        chrome.storage.local.set(request);
    }
};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        'use strict';
        if (request.type === 'request') {
            data.get(request.sender, function (items) {
                var response = {
                    type: 'response',
                    sender: request.sender,
                    message: items
                };
                sendResponse(response, location.href);
            });

            // Declare the response as asynchronous.
            return true;
        }
        if (request.type === 'settings request') {
            sendResponse({
                type: 'response',
                sender: request.sender,
                message: TOOLS_settings
            }, location.href);
        }
        if (request.type === 'setter') {
            var new_data = {};
            if (request.sender) {
                new_data[request.sender] = request.message;
            } else {
                new_data = request.message;
            }
            data.add(new_data);
            if (request.sender === 'settings') {
                TOOLS_settings.values = request.message;
            }
            sendResponse(null);
        }
    }
);

new_request.addEventListener('load', function () {
    'use strict';
    // Sync defaults with local storage.
    var defaults = JSON.parse(this.responseText).values,
        menu_settings = JSON.parse(this.responseText).metadata,
        settings_object = {
            'functions': {}
        },
        function_object = {
            'home': [],
            'profile': [],
            'boards': [],
            'game': [],
            'menu': []
        },
        settings,
        new_settings;

    function replaceTOOLS(new_data) {
        if (typeof new_data === 'string' && new_data.indexOf('TOOLS/') >= 0) {
            new_data = chrome.extension.getURL(new_data.replace('TOOLS/', 'lib/'));
        }
        return new_data;
    }

    Object.keys(menu_settings).forEach(function (i) {
        switch (menu_settings[i].type) {
        case 'menu':
            if (menu_settings[i].children) {
                settings_object[i] = {};
                menu_settings[i].children.forEach(function (x) {
                    settings_object[i][x] = replaceTOOLS(defaults[x]);
                });
            }
            break;
        case 'function':
            if (menu_settings[i].uses) {
                menu_settings[i].uses.forEach(function (x) {
                    if (function_object[x]) {
                        function_object[x].push(i);
                    }
                });
            }
            break;
        }
    });
    settings = {
        'values': settings_object,
        'pages': function_object
    };

    data.get('settings', function (items) {
        var needs_change = false;
        Object.keys(defaults).forEach(function (i) {
            if (typeof items[i] === 'undefined') {
                items[i] = replaceTOOLS(defaults[i]);
                needs_change = true;
            }
        });
        if (needs_change) {
            new_settings = {};
            new_settings.settings = items;
            data.add(new_settings);
        }
        TOOLS_settings = {
            'values': items,
            'tree': settings_object,
            'pages': function_object,
            'menu': menu_settings
        };
    });
});
new_request.open('get', chrome.extension.getURL('lib/json/defaults.json'), true);
new_request.send();

// Runs when a new version comes out.
chrome.runtime.onInstalled.addListener(function (details) {
    'use strict';
    if (!(details.reason === 'install' || details.reason === 'update')) {
        return;
    }
    // New version.
    // TODO: Do something here.
});
