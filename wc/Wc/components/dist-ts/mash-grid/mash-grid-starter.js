var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var adder = function (a, b) {
    return a + b;
};
var Widget = (function () {
    function Widget() {
    }
    Widget.prototype.foo = function () {
        return 2;
    };
    return Widget;
}());
var MashGrid = (function (_super) {
    __extends(MashGrid, _super);
    function MashGrid() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MashGrid;
}(HTMLElement));
//# sourceMappingURL=mash-grid-starter.js.map