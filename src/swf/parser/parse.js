/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var tagHandler = {
  /* End */ 0: undefined,
  /* ShowFrame */ 1: undefined,
  /* DefineShape */ 2: DEFINE_SHAPE,
  /* PlaceObject */ 4: PLACE_OBJECT,
  /* RemoveObject */ 5: REMOVE_OBJECT,
  /* DefineBits */ 6: undefined,
  /* DefineButton */ 7: undefined,
  /* JPEGTables */ 8: undefined,
  /* SetBackgroundColor */ 9: RGB,
  /* DefineFont */ 10: undefined,
  /* DefineText */ 11: undefined,
  /* DoAction */ 12: DO_ACTION,
  /* DefineFontInfo */ 13: undefined,
  /* DefineSound */ 14: undefined,
  /* StartSound */ 15: undefined,
  /* DefineButtonSound */ 17: undefined,
  /* SoundStreamHead */ 18: undefined,
  /* SoundStreamBlock */ 19: undefined,
  /* DefineBitsLossless */ 20: undefined,
  /* DefineBitsJPEG2 */ 21: undefined,
  /* DefineShape2 */ 22: DEFINE_SHAPE,
  /* DefineButtonCxform */ 23: undefined,
  /* Protect */ 24: undefined,
  /* PlaceObject2 */ 26: PLACE_OBJECT2,
  /* RemoveObject2 */ 28: REMOVE_OBJECT,
  /* DefineShape3 */ 32: DEFINE_SHAPE,
  /* DefineText2 */ 33: undefined,
  /* DefineButton2 */ 34: undefined,
  /* DefineBitsJPEG3 */ 35: undefined,
  /* DefineBitsLossless2 */ 36: undefined,
  /* DefineEditText */ 37: undefined,
  /* DefineSprite */ 39: defineSprite,
  /* FrameLabel */ 43: undefined,
  /* SoundStreamHead2 */ 45: undefined,
  /* DefineMorphShape */ 46: DEFINE_SHAPE,
  /* DefineFont2 */ 48: undefined,
  /* ExportAssets */ 56: undefined,
  /* ImportAssets */ 57: undefined,
  /* EnableDebugger */ 58: undefined,
  /* DoInitAction */ 59: DO_ACTION,
  /* DefineVideoStream */ 60: undefined,
  /* VideoFrame */ 61: undefined,
  /* DefineFontInfo2 */ 62: undefined,
  /* EnableDebugger2 */ 64: undefined,
  /* ScriptLimits */ 65: undefined,
  /* SetTabIndex */ 66: undefined,
  /* FileAttributes */ 69: FILE_ATTRIBUTES,
  /* PlaceObject3 */ 70: PLACE_OBJECT2,
  /* ImportAssets2 */ 71: undefined,
  /* DefineFontAlignZones */ 73: undefined,
  /* CSMTextSettings */ 74: undefined,
  /* DefineFont3 */ 75: undefined,
  /* SymbolClass */ 76: undefined,
  /* Metadata */ 77: METADATA,
  /* DefineScalingGrid */ 78: undefined,
  /* DoABC */ 82: undefined,
  /* DefineShape4 */ 83: DEFINE_SHAPE,
  /* DefineMorphShape2 */ 84: DEFINE_SHAPE,
  /* DefineSceneAndFrameLabelData */ 86: undefined,
  /* DefineBinaryData */ 87: undefined,
  /* DefineFontName */ 88: undefined,
  /* StartSound2 */ 89: undefined,
  /* DefineBitsJPEG4 */ 90: undefined,
  /* DefineFont4 */ 91: undefined,
};
for (var tag in tagHandler) {
  var handler = tagHandler[tag];
  if (typeof handler === 'object')
    tagHandler[tag] = generate(handler, 'version', 'tag');
}

var readHeader = generate(MOVIE_HEADER);

function readTags(bytes, stream, version) {
  var tags = [];
  do {
    var tagAndLength = readUi16(bytes, stream);
    var tag = tagAndLength >> 6;
    var length = tagAndLength & 0x3f;
    if (length === 0x3f)
      length = readUi32(bytes, stream);
    var substream = stream.substream(stream.pos, stream.pos += length);
    var handler = tagHandler[tag];
    var item = handler ? handler(substream.bytes, substream, version, tag) : { };
    item.tag = tag;
    tags.push(item);
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

SWF.parse = function(buffer) {
  var stream = new Stream(buffer);
  var bytes = stream.bytes;
  var magic1 = bytes[0];
  var magic2 = bytes[1];
  var magic3 = bytes[2];
  var compressed = magic1 === 67;
  if (!((magic1 === 70 || compressed) && magic2 === 87 && magic3 === 83))
    fail('unsupported file format', 'parse');
  var version = bytes[3];
  stream.pos += 4;
  var fileLength = readUi32(bytes, stream);

  // TODO: make decompression progressively
  if (compressed) {
    var hdr = stream.getUint16(stream.pos);
    stream.pos += 2;
    if (hdr & 0x0f00 != 0x0800)
      fail('unknown compression method', 'inflate');
    if (hdr % 31)
      fail('bad FCHECK', 'inflate');
    if (hdr & 0x20)
      fail('FDICT bit set', 'inflate');
    var buffer = [];
    while (buffer.length < fileLength - 8)
      inflateBlock(stream.bytes, stream, buffer);
    stream = new Stream(new Uint8Array(buffer).buffer);
    bytes = stream.bytes;
  }

  var header = readHeader(bytes, stream);
  var tags = readTags(bytes, stream, version);
  return { version: version, header: header, tags: tags };
};
