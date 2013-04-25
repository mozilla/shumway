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

var ContextMenuItemDefinition = (function () {
  return {
    // (caption:String, separatorBefore:Boolean = false, enabled:Boolean = true, visible:Boolean = true)
    __class__: "flash.ui.ContextMenuItem",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          caption: {
            get: function caption() { // (void) -> String
              somewhatImplemented("ContextMenuItem.caption");
              return this._caption;
            },
            set: function caption(value) { // (value:String) -> void
              somewhatImplemented("ContextMenuItem.caption");
              this._caption = value;
            }
          },
          separatorBefore: {
            get: function separatorBefore() { // (void) -> Boolean
              somewhatImplemented("ContextMenuItem.separatorBefore");
              return this._separatorBefore;
            },
            set: function separatorBefore(value) { // (value:Boolean) -> void
              somewhatImplemented("ContextMenuItem.separatorBefore");
              this._separatorBefore = value;
            }
          },
          visible: {
            get: function visible() { // (void) -> Boolean
              somewhatImplemented("ContextMenuItem.visible");
              return this._visible;
            },
            set: function visible(value) { // (value:Boolean) -> void
              somewhatImplemented("ContextMenuItem.visible");
              this._visible = value;
            }
          }
        }
      }
    }
  };
}).call(this);
