window.CLOSURE_NO_DEPS = true;
(function() {
    var k = window.jwplayer.jwpsrv = window.jwplayer.jwpsrv || {},
        p = window.jwplayer;

    function u(b, a, c, d) {
        this.f = w;
        this.extend = window.jwplayer.utils.extend;
        this.J = "http" + ("https:" === document.location.protocol ? "s://ssl." : "://") + "p.jwpcdn.com/6/jwpsrv_frq.js";
        this.K = d;
        this.debug = a;
        this.R = c;
        this.F = 0;
        this.G = "p pt pd pm pi pf ps psl psd pk pkl pkd pkt pkc pkp b bp bpb bpr bl ble blb bat bal bdt bfb bfp bhp bsp bsv sth stn ste stu stf bar bas bcr bht bte bpy bph bpf brt bsk bwi a acv acg at ak am an av ad ap ab abp abm abo abl abn y ym yp g gi gt s sl sc sh r rf ro rc rh rd c cc cs cf co cb ct ce cw cd m mb ms mt l lf lh ll lm lp".split(" ");
        this.D =
            "dev.jwpltx.com";
        this.I = "n.jwpltx.com";
        this.H = "v1/playerconfig/ping.gif?";
        this.d = p.utils.exists;
        this.e = b;
        "function" !== p.utils.typeOf(k.setSampleFrequency) && (k.setSampleFrequency = k.setSampleFrequency || function(b) {
            k.sampling_frequency = parseFloat(b)
        }, this.A = new p.utils.scriptloader(this.J), this.A.load());
        k.parseConfig = k.parseConfig || A(this)
    }

    function A(b) {
        return function(a) {
            var c = {};
            b.f(b.G, function(b, a) {
                c[a] = 0
            });
            b.d(a.k) || (a = new C(a));
            a = a.k();
            D(b, c, a);
            E(b, a);
            F(b, c, a.playlist);
            b.d(a.listbar) && K(b, c, a.listbar);
            b.d(a.captions) && L(b, c, a.captions);
            b.d(a.rtmp) && M(b, c, a.rtmp);
            b.d(a.logo) && N(b, c, a.logo);
            b.d(a.related) && aa(b, c, a.related);
            b.d(a.sharing) && ba(b, c, a.sharing);
            var d;
            b.d(a.plugins) && b.f(a.plugins, function(b, a) {
                a.client && (a.client.match("vast") || a.client.match("googima")) && (d = a)
            });
            b.d(d) && ca(b, c, d);
            b.d(a.sitecatalyst) && da(b, c, a.sitecatalyst);
            b.d(a.ga) && ea(b, c, a.ga);
            return c
        }
    }
    u.prototype.u = function() {
        if (void 0 === k.sampling_frequency) this.A.addEventListener("COMPLETE", this.u);
        else {
            var b = k.sampling_frequency || this.F;
            if (!(Math.random() >= b)) {
                var a = A(this)(this.e),
                    b = fa(this, a, b);
                (new Image).src = b
            }
        }
    };

    function fa(b, a, c) {
        var d = [];
        d.push("n=" + Math.random().toFixed(16).substr(2, 16));
        d.push("aid=" + encodeURIComponent(b.R));
        d.push("ed=" + b.K);
        d.push("f=" + c);
        d.push("pv=" + p.version);
        var e;
        if (window.top !== window.self) {
            e = document.referrer;
            try {
                e = e || window.top.location.href
            } catch (z) {}
        }
        e = e || window.location.href;
        b.f(a, function(b, a) {
            d.push(b + "=" + encodeURIComponent(a))
        });
        d.push("pu=" + encodeURIComponent(e));
        return ["http" + ("https:" === document.location.protocol ? "s://s." : "://i."), b.debug ? b.D : b.I, "/", b.H, d.join("&")].join("")
    }

    function F(b, a, c) {
        "string" === typeof c ? a.pf++ : b.f(c, function(c, e) {
            a.p++;
            b.d(e.title) && a.pt++;
            b.d(e.description) && a.pd++;
            b.d(e.mediaid) && a.pm++;
            b.d(e.image) && a.pi++;
            b.d(e.sources) && ha(b, a, e.sources);
            b.d(e.tracks) && ia(b, a, e.tracks)
        })
    }

    function aa(b, a, c) {
        a.r++;
        b.d(c.file) && a.rf++;
        b.d(c.onclick) && a.ro++;
        b.d(c.oncomplete) && a.rc++;
        b.d(c.heading) && a.rh++;
        b.d(c.dimensions) && a.rd++
    }

    function ba(b, a, c) {
        a.s++;
        b.d(c.link) && a.sl++;
        b.d(c.heading) && a.sh++;
        b.d(c.code) && a.sc++
    }

    function K(b, a, c) {
        a.b++;
        b.d(c.position) && (a.bp++, "bottom" === c.position && a.bpb++, "right" === c.position && a.bpr++);
        b.d(c.layout) && (a.bl++, "extended" === c.layout && a.ble++, "basic" === c.position && a.blb++)
    }

    function ha(b, a, c) {
        b.f(c, function(c, e) {
            a.ps++;
            b.d(e.label) && a.psl++;
            b.d(e["default"]) && e["default"] && a.psd++
        })
    }

    function ia(b, a, c) {
        b.f(c, function(c, e) {
            a.pk++;
            b.d(e.label) && a.pkl++;
            b.d(e["default"]) && e["default"] && a.pkd++;
            b.d(e.kind) && ("captions" === e.kind && a.pkp++, "thumbnails" === e.kind && a.pkt++, "chapters" === e.kind && a.pkc++)
        })
    }

    function D(b, a, c) {
        b.d(c.abouttext) && a.bat++;
        b.d(c.aboutlink) && a.bal++;
        b.d(c.displaytitle) && c.displaytitle && a.bdt++;
        b.d(c.fallback) && c.fallback && a.bfb++;
        b.d(c.flashplayer) && a.bfp++;
        b.d(c.html5player) && a.bhp++;
        b.d(c.startparam) && a.bsp++;
        b.d(c.stagevideo) && !c.stagevideo && a.bsv++;
        b.d(c.stretching) && a.sth++;
        b.d(c.stretching) && "none" == c.stretching && a.stn++;
        b.d(c.stretching) && "exactfit" == c.stretching && a.ste++;
        b.d(c.stretching) && "uniform" == c.stretching && a.stu++;
        b.d(c.stretching) && "fill" == c.stretching && a.stf++;
        b.d(c.aspectratio) && a.bar++;
        b.d(c.autostart) && c.autostart && a.bas++;
        b.d(c.controls) && !c.controls && a.bcr++;
        b.d(c.height) && a.bht++;
        b.d(c.mute) && c.mute && a.bte++;
        b.d(c.primary) && a.bpy++;
        b.d(c.primary) && "html5" == c.primary && a.bph++;
        b.d(c.primary) && "flash" == c.primary && a.bpf++;
        b.d(c.repeat) && a.brt++;
        b.d(c.skin) && a.bsk++;
        b.d(c.width) && a.bwi++
    }

    function L(b, a, c) {
        a.c++;
        b.d(c.color) && a.cc++;
        b.d(c.fontSize) && a.cs++;
        b.d(c.fontFamily) && a.cf++;
        b.d(c.fontOpacity) && a.co++;
        b.d(c.backgroundColor) && a.cb++;
        b.d(c.backgroundOpacity) && a.ct++;
        b.d(c.edgeStyle) && a.ce++;
        b.d(c.windowColor) && a.cw++;
        b.d(c.windowOpacity) && a.cd++
    }

    function M(b, a, c) {
        a.m++;
        b.d(c.bufferlength) && a.mb++;
        b.d(c.subscribe) && a.ms++;
        b.d(c.securetoken) && a.mt++
    }

    function N(b, a, c) {
        a.l++;
        b.d(c.file) && a.lf++;
        b.d(c.hide) && a.lh++;
        b.d(c.link) && a.ll++;
        b.d(c.margin) && a.lm++;
        b.d(c.position) && a.lp++
    }

    function ca(b, a, c) {
        a.a++;
        b.d(c.client) && c.client.match("vast") && a.acv++;
        b.d(c.client) && c.client.match("googima") && a.acg++;
        b.d(c.tag) && (a.at++, a.abp++);
        b.d(c.vastxml) && a.av++;
        b.d(c.skipoffset) && a.ak++;
        b.d(c.admessage) && a.am++;
        b.d(c.companiondiv) && "object" === typeof c.companiondiv && a.an++;
        b.d(c.schedule) && "string" === typeof c.schedule && a.ap++;
        b.d(c.schedule) && "object" === typeof c.schedule && ja(b, a, c.schedule)
    }

    function ja(b, a, c) {
        a.ad++;
        b.f(c, function(c, e) {
            switch (e.offset) {
                case "pre":
                    a.abp++;
                    break;
                case "post":
                    a.abo++;
                    break;
                default:
                    a.abm++
            }
            b.d(e.ad) ? O(b, a, e.ad) : O(b, a, e)
        })
    }

    function O(b, a, c) {
        b.d(c.type) && ("linear" === c.type && a.abl++, "nonlinear" === c.type && a.abn++);
        a.ab++;
        b.d(c.tag) && a.at++;
        b.d(c.vastxml) && a.av++
    }

    function da(b, a, c) {
        a.y++;
        b.d(c.mediaName) && a.ym++;
        b.d(c.playerName) && a.yp++
    }

    function ea(b, a, c) {
        a.g++;
        b.d(c.idstring) && a.gi++;
        b.d(c.trackingobject) && a.gt++
    }

    function E(b, a) {
        var c = {
            description: "",
            L: "",
            M: "",
            title: "",
            Q: [],
            S: []
        };
        if (!a.playlist) {
            var d = {};
            b.f(c, function(c) {
                P(b, a, d, c)
            });
            d.sources || (a.levels ? (d.sources = a.levels, delete a.levels) : (c = {}, P(b, a, c, "file"), P(b, a, c, "type"), d.sources = c.file ? [c] : []));
            a.playlist = [Q(b, d)]
        } else if ("string" !== typeof a.playlist)
            for (c = 0; c < a.playlist.length; c++) a.playlist[c] = Q(b, a.playlist[c])
    }

    function Q(b, a) {
        var c = b.extend({}, {
                description: "",
                L: "",
                M: "",
                title: "",
                Q: [],
                S: []
            }, a),
            d;
        c.tracks = a && b.d(a.tracks) ? a.tracks : [];
        0 === c.sources.length && (c.sources = [R(b, c)]);
        for (var e = 0; e < c.sources.length; e++) d = c.sources[e]["default"], c.sources[e]["default"] = d ? "true" == d.toString() : !1, c.sources[e] = R(b, c.sources[e]);
        if (c.captions && !b.d(a.tracks)) {
            for (d = 0; d < c.captions.length; d++) c.tracks.push(c.captions[d]);
            delete c.captions
        }
        for (e = 0; e < c.tracks.length; e++) c.tracks[e] = ka(b, c.tracks[e]);
        return c
    }

    function R(b, a) {
        var c = {
                file: null,
                label: null,
                type: null,
                "default": null
            },
            d = b.extend({}, c);
        b.f(c, function(c) {
            b.d(a[c]) && (d[c] = a[c], delete a[c])
        });
        return d
    }

    function ka(b, a) {
        var c = {
                file: null,
                label: null,
                kind: "captions",
                "default": !1
            },
            d = b.extend({}, c);
        b.f(c, function(c) {
            b.d(a[c]) && (d[c] = a[c], delete a[c])
        });
        return d
    }

    function P(b, a, c, d) {
        b.d(a[d]) && (c[d] = a[d], delete a[d])
    };

    function U(b, a, c) {
        this.key = b;
        this.value = a;
        this.C = c
    }
    U.prototype.getKey = function() {
        return this.key
    };

    function w(b, a) {
        var c, d;
        for (c in b) "function" == window.jwplayer.utils.typeOf(b.hasOwnProperty) ? b.hasOwnProperty(c) && (d = b[c], a(c, d)) : (d = b[c], a(c, d))
    };

    function la(b, a) {
        if (window.jwplayer._tracker) return window.jwplayer._tracker;
        window.jwplayer._tracker = this;
        this.j = {};
        this.P = "n.jwpltx.com";
        this.O = "v1/jwplayer6/ping.gif?";
        this.N = window.jwplayer.version;
        this.h = b;
        this.t = (this.t = this.h.sdkplatform) || "0";
        this.v = 2 === parseInt(this.h.sdkplatform);
        if (this.o = window.top === window.self ? 0 : 1) {
            this.i = document.referrer;
            try {
                this.i = this.i || window.top.location.href, this.n = window.top.document.title
            } catch (c) {}
        }
        this.i = this.i || window.location.href;
        this.n = this.n || document.title;
        this.v && (this.n = this.i = this.o = "");
        this.trackerVersion = 14;
        this.B = "complete" == document.readyState;
        this.q = [];
        (this.debug = a) && (this.eventObjs = [])
    }(function(b) {
        var a = window.onload;
        window.onload = "function" != typeof window.onload ? b : function() {
            a && a();
            b()
        }
    })(function() {
        var b = window.jwplayer._tracker;
        if (b) {
            for (; 0 < b.q.length;) {
                var a = b.q.shift();
                V(b, a)
            }
            b.B = !0
        }
    });

    function W(b, a, c, d) {
        b.j[a] || (b.j[a] = {});
        b.j[a][c] || (b.j[a][c] = {});
        var e = X(b, a, c, d, !1);
        b.j[a][c][e] && (e += "&dup=1");
        b.debug && (d = X(b, a, c, d, !0), d.url = e, d.fired = !1, b.eventObjs.push(d));
        b.B ? V(b, e) : b.q.push(e);
        b.j[a][c][e] = !0
    }

    function Y(b, a, c) {
        return new U(b, a, c)
    }

    function X(b, a, c, d, e) {
        a = [Y("tv", b.trackerVersion, 0), Y("n", Math.random().toFixed(16).substr(2, 16), 2), Y("aid", a, 4), Y("e", c, 5), Y("i", b.o, 6), Y("pv", b.N, 7), Y("pu", b.i, 101), Y("pt", b.n, 103), Y("sdk", b.t, 25)].concat(d).sort(function(b, a) {
            return b.C > a.C ? 1 : -1
        });
        b.v && a.push(Y("did", b.h.mobiledeviceid, 26), Y("sv", b.h.iossdkversion, 27), Y("dm", b.h.mobiledevicemodel, 28), Y("an", b.h.applicationname, 29));
        if (e) {
            b = {};
            for (e = 0; e < a.length; e++) b[a[e].getKey()] = a[e].value;
            return b
        }
        c = [];
        for (e = 0; e < a.length; e++) c.push(a[e].getKey() +
            "=" + encodeURIComponent(a[e].value));
        return ["http" + ("https:" === document.location.protocol ? "s://s." : "://i."), b.P, "/", b.O, c.join("&")].join("")
    }

    function V(b, a) {
        (new Image).src = a;
        b.debug && w(b.eventObjs, function(b, d) {
            d.url == a && (d.fired = !0)
        })
    };

    function C(b) {
        this.e = b
    }

    function ma(b, a) {
        b.e.onReady(a)
    }

    function na(b, a) {
        b.e.onComplete(a)
    }

    function oa(b, a) {
        b.e.onTime(a)
    }

    function Z(b) {
        return b.e.getPlaylistItem()
    }

    function $(b) {
        return "html5" === b.e.getRenderingMode().toLowerCase()
    }
    C.prototype.k = function() {
        return this.e.config
    };

    function pa(b, a, c) {
        function d() {
            l = {};
            G = !1;
            h = 0
        }

        function e(b) {
            return function(a) {
                if (!v) {
                    var c = l[b];
                    if ("meta" === b && (a = a.metadata || a, c && (a.width = a.width || c.width, a.height = a.height || c.height, a.duration = a.duration || c.duration), $(g) && (100 === a.duration || 0 === a.duration) && 0 === a.width && 0 === a.height)) return;
                    l[b] = a;
                    "play" === b && (c || (q = 0), s = g.e.getPosition());
                    if (l.play && l.meta && l.levels && !G) {
                        a = Z(g);
                        var c = H(a),
                            e = a.title || "",
                            d;
                        a: {
                            if ((d = l.levels) && d.w && d.w.length && (d = d.w[0]) && "auto" === ("" + d.label).toLowerCase()) {
                                d =
                                    5;
                                break a
                            }
                            if ((d = a.sources) && d.length && (d = d[0].type, "aac" == d || "mp3" == d || "vorbis" == d)) {
                                d = 6;
                                break a
                            }
                            d = l.meta || {};
                            var m = d.width | 0;
                            d = 0 === m ? 0 < (d.height | 0) ? 0 : 6 : 320 >= m ? 1 : 640 >= m ? 2 : 1280 >= m ? 3 : 4
                        }
                        var m = z(),
                            h;
                        h = m | 0;
                        h = 0 >= h ? 0 : 15 > h ? 1 : 300 >= h ? 2 : 1200 >= h ? 3 : 4;
                        m = B(m);
                        x = $(g) ? 1 : 0;
                        W(I, r, "s", [f("ph", y, 1), f("pi", J, 8), f("m", x, 10), f("a", g.k().autostart ? 1 : 0, 11), f("ed", n, 20), f("vs", d, 21), f("l", h, 22), f("q", m, 23), f("mu", c, 100), f("t", e, 102), f("id", a.mediaid || "", 101)]);
                        G = !0
                    }
                }
            }
        }

        function z() {
            var a = g.e.getDuration();
            if (0 >= a) {
                var b = l.meta;
                b && (a = b.duration)
            }
            return a | 0
        }

        function B(a) {
            a |= 0;
            return 0 >= a ? 0 : 30 > a ? 1 : 60 > a ? 4 : 180 > a ? 8 : 300 > a ? 16 : 32
        }

        function ga() {
            s = g.e.getPosition();
            h = 0
        }

        function H(a) {
            var b;
            if (b = a.sources) {
                a = [];
                for (var c = b.length; c--;) b[c].file && a.push(b[c].file);
                a.sort();
                b = a[0]
            } else b = a.file;
            var d;
            var e = b;
            if (e.match(/^[a-zA-Z]+:\/\//)) d = e;
            else {
                d = d || document.location.href;
                b = d.substring(0, d.indexOf("://") + 3);
                a = d.substring(b.length, d.indexOf("/", b.length + 1));
                c = e.split("/");
                0 !== e.indexOf("/") && (d = d.split("?")[0], d = d.substring(b.length +
                    a.length + 1, d.lastIndexOf("/")), c = d.split("/").concat(c));
                d = [];
                for (e = 0; e < c.length; e++) c[e] && "." != c[e] && (".." == c[e] ? d.pop() : d.push(c[e]));
                d = b + a + "/" + d.join("/")
            }
            return d
        }

        function qa() {
            var a = g.k(),
                b = g.e.getWidth(),
                d = /\d+%/.test(a.width || b);
            if (d && a.aspectratio) return 4;
            if (a.height) {
                var e = 0;
                a.listbar && "bottom" === a.listbar.position && (e = a.listbar.size);
                if (40 >= a.height - e) return 5
            }
            d && c && c.parentNode && (b = c.parentNode.offsetWidth);
            b |= 0;
            return 0 === b ? 0 : 320 >= b ? 1 : 640 >= b ? 2 : 3
        }

        function S(a, b, c) {
            var d = Z(g),
                e = H(d),
                h =
                d.title || "";
            b = b + 0.5 | 0;
            0 < b && W(I, r, "t", [f("ph", y, 1), f("pi", J, 8), f("ed", n, 20), f("ti", b, 21), f("pw", a | 0, 22), f("q", c, 23), f("mu", e, 100), f("t", h, 102), f("id", d.mediaid || "", 101)])
        }

        function ra(a) {
            a.T ? v = !0 : v = !1
        }
        if (!1 !== a.enabled) {
            var f = function(a, b, c) {
                    return new U(a, b, c)
                },
                T = false || !0 === a.debug,
                g = new C(b),
                J = String(a.id || "").substring(0, 34),
                y = (b = window.jwplayer.defaults) && b.ph ? b.ph : 0;
            2 === parseInt(a.sdkplatform) && (y = "");
            var x, n = 0,
                r;
            if (window.jwplayer.key) {
                b = new window.jwplayer.utils.key(window.jwplayer.key);
                var t = b.edition();
                "invalid" != t && (r = b.token());
                "enterprise" == t ? n = 6 : "invalid" == t ? n = 4 : "ads" == t ? n = 3 : "premium" == t ? n = 2 : "pro" == t && (n = 1)
            }
            r || (r = "_");
            var sa = new u(g, T, r, n),
                I = new la(a, T),
                l, G, h, q = 0,
                s = null,
                v = !1;
            ma(g, function() {
                var a = Z(g),
                    b = H(a),
                    c = a.title || "",
                    d = qa();
                x = $(g) ? 1 : 0;
                W(I, r, "e", [f("ph", y, 1), f("pi", J, 8), f("a", g.k().autostart ? 1 : 0, 11), f("ed", n, 20), f("ps", d, 21), f("mu", b, 100), f("t", c, 102), f("m", x, 10), f("id", a.mediaid || "", 101)]);
                sa.u()
            });
            g.e.onPlay(e("play"));
            g.e.onMeta(e("meta"));
            g.e.onQualityLevels(e("levels"));
            if (g.e.onCast) g.e.onCast(ra);
            oa(g, function(a) {
                if (!v) {
                    var b = a.position,
                        c = a.duration;
                    if (b) {
                        if (1 < b) {
                            if (!l.meta) {
                                a = {
                                    duration: c
                                };
                                if ($(g)) {
                                    var d = $(g) ? g.e.getContainer().getElementsByTagName("video")[0] : null;
                                    d && (a.width = d.videoWidth, a.height = d.videoHeight)
                                }
                                e("meta")(a)
                            }
                            l.levels || e("levels")({})
                        }
                        a = B(c);
                        c = b / (c / a) + 1 | 0;
                        0 === h && (h = c);
                        null === s && (s = b);
                        d = b - s;
                        s = b;
                        d = Math.min(Math.max(0, d), 4);
                        q += d;
                        c === h + 1 && (b = 128 * h / a, h = 0, c > a || (S(b, q, a), q = 0))
                    }
                }
            });
            na(g, function() {
                if (!v) {
                    var a = z();
                    0 >= a || (S(128, q, B(a)), q = 0)
                }
            });
            g.e.onSeek(ga);
            g.e.onIdle(d);
            g.e.onPlaylistItem(d);
            d()
        }
    }
    window.jwplayer && window.jwplayer() && window.jwplayer().registerPlugin("jwpsrv", "6.0", pa);
})();