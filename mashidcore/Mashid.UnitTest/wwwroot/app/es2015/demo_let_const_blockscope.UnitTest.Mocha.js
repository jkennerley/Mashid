/*
let is new  keyword to declare variables

Does away with hoisting :
  variable/fun declarations are put into memory at compile phase,
  See https://developer.mozilla.org/en-US/docs/Glossary/Hoisting
  JavaScript only hoists declarations, not initializations

const :
blockscoping :

fat-arrow functions :

*/

"use strict";

// wallaby_Z003_ws2015_Mocha.js, for electron and v8
chai.should();

let consolePrintSomeState = () => {
    //console.log(window);
    //console.log(window.navigator.appCodeName);
    //console.log(window.navigator.appName);
    //console.log(window.navigator.appVersion);
    //console.log(window.navigator.geolocation);
    //console.log(window.navigator.language);
    //console.log(window.navigator.onLine);
    //console.log(window.navigator.platform);
    //console.log(window.navigator.product);
    //console.log(window.navigator.systemLanguage);
    //console.log(window.navigator.userAgent);
    //console.log(window.navigator.webdriver);
    //console.log(location.host);
    //console.log(location.hostname);
};

describe("demo es2015 let, const, blockscope",
    () => {
        it("let keyword, ensure declaration before usage",
            () => {
                // Arrange
                // Act
                // Assert
                console.log(ida);
                var ida; // this var IS hoisted above the
                console.log(ida);

                //console.log(idb);
                //let idb = 2; // this var IS-NOT hoisted into memory at compile-phase
                //console.log(idb);

                // declare with let :
                let idc;
                console.log(idc);

                // declare with let :
                const idd = 3;
                console.log(idd);

                // declare with let :
                // using the let keyword will cuase undeclared usage to execpt
                //console.log(ide); // using the let keyword, this line will except, using the var keyword will cuase undefined to be printed
                const ide = "E"; // causes undefined at usage-site because of hoisting
                //let ide = "E"; // causes "reference error: ide is not defined" exception at the usage site
            });

        it("",
            () => {
                var idv = "ONE";
                {
                    var idv = 2;
                    console.log(idv);
                }
                // idv was re-declared inside the {}, and affected the outer var
                console.log(idv);

                // block scoping with let
                const id = 1;
                {
                    const id = true;
                    console.log(id);
                }
                {
                    const id = "THREE";
                    console.log(id);
                }
                console.log(id);
            });

        it(" is block scoped ",
            () => {
                // Arrange
                const bar = 123;
                // Act
                {
                    const bar = 456;
                }
                // Assert
                bar.should.equal(123);
            });

        it(" is block scoped ",
            () => {
                // Arrange
                // Act
                var foo = function() {
                    //let bar = 123;
                    {
                        const bar = 456;
                    }
                    bar.should.equal(123);
                };

                // Assert
                foo.should.throw("bar is not defined");
            });

        it("temporal dead-zone",
            () => {
                // Arrange

                // using id and updating it
                function updateId() {
                    id = 1;
                };

                // declare id
                let id = null;

                // Act

                // up id, even though at the point of declaration id had NOT been let declared
                updateId();

                // Assert
                id.should.equal(1);
            });

        it("temporal dead-zone",
            () => {
                // Arrange
                var passed =
                (
                    function() {
                            try {
                                qux;
                            } catch (e) {
                                return true;
                            }
                        }
                        ()
                );

                //  x  = x & y
                function fn() { passed &= qux === 456; }

                const qux = 456;

                // Act

                fn();

                // Assert
                //return passed;
                //id.should.equal(1);
            });

        it("for loop statement scope ",
            () => {
                // Act : here let causes  to be scoped inside the block of the loop
                const j = 1;
                for (const j = 0; false;) {
                }
                // Assert
                j.should.equal(1);

                // Act : here var causes i to be scoped outside of the loop
                var i = 1;
                for (var i = 0; i < 10; i++) {
                }
                // Assert
                i.should.equal(10);

                // Act : here var causes k to be scoped outside of the loop, and so each fun call returns k, which is declared ONCE outside the block
                var funs = [];
                for (var k = 0; k < 10; k++) {
                    funs.push(function() { return k; });
                }
                // Assert
                funs[0]().should.equal(10);
                funs[3]().should.equal(10);

                // Act : here let causes l to be scoped inside of the loop, and so each l is captured by the loop-block
                var funs = [];
                for (let l = 0; l < 10; l++) {
                    funs.push(function() { return l; });
                }
                // Assert
                funs[0]().should.equal(0);
                funs[3]().should.equal(3);
            });

        it("const, should be initialised, ",
            () => {
                // example
                const MAX_NO = 10;
                MAX_NO.should.equal(10);

                // example
                const MAX_NO_3 = 10;
                // this should type error, assignment to constant variable
                //MAX_NO_3 = 100;
                console.log(MAX_NO_3);
                //MAX_NO_3.should.equal(10);

                // example
                //const MAX_NO_1;// this should cause syntx error
            });

        it("demo of checking for an js exception",
            function() {
                var err = new ReferenceError("This is a bad function.");
                //var err = new ReferenceError('This is a BAD-NOT function.'); // jest
                //var err = new ReferenceError('This is a good function.');// jest
                const fn = function() { throw err; };
                fn.should.throw(ReferenceError);
                fn.should.throw(ReferenceError);
                fn.should.throw(Error);
                fn.should.throw(/bad function/);
                fn.should.not.throw("good function");
                fn.should.throw(ReferenceError, /bad function/);
                fn.should.throw(err);
            });
    });