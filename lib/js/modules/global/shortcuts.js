module.exports = (() => {
    'use strict';
    let shortcuts = [];
    // Fire keyboard shortcuts.
    document.addEventListener('keyup', (event) => {
        if (event.target.nodeName !== 'BODY') {
            return;
        }
        let shortcut_list = shortcuts.filter(shortcut => {
            if (shortcut.key === event.keyCode) {
                if (Object.keys(shortcut.options).every(x => {

                    // Check if the shift, alt, and ctrl keys match.
                    return event[x] === shortcut.options[x];
                })) {
                    return shortcut;
                }
            }
        });
        if (shortcut_list) {
            shortcut_list.forEach(shortcut => {
                shortcut.follow();
            });
        }
    });
    return {
        set: (key_code, new_function, options) => {
            if (!options) {
                options = {};
            }
            let shortcut = {};
            shortcut.key = key_code;
            if (typeof new_function === 'function') {
                shortcut.follow = new_function;
            } else {
                shortcut.follow = function () {};
            }
            shortcut.options = {};
            shortcut.options.altKey = (options.altKey) ? true : false;
            shortcut.options.ctrlKey = (options.ctrlKey) ? true : false;
            shortcut.options.shiftKey = (options.shiftKey) ? true : false;
            shortcuts.push(shortcut);
        },
        get: (key_code) => {
            if (!key_code) {
                return;
            }
            let shortcut_list = shortcuts.filter(shortcut => {
                if (shortcut.key === event.keyCode) {
                    return shortcut;
                }
            });
            if (shortcut_list) {
                return shortcut_list;
            }
            return false;
        }, macros: {
            set: (key_code, toAll, message, options) => {
                tagpro.tools.global.shortcuts.set(key_code, () => {
                    tagpro.socket.emit('chat', {
                        'toAll': toAll,
                        'message': message
                    });
                }, options);
            }
        }
    };
})();
