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

var StaticTextDefinition = (function () {
  var def = {
    __class__: 'flash.text.StaticText',

    initialize: function () {
      this._html = this.symbol ? renderContent(this.symbol.html) : '';
    },
    draw : function() {
      if (this._valid) {
        return;
      }
      this._control.innerHTML = this._html;
      this._valid = true;
    },
    get text() {
      return this._text;
    },
    set text(val) {
      this._text = val;
    }
  };

  function renderContent(content) {
    var html = '<div class="shumway-static-text">';
    for (var i = 0; i < content.length; i++) {
      var run = content[i];
      var style = 'top:' + run.y + 'px;';
      if (run.fontName) {
        style += 'font-family: ' + run.fontName +
                 '; font-size: ' + run.fontSize + 'px;';
      }
      if (run.color) {
        style += 'color: ' + run.color;
      }
      html += '<span style="' + style + '">';

      var chars = run.chars;
      var positions = run.positions;
      for (var j = 0; j < chars.length; j++) {
        html += '<span style="left:' + positions[j] + 'px">' +
                chars[j] + '</span>';
      }
      html += '</span>';
    }
    return html + '</div>';
  }

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        text: desc(def, "text")
      }
    }
  };

  return def;
}).call(this);
