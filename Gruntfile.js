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
module.exports = function(grunt) {
'use strict';

  // Delete after first run
  if(!grunt.file.exists('vendor')) {
    grunt.fail.fatal('>> Please run "bower install" before continuing.');
  }

  // Set up the top-level pages for each namespace
  var spec_template = grunt.file.read('./templates/pages/namespace.hbs');
  console.log("spec_template = " + JSON.stringify(spec_template));
  var data = grunt.file.readJSON('./data/hierarchy.json');
  var namespaces = _.map(data.children,function(item) {
    item.follow=true;
    return {
      filename:item.label.split('.')[1],  // labels are shr.namespace so we name the page based on the name of the namespace
      data:item,
      content:spec_template
    }
  });
  /* console.log(JSON.stringify(namespaces)); */

  // Project Configuration
  grunt.initConfig({
    // Project metadata
    pkg:    grunt.file.readJSON('package.json'),
    site:   grunt.file.readYAML('_config.yml'),
    vendor: grunt.file.readJSON('.bowerrc').directory,

    // Before generation, remove files from previous build
    clean: {
      example: ['<%= site.dest %>']
    },

    assemble: {
      options: {
        pkg: '<%= pkg %>',
        site: '<%= site %>',
        data: ['<%= site.data %>'],

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
          pages:namespaces
        },
        files :[
          {dest: '<%= site.dest %>/<%= site.pages %>/shr/',src:'!*'}
        ]
      },
      example: {
        files: {'<%= site.dest %>/': ['<%= site.pages %>/shr/*.hbs']}
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-assemble');
  grunt.registerTask('default',['assemble']);
}