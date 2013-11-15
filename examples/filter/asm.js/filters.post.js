
  var _preMultiplyAlpha = Module.cwrap('preMultiplyAlpha', null, ['number', 'number', 'number']);
  var _unpreMultiplyAlpha = Module.cwrap('unpreMultiplyAlpha', null, ['number', 'number', 'number']);
  var _blur = Module.cwrap('blur', null, ['number', 'number', 'number', 'number', 'number', 'number']);

  function preMultiplyAlpha(img, width, height) {
    var pimg = Module._malloc(img.length);
    Module.HEAPU8.set(img, pimg);
    _preMultiplyAlpha(pimg, width, height);
    img.set(Module.HEAPU8.subarray(pimg, pimg + img.length));
    Module._free(pimg);
  }

  function unpreMultiplyAlpha(img, width, height) {
    var pimg = Module._malloc(img.length);
    Module.HEAPU8.set(img, pimg);
    _unpreMultiplyAlpha(pimg, width, height);
    img.set(Module.HEAPU8.subarray(pimg, pimg + img.length));
    Module._free(pimg);
  }

  function blur(img, width, height, blurX, blurY, quality) {
    quality = quality || 1;
    var pimg = Module._malloc(img.length);
    Module.HEAPU8.set(img, pimg);
    _preMultiplyAlpha(pimg, width, height);
    _blur(pimg, width, height, blurX, blurY, quality);
    _unpreMultiplyAlpha(pimg, width, height);
    img.set(Module.HEAPU8.subarray(pimg, pimg + img.length));
    Module._free(pimg);
  }

  return {
    preMultiplyAlpha: preMultiplyAlpha,
    unpreMultiplyAlpha: unpreMultiplyAlpha,
    blur: blur,

    _preMultiplyAlpha: _preMultiplyAlpha,
    _unpreMultiplyAlpha: _unpreMultiplyAlpha,
    _blur: _blur
  };

})();
