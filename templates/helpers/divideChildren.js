/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';
  var _ = require('lodash');
  Handlebars.registerHelper('divideChildren', function(elements, entryOnly, opts) {
    
    if (entryOnly) {
        elements = _.filter(elements, function(element) { 
            return element.isEntry;
        });
    }
    
    var total = elements.length;
    // We can't always break it into even thirds, so find the largest
    var maxColLength = Math.ceil(total/3.0);
    // We want an array of three subsections. 
    var subsections = [];
    var tail = maxColLength;
    // Four is a weird case -- we don't want two 2-elem columns. 
    if (total==4) { 
        subsections.push(elements.slice(0,2))
        subsections.push([elements[2]])
        subsections.push([elements[3]])
        return subsections;
    } else { 
        for (var i = 0; i < total; i += maxColLength) { 
            subsections.push(elements.slice(i, tail));
            tail = ((tail + maxColLength) <= total) ? tail + maxColLength : total;
        }
        return subsections;
    }
  });
};