class MtkRandomQuote extends HTMLElement {
    constructor() {
        super();
        this._quotes = ["A", "B", "D", "E", "F", "G", "H"];
        // reference to DOM element will have access to querySelector etc ...
        this._$quote = null;
        // holds reference to interval instance
        this._interval = null;
    }

    connectedCallback() {
        const template = `
<style>
</style>
<div>
    <h1>random quote</h1>
    <p>
        <span id="quote">

        </span>
    </p>
</div>
`;

        // note es2015 classes don't have concept of private variables instead use _ convention
        this.innerHTML = template;
        this._$quote = this.querySelector("#quote");
        this._interval = setInterval(() => this._render(), 250);
        this._render();
    }

    _render() {
        // only update parts that need to change
        if (this._$quote !== null) {
            const r = Math.floor(Math.random() * this._quotes.length);
            this._$quote.innerHTML = this._quotes[r];
        }
    }

    disconnectedCallback() {
        clearInterval(this._interval);
    }
}

window.customElements.define("mtk-random-quote", MtkRandomQuote);