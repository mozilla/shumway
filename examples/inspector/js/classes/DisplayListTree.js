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

  function updateProperties(item) {
    if (typeof item === "undefined") {
      containerElement.classList.remove("hasProperties");
      propertiesElement.innerHTML = "";
    } else {
      containerElement.classList.add("hasProperties");
      var innerHTML = "";
      for (var i = 0, n = displayObjectProps.length; i < n; i++) {
        innerHTML += '<div>' + displayObjectProps[i] + ': ' + item.displayObject[displayObjectProps[i]] + '</div>';
      }
      propertiesElement.innerHTML = innerHTML;
    }
  }

  var ctor = function(root) {
    this.root = { displayObject: root, children: [], parent: null, index: 0 };
    displayObjectStore = [ this.root ];
    processChildren(this.root);
  }

  ctor.prototype = {

    updateDom: function updateDom(elContainer) {
      var that = this;
      function updateChildren(elItemContainer, item) {
        var li = document.createElement("li");
        var div = document.createElement("div");
        div.textContent = item.displayObject.class.className + " ";
        if (item.hasTimeline) {
          console.log(item.displayObject.class.className, item.displayObject)
          if (item.displayObject._name) {
            var spanName = document.createElement("span");
            spanName.textContent = "'" + item.displayObject._name + "'";
            spanName.className = "dobName";
            div.appendChild(spanName);
          }
          var spanFrameInfo = document.createElement("span");
          spanFrameInfo.textContent = item.displayObject._currentFrame + "/" + item.displayObject._totalFrames;
          spanFrameInfo.className = "mcFrameInfo";
          div.appendChild(spanFrameInfo);
        }
        div.className = "item";
        div.dataset.dosidx = item.index;
        li.appendChild(div);
        elItemContainer.appendChild(li);
        if (item.children.length > 0) {
          var ul = document.createElement("ul");
          for (var i = 0, n = item.children.length; i < n; i++) {
            updateChildren(ul, item.children[i]);
          }
          li.appendChild(ul);
        }
      }
      if (boundClickListener) {
        rootElement.removeEventListener("click", boundClickListener);
      }
      if (boundMouseOverListener) {
        rootElement.removeEventListener("mouseover", boundMouseOverListener);
      }
      boundClickListener = this._onClick.bind(this);
      boundMouseOverListener = this._onMouseOver.bind(this);
      elContainer.innerHTML = '<div id="displayList"><ul id="displayListRoot"></ul></div><div id="displayObjectProperties"></div>';
      containerElement = elContainer;
      propertiesElement = document.getElementById("displayObjectProperties");
      rootElement = document.getElementById("displayList");
      rootElement.addEventListener("click", boundClickListener);
      rootElement.addEventListener("mouseover", boundMouseOverListener);
      updateChildren(document.getElementById("displayListRoot"), this.root);
      updateProperties();
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
          updateProperties(displayObjectStore[el.dataset.dosidx]);
        } else if (selectedElement) {
          // UNSELECT
          selectedElement = null;
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

  return ctor;

})();
