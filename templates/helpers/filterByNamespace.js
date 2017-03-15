/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
    'use strict';
    var _ = require('lodash');
    Handlebars.registerHelper('filterByNamespace', function(valuesets, thisNamespace) {
      return _.filter(valuesets, function(vs) { return vs.namespace == thisNamespace;});
    });
};