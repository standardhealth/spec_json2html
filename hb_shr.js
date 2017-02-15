(function() {
  var Handlebars = require('handlebars');
  var page = require('page');

  var App = window.App = {
    hierarchy: {},
    namespaces: {},
    valueset: {}
      // No variables to be stored about the application now. 
  };

  App.loadDataElement = (namespace) => {
    console.log('actually was called');
    $("#dynamic_content").empty();
  }

  App.mapToElement = (namespace, label) => { 
    console.log('Mapping from current page to namespace: ' + namespace + ' and element: ' + label);
  }

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }
  $(document).ready(function() {
    registerPartials();
    registerHelpers();
  });

  // TODO: Use page.js in our single page application to 
  //       enable backspacing on dynamically generated content.
  //
  // page('/', function (a) {
  //   console.log("pages works ");
  // })
  // page();
  
    $("#load_hierarchy").click(function() {
      $.getJSON("assets/data/shr_v4.json",function(data) {
        App.hierarchy = data;
        App.namespaces = _.indexBy(App.hierarchy.children,"label");

        App.de = _.map(App.hierarchy.children,function(namespace) {
          namespace.index = _.indexBy(namespace.children,"label");
        });
        App.hierarchy.index = namespaces;
        // addHierarchyIndex(hierarchy.children);
        console.log('fin addhier')

        /* Call Handlebars.compile on the templates
         and then call the template with hierarchy as the context */
        var template = $.ajax({
            url: $('#schema_shr').attr('src'),
            type: "GET", 
            async: false
          });

        var tempScript = Handlebars.compile(template.responseText);
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
            item.idref = hierarchy.index[item.namespace].index[item.label];
          }
        }
        addHierarchyIndex(item);
      } else {
        if (item && _.isArray(item)) {
          _.each(item,function(child) {
            addHierarchyIndex(child);
          });
        }
        // not an object, not an array
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
        if (data.status == 200) { 
          Handlebars.registerPartial(id, data.responseText);
        } else { 
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

    Handlebars.registerHelper('getNamespaceName', function(nStatic, nDynamic, context) {
      var name = nStatic !== undefined ? nStatic : nDynamic;
      return new Handlebars.SafeString(name.split('.')[1]);
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
