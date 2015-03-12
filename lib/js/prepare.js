/* jshint esnext: true */

var tagpro = (tagpro) ? tagpro : window.tagpro;

tagpro.tools = {
    global: {},
    optional: {},
    settings: {}
};

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
        get: function(sender, callback) {
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
                sender: sender
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
        },
        set: function(type, values) {
            window.postMessage({
                type: 'setter',
                sender: type,
                message: values
            }, location.href);
        }
    };
})();

tagpro.tools.global.menu = (function() {
    'use strict';
    var menu_items = {};
    function openMenuSection(name) {
        if (document.getElementById(name)) {
            for (let i = 0; i < document.getElementsByClassName('tools-menu-section').length; i++) {
                document.getElementsByClassName('tools-menu-section')[i].style.display = 'none';
            }
            document.getElementById(name).style.display = 'flex';
        }
    }
    return {
        open: function () {
            function createButton(button_name) {
                let new_button = document.createElement('button');
                new_button.textContent = button_name;
                new_button.classList.add('button');
                new_button.classList.add('small');
                new_button.addEventListener('click', function(event) {
                    openMenuSection(event.target.textContent);
                });
                return new_button;
            }
            let tools_settings = document.createElement('div'),
                tools_button_area = document.createElement('div');
            tools_settings.classList.add('tools-settings');
            tools_settings.id = 'tools-settings';
            tools_button_area.id = 'tools-menu-buttons';
            tools_settings.appendChild(tools_button_area);
            for (let i in menu_items) {
                if (!menu_items.hasOwnProperty(i)) {
                    continue;
                }
                if (!menu_items[i].classList.contains('tools-menu-section')) {
                    menu_items[i].classList.add('tools-menu-section');
                }
                tools_button_area.appendChild(createButton(i));
                tools_settings.appendChild(menu_items[i]);
            }
            document.body.appendChild(tools_settings);
            openMenuSection('Settings');
        }, setSection: function(section_name, section_html) {
            try {
                section_html.id = section_name;
            } catch (e) {
                return;
            }
            menu_items[section_name] = section_html;
        }
    };
})();

tagpro.tools.global.shortcuts = (function() {
    'use strict';
    var shortcuts = {};
    // Fire keyboard shortcuts.
    document.addEventListener('keyup', function (event) {
        if (event.target.nodeName !== 'BODY') {
            return;
        }
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
    });
    return {
        set: function (key_code, new_function, options) {
            if (!options) {
                options = {};
            }
            shortcuts[key_code] = {};
            if (typeof new_function === 'function') {
                shortcuts[key_code].follow = new_function;
            } else {
                shortcuts[key_code].follow = function () {};
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
        }, macros: {
            /**
             *
             * @param key_code
             * @param toAll
             * @param message
             * @param options
             */
            set: function (key_code, toAll, message, options) {
                tagpro.tools.global.shortcuts.set(key_code, function () {
                    tagpro.socket.emit('chat', {
                        'toAll': toAll,
                        'message': message
                    });
                }, options);
            }
        }
    };
})();