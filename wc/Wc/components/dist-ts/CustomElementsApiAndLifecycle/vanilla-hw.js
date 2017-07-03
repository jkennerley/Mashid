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
var VanillaElement = (function (_super) {
    __extends(VanillaElement, _super);
    function VanillaElement() {
        var _this = _super.call(this) || this;
        console.log("ce.ctor() ...");
        return _this;
    }
    VanillaElement.prototype.connectedCallback = function () {
        console.log("ce.connectedCallback, connected to the dom ...");
    };
    Object.defineProperty(VanillaElement, "observedAttributes", {
        get: function () {
            return ["demo"];
        },
        enumerable: true,
        configurable: true
    });
    VanillaElement.prototype.attributeChangedCallback = function (name, oldValue, newValue) {
        console.log("ce.attributeChangedCallback, attribute has been changed ...");
        console.log(oldValue, newValue);
    };
    VanillaElement.prototype.disconnectedCallback = function () {
        console.log("ce.disconnectedCallback, disconnected from the DOM. Cleanup ...");
    };
    return VanillaElement;
}(HTMLElement));
window.customElements.define("vanilla-element", VanillaElement);
//# sourceMappingURL=vanilla-hw.js.map