# spec_json2html

This project will convert hierarchical json output of the SHR specification into HTML. This will be used as the start of a SHR Spec Viewer tool.


##Downloading the Project:
Before getting started on any development, one will need to have the following installed:

- [Git](https://git-scm.com/), our version controlling tool.
    - If you have never used git or github before, you should check out [this tutorial](https://try.github.io/levels/1/challenges/1) and/or [this reference sheet](http://gitref.org/index.html).
- [Nodejs.org](https://nodejs.org/en/), the JavaScript Runtime we use.
- [GruntJs](http://gruntjs.com/), the JavaScript task runner we use.
- For Windows users, [Cmder](http://cmder.net/) is a powerful command line emulator to serve as alternative to powershell. This has been helpful for me.


##Setting  Up the Environment:
This project has been developed and tested with Node.js 6.6, although other versions _may_ work.  If you do not have Node.js installed, go to  and download the appropriate version of Node.

After installing Node.js, change to the central project directory and _npm install_ the command line interface for grunt (globally) and the project's dependencies:
```
$ npm install -g grunt-cli
$ npm install
```
You may need to use sudo (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) for the grunt CLI.


##Building the Project:
To assemble the project, run the default grunt command:
```
grunt
```
and the full site will be built in the `/dist` directory.

##Testing the Project:
To run tests on this project, run the following:
```
grunt test
```
Results from the test will pop up in your terminal, and will be recorded to the results.txt file in the central directory.


##Technologies Used:
Below you will find a comprehensive list of the central technologies and tools the SSVE is built with, along with brief descriptions and links for learning more:

- [Nodejs.org](https://nodejs.org/en/), the JavaScript Runtime we use.
- [GruntJs](http://gruntjs.com/), the JavaScript task runner we use.
- [Assemble.io](http://assemble.io/), a static site generator for Grunt.js and Node.js, building pages wiht HandlebarsJS.
- [HandlebarsJs](http://handlebarsjs.com/), a logicless templating language we use to generate views for the website.
- [Mocha](https://mochajs.org/), the Node.js testing framwork we use.
- [jQuery](https://jquery.com/), a JavaScript library enabling quick navigation and manipulation of HTML.


##About the Team Behind the Standard Health Record

###[The MITRE Corporation](https://www.mitre.org/)

The MITRE Corporation is a not-for-profit organization working in the public interest that operates federally funded research and development centers to provide innovative solutions to national problems.


## License

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