/*global tagpro */

tagpro.tools.optional.keyCommands = function() {
    'use strict';

    // Arrow key shortcuts.
    tagpro.tools.global.shortcuts.addToButton('button', '/games/find', '⇧', 38, {ctrlKey: true});
    tagpro.tools.global.shortcuts.addToButton('button', '/auth/google', '⇩', 40, {ctrlKey: true});
    tagpro.tools.global.shortcuts.addToButton('button', '/profile', '⇩', 40, {ctrlKey: true});
    tagpro.tools.global.shortcuts.addToButton('button', '/group', '⇦', 37, {ctrlKey: true});
    tagpro.tools.global.shortcuts.addToButton('button', '/boards', '⇨', 39, {ctrlKey: true});

    // WASD shortcuts
    tagpro.tools.global.shortcuts.addToButton('button', '/games/find', '', 87);
    tagpro.tools.global.shortcuts.addToButton('button', '/profile', '', 83);
    tagpro.tools.global.shortcuts.addToButton('button', '/auth/google', '', 83);
    tagpro.tools.global.shortcuts.addToButton('button', '/group', '', 65);
    tagpro.tools.global.shortcuts.addToButton('button', '/boards', '', 68);
};