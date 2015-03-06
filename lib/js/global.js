/* jshint devel:true */
/* jshint esnext: true */
/* global tagpro */

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
    let shortcuts = tagpro.tools.global.shortcuts;
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
    let shortcuts = this.shortcuts;
    if (shortcuts[event.keyCode]) {
        let shortcut = shortcuts[event.keyCode],
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
    let buttons = document.getElementsByClassName(class_name),
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
    let button = this.findClassByLink(class_name, link);
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

function clone(obj) {
    'use strict';
    if (obj === null || typeof(obj) !== 'object') {
        return obj;
    }
    let temp = obj.constructor(); // changed

    for(let key in obj) {
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
        if (!message) {
            return;
        }
        tagpro.tools.settings = message;
    });
}

function loadMenu() {
    'use strict';
    window.postMessage({
        type: 'menu request',
        sender: 'menu request'
    }, location.href);
    messageCallbacks['menu request'] = function(menu_settings) {
        tagpro.tools.menu = menu_settings;
    };
}

loadSettings();
loadMenu();

// Add sound menu if it does not exist.
if (!document.getElementById('sound')) {
    let new_sound = document.createElement('div');
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
    let tools_settings = document.createElement('aside'),
        menu = tagpro.tools.menu,
        i;
    tools_settings.classList.add('tools-settings');
    tools_settings.id = 'tools-settings';
    function newSection(name, type) {
        let new_section = document.createElement(type);
        new_section.id = name;
        if (type === 'section') {
            new_section.classList.add('tools-settings-section');
        }
        return new_section;
    }
    function newButton(name, section) {
        let button = newSection(name, 'button');
        button.textContent = name;
        button.classList.add('button');
        button.addEventListener('click', function() {
            for (let i = 0; i < document.getElementsByClassName('tools-settings-section').length; i++) {
                document.getElementsByClassName('tools-settings-section')[i].style.display = (document.getElementsByClassName('tools-settings-section')[i].id === section) ? 'inline' : 'none';
            }
        });
        return button;
    }
    function newHeader(text, type) {
        let heading = document.createElement(type);
        heading.textContent = text;
        heading.id = text;
        return heading;
    }
    function newInput(key) {
        let new_div = document.createElement('div'),
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
        let new_div = document.createElement('div'),
            i;

        if (obj.children) {
            if (typeof obj.children === 'object') {
                new_section.appendChild(newHeader(obj.identity, 'h4'));
                new_div.appendChild(menuObject(obj.children));
            }
        } else if (typeof obj.default !== 'undefined') {
            let new_input_key = {};
            new_input_key.identity = obj.identity;
            new_input_key.value = obj.default;
            new_div.appendChild(newInput(new_input_key));
        } else if (typeof obj === 'object') {
            let new_input_key = {};
            for (i in obj) {
                if (!obj.hasOwnProperty(i)) {
                    continue;
                }
                new_input_key.identity = i;
                new_input_key.value = obj[i];
                new_div.appendChild(newInput(new_input_key));
            }
        }
        return new_div;
    }
    let button_area = newSection('tools-settings-buttons', 'div');
    tools_settings.appendChild(button_area);
    for (i in menu) {
        if (!menu.hasOwnProperty(i)) {
            continue;
        }
        var new_section = newSection(i, 'section');
        new_section.appendChild(newHeader(menu[i].identity, 'h3'));
        new_section.appendChild(newHeader(menu[i].description, 'h5'));
        button_area.appendChild(newButton(menu[i].identity, i));
        if (typeof menu[i].children === 'object') {
            for (let y in menu[i].children) {
                if (!menu[i].children.hasOwnProperty(y)) {
                    continue;
                }
                new_section.appendChild(menuObject(menu[i].children[y]));
            }
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
    let new_message = event.data;
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
    let files = event.dataTransfer.files,
        i,
        read_image = function(read) {
            console.log(read.target.result);
            document.documentElement.style.background = 'url(' + read.target.result + ')';
            document.documentElement.style.backgroundRepeat = 'no-repeat';
            document.documentElement.style.backgroundAttachment = 'fixed';
            document.documentElement.style.backgroundPosition = 'center center';
            document.documentElement.style.backgroundSize = 'cover';
        };
    for (i = 0; i < files.length; i++) {
        if (files[i].type.indexOf('image') !== 0) {
            continue;
        }
        let reader = new FileReader();
        reader.onload = read_image;
        reader.readAsDataURL(files[i]);
    }
    console.log(files);
});

function loadOptionalScripts() {
    'use strict';
    let i,
        x = 0,
        current_page;
    for (i in tagpro.tools.settings) {
        if (!tagpro.tools.settings.hasOwnProperty(i)) {
            continue;
        }
        x++;
    }
    if (!x) {
        return setTimeout(loadOptionalScripts, 1000);
    }

    if (parseInt(location.port, 10) >= 8000) {
        current_page = 'game';
    } else {
        switch (location.pathname) {
        case '/':
            current_page = 'home';
            break;
        case '/boards':
            current_page = 'boards';
            break;
        default:
            if (location.pathname.indexOf('/profile/') >= 0) {
                current_page = 'profile';
            }
            if (location.pathname.indexOf('/groups/') >= 0) {
                current_page = 'group';
            }
            break;
        }
    }

    for (i in tagpro.tools.optional) {
        if (tagpro.tools.optional.hasOwnProperty(i)) {
            if (tagpro.tools.settings.functions[current_page][i]) {
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