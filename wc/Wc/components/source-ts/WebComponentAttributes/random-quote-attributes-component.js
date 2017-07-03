class MtkRandomQuote extends HTMLElement {
    constructor() {
        super();
        this._quotes = ["A", "B", "C", "D", "E", "F", "G", "H"];
        this._$quote = null;
        this._interval = null;
    }

    connectedCallback() {

        const innerHtml = `
            <style>
            </style>
            <div>
                <h1>random quote :: </h1>
                <p>
                    <span id="quote"></span>
                </p>
            </div>
            `;


        this.innerHTML = innerHtml;

        this._$quote = this.querySelector("#quote");

        this._interval = setInterval(() => this._render(), 10000);

        // use the markup interval attribute, to set the interval fun call back
        this._setInterval(this.getAttribute("interval"));

        this._render();
    }

    _render() {
        if (this._$quote !== null) {
            const r = Math.floor(Math.random() * this._quotes.length);
            this._$quote.innerHTML = this._quotes[r];
        }
    }

    _setInterval(value) {
        // kills of any existing interval and starts a new with time by the caller
        if (this._interval !== null) {
            clearInterval(this._interval);
        }
        if (value > 0) {
            this._interval = setInterval(() => this._render(), value);
        }
    }

    disconnectedCallback() {
        clearInterval(this._interval);
    }

    // observe some attributes, use the observedAttributes static method, 
    // it returns an array of attributes to be observed
    static get observedAttributes() {
        // this WC has attribute called interval
        return ["interval"];
    }

    // when the attribute changes
    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`attributeChangedCallback( ${name}, ${oldValue}, ${newValue} `);
        this._setInterval(newValue);
    }

}

window.customElements.define("mtk-random-quote", MtkRandomQuote);

