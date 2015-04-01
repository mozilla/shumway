"undefined" == typeof jwplayer && (jwplayer = function(f) {
        if (jwplayer.api) return jwplayer.api.selectPlayer(f)
    }, jwplayer.version = "6.11.4923", jwplayer.vid = document.createElement("video"), jwplayer.audio = document.createElement("audio"), jwplayer.source = document.createElement("source"), function() {
        var f = {},
            c = Array.prototype,
            k = Object.prototype,
            d = c.slice,
            e = c.concat,
            b = k.toString,
            h = k.hasOwnProperty,
            n = c.map,
            a = c.forEach,
            g = c.filter,
            m = c.some,
            p = c.indexOf,
            k = Array.isArray,
            l = Object.keys,
            j = function(a) {
                if (a instanceof j) return a;
                if (!(this instanceof j)) return new j(a)
            },
            t = j.each = j.forEach = function(r, g, b) {
                if (null == r) return r;
                if (a && r.forEach === a) r.forEach(g, b);
                else if (r.length === +r.length)
                    for (var d = 0, m = r.length; d < m; d++) {
                        if (g.call(b, r[d], d, r) === f) return
                    } else
                        for (var c = j.keys(r), d = 0, m = c.length; d < m; d++)
                            if (g.call(b, r[c[d]], c[d], r) === f) return;
                return r
            };
        j.map = j.collect = function(a, j, g) {
            var b = [];
            if (null == a) return b;
            if (n && a.map === n) return a.map(j, g);
            t(a, function(a, r, d) {
                b.push(j.call(g, a, r, d))
            });
            return b
        };
        j.find = j.detect = function(a, j,
            g) {
            var b;
            v(a, function(a, r, d) {
                if (j.call(g, a, r, d)) return b = a, !0
            });
            return b
        };
        j.filter = j.select = function(a, j, b) {
            var d = [];
            if (null == a) return d;
            if (g && a.filter === g) return a.filter(j, b);
            t(a, function(a, g, r) {
                j.call(b, a, g, r) && d.push(a)
            });
            return d
        };
        var v = j.some = j.any = function(a, g, b) {
            g || (g = j.identity);
            var d = !1;
            if (null == a) return d;
            if (m && a.some === m) return a.some(g, b);
            t(a, function(a, j, r) {
                if (d || (d = g.call(b, a, j, r))) return f
            });
            return !!d
        };
        j.size = function(a) {
            return null == a ? 0 : a.length === +a.length ? a.length : j.keys(a).length
        };
        j.after = function(a, j) {
            return function() {
                if (1 > --a) return j.apply(this, arguments)
            }
        };
        j.sortedIndex = function(a, g, b, d) {
            b = null == b ? j.identity : j.isFunction(b) ? b : j.property(b);
            g = b.call(d, g);
            for (var m = 0, c = a.length; m < c;) {
                var l = m + c >>> 1;
                b.call(d, a[l]) < g ? m = l + 1 : c = l
            }
            return m
        };
        j.find = j.detect = function(a, j, g) {
            var b;
            v(a, function(a, d, m) {
                if (j.call(g, a, d, m)) return b = a, !0
            });
            return b
        };
        v = j.some = j.any = function(a, g, b) {
            g || (g = j.identity);
            var d = !1;
            if (null == a) return d;
            if (m && a.some === m) return a.some(g, b);
            t(a, function(a, j, m) {
                if (d ||
                    (d = g.call(b, a, j, m))) return f
            });
            return !!d
        };
        j.contains = j.include = function(a, g) {
            if (null == a) return !1;
            a.length !== +a.length && (a = j.values(a));
            return 0 <= j.indexOf(a, g)
        };
        j.difference = function(a) {
            var g = e.apply(c, d.call(arguments, 1));
            return j.filter(a, function(a) {
                return !j.contains(g, a)
            })
        };
        j.without = function(a) {
            return j.difference(a, d.call(arguments, 1))
        };
        j.indexOf = function(a, g, b) {
            if (null == a) return -1;
            var d = 0,
                m = a.length;
            if (b)
                if ("number" == typeof b) d = 0 > b ? Math.max(0, m + b) : b;
                else return d = j.sortedIndex(a, g), a[d] ===
                    g ? d : -1;
            if (p && a.indexOf === p) return a.indexOf(g, b);
            for (; d < m; d++)
                if (a[d] === g) return d;
            return -1
        };
        j.memoize = function(a, g) {
            var b = {};
            g || (g = j.identity);
            return function() {
                var d = g.apply(this, arguments);
                return j.has(b, d) ? b[d] : b[d] = a.apply(this, arguments)
            }
        };
        j.keys = function(a) {
            if (!j.isObject(a)) return [];
            if (l) return l(a);
            var g = [],
                b;
            for (b in a) j.has(a, b) && g.push(b);
            return g
        };
        j.pick = function(a) {
            var j = {},
                g = e.apply(c, d.call(arguments, 1));
            t(g, function(g) {
                g in a && (j[g] = a[g])
            });
            return j
        };
        j.isArray = k || function(a) {
            return "[object Array]" ==
                b.call(a)
        };
        j.isObject = function(a) {
            return a === Object(a)
        };
        t("Arguments Function String Number Date RegExp".split(" "), function(a) {
            j["is" + a] = function(g) {
                return b.call(g) == "[object " + a + "]"
            }
        });
        j.isArguments(arguments) || (j.isArguments = function(a) {
            return !(!a || !j.has(a, "callee"))
        });
        "function" !== typeof /./ && (j.isFunction = function(a) {
            return "function" === typeof a
        });
        j.isFinite = function(a) {
            return isFinite(a) && !isNaN(parseFloat(a))
        };
        j.isNaN = function(a) {
            return j.isNumber(a) && a != +a
        };
        j.isBoolean = function(a) {
            return !0 ===
                a || !1 === a || "[object Boolean]" == b.call(a)
        };
        j.isNull = function(a) {
            return null === a
        };
        j.isUndefined = function(a) {
            return void 0 === a
        };
        j.has = function(a, g) {
            return h.call(a, g)
        };
        j.identity = function(a) {
            return a
        };
        j.constant = function(a) {
            return function() {
                return a
            }
        };
        j.property = function(a) {
            return function(g) {
                return g[a]
            }
        };
        this._ = j
    }.call(jwplayer), function(f) {
        function c(a) {
            return function() {
                return h(a)
            }
        }

        function k(a, g, b, c, l) {
            return function() {
                var j, e;
                if (l) b(a);
                else {
                    try {
                        if (j = a.responseXML)
                            if (e = j.firstChild, j.lastChild &&
                                "parsererror" === j.lastChild.nodeName) {
                                c && c("Invalid XML", g, a);
                                return
                            }
                    } catch (h) {}
                    if (j && e) return b(a);
                    (j = d.parseXML(a.responseText)) && j.firstChild ? (a = d.extend({}, a, {
                        responseXML: j
                    }), b(a)) : c && c(a.responseText ? "Invalid XML" : g, g, a)
                }
            }
        }
        var d = f.utils = {},
            e = f._;
        d.exists = function(a) {
            switch (typeof a) {
                case "string":
                    return 0 < a.length;
                case "object":
                    return null !== a;
                case "undefined":
                    return !1
            }
            return !0
        };
        d.styleDimension = function(a) {
            return a + (0 < a.toString().indexOf("%") ? "" : "px")
        };
        d.getAbsolutePath = function(a, g) {
            d.exists(g) ||
                (g = document.location.href);
            if (d.exists(a)) {
                var b;
                if (d.exists(a)) {
                    b = a.indexOf("://");
                    var c = a.indexOf("?");
                    b = 0 < b && (0 > c || c > b)
                } else b = void 0;
                if (b) return a;
                b = g.substring(0, g.indexOf("://") + 3);
                var c = g.substring(b.length, g.indexOf("/", b.length + 1)),
                    l;
                0 === a.indexOf("/") ? l = a.split("/") : (l = g.split("?")[0], l = l.substring(b.length + c.length + 1, l.lastIndexOf("/")), l = l.split("/").concat(a.split("/")));
                for (var j = [], e = 0; e < l.length; e++) l[e] && (d.exists(l[e]) && "." !== l[e]) && (".." === l[e] ? j.pop() : j.push(l[e]));
                return b + c +
                    "/" + j.join("/")
            }
        };
        d.extend = function() {
            var a = Array.prototype.slice.call(arguments, 0);
            if (1 < a.length) {
                for (var g = a[0], b = function(a, b) {
                        void 0 !== b && null !== b && (g[a] = b)
                    }, c = 1; c < a.length; c++) d.foreach(a[c], b);
                return g
            }
            return null
        };
        var b = window.console = window.console || {
            log: function() {}
        };
        d.log = function() {
            var a = Array.prototype.slice.call(arguments, 0);
            "object" === typeof b.log ? b.log(a) : b.log.apply(b, a)
        };
        var h = e.memoize(function(a) {
            return null !== navigator.userAgent.toLowerCase().match(a)
        });
        d.isFF = c(/firefox/i);
        d.isChrome =
            c(/chrome/i);
        d.isIPod = c(/iP(hone|od)/i);
        d.isIPad = c(/iPad/i);
        d.isSafari602 = c(/Macintosh.*Mac OS X 10_8.*6\.0\.\d* Safari/i);
        d.isIETrident = function(a) {
            return a ? (a = parseFloat(a).toFixed(1), h(RegExp("trident/.+rv:\\s*" + a, "i"))) : h(/trident/i)
        };
        d.isMSIE = function(a) {
            return a ? (a = parseFloat(a).toFixed(1), h(RegExp("msie\\s*" + a, "i"))) : h(/msie/i)
        };
        d.isIE = function(a) {
            return a ? (a = parseFloat(a).toFixed(1), 11 <= a ? d.isIETrident(a) : d.isMSIE(a)) : d.isMSIE() || d.isIETrident()
        };
        d.isSafari = function() {
            return h(/safari/i) &&
                !h(/chrome/i) && !h(/chromium/i) && !h(/android/i)
        };
        d.isIOS = function(a) {
            return a ? h(RegExp("iP(hone|ad|od).+\\sOS\\s" + a, "i")) : h(/iP(hone|ad|od)/i)
        };
        d.isAndroidNative = function(a) {
            return d.isAndroid(a, !0)
        };
        d.isAndroid = function(a, b) {
            return b && h(/chrome\/[123456789]/i) && !h(/chrome\/18/) ? !1 : a ? (d.isInt(a) && !/\./.test(a) && (a = "" + a + "."), h(RegExp("Android\\s*" + a, "i"))) : h(/Android/i)
        };
        d.isMobile = function() {
            return d.isIOS() || d.isAndroid()
        };
        d.isIframe = function() {
            return window.frameElement && "IFRAME" === window.frameElement.nodeName
        };
        d.saveCookie = function(a, b) {
            document.cookie = "jwplayer." + a + "\x3d" + b + "; path\x3d/"
        };
        d.getCookies = function() {
            for (var a = {}, b = document.cookie.split("; "), d = 0; d < b.length; d++) {
                var c = b[d].split("\x3d");
                0 === c[0].indexOf("jwplayer.") && (a[c[0].substring(9, c[0].length)] = c[1])
            }
            return a
        };
        d.isInt = function(a) {
            return 0 === parseFloat(a) % 1
        };
        d.typeOf = function(a) {
            if (null === a) return "null";
            var b = typeof a;
            return "object" === b && e.isArray(a) ? "array" : b
        };
        d.translateEventResponse = function(a, b) {
            var c = d.extend({}, b);
            if (a === f.events.JWPLAYER_FULLSCREEN &&
                !c.fullscreen) c.fullscreen = "true" === c.message, delete c.message;
            else if ("object" === typeof c.data) {
                var e = c.data;
                delete c.data;
                c = d.extend(c, e)
            } else "object" === typeof c.metadata && d.deepReplaceKeyName(c.metadata, ["__dot__", "__spc__", "__dsh__", "__default__"], [".", " ", "-", "default"]);
            d.foreach(["position", "duration", "offset"], function(a, b) {
                c[b] && (c[b] = Math.round(1E3 * c[b]) / 1E3)
            });
            return c
        };
        d.flashVersion = function() {
            if (d.isAndroid()) return 0;
            var a = navigator.plugins,
                b;
            try {
                if ("undefined" !== a && (b = a["Shockwave Flash"])) return parseInt(b.description.replace(/\D+(\d+)\..*/,
                    "$1"), 10)
            } catch (c) {}
            if ("undefined" !== typeof window.ActiveXObject) try {
                if (b = new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash")) return parseInt(b.GetVariable("$version").split(" ")[1].split(",")[0], 10)
            } catch (e) {}
            return 0
        };
        d.getScriptPath = function(a) {
            for (var b = document.getElementsByTagName("script"), d = 0; d < b.length; d++) {
                var c = b[d].src;
                if (c && 0 <= c.indexOf(a)) return c.substr(0, c.indexOf(a))
            }
            return ""
        };
        d.deepReplaceKeyName = function(a, b, c) {
            switch (f.utils.typeOf(a)) {
                case "array":
                    for (var e = 0; e < a.length; e++) a[e] =
                        f.utils.deepReplaceKeyName(a[e], b, c);
                    break;
                case "object":
                    d.foreach(a, function(d, j) {
                        var e;
                        if (b instanceof Array && c instanceof Array) {
                            if (b.length !== c.length) return;
                            e = b
                        } else e = [b];
                        for (var h = d, r = 0; r < e.length; r++) h = h.replace(RegExp(b[r], "g"), c[r]);
                        a[h] = f.utils.deepReplaceKeyName(j, b, c);
                        d !== h && delete a[d]
                    })
            }
            return a
        };
        var n = d.pluginPathType = {
            ABSOLUTE: 0,
            RELATIVE: 1,
            CDN: 2
        };
        d.getPluginPathType = function(a) {
            if ("string" === typeof a) {
                a = a.split("?")[0];
                var b = a.indexOf("://");
                if (0 < b) return n.ABSOLUTE;
                var c = a.indexOf("/");
                a = d.extension(a);
                return 0 > b && 0 > c && (!a || !isNaN(a)) ? n.CDN : n.RELATIVE
            }
        };
        d.getPluginName = function(a) {
            return a.replace(/^(.*\/)?([^-]*)-?.*\.(swf|js)$/, "$2")
        };
        d.getPluginVersion = function(a) {
            return a.replace(/[^-]*-?([^\.]*).*$/, "$1")
        };
        d.isYouTube = function(a, b) {
            return "youtube" === b || /^(http|\/\/).*(youtube\.com|youtu\.be)\/.+/.test(a)
        };
        d.youTubeID = function(a) {
            try {
                return /v[=\/]([^?&]*)|youtu\.be\/([^?]*)|^([\w-]*)$/i.exec(a).slice(1).join("").replace("?", "")
            } catch (b) {
                return ""
            }
        };
        d.isRtmp = function(a, b) {
            return 0 ===
                a.indexOf("rtmp") || "rtmp" === b
        };
        d.foreach = function(a, b) {
            var c, e;
            for (c in a) "function" === d.typeOf(a.hasOwnProperty) ? a.hasOwnProperty(c) && (e = a[c], b(c, e)) : (e = a[c], b(c, e))
        };
        d.isHTTPS = function() {
            return 0 === window.location.href.indexOf("https")
        };
        d.repo = function() {
            var a = "http://p.jwpcdn.com/" + f.version.split(/\W/).splice(0, 2).join("/") + "/";
            try {
                d.isHTTPS() && (a = a.replace("http://", "https://ssl."))
            } catch (b) {}
            return a
        };
        d.versionCheck = function(a) {
            a = ("0" + a).split(/\W/);
            var b = f.version.split(/\W/),
                d = parseFloat(a[0]),
                c = parseFloat(b[0]);
            return d > c || d === c && parseFloat("0" + a[1]) > parseFloat(b[1]) ? !1 : !0
        };
        d.ajax = function(a, b, c, e) {
            var h, j = !1;
            0 < a.indexOf("#") && (a = a.replace(/#.*$/, ""));
            if (a && 0 <= a.indexOf("://") && a.split("/")[2] !== window.location.href.split("/")[2] && d.exists(window.XDomainRequest)) h = new window.XDomainRequest, h.onload = k(h, a, b, c, e), h.ontimeout = h.onprogress = function() {}, h.timeout = 5E3;
            else if (d.exists(window.XMLHttpRequest)) {
                var f = h = new window.XMLHttpRequest,
                    n = a;
                h.onreadystatechange = function() {
                    if (4 === f.readyState) switch (f.status) {
                        case 200:
                            k(f,
                                n, b, c, e)();
                            break;
                        case 404:
                            c("File not found", n, f)
                    }
                }
            } else return c && c("", a, h), h;
            h.overrideMimeType && h.overrideMimeType("text/xml");
            var r = a,
                q = h;
            h.onerror = function() {
                c("Error loading file", r, q)
            };
            try {
                h.open("GET", a, !0)
            } catch (u) {
                j = !0
            }
            setTimeout(function() {
                if (j) c && c(a, a, h);
                else try {
                    h.send()
                } catch (b) {
                    c && c(a, a, h)
                }
            }, 0);
            return h
        };
        d.parseXML = function(a) {
            var b;
            try {
                if (window.DOMParser) {
                    if (b = (new window.DOMParser).parseFromString(a, "text/xml"), b.childNodes && b.childNodes.length && "parsererror" === b.childNodes[0].firstChild.nodeName) return
                } else b =
                    new window.ActiveXObject("Microsoft.XMLDOM"), b.async = "false", b.loadXML(a)
            } catch (c) {
                return
            }
            return b
        };
        d.between = function(a, b, c) {
            return Math.max(Math.min(a, c), b)
        };
        d.seconds = function(a) {
            if (e.isNumber(a)) return a;
            a = a.replace(",", ".");
            var b = a.split(":"),
                c = 0;
            "s" === a.slice(-1) ? c = parseFloat(a) : "m" === a.slice(-1) ? c = 60 * parseFloat(a) : "h" === a.slice(-1) ? c = 3600 * parseFloat(a) : 1 < b.length ? (c = parseFloat(b[b.length - 1]), c += 60 * parseFloat(b[b.length - 2]), 3 === b.length && (c += 3600 * parseFloat(b[b.length - 3]))) : c = parseFloat(a);
            return c
        };
        d.serialize = function(a) {
            return null === a ? null : "true" === a.toString().toLowerCase() ? !0 : "false" === a.toString().toLowerCase() ? !1 : isNaN(Number(a)) || 5 < a.length || 0 === a.length ? a : Number(a)
        };
        d.addClass = function(a, b) {
            var c = e.isString(a.className) ? a.className.split(" ") : [],
                h = e.isArray(b) ? b : b.split(" ");
            e.each(h, function(a) {
                e.contains(c, a) || c.push(a)
            });
            a.className = d.trim(c.join(" "))
        };
        d.removeClass = function(a, b) {
            var c = e.isString(a.className) ? a.className.split(" ") : [],
                h = e.isArray(b) ? b : b.split(" ");
            a.className =
                d.trim(e.difference(c, h).join(" "))
        };
        d.indexOf = e.indexOf;
        d.noop = function() {};
        d.canCast = function() {
            var a = f.cast;
            return !(!a || !e.isFunction(a.available) || !a.available())
        }
    }(jwplayer), function(f) {
        function c(a) {
            var b = document.createElement("style");
            a && b.appendChild(document.createTextNode(a));
            b.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(b);
            return b
        }

        function k(a, c, d) {
            if (!b.exists(c)) return "";
            d = d ? " !important" : "";
            return "string" === typeof c && isNaN(c) ? /png|gif|jpe?g/i.test(c) && 0 > c.indexOf("url") ?
                "url(" + c + ")" : c + d : 0 === c || "z-index" === a || "opacity" === a ? "" + c + d : /color/i.test(a) ? "#" + b.pad(c.toString(16).replace(/^0x/i, ""), 6) + d : Math.ceil(c) + "px" + d
        }

        function d(a, b) {
            for (var c = 0; c < a.length; c++) {
                var d = a[c],
                    g, e;
                if (void 0 !== d && null !== d)
                    for (g in b) {
                        e = g;
                        e = e.split("-");
                        for (var h = 1; h < e.length; h++) e[h] = e[h].charAt(0).toUpperCase() + e[h].slice(1);
                        e = e.join("");
                        d.style[e] !== b[g] && (d.style[e] = b[g])
                    }
            }
        }

        function e(b) {
            var c = h[b].sheet,
                d, g, e;
            if (c) {
                d = c.cssRules;
                g = m[b];
                e = b;
                var f = a[e];
                e += " { ";
                for (var n in f) e += n + ": " + f[n] +
                    "; ";
                e += "}";
                if (void 0 !== g && g < d.length && d[g].selectorText === b) {
                    if (e === d[g].cssText) return;
                    c.deleteRule(g)
                } else g = d.length, m[b] = g;
                try {
                    c.insertRule(e, g)
                } catch (k) {}
            }
        }
        var b = f.utils,
            h = {},
            n, a = {},
            g = null,
            m = {};
        b.cssKeyframes = function(a, b) {
            var d = h.keyframes;
            d || (d = c(), h.keyframes = d);
            var d = d.sheet,
                e = "@keyframes " + a + " { " + b + " }";
            try {
                d.insertRule(e, d.cssRules.length)
            } catch (g) {}
            e = e.replace(/(keyframes|transform)/g, "-webkit-$1");
            try {
                d.insertRule(e, d.cssRules.length)
            } catch (f) {}
        };
        var p = b.css = function(b, d, f) {
            a[b] || (a[b] = {});
            var m = a[b];
            f = f || !1;
            var r = !1,
                p, u;
            for (p in d) u = k(p, d[p], f), "" !== u ? u !== m[p] && (m[p] = u, r = !0) : void 0 !== m[p] && (delete m[p], r = !0);
            if (r) {
                if (!h[b]) {
                    d = n && n.sheet && n.sheet.cssRules && n.sheet.cssRules.length || 0;
                    if (!n || 5E4 < d) n = c();
                    h[b] = n
                }
                null !== g ? g.styleSheets[b] = a[b] : e(b)
            }
        };
        p.style = function(a, b, c) {
            if (!(void 0 === a || null === a)) {
                void 0 === a.length && (a = [a]);
                var e = {},
                    h;
                for (h in b) e[h] = k(h, b[h]);
                if (null !== g && !c) {
                    b = (b = a.__cssRules) || {};
                    for (var f in e) b[f] = e[f];
                    a.__cssRules = b;
                    0 > g.elements.indexOf(a) && g.elements.push(a)
                } else d(a,
                    e)
            }
        };
        p.block = function(a) {
            null === g && (g = {
                id: a,
                styleSheets: {},
                elements: []
            })
        };
        p.unblock = function(a) {
            if (g && (!a || g.id === a)) {
                for (var b in g.styleSheets) e(b);
                for (a = 0; a < g.elements.length; a++) b = g.elements[a], d(b, b.__cssRules);
                g = null
            }
        };
        b.clearCss = function(b) {
            for (var c in a) 0 <= c.indexOf(b) && delete a[c];
            for (var d in h) 0 <= d.indexOf(b) && e(d)
        };
        b.transform = function(a, b) {
            var c = {};
            b = b || "";
            c.transform = b;
            c["-webkit-transform"] = b;
            c["-ms-transform"] = b;
            c["-moz-transform"] = b;
            c["-o-transform"] = b;
            "string" === typeof a ? p(a, c) :
                p.style(a, c)
        };
        b.dragStyle = function(a, b) {
            p(a, {
                "-webkit-user-select": b,
                "-moz-user-select": b,
                "-ms-user-select": b,
                "-webkit-user-drag": b,
                "user-select": b,
                "user-drag": b
            })
        };
        b.transitionStyle = function(a, b) {
            navigator.userAgent.match(/5\.\d(\.\d)? safari/i) || p(a, {
                "-webkit-transition": b,
                "-moz-transition": b,
                "-o-transition": b,
                transition: b
            })
        };
        b.rotate = function(a, c) {
            b.transform(a, "rotate(" + c + "deg)")
        };
        b.rgbHex = function(a) {
            a = String(a).replace("#", "");
            3 === a.length && (a = a[0] + a[0] + a[1] + a[1] + a[2] + a[2]);
            return "#" + a.substr(-6)
        };
        b.hexToRgba = function(a, b) {
            var c = "rgb",
                d = [parseInt(a.substr(1, 2), 16), parseInt(a.substr(3, 2), 16), parseInt(a.substr(5, 2), 16)];
            void 0 !== b && 100 !== b && (c += "a", d.push(b / 100));
            return c + "(" + d.join(",") + ")"
        }
    }(jwplayer), function(f) {
        var c = f.foreach,
            k = {
                mp4: "video/mp4",
                ogg: "video/ogg",
                oga: "audio/ogg",
                vorbis: "audio/ogg",
                webm: "video/webm",
                aac: "audio/mp4",
                mp3: "audio/mpeg",
                hls: "application/vnd.apple.mpegurl"
            },
            d = {
                mp4: k.mp4,
                f4v: k.mp4,
                m4v: k.mp4,
                mov: k.mp4,
                m4a: k.aac,
                f4a: k.aac,
                aac: k.aac,
                mp3: k.mp3,
                ogv: k.ogg,
                ogg: k.ogg,
                oga: k.vorbis,
                vorbis: k.vorbis,
                webm: k.webm,
                m3u8: k.hls,
                m3u: k.hls,
                hls: k.hls
            },
            e = f.extensionmap = {};
        c(d, function(b, c) {
            e[b] = {
                html5: c
            }
        });
        c({
            flv: "video",
            f4v: "video",
            mov: "video",
            m4a: "video",
            m4v: "video",
            mp4: "video",
            aac: "video",
            f4a: "video",
            mp3: "sound",
            smil: "rtmp",
            m3u8: "hls",
            hls: "hls"
        }, function(b, c) {
            e[b] || (e[b] = {});
            e[b].flash = c
        });
        e.types = k;
        e.mimeType = function(b) {
            var d;
            c(k, function(c, a) {
                !d && a == b && (d = c)
            });
            return d
        };
        e.extType = function(b) {
            return e.mimeType(d[b])
        }
    }(jwplayer.utils), function(f) {
        var c = f.loaderstatus = {
                NEW: 0,
                LOADING: 1,
                ERROR: 2,
                COMPLETE: 3
            },
            k = document;
        f.scriptloader = function(d) {
            function e(b) {
                a = c.ERROR;
                n.sendEvent(h.ERROR, b)
            }

            function b(b) {
                a = c.COMPLETE;
                n.sendEvent(h.COMPLETE, b)
            }
            var h = jwplayer.events,
                n = f.extend(this, new h.eventdispatcher),
                a = c.NEW;
            this.load = function() {
                if (a == c.NEW) {
                    var g = f.scriptloader.loaders[d];
                    if (g && (a = g.getStatus(), 2 > a)) {
                        g.addEventListener(h.ERROR, e);
                        g.addEventListener(h.COMPLETE, b);
                        return
                    }
                    var n = k.createElement("script");
                    n.addEventListener ? (n.onload = b, n.onerror = e) : n.readyState && (n.onreadystatechange =
                        function(a) {
                            ("loaded" == n.readyState || "complete" == n.readyState) && b(a)
                        });
                    k.getElementsByTagName("head")[0].appendChild(n);
                    n.src = d;
                    a = c.LOADING;
                    f.scriptloader.loaders[d] = this
                }
            };
            this.getStatus = function() {
                return a
            }
        };
        f.scriptloader.loaders = {}
    }(jwplayer.utils), function(f) {
        f.trim = function(c) {
            return c.replace(/^\s+|\s+$/g, "")
        };
        f.pad = function(c, f, d) {
            for (d || (d = "0"); c.length < f;) c = d + c;
            return c
        };
        f.xmlAttribute = function(c, f) {
            for (var d = 0; d < c.attributes.length; d++)
                if (c.attributes[d].name && c.attributes[d].name.toLowerCase() ===
                    f.toLowerCase()) return c.attributes[d].value.toString();
            return ""
        };
        f.extension = function(c) {
            if (!c || "rtmp" === c.substr(0, 4)) return "";
            var f;
            f = -1 < c.indexOf("(format\x3dm3u8-") ? "m3u8" : !1;
            if (f) return f;
            c = c.substring(c.lastIndexOf("/") + 1, c.length).split("?")[0].split("#")[0];
            if (-1 < c.lastIndexOf(".")) return c.substr(c.lastIndexOf(".") + 1, c.length).toLowerCase()
        };
        f.stringToColor = function(c) {
            c = c.replace(/(#|0x)?([0-9A-F]{3,6})$/gi, "$2");
            3 === c.length && (c = c.charAt(0) + c.charAt(0) + c.charAt(1) + c.charAt(1) + c.charAt(2) +
                c.charAt(2));
            return parseInt(c, 16)
        }
    }(jwplayer.utils), function(f) {
        var c = "touchmove",
            k = "touchstart";
        f.touch = function(d) {
            function e(d) {
                d.type === k ? (a = !0, m = h(l.DRAG_START, d)) : d.type === c ? a && (p || (b(l.DRAG_START, d, m), p = !0), b(l.DRAG, d)) : (a && (p ? b(l.DRAG_END, d) : (d.cancelBubble = !0, b(l.TAP, d))), a = p = !1, m = null)
            }

            function b(a, b, c) {
                if (g[a] && (b.preventManipulation && b.preventManipulation(), b.preventDefault && b.preventDefault(), b = c ? c : h(a, b))) g[a](b)
            }

            function h(a, b) {
                var c = null;
                b.touches && b.touches.length ? c = b.touches[0] :
                    b.changedTouches && b.changedTouches.length && (c = b.changedTouches[0]);
                if (!c) return null;
                var d = n.getBoundingClientRect(),
                    c = {
                        type: a,
                        target: n,
                        x: c.pageX - window.pageXOffset - d.left,
                        y: c.pageY,
                        deltaX: 0,
                        deltaY: 0
                    };
                a !== l.TAP && m && (c.deltaX = c.x - m.x, c.deltaY = c.y - m.y);
                return c
            }
            var n = d,
                a = !1,
                g = {},
                m = null,
                p = !1,
                l = f.touchEvents;
            document.addEventListener(c, e);
            document.addEventListener("touchend", function(c) {
                a && p && b(l.DRAG_END, c);
                a = p = !1;
                m = null
            });
            document.addEventListener("touchcancel", e);
            d.addEventListener(k, e);
            d.addEventListener("touchend",
                e);
            this.addEventListener = function(a, b) {
                g[a] = b
            };
            this.removeEventListener = function(a) {
                delete g[a]
            };
            return this
        }
    }(jwplayer.utils), function(f) {
        f.touchEvents = {
            DRAG: "jwplayerDrag",
            DRAG_START: "jwplayerDragStart",
            DRAG_END: "jwplayerDragEnd",
            TAP: "jwplayerTap"
        }
    }(jwplayer.utils), function(f) {
        f.key = function(c) {
            var k, d, e;
            this.edition = function() {
                return e && e.getTime() < (new Date).getTime() ? "invalid" : k
            };
            this.token = function() {
                return d
            };
            f.exists(c) || (c = "");
            try {
                c = f.tea.decrypt(c, "36QXq4W@GSBV^teR");
                var b = c.split("/");
                (k = b[0]) ? /^(free|pro|premium|enterprise|ads)$/i.test(k) ? (d = b[1], b[2] && 0 < parseInt(b[2]) && (e = new Date, e.setTime(String(b[2])))) : k = "invalid": k = "free"
            } catch (h) {
                k = "invalid"
            }
        }
    }(jwplayer.utils), function(f) {
        var c = f.tea = {};
        c.encrypt = function(e, b) {
            if (0 == e.length) return "";
            var h = c.strToLongs(d.encode(e));
            1 >= h.length && (h[1] = 0);
            for (var f = c.strToLongs(d.encode(b).slice(0, 16)), a = h.length, g = h[a - 1], m = h[0], p, l = Math.floor(6 + 52 / a), j = 0; 0 < l--;) {
                j += 2654435769;
                p = j >>> 2 & 3;
                for (var t = 0; t < a; t++) m = h[(t + 1) % a], g = (g >>> 5 ^ m << 2) + (m >>>
                    3 ^ g << 4) ^ (j ^ m) + (f[t & 3 ^ p] ^ g), g = h[t] += g
            }
            h = c.longsToStr(h);
            return k.encode(h)
        };
        c.decrypt = function(e, b) {
            if (0 == e.length) return "";
            for (var h = c.strToLongs(k.decode(e)), f = c.strToLongs(d.encode(b).slice(0, 16)), a = h.length, g = h[a - 1], m = h[0], p, l = 2654435769 * Math.floor(6 + 52 / a); 0 != l;) {
                p = l >>> 2 & 3;
                for (var j = a - 1; 0 <= j; j--) g = h[0 < j ? j - 1 : a - 1], g = (g >>> 5 ^ m << 2) + (m >>> 3 ^ g << 4) ^ (l ^ m) + (f[j & 3 ^ p] ^ g), m = h[j] -= g;
                l -= 2654435769
            }
            h = c.longsToStr(h);
            h = h.replace(/\0+$/, "");
            return d.decode(h)
        };
        c.strToLongs = function(c) {
            for (var b = Array(Math.ceil(c.length /
                    4)), d = 0; d < b.length; d++) b[d] = c.charCodeAt(4 * d) + (c.charCodeAt(4 * d + 1) << 8) + (c.charCodeAt(4 * d + 2) << 16) + (c.charCodeAt(4 * d + 3) << 24);
            return b
        };
        c.longsToStr = function(c) {
            for (var b = Array(c.length), d = 0; d < c.length; d++) b[d] = String.fromCharCode(c[d] & 255, c[d] >>> 8 & 255, c[d] >>> 16 & 255, c[d] >>> 24 & 255);
            return b.join("")
        };
        var k = {
                code: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d",
                encode: function(c, b) {
                    var h, f, a, g, m = [],
                        p = "",
                        l, j, t = k.code;
                    j = ("undefined" == typeof b ? 0 : b) ? d.encode(c) : c;
                    l = j.length % 3;
                    if (0 < l)
                        for (; 3 >
                            l++;) p += "\x3d", j += "\x00";
                    for (l = 0; l < j.length; l += 3) h = j.charCodeAt(l), f = j.charCodeAt(l + 1), a = j.charCodeAt(l + 2), g = h << 16 | f << 8 | a, h = g >> 18 & 63, f = g >> 12 & 63, a = g >> 6 & 63, g &= 63, m[l / 3] = t.charAt(h) + t.charAt(f) + t.charAt(a) + t.charAt(g);
                    m = m.join("");
                    return m = m.slice(0, m.length - p.length) + p
                },
                decode: function(c, b) {
                    b = "undefined" == typeof b ? !1 : b;
                    var h, f, a, g, m, p = [],
                        l, j = k.code;
                    l = b ? d.decode(c) : c;
                    for (var t = 0; t < l.length; t += 4) h = j.indexOf(l.charAt(t)), f = j.indexOf(l.charAt(t + 1)), g = j.indexOf(l.charAt(t + 2)), m = j.indexOf(l.charAt(t + 3)),
                        a = h << 18 | f << 12 | g << 6 | m, h = a >>> 16 & 255, f = a >>> 8 & 255, a &= 255, p[t / 4] = String.fromCharCode(h, f, a), 64 == m && (p[t / 4] = String.fromCharCode(h, f)), 64 == g && (p[t / 4] = String.fromCharCode(h));
                    g = p.join("");
                    return b ? d.decode(g) : g
                }
            },
            d = {
                encode: function(c) {
                    c = c.replace(/[\u0080-\u07ff]/g, function(b) {
                        b = b.charCodeAt(0);
                        return String.fromCharCode(192 | b >> 6, 128 | b & 63)
                    });
                    return c = c.replace(/[\u0800-\uffff]/g, function(b) {
                        b = b.charCodeAt(0);
                        return String.fromCharCode(224 | b >> 12, 128 | b >> 6 & 63, 128 | b & 63)
                    })
                },
                decode: function(c) {
                    c = c.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,
                        function(b) {
                            b = (b.charCodeAt(0) & 15) << 12 | (b.charCodeAt(1) & 63) << 6 | b.charCodeAt(2) & 63;
                            return String.fromCharCode(b)
                        });
                    return c = c.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function(b) {
                        b = (b.charCodeAt(0) & 31) << 6 | b.charCodeAt(1) & 63;
                        return String.fromCharCode(b)
                    })
                }
            }
    }(jwplayer.utils), function(f) {
        f.events = {
            COMPLETE: "COMPLETE",
            ERROR: "ERROR",
            API_READY: "jwplayerAPIReady",
            JWPLAYER_READY: "jwplayerReady",
            JWPLAYER_FULLSCREEN: "jwplayerFullscreen",
            JWPLAYER_RESIZE: "jwplayerResize",
            JWPLAYER_ERROR: "jwplayerError",
            JWPLAYER_SETUP_ERROR: "jwplayerSetupError",
            JWPLAYER_MEDIA_BEFOREPLAY: "jwplayerMediaBeforePlay",
            JWPLAYER_MEDIA_BEFORECOMPLETE: "jwplayerMediaBeforeComplete",
            JWPLAYER_COMPONENT_SHOW: "jwplayerComponentShow",
            JWPLAYER_COMPONENT_HIDE: "jwplayerComponentHide",
            JWPLAYER_MEDIA_BUFFER: "jwplayerMediaBuffer",
            JWPLAYER_MEDIA_BUFFER_FULL: "jwplayerMediaBufferFull",
            JWPLAYER_MEDIA_ERROR: "jwplayerMediaError",
            JWPLAYER_MEDIA_LOADED: "jwplayerMediaLoaded",
            JWPLAYER_MEDIA_COMPLETE: "jwplayerMediaComplete",
            JWPLAYER_MEDIA_SEEK: "jwplayerMediaSeek",
            JWPLAYER_MEDIA_TIME: "jwplayerMediaTime",
            JWPLAYER_MEDIA_VOLUME: "jwplayerMediaVolume",
            JWPLAYER_MEDIA_META: "jwplayerMediaMeta",
            JWPLAYER_MEDIA_MUTE: "jwplayerMediaMute",
            JWPLAYER_AUDIO_TRACKS: "jwplayerAudioTracks",
            JWPLAYER_AUDIO_TRACK_CHANGED: "jwplayerAudioTrackChanged",
            JWPLAYER_MEDIA_LEVELS: "jwplayerMediaLevels",
            JWPLAYER_MEDIA_LEVEL_CHANGED: "jwplayerMediaLevelChanged",
            JWPLAYER_CAPTIONS_CHANGED: "jwplayerCaptionsChanged",
            JWPLAYER_CAPTIONS_LIST: "jwplayerCaptionsList",
            JWPLAYER_CAPTIONS_LOADED: "jwplayerCaptionsLoaded",
            JWPLAYER_PLAYER_STATE: "jwplayerPlayerState",
            state: {
                BUFFERING: "BUFFERING",
                IDLE: "IDLE",
                PAUSED: "PAUSED",
                PLAYING: "PLAYING"
            },
            JWPLAYER_PLAYLIST_LOADED: "jwplayerPlaylistLoaded",
            JWPLAYER_PLAYLIST_ITEM: "jwplayerPlaylistItem",
            JWPLAYER_PLAYLIST_COMPLETE: "jwplayerPlaylistComplete",
            JWPLAYER_DISPLAY_CLICK: "jwplayerViewClick",
            JWPLAYER_PROVIDER_CLICK: "jwplayerProviderClick",
            JWPLAYER_VIEW_TAB_FOCUS: "jwplayerViewTabFocus",
            JWPLAYER_CONTROLS: "jwplayerViewControls",
            JWPLAYER_USER_ACTION: "jwplayerUserAction",
            JWPLAYER_INSTREAM_CLICK: "jwplayerInstreamClicked",
            JWPLAYER_INSTREAM_DESTROYED: "jwplayerInstreamDestroyed",
            JWPLAYER_AD_TIME: "jwplayerAdTime",
            JWPLAYER_AD_ERROR: "jwplayerAdError",
            JWPLAYER_AD_CLICK: "jwplayerAdClicked",
            JWPLAYER_AD_COMPLETE: "jwplayerAdComplete",
            JWPLAYER_AD_IMPRESSION: "jwplayerAdImpression",
            JWPLAYER_AD_COMPANIONS: "jwplayerAdCompanions",
            JWPLAYER_AD_SKIPPED: "jwplayerAdSkipped",
            JWPLAYER_AD_PLAY: "jwplayerAdPlay",
            JWPLAYER_AD_PAUSE: "jwplayerAdPause",
            JWPLAYER_AD_META: "jwplayerAdMeta",
            JWPLAYER_CAST_AVAILABLE: "jwplayerCastAvailable",
            JWPLAYER_CAST_SESSION: "jwplayerCastSession",
            JWPLAYER_CAST_AD_CHANGED: "jwplayerCastAdChanged"
        }
    }(jwplayer),
    function(f) {
        var c = f.utils;
        f.events.eventdispatcher = function(k, d) {
            function e(b, a, d) {
                if (b)
                    for (var e = 0; e < b.length; e++) {
                        var h = b[e];
                        if (h) {
                            null !== h.count && 0 === --h.count && delete b[e];
                            try {
                                h.listener(a)
                            } catch (f) {
                                c.log('Error handling "' + d + '" event listener [' + e + "]: " + f.toString(), h.listener, a)
                            }
                        }
                    }
            }
            var b, h;
            this.resetEventListeners = function() {
                b = {};
                h = []
            };
            this.resetEventListeners();
            this.addEventListener = function(d, a, g) {
                try {
                    c.exists(b[d]) || (b[d] = []), "string" === c.typeOf(a) && (a = (new Function("return " + a))()), b[d].push({
                        listener: a,
                        count: g || null
                    })
                } catch (e) {
                    c.log("error", e)
                }
                return !1
            };
            this.removeEventListener = function(d, a) {
                var g;
                if (b[d]) {
                    try {
                        if (void 0 === a) {
                            b[d] = [];
                            return
                        }
                        for (g = 0; g < b[d].length; g++)
                            if (b[d][g].listener.toString() === a.toString()) {
                                b[d].splice(g, 1);
                                break
                            }
                    } catch (e) {
                        c.log("error", e)
                    }
                    return !1
                }
            };
            this.addGlobalListener = function(b, a) {
                try {
                    "string" === c.typeOf(b) && (b = (new Function("return " + b))()), h.push({
                        listener: b,
                        count: a || null
                    })
                } catch (d) {
                    c.log("error", d)
                }
                return !1
            };
            this.removeGlobalListener = function(b) {
                if (b) {
                    try {
                        for (var a =
                                h.length; a--;) h[a].listener.toString() === b.toString() && h.splice(a, 1)
                    } catch (d) {
                        c.log("error", d)
                    }
                    return !1
                }
            };
            this.sendEvent = function(n, a) {
                c.exists(a) || (a = {});
                c.extend(a, {
                    id: k,
                    version: f.version,
                    type: n
                });
                d && c.log(n, a);
                e(b[n], a, n);
                e(h, a, n)
            }
        }
    }(window.jwplayer),
    function(f) {
        var c = {},
            k = {};
        f.plugins = function() {};
        f.plugins.loadPlugins = function(d, e) {
            k[d] = new f.plugins.pluginloader(new f.plugins.model(c), e);
            return k[d]
        };
        f.plugins.registerPlugin = function(d, e, b, h) {
            var n = f.utils.getPluginName(d);
            c[n] || (c[n] = new f.plugins.plugin(d));
            c[n].registerPlugin(d, e, b, h)
        }
    }(jwplayer),
    function(f) {
        f.plugins.model = function(c) {
            this.addPlugin = function(k) {
                var d = f.utils.getPluginName(k);
                c[d] || (c[d] = new f.plugins.plugin(k));
                return c[d]
            };
            this.getPlugins = function() {
                return c
            }
        }
    }(jwplayer),
    function(f) {
        var c = jwplayer.utils,
            k = jwplayer.events;
        f.pluginmodes = {
            FLASH: 0,
            JAVASCRIPT: 1,
            HYBRID: 2
        };
        f.plugin = function(d) {
            function e() {
                switch (c.getPluginPathType(d)) {
                    case c.pluginPathType.ABSOLUTE:
                        return d;
                    case c.pluginPathType.RELATIVE:
                        return c.getAbsolutePath(d, window.location.href)
                }
            }

            function b() {
                p = setTimeout(function() {
                    n = c.loaderstatus.COMPLETE;
                    l.sendEvent(k.COMPLETE)
                }, 1E3)
            }

            function h() {
                n = c.loaderstatus.ERROR;
                l.sendEvent(k.ERROR, {
                    url: d
                })
            }
            var n = c.loaderstatus.NEW,
                a, g, m, p, l = new k.eventdispatcher;
            c.extend(this, l);
            this.load = function() {
                if (n === c.loaderstatus.NEW)
                    if (0 < d.lastIndexOf(".swf")) a = d, n = c.loaderstatus.COMPLETE, l.sendEvent(k.COMPLETE);
                    else if (c.getPluginPathType(d) === c.pluginPathType.CDN) n = c.loaderstatus.COMPLETE, l.sendEvent(k.COMPLETE);
                else {
                    n = c.loaderstatus.LOADING;
                    var g = new c.scriptloader(e());
                    g.addEventListener(k.COMPLETE, b);
                    g.addEventListener(k.ERROR, h);
                    g.load()
                }
            };
            this.registerPlugin = function(b, d, e, h) {
                p && (clearTimeout(p), p = void 0);
                m = d;
                e && h ? (a = h, g = e) : "string" === typeof e ? a = e : "function" === typeof e ? g = e : !e && !h && (a = b);
                n = c.loaderstatus.COMPLETE;
                l.sendEvent(k.COMPLETE)
            };
            this.getStatus = function() {
                return n
            };
            this.getPluginName = function() {
                return c.getPluginName(d)
            };
            this.getFlashPath = function() {
                if (a) switch (c.getPluginPathType(a)) {
                    case c.pluginPathType.ABSOLUTE:
                        return a;
                    case c.pluginPathType.RELATIVE:
                        return 0 <
                            d.lastIndexOf(".swf") ? c.getAbsolutePath(a, window.location.href) : c.getAbsolutePath(a, e())
                }
                return null
            };
            this.getJS = function() {
                return g
            };
            this.getTarget = function() {
                return m
            };
            this.getPluginmode = function() {
                if ("undefined" !== typeof a && "undefined" !== typeof g) return f.pluginmodes.HYBRID;
                if ("undefined" !== typeof a) return f.pluginmodes.FLASH;
                if ("undefined" !== typeof g) return f.pluginmodes.JAVASCRIPT
            };
            this.getNewInstance = function(a, b, c) {
                return new g(a, b, c)
            };
            this.getURL = function() {
                return d
            }
        }
    }(jwplayer.plugins),
    function(f) {
        var c =
            f.utils,
            k = f.events,
            d = f._,
            e = c.foreach;
        f.plugins.pluginloader = function(b, h) {
            function f() {
                p || (p = !0, m = c.loaderstatus.COMPLETE, v.sendEvent(k.COMPLETE))
            }

            function a() {
                (!l || 0 === d.keys(l).length) && f();
                if (!p) {
                    var a = b.getPlugins();
                    t = d.after(j, f);
                    c.foreach(l, function(b) {
                        b = c.getPluginName(b);
                        var d = a[b];
                        b = d.getJS();
                        var e = d.getTarget(),
                            d = d.getStatus();
                        d === c.loaderstatus.LOADING || d === c.loaderstatus.NEW || (b && !c.versionCheck(e) && v.sendEvent(k.ERROR, {
                            message: "Incompatible player version"
                        }), t())
                    })
                }
            }

            function g(a) {
                v.sendEvent(k.ERROR, {
                    message: "File not found"
                });
                a.url && c.log("File not found", a.url);
                t()
            }
            var m = c.loaderstatus.NEW,
                p = !1,
                l = h,
                j = d.size(l),
                t, v = new k.eventdispatcher;
            c.extend(this, v);
            this.setupPlugins = function(a, d, g) {
                var h = {
                        length: 0,
                        plugins: {}
                    },
                    f = 0,
                    j = {},
                    m = b.getPlugins();
                e(d.plugins, function(b, e) {
                    var n = c.getPluginName(b),
                        k = m[n],
                        l = k.getFlashPath(),
                        p = k.getJS(),
                        v = k.getURL();
                    l && (h.plugins[l] = c.extend({}, e), h.plugins[l].pluginmode = k.getPluginmode(), h.length++);
                    try {
                        if (p && d.plugins && d.plugins[v]) {
                            var t = document.createElement("div");
                            t.id = a.id + "_" + n;
                            t.style.position = "absolute";
                            t.style.top = 0;
                            t.style.zIndex = f + 10;
                            j[n] = k.getNewInstance(a, c.extend({}, d.plugins[v]), t);
                            f++;
                            a.onReady(g(j[n], t, !0));
                            a.onResize(g(j[n], t))
                        }
                    } catch (M) {
                        c.log("ERROR: Failed to load " + n + ".")
                    }
                });
                a.plugins = j;
                return h
            };
            this.load = function() {
                if (!(c.exists(h) && "object" !== c.typeOf(h))) {
                    m = c.loaderstatus.LOADING;
                    e(h, function(d) {
                        c.exists(d) && (d = b.addPlugin(d), d.addEventListener(k.COMPLETE, a), d.addEventListener(k.ERROR, g))
                    });
                    var d = b.getPlugins();
                    e(d, function(a, b) {
                        b.load()
                    })
                }
                a()
            };
            this.destroy = function() {
                v && (v.resetEventListeners(), v = null)
            };
            this.pluginFailed = g;
            this.getStatus = function() {
                return m
            }
        }
    }(jwplayer),
    function(f) {
        f.parsers = {
            localName: function(c) {
                return c ? c.localName ? c.localName : c.baseName ? c.baseName : "" : ""
            },
            textContent: function(c) {
                return c ? c.textContent ? f.utils.trim(c.textContent) : c.text ? f.utils.trim(c.text) : "" : ""
            },
            getChildNode: function(c, f) {
                return c.childNodes[f]
            },
            numChildren: function(c) {
                return c.childNodes ? c.childNodes.length : 0
            }
        }
    }(jwplayer),
    function(f) {
        var c = f.parsers;
        (c.jwparser = function() {}).parseEntry = function(k, d) {
            for (var e = [], b = [], h = f.utils.xmlAttribute, n = 0; n < k.childNodes.length; n++) {
                var a = k.childNodes[n];
                if ("jwplayer" == a.prefix) {
                    var g = c.localName(a);
                    "source" == g ? (delete d.sources, e.push({
                        file: h(a, "file"),
                        "default": h(a, "default"),
                        label: h(a, "label"),
                        type: h(a, "type")
                    })) : "track" == g ? (delete d.tracks, b.push({
                        file: h(a, "file"),
                        "default": h(a, "default"),
                        kind: h(a, "kind"),
                        label: h(a, "label")
                    })) : (d[g] = f.utils.serialize(c.textContent(a)), "file" == g && d.sources && delete d.sources)
                }
                d.file ||
                    (d.file = d.link)
            }
            if (e.length) {
                d.sources = [];
                for (n = 0; n < e.length; n++) 0 < e[n].file.length && (e[n]["default"] = "true" == e[n]["default"] ? !0 : !1, e[n].label.length || delete e[n].label, d.sources.push(e[n]))
            }
            if (b.length) {
                d.tracks = [];
                for (n = 0; n < b.length; n++) 0 < b[n].file.length && (b[n]["default"] = "true" == b[n]["default"] ? !0 : !1, b[n].kind = !b[n].kind.length ? "captions" : b[n].kind, b[n].label.length || delete b[n].label, d.tracks.push(b[n]))
            }
            return d
        }
    }(jwplayer),
    function(f) {
        var c = jwplayer.utils,
            k = c.xmlAttribute,
            d = f.localName,
            e = f.textContent,
            b = f.numChildren,
            h = f.mediaparser = function() {};
        h.parseGroup = function(f, a) {
            var g, m, p = [];
            for (m = 0; m < b(f); m++)
                if (g = f.childNodes[m], "media" == g.prefix && d(g)) switch (d(g).toLowerCase()) {
                    case "content":
                        k(g, "duration") && (a.duration = c.seconds(k(g, "duration")));
                        0 < b(g) && (a = h.parseGroup(g, a));
                        k(g, "url") && (a.sources || (a.sources = []), a.sources.push({
                            file: k(g, "url"),
                            type: k(g, "type"),
                            width: k(g, "width"),
                            label: k(g, "label")
                        }));
                        break;
                    case "title":
                        a.title = e(g);
                        break;
                    case "description":
                        a.description = e(g);
                        break;
                    case "guid":
                        a.mediaid =
                            e(g);
                        break;
                    case "thumbnail":
                        a.image || (a.image = k(g, "url"));
                        break;
                    case "group":
                        h.parseGroup(g, a);
                        break;
                    case "subtitle":
                        var l = {};
                        l.file = k(g, "url");
                        l.kind = "captions";
                        if (0 < k(g, "lang").length) {
                            var j = l;
                            g = k(g, "lang");
                            var t = {
                                zh: "Chinese",
                                nl: "Dutch",
                                en: "English",
                                fr: "French",
                                de: "German",
                                it: "Italian",
                                ja: "Japanese",
                                pt: "Portuguese",
                                ru: "Russian",
                                es: "Spanish"
                            };
                            g = t[g] ? t[g] : g;
                            j.label = g
                        }
                        p.push(l)
                }
                a.hasOwnProperty("tracks") || (a.tracks = []);
            for (m = 0; m < p.length; m++) a.tracks.push(p[m]);
            return a
        }
    }(jwplayer.parsers),
    function(f) {
        function c(b) {
            for (var a = {}, c = 0; c < b.childNodes.length; c++) {
                var e = b.childNodes[c],
                    p = h(e);
                if (p) switch (p.toLowerCase()) {
                    case "enclosure":
                        a.file = k.xmlAttribute(e, "url");
                        break;
                    case "title":
                        a.title = d(e);
                        break;
                    case "guid":
                        a.mediaid = d(e);
                        break;
                    case "pubdate":
                        a.date = d(e);
                        break;
                    case "description":
                        a.description = d(e);
                        break;
                    case "link":
                        a.link = d(e);
                        break;
                    case "category":
                        a.tags = a.tags ? a.tags + d(e) : d(e)
                }
            }
            a = f.mediaparser.parseGroup(b, a);
            a = f.jwparser.parseEntry(b, a);
            return new jwplayer.playlist.item(a)
        }
        var k = jwplayer.utils,
            d = f.textContent,
            e = f.getChildNode,
            b = f.numChildren,
            h = f.localName;
        f.rssparser = {};
        f.rssparser.parse = function(d) {
            for (var a = [], g = 0; g < b(d); g++) {
                var f = e(d, g);
                if ("channel" == h(f).toLowerCase())
                    for (var k = 0; k < b(f); k++) {
                        var l = e(f, k);
                        "item" == h(l).toLowerCase() && a.push(c(l))
                    }
            }
            return a
        }
    }(jwplayer.parsers),
    function(f) {
        var c = f.utils,
            k = f._;
        f.playlist = function(c) {
            var b = [];
            c = k.isArray(c) ? c : [c];
            k.each(c, function(c) {
                b.push(new f.playlist.item(c))
            });
            return b
        };
        f.playlist.filterPlaylist = function(e, b) {
            var h = [];
            k.each(e, function(e) {
                e = c.extend({},
                    e);
                e.sources = d(e.sources, !1, b);
                if (e.sources.length) {
                    for (var a = 0; a < e.sources.length; a++) e.sources[a].label = e.sources[a].label || a.toString();
                    h.push(e)
                }
            });
            return h
        };
        var d = f.playlist.filterSources = function(d, b, h) {
            var n, a = [],
                g = b ? f.embed.flashCanPlay : f.embed.html5CanPlay;
            if (d) return k.each(d, function(b) {
                    if (!b || !b.file) b = void 0;
                    else {
                        var d = c.trim("" + b.file),
                            e = b.type;
                        e || (e = c.extension(d), e = c.extensionmap.extType(e));
                        b = c.extend({}, b, {
                            file: d,
                            type: e
                        })
                    }
                    b && g(b.file, b.type, h) && (n = n || b.type, b.type === n && a.push(b))
                }),
                a
        }
    }(jwplayer),
    function(f) {
        var c = f.item = function(k) {
            var d = jwplayer.utils,
                e = d.extend({}, c.defaults, k),
                b, h;
            e.tracks = k && d.exists(k.tracks) ? k.tracks : [];
            0 === e.sources.length && (e.sources = [new f.source(e)]);
            for (b = 0; b < e.sources.length; b++) h = e.sources[b]["default"], e.sources[b]["default"] = h ? "true" == h.toString() : !1, e.sources[b] = new f.source(e.sources[b]);
            if (e.captions && !d.exists(k.tracks)) {
                for (k = 0; k < e.captions.length; k++) e.tracks.push(e.captions[k]);
                delete e.captions
            }
            for (b = 0; b < e.tracks.length; b++) e.tracks[b] =
                new f.track(e.tracks[b]);
            return e
        };
        c.defaults = {
            description: void 0,
            image: void 0,
            mediaid: void 0,
            title: void 0,
            sources: [],
            tracks: []
        }
    }(jwplayer.playlist),
    function(f) {
        var c = f.utils,
            k = f.events,
            d = f.parsers;
        f.playlist.loader = function() {
            function e(a) {
                try {
                    var b = a.responseXML.childNodes;
                    a = "";
                    for (var c = 0; c < b.length && !(a = b[c], 8 !== a.nodeType); c++);
                    "xml" === d.localName(a) && (a = a.nextSibling);
                    if ("rss" !== d.localName(a)) h("Not a valid RSS feed");
                    else {
                        var e = new f.playlist(d.rssparser.parse(a));
                        n.sendEvent(k.JWPLAYER_PLAYLIST_LOADED, {
                            playlist: e
                        })
                    }
                } catch (l) {
                    h()
                }
            }

            function b(a) {
                h(a.match(/invalid/i) ? "Not a valid RSS feed" : "")
            }

            function h(a) {
                n.sendEvent(k.JWPLAYER_ERROR, {
                    message: a ? a : "Error loading file"
                })
            }
            var n = new k.eventdispatcher;
            c.extend(this, n);
            this.load = function(a) {
                c.ajax(a, e, b)
            }
        }
    }(jwplayer),
    function(f) {
        var c = jwplayer.utils,
            k = {
                file: void 0,
                label: void 0,
                type: void 0,
                "default": void 0
            };
        f.source = function(d) {
            var e = c.extend({}, k);
            c.foreach(k, function(b) {
                c.exists(d[b]) && (e[b] = d[b], delete d[b])
            });
            e.type && 0 < e.type.indexOf("/") && (e.type =
                c.extensionmap.mimeType(e.type));
            "m3u8" == e.type && (e.type = "hls");
            "smil" == e.type && (e.type = "rtmp");
            return e
        }
    }(jwplayer.playlist),
    function(f) {
        var c = jwplayer.utils,
            k = {
                file: void 0,
                label: void 0,
                kind: "captions",
                "default": !1
            };
        f.track = function(d) {
            var e = c.extend({}, k);
            d || (d = {});
            c.foreach(k, function(b) {
                c.exists(d[b]) && (e[b] = d[b], delete d[b])
            });
            return e
        }
    }(jwplayer.playlist),
    function(f) {
        function c(b, c, a) {
            var d = b.style;
            d.backgroundColor = "#000";
            d.color = "#FFF";
            d.width = k.styleDimension(a.width);
            d.height = k.styleDimension(a.height);
            d.display = "table";
            d.opacity = 1;
            a = document.createElement("p");
            d = a.style;
            d.verticalAlign = "middle";
            d.textAlign = "center";
            d.display = "table-cell";
            d.font = "15px/20px Arial, Helvetica, sans-serif";
            a.innerHTML = c.replace(":", ":\x3cbr\x3e");
            b.innerHTML = "";
            b.appendChild(a)
        }
        var k = f.utils,
            d = f.events,
            e = f._,
            b = f.embed = function(h) {
                function n() {
                    if (!y) {
                        var c = j.playlist;
                        if (e.isArray(c)) {
                            if (0 === c.length) {
                                m();
                                return
                            }
                            if (1 === c.length && (!c[0].sources || 0 === c[0].sources.length || !c[0].sources[0].file)) {
                                m();
                                return
                            }
                        }
                        if (!x)
                            if (e.isString(c)) w =
                                new f.playlist.loader, w.addEventListener(d.JWPLAYER_PLAYLIST_LOADED, function(a) {
                                    j.playlist = a.playlist;
                                    x = !1;
                                    n()
                                }), w.addEventListener(d.JWPLAYER_ERROR, function(a) {
                                    x = !1;
                                    m(a)
                                }), x = !0, w.load(j.playlist);
                            else if (u.getStatus() === k.loaderstatus.COMPLETE) {
                            for (c = 0; c < j.modes.length; c++) {
                                var g = j.modes[c],
                                    r = g.type;
                                if (r && b[r]) {
                                    var l = k.extend({}, j),
                                        g = new b[r](D, g, l, u, h);
                                    if (g.supportsConfig()) return g.addEventListener(d.ERROR, a), g.embed(), k.css("object.jwswf, .jwplayer:focus", {
                                        outline: "none"
                                    }), k.css(".jw-tab-focus:focus", {
                                        outline: "solid 2px #0B7EF4"
                                    }), h
                                }
                            }
                            j.fallback ? (c = "No suitable players found and fallback enabled", p(c, !0), k.log(c), new b.download(D, j, m)) : (c = "No suitable players found and fallback disabled", p(c, !1), k.log(c), D.parentNode.replaceChild(C, D))
                        }
                    }
                }

                function a(a) {
                    l(r + a.message)
                }

                function g(a) {
                    h.dispatchEvent(d.JWPLAYER_ERROR, {
                        message: "Could not load plugin: " + a.message
                    })
                }

                function m(a) {
                    a && a.message ? l("Error loading playlist: " + a.message) : l(r + "No playable sources found")
                }

                function p(a, b) {
                    clearTimeout(F);
                    F = setTimeout(function() {
                        h.dispatchEvent(d.JWPLAYER_SETUP_ERROR, {
                            message: a,
                            fallback: b
                        })
                    }, 0)
                }

                function l(a) {
                    y || (j.fallback ? (y = !0, c(D, a, j), p(a, !0)) : p(a, !1))
                }
                var j = new b.config(h.config),
                    t = j.width,
                    v = j.height,
                    r = "Error loading player: ",
                    q = document.getElementById(h.id),
                    u = f.plugins.loadPlugins(h.id, j.plugins),
                    w, x = !1,
                    y = !1,
                    F = -1,
                    C = null;
                j.fallbackDiv && (C = j.fallbackDiv, delete j.fallbackDiv);
                j.id = h.id;
                j.aspectratio ? h.config.aspectratio = j.aspectratio : delete h.config.aspectratio;
                var E = h;
                k.foreach(j.events, function(a, b) {
                    var c = E[a];
                    "function" === typeof c && c.call(E, b)
                });
                var D = document.createElement("div");
                D.id = q.id;
                D.style.width = 0 < t.toString().indexOf("%") ? t : t + "px";
                D.style.height = 0 < v.toString().indexOf("%") ? v : v + "px";
                q.parentNode.replaceChild(D, q);
                this.embed = function() {
                    y || (u.addEventListener(d.COMPLETE, n), u.addEventListener(d.ERROR, g), u.load())
                };
                this.destroy = function() {
                    u && (u.destroy(), u = null);
                    w && (w.resetEventListeners(), w = null)
                };
                this.errorScreen = l;
                return this
            };
        f.embed.errorScreen = c
    }(jwplayer),
    function(f) {
        function c(b) {
            if (b.playlist)
                for (var c = 0; c < b.playlist.length; c++) b.playlist[c] = new e(b.playlist[c]);
            else {
                var f = {};
                d.foreach(e.defaults, function(a) {
                    k(b, f, a)
                });
                f.sources || (b.levels ? (f.sources = b.levels, delete b.levels) : (c = {}, k(b, c, "file"), k(b, c, "type"), f.sources = c.file ? [c] : []));
                b.playlist = [new e(f)]
            }
        }

        function k(b, c, e) {
            d.exists(b[e]) && (c[e] = b[e], delete b[e])
        }
        var d = f.utils,
            e = f.playlist.item;
        (f.embed.config = function(b) {
            var e = {
                fallback: !0,
                height: 270,
                primary: "html5",
                width: 480,
                base: b.base ? b.base : d.getScriptPath("jwplayer.js"),
                aspectratio: ""
            };
            b = d.extend({}, e, f.defaults, b);
            var e = {
                    type: "html5",
                    src: b.base + "jwplayer.html5.js"
                },
                k = {
                    type: "flash",
                    src: b.base + "jwplayer.flash.swf"
                };
            b.modes = "flash" === b.primary ? [k, e] : [e, k];
            b.listbar && (b.playlistsize = b.listbar.size, b.playlistposition = b.listbar.position, b.playlistlayout = b.listbar.layout);
            b.flashplayer && (k.src = b.flashplayer);
            b.html5player && (e.src = b.html5player);
            c(b);
            k = b.aspectratio;
            if ("string" !== typeof k || !d.exists(k)) e = 0;
            else {
                var a = k.indexOf(":"); - 1 === a ? e = 0 : (e = parseFloat(k.substr(0, a)), k = parseFloat(k.substr(a + 1)), e = 0 >= e || 0 >= k ? 0 : 100 * (k / e) + "%")
            } - 1 === b.width.toString().indexOf("%") ?
                delete b.aspectratio : e ? b.aspectratio = e : delete b.aspectratio;
            return b
        }).addConfig = function(b, e) {
            c(e);
            return d.extend(b, e)
        }
    }(jwplayer),
    function(f) {
        var c = f.utils,
            k = f.utils.css;
        f.embed.download = function(d, e, b) {
            function f(a, b, c) {
                a = document.createElement(a);
                b && (a.className = "jwdownload" + b);
                c && c.appendChild(a);
                return a
            }
            var n = c.extend({}, e),
                a, g = n.width ? n.width : 480,
                m = n.height ? n.height : 320,
                p;
            e = e.logo ? e.logo : {
                prefix: c.repo(),
                file: "logo.png",
                margin: 10
            };
            var l, j, t, v, r, q;
            j = n.playlist;
            n = ["mp4", "aac", "mp3"];
            if (j &&
                j.length) {
                t = j[0];
                v = t.sources;
                for (j = 0; j < v.length; j++) r = v[j], r.file && (q = r.type || c.extensionmap.extType(c.extension(r.file)), 0 <= c.indexOf(n, q) ? (a = r.file, p = t.image) : c.isYouTube(r.file, q) && (l = r.file));
                a ? (b = a, d && (a = f("a", "display", d), f("div", "icon", a), f("div", "logo", a), b && a.setAttribute("href", c.getAbsolutePath(b))), b = "#" + d.id + " .jwdownload", d.style.width = "", d.style.height = "", k(b + "display", {
                        width: c.styleDimension(Math.max(320, g)),
                        height: c.styleDimension(Math.max(180, m)),
                        background: "black center no-repeat " +
                            (p ? "url(" + p + ")" : ""),
                        backgroundSize: "contain",
                        position: "relative",
                        border: "none",
                        display: "block"
                    }), k(b + "display div", {
                        position: "absolute",
                        width: "100%",
                        height: "100%"
                    }), k(b + "logo", {
                        top: e.margin + "px",
                        right: e.margin + "px",
                        background: "top right no-repeat url(" + e.prefix + e.file + ")"
                    }), k(b + "icon", {
                        background: "center no-repeat url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgNJREFUeNrs28lqwkAYB/CZqNVDDj2r6FN41QeIy8Fe+gj6BL275Q08u9FbT8ZdwVfotSBYEPUkxFOoks4EKiJdaDuTjMn3wWBO0V/+sySR8SNSqVRKIR8qaXHkzlqS9jCfzzWcTCYp9hF5o+59sVjsiRzcegSckFzcjT+ruN80TeSlAjCAAXzdJSGPFXRpAAMYwACGZQkSdhG4WCzehMNhqV6vG6vVSrirKVEw66YoSqDb7cqlUilE8JjHd/y1MQefVzqdDmiaJpfLZWHgXMHn8F6vJ1cqlVAkEsGuAn83J4gAd2RZymQygX6/L1erVQt+9ZPWb+CDwcCC2zXGJaewl/DhcHhK3DVj+KfKZrMWvFarcYNLomAv4aPRSFZVlTlcSPA5fDweW/BoNIqFnKV53JvncjkLns/n/cLdS+92O7RYLLgsKfv9/t8XlDn4eDyiw+HA9Jyz2eyt0+kY2+3WFC5hluej0Ha7zQQq9PPwdDq1Et1sNsx/nFBgCqWJ8oAK1aUptNVqcYWewE4nahfU0YQnk4ntUEfGMIU2m01HoLaCKbTRaDgKtaVLk9tBYaBcE/6Artdr4RZ5TB6/dC+9iIe/WgAMYADDpAUJAxjAAAYwgGFZgoS/AtNNTF7Z2bL0BYPBV3Jw5xFwwWcYxgtBP5OkE8i9G7aWGOOCruvauwADALMLMEbKf4SdAAAAAElFTkSuQmCC)"
                    })) :
                    l ? (e = l, d = f("iframe", "", d), d.src = "http://www.youtube.com/embed/" + c.youTubeID(e), d.width = g, d.height = m, d.style.border = "none") : b()
            }
        }
    }(jwplayer),
    function(f) {
        var c = f.utils,
            k = f.events,
            d = {};
        (f.embed.flash = function(b, h, n, a, g) {
            function m(a, b, c) {
                var d = document.createElement("param");
                d.setAttribute("name", b);
                d.setAttribute("value", c);
                a.appendChild(d)
            }

            function p(a, b, c) {
                return function() {
                    try {
                        c && document.getElementById(g.id + "_wrapper").appendChild(b);
                        var d = document.getElementById(g.id).getPluginConfig("display");
                        "function" === typeof a.resize && a.resize(d.width, d.height);
                        b.style.left = d.x;
                        b.style.top = d.h
                    } catch (e) {}
                }
            }

            function l(a) {
                if (!a) return {};
                var b = {},
                    d = [];
                c.foreach(a, function(a, e) {
                    var g = c.getPluginName(a);
                    d.push(a);
                    c.foreach(e, function(a, c) {
                        b[g + "." + a] = c
                    })
                });
                b.plugins = d.join(",");
                return b
            }
            var j = new f.events.eventdispatcher,
                t = c.flashVersion();
            c.extend(this, j);
            this.embed = function() {
                n.id = g.id;
                if (10 > t) return j.sendEvent(k.ERROR, {
                    message: "Flash version must be 10.0 or greater"
                }), !1;
                var e, f, q = g.config.listbar,
                    u =
                    c.extend({}, n);
                if (b.id + "_wrapper" === b.parentNode.id) e = document.getElementById(b.id + "_wrapper");
                else {
                    e = document.createElement("div");
                    f = document.createElement("div");
                    f.style.display = "none";
                    f.id = b.id + "_aspect";
                    e.id = b.id + "_wrapper";
                    e.style.position = "relative";
                    e.style.display = "block";
                    e.style.width = c.styleDimension(u.width);
                    e.style.height = c.styleDimension(u.height);
                    if (g.config.aspectratio) {
                        var w = parseFloat(g.config.aspectratio);
                        f.style.display = "block";
                        f.style.marginTop = g.config.aspectratio;
                        e.style.height =
                            "auto";
                        e.style.display = "inline-block";
                        q && ("bottom" === q.position ? f.style.paddingBottom = q.size + "px" : "right" === q.position && (f.style.marginBottom = -1 * q.size * (w / 100) + "px"))
                    }
                    b.parentNode.replaceChild(e, b);
                    e.appendChild(b);
                    e.appendChild(f)
                }
                e = a.setupPlugins(g, u, p);
                0 < e.length ? c.extend(u, l(e.plugins)) : delete u.plugins;
                "undefined" !== typeof u["dock.position"] && "false" === u["dock.position"].toString().toLowerCase() && (u.dock = u["dock.position"], delete u["dock.position"]);
                e = u.wmode || (u.height && 40 >= u.height ? "transparent" :
                    "opaque");
                f = "height width modes events primary base fallback volume".split(" ");
                for (q = 0; q < f.length; q++) delete u[f[q]];
                f = c.getCookies();
                c.foreach(f, function(a, b) {
                    "undefined" === typeof u[a] && (u[a] = b)
                });
                f = window.location.href.split("/");
                f.splice(f.length - 1, 1);
                f = f.join("/");
                u.base = f + "/";
                d[b.id] = u;
                c.isMSIE() ? (f = '\x3cobject classid\x3d"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" " width\x3d"100%" height\x3d"100%"id\x3d"' + b.id + '" name\x3d"' + b.id + '" tabindex\x3d0""\x3e', f += '\x3cparam name\x3d"movie" value\x3d"' +
                    h.src + '"\x3e', f += '\x3cparam name\x3d"allowfullscreen" value\x3d"true"\x3e\x3cparam name\x3d"allowscriptaccess" value\x3d"always"\x3e', f += '\x3cparam name\x3d"seamlesstabbing" value\x3d"true"\x3e', f += '\x3cparam name\x3d"wmode" value\x3d"' + e + '"\x3e', f += '\x3cparam name\x3d"bgcolor" value\x3d"#000000"\x3e', f += "\x3c/object\x3e", b.outerHTML = f, e = document.getElementById(b.id)) : (f = document.createElement("object"), f.setAttribute("type", "application/x-shockwave-flash"), f.setAttribute("data", h.src), f.setAttribute("width",
                    "100%"), f.setAttribute("height", "100%"), f.setAttribute("bgcolor", "#000000"), f.setAttribute("id", b.id), f.setAttribute("name", b.id), f.className = "jwswf", m(f, "allowfullscreen", "true"), m(f, "allowscriptaccess", "always"), m(f, "seamlesstabbing", "true"), m(f, "wmode", e), b.parentNode.replaceChild(f, b), e = f);
                g.config.aspectratio && (e.style.position = "absolute");
                g.container = e;
                g.setPlayer(e, "flash")
            };
            this.supportsConfig = function() {
                if (t)
                    if (n) {
                        if ("string" === c.typeOf(n.playlist)) return !0;
                        try {
                            var a = n.playlist[0].sources;
                            if ("undefined" === typeof a) return !0;
                            for (var b = 0; b < a.length; b++)
                                if (a[b].file && e(a[b].file, a[b].type)) return !0
                        } catch (d) {}
                    } else return !0;
                return !1
            }
        }).getVars = function(b) {
            return d[b]
        };
        var e = f.embed.flashCanPlay = function(b, d) {
            if (c.isYouTube(b, d) || c.isRtmp(b, d) || "hls" === d) return !0;
            var e = c.extensionmap[d ? d : c.extension(b)];
            return !e ? !1 : !!e.flash
        }
    }(jwplayer),
    function(f) {
        var c = f.utils,
            k = c.extensionmap,
            d = f.events;
        f.embed.html5 = function(e, b, h, k, a) {
            function g(a, b, c) {
                return function() {
                    try {
                        var d = document.querySelector("#" +
                            e.id + " .jwmain");
                        c && d.appendChild(b);
                        "function" === typeof a.resize && (a.resize(d.clientWidth, d.clientHeight), setTimeout(function() {
                            a.resize(d.clientWidth, d.clientHeight)
                        }, 400));
                        b.left = d.style.left;
                        b.top = d.style.top
                    } catch (f) {}
                }
            }

            function m(a) {
                p.sendEvent(a.type, {
                    message: "HTML5 player not found"
                })
            }
            var p = this,
                l = new d.eventdispatcher;
            c.extend(p, l);
            p.embed = function() {
                if (f.html5) {
                    k.setupPlugins(a, h, g);
                    e.innerHTML = "";
                    var j = f.utils.extend({}, h);
                    delete j.volume;
                    j = new f.html5.player(j);
                    a.container = document.getElementById(a.id);
                    a.setPlayer(j, "html5")
                } else j = new c.scriptloader(b.src), j.addEventListener(d.ERROR, m), j.addEventListener(d.COMPLETE, p.embed), j.load()
            };
            p.supportsConfig = function() {
                if (f.vid.canPlayType) try {
                    if ("string" === c.typeOf(h.playlist)) return !0;
                    for (var a = h.playlist[0].sources, b = 0; b < a.length; b++)
                        if (f.embed.html5CanPlay(a[b].file, a[b].type, h.androidhls)) return !0
                } catch (d) {}
                return !1
            }
        };
        f.embed.html5CanPlay = function(d, b, h) {
            if (null !== navigator.userAgent.match(/BlackBerry/i) || c.isIE(9)) return !1;
            if (c.isYouTube(d, b)) return !0;
            var n = c.extension(d);
            b = b || k.extType(n);
            if ("hls" === b)
                if (h) {
                    h = c.isAndroidNative;
                    if (h(2) || h(3) || h("4.0")) return !1;
                    if (c.isAndroid()) return !0
                } else if (c.isAndroid()) return !1;
            if (c.isRtmp(d, b)) return !1;
            d = k[b] || k[n];
            if (!d || d.flash && !d.html5) return !1;
            var a;
            a: if (d = d.html5) {
                try {
                    a = !!f.vid.canPlayType(d);
                    break a
                } catch (g) {}
                a = !1
            } else a = !0;
            return a
        }
    }(jwplayer),
    function(f) {
        var c = f.embed,
            k = f.embed.html5CanPlay,
            d = f.utils,
            e = f._,
            b = /\.(js|swf)$/;
        f.cast = f.cast || {};
        f.embed = d.extend(function(e) {
            function k() {
                w = "Adobe SiteCatalyst Error: Could not find Media Module"
            }
            var a = d.repo(),
                g = d.extend({}, f.defaults),
                m = d.extend({}, g, e.config),
                p = e.config,
                l = m.plugins,
                j = m.analytics,
                t = "jwpsrv.js",
                v = "sharing.js",
                r = "related.js",
                q = "gapro.js",
                g = f.key ? f.key : g.key,
                u = (new f.utils.key(g)).edition(),
                w, l = l ? l : {};
            "ads" == u && m.advertising && (b.test(m.advertising.client) ? l[m.advertising.client] = m.advertising : l[a + m.advertising.client + ".js"] = m.advertising);
            delete p.advertising;
            p.key = g;
            m.analytics && b.test(m.analytics.client) && (t = m.analytics.client);
            delete p.analytics;
            j && !("ads" === u ||
                "enterprise" === u) && delete j.enabled;
            if ("free" == u || !j || !1 !== j.enabled) l[t] = j ? j : {};
            delete l.sharing;
            delete l.related;
            switch (u) {
                case "ads":
                case "enterprise":
                    if (p.sitecatalyst) try {
                        window.s && window.s.hasOwnProperty("Media") ? new f.embed.sitecatalyst(e) : k()
                    } catch (x) {
                        k()
                    }
                case "premium":
                    m.related && (b.test(m.related.client) && (r = m.related.client), l[r] = m.related), m.ga && (b.test(m.ga.client) && (q = m.ga.client), l[q] = m.ga);
                case "pro":
                    m.sharing && (b.test(m.sharing.client) && (v = m.sharing.client), l[v] = m.sharing), m.skin &&
                        (p.skin = m.skin.replace(/^(beelden|bekle|five|glow|modieus|roundster|stormtrooper|vapor)$/i, d.repo() + "skins/$1.xml"))
            }
            p.plugins = l;
            e.config = p;
            e = new c(e);
            w && e.errorScreen(w);
            return e
        }, f.embed);
        f.embed.html5CanPlay = function(b, c) {
            var a;
            var d = {
                file: b,
                type: c
            };
            a = f.html5 && f.html5.chooseProvider ? f.html5.chooseProvider(d) !== f.html5.VideoProvider : e.any(f.unregisteredProviders, function(a) {
                return a.supports(d)
            });
            return a ? !0 : k.apply(this, arguments)
        }
    }(jwplayer),
    function(f) {
        var c = jwplayer.utils;
        f.sitecatalyst = function(f) {
            function d(b) {
                a.debug &&
                    c.log(b)
            }

            function e(a) {
                a = a.split("/");
                a = a[a.length - 1];
                a = a.split("?");
                return a[0]
            }

            function b() {
                if (!j) {
                    j = !0;
                    var a = n.getPosition();
                    d("stop: " + m + " : " + a);
                    s.Media.stop(m, a)
                }
            }

            function h() {
                t || (b(), t = !0, d("close: " + m), s.Media.close(m), v = !0, l = 0)
            }
            var n = f,
                a = c.extend({}, n.config.sitecatalyst),
                g = {
                    onPlay: function() {
                        if (!v) {
                            var a = n.getPosition();
                            j = !1;
                            d("play: " + m + " : " + a);
                            s.Media.play(m, a)
                        }
                    },
                    onPause: b,
                    onBuffer: b,
                    onIdle: h,
                    onPlaylistItem: function(b) {
                        try {
                            v = !0;
                            h();
                            l = 0;
                            var d;
                            if (a.mediaName) d = a.mediaName;
                            else {
                                var f = n.getPlaylistItem(b.index);
                                d = f.title ? f.title : f.file ? e(f.file) : f.sources && f.sources.length ? e(f.sources[0].file) : ""
                            }
                            m = d;
                            p = a.playerName ? a.playerName : n.id
                        } catch (g) {
                            c.log(g)
                        }
                    },
                    onTime: function() {
                        if (v) {
                            var a = n.getDuration();
                            if (-1 == a) return;
                            t = j = v = !1;
                            d("open: " + m + " : " + a + " : " + p);
                            s.Media.open(m, a, p);
                            d("play: " + m + " : 0");
                            s.Media.play(m, 0)
                        }
                        a = n.getPosition();
                        if (3 <= Math.abs(a - l)) {
                            var b = l;
                            d("seek: " + b + " to " + a);
                            d("stop: " + m + " : " + b);
                            s.Media.stop(m, b);
                            d("play: " + m + " : " + a);
                            s.Media.play(m, a)
                        }
                        l = a
                    },
                    onComplete: h
                },
                m, p, l, j = !0,
                t = !0,
                v;
            c.foreach(g,
                function(a) {
                    n[a](g[a])
                })
        }
    }(jwplayer.embed),
    function(f) {
        function c(b, c) {
            b[c] && (b[c] = k.getAbsolutePath(b[c]))
        }
        var k = f.utils,
            d = f._,
            e = window.location.href;
        f.cast.setupCastConfig = function(b, d) {
            var f = k.extend({}, b.config);
            f.cast = k.extend({
                pageUrl: e
            }, d);
            for (var a = "base autostart controls fallback fullscreen width height mobilecontrols modes playlistlayout playlistposition playlistsize primary stretching sharing related ga skin logo listbar".split(" "), g = a.length; g--;) delete f[a[g]];
            a = f.plugins;
            delete f.plugins;
            for (var m in a)
                if (a.hasOwnProperty(m)) {
                    var p = a[m];
                    if (p.client && (/[\.\/]/.test(p.client) && c(p, "client"), -1 < p.client.indexOf("vast"))) {
                        g = f;
                        p = k.extend({}, p);
                        p.client = "vast";
                        delete p.companiondiv;
                        if (p.schedule) {
                            var l = void 0;
                            for (l in p.schedule) p.schedule.hasOwnProperty(l) && c(p.schedule[l].ad || p.schedule[l], "tag")
                        }
                        c(p, "tag");
                        g.advertising = p
                    }
                }
            b.position && (f.position = b.position);
            0 < b.item && (f.item = b.item);
            f.captionLabel = k.getCookies().captionLabel;
            return f
        };
        f.cast.setupFlashCastConfig = function(b) {
            var c = b.config;
            c.playlist = b.getPlaylist();
            var e;
            (e = d.find(c.plugins, function(a, b) {
                return 0 < b.indexOf("vast.js")
            })) ? (e.client = "vast", e = {
                advertising: e
            }) : e = {};
            c = d.pick(c, "id captionLabel cast key playlist repeat".split(" "));
            c.cast.pageUrl = window.location.href;
            k.extend(c, {
                captionLabel: k.getCookies().captionLabel,
                volume: b.getVolume(),
                mute: b.getMute(),
                id: b.id,
                position: b.getPosition(),
                item: b.getPlaylistIndex()
            }, e);
            return c
        }
    }(window.jwplayer),
    function(f, c) {
        function k(a, b) {
            a[b] && (a[b] = e.getAbsolutePath(a[b]))
        }
        var d = c.cast,
            e = c.utils,
            b = c.events,
            h = b.state,
            n = {};
        d.NS = "urn:x-cast:com.longtailvideo.jwplayer";
        d.debug = !1;
        d.availability = null;
        d.available = function(a) {
            a = a || d.availability;
            var b = f.chrome,
                c = "available";
            b.cast && b.cast.ReceiverAvailability && (c = b.cast.ReceiverAvailability.AVAILABLE);
            return a === c
        };
        d.controller = function(a, g) {
            var m, p;

            function l(a, b) {
                d.log("send command", a, b);
                var c = {
                    command: a
                };
                void 0 !== b && (c.args = b);
                z.sendMessage(d.NS, c, M, function(a) {
                    d.log("error message", a);
                    "Invalid namespace" === a.description && w()
                })
            }

            function j(a) {
                a = !!d.available(a.availability);
                N.available !== a && (N.available = a, q(b.JWPLAYER_CAST_AVAILABLE))
            }

            function t(a) {
                d.log("existing session", a);
                !z && !H && (H = a.session, H.addMessageListener(d.NS, v))
            }

            function v(e, f) {
                var j = JSON.parse(f);
                if (!j) throw "Message not proper JSON";
                if (j.reconcile) {
                    H.removeMessageListener(d.NS, v);
                    var h = j.diff,
                        k = H;
                    if (!h.id || !j.appid || !j.pageUrl) h.id = c().id, j.appid = G.appid, j.pageUrl = O, H = z = null;
                    h.id === a.id && (j.appid === G.appid && j.pageUrl === O) && (z || (a.jwInstreamState() && a.jwInstreamDestroy(!0),
                        y(k), g.sendEvent(b.JWPLAYER_PLAYER_STATE, {
                            oldstate: h.oldstate,
                            newstate: h.newstate
                        })), J(j));
                    H = null
                }
            }

            function r(a) {
                N.active = !!a;
                a = N;
                var c;
                c = z && z.receiver ? z.receiver.friendlyName : "";
                a.deviceName = c;
                q(b.JWPLAYER_CAST_SESSION, {})
            }

            function q(a) {
                var b = e.extend({}, N);
                g.sendEvent(a, b)
            }

            function u(a) {
                var b = f.chrome;
                a.code !== b.cast.ErrorCode.CANCEL && (d.log("Cast Session Error:", a, z), a.code === b.cast.ErrorCode.SESSION_ERROR && w())
            }

            function w() {
                z ? (E(), z.stop(C, x)) : C()
            }

            function x(a) {
                d.error("Cast Session Stop error:",
                    a, z);
                C()
            }

            function y(j) {
                d.log("Session started:", j);
                z = j;
                z.addMessageListener(d.NS, D);
                z.addUpdateListener(F);
                a.jwPause(!0);
                a.jwSetFullscreen(!1);
                L = g.getVideo();
                m = g.volume;
                p = g.mute;
                B = new d.provider(l);
                B.init();
                g.setVideoProvider(B);
                a.jwPlay = function(a) {
                    !1 === a ? B.pause() : B.play()
                };
                a.jwPause = function(b) {
                    a.jwPlay(!!b)
                };
                a.jwLoad = function(a) {
                    "number" === e.typeOf(a) && g.setItem(a);
                    B.load(a)
                };
                a.jwPlaylistItem = function(a) {
                    "number" === e.typeOf(a) && g.setItem(a);
                    B.playlistItem(a)
                };
                a.jwPlaylistNext = function() {
                    a.jwPlaylistItem(g.item +
                        1)
                };
                a.jwPlaylistPrev = function() {
                    a.jwPlaylistItem(g.item - 1)
                };
                a.jwSetVolume = function(a) {
                    e.exists(a) && (a = Math.min(Math.max(0, a), 100) | 0, P(a) && (a = Math.max(0, Math.min(a / 100, 1)), z.setReceiverVolumeLevel(a, K, function(a) {
                        d.error("set volume error", a);
                        K()
                    })))
                };
                a.jwSetMute = function(a) {
                    e.exists(a) || (a = !I.mute);
                    Q(a) && z.setReceiverMuted(!!a, K, function(a) {
                        d.error("set muted error", a);
                        K()
                    })
                };
                a.jwGetVolume = function() {
                    return I.volume | 0
                };
                a.jwGetMute = function() {
                    return !!I.mute
                };
                a.jwIsBeforePlay = function() {
                    return !1
                };
                var k =
                    a.jwSetCurrentCaptions;
                a.jwSetCurrentCaptions = function(a) {
                    k(a);
                    B.sendCommand("caption", a)
                };
                a.jwSkipAd = function(a) {
                    A && (A.skipAd(a), a = A.getAdModel(), a.complete = !0, g.sendEvent(b.JWPLAYER_CAST_AD_CHANGED, a))
                };
                a.jwClickAd = function(d) {
                    if (A && 300 < A.timeSinceClick() && (A.clickAd(d), g.state !== h.PAUSED)) {
                        var e = {
                            tag: d.tag
                        };
                        d.sequence && (e.sequence = d.sequence);
                        d.podcount && (e.podcount = d.podcount);
                        c(a.id).dispatchEvent(b.JWPLAYER_AD_CLICK, e);
                        f.open(d.clickthrough)
                    }
                };
                a.jwPlayAd = a.jwPauseAd = a.jwSetControls = a.jwForceState =
                    a.jwReleaseState = a.jwSetFullscreen = a.jwDetachMedia = a.jwAttachMedia = M;
                var n = c(a.id).plugins;
                n.vast && n.vast.jwPauseAd !== M && (R = {
                    jwPlayAd: n.vast.jwPlayAd,
                    jwPauseAd: n.vast.jwPauseAd
                }, n.vast.jwPlayAd = n.vast.jwPauseAd = M);
                K();
                r(!0);
                j !== H && B.setup(S(), g)
            }

            function F(a) {
                d.log("Cast Session status", a);
                a ? K() : (B.sendEvent(b.JWPLAYER_PLAYER_STATE, {
                    oldstate: g.state,
                    newstate: h.BUFFERING
                }), C())
            }

            function C() {
                d.log("_sessionStopped");
                z && (E(), z = null);
                if (L) {
                    delete a.jwSkipAd;
                    delete a.jwClickAd;
                    a.initializeAPI();
                    var f =
                        c(a.id).plugins;
                    f.vast && e.extend(f.vast, R);
                    g.volume = m;
                    g.mute = p;
                    g.setVideoProvider(L);
                    g.duration = 0;
                    B && (B.destroy(), B = null);
                    A && (A.destroy(), A = null);
                    g.state !== h.IDLE ? e.isIPad() || e.isIPod() ? (a.jwStop(!0), L.sendEvent(b.JWPLAYER_PLAYER_STATE, {
                        oldstate: h.BUFFERING,
                        newstate: h.IDLE
                    })) : (g.state = h.IDLE, a.jwPlay(!0), a.jwSeek(g.position)) : L.sendEvent(b.JWPLAYER_PLAYER_STATE, {
                        oldstate: h.BUFFERING,
                        newstate: h.IDLE
                    });
                    L = null
                }
                r(!1)
            }

            function E() {
                z.removeUpdateListener(F);
                z.removeMessageListener(d.NS, D)
            }

            function D(a,
                b) {
                var c = JSON.parse(b);
                if (!c) throw "Message not proper JSON";
                J(c)
            }

            function J(c) {
                if ("state" === c.type) {
                    if (A && (c.diff.newstate || c.diff.position)) A.destroy(), A = null, g.setVideoProvider(B), g.sendEvent(b.JWPLAYER_CAST_AD_CHANGED, {
                        done: !0
                    });
                    B.updateModel(c.diff, c.type);
                    c = c.diff;
                    void 0 !== c.item && g.item !== c.item && (g.item = c.item, g.sendEvent(b.JWPLAYER_PLAYLIST_ITEM, {
                        index: g.item
                    }))
                } else if ("ad" === c.type) {
                    null === A && (A = new d.adprovider(d.NS, z), A.init(), g.setVideoProvider(A));
                    A.updateModel(c.diff, c.type);
                    var e =
                        A.getAdModel();
                    c.diff.clickthrough && (e.onClick = a.jwClickAd);
                    c.diff.skipoffset && (e.onSkipAd = a.jwSkipAd);
                    g.sendEvent(b.JWPLAYER_CAST_AD_CHANGED, e);
                    c.diff.complete && A.resetAdModel()
                } else "connection" === c.type ? !0 === c.closed && w() : d.error("received unhandled message", c.type, c)
            }

            function S() {
                var a = e.extend({}, g.config);
                a.cast = e.extend({
                    pageUrl: O
                }, G);
                for (var b = "base autostart controls fallback fullscreen width height mobilecontrols modes playlistlayout playlistposition playlistsize primary stretching sharing related ga skin logo listbar".split(" "),
                        c = b.length; c--;) delete a[b[c]];
                b = a.plugins;
                delete a.plugins;
                for (var d in b)
                    if (b.hasOwnProperty(d)) {
                        var f = b[d];
                        if (f.client && (/[\.\/]/.test(f.client) && k(f, "client"), -1 < f.client.indexOf("vast"))) {
                            c = a;
                            f = e.extend({}, f);
                            f.client = "vast";
                            delete f.companiondiv;
                            if (f.schedule) {
                                var j = void 0;
                                for (j in f.schedule) f.schedule.hasOwnProperty(j) && k(f.schedule[j].ad || f.schedule[j], "tag")
                            }
                            k(f, "tag");
                            c.advertising = f
                        }
                    }
                g.position && (a.position = g.position);
                0 < g.item && (a.item = g.item);
                a.captionLabel = e.getCookies().captionLabel;
                return a
            }

            function K() {
                if (z && z.receiver) {
                    var a = z.receiver.volume;
                    if (a) {
                        var b = 100 * a.level | 0;
                        Q(!!a.muted);
                        P(b)
                    }
                }
            }

            function P(a) {
                var c = I.volume !== a;
                c && (I.volume = a, B.sendEvent(b.JWPLAYER_MEDIA_VOLUME, {
                    volume: a
                }));
                return c
            }

            function Q(a) {
                var c = I.mute !== a;
                c && (I.mute = a, B.sendEvent(b.JWPLAYER_MEDIA_MUTE, {
                    mute: a
                }));
                return c
            }

            function M() {}
            var z = null,
                N = {
                    available: !1,
                    active: !1,
                    deviceName: ""
                },
                I = {
                    volume: null,
                    mute: null
                },
                O = e.getAbsolutePath(f.location.href),
                G, B = null,
                A = null,
                L = null;
            m = g.volume;
            p = g.mute;
            var H = null,
                R = null;
            G = e.extend({}, n, g.cast);
            k(G, "loadscreen");
            k(G, "endscreen");
            k(G, "logo");
            if (G.appid && (!f.cast || !f.cast.receiver)) d.loader.addEventListener("availability", j), d.loader.addEventListener("session", t), d.loader.initialize(G.appid);
            this.startCasting = function() {
                z || a.jwInstreamState() || f.chrome.cast.requestSession(y, u)
            };
            this.stopCasting = w
        };
        d.log = function() {
            if (d.debug) {
                var a = Array.prototype.slice.call(arguments, 0);
                console.log.apply(console, a)
            }
        };
        d.error = function() {
            var a = Array.prototype.slice.call(arguments, 0);
            console.error.apply(console, a)
        }
    }(window, jwplayer),
    function(f) {
        function c(a) {
            p.log("existing session", a);
            !y && !w && (w = a.session, w.addMessageListener(p.NS, k))
        }

        function k(a, c) {
            var d = JSON.parse(c),
                e = w;
            if (!d) throw "Message not proper JSON";
            if (d.reconcile) {
                w.removeMessageListener(p.NS, k);
                d.receiverFriendlyName = w.receiver.friendlyName;
                if (!d.pageUrl || !d.diff.id || !d.appid) d.pageUrl = x, d.diff.id = f().id, d.appid = u, w = y = null;
                r[d.diff.id] && (u === d.appid && d.pageUrl === x) && (v = d.diff.id, u = d.appid, g(v, "jwInstreamDestroy"),
                    b(e), g(v, q.message, d), w = null)
            }
        }

        function d() {
            y && (y.removeUpdateListener(a), y.removeMessageListener(p.NS, h), y.stop(l.noop, n.bind(this)), y = null);
            g(v, q.cleanup)
        }

        function e(a, b) {
            y.sendMessage(p.NS, {
                command: a,
                args: b
            }, l.noop, function(a) {
                p.error("message send error", a)
            })
        }

        function b(b) {
            var c = f(v);
            y = b;
            y.addMessageListener(p.NS, h);
            y.addUpdateListener(a);
            c = f.cast.setupFlashCastConfig(c);
            w !== y && e("setup", c);
            g(v, q.connected, {
                receiverFriendlyName: b.receiver.friendlyName
            })
        }

        function h(a, b) {
            if (b) {
                var c = JSON.parse(b);
                if (!c) throw "Message not proper JSON";
                g(v, q.message, c)
            }
        }

        function n(a) {
            g(v, q.error, a || {})
        }

        function a(a) {
            a || d()
        }

        function g(a, b, c) {
            c ? f(a).callInternal(b, c) : f(a).callInternal(b)
        }

        function m() {}
        var p = f.cast,
            l = f.utils,
            j = f._,
            t = window.chrome || {},
            v, r = {},
            q = {},
            u, w, x = l.getAbsolutePath(window.location.href),
            y;
        p.NS = "urn:x-cast:com.longtailvideo.jwplayer";
        p.flash = {
            checkAvailability: function(a, b, d) {
                q = d;
                u = b;
                r[a] = !0;
                p.loader.addEventListener("availability", function(b) {
                    "available" === b.availability && g(a, q.available, b)
                });
                p.loader.addEventListener("session", c);
                p.loader.initialize(b)
            },
            startCasting: function(a) {
                v = a;
                t.cast.requestSession(b.bind(this), n.bind(this))
            },
            stopCasting: d,
            mute: function(a) {
                y.setReceiverMuted(a, m, function(a) {
                    p.error("set muted error", a)
                })
            },
            volume: function(a) {
                a = Math.max(0, Math.min(a / 100, 1));
                y.setReceiverVolumeLevel(a, m, function(a) {
                    p.error("set volume error", a)
                })
            },
            messageReceiver: e,
            canCastItem: function(a) {
                return j.any(a.levels, function(a) {
                    return f.embed.html5CanPlay(a.file, a.type)
                })
            }
        }
    }(window.jwplayer),
    function(f, c) {
        function k() {
            c && c.cast && c.cast.isAvailable && !a.apiConfig ? (a.apiConfig = new c.cast.ApiConfig(new c.cast.SessionRequest(j), h, n, c.cast.AutoJoinPolicy.ORIGIN_SCOPED), c.cast.initialize(a.apiConfig, b, e)) : 15 > l++ && setTimeout(k, 1E3)
        }

        function d() {
            p && (p.resetEventListeners(), p = null)
        }

        function e() {
            a.apiConfig = null
        }

        function b() {}

        function h(b) {
            t.sendEvent("session", {
                session: b
            });
            b.sendMessage(a.NS, {
                whoami: 1
            })
        }

        function n(b) {
            a.availability = b;
            t.sendEvent("availability", {
                availability: b
            })
        }
        window.chrome = c;
        var a = f.cast,
            g = f.utils,
            m = f.events,
            p, l = 0,
            j = null,
            t = g.extend({
                initialize: function(b) {
                    j = b;
                    null !== a.availability ? t.sendEvent("availability", {
                        availability: a.availability
                    }) : c && c.cast ? k() : p || (p = new g.scriptloader("https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"), p.addEventListener(m.ERROR, d), p.addEventListener(m.COMPLETE, k), p.load())
                }
            }, new m.eventdispatcher("cast.loader"));
        f.cast.loader = t
    }(window.jwplayer, window.chrome || {}),
    function(f, c) {
        var k = [],
            d = f.utils,
            e = f.events,
            b = e.state,
            h = "getBuffer getCaptionsList getControls getCurrentCaptions getCurrentQuality getCurrentAudioTrack getDuration getFullscreen getHeight getLockState getMute getPlaylistIndex getSafeRegion getPosition getQualityLevels getState getVolume getWidth isBeforeComplete isBeforePlay releaseState".split(" "),
            n = "playlistNext stop forceState playlistPrev seek setCurrentCaptions setControls setCurrentQuality setVolume setCurrentAudioTrack".split(" "),
            a = {
                onBufferChange: e.JWPLAYER_MEDIA_BUFFER,
                onBufferFull: e.JWPLAYER_MEDIA_BUFFER_FULL,
                onError: e.JWPLAYER_ERROR,
                onSetupError: e.JWPLAYER_SETUP_ERROR,
                onFullscreen: e.JWPLAYER_FULLSCREEN,
                onMeta: e.JWPLAYER_MEDIA_META,
                onMute: e.JWPLAYER_MEDIA_MUTE,
                onPlaylist: e.JWPLAYER_PLAYLIST_LOADED,
                onPlaylistItem: e.JWPLAYER_PLAYLIST_ITEM,
                onPlaylistComplete: e.JWPLAYER_PLAYLIST_COMPLETE,
                onReady: e.API_READY,
                onResize: e.JWPLAYER_RESIZE,
                onComplete: e.JWPLAYER_MEDIA_COMPLETE,
                onSeek: e.JWPLAYER_MEDIA_SEEK,
                onTime: e.JWPLAYER_MEDIA_TIME,
                onVolume: e.JWPLAYER_MEDIA_VOLUME,
                onBeforePlay: e.JWPLAYER_MEDIA_BEFOREPLAY,
                onBeforeComplete: e.JWPLAYER_MEDIA_BEFORECOMPLETE,
                onDisplayClick: e.JWPLAYER_DISPLAY_CLICK,
                onControls: e.JWPLAYER_CONTROLS,
                onQualityLevels: e.JWPLAYER_MEDIA_LEVELS,
                onQualityChange: e.JWPLAYER_MEDIA_LEVEL_CHANGED,
                onCaptionsList: e.JWPLAYER_CAPTIONS_LIST,
                onCaptionsChange: e.JWPLAYER_CAPTIONS_CHANGED,
                onAdError: e.JWPLAYER_AD_ERROR,
                onAdClick: e.JWPLAYER_AD_CLICK,
                onAdImpression: e.JWPLAYER_AD_IMPRESSION,
                onAdTime: e.JWPLAYER_AD_TIME,
                onAdComplete: e.JWPLAYER_AD_COMPLETE,
                onAdCompanions: e.JWPLAYER_AD_COMPANIONS,
                onAdSkipped: e.JWPLAYER_AD_SKIPPED,
                onAdPlay: e.JWPLAYER_AD_PLAY,
                onAdPause: e.JWPLAYER_AD_PAUSE,
                onAdMeta: e.JWPLAYER_AD_META,
                onCast: e.JWPLAYER_CAST_SESSION,
                onAudioTrackChange: e.JWPLAYER_AUDIO_TRACK_CHANGED,
                onAudioTracks: e.JWPLAYER_AUDIO_TRACKS
            },
            g = {
                onBuffer: b.BUFFERING,
                onPause: b.PAUSED,
                onPlay: b.PLAYING,
                onIdle: b.IDLE
            };
        f.api = function(k) {
            function p(a, b) {
                d.foreach(a, function(a, c) {
                    q[a] = function(a) {
                        return b(c, a)
                    }
                })
            }

            function l(a, b) {
                var c = "jw" + b.charAt(0).toUpperCase() + b.slice(1);
                q[b] = function() {
                    var b = r.apply(this, [c].concat(Array.prototype.slice.call(arguments, 0)));
                    return a ? q : b
                }
            }

            function j(a) {
                F = [];
                E && E.destroy && E.destroy();
                f.api.destroyPlayer(a.id)
            }

            function t(a, b) {
                try {
                    a.jwAddEventListener(b, 'function(dat) { jwplayer("' + q.id + '").dispatchEvent("' + b + '", dat); }')
                } catch (c) {
                    if ("flash" === q.renderingMode) {
                        var e =
                            document.createElement("a");
                        e.href = x.data;
                        e.protocol !== location.protocol && d.log("Warning: Your site [" + location.protocol + "] and JWPlayer [" + e.protocol + "] are hosted using different protocols")
                    }
                    d.log("Could not add internal listener")
                }
            }

            function v(a, b) {
                u[a] || (u[a] = [], x && y && t(x, a));
                u[a].push(b);
                return q
            }

            function r() {
                if (y) {
                    if (x) {
                        var a = Array.prototype.slice.call(arguments, 0),
                            b = a.shift();
                        if ("function" === typeof x[b]) {
                            switch (a.length) {
                                case 6:
                                    return x[b](a[0], a[1], a[2], a[3], a[4], a[5]);
                                case 5:
                                    return x[b](a[0],
                                        a[1], a[2], a[3], a[4]);
                                case 4:
                                    return x[b](a[0], a[1], a[2], a[3]);
                                case 3:
                                    return x[b](a[0], a[1], a[2]);
                                case 2:
                                    return x[b](a[0], a[1]);
                                case 1:
                                    return x[b](a[0])
                            }
                            return x[b]()
                        }
                    }
                    return null
                }
                F.push(arguments)
            }
            var q = this,
                u = {},
                w = {},
                x, y = !1,
                F = [],
                C, E, D = {},
                J = {};
            q.container = k;
            q.id = k.id;
            q.setup = function(a) {
                if (f.embed) {
                    var b = document.getElementById(q.id);
                    b && (a.fallbackDiv = b);
                    j(q);
                    b = f(q.id);
                    b.config = a;
                    E = new f.embed(b);
                    E.embed();
                    return b
                }
                return q
            };
            q.getContainer = function() {
                return q.container
            };
            q.addButton = function(a, b, c,
                e) {
                try {
                    J[e] = c, r("jwDockAddButton", a, b, 'jwplayer("' + q.id + '").callback("' + e + '")', e)
                } catch (f) {
                    d.log("Could not add dock button" + f.message)
                }
            };
            q.removeButton = function(a) {
                r("jwDockRemoveButton", a)
            };
            q.callback = function(a) {
                if (J[a]) J[a]()
            };
            q.getMeta = function() {
                return q.getItemMeta()
            };
            q.getPlaylist = function() {
                var a = r("jwGetPlaylist");
                "flash" === q.renderingMode && d.deepReplaceKeyName(a, ["__dot__", "__spc__", "__dsh__", "__default__"], [".", " ", "-", "default"]);
                return a
            };
            q.getPlaylistItem = function(a) {
                d.exists(a) || (a =
                    q.getPlaylistIndex());
                return q.getPlaylist()[a]
            };
            q.getRenderingMode = function() {
                return q.renderingMode
            };
            q.setFullscreen = function(a) {
                d.exists(a) ? r("jwSetFullscreen", a) : r("jwSetFullscreen", !r("jwGetFullscreen"));
                return q
            };
            q.setMute = function(a) {
                d.exists(a) ? r("jwSetMute", a) : r("jwSetMute", !r("jwGetMute"));
                return q
            };
            q.lock = function() {
                return q
            };
            q.unlock = function() {
                return q
            };
            q.load = function(a) {
                r("jwInstreamDestroy");
                f(q.id).plugins.googima && r("jwDestroyGoogima");
                r("jwLoad", a);
                return q
            };
            q.playlistItem = function(a) {
                r("jwPlaylistItem",
                    parseInt(a, 10));
                return q
            };
            q.resize = function(a, b) {
                if ("flash" !== q.renderingMode) r("jwResize", a, b);
                else {
                    var c = document.getElementById(q.id + "_wrapper"),
                        e = document.getElementById(q.id + "_aspect");
                    e && (e.style.display = "none");
                    c && (c.style.display = "block", c.style.width = d.styleDimension(a), c.style.height = d.styleDimension(b))
                }
                return q
            };
            q.play = function(a) {
                if (a !== c) return r("jwPlay", a), q;
                a = q.getState();
                var d = C && C.getState();
                d && (d === b.IDLE || d === b.PLAYING || d === b.BUFFERING ? r("jwInstreamPause") : r("jwInstreamPlay"));
                a === b.PLAYING || a === b.BUFFERING ? r("jwPause") : r("jwPlay");
                return q
            };
            q.pause = function(a) {
                a === c ? (a = q.getState(), a === b.PLAYING || a === b.BUFFERING ? r("jwPause") : r("jwPlay")) : r("jwPause", a);
                return q
            };
            q.createInstream = function() {
                return new f.api.instream(this, x)
            };
            q.setInstream = function(a) {
                return C = a
            };
            q.loadInstream = function(a, b) {
                C = q.setInstream(q.createInstream()).init(b);
                C.loadItem(a);
                return C
            };
            q.destroyPlayer = function() {
                r("jwPlayerDestroy")
            };
            q.playAd = function(a) {
                var b = f(q.id).plugins;
                b.vast ? b.vast.jwPlayAd(a) :
                    r("jwPlayAd", a)
            };
            q.pauseAd = function() {
                var a = f(q.id).plugins;
                a.vast ? a.vast.jwPauseAd() : r("jwPauseAd")
            };
            p(g, function(a, b) {
                w[a] || (w[a] = [], v(e.JWPLAYER_PLAYER_STATE, function(b) {
                    var c = b.newstate;
                    b = b.oldstate;
                    if (c === a) {
                        var d = w[c];
                        if (d)
                            for (var e = 0; e < d.length; e++) {
                                var f = d[e];
                                "function" === typeof f && f.call(this, {
                                    oldstate: b,
                                    newstate: c
                                })
                            }
                    }
                }));
                w[a].push(b);
                return q
            });
            p(a, v);
            d.foreach(h, function(a, b) {
                l(!1, b)
            });
            d.foreach(n, function(a, b) {
                l(!0, b)
            });
            q.remove = function() {
                if (!y) throw "Cannot call remove() before player is ready";
                j(this)
            };
            q.registerPlugin = function(a, b, c, d) {
                f.plugins.registerPlugin(a, b, c, d)
            };
            q.setPlayer = function(a, b) {
                x = a;
                q.renderingMode = b
            };
            q.detachMedia = function() {
                if ("html5" === q.renderingMode) return r("jwDetachMedia")
            };
            q.attachMedia = function(a) {
                if ("html5" === q.renderingMode) return r("jwAttachMedia", a)
            };
            q.getAudioTracks = function() {
                return r("jwGetAudioTracks")
            };
            q.removeEventListener = function(a, b) {
                var c = u[a];
                if (c)
                    for (var d = c.length; d--;) c[d] === b && c.splice(d, 1)
            };
            q.dispatchEvent = function(a, b) {
                var c = u[a];
                if (c)
                    for (var c =
                            c.slice(0), f = d.translateEventResponse(a, b), g = 0; g < c.length; g++) {
                        var j = c[g];
                        if ("function" === typeof j) try {
                            a === e.JWPLAYER_PLAYLIST_LOADED && d.deepReplaceKeyName(f.playlist, ["__dot__", "__spc__", "__dsh__", "__default__"], [".", " ", "-", "default"]), j.call(this, f)
                        } catch (h) {
                            d.log("There was an error calling back an event handler", h)
                        }
                    }
            };
            q.dispatchInstreamEvent = function(a) {
                C && C.dispatchEvent(a, arguments)
            };
            q.callInternal = r;
            q.playerReady = function(a) {
                y = !0;
                x || q.setPlayer(document.getElementById(a.id));
                q.container = document.getElementById(q.id);
                d.foreach(u, function(a) {
                    t(x, a)
                });
                v(e.JWPLAYER_PLAYLIST_ITEM, function() {
                    D = {}
                });
                v(e.JWPLAYER_MEDIA_META, function(a) {
                    d.extend(D, a.metadata)
                });
                v(e.JWPLAYER_VIEW_TAB_FOCUS, function(a) {
                    var b = q.getContainer();
                    !0 === a.hasFocus ? d.addClass(b, "jw-tab-focus") : d.removeClass(b, "jw-tab-focus")
                });
                for (q.dispatchEvent(e.API_READY); 0 < F.length;) r.apply(this, F.shift())
            };
            q.getItemMeta = function() {
                return D
            };
            return q
        };
        f.playerReady = function(a) {
            var b = f.api.playerById(a.id);
            b || (b = f.api.selectPlayer(a.id));
            b.playerReady(a)
        };
        f.api.selectPlayer = function(a) {
            var b;
            d.exists(a) || (a = 0);
            a.nodeType ? b = a : "string" === typeof a && (b = document.getElementById(a));
            return b ? (a = f.api.playerById(b.id)) ? a : f.api.addPlayer(new f.api(b)) : "number" === typeof a ? k[a] : null
        };
        f.api.playerById = function(a) {
            for (var b = 0; b < k.length; b++)
                if (k[b].id === a) return k[b];
            return null
        };
        f.api.addPlayer = function(a) {
            for (var b = 0; b < k.length; b++)
                if (k[b] === a) return a;
            k.push(a);
            return a
        };
        f.api.destroyPlayer = function(a) {
            var b, e, f;
            d.foreach(k, function(c, d) {
                d.id === a && (b = c, e = d)
            });
            if (b === c || e === c) return null;
            d.clearCss("#" + e.id);
            if (f = document.getElementById(e.id + ("flash" === e.renderingMode ? "_wrapper" : ""))) {
                "html5" === e.renderingMode && e.destroyPlayer();
                var g = document.createElement("div");
                g.id = e.id;
                f.parentNode.replaceChild(g, f)
            }
            k.splice(b, 1);
            return null
        }
    }(window.jwplayer),
    function(f) {
        var c = f.events,
            k = f.utils,
            d = c.state;
        f.api.instream = function(e, b) {
            function f(a, c) {
                m[a] || (m[a] = [], b.jwInstreamAddEventListener(a, 'function(dat) { jwplayer("' + e.id + '").dispatchInstreamEvent("' + a + '", dat); }'));
                m[a].push(c);
                return this
            }

            function n(a, b) {
                p[a] || (p[a] = [], f(c.JWPLAYER_PLAYER_STATE, function(b) {
                    var c = b.newstate,
                        d = b.oldstate;
                    if (c === a) {
                        var e = p[c];
                        if (e)
                            for (var f = 0; f < e.length; f++) {
                                var g = e[f];
                                "function" === typeof g && g.call(this, {
                                    oldstate: d,
                                    newstate: c,
                                    type: b.type
                                })
                            }
                    }
                }));
                p[a].push(b);
                return this
            }
            var a, g, m = {},
                p = {},
                l = this;
            l.type = "instream";
            l.init = function() {
                e.callInternal("jwInitInstream");
                return l
            };
            l.loadItem = function(b, c) {
                a = b;
                g = c || {};
                "array" === k.typeOf(b) ? e.callInternal("jwLoadArrayInstream", a, g) : e.callInternal("jwLoadItemInstream",
                    a, g)
            };
            l.removeEvents = function() {
                m = p = {}
            };
            l.removeEventListener = function(a, b) {
                var c = m[a];
                if (c)
                    for (var d = c.length; d--;) c[d] === b && c.splice(d, 1)
            };
            l.dispatchEvent = function(a, b) {
                var c = m[a];
                if (c)
                    for (var c = c.slice(0), d = k.translateEventResponse(a, b[1]), e = 0; e < c.length; e++) {
                        var f = c[e];
                        "function" === typeof f && f.call(this, d)
                    }
            };
            l.onError = function(a) {
                return f(c.JWPLAYER_ERROR, a)
            };
            l.onMediaError = function(a) {
                return f(c.JWPLAYER_MEDIA_ERROR, a)
            };
            l.onFullscreen = function(a) {
                return f(c.JWPLAYER_FULLSCREEN, a)
            };
            l.onMeta = function(a) {
                return f(c.JWPLAYER_MEDIA_META,
                    a)
            };
            l.onMute = function(a) {
                return f(c.JWPLAYER_MEDIA_MUTE, a)
            };
            l.onComplete = function(a) {
                return f(c.JWPLAYER_MEDIA_COMPLETE, a)
            };
            l.onPlaylistComplete = function(a) {
                return f(c.JWPLAYER_PLAYLIST_COMPLETE, a)
            };
            l.onPlaylistItem = function(a) {
                return f(c.JWPLAYER_PLAYLIST_ITEM, a)
            };
            l.onTime = function(a) {
                return f(c.JWPLAYER_MEDIA_TIME, a)
            };
            l.onBuffer = function(a) {
                return n(d.BUFFERING, a)
            };
            l.onPause = function(a) {
                return n(d.PAUSED, a)
            };
            l.onPlay = function(a) {
                return n(d.PLAYING, a)
            };
            l.onIdle = function(a) {
                return n(d.IDLE, a)
            };
            l.onClick =
                function(a) {
                    return f(c.JWPLAYER_INSTREAM_CLICK, a)
                };
            l.onInstreamDestroyed = function(a) {
                return f(c.JWPLAYER_INSTREAM_DESTROYED, a)
            };
            l.onAdSkipped = function(a) {
                return f(c.JWPLAYER_AD_SKIPPED, a)
            };
            l.play = function(a) {
                b.jwInstreamPlay(a)
            };
            l.pause = function(a) {
                b.jwInstreamPause(a)
            };
            l.hide = function() {
                e.callInternal("jwInstreamHide")
            };
            l.destroy = function() {
                l.removeEvents();
                e.callInternal("jwInstreamDestroy")
            };
            l.setText = function(a) {
                b.jwInstreamSetText(a ? a : "")
            };
            l.getState = function() {
                return b.jwInstreamState()
            };
            l.setClick =
                function(a) {
                    b.jwInstreamClick && b.jwInstreamClick(a)
                }
        }
    }(jwplayer),
    function(f) {
        var c = f.api,
            k = c.selectPlayer,
            d = f._;
        c.selectPlayer = function(c) {
            return (c = k(c)) ? c : {
                registerPlugin: function(b, c, d) {
                    "jwpsrv" !== b && f.plugins.registerPlugin(b, c, d)
                }
            }
        };
        f.unregisteredProviders = [];
        c.registerProvider = function(c) {
            f && f.html5 && d.isFunction(f.html5.registerProvider) ? f.html5.registerProvider(c) : f.unregisteredProviders.push(c)
        }
    }(jwplayer));