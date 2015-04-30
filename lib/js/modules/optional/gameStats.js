/**
 * Stat collection.
 * @author ylambda
 * @author Watball
 * @author NewCompte
 * @author P0P
 * @author TOJO
 * @author Carl Colglazier
 */
module.exports = (() => {
    'use strict';
    return {
        game: () => {
            document.addEventListener('gameend', () => {
                tagpro.tools.global.data.send('catstats', 'catstats', tagpro.tools.global.stats.players.get());
            });
        }
    };
})();
