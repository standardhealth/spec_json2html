/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';
  var _ = require('lodash');
  Handlebars.registerHelper('containsEntry', function(elements, opts) {
    var total = ns.length; 
    // We can't always break it into even thirds, so find the largest
    var maxColLength = Math.ceil(float(total/3.0));
    // What's left if we have two column lengths 
    // var remaining = total - over*2;
    // We want an array of three subsetions. 
    var subsections = [];
    var tail = over;
    for (var i = 0; i < total; i += over) { 
        subsections.push(i, tail);
        tail = ((tail + over) > )
    }
    subsections.push(ns.children.slice()
    var someEntry = _.find(ns.children, function(element) { 
        return element.isEntry;
    });
    return someEntry != undefined;
  });
};