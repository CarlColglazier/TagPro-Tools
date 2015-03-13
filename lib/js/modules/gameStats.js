/* global tagpro */
/* jshint esnext: true */

/**
 * Stat collection.
 * @author ylambda
 * @author Watball
 * @author NewCompte
 * @author P0P
 * @author TOJO
 * @author Carl Colglazier
 */
tagpro.tools.optional.gameStats = (() => {
    'use strict';
    return {
        game: () => {
            document.addEventListener('gameend', function() {
                tagpro.tools.global.data.send('catstats', 'catstats', tagpro.tools.global.stats.players.get());
            });
        }
    };
})();