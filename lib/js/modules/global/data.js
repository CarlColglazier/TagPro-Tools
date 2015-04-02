module.exports = (() => {
    'use strict';

    // Stores the callbacks before they are fired.
    let messageCallbacks = {};

    // Handle communications between the client and the extension.
    window.addEventListener('message', (event) => {
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
        get: (sender, callback) => {
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
        emit: (type, sender, callback) => {

            // For custom messages.
            window.postMessage({
                type: type,
                sender: sender
            }, location.href);
            messageCallbacks[sender] = callback;
        },
        send: (type, sender, message) => {
            // For custom messages.
            window.postMessage({
                type: type,
                sender: sender,
                message: message
            }, location.href);
        },
        set: (type, values) => {
            window.postMessage({
                type: 'setter',
                sender: type,
                message: values
            }, location.href);
        }
    };
})();
