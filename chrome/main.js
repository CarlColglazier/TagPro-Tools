/*global chrome */

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
    chrome.storage.local.get(request, callback);
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
}, false);

// Request default settings and populate storage.
var new_request = new XMLHttpRequest();
new_request.addEventListener('load', function(){
    'use strict';

    // Sync defaults with local storage.
    var i,
        defaults = JSON.parse(this.responseText);
    function checkDefaults(items) {
        var needs_change = false,
            new_data = (items[i]) ? items[i] : {};
        if (typeof items[i] === 'undefined') {
            new_data[i] = defaults[i];
            return addChromeData(new_data);
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
        if (needs_change) {
            addChromeData(change_data);
        }
    }
    for (i in defaults) {
        if (defaults.hasOwnProperty(i)) {
            getChromeData(i, checkDefaults);
        }
    }

    // Inject scripts //
    addScriptToDom('lib/js/prepare.js');

    // For pages where the pathname varies.
    function findScript(path) {
        if (path.indexOf('/profile/') >= 0) {
            // Profile
            return addScriptToDom('lib/js/profile.js');
        }
        if (path.indexOf('/groups/') >= 0) {
            return addScriptToDom('lib/js/groups.js');
        }
    }

    // Check if the user is in a game.
    if (parseInt(location.port, 10) >= 8000) {
        for (i in defaults.settings.value.functions.value) {
            if (!defaults.settings.value.functions.value.hasOwnProperty(i)) {
                continue;
            }
            if (defaults.settings.value.functions.value[i].uses.indexOf('game') < 0) {
                continue;
            }
            addScriptToDom('lib/js/game/' + i + '.js');
        }

        // TODO: Pull textures from extension data.
        document.getElementById('tiles').src = chrome.extension.getURL('lib/img/tiles.png');
        document.getElementById('speedpad').src = chrome.extension.getURL('lib/img/speedpad.png');
        document.getElementById('speedpadred').src = chrome.extension.getURL('lib/img/speedpadred.png');
        document.getElementById('speedpadblue').src = chrome.extension.getURL('lib/img/speedpadblue.png');
        document.getElementById('portal').src = chrome.extension.getURL('lib/img/portal.png');
        document.getElementById('splats').src = chrome.extension.getURL('lib/img/splats.png');
    } else {
        switch (location.pathname) {
        case '/':
            addScriptToDom('lib/js/homepage.js');
            break;
        case '/groups/':
            break;
        case '/boards':
            addScriptToDom('lib/js/boards.js');
            break;
        default:
            findScript(location.pathname);
            break;
        }
    }

    // The global script is injected on every page.
    addScriptToDom('lib/js/global.js');
});
new_request.open("get", chrome.extension.getURL('lib/json/defaults.json'), true);
new_request.send();
