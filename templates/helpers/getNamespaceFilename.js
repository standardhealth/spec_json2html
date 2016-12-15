/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';

  Handlebars.registerHelper('getNamespaceFilename', function(name,context) {
    return new Handlebars.SafeString(name.split('.')[1]+'.html');
  });
};