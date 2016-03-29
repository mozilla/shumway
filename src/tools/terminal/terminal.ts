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
module Shumway.Tools.Terminal {

  import clamp = NumberUtilities.clamp;
  import trimMiddle = StringUtilities.trimMiddle;

  export class Buffer {
    lines: string [];
    format: any [];
    time: number [];
    repeat: number [];
    length = 0;
    constructor() {
      this.lines = [];
      this.format = [];
      this.time = [];
      this.repeat = [];
      this.length = 0;
    }
    append(line, color) {
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
    }
    get(i) {
      return this.lines[i];
    }
    getFormat(i) {
      return this.format[i];
    }
    getTime(i) {
      return this.time[i];
    }
    getRepeat(i) {
      return this.repeat[i];
    }
  }

  /**
   * If you're going to write a lot of data to the browser console you're gonna have a bad time. This may make your
   * life a little more pleasant.
   */
  export class Terminal {
    lineColor = "#2A2A2A";
    alternateLineColor = "#262626";
    textColor = "#FFFFFF";
    selectionColor = "#96C9F3";
    selectionTextColor = "#000000";
    ratio: number = 1;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    fontSize: number;
    lineIndex: number;
    pageIndex: number;
    columnIndex: number;
    selection: any;
    lineHeight: number;
    hasFocus: boolean;
    pageLineCount: number;
    refreshFrequency: number;
    textMarginLeft: number;
    textMarginBottom: number;
    buffer: Buffer;
    showLineNumbers = true;
    showLineTime = false;
    showLineCounter = false;

    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.canvas.focus();
      this.context = <any>canvas.getContext('2d', { original: true });
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
      var KEY_H = 72;
      var KEY_S = 83;

      function onFocusIn(event) {
        this.hasFocus = true;
      }
      function onFocusOut(event) {
        this.hasFocus = false;
      }

      function onKeyDown(event) {
        var delta = 0;
        switch (event.keyCode) {
          case KEY_H:
            this.printHelp();
            break;
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
            if (event.metaKey || event.ctrlKey) {
              this.selection = {start: 0, end: this.buffer.length - 1};
              event.preventDefault();
            }
            break;
          case KEY_C:
          case KEY_S:
            if (event.metaKey || event.ctrlKey) {
              var str = "";
              if (this.selection) {
                for (var i = this.selection.start; i <= this.selection.end; i++) {
                  str += this.buffer.get(i) + "\n";
                }
              } else {
                str = this.buffer.get(this.lineIndex);
              }
              if (event.keyCode === KEY_C) {
                alert(str);
              } else {
                window.open(URL.createObjectURL(
                  new Blob([str], {type: 'text/plain'})), '_blank');
              }
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
    }

    public printHelp(): void {
      var lines = [
        'h - help',
        'n - turn on/off line numbers',
        't - turn on/off line time',
        'arrow_keys - navigation',
        'cmd/ctrl+a - select all',
        'cmd/ctrl+c - copy/alert selection',
        'cmd/ctrl+s - open selection in new tab',
        'shift+arrow_keys - selection'
      ];
      lines.forEach((l) => this.buffer.append(l, '#002000'));
    }

    public resize() {
      this._resizeHandler();
    }

    private _resizeHandler() {
      var parent = this.canvas.parentElement;
      var cw = parent.clientWidth;
      var ch = parent.clientHeight && (parent.clientHeight - 1);

      var devicePixelRatio = window.devicePixelRatio || 1;
      var backingStoreRatio = 1;
      if (devicePixelRatio !== backingStoreRatio) {
        this.ratio = devicePixelRatio / backingStoreRatio;
        this.canvas.width = cw * this.ratio;
        this.canvas.height = ch * this.ratio;
        this.canvas.style.width = cw + 'px';
        this.canvas.style.height = ch + 'px';
      } else {
        this.ratio = 1;
        this.canvas.width = cw;
        this.canvas.height = ch;
      }
      this.pageLineCount = Math.floor(this.canvas.height / this.lineHeight);
    }

    gotoLine(index) {
      this.lineIndex = clamp(index, 0, this.buffer.length - 1);
    }
    scrollIntoView() {
      if (this.lineIndex < this.pageIndex) {
        this.pageIndex = this.lineIndex;
      } else if (this.lineIndex >= this.pageIndex + this.pageLineCount) {
        this.pageIndex = this.lineIndex - this.pageLineCount + 1;
      }
    }
    scroll(delta) {
      this.gotoLine(this.lineIndex + delta);
      this.scrollIntoView();
    }
    paint() {
      var lineCount = this.pageLineCount;
      if (this.pageIndex + lineCount > this.buffer.length) {
        lineCount = this.buffer.length - this.pageIndex;
      }

      var charSize = 5;
      var lineNumberMargin = this.textMarginLeft;
      var lineTimeMargin = lineNumberMargin + (this.showLineNumbers ? (String(this.buffer.length).length + 2) * charSize: 0);
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
    }

    refreshEvery(ms) {
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
    }

    isScrolledToBottom () {
      return this.lineIndex === this.buffer.length - 1;
    }
  }
}
