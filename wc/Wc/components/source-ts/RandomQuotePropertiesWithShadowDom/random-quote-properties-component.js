const innerHtml = `
<style>
    .selected {
        color: wheat;
        background-color:green ;
    }
</style>

<div>
    <h3 id="question"></h3>
    <ul id="answers"></ul>
</div>
`;

class MtkRandomQuote extends HTMLElement {
    constructor() {
        super();
        this._attached = false;

        this._data = { question: "Is 1+1 = 2?", answers: ["Yes", "No"] };
        //this._data = { question: "Is ONE+ONE = TWO?", answers: ["YEP", "Nuurh"] };
        //this._data = null;

        this._selected = null;
        // elements
        this._$question = null;
        this._$answers = null;

        // when we intro the shadow dom
        // place elements in the subdom tree
        // and select the elements there as well
        // store reference to the shadow root in private var
        // interact with the shadow root instead of the elements direct elements
        this._root = this.attachShadow({ "mode": "open" });
        



    }

    connectedCallback() {
        this._attached = true;

        //this.innerHTML = innerHtml; // this refers to the direct children of the cpt
        this._root.innerHTML = innerHtml; // this refers to the direct children of the cpt

        // this._$question = this.querySelector("#question"); // this refers to the direct children of the cpt
        // this._$answers = this.querySelector("#answers");   // this refers to the direct children of the cpt
        this._$question = this._root.querySelector("#question"); // this refers to the direct children of the cpt
        this._$answers = this._root.querySelector("#answers");   // this refers to the direct children of the cpt

        this._$answers.addEventListener("click", (event) => {
            this._$answers.querySelectorAll("li").forEach(($li, index) => {
                $li.classList.remove("selected");
                if ($li === event.target) {
                    this.selected = index;
                }
            });
        });
        this._render();
    }

    _render() {
        if (this._attached && this._data !== null) {
            this._$answers.innerHTML = "";
            this._$question.innerHTML = this._data.question;
            this._data.answers.forEach((answer) => {
                const $li = document.createElement("li");
                $li.innerHTML = answer;
                this._$answers.appendChild($li);
            });
        }
    }

    set data(data) {
        if (this.data === data) {
            return;
        }
        else {
            this._data = data;
            this._render();
        }
    }
    get data() {
        return this._data;
    }

    set selected(index) {
        const $answer = this._$answers.querySelector(`li:nth-child(${index + 1})`);
        if ($answer !== null) {
            const $lis1 = this._$answers.querySelector("li");
            const $lis2 = this._$answers.querySelectorAll("li");
            if ($lis2) {
                this._$answers.querySelectorAll("li").forEach(($li) => {
                    $li.classList.remove("selected");
                });
            }

            $answer.classList.add("selected");
            this._selected = index;
        }
    }
    get selected() {
        return this._selected;
    }
}

window.customElements.define("mtk-random-quote", MtkRandomQuote);