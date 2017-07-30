// jasmine

describe("mash-grid", function () {

    //it("adder should be defined", function () {
    //    // Arrange
    //    console.log(adder);
    //    // Act
    //    // Assert
    //    expect(adder(1, 2)).toBe(3);
    //});

    //it("Widget should be defined", function () {
    //    // Arrange
    //    console.log(Widget);
    //    var w = new Widget();
    //    // Act
    //    console.log(w.foo());
    //    // Assert
    //    expect(w.foo()).toBe(2);
    //});

    it("There should be a type MashGrid", function () {
        // Arrange
        // Act
        //console.log(MashGrid);
        //console.log(typeof MashGrid);

        // Assert
        expect(typeof MashGrid).toBe("function");
    });

    it("There should be a type MashGrid", function () {
        // Arrange

        // Act
        console.log(MashGrid);

        // create an element, sut
        var $cspan = document.createElement("span");
        console.log($cspan);

        //var $ce = document.createElement("mash-grid");
        //console.log(typeof $ce);

        $cspan.innerHTML = "JKJKK";
        //$cspan.innerHTML = "<mash-grid></mash-grid>";



        //// after some time add the element to the DOM
        //document.body.appendChild($ce);
        //
        //// Assert
        //expect(typeof $ce).toBe("object");
    });
});