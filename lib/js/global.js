/* jshint devel:true */
/* jshint esnext: true */
/* global tagpro */


tagpro.tools.global.shortcuts = (function() {
    'use strict';
    var shortcuts = {};
    return {
        set: function (key_code, object, options) {
            if (!options) {
                options = {};
            }
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
        },
        get: function(key_code) {
            if (!key_code) {
                return;
            }
            if (shortcuts[key_code]) {
                return shortcuts[key_code];
            }
            return false;
        },
        handle: function (event) {
            if (this.get(event.keyCode)) {
                let shortcut = this.get(event.keyCode),
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
        },
        addToButton: function (class_name, link, to_add, keycode, options) {
            if (!options) {
                options = {};
            }
            let button = this.findClassByLink(class_name, link);
            if (button) {
                button.innerHTML = to_add + button.innerHTML;
                this.set(keycode, button, options);
            }
        },
        findClassByLink: function (class_name, link) {
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
        }
    };
})();

// Fire keyboard shortcuts.
document.addEventListener('keyup', function (event) {
    'use strict';
    tagpro.tools.global.shortcuts.handle(event);
});

// Shortcut is always on.
tagpro.tools.global.shortcuts.set(38, '/', {
    ctrlKey: true
});

tagpro.tools.global.data = (function() {
    'use strict';

    // Stores the callbacks before they are fired.
    var messageCallbacks = {};

    // Handle communications between the client and the extension.
    window.addEventListener('message', function(event) {
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
    return {
        get: function(sender, message, callback) {
            /**
             * Tools' communication function.
             * @author Carl Colglazier
             * @param {string} sender - The name of the request.
             *     Sort of like the return address on a letter.
             * @param {Object|string} message - The message being passed.
             * @param {function} callback
             */
            window.postMessage({
                type: 'request',
                sender: sender,
                message: message
            }, location.href);
            messageCallbacks[sender] = callback;
        },
        emit: function(type, sender, callback) {

            // For custom messages.
            window.postMessage({
                type: type,
                sender: sender
            }, location.href);
            messageCallbacks[sender] = callback;
        }
    };
})();

function addBackground(uri) {
    'use strict';
    document.documentElement.style.background = 'url(' + uri + ')';
    document.documentElement.style.backgroundRepeat = 'no-repeat';
    document.documentElement.style.backgroundAttachment = 'fixed';
    document.documentElement.style.backgroundPosition = 'center center';
    document.documentElement.style.backgroundSize = 'cover';
}

function updateBackground(uri) {
    'use strict';
    addBackground(uri);
    tagpro.tools.textures.background = uri;
}


function addButton() {
    'use strict';

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
}

// Get the settings (this is needed on every page).
function loadSettings() {
    'use strict';
    tagpro.tools.global.data.emit('settings request','settings request', function(settings) {
        tagpro.tools.settings = settings;
        addBackground(settings.values.background);
    });
}

loadSettings();
addButton();

tagpro.tools.global.openSettings = function() {
    'use strict';
    let tools_settings = document.createElement('aside'),
        tree = tagpro.tools.settings.tree,
        menu = tagpro.tools.settings.menu;
    tools_settings.classList.add('tools-settings');
    tools_settings.id = 'tools-settings';
    function onSettingsChange(event) {
        console.log(event);
        let settings = document.getElementById('tools-settings').getElementsByTagName('input'),
            settings_object = {};
        console.log(event.target.type);
        for (let i in settings) {
            if (!settings.hasOwnProperty(i)) {
                continue;
            }
            if (!settings[i].id) {
                continue;
            }
            settings_object[settings[i].id] = (settings[i].checked) ? settings[i].checked : settings[i].value;
        }
        console.log(settings_object);

    }
    function generateSettingsSection(metadata, children) {
        let new_section = document.createElement('section'),
            section_header = document.createElement('h4');
        new_section.classList.add('tools-settings-section');
        section_header.textContent = metadata.identity;
        new_section.appendChild(section_header);
        for (let i in children) {
            if (!children.hasOwnProperty(i)) {
                continue;
            }
            let new_input = document.createElement('input'),
                new_label = document.createElement('label'),
                listener_type;
            if (menu[i]) {
                new_label.textContent = menu[i].identity;
            } else {
                new_label.textContent = i;
            }
            switch(typeof children[i]) {
            case 'boolean':
                new_input.type = 'checkbox';
                new_input.checked = children[i];
                listener_type = 'change';
                break;
            case 'number':
                new_input.type = 'number';
                listener_type = 'input';
                break;
            case 'string':
                new_input.type = 'text';
                listener_type = 'input';
                break;
            default:
                break;
            }
            new_input.value = children[i];
            new_input.id = i;
            new_input.addEventListener(listener_type, onSettingsChange);
            new_label.htmlFor = i;
            new_section.appendChild(new_label);
            new_section.appendChild(new_input);
        }
        return new_section;
    }
    for (let i in tree) {
        if (!tree.hasOwnProperty(i)) {
            continue;
        }
        tools_settings.appendChild(generateSettingsSection(menu[i], tree[i]));
    }
    document.body.appendChild(tools_settings);
};

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
            updateBackground(read.target.result);
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
    console.log(current_page);
    for (i in tagpro.tools.optional) {
        if (tagpro.tools.optional.hasOwnProperty(i)) {
            if (tagpro.tools.settings.tree.functions[i] && tagpro.tools.settings.pages[current_page].indexOf(i) >= 0) {
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