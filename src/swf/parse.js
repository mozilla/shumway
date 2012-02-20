/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var tagHandler = {
  /* End */                           0: undefined,
  /* ShowFrame */                     1: SHOW_FRAME,
  /* DefineShape */                   2: DEFINE_SHAPE,
  /* PlaceObject */                   4: PLACE_OBJECT,
  /* RemoveObject */                  5: REMOVE_OBJECT,
  /* DefineBits */                    6: undefined,
  /* DefineButton */                  7: undefined,
  /* JPEGTables */                    8: undefined,
  /* SetBackgroundColor */            9: RGB,
  /* DefineFont */                    10: DEFINE_FONT,
  /* DefineText */                    11: DEFINE_TEXT,
  /* DoAction */                      12: DO_ACTION,
  /* DefineFontInfo */                13: DEFINE_FONT_INFO,
  /* DefineSound */                   14: undefined,
  /* StartSound */                    15: undefined,
  /* DefineButtonSound */             17: undefined,
  /* SoundStreamHead */               18: undefined,
  /* SoundStreamBlock */              19: undefined,
  /* DefineBitsLossless */            20: undefined,
  /* DefineBitsJPEG2 */               21: undefined,
  /* DefineShape2 */                  22: DEFINE_SHAPE,
  /* DefineButtonCxform */            23: undefined,
  /* Protect */                       24: undefined,
  /* PlaceObject2 */                  26: PLACE_OBJECT,
  /* RemoveObject2 */                 28: REMOVE_OBJECT,
  /* DefineShape3 */                  32: DEFINE_SHAPE,
  /* DefineText2 */                   33: DEFINE_TEXT,
  /* DefineButton2 */                 34: undefined,
  /* DefineBitsJPEG3 */               35: undefined,
  /* DefineBitsLossless2 */           36: undefined,
  /* DefineEditText */                37: undefined,
  /* DefineSprite */                  39: defineSprite,
  /* FrameLabel */                    43: undefined,
  /* SoundStreamHead2 */              45: undefined,
  /* DefineMorphShape */              46: DEFINE_SHAPE,
  /* DefineFont2 */                   48: DEFINE_FONT2,
  /* ExportAssets */                  56: undefined,
  /* ImportAssets */                  57: undefined,
  /* EnableDebugger */                58: undefined,
  /* DoInitAction */                  59: DO_ACTION,
  /* DefineVideoStream */             60: undefined,
  /* VideoFrame */                    61: undefined,
  /* DefineFontInfo2 */               62: DEFINE_FONT_INFO,
  /* EnableDebugger2 */               64: undefined,
  /* ScriptLimits */                  65: undefined,
  /* SetTabIndex */                   66: undefined,
  /* FileAttributes */                69: FILE_ATTRIBUTES,
  /* PlaceObject3 */                  70: PLACE_OBJECT,
  /* ImportAssets2 */                 71: undefined,
  /* DefineFontAlignZones */          73: undefined,
  /* CSMTextSettings */               74: undefined,
  /* DefineFont3 */                   75: DEFINE_FONT2,
  /* SymbolClass */                   76: undefined,
  /* Metadata */                      77: METADATA,
  /* DefineScalingGrid */             78: undefined,
  /* DoABC */                         82: undefined,
  /* DefineShape4 */                  83: DEFINE_SHAPE,
  /* DefineMorphShape2 */             84: DEFINE_SHAPE,
  /* DefineSceneAndFrameLabelData */  86: undefined,
  /* DefineBinaryData */              87: undefined,
  /* DefineFontName */                88: undefined,
  /* StartSound2 */                   89: undefined,
  /* DefineBitsJPEG4 */               90: undefined,
  /* DefineFont4 */                   91: undefined
};
for (var tag in tagHandler) {
  var handler = tagHandler[tag];
  if (typeof handler === 'object')
    tagHandler[tag] = generate(handler, 'version', 'tag');
}

var readHeader = generate(MOVIE_HEADER);

function readTags(bytes, stream, version, dictionary) {
  var tags = [];
  do {
    var tagAndLength = readUi16(bytes, stream);
    var tag = tagAndLength >> 6;
    var length = tagAndLength & 0x3f;
    if (length === 0x3f)
      length = readUi32(bytes, stream);
    stream.ensure(length);
    var substream = stream.substream(stream.pos, stream.pos += length);
    var handler = tagHandler[tag];
    var item = handler ? handler(substream.bytes, substream, version, tag) : { };
    item.tag = tag;
    tags.push(item);
    if (item.id) {
      var id = item.id;
      if (dictionary[id]) {
        var entry = dictionary[id];
        entry.__proto__ = item;
        dictionary[id] = entry;
      } else {
        dictionary[id] = item;
      }
    }
  } while (tag);
  return tags;
}

function defineSprite(bytes, stream, version) {
  return {
    id: readUi16(bytes, stream),
    frameCount: readUi16(bytes, stream),
    tags: readTags(bytes, stream, version)
  };
}

SWF.parse = function(buffer, callback) {
  var stream = new Stream(buffer);
  var bytes = stream.bytes;
  var magic1 = bytes[0];
  var magic2 = bytes[1];
  var magic3 = bytes[2];
  var compressed = magic1 === 67;
  assert((magic1 === 70 || compressed) && magic2 === 87 && magic3 === 83,
         'unsupported file format', 'parse');
  var version = bytes[3];
  stream.pos += 4;
  var fileLength = readUi32(bytes, stream);
  if (compressed) {
    stream = new Stream(buffer, stream.pos, fileLength - 8);
    bytes = stream.bytes;
    stream.ensure(21);
  }
  var header = readHeader(bytes, stream);
  var dictionary = { };
  var tags = readTags(bytes, stream, version, dictionary);
  var swf = {
    version: version,
    bounds: header.bounds,
    frameRate: header.frameRate,
    frameCount: header.frameCount,
    tags: tags
  };
  callback(swf, dictionary);
};
