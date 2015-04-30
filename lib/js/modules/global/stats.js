/**
 * Statistic collection based on CatStats.
 * @author ylambda
 * @author Watball
 * @author NewCompte
 * @author P0P
 * @author TOJO
 * @author Carl Colglazier
*/
module.exports = () => {
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
