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
/*global AS2TextField, toStringRgba, warning */

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
                           KERNING: initialFormat.kerning
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

  function renderContent(content, bounds, ctx) {
//    if (!ctx) {
//      return renderNode(content.tree);
//    }
    return renderToCanvas(ctx, bounds, content.textruns);
  }

  function collectRuns(node, state) {
    // for formatNodes, the format is popped after child processing
    var formatNode = false;
    // for blockNodes, the current line is finished after child processing
    var blockNode = false;
    switch (node.type) {
      case 'text': addTextRun(state, node); return;
      case 'BR': finishLine(state); return;

      case 'LI': /* TODO: draw bullet points. */ /* falls through */
      case 'P': finishLine(state); blockNode = true; break;

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
      finishLine(state);
    }
  }
  function addTextRun(state, node) {
    var text = node.text;
    if (!text) {
      return;
    }
    // `y` is set by `finishLine`
    var run = {type: 't', text: text, x: state.x, y: 0};
    state.runs.push(run);
    state.line.push(run);
    state.x += state.ctx.measureText(text).width;
    if (state.currentFormat.size > state.lineHeight) {
      state.lineHeight = state.currentFormat.size;
    }
    // TODO: implement wordWrap
//    var overflow = '';
//    var ctx = state.ctx;
//    var space = state.width = state.x;
//    while (ctx.measureText(text) > space) {
//
//    }
  }
  function finishLine(state) {
    state.maxLineWidth = Math.max(state.maxLineWidth, state.x);
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
          format.kerning = parseFloat(attributes.KERNING);
        }
      /* falls through */
      case 'TEXTFORMAT':
        // `textFormat` has, among others, the same attributes as `font`
        if ('INDENT' in attributes) {
          state.x += attributes.INDENT;
        }
        // TODO: support leftMargin, rightMargin & blockIndent
        // TODO: support leading
        // TODO: support tabStops, if possible
        break;
      default:
        warning('Unknown format node encountered: ' + node.type); return;
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
    return (format.italic ? 'italic ' : 'normal ') +
           (format.bold ? 'bold ' : 'normal ') +
           format.size + 'px ' + format.face;
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

//  function renderNode(node) {
//    if (node.type === 'text') {
//      return node.text;
//    }
//
//    var output = renderNodeStart(node);
//    var children = node.children;
//
//    for (var i = 0; i < children.length; i++) {
//      var childNode = children[i];
//      output += renderNode(childNode);
//    }
//    return output + renderNodeEnd(node);
//  }
//
//  function renderNodeStart(node) {
//    var format = node.format;
//    var output;
//    var styles;
//    switch (node.type) {
//      case 'BR': return '<br />';
//      case 'B': return '<strong>';
//      case 'I': return '<i>';
//      // TODO: check if we need to emit <ul>'s around runs of <li>'s
//      case 'LI': return '<li>';
//      case 'U': return '<span style="text-decoration: underline;">';
//      case 'A':
//        output = '<a';
//        if ('href' in format) {
//          output += ' href="' + format.href + '"';
//        }
//        if ('target' in format) {
//          output += ' target="' + format.href + '"';
//        }
//        break;
//      case 'FONT':
//        output = '<span';
//        styles = '';
//        if ('color' in format) {
//          styles += 'color:' + format.color + ';';
//        }
//        if ('face' in format) {
//          var fontFace = convertFontFamily(format.face);
//          styles += 'font-family:' + fontFace + ';';
//        }
//        if ('size' in format) {
//          //TODO: verify that px is the right unit
//          styles += 'font-size:' + format.size + 'px;';
//        }
//        break;
//      case 'IMG':
//        output = '<img src="' + (format.src || '') + '"';
//        styles = '';
//        if ('width' in format) {
//          styles += 'width:' + format.width + 'px;';
//        }
//        if ('height' in format) {
//          styles += 'height:' + format.height + 'px;';
//        }
//        if ('hspace' in format && 'vspace' in format) {
//          styles += 'margin:' + format.vspace + 'px ' +
//                    format.hspace + 'px;';
//        } else if ('hspace' in format) {
//          styles += 'margin:0 ' + format.hspace + 'px;';
//        } else if ('vspace' in format) {
//          styles += 'margin:' + format.hspace + 'px 0;';
//        }
//        // TODO: support `align`, `id` and `checkPolicyFile`
//        output += ' /';
//        break;
//      case 'P':
//        output = '<p';
//        styles = '';
//        if ('class' in format) {
//          styles += ' class="' + format['class'] + '"';
//        }
//        if ('align' in format) {
//          styles += 'text-align:' + format.align;
//        }
//        break;
//      case 'SPAN':
//        output = '<span';
//        if ('class' in format) {
//          output += ' class="' + format['class'] + '"';
//        }
//        break;
//      case 'TEXTFORMAT':
//        // TODO: we probably need to merge textformat nodes with <p> nodes
//        output = '<span';
//        styles = '';
//        var marginLeft = 0;
//        if ('blockIdent' in format) {
//          marginLeft += parseInt(format.blockIndent, 10);
//        }
//        if ('leftMargin' in format) {
//          marginLeft += parseInt(format.leftMargin, 10);
//        }
//        if (marginLeft !== 0) {
//          styles += 'margin-left:' + marginLeft + 'px"';
//        }
//        if ('indent' in format) {
//          styles += 'text-indent:' + format.indent + 'px"';
//        }
//        if ('rightMargin' in format) {
//          styles += 'margin-left:' + marginLeft + 'px"';
//        }
//        // TODO: support leading
//        // TODO: support tabStops, if possible
//        break;
//      default:
//        // For all unknown nodes, we just emit spans. We might not actually
//        // need to, but it doesn't do any harm, either.
//        return '<span>';
//    }
//    if (styles) {
//      output += ' style="' + styles + '"';
//    }
//    return output + '>';
//  }
//
//  function renderNodeEnd(node) {
//    switch (node.type) {
//      case 'B': return '</strong>';
//      case 'I': /* falls through */
//      case 'LI': /* falls through */
//      case 'A': /* falls through */
//      case 'P': return '</' + node.type + '>';
//      default: // <u>, <font>, <span>, <textformat>, and all others
//        return '</span>';
//    }
//  }

  var def = {
    __class__: 'flash.text.TextField',

    initialize: function () {
      var initialFormat = this._defaultTextFormat = {
        align: 'LEFT', font: 'serif', size: 12,
        letterspacing: 0, kerning: 0
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
      this._borderColor = 0x000000;
      this._textColor = 0x000000;

      var s = this.symbol;
      if (!s) {
        this._bbox = {top: -2, right: 102, bottom: 22, left: -2};
        this.text = '';
        return;
      }

      var tag = s.tag;
      this._bbox = tag.bbox;

      if (tag.hasLayout) {
        initialFormat.size = tag.fontHeight / 20;
      }
      if (tag.hasColor) {
        initialFormat.color = toStringRgba(tag.color);
      }
      if (tag.hasFont) {
        initialFormat.font = convertFontFamily(tag.font);
      }
      initialFormat.str = makeFormatString(initialFormat);

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
        new AS2TextField().$attachNativeObject(this);
      }
      return this.$as2Object;
    },

    replaceText: function(begin, end, str) {
      // TODO: preserve formatting
      var text = this._content.text;
      this.text = text.substring(0, begin) + str + text.substring(end);
    },

    draw: function (ctx) {
      this.ensureDimensions();
      renderContent(this._content, this._bbox, ctx);
    },

    invalidateDimensions: function() {
      this._markAsDirty();
      this._dimensionsValid = false;
    },

    ensureDimensions: function() {
      if (this._dimensionsValid) {
        return;
      }
      var bounds = this._bbox;
      var initialFormat = this._defaultTextFormat;
      var firstRun = {type: 'f', format: initialFormat};
      var width = bounds.right - bounds.left;
      var height = bounds.bottom - bounds.top;
      var state = {ctx: measureCtx, y: 0, x: 0, w: width, h: height, line: [],
                   lineHeight: 0, maxLineWidth: 0, formats: [initialFormat],
                   currentFormat: initialFormat, runs: [firstRun]};
      collectRuns(this._content.tree, state);
      this._textWidth = state.maxLineWidth;
      this._textHeight = state.y;
      this._content.textruns = state.runs;
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
    },

    getTextFormat: function (beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      return this.defaultTextFormat; // TODO
    },
    setTextFormat: function (format, beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      this.defaultTextFormat = format;// TODO
    },

    get width() { // (void) -> Number
      return this._bbox.right - this._bbox.left;
    },
    set width(value) { // (Number) -> Number
      if (value < 0) {
        return;
      }
      this._bbox.right = this._bbox.left + value;
      // TODO: optimization potential: don't invalidate if !wordWrap and no \n
      if (this._multiline || this._wordWrap) {
        this.invalidateDimensions();
      }
    },

    get height() { // (void) -> Number
      return this._bbox.bottom - this._bbox.top;
    },
    set height(value) { // (Number) -> Number
      if (value < 0) {
        return;
      }
      this._bbox.bottom = this._bbox.top + value;
      this._markAsDirty();
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
            somewhatImplemented("TextField.textColor");
            this._textColor = value;
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
          }
        },
        textHeight: {
          get: function textHeight() { // (void) -> Number
            somewhatImplemented("TextField.textHeight");
            this.ensureDimensions();
            return this._textHeight;
          }
        },
        textWidth: {
          get: function textWidth() { // (void) -> Number
            somewhatImplemented("TextField.textWidth");
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
          }
        },
        backgroundColor: {
          get: function backgroundColor() { // (void) -> uint
            return this._backgroundColor;
          },
          set: function backgroundColor(value) { // (value:uint) -> void
            somewhatImplemented("TextField.backgroundColor");
            this._backgroundColor = value;
          }
        },
        border: {
          get: function border() { // (void) -> Boolean
            return this._border;
          },
          set: function border(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.border");
            this._border = value;
          }
        },
        borderColor: {
          get: function borderColor() { // (void) -> uint
            return this._borderColor;
          },
          set: function borderColor(value) { // (value:uint) -> void
            somewhatImplemented("TextField.borderColor");
            this._borderColor = value;
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
