/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var assert = Shumway.Debug.assert;
        var clamp = Shumway.NumberUtilities.clamp;
        (function (TraceLevel) {
            TraceLevel[TraceLevel["None"] = 0] = "None";
            TraceLevel[TraceLevel["Brief"] = 1] = "Brief";
            TraceLevel[TraceLevel["Verbose"] = 2] = "Verbose";
        })(GFX.TraceLevel || (GFX.TraceLevel = {}));
        var TraceLevel = GFX.TraceLevel;
        var counter = Shumway.Metrics.Counter.instance;
        GFX.frameCounter = new Shumway.Metrics.Counter(true);
        GFX.traceLevel = 2 /* Verbose */;
        GFX.writer = null;
        function frameCount(name) {
            counter.count(name);
            GFX.frameCounter.count(name);
        }
        GFX.frameCount = frameCount;
        GFX.timelineBuffer = new Shumway.Tools.Profiler.TimelineBuffer("GFX");
        function enterTimeline(name, data) {
            profile && GFX.timelineBuffer && GFX.timelineBuffer.enter(name, data);
        }
        GFX.enterTimeline = enterTimeline;
        function leaveTimeline(name, data) {
            profile && GFX.timelineBuffer && GFX.timelineBuffer.leave(name, data);
        }
        GFX.leaveTimeline = leaveTimeline;
        var nativeAddColorStop = null;
        var nativeCreateLinearGradient = null;
        var nativeCreateRadialGradient = null;
        /**
         * Transforms a fill or stroke style by the given color matrix.
         */
        function transformStyle(context, style, colorMatrix) {
            if (!polyfillColorTransform || !colorMatrix) {
                return style;
            }
            if (typeof style === "string") {
                // Parse CSS color styles and transform them.
                var rgba = Shumway.ColorUtilities.cssStyleToRGBA(style);
                return Shumway.ColorUtilities.rgbaToCSSStyle(colorMatrix.transformRGBA(rgba));
            }
            else if (style instanceof CanvasGradient) {
                if (style._template) {
                    // If gradient style has a template, construct a new gradient style from it whith
                    // its color stops transformed.
                    return style._template.createCanvasGradient(context, colorMatrix);
                }
            }
            return style; // "#ff69b4"
        }
        /**
         * Whether to polyfill color transforms. This adds a |globalColorMatrix| property on |CanvasRenderingContext2D|
         * that is used to transform all stroke and fill styles before a drawing operation happens.
         */
        var polyfillColorTransform = true;
        /**
         * Gradients are opaque objects and their properties cannot be inspected. Here we hijack gradient style constructors
         * and attach "template" objects on gradients so that we can keep track of their position attributes and color stops.
         * Using these "template" objects, we can clone and transform gradients.
         */
        if (polyfillColorTransform && typeof CanvasRenderingContext2D !== 'undefined') {
            nativeAddColorStop = CanvasGradient.prototype.addColorStop;
            nativeCreateLinearGradient = CanvasRenderingContext2D.prototype.createLinearGradient;
            nativeCreateRadialGradient = CanvasRenderingContext2D.prototype.createRadialGradient;
            CanvasRenderingContext2D.prototype.createLinearGradient = function (x0, y0, x1, y1) {
                var gradient = new CanvasLinearGradient(x0, y0, x1, y1);
                return gradient.createCanvasGradient(this, null);
            };
            CanvasRenderingContext2D.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
                var gradient = new CanvasRadialGradient(x0, y0, r0, x1, y1, r1);
                return gradient.createCanvasGradient(this, null);
            };
            CanvasGradient.prototype.addColorStop = function (offset, color) {
                nativeAddColorStop.call(this, offset, color);
                this._template.addColorStop(offset, color);
            };
        }
        var ColorStop = (function () {
            function ColorStop(offset, color) {
                this.offset = offset;
                this.color = color;
                // ...
            }
            return ColorStop;
        })();
        /**
         * Template for linear gradients.
         */
        var CanvasLinearGradient = (function () {
            function CanvasLinearGradient(x0, y0, x1, y1) {
                this.x0 = x0;
                this.y0 = y0;
                this.x1 = x1;
                this.y1 = y1;
                this.colorStops = [];
                // ...
            }
            CanvasLinearGradient.prototype.addColorStop = function (offset, color) {
                this.colorStops.push(new ColorStop(offset, color));
            };
            CanvasLinearGradient.prototype.createCanvasGradient = function (context, colorMatrix) {
                var gradient = nativeCreateLinearGradient.call(context, this.x0, this.y0, this.x1, this.y1);
                var colorStops = this.colorStops;
                for (var i = 0; i < colorStops.length; i++) {
                    var colorStop = colorStops[i];
                    var offset = colorStop.offset;
                    var color = colorStop.color;
                    color = colorMatrix ? transformStyle(context, color, colorMatrix) : color;
                    nativeAddColorStop.call(gradient, offset, color);
                }
                gradient._template = this;
                gradient._transform = this._transform;
                return gradient;
            };
            return CanvasLinearGradient;
        })();
        /**
         * Template for radial gradients.
         */
        var CanvasRadialGradient = (function () {
            function CanvasRadialGradient(x0, y0, r0, x1, y1, r1) {
                this.x0 = x0;
                this.y0 = y0;
                this.r0 = r0;
                this.x1 = x1;
                this.y1 = y1;
                this.r1 = r1;
                this.colorStops = [];
                // ...
            }
            CanvasRadialGradient.prototype.addColorStop = function (offset, color) {
                this.colorStops.push(new ColorStop(offset, color));
            };
            CanvasRadialGradient.prototype.createCanvasGradient = function (context, colorMatrix) {
                var gradient = nativeCreateRadialGradient.call(context, this.x0, this.y0, this.r0, this.x1, this.y1, this.r1);
                var colorStops = this.colorStops;
                for (var i = 0; i < colorStops.length; i++) {
                    var colorStop = colorStops[i];
                    var offset = colorStop.offset;
                    var color = colorStop.color;
                    color = colorMatrix ? transformStyle(context, color, colorMatrix) : color;
                    nativeAddColorStop.call(gradient, offset, color);
                }
                gradient._template = this;
                gradient._transform = this._transform;
                return gradient;
            };
            return CanvasRadialGradient;
        })();
        var PathCommand;
        (function (PathCommand) {
            PathCommand[PathCommand["ClosePath"] = 1] = "ClosePath";
            PathCommand[PathCommand["MoveTo"] = 2] = "MoveTo";
            PathCommand[PathCommand["LineTo"] = 3] = "LineTo";
            PathCommand[PathCommand["QuadraticCurveTo"] = 4] = "QuadraticCurveTo";
            PathCommand[PathCommand["BezierCurveTo"] = 5] = "BezierCurveTo";
            PathCommand[PathCommand["ArcTo"] = 6] = "ArcTo";
            PathCommand[PathCommand["Rect"] = 7] = "Rect";
            PathCommand[PathCommand["Arc"] = 8] = "Arc";
            PathCommand[PathCommand["Save"] = 9] = "Save";
            PathCommand[PathCommand["Restore"] = 10] = "Restore";
            PathCommand[PathCommand["Transform"] = 11] = "Transform";
        })(PathCommand || (PathCommand = {}));
        /**
         * Polyfill for missing |Path2D|. An instance of this class keeps a record of all drawing commands
         * ever called on it.
         */
        var Path = (function () {
            function Path(arg) {
                this._commands = new Uint8Array(Path._arrayBufferPool.acquire(8), 0, 8);
                this._commandPosition = 0;
                this._data = new Float64Array(Path._arrayBufferPool.acquire(8 * Float64Array.BYTES_PER_ELEMENT), 0, 8);
                this._dataPosition = 0;
                if (arg instanceof Path) {
                    this.addPath(arg);
                }
            }
            /**
             * Takes a |Path2D| instance and a 2d context to replay the recorded drawing commands.
             */
            Path._apply = function (path, context) {
                var commands = path._commands;
                var d = path._data;
                var i = 0;
                var j = 0;
                context.beginPath();
                var commandPosition = path._commandPosition;
                while (i < commandPosition) {
                    switch (commands[i++]) {
                        case 1 /* ClosePath */:
                            context.closePath();
                            break;
                        case 2 /* MoveTo */:
                            context.moveTo(d[j++], d[j++]);
                            break;
                        case 3 /* LineTo */:
                            context.lineTo(d[j++], d[j++]);
                            break;
                        case 4 /* QuadraticCurveTo */:
                            context.quadraticCurveTo(d[j++], d[j++], d[j++], d[j++]);
                            break;
                        case 5 /* BezierCurveTo */:
                            context.bezierCurveTo(d[j++], d[j++], d[j++], d[j++], d[j++], d[j++]);
                            break;
                        case 6 /* ArcTo */:
                            context.arcTo(d[j++], d[j++], d[j++], d[j++], d[j++]);
                            break;
                        case 7 /* Rect */:
                            context.rect(d[j++], d[j++], d[j++], d[j++]);
                            break;
                        case 8 /* Arc */:
                            context.arc(d[j++], d[j++], d[j++], d[j++], d[j++], !!d[j++]);
                            break;
                        case 9 /* Save */:
                            context.save();
                            break;
                        case 10 /* Restore */:
                            context.restore();
                            break;
                        case 11 /* Transform */:
                            context.transform(d[j++], d[j++], d[j++], d[j++], d[j++], d[j++]);
                            break;
                    }
                }
            };
            Path.prototype._ensureCommandCapacity = function (length) {
                this._commands = Path._arrayBufferPool.ensureUint8ArrayLength(this._commands, length);
            };
            Path.prototype._ensureDataCapacity = function (length) {
                this._data = Path._arrayBufferPool.ensureFloat64ArrayLength(this._data, length);
            };
            Path.prototype._writeCommand = function (command) {
                if (this._commandPosition >= this._commands.length) {
                    this._ensureCommandCapacity(this._commandPosition + 1);
                }
                this._commands[this._commandPosition++] = command;
            };
            Path.prototype._writeData = function (a, b, c, d, e, f) {
                var argc = arguments.length;
                release || assert(argc <= 6 && (argc % 2 === 0 || argc === 5));
                if (this._dataPosition + argc >= this._data.length) {
                    this._ensureDataCapacity(this._dataPosition + argc);
                }
                var data = this._data;
                var p = this._dataPosition;
                data[p] = a;
                data[p + 1] = b;
                if (argc > 2) {
                    data[p + 2] = c;
                    data[p + 3] = d;
                    if (argc > 4) {
                        data[p + 4] = e;
                        if (argc === 6) {
                            data[p + 5] = f;
                        }
                    }
                }
                this._dataPosition += argc;
            };
            Path.prototype.closePath = function () {
                this._writeCommand(1 /* ClosePath */);
            };
            Path.prototype.moveTo = function (x, y) {
                this._writeCommand(2 /* MoveTo */);
                this._writeData(x, y);
            };
            Path.prototype.lineTo = function (x, y) {
                this._writeCommand(3 /* LineTo */);
                this._writeData(x, y);
            };
            Path.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
                this._writeCommand(4 /* QuadraticCurveTo */);
                this._writeData(cpx, cpy, x, y);
            };
            Path.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
                this._writeCommand(5 /* BezierCurveTo */);
                this._writeData(cp1x, cp1y, cp2x, cp2y, x, y);
            };
            Path.prototype.arcTo = function (x1, y1, x2, y2, radius) {
                this._writeCommand(6 /* ArcTo */);
                this._writeData(x1, y1, x2, y2, radius);
            };
            Path.prototype.rect = function (x, y, width, height) {
                this._writeCommand(7 /* Rect */);
                this._writeData(x, y, width, height);
            };
            Path.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
                this._writeCommand(8 /* Arc */);
                this._writeData(x, y, radius, startAngle, endAngle, +anticlockwise);
            };
            /**
             * Copies and transforms all drawing commands stored in |path|.
             */
            Path.prototype.addPath = function (path, transformation) {
                if (transformation) {
                    this._writeCommand(9 /* Save */);
                    this._writeCommand(11 /* Transform */);
                    this._writeData(transformation.a, transformation.b, transformation.c, transformation.d, transformation.e, transformation.f);
                }
                // Copy commands.
                var newCommandPosition = this._commandPosition + path._commandPosition;
                if (newCommandPosition >= this._commands.length) {
                    this._ensureCommandCapacity(newCommandPosition);
                }
                var commands = this._commands;
                var pathCommands = path._commands;
                for (var i = this._commandPosition, j = 0; i < newCommandPosition; i++) {
                    commands[i] = pathCommands[j++];
                }
                this._commandPosition = newCommandPosition;
                // Copy data.
                var newDataPosition = this._dataPosition + path._dataPosition;
                if (newDataPosition >= this._data.length) {
                    this._ensureDataCapacity(newDataPosition);
                }
                var data = this._data;
                var pathData = path._data;
                for (var i = this._dataPosition, j = 0; i < newDataPosition; i++) {
                    data[i] = pathData[j++];
                }
                this._dataPosition = newDataPosition;
                if (transformation) {
                    this._writeCommand(10 /* Restore */);
                }
            };
            Path._arrayBufferPool = new Shumway.ArrayBufferPool();
            return Path;
        })();
        GFX.Path = Path;
        // Polyfill |Path2D| if it is not defined or if its |addPath| method doesn't exist. This means that we
        // always need to polyfill this in FF until addPath lands which sucks.
        if (typeof CanvasRenderingContext2D !== 'undefined' && (typeof Path2D === 'undefined' || !Path2D.prototype.addPath)) {
            /**
             * We override all methods of |CanvasRenderingContext2D| that accept a |Path2D| object as one
             * of its arguments, so that we can apply all recorded drawing commands before calling the
             * original function.
             */
            var nativeFill = CanvasRenderingContext2D.prototype.fill;
            CanvasRenderingContext2D.prototype.fill = (function (path, fillRule) {
                if (arguments.length) {
                    if (path instanceof Path) {
                        Path._apply(path, this);
                    }
                    else {
                        fillRule = path;
                    }
                }
                if (fillRule) {
                    nativeFill.call(this, fillRule);
                }
                else {
                    nativeFill.call(this);
                }
            });
            var nativeStroke = CanvasRenderingContext2D.prototype.stroke;
            CanvasRenderingContext2D.prototype.stroke = (function (path, fillRule) {
                if (arguments.length) {
                    if (path instanceof Path) {
                        Path._apply(path, this);
                    }
                    else {
                        fillRule = path;
                    }
                }
                if (fillRule) {
                    nativeStroke.call(this, fillRule);
                }
                else {
                    nativeStroke.call(this);
                }
            });
            var nativeClip = CanvasRenderingContext2D.prototype.clip;
            CanvasRenderingContext2D.prototype.clip = (function (path, fillRule) {
                if (arguments.length) {
                    if (path instanceof Path) {
                        Path._apply(path, this);
                    }
                    else {
                        fillRule = path;
                    }
                }
                if (fillRule) {
                    nativeClip.call(this, fillRule);
                }
                else {
                    nativeClip.call(this);
                }
            });
            // Expose our pollyfill to the global object.
            window['Path2D'] = Path;
        }
        if (typeof CanvasPattern !== "undefined") {
            /**
             * Polyfill |setTransform| on |CanvasPattern| and |CanvasGradient|. Firefox implements this for |CanvasPattern|
             * in Nightly but doesn't for |CanvasGradient| yet.
             *
             * This polyfill uses |Path2D|, which is polyfilled above. You can get a native implementaiton of |Path2D| in
             * Chrome if you enable experimental canvas features in |chrome://flags/|. In Firefox you'll have to wait for
             * https://bugzilla.mozilla.org/show_bug.cgi?id=985801 to land.
             */
            if (Path2D.prototype.addPath) {
                function setTransform(matrix) {
                    this._transform = matrix;
                    if (this._template) {
                        this._template._transform = matrix;
                    }
                }
                if (!CanvasPattern.prototype.setTransform) {
                    CanvasPattern.prototype.setTransform = setTransform;
                }
                if (!CanvasGradient.prototype.setTransform) {
                    CanvasGradient.prototype.setTransform = setTransform;
                }
                var originalFill = CanvasRenderingContext2D.prototype.fill;
                var originalStroke = CanvasRenderingContext2D.prototype.stroke;
                /**
                 * If the current fillStyle is a |CanvasPattern| or |CanvasGradient| that has a SVGMatrix transformed applied to it, we
                 * first apply the pattern's transform to the current context and then draw the path with the
                 * inverse fillStyle transform applied to it so that it is drawn in the expected original location.
                 */
                CanvasRenderingContext2D.prototype.fill = (function fill(path, fillRule) {
                    var supportsStyle = this.fillStyle instanceof CanvasPattern || this.fillStyle instanceof CanvasGradient;
                    var hasStyleTransformation = !!this.fillStyle._transform;
                    if (supportsStyle && hasStyleTransformation && path instanceof Path2D) {
                        var m = this.fillStyle._transform;
                        var i;
                        try {
                            i = m.inverse();
                        }
                        catch (e) {
                            i = m = GFX.Geometry.Matrix.createIdentitySVGMatrix();
                        }
                        // Transform the context by the style transform ...
                        this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
                        // transform the path by the inverse of the style transform ...
                        var transformedPath = new Path2D();
                        transformedPath.addPath(path, i);
                        // draw the transformed path, which should render it in its original position but with a transformed style.
                        originalFill.call(this, transformedPath, fillRule);
                        this.transform(i.a, i.b, i.c, i.d, i.e, i.f);
                        return;
                    }
                    if (arguments.length === 0) {
                        originalFill.call(this);
                    }
                    else if (arguments.length === 1) {
                        originalFill.call(this, path);
                    }
                    else if (arguments.length === 2) {
                        originalFill.call(this, path, fillRule);
                    }
                });
                /**
                 * Same as for |fill| above.
                 */
                CanvasRenderingContext2D.prototype.stroke = (function stroke(path) {
                    var supportsStyle = this.strokeStyle instanceof CanvasPattern || this.strokeStyle instanceof CanvasGradient;
                    var hasStyleTransformation = !!this.strokeStyle._transform;
                    if (supportsStyle && hasStyleTransformation && path instanceof Path2D) {
                        var m = this.strokeStyle._transform;
                        var i = m.inverse();
                        // Transform the context by the style transform ...
                        this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
                        // transform the path by the inverse of the style transform ...
                        var transformedPath = new Path2D();
                        transformedPath.addPath(path, i);
                        // draw the transformed path, which should render it in its original position but with a transformed style.
                        var oldLineWidth = this.lineWidth;
                        this.lineWidth *= (i.a + i.d) / 2; // Scale the lineWidth down since it will be scaled up by the current transform.
                        originalStroke.call(this, transformedPath);
                        this.transform(i.a, i.b, i.c, i.d, i.e, i.f);
                        this.lineWidth = oldLineWidth;
                        return;
                    }
                    if (arguments.length === 0) {
                        originalStroke.call(this);
                    }
                    else if (arguments.length === 1) {
                        originalStroke.call(this, path);
                    }
                });
            }
        }
        if (typeof CanvasRenderingContext2D !== 'undefined') {
            (function () {
                /**
                 * Flash does not go below this number.
                 */
                var MIN_LINE_WIDTH = 1;
                /**
                 * Arbitrarily chosen large number.
                 */
                var MAX_LINE_WIDTH = 1024;
                var hasCurrentTransform = 'currentTransform' in CanvasRenderingContext2D.prototype;
                /**
                 * There's an impedance mismatch between Flash's vector drawing model and that of Canvas2D[1]: Flash applies scaling
                 * of stroke widths once by (depending on settings for the shape) using the concatenated horizontal scaling, vertical
                 * scaling, or a geometric average of the two. The calculated width is then uniformly applied at every point on the
                 * stroke. Canvas2D, OTOH, calculates scaling for each point individually. I.e., horizontal line segments aren't
                 * affected by vertical scaling and vice versa, with non-axis-alined line segments being partly affected.
                 * Additionally, Flash draws all strokes with at least 1px on-stage width, whereas Canvas draws finer-in-appearance
                 * lines by interpolating colors accordingly. To fix both of these, we have to apply any transforms to the geometry
                 * only, not the stroke style. That's only possible by building the untransformed geometry in a Path2D and, each time
                 * we rasterize, adding that with the current concatenated transform applied to a temporary Path2D, which we then draw
                 * in global coordinate space.
                 *
                 * Implements Flash stroking behavior.
                 */
                CanvasRenderingContext2D.prototype.flashStroke = function (path, lineScaleMode) {
                    if (!hasCurrentTransform) {
                        // Chrome doesn't have |currentTransform| yet, so fall back on normal stroking.
                        // |currentTransform| is available only if you enable experimental features.
                        this.stroke(path);
                        return;
                    }
                    var m = this.currentTransform;
                    var transformedPath = new Path2D();
                    // Transform the path by the current transform ...
                    transformedPath.addPath(path, m);
                    var oldLineWidth = this.lineWidth;
                    this.setTransform(1, 0, 0, 1, 0, 0);
                    switch (lineScaleMode) {
                        case 0 /* None */:
                            break;
                        case 1 /* Normal */:
                            this.lineWidth = clamp(oldLineWidth * (Shumway.getScaleX(m) + Shumway.getScaleY(m)) / 2, MIN_LINE_WIDTH, MAX_LINE_WIDTH);
                            break;
                        case 2 /* Vertical */:
                            this.lineWidth = clamp(oldLineWidth * Shumway.getScaleY(m), MIN_LINE_WIDTH, MAX_LINE_WIDTH);
                            break;
                        case 3 /* Horizontal */:
                            this.lineWidth = clamp(oldLineWidth * Shumway.getScaleX(m), MIN_LINE_WIDTH, MAX_LINE_WIDTH);
                            break;
                    }
                    // Stroke and restore the previous matrix.
                    this.stroke(transformedPath);
                    this.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
                    this.lineWidth = oldLineWidth;
                };
                // A complete polyfill of currentTransform isn't feasible: we want to only use it if it gives
                // us a meaningful value. That we can only get if the platform gives us any means at all to
                // get that value. Gecko does so in the form of mozCurrentTransform, most engines don't.
                // For Chrome, at least return whatever transform was set using setTransform to ensure
                // clipping works in our 2D backend.
                if (!hasCurrentTransform) {
                    if ('mozCurrentTransform' in CanvasRenderingContext2D.prototype) {
                        Object.defineProperty(CanvasRenderingContext2D.prototype, 'currentTransform', {
                            get: mozPolyfillCurrentTransform
                        });
                        hasCurrentTransform = true;
                    }
                    else {
                        var nativeSetTransform = CanvasRenderingContext2D.prototype.setTransform;
                        CanvasRenderingContext2D.prototype.setTransform = (function setTransform(a, b, c, d, e, f) {
                            var transform = this.currentTransform;
                            transform.a = a;
                            transform.b = b;
                            transform.c = c;
                            transform.d = d;
                            transform.e = e;
                            transform.f = f;
                            nativeSetTransform.call(this, a, b, c, d, e, f);
                        });
                        Object.defineProperty(CanvasRenderingContext2D.prototype, 'currentTransform', {
                            get: function () {
                                return this._currentTransform || (this._currentTransform = GFX.Geometry.Matrix.createIdentitySVGMatrix());
                            }
                        });
                    }
                }
                function mozPolyfillCurrentTransform() {
                    release || assert(this.mozCurrentTransform);
                    return GFX.Geometry.Matrix.createSVGMatrixFromArray(this.mozCurrentTransform);
                }
            })();
        }
        /**
         * Polyfill |globalColorMatrix| on |CanvasRenderingContext2D|.
         */
        if (typeof CanvasRenderingContext2D !== 'undefined' && CanvasRenderingContext2D.prototype.globalColorMatrix === undefined) {
            var previousFill = CanvasRenderingContext2D.prototype.fill;
            var previousStroke = CanvasRenderingContext2D.prototype.stroke;
            var previousFillText = CanvasRenderingContext2D.prototype.fillText;
            var previousStrokeText = CanvasRenderingContext2D.prototype.strokeText;
            Object.defineProperty(CanvasRenderingContext2D.prototype, "globalColorMatrix", {
                get: function () {
                    if (this._globalColorMatrix) {
                        return this._globalColorMatrix.clone();
                    }
                    return null;
                },
                set: function (matrix) {
                    if (!matrix) {
                        this._globalColorMatrix = null;
                        return;
                    }
                    if (this._globalColorMatrix) {
                        this._globalColorMatrix.set(matrix);
                    }
                    else {
                        this._globalColorMatrix = matrix.clone();
                    }
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Intercept calls to |fill| and transform fill style if a |globalColorMatrix| is set.
             */
            CanvasRenderingContext2D.prototype.fill = (function (a, b) {
                var oldFillStyle = null;
                if (this._globalColorMatrix) {
                    oldFillStyle = this.fillStyle;
                    this.fillStyle = transformStyle(this, this.fillStyle, this._globalColorMatrix);
                }
                if (arguments.length === 0) {
                    previousFill.call(this);
                }
                else if (arguments.length === 1) {
                    previousFill.call(this, a);
                }
                else if (arguments.length === 2) {
                    previousFill.call(this, a, b);
                }
                if (oldFillStyle) {
                    this.fillStyle = oldFillStyle;
                }
            });
            /**
             * Same as |fill| above.
             */
            CanvasRenderingContext2D.prototype.stroke = (function (a, b) {
                var oldStrokeStyle = null;
                if (this._globalColorMatrix) {
                    oldStrokeStyle = this.strokeStyle;
                    this.strokeStyle = transformStyle(this, this.strokeStyle, this._globalColorMatrix);
                }
                if (arguments.length === 0) {
                    previousStroke.call(this);
                }
                else if (arguments.length === 1) {
                    previousStroke.call(this, a);
                }
                if (oldStrokeStyle) {
                    this.strokeStyle = oldStrokeStyle;
                }
            });
            /**
             * Same as |fill| above.
             */
            CanvasRenderingContext2D.prototype.fillText = (function (text, x, y, maxWidth) {
                var oldFillStyle = null;
                if (this._globalColorMatrix) {
                    oldFillStyle = this.fillStyle;
                    this.fillStyle = transformStyle(this, this.fillStyle, this._globalColorMatrix);
                }
                if (arguments.length === 3) {
                    previousFillText.call(this, text, x, y);
                }
                else if (arguments.length === 4) {
                    previousFillText.call(this, text, x, y, maxWidth);
                }
                else {
                    Shumway.Debug.unexpected();
                }
                if (oldFillStyle) {
                    this.fillStyle = oldFillStyle;
                }
            });
            /**
             * Same as |fill| above.
             */
            CanvasRenderingContext2D.prototype.strokeText = (function (text, x, y, maxWidth) {
                var oldStrokeStyle = null;
                if (this._globalColorMatrix) {
                    oldStrokeStyle = this.strokeStyle;
                    this.strokeStyle = transformStyle(this, this.strokeStyle, this._globalColorMatrix);
                }
                if (arguments.length === 3) {
                    previousStrokeText.call(this, text, x, y);
                }
                else if (arguments.length === 4) {
                    previousStrokeText.call(this, text, x, y, maxWidth);
                }
                else {
                    Shumway.Debug.unexpected();
                }
                if (oldStrokeStyle) {
                    this.strokeStyle = oldStrokeStyle;
                }
            });
        }
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var ScreenShot = (function () {
            function ScreenShot(dataURL, w, h) {
                this.dataURL = dataURL;
                this.w = w;
                this.h = h;
                // ...
            }
            return ScreenShot;
        })();
        GFX.ScreenShot = ScreenShot;
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var assert = Shumway.Debug.assert;
    /**
     * Maintains a LRU doubly-linked list.
     */
    var LRUList = (function () {
        function LRUList() {
            this._count = 0;
            this._head = this._tail = null;
        }
        Object.defineProperty(LRUList.prototype, "count", {
            get: function () {
                return this._count;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LRUList.prototype, "head", {
            /**
             * Gets the node at the front of the list. Returns |null| if the list is empty.
             */
            get: function () {
                return this._head;
            },
            enumerable: true,
            configurable: true
        });
        LRUList.prototype._unshift = function (node) {
            release || assert(!node.next && !node.previous);
            if (this._count === 0) {
                this._head = this._tail = node;
            }
            else {
                node.next = this._head;
                node.next.previous = node;
                this._head = node;
            }
            this._count++;
        };
        LRUList.prototype._remove = function (node) {
            release || assert(this._count > 0);
            if (node === this._head && node === this._tail) {
                this._head = this._tail = null;
            }
            else if (node === this._head) {
                this._head = (node.next);
                this._head.previous = null;
            }
            else if (node == this._tail) {
                this._tail = (node.previous);
                this._tail.next = null;
            }
            else {
                node.previous.next = node.next;
                node.next.previous = node.previous;
            }
            node.previous = node.next = null;
            this._count--;
        };
        /**
         * Adds or moves a node to the front of the list.
         */
        LRUList.prototype.use = function (node) {
            if (this._head === node) {
                return;
            }
            if (node.next || node.previous || this._tail === node) {
                this._remove(node);
            }
            this._unshift(node);
        };
        /**
         * Removes a node from the front of the list.
         */
        LRUList.prototype.pop = function () {
            if (!this._tail) {
                return null;
            }
            var node = this._tail;
            this._remove(node);
            return node;
        };
        /**
         * Visits each node in the list in the forward or reverse direction as long as
         * the callback returns |true|;
         */
        LRUList.prototype.visit = function (callback, forward) {
            if (forward === void 0) { forward = true; }
            var node = (forward ? this._head : this._tail);
            while (node) {
                if (!callback(node)) {
                    break;
                }
                node = (forward ? node.next : node.previous);
            }
        };
        return LRUList;
    })();
    Shumway.LRUList = LRUList;
    function getDeterminant(matrix) {
        return matrix.a * matrix.d - matrix.b * matrix.c;
    }
    function getScaleX(matrix) {
        return matrix.a;
        if (matrix.a === 1 && matrix.b === 0) {
            return 1;
        }
        var result = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
        return getDeterminant(matrix) < 0 ? -result : result;
    }
    Shumway.getScaleX = getScaleX;
    function getScaleY(matrix) {
        return matrix.d;
        if (matrix.c === 0 && matrix.d === 1) {
            return 1;
        }
        var result = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
        return getDeterminant(matrix) < 0 ? -result : result;
    }
    Shumway.getScaleY = getScaleY;
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Option = Shumway.Options.Option;
        var OptionSet = Shumway.Options.OptionSet;
        var shumwayOptions = Shumway.Settings.shumwayOptions;
        var rendererOptions = shumwayOptions.register(new OptionSet("Renderer Options"));
        GFX.imageUpdateOption = rendererOptions.register(new Option("", "imageUpdate", "boolean", true, "Enable image updating."));
        GFX.imageConvertOption = rendererOptions.register(new Option("", "imageConvert", "boolean", true, "Enable image conversion."));
        GFX.stageOptions = shumwayOptions.register(new OptionSet("Stage Renderer Options"));
        GFX.forcePaint = GFX.stageOptions.register(new Option("", "forcePaint", "boolean", false, "Force repainting."));
        GFX.ignoreViewport = GFX.stageOptions.register(new Option("", "ignoreViewport", "boolean", false, "Cull elements outside of the viewport."));
        GFX.viewportLoupeDiameter = GFX.stageOptions.register(new Option("", "viewportLoupeDiameter", "number", 256, "Size of the viewport loupe.", { range: { min: 1, max: 1024, step: 1 } }));
        GFX.disableClipping = GFX.stageOptions.register(new Option("", "disableClipping", "boolean", false, "Disable clipping."));
        GFX.debugClipping = GFX.stageOptions.register(new Option("", "debugClipping", "boolean", false, "Disable clipping."));
        GFX.hud = GFX.stageOptions.register(new Option("", "hud", "boolean", false, "Enable HUD."));
        var webGLOptions = GFX.stageOptions.register(new OptionSet("WebGL Options"));
        GFX.perspectiveCamera = webGLOptions.register(new Option("", "pc", "boolean", false, "Use perspective camera."));
        GFX.perspectiveCameraFOV = webGLOptions.register(new Option("", "pcFOV", "number", 60, "Perspective Camera FOV."));
        GFX.perspectiveCameraDistance = webGLOptions.register(new Option("", "pcDistance", "number", 2, "Perspective Camera Distance."));
        GFX.perspectiveCameraAngle = webGLOptions.register(new Option("", "pcAngle", "number", 0, "Perspective Camera Angle."));
        GFX.perspectiveCameraAngleRotate = webGLOptions.register(new Option("", "pcRotate", "boolean", false, "Rotate Use perspective camera."));
        GFX.perspectiveCameraSpacing = webGLOptions.register(new Option("", "pcSpacing", "number", 0.01, "Element Spacing."));
        GFX.perspectiveCameraSpacingInflate = webGLOptions.register(new Option("", "pcInflate", "boolean", false, "Rotate Use perspective camera."));
        GFX.drawTiles = webGLOptions.register(new Option("", "drawTiles", "boolean", false, "Draw WebGL Tiles"));
        GFX.drawSurfaces = webGLOptions.register(new Option("", "drawSurfaces", "boolean", false, "Draw WebGL Surfaces."));
        GFX.drawSurface = webGLOptions.register(new Option("", "drawSurface", "number", -1, "Draw WebGL Surface #"));
        GFX.drawElements = webGLOptions.register(new Option("", "drawElements", "boolean", true, "Actually call gl.drawElements. This is useful to test if the GPU is the bottleneck."));
        GFX.disableSurfaceUploads = webGLOptions.register(new Option("", "disableSurfaceUploads", "boolean", false, "Disable surface uploads."));
        GFX.premultipliedAlpha = webGLOptions.register(new Option("", "premultipliedAlpha", "boolean", false, "Set the premultipliedAlpha flag on getContext()."));
        GFX.unpackPremultiplyAlpha = webGLOptions.register(new Option("", "unpackPremultiplyAlpha", "boolean", true, "Use UNPACK_PREMULTIPLY_ALPHA_WEBGL in pixelStorei."));
        var factorChoices = {
            ZERO: 0,
            ONE: 1,
            SRC_COLOR: 768,
            ONE_MINUS_SRC_COLOR: 769,
            DST_COLOR: 774,
            ONE_MINUS_DST_COLOR: 775,
            SRC_ALPHA: 770,
            ONE_MINUS_SRC_ALPHA: 771,
            DST_ALPHA: 772,
            ONE_MINUS_DST_ALPHA: 773,
            SRC_ALPHA_SATURATE: 776,
            CONSTANT_COLOR: 32769,
            ONE_MINUS_CONSTANT_COLOR: 32770,
            CONSTANT_ALPHA: 32771,
            ONE_MINUS_CONSTANT_ALPHA: 32772
        };
        GFX.sourceBlendFactor = webGLOptions.register(new Option("", "sourceBlendFactor", "number", factorChoices.ONE, "", { choices: factorChoices }));
        GFX.destinationBlendFactor = webGLOptions.register(new Option("", "destinationBlendFactor", "number", factorChoices.ONE_MINUS_SRC_ALPHA, "", { choices: factorChoices }));
        var canvas2DOptions = GFX.stageOptions.register(new OptionSet("Canvas2D Options"));
        GFX.clipDirtyRegions = canvas2DOptions.register(new Option("", "clipDirtyRegions", "boolean", false, "Clip dirty regions."));
        GFX.clipCanvas = canvas2DOptions.register(new Option("", "clipCanvas", "boolean", false, "Clip Regions."));
        GFX.cull = canvas2DOptions.register(new Option("", "cull", "boolean", false, "Enable culling."));
        GFX.snapToDevicePixels = canvas2DOptions.register(new Option("", "snapToDevicePixels", "boolean", false, ""));
        GFX.imageSmoothing = canvas2DOptions.register(new Option("", "imageSmoothing", "boolean", false, ""));
        GFX.masking = canvas2DOptions.register(new Option("", "masking", "boolean", true, "Composite Mask."));
        GFX.blending = canvas2DOptions.register(new Option("", "blending", "boolean", true, ""));
        GFX.debugLayers = canvas2DOptions.register(new Option("", "debugLayers", "boolean", false, ""));
        GFX.filters = canvas2DOptions.register(new Option("", "filters", "boolean", false, ""));
        GFX.cacheShapes = canvas2DOptions.register(new Option("", "cacheShapes", "boolean", true, ""));
        GFX.cacheShapesMaxSize = canvas2DOptions.register(new Option("", "cacheShapesMaxSize", "number", 256, "", { range: { min: 1, max: 1024, step: 1 } }));
        GFX.cacheShapesThreshold = canvas2DOptions.register(new Option("", "cacheShapesThreshold", "number", 256, "", { range: { min: 1, max: 1024, step: 1 } }));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Geometry;
        (function (Geometry) {
            var clamp = Shumway.NumberUtilities.clamp;
            var pow2 = Shumway.NumberUtilities.pow2;
            var epsilonEquals = Shumway.NumberUtilities.epsilonEquals;
            var assert = Shumway.Debug.assert;
            function radianToDegrees(r) {
                return r * 180 / Math.PI;
            }
            Geometry.radianToDegrees = radianToDegrees;
            function degreesToRadian(d) {
                return d * Math.PI / 180;
            }
            Geometry.degreesToRadian = degreesToRadian;
            function quadraticBezier(from, cp, to, t) {
                var inverseT = 1 - t;
                return from * inverseT * inverseT + 2 * cp * inverseT * t + to * t * t;
            }
            Geometry.quadraticBezier = quadraticBezier;
            function quadraticBezierExtreme(from, cp, to) {
                var t = (from - cp) / (from - 2 * cp + to);
                if (t < 0) {
                    return from;
                }
                if (t > 1) {
                    return to;
                }
                return quadraticBezier(from, cp, to, t);
            }
            Geometry.quadraticBezierExtreme = quadraticBezierExtreme;
            function cubicBezier(from, cp, cp2, to, t) {
                var tSq = t * t;
                var inverseT = 1 - t;
                var inverseTSq = inverseT * inverseT;
                return from * inverseT * inverseTSq + 3 * cp * t * inverseTSq + 3 * cp2 * inverseT * tSq + to * t * tSq;
            }
            Geometry.cubicBezier = cubicBezier;
            function cubicBezierExtremes(from, cp, cp2, to) {
                var d1 = cp - from;
                var d2 = cp2 - cp;
                // We only ever need d2 * 2
                d2 *= 2;
                var d3 = to - cp2;
                // Prevent division by zero by very slightly changing d3 if that would happen
                if (d1 + d3 === d2) {
                    d3 *= 1.0001;
                }
                var fHead = 2 * d1 - d2;
                var part1 = d2 - 2 * d1;
                var fCenter = Math.sqrt(part1 * part1 - 4 * d1 * (d1 - d2 + d3));
                var fTail = 2 * (d1 - d2 + d3);
                var t1 = (fHead + fCenter) / fTail;
                var t2 = (fHead - fCenter) / fTail;
                var result = [];
                if (t1 >= 0 && t1 <= 1) {
                    result.push(cubicBezier(from, cp, cp2, to, t1));
                }
                if (t2 >= 0 && t2 <= 1) {
                    result.push(cubicBezier(from, cp, cp2, to, t2));
                }
                return result;
            }
            Geometry.cubicBezierExtremes = cubicBezierExtremes;
            var E = 0.0001;
            function eqFloat(a, b) {
                return Math.abs(a - b) < E;
            }
            var Point = (function () {
                function Point(x, y) {
                    this.x = x;
                    this.y = y;
                }
                Point.prototype.setElements = function (x, y) {
                    this.x = x;
                    this.y = y;
                    return this;
                };
                Point.prototype.set = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    return this;
                };
                Point.prototype.dot = function (other) {
                    return this.x * other.x + this.y * other.y;
                };
                Point.prototype.squaredLength = function () {
                    return this.dot(this);
                };
                Point.prototype.distanceTo = function (other) {
                    return Math.sqrt(this.dot(other));
                };
                Point.prototype.sub = function (other) {
                    this.x -= other.x;
                    this.y -= other.y;
                    return this;
                };
                Point.prototype.mul = function (value) {
                    this.x *= value;
                    this.y *= value;
                    return this;
                };
                Point.prototype.clone = function () {
                    return new Point(this.x, this.y);
                };
                Point.prototype.toString = function (digits) {
                    if (digits === void 0) { digits = 2; }
                    return "{x: " + this.x.toFixed(digits) + ", y: " + this.y.toFixed(digits) + "}";
                };
                Point.prototype.inTriangle = function (a, b, c) {
                    var s = a.y * c.x - a.x * c.y + (c.y - a.y) * this.x + (a.x - c.x) * this.y;
                    var t = a.x * b.y - a.y * b.x + (a.y - b.y) * this.x + (b.x - a.x) * this.y;
                    if ((s < 0) != (t < 0)) {
                        return false;
                    }
                    var T = -b.y * c.x + a.y * (c.x - b.x) + a.x * (b.y - c.y) + b.x * c.y;
                    if (T < 0.0) {
                        s = -s;
                        t = -t;
                        T = -T;
                    }
                    return s > 0 && t > 0 && (s + t) < T;
                };
                Point.createEmpty = function () {
                    return new Point(0, 0);
                };
                Point.createEmptyPoints = function (count) {
                    var result = [];
                    for (var i = 0; i < count; i++) {
                        result.push(new Point(0, 0));
                    }
                    return result;
                };
                return Point;
            })();
            Geometry.Point = Point;
            var Point3D = (function () {
                function Point3D(x, y, z) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                }
                Point3D.prototype.setElements = function (x, y, z) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                    return this;
                };
                Point3D.prototype.set = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    this.z = other.z;
                    return this;
                };
                Point3D.prototype.dot = function (other) {
                    return this.x * other.x + this.y * other.y + this.z * other.z;
                };
                Point3D.prototype.cross = function (other) {
                    var x = this.y * other.z - this.z * other.y;
                    var y = this.z * other.x - this.x * other.z;
                    var z = this.x * other.y - this.y * other.x;
                    this.x = x;
                    this.y = y;
                    this.z = z;
                    return this;
                };
                Point3D.prototype.squaredLength = function () {
                    return this.dot(this);
                };
                Point3D.prototype.sub = function (other) {
                    this.x -= other.x;
                    this.y -= other.y;
                    this.z -= other.z;
                    return this;
                };
                Point3D.prototype.mul = function (value) {
                    this.x *= value;
                    this.y *= value;
                    this.z *= value;
                    return this;
                };
                Point3D.prototype.normalize = function () {
                    var length = Math.sqrt(this.squaredLength());
                    if (length > 0.00001) {
                        this.mul(1 / length);
                    }
                    else {
                        this.setElements(0, 0, 0);
                    }
                    return this;
                };
                Point3D.prototype.clone = function () {
                    return new Point3D(this.x, this.y, this.z);
                };
                Point3D.prototype.toString = function (digits) {
                    if (digits === void 0) { digits = 2; }
                    return "{x: " + this.x.toFixed(digits) + ", y: " + this.y.toFixed(digits) + ", z: " + this.z.toFixed(digits) + "}";
                };
                Point3D.createEmpty = function () {
                    return new Point3D(0, 0, 0);
                };
                Point3D.createEmptyPoints = function (count) {
                    var result = [];
                    for (var i = 0; i < count; i++) {
                        result.push(new Point3D(0, 0, 0));
                    }
                    return result;
                };
                return Point3D;
            })();
            Geometry.Point3D = Point3D;
            var Rectangle = (function () {
                function Rectangle(x, y, w, h) {
                    this.setElements(x, y, w, h);
                    Rectangle.allocationCount++;
                }
                Rectangle.prototype.setElements = function (x, y, w, h) {
                    this.x = x;
                    this.y = y;
                    this.w = w;
                    this.h = h;
                };
                Rectangle.prototype.set = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    this.w = other.w;
                    this.h = other.h;
                };
                Rectangle.prototype.contains = function (other) {
                    var r1 = other.x + other.w;
                    var b1 = other.y + other.h;
                    var r2 = this.x + this.w;
                    var b2 = this.y + this.h;
                    return (other.x >= this.x) && (other.x < r2) && (other.y >= this.y) && (other.y < b2) && (r1 > this.x) && (r1 <= r2) && (b1 > this.y) && (b1 <= b2);
                };
                Rectangle.prototype.containsPoint = function (point) {
                    return (point.x >= this.x) && (point.x < this.x + this.w) && (point.y >= this.y) && (point.y < this.y + this.h);
                };
                Rectangle.prototype.isContained = function (others) {
                    for (var i = 0; i < others.length; i++) {
                        if (others[i].contains(this)) {
                            return true;
                        }
                    }
                    return false;
                };
                Rectangle.prototype.isSmallerThan = function (other) {
                    return this.w < other.w && this.h < other.h;
                };
                Rectangle.prototype.isLargerThan = function (other) {
                    return this.w > other.w && this.h > other.h;
                };
                Rectangle.prototype.union = function (other) {
                    if (this.isEmpty()) {
                        this.set(other);
                        return;
                    }
                    else if (other.isEmpty()) {
                        return;
                    }
                    var x = this.x, y = this.y;
                    if (this.x > other.x) {
                        x = other.x;
                    }
                    if (this.y > other.y) {
                        y = other.y;
                    }
                    var x0 = this.x + this.w;
                    if (x0 < other.x + other.w) {
                        x0 = other.x + other.w;
                    }
                    var y0 = this.y + this.h;
                    if (y0 < other.y + other.h) {
                        y0 = other.y + other.h;
                    }
                    this.x = x;
                    this.y = y;
                    this.w = x0 - x;
                    this.h = y0 - y;
                };
                Rectangle.prototype.isEmpty = function () {
                    return this.w <= 0 || this.h <= 0;
                };
                Rectangle.prototype.setEmpty = function () {
                    this.x = 0;
                    this.y = 0;
                    this.w = 0;
                    this.h = 0;
                };
                Rectangle.prototype.intersect = function (other) {
                    var result = Rectangle.createEmpty();
                    if (this.isEmpty() || other.isEmpty()) {
                        result.setEmpty();
                        return result;
                    }
                    result.x = Math.max(this.x, other.x);
                    result.y = Math.max(this.y, other.y);
                    result.w = Math.min(this.x + this.w, other.x + other.w) - result.x;
                    result.h = Math.min(this.y + this.h, other.y + other.h) - result.y;
                    if (result.isEmpty()) {
                        result.setEmpty();
                    }
                    this.set(result);
                };
                Rectangle.prototype.intersects = function (other) {
                    if (this.isEmpty() || other.isEmpty()) {
                        return false;
                    }
                    var x = Math.max(this.x, other.x);
                    var y = Math.max(this.y, other.y);
                    var w = Math.min(this.x + this.w, other.x + other.w) - x;
                    var h = Math.min(this.y + this.h, other.y + other.h) - y;
                    return !(w <= 0 || h <= 0);
                };
                /**
                 * Tests if this rectangle intersects the AABB of the given rectangle.
                 */
                Rectangle.prototype.intersectsTransformedAABB = function (other, matrix) {
                    var rectangle = Rectangle._temporary;
                    rectangle.set(other);
                    matrix.transformRectangleAABB(rectangle);
                    return this.intersects(rectangle);
                };
                Rectangle.prototype.intersectsTranslated = function (other, tx, ty) {
                    if (this.isEmpty() || other.isEmpty()) {
                        return false;
                    }
                    var x = Math.max(this.x, other.x + tx);
                    var y = Math.max(this.y, other.y + ty);
                    var w = Math.min(this.x + this.w, other.x + tx + other.w) - x;
                    var h = Math.min(this.y + this.h, other.y + ty + other.h) - y;
                    return !(w <= 0 || h <= 0);
                };
                Rectangle.prototype.area = function () {
                    return this.w * this.h;
                };
                Rectangle.prototype.clone = function () {
                    var rectangle = Rectangle.allocate();
                    rectangle.set(this);
                    return rectangle;
                };
                Rectangle.allocate = function () {
                    var dirtyStack = Rectangle._dirtyStack;
                    if (dirtyStack.length) {
                        return dirtyStack.pop();
                    }
                    else {
                        return new Rectangle(12345, 67890, 12345, 67890);
                    }
                };
                Rectangle.prototype.free = function () {
                    Rectangle._dirtyStack.push(this);
                };
                /**
                 * Snaps the rectangle to pixel boundaries. The computed rectangle covers
                 * the original rectangle.
                 */
                Rectangle.prototype.snap = function () {
                    var x1 = Math.ceil(this.x + this.w);
                    var y1 = Math.ceil(this.y + this.h);
                    this.x = Math.floor(this.x);
                    this.y = Math.floor(this.y);
                    this.w = x1 - this.x;
                    this.h = y1 - this.y;
                    return this;
                };
                Rectangle.prototype.scale = function (x, y) {
                    this.x *= x;
                    this.y *= y;
                    this.w *= x;
                    this.h *= y;
                    return this;
                };
                Rectangle.prototype.offset = function (x, y) {
                    this.x += x;
                    this.y += y;
                    return this;
                };
                Rectangle.prototype.resize = function (w, h) {
                    this.w += w;
                    this.h += h;
                    return this;
                };
                Rectangle.prototype.expand = function (w, h) {
                    this.offset(-w, -h).resize(2 * w, 2 * h);
                    return this;
                };
                Rectangle.prototype.getCenter = function () {
                    return new Point(this.x + this.w / 2, this.y + this.h / 2);
                };
                Rectangle.prototype.getAbsoluteBounds = function () {
                    return new Rectangle(0, 0, this.w, this.h);
                };
                Rectangle.prototype.toString = function (digits) {
                    if (digits === void 0) { digits = 2; }
                    return "{" + this.x.toFixed(digits) + ", " + this.y.toFixed(digits) + ", " + this.w.toFixed(digits) + ", " + this.h.toFixed(digits) + "}";
                };
                Rectangle.createEmpty = function () {
                    var rectangle = Rectangle.allocate();
                    rectangle.setEmpty();
                    return rectangle;
                };
                Rectangle.createSquare = function (size) {
                    return new Rectangle(-size / 2, -size / 2, size, size);
                };
                /**
                 * Creates the maximum rectangle representable by signed 16 bit integers.
                 */
                Rectangle.createMaxI16 = function () {
                    return new Rectangle(-32768 /* MinI16 */, -32768 /* MinI16 */, 65535 /* MaxU16 */, 65535 /* MaxU16 */);
                };
                Rectangle.prototype.setMaxI16 = function () {
                    this.setElements(-32768 /* MinI16 */, -32768 /* MinI16 */, 65535 /* MaxU16 */, 65535 /* MaxU16 */);
                };
                Rectangle.prototype.getCorners = function (points) {
                    points[0].x = this.x;
                    points[0].y = this.y;
                    points[1].x = this.x + this.w;
                    points[1].y = this.y;
                    points[2].x = this.x + this.w;
                    points[2].y = this.y + this.h;
                    points[3].x = this.x;
                    points[3].y = this.y + this.h;
                };
                Rectangle.allocationCount = 0;
                Rectangle._temporary = new Rectangle(0, 0, 0, 0);
                Rectangle._dirtyStack = [];
                return Rectangle;
            })();
            Geometry.Rectangle = Rectangle;
            var OBB = (function () {
                function OBB(corners) {
                    this.corners = corners.map(function (corner) {
                        return corner.clone();
                    });
                    this.axes = [
                        corners[1].clone().sub(corners[0]),
                        corners[3].clone().sub(corners[0])
                    ];
                    this.origins = [];
                    for (var i = 0; i < 2; i++) {
                        this.axes[i].mul(1 / this.axes[i].squaredLength());
                        this.origins.push(corners[0].dot(this.axes[i]));
                    }
                }
                OBB.prototype.getBounds = function () {
                    return OBB.getBounds(this.corners);
                };
                OBB.getBounds = function (points) {
                    var min = new Point(Number.MAX_VALUE, Number.MAX_VALUE);
                    var max = new Point(Number.MIN_VALUE, Number.MIN_VALUE);
                    for (var i = 0; i < 4; i++) {
                        var x = points[i].x, y = points[i].y;
                        min.x = Math.min(min.x, x);
                        min.y = Math.min(min.y, y);
                        max.x = Math.max(max.x, x);
                        max.y = Math.max(max.y, y);
                    }
                    return new Rectangle(min.x, min.y, max.x - min.x, max.y - min.y);
                };
                /**
                 * http://www.flipcode.com/archives/2D_OBB_Intersection.shtml
                 */
                OBB.prototype.intersects = function (other) {
                    return this.intersectsOneWay(other) && other.intersectsOneWay(this);
                };
                OBB.prototype.intersectsOneWay = function (other) {
                    for (var i = 0; i < 2; i++) {
                        for (var j = 0; j < 4; j++) {
                            var t = other.corners[j].dot(this.axes[i]);
                            var tMin, tMax;
                            if (j === 0) {
                                tMax = tMin = t;
                            }
                            else {
                                if (t < tMin) {
                                    tMin = t;
                                }
                                else if (t > tMax) {
                                    tMax = t;
                                }
                            }
                        }
                        if ((tMin > 1 + this.origins[i]) || (tMax < this.origins[i])) {
                            return false;
                        }
                    }
                    return true;
                };
                return OBB;
            })();
            Geometry.OBB = OBB;
            /**
             * Used to write fast paths for common matrix types.
             */
            (function (MatrixType) {
                MatrixType[MatrixType["Unknown"] = 0x0000] = "Unknown";
                MatrixType[MatrixType["Identity"] = 0x0001] = "Identity";
                MatrixType[MatrixType["Translation"] = 0x0002] = "Translation";
            })(Geometry.MatrixType || (Geometry.MatrixType = {}));
            var MatrixType = Geometry.MatrixType;
            var Matrix = (function () {
                function Matrix(a, b, c, d, tx, ty) {
                    this._data = new Float64Array(6);
                    this._type = 0 /* Unknown */;
                    this.setElements(a, b, c, d, tx, ty);
                    Matrix.allocationCount++;
                }
                Object.defineProperty(Matrix.prototype, "a", {
                    get: function () {
                        return this._data[0];
                    },
                    set: function (a) {
                        this._data[0] = a;
                        this._type = 0 /* Unknown */;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Matrix.prototype, "b", {
                    get: function () {
                        return this._data[1];
                    },
                    set: function (b) {
                        this._data[1] = b;
                        this._type = 0 /* Unknown */;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Matrix.prototype, "c", {
                    get: function () {
                        return this._data[2];
                    },
                    set: function (c) {
                        this._data[2] = c;
                        this._type = 0 /* Unknown */;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Matrix.prototype, "d", {
                    get: function () {
                        return this._data[3];
                    },
                    set: function (d) {
                        this._data[3] = d;
                        this._type = 0 /* Unknown */;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Matrix.prototype, "tx", {
                    get: function () {
                        return this._data[4];
                    },
                    set: function (tx) {
                        this._data[4] = tx;
                        if (this._type === 1 /* Identity */) {
                            this._type = 2 /* Translation */;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Matrix.prototype, "ty", {
                    get: function () {
                        return this._data[5];
                    },
                    set: function (ty) {
                        this._data[5] = ty;
                        if (this._type === 1 /* Identity */) {
                            this._type = 2 /* Translation */;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Matrix._createSVGMatrix = function () {
                    if (!Matrix._svg) {
                        Matrix._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    }
                    return Matrix._svg.createSVGMatrix();
                };
                Matrix.prototype.setElements = function (a, b, c, d, tx, ty) {
                    var m = this._data;
                    m[0] = a;
                    m[1] = b;
                    m[2] = c;
                    m[3] = d;
                    m[4] = tx;
                    m[5] = ty;
                    this._type = 0 /* Unknown */;
                };
                Matrix.prototype.set = function (other) {
                    var m = this._data, n = other._data;
                    m[0] = n[0];
                    m[1] = n[1];
                    m[2] = n[2];
                    m[3] = n[3];
                    m[4] = n[4];
                    m[5] = n[5];
                    this._type = other._type;
                };
                /**
                 * Whether the transformed query rectangle is empty after this transform is applied to it.
                 */
                Matrix.prototype.emptyArea = function (query) {
                    var m = this._data;
                    // TODO: Work out the details here.
                    if (m[0] === 0 || m[3] === 0) {
                        return true;
                    }
                    return false;
                };
                /**
                 * Whether the area of transformed query rectangle is infinite after this transform is applied to it.
                 */
                Matrix.prototype.infiniteArea = function (query) {
                    var m = this._data;
                    // TODO: Work out the details here.
                    if (Math.abs(m[0]) === Infinity || Math.abs(m[3]) === Infinity) {
                        return true;
                    }
                    return false;
                };
                Matrix.prototype.isEqual = function (other) {
                    if (this._type === 1 /* Identity */ && other._type === 1 /* Identity */) {
                        return true;
                    }
                    var m = this._data, n = other._data;
                    return m[0] === n[0] && m[1] === n[1] && m[2] === n[2] && m[3] === n[3] && m[4] === n[4] && m[5] === n[5];
                };
                Matrix.prototype.clone = function () {
                    var matrix = Matrix.allocate();
                    matrix.set(this);
                    return matrix;
                };
                Matrix.allocate = function () {
                    var dirtyStack = Matrix._dirtyStack;
                    var matrix = null;
                    if (dirtyStack.length) {
                        return dirtyStack.pop();
                    }
                    else {
                        return new Matrix(12345, 12345, 12345, 12345, 12345, 12345);
                    }
                };
                Matrix.prototype.free = function () {
                    Matrix._dirtyStack.push(this);
                };
                Matrix.prototype.transform = function (a, b, c, d, tx, ty) {
                    var m = this._data;
                    var _a = m[0], _b = m[1], _c = m[2], _d = m[3], _tx = m[4], _ty = m[5];
                    m[0] = _a * a + _c * b;
                    m[1] = _b * a + _d * b;
                    m[2] = _a * c + _c * d;
                    m[3] = _b * c + _d * d;
                    m[4] = _a * tx + _c * ty + _tx;
                    m[5] = _b * tx + _d * ty + _ty;
                    this._type = 0 /* Unknown */;
                    return this;
                };
                Matrix.prototype.transformRectangle = function (rectangle, points) {
                    release || assert(points.length === 4);
                    var m = this._data, a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];
                    var x = rectangle.x;
                    var y = rectangle.y;
                    var w = rectangle.w;
                    var h = rectangle.h;
                    /*
              
                     0---1
                     | / |
                     3---2
              
                     */
                    points[0].x = a * x + c * y + tx;
                    points[0].y = b * x + d * y + ty;
                    points[1].x = a * (x + w) + c * y + tx;
                    points[1].y = b * (x + w) + d * y + ty;
                    points[2].x = a * (x + w) + c * (y + h) + tx;
                    points[2].y = b * (x + w) + d * (y + h) + ty;
                    points[3].x = a * x + c * (y + h) + tx;
                    points[3].y = b * x + d * (y + h) + ty;
                };
                Matrix.prototype.isTranslationOnly = function () {
                    if (this._type === 2 /* Translation */) {
                        return true;
                    }
                    var m = this._data;
                    if (m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1) {
                        this._type = 2 /* Translation */;
                        return true;
                    }
                    else if (epsilonEquals(m[0], 1) && epsilonEquals(m[1], 0) && epsilonEquals(m[2], 0) && epsilonEquals(m[3], 1)) {
                        this._type = 2 /* Translation */;
                        return true;
                    }
                    return false;
                };
                Matrix.prototype.transformRectangleAABB = function (rectangle) {
                    var m = this._data;
                    if (this._type === 1 /* Identity */) {
                        return;
                    }
                    else if (this._type === 2 /* Translation */) {
                        rectangle.x += m[4];
                        rectangle.y += m[5];
                        return;
                    }
                    var a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];
                    var x = rectangle.x;
                    var y = rectangle.y;
                    var w = rectangle.w;
                    var h = rectangle.h;
                    /*
              
                     0---1
                     | / |
                     3---2
              
                     */
                    var x0 = a * x + c * y + tx;
                    var y0 = b * x + d * y + ty;
                    var x1 = a * (x + w) + c * y + tx;
                    var y1 = b * (x + w) + d * y + ty;
                    var x2 = a * (x + w) + c * (y + h) + tx;
                    var y2 = b * (x + w) + d * (y + h) + ty;
                    var x3 = a * x + c * (y + h) + tx;
                    var y3 = b * x + d * (y + h) + ty;
                    var tmp = 0;
                    // Manual Min/Max is a lot faster than calling Math.min/max
                    // X Min-Max
                    if (x0 > x1) {
                        tmp = x0;
                        x0 = x1;
                        x1 = tmp;
                    }
                    if (x2 > x3) {
                        tmp = x2;
                        x2 = x3;
                        x3 = tmp;
                    }
                    rectangle.x = x0 < x2 ? x0 : x2;
                    rectangle.w = (x1 > x3 ? x1 : x3) - rectangle.x;
                    // Y Min-Max
                    if (y0 > y1) {
                        tmp = y0;
                        y0 = y1;
                        y1 = tmp;
                    }
                    if (y2 > y3) {
                        tmp = y2;
                        y2 = y3;
                        y3 = tmp;
                    }
                    rectangle.y = y0 < y2 ? y0 : y2;
                    rectangle.h = (y1 > y3 ? y1 : y3) - rectangle.y;
                };
                Matrix.prototype.scale = function (x, y) {
                    var m = this._data;
                    m[0] *= x;
                    m[1] *= y;
                    m[2] *= x;
                    m[3] *= y;
                    m[4] *= x;
                    m[5] *= y;
                    this._type = 0 /* Unknown */;
                    return this;
                };
                Matrix.prototype.scaleClone = function (x, y) {
                    if (x === 1 && y === 1) {
                        return this;
                    }
                    return this.clone().scale(x, y);
                };
                Matrix.prototype.rotate = function (angle) {
                    var m = this._data, a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];
                    var cos = Math.cos(angle);
                    var sin = Math.sin(angle);
                    m[0] = cos * a - sin * b;
                    m[1] = sin * a + cos * b;
                    m[2] = cos * c - sin * d;
                    m[3] = sin * c + cos * d;
                    m[4] = cos * tx - sin * ty;
                    m[5] = sin * tx + cos * ty;
                    this._type = 0 /* Unknown */;
                    return this;
                };
                Matrix.prototype.concat = function (other) {
                    if (other._type === 1 /* Identity */) {
                        return this;
                    }
                    var m = this._data, n = other._data;
                    var a = m[0] * n[0];
                    var b = 0.0;
                    var c = 0.0;
                    var d = m[3] * n[3];
                    var tx = m[4] * n[0] + n[4];
                    var ty = m[5] * n[3] + n[5];
                    if (m[1] !== 0.0 || m[2] !== 0.0 || n[1] !== 0.0 || n[2] !== 0.0) {
                        a += m[1] * n[2];
                        d += m[2] * n[1];
                        b += m[0] * n[1] + m[1] * n[3];
                        c += m[2] * n[0] + m[3] * n[2];
                        tx += m[5] * n[2];
                        ty += m[4] * n[1];
                    }
                    m[0] = a;
                    m[1] = b;
                    m[2] = c;
                    m[3] = d;
                    m[4] = tx;
                    m[5] = ty;
                    this._type = 0 /* Unknown */;
                    return this;
                };
                Matrix.prototype.concatClone = function (other) {
                    return this.clone().concat(other);
                };
                /**
                 * this = other * this
                 */
                Matrix.prototype.preMultiply = function (other) {
                    var m = this._data, n = other._data;
                    if (other._type === 2 /* Translation */ && (this._type & (1 /* Identity */ | 2 /* Translation */))) {
                        m[4] += n[4];
                        m[5] += n[5];
                        this._type = 2 /* Translation */;
                        return;
                    }
                    else if (other._type === 1 /* Identity */) {
                        return;
                    }
                    var a = n[0] * m[0];
                    var b = 0.0;
                    var c = 0.0;
                    var d = n[3] * m[3];
                    var tx = n[4] * m[0] + m[4];
                    var ty = n[5] * m[3] + m[5];
                    if (n[1] !== 0.0 || n[2] !== 0.0 || m[1] !== 0.0 || m[2] !== 0.0) {
                        a += n[1] * m[2];
                        d += n[2] * m[1];
                        b += n[0] * m[1] + n[1] * m[3];
                        c += n[2] * m[0] + n[3] * m[2];
                        tx += n[5] * m[2];
                        ty += n[4] * m[1];
                    }
                    m[0] = a;
                    m[1] = b;
                    m[2] = c;
                    m[3] = d;
                    m[4] = tx;
                    m[5] = ty;
                    this._type = 0 /* Unknown */;
                };
                Matrix.prototype.translate = function (x, y) {
                    var m = this._data;
                    m[4] += x;
                    m[5] += y;
                    if (this._type === 1 /* Identity */) {
                        this._type = 2 /* Translation */;
                    }
                    return this;
                };
                Matrix.prototype.setIdentity = function () {
                    var m = this._data;
                    m[0] = 1;
                    m[1] = 0;
                    m[2] = 0;
                    m[3] = 1;
                    m[4] = 0;
                    m[5] = 0;
                    this._type = 1 /* Identity */;
                };
                Matrix.prototype.isIdentity = function () {
                    if (this._type === 1 /* Identity */) {
                        return true;
                    }
                    var m = this._data;
                    return m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1 && m[4] === 0 && m[5] === 0;
                };
                Matrix.prototype.transformPoint = function (point) {
                    if (this._type === 1 /* Identity */) {
                        return;
                    }
                    var m = this._data;
                    var x = point.x;
                    var y = point.y;
                    point.x = m[0] * x + m[2] * y + m[4];
                    point.y = m[1] * x + m[3] * y + m[5];
                };
                Matrix.prototype.transformPoints = function (points) {
                    if (this._type === 1 /* Identity */) {
                        return;
                    }
                    for (var i = 0; i < points.length; i++) {
                        this.transformPoint(points[i]);
                    }
                };
                Matrix.prototype.deltaTransformPoint = function (point) {
                    if (this._type === 1 /* Identity */) {
                        return;
                    }
                    var m = this._data;
                    var x = point.x;
                    var y = point.y;
                    point.x = m[0] * x + m[2] * y;
                    point.y = m[1] * x + m[3] * y;
                };
                Matrix.prototype.inverse = function (result) {
                    var m = this._data, r = result._data;
                    if (this._type === 1 /* Identity */) {
                        result.setIdentity();
                        return;
                    }
                    else if (this._type === 2 /* Translation */) {
                        r[0] = 1;
                        r[1] = 0;
                        r[2] = 0;
                        r[3] = 1;
                        r[4] = -m[4];
                        r[5] = -m[5];
                        result._type = 2 /* Translation */;
                        return;
                    }
                    var b = m[1];
                    var c = m[2];
                    var tx = m[4];
                    var ty = m[5];
                    if (b === 0 && c === 0) {
                        var a = r[0] = 1 / m[0];
                        var d = r[3] = 1 / m[3];
                        r[1] = 0;
                        r[2] = 0;
                        r[4] = -a * tx;
                        r[5] = -d * ty;
                    }
                    else {
                        var a = m[0];
                        var d = m[3];
                        var determinant = a * d - b * c;
                        if (determinant === 0) {
                            result.setIdentity();
                            return;
                        }
                        determinant = 1 / determinant;
                        r[0] = d * determinant;
                        b = r[1] = -b * determinant;
                        c = r[2] = -c * determinant;
                        d = r[3] = a * determinant;
                        r[4] = -(r[0] * tx + c * ty);
                        r[5] = -(b * tx + d * ty);
                    }
                    result._type = 0 /* Unknown */;
                    return;
                };
                Matrix.prototype.getTranslateX = function () {
                    return this._data[4];
                };
                Matrix.prototype.getTranslateY = function () {
                    return this._data[4];
                };
                Matrix.prototype.getScaleX = function () {
                    var m = this._data;
                    if (m[0] === 1 && m[1] === 0) {
                        return 1;
                    }
                    var result = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
                    return m[0] > 0 ? result : -result;
                };
                Matrix.prototype.getScaleY = function () {
                    var m = this._data;
                    if (m[2] === 0 && m[3] === 1) {
                        return 1;
                    }
                    var result = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
                    return m[3] > 0 ? result : -result;
                };
                Matrix.prototype.getScale = function () {
                    return (this.getScaleX() + this.getScaleY()) / 2;
                };
                Matrix.prototype.getAbsoluteScaleX = function () {
                    return Math.abs(this.getScaleX());
                };
                Matrix.prototype.getAbsoluteScaleY = function () {
                    return Math.abs(this.getScaleY());
                };
                Matrix.prototype.getRotation = function () {
                    var m = this._data;
                    return Math.atan(m[1] / m[0]) * 180 / Math.PI;
                };
                Matrix.prototype.isScaleOrRotation = function () {
                    var m = this._data;
                    return Math.abs(m[0] * m[2] + m[1] * m[3]) < 0.01;
                };
                Matrix.prototype.toString = function (digits) {
                    if (digits === void 0) { digits = 2; }
                    var m = this._data;
                    return "{" + m[0].toFixed(digits) + ", " + m[1].toFixed(digits) + ", " + m[2].toFixed(digits) + ", " + m[3].toFixed(digits) + ", " + m[4].toFixed(digits) + ", " + m[5].toFixed(digits) + "}";
                };
                Matrix.prototype.toWebGLMatrix = function () {
                    var m = this._data;
                    return new Float32Array([
                        m[0],
                        m[1],
                        0,
                        m[2],
                        m[3],
                        0,
                        m[4],
                        m[5],
                        1
                    ]);
                };
                Matrix.prototype.toCSSTransform = function () {
                    var m = this._data;
                    return "matrix(" + m[0] + ", " + m[1] + ", " + m[2] + ", " + m[3] + ", " + m[4] + ", " + m[5] + ")";
                };
                Matrix.createIdentity = function () {
                    var matrix = Matrix.allocate();
                    matrix.setIdentity();
                    return matrix;
                };
                Matrix.prototype.toSVGMatrix = function () {
                    var m = this._data;
                    var matrix = Matrix._createSVGMatrix();
                    try {
                        matrix.a = m[0];
                        matrix.b = m[1];
                        matrix.c = m[2];
                        matrix.d = m[3];
                        matrix.e = m[4];
                        matrix.f = m[5];
                    }
                    catch (e) {
                        // The setters on SVGMatrix throw if the assigned value is `NaN`, which we sometimes
                        // produce. In that case, just fall back to an identity matrix for now.
                        return Matrix._createSVGMatrix();
                    }
                    return matrix;
                };
                Matrix.prototype.snap = function () {
                    var m = this._data;
                    if (this.isTranslationOnly()) {
                        m[0] = 1;
                        m[1] = 0;
                        m[2] = 0;
                        m[3] = 1;
                        m[4] = Math.round(m[4]);
                        m[5] = Math.round(m[5]);
                        this._type = 2 /* Translation */;
                        return true;
                    }
                    return false;
                };
                Matrix.createIdentitySVGMatrix = function () {
                    return Matrix._createSVGMatrix();
                };
                Matrix.createSVGMatrixFromArray = function (array) {
                    var matrix = Matrix._createSVGMatrix();
                    matrix.a = array[0];
                    matrix.b = array[1];
                    matrix.c = array[2];
                    matrix.d = array[3];
                    matrix.e = array[4];
                    matrix.f = array[5];
                    return matrix;
                };
                Matrix.allocationCount = 0;
                Matrix._dirtyStack = [];
                Matrix.multiply = function (dst, src) {
                    var n = src._data;
                    dst.transform(n[0], n[1], n[2], n[3], n[4], n[5]);
                };
                return Matrix;
            })();
            Geometry.Matrix = Matrix;
            /**
             * Some of the math from: http://games.greggman.com/game/webgl-3d-cameras/
             */
            var Matrix3D = (function () {
                function Matrix3D(m) {
                    this._m = new Float32Array(m);
                }
                Matrix3D.prototype.asWebGLMatrix = function () {
                    return this._m;
                };
                Matrix3D.createCameraLookAt = function (cameraPosition, target, up) {
                    var zAxis = cameraPosition.clone().sub(target).normalize();
                    var xAxis = up.clone().cross(zAxis).normalize();
                    var yAxis = zAxis.clone().cross(xAxis);
                    return new Matrix3D([
                        xAxis.x,
                        xAxis.y,
                        xAxis.z,
                        0,
                        yAxis.x,
                        yAxis.y,
                        yAxis.z,
                        0,
                        zAxis.x,
                        zAxis.y,
                        zAxis.z,
                        0,
                        cameraPosition.x,
                        cameraPosition.y,
                        cameraPosition.z,
                        1
                    ]);
                };
                Matrix3D.createLookAt = function (cameraPosition, target, up) {
                    var zAxis = cameraPosition.clone().sub(target).normalize();
                    var xAxis = up.clone().cross(zAxis).normalize();
                    var yAxis = zAxis.clone().cross(xAxis);
                    return new Matrix3D([
                        xAxis.x,
                        yAxis.x,
                        zAxis.x,
                        0,
                        yAxis.x,
                        yAxis.y,
                        zAxis.y,
                        0,
                        zAxis.x,
                        yAxis.z,
                        zAxis.z,
                        0,
                        -xAxis.dot(cameraPosition),
                        -yAxis.dot(cameraPosition),
                        -zAxis.dot(cameraPosition),
                        1
                    ]);
                };
                Matrix3D.prototype.mul = function (point) {
                    var v = [point.x, point.y, point.z, 0];
                    var m = this._m;
                    var d = [];
                    for (var i = 0; i < 4; i++) {
                        d[i] = 0.0;
                        var row = i * 4;
                        for (var j = 0; j < 4; j++) {
                            d[i] += m[row + j] * v[j];
                        }
                    }
                    return new Point3D(d[0], d[1], d[2]);
                };
                Matrix3D.create2DProjection = function (width, height, depth) {
                    // Note: This matrix flips the Y axis so 0 is at the top.
                    return new Matrix3D([
                        2 / width,
                        0,
                        0,
                        0,
                        0,
                        -2 / height,
                        0,
                        0,
                        0,
                        0,
                        2 / depth,
                        0,
                        -1,
                        1,
                        0,
                        1,
                    ]);
                };
                Matrix3D.createPerspective = function (fieldOfViewInRadians, aspectRatio, near, far) {
                    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
                    var rangeInverse = 1.0 / (near - far);
                    return new Matrix3D([
                        f / aspectRatio,
                        0,
                        0,
                        0,
                        0,
                        f,
                        0,
                        0,
                        0,
                        0,
                        (near + far) * rangeInverse,
                        -1,
                        0,
                        0,
                        near * far * rangeInverse * 2,
                        0
                    ]);
                };
                Matrix3D.createIdentity = function () {
                    return Matrix3D.createTranslation(0, 0, 0);
                };
                Matrix3D.createTranslation = function (tx, ty, tz) {
                    return new Matrix3D([
                        1,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        tx,
                        ty,
                        tz,
                        1
                    ]);
                };
                Matrix3D.createXRotation = function (angleInRadians) {
                    var c = Math.cos(angleInRadians);
                    var s = Math.sin(angleInRadians);
                    return new Matrix3D([
                        1,
                        0,
                        0,
                        0,
                        0,
                        c,
                        s,
                        0,
                        0,
                        -s,
                        c,
                        0,
                        0,
                        0,
                        0,
                        1
                    ]);
                };
                Matrix3D.createYRotation = function (angleInRadians) {
                    var c = Math.cos(angleInRadians);
                    var s = Math.sin(angleInRadians);
                    return new Matrix3D([
                        c,
                        0,
                        -s,
                        0,
                        0,
                        1,
                        0,
                        0,
                        s,
                        0,
                        c,
                        0,
                        0,
                        0,
                        0,
                        1
                    ]);
                };
                Matrix3D.createZRotation = function (angleInRadians) {
                    var c = Math.cos(angleInRadians);
                    var s = Math.sin(angleInRadians);
                    return new Matrix3D([
                        c,
                        s,
                        0,
                        0,
                        -s,
                        c,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        1,
                    ]);
                };
                Matrix3D.createScale = function (sx, sy, sz) {
                    return new Matrix3D([
                        sx,
                        0,
                        0,
                        0,
                        0,
                        sy,
                        0,
                        0,
                        0,
                        0,
                        sz,
                        0,
                        0,
                        0,
                        0,
                        1,
                    ]);
                };
                Matrix3D.createMultiply = function (a, b) {
                    var am = a._m;
                    var bm = b._m;
                    var a00 = am[0 * 4 + 0];
                    var a01 = am[0 * 4 + 1];
                    var a02 = am[0 * 4 + 2];
                    var a03 = am[0 * 4 + 3];
                    var a10 = am[1 * 4 + 0];
                    var a11 = am[1 * 4 + 1];
                    var a12 = am[1 * 4 + 2];
                    var a13 = am[1 * 4 + 3];
                    var a20 = am[2 * 4 + 0];
                    var a21 = am[2 * 4 + 1];
                    var a22 = am[2 * 4 + 2];
                    var a23 = am[2 * 4 + 3];
                    var a30 = am[3 * 4 + 0];
                    var a31 = am[3 * 4 + 1];
                    var a32 = am[3 * 4 + 2];
                    var a33 = am[3 * 4 + 3];
                    var b00 = bm[0 * 4 + 0];
                    var b01 = bm[0 * 4 + 1];
                    var b02 = bm[0 * 4 + 2];
                    var b03 = bm[0 * 4 + 3];
                    var b10 = bm[1 * 4 + 0];
                    var b11 = bm[1 * 4 + 1];
                    var b12 = bm[1 * 4 + 2];
                    var b13 = bm[1 * 4 + 3];
                    var b20 = bm[2 * 4 + 0];
                    var b21 = bm[2 * 4 + 1];
                    var b22 = bm[2 * 4 + 2];
                    var b23 = bm[2 * 4 + 3];
                    var b30 = bm[3 * 4 + 0];
                    var b31 = bm[3 * 4 + 1];
                    var b32 = bm[3 * 4 + 2];
                    var b33 = bm[3 * 4 + 3];
                    return new Matrix3D([
                        a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
                        a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
                        a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
                        a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
                        a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
                        a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
                        a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
                        a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
                        a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
                        a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
                        a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
                        a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
                        a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
                        a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
                        a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
                        a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33
                    ]);
                };
                Matrix3D.createInverse = function (a) {
                    var m = a._m;
                    var m00 = m[0 * 4 + 0];
                    var m01 = m[0 * 4 + 1];
                    var m02 = m[0 * 4 + 2];
                    var m03 = m[0 * 4 + 3];
                    var m10 = m[1 * 4 + 0];
                    var m11 = m[1 * 4 + 1];
                    var m12 = m[1 * 4 + 2];
                    var m13 = m[1 * 4 + 3];
                    var m20 = m[2 * 4 + 0];
                    var m21 = m[2 * 4 + 1];
                    var m22 = m[2 * 4 + 2];
                    var m23 = m[2 * 4 + 3];
                    var m30 = m[3 * 4 + 0];
                    var m31 = m[3 * 4 + 1];
                    var m32 = m[3 * 4 + 2];
                    var m33 = m[3 * 4 + 3];
                    var tmp_0 = m22 * m33;
                    var tmp_1 = m32 * m23;
                    var tmp_2 = m12 * m33;
                    var tmp_3 = m32 * m13;
                    var tmp_4 = m12 * m23;
                    var tmp_5 = m22 * m13;
                    var tmp_6 = m02 * m33;
                    var tmp_7 = m32 * m03;
                    var tmp_8 = m02 * m23;
                    var tmp_9 = m22 * m03;
                    var tmp_10 = m02 * m13;
                    var tmp_11 = m12 * m03;
                    var tmp_12 = m20 * m31;
                    var tmp_13 = m30 * m21;
                    var tmp_14 = m10 * m31;
                    var tmp_15 = m30 * m11;
                    var tmp_16 = m10 * m21;
                    var tmp_17 = m20 * m11;
                    var tmp_18 = m00 * m31;
                    var tmp_19 = m30 * m01;
                    var tmp_20 = m00 * m21;
                    var tmp_21 = m20 * m01;
                    var tmp_22 = m00 * m11;
                    var tmp_23 = m10 * m01;
                    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
                    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
                    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
                    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
                    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
                    return new Matrix3D([
                        d * t0,
                        d * t1,
                        d * t2,
                        d * t3,
                        d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
                        d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
                        d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
                        d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
                        d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
                        d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
                        d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
                        d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
                        d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
                        d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
                        d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
                        d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
                    ]);
                };
                return Matrix3D;
            })();
            Geometry.Matrix3D = Matrix3D;
            var DirtyRegion = (function () {
                function DirtyRegion(w, h, sizeInBits) {
                    if (sizeInBits === void 0) { sizeInBits = 7; }
                    var size = this.size = 1 << sizeInBits;
                    this.sizeInBits = sizeInBits;
                    this.w = w;
                    this.h = h;
                    this.c = Math.ceil(w / size);
                    this.r = Math.ceil(h / size);
                    this.grid = [];
                    for (var y = 0; y < this.r; y++) {
                        this.grid.push([]);
                        for (var x = 0; x < this.c; x++) {
                            this.grid[y][x] = new DirtyRegion.Cell(new Rectangle(x * size, y * size, size, size));
                        }
                    }
                }
                DirtyRegion.prototype.clear = function () {
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            this.grid[y][x].clear();
                        }
                    }
                };
                DirtyRegion.prototype.getBounds = function () {
                    return new Rectangle(0, 0, this.w, this.h);
                };
                DirtyRegion.prototype.addDirtyRectangle = function (rectangle) {
                    var x = rectangle.x >> this.sizeInBits;
                    var y = rectangle.y >> this.sizeInBits;
                    if (x >= this.c || y >= this.r) {
                        return;
                    }
                    if (x < 0) {
                        x = 0;
                    }
                    if (y < 0) {
                        y = 0;
                    }
                    var cell = this.grid[y][x];
                    rectangle = rectangle.clone();
                    rectangle.snap();
                    if (cell.region.contains(rectangle)) {
                        if (cell.bounds.isEmpty()) {
                            cell.bounds.set(rectangle);
                        }
                        else if (!cell.bounds.contains(rectangle)) {
                            cell.bounds.union(rectangle);
                        }
                    }
                    else {
                        var w = Math.min(this.c, Math.ceil((rectangle.x + rectangle.w) / this.size)) - x;
                        var h = Math.min(this.r, Math.ceil((rectangle.y + rectangle.h) / this.size)) - y;
                        for (var i = 0; i < w; i++) {
                            for (var j = 0; j < h; j++) {
                                var cell = this.grid[y + j][x + i];
                                var intersection = cell.region.clone();
                                intersection.intersect(rectangle);
                                if (!intersection.isEmpty()) {
                                    this.addDirtyRectangle(intersection);
                                }
                            }
                        }
                    }
                };
                DirtyRegion.prototype.gatherRegions = function (regions) {
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            var bounds = this.grid[y][x].bounds;
                            if (!bounds.isEmpty()) {
                                regions.push(this.grid[y][x].bounds);
                            }
                        }
                    }
                };
                DirtyRegion.prototype.gatherOptimizedRegions = function (regions) {
                    this.gatherRegions(regions);
                };
                DirtyRegion.prototype.getDirtyRatio = function () {
                    var totalArea = this.w * this.h;
                    if (totalArea === 0) {
                        return 0;
                    }
                    var dirtyArea = 0;
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            dirtyArea += this.grid[y][x].region.area();
                        }
                    }
                    return dirtyArea / totalArea;
                };
                DirtyRegion.prototype.render = function (context, options) {
                    function drawRectangle(rectangle) {
                        context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
                    }
                    if (options && options.drawGrid) {
                        context.strokeStyle = "white";
                        for (var y = 0; y < this.r; y++) {
                            for (var x = 0; x < this.c; x++) {
                                var cell = this.grid[y][x];
                                context.beginPath();
                                drawRectangle(cell.region);
                                context.closePath();
                                context.stroke();
                            }
                        }
                    }
                    context.strokeStyle = "#E0F8D8";
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            var cell = this.grid[y][x];
                            context.beginPath();
                            drawRectangle(cell.bounds);
                            context.closePath();
                            context.stroke();
                        }
                    }
                    //      context.strokeStyle = "#5856d6";
                    //      var regions = [];
                    //      this.gatherOptimizedRegions(regions);
                    //      for (var i = 0; i < regions.length; i++) {
                    //        context.beginPath();
                    //        drawRectangle(regions[i]);
                    //        context.closePath();
                    //        context.stroke();
                    //      }
                };
                DirtyRegion.tmpRectangle = Rectangle.createEmpty();
                return DirtyRegion;
            })();
            Geometry.DirtyRegion = DirtyRegion;
            var DirtyRegion;
            (function (DirtyRegion) {
                var Cell = (function () {
                    function Cell(region) {
                        this.region = region;
                        this.bounds = Rectangle.createEmpty();
                    }
                    Cell.prototype.clear = function () {
                        this.bounds.setEmpty();
                    };
                    return Cell;
                })();
                DirtyRegion.Cell = Cell;
            })(DirtyRegion = Geometry.DirtyRegion || (Geometry.DirtyRegion = {}));
            var Tile = (function () {
                function Tile(index, x, y, w, h, scale) {
                    this.index = index;
                    this.x = x;
                    this.y = y;
                    this.scale = scale;
                    this.bounds = new Rectangle(x * w, y * h, w, h);
                }
                Tile.prototype.getOBB = function () {
                    if (this._obb) {
                        return this._obb;
                    }
                    this.bounds.getCorners(Tile.corners);
                    return this._obb = new OBB(Tile.corners);
                };
                Tile.corners = Point.createEmptyPoints(4);
                return Tile;
            })();
            Geometry.Tile = Tile;
            /**
             * A grid data structure that lets you query tiles that intersect a transformed rectangle.
             */
            var TileCache = (function () {
                function TileCache(w, h, tileW, tileH, scale) {
                    this.tileW = tileW;
                    this.tileH = tileH;
                    this.scale = scale;
                    this.w = w;
                    this.h = h;
                    this.rows = Math.ceil(h / tileH);
                    this.columns = Math.ceil(w / tileW);
                    release || assert(this.rows < 2048 && this.columns < 2048);
                    this.tiles = [];
                    var index = 0;
                    for (var y = 0; y < this.rows; y++) {
                        for (var x = 0; x < this.columns; x++) {
                            this.tiles.push(new Tile(index++, x, y, tileW, tileH, scale));
                        }
                    }
                }
                /**
                 * Query tiles using a transformed rectangle.
                 * TODO: Fine-tune these heuristics.
                 */
                TileCache.prototype.getTiles = function (query, transform) {
                    if (transform.emptyArea(query)) {
                        return [];
                    }
                    else if (transform.infiniteArea(query)) {
                        return this.tiles;
                    }
                    var tileCount = this.columns * this.rows;
                    // The |getFewTiles| algorithm works better for a few tiles but it can't handle skew transforms.
                    if (tileCount < 40 && transform.isScaleOrRotation()) {
                        var precise = tileCount > 10;
                        return this.getFewTiles(query, transform, precise);
                    }
                    else {
                        return this.getManyTiles(query, transform);
                    }
                };
                /**
                 * Precise indicates that we want to do an exact OBB intersection.
                 */
                TileCache.prototype.getFewTiles = function (query, transform, precise) {
                    if (precise === void 0) { precise = true; }
                    if (transform.isTranslationOnly() && this.tiles.length === 1) {
                        if (this.tiles[0].bounds.intersectsTranslated(query, transform.tx, transform.ty)) {
                            return [this.tiles[0]];
                        }
                        return [];
                    }
                    transform.transformRectangle(query, TileCache._points);
                    var queryOBB;
                    var queryBounds = new Rectangle(0, 0, this.w, this.h);
                    if (precise) {
                        queryOBB = new OBB(TileCache._points);
                    }
                    queryBounds.intersect(OBB.getBounds(TileCache._points));
                    if (queryBounds.isEmpty()) {
                        return [];
                    }
                    var minX = queryBounds.x / this.tileW | 0;
                    var minY = queryBounds.y / this.tileH | 0;
                    var maxX = Math.ceil((queryBounds.x + queryBounds.w) / this.tileW) | 0;
                    var maxY = Math.ceil((queryBounds.y + queryBounds.h) / this.tileH) | 0;
                    minX = clamp(minX, 0, this.columns);
                    maxX = clamp(maxX, 0, this.columns);
                    minY = clamp(minY, 0, this.rows);
                    maxY = clamp(maxY, 0, this.rows);
                    var tiles = [];
                    for (var x = minX; x < maxX; x++) {
                        for (var y = minY; y < maxY; y++) {
                            var tile = this.tiles[y * this.columns + x];
                            if (tile.bounds.intersects(queryBounds) && (precise ? tile.getOBB().intersects(queryOBB) : true)) {
                                tiles.push(tile);
                            }
                        }
                    }
                    return tiles;
                };
                TileCache.prototype.getManyTiles = function (query, transform) {
                    function intersectX(x, p1, p2) {
                        // (x - x1) * (y2 - y1) = (y - y1) * (x2 - x1)
                        return (x - p1.x) * (p2.y - p1.y) / (p2.x - p1.x) + p1.y;
                    }
                    function appendTiles(tiles, cache, column, startRow, endRow) {
                        if (column < 0 || column >= cache.columns) {
                            return;
                        }
                        var j1 = clamp(startRow, 0, cache.rows);
                        var j2 = clamp(endRow + 1, 0, cache.rows);
                        for (var j = j1; j < j2; j++) {
                            tiles.push(cache.tiles[j * cache.columns + column]);
                        }
                    }
                    var rectPoints = TileCache._points;
                    transform.transformRectangle(query, rectPoints);
                    // finding minimal-x point, placing at first (and last)
                    var i1 = rectPoints[0].x < rectPoints[1].x ? 0 : 1;
                    var i2 = rectPoints[2].x < rectPoints[3].x ? 2 : 3;
                    var i0 = rectPoints[i1].x < rectPoints[i2].x ? i1 : i2;
                    var lines = [];
                    for (var j = 0; j < 5; j++, i0++) {
                        lines.push(rectPoints[i0 % 4]);
                    }
                    // and keeping points ordered counterclockwise
                    if ((lines[1].x - lines[0].x) * (lines[3].y - lines[0].y) < (lines[1].y - lines[0].y) * (lines[3].x - lines[0].x)) {
                        var tmp = lines[1];
                        lines[1] = lines[3];
                        lines[3] = tmp;
                    }
                    var tiles = [];
                    var lastY1, lastY2;
                    var i = Math.floor(lines[0].x / this.tileW);
                    var nextX = (i + 1) * this.tileW;
                    if (lines[2].x < nextX) {
                        // edge case: all fits into one column
                        lastY1 = Math.min(lines[0].y, lines[1].y, lines[2].y, lines[3].y);
                        lastY2 = Math.max(lines[0].y, lines[1].y, lines[2].y, lines[3].y);
                        var j1 = Math.floor(lastY1 / this.tileH);
                        var j2 = Math.floor(lastY2 / this.tileH);
                        appendTiles(tiles, this, i, j1, j2);
                        return tiles;
                    }
                    var line1 = 0, line2 = 4;
                    var lastSegment1 = false, lastSegment2 = false;
                    if (lines[0].x === lines[1].x || lines[0].x === lines[3].x) {
                        // edge case: first rectangle side parallel to columns
                        if (lines[0].x === lines[1].x) {
                            lastSegment1 = true;
                            line1++;
                        }
                        else {
                            lastSegment2 = true;
                            line2--;
                        }
                        lastY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
                        lastY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);
                        var j1 = Math.floor(lines[line1].y / this.tileH);
                        var j2 = Math.floor(lines[line2].y / this.tileH);
                        appendTiles(tiles, this, i, j1, j2);
                        i++;
                    }
                    do {
                        var nextY1, nextY2;
                        var nextSegment1, nextSegment2;
                        if (lines[line1 + 1].x < nextX) {
                            nextY1 = lines[line1 + 1].y;
                            nextSegment1 = true;
                        }
                        else {
                            nextY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
                            nextSegment1 = false;
                        }
                        if (lines[line2 - 1].x < nextX) {
                            nextY2 = lines[line2 - 1].y;
                            nextSegment2 = true;
                        }
                        else {
                            nextY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);
                            nextSegment2 = false;
                        }
                        var j1 = Math.floor((lines[line1].y < lines[line1 + 1].y ? lastY1 : nextY1) / this.tileH);
                        var j2 = Math.floor((lines[line2].y > lines[line2 - 1].y ? lastY2 : nextY2) / this.tileH);
                        appendTiles(tiles, this, i, j1, j2);
                        if (nextSegment1 && lastSegment1) {
                            break;
                        }
                        if (nextSegment1) {
                            lastSegment1 = true;
                            line1++;
                            lastY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
                        }
                        else {
                            lastY1 = nextY1;
                        }
                        if (nextSegment2) {
                            lastSegment2 = true;
                            line2--;
                            lastY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);
                        }
                        else {
                            lastY2 = nextY2;
                        }
                        i++;
                        nextX = (i + 1) * this.tileW;
                    } while (line1 < line2);
                    return tiles;
                };
                TileCache._points = Point.createEmptyPoints(4);
                return TileCache;
            })();
            Geometry.TileCache = TileCache;
            var MIN_CACHE_LEVELS = 5;
            var MAX_CACHE_LEVELS = 3;
            /**
             * Manages tile caches at different scales.
             */
            var RenderableTileCache = (function () {
                function RenderableTileCache(source, tileSize, minUntiledSize) {
                    this._cacheLevels = [];
                    this._source = source;
                    this._tileSize = tileSize;
                    this._minUntiledSize = minUntiledSize;
                }
                /**
                 * Gets the tiles covered by the specified |query| rectangle and transformed by the given |transform| matrix.
                 */
                RenderableTileCache.prototype._getTilesAtScale = function (query, transform, scratchBounds) {
                    var transformScale = Math.max(transform.getAbsoluteScaleX(), transform.getAbsoluteScaleY());
                    // Use log2(1 / transformScale) to figure out the tile level.
                    var level = 0;
                    if (transformScale !== 1) {
                        level = clamp(Math.round(Math.log(1 / transformScale) / Math.LN2), -MIN_CACHE_LEVELS, MAX_CACHE_LEVELS);
                    }
                    var scale = pow2(level);
                    // Since we use a single tile for dynamic sources, we've got to make sure that it fits in our surface caches ...
                    if (this._source.hasFlags(1048576 /* Dynamic */)) {
                        while (true) {
                            scale = pow2(level);
                            if (scratchBounds.contains(this._source.getBounds().getAbsoluteBounds().clone().scale(scale, scale))) {
                                break;
                            }
                            level--;
                            release || assert(level >= -MIN_CACHE_LEVELS);
                        }
                    }
                    // If the source is not scalable don't cache any tiles at a higher scale factor. However, it may still make
                    // sense to cache at a lower scale factor in case we need to evict larger cached images.
                    if (!(this._source.hasFlags(2097152 /* Scalable */))) {
                        level = clamp(level, -MIN_CACHE_LEVELS, 0);
                    }
                    var scale = pow2(level);
                    var levelIndex = MIN_CACHE_LEVELS + level;
                    var cache = this._cacheLevels[levelIndex];
                    if (!cache) {
                        var bounds = this._source.getBounds().getAbsoluteBounds();
                        var scaledBounds = bounds.clone().scale(scale, scale);
                        var tileW, tileH;
                        if (this._source.hasFlags(1048576 /* Dynamic */) || !this._source.hasFlags(4194304 /* Tileable */) || Math.max(scaledBounds.w, scaledBounds.h) <= this._minUntiledSize) {
                            tileW = scaledBounds.w;
                            tileH = scaledBounds.h;
                        }
                        else {
                            tileW = tileH = this._tileSize;
                        }
                        cache = this._cacheLevels[levelIndex] = new TileCache(scaledBounds.w, scaledBounds.h, tileW, tileH, scale);
                    }
                    return cache.getTiles(query, transform.scaleClone(scale, scale));
                };
                RenderableTileCache.prototype.fetchTiles = function (query, transform, scratchContext, cacheImageCallback) {
                    var scratchBounds = new Rectangle(0, 0, scratchContext.canvas.width, scratchContext.canvas.height);
                    var tiles = this._getTilesAtScale(query, transform, scratchBounds);
                    var uncachedTiles;
                    var source = this._source;
                    for (var i = 0; i < tiles.length; i++) {
                        var tile = tiles[i];
                        if (!tile.cachedSurfaceRegion || !tile.cachedSurfaceRegion.surface || (source.hasFlags(1048576 /* Dynamic */ | 16 /* Dirty */))) {
                            if (!uncachedTiles) {
                                uncachedTiles = [];
                            }
                            uncachedTiles.push(tile);
                        }
                    }
                    if (uncachedTiles) {
                        this._cacheTiles(scratchContext, uncachedTiles, cacheImageCallback, scratchBounds);
                    }
                    source.removeFlags(16 /* Dirty */);
                    return tiles;
                };
                RenderableTileCache.prototype._getTileBounds = function (tiles) {
                    var bounds = Rectangle.createEmpty();
                    for (var i = 0; i < tiles.length; i++) {
                        bounds.union(tiles[i].bounds);
                    }
                    return bounds;
                };
                /**
                 * This caches raster versions of the specified |uncachedTiles|. The tiles are generated using a scratch
                 * canvas2D context (|scratchContext|) and then cached via |cacheImageCallback|. Ideally, we want to render
                 * all tiles in one go, but they may not fit in the |scratchContext| in which case we need to render the
                 * source shape several times.
                 *
                 * TODO: Find a good algorithm to do this since it's quite important that we don't repaint too many times.
                 * Spending some time trying to figure out the *optimal* solution may pay-off since painting is soo expensive.
                 */
                RenderableTileCache.prototype._cacheTiles = function (scratchContext, uncachedTiles, cacheImageCallback, scratchBounds, maxRecursionDepth) {
                    if (maxRecursionDepth === void 0) { maxRecursionDepth = 4; }
                    release || assert(maxRecursionDepth > 0, "Infinite recursion is likely.");
                    var uncachedTileBounds = this._getTileBounds(uncachedTiles);
                    scratchContext.save();
                    scratchContext.setTransform(1, 0, 0, 1, 0, 0);
                    scratchContext.clearRect(0, 0, scratchBounds.w, scratchBounds.h);
                    scratchContext.translate(-uncachedTileBounds.x, -uncachedTileBounds.y);
                    scratchContext.scale(uncachedTiles[0].scale, uncachedTiles[0].scale);
                    // Translate so that the source is drawn at the origin.
                    var sourceBounds = this._source.getBounds();
                    scratchContext.translate(-sourceBounds.x, -sourceBounds.y);
                    profile && GFX.timelineBuffer && GFX.timelineBuffer.enter("renderTiles");
                    GFX.traceLevel >= 2 /* Verbose */ && GFX.writer && GFX.writer.writeLn("Rendering Tiles: " + uncachedTileBounds);
                    this._source.render(scratchContext, 0);
                    scratchContext.restore();
                    profile && GFX.timelineBuffer && GFX.timelineBuffer.leave("renderTiles");
                    var remainingUncachedTiles = null;
                    for (var i = 0; i < uncachedTiles.length; i++) {
                        var tile = uncachedTiles[i];
                        var region = tile.bounds.clone();
                        region.x -= uncachedTileBounds.x;
                        region.y -= uncachedTileBounds.y;
                        if (!scratchBounds.contains(region)) {
                            if (!remainingUncachedTiles) {
                                remainingUncachedTiles = [];
                            }
                            remainingUncachedTiles.push(tile);
                        }
                        tile.cachedSurfaceRegion = cacheImageCallback(tile.cachedSurfaceRegion, scratchContext, region);
                    }
                    if (remainingUncachedTiles) {
                        // This is really dumb at the moment; if we have some tiles left over, partition the tile set in half and recurse.
                        if (remainingUncachedTiles.length >= 2) {
                            var a = remainingUncachedTiles.slice(0, remainingUncachedTiles.length / 2 | 0);
                            var b = remainingUncachedTiles.slice(a.length);
                            this._cacheTiles(scratchContext, a, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
                            this._cacheTiles(scratchContext, b, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
                        }
                        else {
                            this._cacheTiles(scratchContext, remainingUncachedTiles, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
                        }
                    }
                };
                return RenderableTileCache;
            })();
            Geometry.RenderableTileCache = RenderableTileCache;
        })(Geometry = GFX.Geometry || (GFX.Geometry = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var roundToMultipleOfPowerOfTwo = Shumway.IntegerUtilities.roundToMultipleOfPowerOfTwo;
        var assert = Shumway.Debug.assert;
        var Rectangle = GFX.Geometry.Rectangle;
        /**
         * Various 2D rectangular region allocators. These are used to manage
         * areas of surfaces, 2D Canvases or WebGL surfaces. Each allocator
         * implements the |IRegionAllocator| interface and must provied two
         * methods to allocate and free regions.
         *
         * CompactAllocator: Good for tightly packed surface atlases but becomes
         * fragmented easily. Allocation / freeing cost is high and should only
         * be used for long lived regions.
         *
         * GridAllocator: Very fast at allocation and freeing but is not very
         * tightly packed. Space is initially partitioned in equally sized grid
         * cells which may be much larger than the allocated regions. This should
         * be used for fixed size allocation regions.
         *
         * BucketAllocator: Manages a list of GridAllocators with different grid
         * sizes.
         */
        var RegionAllocator;
        (function (RegionAllocator) {
            var Region = (function (_super) {
                __extends(Region, _super);
                function Region() {
                    _super.apply(this, arguments);
                }
                return Region;
            })(GFX.Geometry.Rectangle);
            RegionAllocator.Region = Region;
            /**
             * Simple 2D bin-packing algorithm that recursively partitions space along the x and y axis. The binary tree
             * can get quite deep so watch out of deep recursive calls. This algorithm works best when inserting items
             * that are sorted by width and height, from largest to smallest.
             */
            var CompactAllocator = (function () {
                function CompactAllocator(w, h) {
                    this._root = new CompactCell(0, 0, w | 0, h | 0, false);
                }
                CompactAllocator.prototype.allocate = function (w, h) {
                    w = Math.ceil(w);
                    h = Math.ceil(h);
                    release || assert(w > 0 && h > 0);
                    var result = this._root.insert(w, h);
                    if (result) {
                        result.allocator = this;
                        result.allocated = true;
                    }
                    return result;
                };
                CompactAllocator.prototype.free = function (region) {
                    var cell = region;
                    release || assert(cell.allocator === this);
                    cell.clear();
                    region.allocated = false;
                };
                /**
                 * Try out randomizing the orientation of each subdivision, sometimes this can lead to better results.
                 */
                CompactAllocator.RANDOM_ORIENTATION = true;
                CompactAllocator.MAX_DEPTH = 256;
                return CompactAllocator;
            })();
            RegionAllocator.CompactAllocator = CompactAllocator;
            var CompactCell = (function (_super) {
                __extends(CompactCell, _super);
                function CompactCell(x, y, w, h, horizontal) {
                    _super.call(this, x, y, w, h);
                    this._children = null;
                    this._horizontal = horizontal;
                    this.allocated = false;
                }
                CompactCell.prototype.clear = function () {
                    this._children = null;
                    this.allocated = false;
                };
                CompactCell.prototype.insert = function (w, h) {
                    return this._insert(w, h, 0);
                };
                CompactCell.prototype._insert = function (w, h, depth) {
                    if (depth > CompactAllocator.MAX_DEPTH) {
                        return;
                    }
                    if (this.allocated) {
                        return;
                    }
                    if (this.w < w || this.h < h) {
                        return;
                    }
                    if (!this._children) {
                        var orientation = !this._horizontal;
                        if (CompactAllocator.RANDOM_ORIENTATION) {
                            orientation = Math.random() >= 0.5;
                        }
                        if (this._horizontal) {
                            this._children = [
                                new CompactCell(this.x, this.y, this.w, h, false),
                                new CompactCell(this.x, this.y + h, this.w, this.h - h, orientation),
                            ];
                        }
                        else {
                            this._children = [
                                new CompactCell(this.x, this.y, w, this.h, true),
                                new CompactCell(this.x + w, this.y, this.w - w, this.h, orientation),
                            ];
                        }
                        var first = this._children[0];
                        if (first.w === w && first.h === h) {
                            first.allocated = true;
                            return first;
                        }
                        return this._insert(w, h, depth + 1);
                    }
                    else {
                        var result;
                        result = this._children[0]._insert(w, h, depth + 1);
                        if (result) {
                            return result;
                        }
                        result = this._children[1]._insert(w, h, depth + 1);
                        if (result) {
                            return result;
                        }
                    }
                };
                return CompactCell;
            })(RegionAllocator.Region);
            /**
             * Simple grid allocator. Starts off with an empty free list and allocates empty cells. Once a cell
             * is freed it's pushed into the free list. It gets poped off the next time a region is allocated.
             */
            var GridAllocator = (function () {
                function GridAllocator(w, h, sizeW, sizeH) {
                    this._columns = w / sizeW | 0;
                    this._rows = h / sizeH | 0;
                    this._sizeW = sizeW;
                    this._sizeH = sizeH;
                    this._freeList = [];
                    this._index = 0;
                    this._total = this._columns * this._rows;
                }
                GridAllocator.prototype.allocate = function (w, h) {
                    w = Math.ceil(w);
                    h = Math.ceil(h);
                    release || assert(w > 0 && h > 0);
                    var sizeW = this._sizeW;
                    var sizeH = this._sizeH;
                    if (w > sizeW || h > sizeH) {
                        return null;
                    }
                    var freeList = this._freeList;
                    var index = this._index;
                    if (freeList.length > 0) {
                        var cell = freeList.pop();
                        release || assert(cell.allocated === false);
                        cell.w = w;
                        cell.h = h;
                        cell.allocated = true;
                        return cell;
                    }
                    else if (index < this._total) {
                        var y = (index / this._columns) | 0;
                        var x = index - (y * this._columns);
                        var cell = new GridCell(x * sizeW, y * sizeH, w, h);
                        cell.index = index;
                        cell.allocator = this;
                        cell.allocated = true;
                        this._index++;
                        return cell;
                    }
                    return null;
                };
                GridAllocator.prototype.free = function (region) {
                    var cell = region;
                    release || assert(cell.allocator === this);
                    cell.allocated = false;
                    this._freeList.push(cell);
                };
                return GridAllocator;
            })();
            RegionAllocator.GridAllocator = GridAllocator;
            var GridCell = (function (_super) {
                __extends(GridCell, _super);
                function GridCell(x, y, w, h) {
                    _super.call(this, x, y, w, h);
                    this.index = -1;
                }
                return GridCell;
            })(RegionAllocator.Region);
            RegionAllocator.GridCell = GridCell;
            var Bucket = (function () {
                function Bucket(size, region, allocator) {
                    this.size = size;
                    this.region = region;
                    this.allocator = allocator;
                }
                return Bucket;
            })();
            var BucketCell = (function (_super) {
                __extends(BucketCell, _super);
                function BucketCell(x, y, w, h, region) {
                    _super.call(this, x, y, w, h);
                    this.region = region;
                }
                return BucketCell;
            })(RegionAllocator.Region);
            RegionAllocator.BucketCell = BucketCell;
            var BucketAllocator = (function () {
                function BucketAllocator(w, h) {
                    release || assert(w > 0 && h > 0);
                    this._buckets = [];
                    this._w = w | 0;
                    this._h = h | 0;
                    this._filled = 0;
                }
                /**
                 * Finds the first bucket that is large enough to hold the requested region. If no
                 * such bucket exists, then allocates a new bucket if there is room otherwise
                 * returns null;
                 */
                BucketAllocator.prototype.allocate = function (w, h) {
                    w = Math.ceil(w);
                    h = Math.ceil(h);
                    release || assert(w > 0 && h > 0);
                    var size = Math.max(w, h);
                    if (w > this._w || h > this._h) {
                        // Too big, cannot allocate this.
                        return null;
                    }
                    var region = null;
                    var bucket;
                    var buckets = this._buckets;
                    do {
                        for (var i = 0; i < buckets.length; i++) {
                            if (buckets[i].size >= size) {
                                bucket = buckets[i];
                                region = bucket.allocator.allocate(w, h);
                                if (region) {
                                    break;
                                }
                            }
                        }
                        if (!region) {
                            var remainingSpace = this._h - this._filled;
                            if (remainingSpace < h) {
                                // Couldn't allocate region and there is no more vertical space to allocate
                                // a new bucket that can fit the requested size. So give up.
                                return null;
                            }
                            var gridSize = roundToMultipleOfPowerOfTwo(size, 8);
                            var bucketHeight = gridSize * 2;
                            if (bucketHeight > remainingSpace) {
                                bucketHeight = remainingSpace;
                            }
                            if (bucketHeight < gridSize) {
                                return null;
                            }
                            var bucketRegion = new Rectangle(0, this._filled, this._w, bucketHeight);
                            this._buckets.push(new Bucket(gridSize, bucketRegion, new GridAllocator(bucketRegion.w, bucketRegion.h, gridSize, gridSize)));
                            this._filled += bucketHeight;
                        }
                    } while (!region);
                    return new BucketCell(bucket.region.x + region.x, bucket.region.y + region.y, region.w, region.h, region);
                };
                BucketAllocator.prototype.free = function (region) {
                    region.region.allocator.free(region.region);
                };
                return BucketAllocator;
            })();
            RegionAllocator.BucketAllocator = BucketAllocator;
        })(RegionAllocator = GFX.RegionAllocator || (GFX.RegionAllocator = {}));
        var SurfaceRegionAllocator;
        (function (SurfaceRegionAllocator) {
            var SimpleAllocator = (function () {
                function SimpleAllocator(createSurface) {
                    this._createSurface = createSurface;
                    this._surfaces = [];
                }
                Object.defineProperty(SimpleAllocator.prototype, "surfaces", {
                    get: function () {
                        return this._surfaces;
                    },
                    enumerable: true,
                    configurable: true
                });
                SimpleAllocator.prototype._createNewSurface = function (w, h) {
                    var surface = this._createSurface(w, h);
                    this._surfaces.push(surface);
                    return surface;
                };
                SimpleAllocator.prototype.addSurface = function (surface) {
                    this._surfaces.push(surface);
                };
                SimpleAllocator.prototype.allocate = function (w, h, excludeSurface) {
                    for (var i = 0; i < this._surfaces.length; i++) {
                        var surface = this._surfaces[i];
                        if (surface === excludeSurface) {
                            continue;
                        }
                        var region = surface.allocate(w, h);
                        if (region) {
                            return region;
                        }
                    }
                    return this._createNewSurface(w, h).allocate(w, h);
                };
                SimpleAllocator.prototype.free = function (region) {
                };
                return SimpleAllocator;
            })();
            SurfaceRegionAllocator.SimpleAllocator = SimpleAllocator;
        })(SurfaceRegionAllocator = GFX.SurfaceRegionAllocator || (GFX.SurfaceRegionAllocator = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Rectangle = GFX.Geometry.Rectangle;
        var Matrix = GFX.Geometry.Matrix;
        var DirtyRegion = GFX.Geometry.DirtyRegion;
        var assert = Shumway.Debug.assert;
        (function (BlendMode) {
            BlendMode[BlendMode["Normal"] = 1] = "Normal";
            BlendMode[BlendMode["Layer"] = 2] = "Layer";
            BlendMode[BlendMode["Multiply"] = 3] = "Multiply";
            BlendMode[BlendMode["Screen"] = 4] = "Screen";
            BlendMode[BlendMode["Lighten"] = 5] = "Lighten";
            BlendMode[BlendMode["Darken"] = 6] = "Darken";
            BlendMode[BlendMode["Difference"] = 7] = "Difference";
            BlendMode[BlendMode["Add"] = 8] = "Add";
            BlendMode[BlendMode["Subtract"] = 9] = "Subtract";
            BlendMode[BlendMode["Invert"] = 10] = "Invert";
            BlendMode[BlendMode["Alpha"] = 11] = "Alpha";
            BlendMode[BlendMode["Erase"] = 12] = "Erase";
            BlendMode[BlendMode["Overlay"] = 13] = "Overlay";
            BlendMode[BlendMode["HardLight"] = 14] = "HardLight";
        })(GFX.BlendMode || (GFX.BlendMode = {}));
        var BlendMode = GFX.BlendMode;
        (function (NodeFlags) {
            NodeFlags[NodeFlags["None"] = 0x00000] = "None";
            /**
             * Whether this node's bounding box is automatically computed from its children. If this
             * flag is |false| then this node's bounding box can only be set via |setBounds|.
             */
            NodeFlags[NodeFlags["BoundsAutoCompute"] = 0x00002] = "BoundsAutoCompute";
            /**
             * Whether this node acts as a mask for another node.
             */
            NodeFlags[NodeFlags["IsMask"] = 0x00004] = "IsMask";
            /**
             * Whether this node needs to be repainted.
             */
            NodeFlags[NodeFlags["Dirty"] = 0x00010] = "Dirty";
            /**
             * Whether this node's bounds is invalid and needs to be recomputed. Only nodes that have the
             * |BoundsAutoCompute| flag set can have this flag set.
             */
            NodeFlags[NodeFlags["InvalidBounds"] = 0x00100] = "InvalidBounds";
            /**
             * Whether this node's concatenated matrix is invalid. This happens whenever a node's ancestor
             * is moved in the node tree.
             */
            NodeFlags[NodeFlags["InvalidConcatenatedMatrix"] = 0x00200] = "InvalidConcatenatedMatrix";
            /**
             * Whether this node's inverted concatenated matrix is invalid. This happens whenever a node's ancestor
             * is moved in the node tree.
             */
            NodeFlags[NodeFlags["InvalidInvertedConcatenatedMatrix"] = 0x00400] = "InvalidInvertedConcatenatedMatrix";
            /**
             * Same as above, but for colors.
             */
            NodeFlags[NodeFlags["InvalidConcatenatedColorMatrix"] = 0x00800] = "InvalidConcatenatedColorMatrix";
            /**
             * Flags to propagate upwards when a node is added or removed from a group.
             */
            NodeFlags[NodeFlags["UpOnAddedOrRemoved"] = NodeFlags.InvalidBounds | NodeFlags.Dirty] = "UpOnAddedOrRemoved";
            /**
             * Flags to propagate upwards when a node is moved.
             */
            NodeFlags[NodeFlags["UpOnMoved"] = NodeFlags.InvalidBounds | NodeFlags.Dirty] = "UpOnMoved";
            /**
             * Flags to propagate downwards when a mode is added or removed from a group.
             */
            NodeFlags[NodeFlags["DownOnAddedOrRemoved"] = NodeFlags.InvalidConcatenatedMatrix | NodeFlags.InvalidInvertedConcatenatedMatrix | NodeFlags.InvalidConcatenatedColorMatrix] = "DownOnAddedOrRemoved";
            /**
             * Flags to propagate downwards when a node is moved.
             */
            NodeFlags[NodeFlags["DownOnMoved"] = NodeFlags.InvalidConcatenatedMatrix | NodeFlags.InvalidInvertedConcatenatedMatrix | NodeFlags.InvalidConcatenatedColorMatrix] = "DownOnMoved";
            /**
             * Flags to propagate upwards when a node's color matrix is changed.
             */
            NodeFlags[NodeFlags["UpOnColorMatrixChanged"] = NodeFlags.Dirty] = "UpOnColorMatrixChanged";
            /**
             * Flags to propagate downwards when a node's color matrix is changed.
             */
            NodeFlags[NodeFlags["DownOnColorMatrixChanged"] = NodeFlags.InvalidConcatenatedColorMatrix] = "DownOnColorMatrixChanged";
            NodeFlags[NodeFlags["Visible"] = 0x10000] = "Visible";
            /**
             * Flags to propagate upwards when a node is invalidated.
             */
            NodeFlags[NodeFlags["UpOnInvalidate"] = NodeFlags.InvalidBounds | NodeFlags.Dirty] = "UpOnInvalidate";
            /**
             * Default node flags, however not all node types use these defaults.
             */
            NodeFlags[NodeFlags["Default"] = NodeFlags.BoundsAutoCompute | NodeFlags.InvalidBounds | NodeFlags.InvalidConcatenatedMatrix | NodeFlags.InvalidInvertedConcatenatedMatrix | NodeFlags.Visible] = "Default";
            /**
             * Whether this node is marked to be cached as a bitmap. This isn't just a performance optimization,
             * but also affects the way masking is performed.
             */
            NodeFlags[NodeFlags["CacheAsBitmap"] = 0x20000] = "CacheAsBitmap";
            /**
             * Whether this node's contents should be drawn snapped to pixel boundaries.
             */
            NodeFlags[NodeFlags["PixelSnapping"] = 0x40000] = "PixelSnapping";
            /**
             * Whether this node's contents should use higher quality image smoothing.
             */
            NodeFlags[NodeFlags["ImageSmoothing"] = 0x80000] = "ImageSmoothing";
            /**
             * Whether source has dynamic content.
             */
            NodeFlags[NodeFlags["Dynamic"] = 0x100000] = "Dynamic";
            /**
             * Whether the source's content can be scaled and drawn at a higher resolution.
             */
            NodeFlags[NodeFlags["Scalable"] = 0x200000] = "Scalable";
            /**
             * Whether the source's content should be tiled.
             */
            NodeFlags[NodeFlags["Tileable"] = 0x400000] = "Tileable";
            // Delete These
            NodeFlags[NodeFlags["Transparent"] = 0x08000] = "Transparent";
        })(GFX.NodeFlags || (GFX.NodeFlags = {}));
        var NodeFlags = GFX.NodeFlags;
        /**
         * Scene graph object hierarchy. This enum makes it possible to write fast type checks.
         */
        (function (NodeType) {
            NodeType[NodeType["Node"] = 0x0001] = "Node";
            NodeType[NodeType["Shape"] = 0x0003] = "Shape";
            NodeType[NodeType["Group"] = 0x0005] = "Group";
            NodeType[NodeType["Stage"] = 0x000D] = "Stage";
            NodeType[NodeType["Renderable"] = 0x0021] = "Renderable"; // 0x0020 | Node
        })(GFX.NodeType || (GFX.NodeType = {}));
        var NodeType = GFX.NodeType;
        /**
         * Basic event types. Not much here.
         */
        (function (NodeEventType) {
            NodeEventType[NodeEventType["None"] = 0x0000] = "None";
            NodeEventType[NodeEventType["OnStageBoundsChanged"] = 0x0001] = "OnStageBoundsChanged";
            NodeEventType[NodeEventType["RemovedFromStage"] = 0x0002] = "RemovedFromStage";
        })(GFX.NodeEventType || (GFX.NodeEventType = {}));
        var NodeEventType = GFX.NodeEventType;
        /**
         * Basic node visitor. Inherit from this if you want a more sophisticated visitor, for instance all
         * renderers extends this class.
         */
        var NodeVisitor = (function () {
            function NodeVisitor() {
            }
            NodeVisitor.prototype.visitNode = function (node, state) {
                // ...
            };
            NodeVisitor.prototype.visitShape = function (node, state) {
                this.visitNode(node, state);
            };
            NodeVisitor.prototype.visitGroup = function (node, state) {
                this.visitNode(node, state);
                var children = node.getChildren();
                for (var i = 0; i < children.length; i++) {
                    children[i].visit(this, state);
                }
            };
            NodeVisitor.prototype.visitStage = function (node, state) {
                this.visitGroup(node, state);
            };
            NodeVisitor.prototype.visitRenderable = function (node, state) {
                this.visitNode(node, state);
            };
            return NodeVisitor;
        })();
        GFX.NodeVisitor = NodeVisitor;
        /**
         * Nodes that cache transformation state. These are used to thread state when traversing
         * the scene graph. Since they keep track of rendering state, they might as well become
         * scene graph nodes.
         */
        var State = (function () {
            function State() {
            }
            return State;
        })();
        GFX.State = State;
        var PreRenderState = (function (_super) {
            __extends(PreRenderState, _super);
            function PreRenderState() {
                _super.call(this);
                this.matrix = Matrix.createIdentity();
                this.depth = 0;
            }
            PreRenderState.prototype.transform = function (transform) {
                var state = this.clone();
                state.matrix.preMultiply(transform.getMatrix());
                return state;
            };
            PreRenderState.allocate = function () {
                var dirtyStack = PreRenderState._dirtyStack;
                var state = null;
                if (dirtyStack.length) {
                    state = dirtyStack.pop();
                }
                return state;
            };
            PreRenderState.prototype.clone = function () {
                var state = PreRenderState.allocate();
                if (!state) {
                    state = new PreRenderState();
                }
                state.set(this);
                return state;
            };
            PreRenderState.prototype.set = function (state) {
                this.matrix.set(state.matrix);
            };
            PreRenderState.prototype.free = function () {
                PreRenderState._dirtyStack.push(this);
            };
            PreRenderState._dirtyStack = [];
            return PreRenderState;
        })(State);
        GFX.PreRenderState = PreRenderState;
        /**
         * Helper visitor that checks and resets the dirty bit and calculates stack levels. If the root
         * node is dirty, then we have to repaint the entire node tree.
         */
        var PreRenderVisitor = (function (_super) {
            __extends(PreRenderVisitor, _super);
            function PreRenderVisitor() {
                _super.apply(this, arguments);
                this.isDirty = true;
            }
            PreRenderVisitor.prototype.start = function (node, dirtyRegion) {
                this._dirtyRegion = dirtyRegion;
                var state = new PreRenderState();
                state.matrix.setIdentity();
                node.visit(this, state);
                state.free();
            };
            PreRenderVisitor.prototype.visitGroup = function (node, state) {
                var children = node.getChildren();
                this.visitNode(node, state);
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    var childState = state.transform(child.getTransform());
                    child.visit(this, childState);
                    childState.free();
                }
            };
            PreRenderVisitor.prototype.visitNode = function (node, state) {
                if (node.hasFlags(16 /* Dirty */)) {
                    this.isDirty = true;
                }
                node.toggleFlags(16 /* Dirty */, false);
                node.depth = state.depth++;
            };
            return PreRenderVisitor;
        })(NodeVisitor);
        GFX.PreRenderVisitor = PreRenderVisitor;
        /**
         * Debugging visitor.
         */
        var TracingNodeVisitor = (function (_super) {
            __extends(TracingNodeVisitor, _super);
            function TracingNodeVisitor(writer) {
                _super.call(this);
                this.writer = writer;
            }
            TracingNodeVisitor.prototype.visitNode = function (node, state) {
                // ...
            };
            TracingNodeVisitor.prototype.visitShape = function (node, state) {
                this.writer.writeLn(node.toString());
                this.visitNode(node, state);
            };
            TracingNodeVisitor.prototype.visitGroup = function (node, state) {
                this.visitNode(node, state);
                var children = node.getChildren();
                this.writer.enter(node.toString() + " " + children.length);
                for (var i = 0; i < children.length; i++) {
                    children[i].visit(this, state);
                }
                this.writer.outdent();
            };
            TracingNodeVisitor.prototype.visitStage = function (node, state) {
                this.visitGroup(node, state);
            };
            return TracingNodeVisitor;
        })(NodeVisitor);
        GFX.TracingNodeVisitor = TracingNodeVisitor;
        /**
         * Base class of all nodes in the scene graph.
         */
        var Node = (function () {
            function Node() {
                /**
                 * Number of sibillings to clip.
                 */
                this._clip = -1;
                this._eventListeners = null;
                this._id = Node._nextId++;
                this._type = 1 /* Node */;
                this._index = -1;
                this._parent = null;
                this.reset();
            }
            Object.defineProperty(Node.prototype, "id", {
                get: function () {
                    return this._id;
                },
                enumerable: true,
                configurable: true
            });
            Node.prototype._dispatchEvent = function (type) {
                if (!this._eventListeners) {
                    return;
                }
                var listeners = this._eventListeners;
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    if (listener.type === type) {
                        listener.listener(this, type);
                    }
                }
            };
            /**
             * Adds an event listener.
             */
            Node.prototype.addEventListener = function (type, listener) {
                if (!this._eventListeners) {
                    this._eventListeners = [];
                }
                this._eventListeners.push({ type: type, listener: listener });
            };
            /**
             * Removes an event listener.
             */
            Node.prototype.removeEventListener = function (type, listener) {
                var listeners = this._eventListeners;
                for (var i = 0; i < listeners.length; i++) {
                    var listenerObject = listeners[i];
                    if (listenerObject.type === type && listenerObject.listener === listener) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            };
            Object.defineProperty(Node.prototype, "properties", {
                get: function () {
                    return this._properties || (this._properties = {});
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Resets the Node to its initial state but preserves its identity.
             * It safe to call this on a child without disrupting ownership.
             */
            Node.prototype.reset = function () {
                this._flags = NodeFlags.Default;
                this._bounds = null;
                this._layer = null;
                this._transform = null;
                this._properties = null;
                this.depth = -1;
            };
            Object.defineProperty(Node.prototype, "clip", {
                get: function () {
                    return this._clip;
                },
                set: function (value) {
                    this._clip = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Node.prototype, "parent", {
                get: function () {
                    return this._parent;
                },
                enumerable: true,
                configurable: true
            });
            Node.prototype.getTransformedBounds = function (target) {
                var bounds = this.getBounds(true);
                if (target === this || bounds.isEmpty()) {
                }
                else {
                    var m = this.getTransform().getConcatenatedMatrix();
                    if (target) {
                        var t = target.getTransform().getInvertedConcatenatedMatrix(true);
                        t.preMultiply(m);
                        t.transformRectangleAABB(bounds);
                        t.free();
                    }
                    else {
                        m.transformRectangleAABB(bounds);
                    }
                }
                return bounds;
            };
            Node.prototype._markCurrentBoundsAsDirtyRegion = function () {
                return;
                /*
                var stage = this.getStage();
                if (!stage) {
                  return;
                }
                var bounds = this.getTransformedBounds(stage);
                stage.dirtyRegion.addDirtyRectangle(bounds);
                */
            };
            Node.prototype.getStage = function (withDirtyRegion) {
                if (withDirtyRegion === void 0) { withDirtyRegion = true; }
                var node = this._parent;
                while (node) {
                    if (node.isType(13 /* Stage */)) {
                        var stage = node;
                        if (withDirtyRegion) {
                            if (stage.dirtyRegion) {
                                return stage;
                            }
                        }
                        else {
                            return stage;
                        }
                    }
                    node = node._parent;
                }
                return null;
            };
            /**
             * This shouldn't be used on any hot path becuse it allocates.
             */
            Node.prototype.getChildren = function (clone) {
                if (clone === void 0) { clone = false; }
                throw Shumway.Debug.abstractMethod("Node::getChildren");
            };
            Node.prototype.getBounds = function (clone) {
                if (clone === void 0) { clone = false; }
                throw Shumway.Debug.abstractMethod("Node::getBounds");
            };
            /**
             * Can only be set on nodes without the |NodeFlags.BoundsAutoCompute| flag set.
             */
            Node.prototype.setBounds = function (value) {
                release || assert(!(this._flags & 2 /* BoundsAutoCompute */));
                var bounds = this._bounds || (this._bounds = Rectangle.createEmpty());
                bounds.set(value);
                this.removeFlags(256 /* InvalidBounds */);
            };
            Node.prototype.clone = function () {
                throw Shumway.Debug.abstractMethod("Node::clone");
            };
            Node.prototype.setFlags = function (flags) {
                this._flags |= flags;
            };
            Node.prototype.hasFlags = function (flags) {
                return (this._flags & flags) === flags;
            };
            Node.prototype.hasAnyFlags = function (flags) {
                return !!(this._flags & flags);
            };
            Node.prototype.removeFlags = function (flags) {
                this._flags &= ~flags;
            };
            Node.prototype.toggleFlags = function (flags, on) {
                if (on) {
                    this._flags |= flags;
                }
                else {
                    this._flags &= ~flags;
                }
            };
            /**
             * Propagates flags up the tree. Propagation stops if all flags are already set.
             */
            Node.prototype._propagateFlagsUp = function (flags) {
                if (flags === 0 /* None */ || this.hasFlags(flags)) {
                    return;
                }
                if (!this.hasFlags(2 /* BoundsAutoCompute */)) {
                    flags &= ~256 /* InvalidBounds */;
                }
                this.setFlags(flags);
                var parent = this._parent;
                if (parent) {
                    parent._propagateFlagsUp(flags);
                }
            };
            /**
             * Propagates flags down the tree. Non-containers just set the flags on themselves.
             */
            Node.prototype._propagateFlagsDown = function (flags) {
                throw Shumway.Debug.abstractMethod("Node::_propagateFlagsDown");
            };
            Node.prototype.isAncestor = function (node) {
                while (node) {
                    if (node === this) {
                        return true;
                    }
                    release || assert(node !== node._parent);
                    node = node._parent;
                }
                return false;
            };
            /**
             * Return's a list of ancestors excluding the |last|, the return list is reused.
             */
            Node._getAncestors = function (node, last) {
                var path = Node._path;
                path.length = 0;
                while (node && node !== last) {
                    release || assert(node !== node._parent);
                    path.push(node);
                    node = node._parent;
                }
                release || assert(node === last, "Last ancestor is not an ancestor.");
                return path;
            };
            /**
             * Finds the closest ancestor with a given set of flags that are either turned on or off.
             */
            Node.prototype._findClosestAncestor = function (flags, on) {
                var node = this;
                while (node) {
                    if (node.hasFlags(flags) === on) {
                        return node;
                    }
                    release || assert(node !== node._parent);
                    node = node._parent;
                }
                return null;
            };
            /**
             * Type check.
             */
            Node.prototype.isType = function (type) {
                return this._type === type;
            };
            /**
             * Subtype check.
             */
            Node.prototype.isTypeOf = function (type) {
                return (this._type & type) === type;
            };
            Node.prototype.isLeaf = function () {
                return this.isType(33 /* Renderable */) || this.isType(3 /* Shape */);
            };
            Node.prototype.isLinear = function () {
                if (this.isLeaf()) {
                    return true;
                }
                if (this.isType(5 /* Group */)) {
                    var children = this._children;
                    if (children.length === 1 && children[0].isLinear()) {
                        return true;
                    }
                }
                return false;
            };
            Node.prototype.getTransformMatrix = function (clone) {
                if (clone === void 0) { clone = false; }
                return this.getTransform().getMatrix(clone);
            };
            Node.prototype.getTransform = function () {
                if (this._transform === null) {
                    this._transform = new Transform(this);
                }
                return this._transform;
            };
            Node.prototype.getLayer = function () {
                if (this._layer === null) {
                    this._layer = new Layer(this);
                }
                return this._layer;
            };
            //    public getConcatenatedMatrix(clone: boolean = false): Matrix {
            //      var transform: Transform = this.getTransform(false);
            //      if (transform) {
            //        return transform.getConcatenatedMatrix(clone);
            //      }
            //      return Matrix.createIdentity();
            //    }
            /**
             * Dispatch on node types.
             */
            Node.prototype.visit = function (visitor, state) {
                switch (this._type) {
                    case 1 /* Node */:
                        visitor.visitNode(this, state);
                        break;
                    case 5 /* Group */:
                        visitor.visitGroup(this, state);
                        break;
                    case 13 /* Stage */:
                        visitor.visitStage(this, state);
                        break;
                    case 3 /* Shape */:
                        visitor.visitShape(this, state);
                        break;
                    case 33 /* Renderable */:
                        visitor.visitRenderable(this, state);
                        break;
                    default:
                        Shumway.Debug.unexpectedCase();
                }
            };
            Node.prototype.invalidate = function () {
                this._markCurrentBoundsAsDirtyRegion();
                this._propagateFlagsUp(NodeFlags.UpOnInvalidate);
            };
            Node.prototype.toString = function (bounds) {
                if (bounds === void 0) { bounds = false; }
                var s = NodeType[this._type] + " " + this._id;
                if (bounds) {
                    s += " " + this._bounds.toString();
                }
                return s;
            };
            /**
             * Temporary array of nodes to avoid allocations.
             */
            Node._path = [];
            /**
             * Used to give nodes unique ids.
             */
            Node._nextId = 0;
            return Node;
        })();
        GFX.Node = Node;
        /**
         * Nodes that contain other nodes.
         */
        var Group = (function (_super) {
            __extends(Group, _super);
            function Group() {
                _super.call(this);
                this._type = 5 /* Group */;
                this._children = [];
            }
            Group.prototype.getChildren = function (clone) {
                if (clone === void 0) { clone = false; }
                if (clone) {
                    return this._children.slice(0);
                }
                return this._children;
            };
            Group.prototype.childAt = function (index) {
                release || assert(index >= 0 && index < this._children.length);
                return this._children[index];
            };
            Object.defineProperty(Group.prototype, "child", {
                get: function () {
                    release || assert(this._children.length === 1);
                    return this._children[0];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Group.prototype, "groupChild", {
                get: function () {
                    release || assert(this._children.length === 1);
                    release || assert(this._children[0] instanceof Group);
                    return this._children[0];
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Adds a node and remove's it from its previous location if it has a parent and propagates
             * flags accordingly.
             */
            Group.prototype.addChild = function (node) {
                release || assert(node);
                release || assert(!node.isAncestor(this));
                if (node._parent) {
                    node._parent.removeChildAt(node._index);
                }
                node._parent = this;
                node._index = this._children.length;
                this._children.push(node);
                this._propagateFlagsUp(NodeFlags.UpOnAddedOrRemoved);
                node._propagateFlagsDown(NodeFlags.DownOnAddedOrRemoved);
                node._markCurrentBoundsAsDirtyRegion();
            };
            /**
             * Removes a child at the given index and propagates flags accordingly.
             */
            Group.prototype.removeChildAt = function (index) {
                release || assert(index >= 0 && index < this._children.length);
                var node = this._children[index];
                release || assert(index === node._index);
                node._markCurrentBoundsAsDirtyRegion();
                this._children.splice(index, 1);
                node._index = -1;
                node._parent = null;
                this._propagateFlagsUp(NodeFlags.UpOnAddedOrRemoved);
                node._propagateFlagsDown(NodeFlags.DownOnAddedOrRemoved);
            };
            Group.prototype.clearChildren = function () {
                for (var i = 0; i < this._children.length; i++) {
                    var child = this._children[i];
                    child._markCurrentBoundsAsDirtyRegion();
                    if (child) {
                        child._index = -1;
                        child._parent = null;
                        child._propagateFlagsDown(NodeFlags.DownOnAddedOrRemoved);
                    }
                }
                this._children.length = 0;
                this._propagateFlagsUp(NodeFlags.UpOnAddedOrRemoved);
            };
            /**
             * Override and propagate flags to all children.
             */
            Group.prototype._propagateFlagsDown = function (flags) {
                if (this.hasFlags(flags)) {
                    return;
                }
                this.setFlags(flags);
                var children = this._children;
                for (var i = 0; i < children.length; i++) {
                    children[i]._propagateFlagsDown(flags);
                }
            };
            /**
             * Takes the inion of all child bounds and caches the bounds locally.
             */
            Group.prototype.getBounds = function (clone) {
                if (clone === void 0) { clone = false; }
                var bounds = this._bounds || (this._bounds = Rectangle.createEmpty());
                if (this.hasFlags(256 /* InvalidBounds */)) {
                    bounds.setEmpty();
                    var children = this._children;
                    var childBounds = Rectangle.allocate();
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        childBounds.set(child.getBounds());
                        child.getTransformMatrix().transformRectangleAABB(childBounds);
                        bounds.union(childBounds);
                    }
                    childBounds.free();
                    this.removeFlags(256 /* InvalidBounds */);
                }
                if (clone) {
                    return bounds.clone();
                }
                return bounds;
            };
            return Group;
        })(Node);
        GFX.Group = Group;
        /**
         * Transform associated with a node. This helps to reduce the size of nodes.
         */
        var Transform = (function () {
            function Transform(node) {
                this._node = node;
                this._matrix = Matrix.createIdentity(); // MEMORY: Lazify construction.
                this._colorMatrix = GFX.ColorMatrix.createIdentity(); // MEMORY: Lazify construction.
                this._concatenatedMatrix = Matrix.createIdentity(); // MEMORY: Lazify construction.
                this._invertedConcatenatedMatrix = Matrix.createIdentity(); // MEMORY: Lazify construction.
                this._concatenatedColorMatrix = GFX.ColorMatrix.createIdentity(); // MEMORY: Lazify construction.
            }
            //    public get x(): number {
            //      return this._matrix.tx;
            //    }
            //
            //    public set x(value: number) {
            //      this._matrix.tx = value;
            //      this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
            //      this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
            //    }
            //
            //    public get y(): number {
            //      return this._matrix.ty;
            //    }
            //
            //    public set y(value: number) {
            //      this._matrix.ty = value;
            //      this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
            //      this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
            //    }
            /**
             * Set a node's transform matrix. You should never mutate the matrix object directly.
             */
            Transform.prototype.setMatrix = function (value) {
                if (this._matrix.isEqual(value)) {
                    return;
                }
                this._node._markCurrentBoundsAsDirtyRegion();
                this._matrix.set(value);
                this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
                this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
                this._node._markCurrentBoundsAsDirtyRegion();
            };
            Transform.prototype.setColorMatrix = function (value) {
                this._colorMatrix.set(value);
                this._node._propagateFlagsUp(NodeFlags.UpOnColorMatrixChanged);
                this._node._propagateFlagsDown(NodeFlags.DownOnColorMatrixChanged);
            };
            Transform.prototype.getMatrix = function (clone) {
                if (clone === void 0) { clone = false; }
                if (clone) {
                    return this._matrix.clone();
                }
                return this._matrix;
            };
            Transform.prototype.hasColorMatrix = function () {
                return this._colorMatrix !== null;
            };
            Transform.prototype.getColorMatrix = function (clone) {
                if (clone === void 0) { clone = false; }
                if (this._colorMatrix === null) {
                    this._colorMatrix = GFX.ColorMatrix.createIdentity();
                }
                if (clone) {
                    return this._colorMatrix.clone();
                }
                return this._colorMatrix;
            };
            /**
             * Compute the concatenated transforms for this node and all of its ancestors since we're already doing
             * all the work.
             */
            Transform.prototype.getConcatenatedMatrix = function (clone) {
                if (clone === void 0) { clone = false; }
                if (this._node.hasFlags(512 /* InvalidConcatenatedMatrix */)) {
                    var ancestor = this._node._findClosestAncestor(512 /* InvalidConcatenatedMatrix */, false);
                    var path = Node._getAncestors(this._node, ancestor);
                    var m = ancestor ? ancestor.getTransform()._concatenatedMatrix.clone() : Matrix.createIdentity();
                    for (var i = path.length - 1; i >= 0; i--) {
                        var ancestor = path[i];
                        var ancestorTransform = ancestor.getTransform();
                        release || assert(ancestor.hasFlags(512 /* InvalidConcatenatedMatrix */));
                        m.preMultiply(ancestorTransform._matrix);
                        ancestorTransform._concatenatedMatrix.set(m);
                        ancestor.removeFlags(512 /* InvalidConcatenatedMatrix */);
                    }
                }
                if (clone) {
                    return this._concatenatedMatrix.clone();
                }
                return this._concatenatedMatrix;
            };
            Transform.prototype.getInvertedConcatenatedMatrix = function (clone) {
                if (clone === void 0) { clone = false; }
                if (this._node.hasFlags(1024 /* InvalidInvertedConcatenatedMatrix */)) {
                    this.getConcatenatedMatrix().inverse(this._invertedConcatenatedMatrix);
                    this._node.removeFlags(1024 /* InvalidInvertedConcatenatedMatrix */);
                }
                if (clone) {
                    return this._invertedConcatenatedMatrix.clone();
                }
                return this._invertedConcatenatedMatrix;
            };
            //    public getConcatenatedColorMatrix(clone: boolean = false): ColorMatrix {
            //      // Compute the concatenated color transforms for this node and all of its ancestors.
            //      if (this.hasFlags(NodeFlags.InvalidConcatenatedColorMatrix)) {
            //        var ancestor = <Transform>this._findClosestAncestor(NodeFlags.InvalidConcatenatedColorMatrix, false);
            //        var path = <Transform []>Node._getAncestors(this, ancestor, NodeType.Transform);
            //        var m = ancestor ? ancestor._concatenatedColorMatrix.clone() : ColorMatrix.createIdentity();
            //        for (var i = path.length - 1; i >= 0; i--) {
            //          var ancestor = path[i];
            //          release || assert (ancestor.hasFlags(NodeFlags.InvalidConcatenatedColorMatrix));
            //          // TODO: Premultiply here.
            //          m.multiply(ancestor._colorMatrix);
            //          ancestor._concatenatedColorMatrix.set(m);
            //          ancestor.removeFlags(NodeFlags.InvalidConcatenatedColorMatrix);
            //        }
            //      }
            //      if (clone) {
            //        return this._concatenatedColorMatrix.clone();
            //      }
            //      return this._concatenatedColorMatrix;
            //    }
            Transform.prototype.toString = function () {
                return this._matrix.toString();
            };
            return Transform;
        })();
        GFX.Transform = Transform;
        /**
         * Layer information associated with a node. This helps to reduce the size of nodes.
         */
        var Layer = (function () {
            function Layer(node) {
                this._node = node;
                this._mask = null;
                this._blendMode = 1 /* Normal */;
            }
            Object.defineProperty(Layer.prototype, "filters", {
                get: function () {
                    return this._filters;
                },
                set: function (value) {
                    this._filters = value;
                    if (value.length) {
                        // TODO: We could avoid invalidating the node if the new filter list contains equal filter objects.
                        this._node.invalidate();
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Layer.prototype, "blendMode", {
                get: function () {
                    return this._blendMode;
                },
                set: function (value) {
                    this._blendMode = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Layer.prototype, "mask", {
                get: function () {
                    return this._mask;
                },
                set: function (value) {
                    if (this._mask && this._mask !== value) {
                        this._mask.removeFlags(4 /* IsMask */);
                    }
                    this._mask = value;
                    if (this._mask) {
                        this._mask.setFlags(4 /* IsMask */);
                    }
                    // TODO: Keep track of masked object so we can propagate flags up.
                },
                enumerable: true,
                configurable: true
            });
            Layer.prototype.toString = function () {
                return BlendMode[this._blendMode];
            };
            return Layer;
        })();
        GFX.Layer = Layer;
        /**
         * Shapes are instantiations of Renderables.
         */
        var Shape = (function (_super) {
            __extends(Shape, _super);
            function Shape(source) {
                _super.call(this);
                release || assert(source);
                this._source = source;
                this._type = 3 /* Shape */;
                this.ratio = 0;
            }
            Shape.prototype.getBounds = function (clone) {
                if (clone === void 0) { clone = false; }
                var bounds = this._bounds || (this._bounds = Rectangle.createEmpty());
                if (this.hasFlags(256 /* InvalidBounds */)) {
                    bounds.set(this._source.getBounds());
                    this.removeFlags(256 /* InvalidBounds */);
                }
                if (clone) {
                    return bounds.clone();
                }
                return bounds;
            };
            Object.defineProperty(Shape.prototype, "source", {
                get: function () {
                    return this._source;
                },
                enumerable: true,
                configurable: true
            });
            Shape.prototype._propagateFlagsDown = function (flags) {
                this.setFlags(flags);
            };
            Shape.prototype.getChildren = function (clone) {
                if (clone === void 0) { clone = false; }
                return [this._source];
            };
            return Shape;
        })(Node);
        GFX.Shape = Shape;
        var StageAlignFlags = Shumway.Remoting.StageAlignFlags;
        var StageScaleMode = Shumway.Remoting.StageScaleMode;
        function getRandomIntInclusive(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var RendererOptions = (function () {
            function RendererOptions() {
                this.debug = false;
                this.paintRenderable = true;
                this.paintBounds = false;
                this.paintDirtyRegion = false;
                this.paintFlashing = false;
                this.paintViewport = false;
                this.clear = true;
            }
            return RendererOptions;
        })();
        GFX.RendererOptions = RendererOptions;
        (function (Backend) {
            Backend[Backend["Canvas2D"] = 0] = "Canvas2D";
            Backend[Backend["WebGL"] = 1] = "WebGL";
            Backend[Backend["Both"] = 2] = "Both";
            Backend[Backend["DOM"] = 3] = "DOM";
            Backend[Backend["SVG"] = 4] = "SVG"; // Someday
        })(GFX.Backend || (GFX.Backend = {}));
        var Backend = GFX.Backend;
        /**
         * Base class for all renderers.
         */
        var Renderer = (function (_super) {
            __extends(Renderer, _super);
            function Renderer(container, stage, options) {
                _super.call(this);
                this._container = container;
                this._stage = stage;
                this._options = options;
                this._viewport = Rectangle.createSquare(1024);
                this._devicePixelRatio = 1;
            }
            Object.defineProperty(Renderer.prototype, "viewport", {
                set: function (viewport) {
                    this._viewport.set(viewport);
                },
                enumerable: true,
                configurable: true
            });
            Renderer.prototype.render = function () {
                throw Shumway.Debug.abstractMethod("Renderer::render");
            };
            /**
             * Notify renderer that the viewport has changed.
             */
            Renderer.prototype.resize = function () {
                throw Shumway.Debug.abstractMethod("Renderer::resize");
            };
            /**
             * Captures a rectangular region of the easel as a dataURL as specified by |bounds|. |stageContent| indicates if the bounds
             * should be computed by looking at the bounds of the content of the easel rather than the easel itself.
             */
            Renderer.prototype.screenShot = function (bounds, stageContent) {
                throw Shumway.Debug.abstractMethod("Renderer::screenShot");
            };
            return Renderer;
        })(NodeVisitor);
        GFX.Renderer = Renderer;
        /**
         * Node container that handles Flash style alignment and scale modes.
         */
        var Stage = (function (_super) {
            __extends(Stage, _super);
            function Stage(w, h, trackDirtyRegion) {
                if (trackDirtyRegion === void 0) { trackDirtyRegion = false; }
                _super.call(this);
                this._preVisitor = new PreRenderVisitor();
                this._flags &= ~2 /* BoundsAutoCompute */;
                this._type = 13 /* Stage */;
                this._scaleMode = Stage.DEFAULT_SCALE;
                this._align = Stage.DEFAULT_ALIGN;
                this._content = new Group();
                this._content._flags &= ~2 /* BoundsAutoCompute */;
                this.addChild(this._content);
                this.setFlags(16 /* Dirty */);
                this.setBounds(new Rectangle(0, 0, w, h));
                if (trackDirtyRegion) {
                    this._dirtyRegion = new DirtyRegion(w, h);
                    this._dirtyRegion.addDirtyRectangle(new Rectangle(0, 0, w, h));
                }
                else {
                    this._dirtyRegion = null;
                }
                this._updateContentMatrix();
            }
            Object.defineProperty(Stage.prototype, "dirtyRegion", {
                get: function () {
                    return this._dirtyRegion;
                },
                enumerable: true,
                configurable: true
            });
            Stage.prototype.setBounds = function (value) {
                _super.prototype.setBounds.call(this, value);
                this._updateContentMatrix();
                this._dispatchEvent(1 /* OnStageBoundsChanged */);
                if (this._dirtyRegion) {
                    this._dirtyRegion = new DirtyRegion(value.w, value.h);
                    this._dirtyRegion.addDirtyRectangle(value);
                }
            };
            Object.defineProperty(Stage.prototype, "content", {
                get: function () {
                    return this._content;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Checks to see if we should render and if so, clears any relevant dirty flags. Returns
             * true if rendering should commence. Flag clearing is made optional here in case there
             * is any code that needs to check if rendering is about to happen.
             */
            Stage.prototype.readyToRender = function () {
                this._preVisitor.isDirty = false;
                this._preVisitor.start(this, this._dirtyRegion);
                if (this._preVisitor.isDirty) {
                    return true;
                }
                return false;
            };
            Object.defineProperty(Stage.prototype, "align", {
                get: function () {
                    return this._align;
                },
                set: function (value) {
                    this._align = value;
                    this._updateContentMatrix();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Stage.prototype, "scaleMode", {
                get: function () {
                    return this._scaleMode;
                },
                set: function (value) {
                    this._scaleMode = value;
                    this._updateContentMatrix();
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Figure out what the content transform shuold be given the current align and scale modes.
             */
            Stage.prototype._updateContentMatrix = function () {
                if (this._scaleMode === Stage.DEFAULT_SCALE && this._align === Stage.DEFAULT_ALIGN) {
                    // Shortcut and also guard to avoid using targetWidth/targetHeight.
                    // ThetargetWidth/targetHeight normally set in setScaleAndAlign call.
                    this._content.getTransform().setMatrix(new Matrix(1, 0, 0, 1, 0, 0));
                    return;
                }
                var bounds = this.getBounds();
                var contentBounds = this._content.getBounds();
                // Debug.assert(this.targetWidth > 0 && this.targetHeight > 0);
                var wScale = bounds.w / contentBounds.w;
                var hScale = bounds.h / contentBounds.h;
                var scaleX, scaleY;
                switch (this._scaleMode) {
                    case 2 /* NoBorder */:
                        scaleX = scaleY = Math.max(wScale, hScale);
                        break;
                    case 4 /* NoScale */:
                        scaleX = scaleY = 1;
                        break;
                    case 1 /* ExactFit */:
                        scaleX = wScale;
                        scaleY = hScale;
                        break;
                    default:
                        scaleX = scaleY = Math.min(wScale, hScale);
                        break;
                }
                var offsetX;
                if ((this._align & 4 /* Left */)) {
                    offsetX = 0;
                }
                else if ((this._align & 8 /* Right */)) {
                    offsetX = bounds.w - contentBounds.w * scaleX;
                }
                else {
                    offsetX = (bounds.w - contentBounds.w * scaleX) / 2;
                }
                var offsetY;
                if ((this._align & 1 /* Top */)) {
                    offsetY = 0;
                }
                else if ((this._align & 2 /* Bottom */)) {
                    offsetY = bounds.h - contentBounds.h * scaleY;
                }
                else {
                    offsetY = (bounds.h - contentBounds.h * scaleY) / 2;
                }
                this._content.getTransform().setMatrix(new Matrix(scaleX, 0, 0, scaleY, offsetX, offsetY));
            };
            // Using these constants initially -- they don't require knowing bounds.
            // Notice that this default values are different from ActionScript object values.
            Stage.DEFAULT_SCALE = 4 /* NoScale */;
            Stage.DEFAULT_ALIGN = 4 /* Left */ | 1 /* Top */;
            return Stage;
        })(Group);
        GFX.Stage = Stage;
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Point = GFX.Geometry.Point;
        var Rectangle = GFX.Geometry.Rectangle;
        var PathCommand = Shumway.PathCommand;
        var Matrix = GFX.Geometry.Matrix;
        var assertUnreachable = Shumway.Debug.assertUnreachable;
        var assert = Shumway.Debug.assert;
        var indexOf = Shumway.ArrayUtilities.indexOf;
        var VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
        var VideoControlEvent = Shumway.Remoting.VideoControlEvent;
        /**
         * Represents some source renderable content.
         */
        var Renderable = (function (_super) {
            __extends(Renderable, _super);
            function Renderable() {
                _super.call(this);
                /**
                 * Back reference to nodes that use this renderable.
                 */
                this._parents = [];
                /**
                 * Back reference to renderables that use this renderable.
                 */
                this._renderableParents = [];
                this._invalidateEventListeners = null;
                this._flags &= ~2 /* BoundsAutoCompute */;
                this._type = 33 /* Renderable */;
            }
            Object.defineProperty(Renderable.prototype, "parents", {
                get: function () {
                    return this._parents;
                },
                enumerable: true,
                configurable: true
            });
            Renderable.prototype.addParent = function (frame) {
                release || assert(frame);
                var index = indexOf(this._parents, frame);
                release || assert(index < 0);
                this._parents.push(frame);
            };
            /**
             * Checks if this node will be reached by the renderer.
             */
            Renderable.prototype.willRender = function () {
                var parents = this._parents;
                for (var i = 0; i < parents.length; i++) {
                    var node = parents[i];
                    while (node) {
                        if (node.isType(13 /* Stage */)) {
                            return true;
                        }
                        if (!node.hasFlags(65536 /* Visible */)) {
                            break;
                        }
                        node = node._parent;
                    }
                }
                return false;
            };
            Renderable.prototype.addRenderableParent = function (renderable) {
                release || assert(renderable);
                release || assert(this._renderableParents.indexOf(renderable) === -1);
                this._renderableParents.push(renderable);
            };
            /**
             * Returns the first unrooted parent or creates a new parent if none was found.
             */
            Renderable.prototype.wrap = function () {
                var node;
                var parents = this._parents;
                for (var i = 0; i < parents.length; i++) {
                    node = parents[i];
                    if (!node._parent) {
                        return node;
                    }
                }
                node = new GFX.Shape(this);
                this.addParent(node);
                return node;
            };
            Renderable.prototype.invalidate = function () {
                this.setFlags(16 /* Dirty */);
                var nodes = this._parents;
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].invalidate();
                }
                var renderables = this._renderableParents;
                for (var i = 0; i < renderables.length; i++) {
                    renderables[i].invalidate();
                }
                var listeners = this._invalidateEventListeners;
                if (listeners) {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i](this);
                    }
                }
            };
            Renderable.prototype.addInvalidateEventListener = function (listener) {
                if (!this._invalidateEventListeners) {
                    this._invalidateEventListeners = [];
                }
                var index = indexOf(this._invalidateEventListeners, listener);
                release || assert(index < 0);
                this._invalidateEventListeners.push(listener);
            };
            Renderable.prototype.getBounds = function (clone) {
                if (clone === void 0) { clone = false; }
                if (clone) {
                    return this._bounds.clone();
                }
                return this._bounds;
            };
            Renderable.prototype.getChildren = function (clone) {
                if (clone === void 0) { clone = false; }
                return null;
            };
            Renderable.prototype._propagateFlagsUp = function (flags) {
                if (flags === 0 /* None */ || this.hasFlags(flags)) {
                    return;
                }
                for (var i = 0; i < this._parents.length; i++) {
                    this._parents[i]._propagateFlagsUp(flags);
                }
            };
            /**
             * Render source content in the specified |context| or add one or more paths to |clipPath| if specified.
             * If specified, the rectangular |cullBounds| can be used to cull parts of the shape for better performance.
             * If |paintStencil| is |true| then we must not create any alpha values, and also not paint any strokes.
             */
            Renderable.prototype.render = function (context, ratio, cullBounds, clipPath, paintStencil) {
            };
            return Renderable;
        })(GFX.Node);
        GFX.Renderable = Renderable;
        var CustomRenderable = (function (_super) {
            __extends(CustomRenderable, _super);
            function CustomRenderable(bounds, render) {
                _super.call(this);
                this.setBounds(bounds);
                this.render = render;
            }
            return CustomRenderable;
        })(Renderable);
        GFX.CustomRenderable = CustomRenderable;
        (function (RenderableVideoState) {
            RenderableVideoState[RenderableVideoState["Idle"] = 1] = "Idle";
            RenderableVideoState[RenderableVideoState["Playing"] = 2] = "Playing";
            RenderableVideoState[RenderableVideoState["Paused"] = 3] = "Paused";
            RenderableVideoState[RenderableVideoState["Ended"] = 4] = "Ended";
        })(GFX.RenderableVideoState || (GFX.RenderableVideoState = {}));
        var RenderableVideoState = GFX.RenderableVideoState;
        var RenderableVideo = (function (_super) {
            __extends(RenderableVideo, _super);
            function RenderableVideo(assetId, eventSerializer) {
                _super.call(this);
                this._flags = 1048576 /* Dynamic */ | 16 /* Dirty */;
                this._lastTimeInvalidated = 0;
                this._lastPausedTime = 0;
                this._seekHappening = false;
                this._pauseHappening = false;
                this._isDOMElement = true;
                this.setBounds(new Rectangle(0, 0, 1, 1));
                this._assetId = assetId;
                this._eventSerializer = eventSerializer;
                var element = document.createElement('video');
                var elementEventHandler = this._handleVideoEvent.bind(this);
                element.preload = 'metadata'; // for mobile devices
                element.addEventListener("play", elementEventHandler);
                element.addEventListener("pause", elementEventHandler);
                element.addEventListener("ended", elementEventHandler);
                element.addEventListener("loadeddata", elementEventHandler);
                element.addEventListener("progress", elementEventHandler);
                element.addEventListener("suspend", elementEventHandler);
                element.addEventListener("loadedmetadata", elementEventHandler);
                element.addEventListener("error", elementEventHandler);
                element.addEventListener("seeking", elementEventHandler);
                element.addEventListener("seeked", elementEventHandler);
                element.addEventListener("canplay", elementEventHandler);
                element.style.position = 'absolute';
                this._video = element;
                this._videoEventHandler = elementEventHandler;
                RenderableVideo._renderableVideos.push(this);
                if (typeof registerInspectorAsset !== "undefined") {
                    registerInspectorAsset(-1, -1, this);
                }
                this._state = 1 /* Idle */;
            }
            Object.defineProperty(RenderableVideo.prototype, "video", {
                get: function () {
                    return this._video;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RenderableVideo.prototype, "state", {
                get: function () {
                    return this._state;
                },
                enumerable: true,
                configurable: true
            });
            RenderableVideo.prototype.play = function () {
                this._state = 2 /* Playing */;
                this._video.play();
            };
            RenderableVideo.prototype.pause = function () {
                this._state = 3 /* Paused */;
                this._video.pause();
            };
            RenderableVideo.prototype._handleVideoEvent = function (evt) {
                var type;
                var data = null;
                var element = this._video;
                switch (evt.type) {
                    case "play":
                        if (!this._pauseHappening) {
                            return;
                        }
                        type = 7 /* Unpause */;
                        break;
                    case "pause":
                        if (this._state === 2 /* Playing */) {
                            element.play();
                            return;
                        }
                        type = 6 /* Pause */;
                        this._pauseHappening = true;
                        break;
                    case "ended":
                        this._state = 4 /* Ended */;
                        this._notifyNetStream(3 /* PlayStop */, data);
                        type = 4 /* BufferEmpty */;
                        break;
                    case "loadeddata":
                        this._pauseHappening = false;
                        this._notifyNetStream(2 /* PlayStart */, data);
                        this.play();
                        return;
                    case "canplay":
                        if (this._pauseHappening) {
                            return;
                        }
                        type = 5 /* BufferFull */;
                        break;
                    case "progress":
                        type = 10 /* Progress */;
                        break;
                    case "suspend":
                        //          type = VideoPlaybackEvent.BufferEmpty;
                        //          break;
                        return;
                    case "loadedmetadata":
                        type = 1 /* Metadata */;
                        data = {
                            videoWidth: element.videoWidth,
                            videoHeight: element.videoHeight,
                            duration: element.duration
                        };
                        break;
                    case "error":
                        type = 11 /* Error */;
                        data = {
                            code: element.error.code
                        };
                        break;
                    case "seeking":
                        if (!this._seekHappening) {
                            return;
                        }
                        type = 8 /* Seeking */;
                        break;
                    case "seeked":
                        if (!this._seekHappening) {
                            return;
                        }
                        type = 9 /* Seeked */;
                        this._seekHappening = false;
                        break;
                    default:
                        return;
                }
                this._notifyNetStream(type, data);
            };
            RenderableVideo.prototype._notifyNetStream = function (eventType, data) {
                this._eventSerializer.sendVideoPlaybackEvent(this._assetId, eventType, data);
            };
            RenderableVideo.prototype.processControlRequest = function (type, data) {
                var videoElement = this._video;
                var ESTIMATED_VIDEO_SECOND_SIZE = 500;
                switch (type) {
                    case 1 /* Init */:
                        videoElement.src = data.url;
                        this.play();
                        this._notifyNetStream(0 /* Initialized */, null);
                        break;
                    case 9 /* EnsurePlaying */:
                        if (videoElement.paused) {
                            videoElement.play();
                        }
                        break;
                    case 2 /* Pause */:
                        if (videoElement) {
                            if (data.paused && !videoElement.paused) {
                                if (!isNaN(data.time)) {
                                    if (videoElement.seekable.length !== 0) {
                                        videoElement.currentTime = data.time;
                                    }
                                    this._lastPausedTime = data.time;
                                }
                                else {
                                    this._lastPausedTime = videoElement.currentTime;
                                }
                                this.pause();
                            }
                            else if (!data.paused && videoElement.paused) {
                                this.play();
                                if (!isNaN(data.time) && this._lastPausedTime !== data.time && videoElement.seekable.length !== 0) {
                                    videoElement.currentTime = data.time;
                                }
                            }
                        }
                        return;
                    case 3 /* Seek */:
                        if (videoElement && videoElement.seekable.length !== 0) {
                            this._seekHappening = true;
                            videoElement.currentTime = data.time;
                        }
                        return;
                    case 4 /* GetTime */:
                        return videoElement ? videoElement.currentTime : 0;
                    case 5 /* GetBufferLength */:
                        return videoElement ? videoElement.duration : 0;
                    case 6 /* SetSoundLevels */:
                        if (videoElement) {
                            videoElement.volume = data.volume;
                        }
                        return;
                    case 7 /* GetBytesLoaded */:
                        if (!videoElement) {
                            return 0;
                        }
                        var bufferedTill = -1;
                        if (videoElement.buffered) {
                            for (var i = 0; i < videoElement.buffered.length; i++) {
                                bufferedTill = Math.max(bufferedTill, videoElement.buffered.end(i));
                            }
                        }
                        else {
                            bufferedTill = videoElement.duration;
                        }
                        return Math.round(bufferedTill * ESTIMATED_VIDEO_SECOND_SIZE);
                    case 8 /* GetBytesTotal */:
                        return videoElement ? Math.round(videoElement.duration * ESTIMATED_VIDEO_SECOND_SIZE) : 0;
                }
            };
            RenderableVideo.prototype.checkForUpdate = function () {
                if (this._lastTimeInvalidated !== this._video.currentTime) {
                    // Videos composited using DOM elements don't need to invalidate parents.
                    if (!this._isDOMElement) {
                        this.invalidate();
                    }
                }
                this._lastTimeInvalidated = this._video.currentTime;
            };
            RenderableVideo.checkForVideoUpdates = function () {
                var renderables = RenderableVideo._renderableVideos;
                for (var i = 0; i < renderables.length; i++) {
                    var renderable = renderables[i];
                    // Check if the node will be reached by the renderer.
                    if (renderable.willRender()) {
                        // If the nodes video element isn't already on the video layer, mark the node as invalid to
                        // make sure the video element will be added the next time the renderer reaches it.
                        if (!renderable._video.parentElement) {
                            renderable.invalidate();
                        }
                        renderable._video.style.zIndex = renderable.parents[0].depth + '';
                    }
                    else if (renderable._video.parentElement) {
                        // The nodes video element should be removed if no longer visible.
                        renderable._dispatchEvent(2 /* RemovedFromStage */);
                    }
                    renderables[i].checkForUpdate();
                }
            };
            RenderableVideo.prototype.render = function (context, ratio, cullBounds) {
                GFX.enterTimeline("RenderableVideo.render");
                var videoElement = this._video;
                if (videoElement && videoElement.videoWidth > 0) {
                    context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, 0, 0, this._bounds.w, this._bounds.h);
                }
                GFX.leaveTimeline("RenderableVideo.render");
            };
            RenderableVideo._renderableVideos = [];
            return RenderableVideo;
        })(Renderable);
        GFX.RenderableVideo = RenderableVideo;
        var RenderableBitmap = (function (_super) {
            __extends(RenderableBitmap, _super);
            function RenderableBitmap(source /* HTMLImageElement | HTMLCanvasElement */, bounds) {
                _super.call(this);
                this._flags = 1048576 /* Dynamic */ | 16 /* Dirty */;
                this.properties = {};
                this.setBounds(bounds);
                if (source instanceof HTMLCanvasElement) {
                    this._initializeSourceCanvas(source);
                }
                else {
                    this._sourceImage = source;
                }
            }
            RenderableBitmap.FromDataBuffer = function (type, dataBuffer, bounds) {
                GFX.enterTimeline("RenderableBitmap.FromDataBuffer");
                var canvas = document.createElement("canvas");
                canvas.width = bounds.w;
                canvas.height = bounds.h;
                var renderableBitmap = new RenderableBitmap(canvas, bounds);
                renderableBitmap.updateFromDataBuffer(type, dataBuffer);
                GFX.leaveTimeline("RenderableBitmap.FromDataBuffer");
                return renderableBitmap;
            };
            RenderableBitmap.FromNode = function (source, matrix, colorMatrix, blendMode, clipRect) {
                GFX.enterTimeline("RenderableBitmap.FromFrame");
                var canvas = document.createElement("canvas");
                var bounds = source.getBounds();
                canvas.width = bounds.w;
                canvas.height = bounds.h;
                var renderableBitmap = new RenderableBitmap(canvas, bounds);
                renderableBitmap.drawNode(source, matrix, colorMatrix, blendMode, clipRect);
                GFX.leaveTimeline("RenderableBitmap.FromFrame");
                return renderableBitmap;
            };
            /**
             * Returns a RenderableBitmap from an Image element, which it uses as its source.
             *
             * Takes `width` and `height` as arguments so it can deal with non-decoded images,
             * which will only get their data after asynchronous decoding has completed.
             */
            RenderableBitmap.FromImage = function (image, width, height) {
                return new RenderableBitmap(image, new Rectangle(0, 0, width, height));
            };
            RenderableBitmap.prototype.updateFromDataBuffer = function (type, dataBuffer) {
                if (!GFX.imageUpdateOption.value) {
                    return;
                }
                var buffer = dataBuffer.buffer;
                GFX.enterTimeline("RenderableBitmap.updateFromDataBuffer", { length: dataBuffer.length });
                if (type === 4 /* JPEG */ || type === 5 /* PNG */ || type === 6 /* GIF */) {
                    release || Shumway.Debug.assertUnreachable("Mustn't encounter un-decoded images here");
                }
                else {
                    var bounds = this._bounds;
                    var imageData = this._imageData;
                    if (!imageData || imageData.width !== bounds.w || imageData.height !== bounds.h) {
                        imageData = this._imageData = this._context.createImageData(bounds.w, bounds.h);
                    }
                    if (GFX.imageConvertOption.value) {
                        GFX.enterTimeline("ColorUtilities.convertImage");
                        var pixels = new Int32Array(buffer);
                        var out = new Int32Array(imageData.data.buffer);
                        Shumway.ColorUtilities.convertImage(type, 3 /* StraightAlphaRGBA */, pixels, out);
                        GFX.leaveTimeline("ColorUtilities.convertImage");
                    }
                    GFX.enterTimeline("putImageData");
                    this._ensureSourceCanvas();
                    this._context.putImageData(imageData, 0, 0);
                    GFX.leaveTimeline("putImageData");
                }
                this.invalidate();
                GFX.leaveTimeline("RenderableBitmap.updateFromDataBuffer");
            };
            /**
             * Writes the image data into the given |output| data buffer.
             */
            RenderableBitmap.prototype.readImageData = function (output) {
                output.writeRawBytes(this.imageData.data);
            };
            RenderableBitmap.prototype.render = function (context, ratio, cullBounds) {
                GFX.enterTimeline("RenderableBitmap.render");
                if (this.renderSource) {
                    context.drawImage(this.renderSource, 0, 0);
                }
                else {
                    this._renderFallback(context);
                }
                GFX.leaveTimeline("RenderableBitmap.render");
            };
            RenderableBitmap.prototype.drawNode = function (source, matrix, colorMatrix, blendMode, clip) {
                // TODO: Support colorMatrix and blendMode.
                GFX.enterTimeline("RenderableBitmap.drawFrame");
                // TODO: Hack to be able to compile this as part of gfx-base.
                var Canvas2D = GFX.Canvas2D;
                var bounds = this.getBounds();
                // TODO: don't create a new renderer every time.
                var renderer = new Canvas2D.Canvas2DRenderer(this._canvas, null);
                renderer.renderNode(source, clip || bounds, matrix);
                GFX.leaveTimeline("RenderableBitmap.drawFrame");
            };
            RenderableBitmap.prototype._initializeSourceCanvas = function (source) {
                this._canvas = source;
                this._context = this._canvas.getContext("2d");
            };
            RenderableBitmap.prototype._ensureSourceCanvas = function () {
                if (this._canvas) {
                    return;
                }
                var canvas = document.createElement("canvas");
                var bounds = this._bounds;
                canvas.width = bounds.w;
                canvas.height = bounds.h;
                this._initializeSourceCanvas(canvas);
            };
            Object.defineProperty(RenderableBitmap.prototype, "imageData", {
                get: function () {
                    if (!this._canvas) {
                        release || assert(this._sourceImage);
                        this._ensureSourceCanvas();
                        this._context.drawImage(this._sourceImage, 0, 0);
                        this._sourceImage = null;
                    }
                    return this._context.getImageData(0, 0, this._bounds.w, this._bounds.h);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RenderableBitmap.prototype, "renderSource", {
                get: function () {
                    return this._canvas || this._sourceImage;
                },
                enumerable: true,
                configurable: true
            });
            RenderableBitmap.prototype._renderFallback = function (context) {
                // Only render fallback in debug mode.
                if (release) {
                    return;
                }
                if (!this.fillStyle) {
                    this.fillStyle = Shumway.ColorStyle.randomStyle();
                }
                var bounds = this._bounds;
                context.save();
                context.beginPath();
                context.lineWidth = 2;
                context.fillStyle = this.fillStyle;
                context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                context.restore();
            };
            return RenderableBitmap;
        })(Renderable);
        GFX.RenderableBitmap = RenderableBitmap;
        (function (PathType) {
            PathType[PathType["Fill"] = 0] = "Fill";
            PathType[PathType["Stroke"] = 1] = "Stroke";
            PathType[PathType["StrokeFill"] = 2] = "StrokeFill"; /* Doesn't define thickness, caps and joints. */
        })(GFX.PathType || (GFX.PathType = {}));
        var PathType = GFX.PathType;
        var StyledPath = (function () {
            function StyledPath(type, style, smoothImage, strokeProperties) {
                this.type = type;
                this.style = style;
                this.smoothImage = smoothImage;
                this.strokeProperties = strokeProperties;
                this.path = new Path2D();
                release || assert((type === 1 /* Stroke */) === !!strokeProperties);
            }
            return StyledPath;
        })();
        GFX.StyledPath = StyledPath;
        var StrokeProperties = (function () {
            function StrokeProperties(thickness, scaleMode, capsStyle, jointsStyle, miterLimit) {
                this.thickness = thickness;
                this.scaleMode = scaleMode;
                this.capsStyle = capsStyle;
                this.jointsStyle = jointsStyle;
                this.miterLimit = miterLimit;
            }
            return StrokeProperties;
        })();
        GFX.StrokeProperties = StrokeProperties;
        function morph(start, end, ratio) {
            return start + (end - start) * ratio;
        }
        function morphColor(start, end, ratio) {
            return morph(start >> 24 & 0xff, end >> 24 & 0xff, ratio) << 24 | morph(start >> 16 & 0xff, end >> 16 & 0xff, ratio) << 16 | morph(start >> 8 & 0xff, end >> 8 & 0xff, ratio) << 8 | morph(start & 0xff, end & 0xff, ratio);
        }
        var RenderableShape = (function (_super) {
            __extends(RenderableShape, _super);
            function RenderableShape(id, pathData, textures, bounds) {
                _super.call(this);
                this._flags = 16 /* Dirty */ | 2097152 /* Scalable */ | 4194304 /* Tileable */;
                this.properties = {};
                this.setBounds(bounds);
                this._id = id;
                this._pathData = pathData;
                this._textures = textures;
                if (textures.length) {
                    this.setFlags(1048576 /* Dynamic */);
                }
            }
            RenderableShape.prototype.update = function (pathData, textures, bounds) {
                this.setBounds(bounds);
                this._pathData = pathData;
                this._paths = null;
                this._textures = textures;
                this.setFlags(1048576 /* Dynamic */);
                this.invalidate();
            };
            /**
             * If |clipPath| is not |null| then we must add all paths to |clipPath| instead of drawing to |context|.
             * We also cannot call |save| or |restore| because those functions reset the current clipping region.
             * It looks like Flash ignores strokes when clipping so we can also ignore stroke paths when computing
             * the clip region.
             *
             * If |paintStencil| is |true| then we must not create any alpha values, and also not paint
             * any strokes.
             */
            RenderableShape.prototype.render = function (context, ratio, cullBounds, clipPath, paintStencil) {
                if (clipPath === void 0) { clipPath = null; }
                if (paintStencil === void 0) { paintStencil = false; }
                var paintStencilStyle = release ? '#000000' : '#FF4981';
                context.fillStyle = context.strokeStyle = 'transparent';
                var paths = this._deserializePaths(this._pathData, context, ratio);
                release || assert(paths);
                GFX.enterTimeline("RenderableShape.render", this);
                for (var i = 0; i < paths.length; i++) {
                    var path = paths[i];
                    context['mozImageSmoothingEnabled'] = context.msImageSmoothingEnabled = context['imageSmoothingEnabled'] = path.smoothImage;
                    if (path.type === 0 /* Fill */) {
                        if (clipPath) {
                            clipPath.addPath(path.path, context.currentTransform);
                        }
                        else {
                            context.fillStyle = paintStencil ? paintStencilStyle : path.style;
                            context.fill(path.path, 'evenodd');
                            context.fillStyle = 'transparent';
                        }
                    }
                    else if (!clipPath && !paintStencil) {
                        context.strokeStyle = path.style;
                        var lineScaleMode = 1 /* Normal */;
                        if (path.strokeProperties) {
                            lineScaleMode = path.strokeProperties.scaleMode;
                            context.lineWidth = path.strokeProperties.thickness;
                            context.lineCap = path.strokeProperties.capsStyle;
                            context.lineJoin = path.strokeProperties.jointsStyle;
                            context.miterLimit = path.strokeProperties.miterLimit;
                        }
                        // Special-cases 1px and 3px lines by moving the drawing position down/right by 0.5px.
                        // Flash apparently does this to create sharp, non-aliased lines in the normal case of thin
                        // lines drawn on round pixel values.
                        // Our handling doesn't always create the same results: for drawing coordinates with
                        // fractional values, Flash draws blurry lines. We do, too, but we still move the line
                        // down/right. Flash does something slightly different, with the result that a line drawn
                        // on coordinates slightly below round pixels (0.8, say) will be moved up/left.
                        // Properly fixing this would probably have to happen in the rasterizer. Or when replaying
                        // all the drawing commands, which seems expensive.
                        var lineWidth = context.lineWidth;
                        var isSpecialCaseWidth = lineWidth === 1 || lineWidth === 3;
                        if (isSpecialCaseWidth) {
                            context.translate(0.5, 0.5);
                        }
                        context.flashStroke(path.path, lineScaleMode);
                        if (isSpecialCaseWidth) {
                            context.translate(-0.5, -0.5);
                        }
                        context.strokeStyle = 'transparent';
                    }
                }
                GFX.leaveTimeline("RenderableShape.render");
            };
            RenderableShape.prototype._deserializePaths = function (data, context, ratio) {
                release || assert(data ? !this._paths : this._paths);
                GFX.enterTimeline("RenderableShape.deserializePaths");
                // TODO: Optimize path handling to use only one path if possible.
                // If both line and fill style are set at the same time, we don't need to duplicate the
                // geometry.
                if (this._paths) {
                    return this._paths;
                }
                var paths = this._paths = [];
                var fillPath = null;
                var strokePath = null;
                // We have to alway store the last position because Flash keeps the drawing cursor where it
                // was when changing fill or line style, whereas Canvas forgets it on beginning a new path.
                var x = 0;
                var y = 0;
                var cpX;
                var cpY;
                var formOpen = false;
                var formOpenX = 0;
                var formOpenY = 0;
                var commands = data.commands;
                var coordinates = data.coordinates;
                var styles = data.styles;
                styles.position = 0;
                var coordinatesIndex = 0;
                var commandsCount = data.commandsPosition;
                for (var commandIndex = 0; commandIndex < commandsCount; commandIndex++) {
                    var command = commands[commandIndex];
                    switch (command) {
                        case 9 /* MoveTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                            if (formOpen && fillPath) {
                                fillPath.lineTo(formOpenX, formOpenY);
                                strokePath && strokePath.lineTo(formOpenX, formOpenY);
                            }
                            formOpen = true;
                            x = formOpenX = coordinates[coordinatesIndex++] / 20;
                            y = formOpenY = coordinates[coordinatesIndex++] / 20;
                            fillPath && fillPath.moveTo(x, y);
                            strokePath && strokePath.moveTo(x, y);
                            break;
                        case 10 /* LineTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                            x = coordinates[coordinatesIndex++] / 20;
                            y = coordinates[coordinatesIndex++] / 20;
                            fillPath && fillPath.lineTo(x, y);
                            strokePath && strokePath.lineTo(x, y);
                            break;
                        case 11 /* CurveTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 4);
                            cpX = coordinates[coordinatesIndex++] / 20;
                            cpY = coordinates[coordinatesIndex++] / 20;
                            x = coordinates[coordinatesIndex++] / 20;
                            y = coordinates[coordinatesIndex++] / 20;
                            fillPath && fillPath.quadraticCurveTo(cpX, cpY, x, y);
                            strokePath && strokePath.quadraticCurveTo(cpX, cpY, x, y);
                            break;
                        case 12 /* CubicCurveTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 6);
                            cpX = coordinates[coordinatesIndex++] / 20;
                            cpY = coordinates[coordinatesIndex++] / 20;
                            var cpX2 = coordinates[coordinatesIndex++] / 20;
                            var cpY2 = coordinates[coordinatesIndex++] / 20;
                            x = coordinates[coordinatesIndex++] / 20;
                            y = coordinates[coordinatesIndex++] / 20;
                            fillPath && fillPath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
                            strokePath && strokePath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
                            break;
                        case 1 /* BeginSolidFill */:
                            release || assert(styles.bytesAvailable >= 4);
                            fillPath = this._createPath(0 /* Fill */, Shumway.ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt()), false, null, x, y);
                            break;
                        case 3 /* BeginBitmapFill */:
                            var bitmapStyle = this._readBitmap(styles, context);
                            fillPath = this._createPath(0 /* Fill */, bitmapStyle.style, bitmapStyle.smoothImage, null, x, y);
                            break;
                        case 2 /* BeginGradientFill */:
                            fillPath = this._createPath(0 /* Fill */, this._readGradient(styles, context), false, null, x, y);
                            break;
                        case 4 /* EndFill */:
                            fillPath = null;
                            break;
                        case 5 /* LineStyleSolid */:
                            var color = Shumway.ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt());
                            // Skip pixel hinting.
                            styles.position += 1;
                            var scaleMode = styles.readByte();
                            var capsStyle = RenderableShape.LINE_CAPS_STYLES[styles.readByte()];
                            var jointsStyle = RenderableShape.LINE_JOINTS_STYLES[styles.readByte()];
                            var strokeProperties = new StrokeProperties(coordinates[coordinatesIndex++] / 20, scaleMode, capsStyle, jointsStyle, styles.readByte());
                            strokePath = this._createPath(1 /* Stroke */, color, false, strokeProperties, x, y);
                            break;
                        case 6 /* LineStyleGradient */:
                            strokePath = this._createPath(2 /* StrokeFill */, this._readGradient(styles, context), false, null, x, y);
                            break;
                        case 7 /* LineStyleBitmap */:
                            var bitmapStyle = this._readBitmap(styles, context);
                            strokePath = this._createPath(2 /* StrokeFill */, bitmapStyle.style, bitmapStyle.smoothImage, null, x, y);
                            break;
                        case 8 /* LineEnd */:
                            strokePath = null;
                            break;
                        default:
                            release || assertUnreachable('Invalid command ' + command + ' encountered at index' + commandIndex + ' of ' + commandsCount);
                    }
                }
                release || assert(styles.bytesAvailable === 0);
                release || assert(commandIndex === commandsCount);
                release || assert(coordinatesIndex === data.coordinatesPosition);
                if (formOpen && fillPath) {
                    fillPath.lineTo(formOpenX, formOpenY);
                    strokePath && strokePath.lineTo(formOpenX, formOpenY);
                }
                this._pathData = null;
                GFX.leaveTimeline("RenderableShape.deserializePaths");
                return paths;
            };
            RenderableShape.prototype._createPath = function (type, style, smoothImage, strokeProperties, x, y) {
                var path = new StyledPath(type, style, smoothImage, strokeProperties);
                this._paths.push(path);
                path.path.moveTo(x, y);
                return path.path;
            };
            RenderableShape.prototype._readMatrix = function (data) {
                return new Matrix(data.readFloat(), data.readFloat(), data.readFloat(), data.readFloat(), data.readFloat(), data.readFloat());
            };
            RenderableShape.prototype._readGradient = function (styles, context) {
                // Assert at least one color stop.
                release || assert(styles.bytesAvailable >= 1 + 1 + 6 * 4 + 1 + 1 + 4 + 1 + 1);
                var gradientType = styles.readUnsignedByte();
                var focalPoint = styles.readShort() * 2 / 0xff;
                release || assert(focalPoint >= -1 && focalPoint <= 1);
                var transform = this._readMatrix(styles);
                var gradient = gradientType === 16 /* Linear */ ? context.createLinearGradient(-1, 0, 1, 0) : context.createRadialGradient(focalPoint, 0, 0, 0, 0, 1);
                gradient.setTransform && gradient.setTransform(transform.toSVGMatrix());
                var colorStopsCount = styles.readUnsignedByte();
                for (var i = 0; i < colorStopsCount; i++) {
                    var ratio = styles.readUnsignedByte() / 0xff;
                    var cssColor = Shumway.ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt());
                    gradient.addColorStop(ratio, cssColor);
                }
                // Skip spread and interpolation modes for now.
                styles.position += 2;
                return gradient;
            };
            RenderableShape.prototype._readBitmap = function (styles, context) {
                release || assert(styles.bytesAvailable >= 4 + 6 * 4 + 1 + 1);
                var textureIndex = styles.readUnsignedInt();
                var fillTransform = this._readMatrix(styles);
                var repeat = styles.readBoolean() ? 'repeat' : 'no-repeat';
                var smooth = styles.readBoolean();
                var texture = this._textures[textureIndex];
                var fillStyle;
                if (texture) {
                    fillStyle = context.createPattern(texture.renderSource, repeat);
                    fillStyle.setTransform(fillTransform.toSVGMatrix());
                }
                else {
                    // TODO: Wire up initially-missing textures that become available later.
                    // An invalid SWF can have shape fills refer to images that occur later in the SWF. In that
                    // case, the image only becomes available once that frame is actually reached. Before that
                    // the fill isn't drawn; it is drawn once the image becomes available, though.
                    fillStyle = null;
                }
                return { style: fillStyle, smoothImage: smooth };
            };
            RenderableShape.prototype._renderFallback = function (context) {
                if (!this.fillStyle) {
                    this.fillStyle = Shumway.ColorStyle.randomStyle();
                }
                var bounds = this._bounds;
                context.save();
                context.beginPath();
                context.lineWidth = 2;
                context.fillStyle = this.fillStyle;
                context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                //      context.textBaseline = "top";
                //      context.fillStyle = "white";
                //      context.fillText(String(id), bounds.x, bounds.y);
                context.restore();
            };
            RenderableShape.LINE_CAPS_STYLES = ['round', 'butt', 'square'];
            RenderableShape.LINE_JOINTS_STYLES = ['round', 'bevel', 'miter'];
            return RenderableShape;
        })(Renderable);
        GFX.RenderableShape = RenderableShape;
        var RenderableMorphShape = (function (_super) {
            __extends(RenderableMorphShape, _super);
            function RenderableMorphShape() {
                _super.apply(this, arguments);
                this._flags = 1048576 /* Dynamic */ | 16 /* Dirty */ | 2097152 /* Scalable */ | 4194304 /* Tileable */;
                this._morphPaths = Object.create(null);
            }
            RenderableMorphShape.prototype._deserializePaths = function (data, context, ratio) {
                GFX.enterTimeline("RenderableMorphShape.deserializePaths");
                // TODO: Optimize path handling to use only one path if possible.
                // If both line and fill style are set at the same time, we don't need to duplicate the
                // geometry.
                if (this._morphPaths[ratio]) {
                    return this._morphPaths[ratio];
                }
                var paths = this._morphPaths[ratio] = [];
                var fillPath = null;
                var strokePath = null;
                // We have to alway store the last position because Flash keeps the drawing cursor where it
                // was when changing fill or line style, whereas Canvas forgets it on beginning a new path.
                var x = 0;
                var y = 0;
                var cpX;
                var cpY;
                var formOpen = false;
                var formOpenX = 0;
                var formOpenY = 0;
                var commands = data.commands;
                var coordinates = data.coordinates;
                var morphCoordinates = data.morphCoordinates;
                var styles = data.styles;
                var morphStyles = data.morphStyles;
                styles.position = 0;
                morphStyles.position = 0;
                var coordinatesIndex = 0;
                var commandsCount = data.commandsPosition;
                for (var commandIndex = 0; commandIndex < commandsCount; commandIndex++) {
                    var command = commands[commandIndex];
                    switch (command) {
                        case 9 /* MoveTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                            if (formOpen && fillPath) {
                                fillPath.lineTo(formOpenX, formOpenY);
                                strokePath && strokePath.lineTo(formOpenX, formOpenY);
                            }
                            formOpen = true;
                            x = formOpenX = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            y = formOpenY = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            fillPath && fillPath.moveTo(x, y);
                            strokePath && strokePath.moveTo(x, y);
                            break;
                        case 10 /* LineTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                            x = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            y = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            fillPath && fillPath.lineTo(x, y);
                            strokePath && strokePath.lineTo(x, y);
                            break;
                        case 11 /* CurveTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 4);
                            cpX = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            cpY = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            x = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            y = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            fillPath && fillPath.quadraticCurveTo(cpX, cpY, x, y);
                            strokePath && strokePath.quadraticCurveTo(cpX, cpY, x, y);
                            break;
                        case 12 /* CubicCurveTo */:
                            release || assert(coordinatesIndex <= data.coordinatesPosition - 6);
                            cpX = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            cpY = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            var cpX2 = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            var cpY2 = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            x = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            y = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            fillPath && fillPath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
                            strokePath && strokePath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
                            break;
                        case 1 /* BeginSolidFill */:
                            release || assert(styles.bytesAvailable >= 4);
                            fillPath = this._createMorphPath(0 /* Fill */, ratio, Shumway.ColorUtilities.rgbaToCSSStyle(morphColor(styles.readUnsignedInt(), morphStyles.readUnsignedInt(), ratio)), false, null, x, y);
                            break;
                        case 3 /* BeginBitmapFill */:
                            var bitmapStyle = this._readMorphBitmap(styles, morphStyles, ratio, context);
                            fillPath = this._createMorphPath(0 /* Fill */, ratio, bitmapStyle.style, bitmapStyle.smoothImage, null, x, y);
                            break;
                        case 2 /* BeginGradientFill */:
                            var gradientStyle = this._readMorphGradient(styles, morphStyles, ratio, context);
                            fillPath = this._createMorphPath(0 /* Fill */, ratio, gradientStyle, false, null, x, y);
                            break;
                        case 4 /* EndFill */:
                            fillPath = null;
                            break;
                        case 5 /* LineStyleSolid */:
                            var width = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                            var color = Shumway.ColorUtilities.rgbaToCSSStyle(morphColor(styles.readUnsignedInt(), morphStyles.readUnsignedInt(), ratio));
                            // Skip pixel hinting.
                            styles.position += 1;
                            var scaleMode = styles.readByte();
                            var capsStyle = RenderableShape.LINE_CAPS_STYLES[styles.readByte()];
                            var jointsStyle = RenderableShape.LINE_JOINTS_STYLES[styles.readByte()];
                            var strokeProperties = new StrokeProperties(width, scaleMode, capsStyle, jointsStyle, styles.readByte());
                            strokePath = this._createMorphPath(1 /* Stroke */, ratio, color, false, strokeProperties, x, y);
                            break;
                        case 6 /* LineStyleGradient */:
                            var gradientStyle = this._readMorphGradient(styles, morphStyles, ratio, context);
                            strokePath = this._createMorphPath(2 /* StrokeFill */, ratio, gradientStyle, false, null, x, y);
                            break;
                        case 7 /* LineStyleBitmap */:
                            var bitmapStyle = this._readMorphBitmap(styles, morphStyles, ratio, context);
                            strokePath = this._createMorphPath(2 /* StrokeFill */, ratio, bitmapStyle.style, bitmapStyle.smoothImage, null, x, y);
                            break;
                        case 8 /* LineEnd */:
                            strokePath = null;
                            break;
                        default:
                            release || assertUnreachable('Invalid command ' + command + ' encountered at index' + commandIndex + ' of ' + commandsCount);
                    }
                }
                release || assert(styles.bytesAvailable === 0);
                release || assert(commandIndex === commandsCount);
                release || assert(coordinatesIndex === data.coordinatesPosition);
                if (formOpen && fillPath) {
                    fillPath.lineTo(formOpenX, formOpenY);
                    strokePath && strokePath.lineTo(formOpenX, formOpenY);
                }
                GFX.leaveTimeline("RenderableMorphShape.deserializPaths");
                return paths;
            };
            RenderableMorphShape.prototype._createMorphPath = function (type, ratio, style, smoothImage, strokeProperties, x, y) {
                var path = new StyledPath(type, style, smoothImage, strokeProperties);
                this._morphPaths[ratio].push(path);
                path.path.moveTo(x, y);
                return path.path;
            };
            RenderableMorphShape.prototype._readMorphMatrix = function (data, morphData, ratio) {
                return new Matrix(morph(data.readFloat(), morphData.readFloat(), ratio), morph(data.readFloat(), morphData.readFloat(), ratio), morph(data.readFloat(), morphData.readFloat(), ratio), morph(data.readFloat(), morphData.readFloat(), ratio), morph(data.readFloat(), morphData.readFloat(), ratio), morph(data.readFloat(), morphData.readFloat(), ratio));
            };
            RenderableMorphShape.prototype._readMorphGradient = function (styles, morphStyles, ratio, context) {
                // Assert at least one color stop.
                release || assert(styles.bytesAvailable >= 1 + 1 + 6 * 4 + 1 + 1 + 4 + 1 + 1);
                var gradientType = styles.readUnsignedByte();
                var focalPoint = styles.readShort() * 2 / 0xff;
                release || assert(focalPoint >= -1 && focalPoint <= 1);
                var transform = this._readMorphMatrix(styles, morphStyles, ratio);
                var gradient = gradientType === 16 /* Linear */ ? context.createLinearGradient(-1, 0, 1, 0) : context.createRadialGradient(focalPoint, 0, 0, 0, 0, 1);
                gradient.setTransform && gradient.setTransform(transform.toSVGMatrix());
                var colorStopsCount = styles.readUnsignedByte();
                for (var i = 0; i < colorStopsCount; i++) {
                    var stop = morph(styles.readUnsignedByte() / 0xff, morphStyles.readUnsignedByte() / 0xff, ratio);
                    var color = morphColor(styles.readUnsignedInt(), morphStyles.readUnsignedInt(), ratio);
                    var cssColor = Shumway.ColorUtilities.rgbaToCSSStyle(color);
                    gradient.addColorStop(stop, cssColor);
                }
                // Skip spread and interpolation modes for now.
                styles.position += 2;
                return gradient;
            };
            RenderableMorphShape.prototype._readMorphBitmap = function (styles, morphStyles, ratio, context) {
                release || assert(styles.bytesAvailable >= 4 + 6 * 4 + 1 + 1);
                var textureIndex = styles.readUnsignedInt();
                var fillTransform = this._readMorphMatrix(styles, morphStyles, ratio);
                var repeat = styles.readBoolean() ? 'repeat' : 'no-repeat';
                var smooth = styles.readBoolean();
                var texture = this._textures[textureIndex];
                release || assert(texture._canvas);
                var fillStyle = context.createPattern(texture._canvas, repeat);
                fillStyle.setTransform(fillTransform.toSVGMatrix());
                return { style: fillStyle, smoothImage: smooth };
            };
            return RenderableMorphShape;
        })(RenderableShape);
        GFX.RenderableMorphShape = RenderableMorphShape;
        var TextLine = (function () {
            function TextLine() {
                this.x = 0;
                this.y = 0;
                this.width = 0;
                this.ascent = 0;
                this.descent = 0;
                this.leading = 0;
                this.align = 0;
                this.runs = [];
            }
            TextLine._getMeasureContext = function () {
                if (!TextLine._measureContext) {
                    TextLine._measureContext = document.createElement('canvas').getContext('2d');
                }
                return TextLine._measureContext;
            };
            TextLine.prototype.addRun = function (font, fillStyle, text, underline) {
                if (text) {
                    var measureContext = TextLine._getMeasureContext();
                    measureContext.font = font;
                    var width = measureContext.measureText(text).width | 0;
                    this.runs.push(new TextRun(font, fillStyle, text, width, underline));
                    this.width += width;
                }
            };
            TextLine.prototype.wrap = function (maxWidth) {
                var lines = [this];
                var runs = this.runs;
                var currentLine = this;
                currentLine.width = 0;
                currentLine.runs = [];
                var measureContext = TextLine._getMeasureContext();
                for (var i = 0; i < runs.length; i++) {
                    var run = runs[i];
                    var text = run.text;
                    run.text = '';
                    run.width = 0;
                    measureContext.font = run.font;
                    var spaceLeft = maxWidth;
                    var words = text.split(/[\s.-]/);
                    var offset = 0;
                    for (var j = 0; j < words.length; j++) {
                        var word = words[j];
                        var chunk = text.substr(offset, word.length + 1);
                        var wordWidth = measureContext.measureText(chunk).width | 0;
                        if (wordWidth > spaceLeft) {
                            do {
                                if (run.text) {
                                    currentLine.runs.push(run);
                                    currentLine.width += run.width;
                                    run = new TextRun(run.font, run.fillStyle, '', 0, run.underline);
                                    var newLine = new TextLine();
                                    newLine.y = (currentLine.y + currentLine.descent + currentLine.leading + currentLine.ascent) | 0;
                                    newLine.ascent = currentLine.ascent;
                                    newLine.descent = currentLine.descent;
                                    newLine.leading = currentLine.leading;
                                    newLine.align = currentLine.align;
                                    lines.push(newLine);
                                    currentLine = newLine;
                                }
                                spaceLeft = maxWidth - wordWidth;
                                if (spaceLeft < 0) {
                                    var k = chunk.length;
                                    var t = chunk;
                                    var w = wordWidth;
                                    while (k > 1) {
                                        k--;
                                        t = chunk.substr(0, k);
                                        w = measureContext.measureText(t).width | 0;
                                        if (w <= maxWidth) {
                                            break;
                                        }
                                    }
                                    run.text = t;
                                    run.width = w;
                                    chunk = chunk.substr(k);
                                    wordWidth = measureContext.measureText(chunk).width | 0;
                                }
                            } while (chunk && spaceLeft < 0);
                        }
                        else {
                            spaceLeft = spaceLeft - wordWidth;
                        }
                        run.text += chunk;
                        run.width += wordWidth;
                        offset += word.length + 1;
                    }
                    currentLine.runs.push(run);
                    currentLine.width += run.width;
                }
                return lines;
            };
            TextLine.prototype.toString = function () {
                return 'TextLine {x: ' + this.x + ', y: ' + this.y + ', width: ' + this.width + ', height: ' + (this.ascent + this.descent + this.leading) + '}';
            };
            return TextLine;
        })();
        GFX.TextLine = TextLine;
        var TextRun = (function () {
            function TextRun(font, fillStyle, text, width, underline) {
                if (font === void 0) { font = ''; }
                if (fillStyle === void 0) { fillStyle = ''; }
                if (text === void 0) { text = ''; }
                if (width === void 0) { width = 0; }
                if (underline === void 0) { underline = false; }
                this.font = font;
                this.fillStyle = fillStyle;
                this.text = text;
                this.width = width;
                this.underline = underline;
            }
            return TextRun;
        })();
        GFX.TextRun = TextRun;
        var RenderableText = (function (_super) {
            __extends(RenderableText, _super);
            function RenderableText(bounds) {
                _super.call(this);
                this._flags = 1048576 /* Dynamic */ | 16 /* Dirty */;
                this.properties = {};
                this._textBounds = bounds.clone();
                this._textRunData = null;
                this._plainText = '';
                this._backgroundColor = 0;
                this._borderColor = 0;
                this._matrix = Matrix.createIdentity();
                this._coords = null;
                this._scrollV = 1;
                this._scrollH = 0;
                this.textRect = bounds.clone();
                this.lines = [];
                this.setBounds(bounds);
            }
            RenderableText.prototype.setBounds = function (bounds) {
                _super.prototype.setBounds.call(this, bounds);
                this._textBounds.set(bounds);
                this.textRect.setElements(bounds.x + 2, bounds.y + 2, bounds.w - 2, bounds.h - 2);
            };
            RenderableText.prototype.setContent = function (plainText, textRunData, matrix, coords) {
                this._textRunData = textRunData;
                this._plainText = plainText;
                this._matrix.set(matrix);
                this._coords = coords;
                this.lines = [];
            };
            RenderableText.prototype.setStyle = function (backgroundColor, borderColor, scrollV, scrollH) {
                this._backgroundColor = backgroundColor;
                this._borderColor = borderColor;
                this._scrollV = scrollV;
                this._scrollH = scrollH;
            };
            RenderableText.prototype.reflow = function (autoSize, wordWrap) {
                var textRunData = this._textRunData;
                if (!textRunData) {
                    return;
                }
                var bounds = this._bounds;
                var availableWidth = bounds.w - 4;
                var plainText = this._plainText;
                var lines = this.lines;
                var currentLine = new TextLine();
                var baseLinePos = 0;
                var maxWidth = 0;
                var maxAscent = 0;
                var maxDescent = 0;
                var maxLeading = 0;
                var firstAlign = -1;
                var finishLine = function () {
                    if (!currentLine.runs.length) {
                        baseLinePos += maxAscent + maxDescent + maxLeading;
                        return;
                    }
                    if (lines.length) {
                        baseLinePos += maxLeading;
                    }
                    baseLinePos += maxAscent;
                    currentLine.y = baseLinePos | 0;
                    baseLinePos += maxDescent;
                    currentLine.ascent = maxAscent;
                    currentLine.descent = maxDescent;
                    currentLine.leading = maxLeading;
                    currentLine.align = firstAlign;
                    if (wordWrap && currentLine.width > availableWidth) {
                        var wrappedLines = currentLine.wrap(availableWidth);
                        for (var i = 0; i < wrappedLines.length; i++) {
                            var line = wrappedLines[i];
                            baseLinePos = line.y + line.descent + line.leading;
                            lines.push(line);
                            if (line.width > maxWidth) {
                                maxWidth = line.width;
                            }
                        }
                    }
                    else {
                        lines.push(currentLine);
                        if (currentLine.width > maxWidth) {
                            maxWidth = currentLine.width;
                        }
                    }
                    currentLine = new TextLine();
                };
                GFX.enterTimeline("RenderableText.reflow");
                while (textRunData.position < textRunData.length) {
                    var beginIndex = textRunData.readInt();
                    var endIndex = textRunData.readInt();
                    var size = textRunData.readInt();
                    var fontName = textRunData.readUTF();
                    var ascent = textRunData.readInt();
                    var descent = textRunData.readInt();
                    var leading = textRunData.readInt();
                    if (ascent > maxAscent) {
                        maxAscent = ascent;
                    }
                    if (descent > maxDescent) {
                        maxDescent = descent;
                    }
                    if (leading > maxLeading) {
                        maxLeading = leading;
                    }
                    var bold = textRunData.readBoolean();
                    var italic = textRunData.readBoolean();
                    var boldItalic = '';
                    if (italic) {
                        boldItalic += 'italic ';
                    }
                    if (bold) {
                        boldItalic += 'bold ';
                    }
                    var font = boldItalic + size + 'px ' + fontName;
                    var color = textRunData.readInt();
                    var fillStyle = Shumway.ColorUtilities.rgbToHex(color);
                    var align = textRunData.readInt();
                    if (firstAlign === -1) {
                        firstAlign = align;
                    }
                    var bullet = textRunData.readBoolean();
                    //var display = textRunData.readInt();
                    var indent = textRunData.readInt();
                    //var blockIndent = textRunData.readInt();
                    var kerning = textRunData.readInt();
                    var leftMargin = textRunData.readInt();
                    var letterSpacing = textRunData.readInt();
                    var rightMargin = textRunData.readInt();
                    //var tabStops = textRunData.readInt();
                    var underline = textRunData.readBoolean();
                    var text = '';
                    var eof = false;
                    for (var i = beginIndex; !eof; i++) {
                        var eof = i >= endIndex - 1;
                        var char = plainText[i];
                        if (char !== '\r' && char !== '\n') {
                            text += char;
                            if (i < plainText.length - 1) {
                                continue;
                            }
                        }
                        currentLine.addRun(font, fillStyle, text, underline);
                        finishLine();
                        text = '';
                        if (eof) {
                            maxAscent = 0;
                            maxDescent = 0;
                            maxLeading = 0;
                            firstAlign = -1;
                            break;
                        }
                        if (char === '\r' && plainText[i + 1] === '\n') {
                            i++;
                        }
                    }
                    currentLine.addRun(font, fillStyle, text, underline);
                }
                // Append an additional empty line if we find a line break character at the end of the text.
                var endCharacter = plainText[plainText.length - 1];
                if (endCharacter === '\r' || endCharacter === '\n') {
                    lines.push(currentLine);
                }
                var rect = this.textRect;
                rect.w = maxWidth;
                rect.h = baseLinePos;
                if (autoSize) {
                    if (!wordWrap) {
                        availableWidth = maxWidth;
                        var width = bounds.w;
                        switch (autoSize) {
                            case 1:
                                rect.x = (width - (availableWidth + 4)) >> 1;
                                break;
                            case 2:
                                break;
                            case 3:
                                rect.x = width - (availableWidth + 4);
                                break;
                        }
                        this._textBounds.setElements(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4);
                        bounds.w = availableWidth + 4;
                    }
                    bounds.x = rect.x - 2;
                    bounds.h = baseLinePos + 4;
                }
                else {
                    this._textBounds = bounds;
                }
                var numLines = lines.length;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.width < availableWidth) {
                        switch (line.align) {
                            case 0:
                                break;
                            case 1:
                                line.x = (availableWidth - line.width) | 0;
                                break;
                            case 2:
                                line.x = ((availableWidth - line.width) / 2) | 0;
                                break;
                        }
                    }
                }
                this.invalidate();
                GFX.leaveTimeline("RenderableText.reflow");
            };
            RenderableText.roundBoundPoints = function (points) {
                release || assert(points === RenderableText.absoluteBoundPoints);
                for (var i = 0; i < points.length; i++) {
                    var point = points[i];
                    point.x = Math.floor(point.x + .1) + .5;
                    point.y = Math.floor(point.y + .1) + .5;
                }
            };
            RenderableText.prototype.render = function (context) {
                GFX.enterTimeline("RenderableText.render");
                context.save();
                var rect = this._textBounds;
                if (this._backgroundColor) {
                    context.fillStyle = Shumway.ColorUtilities.rgbaToCSSStyle(this._backgroundColor);
                    context.fillRect(rect.x, rect.y, rect.w, rect.h);
                }
                if (this._borderColor) {
                    context.strokeStyle = Shumway.ColorUtilities.rgbaToCSSStyle(this._borderColor);
                    context.lineCap = 'square';
                    context.lineWidth = 1;
                    // TextField bounds are always drawn as 1px lines on (global-space) pixel boundaries.
                    // Their rounding is a bit weird, though: fractions below .9 are rounded down.
                    // We can only fully implement this in browsers that support `currentTransform`.
                    var boundPoints = RenderableText.absoluteBoundPoints;
                    var m = context['currentTransform'];
                    if (m) {
                        rect = rect.clone();
                        var matrix = new Matrix(m.a, m.b, m.c, m.d, m.e, m.f);
                        matrix.transformRectangle(rect, boundPoints);
                        context.setTransform(1, 0, 0, 1, 0, 0);
                    }
                    else {
                        boundPoints[0].x = rect.x;
                        boundPoints[0].y = rect.y;
                        boundPoints[1].x = rect.x + rect.w;
                        boundPoints[1].y = rect.y;
                        boundPoints[2].x = rect.x + rect.w;
                        boundPoints[2].y = rect.y + rect.h;
                        boundPoints[3].x = rect.x;
                        boundPoints[3].y = rect.y + rect.h;
                    }
                    RenderableText.roundBoundPoints(boundPoints);
                    var path = new Path2D();
                    path.moveTo(boundPoints[0].x, boundPoints[0].y);
                    path.lineTo(boundPoints[1].x, boundPoints[1].y);
                    path.lineTo(boundPoints[2].x, boundPoints[2].y);
                    path.lineTo(boundPoints[3].x, boundPoints[3].y);
                    path.lineTo(boundPoints[0].x, boundPoints[0].y);
                    context.stroke(path);
                    if (m) {
                        context.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
                    }
                }
                if (this._coords) {
                    this._renderChars(context);
                }
                else {
                    this._renderLines(context);
                }
                context.restore();
                GFX.leaveTimeline("RenderableText.render");
            };
            RenderableText.prototype._renderChars = function (context) {
                if (this._matrix) {
                    var m = this._matrix;
                    context.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
                }
                var lines = this.lines;
                var coords = this._coords;
                coords.position = 0;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var runs = line.runs;
                    for (var j = 0; j < runs.length; j++) {
                        var run = runs[j];
                        context.font = run.font;
                        context.fillStyle = run.fillStyle;
                        var text = run.text;
                        for (var k = 0; k < text.length; k++) {
                            var x = coords.readInt() / 20;
                            var y = coords.readInt() / 20;
                            context.fillText(text[k], x, y);
                        }
                    }
                }
            };
            RenderableText.prototype._renderLines = function (context) {
                // TODO: Render bullet points.
                var bounds = this._textBounds;
                context.beginPath();
                context.rect(bounds.x + 2, bounds.y + 2, bounds.w - 4, bounds.h - 4);
                context.clip();
                context.translate((bounds.x - this._scrollH) + 2, bounds.y + 2);
                var lines = this.lines;
                var scrollV = this._scrollV;
                var scrollY = 0;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var x = line.x;
                    var y = line.y;
                    // Skip lines until we are within the scroll view.
                    if (i + 1 < scrollV) {
                        scrollY = y + line.descent + line.leading;
                        continue;
                    }
                    y -= scrollY;
                    // Flash skips rendering lines that are not fully visible in height (except of the very
                    // first line within the scroll view).
                    if ((i + 1) - scrollV && y > bounds.h) {
                        break;
                    }
                    var runs = line.runs;
                    for (var j = 0; j < runs.length; j++) {
                        var run = runs[j];
                        context.font = run.font;
                        context.fillStyle = run.fillStyle;
                        if (run.underline) {
                            context.fillRect(x, (y + (line.descent / 2)) | 0, run.width, 1);
                        }
                        context.textAlign = "left";
                        context.textBaseline = "alphabetic";
                        context.fillText(run.text, x, y);
                        x += run.width;
                    }
                }
            };
            RenderableText.absoluteBoundPoints = [new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0)];
            return RenderableText;
        })(Renderable);
        GFX.RenderableText = RenderableText;
        var Label = (function (_super) {
            __extends(Label, _super);
            function Label(w, h) {
                _super.call(this);
                this._flags = 1048576 /* Dynamic */ | 2097152 /* Scalable */;
                this.properties = {};
                this.setBounds(new Rectangle(0, 0, w, h));
            }
            Object.defineProperty(Label.prototype, "text", {
                get: function () {
                    return this._text;
                },
                set: function (value) {
                    this._text = value;
                },
                enumerable: true,
                configurable: true
            });
            Label.prototype.render = function (context, ratio, cullBounds) {
                context.save();
                context.textBaseline = "top";
                context.fillStyle = "white";
                context.fillText(this.text, 0, 0);
                context.restore();
            };
            return Label;
        })(Renderable);
        GFX.Label = Label;
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var clampByte = Shumway.ColorUtilities.clampByte;
        var assert = Shumway.Debug.assert;
        var Filter = (function () {
            function Filter() {
            }
            return Filter;
        })();
        GFX.Filter = Filter;
        var BlurFilter = (function (_super) {
            __extends(BlurFilter, _super);
            function BlurFilter(blurX, blurY, quality) {
                _super.call(this);
                this.blurX = blurX;
                this.blurY = blurY;
                this.quality = quality;
            }
            return BlurFilter;
        })(Filter);
        GFX.BlurFilter = BlurFilter;
        var DropshadowFilter = (function (_super) {
            __extends(DropshadowFilter, _super);
            function DropshadowFilter(alpha, angle, blurX, blurY, color, distance, hideObject, inner, knockout, quality, strength) {
                _super.call(this);
                this.alpha = alpha;
                this.angle = angle;
                this.blurX = blurX;
                this.blurY = blurY;
                this.color = color;
                this.distance = distance;
                this.hideObject = hideObject;
                this.inner = inner;
                this.knockout = knockout;
                this.quality = quality;
                this.strength = strength;
            }
            return DropshadowFilter;
        })(Filter);
        GFX.DropshadowFilter = DropshadowFilter;
        var GlowFilter = (function (_super) {
            __extends(GlowFilter, _super);
            function GlowFilter(alpha, blurX, blurY, color, inner, knockout, quality, strength) {
                _super.call(this);
                this.alpha = alpha;
                this.blurX = blurX;
                this.blurY = blurY;
                this.color = color;
                this.inner = inner;
                this.knockout = knockout;
                this.quality = quality;
                this.strength = strength;
            }
            return GlowFilter;
        })(Filter);
        GFX.GlowFilter = GlowFilter;
        (function (ColorMatrixType) {
            ColorMatrixType[ColorMatrixType["Unknown"] = 0x0000] = "Unknown";
            ColorMatrixType[ColorMatrixType["Identity"] = 0x0001] = "Identity";
        })(GFX.ColorMatrixType || (GFX.ColorMatrixType = {}));
        var ColorMatrixType = GFX.ColorMatrixType;
        var ColorMatrix = (function () {
            function ColorMatrix(data) {
                release || assert(data.length === 20);
                this._data = new Float32Array(data);
                this._type = 0 /* Unknown */;
            }
            ColorMatrix.prototype.clone = function () {
                var colorMatrix = new ColorMatrix(this._data);
                colorMatrix._type = this._type;
                return colorMatrix;
            };
            ColorMatrix.prototype.set = function (other) {
                this._data.set(other._data);
                this._type = other._type;
            };
            ColorMatrix.prototype.toWebGLMatrix = function () {
                return new Float32Array(this._data);
            };
            ColorMatrix.prototype.asWebGLMatrix = function () {
                return this._data.subarray(0, 16);
            };
            ColorMatrix.prototype.asWebGLVector = function () {
                return this._data.subarray(16, 20);
            };
            ColorMatrix.prototype.isIdentity = function () {
                if (this._type & 1 /* Identity */) {
                    return true;
                }
                var m = this._data;
                return m[0] == 1 && m[1] == 0 && m[2] == 0 && m[3] == 0 && m[4] == 0 && m[5] == 1 && m[6] == 0 && m[7] == 0 && m[8] == 0 && m[9] == 0 && m[10] == 1 && m[11] == 0 && m[12] == 0 && m[13] == 0 && m[14] == 0 && m[15] == 1 && m[16] == 0 && m[17] == 0 && m[18] == 0 && m[19] == 0;
            };
            ColorMatrix.createIdentity = function () {
                var colorMatrix = new ColorMatrix([
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0
                ]);
                colorMatrix._type = 1 /* Identity */;
                return colorMatrix;
            };
            ColorMatrix.prototype.setMultipliersAndOffsets = function (redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
                var m = this._data;
                for (var i = 0; i < m.length; i++) {
                    m[i] = 0;
                }
                m[0] = redMultiplier;
                m[5] = greenMultiplier;
                m[10] = blueMultiplier;
                m[15] = alphaMultiplier;
                m[16] = redOffset / 255;
                m[17] = greenOffset / 255;
                m[18] = blueOffset / 255;
                m[19] = alphaOffset / 255;
                this._type = 0 /* Unknown */;
            };
            ColorMatrix.prototype.transformRGBA = function (rgba) {
                var r = (rgba >> 24) & 0xff;
                var g = (rgba >> 16) & 0xff;
                var b = (rgba >> 8) & 0xff;
                var a = rgba & 0xff;
                var m = this._data;
                var R = clampByte(r * m[0] + g * m[1] + b * m[2] + a * m[3] + m[16] * 255);
                var G = clampByte(r * m[4] + g * m[5] + b * m[6] + a * m[7] + m[17] * 255);
                var B = clampByte(r * m[8] + g * m[9] + b * m[10] + a * m[11] + m[18] * 255);
                var A = clampByte(r * m[12] + g * m[13] + b * m[14] + a * m[15] + m[19] * 255);
                return R << 24 | G << 16 | B << 8 | A;
            };
            ColorMatrix.prototype.multiply = function (other) {
                if (other._type & 1 /* Identity */) {
                    return;
                }
                var a = this._data, b = other._data;
                var a00 = a[0 * 4 + 0];
                var a01 = a[0 * 4 + 1];
                var a02 = a[0 * 4 + 2];
                var a03 = a[0 * 4 + 3];
                var a10 = a[1 * 4 + 0];
                var a11 = a[1 * 4 + 1];
                var a12 = a[1 * 4 + 2];
                var a13 = a[1 * 4 + 3];
                var a20 = a[2 * 4 + 0];
                var a21 = a[2 * 4 + 1];
                var a22 = a[2 * 4 + 2];
                var a23 = a[2 * 4 + 3];
                var a30 = a[3 * 4 + 0];
                var a31 = a[3 * 4 + 1];
                var a32 = a[3 * 4 + 2];
                var a33 = a[3 * 4 + 3];
                var a40 = a[4 * 4 + 0];
                var a41 = a[4 * 4 + 1];
                var a42 = a[4 * 4 + 2];
                var a43 = a[4 * 4 + 3];
                var b00 = b[0 * 4 + 0];
                var b01 = b[0 * 4 + 1];
                var b02 = b[0 * 4 + 2];
                var b03 = b[0 * 4 + 3];
                var b10 = b[1 * 4 + 0];
                var b11 = b[1 * 4 + 1];
                var b12 = b[1 * 4 + 2];
                var b13 = b[1 * 4 + 3];
                var b20 = b[2 * 4 + 0];
                var b21 = b[2 * 4 + 1];
                var b22 = b[2 * 4 + 2];
                var b23 = b[2 * 4 + 3];
                var b30 = b[3 * 4 + 0];
                var b31 = b[3 * 4 + 1];
                var b32 = b[3 * 4 + 2];
                var b33 = b[3 * 4 + 3];
                var b40 = b[4 * 4 + 0];
                var b41 = b[4 * 4 + 1];
                var b42 = b[4 * 4 + 2];
                var b43 = b[4 * 4 + 3];
                a[0 * 4 + 0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
                a[0 * 4 + 1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
                a[0 * 4 + 2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
                a[0 * 4 + 3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
                a[1 * 4 + 0] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
                a[1 * 4 + 1] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
                a[1 * 4 + 2] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
                a[1 * 4 + 3] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
                a[2 * 4 + 0] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
                a[2 * 4 + 1] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
                a[2 * 4 + 2] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
                a[2 * 4 + 3] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
                a[3 * 4 + 0] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
                a[3 * 4 + 1] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
                a[3 * 4 + 2] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
                a[3 * 4 + 3] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
                a[4 * 4 + 0] = a00 * b40 + a10 * b41 + a20 * b42 + a30 * b43 + a40;
                a[4 * 4 + 1] = a01 * b40 + a11 * b41 + a21 * b42 + a31 * b43 + a41;
                a[4 * 4 + 2] = a02 * b40 + a12 * b41 + a22 * b42 + a32 * b43 + a42;
                a[4 * 4 + 3] = a03 * b40 + a13 * b41 + a23 * b42 + a33 * b43 + a43;
                this._type = 0 /* Unknown */;
            };
            Object.defineProperty(ColorMatrix.prototype, "alphaMultiplier", {
                get: function () {
                    return this._data[15];
                },
                enumerable: true,
                configurable: true
            });
            ColorMatrix.prototype.hasOnlyAlphaMultiplier = function () {
                var m = this._data;
                return m[0] == 1 && m[1] == 0 && m[2] == 0 && m[3] == 0 && m[4] == 0 && m[5] == 1 && m[6] == 0 && m[7] == 0 && m[8] == 0 && m[9] == 0 && m[10] == 1 && m[11] == 0 && m[12] == 0 && m[13] == 0 && m[14] == 0 && m[16] == 0 && m[17] == 0 && m[18] == 0 && m[19] == 0;
            };
            ColorMatrix.prototype.equals = function (other) {
                if (!other) {
                    return false;
                }
                else if (this._type === other._type && this._type === 1 /* Identity */) {
                    return true;
                }
                var a = this._data;
                var b = other._data;
                for (var i = 0; i < 20; i++) {
                    if (Math.abs(a[i] - b[i]) > 0.001) {
                        return false;
                    }
                }
                return true;
            };
            ColorMatrix.prototype.toSVGFilterMatrix = function () {
                var m = this._data;
                return [m[0], m[4], m[8], m[12], m[16], m[1], m[5], m[9], m[13], m[17], m[2], m[6], m[10], m[14], m[18], m[3], m[7], m[11], m[15], m[19]].join(" ");
            };
            return ColorMatrix;
        })();
        GFX.ColorMatrix = ColorMatrix;
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path='../../build/ts/base.d.ts' />
/// <reference path='../../build/ts/tools.d.ts' />
/// <reference path='module.ts' />
/// <reference path='utilities.ts' />
/// <reference path='options.ts'/>
/// <reference path='geometry.ts'/>
/// <reference path='regionAllocator.ts'/>
/// <reference path='nodes.ts'/>
/// <reference path='renderables/renderables.ts'/>
/// <reference path='filters.ts'/>
//# sourceMappingURL=gfx-base.js.map