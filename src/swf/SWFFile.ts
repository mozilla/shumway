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

module Shumway.SWF {
  import assert = Shumway.Debug.assert;

  import Parser = Shumway.SWF.Parser;
  import Stream = SWF.Stream;
  import IDataDecoder = ArrayUtilities.IDataDecoder;
  import Inflate = ArrayUtilities.Inflate;
  import LzmaDecoder = ArrayUtilities.LzmaDecoder;

  import SwfTagCode = Parser.SwfTagCode;

  import DefinitionTags = Parser.DefinitionTags;
  import ImageDefinitionTags = Parser.ImageDefinitionTags;
  import FontDefinitionTags = Parser.FontDefinitionTags;
  import ImageDefinition = Parser.ImageDefinition;
  import ControlTags = Parser.ControlTags;
  import getSwfTagCodeName = Parser.getSwfTagCodeName;

  export const enum CompressionMethod {
    None,
    Deflate,
    LZMA
  }

  export class SWFFile {
    compression: CompressionMethod;
    swfVersion: number;
    useAVM1: boolean;
    backgroundColor: number;
    bounds: Bounds;
    frameRate: number;
    frameCount: number;
    attributes: any; // TODO: type strongly
    sceneAndFrameLabelData: any; // TODO: type strongly

    bytesLoaded: number;
    bytesTotal: number;
    pendingUpdateDelays: number;
    // Might be lower than frames.length if eagerly parsed assets pending resolution are blocking
    // us from reporting the given frame as loaded.
    framesLoaded: number;

    frames: SWFFrame[];
    abcBlocks: ABCBlock[];
    dictionary: DictionaryEntry[];
    fonts: {name: string; style: string; id: number}[];
    data: Uint8Array;
    env: any;

    symbolClassesMap: string[];
    symbolClassesList: {id: number; className: string}[];
    eagerlyParsedSymbolsMap: EagerlyParsedDictionaryEntry[];
    eagerlyParsedSymbolsList: EagerlyParsedDictionaryEntry[];

    private _uncompressedLength: number;
    private _uncompressedLoadedLength: number;
    private _dataView: DataView;
    private _dataStream: Stream;
    private _decompressor: IDataDecoder;
    private _jpegTables: any;
    private _endTagEncountered: boolean;
    private _loadStarted: number;
    private _lastScanPosition: number;

    private _currentFrameLabel: string;
    private _currentSoundStreamHead: Parser.SoundStream;
    private _currentSoundStreamBlock: Uint8Array;
    private _currentControlTags: UnparsedTag[];
    private _currentActionBlocks: ActionBlock[];
    private _currentInitActionBlocks: InitActionBlock[];
    private _currentExports: SymbolExport[];

    constructor(initialBytes: Uint8Array, length: number, env: any) {
      // TODO: cleanly abort loading/parsing instead of just asserting here.
      release || assert(initialBytes[0] === 67 || initialBytes[0] === 70 || initialBytes[0] === 90,
                        "Unsupported compression format: " + initialBytes[0]);
      release || assert(initialBytes[1] === 87);
      release || assert(initialBytes[2] === 83);
      release || assert(initialBytes.length >= 30, "At least the header must be complete here.");

      if (!release && SWF.traceLevel.value > 0) {
        console.log('Create SWFFile');
      }

      this.env = env;

      this.compression = CompressionMethod.None;
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

    appendLoadedData(bytes: Uint8Array) {
      // TODO: only report decoded or sync-decodable bytes as loaded.
      this.bytesLoaded += bytes.length;
      release || assert(this.bytesLoaded <= this.bytesTotal);
      // Tags after the end tag are simply ignored, so we don't even have to scan them.
      if (this._endTagEncountered) {
        return;
      }
      if (this.compression !== CompressionMethod.None) {
        this._decompressor.push(bytes);
      } else {
        this.processDecompressedData(bytes);
      }
      this.scanLoadedData();
    }

    finishLoading() {
      if (this.compression !== CompressionMethod.None) {
        this._decompressor.close();
        this._decompressor = null;
        this.scanLoadedData();
      }
    }

    getSymbol(id: number) {
      if (this.eagerlyParsedSymbolsMap[id]) {
        return this.eagerlyParsedSymbolsMap[id];
      }
      var unparsed = this.dictionary[id];
      if (!unparsed) {
        return null;
      }
      var symbol;
      if (unparsed.tagCode === SwfTagCode.CODE_DEFINE_SPRITE) {
        // TODO: replace this whole silly `type` business with tagCode checking.
        symbol = this.parseSpriteTimeline(unparsed);
      } else {
        symbol = this.getParsedTag(unparsed);
      }
      symbol.className = this.symbolClassesMap[id] || null;
      symbol.env = this.env;
      return symbol;
    }

    getParsedTag(unparsed: UnparsedTag): any {
      SWF.enterTimeline('Parse tag ' + getSwfTagCodeName(unparsed.tagCode));
      this._dataStream.align();
      this._dataStream.pos = unparsed.byteOffset;
      var handler = Parser.LowLevel.tagHandlers[unparsed.tagCode];
      release || Debug.assert(handler, 'handler shall exists here');
      var tagEnd = Math.min(unparsed.byteOffset + unparsed.byteLength, this._dataStream.end);
      var tag = handler(this._dataStream, this.swfVersion, unparsed.tagCode, tagEnd, this._jpegTables);
      var finalPos = this._dataStream.pos;
      if (finalPos !== tagEnd) {
        this.emitTagSlopWarning(unparsed, tagEnd);
      }
      var symbol = defineSymbol(tag, this.dictionary);
      SWF.leaveTimeline();
      return symbol;
    }

    private readHeaderAndInitialize(initialBytes: Uint8Array) {
      SWF.enterTimeline('Initialize SWFFile');
      var isDeflateCompressed = initialBytes[0] === 67;
      var isLzmaCompressed = initialBytes[0] === 90;
      if (isDeflateCompressed) {
        this.compression = CompressionMethod.Deflate;
      } else if (isLzmaCompressed) {
        this.compression = CompressionMethod.LZMA;
      }
      this.swfVersion = initialBytes[3];
      this._loadStarted = Date.now();
      this._uncompressedLength = readSWFLength(initialBytes);
      this.bytesLoaded = initialBytes.length;
      // In some malformed SWFs, the parsed length in the header doesn't exactly match the actual size of the file. For
      // uncompressed files it seems to be safer to make the buffer large enough from the beginning to fit the entire
      // file than having to resize it later or risking an exception when reading out of bounds.
      this.data = new Uint8Array(this.compression === CompressionMethod.None ?
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
        }
        this._decompressor.push(initialBytes.subarray(8));
      } else if (isLzmaCompressed) {
        this.data.set(initialBytes.subarray(0, 8));
        this._uncompressedLoadedLength = 8;
        this._decompressor = new LzmaDecoder(true);
        this._decompressor.onData = this.processFirstBatchOfDecompressedData.bind(this);
        this._decompressor.onError = function (error) {
          // TODO: Let the loader handle this error.
          Debug.warning('Invalid LZMA stream: ' + error);
        };
        this._decompressor.push(initialBytes);
      } else {
        this.data.set(initialBytes);
        this._uncompressedLoadedLength = initialBytes.length;
        this._decompressor = null;
        this.parseHeaderContents();
      }
      SWF.leaveTimeline();
      this._lastScanPosition = this._dataStream.pos;
      this.scanLoadedData();
    }

    private parseHeaderContents() {
      var obj = Parser.LowLevel.parseHeader(this._dataStream);
      this.bounds = obj.bounds;
      this.frameRate = obj.frameRate;
      this.frameCount = obj.frameCount;
    }

    private processFirstBatchOfDecompressedData(data: Uint8Array) {
      this.processDecompressedData(data);
      this.parseHeaderContents();
      this._decompressor.onData = this.processDecompressedData.bind(this);
    }

    private processDecompressedData(data: Uint8Array) {
      // Make sure we don't cause an exception here when trying to set out-of-bound data by clamping the number of bytes
      // to write to the remaining space in our buffer. If this is the case, we probably got a wrong file length from
      // the SWF header. The Flash Player ignores data that goes over that given length, so should we.
      var length = Math.min(data.length, this._uncompressedLength - this._uncompressedLoadedLength);
      ArrayUtilities.memCopy(this.data, data, this._uncompressedLoadedLength, 0, length);
      this._uncompressedLoadedLength += length;
    }

    private scanLoadedData() {
      SWF.enterTimeline('Scan loaded SWF file tags');
      this._dataStream.pos = this._lastScanPosition;
      this.scanTagsToOffset(this._uncompressedLoadedLength, true);
      this._lastScanPosition = this._dataStream.pos;
      SWF.leaveTimeline();
    }

    private scanTagsToOffset(endOffset: number, rootTimelineMode: boolean) {
      // `parsePos` is always at the start of a tag at this point, because it only gets updated
      // when a tag has been fully parsed.
      var tempTag = new UnparsedTag(0, 0, 0);
      var pos: number;
      while ((pos = this._dataStream.pos) < endOffset - 1) {
        if (!this.parseNextTagHeader(tempTag)) {
          break;
        }
        if (tempTag.tagCode === SwfTagCode.CODE_END) {
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
    }

    /**
     * Parses tag header information at the current seek offset and stores it in the given object.
     *
     * Public so it can be used by tools to parse through entire SWFs.
     */
    parseNextTagHeader(target: UnparsedTag): boolean {
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
    }

    private scanTag(tag: UnparsedTag, rootTimelineMode: boolean): void {
      var stream: Stream = this._dataStream;
      var byteOffset = stream.pos;
      release || assert(byteOffset === tag.byteOffset);
      var tagCode = tag.tagCode;
      var tagLength = tag.byteLength;
      if (!release && traceLevel.value > 1) {
        console.info("Scanning tag " + getSwfTagCodeName(tagCode) + " (start: " + byteOffset +
                     ", end: " + (byteOffset + tagLength) + ")");
      }

      if (tagCode === SwfTagCode.CODE_DEFINE_SPRITE) {
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
          !(tagCode === SwfTagCode.CODE_SYMBOL_CLASS || tagCode === SwfTagCode.CODE_EXPORT_ASSETS)) {
        this.jumpToNextTag(tagLength);
        return;
      }

      if (ControlTags[tagCode]) {
        this.addControlTag(tagCode, byteOffset, tagLength);
        return;
      }

      switch (tagCode) {
        case SwfTagCode.CODE_FILE_ATTRIBUTES:
          this.setFileAttributes(tagLength);
          break;
        case SwfTagCode.CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA:
          this.setSceneAndFrameLabelData(tagLength);
          break;
        case SwfTagCode.CODE_SET_BACKGROUND_COLOR:
          this.backgroundColor = Parser.LowLevel.parseRgb(this._dataStream);
          break;
        case SwfTagCode.CODE_JPEG_TABLES:
          // Only use the first JpegTables tag, ignore any following.
          // TODO test it, swfdec is using the last one
          if (!this._jpegTables) {
            this._jpegTables = tagLength === 0 ?
                              new Uint8Array(0) :
                              this.data.subarray(stream.pos, stream.pos + tagLength - 2);
          }
          this.jumpToNextTag(tagLength);
          break;
        case SwfTagCode.CODE_DO_ABC:
        case SwfTagCode.CODE_DO_ABC_DEFINE:
          if (!this.useAVM1) {
            var tagEnd = byteOffset + tagLength;
            var abcBlock = new ABCBlock();
            if (tagCode === SwfTagCode.CODE_DO_ABC) {
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
          } else {
            this.jumpToNextTag(tagLength);
          }
          break;
        case SwfTagCode.CODE_SYMBOL_CLASS:
          var tagEnd = byteOffset + tagLength;
          var symbolCount = stream.readUi16();
          // TODO: check if symbols can be reassociated after instances have been created.
          while (symbolCount--) {
            var symbolId = stream.readUi16();
            var symbolClassName = stream.readString(-1);
            if (!release && traceLevel.value > 0) {
              console.log('Registering symbol class ' + symbolClassName + ' to symbol ' + symbolId);
            }
            this.symbolClassesMap[symbolId] = symbolClassName;
            this.symbolClassesList.push({id: symbolId, className: symbolClassName});
          }
          // Make sure we move to end of tag even if the content is invalid.
          stream.pos = tagEnd;
          break;
        case SwfTagCode.CODE_DO_INIT_ACTION:
          if (this.useAVM1) {
            var initActionBlocks = this._currentInitActionBlocks ||
                                   (this._currentInitActionBlocks = []);
            var spriteId = this._dataView.getUint16(stream.pos, true);
            var actionsData = this.data.subarray(byteOffset + 2, byteOffset + tagLength);
            initActionBlocks.push({spriteId: spriteId, actionsData: actionsData});
          }
          this.jumpToNextTag(tagLength);
          break;
        case SwfTagCode.CODE_DO_ACTION:
          if (this.useAVM1) {
            var actionBlocks = this._currentActionBlocks || (this._currentActionBlocks = []);
            var actionsData = this.data.subarray(stream.pos, stream.pos + tagLength);
            actionBlocks.push({actionsData: actionsData, precedence: stream.pos});
          }
          this.jumpToNextTag(tagLength);
          break;
        case SwfTagCode.CODE_SOUND_STREAM_HEAD:
        case SwfTagCode.CODE_SOUND_STREAM_HEAD2:
          var soundStreamTag = Parser.LowLevel.parseSoundStreamHeadTag(this._dataStream, byteOffset + tagLength);
          this._currentSoundStreamHead = Parser.SoundStream.FromTag(soundStreamTag);
          break;
        case SwfTagCode.CODE_SOUND_STREAM_BLOCK:
          this._currentSoundStreamBlock = this.data.subarray(stream.pos, stream.pos += tagLength);
          break;
        case SwfTagCode.CODE_FRAME_LABEL:
          var tagEnd = stream.pos + tagLength;
          this._currentFrameLabel = stream.readString(-1);
          // TODO: support SWF6+ anchors.
          stream.pos = tagEnd;
          break;
        case SwfTagCode.CODE_SHOW_FRAME:
          this.finishFrame();
          break;
        case SwfTagCode.CODE_END:
          return;
        case SwfTagCode.CODE_EXPORT_ASSETS:
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
        case SwfTagCode.CODE_DEFINE_BUTTON_CXFORM:
        case SwfTagCode.CODE_DEFINE_BUTTON_SOUND:
        case SwfTagCode.CODE_DEFINE_FONT_INFO:
        case SwfTagCode.CODE_DEFINE_FONT_INFO2:
        case SwfTagCode.CODE_DEFINE_SCALING_GRID:
        case SwfTagCode.CODE_IMPORT_ASSETS:
        case SwfTagCode.CODE_IMPORT_ASSETS2:
          Debug.warning('Unsupported tag encountered ' + tagCode + ': ' + getSwfTagCodeName(tagCode));
          this.jumpToNextTag(tagLength);
          break;
        // These tags should be supported at some point, but for now, we ignore them.
        case SwfTagCode.CODE_CSM_TEXT_SETTINGS:
        case SwfTagCode.CODE_DEFINE_FONT_ALIGN_ZONES:
        case SwfTagCode.CODE_SCRIPT_LIMITS:
        case SwfTagCode.CODE_SET_TAB_INDEX:
        // These tags are used by the player, but not relevant to us.
        case SwfTagCode.CODE_ENABLE_DEBUGGER:
        case SwfTagCode.CODE_ENABLE_DEBUGGER2:
        case SwfTagCode.CODE_DEBUG_ID:
        case SwfTagCode.CODE_DEFINE_FONT_NAME:
        case SwfTagCode.CODE_NAME_CHARACTER:
        case SwfTagCode.CODE_PRODUCT_INFO:
        case SwfTagCode.CODE_METADATA:
        case SwfTagCode.CODE_PROTECT:
        case SwfTagCode.CODE_PATHS_ARE_POSTSCRIPT:
        case SwfTagCode.CODE_TELEMETRY:
        // These are obsolete Generator-related tags.
        case SwfTagCode.CODE_GEN_TAG_OBJECTS:
        case SwfTagCode.CODE_GEN_COMMAND:
          this.jumpToNextTag(tagLength);
          break;
        // These tags aren't used in the player.
        case SwfTagCode.CODE_CHARACTER_SET:
        case SwfTagCode.CODE_DEFINE_BEHAVIOUR:
        case SwfTagCode.CODE_DEFINE_COMMAND_OBJECT:
        case SwfTagCode.CODE_DEFINE_FUNCTION:
        case SwfTagCode.CODE_DEFINE_TEXT_FORMAT:
        case SwfTagCode.CODE_DEFINE_VIDEO:
        case SwfTagCode.CODE_EXTERNAL_FONT:
        case SwfTagCode.CODE_FREE_CHARACTER:
        case SwfTagCode.CODE_FREE_ALL:
        case SwfTagCode.CODE_GENERATE_FRAME:
        case SwfTagCode.CODE_STOP_SOUND:
        case SwfTagCode.CODE_SYNC_FRAME:
          console.info("Ignored tag (these shouldn't occur) " + tagCode + ': ' + getSwfTagCodeName(tagCode));
          this.jumpToNextTag(tagLength);
          break;
        default:
          if (tagCode > 100) {
            Debug.warning("Encountered undefined tag " + tagCode + ", probably used for AVM1 " +
                          "obfuscation. See http://ijs.mtasa.com/files/swfdecrypt.cpp.");
          } else {
            Debug.warning('Tag not handled by the parser: ' + tagCode + ': ' + getSwfTagCodeName(tagCode));
          }
          this.jumpToNextTag(tagLength);
      }
    }

    parseSpriteTimeline(spriteTag: DictionaryEntry) {
      SWF.enterTimeline("parseSpriteTimeline");
      var data = this.data;
      var stream = this._dataStream;
      var dataView = this._dataView;
      var timeline: any = {
        id: spriteTag.id,
        type: 'sprite',
        frames: []
      };
      var spriteTagEnd = spriteTag.byteOffset + spriteTag.byteLength;
      var frames = timeline.frames;
      var label: string = null;
      var controlTags: UnparsedTag[] = [];
      var soundStreamHead: Parser.SoundStream = null;
      var soundStreamBlock: Uint8Array = null;
      var actionBlocks: {actionsData: Uint8Array; precedence: number}[] = null;
      var initActionBlocks: {spriteId: number; actionsData: Uint8Array}[] = null;
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
          Debug.warning("DefineSprite child tags exceed DefineSprite tag length and are dropped");
          break;
        }

        if (Parser.ControlTags[tagCode]) {
          controlTags.push(new UnparsedTag(tagCode, stream.pos, tagLength));
          stream.pos += tagLength;
          continue;
        }

        switch (tagCode) {
          case SwfTagCode.CODE_DO_ACTION:
            if (this.useAVM1) {
              if (!actionBlocks) {
                actionBlocks = [];
              }
              var actionsData = data.subarray(stream.pos, stream.pos + tagLength);
              actionBlocks.push({actionsData: actionsData, precedence: stream.pos});
            }
            break;
          case SwfTagCode.CODE_DO_INIT_ACTION:
            if (this.useAVM1) {
              if (!initActionBlocks) {
                initActionBlocks = [];
              }
              var spriteId = dataView.getUint16(stream.pos, true);
              stream.pos += 2;
              var actionsData = data.subarray(stream.pos, stream.pos + tagLength);
              initActionBlocks.push({spriteId: spriteId, actionsData: actionsData});
            }
            break;
          case SwfTagCode.CODE_FRAME_LABEL:
            var tagEnd = stream.pos + tagLength;
            label = stream.readString(-1);
            // TODO: support SWF6+ anchors.
            stream.pos = tagEnd;
            tagLength = 0;
            break;
          case SwfTagCode.CODE_SHOW_FRAME:
            frames.push(new SWFFrame(controlTags, label, soundStreamHead, soundStreamBlock,
                                     actionBlocks, initActionBlocks, null));
            label = null;
            controlTags = [];
            soundStreamHead = null;
            soundStreamBlock = null;
            actionBlocks = null;
            initActionBlocks = null;
            break;
          case SwfTagCode.CODE_END:
            stream.pos = spriteTagEnd;
            tagLength = 0;
            break;
          default:
          // Ignore other tags.
        }
        stream.pos += tagLength;
        release || assert(stream.pos <= spriteTagEnd);
      }
      SWF.leaveTimeline();
      return timeline;
    }

    private jumpToNextTag(currentTagLength: number) {
      this._dataStream.pos += currentTagLength;
    }

    private emitTagSlopWarning(tag: UnparsedTag, tagEnd: number) {
      var consumedBytes = this._dataStream.pos - tag.byteOffset;
      Debug.warning('Scanning ' + getSwfTagCodeName(tag.tagCode) + ' at offset ' + tag.byteOffset +
                    ' consumed ' + consumedBytes + ' of ' + tag.byteLength + ' bytes. (' +
                    (tag.byteLength - consumedBytes) + ' left)');
      this._dataStream.pos = tagEnd;
    }

    private finishFrame() {
      if (this.pendingUpdateDelays === 0) {
        this.framesLoaded++;
      }
      this.frames.push(new SWFFrame(this._currentControlTags,
                                    this._currentFrameLabel,
                                    this._currentSoundStreamHead,
                                    this._currentSoundStreamBlock,
                                    this._currentActionBlocks,
                                    this._currentInitActionBlocks,
                                    this._currentExports));
      this._currentFrameLabel = null;
      this._currentControlTags = null;
      this._currentSoundStreamHead = null;
      this._currentSoundStreamBlock = null;
      this._currentActionBlocks = null;
      this._currentInitActionBlocks = null;
      this._currentExports = null;
    }

    private setFileAttributes(tagLength: number) {
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
        useDirectBlit : bits & 0x40
      };
      this.useAVM1 = !this.attributes.doAbc;
    }

    private setSceneAndFrameLabelData(tagLength: number) {
      if (this.sceneAndFrameLabelData) {
        this.jumpToNextTag(tagLength);
        return;
      }
      this.sceneAndFrameLabelData = Parser.LowLevel.parseDefineSceneTag(
        this._dataStream, SwfTagCode.CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA);
    }

    private addControlTag(tagCode: number, byteOffset: number, tagLength: number) {
      var controlTags = this._currentControlTags || (this._currentControlTags = []);
      controlTags.push(new UnparsedTag(tagCode, byteOffset, tagLength));
      this.jumpToNextTag(tagLength);

    }
    private addLazySymbol(tagCode: number, byteOffset: number, tagLength: number) {
      var id = this._dataView.getUint16(this._dataStream.pos, true);
      var symbol = new DictionaryEntry(id, tagCode, byteOffset, tagLength);
      this.dictionary[id] = symbol;
      if (!release && traceLevel.value > 0) {
        console.info("Registering symbol " + id + " of type " + getSwfTagCodeName(tagCode));
      }
      return symbol;
    }

    private decodeEmbeddedFont(unparsed: UnparsedTag) {
      var definition = this.getParsedTag(unparsed);
      var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'font', definition,
                                                    this.env);
      if (!release && traceLevel.value > 0) {
        var style = flagsToFontStyle(definition.bold, definition.italic);
        console.info("Decoding embedded font " + definition.id + " with name '" + definition.name +
                     "' and style " + style, definition);
      }
      this.eagerlyParsedSymbolsMap[symbol.id] = symbol;
      this.eagerlyParsedSymbolsList.push(symbol);

      var style = flagsToFontStyle(definition.bold, definition.italic);
      this.fonts.push({name: definition.name, id: definition.id, style: style});
    }

    private registerEmbeddedFont(unparsed: UnparsedTag) {
      if (!inFirefox) {
        this.decodeEmbeddedFont(unparsed);
        return;
      }
      var stream = this._dataStream;
      var id = this._dataView.getUint16(stream.pos, true);
      var style: string;
      var name: string;
      // DefineFont only specifies a symbol ID, no font name or style.
      if (unparsed.tagCode === SwfTagCode.CODE_DEFINE_FONT) {
        // Assigning some unique name to simplify font registration and look ups.
        name = '__autofont__' + unparsed.byteOffset;
        style = 'regular';
      } else {
        var flags = this.data[stream.pos + 2];
        style = flagsToFontStyle(!!(flags & 0x1), !!(flags & 0x2));
        var nameLength = this.data[stream.pos + 4];
        // Skip language code.
        stream.pos += 5;
        name = stream.readString(nameLength);
      }
      this.fonts.push({name: name, id: id, style: style});
      if (!release && traceLevel.value > 0) {
        console.info("Registering embedded font " + id + " with name '" + name + "' and style " +
                     style);
      }
      stream.pos = unparsed.byteOffset + unparsed.byteLength;
    }

    private decodeEmbeddedImage(unparsed: UnparsedTag) {
      var definition = this.getParsedTag(unparsed);
      var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'image', definition,
                                                    this.env);
      if (!release && traceLevel.value > 0) {
        console.info("Decoding embedded image " + definition.id + " of type " +
                     getSwfTagCodeName(unparsed.tagCode) + " (start: " + unparsed.byteOffset +
                     ", end: " + (unparsed.byteOffset + unparsed.byteLength) + ")");
      }
      this.eagerlyParsedSymbolsMap[symbol.id] = symbol;
      this.eagerlyParsedSymbolsList.push(symbol);
    }
  }

  function flagsToFontStyle(bold: boolean, italic: boolean) {
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

  export class SWFFrame {
    controlTags: UnparsedTag[];
    labelName: string;
    soundStreamHead: Parser.SoundStream;
    soundStreamBlock: Uint8Array;
    actionBlocks: ActionBlock[];
    initActionBlocks: InitActionBlock[];
    exports: SymbolExport[];
    constructor(controlTags?: UnparsedTag[], labelName?: string,
                soundStreamHead?: Parser.SoundStream,
                soundStreamBlock?: Uint8Array,
                actionBlocks?: ActionBlock[],
                initActionBlocks?: InitActionBlock[],
                exports?: SymbolExport[]) {
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
  }

  export class ABCBlock {
    name: string;
    flags: number;
    data: Uint8Array;
  }

  export class ActionBlock {
    actionsData: Uint8Array;
    precedence: number;
  }

  export class InitActionBlock {
    spriteId: number;
    actionsData: Uint8Array;
  }

  export class SymbolExport {
    constructor(public symbolId: number, public className: string) {}
  }

  export class UnparsedTag {
    constructor(public tagCode: number, public byteOffset: number, public byteLength: number) {}
  }

  export class DictionaryEntry extends UnparsedTag {
    public id: number;
    constructor(id: number, tagCode: number, byteOffset: number, byteLength: number) {
      super(tagCode, byteOffset, byteLength);
      this.id = id;
    }
  }

  export class EagerlyParsedDictionaryEntry extends DictionaryEntry {
    type: string;
    definition: Object;
    env: any;
    ready: boolean;
    constructor(id: number, unparsed: UnparsedTag, type: string, definition: any, env: any) {
      super(id, unparsed.tagCode, unparsed.byteOffset, unparsed.byteLength);
      this.type = type;
      this.definition = definition;
      this.env = env;
      this.ready = false;
    }
  }

  function readSWFLength(bytes: Uint8Array) {
    // We read the length manually because creating a DataView just for that is silly.
    return (bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24) >>> 0;
  }

  function defineSymbol(swfTag, symbols) {
    switch (swfTag.code) {
      case SwfTagCode.CODE_DEFINE_BITS:
      case SwfTagCode.CODE_DEFINE_BITS_JPEG2:
      case SwfTagCode.CODE_DEFINE_BITS_JPEG3:
      case SwfTagCode.CODE_DEFINE_BITS_JPEG4:
        return Shumway.SWF.Parser.defineImage(swfTag);
      case SwfTagCode.CODE_DEFINE_BITS_LOSSLESS:
      case SwfTagCode.CODE_DEFINE_BITS_LOSSLESS2:
        return Shumway.SWF.Parser.defineBitmap(swfTag);
      case SwfTagCode.CODE_DEFINE_BUTTON:
      case SwfTagCode.CODE_DEFINE_BUTTON2:
        return Shumway.SWF.Parser.defineButton(swfTag, symbols);
      case SwfTagCode.CODE_DEFINE_EDIT_TEXT:
        return Shumway.SWF.Parser.defineText(swfTag);
      case SwfTagCode.CODE_DEFINE_FONT:
      case SwfTagCode.CODE_DEFINE_FONT2:
      case SwfTagCode.CODE_DEFINE_FONT3:
      case SwfTagCode.CODE_DEFINE_FONT4:
        return Shumway.SWF.Parser.defineFont(swfTag);
      case SwfTagCode.CODE_DEFINE_MORPH_SHAPE:
      case SwfTagCode.CODE_DEFINE_MORPH_SHAPE2:
      case SwfTagCode.CODE_DEFINE_SHAPE:
      case SwfTagCode.CODE_DEFINE_SHAPE2:
      case SwfTagCode.CODE_DEFINE_SHAPE3:
      case SwfTagCode.CODE_DEFINE_SHAPE4:
        return Shumway.SWF.Parser.defineShape(swfTag);
      case SwfTagCode.CODE_DEFINE_SOUND:
        return Shumway.SWF.Parser.defineSound(swfTag);
      case SwfTagCode.CODE_DEFINE_VIDEO_STREAM:
        return {
          type: 'video',
          id: swfTag.id,
          width: swfTag.width,
          height: swfTag.height,
          deblocking: swfTag.deblocking,
          smoothing: swfTag.smoothing,
          codec: swfTag.codecId
        };
      case SwfTagCode.CODE_DEFINE_SPRITE:
        // Sprites are fully defined at this point.
        return swfTag;
      case SwfTagCode.CODE_DEFINE_BINARY_DATA:
        return {
          type: 'binary',
          id: swfTag.id,
          data: swfTag.data
        };
      case SwfTagCode.CODE_DEFINE_TEXT:
      case SwfTagCode.CODE_DEFINE_TEXT2:
        return Shumway.SWF.Parser.defineLabel(swfTag);
      default:
        return swfTag;
    }
  }
}
