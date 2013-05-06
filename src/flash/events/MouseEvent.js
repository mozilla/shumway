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

var MouseEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.MouseEvent',

    updateAfterEvent: function () {
      notImplemented();
    }
  };

  def.__glue__ = {
    script: {
      instance: {
        relatedObject: 'private m_relatedObject',
        ctrlKey: 'private m_ctrlKey',
        altKey: 'private m_altKey',
        shiftKey: 'private m_shiftKey',
        buttonDown: 'private m_buttonDown',
        delta: 'private m_delta',
        isRelatedObjectInaccessible: 'private m_isRelatedObjectInaccessible'
      },

      static: {
        CLICK:        'public CLICK',
        DOUBLE_CLICK: 'public DOUBLE_CLICK',
        MOUSE_DOWN:   'public MOUSE_DOWN',
        MOUSE_MOVE:   'public MOUSE_MOVE',
        MOUSE_OUT:    'public MOUSE_OUT',
        MOUSE_OVER:   'public MOUSE_OVER',
        MOUSE_UP:     'public MOUSE_UP',
        MOUSE_WHEEL:  'public MOUSE_WHEEL',
        ROLL_OUT:     'public ROLL_OUT',
        ROLL_OVER:    'public ROLL_OVER'
      },
    },

    native: {
      instance: {
        localX: {
          get: function () { return this.localX; },
          set: function (v) { this.localX = v; }
        },
        localY: {
          get: function () { return this.localY; },
          set: function (v) { this.localY = v; },
        },
        getStageX: function () { notImplemented() },
        getStageY: function () { notImplemented() },
        updateAfterEvent: def.updateAfterEvent
      }
    }
  };

  return def;
}).call(this);
