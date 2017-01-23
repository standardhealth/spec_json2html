(function() {
  var template = Handlebars.template, 
      templates = Handlebars.templates = Handlebars.templates || {};
      templates['schema_shr.hbs'] = template({
        "1":function(container,depth0,helpers,partials,data,blockParams) {
          var stack1;

          return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},blockParams[0][0],{"name":"if","hash":{},"fn":container.program(2, data, 0, blockParams),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "");
        },
        "2":function(container,depth0,helpers,partials,data) {
          var stack1;

          return ((stack1 = container.invokePartial(partials.schema_namespace_list,depth0,{"name":"schema_namespace_list","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
        },
        "compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams) {
          var stack1;

          return "<h2>Parsing Specification Hierarchy for: "
                 + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.hierarchy : depth0)) != null ? stack1.label : stack1), depth0))
                 + "</h2>\n\n"
                 + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.hierarchy : depth0)) != null ? stack1.children : stack1),{"name":"each","hash":{},"fn":container.program(1, data, 1, blockParams),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "");
        },
        "usePartial":true,
        "useData":true,
        "useBlockParams":true
       });
})();