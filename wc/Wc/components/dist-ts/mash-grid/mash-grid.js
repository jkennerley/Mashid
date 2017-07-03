var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MashGridCommand = { "sort": 1, "filter": 2 };
var MashGridSortOrder = { "Asc": 1, "Desc": -1 };
var MashGrid = (function (_super) {
    __extends(MashGrid, _super);
    function MashGrid() {
        var _this = _super.call(this) || this;
        _this._model = { "grids": [] };
        _this._root = _this._getShadowRoot();
        _this._config = _this._getExtendedConfig(_this._getDefaultConfig(), {});
        return _this;
    }
    MashGrid.prototype._getShadowRoot = function () {
        var $shadowRoot = this.attachShadow({ mode: "open" });
        return $shadowRoot;
    };
    MashGrid.prototype._getDefaultConfig = function () {
        return { url: "stub" };
    };
    MashGrid.prototype.connectedCallback = function () {
        this._initModel(this._config);
    };
    MashGrid.prototype.disconnectedCallback = function () { };
    Object.defineProperty(MashGrid, "observedAttributes", {
        get: function () {
            return ["config"];
        },
        enumerable: true,
        configurable: true
    });
    MashGrid.prototype.attributeChangedCallback = function (attributeName, oldValue, newValue) {
        switch (attributeName) {
            case "config":
                {
                    var config = MashGrid.jsonParse(newValue);
                    this._config = this._getExtendedConfig(this._config, config);
                }
                break;
            default:
                break;
        }
    };
    MashGrid.prototype._getExtendedConfig = function (defaultConfig, overrideConfig) {
        var ret = defaultConfig;
        if (!!overrideConfig) {
            this._mutateProp(overrideConfig, ret, "url");
            this._mutateProp(overrideConfig, ret, "stubRows");
            this._mutateProp(overrideConfig, ret, "stubCols");
        }
        return ret;
    };
    MashGrid.prototype._mutateProp = function (source, target, propName) {
        if (source[propName] !== undefined) {
            target[propName] = source[propName];
        }
    };
    MashGrid.prototype._getInitModel = function (config) {
        var imax = 10;
        var jmax = 3;
        imax = config.stubRows;
        jmax = config.stubCols;
        var xs = [];
        for (var i = 0; i < imax; i++) {
            var x = {};
            for (var j = 0; j < jmax; j++) {
                var val = "a" + i + j;
                x["c" + j] = val;
            }
            xs.push(x);
        }
        return xs;
    };
    MashGrid.getRow = function (row) {
        var trow = Object.keys(row)
            .map(function (key) { return "<td>" + row[key] + "</td>"; })
            .reduce(function (acc, val) { return acc + val; }, "<tr>") + "</tr>";
        return trow;
    };
    MashGrid.getVisual = function (model) {
        var visual = {};
        var $template = document.getElementById("tr-template");
        if (!$template) {
            var style = "<style></style>";
            var thead = Object.keys(model[0])
                .map(function (propertyName) { return "<th>" + propertyName + "</th>"; })
                .reduce(function (acc, val) { return acc + val; }, "<thead><tr>") + "</tr></thead>";
            var tbody = model
                .map(function (modelItem) { return MashGrid.getRow(modelItem); })
                .reduce(function (acc, val) { return acc + val; }, "<tbody>") + "</tbody>";
            var tfoot = "";
            var table = "<table>" + thead + tbody + tfoot + "</table>";
            var html = "" + style + table;
            visual.html = html;
        }
        if ($template) {
            var elements_1 = [];
            model.forEach(function (m) {
                var $clone = document.importNode($template.content, true);
                $clone.querySelectorAll("td")[0].innerText = m["c0"];
                $clone.querySelectorAll("td")[1].innerText = m["c1"];
                elements_1.push($clone);
            });
            visual.elements = elements_1;
        }
        return visual;
    };
    MashGrid.prototype._view = function (model) {
        var visual = MashGrid.getVisual(model, this._config);
        return visual;
    };
    MashGrid.prototype._render = function (visual) {
        var _this = this;
        if (visual.html) {
            this._root.innerHTML = visual.html;
        }
        var $ths = this._root.querySelectorAll("th");
        $ths.forEach(function ($th) {
            $th.addEventListener("click", function (event) {
                _this._onSortEvent({ "propertyName": event.target.innerText, "ctrlKey": event.ctrlKey });
            });
        });
        var $tds = this._root.querySelectorAll("td");
        $tds.forEach(function ($td) {
            $td.addEventListener("dblclick", function (event) {
                if (event.ctrlKey === true) {
                    _this._onFilterEvent({ "propertyName": propertyName, "filterValue": filterValue, "ctrlKey": event.ctrlKey, "option": "unset" });
                }
                else {
                    var cellIndex = $td.cellIndex;
                    var $theThOfTheColumnClicked = $ths[cellIndex];
                    var propertyName = $theThOfTheColumnClicked.innerText;
                    var filterValue = window.getSelection().toString();
                    _this._onFilterEvent({ "propertyName": propertyName, "filterValue": filterValue, "ctrlKey": event.ctrlKey, "option": "set" });
                }
            });
        });
    };
    MashGrid.prototype._setModel = function (model) {
        var grid = { "id": model.url, "xs": model.xs, "ys": model.xs };
        this._model.grids[0] = grid;
        this._visual = this._view(this._model.grids[0].ys);
        this._render(this._visual);
    };
    MashGrid.prototype._getComparator = function (propertyName, sortOrder) {
        var stringComparator = function (l, r) {
            var ret = 0;
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
        var generalComparator = function (l, r) {
            var ret = 0;
            var left = l[propertyName];
            var right = r[propertyName];
            var typeofLeft = typeof left;
            var typeofRight = typeof right;
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
            ret = ret * sortOrder;
            return ret;
        };
        var comparator = null;
        switch (propertyName) {
            case "c3":
                comparator = stringComparator;
                break;
            default:
                comparator = generalComparator;
        }
        return comparator;
    };
    MashGrid.prototype._update = function (msg, model) {
        var newModel = model;
        switch (msg.cmd) {
            case MashGridCommand.sort:
                {
                    var fieldName = msg.propertyName;
                    var ys = this._model.grids[0].xs;
                    var comparator = this._getComparator(fieldName, msg.sortOrder);
                    ys.sort(comparator);
                    this._model.grids[0].xs = ys;
                    this._model.grids[0].ys = ys;
                    this._visual = this._view(this._model.grids[0].ys);
                    this._render(this._visual);
                }
                break;
            case MashGridCommand.filter:
                {
                    if (msg.option === "set") {
                        var ys = this._model.grids[0].xs;
                        var ysFiltered = ys.filter(function (y) {
                            var propertyValue = y[msg.propertyName];
                            var found = propertyValue.indexOf(msg.filterValue);
                            var ret = (found > -1) ? true : false;
                            return ret;
                        });
                        this._model.grids[0].ys = ysFiltered;
                        this._visual = this._view(this._model.grids[0].ys);
                        this._render(this._visual);
                    }
                    if (msg.option === "unset") {
                        var ys = this._model.grids[0].xs;
                        this._model.grids[0].ys = ys;
                        this._visual = this._view(this._model.grids[0].ys);
                        this._render(this._visual);
                    }
                }
                break;
            default:
                break;
        }
        return newModel;
    };
    MashGrid.prototype._onFilterEvent = function (event) {
        if (event.ctrlKey === true) {
            var msg = { "cmd": MashGridCommand.filter, "propertyName": event.propertyName, "filterValue": event.filterValue, "option": event.option };
            this._update(msg, this._model);
        }
        else {
            var msg = { "cmd": MashGridCommand.filter, "propertyName": event.propertyName, "filterValue": event.filterValue, "option": event.option };
            this._update(msg, this._model);
        }
    };
    MashGrid.prototype._onSortEvent = function (event) {
        if (event.ctrlKey === true) {
            var msg = { "cmd": MashGridCommand.sort, "propertyName": event.propertyName, "sortOrder": MashGridSortOrder.Desc };
            this._update(msg, this._model);
        }
        else {
            var msg = { "cmd": MashGridCommand.sort, "propertyName": event.propertyName, "sortOrder": MashGridSortOrder.Asc };
            this._update(msg, this._model);
        }
    };
    MashGrid.prototype._jaxiDone = function (jaxiResponse) {
        var xs = jaxiResponse.xs;
        var url = jaxiResponse.url;
        this._setModel({ url: url, xs: xs });
    };
    MashGrid.prototype._jaxiFail = function (jaxiResponse) {
    };
    MashGrid.jsonParse = function (newValue) {
        var obj = null;
        try {
            obj = JSON.parse(newValue);
        }
        catch (e) {
        }
        return obj;
    };
    MashGrid.prototype._jaxi = function (jaxiSettings) {
        var url = jaxiSettings.url;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responeType = "json";
        xhr.onload = function () {
            if (this.status === 200) {
                var jsonString = this.response;
                var xs = JSON.parse(this.response);
                jaxiSettings.done({ jsonString: jsonString, xs: xs, url: url });
            }
        };
        xhr.onerror = function () {
            jaxiSettings.fail("jaxi fail");
        };
        xhr.send();
    };
    MashGrid.prototype._initModel = function (config) {
        if (config) {
            var url = config.url;
            if (url.indexOf("stub") !== -1) {
            }
            else {
                var jaxiSettings = { "url": url, "done": this._jaxiDone.bind(this), "fail": this._jaxiFail.bind(this) };
                this._jaxi(jaxiSettings);
            }
        }
    };
    return MashGrid;
}(HTMLElement));
window.customElements.define("mash-grid", MashGrid);
//# sourceMappingURL=mash-grid.js.map