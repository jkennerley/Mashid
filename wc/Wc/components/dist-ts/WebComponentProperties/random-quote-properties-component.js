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
        _this._attached = false;
        _this._data = { question: "Is 1+1 = 2?", answers: ["Yes", "No"] };
        _this._selected = null;
        _this._$question = null;
        _this._$answers = null;
        return _this;
    }
    MtkRandomQuote.prototype.connectedCallback = function () {
        var _this = this;
        this._attached = true;
        this.innerHTML = "\n            <style>\n                .selected {\n                    color: green ;\n                    background-color:wheat;\n            }\n            </style>\n            <div>\n                <h3 id=\"question\"></h3>\n                <ul id=\"answers\"></ul>\n            </div>\n        ";
        this._$question = this.querySelector("#question");
        this._$answers = this.querySelector("#answers");
        this._$answers.addEventListener("click", function (event) {
            _this._$answers.querySelectorAll("li").forEach(function ($li, index) {
                $li.classList.remove("selected");
                if ($li === event.target) {
                    _this._selected = index;
                    $li.classList.add("selected");
                    _this.selected = index;
                }
            });
        });
        this._render();
    };
    MtkRandomQuote.prototype._render = function () {
        var _this = this;
        if (this._attached && this._data !== null) {
            this._$answers.innerHTML = "";
            this._$question.innerHTML = this._data.question;
            this._data.answers.forEach(function (answer) {
                var $li = document.createElement("li");
                $li.innerHTML = answer;
                _this._$answers.appendChild($li);
            });
        }
    };
    Object.defineProperty(MtkRandomQuote.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (data) {
            if (this.data === data) {
                return;
            }
            else {
                this._data = data;
                this._render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MtkRandomQuote.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        set: function (index) {
            var $answer = this._$answers.querySelector("li:nth-child(" + (index + 1) + ")");
            if ($answer !== null) {
                var $lis1 = this._$answers.querySelector("li");
                var $lis2 = this._$answers.querySelectorAll("li");
                if ($lis2) {
                    this._$answers.querySelectorAll("li").forEach(function ($li) {
                        $li.classList.remove("selected");
                    });
                }
                $answer.classList.add("selected");
                this._selected = index;
            }
        },
        enumerable: true,
        configurable: true
    });
    return MtkRandomQuote;
}(HTMLElement));
window.customElements.define("mtk-random-quote", MtkRandomQuote);
//# sourceMappingURL=random-quote-properties-component.js.map