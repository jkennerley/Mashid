// jasmine

describe("sut", function () {
    it("give {your-ctx} when call {foo} then should yield expected", function () {
        // Arrange
        var SUT = function () {
            return { foo: function () { return 1; } };
        };
        var sut = SUT();
        // check you actually have a sut, should have been made ambient by runner config
        console.log(sut);
        // Act
        // call
        var actual = sut.foo();
        // Assert
        var expected = 1;
        expect(actual).toEqual(expected);
    });
});



