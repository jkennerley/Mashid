let MashGridCommand = { "sort": 1, "filter": 2 };
let MashGridSortOrder = { "Asc": 1, "Desc": -1 };

class MashGrid extends HTMLElement {
    _getShadowRoot() {
        const $shadowRoot = this.attachShadow({ mode: "open" });
        return $shadowRoot;
    }

    _getDefaultConfig() {
        // the default config is some stub data if nothing is passed by the client
        return { url: "stub" };
    }

    // +ctor
    constructor() {
        super();

        this._model = { "grids": [] };

        this._root = this._getShadowRoot();

        // get config for this instance, using a default config
        this._config = this._getExtendedConfig(this._getDefaultConfig(), {});
    }

    // ^connected/disconnected
    connectedCallback() {
        this._initModel(this._config);
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
                {
                    const config = MashGrid.jsonParse(newValue);
                    this._config = this._getExtendedConfig(this._config, config);
                }
                break;

            default:
                break;
        }
    }

    _getExtendedConfig(defaultConfig, overrideConfig) {
        const ret = defaultConfig;

        if (!!overrideConfig) {
            this._mutateProp(overrideConfig, ret, "url");
            this._mutateProp(overrideConfig, ret, "stubRows");
            this._mutateProp(overrideConfig, ret, "stubCols");
        }

        return ret;
    }

    _mutateProp(source, target, propName) {
        if (source[propName] !== undefined) {
            target[propName] = source[propName];
        }
    }

    _getInitModel(config) {
        // how many stub elements
        let imax = 10;
        let jmax = 3;

        imax = config.stubRows;
        jmax = config.stubCols;

        // create an array of stub elements
        const xs = [];

        for (let i = 0; i < imax; i++) {
            const x = {};
            for (let j = 0; j < jmax; j++) {
                const val = `a${i}${j}`;
                x[`c${j}`] = val;
            }
            xs.push(x);
        }

        // Return
        return xs;
    }

    static getRow(row) {
        // Object.keys -> get the keys of the object {a:1,b:"A"} -> ["a","b"]
        // .map        -> for the row, map { a: 1, b: "A" } -> ["<td>1</td>", "<td>A</td>"]
        // .reduce     -> ["<td>1</td>", "<td>A</td>"] -> "<td>1</td><td>A</td>"
        //   and clamp in that in a tr tag
        const trow = Object.keys(row)
            .map(key => `<td>${row[key]}</td>`)
            .reduce((acc, val) => acc + val, "<tr>") + "</tr>";

        // Return
        return trow;
    }

    static getVisual(model) {
        // the visual that should be rendered on the page
        const visual = {};

        // does the page have template for this component?
        const $template = document.getElementById("tr-template");

        if (!$template) {
            // construct string-html-table, which assigned to visual and is then rendered later by the renderer
            const style = `<style></style>`;

            // Table

            // thead : use first row of data for the headers
            const thead = Object.keys(model[0])
                .map(propertyName => `<th>${propertyName}</th>`)
                .reduce((acc, val) => acc + val, "<thead><tr>") + "</tr></thead>";
            // tbody : for each row, get string-HTML and add it all up
            const tbody = model
                .map(modelItem => MashGrid.getRow(modelItem))
                .reduce((acc, val) => acc + val, "<tbody>") + "</tbody>";
            // tfoot
            const tfoot = ``;

            //
            const table = `<table>${thead}${tbody}${tfoot}</table>`;

            // string-HTML
            const html = `${style}${table}`;

            //  assign the string-HTML to the visual
            visual.html = html;
        }

        // if there is a <template>, set elements
        if ($template) {
            // construct DOM-elements, which assigned to visual and is then rendered later by the renderer
            const elements = [];

            model.forEach((m) => {
                const $clone = document.importNode($template.content, true);
                $clone.querySelectorAll("td")[0].innerText = m["c0"];
                $clone.querySelectorAll("td")[1].innerText = m["c1"];
                elements.push($clone);
            });

            //  assign the DOM-nodes to the visual
            visual.elements = elements;
        }

        // Return
        return visual;
    }

    _view(model) {
        // get a visual for the model, given the configuration
        const visual = MashGrid.getVisual(model, this._config);

        // return the visual
        return visual;
    }

    _render(visual) {
        /// Render the HTML

        if (visual.html) {
            // string-HTML
            this._root.innerHTML = visual.html;
        }

        // sort click event listeners for each of the headings
        let $ths = this._root.querySelectorAll("th");
        $ths.forEach(($th) => {
            $th.addEventListener("click", (event) => {
                this._onSortEvent({ "propertyName": event.target.innerText, "ctrlKey": event.ctrlKey });
            });
        });

        let $tds = this._root.querySelectorAll("td");

        $tds.forEach(($td) => {
            $td.addEventListener("dblclick", (event) => {
                if (event.ctrlKey === true) {
                    // fire the filter event
                    this._onFilterEvent({ "propertyName": propertyName, "filterValue": filterValue, "ctrlKey": event.ctrlKey, "option": "unset" });
                } else {
                    // get property-name (column-name) that will be filtered
                    //  the td-column-index of the td column the user clicked in e.g. the 3rd column
                    const cellIndex = $td.cellIndex;
                    const $theThOfTheColumnClicked = $ths[cellIndex];
                    //  the inner text of the th has the propertyName
                    const propertyName = $theThOfTheColumnClicked.innerText;

                    // the filter value is the text that is selected by the user on the td element of browser table cell
                    const filterValue = window.getSelection().toString();

                    // fire the filter event
                    this._onFilterEvent({ "propertyName": propertyName, "filterValue": filterValue, "ctrlKey": event.ctrlKey, "option": "set" });
                }
            });
        });

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

    _setModel(model) {
        // get a grid
        const grid = { "id": model.url, "xs": model.xs, "ys": model.xs };
        // assign the grid to the current model
        this._model.grids[0] = grid;

        // given the current the current model, get a visual,
        // and assign that visual to this._visual
        this._visual = this._view(this._model.grids[0].ys);

        // render the current visual to screen
        this._render(this._visual);
    }

    _getComparator(propertyName, sortOrder) {

        const stringComparator = (l, r) => {
            let ret = 0;

            var left = l[propertyName].toUpperCase();
            var right = r[propertyName].toUpperCase();

            if (left < right) {
                ret = -1;
            }
            if (left > right) {
                ret = 1;
            }

            ret = ret * sortOrder;
            return ret;
        };

        //const numberComparator = (l, r) => {
        //    let ret = l[propertyName] - r[propertyName];
        //    ret = ret * sortOrder;
        //    return ret;
        //}

        let generalComparator = (l, r) => {
            let ret = 0;

            let left = l[propertyName];
            let right = r[propertyName];

            let typeofLeft = typeof left;
            let typeofRight = typeof right;

            if (typeofLeft !== typeofRight) {
                left = (left == null) ? "null" : left;
                right = (right == null) ? "null" : right;

                left = left.toString();
                right = right.toString();
            }

            if (typeofLeft === "string" && typeofRight === "string") {
                if (left < right) {
                    ret = -1;
                }
                if (left > right) {
                    ret = 1;
                }
            }
            else if (typeofLeft === "object" && typeofRight === "object") {
                ret = 0;
            }
            else if (typeofLeft === "boolean" && typeofRight === "boolean") {
                if (left < right) {
                    ret = -1;
                }
                if (left > right) {
                    ret = 1;
                }
            }
            else {
                ret = left - right;
            }

            // Return
            ret = ret * sortOrder;
            return ret;
        }

        let comparator = null;

        switch (propertyName) {
            case "c3":
                comparator = stringComparator;
                break;
            default:
                //comparator = numberComparator;
                comparator = generalComparator;
        }

        // Return
        return comparator;
    }

    _update(msg, model) {
        //  construct a new model
        const newModel = model;

        switch (msg.cmd) {
            case MashGridCommand.sort:
                {
                    // given a UI event message, adjust the new model
                    const fieldName = msg.propertyName;

                    // all of the xs are maybe sorted and filtered
                    const ys = this._model.grids[0].xs;

                    // get the comparator given the field name
                    const comparator = this._getComparator(fieldName, msg.sortOrder);

                    // sort those that will be rendered
                    ys.sort(comparator);

                    // TEMP THING ...
                    // assign the ys back to the xs, so the filtering happen on sorted data
                    this._model.grids[0].xs = ys;

                    // save the sorted ys onto this
                    this._model.grids[0].ys = ys;

                    // get and assign a visual, using the current the current model
                    this._visual = this._view(this._model.grids[0].ys);

                    // render the visual to screen
                    this._render(this._visual);
                }
                // return new model
                break;

            case MashGridCommand.filter:
                {
                    if (msg.option === "set") {
                        // get the xs, that will be filtered filter
                        let ys = this._model.grids[0].xs;

                        // apply the filter
                        var ysFiltered = ys.filter(function (y) {
                            const propertyValue = y[msg.propertyName];
                            const found = propertyValue.indexOf(msg.filterValue);
                            const ret = (found > -1) ? true : false;
                            return ret;
                        });

                        // save the sorted ys onto this
                        this._model.grids[0].ys = ysFiltered;

                        // get and assign a visual, using the current the current model
                        this._visual = this._view(this._model.grids[0].ys);

                        // render the visual to screen
                        this._render(this._visual);
                    }

                    if (msg.option === "unset") {
                        // get the xs, that will be filtered filter
                        const ys = this._model.grids[0].xs;

                        // save the sorted ys onto this
                        this._model.grids[0].ys = ys;

                        // get and assign a visual, using the current the current model
                        this._visual = this._view(this._model.grids[0].ys);

                        // render the visual to screen
                        this._render(this._visual);
                    }
                }
                // return new model
                break;

            default:
                break;
        }

        return newModel;
    }

    _onFilterEvent(event) {
        // this._onFilterEvent({ "propertyName": event.target.innerText, "filterValue": filterValue, "ctrlKey": event.ctrlKey });
        if (event.ctrlKey === true) {
            const msg = { "cmd": MashGridCommand.filter, "propertyName": event.propertyName, "filterValue": event.filterValue, "option": event.option };
            this._update(msg, this._model);
        }
        else {
            const msg = { "cmd": MashGridCommand.filter, "propertyName": event.propertyName, "filterValue": event.filterValue, "option": event.option };
            this._update(msg, this._model);
        }
    }

    _onSortEvent(event) {
        if (event.ctrlKey === true) {
            const msg = { "cmd": MashGridCommand.sort, "propertyName": event.propertyName, "sortOrder": MashGridSortOrder.Desc };
            this._update(msg, this._model);
        }
        else {
            const msg = { "cmd": MashGridCommand.sort, "propertyName": event.propertyName, "sortOrder": MashGridSortOrder.Asc };
            this._update(msg, this._model);
        }
    }

    _jaxiDone(jaxiResponse) {
        const xs = jaxiResponse.xs;
        const url = jaxiResponse.url;

        // the model changing initiates the render
        this._setModel({ url, xs });
    }

    _jaxiFail(jaxiResponse) {
        //console.log("jaxi-fail");
    }

    static jsonParse(newValue) {
        let obj = null;
        try {
            obj = JSON.parse(newValue);
        } catch (e) {
            //console.log(`exception JSON parse : ${newValue}`);
        }
        return obj;
    }

    _jaxi(jaxiSettings) {
        const url = jaxiSettings.url;

        const xhr = new XMLHttpRequest();

        xhr.open("GET", url);

        xhr.responeType = "json";

        // when xhr is done, call done callback
        xhr.onload = function () {
            if (this.status === 200) {
                const jsonString = this.response;

                // parse the response json string to get JS object
                const xs = JSON.parse(this.response);

                // call done with the the data return from the server
                jaxiSettings.done({ jsonString, xs, url });
            }
        };

        // if fail the call fail callback
        xhr.onerror = function () {
            jaxiSettings.fail("jaxi fail");
        }

        xhr.send();
    }

    _initModel(config) {
        if (config) {
            const url = config.url;

            if (url.indexOf("stub") !== -1) {
                //// stub some data for testing
                //const model = this._getInitModel();
                //
                //// the model changing initiates the render
                //this._setModel(model);
            }
            else {
                const jaxiSettings = { "url": url, "done": this._jaxiDone.bind(this), "fail": this._jaxiFail.bind(this) };

                this._jaxi(jaxiSettings);
            }
        }
    }
}

window.customElements.define("mash-grid", MashGrid);
