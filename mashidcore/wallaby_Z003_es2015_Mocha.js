module.exports = function (wallaby) {

    return {

      files: [
            "Mashid\\wwwroot\\app\\es2015\\*.js"
            ,{pattern: "node_modules\\chai\\chai.js",instrument: false}
      ],

      tests: [
        "Mashid.UnitTest\\wwwroot\\app\\es2015\\*.UnitTest.Mocha.js"
      ],

      testFramework: 'mocha' 

      //, -X-env: {kind: 'electron'}

      //setup: function () {
      //    window.expect = chai.expect;
      //    var should = chai.should();
      //}
    };
};




