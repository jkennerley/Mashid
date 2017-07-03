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
var MtkStarRating = (function (_super) {
    __extends(MtkStarRating, _super);
    function MtkStarRating() {
        var _this = _super.call(this) || this;
        _this._root = _this.attachShadow({ mode: "open" });
        _this._$top = null;
        _this._$bottom = null;
        _this._disabled = false;
        _this._value = 0;
        _this._touched = false;
        return _this;
    }
    Object.defineProperty(MtkStarRating.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            if (this._value === value)
                return;
            this._touched = true;
            this._value = value;
            this._render();
        },
        enumerable: true,
        configurable: true
    });
    MtkStarRating.prototype.connectedCallback = function () {
        var _this = this;
        this._root.innerHTML = "\n            <style>\n                :host {\n                    width: 4.1em;\n                    height: 1em;\n                    display: inline-block;\n                    overflow: hidden;\n                    user-select: none;\n                    vertical-align: middle;\n                    box-sizing: border-box;\n                }\n                .container {\n                  color: #c5c5c5;\n                  font-size: 1em;\n                  line-height: 1em;\n                  margin: 0 auto;\n                  position: relative;\n                  padding: 0;\n                  cursor: pointer;\n                }\n                .container .top {\n                  color: #e7bd06;\n                  padding: 0;\n                  position: absolute;\n                  z-index: 1;\n                  display: block;\n                  top: 0;\n                  left: 0;\n                  overflow: hidden;\n                  width: 0;\n                }\n                .container:hover .top {\n                    display: none;\n                }\n                .container .bottom {\n                  padding: 0;\n                  display: block;\n                  position: absolute;\n                  top: 0;\n                  left: 0;\n                  unicode-bidi: bidi-override;\n                  direction: rtl;\n                }\n                /* Credit: https://css-tricks.com/star-ratings/ */\n                .container .bottom > span:hover,\n                .container .bottom > span:hover ~ span {\n                   color: #e7bd06;\n                }\n                :host([disabled]) .container {\n                    cursor: inherit;\n                }\n                :host([disabled]) .container .top {\n                    display: block;\n                }\n                :host([disabled]) .container .bottom > span:hover,\n                :host([disabled]) .container .bottom > span:hover ~ span {\n                    color: inherit;\n                }\n            </style>\n            <div class=\"container\">\n                <div class=\"top\">\n                    <span>\u2605</span><span>\u2605</span><span>\u2605</span><span>\u2605</span><span>\u2605</span>\n                </div>\n                <div class=\"bottom\">\n                    <span data-value=\"5\">\u2605</span><span data-value=\"4\">\u2605</span><span data-value=\"3\">\u2605</span><span data-value=\"2\">\u2605</span><span data-value=\"1\">\u2605</span>\n                </div>\n            </div>\n        ";
        this._disabled = (this.getAttribute("disabled") !== null);
        this._$top = this._root.querySelector(".top");
        this._$bottom = this._root.querySelector(".bottom");
        this._$bottom.addEventListener("click", function (event) {
            if (_this._disabled !== true && event.target.dataset.value !== undefined) {
                if (_this._value !== event.target.dataset.value) {
                    _this.dispatchEvent(new Event("change"));
                    _this.value = event.target.dataset.value;
                }
            }
        });
        var initialValue = this.getAttribute("value");
        if (initialValue !== null) {
            this._value = initialValue;
            this._render();
        }
    };
    MtkStarRating.prototype._render = function () {
        if (this._$top !== null) {
            this._$top.style.width = ((this._value * 10) * 2) + "%";
        }
    };
    Object.defineProperty(MtkStarRating, "observedAttributes", {
        get: function () {
            return ["disabled", "value"];
        },
        enumerable: true,
        configurable: true
    });
    MtkStarRating.prototype.attributeChangedCallback = function (name, oldValue, newValue) {
        if (oldValue !== newValue) {
            switch (name) {
                case "disabled":
                    this._disabled = (newValue !== null);
                    break;
                case "value":
                    if (this._touched === false) {
                        this._value = newValue;
                        this._render();
                    }
                    break;
            }
        }
    };
    return MtkStarRating;
}(HTMLElement));
window.customElements.define("mtk-star-rating", MtkStarRating);
//# sourceMappingURL=star-rating.js.map