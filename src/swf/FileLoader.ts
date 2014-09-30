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

module Shumway {
  import assert = Shumway.Debug.assert;
  import Parser = Shumway.SWF.Parser;
  import IPipe = Shumway.SWF.Parser.IPipe;
  import SwfTag = Shumway.SWF.Parser.SwfTag;
  import createSoundStream = Shumway.SWF.Parser.createSoundStream;

  export interface ILoadListener {
    onLoadOpen: Function;
    onLoadProgress: Function;
    onLoadComplete: Function;
    onLoadError: Function;
  }

  export class FileLoader {

    private _listener: ILoadListener;
    private _loadingServiceSession: FileLoadingSession;

    private _parsingPipe: IPipe;

    constructor(listener: ILoadListener) {
      release || assert(listener);
      this._listener = listener;
      this._loadingServiceSession = null;
      this._parsingPipe = null;
    }

    // TODO: strongly type
    loadFile(request: any) {
      var session = this._loadingServiceSession = FileLoadingService.instance.createSession();
      session.onopen = this.processLoadOpen.bind(this);
      session.onprogress = this.processNewData.bind(this);
      session.onerror = this.processError.bind(this);
      session.onclose = this.processLoadClose.bind(this);
      session.open(request);
    }
    abortLoad() {
      // TODO: implement
    }
    loadBytes(bytes: ArrayBuffer) {
      Parser.parse(bytes, this.createParsingContext(this.commitData.bind(this)));
    }

    processLoadOpen() {
      this._parsingPipe = Parser.parseAsync(this.createParsingContext(this.commitData.bind(this)));
    }
    processNewData(data: Uint8Array, progressInfo: {bytesLoaded: number; bytesTotal: number}) {
      this._parsingPipe.push(data, progressInfo);
    }
    processError(error) {
    }
    processLoadClose() {
      this._parsingPipe.close();
    }


    commitData(data) {
      this._listener.onLoadProgress(data);
    }

    createParsingContext(commitData) {
      var commands = [];
      var symbols = {};
      var frame:any = { type: 'frame' };
      var tagsProcessed = 0;
      var soundStream = null;
      var bytesLoaded = 0;

      return {
        onstart: function (result) {
          commitData({command: 'init', result: result});
        },
        onimgprogress: function (bytesTotal) {
          // image progress events are sent with 1K increments
          while (bytesLoaded <= bytesTotal) {
            commitData({command: 'progress', result: {
              bytesLoaded: bytesLoaded,
              bytesTotal: bytesTotal,
              open: true
            }});
            bytesLoaded += Math.min(bytesTotal - bytesLoaded || 1024, 1024);
          }
        },
        onprogress: function (result) {
          // sending progress events with 64K increments
          if (result.bytesLoaded - bytesLoaded >= 65536) {
            while (bytesLoaded < result.bytesLoaded) {
              if (bytesLoaded) {
                commitData({command: 'progress', result: {
                  bytesLoaded: bytesLoaded,
                  bytesTotal: result.bytesTotal
                }});
              }
              bytesLoaded += 65536;
            }
          }

          var tags = result.tags;
          for (var n = tags.length; tagsProcessed < n; tagsProcessed++) {
            var tag = tags[tagsProcessed];
            if ('id' in tag) {
              var symbol = defineSymbol(tag, symbols, commitData);
              commitData(symbol, symbol.transferables);
              continue;
            }

            switch (tag.code) {
              case SwfTag.CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA:
                frame.sceneData = tag;
                break;
              case SwfTag.CODE_DEFINE_SCALING_GRID:
                var symbolUpdate = {
                  isSymbol: true,
                  id: tag.symbolId,
                  updates: {
                    scale9Grid: tag.splitter
                  }
                };
                commitData(symbolUpdate);
                break;
              case SwfTag.CODE_DO_ABC:
              case SwfTag.CODE_DO_ABC_:
                commitData({
                             type: 'abc',
                             flags: tag.flags,
                             name: tag.name,
                             data: tag.data
                           });
                break;
              case SwfTag.CODE_DO_ACTION:
                var actionBlocks = frame.actionBlocks;
                if (actionBlocks)
                  actionBlocks.push(tag.actionsData);
                else
                  frame.actionBlocks = [tag.actionsData];
                break;
              case SwfTag.CODE_DO_INIT_ACTION:
                var initActionBlocks = frame.initActionBlocks ||
                                       (frame.initActionBlocks = []);
                initActionBlocks.push({spriteId: tag.spriteId, actionsData: tag.actionsData});
                break;
              case SwfTag.CODE_START_SOUND:
                commands.push(tag);
                break;
              case SwfTag.CODE_SOUND_STREAM_HEAD:
                try {
                  // TODO: make transferable
                  soundStream = createSoundStream(tag);
                  frame.soundStream = soundStream.info;
                } catch (e) {
                  // ignoring if sound stream codec is not supported
                  // console.error('ERROR: ' + e.message);
                }
                break;
              case SwfTag.CODE_SOUND_STREAM_BLOCK:
                if (soundStream) {
                  frame.soundStreamBlock = soundStream.decode(tag.data);
                }
                break;
              case SwfTag.CODE_EXPORT_ASSETS:
                var exports = frame.exports;
                if (exports)
                  frame.exports = exports.concat(tag.exports);
                else
                  frame.exports = tag.exports.slice(0);
                break;
              case SwfTag.CODE_SYMBOL_CLASS:
                var symbolClasses = frame.symbolClasses;
                if (symbolClasses)
                  frame.symbolClasses = symbolClasses.concat(tag.exports);
                else
                  frame.symbolClasses = tag.exports.slice(0);
                break;
              case SwfTag.CODE_FRAME_LABEL:
                frame.labelName = tag.name;
                break;
              case SwfTag.CODE_PLACE_OBJECT:
              case SwfTag.CODE_PLACE_OBJECT2:
              case SwfTag.CODE_PLACE_OBJECT3:
                commands.push(tag);
                break;
              case SwfTag.CODE_REMOVE_OBJECT:
              case SwfTag.CODE_REMOVE_OBJECT2:
                commands.push(tag);
                break;
              case SwfTag.CODE_SET_BACKGROUND_COLOR:
                frame.bgcolor = tag.color;
                break;
              case SwfTag.CODE_SHOW_FRAME:
                frame.repeat = tag.repeat;
                frame.commands = commands;
                frame.complete = !!tag.finalTag;
                commitData(frame);
                commands = [];
                frame = { type: 'frame' };
                break;
              default:
                Debug.warning('Dropped tag during parsing. Code: ' + tag.code);
            }
          }

          if (result.bytesLoaded >= result.bytesTotal) {
            commitData({command: 'progress', result: {
              bytesLoaded: result.bytesLoaded,
              bytesTotal: result.bytesTotal
            }});
          }
        },
        oncomplete: function (result) {
          commitData(result);

          var stats;
          if (typeof result.swfVersion === 'number') {
            // Extracting stats from the context object
            var bbox = result.bbox;
            stats = {
              topic: 'parseInfo', // HACK additional field for telemetry
              parseTime: result.parseTime,
              bytesTotal: result.bytesTotal,
              swfVersion: result.swfVersion,
              frameRate: result.frameRate,
              width: (bbox.xMax - bbox.xMin) / 20,
              height: (bbox.yMax - bbox.yMin) / 20,
              isAvm2: !!result.fileAttributes.doAbc
            };
          }

          commitData({command: 'complete', stats: stats});
        },
        onexception: function (e) {
          commitData({type: 'exception', message: e.message, stack: e.stack});
        }
      };
    }
  }

  function defineSymbol(swfTag, symbols, commitData) {
    var symbol;

    switch (swfTag.code) {
      case SwfTag.CODE_DEFINE_BITS:
      case SwfTag.CODE_DEFINE_BITS_JPEG2:
      case SwfTag.CODE_DEFINE_BITS_JPEG3:
      case SwfTag.CODE_DEFINE_BITS_JPEG4:
      case SwfTag.CODE_JPEG_TABLES:
        symbol = Shumway.SWF.Parser.defineImage(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_BITS_LOSSLESS:
      case SwfTag.CODE_DEFINE_BITS_LOSSLESS2:
        symbol = Shumway.SWF.Parser.defineBitmap(swfTag);
        break;
      case SwfTag.CODE_DEFINE_BUTTON:
      case SwfTag.CODE_DEFINE_BUTTON2:
        symbol = Shumway.SWF.Parser.defineButton(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_EDIT_TEXT:
        symbol = Shumway.SWF.Parser.defineText(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_FONT:
      case SwfTag.CODE_DEFINE_FONT2:
      case SwfTag.CODE_DEFINE_FONT3:
      case SwfTag.CODE_DEFINE_FONT4:
        symbol = Shumway.SWF.Parser.defineFont(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_MORPH_SHAPE:
      case SwfTag.CODE_DEFINE_MORPH_SHAPE2:
      case SwfTag.CODE_DEFINE_SHAPE:
      case SwfTag.CODE_DEFINE_SHAPE2:
      case SwfTag.CODE_DEFINE_SHAPE3:
      case SwfTag.CODE_DEFINE_SHAPE4:
        symbol = Shumway.SWF.Parser.defineShape(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_SOUND:
        symbol = Shumway.SWF.Parser.defineSound(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_BINARY_DATA:
        symbol = {
          type: 'binary',
          id: swfTag.id,
          // TODO: make transferable
          data: swfTag.data
        };
        break;
      case SwfTag.CODE_DEFINE_SPRITE:
        var commands = [];
        var frame:any = { type: 'frame' };
        var frames = [];
        var tags = swfTag.tags;
        var frameScripts = null;
        var frameIndex = 0;
        var soundStream = null;
        for (var i = 0, n = tags.length; i < n; i++) {
          var tag:any = tags[i];
          if ('id' in tag) {
            // According to Chapter 13 of the SWF format spec, no nested definition tags are
            // allowed within DefineSprite. However, they're added to the symbol dictionary
            // anyway, and some tools produce them. Notably swfmill.
            // We essentially treat them as though they came before the current sprite. That
            // should be ok because it doesn't make sense for them to rely on their parent being
            // fully defined - so they don't have to come after it -, and any control tags within
            // the parent will just pick them up the moment they're defined, just as always.
            var symbol = defineSymbol(tag, symbols, commitData);
            commitData(symbol, symbol.transferables);
            continue;
          }
          switch (tag.code) {
            case SwfTag.CODE_DO_ACTION:
              if (!frameScripts)
                frameScripts = [];
              frameScripts.push(frameIndex);
              frameScripts.push(tag.actionsData);
              break;
            // case SwfTag.CODE_DO_INIT_ACTION: ??
            case SwfTag.CODE_START_SOUND:
              commands.push(tag);
              break;
            case SwfTag.CODE_SOUND_STREAM_HEAD:
              try {
                // TODO: make transferable
                soundStream = createSoundStream(tag);
                frame.soundStream = soundStream.info;
              } catch (e) {
                // ignoring if sound stream codec is not supported
                // console.error('ERROR: ' + e.message);
              }
              break;
            case SwfTag.CODE_SOUND_STREAM_BLOCK:
              if (soundStream) {
                frame.soundStreamBlock = soundStream.decode(tag.data);
              }
              break;
            case SwfTag.CODE_FRAME_LABEL:
              frame.labelName = tag.name;
              break;
            case SwfTag.CODE_PLACE_OBJECT:
            case SwfTag.CODE_PLACE_OBJECT2:
            case SwfTag.CODE_PLACE_OBJECT3:
              commands.push(tag);
              break;
            case SwfTag.CODE_REMOVE_OBJECT:
            case SwfTag.CODE_REMOVE_OBJECT2:
              commands.push(tag);
              break;
            case SwfTag.CODE_SHOW_FRAME:
              frameIndex += tag.repeat;
              frame.repeat = tag.repeat;
              frame.commands = commands;
              frames.push(frame);
              commands = [];
              frame = { type: 'frame' };
              break;
            default:
              Debug.warning('Dropped tag during parsing. Code: ' + tag.code);
          }
        }
        if (frames.length === 0) {
          // We need at least one frame
          frame.repeat = 1;
          frame.commands = commands;
          frames.push(frame);
        }
        symbol = {
          type: 'sprite',
          id: swfTag.id,
          frameCount: swfTag.frameCount,
          frames: frames,
          frameScripts: frameScripts
        };
        break;
      case SwfTag.CODE_DEFINE_TEXT:
      case SwfTag.CODE_DEFINE_TEXT2:
        symbol = Shumway.SWF.Parser.defineLabel(swfTag, symbols);
        break;
      default:
        Debug.warning('Dropped tag during parsing. Code: ' + tag.code);
    }

    if (!symbol) {
      return {command: 'error', message: 'unknown symbol type: ' + swfTag.code};
    }

    symbol.isSymbol = true;
    symbols[swfTag.id] = symbol;
    return symbol;
  }
}
