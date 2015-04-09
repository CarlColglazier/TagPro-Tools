/* jshint phantom: true */
/* jshint devel: true */
var page = require('webpage').create(),
    response = [];

function it(desciption, value) {
    'use strict';
    response.push({
        description: desciption,
        value: value
    });
}

function assert(reference, comparison) {
    'use strict';
    return (reference === comparison) ? true : false;
}

page.open('http://localhost:8000', function (status) {
    'use strict';
    it('should load the page',
        assert('success', status)
    );
    page.injectJs ('lib/js/tools.js');
    var tagpro_object = page.evaluate(function () {
        return window.tagpro;
    });
    it('should have a TagPro object',
        assert('object', typeof tagpro_object)
    );
    it('should have a TagPro tools object',
        assert('object', typeof tagpro_object.tools)
    );

    // Sent the results of this test back to the node process.
    console.log(JSON.stringify(response));
    phantom.exit();
});
