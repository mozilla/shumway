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
    var Tools;
    (function (Tools) {
        var Theme;
        (function (Theme) {
            var UI = (function () {
                function UI() {
                }
                UI.toRGBA = function (r, g, b, a) {
                    if (a === void 0) { a = 1; }
                    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
                };
                return UI;
            })();
            Theme.UI = UI;
            var UIThemeDark = (function () {
                function UIThemeDark() {
                }
                // Chrome Colors
                UIThemeDark.prototype.tabToolbar = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(37, 44, 51, a);
                };
                UIThemeDark.prototype.toolbars = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(52, 60, 69, a);
                };
                UIThemeDark.prototype.selectionBackground = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(29, 79, 115, a);
                };
                UIThemeDark.prototype.selectionText = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(245, 247, 250, a);
                };
                UIThemeDark.prototype.splitters = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(0, 0, 0, a);
                };
                // Content Colors
                UIThemeDark.prototype.bodyBackground = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(17, 19, 21, a);
                };
                UIThemeDark.prototype.sidebarBackground = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(24, 29, 32, a);
                };
                UIThemeDark.prototype.attentionBackground = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(161, 134, 80, a);
                };
                // Text Colors
                UIThemeDark.prototype.bodyText = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(143, 161, 178, a);
                };
                UIThemeDark.prototype.foregroundTextGrey = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(182, 186, 191, a);
                };
                UIThemeDark.prototype.contentTextHighContrast = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(169, 186, 203, a);
                };
                UIThemeDark.prototype.contentTextGrey = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(143, 161, 178, a);
                };
                UIThemeDark.prototype.contentTextDarkGrey = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(95, 115, 135, a);
                };
                // Highlight Colors
                UIThemeDark.prototype.blueHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(70, 175, 227, a);
                };
                UIThemeDark.prototype.purpleHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(107, 122, 187, a);
                };
                UIThemeDark.prototype.pinkHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(223, 128, 255, a);
                };
                UIThemeDark.prototype.redHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(235, 83, 104, a);
                };
                UIThemeDark.prototype.orangeHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(217, 102, 41, a);
                };
                UIThemeDark.prototype.lightOrangeHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(217, 155, 40, a);
                };
                UIThemeDark.prototype.greenHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(112, 191, 83, a);
                };
                UIThemeDark.prototype.blueGreyHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(94, 136, 176, a);
                };
                return UIThemeDark;
            })();
            Theme.UIThemeDark = UIThemeDark;
            var UIThemeLight = (function () {
                function UIThemeLight() {
                }
                // Chrome Colors
                UIThemeLight.prototype.tabToolbar = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(235, 236, 237, a);
                };
                UIThemeLight.prototype.toolbars = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(240, 241, 242, a);
                };
                UIThemeLight.prototype.selectionBackground = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(76, 158, 217, a);
                };
                UIThemeLight.prototype.selectionText = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(245, 247, 250, a);
                };
                UIThemeLight.prototype.splitters = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(170, 170, 170, a);
                };
                // Content Colors
                UIThemeLight.prototype.bodyBackground = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(252, 252, 252, a);
                };
                UIThemeLight.prototype.sidebarBackground = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(247, 247, 247, a);
                };
                UIThemeLight.prototype.attentionBackground = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(161, 134, 80, a);
                };
                // Text Colors
                UIThemeLight.prototype.bodyText = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(24, 25, 26, a);
                };
                UIThemeLight.prototype.foregroundTextGrey = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(88, 89, 89, a);
                };
                UIThemeLight.prototype.contentTextHighContrast = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(41, 46, 51, a);
                };
                UIThemeLight.prototype.contentTextGrey = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(143, 161, 178, a);
                };
                UIThemeLight.prototype.contentTextDarkGrey = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(102, 115, 128, a);
                };
                // Highlight Colors
                UIThemeLight.prototype.blueHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(0, 136, 204, a);
                };
                UIThemeLight.prototype.purpleHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(91, 95, 255, a);
                };
                UIThemeLight.prototype.pinkHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(184, 46, 229, a);
                };
                UIThemeLight.prototype.redHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(237, 38, 85, a);
                };
                UIThemeLight.prototype.orangeHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(241, 60, 0, a);
                };
                UIThemeLight.prototype.lightOrangeHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(217, 126, 0, a);
                };
                UIThemeLight.prototype.greenHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(44, 187, 15, a);
                };
                UIThemeLight.prototype.blueGreyHighlight = function (a) {
                    if (a === void 0) { a = 1; }
                    return UI.toRGBA(95, 136, 176, a);
                };
                return UIThemeLight;
            })();
            Theme.UIThemeLight = UIThemeLight;
        })(Theme = Tools.Theme || (Tools.Theme = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            var Profile = (function () {
                function Profile(buffers, startTime) {
                    this._buffers = buffers || [];
                    this._snapshots = [];
                    this._startTime = startTime;
                    this._windowStart = startTime;
                    this._maxDepth = 0;
                }
                Profile.prototype.addBuffer = function (buffer) {
                    this._buffers.push(buffer);
                };
                Profile.prototype.getSnapshotAt = function (index) {
                    return this._snapshots[index];
                };
                Object.defineProperty(Profile.prototype, "hasSnapshots", {
                    get: function () {
                        return (this.snapshotCount > 0);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Profile.prototype, "snapshotCount", {
                    get: function () {
                        return this._snapshots.length;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Profile.prototype, "startTime", {
                    get: function () {
                        return this._startTime;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Profile.prototype, "endTime", {
                    get: function () {
                        return this._endTime;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Profile.prototype, "totalTime", {
                    get: function () {
                        return this.endTime - this.startTime;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Profile.prototype, "windowStart", {
                    get: function () {
                        return this._windowStart;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Profile.prototype, "windowEnd", {
                    get: function () {
                        return this._windowEnd;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Profile.prototype, "windowLength", {
                    get: function () {
                        return this.windowEnd - this.windowStart;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Profile.prototype, "maxDepth", {
                    get: function () {
                        return this._maxDepth;
                    },
                    enumerable: true,
                    configurable: true
                });
                Profile.prototype.forEachSnapshot = function (visitor) {
                    for (var i = 0, n = this.snapshotCount; i < n; i++) {
                        visitor(this._snapshots[i], i);
                    }
                };
                Profile.prototype.createSnapshots = function () {
                    var endTime = Number.MIN_VALUE;
                    var maxDepth = 0;
                    this._snapshots = [];
                    while (this._buffers.length > 0) {
                        var buffer = this._buffers.shift();
                        var snapshot = buffer.createSnapshot();
                        if (snapshot) {
                            if (endTime < snapshot.endTime) {
                                endTime = snapshot.endTime;
                            }
                            if (maxDepth < snapshot.maxDepth) {
                                maxDepth = snapshot.maxDepth;
                            }
                            this._snapshots.push(snapshot);
                        }
                    }
                    this._endTime = endTime;
                    this._windowEnd = endTime;
                    this._maxDepth = maxDepth;
                };
                Profile.prototype.setWindow = function (start, end) {
                    if (start > end) {
                        var tmp = start;
                        start = end;
                        end = tmp;
                    }
                    var length = Math.min(end - start, this.totalTime);
                    if (start < this._startTime) {
                        start = this._startTime;
                        end = this._startTime + length;
                    }
                    else if (end > this._endTime) {
                        start = this._endTime - length;
                        end = this._endTime;
                    }
                    this._windowStart = start;
                    this._windowEnd = end;
                };
                Profile.prototype.moveWindowTo = function (time) {
                    this.setWindow(time - this.windowLength / 2, time + this.windowLength / 2);
                };
                return Profile;
            })();
            Profiler.Profile = Profile;
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
})(Shumway || (Shumway = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            var TimelineFrameStatistics = (function () {
                function TimelineFrameStatistics(kind) {
                    this.kind = kind;
                    this.count = 0;
                    this.selfTime = 0;
                    this.totalTime = 0;
                }
                return TimelineFrameStatistics;
            })();
            Profiler.TimelineFrameStatistics = TimelineFrameStatistics;
            /**
             * Represents a single timeline frame range and makes it easier to work with the compacted
             * timeline buffer data.
             */
            var TimelineFrame = (function () {
                function TimelineFrame(parent, kind, startData, endData, startTime, endTime) {
                    this.parent = parent;
                    this.kind = kind;
                    this.startData = startData;
                    this.endData = endData;
                    this.startTime = startTime;
                    this.endTime = endTime;
                    this.maxDepth = 0;
                }
                Object.defineProperty(TimelineFrame.prototype, "totalTime", {
                    get: function () {
                        return this.endTime - this.startTime;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TimelineFrame.prototype, "selfTime", {
                    get: function () {
                        var selfTime = this.totalTime;
                        if (this.children) {
                            for (var i = 0, n = this.children.length; i < n; i++) {
                                var child = this.children[i];
                                selfTime -= (child.endTime - child.startTime);
                            }
                        }
                        return selfTime;
                    },
                    enumerable: true,
                    configurable: true
                });
                /**
                 * Gets the child index of the first child to overlap the specified time.
                 */
                TimelineFrame.prototype.getChildIndex = function (time) {
                    var children = this.children;
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (child.endTime > time) {
                            return i;
                        }
                    }
                    return 0;
                };
                /**
                 * Gets the high and low index of the children that intersect the specified time range.
                 */
                TimelineFrame.prototype.getChildRange = function (startTime, endTime) {
                    if (this.children && startTime <= this.endTime && endTime >= this.startTime && endTime >= startTime) {
                        var startIdx = this._getNearestChild(startTime);
                        var endIdx = this._getNearestChildReverse(endTime);
                        if (startIdx <= endIdx) {
                            var startTime = this.children[startIdx].startTime;
                            var endTime = this.children[endIdx].endTime;
                            return {
                                startIndex: startIdx,
                                endIndex: endIdx,
                                startTime: startTime,
                                endTime: endTime,
                                totalTime: endTime - startTime
                            };
                        }
                    }
                    return null;
                };
                TimelineFrame.prototype._getNearestChild = function (time) {
                    var children = this.children;
                    if (children && children.length) {
                        if (time <= children[0].endTime) {
                            return 0;
                        }
                        var imid;
                        var imin = 0;
                        var imax = children.length - 1;
                        while (imax > imin) {
                            imid = ((imin + imax) / 2) | 0;
                            var child = children[imid];
                            if (time >= child.startTime && time <= child.endTime) {
                                return imid;
                            }
                            else if (time > child.endTime) {
                                imin = imid + 1;
                            }
                            else {
                                imax = imid;
                            }
                        }
                        return Math.ceil((imin + imax) / 2);
                    }
                    else {
                        return 0;
                    }
                };
                TimelineFrame.prototype._getNearestChildReverse = function (time) {
                    var children = this.children;
                    if (children && children.length) {
                        var imax = children.length - 1;
                        if (time >= children[imax].startTime) {
                            return imax;
                        }
                        var imid;
                        var imin = 0;
                        while (imax > imin) {
                            imid = Math.ceil((imin + imax) / 2);
                            var child = children[imid];
                            if (time >= child.startTime && time <= child.endTime) {
                                return imid;
                            }
                            else if (time > child.endTime) {
                                imin = imid;
                            }
                            else {
                                imax = imid - 1;
                            }
                        }
                        return ((imin + imax) / 2) | 0;
                    }
                    else {
                        return 0;
                    }
                };
                /**
                 * Finds the deepest child that intersects with the specified time.
                 */
                TimelineFrame.prototype.query = function (time) {
                    if (time < this.startTime || time > this.endTime) {
                        return null;
                    }
                    var children = this.children;
                    if (children && children.length > 0) {
                        var child;
                        var imin = 0;
                        var imax = children.length - 1;
                        while (imax > imin) {
                            var imid = ((imin + imax) / 2) | 0;
                            child = children[imid];
                            if (time >= child.startTime && time <= child.endTime) {
                                return child.query(time);
                            }
                            else if (time > child.endTime) {
                                imin = imid + 1;
                            }
                            else {
                                imax = imid;
                            }
                        }
                        child = children[imax];
                        if (time >= child.startTime && time <= child.endTime) {
                            return child.query(time);
                        }
                    }
                    return this;
                };
                /**
                 * When querying a series of samples, if the deepest child for the previous time is known,
                 * it is faster to go up the tree from there, until a frame is found that contains the next time,
                 * and then go back down.
                 *
                 * More often than not we don't have to start at the very top.
                 */
                TimelineFrame.prototype.queryNext = function (time) {
                    var frame = this;
                    while (time > frame.endTime) {
                        if (frame.parent) {
                            frame = frame.parent;
                        }
                        else {
                            return frame.query(time);
                        }
                    }
                    return frame.query(time);
                };
                /**
               * Gets this frame's distance to the root.
               */
                TimelineFrame.prototype.getDepth = function () {
                    var depth = 0;
                    var self = this;
                    while (self) {
                        depth++;
                        self = self.parent;
                    }
                    return depth;
                };
                TimelineFrame.prototype.calculateStatistics = function () {
                    var statistics = this.statistics = [];
                    function visit(frame) {
                        if (frame.kind) {
                            var s = statistics[frame.kind.id] || (statistics[frame.kind.id] = new TimelineFrameStatistics(frame.kind));
                            s.count++;
                            s.selfTime += frame.selfTime;
                            s.totalTime += frame.totalTime;
                        }
                        if (frame.children) {
                            frame.children.forEach(visit);
                        }
                    }
                    visit(this);
                };
                TimelineFrame.prototype.trace = function (writer) {
                    var s = (this.kind ? this.kind.name + ": " : "Profile: ") + (this.endTime - this.startTime).toFixed(2);
                    if (this.children && this.children.length) {
                        writer.enter(s);
                        for (var i = 0; i < this.children.length; i++) {
                            this.children[i].trace(writer);
                        }
                        writer.outdent();
                    }
                    else {
                        writer.writeLn(s);
                    }
                };
                return TimelineFrame;
            })();
            Profiler.TimelineFrame = TimelineFrame;
            var TimelineBufferSnapshot = (function (_super) {
                __extends(TimelineBufferSnapshot, _super);
                function TimelineBufferSnapshot(name) {
                    _super.call(this, null, null, null, null, NaN, NaN);
                    this.name = name;
                }
                return TimelineBufferSnapshot;
            })(TimelineFrame);
            Profiler.TimelineBufferSnapshot = TimelineBufferSnapshot;
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            /**
             * Records enter / leave events in two circular buffers.
             * The goal here is to be able to handle large amounts of data.
             */
            var TimelineBuffer = (function () {
                function TimelineBuffer(name, startTime) {
                    if (name === void 0) { name = ""; }
                    this.name = name || "";
                    this._startTime = Shumway.isNullOrUndefined(startTime) ? jsGlobal.START_TIME : startTime;
                }
                TimelineBuffer.prototype.getKind = function (kind) {
                    return this._kinds[kind];
                };
                Object.defineProperty(TimelineBuffer.prototype, "kinds", {
                    get: function () {
                        return this._kinds.concat();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(TimelineBuffer.prototype, "depth", {
                    get: function () {
                        return this._depth;
                    },
                    enumerable: true,
                    configurable: true
                });
                TimelineBuffer.prototype._initialize = function () {
                    this._depth = 0;
                    this._stack = [];
                    this._data = [];
                    this._kinds = [];
                    this._kindNameMap = Object.create(null);
                    this._marks = new Shumway.CircularBuffer(Int32Array, 20);
                    this._times = new Shumway.CircularBuffer(Float64Array, 20);
                };
                TimelineBuffer.prototype._getKindId = function (name) {
                    var kindId = TimelineBuffer.MAX_KINDID;
                    if (this._kindNameMap[name] === undefined) {
                        kindId = this._kinds.length;
                        if (kindId < TimelineBuffer.MAX_KINDID) {
                            var kind = {
                                id: kindId,
                                name: name,
                                visible: true
                            };
                            this._kinds.push(kind);
                            this._kindNameMap[name] = kind;
                        }
                        else {
                            kindId = TimelineBuffer.MAX_KINDID;
                        }
                    }
                    else {
                        kindId = this._kindNameMap[name].id;
                    }
                    return kindId;
                };
                TimelineBuffer.prototype._getMark = function (type, kindId, data) {
                    var dataId = TimelineBuffer.MAX_DATAID;
                    if (!Shumway.isNullOrUndefined(data) && kindId !== TimelineBuffer.MAX_KINDID) {
                        dataId = this._data.length;
                        if (dataId < TimelineBuffer.MAX_DATAID) {
                            this._data.push(data);
                        }
                        else {
                            dataId = TimelineBuffer.MAX_DATAID;
                        }
                    }
                    return type | (dataId << 16) | kindId;
                };
                TimelineBuffer.prototype.enter = function (name, data, time) {
                    time = (Shumway.isNullOrUndefined(time) ? performance.now() : time) - this._startTime;
                    if (!this._marks) {
                        this._initialize();
                    }
                    this._depth++;
                    var kindId = this._getKindId(name);
                    this._marks.write(this._getMark(TimelineBuffer.ENTER, kindId, data));
                    this._times.write(time);
                    this._stack.push(kindId);
                };
                TimelineBuffer.prototype.leave = function (name, data, time) {
                    time = (Shumway.isNullOrUndefined(time) ? performance.now() : time) - this._startTime;
                    var kindId = this._stack.pop();
                    if (name) {
                        kindId = this._getKindId(name);
                    }
                    this._marks.write(this._getMark(TimelineBuffer.LEAVE, kindId, data));
                    this._times.write(time);
                    this._depth--;
                };
                TimelineBuffer.prototype.count = function (name, value, data) {
                    // Not Implemented
                };
                /**
                 * Constructs an easier to work with TimelineFrame data structure.
                 */
                TimelineBuffer.prototype.createSnapshot = function (count) {
                    if (count === void 0) { count = Number.MAX_VALUE; }
                    if (!this._marks) {
                        return null;
                    }
                    var times = this._times;
                    var kinds = this._kinds;
                    var datastore = this._data;
                    var snapshot = new Profiler.TimelineBufferSnapshot(this.name);
                    var stack = [snapshot];
                    var topLevelFrameCount = 0;
                    if (!this._marks) {
                        this._initialize();
                    }
                    this._marks.forEachInReverse(function (mark, i) {
                        var dataId = (mark >>> 16) & TimelineBuffer.MAX_DATAID;
                        var data = datastore[dataId];
                        var kindId = mark & TimelineBuffer.MAX_KINDID;
                        var kind = kinds[kindId];
                        if (Shumway.isNullOrUndefined(kind) || kind.visible) {
                            var action = mark & 0x80000000;
                            var time = times.get(i);
                            var stackLength = stack.length;
                            if (action === TimelineBuffer.LEAVE) {
                                if (stackLength === 1) {
                                    topLevelFrameCount++;
                                    if (topLevelFrameCount > count) {
                                        return true;
                                    }
                                }
                                stack.push(new Profiler.TimelineFrame(stack[stackLength - 1], kind, null, data, NaN, time));
                            }
                            else if (action === TimelineBuffer.ENTER) {
                                var node = stack.pop();
                                var top = stack[stack.length - 1];
                                if (top) {
                                    if (!top.children) {
                                        top.children = [node];
                                    }
                                    else {
                                        top.children.unshift(node);
                                    }
                                    var currentDepth = stack.length;
                                    node.depth = currentDepth;
                                    node.startData = data;
                                    node.startTime = time;
                                    while (node) {
                                        if (node.maxDepth < currentDepth) {
                                            node.maxDepth = currentDepth;
                                            node = node.parent;
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                }
                                else {
                                    return true;
                                }
                            }
                        }
                    });
                    if (snapshot.children && snapshot.children.length) {
                        snapshot.startTime = snapshot.children[0].startTime;
                        snapshot.endTime = snapshot.children[snapshot.children.length - 1].endTime;
                    }
                    return snapshot;
                };
                TimelineBuffer.prototype.reset = function (startTime) {
                    this._startTime = Shumway.isNullOrUndefined(startTime) ? performance.now() : startTime;
                    if (!this._marks) {
                        this._initialize();
                        return;
                    }
                    this._depth = 0;
                    this._data = [];
                    this._marks.reset();
                    this._times.reset();
                };
                TimelineBuffer.FromFirefoxProfile = function (profile, name) {
                    var samples = profile.profile.threads[0].samples;
                    var buffer = new TimelineBuffer(name, samples[0].time);
                    var currentStack = [];
                    var sample;
                    for (var i = 0; i < samples.length; i++) {
                        sample = samples[i];
                        var time = sample.time;
                        var stack = sample.frames;
                        var j = 0;
                        var minStackLen = Math.min(stack.length, currentStack.length);
                        while (j < minStackLen && stack[j].location === currentStack[j].location) {
                            j++;
                        }
                        var leaveCount = currentStack.length - j;
                        for (var k = 0; k < leaveCount; k++) {
                            sample = currentStack.pop();
                            buffer.leave(sample.location, null, time);
                        }
                        while (j < stack.length) {
                            sample = stack[j++];
                            buffer.enter(sample.location, null, time);
                        }
                        currentStack = stack;
                    }
                    while (sample = currentStack.pop()) {
                        buffer.leave(sample.location, null, time);
                    }
                    return buffer;
                };
                TimelineBuffer.FromChromeProfile = function (profile, name) {
                    var timestamps = profile.timestamps;
                    var samples = profile.samples;
                    var buffer = new TimelineBuffer(name, timestamps[0] / 1000);
                    var currentStack = [];
                    var idMap = {};
                    var sample;
                    TimelineBuffer._resolveIds(profile.head, idMap);
                    for (var i = 0; i < timestamps.length; i++) {
                        var time = timestamps[i] / 1000;
                        var stack = [];
                        sample = idMap[samples[i]];
                        while (sample) {
                            stack.unshift(sample);
                            sample = sample.parent;
                        }
                        var j = 0;
                        var minStackLen = Math.min(stack.length, currentStack.length);
                        while (j < minStackLen && stack[j] === currentStack[j]) {
                            j++;
                        }
                        var leaveCount = currentStack.length - j;
                        for (var k = 0; k < leaveCount; k++) {
                            sample = currentStack.pop();
                            buffer.leave(sample.functionName, null, time);
                        }
                        while (j < stack.length) {
                            sample = stack[j++];
                            buffer.enter(sample.functionName, null, time);
                        }
                        currentStack = stack;
                    }
                    while (sample = currentStack.pop()) {
                        buffer.leave(sample.functionName, null, time);
                    }
                    return buffer;
                };
                TimelineBuffer._resolveIds = function (parent, idMap) {
                    idMap[parent.id] = parent;
                    if (parent.children) {
                        for (var i = 0; i < parent.children.length; i++) {
                            parent.children[i].parent = parent;
                            TimelineBuffer._resolveIds(parent.children[i], idMap);
                        }
                    }
                };
                TimelineBuffer.ENTER = 0 << 31;
                TimelineBuffer.LEAVE = 1 << 31;
                TimelineBuffer.MAX_KINDID = 0xffff;
                TimelineBuffer.MAX_DATAID = 0x7fff;
                return TimelineBuffer;
            })();
            Profiler.TimelineBuffer = TimelineBuffer;
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            (function (UIThemeType) {
                UIThemeType[UIThemeType["DARK"] = 0] = "DARK";
                UIThemeType[UIThemeType["LIGHT"] = 1] = "LIGHT";
            })(Profiler.UIThemeType || (Profiler.UIThemeType = {}));
            var UIThemeType = Profiler.UIThemeType;
            var Controller = (function () {
                function Controller(container, themeType) {
                    if (themeType === void 0) { themeType = 0 /* DARK */; }
                    this._container = container;
                    this._headers = [];
                    this._charts = [];
                    this._profiles = [];
                    this._activeProfile = null;
                    this.themeType = themeType;
                    this._tooltip = this._createTooltip();
                }
                Controller.prototype.createProfile = function (buffers, startTime) {
                    var profile = new Profiler.Profile(buffers, startTime);
                    profile.createSnapshots();
                    this._profiles.push(profile);
                    this.activateProfile(profile);
                    return profile;
                };
                Controller.prototype.activateProfile = function (profile) {
                    this.deactivateProfile();
                    this._activeProfile = profile;
                    this._createViews();
                    this._initializeViews();
                };
                Controller.prototype.activateProfileAt = function (index) {
                    this.activateProfile(this.getProfileAt(index));
                };
                Controller.prototype.deactivateProfile = function () {
                    if (this._activeProfile) {
                        this._destroyViews();
                        this._activeProfile = null;
                    }
                };
                Controller.prototype.resize = function () {
                    this._onResize();
                };
                Controller.prototype.getProfileAt = function (index) {
                    return this._profiles[index];
                };
                Object.defineProperty(Controller.prototype, "activeProfile", {
                    get: function () {
                        return this._activeProfile;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Controller.prototype, "profileCount", {
                    get: function () {
                        return this._profiles.length;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Controller.prototype, "container", {
                    get: function () {
                        return this._container;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Controller.prototype, "themeType", {
                    get: function () {
                        return this._themeType;
                    },
                    set: function (value) {
                        switch (value) {
                            case 0 /* DARK */:
                                this._theme = new Tools.Theme.UIThemeDark();
                                break;
                            case 1 /* LIGHT */:
                                this._theme = new Tools.Theme.UIThemeLight();
                                break;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Controller.prototype, "theme", {
                    get: function () {
                        return this._theme;
                    },
                    enumerable: true,
                    configurable: true
                });
                Controller.prototype.getSnapshotAt = function (index) {
                    return this._activeProfile.getSnapshotAt(index);
                };
                Controller.prototype._createViews = function () {
                    if (this._activeProfile) {
                        var self = this;
                        this._overviewHeader = new Profiler.FlameChartHeader(this, 0 /* OVERVIEW */);
                        this._overview = new Profiler.FlameChartOverview(this, 0 /* OVERLAY */);
                        this._activeProfile.forEachSnapshot(function (snapshot, index) {
                            self._headers.push(new Profiler.FlameChartHeader(self, 1 /* CHART */));
                            self._charts.push(new Profiler.FlameChart(self, snapshot));
                        });
                        window.addEventListener("resize", this._onResize.bind(this));
                    }
                };
                Controller.prototype._destroyViews = function () {
                    if (this._activeProfile) {
                        this._overviewHeader.destroy();
                        this._overview.destroy();
                        while (this._headers.length) {
                            this._headers.pop().destroy();
                        }
                        while (this._charts.length) {
                            this._charts.pop().destroy();
                        }
                        window.removeEventListener("resize", this._onResize.bind(this));
                    }
                };
                Controller.prototype._initializeViews = function () {
                    if (this._activeProfile) {
                        var self = this;
                        var startTime = this._activeProfile.startTime;
                        var endTime = this._activeProfile.endTime;
                        this._overviewHeader.initialize(startTime, endTime);
                        this._overview.initialize(startTime, endTime);
                        this._activeProfile.forEachSnapshot(function (snapshot, index) {
                            self._headers[index].initialize(startTime, endTime);
                            self._charts[index].initialize(startTime, endTime);
                        });
                    }
                };
                Controller.prototype._onResize = function () {
                    if (this._activeProfile) {
                        var self = this;
                        var width = this._container.offsetWidth;
                        this._overviewHeader.setSize(width);
                        this._overview.setSize(width);
                        this._activeProfile.forEachSnapshot(function (snapshot, index) {
                            self._headers[index].setSize(width);
                            self._charts[index].setSize(width);
                        });
                    }
                };
                Controller.prototype._updateViews = function () {
                    if (this._activeProfile) {
                        var self = this;
                        var start = this._activeProfile.windowStart;
                        var end = this._activeProfile.windowEnd;
                        this._overviewHeader.setWindow(start, end);
                        this._overview.setWindow(start, end);
                        this._activeProfile.forEachSnapshot(function (snapshot, index) {
                            self._headers[index].setWindow(start, end);
                            self._charts[index].setWindow(start, end);
                        });
                    }
                };
                Controller.prototype._drawViews = function () {
                    /*
                    var self = this;
                    this._overviewHeader.draw();
                    this._overview.setWindow(start, end);
                    this._profile.forEachBuffer(function(buffer: TimelineBufferSnapshot, index: number) {
                      self._headers[index].setWindow(start, end);
                      self._charts[index].setWindow(start, end);
                    });
                    */
                };
                Controller.prototype._createTooltip = function () {
                    var el = document.createElement("div");
                    el.classList.add("profiler-tooltip");
                    el.style.display = "none";
                    this._container.insertBefore(el, this._container.firstChild);
                    return el;
                };
                /**
                 * View callbacks
                 */
                Controller.prototype.setWindow = function (start, end) {
                    this._activeProfile.setWindow(start, end);
                    this._updateViews();
                };
                Controller.prototype.moveWindowTo = function (time) {
                    this._activeProfile.moveWindowTo(time);
                    this._updateViews();
                };
                Controller.prototype.showTooltip = function (chart, frame, x, y) {
                    this.removeTooltipContent();
                    this._tooltip.appendChild(this.createTooltipContent(chart, frame));
                    this._tooltip.style.display = "block";
                    var elContent = this._tooltip.firstChild;
                    var tooltipWidth = elContent.clientWidth;
                    var tooltipHeight = elContent.clientHeight;
                    var totalWidth = chart.canvas.clientWidth;
                    x += (x + tooltipWidth >= totalWidth - 50) ? -(tooltipWidth + 20) : 25;
                    y += chart.canvas.offsetTop - tooltipHeight / 2;
                    this._tooltip.style.left = x + "px";
                    this._tooltip.style.top = y + "px";
                };
                Controller.prototype.hideTooltip = function () {
                    this._tooltip.style.display = "none";
                };
                Controller.prototype.createTooltipContent = function (chart, frame) {
                    var totalTime = Math.round(frame.totalTime * 100000) / 100000;
                    var selfTime = Math.round(frame.selfTime * 100000) / 100000;
                    var selfPercent = Math.round(frame.selfTime * 100 * 100 / frame.totalTime) / 100;
                    var elContent = document.createElement("div");
                    var elName = document.createElement("h1");
                    elName.textContent = frame.kind.name;
                    elContent.appendChild(elName);
                    var elTotalTime = document.createElement("p");
                    elTotalTime.textContent = "Total: " + totalTime + " ms";
                    elContent.appendChild(elTotalTime);
                    var elSelfTime = document.createElement("p");
                    elSelfTime.textContent = "Self: " + selfTime + " ms (" + selfPercent + "%)";
                    elContent.appendChild(elSelfTime);
                    var statistics = chart.getStatistics(frame.kind);
                    if (statistics) {
                        var elAllCount = document.createElement("p");
                        elAllCount.textContent = "Count: " + statistics.count;
                        elContent.appendChild(elAllCount);
                        var allTotalTime = Math.round(statistics.totalTime * 100000) / 100000;
                        var elAllTotalTime = document.createElement("p");
                        elAllTotalTime.textContent = "All Total: " + allTotalTime + " ms";
                        elContent.appendChild(elAllTotalTime);
                        var allSelfTime = Math.round(statistics.selfTime * 100000) / 100000;
                        var elAllSelfTime = document.createElement("p");
                        elAllSelfTime.textContent = "All Self: " + allSelfTime + " ms";
                        elContent.appendChild(elAllSelfTime);
                    }
                    this.appendDataElements(elContent, frame.startData);
                    this.appendDataElements(elContent, frame.endData);
                    return elContent;
                };
                Controller.prototype.appendDataElements = function (el, data) {
                    if (!Shumway.isNullOrUndefined(data)) {
                        el.appendChild(document.createElement("hr"));
                        var elData;
                        if (Shumway.isObject(data)) {
                            for (var key in data) {
                                elData = document.createElement("p");
                                elData.textContent = key + ": " + data[key];
                                el.appendChild(elData);
                            }
                        }
                        else {
                            elData = document.createElement("p");
                            elData.textContent = data.toString();
                            el.appendChild(elData);
                        }
                    }
                };
                Controller.prototype.removeTooltipContent = function () {
                    var el = this._tooltip;
                    while (el.firstChild) {
                        el.removeChild(el.firstChild);
                    }
                };
                return Controller;
            })();
            Profiler.Controller = Controller;
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            var clamp = Shumway.NumberUtilities.clamp;
            var MouseCursor = (function () {
                function MouseCursor(value) {
                    this.value = value;
                }
                MouseCursor.prototype.toString = function () {
                    return this.value;
                };
                MouseCursor.AUTO = new MouseCursor("auto");
                MouseCursor.DEFAULT = new MouseCursor("default");
                MouseCursor.NONE = new MouseCursor("none");
                MouseCursor.HELP = new MouseCursor("help");
                MouseCursor.POINTER = new MouseCursor("pointer");
                MouseCursor.PROGRESS = new MouseCursor("progress");
                MouseCursor.WAIT = new MouseCursor("wait");
                MouseCursor.CELL = new MouseCursor("cell");
                MouseCursor.CROSSHAIR = new MouseCursor("crosshair");
                MouseCursor.TEXT = new MouseCursor("text");
                MouseCursor.ALIAS = new MouseCursor("alias");
                MouseCursor.COPY = new MouseCursor("copy");
                MouseCursor.MOVE = new MouseCursor("move");
                MouseCursor.NO_DROP = new MouseCursor("no-drop");
                MouseCursor.NOT_ALLOWED = new MouseCursor("not-allowed");
                MouseCursor.ALL_SCROLL = new MouseCursor("all-scroll");
                MouseCursor.COL_RESIZE = new MouseCursor("col-resize");
                MouseCursor.ROW_RESIZE = new MouseCursor("row-resize");
                MouseCursor.N_RESIZE = new MouseCursor("n-resize");
                MouseCursor.E_RESIZE = new MouseCursor("e-resize");
                MouseCursor.S_RESIZE = new MouseCursor("s-resize");
                MouseCursor.W_RESIZE = new MouseCursor("w-resize");
                MouseCursor.NE_RESIZE = new MouseCursor("ne-resize");
                MouseCursor.NW_RESIZE = new MouseCursor("nw-resize");
                MouseCursor.SE_RESIZE = new MouseCursor("se-resize");
                MouseCursor.SW_RESIZE = new MouseCursor("sw-resize");
                MouseCursor.EW_RESIZE = new MouseCursor("ew-resize");
                MouseCursor.NS_RESIZE = new MouseCursor("ns-resize");
                MouseCursor.NESW_RESIZE = new MouseCursor("nesw-resize");
                MouseCursor.NWSE_RESIZE = new MouseCursor("nwse-resize");
                MouseCursor.ZOOM_IN = new MouseCursor("zoom-in");
                MouseCursor.ZOOM_OUT = new MouseCursor("zoom-out");
                MouseCursor.GRAB = new MouseCursor("grab");
                MouseCursor.GRABBING = new MouseCursor("grabbing");
                return MouseCursor;
            })();
            Profiler.MouseCursor = MouseCursor;
            var MouseController = (function () {
                function MouseController(target, eventTarget) {
                    this._target = target;
                    this._eventTarget = eventTarget;
                    this._wheelDisabled = false;
                    this._boundOnMouseDown = this._onMouseDown.bind(this);
                    this._boundOnMouseUp = this._onMouseUp.bind(this);
                    this._boundOnMouseOver = this._onMouseOver.bind(this);
                    this._boundOnMouseOut = this._onMouseOut.bind(this);
                    this._boundOnMouseMove = this._onMouseMove.bind(this);
                    this._boundOnMouseWheel = this._onMouseWheel.bind(this);
                    this._boundOnDrag = this._onDrag.bind(this);
                    eventTarget.addEventListener("mousedown", this._boundOnMouseDown, false);
                    eventTarget.addEventListener("mouseover", this._boundOnMouseOver, false);
                    eventTarget.addEventListener("mouseout", this._boundOnMouseOut, false);
                    eventTarget.addEventListener(("onwheel" in document ? "wheel" : "mousewheel"), this._boundOnMouseWheel, false);
                }
                MouseController.prototype.destroy = function () {
                    var eventTarget = this._eventTarget;
                    eventTarget.removeEventListener("mousedown", this._boundOnMouseDown);
                    eventTarget.removeEventListener("mouseover", this._boundOnMouseOver);
                    eventTarget.removeEventListener("mouseout", this._boundOnMouseOut);
                    eventTarget.removeEventListener(("onwheel" in document ? "wheel" : "mousewheel"), this._boundOnMouseWheel);
                    window.removeEventListener("mousemove", this._boundOnDrag);
                    window.removeEventListener("mouseup", this._boundOnMouseUp);
                    this._killHoverCheck();
                    this._eventTarget = null;
                    this._target = null;
                };
                MouseController.prototype.updateCursor = function (cursor) {
                    if (!MouseController._cursorOwner || MouseController._cursorOwner === this._target) {
                        var el = this._eventTarget.parentElement;
                        if (MouseController._cursor !== cursor) {
                            MouseController._cursor = cursor;
                            var self = this;
                            ["", "-moz-", "-webkit-"].forEach(function (prefix) {
                                el.style.cursor = prefix + cursor;
                            });
                        }
                        if (MouseController._cursor === MouseCursor.DEFAULT) {
                            MouseController._cursorOwner = null;
                        }
                        else {
                            MouseController._cursorOwner = this._target;
                        }
                    }
                };
                MouseController.prototype._onMouseDown = function (event) {
                    this._killHoverCheck();
                    if (event.button === 0) {
                        var pos = this._getTargetMousePos(event, (event.target));
                        this._dragInfo = {
                            start: pos,
                            current: pos,
                            delta: { x: 0, y: 0 },
                            hasMoved: false,
                            originalTarget: event.target
                        };
                        window.addEventListener("mousemove", this._boundOnDrag, false);
                        window.addEventListener("mouseup", this._boundOnMouseUp, false);
                        this._target.onMouseDown(pos.x, pos.y);
                    }
                };
                MouseController.prototype._onDrag = function (event) {
                    var dragInfo = this._dragInfo;
                    var current = this._getTargetMousePos(event, dragInfo.originalTarget);
                    var delta = {
                        x: current.x - dragInfo.start.x,
                        y: current.y - dragInfo.start.y
                    };
                    dragInfo.current = current;
                    dragInfo.delta = delta;
                    dragInfo.hasMoved = true;
                    this._target.onDrag(dragInfo.start.x, dragInfo.start.y, current.x, current.y, delta.x, delta.y);
                };
                MouseController.prototype._onMouseUp = function (event) {
                    window.removeEventListener("mousemove", this._boundOnDrag);
                    window.removeEventListener("mouseup", this._boundOnMouseUp);
                    var self = this;
                    var dragInfo = this._dragInfo;
                    if (dragInfo.hasMoved) {
                        this._target.onDragEnd(dragInfo.start.x, dragInfo.start.y, dragInfo.current.x, dragInfo.current.y, dragInfo.delta.x, dragInfo.delta.y);
                    }
                    else {
                        this._target.onClick(dragInfo.current.x, dragInfo.current.y);
                    }
                    this._dragInfo = null;
                    this._wheelDisabled = true;
                    setTimeout(function () {
                        self._wheelDisabled = false;
                    }, 500);
                };
                MouseController.prototype._onMouseOver = function (event) {
                    event.target.addEventListener("mousemove", this._boundOnMouseMove, false);
                    if (!this._dragInfo) {
                        var pos = this._getTargetMousePos(event, (event.target));
                        this._target.onMouseOver(pos.x, pos.y);
                        this._startHoverCheck(event);
                    }
                };
                MouseController.prototype._onMouseOut = function (event) {
                    event.target.removeEventListener("mousemove", this._boundOnMouseMove, false);
                    if (!this._dragInfo) {
                        this._target.onMouseOut();
                    }
                    this._killHoverCheck();
                };
                MouseController.prototype._onMouseMove = function (event) {
                    if (!this._dragInfo) {
                        var pos = this._getTargetMousePos(event, (event.target));
                        this._target.onMouseMove(pos.x, pos.y);
                        this._killHoverCheck();
                        this._startHoverCheck(event);
                    }
                };
                MouseController.prototype._onMouseWheel = function (event) {
                    if (!event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
                        event.preventDefault();
                        if (!this._dragInfo && !this._wheelDisabled) {
                            var pos = this._getTargetMousePos(event, (event.target));
                            var delta = clamp((typeof event.deltaY !== "undefined") ? event.deltaY / 16 : -event.wheelDelta / 40, -1, 1);
                            var zoom = Math.pow(1.2, delta) - 1;
                            this._target.onMouseWheel(pos.x, pos.y, zoom);
                        }
                    }
                };
                MouseController.prototype._startHoverCheck = function (event) {
                    this._hoverInfo = {
                        isHovering: false,
                        timeoutHandle: setTimeout(this._onMouseMoveIdleHandler.bind(this), MouseController.HOVER_TIMEOUT),
                        pos: this._getTargetMousePos(event, (event.target))
                    };
                };
                MouseController.prototype._killHoverCheck = function () {
                    if (this._hoverInfo) {
                        clearTimeout(this._hoverInfo.timeoutHandle);
                        if (this._hoverInfo.isHovering) {
                            this._target.onHoverEnd();
                        }
                        this._hoverInfo = null;
                    }
                };
                MouseController.prototype._onMouseMoveIdleHandler = function () {
                    var hoverInfo = this._hoverInfo;
                    hoverInfo.isHovering = true;
                    this._target.onHoverStart(hoverInfo.pos.x, hoverInfo.pos.y);
                };
                MouseController.prototype._getTargetMousePos = function (event, target) {
                    var rect = target.getBoundingClientRect();
                    return {
                        x: event.clientX - rect.left,
                        y: event.clientY - rect.top
                    };
                };
                MouseController.HOVER_TIMEOUT = 500;
                MouseController._cursor = MouseCursor.DEFAULT;
                return MouseController;
            })();
            Profiler.MouseController = MouseController;
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            (function (FlameChartDragTarget) {
                FlameChartDragTarget[FlameChartDragTarget["NONE"] = 0] = "NONE";
                FlameChartDragTarget[FlameChartDragTarget["WINDOW"] = 1] = "WINDOW";
                FlameChartDragTarget[FlameChartDragTarget["HANDLE_LEFT"] = 2] = "HANDLE_LEFT";
                FlameChartDragTarget[FlameChartDragTarget["HANDLE_RIGHT"] = 3] = "HANDLE_RIGHT";
                FlameChartDragTarget[FlameChartDragTarget["HANDLE_BOTH"] = 4] = "HANDLE_BOTH";
            })(Profiler.FlameChartDragTarget || (Profiler.FlameChartDragTarget = {}));
            var FlameChartDragTarget = Profiler.FlameChartDragTarget;
            var FlameChartBase = (function () {
                function FlameChartBase(controller) {
                    this._controller = controller;
                    this._initialized = false;
                    this._canvas = document.createElement("canvas");
                    this._context = this._canvas.getContext("2d");
                    this._mouseController = new Profiler.MouseController(this, this._canvas);
                    var container = controller.container;
                    container.appendChild(this._canvas);
                    var rect = container.getBoundingClientRect();
                    this.setSize(rect.width);
                }
                Object.defineProperty(FlameChartBase.prototype, "canvas", {
                    get: function () {
                        return this._canvas;
                    },
                    enumerable: true,
                    configurable: true
                });
                FlameChartBase.prototype.setSize = function (width, height) {
                    if (height === void 0) { height = 20; }
                    this._width = width;
                    this._height = height;
                    this._resetCanvas();
                    this.draw();
                };
                FlameChartBase.prototype.initialize = function (rangeStart, rangeEnd) {
                    this._initialized = true;
                    this.setRange(rangeStart, rangeEnd, false);
                    this.setWindow(rangeStart, rangeEnd, false);
                    this.draw();
                };
                FlameChartBase.prototype.setWindow = function (start, end, draw) {
                    if (draw === void 0) { draw = true; }
                    this._windowStart = start;
                    this._windowEnd = end;
                    !draw || this.draw();
                };
                FlameChartBase.prototype.setRange = function (start, end, draw) {
                    if (draw === void 0) { draw = true; }
                    this._rangeStart = start;
                    this._rangeEnd = end;
                    !draw || this.draw();
                };
                FlameChartBase.prototype.destroy = function () {
                    this._mouseController.destroy();
                    this._mouseController = null;
                    this._controller.container.removeChild(this._canvas);
                    this._controller = null;
                };
                FlameChartBase.prototype._resetCanvas = function () {
                    var ratio = window.devicePixelRatio;
                    var canvas = this._canvas;
                    canvas.width = this._width * ratio;
                    canvas.height = this._height * ratio;
                    canvas.style.width = this._width + "px";
                    canvas.style.height = this._height + "px";
                };
                FlameChartBase.prototype.draw = function () {
                };
                FlameChartBase.prototype._almostEq = function (a, b, precision) {
                    if (precision === void 0) { precision = 10; }
                    var pow10 = Math.pow(10, precision);
                    return Math.abs(a - b) < (1 / pow10);
                };
                FlameChartBase.prototype._windowEqRange = function () {
                    return (this._almostEq(this._windowStart, this._rangeStart) && this._almostEq(this._windowEnd, this._rangeEnd));
                };
                FlameChartBase.prototype._decimalPlaces = function (value) {
                    return ((+value).toFixed(10)).replace(/^-?\d*\.?|0+$/g, '').length;
                };
                FlameChartBase.prototype._toPixelsRelative = function (time) {
                    return 0;
                };
                FlameChartBase.prototype._toPixels = function (time) {
                    return 0;
                };
                FlameChartBase.prototype._toTimeRelative = function (px) {
                    return 0;
                };
                FlameChartBase.prototype._toTime = function (px) {
                    return 0;
                };
                FlameChartBase.prototype.onMouseWheel = function (x, y, delta) {
                    var time = this._toTime(x);
                    var windowStart = this._windowStart;
                    var windowEnd = this._windowEnd;
                    var windowLen = windowEnd - windowStart;
                    /*
                     * Find maximum allowed delta
                     * (windowEnd + (windowEnd - time) * delta) - (windowStart + (windowStart - time) * delta) = LEN
                     * (windowEnd - windowStart) + ((windowEnd - time) * delta) - ((windowStart - time) * delta) = LEN
                     * (windowEnd - windowStart) + ((windowEnd - time) - (windowStart - time)) * delta = LEN
                     * (windowEnd - windowStart) + (windowEnd - windowStart) * delta = LEN
                     * (windowEnd - windowStart) * delta = LEN - (windowEnd - windowStart)
                     * delta = (LEN - (windowEnd - windowStart)) / (windowEnd - windowStart)
                     */
                    var maxDelta = Math.max((FlameChartBase.MIN_WINDOW_LEN - windowLen) / windowLen, delta);
                    var start = windowStart + (windowStart - time) * maxDelta;
                    var end = windowEnd + (windowEnd - time) * maxDelta;
                    this._controller.setWindow(start, end);
                    this.onHoverEnd();
                };
                FlameChartBase.prototype.onMouseDown = function (x, y) {
                };
                FlameChartBase.prototype.onMouseMove = function (x, y) {
                };
                FlameChartBase.prototype.onMouseOver = function (x, y) {
                };
                FlameChartBase.prototype.onMouseOut = function () {
                };
                FlameChartBase.prototype.onDrag = function (startX, startY, currentX, currentY, deltaX, deltaY) {
                };
                FlameChartBase.prototype.onDragEnd = function (startX, startY, currentX, currentY, deltaX, deltaY) {
                };
                FlameChartBase.prototype.onClick = function (x, y) {
                };
                FlameChartBase.prototype.onHoverStart = function (x, y) {
                };
                FlameChartBase.prototype.onHoverEnd = function () {
                };
                FlameChartBase.DRAGHANDLE_WIDTH = 4;
                FlameChartBase.MIN_WINDOW_LEN = 0.1;
                return FlameChartBase;
            })();
            Profiler.FlameChartBase = FlameChartBase;
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            var trimMiddle = Shumway.StringUtilities.trimMiddle;
            var FlameChart = (function (_super) {
                __extends(FlameChart, _super);
                function FlameChart(controller, snapshot) {
                    _super.call(this, controller);
                    this._textWidth = {};
                    /**
                     * Don't paint frames whose width is smaller than this value. This helps a lot when drawing
                     * large ranges. This can be < 1 since anti-aliasing can look quite nice.
                     */
                    this._minFrameWidthInPixels = 1;
                    this._snapshot = snapshot;
                    this._kindStyle = Object.create(null);
                }
                FlameChart.prototype.setSize = function (width, height) {
                    _super.prototype.setSize.call(this, width, height || this._initialized ? this._maxDepth * 12.5 : 100);
                };
                FlameChart.prototype.initialize = function (rangeStart, rangeEnd) {
                    this._initialized = true;
                    this._maxDepth = this._snapshot.maxDepth;
                    this.setRange(rangeStart, rangeEnd, false);
                    this.setWindow(rangeStart, rangeEnd, false);
                    this.setSize(this._width, this._maxDepth * 12.5);
                };
                FlameChart.prototype.destroy = function () {
                    _super.prototype.destroy.call(this);
                    this._snapshot = null;
                };
                FlameChart.prototype.draw = function () {
                    var context = this._context;
                    var ratio = window.devicePixelRatio;
                    Shumway.ColorStyle.reset();
                    context.save();
                    context.scale(ratio, ratio);
                    context.fillStyle = this._controller.theme.bodyBackground(1);
                    context.fillRect(0, 0, this._width, this._height);
                    if (this._initialized) {
                        this._drawChildren(this._snapshot);
                    }
                    context.restore();
                };
                FlameChart.prototype._drawChildren = function (parent, depth) {
                    if (depth === void 0) { depth = 0; }
                    var range = parent.getChildRange(this._windowStart, this._windowEnd);
                    if (range) {
                        for (var i = range.startIndex; i <= range.endIndex; i++) {
                            var child = parent.children[i];
                            if (this._drawFrame(child, depth)) {
                                this._drawChildren(child, depth + 1);
                            }
                        }
                    }
                };
                FlameChart.prototype._drawFrame = function (frame, depth) {
                    var context = this._context;
                    var frameHPadding = 0.5;
                    var left = this._toPixels(frame.startTime);
                    var right = this._toPixels(frame.endTime);
                    var width = right - left;
                    if (width <= this._minFrameWidthInPixels) {
                        context.fillStyle = this._controller.theme.tabToolbar(1);
                        context.fillRect(left, depth * (12 + frameHPadding), this._minFrameWidthInPixels, 12 + (frame.maxDepth - frame.depth) * 12.5);
                        return false;
                    }
                    if (left < 0) {
                        right = width + left;
                        left = 0;
                    }
                    var adjustedWidth = right - left;
                    var style = this._kindStyle[frame.kind.id];
                    if (!style) {
                        var background = Shumway.ColorStyle.randomStyle();
                        style = this._kindStyle[frame.kind.id] = {
                            bgColor: background,
                            textColor: Shumway.ColorStyle.contrastStyle(background)
                        };
                    }
                    context.save();
                    //if (this._hoveredFrame && this._hoveredFrame.kind !== frame.kind) {
                    //  context.globalAlpha = 0.4;
                    //}
                    context.fillStyle = style.bgColor;
                    context.fillRect(left, depth * (12 + frameHPadding), adjustedWidth, 12);
                    if (width > 12) {
                        var label = frame.kind.name;
                        if (label && label.length) {
                            var labelHPadding = 2;
                            label = this._prepareText(context, label, adjustedWidth - labelHPadding * 2);
                            if (label.length) {
                                context.fillStyle = style.textColor;
                                context.textBaseline = "bottom";
                                context.fillText(label, left + labelHPadding, (depth + 1) * (12 + frameHPadding) - 1);
                            }
                        }
                    }
                    context.restore();
                    return true;
                };
                FlameChart.prototype._prepareText = function (context, title, maxSize) {
                    var titleWidth = this._measureWidth(context, title);
                    if (maxSize > titleWidth) {
                        return title;
                    }
                    var l = 3;
                    var r = title.length;
                    while (l < r) {
                        var m = (l + r) >> 1;
                        if (this._measureWidth(context, trimMiddle(title, m)) < maxSize) {
                            l = m + 1;
                        }
                        else {
                            r = m;
                        }
                    }
                    title = trimMiddle(title, r - 1);
                    titleWidth = this._measureWidth(context, title);
                    if (titleWidth <= maxSize) {
                        return title;
                    }
                    return "";
                };
                FlameChart.prototype._measureWidth = function (context, text) {
                    var width = this._textWidth[text];
                    if (!width) {
                        width = context.measureText(text).width;
                        this._textWidth[text] = width;
                    }
                    return width;
                };
                FlameChart.prototype._toPixelsRelative = function (time) {
                    return time * this._width / (this._windowEnd - this._windowStart);
                };
                FlameChart.prototype._toPixels = function (time) {
                    return this._toPixelsRelative(time - this._windowStart);
                };
                FlameChart.prototype._toTimeRelative = function (px) {
                    return px * (this._windowEnd - this._windowStart) / this._width;
                };
                FlameChart.prototype._toTime = function (px) {
                    return this._toTimeRelative(px) + this._windowStart;
                };
                FlameChart.prototype._getFrameAtPosition = function (x, y) {
                    var time = this._toTime(x);
                    var depth = 1 + (y / 12.5) | 0;
                    var frame = this._snapshot.query(time);
                    if (frame && frame.depth >= depth) {
                        while (frame && frame.depth > depth) {
                            frame = frame.parent;
                        }
                        return frame;
                    }
                    return null;
                };
                FlameChart.prototype.onMouseDown = function (x, y) {
                    if (!this._windowEqRange()) {
                        this._mouseController.updateCursor(Profiler.MouseCursor.ALL_SCROLL);
                        this._dragInfo = {
                            windowStartInitial: this._windowStart,
                            windowEndInitial: this._windowEnd,
                            target: 1 /* WINDOW */
                        };
                    }
                };
                FlameChart.prototype.onMouseMove = function (x, y) {
                };
                FlameChart.prototype.onMouseOver = function (x, y) {
                };
                FlameChart.prototype.onMouseOut = function () {
                };
                FlameChart.prototype.onDrag = function (startX, startY, currentX, currentY, deltaX, deltaY) {
                    var dragInfo = this._dragInfo;
                    if (dragInfo) {
                        var delta = this._toTimeRelative(-deltaX);
                        var windowStart = dragInfo.windowStartInitial + delta;
                        var windowEnd = dragInfo.windowEndInitial + delta;
                        this._controller.setWindow(windowStart, windowEnd);
                    }
                };
                FlameChart.prototype.onDragEnd = function (startX, startY, currentX, currentY, deltaX, deltaY) {
                    this._dragInfo = null;
                    this._mouseController.updateCursor(Profiler.MouseCursor.DEFAULT);
                };
                FlameChart.prototype.onClick = function (x, y) {
                    this._dragInfo = null;
                    this._mouseController.updateCursor(Profiler.MouseCursor.DEFAULT);
                };
                FlameChart.prototype.onHoverStart = function (x, y) {
                    var frame = this._getFrameAtPosition(x, y);
                    if (frame) {
                        this._hoveredFrame = frame;
                        this._controller.showTooltip(this, frame, x, y);
                    }
                };
                FlameChart.prototype.onHoverEnd = function () {
                    if (this._hoveredFrame) {
                        this._hoveredFrame = null;
                        this._controller.hideTooltip();
                    }
                };
                FlameChart.prototype.getStatistics = function (kind) {
                    var snapshot = this._snapshot;
                    if (!snapshot.statistics) {
                        snapshot.calculateStatistics();
                    }
                    return snapshot.statistics[kind.id];
                };
                return FlameChart;
            })(Profiler.FlameChartBase);
            Profiler.FlameChart = FlameChart;
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            var clamp = Shumway.NumberUtilities.clamp;
            (function (FlameChartOverviewMode) {
                FlameChartOverviewMode[FlameChartOverviewMode["OVERLAY"] = 0] = "OVERLAY";
                FlameChartOverviewMode[FlameChartOverviewMode["STACK"] = 1] = "STACK";
                FlameChartOverviewMode[FlameChartOverviewMode["UNION"] = 2] = "UNION";
            })(Profiler.FlameChartOverviewMode || (Profiler.FlameChartOverviewMode = {}));
            var FlameChartOverviewMode = Profiler.FlameChartOverviewMode;
            var FlameChartOverview = (function (_super) {
                __extends(FlameChartOverview, _super);
                function FlameChartOverview(controller, mode) {
                    if (mode === void 0) { mode = 1 /* STACK */; }
                    this._mode = mode;
                    this._overviewCanvasDirty = true;
                    this._overviewCanvas = document.createElement("canvas");
                    this._overviewContext = this._overviewCanvas.getContext("2d");
                    _super.call(this, controller);
                }
                FlameChartOverview.prototype.setSize = function (width, height) {
                    _super.prototype.setSize.call(this, width, height || 64);
                };
                Object.defineProperty(FlameChartOverview.prototype, "mode", {
                    set: function (value) {
                        this._mode = value;
                        this.draw();
                    },
                    enumerable: true,
                    configurable: true
                });
                FlameChartOverview.prototype._resetCanvas = function () {
                    _super.prototype._resetCanvas.call(this);
                    this._overviewCanvas.width = this._canvas.width;
                    this._overviewCanvas.height = this._canvas.height;
                    this._overviewCanvasDirty = true;
                };
                FlameChartOverview.prototype.draw = function () {
                    var context = this._context;
                    var ratio = window.devicePixelRatio;
                    var width = this._width;
                    var height = this._height;
                    context.save();
                    context.scale(ratio, ratio);
                    context.fillStyle = this._controller.theme.bodyBackground(1); //"rgba(17, 19, 21, 1)";
                    context.fillRect(0, 0, width, height);
                    context.restore();
                    if (this._initialized) {
                        if (this._overviewCanvasDirty) {
                            this._drawChart();
                            this._overviewCanvasDirty = false;
                        }
                        context.drawImage(this._overviewCanvas, 0, 0);
                        this._drawSelection();
                    }
                };
                FlameChartOverview.prototype._drawSelection = function () {
                    var context = this._context;
                    var height = this._height;
                    var ratio = window.devicePixelRatio;
                    var left = this._selection ? this._selection.left : this._toPixels(this._windowStart);
                    var right = this._selection ? this._selection.right : this._toPixels(this._windowEnd);
                    var theme = this._controller.theme;
                    context.save();
                    context.scale(ratio, ratio);
                    // Draw fills
                    if (this._selection) {
                        context.fillStyle = theme.selectionText(0.15); //"rgba(245, 247, 250, 0.15)";
                        context.fillRect(left, 1, right - left, height - 1);
                        context.fillStyle = "rgba(133, 0, 0, 1)";
                        context.fillRect(left + 0.5, 0, right - left - 1, 4);
                        context.fillRect(left + 0.5, height - 4, right - left - 1, 4);
                    }
                    else {
                        context.fillStyle = theme.bodyBackground(0.4); //"rgba(17, 19, 21, 0.4)";
                        context.fillRect(0, 1, left, height - 1);
                        context.fillRect(right, 1, this._width, height - 1);
                    }
                    // Draw border lines
                    context.beginPath();
                    context.moveTo(left, 0);
                    context.lineTo(left, height);
                    context.moveTo(right, 0);
                    context.lineTo(right, height);
                    context.lineWidth = 0.5;
                    context.strokeStyle = theme.foregroundTextGrey(1); //"rgba(245, 247, 250, 1)";
                    context.stroke();
                    // Draw info labels
                    var start = this._selection ? this._toTime(this._selection.left) : this._windowStart;
                    var end = this._selection ? this._toTime(this._selection.right) : this._windowEnd;
                    var time = Math.abs(end - start);
                    context.fillStyle = theme.selectionText(0.5); //"rgba(255, 255, 255, 0.5)";
                    context.font = '8px sans-serif';
                    context.textBaseline = "alphabetic";
                    context.textAlign = "end";
                    // Selection Range in MS
                    context.fillText(time.toFixed(2), Math.min(left, right) - 4, 10);
                    // Selection Range in Frames
                    context.fillText((time / 60).toFixed(2), Math.min(left, right) - 4, 20);
                    context.restore();
                };
                FlameChartOverview.prototype._drawChart = function () {
                    var ratio = window.devicePixelRatio;
                    var width = this._width;
                    var height = this._height;
                    var profile = this._controller.activeProfile;
                    var samplesPerPixel = 4;
                    var samplesCount = width * samplesPerPixel;
                    var sampleTimeInterval = profile.totalTime / samplesCount;
                    var contextOverview = this._overviewContext;
                    var overviewChartColor = this._controller.theme.blueHighlight(1);
                    contextOverview.save();
                    contextOverview.translate(0, ratio * height);
                    var yScale = -ratio * height / (profile.maxDepth - 1);
                    contextOverview.scale(ratio / samplesPerPixel, yScale);
                    contextOverview.clearRect(0, 0, samplesCount, profile.maxDepth - 1);
                    if (this._mode == 1 /* STACK */) {
                        contextOverview.scale(1, 1 / profile.snapshotCount);
                    }
                    for (var i = 0, n = profile.snapshotCount; i < n; i++) {
                        var snapshot = profile.getSnapshotAt(i);
                        if (snapshot) {
                            var deepestFrame = null;
                            var depth = 0;
                            contextOverview.beginPath();
                            contextOverview.moveTo(0, 0);
                            for (var x = 0; x < samplesCount; x++) {
                                var time = profile.startTime + x * sampleTimeInterval;
                                if (!deepestFrame) {
                                    deepestFrame = snapshot.query(time);
                                }
                                else {
                                    deepestFrame = deepestFrame.queryNext(time);
                                }
                                depth = deepestFrame ? deepestFrame.getDepth() - 1 : 0;
                                contextOverview.lineTo(x, depth);
                            }
                            contextOverview.lineTo(x, 0);
                            contextOverview.fillStyle = overviewChartColor;
                            contextOverview.fill();
                            if (this._mode == 1 /* STACK */) {
                                contextOverview.translate(0, -height * ratio / yScale);
                            }
                        }
                    }
                    contextOverview.restore();
                };
                FlameChartOverview.prototype._toPixelsRelative = function (time) {
                    return time * this._width / (this._rangeEnd - this._rangeStart);
                };
                FlameChartOverview.prototype._toPixels = function (time) {
                    return this._toPixelsRelative(time - this._rangeStart);
                };
                FlameChartOverview.prototype._toTimeRelative = function (px) {
                    return px * (this._rangeEnd - this._rangeStart) / this._width;
                };
                FlameChartOverview.prototype._toTime = function (px) {
                    return this._toTimeRelative(px) + this._rangeStart;
                };
                FlameChartOverview.prototype._getDragTargetUnderCursor = function (x, y) {
                    if (y >= 0 && y < this._height) {
                        var left = this._toPixels(this._windowStart);
                        var right = this._toPixels(this._windowEnd);
                        var radius = 2 + (Profiler.FlameChartBase.DRAGHANDLE_WIDTH) / 2;
                        var leftHandle = (x >= left - radius && x <= left + radius);
                        var rightHandle = (x >= right - radius && x <= right + radius);
                        if (leftHandle && rightHandle) {
                            return 4 /* HANDLE_BOTH */;
                        }
                        else if (leftHandle) {
                            return 2 /* HANDLE_LEFT */;
                        }
                        else if (rightHandle) {
                            return 3 /* HANDLE_RIGHT */;
                        }
                        else if (!this._windowEqRange() && x > left + radius && x < right - radius) {
                            return 1 /* WINDOW */;
                        }
                    }
                    return 0 /* NONE */;
                };
                FlameChartOverview.prototype.onMouseDown = function (x, y) {
                    var dragTarget = this._getDragTargetUnderCursor(x, y);
                    if (dragTarget === 0 /* NONE */) {
                        this._selection = { left: x, right: x };
                        this.draw();
                    }
                    else {
                        if (dragTarget === 1 /* WINDOW */) {
                            this._mouseController.updateCursor(Profiler.MouseCursor.GRABBING);
                        }
                        this._dragInfo = {
                            windowStartInitial: this._windowStart,
                            windowEndInitial: this._windowEnd,
                            target: dragTarget
                        };
                    }
                };
                FlameChartOverview.prototype.onMouseMove = function (x, y) {
                    var cursor = Profiler.MouseCursor.DEFAULT;
                    var dragTarget = this._getDragTargetUnderCursor(x, y);
                    if (dragTarget !== 0 /* NONE */ && !this._selection) {
                        cursor = (dragTarget === 1 /* WINDOW */) ? Profiler.MouseCursor.GRAB : Profiler.MouseCursor.EW_RESIZE;
                    }
                    this._mouseController.updateCursor(cursor);
                };
                FlameChartOverview.prototype.onMouseOver = function (x, y) {
                    this.onMouseMove(x, y);
                };
                FlameChartOverview.prototype.onMouseOut = function () {
                    this._mouseController.updateCursor(Profiler.MouseCursor.DEFAULT);
                };
                FlameChartOverview.prototype.onDrag = function (startX, startY, currentX, currentY, deltaX, deltaY) {
                    if (this._selection) {
                        this._selection = { left: startX, right: clamp(currentX, 0, this._width - 1) };
                        this.draw();
                    }
                    else {
                        var dragInfo = this._dragInfo;
                        if (dragInfo.target === 4 /* HANDLE_BOTH */) {
                            if (deltaX !== 0) {
                                dragInfo.target = (deltaX < 0) ? 2 /* HANDLE_LEFT */ : 3 /* HANDLE_RIGHT */;
                            }
                            else {
                                return;
                            }
                        }
                        var windowStart = this._windowStart;
                        var windowEnd = this._windowEnd;
                        var delta = this._toTimeRelative(deltaX);
                        switch (dragInfo.target) {
                            case 1 /* WINDOW */:
                                windowStart = dragInfo.windowStartInitial + delta;
                                windowEnd = dragInfo.windowEndInitial + delta;
                                break;
                            case 2 /* HANDLE_LEFT */:
                                windowStart = clamp(dragInfo.windowStartInitial + delta, this._rangeStart, windowEnd - Profiler.FlameChartBase.MIN_WINDOW_LEN);
                                break;
                            case 3 /* HANDLE_RIGHT */:
                                windowEnd = clamp(dragInfo.windowEndInitial + delta, windowStart + Profiler.FlameChartBase.MIN_WINDOW_LEN, this._rangeEnd);
                                break;
                            default:
                                return;
                        }
                        this._controller.setWindow(windowStart, windowEnd);
                    }
                };
                FlameChartOverview.prototype.onDragEnd = function (startX, startY, currentX, currentY, deltaX, deltaY) {
                    if (this._selection) {
                        this._selection = null;
                        this._controller.setWindow(this._toTime(startX), this._toTime(currentX));
                    }
                    this._dragInfo = null;
                    this.onMouseMove(currentX, currentY);
                };
                FlameChartOverview.prototype.onClick = function (x, y) {
                    this._dragInfo = null;
                    this._selection = null;
                    if (!this._windowEqRange()) {
                        var dragTarget = this._getDragTargetUnderCursor(x, y);
                        if (dragTarget === 0 /* NONE */) {
                            this._controller.moveWindowTo(this._toTime(x));
                        }
                        this.onMouseMove(x, y);
                    }
                    this.draw();
                };
                FlameChartOverview.prototype.onHoverStart = function (x, y) {
                };
                FlameChartOverview.prototype.onHoverEnd = function () {
                };
                return FlameChartOverview;
            })(Profiler.FlameChartBase);
            Profiler.FlameChartOverview = FlameChartOverview;
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            var clamp = Shumway.NumberUtilities.clamp;
            (function (FlameChartHeaderType) {
                FlameChartHeaderType[FlameChartHeaderType["OVERVIEW"] = 0] = "OVERVIEW";
                FlameChartHeaderType[FlameChartHeaderType["CHART"] = 1] = "CHART";
            })(Profiler.FlameChartHeaderType || (Profiler.FlameChartHeaderType = {}));
            var FlameChartHeaderType = Profiler.FlameChartHeaderType;
            var FlameChartHeader = (function (_super) {
                __extends(FlameChartHeader, _super);
                function FlameChartHeader(controller, type) {
                    this._type = type;
                    _super.call(this, controller);
                }
                FlameChartHeader.prototype.draw = function () {
                    var context = this._context;
                    var ratio = window.devicePixelRatio;
                    var width = this._width;
                    var height = this._height;
                    context.save();
                    context.scale(ratio, ratio);
                    context.fillStyle = this._controller.theme.tabToolbar(1); //"#252c33";
                    context.fillRect(0, 0, width, height);
                    if (this._initialized) {
                        if (this._type == 0 /* OVERVIEW */) {
                            var left = this._toPixels(this._windowStart);
                            var right = this._toPixels(this._windowEnd);
                            context.fillStyle = this._controller.theme.bodyBackground(1); //"#14171a";
                            context.fillRect(left, 0, right - left, height);
                            this._drawLabels(this._rangeStart, this._rangeEnd);
                            this._drawDragHandle(left);
                            this._drawDragHandle(right);
                        }
                        else {
                            this._drawLabels(this._windowStart, this._windowEnd);
                        }
                    }
                    context.restore();
                };
                FlameChartHeader.prototype._drawLabels = function (rangeStart, rangeEnd) {
                    var context = this._context;
                    var tickInterval = this._calculateTickInterval(rangeStart, rangeEnd);
                    var tick = Math.ceil(rangeStart / tickInterval) * tickInterval;
                    var showSeconds = (tickInterval >= 500);
                    var divisor = showSeconds ? 1000 : 1;
                    var precision = this._decimalPlaces(tickInterval / divisor);
                    var unit = showSeconds ? "s" : "ms";
                    var x = this._toPixels(tick);
                    var y = this._height / 2;
                    var theme = this._controller.theme;
                    context.lineWidth = 1;
                    context.strokeStyle = theme.contentTextDarkGrey(0.5); //"rgba(95, 115, 135, 0.5)";
                    context.fillStyle = theme.contentTextDarkGrey(1); //"rgba(95, 115, 135, 1)";
                    context.textAlign = "right";
                    context.textBaseline = "middle";
                    context.font = '11px sans-serif';
                    var maxWidth = this._width + FlameChartHeader.TICK_MAX_WIDTH;
                    while (x < maxWidth) {
                        var tickStr = (tick / divisor).toFixed(precision) + " " + unit;
                        context.fillText(tickStr, x - 7, y + 1);
                        context.beginPath();
                        context.moveTo(x, 0);
                        context.lineTo(x, this._height + 1);
                        context.closePath();
                        context.stroke();
                        tick += tickInterval;
                        x = this._toPixels(tick);
                    }
                };
                FlameChartHeader.prototype._calculateTickInterval = function (rangeStart, rangeEnd) {
                    // http://stackoverflow.com/a/361687
                    var tickCount = this._width / FlameChartHeader.TICK_MAX_WIDTH;
                    var range = rangeEnd - rangeStart;
                    var minimum = range / tickCount;
                    var magnitude = Math.pow(10, Math.floor(Math.log(minimum) / Math.LN10));
                    var residual = minimum / magnitude;
                    if (residual > 5) {
                        return 10 * magnitude;
                    }
                    else if (residual > 2) {
                        return 5 * magnitude;
                    }
                    else if (residual > 1) {
                        return 2 * magnitude;
                    }
                    return magnitude;
                };
                FlameChartHeader.prototype._drawDragHandle = function (pos) {
                    var context = this._context;
                    context.lineWidth = 2;
                    context.strokeStyle = this._controller.theme.bodyBackground(1); //"#14171a";
                    context.fillStyle = this._controller.theme.foregroundTextGrey(0.7); //"rgba(182, 186, 191, 0.7)";
                    this._drawRoundedRect(context, pos - Profiler.FlameChartBase.DRAGHANDLE_WIDTH / 2, 1, Profiler.FlameChartBase.DRAGHANDLE_WIDTH, this._height - 2, 2, true);
                };
                FlameChartHeader.prototype._drawRoundedRect = function (context, x, y, width, height, radius, stroke, fill) {
                    if (stroke === void 0) { stroke = true; }
                    if (fill === void 0) { fill = true; }
                    context.beginPath();
                    context.moveTo(x + radius, y);
                    context.lineTo(x + width - radius, y);
                    context.quadraticCurveTo(x + width, y, x + width, y + radius);
                    context.lineTo(x + width, y + height - radius);
                    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                    context.lineTo(x + radius, y + height);
                    context.quadraticCurveTo(x, y + height, x, y + height - radius);
                    context.lineTo(x, y + radius);
                    context.quadraticCurveTo(x, y, x + radius, y);
                    context.closePath();
                    if (stroke) {
                        context.stroke();
                    }
                    if (fill) {
                        context.fill();
                    }
                };
                FlameChartHeader.prototype._toPixelsRelative = function (time) {
                    var range = (this._type === 0 /* OVERVIEW */) ? this._rangeEnd - this._rangeStart : this._windowEnd - this._windowStart;
                    return time * this._width / range;
                };
                FlameChartHeader.prototype._toPixels = function (time) {
                    var start = (this._type === 0 /* OVERVIEW */) ? this._rangeStart : this._windowStart;
                    return this._toPixelsRelative(time - start);
                };
                FlameChartHeader.prototype._toTimeRelative = function (px) {
                    var range = (this._type === 0 /* OVERVIEW */) ? this._rangeEnd - this._rangeStart : this._windowEnd - this._windowStart;
                    return px * range / this._width;
                };
                FlameChartHeader.prototype._toTime = function (px) {
                    var start = (this._type === 0 /* OVERVIEW */) ? this._rangeStart : this._windowStart;
                    return this._toTimeRelative(px) + start;
                };
                FlameChartHeader.prototype._getDragTargetUnderCursor = function (x, y) {
                    if (y >= 0 && y < this._height) {
                        if (this._type === 0 /* OVERVIEW */) {
                            var left = this._toPixels(this._windowStart);
                            var right = this._toPixels(this._windowEnd);
                            var radius = 2 + (Profiler.FlameChartBase.DRAGHANDLE_WIDTH) / 2;
                            var leftHandle = (x >= left - radius && x <= left + radius);
                            var rightHandle = (x >= right - radius && x <= right + radius);
                            if (leftHandle && rightHandle) {
                                return 4 /* HANDLE_BOTH */;
                            }
                            else if (leftHandle) {
                                return 2 /* HANDLE_LEFT */;
                            }
                            else if (rightHandle) {
                                return 3 /* HANDLE_RIGHT */;
                            }
                            else if (!this._windowEqRange()) {
                                return 1 /* WINDOW */;
                            }
                        }
                        else if (!this._windowEqRange()) {
                            return 1 /* WINDOW */;
                        }
                    }
                    return 0 /* NONE */;
                };
                FlameChartHeader.prototype.onMouseDown = function (x, y) {
                    var dragTarget = this._getDragTargetUnderCursor(x, y);
                    if (dragTarget === 1 /* WINDOW */) {
                        this._mouseController.updateCursor(Profiler.MouseCursor.GRABBING);
                    }
                    this._dragInfo = {
                        windowStartInitial: this._windowStart,
                        windowEndInitial: this._windowEnd,
                        target: dragTarget
                    };
                };
                FlameChartHeader.prototype.onMouseMove = function (x, y) {
                    var cursor = Profiler.MouseCursor.DEFAULT;
                    var dragTarget = this._getDragTargetUnderCursor(x, y);
                    if (dragTarget !== 0 /* NONE */) {
                        if (dragTarget !== 1 /* WINDOW */) {
                            cursor = Profiler.MouseCursor.EW_RESIZE;
                        }
                        else if (dragTarget === 1 /* WINDOW */ && !this._windowEqRange()) {
                            cursor = Profiler.MouseCursor.GRAB;
                        }
                    }
                    this._mouseController.updateCursor(cursor);
                };
                FlameChartHeader.prototype.onMouseOver = function (x, y) {
                    this.onMouseMove(x, y);
                };
                FlameChartHeader.prototype.onMouseOut = function () {
                    this._mouseController.updateCursor(Profiler.MouseCursor.DEFAULT);
                };
                FlameChartHeader.prototype.onDrag = function (startX, startY, currentX, currentY, deltaX, deltaY) {
                    var dragInfo = this._dragInfo;
                    if (dragInfo.target === 4 /* HANDLE_BOTH */) {
                        if (deltaX !== 0) {
                            dragInfo.target = (deltaX < 0) ? 2 /* HANDLE_LEFT */ : 3 /* HANDLE_RIGHT */;
                        }
                        else {
                            return;
                        }
                    }
                    var windowStart = this._windowStart;
                    var windowEnd = this._windowEnd;
                    var delta = this._toTimeRelative(deltaX);
                    switch (dragInfo.target) {
                        case 1 /* WINDOW */:
                            var mult = (this._type === 0 /* OVERVIEW */) ? 1 : -1;
                            windowStart = dragInfo.windowStartInitial + mult * delta;
                            windowEnd = dragInfo.windowEndInitial + mult * delta;
                            break;
                        case 2 /* HANDLE_LEFT */:
                            windowStart = clamp(dragInfo.windowStartInitial + delta, this._rangeStart, windowEnd - Profiler.FlameChartBase.MIN_WINDOW_LEN);
                            break;
                        case 3 /* HANDLE_RIGHT */:
                            windowEnd = clamp(dragInfo.windowEndInitial + delta, windowStart + Profiler.FlameChartBase.MIN_WINDOW_LEN, this._rangeEnd);
                            break;
                        default:
                            return;
                    }
                    this._controller.setWindow(windowStart, windowEnd);
                };
                FlameChartHeader.prototype.onDragEnd = function (startX, startY, currentX, currentY, deltaX, deltaY) {
                    this._dragInfo = null;
                    this.onMouseMove(currentX, currentY);
                };
                FlameChartHeader.prototype.onClick = function (x, y) {
                    if (this._dragInfo.target === 1 /* WINDOW */) {
                        this._mouseController.updateCursor(Profiler.MouseCursor.GRAB);
                    }
                };
                FlameChartHeader.prototype.onHoverStart = function (x, y) {
                };
                FlameChartHeader.prototype.onHoverEnd = function () {
                };
                FlameChartHeader.TICK_MAX_WIDTH = 75;
                return FlameChartHeader;
            })(Profiler.FlameChartBase);
            Profiler.FlameChartHeader = FlameChartHeader;
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            var TraceLogger;
            (function (_TraceLogger) {
                var TraceLoggerProgressInfo = (function () {
                    function TraceLoggerProgressInfo(pageLoaded, threadsTotal, threadsLoaded, threadFilesTotal, threadFilesLoaded) {
                        this.pageLoaded = pageLoaded;
                        this.threadsTotal = threadsTotal;
                        this.threadsLoaded = threadsLoaded;
                        this.threadFilesTotal = threadFilesTotal;
                        this.threadFilesLoaded = threadFilesLoaded;
                    }
                    TraceLoggerProgressInfo.prototype.toString = function () {
                        return "[" + ["pageLoaded", "threadsTotal", "threadsLoaded", "threadFilesTotal", "threadFilesLoaded"].map(function (value, i, arr) {
                            return value + ":" + this[value];
                        }, this).join(", ") + "]";
                    };
                    return TraceLoggerProgressInfo;
                })();
                _TraceLogger.TraceLoggerProgressInfo = TraceLoggerProgressInfo;
                var TraceLogger = (function () {
                    function TraceLogger(baseUrl) {
                        this._baseUrl = baseUrl;
                        this._threads = [];
                        this._progressInfo = null;
                    }
                    TraceLogger.prototype.loadPage = function (url, callback, progress) {
                        this._threads = [];
                        this._pageLoadCallback = callback;
                        this._pageLoadProgressCallback = progress;
                        this._progressInfo = new TraceLoggerProgressInfo(false, 0, 0, 0, 0);
                        this._loadData([url], this._onLoadPage.bind(this));
                    };
                    Object.defineProperty(TraceLogger.prototype, "buffers", {
                        get: function () {
                            var buffers = [];
                            for (var i = 0, n = this._threads.length; i < n; i++) {
                                buffers.push(this._threads[i].buffer);
                            }
                            return buffers;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    TraceLogger.prototype._onProgress = function () {
                        if (this._pageLoadProgressCallback) {
                            this._pageLoadProgressCallback.call(this, this._progressInfo);
                        }
                    };
                    TraceLogger.prototype._onLoadPage = function (result) {
                        if (result && result.length == 1) {
                            var self = this;
                            var count = 0;
                            var threads = result[0];
                            var threadCount = threads.length;
                            this._threads = Array(threadCount);
                            this._progressInfo.pageLoaded = true;
                            this._progressInfo.threadsTotal = threadCount;
                            for (var i = 0; i < threads.length; i++) {
                                var thread = threads[i];
                                var urls = [thread.dict, thread.tree];
                                if (thread.corrections) {
                                    urls.push(thread.corrections);
                                }
                                this._progressInfo.threadFilesTotal += urls.length;
                                this._loadData(urls, (function (index) {
                                    return function (result) {
                                        if (result) {
                                            var thread = new _TraceLogger.Thread(result);
                                            thread.buffer.name = "Thread " + index;
                                            self._threads[index] = thread;
                                        }
                                        count++;
                                        self._progressInfo.threadsLoaded++;
                                        self._onProgress();
                                        if (count === threadCount) {
                                            self._pageLoadCallback.call(self, null, self._threads);
                                        }
                                    };
                                })(i), function (count) {
                                    self._progressInfo.threadFilesLoaded++;
                                    self._onProgress();
                                });
                            }
                            this._onProgress();
                        }
                        else {
                            this._pageLoadCallback.call(this, "Error loading page.", null);
                        }
                    };
                    TraceLogger.prototype._loadData = function (urls, callback, progress) {
                        var count = 0;
                        var errors = 0;
                        var expected = urls.length;
                        var received = [];
                        received.length = expected;
                        for (var i = 0; i < expected; i++) {
                            var url = this._baseUrl + urls[i];
                            var isTL = /\.tl$/i.test(url);
                            var xhr = new XMLHttpRequest();
                            var responseType = isTL ? "arraybuffer" : "json";
                            xhr.open('GET', url, true);
                            xhr.responseType = responseType;
                            xhr.onload = (function (index, type) {
                                return function (event) {
                                    if (type === "json") {
                                        var json = this.response;
                                        if (typeof json === "string") {
                                            try {
                                                json = JSON.parse(json);
                                                received[index] = json;
                                            }
                                            catch (e) {
                                                errors++;
                                            }
                                        }
                                        else {
                                            received[index] = json;
                                        }
                                    }
                                    else {
                                        received[index] = this.response;
                                    }
                                    ++count;
                                    if (progress) {
                                        progress(count);
                                    }
                                    if (count === expected) {
                                        callback(received);
                                    }
                                };
                            })(i, responseType);
                            xhr.send();
                        }
                    };
                    TraceLogger.colors = [
                        "#0044ff",
                        "#8c4b00",
                        "#cc5c33",
                        "#ff80c4",
                        "#ffbfd9",
                        "#ff8800",
                        "#8c5e00",
                        "#adcc33",
                        "#b380ff",
                        "#bfd9ff",
                        "#ffaa00",
                        "#8c0038",
                        "#bf8f30",
                        "#f780ff",
                        "#cc99c9",
                        "#aaff00",
                        "#000073",
                        "#452699",
                        "#cc8166",
                        "#cca799",
                        "#000066",
                        "#992626",
                        "#cc6666",
                        "#ccc299",
                        "#ff6600",
                        "#526600",
                        "#992663",
                        "#cc6681",
                        "#99ccc2",
                        "#ff0066",
                        "#520066",
                        "#269973",
                        "#61994d",
                        "#739699",
                        "#ffcc00",
                        "#006629",
                        "#269199",
                        "#94994d",
                        "#738299",
                        "#ff0000",
                        "#590000",
                        "#234d8c",
                        "#8c6246",
                        "#7d7399",
                        "#ee00ff",
                        "#00474d",
                        "#8c2385",
                        "#8c7546",
                        "#7c8c69",
                        "#eeff00",
                        "#4d003d",
                        "#662e1a",
                        "#62468c",
                        "#8c6969",
                        "#6600ff",
                        "#4c2900",
                        "#1a6657",
                        "#8c464f",
                        "#8c6981",
                        "#44ff00",
                        "#401100",
                        "#1a2466",
                        "#663355",
                        "#567365",
                        "#d90074",
                        "#403300",
                        "#101d40",
                        "#59562d",
                        "#66614d",
                        "#cc0000",
                        "#002b40",
                        "#234010",
                        "#4c2626",
                        "#4d5e66",
                        "#00a3cc",
                        "#400011",
                        "#231040",
                        "#4c3626",
                        "#464359",
                        "#0000bf",
                        "#331b00",
                        "#80e6ff",
                        "#311a33",
                        "#4d3939",
                        "#a69b00",
                        "#003329",
                        "#80ffb2",
                        "#331a20",
                        "#40303d",
                        "#00a658",
                        "#40ffd9",
                        "#ffc480",
                        "#ffe1bf",
                        "#332b26",
                        "#8c2500",
                        "#9933cc",
                        "#80fff6",
                        "#ffbfbf",
                        "#303326",
                        "#005e8c",
                        "#33cc47",
                        "#b2ff80",
                        "#c8bfff",
                        "#263332",
                        "#00708c",
                        "#cc33ad",
                        "#ffe680",
                        "#f2ffbf",
                        "#262a33",
                        "#388c00",
                        "#335ccc",
                        "#8091ff",
                        "#bfffd9"
                    ];
                    return TraceLogger;
                })();
                _TraceLogger.TraceLogger = TraceLogger;
            })(TraceLogger = Profiler.TraceLogger || (Profiler.TraceLogger = {}));
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
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
    var Tools;
    (function (Tools) {
        var Profiler;
        (function (Profiler) {
            var TraceLogger;
            (function (TraceLogger) {
                var Offsets;
                (function (Offsets) {
                    Offsets[Offsets["START_HI"] = 0] = "START_HI";
                    Offsets[Offsets["START_LO"] = 4] = "START_LO";
                    Offsets[Offsets["STOP_HI"] = 8] = "STOP_HI";
                    Offsets[Offsets["STOP_LO"] = 12] = "STOP_LO";
                    Offsets[Offsets["TEXTID"] = 16] = "TEXTID";
                    Offsets[Offsets["NEXTID"] = 20] = "NEXTID";
                })(Offsets || (Offsets = {}));
                var Thread = (function () {
                    function Thread(data) {
                        if (data.length >= 2) {
                            this._text = data[0];
                            this._data = new DataView(data[1]);
                            this._buffer = new Profiler.TimelineBuffer();
                            this._walkTree(0);
                        }
                    }
                    Object.defineProperty(Thread.prototype, "buffer", {
                        get: function () {
                            return this._buffer;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Thread.prototype._walkTree = function (id) {
                        var data = this._data;
                        var buffer = this._buffer;
                        do {
                            var index = id * Thread.ITEM_SIZE;
                            var start = data.getUint32(index + 0 /* START_HI */) * 4294967295 + data.getUint32(index + 4 /* START_LO */);
                            var stop = data.getUint32(index + 8 /* STOP_HI */) * 4294967295 + data.getUint32(index + 12 /* STOP_LO */);
                            var textId = data.getUint32(index + 16 /* TEXTID */);
                            var nextId = data.getUint32(index + 20 /* NEXTID */);
                            var hasChildren = ((textId & 1) === 1);
                            textId >>>= 1;
                            var text = this._text[textId];
                            buffer.enter(text, null, start / 1000000);
                            if (hasChildren) {
                                this._walkTree(id + 1);
                            }
                            buffer.leave(text, null, stop / 1000000);
                            id = nextId;
                        } while (id !== 0);
                    };
                    Thread.ITEM_SIZE = 8 + 8 + 4 + 4;
                    return Thread;
                })();
                TraceLogger.Thread = Thread;
            })(TraceLogger = Profiler.TraceLogger || (Profiler.TraceLogger = {}));
        })(Profiler = Tools.Profiler || (Tools.Profiler = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
})(Shumway || (Shumway = {}));
/// <reference path='../references.ts' />
/// <reference path='profile.ts' />
/// <reference path='timelineFrame.ts' />
/// <reference path='timelineBuffer.ts' />
/// <reference path='controller.ts' />
/// <reference path='mouseController.ts' />
/// <reference path='flameChartBase.ts' />
/// <reference path='flameChart.ts' />
/// <reference path='flameChartOverview.ts' />
/// <reference path='flameChartHeader.ts' />
/// <reference path='tracelogger/traceLogger.ts' />
/// <reference path='tracelogger/thread.ts' />
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
    var Tools;
    (function (Tools) {
        var Terminal;
        (function (_Terminal) {
            var clamp = Shumway.NumberUtilities.clamp;
            var Buffer = (function () {
                function Buffer() {
                    this.length = 0;
                    this.lines = [];
                    this.format = [];
                    this.time = [];
                    this.repeat = [];
                    this.length = 0;
                }
                Buffer.prototype.append = function (line, color) {
                    var lines = this.lines;
                    if (lines.length > 0 && lines[lines.length - 1] === line) {
                        this.repeat[lines.length - 1]++;
                        return;
                    }
                    this.lines.push(line);
                    this.repeat.push(1);
                    this.format.push(color ? { backgroundFillStyle: color } : undefined);
                    this.time.push(performance.now());
                    this.length++;
                };
                Buffer.prototype.get = function (i) {
                    return this.lines[i];
                };
                Buffer.prototype.getFormat = function (i) {
                    return this.format[i];
                };
                Buffer.prototype.getTime = function (i) {
                    return this.time[i];
                };
                Buffer.prototype.getRepeat = function (i) {
                    return this.repeat[i];
                };
                return Buffer;
            })();
            _Terminal.Buffer = Buffer;
            /**
             * If you're going to write a lot of data to the browser console you're gonna have a bad time. This may make your
             * life a little more pleasant.
             */
            var Terminal = (function () {
                function Terminal(canvas) {
                    this.lineColor = "#2A2A2A";
                    this.alternateLineColor = "#262626";
                    this.textColor = "#FFFFFF";
                    this.selectionColor = "#96C9F3";
                    this.selectionTextColor = "#000000";
                    this.ratio = 1;
                    this.showLineNumbers = true;
                    this.showLineTime = false;
                    this.showLineCounter = false;
                    this.canvas = canvas;
                    this.canvas.focus();
                    this.context = canvas.getContext('2d', { original: true });
                    this.context.fillStyle = "#FFFFFF";
                    this.fontSize = 10;
                    this.lineIndex = 0;
                    this.pageIndex = 0;
                    this.columnIndex = 0;
                    this.selection = null;
                    this.lineHeight = 15;
                    this.hasFocus = false;
                    window.addEventListener('resize', this._resizeHandler.bind(this), false);
                    this._resizeHandler();
                    this.textMarginLeft = 4;
                    this.textMarginBottom = 4;
                    this.refreshFrequency = 0;
                    this.buffer = new Buffer();
                    canvas.addEventListener('keydown', onKeyDown.bind(this), false);
                    canvas.addEventListener('focus', onFocusIn.bind(this), false);
                    canvas.addEventListener('blur', onFocusOut.bind(this), false);
                    var PAGE_UP = 33;
                    var PAGE_DOWN = 34;
                    var HOME = 36;
                    var END = 35;
                    var UP = 38;
                    var DOWN = 40;
                    var LEFT = 37;
                    var RIGHT = 39;
                    var KEY_A = 65;
                    var KEY_C = 67;
                    var KEY_F = 70;
                    var ESCAPE = 27;
                    var KEY_N = 78;
                    var KEY_T = 84;
                    function onFocusIn(event) {
                        this.hasFocus = true;
                    }
                    function onFocusOut(event) {
                        this.hasFocus = false;
                    }
                    function onKeyDown(event) {
                        var delta = 0;
                        switch (event.keyCode) {
                            case KEY_N:
                                this.showLineNumbers = !this.showLineNumbers;
                                break;
                            case KEY_T:
                                this.showLineTime = !this.showLineTime;
                                break;
                            case UP:
                                delta = -1;
                                break;
                            case DOWN:
                                delta = +1;
                                break;
                            case PAGE_UP:
                                delta = -this.pageLineCount;
                                break;
                            case PAGE_DOWN:
                                delta = this.pageLineCount;
                                break;
                            case HOME:
                                delta = -this.lineIndex;
                                break;
                            case END:
                                delta = this.buffer.length - this.lineIndex;
                                break;
                            case LEFT:
                                this.columnIndex -= event.metaKey ? 10 : 1;
                                if (this.columnIndex < 0) {
                                    this.columnIndex = 0;
                                }
                                event.preventDefault();
                                break;
                            case RIGHT:
                                this.columnIndex += event.metaKey ? 10 : 1;
                                event.preventDefault();
                                break;
                            case KEY_A:
                                if (event.metaKey) {
                                    this.selection = { start: 0, end: this.buffer.length };
                                    event.preventDefault();
                                }
                                break;
                            case KEY_C:
                                if (event.metaKey) {
                                    var str = "";
                                    if (this.selection) {
                                        for (var i = this.selection.start; i <= this.selection.end; i++) {
                                            str += this.buffer.get(i) + "\n";
                                        }
                                    }
                                    else {
                                        str = this.buffer.get(this.lineIndex);
                                    }
                                    alert(str);
                                }
                                break;
                            default:
                                break;
                        }
                        if (event.metaKey) {
                            delta *= this.pageLineCount;
                        }
                        if (delta) {
                            this.scroll(delta);
                            event.preventDefault();
                        }
                        if (delta && event.shiftKey) {
                            if (!this.selection) {
                                if (delta > 0) {
                                    this.selection = { start: this.lineIndex - delta, end: this.lineIndex };
                                }
                                else if (delta < 0) {
                                    this.selection = { start: this.lineIndex, end: this.lineIndex - delta };
                                }
                            }
                            else {
                                if (this.lineIndex > this.selection.start) {
                                    this.selection.end = this.lineIndex;
                                }
                                else {
                                    this.selection.start = this.lineIndex;
                                }
                            }
                        }
                        else if (delta) {
                            this.selection = null;
                        }
                        this.paint();
                    }
                }
                Terminal.prototype.resize = function () {
                    this._resizeHandler();
                };
                Terminal.prototype._resizeHandler = function () {
                    var parent = this.canvas.parentElement;
                    var cw = parent.clientWidth;
                    var ch = parent.clientHeight - 1;
                    var devicePixelRatio = window.devicePixelRatio || 1;
                    var backingStoreRatio = 1;
                    if (devicePixelRatio !== backingStoreRatio) {
                        this.ratio = devicePixelRatio / backingStoreRatio;
                        this.canvas.width = cw * this.ratio;
                        this.canvas.height = ch * this.ratio;
                        this.canvas.style.width = cw + 'px';
                        this.canvas.style.height = ch + 'px';
                    }
                    else {
                        this.ratio = 1;
                        this.canvas.width = cw;
                        this.canvas.height = ch;
                    }
                    this.pageLineCount = Math.floor(this.canvas.height / this.lineHeight);
                };
                Terminal.prototype.gotoLine = function (index) {
                    this.lineIndex = clamp(index, 0, this.buffer.length - 1);
                };
                Terminal.prototype.scrollIntoView = function () {
                    if (this.lineIndex < this.pageIndex) {
                        this.pageIndex = this.lineIndex;
                    }
                    else if (this.lineIndex >= this.pageIndex + this.pageLineCount) {
                        this.pageIndex = this.lineIndex - this.pageLineCount + 1;
                    }
                };
                Terminal.prototype.scroll = function (delta) {
                    this.gotoLine(this.lineIndex + delta);
                    this.scrollIntoView();
                };
                Terminal.prototype.paint = function () {
                    var lineCount = this.pageLineCount;
                    if (this.pageIndex + lineCount > this.buffer.length) {
                        lineCount = this.buffer.length - this.pageIndex;
                    }
                    var charSize = 5;
                    var lineNumberMargin = this.textMarginLeft;
                    var lineTimeMargin = lineNumberMargin + (this.showLineNumbers ? (String(this.buffer.length).length + 2) * charSize : 0);
                    var lineRepeatMargin = lineTimeMargin + (this.showLineTime ? charSize * 8 : 2 * charSize);
                    var lineMargin = lineRepeatMargin + charSize * 5;
                    this.context.font = this.fontSize + 'px Consolas, "Liberation Mono", Courier, monospace';
                    this.context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
                    var w = this.canvas.width;
                    var h = this.lineHeight;
                    for (var i = 0; i < lineCount; i++) {
                        var y = i * this.lineHeight;
                        var lineIndex = this.pageIndex + i;
                        var line = this.buffer.get(lineIndex);
                        var lineFormat = this.buffer.getFormat(lineIndex);
                        var lineRepeat = this.buffer.getRepeat(lineIndex);
                        // var lineTimeDelta = lineIndex > 1 ? this.buffer.getTime(lineIndex) - this.buffer.getTime(lineIndex - 1) : 0;
                        var lineTimeDelta = lineIndex > 1 ? this.buffer.getTime(lineIndex) - this.buffer.getTime(0) : 0;
                        this.context.fillStyle = lineIndex % 2 ? this.lineColor : this.alternateLineColor;
                        if (lineFormat && lineFormat.backgroundFillStyle) {
                            this.context.fillStyle = lineFormat.backgroundFillStyle;
                        }
                        this.context.fillRect(0, y, w, h);
                        this.context.fillStyle = this.selectionTextColor;
                        this.context.fillStyle = this.textColor;
                        if (this.selection && lineIndex >= this.selection.start && lineIndex <= this.selection.end) {
                            this.context.fillStyle = this.selectionColor;
                            this.context.fillRect(0, y, w, h);
                            this.context.fillStyle = this.selectionTextColor;
                        }
                        if (this.hasFocus && lineIndex === this.lineIndex) {
                            this.context.fillStyle = this.selectionColor;
                            this.context.fillRect(0, y, w, h);
                            this.context.fillStyle = this.selectionTextColor;
                        }
                        if (this.columnIndex > 0) {
                            line = line.substring(this.columnIndex);
                        }
                        var marginTop = (i + 1) * this.lineHeight - this.textMarginBottom;
                        if (this.showLineNumbers) {
                            this.context.fillText(String(lineIndex), lineNumberMargin, marginTop);
                        }
                        if (this.showLineTime) {
                            this.context.fillText(lineTimeDelta.toFixed(1).padLeft(' ', 6), lineTimeMargin, marginTop);
                        }
                        if (lineRepeat > 1) {
                            this.context.fillText(String(lineRepeat).padLeft(' ', 3), lineRepeatMargin, marginTop);
                        }
                        this.context.fillText(line, lineMargin, marginTop);
                    }
                };
                Terminal.prototype.refreshEvery = function (ms) {
                    var that = this;
                    this.refreshFrequency = ms;
                    function refresh() {
                        that.paint();
                        if (that.refreshFrequency) {
                            setTimeout(refresh, that.refreshFrequency);
                        }
                    }
                    if (that.refreshFrequency) {
                        setTimeout(refresh, that.refreshFrequency);
                    }
                };
                Terminal.prototype.isScrolledToBottom = function () {
                    return this.lineIndex === this.buffer.length - 1;
                };
                return Terminal;
            })();
            _Terminal.Terminal = Terminal;
        })(Terminal = Tools.Terminal || (Tools.Terminal = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
})(Shumway || (Shumway = {}));
/// <reference path='../references.ts' />
/// <reference path='terminal.ts' />
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
    var Tools;
    (function (Tools) {
        var Mini;
        (function (Mini) {
            var FPS = (function () {
                function FPS(container) {
                    this._index = 0;
                    this._lastTime = 0;
                    this._lastWeightedTime = 0;
                    this._gradient = [
                        "#FF0000",
                        "#FF1100",
                        "#FF2300",
                        "#FF3400",
                        "#FF4600",
                        "#FF5700",
                        "#FF6900",
                        "#FF7B00",
                        "#FF8C00",
                        "#FF9E00",
                        "#FFAF00",
                        "#FFC100",
                        "#FFD300",
                        "#FFE400",
                        "#FFF600",
                        "#F7FF00",
                        "#E5FF00",
                        "#D4FF00",
                        "#C2FF00",
                        "#B0FF00",
                        "#9FFF00",
                        "#8DFF00",
                        "#7CFF00",
                        "#6AFF00",
                        "#58FF00",
                        "#47FF00",
                        "#35FF00",
                        "#24FF00",
                        "#12FF00",
                        "#00FF00"
                    ];
                    this._container = container;
                    this._canvas = document.createElement("canvas");
                    this._container.appendChild(this._canvas);
                    this._context = this._canvas.getContext("2d");
                    this._listenForContainerSizeChanges();
                }
                FPS.prototype._listenForContainerSizeChanges = function () {
                    var pollInterval = 10;
                    var w = this._containerWidth;
                    var h = this._containerHeight;
                    this._onContainerSizeChanged();
                    var self = this;
                    setInterval(function () {
                        if (w !== self._containerWidth || h !== self._containerHeight) {
                            self._onContainerSizeChanged();
                            w = self._containerWidth;
                            h = self._containerHeight;
                        }
                    }, pollInterval);
                };
                FPS.prototype._onContainerSizeChanged = function () {
                    var cw = this._containerWidth;
                    var ch = this._containerHeight;
                    var devicePixelRatio = window.devicePixelRatio || 1;
                    var backingStoreRatio = 1;
                    if (devicePixelRatio !== backingStoreRatio) {
                        this._ratio = devicePixelRatio / backingStoreRatio;
                        this._canvas.width = cw * this._ratio;
                        this._canvas.height = ch * this._ratio;
                        this._canvas.style.width = cw + 'px';
                        this._canvas.style.height = ch + 'px';
                    }
                    else {
                        this._ratio = 1;
                        this._canvas.width = cw;
                        this._canvas.height = ch;
                    }
                };
                Object.defineProperty(FPS.prototype, "_containerWidth", {
                    get: function () {
                        return this._container.clientWidth;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(FPS.prototype, "_containerHeight", {
                    get: function () {
                        return this._container.clientHeight;
                    },
                    enumerable: true,
                    configurable: true
                });
                FPS.prototype.tickAndRender = function (idle, renderTime) {
                    if (idle === void 0) { idle = false; }
                    if (renderTime === void 0) { renderTime = 0; }
                    if (this._lastTime === 0) {
                        this._lastTime = performance.now();
                        return;
                    }
                    var elapsedTime = performance.now() - this._lastTime;
                    var weightRatio = 0; // Use ratio here if you want smoothing.
                    var weightedTime = elapsedTime * (1 - weightRatio) + this._lastWeightedTime * weightRatio;
                    var context = this._context;
                    var w = 2 * this._ratio;
                    var wPadding = 1;
                    var fontSize = 8;
                    var tickOffset = this._ratio * 30;
                    var webkitPerformance = performance;
                    if (webkitPerformance.memory) {
                        tickOffset += this._ratio * 30;
                    }
                    var count = ((this._canvas.width - tickOffset) / (w + wPadding)) | 0;
                    var index = this._index++;
                    if (this._index > count) {
                        this._index = 0;
                    }
                    var canvasHeight = this._canvas.height;
                    context.globalAlpha = 1;
                    context.fillStyle = "black";
                    context.fillRect(tickOffset + index * (w + wPadding), 0, w * 4, this._canvas.height);
                    var r = Math.min((1000 / 60) / weightedTime, 1);
                    context.fillStyle = "#00FF00"; // this._gradient[r * (this._gradient.length - 1) | 0];
                    context.globalAlpha = idle ? 0.5 : 1;
                    var v = canvasHeight / 2 * r | 0;
                    context.fillRect(tickOffset + index * (w + wPadding), canvasHeight - v, w, v);
                    if (renderTime) {
                        r = Math.min((1000 / 240) / renderTime, 1);
                        context.fillStyle = "#FF6347"; // "#58FF00"; // "#00FF00"; // this._gradient[r * (this._gradient.length - 1) | 0];
                        var v = canvasHeight / 2 * r | 0;
                        context.fillRect(tickOffset + index * (w + wPadding), (canvasHeight / 2) - v, w, v);
                    }
                    if (index % 16 === 0) {
                        context.globalAlpha = 1;
                        context.fillStyle = "black";
                        context.fillRect(0, 0, tickOffset, this._canvas.height);
                        context.fillStyle = "white";
                        context.font = (this._ratio * fontSize) + "px Arial";
                        context.textBaseline = "middle";
                        var s = (1000 / weightedTime).toFixed(0);
                        if (renderTime) {
                            s += " " + renderTime.toFixed(0);
                        }
                        if (webkitPerformance.memory) {
                            s += " " + (webkitPerformance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
                        }
                        context.fillText(s, 2 * this._ratio, this._containerHeight / 2 * this._ratio);
                    }
                    this._lastTime = performance.now();
                    this._lastWeightedTime = weightedTime;
                };
                return FPS;
            })();
            Mini.FPS = FPS;
        })(Mini = Tools.Mini || (Tools.Mini = {}));
    })(Tools = Shumway.Tools || (Shumway.Tools = {}));
})(Shumway || (Shumway = {}));
/// <reference path='../references.ts' />
/// <reference path='fps.ts' />
/// <reference path='../../build/ts/base.d.ts' />
/// <reference path='theme/ui.ts' />
/// <reference path='profiler/references.ts' />
/// <reference path='terminal/references.ts' />
/// <reference path='mini/references.ts' />
//# sourceMappingURL=tools.js.map