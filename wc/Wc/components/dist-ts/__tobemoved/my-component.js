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
var AppDrawComponent = (function (_super) {
    __extends(AppDrawComponent, _super);
    function AppDrawComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AppDrawComponent.prototype.connectedCallback = function () {
        var html = "\n            <style>\n                p{color:red}\n            </style>\n            <p>from inside the web component</p>\n            ";
        this.innerHTML = html;
    };
    return AppDrawComponent;
}(HTMLElement));
window.customElements.define("appdraw-component", AppDrawComponent);
//# sourceMappingURL=my-component.js.map