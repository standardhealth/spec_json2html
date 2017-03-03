/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';
  var _ = require('lodash');
  Handlebars.registerHelper('divideOnlyEntries', function(elements, opts) {
    var entries = _.filter(elements, function(element) { 
      return element.isEntry;
    });
    var total = entries.length; 

    // We can't always break it into even thirds, so find the largest
    var maxColLength = Math.ceil(total/3.0);

    // We want an array of three subsections. 
    var subsections = [];
    var tail = maxColLength;
    if (total==4) { 
        subsections.push(entries.slice(0,2))
        subsections.push([entries[2]])
        subsections.push([entries[3]])
        return subsections;
    } else { 
      for (var i = 0; i < total; i += maxColLength) { 
          subsections.push(entries.slice(i, tail));
          tail = ((tail + maxColLength) <= total) ? tail + maxColLength : total;
      }
      return subsections;
    }
  });
};