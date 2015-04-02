/* global tagpro */

/**
 * Enables spinning on the ball texture itself.
 * http://redd.it/2rpbl2
 * @author Some Ball -1
 */
tagpro.tools.optional.spinBall = (() => {
    'use strict';
    return {
        game: function () {
            tagpro.renderer.anchorBall = function (player) {
                player.sprites.actualBall.anchor.x = 0.5;
                player.sprites.actualBall.anchor.y = 0.5;
                player.sprites.actualBall.x = 20;
                player.sprites.actualBall.y = 20;
            };
            var old = tagpro.renderer.updatePlayerSpritePosition;
            tagpro.renderer.updatePlayerSpritePosition = function (player) {
                if (!player.sprites.actualBall.anchor.x) {
                    tagpro.renderer.anchorBall(player);
                }
                player.sprites.actualBall.rotation = player.angle;
                old(player);
            };
        }
    };
})();
