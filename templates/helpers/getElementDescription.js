/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
  'use strict';
  var _ = require('lodash');
  Handlebars.registerHelper('getElementDescription', function(hier, ns, elemLabel, opts) {
      var namespacesIndex = _.findIndex(hier.children, {label: "Namespaces"})
      var thisNamespaceIndex = _.findIndex(hier.children[namespacesIndex].children, {label: ns})
      var thisNamespace = hier.children[namespacesIndex].children[thisNamespaceIndex];
      var thisElemIndex = _.findIndex(thisNamespace.children, {label: elemLabel})
      return thisNamespace.children[thisElemIndex].description !== undefined ? thisNamespace.children[thisElemIndex].description : "TBD"
  });
};