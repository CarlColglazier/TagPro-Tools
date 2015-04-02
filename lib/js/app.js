/* jshint esnext: true */

var tagpro = (tagpro) ? tagpro : window.tagpro;

tagpro.tools = {
    global: {},
    optional: {},
    settings: {}
};

tagpro.tools.global.data = (() => {
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

tagpro.tools.global.menu = (() => {
    'use strict';
    let menu_items = {};
    function openMenuSection(name) {
        if (document.getElementById(name)) {
            for (let i = 0; i < document.getElementsByClassName('tools-menu-section').length; i++) {
                document.getElementsByClassName('tools-menu-section')[i].style.display = 'none';
            }
            document.getElementById(name).style.display = 'flex';
        }
    }
    return {
        open: () => {
            function createButton(button_name) {
                let new_button = document.createElement('button');
                new_button.textContent = button_name;
                new_button.classList.add('button');
                new_button.classList.add('small');
                new_button.addEventListener('click', (event) => {
                    openMenuSection(event.target.textContent);
                });
                return new_button;
            }
            let tools_settings = document.createElement('div'),
                tools_button_area = document.createElement('div');
            tools_settings.classList.add('tools-settings');
            tools_settings.id = 'tools-settings';
            tools_button_area.id = 'tools-menu-buttons';
            tools_settings.appendChild(tools_button_area);
            Object.keys(menu_items).forEach(i => {
                if (!menu_items[i].classList.contains('tools-menu-section')) {
                    menu_items[i].classList.add('tools-menu-section');
                }
                tools_button_area.appendChild(createButton(i));
                tools_settings.appendChild(menu_items[i]);
            });
            document.body.appendChild(tools_settings);
            openMenuSection('Settings');
        }, setSection: (section_name, section_html) => {
            try {
                section_html.id = section_name;
            } catch (e) {
                return;
            }
            menu_items[section_name] = section_html;
        }
    };
})();

tagpro.tools.global.shortcuts = (() => {
    'use strict';
    let shortcuts = {};
    // Fire keyboard shortcuts.
    document.addEventListener('keyup', (event) => {
        if (event.target.nodeName !== 'BODY') {
            return;
        }
        if (shortcuts[event.keyCode]) {
            let shortcut = shortcuts[event.keyCode],
                x;
            for (x in shortcut.options) {
                if (shortcut.options.hasOwnProperty(x)) {
                    if (event[x] !== shortcut.options[x]) {
                        return;
                    }
                }
            }
            shortcut.follow();
        }
    });
    return {
        set: (key_code, new_function, options) => {
            if (!options) {
                options = {};
            }
            shortcuts[key_code] = {};
            if (typeof new_function === 'function') {
                shortcuts[key_code].follow = new_function;
            } else {
                shortcuts[key_code].follow = function () {};
            }
            shortcuts[key_code].options = {};
            shortcuts[key_code].options.altKey = (options.altKey) ? true : false;
            shortcuts[key_code].options.ctrlKey = (options.ctrlKey) ? true : false;
            shortcuts[key_code].options.shiftKey = (options.shiftKey) ? true : false;
        },
        get: (key_code) => {
            if (!key_code) {
                return;
            }
            if (shortcuts[key_code]) {
                return shortcuts[key_code];
            }
            return false;
        }, macros: {
            /**
             *
             * @param key_code
             * @param toAll
             * @param message
             * @param options
             */
            set: (key_code, toAll, message, options) => {
                tagpro.tools.global.shortcuts.set(key_code, () => {
                    tagpro.socket.emit('chat', {
                        'toAll': toAll,
                        'message': message
                    });
                }, options);
            }
        }
    };
})();

tagpro.tools.global.events = () => {
    'use strict';
    if (!location.port || parseInt(location.port, 10) < 8000) {
        return {};
    }
    tagpro.socket.on('chat', (msg) => {
        document.dispatchEvent(new CustomEvent('chat', {detail: msg}));
        if (msg.to === 'team') {
            document.dispatchEvent(new CustomEvent('chatteam', {detail: msg}));
        } else if (msg.from) {
            document.dispatchEvent(new CustomEvent('chatall', {detail: msg}));
        }
    });
    tagpro.socket.on('end', (msg) => {
        document.dispatchEvent(new CustomEvent('end', {detail: msg}));
    });
    tagpro.socket.on('mapupdate', (msg) => {
        for (let new_update of msg) {
            switch (new_update.v) {
            case 6.1:
            case 6.2:
            case 6.3:
            case 6.4:
                document.dispatchEvent(new CustomEvent('powerupspawn', {detail: new_update}));
                break;
            case 6:
                document.dispatchEvent(new CustomEvent('poweruptaken', {detail: new_update}));
                break;
            }
            document.dispatchEvent(new CustomEvent('mapupdate', {detail: new_update}));
        }
    });
    tagpro.socket.on('p', (msg) => {
        if (!msg.u) {
            return;
        }
        document.dispatchEvent(new CustomEvent('gameupdate', {detail: msg.u}));
        for (let player of msg.u) {
            if (msg.length) {
                document.dispatchEvent(new CustomEvent('playerjoin', {detail: player}));
            } else {
                document.dispatchEvent(new CustomEvent('playerupdate', {detail: player}));
            }
        }
    });
    tagpro.socket.on('playerLeft', (msg) => {
        document.dispatchEvent(new CustomEvent('playerleft', {detail: msg}));
    });
    tagpro.socket.on('score', (msg) => {
        document.dispatchEvent(new CustomEvent('score', {detail: msg}));
    });
    tagpro.socket.on('spawn', (msg) => {
        document.dispatchEvent(new CustomEvent('spawn', {detail: msg}));
    });
    tagpro.socket.on('splat', (msg) => {
        document.dispatchEvent(new CustomEvent('splat', {detail: msg}));
    });
    tagpro.socket.on('time', (msg) => {
        document.dispatchEvent(new CustomEvent('gametime', {detail: msg}));
    });
    tagpro.socket.on('end', (msg) => {
        document.dispatchEvent(new CustomEvent('gameend', {detail: msg}));
    });
    tagpro.socket.on('sound', (msg) => {
        document.dispatchEvent(new CustomEvent('sound', {detail: msg}));
        switch (msg.s) {
        case 'pop':
            document.dispatchEvent(new CustomEvent('pop'));
            break;
        case 'popOther':
            document.dispatchEvent(new CustomEvent('popother'));
            break;
        case 'switchOn':
            document.dispatchEvent(new CustomEvent('switchon'));
            break;
        case 'dynamite':
            document.dispatchEvent(new CustomEvent('dynamite'));
            break;
        case 'friendlydrop':
            document.dispatchEvent(new CustomEvent('friendlydrop'));
            break;
        case 'cheering':
            document.dispatchEvent(new CustomEvent('cheering'));
            break;
        case 'burst':
            document.dispatchEvent(new CustomEvent('burst'));
            break;
        }
    });
};

tagpro.tools.global.draw = () => {
    'use strict';
    class PlayerSprite {
        constructor(player, sprite_id, text, x, y) {
            this.sprites = player.sprites;
            this.type = sprite_id;
            this.text = (typeof text === 'function') ? text() : text;
            this.x = x;
            this.y = y;
        }
        add () {
            if (!this.sprites) {
                return;
            }
            if (!this.sprites[this.type] && this.text) {
                this.sprites[this.type] = tagpro.renderer.prettyText(this.text);
                this.sprites.info.addChild(this.sprites[this.type]);
            }
            if (this.sprites[this.type]) {
                this.sprites[this.type].x = this.x;
                this.sprites[this.type].y = this.y;
            }
        }
        remove() {
            if (!this.sprites) {
                return;
            }
            if (this.sprites[this.type]) {
                this.sprites.info.removeChild(this.sprites[this.type]);

                // Make sure nothing gets lost while the sprite is being removed.
                this.sprites[this.type] = null;
            }
        }
        update(text) {
            this.text = (typeof text === 'function') ? text() : text;
        }
        updatePlayer(sprite) {
            this.sprites = sprite;
        }
        value() {
            return this.text;
        }
    }
    class PlayerDraw extends PlayerSprite {
        constructor(player, sprite_id, text, x, y) {
            super(player, sprite_id, text, x, y);
            if (!player) {
                return;
            }
            var createSprite = () => {
                if (!player.sprites) {
                    return setTimeout(createSprite, 50);
                }
                super.updatePlayer(player.sprites);
                super.add();
            };
            createSprite();
        }
        update(text) {
            super.update(text);
            super.remove();
            super.add();
        }
        value() {
            return super.value();
        }
    }
    return {
        onPlayer: (player, sprite_id, text, x, y) => {
            return new PlayerDraw(player, sprite_id, text, x, y);
        }
    };
};

tagpro.tools.global.stats = () => {
    'use strict';
    return {
        players: (() => {
            class CatStats {
                constructor() {
                    var self = this,
                        powerups = [
                            'bomb',
                            'tagpro',
                            'grip',
                            'speed'
                        ];
                    self.players = {};
                    self.score = {redTeam: 0, blueTeam: 0};

                    /**
                     * Update timers on the local player record
                     * @param {Object} player - reference to local player record
                     * @param {Object} timerName - name of the timer to update
                     * @param {Object} timerValue - value of the timer to update
                     */
                    self.updatePlayerTimer = (player, timerName, timerValue) => {
                        // the player has the powerup and
                        // we aren't tracking the time yet
                        if (timerValue === true && !player[timerName + 'tr']) {
                            player[timerName + 'tr'] = true;
                            player[timerName + 'start'] = Date.now();
                            return;
                        }

                        // player lost the powerup, save the time
                        if (timerValue === false && player[timerName + 'tr'] === true) {
                            player[timerName + 'tr'] = false;
                            player[timerName + 'time'] += Date.now() - player[timerName + 'start'];
                        }
                    };

                    /**
                     * Update the local player record with new data
                     * @param {Object} player - reference to local player record
                     * @param {Object} playerUpdate - new player data
                     */
                    self.updatePlayer = (player, playerUpdate) => {
                        Object.keys(playerUpdate).forEach(attr => {
                            let data = playerUpdate[attr];

                            // if this is a powerup - update time tracking
                            if (powerups.indexOf(attr) >= 0) {
                                self.updatePlayerTimer(player, attr, data);
                            }

                            // update the local player record with new data
                            if (typeof data !== 'object') {
                                player[attr] = data;
                            }
                        });
                    };

                    /**
                     * When a player leaves or the game is over perform some cleanup
                     * @param {Object} player - reference to local player record
                     * @param {Number} [now] - unix timestamp representing current time
                     */
                    self.updatePlayerAfterDeparture = (player, now) => {
                        let current_time = (now) ? now : Date.now();

                        // ignore players who have already departed
                        if (player.departure !== undefined) {
                            return;
                        }

                        player.departure = tagpro.gameEndsAt - current_time;

                        // Record the minutes played
                        let seconds = (player.arrival - player.departure) / 1e3;
                        player.minutes = Math.round(seconds / 60);

                        // Update all timers
                        powerups.forEach(timerName => {
                            self.updatePlayerTimer(player, timerName, false);
                        });
                    };

                    /**
                     * Create a local player record
                     * @param {Number} id - the id of the player
                     */
                    self.createPlayer = (id) => {
                        let player = self.players[id] = {};
                        player.arrival = tagpro.gameEndsAt - Date.now();
                        player.bombtime = 0;
                        player.tagprotime = 0;
                        player.griptime = 0;
                        player.speedtime = 0;
                        player.bombtr = false;
                        player.tagprotr = false;
                        player.griptr = false;
                        player.speedtr = false;
                        player.diftotal = player.team === 1 ?
                            tagpro.score.b - tagpro.score.r :
                            tagpro.score.r - tagpro.score.b;
                        return player;
                    };

                    /**
                     * Update local player stats
                     * @param {Object} data The 'p' update data
                     */
                    self.onPlayerUpdate = (data) => {
                        // Sometimes data is in .u
                        data = data.u || data;
                        // Loop over all the player updates and update
                        // each player in the local player record
                        data.forEach(playerUpdate => {
                            let player = self.players[playerUpdate.id];

                            if (!player) {
                                player = self.createPlayer(playerUpdate.id);
                                self.updatePlayer(player, tagpro.players[playerUpdate.id]);
                            } else {
                                self.updatePlayer(player, playerUpdate);
                            }

                        });
                    };

                    /**
                     * Handle players who leave early
                     * @param {Number} playerId - The id of the player leaving
                     */
                    self.onPlayerLeftUpdate = (playerId) => {
                        // Player leaves mid-game
                        if (tagpro.state === 1) {
                            self.updatePlayerAfterDeparture(self.players[playerId]);
                        }

                        // Player leaves before the game
                        if (tagpro.state === 3) {
                            delete self.players[playerId];
                        }

                        // Ignore all other player's leaving
                    };

                    /**
                     * Prepare the local player record for export
                     */
                    self.prepareStats = () => {
                        let now = Date.now();
                        return Object.keys(self.players).map(id => {
                            let player = self.players[id];
                            self.updatePlayerAfterDeparture(player, now);

                            // Record every column for the spreadsheet
                            let columns = {};
                            columns.timestamp = now;
                            columns.id = now.toString() + player.id.toString();
                            columns.auth = player.auth;
                            columns.name = player.name || '';
                            columns.minutes = player.minutes || 0;
                            columns.score = player.score || 0;
                            columns.tags = player['s-tags'] || 0;
                            columns.pops = player['s-pops'] || 0;
                            columns.grabs = player['s-grabs'] || 0;
                            columns.drops = player['s-drops'] || 0;
                            columns.hold = player['s-hold'] || 0;
                            columns.captures = player['s-captures'] || 0;
                            columns.prevent = player['s-prevent'] || 0;
                            columns.returns = player['s-returns'] || 0;
                            columns.support = player['s-support'] || 0;
                            columns.team = player.team || 0;
                            columns.team_captures = player.team === 1 ?
                                tagpro.score.r :
                                tagpro.score.b;
                            columns.opponent_captures = player.team === 1 ?
                                tagpro.score.b :
                                tagpro.score.r;
                            columns.plusminus = player.diftotal +
                                columns.team_captures -
                                columns.opponent_captures ||
                                0;
                            columns.arrival = player.arrival || 0;
                            columns.departure = player.departure || 0;
                            columns.bombtime = player.bombtime || 0;
                            columns.tagprotime = player.tagprotime || 0;
                            columns.griptime = player.griptime || 0;
                            columns.speedtime = player.speedtime || 0;
                            return columns;
                        });
                    };

                    self.onScoreUpdate = (data) => {
                        self.score.redTeam = data.r;
                        self.score.blueTeam = data.b;
                    };

                    self.onGameUpdate = (data) => {
                        if (tagpro.state === 2) {
                            return; //Probably unneeded
                        }
                        let playerIds = Object.keys(self.players);
                        playerIds.forEach((id) => {
                            self.players[id].arrival = data.time;
                        });
                    };

                    // Listen for player updates
                    document.addEventListener('gameupdate', (data) => {
                        self.onPlayerUpdate(data.detail);
                    });
                    // Listen for score updates
                    document.addEventListener('score', (data) => {
                        self.onScoreUpdate(data.detail);
                    });
                    // Listen for player quits
                    document.addEventListener('playerleft', (data) => {
                        self.onPlayerLeftUpdate(data.detail);
                    });
                    // Listen for time and game state changes
                    document.addEventListener('gametime', (data) => {
                        self.onGameUpdate(data.detail);
                    });
                }
                get() {
                    return this.prepareStats();
                }

            }
            return new CatStats();
        })()
    };
};

tagpro.tools.optional.chatMacros = require('./modules/optional/chatMacros.js');
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
        tagpro.tools.global.menu.setSection('Settings', (() => {
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
                Object.keys(children).forEach(i => {
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
                });
                return new_section;
            }

            Object.keys(tree).forEach(i => {
                tools_settings.appendChild(generateSettingsSection(menu[i], tree[i]));
            });
            return tools_settings;
        })());
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
