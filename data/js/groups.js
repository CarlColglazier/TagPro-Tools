/* global tagpro */

tagpro.tools.optional.keyCommands = function() {
    'use strict';

    // Focus on the chat box when enter is pressed.
    tagpro.tools.global.addShortcut(13, function () {
        document.getElementById('chatSend').focus();
    });
}