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
      this.length = 0;
    }
    buffer.prototype.append = function append(line, color) {
      this.lines.push(line);
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
    return buffer;
  })();

  function terminal(canvas) {
    this.canvas = canvas;
    this.canvas.focus();
    this.context = canvas.getContext('2d');
    this.context.fillStyle = "#FFFFFF";
    this.fontSize = 11;
    this.lineIndex = 0;
    this.pageIndex = 0;
    this.columnIndex = 0;
    this.selection = null;
    this.lineHeight = 16;
    this.pageLineCount = Math.floor(this.canvas.height / this.lineHeight) - 1;

    // HACK support of HiDPI displays
    this.pixelRatio = 'devicePixelRatio' in window ? window.devicePixelRatio : 1;
    this.pixelRatio = 1;
    if (this.pixelRatio > 1) {
      var cssScale = 'scale(' + (1 / this.pixelRatio) + ', ' + (1 / this.pixelRatio) + ')';
      canvas.setAttribute('style', '-moz-transform: ' + cssScale + ';' +
        '-webkit-transform: ' + cssScale + ';' +
        'transform: ' + cssScale + ';' +
        '-moz-transform-origin: 0% 0%;' +
        '-webkit-transform-origin: 0% 0%;' +
        'transform-origin: 0% 0%;');
    }

    this.lineHeight *= this.pixelRatio;
    this.canvas.width *= this.pixelRatio;
    this.canvas.height *= this.pixelRatio;
    this.fontSize *= this.pixelRatio;
    this.context.font = this.fontSize + 'px Consolas';
    this.textMarginLeft = 4 * this.pixelRatio;
    this.textMarginBottom = 4 * this.pixelRatio;
    this.refreshFrequency = 0;

    this.buffer = new Buffer();

    canvas.addEventListener('keydown', onKeyDown.bind(this), false);

    var PAGE_UP = 33;
    var PAGE_DOWN = 34;
    var UP = 38;
    var DOWN = 40;
    var LEFT = 37;
    var RIGHT = 39;
    var KEY_A = 65;
    var KEY_C = 67;

    function onKeyDown(event) {
      var delta = 0;
      switch (event.keyCode) {
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

    var charSize = 5 * this.pixelRatio;
    var lineNumberTextSize = String(this.buffer.length).length * charSize + charSize;
    var lineTimeTextSize = 8 * charSize;
    var lineNumberMarginLeft = this.textMarginLeft;
    var lineTimeMarginLeft = this.textMarginLeft + lineNumberTextSize;
    var lineMarginLeft = lineTimeMarginLeft + lineTimeTextSize + charSize;

    var w = this.canvas.width;
    var h = this.lineHeight;
    for (var i = 0; i < lineCount; i++) {
      var y = i * this.lineHeight;
      var lineIndex = this.pageIndex + i;
      var line = this.buffer.get(lineIndex);
      var lineFormat = this.buffer.getFormat(lineIndex);
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
      if (lineIndex === this.lineIndex) {
        this.context.fillStyle = selectionColor;
        this.context.fillRect(0, y, w, h);
        this.context.fillStyle = selectionTextColor;
      }
      if (this.columnIndex > 0) {
        line = line.substring(this.columnIndex);
      }
      var marginTop = (i + 1) * this.lineHeight - this.textMarginBottom;
      this.context.fillText(lineIndex, lineNumberMarginLeft, marginTop);
      this.context.fillText(lineTimeDelta.toFixed(1).padLeft(' ', 6), lineTimeMarginLeft, marginTop);
      this.context.fillText(line, lineMarginLeft, marginTop);
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