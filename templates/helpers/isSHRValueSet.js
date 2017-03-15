/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';
  var _ = require('lodash');
  if (!String.prototype.startsWith) {
      String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
  }
  Handlebars.registerHelper('isSHRValueSet', function(vs, opts) {
    // If it starts with http://standardhealthrecord.org or doesn't start with http 
    // then it's an SHR ValueSet
    return (vs.startsWith('http://standardhealthrecord.org')) || !(vs.startsWith('http'))
  });
};