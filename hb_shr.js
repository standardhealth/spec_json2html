(function() {
  var Handlebars = require('handlebars');

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }
  $(document).ready(function() {
    registerPartials();
    registerHelpers();

  });

    $("#load_hierarchy").click(function() {
      $.getJSON("assets/data/hierarchy.json",function(data) {
        window.hierarchy = data;
        window.namespaces = _.indexBy(hierarchy.children,"label");
        window.de = _.map(hierarchy.children,function(namespace) {
          namespace.index = _.indexBy(namespace.children,"label");
        });
        hierarchy.index = namespaces;
        addHierarchyIndex(hierarchy.children);
    console.log('fin addhier')

        /* Call Handlebars.compile on the templates
         and then call the template with hierarchy as the context */
        var template = $.ajax({
            url: $('#schema_shr').attr('src'),
            type: "GET", 
            async: false
          });
        // console.log(template.responseText)

        var tempScript = Handlebars.compile(template.responseText);
        // console.log(Handlebars.partials);
        var html = tempScript({hierarchy: hierarchy});
        $("#dynamic_content").append(html); 
      });
    });


  /* Add an index to namespaces and idref member to each identifier to make it easy to show the description */
  function addHierarchyIndex(h) {
    // For IE functionality 
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position){
          position = position || 0;
          return this.substr(position, searchString.length) === searchString;
      };
    }
    _.each(h,function(item) {
      if (item && _.isObject(item)) {
        if (item.type == "Identifier") {
          if (item.namespace == "primitive") {
            item.description = item.label.capitalize();
          }
          if (item.namespace.startsWith("shr.")) {
         //   console.log("SHR Namespace : " + item.namespace);
            item.idref = hierarchy.index[item.namespace].index[item.label];
          }
          // console.log("Identifier = " + item);
        }
        addHierarchyIndex(item);
      } else {
        if (item && _.isArray(item)) {
          _.each(item,function(child) {
            addHierarchyIndex(child);
          });
        }
        // not an object, not an array
        // console.log(item);
      }
    });
  }
  
  // Register all the partials that have been referenced on the clientside page
  function registerPartials(templates, hierarchy) {     
    $.each($('#partials script').get(), function(index, value) {
      var partial = $('#partials script').get(index)
      if (partial != 'schema_shr') { 
        var id = $(partial).attr('id')
        var data = $.ajax({
          url: $(partial).attr('src'),
          type: "GET", 
          async: false
        })
        // console.log(data)
        if (data.status == 200) { 
          // console.log('registered ' + id);
          Handlebars.registerPartial(id, data.responseText);
        } else { 
          // console.log('registered ' + id);
          console.error('Error loading partial with ID: ' + id + "\nError: " + data.statusText);
        }
      }
    });
    console.log('finished registering partials'); 
  }

  // (Manually) register the heleprs used in generating the Handlebars templates. 
  function registerHelpers () { 
    Handlebars.registerHelper('getNamespaceFilename', function(nStatic, nDynamic, context) {
      // Clientside and Serverside compilation understand scope differently, leading to a disparity 
      // in referencing parent scope (which is where we get our namespace name from) 
      // Solution: offer two namespace definitions, default to static unless undefined.
      var name = nStatic !== undefined ? nStatic : nDynamic;
      return new Handlebars.SafeString(name.split('.')[1]+'.html');
    });
    // Basic conditional checking.
    Handlebars.registerHelper('eq', function(a, b, opts) {
        if (a == b) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    });
    Handlebars.registerHelper("log", function(something) {
      console.log(something);
    });
  }
})();
