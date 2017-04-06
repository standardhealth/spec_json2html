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
    Handlebars.registerHelper('getValuesetLabel', function(url, valuesetLookup, context) {
        if (url.startsWith("urn:tbd:")) { 
            return "TBD"
        } else { 
            var vs = valuesetLookup[url];
            return new Handlebars.SafeString(vs.label);
        }
    });
};
