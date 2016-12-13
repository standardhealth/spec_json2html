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

module.exports = function(grunt) {
'use strict';

  // Delete after first run
  if(!grunt.file.exists('vendor')) {
    grunt.fail.fatal('>> Please run "bower install" before continuing.');
  }

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
      example: {
        files: {'<%= site.dest %>/': ['<%= site.templates %>/*.hbs']}
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-assemble');

  grunt.registerTask('default',['clean','assemble']);
}