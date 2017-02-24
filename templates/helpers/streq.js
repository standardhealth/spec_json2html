/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';

  Handlebars.registerHelper('streq', function(a, b, opts) {
      if (a === b) {
          return opts.fn(this);
      } else {
          return opts.inverse(this);
      }
  });
};