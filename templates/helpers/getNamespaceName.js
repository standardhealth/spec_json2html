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
    Handlebars.registerHelper('getNamespaceName', function(name, context) {
      return new Handlebars.SafeString(name.split('.')[1].capitalize());
    });
};