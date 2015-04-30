/**
 * Removes the black background from the viewport.
 * @author NewCompte
 * @author Carl Colglazier
 */
module.exports = (() => {
    'use strict';
    return {
        // The canvas sets its background color when it is initialized,
        // so we will need to create a new canvas and initialize it with
        // a transparent background.
        game: () => {
            let oldCanvas = tagpro.renderer.canvas,
                newCanvas = document.createElement('canvas');
            newCanvas.id = 'viewport';
            newCanvas.width = 1280;
            newCanvas.height = 800;
            oldCanvas.parentElement.appendChild(newCanvas);
            oldCanvas.parentElement.removeChild(oldCanvas);
            tagpro.renderer.canvas = newCanvas;
            tagpro.renderer.options.transparent = true;
            tagpro.renderer.renderer = tagpro.renderer.createRenderer();

            // Override the default chat resize function.
            // Fixes a bug where the chat ends up stuck on the left.
            tagpro.chat.resize = () => {
                let offset = (parseInt(document.getElementById('viewport').style.left, 10) + 10) + 'px';
                document.getElementById('chatHistory').style.left = offset;
                document.getElementById('chat').style.left = offset;
            };
            tagpro.renderer.resizeAndCenterView();
        }
    };
})();
