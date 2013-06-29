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

var BitmapDefinition = (function () {
  var def = {
    __class__: "flash.display.Bitmap",
    initialize: function () {
    },

    ctor : function(bitmapData /*:BitmapData = null*/,
                    pixelSnapping /*:String = 'auto'*/,
                    smoothing /*:Boolean = false*/)
    {
      this._pixelSnapping = pixelSnapping === undefined
                            ? 'auto' : pixelSnapping + '';
      this._smoothing = !!smoothing;
      this.bitmapData = this._bitmapData || bitmapData;
    },

    get pixelSnapping() { // (void) -> String
      return this._pixelSnapping;
    },
    set pixelSnapping(value) { // (value:String) -> void
      this._pixelSnapping = value;
    },

    get smoothing() { // (void) -> Boolean
      return this._smoothing;
    },
    set smoothing(value) { // (value:Boolean) -> void
      this._smoothing = value;
    },
    get bitmapData() { // (void) -> BitmapData
      return this._bitmapData;
    },
    set bitmapData(value) { // (value:BitmapData) -> void
      if (value === this._bitmapData) {
        return;
      }
      this._markAsDirty();
      if (this._bitmapData) {
        this._control.removeChild(this._bitmapData._drawable);
      }
      this._bitmapData = value;
      if (value) {
        this._control.appendChild(this._bitmapData._drawable);
      }
      this._bbox = {
        left: 0,
        top: 0,
        right: value ? value.width : 0,
        bottom: value ? value.height : 0
      };
    }
  };

  var desc = Object.getOwnPropertyDescriptor;
  def.__glue__ = {
    native: {
      static: {
      },
      instance: {
        ctor : def.ctor,
        pixelSnapping : desc(def, 'pixelSnapping'),
        smoothing : desc(def, 'smoothing'),
        bitmapData : desc(def, 'bitmapData')
      }
    }
  }

  return def;
}).call(this);
