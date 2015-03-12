/* global tagpro */

/**
 * One-key chat messages.
 * @author TerraMaris
 * @author Carl Colglazier
 */
tagpro.tools.optional.chatMacros = function() {
    'use strict';
    tagpro.tools.global.shortcuts.set(69, function() {
        tagpro.socket.emit('chat', {
            'toAll': true,
            'message': 'testestest'
        });
    });
};