/**
 * Handlebars Helpers: {{gt a b}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';

  Handlebars.registerHelper('gt', function(a, b, opts) {
      if (a > b) {
          return opts.fn(this);
      } else {
          return opts.inverse(this);
      }
  });
};