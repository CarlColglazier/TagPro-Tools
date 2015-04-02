/* global tagpro */
/* jshint esnext: true */

/**
 * Removes the black background from the viewport.
 * @author NewCompte
 * @author Carl Colglazier
 */
module.exports = (() => {
    'use strict';
    return {
        game: () => {
            var oldCanvas = tagpro.renderer.canvas,
                newCanvas = document.createElement('canvas');
            newCanvas.id = 'viewport';
            newCanvas.width = 1280;
            newCanvas.height = 800;
            oldCanvas.parentElement.appendChild(newCanvas);
            oldCanvas.parentElement.removeChild(oldCanvas);
            tagpro.renderer.canvas = newCanvas;
            tagpro.renderer.options.transparent = true;
            tagpro.renderer.renderer = tagpro.renderer.createRenderer();
            tagpro.renderer.resizeAndCenterView();
        }
    };
})();
