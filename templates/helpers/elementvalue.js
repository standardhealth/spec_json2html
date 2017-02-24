/**
 * Handlebars Helpers: {{#elementvalue @root.shr_v4 namespace elementlabel }}
}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';

	var _ = require('lodash');
	Handlebars.registerHelper('elementvalue', function(root, namespace, elementlabel, options) {
		var data;
		if (options.data) {
			data = Handlebars.createFrame(options.data);
		}
		//console.log("root children length = " + root.children.length + " want " + namespace + " / " + elementlabel);
		if (namespace === undefined) return options.inverse(this);
		if (elementlabel === undefined) return options.inverse(this);

		var namespacesIndex = _.findIndex(root.children, {label: "Namespaces"})
		var thisNamespaceIndex = _.findIndex(root.children[namespacesIndex].children, {label: namespace})
		//console.log(thisNamespaceIndex);
		var thisNamespace = root.children[namespacesIndex].children[thisNamespaceIndex];
		var thisElemIndex = _.findIndex(thisNamespace.children, {label: elementlabel});
		//console.log(thisElemIndex);
		var elem = thisNamespace.children[thisElemIndex];
		if (elem.value === undefined) {
			return options.inverse(this);
		} else {
			//console.log("found base value");
			if (data) {
				data.base = elem.label;
			}
			return options.fn(elem.value, { data: data });
		}
		return options.inverse(this);
	});
};
