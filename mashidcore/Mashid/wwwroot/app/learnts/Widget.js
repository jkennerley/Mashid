console.log("{es3,1}");
var Widget = (function () {
    function Widget(forname) {
        this.forname = forname;
        this.privFoo2 = function () { return "privFoo"; };
        this.foo2 = function () { return "foo"; };
    }
    Widget.prototype.privFoo = function () {
        return "privFoo";
    };
    Widget.prototype.foo = function () {
        return "foo";
    };
    Widget.prototype.name = function () {
        return this.forname;
    };
    Widget.Create = function (forename) {
        if (forename === void 0) { forename = ""; }
        return new Widget(forename);
    };
    return Widget;
}());
//# sourceMappingURL=Widget.js.map