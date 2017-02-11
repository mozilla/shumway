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
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            var LowLevel;
            (function (LowLevel) {
                function parseBbox(stream) {
                    stream.align();
                    var bits = stream.readUb(5);
                    var xMin = stream.readSb(bits);
                    var xMax = stream.readSb(bits);
                    var yMin = stream.readSb(bits);
                    var yMax = stream.readSb(bits);
                    stream.align();
                    return { xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax };
                }
                function parseRgb(stream) {
                    return ((stream.readUi8() << 24) | (stream.readUi8() << 16) |
                        (stream.readUi8() << 8) | 0xff) >>> 0;
                }
                LowLevel.parseRgb = parseRgb;
                function parseRgba(stream) {
                    return (stream.readUi8() << 24) | (stream.readUi8() << 16) |
                        (stream.readUi8() << 8) | stream.readUi8();
                }
                function parseArgb(stream) {
                    return stream.readUi8() | (stream.readUi8() << 24) |
                        (stream.readUi8() << 16) | (stream.readUi8() << 8);
                }
                function parseMatrix(stream) {
                    var matrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
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
                function parseColorTransform(stream, hasAlpha) {
                    var cxform = {
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
                function parsePlaceObjectTag(stream, swfVersion, tagCode, tagEnd) {
                    var tag = { code: tagCode };
                    tag.actionBlocksPrecedence = stream.pos;
                    if (tagCode === 4 /* CODE_PLACE_OBJECT */) {
                        tag.symbolId = stream.readUi16();
                        tag.depth = stream.readUi16();
                        tag.flags |= 4 /* HasMatrix */;
                        tag.matrix = parseMatrix(stream);
                        if (stream.pos < tagEnd) {
                            tag.flags |= 8 /* HasColorTransform */;
                            tag.cxform = parseColorTransform(stream, false);
                        }
                        return tag;
                    }
                    var flags = tag.flags = tagCode > 26 /* CODE_PLACE_OBJECT2 */ ?
                        stream.readUi16() :
                        stream.readUi8();
                    tag.depth = stream.readUi16();
                    if (flags & 2048 /* HasClassName */) {
                        tag.className = stream.readString(-1);
                    }
                    if (flags & 2 /* HasCharacter */) {
                        tag.symbolId = stream.readUi16();
                    }
                    if (flags & 4 /* HasMatrix */) {
                        tag.matrix = parseMatrix(stream);
                    }
                    if (flags & 8 /* HasColorTransform */) {
                        tag.cxform = parseColorTransform(stream, true);
                    }
                    if (flags & 16 /* HasRatio */) {
                        tag.ratio = stream.readUi16();
                    }
                    if (flags & 32 /* HasName */) {
                        tag.name = stream.readString(-1);
                    }
                    if (flags & 64 /* HasClipDepth */) {
                        tag.clipDepth = stream.readUi16();
                    }
                    if (flags & 256 /* HasFilterList */) {
                        var count = stream.readUi8();
                        var filters = tag.filters = [];
                        while (count--) {
                            filters.push(parseFilter(stream));
                        }
                    }
                    if (flags & 512 /* HasBlendMode */) {
                        tag.blendMode = stream.readUi8();
                    }
                    if (flags & 1024 /* HasCacheAsBitmap */) {
                        tag.bmpCache = stream.readUi8();
                    }
                    if (flags & 8192 /* HasVisible */) {
                        tag.visibility = stream.readBool();
                    }
                    if (flags & 16384 /* OpaqueBackground */) {
                        tag.backgroundColor = parseArgb(stream);
                    }
                    if (flags & 128 /* HasClipActions */) {
                        var reserved = stream.readUi16();
                        var allFlags = swfVersion >= 6 ? stream.readUi32() : stream.readUi16();
                        var allEvents = tag.events = [];
                        var events;
                        while (events = parseEvents(stream, swfVersion)) {
                            if (stream.pos > tagEnd) {
                                Shumway.Debug.warning('PlaceObject handler attempted to read clip events beyond tag end');
                                stream.pos = tagEnd;
                                break;
                            }
                            allEvents.push(events);
                        }
                        ;
                    }
                    return tag;
                }
                function parseEvents(stream, swfVersion) {
                    var flags = swfVersion >= 6 ? stream.readUi32() : stream.readUi16();
                    if (!flags) {
                        // `true` means this is the EndOfEvents marker.
                        return null;
                    }
                    var events = {};
                    // The Construct event is only allowed in 7+. It can't be set in < 6, so mask it out for 6.
                    if (swfVersion === 6) {
                        flags = flags & ~262144 /* Construct */;
                    }
                    events.flags = flags;
                    var length = stream.readUi32();
                    if (flags & 131072 /* KeyPress */) {
                        events.keyCode = stream.readUi8();
                        length--;
                    }
                    var end = stream.pos + length;
                    events.actionsBlock = stream.bytes.subarray(stream.pos, end);
                    stream.pos = end;
                    return events;
                }
                function parseFilter(stream) {
                    var filter = {};
                    var type = filter.type = stream.readUi8();
                    switch (type) {
                        case 0:
                        case 2:
                        case 3:
                        case 4:
                        case 7:
                            var glow = filter;
                            var count;
                            if (type === 4 || type === 7) {
                                count = stream.readUi8();
                            }
                            else {
                                count = type === 3 ? 2 : 1;
                            }
                            var colors = glow.colors = [];
                            var i = count;
                            while (i--) {
                                colors.push(parseRgba(stream));
                            }
                            if (type === 4 || type === 7) {
                                var ratios = glow.ratios = [];
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
                            }
                            else {
                                glow.quality = stream.readUb(5);
                            }
                            return glow;
                        case 1:
                            var blur = filter;
                            blur.blurX = stream.readFixed();
                            blur.blurY = stream.readFixed();
                            blur.quality = stream.readUb(5);
                            stream.readUb(3);
                            return blur;
                        case 5:
                            var conv = filter;
                            var matrixX = conv.matrixX = stream.readUi8();
                            var matrixY = conv.matrixY = stream.readUi8();
                            conv.divisor = stream.readFloat();
                            conv.bias = stream.readFloat();
                            var matrix = conv.matrix = [];
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
                            var cm = filter;
                            var matrix = cm.matrix = [];
                            var i = 20;
                            while (i--) {
                                matrix.push(stream.readFloat());
                            }
                            return cm;
                        default:
                    }
                    return filter;
                }
                function parseRemoveObjectTag(stream, swfVersion, tagCode) {
                    var tag = { code: tagCode };
                    if (tagCode === 5 /* CODE_REMOVE_OBJECT */) {
                        tag.depth = stream.readUi16();
                        tag.symbolId = stream.readUi16();
                    }
                    else {
                        tag.depth = stream.readUi16();
                    }
                    return tag;
                }
                function parseDefineImageTag(stream, swfVersion, tagCode, tagEnd, jpegTables) {
                    var tag = { code: tagCode };
                    tag.id = stream.readUi16();
                    var imgData;
                    if (tagCode > 21 /* CODE_DEFINE_BITS_JPEG2 */) {
                        var alphaDataOffset = stream.readUi32();
                        if (tagCode === 90 /* CODE_DEFINE_BITS_JPEG4 */) {
                            tag.deblock = stream.readFixed8();
                        }
                        alphaDataOffset += stream.pos;
                        imgData = tag.imgData = stream.bytes.subarray(stream.pos, alphaDataOffset);
                        tag.alphaData = stream.bytes.subarray(alphaDataOffset, tagEnd);
                        stream.pos = tagEnd;
                    }
                    else {
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
                    if (tagCode === 6 /* CODE_DEFINE_BITS */) {
                        tag.jpegTables = { data: jpegTables };
                    }
                    return tag;
                }
                LowLevel.parseDefineImageTag = parseDefineImageTag;
                function parseDefineButtonTag(stream, swfVersion, tagCode, tagEnd) {
                    var tag = { code: tagCode };
                    tag.id = stream.readUi16();
                    var characters = tag.characters = [];
                    var character;
                    if (tagCode == 7 /* CODE_DEFINE_BUTTON */) {
                        while (character = parseButtonCharacter(stream, swfVersion, tagCode)) {
                            characters.push(character);
                        }
                        ;
                        tag.actionsData = stream.bytes.subarray(stream.pos, tagEnd);
                        stream.pos = tagEnd;
                    }
                    else {
                        var trackFlags = stream.readUi8();
                        tag.trackAsMenu = !!(trackFlags >> 7 & 1);
                        var actionOffset = stream.readUi16();
                        while (character = parseButtonCharacter(stream, swfVersion, tagCode)) {
                            characters.push(character);
                        }
                        ;
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
                function parseButtonCharacter(stream, swfVersion, tagCode) {
                    var flags = stream.readUi8();
                    if (!flags) {
                        return null;
                    }
                    var character = {};
                    if (swfVersion < 8) {
                        // Clear HasBlendMode and HasFilterList flags.
                        flags &= ~(512 /* HasBlendMode */ | 256 /* HasFilterList */);
                    }
                    character.flags = flags;
                    character.symbolId = stream.readUi16();
                    character.depth = stream.readUi16();
                    character.matrix = parseMatrix(stream);
                    if (tagCode === 34 /* CODE_DEFINE_BUTTON2 */) {
                        character.cxform = parseColorTransform(stream, true);
                    }
                    if (character.flags & 16 /* HasFilterList */) {
                        var count = stream.readUi8();
                        var filters = character.filters = [];
                        var i = count;
                        while (i--) {
                            filters.push(parseFilter(stream));
                        }
                    }
                    if (character.flags & 32 /* HasBlendMode */) {
                        character.blendMode = stream.readUi8();
                    }
                    return character;
                }
                function parseButtonCondAction(stream, tagEnd) {
                    var start = stream.pos;
                    var tagSize = stream.readUi16();
                    // If no tagSize is given, read to the tag's end.
                    var end = tagSize ? start + tagSize : tagEnd;
                    var conditions = stream.readUi16();
                    stream.pos = end;
                    return {
                        // The 7 upper bits hold a key code the button should respond to.
                        keyCode: (conditions & 0xfe00) >> 9,
                        // The lower 9 bits hold state transition flags. See the enum in AVM1Button for details.
                        stateTransitionFlags: conditions & 0x1ff,
                        // If no tagSize is given, pass `0` to readBinary.
                        actionsData: stream.bytes.subarray(start + 4, end)
                    };
                }
                function parseDefineBinaryDataTag(stream, swfVersion, tagCode, tagEnd) {
                    var tag = { code: tagCode };
                    tag.id = stream.readUi16();
                    stream.pos += 4; // Reserved
                    tag.data = stream.bytes.subarray(stream.pos, tagEnd);
                    stream.pos = tagEnd;
                    return tag;
                }
                function parseDefineFontTag(stream, swfVersion, tagCode) {
                    var tag = { code: tagCode };
                    tag.id = stream.readUi16();
                    var firstOffset = stream.readUi16();
                    var glyphCount = firstOffset / 2;
                    var restOffsets = [];
                    var i = glyphCount - 1;
                    while (i--) {
                        restOffsets.push(stream.readUi16());
                    }
                    tag.offsets = [firstOffset].concat(restOffsets);
                    var glyphs = tag.glyphs = [];
                    var i = glyphCount;
                    while (i--) {
                        glyphs.push(parseGlyph(stream, swfVersion, tagCode));
                    }
                    return tag;
                }
                LowLevel.parseDefineFontTag = parseDefineFontTag;
                function parseGlyph(stream, swfVersion, tagCode) {
                    stream.align();
                    var fillBits = stream.readUb(4);
                    var lineBits = stream.readUb(4);
                    return parseShapeRecords(stream, swfVersion, tagCode, false, fillBits, lineBits, false);
                }
                function parseDefineTextTag(stream, swfVersion, tagCode) {
                    var tag = { code: tagCode };
                    tag.id = stream.readUi16();
                    tag.bbox = parseBbox(stream);
                    tag.matrix = parseMatrix(stream);
                    var glyphBits = stream.readUi8();
                    var advanceBits = stream.readUi8();
                    var records = tag.records = [];
                    var record;
                    while (record = parseTextRecord(stream, swfVersion, tagCode, glyphBits, advanceBits)) {
                        records.push(record);
                    }
                    return tag;
                }
                function parseTextRecord(stream, swfVersion, tagCode, glyphBits, advanceBits) {
                    stream.align();
                    var flags = stream.readUb(8);
                    if (!flags) {
                        return null;
                    }
                    var record = {};
                    record.flags = flags;
                    if (flags & 8 /* HasFont */) {
                        record.fontId = stream.readUi16();
                    }
                    if (flags & 4 /* HasColor */) {
                        record.color = tagCode === 33 /* CODE_DEFINE_TEXT2 */ ?
                            parseRgba(stream) :
                            parseRgb(stream);
                    }
                    if (flags & 1 /* HasMoveX */) {
                        record.moveX = stream.readSi16();
                    }
                    if (flags & 2 /* HasMoveY */) {
                        record.moveY = stream.readSi16();
                    }
                    if (flags & 8 /* HasFont */) {
                        record.fontHeight = stream.readUi16();
                    }
                    var glyphCount = stream.readUi8();
                    if (swfVersion <= 6) {
                        glyphCount = glyphCount; // & 0x7f ???;
                    }
                    var entries = record.entries = [];
                    var i = glyphCount;
                    while (i--) {
                        entries.push({
                            glyphIndex: stream.readUb(glyphBits),
                            advance: stream.readSb(advanceBits)
                        });
                    }
                    return record;
                }
                function parseDefineSoundTag(stream, swfVersion, tagCode, tagEnd) {
                    var tag = { code: tagCode };
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
                function parseStartSoundTag(stream, swfVersion, tagCode) {
                    var tag = { code: tagCode };
                    if (tagCode == 15 /* CODE_START_SOUND */) {
                        tag.soundId = stream.readUi16();
                    }
                    if (tagCode == 89 /* CODE_START_SOUND2 */) {
                        tag.soundClassName = stream.readString(-1);
                    }
                    tag.soundInfo = parseSoundInfo(stream);
                    return tag;
                }
                function parseSoundInfo(stream) {
                    var info = {};
                    var flags = info.flags = stream.readUi8();
                    if (flags & 1 /* HasInPoint */) {
                        info.inPoint = stream.readUi32();
                    }
                    if (flags & 2 /* HasOutPoint */) {
                        info.outPoint = stream.readUi32();
                    }
                    if (flags & 4 /* HasLoops */) {
                        info.loopCount = stream.readUi16();
                    }
                    if (flags & 8 /* HasEnvelope */) {
                        var envelopeCount = stream.readUi8();
                        var envelopes = info.envelopes = [];
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
                function parseSoundStreamHeadTag(stream, tagEnd) {
                    var tag = {};
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
                    return tag;
                }
                LowLevel.parseSoundStreamHeadTag = parseSoundStreamHeadTag;
                function parseDefineBitmapTag(stream, swfVersion, tagCode, tagEnd) {
                    var tag = { code: tagCode };
                    tag.id = stream.readUi16();
                    var format = tag.format = stream.readUi8();
                    tag.width = stream.readUi16();
                    tag.height = stream.readUi16();
                    tag.hasAlpha = tagCode === 36 /* CODE_DEFINE_BITS_LOSSLESS2 */;
                    if (format === 3) {
                        tag.colorTableSize = stream.readUi8();
                    }
                    tag.bmpData = stream.bytes.subarray(stream.pos, tagEnd);
                    stream.pos = tagEnd;
                    return tag;
                }
                LowLevel.parseDefineBitmapTag = parseDefineBitmapTag;
                function parseDefineEditTextTag(stream, swfVersion, tagCode) {
                    var tag = { code: tagCode };
                    tag.id = stream.readUi16();
                    tag.bbox = parseBbox(stream);
                    var flags = tag.flags = stream.readUi16();
                    if (flags & 1 /* HasFont */) {
                        tag.fontId = stream.readUi16();
                    }
                    if (flags & 32768 /* HasFontClass */) {
                        tag.fontClass = stream.readString(-1);
                    }
                    if (flags & 1 /* HasFont */) {
                        tag.fontHeight = stream.readUi16();
                    }
                    if (flags & 4 /* HasColor */) {
                        tag.color = parseRgba(stream);
                    }
                    if (flags & 2 /* HasMaxLength */) {
                        tag.maxLength = stream.readUi16();
                    }
                    if (flags & 8192 /* HasLayout */) {
                        tag.align = stream.readUi8();
                        tag.leftMargin = stream.readUi16();
                        tag.rightMargin = stream.readUi16();
                        tag.indent = stream.readSi16();
                        tag.leading = stream.readSi16();
                    }
                    tag.variableName = stream.readString(-1);
                    if (flags & 128 /* HasText */) {
                        tag.initialText = stream.readString(-1);
                    }
                    return tag;
                }
                function parseDefineFont2Tag(stream, swfVersion, tagCode, tagEnd) {
                    var tag = { code: tagCode };
                    tag.id = stream.readUi16();
                    var flags = tag.flags = stream.readUi8();
                    var wide = !!(flags & 4 /* WideOrHasFontData */);
                    if (swfVersion > 5) {
                        tag.language = stream.readUi8();
                    }
                    else {
                        // Clear ShiftJis flag.
                        flags = tag.flags = flags & ~64 /* ShiftJis */;
                        // Skip reserved byte.
                        stream.pos += 1;
                        tag.language = 0;
                    }
                    var nameLength = stream.readUi8();
                    tag.name = stream.readString(nameLength);
                    if (tagCode === 75 /* CODE_DEFINE_FONT3 */) {
                        tag.resolution = 20;
                    }
                    var glyphCount = stream.readUi16();
                    // The SWF format docs doesn't say that, but the DefineFont{2,3} tag ends here for device fonts.
                    if (glyphCount === 0) {
                        return tag;
                    }
                    var startpos = stream.pos;
                    var offsets = tag.offsets = [];
                    var i = glyphCount;
                    if (flags & 8 /* WideOffset */) {
                        while (i--) {
                            offsets.push(stream.readUi32());
                        }
                        tag.mapOffset = stream.readUi32();
                    }
                    else {
                        while (i--) {
                            offsets.push(stream.readUi16());
                        }
                        tag.mapOffset = stream.readUi16();
                    }
                    var glyphs = tag.glyphs = [];
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
                    var codes = tag.codes = [];
                    var i = glyphCount;
                    while (i--) {
                        codes.push(wide ? stream.readUi16() : stream.readUi8());
                    }
                    if (flags & 128 /* HasLayout */) {
                        tag.ascent = stream.readUi16();
                        tag.descent = stream.readUi16();
                        tag.leading = stream.readSi16();
                        var advance = tag.advance = [];
                        var i = glyphCount;
                        while (i--) {
                            advance.push(stream.readSi16());
                        }
                        var bbox = tag.bbox = [];
                        var i = glyphCount;
                        while (i--) {
                            bbox.push(parseBbox(stream));
                        }
                        var kerningCount = stream.readUi16();
                        var kernings = tag.kerning = [];
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
                LowLevel.parseDefineFont2Tag = parseDefineFont2Tag;
                function parseKerning(stream, wide) {
                    var kerning = {};
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
                function parseDefineFont4Tag(stream, swfVersion, tagCode, tagEnd) {
                    var tag = { code: tagCode };
                    tag.id = stream.readUi16();
                    var flags = tag.flags = stream.readUi8();
                    tag.name = stream.readString(-1);
                    if (flags & 4 /* WideOrHasFontData */) {
                        tag.data = stream.bytes.subarray(stream.pos, tagEnd);
                        stream.pos = tagEnd;
                    }
                    return tag;
                }
                LowLevel.parseDefineFont4Tag = parseDefineFont4Tag;
                function parseDefineScalingGridTag(stream, swfVersion, tagCode) {
                    var tag = { code: tagCode };
                    tag.symbolId = stream.readUi16();
                    tag.splitter = parseBbox(stream);
                    return tag;
                }
                function parseDefineSceneTag(stream, tagCode) {
                    var tag = { code: tagCode };
                    var sceneCount = stream.readEncodedU32();
                    var scenes = tag.scenes = [];
                    var i = sceneCount;
                    while (i--) {
                        scenes.push({
                            offset: stream.readEncodedU32(),
                            name: stream.readString(-1)
                        });
                    }
                    var labelCount = stream.readEncodedU32();
                    var labels = tag.labels = [];
                    var i = labelCount;
                    while (i--) {
                        labels.push({
                            frame: stream.readEncodedU32(),
                            name: stream.readString(-1)
                        });
                    }
                    return tag;
                }
                LowLevel.parseDefineSceneTag = parseDefineSceneTag;
                function parseDefineShapeTag(stream, swfVersion, tagCode) {
                    var tag = { code: tagCode };
                    tag.id = stream.readUi16();
                    tag.lineBounds = parseBbox(stream);
                    var flags = 0;
                    var isMorph = tagCode === 46 /* CODE_DEFINE_MORPH_SHAPE */ ||
                        tagCode === 84 /* CODE_DEFINE_MORPH_SHAPE2 */;
                    if (isMorph) {
                        flags |= 8 /* IsMorph */;
                        tag.lineBoundsMorph = parseBbox(stream);
                    }
                    var canHaveStrokes = tagCode === 83 /* CODE_DEFINE_SHAPE4 */ ||
                        tagCode === 84 /* CODE_DEFINE_MORPH_SHAPE2 */;
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
                    tag.records = parseShapeRecords(stream, swfVersion, tagCode, isMorph, fillBits, lineBits, canHaveStrokes);
                    if (isMorph) {
                        stream.align();
                        fillBits = stream.readUb(4);
                        lineBits = stream.readUb(4);
                        tag.recordsMorph = parseShapeRecords(stream, swfVersion, tagCode, isMorph, fillBits, lineBits, canHaveStrokes);
                    }
                    return tag;
                }
                function parseShapeRecords(stream, swfVersion, tagCode, isMorph, fillBits, lineBits, hasStrokes) {
                    var records = [];
                    var bits;
                    do {
                        var record = {};
                        var type = record.type = stream.readUb(1);
                        var flags = stream.readUb(5);
                        if (!(type || flags)) {
                            break;
                        }
                        if (type) {
                            var bits = (flags & 0x0f) + 2;
                            flags = (flags & 0xf0) << 1;
                            if (flags & 32 /* IsStraight */) {
                                var isGeneral = record.isGeneral = stream.readUb(1);
                                if (isGeneral) {
                                    flags |= 64 /* IsGeneral */;
                                    record.deltaX = stream.readSb(bits);
                                    record.deltaY = stream.readSb(bits);
                                }
                                else {
                                    var isVertical = record.isVertical = stream.readUb(1);
                                    if (isVertical) {
                                        flags |= 128 /* IsVertical */;
                                        record.deltaY = stream.readSb(bits);
                                    }
                                    else {
                                        record.deltaX = stream.readSb(bits);
                                    }
                                }
                            }
                            else {
                                record.controlDeltaX = stream.readSb(bits);
                                record.controlDeltaY = stream.readSb(bits);
                                record.anchorDeltaX = stream.readSb(bits);
                                record.anchorDeltaY = stream.readSb(bits);
                            }
                        }
                        else {
                            if (tagCode <= 2 /* CODE_DEFINE_SHAPE */) {
                                // Clear HasNewStyles flag.
                                flags &= ~16 /* HasNewStyles */;
                            }
                            if (flags & 1 /* Move */) {
                                bits = stream.readUb(5);
                                record.moveX = stream.readSb(bits);
                                record.moveY = stream.readSb(bits);
                            }
                            if (flags & 2 /* HasFillStyle0 */) {
                                record.fillStyle0 = stream.readUb(fillBits);
                            }
                            if (flags & 4 /* HasFillStyle1 */) {
                                record.fillStyle1 = stream.readUb(fillBits);
                            }
                            if (flags & 8 /* HasLineStyle */) {
                                record.lineStyle = stream.readUb(lineBits);
                            }
                            if (flags & 16 /* HasNewStyles */) {
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
                function parseFillStyles(stream, swfVersion, tagCode, isMorph) {
                    var count = stream.readUi8();
                    if (tagCode > 2 /* CODE_DEFINE_SHAPE */ && count === 255) {
                        count = stream.readUi16();
                    }
                    var styles = [];
                    var i = count;
                    while (i--) {
                        styles.push(parseFillStyle(stream, swfVersion, tagCode, isMorph));
                    }
                    return styles;
                }
                function parseFillStyle(stream, swfVersion, tagCode, isMorph) {
                    var style = {};
                    var type = style.type = stream.readUi8();
                    switch (type) {
                        case 0:
                            var solid = style;
                            solid.color = tagCode > 22 /* CODE_DEFINE_SHAPE2 */ || isMorph ?
                                parseRgba(stream) :
                                parseRgb(stream);
                            if (isMorph) {
                                solid.colorMorph = parseRgba(stream);
                            }
                            return solid;
                        case 16:
                        case 18:
                        case 19:
                            var gradient = style;
                            gradient.matrix = parseMatrix(stream);
                            if (isMorph) {
                                gradient.matrixMorph = parseMatrix(stream);
                            }
                            if (tagCode === 83 /* CODE_DEFINE_SHAPE4 */) {
                                gradient.spreadMode = stream.readUb(2);
                                gradient.interpolationMode = stream.readUb(2);
                            }
                            else {
                                stream.readUb(4);
                            }
                            var count = stream.readUb(4);
                            var records = gradient.records = [];
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
                            var pattern = style;
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
                function parseGradientRecord(stream, tagCode, isMorph) {
                    var record = {};
                    record.ratio = stream.readUi8();
                    if (tagCode > 22 /* CODE_DEFINE_SHAPE2 */) {
                        record.color = parseRgba(stream);
                    }
                    else {
                        record.color = parseRgb(stream);
                    }
                    if (isMorph) {
                        record.ratioMorph = stream.readUi8();
                        record.colorMorph = parseRgba(stream);
                    }
                    return record;
                }
                function parseLineStyles(stream, swfVersion, tagCode, isMorph, hasStrokes) {
                    var count = stream.readUi8();
                    if (tagCode > 2 /* CODE_DEFINE_SHAPE */ && count === 255) {
                        count = stream.readUi16();
                    }
                    var styles = [];
                    var i = count;
                    while (i--) {
                        var style = {};
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
                            }
                            else {
                                style.color = parseRgba(stream);
                                if (isMorph) {
                                    style.colorMorph = parseRgba(stream);
                                }
                            }
                        }
                        else {
                            if (tagCode > 22 /* CODE_DEFINE_SHAPE2 */) {
                                style.color = parseRgba(stream);
                            }
                            else {
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
                function parseDefineVideoStreamTag(stream, swfVersion, tagCode) {
                    var tag = { code: tagCode };
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
                function parseVideoFrameTag(stream, swfVersion, tagCode, tagEnd) {
                    var tag = { code: tagCode };
                    tag.streamId = stream.readUi16();
                    tag.frameNum = stream.readUi16();
                    tag.videoData = stream.bytes.subarray(stream.pos, tagEnd);
                    stream.pos = tagEnd;
                    return tag;
                }
                LowLevel.tagHandlers = {
                    /* End */ 0: undefined,
                    /* ShowFrame */ 1: undefined,
                    /* DefineShape */ 2: parseDefineShapeTag,
                    /* PlaceObject */ 4: parsePlaceObjectTag,
                    /* RemoveObject */ 5: parseRemoveObjectTag,
                    /* DefineBits */ 6: parseDefineImageTag,
                    /* DefineButton */ 7: parseDefineButtonTag,
                    /* JPEGTables */ 8: undefined,
                    /* SetBackgroundColor */ 9: undefined,
                    /* DefineFont */ 10: parseDefineFontTag,
                    /* DefineText */ 11: parseDefineTextTag,
                    /* DoAction */ 12: undefined,
                    /* DefineFontInfo */ 13: undefined,
                    /* DefineSound */ 14: parseDefineSoundTag,
                    /* StartSound */ 15: parseStartSoundTag,
                    /* DefineButtonSound */ 17: undefined,
                    /* SoundStreamHead */ 18: undefined,
                    /* SoundStreamBlock */ 19: undefined,
                    /* DefineBitsLossless */ 20: parseDefineBitmapTag,
                    /* DefineBitsJPEG2 */ 21: parseDefineImageTag,
                    /* DefineShape2 */ 22: parseDefineShapeTag,
                    /* DefineButtonCxform */ 23: undefined,
                    /* Protect */ 24: undefined,
                    /* PlaceObject2 */ 26: parsePlaceObjectTag,
                    /* RemoveObject2 */ 28: parseRemoveObjectTag,
                    /* DefineShape3 */ 32: parseDefineShapeTag,
                    /* DefineText2 */ 33: parseDefineTextTag,
                    /* DefineButton2 */ 34: parseDefineButtonTag,
                    /* DefineBitsJPEG3 */ 35: parseDefineImageTag,
                    /* DefineBitsLossless2 */ 36: parseDefineBitmapTag,
                    /* DefineEditText */ 37: parseDefineEditTextTag,
                    /* DefineSprite */ 39: undefined,
                    /* FrameLabel */ 43: undefined,
                    /* SoundStreamHead2 */ 45: undefined,
                    /* DefineMorphShape */ 46: parseDefineShapeTag,
                    /* DefineFont2 */ 48: parseDefineFont2Tag,
                    /* ExportAssets */ 56: undefined,
                    /* ImportAssets */ 57: undefined,
                    /* EnableDebugger */ 58: undefined,
                    /* DoInitAction */ 59: undefined,
                    /* DefineVideoStream */ 60: parseDefineVideoStreamTag,
                    /* VideoFrame */ 61: parseVideoFrameTag,
                    /* DefineFontInfo2 */ 62: undefined,
                    /* EnableDebugger2 */ 64: undefined,
                    /* ScriptLimits */ 65: undefined,
                    /* SetTabIndex */ 66: undefined,
                    /* FileAttributes */ 69: undefined,
                    /* PlaceObject3 */ 70: parsePlaceObjectTag,
                    /* ImportAssets2 */ 71: undefined,
                    /* DoABC (undoc) */ 72: undefined,
                    /* DefineFontAlignZones */ 73: undefined,
                    /* CSMTextSettings */ 74: undefined,
                    /* DefineFont3 */ 75: parseDefineFont2Tag,
                    /* SymbolClass */ 76: undefined,
                    /* Metadata */ 77: undefined,
                    /* DefineScalingGrid */ 78: parseDefineScalingGridTag,
                    /* DoABC */ 82: undefined,
                    /* DefineShape4 */ 83: parseDefineShapeTag,
                    /* DefineMorphShape2 */ 84: parseDefineShapeTag,
                    /* DefineSceneAndFrameLabelData */ 86: parseDefineSceneTag,
                    /* DefineBinaryData */ 87: parseDefineBinaryDataTag,
                    /* DefineFontName */ 88: undefined,
                    /* StartSound2 */ 89: parseStartSoundTag,
                    /* DefineBitsJPEG4 */ 90: parseDefineImageTag,
                    /* DefineFont4 */ 91: parseDefineFont4Tag
                };
                function parseHeader(stream) {
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
                LowLevel.parseHeader = parseHeader;
            })(LowLevel = Parser.LowLevel || (Parser.LowLevel = {}));
        })(Parser = SWF.Parser || (SWF.Parser = {}));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path='references.ts'/>
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            var assert = Shumway.Debug.assert;
            var notImplemented = Shumway.Debug.notImplemented;
            var assertUnreachable = Shumway.Debug.assertUnreachable;
            var roundToMultipleOfFour = Shumway.IntegerUtilities.roundToMultipleOfFour;
            var Inflate = Shumway.ArrayUtilities.Inflate;
            /** @const */ var FACTOR_5BBP = 255 / 31;
            /*
             * Returns a Uint8Array of ARGB values. The source image is color mapped meaning
             * that the buffer is first prefixed with a color table:
             *
             * +--------------|--------------------------------------------------+
             * | Color Table  |  Image Data (byte indices into the color table)  |
             * +--------------|--------------------------------------------------+
             *
             * Color Table entries are either in RGB or RGBA format.
             *
             * There are two variations of these file formats, with or without alpha.
             *
             * Row pixels always start at 32 bit alinged offsets, the color table as
             * well as the end of each row may be padded so that the next row of pixels
             * is aligned.
             */
            function parseColorMapped(tag) {
                var width = tag.width, height = tag.height;
                var hasAlpha = tag.hasAlpha;
                var padding = roundToMultipleOfFour(width) - width;
                var colorTableLength = tag.colorTableSize + 1;
                var colorTableEntrySize = hasAlpha ? 4 : 3;
                var colorTableSize = roundToMultipleOfFour(colorTableLength * colorTableEntrySize);
                var dataSize = colorTableSize + ((width + padding) * height);
                var bytes = Inflate.inflate(tag.bmpData, dataSize, true);
                var view = new Uint32Array(width * height);
                // TODO: Figure out why this fails.
                // Make sure we've deflated enough bytes.
                // stream.ensure(dataSize);
                var p = colorTableSize, i = 0, offset = 0;
                if (hasAlpha) {
                    for (var y = 0; y < height; y++) {
                        for (var x = 0; x < width; x++) {
                            offset = bytes[p++] << 2;
                            var a = bytes[offset + 3]; // A
                            var r = bytes[offset + 0]; // R
                            var g = bytes[offset + 1]; // G
                            var b = bytes[offset + 2]; // B
                            view[i++] = b << 24 | g << 16 | r << 8 | a;
                        }
                        p += padding;
                    }
                }
                else {
                    for (var y = 0; y < height; y++) {
                        for (var x = 0; x < width; x++) {
                            offset = bytes[p++] * colorTableEntrySize;
                            var a = 0xff; // A
                            var r = bytes[offset + 0]; // R
                            var g = bytes[offset + 1]; // G
                            var b = bytes[offset + 2]; // B
                            view[i++] = b << 24 | g << 16 | r << 8 | a;
                        }
                        p += padding;
                    }
                }
                release || assert(p === dataSize, "We should be at the end of the data buffer now.");
                release || assert(i === width * height, "Should have filled the entire image.");
                return new Uint8Array(view.buffer);
            }
            /**
             * Returns a Uint8Array of ARGB values. The data is already stored in premultiplied ARGB
             * so there's not much to do unless there's no alpha in which case we expand it here.
             */
            function parse24BPP(tag) {
                var width = tag.width, height = tag.height;
                var hasAlpha = tag.hasAlpha;
                // Even without alpha, 24BPP is stored as 4 bytes, probably for alignment reasons.
                var dataSize = height * width * 4;
                var bytes = Inflate.inflate(tag.bmpData, dataSize, true);
                if (hasAlpha) {
                    return bytes;
                }
                var view = new Uint32Array(width * height);
                var length = width * height, p = 0;
                // TODO: Looks like we can probably get away with just setting alpha to 0xff instead of
                // reading the entire buffer.
                for (var i = 0; i < length; i++) {
                    p++; // Reserved, always zero.
                    var r = bytes[p++];
                    var g = bytes[p++];
                    var b = bytes[p++];
                    view[i] = b << 24 | g << 16 | r << 8 | 0xff;
                }
                release || assert(p === dataSize, "We should be at the end of the data buffer now.");
                return new Uint8Array(view.buffer);
            }
            function parse15BPP(tag) {
                release || notImplemented("parse15BPP");
                /*
                  case FORMAT_15BPP:
                    var colorType = 0x02;
                    var bytesPerLine = ((width * 2) + 3) & ~3;
                    var stream = createInflatedStream(bmpData, bytesPerLine * height);
            
                    for (var y = 0, i = 0; y < height; ++y) {
                      stream.ensure(bytesPerLine);
                      for (var x = 0; x < width; ++x, i += 4) {
                        var word = stream.readUi16();
                        // Extracting RGB color components and changing values range
                        // from 0..31 to 0..255.
                        data[i] = 0 | (FACTOR_5BBP * ((word >> 10) & 0x1f));
                        data[i + 1] = 0 | (FACTOR_5BBP * ((word >> 5) & 0x1f));
                        data[i + 2] = 0 | (FACTOR_5BBP * (word & 0x1f));
                        data[i + 3] = 255;
                      }
                      stream += bytesPerLine;
                    }
                    break;
                  */
                return null;
            }
            function defineBitmap(tag) {
                SWF.enterTimeline("defineBitmap");
                var data;
                var type = Shumway.ImageType.None;
                switch (tag.format) {
                    case 3 /* FORMAT_COLORMAPPED */:
                        data = parseColorMapped(tag);
                        type = Shumway.ImageType.PremultipliedAlphaARGB;
                        break;
                    case 5 /* FORMAT_24BPP */:
                        data = parse24BPP(tag);
                        type = Shumway.ImageType.PremultipliedAlphaARGB;
                        break;
                    case 4 /* FORMAT_15BPP */:
                        data = parse15BPP(tag);
                        type = Shumway.ImageType.PremultipliedAlphaARGB;
                        break;
                    default:
                        release || assertUnreachable('invalid bitmap format');
                }
                SWF.leaveTimeline();
                return {
                    definition: {
                        type: 'image',
                        id: tag.id,
                        width: tag.width,
                        height: tag.height,
                        mimeType: 'application/octet-stream',
                        data: data,
                        dataType: type,
                        image: null
                    },
                    type: 'image'
                };
            }
            Parser.defineBitmap = defineBitmap;
        })(Parser = SWF.Parser || (SWF.Parser = {}));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path='references.ts'/>
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            function defineButton(tag, dictionary) {
                var characters = tag.characters;
                var states = {
                    up: [],
                    over: [],
                    down: [],
                    hitTest: []
                };
                var i = 0, character;
                while ((character = characters[i++])) {
                    var characterItem = dictionary[character.symbolId];
                    // The Flash Player ignores references to undefined symbols here. So should we.
                    // TODO: What should happen if the symbol gets defined later in the file?
                    if (characterItem) {
                        var cmd = {
                            symbolId: characterItem.id,
                            code: 4 /* CODE_PLACE_OBJECT */,
                            depth: character.depth,
                            flags: character.matrix ? 4 /* HasMatrix */ : 0,
                            matrix: character.matrix
                        };
                        if (character.flags & 1 /* StateUp */)
                            states.up.push(cmd);
                        if (character.flags & 2 /* StateOver */)
                            states.over.push(cmd);
                        if (character.flags & 4 /* StateDown */)
                            states.down.push(cmd);
                        if (character.flags & 8 /* StateHitTest */)
                            states.hitTest.push(cmd);
                    }
                    else {
                        release || Shumway.Debug.warning('undefined character in button ' + tag.id);
                    }
                }
                var button = {
                    type: 'button',
                    id: tag.id,
                    buttonActions: tag.buttonActions,
                    states: states
                };
                return button;
            }
            Parser.defineButton = defineButton;
        })(Parser = SWF.Parser || (SWF.Parser = {}));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path='references.ts'/>
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            var pow = Math.pow;
            var min = Math.min;
            var max = Math.max;
            var logE = Math.log;
            var fromCharCode = String.fromCharCode;
            var nextFontId = 1;
            function maxPower2(num) {
                var maxPower = 0;
                var val = num;
                while (val >= 2) {
                    val /= 2;
                    ++maxPower;
                }
                return pow(2, maxPower);
            }
            function toString16(val) {
                return fromCharCode((val >> 8) & 0xff, val & 0xff);
            }
            function toString32(val) {
                return toString16(val >> 16) + toString16(val);
            }
            /**
             * Heuristic to detect if DefineFont2 was scaled as Font3: scanning all
             * x and y coordinates of the glyphs and if their bounding box dimensions
             * greater than 5000 (that's more than enough for normal TrueType font),
             * then the font coordinates were scaled by 20.
             */
            function isScaledFont2(glyphs) {
                var xMin = 0, yMin = 0, xMax = 0, yMax = 0;
                for (var i = 0; i < glyphs.length; i++) {
                    var records = glyphs[i];
                    if (!records) {
                        continue;
                    }
                    var record;
                    var x = 0;
                    var y = 0;
                    for (var j = 0; j < records.length; j++) {
                        record = records[j];
                        if (record.type) {
                            if (record.flags & 32 /* IsStraight */) {
                                x += (record.deltaX || 0);
                                y += -(record.deltaY || 0);
                            }
                            else {
                                x += record.controlDeltaX;
                                y += -record.controlDeltaY;
                                x += record.anchorDeltaX;
                                y += -record.anchorDeltaY;
                            }
                        }
                        else {
                            if (record.flags & 1 /* Move */) {
                                x = record.moveX;
                                y = -record.moveY;
                            }
                        }
                        if (xMin > x) {
                            xMin = x;
                        }
                        if (yMin > y) {
                            yMin = y;
                        }
                        if (xMax < x) {
                            xMax = x;
                        }
                        if (yMax < y) {
                            yMax = y;
                        }
                    }
                }
                var maxDimension = Math.max(xMax - xMin, yMax - yMin);
                return maxDimension > 5000;
            }
            function defineFont(tag) {
                var uniqueName = 'swf-font-' + tag.id;
                var fontName = tag.name || uniqueName;
                var font = {
                    type: 'font',
                    id: tag.id,
                    name: fontName,
                    bold: !!(tag.flags & 1 /* Bold */),
                    italic: !!(tag.flags & 2 /* Italic */),
                    codes: null,
                    metrics: null,
                    data: tag.data,
                    originalSize: false
                };
                var glyphs = tag.glyphs;
                var glyphCount = glyphs ? glyphs.length : 0;
                if (!glyphCount) {
                    return font;
                }
                var tables = {};
                var codes = [];
                var glyphIndex = {};
                var ranges = [];
                var originalCode;
                var generateAdvancement = !('advance' in tag);
                var correction = 0;
                var isFont2 = tag.code === 48 /* CODE_DEFINE_FONT2 */;
                var isFont3 = tag.code === 75 /* CODE_DEFINE_FONT3 */;
                if (generateAdvancement) {
                    tag.advance = [];
                }
                var maxCode = Math.max.apply(null, tag.codes) || 35;
                if (tag.codes) {
                    for (var i = 0; i < tag.codes.length; i++) {
                        var code = tag.codes[i];
                        if (code < 32 || code in glyphIndex) {
                            maxCode++;
                            if (maxCode == 8232) {
                                maxCode = 8240;
                            }
                            code = maxCode;
                        }
                        codes.push(code);
                        glyphIndex[code] = i;
                    }
                    originalCode = codes.concat();
                    codes.sort(function (a, b) {
                        return a - b;
                    });
                    var i = 0;
                    var code;
                    var indices;
                    while ((code = codes[i++]) !== undefined) {
                        var start = code;
                        var end = start;
                        indices = [i - 1];
                        while (((code = codes[i]) !== undefined) && end + 1 === code) {
                            ++end;
                            indices.push(i);
                            ++i;
                        }
                        ranges.push([start, end, indices]);
                    }
                }
                else {
                    indices = [];
                    var UAC_OFFSET = 0xe000;
                    for (var i = 0; i < glyphCount; i++) {
                        code = UAC_OFFSET + i;
                        codes.push(code);
                        glyphIndex[code] = i;
                        indices.push(i);
                    }
                    ranges.push([UAC_OFFSET, UAC_OFFSET + glyphCount - 1, indices]);
                    originalCode = codes.concat();
                }
                var resolution = tag.resolution || 1;
                if (isFont2 && isScaledFont2(glyphs)) {
                    // some DefineFont2 without layout using DefineFont3 resolution, why?
                    resolution = 20;
                    font.originalSize = true;
                }
                var ascent = Math.ceil(tag.ascent / resolution) || 1024;
                var descent = -Math.ceil(tag.descent / resolution) || 0;
                var leading = (tag.leading / resolution) || 0;
                tables['OS/2'] = '';
                var startCount = '';
                var endCount = '';
                var idDelta = '';
                var idRangeOffset = '';
                var i = 0;
                var range;
                while ((range = ranges[i++])) {
                    var start = range[0];
                    var end = range[1];
                    var code = range[2][0];
                    startCount += toString16(start);
                    endCount += toString16(end);
                    idDelta += toString16(((code - start) + 1) & 0xffff);
                    idRangeOffset += toString16(0);
                }
                endCount += '\xff\xff';
                startCount += '\xff\xff';
                idDelta += '\x00\x01';
                idRangeOffset += '\x00\x00';
                var segCount = ranges.length + 1;
                var searchRange = maxPower2(segCount) * 2;
                var rangeShift = (2 * segCount) - searchRange;
                var format314 = '\x00\x00' +
                    toString16(segCount * 2) +
                    toString16(searchRange) +
                    toString16(logE(segCount) / logE(2)) +
                    toString16(rangeShift) +
                    endCount +
                    '\x00\x00' +
                    startCount +
                    idDelta +
                    idRangeOffset;
                tables['cmap'] =
                    '\x00\x00' +
                        '\x00\x01' +
                        '\x00\x03' +
                        '\x00\x01' +
                        '\x00\x00\x00\x0c' +
                        '\x00\x04' +
                        toString16(format314.length + 4) +
                        format314;
                var glyf = '\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x31\x00';
                var loca = '\x00\x00';
                var offset = 16;
                var maxPoints = 0;
                var xMins = [];
                var xMaxs = [];
                var yMins = [];
                var yMaxs = [];
                var maxContours = 0;
                var i = 0;
                var code;
                var rawData = {};
                while ((code = codes[i++]) !== undefined) {
                    var records = glyphs[glyphIndex[code]];
                    var x = 0;
                    var y = 0;
                    var myFlags = '';
                    var myEndpts = '';
                    var endPoint = 0;
                    var segments = [];
                    var segmentIndex = -1;
                    for (var j = 0; j < records.length; j++) {
                        record = records[j];
                        if (record.type) {
                            if (segmentIndex < 0) {
                                segmentIndex = 0;
                                segments[segmentIndex] = { data: [], commands: [], xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
                            }
                            if (record.flags & 32 /* IsStraight */) {
                                segments[segmentIndex].commands.push(2);
                                var dx = (record.deltaX || 0) / resolution;
                                var dy = -(record.deltaY || 0) / resolution;
                                x += dx;
                                y += dy;
                                segments[segmentIndex].data.push(x, y);
                            }
                            else {
                                segments[segmentIndex].commands.push(3);
                                var cx = record.controlDeltaX / resolution;
                                var cy = -record.controlDeltaY / resolution;
                                x += cx;
                                y += cy;
                                segments[segmentIndex].data.push(x, y);
                                var dx = record.anchorDeltaX / resolution;
                                var dy = -record.anchorDeltaY / resolution;
                                x += dx;
                                y += dy;
                                segments[segmentIndex].data.push(x, y);
                            }
                        }
                        else {
                            if (record.flags & 1 /* Move */) {
                                segmentIndex++;
                                segments[segmentIndex] = { data: [], commands: [], xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
                                segments[segmentIndex].commands.push(1);
                                var moveX = record.moveX / resolution;
                                var moveY = -record.moveY / resolution;
                                var dx = moveX - x;
                                var dy = moveY - y;
                                x = moveX;
                                y = moveY;
                                segments[segmentIndex].data.push(x, y);
                            }
                        }
                        if (segmentIndex > -1) {
                            if (segments[segmentIndex].xMin > x) {
                                segments[segmentIndex].xMin = x;
                            }
                            if (segments[segmentIndex].yMin > y) {
                                segments[segmentIndex].yMin = y;
                            }
                            if (segments[segmentIndex].xMax < x) {
                                segments[segmentIndex].xMax = x;
                            }
                            if (segments[segmentIndex].yMax < y) {
                                segments[segmentIndex].yMax = y;
                            }
                        }
                    }
                    if (!isFont3) {
                        segments.sort(function (a, b) {
                            return (b.xMax - b.xMin) * (b.yMax - b.yMin) - (a.xMax - a.xMin) * (a.yMax - a.yMin);
                        });
                    }
                    rawData[code] = segments;
                }
                i = 0;
                while ((code = codes[i++]) !== undefined) {
                    var records = glyphs[glyphIndex[code]];
                    segments = rawData[code];
                    var numberOfContours = 1;
                    var endPoint = 0;
                    var endPtsOfContours = '';
                    var flags = '';
                    var xCoordinates = '';
                    var yCoordinates = '';
                    var x = 0;
                    var y = 0;
                    var xMin = 0;
                    var xMax = -1024;
                    var yMin = 0;
                    var yMax = -1024;
                    var myFlags = '';
                    var myEndpts = '';
                    var endPoint = 0;
                    var segmentIndex = -1;
                    var data = [];
                    var commands = [];
                    for (j = 0; j < segments.length; j++) {
                        data = data.concat(segments[j].data);
                        commands = commands.concat(segments[j].commands);
                    }
                    x = 0;
                    y = 0;
                    var nx = 0;
                    var ny = 0;
                    var myXCoordinates = '';
                    var myYCoordinates = '';
                    var dataIndex = 0;
                    var endPoint = 0;
                    var numberOfContours = 1;
                    var myEndpts = '';
                    for (j = 0; j < commands.length; j++) {
                        var command = commands[j];
                        if (command === 1) {
                            if (endPoint) {
                                ++numberOfContours;
                                myEndpts += toString16(endPoint - 1);
                            }
                            nx = data[dataIndex++];
                            ny = data[dataIndex++];
                            var dx = nx - x;
                            var dy = ny - y;
                            myFlags += '\x01';
                            myXCoordinates += toString16(dx);
                            myYCoordinates += toString16(dy);
                            x = nx;
                            y = ny;
                        }
                        else if (command === 2) {
                            nx = data[dataIndex++];
                            ny = data[dataIndex++];
                            var dx = nx - x;
                            var dy = ny - y;
                            myFlags += '\x01';
                            myXCoordinates += toString16(dx);
                            myYCoordinates += toString16(dy);
                            x = nx;
                            y = ny;
                        }
                        else if (command === 3) {
                            nx = data[dataIndex++];
                            ny = data[dataIndex++];
                            var cx = nx - x;
                            var cy = ny - y;
                            myFlags += '\x00';
                            myXCoordinates += toString16(cx);
                            myYCoordinates += toString16(cy);
                            x = nx;
                            y = ny;
                            endPoint++;
                            nx = data[dataIndex++];
                            ny = data[dataIndex++];
                            var cx = nx - x;
                            var cy = ny - y;
                            myFlags += '\x01';
                            myXCoordinates += toString16(cx);
                            myYCoordinates += toString16(cy);
                            x = nx;
                            y = ny;
                        }
                        endPoint++;
                        if (endPoint > maxPoints) {
                            maxPoints = endPoint;
                        }
                        if (xMin > x) {
                            xMin = x;
                        }
                        if (yMin > y) {
                            yMin = y;
                        }
                        if (xMax < x) {
                            xMax = x;
                        }
                        if (yMax < y) {
                            yMax = y;
                        }
                    }
                    myEndpts += toString16((endPoint || 1) - 1);
                    endPtsOfContours = myEndpts;
                    xCoordinates = myXCoordinates;
                    yCoordinates = myYCoordinates;
                    flags = myFlags;
                    if (!j) {
                        xMin = xMax = yMin = yMax = 0;
                        flags += '\x31';
                    }
                    var entry = toString16(numberOfContours) +
                        toString16(xMin) +
                        toString16(yMin) +
                        toString16(xMax) +
                        toString16(yMax) +
                        endPtsOfContours +
                        '\x00\x00' +
                        flags +
                        xCoordinates +
                        yCoordinates;
                    if (entry.length & 1) {
                        entry += '\x00';
                    }
                    glyf += entry;
                    loca += toString16(offset / 2);
                    offset += entry.length;
                    xMins.push(xMin);
                    xMaxs.push(xMax);
                    yMins.push(yMin);
                    yMaxs.push(yMax);
                    if (numberOfContours > maxContours) {
                        maxContours = numberOfContours;
                    }
                    if (endPoint > maxPoints) {
                        maxPoints = endPoint;
                    }
                    if (generateAdvancement) {
                        tag.advance.push((xMax - xMin) * resolution * 1.3);
                    }
                }
                loca += toString16(offset / 2);
                tables['glyf'] = glyf;
                if (!isFont3) {
                    var minYmin = Math.min.apply(null, yMins);
                    if (minYmin < 0) {
                        descent = descent || minYmin;
                    }
                }
                tables['OS/2'] =
                    '\x00\x01' +
                        '\x00\x00' +
                        toString16(font.bold ? 700 : 400) +
                        '\x00\x05' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00' +
                        '\x00\x00\x00\x00' +
                        '\x00\x00\x00\x00' +
                        '\x00\x00\x00\x00' +
                        '\x00\x00\x00\x00' +
                        'ALF ' +
                        toString16((font.italic ? 0x01 : 0) | (font.bold ? 0x20 : 0)) +
                        toString16(codes[0]) +
                        toString16(codes[codes.length - 1]) +
                        toString16(ascent) +
                        toString16(descent) +
                        toString16(leading) +
                        toString16(ascent) +
                        toString16(-descent) +
                        '\x00\x00\x00\x00' +
                        '\x00\x00\x00\x00' // ulCodePageRange2
                ;
                tables['head'] =
                    '\x00\x01\x00\x00' +
                        '\x00\x01\x00\x00' +
                        '\x00\x00\x00\x00' +
                        '\x5f\x0f\x3c\xf5' +
                        '\x00\x0b' +
                        '\x04\x00' +
                        '\x00\x00\x00\x00' + toString32(Date.now()) +
                        '\x00\x00\x00\x00' + toString32(Date.now()) +
                        toString16(min.apply(null, xMins)) +
                        toString16(min.apply(null, yMins)) +
                        toString16(max.apply(null, xMaxs)) +
                        toString16(max.apply(null, yMaxs)) +
                        toString16((font.italic ? 2 : 0) | (font.bold ? 1 : 0)) +
                        '\x00\x08' +
                        '\x00\x02' +
                        '\x00\x00' +
                        '\x00\x00' // glyphDataFormat
                ;
                var advance = tag.advance;
                tables['hhea'] =
                    '\x00\x01\x00\x00' +
                        toString16(ascent) +
                        toString16(descent) +
                        toString16(leading) +
                        toString16(advance ? max.apply(null, advance) : 1024) +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x03\xb8' +
                        '\x00\x01' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        toString16(glyphCount + 1) // numberOfHMetrics
                ;
                var hmtx = '\x00\x00\x00\x00';
                for (var i = 0; i < glyphCount; ++i) {
                    hmtx += toString16(advance ? (advance[i] / resolution) : 1024) + '\x00\x00';
                }
                tables['hmtx'] = hmtx;
                if (tag.kerning && tag.kerning.length) {
                    var kerning = tag.kerning;
                    var nPairs = kerning.length;
                    var searchRange = maxPower2(nPairs) * 2;
                    var kern = '\x00\x00' +
                        '\x00\x01' +
                        '\x00\x00' +
                        toString16(14 + (nPairs * 6)) +
                        '\x00\x01' +
                        toString16(nPairs) +
                        toString16(searchRange) +
                        toString16(logE(nPairs) / logE(2)) +
                        toString16((2 * nPairs) - searchRange);
                    var i = 0;
                    var record;
                    while ((record = kerning[i++])) {
                        kern +=
                            toString16(glyphIndex[record.code1]) +
                                toString16(glyphIndex[record.code2]) +
                                toString16(record.adjustment) // value
                        ;
                    }
                    tables['kern'] = kern;
                }
                tables['loca'] = loca;
                tables['maxp'] =
                    '\x00\x01\x00\x00' +
                        toString16(glyphCount + 1) +
                        toString16(maxPoints) +
                        toString16(maxContours) +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x01' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' // maxComponentDepth
                ;
                var psName = fontName.replace(/ /g, '');
                var strings = [
                    tag.copyright || 'Original licence',
                    fontName,
                    'Unknown',
                    uniqueName,
                    fontName,
                    '1.0',
                    psName,
                    'Unknown',
                    'Unknown',
                    'Unknown' // 9. Designer
                ];
                var count = strings.length;
                var name = '\x00\x00' +
                    toString16(count) +
                    toString16((count * 12) + 6); // stringOffset
                var offset = 0;
                var i = 0;
                var str;
                while ((str = strings[i++])) {
                    name +=
                        '\x00\x01' +
                            '\x00\x00' +
                            '\x00\x00' +
                            toString16(i - 1) +
                            toString16(str.length) +
                            toString16(offset);
                    offset += str.length;
                }
                tables['name'] = name + strings.join('');
                tables['post'] =
                    '\x00\x03\x00\x00' +
                        '\x00\x00\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00' +
                        '\x00\x00\x00\x00' +
                        '\x00\x00\x00\x00' +
                        '\x00\x00\x00\x00' +
                        '\x00\x00\x00\x00' +
                        '\x00\x00\x00\x00' // maxMemType1
                ;
                var names = Object.keys(tables);
                var numTables = names.length;
                var header = '\x00\x01\x00\x00' +
                    toString16(numTables) +
                    '\x00\x80' +
                    '\x00\x03' +
                    '\x00\x20';
                var dataString = '';
                var offset = (numTables * 16) + header.length;
                var i = 0;
                while ((name = names[i++])) {
                    var table = tables[name];
                    var length = table.length;
                    header +=
                        name +
                            '\x00\x00\x00\x00' +
                            toString32(offset) +
                            toString32(length);
                    while (length & 3) {
                        table += '\x00';
                        ++length;
                    }
                    dataString += table;
                    while (offset & 3) {
                        ++offset;
                    }
                    offset += length;
                }
                var otf = header + dataString;
                var unitPerEm = 1024;
                var metrics = {
                    ascent: ascent / unitPerEm,
                    descent: -descent / unitPerEm,
                    leading: leading / unitPerEm
                };
                // TODO: use a buffer to generate font data
                var dataBuffer = new Uint8Array(otf.length);
                for (var i = 0; i < otf.length; i++) {
                    dataBuffer[i] = otf.charCodeAt(i) & 0xff;
                }
                font.codes = originalCode;
                font.metrics = metrics;
                font.data = dataBuffer;
                return font;
            }
            Parser.defineFont = defineFont;
        })(Parser = SWF.Parser || (SWF.Parser = {}));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2013 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            var Inflate = Shumway.ArrayUtilities.Inflate;
            /**
             * Reads the next two bytes at the specified position.
             */
            function readUint16(bytes, position) {
                return (bytes[position] << 8) | bytes[position + 1];
            }
            /**
             * Reads the next four bytes at the specified position.
             */
            function readInt32(bytes, position) {
                return (bytes[position] << 24) | (bytes[position + 1] << 16) |
                    (bytes[position + 2] << 8) | bytes[position + 3];
            }
            /**
             * Parses JPEG chunks and reads image width and height information. JPEG data
             * in SWFs is encoded in chunks and not directly decodable by the JPEG parser.
             */
            function parseJpegChunks(bytes, chunks) {
                var i = 0;
                var n = bytes.length;
                // Finding first marker, and skipping the data before this marker.
                // (FF 00 - code is escaped FF; FF FF ... (FF xx) - fill bytes before marker).
                while (i < n && (bytes[i] !== 0xff ||
                    (i + 1 < n && (bytes[i + 1] === 0x00 || bytes[i + 1] === 0xff)))) {
                    ++i;
                }
                if (i >= n) {
                    return; // no valid data was found
                }
                do {
                    release || Shumway.Debug.assert(bytes[i] === 0xff);
                    var begin = i++;
                    var code = bytes[i++];
                    // Some tags have length field -- using it
                    if ((code >= 0xc0 && code <= 0xc7) || (code >= 0xc9 && code <= 0xcf) ||
                        (code >= 0xda && code <= 0xef) || code === 0xfe) {
                        var length = readUint16(bytes, i);
                        i += length;
                    }
                    // Finding next marker.
                    while (i < n && (bytes[i] !== 0xff ||
                        (i + 1 < n && (bytes[i + 1] === 0x00 || bytes[i + 1] === 0xff)))) {
                        ++i;
                    }
                    if (code === 0xd8 || code === 0xd9) {
                        // Removing SOI and EOI to avoid wrong EOI-SOI pairs in the middle.
                        continue;
                    }
                    chunks.push(bytes.subarray(begin, i));
                } while (i < n);
            }
            Parser.parseJpegChunks = parseJpegChunks;
            /**
             * Extracts PNG width and height information.
             */
            function parsePngHeaders(image, bytes) {
                var ihdrOffset = 12;
                if (bytes[ihdrOffset] !== 0x49 || bytes[ihdrOffset + 1] !== 0x48 ||
                    bytes[ihdrOffset + 2] !== 0x44 || bytes[ihdrOffset + 3] !== 0x52) {
                    return;
                }
                image.width = readInt32(bytes, ihdrOffset + 4);
                image.height = readInt32(bytes, ihdrOffset + 8);
                var type = bytes[ihdrOffset + 14];
                image.hasAlpha = type === 4 || type === 6;
            }
            Parser.parsePngHeaders = parsePngHeaders;
            /**
             * Joins all the chunks in a larger byte array.
             */
            function joinChunks(chunks) {
                var length = 0;
                for (var i = 0; i < chunks.length; i++) {
                    length += chunks[i].length;
                }
                var bytes = new Uint8Array(length);
                var offset = 0;
                for (var i = 0; i < chunks.length; i++) {
                    var chunk = chunks[i];
                    bytes.set(chunk, offset);
                    offset += chunk.length;
                }
                return bytes;
            }
            function injectJPEGTables(chunks, state) {
                if (!state.parsedChunks) {
                    var parsedChunks = [];
                    parseJpegChunks(state.data, parsedChunks);
                    state.parsedChunks = parsedChunks;
                }
                // Finding first SOF and inserting tables there
                var i = 0;
                while (i < chunks.length &&
                    !(chunks[i][1] >= 0xc0 && chunks[i][1] <= 0xc0)) {
                    i++;
                }
                Array.prototype.splice.apply(chunks, Array.prototype.concat.call([i, 0], state.parsedChunks));
            }
            var JPEG_SOI = new Uint8Array([0xff, 0xd8]);
            var JPEG_EOI = new Uint8Array([0xff, 0xd9]);
            function defineImage(tag) {
                SWF.enterTimeline("defineImage");
                var image = {
                    type: 'image',
                    id: tag.id,
                    mimeType: tag.mimeType
                };
                var imgData = tag.imgData;
                if (tag.mimeType === 'image/jpeg') {
                    // Parsing/repairing the SWF JPEG data.
                    var chunks = [];
                    chunks.push(JPEG_SOI);
                    parseJpegChunks(imgData, chunks);
                    if (tag.jpegTables) {
                        injectJPEGTables(chunks, tag.jpegTables);
                    }
                    chunks.push(JPEG_EOI);
                    // Finding SOF to extract image size.
                    chunks.forEach(function (chunk) {
                        var code = chunk[1];
                        if (code >= 0xc0 && code <= 0xc3) {
                            image.height = readUint16(chunk, 5);
                            image.width = readUint16(chunk, 7);
                        }
                    });
                    image.data = joinChunks(chunks);
                    image.dataType = Shumway.ImageType.JPEG;
                    var alphaData = tag.alphaData;
                    if (alphaData) {
                        var length = image.width * image.height;
                        try {
                            image.alphaData = Inflate.inflate(alphaData, length, true);
                        }
                        catch (e) {
                            // Alpha layer is invalid, so hiding everything.
                            image.alphaData = new Uint8Array(length);
                        }
                    }
                }
                else {
                    parsePngHeaders(image, imgData);
                    image.data = imgData;
                    image.dataType = Shumway.ImageType.PNG;
                }
                SWF.leaveTimeline();
                return image;
            }
            Parser.defineImage = defineImage;
        })(Parser = SWF.Parser || (SWF.Parser = {}));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path='references.ts'/>
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            function defineLabel(tag) {
                var label = {
                    type: 'label',
                    id: tag.id,
                    fillBounds: tag.bbox,
                    matrix: tag.matrix,
                    tag: {
                        hasText: true,
                        initialText: '',
                        html: true,
                        readonly: true
                    },
                    records: tag.records,
                    coords: null,
                    static: true,
                    require: null
                };
                return label;
            }
            Parser.defineLabel = defineLabel;
        })(Parser = SWF.Parser || (SWF.Parser = {}));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path='references.ts'/>
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var ShapeData = Shumway.ShapeData;
            var clamp = Shumway.NumberUtilities.clamp;
            var assert = Shumway.Debug.assert;
            var assertUnreachable = Shumway.Debug.assertUnreachable;
            var push = Array.prototype.push;
            var FillType;
            (function (FillType) {
                FillType[FillType["Solid"] = 0] = "Solid";
                FillType[FillType["LinearGradient"] = 16] = "LinearGradient";
                FillType[FillType["RadialGradient"] = 18] = "RadialGradient";
                FillType[FillType["FocalRadialGradient"] = 19] = "FocalRadialGradient";
                FillType[FillType["RepeatingBitmap"] = 64] = "RepeatingBitmap";
                FillType[FillType["ClippedBitmap"] = 65] = "ClippedBitmap";
                FillType[FillType["NonsmoothedRepeatingBitmap"] = 66] = "NonsmoothedRepeatingBitmap";
                FillType[FillType["NonsmoothedClippedBitmap"] = 67] = "NonsmoothedClippedBitmap";
            })(FillType || (FillType = {}));
            /*
             * Applies the current segment to the paths of all styles specified in the last
             * style-change record.
             *
             * For fill0, we have to apply commands and their data in reverse order, to turn
             * left fills into right ones.
             *
             * If we have more than one style, we only recorded commands for the first one
             * and have to duplicate them for the other styles. The order is: fill1, line,
             * fill0. (That means we only ever recorded into fill0 if that's the only style.)
             */
            function applySegmentToStyles(segment, styles, linePaths, fillPaths) {
                if (!segment) {
                    return;
                }
                var path;
                if (styles.fill0) {
                    path = fillPaths[styles.fill0 - 1];
                    // If fill0 is the only style, we have pushed the segment to its stack. In
                    // that case, just mark it as reversed and move on.
                    if (!(styles.fill1 || styles.line)) {
                        segment.isReversed = true;
                        return;
                    }
                    else {
                        path.addSegment(segment.toReversed());
                    }
                }
                if (styles.line && styles.fill1) {
                    path = linePaths[styles.line - 1];
                    path.addSegment(segment.clone());
                }
            }
            /*
             * Converts records from the space-optimized format they're stored in to a
             * format that's more amenable to fast rendering.
             *
             * See http://blogs.msdn.com/b/mswanson/archive/2006/02/27/539749.aspx and
             * http://wahlers.com.br/claus/blog/hacking-swf-1-shapes-in-flash/ for details.
             */
            function convertRecordsToShapeData(records, fillPaths, linePaths, dependencies, recordsMorph) {
                var isMorph = recordsMorph !== null;
                var styles = { fill0: 0, fill1: 0, line: 0 };
                var segment = null;
                // Fill- and line styles can be added by style change records in the middle of
                // a shape records list. This also causes the previous paths to be treated as
                // a group, so the lines don't get moved on top of any following fills.
                // To support this, we just append all current fill and line paths to a list
                // when new styles are introduced.
                var allPaths;
                // If no style is set for a segment of a path, a 1px transparent line is used.
                var defaultPath;
                var numRecords = records.length;
                var x = 0;
                var y = 0;
                var morphX = 0;
                var morphY = 0;
                var path;
                for (var i = 0, j = 0; i < numRecords; i++) {
                    var record = records[i];
                    var morphRecord;
                    if (isMorph) {
                        morphRecord = recordsMorph[j++];
                    }
                    // type 0 is a StyleChange record
                    if (record.type === 0) {
                        //TODO: make the `has*` fields bitflags
                        if (segment) {
                            applySegmentToStyles(segment, styles, linePaths, fillPaths);
                        }
                        if (record.flags & 16 /* HasNewStyles */) {
                            if (!allPaths) {
                                allPaths = [];
                            }
                            push.apply(allPaths, fillPaths);
                            fillPaths = createPathsList(record.fillStyles, false, isMorph, dependencies);
                            push.apply(allPaths, linePaths);
                            linePaths = createPathsList(record.lineStyles, true, isMorph, dependencies);
                            if (defaultPath) {
                                allPaths.push(defaultPath);
                                defaultPath = null;
                            }
                            styles = { fill0: 0, fill1: 0, line: 0 };
                        }
                        if (record.flags & 2 /* HasFillStyle0 */) {
                            styles.fill0 = record.fillStyle0;
                        }
                        if (record.flags & 4 /* HasFillStyle1 */) {
                            styles.fill1 = record.fillStyle1;
                        }
                        if (record.flags & 8 /* HasLineStyle */) {
                            styles.line = record.lineStyle;
                        }
                        if (styles.fill1) {
                            path = fillPaths[styles.fill1 - 1];
                        }
                        else if (styles.line) {
                            path = linePaths[styles.line - 1];
                        }
                        else if (styles.fill0) {
                            path = fillPaths[styles.fill0 - 1];
                        }
                        if (record.flags & 1 /* Move */) {
                            x = record.moveX | 0;
                            y = record.moveY | 0;
                        }
                        // Very first record can be just fill/line-style definition record.
                        if (path) {
                            segment = PathSegment.FromDefaults(isMorph);
                            path.addSegment(segment);
                            // Move or not, we want this path segment to start where the last one
                            // left off. Even if the last one belonged to a different style.
                            // "Huh," you say? Yup.
                            if (!isMorph) {
                                segment.moveTo(x, y);
                            }
                            else {
                                if (morphRecord.type === 0) {
                                    morphX = morphRecord.moveX | 0;
                                    morphY = morphRecord.moveY | 0;
                                }
                                else {
                                    morphX = x;
                                    morphY = y;
                                    // Not all moveTos are reflected in morph data.
                                    // In that case, decrease morph data index.
                                    j--;
                                }
                                segment.morphMoveTo(x, y, morphX, morphY);
                            }
                        }
                    }
                    else {
                        release || assert(record.type === 1);
                        if (!segment) {
                            if (!defaultPath) {
                                var style = { color: { red: 0, green: 0, blue: 0, alpha: 0 }, width: 20 };
                                defaultPath = new SegmentedPath(null, processStyle(style, true, isMorph, dependencies));
                            }
                            segment = PathSegment.FromDefaults(isMorph);
                            defaultPath.addSegment(segment);
                            if (!isMorph) {
                                segment.moveTo(x, y);
                            }
                            else {
                                segment.morphMoveTo(x, y, morphX, morphY);
                            }
                        }
                        if (isMorph) {
                            // An invalid SWF might contain a move in the EndEdges list where the
                            // StartEdges list contains an edge. The Flash Player seems to skip it,
                            // so we do, too.
                            while (morphRecord && morphRecord.type === 0) {
                                morphRecord = recordsMorph[j++];
                            }
                            // The EndEdges list might be shorter than the StartEdges list. Reuse
                            // start edges as end edges in that case.
                            if (!morphRecord) {
                                morphRecord = record;
                            }
                        }
                        if (record.flags & 32 /* IsStraight */ &&
                            (!isMorph || (morphRecord.flags & 32 /* IsStraight */))) {
                            x += record.deltaX | 0;
                            y += record.deltaY | 0;
                            if (!isMorph) {
                                segment.lineTo(x, y);
                            }
                            else {
                                morphX += morphRecord.deltaX | 0;
                                morphY += morphRecord.deltaY | 0;
                                segment.morphLineTo(x, y, morphX, morphY);
                            }
                        }
                        else {
                            var cx, cy;
                            var deltaX, deltaY;
                            if (!(record.flags & 32 /* IsStraight */)) {
                                cx = x + record.controlDeltaX | 0;
                                cy = y + record.controlDeltaY | 0;
                                x = cx + record.anchorDeltaX | 0;
                                y = cy + record.anchorDeltaY | 0;
                            }
                            else {
                                deltaX = record.deltaX | 0;
                                deltaY = record.deltaY | 0;
                                cx = x + (deltaX >> 1);
                                cy = y + (deltaY >> 1);
                                x += deltaX;
                                y += deltaY;
                            }
                            if (!isMorph) {
                                segment.curveTo(cx, cy, x, y);
                            }
                            else {
                                if (!(morphRecord.flags & 32 /* IsStraight */)) {
                                    var morphCX = morphX + morphRecord.controlDeltaX | 0;
                                    var morphCY = morphY + morphRecord.controlDeltaY | 0;
                                    morphX = morphCX + morphRecord.anchorDeltaX | 0;
                                    morphY = morphCY + morphRecord.anchorDeltaY | 0;
                                }
                                else {
                                    deltaX = morphRecord.deltaX | 0;
                                    deltaY = morphRecord.deltaY | 0;
                                    var morphCX = morphX + (deltaX >> 1);
                                    var morphCY = morphY + (deltaY >> 1);
                                    morphX += deltaX;
                                    morphY += deltaY;
                                }
                                segment.morphCurveTo(cx, cy, x, y, morphCX, morphCY, morphX, morphY);
                            }
                        }
                    }
                }
                applySegmentToStyles(segment, styles, linePaths, fillPaths);
                // All current paths get appended to the allPaths list at the end. First fill,
                // then line paths.
                if (allPaths) {
                    push.apply(allPaths, fillPaths);
                }
                else {
                    allPaths = fillPaths;
                }
                push.apply(allPaths, linePaths);
                if (defaultPath) {
                    allPaths.push(defaultPath);
                }
                var shape = new ShapeData();
                if (isMorph) {
                    shape.morphCoordinates = new Int32Array(shape.coordinates.length);
                    shape.morphStyles = new DataBuffer(16);
                }
                for (i = 0; i < allPaths.length; i++) {
                    allPaths[i].serialize(shape);
                }
                return shape;
            }
            var IDENTITY_MATRIX = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
            function processStyle(style, isLineStyle, isMorph, dependencies) {
                var shapeStyle = style;
                if (isMorph) {
                    shapeStyle.morph = processMorphStyle(style, isLineStyle, dependencies);
                }
                if (isLineStyle) {
                    shapeStyle.miterLimit = (style.miterLimitFactor || 1.5) * 2;
                    if (!style.color && style.hasFill) {
                        var fillStyle = processStyle(style.fillStyle, false, false, dependencies);
                        shapeStyle.type = fillStyle.type;
                        shapeStyle.transform = fillStyle.transform;
                        shapeStyle.colors = fillStyle.colors;
                        shapeStyle.ratios = fillStyle.ratios;
                        shapeStyle.focalPoint = fillStyle.focalPoint;
                        shapeStyle.bitmapId = fillStyle.bitmapId;
                        shapeStyle.bitmapIndex = fillStyle.bitmapIndex;
                        shapeStyle.repeat = fillStyle.repeat;
                        style.fillStyle = null;
                        return shapeStyle;
                    }
                    else {
                        shapeStyle.type = FillType.Solid;
                        return shapeStyle;
                    }
                }
                if (style.type === undefined || style.type === FillType.Solid) {
                    return shapeStyle;
                }
                var scale;
                switch (style.type) {
                    case FillType.LinearGradient:
                    case FillType.RadialGradient:
                    case FillType.FocalRadialGradient:
                        var records = style.records;
                        var colors = shapeStyle.colors = [];
                        var ratios = shapeStyle.ratios = [];
                        for (var i = 0; i < records.length; i++) {
                            var record = records[i];
                            colors.push(record.color);
                            ratios.push(record.ratio);
                        }
                        scale = 819.2;
                        break;
                    case FillType.RepeatingBitmap:
                    case FillType.ClippedBitmap:
                    case FillType.NonsmoothedRepeatingBitmap:
                    case FillType.NonsmoothedClippedBitmap:
                        shapeStyle.smooth = style.type !== FillType.NonsmoothedRepeatingBitmap &&
                            style.type !== FillType.NonsmoothedClippedBitmap;
                        shapeStyle.repeat = style.type !== FillType.ClippedBitmap &&
                            style.type !== FillType.NonsmoothedClippedBitmap;
                        var index = dependencies.indexOf(style.bitmapId);
                        if (index === -1) {
                            index = dependencies.length;
                            dependencies.push(style.bitmapId);
                        }
                        shapeStyle.bitmapIndex = index;
                        scale = 0.05;
                        break;
                    default:
                        Shumway.Debug.warning('shape parser encountered invalid fill style ' + style.type);
                }
                if (!style.matrix) {
                    shapeStyle.transform = IDENTITY_MATRIX;
                    return shapeStyle;
                }
                var matrix = style.matrix;
                shapeStyle.transform = {
                    a: (matrix.a * scale),
                    b: (matrix.b * scale),
                    c: (matrix.c * scale),
                    d: (matrix.d * scale),
                    tx: matrix.tx / 20,
                    ty: matrix.ty / 20
                };
                // null data that's unused from here on out
                style.matrix = null;
                return shapeStyle;
            }
            function processMorphStyle(style, isLineStyle, dependencies) {
                var morphStyle = Object.create(style);
                if (isLineStyle) {
                    morphStyle.width = style.widthMorph;
                    if (!style.color && style.hasFill) {
                        var fillStyle = processMorphStyle(style.fillStyle, false, dependencies);
                        morphStyle.transform = fillStyle.transform;
                        morphStyle.colors = fillStyle.colors;
                        morphStyle.ratios = fillStyle.ratios;
                        return morphStyle;
                    }
                    else {
                        morphStyle.color = style.colorMorph;
                        return morphStyle;
                    }
                }
                if (style.type === undefined) {
                    return morphStyle;
                }
                if (style.type === FillType.Solid) {
                    morphStyle.color = style.colorMorph;
                    return morphStyle;
                }
                var scale;
                switch (style.type) {
                    case FillType.LinearGradient:
                    case FillType.RadialGradient:
                    case FillType.FocalRadialGradient:
                        var records = style.records;
                        var colors = morphStyle.colors = [];
                        var ratios = morphStyle.ratios = [];
                        for (var i = 0; i < records.length; i++) {
                            var record = records[i];
                            colors.push(record.colorMorph);
                            ratios.push(record.ratioMorph);
                        }
                        scale = 819.2;
                        break;
                    case FillType.RepeatingBitmap:
                    case FillType.ClippedBitmap:
                    case FillType.NonsmoothedRepeatingBitmap:
                    case FillType.NonsmoothedClippedBitmap:
                        scale = 0.05;
                        break;
                    default:
                        release || assertUnreachable('shape parser encountered invalid fill style');
                }
                if (!style.matrix) {
                    morphStyle.transform = IDENTITY_MATRIX;
                    return morphStyle;
                }
                var matrix = style.matrixMorph;
                morphStyle.transform = {
                    a: (matrix.a * scale),
                    b: (matrix.b * scale),
                    c: (matrix.c * scale),
                    d: (matrix.d * scale),
                    tx: matrix.tx / 20,
                    ty: matrix.ty / 20
                };
                return morphStyle;
            }
            /*
             * Paths are stored in 2-dimensional arrays. Each of the inner arrays contains
             * all the paths for a certain fill or line style.
             */
            function createPathsList(styles, isLineStyle, isMorph, dependencies) {
                var paths = [];
                for (var i = 0; i < styles.length; i++) {
                    var style = processStyle(styles[i], isLineStyle, isMorph, dependencies);
                    if (!isLineStyle) {
                        paths[i] = new SegmentedPath(style, null);
                    }
                    else {
                        paths[i] = new SegmentedPath(null, style);
                    }
                }
                return paths;
            }
            function defineShape(tag) {
                var dependencies = [];
                var fillPaths = createPathsList(tag.fillStyles, false, !!tag.recordsMorph, dependencies);
                var linePaths = createPathsList(tag.lineStyles, true, !!tag.recordsMorph, dependencies);
                var shape = convertRecordsToShapeData(tag.records, fillPaths, linePaths, dependencies, tag.recordsMorph || null);
                return {
                    type: tag.flags & 8 /* IsMorph */ ? 'morphshape' : 'shape',
                    id: tag.id,
                    fillBounds: tag.fillBounds,
                    lineBounds: tag.lineBounds,
                    morphFillBounds: tag.fillBoundsMorph || null,
                    morphLineBounds: tag.lineBoundsMorph || null,
                    shape: shape.toPlainObject(),
                    transferables: shape.buffers,
                    require: dependencies.length ? dependencies : null
                };
            }
            Parser.defineShape = defineShape;
            var PathSegment = (function () {
                function PathSegment(commands, data, morphData, prev, next, isReversed) {
                    this.commands = commands;
                    this.data = data;
                    this.morphData = morphData;
                    this.prev = prev;
                    this.next = next;
                    this.isReversed = isReversed;
                    this.id = PathSegment._counter++;
                }
                PathSegment.FromDefaults = function (isMorph) {
                    var commands = new DataBuffer();
                    var data = new DataBuffer();
                    commands.endian = data.endian = 'auto';
                    var morphData = null;
                    if (isMorph) {
                        morphData = new DataBuffer();
                        morphData.endian = 'auto';
                    }
                    return new PathSegment(commands, data, morphData, null, null, false);
                };
                PathSegment.prototype.moveTo = function (x, y) {
                    this.commands.writeUnsignedByte(9 /* MoveTo */);
                    this.data.write2Ints(x, y);
                };
                PathSegment.prototype.morphMoveTo = function (x, y, mx, my) {
                    this.moveTo(x, y);
                    this.morphData.write2Ints(mx, my);
                };
                PathSegment.prototype.lineTo = function (x, y) {
                    this.commands.writeUnsignedByte(10 /* LineTo */);
                    this.data.write2Ints(x, y);
                };
                PathSegment.prototype.morphLineTo = function (x, y, mx, my) {
                    this.lineTo(x, y);
                    this.morphData.write2Ints(mx, my);
                };
                PathSegment.prototype.curveTo = function (cpx, cpy, x, y) {
                    this.commands.writeUnsignedByte(11 /* CurveTo */);
                    this.data.write4Ints(cpx, cpy, x, y);
                };
                PathSegment.prototype.morphCurveTo = function (cpx, cpy, x, y, mcpx, mcpy, mx, my) {
                    this.curveTo(cpx, cpy, x, y);
                    this.morphData.write4Ints(mcpx, mcpy, mx, my);
                };
                /**
                 * Returns a shallow copy of the segment with the "isReversed" flag set.
                 * Reversed segments play themselves back in reverse when they're merged into the final
                 * non-segmented path.
                 * Note: Don't modify the original, or the reversed copy, after this operation!
                 */
                PathSegment.prototype.toReversed = function () {
                    release || assert(!this.isReversed);
                    return new PathSegment(this.commands, this.data, this.morphData, null, null, true);
                };
                PathSegment.prototype.clone = function () {
                    return new PathSegment(this.commands, this.data, this.morphData, null, null, this.isReversed);
                };
                PathSegment.prototype.storeStartAndEnd = function () {
                    var data = this.data.ints;
                    var endPoint1 = data[0] + ',' + data[1];
                    var endPoint2Offset = (this.data.length >> 2) - 2;
                    var endPoint2 = data[endPoint2Offset] + ',' + data[endPoint2Offset + 1];
                    if (!this.isReversed) {
                        this.startPoint = endPoint1;
                        this.endPoint = endPoint2;
                    }
                    else {
                        this.startPoint = endPoint2;
                        this.endPoint = endPoint1;
                    }
                };
                PathSegment.prototype.connectsTo = function (other) {
                    release || assert(other !== this);
                    release || assert(this.endPoint);
                    release || assert(other.startPoint);
                    return this.endPoint === other.startPoint;
                };
                PathSegment.prototype.startConnectsTo = function (other) {
                    release || assert(other !== this);
                    return this.startPoint === other.startPoint;
                };
                PathSegment.prototype.flipDirection = function () {
                    var tempPoint = "";
                    tempPoint = this.startPoint;
                    this.startPoint = this.endPoint;
                    this.endPoint = tempPoint;
                    this.isReversed = !this.isReversed;
                };
                PathSegment.prototype.serialize = function (shape, lastPosition) {
                    if (this.isReversed) {
                        this._serializeReversed(shape, lastPosition);
                        return;
                    }
                    var commands = this.commands.bytes;
                    // Note: this *must* use `this.data.length`, because buffers will have padding.
                    var dataLength = this.data.length >> 2;
                    var morphData = this.morphData ? this.morphData.ints : null;
                    var data = this.data.ints;
                    release || assert(commands[0] === 9 /* MoveTo */);
                    // If the segment's first moveTo goes to the current coordinates, we have to skip it.
                    var offset = 0;
                    if (data[0] === lastPosition.x && data[1] === lastPosition.y) {
                        offset++;
                    }
                    var commandsCount = this.commands.length;
                    var dataPosition = offset * 2;
                    for (var i = offset; i < commandsCount; i++) {
                        dataPosition = this._writeCommand(commands[i], dataPosition, data, morphData, shape);
                    }
                    release || assert(dataPosition === dataLength);
                    lastPosition.x = data[dataLength - 2];
                    lastPosition.y = data[dataLength - 1];
                };
                PathSegment.prototype._serializeReversed = function (shape, lastPosition) {
                    // For reversing the fill0 segments, we rely on the fact that each segment
                    // starts with a moveTo. We first write a new moveTo with the final drawing command's
                    // target coordinates (if we don't skip it, see below). For each of the following
                    // commands, we take the coordinates of the command originally *preceding*
                    // it as the new target coordinates. The final coordinates we target will be
                    // the ones from the original first moveTo.
                    // Note: these *must* use `this.{data,commands}.length`, because buffers will have padding.
                    var commandsCount = this.commands.length;
                    var dataPosition = (this.data.length >> 2) - 2;
                    var commands = this.commands.bytes;
                    release || assert(commands[0] === 9 /* MoveTo */);
                    var data = this.data.ints;
                    var morphData = this.morphData ? this.morphData.ints : null;
                    // Only write the first moveTo if it doesn't go to the current coordinates.
                    if (data[dataPosition] !== lastPosition.x || data[dataPosition + 1] !== lastPosition.y) {
                        this._writeCommand(9 /* MoveTo */, dataPosition, data, morphData, shape);
                    }
                    if (commandsCount === 1) {
                        lastPosition.x = data[0];
                        lastPosition.y = data[1];
                        return;
                    }
                    for (var i = commandsCount; i-- > 1;) {
                        dataPosition -= 2;
                        var command = commands[i];
                        shape.writeCommandAndCoordinates(command, data[dataPosition], data[dataPosition + 1]);
                        if (morphData) {
                            shape.writeMorphCoordinates(morphData[dataPosition], morphData[dataPosition + 1]);
                        }
                        if (command === 11 /* CurveTo */) {
                            dataPosition -= 2;
                            shape.writeCoordinates(data[dataPosition], data[dataPosition + 1]);
                            if (morphData) {
                                shape.writeMorphCoordinates(morphData[dataPosition], morphData[dataPosition + 1]);
                            }
                        }
                        else {
                        }
                    }
                    release || assert(dataPosition === 0);
                    lastPosition.x = data[0];
                    lastPosition.y = data[1];
                };
                PathSegment.prototype._writeCommand = function (command, position, data, morphData, shape) {
                    shape.writeCommandAndCoordinates(command, data[position++], data[position++]);
                    if (morphData) {
                        shape.writeMorphCoordinates(morphData[position - 2], morphData[position - 1]);
                    }
                    if (command === 11 /* CurveTo */) {
                        shape.writeCoordinates(data[position++], data[position++]);
                        if (morphData) {
                            shape.writeMorphCoordinates(morphData[position - 2], morphData[position - 1]);
                        }
                    }
                    return position;
                };
                PathSegment._counter = 0;
                return PathSegment;
            })();
            var SegmentedPath = (function () {
                function SegmentedPath(fillStyle, lineStyle) {
                    this.fillStyle = fillStyle;
                    this.lineStyle = lineStyle;
                    this._head = null;
                }
                SegmentedPath.prototype.addSegment = function (segment) {
                    release || assert(segment);
                    release || assert(segment.next === null);
                    release || assert(segment.prev === null);
                    var currentHead = this._head;
                    if (currentHead) {
                        release || assert(segment !== currentHead);
                        currentHead.next = segment;
                        segment.prev = currentHead;
                    }
                    this._head = segment;
                };
                // Does *not* reset the segment's prev and next pointers!
                SegmentedPath.prototype.removeSegment = function (segment) {
                    if (segment.prev) {
                        segment.prev.next = segment.next;
                    }
                    if (segment.next) {
                        segment.next.prev = segment.prev;
                    }
                };
                SegmentedPath.prototype.insertSegment = function (segment, next) {
                    var prev = next.prev;
                    segment.prev = prev;
                    segment.next = next;
                    if (prev) {
                        prev.next = segment;
                    }
                    next.prev = segment;
                };
                SegmentedPath.prototype.head = function () {
                    return this._head;
                };
                SegmentedPath.prototype.serialize = function (shape) {
                    var segment = this.head();
                    if (!segment) {
                        // Path is empty.
                        return;
                    }
                    while (segment) {
                        segment.storeStartAndEnd();
                        segment = segment.prev;
                    }
                    var start = this.head();
                    var end = start;
                    var finalRoot = null;
                    var finalHead = null;
                    // Path segments for one style can appear in arbitrary order in the tag's list
                    // of edge records.
                    // Before we linearize them, we have to identify all pairs of segments where
                    // one ends at a coordinate the other starts at.
                    // The following loop does that, by creating ever-growing runs of matching
                    // segments. If no more segments are found that match the current run (either
                    // at the beginning, or at the end), the current run is complete, and a new
                    // one is started. Rinse, repeat, until no solitary segments remain.
                    var current = start.prev;
                    while (start) {
                        while (current) {
                            if (current.startConnectsTo(start)) {
                                current.flipDirection();
                            }
                            if (current.connectsTo(start)) {
                                if (current.next !== start) {
                                    this.removeSegment(current);
                                    this.insertSegment(current, start);
                                }
                                start = current;
                                current = start.prev;
                                continue;
                            }
                            if (current.startConnectsTo(end)) {
                                current.flipDirection();
                            }
                            if (end.connectsTo(current)) {
                                this.removeSegment(current);
                                end.next = current;
                                current = current.prev;
                                end.next.prev = end;
                                end.next.next = null;
                                end = end.next;
                                continue;
                            }
                            current = current.prev;
                        }
                        // This run of segments is finished. Store and forget it (for this loop).
                        current = start.prev;
                        if (!finalRoot) {
                            finalRoot = start;
                            finalHead = end;
                        }
                        else {
                            finalHead.next = start;
                            start.prev = finalHead;
                            finalHead = end;
                            finalHead.next = null;
                        }
                        if (!current) {
                            break;
                        }
                        start = end = current;
                        current = start.prev;
                    }
                    if (this.fillStyle) {
                        var style = this.fillStyle;
                        var morph = style.morph;
                        switch (style.type) {
                            case FillType.Solid:
                                shape.beginFill(style.color);
                                if (morph) {
                                    shape.writeMorphFill(morph.color);
                                }
                                break;
                            case FillType.LinearGradient:
                            case FillType.RadialGradient:
                            case FillType.FocalRadialGradient:
                                writeGradient(2 /* BeginGradientFill */, style, shape);
                                if (morph) {
                                    writeMorphGradient(morph, shape);
                                }
                                break;
                            case FillType.ClippedBitmap:
                            case FillType.RepeatingBitmap:
                            case FillType.NonsmoothedClippedBitmap:
                            case FillType.NonsmoothedRepeatingBitmap:
                                writeBitmap(3 /* BeginBitmapFill */, style, shape);
                                if (morph) {
                                    writeMorphBitmap(morph, shape);
                                }
                                break;
                            default:
                                release || assertUnreachable('Invalid fill style type: ' + style.type);
                        }
                    }
                    else {
                        var style = this.lineStyle;
                        var morph = style.morph;
                        release || assert(style);
                        switch (style.type) {
                            case FillType.Solid:
                                writeLineStyle(style, shape);
                                if (morph) {
                                    writeMorphLineStyle(morph, shape);
                                }
                                break;
                            case FillType.LinearGradient:
                            case FillType.RadialGradient:
                            case FillType.FocalRadialGradient:
                                writeLineStyle(style, shape);
                                writeGradient(6 /* LineStyleGradient */, style, shape);
                                if (morph) {
                                    writeMorphLineStyle(morph, shape);
                                    writeMorphGradient(morph, shape);
                                }
                                break;
                            case FillType.ClippedBitmap:
                            case FillType.RepeatingBitmap:
                            case FillType.NonsmoothedClippedBitmap:
                            case FillType.NonsmoothedRepeatingBitmap:
                                writeLineStyle(style, shape);
                                writeBitmap(7 /* LineStyleBitmap */, style, shape);
                                if (morph) {
                                    writeMorphLineStyle(morph, shape);
                                    writeMorphBitmap(morph, shape);
                                }
                                break;
                            default:
                        }
                    }
                    var lastPosition = { x: 0, y: 0 };
                    current = finalRoot;
                    while (current) {
                        current.serialize(shape, lastPosition);
                        current = current.next;
                    }
                    if (this.fillStyle) {
                        shape.endFill();
                    }
                    else {
                        shape.endLine();
                    }
                    return shape;
                };
                return SegmentedPath;
            })();
            function writeLineStyle(style, shape) {
                // No scaling == 0, normal == 1, vertical only == 2, horizontal only == 3.
                var scaleMode = style.noHscale ?
                    (style.noVscale ? 0 : 2) :
                    style.noVscale ? 3 : 1;
                // TODO: Figure out how to handle startCapsStyle
                var thickness = clamp(style.width, 0, 0xff * 20) | 0;
                shape.lineStyle(thickness, style.color, style.pixelHinting, scaleMode, style.endCapsStyle, style.jointStyle, style.miterLimit);
            }
            function writeMorphLineStyle(style, shape) {
                // TODO: Figure out how to handle startCapsStyle
                var thickness = clamp(style.width, 0, 0xff * 20) | 0;
                shape.writeMorphLineStyle(thickness, style.color);
            }
            function writeGradient(command, style, shape) {
                var gradientType = style.type === FillType.LinearGradient ?
                    16 /* Linear */ :
                    18 /* Radial */;
                shape.beginGradient(command, style.colors, style.ratios, gradientType, style.transform, style.spreadMethod, style.interpolationMode, style.focalPoint / 2 | 0);
            }
            function writeMorphGradient(style, shape) {
                shape.writeMorphGradient(style.colors, style.ratios, style.transform);
            }
            function writeBitmap(command, style, shape) {
                shape.beginBitmap(command, style.bitmapIndex, style.transform, style.repeat, style.smooth);
            }
            function writeMorphBitmap(style, shape) {
                shape.writeMorphBitmap(style.transform);
            }
        })(Parser = SWF.Parser || (SWF.Parser = {}));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path='references.ts'/>
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            var SOUND_SIZE_8_BIT = 0;
            var SOUND_SIZE_16_BIT = 1;
            var SOUND_TYPE_MONO = 0;
            var SOUND_TYPE_STEREO = 1;
            var SOUND_FORMAT_PCM_BE = 0;
            var SOUND_FORMAT_ADPCM = 1;
            var SOUND_FORMAT_MP3 = 2;
            var SOUND_FORMAT_PCM_LE = 3;
            var SOUND_FORMAT_NELLYMOSER_16 = 4;
            var SOUND_FORMAT_NELLYMOSER_8 = 5;
            var SOUND_FORMAT_NELLYMOSER = 6;
            var SOUND_FORMAT_SPEEX = 11;
            var SOUND_RATES = [5512, 11250, 22500, 44100];
            var WaveHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00,
                0x57, 0x41, 0x56, 0x45, 0x66, 0x6D, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00,
                0x01, 0x00, 0x02, 0x00, 0x44, 0xAC, 0x00, 0x00, 0x10, 0xB1, 0x02, 0x00,
                0x04, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00]);
            function packageWave(data, sampleRate, channels, size, swapBytes) {
                var sizeInBytes = size >> 3;
                var sizePerSecond = channels * sampleRate * sizeInBytes;
                var sizePerSample = channels * sizeInBytes;
                var dataLength = data.length + (data.length & 1);
                var buffer = new ArrayBuffer(WaveHeader.length + dataLength);
                var bytes = new Uint8Array(buffer);
                bytes.set(WaveHeader);
                if (swapBytes) {
                    for (var i = 0, j = WaveHeader.length; i < data.length; i += 2, j += 2) {
                        bytes[j] = data[i + 1];
                        bytes[j + 1] = data[i];
                    }
                }
                else {
                    bytes.set(data, WaveHeader.length);
                }
                var view = new DataView(buffer);
                view.setUint32(4, dataLength + 36, true);
                view.setUint16(22, channels, true);
                view.setUint32(24, sampleRate, true);
                view.setUint32(28, sizePerSecond, true);
                view.setUint16(32, sizePerSample, true);
                view.setUint16(34, size, true);
                view.setUint32(40, dataLength, true);
                return {
                    data: bytes,
                    mimeType: 'audio/wav'
                };
            }
            function defineSound(tag) {
                var channels = tag.soundType == SOUND_TYPE_STEREO ? 2 : 1;
                var samplesCount = tag.samplesCount;
                var sampleRate = SOUND_RATES[tag.soundRate];
                var data = tag.soundData;
                var pcm, packaged;
                switch (tag.soundFormat) {
                    case SOUND_FORMAT_PCM_BE:
                        pcm = new Float32Array(samplesCount * channels);
                        if (tag.soundSize == SOUND_SIZE_16_BIT) {
                            for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
                                pcm[i] = ((data[j] << 24) | (data[j + 1] << 16)) / 2147483648;
                            packaged = packageWave(data, sampleRate, channels, 16, true);
                        }
                        else {
                            for (var i = 0; i < pcm.length; i++)
                                pcm[i] = (data[i] - 128) / 128;
                            packaged = packageWave(data, sampleRate, channels, 8, false);
                        }
                        break;
                    case SOUND_FORMAT_PCM_LE:
                        pcm = new Float32Array(samplesCount * channels);
                        if (tag.soundSize == SOUND_SIZE_16_BIT) {
                            for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
                                pcm[i] = ((data[j + 1] << 24) | (data[j] << 16)) / 2147483648;
                            packaged = packageWave(data, sampleRate, channels, 16, false);
                        }
                        else {
                            for (var i = 0; i < pcm.length; i++)
                                pcm[i] = (data[i] - 128) / 128;
                            packaged = packageWave(data, sampleRate, channels, 8, false);
                        }
                        break;
                    case SOUND_FORMAT_MP3:
                        packaged = {
                            data: new Uint8Array(data.subarray(2)),
                            mimeType: 'audio/mpeg'
                        };
                        break;
                    case SOUND_FORMAT_ADPCM:
                        var pcm16 = new Int16Array(samplesCount * channels);
                        decodeACPCMSoundData(data, pcm16, channels);
                        pcm = new Float32Array(samplesCount * channels);
                        for (var i = 0; i < pcm.length; i++)
                            pcm[i] = pcm16[i] / 32768;
                        packaged = packageWave(new Uint8Array(pcm16.buffer), sampleRate, channels, 16, !(new Uint8Array(new Uint16Array([1]).buffer))[0]);
                        break;
                    default:
                        Shumway.Debug.warning('Unsupported audio format: ' + tag.soundFormat);
                }
                var sound = {
                    type: 'sound',
                    id: tag.id,
                    sampleRate: sampleRate,
                    channels: channels,
                    pcm: pcm,
                    packaged: null
                };
                if (packaged) {
                    sound.packaged = packaged;
                }
                return sound;
            }
            Parser.defineSound = defineSound;
            var ACPCMIndexTables = [
                [-1, 2],
                [-1, -1, 2, 4],
                [-1, -1, -1, -1, 2, 4, 6, 8],
                [-1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 4, 6, 8, 10, 13, 16]
            ];
            var ACPCMStepSizeTable = [
                7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45,
                50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209, 230,
                253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963,
                1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327,
                3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487,
                12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767
            ];
            function decodeACPCMSoundData(data, pcm16, channels) {
                function readBits(n) {
                    while (dataBufferLength < n) {
                        dataBuffer = (dataBuffer << 8) | data[dataPosition++];
                        dataBufferLength += 8;
                    }
                    dataBufferLength -= n;
                    return (dataBuffer >>> dataBufferLength) & ((1 << n) - 1);
                }
                var dataPosition = 0;
                var dataBuffer = 0;
                var dataBufferLength = 0;
                var pcmPosition = 0;
                var codeSize = readBits(2);
                var indexTable = ACPCMIndexTables[codeSize];
                while (pcmPosition < pcm16.length) {
                    var x = pcm16[pcmPosition++] = (readBits(16) << 16) >> 16, x2;
                    var stepIndex = readBits(6), stepIndex2;
                    if (channels > 1) {
                        x2 = pcm16[pcmPosition++] = (readBits(16) << 16) >> 16;
                        stepIndex2 = readBits(6);
                    }
                    var signMask = 1 << (codeSize + 1);
                    for (var i = 0; i < 4095; i++) {
                        var nibble = readBits(codeSize + 2);
                        var step = ACPCMStepSizeTable[stepIndex];
                        var sum = 0;
                        for (var currentBit = signMask >> 1; currentBit; currentBit >>= 1, step >>= 1) {
                            if (nibble & currentBit)
                                sum += step;
                        }
                        x += (nibble & signMask ? -1 : 1) * (sum + step);
                        pcm16[pcmPosition++] = (x = (x < -32768 ? -32768 : x > 32767 ? 32767 : x));
                        stepIndex += indexTable[nibble & ~signMask];
                        stepIndex = stepIndex < 0 ? 0 : stepIndex > 88 ? 88 : stepIndex;
                        if (channels > 1) {
                            nibble = readBits(codeSize + 2);
                            step = ACPCMStepSizeTable[stepIndex2];
                            sum = 0;
                            for (var currentBit = signMask >> 1; currentBit; currentBit >>= 1, step >>= 1) {
                                if (nibble & currentBit)
                                    sum += step;
                            }
                            x2 += (nibble & signMask ? -1 : 1) * (sum + step);
                            pcm16[pcmPosition++] = (x2 = (x2 < -32768 ? -32768 : x2 > 32767 ? 32767 : x2));
                            stepIndex2 += indexTable[nibble & ~signMask];
                            stepIndex2 = stepIndex2 < 0 ? 0 : stepIndex2 > 88 ? 88 : stepIndex2;
                        }
                    }
                }
            }
            var nextSoundStreamId = 0;
            var SoundStream = (function () {
                function SoundStream(samplesCount, sampleRate, channels) {
                    this.streamId = (nextSoundStreamId++);
                    this.samplesCount = samplesCount;
                    this.sampleRate = sampleRate;
                    this.channels = channels;
                    this.format = null;
                    this.currentSample = 0;
                }
                SoundStream.FromTag = function (tag) {
                    var channels = tag.streamType == SOUND_TYPE_STEREO ? 2 : 1;
                    var samplesCount = tag.samplesCount;
                    var sampleRate = SOUND_RATES[tag.streamRate];
                    var stream = new SoundStream(samplesCount, sampleRate, channels);
                    switch (tag.streamCompression) {
                        case SOUND_FORMAT_PCM_BE:
                        case SOUND_FORMAT_PCM_LE:
                            stream.format = 'wave';
                            if (tag.soundSize == SOUND_SIZE_16_BIT) {
                                stream.decode = tag.streamCompression === SOUND_FORMAT_PCM_BE ?
                                    SwfSoundStream_decode_PCM_be :
                                    SwfSoundStream_decode_PCM_le;
                            }
                            else {
                                stream.decode = SwfSoundStream_decode_PCM;
                            }
                            break;
                        case SOUND_FORMAT_MP3:
                            stream.format = 'mp3';
                            stream.decode = SwfSoundStream_decode_MP3;
                            break;
                        default:
                            Shumway.Debug.warning('Unsupported audio stream format: ' + tag.streamCompression);
                            return null;
                    }
                    return stream;
                };
                return SoundStream;
            })();
            Parser.SoundStream = SoundStream;
            function SwfSoundStream_decode_PCM(data) {
                var pcm = new Float32Array(data.length);
                for (var i = 0; i < pcm.length; i++)
                    pcm[i] = (data[i] - 128) / 128;
                this.currentSample += pcm.length / this.channels;
                return {
                    streamId: this.streamId,
                    samplesCount: pcm.length / this.channels,
                    pcm: pcm
                };
            }
            function SwfSoundStream_decode_PCM_be(data) {
                var pcm = new Float32Array(data.length / 2);
                for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
                    pcm[i] = ((data[j] << 24) | (data[j + 1] << 16)) / 2147483648;
                this.currentSample += pcm.length / this.channels;
                return {
                    streamId: this.streamId,
                    samplesCount: pcm.length / this.channels,
                    pcm: pcm
                };
            }
            function SwfSoundStream_decode_PCM_le(data) {
                var pcm = new Float32Array(data.length / 2);
                for (var i = 0, j = 0; i < pcm.length; i++, j += 2)
                    pcm[i] = ((data[j + 1] << 24) | (data[j] << 16)) / 2147483648;
                this.currentSample += pcm.length / this.channels;
                return {
                    streamId: this.streamId,
                    samplesCount: pcm.length / this.channels,
                    pcm: pcm
                };
            }
            function SwfSoundStream_decode_MP3(data) {
                var samplesCount = (data[1] << 8) | data[0];
                var seek = (data[3] << 8) | data[2];
                this.currentSample += samplesCount;
                return {
                    streamId: this.streamId,
                    samplesCount: samplesCount,
                    data: new Uint8Array(data.subarray(4)),
                    seek: seek
                };
            }
        })(Parser = SWF.Parser || (SWF.Parser = {}));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path='references.ts'/>
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            function defineText(tag) {
                var bold = false;
                var italic = false;
                return {
                    type: 'text',
                    id: tag.id,
                    fillBounds: tag.bbox,
                    variableName: tag.variableName,
                    tag: tag,
                    bold: bold,
                    italic: italic
                };
            }
            Parser.defineText = defineText;
        })(Parser = SWF.Parser || (SWF.Parser = {}));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
///<reference path='../references.ts' />
///<reference path='module.ts' />
///<reference path='bitmap.ts' />
///<reference path='button.ts' />
///<reference path='font.ts' />
///<reference path='image.ts' />
///<reference path='label.ts' />
///<reference path='shape.ts' />
///<reference path='sound.ts' />
///<reference path='text.ts' />
/*
 * Copyright 2013 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        SWF.timelineBuffer = Shumway.Tools ? new Shumway.Tools.Profiler.TimelineBuffer("Parser") : null;
        function enterTimeline(name, data) {
            profile && SWF.timelineBuffer && SWF.timelineBuffer.enter(name, data);
        }
        SWF.enterTimeline = enterTimeline;
        function leaveTimeline(data) {
            profile && SWF.timelineBuffer && SWF.timelineBuffer.leave(null, data);
        }
        SWF.leaveTimeline = leaveTimeline;
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Option = Shumway.Options.Option;
        var OptionSet = Shumway.Options.OptionSet;
        var shumwayOptions = Shumway.Settings.shumwayOptions;
        SWF.parserOptions = shumwayOptions.register(new OptionSet("Parser Options"));
        SWF.traceLevel = SWF.parserOptions.register(new Option("parsertracelevel", "Parser Trace Level", "number", 0, "Parser Trace Level"));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2013 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        SWF.StreamNoDataError = {};
        var masks = new Uint32Array(33);
        for (var i = 1, mask = 0; i <= 32; ++i) {
            masks[i] = mask = (mask << 1) | 1;
        }
        var Stream = (function () {
            function Stream(buffer, offset, length, maxLength) {
                if (offset === undefined)
                    offset = 0;
                if (buffer.buffer instanceof ArrayBuffer) {
                    offset += buffer.byteOffset;
                    buffer = buffer.buffer;
                }
                if (length === undefined)
                    length = buffer.byteLength - offset;
                if (maxLength === undefined)
                    maxLength = length;
                this.bytes = new Uint8Array(buffer, offset, maxLength);
                this.view = new DataView(buffer, offset, maxLength);
                this.pos = 0;
                this.end = length;
                this.bitBuffer = 0;
                this.bitLength = 0;
            }
            Stream.prototype.align = function () {
                this.bitBuffer = this.bitLength = 0;
            };
            Stream.prototype.ensure = function (size) {
                if (this.pos + size > this.end) {
                    throw SWF.StreamNoDataError;
                }
            };
            Stream.prototype.remaining = function () {
                return this.end - this.pos;
            };
            Stream.prototype.substream = function (begin, end) {
                var stream = new Stream(this.bytes);
                stream.pos = begin;
                stream.end = end;
                return stream;
            };
            Stream.prototype.push = function (data) {
                var bytes = this.bytes;
                var newBytesLength = this.end + data.length;
                if (newBytesLength > bytes.length) {
                    throw 'stream buffer overfow';
                }
                bytes.set(data, this.end);
                this.end = newBytesLength;
            };
            Stream.prototype.readSi8 = function () {
                return this.view.getInt8(this.pos++);
            };
            Stream.prototype.readSi16 = function () {
                var r = this.view.getInt16(this.pos, true);
                this.pos += 2;
                return r;
            };
            Stream.prototype.readSi32 = function () {
                var r = this.view.getInt32(this.pos, true);
                this.pos += 4;
                return r;
            };
            Stream.prototype.readUi8 = function () {
                return this.bytes[this.pos++];
            };
            Stream.prototype.readUi16 = function () {
                var r = this.view.getUint16(this.pos, true);
                this.pos += 2;
                return r;
            };
            Stream.prototype.readUi32 = function () {
                var r = this.view.getUint32(this.pos, true);
                this.pos += 4;
                return r;
            };
            Stream.prototype.readFixed = function () {
                var r = this.view.getInt32(this.pos, true) / 65536;
                this.pos += 4;
                return r;
            };
            Stream.prototype.readFixed8 = function () {
                var r = this.view.getInt16(this.pos, true) / 256;
                this.pos += 2;
                return r;
            };
            Stream.prototype.readFloat16 = function () {
                var ui16 = this.view.getUint16(this.pos, false);
                this.pos += 2;
                var sign = ui16 >> 15 ? -1 : 1;
                var exponent = (ui16 & 0x7c00) >> 10;
                var fraction = ui16 & 0x03ff;
                if (!exponent)
                    return sign * Math.pow(2, -14) * (fraction / 1024);
                if (exponent === 0x1f)
                    return fraction ? NaN : sign * Infinity;
                return sign * Math.pow(2, exponent - 15) * (1 + (fraction / 1024));
            };
            Stream.prototype.readFloat = function () {
                var r = this.view.getFloat32(this.pos, true);
                this.pos += 4;
                return r;
            };
            Stream.prototype.readDouble = function () {
                var r = this.view.getFloat64(this.pos, true);
                this.pos += 8;
                return r;
            };
            Stream.prototype.readEncodedU32 = function () {
                var bytes = this.bytes;
                var val = bytes[this.pos++];
                if (!(val & 0x080))
                    return val;
                val = (val & 0x7f) | bytes[this.pos++] << 7;
                if (!(val & 0x4000))
                    return val;
                val = (val & 0x3fff) | bytes[this.pos++] << 14;
                if (!(val & 0x200000))
                    return val;
                val = (val & 0x1FFFFF) | bytes[this.pos++] << 21;
                if (!(val & 0x10000000))
                    return val;
                return (val & 0xFFFFFFF) | (bytes[this.pos++] << 28);
            };
            Stream.prototype.readBool = function () {
                return !!this.bytes[this.pos++];
            };
            Stream.prototype.readSb = function (size) {
                return (this.readUb(size) << (32 - size)) >> (32 - size);
            };
            Stream.prototype.readUb = function (size) {
                var buffer = this.bitBuffer;
                var bitlen = this.bitLength;
                var val = 0;
                while (size > bitlen) {
                    if (bitlen > 24) {
                        // Avoid overflow. Save current buffer in val and add remaining bits later.
                        size -= bitlen;
                        val = buffer << size;
                        bitlen = 0;
                    }
                    buffer = (buffer << 8) | this.bytes[this.pos++];
                    bitlen += 8;
                }
                bitlen -= size;
                val |= (buffer >>> bitlen) & masks[size];
                this.bitBuffer = buffer;
                this.bitLength = bitlen;
                return val;
            };
            Stream.prototype.readFb = function (size) {
                return this.readSb(size) / 65536;
            };
            Stream.prototype.readString = function (length) {
                var bytes = this.bytes;
                var codes;
                var pos = this.pos;
                if (length > -1) {
                    codes = bytes.subarray(pos, pos += length);
                }
                else {
                    length = 0;
                    for (var i = pos; bytes[i]; i++) {
                        length++;
                    }
                    codes = bytes.subarray(pos, pos += length);
                    pos++;
                }
                this.pos = pos;
                var str = Shumway.StringUtilities.utf8encode(codes);
                if (str.indexOf('\0') >= 0) {
                    str = str.split('\0').join('');
                }
                return str;
            };
            return Stream;
        })();
        SWF.Stream = Stream;
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        SWF.MP3WORKER_PATH = '../../lib/mp3/mp3worker.js';
        var mp3Worker = null;
        function ensureMP3Worker() {
            if (!mp3Worker) {
                mp3Worker = new Worker(SWF.MP3WORKER_PATH);
                mp3Worker.addEventListener('message', function (e) {
                    if (e.data.action === 'console') {
                        console[e.data.method].call(console, e.data.message);
                    }
                });
            }
            return mp3Worker;
        }
        var nextSessionId = 0;
        var MP3DecoderSession = (function () {
            function MP3DecoderSession() {
                this._sessionId = (nextSessionId++);
                this._onworkermessageBound = this.onworkermessage.bind(this);
                this._worker = ensureMP3Worker();
                this._worker.addEventListener('message', this._onworkermessageBound, false);
                this._worker.postMessage({
                    sessionId: this._sessionId,
                    action: 'create'
                });
            }
            MP3DecoderSession.prototype.onworkermessage = function (e) {
                if (e.data.sessionId !== this._sessionId)
                    return;
                var action = e.data.action;
                switch (action) {
                    case 'closed':
                        if (this.onclosed) {
                            this.onclosed();
                        }
                        this._worker.removeEventListener('message', this._onworkermessageBound, false);
                        this._worker = null;
                        break;
                    case 'frame':
                        this.onframedata(e.data.frameData, e.data.channels, e.data.sampleRate, e.data.bitRate);
                        break;
                    case 'id3':
                        if (this.onid3tag) {
                            this.onid3tag(e.data.id3Data);
                        }
                        break;
                    case 'error':
                        if (this.onerror) {
                            this.onerror(e.data.message);
                        }
                        break;
                }
            };
            MP3DecoderSession.prototype.pushAsync = function (data) {
                this._worker.postMessage({
                    sessionId: this._sessionId,
                    action: 'decode',
                    data: data
                });
            };
            MP3DecoderSession.prototype.close = function () {
                this._worker.postMessage({
                    sessionId: this._sessionId,
                    action: 'close'
                });
            };
            MP3DecoderSession.processAll = function (data) {
                var currentBufferSize = 8000;
                var currentBuffer = new Float32Array(currentBufferSize);
                var bufferPosition = 0;
                var id3Tags = [];
                var sessionAborted = false;
                var promiseWrapper = new Shumway.PromiseWrapper();
                var session = new MP3DecoderSession();
                session.onframedata = function (frameData, channels, sampleRate, bitRate) {
                    var needed = frameData.length + bufferPosition;
                    if (needed > currentBufferSize) {
                        do {
                            currentBufferSize *= 2;
                        } while (needed > currentBufferSize);
                        var newBuffer = new Float32Array(currentBufferSize);
                        newBuffer.set(currentBuffer);
                        currentBuffer = newBuffer;
                    }
                    currentBuffer.set(frameData, bufferPosition);
                    bufferPosition += frameData.length;
                };
                session.onid3tag = function (tagData) {
                    id3Tags.push(tagData);
                };
                session.onclosed = function () {
                    if (sessionAborted)
                        return;
                    promiseWrapper.resolve({ data: currentBuffer.subarray(0, bufferPosition), id3Tags: id3Tags });
                };
                session.onerror = function (error) {
                    if (sessionAborted)
                        return;
                    sessionAborted = true;
                    promiseWrapper.reject(error);
                };
                session.pushAsync(data);
                session.close();
                return promiseWrapper.promise;
            };
            return MP3DecoderSession;
        })();
        SWF.MP3DecoderSession = MP3DecoderSession;
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var assert = Shumway.Debug.assert;
        var Parser = Shumway.SWF.Parser;
        var Stream = SWF.Stream;
        var Inflate = Shumway.ArrayUtilities.Inflate;
        var LzmaDecoder = Shumway.ArrayUtilities.LzmaDecoder;
        var DefinitionTags = Parser.DefinitionTags;
        var ImageDefinitionTags = Parser.ImageDefinitionTags;
        var FontDefinitionTags = Parser.FontDefinitionTags;
        var ControlTags = Parser.ControlTags;
        var getSwfTagCodeName = Parser.getSwfTagCodeName;
        var SWFFile = (function () {
            function SWFFile(initialBytes, length, env) {
                // TODO: cleanly abort loading/parsing instead of just asserting here.
                release || assert(initialBytes[0] === 67 || initialBytes[0] === 70 || initialBytes[0] === 90, "Unsupported compression format: " + initialBytes[0]);
                release || assert(initialBytes[1] === 87);
                release || assert(initialBytes[2] === 83);
                release || assert(initialBytes.length >= 30, "At least the header must be complete here.");
                if (!release && SWF.traceLevel.value > 0) {
                    console.log('Create SWFFile');
                }
                this.env = env;
                this.compression = 0 /* None */;
                this.swfVersion = 0;
                this.useAVM1 = true;
                this.backgroundColor = 0xffffffff;
                this.bounds = null;
                this.frameRate = 0;
                this.frameCount = 0;
                this.attributes = null;
                this.sceneAndFrameLabelData = null;
                this.bytesLoaded = 0;
                this.bytesTotal = length;
                this.pendingUpdateDelays = 0;
                this.framesLoaded = 0;
                this.frames = [];
                this.abcBlocks = [];
                this.dictionary = [];
                this.fonts = [];
                this.symbolClassesMap = [];
                this.symbolClassesList = [];
                this.eagerlyParsedSymbolsMap = [];
                this.eagerlyParsedSymbolsList = [];
                this._jpegTables = null;
                this._currentFrameLabel = null;
                this._currentSoundStreamHead = null;
                this._currentSoundStreamBlock = null;
                this._currentControlTags = null;
                this._currentActionBlocks = null;
                this._currentInitActionBlocks = null;
                this._currentExports = null;
                this._endTagEncountered = false;
                this.readHeaderAndInitialize(initialBytes);
            }
            SWFFile.prototype.appendLoadedData = function (bytes) {
                // TODO: only report decoded or sync-decodable bytes as loaded.
                this.bytesLoaded += bytes.length;
                release || assert(this.bytesLoaded <= this.bytesTotal);
                // Tags after the end tag are simply ignored, so we don't even have to scan them.
                if (this._endTagEncountered) {
                    return;
                }
                if (this.compression !== 0 /* None */) {
                    this._decompressor.push(bytes);
                }
                else {
                    this.processDecompressedData(bytes);
                }
                this.scanLoadedData();
            };
            SWFFile.prototype.finishLoading = function () {
                if (this.compression !== 0 /* None */) {
                    this._decompressor.close();
                    this._decompressor = null;
                    this.scanLoadedData();
                }
            };
            SWFFile.prototype.getSymbol = function (id) {
                if (this.eagerlyParsedSymbolsMap[id]) {
                    return this.eagerlyParsedSymbolsMap[id];
                }
                var unparsed = this.dictionary[id];
                if (!unparsed) {
                    return null;
                }
                var symbol;
                if (unparsed.tagCode === 39 /* CODE_DEFINE_SPRITE */) {
                    // TODO: replace this whole silly `type` business with tagCode checking.
                    symbol = this.parseSpriteTimeline(unparsed);
                }
                else {
                    symbol = this.getParsedTag(unparsed);
                }
                symbol.className = this.symbolClassesMap[id] || null;
                symbol.env = this.env;
                return symbol;
            };
            SWFFile.prototype.getParsedTag = function (unparsed) {
                SWF.enterTimeline('Parse tag ' + getSwfTagCodeName(unparsed.tagCode));
                this._dataStream.align();
                this._dataStream.pos = unparsed.byteOffset;
                var handler = Parser.LowLevel.tagHandlers[unparsed.tagCode];
                release || Shumway.Debug.assert(handler, 'handler shall exists here');
                var tagEnd = Math.min(unparsed.byteOffset + unparsed.byteLength, this._dataStream.end);
                var tag = handler(this._dataStream, this.swfVersion, unparsed.tagCode, tagEnd, this._jpegTables);
                var finalPos = this._dataStream.pos;
                if (finalPos !== tagEnd) {
                    this.emitTagSlopWarning(unparsed, tagEnd);
                }
                var symbol = defineSymbol(tag, this.dictionary);
                SWF.leaveTimeline();
                return symbol;
            };
            SWFFile.prototype.readHeaderAndInitialize = function (initialBytes) {
                SWF.enterTimeline('Initialize SWFFile');
                var isDeflateCompressed = initialBytes[0] === 67;
                var isLzmaCompressed = initialBytes[0] === 90;
                if (isDeflateCompressed) {
                    this.compression = 1 /* Deflate */;
                }
                else if (isLzmaCompressed) {
                    this.compression = 2 /* LZMA */;
                }
                this.swfVersion = initialBytes[3];
                this._loadStarted = Date.now();
                this._uncompressedLength = readSWFLength(initialBytes);
                this.bytesLoaded = initialBytes.length;
                // In some malformed SWFs, the parsed length in the header doesn't exactly match the actual size of the file. For
                // uncompressed files it seems to be safer to make the buffer large enough from the beginning to fit the entire
                // file than having to resize it later or risking an exception when reading out of bounds.
                this.data = new Uint8Array(this.compression === 0 /* None */ ?
                    this.bytesTotal : this._uncompressedLength);
                this._dataStream = new Stream(this.data.buffer);
                this._dataStream.pos = 8;
                this._dataView = this._dataStream.view;
                if (isDeflateCompressed) {
                    this.data.set(initialBytes.subarray(0, 8));
                    this._uncompressedLoadedLength = 8;
                    this._decompressor = Inflate.create(true);
                    // Parts of the header are compressed. Get those out of the way before starting tag parsing.
                    this._decompressor.onData = this.processFirstBatchOfDecompressedData.bind(this);
                    this._decompressor.onError = function (error) {
                        // TODO: Let the loader handle this error.
                        throw new Error(error);
                    };
                    this._decompressor.push(initialBytes.subarray(8));
                }
                else if (isLzmaCompressed) {
                    this.data.set(initialBytes.subarray(0, 8));
                    this._uncompressedLoadedLength = 8;
                    this._decompressor = new LzmaDecoder(true);
                    this._decompressor.onData = this.processFirstBatchOfDecompressedData.bind(this);
                    this._decompressor.onError = function (error) {
                        // TODO: Let the loader handle this error.
                        Shumway.Debug.warning('Invalid LZMA stream: ' + error);
                    };
                    this._decompressor.push(initialBytes);
                }
                else {
                    this.data.set(initialBytes);
                    this._uncompressedLoadedLength = initialBytes.length;
                    this._decompressor = null;
                    this.parseHeaderContents();
                }
                SWF.leaveTimeline();
                this._lastScanPosition = this._dataStream.pos;
                this.scanLoadedData();
            };
            SWFFile.prototype.parseHeaderContents = function () {
                var obj = Parser.LowLevel.parseHeader(this._dataStream);
                this.bounds = obj.bounds;
                this.frameRate = obj.frameRate;
                this.frameCount = obj.frameCount;
            };
            SWFFile.prototype.processFirstBatchOfDecompressedData = function (data) {
                this.processDecompressedData(data);
                this.parseHeaderContents();
                this._decompressor.onData = this.processDecompressedData.bind(this);
            };
            SWFFile.prototype.processDecompressedData = function (data) {
                // Make sure we don't cause an exception here when trying to set out-of-bound data by clamping the number of bytes
                // to write to the remaining space in our buffer. If this is the case, we probably got a wrong file length from
                // the SWF header. The Flash Player ignores data that goes over that given length, so should we.
                var length = Math.min(data.length, this._uncompressedLength - this._uncompressedLoadedLength);
                Shumway.ArrayUtilities.memCopy(this.data, data, this._uncompressedLoadedLength, 0, length);
                this._uncompressedLoadedLength += length;
            };
            SWFFile.prototype.scanLoadedData = function () {
                SWF.enterTimeline('Scan loaded SWF file tags');
                this._dataStream.pos = this._lastScanPosition;
                this.scanTagsToOffset(this._uncompressedLoadedLength, true);
                this._lastScanPosition = this._dataStream.pos;
                SWF.leaveTimeline();
            };
            SWFFile.prototype.scanTagsToOffset = function (endOffset, rootTimelineMode) {
                // `parsePos` is always at the start of a tag at this point, because it only gets updated
                // when a tag has been fully parsed.
                var tempTag = new UnparsedTag(0, 0, 0);
                var pos;
                while ((pos = this._dataStream.pos) < endOffset - 1) {
                    if (!this.parseNextTagHeader(tempTag)) {
                        break;
                    }
                    if (tempTag.tagCode === 0 /* CODE_END */) {
                        if (rootTimelineMode) {
                            this._endTagEncountered = true;
                        }
                        return;
                    }
                    var tagEnd = tempTag.byteOffset + tempTag.byteLength;
                    if (tagEnd > endOffset) {
                        this._dataStream.pos = pos;
                        return;
                    }
                    this.scanTag(tempTag, rootTimelineMode);
                    if (this._dataStream.pos !== tagEnd) {
                        this.emitTagSlopWarning(tempTag, tagEnd);
                    }
                }
            };
            /**
             * Parses tag header information at the current seek offset and stores it in the given object.
             *
             * Public so it can be used by tools to parse through entire SWFs.
             */
            SWFFile.prototype.parseNextTagHeader = function (target) {
                var position = this._dataStream.pos;
                var tagCodeAndLength = this._dataView.getUint16(position, true);
                position += 2;
                target.tagCode = tagCodeAndLength >> 6;
                var tagLength = tagCodeAndLength & 0x3f;
                var extendedLength = tagLength === 0x3f;
                if (extendedLength) {
                    if (position + 4 > this._uncompressedLoadedLength) {
                        return false;
                    }
                    tagLength = this._dataView.getUint32(position, true);
                    position += 4;
                }
                this._dataStream.pos = position;
                target.byteOffset = position;
                target.byteLength = tagLength;
                return true;
            };
            SWFFile.prototype.scanTag = function (tag, rootTimelineMode) {
                var stream = this._dataStream;
                var byteOffset = stream.pos;
                release || assert(byteOffset === tag.byteOffset);
                var tagCode = tag.tagCode;
                var tagLength = tag.byteLength;
                if (!release && SWF.traceLevel.value > 1) {
                    console.info("Scanning tag " + getSwfTagCodeName(tagCode) + " (start: " + byteOffset +
                        ", end: " + (byteOffset + tagLength) + ")");
                }
                if (tagCode === 39 /* CODE_DEFINE_SPRITE */) {
                    // According to Chapter 13 of the SWF format spec, no nested definition tags are
                    // allowed within DefineSprite. However, they're added to the symbol dictionary
                    // anyway, and some tools produce them. Notably swfmill.
                    // We essentially treat them as though they came before the current sprite. That
                    // should be ok because it doesn't make sense for them to rely on their parent being
                    // fully defined - so they don't have to come after it -, and any control tags within
                    // the parent will just pick them up the moment they're defined, just as always.
                    this.addLazySymbol(tagCode, byteOffset, tagLength);
                    var spriteTagEnd = byteOffset + tagLength;
                    stream.pos += 4; // Jump over symbol ID and frameCount.
                    this.scanTagsToOffset(spriteTagEnd, false);
                    if (this._dataStream.pos !== spriteTagEnd) {
                        this.emitTagSlopWarning(tag, spriteTagEnd);
                    }
                    return;
                }
                if (ImageDefinitionTags[tagCode]) {
                    // Images are decoded asynchronously, so we have to deal with them ahead of time to
                    // ensure they're ready when used.
                    var unparsed = this.addLazySymbol(tagCode, byteOffset, tagLength);
                    this.decodeEmbeddedImage(unparsed);
                    return;
                }
                if (FontDefinitionTags[tagCode]) {
                    var unparsed = this.addLazySymbol(tagCode, byteOffset, tagLength);
                    this.registerEmbeddedFont(unparsed);
                    return;
                }
                if (DefinitionTags[tagCode]) {
                    this.addLazySymbol(tagCode, byteOffset, tagLength);
                    this.jumpToNextTag(tagLength);
                    return;
                }
                if (!rootTimelineMode &&
                    !(tagCode === 76 /* CODE_SYMBOL_CLASS */ || tagCode === 56 /* CODE_EXPORT_ASSETS */)) {
                    this.jumpToNextTag(tagLength);
                    return;
                }
                if (ControlTags[tagCode]) {
                    this.addControlTag(tagCode, byteOffset, tagLength);
                    return;
                }
                switch (tagCode) {
                    case 69 /* CODE_FILE_ATTRIBUTES */:
                        this.setFileAttributes(tagLength);
                        break;
                    case 86 /* CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA */:
                        this.setSceneAndFrameLabelData(tagLength);
                        break;
                    case 9 /* CODE_SET_BACKGROUND_COLOR */:
                        this.backgroundColor = Parser.LowLevel.parseRgb(this._dataStream);
                        break;
                    case 8 /* CODE_JPEG_TABLES */:
                        // Only use the first JpegTables tag, ignore any following.
                        // TODO test it, swfdec is using the last one
                        if (!this._jpegTables) {
                            this._jpegTables = tagLength === 0 ?
                                new Uint8Array(0) :
                                this.data.subarray(stream.pos, stream.pos + tagLength - 2);
                        }
                        this.jumpToNextTag(tagLength);
                        break;
                    case 82 /* CODE_DO_ABC */:
                    case 72 /* CODE_DO_ABC_DEFINE */:
                        if (!this.useAVM1) {
                            var tagEnd = byteOffset + tagLength;
                            var abcBlock = new ABCBlock();
                            if (tagCode === 82 /* CODE_DO_ABC */) {
                                abcBlock.flags = stream.readUi32();
                                abcBlock.name = stream.readString(-1);
                            }
                            else {
                                abcBlock.flags = 0;
                                abcBlock.name = "";
                            }
                            abcBlock.data = this.data.subarray(stream.pos, tagEnd);
                            this.abcBlocks.push(abcBlock);
                            stream.pos = tagEnd;
                        }
                        else {
                            this.jumpToNextTag(tagLength);
                        }
                        break;
                    case 76 /* CODE_SYMBOL_CLASS */:
                        var tagEnd = byteOffset + tagLength;
                        var symbolCount = stream.readUi16();
                        // TODO: check if symbols can be reassociated after instances have been created.
                        while (symbolCount--) {
                            var symbolId = stream.readUi16();
                            var symbolClassName = stream.readString(-1);
                            if (!release && SWF.traceLevel.value > 0) {
                                console.log('Registering symbol class ' + symbolClassName + ' to symbol ' + symbolId);
                            }
                            this.symbolClassesMap[symbolId] = symbolClassName;
                            this.symbolClassesList.push({ id: symbolId, className: symbolClassName });
                        }
                        // Make sure we move to end of tag even if the content is invalid.
                        stream.pos = tagEnd;
                        break;
                    case 59 /* CODE_DO_INIT_ACTION */:
                        if (this.useAVM1) {
                            var initActionBlocks = this._currentInitActionBlocks ||
                                (this._currentInitActionBlocks = []);
                            var spriteId = this._dataView.getUint16(stream.pos, true);
                            var actionsData = this.data.subarray(byteOffset + 2, byteOffset + tagLength);
                            initActionBlocks.push({ spriteId: spriteId, actionsData: actionsData });
                        }
                        this.jumpToNextTag(tagLength);
                        break;
                    case 12 /* CODE_DO_ACTION */:
                        if (this.useAVM1) {
                            var actionBlocks = this._currentActionBlocks || (this._currentActionBlocks = []);
                            var actionsData = this.data.subarray(stream.pos, stream.pos + tagLength);
                            actionBlocks.push({ actionsData: actionsData, precedence: stream.pos });
                        }
                        this.jumpToNextTag(tagLength);
                        break;
                    case 18 /* CODE_SOUND_STREAM_HEAD */:
                    case 45 /* CODE_SOUND_STREAM_HEAD2 */:
                        var soundStreamTag = Parser.LowLevel.parseSoundStreamHeadTag(this._dataStream, byteOffset + tagLength);
                        this._currentSoundStreamHead = Parser.SoundStream.FromTag(soundStreamTag);
                        break;
                    case 19 /* CODE_SOUND_STREAM_BLOCK */:
                        this._currentSoundStreamBlock = this.data.subarray(stream.pos, stream.pos += tagLength);
                        break;
                    case 43 /* CODE_FRAME_LABEL */:
                        var tagEnd = stream.pos + tagLength;
                        this._currentFrameLabel = stream.readString(-1);
                        // TODO: support SWF6+ anchors.
                        stream.pos = tagEnd;
                        break;
                    case 1 /* CODE_SHOW_FRAME */:
                        this.finishFrame();
                        break;
                    case 0 /* CODE_END */:
                        return;
                    case 56 /* CODE_EXPORT_ASSETS */:
                        var tagEnd = stream.pos + tagLength;
                        var exportsCount = stream.readUi16();
                        var exports = this._currentExports || (this._currentExports = []);
                        while (exportsCount--) {
                            var symbolId = stream.readUi16();
                            var className = stream.readString(-1);
                            if (stream.pos > tagEnd) {
                                stream.pos = tagEnd;
                                break;
                            }
                            exports.push(new SymbolExport(symbolId, className));
                        }
                        stream.pos = tagEnd;
                        break;
                    case 23 /* CODE_DEFINE_BUTTON_CXFORM */:
                    case 17 /* CODE_DEFINE_BUTTON_SOUND */:
                    case 13 /* CODE_DEFINE_FONT_INFO */:
                    case 62 /* CODE_DEFINE_FONT_INFO2 */:
                    case 78 /* CODE_DEFINE_SCALING_GRID */:
                    case 57 /* CODE_IMPORT_ASSETS */:
                    case 71 /* CODE_IMPORT_ASSETS2 */:
                        Shumway.Debug.warning('Unsupported tag encountered ' + tagCode + ': ' + getSwfTagCodeName(tagCode));
                        this.jumpToNextTag(tagLength);
                        break;
                    // These tags should be supported at some point, but for now, we ignore them.
                    case 74 /* CODE_CSM_TEXT_SETTINGS */:
                    case 73 /* CODE_DEFINE_FONT_ALIGN_ZONES */:
                    case 65 /* CODE_SCRIPT_LIMITS */:
                    case 66 /* CODE_SET_TAB_INDEX */:
                    // These tags are used by the player, but not relevant to us.
                    case 58 /* CODE_ENABLE_DEBUGGER */:
                    case 64 /* CODE_ENABLE_DEBUGGER2 */:
                    case 63 /* CODE_DEBUG_ID */:
                    case 88 /* CODE_DEFINE_FONT_NAME */:
                    case 40 /* CODE_NAME_CHARACTER */:
                    case 41 /* CODE_PRODUCT_INFO */:
                    case 77 /* CODE_METADATA */:
                    case 24 /* CODE_PROTECT */:
                    case 25 /* CODE_PATHS_ARE_POSTSCRIPT */:
                    case 93 /* CODE_TELEMETRY */:
                    // These are obsolete Generator-related tags.
                    case 55 /* CODE_GEN_TAG_OBJECTS */:
                    case 49 /* CODE_GEN_COMMAND */:
                        this.jumpToNextTag(tagLength);
                        break;
                    // These tags aren't used in the player.
                    case 51 /* CODE_CHARACTER_SET */:
                    case 44 /* CODE_DEFINE_BEHAVIOUR */:
                    case 50 /* CODE_DEFINE_COMMAND_OBJECT */:
                    case 53 /* CODE_DEFINE_FUNCTION */:
                    case 42 /* CODE_DEFINE_TEXT_FORMAT */:
                    case 38 /* CODE_DEFINE_VIDEO */:
                    case 52 /* CODE_EXTERNAL_FONT */:
                    case 3 /* CODE_FREE_CHARACTER */:
                    case 31 /* CODE_FREE_ALL */:
                    case 47 /* CODE_GENERATE_FRAME */:
                    case 16 /* CODE_STOP_SOUND */:
                    case 29 /* CODE_SYNC_FRAME */:
                        console.info("Ignored tag (these shouldn't occur) " + tagCode + ': ' + getSwfTagCodeName(tagCode));
                        this.jumpToNextTag(tagLength);
                        break;
                    default:
                        if (tagCode > 100) {
                            Shumway.Debug.warning("Encountered undefined tag " + tagCode + ", probably used for AVM1 " +
                                "obfuscation. See http://ijs.mtasa.com/files/swfdecrypt.cpp.");
                        }
                        else {
                            Shumway.Debug.warning('Tag not handled by the parser: ' + tagCode + ': ' + getSwfTagCodeName(tagCode));
                        }
                        this.jumpToNextTag(tagLength);
                }
            };
            SWFFile.prototype.parseSpriteTimeline = function (spriteTag) {
                SWF.enterTimeline("parseSpriteTimeline");
                var data = this.data;
                var stream = this._dataStream;
                var dataView = this._dataView;
                var timeline = {
                    id: spriteTag.id,
                    type: 'sprite',
                    frames: []
                };
                var spriteTagEnd = spriteTag.byteOffset + spriteTag.byteLength;
                var frames = timeline.frames;
                var label = null;
                var controlTags = [];
                var soundStreamHead = null;
                var soundStreamBlock = null;
                var actionBlocks = null;
                var initActionBlocks = null;
                // Skip ID.
                stream.pos = spriteTag.byteOffset + 2;
                // TODO: check if numFrames or the real number of ShowFrame tags wins. (Probably the former.)
                timeline.frameCount = dataView.getUint16(stream.pos, true);
                stream.pos += 2;
                var spriteContentTag = new UnparsedTag(0, 0, 0);
                while (stream.pos < spriteTagEnd) {
                    this.parseNextTagHeader(spriteContentTag);
                    var tagLength = spriteContentTag.byteLength;
                    var tagCode = spriteContentTag.tagCode;
                    if (stream.pos + tagLength > spriteTagEnd) {
                        Shumway.Debug.warning("DefineSprite child tags exceed DefineSprite tag length and are dropped");
                        break;
                    }
                    if (Parser.ControlTags[tagCode]) {
                        controlTags.push(new UnparsedTag(tagCode, stream.pos, tagLength));
                        stream.pos += tagLength;
                        continue;
                    }
                    switch (tagCode) {
                        case 12 /* CODE_DO_ACTION */:
                            if (this.useAVM1) {
                                if (!actionBlocks) {
                                    actionBlocks = [];
                                }
                                var actionsData = data.subarray(stream.pos, stream.pos + tagLength);
                                actionBlocks.push({ actionsData: actionsData, precedence: stream.pos });
                            }
                            break;
                        case 59 /* CODE_DO_INIT_ACTION */:
                            if (this.useAVM1) {
                                if (!initActionBlocks) {
                                    initActionBlocks = [];
                                }
                                var spriteId = dataView.getUint16(stream.pos, true);
                                stream.pos += 2;
                                var actionsData = data.subarray(stream.pos, stream.pos + tagLength);
                                initActionBlocks.push({ spriteId: spriteId, actionsData: actionsData });
                            }
                            break;
                        case 43 /* CODE_FRAME_LABEL */:
                            var tagEnd = stream.pos + tagLength;
                            label = stream.readString(-1);
                            // TODO: support SWF6+ anchors.
                            stream.pos = tagEnd;
                            tagLength = 0;
                            break;
                        case 1 /* CODE_SHOW_FRAME */:
                            frames.push(new SWFFrame(controlTags, label, soundStreamHead, soundStreamBlock, actionBlocks, initActionBlocks, null));
                            label = null;
                            controlTags = [];
                            soundStreamHead = null;
                            soundStreamBlock = null;
                            actionBlocks = null;
                            initActionBlocks = null;
                            break;
                        case 0 /* CODE_END */:
                            stream.pos = spriteTagEnd;
                            tagLength = 0;
                            break;
                        default:
                    }
                    stream.pos += tagLength;
                    release || assert(stream.pos <= spriteTagEnd);
                }
                SWF.leaveTimeline();
                return timeline;
            };
            SWFFile.prototype.jumpToNextTag = function (currentTagLength) {
                this._dataStream.pos += currentTagLength;
            };
            SWFFile.prototype.emitTagSlopWarning = function (tag, tagEnd) {
                var consumedBytes = this._dataStream.pos - tag.byteOffset;
                Shumway.Debug.warning('Scanning ' + getSwfTagCodeName(tag.tagCode) + ' at offset ' + tag.byteOffset +
                    ' consumed ' + consumedBytes + ' of ' + tag.byteLength + ' bytes. (' +
                    (tag.byteLength - consumedBytes) + ' left)');
                this._dataStream.pos = tagEnd;
            };
            SWFFile.prototype.finishFrame = function () {
                if (this.pendingUpdateDelays === 0) {
                    this.framesLoaded++;
                }
                this.frames.push(new SWFFrame(this._currentControlTags, this._currentFrameLabel, this._currentSoundStreamHead, this._currentSoundStreamBlock, this._currentActionBlocks, this._currentInitActionBlocks, this._currentExports));
                this._currentFrameLabel = null;
                this._currentControlTags = null;
                this._currentSoundStreamHead = null;
                this._currentSoundStreamBlock = null;
                this._currentActionBlocks = null;
                this._currentInitActionBlocks = null;
                this._currentExports = null;
            };
            SWFFile.prototype.setFileAttributes = function (tagLength) {
                // TODO: check what happens to attributes tags that aren't the first tag.
                if (this.attributes) {
                    this.jumpToNextTag(tagLength);
                }
                var bits = this.data[this._dataStream.pos];
                this._dataStream.pos += 4;
                this.attributes = {
                    network: bits & 0x1,
                    relativeUrls: bits & 0x2,
                    noCrossDomainCaching: bits & 0x4,
                    doAbc: bits & 0x8,
                    hasMetadata: bits & 0x10,
                    useGpu: bits & 0x20,
                    useDirectBlit: bits & 0x40
                };
                this.useAVM1 = !this.attributes.doAbc;
            };
            SWFFile.prototype.setSceneAndFrameLabelData = function (tagLength) {
                if (this.sceneAndFrameLabelData) {
                    this.jumpToNextTag(tagLength);
                    return;
                }
                this.sceneAndFrameLabelData = Parser.LowLevel.parseDefineSceneTag(this._dataStream, 86 /* CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA */);
            };
            SWFFile.prototype.addControlTag = function (tagCode, byteOffset, tagLength) {
                var controlTags = this._currentControlTags || (this._currentControlTags = []);
                controlTags.push(new UnparsedTag(tagCode, byteOffset, tagLength));
                this.jumpToNextTag(tagLength);
            };
            SWFFile.prototype.addLazySymbol = function (tagCode, byteOffset, tagLength) {
                var id = this._dataView.getUint16(this._dataStream.pos, true);
                var symbol = new DictionaryEntry(id, tagCode, byteOffset, tagLength);
                this.dictionary[id] = symbol;
                if (!release && SWF.traceLevel.value > 0) {
                    console.info("Registering symbol " + id + " of type " + getSwfTagCodeName(tagCode));
                }
                return symbol;
            };
            SWFFile.prototype.decodeEmbeddedFont = function (unparsed) {
                var definition = this.getParsedTag(unparsed);
                var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'font', definition, this.env);
                if (!release && SWF.traceLevel.value > 0) {
                    var style = flagsToFontStyle(definition.bold, definition.italic);
                    console.info("Decoding embedded font " + definition.id + " with name '" + definition.name +
                        "' and style " + style, definition);
                }
                this.eagerlyParsedSymbolsMap[symbol.id] = symbol;
                this.eagerlyParsedSymbolsList.push(symbol);
                var style = flagsToFontStyle(definition.bold, definition.italic);
                this.fonts.push({ name: definition.name, id: definition.id, style: style });
            };
            SWFFile.prototype.registerEmbeddedFont = function (unparsed) {
                if (!inFirefox) {
                    this.decodeEmbeddedFont(unparsed);
                    return;
                }
                var stream = this._dataStream;
                var id = this._dataView.getUint16(stream.pos, true);
                var style;
                var name;
                // DefineFont only specifies a symbol ID, no font name or style.
                if (unparsed.tagCode === 10 /* CODE_DEFINE_FONT */) {
                    // Assigning some unique name to simplify font registration and look ups.
                    name = '__autofont__' + unparsed.byteOffset;
                    style = 'regular';
                }
                else {
                    var flags = this.data[stream.pos + 2];
                    style = flagsToFontStyle(!!(flags & 0x1), !!(flags & 0x2));
                    var nameLength = this.data[stream.pos + 4];
                    // Skip language code.
                    stream.pos += 5;
                    name = stream.readString(nameLength);
                }
                this.fonts.push({ name: name, id: id, style: style });
                if (!release && SWF.traceLevel.value > 0) {
                    console.info("Registering embedded font " + id + " with name '" + name + "' and style " +
                        style);
                }
                stream.pos = unparsed.byteOffset + unparsed.byteLength;
            };
            SWFFile.prototype.decodeEmbeddedImage = function (unparsed) {
                var definition = this.getParsedTag(unparsed);
                var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'image', definition, this.env);
                if (!release && SWF.traceLevel.value > 0) {
                    console.info("Decoding embedded image " + definition.id + " of type " +
                        getSwfTagCodeName(unparsed.tagCode) + " (start: " + unparsed.byteOffset +
                        ", end: " + (unparsed.byteOffset + unparsed.byteLength) + ")");
                }
                this.eagerlyParsedSymbolsMap[symbol.id] = symbol;
                this.eagerlyParsedSymbolsList.push(symbol);
            };
            return SWFFile;
        })();
        SWF.SWFFile = SWFFile;
        function flagsToFontStyle(bold, italic) {
            if (bold && italic) {
                return 'boldItalic';
            }
            if (bold) {
                return 'bold';
            }
            if (italic) {
                return 'italic';
            }
            return 'regular';
        }
        var SWFFrame = (function () {
            function SWFFrame(controlTags, labelName, soundStreamHead, soundStreamBlock, actionBlocks, initActionBlocks, exports) {
                release || controlTags && Object.freeze(controlTags);
                this.controlTags = controlTags;
                this.labelName = labelName;
                release || actionBlocks && Object.freeze(actionBlocks);
                this.soundStreamHead = soundStreamHead;
                this.soundStreamBlock = soundStreamBlock;
                this.actionBlocks = actionBlocks;
                release || initActionBlocks && Object.freeze(initActionBlocks);
                this.initActionBlocks = initActionBlocks;
                release || exports && Object.freeze(exports);
                this.exports = exports;
            }
            return SWFFrame;
        })();
        SWF.SWFFrame = SWFFrame;
        var ABCBlock = (function () {
            function ABCBlock() {
            }
            return ABCBlock;
        })();
        SWF.ABCBlock = ABCBlock;
        var ActionBlock = (function () {
            function ActionBlock() {
            }
            return ActionBlock;
        })();
        SWF.ActionBlock = ActionBlock;
        var InitActionBlock = (function () {
            function InitActionBlock() {
            }
            return InitActionBlock;
        })();
        SWF.InitActionBlock = InitActionBlock;
        var SymbolExport = (function () {
            function SymbolExport(symbolId, className) {
                this.symbolId = symbolId;
                this.className = className;
            }
            return SymbolExport;
        })();
        SWF.SymbolExport = SymbolExport;
        var UnparsedTag = (function () {
            function UnparsedTag(tagCode, byteOffset, byteLength) {
                this.tagCode = tagCode;
                this.byteOffset = byteOffset;
                this.byteLength = byteLength;
            }
            return UnparsedTag;
        })();
        SWF.UnparsedTag = UnparsedTag;
        var DictionaryEntry = (function (_super) {
            __extends(DictionaryEntry, _super);
            function DictionaryEntry(id, tagCode, byteOffset, byteLength) {
                _super.call(this, tagCode, byteOffset, byteLength);
                this.id = id;
            }
            return DictionaryEntry;
        })(UnparsedTag);
        SWF.DictionaryEntry = DictionaryEntry;
        var EagerlyParsedDictionaryEntry = (function (_super) {
            __extends(EagerlyParsedDictionaryEntry, _super);
            function EagerlyParsedDictionaryEntry(id, unparsed, type, definition, env) {
                _super.call(this, id, unparsed.tagCode, unparsed.byteOffset, unparsed.byteLength);
                this.type = type;
                this.definition = definition;
                this.env = env;
                this.ready = false;
            }
            return EagerlyParsedDictionaryEntry;
        })(DictionaryEntry);
        SWF.EagerlyParsedDictionaryEntry = EagerlyParsedDictionaryEntry;
        function readSWFLength(bytes) {
            // We read the length manually because creating a DataView just for that is silly.
            return (bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24) >>> 0;
        }
        function defineSymbol(swfTag, symbols) {
            switch (swfTag.code) {
                case 6 /* CODE_DEFINE_BITS */:
                case 21 /* CODE_DEFINE_BITS_JPEG2 */:
                case 35 /* CODE_DEFINE_BITS_JPEG3 */:
                case 90 /* CODE_DEFINE_BITS_JPEG4 */:
                    return Shumway.SWF.Parser.defineImage(swfTag);
                case 20 /* CODE_DEFINE_BITS_LOSSLESS */:
                case 36 /* CODE_DEFINE_BITS_LOSSLESS2 */:
                    return Shumway.SWF.Parser.defineBitmap(swfTag);
                case 7 /* CODE_DEFINE_BUTTON */:
                case 34 /* CODE_DEFINE_BUTTON2 */:
                    return Shumway.SWF.Parser.defineButton(swfTag, symbols);
                case 37 /* CODE_DEFINE_EDIT_TEXT */:
                    return Shumway.SWF.Parser.defineText(swfTag);
                case 10 /* CODE_DEFINE_FONT */:
                case 48 /* CODE_DEFINE_FONT2 */:
                case 75 /* CODE_DEFINE_FONT3 */:
                case 91 /* CODE_DEFINE_FONT4 */:
                    return Shumway.SWF.Parser.defineFont(swfTag);
                case 46 /* CODE_DEFINE_MORPH_SHAPE */:
                case 84 /* CODE_DEFINE_MORPH_SHAPE2 */:
                case 2 /* CODE_DEFINE_SHAPE */:
                case 22 /* CODE_DEFINE_SHAPE2 */:
                case 32 /* CODE_DEFINE_SHAPE3 */:
                case 83 /* CODE_DEFINE_SHAPE4 */:
                    return Shumway.SWF.Parser.defineShape(swfTag);
                case 14 /* CODE_DEFINE_SOUND */:
                    return Shumway.SWF.Parser.defineSound(swfTag);
                case 60 /* CODE_DEFINE_VIDEO_STREAM */:
                    return {
                        type: 'video',
                        id: swfTag.id,
                        width: swfTag.width,
                        height: swfTag.height,
                        deblocking: swfTag.deblocking,
                        smoothing: swfTag.smoothing,
                        codec: swfTag.codecId
                    };
                case 39 /* CODE_DEFINE_SPRITE */:
                    // Sprites are fully defined at this point.
                    return swfTag;
                case 87 /* CODE_DEFINE_BINARY_DATA */:
                    return {
                        type: 'binary',
                        id: swfTag.id,
                        data: swfTag.data
                    };
                case 11 /* CODE_DEFINE_TEXT */:
                case 33 /* CODE_DEFINE_TEXT2 */:
                    return Shumway.SWF.Parser.defineLabel(swfTag);
                default:
                    return swfTag;
            }
        }
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var ImageTypeMagicHeaderBytes;
    (function (ImageTypeMagicHeaderBytes) {
        ImageTypeMagicHeaderBytes[ImageTypeMagicHeaderBytes["JPG"] = 16767231] = "JPG";
        ImageTypeMagicHeaderBytes[ImageTypeMagicHeaderBytes["PNG"] = 8998990] = "PNG";
        ImageTypeMagicHeaderBytes[ImageTypeMagicHeaderBytes["GIF"] = 4671814] = "GIF";
    })(ImageTypeMagicHeaderBytes || (ImageTypeMagicHeaderBytes = {}));
    var mimetypesForHeaders = {};
    mimetypesForHeaders[ImageTypeMagicHeaderBytes.JPG] = 'image/jpeg';
    mimetypesForHeaders[ImageTypeMagicHeaderBytes.PNG] = 'image/png';
    mimetypesForHeaders[ImageTypeMagicHeaderBytes.GIF] = 'image/gif';
    var ImageFile = (function () {
        function ImageFile(header, fileLength, env) {
            this.type = 4;
            this.env = env;
            this.bytesLoaded = header.length;
            if (header.length === fileLength) {
                this.data = header;
            }
            else {
                this.data = new Uint8Array(fileLength);
                this.data.set(header);
            }
            this.setMimetype();
        }
        Object.defineProperty(ImageFile.prototype, "bytesTotal", {
            get: function () {
                return this.data.length;
            },
            enumerable: true,
            configurable: true
        });
        ImageFile.prototype.appendLoadedData = function (data) {
            this.data.set(data, this.bytesLoaded);
            this.bytesLoaded += data.length;
        };
        ImageFile.prototype.setMimetype = function () {
            var magic = (this.data[0] << 16) | (this.data[1] << 8) | this.data[2];
            this.mimeType = mimetypesForHeaders[magic];
        };
        return ImageFile;
    })();
    Shumway.ImageFile = ImageFile;
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Encapsulates as much of the external file loading process as possible. This means all of it
 * except for (stand-alone or embedded) images and fonts embedded in SWFs. As these have to be
 * decoded before being usable by content, we stall reporting loading progress until the decoding
 * has finished. The following is a description of the ridiculously complicated contortions we
 * have to go through for this to work:

  ### Life-cycle of embedded images and fonts from being encountered in the SWF to being ready for
     use:
  1.
    1. An image tag is encountered, `SWFFile#decodeEmbeddedImage` is called.
    2. A font tag is encountered, `SWFFile#registerEmbeddedFont` is called. For Firefox, things end
       here for now: fonts can be decoded synchronously, so we don't need to do it eagerly.
  2. Embedded asset's contents are extracted from SWF and stored in an
     `EagerlyParsedDictionaryEntry`.
  3. Once scanning of the currently loaded SWF bytes is complete, `Loader#onNewEagerlyParsedSymbols`
     is called with a list of all newly encountered fonts and images.
     Note: `Loader` does *not* receive updates about any other newly loaded data; not even how many
           bytes were loaded.
  4. `Loader#onNewEagerlyParsedSymbols` iterates over list of fonts and images and retrieves their
     symbols.
  5. `LoaderInfo#getSymbolById` creates a `{Font,Bitmap}Symbol` instance, which gets a `syncID` and
     a `resolveAssetPromise` and a `ready` flag set to `false`.
  6. `LoaderInfo#getSymbolById` invokes `Timeline.IAssetResolver#registerFont` or
     `Timeline.IAssetResolver#registerImage`. The singleton implementation of `IAssetResolver` is
     the active instance of `Player`.
  7. `Player#registerFont` or `Player#registerImage` send sync message to GFX side requesting
     decoding of asset.
  8. `GFXChannelDeserializerContext#register{Font,Image}` is called, which triggers the actual
     decoding and, in the image case, registration of the asset.
  9.
    1. A `CSSFont` is created and a 400ms timeout triggered.
    2.
      1. A `HTMLImageElement` is created and a load triggered from the blob containing the image
         bytes.
      2. A `RenderableBitmap` is created with the `HTMLImageElement` as its `renderSource` and
         `-1,-1` dimensions.
  10. `Loader#onNewEagerlyParsedSymbols` creates a `Promise.all` promise for all assets'
      `resolveAssetPromise`s and returns that to the `FileLoader`.
  11. For all assets:
    1. Loading finishes for images / timeout happens for fonts, resolving their
       `resolveAssetPromise`.
    2. Symbols get marked as `ready`, fonts get their metrics filled in.
  12. The combined promise is resolved, causing `FileLoader` to deliver the queued load update,
      informing content about newly loaded bytes, assets, scripts, etc.

  Note: loading and scanning of the SWF has continued in the meantime, so there can be multiple
        updates queued for the same promise.


  ### Usage of an image in GFX-land:
  Images are guaranteed to be ready for rendering when content is told about them, so there can
  never be a need to asynchronously decode them. If an image is never used for anything but
  rendering, it's never expanded into a Canvas. If, see below, content accesses the image's bytes,
  it's expanded and the original `HTMLImageElement` discarded.

  ### Usage of an image in Player-land:
  If content accesses an image's pixels for the first time, e.g. using `BitmapData#getPixel`, the
  `BitmapData` instance requests the pixel data from GFX-land. That causes the above-mentioned
  expansion into a Canvas and discarding of the `HTMLImageElement`, followed by a `getImageData`
  call.
 */
var Shumway;
(function (Shumway) {
    var assert = Shumway.Debug.assert;
    var SWFFile = Shumway.SWF.SWFFile;
    // Minimal amount of data to load before starting to parse. Chosen fairly arbitrarily.
    var MIN_LOADED_BYTES = 8192;
    var LoadProgressUpdate = (function () {
        function LoadProgressUpdate(bytesLoaded, framesLoaded) {
            this.bytesLoaded = bytesLoaded;
            this.framesLoaded = framesLoaded;
        }
        return LoadProgressUpdate;
    })();
    Shumway.LoadProgressUpdate = LoadProgressUpdate;
    var FileLoader = (function () {
        function FileLoader(listener, env) {
            release || assert(listener);
            this._file = null;
            this._url = '';
            this._listener = listener;
            this._env = env;
            this._loadingServiceSession = null;
            this._delayedUpdatesPromise = null;
            this._bytesLoaded = 0;
        }
        // TODO: strongly type
        FileLoader.prototype.loadFile = function (request) {
            this._url = request.url;
            Shumway.SWF.enterTimeline('Load file', request.url);
            this._bytesLoaded = 0;
            var session = this._loadingServiceSession = Shumway.FileLoadingService.instance.createSession();
            session.onopen = this.processLoadOpen.bind(this);
            session.onprogress = this.processNewData.bind(this);
            session.onerror = this.processError.bind(this);
            session.onclose = this.processLoadClose.bind(this);
            session.open(request);
        };
        FileLoader.prototype.abortLoad = function () {
            if (this._loadingServiceSession) {
                this._loadingServiceSession.close();
                Shumway.SWF.leaveTimeline();
            }
            this._file = null;
        };
        FileLoader.prototype.loadBytes = function (bytes) {
            Shumway.SWF.enterTimeline('Load bytes');
            this.processLoadOpen();
            this.processNewData(bytes, { bytesLoaded: bytes.length, bytesTotal: bytes.length });
            this.processLoadClose();
            // SWF.leaveTimeline happens in processLoadClose.
        };
        FileLoader.prototype.processLoadOpen = function () {
            release || assert(!this._file);
        };
        FileLoader.prototype.processNewData = function (data, progressInfo) {
            this._bytesLoaded += data.length;
            var isLoadingInProgress = progressInfo.bytesLoaded < progressInfo.bytesTotal;
            if (this._bytesLoaded < MIN_LOADED_BYTES && isLoadingInProgress) {
                if (!this._queuedInitialData) {
                    this._queuedInitialData = new Uint8Array(Math.min(MIN_LOADED_BYTES, progressInfo.bytesTotal));
                }
                this._queuedInitialData.set(data, this._bytesLoaded - data.length);
                return;
            }
            else if (this._queuedInitialData) {
                var allData = new Uint8Array(this._bytesLoaded);
                allData.set(this._queuedInitialData);
                allData.set(data, this._bytesLoaded - data.length);
                data = allData;
                this._queuedInitialData = null;
            }
            var file = this._file;
            var eagerlyParsedSymbolsCount = 0;
            var previousFramesLoaded = 0;
            if (!file) {
                file = this._file = createFileInstanceForHeader(data, progressInfo.bytesTotal, this._env);
                if (file) {
                    this._listener.onLoadOpen(file);
                }
            }
            else {
                if (file instanceof SWFFile) {
                    eagerlyParsedSymbolsCount = file.eagerlyParsedSymbolsList.length;
                    previousFramesLoaded = file.framesLoaded;
                }
                file.appendLoadedData(data);
            }
            if (file instanceof SWFFile) {
                this.processSWFFileUpdate(file, eagerlyParsedSymbolsCount, previousFramesLoaded);
            }
            else {
                release || assert(file instanceof Shumway.ImageFile);
                this._listener.onLoadProgress(new LoadProgressUpdate(progressInfo.bytesLoaded, -1));
                if (progressInfo.bytesLoaded === progressInfo.bytesTotal) {
                    this._listener.onImageBytesLoaded();
                }
            }
        };
        FileLoader.prototype.processError = function (error) {
            Shumway.Debug.warning('Loading error encountered:', error);
        };
        FileLoader.prototype.processLoadClose = function () {
            var file = this._file;
            if (!file) {
                this._listener.onLoadOpen(null);
                return;
            }
            if (file instanceof SWFFile) {
                var eagerlyParsedSymbolsCount = file.eagerlyParsedSymbolsList.length;
                var previousFramesLoaded = file.framesLoaded;
                file.finishLoading();
                this.processSWFFileUpdate(file, eagerlyParsedSymbolsCount, previousFramesLoaded);
            }
            if (file.bytesLoaded !== file.bytesTotal) {
                Shumway.Debug.warning("Shouldn't have reached this: aborting a load should prevent this from " +
                    "being called.");
                Shumway.Debug.warning(new Error().stack);
            }
            else {
                Shumway.SWF.leaveTimeline();
            }
        };
        FileLoader.prototype.processSWFFileUpdate = function (file, previousEagerlyParsedSymbolsCount, previousFramesLoaded) {
            var promise;
            var eagerlyParsedSymbolsDelta = file.eagerlyParsedSymbolsList.length -
                previousEagerlyParsedSymbolsCount;
            if (!eagerlyParsedSymbolsDelta) {
                var update = this._lastDelayedUpdate;
                if (!update) {
                    release || assert(file.framesLoaded === file.frames.length);
                    this._listener.onLoadProgress(new LoadProgressUpdate(file.bytesLoaded, file.framesLoaded));
                }
                else {
                    release || assert(update.framesLoaded <= file.frames.length);
                    update.bytesLoaded = file.bytesLoaded;
                    update.framesLoaded = file.frames.length;
                }
                return;
            }
            promise = this._listener.onNewEagerlyParsedSymbols(file.eagerlyParsedSymbolsList, eagerlyParsedSymbolsDelta);
            if (this._delayedUpdatesPromise) {
                promise = Promise.all([this._delayedUpdatesPromise, promise]);
            }
            this._delayedUpdatesPromise = promise;
            var update = new LoadProgressUpdate(file.bytesLoaded, file.frames.length);
            this._lastDelayedUpdate = update;
            file.pendingUpdateDelays++;
            var self = this;
            // Make sure the framesLoaded value from after this update isn't yet visible. Otherwise,
            // we might signal a higher value than allowed if this update is delayed sufficiently long
            // for another update to arrive in the meantime. That update sets the framesLoaded value too
            // high. Then, this update gets resolved, but signals a value for framesLoaded that's too
            // high.
            file.framesLoaded = previousFramesLoaded;
            promise.then(function () {
                if (!release && Shumway.SWF.traceLevel.value > 0) {
                    console.log("Reducing pending update delays from " + file.pendingUpdateDelays + " to " +
                        (file.pendingUpdateDelays - 1));
                }
                file.pendingUpdateDelays--;
                release || assert(file.pendingUpdateDelays >= 0);
                file.framesLoaded = update.framesLoaded;
                self._listener.onLoadProgress(update);
                if (self._delayedUpdatesPromise === promise) {
                    self._delayedUpdatesPromise = null;
                    self._lastDelayedUpdate = null;
                }
            });
        };
        return FileLoader;
    })();
    Shumway.FileLoader = FileLoader;
    function createFileInstanceForHeader(header, fileLength, env) {
        var magic = (header[0] << 16) | (header[1] << 8) | header[2];
        if ((magic & 0xffff) === FileTypeMagicHeaderBytes.SWF) {
            return new SWFFile(header, fileLength, env);
        }
        if (magic === FileTypeMagicHeaderBytes.JPG || magic === FileTypeMagicHeaderBytes.PNG ||
            magic === FileTypeMagicHeaderBytes.GIF) {
            return new Shumway.ImageFile(header, fileLength, env);
        }
        // TODO: throw instead of returning null? Perhaps?
        return null;
    }
    var FileTypeMagicHeaderBytes;
    (function (FileTypeMagicHeaderBytes) {
        FileTypeMagicHeaderBytes[FileTypeMagicHeaderBytes["SWF"] = 22355] = "SWF";
        FileTypeMagicHeaderBytes[FileTypeMagicHeaderBytes["JPG"] = 16767231] = "JPG";
        FileTypeMagicHeaderBytes[FileTypeMagicHeaderBytes["PNG"] = 8998990] = "PNG";
        FileTypeMagicHeaderBytes[FileTypeMagicHeaderBytes["GIF"] = 4671814] = "GIF";
    })(FileTypeMagicHeaderBytes || (FileTypeMagicHeaderBytes = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
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
/// <reference path='../../build/ts/base.d.ts' />
/// <reference path='../../build/ts/tools.d.ts' />
///<reference path='parser/references.ts' />
///<reference path='module.ts'/>
///<reference path='settings.ts'/>
///<reference path='stream.ts' />
///<reference path='mp3decodersession.ts' />
///<reference path='SWFFile.ts' />
///<reference path='ImageFile.ts' />
///<reference path='FileLoader.ts' />
//# sourceMappingURL=swf.js.map