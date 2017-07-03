module.exports = function (wallaby) {

    return {

        "files": [
          "Mashid\\wwwroot\\app\\learnts\\*.js"
        ],

        "tests": [
          "-X-Mashid.UnitTest\\wwwroot\\app\\learnts\\*.UnitTest.Jasmine.js",
          "-X-Mashid.UnitTest\\wwwroot\\app\\es2015\\*.UnitTest.Jasmine.js",
          "Mashid.UnitTest\\wwwroot\\app\\**\\*.UnitTest.Jasmine.js"
        ],

        /* use jasmine 
        "-X-testFramework": 'mocha',
        */

        /* electron/v8 does not seem to allow wallaby screenshot 
        "env": { "kind": "electron" }
        */

        /*
        using phantomjs, after npm install phantomjs-prebuilt --save-dev
        https://wallabyjs.com/docs/integration/phantomjs2.html

        env: {runner: require('phantomjs-prebuilt').path}
        */

        //setup: function () {
        //    window.expect = chai.expect;
        //    var should = chai.should();
        //}
    };
};
