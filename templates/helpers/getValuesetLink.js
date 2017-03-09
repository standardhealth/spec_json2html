/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
    'use strict';
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }
    Handlebars.registerHelper('getValuesetLink', function(vsName, ns, context) {

      return new Handlebars.SafeString(ns.split('.')[1] + '/' + vsName + '/index.html');
    });
};
