/* jshint esnext: true */

var tagpro = (tagpro) ? tagpro : window.tagpro;

tagpro.tools = {
    global: {},
    optional: {},
    settings: {}
};

tagpro.tools.global.data = require('./modules/global/data.js');
tagpro.tools.global.menu = require('./modules/global/menu.js');
tagpro.tools.global.shortcuts = require('./modules/global/shortcuts.js');
tagpro.tools.global.events = require('./modules/global/events.js');
tagpro.tools.global.draw = require('./modules/global/draw.js');
tagpro.tools.global.stats = require('./modules/global/stats.js');

tagpro.tools.optional.chatMacros = require('./modules/optional/chatMacros.js');
tagpro.tools.optional.chatCommands = require('./modules/optional/chatCommands.js');
tagpro.tools.optional.customColors = require('./modules/optional/customColors.js');
tagpro.tools.optional.texturePacks = require('./modules/optional/texturePacks.js');
tagpro.tools.optional.transparentViewport = require('./modules/optional/transparentViewport.js');
tagpro.tools.optional.spinBall = require('./modules/optional/spinBall.js');
tagpro.tools.optional.overrideDisableControls = require('./modules/optional/overrideDisableControls.js');
tagpro.tools.optional.gameStats = require('./modules/optional/gameStats.js');

function addBackground(uri) {
    'use strict';
    document.documentElement.style.background = 'url(' + uri + ')';
    document.documentElement.style.backgroundRepeat = 'no-repeat';
    document.documentElement.style.backgroundAttachment = 'fixed';
    document.documentElement.style.backgroundPosition = 'center center';
    document.documentElement.style.backgroundSize = 'cover';
}

function updateBackground(uri) {
    'use strict';
    addBackground(uri);
    tagpro.tools.settings.values.background = uri;
    tagpro.tools.global.data.set('settings', tagpro.tools.settings.values);
}


function addButton(letter, click_function) {
    'use strict';

    // Add sound menu if it does not exist.
    if (!document.getElementById('sound')) {
        let new_sound = document.createElement('div');
        new_sound.id = 'sound';
        document.body.appendChild(new_sound);
    }
    var tools_logo = document.createElement('button');
    tools_logo.textContent = letter;
    tools_logo.classList.add('tools-logo-button');
    tools_logo.addEventListener('click', click_function);
    document.getElementById('sound').appendChild(tools_logo);
}

// Get the settings (this is needed on every page).
function loadSettings() {
    'use strict';
    tagpro.tools.global.data.emit('settings request', 'settings request', (settings) => {
        tagpro.tools.settings = settings;
        addBackground(settings.values.background);
        tagpro.tools.global.menu.setSection('Settings', require('./components/settingsSection.js'));
        if (parseInt(location.port, 10) >= 8000 && tagpro.tools.settings.values.texturePacks) {
            tagpro.tools.optional.texturePacks.game();
        }

        // Load menu.
        for (let i in tagpro.tools.optional) {
            if (tagpro.tools.optional.hasOwnProperty(i)) {
                if (tagpro.tools.settings.values[i] &&
                    typeof tagpro.tools.optional[i].menu === 'function') {
                    tagpro.tools.optional[i].menu();
                }
            }
        }
    });
}
loadSettings();
addButton('t', (event) => {
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

// TODO: Loading of themes.

tagpro.tools.global.textures = (() => {
    'use strict';
    // Prevents the page from redirecting when a file in dropped on it.
    document.documentElement.addEventListener('dragover', (event) => {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });

    document.documentElement.addEventListener('drop', (event) => {
        event.stopPropagation();
        event.preventDefault();
        let files = event.dataTransfer.files,
            i,
            read_image = function (read) {
                updateBackground(read.target.result);
            };
        for (i = 0; i < files.length; i++) {
            if (files[i].type.indexOf('image') === 0) {
                let reader = new FileReader();
                reader.onload = read_image;
                reader.readAsDataURL(files[i]);
            }
        }
    });
})();

function loadOptionalScripts() {
    'use strict';
    let i,
        x = Object.keys(tagpro.tools.settings).length,
        current_page;
    if (!x) {
        return setTimeout(loadOptionalScripts, 1000);
    }

    if (parseInt(location.port, 10) >= 8000) {
        current_page = 'game';
    } else {
        switch (location.pathname) {
        case '/':
            current_page = 'home';
            break;
        case '/boards':
            current_page = 'boards';
            break;
        default:
            if (location.pathname.indexOf('/profile/') >= 0) {
                current_page = 'profile';
            }
            if (location.pathname.indexOf('/groups/') >= 0) {
                current_page = 'group';
            }
            break;
        }
    }
    for (i in tagpro.tools.optional) {
        if (tagpro.tools.optional.hasOwnProperty(i)) {
            if (tagpro.tools.settings.values[i] &&
                typeof tagpro.tools.optional[i][current_page] === 'function') {
                tagpro.tools.optional[i][current_page]();
            }
        }
    }
}

// Load optional scripts.
tagpro.ready(() => {
    'use strict';
    tagpro.tools.global.draw = tagpro.tools.global.draw();
    tagpro.tools.global.events();
    tagpro.tools.global.stats = tagpro.tools.global.stats();
    loadOptionalScripts();
});
