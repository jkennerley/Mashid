module.exports = function () {
    var MAIN_PROJECT = "WC";
    var MAIN_TEST_PROJECT = "Wc.TestsJs";

    var wallaby =
        {


            "files": [

                {
                    "pattern": "/" + MAIN_PROJECT + "/components/dist-ts/noop.js",
                    "instrument": true,
                    "load": true,
                    "ignore": false
                },

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

            "env": { "kind": "electron" }

            "-x-env": { "kind": "phantomjs" },
        };

    return wallaby;
};