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

                        var fieldLink = getLink(de.value.identifier.label, de.value.identifier.namespace);

                        if (currentNamespace === de.value.identifier.namespace) {
                            fieldNode = {
                                name: de.value.identifier.label,
                                link: fieldLink,
                                namespace: de.value.identifier.namespace,
                                isDifferentNamespace: false,
                                children: []
                            };
                        }
                        else {
                            fieldNode = {
                                name: de.value.identifier.label,
                                link: fieldLink,
                                namespace: de.value.identifier.namespace,
                                isDifferentNamespace: true,
                                children: []
                            };
                        }
                        entryNode.children.push(fieldNode);
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