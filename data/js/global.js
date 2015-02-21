/* jshint devel:true */
/* global tagpro */

tagpro.tools = {
    global: {
        shortcuts: {}
    },
    optional: {},
    settings: {
        functions: {}
    }
};

/**
 * Create a new keyboard shortcut.
 * @param {number} key_code - A keyboard key.
 * @param object
 * @param {Object} [options]
 */
tagpro.tools.global.addShortcut = function(key_code, object, options) {
    'use strict';
    if (!options) {
        options = {};
    }
    var shortcuts = tagpro.tools.global.shortcuts;
    shortcuts[key_code] = {};
    if (typeof object === 'function') {
        shortcuts[key_code].follow = object;
    } else if (typeof object === 'string') {
        shortcuts[key_code].follow = function () {
            location.pathname = object;
        };
    } else {
        shortcuts[key_code].follow = function () {
            object.click();
        };
    }
    shortcuts[key_code].options = {};
    shortcuts[key_code].options.altKey = (options.altKey) ? true : false;
    shortcuts[key_code].options.ctrlKey = (options.ctrlKey) ? true : false;
    shortcuts[key_code].options.shiftKey = (options.shiftKey) ? true : false;
};

/**
 * Fired when a key is pressed.
 * @param event
 */
tagpro.tools.global.handleShortcut = function(event) {
    'use strict';
    var shortcuts = this.shortcuts;
    if (shortcuts[event.keyCode]) {
        var shortcut = shortcuts[event.keyCode],
            x;
        for (x in shortcut.options) {
            if (shortcut.options.hasOwnProperty(x)) {
                if (event[x] !== shortcut.options[x]) {
                    return;
                }
            }
        }
        shortcut.follow();
    }
};

/**
 * Used to find a specific button, since most of them don't have ids.
 * @param {string} class_name - The element's class name.
 * @param {string} link - The element's href.
 * @returns {*} - Either the element or null.
 */
tagpro.tools.global.findClassByLink = function(class_name, link) {
    'use strict';
    var buttons = document.getElementsByClassName(class_name),
        x;
    for (x = 0; x < buttons.length; x++) {
        if (!buttons[x].href) {
            continue;
        }
        if (buttons[x].href.indexOf(link) >= 0) {
            return buttons[x];
        }
    }
    return null;
};

/**
 * Tie a keyboard shortcut to a specific button and add a marker.
 * @param {string} class_name
 * @param {string} link
 * @param {string} to_add
 * @param {number} keycode
 * @param {Object} [options]
 */
tagpro.tools.global.addToButton = function(class_name, link, to_add, keycode, options) {
    'use strict';
    if (!options) {
        options = {};
    }
    var button = this.findClassByLink(class_name, link);
    if (button) {
        button.innerHTML = to_add + button.innerHTML;
        this.addShortcut(keycode, button, options);
    }
};


// Fire keyboard shortcuts.
document.addEventListener('keyup', function (event) {
    'use strict';
    tagpro.tools.global.handleShortcut(event);
});

// Shortcut is always on.
tagpro.tools.global.addShortcut(38, '/', {
    ctrlKey: true
});


// Stores the callbacks before they are fired.
var messageCallbacks = {};

/**
 * Tools' communication function.
 * @author Carl Colglazier
 * @param {string} sender - The name of the request.
 *     Sort of like the return address on a letter.
 * @param {Object|string} message - The message being passed.
 * @param {function} callback
 */
tagpro.tools.global.getData = function(sender, message, callback) {
    'use strict';
    window.postMessage({
        type: 'request',
        sender: sender,
        message: message
    }, location.href);
    messageCallbacks[sender] = callback;
};

// Get the settings (this is needed on every page).
tagpro.tools.global.getData('settings', 'settings', function(message) {
    'use strict';
    if (!message.settings) {
        return;
    }
    tagpro.tools.settings = message.settings;
});

// Handle communications between the client and the extension.
window.addEventListener('message', function(event) {
    'use strict';
    if (event.origin !== location.origin || !event.data) {
        return;
    }
    if (!event.data.type || !event.data.message || !event.data.sender) {
        return;
    }
    var new_message = event.data;
    if (new_message.type === 'response') {
        messageCallbacks[new_message.sender](new_message.message);
        delete messageCallbacks[new_message.sender];
    }
}, false);

// TODO: Loading of themes.

// Prevents the page from redirecting when a file in dropped on it.
document.documentElement.addEventListener('dragover', function(event) {
    'use strict';
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
});

document.documentElement.addEventListener('drop', function(event) {
    'use strict';
    event.stopPropagation();
    event.preventDefault();
    console.log(event);
    var files = event.dataTransfer.files;
    console.log(files);
});

function loadOptionalScripts() {
    'use strict';
    if (typeof tagpro.tools.optional === 'undefined') {
        setTimeout(loadOptionalScripts, 1000);
    }
    var i;
    for (i in tagpro.tools.optional) {
        if (tagpro.tools.optional.hasOwnProperty(i)) {
            if (tagpro.tools.settings.functions[i]) {
                tagpro.tools.optional[i]();
            }
        }
    }
}

// Load optional scripts.
tagpro.ready(function() {
    'use strict';
    loadOptionalScripts();
});