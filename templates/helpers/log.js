/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';

  Handlebars.registerHelper("log", function (something, opts) {
    console.log(something);
  });
};
    