/**
 * Stat collection.
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
