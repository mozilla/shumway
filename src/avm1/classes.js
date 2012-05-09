/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function AS2MovieClip() {
}
AS2MovieClip.prototype = Object.create(null, {
  $nativeMovieClip: {
    value: null,
    writable: true
  },
  $attachNativeMovieClip: {
    value: function attachBitmap(nativeMovieClip) {
      this.$nativeMovieClip = nativeMovieClip;
      nativeMovieClip.$as2Object = this;
    },
    enumerable: false,
  },
  _alpha: {
    get: function get$_alpha() { throw 'Not implemented: get$_alpha'; },
    set: function set$_alpha(value) { throw 'Not implemented: set$_alpha'; },
    enumerable: true,
  },
  attachAudio: {
    value: function attachAudio(id) {
      throw 'Not implemented: attachAudio';
    },
    enumerable: false,
  },
  attachBitmap: {
    value: function attachBitmap(bmp, depth, pixelSnapping, smoothing) {
      throw 'Not implemented: attachBitmap';
    },
    enumerable: false,
  },
  attachMovie: {
    value: function attachMovie(id, name, depth, initObject) {
      throw 'Not implemented: attachMovie';
    },
    enumerable: false,
  },
  beginBitmapFill: {
    value: function beginBitmapFill(bmp, matrix, repeat, smoothing) {
      throw 'Not implemented: beginBitmapFill';
    },
    enumerable: false,
  },
  beginGradientFill: {
    value: function beginGradientFill(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
      throw 'Not implemented: beginGradientFill';
    },
    enumerable: false,
  },
  blendMode: {
    get: function get$blendMode() { throw 'Not implemented: get$blendMode'; },
    set: function set$blendMode(value) { throw 'Not implemented: set$blendMode'; },
    enumerable: true,
  },
  cacheAsBitmap: {
    get: function get$cacheAsBitmap() { throw 'Not implemented: get$cacheAsBitmap'; },
    set: function set$cacheAsBitmap(value) { throw 'Not implemented: set$cacheAsBitmap'; },
    enumerable: true,
  },
  clear: {
    value: function clear() {
      throw 'Not implemented: clear';
    },
    enumerable: false,
  },
  createEmptyMovieClip: {
    value: function createEmptyMovieClip(name, depth) {
      throw 'Not implemented: createEmptyMovieClip';
    },
    enumerable: false,
  },
  createTextField: {
    value: function createTextField(instanceName, depth, x, y, width, height) {
      throw 'Not implemented: createTextField';
    },
    enumerable: false,
  },
  _currentframe: {
    get: function get$_currentframe() { throw 'Not implemented: get$_currentframe'; },
    enumerable: true,
  },
  curveTo: {
    value: function curveTo(controlX, controlY, anchorX, anchorY) {
      throw 'Not implemented: curveTo';
    },
    enumerable: false,
  },
  _droptarget: {
    get: function get$_droptarget() { throw 'Not implemented: get$_droptarget'; },
    enumerable: true,
  },
  duplicateMovieClip: {
    value: function duplicateMovieClip(name, depth, initObject) {
      var newNativeObj = this.$nativeMovieClip(name, depth, initObject);
      var newMovieClip = new AS2MovieClip();
      newMovieClip.$assignNativeMovieClip(newNativeObj);
      return newMovieClip;
    },
    enumerable: false,
  },
  enabled: {
    get: function get$enabled() { throw 'Not implemented: get$enabled'; },
    set: function set$enabled(value) { throw 'Not implemented: set$enabled'; },
    enumerable: true,
  },
  endFill: {
    value: function endFill() {
      throw 'Not implemented: endFill';
    },
    enumerable: false,
  },
  filters: {
    get: function get$filters() { throw 'Not implemented: get$filters'; },
    set: function set$filters(value) { throw 'Not implemented: set$filters'; },
    enumerable: true,
  },
  focusEnabled: {
    get: function get$focusEnabled() { throw 'Not implemented: get$focusEnabled'; },
    set: function set$focusEnabled(value) { throw 'Not implemented: set$focusEnabled'; },
    enumerable: true,
  },
  _focusrect: {
    get: function get$_focusrect() { throw 'Not implemented: get$_focusrect'; },
    set: function set$_focusrect(value) { throw 'Not implemented: set$_focusrect'; },
    enumerable: true,
  },
  forceSmoothing: {
    get: function get$forceSmoothing() { throw 'Not implemented: get$forceSmoothing'; },
    set: function set$forceSmoothing(value) { throw 'Not implemented: set$forceSmoothing'; },
    enumerable: true,
  },
  _framesloaded: {
    get: function get$_framesloaded() { throw 'Not implemented: get$_framesloaded'; },
    enumerable: true,
  },
  getBounds: {
    value: function getBounds(bounds) {
      throw 'Not implemented: getBounds';
    },
    enumerable: false,
  },
  getBytesLoaded: {
    value: function getBytesLoaded() {
      throw 'Not implemented: getBytesLoaded';
    },
    enumerable: false,
  },
  getBytesTotal: {
    value: function getBytesTotal() {
      throw 'Not implemented: getBytesTotal';
    },
    enumerable: false,
  },
  getDepth: {
    value: function getDepth() {
      throw 'Not implemented: getDepth';
    },
    enumerable: false,
  },
  getInstanceAtDepth: {
    value: function getInstanceAtDepth(depth) {
      throw 'Not implemented: getInstanceAtDepth';
    },
    enumerable: false,
  },
  getNextHighestDepth: {
    value: function getNextHighestDepth() {
      throw 'Not implemented: getNextHighestDepth';
    },
    enumerable: false,
  },
  getRect: {
    value: function getRect(bounds) {
      throw 'Not implemented: getRect';
    },
    enumerable: false,
  },
  getSWFVersion: {
    value: function getSWFVersion() {
      throw 'Not implemented: getSWFVersion';
    },
    enumerable: false,
  },
  getTextSnapshot: {
    value: function getTextSnapshot() {
      throw 'Not implemented: getTextSnapshot';
    },
    enumerable: false,
  },
  getURL: {
    value: function getURL(url, window, method) {
      throw 'Not implemented: getURL';
    },
    enumerable: false,
  },
  globalToLocal: {
    value: function globalToLocal(pt) {
      throw 'Not implemented: globalToLocal';
    },
    enumerable: false,
  },
  gotoAndPlay: {
    value: function gotoAndPlay(frame) {
      throw 'Not implemented: gotoAndPlay';
    },
    enumerable: false,
  },
  gotoAndStop: {
    value: function gotoAndStop(frame) {
      throw 'Not implemented: gotoAndStop';
    },
    enumerable: false,
  },
  _height: {
    get: function get$_height() { throw 'Not implemented: get$_height'; },
    set: function set$_height(value) { throw 'Not implemented: set$_height'; },
    enumerable: true,
  },
  _highquality: {
    get: function get$_highquality() { throw 'Not implemented: get$_highquality'; },
    set: function set$_highquality(value) { throw 'Not implemented: set$_highquality'; },
    enumerable: true,
  },
  hitArea: {
    get: function get$hitArea() { throw 'Not implemented: get$hitArea'; },
    set: function set$hitArea(value) { throw 'Not implemented: set$hitArea'; },
    enumerable: true,
  },
  hitTest: {
    value: function hitTest() {
      throw 'Not implemented: hitTest';
    },
    enumerable: false,
  },
  lineGradientStyle: {
    value: function lineGradientStyle(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
      throw 'Not implemented: lineGradientStyle';
    },
    enumerable: false,
  },
  lineStyle: {
    value: function lineStyle(thickness, rgb, alpha, pixelHinting, noScale, capsStyle, jointStyle, miterLimit) {
      throw 'Not implemented: lineStyle';
    },
    enumerable: false,
  },
  lineTo: {
    value: function lineTo(x, y) {
      throw 'Not implemented: lineTo';
    },
    enumerable: false,
  },
  loadMovie: {
    value: function loadMovie(url, method) {
      throw 'Not implemented: loadMovie';
    },
    enumerable: false,
  },
  loadVariables: {
    value: function loadVariables(url, method) {
      throw 'Not implemented: loadVariables';
    },
    enumerable: false,
  },
  localToGlobal: {
    value: function localToGlobal(pt) {
      throw 'Not implemented: localToGlobal';
    },
    enumerable: false,
  },
  _lockroot: {
    get: function get$_lockroot() { throw 'Not implemented: get$_lockroot'; },
    set: function set$_lockroot(value) { throw 'Not implemented: set$_lockroot'; },
    enumerable: true,
  },
  menu: {
    get: function get$menu() { throw 'Not implemented: get$menu'; },
    set: function set$menu(value) { throw 'Not implemented: set$menu'; },
    enumerable: true,
  },
  moveTo: {
    value: function moveTo(x, y) {
      throw 'Not implemented: moveTo';
    },
    enumerable: false,
  },
  _name: {
    get: function get$_name() { throw 'Not implemented: get$_name'; },
    set: function set$_name(value) { throw 'Not implemented: set$_name'; },
    enumerable: true,
  },
  nextFrame: {
    value: function nextFrame() {
      throw 'Not implemented: nextFrame';
    },
    enumerable: false,
  },
  onData: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onDragOut: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onDragOver: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onEnterFrame: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onKeyDown: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onKeyUp: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onKillFocus: {
    value: function(newFocus) {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onLoad: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onMouseDown: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onMouseUp: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onPress: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onRelease: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onReleaseOutside: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onRollOut: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onRollOver: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onSetFocus: {
    value: function(oldFocus) {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  onUnload: {
    value: function() {},
    writable: true,
    configurable: true,
    enumerable: false,
  },
  opaqueBackground: {
    get: function get$opaqueBackground() { throw 'Not implemented: get$opaqueBackground'; },
    set: function set$opaqueBackground(value) { throw 'Not implemented: set$opaqueBackground'; },
    enumerable: true,
  },
  _parent: {
    get: function get$_parent() { throw 'Not implemented: get$_parent'; },
    set: function set$_parent(value) { throw 'Not implemented: set$_parent'; },
    enumerable: true,
  },
  play: {
    value: function play() {
      throw 'Not implemented: play';
    },
    enumerable: false,
  },
  prevFrame: {
    value: function prevFrame() {
      throw 'Not implemented: prevFrame';
    },
    enumerable: false,
  },
  _quality: {
    get: function get$_quality() { throw 'Not implemented: get$_quality'; },
    set: function set$_quality(value) { throw 'Not implemented: set$_quality'; },
    enumerable: true,
  },
  removeMovieClip: {
    value: function removeMovieClip() {
      throw 'Not implemented: removeMovieClip';
    },
    enumerable: false,
  },
  _rotation: {
    get: function get$_rotation() { throw 'Not implemented: get$_rotation'; },
    set: function set$_rotation(value) { throw 'Not implemented: set$_rotation'; },
    enumerable: true,
  },
  scale9Grid: {
    get: function get$scale9Grid() { throw 'Not implemented: get$scale9Grid'; },
    set: function set$scale9Grid(value) { throw 'Not implemented: set$scale9Grid'; },
    enumerable: true,
  },
  scrollRect: {
    get: function get$scrollRect() { throw 'Not implemented: get$scrollRect'; },
    set: function set$scrollRect(value) { throw 'Not implemented: set$scrollRect'; },
    enumerable: true,
  },
  setMask: {
    value: function setMask(mc) {
      throw 'Not implemented: setMask';
    },
    enumerable: false,
  },
  _soundbuftime: {
    get: function get$_soundbuftime() { throw 'Not implemented: get$_soundbuftime'; },
    set: function set$_soundbuftime(value) { throw 'Not implemented: set$_soundbuftime'; },
    enumerable: true,
  },
  startDrag: {
    value: function startDrag(lockCenter, left, top, right, bottom) {
      throw 'Not implemented: startDrag';
    },
    enumerable: false,
  },
  swapDepths: {
    value: function swapDepths(target) {
      throw 'Not implemented: swapDepths';
    },
    enumerable: false,
  },
  tabChildren: {
    get: function get$tabChildren() { throw 'Not implemented: get$tabChildren'; },
    set: function set$tabChildren(value) { throw 'Not implemented: set$tabChildren'; },
    enumerable: true,
  },
  tabEnabled: {
    get: function get$tabEnabled() { throw 'Not implemented: get$tabEnabled'; },
    set: function set$tabEnabled(value) { throw 'Not implemented: set$tabEnabled'; },
    enumerable: true,
  },
  tabIndex: {
    get: function get$tabIndex() { throw 'Not implemented: get$tabIndex'; },
    set: function set$tabIndex(value) { throw 'Not implemented: set$tabIndex'; },
    enumerable: true,
  },
  _target: {
    get: function get$_target() { throw 'Not implemented: get$_target'; },
    enumerable: true,
  },
  _totalframes: {
    get: function get$_totalframes() { throw 'Not implemented: get$_totalframes'; },
    enumerable: true,
  },
  trackAsMenu: {
    get: function get$trackAsMenu() { throw 'Not implemented: get$trackAsMenu'; },
    set: function set$trackAsMenu(value) { throw 'Not implemented: set$trackAsMenu'; },
    enumerable: true,
  },
  transform: {
    get: function get$transform() { throw 'Not implemented: get$transform'; },
    set: function set$transform(value) { throw 'Not implemented: set$transform'; },
    enumerable: true,
  },
  unloadMovie: {
    value: function unloadMovie() {
      throw 'Not implemented: unloadMovie';
    },
    enumerable: false,
  },
  _url: {
    get: function get$_url() { throw 'Not implemented: get$_url'; },
    enumerable: true,
  },
  useHandCursor: {
    get: function get$useHandCursor() { throw 'Not implemented: get$useHandCursor'; },
    set: function set$useHandCursor(value) { throw 'Not implemented: set$useHandCursor'; },
    enumerable: true,
  },
  _visible: {
    get: function get$_visible() { throw 'Not implemented: get$_visible'; },
    set: function set$_visible(value) { throw 'Not implemented: set$_visible'; },
    enumerable: true,
  },
  _width: {
    get: function get$_width() { throw 'Not implemented: get$_width'; },
    set: function set$_width(value) { throw 'Not implemented: set$_width'; },
    enumerable: true,
  },
  _x: {
    get: function get$_x() { throw 'Not implemented: get$_x'; },
    set: function set$_x(value) { throw 'Not implemented: set$_x'; },
    enumerable: true,
  },
  _xmouse: {
    get: function get$_xmouse() { throw 'Not implemented: get$_xmouse'; },
    enumerable: true,
  },
  _xscale: {
    get: function get$_xscale() { throw 'Not implemented: get$_xscale'; },
    set: function set$_xscale(value) { throw 'Not implemented: set$_xscale'; },
    enumerable: true,
  },
  _y: {
    get: function get$_y() { throw 'Not implemented: get$_y'; },
    set: function set$_y(value) { throw 'Not implemented: set$_y'; },
    enumerable: true,
  },
  _ymouse: {
    get: function get$_ymouse() { throw 'Not implemented: get$_ymouse'; },
    enumerable: true,
  },
  _yscale: {
    get: function get$_yscale() { throw 'Not implemented: get$_yscale'; },
    set: function set$_yscale(value) { throw 'Not implemented: set$_yscale'; },
    enumerable: true,
  }
});

// Namespaces

var flash = {};

flash.geom = {};

function AS2Rectangle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}
flash.geom.Rectangle = AS2Rectangle;

flash.net = {
  navigateToURL: function navigateToURL(url, target, method) {
    throw 'Not implemented: navigateToURL';
  }
};

flash.system = {
  fscommand: function fscommand(command, parameters) {
    throw 'Not implemented: fscommand';
  }
};

function AS2Capabilities() {}
Object.defineProperty(AS2Capabilities, 'version', {
  get: function get$version() {
    return 'SHUMWAY ' + AS2Context.instance.swfVersion + ',0,0,0';
  },
  enumerable: true
});
flash.system.Capalilities = AS2Capabilities;

flash.utils = {
  clearInterval: window.clearInterval,
  clearTimeout: window.clearTimeout,
  getTimer: (function() {
    var startTime = Date.now();
    return (function() {
      return Date.now() - startTime;
    });
  })(),
  setInterval: window.setInterval,
  setTimeout: window.setTimeout
};

// Built-in classes modifications

Object.defineProperty(Object.prototype, 'watch', {
  enumerable: false,
  get: function watch() { throw 'Not implemented'; }
});
Object.defineProperty(Object.prototype, 'unwatch', {
  enumerable: false,
  get: function unwatch() { throw 'Not implemented' }
});
Object.defineProperty(Object.prototype, 'addProperty', {
  enumerable: false,
  value: function addProperty() { throw 'Not implemented'; }
});
Object.defineProperty(Object.prototype, 'registerClass', {
  enumerable: false,
  value: function registerClass() { throw 'Not implemented'; }
});

Object.defineProperty(Array, 'CASEINSENSITIVE', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 1
});
Object.defineProperty(Array, 'DESCENDING', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 2
});
Object.defineProperty(Array, 'UNIQUESORT', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 4
});
Object.defineProperty(Array, 'RETURNINDEXEDARRAY', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 8
});
Object.defineProperty(Array, 'NUMERIC', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 16
});
Object.defineProperty(Array.prototype, 'sort', {
  enumerable: false,
  value: (function() {
    var originalSort = Array.prototype.sort;
    return (function sort(compareFunction, options) {
      if (arguments.length <= 1)
        return originalSort.apply(this, arguments);
      throw 'Not implemented';
    });
  })()
});
Object.defineProperty(Array.prototype, 'sortOn', {
  enumerable: false,
  value: function sortOn(fieldName, options) {
    var comparer = (function(x, y) {
      var valueX = String(x[fieldName]);
      var valueY = String(y[fieldName]);
      return valueX < valueY ? -1 : valueX == valueY ? 0 : 1;
    });
    return arguments.length <= 1 ? this.sort(comparer) :
      this.sort(comparer, options);
  }
});

function createBuiltinType(obj, args) {
  if (obj === Array) {
    // special case of array
    var result = args;
    if (args.length == 1 && typeof args[0] === 'number') {
      result = [];
      result.length = args[0];
    }
    return result;
  }
  if (obj === Boolean || obj === Number || obj === Date ||
      obj === String || obj === Function)
    return obj.apply(null, args);
  if (obj === Object)
    return {};
}
