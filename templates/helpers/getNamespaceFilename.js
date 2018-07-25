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
    Handlebars.registerHelper('getNamespaceFilename', function(nStatic, nDynamic, context) {
      var name = nStatic !== undefined ? nStatic : nDynamic;
      return new Handlebars.SafeString(name.toLowerCase()); // + '/index.html');
    });
};
