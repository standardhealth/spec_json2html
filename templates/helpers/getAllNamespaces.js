/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
    'use strict';
    var _ = require('lodash');
    Handlebars.registerHelper('getAllNamespaces', function(valuesets, context) {
        let namespaces = _.map(valuesets, function(vs) { 
            return vs.namespace;
        });
        return _.uniq(namespaces);
    });
};