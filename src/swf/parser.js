/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var tagHandler = {
  /* End */                           0: undefined,
  /* ShowFrame */                     1: SHOW_FRAME,
  /* DefineShape */                   2: DEFINE_SHAPE,
  /* PlaceObject */                   4: PLACE_OBJECT,
  /* RemoveObject */                  5: REMOVE_OBJECT,
  /* DefineBits */                    6: DEFINE_IMAGE,
  /* DefineButton */                  7: DEFINE_BUTTON,
  /* JPEGTables */                    8: DEFINE_JPEG_TABLES,
  /* SetBackgroundColor */            9: SET_BACKGROUND_COLOR,
  /* DefineFont */                    10: DEFINE_FONT,
  /* DefineText */                    11: DEFINE_LABEL,
  /* DoAction */                      12: DO_ACTION,
  /* DefineFontInfo */                13: DEFINE_FONT_INFO,
  /* DefineSound */                   14: DEFINE_SOUND,
  /* StartSound */                    15: undefined,
  /* DefineButtonSound */             17: undefined,
  /* SoundStreamHead */               18: undefined,
  /* SoundStreamBlock */              19: undefined,
  /* DefineBitsLossless */            20: DEFINE_BITMAP,
  /* DefineBitsJPEG2 */               21: DEFINE_IMAGE,
  /* DefineShape2 */                  22: DEFINE_SHAPE,
  /* DefineButtonCxform */            23: undefined,
  /* Protect */                       24: undefined,
  /* PlaceObject2 */                  26: PLACE_OBJECT,
  /* RemoveObject2 */                 28: REMOVE_OBJECT,
  /* DefineShape3 */                  32: DEFINE_SHAPE,
  /* DefineText2 */                   33: DEFINE_LABEL,
  /* DefineButton2 */                 34: DEFINE_BUTTON,
  /* DefineBitsJPEG3 */               35: DEFINE_IMAGE,
  /* DefineBitsLossless2 */           36: DEFINE_BITMAP,
  /* DefineEditText */                37: DEFINE_TEXT,
  /* DefineSprite */                  39: undefined,
  /* FrameLabel */                    43: FRAME_LABEL,
  /* SoundStreamHead2 */              45: undefined,
  /* DefineMorphShape */              46: DEFINE_SHAPE,
  /* DefineFont2 */                   48: DEFINE_FONT2,
  /* ExportAssets */                  56: EXPORT_ASSETS,
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
  /* SymbolClass */                   76: SYMBOL_CLASS,
  /* Metadata */                      77: METADATA,
  /* DefineScalingGrid */             78: undefined,
  /* DoABC */                         82: DO_ABC,
  /* DefineShape4 */                  83: DEFINE_SHAPE,
  /* DefineMorphShape2 */             84: DEFINE_SHAPE,
  /* DefineSceneAndFrameLabelData */  86: undefined,
  /* DefineBinaryData */              87: undefined,
  /* DefineFontName */                88: DEFINE_FONT_NAME,
  /* StartSound2 */                   89: undefined,
  /* DefineBitsJPEG4 */               90: DEFINE_IMAGE,
  /* DefineFont4 */                   91: undefined
};
for (var tag in tagHandler) {
  var handler = tagHandler[tag];
  if (typeof handler === 'object')
    tagHandler[tag] = generateParser(handler, 'version', 'tagCode');
}

var readHeader = generateParser(MOVIE_HEADER);

function readTags(context, stream, version, onprogress) {
  var tags = context.tags;
  var bytes = stream.bytes;
  do {
    var tagCodeAndLength = readUi16(bytes, stream);
    var tagCode = tagCodeAndLength >> 6;
    var length = tagCodeAndLength & 0x3f;
    if (length === 0x3f)
      length = readUi32(bytes, stream);
    stream.ensure(length);
    var substream = stream.substream(stream.pos, stream.pos += length);
    var subbytes = substream.bytes;
    var tag = { code: tagCode };

    if (tagCode === 39) {
      tag.type = 'sprite';
      tag.id = readUi16(subbytes, substream);
      tag.frameCount = readUi16(subbytes, substream);
      tag.tags = [];
      readTags(tag, substream, version);
    } else {
      var handler = tagHandler[tagCode];
      if (handler)
        handler(subbytes, substream, tag, version, tagCode);
    }
    tags.push(tag);

    if (tagCode === 1) {
      while (stream.pos < stream.end && stream.getUint16(stream.pos, true) >> 6 === 1) {
        tags.push(tag);
        stream.pos += 2;
      }
      if (onprogress)
        onprogress(context);
    } else if (onprogress && ('id' in tag || 'ref' in tag)) {
      onprogress(context);
    }
  } while (tagCode && stream.pos < stream.end);
}

SWF.parse = function(buffer, options) {
  if (!options)
    options = { };

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
    stream = new Stream(buffer, 8, fileLength - 8, 'C');
    bytes = stream.bytes;
    stream.ensure(21);
  }

  var swf = { version: version };
  readHeader(bytes, stream, swf);
  if (options.onstart)
    options.onstart(swf);

  swf.tags = [];
  readTags(swf, stream, version, options.onprogress);

  if (options.oncomplete)
    options.oncomplete(swf);
};
