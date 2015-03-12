/* global tagpro */

/**
 * Fixes the sticky key bug.
 * http://redd.it/29ju7v
 * @author Some Ball -1
 * @author Carl Colglazier
 */
tagpro.tools.optional.overrideDisableControls = (function() {
    'use strict';
    return {
        game: function() {
            document.addEventListener('keydown', function () {
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
        }
    };
})();