/**
 * TagPro Tools
 * Copyright 2015 Carl Colglazier
 * See LICENSE for details.
 */

// TagPro.tools object construction.
// This is the object that will be used in almost every other part
// of the extension.
var tagpro = (tagpro) ? tagpro : window.tagpro;

tagpro.tools = {
    // Global functions are used by other functions to do various tasks.
    // They are always on.
    global: {},
    // Optional functions may be turned on and off.
    optional: {},
    // Configuration options.
    settings: {}
};

// Imports
tagpro.tools.global.data = require('./modules/global/data.js');
tagpro.tools.global.menu = require('./modules/global/menu.js');
tagpro.tools.global.shortcuts = require('./modules/global/shortcuts.js');
tagpro.tools.global.events = require('./modules/global/events.js');
tagpro.tools.global.draw = require('./modules/global/draw.js');
tagpro.tools.global.stats = require('./modules/global/stats.js');
tagpro.tools.global.textures = require('./modules/global/textures.js');

tagpro.tools.optional.chatMacros = require('./modules/optional/chatMacros.js');
tagpro.tools.optional.chatCommands = require('./modules/optional/chatCommands.js');
tagpro.tools.optional.customColors = require('./modules/optional/customColors.js');
tagpro.tools.optional.texturePacks = require('./modules/optional/texturePacks.js');
tagpro.tools.optional.transparentViewport = require('./modules/optional/transparentViewport.js');
tagpro.tools.optional.spinBall = require('./modules/optional/spinBall.js');
tagpro.tools.optional.overrideDisableControls = require('./modules/optional/overrideDisableControls.js');
tagpro.tools.optional.gameStats = require('./modules/optional/gameStats.js');

// Useful, reusable functions.

/**
 * Ensure that a condition is met before proceeding.
 * @param  {*} required_object The condition to be tested.
 * @param  {function} task
 */
window.wait = function (required_object, task) {
    'use strict';
    if (typeof task !== 'function') {
        return;
    }
    if (required_object) {
        task();
    } else {
        setTimeout(wait, 250, required_object, task);
    }
};

/**
 * Check the current page.
 */
function findCurrentPage() {
    'use strict';
    if (parseInt(location.port, 10) >= 8000) {
        return 'game';
    } else {
        switch (location.pathname) {
        case '/':
            return 'home';
        case '/boards':
            return 'boards';
        default:
            if (location.pathname.indexOf('/profile/') >= 0) {
                return 'profile';
            }
            if (location.pathname.indexOf('/groups/') >= 0) {
                return 'group';
            }

            // Something wicked this way comes.
            return '';
        }
    }
}

/**
 * Change the background to a given image.
 * @param {string} uri
 */
function addBackground(uri) {
    'use strict';

    // Match the expected CSS.
    document.documentElement.style.background = 'url(' + uri + ')';
    document.documentElement.style.backgroundRepeat = 'no-repeat';
    document.documentElement.style.backgroundAttachment = 'fixed';
    document.documentElement.style.backgroundPosition = 'center center';
    document.documentElement.style.backgroundSize = 'cover';
}

// Get the settings (this is needed on every page).
function loadSettings() {
    'use strict';
    tagpro.tools.global.data.emit('settings request', 'settings request', (settings) => {
        tagpro.tools.settings = settings;
        addBackground(settings.values.background);
        tagpro.tools.global.menu.setSection('Settings', require('./components/settingsSection.js'));
        if (findCurrentPage() === 'game' === tagpro.tools.settings.values.texturePacks) {
            tagpro.tools.optional.texturePacks.game();
        }

        // Load menu.
        Object.keys(tagpro.tools.optional).forEach(i => {
            if (tagpro.tools.settings.values[i] &&
                typeof tagpro.tools.optional[i].menu === 'function') {
                tagpro.tools.optional[i].menu();
            }
        });
    });
}
loadSettings();

class Button {
    constructor(letter) {
        let self = this;

        // Add sound menu if it does not exist.
        if (!document.getElementById('sound')) {
            let new_sound = document.createElement('div');
            new_sound.id = 'sound';
            document.body.appendChild(new_sound);
        }
        self.tools_logo = document.createElement('button');
        self.tools_logo.textContent = letter;
        self.tools_logo.classList.add('tools-logo-button');
        document.getElementById('sound').appendChild(self.tools_logo);
    }
    addEvent(click_function) {
        this.tools_logo.addEventListener('click', click_function);
    }
}

// Create the menu button.
new Button('t').addEvent((event) => {
    'use strict';
    if (!document.getElementById('tools-settings')) {
        tagpro.tools.global.menu.open();
        event.target.textContent = 'x';
    } else {
        document.getElementById('tools-settings').parentElement.removeChild(
            document.getElementById('tools-settings')
        );
        event.target.textContent = 't';
        loadSettings();
    }
});

function loadOptionalScripts() {
    'use strict';
    let current_page = findCurrentPage();
    Object.keys(tagpro.tools.optional).forEach(i => {
        if (tagpro.tools.settings.values[i] &&
            typeof tagpro.tools.optional[i][current_page] === 'function') {
            tagpro.tools.optional[i][current_page]();
        }
    });
}

// Load optional scripts.
tagpro.ready(() => {
    'use strict';
    tagpro.tools.global.draw = tagpro.tools.global.draw();
    tagpro.tools.global.events();
    tagpro.tools.global.stats = tagpro.tools.global.stats();
    wait(Object.keys(tagpro.tools.settings).length, loadOptionalScripts);
});
