(function () { 
    const Fuse = require('fuse.js');
    const _ = require('lodash');
    let file = $.ajax({
      url: '/assets/data/data.json',
      dataType: 'json',
      success: function (data) {
        let json = data;

        String.prototype.capitalize = function() {
          return this.charAt(0).toUpperCase() + this.slice(1);
        }

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
        // Short function for pushing a new object onto the list.
        function addObjToSearch (label, description, ty, ns, link, list) { 
            let curObj            = {};
            curObj['label']       = label;
            curObj['description'] = description;
            curObj['type']        = ty;
            curObj['ns']          = ns;
            curObj['link']        = link;
            list.push(curObj);
        };

        let list = [];
        formatForSearch(json, list);

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
        $('#search').on('input', function (e) {
            result = fuse.search(e.target.value);
            if (result.length > 0 ) {
              result.length = (result.length) > 5 ? 5 : result.length;
              $('#options').html(_.map(result, function (elem) {
                  // return `<option href='${elem.link}' value='${elem.label}'>${elem.type}</option>`;
                  return `<li><a href='${elem.link}' value='${elem.type}'>${elem.label}</a></li>`;
              }).join('\n'));
            } else { 
              $('#options').html('')
            }
        })
      }
    });
})();

// $("#load_hierarchy").click(function() {
//   $.getJSON("assets/data/shr_v4.json",function(data) {
//     App.hierarchy = data;
//     App.namespaces = _.indexBy(App.hierarchy.children,"label");

//     App.de = _.map(App.hierarchy.children,function(namespace) {
//       namespace.index = _.indexBy(namespace.children,"label");
//     });
//     App.hierarchy.index = namespaces;
//     // addHierarchyIndex(hierarchy.children);
//     console.log('fin addhier')

//     /* Call Handlebars.compile on the templates
//      and then call the template with hierarchy as the context */
//     var template = $.ajax({
//         url: $('#schema_shr').attr('src'),
//         type: "GET", 
//         async: false
//       });

//     var tempScript = Handlebars.compile(template.responseText);
//     var html = tempScript({hierarchy: hierarchy});
//     $("#dynamic_content").append(html); 
//   });
// });
