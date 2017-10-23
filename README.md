# spec_json2html

This project will convert hierarchical json output of the SHR specification into HTML. This will be used as the start of a SHR Spec Viewer tool.

- [Downloading the Project](#downloading)
- [Setting Up the Environment](#environment)
- [Building the Project](#building)
- [Testing the Project](#testing)
- [Directory Structure](#directory)
- [Technologies Used](#technologies)
- [About the Team Behind The Standard Health Record ](#team)


<a id="downloading"> </a>
## Downloading the Project
Before getting started on any development, one will need to have the following installed:

- [Git](https://git-scm.com/), our version control tool.
    - If you have never used git or github before, you should check out [this tutorial](https://try.github.io/levels/1/challenges/1) and/or [this reference sheet](http://gitref.org/index.html).
- [Nodejs.org](https://nodejs.org/en/), the JavaScript Runtime we use.
- [GruntJs](http://gruntjs.com/), the JavaScript task runner we use.
- For Windows users, [Cmder](http://cmder.net/) is a powerful command line emulator to serve as alternative to powershell. This has been helpful for me.

From the command line, execute the following command in the directory where you want the spec_json2html directory to be put:

git clone https://github.com/standardhealth/spec_json2html.git

that will create a directory called spec_json2html within the current working directory. Future instructions below will reference the spec_json2html directory. 

<a id="environment"> </a>
## Setting Up the Environment
This project has been developed and tested with Node.js 6.6, although other versions _may_ work.  If you do not have Node.js installed, go to  and download the appropriate version of Node.

After installing Node.js, change to the central project directory, `spec_json2html/`, and _npm install_ the command line interface for grunt (globally) and the project's dependencies:
```
$ npm install -g grunt-cli
$ npm install
```
You may need to use sudo (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) for the grunt CLI.


<a id="building"> </a>
## Building the Project
To assemble the project, run the default grunt command in `spec_json2html/`:
```
grunt
```
and the full site will be built in `spec_json2html/dist`.


### Static Generation
On running the `grunt` command, the Assemble plugin builds the website using the JSON specification hierarchy located in `spec_json2html/assets/data` and the handlebars layouts, pages , partials and helpers. Specifically:

- Assemble reads the hierarchy as the JSON object `hierarchy` which is navigated to determine the content of the page being generated.
- The handlebars files in `spec_json2html/templates/layouts/` describe the parent-level HTML layouts of all pages, independent of their content.
- The handlebars files in `spec_json2html/pages/` describe the content of the individual pages. That file almost immediately references handlebars partials to dictate the content of child elements.
- The handlebars partials in `spec_json2html/templates/partials` define how each child element of the SHR hierarchy should be presented in the HTML. The context of these partials is dictated by where we are in our navigation of the JSON hierarchy. Often these partials will call on children partials, located in the same directory; these calls often result in a context shift from the current element (.e.g a Namespace) to one of it's children (e.g. a specific entry).
- The handlebars helpers in `spec_json2html/templates/helpers` are used when logic that is not inherent in Handlebars is needed such as equality checking, console logging, so on.

To get a feel for the navigation, start from the file `namespace.hbs` in `spec_json2html/pages/` and open up partials as they are referenced hierarchically.

### Dynamic Generation
When dynamically generating our pages, the same logic is used as is refernced above. Since this generation is clientside, assets are loaded to the client through the following workarounds:

- Handlebars is bundled as a library using browserify, which means we can access the Handlebars object as we normally would in out JavaScript code.
- Any handlebars templates that are used in generation are stored in the assets folder.
- Any handlebars templates that are used have identifying `div`'s located in the head of the HTML file, along with src links that refernce their location in the assets folder.
- Helpers are loaded manually via a function included in `hb_shr.js`. Moving forward this should be done dynamically using the `_config.yml` file at the build time of the static site.

Providing these references to all of the component Handlebars templates and partials, as well as the definition of all necessary Handlebars helpers, allows us to dynamically generate any page clientside.


<a id="testing"> </a>
## Testing the Project
To run tests on this project, run the following in `spec_json2html/`:
```
grunt test
```
Results from the test will pop up in your terminal, and will be recorded to the results.txt file in your current directory.


<a id="directory"> </a>
## Directory Structure
Below you will find the structure of folders, with a brief description of what they contain:
```
    spec_json2html/
    ├── node_modules/            # Node modules necessary for generation
    ├── templates/               # Templates for each element in the hiearchy
    |    ├── helpers             # All of the handlebars helpers
    |    ├── includes            # All of the individual handlebars components
    |    └── layouts             # Possible page layouts, built using partials found in 'includes'
    ├── assets/
    |    ├── data                # JSON hierarchy data used in generating the spec
    |    └── css                 # Css used on the site
    ├── dist/                    # Ouput from the site generation
    |    ├── assets/
    |        ├── css/
    |        ├── data/
    |        ├── partials/
    |        └── app.js
    |    ├── namespace.html
    |    ... # one file per namespace
    |    └── index.html
    ├── README.md               # README for project construction
    ├── _config.yml             # Configuration file, used in definining env variables
    ├── .travis.yml             # Configuration for Travis, our Continuous Integration engine 
    ├── search.js               # The javascript used to build the search index
    ├── Gruntfile.js            # Gruntfile that configures all tasks from testing to buildilng
    ├── results.txt             # Output of the last test run
    | ...                       # Other configuration files for Git/Node
    └── test.js                 # Testing file
```


<a id="technologies"></a>
## Technologies Used
Below you will find a comprehensive list of the central technologies and tools the SSVE is built with, along with brief descriptions and links for learning more:

- [Nodejs.org](https://nodejs.org/en/), the JavaScript Runtime we use, providing a mechanism for downloading and running JavaScript tools for bundling, building and testing our site.
- [NPM](https://www.npmjs.com/), a NodeJs package manager, used to download open source packages listed below.
- [GruntJs](http://gruntjs.com/), a JavaScript task runner, used for automating and simplifying repetitive tasks.
- [Assemble.io](http://assemble.io/), a static site generator for Grunt.js and Node.js, used to build our site using HandlebarsJS templates, partials and helpers.
- [HandlebarsJs](http://handlebarsjs.com/), a logicless templating language, used to generate views for the website. On the server side, assemble uses Handlebars to build static assets for the SSVE. On the cilent side, we bundle  the Handlebars library with our javascript (using Browserify) and can dynamically generate views on the fly.
- [Mocha](https://mochajs.org/), a Node.js testing framwork, used to build tests that not only affirm the functionality of our JavaScript but a subset of the content we expect on our webpages.
- [Chai](http://chaijs.com/), a BDD / TDD assertion library for node, used to define the checks that mocha uses in its test cases.
- [jQuery](https://jquery.com/), a JavaScript library enabling quick navigation and manipulation of HTML, used throughout to write efficient and capable JavaScript that can directly modify and alter the DOM.
- [Travis](https://travis-ci.com/), a continuous integration service, used to continually run tests on any new pushes made to Github.
- [Browserify] (http://browserify.org/), lets you require('modules') in the browser by bundling up all of your dependencies much like you can do in Node.js


<a id="team"></a>
## About the Team Behind The Standard Health Record

###[The MITRE Corporation](https://www.mitre.org/)

The MITRE Corporation is a not-for-profit organization working in the public interest that operates federally funded research and development centers to provide innovative solutions to national problems.


### License

Copyright 2017 The MITRE Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
```
    http://www.apache.org/licenses/LICENSE-2.0
```
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
