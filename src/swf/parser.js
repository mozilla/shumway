/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var tagHandler = {
  /* End */                           0: undefined,
  /* ShowFrame */                     1: SHOW_FRAME,
  /* DefineShape */                   2: DEFINE_SHAPE,
  /* PlaceObject */                   4: PLACE_OBJECT,
  /* RemoveObject */                  5: REMOVE_OBJECT,
  /* DefineButton */                  7: undefined,
  /* SetBackgroundColor */            9: RGB,
  /* DefineBits */                    6: DEFINE_JPEG,
  /* JPEGTables */                    8: DEFINE_JPEG,
  /* SetBackgroundColor */            9: SET_BACKGROUND_COLOR,
  /* DefineFont */                    10: DEFINE_FONT,
  /* DefineText */                    11: DEFINE_TEXT,
  /* DoAction */                      12: DO_ACTION,
  /* DefineFontInfo */                13: DEFINE_FONT_INFO,
  /* DefineSound */                   14: undefined,
  /* StartSound */                    15: undefined,
  /* DefineButtonSound */             17: undefined,
  /* SoundStreamHead */               18: undefined,
  /* SoundStreamBlock */              19: undefined,
  /* DefineBitsLossless */            20: DEFINE_BITMAP,
  /* DefineBitsJPEG2 */               21: DEFINE_JPEG,
  /* DefineShape2 */                  22: DEFINE_SHAPE,
  /* DefineButtonCxform */            23: undefined,
  /* Protect */                       24: undefined,
  /* PlaceObject2 */                  26: PLACE_OBJECT,
  /* RemoveObject2 */                 28: REMOVE_OBJECT,
  /* DefineShape3 */                  32: DEFINE_SHAPE,
  /* DefineText2 */                   33: DEFINE_TEXT,
  /* DefineButton2 */                 34: undefined,
  /* DefineBitsJPEG3 */               35: DEFINE_JPEG,
  /* DefineBitsLossless2 */           36: DEFINE_BITMAP,
  /* DefineEditText */                37: undefined,
  /* DefineSprite */                  39: undefined,
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
  /* DefineBitsJPEG4 */               90: DEFINE_JPEG,
  /* DefineFont4 */                   91: undefined
};
for (var tag in tagHandler) {
  var handler = tagHandler[tag];
  if (typeof handler === 'object')
    tagHandler[tag] = generateParser(handler, 'version', 'tag');
}

var readHeader = generateParser(MOVIE_HEADER);

function readTags(context, stream, version, onprogress) {
  var tags = context.tags;
  var bytes = stream.bytes;
  do {
    var tagAndLength = readUi16(bytes, stream);
    var tag = tagAndLength >> 6;
    var length = tagAndLength & 0x3f;
    if (length === 0x3f)
      length = readUi32(bytes, stream);
    stream.ensure(length);
    var substream = stream.substream(stream.pos, stream.pos += length);
    var subbytes = substream.bytes;
    if (tag === 39) {
      var item = {
        type: 'sprite',
        id: readUi16(subbytes, substream),
        frameCount: readUi16(subbytes, substream),
        tags: []
      };
      readTags(item, substream, version);
    } else {
      var handler = tagHandler[tag];
      var item = handler ? handler(subbytes, substream, version, tag) : { };
    }
    item.tag = tag;
    tags.push(item);
    if (tag === 1) {
      while (stream.getUint16(stream.pos, true) >> 6 === 1) {
        tags.push(item);
        stream.pos += 2;
      }
      if (onprogress)
        onprogress(context);
    } else if (onprogress && item.id) {
      onprogress(context);
    }
  } while (tag);
}

SWF.parse = function(buffer, listener) {
  if (!listener)
    listener = { };

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
  var swf = {
    version: version,
    bounds: header.bounds,
    frameRate: header.frameRate,
    frameCount: header.frameCount
  };
  if (listener.onstart)
    listener.onstart(swf);

	swf.tags = [];
  readTags(swf, stream, version, listener.onprogress);
  
  if (listener.oncomplete)
    listener.oncomplete(swf);
};
