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
var MtkRandomQuote = (function (_super) {
    __extends(MtkRandomQuote, _super);
    function MtkRandomQuote() {
        var _this = _super.call(this) || this;
        _this._quotes = ["A", "B", "C", "D", "E", "F", "G", "H"];
        _this._$quote = null;
        _this._interval = null;
        return _this;
    }
    MtkRandomQuote.prototype.connectedCallback = function () {
        var _this = this;
        var innerHtml = "\n            <style>\n            </style>\n            <div>\n                <h1>random quote :: </h1>\n                <p>\n                    <span id=\"quote\"></span>\n                </p>\n            </div>\n            ";
        this.innerHTML = innerHtml;
        this._$quote = this.querySelector("#quote");
        this._interval = setInterval(function () { return _this._render(); }, 10000);
        this._setInterval(this.getAttribute("interval"));
        this._render();
    };
    MtkRandomQuote.prototype._render = function () {
        if (this._$quote !== null) {
            var r = Math.floor(Math.random() * this._quotes.length);
            this._$quote.innerHTML = this._quotes[r];
        }
    };
    MtkRandomQuote.prototype._setInterval = function (value) {
        var _this = this;
        if (this._interval !== null) {
            clearInterval(this._interval);
        }
        if (value > 0) {
            this._interval = setInterval(function () { return _this._render(); }, value);
        }
    };
    MtkRandomQuote.prototype.disconnectedCallback = function () {
        clearInterval(this._interval);
    };
    Object.defineProperty(MtkRandomQuote, "observedAttributes", {
        get: function () {
            return ["interval"];
        },
        enumerable: true,
        configurable: true
    });
    MtkRandomQuote.prototype.attributeChangedCallback = function (name, oldValue, newValue) {
        console.log("attributeChangedCallback( " + name + ", " + oldValue + ", " + newValue + " ");
        this._setInterval(newValue);
    };
    return MtkRandomQuote;
}(HTMLElement));
window.customElements.define("mtk-random-quote", MtkRandomQuote);
//# sourceMappingURL=random-quote-attributes-component.js.map