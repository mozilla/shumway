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

var ContextMenuDefinition = (function () {
  return {
    // ()
    __class__: "flash.ui.ContextMenu",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          _checkSupported: function _checkSupported() { // (void) -> Boolean
            notImplemented("ContextMenu._checkSupported");
          }
        },
        instance: {
          cloneLinkAndClipboardProperties: function cloneLinkAndClipboardProperties(c) { // (c:ContextMenu) -> void
            notImplemented("ContextMenu.cloneLinkAndClipboardProperties");
          },
          builtInItems: {
            get: function builtInItems() { // (void) -> ContextMenuBuiltInItems
              somewhatImplemented("ContextMenu.builtInItems");
              return this._builtInItems;
            },
            set: function builtInItems(value) { // (value:ContextMenuBuiltInItems) -> void
              somewhatImplemented("ContextMenu.builtInItems");
              this._builtInItems = value;
            }
          },
          customItems: {
            get: function customItems() { // (void) -> Array
              somewhatImplemented("ContextMenu.customItems");
              return this._customItems;
            },
            set: function customItems(value) { // (value:Array) -> void
              somewhatImplemented("ContextMenu.customItems");
              this._customItems = value;
            }
          },
          link: {
            get: function link() { // (void) -> URLRequest
              notImplemented("ContextMenu.link");
              return this._link;
            },
            set: function link(value) { // (value:URLRequest) -> void
              notImplemented("ContextMenu.link");
              this._link = value;
            }
          },
          clipboardMenu: {
            get: function clipboardMenu() { // (void) -> Boolean
              notImplemented("ContextMenu.clipboardMenu");
              return this._clipboardMenu;
            },
            set: function clipboardMenu(value) { // (value:Boolean) -> void
              notImplemented("ContextMenu.clipboardMenu");
              this._clipboardMenu = value;
            }
          },
          clipboardItems: {
            get: function clipboardItems() { // (void) -> ContextMenuClipboardItems
              notImplemented("ContextMenu.clipboardItems");
              return this._clipboardItems;
            },
            set: function clipboardItems(value) { // (value:ContextMenuClipboardItems) -> void
              notImplemented("ContextMenu.clipboardItems");
              this._clipboardItems = value;
            }
          }
        }
      }
    }
  };
}).call(this);
