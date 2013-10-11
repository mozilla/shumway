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
package avm1lib {
  import avm1lib.AS2Utils;
  import flash.display.BitmapData;
  import flash.text.TextField;
  import flash.net.URLRequest;
  import flash.geom.Rectangle;
  import flash.utils.Dictionary;
  import flash.geom.Point;
  import flash.display.Graphics;
  import flash.display.MovieClip;
  import flash.display.Loader;


  [native(cls="AS2MovieClip")]
  public dynamic class AS2MovieClip extends Object {
    private native function init(nativeMovieClip: flash.display.MovieClip);

    function AS2MovieClip(nativeMovieClip: flash.display.MovieClip)
    {
      init(nativeMovieClip);
    }

    public native function get $nativeObject(): flash.display.MovieClip;

    public function $lookupChild(id: String)
    {
      if (id == '.') {
        return this;
      } else if (id == '..') {
        return AS2Utils.getAS2Object(this.$nativeObject.parent);
      } else {
        return AS2Utils.getAS2Object(this.$nativeObject.getChildByName(id));
      }
    }
    public function get $targetPath()
    {
      var target = this._target;
      var prefix = '_level0'; // TODO use needed level number here
      return target != '/' ? prefix + target.replace(/\//g, '.') : prefix;
    }
    public function get _alpha() { return this.$nativeObject.alpha; }
    public function set _alpha(value) { this.$nativeObject.alpha = value; }
    public function attachAudio(id)
    {
      throw 'Not implemented: attachAudio';
    }
    public function attachBitmap(bmp, depth, pixelSnapping, smoothing)
    {
      throw 'Not implemented: attachBitmap';
    }
    private native function _constructSymbol(symbolId, name);
    public function attachMovie(symbolId, name, depth, initObject)
    {
      var mc = _constructSymbol(symbolId, name);
      _insertChildAtDepth(mc, depth);

      var as2mc = AS2Utils.getAS2Object(mc);
      for (var i in initObject) {
        as2mc[i] = initObject[i];
      }

      return as2mc;
    }
    public function beginFill(color, alpha)
    {
      this.$nativeObject.graphics.beginFill(color, alpha);
    }
    public function beginBitmapFill(bmp, matrix, repeat, smoothing)
    {
      if (!(bmp is BitmapData)) {
        return;
      }

      this.$nativeObject.graphics.beginBitmapFill(bmp, matrix, repeat, smoothing);
    }
    public function beginGradientFill(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio)
    {
      this.$nativeObject.graphics.beginGradientFill(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio);
    }
    public function get blendMode() { return this.$nativeObject.blendMode; }
    public function set blendMode(value) { this.$nativeObject.blendMode = value; }
    public function get cacheAsBitmap() { return this.$nativeObject.cacheAsBitmap; }
    public function set cacheAsBitmap(value) { this.$nativeObject.cacheAsBitmap = value; }
    public native function _callFrame(frame);
    public function clear()
    {
      this.$nativeObject.graphics.clear();
    }
    private native function _insertChildAtDepth(mc, depth);
    public function createEmptyMovieClip(name, depth)
    {
      var mc: flash.display.MovieClip = new flash.display.MovieClip();
      mc.name = name;
      _insertChildAtDepth(mc, +depth);
      return AS2Utils.getAS2Object(mc);
    }
    public function createTextField(name, depth, x, y, width, height)
    {
      var text: TextField = new TextField();
      text.name = name;
      text.x = +x; text.y = +y; text.width = +width; text.height = +height;
      _insertChildAtDepth(text, +depth);
      return AS2Utils.getAS2Object(text);
    }
    public function get _currentframe() { return this.$nativeObject.currentFrame; }
    public function curveTo(controlX, controlY, anchorX, anchorY)
    {
      this.$nativeObject.graphics.curveTo(controlX, controlY, anchorX, anchorY);
    }
    public function get _droptarget() { return this.$nativeObject.dropTarget; }
    private native function _duplicate(name, depth, initObject);
    public function duplicateMovieClip(name, depth, initObject)
    {
      var newMovieClip = AS2Utils.getAS2Object(_duplicate(name, +depth, initObject));
      return newMovieClip;
    }
    public function get enabled() { return this.$nativeObject.enabled; }
    public function set enabled(value) { this.$nativeObject.enabled = value; }
    public function endFill() {
      this.$nativeObject.graphics.endFill();
    }
    public function get filters() { throw 'Not implemented: get$filters';  }
    public function set filters(value) { throw 'Not implemented: set$filters';  }
    public function get focusEnabled() { throw 'Not implemented: get$focusEnabled';  }
    public function set focusEnabled(value) { throw 'Not implemented: set$focusEnabled';  }
    public function get _focusrect() { throw 'Not implemented: get$_focusrect';  }
    public function set _focusrect(value) { throw 'Not implemented: set$_focusrect';  }
    public function get forceSmoothing() { throw 'Not implemented: get$forceSmoothing';  }
    public function set forceSmoothing(value) { throw 'Not implemented: set$forceSmoothing';  }
    public function get _framesloaded() { return this.$nativeObject.framesLoaded; }
    public function getBounds(bounds)
    {
      var obj = bounds.$nativeObject;
      if (!obj) {
        throw 'Unsupported bounds type';
      }
      return this.$nativeObject.getBounds(obj);
    }
    public function getBytesLoaded()
    {
      var loaderInfo = this.$nativeObject.loaderInfo;
      return loaderInfo.bytesLoaded;
    }
    public function getBytesTotal()
    {
      var loaderInfo = this.$nativeObject.loaderInfo;
      return loaderInfo.bytesTotal;
    }
    public function getDepth()
    {
      return this.$nativeObject._depth;
    }
    public function getInstanceAtDepth(depth)
    {
      var nativeObject = this.$nativeObject;
      for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
        var child = nativeObject.getChildAt(i);
        if (child._depth === depth) {
          return child;
        }
      }
      return null;
    }
    public function getNextHighestDepth()
    {
      var nativeObject = this.$nativeObject;
      var maxDepth = 0;
      for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
        var child = nativeObject.getChildAt(i);
        if (child._depth > maxDepth) {
          maxDepth = child._depth;
        }
      }
      return maxDepth + 1;
    }
    public function getRect(bounds)
    {
      throw 'Not implemented: getRect';
    }
    public function getSWFVersion()
    {
      var loaderInfo = this.$nativeObject.loaderInfo;
      return loaderInfo.swfVersion;
    }
    public function getTextSnapshot()
    {
      throw 'Not implemented: getTextSnapshot';
    }
    public function getURL(url, window, method)
    {
      var request = new URLRequest(url);
      if (method) {
        request.method = method;
      }
      flash.net.navigateToURL(request, window);
    }
    public function globalToLocal(pt)
    {
      var tmp : Point = this.$nativeObject.globalToLocal(new Point(pt.x, pt.y));
      pt.x = tmp.x;
      pt.y = tmp.y;
    }
    public function gotoAndPlay(frame) { return this.$nativeObject.gotoAndPlay(frame); }
    public function gotoAndStop(frame) { return this.$nativeObject.gotoAndStop(frame); }
    public function get _height() { return this.$nativeObject.height; }
    public function set _height(value) { this.$nativeObject.height = value; }
    public function get _highquality() { return 1; }
    public function set _highquality(value) { }
    public function get hitArea() { throw 'Not implemented: get$hitArea';  }
    public function set hitArea(value) { throw 'Not implemented: set$hitArea';  }
    public function hitTest(x, y, shapeFlag)
    {
      if (x is AS2MovieClip) {
        return this.$nativeObject.hitTestObject(x.$nativeObject);
      } else {
        return this.$nativeObject.hitTestPoint(x, y, shapeFlag);
      }
    }
    public function lineGradientStyle(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio)
    {
      this.$nativeObject.graphics.lineGradientStyle(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio);
    }
    public function lineStyle(thickness, rgb, alpha, pixelHinting, noScale, capsStyle, jointStyle, miterLimit)
    {
      this.$nativeObject.graphics.lineStyle(thickness, rgb, alpha, pixelHinting, noScale, capsStyle, jointStyle, miterLimit);
    }
    public function lineTo(x, y)
    {
      this.$nativeObject.graphics.lineTo(x, y);
    }
    public function loadMovie(url, method)
    {
      var loader: Loader = new Loader();
      this.$nativeObject.addChild(loader);
      var request = new flash.net.URLRequest(url);
      if (method) {
        request.method = method;
      }
      loader.load(request);
    }
    public function loadVariables(url, method)
    {
      throw 'Not implemented: loadVariables';
    }
    public function localToGlobal(pt)
    {
      var tmp : Point = this.$nativeObject.localToGlobal(new Point(pt.x, pt.y));
      pt.x = tmp.x;
      pt.y = tmp.y;
    }
    public function get _lockroot() { throw 'Not implemented: get$_lockroot';  }
    public function set _lockroot(value) { throw 'Not implemented: set$_lockroot';  }
    public function get menu() { return this.$nativeObject.contextMenu;  }
    public function set menu(value) { this.$nativeObject.contextMenu = value;  }
    public function moveTo(x, y) {
      this.$nativeObject.graphics.moveTo(x, y);
    }
    public function get _name() { return this.$nativeObject.name;  }
    public function set _name(value) { this.$nativeObject.name = value;  }
    public function nextFrame() { this.$nativeObject.nextFrame();  }
    public function get opaqueBackground() { return this.$nativeObject.opaqueBackground;  }
    public function set opaqueBackground(value) { this.$nativeObject.opaqueBackground = value;  }

    public function get _parent() { return AS2Utils.getAS2Object(this.$nativeObject.parent);  }
    public function set _parent(value) { throw 'Not implemented: set$_parent';  }

    public function play() { this.$nativeObject.play();  }
    public function prevFrame() { this.$nativeObject.prevFrame();  }
    public function get _quality() { return 'HIGH';  }
    public function set _quality(value) { }
    public function removeMovieClip() {
      var parent = this._parent.$nativeObject;
      parent.removeChild(this.$nativeObject);
    }
    public function get _rotation() { return this.$nativeObject.rotation;  }
    public function set _rotation(value) { this.$nativeObject.rotation = value;  }
    public function get scale9Grid() { throw 'Not implemented: get$scale9Grid';  }
    public function set scale9Grid(value) { throw 'Not implemented: set$scale9Grid';  }
    public function get scrollRect() { throw 'Not implemented: get$scrollRect';  }
    public function set scrollRect(value) { throw 'Not implemented: set$scrollRect';  }
    public function setMask(mc: Object)
    {
      var nativeObject = this.$nativeObject;
      var mask = AS2Utils.resolveTarget(mc).$nativeObject;
      nativeObject.mask = mask;
    }
    public function get _soundbuftime() { throw 'Not implemented: get$_soundbuftime';  }
    public function set _soundbuftime(value) { throw 'Not implemented: set$_soundbuftime';  }
    public function startDrag(lock, left, top, right, bottom)
    {
      this.$nativeObject.startDrag(lock, arguments.length < 3 ? null :
        new Rectangle(left, top, right - left, bottom - top));
    }
    public function stop() { return this.$nativeObject.stop(); }
    public function stopDrag() { return this.$nativeObject.stopDrag(); }
    public function swapDepths(target: Object)
    {
      var child1 = this.$nativeObject;
      var child2 = typeof target === 'number' ?
        AS2Utils.resolveLevel(target).$nativeObject :
        AS2Utils.resolveTarget(target).$nativeObject;
      if (child1.parent !== child2.parent) {
        return; // must be the same parent
      }
      child1.parent.swapChildren(child1, child2);
    }
    public function get tabChildren() { return this.$nativeObject.tabChildren;  }
    public function set tabChildren(value) { this.$nativeObject.tabChildren = value;  }
    public function get tabEnabled() { return this.$nativeObject.tabEnabled;  }
    public function set tabEnabled(value) { this.$nativeObject.tabEnabled = value;  }
    public function get tabIndex() { return this.$nativeObject.tabIndex;  }
    public function set tabIndex(value) { this.$nativeObject.tabIndex = value;  }

    public function get _target() { return AS2Utils.getTarget(this); }

    public function get _totalframes() { return this.$nativeObject.totalFrames;  }
    public function get trackAsMenu() { throw 'Not implemented: get$trackAsMenu';  }
    public function set trackAsMenu(value) { throw 'Not implemented: set$trackAsMenu';  }
    public function get transform() { throw 'Not implemented: get$transform';  }
    public function set transform(value) { throw 'Not implemented: set$transform';  }
    public function toString() { return this.$nativeObject.toString(); }
    public function unloadMovie()
    {
      var nativeObject = this.$nativeObject;
      // TODO remove movie clip content
      var loader = nativeObject.loaderInfo.loader;
      if (loader.parent) {
        loader.parent.removeChild(loader);
      }
      nativeObject.stop();
    }
    public function get _url() { return this.$nativeObject.loaderInfo.url; }
    public function get useHandCursor() { return this.$nativeObject.useHandCursor;  }
    public function set useHandCursor(value) { this.$nativeObject.useHandCursor = value;  }
    public function get _visible() { return this.$nativeObject.visible;  }
    public function set _visible(value) { this.$nativeObject.visible = +value !== 0;  }
    public function get _width() { return this.$nativeObject.width;  }
    public function set _width(value) { this.$nativeObject.width = value;  }
    public function get _x() { return this.$nativeObject.x;  }
    public function set _x(value) { this.$nativeObject.x = value;  }
    public function get _xmouse() { return this.$nativeObject.mouseX;  }
    public function get _xscale() { return this.$nativeObject.scaleX * 100;  }
    public function set _xscale(value) { this.$nativeObject.scaleX = value / 100;  }
    public function get _y() { return this.$nativeObject.y;  }
    public function set _y(value) { this.$nativeObject.y = value;  }
    public function get _ymouse() { return this.$nativeObject.mouseY;  }
    public function get _yscale() { return this.$nativeObject.scaleY * 100;  }
    public function set _yscale(value) { this.$nativeObject.scaleY = value / 100;  }

    {
      AS2Utils.addEventHandlerProxy(prototype, 'onData', 'data');
      AS2Utils.addEventHandlerProxy(prototype, 'onDragOut', 'dragOut');
      AS2Utils.addEventHandlerProxy(prototype, 'onDragOver', 'dragOver');
      AS2Utils.addEventHandlerProxy(prototype, 'onEnterFrame', 'enterFrame');
      AS2Utils.addEventHandlerProxy(prototype, 'onKeyDown', 'keyDown');
      AS2Utils.addEventHandlerProxy(prototype, 'onKeyUp', 'keyUp');
      AS2Utils.addEventHandlerProxy(prototype, 'onKillFocus', 'focusOut', function(e) { return [e.relatedObject]; });
      AS2Utils.addEventHandlerProxy(prototype, 'onLoad', 'load');
      AS2Utils.addEventHandlerProxy(prototype, 'onMouseDown', 'mouseDown');
      AS2Utils.addEventHandlerProxy(prototype, 'onMouseUp', 'mouseUp');
      AS2Utils.addEventHandlerProxy(prototype, 'onPress', 'mouseDown');
      AS2Utils.addEventHandlerProxy(prototype, 'onRelease', 'mouseUp');
      AS2Utils.addEventHandlerProxy(prototype, 'onReleaseOutside', 'releaseOutside');
      AS2Utils.addEventHandlerProxy(prototype, 'onRollOut', 'mouseOut');
      AS2Utils.addEventHandlerProxy(prototype, 'onRollOver', 'mouseOver');
      AS2Utils.addEventHandlerProxy(prototype, 'onSetFocus', 'focusIn', function(e) { return [e.relatedObject]; });
      AS2Utils.addEventHandlerProxy(prototype, 'onUnload', 'unload');
    }
  }
}
