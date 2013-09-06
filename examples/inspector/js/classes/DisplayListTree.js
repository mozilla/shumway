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

  var containerElement;
  var rootElement;
  var propertiesElement;
  var hoveredElement;
  var selectedElement;
  var selectedItem;
  var boundClickListener;
  var boundMouseOverListener;
  var displayObjectStore;

  var displayObjectProps = [
    "alpha",
    "blendMode",
    "cacheAsBitmap",
    "height",
    "name",
    "scaleX",
    "scaleY",
    "visible",
    "width"
  ];

  function findItemElement(el) {
    while (el && el !== rootElement) {
      if (el.classList.contains("item")) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function updateProperties(displayObject) {
    if (typeof displayObject === "undefined") {
      containerElement.classList.remove("hasProperties");
      propertiesElement.innerHTML = "";
    } else {
      containerElement.classList.add("hasProperties");
      var innerHTML = "";
      for (var i = 0, n = displayObjectProps.length; i < n; i++) {
        innerHTML += '<div>' + displayObjectProps[i] + ': ' + displayObject[displayObjectProps[i]] + '</div>';
      }
      propertiesElement.innerHTML = innerHTML;
    }
  }

  function createLabel(displayObject) {
    var div = document.createElement("div");
    div.textContent = displayObject.class.className + " ";
    if (displayObject._name) {
      var spanName = document.createElement("span");
      spanName.textContent = "'" + displayObject._name + "'";
      spanName.className = "dobName";
      div.appendChild(spanName);
    }
    if (flash.display.MovieClip.class.isInstanceOf(displayObject)) {
      var spanFrameInfo = document.createElement("span");
      spanFrameInfo.textContent = displayObject._currentFrame + "/" + displayObject._totalFrames;
      spanFrameInfo.className = "mcFrameInfo";
      div.appendChild(spanFrameInfo);
    }
    div.className = "item";
    return div;
  }

  function updateChildren(item, elItemContainer) {
    var li = document.createElement("li");

    var label = createLabel(item);
    label.dataset.dosidx = displayObjectStore.length;
    li.appendChild(label);

    displayObjectStore.push(item);

    // If item is container, iterate over its children and recurse
    if ((flash.display.DisplayObjectContainer.class.isInstanceOf(item) ||
         flash.display.SimpleButton.class.isInstanceOf(item)) &&
        item._children &&
        item._children.length > 0)
    {
      var ul = document.createElement("ul");
      var children = item._children;
      for (var i = 0, n = children.length; i < n; i++) {
        if (children[i]) {
          updateChildren(children[i], ul);
        }
      }
      li.appendChild(ul);
    }

    elItemContainer.appendChild(li);
  }

  var DisplayListTree = function() {}

  DisplayListTree.prototype = {

    updateDom: function updateDom(stage, elContainer) {
      displayObjectStore = [];
      if (rootElement) {
        if (boundClickListener) {
          rootElement.removeEventListener("click", boundClickListener);
        }
        if (boundMouseOverListener) {
          rootElement.removeEventListener("mouseover", boundMouseOverListener);
        }
      }
      boundClickListener = this._onClick.bind(this);
      boundMouseOverListener = this._onMouseOver.bind(this);
      containerElement = elContainer;
      containerElement.innerHTML = '<div id="displayList"><ul id="displayListRoot"></ul></div><div id="displayObjectProperties"></div>';
      propertiesElement = document.getElementById("displayObjectProperties");
      rootElement = document.getElementById("displayList");
      rootElement.addEventListener("click", boundClickListener);
      rootElement.addEventListener("mouseover", boundMouseOverListener);
      updateChildren(stage, document.getElementById("displayListRoot"));
      updateProperties();
    },

    _onClick: function _onClick(event) {
      var el = findItemElement(event.target);
      if (el) {
        // CLICK
        if (selectedElement) {
          selectedElement.classList.remove("selected");
        }
        if (el !== selectedElement || (selectedElement && !event.metaKey && !event.altKey)) {
          // SELECT
          selectedElement = el;
          selectedElement.classList.add("selected");
          selectedItem = displayObjectStore[el.dataset.dosidx];
          updateProperties(selectedItem);
        } else if (selectedElement) {
          // UNSELECT
          selectedElement = null;
          selectedItem = null;
          updateProperties();
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

  return DisplayListTree;

})();
