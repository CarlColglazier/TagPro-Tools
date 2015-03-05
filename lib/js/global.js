/* jshint devel:true */
var tagpro = (tagpro) ? tagpro : window.tagpro;

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

/*
 * Convert the settings object from something usable by the settings menu
 *     to a parseable format to be used by the program itself.
 */
function flattenSettings(data, callback) {
    'use strict';
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
                if (obj[i].value) {
                    if (typeof obj[i].value === 'object') {
                        obj[i] = flattenObject(obj[i].value);
                    } else {
                        obj[i] = obj[i].value;
                    }
                }
            }
        }
        return obj;
    }
    callback(flattenObject(data));
}

function clone(obj) {
    'use strict';
    if (obj === null || typeof(obj) !== 'object') {
        return obj;
    }
    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}

// Get the settings (this is needed on every page).
function loadSettings() {
    'use strict';
    tagpro.tools.global.getData('starter settings', 'settings', function (message) {
        if (!message.settings) {
            return;
        }
        tagpro.tools.menu = message.settings.value;
        var message_copy = clone(message);
        flattenSettings(message_copy, function (obj) {
            tagpro.tools.settings = obj.settings;
        });
    });
}

loadSettings();

// Add sound menu if it does not exist.
if (!document.getElementById('sound')) {
    var new_sound = document.createElement('div');
    new_sound.id = 'sound';
    document.body.appendChild(new_sound);
}
var tools_logo = document.createElement('button');
tools_logo.textContent = 't';
tools_logo.classList.add('tools-logo-button');
tools_logo.addEventListener('click', function(event) {
    'use strict';
    if (!document.getElementById('tools-settings')) {
        tagpro.tools.global.openSettings();
        event.target.textContent = 'x';
    } else {
        document.getElementById('tools-settings').parentElement.removeChild(document.getElementById('tools-settings'));
        event.target.textContent = 't';
        loadSettings();
    }
});
document.getElementById('sound').appendChild(tools_logo);

tagpro.tools.global.openSettings = function() {
    'use strict';
    var tools_settings = document.createElement('aside'),
        menu = tagpro.tools.menu,
        i;
    tools_settings.classList.add('tools-settings');
    tools_settings.id = 'tools-settings';
    function newSection(name, type) {
        var new_section = document.createElement(type);
        new_section.id = name;
        if (type === 'section') {
            new_section.classList.add('tools-settings-section');
        }
        return new_section;
    }
    function newButton(name, section) {
        var button = newSection(name, 'button');
        button.textContent = name;
        button.classList.add('button');
        button.addEventListener('click', function() {
            var i;
            console.log(section);
            for (i = 0; i < document.getElementsByClassName('tools-settings-section').length; i++) {
                console.log(document.getElementsByClassName('tools-settings-section')[i].id);
                document.getElementsByClassName('tools-settings-section')[i].style.display = (document.getElementsByClassName('tools-settings-section')[i].id === section) ? 'inline' : 'none';
            }
        });
        return button;
    }
    function newHeader(text, type) {
        var heading = document.createElement(type);
        heading.textContent = text;
        heading.id = text;
        return heading;
    }
    function newInput(key) {
        var new_div = document.createElement('div'),
            new_input = newSection(key.identity, 'input'),
            new_label = document.createElement('label'),
            value = key.value;
        new_input.value = value;
        new_label.htmlFor = key.identity;
        new_label.textContent = key.identity;
        switch(typeof value) {
        case 'boolean':
            new_input.type = 'checkbox';
            new_input.checked = value;
            break;
        case 'number':
            new_input.type = 'number';
            break;
        case 'string':
            new_input.type = 'text';
            break;
        default:
            break;
        }
        new_div.appendChild(new_label);
        new_div.appendChild(new_input);
        return new_div;
    }
    function menuObject(obj) {
        var new_div = document.createElement('div'),
            i;
        if (obj.value) {
            if (typeof obj.value === 'object') {
                new_section.appendChild(newHeader(obj.identity, 'h4'));
                new_div.appendChild(menuObject(obj.value));
            } else {
                new_div.appendChild(newInput(obj));
            }
        } else if (typeof obj === 'object') {
            var new_input_key = {};
            for (i in obj) {
                if (!obj.hasOwnProperty(i)) {
                    continue;
                }
                new_input_key.identity = i;
                new_input_key.value = obj[i];
                new_div.appendChild(menuObject(new_input_key));
            }
        }
        return new_div;
    }
    var button_area = newSection('tools-settings-buttons', 'div');
    tools_settings.appendChild(button_area);
    for (i in menu) {
        if (!menu.hasOwnProperty(i)) {
            continue;
        }
        var new_section = newSection(i, 'section');
        new_section.appendChild(newHeader(menu[i].identity, 'h3'));
        new_section.appendChild(newHeader(menu[i].description, 'h5'));
        button_area.appendChild(newButton(menu[i].identity, i));
        switch (typeof menu[i].value) {
        case 'object':
            var y;
            for (y in menu[i].value) {
                if (!menu[i].value.hasOwnProperty(y)) {
                    continue;
                }
                new_section.appendChild(menuObject(menu[i].value[y]));
            }
            break;
        default:
            break;
        }
        tools_settings.appendChild(new_section);
    }
    document.body.appendChild(tools_settings);
};

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
    var files = event.dataTransfer.files,
        i;
    for (i = 0; i < files.length; i++) {
        if (files[i].type.indexOf('image') !== 0) {
            continue;
        }
        var reader = new FileReader();
        reader.onload = function(read) {
            console.log(read.target.result);
            document.documentElement.style.background = 'url(' + read.target.result + ')';
            document.documentElement.style.backgroundRepeat = 'no-repeat';
            document.documentElement.style.backgroundAttachment = 'fixed';
            document.documentElement.style.backgroundPosition = 'center center';
            document.documentElement.style.backgroundSize = 'cover';
        };
        reader.readAsDataURL(files[i]);
    }
    console.log(files);
});

function loadOptionalScripts() {
    'use strict';
    var i,
        x = 0;
    for (i in tagpro.tools.settings) {
        if (!tagpro.tools.settings.hasOwnProperty(i)) {
            continue;
        }
        x++;
    }
    if (!x) {
        return setTimeout(loadOptionalScripts, 1000);
    }

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