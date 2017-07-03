/*
 - setter for the url set url(url)
 - setter for the url set refreshRate(url)
 - cf Kendo : dataSource
 - cf       : KendoGrid ;  GRID ; GRID ; EXCEL ;

 - columnMeta :
    [
      {i:0, name:ver, title:Version, types:"string|string-date|number|bool|any" },
      ...
    ]
 - strings-left ; numbers-right ; default number is 2dp ; bool-middle ; dt-middle
 - sorting    : ?persistence
 - filtering  : ?persistence
 - width?
 - fixedColumn
 - autoRefresh
 - spinner
*/

console.log("mash-grid");

class MashGrid extends HTMLElement {
    // +ctor
    constructor() {
        super();

        this._root = this._getShadowRoot();

        // get config for this instance
        let defaultConfig = this._getDefaultConfig();

        this._config = this._getExtendedConfig(defaultConfig, {});
    }

    _getShadowRoot() {
        let $shadowRoot = this.attachShadow({ mode: "open" });
        return $shadowRoot;
    }

    // ^connected/disconnected
    connectedCallback() {
        this._initModel(this._config);
    }

    _initModel(config) {
        if (config) {
            if (config.data.indexOf("stub") !== -1) {
                // stub some data for testing
                const model = this._getInitModel();

                // the model changing initiates the render
                this._setModel(model);
            }
            else {
                const jaxiSettings = { url: "./perf1.json", done: this._jaxiDone.bind(this), fail: this._jaxiFail.bind(this) };
                jaxi(jaxiSettings);
            }
        }
    }

    _jaxiDone(jaxiResponse) {
        const model = jaxiResponse.data;

        // the model changing initiates the render
        this._setModel(model);
    }

    //
    _jaxiFail(jaxiResponse) {
        console.log("jaxi-fail");
    }

    // ^connected/disconnected
    disconnectedCallback() { }

    //# attributes
    static get observedAttributes() {
        return ["config"];
    }

    //# attributes
    attributeChangedCallback(attributeName, oldValue, newValue) {
        switch (attributeName) {
            case "config":
                var config = MashGrid.jsonParse(newValue);
                this._config = this._getExtendedConfig(this._config, config);
                break;

            default:
                break;
        }
    }

    static jsonParse(newValue) {
        let obj = null;
        try {
            obj = JSON.parse(newValue);
        } catch (e) {
            console.log(`exception JSON parse : ${newValue}`);
        }
        return obj;
    }

    static getRow(row, config) {
        // Object.keys -> get the keys of the object {a:1,b:"A"} -> ["a","b"]
        // .map        -> for the row, map { a: 1, b: "A" } -> ["<td>1</td>", "<td>A</td>"]
        // .reduce     -> ["<td>1</td>", "<td>A</td>"] -> "<td>1</td><td>A</td>"
        // and clamp in that in a tr tag
        var trow = Object.keys(row)
            .map(key => `<td>${row[key]}</td>`)
            .reduce((acc, val) => acc + val, "<tr>") + "</tr>";

        // Return
        return trow;
    };

    static getVisual(model, config) {
        // the visual that should be rendered on the page
        const visual = {};

        // does the page have template for this component?
        const $template = document.getElementById("tr-template");

        if (!$template) {
            // construct string-html-table, which assigned to visual and is then rendered later by the renderer
            const style = `<style></style>`;

            // Table

            // thead : use first row of data for the headers
            var thead = Object.keys(model[0])
                .map(propertyName => `<th>${propertyName}</th>`)
                .reduce((acc, val) => acc + val, "<thead><tr>") + "</tr></thead>";
            // tbody : for each row, get string-html and add it all up
            var tbody = model
                .map(modelItem => MashGrid.getRow(modelItem, config))
                .reduce((acc, val) => acc + val, "<tbody>") + "</tbody>";
            // tfoot
            let tfoot = ``;

            //
            let table = `<table>${thead}${tbody}${tfoot}</table>`;

            // string-html
            var html = `${style}${table}`;

            //  assign the string-html to the visual
            visual.html = html;
        }

        // if there is a <template>, set elements
        if ($template) {
            // construct dom-elements, which assigned to visual and is then rendered later by the renderer
            var elements = [];

            model.forEach((m) => {
                let $clone = document.importNode($template.content, true);
                $clone.querySelectorAll("td")[0].innerText = m["c0"];
                $clone.querySelectorAll("td")[1].innerText = m["c1"];
                elements.push($clone);
            });

            //  assign the dom-nodes to the visual
            visual.elements = elements;
        }

        // Return
        return visual;
    }

    //# _private

    _getDefaultConfig() {
        return { data: "stub-5" };
    }

    _getExtendedConfig(defaultConfig, overrideConfig) {
        let ret = defaultConfig;

        if (!!overrideConfig) {
            this._mutateProp(overrideConfig, ret, "data");
            this._mutateProp(overrideConfig, ret, "stubRows");
            this._mutateProp(overrideConfig, ret, "stubCols");
        }

        return ret;
    }

    _mutateProp(source, target, propName) {
        var v = source[propName];
        if (source[propName] !== undefined) {
            target[propName] = source[propName];
        }
    }

    _getInitModel(config) {
        // how many stub elements
        //let I = 1;
        let I = 10;    //  200ms
        //let I = 100;   //  220ms
        //let I = 1000;  //  400ms
        //let I = 10000;   //1.2  secs

        let J = 3;

        I = this._config.stubRows;
        J = this._config.stubCols;

        // create an array of stub elements
        var xs = [];
        for (var i = 0; i < I; i++) {
            var x = {};
            for (var j = 0; j < J; j++) {
                var val = `a${i}${j}`;
                x[`c${j}`] = val;
            }
            xs.push(x);
        }

        // Return
        return xs;
    }

    _view(model) {
        // get a visual for the model, given the configuration
        let visual = MashGrid.getVisual(model, this._config);

        // return the visual
        return visual;
    }

    _render(visual) {
        // render the HTML

        //////////////////////////////////
        if (visual.html) {
            var html = visual.html;
            this._root.innerHTML = html;
        }

        //if (visual.elements) {
        //
        //    var html = "<table></table>";
        //    this._root.innerHTML = html;
        //
        //    const $target = document.getElementById( "mashgrid" );
        //
        //    //console.log($target);
        //    var $tables = this._root.querySelectorAll("table");
        //    var $table = $tables[0];
        //    //console.log($table);
        //
        //    visual.elements.forEach(($e) => {
        //        $table.appendChild($e);
        //    });
        //
        //}
    }

    _update(model, msg) {
        //  construct a new model
        const newModel = model;

        // given a UI event message, adjust the new model
        // ...

        // return new model
        return newModel;
    }

    _setModel(model) {
        // caller is changing the model
        this._model = model;

        // get a visual, for the current model
        this._visual = this._view(this._model);

        // render the visual to screen
        this._render(this._visual);
    }
}

window.customElements.define("mash-grid", MashGrid);

function jaxi(jaxiSettings) {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", jaxiSettings.url);

    xhr.responeType = "json";

    // when xhr is done, call done callback
    xhr.onload = function () {
        if (this.status === 200) {
            var jsonString = this.response;
            // parse the response to get JS object
            var data = JSON.parse(jsonString);
            jaxiSettings.done({ jsonString: jsonString, data: data });
        }
    };

    // if fail the call fail callback
    xhr.onerror = function () {
        //console.log("xhr error");
        jaxiSettings.fail("FAIL");
    }

    xhr.send();
};