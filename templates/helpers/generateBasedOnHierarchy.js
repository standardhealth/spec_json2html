/**
 * Handlebars Helpers: {{getFilename}}
 *
 */


// Export helpers
module.exports.register = function (Handlebars, options, params) {
    'use strict';

    // addBasedonRelationship is not currently being used in the hierarchy view
    var addBasedOnRelationship = function (namespaces, de, deNode, curNamespace) {
        var namespace;
        var basedOnNode, basedOnDE;
        if (de.basedOn) {
            _.forEach(de.basedOn, function (basedOn) {
                if (basedOn.namespace === curNamespace) {
                    basedOnNode = {name: basedOn.label, children: []};
                } else {
                    basedOnNode = {name: basedOn.label + " (" + basedOn.namespace + ")", children: []};
                }
                deNode.children.push(basedOnNode);

                if (basedOn.namespace) {
                    namespace = _.find(namespaces, {label: basedOn.namespace});
                    basedOnDE = _.find(namespace.children, {label: basedOn.label});
                    if (basedOnNode.children.length == 0) {
                        addBasedOnRelationship(namespaces, basedOnDE, basedOnNode, curNamespace);
                    }
                }
            });
        }
    };

    var getLink = function (name, namespace) {
        var partialPath = namespace.split('.')[1];
        var link = '/shr/' + partialPath + '/#' + name;
        return link;
    };

    var _ = require('lodash');
    Handlebars.registerHelper('generateBasedOnHierarchy', function (namespaces, opts) {
        var result = {name: "SHR", children: []};
        var nsNode, entryNode, fieldNode, currentNamespace;

        _.forEach(namespaces, function (namespace) {
            nsNode = {name: namespace.label, children: []};
            result.children.push(nsNode);
            _.forEach(namespace.children, function (de) {

                if (de.isEntry) {
                    entryNode = {name: de.label, children: []};
                    currentNamespace = de.namespace;

                    if (de.value) {

                        var addValueNode = function(val, parent) {
                                var fieldLink = getLink(val.identifier.label, val.identifier.namespace);
                                var fieldName = "Value: " + val.identifier.label;
                                if (currentNamespace === val.identifier.namespace) {
                                    fieldNode = {
                                        name: fieldName,
                                        link: fieldLink,
                                        namespace: val.identifier.namespace,
                                        isDifferentNamespace: false,
                                        children: []
                                    };
                                }
                                else {
                                    fieldNode = {
                                        name: fieldName,
                                        link: fieldLink,
                                        namespace: val.identifier.namespace,
                                        isDifferentNamespace: true,
                                        children: []
                                    };
                                }
                                parent.children.push(fieldNode); 
                            }
                            
                        if (de.value.type !== "ChoiceValue") {
                            addValueNode(de.value, entryNode);
                        } else {
                            var parentNode = {
                                name: "Value choices",
                                children: []
                            };

                            _.forEach(de.value.value, function (val) {
                                addValueNode(val, parentNode);
                            });

                            entryNode.children.push(parentNode);
                        }
                    }
                    
                    _.forEach(de.fieldList, function (field) {

                        var fieldListLink = getLink(field.label, field.namespace);
                        if (currentNamespace === field.namespace) {
                            fieldNode = {
                                name: field.label,
                                link: fieldListLink,
                                namespace: field.namespace,
                                isDifferentNamespace: false,
                                children: []
                            };
                        }
                        else {
                            fieldNode = {
                                name: field.label,
                                link: fieldListLink,
                                namespace: field.namespace,
                                isDifferentNamespace: true,
                                children: []
                            };
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