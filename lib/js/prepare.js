/* jshint esnext: true */

var tagpro = (tagpro) ? tagpro : window.tagpro;

tagpro.tools = {
    global: {},
    optional: {},
    settings: {}
};

tagpro.tools.global.data = (function() {
    'use strict';

    // Stores the callbacks before they are fired.
    var messageCallbacks = {};

    // Handle communications between the client and the extension.
    window.addEventListener('message', function(event) {
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
        get: function(sender, callback) {
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
        emit: function(type, sender, callback) {

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
        set: function(type, values) {
            window.postMessage({
                type: 'setter',
                sender: type,
                message: values
            }, location.href);
        }
    };
})();

tagpro.tools.global.menu = (function() {
    'use strict';
    var menu_items = {};
    function openMenuSection(name) {
        if (document.getElementById(name)) {
            for (let i = 0; i < document.getElementsByClassName('tools-menu-section').length; i++) {
                document.getElementsByClassName('tools-menu-section')[i].style.display = 'none';
            }
            document.getElementById(name).style.display = 'flex';
        }
    }
    return {
        open: function () {
            function createButton(button_name) {
                let new_button = document.createElement('button');
                new_button.textContent = button_name;
                new_button.classList.add('button');
                new_button.classList.add('small');
                new_button.addEventListener('click', function(event) {
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
            for (let i in menu_items) {
                if (!menu_items.hasOwnProperty(i)) {
                    continue;
                }
                if (!menu_items[i].classList.contains('tools-menu-section')) {
                    menu_items[i].classList.add('tools-menu-section');
                }
                tools_button_area.appendChild(createButton(i));
                tools_settings.appendChild(menu_items[i]);
            }
            document.body.appendChild(tools_settings);
            openMenuSection('Settings');
        }, setSection: function(section_name, section_html) {
            try {
                section_html.id = section_name;
            } catch (e) {
                return;
            }
            menu_items[section_name] = section_html;
        }
    };
})();

tagpro.tools.global.shortcuts = (function() {
    'use strict';
    var shortcuts = {};
    // Fire keyboard shortcuts.
    document.addEventListener('keyup', function (event) {
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
        set: function (key_code, new_function, options) {
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
        get: function(key_code) {
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
            set: function (key_code, toAll, message, options) {
                tagpro.tools.global.shortcuts.set(key_code, function () {
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
                    var self = this;
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
                            return;
                        }
                    };

                    /**
                     * Update the local player record with new data
                     * @param {Object} player - reference to local player record
                     * @param {Object} playerUpdate - new player data
                     */
                    self.updatePlayer = (player, playerUpdate) => {
                        var attrs = Object.keys(playerUpdate);
                        attrs.forEach(function (attr) {
                            var data = playerUpdate[attr];

                            // if this is a powerup - update time tracking
                            if (attr === 'bomb' || attr === 'tagpro' || attr === 'speed' || attr === 'grip') {
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
                        var seconds = (player.arrival - player.departure) / 1e3;
                        player.minutes = Math.round(seconds / 60);

                        // Update all timers
                        [
                            'bomb',
                            'tagpro',
                            'grip',
                            'speed'
                        ].forEach(function (timerName) {
                                self.updatePlayerTimer(player, timerName, false);
                            });
                    };

                    /**
                     * Create a local player record
                     * @param {Number} id - the id of the player
                     */
                    self.createPlayer = (id) => {
                        var player = self.players[id] = {};
                        player.arrival = tagpro.gameEndsAt - Date.now();
                        player.bombtime = 0;
                        player.tagprotime = 0;
                        player.griptime = 0;
                        player.speedtime = 0;
                        player.bombtr = false;
                        player.tagprotr = false;
                        player.griptr = false;
                        player.speedtr = false;
                        player.diftotal = player.team === 1 ? tagpro.score.b - tagpro.score.r : tagpro.score.r - tagpro.score.b;
                        return player;
                    };

                    /**
                     * Update local player stats
                     * @param {Object} data The 'p' update data
                     */
                    self.onPlayerUpdate = (data) => {
                        // Sometimes data is in .u
                        data = data.u || data;
                        // Loop over all the player updates and update each player in the local player record
                        data.forEach(function (playerUpdate) {
                            var player = self.players[playerUpdate.id];

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
                        let now = Date.now(),
                            stats = Object.keys(self.players).map(function (id) {
                            let player = self.players[id];
                            self.updatePlayerAfterDeparture(player, now);

                            // Record every column for the spreadsheet
                            var columns = {};
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
                            columns.team_captures = player.team === 1 ? tagpro.score.r : tagpro.score.b;
                            columns.opponent_captures = player.team === 1 ? tagpro.score.b : tagpro.score.r;
                            columns.plusminus = player.diftotal + columns.team_captures - columns.opponent_captures || 0;
                            columns.arrival = player.arrival || 0;
                            columns.departure = player.departure || 0;
                            columns.bombtime = player.bombtime || 0;
                            columns.tagprotime = player.tagprotime || 0;
                            columns.griptime = player.griptime || 0;
                            columns.speedtime = player.speedtime || 0;
                            return columns;
                        });
                        return stats;
                    };

                    self.onScoreUpdate = (data) => {
                        self.score.redTeam = data.r;
                        self.score.blueTeam = data.b;
                    };

                    self.onGameUpdate = (data) => {
                        if (tagpro.state === 2) {
                            return; //Probably unneeded
                        }
                        var playerIds = Object.keys(self.players);
                        playerIds.forEach(function (id) {
                            self.players[id].arrival = data.time;
                        });
                    };

                    // Listen for player updates
                    document.addEventListener('gameupdate', function (data) {
                        self.onPlayerUpdate(data.detail);
                    });
                    // Listen for score updates
                    document.addEventListener('score', function (data) {
                        self.onScoreUpdate(data.detail);
                    });
                    // Listen for player quits
                    document.addEventListener('playerleft', function (data) {
                        self.onPlayerLeftUpdate(data.detail);
                    });
                    // Listen for time and game state changes
                    document.addEventListener('gametime', function (data) {
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