/**
 * Handlebars Helpers: {{pathtodisplay}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
    'use strict';
    Handlebars.registerHelper('pathtodisplay', function(path, context) {
		if (path === undefined) return "";
		var pieces = path.split(':');
		var result = "";
		var parts;
		for (var i = 0, j = pieces.length-1; i < j; i++) {
			parts = pieces[i].split('.');
			if (i == 0) {
				result = parts[parts.length - 1];
			} else {
				result = result + "." + parts[parts.length - 1];
			}
		}
		return result;
    });
};