
var _preMultiplyAlpha = Module.cwrap('preMultiplyAlpha', null, ['number', 'number', 'number']);
var _preMultiplyAlphaUndo = Module.cwrap('preMultiplyAlphaUndo', null, ['number', 'number', 'number']);
var _blur = Module.cwrap('blur', null, ['number', 'number', 'number', 'number', 'number', 'number']);

function preMultiplyAlpha(img, width, height) {
  var size = width * height * 4;
  var pimg = Module._malloc(size);
  Module.HEAPU8.set(img, pimg);
  _preMultiplyAlpha(pimg, width, height);
  img.set(Module.HEAPU8.subarray(pimg, pimg + size));
  Module._free(pimg);
}

function preMultiplyAlphaUndo(img, width, height) {
  var size = width * height * 4;
  var pimg = Module._malloc(size);
  Module.HEAPU8.set(img, pimg);
  _preMultiplyAlphaUndo(pimg, width, height);
  img.set(Module.HEAPU8.subarray(pimg, pimg + size));
  Module._free(pimg);
}

function blur(img, width, height, blurX, blurY, quality) {
  quality = quality || 1;
  var size = width * height * 4;
  var pimg = Module._malloc(size);
  Module.HEAPU8.set(img, pimg);
  _blur(pimg, width, height, blurX, blurY, quality);
  img.set(Module.HEAPU8.subarray(pimg, pimg + size));
  Module._free(pimg);
}
