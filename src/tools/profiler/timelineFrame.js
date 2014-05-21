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
            /**
            * Represents a single timeline frame range and makes it easier to work with the compacted
            * timeline buffer data.
            */
            var TimelineFrame = (function () {
                function TimelineFrame(parent, kind, startTime, endTime) {
                    this.parent = parent;
                    this.kind = kind;
                    this.startTime = startTime;
                    this.endTime = endTime;
                    // ...
                }
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
                    if (startTime > this.endTime || endTime < this.startTime || endTime < startTime) {
                        return null;
                    } else {
                        return [
                            this.getNearestChild(startTime),
                            this.getNearestChildReverse(endTime)
                        ];
                    }
                };

                TimelineFrame.prototype.getNearestChild = function (time) {
                    var children = this.children;
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
                        } else if (time > child.endTime) {
                            imin = imid + 1;
                        } else {
                            imax = imid;
                        }
                    }
                    return Math.ceil((imin + imax) / 2);
                };

                TimelineFrame.prototype.getNearestChildReverse = function (time) {
                    var children = this.children;
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
                        } else if (time > child.endTime) {
                            imin = imid;
                        } else {
                            imax = imid - 1;
                        }
                    }
                    return ((imin + imax) / 2) | 0;
                };

                /**
                * Finds the deepest child that intersects with the specified time.
                */
                TimelineFrame.prototype.query = function (time) {
                    if (time < this.startTime || time > this.endTime) {
                        return null;
                    }
                    var children = this.children;
                    if (children) {
                        for (var i = 0; i < children.length; i++) {
                            var child = children[i];
                            if (time >= child.startTime && time <= child.endTime) {
                                return child.query(time);
                            }
                        }
                    }
                    return this;
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
                return TimelineFrame;
            })();
            Profiler.TimelineFrame = TimelineFrame;
        })(Tools.Profiler || (Tools.Profiler = {}));
        var Profiler = Tools.Profiler;
    })(Shumway.Tools || (Shumway.Tools = {}));
    var Tools = Shumway.Tools;
})(Shumway || (Shumway = {}));
