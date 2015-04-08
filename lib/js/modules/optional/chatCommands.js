/**
 * Add commandline-esque commands to chat.
 * @author Carl Colglazier
 */

// Some useful regex function.
// Each one searches for different possible formats.
const re = /\-{1,2}\w+/,
    re_no_arguement = /\-{1,2}\w+(?!\s\w+)/g,
    re_with_arguement = /\-{1,2}\w+ \w+/g;

/**
 * Transform the message to all caps.
 * @param {stirng} message
 * @returns {string}
 */
function capitalize(message) {
    'use strict';
    return message.toUpperCase();
}

// flag => function
var command_list = {
    '-c': 'uppercase',
    '-t': 'team'
};

/**
 * Finally, process the commands.
 * @param {object[]|string} command_list
 * @param {string} message
 * @returns {*}
 */
function finalProcess(command_list, message) {
    'use strict';
    if (typeof command_list === 'string') {
        command_list = [command_list];
    }
    if (command_list.indexOf('uppercase') >= 0) {
        message = capitalize(message);
    }
    if (command_list.indexOf('team') >= 0) {
        tagpro.socket.emit('chat', {
            toAll: false,
            message: message
        });
        return '';
    }
    return message;
}

/**
 * Bite-sized little replacements.
 * @param {string} current_match
 * @returns {string}
 */
function processArguments(current_match) {
    'use strict';
    let command = current_match.match(re);
    if (command) {
        command = command[0];
    } else {
        return '';
    }
    let argument = current_match.replace(command, '');
    if (command_list[command]) {
        return finalProcess(command_list[command], argument);
    } else {
        return '';
    }
}

/**
 * Parse the message and return the updated chat message.
 * @param {string} message
 * @returns {*}
 */
function processFlags(message) {
    'use strict';
    let simple_commands = message.match(re_no_arguement),
        commands = [];
    message = message.replace(re_no_arguement, '');
    message = message.replace(re_with_arguement, processArguments);
    if (simple_commands) {
        simple_commands.forEach(command => {
            if (command_list[command]) {
                commands.push(command_list[command]);
            }
        });
    }
    return finalProcess(commands, message);
}

module.exports = (() => {
    'use strict';
    return {
        game: () => {
            document.getElementById('chat').addEventListener('keydown', function (event) {
                if (event.keyCode === 13) { // Enter key.
                    let chat_value = event.target.value;
                    event.target.value = processFlags(chat_value);
                }
            });
        }
    };
})();
