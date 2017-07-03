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
        _this._quotes = ["A", "B", "D", "E", "F", "G", "H"];
        _this._$quote = null;
        _this._interval = null;
        return _this;
    }
    MtkRandomQuote.prototype.connectedCallback = function () {
        var _this = this;
        var template = "\n<style>\n</style>\n<div>\n    <h1>random quote</h1>\n    <p>\n        <span id=\"quote\">\n\n        </span>\n    </p>\n</div>\n";
        this.innerHTML = template;
        this._$quote = this.querySelector("#quote");
        this._interval = setInterval(function () { return _this._render(); }, 250);
        this._render();
    };
    MtkRandomQuote.prototype._render = function () {
        if (this._$quote !== null) {
            var r = Math.floor(Math.random() * this._quotes.length);
            this._$quote.innerHTML = this._quotes[r];
        }
    };
    MtkRandomQuote.prototype.disconnectedCallback = function () {
        clearInterval(this._interval);
    };
    return MtkRandomQuote;
}(HTMLElement));
window.customElements.define("mtk-random-quote", MtkRandomQuote);
//# sourceMappingURL=CEBestPractice_random-quote-component.js.map