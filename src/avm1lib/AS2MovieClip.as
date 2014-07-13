/**
 * Copyright 2014 Mozilla Foundation
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
import flash.display.Bitmap;
import flash.display.BitmapData;
import flash.display.Loader;
import flash.display.MovieClip;
import flash.events.Event;
import flash.geom.Point;
import flash.geom.Rectangle;
import flash.net.URLRequest;
import flash.net.navigateToURL;
import flash.text.TextField;

[native(cls="AS2MovieClip")]
public dynamic class AS2MovieClip extends Object {
  private native function _init(nativeMovieClip:MovieClip);

  function AS2MovieClip(nativeMovieClip:MovieClip) {
    _init(nativeMovieClip);
  }

  public native function get _as3Object():MovieClip;

  public function __lookupChild(id:String) {
    if (id == '.') {
      return this;
    } else if (id == '..') {
      return AS2Utils.getAS2Object(this._as3Object.parent);
    } else {
      return AS2Utils.getAS2Object(this._as3Object.getChildByName(id));
    }
  }
  public function get __targetPath() {
    var target = this._target;
    var prefix = '_level0'; // TODO use needed level number here
    return target != '/' ? prefix + target.replace(/\//g, '.') : prefix;
  }
  public function get _alpha() {
    return this._as3Object.alpha;
  }
  public function set _alpha(value) {
    this._as3Object.alpha = value;
  }
  public function attachAudio(id) {
    throw 'Not implemented: attachAudio';
  }
  public native  function attachBitmap(bmp: AS2BitmapData, depth: int,
                                       pixelSnapping: String = 'auto',
                                       smoothing: Boolean = false): void;

  private native function _constructMovieClipSymbol(symbolId, name);
  public function attachMovie(symbolId, name, depth, initObject) {
    var mc = _constructMovieClipSymbol(symbolId, name);
    var as2mc = _insertChildAtDepth(mc, depth);

    for (var i in initObject) {
      as2mc[i] = initObject[i];
    }

    return as2mc;
  }
  public function beginFill(color, alpha) {
    this._as3Object.graphics.beginFill(color, alpha);
  }
  public function beginBitmapFill(bmp, matrix, repeat, smoothing) {
    if (!(bmp is BitmapData)) {
      return;
    }

    this._as3Object.graphics.beginBitmapFill(bmp, matrix, repeat, smoothing);
  }
  public function beginGradientFill(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
    this._as3Object.graphics.beginGradientFill(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio);
  }
  public function get blendMode() {
    return this._as3Object.blendMode;
  }
  public function set blendMode(value) {
    this._as3Object.blendMode = value;
  }
  public function get cacheAsBitmap() {
    return this._as3Object.cacheAsBitmap;
  }
  public function set cacheAsBitmap(value) {
    this._as3Object.cacheAsBitmap = value;
  }
  public native function _callFrame(frame);
  public function clear() {
    this._as3Object.graphics.clear();
  }
  private native function _insertChildAtDepth(mc, depth);
  public function createEmptyMovieClip(name, depth) {
    var mc:MovieClip = new MovieClip();
    mc.name = name;
    return _insertChildAtDepth(mc, depth);
  }
  public function createTextField(name, depth, x, y, width, height) {
    var text:TextField = new TextField();
    text.name = name;
    text.x = x;
    text.y = y;
    text.width = width;
    text.height = height;
    return _insertChildAtDepth(text, depth);
  }
  public function get _currentframe() {
    return this._as3Object.currentFrame;
  }
  public function curveTo(controlX, controlY, anchorX, anchorY) {
    this._as3Object.graphics.curveTo(controlX, controlY, anchorX, anchorY);
  }
  public function get _droptarget() {
    return this._as3Object.dropTarget;
  }
  private native function _duplicate(name, depth, initObject);
  public function duplicateMovieClip(name, depth, initObject) {
    var newMovieClip = AS2Utils.getAS2Object(_duplicate(name, +depth, initObject));
    return newMovieClip;
  }
  public function get enabled() {
    return this._as3Object.enabled;
  }
  public function set enabled(value) {
    this._as3Object.enabled = value;
  }
  public function endFill() {
    this._as3Object.graphics.endFill();
  }
  public function get filters() {
    throw 'Not implemented: get$filters';
  }
  public function set filters(value) {
    throw 'Not implemented: set$filters';
  }
  public function get focusEnabled() {
    throw 'Not implemented: get$focusEnabled';
  }
  public function set focusEnabled(value) {
    throw 'Not implemented: set$focusEnabled';
  }
  public function get _focusrect() {
    throw 'Not implemented: get$_focusrect';
  }
  public function set _focusrect(value) {
    throw 'Not implemented: set$_focusrect';
  }
  public function get forceSmoothing() {
    throw 'Not implemented: get$forceSmoothing';
  }
  public function set forceSmoothing(value) {
    throw 'Not implemented: set$forceSmoothing';
  }
  public function get _framesloaded() {
    return this._as3Object.framesLoaded;
  }
  public function getBounds(bounds) {
    var obj = bounds._as3Object;
    if (!obj) {
      throw 'Unsupported bounds type';
    }
    return this._as3Object.getBounds(obj);
  }
  public function getBytesLoaded() {
    var loaderInfo = this._as3Object.loaderInfo;
    return loaderInfo.bytesLoaded;
  }
  public function getBytesTotal() {
    var loaderInfo = this._as3Object.loaderInfo;
    return loaderInfo.bytesTotal;
  }
  public function getDepth() {
    return this._as3Object._depth;
  }
  public native function getInstanceAtDepth(depth): AS2MovieClip;
  public native function getNextHighestDepth(): int;

  public function getRect(bounds) {
    throw 'Not implemented: getRect';
  }
  public function getSWFVersion() {
    var loaderInfo = this._as3Object.loaderInfo;
    return loaderInfo.swfVersion;
  }
  public function getTextSnapshot() {
    throw 'Not implemented: getTextSnapshot';
  }
  public function getURL(url, window, method) {
    var request = new URLRequest(url);
    if (method) {
      request.method = method;
    }
    navigateToURL(request, window);
  }
  public function globalToLocal(pt) {
    var tmp:Point = this._as3Object.globalToLocal(new Point(pt.x, pt.y));
    pt.x = tmp.x;
    pt.y = tmp.y;
  }
  public function gotoAndPlay(frame) {
    return this._as3Object.gotoAndPlay(frame);
  }
  public function gotoAndStop(frame) {
    return this._as3Object.gotoAndStop(frame);
  }
  public native function _gotoLabel(label);
  public function get _height() {
    return this._as3Object.height;
  }
  public function set _height(value) {
    this._as3Object.height = value;
  }
  public function get _highquality() {
    return 1;
  }
  public function set _highquality(value) {
  }
  public function get hitArea() {
    throw 'Not implemented: get$hitArea';
  }
  public function set hitArea(value) {
    throw 'Not implemented: set$hitArea';
  }
  public function hitTest(x, y, shapeFlag) {
    if (x is AS2MovieClip) {
      return this._as3Object.hitTestObject(x._as3Object);
    } else {
      return this._as3Object.hitTestPoint(x, y, shapeFlag);
    }
  }
  public function lineGradientStyle(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
    this._as3Object.graphics.lineGradientStyle(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio);
  }
  public function lineStyle(thickness, rgb, alpha, pixelHinting, noScale, capsStyle, jointStyle, miterLimit) {
    this._as3Object.graphics.lineStyle(thickness, rgb, alpha, pixelHinting, noScale, capsStyle, jointStyle, miterLimit);
  }
  public function lineTo(x, y) {
    this._as3Object.graphics.lineTo(x, y);
  }
  public function loadMovie(url: String, method: String) {
    var loader:Loader = new Loader();
    var request: URLRequest = new URLRequest(url);
    if (method) {
      request.method = method;
    }
    loader.load(request);
    function completeHandler(event: Event): void {
      loader.removeEventListener(Event.COMPLETE, completeHandler);
      var parent: MovieClip = this._as3Object.parent;
      var depth: int = parent.getChildIndex(this._as3Object);
      parent.removeChild(this._as3Object);
      parent.addChildAt(loader.content, depth);
    }
    loader.addEventListener(Event.COMPLETE, completeHandler);
  }
  public function loadVariables(url, method) {
    throw 'Not implemented: loadVariables';
  }
  public function localToGlobal(pt) {
    var tmp:Point = this._as3Object.localToGlobal(new Point(pt.x, pt.y));
    pt.x = tmp.x;
    pt.y = tmp.y;
  }
  public function get _lockroot() {
    throw 'Not implemented: get$_lockroot';
  }
  public function set _lockroot(value) {
    throw 'Not implemented: set$_lockroot';
  }
  // AS2 pretends that these two properties don't exist on MovieClip instances, but happily
  // resolves them nevertheless.
  // TODO: make invisible to `hasOwnProperty`.
  public function get _root(): AS2MovieClip {
    return AS2Globals.instance._root;
  }
  // TODO: make invisible to `hasOwnProperty`.
  public function get _level0(): AS2MovieClip {
    return AS2Globals.instance._level0;
  }
  public function get menu() {
    return this._as3Object.contextMenu;
  }
  public function set menu(value) {
    this._as3Object.contextMenu = value;
  }
  public function moveTo(x, y) {
    this._as3Object.graphics.moveTo(x, y);
  }
  public function get _name() {
    return this._as3Object.name;
  }
  public function set _name(value) {
    this._as3Object.name = value;
  }
  public function nextFrame() {
    this._as3Object.nextFrame();
  }
  public function get opaqueBackground() {
    return this._as3Object.opaqueBackground;
  }
  public function set opaqueBackground(value) {
    this._as3Object.opaqueBackground = value;
  }

  public function get _parent() {
    return AS2Utils.getAS2Object(this._as3Object.parent);
  }
  public function set _parent(value) {
    throw 'Not implemented: set$_parent';
  }

  public function play() {
    this._as3Object.play();
  }
  public function prevFrame() {
    this._as3Object.prevFrame();
  }
  public function get _quality() {
    return 'HIGH';
  }
  public function set _quality(value) {
  }
  public function removeMovieClip() {
    var parent = this._parent._as3Object;
    parent.removeChild(this._as3Object);
  }
  public function get _rotation() {
    return this._as3Object.rotation;
  }
  public function set _rotation(value) {
    this._as3Object.rotation = value;
  }
  public function get scale9Grid() {
    throw 'Not implemented: get$scale9Grid';
  }
  public function set scale9Grid(value) {
    throw 'Not implemented: set$scale9Grid';
  }
  public function get scrollRect() {
    throw 'Not implemented: get$scrollRect';
  }
  public function set scrollRect(value) {
    throw 'Not implemented: set$scrollRect';
  }
  public function setMask(mc:Object) {
    var nativeObject = this._as3Object;
    var mask = AS2Utils.resolveTarget(mc)._as3Object;
    nativeObject.mask = mask;
  }
  public function get _soundbuftime() {
    throw 'Not implemented: get$_soundbuftime';
  }
  public function set _soundbuftime(value) {
    throw 'Not implemented: set$_soundbuftime';
  }
  public function startDrag(lock, left, top, right, bottom) {
    this._as3Object.startDrag(lock, arguments.length < 3 ? null :
      new Rectangle(left, top, right - left, bottom - top));
  }
  public function stop() {
    return this._as3Object.stop();
  }
  public function stopDrag() {
    return this._as3Object.stopDrag();
  }
  public function swapDepths(target:Object) {
    var child1 = this._as3Object;
    var child2 = typeof target === 'number' ?
      AS2Utils.resolveLevel(Number(target))._as3Object :
      AS2Utils.resolveTarget(target)._as3Object;
    if (child1.parent !== child2.parent) {
      return; // must be the same parent
    }
    child1.parent.swapChildren(child1, child2);
  }
  public function get tabChildren() {
    return this._as3Object.tabChildren;
  }
  public function set tabChildren(value) {
    this._as3Object.tabChildren = value;
  }
  public function get tabEnabled() {
    return this._as3Object.tabEnabled;
  }
  public function set tabEnabled(value) {
    this._as3Object.tabEnabled = value;
  }
  public function get tabIndex() {
    return this._as3Object.tabIndex;
  }
  public function set tabIndex(value) {
    this._as3Object.tabIndex = value;
  }
  public function get _target() {
    var nativeObject = this._as3Object;
    if (nativeObject === nativeObject.root) {
      return '/';
    }
    var path = '';
    do {
      path = '/' + nativeObject.name + path;
      nativeObject = nativeObject.parent;
    } while (nativeObject !== nativeObject.root);
    return path;
  }
  public function get _totalframes() {
    return this._as3Object.totalFrames;
  }
  public function get trackAsMenu() {
    throw 'Not implemented: get$trackAsMenu';
  }
  public function set trackAsMenu(value) {
    throw 'Not implemented: set$trackAsMenu';
  }
  public function get transform() {
    throw 'Not implemented: get$transform';
  }
  public function set transform(value) {
    throw 'Not implemented: set$transform';
  }
  public function toString() {
    return this._as3Object.toString();
  }
  public function unloadMovie() {
    var nativeObject = this._as3Object;
    // TODO remove movie clip content
    var loader = nativeObject.loaderInfo.loader;
    if (loader.parent) {
      loader.parent.removeChild(loader);
    }
    nativeObject.stop();
  }
  public function get _url() {
    return this._as3Object.loaderInfo.url;
  }
  public function get useHandCursor() {
    return this._as3Object.useHandCursor;
  }
  public function set useHandCursor(value) {
    this._as3Object.useHandCursor = value;
  }
  public function get _visible() {
    return this._as3Object.visible;
  }
  public function set _visible(value) {
    this._as3Object.visible = +value !== 0;
  }
  public function get _width() {
    return this._as3Object.width;
  }
  public function set _width(value) {
    this._as3Object.width = value;
  }
  public function get _x() {
    return this._as3Object.x;
  }
  public function set _x(value) {
    this._as3Object.x = value;
  }
  public function get _xmouse() {
    return this._as3Object.mouseX;
  }
  public function get _xscale() {
    return this._as3Object.scaleX * 100;
  }
  public function set _xscale(value) {
    this._as3Object.scaleX = value / 100;
  }
  public function get _y() {
    return this._as3Object.y;
  }
  public function set _y(value) {
    this._as3Object.y = value;
  }
  public function get _ymouse() {
    return this._as3Object.mouseY;
  }
  public function get _yscale() {
    return this._as3Object.scaleY * 100;
  }
  public function set _yscale(value) {
    this._as3Object.scaleY = value / 100;
  }

  {
    AS2Utils.addEventHandlerProxy(prototype, 'onData', 'data');
    AS2Utils.addEventHandlerProxy(prototype, 'onDragOut', 'dragOut');
    AS2Utils.addEventHandlerProxy(prototype, 'onDragOver', 'dragOver');
    AS2Utils.addEventHandlerProxy(prototype, 'onEnterFrame', 'enterFrame');
    AS2Utils.addEventHandlerProxy(prototype, 'onKeyDown', 'keyDown');
    AS2Utils.addEventHandlerProxy(prototype, 'onKeyUp', 'keyUp');
    AS2Utils.addEventHandlerProxy(prototype, 'onKillFocus', 'focusOut', function (e) {
      return [e.relatedObject];
    });
    AS2Utils.addEventHandlerProxy(prototype, 'onLoad', 'load');
    AS2Utils.addEventHandlerProxy(prototype, 'onMouseDown', 'mouseDown');
    AS2Utils.addEventHandlerProxy(prototype, 'onMouseUp', 'mouseUp');
    AS2Utils.addEventHandlerProxy(prototype, 'onPress', 'mouseDown');
    AS2Utils.addEventHandlerProxy(prototype, 'onRelease', 'mouseUp');
    AS2Utils.addEventHandlerProxy(prototype, 'onReleaseOutside', 'releaseOutside');
    AS2Utils.addEventHandlerProxy(prototype, 'onRollOut', 'mouseOut');
    AS2Utils.addEventHandlerProxy(prototype, 'onRollOver', 'mouseOver');
    AS2Utils.addEventHandlerProxy(prototype, 'onSetFocus', 'focusIn', function (e) {
      return [e.relatedObject];
    });
    AS2Utils.addEventHandlerProxy(prototype, 'onUnload', 'unload');
  }
}
}
