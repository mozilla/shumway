/*
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path='references.ts'/>
module Shumway.SWF.Parser.LowLevel {
  function parseBbox(stream): Bbox {
    stream.align();
    var bits = stream.readUb(5);
    var xMin = stream.readSb(bits);
    var xMax = stream.readSb(bits);
    var yMin = stream.readSb(bits);
    var yMax = stream.readSb(bits);
    stream.align();
    return <Bbox>{ xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax };
  }

  export function parseRgb(stream): number {
    return ((stream.readUi8() << 24) | (stream.readUi8() <<16) |
           (stream.readUi8() << 8) | 0xff) >>> 0;
  }

  function parseRgba(stream): number {
    return (stream.readUi8() << 24) | (stream.readUi8() << 16) |
           (stream.readUi8() << 8) | stream.readUi8();
  }

  function parseArgb(stream): number {
    return stream.readUi8() | (stream.readUi8() << 24) |
           (stream.readUi8() << 16) | (stream.readUi8() << 8);
  }

  function parseMatrix(stream): Matrix {
    var matrix: Matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
    stream.align();
    var hasScale = stream.readUb(1);
    if (hasScale) {
      var bits = stream.readUb(5);
      matrix.a = stream.readFb(bits);
      matrix.d = stream.readFb(bits);
    }
    var hasRotate = stream.readUb(1);
    if (hasRotate) {
      var bits = stream.readUb(5);
      matrix.b = stream.readFb(bits);
      matrix.c = stream.readFb(bits);
    }
    var bits = stream.readUb(5);
    matrix.tx = stream.readSb(bits);
    matrix.ty = stream.readSb(bits);
    stream.align();
    return matrix;
  }

  function parseColorTransform(stream, hasAlpha: boolean): ColorTransform {
    var cxform: ColorTransform = {
      redMultiplier: 0xff,
      greenMultiplier: 0xff,
      blueMultiplier: 0xff,
      alphaMultiplier: 0xff,
      redOffset: 0,
      greenOffset: 0,
      blueOffset: 0,
      alphaOffset: 0,
    };
    stream.align();
    var hasOffsets = stream.readUb(1);
    var hasMultipliers = stream.readUb(1);
    var bits = stream.readUb(4);
    if (hasMultipliers) {
      cxform.redMultiplier = stream.readSb(bits);
      cxform.greenMultiplier = stream.readSb(bits);
      cxform.blueMultiplier = stream.readSb(bits);
      if (hasAlpha) {
        cxform.alphaMultiplier = stream.readSb(bits);
      }
    }
    if (hasOffsets) {
      cxform.redOffset = stream.readSb(bits);
      cxform.greenOffset = stream.readSb(bits);
      cxform.blueOffset = stream.readSb(bits);
      if (hasAlpha) {
        cxform.alphaOffset = stream.readSb(bits);
      }
    }
    stream.align();
    return cxform;
  }

  function parsePlaceObjectTag(stream: Stream, swfVersion: number, tagCode: number,
                               tagEnd: number): PlaceObjectTag {
    var tag: PlaceObjectTag = <any>{ code: tagCode };
    tag.actionBlocksPrecedence = stream.pos;
    if (tagCode === SwfTagCode.CODE_PLACE_OBJECT) {
      tag.symbolId = stream.readUi16();
      tag.depth = stream.readUi16();
      tag.flags |= PlaceObjectFlags.HasMatrix;
      tag.matrix = parseMatrix(stream);
      if (stream.pos < tagEnd) {
        tag.flags |= PlaceObjectFlags.HasColorTransform;
        tag.cxform = parseColorTransform(stream, false);
      }
      return tag;
    }
    var flags = tag.flags = tagCode > SwfTagCode.CODE_PLACE_OBJECT2 ?
                            stream.readUi16() :
                            stream.readUi8();
    tag.depth = stream.readUi16();
    if (flags & PlaceObjectFlags.HasClassName) {
      tag.className = stream.readString(-1);
    }
    if (flags & PlaceObjectFlags.HasCharacter) {
      tag.symbolId = stream.readUi16();
    }
    if (flags & PlaceObjectFlags.HasMatrix) {
      tag.matrix = parseMatrix(stream);
    }
    if (flags & PlaceObjectFlags.HasColorTransform) {
      tag.cxform = parseColorTransform(stream, true);
    }
    if (flags & PlaceObjectFlags.HasRatio) {
      tag.ratio = stream.readUi16();
    }
    if (flags & PlaceObjectFlags.HasName) {
      tag.name = stream.readString(-1);
    }
    if (flags & PlaceObjectFlags.HasClipDepth) {
      tag.clipDepth = stream.readUi16();
    }
    if (flags & PlaceObjectFlags.HasFilterList) {
      var count = stream.readUi8();
      var filters: Filter[] = tag.filters = [];
      while (count--) {
        filters.push(parseFilter(stream));
      }
    }
    if (flags & PlaceObjectFlags.HasBlendMode) {
      tag.blendMode = stream.readUi8();
    }
    if (flags & PlaceObjectFlags.HasCacheAsBitmap) {
      tag.bmpCache = stream.readUi8();
    }
    if (flags & PlaceObjectFlags.HasVisible) {
      tag.visibility = stream.readBool();
    }
    if (flags & PlaceObjectFlags.OpaqueBackground) {
      tag.backgroundColor = parseArgb(stream);
    }
    if (flags & PlaceObjectFlags.HasClipActions) {
      var reserved = stream.readUi16();
      var allFlags = swfVersion >= 6 ? stream.readUi32() : stream.readUi16();
      var allEvents: ClipEvents[] = tag.events = [];
      var events: ClipEvents;
      while (events = parseEvents(stream, swfVersion)) {
        if (stream.pos > tagEnd) {
          Debug.warning('PlaceObject handler attempted to read clip events beyond tag end');
          stream.pos = tagEnd;
          break;
        }
        allEvents.push(events);
      };
    }
    return tag;
  }
  
  function parseEvents(stream: Stream, swfVersion: number): ClipEvents {
    var flags = swfVersion >= 6 ? stream.readUi32() : stream.readUi16();
    if (!flags) {
      // `true` means this is the EndOfEvents marker.
      return null;
    }
    var events: ClipEvents = <any>{};
    // The Construct event is only allowed in 7+. It can't be set in < 6, so mask it out for 6.
    if (swfVersion === 6) {
      flags = flags & ~AVM1ClipEvents.Construct;
    }
    events.flags = flags;
    var length = stream.readUi32();
    if (flags & AVM1ClipEvents.KeyPress) {
      events.keyCode = stream.readUi8();
      length--;
    }
    var end = stream.pos + length;
    events.actionsBlock = stream.bytes.subarray(stream.pos, end);
    stream.pos = end;
    return events;
  }

  function parseFilter(stream: Stream): Filter {
    var filter: Filter = <any>{};
    var type = filter.type = stream.readUi8();
    switch (type) {
      case 0:
      case 2:
      case 3:
      case 4:
      case 7:
        var glow = <GlowFilter>filter;
        var count: number;
        if (type === 4 || type === 7) {
          count = stream.readUi8();
        } else {
          count = type === 3 ? 2 : 1;
        }
        var colors: number[] = glow.colors = [];
        var i = count;
        while (i--) {
          colors.push(parseRgba(stream));
        }
        if (type === 4 || type === 7) {
          var ratios: number[] = glow.ratios = [];
          var i = count;
          while (i--) {
            ratios.push(stream.readUi8());
          }
        }
        glow.blurX = stream.readFixed();
        glow.blurY = stream.readFixed();
        if (type !== 2) {
          glow.angle = stream.readFixed();
          glow.distance = stream.readFixed();
        }
        glow.strength = stream.readFixed8();
        glow.inner = !!stream.readUb(1);
        glow.knockout = !!stream.readUb(1);
        glow.compositeSource = !!stream.readUb(1);
        if (type === 3 || type === 4 || type === 7) {
          glow.onTop = !!stream.readUb(1);
          glow.quality = stream.readUb(4);
        } else {
          glow.quality = stream.readUb(5);
        }
        return glow;
      case 1:
        var blur = <BlurFilter>filter;
        blur.blurX = stream.readFixed();
        blur.blurY = stream.readFixed();
        blur.quality = stream.readUb(5);
        stream.readUb(3);
        return blur;
      case 5:
        var conv = <ConvolutionFilter>filter;
        var matrixX = conv.matrixX = stream.readUi8();
        var matrixY = conv.matrixY = stream.readUi8();
        conv.divisor = stream.readFloat();
        conv.bias = stream.readFloat();
        var matrix: number[] = conv.matrix = [];
        var i = matrixX * matrixY;
        while (i--) {
          matrix.push(stream.readFloat());
        }
        conv.color = parseRgba(stream);
        var reserved = stream.readUb(6);
        conv.clamp = !!stream.readUb(1);
        conv.preserveAlpha = !!stream.readUb(1);
        return conv;
      case 6:
        var cm = <ColorMatrixFilter>filter;
        var matrix: number[] = cm.matrix = [];
        var i = 20;
        while (i--) {
          matrix.push(stream.readFloat());
        }
        return cm;
      default:
    }
    return filter;
  }

  function parseRemoveObjectTag(stream: Stream, swfVersion: number,
                                tagCode: number): RemoveObjectTag {
    var tag: RemoveObjectTag = <any>{ code: tagCode };
    if (tagCode === SwfTagCode.CODE_REMOVE_OBJECT) {
      tag.depth = stream.readUi16();
      tag.symbolId = stream.readUi16();
    } else {
      tag.depth = stream.readUi16();
    }
    return tag;
  }

  export function parseDefineImageTag(stream: Stream, swfVersion: number, tagCode: number,
                                      tagEnd: number, jpegTables: Uint8Array): ImageTag {
    var tag: ImageTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    var imgData: Uint8Array;
    if (tagCode > SwfTagCode.CODE_DEFINE_BITS_JPEG2) {
      var alphaDataOffset = stream.readUi32();
      if (tagCode === SwfTagCode.CODE_DEFINE_BITS_JPEG4) {
        tag.deblock = stream.readFixed8();
      }
      alphaDataOffset += stream.pos;
      imgData = tag.imgData = stream.bytes.subarray(stream.pos, alphaDataOffset);
      tag.alphaData = stream.bytes.subarray(alphaDataOffset, tagEnd);
      stream.pos = tagEnd;
    } else {
      imgData = tag.imgData = stream.bytes.subarray(stream.pos, tagEnd);
      stream.pos = tagEnd;
    }
    switch (imgData[0] << 8 | imgData[1]) {
      case 65496:
      case 65497:
        tag.mimeType = "image/jpeg";
        break;
      case 35152:
        tag.mimeType = "image/png";
        break;
      case 18249:
        tag.mimeType = "image/gif";
        break;
      default:
        tag.mimeType = "application/octet-stream";
    }
    if (tagCode === SwfTagCode.CODE_DEFINE_BITS) {
      tag.jpegTables = { data: jpegTables };
    }
    return tag;
  }
  
  function parseDefineButtonTag(stream: Stream, swfVersion: number, tagCode: number,
                                tagEnd: number): ButtonTag {
    var tag: ButtonTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    var characters: ButtonCharacter[] = tag.characters = [];
    var character: ButtonCharacter;
    if (tagCode == SwfTagCode.CODE_DEFINE_BUTTON) {
      while (character = parseButtonCharacter(stream, swfVersion, tagCode)) {
        characters.push(character);
      };
      tag.actionsData = stream.bytes.subarray(stream.pos, tagEnd);
      stream.pos = tagEnd;
    } else {
      var trackFlags = stream.readUi8();
      tag.trackAsMenu = !!(trackFlags >> 7 & 1);
      var actionOffset = stream.readUi16();
      while (character = parseButtonCharacter(stream, swfVersion, tagCode)) {
        characters.push(character);
      };
      if (!!actionOffset) {
        var buttonActions = tag.buttonActions = [];
        while (stream.pos < tagEnd) {
          var action = parseButtonCondAction(stream, tagEnd);
          // Ignore actions that exceed the tag length.
          if (stream.pos > tagEnd) {
            break;
          }
          buttonActions.push(action);
        }
        stream.pos = tagEnd;
      }
    }
    return tag;
  }
  
  function parseButtonCharacter(stream: Stream, swfVersion: number,
                                tagCode: number): ButtonCharacter {
    var flags = stream.readUi8();
    if (!flags) {
      return null;
    }
    var character: ButtonCharacter = <any>{};
    if (swfVersion < 8) {
      // Clear HasBlendMode and HasFilterList flags.
      flags &= ~(PlaceObjectFlags.HasBlendMode | PlaceObjectFlags.HasFilterList);
    }
    character.flags = flags;
    character.symbolId = stream.readUi16();
    character.depth = stream.readUi16();
    character.matrix = parseMatrix(stream);
    if (tagCode === SwfTagCode.CODE_DEFINE_BUTTON2) {
      character.cxform = parseColorTransform(stream, true);
    }
    if (character.flags & ButtonCharacterFlags.HasFilterList) {
      var count = stream.readUi8();
      var filters: Filter[] = character.filters = [];
      var i = count;
      while (i--) {
        filters.push(parseFilter(stream));
      }
    }
    if (character.flags & ButtonCharacterFlags.HasBlendMode) {
      character.blendMode = stream.readUi8();
    }
    return character;
  }
  
  function parseButtonCondAction(stream: Stream, tagEnd: number): ButtonCondAction {
    var start = stream.pos;
    var tagSize = stream.readUi16();
    // If no tagSize is given, read to the tag's end.
    var end = tagSize ? start + tagSize : tagEnd;
    var conditions = stream.readUi16();
    stream.pos = end;
    return <ButtonCondAction>{
      // The 7 upper bits hold a key code the button should respond to.
      keyCode: (conditions & 0xfe00) >> 9,
      // The lower 9 bits hold state transition flags. See the enum in AVM1Button for details.
      stateTransitionFlags: conditions & 0x1ff,
      // If no tagSize is given, pass `0` to readBinary.
      actionsData: stream.bytes.subarray(start + 4, end)
    };
  }

  function parseDefineBinaryDataTag(stream: Stream, swfVersion: number,
                                    tagCode: number, tagEnd: number): BinaryDataTag {
    var tag: BinaryDataTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    stream.pos += 4; // Reserved
    tag.data = stream.bytes.subarray(stream.pos, tagEnd);
    stream.pos = tagEnd;
    return tag;
  }

  export function parseDefineFontTag(stream: Stream, swfVersion: number,
                                     tagCode: number): FontTag {
    var tag: FontTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    var firstOffset = stream.readUi16();
    var glyphCount = firstOffset / 2;
    var restOffsets: number[] = [];
    var i = glyphCount - 1;
    while (i--) {
      restOffsets.push(stream.readUi16());
    }
    tag.offsets = [firstOffset].concat(restOffsets);
    var glyphs: Glyph[] = tag.glyphs = [];
    var i = glyphCount;
    while (i--) {
      glyphs.push(parseGlyph(stream, swfVersion, tagCode));
    }
    return tag;
  }
  
  function parseGlyph(stream: Stream, swfVersion: number, tagCode: number): Glyph {
    stream.align();
    var fillBits = stream.readUb(4);
    var lineBits = stream.readUb(4);
    return parseShapeRecords(stream, swfVersion, tagCode, false, fillBits, lineBits, false);
  }

  function parseDefineTextTag(stream: Stream, swfVersion, tagCode: number): StaticTextTag {
    var tag: StaticTextTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    tag.bbox = parseBbox(stream);
    tag.matrix = parseMatrix(stream);
    var glyphBits = stream.readUi8();
    var advanceBits = stream.readUi8();
    var records: TextRecord[] = tag.records = [];
    var record: TextRecord;
    while (record = parseTextRecord(stream, swfVersion, tagCode, glyphBits, advanceBits)) {
      records.push(record);
    }
    return tag;
  }

  function parseTextRecord(stream: Stream, swfVersion: number, tagCode: number, glyphBits: number,
                           advanceBits: number): TextRecord {
    stream.align();
    var flags = stream.readUb(8);
    if (!flags) {
      return null;
    }
    var record: TextRecord = <any>{};
    record.flags = flags;
    if (flags & TextRecordFlags.HasFont) {
      record.fontId = stream.readUi16();
    }
    if (flags & TextRecordFlags.HasColor) {
      record.color = tagCode === SwfTagCode.CODE_DEFINE_TEXT2 ?
                                 parseRgba(stream) :
                                 parseRgb(stream);
    }
    if (flags & TextRecordFlags.HasMoveX) {
      record.moveX = stream.readSi16();
    }
    if (flags & TextRecordFlags.HasMoveY) {
      record.moveY = stream.readSi16();
    }
    if (flags & TextRecordFlags.HasFont) {
      record.fontHeight = stream.readUi16();
    }
    var glyphCount = stream.readUi8();
    if (swfVersion <= 6) {
      glyphCount = glyphCount; // & 0x7f ???;
    }
    var entries: TextEntry[] = record.entries = [];
    var i = glyphCount;
    while (i--) {
      entries.push({
        glyphIndex: stream.readUb(glyphBits),
        advance: stream.readSb(advanceBits)
      });
    }
    return record;
  }

  function parseDefineSoundTag(stream: Stream, swfVersion: number, tagCode: number,
                               tagEnd: number): SoundTag {
    var tag: SoundTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    var soundFlags = stream.readUi8();
    tag.soundFormat = soundFlags >> 4 & 15;
    tag.soundRate = soundFlags >> 2 & 3;
    tag.soundSize = soundFlags >> 1 & 1;
    tag.soundType = soundFlags & 1;
    tag.samplesCount = stream.readUi32();
    tag.soundData = stream.bytes.subarray(stream.pos, tagEnd);
    stream.pos = tagEnd;
    return tag;
  }

  function parseStartSoundTag(stream: Stream, swfVersion: number,
                              tagCode: number): StartSoundTag {
    var tag: StartSoundTag = <any>{ code: tagCode };
    if (tagCode == SwfTagCode.CODE_START_SOUND) {
      tag.soundId = stream.readUi16();
    }
    if (tagCode == SwfTagCode.CODE_START_SOUND2) {
      tag.soundClassName = stream.readString(-1);
    }
    tag.soundInfo = parseSoundInfo(stream);
    return tag;
  }

  function parseSoundInfo(stream: Stream): SoundInfo {
    var info: SoundInfo = <any>{};
    var flags = info.flags = stream.readUi8();
    if (flags & SoundInfoFlags.HasInPoint) {
      info.inPoint = stream.readUi32();
    }
    if (flags & SoundInfoFlags.HasOutPoint) {
      info.outPoint = stream.readUi32();
    }
    if (flags & SoundInfoFlags.HasLoops) {
      info.loopCount = stream.readUi16();
    }
    if (flags & SoundInfoFlags.HasEnvelope) {
      var envelopeCount = stream.readUi8();
      var envelopes: SoundEnvelope[] = info.envelopes = [];
      var i = envelopeCount;
      while (i--) {
        envelopes.push({
          pos44: stream.readUi32(),
          volumeLeft: stream.readUi16(),
          volumeRight: stream.readUi16()
        });
      }
    }
    return info;
  }

  export function parseSoundStreamHeadTag(stream: Stream, tagEnd: number): SoundStreamHeadTag {
    var tag: SoundStreamHeadTag = <any>{};
    var playbackFlags = stream.readUi8();
    tag.playbackRate = playbackFlags >> 2 & 3;
    tag.playbackSize = playbackFlags >> 1 & 1;
    tag.playbackType = playbackFlags & 1;
    var streamFlags = stream.readUi8();
    var streamCompression = tag.streamCompression = streamFlags >> 4 & 15;
    tag.streamRate = streamFlags >> 2 & 3;
    tag.streamSize = streamFlags >> 1 & 1;
    tag.streamType = streamFlags & 1;
    tag.samplesCount = stream.readUi16();
    if (streamCompression == 2 && tagEnd - stream.pos >= 2) {
      tag.latencySeek = stream.readSi16();
    }
    return tag
  }

  export function parseDefineBitmapTag(stream: Stream, swfVersion: number, tagCode: number,
                                       tagEnd: number): BitmapTag {
    var tag: BitmapTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    var format = tag.format = stream.readUi8();
    tag.width = stream.readUi16();
    tag.height = stream.readUi16();
    tag.hasAlpha = tagCode === SwfTagCode.CODE_DEFINE_BITS_LOSSLESS2;
    if (format === 3) {
      tag.colorTableSize = stream.readUi8();
    }
    tag.bmpData = stream.bytes.subarray(stream.pos, tagEnd);
    stream.pos = tagEnd;
    return tag;
  }

  function parseDefineEditTextTag(stream: Stream, swfVersion: number, tagCode: number): TextTag {
    var tag: TextTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    tag.bbox = parseBbox(stream);
    var flags = tag.flags = stream.readUi16();
    if (flags & TextFlags.HasFont) {
      tag.fontId = stream.readUi16();
    }
    if (flags & TextFlags.HasFontClass) {
      tag.fontClass = stream.readString(-1);
    }
    if (flags & (TextFlags.HasFont | TextFlags.HasFontClass)) {
      tag.fontHeight = stream.readUi16();
    }
    if (flags & TextFlags.HasColor) {
      tag.color = parseRgba(stream);
    }
    if (flags & TextFlags.HasMaxLength) {
      tag.maxLength = stream.readUi16();
    }
    if (flags & TextFlags.HasLayout) {
      tag.align = stream.readUi8();
      tag.leftMargin = stream.readUi16();
      tag.rightMargin = stream.readUi16();
      tag.indent = stream.readSi16();
      tag.leading = stream.readSi16();
    }
    tag.variableName = stream.readString(-1);
    if (flags & TextFlags.HasText) {
      tag.initialText = stream.readString(-1);
    }
    return tag;
  }

  export function parseDefineFont2Tag(stream: Stream, swfVersion: number, tagCode: number,
                                      tagEnd: number): FontTag {
    var tag: FontTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    var flags = tag.flags = stream.readUi8();
    var wide = !!(flags & FontFlags.WideOrHasFontData);
    if (swfVersion > 5) {
      tag.language = stream.readUi8();
    } else {
      // Clear ShiftJis flag.
      flags = tag.flags = flags & ~FontFlags.ShiftJis;
      // Skip reserved byte.
      stream.pos += 1;
      tag.language = 0;
    }
    var nameLength = stream.readUi8();
    tag.name = stream.readString(nameLength);
    if (tagCode === SwfTagCode.CODE_DEFINE_FONT3) {
      tag.resolution = 20;
    }
    var glyphCount = stream.readUi16();
    // The SWF format docs doesn't say that, but the DefineFont{2,3} tag ends here for device fonts.
    if (glyphCount === 0) {
      return tag;
    }
    var startpos = stream.pos;
    var offsets: number[] = tag.offsets = [];
    var i = glyphCount;
    if (flags & FontFlags.WideOffset) {
      while (i--) {
        offsets.push(stream.readUi32());
      }
      tag.mapOffset = stream.readUi32();
    } else {
      while (i--) {
        offsets.push(stream.readUi16());
      }
      tag.mapOffset = stream.readUi16();
    }
    var glyphs: Glyph[] = tag.glyphs = [];
    var i = glyphCount;
    while (i--) {
      var dist = tag.offsets[glyphCount - i] + startpos - stream.pos;
      // when just one byte difference between two offsets, just read that and insert an empty glyph.
      if (dist === 1) {
        stream.pos += 1;
        glyphs.push([]);
        continue;
      }
      glyphs.push(parseGlyph(stream, swfVersion, tagCode));
    }
    var codes: number[] = tag.codes = [];
    var i = glyphCount;
    while (i--) {
      codes.push(wide ? stream.readUi16() : stream.readUi8());
    }
    if (flags & FontFlags.HasLayout) {
      tag.ascent = stream.readUi16();
      tag.descent = stream.readUi16();
      tag.leading = stream.readSi16();
      var advance: number[] = tag.advance = [];
      var i = glyphCount;
      while (i--) {
        advance.push(stream.readSi16());
      }
      var bbox: Bbox[] = tag.bbox = [];
      var i = glyphCount;
      while (i--) {
        bbox.push(parseBbox(stream));
      }
      var kerningCount = stream.readUi16();
      var kernings: Kerning[] = tag.kerning = [];
      var i = kerningCount;
      // DefineFont2 tags tend to have a wrong kerning count so we have to make sure here that there is enough unread
      // data remaining before parsing the next kerning record. If not, we have to bail out earlier in the following
      // loop to avoid reading out of bound.
      while (i-- && tagEnd - stream.pos >= (wide ? 4 : 2) + 2) {
        kernings.push(parseKerning(stream, wide));
      }
    }
    return tag;
  }
  
  function parseKerning(stream: Stream, wide: boolean): Kerning {
    var kerning: Kerning = <any>{};
    if (wide) {
      kerning.code1 = stream.readUi16();
      kerning.code2 = stream.readUi16();
    }
    else {
      kerning.code1 = stream.readUi8();
      kerning.code2 = stream.readUi8();
    }
    kerning.adjustment = stream.readUi16();
    return kerning;
  }

  export function parseDefineFont4Tag(stream: Stream, swfVersion: number, tagCode: number,
                                      tagEnd: number): FontTag {
    var tag: FontTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    var flags = tag.flags = stream.readUi8();
    tag.name = stream.readString(-1);
    if (flags & FontFlags.WideOrHasFontData) {
      tag.data = stream.bytes.subarray(stream.pos, tagEnd);
      stream.pos = tagEnd;
    }
    return tag;
  }

  function parseDefineScalingGridTag(stream: Stream, swfVersion: number,
                                     tagCode: number): ScalingGridTag {
    var tag: ScalingGridTag = <any>{ code: tagCode };
    tag.symbolId = stream.readUi16();
    tag.splitter = parseBbox(stream);
    return tag;
  }

  export function parseDefineSceneTag(stream: Stream, tagCode: number): SceneTag {
    var tag: SceneTag = <any>{ code: tagCode };
    var sceneCount = stream.readEncodedU32();
    var scenes: Scene[] = tag.scenes = [];
    var i = sceneCount;
    while (i--) {
      scenes.push({
        offset: stream.readEncodedU32(),
        name: stream.readString(-1)
      });
    }
    var labelCount = stream.readEncodedU32();
    var labels: Label[] = tag.labels = [];
    var i = labelCount;
    while (i--) {
      labels.push({
        frame: stream.readEncodedU32(),
        name: stream.readString(-1)
      });
    }
    return tag;
  }
  
  function parseDefineShapeTag(stream: Stream, swfVersion: number, tagCode: number): ShapeTag {
    var tag: ShapeTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    tag.lineBounds = parseBbox(stream);
    var flags = 0;
    var isMorph = tagCode === SwfTagCode.CODE_DEFINE_MORPH_SHAPE ||
                  tagCode === SwfTagCode.CODE_DEFINE_MORPH_SHAPE2;
    if (isMorph) {
      flags |= ShapeFlags.IsMorph;
      tag.lineBoundsMorph = parseBbox(stream);
    }
    var canHaveStrokes = tagCode === SwfTagCode.CODE_DEFINE_SHAPE4 ||
                         tagCode === SwfTagCode.CODE_DEFINE_MORPH_SHAPE2;
    if (canHaveStrokes) {
      var fillBounds = tag.fillBounds = parseBbox(stream);
      if (isMorph) {
        tag.fillBoundsMorph = parseBbox(stream);
      }
      flags |= stream.readUi8() & 0x07;
    }
    tag.flags = flags;
    if (isMorph) {
      stream.pos += 4;
    }
    tag.fillStyles = parseFillStyles(stream, swfVersion, tagCode, isMorph);
    tag.lineStyles = parseLineStyles(stream, swfVersion, tagCode, isMorph, canHaveStrokes);
    stream.align();
    var fillBits = stream.readUb(4);
    var lineBits = stream.readUb(4);
    tag.records = parseShapeRecords(stream, swfVersion, tagCode, isMorph, fillBits, lineBits,
                                    canHaveStrokes);
    if (isMorph) {
      stream.align();
      fillBits = stream.readUb(4);
      lineBits = stream.readUb(4);
      tag.recordsMorph = parseShapeRecords(stream, swfVersion, tagCode, isMorph, fillBits,
                                           lineBits, canHaveStrokes);
    }
    return tag;
  }
  
  function parseShapeRecords(stream: Stream, swfVersion: number, tagCode: number,
                             isMorph: boolean, fillBits: number, lineBits: number,
                             hasStrokes: boolean): ShapeRecord[] {
    var records: ShapeRecord[] = [];
    var bits: number;
    do {
      var record: any = {};
      var type = record.type = stream.readUb(1);
      var flags = stream.readUb(5);
      if (!(type || flags)) {
        break;
      }
      if (type) {
        var bits = (flags & 0x0f) + 2;
        flags = (flags & 0xf0) << 1;
        if (flags & ShapeRecordFlags.IsStraight) {
          var isGeneral = record.isGeneral = stream.readUb(1);
          if (isGeneral) {
            flags |= ShapeRecordFlags.IsGeneral;
            record.deltaX = stream.readSb(bits);
            record.deltaY = stream.readSb(bits);
          } else {
            var isVertical = record.isVertical = stream.readUb(1);
            if (isVertical) {
              flags |= ShapeRecordFlags.IsVertical;
              record.deltaY = stream.readSb(bits);
            } else {
              record.deltaX = stream.readSb(bits);
            }
          }
        } else {
          record.controlDeltaX = stream.readSb(bits);
          record.controlDeltaY = stream.readSb(bits);
          record.anchorDeltaX = stream.readSb(bits);
          record.anchorDeltaY = stream.readSb(bits);
        }
      } else {
        if (tagCode <= SwfTagCode.CODE_DEFINE_SHAPE) {
          // Clear HasNewStyles flag.
          flags &= ~ShapeRecordFlags.HasNewStyles;
        }
        if (flags & ShapeRecordFlags.Move) {
          bits = stream.readUb(5);
          record.moveX = stream.readSb(bits);
          record.moveY = stream.readSb(bits);
        }
        if (flags & ShapeRecordFlags.HasFillStyle0) {
          record.fillStyle0 = stream.readUb(fillBits);
        }
        if (flags & ShapeRecordFlags.HasFillStyle1) {
          record.fillStyle1 = stream.readUb(fillBits);
        }
        if (flags & ShapeRecordFlags.HasLineStyle) {
          record.lineStyle = stream.readUb(lineBits);
        }
        if (flags & ShapeRecordFlags.HasNewStyles) {
          record.fillStyles = parseFillStyles(stream, swfVersion, tagCode, isMorph);
          record.lineStyles = parseLineStyles(stream, swfVersion, tagCode, isMorph, hasStrokes);
          stream.align();
          fillBits = stream.readUb(4);
          lineBits = stream.readUb(4);
        }
      }
      record.flags = flags;
      records.push(record);
    } while (true);
    return records;
  }

  function parseFillStyles(stream: Stream, swfVersion: number, tagCode: number,
                           isMorph: boolean): FillStyle[] {
    var count = stream.readUi8();
    if (tagCode > SwfTagCode.CODE_DEFINE_SHAPE && count === 255) {
      count = stream.readUi16();
    }
    var styles: FillStyle[] = [];
    var i = count;
    while (i--) {
      styles.push(parseFillStyle(stream, swfVersion, tagCode, isMorph));
    }
    return styles;
  }
  
  function parseFillStyle(stream: Stream, swfVersion: number, tagCode: number,
                          isMorph: boolean): FillStyle {
    var style: FillStyle = <any>{};
    var type = style.type = stream.readUi8();
    switch (type) {
      case 0:
        var solid = <SolidFill>style;
        solid.color = tagCode > SwfTagCode.CODE_DEFINE_SHAPE2 || isMorph ?
                      parseRgba(stream) :
                      parseRgb(stream);
        if (isMorph) {
          solid.colorMorph = parseRgba(stream);
        }
        return solid;
      case 16:
      case 18:
      case 19:
        var gradient = <GradientFill>style;
        gradient.matrix = parseMatrix(stream);
        if (isMorph) {
          gradient.matrixMorph = parseMatrix(stream);
        }
        if (tagCode === SwfTagCode.CODE_DEFINE_SHAPE4) {
          gradient.spreadMode = stream.readUb(2);
          gradient.interpolationMode = stream.readUb(2);
        } else {
          stream.readUb(4);
        }
        var count = stream.readUb(4);
        var records: GradientRecord[] = gradient.records = [];
        var j = count;
        while (j--) {
          records.push(parseGradientRecord(stream, tagCode, isMorph));
        }
        if (type === 19) {
          gradient.focalPoint = stream.readSi16();
          if (isMorph) {
            gradient.focalPointMorph = stream.readSi16();
          }
        }
        return gradient;
      case 64:
      case 65:
      case 66:
      case 67:
        var pattern = <BitmapFill>style;
        pattern.bitmapId = stream.readUi16();
        pattern.condition = type === 64 || type === 67;
        pattern.matrix = parseMatrix(stream);
        if (isMorph) {
          pattern.matrixMorph = parseMatrix(stream);
        }
        return pattern;
    }
    return style;
  }
  
  function parseGradientRecord(stream: Stream, tagCode: number,
                               isMorph: boolean): GradientRecord {
    var record: GradientRecord = <any>{};
    record.ratio = stream.readUi8();
    if (tagCode > SwfTagCode.CODE_DEFINE_SHAPE2) {
      record.color = parseRgba(stream);
    } else {
      record.color = parseRgb(stream);
    }
    if (isMorph) {
      record.ratioMorph = stream.readUi8();
      record.colorMorph = parseRgba(stream);
    }
    return record;
  }
  
  function parseLineStyles(stream: Stream, swfVersion: number, tagCode: number,
                           isMorph: boolean, hasStrokes: boolean): LineStyle[] {
    var count = stream.readUi8();
    if (tagCode > SwfTagCode.CODE_DEFINE_SHAPE && count === 255) {
      count = stream.readUi16();
    }
    var styles: LineStyle[] = [];
    var i = count;
    while (i--) {
      var style: any = {};
      style.width = stream.readUi16();
      if (isMorph) {
        style.widthMorph = stream.readUi16();
      }
      if (hasStrokes) {
        stream.align();
        style.startCapsStyle = stream.readUb(2);
        var jointStyle = style.jointStyle = stream.readUb(2);
        var hasFill = style.hasFill = stream.readUb(1);
        style.noHscale = !!stream.readUb(1);
        style.noVscale = !!stream.readUb(1);
        style.pixelHinting = !!stream.readUb(1);
        stream.readUb(5);
        style.noClose = !!stream.readUb(1);
        style.endCapsStyle = stream.readUb(2);
        if (jointStyle === 2) {
          style.miterLimitFactor = stream.readFixed8();
        }
        if (hasFill) {
          style.fillStyle = parseFillStyle(stream, swfVersion, tagCode, isMorph);
        } else {
          style.color = parseRgba(stream);
          if (isMorph) {
            style.colorMorph = parseRgba(stream);
          }
        }
      } else {
        if (tagCode > SwfTagCode.CODE_DEFINE_SHAPE2) {
          style.color = parseRgba(stream);
        } else {
          style.color = parseRgb(stream);
        }
        if (isMorph) {
          style.colorMorph = parseRgba(stream);
        }
      }
      styles.push(style);
    }
    return styles;
  }
  
  function parseDefineVideoStreamTag(stream: Stream, swfVersion: number,
                                     tagCode: number): VideoStreamTag {
    var tag: VideoStreamTag = <any>{ code: tagCode };
    tag.id = stream.readUi16();
    tag.numFrames = stream.readUi16();
    tag.width = stream.readUi16();
    tag.height = stream.readUi16();
    stream.readUb(4);
    tag.deblocking = stream.readUb(3);
    tag.smoothing = !!stream.readUb(1);
    tag.codecId = stream.readUi8();
    return tag;
  }
  
  function parseVideoFrameTag(stream: Stream, swfVersion: number,
                              tagCode: number, tagEnd: number): VideoFrameTag {
    var tag: VideoFrameTag = <any>{ code: tagCode };
    tag.streamId = stream.readUi16();
    tag.frameNum = stream.readUi16();
    tag.videoData = stream.bytes.subarray(stream.pos, tagEnd);
    stream.pos = tagEnd;
    return tag;
  }
  
  export var tagHandlers: any = {
    /* End */                            0: undefined,
    /* ShowFrame */                      1: undefined,
    /* DefineShape */                    2: parseDefineShapeTag,
    /* PlaceObject */                    4: parsePlaceObjectTag,
    /* RemoveObject */                   5: parseRemoveObjectTag,
    /* DefineBits */                     6: parseDefineImageTag,
    /* DefineButton */                   7: parseDefineButtonTag,
    /* JPEGTables */                     8: undefined,
    /* SetBackgroundColor */             9: undefined,
    /* DefineFont */                    10: parseDefineFontTag,
    /* DefineText */                    11: parseDefineTextTag,
    /* DoAction */                      12: undefined,
    /* DefineFontInfo */                13: undefined,
    /* DefineSound */                   14: parseDefineSoundTag,
    /* StartSound */                    15: parseStartSoundTag,
    /* DefineButtonSound */             17: undefined,
    /* SoundStreamHead */               18: undefined,
    /* SoundStreamBlock */              19: undefined,
    /* DefineBitsLossless */            20: parseDefineBitmapTag,
    /* DefineBitsJPEG2 */               21: parseDefineImageTag,
    /* DefineShape2 */                  22: parseDefineShapeTag,
    /* DefineButtonCxform */            23: undefined,
    /* Protect */                       24: undefined,
    /* PlaceObject2 */                  26: parsePlaceObjectTag,
    /* RemoveObject2 */                 28: parseRemoveObjectTag,
    /* DefineShape3 */                  32: parseDefineShapeTag,
    /* DefineText2 */                   33: parseDefineTextTag,
    /* DefineButton2 */                 34: parseDefineButtonTag,
    /* DefineBitsJPEG3 */               35: parseDefineImageTag,
    /* DefineBitsLossless2 */           36: parseDefineBitmapTag,
    /* DefineEditText */                37: parseDefineEditTextTag,
    /* DefineSprite */                  39: undefined,
    /* FrameLabel */                    43: undefined,
    /* SoundStreamHead2 */              45: undefined,
    /* DefineMorphShape */              46: parseDefineShapeTag,
    /* DefineFont2 */                   48: parseDefineFont2Tag,
    /* ExportAssets */                  56: undefined,
    /* ImportAssets */                  57: undefined,
    /* EnableDebugger */                58: undefined,
    /* DoInitAction */                  59: undefined,
    /* DefineVideoStream */             60: parseDefineVideoStreamTag,
    /* VideoFrame */                    61: parseVideoFrameTag,
    /* DefineFontInfo2 */               62: undefined,
    /* EnableDebugger2 */               64: undefined,
    /* ScriptLimits */                  65: undefined,
    /* SetTabIndex */                   66: undefined,
    /* FileAttributes */                69: undefined,
    /* PlaceObject3 */                  70: parsePlaceObjectTag,
    /* ImportAssets2 */                 71: undefined,
    /* DoABC (undoc) */                 72: undefined,
    /* DefineFontAlignZones */          73: undefined,
    /* CSMTextSettings */               74: undefined,
    /* DefineFont3 */                   75: parseDefineFont2Tag,
    /* SymbolClass */                   76: undefined,
    /* Metadata */                      77: undefined,
    /* DefineScalingGrid */             78: parseDefineScalingGridTag,
    /* DoABC */                         82: undefined,
    /* DefineShape4 */                  83: parseDefineShapeTag,
    /* DefineMorphShape2 */             84: parseDefineShapeTag,
    /* DefineSceneAndFrameLabelData */  86: parseDefineSceneTag,
    /* DefineBinaryData */              87: parseDefineBinaryDataTag,
    /* DefineFontName */                88: undefined,
    /* StartSound2 */                   89: parseStartSoundTag,
    /* DefineBitsJPEG4 */               90: parseDefineImageTag,
    /* DefineFont4 */                   91: parseDefineFont4Tag
  };

  export function parseHeader(stream: Stream) {
    var bits = stream.readUb(5);
    var xMin = stream.readSb(bits);
    var xMax = stream.readSb(bits);
    var yMin = stream.readSb(bits);
    var yMax = stream.readSb(bits);
    stream.align();
    var frameRateFraction = stream.readUi8();
    var frameRate = stream.readUi8() + frameRateFraction / 256;
    var frameCount = stream.readUi16();
    return {
      frameRate: frameRate,
      frameCount: frameCount,
      bounds: new Shumway.Bounds(xMin, yMin, xMax, yMax)
    };
  }
}
