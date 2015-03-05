/* global require: false */

var pageMod = require("sdk/page-mod");

pageMod.PageMod({

    // TODO: Get array working.
    include: "*.koalabeast.com",
    contentScriptWhen: 'ready',
    contentScriptFile: [
        './js/prepare.js',
        './js/global.js'
    ],
    contentStyleFile: [
        './css/tools.css'
    ]
});