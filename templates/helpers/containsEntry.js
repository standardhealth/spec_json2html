/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';
  var _ = require('lodash');
  Handlebars.registerHelper('containsEntry', function(ns, opts) {
  	var someEntry = _.find(ns.children, function(element) { 
  		return element.isEntry;
  	});
  	return someEntry != undefined;
  });
};