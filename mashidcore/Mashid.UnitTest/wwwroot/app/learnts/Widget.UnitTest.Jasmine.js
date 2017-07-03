describe("WidgetUnitTest",
    function() {
        it("Person should have expected methods and properties",
            function() {
                // Arrange
                // Act
                const widget = new Widget("");

                // Assert
                expect(typeof Widget.Create).toBe("function");

                expect(typeof widget).toBe("object");
                expect(typeof widget.forename).toBe("undefined");
                expect(typeof widget.foo).toBe("function");
                expect(typeof widget.privFoo).toBe("function");
            });

        it("Create() should yield expected defaults",
            function() {
                // Arrange
                // Act
                // Assert
                //...expect(Person.Create(null).Name()).toBe("");
                //expect(Person.Create(undefined).name()).toBe("");
                //...expect(Person.Create(1).Name()).toBe('');
                expect(Widget.Create().name()).toBe("");
                expect(Widget.Create("").name()).toBe("");
                expect(Widget.Create("Smith").name()).toBe("Smith");
            });

        it("privFoo() should yield expected ",
            function() {
                // Arrange
                // Act
                // Assert
                expect(Widget.Create().privFoo()).toBe("privFoo");
            });
    });