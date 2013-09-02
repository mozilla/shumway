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

  var rootElement;
  var hoveredElement;
  var selectedElement;
  var boundClickListener;
  var boundMouseOverListener;
  var displayObjectStore;

  function processChildren(parent) {
    var children = parent.displayObject._children;
    for (var i = 0, n = children.length; i < n; i++) {
      var child = children[i];
      if (child) {
        var item = {
          displayObject: child,
          children: [],
          parent: parent,
          index: displayObjectStore.length,
          hasTimeline: flash.display.MovieClip.class.isInstanceOf(child)
        };
        parent.children.push(item);
        displayObjectStore.push(item);
        if (flash.display.DisplayObjectContainer.class.isInstanceOf(child) || flash.display.SimpleButton.class.isInstanceOf(child)) {
          processChildren(item);
        }
      }
    }
  }

  function findItemElement(el) {
    while (el && el !== rootElement) {
      if (el.classList.contains("item")) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  var ctor = function(root) {
    this.root = { displayObject: root, children: [], parent: null, index: 0 };
    displayObjectStore = [ this.root ];
    processChildren(this.root);
  }

  ctor.prototype = {

    updateDom: function updateDom(elRoot) {
      var that = this;
      function updateChildren(elContainer, item) {
        var li = document.createElement("li");
        var div = document.createElement("div");
        div.textContent = item.displayObject.class.className + " ";
        if (item.hasTimeline) {
          var span = document.createElement("span");
          span.textContent = item.displayObject._currentFrame + "/" + item.displayObject._totalFrames;
          div.appendChild(span);
        }
        div.className = "item";
        div.dataset.dosidx = item.index;
        li.appendChild(div);
        elContainer.appendChild(li);
        if (item.children.length > 0) {
          var ul = document.createElement("ul");
          for (var i = 0, n = item.children.length; i < n; i++) {
            updateChildren(ul, item.children[i]);
          }
          li.appendChild(ul);
        }
      }
      if (boundClickListener) {
        elRoot.removeEventListener("click", boundClickListener);
      }
      if (boundMouseOverListener) {
        elRoot.removeEventListener("mouseover", boundMouseOverListener);
      }
      boundClickListener = this._onClick.bind(this);
      boundMouseOverListener = this._onMouseOver.bind(this);
      elRoot.addEventListener("click", boundClickListener);
      elRoot.addEventListener("mouseover", boundMouseOverListener);
      elRoot.innerHTML = '<ul id="displayListRoot"></ul>';
      rootElement = elRoot;
      updateChildren(document.getElementById("displayListRoot"), this.root);
    },

    _onClick: function _onClick(event) {
      function clearSelectedState() {
        if (selectedElement) {
          selectedElement.classList.remove("selected");
        }
      }
      var el = findItemElement(event.target);
      if (el) {
        // CLICK
        clearSelectedState();
        if (el !== selectedElement || (selectedElement && !event.metaKey && !event.altKey)) {
          // SELECT
          selectedElement = el;
          selectedElement.classList.add("selected");
          //console.log(displayObjectStore[el.dataset.dosidx].displayObject.name)
        } else if (selectedElement) {
          // UNSELECT
          selectedElement = null;
        }
      }
    },

    _onMouseOver: function _onMouseOver(event) {
      var el = findItemElement(event.target);
      if (el) {
        if (el !== hoveredElement) {
          // OVER
          hoveredElement = el;
        }
      } else {
        // OUT
        hoveredElement = null;
      }
    }

  };

  return ctor;

})();
