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
            var pow = Math.pow;
            var fromCharCode = String.fromCharCode;
            var slice = Array.prototype.slice;
            function readSi8($bytes, $stream) {
                return $stream.getInt8($stream.pos++);
            }
            Parser.readSi8 = readSi8;
            function readSi16($bytes, $stream) {
                return $stream.getInt16($stream.pos, $stream.pos += 2);
            }
            Parser.readSi16 = readSi16;
            function readSi32($bytes, $stream) {
                return $stream.getInt32($stream.pos, $stream.pos += 4);
            }
            Parser.readSi32 = readSi32;
            function readUi8($bytes, $stream) {
                return $bytes[$stream.pos++];
            }
            Parser.readUi8 = readUi8;
            function readUi16($bytes, $stream) {
                return $stream.getUint16($stream.pos, $stream.pos += 2);
            }
            Parser.readUi16 = readUi16;
            function readUi32($bytes, $stream) {
                return $stream.getUint32($stream.pos, $stream.pos += 4);
            }
            Parser.readUi32 = readUi32;
            function readFixed($bytes, $stream) {
                return $stream.getInt32($stream.pos, $stream.pos += 4) / 65536;
            }
            Parser.readFixed = readFixed;
            function readFixed8($bytes, $stream) {
                return $stream.getInt16($stream.pos, $stream.pos += 2) / 256;
            }
            Parser.readFixed8 = readFixed8;
            function readFloat16($bytes, $stream) {
                var ui16 = $stream.getUint16($stream.pos);
                $stream.pos += 2;
                var sign = ui16 >> 15 ? -1 : 1;
                var exponent = (ui16 & 0x7c00) >> 10;
                var fraction = ui16 & 0x03ff;
                if (!exponent)
                    return sign * pow(2, -14) * (fraction / 1024);
                if (exponent === 0x1f)
                    return fraction ? NaN : sign * Infinity;
                return sign * pow(2, exponent - 15) * (1 + (fraction / 1024));
            }
            Parser.readFloat16 = readFloat16;
            function readFloat($bytes, $stream) {
                return $stream.getFloat32($stream.pos, $stream.pos += 4);
            }
            Parser.readFloat = readFloat;
            function readDouble($bytes, $stream) {
                return $stream.getFloat64($stream.pos, $stream.pos += 8);
            }
            Parser.readDouble = readDouble;
            function readEncodedU32($bytes, $stream) {
                var val = $bytes[$stream.pos++];
                if (!(val & 0x080))
                    return val;
                val = (val & 0x7f) | $bytes[$stream.pos++] << 7;
                if (!(val & 0x4000))
                    return val;
                val = (val & 0x3fff) | $bytes[$stream.pos++] << 14;
                if (!(val & 0x200000))
                    return val;
                val = (val & 0x1FFFFF) | $bytes[$stream.pos++] << 21;
                if (!(val & 0x10000000))
                    return val;
                return (val & 0xFFFFFFF) | ($bytes[$stream.pos++] << 28);
            }
            Parser.readEncodedU32 = readEncodedU32;
            function readBool($bytes, $stream) {
                return !!$bytes[$stream.pos++];
            }
            Parser.readBool = readBool;
            function align($bytes, $stream) {
                $stream.align();
            }
            Parser.align = align;
            function readSb($bytes, $stream, size) {
                return (readUb($bytes, $stream, size) << (32 - size)) >> (32 - size);
            }
            Parser.readSb = readSb;
            var masks = new Uint32Array(33);
            for (var i = 1, mask = 0; i <= 32; ++i) {
                masks[i] = mask = (mask << 1) | 1;
            }
            function readUb($bytes, $stream, size) {
                var buffer = $stream.bitBuffer;
                var bitlen = $stream.bitLength;
                while (size > bitlen) {
                    buffer = (buffer << 8) | $bytes[$stream.pos++];
                    bitlen += 8;
                }
                bitlen -= size;
                var val = (buffer >>> bitlen) & masks[size];
                $stream.bitBuffer = buffer;
                $stream.bitLength = bitlen;
                return val;
            }
            Parser.readUb = readUb;
            function readFb($bytes, $stream, size) {
                return readSb($bytes, $stream, size) / 65536;
            }
            Parser.readFb = readFb;
            function readString($bytes, $stream, length) {
                var codes;
                var pos = $stream.pos;
                if (length > -1) {
                    codes = $bytes.subarray(pos, pos += length);
                }
                else {
                    length = 0;
                    for (var i = pos; $bytes[i]; i++) {
                        length++;
                    }
                    codes = $bytes.subarray(pos, pos += length);
                    pos++;
                }
                $stream.pos = pos;
                var str = Shumway.StringUtilities.utf8encode(codes);
                if (str.indexOf('\0') >= 0) {
                    str = str.split('\0').join('');
                }
                return str;
            }
            Parser.readString = readString;
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
            var LowLevel;
            (function (LowLevel) {
                function defineShape($bytes, $stream, output, swfVersion, tagCode) {
                    output || (output = {});
                    output.id = Parser.readUi16($bytes, $stream);
                    var lineBounds = output.lineBounds = {};
                    bbox($bytes, $stream, lineBounds, swfVersion, tagCode);
                    var isMorph = output.isMorph = tagCode === 46 || tagCode === 84;
                    if (isMorph) {
                        var lineBoundsMorph = output.lineBoundsMorph = {};
                        bbox($bytes, $stream, lineBoundsMorph, swfVersion, tagCode);
                    }
                    var canHaveStrokes = output.canHaveStrokes = tagCode === 83 || tagCode === 84;
                    if (canHaveStrokes) {
                        var fillBounds = output.fillBounds = {};
                        bbox($bytes, $stream, fillBounds, swfVersion, tagCode);
                        if (isMorph) {
                            var fillBoundsMorph = output.fillBoundsMorph = {};
                            bbox($bytes, $stream, fillBoundsMorph, swfVersion, tagCode);
                        }
                        output.flags = Parser.readUi8($bytes, $stream);
                    }
                    if (isMorph) {
                        output.offsetMorph = Parser.readUi32($bytes, $stream);
                        morphShapeWithStyle($bytes, $stream, output, swfVersion, tagCode, isMorph, canHaveStrokes);
                    }
                    else {
                        shapeWithStyle($bytes, $stream, output, swfVersion, tagCode, isMorph, canHaveStrokes);
                    }
                    return output;
                }
                function placeObject($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
                    var flags;
                    $ || ($ = {});
                    if (tagCode === 4 /* CODE_PLACE_OBJECT */) {
                        $.symbolId = Parser.readUi16($bytes, $stream);
                        $.depth = Parser.readUi16($bytes, $stream);
                        $.flags |= 4 /* HasMatrix */;
                        $.matrix = matrix($bytes, $stream);
                        if ($stream.pos < tagEnd) {
                            $.flags |= 8 /* HasColorTransform */;
                            var $31 = $.cxform = {};
                            cxform($bytes, $stream, $31, tagCode);
                        }
                        return $;
                    }
                    flags = $.flags = tagCode > 26 /* CODE_PLACE_OBJECT2 */ ? Parser.readUi16($bytes, $stream) : Parser.readUi8($bytes, $stream);
                    $.depth = Parser.readUi16($bytes, $stream);
                    if (flags & 2048 /* HasClassName */) {
                        $.className = Parser.readString($bytes, $stream, -1);
                    }
                    if (flags & 2 /* HasCharacter */) {
                        $.symbolId = Parser.readUi16($bytes, $stream);
                    }
                    if (flags & 4 /* HasMatrix */) {
                        $.matrix = matrix($bytes, $stream);
                    }
                    if (flags & 8 /* HasColorTransform */) {
                        var $1 = $.cxform = {};
                        cxform($bytes, $stream, $1, tagCode);
                    }
                    if (flags & 16 /* HasRatio */) {
                        $.ratio = Parser.readUi16($bytes, $stream);
                    }
                    if (flags & 32 /* HasName */) {
                        $.name = Parser.readString($bytes, $stream, -1);
                    }
                    if (flags & 64 /* HasClipDepth */) {
                        $.clipDepth = Parser.readUi16($bytes, $stream);
                    }
                    if (flags & 256 /* HasFilterList */) {
                        var count = Parser.readUi8($bytes, $stream);
                        var $2 = $.filters = [];
                        var $3 = count;
                        while ($3--) {
                            var $4 = {};
                            anyFilter($bytes, $stream, $4);
                            $2.push($4);
                        }
                    }
                    if (flags & 512 /* HasBlendMode */) {
                        $.blendMode = Parser.readUi8($bytes, $stream);
                    }
                    if (flags & 1024 /* HasCacheAsBitmap */) {
                        $.bmpCache = Parser.readUi8($bytes, $stream);
                    }
                    if (flags & 8192 /* HasVisible */) {
                        $.visibility = Parser.readUi8($bytes, $stream);
                    }
                    if (flags & 16384 /* OpaqueBackground */) {
                        $.backgroundColor = argb($bytes, $stream);
                    }
                    if (flags & 128 /* HasClipActions */) {
                        var reserved = Parser.readUi16($bytes, $stream);
                        if (swfVersion >= 6) {
                            var allFlags = Parser.readUi32($bytes, $stream);
                        }
                        else {
                            var allFlags = Parser.readUi16($bytes, $stream);
                        }
                        var $28 = $.events = [];
                        do {
                            var $29 = {};
                            if (events($bytes, $stream, $29, swfVersion)) {
                                break;
                            }
                            if ($stream.pos > tagEnd) {
                                Shumway.Debug.warning('PlaceObject handler attempted to read clip events beyond tag end');
                                $stream.pos = tagEnd;
                                break;
                            }
                            $28.push($29);
                        } while (true);
                    }
                    return $;
                }
                function removeObject($bytes, $stream, $, swfVersion, tagCode) {
                    $ || ($ = {});
                    if (tagCode === 5) {
                        $.symbolId = Parser.readUi16($bytes, $stream);
                    }
                    $.depth = Parser.readUi16($bytes, $stream);
                    return $;
                }
                function defineImage($bytes, $stream, $, swfVersion, tagCode, tagEnd, jpegTables) {
                    var imgData;
                    var tag = $ || {};
                    tag.id = Parser.readUi16($bytes, $stream);
                    if (tagCode > 21) {
                        var alphaDataOffset = Parser.readUi32($bytes, $stream);
                        if (tagCode === 90) {
                            tag.deblock = Parser.readFixed8($bytes, $stream);
                        }
                        alphaDataOffset += $stream.pos;
                        imgData = tag.imgData = $bytes.subarray($stream.pos, alphaDataOffset);
                        tag.alphaData = $bytes.subarray(alphaDataOffset, tagEnd);
                        $stream.pos = tagEnd;
                    }
                    else {
                        imgData = tag.imgData = $bytes.subarray($stream.pos, tagEnd);
                        $stream.pos = tagEnd;
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
                    tag.jpegTables = tagCode === 6 ? jpegTables : null;
                    return tag;
                }
                LowLevel.defineImage = defineImage;
                function defineButton($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
                    var eob;
                    $ || ($ = {});
                    $.id = Parser.readUi16($bytes, $stream);
                    if (tagCode == 7 /* CODE_DEFINE_BUTTON */) {
                        var characters = $.characters = [];
                        do {
                            var $1 = {};
                            var temp = button($bytes, $stream, $1, swfVersion, tagCode);
                            eob = temp.eob;
                            characters.push($1);
                        } while (!eob);
                        $.actionsData = $bytes.subarray($stream.pos, tagEnd);
                        $stream.pos = tagEnd;
                    }
                    else {
                        var trackFlags = Parser.readUi8($bytes, $stream);
                        $.trackAsMenu = trackFlags >> 7 & 1;
                        var actionOffset = Parser.readUi16($bytes, $stream);
                        var characters = $.characters = [];
                        do {
                            var $29 = {};
                            var flags = Parser.readUi8($bytes, $stream);
                            var eob = $29.eob = !flags;
                            if (swfVersion >= 8) {
                                $29.flags = (flags >> 5 & 1 ? 512 /* HasBlendMode */ : 0) | (flags >> 4 & 1 ? 256 /* HasFilterList */ : 0);
                            }
                            else {
                                $29.flags = 0;
                            }
                            $29.stateHitTest = flags >> 3 & 1;
                            $29.stateDown = flags >> 2 & 1;
                            $29.stateOver = flags >> 1 & 1;
                            $29.stateUp = flags & 1;
                            if (!eob) {
                                $29.symbolId = Parser.readUi16($bytes, $stream);
                                $29.depth = Parser.readUi16($bytes, $stream);
                                $29.matrix = matrix($bytes, $stream);
                                if (tagCode === 34) {
                                    var $31 = $29.cxform = {};
                                    cxform($bytes, $stream, $31, tagCode);
                                }
                                if ($29.flags & 256 /* HasFilterList */) {
                                    var count = Parser.readUi8($bytes, $stream);
                                    var $2 = $.filters = [];
                                    var $3 = count;
                                    while ($3--) {
                                        var $4 = {};
                                        anyFilter($bytes, $stream, $4);
                                        $2.push($4);
                                    }
                                }
                                if ($29.flags & 512 /* HasBlendMode */) {
                                    $29.blendMode = Parser.readUi8($bytes, $stream);
                                }
                            }
                            characters.push($29);
                        } while (!eob);
                        if (!!actionOffset) {
                            var $56 = $.buttonActions = [];
                            while ($stream.pos < tagEnd) {
                                var $57 = buttonCondAction($bytes, $stream, tagEnd);
                                // Ignore actions that exceed the tag length.
                                if ($stream.pos > tagEnd) {
                                    break;
                                }
                                $56.push($57);
                            }
                            $stream.pos = tagEnd;
                        }
                    }
                    return $;
                }
                function defineBinaryData($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
                    $ || ($ = {});
                    $.id = Parser.readUi16($bytes, $stream);
                    Parser.readUi32($bytes, $stream); // Reserved
                    $.data = $bytes.subarray($stream.pos, tagEnd);
                    $stream.pos = tagEnd;
                    return $;
                }
                function defineFont($bytes, $stream, $, swfVersion, tagCode) {
                    $ || ($ = {});
                    $.id = Parser.readUi16($bytes, $stream);
                    var firstOffset = Parser.readUi16($bytes, $stream);
                    var glyphCount = $.glyphCount = firstOffset / 2;
                    var restOffsets = [];
                    var $0 = glyphCount - 1;
                    while ($0--) {
                        restOffsets.push(Parser.readUi16($bytes, $stream));
                    }
                    $.offsets = [firstOffset].concat(restOffsets);
                    var $1 = $.glyphs = [];
                    var $2 = glyphCount;
                    while ($2--) {
                        var $3 = {};
                        shape($bytes, $stream, $3, swfVersion, tagCode);
                        $1.push($3);
                    }
                    return $;
                }
                LowLevel.defineFont = defineFont;
                function defineLabel($bytes, $stream, $, swfVersion, tagCode) {
                    var eot;
                    $ || ($ = {});
                    $.id = Parser.readUi16($bytes, $stream);
                    var $0 = $.bbox = {};
                    bbox($bytes, $stream, $0, swfVersion, tagCode);
                    $.matrix = matrix($bytes, $stream);
                    var glyphBits = $.glyphBits = Parser.readUi8($bytes, $stream);
                    var advanceBits = $.advanceBits = Parser.readUi8($bytes, $stream);
                    var $2 = $.records = [];
                    do {
                        var $3 = {};
                        var temp = textRecord($bytes, $stream, $3, swfVersion, tagCode, glyphBits, advanceBits);
                        eot = temp.eot;
                        $2.push($3);
                    } while (!eot);
                    return $;
                }
                function defineSound($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
                    $ || ($ = {});
                    $.id = Parser.readUi16($bytes, $stream);
                    var soundFlags = Parser.readUi8($bytes, $stream);
                    $.soundFormat = soundFlags >> 4 & 15;
                    $.soundRate = soundFlags >> 2 & 3;
                    $.soundSize = soundFlags >> 1 & 1;
                    $.soundType = soundFlags & 1;
                    $.samplesCount = Parser.readUi32($bytes, $stream);
                    $.soundData = $bytes.subarray($stream.pos, tagEnd);
                    $stream.pos = tagEnd;
                    return $;
                }
                function startSound($bytes, $stream, $, swfVersion, tagCode) {
                    $ || ($ = {});
                    if (tagCode == 15) {
                        $.soundId = Parser.readUi16($bytes, $stream);
                    }
                    if (tagCode == 89) {
                        $.soundClassName = Parser.readString($bytes, $stream, -1);
                    }
                    $.soundInfo = soundInfo($bytes, $stream);
                    return $;
                }
                function soundStreamHead($bytes, $stream, tagEnd) {
                    var $ = {};
                    var playbackFlags = Parser.readUi8($bytes, $stream);
                    $.playbackRate = playbackFlags >> 2 & 3;
                    $.playbackSize = playbackFlags >> 1 & 1;
                    $.playbackType = playbackFlags & 1;
                    var streamFlags = Parser.readUi8($bytes, $stream);
                    var streamCompression = $.streamCompression = streamFlags >> 4 & 15;
                    $.streamRate = streamFlags >> 2 & 3;
                    $.streamSize = streamFlags >> 1 & 1;
                    $.streamType = streamFlags & 1;
                    $.samplesCount = Parser.readUi16($bytes, $stream);
                    if (streamCompression == 2 && tagEnd - $stream.pos >= 2) {
                        $.latencySeek = Parser.readSi16($bytes, $stream);
                    }
                    return $;
                }
                LowLevel.soundStreamHead = soundStreamHead;
                function defineBitmap(bytes, stream, $, swfVersion, tagCode, tagEnd) {
                    var tag = $ || {};
                    tag.id = Parser.readUi16(bytes, stream);
                    var format = tag.format = Parser.readUi8(bytes, stream);
                    tag.width = Parser.readUi16(bytes, stream);
                    tag.height = Parser.readUi16(bytes, stream);
                    tag.hasAlpha = tagCode === 36;
                    if (format === 3) {
                        tag.colorTableSize = Parser.readUi8(bytes, stream);
                    }
                    tag.bmpData = bytes.subarray(stream.pos, tagEnd);
                    stream.pos = tagEnd;
                    return tag;
                }
                LowLevel.defineBitmap = defineBitmap;
                function defineText($bytes, $stream, $, swfVersion, tagCode) {
                    $ || ($ = {});
                    $.id = Parser.readUi16($bytes, $stream);
                    var $0 = $.bbox = {};
                    bbox($bytes, $stream, $0, swfVersion, tagCode);
                    var flags = Parser.readUi16($bytes, $stream);
                    var hasText = $.hasText = flags >> 7 & 1;
                    $.wordWrap = flags >> 6 & 1;
                    $.multiline = flags >> 5 & 1;
                    $.password = flags >> 4 & 1;
                    $.readonly = flags >> 3 & 1;
                    var hasColor = $.hasColor = flags >> 2 & 1;
                    var hasMaxLength = $.hasMaxLength = flags >> 1 & 1;
                    var hasFont = $.hasFont = flags & 1;
                    var hasFontClass = $.hasFontClass = flags >> 15 & 1;
                    $.autoSize = flags >> 14 & 1;
                    var hasLayout = $.hasLayout = flags >> 13 & 1;
                    $.noSelect = flags >> 12 & 1;
                    $.border = flags >> 11 & 1;
                    $.wasStatic = flags >> 10 & 1;
                    $.html = flags >> 9 & 1;
                    $.useOutlines = flags >> 8 & 1;
                    if (hasFont) {
                        $.fontId = Parser.readUi16($bytes, $stream);
                    }
                    if (hasFontClass) {
                        $.fontClass = Parser.readString($bytes, $stream, -1);
                    }
                    if (hasFont) {
                        $.fontHeight = Parser.readUi16($bytes, $stream);
                    }
                    if (hasColor) {
                        $.color = rgba($bytes, $stream);
                    }
                    if (hasMaxLength) {
                        $.maxLength = Parser.readUi16($bytes, $stream);
                    }
                    if (hasLayout) {
                        $.align = Parser.readUi8($bytes, $stream);
                        $.leftMargin = Parser.readUi16($bytes, $stream);
                        $.rightMargin = Parser.readUi16($bytes, $stream);
                        $.indent = Parser.readSi16($bytes, $stream);
                        $.leading = Parser.readSi16($bytes, $stream);
                    }
                    $.variableName = Parser.readString($bytes, $stream, -1);
                    if (hasText) {
                        $.initialText = Parser.readString($bytes, $stream, -1);
                    }
                    return $;
                }
                function defineFont2($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
                    $ || ($ = {});
                    $.id = Parser.readUi16($bytes, $stream);
                    var flags = Parser.readUi8($bytes, $stream);
                    var hasLayout = $.hasLayout = (flags & 0x80) ? 1 : 0;
                    $.shiftJis = (swfVersion > 5 && flags & 0x40) ? 1 : 0;
                    $.smallText = (flags & 0x20) ? 1 : 0;
                    $.ansi = (flags & 0x10) ? 1 : 0;
                    var wideOffset = $.wideOffset = (flags & 0x08) ? 1 : 0;
                    var wide = $.wide = (flags & 0x04) ? 1 : 0;
                    $.italic = (flags & 0x02) ? 1 : 0;
                    $.bold = (flags & 0x01) ? 1 : 0;
                    if (swfVersion > 5) {
                        $.language = Parser.readUi8($bytes, $stream);
                    }
                    else {
                        // Skip reserved byte.
                        Parser.readUi8($bytes, $stream);
                        $.language = 0;
                    }
                    var nameLength = Parser.readUi8($bytes, $stream);
                    $.name = Parser.readString($bytes, $stream, nameLength);
                    if (tagCode === 75) {
                        $.resolution = 20;
                    }
                    var glyphCount = $.glyphCount = Parser.readUi16($bytes, $stream);
                    // The SWF format docs don't say that, but the DefineFont{2,3} tag ends here for device fonts.
                    if (glyphCount === 0) {
                        return $;
                    }
                    var startpos = $stream.pos;
                    if (wideOffset) {
                        var $0 = $.offsets = [];
                        var $1 = glyphCount;
                        while ($1--) {
                            $0.push(Parser.readUi32($bytes, $stream));
                        }
                        $.mapOffset = Parser.readUi32($bytes, $stream);
                    }
                    else {
                        var $2 = $.offsets = [];
                        var $3 = glyphCount;
                        while ($3--) {
                            $2.push(Parser.readUi16($bytes, $stream));
                        }
                        $.mapOffset = Parser.readUi16($bytes, $stream);
                    }
                    var $4 = $.glyphs = [];
                    var $5 = glyphCount;
                    while ($5--) {
                        var $6 = {};
                        var dist = $.offsets[glyphCount - $5] + startpos - $stream.pos;
                        // when just one byte difference between two offsets, just read that and insert a eos record
                        if (dist === 1) {
                            Parser.readUi8($bytes, $stream);
                            $4.push({ "records": [{ "type": 0, "eos": true, "hasNewStyles": 0, "hasLineStyle": 0, "hasFillStyle1": 0, "hasFillStyle0": 0, "move": 0 }] });
                            continue;
                        }
                        shape($bytes, $stream, $6, swfVersion, tagCode);
                        $4.push($6);
                    }
                    if (wide) {
                        var $47 = $.codes = [];
                        var $48 = glyphCount;
                        while ($48--) {
                            $47.push(Parser.readUi16($bytes, $stream));
                        }
                    }
                    else {
                        var $49 = $.codes = [];
                        var $50 = glyphCount;
                        while ($50--) {
                            $49.push(Parser.readUi8($bytes, $stream));
                        }
                    }
                    if (hasLayout) {
                        $.ascent = Parser.readUi16($bytes, $stream);
                        $.descent = Parser.readUi16($bytes, $stream);
                        $.leading = Parser.readSi16($bytes, $stream);
                        var $51 = $.advance = [];
                        var $52 = glyphCount;
                        while ($52--) {
                            $51.push(Parser.readSi16($bytes, $stream));
                        }
                        var $53 = $.bbox = [];
                        var $54 = glyphCount;
                        while ($54--) {
                            var $55 = {};
                            bbox($bytes, $stream, $55, swfVersion, tagCode);
                            $53.push($55);
                        }
                        var kerningCount = Parser.readUi16($bytes, $stream);
                        var $56 = $.kerning = [];
                        var $57 = kerningCount;
                        while ($57-- && tagEnd - $stream.pos >= (wide ? 4 : 2) + 2) {
                            var $58 = {};
                            kerning($bytes, $stream, $58, wide);
                            $56.push($58);
                        }
                    }
                    return $;
                }
                LowLevel.defineFont2 = defineFont2;
                function defineFont4($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
                    $ || ($ = {});
                    $.id = Parser.readUi16($bytes, $stream);
                    var flags = Parser.readUi8($bytes, $stream);
                    var hasFontData = $.hasFontData = (flags & 0x4) ? 1 : 0;
                    $.italic = (flags & 0x2) ? 1 : 0;
                    $.bold = (flags & 0x1) ? 1 : 0;
                    $.name = Parser.readString($bytes, $stream, -1);
                    if (hasFontData) {
                        $.data = $bytes.subarray($stream.pos, tagEnd);
                        $stream.pos = tagEnd;
                    }
                    return $;
                }
                LowLevel.defineFont4 = defineFont4;
                function defineScalingGrid($bytes, $stream, $, swfVersion, tagCode) {
                    $ || ($ = {});
                    $.symbolId = Parser.readUi16($bytes, $stream);
                    var $0 = $.splitter = {};
                    bbox($bytes, $stream, $0, swfVersion, tagCode);
                    return $;
                }
                function defineScene($bytes, $stream, $) {
                    $ || ($ = {});
                    var sceneCount = Parser.readEncodedU32($bytes, $stream);
                    var $0 = $.scenes = [];
                    var $1 = sceneCount;
                    while ($1--) {
                        var $2 = {};
                        $2.offset = Parser.readEncodedU32($bytes, $stream);
                        $2.name = Parser.readString($bytes, $stream, -1);
                        $0.push($2);
                    }
                    var labelCount = Parser.readEncodedU32($bytes, $stream);
                    var $3 = $.labels = [];
                    var $4 = labelCount;
                    while ($4--) {
                        var $5 = {};
                        $5.frame = Parser.readEncodedU32($bytes, $stream);
                        $5.name = Parser.readString($bytes, $stream, -1);
                        $3.push($5);
                    }
                    return $;
                }
                LowLevel.defineScene = defineScene;
                function bbox($bytes, $stream, $, swfVersion, tagCode) {
                    Parser.align($bytes, $stream);
                    var bits = Parser.readUb($bytes, $stream, 5);
                    var xMin = Parser.readSb($bytes, $stream, bits);
                    var xMax = Parser.readSb($bytes, $stream, bits);
                    var yMin = Parser.readSb($bytes, $stream, bits);
                    var yMax = Parser.readSb($bytes, $stream, bits);
                    $.xMin = xMin;
                    $.xMax = xMax;
                    $.yMin = yMin;
                    $.yMax = yMax;
                    Parser.align($bytes, $stream);
                }
                function rgb($bytes, $stream) {
                    return ((Parser.readUi8($bytes, $stream) << 24) | (Parser.readUi8($bytes, $stream) << 16) | (Parser.readUi8($bytes, $stream) << 8) | 0xff) >>> 0;
                }
                LowLevel.rgb = rgb;
                function rgba($bytes, $stream) {
                    return (Parser.readUi8($bytes, $stream) << 24) | (Parser.readUi8($bytes, $stream) << 16) | (Parser.readUi8($bytes, $stream) << 8) | Parser.readUi8($bytes, $stream);
                }
                function argb($bytes, $stream) {
                    return Parser.readUi8($bytes, $stream) | (Parser.readUi8($bytes, $stream) << 24) | (Parser.readUi8($bytes, $stream) << 16) | (Parser.readUi8($bytes, $stream) << 8);
                }
                function matrix($bytes, $stream) {
                    var $ = {};
                    Parser.align($bytes, $stream);
                    var hasScale = Parser.readUb($bytes, $stream, 1);
                    if (hasScale) {
                        var bits = Parser.readUb($bytes, $stream, 5);
                        $.a = Parser.readFb($bytes, $stream, bits);
                        $.d = Parser.readFb($bytes, $stream, bits);
                    }
                    else {
                        $.a = 1;
                        $.d = 1;
                    }
                    var hasRotate = Parser.readUb($bytes, $stream, 1);
                    if (hasRotate) {
                        var bits = Parser.readUb($bytes, $stream, 5);
                        $.b = Parser.readFb($bytes, $stream, bits);
                        $.c = Parser.readFb($bytes, $stream, bits);
                    }
                    else {
                        $.b = 0;
                        $.c = 0;
                    }
                    var bits = Parser.readUb($bytes, $stream, 5);
                    var e = Parser.readSb($bytes, $stream, bits);
                    var f = Parser.readSb($bytes, $stream, bits);
                    $.tx = e;
                    $.ty = f;
                    Parser.align($bytes, $stream);
                    return $;
                }
                function cxform($bytes, $stream, $, tagCode) {
                    Parser.align($bytes, $stream);
                    var hasOffsets = Parser.readUb($bytes, $stream, 1);
                    var hasMultipliers = Parser.readUb($bytes, $stream, 1);
                    var bits = Parser.readUb($bytes, $stream, 4);
                    if (hasMultipliers) {
                        $.redMultiplier = Parser.readSb($bytes, $stream, bits);
                        $.greenMultiplier = Parser.readSb($bytes, $stream, bits);
                        $.blueMultiplier = Parser.readSb($bytes, $stream, bits);
                        if (tagCode > 4) {
                            $.alphaMultiplier = Parser.readSb($bytes, $stream, bits);
                        }
                        else {
                            $.alphaMultiplier = 256;
                        }
                    }
                    else {
                        $.redMultiplier = 256;
                        $.greenMultiplier = 256;
                        $.blueMultiplier = 256;
                        $.alphaMultiplier = 256;
                    }
                    if (hasOffsets) {
                        $.redOffset = Parser.readSb($bytes, $stream, bits);
                        $.greenOffset = Parser.readSb($bytes, $stream, bits);
                        $.blueOffset = Parser.readSb($bytes, $stream, bits);
                        if (tagCode > 4) {
                            $.alphaOffset = Parser.readSb($bytes, $stream, bits);
                        }
                        else {
                            $.alphaOffset = 0;
                        }
                    }
                    else {
                        $.redOffset = 0;
                        $.greenOffset = 0;
                        $.blueOffset = 0;
                        $.alphaOffset = 0;
                    }
                    Parser.align($bytes, $stream);
                }
                function gradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type) {
                    if (tagCode === 83) {
                        $.spreadMode = Parser.readUb($bytes, $stream, 2);
                        $.interpolationMode = Parser.readUb($bytes, $stream, 2);
                    }
                    else {
                        var pad = Parser.readUb($bytes, $stream, 4);
                    }
                    var count = $.count = Parser.readUb($bytes, $stream, 4);
                    var $130 = $.records = [];
                    var $131 = count;
                    while ($131--) {
                        var $132 = {};
                        gradientRecord($bytes, $stream, $132, tagCode, isMorph);
                        $130.push($132);
                    }
                    if (type === 19) {
                        $.focalPoint = Parser.readSi16($bytes, $stream);
                        if (isMorph) {
                            $.focalPointMorph = Parser.readSi16($bytes, $stream);
                        }
                    }
                }
                function gradientRecord($bytes, $stream, $, tagCode, isMorph) {
                    $.ratio = Parser.readUi8($bytes, $stream);
                    if (tagCode > 22) {
                        $.color = rgba($bytes, $stream);
                    }
                    else {
                        $.color = rgb($bytes, $stream);
                    }
                    if (isMorph) {
                        $.ratioMorph = Parser.readUi8($bytes, $stream);
                        $.colorMorph = rgba($bytes, $stream);
                    }
                }
                function morphShapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
                    var eos, bits, temp;
                    temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
                    var lineBits = temp.lineBits;
                    var fillBits = temp.fillBits;
                    var records = $.records = [];
                    do {
                        var record = {};
                        temp = shapeRecord($bytes, $stream, record, swfVersion, tagCode, isMorph, fillBits, lineBits, hasStrokes, bits);
                        eos = temp.eos;
                        fillBits = temp.fillBits;
                        lineBits = temp.lineBits;
                        bits = temp.bits;
                        records.push(record);
                    } while (!eos);
                    temp = styleBits($bytes, $stream);
                    var fillBits = temp.fillBits;
                    var lineBits = temp.lineBits;
                    var recordsMorph = $.recordsMorph = [];
                    do {
                        var morphRecord = {};
                        temp = shapeRecord($bytes, $stream, morphRecord, swfVersion, tagCode, isMorph, fillBits, lineBits, hasStrokes, bits);
                        eos = temp.eos;
                        fillBits = temp.fillBits;
                        lineBits = temp.lineBits;
                        bits = temp.bits;
                        recordsMorph.push(morphRecord);
                    } while (!eos);
                }
                function shapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
                    var eos, bits, temp;
                    temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
                    var fillBits = temp.fillBits;
                    var lineBits = temp.lineBits;
                    var $160 = $.records = [];
                    do {
                        var $161 = {};
                        temp = shapeRecord($bytes, $stream, $161, swfVersion, tagCode, isMorph, fillBits, lineBits, hasStrokes, bits);
                        eos = temp.eos;
                        fillBits = temp.fillBits;
                        lineBits = temp.lineBits;
                        bits = temp.bits;
                        $160.push($161);
                    } while (!eos);
                }
                function shapeRecord($bytes, $stream, $, swfVersion, tagCode, isMorph, fillBits, lineBits, hasStrokes, bits) {
                    var eos, temp;
                    var type = $.type = Parser.readUb($bytes, $stream, 1);
                    var flags = Parser.readUb($bytes, $stream, 5);
                    eos = $.eos = !(type || flags);
                    if (type) {
                        temp = shapeRecordEdge($bytes, $stream, $, flags);
                        bits = temp.bits;
                    }
                    else {
                        temp = shapeRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags, isMorph, fillBits, lineBits, hasStrokes, bits);
                        fillBits = temp.fillBits;
                        lineBits = temp.lineBits;
                        bits = temp.bits;
                    }
                    return {
                        type: type,
                        flags: flags,
                        eos: eos,
                        fillBits: fillBits,
                        lineBits: lineBits,
                        bits: bits
                    };
                }
                function shapeRecordEdge($bytes, $stream, $, flags) {
                    var bits = (flags & 0x0f) + 2;
                    var isStraight = $.isStraight = flags >> 4;
                    if (isStraight) {
                        var isGeneral = $.isGeneral = Parser.readUb($bytes, $stream, 1);
                        if (isGeneral) {
                            $.deltaX = Parser.readSb($bytes, $stream, bits);
                            $.deltaY = Parser.readSb($bytes, $stream, bits);
                        }
                        else {
                            var isVertical = $.isVertical = Parser.readUb($bytes, $stream, 1);
                            if (isVertical) {
                                $.deltaY = Parser.readSb($bytes, $stream, bits);
                            }
                            else {
                                $.deltaX = Parser.readSb($bytes, $stream, bits);
                            }
                        }
                    }
                    else {
                        $.controlDeltaX = Parser.readSb($bytes, $stream, bits);
                        $.controlDeltaY = Parser.readSb($bytes, $stream, bits);
                        $.anchorDeltaX = Parser.readSb($bytes, $stream, bits);
                        $.anchorDeltaY = Parser.readSb($bytes, $stream, bits);
                    }
                    return { bits: bits };
                }
                function shapeRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags, isMorph, fillBits, lineBits, hasStrokes, bits) {
                    var hasNewStyles = $.hasNewStyles = tagCode > 2 ? flags >> 4 : 0;
                    var hasLineStyle = $.hasLineStyle = flags >> 3 & 1;
                    var hasFillStyle1 = $.hasFillStyle1 = flags >> 2 & 1;
                    var hasFillStyle0 = $.hasFillStyle0 = flags >> 1 & 1;
                    var move = $.move = flags & 1;
                    if (move) {
                        bits = Parser.readUb($bytes, $stream, 5);
                        $.moveX = Parser.readSb($bytes, $stream, bits);
                        $.moveY = Parser.readSb($bytes, $stream, bits);
                    }
                    if (hasFillStyle0) {
                        $.fillStyle0 = Parser.readUb($bytes, $stream, fillBits);
                    }
                    if (hasFillStyle1) {
                        $.fillStyle1 = Parser.readUb($bytes, $stream, fillBits);
                    }
                    if (hasLineStyle) {
                        $.lineStyle = Parser.readUb($bytes, $stream, lineBits);
                    }
                    if (hasNewStyles) {
                        var temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
                        lineBits = temp.lineBits;
                        fillBits = temp.fillBits;
                    }
                    return {
                        lineBits: lineBits,
                        fillBits: fillBits,
                        bits: bits
                    };
                }
                function styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
                    fillStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph);
                    lineStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
                    var temp = styleBits($bytes, $stream);
                    var fillBits = temp.fillBits;
                    var lineBits = temp.lineBits;
                    return { fillBits: fillBits, lineBits: lineBits };
                }
                function fillStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph) {
                    var count;
                    var tmp = Parser.readUi8($bytes, $stream);
                    if (tagCode > 2 && tmp === 255) {
                        count = Parser.readUi16($bytes, $stream);
                    }
                    else {
                        count = tmp;
                    }
                    var $4 = $.fillStyles = [];
                    var $5 = count;
                    while ($5--) {
                        var $6 = {};
                        fillStyle($bytes, $stream, $6, swfVersion, tagCode, isMorph);
                        $4.push($6);
                    }
                }
                function lineStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
                    var count;
                    var tmp = Parser.readUi8($bytes, $stream);
                    if (tagCode > 2 && tmp === 255) {
                        count = Parser.readUi16($bytes, $stream);
                    }
                    else {
                        count = tmp;
                    }
                    var $138 = $.lineStyles = [];
                    var $139 = count;
                    while ($139--) {
                        var $140 = {};
                        lineStyle($bytes, $stream, $140, swfVersion, tagCode, isMorph, hasStrokes);
                        $138.push($140);
                    }
                }
                function styleBits($bytes, $stream) {
                    Parser.align($bytes, $stream);
                    var fillBits = Parser.readUb($bytes, $stream, 4);
                    var lineBits = Parser.readUb($bytes, $stream, 4);
                    return {
                        fillBits: fillBits,
                        lineBits: lineBits
                    };
                }
                function fillStyle($bytes, $stream, $, swfVersion, tagCode, isMorph) {
                    var type = $.type = Parser.readUi8($bytes, $stream);
                    switch (type) {
                        case 0:
                            $.color = tagCode > 22 || isMorph ? rgba($bytes, $stream) : rgb($bytes, $stream);
                            if (isMorph) {
                                $.colorMorph = rgba($bytes, $stream);
                            }
                            break;
                        case 16:
                        case 18:
                        case 19:
                            $.matrix = matrix($bytes, $stream);
                            if (isMorph) {
                                $.matrixMorph = matrix($bytes, $stream);
                            }
                            gradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type);
                            break;
                        case 64:
                        case 65:
                        case 66:
                        case 67:
                            $.bitmapId = Parser.readUi16($bytes, $stream);
                            $.condition = type === 64 || type === 67;
                            $.matrix = matrix($bytes, $stream);
                            if (isMorph) {
                                $.matrixMorph = matrix($bytes, $stream);
                            }
                            break;
                        default:
                    }
                }
                function lineStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
                    $.width = Parser.readUi16($bytes, $stream);
                    if (isMorph) {
                        $.widthMorph = Parser.readUi16($bytes, $stream);
                    }
                    if (hasStrokes) {
                        Parser.align($bytes, $stream);
                        $.startCapsStyle = Parser.readUb($bytes, $stream, 2);
                        var jointStyle = $.jointStyle = Parser.readUb($bytes, $stream, 2);
                        var hasFill = $.hasFill = Parser.readUb($bytes, $stream, 1);
                        $.noHscale = Parser.readUb($bytes, $stream, 1);
                        $.noVscale = Parser.readUb($bytes, $stream, 1);
                        $.pixelHinting = Parser.readUb($bytes, $stream, 1);
                        var reserved = Parser.readUb($bytes, $stream, 5);
                        $.noClose = Parser.readUb($bytes, $stream, 1);
                        $.endCapsStyle = Parser.readUb($bytes, $stream, 2);
                        if (jointStyle === 2) {
                            $.miterLimitFactor = Parser.readFixed8($bytes, $stream);
                        }
                        if (hasFill) {
                            var $141 = $.fillStyle = {};
                            fillStyle($bytes, $stream, $141, swfVersion, tagCode, isMorph);
                        }
                        else {
                            $.color = rgba($bytes, $stream);
                            if (isMorph) {
                                $.colorMorph = rgba($bytes, $stream);
                            }
                        }
                    }
                    else {
                        if (tagCode > 22) {
                            $.color = rgba($bytes, $stream);
                        }
                        else {
                            $.color = rgb($bytes, $stream);
                        }
                        if (isMorph) {
                            $.colorMorph = rgba($bytes, $stream);
                        }
                    }
                }
                function filterGlow($bytes, $stream, $, type) {
                    var count;
                    if (type === 4 || type === 7) {
                        count = Parser.readUi8($bytes, $stream);
                    }
                    else {
                        count = 1;
                    }
                    var $5 = $.colors = [];
                    var $6 = count;
                    while ($6--) {
                        $5.push(rgba($bytes, $stream));
                    }
                    if (type === 3) {
                        $.hightlightColor = rgba($bytes, $stream);
                    }
                    if (type === 4 || type === 7) {
                        var $9 = $.ratios = [];
                        var $10 = count;
                        while ($10--) {
                            $9.push(Parser.readUi8($bytes, $stream));
                        }
                    }
                    $.blurX = Parser.readFixed($bytes, $stream);
                    $.blurY = Parser.readFixed($bytes, $stream);
                    if (type !== 2) {
                        $.angle = Parser.readFixed($bytes, $stream);
                        $.distance = Parser.readFixed($bytes, $stream);
                    }
                    $.strength = Parser.readFixed8($bytes, $stream);
                    $.inner = Parser.readUb($bytes, $stream, 1);
                    $.knockout = Parser.readUb($bytes, $stream, 1);
                    $.compositeSource = Parser.readUb($bytes, $stream, 1);
                    if (type === 3 || type === 4 || type === 7) {
                        $.onTop = Parser.readUb($bytes, $stream, 1);
                        $.quality = Parser.readUb($bytes, $stream, 4);
                    }
                    else {
                        $.quality = Parser.readUb($bytes, $stream, 5);
                    }
                }
                function filterBlur($bytes, $stream, $) {
                    $.blurX = Parser.readFixed($bytes, $stream);
                    $.blurY = Parser.readFixed($bytes, $stream);
                    $.quality = Parser.readUb($bytes, $stream, 5);
                    var reserved = Parser.readUb($bytes, $stream, 3);
                }
                function filterConvolution($bytes, $stream, $) {
                    var matrixX = $.matrixX = Parser.readUi8($bytes, $stream);
                    var matrixY = $.matrixY = Parser.readUi8($bytes, $stream);
                    $.divisor = Parser.readFloat($bytes, $stream);
                    $.bias = Parser.readFloat($bytes, $stream);
                    var $17 = $.matrix = [];
                    var $18 = matrixX * matrixY;
                    while ($18--) {
                        $17.push(Parser.readFloat($bytes, $stream));
                    }
                    $.color = rgba($bytes, $stream);
                    var reserved = Parser.readUb($bytes, $stream, 6);
                    $.clamp = Parser.readUb($bytes, $stream, 1);
                    $.preserveAlpha = Parser.readUb($bytes, $stream, 1);
                }
                function filterColorMatrix($bytes, $stream, $) {
                    var $20 = $.matrix = [];
                    var $21 = 20;
                    while ($21--) {
                        $20.push(Parser.readFloat($bytes, $stream));
                    }
                }
                function anyFilter($bytes, $stream, $) {
                    var type = $.type = Parser.readUi8($bytes, $stream);
                    switch (type) {
                        case 0:
                        case 2:
                        case 3:
                        case 4:
                        case 7:
                            filterGlow($bytes, $stream, $, type);
                            break;
                        case 1:
                            filterBlur($bytes, $stream, $);
                            break;
                        case 5:
                            filterConvolution($bytes, $stream, $);
                            break;
                        case 6:
                            filterColorMatrix($bytes, $stream, $);
                            break;
                        default:
                    }
                }
                function events($bytes, $stream, $, swfVersion) {
                    var flags = $.flags = swfVersion >= 6 ? Parser.readUi32($bytes, $stream) : Parser.readUi16($bytes, $stream);
                    if (!flags) {
                        // `true` means this is the EndOfEvents marker.
                        return true;
                    }
                    // The Construct event is only allowed in 7+. It can't be set in < 6, so mask it out for 6.
                    if (swfVersion === 6) {
                        flags = flags & ~262144 /* Construct */;
                    }
                    var length = $.length = Parser.readUi32($bytes, $stream);
                    if (flags & 131072 /* KeyPress */) {
                        $.keyCode = Parser.readUi8($bytes, $stream);
                        length--;
                    }
                    var end = $stream.pos + length;
                    $.actionsData = $bytes.subarray($stream.pos, end);
                    $stream.pos = end;
                    return false;
                }
                function kerning($bytes, $stream, $, wide) {
                    if (wide) {
                        $.code1 = Parser.readUi16($bytes, $stream);
                        $.code2 = Parser.readUi16($bytes, $stream);
                    }
                    else {
                        $.code1 = Parser.readUi8($bytes, $stream);
                        $.code2 = Parser.readUi8($bytes, $stream);
                    }
                    $.adjustment = Parser.readUi16($bytes, $stream);
                }
                function textEntry($bytes, $stream, $, glyphBits, advanceBits) {
                    $.glyphIndex = Parser.readUb($bytes, $stream, glyphBits);
                    $.advance = Parser.readSb($bytes, $stream, advanceBits);
                }
                function textRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags) {
                    var hasFont = $.hasFont = flags >> 3 & 1;
                    var hasColor = $.hasColor = flags >> 2 & 1;
                    var hasMoveY = $.hasMoveY = flags >> 1 & 1;
                    var hasMoveX = $.hasMoveX = flags & 1;
                    if (hasFont) {
                        $.fontId = Parser.readUi16($bytes, $stream);
                    }
                    if (hasColor) {
                        if (tagCode === 33) {
                            $.color = rgba($bytes, $stream);
                        }
                        else {
                            $.color = rgb($bytes, $stream);
                        }
                    }
                    if (hasMoveX) {
                        $.moveX = Parser.readSi16($bytes, $stream);
                    }
                    if (hasMoveY) {
                        $.moveY = Parser.readSi16($bytes, $stream);
                    }
                    if (hasFont) {
                        $.fontHeight = Parser.readUi16($bytes, $stream);
                    }
                }
                function textRecord($bytes, $stream, $, swfVersion, tagCode, glyphBits, advanceBits) {
                    var glyphCount;
                    Parser.align($bytes, $stream);
                    var flags = Parser.readUb($bytes, $stream, 8);
                    var eot = $.eot = !flags;
                    textRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags);
                    if (!eot) {
                        var tmp = Parser.readUi8($bytes, $stream);
                        if (swfVersion > 6) {
                            glyphCount = $.glyphCount = tmp;
                        }
                        else {
                            glyphCount = $.glyphCount = tmp; // & 0x7f;
                        }
                        var $6 = $.entries = [];
                        var $7 = glyphCount;
                        while ($7--) {
                            var $8 = {};
                            textEntry($bytes, $stream, $8, glyphBits, advanceBits);
                            $6.push($8);
                        }
                    }
                    return { eot: eot };
                }
                function soundEnvelope($bytes, $stream, $) {
                    $.pos44 = Parser.readUi32($bytes, $stream);
                    $.volumeLeft = Parser.readUi16($bytes, $stream);
                    $.volumeRight = Parser.readUi16($bytes, $stream);
                }
                function soundInfo($bytes, $stream) {
                    var $ = {};
                    var reserved = Parser.readUb($bytes, $stream, 2);
                    $.stop = Parser.readUb($bytes, $stream, 1);
                    $.noMultiple = Parser.readUb($bytes, $stream, 1);
                    var hasEnvelope = $.hasEnvelope = Parser.readUb($bytes, $stream, 1);
                    var hasLoops = $.hasLoops = Parser.readUb($bytes, $stream, 1);
                    var hasOutPoint = $.hasOutPoint = Parser.readUb($bytes, $stream, 1);
                    var hasInPoint = $.hasInPoint = Parser.readUb($bytes, $stream, 1);
                    if (hasInPoint) {
                        $.inPoint = Parser.readUi32($bytes, $stream);
                    }
                    if (hasOutPoint) {
                        $.outPoint = Parser.readUi32($bytes, $stream);
                    }
                    if (hasLoops) {
                        $.loopCount = Parser.readUi16($bytes, $stream);
                    }
                    if (hasEnvelope) {
                        var envelopeCount = $.envelopeCount = Parser.readUi8($bytes, $stream);
                        var $1 = $.envelopes = [];
                        var $2 = envelopeCount;
                        while ($2--) {
                            var $3 = {};
                            soundEnvelope($bytes, $stream, $3);
                            $1.push($3);
                        }
                    }
                    return $;
                }
                function button($bytes, $stream, $, swfVersion, tagCode) {
                    var flags = Parser.readUi8($bytes, $stream);
                    var eob = $.eob = !flags;
                    if (swfVersion >= 8) {
                        $.flags = (flags >> 5 & 1 ? 512 /* HasBlendMode */ : 0) | (flags >> 4 & 1 ? 256 /* HasFilterList */ : 0);
                    }
                    else {
                        $.flags = 0;
                    }
                    $.stateHitTest = flags >> 3 & 1;
                    $.stateDown = flags >> 2 & 1;
                    $.stateOver = flags >> 1 & 1;
                    $.stateUp = flags & 1;
                    if (!eob) {
                        $.symbolId = Parser.readUi16($bytes, $stream);
                        $.depth = Parser.readUi16($bytes, $stream);
                        $.matrix = matrix($bytes, $stream);
                        if (tagCode === 34 /* CODE_DEFINE_BUTTON2 */) {
                            var $3 = $.cxform = {};
                            cxform($bytes, $stream, $3, tagCode);
                        }
                        if ($.flags & 256 /* HasFilterList */) {
                            $.filterCount = Parser.readUi8($bytes, $stream);
                            var $4 = $.filters = {};
                            anyFilter($bytes, $stream, $4);
                        }
                        if ($.flags & 512 /* HasBlendMode */) {
                            $.blendMode = Parser.readUi8($bytes, $stream);
                        }
                    }
                    return { eob: eob };
                }
                function buttonCondAction($bytes, $stream, tagEnd) {
                    var start = $stream.pos;
                    var tagSize = Parser.readUi16($bytes, $stream);
                    // If no tagSize is given, read to the tag's end.
                    var end = tagSize ? start + tagSize : tagEnd;
                    var conditions = Parser.readUi16($bytes, $stream);
                    $stream.pos = end;
                    return {
                        // The 7 upper bits hold a key code the button should respond to.
                        keyCode: (conditions & 0xfe00) >> 9,
                        // The lower 9 bits hold state transition flags. See the enum in AVM1Button for details.
                        stateTransitionFlags: conditions & 0x1ff,
                        // If no tagSize is given, pass `0` to readBinary.
                        actionsData: $bytes.subarray(start + 4, end)
                    };
                }
                function shape($bytes, $stream, $, swfVersion, tagCode) {
                    var eos, bits, temp;
                    temp = styleBits($bytes, $stream);
                    var fillBits = temp.fillBits;
                    var lineBits = temp.lineBits;
                    var $4 = $.records = [];
                    do {
                        var $5 = {};
                        var isMorph = false; // FIXME Is this right?
                        var hasStrokes = false; // FIXME Is this right?
                        temp = shapeRecord($bytes, $stream, $5, swfVersion, tagCode, isMorph, fillBits, lineBits, hasStrokes, bits);
                        eos = temp.eos;
                        fillBits = temp.fillBits;
                        lineBits = temp.lineBits;
                        bits = temp.bits;
                        $4.push($5);
                    } while (!eos);
                }
                LowLevel.tagHandlers = {
                    /* End */ 0: undefined,
                    /* ShowFrame */ 1: undefined,
                    /* DefineShape */ 2: defineShape,
                    /* PlaceObject */ 4: placeObject,
                    /* RemoveObject */ 5: removeObject,
                    /* DefineBits */ 6: defineImage,
                    /* DefineButton */ 7: defineButton,
                    /* JPEGTables */ 8: undefined,
                    /* SetBackgroundColor */ 9: undefined,
                    /* DefineFont */ 10: defineFont,
                    /* DefineText */ 11: defineLabel,
                    /* DoAction */ 12: undefined,
                    /* DefineFontInfo */ 13: undefined,
                    /* DefineSound */ 14: defineSound,
                    /* StartSound */ 15: startSound,
                    /* DefineButtonSound */ 17: undefined,
                    /* SoundStreamHead */ 18: undefined,
                    /* SoundStreamBlock */ 19: undefined,
                    /* DefineBitsLossless */ 20: defineBitmap,
                    /* DefineBitsJPEG2 */ 21: defineImage,
                    /* DefineShape2 */ 22: defineShape,
                    /* DefineButtonCxform */ 23: undefined,
                    /* Protect */ 24: undefined,
                    /* PlaceObject2 */ 26: placeObject,
                    /* RemoveObject2 */ 28: removeObject,
                    /* DefineShape3 */ 32: defineShape,
                    /* DefineText2 */ 33: defineLabel,
                    /* DefineButton2 */ 34: defineButton,
                    /* DefineBitsJPEG3 */ 35: defineImage,
                    /* DefineBitsLossless2 */ 36: defineBitmap,
                    /* DefineEditText */ 37: defineText,
                    /* DefineSprite */ 39: undefined,
                    /* FrameLabel */ 43: undefined,
                    /* SoundStreamHead2 */ 45: undefined,
                    /* DefineMorphShape */ 46: defineShape,
                    /* DefineFont2 */ 48: defineFont2,
                    /* ExportAssets */ 56: undefined,
                    /* ImportAssets */ 57: undefined,
                    /* EnableDebugger */ 58: undefined,
                    /* DoInitAction */ 59: undefined,
                    /* DefineVideoStream */ 60: undefined,
                    /* VideoFrame */ 61: undefined,
                    /* DefineFontInfo2 */ 62: undefined,
                    /* EnableDebugger2 */ 64: undefined,
                    /* ScriptLimits */ 65: undefined,
                    /* SetTabIndex */ 66: undefined,
                    /* FileAttributes */ 69: undefined,
                    /* PlaceObject3 */ 70: placeObject,
                    /* ImportAssets2 */ 71: undefined,
                    /* DoABC (undoc) */ 72: undefined,
                    /* DefineFontAlignZones */ 73: undefined,
                    /* CSMTextSettings */ 74: undefined,
                    /* DefineFont3 */ 75: defineFont2,
                    /* SymbolClass */ 76: undefined,
                    /* Metadata */ 77: undefined,
                    /* DefineScalingGrid */ 78: defineScalingGrid,
                    /* DoABC */ 82: undefined,
                    /* DefineShape4 */ 83: defineShape,
                    /* DefineMorphShape2 */ 84: defineShape,
                    /* DefineSceneAndFrameLabelData */ 86: defineScene,
                    /* DefineBinaryData */ 87: defineBinaryData,
                    /* DefineFontName */ 88: undefined,
                    /* StartSound2 */ 89: startSound,
                    /* DefineBitsJPEG4 */ 90: defineImage,
                    /* DefineFont4 */ 91: defineFont4
                };
                function readHeader($bytes, $stream) {
                    var bits = Parser.readUb($bytes, $stream, 5);
                    var xMin = Parser.readSb($bytes, $stream, bits);
                    var xMax = Parser.readSb($bytes, $stream, bits);
                    var yMin = Parser.readSb($bytes, $stream, bits);
                    var yMax = Parser.readSb($bytes, $stream, bits);
                    Parser.align($bytes, $stream);
                    var frameRateFraction = Parser.readUi8($bytes, $stream);
                    var frameRate = Parser.readUi8($bytes, $stream) + frameRateFraction / 256;
                    var frameCount = Parser.readUi16($bytes, $stream);
                    return {
                        frameRate: frameRate,
                        frameCount: frameCount,
                        bounds: new Shumway.Bounds(xMin, yMin, xMax, yMax)
                    };
                }
                LowLevel.readHeader = readHeader;
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
            var assertUnreachable = Shumway.Debug.assertUnreachable;
            var roundToMultipleOfFour = Shumway.IntegerUtilities.roundToMultipleOfFour;
            var Inflate = Shumway.ArrayUtilities.Inflate;
            (function (BitmapFormat) {
                /**
                 * 8-bit color mapped image.
                 */
                BitmapFormat[BitmapFormat["FORMAT_COLORMAPPED"] = 3] = "FORMAT_COLORMAPPED";
                /**
                 * 15-bit RGB image.
                 */
                BitmapFormat[BitmapFormat["FORMAT_15BPP"] = 4] = "FORMAT_15BPP";
                /**
                 * 24-bit RGB image, however stored as 4 byte value 0x00RRGGBB.
                 */
                BitmapFormat[BitmapFormat["FORMAT_24BPP"] = 5] = "FORMAT_24BPP";
            })(Parser.BitmapFormat || (Parser.BitmapFormat = {}));
            var BitmapFormat = Parser.BitmapFormat;
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
                Shumway.Debug.notImplemented("parse15BPP");
                /*
                  case FORMAT_15BPP:
                    var colorType = 0x02;
                    var bytesPerLine = ((width * 2) + 3) & ~3;
                    var stream = createInflatedStream(bmpData, bytesPerLine * height);
                    var pos = 0;
            
                    for (var y = 0, i = 0; y < height; ++y) {
                      stream.ensure(bytesPerLine);
                      for (var x = 0; x < width; ++x, i += 4) {
                        var word = stream.getUint16(pos);
                        pos += 2;
                        // Extracting RGB color components and changing values range
                        // from 0..31 to 0..255.
                        data[i] = 0 | (FACTOR_5BBP * ((word >> 10) & 0x1f));
                        data[i + 1] = 0 | (FACTOR_5BBP * ((word >> 5) & 0x1f));
                        data[i + 2] = 0 | (FACTOR_5BBP * (word & 0x1f));
                        data[i + 3] = 255;
                      }
                      pos = stream.pos += bytesPerLine;
                    }
                    break;
                  */
                return null;
            }
            function defineBitmap(tag) {
                SWF.enterTimeline("defineBitmap");
                var data;
                var type = 0 /* None */;
                switch (tag.format) {
                    case 3 /* FORMAT_COLORMAPPED */:
                        data = parseColorMapped(tag);
                        type = 1 /* PremultipliedAlphaARGB */;
                        break;
                    case 5 /* FORMAT_24BPP */:
                        data = parse24BPP(tag);
                        type = 1 /* PremultipliedAlphaARGB */;
                        break;
                    case 4 /* FORMAT_15BPP */:
                        data = parse15BPP(tag);
                        type = 1 /* PremultipliedAlphaARGB */;
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
                    if (character.eob)
                        break;
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
                        if (character.stateUp)
                            states.up.push(cmd);
                        if (character.stateOver)
                            states.over.push(cmd);
                        if (character.stateDown)
                            states.down.push(cmd);
                        if (character.stateHitTest)
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
                    var glyph = glyphs[i];
                    if (!glyph) {
                        continue;
                    }
                    var records = glyph.records;
                    var record;
                    var x = 0;
                    var y = 0;
                    for (var j = 0; j < records.length; j++) {
                        record = records[j];
                        if (record.type) {
                            if (record.isStraight) {
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
                            if (record.eos) {
                                break;
                            }
                            if (record.move) {
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
                    bold: tag.bold === 1,
                    italic: tag.italic === 1,
                    codes: null,
                    metrics: null,
                    data: tag.data,
                    originalSize: false
                };
                var glyphs = tag.glyphs;
                var glyphCount = glyphs ? tag.glyphCount = glyphs.length : 0;
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
                var isFont2 = (tag.code === 48);
                var isFont3 = (tag.code === 75);
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
                var format314 = '\x00\x00' + toString16(segCount * 2) + toString16(searchRange) + toString16(logE(segCount) / logE(2)) + toString16(rangeShift) + endCount + '\x00\x00' + startCount + idDelta + idRangeOffset;
                tables['cmap'] = '\x00\x00' + '\x00\x01' + '\x00\x03' + '\x00\x01' + '\x00\x00\x00\x0c' + '\x00\x04' + toString16(format314.length + 4) + format314;
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
                    var glyph = glyphs[glyphIndex[code]];
                    var records = glyph.records;
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
                            if (record.isStraight) {
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
                            if (record.eos) {
                                break;
                            }
                            if (record.move) {
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
                    var glyph = glyphs[glyphIndex[code]];
                    var records = glyph.records;
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
                    var entry = toString16(numberOfContours) + toString16(xMin) + toString16(yMin) + toString16(xMax) + toString16(yMax) + endPtsOfContours + '\x00\x00' + flags + xCoordinates + yCoordinates;
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
                tables['OS/2'] = '\x00\x01' + '\x00\x00' + toString16(tag.bold ? 700 : 400) + '\x00\x05' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00' + '\x00\x00\x00\x00' + '\x00\x00\x00\x00' + '\x00\x00\x00\x00' + '\x00\x00\x00\x00' + 'ALF ' + toString16((tag.italic ? 0x01 : 0) | (tag.bold ? 0x20 : 0)) + toString16(codes[0]) + toString16(codes[codes.length - 1]) + toString16(ascent) + toString16(descent) + toString16(leading) + toString16(ascent) + toString16(-descent) + '\x00\x00\x00\x00' + '\x00\x00\x00\x00';
                tables['head'] = '\x00\x01\x00\x00' + '\x00\x01\x00\x00' + '\x00\x00\x00\x00' + '\x5f\x0f\x3c\xf5' + '\x00\x0b' + '\x04\x00' + '\x00\x00\x00\x00' + toString32(Date.now()) + '\x00\x00\x00\x00' + toString32(Date.now()) + toString16(min.apply(null, xMins)) + toString16(min.apply(null, yMins)) + toString16(max.apply(null, xMaxs)) + toString16(max.apply(null, yMaxs)) + toString16((tag.italic ? 2 : 0) | (tag.bold ? 1 : 0)) + '\x00\x08' + '\x00\x02' + '\x00\x00' + '\x00\x00';
                var advance = tag.advance;
                tables['hhea'] = '\x00\x01\x00\x00' + toString16(ascent) + toString16(descent) + toString16(leading) + toString16(advance ? max.apply(null, advance) : 1024) + '\x00\x00' + '\x00\x00' + '\x03\xb8' + '\x00\x01' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + toString16(glyphCount + 1);
                var hmtx = '\x00\x00\x00\x00';
                for (var i = 0; i < glyphCount; ++i) {
                    hmtx += toString16(advance ? (advance[i] / resolution) : 1024) + '\x00\x00';
                }
                tables['hmtx'] = hmtx;
                if (tag.kerning && tag.kerning.length) {
                    var kerning = tag.kerning;
                    var nPairs = kerning.length;
                    var searchRange = maxPower2(nPairs) * 2;
                    var kern = '\x00\x00' + '\x00\x01' + '\x00\x00' + toString16(14 + (nPairs * 6)) + '\x00\x01' + toString16(nPairs) + toString16(searchRange) + toString16(logE(nPairs) / logE(2)) + toString16((2 * nPairs) - searchRange) // rangeShift
                    ;
                    var i = 0;
                    var record;
                    while ((record = kerning[i++])) {
                        kern += toString16(glyphIndex[record.code1]) + toString16(glyphIndex[record.code2]) + toString16(record.adjustment);
                    }
                    tables['kern'] = kern;
                }
                tables['loca'] = loca;
                tables['maxp'] = '\x00\x01\x00\x00' + toString16(glyphCount + 1) + toString16(maxPoints) + toString16(maxContours) + '\x00\x00' + '\x00\x00' + '\x00\x01' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00';
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
                    'Unknown'
                ];
                var count = strings.length;
                var name = '\x00\x00' + toString16(count) + toString16((count * 12) + 6); // stringOffset
                var offset = 0;
                var i = 0;
                var str;
                while ((str = strings[i++])) {
                    name += '\x00\x01' + '\x00\x00' + '\x00\x00' + toString16(i - 1) + toString16(str.length) + toString16(offset);
                    offset += str.length;
                }
                tables['name'] = name + strings.join('');
                tables['post'] = '\x00\x03\x00\x00' + '\x00\x00\x00\x00' + '\x00\x00' + '\x00\x00' + '\x00\x00\x00\x00' + '\x00\x00\x00\x00' + '\x00\x00\x00\x00' + '\x00\x00\x00\x00' + '\x00\x00\x00\x00';
                var names = Object.keys(tables);
                var numTables = names.length;
                var header = '\x00\x01\x00\x00' + toString16(numTables) + '\x00\x80' + '\x00\x03' + '\x00\x20' // rangeShift
                ;
                var dataString = '';
                var offset = (numTables * 16) + header.length;
                var i = 0;
                while ((name = names[i++])) {
                    var table = tables[name];
                    var length = table.length;
                    header += name + '\x00\x00\x00\x00' + toString32(offset) + toString32(length);
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
            var assert = Shumway.Debug.assert;
            var Inflate = Shumway.ArrayUtilities.Inflate;
            /**
             * Reads the next two bytes at the specified position.
             */
            function readUint16(bytes, position) {
                return (bytes[position] << 8) | bytes[position + 1];
            }
            /**
             * Reads the next two bytes at the specified position.
             */
            function readInt32(bytes, position) {
                return (bytes[position] << 24) | (bytes[position + 1] << 16) | (bytes[position + 2] << 8) | bytes[position + 3];
            }
            /**
             * Parses JPEG chunks and reads image width and height information. JPEG data
             * in SWFs is encoded in chunks and not directly decodable by the JPEG parser.
             */
            function parseJpegChunks(image, bytes, chunks) {
                var i = 0;
                var n = bytes.length;
                var code;
                do {
                    var begin = i;
                    while (i < n && bytes[i] !== 0xff) {
                        ++i;
                    }
                    while (i < n && bytes[i] === 0xff) {
                        ++i;
                    }
                    code = bytes[i++];
                    if (code === 0xda) {
                        i = n;
                    }
                    else if (code === 0xd9) {
                        i += 2;
                        continue;
                    }
                    else if (code < 0xd0 || code > 0xd8) {
                        var length = readUint16(bytes, i);
                        if (code >= 0xc0 && code <= 0xc3) {
                            image.height = readUint16(bytes, i + 3);
                            image.width = readUint16(bytes, i + 5);
                        }
                        i += length;
                    }
                    chunks.push(bytes.subarray(begin, i));
                } while (i < n);
                if (!release && !(image.width && image.height)) {
                    Shumway.Debug.warning('bad jpeg image');
                }
                return chunks;
            }
            Parser.parseJpegChunks = parseJpegChunks;
            /**
             * Extracts PNG width and height information.
             */
            function parsePngHeaders(image, bytes) {
                var ihdrOffset = 12;
                if (bytes[ihdrOffset] !== 0x49 || bytes[ihdrOffset + 1] !== 0x48 || bytes[ihdrOffset + 2] !== 0x44 || bytes[ihdrOffset + 3] !== 0x52) {
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
            function defineImage(tag) {
                SWF.enterTimeline("defineImage");
                var image = {
                    type: 'image',
                    id: tag.id,
                    mimeType: tag.mimeType
                };
                var imgData = tag.imgData;
                if (tag.mimeType === 'image/jpeg') {
                    var alphaData = tag.alphaData;
                    if (alphaData) {
                        var jpegImage = new Shumway.JPEG.JpegImage();
                        jpegImage.parse(joinChunks(parseJpegChunks(image, imgData, [])));
                        release || assert(image.width === jpegImage.width);
                        release || assert(image.height === jpegImage.height);
                        var width = image.width;
                        var height = image.height;
                        var length = width * height;
                        var alphaMaskBytes;
                        try {
                            alphaMaskBytes = Inflate.inflate(alphaData, length, true);
                        }
                        catch (e) {
                            // Alpha layer is invalid, so hiding everything.
                            alphaMaskBytes = new Uint8Array(width);
                        }
                        var data = image.data = new Uint8ClampedArray(length * 4);
                        jpegImage.copyToImageData(image);
                        for (var i = 0, k = 3; i < length; i++, k += 4) {
                            data[k] = alphaMaskBytes[i];
                        }
                        image.mimeType = 'application/octet-stream';
                        image.dataType = 3 /* StraightAlphaRGBA */;
                    }
                    else {
                        var chunks = [];
                        if (tag.jpegTables) {
                            chunks.push(tag.jpegTables);
                        }
                        parseJpegChunks(image, imgData, chunks);
                        if (tag.jpegTables && tag.jpegTables.byteLength > 0) {
                            chunks[1] = chunks[1].subarray(2);
                        }
                        image.data = joinChunks(chunks);
                        image.dataType = 4 /* JPEG */;
                    }
                }
                else {
                    parsePngHeaders(image, imgData);
                    image.data = imgData;
                    image.dataType = 5 /* PNG */;
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
            var PathCommand = Shumway.PathCommand;
            var GradientType = Shumway.GradientType;
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var ShapeData = Shumway.ShapeData;
            var clamp = Shumway.NumberUtilities.clamp;
            var assert = Shumway.Debug.assert;
            var assertUnreachable = Shumway.Debug.assertUnreachable;
            var push = Array.prototype.push;
            var FillType;
            (function (FillType) {
                FillType[FillType["Solid"] = 0] = "Solid";
                FillType[FillType["LinearGradient"] = 0x10] = "LinearGradient";
                FillType[FillType["RadialGradient"] = 0x12] = "RadialGradient";
                FillType[FillType["FocalRadialGradient"] = 0x13] = "FocalRadialGradient";
                FillType[FillType["RepeatingBitmap"] = 0x40] = "RepeatingBitmap";
                FillType[FillType["ClippedBitmap"] = 0x41] = "ClippedBitmap";
                FillType[FillType["NonsmoothedRepeatingBitmap"] = 0x42] = "NonsmoothedRepeatingBitmap";
                FillType[FillType["NonsmoothedClippedBitmap"] = 0x43] = "NonsmoothedClippedBitmap";
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
                //TODO: remove the `- 1` once we stop even parsing the EOS record
                var numRecords = records.length - 1;
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
                        if (record.hasNewStyles) {
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
                        if (record.hasFillStyle0) {
                            styles.fill0 = record.fillStyle0;
                        }
                        if (record.hasFillStyle1) {
                            styles.fill1 = record.fillStyle1;
                        }
                        if (record.hasLineStyle) {
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
                        if (record.move) {
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
                            while (morphRecord && morphRecord.type === 0) {
                                morphRecord = recordsMorph[j++];
                            }
                            // The EndEdges list might be shorter than the StartEdges list. Reuse
                            // start edges as end edges in that case.
                            if (!morphRecord) {
                                morphRecord = record;
                            }
                        }
                        if (record.isStraight && (!isMorph || morphRecord.isStraight)) {
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
                            if (!record.isStraight) {
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
                                if (!morphRecord.isStraight) {
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
                        shapeStyle.type = 0 /* Solid */;
                        return shapeStyle;
                    }
                }
                if (style.type === undefined || style.type === 0 /* Solid */) {
                    return shapeStyle;
                }
                var scale;
                switch (style.type) {
                    case 16 /* LinearGradient */:
                    case 18 /* RadialGradient */:
                    case 19 /* FocalRadialGradient */:
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
                    case 64 /* RepeatingBitmap */:
                    case 65 /* ClippedBitmap */:
                    case 66 /* NonsmoothedRepeatingBitmap */:
                    case 67 /* NonsmoothedClippedBitmap */:
                        shapeStyle.smooth = style.type !== 66 /* NonsmoothedRepeatingBitmap */ && style.type !== 67 /* NonsmoothedClippedBitmap */;
                        shapeStyle.repeat = style.type !== 65 /* ClippedBitmap */ && style.type !== 67 /* NonsmoothedClippedBitmap */;
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
                if (style.type === 0 /* Solid */) {
                    morphStyle.color = style.colorMorph;
                    return morphStyle;
                }
                var scale;
                switch (style.type) {
                    case 16 /* LinearGradient */:
                    case 18 /* RadialGradient */:
                    case 19 /* FocalRadialGradient */:
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
                    case 64 /* RepeatingBitmap */:
                    case 65 /* ClippedBitmap */:
                    case 66 /* NonsmoothedRepeatingBitmap */:
                    case 67 /* NonsmoothedClippedBitmap */:
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
                    type: tag.isMorph ? 'morphshape' : 'shape',
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
                            case 0 /* Solid */:
                                shape.beginFill(style.color);
                                if (morph) {
                                    shape.writeMorphFill(morph.color);
                                }
                                break;
                            case 16 /* LinearGradient */:
                            case 18 /* RadialGradient */:
                            case 19 /* FocalRadialGradient */:
                                writeGradient(2 /* BeginGradientFill */, style, shape);
                                if (morph) {
                                    writeMorphGradient(morph, shape);
                                }
                                break;
                            case 65 /* ClippedBitmap */:
                            case 64 /* RepeatingBitmap */:
                            case 67 /* NonsmoothedClippedBitmap */:
                            case 66 /* NonsmoothedRepeatingBitmap */:
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
                            case 0 /* Solid */:
                                writeLineStyle(style, shape);
                                if (morph) {
                                    writeMorphLineStyle(morph, shape);
                                }
                                break;
                            case 16 /* LinearGradient */:
                            case 18 /* RadialGradient */:
                            case 19 /* FocalRadialGradient */:
                                writeLineStyle(style, shape);
                                writeGradient(6 /* LineStyleGradient */, style, shape);
                                if (morph) {
                                    writeMorphLineStyle(morph, shape);
                                    writeMorphGradient(morph, shape);
                                }
                                break;
                            case 65 /* ClippedBitmap */:
                            case 64 /* RepeatingBitmap */:
                            case 67 /* NonsmoothedClippedBitmap */:
                            case 66 /* NonsmoothedRepeatingBitmap */:
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
                var scaleMode = style.noHscale ? (style.noVscale ? 0 : 2) : style.noVscale ? 3 : 1;
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
                var gradientType = style.type === 16 /* LinearGradient */ ? 16 /* Linear */ : 18 /* Radial */;
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
            var WaveHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6D, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x02, 0x00, 0x44, 0xAC, 0x00, 0x00, 0x10, 0xB1, 0x02, 0x00, 0x04, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00]);
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
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                16,
                17,
                19,
                21,
                23,
                25,
                28,
                31,
                34,
                37,
                41,
                45,
                50,
                55,
                60,
                66,
                73,
                80,
                88,
                97,
                107,
                118,
                130,
                143,
                157,
                173,
                190,
                209,
                230,
                253,
                279,
                307,
                337,
                371,
                408,
                449,
                494,
                544,
                598,
                658,
                724,
                796,
                876,
                963,
                1060,
                1166,
                1282,
                1411,
                1552,
                1707,
                1878,
                2066,
                2272,
                2499,
                2749,
                3024,
                3327,
                3660,
                4026,
                4428,
                4871,
                5358,
                5894,
                6484,
                7132,
                7845,
                8630,
                9493,
                10442,
                11487,
                12635,
                13899,
                15289,
                16818,
                18500,
                20350,
                22385,
                24623,
                27086,
                29794,
                32767
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
                                stream.decode = tag.streamCompression === SOUND_FORMAT_PCM_BE ? SwfSoundStream_decode_PCM_be : SwfSoundStream_decode_PCM_le;
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
                            Shumway.Debug.warning('Unsupported audio format: ' + tag.soundFormat);
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
///<reference path='templates.ts' />
///<reference path='handlers.ts' />
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
        SWF.timelineBuffer = new Shumway.Tools.Profiler.TimelineBuffer("Parser");
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
/* Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 This code was forked from https://github.com/notmasteryet/jpgjs. The original
 version was created by github user notmasteryet

 - The JPEG specification can be found in the ITU CCITT Recommendation T.81
 (www.w3.org/Graphics/JPEG/itu-t81.pdf)
 - The JFIF specification can be found in the JPEG File Interchange Format
 (www.w3.org/Graphics/JPEG/jfif3.pdf)
 - The Adobe Application-Specific JPEG markers in the Supporting the DCT Filters
 in PostScript Level 2, Technical Note #5116
 (partners.adobe.com/public/developer/en/ps/sdk/5116.DCT_Filter.pdf)
 */
var Shumway;
(function (Shumway) {
    var JPEG;
    (function (JPEG) {
        var dctZigZag = new Int32Array([
            0,
            1,
            8,
            16,
            9,
            2,
            3,
            10,
            17,
            24,
            32,
            25,
            18,
            11,
            4,
            5,
            12,
            19,
            26,
            33,
            40,
            48,
            41,
            34,
            27,
            20,
            13,
            6,
            7,
            14,
            21,
            28,
            35,
            42,
            49,
            56,
            57,
            50,
            43,
            36,
            29,
            22,
            15,
            23,
            30,
            37,
            44,
            51,
            58,
            59,
            52,
            45,
            38,
            31,
            39,
            46,
            53,
            60,
            61,
            54,
            47,
            55,
            62,
            63
        ]);
        var dctCos1 = 4017; // cos(pi/16)
        var dctSin1 = 799; // sin(pi/16)
        var dctCos3 = 3406; // cos(3*pi/16)
        var dctSin3 = 2276; // sin(3*pi/16)
        var dctCos6 = 1567; // cos(6*pi/16)
        var dctSin6 = 3784; // sin(6*pi/16)
        var dctSqrt2 = 5793; // sqrt(2)
        var dctSqrt1d2 = 2896; // sqrt(2) / 2
        function constructor() {
        }
        function buildHuffmanTable(codeLengths, values) {
            var k = 0, code = [], i, j, length = 16;
            while (length > 0 && !codeLengths[length - 1]) {
                length--;
            }
            code.push({ children: [], index: 0 });
            var p = code[0], q;
            for (i = 0; i < length; i++) {
                for (j = 0; j < codeLengths[i]; j++) {
                    p = code.pop();
                    p.children[p.index] = values[k];
                    while (p.index > 0) {
                        p = code.pop();
                    }
                    p.index++;
                    code.push(p);
                    while (code.length <= i) {
                        code.push(q = { children: [], index: 0 });
                        p.children[p.index] = q.children;
                        p = q;
                    }
                    k++;
                }
                if (i + 1 < length) {
                    // p here points to last code
                    code.push(q = { children: [], index: 0 });
                    p.children[p.index] = q.children;
                    p = q;
                }
            }
            return code[0].children;
        }
        function getBlockBufferOffset(component, row, col) {
            return 64 * ((component.blocksPerLine + 1) * row + col);
        }
        function decodeScan(data, offset, frame, components, resetInterval, spectralStart, spectralEnd, successivePrev, successive) {
            var precision = frame.precision;
            var samplesPerLine = frame.samplesPerLine;
            var scanLines = frame.scanLines;
            var mcusPerLine = frame.mcusPerLine;
            var progressive = frame.progressive;
            var maxH = frame.maxH, maxV = frame.maxV;
            var startOffset = offset, bitsData = 0, bitsCount = 0;
            function readBit() {
                if (bitsCount > 0) {
                    bitsCount--;
                    return (bitsData >> bitsCount) & 1;
                }
                bitsData = data[offset++];
                if (bitsData == 0xFF) {
                    var nextByte = data[offset++];
                    if (nextByte) {
                        // Found some marker, feeding zeros
                        bitsCount = 31;
                        bitsData = 0;
                        offset -= 2;
                        return 0;
                    }
                }
                bitsCount = 7;
                return bitsData >>> 7;
            }
            function decodeHuffman(tree) {
                var node = tree;
                var bit;
                while ((bit = readBit()) !== null) {
                    node = node[bit];
                    if (typeof node === 'number') {
                        return node;
                    }
                    if (typeof node !== 'object') {
                        // throw 'invalid huffman sequence'; // FP or browser is not failing
                        return 0;
                    }
                }
                return null;
            }
            function receive(length) {
                var n = 0;
                while (length > 0) {
                    var bit = readBit();
                    if (bit === null) {
                        return;
                    }
                    n = (n << 1) | bit;
                    length--;
                }
                return n;
            }
            function receiveAndExtend(length) {
                if (length === 1) {
                    return readBit() === 1 ? 1 : -1;
                }
                var n = receive(length);
                if (n >= 1 << (length - 1)) {
                    return n;
                }
                return n + (-1 << length) + 1;
            }
            function decodeBaseline(component, offset) {
                var t = decodeHuffman(component.huffmanTableDC);
                var diff = t === 0 ? 0 : receiveAndExtend(t);
                component.blockData[offset] = (component.pred += diff);
                var k = 1;
                while (k < 64) {
                    var rs = decodeHuffman(component.huffmanTableAC);
                    var s = rs & 15, r = rs >> 4;
                    if (s === 0) {
                        if (r < 15) {
                            break;
                        }
                        k += 16;
                        continue;
                    }
                    k += r;
                    var z = dctZigZag[k];
                    component.blockData[offset + z] = receiveAndExtend(s);
                    k++;
                }
            }
            function decodeDCFirst(component, offset) {
                var t = decodeHuffman(component.huffmanTableDC);
                var diff = t === 0 ? 0 : (receiveAndExtend(t) << successive);
                component.blockData[offset] = (component.pred += diff);
            }
            function decodeDCSuccessive(component, offset) {
                component.blockData[offset] |= readBit() << successive;
            }
            var eobrun = 0;
            function decodeACFirst(component, offset) {
                if (eobrun > 0) {
                    eobrun--;
                    return;
                }
                var k = spectralStart, e = spectralEnd;
                while (k <= e) {
                    var rs = decodeHuffman(component.huffmanTableAC);
                    var s = rs & 15, r = rs >> 4;
                    if (s === 0) {
                        if (r < 15) {
                            eobrun = receive(r) + (1 << r) - 1;
                            break;
                        }
                        k += 16;
                        continue;
                    }
                    k += r;
                    var z = dctZigZag[k];
                    component.blockData[offset + z] = receiveAndExtend(s) * (1 << successive);
                    k++;
                }
            }
            var successiveACState = 0, successiveACNextValue;
            function decodeACSuccessive(component, offset) {
                var k = spectralStart;
                var e = spectralEnd;
                var r = 0;
                var s;
                var rs;
                while (k <= e) {
                    var z = dctZigZag[k];
                    switch (successiveACState) {
                        case 0:
                            rs = decodeHuffman(component.huffmanTableAC);
                            s = rs & 15;
                            r = rs >> 4;
                            if (s === 0) {
                                if (r < 15) {
                                    eobrun = receive(r) + (1 << r);
                                    successiveACState = 4;
                                }
                                else {
                                    r = 16;
                                    successiveACState = 1;
                                }
                            }
                            else {
                                if (s !== 1) {
                                    throw 'invalid ACn encoding';
                                }
                                successiveACNextValue = receiveAndExtend(s);
                                successiveACState = r ? 2 : 3;
                            }
                            continue;
                        case 1:
                        case 2:
                            if (component.blockData[offset + z]) {
                                component.blockData[offset + z] += (readBit() << successive);
                            }
                            else {
                                r--;
                                if (r === 0) {
                                    successiveACState = successiveACState == 2 ? 3 : 0;
                                }
                            }
                            break;
                        case 3:
                            if (component.blockData[offset + z]) {
                                component.blockData[offset + z] += (readBit() << successive);
                            }
                            else {
                                component.blockData[offset + z] = successiveACNextValue << successive;
                                successiveACState = 0;
                            }
                            break;
                        case 4:
                            if (component.blockData[offset + z]) {
                                component.blockData[offset + z] += (readBit() << successive);
                            }
                            break;
                    }
                    k++;
                }
                if (successiveACState === 4) {
                    eobrun--;
                    if (eobrun === 0) {
                        successiveACState = 0;
                    }
                }
            }
            function decodeMcu(component, decode, mcu, row, col) {
                var mcuRow = (mcu / mcusPerLine) | 0;
                var mcuCol = mcu % mcusPerLine;
                var blockRow = mcuRow * component.v + row;
                var blockCol = mcuCol * component.h + col;
                var offset = getBlockBufferOffset(component, blockRow, blockCol);
                decode(component, offset);
            }
            function decodeBlock(component, decode, mcu) {
                var blockRow = (mcu / component.blocksPerLine) | 0;
                var blockCol = mcu % component.blocksPerLine;
                var offset = getBlockBufferOffset(component, blockRow, blockCol);
                decode(component, offset);
            }
            var componentsLength = components.length;
            var component, i, j, k, n;
            var decodeFn;
            if (progressive) {
                if (spectralStart === 0) {
                    decodeFn = successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
                }
                else {
                    decodeFn = successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
                }
            }
            else {
                decodeFn = decodeBaseline;
            }
            var mcu = 0, marker;
            var mcuExpected;
            if (componentsLength == 1) {
                mcuExpected = components[0].blocksPerLine * components[0].blocksPerColumn;
            }
            else {
                mcuExpected = mcusPerLine * frame.mcusPerColumn;
            }
            if (!resetInterval) {
                resetInterval = mcuExpected;
            }
            var h, v;
            while (mcu < mcuExpected) {
                for (i = 0; i < componentsLength; i++) {
                    components[i].pred = 0;
                }
                eobrun = 0;
                if (componentsLength == 1) {
                    component = components[0];
                    for (n = 0; n < resetInterval; n++) {
                        decodeBlock(component, decodeFn, mcu);
                        mcu++;
                    }
                }
                else {
                    for (n = 0; n < resetInterval; n++) {
                        for (i = 0; i < componentsLength; i++) {
                            component = components[i];
                            h = component.h;
                            v = component.v;
                            for (j = 0; j < v; j++) {
                                for (k = 0; k < h; k++) {
                                    decodeMcu(component, decodeFn, mcu, j, k);
                                }
                            }
                        }
                        mcu++;
                    }
                }
                // find marker
                bitsCount = 0;
                marker = (data[offset] << 8) | data[offset + 1];
                if (marker <= 0xFF00) {
                    throw 'marker was not found';
                }
                if (marker >= 0xFFD0 && marker <= 0xFFD7) {
                    offset += 2;
                }
                else {
                    break;
                }
            }
            return offset - startOffset;
        }
        // A port of poppler's IDCT method which in turn is taken from:
        //   Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
        //   'Practical Fast 1-D DCT Algorithms with 11 Multiplications',
        //   IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989,
        //   988-991.
        function quantizeAndInverse(component, blockBufferOffset, p) {
            var qt = component.quantizationTable;
            var v0, v1, v2, v3, v4, v5, v6, v7, t;
            var i;
            for (i = 0; i < 64; i++) {
                p[i] = component.blockData[blockBufferOffset + i] * qt[i];
            }
            for (i = 0; i < 8; ++i) {
                var row = 8 * i;
                // check for all-zero AC coefficients
                if (p[1 + row] === 0 && p[2 + row] === 0 && p[3 + row] === 0 && p[4 + row] === 0 && p[5 + row] === 0 && p[6 + row] === 0 && p[7 + row] === 0) {
                    t = (dctSqrt2 * p[0 + row] + 512) >> 10;
                    p[0 + row] = t;
                    p[1 + row] = t;
                    p[2 + row] = t;
                    p[3 + row] = t;
                    p[4 + row] = t;
                    p[5 + row] = t;
                    p[6 + row] = t;
                    p[7 + row] = t;
                    continue;
                }
                // stage 4
                v0 = (dctSqrt2 * p[0 + row] + 128) >> 8;
                v1 = (dctSqrt2 * p[4 + row] + 128) >> 8;
                v2 = p[2 + row];
                v3 = p[6 + row];
                v4 = (dctSqrt1d2 * (p[1 + row] - p[7 + row]) + 128) >> 8;
                v7 = (dctSqrt1d2 * (p[1 + row] + p[7 + row]) + 128) >> 8;
                v5 = p[3 + row] << 4;
                v6 = p[5 + row] << 4;
                // stage 3
                t = (v0 - v1 + 1) >> 1;
                v0 = (v0 + v1 + 1) >> 1;
                v1 = t;
                t = (v2 * dctSin6 + v3 * dctCos6 + 128) >> 8;
                v2 = (v2 * dctCos6 - v3 * dctSin6 + 128) >> 8;
                v3 = t;
                t = (v4 - v6 + 1) >> 1;
                v4 = (v4 + v6 + 1) >> 1;
                v6 = t;
                t = (v7 + v5 + 1) >> 1;
                v5 = (v7 - v5 + 1) >> 1;
                v7 = t;
                // stage 2
                t = (v0 - v3 + 1) >> 1;
                v0 = (v0 + v3 + 1) >> 1;
                v3 = t;
                t = (v1 - v2 + 1) >> 1;
                v1 = (v1 + v2 + 1) >> 1;
                v2 = t;
                t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
                v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
                v7 = t;
                t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
                v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
                v6 = t;
                // stage 1
                p[0 + row] = v0 + v7;
                p[7 + row] = v0 - v7;
                p[1 + row] = v1 + v6;
                p[6 + row] = v1 - v6;
                p[2 + row] = v2 + v5;
                p[5 + row] = v2 - v5;
                p[3 + row] = v3 + v4;
                p[4 + row] = v3 - v4;
            }
            for (i = 0; i < 8; ++i) {
                var col = i;
                // check for all-zero AC coefficients
                if (p[1 * 8 + col] === 0 && p[2 * 8 + col] === 0 && p[3 * 8 + col] === 0 && p[4 * 8 + col] === 0 && p[5 * 8 + col] === 0 && p[6 * 8 + col] === 0 && p[7 * 8 + col] === 0) {
                    t = (dctSqrt2 * p[i + 0] + 8192) >> 14;
                    p[0 * 8 + col] = t;
                    p[1 * 8 + col] = t;
                    p[2 * 8 + col] = t;
                    p[3 * 8 + col] = t;
                    p[4 * 8 + col] = t;
                    p[5 * 8 + col] = t;
                    p[6 * 8 + col] = t;
                    p[7 * 8 + col] = t;
                    continue;
                }
                // stage 4
                v0 = (dctSqrt2 * p[0 * 8 + col] + 2048) >> 12;
                v1 = (dctSqrt2 * p[4 * 8 + col] + 2048) >> 12;
                v2 = p[2 * 8 + col];
                v3 = p[6 * 8 + col];
                v4 = (dctSqrt1d2 * (p[1 * 8 + col] - p[7 * 8 + col]) + 2048) >> 12;
                v7 = (dctSqrt1d2 * (p[1 * 8 + col] + p[7 * 8 + col]) + 2048) >> 12;
                v5 = p[3 * 8 + col];
                v6 = p[5 * 8 + col];
                // stage 3
                t = (v0 - v1 + 1) >> 1;
                v0 = (v0 + v1 + 1) >> 1;
                v1 = t;
                t = (v2 * dctSin6 + v3 * dctCos6 + 2048) >> 12;
                v2 = (v2 * dctCos6 - v3 * dctSin6 + 2048) >> 12;
                v3 = t;
                t = (v4 - v6 + 1) >> 1;
                v4 = (v4 + v6 + 1) >> 1;
                v6 = t;
                t = (v7 + v5 + 1) >> 1;
                v5 = (v7 - v5 + 1) >> 1;
                v7 = t;
                // stage 2
                t = (v0 - v3 + 1) >> 1;
                v0 = (v0 + v3 + 1) >> 1;
                v3 = t;
                t = (v1 - v2 + 1) >> 1;
                v1 = (v1 + v2 + 1) >> 1;
                v2 = t;
                t = (v4 * dctSin3 + v7 * dctCos3 + 2048) >> 12;
                v4 = (v4 * dctCos3 - v7 * dctSin3 + 2048) >> 12;
                v7 = t;
                t = (v5 * dctSin1 + v6 * dctCos1 + 2048) >> 12;
                v5 = (v5 * dctCos1 - v6 * dctSin1 + 2048) >> 12;
                v6 = t;
                // stage 1
                p[0 * 8 + col] = v0 + v7;
                p[7 * 8 + col] = v0 - v7;
                p[1 * 8 + col] = v1 + v6;
                p[6 * 8 + col] = v1 - v6;
                p[2 * 8 + col] = v2 + v5;
                p[5 * 8 + col] = v2 - v5;
                p[3 * 8 + col] = v3 + v4;
                p[4 * 8 + col] = v3 - v4;
            }
            for (i = 0; i < 64; ++i) {
                var index = blockBufferOffset + i;
                var q = p[i];
                q = (q <= -2056) ? 0 : (q >= 2024) ? 255 : (q + 2056) >> 4;
                component.blockData[index] = q;
            }
        }
        function buildComponentData(frame, component) {
            var lines = [];
            var blocksPerLine = component.blocksPerLine;
            var blocksPerColumn = component.blocksPerColumn;
            var samplesPerLine = blocksPerLine << 3;
            var computationBuffer = new Int32Array(64);
            var i, j, ll = 0;
            for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
                for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
                    var offset = getBlockBufferOffset(component, blockRow, blockCol);
                    quantizeAndInverse(component, offset, computationBuffer);
                }
            }
            return component.blockData;
        }
        function clamp0to255(a) {
            return a <= 0 ? 0 : a >= 255 ? 255 : a;
        }
        var JpegImage = (function () {
            function JpegImage() {
            }
            JpegImage.prototype.parse = function (data) {
                function readUint16() {
                    var value = (data[offset] << 8) | data[offset + 1];
                    offset += 2;
                    return value;
                }
                function readDataBlock() {
                    var length = readUint16();
                    var array = data.subarray(offset, offset + length - 2);
                    offset += array.length;
                    return array;
                }
                function prepareComponents(frame) {
                    var mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / frame.maxH);
                    var mcusPerColumn = Math.ceil(frame.scanLines / 8 / frame.maxV);
                    for (var i = 0; i < frame.components.length; i++) {
                        component = frame.components[i];
                        var blocksPerLine = Math.ceil(Math.ceil(frame.samplesPerLine / 8) * component.h / frame.maxH);
                        var blocksPerColumn = Math.ceil(Math.ceil(frame.scanLines / 8) * component.v / frame.maxV);
                        var blocksPerLineForMcu = mcusPerLine * component.h;
                        var blocksPerColumnForMcu = mcusPerColumn * component.v;
                        var blocksBufferSize = 64 * blocksPerColumnForMcu * (blocksPerLineForMcu + 1);
                        component.blockData = new Int16Array(blocksBufferSize);
                        component.blocksPerLine = blocksPerLine;
                        component.blocksPerColumn = blocksPerColumn;
                    }
                    frame.mcusPerLine = mcusPerLine;
                    frame.mcusPerColumn = mcusPerColumn;
                }
                var offset = 0, length = data.length;
                var jfif = null;
                var adobe = null;
                var pixels = null;
                var frame, resetInterval;
                var quantizationTables = [];
                var huffmanTablesAC = [], huffmanTablesDC = [];
                var fileMarker = readUint16();
                if (fileMarker != 0xFFD8) {
                    throw 'SOI not found';
                }
                fileMarker = readUint16();
                while (fileMarker != 0xFFD9) {
                    var i, j, l;
                    switch (fileMarker) {
                        case 0xFFE0:
                        case 0xFFE1:
                        case 0xFFE2:
                        case 0xFFE3:
                        case 0xFFE4:
                        case 0xFFE5:
                        case 0xFFE6:
                        case 0xFFE7:
                        case 0xFFE8:
                        case 0xFFE9:
                        case 0xFFEA:
                        case 0xFFEB:
                        case 0xFFEC:
                        case 0xFFED:
                        case 0xFFEE:
                        case 0xFFEF:
                        case 0xFFFE:
                            var appData = readDataBlock();
                            if (fileMarker === 0xFFE0) {
                                if (appData[0] === 0x4A && appData[1] === 0x46 && appData[2] === 0x49 && appData[3] === 0x46 && appData[4] === 0) {
                                    jfif = {
                                        version: { major: appData[5], minor: appData[6] },
                                        densityUnits: appData[7],
                                        xDensity: (appData[8] << 8) | appData[9],
                                        yDensity: (appData[10] << 8) | appData[11],
                                        thumbWidth: appData[12],
                                        thumbHeight: appData[13],
                                        thumbData: appData.subarray(14, 14 + 3 * appData[12] * appData[13])
                                    };
                                }
                            }
                            // TODO APP1 - Exif
                            if (fileMarker === 0xFFEE) {
                                if (appData[0] === 0x41 && appData[1] === 0x64 && appData[2] === 0x6F && appData[3] === 0x62 && appData[4] === 0x65 && appData[5] === 0) {
                                    adobe = {
                                        version: appData[6],
                                        flags0: (appData[7] << 8) | appData[8],
                                        flags1: (appData[9] << 8) | appData[10],
                                        transformCode: appData[11]
                                    };
                                }
                            }
                            break;
                        case 0xFFDB:
                            var quantizationTablesLength = readUint16();
                            var quantizationTablesEnd = quantizationTablesLength + offset - 2;
                            var z;
                            while (offset < quantizationTablesEnd) {
                                var quantizationTableSpec = data[offset++];
                                var tableData = new Int32Array(64);
                                if ((quantizationTableSpec >> 4) === 0) {
                                    for (j = 0; j < 64; j++) {
                                        z = dctZigZag[j];
                                        tableData[z] = data[offset++];
                                    }
                                }
                                else if ((quantizationTableSpec >> 4) === 1) {
                                    for (j = 0; j < 64; j++) {
                                        z = dctZigZag[j];
                                        tableData[z] = readUint16();
                                    }
                                }
                                else {
                                    throw 'DQT: invalid table spec';
                                }
                                quantizationTables[quantizationTableSpec & 15] = tableData;
                            }
                            break;
                        case 0xFFC0:
                        case 0xFFC1:
                        case 0xFFC2:
                            if (frame) {
                                throw 'Only single frame JPEGs supported';
                            }
                            readUint16(); // skip data length
                            frame = {};
                            frame.extended = (fileMarker === 0xFFC1);
                            frame.progressive = (fileMarker === 0xFFC2);
                            frame.precision = data[offset++];
                            frame.scanLines = readUint16();
                            frame.samplesPerLine = readUint16();
                            frame.components = [];
                            frame.componentIds = {};
                            var componentsCount = data[offset++], componentId;
                            var maxH = 0, maxV = 0;
                            for (i = 0; i < componentsCount; i++) {
                                componentId = data[offset];
                                var h = data[offset + 1] >> 4;
                                var v = data[offset + 1] & 15;
                                if (maxH < h) {
                                    maxH = h;
                                }
                                if (maxV < v) {
                                    maxV = v;
                                }
                                var qId = data[offset + 2];
                                l = frame.components.push({
                                    h: h,
                                    v: v,
                                    quantizationTableId: qId
                                });
                                frame.componentIds[componentId] = l - 1;
                                offset += 3;
                            }
                            frame.maxH = maxH;
                            frame.maxV = maxV;
                            prepareComponents(frame);
                            break;
                        case 0xFFC4:
                            var huffmanLength = readUint16();
                            for (i = 2; i < huffmanLength;) {
                                var huffmanTableSpec = data[offset++];
                                var codeLengths = new Uint8Array(16);
                                var codeLengthSum = 0;
                                for (j = 0; j < 16; j++, offset++) {
                                    codeLengthSum += (codeLengths[j] = data[offset]);
                                }
                                var huffmanValues = new Uint8Array(codeLengthSum);
                                for (j = 0; j < codeLengthSum; j++, offset++) {
                                    huffmanValues[j] = data[offset];
                                }
                                i += 17 + codeLengthSum;
                                ((huffmanTableSpec >> 4) === 0 ? huffmanTablesDC : huffmanTablesAC)[huffmanTableSpec & 15] = buildHuffmanTable(codeLengths, huffmanValues);
                            }
                            break;
                        case 0xFFDD:
                            readUint16(); // skip data length
                            resetInterval = readUint16();
                            break;
                        case 0xFFDA:
                            var scanLength = readUint16();
                            var selectorsCount = data[offset++];
                            var components = [], component;
                            for (i = 0; i < selectorsCount; i++) {
                                var componentIndex = frame.componentIds[data[offset++]];
                                component = frame.components[componentIndex];
                                var tableSpec = data[offset++];
                                component.huffmanTableDC = huffmanTablesDC[tableSpec >> 4];
                                component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
                                var qId = component.quantizationTableId;
                                component.quantizationTable = quantizationTables[qId];
                                components.push(component);
                            }
                            var spectralStart = data[offset++];
                            var spectralEnd = data[offset++];
                            var successiveApproximation = data[offset++];
                            var processed = decodeScan(data, offset, frame, components, resetInterval, spectralStart, spectralEnd, successiveApproximation >> 4, successiveApproximation & 15);
                            offset += processed;
                            break;
                        default:
                            if (data[offset - 3] == 0xFF && data[offset - 2] >= 0xC0 && data[offset - 2] <= 0xFE) {
                                // could be incorrect encoding -- last 0xFF byte of the previous
                                // block was eaten by the encoder
                                offset -= 3;
                                break;
                            }
                            while (offset < data.length && data[offset] !== 0xFF) {
                                offset++;
                            }
                            break;
                    }
                    fileMarker = readUint16();
                }
                this.width = frame.samplesPerLine;
                this.height = frame.scanLines;
                this.jfif = jfif;
                this.adobe = adobe;
                this.components = [];
                for (i = 0; i < frame.components.length; i++) {
                    component = frame.components[i];
                    this.components.push({
                        output: buildComponentData(frame, component),
                        scaleX: component.h / frame.maxH,
                        scaleY: component.v / frame.maxV,
                        blocksPerLine: component.blocksPerLine,
                        blocksPerColumn: component.blocksPerColumn
                    });
                }
                this.numComponents = this.components.length;
            };
            JpegImage.prototype._getLinearizedBlockData = function (width, height) {
                var scaleX = this.width / width, scaleY = this.height / height;
                var component, componentScaleX, componentScaleY, blocksPerScanline;
                var x, y, i, j, k;
                var index;
                var offset = 0;
                var output;
                var numComponents = this.components.length;
                var dataLength = width * height * numComponents;
                var data = new Uint8Array(dataLength);
                var xScaleBlockOffset = new Uint32Array(width);
                var mask3LSB = 0xfffffff8; // used to clear the 3 LSBs
                for (i = 0; i < numComponents; i++) {
                    component = this.components[i];
                    componentScaleX = component.scaleX * scaleX;
                    componentScaleY = component.scaleY * scaleY;
                    offset = i;
                    output = component.output;
                    blocksPerScanline = (component.blocksPerLine + 1) << 3;
                    for (x = 0; x < width; x++) {
                        j = 0 | (x * componentScaleX);
                        xScaleBlockOffset[x] = ((j & mask3LSB) << 3) | (j & 7);
                    }
                    for (y = 0; y < height; y++) {
                        j = 0 | (y * componentScaleY);
                        index = blocksPerScanline * (j & mask3LSB) | ((j & 7) << 3);
                        for (x = 0; x < width; x++) {
                            data[offset] = output[index + xScaleBlockOffset[x]];
                            offset += numComponents;
                        }
                    }
                }
                // decodeTransform will contains pairs of multiplier (-256..256) and
                // additive
                var transform = this.decodeTransform;
                if (transform) {
                    for (i = 0; i < dataLength;) {
                        for (j = 0, k = 0; j < numComponents; j++, i++, k += 2) {
                            data[i] = ((data[i] * transform[k]) >> 8) + transform[k + 1];
                        }
                    }
                }
                return data;
            };
            JpegImage.prototype._isColorConversionNeeded = function () {
                if (this.adobe && this.adobe.transformCode) {
                    // The adobe transform marker overrides any previous setting
                    return true;
                }
                else if (this.numComponents == 3) {
                    return true;
                }
                else {
                    return false;
                }
            };
            JpegImage.prototype._convertYccToRgb = function (data) {
                var Y, Cb, Cr;
                for (var i = 0, length = data.length; i < length; i += 3) {
                    Y = data[i];
                    Cb = data[i + 1];
                    Cr = data[i + 2];
                    data[i] = clamp0to255(Y - 179.456 + 1.402 * Cr);
                    data[i + 1] = clamp0to255(Y + 135.459 - 0.344 * Cb - 0.714 * Cr);
                    data[i + 2] = clamp0to255(Y - 226.816 + 1.772 * Cb);
                }
                return data;
            };
            JpegImage.prototype._convertYcckToRgb = function (data) {
                var Y, Cb, Cr, k, CbCb, CbCr, CbY, Cbk, CrCr, Crk, CrY, YY, Yk, kk;
                var offset = 0;
                for (var i = 0, length = data.length; i < length; i += 4) {
                    Y = data[i];
                    Cb = data[i + 1];
                    Cr = data[i + 2];
                    k = data[i + 3];
                    CbCb = Cb * Cb;
                    CbCr = Cb * Cr;
                    CbY = Cb * Y;
                    Cbk = Cb * k;
                    CrCr = Cr * Cr;
                    Crk = Cr * k;
                    CrY = Cr * Y;
                    YY = Y * Y;
                    Yk = Y * k;
                    kk = k * k;
                    var r = -122.67195406894 - 6.60635669420364e-5 * CbCb + 0.000437130475926232 * CbCr - 5.4080610064599e-5 * CbY + 0.00048449797120281 * Cbk - 0.154362151871126 * Cb - 0.000957964378445773 * CrCr + 0.000817076911346625 * CrY - 0.00477271405408747 * Crk + 1.53380253221734 * Cr + 0.000961250184130688 * YY - 0.00266257332283933 * Yk + 0.48357088451265 * Y - 0.000336197177618394 * kk + 0.484791561490776 * k;
                    var g = 107.268039397724 + 2.19927104525741e-5 * CbCb - 0.000640992018297945 * CbCr + 0.000659397001245577 * CbY + 0.000426105652938837 * Cbk - 0.176491792462875 * Cb - 0.000778269941513683 * CrCr + 0.00130872261408275 * CrY + 0.000770482631801132 * Crk - 0.151051492775562 * Cr + 0.00126935368114843 * YY - 0.00265090189010898 * Yk + 0.25802910206845 * Y - 0.000318913117588328 * kk - 0.213742400323665 * k;
                    var b = -20.810012546947 - 0.000570115196973677 * CbCb - 2.63409051004589e-5 * CbCr + 0.0020741088115012 * CbY - 0.00288260236853442 * Cbk + 0.814272968359295 * Cb - 1.53496057440975e-5 * CrCr - 0.000132689043961446 * CrY + 0.000560833691242812 * Crk - 0.195152027534049 * Cr + 0.00174418132927582 * YY - 0.00255243321439347 * Yk + 0.116935020465145 * Y - 0.000343531996510555 * kk + 0.24165260232407 * k;
                    data[offset++] = clamp0to255(r);
                    data[offset++] = clamp0to255(g);
                    data[offset++] = clamp0to255(b);
                }
                return data;
            };
            JpegImage.prototype._convertYcckToCmyk = function (data) {
                var Y, Cb, Cr;
                for (var i = 0, length = data.length; i < length; i += 4) {
                    Y = data[i];
                    Cb = data[i + 1];
                    Cr = data[i + 2];
                    data[i] = clamp0to255(434.456 - Y - 1.402 * Cr);
                    data[i + 1] = clamp0to255(119.541 - Y + 0.344 * Cb + 0.714 * Cr);
                    data[i + 2] = clamp0to255(481.816 - Y - 1.772 * Cb);
                }
                return data;
            };
            JpegImage.prototype._convertCmykToRgb = function (data) {
                var c, m, y, k;
                var offset = 0;
                var min = -255 * 255 * 255;
                var scale = 1 / 255 / 255;
                for (var i = 0, length = data.length; i < length; i += 4) {
                    c = data[i];
                    m = data[i + 1];
                    y = data[i + 2];
                    k = data[i + 3];
                    var r = c * (-4.387332384609988 * c + 54.48615194189176 * m + 18.82290502165302 * y + 212.25662451639585 * k - 72734.4411664936) + m * (1.7149763477362134 * m - 5.6096736904047315 * y - 17.873870861415444 * k - 1401.7366389350734) + y * (-2.5217340131683033 * y - 21.248923337353073 * k + 4465.541406466231) - k * (21.86122147463605 * k + 48317.86113160301);
                    var g = c * (8.841041422036149 * c + 60.118027045597366 * m + 6.871425592049007 * y + 31.159100130055922 * k - 20220.756542821975) + m * (-15.310361306967817 * m + 17.575251261109482 * y + 131.35250912493976 * k - 48691.05921601825) + y * (4.444339102852739 * y + 9.8632861493405 * k - 6341.191035517494) - k * (20.737325471181034 * k + 47890.15695978492);
                    var b = c * (0.8842522430003296 * c + 8.078677503112928 * m + 30.89978309703729 * y - 0.23883238689178934 * k - 3616.812083916688) + m * (10.49593273432072 * m + 63.02378494754052 * y + 50.606957656360734 * k - 28620.90484698408) + y * (0.03296041114873217 * y + 115.60384449646641 * k - 49363.43385999684) - k * (22.33816807309886 * k + 45932.16563550634);
                    data[offset++] = r >= 0 ? 255 : r <= min ? 0 : 255 + r * scale | 0;
                    data[offset++] = g >= 0 ? 255 : g <= min ? 0 : 255 + g * scale | 0;
                    data[offset++] = b >= 0 ? 255 : b <= min ? 0 : 255 + b * scale | 0;
                }
                return data;
            };
            JpegImage.prototype.getData = function (width, height, forceRGBoutput) {
                if (this.numComponents > 4) {
                    throw 'Unsupported color mode';
                }
                // type of data: Uint8Array(width * height * numComponents)
                var data = this._getLinearizedBlockData(width, height);
                if (this.numComponents === 3) {
                    return this._convertYccToRgb(data);
                }
                else if (this.numComponents === 4) {
                    if (this._isColorConversionNeeded()) {
                        if (forceRGBoutput) {
                            return this._convertYcckToRgb(data);
                        }
                        else {
                            return this._convertYcckToCmyk(data);
                        }
                    }
                    else {
                        return this._convertCmykToRgb(data);
                    }
                }
                return data;
            };
            JpegImage.prototype.copyToImageData = function (imageData) {
                var width = imageData.width, height = imageData.height;
                var imageDataBytes = width * height * 4;
                var imageDataArray = imageData.data;
                var data = this.getData(width, height, true);
                var i = 0, j = 0;
                var Y, K, C, M, R, G, B;
                switch (this.components.length) {
                    case 1:
                        while (j < imageDataBytes) {
                            Y = data[i++];
                            imageDataArray[j++] = Y;
                            imageDataArray[j++] = Y;
                            imageDataArray[j++] = Y;
                            imageDataArray[j++] = 255;
                        }
                        break;
                    case 3:
                        while (j < imageDataBytes) {
                            R = data[i++];
                            G = data[i++];
                            B = data[i++];
                            imageDataArray[j++] = R;
                            imageDataArray[j++] = G;
                            imageDataArray[j++] = B;
                            imageDataArray[j++] = 255;
                        }
                        break;
                    case 4:
                        while (j < imageDataBytes) {
                            C = data[i++];
                            M = data[i++];
                            Y = data[i++];
                            K = data[i++];
                            R = 255 - clamp0to255(C * (1 - K / 255) + K);
                            G = 255 - clamp0to255(M * (1 - K / 255) + K);
                            B = 255 - clamp0to255(Y * (1 - K / 255) + K);
                            imageDataArray[j++] = R;
                            imageDataArray[j++] = G;
                            imageDataArray[j++] = B;
                            imageDataArray[j++] = 255;
                        }
                        break;
                    default:
                        throw 'Unsupported color mode';
                }
            };
            return JpegImage;
        })();
        JPEG.JpegImage = JpegImage;
    })(JPEG = Shumway.JPEG || (Shumway.JPEG = {}));
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
        function Stream_align() {
            this.bitBuffer = this.bitLength = 0;
        }
        function Stream_ensure(size) {
            if (this.pos + size > this.end) {
                throw SWF.StreamNoDataError;
            }
        }
        function Stream_remaining() {
            return this.end - this.pos;
        }
        function Stream_substream(begin, end) {
            var stream = new Stream(this.bytes);
            stream.pos = begin;
            stream.end = end;
            return stream;
        }
        function Stream_push(data) {
            var bytes = this.bytes;
            var newBytesLength = this.end + data.length;
            if (newBytesLength > bytes.length) {
                throw 'stream buffer overfow';
            }
            bytes.set(data, this.end);
            this.end = newBytesLength;
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
                var bytes = new Uint8Array(buffer, offset, maxLength);
                var stream = (new DataView(buffer, offset, maxLength));
                stream.bytes = bytes;
                stream.pos = 0;
                stream.end = length;
                stream.bitBuffer = 0;
                stream.bitLength = 0;
                stream.align = Stream_align;
                stream.ensure = Stream_ensure;
                stream.remaining = Stream_remaining;
                stream.substream = Stream_substream;
                stream.push = Stream_push;
                return stream;
            }
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
var __extends = this.__extends || function (d, b) {
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
        var SWFTag = Parser.SwfTag;
        var DefinitionTags = Parser.DefinitionTags;
        var ImageDefinitionTags = Parser.ImageDefinitionTags;
        var FontDefinitionTags = Parser.FontDefinitionTags;
        var ControlTags = Parser.ControlTags;
        (function (CompressionMethod) {
            CompressionMethod[CompressionMethod["None"] = 0] = "None";
            CompressionMethod[CompressionMethod["Deflate"] = 1] = "Deflate";
            CompressionMethod[CompressionMethod["LZMA"] = 2] = "LZMA";
        })(SWF.CompressionMethod || (SWF.CompressionMethod = {}));
        var CompressionMethod = SWF.CompressionMethod;
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
                SWF.enterTimeline('Parse tag ' + SWFTag[unparsed.tagCode]);
                this._dataStream.align();
                this._dataStream.pos = unparsed.byteOffset;
                var tag = { code: unparsed.tagCode };
                var handler = Parser.LowLevel.tagHandlers[unparsed.tagCode];
                release || Shumway.Debug.assert(handler, 'handler shall exists here');
                var tagEnd = Math.min(unparsed.byteOffset + unparsed.byteLength, this._dataStream.end);
                handler(this.data, this._dataStream, tag, this.swfVersion, unparsed.tagCode, tagEnd);
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
                this.data = new Uint8Array(this.compression === 0 /* None */ ? this.bytesTotal : this._uncompressedLength);
                this._dataStream = new Stream(this.data.buffer);
                this._dataStream.pos = 8;
                this._dataView = this._dataStream;
                if (isDeflateCompressed) {
                    this.data.set(initialBytes.subarray(0, 8));
                    this._uncompressedLoadedLength = 8;
                    this._decompressor = Inflate.create(true);
                    // Parts of the header are compressed. Get those out of the way before starting tag parsing.
                    this._decompressor.onData = this.processFirstBatchOfDecompressedData.bind(this);
                    this._decompressor.onError = function (error) {
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
                        console.warn('Invalid LZMA stream: ' + error);
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
                var obj = Parser.LowLevel.readHeader(this.data, this._dataStream);
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
                    console.info("Scanning tag " + SWFTag[tagCode] + " (start: " + byteOffset + ", end: " + (byteOffset + tagLength) + ")");
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
                if (!rootTimelineMode && !(tagCode === 76 /* CODE_SYMBOL_CLASS */ || tagCode === 56 /* CODE_EXPORT_ASSETS */)) {
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
                        this.backgroundColor = Parser.LowLevel.rgb(this.data, this._dataStream);
                        break;
                    case 8 /* CODE_JPEG_TABLES */:
                        // Only use the first JpegTables tag, ignore any following.
                        if (!this._jpegTables) {
                            this._jpegTables = tagLength === 0 ? new Uint8Array(0) : this.data.subarray(stream.pos, stream.pos + tagLength - 2);
                        }
                        this.jumpToNextTag(tagLength);
                        break;
                    case 82 /* CODE_DO_ABC */:
                    case 72 /* CODE_DO_ABC_DEFINE */:
                        if (!this.useAVM1) {
                            var tagEnd = byteOffset + tagLength;
                            var abcBlock = new ABCBlock();
                            if (tagCode === 82 /* CODE_DO_ABC */) {
                                abcBlock.flags = Parser.readUi32(this.data, stream);
                                abcBlock.name = Parser.readString(this.data, stream, -1);
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
                        var symbolCount = Parser.readUi16(this.data, stream);
                        while (symbolCount--) {
                            var symbolId = Parser.readUi16(this.data, stream);
                            var symbolClassName = Parser.readString(this.data, stream, -1);
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
                            var initActionBlocks = this._currentInitActionBlocks || (this._currentInitActionBlocks = []);
                            var spriteId = this._dataView.getUint16(stream.pos, true);
                            var actionsData = this.data.subarray(byteOffset + 2, byteOffset + tagLength);
                            initActionBlocks.push({ spriteId: spriteId, actionsData: actionsData });
                        }
                        this.jumpToNextTag(tagLength);
                        break;
                    case 12 /* CODE_DO_ACTION */:
                        if (this.useAVM1) {
                            var actionBlocks = this._currentActionBlocks || (this._currentActionBlocks = []);
                            actionBlocks.push(this.data.subarray(stream.pos, stream.pos + tagLength));
                        }
                        this.jumpToNextTag(tagLength);
                        break;
                    case 18 /* CODE_SOUND_STREAM_HEAD */:
                    case 45 /* CODE_SOUND_STREAM_HEAD2 */:
                        var soundStreamTag = Parser.LowLevel.soundStreamHead(this.data, this._dataStream, byteOffset + tagLength);
                        this._currentSoundStreamHead = Parser.SoundStream.FromTag(soundStreamTag);
                        break;
                    case 19 /* CODE_SOUND_STREAM_BLOCK */:
                        this._currentSoundStreamBlock = this.data.subarray(stream.pos, stream.pos += tagLength);
                        break;
                    case 43 /* CODE_FRAME_LABEL */:
                        var tagEnd = stream.pos + tagLength;
                        this._currentFrameLabel = Parser.readString(this.data, stream, -1);
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
                        var exportsCount = Parser.readUi16(this.data, stream);
                        var exports = this._currentExports || (this._currentExports = []);
                        while (exportsCount--) {
                            var symbolId = Parser.readUi16(this.data, stream);
                            var className = Parser.readString(this.data, stream, -1);
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
                        Shumway.Debug.warning('Unsupported tag encountered ' + tagCode + ': ' + SWFTag[tagCode]);
                        this.jumpToNextTag(tagLength);
                        break;
                    case 74 /* CODE_CSM_TEXT_SETTINGS */:
                    case 73 /* CODE_DEFINE_FONT_ALIGN_ZONES */:
                    case 65 /* CODE_SCRIPT_LIMITS */:
                    case 66 /* CODE_SET_TAB_INDEX */:
                        this.jumpToNextTag(tagLength);
                        break;
                    case 58 /* CODE_ENABLE_DEBUGGER */:
                    case 64 /* CODE_ENABLE_DEBUGGER2 */:
                    case 63 /* CODE_DEBUG_ID */:
                    case 88 /* CODE_DEFINE_FONT_NAME */:
                    case 41 /* CODE_PRODUCT_INFO */:
                    case 77 /* CODE_METADATA */:
                    case 24 /* CODE_PROTECT */:
                        this.jumpToNextTag(tagLength);
                        break;
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
                        console.info("Ignored tag (these shouldn't occur) " + tagCode + ': ' + SWFTag[tagCode]);
                        this.jumpToNextTag(tagLength);
                        break;
                    default:
                        Shumway.Debug.warning('Tag not handled by the parser: ' + tagCode + ': ' + SWFTag[tagCode]);
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
                                actionBlocks.push(data.subarray(stream.pos, stream.pos + tagLength));
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
                            label = Parser.readString(data, stream, -1);
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
                Shumway.Debug.warning('Scanning ' + SWFTag[tag.tagCode] + ' at offset ' + tag.byteOffset + ' consumed ' + consumedBytes + ' of ' + tag.byteLength + ' bytes. (' + (tag.byteLength - consumedBytes) + ' left)');
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
                this.sceneAndFrameLabelData = Parser.LowLevel.defineScene(this.data, this._dataStream, null);
            };
            SWFFile.prototype.addControlTag = function (tagCode, byteOffset, tagLength) {
                var controlTags = this._currentControlTags || (this._currentControlTags = []);
                controlTags.push(new UnparsedTag(tagCode, byteOffset, tagLength));
                this.jumpToNextTag(tagLength);
            };
            SWFFile.prototype.addLazySymbol = function (tagCode, byteOffset, tagLength) {
                var id = this._dataStream.getUint16(this._dataStream.pos, true);
                var symbol = new DictionaryEntry(id, tagCode, byteOffset, tagLength);
                this.dictionary[id] = symbol;
                if (!release && SWF.traceLevel.value > 0) {
                    console.info("Registering symbol " + id + " of type " + SWFTag[tagCode]);
                }
                return symbol;
            };
            SWFFile.prototype.decodeEmbeddedFont = function (unparsed) {
                var definition = this.getParsedTag(unparsed);
                var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'font', definition, this.env);
                if (!release && SWF.traceLevel.value > 0) {
                    console.info("Decoding embedded font " + definition.id + " with name '" + definition.name + "'", definition);
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
                var id = stream.getUint16(stream.pos, true);
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
                    style = flagsToFontStyle(!!(flags & 0x2), !!(flags & 0x1));
                    var nameLength = this.data[stream.pos + 4];
                    // Skip language code.
                    stream.pos += 5;
                    name = Parser.readString(this.data, stream, nameLength);
                }
                this.fonts.push({ name: name, id: id, style: style });
                if (!release && SWF.traceLevel.value > 0) {
                    console.info("Registering embedded font " + id + " with name '" + name + "'");
                }
                stream.pos = unparsed.byteOffset + unparsed.byteLength;
            };
            SWFFile.prototype.decodeEmbeddedImage = function (unparsed) {
                var definition = this.getParsedTag(unparsed);
                var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'image', definition, this.env);
                if (!release && SWF.traceLevel.value > 0) {
                    console.info("Decoding embedded image " + definition.id + " of type " + SWFTag[unparsed.tagCode] + " (start: " + unparsed.byteOffset + ", end: " + (unparsed.byteOffset + unparsed.byteLength) + ")");
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
        ImageTypeMagicHeaderBytes[ImageTypeMagicHeaderBytes["JPG"] = 0xffd8ff] = "JPG";
        ImageTypeMagicHeaderBytes[ImageTypeMagicHeaderBytes["PNG"] = 0x89504e] = "PNG";
        ImageTypeMagicHeaderBytes[ImageTypeMagicHeaderBytes["GIF"] = 0x474946] = "GIF";
    })(ImageTypeMagicHeaderBytes || (ImageTypeMagicHeaderBytes = {}));
    var mimetypesForHeaders = {};
    mimetypesForHeaders[16767231 /* JPG */] = 'image/jpeg';
    mimetypesForHeaders[8998990 /* PNG */] = 'image/png';
    mimetypesForHeaders[4671814 /* GIF */] = 'image/gif';
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
            // TODO: implement
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
            if (this._bytesLoaded < MIN_LOADED_BYTES && this._bytesLoaded < progressInfo.bytesTotal) {
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
                this._listener.onLoadOpen(file);
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
            if (file instanceof SWFFile) {
                var eagerlyParsedSymbolsCount = file.eagerlyParsedSymbolsList.length;
                var previousFramesLoaded = file.framesLoaded;
                file.finishLoading();
                this.processSWFFileUpdate(file, eagerlyParsedSymbolsCount, previousFramesLoaded);
            }
            if (!file || file.bytesLoaded !== file.bytesTotal) {
                Shumway.Debug.warning("Not Implemented: processing loadClose when loading was aborted");
            }
            else {
                Shumway.SWF.leaveTimeline();
            }
        };
        FileLoader.prototype.processSWFFileUpdate = function (file, previousEagerlyParsedSymbolsCount, previousFramesLoaded) {
            var promise;
            var eagerlyParsedSymbolsDelta = file.eagerlyParsedSymbolsList.length - previousEagerlyParsedSymbolsCount;
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
                    console.log("Reducing pending update delays from " + file.pendingUpdateDelays + " to " + (file.pendingUpdateDelays - 1));
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
        if ((magic & 0xffff) === 22355 /* SWF */) {
            return new SWFFile(header, fileLength, env);
        }
        if (magic === 16767231 /* JPG */ || magic === 8998990 /* PNG */ || magic === 4671814 /* GIF */) {
            return new Shumway.ImageFile(header, fileLength, env);
        }
        // TODO: throw instead of returning null? Perhaps?
        return null;
    }
    var FileTypeMagicHeaderBytes;
    (function (FileTypeMagicHeaderBytes) {
        FileTypeMagicHeaderBytes[FileTypeMagicHeaderBytes["SWF"] = 0x5753] = "SWF";
        FileTypeMagicHeaderBytes[FileTypeMagicHeaderBytes["JPG"] = 0xffd8ff] = "JPG";
        FileTypeMagicHeaderBytes[FileTypeMagicHeaderBytes["PNG"] = 0x89504e] = "PNG";
        FileTypeMagicHeaderBytes[FileTypeMagicHeaderBytes["GIF"] = 0x474946] = "GIF";
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
///<reference path='options.ts'/>
///<reference path='jpeg.ts' />
///<reference path='stream.ts' />
///<reference path='mp3decodersession.ts' />
///<reference path='SWFFile.ts' />
///<reference path='ImageFile.ts' />
///<reference path='FileLoader.ts' />
//# sourceMappingURL=swf.js.map