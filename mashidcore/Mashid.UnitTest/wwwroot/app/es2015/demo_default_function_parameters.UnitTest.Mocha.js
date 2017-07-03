"use strict";

chai.should();

describe("demo es2015 defult function paramters",
    () => {
        it("...",
            () => {
                // Arrange
                const foo = (x = 10) => x + 1;
                // Act
                // Assert
                // 1 is passed as a param
                foo(1).should.equal(2);

                // nothing is passed but the fun declaration defaults the param to a value
                foo().should.equal(11);

                // zero is passed
                foo(undefined).should.equal(11);

                // 0 is passed
                foo(null).should.equal(1);

                // "A " is passed
                foo("A ").should.equal("A 1");
            });
    });