const $ownerDocument = (document._currentScript || document.currentScript).ownerDocument;
$template = $ownerDocument.querySelector("template");
class MyComponent extends HTMLElement {
    connectedCallback() {
        const $templateClone = document.importNode($template.content, true);
        this.appendChild($templateClone);
    }
}
window.customElements.define("my-component", MyComponent);

