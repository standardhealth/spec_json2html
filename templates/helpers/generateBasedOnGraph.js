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
					addBasedOnRelationship(hier, basedOnDE, basedOnNode, curNamespace);
				}
			}
		});
	  }
  };
  
  var _ = require('lodash');
  Handlebars.registerHelper('generateBasedOnGraph', function(namespaces, opts) {
	  var node, index, link, n1, n2;
	  var result = {};
	  var nodeList = [];
	  result.links = [];
      // var namespaces = _.find(hier.children, {label: "Namespaces"})
	  _.forEach(namespaces, function(namespace) {
		  _.forEach(namespace.children, function(de) {
			  node = {label:de.label, r: 2, namespace: namespace, title: namespace.label, key: namespace.label + ":" + de.label, id: nodeList.length, numlinks: 0};
			  nodeList.push(node);
		  });
	  });
	  index = _.keyBy(nodeList, 'key');
	  _.forEach(namespaces, function(namespace) {
		  _.forEach(namespace.children, function(de) {
			  if (de.basedOn) {
				  //console.log(namespace.label + ":" + de.label);
				  n1 = index[namespace.label + ":" + de.label];
				  _.forEach(de.basedOn, function(basedOn) {
					  if (basedOn.namespace) {
						  //console.log(basedOn.namespace + ":" + basedOn.label);
						  n2 = index[basedOn.namespace + ":" + basedOn.label];
						  n1.numlinks = n1.numlinks + 1;
						  n2.numlinks = n2.numlinks + 1;
						  link = {source: n1.id, target: n2.id};
						  result.links.push(link);
					  }
				  });
			  }
		  });
	  });

	  result.nodes = nodeList;
	  
      return JSON.stringify(result);
  });
};