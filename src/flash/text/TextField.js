/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
/*global avm1lib, rgbaObjToStr, rgbIntAlphaToStr, warning, FontDefinition,
  Errors, throwError */

var TextFieldDefinition = (function () {

  var htmlParser = document.createElement('p');

  // Used for measuring text runs, not for rendering
  var measureCtx = document.createElement('canvas').getContext('2d');

  function TextLine(y) {
    this.x = 0;
    this.width = 0;
    this.y = y;
    this.height = 0;
    this.leading = 0;
    this.runs = [];
    this.largestFormat = null;
  }

  /*
   * Parsing, in this context, actually means using the browser's html parser
   * and then removing any tags and attributes that mustn't be supported.
   *
   * After that, two things are generated: a plain-text version of the content,
   * and a tree of objects with types and attributes, representing all nodes.
   */
  function parseHtml(val, initialFormat, multiline) {
    htmlParser.innerHTML = val;
    var rootElement = htmlParser.childNodes.length !== 1 ?
                      htmlParser :
                      htmlParser.childNodes[0];
    // TODO: create the htmlText by serializing the converted tree
    var content = {text : '', htmlText: val, tree : createTrunk(initialFormat)};

    if (rootElement.nodeType === 3) {
      convertNode(rootElement, content.tree.children[0].children, content,
                  multiline);
      return content;
    }

    var initialNodeList = [rootElement];
    // If the outermost node is a <P>, merge its attributes and discard it
    var attributes;
    var format;
    var key;
    if (initialNodeList.length == 1 &&
        rootElement.localName.toUpperCase() == 'P')
    {
      attributes = extractAttributes(rootElement);
      format = content.tree.format;
      for (key in attributes) {
        format[key] = attributes[key];
      }
      initialNodeList = rootElement.childNodes;
      rootElement = rootElement.childNodes[0];
    }
    // If the now-outermost node is a <FONT>, do the same with it
    if (initialNodeList.length == 1 &&
        rootElement.localName.toUpperCase() == 'FONT')
    {
      attributes = extractAttributes(rootElement);
      format = content.tree.children[0].format;
      for (key in attributes) {
        format[key] = attributes[key];
      }
      initialNodeList = rootElement.childNodes;
    }
    convertNodeList(initialNodeList, content.tree.children[0].children, content,
                    multiline);
    return content;
  }

  function createTrunk(initialFormat) {
    // The outermost node is always a <P>, with an ALIGN attribute
    var trunk = {type: 'SPAN', format: {ALIGN: initialFormat.align}, children: []};
    // The first child is then a <FONT>, with FACE, LETTERSPACING and KERNING
    var fontAttributes = { FACE: initialFormat.face,
                           LETTERSPACING: initialFormat.letterSpacing,
                           KERNING: initialFormat.kerning,
                           LEADING: initialFormat.leading,
                           COLOR: initialFormat.color
                         };
    trunk.children[0] = {type: 'FONT', format: fontAttributes, children: []};
    return trunk;
  }

  var knownNodeTypes = {
    'BR': true,
    'LI': true,
    'P': true,
    'B': true,
    'I': true,
    'FONT': true,
    'TEXTFORMAT': true,
    'U': true,
    'A': true,
    'IMG': true,
    'SPAN': true
  };

  function convertNode(input, destinationList, content, multiline) {
    // Ignore all comments, processing instructions and namespaced nodes.
    if (!(input.nodeType === 1 || input.nodeType === 3) || input.prefix) {
      return;
    }

    var node;

    if (input.nodeType === 3) {
      var text = input.textContent;
      node = { type: 'text', text: text, format: null, children: null };
      content.text += text;
      destinationList.push(node);
      return;
    }
    // For unknown node types, skip the node itself, but convert its children
    // and add them to the parent's child list.
    // If |multiline| is false, skip line-breaking nodes, too.
    var nodeType = input.localName.toUpperCase();
    if (!knownNodeTypes[nodeType] ||
        multiline === false && (nodeType === 'P' || nodeType === 'BR'))
    {
      // <sbr /> is a tag the Flash TextField supports for unknown reasons. It
      // apparently acts just like <br>. Unfortunately, the html parser doesn't
      // treat it as a self-closing tag, so the siblings following it are nested
      // after parsing. Hence, we un-nest them manually, and convert the tag to
      // <br>.
      if (nodeType === 'SBR') {
        destinationList.push({type: 'BR', text: null,
                              format: null, children: null});
      }
      convertNodeList(input.childNodes, destinationList, content, multiline);
      return;
    }
    node = {
      type: nodeType,
      text: null,
      format: extractAttributes(input),
      children: []
    };

    convertNodeList(input.childNodes, node.children, content, multiline);
    destinationList.push(node);
  }

  function convertNodeList(from, to, content, multiline) {
    var childCount = from.length;
    for (var i = 0; i < childCount; i++) {
      convertNode(from[i], to, content, multiline);
    }
  }

  /**
   * Creates an object containing all attributes with their localName as keys.
   * Ignores all namespaced attributes, as we don't need them for the
   * TextField's purposes.
   * TODO: Whitelist known attributes and throw out the rest.
   */
  function extractAttributes(node) {
    var attributesList = node.attributes;
    var attributesMap = {};
    for (var i = 0; i < attributesList.length; i++) {
      var attr = attributesList[i];
      if (attr.prefix) {
        continue;
      }
      attributesMap[attr.localName.toUpperCase()] = attr.value;
    }
    return attributesMap;
  }

  function collectRuns(node, state) {
    // for formatNodes, the format is popped after child processing
    var formatNode = false;
    // for blockNodes, the current line is finished after child processing
    var blockNode = false;
    switch (node.type) {
      case 'plain-text':
        var lines = node.lines;
        for (var i = 0; i < lines.length; i++) {
          addRunsForText(state, lines[i]);
          // The last line is finished by the enclosing block
          if (i < lines.length - 1) {
            finishLine(state, true);
          }
        }
        return;
      case 'text': addRunsForText(state, node.text); return;
      case 'BR':
        finishLine(state, true);
        return;
      case 'LI': /* TODO: draw bullet points. */ /* falls through */
      case 'P':
        finishLine(state, false);
        pushFormat(state, node);
        blockNode = true;
        break;

      case 'B': /* falls through */
      case 'I': /* falls through */
      case 'FONT': /* falls through */
      case 'TEXTFORMAT':
        pushFormat(state, node);
        formatNode = true;
        break;

      case 'U': /* TODO: implement <u>-support. */ /* falls through */
      case 'A': /* TODO: implement <a>-support. */ /* falls through */
      case 'IMG': /* TODO: implement <img>-support. */ /* falls through */
      case 'SPAN': /* TODO: implement what puny support for CSS Flash has. */
      /* falls through */
      default:
        // For all unknown nodes, we just emit their children.
    }
    for (var i = 0; i < node.children.length; i++) {
      var child = node.children[i];
      collectRuns(child, state);
    }
    if (formatNode) {
      popFormat(state);
    }
    if (blockNode) {
      finishLine(state, true);
    }
  }
  var WRAP_OPPORTUNITIES = {
    " ": true,
    ".": true,
    "-": true,
    "\t": true
  };
  function addRunsForText(state, text) {
    if (!text) {
      return;
    }
    if (!state.wordWrap) {
      addTextRun(state, text, state.ctx.measureText(text).width);
      return;
    }
    while (text.length) {
      var width = state.ctx.measureText(text).width;
      var availableWidth = state.w - state.line.width;
      if (availableWidth <= 0) {
        finishLine(state, false);
        availableWidth = state.w - state.line.width;
      }
      assert(availableWidth > 0);
      if (width <= availableWidth) {
        addTextRun(state, text, width);
        break;
      } else {
        // Find offset close to where we can wrap by treating all chars as
        // same-width.
        var offset = (text.length / width * availableWidth)|0;
        // Expand to offset we know to be to the right of wrapping position
        while (state.ctx.measureText(text.substr(0, offset)).width <
               availableWidth && offset < text.length)
        {
          offset++;
        }
        // Find last wrapping-allowing character before that
        var wrapOffset = offset;
        while (wrapOffset > -1) {
          if (WRAP_OPPORTUNITIES[text[wrapOffset]]) {
            wrapOffset++;
            break;
          }
          wrapOffset--;
        }
        if (wrapOffset === -1) {
          if (state.line.width > 0) {
            finishLine(state, false);
            continue;
          }
          // No wrapping opportunity found, wrap mid-word
          while (state.ctx.measureText(text.substr(0, offset)).width >
                 availableWidth)
          {
            offset--;
          }
          if (offset === 0) {
            offset = 1;
          }
          wrapOffset = offset;
        }
        var runText = text.substr(0, wrapOffset);
        width = state.ctx.measureText(runText).width;
        addTextRun(state, runText, width);

        if (state.wordWrap) {
          finishLine(state, false);
        }

        text = text.substr(wrapOffset);
      }
    }
  }
  function addTextRun(state, text, width) {
    if (text.length === 0) {
      return;
    }
    // `y` is set by `finishLine`
    var line = state.line;
    var format = state.currentFormat;
    var size = format.size;
    var run = {type: 't', text: text, x: line.width};
    state.runs.push(run);
    state.line.runs.push(run);
    line.width += width|0;
    // TODO: Implement Flash's absurd behavior for leading
    // Specifically, leading is only used if it is set by a <div> tag, or by
    // a <textformat> tag that is the first node in a new line. Whether that
    // line is caused by a <div> tag, <br> or \n is immaterial. I didn't check
    // what happens with word wrapping or setTextFormat, but you should.
    if (line.leading === 0 && format.leading > line.leading) {
      line.leading = format.leading;
    }
    if (!line.largestFormat || size > line.largestFormat.size) {
      line.largestFormat = format;
    }
  }

  // When ending a block or processing a <br> tag, we always want to insert
  // vertical space, even if the current line is empty. `forceNewline` does that
  // by advancing the next line's vertical position.
  function finishLine(state, forceNewline) {
    var line = state.line;
    if (line.runs.length === 0) {
      if (forceNewline) {
        var format = state.currentFormat;
        state.line.y += format.font._metrics.height * format.size +
                        format.leading|0;
      }
      return;
    }
    var runs = line.runs;
    var format = line.largestFormat;
    var baselinePos = line.y + format.font._metrics.ascent * format.size;
    for (var i = runs.length; i--;) {
      runs[i].y = baselinePos;
    }
    var align = (state.currentFormat.align || '').toLowerCase();
    if (state.combinedAlign === null) {
      state.combinedAlign = align;
    } else if (state.combinedAlign !== align) {
      state.combinedAlign = 'mixed';
    }
    // TODO: maybe support justified text somehow
    if (align === 'center' || align === 'right') {
      var offset = Math.max(state.w - line.width, 0);
      if (align === 'center') {
        offset >>= 1;
      }
      for (i = runs.length; i--;) {
        runs[i].x += offset;
      }
    }
    line.height = format.font._metrics.height * format.size + line.leading|0;
    state.maxLineWidth = Math.max(state.maxLineWidth, line.width);
    state.lines.push(line);
    state.line = new TextLine(line.y + line.height);
  }
  function pushFormat(state, node) {
    var attributes = node.format;
    var format = Object.create(state.formats[state.formats.length - 1]);
    var fontChanged = false;
    switch (node.type) {
      case 'P':
        if (attributes.ALIGN === format.align) {
          return;
        }
        format.align = attributes.ALIGN;
        break;
      case 'B':
        format.bold = true;
        fontChanged = true;
        break;
      case 'I':
        format.italic = true;
        fontChanged = true;
        break;
      case 'FONT':
        if (attributes.COLOR !== undefined) {
          format.color = attributes.COLOR;
        }
        if (attributes.FACE !== undefined) {
          format.face = attributes.FACE;
          fontChanged = true;
        }
        if (attributes.SIZE !== undefined) {
          format.size = parseFloat(attributes.SIZE);
        }
        if (attributes.LETTERSPACING !== undefined) {
          format.letterspacing = parseFloat(attributes.LETTERSPACING);
        }
        if (attributes.KERNING !== undefined) {
          // TODO: properly parse this in extractAttributes
          format.kerning = attributes.KERNING && true;
        }
      /* falls through */
      case 'TEXTFORMAT':
        // `textFormat` has, among others, the same attributes as `font`
        if (attributes.LEADING !== undefined) {
          format.leading = parseFloat(attributes.LEADING);
        }
        if (attributes.INDENT !== undefined) {
          // TODO: figure out if indents accumulate and how they apply to text
          // already in the line
          state.line.x = attributes.INDENT;
          state.line.width += attributes.INDENT|0;
        }
        // TODO: support leftMargin, rightMargin & blockIndent
        // TODO: support tabStops
        break;
      default:
        warning('Unknown format node encountered: ' + node.type); return;
    }
    if (state.textColor !== null) {
      format.color = rgbIntAlphaToStr(state.textColor, 1);
    }
    if (fontChanged) {
      resolveFont(format, state.embedFonts);
    }
    format.str = makeFormatString(format);
    state.formats.push(format);
    state.runs.push({type: 'f', format: format});
    state.currentFormat = format;
    state.ctx.font = format.str;
  }
  function popFormat(state) {
    state.formats.pop();
    var format = state.currentFormat = state.formats[state.formats.length - 1];
    state.runs.push({type: 'f', format: format});
    state.ctx.font = state.str;
  }
  function makeFormatString(format) {
    // Order of the font arguments: <style> <weight> <size> <family>
    var boldItalic = '';
    if (format.italic) {
      boldItalic += 'italic';
    }
    if (format.bold) {
      boldItalic += ' bold';
    }
    // We don't use format.face because format.font contains the resolved name.
    return boldItalic + ' ' + format.size + 'px ' +
           (format.font._uniqueName || format.font._fontName);
  }

  function resolveFont(format, embedded) {
    var face = format.face.toLowerCase();
    if (face === '_sans') {
      face = 'sans-serif';
    } else if (face === '_serif') {
      face = 'serif';
    } else if (face === '_typewriter') {
      face = 'monospace';
    }
    var style;
    if (format.bold) {
      if (format.italic) {
        style = 'boldItalic';
      } else {
        style = 'bold';
      }
    } else if (format.italic) {
      style = 'italic';
    } else {
      style = 'regular';
    }
    var font = FontDefinition.getFont(face, style, embedded);
    assert(font);
    format.font = font;
  }

  var def = {
    __class__: 'flash.text.TextField',

    initialize: function () {
      var initialFormat = this._defaultTextFormat = {
        align: 'LEFT', face: 'serif', size: 12,
        letterspacing: 0, kerning: 0, color: 0, leading: 0
      };
      this._type = 'dynamic';
      this._selectable = true;
      this._textWidth = 0;
      this._textHeight = 0;
      this._scrollV = 1;
      this._maxScrollV = 1;
      this._bottomScrollV = 1;
      this._lines = [];
      this._embedFonts = false;
      this._autoSize = 'none';
      this._wordWrap = false;
      this._multiline = false;
      this._condenseWhite = false;
      this._background = false;
      this._border = false;
      this._backgroundColor = 0xffffff;
      this._backgroundColorStr = "#ffffff";
      this._borderColor = 0x0;
      this._borderColorStr = "#000000";
      this._textColor = null;
      this._drawingOffsetH = 0;
      this._bbox = {xMin: 0, yMin: 0, xMax: 2000, yMax: 2000};

      var s = this.symbol;
      if (!s) {
        this._currentTransform.tx -= 40;
        this._currentTransform.ty -= 40;
        resolveFont(initialFormat, false);
        this.text = '';
        return;
      }

      var tag = s.tag;

      var bbox = tag.bbox;
      this._currentTransform.tx += bbox.xMin;
      this._currentTransform.ty += bbox.yMin;
      this._bbox.xMax = bbox.xMax - bbox.xMin;
      this._bbox.yMax = bbox.yMax - bbox.yMin;

      if (tag.hasLayout) {
        initialFormat.size = tag.fontHeight / 20;
        if (typeof initialFormat.leading === 'number') {
          initialFormat.leading = tag.leading / 20;
        }
      }
      if (tag.hasColor) {
        initialFormat.color = rgbaObjToStr(tag.color);
      }
      if (tag.hasFont) {
        var font = FontDefinition.getFontByUniqueName(tag.font);
        initialFormat.font = font;
        initialFormat.face = font._fontName;
        initialFormat.bold = font.symbol.bold;
        initialFormat.italic = font.symbol.italic;
        initialFormat.str = makeFormatString(initialFormat);
      }

      this._embedFonts = !!tag.useOutlines;

      switch (tag.align) {
        case 1: initialFormat.align = 'right'; break;
        case 2: initialFormat.align = 'center'; break;
        case 3: initialFormat.align = 'justified'; break;
        default: // 'left' is pre-set
      }

      this._selectable = !tag.noSelect;
      this._multiline = !!tag.multiline;
      this._wordWrap = !!tag.wordWrap;
      this._border = !!tag.border;
      // TODO: Find out how the IDE causes textfields to have a background

      if (tag.initialText) {
        if (tag.html) {
          this.htmlText = tag.initialText;
        } else {
          this.text = tag.initialText;
        }
      } else {
        this.text = '';
      }
    },

    _getAS2Object: function () {
      if (!this.$as2Object) {
        new avm1lib.AS2TextField(this);
      }
      return this.$as2Object;
    },

    replaceText: function(begin, end, str) {
      // TODO: preserve formatting
      var text = this._content.text;
      this.text = text.substring(0, begin) + str + text.substring(end);
    },

    draw: function (ctx, ratio, colorTransform) {
      this.ensureDimensions();
      var bounds = this._bbox;
      var width = bounds.xMax / 20;
      var height = bounds.yMax / 20;
      if (width <= 0 || height <= 0) {
        return;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width + 1, height + 1);
      ctx.clip();
      if (this._background) {
        colorTransform.setFillStyle(ctx, this._backgroundColorStr);
        ctx.fill();
      }
      if (this._border) {
        colorTransform.setStrokeStyle(ctx, this._borderColorStr);
        ctx.lineCap = "square";
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, width|0, height|0);
      }
      ctx.closePath();

      if (this._lines.length === 0) {
        ctx.restore();
        return;
      }

      ctx.translate(2, 2);
      ctx.save();
      colorTransform.setAlpha(ctx);
      var runs = this._content.textruns;
      var offsetY = this._lines[this._scrollV - 1].y;
      for (var i = 0; i < runs.length; i++) {
        var run = runs[i];
        if (run.type === 'f') {
          ctx.restore();
          ctx.font = run.format.str;
          // TODO: only apply color and alpha if it actually changed
          colorTransform.setFillStyle(ctx, run.format.color);
          ctx.save();
          colorTransform.setAlpha(ctx);
        } else {
          assert(run.type === 't', 'Invalid run type: ' + run.type);
          if (run.y < offsetY) {
            continue;
          }
          ctx.fillText(run.text, run.x - this._drawingOffsetH, run.y - offsetY);
        }
      }
      ctx.restore();
      ctx.restore();
    },

    invalidateDimensions: function() {
      this._invalidate();
      this._invalidateBounds();
      this._dimensionsValid = false;
    },

    ensureDimensions: function() {
      if (this._dimensionsValid) {
        return;
      }
      var bounds = this._bbox;
      var initialFormat = this._defaultTextFormat;
      resolveFont(initialFormat, this._embedFonts);
      var firstRun = {type: 'f', format: initialFormat};
      var width = Math.max(bounds.xMax / 20 - 4, 1);
      var height = Math.max(bounds.yMax / 20 - 4, 1);
      var state = {ctx: measureCtx, w: width, h: height, maxLineWidth: 0,
                   formats: [initialFormat], currentFormat: initialFormat,
                   line: new TextLine(0), lines: [], runs: [firstRun],
                   wordWrap: this._wordWrap, combinedAlign: null,
                   textColor: this._textColor, embedFonts: this._embedFonts};
      collectRuns(this._content.tree, state);
      finishLine(state, false);
      this._textWidth = state.maxLineWidth|0;
      this._textHeight = state.line.y|0;
      this._lines = state.lines;
      this._content.textruns = state.runs;
      this._scrollV = 1;
      this._maxScrollV = 1;
      this._bottomScrollV = 1;
      var autoSize = this._autoSize;
      if (autoSize === 'none') {
        var maxVisibleY = (bounds.yMax - 80) / 20;
        if (this._textHeight > maxVisibleY) {
          for (var i = 0; i < state.lines.length; i++) {
            var line = state.lines[i];
            if (line.y + line.height > maxVisibleY) {
              this._maxScrollV = i + 1;
              this._bottomScrollV = i === 0 ? 1 : i;
              break;
            }
          }
        }
      } else {
        var targetWidth = this._textWidth;
        var align = state.combinedAlign;
        var diffX = 0;
        if (align !== 'mixed') {
          switch (autoSize) {
            case 'left':
              break;
            case 'center':
              diffX = (width - targetWidth) >> 1;
              break;
            case 'right':
              diffX = width - targetWidth;
          }
          // Note: the drawing offset is not in Twips!
          if (align === 'left') {
            this._drawingOffsetH = 0;
          } else {
            var offset;
            switch (autoSize) {
              case 'left': offset = width - targetWidth; break;
              case 'center': offset = diffX << 1; break;
              case 'right': offset = diffX; break;
            }
            if (align === 'center') {
              offset >>= 1;
            }
            this._drawingOffsetH = offset;
          }
          this._invalidateTransform();
          this._currentTransform.tx += diffX*20|0;
          bounds.xMax = (targetWidth*20|0) + 80;
        }
        bounds.yMax = (this._textHeight*20|0) + 80;
        this._invalidateBounds();
      }
      this._dimensionsValid = true;
    },

    get text() {
      return this._content.text;
    },
    set text(val) {
      val = String(val);
      if (this._content && this._content.text === val) {
        return;
      }
      var lines = [];
      var lineOffset = 0;
      for (var index = 0; index < val.length;) {
        var char = val[index];
        if (char === '\r' || char === '\n') {
          lines.push(val.substring(lineOffset, index));
          lineOffset = index;
          if (char === '\r' && val[index + 1] === '\n') {
            index++;
          }
        }
        index++;
      }
      lines.push(val.substring(lineOffset, index));
      this._content = { tree: createTrunk(this._defaultTextFormat),
                        text: val, htmlText: val
                      };
      this._content.tree.children[0].children[0] = {
        type: 'plain-text', lines: lines
      };
      this.invalidateDimensions();
    },

    get htmlText() {
      return this._content.htmlText;
    },
    set htmlText(val) {
      if (this._htmlText === val) {
        return;
      }
      // Flash resets the bold and italic flags when an html value is set.
      this._defaultTextFormat.bold = false;
      this._defaultTextFormat.italic = false;
      this._content = parseHtml(val, this._defaultTextFormat, this._multiline);
      this.invalidateDimensions();
    },

    get defaultTextFormat() {
      return new flash.text.TextFormat().fromObject(this._defaultTextFormat);
    },
    set defaultTextFormat(val) {
      this._defaultTextFormat = val.toObject();
      this.invalidateDimensions();
    },

    getTextFormat: function (beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      return this.defaultTextFormat; // TODO
    },
    setTextFormat: function (format, beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      this.defaultTextFormat = format;// TODO
      if (this._content && this._content.text === this._content.htmlText) {
        // HACK replacing format for non-html text
        var text = this.text;
        this._content = null;
        this.text = text;
      }
      this.invalidateDimensions();
    },

    get x() {
      this.ensureDimensions();
      return this._currentTransform.tx;
    },
    set x(val) {
      if (val === this._currentTransform.tx) {
        return;
      }

      this._invalidate();
      this._invalidateBounds();
      this._invalidateTransform();

      this._currentTransform.tx = val;
    },

    get width() { // (void) -> Number
      this.ensureDimensions();
      return this._bbox.xMax;
    },
    set width(value) { // (Number) -> Number
      if (value < 0) {
        return;
      }
      this._bbox.xMax = value;
      // TODO: optimization potential: don't invalidate if !wordWrap and no \n
      this.invalidateDimensions();
    },

    get height() { // (void) -> Number
      this.ensureDimensions();
      return this._bbox.yMax;
    },
    set height(value) { // (Number) -> Number
      if (value < 0) {
        return;
      }
      this._bbox.yMax = value;
      this._invalidate();
    },
    _getContentBounds: function() {
      this.ensureDimensions();
      return this._bbox;
    },
    _getRegion: function getRegion(targetCoordSpace) {
      return this._getTransformedRect(this._getContentBounds(),
                                      targetCoordSpace);
    },
    getLineMetrics: function(lineIndex) {
      this.ensureDimensions();
      if (lineIndex < 0 || lineIndex >= this._lines.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }
      var line = this._lines[lineIndex];
      var format = line.largestFormat;
      var metrics = format.font._metrics;
      var size = format.size;
      // Rounding for metrics seems to be screwy. A descent of 3.5 gets
      // rounded to 3, but an ascent of 12.8338 gets rounded to 13.
      // For now, round up for things slightly above .5.
      var ascent = metrics.ascent * size + 0.49999 | 0;
      var descent = metrics.descent * size + 0.49999 | 0;
      var leading = metrics.leading * size + 0.49999 + line.leading | 0;
      // TODO: check if metrics values can be floats for embedded fonts
      return new flash.text.TextLineMetrics(line.x + 2, line.width,
                                            line.height,
                                            ascent, descent, leading);
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        text: desc(def, "text"),
        defaultTextFormat: desc(def, "defaultTextFormat"),
        draw: def.draw,
        htmlText: desc(def, "htmlText"),
        replaceText: def.replaceText,
        getTextFormat: def.getTextFormat,
        setTextFormat: def.setTextFormat,
        autoSize: {
          get: function autoSize() { // (void) -> String
            return this._autoSize;
          },
          set: function autoSize(value) { // (value:String) -> void
            if (this._autoSize === value) {
              return;
            }
            this._autoSize = value;
            this.invalidateDimensions();
          }
        },
        multiline: {
          get: function multiline() { // (void) -> Boolean
            return this._multiline;
          },
          set: function multiline(value) { // (value:Boolean) -> void
            if (this._multiline === value) {
              return;
            }
            this._multiline = value;
            this.invalidateDimensions();
          }
        },
        textColor: {
          get: function textColor() { // (void) -> uint
            return this._textColor;
          },
          set: function textColor(value) { // (value:uint) -> void
            if (this._textColor === value) {
              return;
            }
            this._textColor = value;
            this._invalidate();
          }
        },
        selectable: {
          get: function selectable() { // (void) -> Boolean
            return this._selectable;
          },
          set: function selectable(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.selectable");
            this._selectable = value;
          }
        },
        wordWrap: {
          get: function wordWrap() { // (void) -> Boolean
            return this._wordWrap;
          },
          set: function wordWrap(value) { // (value:Boolean) -> void
            if (this._wordWrap === value) {
              return;
            }
            this._wordWrap = value;
            this.invalidateDimensions();
          }
        },
        textHeight: {
          get: function textHeight() { // (void) -> Number
            this.ensureDimensions();
            return this._textHeight;
          }
        },
        textWidth: {
          get: function textWidth() { // (void) -> Number
            this.ensureDimensions();
            return this._textWidth;
          }
        },
        length: {
          get: function length() { // (void) -> uint
            return this._content.text.length;
          }
        },
        numLines: {
          get: function numLines() { // (void) -> uint
            this.ensureDimensions();
            return this._lines.length;
          }
        },
        getLineMetrics: function (lineIndex) { // (lineIndex:int) -> TextLineMetrics
          return this.getLineMetrics(lineIndex);
        },
        setSelection: function (beginIndex, endIndex) {
          somewhatImplemented("TextField.setSelection");
        },
        scrollV: {
          get: function scrollV() {
            return this._scrollV;
          },
          set: function scrollV(value) {
            this.ensureDimensions();
            value = Math.max(1, Math.min(this._maxScrollV, value));
            this._scrollV = value;
          }
        },
        bottomScrollV: {
          get: function bottomScrollV() {
            this.ensureDimensions();
            if (this._scrollV === 1) {
              return this._bottomScrollV;
            }
            var maxVisibleY = (this._bbox.yMax - 80) / 20;
            var offsetY = this._lines[this._scrollV - 1].y;
            for (var i = this._bottomScrollV; i < this._lines.length; i++) {
              var line = this._lines[i];
              if (line.y + line.height + offsetY > maxVisibleY) {
                return i + 1;
              }
            }
          }
        },
        maxScrollV: {
          get: function maxScrollV() { // (void) -> Number
            this.ensureDimensions();
            return this._maxScrollV;
          }
        },
        maxScrollH: {
          get: function maxScrollH() { // (void) -> Number
            this.ensureDimensions();
            // For whatever reason, maxScrollH is always 8px more than expected.
            return Math.max(this._textWidth - this._bbox.xMax/20 + 4, 0);
          }
        },
        background: {
          get: function background() { // (void) -> Boolean
            return this._background;
          },
          set: function background(value) { // (value:Boolean) -> void
            if (this._background === value) {
              return;
            }
            this._background = value;
            this._invalidate();
          }
        },
        backgroundColor: {
          get: function backgroundColor() { // (void) -> uint
            return this._backgroundColor;
          },
          set: function backgroundColor(value) { // (value:uint) -> void
            if (this._backgroundColor === value) {
              return;
            }
            this._backgroundColor = value;
            this._backgroundColorStr = rgbIntAlphaToStr(value, 1);
            if (this._background) {
              this._invalidate();
            }
          }
        },
        border: {
          get: function border() { // (void) -> Boolean
            return this._border;
          },
          set: function border(value) { // (value:Boolean) -> void
            if (this._border === value) {
              return;
            }
            this._border = value;
            this._invalidate();
          }
        },
        borderColor: {
          get: function borderColor() { // (void) -> uint
            return this._borderColor;
          },
          set: function borderColor(value) { // (value:uint) -> void
            if (this._borderColor === value) {
              return;
            }
            this._borderColor = value;
            this._borderColorStr = rgbIntAlphaToStr(value, 1);
            if (this._border) {
              this._invalidate();
            }
          }
        },
        type: {
          get: function borderColor() { // (void) -> String
            return this._type;
          },
          set: function borderColor(value) { // (value:String) -> void
            somewhatImplemented("TextField.type");
            this._type = value;
          }
        },
        embedFonts: {
          get: function embedFonts() { // (void) -> Boolean
            return this._embedFonts;
          },
          set: function embedFonts(value) { // (value:Boolean) -> void
            this.invalidateDimensions();
            this._embedFonts = value;
          }
        },
        condenseWhite: {
          get: function condenseWhite() { // (void) -> Boolean
            return this._condenseWhite;
          },
          set: function condenseWhite(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.condenseWhite");
            this._condenseWhite = value;
          }
        },
        sharpness: {
          get: function sharpness() { // (void) -> Number
            return this._sharpness;
          },
          set: function sharpness(value) { // (value:Number) -> void
            somewhatImplemented("TextField.sharpness");
            this._sharpness = value;
          }
        }
      }
    }
  };

  return def;
}).call(this);
