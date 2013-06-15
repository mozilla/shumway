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
/*global renderingTerminated:true */

var FSCommandDefinition = (function () {
  var def = {};

  function fscommand(command, parameters) {
    console.log('FSCommand: ' + command + '; ' + parameters);
    switch (command.toLowerCase()) {
    case 'quit':
      renderingTerminated = true;
      return;
    case 'debugger':
      /*jshint -W087 */
      debugger; // shumway breakpoint... for convinience
      return;
    default:
      // TODO ignoring all other fscommand
      break;
    }
  }

  def.__glue__ = {
    native: {
      static: {
        _fscommand: fscommand
      }
    }
  };

  return def;
}).call(this);
