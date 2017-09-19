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
    if (field.identifier) {
      //console.log("identifier: " + field.identifier.namespace);
      if (field.identifier.namespace === "primitive") return "";
      var element = namespaces[field.identifier.namespace].index[field.identifier.label];
      if (element) {
        return element.description;
      } else {
        return "no description";
      }
    } else {
      if (field.type == 'ChoiceValue') { 
        return "";
      } else { 
        // msgLog('Corner case for getDescription', field);
        return "Description TBD";
      }
    }
  }
  
  var combineArraysIntoIdentifierList = function(namespaceList, nameList) {
    var namespace, name;
    var result = [];
    for (var i = 0, j = namespaceList.length; i < j; i++) {
      namespace = namespaceList[i];
      name = nameList[i];
      result.push({ namespace: namespace, label: name});
    }
    return result;
  }
  
  // create the initial record for the specified field within the element concretedataelement
  // not that in addition to the fields initialized below, the field record can have a values attribute which is a list of subordinate records
  var newRecord = function(fieldName, fieldNamespace, field, foundin, isValue, isChoice, isSubElement, concretedataelement) {
    if (fieldName && fieldName.constructor === Array) {
      //console.log(field);
      return {  foundin: [ foundin ], 
              concretedataelement: concretedataelement,
              isValue: isValue, 
              isChoice: isChoice,
              isSubElement: isSubElement,
              namespace: fieldNamespace[fieldNamespace.length - 1],
              label: fieldName[fieldName.length - 1], 
              identifierList: combineArraysIntoIdentifierList(fieldNamespace.slice(0, -1), fieldName.slice(0, -1)), 
              isTBD: field.type === "TBD",
              constraints: field.constraints.slice(), 
              cardinality : [  { min: field.min, max: field.max } ], 
              description : getDescription(field) };    
    } else {
      return {  foundin: [ foundin ], 
              concretedataelement: concretedataelement,
              isValue: isValue, 
              isChoice: isChoice,
              isSubElement: isSubElement,
              namespace: fieldNamespace,
              label: fieldName, 
              isTBD: field.type === "TBD",
              constraints: field.constraints.slice(), 
              cardinality : [  { min: field.min, max: field.max } ], 
              description : getDescription(field) 
          };
    }
  }

  // create a record of the value for the concrete data element based on the specified dataelement within the specified namespace
  var createValueRecord = function(concreteDataelement, namespace, dataelement) {
    var subrecord;
    if (dataelement.value) {
      if (concreteDataelement.valueRecord) {
        concreteDataelement.valueRecord.foundin.unshift(dataelement.label);
        if (dataelement.value.constraints) { concreteDataelement.valueRecord.constraints.unshift(dataelement.value.constraints); } else { concreteDataelement.valueRecord.constraints.unshift([]); }
        concreteDataelement.valueRecord.cardinality.unshift({min : dataelement.value.min, max: dataelement.value.max});
      } else {
      if (dataelement.value.type == "ChoiceValue") {
        concreteDataelement.valueRecord = newRecord("Choice", "", dataelement.value, dataelement.label, true, false, false, concreteDataelement.label);
        concreteDataelement.valueRecord.values = [];
        _.forEach(dataelement.value.value, function(item) {
          //console.log(item);
          if (item.identifier) {
            subrecord = newRecord(item.identifier.label, item.identifier.namespace, item, dataelement.label, false, true, false, concreteDataelement.label);
          } else {
            subrecord = newRecord(item.text, undefined, item, dataelement.label, false, true, false, concreteDataelement.label);
          }
          concreteDataelement.valueRecord.values.push(subrecord);
        });
        //console.log(concreteDataelement.valueRecord);
      } else if (dataelement.value.type == "TBD") {
        concreteDataelement.valueRecord = newRecord(dataelement.value.text, undefined, dataelement.value, dataelement.label, true, false, false, concreteDataelement.label);
      } else {
        concreteDataelement.valueRecord = newRecord(dataelement.value.identifier.label, dataelement.value.identifier.namespace, dataelement.value, dataelement.label, true, false, false, concreteDataelement.label);
      }
      }
    }
  }
  
  // add field records to the field list for the concrete data element based on the element data element (which could be the concrete one or an ancestor)
  var createFieldList = function(concreteDataelement, namespace, dataelement) {
    var fieldName, fieldNamespace;
    //if (concreteDataelement.fieldList) { // if the data element we're building field list for has a field list already, add to it
      var record, subrecord;
      var index = 0;
      _.forEach(dataelement.children, function(field) {
        index = index + 1;
        if (field.type != "Incomplete") {
          var fieldValues = [];
          if (field.type === "ChoiceValue") {
              fieldName = "Choice";
              fieldNamespace = "";
              record = undefined;
          } else {
              if (field.identifier) { fieldName = field.identifier.label ; fieldNamespace = field.identifier.namespace } else { fieldName = field.text; fieldNamespace = ""; }
              if (concreteDataelement.fieldMap) {
                record = concreteDataelement.fieldMap[fieldName];  
              } else {
                record = undefined;
              }
          }
          if (record) { // found existing record for field so update it
            record.foundin.unshift(dataelement.label);
            if (field.constraints) { record.constraints.unshift(field.constraints); } else { record.constraints.unshift([]); }
            record.cardinality.unshift({min: field.min, max:field.max});
          } else { // record not found so create it on concrete data element
            record = newRecord(fieldName, fieldNamespace, field, dataelement.label, false, false, false, concreteDataelement.label);
            if (concreteDataelement.fieldList === undefined) concreteDataelement.fieldList = [];
            concreteDataelement.fieldList.push(record);
          }
          
          if (field.type === "ChoiceValue") {
            _.forEach(field.value, function(item) {
              if (item.identifier) {
                subrecord = newRecord(item.identifier.label, item.identifier.namespace, item, dataelement.label, false, true, false, concreteDataelement.label);
              } else {
                subrecord = newRecord(item.text, undefined, item, dataelement.label, false, true, false, concreteDataelement.label);
              }
              fieldValues.push(subrecord);
            });
          }
          if (field.constraints && field.constraints.length > 0) {
            _.forEach(field.constraints, function (c) {
              if (concreteDataelement.fieldMap && c.type == "TypeConstraint") {
                if (concreteDataelement.fieldMap[c.isA.label]) { // if we have a field for new type then make it subordinate to this one
                  var isafieldindex = _.findIndex(concreteDataelement.fieldList, {label: c.isA.label});
                  var isafield = concreteDataelement.fieldList[isafieldindex];
                  concreteDataelement.fieldList.splice(isafieldindex, 1); // remove is a field from concrete data element's field list
                  //console.log(isafield);
                  isafield.isSubElement = true;
                  fieldValues.push(isafield); // put it as a subfield to current field instead
                }
              }
              if (c.path && c.path.length > 0) {
                if (c.path === 'shr.core.Coding' || c.path ==='code' || c.path === 'shr.core.CodeableConcept') {               
                } else {
                //console.log(concreteDataelement.label + ". processing: " + dataelement.label + " field " + field.identifier.label + " path = " + c.path);
                
                var pieces, pname, pnamespace, subfield, subrecord;
                var elementPieces = c.path.split(':');
                // need a list of name and namespace and then use last subfield as field in newRecord
                var nameList = [], namespaceList = [];
                _.forEach(elementPieces, function(elementPiece) {
                  pieces = elementPiece.split('.');
                  pname = pieces.pop();
                  pnamespace = pieces.join('.');
                  nameList.push(pname);
                  namespaceList.push(pnamespace);
                  subfield = namespaces[pnamespace].index[pname];
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
                  subrecord = newRecord(pname, pnamespace, subfield, dataelement.label, false, false, true, record.concretedataelement);
                } else {
                  subrecord = newRecord(nameList, namespaceList, subfield, dataelement.label, false, false, true, record.concretedataelement);
                }
                if (c.type === 'CardConstraint') {
                  subrecord.effectivecardinality = {};
                  subrecord.effectivecardinality.min = c.min;
                  subrecord.effectivecardinality.max = c.max;
                } else {
                  // do we need to remove constraint from current field since it is on subfield now
                  // we are looping over those constraints though. ideally just remove from record instead
                  // TODO
                }
                //console.log(subrecord);
                fieldValues.push(subrecord);
                }
              }
            });
          }
          if (fieldValues.length > 0) {
            record.values = fieldValues;
          }
        } else {
          console.log("ERROR 5: Incomplete type for " + dataelement.label + ":");
          console.log(field);
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
          //console.log(basedOn.namespace + " / " + basedOn.label);
          createFieldList(concreteDataelement, basedOn.namespace, namespaces[basedOn.namespace].index[basedOn.label]);
        } else if (basedOn.type === "TBD") {
          console.log("ERROR 6: The basedOn Element has yet to be defined, so we cannot expand it");
          console.log(dataelement.basedOn);
        } else {
          console.log("ERROR 3: Invalid based on for element " + dataelement.label + " while building field list for " + concreteDataelement.label + ". Based on:");
          console.log(dataelement.basedOn);
        }
      });
    }
  }

  var createFieldListPerDataElement = function(namespace) {
    //console.log("**** namespace " + namespace.label);
    // for each dataelement
    _.forEach(namespace.children, function(dataelement) {
      //console.log("****  dataelement " + dataelement.label);
      createFieldList(dataelement, namespace, dataelement);
    });
  }
  // end GQ created

  var data = grunt.file.readJSON(`./${site.assets}/${site.data}/${site.dataFile}`);
  var namespacesIndex = _.findIndex(data.children, {type: "Namespaces"})
  var valuesetIndex   = _.findIndex(data.children, {type: "ValueSets"})
  var codesystemIndex = _.findIndex(data.children, {type: "CodeSystems"})
  
  // for each namespace:
  var namespaces = _.keyBy(data.children[namespacesIndex].children,"label");
  _.map(data.children[namespacesIndex].children,function(namespace) {
    namespace.index = _.keyBy(namespace.children,"label");
  });
  
  // GQ created
  // for each namespace:
  _.forEach(data.children[namespacesIndex].children, function(namespace) {
    createFieldListPerDataElement(namespace); // for each element within the specified namespace, create its field list
  });
  
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

      //console.log("!2!2!2 " + dataelement.label);
      _.forEach(dataelement.fieldList, function(record) {
        if (record) {
          if (record.cardinality && record.cardinality.length > 0) {
            index = record.cardinality.length - 1;
            while (index >= 0 && record.cardinality[index].min === undefined && record.cardinality[index].max === undefined) {
              index--;
            }
            if (index < 0) {
              console.log("ERROR 1: No cardinalities found. namespace: " + namespace.label + "/element " + dataelement.label + "/" + record.label);
              console.log(record);
            } else {
              record.effectivecardinality = {};
              record.effectivecardinality.min = record.cardinality[index].min;
              record.effectivecardinality.max = record.cardinality[index].max;
            }
          } else {
            console.log("ERROR 2: Field has no cardinalities. namespace " + namespace.label + "/element " + dataelement.label + "/" + record.label);
            console.log(record);
          }
          if (record.values) {
            //console.log(record.values);
            _.forEach(record.values, function (subrecord) {
             //console.log(subrecord);
             subrecord.effectivecardinality = {};
             subrecord.effectivecardinality.min = subrecord.cardinality[0].min;
             subrecord.effectivecardinality.max = subrecord.cardinality[0].max;
            });
          }
        } else {
          console.log("ERROR 4: Undefined record in field list: namespace " + namespace.label + "/element " + dataelement.label + "/record=" + record);
        }
      });
      if (dataelement.valueRecord) {
         if (dataelement.valueRecord.values) {
          //console.log(record.values);
          _.forEach(dataelement.valueRecord.values, function (subrecord) {
           //console.log(subrecord);
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
  //   Create the assemble pages needed for generating namespace pages, valueset_by_namespace pages, and 
  // valueset pages.
  var ns_template       = grunt.file.read(`./${site.pages}/namespace.hbs`);  
  
  var vs_template       = grunt.file.read(`./${site.pages}/valueset.hbs`);  
  var vs_by_ns_template = grunt.file.read(`./${site.pages}/valueset_by_namespace.hbs`);  
  var vs_index_template = grunt.file.read(`./${site.pages}/index_valueset.hbs`);  
  
  var cs_template       = grunt.file.read(`./${site.pages}/codesystem.hbs`);  
  var cs_by_ns_template = grunt.file.read(`./${site.pages}/codesystem_by_namespace.hbs`);  
  var cs_index_template = grunt.file.read(`./${site.pages}/index_codesystem.hbs`);  
  // Namespace page construction
  //
  var namespace_pages = _.map(data.children[namespacesIndex].children,function(item) {
    return {
      filename:item.label.split('.')[1] + '/index',  // labels are shr.namespace; put each index.html in folder with name of namespace
      data:{namespace: item, elemsToNamespace: mapElementstoNamespace, vsetsLookup: mapURLtoValueset},
      content:ns_template
    }
  });
  // Valueset page construction 
  //
  // var valueset_pages = _.map(valuesets, function(vs) {
  //   return {
  //     filename:vs.namespace.split('.')[1] + '/vs/' + vs.label + '/index',  // labels are shr.namespace; put each index.html in folder with name of namespace
  //     data:vs,
  //     content:vs_template
  //   }
  // });
  var valueset_ns_pages = _.map(mapNamespaceToValuesets, function(valuesets, ns) {
    return {
      filename:ns.split('.')[1] + '/vs/index',  // labels are shr.namespace; put each index.html in folder with name of namespace
      data:{ namespace: ns, vsets: valuesets, csysLookup: mapURLtoCodesystem},
      content:vs_by_ns_template 
    }
  });
  var valueset_index = [{
      filename:'index',  // labels are shr.namespace; put each index.html in folder with name of namespace
      data: {vsetsByNamespace: mapNamespaceToValuesets},
      content:vs_index_template
    }];
  // Codesystem page construction
  //
  var codesystem_ns_pages = _.map(mapNamespaceToCodesystems, function(codesystems, ns) {
    return {
      filename:ns.split('.')[1] + '/cs/index',  // labels are shr.namespace; put each index.html in folder with name of namespace
      data:{ namespace: ns, csys: codesystems},
      content:cs_by_ns_template 
    }
  });
  var codesystem_index = [{
    filename:'index',
    data: {csysByNamespace: mapNamespaceToCodesystems},
    content:cs_index_template
  }]

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
      // partials: {
      //   expand:true, 
      //   flatten: true, 
      //   src: ['<%= site.includes %>'], 
      //   dest:'<%= site.dest %>/<%= site.assets %>/partials'
      // },
      data: { 
        expand:true, 
        flatten: true, 
        src: ['<%= site.assets %>/<%= site.data %>/<%= site.dataFile %>'], 
        dest:'<%= site.dest %>/<%= site.assets %>/<%= site.data %>'
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
        // data: data,

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
      // valuesetByVSPages: {
      //   options : {
      //     layout: '<%= site.layoutdefault %>',
      //     pages:valueset_pages
      //   },
      //   files: {
      //     '<%= site.dest %>/<%= site.dirNS %>/': ['!*']
      //   }
      // }, 
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
      // SHR files
      // shrNamespacePages: { 
      //   options : {
      //     layout: '<%= site.layoutstatic %>', 
      //     pages: namespace_pages
      //   },
      //   files: {
      //     '<%= site.dest %>/<%= site.dirSHRFiles %>/<%= site.dirNS %>/': ['!*']
      //   }
      // },
      // shrValuesetIndex: { 
      //   options: { 
      //     layout: '<%= site.layoutstatic %>',  
      //     pages:valueset_index
      //   },
      //   files: {
      //     '<%= site.dest %>/<%= site.dirSHRFiles %>/<%= site.dirNS %>/vs/': ['!*']
      //   }
      // },
      // shrValuesetByNamespace: {
      //   options : {
      //     layout: '<%= site.layoutstatic %>',  
      //     pages:valueset_ns_pages
      //   },
      //   files: {
      //     '<%= site.dest %>/<%= site.dirSHRFiles %>/<%= site.dirNS %>/': ['!*']
      //   }
      // }, 
      // shrCodesystemIndex: { 
      //   options: { 
      //     layout: '<%= site.layoutstatic %>',  
      //     pages:codesystem_index
      //   },
      //   files: {
      //     '<%= site.dest %>/<%= site.dirSHRFiles %>/<%= site.dirNS %>/cs/': ['!*']
      //   }
      // },
      // shrCodesystemByNamespace: {
      //   options : {
      //     layout: '<%= site.layoutstatic %>',  
      //     pages:codesystem_ns_pages
      //   },
      //   files: {
      //     '<%= site.dest %>/<%= site.dirSHRFiles %>/<%= site.dirNS %>/': ['!*']
      //   }
      // }, 
      // shrIndexIncludingElements: {
      //   options: {
      //     layout: '<%= site.layoutstatic %>',  
      //     data: {namespaces: data.children[namespacesIndex].children}
      //   },
      //   flatten: true,
      //   expand: true,
      //   cwd: '<%= site.pages %>',
      //   src: 'index_all_elements.hbs',
      //   dest: '<%= site.dest %>/<%= site.dirSHRFiles %>/<%= site.dirNS %>/'  
      // },
      // shrIndex: {
      //   options: {
      //     layout: '<%= site.layoutstatic %>',  
      //     data: {namespaces: data.children[namespacesIndex].children}
      //   },
      //   flatten: true,
      //   expand: true,
      //   cwd: '<%= site.pages %>',
      //   src: 'index.hbs',
      //   dest: '<%= site.dest %>/<%= site.dirSHRFiles %>'  
      // },
      // shrGraphic: {
      //   options: {
      //     layout: '<%= site.layoutstatic %>',  
      //     data: {namespaces: data.children[namespacesIndex].children}
      //   },
      //   flatten: true,
      //   expand: true,
      //   cwd: '<%= site.pages %>',
      //   src: 'graphic.hbs',
      //   dest: '<%= site.dest %>/<%= site.dirSHRFiles %>/<%= site.dirNS %>/'  
      // }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          timeout: 10000, 
          captureFile: 'results.txt', // Optionally capture the reporter output to a file 
          quiet: false,               // Optionally suppress output to standard out (defaults to false) 
          clearRequireCache: true,    // Optionally clear the require cache before running tests (defaults to false) 
          noFail: false              // Optionally set to not fail on failed tests (will still fail on other errors) 
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

  grunt.registerTask('default',['clean', 'browserify', 'copy', 'assemble']);
  // grunt.registerTask('static',['clean', 'browserify', 'copy',  'assemble:staticIndex', 'assemble:staticGraphic', 'assemble:staticSHRIndex', 'assemble:staticIndexIncludingElements', 'assemble:valuesetIndex',  'assemble:codesystemIndex', 'assemble:staticNamespacePages', 'assemble:valuesetByNamespace', 'assemble:codesystemByNamespace']);
  // grunt.registerTask('shr',['clean', 'browserify', 'copy', 'assemble:shrIndex', 'assemble:shrGraphic', 'assemble:shrIndexIncludingElements', 'assemble:shrNamespacePages','assemble:shrValuesetByNamespace','assemble:shrValuesetIndex','assemble:shrCodesystemIndex','assemble:shrCodesystemByNamespace']);
  grunt.registerTask('test', ['clean', 'browserify', 'copy', 'assemble', 'mochaTest']);
}
