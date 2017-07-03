
module.exports = function (wallaby) {

    return {

      files: [
            "Mashid\\wwwroot\\app\\learnts\\*.js"
            ,{pattern: "node_modules\\chai\\chai.js",instrument: false}
      ],

      tests: [
        "Mashid.UnitTest\\wwwroot\\app\\learnts\\*.UnitTest.Mocha.js"
      ],

      testFramework: 'mocha'

      //setup: function () {
      //    window.expect = chai.expect;
      //    var should = chai.should();
      //}

    };
};



