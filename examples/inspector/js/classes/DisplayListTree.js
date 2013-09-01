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
var DisplayListTree = (function() {

  function processChildren(parent) {
    var children = parent.displayObject._children;
    for (var i = 0, n = children.length; i < n; i++) {
      var child = children[i];
      if (child) {
        var item = { displayObject: child, children: [] };
        var isContainer = flash.display.DisplayObjectContainer.class.isInstanceOf(child) ||
                          flash.display.SimpleButton.class.isInstanceOf(child);
        if (isContainer) {
          processChildren(item);
        }
        parent.children.push(item);
        //console.log(item.displayObject.class.className, item.displayObject.__class__);
      }
    }
  }

  var ctor = function(root) {
    this.root = { displayObject: root, children: [] };
    processChildren(this.root);
  }

  ctor.prototype = {

    updateDom: function updateDom(elRoot) {
      function updateChildren(elContainer, item) {
        var li = document.createElement("li");
        var span = document.createElement("span");
        span.textContent = item.displayObject.class.className;
        li.appendChild(span);
        elContainer.appendChild(li);
        if (item.children.length > 0) {
          var ul = document.createElement("ul");
          for (var i = 0, n = item.children.length; i < n; i++) {
            updateChildren(ul, item.children[i]);
          }
          li.appendChild(ul);
        }
      }
      elRoot.innerHTML = '<ul id="displayListRoot"></ul>';
      updateChildren(document.getElementById("displayListRoot"), this.root);
    }

  };

  return ctor;

})();
