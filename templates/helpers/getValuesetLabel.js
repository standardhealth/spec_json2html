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
    Handlebars.registerHelper('getValuesetLabel', function(url, hier, context) {
        if (url.startsWith("urn:tbd:")) { 
            return "TBD"
        } else { 
            var valuesets = _.find(hier.children, function(shrSection) {
                return shrSection.type == "ValueSets";
            });
            var vs = valuesets.index_by_url[url];
            return new Handlebars.SafeString(vs.label);
        }
    });
};
