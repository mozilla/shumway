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

var head = document.head;
head.insertBefore(document.createElement('style'), head.firstChild);
var style = document.styleSheets[0];

Renderer.MESSAGE_DEFINE_RENDERABLE = 1;
Renderer.MESSAGE_REQUIRE_RENDERABLES = 2;
Renderer.MESSAGE_SETUP_STAGE = 3;
Renderer.MESSAGE_ADD_LAYER = 4;
Renderer.MESSAGE_REMOVE_LAYER = 5;

Renderer.RENDERABLE_TYPE_SHAPE = 1;
Renderer.RENDERABLE_TYPE_BITMAP = 2;
Renderer.RENDERABLE_TYPE_FONT = 3;
Renderer.RENDERABLE_TYPE_LABEL = 4;
Renderer.RENDERABLE_TYPE_TEXT = 5;

function rgbaUintToStr(rgba) {
  return 'rgba(' + (rgba >>> 24 & 0xff) + ',' + (rgba >>> 16 & 0xff) + ',' +
         (rgba >>> 8 & 0xff) + ',' + (rgba & 0xff) / 0xff + ')';
}

function Renderer(target) {
  this._target = target;
  this._stage = null;

  this._promises = { };
  this._renderables = { };
  this._layers = { };

  var renderer = this;
  window.onmessage = function (e) {
    var data = e.data;
    if (data.command === 'render') {
      var i32 = new Int32Array(data.data);
      var f32 = new Float32Array(data.data);
      var p = 0;
      var len = i32.length;
      while (p < len) {
        var type = i32[p++];
        var n = i32[p++] >> 2;
        switch (type) {
        case 0:
          return;
        case Renderer.MESSAGE_DEFINE_RENDERABLE:
          var id = i32[p++];
          var numDependencies = i32[p++];
          var dependencies = i32.subarray(p, p + numDependencies);
          p += numDependencies;
          var renderableType = i32[p++];
          var renderableData = i32.subarray(p, p += n - 1);
          renderer.defineRenderable(
            id, renderableType, dependencies, renderableData
          );
          break;
        case Renderer.MESSAGE_REQUIRE_RENDERABLES:
          var callbackId = i32[p++];
          var dependencies = i32.subarray(p, p += n - 1);
          renderer.requireRenderables(dependencies, function () {
            postMessage({
              command: 'callback',
              data: callbackId
            }, '*');
          });
          break;
        case Renderer.MESSAGE_SETUP_STAGE:
          var width = i32[p++];
          var height = i32[p++];
          var pixelRatio = renderer._target._contentsScaleFactor;
          renderer._stage = new Shumway.Layers.Stage(
            width, height, width * pixelRatio, height * pixelRatio
          );
          renderer._stage.transform =
            new Shumway.Geometry.Matrix.createIdentity()
                                       .scale(pixelRatio, pixelRatio);
          break;
        case Renderer.MESSAGE_ADD_LAYER:
          var isContainer = i32[p++];
          var parentId = i32[p++];
          var index = i32[p++];
          var layerId = i32[p++];
          var renderableId = i32[p++];

          var layer = renderer._layers[layerId];
          if (!layer) {
            if (isContainer) {
              layer = new Shumway.Layers.FrameContainer();
            } else {
              var renderable = renderer._renderables[renderableId];
              layer = new Shumway.Layers.Shape(renderable);
              layer.origin = new Shumway.Geometry.Point(
                renderable.rect.x, renderable.rect.y
              );
            }
            renderer._layers[layerId] = layer;

            var parent = renderer._layers[parentId] || renderer._stage;
            parent.addChild(layer);
          }

          layer.transform = new Shumway.Geometry.Matrix(
            f32[p++], f32[p++], f32[p++], f32[p++], i32[p++], i32[p++]
          );
          layer.alpha = f32[p++];

          var hasColorTransform = i32[p++];
          if (hasColorTransform) {
            layer.colorTransform =
              Shumway.Layers.ColorTransform.fromMultipliersAndOffsets(
                f32[p++], f32[p++], f32[p++], f32[p++],
                i32[p++], i32[p++], i32[p++], i32[p++]
              );
          }
          break;
        case Renderer.MESSAGE_REMOVE_LAYER:
          var layerId = i32[p++];
          var layer = renderer._layers[layerId];
          layer.parent.removeChild(layer);
          break;
        }
      }
    } else if (data.command === 'callback') {
      renderer._target._callback(data.data);
    }
  };
}

Renderer.prototype.defineRenderable = function defineRenderable(id, type,
                                                                dependencies,
                                                                data) {
  var renderer = this;
  var rendererable = null;
  var promise = new Promise(function (resolve) {
    switch (type) {
    case Renderer.RENDERABLE_TYPE_SHAPE:
      rendererable = new RenderableShape(data, renderer, resolve);
      break;
    case Renderer.RENDERABLE_TYPE_BITMAP:
      rendererable = new RenderableBitmap(data, renderer, resolve);
      break;
    case Renderer.RENDERABLE_TYPE_FONT:
      var uniqueName = 'swf-font-' + id;
      var len = data[0];
      var fontData = new Uint8Array(data.buffer, data.byteOffset + 4, len);
      var blob = new Blob([fontData]);

      style.insertRule(
        '@font-face{' +
          'font-family:"' + uniqueName + '";' +
          'src:url(' + URL.createObjectURL(blob) + ')' +
        '}',
        style.cssRules.length
      );

      // HACK non-Gecko browsers need time to load fonts
      if (!/Mozilla\/5.0.*?rv:(\d+).*? Gecko/.test(window.navigator.userAgent)) {
        var testDiv = document.createElement('div');
        testDiv.setAttribute('style', 'position: absolute; top: 0; right: 0;' +
                                      'visibility: hidden; z-index: -500;' +
                                      'font-family:"' + uniqueName + '";');
        testDiv.textContent = 'font test';
        document.body.appendChild(testDiv);

        setTimeout(function () {
          resolve();
          document.body.removeChild(testDiv);
        }, 200);
      } else {
        resolve();
      }
      break;
    case Renderer.RENDERABLE_TYPE_LABEL:
    case Renderer.RENDERABLE_TYPE_TEXT:
      rendererable = new RenderableText(data, renderer, resolve);
      break;
    default:
      resolve();
    }
  });

  if (dependencies && dependencies.length) {
    var promiseQueue = [promise];
    for (var i = 0; i < dependencies.length; i++) {
      var promise = this._promises[dependencies[i]];
      promiseQueue.push(promise);
    }
    promise = Promise.all(promiseQueue);
  }

  this._promises[id] = promise.then(function () {
    renderer._renderables[id] = rendererable;
    if (rendererable)
      rendererable.id = id;
  });
};
Renderer.prototype.getRenderable = function getRenderable(id) {
  return this._renderables[id];
};
Renderer.prototype.undefineRenderable = function undefineRenderable(id) {
  var renderable = this._renderables[id];
  delete this._renderables[id];
  return renderable;
};
Renderer.prototype.requireRenderables = function requireRenderables(ids, callback) {
  var promiseQueue = [];
  for (var i = 0; i < ids.length; i++) {
    promiseQueue.push(this._promises[ids[i]]);
  }
  Promise.all(promiseQueue).then(callback);
};

function RenderableShape(data, renderer, resolve) {
  var xMin = (data[0] / 20) | 0;
  var xMax = (data[1] / 20) | 0;
  var yMin = (data[2] / 20) | 0;
  var yMax = (data[3] / 20) | 0;
  this.rect = new Shumway.Geometry.Rectangle(xMin, yMin, xMax - xMin, yMax - yMin);

  this.properties = { renderer: renderer, data: data.subarray(4) };

  resolve();
}
RenderableShape.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderableShape.prototype.render = function render(ctx) {
  ctx.save();
  ctx.translate(-this.rect.x, -this.rect.y);

  var i32 = this.properties.data;
  var f32 = new Float32Array(i32.buffer, i32.byteOffset);
  var p = 0;
  while (p < i32.length) {
    var styles = [];
    for (var i = 0; i < 2; i++) {
      var style = null;
      var fillStyleType = i32[p++];
      switch (fillStyleType) {
      case GRAPHICS_FILL_SOLID:
        style = i32[p++];
        break;
      case GRAPHICS_FILL_LINEAR_GRADIENT:
        style = ctx.createLinearGradient(-1, 0, 1, 0);
      case GRAPHICS_FILL_RADIAL_GRADIENT:
      case GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT:
        var n = i32[p++];
        for (var j = 0; j < n; j++) {
          var ratio = f32[p++];
          var color = rgbaUintToStr(i32[p++]);
          style.addColorStop(ratio, color);
        }

        var focalPoint = (i32[p++] / 20) | 0;

        if (!style) {
          style = ctx.createRadialGradient(focalPoint, 0, 0, 0, 0, 1);
        }
        break;
      case GRAPHICS_FILL_REPEATING_BITMAP:
      case GRAPHICS_FILL_CLIPPED_BITMAP:
      case GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP:
      case GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP:
        var bitmapId = i32[p++];
        var repeat = !!i32[p++];
        var smooth = !!i32[p++];

        var bitmap = renderer.getRenderable(bitmapId);
        style = ctx.createPattern(
          bitmap.properties.img, repeat ? 'repeat' : 'no-repeat'
        );
        style.smooth = smooth;
        break;
      }
      if (isNaN(style)) {
        style.transform = { a: f32[p++],
                            b: f32[p++],
                            c: f32[p++],
                            d: f32[p++],
                            e: (i32[p++] / 20) | 0,
                            f: (i32[p++] / 20) | 0 };
      }
      styles.push(style);
    }

    var fillStyle = styles[0];
    var strokeStyle = styles[1];

    if (strokeStyle) {
      // Flash's lines are always at least 1px/20twips
      ctx.lineWidth = Math.max(i32[p++] / 20, 1);
      ctx.lineCap = CAPS_STYLE_TYPES[i32[p++]];
      ctx.lineJoin = JOIN_STYLE_TYPES[i32[p++]];
      ctx.miterLimit = i32[p++];
    }

    ctx.beginPath();

    var n = i32[p++];
    var commands = new Uint8Array(i32.buffer, i32.byteOffset + (p * 4), n);
    p += (n + (4 - (n % 4)) % 4) / 4;
    n = i32[p++];
    var data = i32.subarray(p, p + n);
    p += n;

    var formOpen = false;
    var formOpenX = 0;
    var formOpenY = 0;
    //if (!path.isMorph) {
      for (var j = 0, k = 0; j < commands.length; j++) {
        switch (commands[j]) {
          case SHAPE_MOVE_TO:
            formOpen = true;
            formOpenX = data[k++]/20;
            formOpenY = data[k++]/20;
            ctx.moveTo(formOpenX, formOpenY);
            break;
          case SHAPE_WIDE_MOVE_TO:
            ctx.moveTo(data[k++]/20, data[k++]/20);
            k += 2;
            break;
          case SHAPE_LINE_TO:
            ctx.lineTo(data[k++]/20, data[k++]/20);
            break;
          case SHAPE_WIDE_LINE_TO:
            ctx.lineTo(data[k++]/20, data[k++]/20);
            k += 2;
            break;
          case SHAPE_CURVE_TO:
            ctx.quadraticCurveTo(data[k++]/20, data[k++]/20,
                                 data[k++]/20, data[k++]/20);
            break;
          case SHAPE_CUBIC_CURVE_TO:
            ctx.bezierCurveTo(data[k++]/20, data[k++]/20,
                              data[k++]/20, data[k++]/20,
                              data[k++]/20, data[k++]/20);
            break;
          case SHAPE_CIRCLE:
            if (formOpen) {
              ctx.lineTo(formOpenX, formOpenY);
              formOpen = false;
            }
            ctx.moveTo((data[k] + data[k+2])/20, data[k+1]/20);
            ctx.arc(data[k++]/20, data[k++]/20, data[k++]/20, 0, Math.PI * 2,
                    false);
            break;
          case SHAPE_ELLIPSE:
            if (formOpen) {
              ctx.lineTo(formOpenX, formOpenY);
              formOpen = false;
            }
            var x = data[k++];
            var y = data[k++];
            var rX = data[k++];
            var rY = data[k++];
            var radius;
            if (rX !== rY) {
              ctx.save();
              var ellipseScale;
              if (rX > rY) {
                ellipseScale = rX / rY;
                radius = rY;
                x /= ellipseScale;
                ctx.scale(ellipseScale, 1);
              } else {
                ellipseScale = rY / rX;
                radius = rX;
                y /= ellipseScale;
                ctx.scale(1, ellipseScale);
              }
            }
            ctx.moveTo((x + radius)/20, y/20);
            ctx.arc(x/20, y/20, radius/20, 0, Math.PI * 2, false);
            if (rX !== rY) {
              ctx.restore();
            }
            break;
          default:
            // Sometimes, the very last command isn't properly set. Ignore it.
            if (commands[j] === 0 && j === commands.length -1) {
              break;
            }
            console.warn("Unknown drawing command encountered: " +
                         commands[j]);
        }
      }

    // TODO: support mophing shapes

    //} else {
    //  for (var j = 0, k = 0; j < commands.length; j++) {
    //    switch (commands[j]) {
    //      case SHAPE_MOVE_TO:
    //        ctx.moveTo(morph(data[k]/20, morphData[k++]/20, ratio),
    //                   morph(data[k]/20, morphData[k++]/20, ratio));
    //        break;
    //      case SHAPE_LINE_TO:
    //        ctx.lineTo(morph(data[k]/20, morphData[k++]/20, ratio),
    //                   morph(data[k]/20, morphData[k++]/20, ratio));
    //        break;
    //      case SHAPE_CURVE_TO:
    //        ctx.quadraticCurveTo(morph(data[k]/20, morphData[k++]/20, ratio),
    //                             morph(data[k]/20, morphData[k++]/20, ratio),
    //                             morph(data[k]/20, morphData[k++]/20, ratio),
    //                             morph(data[k]/20, morphData[k++]/20, ratio));
    //        break;
    //      default:
    //        console.warn("Drawing command not supported for morph " +
    //                     "shapes: " + commands[j]);
    //    }
    //  }
    //}

    // TODO: enable in-path line-style changes
    if (formOpen) {
      ctx.lineTo(formOpenX, formOpenY);
    }
    if (fillStyle) {
      ctx.save();
      if (isNaN(fillStyle)) {
        ctx.fillStyle = fillStyle;
        ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = fillStyle.smooth;
        var m = fillStyle.transform;
        ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
      } else {
        ctx.fillStyle = rgbaUintToStr(fillStyle);
      }
      ctx.fill();
      ctx.restore();
    }
    // TODO: All widths except for `undefined` and `NaN` draw something
    if (strokeStyle) {
      if (isNaN(strokeStyle)) {
        // TODO: support extended lines
      } else {
        ctx.strokeStyle = rgbaUintToStr(strokeStyle);
        ctx.stroke();
      }
    }
    ctx.closePath();
  }

  ctx.restore();
};

function RenderableBitmap(data, renderer, resolve) {
  var rect = this.rect = new Shumway.Geometry.Rectangle(0, 0);

  var len = data[0];
  var imgData = new Uint8Array(data.buffer, data.byteOffset + 4, len);
  var blob = new Blob([imgData]);

  var img = new Image();
  var renderable = this;
  img.onload = function () {
    rect.width = img.width;
    rect.height = img.height;
    resolve();
  };
  img.src = URL.createObjectURL(symbol.data);

  this.properties = { renderer: renderer, drawable: img };
}
RenderableBitmap.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderableBitmap.prototype.render = function render(ctx) {
  ctx.drawImage(this.drawable, 0, 0);
};

function RenderableText(data, renderer, resolve) {
  var xMin = (data[0] / 20) | 0;
  var xMax = (data[1] / 20) | 0;
  var yMin = (data[2] / 20) | 0;
  var yMax = (data[3] / 20) | 0;
  this.rect = new Shumway.Geometry.Rectangle(xMin, yMin, xMax - xMin, yMax - yMin);

  var n = data[4];
  var code = String.fromCharCode.apply(null, data.subarray(5, 5 + n));
  this.render = new Function('c', code);

  this.properties = { renderer: renderer };

  resolve();
}
RenderableText.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderableText.prototype.render = function render(ctx) {
  //this.ensureDimensions();
  //var bounds = this._bbox;
  //var width = bounds.xMax / 20;
  //var height = bounds.yMax / 20;
  //if (width <= 0 || height <= 0) {
  //  return;
  //}

  //ctx.save();
  //ctx.beginPath();
  //ctx.rect(0, 0, width + 1, height + 1);
  //ctx.clip();
  //if (this._background) {
  //  colorTransform.setFillStyle(ctx, this._backgroundColorStr);
  //  ctx.fill();
  //}
  //if (this._border) {
  //  colorTransform.setStrokeStyle(ctx, this._borderColorStr);
  //  ctx.lineCap = "square";
  //  ctx.lineWidth = 1;
  //  ctx.strokeRect(0.5, 0.5, width|0, height|0);
  //}
  //ctx.closePath();

  //if (this._content.lines.length === 0) {
  //  ctx.restore();
  //  return;
  //}

  //ctx.translate(2, 2);
  //ctx.save();
  //colorTransform.setAlpha(ctx);
  //var runs = this._content._textRuns;
  //var offsetY = this._content.lines[this._scrollV - 1].y;
  //for (var i = 0; i < runs.length; i++) {
  //  var run = runs[i];
  //  if (run.type === 'f') {
  //    ctx.restore();
  //    ctx.font = run.format.str;
  //    // TODO: only apply color and alpha if it actually changed
  //    colorTransform.setFillStyle(ctx, run.format.color);
  //    ctx.save();
  //    colorTransform.setAlpha(ctx);
  //  } else {
  //    assert(run.type === 't', 'Invalid run type: ' + run.type);
  //    if (run.y < offsetY) {
  //      continue;
  //    }
  //    ctx.fillText(run.text, run.x - this._drawingOffsetH, run.y - offsetY);
  //  }
  //}
  //ctx.restore();
  //ctx.restore();
};

function TextFieldContent(initialFormat) {
  this.defaultTextFormat = initialFormat;
  this.textWidth = 0;
  this.textHeight = 0;
  this.condenseWhite = false;
  this.wordWrap = false;
  this.multiline = false;
  this.textColor = null;

  this._text = '';
  this._htmlText = '';
  this._createTrunk();
  this._textRuns = null;
  this._htmlParser = document.createElement('p');

  // Used for measuring text runs, not for rendering
  this._measureCtx = document.createElement('canvas').getContext('2d');
}

TextFieldContent.knownNodeTypes = {
  'BR': true,
  'LI': true,
  'P': true,
  'B': true,
  'I': true,
  'FONT': true,
  'TEXTFORMAT': true,
  'U': true,
  'A': true,
  'IMG': true,
  'SPAN': true
};
TextFieldContent.WRAP_OPPORTUNITIES = {
  " ": true,
  ".": true,
  "-": true,
  "\t": true
};
TextFieldContent.TextLine = function(y) {
  this.x = 0;
  this.width = 0;
  this.y = y;
  this.height = 0;
  this.leading = 0;
  this.runs = [];
  this.largestFormat = null;
};

TextFieldContent.prototype = {
  get text() {
    return this._text;
  },
  set text(val) {
    val = val + '';
    if (this._text === val) {
      return;
    }
    var lines = [];
    var lineOffset = 0;
    for (var index = 0; index < val.length;) {
      var char = val[index];
      if (char === '\r' || char === '\n') {
        lines.push(val.substring(lineOffset, index));
        lineOffset = index;
        if (char === '\r' && val[index + 1] === '\n') {
          index++;
        }
      }
      index++;
    }
    lines.push(val.substring(lineOffset, index));
    this._createTrunk();
    this._text = val;
    this._htmlText = val;
    this._tree.children[0].children[0] = {
      type: 'plain-text', lines: lines
    };
  },
  get htmlText() {
    return this._htmlText;
  },
  set htmlText(val) {
    if (this._htmlText === val) {
      return;
    }
    // Flash resets the bold and italic flags when an html value is set.
    this.defaultTextFormat.bold = false;
    this.defaultTextFormat.italic = false;
    this._parseHtml(val);
  },
  calculateMetrics: function(bounds, embedFonts) {
    var initialFormat = this.defaultTextFormat;
    FontDefinition.resolveFont(initialFormat, embedFonts);
    this.lines = [];
    this._textRuns = [{type: 'f', format: initialFormat}];
    var width = Math.max(bounds.xMax / 20 - 4, 1);
    var height = Math.max(bounds.yMax / 20 - 4, 1);
    var state = {ctx: this._measureCtx, w: width, h: height, maxLineWidth: 0,
      formats: [initialFormat], currentFormat: initialFormat,
      line: new TextFieldContent.TextLine(0),
      wordWrap: this.wordWrap, combinedAlign: null,
      textColor: this.textColor, embedFonts: embedFonts};
    this._collectRuns(state, this._tree);
    this._finishLine(state, false);
    this.textWidth = state.maxLineWidth|0;
    this.textHeight = state.line.y|0;
    return state.combinedAlign;
  },
  /*
   * Parsing, in this context, actually means using the browser's html parser
   * and then removing any tags and attributes that mustn't be supported.
   *
   * After that, two things are generated: a plain-text version of the content,
   * and a tree of objects with types and attributes, representing all nodes.
   */
  _parseHtml: function(val) {
    this._htmlParser.innerHTML = val;
    var rootElement = this._htmlParser.childNodes.length !== 1 ?
                      this._htmlParser :
                      this._htmlParser.childNodes[0];
    // TODO: create the htmlText by serializing the converted tree
    this._text = '';
    this._htmlText = val;
    this._createTrunk();

    if (rootElement.nodeType === 3) {
      this._convertNode(rootElement, this._tree.children[0].children);
    }

    var initialNodeList = [rootElement];
    // If the outermost node is a <P>, merge its attributes and discard it
    var attributes;
    var format;
    var key;
    if (initialNodeList.length == 1 &&
        rootElement.localName.toUpperCase() == 'P')
    {
      attributes = this._extractAttributes(rootElement);
      format = this._tree.format;
      for (key in attributes) {
        format[key] = attributes[key];
      }
      initialNodeList = rootElement.childNodes;
      rootElement = rootElement.childNodes[0];
    }
    // If the now-outermost node is a <FONT>, do the same with it
    if (initialNodeList.length == 1 &&
        rootElement.localName.toUpperCase() == 'FONT')
    {
      attributes = this._extractAttributes(rootElement);
      format = this._tree.children[0].format;
      for (key in attributes) {
        format[key] = attributes[key];
      }
      initialNodeList = rootElement.childNodes;
    }
    this._convertNodeList(initialNodeList, this._tree.children[0].children);
  },
  _createTrunk: function() {
    var initialFormat = this.defaultTextFormat;
    // The outermost node is always a <P>, with an ALIGN attribute
    this._tree = {
      type: 'SPAN',
      format: {ALIGN: initialFormat.align},
      children: []
    };
    // The first child is then a <FONT>, with FACE, LETTERSPACING and KERNING
    var fontAttributes = {
      FACE: initialFormat.face,
      LETTERSPACING: initialFormat.letterSpacing,
      KERNING: initialFormat.kerning,
      LEADING: initialFormat.leading,
      COLOR: initialFormat.color
    };
    this._tree.children[0] = {
      type: 'FONT',
      format: fontAttributes,
      children: []
    };
  },
  _convertNode: function(input, destinationList) {
    // Ignore all comments, processing instructions and namespaced nodes.
    if (!(input.nodeType === 1 || input.nodeType === 3) || input.prefix) {
      return;
    }

    var node;

    if (input.nodeType === 3) {
      var text = input.textContent;
      node = { type: 'text', text: text, format: null, children: null };
      this._text += text;
      destinationList.push(node);
      return;
    }
    // For unknown node types, skip the node itself, but convert its children
    // and add them to the parent's child list.
    // If |multiline| is false, skip line-breaking nodes, too.
    var nodeType = input.localName.toUpperCase();
    if (!TextFieldContent.knownNodeTypes[nodeType] ||
        this.multiline === false && (nodeType === 'P' || nodeType === 'BR'))
    {
      // <sbr /> is a tag the Flash TextField supports for unknown reasons. It
      // apparently acts just like <br>. Unfortunately, the html parser doesn't
      // treat it as a self-closing tag, so the siblings following it are nested
      // after parsing. Hence, we un-nest them manually, and convert the tag to
      // <br>.
      if (nodeType === 'SBR') {
        destinationList.push({type: 'BR', text: null,
                              format: null, children: null});
      }
      this._convertNodeList(input.childNodes, destinationList);
      return;
    }
    node = {
      type: nodeType,
      text: null,
      format: this._extractAttributes(input),
      children: []
    };

    this._convertNodeList(input.childNodes, node.children);
    destinationList.push(node);
  },
  _convertNodeList: function(from, to) {
    var childCount = from.length;
    for (var i = 0; i < childCount; i++) {
      this._convertNode(from[i], to);
    }
  },
  /**
   * Creates an object containing all attributes with their localName as keys.
   * Ignores all namespaced attributes, as we don't need them for the
   * TextField's purposes.
   * TODO: Whitelist known attributes and throw out the rest.
   */
  _extractAttributes: function(node) {
    var attributesList = node.attributes;
    var attributesMap = {};
    for (var i = 0; i < attributesList.length; i++) {
      var attr = attributesList[i];
      if (attr.prefix) {
        continue;
      }
      attributesMap[attr.localName.toUpperCase()] = attr.value;
    }
    return attributesMap;
  },
  _collectRuns: function(state, node) {
    // for formatNodes, the format is popped after child processing
    var formatNode = false;
    // for blockNodes, the current line is finished after child processing
    var blockNode = false;
    switch (node.type) {
      case 'plain-text':
        var lines = node.lines;
        for (var i = 0; i < lines.length; i++) {
          this._addRunsForText(state, lines[i]);
          // The last line is finished by the enclosing block
          if (i < lines.length - 1) {
            this._finishLine(state, true);
          }
        }
        return;
      case 'text':
        this._addRunsForText(state, node.text);
        return;
      case 'BR':
        this._finishLine(state, true);
        return;
      case 'LI': /* TODO: draw bullet points. */ /* falls through */
      case 'P':
        this._finishLine(state, false);
        this._pushFormat(state, node);
        blockNode = true;
        break;

      case 'B': /* falls through */
      case 'I': /* falls through */
      case 'FONT': /* falls through */
      case 'TEXTFORMAT':
        this._pushFormat(state, node);
        formatNode = true;
        break;

      case 'U': /* TODO: implement <u>-support. */ /* falls through */
      case 'A': /* TODO: implement <a>-support. */ /* falls through */
      case 'IMG': /* TODO: implement <img>-support. */ /* falls through */
      case 'SPAN': /* TODO: implement what puny support for CSS Flash has. */
      /* falls through */
      default:
      // For all unknown nodes, we just emit their children.
    }
    for (var i = 0; i < node.children.length; i++) {
      var child = node.children[i];
      this._collectRuns(state, child);
    }
    if (formatNode) {
      this._popFormat(state);
    }
    if (blockNode) {
      this._finishLine(state, true);
    }
  },
  _addRunsForText: function(state, text) {
    if (!text) {
      return;
    }
    if (!state.wordWrap) {
      this._addTextRun(state, text, state.ctx.measureText(text).width);
      return;
    }
    while (text.length) {
      var width = state.ctx.measureText(text).width;
      var availableWidth = state.w - state.line.width;
      if (availableWidth <= 0) {
        this._finishLine(state, false);
        availableWidth = state.w - state.line.width;
      }
      assert(availableWidth > 0);
      if (width <= availableWidth) {
        this._addTextRun(state, text, width);
        break;
      } else {
        // Find offset close to where we can wrap by treating all chars as
        // same-width.
        var offset = (text.length / width * availableWidth)|0;
        // Expand to offset we know to be to the right of wrapping position
        while (state.ctx.measureText(text.substr(0, offset)).width <
               availableWidth && offset < text.length)
        {
          offset++;
        }
        // Find last wrapping-allowing character before that
        var wrapOffset = offset;
        while (wrapOffset > -1) {
          if (TextFieldContent.WRAP_OPPORTUNITIES[text[wrapOffset]]) {
            wrapOffset++;
            break;
          }
          wrapOffset--;
        }
        if (wrapOffset === -1) {
          if (state.line.width > 0) {
            this._finishLine(state, false);
            continue;
          }
          // No wrapping opportunity found, wrap mid-word
          while (state.ctx.measureText(text.substr(0, offset)).width >
                 availableWidth)
          {
            offset--;
          }
          if (offset === 0) {
            offset = 1;
          }
          wrapOffset = offset;
        }
        var runText = text.substr(0, wrapOffset);
        width = state.ctx.measureText(runText).width;
        this._addTextRun(state, runText, width);

        if (state.wordWrap) {
          this._finishLine(state, false);
        }

        text = text.substr(wrapOffset);
      }
    }
  },
  _addTextRun: function(state, text, width) {
    if (text.length === 0) {
      return;
    }
    // `y` is set by `_finishLine`
    var line = state.line;
    var format = state.currentFormat;
    var size = format.size;
    var run = {type: 't', text: text, x: line.width};
    this._textRuns.push(run);
    state.line.runs.push(run);
    line.width += width|0;
    // TODO: Implement Flash's absurd behavior for leading
    // Specifically, leading is only used if it is set by a <div> tag, or by
    // a <textformat> tag that is the first node in a new line. Whether that
    // line is caused by a <div> tag, <br> or \n is immaterial. I didn't check
    // what happens with word wrapping or setTextFormat, but you should.
    if (line.leading === 0 && format.leading > line.leading) {
      line.leading = format.leading;
    }
    if (!line.largestFormat || size > line.largestFormat.size) {
      line.largestFormat = format;
    }
  },
  // When ending a block or processing a <br> tag, we always want to insert
  // vertical space, even if the current line is empty. `forceNewline` does that
  // by advancing the next line's vertical position.
  _finishLine: function(state, forceNewline) {
    var line = state.line;
    if (line.runs.length === 0) {
      if (forceNewline) {
        var format = state.currentFormat;
        state.line.y += format.font._metrics.height * format.size +
                        format.leading|0;
      }
      return;
    }
    var runs = line.runs;
    var format = line.largestFormat;
    var baselinePos = line.y + format.font._metrics.ascent * format.size;
    for (var i = runs.length; i--;) {
      runs[i].y = baselinePos;
    }
    var align = (state.currentFormat.align || '').toLowerCase();
    if (state.combinedAlign === null) {
      state.combinedAlign = align;
    } else if (state.combinedAlign !== align) {
      state.combinedAlign = 'mixed';
    }
    // TODO: maybe support justified text somehow
    if (align === 'center' || align === 'right') {
      var offset = Math.max(state.w - line.width, 0);
      if (align === 'center') {
        offset >>= 1;
      }
      for (i = runs.length; i--;) {
        runs[i].x += offset;
      }
    }
    line.height = format.font._metrics.height * format.size + line.leading|0;
    state.maxLineWidth = Math.max(state.maxLineWidth, line.width);
    this.lines.push(line);
    state.line = new TextFieldContent.TextLine(line.y + line.height);
  },
  _pushFormat: function(state, node) {
    var attributes = node.format;
    var format = Object.create(state.formats[state.formats.length - 1]);
    var fontChanged = false;
    switch (node.type) {
      case 'P':
        if (attributes.ALIGN === format.align) {
          return;
        }
        format.align = attributes.ALIGN;
        break;
      case 'B':
        format.bold = true;
        fontChanged = true;
        break;
      case 'I':
        format.italic = true;
        fontChanged = true;
        break;
      case 'FONT':
        if (attributes.COLOR !== undefined) {
          format.color = attributes.COLOR;
        }
        if (attributes.FACE !== undefined) {
          format.face = attributes.FACE;
          fontChanged = true;
        }
        if (attributes.SIZE !== undefined) {
          format.size = parseFloat(attributes.SIZE);
        }
        if (attributes.LETTERSPACING !== undefined) {
          format.letterspacing = parseFloat(attributes.LETTERSPACING);
        }
        if (attributes.KERNING !== undefined) {
          // TODO: properly parse this in extractAttributes
          format.kerning = attributes.KERNING && true;
        }
      /* falls through */
      case 'TEXTFORMAT':
        // `textFormat` has, among others, the same attributes as `font`
        if (attributes.LEADING !== undefined) {
          format.leading = parseFloat(attributes.LEADING);
        }
        if (attributes.INDENT !== undefined) {
          // TODO: figure out if indents accumulate and how they apply to text
          // already in the line
          state.line.x = attributes.INDENT;
          state.line.width += attributes.INDENT|0;
        }
        // TODO: support leftMargin, rightMargin & blockIndent
        // TODO: support tabStops
        break;
      default:
        warning('Unknown format node encountered: ' + node.type); return;
    }
    if (state.textColor !== null) {
      format.color = rgbIntAlphaToStr(state.textColor, 1);
    }
    if (fontChanged) {
      FontDefinition.resolveFont(format, state.embedFonts);
    }
    format.str = FontDefinition.makeFormatString(format);
    state.formats.push(format);
    this._textRuns.push({type: 'f', format: format});
    state.currentFormat = format;
    state.ctx.font = format.str;
  },
  _popFormat: function(state) {
    state.formats.pop();
    var format = state.currentFormat = state.formats[state.formats.length - 1];
    this._textRuns.push({type: 'f', format: format});
    state.ctx.font = state.str;
  }
};
