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
	  var result = {name:"SHR", children: []};
	  var nsNode, deNode;
      // var namespaces = _.find(hier.children, {label: "Namespaces"})
	  _.forEach(namespaces, function(namespace) {
		  nsNode = {name: namespace.label, children: []};
		  result.children.push(nsNode);
		  _.forEach(namespace.children, function(de) {
			  deNode = {name:de.label, children: []};
			  nsNode.children.push(deNode);
			  //console.log("**** check based on for " + de.label);
			  addBasedOnRelationship(namespaces, de, deNode, namespace.label);
		  });
		  //nsNode.index = _.keyBy(nsNode.children, 'name');
	  });
	  //result.index = _.keyBy(result.children, 'name');
	  
      return JSON.stringify(result);
  });
};