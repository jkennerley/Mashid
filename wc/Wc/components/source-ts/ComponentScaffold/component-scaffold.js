const innerHtml = `
    <p id="text">web component skeleton</p>
`;

class MtkScaffold extends HTMLElement {

    constructor() {
        console.log("cpt.ctor()");
        super();
        this._attached = false;
        this._private1 = null;
        this._root = this.attachShadow({ "mode": "open" });
    }

    connectedCallback() {
        console.log("cpt.connectedCallback()");
        // add template
        this._root.innerHTML = innerHtml;
        // store important $dom elements for later use
        //  use $ for dom
        this._$text = this._root.querySelector("#text");
    }

    //  private methods have _ prefix
    _render() {
        console.log("cpt.render()");
        // selectively update template content
        this._$text.innerText = "from the renderer ...";
    }

    // Attributes
    // observing attibute changes, and rect to them
    static get observedAttributes() {
        console.log("cpt.observedAttributes()");
        return ["an-important-attribute"];
    }

    attributeChangedCallback(name, old, nyoo) {
        console.log("cpt.attributeChangedCallback()");
        // ...
    }

    // API, e.g. for property1
    set property1(data) {
        console.log("cpt. set property()");
        if (this._private1 === data) {
            return;
        }
        else {
            this._private1 = data; 
        }
    }

    get property1() {
        console.log("cpt. get property()");
        return this._private1
    }



}

window.customElements.define("mtk-scaffold", MtkScaffold);

