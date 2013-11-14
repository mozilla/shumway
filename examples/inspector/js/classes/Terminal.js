/**
 * If you're going to write a lot of data to the browser console you're gonna have a bad time. This may make your
 * life a little more pleasant.
 */
var Terminal = (function () {
  var lineColor = "#2A2A2A";
  var alternateLineColor = "#262626";
  var textColor = "#FFFFFF";
  var selectionColor = "#96C9F3";
  var selectionTextColor = "#000000";
  function clamp(x, min, max) {
    if (x < min) {
      return min;
    } else if (x > max) {
      return max;
    } else {
      return x;
    }
  }

  var Buffer = (function () {
    function buffer() {
      this.lines = [];
      this.format = [];
      this.time = [];
      this.repeat = [];
      this.length = 0;
    }
    buffer.prototype.append = function append(line, color) {
      var lines = this.lines;
      if (lines.length > 0 && lines[lines.length - 1] === line) {
        this.repeat[lines.length - 1] ++;
        return;
      }
      this.lines.push(line);
      this.repeat.push(1);
      this.format.push(color ? {backgroundFillStyle: color} : undefined);
      this.time.push(performance.now());
      this.length ++;
    };
    buffer.prototype.get = function get(i) {
      return this.lines[i];
    };
    buffer.prototype.getFormat = function getFormat(i) {
      return this.format[i];
    };
    buffer.prototype.getTime = function getTime(i) {
      return this.time[i];
    };
    buffer.prototype.getRepeat = function getRepeat(i) {
      return this.repeat[i];
    };
    return buffer;
  })();

  function terminal(canvas) {
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
    this.pageLineCount = Math.floor(this.canvas.height / this.lineHeight);

    // Support for HiDPI displays
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = this.context.webkitBackingStorePixelRatio ||
                            this.context.mozBackingStorePixelRatio ||
                            this.context.msBackingStorePixelRatio ||
                            this.context.oBackingStorePixelRatio ||
                            this.context.backingStorePixelRatio || 1;

    if (devicePixelRatio !== backingStoreRatio) {
      // Upscale the canvas if the two ratios don't match
      var ratio = devicePixelRatio / backingStoreRatio;
      var oldWidth = this.canvas.width;
      var oldHeight = this.canvas.height;
      this.canvas.width = oldWidth * ratio;
      this.canvas.height = oldHeight * ratio;
      this.canvas.style.width = oldWidth + 'px';
      this.canvas.style.height = oldHeight + 'px';
      // Now scale the context to counter the fact that we've manually scaled our canvas element
      this.context.scale(ratio, ratio);
    }

    this.context.font = this.fontSize + 'px Consolas, "Liberation Mono", Courier, monospace';
    this.textMarginLeft = 4;
    this.textMarginBottom = 4;
    this.refreshFrequency = 0;

    this.buffer = new Buffer();

    canvas.addEventListener('keydown', onKeyDown.bind(this), false);
    canvas.addEventListener('focus', onFocusIn.bind(this), false);
    canvas.addEventListener('blur', onFocusOut.bind(this), false);

    var PAGE_UP = 33;
    var PAGE_DOWN = 34;
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

    this.showLineNumbers = true;
    this.showLineTime = false;
    this.showLineCounter = false;

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
          delta = -this.lineIndex;
          break;
        case PAGE_DOWN:
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
            this.selection = {start: 0, end: this.buffer.length};
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
            } else {
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
            this.selection = {start: this.lineIndex - delta, end: this.lineIndex};
          } else if (delta < 0) {
            this.selection = {start: this.lineIndex, end: this.lineIndex - delta};
          }
        } else {
          if (this.lineIndex > this.selection.start) {
            this.selection.end = this.lineIndex;
          } else {
            this.selection.start = this.lineIndex;
          }
        }
      } else if (delta) {
        this.selection = null;
      }
      this.paint();
    }
  };
  terminal.prototype.gotoLine = function (index) {
    this.lineIndex = clamp(index, 0, this.buffer.length - 1);
  };
  terminal.prototype.scrollIntoView = function () {
    if (this.lineIndex < this.pageIndex) {
      this.pageIndex = this.lineIndex;
    } else if (this.lineIndex >= this.pageIndex + this.pageLineCount) {
      this.pageIndex = this.lineIndex - this.pageLineCount + 1;
    }
  };
  terminal.prototype.scroll = function (delta) {
    this.gotoLine(this.lineIndex + delta);
    this.scrollIntoView();
  };
  terminal.prototype.paint = function () {
    var lineCount = this.pageLineCount;
    if (this.pageIndex + lineCount > this.buffer.length) {
      lineCount = this.buffer.length - this.pageIndex;
    }

    var charSize = 5;
    var lineNumberMargin = this.textMarginLeft;
    var lineTimeMargin = lineNumberMargin + (this.showLineNumbers ? String(this.buffer.length).length * charSize : 0);
    var lineRepeatMargin = lineTimeMargin + (this.showLineTime ? charSize * 8 : 2 * charSize);
    var lineMargin = lineRepeatMargin + charSize * 5;

    var w = this.canvas.width;
    var h = this.lineHeight;
    for (var i = 0; i < lineCount; i++) {
      var y = i * this.lineHeight;
      var lineIndex = this.pageIndex + i;
      var line = this.buffer.get(lineIndex);
      var lineFormat = this.buffer.getFormat(lineIndex);
      var lineRepeat = this.buffer.getRepeat(lineIndex);
      var lineTimeDelta = lineIndex > 1 ? this.buffer.getTime(lineIndex) - this.buffer.getTime(lineIndex - 1) : 0;

      this.context.fillStyle = lineIndex % 2 ? lineColor : alternateLineColor;
      if (lineFormat && lineFormat.backgroundFillStyle) {
        this.context.fillStyle = lineFormat.backgroundFillStyle;
      }
      this.context.fillRect(0, y, w, h);
      this.context.fillStyle = selectionTextColor;
      this.context.fillStyle = textColor;

      if (this.selection && lineIndex >= this.selection.start && lineIndex <= this.selection.end) {
        this.context.fillStyle = selectionColor;
        this.context.fillRect(0, y, w, h);
        this.context.fillStyle = selectionTextColor;
      }
      if (this.hasFocus && lineIndex === this.lineIndex) {
        this.context.fillStyle = selectionColor;
        this.context.fillRect(0, y, w, h);
        this.context.fillStyle = selectionTextColor;
      }
      if (this.columnIndex > 0) {
        line = line.substring(this.columnIndex);
      }
      var marginTop = (i + 1) * this.lineHeight - this.textMarginBottom;
      if (this.showLineNumbers) {
        this.context.fillText(lineIndex, lineNumberMargin, marginTop);
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

  terminal.prototype.refreshEvery = function (ms) {
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

  terminal.prototype.isScrolledToBottom = function () {
    return this.lineIndex === this.buffer.length - 1;
  };

  return terminal;
})();
