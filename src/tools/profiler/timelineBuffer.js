var Shumway;
(function (Shumway) {
    (function (Tools) {
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
        (function (Profiler) {
            var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;

            /**
            * Records enter / leave events in two circular buffers.
            * The goal here is to be able to handle large amounts of data.
            */
            var TimelineBuffer = (function () {
                function TimelineBuffer() {
                    this.marks = new Shumway.CircularBuffer(Int32Array, 20);
                    this.times = new Shumway.CircularBuffer(Float64Array, 20);
                    this.kinds = createEmptyObject();
                    this.kindNames = createEmptyObject();
                    this._depth = 0;
                    this._kindCount = 0;
                }
                TimelineBuffer.prototype.getKindName = function (kind) {
                    return this.kindNames[kind];
                };

                TimelineBuffer.prototype.getKind = function (name) {
                    if (this.kinds[name] === undefined) {
                        var kind = this._kindCount++;
                        this.kinds[name] = kind;
                        this.kindNames[kind] = name;
                    }
                    return this.kinds[name];
                };

                TimelineBuffer.prototype.enter = function (name, time) {
                    this._depth++;
                    this.marks.write(TimelineBuffer.ENTER | this.getKind(name));
                    this.times.write(time || performance.now());
                };

                TimelineBuffer.prototype.leave = function (name, time) {
                    this.marks.write(TimelineBuffer.LEAVE | this.getKind(name));
                    this.times.write(time || performance.now());
                    this._depth--;
                };

                /**
                * Constructs an easier to work with TimelineFrame data structure.
                */
                TimelineBuffer.prototype.gatherRange = function (count) {
                    var range = new Profiler.TimelineFrame(null, 0, NaN, NaN);
                    var stack = [range];
                    var times = this.times;
                    var topLevelFrameCount = 0;
                    this.marks.forEachInReverse(function (mark, i) {
                        var time = times.get(i);
                        if ((mark & 0xFFFF0000) === TimelineBuffer.LEAVE) {
                            if (stack.length === 1) {
                                topLevelFrameCount++;
                                if (topLevelFrameCount > count) {
                                    return true;
                                }
                            }
                            stack.push(new Profiler.TimelineFrame(stack[stack.length - 1], mark & 0xFFFF, NaN, time));
                        } else if ((mark & 0xFFFF0000) === TimelineBuffer.ENTER) {
                            var node = stack.pop();
                            var top = stack[stack.length - 1];
                            node.startTime = time;
                            if (!top.children) {
                                top.children = [node];
                            } else {
                                top.children.unshift(node);
                            }
                        }
                    });
                    if (!range.children || !range.children.length) {
                        return null;
                    }
                    range.startTime = range.children[0].startTime;
                    range.endTime = range.children[range.children.length - 1].endTime;
                    return range;
                };
                TimelineBuffer.ENTER = 0xBEEF0000 | 0;
                TimelineBuffer.LEAVE = 0xDEAD0000 | 0;
                return TimelineBuffer;
            })();
            Profiler.TimelineBuffer = TimelineBuffer;
        })(Tools.Profiler || (Tools.Profiler = {}));
        var Profiler = Tools.Profiler;
    })(Shumway.Tools || (Shumway.Tools = {}));
    var Tools = Shumway.Tools;
})(Shumway || (Shumway = {}));
