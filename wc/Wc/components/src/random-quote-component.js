const innerHtml = `
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


const $ownerDocument = document.currentScript.ownerDocument;
const $template = $ownerDocument.querySelector("template");

class MtkRandomQuote extends HTMLElement {
    constructor() {
        super();
        this._quotes = ["A", "B", "C"];
        this._$quote = null ;    // reference to dom element  will have access to queryelector etc ...
        this._interval = null ;  // holds reference to interval instance
    }

    connectedCallback() {
        // note es2015 classes dont have concept of private variables instead use _ convention
        this.innerHTML = innerHtml;
        this._$quote = this.querySelector("#quote");
        this._interval = setInterval( () => this._render() , 1000) ; 
        this._render();
    }

    _render(){
        if( this._$quote !== null ){
            const r  = Math.floor(Math.random() * this._quotes.length ) ; 
            this._$quote.innerHTML = this._quotes[r];
        }
    }

    disconnectedCallback(){
        clearInterval( this._interval);
    }

}

window.customElements.define("mtk-random-quote", MtkRandomQuote);


/*
</script>
<template>
    <style>
    </style>
    <div>
        <h1>random quote</h1>
        <p>
            <span id="quote">

            </span>
        </p>
    </div>
</template>
*/

