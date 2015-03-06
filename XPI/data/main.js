/* global unsafeWindow */
/* global self */
/* jshint esnext: true */

var menu_settings;

// Remove from the DOM to clean things up.
function removeScriptFromDom(target) {
    'use strict';
    target.parentNode.removeChild(target);
}

// Used to inject scripts.
function addScriptToDom(path) {
    'use strict';
    let script = unsafeWindow.document.createElement('script');
    script.setAttribute('type', 'application/javascript');
    script.src = self.options.uri + path;
    script.addEventListener('load', function (event) {
        removeScriptFromDom(event.target);
    });
    (unsafeWindow.document.head || unsafeWindow.document.documentElement).appendChild(script);
}

var portCallbacks = {};

// Get data from  storage.
function getData(request, callback) {
    'use strict';
    portCallbacks[request] = callback;
    self.port.emit('getData', request);
}

self.port.on('newData', function(response) {
    'use strict';
    if (portCallbacks[response.kind]) {
        portCallbacks[response.kind](response.value);
        delete portCallbacks[response.kind];
    }
});

// Add data to  storage.
function addData(request) {
    'use strict';
    self.port.emit('setData', request);
}

// Request default settings and populate storage.
function readMenu(menu_response) {
    'use strict';

    // Sync defaults with local storage.
    var defaults = JSON.parse(menu_response),
        flat_defaults;
    menu_settings = JSON.parse(menu_response).settings.children;
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

    var i;
    function checkDefaults(items) {
        if (!items) {
            return addData(flat_defaults);
        }
        var needs_change = false,
            new_data = (items[i]) ? items[i] : {};
        if (typeof items[i] === 'undefined') {
            new_data[i] = defaults[i];
            for (let x in new_data[i]) {
                if (!new_data[i].hasOwnProperty(x)) {
                    continue;
                }
                if (typeof new_data[i][x] === 'string' && new_data[i][x].indexOf('TOOLS/') >= 0) {
                    new_data[i][x] = new_data[i][x].replace('TOOLS/',self.options.uri);
                }
            }
            return addData(new_data);
        }
        function mergeObjects(current_object, default_object) {
            var x;
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
        var change_data = {};
        change_data[i] = mergeObjects(new_data, defaults[i]);
        for (let x in change_data[i]) {
            if (!change_data[i].hasOwnProperty(x)) {
                continue;
            }
            if (typeof change_data[i][x] === 'string' && change_data[i][x].indexOf('TOOLS/') >= 0) {
                change_data[i][x] = change_data[i][x].replace('TOOLS/',self.options.uri);
            }
        }
        if (needs_change) {
            addData(change_data);
        }
    }
    flattenSettings(defaults, function(data) {
        flat_defaults = data;
        for (i in data) {
            if (!data.hasOwnProperty(i)) {
                continue;
            }
            getData(i, checkDefaults);
        }
    });

    addScriptToDom('js/tools.js');
}
readMenu(self.options.menu);

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
        getData(new_message.message, function(items){
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