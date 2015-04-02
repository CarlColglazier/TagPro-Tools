module.exports = (() => {
    'use strict';
    let shortcuts = {};
    // Fire keyboard shortcuts.
    document.addEventListener('keyup', (event) => {
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
        set: (key_code, new_function, options) => {
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
        get: (key_code) => {
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
