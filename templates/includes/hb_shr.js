(function() {
  var Handlebars = require('Handlebars');
  // var template = Handlebars.template, 
  //     templates = Handlebars.templates = Handlebars.templates || {};
  //     templates['schema_shr.hbs'] = template({
  //       "1":function(container,depth0,helpers,partials,data,blockParams) {
  //         var stack1;
  //         var ret = ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},
  //                                                 blockParams[0][0],
  //                                                 {
  //                                                   "name":"if",
  //                                                   "hash":{},
  //                                                   "fn":container.program(2, data, 0, blockParams),
  //                                                   "inverse":container.noop,
  //                                                   "data":data,
  //                                                   "blockParams":blockParams})) 
  //                               != null ? stack1 : "");
  //         return(ret);
  //       },
  //       "2":function(container,depth0,helpers,partials,data) {
  //         var stack1;
  //         console.log(depth0)  ;
  //         var ret = ((stack1 = container.invokePartial(partials.schema_namespace_list,
  //                                                      depth0,
  //                                                      {"name":"schema_namespace_list",
  //                                                      "data":data,
  //                                                      "indent":"    ",
  //                                                      "helpers":helpers,
  //                                                      "partials":partials,
  //                                                      "decorators":container.decorators})) 
  //                     != null ? stack1 : "");
  //         return(ret);
  //       },
  //       "compiler":[7,">= 4.0.0"],
  //       "main":function(container,depth0,helpers,partials,data,blockParams) {
  //         var stack1;
  //         var ret =  "<h2>Parsing Specification Hierarchy for: "
  //                + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.hierarchy : depth0)) != null ? stack1.label : stack1), depth0))
  //                + "</h2>\n\n"
  //                + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.hierarchy : depth0)) != null ? stack1.children : stack1),{"name":"each","hash":{},"fn":container.program(1, data, 1, blockParams),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "");
  //         return(ret);
  //       },
  //       "usePartial":true,
  //       "useData":true,
  //       "useBlockParams":true
  //      });

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
        console.log(template.responseText)

        var tempScript = Handlebars.compile(template.responseText);
        console.log(Handlebars.partials);
        var html = tempScript({hierarchy: hierarchy});
        console.log(html);
      });
    });
  // function addPartials() {
  //   $.load('/assets/templates', function (data) {
  //     console.log(data)
  //   })
  // }
  /* Add an index to namespaces and idref member to each identifier to make it easy to show the description */
  function addHierarchyIndex(h) {
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

  function registerPartials(templates, hierarchy) { 
    var dfd = $.Deferred(); 
    
    dfd.done(function () { 
      $.each($('#partials script').get(), function(index, value) {
        var partial = $('#partials script').get(index)
        if (partial != 'schema_shr') { 
          var id = $(partial).attr('id')
          $.get($(partial).attr('src'), function(data, status) {
            if (status == "success") { 
              Handlebars.registerPartial(id, data);
            } else { 
              console.log('Error loading partial with ID: ' + id + "\nError: " + err);
            }
          })
        }
      });
    }).done(function () {
      console.log('finished registering partials')
    }) 
    dfd.resolve();
  }

  function registerHelpers () { 
    
    Handlebars.registerHelper('getNamespaceFilename', function(name,context) {
      return new Handlebars.SafeString(name.split('.')[1]+'.html');
    });

    Handlebars.registerHelper('eq', function(a, b, opts) {
        if (a == b) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    });
  }
})();
