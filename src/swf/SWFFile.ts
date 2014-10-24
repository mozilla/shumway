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
  import Inflate = ArrayUtilities.Inflate;

  import SWFTag = Parser.SwfTag;

  import DefinitionTags = Parser.DefinitionTags;
  import ImageDefinitionTags = Parser.ImageDefinitionTags;
  import FontDefinitionTags = Parser.FontDefinitionTags;
  import ImageDefinition = Parser.ImageDefinition;
  import ControlTags = Parser.ControlTags;

  export class SWFFile {
    isCompressed: boolean;
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
    framesLoaded: number;

    frames: SWFFrame[];
    abcBlocks: ABCBlock[];
    dictionary: DictionaryEntry[];
    fonts: {name: string; id: number}[];

    symbolClassesMap: string[];
    symbolClassesList: {id: number; className: string}[];
    eagerlyParsedSymbols: EagerlyParsedDictionaryEntry[];
    pendingSymbolsPromise: Promise<any>;

    private _uncompressedLength: number;
    private _uncompressedLoadedLength: number;
    private _data: Uint8Array;
    private _dataView: DataView;
    private _dataStream: Stream;
    private _decompressor: Inflate;
    private _jpegTables: any;
    private _endTagEncountered: boolean;

    private _currentFrameLabel: string;
    private _currentSoundStreamHead: Parser.SoundStream;
    private _currentSoundStreamBlock: Uint8Array;
    private _currentDisplayListCommands: UnparsedTag[];
    private _currentActionBlocks: Uint8Array[];
    private _currentInitActionBlocks: InitActionBlock[];
    private _currentExports: SymbolExport[];

    constructor(initialBytes: Uint8Array, length: number) {
      // TODO: cleanly abort loading/parsing instead of just asserting here.
      release || assert(initialBytes[0] === 67 || initialBytes[0] === 70,
                        "Unsupported compression format: " + (initialBytes[0] === 90 ?
                                                              "LZMA" :
                                                              initialBytes[0] + ''));
      release || assert(initialBytes[1] === 87);
      release || assert(initialBytes[2] === 83);
      release || assert(initialBytes.length >= 30, "At least the header must be complete here.");

      if (!release && SWF.traceLevel.value > 0) {
        console.log('Create SWFFile');
      }

      this.isCompressed = false;
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
      this.framesLoaded = 0;

      this.frames = [];
      this.abcBlocks = [];
      this.dictionary = [];
      this.fonts = [];

      this.symbolClassesMap = [];
      this.symbolClassesList = [];
      this.eagerlyParsedSymbols = [];
      this.pendingSymbolsPromise = null;
      this._jpegTables = null;

      this._currentFrameLabel = null;
      this._currentSoundStreamHead = null;
      this._currentSoundStreamBlock = null;
      this._currentDisplayListCommands = null;
      this._currentActionBlocks = null;
      this._currentInitActionBlocks = null;
      this._currentExports = null;
      this._endTagEncountered = false;
      this.readHeaderAndInitialize(initialBytes);
    }

    appendLoadedData(bytes: Uint8Array) {
      this.pendingSymbolsPromise = null;
      // TODO: only report decoded or sync-decodable bytes as loaded.
      this.bytesLoaded += bytes.length;
      release || assert(this.bytesLoaded <= this.bytesTotal);
      // Tags after the end tag are simply ignored, so we don't even have to scan them.
      if (this._endTagEncountered) {
        return;
      }
      if (this.isCompressed) {
        this._decompressor.push(bytes, true);
      } else {
        this.processDecompressedData(bytes);
      }
      this.scanLoadedData();
    }

    getSymbol(id: number) {
      if (this.eagerlyParsedSymbols[id]) {
        return this.eagerlyParsedSymbols[id];
      }
      var unparsed = this.dictionary[id];
      if (!unparsed) {
        return null;
      }
      var symbol;
      if (unparsed.tagCode === SWFTag.CODE_DEFINE_SPRITE) {
        // TODO: replace this whole silly `type` business with tagCode checking.
        symbol = this.parseSpriteTimeline(unparsed);
      } else {
        symbol = this.getParsedTag(unparsed);
      }
      symbol.className = this.symbolClassesMap[id] || null;
      return symbol;
    }

    getParsedTag(unparsed: UnparsedTag): any {
      SWF.enterTimeline('Parse tag ' + SWFTag[unparsed.tagCode]);
      this._dataStream.align();
      this._dataStream.pos = unparsed.byteOffset;
      var tag: any = {code: unparsed.tagCode};
      var handler = Parser.LowLevel.tagHandlers[unparsed.tagCode];
      var tagEnd = unparsed.byteOffset + unparsed.byteLength;
      handler(this._data, this._dataStream, tag, this.swfVersion, unparsed.tagCode, tagEnd);
      var finalPos = this._dataStream.pos;
      release || assert(finalPos <= tagEnd);
      if (finalPos < tagEnd) {
        var consumedBytes = finalPos - unparsed.byteOffset;
        Debug.warning('Scanning ' + SWFTag[unparsed.tagCode] + ' at offset ' +
                      unparsed.byteOffset + ' consumed ' + consumedBytes + ' of ' +
                      unparsed.byteLength + ' bytes. (' + (tagEnd - finalPos) + ' left)');
        this._dataStream.pos = tagEnd;
      }
      var symbol = defineSymbol(tag, this.dictionary);
      SWF.leaveTimeline();
      return symbol;
    }

    private readHeaderAndInitialize(initialBytes: Uint8Array) {
      SWF.enterTimeline('Initialize SWFFile');
      this.isCompressed = initialBytes[0] === 67;
      this.swfVersion = initialBytes[3];
      this._uncompressedLength = readSWFLength(initialBytes);
      // TODO: only report decoded or sync-decodable bytes as loaded.
      this.bytesLoaded = initialBytes.length;
      this._data = new Uint8Array(this._uncompressedLength);
      this._dataStream = new Stream(this._data.buffer);
      this._dataStream.pos = 8;
      this._dataView = <DataView><any>this._dataStream;

      if (this.isCompressed) {
        this._data.set(initialBytes.subarray(0, 8));
        this._uncompressedLoadedLength = 8;
        this._decompressor = new Inflate(true);
        var self = this;
        // Parts of the header are compressed. Get those out of the way before starting tag parsing.
        this._decompressor.onData = function(data: Uint32Array) {
          self._data.set(data, self._uncompressedLoadedLength);
          self._uncompressedLoadedLength += data.length;
          // TODO: clean up second part of header parsing.
          var obj = Parser.LowLevel.readHeader(self._data, self._dataStream);
          self.bounds = obj.bounds;
          self.frameRate = obj.frameRate;
          self.frameCount = obj.frameCount;
          self._decompressor.onData = self.processDecompressedData.bind(self);
        };
        this._decompressor.push(initialBytes.subarray(8), true);
      } else {
        this._data.set(initialBytes);
        this._uncompressedLoadedLength = initialBytes.length;
        this._decompressor = null;
        // TODO: clean up second part of header parsing.
        var obj = Parser.LowLevel.readHeader(this._data, this._dataStream);
        this.bounds = obj.bounds;
        this.frameRate = obj.frameRate;
        this.frameCount = obj.frameCount;
      }
      SWF.leaveTimeline();
      this.scanLoadedData();
    }

    private processDecompressedData(data: Uint8Array) {
      this._data.set(data, this._uncompressedLoadedLength);
      this._uncompressedLoadedLength += data.length;
      if (this._uncompressedLoadedLength === this._uncompressedLength) {
        this._decompressor = null;
      }
    }

    private scanLoadedData() {
      SWF.enterTimeline('Scan loaded SWF file tags');
      this.scanTagsToOffset(this._uncompressedLoadedLength, true);
      SWF.leaveTimeline();
    }

    private scanTagsToOffset(endOffset: number, rootTimelineMode: boolean) {
      // `parsePos` is always at the start of a tag at this point, because it only gets updated
      // when a tag has been fully parsed.
      var tempTag = new UnparsedTag(0, 0, 0);
      while (this._dataStream.pos < endOffset - 1) {
        this.parseNextTagHeader(tempTag);
        if (tempTag.tagCode === SWFTag.CODE_END) {
          if (rootTimelineMode) {
            this._endTagEncountered = true;
          }
          return;
        }
        var tagEnd = tempTag.byteOffset + tempTag.byteLength;
        if (tagEnd > endOffset) {
          return;
        }
        this.scanTag(tempTag, rootTimelineMode);
        release || assert(this._dataStream.pos <= tagEnd);
        if (this._dataStream.pos < tagEnd) {
          this.emitTagSlopWarning(tempTag, tagEnd);
        }
      }
    }

    /**
     * Parses tag header information at the current seek offset and stores it in the given object.
     *
     * Public so it can be used by tools to parse through entire SWFs.
     */
    parseNextTagHeader(target: UnparsedTag) {
      var position = this._dataStream.pos;
      var tagCodeAndLength = this._dataView.getUint16(position, true);
      position += 2;
      target.tagCode = tagCodeAndLength >> 6;
      var tagLength = tagCodeAndLength & 0x3f;
      var extendedLength = tagLength === 0x3f;
      if (extendedLength) {
        if (position + 4 > this._uncompressedLoadedLength) {
          return;
        }
        tagLength = this._dataView.getUint32(position, true);
        position += 4;
      }
      this._dataStream.pos = position;
      target.byteOffset = position;
      target.byteLength = tagLength;
    }

    private scanTag(tag: UnparsedTag, rootTimelineMode: boolean): void {
      var stream: Stream = this._dataStream;
      var byteOffset = stream.pos;
      release || assert(byteOffset === tag.byteOffset);
      var tagCode = tag.tagCode;
      var tagLength = tag.byteLength;
      if (!release && traceLevel.value > 1) {
        console.info("Scanning tag " + SWFTag[tagCode] + " (start: " + byteOffset +
                     ", end: " + (byteOffset + tagLength) + ")");
      }

      if (tagCode === SWFTag.CODE_DEFINE_SPRITE) {
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
        if (this._dataStream.pos < tagEnd) {
          this.emitTagSlopWarning(tag, tagEnd);
          stream.pos = spriteTagEnd;
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
        if (!inFirefox) {
          this.decodeEmbeddedFont(unparsed);
        } else {
          this.registerEmbeddedFont(unparsed);
        }
        return;
      }
      if (DefinitionTags[tagCode]) {
        this.addLazySymbol(tagCode, byteOffset, tagLength);
        this.jumpToNextTag(tagLength);
        return;
      }

      if (!rootTimelineMode &&
          !(tagCode === SWFTag.CODE_SYMBOL_CLASS || tagCode === SWFTag.CODE_EXPORT_ASSETS)) {
        this.jumpToNextTag(tagLength);
        return;
      }

      if (ControlTags[tagCode]) {
        this.addControlTag(tagCode, byteOffset, tagLength);
        return;
      }

      switch (tagCode) {
        case SWFTag.CODE_FILE_ATTRIBUTES:
          this.setFileAttributes(tagLength);
          break;
        case SWFTag.CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA:
          this.setSceneAndFrameLabelData(tagLength);
          break;
        case SWFTag.CODE_SET_BACKGROUND_COLOR:
          this.backgroundColor = Parser.LowLevel.rgb(this._data, this._dataStream);
          break;
        case SWFTag.CODE_JPEG_TABLES:
          // Only use the first JpegTables tag, ignore any following.
          if (!this._jpegTables) {
            this._jpegTables = tagLength === 0 ?
                              new Uint8Array(0) :
                              this._data.subarray(stream.pos, stream.pos + tagLength - 2);
          }
          this.jumpToNextTag(tagLength);
          break;
        case SWFTag.CODE_DO_ABC:
        case SWFTag.CODE_DO_ABC_DEFINE:
          if (!this.useAVM1) {
            var tagEnd = byteOffset + tagLength;
            var abcBlock = new ABCBlock();
            if (tagCode === SWFTag.CODE_DO_ABC) {
              abcBlock.flags = Parser.readUi32(this._data, stream);
              abcBlock.name = Parser.readString(this._data, stream, 0);
            }
            else {
              abcBlock.flags = 0;
              abcBlock.name = "";
            }
            abcBlock.data = this._data.subarray(stream.pos, tagEnd);
            this.abcBlocks.push(abcBlock);
            stream.pos = tagEnd;
          } else {
            this.jumpToNextTag(tagLength);
          }
          break;
        case SWFTag.CODE_SYMBOL_CLASS:
          var tagEnd = byteOffset + tagLength;
          var symbolCount = Parser.readUi16(this._data, stream);
          // TODO: check if symbols can be reassociated after instances have been created.
          while (symbolCount--) {
            var symbolId = Parser.readUi16(this._data, stream);
            var symbolClassName = Parser.readString(this._data, stream, 0);
            this.symbolClassesMap[symbolId] = symbolClassName;
            this.symbolClassesList.push({id: symbolId, className: symbolClassName});
          }
          // Make sure we move to end of tag even if the content is invalid.
          stream.pos = tagEnd;
          break;
        case SWFTag.CODE_DO_INIT_ACTION:
          if (this.useAVM1) {
            var initActionBlocks = this._currentInitActionBlocks ||
                                   (this._currentInitActionBlocks = []);
            var spriteId = this._dataView.getUint16(stream.pos, true);
            var actionsData = this._data.subarray(byteOffset + 2, byteOffset + tagLength);
            initActionBlocks.push({spriteId: spriteId, actionsData: actionsData});
          }
          this.jumpToNextTag(tagLength);
          break;
        case SWFTag.CODE_DO_ACTION:
          if (this.useAVM1) {
            var actionBlocks = this._currentActionBlocks || (this._currentActionBlocks = []);
            actionBlocks.push(this._data.subarray(stream.pos, stream.pos + tagLength));
          }
          this.jumpToNextTag(tagLength);
          break;
        case SWFTag.CODE_SOUND_STREAM_HEAD:
        case SWFTag.CODE_SOUND_STREAM_HEAD2:
          var soundStreamTag = Parser.LowLevel.soundStreamHead(this._data, this._dataStream);
          this._currentSoundStreamHead = Parser.SoundStream.FromTag(soundStreamTag);
          break;
        case SWFTag.CODE_SOUND_STREAM_BLOCK:
          this._currentSoundStreamBlock = this._data.subarray(stream.pos, stream.pos += tagLength);
          break;
        case SWFTag.CODE_FRAME_LABEL:
          var tagEnd = stream.pos + tagLength;
          this._currentFrameLabel = Parser.readString(this._data, stream, 0);
          // TODO: support SWF6+ anchors.
          stream.pos = tagEnd;
          break;
        case SWFTag.CODE_SHOW_FRAME:
          this.finishFrame();
          break;
        case SWFTag.CODE_END:
          return;
        case SWFTag.CODE_EXPORT_ASSETS:
          var tagEnd = stream.pos + tagLength;
          var exportsCount = Parser.readUi16(this._data, stream);
          var exports = this._currentExports || (this._currentExports = []);
          while (exportsCount--) {
            var symbolId = Parser.readUi16(this._data, stream);
            var className = Parser.readString(this._data, stream, 0);
            if (stream.pos > tagEnd) {
              stream.pos = tagEnd;
              break;
            }
            exports.push(new SymbolExport(symbolId, className));
          }
          stream.pos = tagEnd;
          break;
        case SWFTag.CODE_DEFINE_BUTTON_CXFORM:
        case SWFTag.CODE_DEFINE_BUTTON_SOUND:
        case SWFTag.CODE_DEFINE_FONT_INFO:
        case SWFTag.CODE_DEFINE_FONT_INFO2:
        case SWFTag.CODE_DEFINE_SCALING_GRID:
        case SWFTag.CODE_IMPORT_ASSETS:
        case SWFTag.CODE_IMPORT_ASSETS2:
          Debug.warning('Unsupported tag encountered ' + tagCode + ': ' + SWFTag[tagCode]);
          this.jumpToNextTag(tagLength);
          break;
        // These tags should be supported at some point, but for now, we ignore them.
        case SWFTag.CODE_CSM_TEXT_SETTINGS:
        case SWFTag.CODE_DEFINE_FONT_ALIGN_ZONES:
        case SWFTag.CODE_SCRIPT_LIMITS:
        case SWFTag.CODE_SET_TAB_INDEX:
          this.jumpToNextTag(tagLength);
          break;
        // These tags are used by the player, but not relevant to us.
        case SWFTag.CODE_ENABLE_DEBUGGER:
        case SWFTag.CODE_ENABLE_DEBUGGER2:
        case SWFTag.CODE_DEBUG_ID:
        case SWFTag.CODE_DEFINE_FONT_NAME:
        case SWFTag.CODE_PRODUCT_INFO:
        case SWFTag.CODE_METADATA:
        case SWFTag.CODE_PROTECT:
          this.jumpToNextTag(tagLength);
          break;
        // These tags aren't used in the player.
        case SWFTag.CODE_CHARACTER_SET:
        case SWFTag.CODE_DEFINE_BEHAVIOUR:
        case SWFTag.CODE_DEFINE_COMMAND_OBJECT:
        case SWFTag.CODE_DEFINE_FUNCTION:
        case SWFTag.CODE_DEFINE_TEXT_FORMAT:
        case SWFTag.CODE_DEFINE_VIDEO:
        case SWFTag.CODE_EXTERNAL_FONT:
        case SWFTag.CODE_FREE_CHARACTER:
        case SWFTag.CODE_FREE_ALL:
        case SWFTag.CODE_GENERATE_FRAME:
        case SWFTag.CODE_STOP_SOUND:
        case SWFTag.CODE_SYNC_FRAME:
          console.info("Ignored tag (these shouldn't occur) " + tagCode + ': ' + SWFTag[tagCode]);
          this.jumpToNextTag(tagLength);
          break;
        default:
          Debug.warning('Tag not handled by the parser: ' + tagCode + ': ' + SWFTag[tagCode]);
          this.jumpToNextTag(tagLength);
      }
    }

    parseSpriteTimeline(spriteTag: DictionaryEntry) {
      SWF.enterTimeline("parseSpriteTimeline");
      var data = this._data;
      var stream = this._dataStream;
      var dataView = this._dataView;
      var timeline: any = {
        id: spriteTag.id,
        type: 'sprite',
        frames: []
      }
      var spriteTagEnd = spriteTag.byteOffset + spriteTag.byteLength;
      var frames = timeline.frames;
      var label: string = null;
      var commands: UnparsedTag[] = [];
      var soundStreamHead: Parser.SoundStream = null;
      var soundStreamBlock: Uint8Array = null;
      var actionBlocks: Uint8Array[] = null;
      var initActionBlocks:  {spriteId: number; actionsData: Uint8Array}[] = null;
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
          commands.push(new UnparsedTag(tagCode, stream.pos, tagLength));
          stream.pos += tagLength;
          continue;
        }

        switch (tagCode) {
          case SWFTag.CODE_DO_ACTION:
            if (this.useAVM1) {
              if (!actionBlocks) {
                actionBlocks = [];
              }
              actionBlocks.push(data.subarray(stream.pos, stream.pos + tagLength));
            }
            break;
          case SWFTag.CODE_DO_INIT_ACTION:
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
          case SWFTag.CODE_FRAME_LABEL:
            var tagEnd = stream.pos + tagLength;
            label = Parser.readString(data, stream, 0);
            // TODO: support SWF6+ anchors.
            stream.pos = tagEnd;
            tagLength = 0;
            break;
          case SWFTag.CODE_SHOW_FRAME:
            frames.push(new SWFFrame(label, commands, soundStreamHead, soundStreamBlock,
                                     actionBlocks, initActionBlocks, null));
            label = null;
            commands = [];
            soundStreamHead = null;
            soundStreamBlock = null;
            actionBlocks = null;
            initActionBlocks = null;
            break;
          case SWFTag.CODE_END:
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
      Debug.warning('Scanning ' + SWFTag[tag.tagCode] + ' at offset ' + tag.byteOffset +
                    ' consumed ' + consumedBytes + ' of ' + tag.byteLength + ' bytes. (' +
                    (tag.byteLength - consumedBytes) + ' left)');
      this._dataStream.pos = tagEnd;
    }

    private finishFrame() {
      if (this.framesLoaded === this.frames.length) {
        this.framesLoaded++;
      }
      this.frames.push(new SWFFrame(this._currentFrameLabel,
                                    this._currentDisplayListCommands,
                                    this._currentSoundStreamHead,
                                    this._currentSoundStreamBlock,
                                    this._currentActionBlocks,
                                    this._currentInitActionBlocks,
                                    this._currentExports));
      this._currentFrameLabel = null;
      this._currentDisplayListCommands = null;
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
      var bits = this._data[this._dataStream.pos];
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
      }
      this.sceneAndFrameLabelData = Parser.LowLevel.defineScene(this._data, this._dataStream, null);
    }

    private addControlTag(tagCode: number, byteOffset: number, tagLength: number) {
      var commands = this._currentDisplayListCommands || (this._currentDisplayListCommands = []);
      commands.push(new UnparsedTag(tagCode, byteOffset, tagLength));
      this.jumpToNextTag(tagLength);

    }
    private addLazySymbol(tagCode: number, byteOffset: number, tagLength: number) {
      var id = this._dataStream.getUint16(this._dataStream.pos, true);
      var symbol = new DictionaryEntry(id, tagCode, byteOffset, tagLength);
      this.dictionary[id] = symbol;
      if (!release && traceLevel.value > 0) {
        console.info("Registering symbol " + id + " of type " + SWFTag[tagCode]);
      }
      return symbol;
    }

    private decodeEmbeddedFont(unparsed: UnparsedTag) {
      var definition = this.getParsedTag(unparsed);
      var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'font', definition);
      if (!release && traceLevel.value > 0) {
        console.info("Decoding embedded font " + definition.id + " with name '" +
                     definition.name + "'", definition);
      }
      this.eagerlyParsedSymbols[symbol.id] = symbol;
      // Nothing more to do for glyph-less fonts.
      if (!definition.data) {
        return;
      }
      this.fonts.push({name: definition.name, id: definition.id});
      // Firefox decodes fonts synchronously, so we don't need to delay other processing until it's
      // done. For other browsers, delay for a time that should be enough in all cases.
      var promise = new Promise((resolve, reject) => setTimeout(resolve, 400));
      promise.then(this.markSymbolAsDecoded.bind(this, symbol));
      var currentPromise = this.pendingSymbolsPromise;
      this.pendingSymbolsPromise = currentPromise ?
                                   Promise.all([currentPromise, promise]) :
                                   promise;
    }

    private registerEmbeddedFont(unparsed: UnparsedTag) {
      // DefineFont only specifies a symbol ID, no font name, so we don't have to do anything here.
      if (unparsed.tagCode === SWFTag.CODE_DEFINE_FONT) {
        return;
      }
      var stream = this._dataStream;
      var id = stream.getUint16(stream.pos, true);
      // Skip flags and language code.
      var nameLength = this._data[stream.pos + 4];
      stream.pos += 5;
      var name = Parser.readString(this._data, stream, nameLength);
      this.fonts.push({name: name, id: id});
      if (!release && traceLevel.value > 0) {
        console.info("Registering embedded font " + id + " with name '" + name + "'");
      }
      stream.pos = unparsed.byteOffset + unparsed.byteLength;
    }

    private decodeEmbeddedImage(unparsed: UnparsedTag) {
      var definition = this.getParsedTag(unparsed);
      var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'image', definition);
      if (!release && traceLevel.value > 0) {
        console.info("Decoding embedded image " + definition.id + " of type " +
                     SWFTag[unparsed.tagCode] + " (start: " + unparsed.byteOffset +
                     ", end: " + (unparsed.byteOffset + unparsed.byteLength) + ")");
      }
      this.eagerlyParsedSymbols[symbol.id] = symbol;
      var promise = decodeImage(definition, this.markSymbolAsDecoded.bind(this, symbol));
      var currentPromise = this.pendingSymbolsPromise;
      this.pendingSymbolsPromise = currentPromise ?
                                   Promise.all([currentPromise, promise]) :
                                   promise;
    }

    private markSymbolAsDecoded(symbol: EagerlyParsedDictionaryEntry, event?: any) {
      symbol.ready = true;
      if (!release && traceLevel.value > 0) {
        console.info("Marking symbol " + symbol.id + " as decoded.", symbol);
      }
      if (event && event.type === 'error') {
        Debug.warning("Decoding of image symbol failed", symbol, event);
      }
    }
  }

  function decodeImage(definition: ImageDefinition, oncomplete: (event: any) => void) {
    var image = definition.image = new Image();
    image.src = URL.createObjectURL(new Blob([definition.data], {type: definition.mimeType}));
    return new Promise(function(resolve, reject) {
      image.onload = resolve;
      image.onerror = resolve;
    }).then(oncomplete);
  }

  export class SWFFrame {
    labelName: string;
    displayListCommands: UnparsedTag[];
    soundStreamHead: Parser.SoundStream;
    soundStreamBlock: Uint8Array;
    actionBlocks: Uint8Array[];
    initActionBlocks: InitActionBlock[];
    exports: SymbolExport[];
    constructor(labelName: string, commands: UnparsedTag[],
                soundStreamHead: Parser.SoundStream,
                soundStreamBlock: Uint8Array,
                actionBlocks: Uint8Array[],
                initActionBlocks: InitActionBlock[],
                exports: SymbolExport[]) {
      this.labelName = labelName;
      release || commands && Object.freeze(commands);
      this.displayListCommands = commands;
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
    ready: boolean;
    constructor(id: number, unparsed: UnparsedTag, type: string, definition: any) {
      super(id, unparsed.tagCode, unparsed.byteOffset, unparsed.byteLength);
      this.type = type;
      this.definition = definition;
      this.ready = false;
    }
  }

  function readSWFLength(bytes: Uint8Array) {
    // We read the length manually because creating a DataView just for that is silly.
    return bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24;
  }

  var inFirefox = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') >= 0;

  function defineSymbol(swfTag, symbols) {
    switch (swfTag.code) {
      case SWFTag.CODE_DEFINE_BITS:
      case SWFTag.CODE_DEFINE_BITS_JPEG2:
      case SWFTag.CODE_DEFINE_BITS_JPEG3:
      case SWFTag.CODE_DEFINE_BITS_JPEG4:
        return Shumway.SWF.Parser.defineImage(swfTag);
      case SWFTag.CODE_DEFINE_BITS_LOSSLESS:
      case SWFTag.CODE_DEFINE_BITS_LOSSLESS2:
        return Shumway.SWF.Parser.defineBitmap(swfTag);
      case SWFTag.CODE_DEFINE_BUTTON:
      case SWFTag.CODE_DEFINE_BUTTON2:
        return Shumway.SWF.Parser.defineButton(swfTag, symbols);
      case SWFTag.CODE_DEFINE_EDIT_TEXT:
        return Shumway.SWF.Parser.defineText(swfTag);
      case SWFTag.CODE_DEFINE_FONT:
      case SWFTag.CODE_DEFINE_FONT2:
      case SWFTag.CODE_DEFINE_FONT3:
      case SWFTag.CODE_DEFINE_FONT4:
        var symbol = Shumway.SWF.Parser.defineFont(swfTag);
        // Only register fonts with embedded glyphs.
        if (symbol.data) {
          Shumway.registerCSSFont(symbol.id, symbol.data, !inFirefox);
        }
        return symbol;
      case SWFTag.CODE_DEFINE_MORPH_SHAPE:
      case SWFTag.CODE_DEFINE_MORPH_SHAPE2:
      case SWFTag.CODE_DEFINE_SHAPE:
      case SWFTag.CODE_DEFINE_SHAPE2:
      case SWFTag.CODE_DEFINE_SHAPE3:
      case SWFTag.CODE_DEFINE_SHAPE4:
        return Shumway.SWF.Parser.defineShape(swfTag);
      case SWFTag.CODE_DEFINE_SOUND:
        return Shumway.SWF.Parser.defineSound(swfTag);
      case SWFTag.CODE_DEFINE_SPRITE:
        // Sprites are fully defined at this point.
        return swfTag;
      case SWFTag.CODE_DEFINE_BINARY_DATA:
        return {
          type: 'binary',
          id: swfTag.id,
          data: swfTag.data
        };
      case SWFTag.CODE_DEFINE_TEXT:
      case SWFTag.CODE_DEFINE_TEXT2:
        return Shumway.SWF.Parser.defineLabel(swfTag);
      default:
        return swfTag;
    }
  }
}
