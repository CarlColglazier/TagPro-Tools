/*global tagpro */
/* global PIXI */
/* global cloudkid */
/* global performance */

/**
 * Custom colors for every part of the game.
 * @author TagPro Developers
 * @author Carl Colglazier
 */
tagpro.tools.optional.customColors = function() {
    'use strict';
    var tr = tagpro.renderer,

    // Customizable particles.
        particles = tagpro.particleDefinitions;
    particles.tagproSparks.color = {
        "start": "#50c11a",
        "end": "#539931"
    };
    particles.tagproSparks.alpha = {
        "start": 0.25,
        "end": 0.0
    };
    particles.explosion.color = {
        "start": "#F6B97B",
        "end": "#636363"
    };
    particles.explosion.alpha = {
        "start": 0.25,
        "end": 0.0
    };
    particles.playerEmitter.color = {
        "start": "#F6B97B",
        "end": "#EC8215"
    };
    particles.playerEmitter.alpha = {
        "start": 0.25,
        "end": 0.0
    };
    particles.explosion.color = {
        "start": "#F6B97B",
        "end": "#636363"
    };
    particles.rollingBomb.alpha = {
        "start": 0.25,
        "end": 0.0
    };

    var small_font = "bold 9pt " + tagpro.tools.settings.values.primary,
        big_font = "bold 48pt " + tagpro.tools.settings.values.primary,
        timer_font = "bold 30pt " + tagpro.tools.settings.values.primary;

    function fixChatNameColors(node) {
        if (!node.style) {
            return;
        }
        node.style.fontFamily = tagpro.tools.settings.values.primary;
        if (node.style.color) {
            switch (node.style.color) {
            case "rgb(255, 181, 189)":
                node.style.color = (tagpro.tools.settings.values["light red"]) ?
                    tagpro.tools.settings.values["light red"] :
                    (tagpro.tools.settings.values.red) ?
                        tagpro.tools.settings.values.red :
                        node.style.color;
                break;
            case "rgb(207, 207, 255)":
                node.style.color = (tagpro.tools.settings.values["light blue"]) ?
                    tagpro.tools.settings.values["light blue"] :
                    (tagpro.tools.settings.values.blue) ?
                        tagpro.tools.settings.values.blue :
                        node.style.color;
                break;
            default:
                break;
            }
        }
    }

    document.addEventListener("webkitAnimationStart", function(event) {
        if (event.animationName === "fadeInChat") {
            fixChatNameColors(event.target);
        }
    }, false);

    // Stroke thickness!
    tagpro.renderer.prettyText = function (text, color) {
        /* Returns a tagpro style text PIXI object.
         * @param text {string} The text to initially set it to.
         * @param color {string} The color to render the text.
         * */
        if (color) {
            switch (color.toLowerCase()) {
            case "#bfff00":
                color = tagpro.tools.settings.values.green;
                break;
            default:
                break;
            }
        }
        return new PIXI.Text(text,
            {
                font: small_font, //"bold 8pt Arial",
                fill: color || "#FFFFFF",
                stroke: tagpro.tools.settings.values.stroke || "#000000",
                strokeThickness: tagpro.tools.settings.values["stroke thickness"] || 3
            });
    };

    tr.largeText = function (text, color) {
        /* Returns a large tagpro style text PIXI object.
         * @param text {string} The text to initially set it to.
         * @param color {string} The color to render the text.
         * */

        // Fix colors.
        if (color) {
            switch (color) {
            case '#0000ff':
                color = tagpro.tools.settings.values.blue;
                break;
            case '#ff0000':
                color = tagpro.tools.settings.values.red;
                break;
            default:
                break;
            }
        }
         return new PIXI.Text(text,
            {
                font: big_font,
                fill: color || "#ffffff",
                stroke: tagpro.tools.settings.values.stroke || "#000000",
                strokeThickness: tagpro.tools.settings.values["stroke thickness"] || 2
            });
    };

    // TagPro colors
    tagpro.renderer.updateTagpro = function (player) {
        /* Updates whether a player should have tagpro. */
        if (player.tagpro) {
            if (!player.sprites.tagproTint) {
                var tint = player.sprites.tagproTint = new PIXI.Graphics(),
                    color = parseInt(tagpro.tools.settings.values.green.replace('#', ''), 16);
                tint.beginFill(color || 0x00FF00, 0.35).lineStyle(3, color || 0x00FF00).drawCircle(20, 20, 20);
                player.sprites.ball.addChild(tint);
                if (!tr.options.disableParticles) {
                    player.sprites.tagproSparks = new cloudkid.Emitter(
                        player.sprites.ball,
                        [tr.particleFireTexture],
                        tagpro.particleDefinitions.tagproSparks);
                    player.sprites.tagproSparks.player = player.id;
                    tr.emitters.push(player.sprites.tagproSparks);
                }
            }
        } else {
            if (player.sprites.tagproTint) {
                player.sprites.ball.removeChild(player.sprites.tagproTint);
                player.sprites.tagproTint = null;
            }
            if (player.sprites.tagproSparks) {
                player.sprites.tagproSparks.emit = false;
                var sparksIndex = tr.emitters.indexOf(player.sprites.tagproSparks);
                tr.emitters.splice(sparksIndex, 1);
                player.sprites.tagproSparks.destroy();
                player.sprites.tagproSparks = null;
            }
        }
    };

    // Rolling bomb
    tr.updateRollingBomb = function (player) {
        /* Updates whether a player should have rolling bomb.*/
        if (player.bomb) {
            if (!player.sprites.bomb) {
                if (!tr.options.disableParticles) {
                    player.sprites.rollingBomb = new cloudkid.Emitter(player.sprites.ball,[tr.particleTexture],tagpro.particleDefinitions.rollingBomb);
                    tr.emitters.push(player.sprites.rollingBomb);
                }
                var bomb = player.sprites.bomb = new PIXI.Graphics(),
                    color = parseInt(tagpro.tools.settings.values.yellow.replace('#', ''), 16);
                bomb.beginFill(color, 0.75).drawCircle(20, 20, 20);
                player.sprites.ball.addChild(bomb);
            } else {
                player.sprites.bomb.alpha = Math.abs(0.75 * Math.sin(performance.now() / 150));
            }
        } else {
            if (player.sprites.bomb) {
                player.sprites.ball.removeChild(player.sprites.bomb);
                player.sprites.bomb = null;
            }
            if (player.sprites.rollingBomb) {
                if (player.sprites.rollingBomb instanceof cloudkid.Emitter) {
                    player.sprites.rollingBomb.emit = false;
                    tr.emitters.splice(tr.emitters.indexOf(player.sprites.rollingBomb), 1);
                    player.sprites.rollingBomb.destroy();
                } else {
                    player.sprites.rollingBomb.visible = false;
                }
                player.sprites.rollingBomb = null;

            }
        }
    };

    tagpro.ui.scores = function () {
        var e = "",
            t = "";
        if (tagpro.teamNames.redTeamName !== "Red") {
            e = tagpro.teamNames.redTeamName + " - ";
        }
        if (tagpro.teamNames.blueTeamName !== "Blue") {
            t = " - " + tagpro.teamNames.blueTeamName;
        }
        var n = e + (tagpro.score.r ? tagpro.score.r.toString() : "0"),
            r = (tagpro.score.b ? tagpro.score.b.toString() : "0") + t;
        if (tagpro.ui.sprites.redScore) {
            if (tagpro.ui.sprites.redScore.text !== n) {
                tagpro.ui.sprites.redScore.setText(n);
            }
            if (tagpro.ui.sprites.blueScore !== r) {
                tagpro.ui.sprites.blueScore.setText(r);
            }
        } else {
            tagpro.ui.sprites.redScore = new PIXI.Text(n, {fill: tagpro.tools.settings.values.red, font: big_font});
            tagpro.ui.sprites.blueScore = new PIXI.Text(r, {
                fill: tagpro.tools.settings.values.blue,
                font: big_font
            });
            tagpro.ui.sprites.redScore.alpha = 0.5;
            tagpro.ui.sprites.blueScore.alpha = 0.5;
            tagpro.ui.sprites.redScore.anchor.x = 1;
            tagpro.ui.sprites.blueScore.anchor.x = 0;
            tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.redScore);
            tagpro.renderer.layers.ui.addChild(tagpro.ui.sprites.blueScore);
        }
    };

    tagpro.ui.timer = function (e, t, n, r) {
        var i = tagpro.ui.sprites.timer;
        if (!i) {
            i = tagpro.ui.sprites.timer = new PIXI.Text("", {
                fill: "#FFFFFF",
                strokeThickness: 4,
                stroke: tagpro.tools.settings.values.stroke || "#000000",
                font: timer_font
            });
            i.alpha = 0.5;
            i.anchor.x = 0.5;
            e.addChild(tagpro.ui.sprites.timer);
        }
        if (i.text !== r) {
            i.setText(r);
        }
    };

    function playerCount() {
        var i,
            count = 0;
        for (i in tagpro.players) {
            if (!tagpro.players.hasOwnProperty(i)) {
                continue;
            }
            if (tagpro.players[i].name) {
                count++;
            }
        }
        return count;
    }

    function updatePlayerText() {

        // Text colors!
        tagpro.renderer.drawName = function (player) {
            if (!player.sprites.name || player.sprites.name.text !== player.name || player.sprites.name.auth !== player.auth) {
                if (player.sprites.name) {
                    player.sprites.info.removeChild(player.sprites.name);
                }
                var color;
                if (player.auth) {
                    color = tagpro.tools.settings.values.green;
                } else {
                    color = "#FFFFFF";
                }
                player.sprites.name = tagpro.renderer.prettyText(player.name, color);

                // Fixes a bug caused when the object as false and then is turned true after the text is rendered.
                player.sprites.name.auth = player.auth;
                player.sprites.info.addChild(player.sprites.name);
            }
            player.sprites.name.x = 32;
            player.sprites.name.y = -17;
        };
    }

    tr.drawDegree = function (player) {
        if (!player.sprites.degrees && player.degree) {
            player.sprites.degrees = tr.prettyText(player.degree + "°");
            player.sprites.info.addChild(player.sprites.degrees);
        }
        if (player.sprites.degrees) {
            player.sprites.degrees.x = 36;
            player.sprites.degrees.y = -5;
        }
    };

    (function checkPlayers() {
        if (!playerCount()) {
            return setTimeout(checkPlayers, 100);
        }

        // Add a buffer to the players be authorized.
        setTimeout(updatePlayerText, 100);
    })();

};