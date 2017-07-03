class VanillaElement extends HTMLElement {

    constructor() {

        super();

        console.log("ce.ctor() ...");
    }

    connectedCallback() {
        console.log("ce.connectedCallback, connected to the dom ...");
    }

    static get observedAttributes() {
        return ["demo"];
    }

    attributeChangedCallback(name, oldValue, newValue) {

        console.log("ce.attributeChangedCallback, attribute has been changed ...");

        console.log(oldValue, newValue);
    }

    disconnectedCallback() {
        console.log("ce.disconnectedCallback, disconnected from the DOM. Cleanup ...");
    }

}

window.customElements.define("vanilla-element", VanillaElement);

