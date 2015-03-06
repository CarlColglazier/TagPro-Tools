/*global chrome */

// GLOBALS
var menu_settings;


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
    if (new_message.type === 'menu request') {
        window.postMessage({
            type: 'response',
            sender: new_message.sender,
            message: menu_settings
        }, location.href);
    }
}, false);

// Request default settings and populate storage.
var new_request = new XMLHttpRequest();
new_request.addEventListener('load', function(){
    'use strict';

    // Sync defaults with local storage.
    var defaults = JSON.parse(this.responseText);
    menu_settings = JSON.parse(this.responseText).settings.children;
    function flattenSettings(data, callback) {
        if (typeof data !== 'object') {
            return {};
        }
        function flattenObject(obj) {
            var i;
            for (i in obj) {
                if (!obj.hasOwnProperty(i)) {
                    continue;
                }
                if (typeof obj[i] === 'object') {
                    if (obj[i].children) {
                        if (typeof obj[i].children === 'object') {
                            obj[i] = flattenObject(obj[i].children);
                        } else {
                            obj[i] = obj[i].children;
                        }
                    }
                    if (obj[i].default) {
                        var old_value = obj[i].default,
                            x;
                        if (typeof obj[i].default === 'object') {
                            obj[i] = {};
                            for (x in old_value) {
                                if (!old_value.hasOwnProperty(x)) {
                                    continue;
                                }
                                obj[i][x] = old_value[x];
                            }
                        } else if (obj[i].uses) {
                            var uses = obj[i].uses;
                            obj[i] = {};
                            for (x = 0; x < uses.length; x++) {
                                if (!obj[uses[x]]) {
                                    obj[uses[x]] = {};
                                }
                                obj[uses[x]][i] = old_value;
                            }
                            delete obj[i];
                        } else {
                            obj[i] = obj[i].default;
                        }
                    }
                }
            }
            return obj;
        }
        callback(flattenObject(data));
    }

    function replaceTOOLS(new_data) {
        var x;
        for (x in new_data) {
            if (!new_data.hasOwnProperty(x)) {
                continue;
            }
            if (typeof new_data[x] === 'string' && new_data[x].indexOf('TOOLS/') >= 0) {
                new_data[x] = chrome.extension.getURL(new_data[x].replace('TOOLS/', 'lib/'));
            }
        }
        return new_data;
    }

    function checkDefaults(i, items, default_values) {
        var needs_change = false,
            new_data = (items) ? items : {},
            defaults = replaceTOOLS(default_values),
            x;
        if (!items) {
            new_data = {};
            new_data[i] = defaults;
            return addChromeData(new_data);
        }
        function mergeObjects(current_object, default_object) {
            for (x in default_object) {
                if (!default_object.hasOwnProperty(x)) {
                    continue;
                }
                if (typeof current_object[x] === 'undefined') {
                    needs_change = true;
                    current_object[x] = default_object[x];
                } else if (typeof current_object[x] === 'object') {
                    needs_change = true;
                    current_object[x] = mergeObjects(current_object[x], default_object[x]);
                }
            }
            return current_object;
        }
        var updated_data = {};
        updated_data[i] = mergeObjects(new_data, defaults);
        if (needs_change) {
            addChromeData(updated_data);
        }
    }
    function doubleCheck(i, default_values) {
        getChromeData(i, function(items) {
            checkDefaults(i, items, default_values);
        });
    }
    flattenSettings(defaults, function(data) {
        var i;
        for (i in data) {
            if (!data.hasOwnProperty(i)) {
                continue;
            }
            doubleCheck(i, data[i]);
        }
    });
    addScriptToDom('lib/js/tools.js');
});
new_request.open("get", chrome.extension.getURL('lib/json/defaults.json'), true);
new_request.send();
