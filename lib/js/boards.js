/* global tagpro */
tagpro.tools.optional.keyCommands = function() {
    'use strict';
    tagpro.tools.global.addToButton('button', 'Day', '⇦', 37, {ctrlKey: true});
    tagpro.tools.global.addToButton('button', 'Week', '⇩', 40, {ctrlKey: true});
    tagpro.tools.global.addToButton('button', 'Month', '⇨', 39, {ctrlKey: true});

    tagpro.tools.global.addToButton('button', 'Day', '', 65);
    tagpro.tools.global.addToButton('button', 'Week', '', 83);
    tagpro.tools.global.addToButton('button', 'Month', '', 68);
};