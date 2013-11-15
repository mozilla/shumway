/**
 * Frame Rate Monitor
 */
var Timeline = (function () {
  var barColor = "rgba(255,255,255, 0.075)";
  var backgroundColor = "rgb(61, 61, 61)";
  var backgroundColorInfo = "rgba(0,0,0, 0.85)";
  var fpsLineColor = "rgb(255,64,0)";
  var textColor = "#ccc";

  function timeline(canvas) {
    this.depth = 0;
    this.start = 0;
    this.index = 0;
    this.marks = new CircularBuffer(Int32Array);
    this.times = new CircularBuffer(Float64Array);
    this.frameRate = 12;
    this.maxFrameTime = 1000 * 2 / this.frameRate;
    this.refreshFrequency = 10;
    this.refreshCounter = 0;
    this.count = 0;
    this.kinds = createEmptyObject();
    this.kindCount = 0;
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { original: true });
    this.fillStyles = ["rgb(85, 152, 213)", "#bfd8a7", "#d906d7"];
    window.addEventListener('resize', this.resizeHandler.bind(this), false);
    this.resizeHandler();
  }

  timeline.prototype.setFrameRate = function setFrameRate(frameRate) {
    this.frameRate = frameRate;
    this.maxFrameTime = 1000 * 2 / frameRate;
  };

  timeline.prototype.refreshEvery = function refreshEvery(freq) {
    this.refreshFrequency = freq;
    this.refreshCounter = 0;
  };

  var ENTER = 0xBEEF0000 | 0;
  var LEAVE = 0xDEAD0000 | 0;

  timeline.prototype.registerKind = function getKind(name, fillStyle) {
    if (this.kinds[name] === undefined) {
      this.fillStyles[this.kindCount] = fillStyle;
      this.kinds[name] = this.kindCount++;
    } else {
      this.fillStyles[this.kinds[name]] = fillStyle;
    }
  };

  timeline.prototype.getKind = function getKind(name) {
    if (this.kinds[name] === undefined) {
      this.kinds[name] = this.kindCount ++;
      if (this.kindCount > this.fillStyles.length) {
        this.fillStyles.push(randomStyle());
      }
    }
    return this.kinds[name];
  };

  timeline.prototype.enter = function enter(name) {
    this.depth++;
    this.marks.write(ENTER | this.getKind(name));
    this.times.write(performance.now());
  };

  timeline.prototype.leave = function leave(name) {
    this.marks.write(LEAVE | this.getKind(name));
    this.times.write(performance.now());
    this.depth--;
    if (this.depth === 0) {
      this.count++;
      if (++this.refreshCounter == this.refreshFrequency) {
        this.refreshCounter = 0;
        this.paint();
      }
    }
  };

  timeline.prototype.gatherFrames = function gatherFrames(maxFrames) {
    var stack = [];
    var frames = [];
    var times = this.times;
    maxFrames++;
    this.marks.forEachInReverse(function (mark, i) {
      var time = times.get(i);
      if ((mark & 0xFFFF0000) === ENTER) {
        var node = stack.pop();
        node.startTime = time;
        if (!stack.length) {
          if (frames.length && !frames[0].total) {
            frames[0].total = frames[0].startTime - time;
          }
          frames.unshift(node);
        } else {
          var top = stack.top();
          if (!top.children) {
            top.children = [node];
          } else {
            top.children.push(node);
          }
        }
      } else if ((mark & 0xFFFF0000) === LEAVE) {
        if (frames.length > maxFrames) {
          return true;
        }
        stack.push({ kind: mark & 0xFFFF, endTime: time });
      }
    });
    return frames;
  };

  timeline.prototype.resizeHandler = function resizeHandler(event) {
    var parent = this.canvas.parentElement;
    this.cw = parent.offsetWidth;
    this.ch = parent.offsetHeight - 1;

    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = this.context.webkitBackingStorePixelRatio ||
                            this.context.mozBackingStorePixelRatio ||
                            this.context.msBackingStorePixelRatio ||
                            this.context.oBackingStorePixelRatio ||
                            this.context.backingStorePixelRatio || 1;

    if (devicePixelRatio !== backingStoreRatio) {
      var ratio = devicePixelRatio / backingStoreRatio;
      this.canvas.width = this.cw * ratio;
      this.canvas.height = this.ch * ratio;
      this.canvas.style.width = this.cw + 'px';
      this.canvas.style.height = this.ch + 'px';
      this.context.scale(ratio, ratio);
    } else {
      this.canvas.width = this.cw;
      this.canvas.height = this.ch;
    }

    this.context.font = 11 + 'px Consolas, "Liberation Mono", Courier, monospace';
  };

  timeline.prototype.paint = function paint() {
    //var t = performance.now();
    var w = 10;
    var gap = 1;
    var maxFrames = (this.cw / (w + gap)) | 0;
    var frames = this.gatherFrames(maxFrames);
    //var t1 = performance.now() - t;

    var context = this.context;
    var maxFrameTime = this.maxFrameTime;
    var fillStyles = this.fillStyles;

    context.clearRect(0, 0, this.cw, this.ch);

    var maxFrameRate = 0;
    var maxFrameRateCount = 0;
    var avgFrameRate = 0;
    var avgFrameRateCount = 0;
    var offsetW;

    context.save();
    context.translate(0, this.ch);
    context.scale(1, -this.ch / maxFrameTime);

    for (var i = 0; i < frames.length - 1; i++) {
      var frame = frames[i];
      maxFrameRate += frame.endTime - frame.startTime;
      maxFrameRateCount++;
      if (frame.total) {
        avgFrameRate += frame.total;
        avgFrameRateCount++;
      }
      offsetW = i * (w + gap);
      context.fillStyle = barColor;
      context.fillRect(offsetW, 0, w, frames[i + 1].startTime - frame.startTime);
      drawNode(frame, frame.startTime);
    }

    function drawNode(node, frameStartTime) {
      var nodeTime = node.endTime - node.startTime;
      var offsetH = node.startTime - frameStartTime;
      context.fillStyle = fillStyles[node.kind];
      context.fillRect(offsetW, offsetH, w, nodeTime);
      if (node.children) {
        var children = node.children;
        for (var i = 0, n = children.length; i < n; i++) {
          drawNode(children[i], frameStartTime);
        }
      }
    }

    /**
     * Draw FPS line
     */
    var lineH = 1000 / this.frameRate;
    context.beginPath();
    context.lineWidth = 0.5;
    context.moveTo(0, lineH);
    context.lineTo(this.cw, lineH);
    context.strokeStyle = fpsLineColor;
    context.stroke();

    context.restore();

    /**
     * Draw Info
     */
    context.fillStyle = backgroundColorInfo;
    context.fillRect(0, 0, this.cw, 20);

    var textOffset;
    var sFrameCount = "FRAMES:" + this.count;
    var sMaxFrameRate = "TFPS:" + Math.round(1000 * maxFrameRateCount / maxFrameRate);
    var sAvgFrameRate = "FPS:" + Math.round(1000 * avgFrameRateCount / avgFrameRate);

    textOffset = 5;
    context.fillStyle = textColor;
    context.fillText(sFrameCount, textOffset, 13);
    textOffset += context.measureText(sFrameCount).width + 10;
    context.fillText(sMaxFrameRate, textOffset, 13);
    textOffset += context.measureText(sMaxFrameRate).width + 10;
    context.fillText(sAvgFrameRate, textOffset, 13);

    textOffset = this.cw;
    for (var k in this.kinds) {
      context.fillStyle = this.fillStyles[this.getKind(k)];
      textOffset -= context.measureText(k).width + 10;
      this.context.fillText(k, textOffset, 13);
    }
    //var tt = performance.now() - t;
    //console.log(tt + " ms", t1, tt-t1);
  };

  return timeline;
})();
