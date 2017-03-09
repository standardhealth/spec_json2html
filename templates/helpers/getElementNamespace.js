/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
    'use strict';
    var _ = require('lodash');
    Handlebars.registerHelper('getElementNamespace', function(hier, elemLabel, opts) {
        var namespacesIndex = _.findIndex(hier.children, {label: "Namespaces"})
        var namespaceContainingElement = undefined; 
        _.forEach(hier.children[namespacesIndex].children, function(namespace) {
            if (!namespaceContainingElement) { 
                namespaceContainingElement = (_.find(namespace.children, function(element) {
                     
                    return element.label == elemLabel;
                })) != undefined ? namespace : undefined;
            }
        })
        if (namespaceContainingElement) { 
            return namespaceContainingElement.label;
        } else { 
            console.log('failed to find ' + elemLabel + ' in ns')
            console.log('putting actor as a placeholder for now')
            return "shr.actor"
        }
    });
};0