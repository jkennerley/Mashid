(function (f) { if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
}
else if (typeof define === "function" && define.amd) {
    define([], f);
}
else {
    var g;
    if (typeof window !== "undefined") {
        g = window;
    }
    else if (typeof global !== "undefined") {
        g = global;
    }
    else if (typeof self !== "undefined") {
        g = self;
    }
    else {
        g = this;
    }
    g.assert = f();
} })(function () {
    var define, module, exports;
    return (function e(t, n, r) { function s(o, u) { if (!n[o]) {
        if (!t[o]) {
            var a = typeof require == "function" && require;
            if (!u && a)
                return a(o, !0);
            if (i)
                return i(o, !0);
            var f = new Error("Cannot find module '" + o + "'");
            throw (f.code = "MODULE_NOT_FOUND", f);
        }
        var l = n[o] = { exports: {} };
        t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e); }, l, l.exports, e, t, n, r);
    } return n[o].exports; } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++)
        s(r[o]); return s; })({ 1: [function (_dereq_, module, exports) {
                'use strict';
                var baseAssert = _dereq_('assert');
                var _deepEqual = _dereq_('universal-deep-strict-equal');
                var empower = _dereq_('empower');
                var formatter = _dereq_('power-assert-formatter');
                var extend = _dereq_('xtend');
                var define = _dereq_('define-properties');
                var empowerOptions = {
                    modifyMessageOnRethrow: true,
                    saveContextOnRethrow: true
                };
                if (typeof baseAssert.deepStrictEqual !== 'function') {
                    baseAssert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
                        if (!_deepEqual(actual, expected, true)) {
                            baseAssert.fail(actual, expected, message, 'deepStrictEqual');
                        }
                    };
                }
                if (typeof baseAssert.notDeepStrictEqual !== 'function') {
                    baseAssert.notDeepStrictEqual = function notDeepStrictEqual(actual, expected, message) {
                        if (_deepEqual(actual, expected, true)) {
                            baseAssert.fail(actual, expected, message, 'notDeepStrictEqual');
                        }
                    };
                }
                function customize(customOptions) {
                    var options = customOptions || {};
                    var poweredAssert = empower(baseAssert, formatter(options.output), extend(empowerOptions, options.assertion));
                    poweredAssert.customize = customize;
                    return poweredAssert;
                }
                var defaultAssert = customize();
                define(defaultAssert, { '__esModule': true });
                defaultAssert['default'] = defaultAssert;
                module.exports = defaultAssert;
            }, { "assert": 7, "define-properties": 80, "empower": 88, "power-assert-formatter": 114, "universal-deep-strict-equal": 131, "xtend": 135 }], 2: [function (_dereq_, module, exports) {
                module.exports = function (acorn) {
                    switch (parseInt(acorn.version)) {
                        case 2:
                        case 3:
                            acorn.plugins.asyncawait = _dereq_('./acorn-v3');
                            break;
                        case 4:
                            acorn.plugins.asyncawait = _dereq_('./acorn-v4');
                            break;
                        case 5:
                            acorn.plugins.asyncawait = _dereq_('./acorn-v4');
                            break;
                        default:
                            throw new Error("acorn-es7-plugin requires Acorn v2, 3, 4 or 5");
                    }
                    return acorn;
                };
            }, { "./acorn-v3": 3, "./acorn-v4": 4 }], 3: [function (_dereq_, module, exports) {
                var NotAsync = {};
                var asyncExit = /^async[\t ]+(return|throw)/;
                var asyncFunction = /^async[\t ]+function/;
                var atomOrPropertyOrLabel = /^\s*[():;]/;
                var removeComments = /([^\n])\/\*(\*(?!\/)|[^\n*])*\*\/([^\n])/g;
                var matchAsyncGet = /\s*(get|set)\s*\(/;
                function hasLineTerminatorBeforeNext(st, since) {
                    return st.lineStart >= since;
                }
                function test(regex, st, noComment) {
                    var src = st.input.slice(st.start);
                    if (noComment) {
                        src = src.replace(removeComments, "$1 $3");
                    }
                    return regex.test(src);
                }
                function subParse(parser, pos, extensions, parens) {
                    var p = new parser.constructor(parser.options, parser.input, pos);
                    if (extensions)
                        for (var k in extensions)
                            p[k] = extensions[k];
                    var src = parser;
                    var dest = p;
                    ['inFunction', 'inAsyncFunction', 'inAsync', 'inGenerator', 'inModule'].forEach(function (k) {
                        if (k in src)
                            dest[k] = src[k];
                    });
                    if (parens)
                        p.options.preserveParens = true;
                    p.nextToken();
                    return p;
                }
                function asyncAwaitPlugin(parser, options) {
                    var es7check = function () { };
                    parser.extend("initialContext", function (base) {
                        return function () {
                            if (this.options.ecmaVersion < 7) {
                                es7check = function (node) {
                                    parser.raise(node.start, "async/await keywords only available when ecmaVersion>=7");
                                };
                            }
                            this.reservedWords = new RegExp(this.reservedWords.toString().replace(/await|async/g, "").replace("|/", "/").replace("/|", "/").replace("||", "|"));
                            this.reservedWordsStrict = new RegExp(this.reservedWordsStrict.toString().replace(/await|async/g, "").replace("|/", "/").replace("/|", "/").replace("||", "|"));
                            this.reservedWordsStrictBind = new RegExp(this.reservedWordsStrictBind.toString().replace(/await|async/g, "").replace("|/", "/").replace("/|", "/").replace("||", "|"));
                            this.inAsyncFunction = options.inAsyncFunction;
                            if (options.awaitAnywhere && options.inAsyncFunction)
                                parser.raise(node.start, "The options awaitAnywhere and inAsyncFunction are mutually exclusive");
                            return base.apply(this, arguments);
                        };
                    });
                    parser.extend("shouldParseExportStatement", function (base) {
                        return function () {
                            if (this.type.label === 'name' && this.value === 'async' && test(asyncFunction, this)) {
                                return true;
                            }
                            return base.apply(this, arguments);
                        };
                    });
                    parser.extend("parseStatement", function (base) {
                        return function (declaration, topLevel) {
                            var start = this.start;
                            var startLoc = this.startLoc;
                            if (this.type.label === 'name') {
                                if (test(asyncFunction, this, true)) {
                                    var wasAsync = this.inAsyncFunction;
                                    try {
                                        this.inAsyncFunction = true;
                                        this.next();
                                        var r = this.parseStatement(declaration, topLevel);
                                        r.async = true;
                                        r.start = start;
                                        r.loc && (r.loc.start = startLoc);
                                        r.range && (r.range[0] = start);
                                        return r;
                                    }
                                    finally {
                                        this.inAsyncFunction = wasAsync;
                                    }
                                }
                                else if ((typeof options === "object" && options.asyncExits) && test(asyncExit, this)) {
                                    this.next();
                                    var r = this.parseStatement(declaration, topLevel);
                                    r.async = true;
                                    r.start = start;
                                    r.loc && (r.loc.start = startLoc);
                                    r.range && (r.range[0] = start);
                                    return r;
                                }
                            }
                            return base.apply(this, arguments);
                        };
                    });
                    parser.extend("parseIdent", function (base) {
                        return function (liberal) {
                            var id = base.apply(this, arguments);
                            if (this.inAsyncFunction && id.name === 'await') {
                                if (arguments.length === 0) {
                                    this.raise(id.start, "'await' is reserved within async functions");
                                }
                            }
                            return id;
                        };
                    });
                    parser.extend("parseExprAtom", function (base) {
                        return function (refShorthandDefaultPos) {
                            var start = this.start;
                            var startLoc = this.startLoc;
                            var rhs, r = base.apply(this, arguments);
                            if (r.type === 'Identifier') {
                                if (r.name === 'async' && !hasLineTerminatorBeforeNext(this, r.end)) {
                                    var isAsync = this.inAsyncFunction;
                                    try {
                                        this.inAsyncFunction = true;
                                        var pp = this;
                                        var inBody = false;
                                        var parseHooks = {
                                            parseFunctionBody: function (node, isArrowFunction) {
                                                try {
                                                    var wasInBody = inBody;
                                                    inBody = true;
                                                    return pp.parseFunctionBody.apply(this, arguments);
                                                }
                                                finally {
                                                    inBody = wasInBody;
                                                }
                                            },
                                            raise: function () {
                                                try {
                                                    return pp.raise.apply(this, arguments);
                                                }
                                                catch (ex) {
                                                    throw inBody ? ex : NotAsync;
                                                }
                                            }
                                        };
                                        rhs = subParse(this, this.start, parseHooks, true).parseExpression();
                                        if (rhs.type === 'SequenceExpression')
                                            rhs = rhs.expressions[0];
                                        if (rhs.type === 'CallExpression')
                                            rhs = rhs.callee;
                                        if (rhs.type === 'FunctionExpression' || rhs.type === 'FunctionDeclaration' || rhs.type === 'ArrowFunctionExpression') {
                                            rhs = subParse(this, this.start, parseHooks).parseExpression();
                                            if (rhs.type === 'SequenceExpression')
                                                rhs = rhs.expressions[0];
                                            if (rhs.type === 'CallExpression')
                                                rhs = rhs.callee;
                                            rhs.async = true;
                                            rhs.start = start;
                                            rhs.loc && (rhs.loc.start = startLoc);
                                            rhs.range && (rhs.range[0] = start);
                                            this.pos = rhs.end;
                                            this.end = rhs.end;
                                            this.endLoc = rhs.endLoc;
                                            this.next();
                                            es7check(rhs);
                                            return rhs;
                                        }
                                    }
                                    catch (ex) {
                                        if (ex !== NotAsync)
                                            throw ex;
                                    }
                                    finally {
                                        this.inAsyncFunction = isAsync;
                                    }
                                }
                                else if (r.name === 'await') {
                                    var n = this.startNodeAt(r.start, r.loc && r.loc.start);
                                    if (this.inAsyncFunction) {
                                        rhs = this.parseExprSubscripts();
                                        n.operator = 'await';
                                        n.argument = rhs;
                                        n = this.finishNodeAt(n, 'AwaitExpression', rhs.end, rhs.loc && rhs.loc.end);
                                        es7check(n);
                                        return n;
                                    }
                                    if (this.input.slice(r.end).match(atomOrPropertyOrLabel)) {
                                        if (!options.awaitAnywhere && this.options.sourceType === 'module')
                                            return this.raise(r.start, "'await' is reserved within modules");
                                        return r;
                                    }
                                    if (typeof options === "object" && options.awaitAnywhere) {
                                        start = this.start;
                                        rhs = subParse(this, start - 4).parseExprSubscripts();
                                        if (rhs.end <= start) {
                                            rhs = subParse(this, start).parseExprSubscripts();
                                            n.operator = 'await';
                                            n.argument = rhs;
                                            n = this.finishNodeAt(n, 'AwaitExpression', rhs.end, rhs.loc && rhs.loc.end);
                                            this.pos = rhs.end;
                                            this.end = rhs.end;
                                            this.endLoc = rhs.endLoc;
                                            this.next();
                                            es7check(n);
                                            return n;
                                        }
                                    }
                                    if (!options.awaitAnywhere && this.options.sourceType === 'module')
                                        return this.raise(r.start, "'await' is reserved within modules");
                                }
                            }
                            return r;
                        };
                    });
                    parser.extend('finishNodeAt', function (base) {
                        return function (node, type, pos, loc) {
                            if (node.__asyncValue) {
                                delete node.__asyncValue;
                                node.value.async = true;
                            }
                            return base.apply(this, arguments);
                        };
                    });
                    parser.extend('finishNode', function (base) {
                        return function (node, type) {
                            if (node.__asyncValue) {
                                delete node.__asyncValue;
                                node.value.async = true;
                            }
                            return base.apply(this, arguments);
                        };
                    });
                    var allowedPropSpecifiers = {
                        get: true,
                        set: true,
                        async: true
                    };
                    parser.extend("parsePropertyName", function (base) {
                        return function (prop) {
                            var prevName = prop.key && prop.key.name;
                            var key = base.apply(this, arguments);
                            if (key.type === "Identifier" && (key.name === "async") && !hasLineTerminatorBeforeNext(this, key.end)) {
                                if (!this.input.slice(key.end).match(atomOrPropertyOrLabel)) {
                                    if (matchAsyncGet.test(this.input.slice(key.end))) {
                                        key = base.apply(this, arguments);
                                        prop.__asyncValue = true;
                                    }
                                    else {
                                        es7check(prop);
                                        if (prop.kind === 'set')
                                            this.raise(key.start, "'set <member>(value)' cannot be be async");
                                        key = base.apply(this, arguments);
                                        if (key.type === 'Identifier') {
                                            if (key.name === 'set')
                                                this.raise(key.start, "'set <member>(value)' cannot be be async");
                                        }
                                        prop.__asyncValue = true;
                                    }
                                }
                            }
                            return key;
                        };
                    });
                    parser.extend("parseClassMethod", function (base) {
                        return function (classBody, method, isGenerator) {
                            var wasAsync;
                            if (method.__asyncValue) {
                                if (method.kind === 'constructor')
                                    this.raise(method.start, "class constructor() cannot be be async");
                                wasAsync = this.inAsyncFunction;
                                this.inAsyncFunction = true;
                            }
                            var r = base.apply(this, arguments);
                            this.inAsyncFunction = wasAsync;
                            return r;
                        };
                    });
                    parser.extend("parseMethod", function (base) {
                        return function (isGenerator) {
                            var wasAsync;
                            if (this.__currentProperty && this.__currentProperty.__asyncValue) {
                                wasAsync = this.inAsyncFunction;
                                this.inAsyncFunction = true;
                            }
                            var r = base.apply(this, arguments);
                            this.inAsyncFunction = wasAsync;
                            return r;
                        };
                    });
                    parser.extend("parsePropertyValue", function (base) {
                        return function (prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors) {
                            var prevProp = this.__currentProperty;
                            this.__currentProperty = prop;
                            var wasAsync;
                            if (prop.__asyncValue) {
                                wasAsync = this.inAsyncFunction;
                                this.inAsyncFunction = true;
                            }
                            var r = base.apply(this, arguments);
                            this.inAsyncFunction = wasAsync;
                            this.__currentProperty = prevProp;
                            return r;
                        };
                    });
                }
                module.exports = asyncAwaitPlugin;
            }, {}], 4: [function (_dereq_, module, exports) {
                var asyncExit = /^async[\t ]+(return|throw)/;
                var atomOrPropertyOrLabel = /^\s*[):;]/;
                var removeComments = /([^\n])\/\*(\*(?!\/)|[^\n*])*\*\/([^\n])/g;
                function hasLineTerminatorBeforeNext(st, since) {
                    return st.lineStart >= since;
                }
                function test(regex, st, noComment) {
                    var src = st.input.slice(st.start);
                    if (noComment) {
                        src = src.replace(removeComments, "$1 $3");
                    }
                    return regex.test(src);
                }
                function subParse(parser, pos, extensions) {
                    var p = new parser.constructor(parser.options, parser.input, pos);
                    if (extensions)
                        for (var k in extensions)
                            p[k] = extensions[k];
                    var src = parser;
                    var dest = p;
                    ['inFunction', 'inAsync', 'inGenerator', 'inModule'].forEach(function (k) {
                        if (k in src)
                            dest[k] = src[k];
                    });
                    p.nextToken();
                    return p;
                }
                function asyncAwaitPlugin(parser, options) {
                    if (!options || typeof options !== "object")
                        options = {};
                    parser.extend("parse", function (base) {
                        return function () {
                            this.inAsync = options.inAsyncFunction;
                            if (options.awaitAnywhere && options.inAsyncFunction)
                                parser.raise(node.start, "The options awaitAnywhere and inAsyncFunction are mutually exclusive");
                            return base.apply(this, arguments);
                        };
                    });
                    parser.extend("parseStatement", function (base) {
                        return function (declaration, topLevel) {
                            var start = this.start;
                            var startLoc = this.startLoc;
                            if (this.type.label === 'name') {
                                if ((options.asyncExits) && test(asyncExit, this)) {
                                    this.next();
                                    var r = this.parseStatement(declaration, topLevel);
                                    r.async = true;
                                    r.start = start;
                                    r.loc && (r.loc.start = startLoc);
                                    r.range && (r.range[0] = start);
                                    return r;
                                }
                            }
                            return base.apply(this, arguments);
                        };
                    });
                    parser.extend("parseIdent", function (base) {
                        return function (liberal) {
                            if (this.options.sourceType === 'module' && this.options.ecmaVersion >= 8 && options.awaitAnywhere)
                                return base.call(this, true);
                            return base.apply(this, arguments);
                        };
                    });
                    parser.extend("parseExprAtom", function (base) {
                        var NotAsync = {};
                        return function (refShorthandDefaultPos) {
                            var start = this.start;
                            var startLoc = this.startLoc;
                            var rhs, r = base.apply(this, arguments);
                            if (r.type === 'Identifier') {
                                if (r.name === 'await' && !this.inAsync) {
                                    if (options.awaitAnywhere) {
                                        var n = this.startNodeAt(r.start, r.loc && r.loc.start);
                                        start = this.start;
                                        var parseHooks = {
                                            raise: function () {
                                                try {
                                                    return pp.raise.apply(this, arguments);
                                                }
                                                catch (ex) {
                                                    throw NotAsync;
                                                }
                                            }
                                        };
                                        try {
                                            rhs = subParse(this, start - 4, parseHooks).parseExprSubscripts();
                                            if (rhs.end <= start) {
                                                rhs = subParse(this, start, parseHooks).parseExprSubscripts();
                                                n.argument = rhs;
                                                n = this.finishNodeAt(n, 'AwaitExpression', rhs.end, rhs.loc && rhs.loc.end);
                                                this.pos = rhs.end;
                                                this.end = rhs.end;
                                                this.endLoc = rhs.endLoc;
                                                this.next();
                                                return n;
                                            }
                                        }
                                        catch (ex) {
                                            if (ex === NotAsync)
                                                return r;
                                            throw ex;
                                        }
                                    }
                                }
                            }
                            return r;
                        };
                    });
                    var allowedPropValues = {
                        undefined: true,
                        get: true,
                        set: true,
                        "static": true,
                        async: true,
                        constructor: true
                    };
                    parser.extend("parsePropertyName", function (base) {
                        return function (prop) {
                            var prevName = prop.key && prop.key.name;
                            var key = base.apply(this, arguments);
                            if (this.value === 'get') {
                                prop.__maybeStaticAsyncGetter = true;
                            }
                            var next;
                            if (allowedPropValues[this.value])
                                return key;
                            if (key.type === "Identifier" && (key.name === "async" || prevName === "async") && !hasLineTerminatorBeforeNext(this, key.end)
                                && !this.input.slice(key.end).match(atomOrPropertyOrLabel)) {
                                if (prop.kind === 'set' || key.name === 'set')
                                    this.raise(key.start, "'set <member>(value)' cannot be be async");
                                else {
                                    this.__isAsyncProp = true;
                                    key = base.apply(this, arguments);
                                    if (key.type === 'Identifier') {
                                        if (key.name === 'set')
                                            this.raise(key.start, "'set <member>(value)' cannot be be async");
                                    }
                                }
                            }
                            else {
                                delete prop.__maybeStaticAsyncGetter;
                            }
                            return key;
                        };
                    });
                    parser.extend("parseClassMethod", function (base) {
                        return function (classBody, method, isGenerator) {
                            var r = base.apply(this, arguments);
                            if (method.__maybeStaticAsyncGetter) {
                                delete method.__maybeStaticAsyncGetter;
                                if (method.key.name !== 'get')
                                    method.kind = "get";
                            }
                            return r;
                        };
                    });
                    parser.extend("parseFunctionBody", function (base) {
                        return function (node, isArrowFunction) {
                            var wasAsync = this.inAsync;
                            if (this.__isAsyncProp) {
                                node.async = true;
                                this.inAsync = true;
                                delete this.__isAsyncProp;
                            }
                            var r = base.apply(this, arguments);
                            this.inAsync = wasAsync;
                            return r;
                        };
                    });
                }
                module.exports = asyncAwaitPlugin;
            }, {}], 5: [function (_dereq_, module, exports) {
                (function (global, factory) {
                    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
                        typeof define === 'function' && define.amd ? define(['exports'], factory) :
                            (factory((global.acorn = global.acorn || {})));
                }(this, (function (exports) {
                    'use strict';
                    var reservedWords = {
                        3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
                        5: "class enum extends super const export import",
                        6: "enum",
                        strict: "implements interface let package private protected public static yield",
                        strictBind: "eval arguments"
                    };
                    var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
                    var keywords = {
                        5: ecma5AndLessKeywords,
                        6: ecma5AndLessKeywords + " const class extends export import super"
                    };
                    var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fd5\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ae\ua7b0-\ua7b7\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab65\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
                    var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d4-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d01-\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf8\u1cf9\u1dc0-\u1df5\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
                    var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
                    var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
                    nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;
                    var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 17, 26, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 26, 45, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 785, 52, 76, 44, 33, 24, 27, 35, 42, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 159, 52, 19, 3, 54, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 86, 25, 391, 63, 32, 0, 449, 56, 264, 8, 2, 36, 18, 0, 50, 29, 881, 921, 103, 110, 18, 195, 2749, 1070, 4050, 582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 881, 68, 12, 0, 67, 12, 65, 0, 32, 6124, 20, 754, 9486, 1, 3071, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 60, 67, 1213, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12, 221, 3, 5761, 10591, 541];
                    var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 1306, 2, 54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 52, 0, 13, 2, 49, 13, 10, 2, 4, 9, 83, 11, 7, 0, 161, 11, 6, 9, 7, 3, 57, 0, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 87, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 423, 9, 838, 7, 2, 7, 17, 9, 57, 21, 2, 13, 19882, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 2214, 6, 110, 6, 6, 9, 792487, 239];
                    function isInAstralSet(code, set) {
                        var pos = 0x10000;
                        for (var i = 0; i < set.length; i += 2) {
                            pos += set[i];
                            if (pos > code)
                                return false;
                            pos += set[i + 1];
                            if (pos >= code)
                                return true;
                        }
                    }
                    function isIdentifierStart(code, astral) {
                        if (code < 65)
                            return code === 36;
                        if (code < 91)
                            return true;
                        if (code < 97)
                            return code === 95;
                        if (code < 123)
                            return true;
                        if (code <= 0xffff)
                            return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
                        if (astral === false)
                            return false;
                        return isInAstralSet(code, astralIdentifierStartCodes);
                    }
                    function isIdentifierChar(code, astral) {
                        if (code < 48)
                            return code === 36;
                        if (code < 58)
                            return true;
                        if (code < 65)
                            return false;
                        if (code < 91)
                            return true;
                        if (code < 97)
                            return code === 95;
                        if (code < 123)
                            return true;
                        if (code <= 0xffff)
                            return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
                        if (astral === false)
                            return false;
                        return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
                    }
                    var TokenType = function TokenType(label, conf) {
                        if (conf === void 0)
                            conf = {};
                        this.label = label;
                        this.keyword = conf.keyword;
                        this.beforeExpr = !!conf.beforeExpr;
                        this.startsExpr = !!conf.startsExpr;
                        this.isLoop = !!conf.isLoop;
                        this.isAssign = !!conf.isAssign;
                        this.prefix = !!conf.prefix;
                        this.postfix = !!conf.postfix;
                        this.binop = conf.binop || null;
                        this.updateContext = null;
                    };
                    function binop(name, prec) {
                        return new TokenType(name, { beforeExpr: true, binop: prec });
                    }
                    var beforeExpr = { beforeExpr: true };
                    var startsExpr = { startsExpr: true };
                    var keywordTypes = {};
                    function kw(name, options) {
                        if (options === void 0)
                            options = {};
                        options.keyword = name;
                        return keywordTypes[name] = new TokenType(name, options);
                    }
                    var tt = {
                        num: new TokenType("num", startsExpr),
                        regexp: new TokenType("regexp", startsExpr),
                        string: new TokenType("string", startsExpr),
                        name: new TokenType("name", startsExpr),
                        eof: new TokenType("eof"),
                        bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
                        bracketR: new TokenType("]"),
                        braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
                        braceR: new TokenType("}"),
                        parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
                        parenR: new TokenType(")"),
                        comma: new TokenType(",", beforeExpr),
                        semi: new TokenType(";", beforeExpr),
                        colon: new TokenType(":", beforeExpr),
                        dot: new TokenType("."),
                        question: new TokenType("?", beforeExpr),
                        arrow: new TokenType("=>", beforeExpr),
                        template: new TokenType("template"),
                        ellipsis: new TokenType("...", beforeExpr),
                        backQuote: new TokenType("`", startsExpr),
                        dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
                        eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
                        assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
                        incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
                        prefix: new TokenType("prefix", { beforeExpr: true, prefix: true, startsExpr: true }),
                        logicalOR: binop("||", 1),
                        logicalAND: binop("&&", 2),
                        bitwiseOR: binop("|", 3),
                        bitwiseXOR: binop("^", 4),
                        bitwiseAND: binop("&", 5),
                        equality: binop("==/!=", 6),
                        relational: binop("</>", 7),
                        bitShift: binop("<</>>", 8),
                        plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
                        modulo: binop("%", 10),
                        star: binop("*", 10),
                        slash: binop("/", 10),
                        starstar: new TokenType("**", { beforeExpr: true }),
                        _break: kw("break"),
                        _case: kw("case", beforeExpr),
                        _catch: kw("catch"),
                        _continue: kw("continue"),
                        _debugger: kw("debugger"),
                        _default: kw("default", beforeExpr),
                        _do: kw("do", { isLoop: true, beforeExpr: true }),
                        _else: kw("else", beforeExpr),
                        _finally: kw("finally"),
                        _for: kw("for", { isLoop: true }),
                        _function: kw("function", startsExpr),
                        _if: kw("if"),
                        _return: kw("return", beforeExpr),
                        _switch: kw("switch"),
                        _throw: kw("throw", beforeExpr),
                        _try: kw("try"),
                        _var: kw("var"),
                        _const: kw("const"),
                        _while: kw("while", { isLoop: true }),
                        _with: kw("with"),
                        _new: kw("new", { beforeExpr: true, startsExpr: true }),
                        _this: kw("this", startsExpr),
                        _super: kw("super", startsExpr),
                        _class: kw("class"),
                        _extends: kw("extends", beforeExpr),
                        _export: kw("export"),
                        _import: kw("import"),
                        _null: kw("null", startsExpr),
                        _true: kw("true", startsExpr),
                        _false: kw("false", startsExpr),
                        _in: kw("in", { beforeExpr: true, binop: 7 }),
                        _instanceof: kw("instanceof", { beforeExpr: true, binop: 7 }),
                        _typeof: kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
                        _void: kw("void", { beforeExpr: true, prefix: true, startsExpr: true }),
                        _delete: kw("delete", { beforeExpr: true, prefix: true, startsExpr: true })
                    };
                    var lineBreak = /\r\n?|\n|\u2028|\u2029/;
                    var lineBreakG = new RegExp(lineBreak.source, "g");
                    function isNewLine(code) {
                        return code === 10 || code === 13 || code === 0x2028 || code === 0x2029;
                    }
                    var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
                    var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
                    function isArray(obj) {
                        return Object.prototype.toString.call(obj) === "[object Array]";
                    }
                    function has(obj, propName) {
                        return Object.prototype.hasOwnProperty.call(obj, propName);
                    }
                    var Position = function Position(line, col) {
                        this.line = line;
                        this.column = col;
                    };
                    Position.prototype.offset = function offset(n) {
                        return new Position(this.line, this.column + n);
                    };
                    var SourceLocation = function SourceLocation(p, start, end) {
                        this.start = start;
                        this.end = end;
                        if (p.sourceFile !== null)
                            this.source = p.sourceFile;
                    };
                    function getLineInfo(input, offset) {
                        for (var line = 1, cur = 0;;) {
                            lineBreakG.lastIndex = cur;
                            var match = lineBreakG.exec(input);
                            if (match && match.index < offset) {
                                ++line;
                                cur = match.index + match[0].length;
                            }
                            else {
                                return new Position(line, offset - cur);
                            }
                        }
                    }
                    var defaultOptions = {
                        ecmaVersion: 7,
                        sourceType: "script",
                        onInsertedSemicolon: null,
                        onTrailingComma: null,
                        allowReserved: null,
                        allowReturnOutsideFunction: false,
                        allowImportExportEverywhere: false,
                        allowHashBang: false,
                        locations: false,
                        onToken: null,
                        onComment: null,
                        ranges: false,
                        program: null,
                        sourceFile: null,
                        directSourceFile: null,
                        preserveParens: false,
                        plugins: {}
                    };
                    function getOptions(opts) {
                        var options = {};
                        for (var opt in defaultOptions)
                            options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt];
                        if (options.ecmaVersion >= 2015)
                            options.ecmaVersion -= 2009;
                        if (options.allowReserved == null)
                            options.allowReserved = options.ecmaVersion < 5;
                        if (isArray(options.onToken)) {
                            var tokens = options.onToken;
                            options.onToken = function (token) { return tokens.push(token); };
                        }
                        if (isArray(options.onComment))
                            options.onComment = pushComment(options, options.onComment);
                        return options;
                    }
                    function pushComment(options, array) {
                        return function (block, text, start, end, startLoc, endLoc) {
                            var comment = {
                                type: block ? 'Block' : 'Line',
                                value: text,
                                start: start,
                                end: end
                            };
                            if (options.locations)
                                comment.loc = new SourceLocation(this, startLoc, endLoc);
                            if (options.ranges)
                                comment.range = [start, end];
                            array.push(comment);
                        };
                    }
                    var plugins = {};
                    function keywordRegexp(words) {
                        return new RegExp("^(" + words.replace(/ /g, "|") + ")$");
                    }
                    var Parser = function Parser(options, input, startPos) {
                        this.options = options = getOptions(options);
                        this.sourceFile = options.sourceFile;
                        this.keywords = keywordRegexp(keywords[options.ecmaVersion >= 6 ? 6 : 5]);
                        var reserved = "";
                        if (!options.allowReserved) {
                            for (var v = options.ecmaVersion;; v--)
                                if (reserved = reservedWords[v])
                                    break;
                            if (options.sourceType == "module")
                                reserved += " await";
                        }
                        this.reservedWords = keywordRegexp(reserved);
                        var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
                        this.reservedWordsStrict = keywordRegexp(reservedStrict);
                        this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + reservedWords.strictBind);
                        this.input = String(input);
                        this.containsEsc = false;
                        this.loadPlugins(options.plugins);
                        if (startPos) {
                            this.pos = startPos;
                            this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
                            this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
                        }
                        else {
                            this.pos = this.lineStart = 0;
                            this.curLine = 1;
                        }
                        this.type = tt.eof;
                        this.value = null;
                        this.start = this.end = this.pos;
                        this.startLoc = this.endLoc = this.curPosition();
                        this.lastTokEndLoc = this.lastTokStartLoc = null;
                        this.lastTokStart = this.lastTokEnd = this.pos;
                        this.context = this.initialContext();
                        this.exprAllowed = true;
                        this.inModule = options.sourceType === "module";
                        this.strict = this.inModule || this.strictDirective(this.pos);
                        this.potentialArrowAt = -1;
                        this.inFunction = this.inGenerator = this.inAsync = false;
                        this.yieldPos = this.awaitPos = 0;
                        this.labels = [];
                        if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === '#!')
                            this.skipLineComment(2);
                    };
                    Parser.prototype.isKeyword = function isKeyword(word) { return this.keywords.test(word); };
                    Parser.prototype.isReservedWord = function isReservedWord(word) { return this.reservedWords.test(word); };
                    Parser.prototype.extend = function extend(name, f) {
                        this[name] = f(this[name]);
                    };
                    Parser.prototype.loadPlugins = function loadPlugins(pluginConfigs) {
                        var this$1 = this;
                        for (var name in pluginConfigs) {
                            var plugin = plugins[name];
                            if (!plugin)
                                throw new Error("Plugin '" + name + "' not found");
                            plugin(this$1, pluginConfigs[name]);
                        }
                    };
                    Parser.prototype.parse = function parse() {
                        var node = this.options.program || this.startNode();
                        this.nextToken();
                        return this.parseTopLevel(node);
                    };
                    var pp = Parser.prototype;
                    var literal = /^(?:'((?:[^\']|\.)*)'|"((?:[^\"]|\.)*)"|;)/;
                    pp.strictDirective = function (start) {
                        var this$1 = this;
                        for (;;) {
                            skipWhiteSpace.lastIndex = start;
                            start += skipWhiteSpace.exec(this$1.input)[0].length;
                            var match = literal.exec(this$1.input.slice(start));
                            if (!match)
                                return false;
                            if ((match[1] || match[2]) == "use strict")
                                return true;
                            start += match[0].length;
                        }
                    };
                    pp.eat = function (type) {
                        if (this.type === type) {
                            this.next();
                            return true;
                        }
                        else {
                            return false;
                        }
                    };
                    pp.isContextual = function (name) {
                        return this.type === tt.name && this.value === name;
                    };
                    pp.eatContextual = function (name) {
                        return this.value === name && this.eat(tt.name);
                    };
                    pp.expectContextual = function (name) {
                        if (!this.eatContextual(name))
                            this.unexpected();
                    };
                    pp.canInsertSemicolon = function () {
                        return this.type === tt.eof ||
                            this.type === tt.braceR ||
                            lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
                    };
                    pp.insertSemicolon = function () {
                        if (this.canInsertSemicolon()) {
                            if (this.options.onInsertedSemicolon)
                                this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
                            return true;
                        }
                    };
                    pp.semicolon = function () {
                        if (!this.eat(tt.semi) && !this.insertSemicolon())
                            this.unexpected();
                    };
                    pp.afterTrailingComma = function (tokType, notNext) {
                        if (this.type == tokType) {
                            if (this.options.onTrailingComma)
                                this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
                            if (!notNext)
                                this.next();
                            return true;
                        }
                    };
                    pp.expect = function (type) {
                        this.eat(type) || this.unexpected();
                    };
                    pp.unexpected = function (pos) {
                        this.raise(pos != null ? pos : this.start, "Unexpected token");
                    };
                    var DestructuringErrors = function DestructuringErrors() {
                        this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = -1;
                    };
                    pp.checkPatternErrors = function (refDestructuringErrors, isAssign) {
                        if (!refDestructuringErrors)
                            return;
                        if (refDestructuringErrors.trailingComma > -1)
                            this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
                        var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
                        if (parens > -1)
                            this.raiseRecoverable(parens, "Parenthesized pattern");
                    };
                    pp.checkExpressionErrors = function (refDestructuringErrors, andThrow) {
                        var pos = refDestructuringErrors ? refDestructuringErrors.shorthandAssign : -1;
                        if (!andThrow)
                            return pos >= 0;
                        if (pos > -1)
                            this.raise(pos, "Shorthand property assignments are valid only in destructuring patterns");
                    };
                    pp.checkYieldAwaitInDefaultParams = function () {
                        if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
                            this.raise(this.yieldPos, "Yield expression cannot be a default value");
                        if (this.awaitPos)
                            this.raise(this.awaitPos, "Await expression cannot be a default value");
                    };
                    pp.isSimpleAssignTarget = function (expr) {
                        if (expr.type === "ParenthesizedExpression")
                            return this.isSimpleAssignTarget(expr.expression);
                        return expr.type === "Identifier" || expr.type === "MemberExpression";
                    };
                    var pp$1 = Parser.prototype;
                    pp$1.parseTopLevel = function (node) {
                        var this$1 = this;
                        var exports = {};
                        if (!node.body)
                            node.body = [];
                        while (this.type !== tt.eof) {
                            var stmt = this$1.parseStatement(true, true, exports);
                            node.body.push(stmt);
                        }
                        this.next();
                        if (this.options.ecmaVersion >= 6) {
                            node.sourceType = this.options.sourceType;
                        }
                        return this.finishNode(node, "Program");
                    };
                    var loopLabel = { kind: "loop" };
                    var switchLabel = { kind: "switch" };
                    pp$1.isLet = function () {
                        if (this.type !== tt.name || this.options.ecmaVersion < 6 || this.value != "let")
                            return false;
                        skipWhiteSpace.lastIndex = this.pos;
                        var skip = skipWhiteSpace.exec(this.input);
                        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
                        if (nextCh === 91 || nextCh == 123)
                            return true;
                        if (isIdentifierStart(nextCh, true)) {
                            for (var pos = next + 1; isIdentifierChar(this.input.charCodeAt(pos), true); ++pos) { }
                            var ident = this.input.slice(next, pos);
                            if (!this.isKeyword(ident))
                                return true;
                        }
                        return false;
                    };
                    pp$1.isAsyncFunction = function () {
                        if (this.type !== tt.name || this.options.ecmaVersion < 8 || this.value != "async")
                            return false;
                        skipWhiteSpace.lastIndex = this.pos;
                        var skip = skipWhiteSpace.exec(this.input);
                        var next = this.pos + skip[0].length;
                        return !lineBreak.test(this.input.slice(this.pos, next)) &&
                            this.input.slice(next, next + 8) === "function" &&
                            (next + 8 == this.input.length || !isIdentifierChar(this.input.charAt(next + 8)));
                    };
                    pp$1.parseStatement = function (declaration, topLevel, exports) {
                        var starttype = this.type, node = this.startNode(), kind;
                        if (this.isLet()) {
                            starttype = tt._var;
                            kind = "let";
                        }
                        switch (starttype) {
                            case tt._break:
                            case tt._continue: return this.parseBreakContinueStatement(node, starttype.keyword);
                            case tt._debugger: return this.parseDebuggerStatement(node);
                            case tt._do: return this.parseDoStatement(node);
                            case tt._for: return this.parseForStatement(node);
                            case tt._function:
                                if (!declaration && this.options.ecmaVersion >= 6)
                                    this.unexpected();
                                return this.parseFunctionStatement(node, false);
                            case tt._class:
                                if (!declaration)
                                    this.unexpected();
                                return this.parseClass(node, true);
                            case tt._if: return this.parseIfStatement(node);
                            case tt._return: return this.parseReturnStatement(node);
                            case tt._switch: return this.parseSwitchStatement(node);
                            case tt._throw: return this.parseThrowStatement(node);
                            case tt._try: return this.parseTryStatement(node);
                            case tt._const:
                            case tt._var:
                                kind = kind || this.value;
                                if (!declaration && kind != "var")
                                    this.unexpected();
                                return this.parseVarStatement(node, kind);
                            case tt._while: return this.parseWhileStatement(node);
                            case tt._with: return this.parseWithStatement(node);
                            case tt.braceL: return this.parseBlock();
                            case tt.semi: return this.parseEmptyStatement(node);
                            case tt._export:
                            case tt._import:
                                if (!this.options.allowImportExportEverywhere) {
                                    if (!topLevel)
                                        this.raise(this.start, "'import' and 'export' may only appear at the top level");
                                    if (!this.inModule)
                                        this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
                                }
                                return starttype === tt._import ? this.parseImport(node) : this.parseExport(node, exports);
                            default:
                                if (this.isAsyncFunction() && declaration) {
                                    this.next();
                                    return this.parseFunctionStatement(node, true);
                                }
                                var maybeName = this.value, expr = this.parseExpression();
                                if (starttype === tt.name && expr.type === "Identifier" && this.eat(tt.colon))
                                    return this.parseLabeledStatement(node, maybeName, expr);
                                else
                                    return this.parseExpressionStatement(node, expr);
                        }
                    };
                    pp$1.parseBreakContinueStatement = function (node, keyword) {
                        var this$1 = this;
                        var isBreak = keyword == "break";
                        this.next();
                        if (this.eat(tt.semi) || this.insertSemicolon())
                            node.label = null;
                        else if (this.type !== tt.name)
                            this.unexpected();
                        else {
                            node.label = this.parseIdent();
                            this.semicolon();
                        }
                        for (var i = 0; i < this.labels.length; ++i) {
                            var lab = this$1.labels[i];
                            if (node.label == null || lab.name === node.label.name) {
                                if (lab.kind != null && (isBreak || lab.kind === "loop"))
                                    break;
                                if (node.label && isBreak)
                                    break;
                            }
                        }
                        if (i === this.labels.length)
                            this.raise(node.start, "Unsyntactic " + keyword);
                        return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
                    };
                    pp$1.parseDebuggerStatement = function (node) {
                        this.next();
                        this.semicolon();
                        return this.finishNode(node, "DebuggerStatement");
                    };
                    pp$1.parseDoStatement = function (node) {
                        this.next();
                        this.labels.push(loopLabel);
                        node.body = this.parseStatement(false);
                        this.labels.pop();
                        this.expect(tt._while);
                        node.test = this.parseParenExpression();
                        if (this.options.ecmaVersion >= 6)
                            this.eat(tt.semi);
                        else
                            this.semicolon();
                        return this.finishNode(node, "DoWhileStatement");
                    };
                    pp$1.parseForStatement = function (node) {
                        this.next();
                        this.labels.push(loopLabel);
                        this.expect(tt.parenL);
                        if (this.type === tt.semi)
                            return this.parseFor(node, null);
                        var isLet = this.isLet();
                        if (this.type === tt._var || this.type === tt._const || isLet) {
                            var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
                            this.next();
                            this.parseVar(init$1, true, kind);
                            this.finishNode(init$1, "VariableDeclaration");
                            if ((this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1 &&
                                !(kind !== "var" && init$1.declarations[0].init))
                                return this.parseForIn(node, init$1);
                            return this.parseFor(node, init$1);
                        }
                        var refDestructuringErrors = new DestructuringErrors;
                        var init = this.parseExpression(true, refDestructuringErrors);
                        if (this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
                            this.toAssignable(init);
                            this.checkLVal(init);
                            this.checkPatternErrors(refDestructuringErrors, true);
                            return this.parseForIn(node, init);
                        }
                        else {
                            this.checkExpressionErrors(refDestructuringErrors, true);
                        }
                        return this.parseFor(node, init);
                    };
                    pp$1.parseFunctionStatement = function (node, isAsync) {
                        this.next();
                        return this.parseFunction(node, true, false, isAsync);
                    };
                    pp$1.isFunction = function () {
                        return this.type === tt._function || this.isAsyncFunction();
                    };
                    pp$1.parseIfStatement = function (node) {
                        this.next();
                        node.test = this.parseParenExpression();
                        node.consequent = this.parseStatement(!this.strict && this.isFunction());
                        node.alternate = this.eat(tt._else) ? this.parseStatement(!this.strict && this.isFunction()) : null;
                        return this.finishNode(node, "IfStatement");
                    };
                    pp$1.parseReturnStatement = function (node) {
                        if (!this.inFunction && !this.options.allowReturnOutsideFunction)
                            this.raise(this.start, "'return' outside of function");
                        this.next();
                        if (this.eat(tt.semi) || this.insertSemicolon())
                            node.argument = null;
                        else {
                            node.argument = this.parseExpression();
                            this.semicolon();
                        }
                        return this.finishNode(node, "ReturnStatement");
                    };
                    pp$1.parseSwitchStatement = function (node) {
                        var this$1 = this;
                        this.next();
                        node.discriminant = this.parseParenExpression();
                        node.cases = [];
                        this.expect(tt.braceL);
                        this.labels.push(switchLabel);
                        for (var cur, sawDefault = false; this.type != tt.braceR;) {
                            if (this$1.type === tt._case || this$1.type === tt._default) {
                                var isCase = this$1.type === tt._case;
                                if (cur)
                                    this$1.finishNode(cur, "SwitchCase");
                                node.cases.push(cur = this$1.startNode());
                                cur.consequent = [];
                                this$1.next();
                                if (isCase) {
                                    cur.test = this$1.parseExpression();
                                }
                                else {
                                    if (sawDefault)
                                        this$1.raiseRecoverable(this$1.lastTokStart, "Multiple default clauses");
                                    sawDefault = true;
                                    cur.test = null;
                                }
                                this$1.expect(tt.colon);
                            }
                            else {
                                if (!cur)
                                    this$1.unexpected();
                                cur.consequent.push(this$1.parseStatement(true));
                            }
                        }
                        if (cur)
                            this.finishNode(cur, "SwitchCase");
                        this.next();
                        this.labels.pop();
                        return this.finishNode(node, "SwitchStatement");
                    };
                    pp$1.parseThrowStatement = function (node) {
                        this.next();
                        if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
                            this.raise(this.lastTokEnd, "Illegal newline after throw");
                        node.argument = this.parseExpression();
                        this.semicolon();
                        return this.finishNode(node, "ThrowStatement");
                    };
                    var empty = [];
                    pp$1.parseTryStatement = function (node) {
                        this.next();
                        node.block = this.parseBlock();
                        node.handler = null;
                        if (this.type === tt._catch) {
                            var clause = this.startNode();
                            this.next();
                            this.expect(tt.parenL);
                            clause.param = this.parseBindingAtom();
                            this.checkLVal(clause.param, true);
                            this.expect(tt.parenR);
                            clause.body = this.parseBlock();
                            node.handler = this.finishNode(clause, "CatchClause");
                        }
                        node.finalizer = this.eat(tt._finally) ? this.parseBlock() : null;
                        if (!node.handler && !node.finalizer)
                            this.raise(node.start, "Missing catch or finally clause");
                        return this.finishNode(node, "TryStatement");
                    };
                    pp$1.parseVarStatement = function (node, kind) {
                        this.next();
                        this.parseVar(node, false, kind);
                        this.semicolon();
                        return this.finishNode(node, "VariableDeclaration");
                    };
                    pp$1.parseWhileStatement = function (node) {
                        this.next();
                        node.test = this.parseParenExpression();
                        this.labels.push(loopLabel);
                        node.body = this.parseStatement(false);
                        this.labels.pop();
                        return this.finishNode(node, "WhileStatement");
                    };
                    pp$1.parseWithStatement = function (node) {
                        if (this.strict)
                            this.raise(this.start, "'with' in strict mode");
                        this.next();
                        node.object = this.parseParenExpression();
                        node.body = this.parseStatement(false);
                        return this.finishNode(node, "WithStatement");
                    };
                    pp$1.parseEmptyStatement = function (node) {
                        this.next();
                        return this.finishNode(node, "EmptyStatement");
                    };
                    pp$1.parseLabeledStatement = function (node, maybeName, expr) {
                        var this$1 = this;
                        for (var i = 0; i < this.labels.length; ++i)
                            if (this$1.labels[i].name === maybeName)
                                this$1.raise(expr.start, "Label '" + maybeName + "' is already declared");
                        var kind = this.type.isLoop ? "loop" : this.type === tt._switch ? "switch" : null;
                        for (var i$1 = this.labels.length - 1; i$1 >= 0; i$1--) {
                            var label = this$1.labels[i$1];
                            if (label.statementStart == node.start) {
                                label.statementStart = this$1.start;
                                label.kind = kind;
                            }
                            else
                                break;
                        }
                        this.labels.push({ name: maybeName, kind: kind, statementStart: this.start });
                        node.body = this.parseStatement(true);
                        if (node.body.type == "ClassDeclaration" ||
                            node.body.type == "VariableDeclaration" && (this.strict || node.body.kind != "var") ||
                            node.body.type == "FunctionDeclaration" && (this.strict || node.body.generator))
                            this.raiseRecoverable(node.body.start, "Invalid labeled declaration");
                        this.labels.pop();
                        node.label = expr;
                        return this.finishNode(node, "LabeledStatement");
                    };
                    pp$1.parseExpressionStatement = function (node, expr) {
                        node.expression = expr;
                        this.semicolon();
                        return this.finishNode(node, "ExpressionStatement");
                    };
                    pp$1.parseBlock = function () {
                        var this$1 = this;
                        var node = this.startNode();
                        node.body = [];
                        this.expect(tt.braceL);
                        while (!this.eat(tt.braceR)) {
                            var stmt = this$1.parseStatement(true);
                            node.body.push(stmt);
                        }
                        return this.finishNode(node, "BlockStatement");
                    };
                    pp$1.parseFor = function (node, init) {
                        node.init = init;
                        this.expect(tt.semi);
                        node.test = this.type === tt.semi ? null : this.parseExpression();
                        this.expect(tt.semi);
                        node.update = this.type === tt.parenR ? null : this.parseExpression();
                        this.expect(tt.parenR);
                        node.body = this.parseStatement(false);
                        this.labels.pop();
                        return this.finishNode(node, "ForStatement");
                    };
                    pp$1.parseForIn = function (node, init) {
                        var type = this.type === tt._in ? "ForInStatement" : "ForOfStatement";
                        this.next();
                        node.left = init;
                        node.right = this.parseExpression();
                        this.expect(tt.parenR);
                        node.body = this.parseStatement(false);
                        this.labels.pop();
                        return this.finishNode(node, type);
                    };
                    pp$1.parseVar = function (node, isFor, kind) {
                        var this$1 = this;
                        node.declarations = [];
                        node.kind = kind;
                        for (;;) {
                            var decl = this$1.startNode();
                            this$1.parseVarId(decl);
                            if (this$1.eat(tt.eq)) {
                                decl.init = this$1.parseMaybeAssign(isFor);
                            }
                            else if (kind === "const" && !(this$1.type === tt._in || (this$1.options.ecmaVersion >= 6 && this$1.isContextual("of")))) {
                                this$1.unexpected();
                            }
                            else if (decl.id.type != "Identifier" && !(isFor && (this$1.type === tt._in || this$1.isContextual("of")))) {
                                this$1.raise(this$1.lastTokEnd, "Complex binding patterns require an initialization value");
                            }
                            else {
                                decl.init = null;
                            }
                            node.declarations.push(this$1.finishNode(decl, "VariableDeclarator"));
                            if (!this$1.eat(tt.comma))
                                break;
                        }
                        return node;
                    };
                    pp$1.parseVarId = function (decl) {
                        decl.id = this.parseBindingAtom();
                        this.checkLVal(decl.id, true);
                    };
                    pp$1.parseFunction = function (node, isStatement, allowExpressionBody, isAsync) {
                        this.initFunction(node);
                        if (this.options.ecmaVersion >= 6 && !isAsync)
                            node.generator = this.eat(tt.star);
                        if (this.options.ecmaVersion >= 8)
                            node.async = !!isAsync;
                        if (isStatement == null)
                            isStatement = this.type == tt.name;
                        if (isStatement)
                            node.id = this.parseIdent();
                        var oldInGen = this.inGenerator, oldInAsync = this.inAsync, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;
                        this.inGenerator = node.generator;
                        this.inAsync = node.async;
                        this.yieldPos = 0;
                        this.awaitPos = 0;
                        this.inFunction = true;
                        if (!isStatement && this.type === tt.name)
                            node.id = this.parseIdent();
                        this.parseFunctionParams(node);
                        this.parseFunctionBody(node, allowExpressionBody);
                        this.inGenerator = oldInGen;
                        this.inAsync = oldInAsync;
                        this.yieldPos = oldYieldPos;
                        this.awaitPos = oldAwaitPos;
                        this.inFunction = oldInFunc;
                        return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
                    };
                    pp$1.parseFunctionParams = function (node) {
                        this.expect(tt.parenL);
                        node.params = this.parseBindingList(tt.parenR, false, this.options.ecmaVersion >= 8, true);
                        this.checkYieldAwaitInDefaultParams();
                    };
                    pp$1.parseClass = function (node, isStatement) {
                        var this$1 = this;
                        this.next();
                        if (isStatement == null)
                            isStatement = this.type === tt.name;
                        this.parseClassId(node, isStatement);
                        this.parseClassSuper(node);
                        var classBody = this.startNode();
                        var hadConstructor = false;
                        classBody.body = [];
                        this.expect(tt.braceL);
                        while (!this.eat(tt.braceR)) {
                            if (this$1.eat(tt.semi))
                                continue;
                            var method = this$1.startNode();
                            var isGenerator = this$1.eat(tt.star);
                            var isAsync = false;
                            var isMaybeStatic = this$1.type === tt.name && this$1.value === "static";
                            this$1.parsePropertyName(method);
                            method["static"] = isMaybeStatic && this$1.type !== tt.parenL;
                            if (method["static"]) {
                                if (isGenerator)
                                    this$1.unexpected();
                                isGenerator = this$1.eat(tt.star);
                                this$1.parsePropertyName(method);
                            }
                            if (this$1.options.ecmaVersion >= 8 && !isGenerator && !method.computed &&
                                method.key.type === "Identifier" && method.key.name === "async" && this$1.type !== tt.parenL &&
                                !this$1.canInsertSemicolon()) {
                                isAsync = true;
                                this$1.parsePropertyName(method);
                            }
                            method.kind = "method";
                            var isGetSet = false;
                            if (!method.computed) {
                                var key = method.key;
                                if (!isGenerator && !isAsync && key.type === "Identifier" && this$1.type !== tt.parenL && (key.name === "get" || key.name === "set")) {
                                    isGetSet = true;
                                    method.kind = key.name;
                                    key = this$1.parsePropertyName(method);
                                }
                                if (!method["static"] && (key.type === "Identifier" && key.name === "constructor" ||
                                    key.type === "Literal" && key.value === "constructor")) {
                                    if (hadConstructor)
                                        this$1.raise(key.start, "Duplicate constructor in the same class");
                                    if (isGetSet)
                                        this$1.raise(key.start, "Constructor can't have get/set modifier");
                                    if (isGenerator)
                                        this$1.raise(key.start, "Constructor can't be a generator");
                                    if (isAsync)
                                        this$1.raise(key.start, "Constructor can't be an async method");
                                    method.kind = "constructor";
                                    hadConstructor = true;
                                }
                            }
                            this$1.parseClassMethod(classBody, method, isGenerator, isAsync);
                            if (isGetSet) {
                                var paramCount = method.kind === "get" ? 0 : 1;
                                if (method.value.params.length !== paramCount) {
                                    var start = method.value.start;
                                    if (method.kind === "get")
                                        this$1.raiseRecoverable(start, "getter should have no params");
                                    else
                                        this$1.raiseRecoverable(start, "setter should have exactly one param");
                                }
                                else {
                                    if (method.kind === "set" && method.value.params[0].type === "RestElement")
                                        this$1.raiseRecoverable(method.value.params[0].start, "Setter cannot use rest params");
                                }
                            }
                        }
                        node.body = this.finishNode(classBody, "ClassBody");
                        return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
                    };
                    pp$1.parseClassMethod = function (classBody, method, isGenerator, isAsync) {
                        method.value = this.parseMethod(isGenerator, isAsync);
                        classBody.body.push(this.finishNode(method, "MethodDefinition"));
                    };
                    pp$1.parseClassId = function (node, isStatement) {
                        node.id = this.type === tt.name ? this.parseIdent() : isStatement ? this.unexpected() : null;
                    };
                    pp$1.parseClassSuper = function (node) {
                        node.superClass = this.eat(tt._extends) ? this.parseExprSubscripts() : null;
                    };
                    pp$1.parseExport = function (node, exports) {
                        var this$1 = this;
                        this.next();
                        if (this.eat(tt.star)) {
                            this.expectContextual("from");
                            node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
                            this.semicolon();
                            return this.finishNode(node, "ExportAllDeclaration");
                        }
                        if (this.eat(tt._default)) {
                            this.checkExport(exports, "default", this.lastTokStart);
                            var isAsync;
                            if (this.type === tt._function || (isAsync = this.isAsyncFunction())) {
                                var fNode = this.startNode();
                                this.next();
                                if (isAsync)
                                    this.next();
                                node.declaration = this.parseFunction(fNode, null, false, isAsync);
                            }
                            else if (this.type === tt._class) {
                                var cNode = this.startNode();
                                node.declaration = this.parseClass(cNode, null);
                            }
                            else {
                                node.declaration = this.parseMaybeAssign();
                                this.semicolon();
                            }
                            return this.finishNode(node, "ExportDefaultDeclaration");
                        }
                        if (this.shouldParseExportStatement()) {
                            node.declaration = this.parseStatement(true);
                            if (node.declaration.type === "VariableDeclaration")
                                this.checkVariableExport(exports, node.declaration.declarations);
                            else
                                this.checkExport(exports, node.declaration.id.name, node.declaration.id.start);
                            node.specifiers = [];
                            node.source = null;
                        }
                        else {
                            node.declaration = null;
                            node.specifiers = this.parseExportSpecifiers(exports);
                            if (this.eatContextual("from")) {
                                node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
                            }
                            else {
                                for (var i = 0; i < node.specifiers.length; i++) {
                                    if (this$1.keywords.test(node.specifiers[i].local.name) || this$1.reservedWords.test(node.specifiers[i].local.name)) {
                                        this$1.unexpected(node.specifiers[i].local.start);
                                    }
                                }
                                node.source = null;
                            }
                            this.semicolon();
                        }
                        return this.finishNode(node, "ExportNamedDeclaration");
                    };
                    pp$1.checkExport = function (exports, name, pos) {
                        if (!exports)
                            return;
                        if (Object.prototype.hasOwnProperty.call(exports, name))
                            this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
                        exports[name] = true;
                    };
                    pp$1.checkPatternExport = function (exports, pat) {
                        var this$1 = this;
                        var type = pat.type;
                        if (type == "Identifier")
                            this.checkExport(exports, pat.name, pat.start);
                        else if (type == "ObjectPattern")
                            for (var i = 0; i < pat.properties.length; ++i)
                                this$1.checkPatternExport(exports, pat.properties[i].value);
                        else if (type == "ArrayPattern")
                            for (var i$1 = 0; i$1 < pat.elements.length; ++i$1) {
                                var elt = pat.elements[i$1];
                                if (elt)
                                    this$1.checkPatternExport(exports, elt);
                            }
                        else if (type == "AssignmentPattern")
                            this.checkPatternExport(exports, pat.left);
                        else if (type == "ParenthesizedExpression")
                            this.checkPatternExport(exports, pat.expression);
                    };
                    pp$1.checkVariableExport = function (exports, decls) {
                        var this$1 = this;
                        if (!exports)
                            return;
                        for (var i = 0; i < decls.length; i++)
                            this$1.checkPatternExport(exports, decls[i].id);
                    };
                    pp$1.shouldParseExportStatement = function () {
                        return this.type.keyword === "var"
                            || this.type.keyword === "const"
                            || this.type.keyword === "class"
                            || this.type.keyword === "function"
                            || this.isLet()
                            || this.isAsyncFunction();
                    };
                    pp$1.parseExportSpecifiers = function (exports) {
                        var this$1 = this;
                        var nodes = [], first = true;
                        this.expect(tt.braceL);
                        while (!this.eat(tt.braceR)) {
                            if (!first) {
                                this$1.expect(tt.comma);
                                if (this$1.afterTrailingComma(tt.braceR))
                                    break;
                            }
                            else
                                first = false;
                            var node = this$1.startNode();
                            node.local = this$1.parseIdent(true);
                            node.exported = this$1.eatContextual("as") ? this$1.parseIdent(true) : node.local;
                            this$1.checkExport(exports, node.exported.name, node.exported.start);
                            nodes.push(this$1.finishNode(node, "ExportSpecifier"));
                        }
                        return nodes;
                    };
                    pp$1.parseImport = function (node) {
                        this.next();
                        if (this.type === tt.string) {
                            node.specifiers = empty;
                            node.source = this.parseExprAtom();
                        }
                        else {
                            node.specifiers = this.parseImportSpecifiers();
                            this.expectContextual("from");
                            node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected();
                        }
                        this.semicolon();
                        return this.finishNode(node, "ImportDeclaration");
                    };
                    pp$1.parseImportSpecifiers = function () {
                        var this$1 = this;
                        var nodes = [], first = true;
                        if (this.type === tt.name) {
                            var node = this.startNode();
                            node.local = this.parseIdent();
                            this.checkLVal(node.local, true);
                            nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
                            if (!this.eat(tt.comma))
                                return nodes;
                        }
                        if (this.type === tt.star) {
                            var node$1 = this.startNode();
                            this.next();
                            this.expectContextual("as");
                            node$1.local = this.parseIdent();
                            this.checkLVal(node$1.local, true);
                            nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"));
                            return nodes;
                        }
                        this.expect(tt.braceL);
                        while (!this.eat(tt.braceR)) {
                            if (!first) {
                                this$1.expect(tt.comma);
                                if (this$1.afterTrailingComma(tt.braceR))
                                    break;
                            }
                            else
                                first = false;
                            var node$2 = this$1.startNode();
                            node$2.imported = this$1.parseIdent(true);
                            if (this$1.eatContextual("as")) {
                                node$2.local = this$1.parseIdent();
                            }
                            else {
                                node$2.local = node$2.imported;
                                if (this$1.isKeyword(node$2.local.name))
                                    this$1.unexpected(node$2.local.start);
                                if (this$1.reservedWordsStrict.test(node$2.local.name))
                                    this$1.raiseRecoverable(node$2.local.start, "The keyword '" + node$2.local.name + "' is reserved");
                            }
                            this$1.checkLVal(node$2.local, true);
                            nodes.push(this$1.finishNode(node$2, "ImportSpecifier"));
                        }
                        return nodes;
                    };
                    var pp$2 = Parser.prototype;
                    pp$2.toAssignable = function (node, isBinding) {
                        var this$1 = this;
                        if (this.options.ecmaVersion >= 6 && node) {
                            switch (node.type) {
                                case "Identifier":
                                    if (this.inAsync && node.name === "await")
                                        this.raise(node.start, "Can not use 'await' as identifier inside an async function");
                                    break;
                                case "ObjectPattern":
                                case "ArrayPattern":
                                    break;
                                case "ObjectExpression":
                                    node.type = "ObjectPattern";
                                    for (var i = 0; i < node.properties.length; i++) {
                                        var prop = node.properties[i];
                                        if (prop.kind !== "init")
                                            this$1.raise(prop.key.start, "Object pattern can't contain getter or setter");
                                        this$1.toAssignable(prop.value, isBinding);
                                    }
                                    break;
                                case "ArrayExpression":
                                    node.type = "ArrayPattern";
                                    this.toAssignableList(node.elements, isBinding);
                                    break;
                                case "AssignmentExpression":
                                    if (node.operator === "=") {
                                        node.type = "AssignmentPattern";
                                        delete node.operator;
                                        this.toAssignable(node.left, isBinding);
                                    }
                                    else {
                                        this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
                                        break;
                                    }
                                case "AssignmentPattern":
                                    break;
                                case "ParenthesizedExpression":
                                    node.expression = this.toAssignable(node.expression, isBinding);
                                    break;
                                case "MemberExpression":
                                    if (!isBinding)
                                        break;
                                default:
                                    this.raise(node.start, "Assigning to rvalue");
                            }
                        }
                        return node;
                    };
                    pp$2.toAssignableList = function (exprList, isBinding) {
                        var this$1 = this;
                        var end = exprList.length;
                        if (end) {
                            var last = exprList[end - 1];
                            if (last && last.type == "RestElement") {
                                --end;
                            }
                            else if (last && last.type == "SpreadElement") {
                                last.type = "RestElement";
                                var arg = last.argument;
                                this.toAssignable(arg, isBinding);
                                if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern")
                                    this.unexpected(arg.start);
                                --end;
                            }
                            if (isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
                                this.unexpected(last.argument.start);
                        }
                        for (var i = 0; i < end; i++) {
                            var elt = exprList[i];
                            if (elt)
                                this$1.toAssignable(elt, isBinding);
                        }
                        return exprList;
                    };
                    pp$2.parseSpread = function (refDestructuringErrors) {
                        var node = this.startNode();
                        this.next();
                        node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
                        return this.finishNode(node, "SpreadElement");
                    };
                    pp$2.parseRest = function (allowNonIdent) {
                        var node = this.startNode();
                        this.next();
                        if (allowNonIdent)
                            node.argument = this.type === tt.name ? this.parseIdent() : this.unexpected();
                        else
                            node.argument = this.type === tt.name || this.type === tt.bracketL ? this.parseBindingAtom() : this.unexpected();
                        return this.finishNode(node, "RestElement");
                    };
                    pp$2.parseBindingAtom = function () {
                        if (this.options.ecmaVersion < 6)
                            return this.parseIdent();
                        switch (this.type) {
                            case tt.name:
                                return this.parseIdent();
                            case tt.bracketL:
                                var node = this.startNode();
                                this.next();
                                node.elements = this.parseBindingList(tt.bracketR, true, true);
                                return this.finishNode(node, "ArrayPattern");
                            case tt.braceL:
                                return this.parseObj(true);
                            default:
                                this.unexpected();
                        }
                    };
                    pp$2.parseBindingList = function (close, allowEmpty, allowTrailingComma, allowNonIdent) {
                        var this$1 = this;
                        var elts = [], first = true;
                        while (!this.eat(close)) {
                            if (first)
                                first = false;
                            else
                                this$1.expect(tt.comma);
                            if (allowEmpty && this$1.type === tt.comma) {
                                elts.push(null);
                            }
                            else if (allowTrailingComma && this$1.afterTrailingComma(close)) {
                                break;
                            }
                            else if (this$1.type === tt.ellipsis) {
                                var rest = this$1.parseRest(allowNonIdent);
                                this$1.parseBindingListItem(rest);
                                elts.push(rest);
                                if (this$1.type === tt.comma)
                                    this$1.raise(this$1.start, "Comma is not permitted after the rest element");
                                this$1.expect(close);
                                break;
                            }
                            else {
                                var elem = this$1.parseMaybeDefault(this$1.start, this$1.startLoc);
                                this$1.parseBindingListItem(elem);
                                elts.push(elem);
                            }
                        }
                        return elts;
                    };
                    pp$2.parseBindingListItem = function (param) {
                        return param;
                    };
                    pp$2.parseMaybeDefault = function (startPos, startLoc, left) {
                        left = left || this.parseBindingAtom();
                        if (this.options.ecmaVersion < 6 || !this.eat(tt.eq))
                            return left;
                        var node = this.startNodeAt(startPos, startLoc);
                        node.left = left;
                        node.right = this.parseMaybeAssign();
                        return this.finishNode(node, "AssignmentPattern");
                    };
                    pp$2.checkLVal = function (expr, isBinding, checkClashes) {
                        var this$1 = this;
                        switch (expr.type) {
                            case "Identifier":
                                if (this.strict && this.reservedWordsStrictBind.test(expr.name))
                                    this.raiseRecoverable(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
                                if (checkClashes) {
                                    if (has(checkClashes, expr.name))
                                        this.raiseRecoverable(expr.start, "Argument name clash");
                                    checkClashes[expr.name] = true;
                                }
                                break;
                            case "MemberExpression":
                                if (isBinding)
                                    this.raiseRecoverable(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression");
                                break;
                            case "ObjectPattern":
                                for (var i = 0; i < expr.properties.length; i++)
                                    this$1.checkLVal(expr.properties[i].value, isBinding, checkClashes);
                                break;
                            case "ArrayPattern":
                                for (var i$1 = 0; i$1 < expr.elements.length; i$1++) {
                                    var elem = expr.elements[i$1];
                                    if (elem)
                                        this$1.checkLVal(elem, isBinding, checkClashes);
                                }
                                break;
                            case "AssignmentPattern":
                                this.checkLVal(expr.left, isBinding, checkClashes);
                                break;
                            case "RestElement":
                                this.checkLVal(expr.argument, isBinding, checkClashes);
                                break;
                            case "ParenthesizedExpression":
                                this.checkLVal(expr.expression, isBinding, checkClashes);
                                break;
                            default:
                                this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue");
                        }
                    };
                    var pp$3 = Parser.prototype;
                    pp$3.checkPropClash = function (prop, propHash) {
                        if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
                            return;
                        var key = prop.key;
                        var name;
                        switch (key.type) {
                            case "Identifier":
                                name = key.name;
                                break;
                            case "Literal":
                                name = String(key.value);
                                break;
                            default: return;
                        }
                        var kind = prop.kind;
                        if (this.options.ecmaVersion >= 6) {
                            if (name === "__proto__" && kind === "init") {
                                if (propHash.proto)
                                    this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
                                propHash.proto = true;
                            }
                            return;
                        }
                        name = "$" + name;
                        var other = propHash[name];
                        if (other) {
                            var isGetSet = kind !== "init";
                            if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init))
                                this.raiseRecoverable(key.start, "Redefinition of property");
                        }
                        else {
                            other = propHash[name] = {
                                init: false,
                                get: false,
                                set: false
                            };
                        }
                        other[kind] = true;
                    };
                    pp$3.parseExpression = function (noIn, refDestructuringErrors) {
                        var this$1 = this;
                        var startPos = this.start, startLoc = this.startLoc;
                        var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
                        if (this.type === tt.comma) {
                            var node = this.startNodeAt(startPos, startLoc);
                            node.expressions = [expr];
                            while (this.eat(tt.comma))
                                node.expressions.push(this$1.parseMaybeAssign(noIn, refDestructuringErrors));
                            return this.finishNode(node, "SequenceExpression");
                        }
                        return expr;
                    };
                    pp$3.parseMaybeAssign = function (noIn, refDestructuringErrors, afterLeftParse) {
                        if (this.inGenerator && this.isContextual("yield"))
                            return this.parseYield();
                        var ownDestructuringErrors = false, oldParenAssign = -1;
                        if (refDestructuringErrors) {
                            oldParenAssign = refDestructuringErrors.parenthesizedAssign;
                            refDestructuringErrors.parenthesizedAssign = -1;
                        }
                        else {
                            refDestructuringErrors = new DestructuringErrors;
                            ownDestructuringErrors = true;
                        }
                        var startPos = this.start, startLoc = this.startLoc;
                        if (this.type == tt.parenL || this.type == tt.name)
                            this.potentialArrowAt = this.start;
                        var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
                        if (afterLeftParse)
                            left = afterLeftParse.call(this, left, startPos, startLoc);
                        if (this.type.isAssign) {
                            this.checkPatternErrors(refDestructuringErrors, true);
                            if (!ownDestructuringErrors)
                                DestructuringErrors.call(refDestructuringErrors);
                            var node = this.startNodeAt(startPos, startLoc);
                            node.operator = this.value;
                            node.left = this.type === tt.eq ? this.toAssignable(left) : left;
                            refDestructuringErrors.shorthandAssign = -1;
                            this.checkLVal(left);
                            this.next();
                            node.right = this.parseMaybeAssign(noIn);
                            return this.finishNode(node, "AssignmentExpression");
                        }
                        else {
                            if (ownDestructuringErrors)
                                this.checkExpressionErrors(refDestructuringErrors, true);
                        }
                        if (oldParenAssign > -1)
                            refDestructuringErrors.parenthesizedAssign = oldParenAssign;
                        return left;
                    };
                    pp$3.parseMaybeConditional = function (noIn, refDestructuringErrors) {
                        var startPos = this.start, startLoc = this.startLoc;
                        var expr = this.parseExprOps(noIn, refDestructuringErrors);
                        if (this.checkExpressionErrors(refDestructuringErrors))
                            return expr;
                        if (this.eat(tt.question)) {
                            var node = this.startNodeAt(startPos, startLoc);
                            node.test = expr;
                            node.consequent = this.parseMaybeAssign();
                            this.expect(tt.colon);
                            node.alternate = this.parseMaybeAssign(noIn);
                            return this.finishNode(node, "ConditionalExpression");
                        }
                        return expr;
                    };
                    pp$3.parseExprOps = function (noIn, refDestructuringErrors) {
                        var startPos = this.start, startLoc = this.startLoc;
                        var expr = this.parseMaybeUnary(refDestructuringErrors, false);
                        if (this.checkExpressionErrors(refDestructuringErrors))
                            return expr;
                        return this.parseExprOp(expr, startPos, startLoc, -1, noIn);
                    };
                    pp$3.parseExprOp = function (left, leftStartPos, leftStartLoc, minPrec, noIn) {
                        var prec = this.type.binop;
                        if (prec != null && (!noIn || this.type !== tt._in)) {
                            if (prec > minPrec) {
                                var logical = this.type === tt.logicalOR || this.type === tt.logicalAND;
                                var op = this.value;
                                this.next();
                                var startPos = this.start, startLoc = this.startLoc;
                                var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
                                var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical);
                                return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn);
                            }
                        }
                        return left;
                    };
                    pp$3.buildBinary = function (startPos, startLoc, left, right, op, logical) {
                        var node = this.startNodeAt(startPos, startLoc);
                        node.left = left;
                        node.operator = op;
                        node.right = right;
                        return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
                    };
                    pp$3.parseMaybeUnary = function (refDestructuringErrors, sawUnary) {
                        var this$1 = this;
                        var startPos = this.start, startLoc = this.startLoc, expr;
                        if (this.inAsync && this.isContextual("await")) {
                            expr = this.parseAwait(refDestructuringErrors);
                            sawUnary = true;
                        }
                        else if (this.type.prefix) {
                            var node = this.startNode(), update = this.type === tt.incDec;
                            node.operator = this.value;
                            node.prefix = true;
                            this.next();
                            node.argument = this.parseMaybeUnary(null, true);
                            this.checkExpressionErrors(refDestructuringErrors, true);
                            if (update)
                                this.checkLVal(node.argument);
                            else if (this.strict && node.operator === "delete" &&
                                node.argument.type === "Identifier")
                                this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
                            else
                                sawUnary = true;
                            expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
                        }
                        else {
                            expr = this.parseExprSubscripts(refDestructuringErrors);
                            if (this.checkExpressionErrors(refDestructuringErrors))
                                return expr;
                            while (this.type.postfix && !this.canInsertSemicolon()) {
                                var node$1 = this$1.startNodeAt(startPos, startLoc);
                                node$1.operator = this$1.value;
                                node$1.prefix = false;
                                node$1.argument = expr;
                                this$1.checkLVal(expr);
                                this$1.next();
                                expr = this$1.finishNode(node$1, "UpdateExpression");
                            }
                        }
                        if (!sawUnary && this.eat(tt.starstar))
                            return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false);
                        else
                            return expr;
                    };
                    pp$3.parseExprSubscripts = function (refDestructuringErrors) {
                        var startPos = this.start, startLoc = this.startLoc;
                        var expr = this.parseExprAtom(refDestructuringErrors);
                        var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
                        if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts)
                            return expr;
                        var result = this.parseSubscripts(expr, startPos, startLoc);
                        if (refDestructuringErrors && result.type === "MemberExpression") {
                            if (refDestructuringErrors.parenthesizedAssign >= result.start)
                                refDestructuringErrors.parenthesizedAssign = -1;
                            if (refDestructuringErrors.parenthesizedBind >= result.start)
                                refDestructuringErrors.parenthesizedBind = -1;
                        }
                        return result;
                    };
                    pp$3.parseSubscripts = function (base, startPos, startLoc, noCalls) {
                        var this$1 = this;
                        var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
                            this.lastTokEnd == base.end && !this.canInsertSemicolon();
                        for (var computed;;) {
                            if ((computed = this$1.eat(tt.bracketL)) || this$1.eat(tt.dot)) {
                                var node = this$1.startNodeAt(startPos, startLoc);
                                node.object = base;
                                node.property = computed ? this$1.parseExpression() : this$1.parseIdent(true);
                                node.computed = !!computed;
                                if (computed)
                                    this$1.expect(tt.bracketR);
                                base = this$1.finishNode(node, "MemberExpression");
                            }
                            else if (!noCalls && this$1.eat(tt.parenL)) {
                                var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this$1.yieldPos, oldAwaitPos = this$1.awaitPos;
                                this$1.yieldPos = 0;
                                this$1.awaitPos = 0;
                                var exprList = this$1.parseExprList(tt.parenR, this$1.options.ecmaVersion >= 8, false, refDestructuringErrors);
                                if (maybeAsyncArrow && !this$1.canInsertSemicolon() && this$1.eat(tt.arrow)) {
                                    this$1.checkPatternErrors(refDestructuringErrors, false);
                                    this$1.checkYieldAwaitInDefaultParams();
                                    this$1.yieldPos = oldYieldPos;
                                    this$1.awaitPos = oldAwaitPos;
                                    return this$1.parseArrowExpression(this$1.startNodeAt(startPos, startLoc), exprList, true);
                                }
                                this$1.checkExpressionErrors(refDestructuringErrors, true);
                                this$1.yieldPos = oldYieldPos || this$1.yieldPos;
                                this$1.awaitPos = oldAwaitPos || this$1.awaitPos;
                                var node$1 = this$1.startNodeAt(startPos, startLoc);
                                node$1.callee = base;
                                node$1.arguments = exprList;
                                base = this$1.finishNode(node$1, "CallExpression");
                            }
                            else if (this$1.type === tt.backQuote) {
                                var node$2 = this$1.startNodeAt(startPos, startLoc);
                                node$2.tag = base;
                                node$2.quasi = this$1.parseTemplate();
                                base = this$1.finishNode(node$2, "TaggedTemplateExpression");
                            }
                            else {
                                return base;
                            }
                        }
                    };
                    pp$3.parseExprAtom = function (refDestructuringErrors) {
                        var node, canBeArrow = this.potentialArrowAt == this.start;
                        switch (this.type) {
                            case tt._super:
                                if (!this.inFunction)
                                    this.raise(this.start, "'super' outside of function or class");
                            case tt._this:
                                var type = this.type === tt._this ? "ThisExpression" : "Super";
                                node = this.startNode();
                                this.next();
                                return this.finishNode(node, type);
                            case tt.name:
                                var startPos = this.start, startLoc = this.startLoc;
                                var id = this.parseIdent(this.type !== tt.name);
                                if (this.options.ecmaVersion >= 8 && id.name === "async" && !this.canInsertSemicolon() && this.eat(tt._function))
                                    return this.parseFunction(this.startNodeAt(startPos, startLoc), false, false, true);
                                if (canBeArrow && !this.canInsertSemicolon()) {
                                    if (this.eat(tt.arrow))
                                        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false);
                                    if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === tt.name) {
                                        id = this.parseIdent();
                                        if (this.canInsertSemicolon() || !this.eat(tt.arrow))
                                            this.unexpected();
                                        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true);
                                    }
                                }
                                return id;
                            case tt.regexp:
                                var value = this.value;
                                node = this.parseLiteral(value.value);
                                node.regex = { pattern: value.pattern, flags: value.flags };
                                return node;
                            case tt.num:
                            case tt.string:
                                return this.parseLiteral(this.value);
                            case tt._null:
                            case tt._true:
                            case tt._false:
                                node = this.startNode();
                                node.value = this.type === tt._null ? null : this.type === tt._true;
                                node.raw = this.type.keyword;
                                this.next();
                                return this.finishNode(node, "Literal");
                            case tt.parenL:
                                var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow);
                                if (refDestructuringErrors) {
                                    if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
                                        refDestructuringErrors.parenthesizedAssign = start;
                                    if (refDestructuringErrors.parenthesizedBind < 0)
                                        refDestructuringErrors.parenthesizedBind = start;
                                }
                                return expr;
                            case tt.bracketL:
                                node = this.startNode();
                                this.next();
                                node.elements = this.parseExprList(tt.bracketR, true, true, refDestructuringErrors);
                                return this.finishNode(node, "ArrayExpression");
                            case tt.braceL:
                                return this.parseObj(false, refDestructuringErrors);
                            case tt._function:
                                node = this.startNode();
                                this.next();
                                return this.parseFunction(node, false);
                            case tt._class:
                                return this.parseClass(this.startNode(), false);
                            case tt._new:
                                return this.parseNew();
                            case tt.backQuote:
                                return this.parseTemplate();
                            default:
                                this.unexpected();
                        }
                    };
                    pp$3.parseLiteral = function (value) {
                        var node = this.startNode();
                        node.value = value;
                        node.raw = this.input.slice(this.start, this.end);
                        this.next();
                        return this.finishNode(node, "Literal");
                    };
                    pp$3.parseParenExpression = function () {
                        this.expect(tt.parenL);
                        var val = this.parseExpression();
                        this.expect(tt.parenR);
                        return val;
                    };
                    pp$3.parseParenAndDistinguishExpression = function (canBeArrow) {
                        var this$1 = this;
                        var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
                        if (this.options.ecmaVersion >= 6) {
                            this.next();
                            var innerStartPos = this.start, innerStartLoc = this.startLoc;
                            var exprList = [], first = true, lastIsComma = false;
                            var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart, innerParenStart;
                            this.yieldPos = 0;
                            this.awaitPos = 0;
                            while (this.type !== tt.parenR) {
                                first ? first = false : this$1.expect(tt.comma);
                                if (allowTrailingComma && this$1.afterTrailingComma(tt.parenR, true)) {
                                    lastIsComma = true;
                                    break;
                                }
                                else if (this$1.type === tt.ellipsis) {
                                    spreadStart = this$1.start;
                                    exprList.push(this$1.parseParenItem(this$1.parseRest()));
                                    if (this$1.type === tt.comma)
                                        this$1.raise(this$1.start, "Comma is not permitted after the rest element");
                                    break;
                                }
                                else {
                                    if (this$1.type === tt.parenL && !innerParenStart) {
                                        innerParenStart = this$1.start;
                                    }
                                    exprList.push(this$1.parseMaybeAssign(false, refDestructuringErrors, this$1.parseParenItem));
                                }
                            }
                            var innerEndPos = this.start, innerEndLoc = this.startLoc;
                            this.expect(tt.parenR);
                            if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
                                this.checkPatternErrors(refDestructuringErrors, false);
                                this.checkYieldAwaitInDefaultParams();
                                if (innerParenStart)
                                    this.unexpected(innerParenStart);
                                this.yieldPos = oldYieldPos;
                                this.awaitPos = oldAwaitPos;
                                return this.parseParenArrowList(startPos, startLoc, exprList);
                            }
                            if (!exprList.length || lastIsComma)
                                this.unexpected(this.lastTokStart);
                            if (spreadStart)
                                this.unexpected(spreadStart);
                            this.checkExpressionErrors(refDestructuringErrors, true);
                            this.yieldPos = oldYieldPos || this.yieldPos;
                            this.awaitPos = oldAwaitPos || this.awaitPos;
                            if (exprList.length > 1) {
                                val = this.startNodeAt(innerStartPos, innerStartLoc);
                                val.expressions = exprList;
                                this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
                            }
                            else {
                                val = exprList[0];
                            }
                        }
                        else {
                            val = this.parseParenExpression();
                        }
                        if (this.options.preserveParens) {
                            var par = this.startNodeAt(startPos, startLoc);
                            par.expression = val;
                            return this.finishNode(par, "ParenthesizedExpression");
                        }
                        else {
                            return val;
                        }
                    };
                    pp$3.parseParenItem = function (item) {
                        return item;
                    };
                    pp$3.parseParenArrowList = function (startPos, startLoc, exprList) {
                        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList);
                    };
                    var empty$1 = [];
                    pp$3.parseNew = function () {
                        var node = this.startNode();
                        var meta = this.parseIdent(true);
                        if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
                            node.meta = meta;
                            node.property = this.parseIdent(true);
                            if (node.property.name !== "target")
                                this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target");
                            if (!this.inFunction)
                                this.raiseRecoverable(node.start, "new.target can only be used in functions");
                            return this.finishNode(node, "MetaProperty");
                        }
                        var startPos = this.start, startLoc = this.startLoc;
                        node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
                        if (this.eat(tt.parenL))
                            node.arguments = this.parseExprList(tt.parenR, this.options.ecmaVersion >= 8, false);
                        else
                            node.arguments = empty$1;
                        return this.finishNode(node, "NewExpression");
                    };
                    pp$3.parseTemplateElement = function () {
                        var elem = this.startNode();
                        elem.value = {
                            raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, '\n'),
                            cooked: this.value
                        };
                        this.next();
                        elem.tail = this.type === tt.backQuote;
                        return this.finishNode(elem, "TemplateElement");
                    };
                    pp$3.parseTemplate = function () {
                        var this$1 = this;
                        var node = this.startNode();
                        this.next();
                        node.expressions = [];
                        var curElt = this.parseTemplateElement();
                        node.quasis = [curElt];
                        while (!curElt.tail) {
                            this$1.expect(tt.dollarBraceL);
                            node.expressions.push(this$1.parseExpression());
                            this$1.expect(tt.braceR);
                            node.quasis.push(curElt = this$1.parseTemplateElement());
                        }
                        this.next();
                        return this.finishNode(node, "TemplateLiteral");
                    };
                    pp$3.parseObj = function (isPattern, refDestructuringErrors) {
                        var this$1 = this;
                        var node = this.startNode(), first = true, propHash = {};
                        node.properties = [];
                        this.next();
                        while (!this.eat(tt.braceR)) {
                            if (!first) {
                                this$1.expect(tt.comma);
                                if (this$1.afterTrailingComma(tt.braceR))
                                    break;
                            }
                            else
                                first = false;
                            var prop = this$1.startNode(), isGenerator, isAsync, startPos, startLoc;
                            if (this$1.options.ecmaVersion >= 6) {
                                prop.method = false;
                                prop.shorthand = false;
                                if (isPattern || refDestructuringErrors) {
                                    startPos = this$1.start;
                                    startLoc = this$1.startLoc;
                                }
                                if (!isPattern)
                                    isGenerator = this$1.eat(tt.star);
                            }
                            this$1.parsePropertyName(prop);
                            if (!isPattern && this$1.options.ecmaVersion >= 8 && !isGenerator && !prop.computed &&
                                prop.key.type === "Identifier" && prop.key.name === "async" && this$1.type !== tt.parenL &&
                                this$1.type !== tt.colon && !this$1.canInsertSemicolon()) {
                                isAsync = true;
                                this$1.parsePropertyName(prop, refDestructuringErrors);
                            }
                            else {
                                isAsync = false;
                            }
                            this$1.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors);
                            this$1.checkPropClash(prop, propHash);
                            node.properties.push(this$1.finishNode(prop, "Property"));
                        }
                        return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
                    };
                    pp$3.parsePropertyValue = function (prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors) {
                        if ((isGenerator || isAsync) && this.type === tt.colon)
                            this.unexpected();
                        if (this.eat(tt.colon)) {
                            prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
                            prop.kind = "init";
                        }
                        else if (this.options.ecmaVersion >= 6 && this.type === tt.parenL) {
                            if (isPattern)
                                this.unexpected();
                            prop.kind = "init";
                            prop.method = true;
                            prop.value = this.parseMethod(isGenerator, isAsync);
                        }
                        else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
                            (prop.key.name === "get" || prop.key.name === "set") &&
                            (this.type != tt.comma && this.type != tt.braceR)) {
                            if (isGenerator || isAsync || isPattern)
                                this.unexpected();
                            prop.kind = prop.key.name;
                            this.parsePropertyName(prop);
                            prop.value = this.parseMethod(false);
                            var paramCount = prop.kind === "get" ? 0 : 1;
                            if (prop.value.params.length !== paramCount) {
                                var start = prop.value.start;
                                if (prop.kind === "get")
                                    this.raiseRecoverable(start, "getter should have no params");
                                else
                                    this.raiseRecoverable(start, "setter should have exactly one param");
                            }
                            else {
                                if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
                                    this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
                            }
                        }
                        else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
                            if (this.keywords.test(prop.key.name) ||
                                (this.strict ? this.reservedWordsStrict : this.reservedWords).test(prop.key.name) ||
                                (this.inGenerator && prop.key.name == "yield") ||
                                (this.inAsync && prop.key.name == "await"))
                                this.raiseRecoverable(prop.key.start, "'" + prop.key.name + "' can not be used as shorthand property");
                            prop.kind = "init";
                            if (isPattern) {
                                prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
                            }
                            else if (this.type === tt.eq && refDestructuringErrors) {
                                if (refDestructuringErrors.shorthandAssign < 0)
                                    refDestructuringErrors.shorthandAssign = this.start;
                                prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
                            }
                            else {
                                prop.value = prop.key;
                            }
                            prop.shorthand = true;
                        }
                        else
                            this.unexpected();
                    };
                    pp$3.parsePropertyName = function (prop) {
                        if (this.options.ecmaVersion >= 6) {
                            if (this.eat(tt.bracketL)) {
                                prop.computed = true;
                                prop.key = this.parseMaybeAssign();
                                this.expect(tt.bracketR);
                                return prop.key;
                            }
                            else {
                                prop.computed = false;
                            }
                        }
                        return prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom() : this.parseIdent(true);
                    };
                    pp$3.initFunction = function (node) {
                        node.id = null;
                        if (this.options.ecmaVersion >= 6) {
                            node.generator = false;
                            node.expression = false;
                        }
                        if (this.options.ecmaVersion >= 8)
                            node.async = false;
                    };
                    pp$3.parseMethod = function (isGenerator, isAsync) {
                        var node = this.startNode(), oldInGen = this.inGenerator, oldInAsync = this.inAsync, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;
                        this.initFunction(node);
                        if (this.options.ecmaVersion >= 6)
                            node.generator = isGenerator;
                        if (this.options.ecmaVersion >= 8)
                            node.async = !!isAsync;
                        this.inGenerator = node.generator;
                        this.inAsync = node.async;
                        this.yieldPos = 0;
                        this.awaitPos = 0;
                        this.inFunction = true;
                        this.expect(tt.parenL);
                        node.params = this.parseBindingList(tt.parenR, false, this.options.ecmaVersion >= 8);
                        this.checkYieldAwaitInDefaultParams();
                        this.parseFunctionBody(node, false);
                        this.inGenerator = oldInGen;
                        this.inAsync = oldInAsync;
                        this.yieldPos = oldYieldPos;
                        this.awaitPos = oldAwaitPos;
                        this.inFunction = oldInFunc;
                        return this.finishNode(node, "FunctionExpression");
                    };
                    pp$3.parseArrowExpression = function (node, params, isAsync) {
                        var oldInGen = this.inGenerator, oldInAsync = this.inAsync, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;
                        this.initFunction(node);
                        if (this.options.ecmaVersion >= 8)
                            node.async = !!isAsync;
                        this.inGenerator = false;
                        this.inAsync = node.async;
                        this.yieldPos = 0;
                        this.awaitPos = 0;
                        this.inFunction = true;
                        node.params = this.toAssignableList(params, true);
                        this.parseFunctionBody(node, true);
                        this.inGenerator = oldInGen;
                        this.inAsync = oldInAsync;
                        this.yieldPos = oldYieldPos;
                        this.awaitPos = oldAwaitPos;
                        this.inFunction = oldInFunc;
                        return this.finishNode(node, "ArrowFunctionExpression");
                    };
                    pp$3.parseFunctionBody = function (node, isArrowFunction) {
                        var isExpression = isArrowFunction && this.type !== tt.braceL;
                        var oldStrict = this.strict, useStrict = false;
                        if (isExpression) {
                            node.body = this.parseMaybeAssign();
                            node.expression = true;
                        }
                        else {
                            var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
                            if (!oldStrict || nonSimple) {
                                useStrict = this.strictDirective(this.end);
                                if (useStrict && nonSimple)
                                    this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
                            }
                            var oldLabels = this.labels;
                            this.labels = [];
                            if (useStrict)
                                this.strict = true;
                            node.body = this.parseBlock(true);
                            node.expression = false;
                            this.labels = oldLabels;
                        }
                        if (oldStrict || useStrict) {
                            this.strict = true;
                            if (node.id)
                                this.checkLVal(node.id, true);
                            this.checkParams(node);
                            this.strict = oldStrict;
                        }
                        else if (isArrowFunction || !this.isSimpleParamList(node.params)) {
                            this.checkParams(node);
                        }
                    };
                    pp$3.isSimpleParamList = function (params) {
                        for (var i = 0; i < params.length; i++)
                            if (params[i].type !== "Identifier")
                                return false;
                        return true;
                    };
                    pp$3.checkParams = function (node) {
                        var this$1 = this;
                        var nameHash = {};
                        for (var i = 0; i < node.params.length; i++)
                            this$1.checkLVal(node.params[i], true, nameHash);
                    };
                    pp$3.parseExprList = function (close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
                        var this$1 = this;
                        var elts = [], first = true;
                        while (!this.eat(close)) {
                            if (!first) {
                                this$1.expect(tt.comma);
                                if (allowTrailingComma && this$1.afterTrailingComma(close))
                                    break;
                            }
                            else
                                first = false;
                            var elt;
                            if (allowEmpty && this$1.type === tt.comma)
                                elt = null;
                            else if (this$1.type === tt.ellipsis) {
                                elt = this$1.parseSpread(refDestructuringErrors);
                                if (refDestructuringErrors && this$1.type === tt.comma && refDestructuringErrors.trailingComma < 0)
                                    refDestructuringErrors.trailingComma = this$1.start;
                            }
                            else {
                                elt = this$1.parseMaybeAssign(false, refDestructuringErrors);
                            }
                            elts.push(elt);
                        }
                        return elts;
                    };
                    pp$3.parseIdent = function (liberal) {
                        var node = this.startNode();
                        if (liberal && this.options.allowReserved == "never")
                            liberal = false;
                        if (this.type === tt.name) {
                            if (!liberal && (this.strict ? this.reservedWordsStrict : this.reservedWords).test(this.value) &&
                                (this.options.ecmaVersion >= 6 ||
                                    this.input.slice(this.start, this.end).indexOf("\\") == -1))
                                this.raiseRecoverable(this.start, "The keyword '" + this.value + "' is reserved");
                            if (this.inGenerator && this.value === "yield")
                                this.raiseRecoverable(this.start, "Can not use 'yield' as identifier inside a generator");
                            if (this.inAsync && this.value === "await")
                                this.raiseRecoverable(this.start, "Can not use 'await' as identifier inside an async function");
                            node.name = this.value;
                        }
                        else if (liberal && this.type.keyword) {
                            node.name = this.type.keyword;
                        }
                        else {
                            this.unexpected();
                        }
                        this.next();
                        return this.finishNode(node, "Identifier");
                    };
                    pp$3.parseYield = function () {
                        if (!this.yieldPos)
                            this.yieldPos = this.start;
                        var node = this.startNode();
                        this.next();
                        if (this.type == tt.semi || this.canInsertSemicolon() || (this.type != tt.star && !this.type.startsExpr)) {
                            node.delegate = false;
                            node.argument = null;
                        }
                        else {
                            node.delegate = this.eat(tt.star);
                            node.argument = this.parseMaybeAssign();
                        }
                        return this.finishNode(node, "YieldExpression");
                    };
                    pp$3.parseAwait = function () {
                        if (!this.awaitPos)
                            this.awaitPos = this.start;
                        var node = this.startNode();
                        this.next();
                        node.argument = this.parseMaybeUnary(null, true);
                        return this.finishNode(node, "AwaitExpression");
                    };
                    var pp$4 = Parser.prototype;
                    pp$4.raise = function (pos, message) {
                        var loc = getLineInfo(this.input, pos);
                        message += " (" + loc.line + ":" + loc.column + ")";
                        var err = new SyntaxError(message);
                        err.pos = pos;
                        err.loc = loc;
                        err.raisedAt = this.pos;
                        throw err;
                    };
                    pp$4.raiseRecoverable = pp$4.raise;
                    pp$4.curPosition = function () {
                        if (this.options.locations) {
                            return new Position(this.curLine, this.pos - this.lineStart);
                        }
                    };
                    var Node = function Node(parser, pos, loc) {
                        this.type = "";
                        this.start = pos;
                        this.end = 0;
                        if (parser.options.locations)
                            this.loc = new SourceLocation(parser, loc);
                        if (parser.options.directSourceFile)
                            this.sourceFile = parser.options.directSourceFile;
                        if (parser.options.ranges)
                            this.range = [pos, 0];
                    };
                    var pp$5 = Parser.prototype;
                    pp$5.startNode = function () {
                        return new Node(this, this.start, this.startLoc);
                    };
                    pp$5.startNodeAt = function (pos, loc) {
                        return new Node(this, pos, loc);
                    };
                    function finishNodeAt(node, type, pos, loc) {
                        node.type = type;
                        node.end = pos;
                        if (this.options.locations)
                            node.loc.end = loc;
                        if (this.options.ranges)
                            node.range[1] = pos;
                        return node;
                    }
                    pp$5.finishNode = function (node, type) {
                        return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
                    };
                    pp$5.finishNodeAt = function (node, type, pos, loc) {
                        return finishNodeAt.call(this, node, type, pos, loc);
                    };
                    var TokContext = function TokContext(token, isExpr, preserveSpace, override) {
                        this.token = token;
                        this.isExpr = !!isExpr;
                        this.preserveSpace = !!preserveSpace;
                        this.override = override;
                    };
                    var types = {
                        b_stat: new TokContext("{", false),
                        b_expr: new TokContext("{", true),
                        b_tmpl: new TokContext("${", true),
                        p_stat: new TokContext("(", false),
                        p_expr: new TokContext("(", true),
                        q_tmpl: new TokContext("`", true, true, function (p) { return p.readTmplToken(); }),
                        f_expr: new TokContext("function", true)
                    };
                    var pp$6 = Parser.prototype;
                    pp$6.initialContext = function () {
                        return [types.b_stat];
                    };
                    pp$6.braceIsBlock = function (prevType) {
                        if (prevType === tt.colon) {
                            var parent = this.curContext();
                            if (parent === types.b_stat || parent === types.b_expr)
                                return !parent.isExpr;
                        }
                        if (prevType === tt._return)
                            return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
                        if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof || prevType === tt.parenR)
                            return true;
                        if (prevType == tt.braceL)
                            return this.curContext() === types.b_stat;
                        return !this.exprAllowed;
                    };
                    pp$6.updateContext = function (prevType) {
                        var update, type = this.type;
                        if (type.keyword && prevType == tt.dot)
                            this.exprAllowed = false;
                        else if (update = type.updateContext)
                            update.call(this, prevType);
                        else
                            this.exprAllowed = type.beforeExpr;
                    };
                    tt.parenR.updateContext = tt.braceR.updateContext = function () {
                        if (this.context.length == 1) {
                            this.exprAllowed = true;
                            return;
                        }
                        var out = this.context.pop();
                        if (out === types.b_stat && this.curContext() === types.f_expr) {
                            this.context.pop();
                            this.exprAllowed = false;
                        }
                        else if (out === types.b_tmpl) {
                            this.exprAllowed = true;
                        }
                        else {
                            this.exprAllowed = !out.isExpr;
                        }
                    };
                    tt.braceL.updateContext = function (prevType) {
                        this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
                        this.exprAllowed = true;
                    };
                    tt.dollarBraceL.updateContext = function () {
                        this.context.push(types.b_tmpl);
                        this.exprAllowed = true;
                    };
                    tt.parenL.updateContext = function (prevType) {
                        var statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while;
                        this.context.push(statementParens ? types.p_stat : types.p_expr);
                        this.exprAllowed = true;
                    };
                    tt.incDec.updateContext = function () {
                    };
                    tt._function.updateContext = function (prevType) {
                        if (prevType.beforeExpr && prevType !== tt.semi && prevType !== tt._else &&
                            !((prevType === tt.colon || prevType === tt.braceL) && this.curContext() === types.b_stat))
                            this.context.push(types.f_expr);
                        this.exprAllowed = false;
                    };
                    tt.backQuote.updateContext = function () {
                        if (this.curContext() === types.q_tmpl)
                            this.context.pop();
                        else
                            this.context.push(types.q_tmpl);
                        this.exprAllowed = false;
                    };
                    var Token = function Token(p) {
                        this.type = p.type;
                        this.value = p.value;
                        this.start = p.start;
                        this.end = p.end;
                        if (p.options.locations)
                            this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
                        if (p.options.ranges)
                            this.range = [p.start, p.end];
                    };
                    var pp$7 = Parser.prototype;
                    var isRhino = typeof Packages == "object" && Object.prototype.toString.call(Packages) == "[object JavaPackage]";
                    pp$7.next = function () {
                        if (this.options.onToken)
                            this.options.onToken(new Token(this));
                        this.lastTokEnd = this.end;
                        this.lastTokStart = this.start;
                        this.lastTokEndLoc = this.endLoc;
                        this.lastTokStartLoc = this.startLoc;
                        this.nextToken();
                    };
                    pp$7.getToken = function () {
                        this.next();
                        return new Token(this);
                    };
                    if (typeof Symbol !== "undefined")
                        pp$7[Symbol.iterator] = function () {
                            var self = this;
                            return { next: function () {
                                    var token = self.getToken();
                                    return {
                                        done: token.type === tt.eof,
                                        value: token
                                    };
                                } };
                        };
                    pp$7.curContext = function () {
                        return this.context[this.context.length - 1];
                    };
                    pp$7.nextToken = function () {
                        var curContext = this.curContext();
                        if (!curContext || !curContext.preserveSpace)
                            this.skipSpace();
                        this.start = this.pos;
                        if (this.options.locations)
                            this.startLoc = this.curPosition();
                        if (this.pos >= this.input.length)
                            return this.finishToken(tt.eof);
                        if (curContext.override)
                            return curContext.override(this);
                        else
                            this.readToken(this.fullCharCodeAtPos());
                    };
                    pp$7.readToken = function (code) {
                        if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92)
                            return this.readWord();
                        return this.getTokenFromCode(code);
                    };
                    pp$7.fullCharCodeAtPos = function () {
                        var code = this.input.charCodeAt(this.pos);
                        if (code <= 0xd7ff || code >= 0xe000)
                            return code;
                        var next = this.input.charCodeAt(this.pos + 1);
                        return (code << 10) + next - 0x35fdc00;
                    };
                    pp$7.skipBlockComment = function () {
                        var this$1 = this;
                        var startLoc = this.options.onComment && this.curPosition();
                        var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
                        if (end === -1)
                            this.raise(this.pos - 2, "Unterminated comment");
                        this.pos = end + 2;
                        if (this.options.locations) {
                            lineBreakG.lastIndex = start;
                            var match;
                            while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
                                ++this$1.curLine;
                                this$1.lineStart = match.index + match[0].length;
                            }
                        }
                        if (this.options.onComment)
                            this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos, startLoc, this.curPosition());
                    };
                    pp$7.skipLineComment = function (startSkip) {
                        var this$1 = this;
                        var start = this.pos;
                        var startLoc = this.options.onComment && this.curPosition();
                        var ch = this.input.charCodeAt(this.pos += startSkip);
                        while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
                            ++this$1.pos;
                            ch = this$1.input.charCodeAt(this$1.pos);
                        }
                        if (this.options.onComment)
                            this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos, startLoc, this.curPosition());
                    };
                    pp$7.skipSpace = function () {
                        var this$1 = this;
                        loop: while (this.pos < this.input.length) {
                            var ch = this$1.input.charCodeAt(this$1.pos);
                            switch (ch) {
                                case 32:
                                case 160:
                                    ++this$1.pos;
                                    break;
                                case 13:
                                    if (this$1.input.charCodeAt(this$1.pos + 1) === 10) {
                                        ++this$1.pos;
                                    }
                                case 10:
                                case 8232:
                                case 8233:
                                    ++this$1.pos;
                                    if (this$1.options.locations) {
                                        ++this$1.curLine;
                                        this$1.lineStart = this$1.pos;
                                    }
                                    break;
                                case 47:
                                    switch (this$1.input.charCodeAt(this$1.pos + 1)) {
                                        case 42:
                                            this$1.skipBlockComment();
                                            break;
                                        case 47:
                                            this$1.skipLineComment(2);
                                            break;
                                        default:
                                            break loop;
                                    }
                                    break;
                                default:
                                    if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
                                        ++this$1.pos;
                                    }
                                    else {
                                        break loop;
                                    }
                            }
                        }
                    };
                    pp$7.finishToken = function (type, val) {
                        this.end = this.pos;
                        if (this.options.locations)
                            this.endLoc = this.curPosition();
                        var prevType = this.type;
                        this.type = type;
                        this.value = val;
                        this.updateContext(prevType);
                    };
                    pp$7.readToken_dot = function () {
                        var next = this.input.charCodeAt(this.pos + 1);
                        if (next >= 48 && next <= 57)
                            return this.readNumber(true);
                        var next2 = this.input.charCodeAt(this.pos + 2);
                        if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
                            this.pos += 3;
                            return this.finishToken(tt.ellipsis);
                        }
                        else {
                            ++this.pos;
                            return this.finishToken(tt.dot);
                        }
                    };
                    pp$7.readToken_slash = function () {
                        var next = this.input.charCodeAt(this.pos + 1);
                        if (this.exprAllowed) {
                            ++this.pos;
                            return this.readRegexp();
                        }
                        if (next === 61)
                            return this.finishOp(tt.assign, 2);
                        return this.finishOp(tt.slash, 1);
                    };
                    pp$7.readToken_mult_modulo_exp = function (code) {
                        var next = this.input.charCodeAt(this.pos + 1);
                        var size = 1;
                        var tokentype = code === 42 ? tt.star : tt.modulo;
                        if (this.options.ecmaVersion >= 7 && next === 42) {
                            ++size;
                            tokentype = tt.starstar;
                            next = this.input.charCodeAt(this.pos + 2);
                        }
                        if (next === 61)
                            return this.finishOp(tt.assign, size + 1);
                        return this.finishOp(tokentype, size);
                    };
                    pp$7.readToken_pipe_amp = function (code) {
                        var next = this.input.charCodeAt(this.pos + 1);
                        if (next === code)
                            return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2);
                        if (next === 61)
                            return this.finishOp(tt.assign, 2);
                        return this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1);
                    };
                    pp$7.readToken_caret = function () {
                        var next = this.input.charCodeAt(this.pos + 1);
                        if (next === 61)
                            return this.finishOp(tt.assign, 2);
                        return this.finishOp(tt.bitwiseXOR, 1);
                    };
                    pp$7.readToken_plus_min = function (code) {
                        var next = this.input.charCodeAt(this.pos + 1);
                        if (next === code) {
                            if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 &&
                                lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
                                this.skipLineComment(3);
                                this.skipSpace();
                                return this.nextToken();
                            }
                            return this.finishOp(tt.incDec, 2);
                        }
                        if (next === 61)
                            return this.finishOp(tt.assign, 2);
                        return this.finishOp(tt.plusMin, 1);
                    };
                    pp$7.readToken_lt_gt = function (code) {
                        var next = this.input.charCodeAt(this.pos + 1);
                        var size = 1;
                        if (next === code) {
                            size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
                            if (this.input.charCodeAt(this.pos + size) === 61)
                                return this.finishOp(tt.assign, size + 1);
                            return this.finishOp(tt.bitShift, size);
                        }
                        if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 &&
                            this.input.charCodeAt(this.pos + 3) == 45) {
                            if (this.inModule)
                                this.unexpected();
                            this.skipLineComment(4);
                            this.skipSpace();
                            return this.nextToken();
                        }
                        if (next === 61)
                            size = 2;
                        return this.finishOp(tt.relational, size);
                    };
                    pp$7.readToken_eq_excl = function (code) {
                        var next = this.input.charCodeAt(this.pos + 1);
                        if (next === 61)
                            return this.finishOp(tt.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
                        if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
                            this.pos += 2;
                            return this.finishToken(tt.arrow);
                        }
                        return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1);
                    };
                    pp$7.getTokenFromCode = function (code) {
                        switch (code) {
                            case 46:
                                return this.readToken_dot();
                            case 40:
                                ++this.pos;
                                return this.finishToken(tt.parenL);
                            case 41:
                                ++this.pos;
                                return this.finishToken(tt.parenR);
                            case 59:
                                ++this.pos;
                                return this.finishToken(tt.semi);
                            case 44:
                                ++this.pos;
                                return this.finishToken(tt.comma);
                            case 91:
                                ++this.pos;
                                return this.finishToken(tt.bracketL);
                            case 93:
                                ++this.pos;
                                return this.finishToken(tt.bracketR);
                            case 123:
                                ++this.pos;
                                return this.finishToken(tt.braceL);
                            case 125:
                                ++this.pos;
                                return this.finishToken(tt.braceR);
                            case 58:
                                ++this.pos;
                                return this.finishToken(tt.colon);
                            case 63:
                                ++this.pos;
                                return this.finishToken(tt.question);
                            case 96:
                                if (this.options.ecmaVersion < 6)
                                    break;
                                ++this.pos;
                                return this.finishToken(tt.backQuote);
                            case 48:
                                var next = this.input.charCodeAt(this.pos + 1);
                                if (next === 120 || next === 88)
                                    return this.readRadixNumber(16);
                                if (this.options.ecmaVersion >= 6) {
                                    if (next === 111 || next === 79)
                                        return this.readRadixNumber(8);
                                    if (next === 98 || next === 66)
                                        return this.readRadixNumber(2);
                                }
                            case 49:
                            case 50:
                            case 51:
                            case 52:
                            case 53:
                            case 54:
                            case 55:
                            case 56:
                            case 57:
                                return this.readNumber(false);
                            case 34:
                            case 39:
                                return this.readString(code);
                            case 47:
                                return this.readToken_slash();
                            case 37:
                            case 42:
                                return this.readToken_mult_modulo_exp(code);
                            case 124:
                            case 38:
                                return this.readToken_pipe_amp(code);
                            case 94:
                                return this.readToken_caret();
                            case 43:
                            case 45:
                                return this.readToken_plus_min(code);
                            case 60:
                            case 62:
                                return this.readToken_lt_gt(code);
                            case 61:
                            case 33:
                                return this.readToken_eq_excl(code);
                            case 126:
                                return this.finishOp(tt.prefix, 1);
                        }
                        this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
                    };
                    pp$7.finishOp = function (type, size) {
                        var str = this.input.slice(this.pos, this.pos + size);
                        this.pos += size;
                        return this.finishToken(type, str);
                    };
                    function tryCreateRegexp(src, flags, throwErrorAt, parser) {
                        try {
                            return new RegExp(src, flags);
                        }
                        catch (e) {
                            if (throwErrorAt !== undefined) {
                                if (e instanceof SyntaxError)
                                    parser.raise(throwErrorAt, "Error parsing regular expression: " + e.message);
                                throw e;
                            }
                        }
                    }
                    var regexpUnicodeSupport = !!tryCreateRegexp("\uffff", "u");
                    pp$7.readRegexp = function () {
                        var this$1 = this;
                        var escaped, inClass, start = this.pos;
                        for (;;) {
                            if (this$1.pos >= this$1.input.length)
                                this$1.raise(start, "Unterminated regular expression");
                            var ch = this$1.input.charAt(this$1.pos);
                            if (lineBreak.test(ch))
                                this$1.raise(start, "Unterminated regular expression");
                            if (!escaped) {
                                if (ch === "[")
                                    inClass = true;
                                else if (ch === "]" && inClass)
                                    inClass = false;
                                else if (ch === "/" && !inClass)
                                    break;
                                escaped = ch === "\\";
                            }
                            else
                                escaped = false;
                            ++this$1.pos;
                        }
                        var content = this.input.slice(start, this.pos);
                        ++this.pos;
                        var mods = this.readWord1();
                        var tmp = content, tmpFlags = "";
                        if (mods) {
                            var validFlags = /^[gim]*$/;
                            if (this.options.ecmaVersion >= 6)
                                validFlags = /^[gimuy]*$/;
                            if (!validFlags.test(mods))
                                this.raise(start, "Invalid regular expression flag");
                            if (mods.indexOf("u") >= 0) {
                                if (regexpUnicodeSupport) {
                                    tmpFlags = "u";
                                }
                                else {
                                    tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}/g, function (_match, code, offset) {
                                        code = Number("0x" + code);
                                        if (code > 0x10FFFF)
                                            this$1.raise(start + offset + 3, "Code point out of bounds");
                                        return "x";
                                    });
                                    tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x");
                                    tmpFlags = tmpFlags.replace("u", "");
                                }
                            }
                        }
                        var value = null;
                        if (!isRhino) {
                            tryCreateRegexp(tmp, tmpFlags, start, this);
                            value = tryCreateRegexp(content, mods);
                        }
                        return this.finishToken(tt.regexp, { pattern: content, flags: mods, value: value });
                    };
                    pp$7.readInt = function (radix, len) {
                        var this$1 = this;
                        var start = this.pos, total = 0;
                        for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
                            var code = this$1.input.charCodeAt(this$1.pos), val;
                            if (code >= 97)
                                val = code - 97 + 10;
                            else if (code >= 65)
                                val = code - 65 + 10;
                            else if (code >= 48 && code <= 57)
                                val = code - 48;
                            else
                                val = Infinity;
                            if (val >= radix)
                                break;
                            ++this$1.pos;
                            total = total * radix + val;
                        }
                        if (this.pos === start || len != null && this.pos - start !== len)
                            return null;
                        return total;
                    };
                    pp$7.readRadixNumber = function (radix) {
                        this.pos += 2;
                        var val = this.readInt(radix);
                        if (val == null)
                            this.raise(this.start + 2, "Expected number in radix " + radix);
                        if (isIdentifierStart(this.fullCharCodeAtPos()))
                            this.raise(this.pos, "Identifier directly after number");
                        return this.finishToken(tt.num, val);
                    };
                    pp$7.readNumber = function (startsWithDot) {
                        var start = this.pos, isFloat = false, octal = this.input.charCodeAt(this.pos) === 48;
                        if (!startsWithDot && this.readInt(10) === null)
                            this.raise(start, "Invalid number");
                        if (octal && this.pos == start + 1)
                            octal = false;
                        var next = this.input.charCodeAt(this.pos);
                        if (next === 46 && !octal) {
                            ++this.pos;
                            this.readInt(10);
                            isFloat = true;
                            next = this.input.charCodeAt(this.pos);
                        }
                        if ((next === 69 || next === 101) && !octal) {
                            next = this.input.charCodeAt(++this.pos);
                            if (next === 43 || next === 45)
                                ++this.pos;
                            if (this.readInt(10) === null)
                                this.raise(start, "Invalid number");
                            isFloat = true;
                        }
                        if (isIdentifierStart(this.fullCharCodeAtPos()))
                            this.raise(this.pos, "Identifier directly after number");
                        var str = this.input.slice(start, this.pos), val;
                        if (isFloat)
                            val = parseFloat(str);
                        else if (!octal || str.length === 1)
                            val = parseInt(str, 10);
                        else if (/[89]/.test(str) || this.strict)
                            this.raise(start, "Invalid number");
                        else
                            val = parseInt(str, 8);
                        return this.finishToken(tt.num, val);
                    };
                    pp$7.readCodePoint = function () {
                        var ch = this.input.charCodeAt(this.pos), code;
                        if (ch === 123) {
                            if (this.options.ecmaVersion < 6)
                                this.unexpected();
                            var codePos = ++this.pos;
                            code = this.readHexChar(this.input.indexOf('}', this.pos) - this.pos);
                            ++this.pos;
                            if (code > 0x10FFFF)
                                this.raise(codePos, "Code point out of bounds");
                        }
                        else {
                            code = this.readHexChar(4);
                        }
                        return code;
                    };
                    function codePointToString(code) {
                        if (code <= 0xFFFF)
                            return String.fromCharCode(code);
                        code -= 0x10000;
                        return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00);
                    }
                    pp$7.readString = function (quote) {
                        var this$1 = this;
                        var out = "", chunkStart = ++this.pos;
                        for (;;) {
                            if (this$1.pos >= this$1.input.length)
                                this$1.raise(this$1.start, "Unterminated string constant");
                            var ch = this$1.input.charCodeAt(this$1.pos);
                            if (ch === quote)
                                break;
                            if (ch === 92) {
                                out += this$1.input.slice(chunkStart, this$1.pos);
                                out += this$1.readEscapedChar(false);
                                chunkStart = this$1.pos;
                            }
                            else {
                                if (isNewLine(ch))
                                    this$1.raise(this$1.start, "Unterminated string constant");
                                ++this$1.pos;
                            }
                        }
                        out += this.input.slice(chunkStart, this.pos++);
                        return this.finishToken(tt.string, out);
                    };
                    pp$7.readTmplToken = function () {
                        var this$1 = this;
                        var out = "", chunkStart = this.pos;
                        for (;;) {
                            if (this$1.pos >= this$1.input.length)
                                this$1.raise(this$1.start, "Unterminated template");
                            var ch = this$1.input.charCodeAt(this$1.pos);
                            if (ch === 96 || ch === 36 && this$1.input.charCodeAt(this$1.pos + 1) === 123) {
                                if (this$1.pos === this$1.start && this$1.type === tt.template) {
                                    if (ch === 36) {
                                        this$1.pos += 2;
                                        return this$1.finishToken(tt.dollarBraceL);
                                    }
                                    else {
                                        ++this$1.pos;
                                        return this$1.finishToken(tt.backQuote);
                                    }
                                }
                                out += this$1.input.slice(chunkStart, this$1.pos);
                                return this$1.finishToken(tt.template, out);
                            }
                            if (ch === 92) {
                                out += this$1.input.slice(chunkStart, this$1.pos);
                                out += this$1.readEscapedChar(true);
                                chunkStart = this$1.pos;
                            }
                            else if (isNewLine(ch)) {
                                out += this$1.input.slice(chunkStart, this$1.pos);
                                ++this$1.pos;
                                switch (ch) {
                                    case 13:
                                        if (this$1.input.charCodeAt(this$1.pos) === 10)
                                            ++this$1.pos;
                                    case 10:
                                        out += "\n";
                                        break;
                                    default:
                                        out += String.fromCharCode(ch);
                                        break;
                                }
                                if (this$1.options.locations) {
                                    ++this$1.curLine;
                                    this$1.lineStart = this$1.pos;
                                }
                                chunkStart = this$1.pos;
                            }
                            else {
                                ++this$1.pos;
                            }
                        }
                    };
                    pp$7.readEscapedChar = function (inTemplate) {
                        var ch = this.input.charCodeAt(++this.pos);
                        ++this.pos;
                        switch (ch) {
                            case 110: return "\n";
                            case 114: return "\r";
                            case 120: return String.fromCharCode(this.readHexChar(2));
                            case 117: return codePointToString(this.readCodePoint());
                            case 116: return "\t";
                            case 98: return "\b";
                            case 118: return "\u000b";
                            case 102: return "\f";
                            case 13: if (this.input.charCodeAt(this.pos) === 10)
                                ++this.pos;
                            case 10:
                                if (this.options.locations) {
                                    this.lineStart = this.pos;
                                    ++this.curLine;
                                }
                                return "";
                            default:
                                if (ch >= 48 && ch <= 55) {
                                    var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
                                    var octal = parseInt(octalStr, 8);
                                    if (octal > 255) {
                                        octalStr = octalStr.slice(0, -1);
                                        octal = parseInt(octalStr, 8);
                                    }
                                    if (octalStr !== "0" && (this.strict || inTemplate)) {
                                        this.raise(this.pos - 2, "Octal literal in strict mode");
                                    }
                                    this.pos += octalStr.length - 1;
                                    return String.fromCharCode(octal);
                                }
                                return String.fromCharCode(ch);
                        }
                    };
                    pp$7.readHexChar = function (len) {
                        var codePos = this.pos;
                        var n = this.readInt(16, len);
                        if (n === null)
                            this.raise(codePos, "Bad character escape sequence");
                        return n;
                    };
                    pp$7.readWord1 = function () {
                        var this$1 = this;
                        this.containsEsc = false;
                        var word = "", first = true, chunkStart = this.pos;
                        var astral = this.options.ecmaVersion >= 6;
                        while (this.pos < this.input.length) {
                            var ch = this$1.fullCharCodeAtPos();
                            if (isIdentifierChar(ch, astral)) {
                                this$1.pos += ch <= 0xffff ? 1 : 2;
                            }
                            else if (ch === 92) {
                                this$1.containsEsc = true;
                                word += this$1.input.slice(chunkStart, this$1.pos);
                                var escStart = this$1.pos;
                                if (this$1.input.charCodeAt(++this$1.pos) != 117)
                                    this$1.raise(this$1.pos, "Expecting Unicode escape sequence \\uXXXX");
                                ++this$1.pos;
                                var esc = this$1.readCodePoint();
                                if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
                                    this$1.raise(escStart, "Invalid Unicode escape");
                                word += codePointToString(esc);
                                chunkStart = this$1.pos;
                            }
                            else {
                                break;
                            }
                            first = false;
                        }
                        return word + this.input.slice(chunkStart, this.pos);
                    };
                    pp$7.readWord = function () {
                        var word = this.readWord1();
                        var type = tt.name;
                        if (this.keywords.test(word)) {
                            if (this.containsEsc)
                                this.raiseRecoverable(this.start, "Escape sequence in keyword " + word);
                            type = keywordTypes[word];
                        }
                        return this.finishToken(type, word);
                    };
                    var version = "4.0.11";
                    function parse(input, options) {
                        return new Parser(options, input).parse();
                    }
                    function parseExpressionAt(input, pos, options) {
                        var p = new Parser(options, input, pos);
                        p.nextToken();
                        return p.parseExpression();
                    }
                    function tokenizer(input, options) {
                        return new Parser(options, input);
                    }
                    function addLooseExports(parse, Parser, plugins) {
                        exports.parse_dammit = parse;
                        exports.LooseParser = Parser;
                        exports.pluginsLoose = plugins;
                    }
                    exports.version = version;
                    exports.parse = parse;
                    exports.parseExpressionAt = parseExpressionAt;
                    exports.tokenizer = tokenizer;
                    exports.addLooseExports = addLooseExports;
                    exports.Parser = Parser;
                    exports.plugins = plugins;
                    exports.defaultOptions = defaultOptions;
                    exports.Position = Position;
                    exports.SourceLocation = SourceLocation;
                    exports.getLineInfo = getLineInfo;
                    exports.Node = Node;
                    exports.TokenType = TokenType;
                    exports.tokTypes = tt;
                    exports.keywordTypes = keywordTypes;
                    exports.TokContext = TokContext;
                    exports.tokContexts = types;
                    exports.isIdentifierChar = isIdentifierChar;
                    exports.isIdentifierStart = isIdentifierStart;
                    exports.Token = Token;
                    exports.isNewLine = isNewLine;
                    exports.lineBreak = lineBreak;
                    exports.lineBreakG = lineBreakG;
                    Object.defineProperty(exports, '__esModule', { value: true });
                })));
            }, {}], 6: [function (_dereq_, module, exports) {
                module.exports = function (arr, fn, self) {
                    if (arr.filter)
                        return arr.filter(fn, self);
                    if (void 0 === arr || null === arr)
                        throw new TypeError;
                    if ('function' != typeof fn)
                        throw new TypeError;
                    var ret = [];
                    for (var i = 0; i < arr.length; i++) {
                        if (!hasOwn.call(arr, i))
                            continue;
                        var val = arr[i];
                        if (fn.call(self, val, i, arr))
                            ret.push(val);
                    }
                    return ret;
                };
                var hasOwn = Object.prototype.hasOwnProperty;
            }, {}], 7: [function (_dereq_, module, exports) {
                (function (global) {
                    'use strict';
                    function compare(a, b) {
                        if (a === b) {
                            return 0;
                        }
                        var x = a.length;
                        var y = b.length;
                        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                            if (a[i] !== b[i]) {
                                x = a[i];
                                y = b[i];
                                break;
                            }
                        }
                        if (x < y) {
                            return -1;
                        }
                        if (y < x) {
                            return 1;
                        }
                        return 0;
                    }
                    function isBuffer(b) {
                        if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
                            return global.Buffer.isBuffer(b);
                        }
                        return !!(b != null && b._isBuffer);
                    }
                    var util = _dereq_('util/');
                    var hasOwn = Object.prototype.hasOwnProperty;
                    var pSlice = Array.prototype.slice;
                    var functionsHaveNames = (function () {
                        return function foo() { }.name === 'foo';
                    }());
                    function pToString(obj) {
                        return Object.prototype.toString.call(obj);
                    }
                    function isView(arrbuf) {
                        if (isBuffer(arrbuf)) {
                            return false;
                        }
                        if (typeof global.ArrayBuffer !== 'function') {
                            return false;
                        }
                        if (typeof ArrayBuffer.isView === 'function') {
                            return ArrayBuffer.isView(arrbuf);
                        }
                        if (!arrbuf) {
                            return false;
                        }
                        if (arrbuf instanceof DataView) {
                            return true;
                        }
                        if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
                            return true;
                        }
                        return false;
                    }
                    var assert = module.exports = ok;
                    var regex = /\s*function\s+([^\(\s]*)\s*/;
                    function getName(func) {
                        if (!util.isFunction(func)) {
                            return;
                        }
                        if (functionsHaveNames) {
                            return func.name;
                        }
                        var str = func.toString();
                        var match = str.match(regex);
                        return match && match[1];
                    }
                    assert.AssertionError = function AssertionError(options) {
                        this.name = 'AssertionError';
                        this.actual = options.actual;
                        this.expected = options.expected;
                        this.operator = options.operator;
                        if (options.message) {
                            this.message = options.message;
                            this.generatedMessage = false;
                        }
                        else {
                            this.message = getMessage(this);
                            this.generatedMessage = true;
                        }
                        var stackStartFunction = options.stackStartFunction || fail;
                        if (Error.captureStackTrace) {
                            Error.captureStackTrace(this, stackStartFunction);
                        }
                        else {
                            var err = new Error();
                            if (err.stack) {
                                var out = err.stack;
                                var fn_name = getName(stackStartFunction);
                                var idx = out.indexOf('\n' + fn_name);
                                if (idx >= 0) {
                                    var next_line = out.indexOf('\n', idx + 1);
                                    out = out.substring(next_line + 1);
                                }
                                this.stack = out;
                            }
                        }
                    };
                    util.inherits(assert.AssertionError, Error);
                    function truncate(s, n) {
                        if (typeof s === 'string') {
                            return s.length < n ? s : s.slice(0, n);
                        }
                        else {
                            return s;
                        }
                    }
                    function inspect(something) {
                        if (functionsHaveNames || !util.isFunction(something)) {
                            return util.inspect(something);
                        }
                        var rawname = getName(something);
                        var name = rawname ? ': ' + rawname : '';
                        return '[Function' + name + ']';
                    }
                    function getMessage(self) {
                        return truncate(inspect(self.actual), 128) + ' ' +
                            self.operator + ' ' +
                            truncate(inspect(self.expected), 128);
                    }
                    function fail(actual, expected, message, operator, stackStartFunction) {
                        throw new assert.AssertionError({
                            message: message,
                            actual: actual,
                            expected: expected,
                            operator: operator,
                            stackStartFunction: stackStartFunction
                        });
                    }
                    assert.fail = fail;
                    function ok(value, message) {
                        if (!value)
                            fail(value, true, message, '==', assert.ok);
                    }
                    assert.ok = ok;
                    assert.equal = function equal(actual, expected, message) {
                        if (actual != expected)
                            fail(actual, expected, message, '==', assert.equal);
                    };
                    assert.notEqual = function notEqual(actual, expected, message) {
                        if (actual == expected) {
                            fail(actual, expected, message, '!=', assert.notEqual);
                        }
                    };
                    assert.deepEqual = function deepEqual(actual, expected, message) {
                        if (!_deepEqual(actual, expected, false)) {
                            fail(actual, expected, message, 'deepEqual', assert.deepEqual);
                        }
                    };
                    assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
                        if (!_deepEqual(actual, expected, true)) {
                            fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
                        }
                    };
                    function _deepEqual(actual, expected, strict, memos) {
                        if (actual === expected) {
                            return true;
                        }
                        else if (isBuffer(actual) && isBuffer(expected)) {
                            return compare(actual, expected) === 0;
                        }
                        else if (util.isDate(actual) && util.isDate(expected)) {
                            return actual.getTime() === expected.getTime();
                        }
                        else if (util.isRegExp(actual) && util.isRegExp(expected)) {
                            return actual.source === expected.source &&
                                actual.global === expected.global &&
                                actual.multiline === expected.multiline &&
                                actual.lastIndex === expected.lastIndex &&
                                actual.ignoreCase === expected.ignoreCase;
                        }
                        else if ((actual === null || typeof actual !== 'object') &&
                            (expected === null || typeof expected !== 'object')) {
                            return strict ? actual === expected : actual == expected;
                        }
                        else if (isView(actual) && isView(expected) &&
                            pToString(actual) === pToString(expected) &&
                            !(actual instanceof Float32Array ||
                                actual instanceof Float64Array)) {
                            return compare(new Uint8Array(actual.buffer), new Uint8Array(expected.buffer)) === 0;
                        }
                        else if (isBuffer(actual) !== isBuffer(expected)) {
                            return false;
                        }
                        else {
                            memos = memos || { actual: [], expected: [] };
                            var actualIndex = memos.actual.indexOf(actual);
                            if (actualIndex !== -1) {
                                if (actualIndex === memos.expected.indexOf(expected)) {
                                    return true;
                                }
                            }
                            memos.actual.push(actual);
                            memos.expected.push(expected);
                            return objEquiv(actual, expected, strict, memos);
                        }
                    }
                    function isArguments(object) {
                        return Object.prototype.toString.call(object) == '[object Arguments]';
                    }
                    function objEquiv(a, b, strict, actualVisitedObjects) {
                        if (a === null || a === undefined || b === null || b === undefined)
                            return false;
                        if (util.isPrimitive(a) || util.isPrimitive(b))
                            return a === b;
                        if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
                            return false;
                        var aIsArgs = isArguments(a);
                        var bIsArgs = isArguments(b);
                        if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
                            return false;
                        if (aIsArgs) {
                            a = pSlice.call(a);
                            b = pSlice.call(b);
                            return _deepEqual(a, b, strict);
                        }
                        var ka = objectKeys(a);
                        var kb = objectKeys(b);
                        var key, i;
                        if (ka.length !== kb.length)
                            return false;
                        ka.sort();
                        kb.sort();
                        for (i = ka.length - 1; i >= 0; i--) {
                            if (ka[i] !== kb[i])
                                return false;
                        }
                        for (i = ka.length - 1; i >= 0; i--) {
                            key = ka[i];
                            if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
                                return false;
                        }
                        return true;
                    }
                    assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
                        if (_deepEqual(actual, expected, false)) {
                            fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
                        }
                    };
                    assert.notDeepStrictEqual = notDeepStrictEqual;
                    function notDeepStrictEqual(actual, expected, message) {
                        if (_deepEqual(actual, expected, true)) {
                            fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
                        }
                    }
                    assert.strictEqual = function strictEqual(actual, expected, message) {
                        if (actual !== expected) {
                            fail(actual, expected, message, '===', assert.strictEqual);
                        }
                    };
                    assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
                        if (actual === expected) {
                            fail(actual, expected, message, '!==', assert.notStrictEqual);
                        }
                    };
                    function expectedException(actual, expected) {
                        if (!actual || !expected) {
                            return false;
                        }
                        if (Object.prototype.toString.call(expected) == '[object RegExp]') {
                            return expected.test(actual);
                        }
                        try {
                            if (actual instanceof expected) {
                                return true;
                            }
                        }
                        catch (e) {
                        }
                        if (Error.isPrototypeOf(expected)) {
                            return false;
                        }
                        return expected.call({}, actual) === true;
                    }
                    function _tryBlock(block) {
                        var error;
                        try {
                            block();
                        }
                        catch (e) {
                            error = e;
                        }
                        return error;
                    }
                    function _throws(shouldThrow, block, expected, message) {
                        var actual;
                        if (typeof block !== 'function') {
                            throw new TypeError('"block" argument must be a function');
                        }
                        if (typeof expected === 'string') {
                            message = expected;
                            expected = null;
                        }
                        actual = _tryBlock(block);
                        message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
                            (message ? ' ' + message : '.');
                        if (shouldThrow && !actual) {
                            fail(actual, expected, 'Missing expected exception' + message);
                        }
                        var userProvidedMessage = typeof message === 'string';
                        var isUnwantedException = !shouldThrow && util.isError(actual);
                        var isUnexpectedException = !shouldThrow && actual && !expected;
                        if ((isUnwantedException &&
                            userProvidedMessage &&
                            expectedException(actual, expected)) ||
                            isUnexpectedException) {
                            fail(actual, expected, 'Got unwanted exception' + message);
                        }
                        if ((shouldThrow && actual && expected &&
                            !expectedException(actual, expected)) || (!shouldThrow && actual)) {
                            throw actual;
                        }
                    }
                    assert["throws"] = function (block, error, message) {
                        _throws(true, block, error, message);
                    };
                    assert.doesNotThrow = function (block, error, message) {
                        _throws(false, block, error, message);
                    };
                    assert.ifError = function (err) { if (err)
                        throw err; };
                    var objectKeys = Object.keys || function (obj) {
                        var keys = [];
                        for (var key in obj) {
                            if (hasOwn.call(obj, key))
                                keys.push(key);
                        }
                        return keys;
                    };
                }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
            }, { "util/": 134 }], 8: [function (_dereq_, module, exports) {
                'use strict';
                exports.byteLength = byteLength;
                exports.toByteArray = toByteArray;
                exports.fromByteArray = fromByteArray;
                var lookup = [];
                var revLookup = [];
                var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
                var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                for (var i = 0, len = code.length; i < len; ++i) {
                    lookup[i] = code[i];
                    revLookup[code.charCodeAt(i)] = i;
                }
                revLookup['-'.charCodeAt(0)] = 62;
                revLookup['_'.charCodeAt(0)] = 63;
                function placeHoldersCount(b64) {
                    var len = b64.length;
                    if (len % 4 > 0) {
                        throw new Error('Invalid string. Length must be a multiple of 4');
                    }
                    return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;
                }
                function byteLength(b64) {
                    return b64.length * 3 / 4 - placeHoldersCount(b64);
                }
                function toByteArray(b64) {
                    var i, j, l, tmp, placeHolders, arr;
                    var len = b64.length;
                    placeHolders = placeHoldersCount(b64);
                    arr = new Arr(len * 3 / 4 - placeHolders);
                    l = placeHolders > 0 ? len - 4 : len;
                    var L = 0;
                    for (i = 0, j = 0; i < l; i += 4, j += 3) {
                        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
                        arr[L++] = (tmp >> 16) & 0xFF;
                        arr[L++] = (tmp >> 8) & 0xFF;
                        arr[L++] = tmp & 0xFF;
                    }
                    if (placeHolders === 2) {
                        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
                        arr[L++] = tmp & 0xFF;
                    }
                    else if (placeHolders === 1) {
                        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
                        arr[L++] = (tmp >> 8) & 0xFF;
                        arr[L++] = tmp & 0xFF;
                    }
                    return arr;
                }
                function tripletToBase64(num) {
                    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
                }
                function encodeChunk(uint8, start, end) {
                    var tmp;
                    var output = [];
                    for (var i = start; i < end; i += 3) {
                        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
                        output.push(tripletToBase64(tmp));
                    }
                    return output.join('');
                }
                function fromByteArray(uint8) {
                    var tmp;
                    var len = uint8.length;
                    var extraBytes = len % 3;
                    var output = '';
                    var parts = [];
                    var maxChunkLength = 16383;
                    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
                        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
                    }
                    if (extraBytes === 1) {
                        tmp = uint8[len - 1];
                        output += lookup[tmp >> 2];
                        output += lookup[(tmp << 4) & 0x3F];
                        output += '==';
                    }
                    else if (extraBytes === 2) {
                        tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
                        output += lookup[tmp >> 10];
                        output += lookup[(tmp >> 4) & 0x3F];
                        output += lookup[(tmp << 2) & 0x3F];
                        output += '=';
                    }
                    parts.push(output);
                    return parts.join('');
                }
            }, {}], 9: [function (_dereq_, module, exports) {
                (function (global) {
                    'use strict';
                    var base64 = _dereq_('base64-js');
                    var ieee754 = _dereq_('ieee754');
                    var isArray = _dereq_('isarray');
                    exports.Buffer = Buffer;
                    exports.SlowBuffer = SlowBuffer;
                    exports.INSPECT_MAX_BYTES = 50;
                    Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
                        ? global.TYPED_ARRAY_SUPPORT
                        : typedArraySupport();
                    exports.kMaxLength = kMaxLength();
                    function typedArraySupport() {
                        try {
                            var arr = new Uint8Array(1);
                            arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42; } };
                            return arr.foo() === 42 &&
                                typeof arr.subarray === 'function' &&
                                arr.subarray(1, 1).byteLength === 0;
                        }
                        catch (e) {
                            return false;
                        }
                    }
                    function kMaxLength() {
                        return Buffer.TYPED_ARRAY_SUPPORT
                            ? 0x7fffffff
                            : 0x3fffffff;
                    }
                    function createBuffer(that, length) {
                        if (kMaxLength() < length) {
                            throw new RangeError('Invalid typed array length');
                        }
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            that = new Uint8Array(length);
                            that.__proto__ = Buffer.prototype;
                        }
                        else {
                            if (that === null) {
                                that = new Buffer(length);
                            }
                            that.length = length;
                        }
                        return that;
                    }
                    function Buffer(arg, encodingOrOffset, length) {
                        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
                            return new Buffer(arg, encodingOrOffset, length);
                        }
                        if (typeof arg === 'number') {
                            if (typeof encodingOrOffset === 'string') {
                                throw new Error('If encoding is specified then the first argument must be a string');
                            }
                            return allocUnsafe(this, arg);
                        }
                        return from(this, arg, encodingOrOffset, length);
                    }
                    Buffer.poolSize = 8192;
                    Buffer._augment = function (arr) {
                        arr.__proto__ = Buffer.prototype;
                        return arr;
                    };
                    function from(that, value, encodingOrOffset, length) {
                        if (typeof value === 'number') {
                            throw new TypeError('"value" argument must not be a number');
                        }
                        if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
                            return fromArrayBuffer(that, value, encodingOrOffset, length);
                        }
                        if (typeof value === 'string') {
                            return fromString(that, value, encodingOrOffset);
                        }
                        return fromObject(that, value);
                    }
                    Buffer.from = function (value, encodingOrOffset, length) {
                        return from(null, value, encodingOrOffset, length);
                    };
                    if (Buffer.TYPED_ARRAY_SUPPORT) {
                        Buffer.prototype.__proto__ = Uint8Array.prototype;
                        Buffer.__proto__ = Uint8Array;
                        if (typeof Symbol !== 'undefined' && Symbol.species &&
                            Buffer[Symbol.species] === Buffer) {
                            Object.defineProperty(Buffer, Symbol.species, {
                                value: null,
                                configurable: true
                            });
                        }
                    }
                    function assertSize(size) {
                        if (typeof size !== 'number') {
                            throw new TypeError('"size" argument must be a number');
                        }
                        else if (size < 0) {
                            throw new RangeError('"size" argument must not be negative');
                        }
                    }
                    function alloc(that, size, fill, encoding) {
                        assertSize(size);
                        if (size <= 0) {
                            return createBuffer(that, size);
                        }
                        if (fill !== undefined) {
                            return typeof encoding === 'string'
                                ? createBuffer(that, size).fill(fill, encoding)
                                : createBuffer(that, size).fill(fill);
                        }
                        return createBuffer(that, size);
                    }
                    Buffer.alloc = function (size, fill, encoding) {
                        return alloc(null, size, fill, encoding);
                    };
                    function allocUnsafe(that, size) {
                        assertSize(size);
                        that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
                        if (!Buffer.TYPED_ARRAY_SUPPORT) {
                            for (var i = 0; i < size; ++i) {
                                that[i] = 0;
                            }
                        }
                        return that;
                    }
                    Buffer.allocUnsafe = function (size) {
                        return allocUnsafe(null, size);
                    };
                    Buffer.allocUnsafeSlow = function (size) {
                        return allocUnsafe(null, size);
                    };
                    function fromString(that, string, encoding) {
                        if (typeof encoding !== 'string' || encoding === '') {
                            encoding = 'utf8';
                        }
                        if (!Buffer.isEncoding(encoding)) {
                            throw new TypeError('"encoding" must be a valid string encoding');
                        }
                        var length = byteLength(string, encoding) | 0;
                        that = createBuffer(that, length);
                        var actual = that.write(string, encoding);
                        if (actual !== length) {
                            that = that.slice(0, actual);
                        }
                        return that;
                    }
                    function fromArrayLike(that, array) {
                        var length = array.length < 0 ? 0 : checked(array.length) | 0;
                        that = createBuffer(that, length);
                        for (var i = 0; i < length; i += 1) {
                            that[i] = array[i] & 255;
                        }
                        return that;
                    }
                    function fromArrayBuffer(that, array, byteOffset, length) {
                        array.byteLength;
                        if (byteOffset < 0 || array.byteLength < byteOffset) {
                            throw new RangeError('\'offset\' is out of bounds');
                        }
                        if (array.byteLength < byteOffset + (length || 0)) {
                            throw new RangeError('\'length\' is out of bounds');
                        }
                        if (byteOffset === undefined && length === undefined) {
                            array = new Uint8Array(array);
                        }
                        else if (length === undefined) {
                            array = new Uint8Array(array, byteOffset);
                        }
                        else {
                            array = new Uint8Array(array, byteOffset, length);
                        }
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            that = array;
                            that.__proto__ = Buffer.prototype;
                        }
                        else {
                            that = fromArrayLike(that, array);
                        }
                        return that;
                    }
                    function fromObject(that, obj) {
                        if (Buffer.isBuffer(obj)) {
                            var len = checked(obj.length) | 0;
                            that = createBuffer(that, len);
                            if (that.length === 0) {
                                return that;
                            }
                            obj.copy(that, 0, 0, len);
                            return that;
                        }
                        if (obj) {
                            if ((typeof ArrayBuffer !== 'undefined' &&
                                obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
                                if (typeof obj.length !== 'number' || isnan(obj.length)) {
                                    return createBuffer(that, 0);
                                }
                                return fromArrayLike(that, obj);
                            }
                            if (obj.type === 'Buffer' && isArray(obj.data)) {
                                return fromArrayLike(that, obj.data);
                            }
                        }
                        throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
                    }
                    function checked(length) {
                        if (length >= kMaxLength()) {
                            throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                                'size: 0x' + kMaxLength().toString(16) + ' bytes');
                        }
                        return length | 0;
                    }
                    function SlowBuffer(length) {
                        if (+length != length) {
                            length = 0;
                        }
                        return Buffer.alloc(+length);
                    }
                    Buffer.isBuffer = function isBuffer(b) {
                        return !!(b != null && b._isBuffer);
                    };
                    Buffer.compare = function compare(a, b) {
                        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                            throw new TypeError('Arguments must be Buffers');
                        }
                        if (a === b)
                            return 0;
                        var x = a.length;
                        var y = b.length;
                        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
                            if (a[i] !== b[i]) {
                                x = a[i];
                                y = b[i];
                                break;
                            }
                        }
                        if (x < y)
                            return -1;
                        if (y < x)
                            return 1;
                        return 0;
                    };
                    Buffer.isEncoding = function isEncoding(encoding) {
                        switch (String(encoding).toLowerCase()) {
                            case 'hex':
                            case 'utf8':
                            case 'utf-8':
                            case 'ascii':
                            case 'latin1':
                            case 'binary':
                            case 'base64':
                            case 'ucs2':
                            case 'ucs-2':
                            case 'utf16le':
                            case 'utf-16le':
                                return true;
                            default:
                                return false;
                        }
                    };
                    Buffer.concat = function concat(list, length) {
                        if (!isArray(list)) {
                            throw new TypeError('"list" argument must be an Array of Buffers');
                        }
                        if (list.length === 0) {
                            return Buffer.alloc(0);
                        }
                        var i;
                        if (length === undefined) {
                            length = 0;
                            for (i = 0; i < list.length; ++i) {
                                length += list[i].length;
                            }
                        }
                        var buffer = Buffer.allocUnsafe(length);
                        var pos = 0;
                        for (i = 0; i < list.length; ++i) {
                            var buf = list[i];
                            if (!Buffer.isBuffer(buf)) {
                                throw new TypeError('"list" argument must be an Array of Buffers');
                            }
                            buf.copy(buffer, pos);
                            pos += buf.length;
                        }
                        return buffer;
                    };
                    function byteLength(string, encoding) {
                        if (Buffer.isBuffer(string)) {
                            return string.length;
                        }
                        if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
                            (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
                            return string.byteLength;
                        }
                        if (typeof string !== 'string') {
                            string = '' + string;
                        }
                        var len = string.length;
                        if (len === 0)
                            return 0;
                        var loweredCase = false;
                        for (;;) {
                            switch (encoding) {
                                case 'ascii':
                                case 'latin1':
                                case 'binary':
                                    return len;
                                case 'utf8':
                                case 'utf-8':
                                case undefined:
                                    return utf8ToBytes(string).length;
                                case 'ucs2':
                                case 'ucs-2':
                                case 'utf16le':
                                case 'utf-16le':
                                    return len * 2;
                                case 'hex':
                                    return len >>> 1;
                                case 'base64':
                                    return base64ToBytes(string).length;
                                default:
                                    if (loweredCase)
                                        return utf8ToBytes(string).length;
                                    encoding = ('' + encoding).toLowerCase();
                                    loweredCase = true;
                            }
                        }
                    }
                    Buffer.byteLength = byteLength;
                    function slowToString(encoding, start, end) {
                        var loweredCase = false;
                        if (start === undefined || start < 0) {
                            start = 0;
                        }
                        if (start > this.length) {
                            return '';
                        }
                        if (end === undefined || end > this.length) {
                            end = this.length;
                        }
                        if (end <= 0) {
                            return '';
                        }
                        end >>>= 0;
                        start >>>= 0;
                        if (end <= start) {
                            return '';
                        }
                        if (!encoding)
                            encoding = 'utf8';
                        while (true) {
                            switch (encoding) {
                                case 'hex':
                                    return hexSlice(this, start, end);
                                case 'utf8':
                                case 'utf-8':
                                    return utf8Slice(this, start, end);
                                case 'ascii':
                                    return asciiSlice(this, start, end);
                                case 'latin1':
                                case 'binary':
                                    return latin1Slice(this, start, end);
                                case 'base64':
                                    return base64Slice(this, start, end);
                                case 'ucs2':
                                case 'ucs-2':
                                case 'utf16le':
                                case 'utf-16le':
                                    return utf16leSlice(this, start, end);
                                default:
                                    if (loweredCase)
                                        throw new TypeError('Unknown encoding: ' + encoding);
                                    encoding = (encoding + '').toLowerCase();
                                    loweredCase = true;
                            }
                        }
                    }
                    Buffer.prototype._isBuffer = true;
                    function swap(b, n, m) {
                        var i = b[n];
                        b[n] = b[m];
                        b[m] = i;
                    }
                    Buffer.prototype.swap16 = function swap16() {
                        var len = this.length;
                        if (len % 2 !== 0) {
                            throw new RangeError('Buffer size must be a multiple of 16-bits');
                        }
                        for (var i = 0; i < len; i += 2) {
                            swap(this, i, i + 1);
                        }
                        return this;
                    };
                    Buffer.prototype.swap32 = function swap32() {
                        var len = this.length;
                        if (len % 4 !== 0) {
                            throw new RangeError('Buffer size must be a multiple of 32-bits');
                        }
                        for (var i = 0; i < len; i += 4) {
                            swap(this, i, i + 3);
                            swap(this, i + 1, i + 2);
                        }
                        return this;
                    };
                    Buffer.prototype.swap64 = function swap64() {
                        var len = this.length;
                        if (len % 8 !== 0) {
                            throw new RangeError('Buffer size must be a multiple of 64-bits');
                        }
                        for (var i = 0; i < len; i += 8) {
                            swap(this, i, i + 7);
                            swap(this, i + 1, i + 6);
                            swap(this, i + 2, i + 5);
                            swap(this, i + 3, i + 4);
                        }
                        return this;
                    };
                    Buffer.prototype.toString = function toString() {
                        var length = this.length | 0;
                        if (length === 0)
                            return '';
                        if (arguments.length === 0)
                            return utf8Slice(this, 0, length);
                        return slowToString.apply(this, arguments);
                    };
                    Buffer.prototype.equals = function equals(b) {
                        if (!Buffer.isBuffer(b))
                            throw new TypeError('Argument must be a Buffer');
                        if (this === b)
                            return true;
                        return Buffer.compare(this, b) === 0;
                    };
                    Buffer.prototype.inspect = function inspect() {
                        var str = '';
                        var max = exports.INSPECT_MAX_BYTES;
                        if (this.length > 0) {
                            str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
                            if (this.length > max)
                                str += ' ... ';
                        }
                        return '<Buffer ' + str + '>';
                    };
                    Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
                        if (!Buffer.isBuffer(target)) {
                            throw new TypeError('Argument must be a Buffer');
                        }
                        if (start === undefined) {
                            start = 0;
                        }
                        if (end === undefined) {
                            end = target ? target.length : 0;
                        }
                        if (thisStart === undefined) {
                            thisStart = 0;
                        }
                        if (thisEnd === undefined) {
                            thisEnd = this.length;
                        }
                        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
                            throw new RangeError('out of range index');
                        }
                        if (thisStart >= thisEnd && start >= end) {
                            return 0;
                        }
                        if (thisStart >= thisEnd) {
                            return -1;
                        }
                        if (start >= end) {
                            return 1;
                        }
                        start >>>= 0;
                        end >>>= 0;
                        thisStart >>>= 0;
                        thisEnd >>>= 0;
                        if (this === target)
                            return 0;
                        var x = thisEnd - thisStart;
                        var y = end - start;
                        var len = Math.min(x, y);
                        var thisCopy = this.slice(thisStart, thisEnd);
                        var targetCopy = target.slice(start, end);
                        for (var i = 0; i < len; ++i) {
                            if (thisCopy[i] !== targetCopy[i]) {
                                x = thisCopy[i];
                                y = targetCopy[i];
                                break;
                            }
                        }
                        if (x < y)
                            return -1;
                        if (y < x)
                            return 1;
                        return 0;
                    };
                    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
                        if (buffer.length === 0)
                            return -1;
                        if (typeof byteOffset === 'string') {
                            encoding = byteOffset;
                            byteOffset = 0;
                        }
                        else if (byteOffset > 0x7fffffff) {
                            byteOffset = 0x7fffffff;
                        }
                        else if (byteOffset < -0x80000000) {
                            byteOffset = -0x80000000;
                        }
                        byteOffset = +byteOffset;
                        if (isNaN(byteOffset)) {
                            byteOffset = dir ? 0 : (buffer.length - 1);
                        }
                        if (byteOffset < 0)
                            byteOffset = buffer.length + byteOffset;
                        if (byteOffset >= buffer.length) {
                            if (dir)
                                return -1;
                            else
                                byteOffset = buffer.length - 1;
                        }
                        else if (byteOffset < 0) {
                            if (dir)
                                byteOffset = 0;
                            else
                                return -1;
                        }
                        if (typeof val === 'string') {
                            val = Buffer.from(val, encoding);
                        }
                        if (Buffer.isBuffer(val)) {
                            if (val.length === 0) {
                                return -1;
                            }
                            return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
                        }
                        else if (typeof val === 'number') {
                            val = val & 0xFF;
                            if (Buffer.TYPED_ARRAY_SUPPORT &&
                                typeof Uint8Array.prototype.indexOf === 'function') {
                                if (dir) {
                                    return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
                                }
                                else {
                                    return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
                                }
                            }
                            return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
                        }
                        throw new TypeError('val must be string, number or Buffer');
                    }
                    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
                        var indexSize = 1;
                        var arrLength = arr.length;
                        var valLength = val.length;
                        if (encoding !== undefined) {
                            encoding = String(encoding).toLowerCase();
                            if (encoding === 'ucs2' || encoding === 'ucs-2' ||
                                encoding === 'utf16le' || encoding === 'utf-16le') {
                                if (arr.length < 2 || val.length < 2) {
                                    return -1;
                                }
                                indexSize = 2;
                                arrLength /= 2;
                                valLength /= 2;
                                byteOffset /= 2;
                            }
                        }
                        function read(buf, i) {
                            if (indexSize === 1) {
                                return buf[i];
                            }
                            else {
                                return buf.readUInt16BE(i * indexSize);
                            }
                        }
                        var i;
                        if (dir) {
                            var foundIndex = -1;
                            for (i = byteOffset; i < arrLength; i++) {
                                if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                                    if (foundIndex === -1)
                                        foundIndex = i;
                                    if (i - foundIndex + 1 === valLength)
                                        return foundIndex * indexSize;
                                }
                                else {
                                    if (foundIndex !== -1)
                                        i -= i - foundIndex;
                                    foundIndex = -1;
                                }
                            }
                        }
                        else {
                            if (byteOffset + valLength > arrLength)
                                byteOffset = arrLength - valLength;
                            for (i = byteOffset; i >= 0; i--) {
                                var found = true;
                                for (var j = 0; j < valLength; j++) {
                                    if (read(arr, i + j) !== read(val, j)) {
                                        found = false;
                                        break;
                                    }
                                }
                                if (found)
                                    return i;
                            }
                        }
                        return -1;
                    }
                    Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
                        return this.indexOf(val, byteOffset, encoding) !== -1;
                    };
                    Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
                        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
                    };
                    Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
                        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
                    };
                    function hexWrite(buf, string, offset, length) {
                        offset = Number(offset) || 0;
                        var remaining = buf.length - offset;
                        if (!length) {
                            length = remaining;
                        }
                        else {
                            length = Number(length);
                            if (length > remaining) {
                                length = remaining;
                            }
                        }
                        var strLen = string.length;
                        if (strLen % 2 !== 0)
                            throw new TypeError('Invalid hex string');
                        if (length > strLen / 2) {
                            length = strLen / 2;
                        }
                        for (var i = 0; i < length; ++i) {
                            var parsed = parseInt(string.substr(i * 2, 2), 16);
                            if (isNaN(parsed))
                                return i;
                            buf[offset + i] = parsed;
                        }
                        return i;
                    }
                    function utf8Write(buf, string, offset, length) {
                        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
                    }
                    function asciiWrite(buf, string, offset, length) {
                        return blitBuffer(asciiToBytes(string), buf, offset, length);
                    }
                    function latin1Write(buf, string, offset, length) {
                        return asciiWrite(buf, string, offset, length);
                    }
                    function base64Write(buf, string, offset, length) {
                        return blitBuffer(base64ToBytes(string), buf, offset, length);
                    }
                    function ucs2Write(buf, string, offset, length) {
                        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
                    }
                    Buffer.prototype.write = function write(string, offset, length, encoding) {
                        if (offset === undefined) {
                            encoding = 'utf8';
                            length = this.length;
                            offset = 0;
                        }
                        else if (length === undefined && typeof offset === 'string') {
                            encoding = offset;
                            length = this.length;
                            offset = 0;
                        }
                        else if (isFinite(offset)) {
                            offset = offset | 0;
                            if (isFinite(length)) {
                                length = length | 0;
                                if (encoding === undefined)
                                    encoding = 'utf8';
                            }
                            else {
                                encoding = length;
                                length = undefined;
                            }
                        }
                        else {
                            throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
                        }
                        var remaining = this.length - offset;
                        if (length === undefined || length > remaining)
                            length = remaining;
                        if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
                            throw new RangeError('Attempt to write outside buffer bounds');
                        }
                        if (!encoding)
                            encoding = 'utf8';
                        var loweredCase = false;
                        for (;;) {
                            switch (encoding) {
                                case 'hex':
                                    return hexWrite(this, string, offset, length);
                                case 'utf8':
                                case 'utf-8':
                                    return utf8Write(this, string, offset, length);
                                case 'ascii':
                                    return asciiWrite(this, string, offset, length);
                                case 'latin1':
                                case 'binary':
                                    return latin1Write(this, string, offset, length);
                                case 'base64':
                                    return base64Write(this, string, offset, length);
                                case 'ucs2':
                                case 'ucs-2':
                                case 'utf16le':
                                case 'utf-16le':
                                    return ucs2Write(this, string, offset, length);
                                default:
                                    if (loweredCase)
                                        throw new TypeError('Unknown encoding: ' + encoding);
                                    encoding = ('' + encoding).toLowerCase();
                                    loweredCase = true;
                            }
                        }
                    };
                    Buffer.prototype.toJSON = function toJSON() {
                        return {
                            type: 'Buffer',
                            data: Array.prototype.slice.call(this._arr || this, 0)
                        };
                    };
                    function base64Slice(buf, start, end) {
                        if (start === 0 && end === buf.length) {
                            return base64.fromByteArray(buf);
                        }
                        else {
                            return base64.fromByteArray(buf.slice(start, end));
                        }
                    }
                    function utf8Slice(buf, start, end) {
                        end = Math.min(buf.length, end);
                        var res = [];
                        var i = start;
                        while (i < end) {
                            var firstByte = buf[i];
                            var codePoint = null;
                            var bytesPerSequence = (firstByte > 0xEF) ? 4
                                : (firstByte > 0xDF) ? 3
                                    : (firstByte > 0xBF) ? 2
                                        : 1;
                            if (i + bytesPerSequence <= end) {
                                var secondByte, thirdByte, fourthByte, tempCodePoint;
                                switch (bytesPerSequence) {
                                    case 1:
                                        if (firstByte < 0x80) {
                                            codePoint = firstByte;
                                        }
                                        break;
                                    case 2:
                                        secondByte = buf[i + 1];
                                        if ((secondByte & 0xC0) === 0x80) {
                                            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                                            if (tempCodePoint > 0x7F) {
                                                codePoint = tempCodePoint;
                                            }
                                        }
                                        break;
                                    case 3:
                                        secondByte = buf[i + 1];
                                        thirdByte = buf[i + 2];
                                        if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                                            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                                            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                                                codePoint = tempCodePoint;
                                            }
                                        }
                                        break;
                                    case 4:
                                        secondByte = buf[i + 1];
                                        thirdByte = buf[i + 2];
                                        fourthByte = buf[i + 3];
                                        if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                                            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                                            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                                                codePoint = tempCodePoint;
                                            }
                                        }
                                }
                            }
                            if (codePoint === null) {
                                codePoint = 0xFFFD;
                                bytesPerSequence = 1;
                            }
                            else if (codePoint > 0xFFFF) {
                                codePoint -= 0x10000;
                                res.push(codePoint >>> 10 & 0x3FF | 0xD800);
                                codePoint = 0xDC00 | codePoint & 0x3FF;
                            }
                            res.push(codePoint);
                            i += bytesPerSequence;
                        }
                        return decodeCodePointsArray(res);
                    }
                    var MAX_ARGUMENTS_LENGTH = 0x1000;
                    function decodeCodePointsArray(codePoints) {
                        var len = codePoints.length;
                        if (len <= MAX_ARGUMENTS_LENGTH) {
                            return String.fromCharCode.apply(String, codePoints);
                        }
                        var res = '';
                        var i = 0;
                        while (i < len) {
                            res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
                        }
                        return res;
                    }
                    function asciiSlice(buf, start, end) {
                        var ret = '';
                        end = Math.min(buf.length, end);
                        for (var i = start; i < end; ++i) {
                            ret += String.fromCharCode(buf[i] & 0x7F);
                        }
                        return ret;
                    }
                    function latin1Slice(buf, start, end) {
                        var ret = '';
                        end = Math.min(buf.length, end);
                        for (var i = start; i < end; ++i) {
                            ret += String.fromCharCode(buf[i]);
                        }
                        return ret;
                    }
                    function hexSlice(buf, start, end) {
                        var len = buf.length;
                        if (!start || start < 0)
                            start = 0;
                        if (!end || end < 0 || end > len)
                            end = len;
                        var out = '';
                        for (var i = start; i < end; ++i) {
                            out += toHex(buf[i]);
                        }
                        return out;
                    }
                    function utf16leSlice(buf, start, end) {
                        var bytes = buf.slice(start, end);
                        var res = '';
                        for (var i = 0; i < bytes.length; i += 2) {
                            res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
                        }
                        return res;
                    }
                    Buffer.prototype.slice = function slice(start, end) {
                        var len = this.length;
                        start = ~~start;
                        end = end === undefined ? len : ~~end;
                        if (start < 0) {
                            start += len;
                            if (start < 0)
                                start = 0;
                        }
                        else if (start > len) {
                            start = len;
                        }
                        if (end < 0) {
                            end += len;
                            if (end < 0)
                                end = 0;
                        }
                        else if (end > len) {
                            end = len;
                        }
                        if (end < start)
                            end = start;
                        var newBuf;
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            newBuf = this.subarray(start, end);
                            newBuf.__proto__ = Buffer.prototype;
                        }
                        else {
                            var sliceLen = end - start;
                            newBuf = new Buffer(sliceLen, undefined);
                            for (var i = 0; i < sliceLen; ++i) {
                                newBuf[i] = this[i + start];
                            }
                        }
                        return newBuf;
                    };
                    function checkOffset(offset, ext, length) {
                        if ((offset % 1) !== 0 || offset < 0)
                            throw new RangeError('offset is not uint');
                        if (offset + ext > length)
                            throw new RangeError('Trying to access beyond buffer length');
                    }
                    Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert)
                            checkOffset(offset, byteLength, this.length);
                        var val = this[offset];
                        var mul = 1;
                        var i = 0;
                        while (++i < byteLength && (mul *= 0x100)) {
                            val += this[offset + i] * mul;
                        }
                        return val;
                    };
                    Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) {
                            checkOffset(offset, byteLength, this.length);
                        }
                        var val = this[offset + --byteLength];
                        var mul = 1;
                        while (byteLength > 0 && (mul *= 0x100)) {
                            val += this[offset + --byteLength] * mul;
                        }
                        return val;
                    };
                    Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 1, this.length);
                        return this[offset];
                    };
                    Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 2, this.length);
                        return this[offset] | (this[offset + 1] << 8);
                    };
                    Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 2, this.length);
                        return (this[offset] << 8) | this[offset + 1];
                    };
                    Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 4, this.length);
                        return ((this[offset]) |
                            (this[offset + 1] << 8) |
                            (this[offset + 2] << 16)) +
                            (this[offset + 3] * 0x1000000);
                    };
                    Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 4, this.length);
                        return (this[offset] * 0x1000000) +
                            ((this[offset + 1] << 16) |
                                (this[offset + 2] << 8) |
                                this[offset + 3]);
                    };
                    Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert)
                            checkOffset(offset, byteLength, this.length);
                        var val = this[offset];
                        var mul = 1;
                        var i = 0;
                        while (++i < byteLength && (mul *= 0x100)) {
                            val += this[offset + i] * mul;
                        }
                        mul *= 0x80;
                        if (val >= mul)
                            val -= Math.pow(2, 8 * byteLength);
                        return val;
                    };
                    Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert)
                            checkOffset(offset, byteLength, this.length);
                        var i = byteLength;
                        var mul = 1;
                        var val = this[offset + --i];
                        while (i > 0 && (mul *= 0x100)) {
                            val += this[offset + --i] * mul;
                        }
                        mul *= 0x80;
                        if (val >= mul)
                            val -= Math.pow(2, 8 * byteLength);
                        return val;
                    };
                    Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 1, this.length);
                        if (!(this[offset] & 0x80))
                            return (this[offset]);
                        return ((0xff - this[offset] + 1) * -1);
                    };
                    Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 2, this.length);
                        var val = this[offset] | (this[offset + 1] << 8);
                        return (val & 0x8000) ? val | 0xFFFF0000 : val;
                    };
                    Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 2, this.length);
                        var val = this[offset + 1] | (this[offset] << 8);
                        return (val & 0x8000) ? val | 0xFFFF0000 : val;
                    };
                    Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 4, this.length);
                        return (this[offset]) |
                            (this[offset + 1] << 8) |
                            (this[offset + 2] << 16) |
                            (this[offset + 3] << 24);
                    };
                    Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 4, this.length);
                        return (this[offset] << 24) |
                            (this[offset + 1] << 16) |
                            (this[offset + 2] << 8) |
                            (this[offset + 3]);
                    };
                    Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 4, this.length);
                        return ieee754.read(this, offset, true, 23, 4);
                    };
                    Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 4, this.length);
                        return ieee754.read(this, offset, false, 23, 4);
                    };
                    Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 8, this.length);
                        return ieee754.read(this, offset, true, 52, 8);
                    };
                    Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
                        if (!noAssert)
                            checkOffset(offset, 8, this.length);
                        return ieee754.read(this, offset, false, 52, 8);
                    };
                    function checkInt(buf, value, offset, ext, max, min) {
                        if (!Buffer.isBuffer(buf))
                            throw new TypeError('"buffer" argument must be a Buffer instance');
                        if (value > max || value < min)
                            throw new RangeError('"value" argument is out of bounds');
                        if (offset + ext > buf.length)
                            throw new RangeError('Index out of range');
                    }
                    Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) {
                            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                            checkInt(this, value, offset, byteLength, maxBytes, 0);
                        }
                        var mul = 1;
                        var i = 0;
                        this[offset] = value & 0xFF;
                        while (++i < byteLength && (mul *= 0x100)) {
                            this[offset + i] = (value / mul) & 0xFF;
                        }
                        return offset + byteLength;
                    };
                    Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        byteLength = byteLength | 0;
                        if (!noAssert) {
                            var maxBytes = Math.pow(2, 8 * byteLength) - 1;
                            checkInt(this, value, offset, byteLength, maxBytes, 0);
                        }
                        var i = byteLength - 1;
                        var mul = 1;
                        this[offset + i] = value & 0xFF;
                        while (--i >= 0 && (mul *= 0x100)) {
                            this[offset + i] = (value / mul) & 0xFF;
                        }
                        return offset + byteLength;
                    };
                    Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert)
                            checkInt(this, value, offset, 1, 0xff, 0);
                        if (!Buffer.TYPED_ARRAY_SUPPORT)
                            value = Math.floor(value);
                        this[offset] = (value & 0xff);
                        return offset + 1;
                    };
                    function objectWriteUInt16(buf, value, offset, littleEndian) {
                        if (value < 0)
                            value = 0xffff + value + 1;
                        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
                            buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
                                (littleEndian ? i : 1 - i) * 8;
                        }
                    }
                    Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert)
                            checkInt(this, value, offset, 2, 0xffff, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value & 0xff);
                            this[offset + 1] = (value >>> 8);
                        }
                        else {
                            objectWriteUInt16(this, value, offset, true);
                        }
                        return offset + 2;
                    };
                    Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert)
                            checkInt(this, value, offset, 2, 0xffff, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value >>> 8);
                            this[offset + 1] = (value & 0xff);
                        }
                        else {
                            objectWriteUInt16(this, value, offset, false);
                        }
                        return offset + 2;
                    };
                    function objectWriteUInt32(buf, value, offset, littleEndian) {
                        if (value < 0)
                            value = 0xffffffff + value + 1;
                        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
                            buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
                        }
                    }
                    Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert)
                            checkInt(this, value, offset, 4, 0xffffffff, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset + 3] = (value >>> 24);
                            this[offset + 2] = (value >>> 16);
                            this[offset + 1] = (value >>> 8);
                            this[offset] = (value & 0xff);
                        }
                        else {
                            objectWriteUInt32(this, value, offset, true);
                        }
                        return offset + 4;
                    };
                    Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert)
                            checkInt(this, value, offset, 4, 0xffffffff, 0);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value >>> 24);
                            this[offset + 1] = (value >>> 16);
                            this[offset + 2] = (value >>> 8);
                            this[offset + 3] = (value & 0xff);
                        }
                        else {
                            objectWriteUInt32(this, value, offset, false);
                        }
                        return offset + 4;
                    };
                    Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) {
                            var limit = Math.pow(2, 8 * byteLength - 1);
                            checkInt(this, value, offset, byteLength, limit - 1, -limit);
                        }
                        var i = 0;
                        var mul = 1;
                        var sub = 0;
                        this[offset] = value & 0xFF;
                        while (++i < byteLength && (mul *= 0x100)) {
                            if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                                sub = 1;
                            }
                            this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
                        }
                        return offset + byteLength;
                    };
                    Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert) {
                            var limit = Math.pow(2, 8 * byteLength - 1);
                            checkInt(this, value, offset, byteLength, limit - 1, -limit);
                        }
                        var i = byteLength - 1;
                        var mul = 1;
                        var sub = 0;
                        this[offset + i] = value & 0xFF;
                        while (--i >= 0 && (mul *= 0x100)) {
                            if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                                sub = 1;
                            }
                            this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
                        }
                        return offset + byteLength;
                    };
                    Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert)
                            checkInt(this, value, offset, 1, 0x7f, -0x80);
                        if (!Buffer.TYPED_ARRAY_SUPPORT)
                            value = Math.floor(value);
                        if (value < 0)
                            value = 0xff + value + 1;
                        this[offset] = (value & 0xff);
                        return offset + 1;
                    };
                    Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert)
                            checkInt(this, value, offset, 2, 0x7fff, -0x8000);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value & 0xff);
                            this[offset + 1] = (value >>> 8);
                        }
                        else {
                            objectWriteUInt16(this, value, offset, true);
                        }
                        return offset + 2;
                    };
                    Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert)
                            checkInt(this, value, offset, 2, 0x7fff, -0x8000);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value >>> 8);
                            this[offset + 1] = (value & 0xff);
                        }
                        else {
                            objectWriteUInt16(this, value, offset, false);
                        }
                        return offset + 2;
                    };
                    Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert)
                            checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value & 0xff);
                            this[offset + 1] = (value >>> 8);
                            this[offset + 2] = (value >>> 16);
                            this[offset + 3] = (value >>> 24);
                        }
                        else {
                            objectWriteUInt32(this, value, offset, true);
                        }
                        return offset + 4;
                    };
                    Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
                        value = +value;
                        offset = offset | 0;
                        if (!noAssert)
                            checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
                        if (value < 0)
                            value = 0xffffffff + value + 1;
                        if (Buffer.TYPED_ARRAY_SUPPORT) {
                            this[offset] = (value >>> 24);
                            this[offset + 1] = (value >>> 16);
                            this[offset + 2] = (value >>> 8);
                            this[offset + 3] = (value & 0xff);
                        }
                        else {
                            objectWriteUInt32(this, value, offset, false);
                        }
                        return offset + 4;
                    };
                    function checkIEEE754(buf, value, offset, ext, max, min) {
                        if (offset + ext > buf.length)
                            throw new RangeError('Index out of range');
                        if (offset < 0)
                            throw new RangeError('Index out of range');
                    }
                    function writeFloat(buf, value, offset, littleEndian, noAssert) {
                        if (!noAssert) {
                            checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
                        }
                        ieee754.write(buf, value, offset, littleEndian, 23, 4);
                        return offset + 4;
                    }
                    Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
                        return writeFloat(this, value, offset, true, noAssert);
                    };
                    Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
                        return writeFloat(this, value, offset, false, noAssert);
                    };
                    function writeDouble(buf, value, offset, littleEndian, noAssert) {
                        if (!noAssert) {
                            checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
                        }
                        ieee754.write(buf, value, offset, littleEndian, 52, 8);
                        return offset + 8;
                    }
                    Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
                        return writeDouble(this, value, offset, true, noAssert);
                    };
                    Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
                        return writeDouble(this, value, offset, false, noAssert);
                    };
                    Buffer.prototype.copy = function copy(target, targetStart, start, end) {
                        if (!start)
                            start = 0;
                        if (!end && end !== 0)
                            end = this.length;
                        if (targetStart >= target.length)
                            targetStart = target.length;
                        if (!targetStart)
                            targetStart = 0;
                        if (end > 0 && end < start)
                            end = start;
                        if (end === start)
                            return 0;
                        if (target.length === 0 || this.length === 0)
                            return 0;
                        if (targetStart < 0) {
                            throw new RangeError('targetStart out of bounds');
                        }
                        if (start < 0 || start >= this.length)
                            throw new RangeError('sourceStart out of bounds');
                        if (end < 0)
                            throw new RangeError('sourceEnd out of bounds');
                        if (end > this.length)
                            end = this.length;
                        if (target.length - targetStart < end - start) {
                            end = target.length - targetStart + start;
                        }
                        var len = end - start;
                        var i;
                        if (this === target && start < targetStart && targetStart < end) {
                            for (i = len - 1; i >= 0; --i) {
                                target[i + targetStart] = this[i + start];
                            }
                        }
                        else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
                            for (i = 0; i < len; ++i) {
                                target[i + targetStart] = this[i + start];
                            }
                        }
                        else {
                            Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
                        }
                        return len;
                    };
                    Buffer.prototype.fill = function fill(val, start, end, encoding) {
                        if (typeof val === 'string') {
                            if (typeof start === 'string') {
                                encoding = start;
                                start = 0;
                                end = this.length;
                            }
                            else if (typeof end === 'string') {
                                encoding = end;
                                end = this.length;
                            }
                            if (val.length === 1) {
                                var code = val.charCodeAt(0);
                                if (code < 256) {
                                    val = code;
                                }
                            }
                            if (encoding !== undefined && typeof encoding !== 'string') {
                                throw new TypeError('encoding must be a string');
                            }
                            if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
                                throw new TypeError('Unknown encoding: ' + encoding);
                            }
                        }
                        else if (typeof val === 'number') {
                            val = val & 255;
                        }
                        if (start < 0 || this.length < start || this.length < end) {
                            throw new RangeError('Out of range index');
                        }
                        if (end <= start) {
                            return this;
                        }
                        start = start >>> 0;
                        end = end === undefined ? this.length : end >>> 0;
                        if (!val)
                            val = 0;
                        var i;
                        if (typeof val === 'number') {
                            for (i = start; i < end; ++i) {
                                this[i] = val;
                            }
                        }
                        else {
                            var bytes = Buffer.isBuffer(val)
                                ? val
                                : utf8ToBytes(new Buffer(val, encoding).toString());
                            var len = bytes.length;
                            for (i = 0; i < end - start; ++i) {
                                this[i + start] = bytes[i % len];
                            }
                        }
                        return this;
                    };
                    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
                    function base64clean(str) {
                        str = stringtrim(str).replace(INVALID_BASE64_RE, '');
                        if (str.length < 2)
                            return '';
                        while (str.length % 4 !== 0) {
                            str = str + '=';
                        }
                        return str;
                    }
                    function stringtrim(str) {
                        if (str.trim)
                            return str.trim();
                        return str.replace(/^\s+|\s+$/g, '');
                    }
                    function toHex(n) {
                        if (n < 16)
                            return '0' + n.toString(16);
                        return n.toString(16);
                    }
                    function utf8ToBytes(string, units) {
                        units = units || Infinity;
                        var codePoint;
                        var length = string.length;
                        var leadSurrogate = null;
                        var bytes = [];
                        for (var i = 0; i < length; ++i) {
                            codePoint = string.charCodeAt(i);
                            if (codePoint > 0xD7FF && codePoint < 0xE000) {
                                if (!leadSurrogate) {
                                    if (codePoint > 0xDBFF) {
                                        if ((units -= 3) > -1)
                                            bytes.push(0xEF, 0xBF, 0xBD);
                                        continue;
                                    }
                                    else if (i + 1 === length) {
                                        if ((units -= 3) > -1)
                                            bytes.push(0xEF, 0xBF, 0xBD);
                                        continue;
                                    }
                                    leadSurrogate = codePoint;
                                    continue;
                                }
                                if (codePoint < 0xDC00) {
                                    if ((units -= 3) > -1)
                                        bytes.push(0xEF, 0xBF, 0xBD);
                                    leadSurrogate = codePoint;
                                    continue;
                                }
                                codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
                            }
                            else if (leadSurrogate) {
                                if ((units -= 3) > -1)
                                    bytes.push(0xEF, 0xBF, 0xBD);
                            }
                            leadSurrogate = null;
                            if (codePoint < 0x80) {
                                if ((units -= 1) < 0)
                                    break;
                                bytes.push(codePoint);
                            }
                            else if (codePoint < 0x800) {
                                if ((units -= 2) < 0)
                                    break;
                                bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
                            }
                            else if (codePoint < 0x10000) {
                                if ((units -= 3) < 0)
                                    break;
                                bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
                            }
                            else if (codePoint < 0x110000) {
                                if ((units -= 4) < 0)
                                    break;
                                bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
                            }
                            else {
                                throw new Error('Invalid code point');
                            }
                        }
                        return bytes;
                    }
                    function asciiToBytes(str) {
                        var byteArray = [];
                        for (var i = 0; i < str.length; ++i) {
                            byteArray.push(str.charCodeAt(i) & 0xFF);
                        }
                        return byteArray;
                    }
                    function utf16leToBytes(str, units) {
                        var c, hi, lo;
                        var byteArray = [];
                        for (var i = 0; i < str.length; ++i) {
                            if ((units -= 2) < 0)
                                break;
                            c = str.charCodeAt(i);
                            hi = c >> 8;
                            lo = c % 256;
                            byteArray.push(lo);
                            byteArray.push(hi);
                        }
                        return byteArray;
                    }
                    function base64ToBytes(str) {
                        return base64.toByteArray(base64clean(str));
                    }
                    function blitBuffer(src, dst, offset, length) {
                        for (var i = 0; i < length; ++i) {
                            if ((i + offset >= dst.length) || (i >= src.length))
                                break;
                            dst[i + offset] = src[i];
                        }
                        return i;
                    }
                    function isnan(val) {
                        return val !== val;
                    }
                }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
            }, { "base64-js": 8, "ieee754": 100, "isarray": 102 }], 10: [function (_dereq_, module, exports) {
                'use strict';
                module.exports.parse = parse;
                module.exports.generate = generate;
                var regex = /^\s*(?:([A-Za-z$_][A-Za-z0-9$_]*)\s*\.)?\s*([A-Za-z$_][A-Za-z0-9$_]*)\s*\(\s*((?:[A-Za-z$_][A-Za-z0-9$_]*)|(?:\[\s*[A-Za-z$_][A-Za-z0-9$_]*\s*]))?((?:\s*,\s*(?:(?:[A-Za-z$_][A-Za-z0-9$_]*)|(?:\[\s*[A-Za-z$_][A-Za-z0-9$_]*\s*])))+)?\s*\)\s*$/;
                function parse(str) {
                    var match = regex.exec(str);
                    if (!match) {
                        return null;
                    }
                    var callee;
                    if (match[1]) {
                        callee = {
                            type: 'MemberExpression',
                            object: match[1],
                            member: match[2]
                        };
                    }
                    else {
                        callee = {
                            type: 'Identifier',
                            name: match[2]
                        };
                    }
                    var args = match[4] || '';
                    args = args.split(',');
                    if (match[3]) {
                        args[0] = match[3];
                    }
                    var trimmed = [];
                    args.forEach(function (str) {
                        var optional = false;
                        str = str.replace(/\s+/g, '');
                        if (!str.length) {
                            return;
                        }
                        if (str.charAt(0) === '[' && str.charAt(str.length - 1) === ']') {
                            optional = true;
                            str = str.substring(1, str.length - 1);
                        }
                        trimmed.push({
                            name: str,
                            optional: optional
                        });
                    });
                    return {
                        callee: callee,
                        args: trimmed
                    };
                }
                function generate(parsed) {
                    var callee;
                    if (parsed.callee.type === 'MemberExpression') {
                        callee = [
                            parsed.callee.object,
                            '.',
                            parsed.callee.member
                        ];
                    }
                    else {
                        callee = [parsed.callee.name];
                    }
                    return callee.concat([
                        '(',
                        parsed.args.map(function (arg) {
                            return arg.optional ? '[' + arg.name + ']' : arg.name;
                        }).join(', '),
                        ')'
                    ]).join('');
                }
            }, {}], 11: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.array.filter');
                module.exports = _dereq_('../../modules/_core').Array.filter;
            }, { "../../modules/_core": 31, "../../modules/es6.array.filter": 68 }], 12: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.array.for-each');
                module.exports = _dereq_('../../modules/_core').Array.forEach;
            }, { "../../modules/_core": 31, "../../modules/es6.array.for-each": 69 }], 13: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.array.index-of');
                module.exports = _dereq_('../../modules/_core').Array.indexOf;
            }, { "../../modules/_core": 31, "../../modules/es6.array.index-of": 70 }], 14: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.array.is-array');
                module.exports = _dereq_('../../modules/_core').Array.isArray;
            }, { "../../modules/_core": 31, "../../modules/es6.array.is-array": 71 }], 15: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.array.map');
                module.exports = _dereq_('../../modules/_core').Array.map;
            }, { "../../modules/_core": 31, "../../modules/es6.array.map": 72 }], 16: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.array.reduce-right');
                module.exports = _dereq_('../../modules/_core').Array.reduceRight;
            }, { "../../modules/_core": 31, "../../modules/es6.array.reduce-right": 73 }], 17: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.array.reduce');
                module.exports = _dereq_('../../modules/_core').Array.reduce;
            }, { "../../modules/_core": 31, "../../modules/es6.array.reduce": 74 }], 18: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.array.some');
                module.exports = _dereq_('../../modules/_core').Array.some;
            }, { "../../modules/_core": 31, "../../modules/es6.array.some": 75 }], 19: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.object.assign');
                module.exports = _dereq_('../../modules/_core').Object.assign;
            }, { "../../modules/_core": 31, "../../modules/es6.object.assign": 76 }], 20: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.object.create');
                var $Object = _dereq_('../../modules/_core').Object;
                module.exports = function create(P, D) {
                    return $Object.create(P, D);
                };
            }, { "../../modules/_core": 31, "../../modules/es6.object.create": 77 }], 21: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.object.define-property');
                var $Object = _dereq_('../../modules/_core').Object;
                module.exports = function defineProperty(it, key, desc) {
                    return $Object.defineProperty(it, key, desc);
                };
            }, { "../../modules/_core": 31, "../../modules/es6.object.define-property": 78 }], 22: [function (_dereq_, module, exports) {
                _dereq_('../../modules/es6.object.keys');
                module.exports = _dereq_('../../modules/_core').Object.keys;
            }, { "../../modules/_core": 31, "../../modules/es6.object.keys": 79 }], 23: [function (_dereq_, module, exports) {
                module.exports = function (it) {
                    if (typeof it != 'function')
                        throw TypeError(it + ' is not a function!');
                    return it;
                };
            }, {}], 24: [function (_dereq_, module, exports) {
                var isObject = _dereq_('./_is-object');
                module.exports = function (it) {
                    if (!isObject(it))
                        throw TypeError(it + ' is not an object!');
                    return it;
                };
            }, { "./_is-object": 46 }], 25: [function (_dereq_, module, exports) {
                var toIObject = _dereq_('./_to-iobject'), toLength = _dereq_('./_to-length'), toIndex = _dereq_('./_to-index');
                module.exports = function (IS_INCLUDES) {
                    return function ($this, el, fromIndex) {
                        var O = toIObject($this), length = toLength(O.length), index = toIndex(fromIndex, length), value;
                        if (IS_INCLUDES && el != el)
                            while (length > index) {
                                value = O[index++];
                                if (value != value)
                                    return true;
                            }
                        else
                            for (; length > index; index++)
                                if (IS_INCLUDES || index in O) {
                                    if (O[index] === el)
                                        return IS_INCLUDES || index || 0;
                                }
                        return !IS_INCLUDES && -1;
                    };
                };
            }, { "./_to-index": 60, "./_to-iobject": 62, "./_to-length": 63 }], 26: [function (_dereq_, module, exports) {
                var ctx = _dereq_('./_ctx'), IObject = _dereq_('./_iobject'), toObject = _dereq_('./_to-object'), toLength = _dereq_('./_to-length'), asc = _dereq_('./_array-species-create');
                module.exports = function (TYPE, $create) {
                    var IS_MAP = TYPE == 1, IS_FILTER = TYPE == 2, IS_SOME = TYPE == 3, IS_EVERY = TYPE == 4, IS_FIND_INDEX = TYPE == 6, NO_HOLES = TYPE == 5 || IS_FIND_INDEX, create = $create || asc;
                    return function ($this, callbackfn, that) {
                        var O = toObject($this), self = IObject(O), f = ctx(callbackfn, that, 3), length = toLength(self.length), index = 0, result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined, val, res;
                        for (; length > index; index++)
                            if (NO_HOLES || index in self) {
                                val = self[index];
                                res = f(val, index, O);
                                if (TYPE) {
                                    if (IS_MAP)
                                        result[index] = res;
                                    else if (res)
                                        switch (TYPE) {
                                            case 3: return true;
                                            case 5: return val;
                                            case 6: return index;
                                            case 2: result.push(val);
                                        }
                                    else if (IS_EVERY)
                                        return false;
                                }
                            }
                        return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
                    };
                };
            }, { "./_array-species-create": 29, "./_ctx": 32, "./_iobject": 44, "./_to-length": 63, "./_to-object": 64 }], 27: [function (_dereq_, module, exports) {
                var aFunction = _dereq_('./_a-function'), toObject = _dereq_('./_to-object'), IObject = _dereq_('./_iobject'), toLength = _dereq_('./_to-length');
                module.exports = function (that, callbackfn, aLen, memo, isRight) {
                    aFunction(callbackfn);
                    var O = toObject(that), self = IObject(O), length = toLength(O.length), index = isRight ? length - 1 : 0, i = isRight ? -1 : 1;
                    if (aLen < 2)
                        for (;;) {
                            if (index in self) {
                                memo = self[index];
                                index += i;
                                break;
                            }
                            index += i;
                            if (isRight ? index < 0 : length <= index) {
                                throw TypeError('Reduce of empty array with no initial value');
                            }
                        }
                    for (; isRight ? index >= 0 : length > index; index += i)
                        if (index in self) {
                            memo = callbackfn(memo, self[index], index, O);
                        }
                    return memo;
                };
            }, { "./_a-function": 23, "./_iobject": 44, "./_to-length": 63, "./_to-object": 64 }], 28: [function (_dereq_, module, exports) {
                var isObject = _dereq_('./_is-object'), isArray = _dereq_('./_is-array'), SPECIES = _dereq_('./_wks')('species');
                module.exports = function (original) {
                    var C;
                    if (isArray(original)) {
                        C = original.constructor;
                        if (typeof C == 'function' && (C === Array || isArray(C.prototype)))
                            C = undefined;
                        if (isObject(C)) {
                            C = C[SPECIES];
                            if (C === null)
                                C = undefined;
                        }
                    }
                    return C === undefined ? Array : C;
                };
            }, { "./_is-array": 45, "./_is-object": 46, "./_wks": 67 }], 29: [function (_dereq_, module, exports) {
                var speciesConstructor = _dereq_('./_array-species-constructor');
                module.exports = function (original, length) {
                    return new (speciesConstructor(original))(length);
                };
            }, { "./_array-species-constructor": 28 }], 30: [function (_dereq_, module, exports) {
                var toString = {}.toString;
                module.exports = function (it) {
                    return toString.call(it).slice(8, -1);
                };
            }, {}], 31: [function (_dereq_, module, exports) {
                var core = module.exports = { version: '2.4.0' };
                if (typeof __e == 'number')
                    __e = core;
            }, {}], 32: [function (_dereq_, module, exports) {
                var aFunction = _dereq_('./_a-function');
                module.exports = function (fn, that, length) {
                    aFunction(fn);
                    if (that === undefined)
                        return fn;
                    switch (length) {
                        case 1: return function (a) {
                            return fn.call(that, a);
                        };
                        case 2: return function (a, b) {
                            return fn.call(that, a, b);
                        };
                        case 3: return function (a, b, c) {
                            return fn.call(that, a, b, c);
                        };
                    }
                    return function () {
                        return fn.apply(that, arguments);
                    };
                };
            }, { "./_a-function": 23 }], 33: [function (_dereq_, module, exports) {
                module.exports = function (it) {
                    if (it == undefined)
                        throw TypeError("Can't call method on  " + it);
                    return it;
                };
            }, {}], 34: [function (_dereq_, module, exports) {
                module.exports = !_dereq_('./_fails')(function () {
                    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
                });
            }, { "./_fails": 38 }], 35: [function (_dereq_, module, exports) {
                var isObject = _dereq_('./_is-object'), document = _dereq_('./_global').document, is = isObject(document) && isObject(document.createElement);
                module.exports = function (it) {
                    return is ? document.createElement(it) : {};
                };
            }, { "./_global": 39, "./_is-object": 46 }], 36: [function (_dereq_, module, exports) {
                module.exports = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf').split(',');
            }, {}], 37: [function (_dereq_, module, exports) {
                var global = _dereq_('./_global'), core = _dereq_('./_core'), ctx = _dereq_('./_ctx'), hide = _dereq_('./_hide'), PROTOTYPE = 'prototype';
                var $export = function (type, name, source) {
                    var IS_FORCED = type & $export.F, IS_GLOBAL = type & $export.G, IS_STATIC = type & $export.S, IS_PROTO = type & $export.P, IS_BIND = type & $export.B, IS_WRAP = type & $export.W, exports = IS_GLOBAL ? core : core[name] || (core[name] = {}), expProto = exports[PROTOTYPE], target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE], key, own, out;
                    if (IS_GLOBAL)
                        source = name;
                    for (key in source) {
                        own = !IS_FORCED && target && target[key] !== undefined;
                        if (own && key in exports)
                            continue;
                        out = own ? target[key] : source[key];
                        exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
                            : IS_BIND && own ? ctx(out, global)
                                : IS_WRAP && target[key] == out ? (function (C) {
                                    var F = function (a, b, c) {
                                        if (this instanceof C) {
                                            switch (arguments.length) {
                                                case 0: return new C;
                                                case 1: return new C(a);
                                                case 2: return new C(a, b);
                                            }
                                            return new C(a, b, c);
                                        }
                                        return C.apply(this, arguments);
                                    };
                                    F[PROTOTYPE] = C[PROTOTYPE];
                                    return F;
                                })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
                        if (IS_PROTO) {
                            (exports.virtual || (exports.virtual = {}))[key] = out;
                            if (type & $export.R && expProto && !expProto[key])
                                hide(expProto, key, out);
                        }
                    }
                };
                $export.F = 1;
                $export.G = 2;
                $export.S = 4;
                $export.P = 8;
                $export.B = 16;
                $export.W = 32;
                $export.U = 64;
                $export.R = 128;
                module.exports = $export;
            }, { "./_core": 31, "./_ctx": 32, "./_global": 39, "./_hide": 41 }], 38: [function (_dereq_, module, exports) {
                module.exports = function (exec) {
                    try {
                        return !!exec();
                    }
                    catch (e) {
                        return true;
                    }
                };
            }, {}], 39: [function (_dereq_, module, exports) {
                var global = module.exports = typeof window != 'undefined' && window.Math == Math
                    ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
                if (typeof __g == 'number')
                    __g = global;
            }, {}], 40: [function (_dereq_, module, exports) {
                var hasOwnProperty = {}.hasOwnProperty;
                module.exports = function (it, key) {
                    return hasOwnProperty.call(it, key);
                };
            }, {}], 41: [function (_dereq_, module, exports) {
                var dP = _dereq_('./_object-dp'), createDesc = _dereq_('./_property-desc');
                module.exports = _dereq_('./_descriptors') ? function (object, key, value) {
                    return dP.f(object, key, createDesc(1, value));
                } : function (object, key, value) {
                    object[key] = value;
                    return object;
                };
            }, { "./_descriptors": 34, "./_object-dp": 49, "./_property-desc": 56 }], 42: [function (_dereq_, module, exports) {
                module.exports = _dereq_('./_global').document && document.documentElement;
            }, { "./_global": 39 }], 43: [function (_dereq_, module, exports) {
                module.exports = !_dereq_('./_descriptors') && !_dereq_('./_fails')(function () {
                    return Object.defineProperty(_dereq_('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
                });
            }, { "./_descriptors": 34, "./_dom-create": 35, "./_fails": 38 }], 44: [function (_dereq_, module, exports) {
                var cof = _dereq_('./_cof');
                module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
                    return cof(it) == 'String' ? it.split('') : Object(it);
                };
            }, { "./_cof": 30 }], 45: [function (_dereq_, module, exports) {
                var cof = _dereq_('./_cof');
                module.exports = Array.isArray || function isArray(arg) {
                    return cof(arg) == 'Array';
                };
            }, { "./_cof": 30 }], 46: [function (_dereq_, module, exports) {
                module.exports = function (it) {
                    return typeof it === 'object' ? it !== null : typeof it === 'function';
                };
            }, {}], 47: [function (_dereq_, module, exports) {
                'use strict';
                var getKeys = _dereq_('./_object-keys'), gOPS = _dereq_('./_object-gops'), pIE = _dereq_('./_object-pie'), toObject = _dereq_('./_to-object'), IObject = _dereq_('./_iobject'), $assign = Object.assign;
                module.exports = !$assign || _dereq_('./_fails')(function () {
                    var A = {}, B = {}, S = Symbol(), K = 'abcdefghijklmnopqrst';
                    A[S] = 7;
                    K.split('').forEach(function (k) { B[k] = k; });
                    return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
                }) ? function assign(target, source) {
                    var T = toObject(target), aLen = arguments.length, index = 1, getSymbols = gOPS.f, isEnum = pIE.f;
                    while (aLen > index) {
                        var S = IObject(arguments[index++]), keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S), length = keys.length, j = 0, key;
                        while (length > j)
                            if (isEnum.call(S, key = keys[j++]))
                                T[key] = S[key];
                    }
                    return T;
                } : $assign;
            }, { "./_fails": 38, "./_iobject": 44, "./_object-gops": 51, "./_object-keys": 53, "./_object-pie": 54, "./_to-object": 64 }], 48: [function (_dereq_, module, exports) {
                var anObject = _dereq_('./_an-object'), dPs = _dereq_('./_object-dps'), enumBugKeys = _dereq_('./_enum-bug-keys'), IE_PROTO = _dereq_('./_shared-key')('IE_PROTO'), Empty = function () { }, PROTOTYPE = 'prototype';
                var createDict = function () {
                    var iframe = _dereq_('./_dom-create')('iframe'), i = enumBugKeys.length, lt = '<', gt = '>', iframeDocument;
                    iframe.style.display = 'none';
                    _dereq_('./_html').appendChild(iframe);
                    iframe.src = 'javascript:';
                    iframeDocument = iframe.contentWindow.document;
                    iframeDocument.open();
                    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
                    iframeDocument.close();
                    createDict = iframeDocument.F;
                    while (i--)
                        delete createDict[PROTOTYPE][enumBugKeys[i]];
                    return createDict();
                };
                module.exports = Object.create || function create(O, Properties) {
                    var result;
                    if (O !== null) {
                        Empty[PROTOTYPE] = anObject(O);
                        result = new Empty;
                        Empty[PROTOTYPE] = null;
                        result[IE_PROTO] = O;
                    }
                    else
                        result = createDict();
                    return Properties === undefined ? result : dPs(result, Properties);
                };
            }, { "./_an-object": 24, "./_dom-create": 35, "./_enum-bug-keys": 36, "./_html": 42, "./_object-dps": 50, "./_shared-key": 57 }], 49: [function (_dereq_, module, exports) {
                var anObject = _dereq_('./_an-object'), IE8_DOM_DEFINE = _dereq_('./_ie8-dom-define'), toPrimitive = _dereq_('./_to-primitive'), dP = Object.defineProperty;
                exports.f = _dereq_('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
                    anObject(O);
                    P = toPrimitive(P, true);
                    anObject(Attributes);
                    if (IE8_DOM_DEFINE)
                        try {
                            return dP(O, P, Attributes);
                        }
                        catch (e) { }
                    if ('get' in Attributes || 'set' in Attributes)
                        throw TypeError('Accessors not supported!');
                    if ('value' in Attributes)
                        O[P] = Attributes.value;
                    return O;
                };
            }, { "./_an-object": 24, "./_descriptors": 34, "./_ie8-dom-define": 43, "./_to-primitive": 65 }], 50: [function (_dereq_, module, exports) {
                var dP = _dereq_('./_object-dp'), anObject = _dereq_('./_an-object'), getKeys = _dereq_('./_object-keys');
                module.exports = _dereq_('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
                    anObject(O);
                    var keys = getKeys(Properties), length = keys.length, i = 0, P;
                    while (length > i)
                        dP.f(O, P = keys[i++], Properties[P]);
                    return O;
                };
            }, { "./_an-object": 24, "./_descriptors": 34, "./_object-dp": 49, "./_object-keys": 53 }], 51: [function (_dereq_, module, exports) {
                exports.f = Object.getOwnPropertySymbols;
            }, {}], 52: [function (_dereq_, module, exports) {
                var has = _dereq_('./_has'), toIObject = _dereq_('./_to-iobject'), arrayIndexOf = _dereq_('./_array-includes')(false), IE_PROTO = _dereq_('./_shared-key')('IE_PROTO');
                module.exports = function (object, names) {
                    var O = toIObject(object), i = 0, result = [], key;
                    for (key in O)
                        if (key != IE_PROTO)
                            has(O, key) && result.push(key);
                    while (names.length > i)
                        if (has(O, key = names[i++])) {
                            ~arrayIndexOf(result, key) || result.push(key);
                        }
                    return result;
                };
            }, { "./_array-includes": 25, "./_has": 40, "./_shared-key": 57, "./_to-iobject": 62 }], 53: [function (_dereq_, module, exports) {
                var $keys = _dereq_('./_object-keys-internal'), enumBugKeys = _dereq_('./_enum-bug-keys');
                module.exports = Object.keys || function keys(O) {
                    return $keys(O, enumBugKeys);
                };
            }, { "./_enum-bug-keys": 36, "./_object-keys-internal": 52 }], 54: [function (_dereq_, module, exports) {
                exports.f = {}.propertyIsEnumerable;
            }, {}], 55: [function (_dereq_, module, exports) {
                var $export = _dereq_('./_export'), core = _dereq_('./_core'), fails = _dereq_('./_fails');
                module.exports = function (KEY, exec) {
                    var fn = (core.Object || {})[KEY] || Object[KEY], exp = {};
                    exp[KEY] = exec(fn);
                    $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
                };
            }, { "./_core": 31, "./_export": 37, "./_fails": 38 }], 56: [function (_dereq_, module, exports) {
                module.exports = function (bitmap, value) {
                    return {
                        enumerable: !(bitmap & 1),
                        configurable: !(bitmap & 2),
                        writable: !(bitmap & 4),
                        value: value
                    };
                };
            }, {}], 57: [function (_dereq_, module, exports) {
                var shared = _dereq_('./_shared')('keys'), uid = _dereq_('./_uid');
                module.exports = function (key) {
                    return shared[key] || (shared[key] = uid(key));
                };
            }, { "./_shared": 58, "./_uid": 66 }], 58: [function (_dereq_, module, exports) {
                var global = _dereq_('./_global'), SHARED = '__core-js_shared__', store = global[SHARED] || (global[SHARED] = {});
                module.exports = function (key) {
                    return store[key] || (store[key] = {});
                };
            }, { "./_global": 39 }], 59: [function (_dereq_, module, exports) {
                var fails = _dereq_('./_fails');
                module.exports = function (method, arg) {
                    return !!method && fails(function () {
                        arg ? method.call(null, function () { }, 1) : method.call(null);
                    });
                };
            }, { "./_fails": 38 }], 60: [function (_dereq_, module, exports) {
                var toInteger = _dereq_('./_to-integer'), max = Math.max, min = Math.min;
                module.exports = function (index, length) {
                    index = toInteger(index);
                    return index < 0 ? max(index + length, 0) : min(index, length);
                };
            }, { "./_to-integer": 61 }], 61: [function (_dereq_, module, exports) {
                var ceil = Math.ceil, floor = Math.floor;
                module.exports = function (it) {
                    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
                };
            }, {}], 62: [function (_dereq_, module, exports) {
                var IObject = _dereq_('./_iobject'), defined = _dereq_('./_defined');
                module.exports = function (it) {
                    return IObject(defined(it));
                };
            }, { "./_defined": 33, "./_iobject": 44 }], 63: [function (_dereq_, module, exports) {
                var toInteger = _dereq_('./_to-integer'), min = Math.min;
                module.exports = function (it) {
                    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
                };
            }, { "./_to-integer": 61 }], 64: [function (_dereq_, module, exports) {
                var defined = _dereq_('./_defined');
                module.exports = function (it) {
                    return Object(defined(it));
                };
            }, { "./_defined": 33 }], 65: [function (_dereq_, module, exports) {
                var isObject = _dereq_('./_is-object');
                module.exports = function (it, S) {
                    if (!isObject(it))
                        return it;
                    var fn, val;
                    if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))
                        return val;
                    if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))
                        return val;
                    if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))
                        return val;
                    throw TypeError("Can't convert object to primitive value");
                };
            }, { "./_is-object": 46 }], 66: [function (_dereq_, module, exports) {
                var id = 0, px = Math.random();
                module.exports = function (key) {
                    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
                };
            }, {}], 67: [function (_dereq_, module, exports) {
                var store = _dereq_('./_shared')('wks'), uid = _dereq_('./_uid'), Symbol = _dereq_('./_global').Symbol, USE_SYMBOL = typeof Symbol == 'function';
                var $exports = module.exports = function (name) {
                    return store[name] || (store[name] =
                        USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
                };
                $exports.store = store;
            }, { "./_global": 39, "./_shared": 58, "./_uid": 66 }], 68: [function (_dereq_, module, exports) {
                'use strict';
                var $export = _dereq_('./_export'), $filter = _dereq_('./_array-methods')(2);
                $export($export.P + $export.F * !_dereq_('./_strict-method')([].filter, true), 'Array', {
                    filter: function filter(callbackfn) {
                        return $filter(this, callbackfn, arguments[1]);
                    }
                });
            }, { "./_array-methods": 26, "./_export": 37, "./_strict-method": 59 }], 69: [function (_dereq_, module, exports) {
                'use strict';
                var $export = _dereq_('./_export'), $forEach = _dereq_('./_array-methods')(0), STRICT = _dereq_('./_strict-method')([].forEach, true);
                $export($export.P + $export.F * !STRICT, 'Array', {
                    forEach: function forEach(callbackfn) {
                        return $forEach(this, callbackfn, arguments[1]);
                    }
                });
            }, { "./_array-methods": 26, "./_export": 37, "./_strict-method": 59 }], 70: [function (_dereq_, module, exports) {
                'use strict';
                var $export = _dereq_('./_export'), $indexOf = _dereq_('./_array-includes')(false), $native = [].indexOf, NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;
                $export($export.P + $export.F * (NEGATIVE_ZERO || !_dereq_('./_strict-method')($native)), 'Array', {
                    indexOf: function indexOf(searchElement) {
                        return NEGATIVE_ZERO
                            ? $native.apply(this, arguments) || 0
                            : $indexOf(this, searchElement, arguments[1]);
                    }
                });
            }, { "./_array-includes": 25, "./_export": 37, "./_strict-method": 59 }], 71: [function (_dereq_, module, exports) {
                var $export = _dereq_('./_export');
                $export($export.S, 'Array', { isArray: _dereq_('./_is-array') });
            }, { "./_export": 37, "./_is-array": 45 }], 72: [function (_dereq_, module, exports) {
                'use strict';
                var $export = _dereq_('./_export'), $map = _dereq_('./_array-methods')(1);
                $export($export.P + $export.F * !_dereq_('./_strict-method')([].map, true), 'Array', {
                    map: function map(callbackfn) {
                        return $map(this, callbackfn, arguments[1]);
                    }
                });
            }, { "./_array-methods": 26, "./_export": 37, "./_strict-method": 59 }], 73: [function (_dereq_, module, exports) {
                'use strict';
                var $export = _dereq_('./_export'), $reduce = _dereq_('./_array-reduce');
                $export($export.P + $export.F * !_dereq_('./_strict-method')([].reduceRight, true), 'Array', {
                    reduceRight: function reduceRight(callbackfn) {
                        return $reduce(this, callbackfn, arguments.length, arguments[1], true);
                    }
                });
            }, { "./_array-reduce": 27, "./_export": 37, "./_strict-method": 59 }], 74: [function (_dereq_, module, exports) {
                'use strict';
                var $export = _dereq_('./_export'), $reduce = _dereq_('./_array-reduce');
                $export($export.P + $export.F * !_dereq_('./_strict-method')([].reduce, true), 'Array', {
                    reduce: function reduce(callbackfn) {
                        return $reduce(this, callbackfn, arguments.length, arguments[1], false);
                    }
                });
            }, { "./_array-reduce": 27, "./_export": 37, "./_strict-method": 59 }], 75: [function (_dereq_, module, exports) {
                'use strict';
                var $export = _dereq_('./_export'), $some = _dereq_('./_array-methods')(3);
                $export($export.P + $export.F * !_dereq_('./_strict-method')([].some, true), 'Array', {
                    some: function some(callbackfn) {
                        return $some(this, callbackfn, arguments[1]);
                    }
                });
            }, { "./_array-methods": 26, "./_export": 37, "./_strict-method": 59 }], 76: [function (_dereq_, module, exports) {
                var $export = _dereq_('./_export');
                $export($export.S + $export.F, 'Object', { assign: _dereq_('./_object-assign') });
            }, { "./_export": 37, "./_object-assign": 47 }], 77: [function (_dereq_, module, exports) {
                var $export = _dereq_('./_export');
                $export($export.S, 'Object', { create: _dereq_('./_object-create') });
            }, { "./_export": 37, "./_object-create": 48 }], 78: [function (_dereq_, module, exports) {
                var $export = _dereq_('./_export');
                $export($export.S + $export.F * !_dereq_('./_descriptors'), 'Object', { defineProperty: _dereq_('./_object-dp').f });
            }, { "./_descriptors": 34, "./_export": 37, "./_object-dp": 49 }], 79: [function (_dereq_, module, exports) {
                var toObject = _dereq_('./_to-object'), $keys = _dereq_('./_object-keys');
                _dereq_('./_object-sap')('keys', function () {
                    return function keys(it) {
                        return $keys(toObject(it));
                    };
                });
            }, { "./_object-keys": 53, "./_object-sap": 55, "./_to-object": 64 }], 80: [function (_dereq_, module, exports) {
                'use strict';
                var keys = _dereq_('object-keys');
                var foreach = _dereq_('foreach');
                var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';
                var toStr = Object.prototype.toString;
                var isFunction = function (fn) {
                    return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
                };
                var arePropertyDescriptorsSupported = function () {
                    var obj = {};
                    try {
                        Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
                        for (var _ in obj) {
                            return false;
                        }
                        return obj.x === obj;
                    }
                    catch (e) {
                        return false;
                    }
                };
                var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();
                var defineProperty = function (object, name, value, predicate) {
                    if (name in object && (!isFunction(predicate) || !predicate())) {
                        return;
                    }
                    if (supportsDescriptors) {
                        Object.defineProperty(object, name, {
                            configurable: true,
                            enumerable: false,
                            value: value,
                            writable: true
                        });
                    }
                    else {
                        object[name] = value;
                    }
                };
                var defineProperties = function (object, map) {
                    var predicates = arguments.length > 2 ? arguments[2] : {};
                    var props = keys(map);
                    if (hasSymbols) {
                        props = props.concat(Object.getOwnPropertySymbols(map));
                    }
                    foreach(props, function (name) {
                        defineProperty(object, name, map[name], predicates[name]);
                    });
                };
                defineProperties.supportsDescriptors = !!supportsDescriptors;
                module.exports = defineProperties;
            }, { "foreach": 99, "object-keys": 103 }], 81: [function (_dereq_, module, exports) {
                'use strict';
                function diff_match_patch() {
                    this.Diff_Timeout = 1.0;
                    this.Diff_EditCost = 4;
                    this.Match_Threshold = 0.5;
                    this.Match_Distance = 1000;
                    this.Patch_DeleteThreshold = 0.5;
                    this.Patch_Margin = 4;
                    this.Match_MaxBits = 32;
                }
                var DIFF_DELETE = -1;
                var DIFF_INSERT = 1;
                var DIFF_EQUAL = 0;
                diff_match_patch.Diff;
                diff_match_patch.prototype.diff_main = function (text1, text2, opt_checklines, opt_deadline) {
                    if (typeof opt_deadline == 'undefined') {
                        if (this.Diff_Timeout <= 0) {
                            opt_deadline = Number.MAX_VALUE;
                        }
                        else {
                            opt_deadline = (new Date).getTime() + this.Diff_Timeout * 1000;
                        }
                    }
                    var deadline = opt_deadline;
                    if (text1 == null || text2 == null) {
                        throw new Error('Null input. (diff_main)');
                    }
                    if (text1 == text2) {
                        if (text1) {
                            return [[DIFF_EQUAL, text1]];
                        }
                        return [];
                    }
                    if (typeof opt_checklines == 'undefined') {
                        opt_checklines = true;
                    }
                    var checklines = opt_checklines;
                    var commonlength = this.diff_commonPrefix(text1, text2);
                    var commonprefix = text1.substring(0, commonlength);
                    text1 = text1.substring(commonlength);
                    text2 = text2.substring(commonlength);
                    commonlength = this.diff_commonSuffix(text1, text2);
                    var commonsuffix = text1.substring(text1.length - commonlength);
                    text1 = text1.substring(0, text1.length - commonlength);
                    text2 = text2.substring(0, text2.length - commonlength);
                    var diffs = this.diff_compute_(text1, text2, checklines, deadline);
                    if (commonprefix) {
                        diffs.unshift([DIFF_EQUAL, commonprefix]);
                    }
                    if (commonsuffix) {
                        diffs.push([DIFF_EQUAL, commonsuffix]);
                    }
                    this.diff_cleanupMerge(diffs);
                    return diffs;
                };
                diff_match_patch.prototype.diff_compute_ = function (text1, text2, checklines, deadline) {
                    var diffs;
                    if (!text1) {
                        return [[DIFF_INSERT, text2]];
                    }
                    if (!text2) {
                        return [[DIFF_DELETE, text1]];
                    }
                    var longtext = text1.length > text2.length ? text1 : text2;
                    var shorttext = text1.length > text2.length ? text2 : text1;
                    var i = longtext.indexOf(shorttext);
                    if (i != -1) {
                        diffs = [[DIFF_INSERT, longtext.substring(0, i)],
                            [DIFF_EQUAL, shorttext],
                            [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
                        if (text1.length > text2.length) {
                            diffs[0][0] = diffs[2][0] = DIFF_DELETE;
                        }
                        return diffs;
                    }
                    if (shorttext.length == 1) {
                        return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
                    }
                    var hm = this.diff_halfMatch_(text1, text2);
                    if (hm) {
                        var text1_a = hm[0];
                        var text1_b = hm[1];
                        var text2_a = hm[2];
                        var text2_b = hm[3];
                        var mid_common = hm[4];
                        var diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
                        var diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
                        return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
                    }
                    if (checklines && text1.length > 100 && text2.length > 100) {
                        return this.diff_lineMode_(text1, text2, deadline);
                    }
                    return this.diff_bisect_(text1, text2, deadline);
                };
                diff_match_patch.prototype.diff_lineMode_ = function (text1, text2, deadline) {
                    var a = this.diff_linesToChars_(text1, text2);
                    text1 = a.chars1;
                    text2 = a.chars2;
                    var linearray = a.lineArray;
                    var diffs = this.diff_main(text1, text2, false, deadline);
                    this.diff_charsToLines_(diffs, linearray);
                    this.diff_cleanupSemantic(diffs);
                    diffs.push([DIFF_EQUAL, '']);
                    var pointer = 0;
                    var count_delete = 0;
                    var count_insert = 0;
                    var text_delete = '';
                    var text_insert = '';
                    while (pointer < diffs.length) {
                        switch (diffs[pointer][0]) {
                            case DIFF_INSERT:
                                count_insert++;
                                text_insert += diffs[pointer][1];
                                break;
                            case DIFF_DELETE:
                                count_delete++;
                                text_delete += diffs[pointer][1];
                                break;
                            case DIFF_EQUAL:
                                if (count_delete >= 1 && count_insert >= 1) {
                                    diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert);
                                    pointer = pointer - count_delete - count_insert;
                                    var a = this.diff_main(text_delete, text_insert, false, deadline);
                                    for (var j = a.length - 1; j >= 0; j--) {
                                        diffs.splice(pointer, 0, a[j]);
                                    }
                                    pointer = pointer + a.length;
                                }
                                count_insert = 0;
                                count_delete = 0;
                                text_delete = '';
                                text_insert = '';
                                break;
                        }
                        pointer++;
                    }
                    diffs.pop();
                    return diffs;
                };
                diff_match_patch.prototype.diff_bisect_ = function (text1, text2, deadline) {
                    var text1_length = text1.length;
                    var text2_length = text2.length;
                    var max_d = Math.ceil((text1_length + text2_length) / 2);
                    var v_offset = max_d;
                    var v_length = 2 * max_d;
                    var v1 = new Array(v_length);
                    var v2 = new Array(v_length);
                    for (var x = 0; x < v_length; x++) {
                        v1[x] = -1;
                        v2[x] = -1;
                    }
                    v1[v_offset + 1] = 0;
                    v2[v_offset + 1] = 0;
                    var delta = text1_length - text2_length;
                    var front = (delta % 2 != 0);
                    var k1start = 0;
                    var k1end = 0;
                    var k2start = 0;
                    var k2end = 0;
                    for (var d = 0; d < max_d; d++) {
                        if ((new Date()).getTime() > deadline) {
                            break;
                        }
                        for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
                            var k1_offset = v_offset + k1;
                            var x1;
                            if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
                                x1 = v1[k1_offset + 1];
                            }
                            else {
                                x1 = v1[k1_offset - 1] + 1;
                            }
                            var y1 = x1 - k1;
                            while (x1 < text1_length && y1 < text2_length &&
                                text1.charAt(x1) == text2.charAt(y1)) {
                                x1++;
                                y1++;
                            }
                            v1[k1_offset] = x1;
                            if (x1 > text1_length) {
                                k1end += 2;
                            }
                            else if (y1 > text2_length) {
                                k1start += 2;
                            }
                            else if (front) {
                                var k2_offset = v_offset + delta - k1;
                                if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
                                    var x2 = text1_length - v2[k2_offset];
                                    if (x1 >= x2) {
                                        return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                                    }
                                }
                            }
                        }
                        for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
                            var k2_offset = v_offset + k2;
                            var x2;
                            if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
                                x2 = v2[k2_offset + 1];
                            }
                            else {
                                x2 = v2[k2_offset - 1] + 1;
                            }
                            var y2 = x2 - k2;
                            while (x2 < text1_length && y2 < text2_length &&
                                text1.charAt(text1_length - x2 - 1) ==
                                    text2.charAt(text2_length - y2 - 1)) {
                                x2++;
                                y2++;
                            }
                            v2[k2_offset] = x2;
                            if (x2 > text1_length) {
                                k2end += 2;
                            }
                            else if (y2 > text2_length) {
                                k2start += 2;
                            }
                            else if (!front) {
                                var k1_offset = v_offset + delta - k2;
                                if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
                                    var x1 = v1[k1_offset];
                                    var y1 = v_offset + x1 - k1_offset;
                                    x2 = text1_length - x2;
                                    if (x1 >= x2) {
                                        return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                                    }
                                }
                            }
                        }
                    }
                    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
                };
                diff_match_patch.prototype.diff_bisectSplit_ = function (text1, text2, x, y, deadline) {
                    var text1a = text1.substring(0, x);
                    var text2a = text2.substring(0, y);
                    var text1b = text1.substring(x);
                    var text2b = text2.substring(y);
                    var diffs = this.diff_main(text1a, text2a, false, deadline);
                    var diffsb = this.diff_main(text1b, text2b, false, deadline);
                    return diffs.concat(diffsb);
                };
                diff_match_patch.prototype.diff_linesToChars_ = function (text1, text2) {
                    var lineArray = [];
                    var lineHash = {};
                    lineArray[0] = '';
                    function diff_linesToCharsMunge_(text) {
                        var chars = '';
                        var lineStart = 0;
                        var lineEnd = -1;
                        var lineArrayLength = lineArray.length;
                        while (lineEnd < text.length - 1) {
                            lineEnd = text.indexOf('\n', lineStart);
                            if (lineEnd == -1) {
                                lineEnd = text.length - 1;
                            }
                            var line = text.substring(lineStart, lineEnd + 1);
                            lineStart = lineEnd + 1;
                            if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
                                (lineHash[line] !== undefined)) {
                                chars += String.fromCharCode(lineHash[line]);
                            }
                            else {
                                chars += String.fromCharCode(lineArrayLength);
                                lineHash[line] = lineArrayLength;
                                lineArray[lineArrayLength++] = line;
                            }
                        }
                        return chars;
                    }
                    var chars1 = diff_linesToCharsMunge_(text1);
                    var chars2 = diff_linesToCharsMunge_(text2);
                    return { chars1: chars1, chars2: chars2, lineArray: lineArray };
                };
                diff_match_patch.prototype.diff_charsToLines_ = function (diffs, lineArray) {
                    for (var x = 0; x < diffs.length; x++) {
                        var chars = diffs[x][1];
                        var text = [];
                        for (var y = 0; y < chars.length; y++) {
                            text[y] = lineArray[chars.charCodeAt(y)];
                        }
                        diffs[x][1] = text.join('');
                    }
                };
                diff_match_patch.prototype.diff_commonPrefix = function (text1, text2) {
                    if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
                        return 0;
                    }
                    var pointermin = 0;
                    var pointermax = Math.min(text1.length, text2.length);
                    var pointermid = pointermax;
                    var pointerstart = 0;
                    while (pointermin < pointermid) {
                        if (text1.substring(pointerstart, pointermid) ==
                            text2.substring(pointerstart, pointermid)) {
                            pointermin = pointermid;
                            pointerstart = pointermin;
                        }
                        else {
                            pointermax = pointermid;
                        }
                        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
                    }
                    return pointermid;
                };
                diff_match_patch.prototype.diff_commonSuffix = function (text1, text2) {
                    if (!text1 || !text2 ||
                        text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
                        return 0;
                    }
                    var pointermin = 0;
                    var pointermax = Math.min(text1.length, text2.length);
                    var pointermid = pointermax;
                    var pointerend = 0;
                    while (pointermin < pointermid) {
                        if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
                            text2.substring(text2.length - pointermid, text2.length - pointerend)) {
                            pointermin = pointermid;
                            pointerend = pointermin;
                        }
                        else {
                            pointermax = pointermid;
                        }
                        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
                    }
                    return pointermid;
                };
                diff_match_patch.prototype.diff_commonOverlap_ = function (text1, text2) {
                    var text1_length = text1.length;
                    var text2_length = text2.length;
                    if (text1_length == 0 || text2_length == 0) {
                        return 0;
                    }
                    if (text1_length > text2_length) {
                        text1 = text1.substring(text1_length - text2_length);
                    }
                    else if (text1_length < text2_length) {
                        text2 = text2.substring(0, text1_length);
                    }
                    var text_length = Math.min(text1_length, text2_length);
                    if (text1 == text2) {
                        return text_length;
                    }
                    var best = 0;
                    var length = 1;
                    while (true) {
                        var pattern = text1.substring(text_length - length);
                        var found = text2.indexOf(pattern);
                        if (found == -1) {
                            return best;
                        }
                        length += found;
                        if (found == 0 || text1.substring(text_length - length) ==
                            text2.substring(0, length)) {
                            best = length;
                            length++;
                        }
                    }
                };
                diff_match_patch.prototype.diff_halfMatch_ = function (text1, text2) {
                    if (this.Diff_Timeout <= 0) {
                        return null;
                    }
                    var longtext = text1.length > text2.length ? text1 : text2;
                    var shorttext = text1.length > text2.length ? text2 : text1;
                    if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
                        return null;
                    }
                    var dmp = this;
                    function diff_halfMatchI_(longtext, shorttext, i) {
                        var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
                        var j = -1;
                        var best_common = '';
                        var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
                        while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
                            var prefixLength = dmp.diff_commonPrefix(longtext.substring(i), shorttext.substring(j));
                            var suffixLength = dmp.diff_commonSuffix(longtext.substring(0, i), shorttext.substring(0, j));
                            if (best_common.length < suffixLength + prefixLength) {
                                best_common = shorttext.substring(j - suffixLength, j) +
                                    shorttext.substring(j, j + prefixLength);
                                best_longtext_a = longtext.substring(0, i - suffixLength);
                                best_longtext_b = longtext.substring(i + prefixLength);
                                best_shorttext_a = shorttext.substring(0, j - suffixLength);
                                best_shorttext_b = shorttext.substring(j + prefixLength);
                            }
                        }
                        if (best_common.length * 2 >= longtext.length) {
                            return [best_longtext_a, best_longtext_b,
                                best_shorttext_a, best_shorttext_b, best_common];
                        }
                        else {
                            return null;
                        }
                    }
                    var hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
                    var hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
                    var hm;
                    if (!hm1 && !hm2) {
                        return null;
                    }
                    else if (!hm2) {
                        hm = hm1;
                    }
                    else if (!hm1) {
                        hm = hm2;
                    }
                    else {
                        hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
                    }
                    var text1_a, text1_b, text2_a, text2_b;
                    if (text1.length > text2.length) {
                        text1_a = hm[0];
                        text1_b = hm[1];
                        text2_a = hm[2];
                        text2_b = hm[3];
                    }
                    else {
                        text2_a = hm[0];
                        text2_b = hm[1];
                        text1_a = hm[2];
                        text1_b = hm[3];
                    }
                    var mid_common = hm[4];
                    return [text1_a, text1_b, text2_a, text2_b, mid_common];
                };
                diff_match_patch.prototype.diff_cleanupSemantic = function (diffs) {
                    var changes = false;
                    var equalities = [];
                    var equalitiesLength = 0;
                    var lastequality = null;
                    var pointer = 0;
                    var length_insertions1 = 0;
                    var length_deletions1 = 0;
                    var length_insertions2 = 0;
                    var length_deletions2 = 0;
                    while (pointer < diffs.length) {
                        if (diffs[pointer][0] == DIFF_EQUAL) {
                            equalities[equalitiesLength++] = pointer;
                            length_insertions1 = length_insertions2;
                            length_deletions1 = length_deletions2;
                            length_insertions2 = 0;
                            length_deletions2 = 0;
                            lastequality = diffs[pointer][1];
                        }
                        else {
                            if (diffs[pointer][0] == DIFF_INSERT) {
                                length_insertions2 += diffs[pointer][1].length;
                            }
                            else {
                                length_deletions2 += diffs[pointer][1].length;
                            }
                            if (lastequality && (lastequality.length <=
                                Math.max(length_insertions1, length_deletions1)) &&
                                (lastequality.length <= Math.max(length_insertions2, length_deletions2))) {
                                diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);
                                diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                                equalitiesLength--;
                                equalitiesLength--;
                                pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
                                length_insertions1 = 0;
                                length_deletions1 = 0;
                                length_insertions2 = 0;
                                length_deletions2 = 0;
                                lastequality = null;
                                changes = true;
                            }
                        }
                        pointer++;
                    }
                    if (changes) {
                        this.diff_cleanupMerge(diffs);
                    }
                    this.diff_cleanupSemanticLossless(diffs);
                    pointer = 1;
                    while (pointer < diffs.length) {
                        if (diffs[pointer - 1][0] == DIFF_DELETE &&
                            diffs[pointer][0] == DIFF_INSERT) {
                            var deletion = diffs[pointer - 1][1];
                            var insertion = diffs[pointer][1];
                            var overlap_length1 = this.diff_commonOverlap_(deletion, insertion);
                            var overlap_length2 = this.diff_commonOverlap_(insertion, deletion);
                            if (overlap_length1 >= overlap_length2) {
                                if (overlap_length1 >= deletion.length / 2 ||
                                    overlap_length1 >= insertion.length / 2) {
                                    diffs.splice(pointer, 0, [DIFF_EQUAL, insertion.substring(0, overlap_length1)]);
                                    diffs[pointer - 1][1] =
                                        deletion.substring(0, deletion.length - overlap_length1);
                                    diffs[pointer + 1][1] = insertion.substring(overlap_length1);
                                    pointer++;
                                }
                            }
                            else {
                                if (overlap_length2 >= deletion.length / 2 ||
                                    overlap_length2 >= insertion.length / 2) {
                                    diffs.splice(pointer, 0, [DIFF_EQUAL, deletion.substring(0, overlap_length2)]);
                                    diffs[pointer - 1][0] = DIFF_INSERT;
                                    diffs[pointer - 1][1] =
                                        insertion.substring(0, insertion.length - overlap_length2);
                                    diffs[pointer + 1][0] = DIFF_DELETE;
                                    diffs[pointer + 1][1] =
                                        deletion.substring(overlap_length2);
                                    pointer++;
                                }
                            }
                            pointer++;
                        }
                        pointer++;
                    }
                };
                diff_match_patch.prototype.diff_cleanupSemanticLossless = function (diffs) {
                    function diff_cleanupSemanticScore_(one, two) {
                        if (!one || !two) {
                            return 6;
                        }
                        var char1 = one.charAt(one.length - 1);
                        var char2 = two.charAt(0);
                        var nonAlphaNumeric1 = char1.match(diff_match_patch.nonAlphaNumericRegex_);
                        var nonAlphaNumeric2 = char2.match(diff_match_patch.nonAlphaNumericRegex_);
                        var whitespace1 = nonAlphaNumeric1 &&
                            char1.match(diff_match_patch.whitespaceRegex_);
                        var whitespace2 = nonAlphaNumeric2 &&
                            char2.match(diff_match_patch.whitespaceRegex_);
                        var lineBreak1 = whitespace1 &&
                            char1.match(diff_match_patch.linebreakRegex_);
                        var lineBreak2 = whitespace2 &&
                            char2.match(diff_match_patch.linebreakRegex_);
                        var blankLine1 = lineBreak1 &&
                            one.match(diff_match_patch.blanklineEndRegex_);
                        var blankLine2 = lineBreak2 &&
                            two.match(diff_match_patch.blanklineStartRegex_);
                        if (blankLine1 || blankLine2) {
                            return 5;
                        }
                        else if (lineBreak1 || lineBreak2) {
                            return 4;
                        }
                        else if (nonAlphaNumeric1 && !whitespace1 && whitespace2) {
                            return 3;
                        }
                        else if (whitespace1 || whitespace2) {
                            return 2;
                        }
                        else if (nonAlphaNumeric1 || nonAlphaNumeric2) {
                            return 1;
                        }
                        return 0;
                    }
                    var pointer = 1;
                    while (pointer < diffs.length - 1) {
                        if (diffs[pointer - 1][0] == DIFF_EQUAL &&
                            diffs[pointer + 1][0] == DIFF_EQUAL) {
                            var equality1 = diffs[pointer - 1][1];
                            var edit = diffs[pointer][1];
                            var equality2 = diffs[pointer + 1][1];
                            var commonOffset = this.diff_commonSuffix(equality1, edit);
                            if (commonOffset) {
                                var commonString = edit.substring(edit.length - commonOffset);
                                equality1 = equality1.substring(0, equality1.length - commonOffset);
                                edit = commonString + edit.substring(0, edit.length - commonOffset);
                                equality2 = commonString + equality2;
                            }
                            var bestEquality1 = equality1;
                            var bestEdit = edit;
                            var bestEquality2 = equality2;
                            var bestScore = diff_cleanupSemanticScore_(equality1, edit) +
                                diff_cleanupSemanticScore_(edit, equality2);
                            while (edit.charAt(0) === equality2.charAt(0)) {
                                equality1 += edit.charAt(0);
                                edit = edit.substring(1) + equality2.charAt(0);
                                equality2 = equality2.substring(1);
                                var score = diff_cleanupSemanticScore_(equality1, edit) +
                                    diff_cleanupSemanticScore_(edit, equality2);
                                if (score >= bestScore) {
                                    bestScore = score;
                                    bestEquality1 = equality1;
                                    bestEdit = edit;
                                    bestEquality2 = equality2;
                                }
                            }
                            if (diffs[pointer - 1][1] != bestEquality1) {
                                if (bestEquality1) {
                                    diffs[pointer - 1][1] = bestEquality1;
                                }
                                else {
                                    diffs.splice(pointer - 1, 1);
                                    pointer--;
                                }
                                diffs[pointer][1] = bestEdit;
                                if (bestEquality2) {
                                    diffs[pointer + 1][1] = bestEquality2;
                                }
                                else {
                                    diffs.splice(pointer + 1, 1);
                                    pointer--;
                                }
                            }
                        }
                        pointer++;
                    }
                };
                diff_match_patch.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/;
                diff_match_patch.whitespaceRegex_ = /\s/;
                diff_match_patch.linebreakRegex_ = /[\r\n]/;
                diff_match_patch.blanklineEndRegex_ = /\n\r?\n$/;
                diff_match_patch.blanklineStartRegex_ = /^\r?\n\r?\n/;
                diff_match_patch.prototype.diff_cleanupEfficiency = function (diffs) {
                    var changes = false;
                    var equalities = [];
                    var equalitiesLength = 0;
                    var lastequality = null;
                    var pointer = 0;
                    var pre_ins = false;
                    var pre_del = false;
                    var post_ins = false;
                    var post_del = false;
                    while (pointer < diffs.length) {
                        if (diffs[pointer][0] == DIFF_EQUAL) {
                            if (diffs[pointer][1].length < this.Diff_EditCost &&
                                (post_ins || post_del)) {
                                equalities[equalitiesLength++] = pointer;
                                pre_ins = post_ins;
                                pre_del = post_del;
                                lastequality = diffs[pointer][1];
                            }
                            else {
                                equalitiesLength = 0;
                                lastequality = null;
                            }
                            post_ins = post_del = false;
                        }
                        else {
                            if (diffs[pointer][0] == DIFF_DELETE) {
                                post_del = true;
                            }
                            else {
                                post_ins = true;
                            }
                            if (lastequality && ((pre_ins && pre_del && post_ins && post_del) ||
                                ((lastequality.length < this.Diff_EditCost / 2) &&
                                    (pre_ins + pre_del + post_ins + post_del) == 3))) {
                                diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);
                                diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
                                equalitiesLength--;
                                lastequality = null;
                                if (pre_ins && pre_del) {
                                    post_ins = post_del = true;
                                    equalitiesLength = 0;
                                }
                                else {
                                    equalitiesLength--;
                                    pointer = equalitiesLength > 0 ?
                                        equalities[equalitiesLength - 1] : -1;
                                    post_ins = post_del = false;
                                }
                                changes = true;
                            }
                        }
                        pointer++;
                    }
                    if (changes) {
                        this.diff_cleanupMerge(diffs);
                    }
                };
                diff_match_patch.prototype.diff_cleanupMerge = function (diffs) {
                    diffs.push([DIFF_EQUAL, '']);
                    var pointer = 0;
                    var count_delete = 0;
                    var count_insert = 0;
                    var text_delete = '';
                    var text_insert = '';
                    var commonlength;
                    while (pointer < diffs.length) {
                        switch (diffs[pointer][0]) {
                            case DIFF_INSERT:
                                count_insert++;
                                text_insert += diffs[pointer][1];
                                pointer++;
                                break;
                            case DIFF_DELETE:
                                count_delete++;
                                text_delete += diffs[pointer][1];
                                pointer++;
                                break;
                            case DIFF_EQUAL:
                                if (count_delete + count_insert > 1) {
                                    if (count_delete !== 0 && count_insert !== 0) {
                                        commonlength = this.diff_commonPrefix(text_insert, text_delete);
                                        if (commonlength !== 0) {
                                            if ((pointer - count_delete - count_insert) > 0 &&
                                                diffs[pointer - count_delete - count_insert - 1][0] ==
                                                    DIFF_EQUAL) {
                                                diffs[pointer - count_delete - count_insert - 1][1] +=
                                                    text_insert.substring(0, commonlength);
                                            }
                                            else {
                                                diffs.splice(0, 0, [DIFF_EQUAL,
                                                    text_insert.substring(0, commonlength)]);
                                                pointer++;
                                            }
                                            text_insert = text_insert.substring(commonlength);
                                            text_delete = text_delete.substring(commonlength);
                                        }
                                        commonlength = this.diff_commonSuffix(text_insert, text_delete);
                                        if (commonlength !== 0) {
                                            diffs[pointer][1] = text_insert.substring(text_insert.length -
                                                commonlength) + diffs[pointer][1];
                                            text_insert = text_insert.substring(0, text_insert.length -
                                                commonlength);
                                            text_delete = text_delete.substring(0, text_delete.length -
                                                commonlength);
                                        }
                                    }
                                    if (count_delete === 0) {
                                        diffs.splice(pointer - count_insert, count_delete + count_insert, [DIFF_INSERT, text_insert]);
                                    }
                                    else if (count_insert === 0) {
                                        diffs.splice(pointer - count_delete, count_delete + count_insert, [DIFF_DELETE, text_delete]);
                                    }
                                    else {
                                        diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert, [DIFF_DELETE, text_delete], [DIFF_INSERT, text_insert]);
                                    }
                                    pointer = pointer - count_delete - count_insert +
                                        (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
                                }
                                else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
                                    diffs[pointer - 1][1] += diffs[pointer][1];
                                    diffs.splice(pointer, 1);
                                }
                                else {
                                    pointer++;
                                }
                                count_insert = 0;
                                count_delete = 0;
                                text_delete = '';
                                text_insert = '';
                                break;
                        }
                    }
                    if (diffs[diffs.length - 1][1] === '') {
                        diffs.pop();
                    }
                    var changes = false;
                    pointer = 1;
                    while (pointer < diffs.length - 1) {
                        if (diffs[pointer - 1][0] == DIFF_EQUAL &&
                            diffs[pointer + 1][0] == DIFF_EQUAL) {
                            if (diffs[pointer][1].substring(diffs[pointer][1].length -
                                diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
                                diffs[pointer][1] = diffs[pointer - 1][1] +
                                    diffs[pointer][1].substring(0, diffs[pointer][1].length -
                                        diffs[pointer - 1][1].length);
                                diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
                                diffs.splice(pointer - 1, 1);
                                changes = true;
                            }
                            else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
                                diffs[pointer + 1][1]) {
                                diffs[pointer - 1][1] += diffs[pointer + 1][1];
                                diffs[pointer][1] =
                                    diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
                                        diffs[pointer + 1][1];
                                diffs.splice(pointer + 1, 1);
                                changes = true;
                            }
                        }
                        pointer++;
                    }
                    if (changes) {
                        this.diff_cleanupMerge(diffs);
                    }
                };
                diff_match_patch.prototype.diff_xIndex = function (diffs, loc) {
                    var chars1 = 0;
                    var chars2 = 0;
                    var last_chars1 = 0;
                    var last_chars2 = 0;
                    var x;
                    for (x = 0; x < diffs.length; x++) {
                        if (diffs[x][0] !== DIFF_INSERT) {
                            chars1 += diffs[x][1].length;
                        }
                        if (diffs[x][0] !== DIFF_DELETE) {
                            chars2 += diffs[x][1].length;
                        }
                        if (chars1 > loc) {
                            break;
                        }
                        last_chars1 = chars1;
                        last_chars2 = chars2;
                    }
                    if (diffs.length != x && diffs[x][0] === DIFF_DELETE) {
                        return last_chars2;
                    }
                    return last_chars2 + (loc - last_chars1);
                };
                diff_match_patch.prototype.diff_prettyHtml = function (diffs) {
                    var html = [];
                    var pattern_amp = /&/g;
                    var pattern_lt = /</g;
                    var pattern_gt = />/g;
                    var pattern_para = /\n/g;
                    for (var x = 0; x < diffs.length; x++) {
                        var op = diffs[x][0];
                        var data = diffs[x][1];
                        var text = data.replace(pattern_amp, '&amp;').replace(pattern_lt, '&lt;')
                            .replace(pattern_gt, '&gt;').replace(pattern_para, '&para;<br>');
                        switch (op) {
                            case DIFF_INSERT:
                                html[x] = '<ins style="background:#e6ffe6;">' + text + '</ins>';
                                break;
                            case DIFF_DELETE:
                                html[x] = '<del style="background:#ffe6e6;">' + text + '</del>';
                                break;
                            case DIFF_EQUAL:
                                html[x] = '<span>' + text + '</span>';
                                break;
                        }
                    }
                    return html.join('');
                };
                diff_match_patch.prototype.diff_text1 = function (diffs) {
                    var text = [];
                    for (var x = 0; x < diffs.length; x++) {
                        if (diffs[x][0] !== DIFF_INSERT) {
                            text[x] = diffs[x][1];
                        }
                    }
                    return text.join('');
                };
                diff_match_patch.prototype.diff_text2 = function (diffs) {
                    var text = [];
                    for (var x = 0; x < diffs.length; x++) {
                        if (diffs[x][0] !== DIFF_DELETE) {
                            text[x] = diffs[x][1];
                        }
                    }
                    return text.join('');
                };
                diff_match_patch.prototype.diff_levenshtein = function (diffs) {
                    var levenshtein = 0;
                    var insertions = 0;
                    var deletions = 0;
                    for (var x = 0; x < diffs.length; x++) {
                        var op = diffs[x][0];
                        var data = diffs[x][1];
                        switch (op) {
                            case DIFF_INSERT:
                                insertions += data.length;
                                break;
                            case DIFF_DELETE:
                                deletions += data.length;
                                break;
                            case DIFF_EQUAL:
                                levenshtein += Math.max(insertions, deletions);
                                insertions = 0;
                                deletions = 0;
                                break;
                        }
                    }
                    levenshtein += Math.max(insertions, deletions);
                    return levenshtein;
                };
                diff_match_patch.prototype.diff_toDelta = function (diffs) {
                    var text = [];
                    for (var x = 0; x < diffs.length; x++) {
                        switch (diffs[x][0]) {
                            case DIFF_INSERT:
                                text[x] = '+' + encodeURI(diffs[x][1]);
                                break;
                            case DIFF_DELETE:
                                text[x] = '-' + diffs[x][1].length;
                                break;
                            case DIFF_EQUAL:
                                text[x] = '=' + diffs[x][1].length;
                                break;
                        }
                    }
                    return text.join('\t').replace(/%20/g, ' ');
                };
                diff_match_patch.prototype.diff_fromDelta = function (text1, delta) {
                    var diffs = [];
                    var diffsLength = 0;
                    var pointer = 0;
                    var tokens = delta.split(/\t/g);
                    for (var x = 0; x < tokens.length; x++) {
                        var param = tokens[x].substring(1);
                        switch (tokens[x].charAt(0)) {
                            case '+':
                                try {
                                    diffs[diffsLength++] = [DIFF_INSERT, decodeURI(param)];
                                }
                                catch (ex) {
                                    throw new Error('Illegal escape in diff_fromDelta: ' + param);
                                }
                                break;
                            case '-':
                            case '=':
                                var n = parseInt(param, 10);
                                if (isNaN(n) || n < 0) {
                                    throw new Error('Invalid number in diff_fromDelta: ' + param);
                                }
                                var text = text1.substring(pointer, pointer += n);
                                if (tokens[x].charAt(0) == '=') {
                                    diffs[diffsLength++] = [DIFF_EQUAL, text];
                                }
                                else {
                                    diffs[diffsLength++] = [DIFF_DELETE, text];
                                }
                                break;
                            default:
                                if (tokens[x]) {
                                    throw new Error('Invalid diff operation in diff_fromDelta: ' +
                                        tokens[x]);
                                }
                        }
                    }
                    if (pointer != text1.length) {
                        throw new Error('Delta length (' + pointer +
                            ') does not equal source text length (' + text1.length + ').');
                    }
                    return diffs;
                };
                diff_match_patch.prototype.match_main = function (text, pattern, loc) {
                    if (text == null || pattern == null || loc == null) {
                        throw new Error('Null input. (match_main)');
                    }
                    loc = Math.max(0, Math.min(loc, text.length));
                    if (text == pattern) {
                        return 0;
                    }
                    else if (!text.length) {
                        return -1;
                    }
                    else if (text.substring(loc, loc + pattern.length) == pattern) {
                        return loc;
                    }
                    else {
                        return this.match_bitap_(text, pattern, loc);
                    }
                };
                diff_match_patch.prototype.match_bitap_ = function (text, pattern, loc) {
                    if (pattern.length > this.Match_MaxBits) {
                        throw new Error('Pattern too long for this browser.');
                    }
                    var s = this.match_alphabet_(pattern);
                    var dmp = this;
                    function match_bitapScore_(e, x) {
                        var accuracy = e / pattern.length;
                        var proximity = Math.abs(loc - x);
                        if (!dmp.Match_Distance) {
                            return proximity ? 1.0 : accuracy;
                        }
                        return accuracy + (proximity / dmp.Match_Distance);
                    }
                    var score_threshold = this.Match_Threshold;
                    var best_loc = text.indexOf(pattern, loc);
                    if (best_loc != -1) {
                        score_threshold = Math.min(match_bitapScore_(0, best_loc), score_threshold);
                        best_loc = text.lastIndexOf(pattern, loc + pattern.length);
                        if (best_loc != -1) {
                            score_threshold =
                                Math.min(match_bitapScore_(0, best_loc), score_threshold);
                        }
                    }
                    var matchmask = 1 << (pattern.length - 1);
                    best_loc = -1;
                    var bin_min, bin_mid;
                    var bin_max = pattern.length + text.length;
                    var last_rd;
                    for (var d = 0; d < pattern.length; d++) {
                        bin_min = 0;
                        bin_mid = bin_max;
                        while (bin_min < bin_mid) {
                            if (match_bitapScore_(d, loc + bin_mid) <= score_threshold) {
                                bin_min = bin_mid;
                            }
                            else {
                                bin_max = bin_mid;
                            }
                            bin_mid = Math.floor((bin_max - bin_min) / 2 + bin_min);
                        }
                        bin_max = bin_mid;
                        var start = Math.max(1, loc - bin_mid + 1);
                        var finish = Math.min(loc + bin_mid, text.length) + pattern.length;
                        var rd = Array(finish + 2);
                        rd[finish + 1] = (1 << d) - 1;
                        for (var j = finish; j >= start; j--) {
                            var charMatch = s[text.charAt(j - 1)];
                            if (d === 0) {
                                rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
                            }
                            else {
                                rd[j] = (((rd[j + 1] << 1) | 1) & charMatch) |
                                    (((last_rd[j + 1] | last_rd[j]) << 1) | 1) |
                                    last_rd[j + 1];
                            }
                            if (rd[j] & matchmask) {
                                var score = match_bitapScore_(d, j - 1);
                                if (score <= score_threshold) {
                                    score_threshold = score;
                                    best_loc = j - 1;
                                    if (best_loc > loc) {
                                        start = Math.max(1, 2 * loc - best_loc);
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                        }
                        if (match_bitapScore_(d + 1, loc) > score_threshold) {
                            break;
                        }
                        last_rd = rd;
                    }
                    return best_loc;
                };
                diff_match_patch.prototype.match_alphabet_ = function (pattern) {
                    var s = {};
                    for (var i = 0; i < pattern.length; i++) {
                        s[pattern.charAt(i)] = 0;
                    }
                    for (var i = 0; i < pattern.length; i++) {
                        s[pattern.charAt(i)] |= 1 << (pattern.length - i - 1);
                    }
                    return s;
                };
                diff_match_patch.prototype.patch_addContext_ = function (patch, text) {
                    if (text.length == 0) {
                        return;
                    }
                    var pattern = text.substring(patch.start2, patch.start2 + patch.length1);
                    var padding = 0;
                    while (text.indexOf(pattern) != text.lastIndexOf(pattern) &&
                        pattern.length < this.Match_MaxBits - this.Patch_Margin -
                            this.Patch_Margin) {
                        padding += this.Patch_Margin;
                        pattern = text.substring(patch.start2 - padding, patch.start2 + patch.length1 + padding);
                    }
                    padding += this.Patch_Margin;
                    var prefix = text.substring(patch.start2 - padding, patch.start2);
                    if (prefix) {
                        patch.diffs.unshift([DIFF_EQUAL, prefix]);
                    }
                    var suffix = text.substring(patch.start2 + patch.length1, patch.start2 + patch.length1 + padding);
                    if (suffix) {
                        patch.diffs.push([DIFF_EQUAL, suffix]);
                    }
                    patch.start1 -= prefix.length;
                    patch.start2 -= prefix.length;
                    patch.length1 += prefix.length + suffix.length;
                    patch.length2 += prefix.length + suffix.length;
                };
                diff_match_patch.prototype.patch_make = function (a, opt_b, opt_c) {
                    var text1, diffs;
                    if (typeof a == 'string' && typeof opt_b == 'string' &&
                        typeof opt_c == 'undefined') {
                        text1 = (a);
                        diffs = this.diff_main(text1, (opt_b), true);
                        if (diffs.length > 2) {
                            this.diff_cleanupSemantic(diffs);
                            this.diff_cleanupEfficiency(diffs);
                        }
                    }
                    else if (a && typeof a == 'object' && typeof opt_b == 'undefined' &&
                        typeof opt_c == 'undefined') {
                        diffs = (a);
                        text1 = this.diff_text1(diffs);
                    }
                    else if (typeof a == 'string' && opt_b && typeof opt_b == 'object' &&
                        typeof opt_c == 'undefined') {
                        text1 = (a);
                        diffs = (opt_b);
                    }
                    else if (typeof a == 'string' && typeof opt_b == 'string' &&
                        opt_c && typeof opt_c == 'object') {
                        text1 = (a);
                        diffs = (opt_c);
                    }
                    else {
                        throw new Error('Unknown call format to patch_make.');
                    }
                    if (diffs.length === 0) {
                        return [];
                    }
                    var patches = [];
                    var patch = new diff_match_patch.patch_obj();
                    var patchDiffLength = 0;
                    var char_count1 = 0;
                    var char_count2 = 0;
                    var prepatch_text = text1;
                    var postpatch_text = text1;
                    for (var x = 0; x < diffs.length; x++) {
                        var diff_type = diffs[x][0];
                        var diff_text = diffs[x][1];
                        if (!patchDiffLength && diff_type !== DIFF_EQUAL) {
                            patch.start1 = char_count1;
                            patch.start2 = char_count2;
                        }
                        switch (diff_type) {
                            case DIFF_INSERT:
                                patch.diffs[patchDiffLength++] = diffs[x];
                                patch.length2 += diff_text.length;
                                postpatch_text = postpatch_text.substring(0, char_count2) + diff_text +
                                    postpatch_text.substring(char_count2);
                                break;
                            case DIFF_DELETE:
                                patch.length1 += diff_text.length;
                                patch.diffs[patchDiffLength++] = diffs[x];
                                postpatch_text = postpatch_text.substring(0, char_count2) +
                                    postpatch_text.substring(char_count2 +
                                        diff_text.length);
                                break;
                            case DIFF_EQUAL:
                                if (diff_text.length <= 2 * this.Patch_Margin &&
                                    patchDiffLength && diffs.length != x + 1) {
                                    patch.diffs[patchDiffLength++] = diffs[x];
                                    patch.length1 += diff_text.length;
                                    patch.length2 += diff_text.length;
                                }
                                else if (diff_text.length >= 2 * this.Patch_Margin) {
                                    if (patchDiffLength) {
                                        this.patch_addContext_(patch, prepatch_text);
                                        patches.push(patch);
                                        patch = new diff_match_patch.patch_obj();
                                        patchDiffLength = 0;
                                        prepatch_text = postpatch_text;
                                        char_count1 = char_count2;
                                    }
                                }
                                break;
                        }
                        if (diff_type !== DIFF_INSERT) {
                            char_count1 += diff_text.length;
                        }
                        if (diff_type !== DIFF_DELETE) {
                            char_count2 += diff_text.length;
                        }
                    }
                    if (patchDiffLength) {
                        this.patch_addContext_(patch, prepatch_text);
                        patches.push(patch);
                    }
                    return patches;
                };
                diff_match_patch.prototype.patch_deepCopy = function (patches) {
                    var patchesCopy = [];
                    for (var x = 0; x < patches.length; x++) {
                        var patch = patches[x];
                        var patchCopy = new diff_match_patch.patch_obj();
                        patchCopy.diffs = [];
                        for (var y = 0; y < patch.diffs.length; y++) {
                            patchCopy.diffs[y] = patch.diffs[y].slice();
                        }
                        patchCopy.start1 = patch.start1;
                        patchCopy.start2 = patch.start2;
                        patchCopy.length1 = patch.length1;
                        patchCopy.length2 = patch.length2;
                        patchesCopy[x] = patchCopy;
                    }
                    return patchesCopy;
                };
                diff_match_patch.prototype.patch_apply = function (patches, text) {
                    if (patches.length == 0) {
                        return [text, []];
                    }
                    patches = this.patch_deepCopy(patches);
                    var nullPadding = this.patch_addPadding(patches);
                    text = nullPadding + text + nullPadding;
                    this.patch_splitMax(patches);
                    var delta = 0;
                    var results = [];
                    for (var x = 0; x < patches.length; x++) {
                        var expected_loc = patches[x].start2 + delta;
                        var text1 = this.diff_text1(patches[x].diffs);
                        var start_loc;
                        var end_loc = -1;
                        if (text1.length > this.Match_MaxBits) {
                            start_loc = this.match_main(text, text1.substring(0, this.Match_MaxBits), expected_loc);
                            if (start_loc != -1) {
                                end_loc = this.match_main(text, text1.substring(text1.length - this.Match_MaxBits), expected_loc + text1.length - this.Match_MaxBits);
                                if (end_loc == -1 || start_loc >= end_loc) {
                                    start_loc = -1;
                                }
                            }
                        }
                        else {
                            start_loc = this.match_main(text, text1, expected_loc);
                        }
                        if (start_loc == -1) {
                            results[x] = false;
                            delta -= patches[x].length2 - patches[x].length1;
                        }
                        else {
                            results[x] = true;
                            delta = start_loc - expected_loc;
                            var text2;
                            if (end_loc == -1) {
                                text2 = text.substring(start_loc, start_loc + text1.length);
                            }
                            else {
                                text2 = text.substring(start_loc, end_loc + this.Match_MaxBits);
                            }
                            if (text1 == text2) {
                                text = text.substring(0, start_loc) +
                                    this.diff_text2(patches[x].diffs) +
                                    text.substring(start_loc + text1.length);
                            }
                            else {
                                var diffs = this.diff_main(text1, text2, false);
                                if (text1.length > this.Match_MaxBits &&
                                    this.diff_levenshtein(diffs) / text1.length >
                                        this.Patch_DeleteThreshold) {
                                    results[x] = false;
                                }
                                else {
                                    this.diff_cleanupSemanticLossless(diffs);
                                    var index1 = 0;
                                    var index2;
                                    for (var y = 0; y < patches[x].diffs.length; y++) {
                                        var mod = patches[x].diffs[y];
                                        if (mod[0] !== DIFF_EQUAL) {
                                            index2 = this.diff_xIndex(diffs, index1);
                                        }
                                        if (mod[0] === DIFF_INSERT) {
                                            text = text.substring(0, start_loc + index2) + mod[1] +
                                                text.substring(start_loc + index2);
                                        }
                                        else if (mod[0] === DIFF_DELETE) {
                                            text = text.substring(0, start_loc + index2) +
                                                text.substring(start_loc + this.diff_xIndex(diffs, index1 + mod[1].length));
                                        }
                                        if (mod[0] !== DIFF_DELETE) {
                                            index1 += mod[1].length;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    text = text.substring(nullPadding.length, text.length - nullPadding.length);
                    return [text, results];
                };
                diff_match_patch.prototype.patch_addPadding = function (patches) {
                    var paddingLength = this.Patch_Margin;
                    var nullPadding = '';
                    for (var x = 1; x <= paddingLength; x++) {
                        nullPadding += String.fromCharCode(x);
                    }
                    for (var x = 0; x < patches.length; x++) {
                        patches[x].start1 += paddingLength;
                        patches[x].start2 += paddingLength;
                    }
                    var patch = patches[0];
                    var diffs = patch.diffs;
                    if (diffs.length == 0 || diffs[0][0] != DIFF_EQUAL) {
                        diffs.unshift([DIFF_EQUAL, nullPadding]);
                        patch.start1 -= paddingLength;
                        patch.start2 -= paddingLength;
                        patch.length1 += paddingLength;
                        patch.length2 += paddingLength;
                    }
                    else if (paddingLength > diffs[0][1].length) {
                        var extraLength = paddingLength - diffs[0][1].length;
                        diffs[0][1] = nullPadding.substring(diffs[0][1].length) + diffs[0][1];
                        patch.start1 -= extraLength;
                        patch.start2 -= extraLength;
                        patch.length1 += extraLength;
                        patch.length2 += extraLength;
                    }
                    patch = patches[patches.length - 1];
                    diffs = patch.diffs;
                    if (diffs.length == 0 || diffs[diffs.length - 1][0] != DIFF_EQUAL) {
                        diffs.push([DIFF_EQUAL, nullPadding]);
                        patch.length1 += paddingLength;
                        patch.length2 += paddingLength;
                    }
                    else if (paddingLength > diffs[diffs.length - 1][1].length) {
                        var extraLength = paddingLength - diffs[diffs.length - 1][1].length;
                        diffs[diffs.length - 1][1] += nullPadding.substring(0, extraLength);
                        patch.length1 += extraLength;
                        patch.length2 += extraLength;
                    }
                    return nullPadding;
                };
                diff_match_patch.prototype.patch_splitMax = function (patches) {
                    var patch_size = this.Match_MaxBits;
                    for (var x = 0; x < patches.length; x++) {
                        if (patches[x].length1 <= patch_size) {
                            continue;
                        }
                        var bigpatch = patches[x];
                        patches.splice(x--, 1);
                        var start1 = bigpatch.start1;
                        var start2 = bigpatch.start2;
                        var precontext = '';
                        while (bigpatch.diffs.length !== 0) {
                            var patch = new diff_match_patch.patch_obj();
                            var empty = true;
                            patch.start1 = start1 - precontext.length;
                            patch.start2 = start2 - precontext.length;
                            if (precontext !== '') {
                                patch.length1 = patch.length2 = precontext.length;
                                patch.diffs.push([DIFF_EQUAL, precontext]);
                            }
                            while (bigpatch.diffs.length !== 0 &&
                                patch.length1 < patch_size - this.Patch_Margin) {
                                var diff_type = bigpatch.diffs[0][0];
                                var diff_text = bigpatch.diffs[0][1];
                                if (diff_type === DIFF_INSERT) {
                                    patch.length2 += diff_text.length;
                                    start2 += diff_text.length;
                                    patch.diffs.push(bigpatch.diffs.shift());
                                    empty = false;
                                }
                                else if (diff_type === DIFF_DELETE && patch.diffs.length == 1 &&
                                    patch.diffs[0][0] == DIFF_EQUAL &&
                                    diff_text.length > 2 * patch_size) {
                                    patch.length1 += diff_text.length;
                                    start1 += diff_text.length;
                                    empty = false;
                                    patch.diffs.push([diff_type, diff_text]);
                                    bigpatch.diffs.shift();
                                }
                                else {
                                    diff_text = diff_text.substring(0, patch_size - patch.length1 - this.Patch_Margin);
                                    patch.length1 += diff_text.length;
                                    start1 += diff_text.length;
                                    if (diff_type === DIFF_EQUAL) {
                                        patch.length2 += diff_text.length;
                                        start2 += diff_text.length;
                                    }
                                    else {
                                        empty = false;
                                    }
                                    patch.diffs.push([diff_type, diff_text]);
                                    if (diff_text == bigpatch.diffs[0][1]) {
                                        bigpatch.diffs.shift();
                                    }
                                    else {
                                        bigpatch.diffs[0][1] =
                                            bigpatch.diffs[0][1].substring(diff_text.length);
                                    }
                                }
                            }
                            precontext = this.diff_text2(patch.diffs);
                            precontext =
                                precontext.substring(precontext.length - this.Patch_Margin);
                            var postcontext = this.diff_text1(bigpatch.diffs)
                                .substring(0, this.Patch_Margin);
                            if (postcontext !== '') {
                                patch.length1 += postcontext.length;
                                patch.length2 += postcontext.length;
                                if (patch.diffs.length !== 0 &&
                                    patch.diffs[patch.diffs.length - 1][0] === DIFF_EQUAL) {
                                    patch.diffs[patch.diffs.length - 1][1] += postcontext;
                                }
                                else {
                                    patch.diffs.push([DIFF_EQUAL, postcontext]);
                                }
                            }
                            if (!empty) {
                                patches.splice(++x, 0, patch);
                            }
                        }
                    }
                };
                diff_match_patch.prototype.patch_toText = function (patches) {
                    var text = [];
                    for (var x = 0; x < patches.length; x++) {
                        text[x] = patches[x];
                    }
                    return text.join('');
                };
                diff_match_patch.prototype.patch_fromText = function (textline) {
                    var patches = [];
                    if (!textline) {
                        return patches;
                    }
                    var text = textline.split('\n');
                    var textPointer = 0;
                    var patchHeader = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/;
                    while (textPointer < text.length) {
                        var m = text[textPointer].match(patchHeader);
                        if (!m) {
                            throw new Error('Invalid patch string: ' + text[textPointer]);
                        }
                        var patch = new diff_match_patch.patch_obj();
                        patches.push(patch);
                        patch.start1 = parseInt(m[1], 10);
                        if (m[2] === '') {
                            patch.start1--;
                            patch.length1 = 1;
                        }
                        else if (m[2] == '0') {
                            patch.length1 = 0;
                        }
                        else {
                            patch.start1--;
                            patch.length1 = parseInt(m[2], 10);
                        }
                        patch.start2 = parseInt(m[3], 10);
                        if (m[4] === '') {
                            patch.start2--;
                            patch.length2 = 1;
                        }
                        else if (m[4] == '0') {
                            patch.length2 = 0;
                        }
                        else {
                            patch.start2--;
                            patch.length2 = parseInt(m[4], 10);
                        }
                        textPointer++;
                        while (textPointer < text.length) {
                            var sign = text[textPointer].charAt(0);
                            try {
                                var line = decodeURI(text[textPointer].substring(1));
                            }
                            catch (ex) {
                                throw new Error('Illegal escape in patch_fromText: ' + line);
                            }
                            if (sign == '-') {
                                patch.diffs.push([DIFF_DELETE, line]);
                            }
                            else if (sign == '+') {
                                patch.diffs.push([DIFF_INSERT, line]);
                            }
                            else if (sign == ' ') {
                                patch.diffs.push([DIFF_EQUAL, line]);
                            }
                            else if (sign == '@') {
                                break;
                            }
                            else if (sign === '') {
                            }
                            else {
                                throw new Error('Invalid patch mode "' + sign + '" in: ' + line);
                            }
                            textPointer++;
                        }
                    }
                    return patches;
                };
                diff_match_patch.patch_obj = function () {
                    this.diffs = [];
                    this.start1 = null;
                    this.start2 = null;
                    this.length1 = 0;
                    this.length2 = 0;
                };
                diff_match_patch.patch_obj.prototype.toString = function () {
                    var coords1, coords2;
                    if (this.length1 === 0) {
                        coords1 = this.start1 + ',0';
                    }
                    else if (this.length1 == 1) {
                        coords1 = this.start1 + 1;
                    }
                    else {
                        coords1 = (this.start1 + 1) + ',' + this.length1;
                    }
                    if (this.length2 === 0) {
                        coords2 = this.start2 + ',0';
                    }
                    else if (this.length2 == 1) {
                        coords2 = this.start2 + 1;
                    }
                    else {
                        coords2 = (this.start2 + 1) + ',' + this.length2;
                    }
                    var text = ['@@ -' + coords1 + ' +' + coords2 + ' @@\n'];
                    var op;
                    for (var x = 0; x < this.diffs.length; x++) {
                        switch (this.diffs[x][0]) {
                            case DIFF_INSERT:
                                op = '+';
                                break;
                            case DIFF_DELETE:
                                op = '-';
                                break;
                            case DIFF_EQUAL:
                                op = ' ';
                                break;
                        }
                        text[x + 1] = op + encodeURI(this.diffs[x][1]) + '\n';
                    }
                    return text.join('').replace(/%20/g, ' ');
                };
                module.exports = diff_match_patch;
                module.exports['diff_match_patch'] = diff_match_patch;
                module.exports['DIFF_DELETE'] = DIFF_DELETE;
                module.exports['DIFF_INSERT'] = DIFF_INSERT;
                module.exports['DIFF_EQUAL'] = DIFF_EQUAL;
            }, {}], 82: [function (_dereq_, module, exports) {
                var eaw = {};
                if ('undefined' == typeof module) {
                    window.eastasianwidth = eaw;
                }
                else {
                    module.exports = eaw;
                }
                eaw.eastAsianWidth = function (character) {
                    var x = character.charCodeAt(0);
                    var y = (character.length == 2) ? character.charCodeAt(1) : 0;
                    var codePoint = x;
                    if ((0xD800 <= x && x <= 0xDBFF) && (0xDC00 <= y && y <= 0xDFFF)) {
                        x &= 0x3FF;
                        y &= 0x3FF;
                        codePoint = (x << 10) | y;
                        codePoint += 0x10000;
                    }
                    if ((0x3000 == codePoint) ||
                        (0xFF01 <= codePoint && codePoint <= 0xFF60) ||
                        (0xFFE0 <= codePoint && codePoint <= 0xFFE6)) {
                        return 'F';
                    }
                    if ((0x20A9 == codePoint) ||
                        (0xFF61 <= codePoint && codePoint <= 0xFFBE) ||
                        (0xFFC2 <= codePoint && codePoint <= 0xFFC7) ||
                        (0xFFCA <= codePoint && codePoint <= 0xFFCF) ||
                        (0xFFD2 <= codePoint && codePoint <= 0xFFD7) ||
                        (0xFFDA <= codePoint && codePoint <= 0xFFDC) ||
                        (0xFFE8 <= codePoint && codePoint <= 0xFFEE)) {
                        return 'H';
                    }
                    if ((0x1100 <= codePoint && codePoint <= 0x115F) ||
                        (0x11A3 <= codePoint && codePoint <= 0x11A7) ||
                        (0x11FA <= codePoint && codePoint <= 0x11FF) ||
                        (0x2329 <= codePoint && codePoint <= 0x232A) ||
                        (0x2E80 <= codePoint && codePoint <= 0x2E99) ||
                        (0x2E9B <= codePoint && codePoint <= 0x2EF3) ||
                        (0x2F00 <= codePoint && codePoint <= 0x2FD5) ||
                        (0x2FF0 <= codePoint && codePoint <= 0x2FFB) ||
                        (0x3001 <= codePoint && codePoint <= 0x303E) ||
                        (0x3041 <= codePoint && codePoint <= 0x3096) ||
                        (0x3099 <= codePoint && codePoint <= 0x30FF) ||
                        (0x3105 <= codePoint && codePoint <= 0x312D) ||
                        (0x3131 <= codePoint && codePoint <= 0x318E) ||
                        (0x3190 <= codePoint && codePoint <= 0x31BA) ||
                        (0x31C0 <= codePoint && codePoint <= 0x31E3) ||
                        (0x31F0 <= codePoint && codePoint <= 0x321E) ||
                        (0x3220 <= codePoint && codePoint <= 0x3247) ||
                        (0x3250 <= codePoint && codePoint <= 0x32FE) ||
                        (0x3300 <= codePoint && codePoint <= 0x4DBF) ||
                        (0x4E00 <= codePoint && codePoint <= 0xA48C) ||
                        (0xA490 <= codePoint && codePoint <= 0xA4C6) ||
                        (0xA960 <= codePoint && codePoint <= 0xA97C) ||
                        (0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
                        (0xD7B0 <= codePoint && codePoint <= 0xD7C6) ||
                        (0xD7CB <= codePoint && codePoint <= 0xD7FB) ||
                        (0xF900 <= codePoint && codePoint <= 0xFAFF) ||
                        (0xFE10 <= codePoint && codePoint <= 0xFE19) ||
                        (0xFE30 <= codePoint && codePoint <= 0xFE52) ||
                        (0xFE54 <= codePoint && codePoint <= 0xFE66) ||
                        (0xFE68 <= codePoint && codePoint <= 0xFE6B) ||
                        (0x1B000 <= codePoint && codePoint <= 0x1B001) ||
                        (0x1F200 <= codePoint && codePoint <= 0x1F202) ||
                        (0x1F210 <= codePoint && codePoint <= 0x1F23A) ||
                        (0x1F240 <= codePoint && codePoint <= 0x1F248) ||
                        (0x1F250 <= codePoint && codePoint <= 0x1F251) ||
                        (0x20000 <= codePoint && codePoint <= 0x2F73F) ||
                        (0x2B740 <= codePoint && codePoint <= 0x2FFFD) ||
                        (0x30000 <= codePoint && codePoint <= 0x3FFFD)) {
                        return 'W';
                    }
                    if ((0x0020 <= codePoint && codePoint <= 0x007E) ||
                        (0x00A2 <= codePoint && codePoint <= 0x00A3) ||
                        (0x00A5 <= codePoint && codePoint <= 0x00A6) ||
                        (0x00AC == codePoint) ||
                        (0x00AF == codePoint) ||
                        (0x27E6 <= codePoint && codePoint <= 0x27ED) ||
                        (0x2985 <= codePoint && codePoint <= 0x2986)) {
                        return 'Na';
                    }
                    if ((0x00A1 == codePoint) ||
                        (0x00A4 == codePoint) ||
                        (0x00A7 <= codePoint && codePoint <= 0x00A8) ||
                        (0x00AA == codePoint) ||
                        (0x00AD <= codePoint && codePoint <= 0x00AE) ||
                        (0x00B0 <= codePoint && codePoint <= 0x00B4) ||
                        (0x00B6 <= codePoint && codePoint <= 0x00BA) ||
                        (0x00BC <= codePoint && codePoint <= 0x00BF) ||
                        (0x00C6 == codePoint) ||
                        (0x00D0 == codePoint) ||
                        (0x00D7 <= codePoint && codePoint <= 0x00D8) ||
                        (0x00DE <= codePoint && codePoint <= 0x00E1) ||
                        (0x00E6 == codePoint) ||
                        (0x00E8 <= codePoint && codePoint <= 0x00EA) ||
                        (0x00EC <= codePoint && codePoint <= 0x00ED) ||
                        (0x00F0 == codePoint) ||
                        (0x00F2 <= codePoint && codePoint <= 0x00F3) ||
                        (0x00F7 <= codePoint && codePoint <= 0x00FA) ||
                        (0x00FC == codePoint) ||
                        (0x00FE == codePoint) ||
                        (0x0101 == codePoint) ||
                        (0x0111 == codePoint) ||
                        (0x0113 == codePoint) ||
                        (0x011B == codePoint) ||
                        (0x0126 <= codePoint && codePoint <= 0x0127) ||
                        (0x012B == codePoint) ||
                        (0x0131 <= codePoint && codePoint <= 0x0133) ||
                        (0x0138 == codePoint) ||
                        (0x013F <= codePoint && codePoint <= 0x0142) ||
                        (0x0144 == codePoint) ||
                        (0x0148 <= codePoint && codePoint <= 0x014B) ||
                        (0x014D == codePoint) ||
                        (0x0152 <= codePoint && codePoint <= 0x0153) ||
                        (0x0166 <= codePoint && codePoint <= 0x0167) ||
                        (0x016B == codePoint) ||
                        (0x01CE == codePoint) ||
                        (0x01D0 == codePoint) ||
                        (0x01D2 == codePoint) ||
                        (0x01D4 == codePoint) ||
                        (0x01D6 == codePoint) ||
                        (0x01D8 == codePoint) ||
                        (0x01DA == codePoint) ||
                        (0x01DC == codePoint) ||
                        (0x0251 == codePoint) ||
                        (0x0261 == codePoint) ||
                        (0x02C4 == codePoint) ||
                        (0x02C7 == codePoint) ||
                        (0x02C9 <= codePoint && codePoint <= 0x02CB) ||
                        (0x02CD == codePoint) ||
                        (0x02D0 == codePoint) ||
                        (0x02D8 <= codePoint && codePoint <= 0x02DB) ||
                        (0x02DD == codePoint) ||
                        (0x02DF == codePoint) ||
                        (0x0300 <= codePoint && codePoint <= 0x036F) ||
                        (0x0391 <= codePoint && codePoint <= 0x03A1) ||
                        (0x03A3 <= codePoint && codePoint <= 0x03A9) ||
                        (0x03B1 <= codePoint && codePoint <= 0x03C1) ||
                        (0x03C3 <= codePoint && codePoint <= 0x03C9) ||
                        (0x0401 == codePoint) ||
                        (0x0410 <= codePoint && codePoint <= 0x044F) ||
                        (0x0451 == codePoint) ||
                        (0x2010 == codePoint) ||
                        (0x2013 <= codePoint && codePoint <= 0x2016) ||
                        (0x2018 <= codePoint && codePoint <= 0x2019) ||
                        (0x201C <= codePoint && codePoint <= 0x201D) ||
                        (0x2020 <= codePoint && codePoint <= 0x2022) ||
                        (0x2024 <= codePoint && codePoint <= 0x2027) ||
                        (0x2030 == codePoint) ||
                        (0x2032 <= codePoint && codePoint <= 0x2033) ||
                        (0x2035 == codePoint) ||
                        (0x203B == codePoint) ||
                        (0x203E == codePoint) ||
                        (0x2074 == codePoint) ||
                        (0x207F == codePoint) ||
                        (0x2081 <= codePoint && codePoint <= 0x2084) ||
                        (0x20AC == codePoint) ||
                        (0x2103 == codePoint) ||
                        (0x2105 == codePoint) ||
                        (0x2109 == codePoint) ||
                        (0x2113 == codePoint) ||
                        (0x2116 == codePoint) ||
                        (0x2121 <= codePoint && codePoint <= 0x2122) ||
                        (0x2126 == codePoint) ||
                        (0x212B == codePoint) ||
                        (0x2153 <= codePoint && codePoint <= 0x2154) ||
                        (0x215B <= codePoint && codePoint <= 0x215E) ||
                        (0x2160 <= codePoint && codePoint <= 0x216B) ||
                        (0x2170 <= codePoint && codePoint <= 0x2179) ||
                        (0x2189 == codePoint) ||
                        (0x2190 <= codePoint && codePoint <= 0x2199) ||
                        (0x21B8 <= codePoint && codePoint <= 0x21B9) ||
                        (0x21D2 == codePoint) ||
                        (0x21D4 == codePoint) ||
                        (0x21E7 == codePoint) ||
                        (0x2200 == codePoint) ||
                        (0x2202 <= codePoint && codePoint <= 0x2203) ||
                        (0x2207 <= codePoint && codePoint <= 0x2208) ||
                        (0x220B == codePoint) ||
                        (0x220F == codePoint) ||
                        (0x2211 == codePoint) ||
                        (0x2215 == codePoint) ||
                        (0x221A == codePoint) ||
                        (0x221D <= codePoint && codePoint <= 0x2220) ||
                        (0x2223 == codePoint) ||
                        (0x2225 == codePoint) ||
                        (0x2227 <= codePoint && codePoint <= 0x222C) ||
                        (0x222E == codePoint) ||
                        (0x2234 <= codePoint && codePoint <= 0x2237) ||
                        (0x223C <= codePoint && codePoint <= 0x223D) ||
                        (0x2248 == codePoint) ||
                        (0x224C == codePoint) ||
                        (0x2252 == codePoint) ||
                        (0x2260 <= codePoint && codePoint <= 0x2261) ||
                        (0x2264 <= codePoint && codePoint <= 0x2267) ||
                        (0x226A <= codePoint && codePoint <= 0x226B) ||
                        (0x226E <= codePoint && codePoint <= 0x226F) ||
                        (0x2282 <= codePoint && codePoint <= 0x2283) ||
                        (0x2286 <= codePoint && codePoint <= 0x2287) ||
                        (0x2295 == codePoint) ||
                        (0x2299 == codePoint) ||
                        (0x22A5 == codePoint) ||
                        (0x22BF == codePoint) ||
                        (0x2312 == codePoint) ||
                        (0x2460 <= codePoint && codePoint <= 0x24E9) ||
                        (0x24EB <= codePoint && codePoint <= 0x254B) ||
                        (0x2550 <= codePoint && codePoint <= 0x2573) ||
                        (0x2580 <= codePoint && codePoint <= 0x258F) ||
                        (0x2592 <= codePoint && codePoint <= 0x2595) ||
                        (0x25A0 <= codePoint && codePoint <= 0x25A1) ||
                        (0x25A3 <= codePoint && codePoint <= 0x25A9) ||
                        (0x25B2 <= codePoint && codePoint <= 0x25B3) ||
                        (0x25B6 <= codePoint && codePoint <= 0x25B7) ||
                        (0x25BC <= codePoint && codePoint <= 0x25BD) ||
                        (0x25C0 <= codePoint && codePoint <= 0x25C1) ||
                        (0x25C6 <= codePoint && codePoint <= 0x25C8) ||
                        (0x25CB == codePoint) ||
                        (0x25CE <= codePoint && codePoint <= 0x25D1) ||
                        (0x25E2 <= codePoint && codePoint <= 0x25E5) ||
                        (0x25EF == codePoint) ||
                        (0x2605 <= codePoint && codePoint <= 0x2606) ||
                        (0x2609 == codePoint) ||
                        (0x260E <= codePoint && codePoint <= 0x260F) ||
                        (0x2614 <= codePoint && codePoint <= 0x2615) ||
                        (0x261C == codePoint) ||
                        (0x261E == codePoint) ||
                        (0x2640 == codePoint) ||
                        (0x2642 == codePoint) ||
                        (0x2660 <= codePoint && codePoint <= 0x2661) ||
                        (0x2663 <= codePoint && codePoint <= 0x2665) ||
                        (0x2667 <= codePoint && codePoint <= 0x266A) ||
                        (0x266C <= codePoint && codePoint <= 0x266D) ||
                        (0x266F == codePoint) ||
                        (0x269E <= codePoint && codePoint <= 0x269F) ||
                        (0x26BE <= codePoint && codePoint <= 0x26BF) ||
                        (0x26C4 <= codePoint && codePoint <= 0x26CD) ||
                        (0x26CF <= codePoint && codePoint <= 0x26E1) ||
                        (0x26E3 == codePoint) ||
                        (0x26E8 <= codePoint && codePoint <= 0x26FF) ||
                        (0x273D == codePoint) ||
                        (0x2757 == codePoint) ||
                        (0x2776 <= codePoint && codePoint <= 0x277F) ||
                        (0x2B55 <= codePoint && codePoint <= 0x2B59) ||
                        (0x3248 <= codePoint && codePoint <= 0x324F) ||
                        (0xE000 <= codePoint && codePoint <= 0xF8FF) ||
                        (0xFE00 <= codePoint && codePoint <= 0xFE0F) ||
                        (0xFFFD == codePoint) ||
                        (0x1F100 <= codePoint && codePoint <= 0x1F10A) ||
                        (0x1F110 <= codePoint && codePoint <= 0x1F12D) ||
                        (0x1F130 <= codePoint && codePoint <= 0x1F169) ||
                        (0x1F170 <= codePoint && codePoint <= 0x1F19A) ||
                        (0xE0100 <= codePoint && codePoint <= 0xE01EF) ||
                        (0xF0000 <= codePoint && codePoint <= 0xFFFFD) ||
                        (0x100000 <= codePoint && codePoint <= 0x10FFFD)) {
                        return 'A';
                    }
                    return 'N';
                };
                eaw.characterLength = function (character) {
                    var code = this.eastAsianWidth(character);
                    if (code == 'F' || code == 'W' || code == 'A') {
                        return 2;
                    }
                    else {
                        return 1;
                    }
                };
                eaw.length = function (string) {
                    var len = 0;
                    for (var i = 0; i < string.length; i++) {
                        len = len + this.characterLength(string.charAt(i));
                    }
                    return len;
                };
                eaw.slice = function (text, start, end) {
                    start = start ? start : 0;
                    end = end ? end : 1;
                    var result = '';
                    for (var i = 0; i < text.length; i++) {
                        var char = text.charAt(i);
                        var eawLen = eaw.length(result + char);
                        if (eawLen >= 1 + start && eawLen < 1 + end) {
                            result += char;
                        }
                    }
                    return result;
                };
            }, {}], 83: [function (_dereq_, module, exports) {
                var create = _dereq_('core-js/library/fn/object/create');
                var assign = _dereq_('core-js/library/fn/object/assign');
                var defaultOptions = _dereq_('./lib/default-options');
                var Decorator = _dereq_('./lib/decorator');
                var define = _dereq_('./lib/define-properties');
                var slice = Array.prototype.slice;
                function empowerCore(assert, options) {
                    var typeOfAssert = (typeof assert);
                    var enhancedAssert;
                    if ((typeOfAssert !== 'object' && typeOfAssert !== 'function') || assert === null) {
                        throw new TypeError('empower-core argument should be a function or object.');
                    }
                    if (isEmpowered(assert)) {
                        return assert;
                    }
                    switch (typeOfAssert) {
                        case 'function':
                            enhancedAssert = empowerAssertFunction(assert, options);
                            break;
                        case 'object':
                            enhancedAssert = empowerAssertObject(assert, options);
                            break;
                        default:
                            throw new Error('Cannot be here');
                    }
                    define(enhancedAssert, { _empowered: true });
                    return enhancedAssert;
                }
                function empowerAssertObject(assertObject, options) {
                    var config = assign(defaultOptions(), options);
                    var target = config.destructive ? assertObject : create(assertObject);
                    var decorator = new Decorator(target, config);
                    return assign(target, decorator.enhancement());
                }
                function empowerAssertFunction(assertFunction, options) {
                    var config = assign(defaultOptions(), options);
                    if (config.destructive) {
                        throw new Error('cannot use destructive:true to function.');
                    }
                    var decorator = new Decorator(assertFunction, config);
                    var enhancement = decorator.enhancement();
                    var powerAssert;
                    if (typeof enhancement === 'function') {
                        powerAssert = function powerAssert() {
                            return enhancement.apply(null, slice.apply(arguments));
                        };
                    }
                    else {
                        powerAssert = function powerAssert() {
                            return assertFunction.apply(null, slice.apply(arguments));
                        };
                    }
                    assign(powerAssert, assertFunction);
                    return assign(powerAssert, enhancement);
                }
                function isEmpowered(assertObjectOrFunction) {
                    return assertObjectOrFunction._empowered;
                }
                empowerCore.defaultOptions = defaultOptions;
                module.exports = empowerCore;
            }, { "./lib/decorator": 85, "./lib/default-options": 86, "./lib/define-properties": 87, "core-js/library/fn/object/assign": 19, "core-js/library/fn/object/create": 20 }], 84: [function (_dereq_, module, exports) {
                'use strict';
                var some = _dereq_('core-js/library/fn/array/some');
                var map = _dereq_('core-js/library/fn/array/map');
                function decorate(callSpec, decorator) {
                    var numArgsToCapture = callSpec.numArgsToCapture;
                    return function decoratedAssert() {
                        var context, message, hasMessage = false;
                        var args = new Array(arguments.length);
                        for (var i = 0; i < args.length; ++i) {
                            args[i] = arguments[i];
                        }
                        if (numArgsToCapture === (args.length - 1)) {
                            message = args.pop();
                            hasMessage = true;
                        }
                        var invocation = {
                            thisObj: this,
                            values: args,
                            message: message,
                            hasMessage: hasMessage
                        };
                        if (some(args, isCaptured)) {
                            invocation.values = map(args.slice(0, numArgsToCapture), function (arg) {
                                if (isNotCaptured(arg)) {
                                    return arg;
                                }
                                if (!context) {
                                    context = {
                                        source: arg.source,
                                        args: []
                                    };
                                }
                                context.args.push({
                                    value: arg.powerAssertContext.value,
                                    events: arg.powerAssertContext.events
                                });
                                return arg.powerAssertContext.value;
                            });
                            return decorator.concreteAssert(callSpec, invocation, context);
                        }
                        else {
                            return decorator.concreteAssert(callSpec, invocation);
                        }
                    };
                }
                function isNotCaptured(value) {
                    return !isCaptured(value);
                }
                function isCaptured(value) {
                    return (typeof value === 'object') &&
                        (value !== null) &&
                        (typeof value.powerAssertContext !== 'undefined');
                }
                module.exports = decorate;
            }, { "core-js/library/fn/array/map": 15, "core-js/library/fn/array/some": 18 }], 85: [function (_dereq_, module, exports) {
                'use strict';
                var forEach = _dereq_('core-js/library/fn/array/for-each');
                var filter = _dereq_('core-js/library/fn/array/filter');
                var map = _dereq_('core-js/library/fn/array/map');
                var signature = _dereq_('call-signature');
                var decorate = _dereq_('./decorate');
                var keys = _dereq_('core-js/library/fn/object/keys');
                function Decorator(receiver, config) {
                    this.receiver = receiver;
                    this.config = config;
                    this.onError = config.onError;
                    this.onSuccess = config.onSuccess;
                    this.signatures = map(config.patterns, parse);
                    this.wrapOnlySignatures = map(config.wrapOnlyPatterns, parse);
                }
                Decorator.prototype.enhancement = function () {
                    var that = this;
                    var container = this.container();
                    var wrappedMethods = [];
                    function attach(matcherSpec, enhanced) {
                        var matcher = matcherSpec.parsed;
                        var methodName = detectMethodName(matcher.callee);
                        if (typeof that.receiver[methodName] !== 'function' || wrappedMethods.indexOf(methodName) !== -1) {
                            return;
                        }
                        var callSpec = {
                            thisObj: that.receiver,
                            func: that.receiver[methodName],
                            numArgsToCapture: numberOfArgumentsToCapture(matcherSpec),
                            matcherSpec: matcherSpec,
                            enhanced: enhanced
                        };
                        container[methodName] = callSpec.enhancedFunc = decorate(callSpec, that);
                        wrappedMethods.push(methodName);
                    }
                    forEach(filter(this.signatures, methodCall), function (matcher) {
                        attach(matcher, true);
                    });
                    forEach(filter(this.wrapOnlySignatures, methodCall), function (matcher) {
                        attach(matcher, false);
                    });
                    return container;
                };
                Decorator.prototype.container = function () {
                    var basement = {};
                    if (typeof this.receiver === 'function') {
                        var candidates = filter(this.signatures, functionCall);
                        var enhanced = true;
                        if (candidates.length === 0) {
                            enhanced = false;
                            candidates = filter(this.wrapOnlySignatures, functionCall);
                        }
                        if (candidates.length === 1) {
                            var callSpec = {
                                thisObj: null,
                                func: this.receiver,
                                numArgsToCapture: numberOfArgumentsToCapture(candidates[0]),
                                matcherSpec: candidates[0],
                                enhanced: enhanced
                            };
                            basement = callSpec.enhancedFunc = decorate(callSpec, this);
                        }
                    }
                    return basement;
                };
                Decorator.prototype.concreteAssert = function (callSpec, invocation, context) {
                    var func = callSpec.func;
                    var thisObj = this.config.bindReceiver ? callSpec.thisObj : invocation.thisObj;
                    var enhanced = callSpec.enhanced;
                    var args = invocation.values;
                    var message = invocation.message;
                    var matcherSpec = callSpec.matcherSpec;
                    if (context && typeof this.config.modifyMessageBeforeAssert === 'function') {
                        message = this.config.modifyMessageBeforeAssert({ originalMessage: message, powerAssertContext: context });
                    }
                    args = args.concat(message);
                    var data = {
                        thisObj: invocation.thisObj,
                        assertionFunction: callSpec.enhancedFunc,
                        originalMessage: message,
                        defaultMessage: matcherSpec.defaultMessage,
                        matcherSpec: matcherSpec,
                        enhanced: enhanced,
                        args: args
                    };
                    if (context) {
                        data.powerAssertContext = context;
                    }
                    return this._callFunc(func, thisObj, args, data);
                };
                Decorator.prototype._callFunc = function (func, thisObj, args, data) {
                    var ret;
                    try {
                        ret = func.apply(thisObj, args);
                    }
                    catch (e) {
                        data.assertionThrew = true;
                        data.error = e;
                        return this.onError.call(thisObj, data);
                    }
                    data.assertionThrew = false;
                    data.returnValue = ret;
                    return this.onSuccess.call(thisObj, data);
                };
                function numberOfArgumentsToCapture(matcherSpec) {
                    var matcher = matcherSpec.parsed;
                    var len = matcher.args.length;
                    var lastArg;
                    if (0 < len) {
                        lastArg = matcher.args[len - 1];
                        if (lastArg.name === 'message' && lastArg.optional) {
                            len -= 1;
                        }
                    }
                    return len;
                }
                function detectMethodName(callee) {
                    if (callee.type === 'MemberExpression') {
                        return callee.member;
                    }
                    return null;
                }
                function functionCall(matcherSpec) {
                    return matcherSpec.parsed.callee.type === 'Identifier';
                }
                function methodCall(matcherSpec) {
                    return matcherSpec.parsed.callee.type === 'MemberExpression';
                }
                function parse(matcherSpec) {
                    if (typeof matcherSpec === 'string') {
                        matcherSpec = { pattern: matcherSpec };
                    }
                    var ret = {};
                    forEach(keys(matcherSpec), function (key) {
                        ret[key] = matcherSpec[key];
                    });
                    ret.parsed = signature.parse(matcherSpec.pattern);
                    return ret;
                }
                module.exports = Decorator;
            }, { "./decorate": 84, "call-signature": 10, "core-js/library/fn/array/filter": 11, "core-js/library/fn/array/for-each": 12, "core-js/library/fn/array/map": 15, "core-js/library/fn/object/keys": 22 }], 86: [function (_dereq_, module, exports) {
                'use strict';
                module.exports = function defaultOptions() {
                    return {
                        destructive: false,
                        bindReceiver: true,
                        onError: onError,
                        onSuccess: onSuccess,
                        patterns: [
                            'assert(value, [message])',
                            'assert.ok(value, [message])',
                            'assert.equal(actual, expected, [message])',
                            'assert.notEqual(actual, expected, [message])',
                            'assert.strictEqual(actual, expected, [message])',
                            'assert.notStrictEqual(actual, expected, [message])',
                            'assert.deepEqual(actual, expected, [message])',
                            'assert.notDeepEqual(actual, expected, [message])',
                            'assert.deepStrictEqual(actual, expected, [message])',
                            'assert.notDeepStrictEqual(actual, expected, [message])'
                        ],
                        wrapOnlyPatterns: []
                    };
                };
                function onError(errorEvent) {
                    var e = errorEvent.error;
                    if (errorEvent.powerAssertContext && /^AssertionError/.test(e.name)) {
                        e.powerAssertContext = errorEvent.powerAssertContext;
                    }
                    throw e;
                }
                function onSuccess(successEvent) {
                    return successEvent.returnValue;
                }
            }, {}], 87: [function (_dereq_, module, exports) {
                'use strict';
                var defineProperty = _dereq_('core-js/library/fn/object/define-property');
                var forEach = _dereq_('core-js/library/fn/array/for-each');
                var keys = _dereq_('core-js/library/fn/object/keys');
                module.exports = function defineProperties(obj, map) {
                    forEach(keys(map), function (name) {
                        defineProperty(obj, name, {
                            configurable: true,
                            enumerable: false,
                            value: map[name],
                            writable: true
                        });
                    });
                };
            }, { "core-js/library/fn/array/for-each": 12, "core-js/library/fn/object/define-property": 21, "core-js/library/fn/object/keys": 22 }], 88: [function (_dereq_, module, exports) {
                var empowerCore = _dereq_('empower-core');
                var defaultOptions = _dereq_('./lib/default-options');
                var capturable = _dereq_('./lib/capturable');
                var assign = _dereq_('core-js/library/fn/object/assign');
                var define = _dereq_('./lib/define-properties');
                function empower(assert, formatter, options) {
                    var config = assign(defaultOptions(), options);
                    var eagerEvaluation = !(config.modifyMessageOnRethrow || config.saveContextOnRethrow);
                    var shouldRecreateAssertionError = (function isStackUnchanged() {
                        if (typeof assert !== 'function') {
                            return false;
                        }
                        if (typeof assert.AssertionError !== 'function') {
                            return false;
                        }
                        var ae = new assert.AssertionError({
                            actual: 123,
                            expected: 456,
                            operator: '==='
                        });
                        ae.message = '[REPLACED MESSAGE]';
                        return !(/REPLACED MESSAGE/.test(ae.stack)) && /123 === 456/.test(ae.stack);
                    })();
                    var empowerCoreConfig = assign(config, {
                        modifyMessageBeforeAssert: function (beforeAssertEvent) {
                            var message = beforeAssertEvent.originalMessage;
                            if (!eagerEvaluation) {
                                return message;
                            }
                            return buildPowerAssertText(formatter, message, beforeAssertEvent.powerAssertContext);
                        },
                        onError: function (errorEvent) {
                            var e = errorEvent.error;
                            if (!/^AssertionError/.test(e.name)) {
                                throw e;
                            }
                            if (!errorEvent.powerAssertContext) {
                                throw e;
                            }
                            var poweredMessage;
                            if (config.modifyMessageOnRethrow || config.saveContextOnRethrow) {
                                poweredMessage = buildPowerAssertText(formatter, errorEvent.originalMessage, errorEvent.powerAssertContext);
                                if (shouldRecreateAssertionError) {
                                    e = new assert.AssertionError({
                                        message: poweredMessage,
                                        actual: e.actual,
                                        expected: e.expected,
                                        operator: e.operator,
                                        stackStartFunction: e.stackStartFunction
                                    });
                                }
                            }
                            if (config.modifyMessageOnRethrow && !shouldRecreateAssertionError) {
                                e.message = poweredMessage;
                            }
                            if (config.saveContextOnRethrow) {
                                e.powerAssertContext = errorEvent.powerAssertContext;
                            }
                            throw e;
                        }
                    });
                    var enhancedAssert = empowerCore(assert, empowerCoreConfig);
                    define(enhancedAssert, capturable());
                    return enhancedAssert;
                }
                function buildPowerAssertText(formatter, message, context) {
                    var powerAssertText = formatter(context);
                    return message ? message + ' ' + powerAssertText : powerAssertText;
                }
                ;
                empower.defaultOptions = defaultOptions;
                module.exports = empower;
            }, { "./lib/capturable": 89, "./lib/default-options": 90, "./lib/define-properties": 91, "core-js/library/fn/object/assign": 19, "empower-core": 83 }], 89: [function (_dereq_, module, exports) {
                'use strict';
                module.exports = function capturable() {
                    var events = [];
                    function _capt(value, espath) {
                        events.push({ value: value, espath: espath });
                        return value;
                    }
                    function _expr(value, args) {
                        var captured = events;
                        events = [];
                        var source = {
                            content: args.content,
                            filepath: args.filepath,
                            line: args.line
                        };
                        if (args.generator) {
                            source.generator = true;
                        }
                        if (args.async) {
                            source.async = true;
                        }
                        return {
                            powerAssertContext: {
                                value: value,
                                events: captured
                            },
                            source: source
                        };
                    }
                    return {
                        _capt: _capt,
                        _expr: _expr
                    };
                };
            }, {}], 90: [function (_dereq_, module, exports) {
                'use strict';
                var empowerCore = _dereq_('empower-core');
                var assign = _dereq_('core-js/library/fn/object/assign');
                module.exports = function defaultOptions() {
                    return assign(empowerCore.defaultOptions(), {
                        modifyMessageOnRethrow: false,
                        saveContextOnRethrow: false
                    });
                };
            }, { "core-js/library/fn/object/assign": 19, "empower-core": 83 }], 91: [function (_dereq_, module, exports) {
                arguments[4][87][0].apply(exports, arguments);
            }, { "core-js/library/fn/array/for-each": 12, "core-js/library/fn/object/define-property": 21, "core-js/library/fn/object/keys": 22, "dup": 87 }], 92: [function (_dereq_, module, exports) {
                'use strict';
                var createWhitelist = _dereq_('./lib/create-whitelist');
                var cloneWithWhitelist = _dereq_('./lib/clone-ast');
                function createCloneFunction(options) {
                    return cloneWithWhitelist(createWhitelist(options));
                }
                var espurify = createCloneFunction();
                espurify.customize = createCloneFunction;
                espurify.cloneWithWhitelist = cloneWithWhitelist;
                module.exports = espurify;
            }, { "./lib/clone-ast": 94, "./lib/create-whitelist": 95 }], 93: [function (_dereq_, module, exports) {
                module.exports = {
                    ArrayExpression: ['type', 'elements'],
                    ArrayPattern: ['type', 'elements'],
                    ArrowFunctionExpression: ['type', 'id', 'params', 'body', 'generator', 'expression', 'async'],
                    AssignmentExpression: ['type', 'operator', 'left', 'right'],
                    AssignmentPattern: ['type', 'left', 'right'],
                    AwaitExpression: ['type', 'argument'],
                    BinaryExpression: ['type', 'operator', 'left', 'right'],
                    BlockStatement: ['type', 'body'],
                    BreakStatement: ['type', 'label'],
                    CallExpression: ['type', 'callee', 'arguments'],
                    CatchClause: ['type', 'param', 'guard', 'body'],
                    ClassBody: ['type', 'body'],
                    ClassDeclaration: ['type', 'id', 'superClass', 'body'],
                    ClassExpression: ['type', 'id', 'superClass', 'body'],
                    ConditionalExpression: ['type', 'test', 'consequent', 'alternate'],
                    ContinueStatement: ['type', 'label'],
                    DebuggerStatement: ['type'],
                    DoWhileStatement: ['type', 'body', 'test'],
                    EmptyStatement: ['type'],
                    ExportAllDeclaration: ['type', 'source'],
                    ExportDefaultDeclaration: ['type', 'declaration'],
                    ExportNamedDeclaration: ['type', 'declaration', 'specifiers', 'source'],
                    ExportSpecifier: ['type', 'exported', 'local'],
                    ExpressionStatement: ['type', 'expression'],
                    ForInStatement: ['type', 'left', 'right', 'body'],
                    ForOfStatement: ['type', 'left', 'right', 'body'],
                    ForStatement: ['type', 'init', 'test', 'update', 'body'],
                    FunctionDeclaration: ['type', 'id', 'params', 'body', 'generator', 'async'],
                    FunctionExpression: ['type', 'id', 'params', 'body', 'generator', 'async'],
                    Identifier: ['type', 'name'],
                    IfStatement: ['type', 'test', 'consequent', 'alternate'],
                    ImportDeclaration: ['type', 'specifiers', 'source'],
                    ImportDefaultSpecifier: ['type', 'local'],
                    ImportNamespaceSpecifier: ['type', 'local'],
                    ImportSpecifier: ['type', 'imported', 'local'],
                    LabeledStatement: ['type', 'label', 'body'],
                    Literal: ['type', 'value', 'regex'],
                    LogicalExpression: ['type', 'operator', 'left', 'right'],
                    MemberExpression: ['type', 'object', 'property', 'computed'],
                    MetaProperty: ['type', 'meta', 'property'],
                    MethodDefinition: ['type', 'key', 'value', 'kind', 'computed', 'static'],
                    NewExpression: ['type', 'callee', 'arguments'],
                    ObjectExpression: ['type', 'properties'],
                    ObjectPattern: ['type', 'properties'],
                    Program: ['type', 'body', 'sourceType'],
                    Property: ['type', 'key', 'value', 'kind', 'method', 'shorthand', 'computed'],
                    RestElement: ['type', 'argument'],
                    ReturnStatement: ['type', 'argument'],
                    SequenceExpression: ['type', 'expressions'],
                    SpreadElement: ['type', 'argument'],
                    Super: ['type'],
                    SwitchCase: ['type', 'test', 'consequent'],
                    SwitchStatement: ['type', 'discriminant', 'cases', 'lexical'],
                    TaggedTemplateExpression: ['type', 'tag', 'quasi'],
                    TemplateElement: ['type', 'tail', 'value'],
                    TemplateLiteral: ['type', 'quasis', 'expressions'],
                    ThisExpression: ['type'],
                    ThrowStatement: ['type', 'argument'],
                    TryStatement: ['type', 'block', 'handler', 'finalizer'],
                    UnaryExpression: ['type', 'operator', 'prefix', 'argument'],
                    UpdateExpression: ['type', 'operator', 'argument', 'prefix'],
                    VariableDeclaration: ['type', 'declarations', 'kind'],
                    VariableDeclarator: ['type', 'id', 'init'],
                    WhileStatement: ['type', 'test', 'body'],
                    WithStatement: ['type', 'object', 'body'],
                    YieldExpression: ['type', 'argument', 'delegate']
                };
            }, {}], 94: [function (_dereq_, module, exports) {
                'use strict';
                var isArray = _dereq_('core-js/library/fn/array/is-array');
                var objectKeys = _dereq_('core-js/library/fn/object/keys');
                var indexOf = _dereq_('core-js/library/fn/array/index-of');
                var reduce = _dereq_('core-js/library/fn/array/reduce');
                module.exports = function cloneWithWhitelist(astWhiteList) {
                    var whitelist = reduce(objectKeys(astWhiteList), function (props, key) {
                        var propNames = astWhiteList[key];
                        var prepend = (indexOf(propNames, 'type') === -1) ? ['type'] : [];
                        props[key] = prepend.concat(propNames);
                        return props;
                    }, {});
                    function cloneNodeOrObject(obj) {
                        var props = obj.type ? whitelist[obj.type] : null;
                        if (props) {
                            return cloneNode(obj, props);
                        }
                        else {
                            return cloneObject(obj);
                        }
                    }
                    function cloneArray(ary) {
                        var i = ary.length, clone = [];
                        while (i--) {
                            clone[i] = cloneOf(ary[i]);
                        }
                        return clone;
                    }
                    function cloneNode(node, props) {
                        var i, len, key, clone = {};
                        for (i = 0, len = props.length; i < len; i += 1) {
                            key = props[i];
                            if (node.hasOwnProperty(key)) {
                                clone[key] = cloneOf(node[key]);
                            }
                        }
                        return clone;
                    }
                    function cloneObject(obj) {
                        var props = objectKeys(obj);
                        var i, len, key, clone = {};
                        for (i = 0, len = props.length; i < len; i += 1) {
                            key = props[i];
                            clone[key] = cloneOf(obj[key]);
                        }
                        return clone;
                    }
                    function cloneOf(val) {
                        if (typeof val === 'object' && val !== null) {
                            if (val instanceof RegExp) {
                                return new RegExp(val);
                            }
                            else if (isArray(val)) {
                                return cloneArray(val);
                            }
                            else {
                                return cloneNodeOrObject(val);
                            }
                        }
                        else {
                            return val;
                        }
                    }
                    return cloneNodeOrObject;
                };
            }, { "core-js/library/fn/array/index-of": 13, "core-js/library/fn/array/is-array": 14, "core-js/library/fn/array/reduce": 17, "core-js/library/fn/object/keys": 22 }], 95: [function (_dereq_, module, exports) {
                'use strict';
                var defaultProps = _dereq_('./ast-properties');
                var objectKeys = _dereq_('core-js/library/fn/object/keys');
                var assign = _dereq_('core-js/library/fn/object/assign');
                module.exports = function createWhitelist(options) {
                    var opts = assign({}, options);
                    var typeName, i, len;
                    var keys = objectKeys(defaultProps);
                    var result = {};
                    for (i = 0, len = keys.length; i < len; i += 1) {
                        typeName = keys[i];
                        result[typeName] = defaultProps[typeName].concat(opts.extra);
                    }
                    return result;
                };
            }, { "./ast-properties": 93, "core-js/library/fn/object/assign": 19, "core-js/library/fn/object/keys": 22 }], 96: [function (_dereq_, module, exports) {
                (function clone(exports) {
                    'use strict';
                    var Syntax, isArray, VisitorOption, VisitorKeys, objectCreate, objectKeys, BREAK, SKIP, REMOVE;
                    function ignoreJSHintError() { }
                    isArray = Array.isArray;
                    if (!isArray) {
                        isArray = function isArray(array) {
                            return Object.prototype.toString.call(array) === '[object Array]';
                        };
                    }
                    function deepCopy(obj) {
                        var ret = {}, key, val;
                        for (key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                val = obj[key];
                                if (typeof val === 'object' && val !== null) {
                                    ret[key] = deepCopy(val);
                                }
                                else {
                                    ret[key] = val;
                                }
                            }
                        }
                        return ret;
                    }
                    function shallowCopy(obj) {
                        var ret = {}, key;
                        for (key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                ret[key] = obj[key];
                            }
                        }
                        return ret;
                    }
                    ignoreJSHintError(shallowCopy);
                    function upperBound(array, func) {
                        var diff, len, i, current;
                        len = array.length;
                        i = 0;
                        while (len) {
                            diff = len >>> 1;
                            current = i + diff;
                            if (func(array[current])) {
                                len = diff;
                            }
                            else {
                                i = current + 1;
                                len -= diff + 1;
                            }
                        }
                        return i;
                    }
                    function lowerBound(array, func) {
                        var diff, len, i, current;
                        len = array.length;
                        i = 0;
                        while (len) {
                            diff = len >>> 1;
                            current = i + diff;
                            if (func(array[current])) {
                                i = current + 1;
                                len -= diff + 1;
                            }
                            else {
                                len = diff;
                            }
                        }
                        return i;
                    }
                    ignoreJSHintError(lowerBound);
                    objectCreate = Object.create || (function () {
                        function F() { }
                        return function (o) {
                            F.prototype = o;
                            return new F();
                        };
                    })();
                    objectKeys = Object.keys || function (o) {
                        var keys = [], key;
                        for (key in o) {
                            keys.push(key);
                        }
                        return keys;
                    };
                    function extend(to, from) {
                        var keys = objectKeys(from), key, i, len;
                        for (i = 0, len = keys.length; i < len; i += 1) {
                            key = keys[i];
                            to[key] = from[key];
                        }
                        return to;
                    }
                    Syntax = {
                        AssignmentExpression: 'AssignmentExpression',
                        AssignmentPattern: 'AssignmentPattern',
                        ArrayExpression: 'ArrayExpression',
                        ArrayPattern: 'ArrayPattern',
                        ArrowFunctionExpression: 'ArrowFunctionExpression',
                        AwaitExpression: 'AwaitExpression',
                        BlockStatement: 'BlockStatement',
                        BinaryExpression: 'BinaryExpression',
                        BreakStatement: 'BreakStatement',
                        CallExpression: 'CallExpression',
                        CatchClause: 'CatchClause',
                        ClassBody: 'ClassBody',
                        ClassDeclaration: 'ClassDeclaration',
                        ClassExpression: 'ClassExpression',
                        ComprehensionBlock: 'ComprehensionBlock',
                        ComprehensionExpression: 'ComprehensionExpression',
                        ConditionalExpression: 'ConditionalExpression',
                        ContinueStatement: 'ContinueStatement',
                        DebuggerStatement: 'DebuggerStatement',
                        DirectiveStatement: 'DirectiveStatement',
                        DoWhileStatement: 'DoWhileStatement',
                        EmptyStatement: 'EmptyStatement',
                        ExportAllDeclaration: 'ExportAllDeclaration',
                        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
                        ExportNamedDeclaration: 'ExportNamedDeclaration',
                        ExportSpecifier: 'ExportSpecifier',
                        ExpressionStatement: 'ExpressionStatement',
                        ForStatement: 'ForStatement',
                        ForInStatement: 'ForInStatement',
                        ForOfStatement: 'ForOfStatement',
                        FunctionDeclaration: 'FunctionDeclaration',
                        FunctionExpression: 'FunctionExpression',
                        GeneratorExpression: 'GeneratorExpression',
                        Identifier: 'Identifier',
                        IfStatement: 'IfStatement',
                        ImportDeclaration: 'ImportDeclaration',
                        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
                        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
                        ImportSpecifier: 'ImportSpecifier',
                        Literal: 'Literal',
                        LabeledStatement: 'LabeledStatement',
                        LogicalExpression: 'LogicalExpression',
                        MemberExpression: 'MemberExpression',
                        MetaProperty: 'MetaProperty',
                        MethodDefinition: 'MethodDefinition',
                        ModuleSpecifier: 'ModuleSpecifier',
                        NewExpression: 'NewExpression',
                        ObjectExpression: 'ObjectExpression',
                        ObjectPattern: 'ObjectPattern',
                        Program: 'Program',
                        Property: 'Property',
                        RestElement: 'RestElement',
                        ReturnStatement: 'ReturnStatement',
                        SequenceExpression: 'SequenceExpression',
                        SpreadElement: 'SpreadElement',
                        Super: 'Super',
                        SwitchStatement: 'SwitchStatement',
                        SwitchCase: 'SwitchCase',
                        TaggedTemplateExpression: 'TaggedTemplateExpression',
                        TemplateElement: 'TemplateElement',
                        TemplateLiteral: 'TemplateLiteral',
                        ThisExpression: 'ThisExpression',
                        ThrowStatement: 'ThrowStatement',
                        TryStatement: 'TryStatement',
                        UnaryExpression: 'UnaryExpression',
                        UpdateExpression: 'UpdateExpression',
                        VariableDeclaration: 'VariableDeclaration',
                        VariableDeclarator: 'VariableDeclarator',
                        WhileStatement: 'WhileStatement',
                        WithStatement: 'WithStatement',
                        YieldExpression: 'YieldExpression'
                    };
                    VisitorKeys = {
                        AssignmentExpression: ['left', 'right'],
                        AssignmentPattern: ['left', 'right'],
                        ArrayExpression: ['elements'],
                        ArrayPattern: ['elements'],
                        ArrowFunctionExpression: ['params', 'body'],
                        AwaitExpression: ['argument'],
                        BlockStatement: ['body'],
                        BinaryExpression: ['left', 'right'],
                        BreakStatement: ['label'],
                        CallExpression: ['callee', 'arguments'],
                        CatchClause: ['param', 'body'],
                        ClassBody: ['body'],
                        ClassDeclaration: ['id', 'superClass', 'body'],
                        ClassExpression: ['id', 'superClass', 'body'],
                        ComprehensionBlock: ['left', 'right'],
                        ComprehensionExpression: ['blocks', 'filter', 'body'],
                        ConditionalExpression: ['test', 'consequent', 'alternate'],
                        ContinueStatement: ['label'],
                        DebuggerStatement: [],
                        DirectiveStatement: [],
                        DoWhileStatement: ['body', 'test'],
                        EmptyStatement: [],
                        ExportAllDeclaration: ['source'],
                        ExportDefaultDeclaration: ['declaration'],
                        ExportNamedDeclaration: ['declaration', 'specifiers', 'source'],
                        ExportSpecifier: ['exported', 'local'],
                        ExpressionStatement: ['expression'],
                        ForStatement: ['init', 'test', 'update', 'body'],
                        ForInStatement: ['left', 'right', 'body'],
                        ForOfStatement: ['left', 'right', 'body'],
                        FunctionDeclaration: ['id', 'params', 'body'],
                        FunctionExpression: ['id', 'params', 'body'],
                        GeneratorExpression: ['blocks', 'filter', 'body'],
                        Identifier: [],
                        IfStatement: ['test', 'consequent', 'alternate'],
                        ImportDeclaration: ['specifiers', 'source'],
                        ImportDefaultSpecifier: ['local'],
                        ImportNamespaceSpecifier: ['local'],
                        ImportSpecifier: ['imported', 'local'],
                        Literal: [],
                        LabeledStatement: ['label', 'body'],
                        LogicalExpression: ['left', 'right'],
                        MemberExpression: ['object', 'property'],
                        MetaProperty: ['meta', 'property'],
                        MethodDefinition: ['key', 'value'],
                        ModuleSpecifier: [],
                        NewExpression: ['callee', 'arguments'],
                        ObjectExpression: ['properties'],
                        ObjectPattern: ['properties'],
                        Program: ['body'],
                        Property: ['key', 'value'],
                        RestElement: ['argument'],
                        ReturnStatement: ['argument'],
                        SequenceExpression: ['expressions'],
                        SpreadElement: ['argument'],
                        Super: [],
                        SwitchStatement: ['discriminant', 'cases'],
                        SwitchCase: ['test', 'consequent'],
                        TaggedTemplateExpression: ['tag', 'quasi'],
                        TemplateElement: [],
                        TemplateLiteral: ['quasis', 'expressions'],
                        ThisExpression: [],
                        ThrowStatement: ['argument'],
                        TryStatement: ['block', 'handler', 'finalizer'],
                        UnaryExpression: ['argument'],
                        UpdateExpression: ['argument'],
                        VariableDeclaration: ['declarations'],
                        VariableDeclarator: ['id', 'init'],
                        WhileStatement: ['test', 'body'],
                        WithStatement: ['object', 'body'],
                        YieldExpression: ['argument']
                    };
                    BREAK = {};
                    SKIP = {};
                    REMOVE = {};
                    VisitorOption = {
                        Break: BREAK,
                        Skip: SKIP,
                        Remove: REMOVE
                    };
                    function Reference(parent, key) {
                        this.parent = parent;
                        this.key = key;
                    }
                    Reference.prototype.replace = function replace(node) {
                        this.parent[this.key] = node;
                    };
                    Reference.prototype.remove = function remove() {
                        if (isArray(this.parent)) {
                            this.parent.splice(this.key, 1);
                            return true;
                        }
                        else {
                            this.replace(null);
                            return false;
                        }
                    };
                    function Element(node, path, wrap, ref) {
                        this.node = node;
                        this.path = path;
                        this.wrap = wrap;
                        this.ref = ref;
                    }
                    function Controller() { }
                    Controller.prototype.path = function path() {
                        var i, iz, j, jz, result, element;
                        function addToPath(result, path) {
                            if (isArray(path)) {
                                for (j = 0, jz = path.length; j < jz; ++j) {
                                    result.push(path[j]);
                                }
                            }
                            else {
                                result.push(path);
                            }
                        }
                        if (!this.__current.path) {
                            return null;
                        }
                        result = [];
                        for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
                            element = this.__leavelist[i];
                            addToPath(result, element.path);
                        }
                        addToPath(result, this.__current.path);
                        return result;
                    };
                    Controller.prototype.type = function () {
                        var node = this.current();
                        return node.type || this.__current.wrap;
                    };
                    Controller.prototype.parents = function parents() {
                        var i, iz, result;
                        result = [];
                        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
                            result.push(this.__leavelist[i].node);
                        }
                        return result;
                    };
                    Controller.prototype.current = function current() {
                        return this.__current.node;
                    };
                    Controller.prototype.__execute = function __execute(callback, element) {
                        var previous, result;
                        result = undefined;
                        previous = this.__current;
                        this.__current = element;
                        this.__state = null;
                        if (callback) {
                            result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
                        }
                        this.__current = previous;
                        return result;
                    };
                    Controller.prototype.notify = function notify(flag) {
                        this.__state = flag;
                    };
                    Controller.prototype.skip = function () {
                        this.notify(SKIP);
                    };
                    Controller.prototype['break'] = function () {
                        this.notify(BREAK);
                    };
                    Controller.prototype.remove = function () {
                        this.notify(REMOVE);
                    };
                    Controller.prototype.__initialize = function (root, visitor) {
                        this.visitor = visitor;
                        this.root = root;
                        this.__worklist = [];
                        this.__leavelist = [];
                        this.__current = null;
                        this.__state = null;
                        this.__fallback = null;
                        if (visitor.fallback === 'iteration') {
                            this.__fallback = objectKeys;
                        }
                        else if (typeof visitor.fallback === 'function') {
                            this.__fallback = visitor.fallback;
                        }
                        this.__keys = VisitorKeys;
                        if (visitor.keys) {
                            this.__keys = extend(objectCreate(this.__keys), visitor.keys);
                        }
                    };
                    function isNode(node) {
                        if (node == null) {
                            return false;
                        }
                        return typeof node === 'object' && typeof node.type === 'string';
                    }
                    function isProperty(nodeType, key) {
                        return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && 'properties' === key;
                    }
                    Controller.prototype.traverse = function traverse(root, visitor) {
                        var worklist, leavelist, element, node, nodeType, ret, key, current, current2, candidates, candidate, sentinel;
                        this.__initialize(root, visitor);
                        sentinel = {};
                        worklist = this.__worklist;
                        leavelist = this.__leavelist;
                        worklist.push(new Element(root, null, null, null));
                        leavelist.push(new Element(null, null, null, null));
                        while (worklist.length) {
                            element = worklist.pop();
                            if (element === sentinel) {
                                element = leavelist.pop();
                                ret = this.__execute(visitor.leave, element);
                                if (this.__state === BREAK || ret === BREAK) {
                                    return;
                                }
                                continue;
                            }
                            if (element.node) {
                                ret = this.__execute(visitor.enter, element);
                                if (this.__state === BREAK || ret === BREAK) {
                                    return;
                                }
                                worklist.push(sentinel);
                                leavelist.push(element);
                                if (this.__state === SKIP || ret === SKIP) {
                                    continue;
                                }
                                node = element.node;
                                nodeType = node.type || element.wrap;
                                candidates = this.__keys[nodeType];
                                if (!candidates) {
                                    if (this.__fallback) {
                                        candidates = this.__fallback(node);
                                    }
                                    else {
                                        throw new Error('Unknown node type ' + nodeType + '.');
                                    }
                                }
                                current = candidates.length;
                                while ((current -= 1) >= 0) {
                                    key = candidates[current];
                                    candidate = node[key];
                                    if (!candidate) {
                                        continue;
                                    }
                                    if (isArray(candidate)) {
                                        current2 = candidate.length;
                                        while ((current2 -= 1) >= 0) {
                                            if (!candidate[current2]) {
                                                continue;
                                            }
                                            if (isProperty(nodeType, candidates[current])) {
                                                element = new Element(candidate[current2], [key, current2], 'Property', null);
                                            }
                                            else if (isNode(candidate[current2])) {
                                                element = new Element(candidate[current2], [key, current2], null, null);
                                            }
                                            else {
                                                continue;
                                            }
                                            worklist.push(element);
                                        }
                                    }
                                    else if (isNode(candidate)) {
                                        worklist.push(new Element(candidate, key, null, null));
                                    }
                                }
                            }
                        }
                    };
                    Controller.prototype.replace = function replace(root, visitor) {
                        var worklist, leavelist, node, nodeType, target, element, current, current2, candidates, candidate, sentinel, outer, key;
                        function removeElem(element) {
                            var i, key, nextElem, parent;
                            if (element.ref.remove()) {
                                key = element.ref.key;
                                parent = element.ref.parent;
                                i = worklist.length;
                                while (i--) {
                                    nextElem = worklist[i];
                                    if (nextElem.ref && nextElem.ref.parent === parent) {
                                        if (nextElem.ref.key < key) {
                                            break;
                                        }
                                        --nextElem.ref.key;
                                    }
                                }
                            }
                        }
                        this.__initialize(root, visitor);
                        sentinel = {};
                        worklist = this.__worklist;
                        leavelist = this.__leavelist;
                        outer = {
                            root: root
                        };
                        element = new Element(root, null, null, new Reference(outer, 'root'));
                        worklist.push(element);
                        leavelist.push(element);
                        while (worklist.length) {
                            element = worklist.pop();
                            if (element === sentinel) {
                                element = leavelist.pop();
                                target = this.__execute(visitor.leave, element);
                                if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                                    element.ref.replace(target);
                                }
                                if (this.__state === REMOVE || target === REMOVE) {
                                    removeElem(element);
                                }
                                if (this.__state === BREAK || target === BREAK) {
                                    return outer.root;
                                }
                                continue;
                            }
                            target = this.__execute(visitor.enter, element);
                            if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                                element.ref.replace(target);
                                element.node = target;
                            }
                            if (this.__state === REMOVE || target === REMOVE) {
                                removeElem(element);
                                element.node = null;
                            }
                            if (this.__state === BREAK || target === BREAK) {
                                return outer.root;
                            }
                            node = element.node;
                            if (!node) {
                                continue;
                            }
                            worklist.push(sentinel);
                            leavelist.push(element);
                            if (this.__state === SKIP || target === SKIP) {
                                continue;
                            }
                            nodeType = node.type || element.wrap;
                            candidates = this.__keys[nodeType];
                            if (!candidates) {
                                if (this.__fallback) {
                                    candidates = this.__fallback(node);
                                }
                                else {
                                    throw new Error('Unknown node type ' + nodeType + '.');
                                }
                            }
                            current = candidates.length;
                            while ((current -= 1) >= 0) {
                                key = candidates[current];
                                candidate = node[key];
                                if (!candidate) {
                                    continue;
                                }
                                if (isArray(candidate)) {
                                    current2 = candidate.length;
                                    while ((current2 -= 1) >= 0) {
                                        if (!candidate[current2]) {
                                            continue;
                                        }
                                        if (isProperty(nodeType, candidates[current])) {
                                            element = new Element(candidate[current2], [key, current2], 'Property', new Reference(candidate, current2));
                                        }
                                        else if (isNode(candidate[current2])) {
                                            element = new Element(candidate[current2], [key, current2], null, new Reference(candidate, current2));
                                        }
                                        else {
                                            continue;
                                        }
                                        worklist.push(element);
                                    }
                                }
                                else if (isNode(candidate)) {
                                    worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                                }
                            }
                        }
                        return outer.root;
                    };
                    function traverse(root, visitor) {
                        var controller = new Controller();
                        return controller.traverse(root, visitor);
                    }
                    function replace(root, visitor) {
                        var controller = new Controller();
                        return controller.replace(root, visitor);
                    }
                    function extendCommentRange(comment, tokens) {
                        var target;
                        target = upperBound(tokens, function search(token) {
                            return token.range[0] > comment.range[0];
                        });
                        comment.extendedRange = [comment.range[0], comment.range[1]];
                        if (target !== tokens.length) {
                            comment.extendedRange[1] = tokens[target].range[0];
                        }
                        target -= 1;
                        if (target >= 0) {
                            comment.extendedRange[0] = tokens[target].range[1];
                        }
                        return comment;
                    }
                    function attachComments(tree, providedComments, tokens) {
                        var comments = [], comment, len, i, cursor;
                        if (!tree.range) {
                            throw new Error('attachComments needs range information');
                        }
                        if (!tokens.length) {
                            if (providedComments.length) {
                                for (i = 0, len = providedComments.length; i < len; i += 1) {
                                    comment = deepCopy(providedComments[i]);
                                    comment.extendedRange = [0, tree.range[0]];
                                    comments.push(comment);
                                }
                                tree.leadingComments = comments;
                            }
                            return tree;
                        }
                        for (i = 0, len = providedComments.length; i < len; i += 1) {
                            comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
                        }
                        cursor = 0;
                        traverse(tree, {
                            enter: function (node) {
                                var comment;
                                while (cursor < comments.length) {
                                    comment = comments[cursor];
                                    if (comment.extendedRange[1] > node.range[0]) {
                                        break;
                                    }
                                    if (comment.extendedRange[1] === node.range[0]) {
                                        if (!node.leadingComments) {
                                            node.leadingComments = [];
                                        }
                                        node.leadingComments.push(comment);
                                        comments.splice(cursor, 1);
                                    }
                                    else {
                                        cursor += 1;
                                    }
                                }
                                if (cursor === comments.length) {
                                    return VisitorOption.Break;
                                }
                                if (comments[cursor].extendedRange[0] > node.range[1]) {
                                    return VisitorOption.Skip;
                                }
                            }
                        });
                        cursor = 0;
                        traverse(tree, {
                            leave: function (node) {
                                var comment;
                                while (cursor < comments.length) {
                                    comment = comments[cursor];
                                    if (node.range[1] < comment.extendedRange[0]) {
                                        break;
                                    }
                                    if (node.range[1] === comment.extendedRange[0]) {
                                        if (!node.trailingComments) {
                                            node.trailingComments = [];
                                        }
                                        node.trailingComments.push(comment);
                                        comments.splice(cursor, 1);
                                    }
                                    else {
                                        cursor += 1;
                                    }
                                }
                                if (cursor === comments.length) {
                                    return VisitorOption.Break;
                                }
                                if (comments[cursor].extendedRange[0] > node.range[1]) {
                                    return VisitorOption.Skip;
                                }
                            }
                        });
                        return tree;
                    }
                    exports.version = _dereq_('./package.json').version;
                    exports.Syntax = Syntax;
                    exports.traverse = traverse;
                    exports.replace = replace;
                    exports.attachComments = attachComments;
                    exports.VisitorKeys = VisitorKeys;
                    exports.VisitorOption = VisitorOption;
                    exports.Controller = Controller;
                    exports.cloneEnvironment = function () { return clone({}); };
                    return exports;
                }(exports));
            }, { "./package.json": 97 }], 97: [function (_dereq_, module, exports) {
                module.exports = { "name": "estraverse", "version": "4.2.0" };
            }, {}], 98: [function (_dereq_, module, exports) {
                function EventEmitter() {
                    this._events = this._events || {};
                    this._maxListeners = this._maxListeners || undefined;
                }
                module.exports = EventEmitter;
                EventEmitter.EventEmitter = EventEmitter;
                EventEmitter.prototype._events = undefined;
                EventEmitter.prototype._maxListeners = undefined;
                EventEmitter.defaultMaxListeners = 10;
                EventEmitter.prototype.setMaxListeners = function (n) {
                    if (!isNumber(n) || n < 0 || isNaN(n))
                        throw TypeError('n must be a positive number');
                    this._maxListeners = n;
                    return this;
                };
                EventEmitter.prototype.emit = function (type) {
                    var er, handler, len, args, i, listeners;
                    if (!this._events)
                        this._events = {};
                    if (type === 'error') {
                        if (!this._events.error ||
                            (isObject(this._events.error) && !this._events.error.length)) {
                            er = arguments[1];
                            if (er instanceof Error) {
                                throw er;
                            }
                            else {
                                var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
                                err.context = er;
                                throw err;
                            }
                        }
                    }
                    handler = this._events[type];
                    if (isUndefined(handler))
                        return false;
                    if (isFunction(handler)) {
                        switch (arguments.length) {
                            case 1:
                                handler.call(this);
                                break;
                            case 2:
                                handler.call(this, arguments[1]);
                                break;
                            case 3:
                                handler.call(this, arguments[1], arguments[2]);
                                break;
                            default:
                                args = Array.prototype.slice.call(arguments, 1);
                                handler.apply(this, args);
                        }
                    }
                    else if (isObject(handler)) {
                        args = Array.prototype.slice.call(arguments, 1);
                        listeners = handler.slice();
                        len = listeners.length;
                        for (i = 0; i < len; i++)
                            listeners[i].apply(this, args);
                    }
                    return true;
                };
                EventEmitter.prototype.addListener = function (type, listener) {
                    var m;
                    if (!isFunction(listener))
                        throw TypeError('listener must be a function');
                    if (!this._events)
                        this._events = {};
                    if (this._events.newListener)
                        this.emit('newListener', type, isFunction(listener.listener) ?
                            listener.listener : listener);
                    if (!this._events[type])
                        this._events[type] = listener;
                    else if (isObject(this._events[type]))
                        this._events[type].push(listener);
                    else
                        this._events[type] = [this._events[type], listener];
                    if (isObject(this._events[type]) && !this._events[type].warned) {
                        if (!isUndefined(this._maxListeners)) {
                            m = this._maxListeners;
                        }
                        else {
                            m = EventEmitter.defaultMaxListeners;
                        }
                        if (m && m > 0 && this._events[type].length > m) {
                            this._events[type].warned = true;
                            console.error('(node) warning: possible EventEmitter memory ' +
                                'leak detected. %d listeners added. ' +
                                'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
                            if (typeof console.trace === 'function') {
                                console.trace();
                            }
                        }
                    }
                    return this;
                };
                EventEmitter.prototype.on = EventEmitter.prototype.addListener;
                EventEmitter.prototype.once = function (type, listener) {
                    if (!isFunction(listener))
                        throw TypeError('listener must be a function');
                    var fired = false;
                    function g() {
                        this.removeListener(type, g);
                        if (!fired) {
                            fired = true;
                            listener.apply(this, arguments);
                        }
                    }
                    g.listener = listener;
                    this.on(type, g);
                    return this;
                };
                EventEmitter.prototype.removeListener = function (type, listener) {
                    var list, position, length, i;
                    if (!isFunction(listener))
                        throw TypeError('listener must be a function');
                    if (!this._events || !this._events[type])
                        return this;
                    list = this._events[type];
                    length = list.length;
                    position = -1;
                    if (list === listener ||
                        (isFunction(list.listener) && list.listener === listener)) {
                        delete this._events[type];
                        if (this._events.removeListener)
                            this.emit('removeListener', type, listener);
                    }
                    else if (isObject(list)) {
                        for (i = length; i-- > 0;) {
                            if (list[i] === listener ||
                                (list[i].listener && list[i].listener === listener)) {
                                position = i;
                                break;
                            }
                        }
                        if (position < 0)
                            return this;
                        if (list.length === 1) {
                            list.length = 0;
                            delete this._events[type];
                        }
                        else {
                            list.splice(position, 1);
                        }
                        if (this._events.removeListener)
                            this.emit('removeListener', type, listener);
                    }
                    return this;
                };
                EventEmitter.prototype.removeAllListeners = function (type) {
                    var key, listeners;
                    if (!this._events)
                        return this;
                    if (!this._events.removeListener) {
                        if (arguments.length === 0)
                            this._events = {};
                        else if (this._events[type])
                            delete this._events[type];
                        return this;
                    }
                    if (arguments.length === 0) {
                        for (key in this._events) {
                            if (key === 'removeListener')
                                continue;
                            this.removeAllListeners(key);
                        }
                        this.removeAllListeners('removeListener');
                        this._events = {};
                        return this;
                    }
                    listeners = this._events[type];
                    if (isFunction(listeners)) {
                        this.removeListener(type, listeners);
                    }
                    else if (listeners) {
                        while (listeners.length)
                            this.removeListener(type, listeners[listeners.length - 1]);
                    }
                    delete this._events[type];
                    return this;
                };
                EventEmitter.prototype.listeners = function (type) {
                    var ret;
                    if (!this._events || !this._events[type])
                        ret = [];
                    else if (isFunction(this._events[type]))
                        ret = [this._events[type]];
                    else
                        ret = this._events[type].slice();
                    return ret;
                };
                EventEmitter.prototype.listenerCount = function (type) {
                    if (this._events) {
                        var evlistener = this._events[type];
                        if (isFunction(evlistener))
                            return 1;
                        else if (evlistener)
                            return evlistener.length;
                    }
                    return 0;
                };
                EventEmitter.listenerCount = function (emitter, type) {
                    return emitter.listenerCount(type);
                };
                function isFunction(arg) {
                    return typeof arg === 'function';
                }
                function isNumber(arg) {
                    return typeof arg === 'number';
                }
                function isObject(arg) {
                    return typeof arg === 'object' && arg !== null;
                }
                function isUndefined(arg) {
                    return arg === void 0;
                }
            }, {}], 99: [function (_dereq_, module, exports) {
                var hasOwn = Object.prototype.hasOwnProperty;
                var toString = Object.prototype.toString;
                module.exports = function forEach(obj, fn, ctx) {
                    if (toString.call(fn) !== '[object Function]') {
                        throw new TypeError('iterator must be a function');
                    }
                    var l = obj.length;
                    if (l === +l) {
                        for (var i = 0; i < l; i++) {
                            fn.call(ctx, obj[i], i, obj);
                        }
                    }
                    else {
                        for (var k in obj) {
                            if (hasOwn.call(obj, k)) {
                                fn.call(ctx, obj[k], k, obj);
                            }
                        }
                    }
                };
            }, {}], 100: [function (_dereq_, module, exports) {
                exports.read = function (buffer, offset, isLE, mLen, nBytes) {
                    var e, m;
                    var eLen = nBytes * 8 - mLen - 1;
                    var eMax = (1 << eLen) - 1;
                    var eBias = eMax >> 1;
                    var nBits = -7;
                    var i = isLE ? (nBytes - 1) : 0;
                    var d = isLE ? -1 : 1;
                    var s = buffer[offset + i];
                    i += d;
                    e = s & ((1 << (-nBits)) - 1);
                    s >>= (-nBits);
                    nBits += eLen;
                    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) { }
                    m = e & ((1 << (-nBits)) - 1);
                    e >>= (-nBits);
                    nBits += mLen;
                    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) { }
                    if (e === 0) {
                        e = 1 - eBias;
                    }
                    else if (e === eMax) {
                        return m ? NaN : ((s ? -1 : 1) * Infinity);
                    }
                    else {
                        m = m + Math.pow(2, mLen);
                        e = e - eBias;
                    }
                    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
                };
                exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
                    var e, m, c;
                    var eLen = nBytes * 8 - mLen - 1;
                    var eMax = (1 << eLen) - 1;
                    var eBias = eMax >> 1;
                    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
                    var i = isLE ? 0 : (nBytes - 1);
                    var d = isLE ? 1 : -1;
                    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
                    value = Math.abs(value);
                    if (isNaN(value) || value === Infinity) {
                        m = isNaN(value) ? 1 : 0;
                        e = eMax;
                    }
                    else {
                        e = Math.floor(Math.log(value) / Math.LN2);
                        if (value * (c = Math.pow(2, -e)) < 1) {
                            e--;
                            c *= 2;
                        }
                        if (e + eBias >= 1) {
                            value += rt / c;
                        }
                        else {
                            value += rt * Math.pow(2, 1 - eBias);
                        }
                        if (value * c >= 2) {
                            e++;
                            c /= 2;
                        }
                        if (e + eBias >= eMax) {
                            m = 0;
                            e = eMax;
                        }
                        else if (e + eBias >= 1) {
                            m = (value * c - 1) * Math.pow(2, mLen);
                            e = e + eBias;
                        }
                        else {
                            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                            e = 0;
                        }
                    }
                    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) { }
                    e = (e << mLen) | m;
                    eLen += mLen;
                    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) { }
                    buffer[offset + i - d] |= s * 128;
                };
            }, {}], 101: [function (_dereq_, module, exports) {
                var indexOf = [].indexOf;
                module.exports = function (arr, obj) {
                    if (indexOf)
                        return arr.indexOf(obj);
                    for (var i = 0; i < arr.length; ++i) {
                        if (arr[i] === obj)
                            return i;
                    }
                    return -1;
                };
            }, {}], 102: [function (_dereq_, module, exports) {
                var toString = {}.toString;
                module.exports = Array.isArray || function (arr) {
                    return toString.call(arr) == '[object Array]';
                };
            }, {}], 103: [function (_dereq_, module, exports) {
                'use strict';
                var has = Object.prototype.hasOwnProperty;
                var toStr = Object.prototype.toString;
                var slice = Array.prototype.slice;
                var isArgs = _dereq_('./isArguments');
                var isEnumerable = Object.prototype.propertyIsEnumerable;
                var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
                var hasProtoEnumBug = isEnumerable.call(function () { }, 'prototype');
                var dontEnums = [
                    'toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'
                ];
                var equalsConstructorPrototype = function (o) {
                    var ctor = o.constructor;
                    return ctor && ctor.prototype === o;
                };
                var excludedKeys = {
                    $console: true,
                    $external: true,
                    $frame: true,
                    $frameElement: true,
                    $frames: true,
                    $innerHeight: true,
                    $innerWidth: true,
                    $outerHeight: true,
                    $outerWidth: true,
                    $pageXOffset: true,
                    $pageYOffset: true,
                    $parent: true,
                    $scrollLeft: true,
                    $scrollTop: true,
                    $scrollX: true,
                    $scrollY: true,
                    $self: true,
                    $webkitIndexedDB: true,
                    $webkitStorageInfo: true,
                    $window: true
                };
                var hasAutomationEqualityBug = (function () {
                    if (typeof window === 'undefined') {
                        return false;
                    }
                    for (var k in window) {
                        try {
                            if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
                                try {
                                    equalsConstructorPrototype(window[k]);
                                }
                                catch (e) {
                                    return true;
                                }
                            }
                        }
                        catch (e) {
                            return true;
                        }
                    }
                    return false;
                }());
                var equalsConstructorPrototypeIfNotBuggy = function (o) {
                    if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
                        return equalsConstructorPrototype(o);
                    }
                    try {
                        return equalsConstructorPrototype(o);
                    }
                    catch (e) {
                        return false;
                    }
                };
                var keysShim = function keys(object) {
                    var isObject = object !== null && typeof object === 'object';
                    var isFunction = toStr.call(object) === '[object Function]';
                    var isArguments = isArgs(object);
                    var isString = isObject && toStr.call(object) === '[object String]';
                    var theKeys = [];
                    if (!isObject && !isFunction && !isArguments) {
                        throw new TypeError('Object.keys called on a non-object');
                    }
                    var skipProto = hasProtoEnumBug && isFunction;
                    if (isString && object.length > 0 && !has.call(object, 0)) {
                        for (var i = 0; i < object.length; ++i) {
                            theKeys.push(String(i));
                        }
                    }
                    if (isArguments && object.length > 0) {
                        for (var j = 0; j < object.length; ++j) {
                            theKeys.push(String(j));
                        }
                    }
                    else {
                        for (var name in object) {
                            if (!(skipProto && name === 'prototype') && has.call(object, name)) {
                                theKeys.push(String(name));
                            }
                        }
                    }
                    if (hasDontEnumBug) {
                        var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
                        for (var k = 0; k < dontEnums.length; ++k) {
                            if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
                                theKeys.push(dontEnums[k]);
                            }
                        }
                    }
                    return theKeys;
                };
                keysShim.shim = function shimObjectKeys() {
                    if (Object.keys) {
                        var keysWorksWithArguments = (function () {
                            return (Object.keys(arguments) || '').length === 2;
                        }(1, 2));
                        if (!keysWorksWithArguments) {
                            var originalKeys = Object.keys;
                            Object.keys = function keys(object) {
                                if (isArgs(object)) {
                                    return originalKeys(slice.call(object));
                                }
                                else {
                                    return originalKeys(object);
                                }
                            };
                        }
                    }
                    else {
                        Object.keys = keysShim;
                    }
                    return Object.keys || keysShim;
                };
                module.exports = keysShim;
            }, { "./isArguments": 104 }], 104: [function (_dereq_, module, exports) {
                'use strict';
                var toStr = Object.prototype.toString;
                module.exports = function isArguments(value) {
                    var str = toStr.call(value);
                    var isArgs = str === '[object Arguments]';
                    if (!isArgs) {
                        isArgs = str !== '[object Array]' &&
                            value !== null &&
                            typeof value === 'object' &&
                            typeof value.length === 'number' &&
                            value.length >= 0 &&
                            toStr.call(value.callee) === '[object Function]';
                    }
                    return isArgs;
                };
            }, {}], 105: [function (_dereq_, module, exports) {
                module.exports = _dereq_('./lib/create-formatter');
            }, { "./lib/create-formatter": 106 }], 106: [function (_dereq_, module, exports) {
                'use strict';
                var assign = _dereq_('core-js/library/fn/object/assign');
                var ContextTraversal = _dereq_('power-assert-context-traversal');
                var LegacyContextTraversal = _dereq_('./legacy-context-traversal');
                var StringWriter = _dereq_('./string-writer');
                var defaultOptions = _dereq_('./default-options');
                var reduce = _dereq_('core-js/library/fn/array/reduce');
                function createFormatter(options) {
                    var formatterConfig = assign({}, defaultOptions(), options);
                    var reducers = formatterConfig.reducers || [];
                    var rendererConfigs = formatterConfig.renderers;
                    var len = rendererConfigs.length;
                    return function (powerAssertContext) {
                        var context = reduce(reducers, function (prevContext, reducer) {
                            return reducer(prevContext);
                        }, powerAssertContext);
                        var writer = new StringWriter(formatterConfig);
                        var traversal;
                        if (formatterConfig.legacy) {
                            traversal = new LegacyContextTraversal(context);
                            traversal.setWritable(writer);
                        }
                        else {
                            traversal = new ContextTraversal(context);
                        }
                        for (var i = 0; i < len; i += 1) {
                            var RendererClass;
                            var renderer;
                            var config = rendererConfigs[i];
                            if (typeof config === 'object') {
                                RendererClass = config.ctor;
                                renderer = new RendererClass(config.options);
                            }
                            else if (typeof config === 'function') {
                                RendererClass = config;
                                renderer = new RendererClass();
                            }
                            renderer.init(traversal);
                            if (typeof renderer.setWritable === 'function') {
                                renderer.setWritable(writer);
                            }
                        }
                        traversal.traverse();
                        writer.write('');
                        return writer.toString();
                    };
                }
                createFormatter.StringWriter = StringWriter;
                module.exports = createFormatter;
            }, { "./default-options": 107, "./legacy-context-traversal": 108, "./string-writer": 109, "core-js/library/fn/array/reduce": 17, "core-js/library/fn/object/assign": 19, "power-assert-context-traversal": 111 }], 107: [function (_dereq_, module, exports) {
                'use strict';
                module.exports = function defaultOptions() {
                    return {
                        reducers: [],
                        legacy: false,
                        outputOffset: 2,
                        lineSeparator: '\n'
                    };
                };
            }, {}], 108: [function (_dereq_, module, exports) {
                'use strict';
                var ContextTraversal = _dereq_('power-assert-context-traversal');
                var inherits = _dereq_('util').inherits;
                var slice = Array.prototype.slice;
                function LegacyContextTraversal(powerAssertContext) {
                    ContextTraversal.call(this, powerAssertContext);
                }
                inherits(LegacyContextTraversal, ContextTraversal);
                LegacyContextTraversal.prototype.setWritable = function (writer) {
                    this.writer = writer;
                };
                LegacyContextTraversal.prototype.on = function () {
                    var args = slice.apply(arguments);
                    if (args[0] === 'render') {
                        args[0] = 'end';
                    }
                    ContextTraversal.prototype.on.apply(this, args);
                };
                LegacyContextTraversal.prototype.emit = function () {
                    var args = slice.apply(arguments);
                    if (args[0] === 'end') {
                        args[1] = this.writer;
                    }
                    ContextTraversal.prototype.emit.apply(this, args);
                };
                module.exports = LegacyContextTraversal;
            }, { "power-assert-context-traversal": 111, "util": 134 }], 109: [function (_dereq_, module, exports) {
                'use strict';
                function spacerStr(len) {
                    var str = '';
                    for (var i = 0; i < len; i += 1) {
                        str += ' ';
                    }
                    return str;
                }
                function StringWriter(config) {
                    this.lines = [];
                    this.lineSeparator = config.lineSeparator;
                    this.regex = new RegExp(this.lineSeparator, 'g');
                    this.spacer = spacerStr(config.outputOffset);
                }
                StringWriter.prototype.write = function (str) {
                    this.lines.push(this.spacer + str.replace(this.regex, this.lineSeparator + this.spacer));
                };
                StringWriter.prototype.toString = function () {
                    var str = this.lines.join(this.lineSeparator);
                    this.lines.length = 0;
                    return str;
                };
                module.exports = StringWriter;
            }, {}], 110: [function (_dereq_, module, exports) {
                'use strict';
                var parser = _dereq_('acorn');
                _dereq_('acorn-es7-plugin')(parser);
                var estraverse = _dereq_('estraverse');
                var purifyAst = _dereq_('espurify').customize({ extra: ['range'] });
                var assign = _dereq_('core-js/library/fn/object/assign');
                module.exports = function (powerAssertContext) {
                    var source = powerAssertContext.source;
                    if (source.ast && source.tokens && source.visitorKeys) {
                        return powerAssertContext;
                    }
                    var astAndTokens;
                    try {
                        astAndTokens = parse(source);
                    }
                    catch (e) {
                        return assign({}, powerAssertContext, { source: assign({}, source, { error: e }) });
                    }
                    var newSource = assign({}, source, {
                        ast: purifyAst(astAndTokens.expression),
                        tokens: astAndTokens.tokens,
                        visitorKeys: estraverse.VisitorKeys
                    });
                    return assign({}, powerAssertContext, { source: newSource });
                };
                function parserOptions(tokens) {
                    return {
                        sourceType: 'module',
                        ecmaVersion: 2017,
                        locations: true,
                        ranges: false,
                        onToken: tokens,
                        plugins: { asyncawait: true }
                    };
                }
                function parse(source) {
                    var code = source.content;
                    var ast, tokens;
                    function doParse(wrapper) {
                        var content = wrapper ? wrapper(code) : code;
                        var tokenBag = [];
                        ast = parser.parse(content, parserOptions(tokenBag));
                        if (wrapper) {
                            ast = ast.body[0].body;
                            tokens = tokenBag.slice(6, -2);
                        }
                        else {
                            tokens = tokenBag.slice(0, -1);
                        }
                    }
                    if (source.async) {
                        doParse(wrappedInAsync);
                    }
                    else if (source.generator) {
                        doParse(wrappedInGenerator);
                    }
                    else {
                        doParse();
                    }
                    var exp = ast.body[0].expression;
                    var columnOffset = exp.loc.start.column;
                    var offsetTree = estraverse.replace(exp, {
                        keys: estraverse.VisitorKeys,
                        enter: function (eachNode) {
                            if (!eachNode.loc && eachNode.range) {
                                return eachNode;
                            }
                            eachNode.range = [
                                eachNode.loc.start.column - columnOffset,
                                eachNode.loc.end.column - columnOffset
                            ];
                            delete eachNode.loc;
                            return eachNode;
                        }
                    });
                    return {
                        tokens: offsetAndSlimDownTokens(tokens),
                        expression: offsetTree
                    };
                }
                function wrappedInGenerator(jsCode) {
                    return 'function *wrapper() { ' + jsCode + ' }';
                }
                function wrappedInAsync(jsCode) {
                    return 'async function wrapper() { ' + jsCode + ' }';
                }
                function offsetAndSlimDownTokens(tokens) {
                    var i, token, newToken, result = [];
                    var columnOffset;
                    for (i = 0; i < tokens.length; i += 1) {
                        token = tokens[i];
                        if (i === 0) {
                            columnOffset = token.loc.start.column;
                        }
                        newToken = {
                            type: {
                                label: token.type.label
                            }
                        };
                        if (typeof token.value !== 'undefined') {
                            newToken.value = token.value;
                        }
                        newToken.range = [
                            token.loc.start.column - columnOffset,
                            token.loc.end.column - columnOffset
                        ];
                        result.push(newToken);
                    }
                    return result;
                }
            }, { "acorn": 5, "acorn-es7-plugin": 2, "core-js/library/fn/object/assign": 19, "espurify": 92, "estraverse": 96 }], 111: [function (_dereq_, module, exports) {
                module.exports = _dereq_('./lib/context-traversal');
            }, { "./lib/context-traversal": 112 }], 112: [function (_dereq_, module, exports) {
                'use strict';
                var EventEmitter = _dereq_('events').EventEmitter;
                var inherits = _dereq_('util').inherits;
                var estraverse = _dereq_('estraverse');
                var forEach = _dereq_('core-js/library/fn/array/for-each');
                var reduce = _dereq_('core-js/library/fn/array/reduce');
                var locationOf = _dereq_('./location');
                var literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;
                var assign = _dereq_('core-js/library/fn/object/assign');
                function ContextTraversal(powerAssertContext) {
                    this.powerAssertContext = powerAssertContext;
                    EventEmitter.call(this);
                }
                inherits(ContextTraversal, EventEmitter);
                ContextTraversal.prototype.traverse = function () {
                    var _this = this;
                    var source = _this.powerAssertContext.source;
                    parseIfJson(source, 'ast');
                    parseIfJson(source, 'tokens');
                    parseIfJson(source, 'visitorKeys');
                    _this.emit('start', this.powerAssertContext);
                    forEach(this.powerAssertContext.args, function (capturedArgument) {
                        onEachEsNode(capturedArgument, source, function (esNode) {
                            _this.emit('data', esNode);
                        });
                    });
                    _this.emit('end');
                };
                function parseIfJson(source, propName) {
                    if (typeof source[propName] === 'string') {
                        source[propName] = JSON.parse(source[propName]);
                    }
                }
                function onEachEsNode(capturedArgument, source, callback) {
                    var espathToValue = reduce(capturedArgument.events, function (accum, ev) {
                        accum[ev.espath] = ev.value;
                        return accum;
                    }, {});
                    var nodeStack = [];
                    estraverse.traverse(source.ast, {
                        keys: source.visitorKeys,
                        enter: function (currentNode, parentNode) {
                            var parentEsNode = (0 < nodeStack.length) ? nodeStack[nodeStack.length - 1] : null;
                            var esNode = createEsNode(this.path(), currentNode, espathToValue, source.content, source.tokens, parentEsNode);
                            nodeStack.push(esNode);
                            callback(esNode);
                        },
                        leave: function (currentNode, parentNode) {
                            nodeStack.pop();
                        }
                    });
                }
                function isLiteral(node) {
                    return literalPattern.test(node.type);
                }
                function createEsNode(path, currentNode, espathToValue, jsCode, tokens, parent) {
                    var espath = path ? path.join('/') : '';
                    return {
                        espath: espath,
                        parent: parent,
                        key: path ? path[path.length - 1] : null,
                        node: currentNode,
                        code: jsCode.slice(currentNode.range[0], currentNode.range[1]),
                        value: isLiteral(currentNode) ? currentNode.value : espathToValue[espath],
                        isCaptured: espathToValue.hasOwnProperty(espath),
                        range: locationOf(currentNode, tokens)
                    };
                }
                module.exports = ContextTraversal;
            }, { "./location": 113, "core-js/library/fn/array/for-each": 12, "core-js/library/fn/array/reduce": 17, "core-js/library/fn/object/assign": 19, "estraverse": 96, "events": 98, "util": 134 }], 113: [function (_dereq_, module, exports) {
                'use strict';
                var syntax = _dereq_('estraverse').Syntax;
                function locationOf(currentNode, tokens) {
                    switch (currentNode.type) {
                        case syntax.MemberExpression:
                            return propertyLocationOf(currentNode, tokens);
                        case syntax.CallExpression:
                            if (currentNode.callee.type === syntax.MemberExpression) {
                                return propertyLocationOf(currentNode.callee, tokens);
                            }
                            break;
                        case syntax.BinaryExpression:
                        case syntax.LogicalExpression:
                        case syntax.AssignmentExpression:
                            return infixOperatorLocationOf(currentNode, tokens);
                        default:
                            break;
                    }
                    return currentNode.range;
                }
                function propertyLocationOf(memberExpression, tokens) {
                    var prop = memberExpression.property;
                    var token;
                    if (!memberExpression.computed) {
                        return prop.range;
                    }
                    token = findLeftBracketTokenOf(memberExpression, tokens);
                    return token ? token.range : prop.range;
                }
                function infixOperatorLocationOf(expression, tokens) {
                    var token = findOperatorTokenOf(expression, tokens);
                    return token ? token.range : expression.left.range;
                }
                function findLeftBracketTokenOf(expression, tokens) {
                    var fromColumn = expression.property.range[0];
                    return searchToken(tokens, function (token, index) {
                        var prevToken;
                        if (token.range[0] === fromColumn) {
                            prevToken = tokens[index - 1];
                            if (prevToken.type.label === '[') {
                                return prevToken;
                            }
                        }
                        return undefined;
                    });
                }
                function findOperatorTokenOf(expression, tokens) {
                    var fromColumn = expression.left.range[1];
                    var toColumn = expression.right.range[0];
                    return searchToken(tokens, function (token, index) {
                        if (fromColumn < token.range[0] &&
                            token.range[1] < toColumn &&
                            token.value === expression.operator) {
                            return token;
                        }
                        return undefined;
                    });
                }
                function searchToken(tokens, predicate) {
                    var i, token, found;
                    for (i = 0; i < tokens.length; i += 1) {
                        token = tokens[i];
                        found = predicate(token, i);
                        if (found) {
                            return found;
                        }
                    }
                    return undefined;
                }
                module.exports = locationOf;
            }, { "estraverse": 96 }], 114: [function (_dereq_, module, exports) {
                'use strict';
                module.exports = _dereq_('./lib/create');
            }, { "./lib/create": 115 }], 115: [function (_dereq_, module, exports) {
                'use strict';
                var createFormatter = _dereq_('power-assert-context-formatter');
                var appendAst = _dereq_('power-assert-context-reducer-ast');
                var FileRenderer = _dereq_('power-assert-renderer-file');
                var AssertionRenderer = _dereq_('power-assert-renderer-assertion');
                var DiagramRenderer = _dereq_('power-assert-renderer-diagram');
                var ComparisonRenderer = _dereq_('power-assert-renderer-comparison');
                var defaultOptions = _dereq_('./default-options');
                var assign = _dereq_('core-js/library/fn/object/assign');
                var map = _dereq_('core-js/library/fn/array/map');
                var defaultRendererClasses = {
                    './built-in/file': FileRenderer,
                    './built-in/assertion': AssertionRenderer,
                    './built-in/diagram': DiagramRenderer,
                    './built-in/binary-expression': ComparisonRenderer
                };
                function toRendererClass(rendererName) {
                    var RendererClass;
                    if (typeof rendererName === 'function') {
                        RendererClass = rendererName;
                    }
                    else if (typeof rendererName === 'string') {
                        if (defaultRendererClasses[rendererName]) {
                            RendererClass = defaultRendererClasses[rendererName];
                        }
                        else {
                            RendererClass = _dereq_(rendererName);
                        }
                    }
                    return RendererClass;
                }
                function create(options) {
                    var config = assign(defaultOptions(), options);
                    var rendererClasses = map(config.renderers, toRendererClass);
                    var renderers = map(rendererClasses, function (clazz) {
                        return { ctor: clazz, options: config };
                    });
                    return createFormatter(assign({}, config, {
                        reducers: [
                            appendAst
                        ],
                        renderers: renderers,
                        legacy: true
                    }));
                }
                create.renderers = {
                    AssertionRenderer: AssertionRenderer,
                    FileRenderer: FileRenderer,
                    DiagramRenderer: DiagramRenderer,
                    BinaryExpressionRenderer: ComparisonRenderer
                };
                create.defaultOptions = defaultOptions;
                module.exports = create;
            }, { "./default-options": 116, "core-js/library/fn/array/map": 15, "core-js/library/fn/object/assign": 19, "power-assert-context-formatter": 105, "power-assert-context-reducer-ast": 110, "power-assert-renderer-assertion": 117, "power-assert-renderer-comparison": 119, "power-assert-renderer-diagram": 122, "power-assert-renderer-file": 124 }], 116: [function (_dereq_, module, exports) {
                'use strict';
                module.exports = function defaultOptions() {
                    return {
                        lineDiffThreshold: 5,
                        maxDepth: 1,
                        outputOffset: 2,
                        anonymous: 'Object',
                        circular: '#@Circular#',
                        lineSeparator: '\n',
                        ambiguousEastAsianCharWidth: 2,
                        renderers: [
                            './built-in/file',
                            './built-in/assertion',
                            './built-in/diagram',
                            './built-in/binary-expression'
                        ]
                    };
                };
            }, {}], 117: [function (_dereq_, module, exports) {
                'use strict';
                var BaseRenderer = _dereq_('power-assert-renderer-base');
                var stringWidth = _dereq_('power-assert-util-string-width');
                var inherits = _dereq_('util').inherits;
                function AssertionRenderer() {
                    BaseRenderer.call(this);
                }
                inherits(AssertionRenderer, BaseRenderer);
                AssertionRenderer.prototype.onStart = function (context) {
                    this.context = context;
                    this.assertionLine = context.source.content;
                };
                AssertionRenderer.prototype.onEnd = function () {
                    this.write('');
                    this.write(this.assertionLine);
                    var e = this.context.source.error;
                    if (e && e instanceof SyntaxError) {
                        var re = /Unexpected token \(1\:(\d+)\)/;
                        var matchResult = re.exec(e.message);
                        if (matchResult) {
                            var syntaxErrorIndex = Number(matchResult[1]);
                            this.renderValueAt(syntaxErrorIndex, '?');
                            this.renderValueAt(syntaxErrorIndex, '?');
                            this.renderValueAt(syntaxErrorIndex, e.toString());
                            this.renderValueAt(0, '');
                            this.renderValueAt(0, 'If you are using `babel-plugin-espower` and want to use experimental syntax in your assert(), you should set `embedAst` option to true.');
                            this.renderValueAt(0, 'see: https://github.com/power-assert-js/babel-plugin-espower#optionsembedast');
                        }
                    }
                };
                AssertionRenderer.prototype.renderValueAt = function (idx, str) {
                    var row = createRow(stringWidth(this.assertionLine), ' ');
                    replaceColumn(idx, row, str);
                    this.write(row.join(''));
                };
                function replaceColumn(columnIndex, row, str) {
                    var i, width = stringWidth(str);
                    for (i = 0; i < width; i += 1) {
                        row.splice(columnIndex + i, 1, str.charAt(i));
                    }
                }
                function createRow(numCols, initial) {
                    var row = [], i;
                    for (i = 0; i < numCols; i += 1) {
                        row[i] = initial;
                    }
                    return row;
                }
                module.exports = AssertionRenderer;
            }, { "power-assert-renderer-base": 118, "power-assert-util-string-width": 125, "util": 134 }], 118: [function (_dereq_, module, exports) {
                'use strict';
                function BaseRenderer() {
                }
                BaseRenderer.prototype.init = function (traversal) {
                    var _this = this;
                    traversal.on('start', function (context) {
                        _this.onStart(context);
                    });
                    traversal.on('data', function (esNode) {
                        _this.onData(esNode);
                    });
                    traversal.on('end', function () {
                        _this.onEnd();
                    });
                };
                BaseRenderer.prototype.setWritable = function (writable) {
                    this.writable = writable;
                };
                BaseRenderer.prototype.onStart = function (context) {
                };
                BaseRenderer.prototype.onData = function (esNode) {
                };
                BaseRenderer.prototype.onEnd = function () {
                };
                BaseRenderer.prototype.write = function (str) {
                    this.writable.write(str);
                };
                module.exports = BaseRenderer;
            }, {}], 119: [function (_dereq_, module, exports) {
                'use strict';
                var BaseRenderer = _dereq_('power-assert-renderer-base');
                var inherits = _dereq_('util').inherits;
                var typeName = _dereq_('type-name');
                var keys = _dereq_('core-js/library/fn/object/keys');
                var forEach = _dereq_('core-js/library/fn/array/for-each');
                var udiff = _dereq_('./lib/udiff');
                var stringifier = _dereq_('stringifier');
                var assign = _dereq_('core-js/library/fn/object/assign');
                var defaultOptions = _dereq_('./lib/default-options');
                var literalPattern = /^(?:String|Numeric|Null|Boolean|RegExp)?Literal$/;
                function isLiteral(node) {
                    return literalPattern.test(node.type);
                }
                function ComparisonRenderer(config) {
                    BaseRenderer.call(this);
                    this.config = assign({}, defaultOptions(), config);
                    if (typeof this.config.stringify === 'function') {
                        this.stringify = this.config.stringify;
                    }
                    else {
                        this.stringify = stringifier(this.config);
                    }
                    if (typeof this.config.diff === 'function') {
                        this.diff = this.config.diff;
                    }
                    else {
                        this.diff = udiff(this.config);
                    }
                    this.espathToPair = {};
                }
                inherits(ComparisonRenderer, BaseRenderer);
                ComparisonRenderer.prototype.onData = function (esNode) {
                    var pair;
                    if (!esNode.isCaptured) {
                        if (isTargetBinaryExpression(esNode.parent) && isLiteral(esNode.node)) {
                            this.espathToPair[esNode.parent.espath][esNode.key] = { code: esNode.code, value: esNode.value };
                        }
                        return;
                    }
                    if (isTargetBinaryExpression(esNode.parent)) {
                        this.espathToPair[esNode.parent.espath][esNode.key] = { code: esNode.code, value: esNode.value };
                    }
                    if (isTargetBinaryExpression(esNode)) {
                        pair = {
                            operator: esNode.node.operator,
                            value: esNode.value
                        };
                        this.espathToPair[esNode.espath] = pair;
                    }
                };
                ComparisonRenderer.prototype.onEnd = function () {
                    var _this = this;
                    var pairs = [];
                    forEach(keys(this.espathToPair), function (espath) {
                        var pair = _this.espathToPair[espath];
                        if (pair.left && pair.right) {
                            pairs.push(pair);
                        }
                    });
                    forEach(pairs, function (pair) {
                        _this.compare(pair);
                    });
                };
                ComparisonRenderer.prototype.compare = function (pair) {
                    if (isStringDiffTarget(pair)) {
                        this.showStringDiff(pair);
                    }
                    else {
                        this.showExpectedAndActual(pair);
                    }
                };
                ComparisonRenderer.prototype.showExpectedAndActual = function (pair) {
                    this.write('');
                    this.write('[' + typeName(pair.right.value) + '] ' + pair.right.code);
                    this.write('=> ' + this.stringify(pair.right.value));
                    this.write('[' + typeName(pair.left.value) + '] ' + pair.left.code);
                    this.write('=> ' + this.stringify(pair.left.value));
                };
                ComparisonRenderer.prototype.showStringDiff = function (pair) {
                    this.write('');
                    this.write('--- [string] ' + pair.right.code);
                    this.write('+++ [string] ' + pair.left.code);
                    this.write(this.diff(pair.right.value, pair.left.value, this.config));
                };
                function isTargetBinaryExpression(esNode) {
                    return esNode &&
                        esNode.node.type === 'BinaryExpression' &&
                        (esNode.node.operator === '===' || esNode.node.operator === '==') &&
                        esNode.isCaptured &&
                        !(esNode.value);
                }
                function isStringDiffTarget(pair) {
                    return typeof pair.left.value === 'string' && typeof pair.right.value === 'string';
                }
                ComparisonRenderer.udiff = udiff;
                module.exports = ComparisonRenderer;
            }, { "./lib/default-options": 120, "./lib/udiff": 121, "core-js/library/fn/array/for-each": 12, "core-js/library/fn/object/assign": 19, "core-js/library/fn/object/keys": 22, "power-assert-renderer-base": 118, "stringifier": 127, "type-name": 130, "util": 134 }], 120: [function (_dereq_, module, exports) {
                'use strict';
                module.exports = function defaultOptions() {
                    return {
                        lineDiffThreshold: 5,
                        maxDepth: 2,
                        indent: null,
                        outputOffset: 2,
                        anonymous: 'Object',
                        circular: '#@Circular#',
                        lineSeparator: '\n'
                    };
                };
            }, {}], 121: [function (_dereq_, module, exports) {
                'use strict';
                var DiffMatchPatch = _dereq_('diff-match-patch');
                var dmp = new DiffMatchPatch();
                function udiff(config) {
                    return function diff(text1, text2) {
                        var patch;
                        if (config && shouldUseLineLevelDiff(text1, config)) {
                            patch = udiffLines(text1, text2);
                        }
                        else {
                            patch = udiffChars(text1, text2);
                        }
                        return decodeURIComponent(patch);
                    };
                }
                function shouldUseLineLevelDiff(text, config) {
                    return config.lineDiffThreshold < text.split(/\r\n|\r|\n/).length;
                }
                function udiffLines(text1, text2) {
                    var a = dmp.diff_linesToChars_(text1, text2);
                    var diffs = dmp.diff_main(a.chars1, a.chars2, false);
                    dmp.diff_charsToLines_(diffs, a.lineArray);
                    dmp.diff_cleanupSemantic(diffs);
                    return dmp.patch_toText(dmp.patch_make(text1, diffs));
                }
                function udiffChars(text1, text2) {
                    var diffs = dmp.diff_main(text1, text2, false);
                    dmp.diff_cleanupSemantic(diffs);
                    return dmp.patch_toText(dmp.patch_make(text1, diffs));
                }
                module.exports = udiff;
            }, { "diff-match-patch": 81 }], 122: [function (_dereq_, module, exports) {
                'use strict';
                var BaseRenderer = _dereq_('power-assert-renderer-base');
                var inherits = _dereq_('util').inherits;
                var forEach = _dereq_('core-js/library/fn/array/for-each');
                var stringifier = _dereq_('stringifier');
                var stringWidth = _dereq_('power-assert-util-string-width');
                var assign = _dereq_('core-js/library/fn/object/assign');
                var defaultOptions = _dereq_('./lib/default-options');
                function DiagramRenderer(config) {
                    BaseRenderer.call(this);
                    this.config = assign({}, defaultOptions(), config);
                    this.events = [];
                    if (typeof this.config.stringify === 'function') {
                        this.stringify = this.config.stringify;
                    }
                    else {
                        this.stringify = stringifier(this.config);
                    }
                    if (typeof this.config.widthOf === 'function') {
                        this.widthOf = this.config.widthOf;
                    }
                    else {
                        this.widthOf = (this.config.ambiguousEastAsianCharWidth === 1) ? stringWidth.narrow : stringWidth;
                    }
                    this.initialVertivalBarLength = 1;
                }
                inherits(DiagramRenderer, BaseRenderer);
                DiagramRenderer.prototype.onStart = function (context) {
                    this.assertionLine = context.source.content;
                    this.initializeRows();
                };
                DiagramRenderer.prototype.onData = function (esNode) {
                    if (!esNode.isCaptured) {
                        return;
                    }
                    this.events.push({ value: esNode.value, leftIndex: esNode.range[0] });
                };
                DiagramRenderer.prototype.onEnd = function () {
                    this.events.sort(rightToLeft);
                    this.constructRows(this.events);
                    var _this = this;
                    forEach(this.rows, function (columns) {
                        _this.write(columns.join(''));
                    });
                };
                DiagramRenderer.prototype.initializeRows = function () {
                    this.rows = [];
                    for (var i = 0; i <= this.initialVertivalBarLength; i += 1) {
                        this.addOneMoreRow();
                    }
                };
                DiagramRenderer.prototype.newRowFor = function (assertionLine) {
                    return createRow(this.widthOf(assertionLine), ' ');
                };
                DiagramRenderer.prototype.addOneMoreRow = function () {
                    this.rows.push(this.newRowFor(this.assertionLine));
                };
                DiagramRenderer.prototype.lastRow = function () {
                    return this.rows[this.rows.length - 1];
                };
                DiagramRenderer.prototype.renderVerticalBarAt = function (columnIndex) {
                    var i, lastRowIndex = this.rows.length - 1;
                    for (i = 0; i < lastRowIndex; i += 1) {
                        this.rows[i].splice(columnIndex, 1, '|');
                    }
                };
                DiagramRenderer.prototype.renderValueAt = function (columnIndex, dumpedValue) {
                    var i, width = this.widthOf(dumpedValue);
                    for (i = 0; i < width; i += 1) {
                        this.lastRow().splice(columnIndex + i, 1, dumpedValue.charAt(i));
                    }
                };
                DiagramRenderer.prototype.isOverlapped = function (prevCapturing, nextCaputuring, dumpedValue) {
                    return (typeof prevCapturing !== 'undefined') && this.startColumnFor(prevCapturing) <= (this.startColumnFor(nextCaputuring) + this.widthOf(dumpedValue));
                };
                DiagramRenderer.prototype.constructRows = function (capturedEvents) {
                    var that = this;
                    var prevCaptured;
                    forEach(capturedEvents, function (captured) {
                        var dumpedValue = that.stringify(captured.value);
                        if (that.isOverlapped(prevCaptured, captured, dumpedValue)) {
                            that.addOneMoreRow();
                        }
                        that.renderVerticalBarAt(that.startColumnFor(captured));
                        that.renderValueAt(that.startColumnFor(captured), dumpedValue);
                        prevCaptured = captured;
                    });
                };
                DiagramRenderer.prototype.startColumnFor = function (captured) {
                    return this.widthOf(this.assertionLine.slice(0, captured.leftIndex));
                };
                function createRow(numCols, initial) {
                    var row = [], i;
                    for (i = 0; i < numCols; i += 1) {
                        row[i] = initial;
                    }
                    return row;
                }
                function rightToLeft(a, b) {
                    return b.leftIndex - a.leftIndex;
                }
                module.exports = DiagramRenderer;
            }, { "./lib/default-options": 123, "core-js/library/fn/array/for-each": 12, "core-js/library/fn/object/assign": 19, "power-assert-renderer-base": 118, "power-assert-util-string-width": 125, "stringifier": 127, "util": 134 }], 123: [function (_dereq_, module, exports) {
                'use strict';
                module.exports = function defaultOptions() {
                    return {
                        ambiguousEastAsianCharWidth: 2,
                        maxDepth: 2,
                        indent: null,
                        outputOffset: 2,
                        anonymous: 'Object',
                        circular: '#@Circular#',
                        lineSeparator: '\n'
                    };
                };
            }, {}], 124: [function (_dereq_, module, exports) {
                'use strict';
                var BaseRenderer = _dereq_('power-assert-renderer-base');
                var inherits = _dereq_('util').inherits;
                function FileRenderer() {
                    BaseRenderer.call(this);
                }
                inherits(FileRenderer, BaseRenderer);
                FileRenderer.prototype.onStart = function (context) {
                    this.filepath = context.source.filepath;
                    this.lineNumber = context.source.line;
                };
                FileRenderer.prototype.onEnd = function () {
                    if (this.filepath) {
                        this.write('# ' + [this.filepath, this.lineNumber].join(':'));
                    }
                    else {
                        this.write('# at line: ' + this.lineNumber);
                    }
                };
                module.exports = FileRenderer;
            }, { "power-assert-renderer-base": 118, "util": 134 }], 125: [function (_dereq_, module, exports) {
                'use strict';
                var eaw = _dereq_('eastasianwidth');
                function stringWidth(ambiguousCharWidth) {
                    return function widthOf(str) {
                        var i, code, width = 0;
                        for (i = 0; i < str.length; i += 1) {
                            code = eaw.eastAsianWidth(str.charAt(i));
                            switch (code) {
                                case 'F':
                                case 'W':
                                    width += 2;
                                    break;
                                case 'H':
                                case 'Na':
                                case 'N':
                                    width += 1;
                                    break;
                                case 'A':
                                    width += ambiguousCharWidth;
                                    break;
                            }
                        }
                        return width;
                    };
                }
                module.exports = stringWidth(2);
                module.exports.narrow = stringWidth(1);
            }, { "eastasianwidth": 82 }], 126: [function (_dereq_, module, exports) {
                var process = module.exports = {};
                var cachedSetTimeout;
                var cachedClearTimeout;
                function defaultSetTimout() {
                    throw new Error('setTimeout has not been defined');
                }
                function defaultClearTimeout() {
                    throw new Error('clearTimeout has not been defined');
                }
                (function () {
                    try {
                        if (typeof setTimeout === 'function') {
                            cachedSetTimeout = setTimeout;
                        }
                        else {
                            cachedSetTimeout = defaultSetTimout;
                        }
                    }
                    catch (e) {
                        cachedSetTimeout = defaultSetTimout;
                    }
                    try {
                        if (typeof clearTimeout === 'function') {
                            cachedClearTimeout = clearTimeout;
                        }
                        else {
                            cachedClearTimeout = defaultClearTimeout;
                        }
                    }
                    catch (e) {
                        cachedClearTimeout = defaultClearTimeout;
                    }
                }());
                function runTimeout(fun) {
                    if (cachedSetTimeout === setTimeout) {
                        return setTimeout(fun, 0);
                    }
                    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                        cachedSetTimeout = setTimeout;
                        return setTimeout(fun, 0);
                    }
                    try {
                        return cachedSetTimeout(fun, 0);
                    }
                    catch (e) {
                        try {
                            return cachedSetTimeout.call(null, fun, 0);
                        }
                        catch (e) {
                            return cachedSetTimeout.call(this, fun, 0);
                        }
                    }
                }
                function runClearTimeout(marker) {
                    if (cachedClearTimeout === clearTimeout) {
                        return clearTimeout(marker);
                    }
                    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                        cachedClearTimeout = clearTimeout;
                        return clearTimeout(marker);
                    }
                    try {
                        return cachedClearTimeout(marker);
                    }
                    catch (e) {
                        try {
                            return cachedClearTimeout.call(null, marker);
                        }
                        catch (e) {
                            return cachedClearTimeout.call(this, marker);
                        }
                    }
                }
                var queue = [];
                var draining = false;
                var currentQueue;
                var queueIndex = -1;
                function cleanUpNextTick() {
                    if (!draining || !currentQueue) {
                        return;
                    }
                    draining = false;
                    if (currentQueue.length) {
                        queue = currentQueue.concat(queue);
                    }
                    else {
                        queueIndex = -1;
                    }
                    if (queue.length) {
                        drainQueue();
                    }
                }
                function drainQueue() {
                    if (draining) {
                        return;
                    }
                    var timeout = runTimeout(cleanUpNextTick);
                    draining = true;
                    var len = queue.length;
                    while (len) {
                        currentQueue = queue;
                        queue = [];
                        while (++queueIndex < len) {
                            if (currentQueue) {
                                currentQueue[queueIndex].run();
                            }
                        }
                        queueIndex = -1;
                        len = queue.length;
                    }
                    currentQueue = null;
                    draining = false;
                    runClearTimeout(timeout);
                }
                process.nextTick = function (fun) {
                    var args = new Array(arguments.length - 1);
                    if (arguments.length > 1) {
                        for (var i = 1; i < arguments.length; i++) {
                            args[i - 1] = arguments[i];
                        }
                    }
                    queue.push(new Item(fun, args));
                    if (queue.length === 1 && !draining) {
                        runTimeout(drainQueue);
                    }
                };
                function Item(fun, array) {
                    this.fun = fun;
                    this.array = array;
                }
                Item.prototype.run = function () {
                    this.fun.apply(null, this.array);
                };
                process.title = 'browser';
                process.browser = true;
                process.env = {};
                process.argv = [];
                process.version = '';
                process.versions = {};
                function noop() { }
                process.on = noop;
                process.addListener = noop;
                process.once = noop;
                process.off = noop;
                process.removeListener = noop;
                process.removeAllListeners = noop;
                process.emit = noop;
                process.prependListener = noop;
                process.prependOnceListener = noop;
                process.listeners = function (name) { return []; };
                process.binding = function (name) {
                    throw new Error('process.binding is not supported');
                };
                process.cwd = function () { return '/'; };
                process.chdir = function (dir) {
                    throw new Error('process.chdir is not supported');
                };
                process.umask = function () { return 0; };
            }, {}], 127: [function (_dereq_, module, exports) {
                'use strict';
                var traverse = _dereq_('traverse');
                var typeName = _dereq_('type-name');
                var assign = _dereq_('core-js/library/fn/object/assign');
                var s = _dereq_('./strategies');
                function defaultHandlers() {
                    return {
                        'null': s.always('null'),
                        'undefined': s.always('undefined'),
                        'function': s.prune(),
                        'string': s.json(),
                        'boolean': s.json(),
                        'number': s.number(),
                        'symbol': s.toStr(),
                        'RegExp': s.toStr(),
                        'String': s.newLike(),
                        'Boolean': s.newLike(),
                        'Number': s.newLike(),
                        'Date': s.newLike(),
                        'Array': s.array(),
                        'Object': s.object(),
                        '@default': s.object()
                    };
                }
                function defaultOptions() {
                    return {
                        maxDepth: null,
                        indent: null,
                        anonymous: '@Anonymous',
                        circular: '#@Circular#',
                        snip: '..(snip)',
                        lineSeparator: '\n',
                        typeFun: typeName
                    };
                }
                function createStringifier(customOptions) {
                    var options = assign({}, defaultOptions(), customOptions);
                    var handlers = assign({}, defaultHandlers(), options.handlers);
                    return function stringifyAny(push, x) {
                        var context = this;
                        var handler = handlerFor(context.node, options, handlers);
                        var currentPath = '/' + context.path.join('/');
                        var customization = handlers[currentPath];
                        var acc = {
                            context: context,
                            options: options,
                            handlers: handlers,
                            push: push
                        };
                        if (typeName(customization) === 'function') {
                            handler = customization;
                        }
                        else if (typeName(customization) === 'number') {
                            handler = s.flow.compose(s.filters.truncate(customization), handler);
                        }
                        else if (context.parent && typeName(context.parent.node) === 'Array' && !(context.key in context.parent.node)) {
                            handler = s.always('');
                        }
                        handler(acc, x);
                        return push;
                    };
                }
                function handlerFor(val, options, handlers) {
                    var tname = options.typeFun(val);
                    if (typeName(handlers[tname]) === 'function') {
                        return handlers[tname];
                    }
                    return handlers['@default'];
                }
                function walk(val, reducer) {
                    var buffer = [];
                    var push = function (str) {
                        buffer.push(str);
                    };
                    traverse(val).reduce(reducer, push);
                    return buffer.join('');
                }
                function stringify(val, options) {
                    return walk(val, createStringifier(options));
                }
                function stringifier(options) {
                    return function (val) {
                        return walk(val, createStringifier(options));
                    };
                }
                stringifier.stringify = stringify;
                stringifier.strategies = s;
                stringifier.defaultOptions = defaultOptions;
                stringifier.defaultHandlers = defaultHandlers;
                module.exports = stringifier;
            }, { "./strategies": 128, "core-js/library/fn/object/assign": 19, "traverse": 129, "type-name": 130 }], 128: [function (_dereq_, module, exports) {
                'use strict';
                var typeName = _dereq_('type-name');
                var forEach = _dereq_('core-js/library/fn/array/for-each');
                var arrayFilter = _dereq_('core-js/library/fn/array/filter');
                var reduceRight = _dereq_('core-js/library/fn/array/reduce-right');
                var indexOf = _dereq_('core-js/library/fn/array/index-of');
                var slice = Array.prototype.slice;
                var END = {};
                var ITERATE = {};
                function compose() {
                    var filters = slice.apply(arguments);
                    return reduceRight(filters, function (right, left) {
                        return left(right);
                    });
                }
                function end() {
                    return function (acc, x) {
                        acc.context.keys = [];
                        return END;
                    };
                }
                function iterate() {
                    return function (acc, x) {
                        return ITERATE;
                    };
                }
                function filter(predicate) {
                    return function (next) {
                        return function (acc, x) {
                            var toBeIterated;
                            var isIteratingArray = (typeName(x) === 'Array');
                            if (typeName(predicate) === 'function') {
                                toBeIterated = [];
                                forEach(acc.context.keys, function (key) {
                                    var indexOrKey = isIteratingArray ? parseInt(key, 10) : key;
                                    var kvp = {
                                        key: indexOrKey,
                                        value: x[key]
                                    };
                                    var decision = predicate(kvp);
                                    if (decision) {
                                        toBeIterated.push(key);
                                    }
                                    if (typeName(decision) === 'number') {
                                        truncateByKey(decision, key, acc);
                                    }
                                    if (typeName(decision) === 'function') {
                                        customizeStrategyForKey(decision, key, acc);
                                    }
                                });
                                acc.context.keys = toBeIterated;
                            }
                            return next(acc, x);
                        };
                    };
                }
                function customizeStrategyForKey(strategy, key, acc) {
                    acc.handlers[currentPath(key, acc)] = strategy;
                }
                function truncateByKey(size, key, acc) {
                    acc.handlers[currentPath(key, acc)] = size;
                }
                function currentPath(key, acc) {
                    var pathToCurrentNode = [''].concat(acc.context.path);
                    if (typeName(key) !== 'undefined') {
                        pathToCurrentNode.push(key);
                    }
                    return pathToCurrentNode.join('/');
                }
                function allowedKeys(orderedWhiteList) {
                    return function (next) {
                        return function (acc, x) {
                            var isIteratingArray = (typeName(x) === 'Array');
                            if (!isIteratingArray && typeName(orderedWhiteList) === 'Array') {
                                acc.context.keys = arrayFilter(orderedWhiteList, function (propKey) {
                                    return indexOf(acc.context.keys, propKey) !== -1;
                                });
                            }
                            return next(acc, x);
                        };
                    };
                }
                function safeKeys() {
                    return function (next) {
                        return function (acc, x) {
                            if (typeName(x) !== 'Array') {
                                acc.context.keys = arrayFilter(acc.context.keys, function (propKey) {
                                    try {
                                        var val = x[propKey];
                                        return true;
                                    }
                                    catch (e) {
                                        return false;
                                    }
                                });
                            }
                            return next(acc, x);
                        };
                    };
                }
                function arrayIndicesToKeys() {
                    return function (next) {
                        return function (acc, x) {
                            if (typeName(x) === 'Array' && 0 < x.length) {
                                var indices = Array(x.length);
                                for (var i = 0; i < x.length; i += 1) {
                                    indices[i] = String(i);
                                }
                                acc.context.keys = indices;
                            }
                            return next(acc, x);
                        };
                    };
                }
                function when(guard, then) {
                    return function (next) {
                        return function (acc, x) {
                            var kvp = {
                                key: acc.context.key,
                                value: x
                            };
                            if (guard(kvp, acc)) {
                                return then(acc, x);
                            }
                            return next(acc, x);
                        };
                    };
                }
                function truncate(size) {
                    return function (next) {
                        return function (acc, x) {
                            var orig = acc.push;
                            var ret;
                            acc.push = function (str) {
                                var savings = str.length - size;
                                var truncated;
                                if (savings <= size) {
                                    orig.call(acc, str);
                                }
                                else {
                                    truncated = str.substring(0, size);
                                    orig.call(acc, truncated + acc.options.snip);
                                }
                            };
                            ret = next(acc, x);
                            acc.push = orig;
                            return ret;
                        };
                    };
                }
                function constructorName() {
                    return function (next) {
                        return function (acc, x) {
                            var name = acc.options.typeFun(x);
                            if (name === '') {
                                name = acc.options.anonymous;
                            }
                            acc.push(name);
                            return next(acc, x);
                        };
                    };
                }
                function always(str) {
                    return function (next) {
                        return function (acc, x) {
                            acc.push(str);
                            return next(acc, x);
                        };
                    };
                }
                function optionValue(key) {
                    return function (next) {
                        return function (acc, x) {
                            acc.push(acc.options[key]);
                            return next(acc, x);
                        };
                    };
                }
                function json(replacer) {
                    return function (next) {
                        return function (acc, x) {
                            acc.push(JSON.stringify(x, replacer));
                            return next(acc, x);
                        };
                    };
                }
                function toStr() {
                    return function (next) {
                        return function (acc, x) {
                            acc.push(x.toString());
                            return next(acc, x);
                        };
                    };
                }
                function decorateArray() {
                    return function (next) {
                        return function (acc, x) {
                            acc.context.before(function (node) {
                                acc.push('[');
                            });
                            acc.context.after(function (node) {
                                afterAllChildren(this, acc.push, acc.options);
                                acc.push(']');
                            });
                            acc.context.pre(function (val, key) {
                                beforeEachChild(this, acc.push, acc.options);
                            });
                            acc.context.post(function (childContext) {
                                afterEachChild(childContext, acc.push);
                            });
                            return next(acc, x);
                        };
                    };
                }
                function decorateObject() {
                    return function (next) {
                        return function (acc, x) {
                            acc.context.before(function (node) {
                                acc.push('{');
                            });
                            acc.context.after(function (node) {
                                afterAllChildren(this, acc.push, acc.options);
                                acc.push('}');
                            });
                            acc.context.pre(function (val, key) {
                                beforeEachChild(this, acc.push, acc.options);
                                acc.push(sanitizeKey(key) + (acc.options.indent ? ': ' : ':'));
                            });
                            acc.context.post(function (childContext) {
                                afterEachChild(childContext, acc.push);
                            });
                            return next(acc, x);
                        };
                    };
                }
                function sanitizeKey(key) {
                    return /^[A-Za-z_]+$/.test(key) ? key : JSON.stringify(key);
                }
                function afterAllChildren(context, push, options) {
                    if (options.indent && 0 < context.keys.length) {
                        push(options.lineSeparator);
                        for (var i = 0; i < context.level; i += 1) {
                            push(options.indent);
                        }
                    }
                }
                function beforeEachChild(context, push, options) {
                    if (options.indent) {
                        push(options.lineSeparator);
                        for (var i = 0; i <= context.level; i += 1) {
                            push(options.indent);
                        }
                    }
                }
                function afterEachChild(childContext, push) {
                    if (!childContext.isLast) {
                        push(',');
                    }
                }
                function nan(kvp, acc) {
                    return kvp.value !== kvp.value;
                }
                function positiveInfinity(kvp, acc) {
                    return !isFinite(kvp.value) && kvp.value === Infinity;
                }
                function negativeInfinity(kvp, acc) {
                    return !isFinite(kvp.value) && kvp.value !== Infinity;
                }
                function circular(kvp, acc) {
                    return acc.context.circular;
                }
                function maxDepth(kvp, acc) {
                    return (acc.options.maxDepth && acc.options.maxDepth <= acc.context.level);
                }
                var prune = compose(always('#'), constructorName(), always('#'), end());
                var omitNaN = when(nan, compose(always('NaN'), end()));
                var omitPositiveInfinity = when(positiveInfinity, compose(always('Infinity'), end()));
                var omitNegativeInfinity = when(negativeInfinity, compose(always('-Infinity'), end()));
                var omitCircular = when(circular, compose(optionValue('circular'), end()));
                var omitMaxDepth = when(maxDepth, prune);
                module.exports = {
                    filters: {
                        always: always,
                        optionValue: optionValue,
                        constructorName: constructorName,
                        json: json,
                        toStr: toStr,
                        prune: prune,
                        truncate: truncate,
                        decorateArray: decorateArray,
                        decorateObject: decorateObject
                    },
                    flow: {
                        compose: compose,
                        when: when,
                        allowedKeys: allowedKeys,
                        safeKeys: safeKeys,
                        arrayIndicesToKeys: arrayIndicesToKeys,
                        filter: filter,
                        iterate: iterate,
                        end: end
                    },
                    symbols: {
                        END: END,
                        ITERATE: ITERATE
                    },
                    always: function (str) {
                        return compose(always(str), end());
                    },
                    json: function () {
                        return compose(json(), end());
                    },
                    toStr: function () {
                        return compose(toStr(), end());
                    },
                    prune: function () {
                        return prune;
                    },
                    number: function () {
                        return compose(omitNaN, omitPositiveInfinity, omitNegativeInfinity, json(), end());
                    },
                    newLike: function () {
                        return compose(always('new '), constructorName(), always('('), json(), always(')'), end());
                    },
                    array: function (predicate) {
                        return compose(omitCircular, omitMaxDepth, decorateArray(), arrayIndicesToKeys(), filter(predicate), iterate());
                    },
                    object: function (predicate, orderedWhiteList) {
                        return compose(omitCircular, omitMaxDepth, constructorName(), decorateObject(), allowedKeys(orderedWhiteList), safeKeys(), filter(predicate), iterate());
                    }
                };
            }, { "core-js/library/fn/array/filter": 11, "core-js/library/fn/array/for-each": 12, "core-js/library/fn/array/index-of": 13, "core-js/library/fn/array/reduce-right": 16, "type-name": 130 }], 129: [function (_dereq_, module, exports) {
                var traverse = module.exports = function (obj) {
                    return new Traverse(obj);
                };
                function Traverse(obj) {
                    this.value = obj;
                }
                Traverse.prototype.get = function (ps) {
                    var node = this.value;
                    for (var i = 0; i < ps.length; i++) {
                        var key = ps[i];
                        if (!node || !hasOwnProperty.call(node, key)) {
                            node = undefined;
                            break;
                        }
                        node = node[key];
                    }
                    return node;
                };
                Traverse.prototype.has = function (ps) {
                    var node = this.value;
                    for (var i = 0; i < ps.length; i++) {
                        var key = ps[i];
                        if (!node || !hasOwnProperty.call(node, key)) {
                            return false;
                        }
                        node = node[key];
                    }
                    return true;
                };
                Traverse.prototype.set = function (ps, value) {
                    var node = this.value;
                    for (var i = 0; i < ps.length - 1; i++) {
                        var key = ps[i];
                        if (!hasOwnProperty.call(node, key))
                            node[key] = {};
                        node = node[key];
                    }
                    node[ps[i]] = value;
                    return value;
                };
                Traverse.prototype.map = function (cb) {
                    return walk(this.value, cb, true);
                };
                Traverse.prototype.forEach = function (cb) {
                    this.value = walk(this.value, cb, false);
                    return this.value;
                };
                Traverse.prototype.reduce = function (cb, init) {
                    var skip = arguments.length === 1;
                    var acc = skip ? this.value : init;
                    this.forEach(function (x) {
                        if (!this.isRoot || !skip) {
                            acc = cb.call(this, acc, x);
                        }
                    });
                    return acc;
                };
                Traverse.prototype.paths = function () {
                    var acc = [];
                    this.forEach(function (x) {
                        acc.push(this.path);
                    });
                    return acc;
                };
                Traverse.prototype.nodes = function () {
                    var acc = [];
                    this.forEach(function (x) {
                        acc.push(this.node);
                    });
                    return acc;
                };
                Traverse.prototype.clone = function () {
                    var parents = [], nodes = [];
                    return (function clone(src) {
                        for (var i = 0; i < parents.length; i++) {
                            if (parents[i] === src) {
                                return nodes[i];
                            }
                        }
                        if (typeof src === 'object' && src !== null) {
                            var dst = copy(src);
                            parents.push(src);
                            nodes.push(dst);
                            forEach(objectKeys(src), function (key) {
                                dst[key] = clone(src[key]);
                            });
                            parents.pop();
                            nodes.pop();
                            return dst;
                        }
                        else {
                            return src;
                        }
                    })(this.value);
                };
                function walk(root, cb, immutable) {
                    var path = [];
                    var parents = [];
                    var alive = true;
                    return (function walker(node_) {
                        var node = immutable ? copy(node_) : node_;
                        var modifiers = {};
                        var keepGoing = true;
                        var state = {
                            node: node,
                            node_: node_,
                            path: [].concat(path),
                            parent: parents[parents.length - 1],
                            parents: parents,
                            key: path.slice(-1)[0],
                            isRoot: path.length === 0,
                            level: path.length,
                            circular: null,
                            update: function (x, stopHere) {
                                if (!state.isRoot) {
                                    state.parent.node[state.key] = x;
                                }
                                state.node = x;
                                if (stopHere)
                                    keepGoing = false;
                            },
                            'delete': function (stopHere) {
                                delete state.parent.node[state.key];
                                if (stopHere)
                                    keepGoing = false;
                            },
                            remove: function (stopHere) {
                                if (isArray(state.parent.node)) {
                                    state.parent.node.splice(state.key, 1);
                                }
                                else {
                                    delete state.parent.node[state.key];
                                }
                                if (stopHere)
                                    keepGoing = false;
                            },
                            keys: null,
                            before: function (f) { modifiers.before = f; },
                            after: function (f) { modifiers.after = f; },
                            pre: function (f) { modifiers.pre = f; },
                            post: function (f) { modifiers.post = f; },
                            stop: function () { alive = false; },
                            block: function () { keepGoing = false; }
                        };
                        if (!alive)
                            return state;
                        function updateState() {
                            if (typeof state.node === 'object' && state.node !== null) {
                                if (!state.keys || state.node_ !== state.node) {
                                    state.keys = objectKeys(state.node);
                                }
                                state.isLeaf = state.keys.length == 0;
                                for (var i = 0; i < parents.length; i++) {
                                    if (parents[i].node_ === node_) {
                                        state.circular = parents[i];
                                        break;
                                    }
                                }
                            }
                            else {
                                state.isLeaf = true;
                                state.keys = null;
                            }
                            state.notLeaf = !state.isLeaf;
                            state.notRoot = !state.isRoot;
                        }
                        updateState();
                        var ret = cb.call(state, state.node);
                        if (ret !== undefined && state.update)
                            state.update(ret);
                        if (modifiers.before)
                            modifiers.before.call(state, state.node);
                        if (!keepGoing)
                            return state;
                        if (typeof state.node == 'object'
                            && state.node !== null && !state.circular) {
                            parents.push(state);
                            updateState();
                            forEach(state.keys, function (key, i) {
                                path.push(key);
                                if (modifiers.pre)
                                    modifiers.pre.call(state, state.node[key], key);
                                var child = walker(state.node[key]);
                                if (immutable && hasOwnProperty.call(state.node, key)) {
                                    state.node[key] = child.node;
                                }
                                child.isLast = i == state.keys.length - 1;
                                child.isFirst = i == 0;
                                if (modifiers.post)
                                    modifiers.post.call(state, child);
                                path.pop();
                            });
                            parents.pop();
                        }
                        if (modifiers.after)
                            modifiers.after.call(state, state.node);
                        return state;
                    })(root).node;
                }
                function copy(src) {
                    if (typeof src === 'object' && src !== null) {
                        var dst;
                        if (isArray(src)) {
                            dst = [];
                        }
                        else if (isDate(src)) {
                            dst = new Date(src.getTime ? src.getTime() : src);
                        }
                        else if (isRegExp(src)) {
                            dst = new RegExp(src);
                        }
                        else if (isError(src)) {
                            dst = { message: src.message };
                        }
                        else if (isBoolean(src)) {
                            dst = new Boolean(src);
                        }
                        else if (isNumber(src)) {
                            dst = new Number(src);
                        }
                        else if (isString(src)) {
                            dst = new String(src);
                        }
                        else if (Object.create && Object.getPrototypeOf) {
                            dst = Object.create(Object.getPrototypeOf(src));
                        }
                        else if (src.constructor === Object) {
                            dst = {};
                        }
                        else {
                            var proto = (src.constructor && src.constructor.prototype)
                                || src.__proto__
                                || {};
                            var T = function () { };
                            T.prototype = proto;
                            dst = new T;
                        }
                        forEach(objectKeys(src), function (key) {
                            dst[key] = src[key];
                        });
                        return dst;
                    }
                    else
                        return src;
                }
                var objectKeys = Object.keys || function keys(obj) {
                    var res = [];
                    for (var key in obj)
                        res.push(key);
                    return res;
                };
                function toS(obj) { return Object.prototype.toString.call(obj); }
                function isDate(obj) { return toS(obj) === '[object Date]'; }
                function isRegExp(obj) { return toS(obj) === '[object RegExp]'; }
                function isError(obj) { return toS(obj) === '[object Error]'; }
                function isBoolean(obj) { return toS(obj) === '[object Boolean]'; }
                function isNumber(obj) { return toS(obj) === '[object Number]'; }
                function isString(obj) { return toS(obj) === '[object String]'; }
                var isArray = Array.isArray || function isArray(xs) {
                    return Object.prototype.toString.call(xs) === '[object Array]';
                };
                var forEach = function (xs, fn) {
                    if (xs.forEach)
                        return xs.forEach(fn);
                    else
                        for (var i = 0; i < xs.length; i++) {
                            fn(xs[i], i, xs);
                        }
                };
                forEach(objectKeys(Traverse.prototype), function (key) {
                    traverse[key] = function (obj) {
                        var args = [].slice.call(arguments, 1);
                        var t = new Traverse(obj);
                        return t[key].apply(t, args);
                    };
                });
                var hasOwnProperty = Object.hasOwnProperty || function (obj, key) {
                    return key in obj;
                };
            }, {}], 130: [function (_dereq_, module, exports) {
                'use strict';
                var toStr = Object.prototype.toString;
                function funcName(f) {
                    if (f.name) {
                        return f.name;
                    }
                    var match = /^\s*function\s*([^\(]*)/im.exec(f.toString());
                    return match ? match[1] : '';
                }
                function ctorName(obj) {
                    var strName = toStr.call(obj).slice(8, -1);
                    if ((strName === 'Object' || strName === 'Error') && obj.constructor) {
                        return funcName(obj.constructor);
                    }
                    return strName;
                }
                function typeName(val) {
                    var type;
                    if (val === null) {
                        return 'null';
                    }
                    type = typeof val;
                    if (type === 'object') {
                        return ctorName(val);
                    }
                    return type;
                }
                module.exports = typeName;
            }, {}], 131: [function (_dereq_, module, exports) {
                'use strict';
                var Buffer = _dereq_('buffer').Buffer;
                var compare = Buffer.compare;
                var indexOf = _dereq_('indexof');
                var filter = _dereq_('array-filter');
                var getPrototypeOf = Object.getPrototypeOf || function (obj) {
                    return obj.__proto__ || (((obj.constructor ? obj.constructor.prototype : Object.prototype)));
                };
                function isEnumerable(obj, key) {
                    return Object.prototype.propertyIsEnumerable.call(obj, key);
                }
                ;
                function pToString(obj) {
                    return Object.prototype.toString.call(obj);
                }
                ;
                function isPrimitive(arg) {
                    return arg === null ||
                        typeof arg === 'boolean' ||
                        typeof arg === 'number' ||
                        typeof arg === 'string' ||
                        typeof arg === 'symbol' ||
                        typeof arg === 'undefined';
                }
                function isObject(arg) {
                    return typeof arg === 'object' && arg !== null;
                }
                function isDate(d) {
                    return isObject(d) && pToString(d) === '[object Date]';
                }
                function isRegExp(re) {
                    return isObject(re) && pToString(re) === '[object RegExp]';
                }
                var isArguments = (function () {
                    function isArg(obj) {
                        return isObject(obj) && pToString(obj) == '[object Arguments]';
                    }
                    if (!isArg(arguments)) {
                        return function (obj) {
                            return isObject(obj) &&
                                typeof obj.length === 'number' &&
                                obj.length >= 0 &&
                                pToString(obj) !== '[object Array]' &&
                                pToString(obj.callee) === '[object Function]';
                        };
                    }
                    else {
                        return isArg;
                    }
                })();
                function fromBufferSupport() {
                    try {
                        return typeof Buffer.from === 'function' && !!Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
                    }
                    catch (e) {
                        return false;
                    }
                }
                var toBuffer = (function () {
                    function isBufferConstructorAcceptsArrayBuffer() {
                        try {
                            return typeof Uint8Array === 'function' && (new Buffer(new Uint8Array([1]).buffer)[0] === 1);
                        }
                        catch (e) {
                            return false;
                        }
                    }
                    if (isBufferConstructorAcceptsArrayBuffer()) {
                        return function (ab) {
                            return new Buffer(ab);
                        };
                    }
                    else {
                        return function (ab) {
                            var buffer = new Buffer(ab.byteLength);
                            var view = new Uint8Array(ab);
                            for (var i = 0; i < buffer.length; ++i) {
                                buffer[i] = view[i];
                            }
                            return buffer;
                        };
                    }
                })();
                var bufferFrom = fromBufferSupport() ? Buffer.from : toBuffer;
                var objectKeys = (function () {
                    var OLD_V8_ARRAY_BUFFER_ENUM = ['BYTES_PER_ELEMENT', 'get', 'set', 'slice', 'subarray', 'buffer', 'length', 'byteOffset', 'byteLength'];
                    var keys = Object.keys || _dereq_('object-keys');
                    return function objectKeys(obj) {
                        if (isEnumerable(obj, 'buffer') &&
                            isEnumerable(obj, 'byteOffset') &&
                            isEnumerable(obj, 'byteLength')) {
                            return filter(keys(obj), function (k) {
                                return indexOf(OLD_V8_ARRAY_BUFFER_ENUM, k) === -1;
                            });
                        }
                        else {
                            return keys(obj);
                        }
                    };
                })();
                function _deepEqual(actual, expected, strict, memos) {
                    if (actual === expected) {
                        return true;
                    }
                    else if (actual instanceof Buffer && expected instanceof Buffer) {
                        return compare(actual, expected) === 0;
                    }
                    else if (isDate(actual) && isDate(expected)) {
                        return actual.getTime() === expected.getTime();
                    }
                    else if (isRegExp(actual) && isRegExp(expected)) {
                        return actual.source === expected.source &&
                            actual.global === expected.global &&
                            actual.multiline === expected.multiline &&
                            actual.lastIndex === expected.lastIndex &&
                            actual.ignoreCase === expected.ignoreCase;
                    }
                    else if ((actual === null || typeof actual !== 'object') &&
                        (expected === null || typeof expected !== 'object')) {
                        return strict ? actual === expected : actual == expected;
                    }
                    else if (typeof ArrayBuffer === 'function' && typeof ArrayBuffer.isView === 'function' &&
                        ArrayBuffer.isView(actual) && ArrayBuffer.isView(expected) &&
                        pToString(actual) === pToString(expected) &&
                        !(actual instanceof Float32Array ||
                            actual instanceof Float64Array)) {
                        return compare(bufferFrom(actual.buffer), bufferFrom(expected.buffer)) === 0;
                    }
                    else {
                        memos = memos || { actual: [], expected: [] };
                        var actualIndex = indexOf(memos.actual, actual);
                        if (actualIndex !== -1) {
                            if (actualIndex === indexOf(memos.expected, expected)) {
                                return true;
                            }
                        }
                        memos.actual.push(actual);
                        memos.expected.push(expected);
                        return objEquiv(actual, expected, strict, memos);
                    }
                }
                function objEquiv(a, b, strict, actualVisitedObjects) {
                    if (a === null || a === undefined || b === null || b === undefined)
                        return false;
                    if (isPrimitive(a) || isPrimitive(b))
                        return a === b;
                    if (strict && getPrototypeOf(a) !== getPrototypeOf(b))
                        return false;
                    var aIsArgs = isArguments(a), bIsArgs = isArguments(b);
                    if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
                        return false;
                    var ka = objectKeys(a), kb = objectKeys(b), key, i;
                    if (ka.length != kb.length)
                        return false;
                    ka.sort();
                    kb.sort();
                    for (i = ka.length - 1; i >= 0; i--) {
                        if (ka[i] != kb[i])
                            return false;
                    }
                    for (i = ka.length - 1; i >= 0; i--) {
                        key = ka[i];
                        if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
                            return false;
                    }
                    return true;
                }
                module.exports = _deepEqual;
            }, { "array-filter": 6, "buffer": 9, "indexof": 101, "object-keys": 103 }], 132: [function (_dereq_, module, exports) {
                if (typeof Object.create === 'function') {
                    module.exports = function inherits(ctor, superCtor) {
                        ctor.super_ = superCtor;
                        ctor.prototype = Object.create(superCtor.prototype, {
                            constructor: {
                                value: ctor,
                                enumerable: false,
                                writable: true,
                                configurable: true
                            }
                        });
                    };
                }
                else {
                    module.exports = function inherits(ctor, superCtor) {
                        ctor.super_ = superCtor;
                        var TempCtor = function () { };
                        TempCtor.prototype = superCtor.prototype;
                        ctor.prototype = new TempCtor();
                        ctor.prototype.constructor = ctor;
                    };
                }
            }, {}], 133: [function (_dereq_, module, exports) {
                module.exports = function isBuffer(arg) {
                    return arg && typeof arg === 'object'
                        && typeof arg.copy === 'function'
                        && typeof arg.fill === 'function'
                        && typeof arg.readUInt8 === 'function';
                };
            }, {}], 134: [function (_dereq_, module, exports) {
                (function (process, global) {
                    var formatRegExp = /%[sdj%]/g;
                    exports.format = function (f) {
                        if (!isString(f)) {
                            var objects = [];
                            for (var i = 0; i < arguments.length; i++) {
                                objects.push(inspect(arguments[i]));
                            }
                            return objects.join(' ');
                        }
                        var i = 1;
                        var args = arguments;
                        var len = args.length;
                        var str = String(f).replace(formatRegExp, function (x) {
                            if (x === '%%')
                                return '%';
                            if (i >= len)
                                return x;
                            switch (x) {
                                case '%s': return String(args[i++]);
                                case '%d': return Number(args[i++]);
                                case '%j':
                                    try {
                                        return JSON.stringify(args[i++]);
                                    }
                                    catch (_) {
                                        return '[Circular]';
                                    }
                                default:
                                    return x;
                            }
                        });
                        for (var x = args[i]; i < len; x = args[++i]) {
                            if (isNull(x) || !isObject(x)) {
                                str += ' ' + x;
                            }
                            else {
                                str += ' ' + inspect(x);
                            }
                        }
                        return str;
                    };
                    exports.deprecate = function (fn, msg) {
                        if (isUndefined(global.process)) {
                            return function () {
                                return exports.deprecate(fn, msg).apply(this, arguments);
                            };
                        }
                        if (process.noDeprecation === true) {
                            return fn;
                        }
                        var warned = false;
                        function deprecated() {
                            if (!warned) {
                                if (process.throwDeprecation) {
                                    throw new Error(msg);
                                }
                                else if (process.traceDeprecation) {
                                    console.trace(msg);
                                }
                                else {
                                    console.error(msg);
                                }
                                warned = true;
                            }
                            return fn.apply(this, arguments);
                        }
                        return deprecated;
                    };
                    var debugs = {};
                    var debugEnviron;
                    exports.debuglog = function (set) {
                        if (isUndefined(debugEnviron))
                            debugEnviron = process.env.NODE_DEBUG || '';
                        set = set.toUpperCase();
                        if (!debugs[set]) {
                            if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
                                var pid = process.pid;
                                debugs[set] = function () {
                                    var msg = exports.format.apply(exports, arguments);
                                    console.error('%s %d: %s', set, pid, msg);
                                };
                            }
                            else {
                                debugs[set] = function () { };
                            }
                        }
                        return debugs[set];
                    };
                    function inspect(obj, opts) {
                        var ctx = {
                            seen: [],
                            stylize: stylizeNoColor
                        };
                        if (arguments.length >= 3)
                            ctx.depth = arguments[2];
                        if (arguments.length >= 4)
                            ctx.colors = arguments[3];
                        if (isBoolean(opts)) {
                            ctx.showHidden = opts;
                        }
                        else if (opts) {
                            exports._extend(ctx, opts);
                        }
                        if (isUndefined(ctx.showHidden))
                            ctx.showHidden = false;
                        if (isUndefined(ctx.depth))
                            ctx.depth = 2;
                        if (isUndefined(ctx.colors))
                            ctx.colors = false;
                        if (isUndefined(ctx.customInspect))
                            ctx.customInspect = true;
                        if (ctx.colors)
                            ctx.stylize = stylizeWithColor;
                        return formatValue(ctx, obj, ctx.depth);
                    }
                    exports.inspect = inspect;
                    inspect.colors = {
                        'bold': [1, 22],
                        'italic': [3, 23],
                        'underline': [4, 24],
                        'inverse': [7, 27],
                        'white': [37, 39],
                        'grey': [90, 39],
                        'black': [30, 39],
                        'blue': [34, 39],
                        'cyan': [36, 39],
                        'green': [32, 39],
                        'magenta': [35, 39],
                        'red': [31, 39],
                        'yellow': [33, 39]
                    };
                    inspect.styles = {
                        'special': 'cyan',
                        'number': 'yellow',
                        'boolean': 'yellow',
                        'undefined': 'grey',
                        'null': 'bold',
                        'string': 'green',
                        'date': 'magenta',
                        'regexp': 'red'
                    };
                    function stylizeWithColor(str, styleType) {
                        var style = inspect.styles[styleType];
                        if (style) {
                            return '\u001b[' + inspect.colors[style][0] + 'm' + str +
                                '\u001b[' + inspect.colors[style][1] + 'm';
                        }
                        else {
                            return str;
                        }
                    }
                    function stylizeNoColor(str, styleType) {
                        return str;
                    }
                    function arrayToHash(array) {
                        var hash = {};
                        array.forEach(function (val, idx) {
                            hash[val] = true;
                        });
                        return hash;
                    }
                    function formatValue(ctx, value, recurseTimes) {
                        if (ctx.customInspect &&
                            value &&
                            isFunction(value.inspect) &&
                            value.inspect !== exports.inspect &&
                            !(value.constructor && value.constructor.prototype === value)) {
                            var ret = value.inspect(recurseTimes, ctx);
                            if (!isString(ret)) {
                                ret = formatValue(ctx, ret, recurseTimes);
                            }
                            return ret;
                        }
                        var primitive = formatPrimitive(ctx, value);
                        if (primitive) {
                            return primitive;
                        }
                        var keys = Object.keys(value);
                        var visibleKeys = arrayToHash(keys);
                        if (ctx.showHidden) {
                            keys = Object.getOwnPropertyNames(value);
                        }
                        if (isError(value)
                            && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
                            return formatError(value);
                        }
                        if (keys.length === 0) {
                            if (isFunction(value)) {
                                var name = value.name ? ': ' + value.name : '';
                                return ctx.stylize('[Function' + name + ']', 'special');
                            }
                            if (isRegExp(value)) {
                                return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                            }
                            if (isDate(value)) {
                                return ctx.stylize(Date.prototype.toString.call(value), 'date');
                            }
                            if (isError(value)) {
                                return formatError(value);
                            }
                        }
                        var base = '', array = false, braces = ['{', '}'];
                        if (isArray(value)) {
                            array = true;
                            braces = ['[', ']'];
                        }
                        if (isFunction(value)) {
                            var n = value.name ? ': ' + value.name : '';
                            base = ' [Function' + n + ']';
                        }
                        if (isRegExp(value)) {
                            base = ' ' + RegExp.prototype.toString.call(value);
                        }
                        if (isDate(value)) {
                            base = ' ' + Date.prototype.toUTCString.call(value);
                        }
                        if (isError(value)) {
                            base = ' ' + formatError(value);
                        }
                        if (keys.length === 0 && (!array || value.length == 0)) {
                            return braces[0] + base + braces[1];
                        }
                        if (recurseTimes < 0) {
                            if (isRegExp(value)) {
                                return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                            }
                            else {
                                return ctx.stylize('[Object]', 'special');
                            }
                        }
                        ctx.seen.push(value);
                        var output;
                        if (array) {
                            output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
                        }
                        else {
                            output = keys.map(function (key) {
                                return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                            });
                        }
                        ctx.seen.pop();
                        return reduceToSingleString(output, base, braces);
                    }
                    function formatPrimitive(ctx, value) {
                        if (isUndefined(value))
                            return ctx.stylize('undefined', 'undefined');
                        if (isString(value)) {
                            var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                .replace(/'/g, "\\'")
                                .replace(/\\"/g, '"') + '\'';
                            return ctx.stylize(simple, 'string');
                        }
                        if (isNumber(value))
                            return ctx.stylize('' + value, 'number');
                        if (isBoolean(value))
                            return ctx.stylize('' + value, 'boolean');
                        if (isNull(value))
                            return ctx.stylize('null', 'null');
                    }
                    function formatError(value) {
                        return '[' + Error.prototype.toString.call(value) + ']';
                    }
                    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                        var output = [];
                        for (var i = 0, l = value.length; i < l; ++i) {
                            if (hasOwnProperty(value, String(i))) {
                                output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
                            }
                            else {
                                output.push('');
                            }
                        }
                        keys.forEach(function (key) {
                            if (!key.match(/^\d+$/)) {
                                output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
                            }
                        });
                        return output;
                    }
                    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                        var name, str, desc;
                        desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
                        if (desc.get) {
                            if (desc.set) {
                                str = ctx.stylize('[Getter/Setter]', 'special');
                            }
                            else {
                                str = ctx.stylize('[Getter]', 'special');
                            }
                        }
                        else {
                            if (desc.set) {
                                str = ctx.stylize('[Setter]', 'special');
                            }
                        }
                        if (!hasOwnProperty(visibleKeys, key)) {
                            name = '[' + key + ']';
                        }
                        if (!str) {
                            if (ctx.seen.indexOf(desc.value) < 0) {
                                if (isNull(recurseTimes)) {
                                    str = formatValue(ctx, desc.value, null);
                                }
                                else {
                                    str = formatValue(ctx, desc.value, recurseTimes - 1);
                                }
                                if (str.indexOf('\n') > -1) {
                                    if (array) {
                                        str = str.split('\n').map(function (line) {
                                            return '  ' + line;
                                        }).join('\n').substr(2);
                                    }
                                    else {
                                        str = '\n' + str.split('\n').map(function (line) {
                                            return '   ' + line;
                                        }).join('\n');
                                    }
                                }
                            }
                            else {
                                str = ctx.stylize('[Circular]', 'special');
                            }
                        }
                        if (isUndefined(name)) {
                            if (array && key.match(/^\d+$/)) {
                                return str;
                            }
                            name = JSON.stringify('' + key);
                            if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                                name = name.substr(1, name.length - 2);
                                name = ctx.stylize(name, 'name');
                            }
                            else {
                                name = name.replace(/'/g, "\\'")
                                    .replace(/\\"/g, '"')
                                    .replace(/(^"|"$)/g, "'");
                                name = ctx.stylize(name, 'string');
                            }
                        }
                        return name + ': ' + str;
                    }
                    function reduceToSingleString(output, base, braces) {
                        var numLinesEst = 0;
                        var length = output.reduce(function (prev, cur) {
                            numLinesEst++;
                            if (cur.indexOf('\n') >= 0)
                                numLinesEst++;
                            return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
                        }, 0);
                        if (length > 60) {
                            return braces[0] +
                                (base === '' ? '' : base + '\n ') +
                                ' ' +
                                output.join(',\n  ') +
                                ' ' +
                                braces[1];
                        }
                        return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
                    }
                    function isArray(ar) {
                        return Array.isArray(ar);
                    }
                    exports.isArray = isArray;
                    function isBoolean(arg) {
                        return typeof arg === 'boolean';
                    }
                    exports.isBoolean = isBoolean;
                    function isNull(arg) {
                        return arg === null;
                    }
                    exports.isNull = isNull;
                    function isNullOrUndefined(arg) {
                        return arg == null;
                    }
                    exports.isNullOrUndefined = isNullOrUndefined;
                    function isNumber(arg) {
                        return typeof arg === 'number';
                    }
                    exports.isNumber = isNumber;
                    function isString(arg) {
                        return typeof arg === 'string';
                    }
                    exports.isString = isString;
                    function isSymbol(arg) {
                        return typeof arg === 'symbol';
                    }
                    exports.isSymbol = isSymbol;
                    function isUndefined(arg) {
                        return arg === void 0;
                    }
                    exports.isUndefined = isUndefined;
                    function isRegExp(re) {
                        return isObject(re) && objectToString(re) === '[object RegExp]';
                    }
                    exports.isRegExp = isRegExp;
                    function isObject(arg) {
                        return typeof arg === 'object' && arg !== null;
                    }
                    exports.isObject = isObject;
                    function isDate(d) {
                        return isObject(d) && objectToString(d) === '[object Date]';
                    }
                    exports.isDate = isDate;
                    function isError(e) {
                        return isObject(e) &&
                            (objectToString(e) === '[object Error]' || e instanceof Error);
                    }
                    exports.isError = isError;
                    function isFunction(arg) {
                        return typeof arg === 'function';
                    }
                    exports.isFunction = isFunction;
                    function isPrimitive(arg) {
                        return arg === null ||
                            typeof arg === 'boolean' ||
                            typeof arg === 'number' ||
                            typeof arg === 'string' ||
                            typeof arg === 'symbol' ||
                            typeof arg === 'undefined';
                    }
                    exports.isPrimitive = isPrimitive;
                    exports.isBuffer = _dereq_('./support/isBuffer');
                    function objectToString(o) {
                        return Object.prototype.toString.call(o);
                    }
                    function pad(n) {
                        return n < 10 ? '0' + n.toString(10) : n.toString(10);
                    }
                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                        'Oct', 'Nov', 'Dec'];
                    function timestamp() {
                        var d = new Date();
                        var time = [pad(d.getHours()),
                            pad(d.getMinutes()),
                            pad(d.getSeconds())].join(':');
                        return [d.getDate(), months[d.getMonth()], time].join(' ');
                    }
                    exports.log = function () {
                        console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
                    };
                    exports.inherits = _dereq_('inherits');
                    exports._extend = function (origin, add) {
                        if (!add || !isObject(add))
                            return origin;
                        var keys = Object.keys(add);
                        var i = keys.length;
                        while (i--) {
                            origin[keys[i]] = add[keys[i]];
                        }
                        return origin;
                    };
                    function hasOwnProperty(obj, prop) {
                        return Object.prototype.hasOwnProperty.call(obj, prop);
                    }
                }).call(this, _dereq_('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
            }, { "./support/isBuffer": 133, "_process": 126, "inherits": 132 }], 135: [function (_dereq_, module, exports) {
                module.exports = extend;
                var hasOwnProperty = Object.prototype.hasOwnProperty;
                function extend() {
                    var target = {};
                    for (var i = 0; i < arguments.length; i++) {
                        var source = arguments[i];
                        for (var key in source) {
                            if (hasOwnProperty.call(source, key)) {
                                target[key] = source[key];
                            }
                        }
                    }
                    return target;
                }
            }, {}] }, {}, [1])(1);
});
//# sourceMappingURL=power-assert.js.map