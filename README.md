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

- [Git](https://git-scm.com/), our version controlling tool.
    - If you have never used git or github before, you should check out [this tutorial](https://try.github.io/levels/1/challenges/1) and/or [this reference sheet](http://gitref.org/index.html).
- [Nodejs.org](https://nodejs.org/en/), the JavaScript Runtime we use.
- [GruntJs](http://gruntjs.com/), the JavaScript task runner we use.
- For Windows users, [Cmder](http://cmder.net/) is a powerful command line emulator to serve as alternative to powershell. This has been helpful for me.


<a id="environment"> </a>
##Setting Up the Environment
This project has been developed and tested with Node.js 6.6, although other versions _may_ work.  If you do not have Node.js installed, go to  and download the appropriate version of Node.

After installing Node.js, change to the central project directory and _npm install_ the command line interface for grunt (globally) and the project's dependencies:
```
$ npm install -g grunt-cli
$ npm install
```
You may need to use sudo (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) for the grunt CLI.


<a id="building"> </a>
##Building the Project
To assemble the project, run the default grunt command:
```
grunt
```
and the full site will be built in the `/dist` directory.


<a id="testing"> </a>
##Testing the Project
To run tests on this project, run the following:
```
grunt test
```
Results from the test will pop up in your terminal, and will be recorded to the results.txt file in the central directory.


<a id="directory"> </a>
## Directory Structure
Below you willl find the structure of folders, with a brief description of what they contain:
```
    SSVE
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
    ├── hb_shr.js               # The javascript used to build the website dynamically
    ├── Gruntfile.js            # Gruntfile that configures all tasks from testing to buildilng
    ├── results.txt             # Output of the last test run
    | ...                       # Other configuration files for Git/Node
    └── test.js                 # Testing file
```


<a id="technologies"></a>
##Technologies Used
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


<a id="team"></a>
##About the Team Behind The Standard Health Record

###[The MITRE Corporation](https://www.mitre.org/)

The MITRE Corporation is a not-for-profit organization working in the public interest that operates federally funded research and development centers to provide innovative solutions to national problems.


### License

Copyright 2016 The MITRE Corporation

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