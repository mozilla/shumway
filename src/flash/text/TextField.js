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
/*global AS2TextField, toStringRgba, warning, XMLParser */

var TextFieldDefinition = (function () {

  var xmlParser = new XMLParser();

  /*
   * Parsing "html", in this context, actually means ensuring that the given
   * string is valid *xml*, and removing any tags that mustn't be supported.
   *
   * After that, two things are generated: a plain-text version of the content,
   * and a list of ranges with types and attributes, representing all nested
   * nodes.
   */
  function parseHtml(val) {
    var xml = xmlParser.parseFromString(val).children[0];
    var content = {text : '', tree : null};
    content.tree = convertXML(xml, content);
    return content;
  }

  function convertXML(xml, content) {
    // Ignore all comments, processing instructions and namespaced nodes.
    if (xml.kind !== 'element' && xml.kind !== 'text' ||
        xml.name.prefix !== '')
    {
      return;
    }
    var node = {type : '', text : '', format : null, children : null};

    if (xml.kind === 'text') {
      var text = xml.value;
      node.type = 'text';
      node.text = text;
      content.text += text;
      return node;
    }

    node.type = xml.name.localName;
    node.format = extractAttributes(xml);
    node.children = [];

    var children = xml.children;
    var childCount = children.length;
    for (var i = 0; i < childCount; i++) {
      node.children.push(convertXML(children[i], content));
    }

    return node;
  }

  /**
   * Creates an object containing all attributes with their localName as keys.
   * Ignores all namespaced attributes, as we don't need them for the
   * TextField's purposes.
   * TODO: check whether we still have to keep them around for round-tripping.
   */
  function extractAttributes(node) {
    var attributesList = node.attributes;
    var attributesMap = Object.create(null);
    for (var i = 0; i < attributesList.length; i++) {
      var attr = attributesList[i];
      if (attr.name.prefix !== '') {
        continue;
      }
      attributesMap[attr.name.localName] = attr.value;
    }
    return attributesMap;
  }

  function renderContent(content, initialFormat, bounds, ctx) {
    if (!ctx) {
      return renderNode(content.tree);
    }
    var firstRun = {type: 'f', format: initialFormat};
    var width = bounds.right - bounds.left;
    var height = bounds.bottom - bounds.top;
    var state = {ctx: ctx, y: 0, x: 0, w: width, h: height,
                 line: [], lineHeight: 0, formats: [initialFormat],
                 currentFormat: initialFormat, runs: [firstRun]};
    collectRuns(content.tree, state);
    finishLine(state);

    return renderToCanvas(ctx, bounds, state.runs);
  }

  function collectRuns(node, state) {
    // for formatNodes, the format is popped after child processing
    var formatNode = false;
    // for blockNodes, the current line is finished after child processing
    var blockNode = false;
    switch (node.type) {
      case 'text': addTextRun(state, node); return;
      case 'br': finishLine(state); return;

      case 'li': /* TODO: draw bullet points. */
      case 'p': finishLine(state); blockNode = true; break;

      case 'b':
      case 'i':
      case 'font':
      case 'textformat': pushFormat(state, node); formatNode = true; break;

      case 'u': /* TODO: implement <u>-support. */
      case 'a': /* TODO: implement <a>-support. */
      case 'img': /* TODO: implement <img>-support. */
      case 'span': /* TODO: implement what puny support for CSS Flash has. */
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
      finishLine(state);
    }
  }
  function addTextRun(state, node) {
    var text = node.text;
    // `y` is set by `finishLine`
    var run = {type: 't', text: text, x: state.x, y: 0};
    state.runs.push(run);
    state.line.push(run);
    state.x += state.ctx.measureText(text).width;
    state.lineHeight = Math.max(state.lineHeight, state.currentFormat.size);
    // TODO: implement wordWrap
//    var overflow = '';
//    var ctx = state.ctx;
//    var space = state.width = state.x;
//    while (ctx.measureText(text) > space) {
//
//    }
  }
  function finishLine(state) {
    state.x = 0;
    state.y += state.lineHeight;
    var y = state.y;
    while (state.line.length) {
      var run = state.line.pop();
      run.y = y;
    }
    state.lineHeight = 0;
  }
  function pushFormat(state, node) {
    var attributes = node.format;
    var format = Object.create(state.formats[state.formats.length - 1]);
    switch (node.type) {
      case 'b': format.bold = true; format.str += ' bold'; break;
      case 'i': format.italic = true; format.str += ' italic'; break;
      case 'font': {
        if ('color' in attributes) {
          format.color = attributes.color;
        }
        if ('face' in attributes) {
          var fontFace = attributes.face;
          if (fontFace === '_sans') {
            fontFace = 'sans-serif';
          } else if (fontFace === '_serif') {
            fontFace = 'serif';
          }
          //TODO: adapt to embedded font names
          format.face = fontFace;
        }
        if ('size' in attributes) {
          format.size = attributes.size;
        }
      }
      // `textFormat` has, among others, the same attributes as `font`
      case 'textformat': {
        if ('indent' in attributes) {
          state.x += attributes.indent;
        }
        // TODO: support leftMargin, rightMargin & blockIndent
        // TODO: support leading
        // TODO: support tabStops, if possible
        format.str = makeFormatString(format);
        state.lineHeight = Math.max(state.lineHeight, format.size);
        break;
      }
      default:
        warning('Unknown format node encountered: ' + node.type); return;
    }
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
    return format.size + 'px ' +
           (format.bold ? 'bold ' : '') +
           (format.italic ? 'italic ' : '') +
           format.face;
  }

  function renderToCanvas(ctx, bounds, runs) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(bounds.left, bounds.top,
                 bounds.right - bounds.left, bounds.bottom - bounds.top);
    ctx.clip();
    for (var i = 0; i < runs.length; i++) {
      var run = runs[i];
      if (run.type === 'f') {
        ctx.font = run.format.str;
        ctx.fillStyle = run.format.color;
      } else {
        assert(run.type === 't', 'Invalid run type: ' + run.type);
        ctx.fillText(run.text, run.x, run.y);
      }
    }
    ctx.restore();
  }

  function renderNode(node) {
    if (node.type === 'text') {
      return node.text;
    }

    var output = renderNodeStart(node);
    var children = node.children;

    for (var i = 0; i < children.length; i++) {
      var childNode = children[i];
      output += renderNode(childNode);
    }
    return output + renderNodeEnd(node);
  }

  function renderNodeStart(node) {
    var format = node.format;
    var output;
    var styles;
    switch (node.type) {
      case 'br': return '<br />';
      case 'b': return '<strong>';
      case 'i': return '<i>';
      // TODO: check if we need to emit <ul>'s around runs of <li>'s
      case 'li': return '<li>';
      case 'u': return '<span style="text-decoration: underline;">';
      case 'a': {
        output = '<a';
        if ('href' in format) {
          output += ' href="' + format.href + '"';
        }
        if ('target' in format) {
          output += ' target="' + format.href + '"';
        }
        break;
      }
      case 'font': {
        output = '<span';
        styles = '';
        if ('color' in format) {
          styles += 'color:' + format.color + ';';
        }
        if ('face' in format) {
          var fontFace = format.face;
          if (fontFace === '_sans') {
            fontFace = 'sans-serif';
          } else if (fontFace === '_serif') {
            fontFace = 'serif';
          }
          //TODO: adapt to embedded font names
          styles += 'font-family:' + fontFace + ';';
        }
        if ('size' in format) {
          //TODO: verify that px is the right unit
          styles += 'font-size:' + format.size + 'px;';
        }
        break;
      }
      case 'img': {
        output = '<img src="' + (format.src || '') + '"';
        styles = '';
        if ('width' in format) {
          styles += 'width:' + format.width + 'px;';
        }
        if ('height' in format) {
          styles += 'height:' + format.height + 'px;';
        }
        if ('hspace' in format && 'vspace' in format) {
          styles += 'margin:' + format.vspace + 'px ' +
                    format.hspace + 'px;';
        } else if ('hspace' in format) {
          styles += 'margin:0 ' + format.hspace + 'px;';
        } else if ('vspace' in format) {
          styles += 'margin:' + format.hspace + 'px 0;';
        }
        // TODO: support `align`, `id` and `checkPolicyFile`
        output += ' /';
        break;
      }
      case 'p': {
        output = '<p';
        styles = '';
        if ('class' in format) {
          styles += ' class="' + format['class'] + '"';
        }
        if ('align' in format) {
          styles += 'text-align:' + format.align;
        }
        break;
      }
      case 'span': {
        output = '<span';
        if ('class' in format) {
          output += ' class="' + format['class'] + '"';
        }
        break;
      }
      case 'textformat': {
        // TODO: we probably need to merge textformat nodes with <p> nodes
        output = '<span';
        styles = '';
        var marginLeft = 0;
        if ('blockIdent' in format) {
          marginLeft += parseInt(format.blockIndent, 10);
        }
        if ('leftMargin' in format) {
          marginLeft += parseInt(format.leftMargin, 10);
        }
        if (marginLeft !== 0) {
          styles += 'margin-left:' + marginLeft + 'px"';
        }
        if ('indent' in format) {
          styles += 'text-indent:' + format.indent + 'px"';
        }
        if ('rightMargin' in format) {
          styles += 'margin-left:' + marginLeft + 'px"';
        }
        // TODO: support leading
        // TODO: support tabStops, if possible
        break;
      }
      default:
        // For all unknown nodes, we just emit spans. We might not actually
        // need to, but it doesn't do any harm, either.
        return '<span>';
    }
    if (styles) {
      output += ' style="' + styles + '"';
    }
    return output + '>';
  }

  function renderNodeEnd(node) {
    switch (node.type) {
      case 'b': return '</strong>';
      case 'i':
      case 'li':
      case 'a':
      case 'p': {
        return '</' + node.type + '>';
      }
      default: { // <u>, <font>, <span>, <textformat>, and all others
        return '</span>';
      }
    }
  }

  var def = {
    __class__: 'flash.text.TextField',

    initialize: function () {
      this._defaultTextFormat = null;
      var initialFormat = this._initialFormat = {face: 'serif', size: 10,
                                                 bold: false, italic: false,
                                                 color: 'black'};
      this._type = 'dynamic';
      this._textHeight = 0;
      this._textWidth = 0;
      this._embedFonts = false;

      var s = this.symbol;
      if (!s) {
        return;
      }

      var tag = s.tag;
      var bbox = this._bbox = tag.bbox;
      // // TODO: use canvas.measureText(txt).height
      this._textHeight = bbox.bottom - bbox.top;

      if (tag.hasLayout) {
        initialFormat.size = tag.fontHeight / 20;
      }
      if (tag.hasColor) {
        initialFormat.color = toStringRgba(tag.color);
      }
      if (tag.hasFont) {
        initialFormat.face = tag.font;
      }
      initialFormat.str = makeFormatString(initialFormat);

      if (tag.initialText) {
        if (tag.html) {
          this.htmlText = tag.initialText;
        } else {
          this.text = tag.initialText;
        }
        this._contentChanged = true;
      }
    },

    _getAS2Object: function () {
      if (!this.$as2Object) {
        new AS2TextField().$attachNativeObject(this);
      }
      return this.$as2Object;
    },

    replaceText: function(begin, end, str) {
      this._text = this._text.substring(0, begin) + str + this._text.substring(end);
      this._markAsDirty();
    },

    draw: function (ctx) {
      renderContent(this._content, this._initialFormat, this._bbox, ctx);
    },

    get text() {
      return this._text;
    },
    set text(val) {
      if (this._text === val) {
        return;
      }
      var node = {type : 'text', text: val};
      this._content = {tree : node, text : val};
      this._htmlText = val;
      this._contentChanged = true;
      this._markAsDirty();
    },

    get htmlText() {
      return this._htmlText;
    },
    set htmlText(val) {
      if (this._htmlText === val) {
        return;
      }
      this._htmlText = val;
      this._content = parseHtml(val);
      this._contentChanged = true;
      this._markAsDirty();
    },

    get defaultTextFormat() {
      return this._defaultTextFormat;
    },
    set defaultTextFormat(val) {
      this._defaultTextFormat = val;
    },

    getTextFormat: function (beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      return null; // TODO
    },
    setTextFormat: function (format, beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      // TODO
    }

  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        text: desc(def, "text"),
        defaultTextFormat: desc(def, "defaultTextFormat"),
        draw: def.draw,
        replaceText: def.replaceText,
        getTextFormat: def.getTextFormat,
        setTextFormat: def.setTextFormat,
        autoSize: {
          get: function autoSize() { // (void) -> String
            somewhatImplemented("TextField.autoSize");
            return this._autoSize;
          },
          set: function autoSize(value) { // (value:String) -> void
            somewhatImplemented("TextField.autoSize");
            this._autoSize = value;
          }
        },
        multiline: {
          get: function multiline() { // (void) -> Boolean
            somewhatImplemented("TextField.multiline");
            return this._multiline;
          },
          set: function multiline(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.multiline");
            this._multiline = value;
          }
        },
        textColor: {
          get: function textColor() { // (void) -> uint
            somewhatImplemented("TextField.textColor");
            return this._textColor;
          },
          set: function textColor(value) { // (value:uint) -> void
            somewhatImplemented("TextField.textColor");
            this._textColor = value;
          }
        },
        selectable: {
          get: function selectable() { // (void) -> Boolean
            somewhatImplemented("TextField.selectable");
            return this._selectable;
          },
          set: function selectable(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.selectable");
            this._selectable = value;
          }
        },
        wordWrap: {
          get: function wordWrap() { // (void) -> Boolean
            somewhatImplemented("TextField.wordWrap");
            return this._wordWrap;
          },
          set: function wordWrap(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.wordWrap");
            this._wordWrap = value;
          }
        },
        textHeight: {
          get: function textHeight() { // (void) -> Number
            somewhatImplemented("TextField.textHeight");
            return this._textHeight;
          }
        },
        textWidth: {
          get: function textWidth() { // (void) -> Number
            somewhatImplemented("TextField.textWidth");
            return this._textWidth;
          }
        },
        background: {
          get: function background() { // (void) -> Boolean
            somewhatImplemented("TextField.background");
            return this._background;
          },
          set: function background(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.background");
            this._background = value;
          }
        },
        backgroundColor: {
          get: function backgroundColor() { // (void) -> uint
            somewhatImplemented("TextField.backgroundColor");
            return this._backgroundColor;
          },
          set: function backgroundColor(value) { // (value:uint) -> void
            somewhatImplemented("TextField.backgroundColor");
            this._backgroundColor = value;
          }
        },
        border: {
          get: function border() { // (void) -> Boolean
            somewhatImplemented("TextField.border");
            return this._border;
          },
          set: function border(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.border");
            this._border = value;
          }
        },
        borderColor: {
          get: function borderColor() { // (void) -> uint
            somewhatImplemented("TextField.borderColor");
            return this._borderColor;
          },
          set: function borderColor(value) { // (value:uint) -> void
            somewhatImplemented("TextField.borderColor");
            this._borderColor = value;
          }
        },
        type: {
          get: function borderColor() { // (void) -> String
            somewhatImplemented("TextField.type");
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
        numLines: {
          get: function numLines() { // (void) -> uint
            somewhatImplemented("TextField.numLines");
            return 1;
          }
        },
        length: {
          get: function length() { // (void) -> uint
            return this._text.length;
          }
        }
      }
    }
  };

  return def;
}).call(this);
