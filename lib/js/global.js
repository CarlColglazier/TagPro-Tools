/* jshint devel:true */
/* jshint esnext: true */
/* global tagpro */


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
    tagpro.tools.global.data.emit('settings request','settings request', function(settings) {
        tagpro.tools.settings = settings;
        addBackground(settings.values.background);
        tagpro.tools.global.menu.setSection('Settings', (function() {
            let tools_settings = document.createElement('div'),
                tree = tagpro.tools.settings.tree,
                menu = tagpro.tools.settings.menu,
                values = tagpro.tools.settings.values;
            function onSettingsChange(event) {
                if (typeof tagpro.tools.settings.values[event.target.id] === 'undefined') {
                    return;
                }
                let new_value;
                switch (typeof tagpro.tools.settings.values[event.target.id]) {
                case 'boolean':
                    new_value = event.target.checked;
                    break;
                case 'number':
                    new_value = parseInt(event.target.value, 10);
                    break;
                case 'string':
                    new_value = event.target.value;
                    break;
                default:
                    break;
                }
                tagpro.tools.settings.values[event.target.id] = new_value;
                tagpro.tools.global.data.set('settings', tagpro.tools.settings.values);
            }

            function generateSettingsSection(metadata, children) {
                let new_section = document.createElement('section'),
                    section_header = document.createElement('h4');
                new_section.classList.add('tools-settings-section');
                section_header.textContent = metadata.identity;
                new_section.appendChild(section_header);
                for (let i in children) {
                    if (!children.hasOwnProperty(i)) {
                        continue;
                    }
                    let new_input = document.createElement('input'),
                        new_label = document.createElement('label'),
                        listener_type;
                    if (menu[i]) {
                        new_label.textContent = menu[i].identity;
                    } else {
                        new_label.textContent = i;
                    }
                    switch (typeof children[i]) {
                    case 'boolean':
                        new_input.type = 'checkbox';
                        new_input.checked = values[i];
                        listener_type = 'change';
                        break;
                    case 'number':
                        new_input.type = 'number';
                        listener_type = 'input';
                        break;
                    case 'string':
                        new_input.type = 'text';
                        listener_type = 'input';
                        break;
                    default:
                        break;
                    }
                    new_input.value = values[i];
                    new_input.id = i;
                    new_input.addEventListener(listener_type, onSettingsChange);
                    new_label.htmlFor = i;
                    new_section.appendChild(new_label);
                    new_section.appendChild(new_input);
                }
                return new_section;
            }

            for (let i in tree) {
                if (!tree.hasOwnProperty(i)) {
                    continue;
                }
                tools_settings.appendChild(generateSettingsSection(menu[i], tree[i]));
            }
            return tools_settings;
        })());
        if (parseInt(location.port, 10) >= 8000 && tagpro.tools.settings.values.texturePacks) {
            tagpro.tools.optional.texturePacks.game();
        }

        // Load menu.
        for (let i in tagpro.tools.optional) {
            if (tagpro.tools.optional.hasOwnProperty(i)) {
                if (tagpro.tools.settings.values[i] && typeof tagpro.tools.optional[i].menu === 'function') {
                    tagpro.tools.optional[i].menu();
                }
            }
        }
    });
}
loadSettings();
addButton('t', function(event) {
    'use strict';
    if (!document.getElementById('tools-settings')) {
        tagpro.tools.global.menu.open();
        event.target.textContent = 'x';
    } else {
        document.getElementById('tools-settings').parentElement.removeChild(document.getElementById('tools-settings'));
        event.target.textContent = 't';
        loadSettings();
    }
});

// TODO: Loading of themes.

tagpro.tools.global.textures = (function() {
    'use strict';
// Prevents the page from redirecting when a file in dropped on it.
    document.documentElement.addEventListener('dragover', function (event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });

    document.documentElement.addEventListener('drop', function (event) {
        event.stopPropagation();
        event.preventDefault();
        let files = event.dataTransfer.files,
            i,
            read_image = function (read) {
                updateBackground(read.target.result);
            };
        for (i = 0; i < files.length; i++) {
            if (files[i].type.indexOf('image') !== 0) {
                continue;
            }
            let reader = new FileReader();
            reader.onload = read_image;
            reader.readAsDataURL(files[i]);
        }
    });
})();

function loadOptionalScripts() {
    'use strict';
    let i,
        x = 0,
        current_page;
    for (i in tagpro.tools.settings) {
        if (!tagpro.tools.settings.hasOwnProperty(i)) {
            continue;
        }
        x++;
    }
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
            if (tagpro.tools.settings.values[i] && typeof tagpro.tools.optional[i][current_page] === 'function') {
                tagpro.tools.optional[i][current_page]();
            }
        }
    }
}

// Load optional scripts.
tagpro.ready(function() {
    'use strict';
    loadOptionalScripts();
});