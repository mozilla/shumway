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
/*global avm1lib, rgbaObjToStr, rgbIntAlphaToStr, warning */

var TextFieldDefinition = (function () {

  var htmlParser = document.createElement('p');

  // Used for measuring text runs, not for rendering
  var measureCtx = document.createElement('canvas').getContext('kanvas-2d');

  /*
   * Parsing, in this context, actually means using the browser's html parser
   * and then removing any tags and attributes that mustn't be supported.
   *
   * After that, two things are generated: a plain-text version of the content,
   * and a tree of objects with types and attributes, representing all nodes.
   */
  function parseHtml(val, initialFormat) {
    htmlParser.innerHTML = val;
    var rootElement = htmlParser.childNodes.length !== 1 ?
                      htmlParser :
                      htmlParser.childNodes[0];
    // TODO: create the htmlText by serializing the converted tree
    var content = {text : '', htmlText: val, tree : createTrunk(initialFormat)};

    if (rootElement.nodeType === 3) {
      convertNode(rootElement, content.tree.children[0].children, content);
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
    convertNodeList(initialNodeList, content.tree.children[0].children, content);
    return content;
  }

  function createTrunk(initialFormat) {
    // The outermost node is always a <P>, with an ALIGN attribute
    var trunk = {type: 'P', format: {ALIGN: initialFormat.align}, children: []};
    // The first child is then a <FONT>, with FACE, LETTERSPACING and KERNING
    var fontAttributes = { FACE: initialFormat.font,
                           LETTERSPACING: initialFormat.letterSpacing,
                           KERNING: initialFormat.kerning,
                           LEADING: initialFormat.leading
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

  function convertNode(input, destinationList, content) {
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
    // and add them to the parent's child list
    var nodeType = input.localName.toUpperCase();
    if (!knownNodeTypes[nodeType]) {
      convertNodeList(input.childNodes, destinationList, content);
      return;
    }
    node = { type: nodeType,
                 text: null,
                 format: extractAttributes(input),
                 children: []
               };

    convertNodeList(input.childNodes, node.children, content);
    destinationList.push(node);
  }

  function convertNodeList(from, to, content) {
    var childCount = from.length;
    for (var i = 0; i < childCount; i++) {
      convertNode(from[i], to, content);
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
      case 'text': addRunsForText(state, node.text); return;
      case 'BR':
        if (state.multiline) {
          finishLine(state);
        }
        return;

      case 'LI': /* TODO: draw bullet points. */ /* falls through */
      case 'P':
        if (state.multiline) {
          finishLine(state);
        }
        blockNode = true; break;

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
    if (blockNode && state.multiline) {
      finishLine(state);
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
    if (!(state.wordWrap && state.multiline)) {
      addTextRun(state, text, state.ctx.measureText(text).width);
      return;
    }
    while (text.length) {
      var width = state.ctx.measureText(text).width;
      var availableWidth = state.w - state.x;
      if (availableWidth <= 0) {
        finishLine(state);
        availableWidth = state.w - state.x;
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
          if (state.x > 0) {
            finishLine(state);
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
          finishLine(state);
        }

        text = text.substr(wrapOffset);
      }
    }
  }
  function addTextRun(state, text, width) {
    // `y` is set by `finishLine`
    var run = {type: 't', text: text, x: state.x, y: 0};
    state.runs.push(run);
    state.line.push(run);
    state.x += width;
    if (state.currentFormat.size > state.lineHeight) {
      state.lineHeight = state.currentFormat.size;
    }
}
  function finishLine(state) {
    if (state.lineHeight === 0) {
      return;
    }
    state.maxLineWidth = Math.max(state.maxLineWidth, state.x);
    state.x = 0;
    state.y += state.lineHeight;
    var y = state.y;
    while (state.line.length) {
      var run = state.line.pop();
      run.y = y;
    }
    // TODO: it seems like Flash makes lines 2px higher than just the font-size.
    // Verify this.
    state.y += state.currentFormat.leading + 2;
    state.lineHeight = 0;
  }
  function pushFormat(state, node) {
    var attributes = node.format;
    var format = Object.create(state.formats[state.formats.length - 1]);
    switch (node.type) {
      case 'B': format.bold = true; break;
      case 'I': format.italic = true; break;
      case 'FONT':
        if ('COLOR' in attributes) {
          format.color = attributes.COLOR;
        }
        if ('FACE' in attributes) {
          format.face = convertFontFamily(attributes.FACE);
        }
        if ('SIZE' in attributes) {
          format.size = parseFloat(attributes.SIZE);
        }
        if ('LETTERSPACING' in attributes) {
          format.letterspacing = parseFloat(attributes.LETTERSPACING);
        }
        if ('KERNING' in attributes) {
          // TODO: properly parse this in extractAttributes
          format.kerning = attributes.KERNING && true;
        }
        if ('LEADING' in attributes) {
          format.leading = parseFloat(attributes.LEADING);
        }
      /* falls through */
      case 'TEXTFORMAT':
        // `textFormat` has, among others, the same attributes as `font`
        if ('INDENT' in attributes) {
          state.x += attributes.INDENT;
        }
        // TODO: support leftMargin, rightMargin & blockIndent
        // TODO: support tabStops, if possible
        break;
      default:
        warning('Unknown format node encountered: ' + node.type); return;
    }
    if (state.textColor !== null) {
      format.color = rgbIntAlphaToStr(state.textColor, 1);
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
    //TODO: verify that px is the right unit
    // order of the font arguments: <style> <weight> <size> <family>
    var boldItalic = '';
    if (format.bold) {
      boldItalic = 'bold';
    }
    if (format.italic) {
      boldItalic += ' italic';
    }
    return boldItalic + format.size + 'px ' + format.face;
  }

  function convertFontFamily(face) {
    //TODO: adapt to embedded font names
    var family;
    if (face.indexOf('_') === 0) {
      // reserved fonts
      if (face.indexOf('_sans') === 0) {
        family = 'sans-serif';
      } else if (face.indexOf('_serif') === 0) {
        family = 'serif';
      } else if (face.indexOf('_typewriter') === 0) {
        family = 'monospace';
      }
    }
    return family || face;
  }

  var def = {
    __class__: 'flash.text.TextField',

    initialize: function () {
      var initialFormat = this._defaultTextFormat = {
        align: 'LEFT', font: 'serif', size: 12,
        letterspacing: 0, kerning: 0, color: "black", leading: 2
      };
      this._type = 'dynamic';
      this._selectable = true;
      this._textHeight = 0;
      this._textWidth = 0;
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

      var s = this.symbol;
      if (!s) {
        this._bounds = {xMin: -40, yMin: -40, xMax: 2040, yMax: 440};
        this.text = '';
        return;
      }

      var tag = s.tag;
      this._bounds = tag.bbox;

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
        initialFormat.font = convertFontFamily(tag.font);
      }
      initialFormat.str = makeFormatString(initialFormat);

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
      var bounds = this._bounds;
      var x = bounds.xMin / 20;
      var y = bounds.yMin / 20;
      var width = bounds.xMax / 20 - x;
      var height = bounds.yMax / 20 - y;
      if (width <= 0 || height <= 0) {
        return;
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
      if (this._background) {
        colorTransform.setFillStyle(ctx, this._backgroundColorStr);
        ctx.fill();
      }
      if (this._border) {
        colorTransform.setStrokeStyle(ctx, this._borderColorStr);
        ctx.lineCap = "square";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, (width - 1)|0, (height - 1)|0);
      }
      ctx.closePath();
      var runs = this._content.textruns;
      ctx.save();
      colorTransform.setAlpha(ctx);
      for (var i = 0; i < runs.length; i++) {
        var run = runs[i];
        if (run.type === 'f') {
          ctx.restore();
          ctx.font = run.format.str;
          colorTransform.setFillStyle(ctx, run.format.color);
          ctx.save();
          colorTransform.setAlpha(ctx);
        } else {
          assert(run.type === 't', 'Invalid run type: ' + run.type);
          ctx.fillText(run.text, run.x + this._drawingOffsetH, run.y);
        }
      }
      ctx.restore();
      ctx.restore();
    },

    invalidateDimensions: function() {
      this._invalidate();
      this._dimensionsValid = false;
    },

    ensureDimensions: function() {
      if (this._dimensionsValid) {
        return;
      }
      var bounds = this._bounds;
      var initialFormat = this._defaultTextFormat;
      var firstRun = {type: 'f', format: initialFormat};
      var width = Math.max((bounds.xMax - bounds.xMin) / 20 - 4, 1);
      var state = {ctx: measureCtx, y: 0, x: 0, w: width, line: [],
                   lineHeight: 0, maxLineWidth: 0, formats: [initialFormat],
                   currentFormat: initialFormat, runs: [firstRun],
                   multiline: this._multiline, wordWrap: this._wordWrap,
                   textColor: this._textColor};
      collectRuns(this._content.tree, state);
      if (!state.multiline) {
        finishLine(state);
      }
      this._textWidth = state.maxLineWidth;
      this._textHeight = state.y;
      this._content.textruns = state.runs;
      this._drawingOffsetH = 0;
      if (this._autoSize !== 'none') {
        var targetWidth = this._textWidth;
        var diffX = 0;
        switch (this._autoSize) {
          case 'left': break;
          case 'center': diffX = (targetWidth - width) / 2; break;
          case 'right': diffX = targetWidth - width;
        }
        this._drawingOffsetH = -diffX; // this is not in Twips!
        diffX = (diffX * 20)|0;
        targetWidth = (targetWidth * 20)|0;
        bounds.xMin -= diffX;
        this._x -= diffX;
        bounds.xMax = bounds.xMin + targetWidth + 80;
        bounds.yMax = bounds.yMin + (this._textHeight * 20|0) + 80;
      }
      this._dimensionsValid = true;
    },

    get text() {
      return this._content.text;
    },
    set text(val) {
      if (this._content && this._content.text === val) {
        return;
      }
      this._content = { text: val, tree: createTrunk(this._defaultTextFormat),
                        htmlText: val
                      };
      this._content.tree.children[0].children[0] = {type: 'text', text: val };
      this.invalidateDimensions();
    },

    get htmlText() {
      return this._content.htmlText;
    },
    set htmlText(val) {
      if (this._htmlText === val) {
        return;
      }
      this._content = parseHtml(val, this._defaultTextFormat);
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
      this.invalidateDimensions();
    },

    get width() { // (void) -> Number
      this.ensureDimensions();
      return this._bounds.xMax - this._bounds.xMin;
    },
    set width(value) { // (Number) -> Number
      if (value < 0) {
        return;
      }
      this._bounds.xMax = this._bounds.xMin + value;
      // TODO: optimization potential: don't invalidate if !wordWrap and no \n
      if (this._multiline || this._wordWrap) {
        this.invalidateDimensions();
      }
    },

    get height() { // (void) -> Number
      this.ensureDimensions();
      return this._bounds.yMax - this._bounds.yMin;
    },
    set height(value) { // (Number) -> Number
      if (value < 0) {
        return;
      }
      this._bounds.yMax = this._bounds.yMin + value;
      this.invalidateDimensions();
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
            somewhatImplemented("TextField.autoSize");
            this._autoSize = value;
            this.invalidateDimensions();
          }
        },
        multiline: {
          get: function multiline() { // (void) -> Boolean
            return this._multiline;
          },
          set: function multiline(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.multiline");
            this._multiline = value;
          }
        },
        textColor: {
          get: function textColor() { // (void) -> uint
            return this._textColor;
          },
          set: function textColor(value) { // (value:uint) -> void
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
            somewhatImplemented("TextField.wordWrap");
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
        background: {
          get: function background() { // (void) -> Boolean
            return this._background;
          },
          set: function background(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.background");
            this._background = value;
            this._invalidate();
          }
        },
        backgroundColor: {
          get: function backgroundColor() { // (void) -> uint
            return this._backgroundColor;
          },
          set: function backgroundColor(value) { // (value:uint) -> void
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
            this._border = value;
            this._invalidate();
          }
        },
        borderColor: {
          get: function borderColor() { // (void) -> uint
            return this._borderColor;
          },
          set: function borderColor(value) { // (value:uint) -> void
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
            somewhatImplemented("TextField.embedFonts");
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
        numLines: {
          get: function numLines() { // (void) -> uint
            somewhatImplemented("TextField.numLines");
            return 1;
          }
        },
        length: {
          get: function length() { // (void) -> uint
            return this._content.text.length;
          }
        }
      }
    }
  };

  return def;
}).call(this);
