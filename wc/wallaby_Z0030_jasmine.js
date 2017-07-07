module.exports = function () {
    var MAIN_PROJECT = "WC";
    var MAIN_TEST_PROJECT = "Wc.TestsJs";

var wallaby =
        {
            "files": [
                {
                    "pattern": "/" + MAIN_PROJECT + "/components/dist-ts/mash-grid/mash-grid-starter.js",
                    "instrument": true,
                    "load": true,
                    "ignore": false
                }

            ],

            "tests": [
                "/" + MAIN_TEST_PROJECT + "/components/**/*.UnitTest.Jasmine.js"
            ],

            "testFramework": "jasmine",

            "-x-env": { "kind": "phantomjs" },
            "env": { "kind": "electron" }
        };

    return wallaby;
};