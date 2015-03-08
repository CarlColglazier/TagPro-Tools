/* global tagpro */

tagpro.tools.optional.texturePacks = function() {
    'use strict';
    document.getElementById('tiles').src = tagpro.tools.settings.values.tiles;
    document.getElementById('speedpad').src = tagpro.tools.settings.values.speedpad;
    document.getElementById('speedpadred').src = tagpro.tools.settings.values.speedpadred;
    document.getElementById('speedpadblue').src = tagpro.tools.settings.values.speedpadblue;
    document.getElementById('portal').src = tagpro.tools.settings.values.portal;
    document.getElementById('splats').src = tagpro.tools.settings.values.splats;
};