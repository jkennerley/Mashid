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
var innerHtml = "\n    <p id=\"text\">web component skeleton</p>\n";
var MtkScaffold = (function (_super) {
    __extends(MtkScaffold, _super);
    function MtkScaffold() {
        var _this = this;
        console.log("cpt.ctor()");
        _this = _super.call(this) || this;
        _this._attached = false;
        _this._private1 = null;
        _this._root = _this.attachShadow({ "mode": "open" });
        return _this;
    }
    MtkScaffold.prototype.connectedCallback = function () {
        console.log("cpt.connectedCallback()");
        this._root.innerHTML = innerHtml;
        this._$text = this._root.querySelector("#text");
    };
    MtkScaffold.prototype._render = function () {
        console.log("cpt.render()");
        this._$text.innerText = "from the renderer ...";
    };
    Object.defineProperty(MtkScaffold, "observedAttributes", {
        get: function () {
            console.log("cpt.observedAttributes()");
            return ["an-important-attribute"];
        },
        enumerable: true,
        configurable: true
    });
    MtkScaffold.prototype.attributeChangedCallback = function (name, old, nyoo) {
        console.log("cpt.attributeChangedCallback()");
    };
    Object.defineProperty(MtkScaffold.prototype, "property1", {
        get: function () {
            console.log("cpt. get property()");
            return this._private1;
        },
        set: function (data) {
            console.log("cpt. set property()");
            if (this._private1 === data) {
                return;
            }
            else {
                this._private1 = data;
            }
        },
        enumerable: true,
        configurable: true
    });
    return MtkScaffold;
}(HTMLElement));
window.customElements.define("mtk-scaffold", MtkScaffold);
//# sourceMappingURL=component-scaffold.js.map