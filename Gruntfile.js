/*
 * shr-assemble-spec
 *
 * Michael Nosal and Dylan Phelan
 * https://github.com/standardhealth/spec_json2html
 *
 * Copyright (c) 2017
 * Licensed under the Apache 2.0 license.
 */
var _ = require('lodash');
function msgLog (msg, ...vars) { 
    console.log(msg);
    _.forEach(vars, function(elem) {
         console.log(elem); 
    });   
    console.log('');
};

String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
}
module.exports = function(grunt) {
    'use strict';
    const site = grunt.file.readYAML('_config.yml');
    // For timing tasks
    require('time-grunt')(grunt);   

    // start GQ created
    var getDescription = function(field) {
        if (field.description) return field.description;
        // Else, if the element has an id, get description from original namespace
        if (field.identifier) {
            // Prims have no description now
            if (field.identifier.namespace === "primitive") return "";
            // Handle Incomplete Values
            if (field.type === "Incomplete") return "";
            // Otherwise find the element and return its description
            var element = namespaces[field.identifier.namespace].index[field.identifier.label];
            if (element) {
                return element.description;
            } else {
                // There is no descripion -- use placeholder text
                return "No description";
            }
        } else {
            // If field is a choice, it's subsidiaries need descriptions, it shouldn't have one
            if (field.type == 'ChoiceValue') { 
                return "";
            // Else, there is no identifier, no element, and not a choice -- it's TBD
            } else { 
                return "Description TBD";
            }
        }
    }
  
    function combineArraysIntoIdentifierList (namespaceList, nameList) {
        var name = "", 
            namespace = {},
            combinedArrays = [];
        var numberOfNamespaces = namespaceList.length
        for (var i = 0; i < numberOfNamespaces; i++) {
            namespace = namespaceList[i];
            name = nameList[i];
            combinedArrays.push({ 
                namespace: namespace, 
                label: name
            });
        }
        return combinedArrays;
    }
  
    // create the initial record for the specified field within the element concretedataelement
    // note that in addition to the fields initialized below, the field record can have a values attribute which is a list of subordinate records
     function newRecord(fieldName, fieldNamespace, field, foundin, isValue, isChoice, isSubElement, concretedataelement) {
        if (fieldName && fieldName.constructor === Array) {
            return {  
                foundin:                [ foundin ], 
                concretedataelement:    concretedataelement,
                isValue:                isValue, 
                isChoice:               isChoice,
                isSubElement:           isSubElement,
                namespace:              fieldNamespace[fieldNamespace.length - 1],
                label:                  fieldName[fieldName.length - 1], 
                identifierList:         combineArraysIntoIdentifierList(fieldNamespace.slice(0, -1), fieldName.slice(0, -1)), 
                isTBD:                  field.type === "TBD",
                constraints:            field.constraints.slice(), 
                cardinality :           [ { min: field.min, max: field.max } ], 
                description :           getDescription(field) 
            };    
        } else {
            return {  
                foundin:              [ foundin ], 
                concretedataelement:  concretedataelement,
                isValue:              isValue, 
                isChoice:             isChoice,
                isSubElement:         isSubElement,
                namespace:            fieldNamespace,
                label:                fieldName, 
                isTBD:                field.type === "TBD",
                constraints:          field.constraints.slice(), 
                cardinality :         [  { min: field.min, max: field.max } ], 
                description :         getDescription(field) 
              };
        }
    }

    /*
     * Create a record of the concreteDataElement's value using the currently specified dataelement 
     * whichc is found within the specified namespace 
     */
    function createValueRecord (concreteDataelement, namespace, dataelement) {
        var subrecord;
        if (dataelement.value) {
            if (concreteDataelement.valueRecord) {
                concreteDataelement.valueRecord.foundin.unshift(dataelement.label);
                if (dataelement.value.constraints) { 
                    concreteDataelement.valueRecord.constraints.unshift(dataelement.value.constraints); 
                } else { 
                    concreteDataelement.valueRecord.constraints.unshift([]); 
                }
                concreteDataelement.valueRecord.cardinality.unshift({min : dataelement.value.min, max: dataelement.value.max});
            } else {
                // If it's a choice, create a choice record and add the options as "values" on that record.
                if (dataelement.value.type == "ChoiceValue") {
                    concreteDataelement.valueRecord = newRecord(
                        "Choice",                   // fieldName
                        "",                         // fieldNamespace
                        dataelement.value,          // field
                        dataelement.label,          // foundin
                        true,                       // isValue
                        false,                      // isChoice
                        false,                      // isSubElement
                        concreteDataelement.label   // concretedataelement
                    );
                    concreteDataelement.valueRecord.effectivecardinality = {}; //manually setting this prevents crashes
                    concreteDataelement.valueRecord.effectivecardinality.min = concreteDataelement.valueRecord.cardinality[0].min; 
                    concreteDataelement.valueRecord.effectivecardinality.max = concreteDataelement.valueRecord.cardinality[0].max; 

                    concreteDataelement.valueRecord.values = [];
                    _.forEach(dataelement.value.value, function(item) {
                        // If there is an identifier, the value is defined -- use it to define the subrecord
                        if (item.identifier) {
                            subrecord = newRecord(
                                item.identifier.label,      // fieldName
                                item.identifier.namespace,  // fieldNamespace
                                item,                       // field
                                dataelement.label,          // foundin
                                false,                      // isValue
                                true,                       // isChoice
                                false,                      // isSubElement
                                concreteDataelement.label   // concretedataelement
                            );
                        // Else the choice value is TBD -- use .text instead of .label
                        } else {
                            subrecord = newRecord(
                                item.text,                  // fieldName
                                undefined,                  // fieldNamespace
                                item,                       // field
                                dataelement.label,          // foundin
                                false,                      // isValue
                                true,                       // isChoice
                                false,                      // isSubElement
                                concreteDataelement.label   // concretedataelement
                            );
                        }
                        concreteDataelement.valueRecord.values.push(subrecord);
                    });
                // If the element is TBD, 
                } else if (dataelement.value.type == "TBD") {
                    concreteDataelement.valueRecord = newRecord(
                        dataelement.value.text,     // fieldName
                        undefined,                  // fieldNamespace
                        dataelement.value,          // field
                        dataelement.label,          // foundin
                        true,                       // isValue
                        false,                      // isChoice
                        false,                      // isSubElement
                        concreteDataelement.label   // concretedataelement
                    );
                } else {
                    concreteDataelement.valueRecord = newRecord(
                        dataelement.value.identifier.label,     // fieldName
                        dataelement.value.identifier.namespace, // fieldNamespace
                        dataelement.value,                      // field
                        dataelement.label,                      // foundin
                        true,                                   // isValue
                        false,                                  // isChoice
                        false,                                  // isSubElement
                        concreteDataelement.label               // concretedataelement
                    );
                }
            }
        }
    }
  
    // add field records to the field list for the concrete data element based on the element data element (which could be the concrete one or an ancestor)
    function createFieldList (concreteDataelement, namespace, dataelement) {
        var fieldName, fieldNamespace;
        var record, subrecord;
        var index = 0;
        _.forEach(dataelement.children, function(field) {
            index = index + 1;
                var fieldValues = [];
                /*
                 * Determine what the fieldName, fieldNamespace and associated record 
                 * are for each of the fields on a dataelement. If the dataelement is a choice or or 
                 *
                 */
                // If the field is a choice among many types, we can use "choice" as the field name
                if (field.type === "ChoiceValue") { 
                    fieldName = "Choice";
                    fieldNamespace = "";
                    record = undefined;
                // Else, it's a dataelement; use it directly 
                } else { 
                    // If there's an identifier, use to define the field
                    if (field.identifier) {
                        fieldName = field.identifier.label; 
                        fieldNamespace = field.identifier.namespace; 
                    // Else, the data element hasn't been defined yet; use "text" in lieu of label for now
                    } else {
                        fieldName = field.text; 
                        fieldNamespace = ""; 
                    }
                    if (concreteDataelement.fieldMap) {
                        record = concreteDataelement.fieldMap[fieldName];  
                    } else {
                        record = undefined;
                    }
                }

                // If there is a record for field, update it
                if (record) {
                    record.foundin.unshift(dataelement.label);
                    if (field.constraints) { 
                        record.constraints.unshift(field.constraints); 
                    } else {
                        record.constraints.unshift([]); 
                    }
                    record.cardinality.unshift({min: field.min, max:field.max});
                // Else, create a record for the  on concrete data element
                } else { 
                    record = newRecord(
                        fieldName,                  // fieldName
                        fieldNamespace,             // fieldNamespace
                        field,                      // field
                        dataelement.label,          // foundin
                        false,                      // isValue
                        false,                      // isChoice
                        false,                      // isSubElement
                        concreteDataelement.label   // concretedataelement
                    );
                    if (concreteDataelement.fieldList === undefined) {
                        concreteDataelement.fieldList = [];
                    }
                    concreteDataelement.fieldList.push(record);
            }

            if (field.type != "Incomplete") {
                if (field.type === "ChoiceValue") {
                    _.forEach(field.value, function(item) {
                        if (item.identifier) {
                            subrecord = newRecord(
                                item.identifier.label,      // fieldName
                                item.identifier.namespace,  // fieldNamespace
                                item,                       // field
                                dataelement.label,          // foundin
                                false,                      // isValue
                                true,                       // isChoice
                                false,                      // isSubElement
                                concreteDataelement.label   // concretedataelement
                            );
                        } else {
                            subrecord = newRecord(
                                item.text,                  // fieldName
                                undefined,                  // fieldNamespace
                                item,                       // field
                                dataelement.label,          // foundin
                                false,                      // isValue
                                true,                       // isChoice
                                false,                      // isSubElement
                                concreteDataelement.label   // concretedataelement
                            );
                        }
                        fieldValues.push(subrecord);
                    });
                }
                if (field.constraints && field.constraints.length > 0) {
                    for (const c of field.constraints) { //using foreach iterator removes `this` reference without much added benefit, for loop is better
                        if (concreteDataelement.fieldMap && c.type == "TypeConstraint") {
                            // if we have a field for new type then make it subordinate to this one
                            if (concreteDataelement.fieldMap[c.isA.label]) { 
                                var isafieldindex = _.findIndex(concreteDataelement.fieldList, {label: c.isA.label});
                                var isafield = concreteDataelement.fieldList[isafieldindex];
                                // remove is a field from concrete data element's field list
                                concreteDataelement.fieldList.splice(isafieldindex, 1); 
                                isafield.isSubElement = true;
                                // put it as a subfield to current field instead
                                fieldValues.push(isafield); 
                            }
                        }
                        if (c.path && c.path.length > 0) {
                            if (c.path.endsWith('shr.core.Coding') || c.path.endsWith('code') || c.path.endsWith('shr.core.CodeableConcept')) {               
                                // console.log("We do not have a mechanism for handling these in terms of a sub-record") 
                                continue;
                            } else {
                                // console.log(concreteDataelement.label + ". processing: " + dataelement.label + " field " + field.identifier.label + " path = " + c.path);
                                var pieces, 
                                    pname, 
                                    pnamespace, 
                                    subfield, 
                                    subrecord;
                                var elementPieces = c.path.split(':');
                                // need a list of name and namespace and then use last subfield as field in newRecord
                                var nameList = [], 
                                    namespaceList = [];
                                _.forEach(elementPieces, function(elementPiece) {
                                    pieces = elementPiece.split('.');
                                    pname = pieces.pop();
                                    pnamespace = pieces.join('.');
                                    nameList.push(pname);
                                    namespaceList.push(pnamespace);
                                    // subfield = namespaces[pnamespace].index[pname];
                                    // subfield.constraints = []
                                    subfield = Object.assign({}, namespaces[pnamespace].index[pname]);  //this prevents duplicated constraints across unrelated fields/elements
                                    if (subfield.constraints === undefined) {
                                        subfield.constraints = [];
                                    }
                                    if (c.type === "CardConstraint") {
                                        subfield.min = c.min;
                                        subfield.max = c.max;
                                    } else {
                                        subfield.constraints.push(c);
                                    }
                                });
                                if (nameList.length == 1) {
                                    subrecord = newRecord(
                                        pname,                      // fieldName
                                        pnamespace,                 // fieldNamespace
                                        subfield,                   // field
                                        dataelement.label,          // foundin
                                        false,                      // isValue
                                        false,                      // isChoice
                                        true,                       // isSubElement
                                        record.concretedataelement  // concretedataelement
                                    );
                                } else {
                                    subrecord = newRecord(
                                        nameList,                   // fieldName
                                        namespaceList,              // fieldNamespace
                                        subfield,                   // field
                                        dataelement.label,          // foundin
                                        false,                      // isValue
                                        false,                      // isChoice
                                        true,                       // isSubElement
                                        record.concretedataelement  // concretedataelement
                                    );
                                }
                                if (c.type === 'CardConstraint') {
                                    subrecord.effectivecardinality = {};
                                    subrecord.effectivecardinality.min = c.min;
                                    subrecord.effectivecardinality.max = c.max;
                                } else {                                    
                                    fieldValues.push(subrecord); //TODO: check if placing this in 'else' this has meaningful adverse effects in displaying subfield constraint info
                                    concreteDataelement.fieldList.find(f => f.label == fieldName).constraints = concreteDataelement.fieldList.find(f => f.label == fieldName).constraints.filter(con => con != c);
                                }
                            }
                        }
                    };
                }
            } else {
                // console.error("ERROR 5: Incomplete type for current field %s", field.label);

                if (field.constraints && field.constraints.length > 0) {
                    for (let c of field.constraints) {
                        if (c.path === 'shr.core.Coding' || c.path === 'code' || c.path === 'shr.core.CodeableConcept') continue;

                        if (c.type != "CardConstraint") {
                            let subrecord;

                            let cPieces = c.path.split('.')
                            let cName = cPieces.pop();
                            let cNamespace = cPieces.join('.');

                            let fieldcopy = Object.assign({}, field);
                            fieldcopy.constraints = field.constraints.filter(con => con == c);
                            // fieldcopy.effectivecardinality = {"min": c.min, "max": c.max};
                            concreteDataelement.fieldList.find(f => f.label == fieldName).constraints = concreteDataelement.fieldList.find(f => f.label == fieldName).constraints.filter(con => con != c);

                            subrecord = newRecord(
                                cName,      // fieldName
                                cNamespace,  // fieldNamespace
                                fieldcopy,                       // field
                                dataelement.label,          // foundin
                                false,                      // isValue
                                false,                       // isChoice
                                true,                      // isSubElement
                                concreteDataelement.label   // concretedataelement
                            );

                            if (subrecord) fieldValues.push(subrecord);
                        }

                    };

                }
            }

            if (fieldValues.length > 0) {
                if (!record.values) record.values = [];
                record.values.push(...fieldValues);
            }
        });
        // build or add to record for value of data element
        createValueRecord(concreteDataelement, namespace, dataelement);
        
        // rebuild the map of fields for the element from the field list
        concreteDataelement.fieldMap = _.keyBy(concreteDataelement.fieldList, 'label');
        
        // follow the inheritance hierarchy up adding to the fields for the current concreteDataelement
        if (dataelement.basedOn) { // add parent fields
            _.forEach(dataelement.basedOn, function(basedOn) {
                if (basedOn.label && basedOn.namespace) {
                    createFieldList(concreteDataelement, basedOn.namespace, namespaces[basedOn.namespace].index[basedOn.label]);
                } else if (basedOn.type === "TBD") {
                    console.error("ERROR 6: The basedOn element \"" + basedOn.label + "\" has yet to be defined, so we cannot expand it");
                } else {
                    console.error("ERROR 3: Invalid based on for element " + dataelement.label + " while building field list for " + concreteDataelement.label + ". BasedOn element that failed was...");
                    console.error(basedOn);
                }
            });
        }
    }

    function createFieldListPerDataElement (namespace) {
        // for each dataelement
        _.forEach(namespace.children, function(dataelement) {
            createFieldList(dataelement, namespace, dataelement);
            // FIXME: Figure out if choices should be in the field map
            // console.log('\n')
            // console.log(dataelement.label)
            // console.log(dataelement.fieldMap["Choice"])

        });
    }
    // end GQ created

    var data = grunt.file.readJSON(`./${site.assets}/${site.data}/${site.dataFile}`);
    var namespacesIndex = _.findIndex(data.children, {type: "Namespaces"})
    var valuesetIndex   = _.findIndex(data.children, {type: "ValueSets"})
    var codesystemIndex = _.findIndex(data.children, {type: "CodeSystems"})
    
    // for each namespace:
    var namespaces = _.keyBy(data.children[namespacesIndex].children,"label");
    _.map(data.children[namespacesIndex].children, function(namespace) {
        namespace.index = _.keyBy(namespace.children,"label");
    });
    
    // GQ created
    // for each namespace:
    for (let namespace of data.children[namespacesIndex].children) {
        createFieldListPerDataElement(namespace); // for each element within the specified namespace, create its field list
    };
  
    //console.log("PHASE 2: effective cardinalities");
    // now go through all fields and figure out its effective cardinality and handle CardConstraints
    //  while building a map from element to namespace -- this is more economical than passing the whole 
    //  hierarchy when building namespace pages
    
    // mapElementstoNamespace  - lookup table mapping every SHR Element to the namespace it's from
    var mapElementstoNamespace = {}; 
    var index;
    _.forEach(data.children[namespacesIndex].children, function(namespace) {
        //console.log("!2!2!2 " + namespace);
        _.forEach(namespace.children, function(dataelement) {
            dataelement.namespace = namespace.label; 
            // For each element, make a namespace mapping;
            var nsLabel = namespace.label;
            mapElementstoNamespace[dataelement.label] = nsLabel;

            _.forEach(dataelement.fieldList, function(record) {
                if (record) {
                    if (record.cardinality && record.cardinality.length > 0) {
                        index = record.cardinality.length - 1;
                        while (index >= 0 && record.cardinality[index].min === undefined && record.cardinality[index].max === undefined) {
                            index--;
                        }
                        if (index < 0) {
                            console.error("ERROR 1: No cardinalities found for namespace/" + namespace.label + " element/" + dataelement.label + " record/" + record.label);
                        } else {
                            record.effectivecardinality = {};
                            record.effectivecardinality.min = record.cardinality[index].min;
                            record.effectivecardinality.max = record.cardinality[index].max;
                        }
                    } else {
                        console.error("ERROR 2: Field has no cardinalities for namespace/" + namespace.label + " element/" + dataelement.label + " record/" + record.label);
                    }
                    if (record.values) {
                        _.forEach(record.values, function (subrecord) {
                            subrecord.effectivecardinality = {};
                            subrecord.effectivecardinality.min = subrecord.cardinality[0].min;
                            subrecord.effectivecardinality.max = subrecord.cardinality[0].max;
                        });
                    }
                } else {
                    console.error("ERROR 4: Undefined record in field list for namespace/" + namespace.label + " element/" + dataelement.label + " record/" + record.label);
                }
            });
            if (dataelement.valueRecord) {
                if (dataelement.valueRecord.values) {
                    _.forEach(dataelement.valueRecord.values, function (subrecord) {
                        subrecord.effectivecardinality = {};
                        subrecord.effectivecardinality.min = subrecord.cardinality[0].min;
                        subrecord.effectivecardinality.max = subrecord.cardinality[0].max;
                    });
                }
            }
        });
    });
    // end GQ created

    //
    /// Making Valueset, Codesystem  and Data Element lookup tables
    // 
    // 1. mapNamespaceToValuesets   - lookup table containing, for each namespace (id'ed by 'label, e.g. 'shr.actor'), 
    //      an array of all of that namespace's associated valuesets
    // 2. mapURLtoValueset          - lookup table mapping every FHIR IG url to the valueset it uniquely identifies
    // 3. mapNamespaceToCodesystems - lookup table containing, for each namespace (id'ed by 'label, e.g. 'shr.actor'), 
    //      an array of all of that namespace's associated codesystems
    // 4. mapURLtoCodesystem        - lookup table mapping every FHIR IG url to the codesystem it uniquely identifies
    var valuesets                 = data.children[valuesetIndex].children,
        mapURLtoValueset          = {},
        mapNamespaceToValuesets   = {},
        codesystems               = data.children[codesystemIndex].children,
        mapNamespaceToCodesystems = {},
        mapURLtoCodesystem        = {};
  
    // Make sure that every namespace has a valueset and a codesystem page
    _.forEach(data.children[namespacesIndex].children, function (ns) { 
        mapNamespaceToValuesets[ns.label]   = [];
        mapNamespaceToCodesystems[ns.label] = [];
    })
  
    // For all valuesets, add to map
    _.forEach(valuesets, function(vs) {
        var ns  = vs.namespace,
            url = vs.url; 
        vs.shrLink = '/shr/' + ns.split('.')[1] + '/vs/#' + vs.label
        mapURLtoValueset[url] = vs;
        mapNamespaceToValuesets[ns].push(vs)
    });
    
    // For all codesystems
    _.forEach(codesystems, function(cs) {
        var ns  = cs.namespace,
            url = cs.url; 
        cs.shrLink = '/shr/' + ns.split('.')[1] + '/cs/#' + cs.label
        mapURLtoCodesystem[url] = cs;
        mapNamespaceToCodesystems[ns].push(cs)
    });
    // Store mappings in data object
    data.children[valuesetIndex].index_by_url         = mapURLtoValueset;
    data.children[valuesetIndex].index_by_namespace   = mapNamespaceToValuesets;
    data.children[codesystemIndex].index_by_url       = mapURLtoCodesystem;
    data.children[codesystemIndex].index_by_namespace = mapNamespaceToCodesystems;
  
    //
    // Making Valueset and Namespace pages
    // 
    //   Create Assemble pages needed for generating namespace, valueset_by_namespace, and 
    // valueset pages.
    
    // Namespace page construction
    //
    //if debugging:
    //var namespace_pages = _.map(data.children[namespacesIndex].children.filter(c => c/*.label == "shr.finding" || c.label == "shr.core" */),function(item) {

    var ns_template     = grunt.file.read(`./${site.pages}/namespace.hbs`);  
    var namespace_pages = _.map(data.children[namespacesIndex].children,function(item) {
        return {
            filename:item.label.split('.')[1] + '/index',  // labels are shr.namespace; put each index.html in folder with name of namespace
            data: {
                namespace: item, 
                elemsToNamespace: mapElementstoNamespace, 
                vsetsLookup: mapURLtoValueset
            },
            content:ns_template
        }
    });
    // Valueset page construction 
    //
    var vs_template       = grunt.file.read(`./${site.pages}/valueset.hbs`);  
    var vs_by_ns_template = grunt.file.read(`./${site.pages}/valueset_by_namespace.hbs`);  
    var vs_index_template = grunt.file.read(`./${site.pages}/index_valueset.hbs`);  
    var vs_redir_template = grunt.file.read(`./${site.pages}/redirect.hbs`);  
    var valueset_ns_pages = _.map(mapNamespaceToValuesets, function(valuesets, ns) {
        return {
            filename:ns.split('.')[1] + '/vs/index',  // labels are shr.namespace; put each index.html in folder with name of namespace
            data: { 
                namespace: ns, 
                vsets: valuesets, 
                csysLookup: mapURLtoCodesystem
            },
            content:vs_by_ns_template 
        }
    });
    var valueset_index = [{
        filename:'index',  // labels are shr.namespace; put each index.html in folder with name of namespace
        data: {vsetsByNamespace: mapNamespaceToValuesets},
        content:vs_index_template
    }];
    var valueset_redirect_pages = [];
    for (const ns in mapNamespaceToValuesets) {
        let VSs = mapNamespaceToValuesets[ns];
        for (const vs of VSs) {
            let urlParts = vs.url.split('/')
            urlParts[urlParts.length - 1] = '#' + urlParts[urlParts.length - 1]
            let redirURL = urlParts.join('/')
    
            valueset_redirect_pages.push({
                filename: ns.split('.')[1] + '/vs/' + vs.label,
                data: {
                    redirPath: redirURL
                },
                content:vs_redir_template
            })
        }
    }

    // Codesystem page construction
    //
    var cs_template       = grunt.file.read(`./${site.pages}/codesystem.hbs`);  
    var cs_by_ns_template = grunt.file.read(`./${site.pages}/codesystem_by_namespace.hbs`);  
    var cs_index_template = grunt.file.read(`./${site.pages}/index_codesystem.hbs`);      
    var cs_redir_template = grunt.file.read(`./${site.pages}/redirect.hbs`);      
    var codesystem_ns_pages = _.map(mapNamespaceToCodesystems, function(codesystems, ns) {
        return {
            filename:ns.split('.')[1] + '/cs/index',  // labels are shr.namespace; put each index.html in folder with name of namespace
            data: { 
                namespace: ns, 
                csys: codesystems
            },
            content:cs_by_ns_template 
        }
    });
    var codesystem_index = [{
        filename:'index',
        data: {csysByNamespace: mapNamespaceToCodesystems},
        content:cs_index_template
    }]
    var codesystem_redirect_pages = [];
    for (const ns in mapNamespaceToCodesystems) {
        let CSs = mapNamespaceToCodesystems[ns];
        for (const cs of CSs) {
            let urlParts = cs.url.split('/')
            urlParts[urlParts.length - 1] = '#' + urlParts[urlParts.length - 1]
            let redirURL = urlParts.join('/')
    
            codesystem_redirect_pages.push({
                filename: ns.split('.')[1] + '/cs/' + cs.label,
                data: {
                    redirPath: redirURL
                },
                content:cs_redir_template
            })
        }
    }

    // For writing to disk any of the output files
    // grunt.file.write('./assets/availDataFiles/modified-hier.json', JSON.stringify(data.children[namespacesIndex].children[5]))
  
    // Project Configuration
    grunt.initConfig({
        // Project metadata
        pkg:    grunt.file.readJSON('package.json'),
        site:   grunt.file.readYAML('_config.yml'),
    
        // Before generation, remove files from previous build
        clean: {
            example: ['<%= site.dest %>']
        },
        copy: {
            js: {
                files: [{
                    expand:true, 
                    flatten: false, 
                    cwd: '<%= site.assets %>', 
                    src: ['js/**'], 
                    dest:'<%= site.dest %>/<%= site.assets %>'
                }]
            },
            img: {
                files: [{
                    expand:true, 
                    flatten: false, 
                    cwd: '<%= site.assets %>', 
                    src: ['img/**'], 
                    dest:'<%= site.dest %>/<%= site.assets %>'
                }]
            },
            css: {
                files: [{
                    expand:true, 
                    flatten: false, 
                    cwd: '<%= site.assets %>', 
                    src: ['css/*.css'], 
                    dest:'<%= site.dest %>/<%= site.assets %>'
                }]
            },
            fonts: {
                files: [{
                    expand:true, 
                    flatten: false, 
                    cwd: '<%= site.assets %>', 
                    src: ['fonts/*'], 
                    dest:'<%= site.dest %>/<%= site.assets %>'
                }] 
            },
            data: { 
                expand:true, 
                flatten: true, 
                src: ['<%= site.assets %>/<%= site.data %>/<%= site.dataFile %>'], 
                dest:'<%= site.dest %>/<%= site.assets %>/<%= site.data %>'
            },
            shrOutData: {
                files: [{
                    expand: true,
                    flatten: false,
                    cwd: '<%= site.assets %>/<%= site.data %>',
                    src: ['<%= site.dataFile %>'],
                    dest: '<%= site.shrOut %>'
                }]
            },
            shrOutSearch: {
                files: [{
                    expand: true,
                    flatten: false,
                    cwd: '<%= site.dest %>/<%= site.assets %>/js',
                    src: ['<%= site.searchFile %>'],
                    dest: '<%= site.shrOut %>'
                }]
            },
            shrOutSHR: {
                files: [{
                    expand: true,
                    flatten: false,
                    cwd: '<%= site.dest %>/<%= site.dirNS %>',
                    src: ['*', '**'],
                    dest: '<%= site.shrOut %>/<%= site.dirNS %>'
                }]
            }
        },
    
        /* want to bundle up the handlebars stuff to load into the browser to render hierarchies dynamically */
        browserify: {
            vendor: {
                src: ['search.js'],
                dest: '<%= site.dest %>/<%= site.assets %>/js/search.js',
                options: {
                    browserifyOptions: {
                        require: ['handlebars', 'fuse.js'],
                        paths: ['./node_modules']
                    }
                }
            }
        },
        assemble: {
            options: {
                pkg: '<%= pkg %>',
                site: '<%= site %>',
                assets: '<%= site.assets %>',
                // Templates
                partials: '<%= site.includes %>',
                layoutdir: '<%= site.layouts %>',
                layout: '<%= site.layoutdefault %>',
                // Extensions
                helpers: '<%= site.helpers %>',
                plugins: '<%= site.plugins %>'
            },
            valuesetIndex: { 
                options: { 
                    layout: '<%= site.layoutdefault %>',
                    pages:valueset_index
                },
                files: {
                    '<%= site.dest %>/<%= site.dirNS %>/vs/': ['!*']
                }
            },
            valuesetByNamespace: {
                options : {
                    layout: '<%= site.layoutdefault %>',
                    pages:valueset_ns_pages
                },
                files: {
                    '<%= site.dest %>/<%= site.dirNS %>/': ['!*']
                }
            }, 
            valuesetRedirects: {
                options : {
                    layout: '<%= site.layoutstatic %>',
                    pages:valueset_redirect_pages
                },
                files: {
                    '<%= site.dest %>/<%= site.dirNS %>/': ['!*']
                }
            }, 
            codesystemIndex: { 
                options: { 
                    layout: '<%= site.layoutdefault %>',
                    pages:codesystem_index
                },
                files: {
                    '<%= site.dest %>/<%= site.dirNS %>/cs/': ['!*']
                }
            },
            codesystemByNamespace: {
                options : {
                    layout: '<%= site.layoutdefault %>',
                    pages:codesystem_ns_pages
                },
                files: {
                    '<%= site.dest %>/<%= site.dirNS %>/': ['!*']
                }
            },
            codesystemRedirects: {
                options : {
                    layout: '<%= site.layoutstatic %>',
                    pages:codesystem_redirect_pages
                },
                files: {
                    '<%= site.dest %>/<%= site.dirNS %>/': ['!*']
                }
            }, 
            staticNamespacePages: {
                options : {
                    layout: '<%= site.layoutdefault %>',
                    pages:namespace_pages
                },
                files: {
                    '<%= site.dest %>/<%= site.dirNS %>/': ['!*']
                }
            },
            staticIndex: {
                options : {
                    data: {namespaces: data.children[namespacesIndex].children}
                },
                flatten: true,
                expand: true,
                cwd: '<%= site.pages %>',
                src: 'index.hbs',
                dest: '<%= site.dest %>'
            }, 
            staticGraphic: {
                options : {
                    data: {namespaces: data.children[namespacesIndex].children}
                },
                flatten: true,
                expand: true,
                cwd: '<%= site.pages %>',
                src: 'graphic.hbs',
                dest: '<%= site.dest %>/<%= site.dirNS %>/'
            }, 
            staticIndexIncludingElements: {
                options : {
                    data: {namespaces: data.children[namespacesIndex].children}
                },
                flatten: true,
                expand: true,
                cwd: '<%= site.pages %>',
                src: 'index_all_elements.hbs',
                dest: '<%= site.dest %>/<%= site.dirNS %>/'
            },
            staticSHRIndex: {
                options : {
                    data: {namespaces: data.children[namespacesIndex].children}
                },
                flatten: true,
                expand: true,
                cwd: '<%= site.pages %>',
                src: 'index.hbs',
                dest: '<%= site.dest %>/<%= site.dirNS %>/'
            }, 
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: 10000, 
                    captureFile: 'results.txt', // Optionally capture the reporter output to a file 
                    quiet: false,               // Optionally suppress output to standard out (defaults to false) 
                    clearRequireCache: true,    // Optionally clear the require cache before running tests (defaults to false) 
                    noFail: false               // Optionally set to not fail on failed tests (will still fail on other errors) 
                },
                src: ['test.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-assemble');
    grunt.loadNpmTasks('grunt-mocha-test');
  
    grunt.registerTask('default', function() {
        grunt.task.run(['clean', 'browserify']);
        grunt.task.run(['copy:js', 'copy:img', 'copy:css', 'copy:fonts', 'copy:data']);
        grunt.task.run(['assemble']);
        grunt.task.run(['copy:shrOutData', 'copy:shrOutSearch', 'copy:shrOutSHR'])
    });
    grunt.registerTask('test', ['clean', 'browserify', 'copy', 'assemble', 'mochaTest']);
}
