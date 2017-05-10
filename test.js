const jp        = require("jsonpath");
const expect    = require('chai').expect;
const should    = require('chai').should();
const  _        = require('lodash');
const fs        = require('fs');
const yaml      = require('js-yaml');
const validator = require('html-validator');    

const ymlFile   = '_config.yml';
const homepage  = 'index.html';
const linkPatternNamespace = function(name) { return `href="/shr/${name}"`};
const linkPatternElem = function(elem) {return `#${elem}`}
const idPatternElem = function(elem) {return `id="${elem}"`}
const codePatternElem = function(code) {return `<code>${code}</code>`}
const linkPatternCodesystem = function(csObj) {return `href="/shr/${csObj.namespace}/cs/#${csObj.name}"`}
const linkPatternValueset   = function(vsObj) {return `href="/shr/${vsObj.namespace}/cs/#${vsObj.name}"`}

//
//
// Series of tests

// Validate HTML 
describe('htmlValidation', function() {
    files = getHTMLFiles();
    for (ind in files) { 
        file = files[ind]
        validateHTML(file)
    }
}); 

// Given an HTML file, does it validate?
function validateHTML(file) { 
    it(`should validate file ${file.name}`, function (done) {
        const options = {
            format: 'text',
            data: file.text
        };
        validator(options, function (err, data) { 
            data.should.contain('The document validates according to the specified schema');
            done();
        }); 
    });
}


//
// Namespce pages

// NamespaceIndex Tests:
describe('Namespace Index', function(){
    const config = getYMLFile(ymlFile);

    it('should exist as file titled index.html in the shr folder', function() {
        // Use the config file to go to proper dist folder 
        getHomePage.should.not.throw();
    });
    it('should display all namespaces in the hierarchy that contain entries', function() { 
        // Use jsonpath to aggregate all of the namespaces within the hierarchy
        const allNsWithEntries = getNamespaceNames();
        const home = getHomePage();
        let allFound = true;
        for (ind in allNsWithEntries) { 
            let namespace = allNsWithEntries[ind];
            namespace = processNamespace(namespace);
            const myRe = new RegExp(namespace, 'i');
            allFound = allFound && myRe.test(home);
            if (!allFound) { 
                console.log("Could not find: " + namespace)
            }
        }
        allFound.should.be.true;
    });
    it('should contain all elements that are entries contained in namespaces', function() { 
        // Use jsonpath to aggregate all the dataElements and Groups
        const elems = getElements();
        const home = getHomePage();
        let allFound = true;
        for (ind in elems) { 
            let elem = elems[ind];
            const myRe = new RegExp(elem, 'i');
            allFound = allFound && myRe.test(home);
            if (!allFound) { 
                console.log("Could not find: " + namespace);
            }
        }
        allFound.should.be.true;
    });
    it('should contain links to namespaces that contain entries', function() { 
        // Check that, for each namespace, there is an anchor tag with an href to the relevant 
        const allNsWithEntries = getNamespaceNames();
        const home = getHomePage();
        let allFound = true
        for (ind in allNsWithEntries) { 
            let namespace = allNsWithEntries[ind];
            const link = linkPatternNamespace(namespace.split('.')[1]);
            const myRe = new RegExp(link, 'i');
            allFound = allFound && myRe.test(home);
            if (!allFound) { 
                console.log("Could not find: " + namespace);
            }
        }
        allFound.should.be.true;
    });
    it('should contain links to each dataElement that is an entry', function() { 
        // Use jsonpath to aggregate all the dataelements and groups 
        const elems = getElements();
        const home = getHomePage();
        let allFound = true
        for (ind in elems) { 
            let elem = elems[ind];
            const link = linkPatternElem(elem)
            const myRe = new RegExp(link, 'i');
            allFound = allFound && myRe.test(home);
            if (!allFound) { 
                console.log("Could not find: " + namespace);
            }
        }
        allFound.should.be.true;
    });
});

// Namespace Pages tests
describe('namespaces', function(){
    let allNs = getNamespaces();
    for (let i = allNs.length - 1; i >= 0; i--) {
        let ns = allNs[i];
        namespaceTests(ns);
    };
});

// Takes the string of a namespace and runs a suite of tests on it. 
function namespaceTests(ns) { 
    describe(ns[0], function() { 
        it('should have its own filein the dist folder', function() {
            // Form is shr.namespace, so split on the '.'
            // Check that a file opens given the name
            (function() {getNamespaceFile(processNamespace(ns[0]))}).should.not.throw()
        });

        it('should contain all namespace defined elements', function () { 
            // Check that, for this namespace, every one of the values listed is contained 
            //  within the above set of dataelements/groups 
            const elems = ns[1];
            const nsPage = getNamespaceFile(processNamespace(ns[0]));
            let allFound = true
            for (ind in elems) { 
                let elem = elems[ind];
                const link = idPatternElem(elem.label)
                const myRe = new RegExp(link, 'i');
                allFound = allFound && myRe.test(nsPage);
            }
            allFound.should.be.true;
        });
    });
};


//
// Codesystem Testing

// Codesystem Index tests
describe('codesystemIndex', function() {
    const config = getYMLFile(ymlFile);

    it('should exist as file titled index.html in the dist folder', function() {
        // Use the config file to go to proper dist folder 
        getCodesystemIndexFile.should.not.throw();
    });
    it('should display all codesystems in the SHR', function() { 
        // Use jsonpath to aggregate all of the namespaces within the hierarchy
        const allCodesystems = getCodesystemsObjs();  //  [{name: csysName, namespace: csysNamespace}]
        const csIndex = getCodesystemIndexFile();
        let allFound = true;
        for (let ind in allCodesystems) { 
            const cs = allCodesystems[ind];
            const myRe = new RegExp(cs.name, 'i');
            allFound = allFound && myRe.test(csIndex);
            if (!allFound) { 
                console.log("Could not find: " + cs.name);
            }
        }
        allFound.should.be.true;
    });
    it('should contain links to codesystems', function() { 
        // Check that, for each namespace, there is an anchor tag with an href to the relevant 
        const allCodesystems = getCodesystemsObjs(); //  [{name: csysName, namespace: csysNamespace}]
        const csIndex = getCodesystemIndexFile();
        let allFound = true;
        for (let ind in allCodesystems) { 
            const cs = allCodesystems[ind];
            const link = linkPatternCodesystem(cs);
            const myRe = new RegExp(link, 'i');
            allFound = allFound && myRe.test(csIndex);
            if (!allFound) { 
                console.log("Could not find: " + cs.name);
            }
        }
        allFound.should.be.true;
    });
});

// Codesystems by namespace tests
describe('Codesystems By Namespace', function() {
    let csByNamespace = getCodesystemsByNamespace();
    for (let ns in csByNamespace) {
        codesystemByNamespaceTests(ns, csByNamespace)
    }
});

// Takes each valueset and run tests on all the associated valuesets. 
function codesystemByNamespaceTests(ns, lookup) { 
    describe(ns, function() {

        it('should have an index.html file in thisNamespace/cs/ folder', function() {
            // Use the config file to go to proper dist folder 
            (function() {getCodesystemFile(processNamespace(ns))}).should.not.throw()
        });
        it('should contain all codesystems defined in those namespaces', function () { 
            // Check that, for this namespace, every one of the codesystems that say they're 
            // contained therein are generated on the page
            const codesystems = lookup[ns];
            const nsPage = getCodesystemFile(processNamespace(ns));
            let allFound = true;
            for (let ind in codesystems) { 
                const cs = codesystems[ind];
                const idPattern = idPatternElem(cs.label);
                const myRe = new RegExp(idPattern, 'i');
                allFound = allFound && myRe.test(nsPage);
                if (!allFound) { 
                    console.log("Could not find: " + cs.label + " in namespace: " + ns);
                }
            }
            allFound.should.be.true;
        });
        it('should contain all codes defined in each codesystem', function () { 
            // Check that, for this namespace, every one of the codesystems that say they're 
            // contained therein are generated on the page
            const codesystems = lookup[ns];
            const nsPage = getCodesystemFile(processNamespace(ns));
            let allFound = true;
            for (let ind in codesystems) { 
                const cs = codesystems[ind];
                // For each of the codes in this codesystem
                if (cs.children) { 
                    for (ind in cs.children) { 
                        const codeObj = cs.children[ind];
                        const code = codeObj.code
                        const idPattern = idPatternElem(code);
                        const myRe = new RegExp(idPattern, 'i');
                        // Find it on the page
                        allFound = allFound && myRe.test(nsPage);
                        // Log to console if not found
                        if (!allFound) { 
                            console.log("Could not find: " + code + " for codesystem: "  + cs.label +  " in namespace: " + ns);
                        }
                    }
                } else { 
                    console.log("CS: " + cs.label + " has no children?")
                }
                if (!allFound) { 
                    console.log("Could not find all codes for: " + cs.label + " in namespace: " + ns);
                }
            }
            allFound.should.be.true;
        });
    });
};


//
// Valueset Testing

// Valueset Index tests
describe('valuesetIndex', function() {
    const config = getYMLFile(ymlFile);

    it('should exist as file titled index.html in the dist folder', function() {
        // Use the config file to go to proper dist folder 
        getValuesetIndexFile.should.not.throw();
    });
    it('should display all valuesets in the SHR', function() { 
        // Use jsonpath to aggregate all of the namespaces within the hierarchy
        const allValuesets = getValuesetsObjs();  //  [{name: csysName, namespace: csysNamespace}]
        const vsIndex = getValuesetIndexFile();
        let allFound = true;
        for (let ind in allValuesets) { 
            const vs = allValuesets[ind];
            const myRe = new RegExp(vs.name, 'i');
            allFound = allFound && myRe.test(vsIndex);
            if (!allFound) { 
                console.log("Could not find: " + vs.name);
            }
        }
        allFound.should.be.true;
    });
    it('should contain links to valuesets', function() { 
        // Use jsonpath to aggregate all of the namespaces within the hierarchy
        const allValuesets = getValuesetsObjs();  //  [{name: csysName, namespace: csysNamespace}]
        const vsIndex = getValuesetIndexFile();
        let allFound = true;
        for (let ind in allValuesets) { 
            const vs = allValuesets[ind];
            const link = linkPatternValueset(vs);
            const myRe = new RegExp(vs.name, 'i');
            allFound = allFound && myRe.test(vsIndex);
            if (!allFound) { 
                console.log("Could not find: " + vs.name);
            }
        }
        allFound.should.be.true;
    });
});

// Valuesets by namespace tests
describe('Valuesets By Namespace', function() {
    let vsByNamespace = getValuesetsByNamespace();
    // Lookup table, so keys are ns 
    for (let ns in vsByNamespace) {
        valuesetByNamespaceTests(ns, vsByNamespace)
    }
});

// Takes each valueset and run tests on all the associated valuesets. 
function valuesetByNamespaceTests(ns, lookup) { 
    describe(ns, function() {
        
        it('should have an index.html file in thisNamespace/vs/ folder', function() {
            // Use the config file to go to proper dist folder 
            (function() {getValuesetFile(processNamespace(ns))}).should.not.throw()
        });
        it('should contain all valuesets defined in those namespaces', function () { 
            // Check that, for this namespace, every one of the valuesets that say they're 
            // contained therein are generated on the page
            const valuesets = lookup[ns];
            const nsPage = getValuesetFile(processNamespace(ns));
            let allFound = true;
            for (let ind in valuesets) { 
                const vs = valuesets[ind];
                const idPattern = idPatternElem(vs.label);
                const myRe = new RegExp(idPattern, 'i');
                allFound = allFound && myRe.test(nsPage);
                if (!allFound) { 
                    console.log("Could not find: " + vs.label + " in namespace: " + ns);
                }
            }
            allFound.should.be.true;
        });
        it('should contain all codes defined in each valueset', function () { 
            // Check that, for this namespace, every one of the valuesets that say they're 
            // contained therein are generated on the page
            const valuesets = lookup[ns];
            const nsPage = getValuesetFile(processNamespace(ns));
            let allFound = true;
            for (let ind in valuesets) { 
                const vs = valuesets[ind];
                const idPattern = idPatternElem(vs.label);
                // For each of the codes in this valueset
                if (vs.children) { 
                    for (ind in vs.children) { 
                        const codeObj = vs.children[ind];
                        let code
                        if (codeObj.type == "ValueSetIncludesFromCodeSystemRule") { 
                            // Looking to see that the codesystem itself is mentions on the page 
                            // Since the codes aren't imported directly.
                            code = codeObj.system; 
                        } else { 
                            // Code is two levels deep on this.
                            code = codeObj.code.code;
                            const specialChars = ['<','<=','>','>=']
                            // If this code is one of the characters that will break the regex, skip
                            if(specialChars.includes(code)) { continue;}
                        }
                        const idPattern = codePatternElem(code);
                        const myRe = new RegExp(idPattern, 'i');
                        // Find it on the page
                        allFound = allFound && myRe.test(nsPage);
                        // Log to console if not found
                        if (!myRe.test(nsPage)) { 
                            console.log("Could not find: " + code + " in valueset: "  + vs.label +  " in namespace: " + ns);
                        }
                    }
                } else { 
                    console.log("VS: " + vs.label + " has no children?")
                }
                if (!allFound) { 
                    console.log("Could not find all codes for: " + vs.label + " in namespace: " + ns);
                }
            }
            allFound.should.be.true;
        });
    });
};


//
//
// SHR Object fetching: Find and process different aspects of the SHR hierarchy

//
// Namespaces
//
// Returns a string list of the names of the namespaces contained in the 
// SHR Hierarchy
function getNamespaceNames() {
    const nsPattern = '$..[?(@.type=="Namespace")].label';
    const childrenPattern = '$..[?(@.type=="Namespace")].children'; // returns array of all ns's elements
    const hierarchy = getHierarchy();
    let names = jp.query(hierarchy, nsPattern);
    let entries = _.map(jp.query(hierarchy, childrenPattern), function(elements) { 
        return (undefined == _.find(elements, (elem) => { return elem.isEntry; })) ? [] : elements;
    })
    let namesWithEntries = [];
    for (let i = 0; i < names.length; i++) { 
        if (entries[i].length > 0) {
            namesWithEntries.push(names[i]);
        } else { 
            continue;
        }
    }
    return namesWithEntries;
}

// Returns an zipped array where each element contains both the
// name of the namespace and the elements defined within it.
function getNamespaces() { 
    const nsPattern = '$..[?(@.type=="Namespace")].label';
    const childrenPattern = '$..[?(@.type=="Namespace")].children';
    let hierarchy = getHierarchy();
    let names = jp.query(hierarchy, nsPattern);
    let elements = jp.query(hierarchy, childrenPattern);
    return _.zip(names, elements);
}

// Returns all the dataelements in the hierarchy
function getElements() {
    const elemPattern = '$..[?(@.label && (@.type=="DataElement" && @.isEntry))].label';
    let hierarchy = getHierarchy();
    return jp.query(hierarchy, elemPattern);
}


//
// Codesystems
//
// Returns array of objs with names/namespaces of each codesystem in the 
// SHR Hierarchy
function getCodesystemsObjs() {
    const csPattern = '$..[?(@.type=="CodeSystems")].children'; // returns array of all cs
    const hierarchy = getHierarchy();
    const codesystemNamesArray = jp.query(hierarchy, csPattern); // Returns array of possible results (which are an array themselves)
    if (codesystemNamesArray.length == 1 ) { 
        let csys = codesystemNamesArray[0];
        let codesystemObjs = _.map(csys, function(cs) {
            return {name: cs.label, namespace: processNamespace(cs.namespace)};
        });
        return codesystemObjs;
    } else { 
        return [];        
    }
}

// Returns a lookup table of namespaces and the codesystems defined within it.
function getCodesystemsByNamespace() { 
    const csPattern = '$..[?(@.type=="CodeSystems")].children'; // returns array of all cs
    const hierarchy = getHierarchy();
    const codesystemNamesArray = jp.query(hierarchy, csPattern); // Returns array of possible results (which are an array themselves)
    let mapNamespaceToCodesystems = {};
    if (codesystemNamesArray.length == 1 ) { 
        let csys = codesystemNamesArray[0];
        _.forEach(csys, function(cs) {
          var ns  = cs.namespace;
          // add vs to namespace array if the array exists; else construct the array and add vs to it.
          if (mapNamespaceToCodesystems[ns] != undefined) { 
            mapNamespaceToCodesystems[ns].push(cs)
          } else { 
            mapNamespaceToCodesystems[ns] = [cs]      
          }
        });
        return mapNamespaceToCodesystems;
    } else { 
        return {};        
    }
}

//
// Valuesets
//
// Returns array of objs with names/namespaces of each codesystem in the 
// SHR Hierarchy
function getValuesetsObjs() {
    const vsPattern = '$..[?(@.type=="ValueSets")].children'; // returns array of all cs
    const hierarchy = getHierarchy();
    const valuesetNamesArray = jp.query(hierarchy, vsPattern); // Returns array of possible results (which are an array themselves)
    if (valuesetNamesArray.length == 1 ) { 
        let vsets = valuesetNamesArray[0];
        let valuesetObjs = _.map(vsets, function(vs) {
            return {name: vs.label, namespace: processNamespace(vs.namespace)};
        });
        return valuesetObjs;
    } else { 
        return [];        
    }
}

// Returns a lookup table of namespaces and the codesystems defined within it.
function getValuesetsByNamespace() { 
    const vsPattern = '$..[?(@.type=="ValueSets")].children'; // returns array of all cs
    const hierarchy = getHierarchy();
    const valuesetNamesArray = jp.query(hierarchy, vsPattern); // Returns array of possible results (which are an array themselves)
    let mapNamespaceToValuesets = {};
    if (valuesetNamesArray.length == 1 ) { 
        let vsets = valuesetNamesArray[0];
        _.forEach(vsets, function(vs) {
          var ns  = vs.namespace;
          // add vs to namespace array if the array exists; else construct the array and add vs to it.
          if (mapNamespaceToValuesets[ns] != undefined) { 
            mapNamespaceToValuesets[ns].push(vs)
          } else { 
            mapNamespaceToValuesets[ns] = [vs]      
          }
        });
        return mapNamespaceToValuesets;
    } else { 
        return {};        
    }
}


//
//
// File and data fetching

// Returns a JSON object corresponding to the SHR Hierarchy 
function getHierarchy() { 
    config = getYMLFile(ymlFile);
    return JSON.parse(fs.readFileSync(`${__dirname}/${config.assets}/${config.data}/${config.dataFile}`, 'utf8'));
}

// Returns the YML file corresponding to the config file -- assumes the config is in the same dir
function getYMLFile(name) { 
    try {
        var doc = yaml.safeLoad(fs.readFileSync(`./${name}`, 'utf8'));
        return doc;
    } catch (e) {
        return {};
    } 
}

// Returns a file corresponding to the namespace index
function getHomePage() { 
    const config = getYMLFile(ymlFile);
    return fs.readFileSync(`${__dirname}/${config.dest}/index.html`,'utf8')
}

// Returns the namespace file corresponding to name provided
function getNamespaceFile(name) {
    const config = getYMLFile(ymlFile);
    return fs.readFileSync(`${__dirname}/${config.dest}/${config.dirNS}/${name}/index.html`,'utf8')
}

// Returns a file corresponding to the codesystem index
function getCodesystemIndexFile() {
    const config = getYMLFile(ymlFile);
    return fs.readFileSync(`${__dirname}/${config.dest}/${config.dirNS}/cs/index.html`,'utf8')
}

// Returns the codesystem file corresponding to the namespace provided
function getCodesystemFile(ns) {
    const config = getYMLFile(ymlFile);
    return fs.readFileSync(`${__dirname}/${config.dest}/${config.dirNS}/${ns}/cs/index.html`,'utf8')
}

// Returns a file corresponding to the valueset index
function getValuesetIndexFile() {
    const config = getYMLFile(ymlFile);
    return fs.readFileSync(`${__dirname}/${config.dest}/${config.dirNS}/vs/index.html`,'utf8')
}

// Returns the valueset file corresponding to the namespace provided
function getValuesetFile(ns) {
    const config = getYMLFile(ymlFile);
    return fs.readFileSync(`${__dirname}/${config.dest}/${config.dirNS}/${ns}/vs/index.html`,'utf8')
}

// Returns a list of all the html files, as a single str, contained in the 
// dist folder as defined by the proper config file.
function getHTMLFiles() {
    const config = getYMLFile(ymlFile);
    let files = [];
    let curdir = `${__dirname}/${config.dest}/`;
    let fnames = fs.readdirSync(curdir);
    for (var index in fnames) { 
        const curfname = fnames[index];
        if (fs.lstatSync(curdir + curfname).isFile()) {
            files.push({
                text: fs.readFileSync(`${__dirname}/${config.dest}/${curfname}`, 'utf8'), 
                name: curfname
            });
        }
    }
    return files;
}   


//
//
// File processing and helpers 

// Returns the namespace in processed form so it appears as it is in rendered html,=
function processNamespace(ns) { 
    return (ns.length > 1) ? ns.split('.')[1] : "";
}

