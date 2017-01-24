(function() {
  var Handlebars = require('Handlebars');
  var template = Handlebars.template, 
      templates = Handlebars.templates = Handlebars.templates || {};
      templates['schema_shr.hbs'] = template({
        "1":function(container,depth0,helpers,partials,data,blockParams) {
          var stack1;
          // console.log("1: " + JSON.stringify(partials))
          // console.log(JSON.stringify(container))
          // // console.log(JSON.stringify(depth0))
          // console.log(JSON.stringify(helpers))
          // console.log(JSON.stringify(partials))
          // // console.log(JSON.stringify(data))
          // // console.log(JSON.stringify(blockParams))
          var ret = ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},blockParams[0][0],{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "");
          console.log(ret)
          return(ret);
        },
        "2":function(container,depth0,helpers,partials,data) {
          var stack1;
          console.log("2: " + JSON.stringify(partials))
          var ret = ((stack1 = container.invokePartial(partials.schema_namespace_list,depth0,{"name":"schema_namespace_list","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
          // console.log(ret)
          // console.log('here')
          return(ret);
        },
        "compiler":[7,">= 4.0.0"],
        "main":function(container,depth0,helpers,partials,data,blockParams) {
          var stack1;
          console.log("main: " + JSON.stringify(partials))
          var ret =  "<h2>Parsing Specification Hierarchy for: "
                 + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.hierarchy : depth0)) != null ? stack1.label : stack1), depth0))
                 + "</h2>\n\n"
                 + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.hierarchy : depth0)) != null ? stack1.children : stack1),{"name":"each","hash":{},"fn":container.program(1, data, 1, blockParams),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "");
          console.log(ret)
          return(ret);
        },
        "usePartial":true,
        "useData":true,
        "useBlockParams":true
       });

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }
  $(document).ready(function() {
    $("#load_hierarchy").click(function() {
      $.getJSON("assets/data/hierarchy.json",function(data) {
        window.hierarchy = data;
        window.namespaces = _.indexBy(hierarchy.children,"label");
        window.de = _.map(hierarchy.children,function(namespace) {
          namespace.index = _.indexBy(namespace.children,"label");
        });
        hierarchy.index = namespaces;
        addHierarchyIndex(hierarchy.children);

        /* Call Handlebars.compile on the templates
         and then call the template with hierarchy as the context */
         // console.log(Handlebars);
         // console.log(Handlebars.helpers);
         // console.log(Handlebars.partials);
         // console.log(Handlebars.template);
         // addPartials();
         console.log(hierarchy);

         console.log(templates['schema_shr.hbs']({hierarchy}));
      });

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
})();