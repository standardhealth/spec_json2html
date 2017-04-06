/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
    'use strict';
    var _ = require('lodash');
    Handlebars.registerHelper('getElementNamespace', function(lookup, elemLabel, opts) {
        return lookup[elemLabel];
    });
};0