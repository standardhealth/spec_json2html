/**
 * Handlebars Helpers: {{shr_partial}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';

  Handlebars.registerHelper('shr_partial', function(name,context) {
    return new Handlebars.SafeString("schema_" + name.toLowerCase());
  });
};