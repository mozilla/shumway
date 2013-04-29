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

var MouseDefinition = (function() {

  var def = {
    __class__: 'flash.ui.Mouse'
  };

  function hide() {
    // this._stage._setCursorVisible(false);
  }

  function show() {
    // this._stage._setCursorVisible(true);
  }

  function registerCursor() {
    notImplemented();
  }

  function unregisterCursor() {
    notImplemented();
  }

  def.__glue__ = {
    native: {
      static: {
        cursor: {
          get: function () { return 'auto'; }, //TODO
          set: function () { notImplemented(); }
        },

        supportsCursor: {
          get: function () { return true; } // TODO
        },
        supportsNativeCursor: {
          get: function () { return true; } // TODO
        },

        hide: hide,
        show: show,
        registerCursor: registerCursor,
        unregisterCursor: unregisterCursor
      },
    },
  };

  return def;
}).call(this);
