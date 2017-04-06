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
    Handlebars.registerHelper('getCodesystemLink', function(url, codesystemLookup, context) {
        if (url.startsWith('http://standardhealthrecord.org') || !url.startsWith('http')) {
            if (url.startsWith("urn:tbd") || url == "") { 
                return "TBD";
            } else { 
                var cs = codesystemLookup[url];
                return new Handlebars.SafeString(cs.shrLink);
            }
        } else { 
            return url;
        }
    });
};
