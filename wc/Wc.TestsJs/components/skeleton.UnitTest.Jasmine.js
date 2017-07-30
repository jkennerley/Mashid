// jasmine
describe("sut", function () {
    it("given CTX then foo(...) should yield expected", function () {
        // Arrange

        // an example SUT
        var SUT = function () {
            return { foo: function () { return 1; } };
        };

        // ctx fakery
        var fakery = {};

        // instance of SUT
        var sut = SUT(fakery);
        console.log(sut);

        // Act

        // call on the
        var actual = sut.foo();

        // Assert
        var expected = 1;
        expect(actual).toEqual(expected);
    });

    it("given CTX then foo(...) should yield expected", function () {
        // Arrange

        // instance of SUT
        var sut = new Calculator();
        console.log(sut);

        // Act

        // call on the
        var actual = sut.add(1,2);

        // Assert
        var expected = 3;
        expect(actual).toEqual(expected);
    });
});