/* global tagpro */

/**
 * Fixes the sticky key bug.
 * http://redd.it/29ju7v
 * @author Some Ball -1
 * @author Carl Colglazier
 */
module.exports = (() => {
    'use strict';
    return {
        game: () => {
            document.addEventListener('keydown', () => {
                if (document.getElementById('chat').style.display.indexOf('block') >= 0) {
                    tagpro.disableControls = false;
                }
            });
            document.getElementById('chat').addEventListener('keydown', function (event) {
                if (event.keyCode !== 13 && (event.keyCode < 37 || event.which > 40)) {
                    event.stopPropagation();
                }
            });
        }
    };
})();
