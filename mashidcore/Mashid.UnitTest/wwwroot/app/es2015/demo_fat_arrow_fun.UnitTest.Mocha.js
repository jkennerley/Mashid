/*
fat-arrow functions :
*/

"use strict";

// wallaby_Z003_ws2015_Mocha.js, for electron and v8
chai.should();


describe("demo fat arrow functions",
    function () {

        var Person = function () {
            console.log(this);
            this.Surname = "Smith";
        };

        var Address = function () {
            console.log(this);
        }; 

        it("fat arrow functions : declare simple fun, takes no params, returns number",
            function () {
                // Arrange

                // Act

                var person = new Person();
                console.log(person);

                var address = Address();
                console.log(address);

                // Assert

            });


        it("fat arrow functions : declare simple fun, takes no params, returns number",
            function() {
                // Arrange
                //let foo = () => 1.0;
                const foo = () => 1.;
                // Act
                console.log(foo);
                console.log(typeof foo);
                console.log(typeof foo());
                // Assert
                (typeof foo).should.equal("function");
                (typeof foo()).should.equal("number");
                foo().should.equal(1.000000);
                // the check by http://kangax.github.io/compat-table/es6/
                ((() => 5)() === 5).should.equal(true);
            });

        it("fat arrow fun 1 param no brackets ",
            () => {
                // Arrange
                let foo = x => x * 2.;
                // Act
                // Assert
                (typeof foo).should.equal("function");
                (foo(1.)).should.equal(2.);
            }
        );

        it("fat arrow fun with multiple params", () => {
            // Arrange
            var c = (v, w, x, y, z) => "" + v + w + x + y + z;
            // Act
            // Assert
            // the check by http://kangax.github.io/compat-table/es6/
            (c(6, 5, 4, 3, 2) === "65432").should.equal(true);
        } );

        it("fat arrow fun with multiple params & a {} block with return statement ", () => {
            // Arrange
            let foo = (v, w, x, y, z) => {
                return "" + v + w + x + y + z;
            };
            // Act
            // Assert
            (foo(6, 5, 4, 3, 2) === "65432").should.equal(true);
        });


        // So far fat-arrow-fun sometimes save the keystrokes 'function' and 'return' and '{}'
        // the real purpose of fat-array-fun is handle context

        it("fat arrow fun : arrow-funs handling this-context ...", () => {
            // Arrange

            // Act

            // fun-callback for will have the this-context set to the  element clicked
            // this context inside the callback-function would be #document
            document.addEventListener('click', function () {
                // would print #document ; 
                // in es5, the context inside the fun is set to the element that receives the event
                // we do not get access to the context of the fun
                console.log(this);
            });

            // fat-arrow-fun-callback for will have the this-context unchanged
            // now use a fat-arrow-fun ...
            // this context inside the callback-fat-fun would be window
            document.addEventListener('click', () => {
                // would print window 
                // the context of the code is the window object ...
                console.log(this);
            });

            // Assert
        });

        it("fat arrow fun ", () => {

            // Arrange

            // Act

            var inv1 = {
                number: 123,
                // is a function(), this-ctx will be the inv1-class-instance
                process: function () {
                    // this is set to the object on which the function is called
                    console.log(this);
                }
            };
            inv1.process();

            console.log(window);
            // the context here is 
            console.log(this);
            var inv2 = {
                number: 456,
                // process is a fat-arrow-fun, 
                // this is NOT set to the object, it left on the window object
                // the context is not the inv2 object
                process: () => {
                    console.log(this);
                }
            };
            inv2.process();

            ///
            var inv3 = {
                number: 3,
                // process is function
                process: function () {
                    console.log(this);
                    // inv3.process() returns a function,...
                    return () => {
                        console.log(this);
                        console.log(this.number);
                        return this.number;
                    }
                }
            };
            inv3.process()();
            //console.log(inv3.process()());


        });


        // if fat-arrow-fun, can't change the value of this with bind



        //it("screenshot for ALT-SHIFT-F10", function () {
        //
        //    // with electron ...
        //    var element = document.getElementsByTagName("body");
        //    console.log(element);
        //    console.log(element[0]);
        //    element[0].style.background = '#FF00AA';
        //});





    });