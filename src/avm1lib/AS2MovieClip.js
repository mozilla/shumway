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
/*global initDefaultListeners, Shumway */
var AS2MovieClipDefinition = (function () {
  var AS2Context = Shumway.AVM1.AS2Context;

  var def = {
    __class__: 'avm1lib.AS2MovieClip',

    initialize: function () {
    },

    _insertChildAtDepth: function _insertChildAtDepth(mc, depth) {
      return this._nativeAS3Object._insertChildAtDepth(mc, depth);
    },
    _duplicate: function _duplicate(name, depth, initObject) {
      return this._nativeAS3Object._duplicate(name, depth, initObject);
    },
    _constructSymbol: function constructSymbol(symbolId, name) {
      var theClass = AS2Context.instance.classes && AS2Context.instance.classes[symbolId];
      var symbolProps = AS2Context.instance.getAsset(symbolId);

      var symbolClass = flash.display.MovieClip.class;
      var mc = symbolClass.createAsSymbol(symbolProps);
      mc._avm1SymbolClass = theClass;
      symbolClass.instanceConstructor.call(mc);
      this._nativeAS3Object.addChild(mc);

      return mc;
    },
    _gotoLabel: function (label) {
      this._nativeAS3Object.gotoLabel(label);
    },
    _callFrame: function callFrame(frame) {
      this._nativeAS3Object._callFrame(frame);
    },
    init: function init(nativeMovieClip) {
      if (!nativeMovieClip) {
        return; // delaying initialization, see also _constructSymbol
      }
      Object.defineProperty(this, '_nativeAS3Object', { value: nativeMovieClip });
      nativeMovieClip._as2Object = this;
      initDefaultListeners(this);
    },
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        _as3Object: {
          get: function () {
            return this._nativeAS3Object;
          }
        },
        _init: def.init,
        _insertChildAtDepth: def._insertChildAtDepth,
        _duplicate: def._duplicate,
        _constructSymbol: def._constructSymbol,
        _callFrame: def._callFrame,
        _gotoLabel: def._gotoLabel,
      }
    },
    script: {
      instance: Glue.ALL
    }
  };

  return def;
}).call(this);
