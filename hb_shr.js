(function () { 
    const Fuse = require('fuse.js');
    const _ = require('lodash');
    // Define capitalize incase it's not already
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }
    //
    //
    // Format a list to be searched by Fuse.js
    //
    function formatForSearch (hier, list) { 
        _.forEach(hier.children, function (shrArea) { 
            // shrArea can contain namespaces, valusets, or codesystems
            let sectionType = shrArea.type,
                ns, 
                link; 
            _.forEach(shrArea.children, function (subSection) { 
                // Subsection can be an individual namespace, valueset, or codesystem
                switch (sectionType) { 
                    case "ValueSets": 
                        // We want to search on valueset names, nothing else
                        link = `/shr/${subSection.namespace.split('.')[1].capitalize()}/vs/#${subSection.label}`;
                        addObjToSearch(subSection.label,
                                       subSection.description, 
                                       sectionType,
                                       subSection.namespace.split('.')[1].capitalize(), 
                                       link,
                                       list);
                        break;
                    case "CodeSystems": 
                        // We want to search on individual codes
                        ns = subSection.namespace;
                        _.forEach(subSection.children, function (curElement) { 
                            link = `/shr/${ns.split('.')[1].capitalize()}/cs/#${curElement.code}`;
                            // Current Elements can be an individual codes contained in a codesystem
                            // N.B. the code servs the role of label, and display servces the role of description.
                            addObjToSearch(curElement.code, 
                                           curElement.display,
                                           sectionType, 
                                           ns.split('.')[1].capitalize(),  
                                           link,
                                           list);
                        }); 
                        break;
                    case "Namespaces":
                        // We want to search on namespace names
                        ns = subSection.label;
                        link = `/shr/${ns.split('.')[1].capitalize()}/`;
                        addObjToSearch(subSection.label, 
                                       subSection.description, 
                                       sectionType, 
                                       ns.split('.')[1].capitalize(), 
                                       link,
                                       list);
                        _.forEach(subSection.children, function (curElement) { 
                            link = `/shr/${ns.split('.')[1].capitalize()}/#${curElement.label}`;
                            // We want to be able to search each individaul data element
                            addObjToSearch(curElement.label,
                                           curElement.description, 
                                           curElement.type,
                                           ns.split('.')[1].capitalize(), 
                                           link,
                                           list);
                        }); 
                        break;
                    default: 
                        console.log('New type: ' + sectionType);
                };
            });
        });
    };
    //
    //
    // Short function for pushing a new object onto list of searchable objects for Fuse.
    //
    function addObjToSearch (label, description, ty, ns, link, list) { 
        let curObj            = {};
        curObj['label']       = label;
        curObj['description'] = description;
        curObj['type']        = ty;
        curObj['ns']          = ns;
        // Different html formats
        curObj['html']        = `<option href='${link}' value='${label}'>${ty}</option>`;
        // curObj['html']        = `<li><a href='${link}' value='${ty}'>${label}</a></li>`;

        list.push(curObj);
    };
    //
    //
    // Returns a function that takes a query and a callback, uses the query 
    // to run a search on fuse, reformats fuses list to fit with typeahead formatting
    // and passes that array onto the typeahead callback
    //
    function fuseQueryOnList (list) { 
        return function (query, cb) {   
            // Options for fuse
            const options = {
                shouldSort: true,
                tokenize: true,
                threshold: 0.2,
                location: 0,
                distance: 100,
                maxPatternLength: 35,
                minMatchCharLength: 3,
                keys: [{
                    name: "label",
                    weight: 1
                }]
            };
            const fuse = new Fuse(list, options); 
            let result;
            result = fuse.search(query);
            if (result.length > 0 ) {
                result.length = (result.length) > 5 ? 5 : result.length;
                cb(_.map(result, function (elem) {
                    return {value: elem.label};
                }));
            } else { 
                return cb(result);
            }
        };
    }

    $.ajax({
      url: '/assets/data/data.json',
      dataType: 'json',
      success: function (data) {
        let json = data;
        let list = [];
        formatForSearch(json, list);

        $('#search .typeahead').typeahead({
          hint: true,
          highlight: true,
          minLength: 2
        },
        {
          name: 'shrValues',
          source: fuseQueryOnList(list)
        });
        // $('#search').on('input', function (e) {
        //     result = fuse.search(e.target.value);
        //     if (result.length > 0 ) {
        //       result.length = (result.length) > 5 ? 5 : result.length;
        //       // TODO: Optimize so we don't iterate over once on map, once on join.
        //       $('#options').html(_.map(result, function (elem) {
        //         return elem.html;
        //       }).join('\n'));
        //     } else { 
        //       $('#options').html('')
        //     }
        // })
      }
    });
})();
