class MtkRandomQuote extends HTMLElement {
    constructor() {
        super();
        this._attached = false;

        this._data = { question: "Is 1+1 = 2?", answers: ["Yes", "No"] };
        //this._data = null;

        this._selected = null;

        // elements
        this._$question = null;
        this._$answers = null;
    }

    connectedCallback() {

        this._attached = true;

        this.innerHTML = `
            <style>
                .selected {
                    color: green ;
                    background-color:wheat;
            }
            </style>
            <div>
                <h3 id="question"></h3>
                <ul id="answers"></ul>
            </div>
        `;

        this._$question = this.querySelector("#question");
        this._$answers = this.querySelector("#answers");
        this._$answers.addEventListener("click", (event) => {
            this._$answers.querySelectorAll("li").forEach(($li, index) => {
                $li.classList.remove("selected");
                if ($li === event.target) {
                    this._selected = index;
                    $li.classList.add("selected");
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
