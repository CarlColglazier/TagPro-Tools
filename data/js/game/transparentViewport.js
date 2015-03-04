/* global tagpro */

/**
 * Removes the black background from the viewport.
 * @author AnkhMorpork
 * @author Carl Colglazier
 */
tagpro.tools.optional.transparentViewport = function() {
    'use strict';
    tagpro.renderer.options.transparent = true;
};