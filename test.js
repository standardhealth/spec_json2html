const jp        = require("jsonpath");
const expect    = require('chai').expect;
const should    = require('chai').should();
const  _        = require('lodash');
const fs        = require('fs');
const yaml      = require('js-yaml');
const validator = require('html-validator');    

const ymlFile   = '_config.yml';
const homepage  = 'index.html';
const linkPatternNamespace = function(name) { return `href="/shr/${name}/index.html"`};
const linkPatternElem = function(elem) {return `#${elem}`}
const namePatternElem = function(elem) {return `id="${elem}"`}

// const wrappedExpectedFn = function(name, testCase) {
//     try {
//         return expectedFn(name);
//     } catch (e) {
//         const msg = `Skipping ${name} test.  Failed to load expected values: ${e}`;
//         console.warn(msg);
//         testCase.skip(msg);
//     }
// };

// Validate HTML 
describe('htmlValidation', function() {
    files = getHTMLFiles();
    for (ind in files) { 
        file = files[ind]
        validateHTML(file)
    }
}); 


// Homepage Tests:
describe('homePage', function(){
    const config = getYMLFile(ymlFile);
    
    it('should exist as file titled index.html in the dist folder', function() {
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
                console.log(namespace)
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
        }
        allFound.should.be.true;
    });

    // it('should display each element under its proper namespace', function() { 
    //     const allNs = getNamespaces();
    //     const home = getHomePage();
    //     let allFound = true;
    //     for (ind in allNs) { 
    //         const myRe = 
    //         const myRe = new RegExp(namespace, 'i');
    //         allFound = allFound && myRe.test(home);
    //     }
    //     // allFound.should.be.true;
    //     // allFound.should.be.true;
    //     // Use jsonpath to aggregate, for each namespace, all the dataElements and Groups
    //     // $..[?(@.type=="Namespace")].children
    //     // Check that, for each namespace, it contains all the proper dataElements/Groups
    // });

    it('should contain links to namespaces that contain entries', function() { 
        // Check that, for each namespace, there is an anchor tag with an href to the relevant 
        const allNsWithEntries = getNamespaceNames();
        const home = getHomePage();
        let allFound = true
        for (ind in allNsWithEntries) { 
            let namespace = allNsWithEntries[ind];
            const link = linkPatternNamespace(namespace.split('.')[1])
            const myRe = new RegExp(link, 'i');
            allFound = allFound && myRe.test(home);
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
        }
        allFound.should.be.true;
    });
});

// Namespaces tests
describe('namespaces', function(){
    allNs = getNamespaces();
    for (var i = allNs.length - 1; i >= 0; i--) {
        ns = allNs[i]
        namespaceTests(ns)
    };
});

// Takes the string of a namespace and runs a suite of tests on it. 
function namespaceTests(ns) { 
    describe(ns[0], function() { 
        it('should have its own filein the dist folder', function() {
            // Form is shr.namespace, so split on the '.'
            // Check that a file opens given the name
            (function() {getNamespaceFile(ns[0].split('.')[1])}).should.not.throw()
        });

        it('should contain all namespace defined elements', function () { 
            // Check that, for this namespace, every one of the values listed is contained 
            //  within the above set of dataelements/groups 
            const elems = ns[1];
            const nsPage = getNamespaceFile(ns[0].split('.')[1]);
            let allFound = true
            for (ind in elems) { 
                let elem = elems[ind];
                const link = namePatternElem(elem.label)
                const myRe = new RegExp(link, 'i');
                allFound = allFound && myRe.test(nsPage);
            }
            allFound.should.be.true;
        });
    });
};

// Returns a list of all the html files, as a single str, contained in the 
// dist folder as defined by the proper config file.
// TODO: Check that the file is a file, not a directory
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

// Returns a file corresponding to the home page for the shr viewer
function getHomePage() { 
    const config = getYMLFile(ymlFile);
    return fs.readFileSync(`${__dirname}/${config.dest}/index.html`,'utf8')
}

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
    console.log(namesWithEntries);
    return namesWithEntries;
}

// Returns an zipped array where each element contains both the
// name of the namespace and the elements defined within it.
function getNamespaces() { 
    const nsPattern = '$..[?(@.type=="Namespace")].label';
    const childrenPattern = '$..[?(@.type=="Namespace")].children';
    const elemPattern = '$..[?(@.label && (@.type=="DataElement" && @.isEntry))].label';
    let hierarchy = getHierarchy();
    let names = jp.query(hierarchy, nsPattern);
    let elements = jp.query(hierarchy, childrenPattern);
    // console.log(elements)
    return _.zip(names, elements);
}

// Returns all the dataelements in the hierarchy
function getElements() {
    const elemPattern = '$..[?(@.label && (@.type=="DataElement" && @.isEntry))].label';
    let hierarchy = getHierarchy();
    return jp.query(hierarchy, elemPattern);

}

// Returns a JSON object corresponding to the SHR Hierarchy 
function getHierarchy() { 
    config = getYMLFile(ymlFile);
    return JSON.parse(fs.readFileSync(`${__dirname}/${config.assets}/${config.data}/shr_v4_fixes.json`, 'utf8'));
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

// Returns the namespace file corresponding to named html file
function getNamespaceFile(name) {
    const config = getYMLFile(ymlFile);
    return fs.readFileSync(`${__dirname}/${config.dest}/${config.dirNS}/${name}/index.html`,'utf8')
}

// Returns the namespace in processed form so it appears as it is in rendered html,=
function processNamespace(ns) { 
    return ns.split('.')[1];
}