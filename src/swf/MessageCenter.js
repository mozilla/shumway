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

var MessageCenter = {
  _listeners: { },
  _callbacks: { },
  _nextCallbackId: 0,
  _rCallback: /^callback:(\d*)$/
};
MessageCenter._handleMessage = function (msg, sync) {
  var type = msg.type;
  var data = msg.data;

  if (this._rCallback.test(type)) {
    var callbackId = RegExp.$1;
    var callback = this._callbacks[callbackId];
    if (callback) {
      callback(data);
      delete this._callbacks[callbackId];
    }
    return;
  }

  var listeners = this._listeners[type];
  if (listeners) {
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      if (typeof listener === 'object') {
        listener.handleMessage(data, sync);
      } else {
        listener(data, sync);
      }
    }
  }
};
MessageCenter.subscribe = function (type, listener) {
  if (this._listeners[type]) {
    this._listeners[type].push(listener);
  } else {
    this._listeners[type] = [listener];
  }
};
MessageCenter.post = function (type, data) {
  postMessage({ type: type, data: data }, '*');
};
MessageCenter.postSync = function (type, data) {
  this._handleMessage({ type: type, data: data }, true);
};
MessageCenter.setCallback = function (fn) {
  var callbackId = this._nextCallbackId++;
  this._callbacks[callbackId] = fn;
  return callbackId;
};

self.addEventListener('message', function (e) {
  MessageCenter._handleMessage(e.data);
});

function BinaryMessage() {
  this._message = new Shumway.Util.ArrayWriter(1024);
}

BinaryMessage.nextRenderableId = 1;
BinaryMessage.nextLayerId = 1;

BinaryMessage.prototype.setup = function setup(stage) {
  var message = this._message;
  message.ensureAdditionalCapacity(28);
  message.writeIntUnsafe(Renderer.MESSAGE_SETUP_STAGE);
  message.writeIntUnsafe(20);
  message.writeIntUnsafe(stage._color);
  message.writeIntUnsafe(stage._stageWidth / 20);
  message.writeIntUnsafe(stage._stageHeight / 20);
  message.writeFloatUnsafe(stage._contentsScaleFactor);
};
BinaryMessage.prototype.defineRenderable = function defineRenderable(symbol, dictionary) {
  var message = this._message;

  message.ensureAdditionalCapacity(16);
  message.writeIntUnsafe(Renderer.MESSAGE_DEFINE_RENDERABLE);

  var p = message.getIndex(4);
  message.reserve(4);

  var renderableId = BinaryMessage.nextRenderableId++;
  symbol.renderableId = renderableId;

  message.writeIntUnsafe(renderableId);

  var dependencies = symbol.require;
  var n = dependencies ? dependencies.length : 0;
  message.ensureAdditionalCapacity((1 + n) * 4);
  message.writeIntUnsafe(n);
  for (var i = 0; i < n; i++) {
    message.writeIntUnsafe(dependencies[i]);
  }

  switch (symbol.type) {
  case 'shape':
    message.writeIntUnsafe(Renderer.RENDERABLE_TYPE_SHAPE);
    symbol.graphics._serialize(message);
    break;
  case 'image':
    message.writeIntUnsafe(Renderer.RENDERABLE_TYPE_BITMAP);
    message.ensureAdditionalCapacity(16);
    message.writeIntUnsafe(symbol.width);
    message.writeIntUnsafe(symbol.height);
    message.writeIntUnsafe(symbol.mimeType === 'application/octet-stream' ?
                            Renderer.BITMAP_TYPE_RAW :
                            Renderer.BITMAP_TYPE_DATA);

    var len = symbol.data.length;
    message.writeIntUnsafe(len);
    var offset = message.getIndex(1);
    message.reserve(len);
    message.subU8View().set(symbol.data, offset);
    break;
  case 'font':
    if (!symbol.data) {
      break;
    }

    message.writeIntUnsafe(Renderer.RENDERABLE_TYPE_FONT);

    var len = symbol.data.length;
    message.writeInt(len);
    var offset = message.getIndex(1);
    message.reserve(len);
    message.subU8View().set(symbol.data, offset);
    break;
  case 'label':
    message.writeIntUnsafe(Renderer.RENDERABLE_TYPE_LABEL);

    var bbox = symbol.bbox;
    message.ensureAdditionalCapacity(16);
    message.writeIntUnsafe(bbox.xMin);
    message.writeIntUnsafe(bbox.xMax);
    message.writeIntUnsafe(bbox.yMin);
    message.writeIntUnsafe(bbox.yMax);

    var labelData = symbol.data;
    n = labelData.length;
    message.ensureAdditionalCapacity((1 + n) * 4);
    message.writeIntUnsafe(n);
    for (var i = 0; i < n; i++) {
      message.writeIntUnsafe(labelData.charCodeAt(i));
    }
    break;
  case 'text':
    message.writeIntUnsafe(Renderer.RENDERABLE_TYPE_TEXT);

    var tag = symbol.tag;

    message.ensureAdditionalCapacity(88);

    var bbox = tag.bbox;
    message.writeIntUnsafe(bbox.xMin);
    message.writeIntUnsafe(bbox.xMax);
    message.writeIntUnsafe(bbox.yMin);
    message.writeIntUnsafe(bbox.yMax);

    if (tag.hasFont) {
      message.writeIntUnsafe(1);
      var fontInfo = dictionary[tag.fontId];
      message.writeIntUnsafe(fontInfo.props.renderableId);
    } else {
      message.writeIntUnsafe(0);
      message.writeIntUnsafe(0);
    }

    message.writeIntUnsafe(symbol.bold);
    message.writeIntUnsafe(symbol.italic);
    message.writeIntUnsafe(tag.fontHeight / 20);

    var color = 0;
    if (tag.hasColor) {
      var colorObj = tag.color;
      color = (colorObj.red << 24) |
              (colorObj.green << 16) |
              (colorObj.blue << 8) |
              colorObj.alpha;
    }
    message.writeIntUnsafe(color);

    message.writeIntUnsafe(0); // backgroundColor
    message.writeIntUnsafe(0); // borderColor
    message.writeIntUnsafe(tag.autoSize);
    message.writeIntUnsafe(tag.align);
    message.writeIntUnsafe(tag.wordWrap);
    message.writeIntUnsafe(tag.multiline);
    message.writeIntUnsafe(tag.leading / 20);
    message.writeIntUnsafe(0); // letterspacing
    message.writeIntUnsafe(0); // kerning
    message.writeIntUnsafe(tag.html);
    message.writeIntUnsafe(false); // condenseWhite
    message.writeIntUnsafe(1); // scrollV

    var text = tag.initialText;
    var n = text.length;
    message.ensureAdditionalCapacity((1 + n) * 4);
    message.writeIntUnsafe(n);
    for (var i = 0; i < n; i++) {
      message.writeIntUnsafe(text.charCodeAt(i));
    }
  }

  message.subI32View()[p] = message.getIndex(4) - (p + 1);
};
BinaryMessage.prototype.syncRenderable = function (node, callback) {
  var message = this._message;
  message.ensureAdditionalCapacity(16);
  message.writeIntUnsafe(Renderer.MESSAGE_SYNC_RENDERABLE);

  var p = message.getIndex(4);
  message.reserve(4);

  var callbackId = MessageCenter.setCallback(callback);
  message.writeIntUnsafe(callbackId);

  var renderableId = node._renderableId;
  if (!renderableId) {
    renderableId = BinaryMessage.nextRenderableId++;
    node._renderableId = renderableId;
  }
  message.writeIntUnsafe(renderableId);

  if (node._updateRenderable) {
    node._serializeRenderableData(message);
    node._updateRenderable = false;
  }

  message.subI32View()[p] = message.getIndex(4) - (p + 1);
};
BinaryMessage.prototype.requireRenderables = function requireRenderables(dependencies, callback) {
  var message = this._message;
  var len = (1 + dependencies.length) * 4;
  message.ensureAdditionalCapacity(4 + len);

  message.writeIntUnsafe(Renderer.MESSAGE_REQUIRE_RENDERABLES);
  message.writeIntUnsafe(len);

  var callbackId = MessageCenter.setCallback(callback);
  message.writeIntUnsafe(callbackId);

  for (var i = 0; i < dependencies.length; i++) {
    message.writeIntUnsafe(dependencies[i]);
  }
};
BinaryMessage.prototype.addLayer = function addLayer(id, parentId, node) {
  var message = this._message;
  message.ensureAdditionalCapacity(28);
  message.writeIntUnsafe(Renderer.MESSAGE_ADD_LAYER);

  var p = message.getIndex(4);
  message.reserve(4);

  if (!id) {
    id = BinaryMessage.nextLayerId++;
    node._layerId = id;
  }
  message.writeIntUnsafe(id);

  message.writeIntUnsafe(node._isContainer);
  message.writeIntUnsafe(parentId);
  message.writeIntUnsafe(node._index);

  var renderableId = node._renderableId;
  if (!renderableId) {
    renderableId = BinaryMessage.nextRenderableId++;
    node._renderableId = renderableId;
  }
  message.writeIntUnsafe(renderableId);

  node._serialize(message);

  message.subI32View()[p] = message.getIndex(4) - (p + 1);
};
BinaryMessage.prototype.removeLayer = function removeLayer(node) {
  if (!node._layerId) {
    return;
  }
  var message = this._message;
  message.ensureAdditionalCapacity(12);
  message.writeIntUnsafe(Renderer.MESSAGE_REMOVE_LAYER);
  message.writeIntUnsafe(4);
  message.writeIntUnsafe(node._layerId);
};
BinaryMessage.prototype.cacheAsBitmap = function (node) {
  var message = this._message;

  message.ensureAdditionalCapacity(36);
  message.writeIntUnsafe(Renderer.MESSAGE_DEFINE_RENDERABLE);

  var p1 = message.getIndex(4);
  message.reserve(4);

  var renderableId = BinaryMessage.nextRenderableId++;
  node._renderableId = renderableId;

  message.writeIntUnsafe(renderableId);

  message.writeIntUnsafe(0);

  message.writeIntUnsafe(Renderer.RENDERABLE_TYPE_BITMAP);
  message.writeIntUnsafe(node.width / 20);
  message.writeIntUnsafe(node.height / 20);
  message.writeIntUnsafe(Renderer.BITMAP_TYPE_DRAW);

  var p2 = message.getIndex(4);
  message.reserve(4);

  var nextLayerId = 1;
  var stack = [0, node];

  while (stack.length) {
    var node = stack.pop();
    var parentId = stack.pop();
    var layerId = nextLayerId++;

    var children = node._children;
    var i = children.length;
    while (i--) {
      var child = children[i];

      if (child._visible && child._alpha) {
        stack.push(layerId, child);
      }
    }

    this.addLayer(layerId, parentId, node);
  }

  var len = message.getIndex(4) - (p1 + 1);
  var subview = message.subI32View();
  subview[p1] = len;
  subview[p2] = (len * 4) - 28;
};
BinaryMessage.prototype.post = function commit(type, sync) {
  var data = this._message.u8.buffer;
  if (sync) {
    MessageCenter.postSync(type, data);
  } else {
    MessageCenter.post(type, data);
  }
  this._message = new Shumway.Util.ArrayWriter(1024);
};
