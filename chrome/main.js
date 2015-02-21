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

// The global script is injected on every page.
addScriptToDom('data/js/global.js');

// For pages where the pathname varies.
function findScript(path) {
    'use strict';
    if (path.indexOf('/profile/') >= 0) {
        // Profile
        return addScriptToDom('data/js/profile.js');
    }
    if (path.indexOf('/groups/') >= 0) {
        return addScriptToDom('data/js/groups.js');
    }
}

// Check if the user is in a game.
if (parseInt(location.port, 10) >= 8000) {
    addScriptToDom('data/js/game.js');
} else {
    switch (location.pathname) {
    case '/':
        addScriptToDom('data/js/homepage.js');
        break;
    case '/groups/':
        break;
    case '/boards':
        addScriptToDom('data/js/boards.js');
        break;
    default:
        findScript(location.pathname);
        break;
    }
}

// Get data from Chrome's storage.
function getChromeData(request, callback) {
    'use strict';
    chrome.storage.local.get(request, function(items) {
        callback(items);
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
}, false);

// Request default settings and populate storage.
var new_request = new XMLHttpRequest();
new_request.addEventListener('load', function(){
    'use strict';
    var i,
        defaults = JSON.parse(this.responseText);
    function checkDefaults(items) {
        var x;
        if (typeof items[i] === 'undefined') {
            var new_data = {};
            new_data[i] = defaults[i];
            return addChromeData(new_data);
        }
        for (x in items[i]) {
            if (items[i].hasOwnProperty(x)) {
                getChromeData(items[i][x], checkDefaults);
            }
        }
    }
    for (i in defaults) {
        if (defaults.hasOwnProperty(i)) {
            getChromeData(i, checkDefaults);
        }
    }
});
new_request.open("get", chrome.extension.getURL('data/json/defaults.json'), true);
new_request.send();
