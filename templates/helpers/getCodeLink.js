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
    Handlebars.registerHelper('getCodeLink', function(url, hier, code, context) {
        if (url.startsWith('http://standardhealthrecord.org') || !url.startsWith('http')) {
            if (url.startsWith("urn:tbd") || url == "") {
                return "TBD";
            } else {
                var codesystems = hier.csysLookup;
                var cs = codesystems[url];
                return new Handlebars.SafeString('/shr/' + cs.namespace + '/cs/#' + code);
            }
        } else {
            return url;
        }
    });
};
