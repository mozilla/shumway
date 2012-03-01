/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function defineJpeg(tag) {
  var imgData = tag.imgData;
  var data = '';
  for (var i = 0, n = imgData.length; i < n; i++) {
    var code = imgData[i];
    data += fromCharCode(code);
  }
  return {
    type: 'image',
    id: tag.id,
    mimeType: 'image/jpeg',
    data: data
  };
}
