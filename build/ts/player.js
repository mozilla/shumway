/*
 * Copyright 2013 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var Player;
    (function (Player) {
        Player.timelineBuffer = Shumway.Tools ? new Shumway.Tools.Profiler.TimelineBuffer("Player") : null;
        Player.counter = new Shumway.Metrics.Counter(!release);
        Player.writer = null; // new IndentingWriter();
        function enterTimeline(name, data) {
            Player.writer && Player.writer.enter(name);
            profile && Player.timelineBuffer && Player.timelineBuffer.enter(name, data);
        }
        Player.enterTimeline = enterTimeline;
        function leaveTimeline(name, data) {
            Player.writer && Player.writer.leave(name);
            profile && Player.timelineBuffer && Player.timelineBuffer.leave(name, data);
        }
        Player.leaveTimeline = leaveTimeline;
    })(Player = Shumway.Player || (Shumway.Player = {}));
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
var Shumway;
(function (Shumway) {
    var OptionSet = Shumway.Options.OptionSet;
    var shumwayOptions = Shumway.Settings.shumwayOptions;
    Shumway.playerOptions = shumwayOptions.register(new OptionSet("Player Options"));
    Shumway.frameEnabledOption = Shumway.playerOptions.register(new Shumway.Options.Option("enableFrames", "Enable Frame Execution", "boolean", true, "Enable frame execution."));
    Shumway.timerEnabledOption = Shumway.playerOptions.register(new Shumway.Options.Option("enableTimers", "Enable Timers", "boolean", true, "Enable timer events."));
    Shumway.pumpEnabledOption = Shumway.playerOptions.register(new Shumway.Options.Option("enablePump", "Enable Pump", "boolean", true, "Enable display tree serialization."));
    Shumway.pumpRateOption = Shumway.playerOptions.register(new Shumway.Options.Option("pumpRate", "Pump Rate", "number", 60, "Number of times / second that the display list is synchronized.", { range: { min: 1, max: 120, step: 1 } }));
    Shumway.frameRateOption = Shumway.playerOptions.register(new Shumway.Options.Option("frameRate", "Frame Rate", "number", -1, "Override a movie's frame rate, set to -1 to use the movies default frame rate.", { range: { min: -1, max: 120, step: 1 } }));
    Shumway.tracePlayerOption = Shumway.playerOptions.register(new Shumway.Options.Option("tp", "Trace Player", "number", 0, "Trace player every n frames.", { range: { min: 0, max: 512, step: 1 } }));
    Shumway.traceMouseEventOption = Shumway.playerOptions.register(new Shumway.Options.Option("tme", "Trace Mouse Events", "boolean", false, "Trace mouse events."));
    Shumway.frameRateMultiplierOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Frame Rate Multiplier", "number", 1, "Play frames at a faster rate.", { range: { min: 1, max: 16, step: 1 } }));
    Shumway.dontSkipFramesOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Disables Frame Skipping", "boolean", false, "Play all frames, e.g. no skipping frame during throttle."));
    Shumway.playAllSymbolsOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Play Symbols", "boolean", false, "Plays all SWF symbols automatically."));
    Shumway.playSymbolOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Play Symbol Number", "number", 0, "Select symbol by Id.", { range: { min: 0, max: 20000, step: 1 } }));
    Shumway.playSymbolFrameDurationOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Play Symbol Duration", "number", 0, "How many frames to play, 0 for all frames of the movie clip.", { range: { min: 0, max: 128, step: 1 } }));
    Shumway.playSymbolCountOption = Shumway.playerOptions.register(new Shumway.Options.Option("", "Play Symbol Count", "number", -1, "Select symbol count.", { range: { min: -1, max: 20000, step: 1 } }));
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
    var FrameScheduler = (function () {
        function FrameScheduler() {
            this._expectedNextFrameAt = performance.now();
            this._drawStats = [];
            this._drawStatsSum = 0;
            this._drawStarted = 0;
            this._drawsSkipped = 0;
            this._expectedNextFrameAt = performance.now();
            this._onTime = true;
            this._trackDelta = false;
            this._delta = 0;
            this._onTimeDelta = 0;
        }
        Object.defineProperty(FrameScheduler.prototype, "shallSkipDraw", {
            get: function () {
                if (this._drawsSkipped >= FrameScheduler.MAX_DRAWS_TO_SKIP) {
                    return false;
                }
                var averageDraw = this._drawStats.length < FrameScheduler.STATS_TO_REMEMBER ? 0 :
                    this._drawStatsSum / this._drawStats.length;
                var estimatedDrawEnd = performance.now() + averageDraw;
                return estimatedDrawEnd + FrameScheduler.INTERVAL_PADDING_MS > this._expectedNextFrameAt;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FrameScheduler.prototype, "nextFrameIn", {
            get: function () {
                return Math.max(0, this._expectedNextFrameAt - performance.now());
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FrameScheduler.prototype, "isOnTime", {
            get: function () {
                return this._onTime;
            },
            enumerable: true,
            configurable: true
        });
        FrameScheduler.prototype.startFrame = function (frameRate) {
            var interval = 1000 / frameRate;
            var adjustedInterval = interval;
            var delta = this._onTimeDelta + this._delta;
            if (delta !== 0) {
                if (delta < 0) {
                    adjustedInterval *= FrameScheduler.SPEED_ADJUST_RATE;
                }
                else if (delta > 0) {
                    adjustedInterval /= FrameScheduler.SPEED_ADJUST_RATE;
                }
                this._onTimeDelta += (interval - adjustedInterval);
            }
            this._expectedNextFrameAt += adjustedInterval;
            this._onTime = true;
        };
        FrameScheduler.prototype.endFrame = function () {
            var estimatedNextFrameStart = performance.now() + FrameScheduler.INTERVAL_PADDING_MS;
            if (estimatedNextFrameStart > this._expectedNextFrameAt) {
                if (this._trackDelta) {
                    this._onTimeDelta += (this._expectedNextFrameAt - estimatedNextFrameStart);
                    console.log(this._onTimeDelta);
                }
                this._expectedNextFrameAt = estimatedNextFrameStart;
                this._onTime = false;
            }
        };
        FrameScheduler.prototype.startDraw = function () {
            this._drawsSkipped = 0;
            this._drawStarted = performance.now();
        };
        FrameScheduler.prototype.endDraw = function () {
            var drawTime = performance.now() - this._drawStarted;
            this._drawStats.push(drawTime);
            this._drawStatsSum += drawTime;
            while (this._drawStats.length > FrameScheduler.STATS_TO_REMEMBER) {
                this._drawStatsSum -= this._drawStats.shift();
            }
        };
        FrameScheduler.prototype.skipDraw = function () {
            this._drawsSkipped++;
        };
        FrameScheduler.prototype.setDelta = function (value) {
            if (!this._trackDelta) {
                return;
            }
            this._delta = value;
        };
        FrameScheduler.prototype.startTrackDelta = function () {
            this._trackDelta = true;
        };
        FrameScheduler.prototype.endTrackDelta = function () {
            if (!this._trackDelta) {
                return;
            }
            this._trackDelta = false;
            this._delta = 0;
            this._onTimeDelta = 0;
        };
        FrameScheduler.STATS_TO_REMEMBER = 50;
        FrameScheduler.MAX_DRAWS_TO_SKIP = 2;
        FrameScheduler.INTERVAL_PADDING_MS = 4;
        FrameScheduler.SPEED_ADJUST_RATE = 0.9;
        return FrameScheduler;
    })();
    Shumway.FrameScheduler = FrameScheduler;
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
    var Remoting;
    (function (Remoting) {
        var Player;
        (function (Player) {
            var flash = Shumway.AVMX.AS.flash;
            var BlendMode = flash.display.BlendMode;
            var PixelSnapping = flash.display.PixelSnapping;
            var Bounds = Shumway.Bounds;
            var MouseCursor = flash.ui.MouseCursor;
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var assert = Shumway.Debug.assert;
            var writer = Shumway.Player.writer;
            var PlayerChannelSerializer = (function () {
                function PlayerChannelSerializer() {
                    this.phase = 0 /* Objects */;
                    this.roots = null;
                    this.output = new DataBuffer();
                    this.outputAssets = [];
                }
                PlayerChannelSerializer.prototype.remoteObjects = function () {
                    this.phase = 0 /* Objects */;
                    var roots = this.roots;
                    for (var i = 0; i < roots.length; i++) {
                        Shumway.Player.enterTimeline("remoting objects");
                        this.writeDirtyDisplayObjects(roots[i], false);
                        Shumway.Player.leaveTimeline("remoting objects");
                    }
                };
                PlayerChannelSerializer.prototype.remoteReferences = function () {
                    this.phase = 1 /* References */;
                    var roots = this.roots;
                    for (var i = 0; i < roots.length; i++) {
                        Shumway.Player.enterTimeline("remoting references");
                        this.writeDirtyDisplayObjects(roots[i], true);
                        Shumway.Player.leaveTimeline("remoting references");
                    }
                };
                PlayerChannelSerializer.prototype.writeEOF = function () {
                    this.output.writeInt(0 /* EOF */);
                };
                /**
                 * Serializes dirty display objects starting at the specified root |displayObject| node.
                 */
                PlayerChannelSerializer.prototype.writeDirtyDisplayObjects = function (displayObject, clearDirtyDescendentsFlag) {
                    var self = this;
                    var roots = this.roots;
                    displayObject.visit(function (displayObject) {
                        if (displayObject._hasAnyDirtyFlags(1023 /* Dirty */)) {
                            self.writeUpdateFrame(displayObject);
                            // Collect more roots?
                            if (roots && displayObject.mask) {
                                var root = displayObject.mask._findFurthestAncestorOrSelf();
                                Shumway.ArrayUtilities.pushUnique(roots, root);
                            }
                        }
                        // TODO: Checking if we need to write assets this way is kinda expensive, do better here.
                        self.writeDirtyAssets(displayObject);
                        var hasDirtyDescendents = displayObject._hasFlags(536870912 /* DirtyDescendents */);
                        if (hasDirtyDescendents) {
                            if (clearDirtyDescendentsFlag) {
                                // We need this flag to make sure we don't clear the flag in the first remoting pass.
                                displayObject._removeFlags(536870912 /* DirtyDescendents */);
                            }
                            return 0 /* Continue */;
                        }
                        // We can skip visiting descendents since they are not dirty.
                        return 2 /* Skip */;
                    }, 0 /* None */);
                };
                PlayerChannelSerializer.prototype.writeStage = function (stage) {
                    if (!stage._isDirty) {
                        return;
                    }
                    writer && writer.writeLn("Sending Stage");
                    var serializer = this;
                    this.output.writeInt(104 /* UpdateStage */);
                    this.output.writeInt(stage._id);
                    this.output.writeInt(stage.color);
                    this._writeRectangle(new Bounds(0, 0, stage.stageWidth * 20, stage.stageHeight * 20));
                    this.output.writeInt(flash.display.StageAlign.toNumber(stage.align));
                    this.output.writeInt(flash.display.StageScaleMode.toNumber(stage.scaleMode));
                    this.output.writeInt(flash.display.StageDisplayState.toNumber(stage.displayState));
                    stage._isDirty = false;
                };
                PlayerChannelSerializer.prototype.writeCurrentMouseTarget = function (stage, currentMouseTarget) {
                    this.output.writeInt(107 /* UpdateCurrentMouseTarget */);
                    var sec = stage.sec;
                    var Mouse = sec.flash.ui.Mouse.axClass;
                    var cursor = Mouse.cursor;
                    if (currentMouseTarget) {
                        var SimpleButton = sec.flash.display.SimpleButton.axClass;
                        var Sprite = sec.flash.display.Sprite.axClass;
                        this.output.writeInt(currentMouseTarget._id);
                        if (cursor === MouseCursor.AUTO) {
                            var node = currentMouseTarget;
                            do {
                                if (SimpleButton.axIsType(node) ||
                                    (Sprite.axIsType(node) && node.buttonMode) &&
                                        currentMouseTarget.useHandCursor) {
                                    cursor = MouseCursor.BUTTON;
                                    break;
                                }
                                node = node._parent;
                            } while (node && node !== stage);
                        }
                    }
                    else {
                        this.output.writeInt(-1);
                    }
                    this.output.writeInt(MouseCursor.toNumber(cursor));
                };
                PlayerChannelSerializer.prototype.writeGraphics = function (graphics) {
                    if (!graphics._isDirty) {
                        return;
                    }
                    var textures = graphics.getUsedTextures();
                    var numTextures = textures.length;
                    for (var i = 0; i < numTextures; i++) {
                        textures[i] && this.writeBitmapData(textures[i]);
                    }
                    this.output.writeInt(101 /* UpdateGraphics */);
                    this.output.writeInt(graphics._id);
                    this.output.writeInt(-1);
                    this._writeRectangle(graphics._getContentBounds());
                    this._writeAsset(graphics.getGraphicsData().toPlainObject());
                    this.output.writeInt(numTextures);
                    for (var i = 0; i < numTextures; i++) {
                        this.output.writeInt(textures[i] ? textures[i]._id : -1);
                    }
                    graphics._isDirty = false;
                };
                PlayerChannelSerializer.prototype.writeNetStream = function (netStream, bounds) {
                    if (!netStream._isDirty) {
                        return;
                    }
                    writer && writer.writeLn("Sending NetStream: " + netStream._id);
                    this.output.writeInt(105 /* UpdateNetStream */);
                    this.output.writeInt(netStream._id);
                    this._writeRectangle(bounds);
                    netStream._isDirty = false;
                };
                PlayerChannelSerializer.prototype.writeDisplayObjectRoot = function (displayObject) {
                    release || assert(!this.roots);
                    this.roots = [displayObject];
                    this.remoteObjects();
                    this.remoteReferences();
                };
                PlayerChannelSerializer.prototype.writeBitmapData = function (bitmapData) {
                    if (!bitmapData._isDirty) {
                        return;
                    }
                    writer && writer.writeLn("Sending BitmapData: " + bitmapData._id);
                    this.output.writeInt(102 /* UpdateBitmapData */);
                    this.output.writeInt(bitmapData._id);
                    this.output.writeInt(bitmapData._symbol ? bitmapData._symbol.id : -1);
                    this._writeRectangle(bitmapData._getContentBounds());
                    this.output.writeInt(bitmapData._type);
                    this._writeAsset(bitmapData.getDataBuffer().toPlainObject());
                    bitmapData._isDirty = false;
                };
                PlayerChannelSerializer.prototype.writeTextContent = function (textContent) {
                    if (!(textContent.flags & 15 /* Dirty */)) {
                        return;
                    }
                    writer && writer.writeLn("Sending TextContent: " + textContent._id);
                    this.output.writeInt(103 /* UpdateTextContent */);
                    this.output.writeInt(textContent._id);
                    this.output.writeInt(-1);
                    this._writeRectangle(textContent.bounds);
                    var identity = textContent.sec.flash.geom.Matrix.axClass.FROZEN_IDENTITY_MATRIX;
                    this._writeMatrix(textContent.matrix || identity);
                    this.output.writeInt(textContent.backgroundColor);
                    this.output.writeInt(textContent.borderColor);
                    this.output.writeInt(textContent.autoSize);
                    this.output.writeBoolean(textContent.wordWrap);
                    this.output.writeInt(textContent.scrollV);
                    this.output.writeInt(textContent.scrollH);
                    this._writeAsset(textContent.plainText);
                    this._writeAsset(textContent.textRunData.toPlainObject());
                    var coords = textContent.coords;
                    if (coords) {
                        var numCoords = coords.length;
                        this.output.writeInt(numCoords);
                        for (var i = 0; i < numCoords; i++) {
                            this.output.writeInt(coords[i]);
                        }
                    }
                    else {
                        this.output.writeInt(0);
                    }
                    textContent.flags &= ~15 /* Dirty */;
                };
                /**
                 * Writes the number of display objects this display object clips.
                 */
                PlayerChannelSerializer.prototype.writeClippedObjectsCount = function (displayObject) {
                    if (displayObject._clipDepth > 0 && displayObject._parent) {
                        // Clips in GFX land don't use absolute clip depth numbers. Instead we need to encode
                        // the number of siblings you want to clip. If children are removed or added, GFX clip
                        // values need to be recomputed.
                        var i = displayObject._parent.getChildIndex(displayObject);
                        var j = displayObject._parent.getClipDepthIndex(displayObject._clipDepth);
                        // An invalid SWF can contain a clipping mask that doesn't clip anything, but pretends to.
                        if (j - i < 0) {
                            this.output.writeInt(-1);
                            return;
                        }
                        for (var k = i + 1; k <= i; k++) {
                        }
                        this.output.writeInt(j - i);
                    }
                    else {
                        this.output.writeInt(-1);
                    }
                };
                PlayerChannelSerializer.prototype.writeUpdateFrame = function (displayObject) {
                    // Write Header
                    this.output.writeInt(100 /* UpdateFrame */);
                    this.output.writeInt(displayObject._id);
                    writer && writer.writeLn("Sending UpdateFrame: " + displayObject.debugName(true));
                    var hasMask = false;
                    var hasMatrix = displayObject._hasDirtyFlags(1 /* DirtyMatrix */);
                    var hasColorTransform = displayObject._hasDirtyFlags(64 /* DirtyColorTransform */);
                    var hasMiscellaneousProperties = displayObject._hasDirtyFlags(512 /* DirtyMiscellaneousProperties */);
                    var video = null;
                    if (displayObject.sec.flash.media.Video.axClass.axIsType(displayObject)) {
                        video = displayObject;
                    }
                    // Check if any children need to be written. These are remoting children, not just display object children.
                    var hasRemotableChildren = false;
                    if (this.phase === 1 /* References */) {
                        hasRemotableChildren = displayObject._hasAnyDirtyFlags(2 /* DirtyChildren */ |
                            4 /* DirtyGraphics */ |
                            16 /* DirtyBitmapData */ |
                            32 /* DirtyNetStream */ |
                            8 /* DirtyTextContent */);
                        hasMask = displayObject._hasDirtyFlags(128 /* DirtyMask */);
                    }
                    var bitmap = null;
                    if (displayObject.sec.flash.display.Bitmap.axClass.axIsType(displayObject)) {
                        bitmap = displayObject;
                    }
                    // Checks if the computed clip value needs to be written.
                    var hasClip = displayObject._hasDirtyFlags(256 /* DirtyClipDepth */);
                    // Write Has Bits
                    var hasBits = 0;
                    hasBits |= hasMatrix ? 1 /* HasMatrix */ : 0;
                    hasBits |= hasColorTransform ? 8 /* HasColorTransform */ : 0;
                    hasBits |= hasMask ? 64 /* HasMask */ : 0;
                    hasBits |= hasClip ? 128 /* HasClip */ : 0;
                    hasBits |= hasMiscellaneousProperties ? 32 /* HasMiscellaneousProperties */ : 0;
                    hasBits |= hasRemotableChildren ? 4 /* HasChildren */ : 0;
                    this.output.writeInt(hasBits);
                    // Write Properties
                    if (hasMatrix) {
                        this._writeMatrix(displayObject._getMatrix());
                    }
                    if (hasColorTransform) {
                        this._writeColorTransform(displayObject._colorTransform);
                    }
                    if (hasMask) {
                        this.output.writeInt(displayObject.mask ? displayObject.mask._id : -1);
                    }
                    if (hasClip) {
                        this.writeClippedObjectsCount(displayObject);
                    }
                    if (hasMiscellaneousProperties) {
                        this.output.writeInt(displayObject._ratio);
                        this.output.writeInt(BlendMode.toNumber(displayObject._blendMode));
                        this._writeFilters(displayObject._filters);
                        this.output.writeBoolean(displayObject._hasFlags(1 /* Visible */));
                        this.output.writeBoolean(displayObject.cacheAsBitmap);
                        if (bitmap) {
                            this.output.writeInt(PixelSnapping.toNumber(bitmap.pixelSnapping));
                            this.output.writeInt(bitmap.smoothing ? 1 : 0);
                        }
                        else {
                            // For non-bitmaps, write null-defaults that cause flags not to be set in the GFX backend.
                            this.output.writeInt(PixelSnapping.toNumber(PixelSnapping.NEVER));
                            this.output.writeInt(0);
                        }
                    }
                    var graphics = displayObject._getGraphics();
                    var textContent = displayObject._getTextContent();
                    if (hasRemotableChildren) {
                        writer && writer.enter("Children: {");
                        if (bitmap) {
                            if (bitmap.bitmapData) {
                                this.output.writeInt(1);
                                this.output.writeInt(134217728 /* Asset */ | bitmap.bitmapData._id);
                            }
                            else {
                                this.output.writeInt(0);
                            }
                        }
                        else if (video) {
                            if (video._netStream) {
                                this.output.writeInt(1);
                                this.output.writeInt(134217728 /* Asset */ | video._netStream._id);
                            }
                            else {
                                this.output.writeInt(0);
                            }
                        }
                        else {
                            // Check if we have a graphics or text object and write that as a child first.
                            var count = (graphics || textContent) ? 1 : 0;
                            var children = displayObject._children;
                            if (children) {
                                count += children.length;
                            }
                            this.output.writeInt(count);
                            if (graphics) {
                                writer && writer.writeLn("Reference Graphics: " + graphics._id);
                                this.output.writeInt(134217728 /* Asset */ | graphics._id);
                            }
                            else if (textContent) {
                                writer && writer.writeLn("Reference TextContent: " + textContent._id);
                                this.output.writeInt(134217728 /* Asset */ | textContent._id);
                            }
                            // Write all the display object children.
                            if (children) {
                                for (var i = 0; i < children.length; i++) {
                                    writer && writer.writeLn("Reference DisplayObject: " + children[i].debugName());
                                    this.output.writeInt(children[i]._id);
                                    // Make sure children with a clip depth are getting visited.
                                    if (children[i]._clipDepth >= 0) {
                                        children[i]._setDirtyFlags(256 /* DirtyClipDepth */);
                                    }
                                }
                            }
                        }
                        writer && writer.leave("}");
                    }
                    if (this.phase === 1 /* References */) {
                        displayObject._removeDirtyFlags(1023 /* Dirty */);
                    }
                };
                /**
                 * Visit remotable child objects that are not otherwise visited.
                 */
                PlayerChannelSerializer.prototype.writeDirtyAssets = function (displayObject) {
                    var graphics = displayObject._getGraphics();
                    if (graphics) {
                        this.writeGraphics(graphics);
                        return;
                    }
                    var textContent = displayObject._getTextContent();
                    if (textContent) {
                        this.writeTextContent(textContent);
                        return;
                    }
                    var bitmap = null;
                    if (displayObject.sec.flash.display.Bitmap.axClass.axIsType(displayObject)) {
                        bitmap = displayObject;
                        if (bitmap.bitmapData) {
                            this.writeBitmapData(bitmap.bitmapData);
                        }
                        return;
                    }
                    var video = null;
                    if (displayObject.sec.flash.media.Video.axClass.axIsType(displayObject)) {
                        video = displayObject;
                        if (video._netStream) {
                            this.writeNetStream(video._netStream, video._getContentBounds());
                        }
                        return;
                    }
                };
                PlayerChannelSerializer.prototype.writeDrawToBitmap = function (bitmapData, source, matrix, colorTransform, blendMode, clipRect, smoothing) {
                    if (matrix === void 0) { matrix = null; }
                    if (colorTransform === void 0) { colorTransform = null; }
                    if (blendMode === void 0) { blendMode = null; }
                    if (clipRect === void 0) { clipRect = null; }
                    if (smoothing === void 0) { smoothing = false; }
                    this.output.writeInt(200 /* DrawToBitmap */);
                    this.output.writeInt(bitmapData._id);
                    if (bitmapData.sec.flash.display.BitmapData.axClass.axIsType(source)) {
                        this.output.writeInt(134217728 /* Asset */ | source._id);
                    }
                    else {
                        this.output.writeInt(source._id);
                    }
                    var hasBits = 0;
                    hasBits |= matrix ? 1 /* HasMatrix */ : 0;
                    hasBits |= colorTransform ? 8 /* HasColorTransform */ : 0;
                    hasBits |= clipRect ? 16 /* HasClipRect */ : 0;
                    this.output.writeInt(hasBits);
                    if (matrix) {
                        this._writeMatrix(matrix);
                    }
                    if (colorTransform) {
                        this._writeColorTransform(colorTransform);
                    }
                    if (clipRect) {
                        this._writeRectangle(Bounds.FromRectangle(clipRect));
                    }
                    this.output.writeInt(BlendMode.toNumber(blendMode));
                    this.output.writeBoolean(smoothing);
                };
                PlayerChannelSerializer.prototype._writeMatrix = function (matrix) {
                    if (matrix.b === 0 && matrix.c === 0) {
                        if (matrix.a === 1 && matrix.d === 1) {
                            this.output.writeInt(0 /* TranslationOnly */);
                            this.output.write2Floats(matrix.tx, matrix.ty);
                        }
                        else {
                            if (matrix.a === matrix.d) {
                                this.output.writeInt(2 /* UniformScaleAndTranslationOnly */);
                                this.output.writeFloat(matrix.a);
                            }
                            else {
                                this.output.writeInt(1 /* ScaleAndTranslationOnly */);
                                this.output.write2Floats(matrix.a, matrix.d);
                            }
                            this.output.write2Floats(matrix.tx, matrix.ty);
                        }
                    }
                    else {
                        this.output.writeInt(3 /* All */);
                        this.output.write6Floats(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
                    }
                };
                PlayerChannelSerializer.prototype._writeRectangle = function (bounds) {
                    var output = this.output;
                    // TODO: check if we should write bounds instead. Depends on what's more useful in GFX-land.
                    output.write4Ints(bounds.xMin, bounds.yMin, bounds.width, bounds.height);
                };
                PlayerChannelSerializer.prototype._writeAsset = function (asset) {
                    this.output.writeInt(this.outputAssets.length);
                    this.outputAssets.push(asset);
                };
                PlayerChannelSerializer.prototype._writeFilters = function (filters) {
                    if (!filters || filters.length === 0) {
                        this.output.writeInt(0);
                        return;
                    }
                    var sec = filters[0].sec;
                    var count = 0;
                    var blurFilterClass = sec.flash.filters.BlurFilter.axClass;
                    var dropShadowFilterClass = sec.flash.filters.DropShadowFilter.axClass;
                    var glowFilterClass = sec.flash.filters.GlowFilter.axClass;
                    var colorMatrixFilterClass = sec.flash.filters.ColorMatrixFilter.axClass;
                    for (var i = 0; i < filters.length; i++) {
                        if (blurFilterClass.axIsType(filters[i]) ||
                            dropShadowFilterClass.axIsType(filters[i]) ||
                            glowFilterClass.axIsType(filters[i]) ||
                            colorMatrixFilterClass.axIsType(filters[i])) {
                            count++;
                        }
                        else {
                            Shumway.Debug.somewhatImplemented(filters[i].toString());
                        }
                    }
                    this.output.writeInt(count);
                    for (var i = 0; i < filters.length; i++) {
                        var filter = filters[i];
                        if (blurFilterClass.axIsType(filter)) {
                            var blurFilter = filter;
                            this.output.writeInt(Remoting.FilterType.Blur);
                            this.output.writeFloat(blurFilter.blurX);
                            this.output.writeFloat(blurFilter.blurY);
                            this.output.writeInt(blurFilter.quality);
                        }
                        else if (dropShadowFilterClass.axIsType(filter)) {
                            var dropShadowFilter = filter;
                            this.output.writeInt(Remoting.FilterType.DropShadow);
                            this.output.writeFloat(dropShadowFilter.alpha);
                            this.output.writeFloat(dropShadowFilter.angle);
                            this.output.writeFloat(dropShadowFilter.blurX);
                            this.output.writeFloat(dropShadowFilter.blurY);
                            this.output.writeInt(dropShadowFilter.color);
                            this.output.writeFloat(dropShadowFilter.distance);
                            this.output.writeBoolean(dropShadowFilter.hideObject);
                            this.output.writeBoolean(dropShadowFilter.inner);
                            this.output.writeBoolean(dropShadowFilter.knockout);
                            this.output.writeInt(dropShadowFilter.quality);
                            this.output.writeFloat(dropShadowFilter.strength);
                        }
                        else if (glowFilterClass.axIsType(filter)) {
                            var glowFilter = filter;
                            this.output.writeInt(Remoting.FilterType.DropShadow);
                            this.output.writeFloat(glowFilter.alpha);
                            this.output.writeFloat(0); // angle
                            this.output.writeFloat(glowFilter.blurX);
                            this.output.writeFloat(glowFilter.blurY);
                            this.output.writeInt(glowFilter.color);
                            this.output.writeFloat(0); // distance
                            this.output.writeBoolean(false); // hideObject
                            this.output.writeBoolean(glowFilter.inner);
                            this.output.writeBoolean(glowFilter.knockout);
                            this.output.writeInt(glowFilter.quality);
                            this.output.writeFloat(glowFilter.strength);
                        }
                        else if (colorMatrixFilterClass.axIsType(filter)) {
                            var matrix = filter.matrix.value;
                            this.output.writeInt(Remoting.FilterType.ColorMatrix);
                            for (var j = 0; j < 20; j++) {
                                this.output.writeFloat(matrix[j]);
                            }
                        }
                    }
                };
                PlayerChannelSerializer.prototype._writeColorTransform = function (colorTransform) {
                    var output = this.output;
                    var rM = colorTransform.redMultiplier;
                    var gM = colorTransform.greenMultiplier;
                    var bM = colorTransform.blueMultiplier;
                    var aM = colorTransform.alphaMultiplier;
                    var rO = colorTransform.redOffset;
                    var gO = colorTransform.greenOffset;
                    var bO = colorTransform.blueOffset;
                    var aO = colorTransform.alphaOffset;
                    var identityOffset = rO === gO && gO === bO && bO === aO && aO === 0;
                    var identityColorMultiplier = rM === gM && gM === bM && bM === 1;
                    if (identityOffset && identityColorMultiplier) {
                        if (aM === 1) {
                            output.writeInt(0 /* Identity */);
                        }
                        else {
                            output.writeInt(1 /* AlphaMultiplierOnly */);
                            output.writeFloat(aM);
                        }
                    }
                    else {
                        var zeroNonAlphaMultipliers = rM === 0 && gM === 0 && bM === 0;
                        if (zeroNonAlphaMultipliers) {
                            output.writeInt(2 /* AlphaMultiplierWithOffsets */);
                            output.writeFloat(aM);
                            output.writeInt(rO);
                            output.writeInt(gO);
                            output.writeInt(bO);
                            output.writeInt(aO);
                        }
                        else {
                            output.writeInt(3 /* All */);
                            output.writeFloat(rM);
                            output.writeFloat(gM);
                            output.writeFloat(bM);
                            output.writeFloat(aM);
                            output.writeInt(rO);
                            output.writeInt(gO);
                            output.writeInt(bO);
                            output.writeInt(aO);
                        }
                    }
                };
                PlayerChannelSerializer.prototype.writeRequestBitmapData = function (bitmapData) {
                    writer && writer.writeLn("Sending BitmapData Request");
                    this.output.writeInt(106 /* RequestBitmapData */);
                    this.output.writeInt(bitmapData._id);
                };
                return PlayerChannelSerializer;
            })();
            Player.PlayerChannelSerializer = PlayerChannelSerializer;
            var PlayerChannelDeserializer = (function () {
                function PlayerChannelDeserializer(sec, input, inputAssets) {
                    this.sec = sec;
                    this.input = input;
                    this.inputAssets = inputAssets;
                    // ..
                }
                PlayerChannelDeserializer.prototype.read = function () {
                    var input = this.input;
                    var tag = input.readInt();
                    switch (tag) {
                        case 300 /* MouseEvent */:
                            return this._readMouseEvent();
                        case 301 /* KeyboardEvent */:
                            return this._readKeyboardEvent();
                        case 302 /* FocusEvent */:
                            return this._readFocusEvent();
                    }
                    release || assert(false, 'Unknown MessageReader tag: ' + tag);
                };
                PlayerChannelDeserializer.prototype._readFocusEvent = function () {
                    var input = this.input;
                    var typeId = input.readInt();
                    return {
                        tag: 302 /* FocusEvent */,
                        type: typeId
                    };
                };
                PlayerChannelDeserializer.prototype._readMouseEvent = function () {
                    var input = this.input;
                    var typeId = input.readInt();
                    var type = Shumway.Remoting.MouseEventNames[typeId];
                    var pX = input.readFloat();
                    var pY = input.readFloat();
                    var buttons = input.readInt();
                    var flags = input.readInt();
                    return {
                        tag: 300 /* MouseEvent */,
                        type: type,
                        point: new this.sec.flash.geom.Point(pX, pY),
                        ctrlKey: !!(flags & 1 /* CtrlKey */),
                        altKey: !!(flags & 2 /* AltKey */),
                        shiftKey: !!(flags & 4 /* ShiftKey */),
                        buttons: buttons
                    };
                };
                PlayerChannelDeserializer.prototype._readKeyboardEvent = function () {
                    var input = this.input;
                    var typeId = input.readInt();
                    var type = Shumway.Remoting.KeyboardEventNames[typeId];
                    var keyCode = input.readInt();
                    var charCode = input.readInt();
                    var location = input.readInt();
                    var flags = input.readInt();
                    return {
                        tag: 301 /* KeyboardEvent */,
                        type: type,
                        keyCode: keyCode,
                        charCode: charCode,
                        location: location,
                        ctrlKey: !!(flags & 1 /* CtrlKey */),
                        altKey: !!(flags & 2 /* AltKey */),
                        shiftKey: !!(flags & 4 /* ShiftKey */)
                    };
                };
                return PlayerChannelDeserializer;
            })();
            Player.PlayerChannelDeserializer = PlayerChannelDeserializer;
        })(Player = Remoting.Player || (Remoting.Player = {}));
    })(Remoting = Shumway.Remoting || (Shumway.Remoting = {}));
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
    var Player;
    (function (Player_1) {
        var assert = Shumway.Debug.assert;
        var somewhatImplemented = Shumway.Debug.somewhatImplemented;
        var flash = Shumway.AVMX.AS.flash;
        var Event = flash.events.Event;
        var MouseEventDispatcher = flash.ui.MouseEventDispatcher;
        var KeyboardEventDispatcher = flash.ui.KeyboardEventDispatcher;
        /**
         * Base class implementation of the IGFXServer. The different transports shall
         * inherit this class
         */
        var GFXServiceBase = (function () {
            function GFXServiceBase(sec) {
                this._observers = [];
                this.sec = sec;
            }
            GFXServiceBase.prototype.addObserver = function (observer) {
                this._observers.push(observer);
            };
            GFXServiceBase.prototype.removeObserver = function (observer) {
                var i = this._observers.indexOf(observer);
                if (i >= 0) {
                    this._observers.splice(i, 1);
                }
            };
            GFXServiceBase.prototype.update = function (updates, assets) {
                throw new Error('This method is abstract');
            };
            GFXServiceBase.prototype.updateAndGet = function (updates, assets) {
                throw new Error('This method is abstract');
            };
            GFXServiceBase.prototype.frame = function () {
                throw new Error('This method is abstract');
            };
            GFXServiceBase.prototype.videoControl = function (id, eventType, data) {
                throw new Error('This method is abstract');
            };
            GFXServiceBase.prototype.registerFont = function (syncId, data) {
                throw new Error('This method is abstract');
            };
            GFXServiceBase.prototype.registerImage = function (syncId, symbolId, imageType, data, alphaData) {
                throw new Error('This method is abstract');
            };
            GFXServiceBase.prototype.fscommand = function (command, args) {
                throw new Error('This method is abstract');
            };
            GFXServiceBase.prototype.processUpdates = function (updates, assets) {
                var deserializer = new Shumway.Remoting.Player.PlayerChannelDeserializer(this.sec, updates, assets);
                var message = deserializer.read();
                switch (message.tag) {
                    case 301 /* KeyboardEvent */:
                        this._observers.forEach(function (observer) {
                            observer.keyboardEvent(message);
                        });
                        break;
                    case 300 /* MouseEvent */:
                        this._observers.forEach(function (observer) {
                            observer.mouseEvent(message);
                        });
                        break;
                    case 302 /* FocusEvent */:
                        this._observers.forEach(function (observer) {
                            observer.focusEvent(message);
                        });
                        break;
                }
            };
            GFXServiceBase.prototype.processDisplayParameters = function (displayParameters) {
                this._observers.forEach(function (observer) {
                    observer.displayParameters(displayParameters);
                });
            };
            GFXServiceBase.prototype.processVideoEvent = function (id, eventType, data) {
                this._observers.forEach(function (observer) {
                    observer.videoEvent(id, eventType, data);
                });
            };
            return GFXServiceBase;
        })();
        Player_1.GFXServiceBase = GFXServiceBase;
        /**
         * Helper class to handle GFXService notifications/events and forward them to
         * the Player object.
         */
        var GFXServiceObserver = (function () {
            function GFXServiceObserver(player) {
                this._videoEventListeners = [];
                this._player = player;
                this._keyboardEventDispatcher = new KeyboardEventDispatcher();
                this._mouseEventDispatcher = new MouseEventDispatcher();
                this._writer = new Shumway.IndentingWriter();
            }
            GFXServiceObserver.prototype.videoEvent = function (id, eventType, data) {
                var listener = this._videoEventListeners[id];
                Shumway.Debug.assert(listener, 'Video event listener is not found');
                listener(eventType, data);
            };
            GFXServiceObserver.prototype.displayParameters = function (displayParameters) {
                this._player._stage.setStageContainerSize(displayParameters.stageWidth, displayParameters.stageHeight, displayParameters.pixelRatio);
            };
            GFXServiceObserver.prototype.focusEvent = function (data) {
                var message = data;
                var focusType = message.type;
                switch (focusType) {
                    case 0 /* DocumentHidden */:
                        this._player._isPageVisible = false;
                        break;
                    case 1 /* DocumentVisible */:
                        this._player._isPageVisible = true;
                        break;
                    case 2 /* WindowBlur */:
                        // TODO: This is purposely disabled so that applications don't pause when they are out of
                        // focus while the debugging window is open.
                        // EventDispatcher.broadcastEventDispatchQueue.dispatchEvent(Event.getBroadcastInstance(Event.DEACTIVATE));
                        this._player._hasFocus = false;
                        break;
                    case 3 /* WindowFocus */:
                        var eventDispatcherClass = this._player.sec.flash.events.EventDispatcher.axClass;
                        var eventClass = this._player.sec.flash.events.Event.axClass;
                        eventDispatcherClass.broadcastEventDispatchQueue.dispatchEvent(eventClass.getBroadcastInstance(Event.ACTIVATE));
                        this._player._hasFocus = true;
                        break;
                }
            };
            GFXServiceObserver.prototype.keyboardEvent = function (data) {
                var message = data;
                // If the stage doesn't have a focus then dispatch events on the stage
                // directly.
                var target = this._player._stage.focus ? this._player._stage.focus : this._player._stage;
                this._keyboardEventDispatcher.target = target;
                this._keyboardEventDispatcher.dispatchKeyboardEvent(message);
            };
            GFXServiceObserver.prototype.mouseEvent = function (data) {
                var message = data;
                this._mouseEventDispatcher.stage = this._player._stage;
                var target = this._mouseEventDispatcher.handleMouseEvent(message);
                if (Shumway.traceMouseEventOption.value) {
                    this._writer.writeLn("Mouse Event: type: " + message.type + ", point: " + message.point + ", target: " + target + (target ? ", name: " + target._name : ""));
                    if (message.type === "click" && target) {
                        target.debugTrace();
                    }
                }
                this._player.currentMouseTarget = this._mouseEventDispatcher.currentTarget;
            };
            GFXServiceObserver.prototype.registerEventListener = function (id, listener) {
                this._videoEventListeners[id] = listener;
            };
            return GFXServiceObserver;
        })();
        /**
         * Shumway Player
         *
         * This class brings everything together. Loads the swf, runs the event loop and
         * synchronizes the frame tree with the display list.
         */
        var Player = (function () {
            function Player(sec, gfxService) {
                this._framesPlayed = 0;
                /**
                 * Time since the last time we've synchronized the display list.
                 */
                this._lastPumpTime = 0;
                /**
                 * Page Visibility API visible state.
                 */
                this._isPageVisible = true;
                /**
                 * Page focus state.
                 */
                this._hasFocus = true;
                /**
                 * Stage current mouse target.
                 */
                this._currentMouseTarget = null;
                /**
                 * Indicates whether the |currentMouseTarget| has changed since the last time it was synchronized.
                 */
                this._currentMouseTargetIsDirty = true;
                /**
                 * Page URL that hosts SWF.
                 */
                this._pageUrl = null;
                /**
                 * SWF URL.
                 */
                this._swfUrl = null;
                /**
                 * Loader URL, can be different from SWF URL.
                 */
                this._loaderUrl = null;
                this._crossDomainSWFLoadingWhitelist = [];
                this.sec = sec;
                sec.player = this;
                // Freeze in debug builds.
                release || Object.defineProperty(this, 'sec', { value: sec });
                release || Shumway.Debug.assert(gfxService);
                this._writer = new Shumway.IndentingWriter();
                this._gfxService = gfxService;
                this._gfxServiceObserver = new GFXServiceObserver(this);
                this._gfxService.addObserver(this._gfxServiceObserver);
            }
            Object.defineProperty(Player.prototype, "framesPlayed", {
                get: function () {
                    return this._framesPlayed;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Player.prototype, "currentMouseTarget", {
                set: function (value) {
                    if (this._currentMouseTarget !== value) {
                        this._currentMouseTargetIsDirty = true;
                    }
                    this._currentMouseTarget = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Player.prototype, "stage", {
                /**
                 * Movie stage object.
                 */
                get: function () {
                    return this._stage;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Whether we can get away with rendering at a lower rate.
             */
            Player.prototype._shouldThrottleDownRendering = function () {
                return !this._isPageVisible;
            };
            /**
             * Whether we can get away with executing frames at a lower rate.
             */
            Player.prototype._shouldThrottleDownFrameExecution = function () {
                return !this._isPageVisible;
            };
            Object.defineProperty(Player.prototype, "pageUrl", {
                get: function () {
                    return this._pageUrl;
                },
                set: function (value) {
                    this._pageUrl = value || null;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Player.prototype, "loaderUrl", {
                get: function () {
                    return this._loaderUrl;
                },
                set: function (value) {
                    this._loaderUrl = value || null;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Player.prototype, "swfUrl", {
                get: function () {
                    return this._swfUrl;
                },
                enumerable: true,
                configurable: true
            });
            Player.prototype.load = function (url, buffer) {
                release || assert(!this._loader, "Can't load twice.");
                this._swfUrl = url;
                this._stage = new this.sec.flash.display.Stage();
                var loader = this._loader = this.sec.flash.display.Loader.axClass.getRootLoader();
                var loaderInfo = this._loaderInfo = loader.contentLoaderInfo;
                if (Shumway.playAllSymbolsOption.value) {
                    this._playAllSymbols();
                    loaderInfo._allowCodeExecution = false;
                }
                else {
                    this._enterRootLoadingLoop();
                }
                var resolvedURL = Shumway.FileLoadingService.instance.resolveUrl(url);
                this.addToSWFLoadingWhitelist(resolvedURL, false, true);
                var context = this.createLoaderContext();
                if (buffer) {
                    var byteArray = new this.sec.flash.utils.ByteArray(buffer);
                    this._loader.loadBytes(byteArray, context);
                    this._loader.contentLoaderInfo._url = resolvedURL;
                }
                else {
                    this._loader.load(new this.sec.flash.net.URLRequest(url), context);
                }
            };
            Player.prototype.createLoaderContext = function () {
                var loaderContext = new this.sec.flash.system.LoaderContext();
                if (this.movieParams) {
                    var parameters = this.sec.createObject();
                    for (var i in this.movieParams) {
                        parameters.axSetPublicProperty(i, this.movieParams[i]);
                    }
                    loaderContext.parameters = parameters;
                }
                return loaderContext;
            };
            Player.prototype._pumpDisplayListUpdates = function () {
                this.syncDisplayObject(this._stage, true);
            };
            Player.prototype.syncDisplayObject = function (displayObject, async) {
                var serializer = new Shumway.Remoting.Player.PlayerChannelSerializer();
                if (this.sec.flash.display.Stage.axClass.axIsType(displayObject)) {
                    var stage = displayObject;
                    serializer.writeStage(stage);
                    if (this._currentMouseTargetIsDirty) {
                        serializer.writeCurrentMouseTarget(stage, this._currentMouseTarget);
                        this._currentMouseTargetIsDirty = false;
                    }
                }
                serializer.writeDisplayObjectRoot(displayObject);
                serializer.writeEOF();
                Player_1.enterTimeline("remoting assets");
                var output;
                if (async) {
                    this._gfxService.update(serializer.output, serializer.outputAssets);
                }
                else {
                    output = this._gfxService.updateAndGet(serializer.output, serializer.outputAssets).clone();
                }
                Player_1.leaveTimeline("remoting assets");
                return output;
            };
            Player.prototype.requestBitmapData = function (bitmapData) {
                var serializer = new Shumway.Remoting.Player.PlayerChannelSerializer();
                serializer.writeRequestBitmapData(bitmapData);
                serializer.writeEOF();
                return this._gfxService.updateAndGet(serializer.output, serializer.outputAssets).clone();
            };
            Player.prototype.drawToBitmap = function (bitmapData, source, matrix, colorTransform, blendMode, clipRect, smoothing) {
                if (matrix === void 0) { matrix = null; }
                if (colorTransform === void 0) { colorTransform = null; }
                if (blendMode === void 0) { blendMode = null; }
                if (clipRect === void 0) { clipRect = null; }
                if (smoothing === void 0) { smoothing = false; }
                var serializer = new Shumway.Remoting.Player.PlayerChannelSerializer();
                serializer.writeBitmapData(bitmapData);
                if (this.sec.flash.display.BitmapData.axClass.axIsType(source)) {
                    serializer.writeBitmapData(source);
                }
                else {
                    serializer.writeDisplayObjectRoot(source);
                }
                serializer.writeDrawToBitmap(bitmapData, source, matrix, colorTransform, blendMode, clipRect, smoothing);
                serializer.writeEOF();
                Player_1.enterTimeline("sendUpdates");
                this._gfxService.updateAndGet(serializer.output, serializer.outputAssets);
                Player_1.leaveTimeline("sendUpdates");
            };
            Player.prototype.registerEventListener = function (id, listener) {
                this._gfxServiceObserver.registerEventListener(id, listener);
            };
            Player.prototype.notifyVideoControl = function (id, eventType, data) {
                return this._gfxService.videoControl(id, eventType, data);
            };
            Player.prototype.executeFSCommand = function (command, args) {
                switch (command) {
                    case 'quit':
                        this._leaveEventLoop();
                        break;
                    default:
                        somewhatImplemented('FSCommand ' + command);
                }
                this._gfxService.fscommand(command, args);
            };
            Player.prototype.requestRendering = function () {
                this._pumpDisplayListUpdates();
            };
            /**
             * Update the frame container with the latest changes from the display list.
             */
            Player.prototype._pumpUpdates = function () {
                if (!Shumway.dontSkipFramesOption.value) {
                    if (this._shouldThrottleDownRendering()) {
                        return;
                    }
                    var timeSinceLastPump = performance.now() - this._lastPumpTime;
                    if (timeSinceLastPump < (1000 / Shumway.pumpRateOption.value)) {
                        return;
                    }
                }
                Player_1.enterTimeline("pump");
                if (Shumway.pumpEnabledOption.value) {
                    this._pumpDisplayListUpdates();
                    this._lastPumpTime = performance.now();
                }
                Player_1.leaveTimeline("pump");
            };
            Player.prototype._leaveSyncLoop = function () {
                release || assert(this._frameTimeout > -1);
                clearInterval(this._frameTimeout);
            };
            Player.prototype._getFrameInterval = function () {
                var frameRate = Shumway.frameRateOption.value;
                if (frameRate < 0) {
                    frameRate = this._stage.frameRate;
                }
                return Math.floor(1000 / frameRate);
            };
            Player.prototype._enterEventLoop = function () {
                this._eventLoopIsRunning = true;
                var self = this;
                function tick() {
                    // TODO: change this to the mode described in
                    // http://www.craftymind.com/2008/04/18/updated-elastic-racetrack-for-flash-9-and-avm2/
                    self._frameTimeout = setTimeout(tick, self._getFrameInterval());
                    self._eventLoopTick();
                }
                if (!isNaN(this.initStartTime)) {
                    console.info('Time from init start to main event loop start: ' +
                        (Date.now() - this.initStartTime));
                }
                tick();
            };
            Player.prototype._leaveEventLoop = function () {
                release || assert(this._eventLoopIsRunning);
                clearTimeout(this._frameTimeout);
                this._eventLoopIsRunning = false;
            };
            Player.prototype._enterRootLoadingLoop = function () {
                var self = this;
                var rootLoader = this.sec.flash.display.Loader.axClass.getRootLoader();
                rootLoader._setStage(this._stage);
                function rootLoadingLoop() {
                    var loaderInfo = rootLoader.contentLoaderInfo;
                    if (!loaderInfo._file) {
                        setTimeout(rootLoadingLoop, self._getFrameInterval());
                        return;
                    }
                    var stage = self._stage;
                    var bgcolor = self.defaultStageColor !== undefined ?
                        self.defaultStageColor :
                        loaderInfo._file.backgroundColor;
                    stage._loaderInfo = loaderInfo;
                    stage.align = self.stageAlign || '';
                    if (!self.stageScale || flash.display.StageScaleMode.toNumber(self.stageScale) < 0) {
                        stage.scaleMode = flash.display.StageScaleMode.SHOW_ALL;
                    }
                    else {
                        stage.scaleMode = self.stageScale;
                    }
                    stage.frameRate = loaderInfo.frameRate;
                    stage.setStageWidth(loaderInfo.width);
                    stage.setStageHeight(loaderInfo.height);
                    stage.setStageColor(Shumway.ColorUtilities.RGBAToARGB(bgcolor));
                    if (self.displayParameters) {
                        self._gfxServiceObserver.displayParameters(self.displayParameters);
                    }
                    self._enterEventLoop();
                }
                rootLoadingLoop();
            };
            Player.prototype._eventLoopTick = function () {
                var runFrameScripts = !Shumway.playAllSymbolsOption.value;
                var dontSkipFrames = Shumway.dontSkipFramesOption.value;
                if (!dontSkipFrames && (!Shumway.frameEnabledOption.value && runFrameScripts ||
                    this._shouldThrottleDownFrameExecution())) {
                    return;
                }
                // The stage is required for frame event cycle processing.
                var displayObjectClass = this.sec.flash.display.DisplayObject.axClass;
                displayObjectClass._stage = this._stage;
                // Until the root SWF is initialized, only process Loader events.
                // Once the root loader's content is created, directly process all events again to avoid
                // further delay in initialization.
                var loaderClass = this.sec.flash.display.Loader.axClass;
                if (!loaderClass.getRootLoader().content) {
                    loaderClass.processEvents();
                    if (!loaderClass.getRootLoader().content) {
                        return;
                    }
                }
                for (var i = 0; i < Shumway.frameRateMultiplierOption.value; i++) {
                    Player_1.enterTimeline("eventLoop");
                    var start = performance.now();
                    displayObjectClass.performFrameNavigation(true, runFrameScripts);
                    Player_1.counter.count("performFrameNavigation", 1, performance.now() - start);
                    loaderClass.processEvents();
                    Player_1.leaveTimeline("eventLoop");
                }
                this._framesPlayed++;
                if (Shumway.tracePlayerOption.value > 0 && (this._framesPlayed % Shumway.tracePlayerOption.value === 0)) {
                    this._tracePlayer();
                }
                this._stage.render();
                this._pumpUpdates();
                this._gfxService.frame();
            };
            Player.prototype._tracePlayer = function () {
                this._writer.writeLn("Frame: " +
                    String(this._framesPlayed).padLeft(' ', 4) + ": " + Shumway.IntegerUtilities.toHEX(this._stage.hashCode()) + " " +
                    String(this._stage.getAncestorCount()).padLeft(' ', 4));
            };
            Player.prototype._playAllSymbols = function () {
                var stage = this._stage;
                var loader = this._loader;
                var loaderInfo = this._loaderInfo;
                var self = this;
                loaderInfo.addEventListener(flash.events.ProgressEvent.PROGRESS, function onProgress() {
                    var root = loader.content;
                    if (!root) {
                        return;
                    }
                    loaderInfo.removeEventListener(flash.events.ProgressEvent.PROGRESS, onProgress);
                    self._enterEventLoop();
                });
                loaderInfo.addEventListener(flash.events.Event.COMPLETE, function onProgress() {
                    stage.setStageWidth(1024);
                    stage.setStageHeight(1024);
                    var symbols = [];
                    loaderInfo._dictionary.forEach(function (symbol, key) {
                        if (symbol instanceof Shumway.Timeline.DisplaySymbol) {
                            symbols.push(symbol);
                        }
                    });
                    function show(symbol) {
                        flash.display.DisplayObject.reset();
                        flash.display.MovieClip.reset();
                        var symbolInstance = symbol.symbolClass.initializeFrom(symbol);
                        symbol.symbolClass.instanceConstructorNoInitialize.call(symbolInstance);
                        if (symbol instanceof flash.display.BitmapSymbol) {
                            symbolInstance = new this.sec.flash.display.Bitmap(symbolInstance);
                        }
                        while (stage.numChildren > 0) {
                            stage.removeChildAt(0);
                        }
                        stage.addChild(symbolInstance);
                    }
                    var nextSymbolIndex = 0;
                    function showNextSymbol() {
                        var symbol;
                        if (Shumway.playSymbolOption.value > 0) {
                            symbol = loaderInfo.getSymbolById(Shumway.playSymbolOption.value);
                            if (symbol instanceof Shumway.Timeline.DisplaySymbol) {
                            }
                            else {
                                symbol = null;
                            }
                        }
                        else {
                            symbol = symbols[nextSymbolIndex++];
                            if (nextSymbolIndex === symbols.length) {
                                nextSymbolIndex = 0;
                            }
                            if (Shumway.playSymbolCountOption.value >= 0 &&
                                nextSymbolIndex > Shumway.playSymbolCountOption.value) {
                                nextSymbolIndex = 0;
                            }
                        }
                        var frames = 1;
                        if (symbol && symbol.id > 0) {
                            show(symbol);
                            if (symbol instanceof flash.display.SpriteSymbol) {
                                frames = symbol.numFrames;
                            }
                        }
                        if (Shumway.playSymbolFrameDurationOption.value > 0) {
                            frames = Shumway.playSymbolFrameDurationOption.value;
                        }
                        setTimeout(showNextSymbol, self._getFrameInterval() * frames);
                    }
                    setTimeout(showNextSymbol, self._getFrameInterval());
                });
            };
            Player.prototype.registerFont = function (symbol, data) {
                release || assert(symbol.syncId);
                symbol.resolveAssetPromise = new Shumway.PromiseWrapper(); // TODO no need for wrapper here, change to Promise
                this._gfxService.registerFont(symbol.syncId, data).then(function (result) {
                    symbol.resolveAssetPromise.resolve(result);
                });
                // Fonts are immediately available in Firefox, so we can just mark the symbol as ready.
                if (inFirefox) {
                    symbol.ready = true;
                }
                else {
                    symbol.resolveAssetPromise.then(symbol.resolveAssetCallback, null);
                }
            };
            Player.prototype.registerImage = function (symbol, imageType, data, alphaData) {
                release || assert(symbol.syncId);
                symbol.resolveAssetPromise = new Shumway.PromiseWrapper(); // TODO no need for wrapper here, change to Promise
                this._gfxService.registerImage(symbol.syncId, symbol.id, imageType, data, alphaData).then(function (result) {
                    symbol.resolveAssetPromise.resolve(result);
                });
                symbol.resolveAssetPromise.then(symbol.resolveAssetCallback, null);
            };
            Player.prototype.addToSWFLoadingWhitelist = function (domain, insecure, ownDomain) {
                if (domain.indexOf('/') < 0) {
                    this._crossDomainSWFLoadingWhitelist.push({ protocol: 'http:', hostname: domain, insecure: insecure, ownDomain: ownDomain });
                    return;
                }
                try {
                    var url = new window.URL(domain);
                    this._crossDomainSWFLoadingWhitelist.push({ protocol: url.protocol, hostname: url.hostname, insecure: insecure, ownDomain: ownDomain });
                }
                catch (e) { }
            };
            Player.prototype.checkDomainForSWFLoading = function (domain) {
                try {
                    var url = new window.URL(domain);
                }
                catch (e) {
                    return 2 /* Failed */;
                }
                var result = 2 /* Failed */;
                this._crossDomainSWFLoadingWhitelist.some(function (entry) {
                    var success;
                    if (url.hostname !== entry.hostname && entry.hostname !== '*') {
                        success = false;
                    }
                    else if (entry.insecure) {
                        success = true;
                    }
                    else {
                        // The HTTPS SWF has to be more protected than it's whitelisted HTTP equivalent.
                        success = url.protocol === 'https:' || entry.protocol !== 'https:';
                    }
                    if (success) {
                        result = entry.ownDomain ?
                            0 /* OwnDomain */ :
                            1 /* Remote */;
                        return true;
                    }
                    return false;
                }, this);
                return result;
            };
            return Player;
        })();
        Player_1.Player = Player;
    })(Player = Shumway.Player || (Shumway.Player = {}));
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
var Shumway;
(function (Shumway) {
    var assert = Shumway.Debug.assert;
    (function (AVM2LoadLibrariesFlags) {
        AVM2LoadLibrariesFlags[AVM2LoadLibrariesFlags["Builtin"] = 1] = "Builtin";
        AVM2LoadLibrariesFlags[AVM2LoadLibrariesFlags["Playerglobal"] = 2] = "Playerglobal";
        AVM2LoadLibrariesFlags[AVM2LoadLibrariesFlags["Shell"] = 4] = "Shell";
    })(Shumway.AVM2LoadLibrariesFlags || (Shumway.AVM2LoadLibrariesFlags = {}));
    var AVM2LoadLibrariesFlags = Shumway.AVM2LoadLibrariesFlags;
    function createSecurityDomain(libraries) {
        var result = new Shumway.PromiseWrapper();
        release || assert(!!(libraries & AVM2LoadLibrariesFlags.Builtin));
        Shumway.SWF.enterTimeline('Load builton.abc file');
        Shumway.SystemResourcesLoadingService.instance.load(0 /* BuiltinAbc */).then(function (buffer) {
            var sec = new Shumway.AVMX.AXSecurityDomain();
            var env = { url: 'builtin.abc', app: sec.system };
            var builtinABC = new Shumway.AVMX.ABCFile(env, new Uint8Array(buffer));
            sec.system.loadABC(builtinABC);
            sec.initialize();
            sec.system.executeABC(builtinABC);
            Shumway.SWF.leaveTimeline();
            //// If library is shell.abc, then just go ahead and run it now since
            //// it's not worth doing it lazily given that it is so small.
            //if (!!(libraries & AVM2LoadLibrariesFlags.Shell)) {
            //  var shellABC = new Shumway.AVMX.ABCFile(new Uint8Array(buffer));
            //  sec.system.loadAndExecuteABC(shellABC);
            //  result.resolve(sec);
            //  SystemResourcesLoadingService.instance.load(SystemResourceId.ShellAbc).then(function (buffer) {
            //    var shellABC = new Shumway.AVMX.ABCFile(new Uint8Array(buffer));
            //    sec.system.loadAndExecuteABC(shellABC);
            //    result.resolve(sec);
            //  }, result.reject);
            //  return;
            //}
            if (!!(libraries & AVM2LoadLibrariesFlags.Playerglobal)) {
                Shumway.SWF.enterTimeline('Load playerglobal files');
                return Promise.all([
                    Shumway.SystemResourcesLoadingService.instance.load(1 /* PlayerglobalAbcs */),
                    Shumway.SystemResourcesLoadingService.instance.load(2 /* PlayerglobalManifest */)]).
                    then(function (results) {
                    var catalog = new Shumway.AVMX.ABCCatalog(sec.system, new Uint8Array(results[0]), results[1]);
                    sec.addCatalog(catalog);
                    Shumway.SWF.leaveTimeline();
                    result.resolve(sec);
                }, result.reject);
            }
            result.resolve(sec);
        }, result.reject);
        return result.promise;
    }
    Shumway.createSecurityDomain = createSecurityDomain;
})(Shumway || (Shumway = {}));
/**
 * Copyright 2015 Mozilla Foundation
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    var Player;
    (function (Player) {
        var ShumwayComExternalInterface = (function () {
            function ShumwayComExternalInterface() {
            }
            Object.defineProperty(ShumwayComExternalInterface.prototype, "enabled", {
                get: function () {
                    return true;
                },
                enumerable: true,
                configurable: true
            });
            ShumwayComExternalInterface.prototype.initJS = function (callback) {
                ShumwayCom.externalCom({ action: 'init' });
                ShumwayCom.setExternalCallback(function (call) {
                    return callback(call.functionName, call.args);
                });
                this._externalCallback = callback;
            };
            ShumwayComExternalInterface.prototype.registerCallback = function (functionName) {
                var cmd = { action: 'register', functionName: functionName, remove: false };
                ShumwayCom.externalCom(cmd);
            };
            ShumwayComExternalInterface.prototype.unregisterCallback = function (functionName) {
                var cmd = { action: 'register', functionName: functionName, remove: true };
                ShumwayCom.externalCom(cmd);
            };
            ShumwayComExternalInterface.prototype.eval = function (expression) {
                var cmd = { action: 'eval', expression: expression };
                return ShumwayCom.externalCom(cmd);
            };
            ShumwayComExternalInterface.prototype.call = function (request) {
                var cmd = { action: 'call', request: request };
                return ShumwayCom.externalCom(cmd);
            };
            ShumwayComExternalInterface.prototype.getId = function () {
                var cmd = { action: 'getId' };
                return ShumwayCom.externalCom(cmd);
            };
            return ShumwayComExternalInterface;
        })();
        Player.ShumwayComExternalInterface = ShumwayComExternalInterface;
        var ShumwayComFileLoadingService = (function () {
            function ShumwayComFileLoadingService() {
                this._baseUrl = null;
                this._nextSessionId = 1; // 0 - is reserved
                this._sessions = [];
            }
            ShumwayComFileLoadingService.prototype.init = function (baseUrl) {
                this._baseUrl = baseUrl;
                var service = this;
                ShumwayCom.setLoadFileCallback(function (args) {
                    var session = service._sessions[args.sessionId];
                    if (session) {
                        service._notifySession(session, args);
                    }
                });
            };
            ShumwayComFileLoadingService.prototype._notifySession = function (session, args) {
                var sessionId = args.sessionId;
                switch (args.topic) {
                    case "open":
                        session.onopen();
                        break;
                    case "close":
                        session.onclose();
                        this._sessions[sessionId] = null;
                        console.log('Session #' + sessionId + ': closed');
                        break;
                    case "error":
                        session.onerror && session.onerror(args.error);
                        break;
                    case "progress":
                        console.log('Session #' + sessionId + ': loaded ' + args.loaded + '/' + args.total);
                        var data = args.array;
                        if (!(data instanceof Uint8Array)) {
                            data = new Uint8Array(data);
                        }
                        session.onprogress && session.onprogress(data, { bytesLoaded: args.loaded, bytesTotal: args.total });
                        break;
                }
            };
            ShumwayComFileLoadingService.prototype.createSession = function () {
                var sessionId = this._nextSessionId++;
                var service = this;
                var session = {
                    open: function (request) {
                        var path = service.resolveUrl(request.url);
                        console.log('Session #' + sessionId + ': loading ' + path);
                        ShumwayCom.loadFile({ url: path, method: request.method,
                            mimeType: request.mimeType, postData: request.data,
                            checkPolicyFile: request.checkPolicyFile, sessionId: sessionId });
                    },
                    close: function () {
                        if (service._sessions[sessionId]) {
                            ShumwayCom.abortLoad(sessionId);
                        }
                    }
                };
                return (this._sessions[sessionId] = session);
            };
            ShumwayComFileLoadingService.prototype.resolveUrl = function (url) {
                return new window.URL(url, this._baseUrl).href;
            };
            ShumwayComFileLoadingService.prototype.navigateTo = function (url, target) {
                ShumwayCom.navigateTo({
                    url: this.resolveUrl(url),
                    target: target
                });
            };
            return ShumwayComFileLoadingService;
        })();
        Player.ShumwayComFileLoadingService = ShumwayComFileLoadingService;
        var ShumwayComClipboardService = (function () {
            function ShumwayComClipboardService() {
            }
            ShumwayComClipboardService.prototype.setClipboard = function (data) {
                ShumwayCom.setClipboard(data);
            };
            return ShumwayComClipboardService;
        })();
        Player.ShumwayComClipboardService = ShumwayComClipboardService;
        var ShumwayComTelemetryService = (function () {
            function ShumwayComTelemetryService() {
            }
            ShumwayComTelemetryService.prototype.reportTelemetry = function (data) {
                ShumwayCom.reportTelemetry(data);
            };
            return ShumwayComTelemetryService;
        })();
        Player.ShumwayComTelemetryService = ShumwayComTelemetryService;
        var BrowserFileLoadingService = (function () {
            function BrowserFileLoadingService() {
            }
            BrowserFileLoadingService.prototype.createSession = function () {
                var service = this;
                var reader;
                return {
                    open: function (request) {
                        var self = this;
                        var path = service.resolveUrl(request.url);
                        console.log('FileLoadingService: loading ' + path + ", data: " + request.data);
                        reader = new Shumway.BinaryFileReader(path, request.method, request.mimeType, request.data);
                        reader.readChunked(service._fileReadChunkSize, function (data, progress) {
                            self.onprogress(data, { bytesLoaded: progress.loaded, bytesTotal: progress.total });
                        }, function (e) { self.onerror(e); }, self.onopen, self.onclose, self.onhttpstatus);
                    },
                    close: function () {
                        reader.abort();
                        reader = null;
                    }
                };
            };
            BrowserFileLoadingService.prototype.init = function (baseUrl, fileReadChunkSize) {
                if (fileReadChunkSize === void 0) { fileReadChunkSize = 0; }
                this._baseUrl = baseUrl;
                this._fileReadChunkSize = fileReadChunkSize;
            };
            BrowserFileLoadingService.prototype.resolveUrl = function (url) {
                return new window.URL(url, this._baseUrl).href;
            };
            BrowserFileLoadingService.prototype.navigateTo = function (url, target) {
                window.open(this.resolveUrl(url), target || '_blank');
            };
            return BrowserFileLoadingService;
        })();
        Player.BrowserFileLoadingService = BrowserFileLoadingService;
        var ShumwayComResourcesLoadingService = (function () {
            function ShumwayComResourcesLoadingService(preload) {
                this._pendingPromises = [];
                if (preload) {
                    this.load(0 /* BuiltinAbc */);
                    this.load(1 /* PlayerglobalAbcs */);
                    this.load(2 /* PlayerglobalManifest */);
                }
                ShumwayCom.setSystemResourceCallback(this._onSystemResourceCallback.bind(this));
            }
            ShumwayComResourcesLoadingService.prototype._onSystemResourceCallback = function (id, data) {
                this._pendingPromises[id].resolve(data);
            };
            ShumwayComResourcesLoadingService.prototype.load = function (id) {
                var result = this._pendingPromises[id];
                if (!result) {
                    result = new Shumway.PromiseWrapper();
                    this._pendingPromises[id] = result;
                    ShumwayCom.loadSystemResource(id);
                }
                return result.promise;
            };
            return ShumwayComResourcesLoadingService;
        })();
        Player.ShumwayComResourcesLoadingService = ShumwayComResourcesLoadingService;
        var BrowserSystemResourcesLoadingService = (function () {
            function BrowserSystemResourcesLoadingService(builtinPath, viewerPlayerglobalInfo, shellPath) {
                this.builtinPath = builtinPath;
                this.viewerPlayerglobalInfo = viewerPlayerglobalInfo;
                this.shellPath = shellPath;
            }
            BrowserSystemResourcesLoadingService.prototype.load = function (id) {
                switch (id) {
                    case 0 /* BuiltinAbc */:
                        return this._promiseFile(this.builtinPath, 'arraybuffer');
                    case 1 /* PlayerglobalAbcs */:
                        return this._promiseFile(this.viewerPlayerglobalInfo.abcs, 'arraybuffer');
                    case 2 /* PlayerglobalManifest */:
                        return this._promiseFile(this.viewerPlayerglobalInfo.catalog, 'json');
                    case 3 /* ShellAbc */:
                        return this._promiseFile(this.shellPath, 'arraybuffer');
                    default:
                        return Promise.reject(new Error('Unsupported system resource id: ' + id));
                }
            };
            BrowserSystemResourcesLoadingService.prototype._promiseFile = function (path, responseType) {
                return new Promise(function (resolve, reject) {
                    Shumway.SWF.enterTimeline('Load file', path);
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', path);
                    xhr.responseType = responseType;
                    xhr.onload = function () {
                        Shumway.SWF.leaveTimeline();
                        var response = xhr.response;
                        if (response) {
                            if (responseType === 'json' && xhr.responseType !== 'json') {
                                // some browsers (e.g. Safari) have no idea what json is
                                response = JSON.parse(response);
                            }
                            resolve(response);
                        }
                        else {
                            reject('Unable to load ' + path + ': ' + xhr.statusText);
                        }
                    };
                    xhr.onerror = function () {
                        Shumway.SWF.leaveTimeline();
                        reject('Unable to load: xhr error');
                    };
                    xhr.send();
                });
            };
            return BrowserSystemResourcesLoadingService;
        })();
        Player.BrowserSystemResourcesLoadingService = BrowserSystemResourcesLoadingService;
        function qualifyLocalConnectionName(connectionName, assertNoPrefix) {
            release || Shumway.Debug.assert(typeof connectionName === 'string');
            // Connection names that don't start with "_" must be qualified with a domain prefix,
            // followed by ":". The prefix is supplied automatically based on the currently running
            // script. Only for LocalConnection#send is it allowed to already be contained in the name.
            if (!release && assertNoPrefix) {
                Shumway.Debug.assert(connectionName.indexOf(':') === -1);
            }
            if (connectionName[0] !== '_') {
                if (connectionName.indexOf(':') === -1) {
                    var currentURL = new jsGlobal.URL(Shumway.AVMX.getCurrentABC().env.url);
                    connectionName = currentURL.hostname + ':' + connectionName;
                }
                // Note: for LocalConnection#send, the name can contain an arbitrary number of ":" chars,
                // so no validity check is required.
                if (!release && assertNoPrefix) {
                    Shumway.Debug.assert(connectionName.split(':').length === 2);
                }
            }
            return connectionName;
        }
        /**
         * Creates a proper error object in the given SecurityDomain and fills it with information in
         * a way that makes it resemble the given (probably error) object as closely as possible while
         * at the same time guaranteeing that no code will be executed as a result of reading
         * properties of the object. Additionally, the created object can only be one of the builtin
         * Error classes.
         */
        function createErrorFromUnknownObject(sec, obj, defaultErrorClassName, defaultErrorInfo) {
            if (!obj || typeof obj !== 'object') {
                return sec.createError(defaultErrorClassName, defaultErrorInfo, obj);
            }
            var mn = obj.axClass ?
                obj.axClass.name :
                Shumway.AVMX.Multiname.FromFQNString('Error', 0 /* Public */);
            var axClass = sec.system.getProperty(mn, true, true);
            if (!sec.AXClass.axIsType(axClass)) {
                mn = Shumway.AVMX.Multiname.FromFQNString('Error', 0 /* Public */);
                axClass = sec.system.getProperty(mn, true, true);
                release || Shumway.Debug.assert(sec.AXClass.axIsType(axClass));
            }
            var messagePropDesc = Shumway.ObjectUtilities.getPropertyDescriptor(obj, '$Bgmessage');
            var message = messagePropDesc && messagePropDesc.value || '';
            var idPropDesc = Shumway.ObjectUtilities.getPropertyDescriptor(obj, '_errorID');
            var id = idPropDesc && idPropDesc.value || 0;
            return axClass.axConstruct([message, id]);
        }
        var BaseLocalConnectionService = (function () {
            function BaseLocalConnectionService() {
                this._localConnections = Object.create(null);
            }
            BaseLocalConnectionService.prototype.createConnection = function (connectionName, receiver) {
                return undefined;
            };
            BaseLocalConnectionService.prototype.closeConnection = function (connectionName, receiver) {
                return undefined;
            };
            BaseLocalConnectionService.prototype.hasConnection = function (connectionName) {
                return false;
            };
            BaseLocalConnectionService.prototype._sendMessage = function (connectionName, methodName, argsBuffer, sender, senderDomain, senderIsSecure) {
                return undefined;
            };
            BaseLocalConnectionService.prototype.send = function (connectionName, methodName, argsBuffer, sender, senderDomain, senderIsSecure) {
                connectionName = qualifyLocalConnectionName(connectionName, false);
                release || Shumway.Debug.assert(typeof methodName === 'string');
                release || Shumway.Debug.assert(argsBuffer instanceof ArrayBuffer);
                var self = this;
                function invokeMessageHandler() {
                    var status = self.hasConnection(connectionName) ? 'status' : 'error';
                    var statusEvent = new sender.sec.flash.events.StatusEvent('status', false, false, null, status);
                    try {
                        sender.dispatchEvent(statusEvent);
                    }
                    catch (e) {
                        console.warn("Exception encountered during statusEvent handling in LocalConnection" +
                            " sender.", e);
                    }
                    if (status === 'error') {
                        // If no receiver is found for the connectionName, we're done.
                        return;
                    }
                    release || Shumway.Debug.assert(typeof senderDomain === 'string');
                    release || Shumway.Debug.assert(typeof senderIsSecure === 'boolean');
                    self._sendMessage(connectionName, methodName, argsBuffer, sender, senderDomain, senderIsSecure);
                }
                Promise.resolve(true).then(invokeMessageHandler);
            };
            BaseLocalConnectionService.prototype.allowDomains = function (connectionName, receiver, domains, secure) {
                Shumway.Debug.somewhatImplemented('LocalConnection#allowDomain');
            };
            return BaseLocalConnectionService;
        })();
        Player.BaseLocalConnectionService = BaseLocalConnectionService;
        var ShumwayComLocalConnectionService = (function (_super) {
            __extends(ShumwayComLocalConnectionService, _super);
            function ShumwayComLocalConnectionService() {
                _super.apply(this, arguments);
            }
            ShumwayComLocalConnectionService.prototype.createConnection = function (connectionName, receiver) {
                connectionName = qualifyLocalConnectionName(connectionName, true);
                release || Shumway.Debug.assert(receiver);
                if (this.hasConnection(connectionName)) {
                    return -2 /* AlreadyTaken */;
                }
                function callback(methodName, argsBuffer) {
                    try {
                        receiver.handleMessage(methodName, argsBuffer);
                        return null;
                    }
                    catch (e) {
                        console.log('error under handleMessage: ', e);
                        return e;
                    }
                }
                var result = ShumwayCom.getLocalConnectionService().createLocalConnection(connectionName, callback);
                if (result !== 0 /* Success */) {
                    return result;
                }
                this._localConnections[connectionName] = receiver;
                return 0 /* Success */;
            };
            ShumwayComLocalConnectionService.prototype.closeConnection = function (connectionName, receiver) {
                connectionName = qualifyLocalConnectionName(connectionName, true);
                if (this._localConnections[connectionName] !== receiver) {
                    return -1 /* NotConnected */;
                }
                ShumwayCom.getLocalConnectionService().closeLocalConnection(connectionName);
                delete this._localConnections[connectionName];
                return 0 /* Success */;
            };
            ShumwayComLocalConnectionService.prototype.hasConnection = function (connectionName) {
                return ShumwayCom.getLocalConnectionService().hasLocalConnection(connectionName);
            };
            ShumwayComLocalConnectionService.prototype._sendMessage = function (connectionName, methodName, argsBuffer, sender, senderDomain, senderIsSecure) {
                var service = ShumwayCom.getLocalConnectionService();
                service.sendLocalConnectionMessage(connectionName, methodName, argsBuffer, sender, senderDomain, senderIsSecure);
            };
            ShumwayComLocalConnectionService.prototype.allowDomains = function (connectionName, receiver, domains, secure) {
                connectionName = qualifyLocalConnectionName(connectionName, true);
                if (this._localConnections[connectionName] !== receiver) {
                    console.warn('Trying to allow domains for invalid connection ' + connectionName);
                    return;
                }
                ShumwayCom.getLocalConnectionService().allowDomainsForLocalConnection(connectionName, domains, secure);
            };
            return ShumwayComLocalConnectionService;
        })(BaseLocalConnectionService);
        Player.ShumwayComLocalConnectionService = ShumwayComLocalConnectionService;
        var PlayerInternalLocalConnectionService = (function (_super) {
            __extends(PlayerInternalLocalConnectionService, _super);
            function PlayerInternalLocalConnectionService() {
                _super.apply(this, arguments);
            }
            PlayerInternalLocalConnectionService.prototype.createConnection = function (connectionName, receiver) {
                connectionName = qualifyLocalConnectionName(connectionName, true);
                release || Shumway.Debug.assert(receiver);
                if (this._localConnections[connectionName]) {
                    return -2 /* AlreadyTaken */;
                }
                this._localConnections[connectionName] = receiver;
                return 0 /* Success */;
            };
            PlayerInternalLocalConnectionService.prototype.closeConnection = function (connectionName, receiver) {
                connectionName = qualifyLocalConnectionName(connectionName, true);
                if (this._localConnections[connectionName] !== receiver) {
                    return -1 /* NotConnected */;
                }
                delete this._localConnections[connectionName];
                return 0 /* Success */;
            };
            PlayerInternalLocalConnectionService.prototype.hasConnection = function (connectionName) {
                return connectionName in this._localConnections;
            };
            PlayerInternalLocalConnectionService.prototype._sendMessage = function (connectionName, methodName, argsBuffer, sender, senderURL) {
                var receiver = this._localConnections[connectionName];
                release || Shumway.Debug.assert(receiver);
                try {
                    receiver.handleMessage(methodName, argsBuffer);
                }
                catch (e) {
                    Shumway.Debug.warning('Unexpected error encountered while sending LocalConnection message.');
                }
            };
            return PlayerInternalLocalConnectionService;
        })(BaseLocalConnectionService);
        Player.PlayerInternalLocalConnectionService = PlayerInternalLocalConnectionService;
    })(Player = Shumway.Player || (Shumway.Player = {}));
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
    var Player;
    (function (Player_2) {
        var Window;
        (function (Window) {
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var WindowGFXService = (function (_super) {
                __extends(WindowGFXService, _super);
                function WindowGFXService(sec, peer) {
                    _super.call(this, sec);
                    this._peer = peer;
                    this._peer.onAsyncMessage = function (msg) {
                        this.onWindowMessage(msg);
                    }.bind(this);
                    this._assetDecodingRequests = [];
                }
                WindowGFXService.prototype.update = function (updates, assets) {
                    var bytes = updates.getBytes();
                    var message = {
                        type: 'player',
                        updates: bytes,
                        assets: assets,
                        result: undefined
                    };
                    var transferList = [bytes.buffer];
                    this._peer.postAsyncMessage(message, transferList);
                };
                WindowGFXService.prototype.updateAndGet = function (updates, assets) {
                    var bytes = updates.getBytes();
                    var message = {
                        type: 'player',
                        updates: bytes,
                        assets: assets,
                        result: undefined
                    };
                    var result = this._peer.sendSyncMessage(message);
                    return DataBuffer.FromPlainObject(result);
                };
                WindowGFXService.prototype.frame = function () {
                    this._peer.postAsyncMessage({
                        type: 'frame'
                    });
                };
                WindowGFXService.prototype.videoControl = function (id, eventType, data) {
                    var message = {
                        type: 'videoControl',
                        id: id,
                        eventType: eventType,
                        data: data,
                        result: undefined
                    };
                    return this._peer.sendSyncMessage(message);
                };
                WindowGFXService.prototype.registerFont = function (syncId, data) {
                    var requestId = this._assetDecodingRequests.length;
                    var result = new Shumway.PromiseWrapper();
                    this._assetDecodingRequests[requestId] = result;
                    var message = {
                        type: 'registerFont',
                        syncId: syncId,
                        data: data,
                        requestId: requestId
                    };
                    // Unfortunately we have to make this message synchronously since scripts in the same frame
                    // might rely on it being available in the gfx backend when requesting text measurements.
                    // Just another disadvantage of not doing our our own text shaping.
                    this._peer.sendSyncMessage(message);
                    return result.promise;
                };
                WindowGFXService.prototype.registerImage = function (syncId, symbolId, imageType, data, alphaData) {
                    var requestId = this._assetDecodingRequests.length;
                    var result = new Shumway.PromiseWrapper();
                    this._assetDecodingRequests[requestId] = result;
                    var message = {
                        type: 'registerImage',
                        syncId: syncId,
                        symbolId: symbolId,
                        imageType: imageType,
                        data: data,
                        alphaData: alphaData,
                        requestId: requestId
                    };
                    this._peer.postAsyncMessage(message);
                    return result.promise;
                };
                WindowGFXService.prototype.fscommand = function (command, args) {
                    this._peer.postAsyncMessage({
                        type: 'fscommand',
                        command: command,
                        args: args
                    });
                };
                WindowGFXService.prototype.onWindowMessage = function (data) {
                    if (typeof data === 'object' && data !== null) {
                        switch (data.type) {
                            case 'gfx':
                                var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
                                var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
                                this.processUpdates(updates, data.assets);
                                break;
                            case 'videoPlayback':
                                this.processVideoEvent(data.id, data.eventType, data.data);
                                break;
                            case 'displayParameters':
                                this.processDisplayParameters(data.params);
                                break;
                            case 'registerFontResponse':
                            case 'registerImageResponse':
                                var request = this._assetDecodingRequests[data.requestId];
                                release || Shumway.Debug.assert(request);
                                delete this._assetDecodingRequests[data.requestId];
                                request.resolve(data.result);
                                break;
                            case 'options':
                                Shumway.Settings.setSettings(data.settings);
                                break;
                        }
                    }
                };
                return WindowGFXService;
            })(Player_2.GFXServiceBase);
            Window.WindowGFXService = WindowGFXService;
        })(Window = Player_2.Window || (Player_2.Window = {}));
    })(Player = Shumway.Player || (Shumway.Player = {}));
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
/// <reference path='../../build/ts/swf.d.ts' />
/// <reference path='../../build/ts/flash.d.ts' />
/// <reference path='../flash/avm1.d.ts' />
///<reference path='module.ts' />
///<reference path='settings.ts' />
///<reference path='frameScheduler.ts' />
///<reference path='remotingPlayer.ts' />
///<reference path='player.ts' />
///<reference path='avmLoader.ts' />
///<reference path='external.ts' />
///<reference path='window/windowPlayer.ts' />
//# sourceMappingURL=player.js.map