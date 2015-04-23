var fs = require('fs');
var Shumway = require('../../../build/bundles/shumway.player.js').Shumway;
var FileLoader = Shumway.FileLoader;
var CompressionMethod = Shumway.SWF.CompressionMethod;

exports.run = function (info, cb) {
  var result = Object.create(null);
  var buffer = fs.readFileSync(info.path);
  var loader = new Shumway.FileLoader({
    onLoadOpen: function (file) {
      if (file instanceof Shumway.SWF.SWFFile) {
        var dictionary = file.dictionary;
        var maxTicks = file.frameCount;
        for (var i = 0; i < dictionary.length; i++) {
          if (dictionary[i]) {
            var symbol = file.getSymbol(dictionary[i].id);
            if (symbol.type === 'sprite' && symbol.frameCount > maxTicks) {
              maxTicks = symbol.frameCount;
            }
          }
        }
        result.type = 'SWF';
        result.file_size = file.bytesTotal;
        result.compression = CompressionMethod[file.compression];
        result.swf_version = file.swfVersion;
        result.uses_avm1 = file.useAVM1;
        result.frame_rate = file.frameRate;
        result.frame_count = file.frameCount;
        var bounds = file.bounds;
        result.width = bounds.width / 20 | 0;
        result.height = bounds.height / 20 | 0;
        result.max_ticks = maxTicks;
      } else if (file instanceof Shumway.ImageFile) {
        result.type = 'Image';
        result.file_size = file.bytesTotal;
        result.mime_type = file.mimeType;
      } else {
        throw new Error('Unknown file format');
      }
    },
    onLoadProgress: function () { },
    onNewEagerlyParsedSymbols: function (list, delta) {
      return Promise.resolve();
    },
    onImageBytesLoaded: function () { }
  });
  try {
    loader.loadBytes(new Uint8Array(buffer));
    if (cb) {
      cb(null, result);
    }
  } catch (e) {
    console.error(e.toString());
    if (cb) {
      cb(e, null);
    }
  }
};
