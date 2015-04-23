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
  var boundFocusListener;
  var boundBlurListener;
  var boundKeyDownListener;
  var displayObjectStore;

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
    if (isNullOrUndefined(displayObject)) {
      containerElement.classList.remove("hasProperties");
      propertiesElement.innerHTML = "";
    } else {
      containerElement.classList.add("hasProperties");
      var table = "<table>";
      table += '<tr>' + makePropCell('symbolId', displayObject.symbol && displayObject.symbol.symbolId) +
                makePropCell('name', displayObject._name) + '</tr>';
      var pos = {x: displayObject.x, y: displayObject.y};
      table += '<tr>' + makePropCell('x', printCoord(pos.x)) +
               makePropCell('y', printCoord(pos.y)) + '</tr>';
      displayObject._applyCurrentTransform(pos);
      table += '<tr>' + makePropCell('left', printCoord(pos.x)) +
               makePropCell('top', printCoord(pos.y)) + '</tr>';
      table += '<tr>' + makePropCell('width', printCoord(displayObject.width)) +
               makePropCell('height', printCoord(displayObject.height)) + '</tr>';
      table += '<tr>' + makePropCell('scaleX', round(displayObject.scaleX)) +
               makePropCell('scaleY', round(displayObject.scaleY)) + '</tr>';
      table += '<tr>' + makePropCell('visible', displayObject.visible) +
               makePropCell('alpha', displayObject.alpha) + '</tr>';
      table += '<tr>' + makePropCell('blendMode', displayObject.blendMode) +
                makePropCell('cacheAsBitmap', displayObject.cacheAsBitmap) + '</tr>';
      table += '<tr>' + makePropCell('text', displayObject.text) +
        makePropCell('htmlText', displayObject.htmlText) + '</tr>';
      table += "</table>";
      propertiesElement.innerHTML = table;
    }
  }
  function makePropCell(name, value) {
    return '<td>' + name + '</td><td>' + value + '</td>';
  }

  function printCoord(value) {
    return value/20 + 'px (' + value + 'tw)';
  }

  function round(value) {
    return Math.round(value * 1000) / 1000;
  }

  function createLabel(displayObject) {
    var div = document.createElement("div");
    div.className = "item";
    var spanOutline = document.createElement("span");
    spanOutline.className = "doOutline";
    if (!isNullOrUndefined(displayObject._wireframeStrokeStyle)) {
      spanOutline.innerHTML = "&#xf0c8;";
      spanOutline.setAttribute("style", "color:" + displayObject._wireframeStrokeStyle);
    } else {
      spanOutline.innerHTML = "&#xf096;";
    }
    div.appendChild(spanOutline);
    var spanClass = document.createElement("span");
    var numChildren = displayObject._children ? displayObject._children.length : 0;
    spanClass.textContent = displayObject.class.className + (numChildren ? " (" + displayObject._children.length + ")" : "");
    spanClass.className = "doClass";
    div.appendChild(spanClass);
    if (!isNullOrUndefined(displayObject._name)) {
      var spanName = document.createElement("span");
      spanName.textContent = "'" + displayObject._name + "'";
      spanName.className = "doName";
      div.appendChild(spanName);
    }
    if (flash.display.MovieClip.class.isInstanceOf(displayObject)) {
      var spanFrameInfo = document.createElement("span");
      spanFrameInfo.textContent = displayObject._currentFrame + "/" + displayObject._totalFrames;
      spanFrameInfo.className = "mcFrameInfo";
      div.appendChild(spanFrameInfo);
    }
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

    update: function updateDom(stage, container) {
      displayObjectStore = [];

      var scrollTopOld = 0;
      if (rootElement) {
        scrollTopOld = rootElement.scrollTop;
      }

      containerElement = container;
      containerElement.innerHTML = "";

      var displayListRoot = document.createElement("div");
      displayListRoot.setAttribute("id", "displayListRoot");

      this._removeEventListeners(rootElement);

      rootElement = document.createElement("div");
      rootElement.setAttribute("id", "displayList");
      rootElement.setAttribute("tabindex", "6");
      rootElement.appendChild(displayListRoot);

      this._addEventListeners(rootElement);

      propertiesElement = document.createElement("div");
      propertiesElement.setAttribute("id", "displayObjectProperties");

      updateChildren(stage, displayListRoot);

      containerElement.appendChild(rootElement);
      containerElement.appendChild(propertiesElement);

      if (selectedItem) {
        var dosidx = displayObjectStore.indexOf(selectedItem);
        if (dosidx > -1) {
          selectedElement = document.querySelector("#displayListRoot .item[data-dosidx=\"" + dosidx + "\"]");
          selectedElement.classList.add("selected");
        } else {
          selectedItem = null;
          selectedElement = null;
        }
      }

      updateProperties(selectedItem);

      if (scrollTopOld !== 0) {
        rootElement.scrollTop = scrollTopOld;
      }
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
          selectedItem = displayObjectStore[parseInt(el.dataset.dosidx)];
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
    },

    _onFocus: function _onFocus(event) {
      boundKeyDownListener = this._onKeyDown.bind(this);
      event.target.addEventListener('keydown', boundKeyDownListener, false);
    },

    _onBlur: function _onBlur(event) {
      if (boundKeyDownListener) {
        event.target.removeEventListener("keydown", boundKeyDownListener);
      }
    },

    _onKeyDown: function _onBlur(event) {
      var dir = 0;
      switch (event.keyCode) {
        case 40:
          dir = 1;
          break;
        case 38:
          dir = -1;
          break;
      }
      if (dir != 0) {
        var dosidx = clamp(selectedElement ? +selectedElement.dataset.dosidx + dir : 0, 0, displayObjectStore.length - 1);
        var newSelectedItem = displayObjectStore[dosidx];
        if (selectedItem !== newSelectedItem) {
          if (selectedElement) {
            selectedElement.classList.remove("selected");
          }
          selectedItem = newSelectedItem;
          selectedElement = document.querySelector("#displayListRoot .item[data-dosidx=\"" + dosidx + "\"]");
          selectedElement.classList.add("selected");
          updateProperties(selectedItem);
        }
        event.preventDefault();
      }
    },

    _addEventListeners: function _addEventListeners(el) {
        boundClickListener = this._onClick.bind(this);
        boundMouseOverListener = this._onMouseOver.bind(this);
        boundFocusListener = this._onFocus.bind(this);
        boundBlurListener = this._onBlur.bind(this);
        el.addEventListener("click", boundClickListener);
        el.addEventListener("mouseover", boundMouseOverListener);
        el.addEventListener("focus", boundFocusListener);
        el.addEventListener("blur", boundBlurListener);
    },

    _removeEventListeners: function _removeEventListeners(el) {
      if (el) {
        if (boundClickListener) {
          el.removeEventListener("click", boundClickListener);
        }
        if (boundMouseOverListener) {
          el.removeEventListener("mouseover", boundMouseOverListener);
        }
        if (boundFocusListener) {
          el.removeEventListener("focus", boundFocusListener);
        }
        if (boundBlurListener) {
          el.removeEventListener("blur", boundBlurListener);
        }
        if (boundKeyDownListener) {
          el.removeEventListener("keydown", boundKeyDownListener);
        }
      }
    }

  };

  return DisplayListTree;

})();
