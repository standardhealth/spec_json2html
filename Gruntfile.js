/*
 * shr-assemble-spec
 *
 * Michael Nosal
 * https://github.com/mrnosal/shr-assemble-spec
 *
 * Copyright (c) 2016
 * Licensed under the MIT license.
 */
var helpers = require('handlebars-helpers')();
var _ = require('lodash');
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
module.exports = function(grunt) {
'use strict';

  var addHierarchyIndex = function(children,hierarchy) {
    _.each(children,function(item) {
      if (item && _.isObject(item)) {
        if (item.type == "Identifier") {
          if (item.namespace == "primitive") {
            item.description = item.label.capitalize();
          }
          if (item.namespace.startsWith("shr.")) {
            item.idref = hierarchy.index[item.namespace].index[item.label];
          }
        }
        addHierarchyIndex(item,hierarchy);
      } else {
        if (item && _.isArray(item)) {
          _.each(item,function(child) {
            addHierarchyIndex(child,hierarchy);
          });
        }
      }
    });
  }


  // Set up the top-level pages for each namespace
  var spec_template = grunt.file.read('./templates/pages/namespace.hbs');
  console.log("spec_template = " + JSON.stringify(spec_template));

  var data = grunt.file.readJSON('./data/hierarchy.json');
  var namespaces = _.keyBy(data.children,"label");
  _.map(data.children,function(namespace) {
    namespace.index = _.keyBy(namespace.children,"label");
  });
  data.index = namespaces;
  addHierarchyIndex(data.children,data);

  var namespace_pages = _.map(data.children,function(item) {
    item.follow=true;
    return {
      filename:item.label.split('.')[1],  // labels are shr.namespace so we name the page based on the name of the namespace
      data:item,
      content:spec_template
    }
  });

  /* console.log(JSON.stringify(namespace_pages)); */

  // Project Configuration
  grunt.initConfig({
    // Project metadata
    pkg:    grunt.file.readJSON('package.json'),
    site:   grunt.file.readYAML('_config.yml'),

    // Before generation, remove files from previous build
    clean: {
      example: ['<%= site.dest %>/<%= site.pages %>']
    },
    copy: {
      main: {
        files: [
          {expand:true, flatten: true, src: ['templates/includes/**.hbs'], dest:'<%= site.dest %>/<%= site.assets %>/partials'},
          {expand:true, flatten: true, src: ['data/hierarchy.json'], dest:'<%= site.dest %>/<%= site.assets %>/data'}
        ]
      }
    },
    /* want to bundle up the handlebars stuff to load into the browser to render hierarchies dynamically */
    browserify: {
      vendor: {
        src: ['hb_shr.js'],
        dest: '<%= site.dest %>/<%= site.assets %>/app.js',
        options: {
          browserifyOptions: {
            require: ['handlebars'],
            paths: ['./node_modules']
          }
        }
      }
    },
    assemble: {
      options: {
        pkg: '<%= pkg %>',
        site: '<%= site %>',
        data: ['<%= site.data %>/*.{json,yml}'],


        // Templates
        partials: '<%= site.includes %>',
        layoutdir: '<%= site.layouts %>',
        layout: '<%= site.layout %>',

        // Extensions
        helpers: '<%= site.helpers %>',
        plugins: '<%= site.plugins %>'
      },
      pages: {
        options : {
          pages:namespace_pages
        },
        files :[{
          dest: '<%= site.dest %>',
          src:'!*'
        }]
      },
      example: {
        flatten: true,
        expand: true,
        cwd: '<%= site.pages %>/shr',
        src: '*.hbs',
        dest: '<%= site.dest %>'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
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
  grunt.registerTask('test', ['clean', 'browserify', 'copy', 'assemble', 'mochaTest']);
}
