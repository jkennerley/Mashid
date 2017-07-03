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
var MtkSlideMenu = (function (_super) {
    __extends(MtkSlideMenu, _super);
    function MtkSlideMenu() {
        var _this = _super.call(this) || this;
        _this._root = _this.attachShadow({ mode: "open" });
        _this._$frame = null;
        _this._open = true;
        return _this;
    }
    Object.defineProperty(MtkSlideMenu.prototype, "open", {
        get: function () {
            return this._open;
        },
        set: function (value) {
            var result = (value === true);
            if (this._open === result) {
                return;
            }
            this._open = result;
            this._render();
        },
        enumerable: true,
        configurable: true
    });
    MtkSlideMenu.prototype.connectedCallback = function () {
        var _this = this;
        this._root.innerHTML = "\n            <style>\n            .frame {\n                position: fixed;\n                top: 0;\n                bottom: 0;\n                width: 100%;\n                overflow: hidden;\n                pointer-events: none;\n                z-index: 1000;\n                transition: background-color 300ms ease-in;\n            }\n            .container {\n                width: 80%;\n                width: var(--menu-width, 80%);\n\n                background: var(--menu-bg-col, #aaa) ;\n\n                height: 100%;\n                transform: translateX(-100%);\n                will-change: transform;\n                transition: transform 300ms ease-in;\n                box-shadow: 1px 0 3px rgba(51,51,51,0.25);\n            }\n            .title {\n                display: flex;\n                flex-direction: row;\n                min-height: 3.2em;\n                font-size: var( --title-size , 1.5em );\n\n                background-color: var( --title-background-color , #F1F1F1 );\n\n\n                color: var( --title-color , #666 ) ;\n\n\n            }\n            .title .title-content {\n                flex-grow: 1;\n                display: flex;\n                align-items: center;\n                padding-left: 1em;\n            }\n            .close {\n                flex-basis: 100px;\n                flex-grow: 0;\n                flex-shrink: 0;\n                cursor: pointer;\n                display: flex;\n                justify-content: center;\n                align-items: center;\n                user-select: none;\n            }\n            .frame.open {\n                pointer-events: auto;\n                background-color: rgba(0, 0, 0, 0.25);\n            }\n            .frame.open .container {\n                transform: none;\n            }\n            .content-slot::slotted(a) {\n                display: block;\n                font-size: 1.2em;\n                text-decoration: none;\n                line-height: 2.5em;\n                padding: 0.5em;\n                border-bottom: solid 1px #F1F1F1;\n                color: #666;\n            }\n            .content-slot::slotted(a:hover) {\n                color: #000;\n            }\n            /* when host uses theme=red attribute on th cpt */\n            :host([theme=\"red\"]) .title {\n                background-color: #E23F24;\n                color: white;\n            }\n            :host([theme=\"red\"]) .content-slot::slotted(a:hover) {\n                color: #E23F24;\n            }\n            /* when host uses theme=blue attribute on the cpt */\n            :host([theme=\"blue\"]) .title {\n                background-color: #0d152d;\n                color: white;\n            }\n            :host([theme=\"blue\"]) .content-slot::slotted(a:hover) {\n                color: #0d152d;\n            }\n\n            /* if cpt hosts has backdrop=\"false\", then */\n            :host([backdrop=\"false\"]) .frame.open {\n                pointer-events: none;\n                background-color: inherit;\n            }\n            :host([backdrop=\"false\"]) .frame.open .container {\n                pointer-events: auto;\n            }\n            </style>\n            <div class=\"frame\" data-close=\"true\">\n                <nav class=\"container\">\n                    <div class=\"title\">\n                        <div class=\"title-content\">\n                            <slot name=\"title\">Menu</slot>\n                        </div>\n                        <a class=\"close\" data-close=\"true\">&#10006;</a>\n                    </div>\n                    <div class=\"content\">\n                        <slot class=\"content-slot\"></slot>\n                    </div>\n                </nav>\n            </div>\n        ";
        this._$frame = this._root.querySelector(".frame");
        this._$frame.addEventListener("click", function (event) {
            if (event.target.dataset.close === "true") {
                _this.open = false;
            }
        });
    };
    MtkSlideMenu.prototype._render = function () {
        if (this._$frame !== null) {
            if (this._open === true) {
                this._$frame.classList.add("open");
                this.dispatchEvent(new CustomEvent("menu-opened"));
            }
            else {
                this._$frame.classList.remove("open");
                this.dispatchEvent(new CustomEvent("menu-closed"));
            }
        }
    };
    return MtkSlideMenu;
}(HTMLElement));
window.customElements.define("mtk-slide-menu", MtkSlideMenu);
//# sourceMappingURL=mtk-slide-menu.js.map