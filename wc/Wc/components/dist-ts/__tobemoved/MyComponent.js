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
var $ownerDocument = (document._currentScript || document.currentScript).ownerDocument;
$template = $ownerDocument.querySelector("template");
var MyComponent = (function (_super) {
    __extends(MyComponent, _super);
    function MyComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyComponent.prototype.connectedCallback = function () {
        var $templateClone = document.importNode($template.content, true);
        this.appendChild($templateClone);
    };
    return MyComponent;
}(HTMLElement));
window.customElements.define("my-component", MyComponent);
//# sourceMappingURL=MyComponent.js.map