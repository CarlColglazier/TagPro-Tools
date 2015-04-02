/* global tagpro */

module.exports = (() => {
    'use strict';
    return {
        game: function () {
            if (this.completed) {
                return;
            }
            tagpro.loadAssets({
                'tiles': tagpro.tools.settings.values.tiles,
                'speedpad': tagpro.tools.settings.values.speedpad,
                'speedpadRed': tagpro.tools.settings.values.speedpadred,
                'speedpadBlue': tagpro.tools.settings.values.speedpadblue,
                'portal': tagpro.tools.settings.values.portal,
                'splats': tagpro.tools.settings.values.splats
            });
            this.completed = true;
        }
    };
})();
