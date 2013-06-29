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
/*global AS2TextField */

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
    var content = {ranges : [], text : ''};
    convertXML(xml, content);
    return content;
  }

  function convertXML(xml, content) {
    // Ignore all comments, processing instructions and namespaced nodes.
    if (xml.kind !== 'element' && xml.kind !== 'text' ||
        xml.name.prefix !== '')
    {
      return;
    }
    var range = {start : content.text.length};
    content.ranges.push(range);

    if (xml.kind === 'text') {
      var text = xml.value;
      range.type = 'text';
      range.text = text;
      content.text += text;
      range.end = content.text.length;
      return;
    }

    range.type = xml.name.localName;
    range.attributes = extractAttributes(xml);

    var children = xml.children;
    var childCount = children.length;
    for (var i = 0; i < childCount; i++) {
      convertXML(children[i], content);
    }
    range.end = content.text.length;
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

  function renderRanges(ranges) {
    var output = '';
    var length = 0;
    var rangeStack = [];
    var currentRange = null;

    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      while (currentRange && currentRange.end <= range.start) {
        output += renderRangeEnd(currentRange);
        rangeStack.pop();
        currentRange = rangeStack[rangeStack.length - 1];
      }
      assert(range.start === length);
      if (range.type === 'text') {
        output += range.text;
        length = range.end;
        continue;
      }
      output += renderRangeStart(range);
      currentRange = range;
      rangeStack.push(range);
    }
    return output;
  }
  function renderRangeStart(range) {
    var attributes = range.attributes;
    var output;
    var styles;
    switch (range.type) {
      case 'br': return '<br />';
      case 'b': return '<strong>';
      case 'i': return '<i>';
      // TODO: check if we need to emit <ul>'s around runs of <li>'s
      case 'li': return '<li>';
      case 'u': return '<span style="text-decoration: underline;">';
      case 'a': {
        output = '<a';
        if ('href' in attributes) {
          output += ' href="' + attributes.href + '"';
        }
        if ('target' in attributes) {
          output += ' target="' + attributes.href + '"';
        }
        break;
      }
      case 'font': {
        output = '<span';
        styles = '';
        if ('color' in attributes) {
          styles += 'color:' + attributes.color + ';';
        }
        if ('face' in attributes) {
          var fontFace = attributes.face;
          if (fontFace === '_sans') {
            fontFace = 'sans-serif';
          } else if (fontFace === '_serif') {
            fontFace = 'serif';
          }
          //TODO: adapt to embedded font names
          styles += 'font-family:' + fontFace + ';';
        }
        if ('size' in attributes) {
          //TODO: verify that px is the right unit
          styles += 'font-size:' + attributes.size + 'px;';
        }
        break;
      }
      case 'img': {
        output = '<img src="' + (attributes.src || '') + '"';
        styles = '';
        if ('width' in attributes) {
          styles += 'width:' + attributes.width + 'px;';
        }
        if ('height' in attributes) {
          styles += 'height:' + attributes.height + 'px;';
        }
        if ('hspace' in attributes && 'vspace' in attributes) {
          styles += 'margin:' + attributes.vspace + 'px ' +
                    attributes.hspace + 'px;';
        } else if ('hspace' in attributes) {
          styles += 'margin:0 ' + attributes.hspace + 'px;';
        } else if ('vspace' in attributes) {
          styles += 'margin:' + attributes.hspace + 'px 0;';
        }
        // TODO: support `align`, `id` and `checkPolicyFile`
        output += ' /';
        break;
      }
      case 'p': {
        output = '<p';
        styles = '';
        if ('class' in attributes) {
          styles += ' class="' + attributes['class'] + '"';
        }
        if ('align' in attributes) {
          styles += 'text-align:' + attributes.align;
        }
        break;
      }
      case 'span': {
        output = '<span';
        if ('class' in attributes) {
          output += ' class="' + attributes['class'] + '"';
        }
        break;
      }
      case 'textformat': {
        // TODO: we probably need to merge textformat nodes with <p> nodes
        output = '<span';
        var styles = '';
        var marginLeft = 0;
        if ('blockIdent' in attributes) {
          marginLeft += parseInt(attributes.blockIndent);
        }
        if ('leftMargin' in attributes) {
          marginLeft += parseInt(attributes.leftMargin);
        }
        if (marginLeft !== 0) {
          styles += 'margin-left:' + marginLeft + 'px"';
        }
        if ('indent' in attributes) {
          styles += 'text-indent:' + attributes.indent + 'px"';
        }
        if ('rightMargin' in attributes) {
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
  function renderRangeEnd(range) {
    switch (range.type) {
      case 'b': return '</strong>';
      case 'i':
      case 'li':
      case 'a':
      case 'p': {
        return range.type;
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
      this._type = 'dynamic';
      this._textHeight = 0;
      this._textWidth = 0;

      var bbox = this._bbox;
      if (bbox) {
        // // TODO: use canvas.measureText(txt).height
        this._textHeight = bbox.bottom - bbox.top;
      }

      var s = this.symbol;
      if (!s) {
        return;
      }

      var tag = s.tag;
      var bbox = tag.bbox;
      //TODO: we might need to move things down and right by 2px, or add a 2px margin
      this.boundsStyle = 'top:' + bbox.top + 'px;left:' + bbox.left + 'px;' +
                         'width:' + (bbox.right - bbox.left) + 'px;' +
                         'height:' + (bbox.bottom - bbox.top) + 'px;';

      if (tag.initialText) {
        if (tag.html) {
          this.htmlText = tag.initialText;
        } else {
          this.text = tag.initialText;
        }
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

    draw: function (c) {
      this._control.innerHTML = '<div style="' + this.boundsStyle + '">' +
                                renderRanges(this._content.ranges) + '</div>';
    },

    get text() {
      return this._text;
    },
    set text(val) {
      if (this._text === val) {
        return;
      }
      //TODO: add default markup.
      var range = {type : 'text', text: val, start : 0, end : val.length};
      this._content = {ranges : [range], text : val};
      this._htmlText = val;
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
        }
      }
    }
  };

  return def;
}).call(this);
