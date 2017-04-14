/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';

  var addBasedOnRelationship = function(namespaces, de, deNode, curNamespace) {
	  var namespace;
      // var namespaces = _.find(hier.children, {label: "Namespaces"})
	  var basedOnNode, basedOnDE;
	  if (de.basedOn) {
		_.forEach(de.basedOn, function (basedOn) {
			//basedOnNamespace = result.index[basedOn.namespace];
			//basedOnNode = basedOnNamespace.index[basedOn.label];
			if (basedOn.namespace === curNamespace) {
				basedOnNode = {name: basedOn.label, children: []};
			} else {
				basedOnNode = {name: basedOn.label + " (" + basedOn.namespace + ")", children: []};
			}
			deNode.children.push(basedOnNode);
			//console.log(basedOn);
			//console.log(hier);
			if (basedOn.namespace) {
				namespace = _.find(namespaces, {label: basedOn.namespace});
				basedOnDE = _.find(namespace.children, {label: basedOn.label});
				if (basedOnNode.children.length == 0) {
					//console.log("more?");
					//console.log(basedOnDE.basedOn);
					addBasedOnRelationship(namespaces, basedOnDE, basedOnNode, curNamespace);
				}
			}
		});
	  }
  };
  
  var _ = require('lodash');
  Handlebars.registerHelper('generateBasedOnHierarchy', function(namespaces, opts) {
	  var result = {name:"SHR", sameNamespace: true, children: []};
	  var nsNode, entryNode, fieldNode, currentNamespace;
      // var namespaces = _.find(hier.children, {label: "Namespaces"})
	  _.forEach(namespaces, function(namespace) {
		  nsNode = {name: namespace.label, sameNamespace: true, children: []};
		  result.children.push(nsNode);
		  _.forEach(namespace.children, function(de) {
				if (de.isEntry) {
					entryNode = {name:de.label, sameNamespace: true, children: []};
					currentNamespace = de.namespace;

					if (de.value) {
						if (currentNamespace === de.value.identifier.namespace) {
							fieldNode = {name: de.value.identifier.label, sameNamespace: true, children: []};
						}
						else {
							fieldNode = {name: de.value.identifier.label, sameNamespace: false, children: []};
						}
						entryNode.children.push(fieldNode);
					}
					_.forEach(de.fieldList, function(field) {
						if (currentNamespace === field.namespace) {
							fieldNode = {name: field.label, sameNamespace: true, children: []};
						}
						else {
							fieldNode = {name: field.label, sameNamespace: false, children: []};
						}

						entryNode.children.push(fieldNode);
					});
					nsNode.children.push(entryNode);
				}
		  });
	  });
      return JSON.stringify(result);
  });
};