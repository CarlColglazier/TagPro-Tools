/*global tagpro */

tagpro.tools.optional.keyCommands = function() {
    'use strict';

    // Arrow key shortcuts.
    tagpro.tools.global.addToButton('button', '/games/find', '⇧', 38, {ctrlKey: true});
    tagpro.tools.global.addToButton('button', '/auth/google', '⇩', 40, {ctrlKey: true});
    tagpro.tools.global.addToButton('button', '/profile', '⇩', 40, {ctrlKey: true});
    tagpro.tools.global.addToButton('button', '/group', '⇦', 37, {ctrlKey: true});
    tagpro.tools.global.addToButton('button', '/boards', '⇨', 39, {ctrlKey: true});

    // WASD shortcuts
    tagpro.tools.global.addToButton('button', '/games/find', '', 87);
    tagpro.tools.global.addToButton('button', '/profile', '', 83);
    tagpro.tools.global.addToButton('button', '/auth/google', '', 83);
    tagpro.tools.global.addToButton('button', '/group', '', 65);
    tagpro.tools.global.addToButton('button', '/boards', '', 68);
};