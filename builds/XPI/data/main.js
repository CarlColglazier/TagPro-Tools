/* global unsafeWindow */
/* global self */
/* jshint esnext: true */

var TOOLS_settings,
    portCallbacks = {};

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

// Get data from  storage.
function getData(request, callback) {
    'use strict';
    portCallbacks[request] = callback;
    self.port.emit('getData', request);
}

self.port.on('newData', function (response) {
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
    var defaults = menu_response.values,
        menu_settings = menu_response.metadata;

    function replaceTOOLS(new_data) {
        if (typeof new_data === 'string' && new_data.indexOf('TOOLS/') >= 0) {

            // TODO: Create alternate method of loading texture in Firefox.
            return new_data.replace('TOOLS/img', 'images');
        }
        return new_data;
    }

    let settings_object = {
            'functions': {}
        },
        function_object = {
            'home': [],
            'profile': [],
            'boards': [],
            'game': []
        },
        settings;
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

    getData('settings', function (items) {
        var needs_change = false;
        if (!items) {
            let new_settings = {};
            items = {};
            new_settings.settings = items;
            addData(new_settings);
        }
        Object.keys(defaults).forEach(function (i) {
            if (typeof items[i] === 'undefined') {
                items[i] = replaceTOOLS(defaults[i]);
                needs_change = true;
            }
        });
        if (needs_change) {
            let new_settings = {};
            new_settings.settings = items;
            addData(new_settings);
        }
        TOOLS_settings = {
            'values': items,
            'tree': settings_object,
            'pages': function_object,
            'menu': menu_settings
        };
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
        getData(new_message.sender, function (items) {
            window.postMessage({
                type: 'response',
                sender: new_message.sender,
                message: items
            }, location.href);
        });
    } else if (new_message.type === 'settings request') {
        window.postMessage({
            type: 'response',
            sender: new_message.sender,
            message: TOOLS_settings
        }, location.href);
    } else if (new_message.type === 'setter') {
        let new_data = {};
        if (new_message.sender) {
            new_data[new_message.sender] = new_message.message;
        } else {
            new_data = new_message.message;
        }
        addData(new_data);
    } else {
        self.port.emit('generic message', new_message);
    }
}, false);
