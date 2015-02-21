/*global tagpro */

/**
 * Fixes the sticky key bug.
 * http://redd.it/29ju7v
 * @author Some Ball -1
 * @author Carl Colglazier
 */
tagpro.tools.optional.overrideDisableControls = function() {
    'use strict';
    document.addEventListener('keydown', function (event) {
        if (document.getElementById('chat').style.display.indexOf('block') >= 0) {
            tagpro.disableControls = false;
        }
    });
    document.getElementById('chat').addEventListener('keydown', function (event) {
        // if (event.keyCode === 65 || event.keyCode === 68 || event.keyCode === 83 || event.keyCode === 87) // pressed A, D, S, W.
        if (event.keyCode !== 13 && (event.keyCode < 37 || event.which > 40)) {
            event.stopPropagation();
        }
    });
};

/**
 * Enables spinning on the ball texture itself.
 * http://redd.it/2rpbl2
 * @author Some Ball -1
 */
tagpro.tools.optional.spinBall = function() {
    'use strict';
    tagpro.renderer.anchorBall = function (player) {
        player.sprites.actualBall.anchor.x = 0.5;
        player.sprites.actualBall.anchor.y = 0.5;
        player.sprites.actualBall.x = 20;
        player.sprites.actualBall.y = 20;
    };
    var old = tagpro.renderer.updatePlayerSpritePosition;
    tagpro.renderer.updatePlayerSpritePosition = function (player) {
        if(!player.sprites.actualBall.anchor.x) {
            tagpro.renderer.anchorBall(player);
        }
        player.sprites.actualBall.rotation = player.angle;
        old(player);
    };
};

tagpro.ready(function() {
    'use strict';
    tagpro.tools.optional.overrideDisableControls();
    tagpro.tools.optional.spinBall();
});