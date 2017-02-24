/**
 * Handlebars Helpers: {{#eachelementchild @root.shr_v4 namespace elementlabel }}
}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';

	var _ = require('lodash');
	Handlebars.registerHelper('eachelementchild', function eachelementchild(root, namespace, elementlabel, curchildren, options) {
		var ret = "", data;
		
		if (options.data) {
			data = Handlebars.createFrame(options.data);
		}

		var getparent = options.hash['getparent'];
		//console.log("Loop over children of " + namespace + " / " + elementlabel + " get parent = " + getparent + " children to avoid len = " + curchildren.length);
		if (namespace === undefined) return ret;
		if (elementlabel === undefined) return ret;
		var namespacesIndex = _.findIndex(root.children, {label: "Namespaces"})
		var thisNamespaceIndex = _.findIndex(root.children[namespacesIndex].children, {label: namespace})
		var thisNamespace = root.children[namespacesIndex].children[thisNamespaceIndex];
		var thisElemIndex = _.findIndex(thisNamespace.children, {label: elementlabel});
		var elem = thisNamespace.children[thisElemIndex];
		var n, chk, found;
		//console.log("found element. num children: " + elem.children.length);
		for (var p=0, q=elem.children.length; p<q; p++) {
			if (elem.children[p].label) {
				n = elem.children[p].label;
			} else {
				n = elem.children[p].text; // TBD
			}
			//console.log("find " + n);
			found = false;
			for (var r=0, s=curchildren.length; r<s; r++) {
				//console.log(" --> check " + curchildren[r].label);
				if (curchildren[r].label) {
					chk = curchildren[r].label;
				} else {
					chk = curchildren[r].text; // TBD
				}
				if (chk === n) {
					found = true;
					break;
				}
			}
			if (!found) {
				if (data) {
					data.base = elem.label;
				}
				ret = ret + options.fn(elem.children[p], { data: data });
			}
		}
		if (getparent === true && elem.basedOn) {
			for (var i = 0, j=elem.basedOn.length; i<j; i++) {
				//console.log("parent to check: " + elem.basedOn[i].label);
				ret = ret + eachelementchild(root, elem.basedOn[i].namespace, elem.basedOn[i].label, curchildren.concat(elem.children), options);
			}
		}

		
		/* for(var i=0, j=root.children.length; i<j; i++) {
			var spec = root.children[i];
			//console.log(spec.label);
			if (spec.label === "Namespaces") {
				for (var k=0, l=spec.children.length; k<l; k++) {
					var ns = spec.children[k];
					//console.log(ns.label);
					if (ns.label === namespace) {
						for (var m=0, n=ns.children.length; m<n; m++) {
							var elem = ns.children[m];
							//console.log(elem.label);
							if (elem.label === elementlabel) {
								for (var p=0, q=elem.children.length; p<q; p++) {
									var n = elem.children[p].label
									//console.log("find " + n);
									var found = false;
									for (var r=0, s=curchildren.length; r<s; r++) {
										//console.log(" --> check " + curchildren[r].label);
										if (curchildren[r].label === n) {
											found = true;
											break;
										}
									}
									if (!found) {
										ret = ret + options.fn(elem.children[p]);
										break;
									}
								}
								break;
							}
						}
						break;
					}
				}
				break;
			}
		}*/
		return ret;
	});
};

