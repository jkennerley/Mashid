// jasmine

describe("mash-grid", function () {

    it("document.CreateElement(mash-grid) should return DOM element", function () {
        // Arrange
        console.log(adder);
        // Act
        // Assert
        expect(adder(1, 2)).toBe(3);
    });


    it("Widget should be SUT", function () {
        // Arrange
        console.log(Widget);
        var w = new Widget();
        // Act
        console.log(w.foo());
        // Assert
        expect(w.foo()).toBe(2);
    });

    it("There should be a type MashGrid", function () {
        // Arrange
        
        // Act
        console.log(MashGrid);
        console.log(typeof MashGrid);
        
        // Assert
        expect(typeof MashGrid).toBe("function");
    });


    it("There should be a type MashGrid", function () {
        // Arrange

        //// Act
        //console.log(MashGrid);
        //
        //// create an element, sut
        //var $ce = document.createElement("mash-grid");
        //console.log($ce);
        //console.log(typeof $ce);
        //
        //// after some time add the element to the DOM
        //document.body.appendChild($ce);
        //
        //// Assert
        //expect(typeof $ce).toBe("object");
    });


});
