/*global chrome */

// GLOBALS
var TOOLS_settings;


// Remove from the DOM to clean things up.
function removeScriptFromDom(target) {
    'use strict';
    target.parentNode.removeChild(target);
}

// Used to inject scripts.
function addScriptToDom(path) {
    'use strict';
    var script = document.createElement('script');
    script.setAttribute('type', 'application/javascript');
    script.src = chrome.extension.getURL(path);
    script.addEventListener('load', function (event) {
        removeScriptFromDom(event.target);
    });
    (document.head || document.documentElement).appendChild(script);
}

// Get data from Chrome's storage.
function getChromeData(request, callback) {
    'use strict';
    chrome.storage.local.get(request, function(results) {
        if (results[request]) {
            callback(results[request]);
        } else if (results) {
            callback(results);
        } else {
            callback(null);
        }
    });
}

// Add data to Chrome's storage.
function addChromeData(request) {
    'use strict';
    chrome.storage.local.set(request);
}

// Listen for messages from the injected scripts.
window.addEventListener('message', function (event) {
    'use strict';
    if (event.origin !== location.origin || !event.data) {
        return;
    }
    if (!event.data.type || !event.data.sender) {
        return;
    }
    var new_message = event.data;
    if (new_message.type === 'request') {
        getChromeData(new_message.message, function(items){
            window.postMessage({
                type: 'response',
                sender: new_message.sender,
                message: items
            }, location.href);
        });
    }
    if (new_message.type === 'settings request') {
        window.postMessage({
            type: 'response',
            sender: new_message.sender,
            message: TOOLS_settings
        }, location.href);
    }
    if (new_message.type === 'setter') {
        var new_data = {};
        if (new_message.sender) {
            new_data[new_message.sender] = new_message.message;
        } else {
            new_data = new_message.message;
        }
        addChromeData(new_data);
    }
}, false);

// Request default settings and populate storage.
var new_request = new XMLHttpRequest();
new_request.addEventListener('load', function(){
    'use strict';

    // Sync defaults with local storage.
    var defaults = JSON.parse(this.responseText).values,
        menu_settings = JSON.parse(this.responseText).metadata;

    function replaceTOOLS(new_data) {
        if (typeof new_data === 'string' && new_data.indexOf('TOOLS/') >= 0) {
            new_data = chrome.extension.getURL(new_data.replace('TOOLS/', 'lib/'));
        }
        return new_data;
    }

    var i, x,
        settings_object = {
            "functions": {}
        },
        function_object = {
            "home": [],
            "profile": [],
            "boards": [],
            "game": []
        },
        settings,
        new_key;
    for (i in menu_settings) {
        if (!menu_settings.hasOwnProperty(i)) {
            continue;
        }
        switch(menu_settings[i].type) {
        case 'menu':
            if (menu_settings[i].children) {
                settings_object[i] = {};
                for (x = 0; x < menu_settings[i].children.length; x++) {
                    if (!menu_settings[i].children.hasOwnProperty(x)) {
                        continue;
                    }
                    new_key = menu_settings[i].children[x];
                    settings_object[i][new_key] = replaceTOOLS(defaults[new_key]);
                }
            }
            break;
        case 'function':
            if (menu_settings[i].uses) {
                for (x = 0; x < menu_settings[i].uses.length; x++) {
                    if (function_object[menu_settings[i].uses[x]]) {
                        function_object[menu_settings[i].uses[x]].push(i);
                    }
                }
            }
            break;
        }
    }
    settings = {
        "values": settings_object,
        "pages": function_object
    };

    getChromeData('settings', function(items) {
        var needs_change = false,
            i;
        for (i in defaults) {
            if (!defaults.hasOwnProperty(i)) {
                continue;
            }
            if (typeof items[i] === 'undefined') {
                items[i] = replaceTOOLS(defaults[i]);
                needs_change = true;
            }
        }
        if (needs_change) {
            var new_settings = {};
            new_settings.settings = items;
            addChromeData(new_settings);
        }
        TOOLS_settings = {
            "values": items,
            "tree": settings_object,
            "pages": function_object,
            "menu": menu_settings
        };
    });

    addScriptToDom('lib/js/tools.js');
});
new_request.open("get", chrome.extension.getURL('lib/json/defaults.json'), true);
new_request.send();
