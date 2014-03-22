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
/*global initDefaultListeners */
var AS2MovieClipLoaderDefinition = (function () {
  var def = {
    __class__: 'avm1lib.AS2MovieClipLoader',

    initialize: function () {
    },

    _setAS3Object: function (nativeLoader) {
      Object.defineProperty(this, '_nativeAS3Object', { value: nativeLoader });
    },
    get _as3Object() {
      return this._nativeAS3Object;
    },
    get _bytesLoaded() {
      return this._nativeAS3Object._contentLoaderInfo._bytesLoaded;
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        _as3Object: desc(def, '_as3Object'),
        _setAS3Object: def._setAS3Object,
        _bytesLoaded: desc(def, '_bytesLoaded'),
      }
    },
    script: {
      instance: Glue.ALL
    }
  };

  return def;
}).call(this);
