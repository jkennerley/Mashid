class AppDrawComponent extends HTMLElement
{
    //constructor() {
    //    super();
    //    //console.log("CustomElement.ctor for the custom element");
    //}

    connectedCallback() {

        const html = `
            <style>
                p{color:red}
            </style>
            <p>from inside the web component</p>
            `;

        this.innerHTML = html; 

    }

}


window.customElements.define("appdraw-component", AppDrawComponent);