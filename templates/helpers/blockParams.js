/**
 * Handlebars Helpers: {{block params}}
 *
 * Allows one to set local variables within the following block of handlebars code.
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
    'use strict';
    var _ = require('lodash');
    Handlebars.registerHelper('blockParams', function() {
      var args = [],
          options = arguments[arguments.length - 1];
      for (var i = 0; i < arguments.length - 1; i++) {
        args.push(arguments[i]);
      }
      return options.fn(this, {data: options.data, blockParams: args});
    });
}