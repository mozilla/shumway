/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function defineJpeg(tag, dictionary) {
  var imgData = tag.imgData;
  var data = '';
  for (var i = 0, n = imgData.length; i < n; i++) {
    var code = imgData[i];
    data += fromCharCode(code);
  }
  if (/^\u0089\u0050\u004e\u0047\u000d\u000a\u001a\u000a/.test(data)) {
    mimeType = 'image/png';
  } else if (/^\u0047\u0049\u0046\u0038\u0039\u0061/.test(data)) {
    mimeType = 'image/gif';
  } else {
    mimeType = 'image/jpeg';
    var jpgTables = dictionary[0];
    if (jpgTables) {
      var header = jpgTables.data;
      data = header.substr(0, header.length - 2) +
             data.replace(/^\u00ff\u00d8/, '').replace(/\u00ff\u00d9$/, '');
    } else {
      data = data.replace(/\u00ff\u00d9\u00ff\u00d8/, '');
    }
  }
  return {
    type: 'image',
    id: tag.id,
    mimeType: mimeType,
    data: data
  };
}
