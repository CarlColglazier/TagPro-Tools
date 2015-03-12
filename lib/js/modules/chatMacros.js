/* global tagpro */
/* jshint esnext: true */

/**
 * One-key chat messages.
 * @author TerraMaris
 * @author Carl Colglazier
 */
tagpro.tools.optional.chatMacros = (() => {
    'use strict';
    return {
        game: () => {
            for (let macro of tagpro.tools.settings.macros) {
                tagpro.tools.global.shortcuts.macros.set(macro.key_code, macro.toAll, macro.message, macro.options);
            }
        },
        menu: () => {
            tagpro.tools.global.data.get('macros', (items) => {
                tagpro.tools.settings.macros = items;
                tagpro.tools.global.menu.setSection('Macros', (() => {
                    let tools_settings = document.createElement('div'),
                        label_div = document.createElement('div'),
                        add_button = document.createElement('button'),
                        input_labels = [
                            'Key code',
                            'Send to all',
                            'Message',
                            'Alt key',
                            'Ctrl key',
                            'Shift key',
                            'Remove'
                        ],
                        update_macros = () => {
                            let macro_list = [];
                            for (let i = 0; i < document.getElementsByClassName('macro-data').length; i++) {
                                if (document.getElementsByClassName('macro-data')[i].getElementsByTagName('input').length !== 6) {
                                    continue;
                                }
                                if (!parseInt(document.getElementsByClassName('macro-data')[i].getElementsByTagName('input')[0].id, 10)) {
                                    continue;
                                }
                                let new_macro = {},
                                    current_macro = document.getElementsByClassName('macro-data')[i];
                                new_macro.key_code = parseInt(current_macro.getElementsByTagName('input')[0].id, 10);
                                new_macro.toAll = current_macro.getElementsByTagName('input')[1].checked;
                                new_macro.message = current_macro.getElementsByTagName('input')[2].value;
                                new_macro.options = {};
                                new_macro.options.altKey = current_macro.getElementsByTagName('input')[3].checked;
                                new_macro.options.ctrlKey = current_macro.getElementsByTagName('input')[4].checked;
                                new_macro.options.shiftKey = current_macro.getElementsByTagName('input')[5].checked;
                                macro_list.push(new_macro);
                            }
                            tagpro.tools.global.data.set('macros', macro_list);
                            tagpro.tools.global.data.get('macros', (items) => {
                                tagpro.tools.settings.macros = items;
                            });
                        };
                    class MacroMenu {
                        constructor(key_code, toAll, message, options) {
                            this.key_code = key_code;
                            this.toAll = toAll;
                            this.message = message;
                            this.altKey = (options.altKey) ? true : false;
                            this.ctrlKey = (options.ctrlKey) ? true : false;
                            this.shiftKey = (options.shiftKey) ? true : false;
                        }
                        toDom() {
                            let new_div = document.createElement('div'),
                                delete_button = document.createElement('button'),
                                niceKeyCodes = {
                                    8: "backspace",
                                    9: "tab",
                                    13: "enter",
                                    16: "shift",
                                    17: "ctrl",
                                    18: "alt",
                                    19: "pause/break",
                                    20: "caps lock",
                                    27: "escape",
                                    33: "page up",
                                    34: "page down",
                                    35: "end",
                                    36: "home",
                                    37: "left arrow",
                                    38: "up arrow",
                                    39: "right arrow",
                                    40: "down arrow",
                                    45: "insert",
                                    46: "delete",
                                    91: "left window",
                                    92: "right window",
                                    93: "select key",
                                    96: "numpad 0",
                                    97: "numpad 1",
                                    98: "numpad 2",
                                    99: "numpad 3",
                                    100: "numpad 4",
                                    101: "numpad 5",
                                    102: "numpad 6",
                                    103: "numpad 7",
                                    104: "numpad 8",
                                    105: "numpad 9",
                                    106: "multiply",
                                    107: "add",
                                    109: "subtract",
                                    110: "decimal point",
                                    111: "divide",
                                    112: "F1",
                                    113: "F2",
                                    114: "F3",
                                    115: "F4",
                                    116: "F5",
                                    117: "F6",
                                    118: "F7",
                                    119: "F8",
                                    120: "F9",
                                    121: "F10",
                                    122: "F11",
                                    123: "F12",
                                    144: "num lock",
                                    145: "scroll lock",
                                    186: ",",
                                    187: "=",
                                    188: ",",
                                    189: "-",
                                    190: ".",
                                    191: "/",
                                    192: "`",
                                    219: "[",
                                    220: "\\",
                                    221: "]",
                                    222: "'"
                                };
                            new_div.classList.add('macro');
                            new_div.classList.add('macro-data');
                            let newInput = (value, position) => {
                                let new_input = document.createElement('input'),
                                    listener_type = 'input';
                                new_input.classList.add('macro');
                                new_input.value = value;
                                new_input.placeholder = input_labels[position];
                                switch (typeof value) {
                                case 'boolean':
                                    new_input.type = 'checkbox';
                                    new_input.checked = value;
                                    listener_type = 'change';
                                    break;
                                case 'number':
                                case 'string':
                                    new_input.type = 'text';
                                    break;
                                default:
                                    break;
                                }
                                switch (position) {
                                case 0:
                                    new_input.id = value;
                                    new_input.value = niceKeyCodes[value] || String.fromCharCode(value);
                                    new_input.addEventListener('keydown', (event) => {
                                        event.target.id = event.keyCode;
                                        event.target.value = niceKeyCodes[event.keyCode] || String.fromCharCode(event.keyCode);
                                    });
                                    break;
                                case 1:
                                    new_input.id = 'toAll';
                                    break;
                                case 2:
                                    new_input.id = 'message';
                                    break;
                                case 3:
                                    new_input.id = 'altKey';
                                    break;
                                case 4:
                                    new_input.id = 'ctrlKey';
                                    break;
                                case 5:
                                    new_input.id = 'shiftKey';
                                    break;
                                }
                                new_input.addEventListener(listener_type, update_macros);
                                return new_input;
                            };
                            new_div.appendChild(newInput(this.key_code, 0));
                            new_div.appendChild(newInput(this.toAll, 1));
                            new_div.appendChild(newInput(this.message, 2));
                            new_div.appendChild(newInput(this.altKey, 3));
                            new_div.appendChild(newInput(this.ctrlKey, 4));
                            new_div.appendChild(newInput(this.shiftKey, 5));
                            delete_button.textContent = 'Delete';
                            delete_button.classList.add('macro');
                            delete_button.addEventListener('click', (event) => {
                                event.target.parentNode.parentNode.removeChild(event.target.parentNode);
                                update_macros();
                            });
                            new_div.appendChild(delete_button);
                            return new_div;
                        }
                    }
                    add_button.textContent = 'New macro';
                    add_button.addEventListener('click', () => {
                        tools_settings.appendChild(new MacroMenu(0, true, '', {}).toDom());
                    });
                    tools_settings.appendChild(add_button);
                    for (let i of input_labels) {
                        let new_label = document.createElement('p');
                        new_label.textContent = i;
                        new_label.classList.add('macro');
                        label_div.appendChild(new_label);
                    }
                    label_div.classList.add('macro');
                    tools_settings.appendChild(label_div);
                    try {
                        for (let macro of tagpro.tools.settings.macros) {
                            tools_settings.appendChild(new MacroMenu(macro.key_code, macro.toAll, macro.message, macro.options).toDom());
                        }
                    } catch(e) {

                        // Make the macros as array.
                        tagpro.tools.global.data.set('macros', []);
                        tagpro.tools.global.data.get('macros', (items) => {
                            tagpro.tools.settings.macros = items;
                        });
                    }
                    return tools_settings;
                })());
            });
        }
    };
})();