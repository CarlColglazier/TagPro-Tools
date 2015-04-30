/* global addBackground: true */

/**
 * Change the background and save the new background to teh settings.
 * @param {string} uri
 */
function updateBackground(uri) {
    'use strict';
    addBackground(uri);
    tagpro.tools.settings.values.background = uri;
    tagpro.tools.global.data.set('settings', tagpro.tools.settings.values);
}

module.exports = (() => {
    'use strict';
    // Prevents the page from redirecting when a file in dropped on it.
    document.documentElement.addEventListener('dragover', (event) => {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });

    document.documentElement.addEventListener('drop', (event) => {
        event.stopPropagation();
        event.preventDefault();
        let files = event.dataTransfer.files,
            read_image = function (read) {
                updateBackground(read.target.result);
            };
        files.forEach(file => {
            if (file.type.indexOf('image') === 0) {
                let reader = new FileReader();
                reader.onload = read_image;
                reader.readAsDataURL(file);
            }
        });
    });
})();
