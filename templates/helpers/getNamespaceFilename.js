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
  Handlebars.registerHelper('eq', function(a, b, opts) {
      if (a == b) {
          return opts.fn(this);
      } else {
          return opts.inverse(this);
      }
  });
  Handlebars.registerHelper("log", function(something) {
    console.log(something);
  });
};