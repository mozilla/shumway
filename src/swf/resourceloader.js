/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
/* global importScripts, FileReader, FileReaderSync, SWF,
 defineBitmap, defineImage, defineFont, defineShape, defineSound,
 defineLabel, defineButton, defineText, createSoundStream,
 SWF_TAG_CODE_DEFINE_BITS, SWF_TAG_CODE_DEFINE_BITS_JPEG2,
 SWF_TAG_CODE_DEFINE_BITS_JPEG3, SWF_TAG_CODE_DEFINE_BITS_JPEG4,
 SWF_TAG_CODE_DEFINE_BITS_LOSSLESS, SWF_TAG_CODE_DEFINE_BITS_LOSSLESS2,
 SWF_TAG_CODE_DEFINE_BUTTON, SWF_TAG_CODE_DEFINE_BUTTON2,
 SWF_TAG_CODE_DEFINE_EDIT_TEXT, SWF_TAG_CODE_DEFINE_FONT,
 SWF_TAG_CODE_DEFINE_FONT2, SWF_TAG_CODE_DEFINE_FONT3,
 SWF_TAG_CODE_DEFINE_FONT4, SWF_TAG_CODE_DEFINE_MORPH_SHAPE,
 SWF_TAG_CODE_DEFINE_MORPH_SHAPE2, SWF_TAG_CODE_DEFINE_SCALING_GRID,
 SWF_TAG_CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA, SWF_TAG_CODE_DEFINE_SHAPE,
 SWF_TAG_CODE_DEFINE_SHAPE2, SWF_TAG_CODE_DEFINE_SHAPE3,
 SWF_TAG_CODE_DEFINE_SHAPE4, SWF_TAG_CODE_DEFINE_SOUND,
 SWF_TAG_CODE_DEFINE_SPRITE, SWF_TAG_CODE_DEFINE_TEXT,
 SWF_TAG_CODE_DEFINE_TEXT2, SWF_TAG_CODE_DO_ABC,
 SWF_TAG_CODE_DO_ABC_, SWF_TAG_CODE_DO_ACTION,
 SWF_TAG_CODE_DO_INIT_ACTION, SWF_TAG_CODE_FRAME_LABEL,
 SWF_TAG_CODE_JPEG_TABLES, SWF_TAG_CODE_PLACE_OBJECT,
 SWF_TAG_CODE_PLACE_OBJECT2, SWF_TAG_CODE_PLACE_OBJECT3,
 SWF_TAG_CODE_REMOVE_OBJECT, SWF_TAG_CODE_REMOVE_OBJECT2,
 SWF_TAG_CODE_SET_BACKGROUND_COLOR, SWF_TAG_CODE_SHOW_FRAME,
 SWF_TAG_CODE_SOUND_STREAM_BLOCK, SWF_TAG_CODE_SOUND_STREAM_HEAD,
 SWF_TAG_CODE_START_SOUND, SWF_TAG_CODE_SYMBOL_CLASS,
 SWF_TAG_CODE_DEFINE_BINARY_DATA, SWF_TAG_CODE_EXPORT_ASSETS */

var $RELEASE = false;
var isWorker = typeof window === 'undefined';

if (isWorker && !$RELEASE) {
  importScripts.apply(null, [
    // TODO: drop DataView, probably
    '../../lib/DataView.js/DataView.js',
    '../flash/util.js',
    'config.js',
    'swf.js',
    'types.js',
    'structs.js',
    'tags.js',
    'inflate.js',
    'stream.js',
    'templates.js',
    'generator.js',
    'handlers.js',
    'parser.js',
    'bitmap.js',
    'button.js',
    'font.js',
    'image.js',
    'label.js',
    'shape.js',
    'sound.js',
    'text.js'
  ]);
}


function defineSymbol(swfTag, symbols) {
  var symbol;

  switch (swfTag.code) {
    case SWF_TAG_CODE_DEFINE_BITS:
    case SWF_TAG_CODE_DEFINE_BITS_JPEG2:
    case SWF_TAG_CODE_DEFINE_BITS_JPEG3:
    case SWF_TAG_CODE_DEFINE_BITS_JPEG4:
    case SWF_TAG_CODE_JPEG_TABLES:
      symbol = defineImage(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_BITS_LOSSLESS:
    case SWF_TAG_CODE_DEFINE_BITS_LOSSLESS2:
      symbol = defineBitmap(swfTag);
      break;
    case SWF_TAG_CODE_DEFINE_BUTTON:
    case SWF_TAG_CODE_DEFINE_BUTTON2:
      symbol = defineButton(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_EDIT_TEXT:
      symbol = defineText(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_FONT:
    case SWF_TAG_CODE_DEFINE_FONT2:
    case SWF_TAG_CODE_DEFINE_FONT3:
    case SWF_TAG_CODE_DEFINE_FONT4:
      symbol = defineFont(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_MORPH_SHAPE:
    case SWF_TAG_CODE_DEFINE_MORPH_SHAPE2:
    case SWF_TAG_CODE_DEFINE_SHAPE:
    case SWF_TAG_CODE_DEFINE_SHAPE2:
    case SWF_TAG_CODE_DEFINE_SHAPE3:
    case SWF_TAG_CODE_DEFINE_SHAPE4:
      symbol = defineShape(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_SOUND:
      symbol = defineSound(swfTag, symbols);
      break;
    case SWF_TAG_CODE_DEFINE_BINARY_DATA:
      symbol = {
        type: 'binary',
        id: swfTag.id,
        // TODO: make transferable
        data: swfTag.data
      };
      break;
    case SWF_TAG_CODE_DEFINE_SPRITE:
      var depths = { };
      var frame = { type: 'frame' };
      var frames = [];
      var tags = swfTag.tags;
      var frameScripts = null;
      var frameIndex = 0;
      var soundStream = null;
      for (var i = 0, n = tags.length; i < n; i++) {
        var tag = tags[i];
        switch (tag.code) {
          case SWF_TAG_CODE_DO_ACTION:
            if (!frameScripts)
              frameScripts = [];
            frameScripts.push(frameIndex);
            frameScripts.push(tag.actionsData);
            break;
          // case SWF_TAG_CODE_DO_INIT_ACTION: ??
          case SWF_TAG_CODE_START_SOUND:
            var startSounds = frame.startSounds || (frame.startSounds = []);
            startSounds.push(tag);
            break;
          case SWF_TAG_CODE_SOUND_STREAM_HEAD:
            try {
              // TODO: make transferable
              soundStream = createSoundStream(tag);
              frame.soundStream = soundStream.info;
            } catch (e) {
              // ignoring if sound stream codec is not supported
              // console.error('ERROR: ' + e.message);
            }
            break;
          case SWF_TAG_CODE_SOUND_STREAM_BLOCK:
            if (soundStream) {
              frame.soundStreamBlock = soundStream.decode(tag.data);
            }
            break;
          case SWF_TAG_CODE_FRAME_LABEL:
            frame.labelName = tag.name;
            break;
          case SWF_TAG_CODE_PLACE_OBJECT:
          case SWF_TAG_CODE_PLACE_OBJECT2:
          case SWF_TAG_CODE_PLACE_OBJECT3:
            depths[tag.depth] = tag;
            break;
          case SWF_TAG_CODE_REMOVE_OBJECT:
          case SWF_TAG_CODE_REMOVE_OBJECT2:
            depths[tag.depth] = null;
            break;
          case SWF_TAG_CODE_SHOW_FRAME:
            frameIndex += tag.repeat;
            frame.repeat = tag.repeat;
            frame.depths = depths;
            frames.push(frame);
            depths = { };
            frame = { type: 'frame' };
            break;
        }
      }
      symbol = {
        type: 'sprite',
        id: swfTag.id,
        frameCount: swfTag.frameCount,
        frames: frames,
        frameScripts: frameScripts
      };
      break;
    case SWF_TAG_CODE_DEFINE_TEXT:
    case SWF_TAG_CODE_DEFINE_TEXT2:
      symbol = defineLabel(swfTag, symbols);
      break;
  }

  if (!symbol) {
    return {command: 'error', message: 'unknown symbol type: ' + swfTag.code};
  }

  symbol.isSymbol = true;
  symbols[swfTag.id] = symbol;
  return symbol;
}
function createParsingContext(commitData) {
  var depths = {};
  var symbols = {};
  var frame = { type: 'frame' };
  var tagsProcessed = 0;
  var soundStream = null;
  var lastProgressSent = 0;

  return {
    onstart: function(result) {
      commitData({command: 'init', result: result});
    },
    onprogress: function(result) {
      if (Date.now() - lastProgressSent > 1000 / 24 ||
          result.bytesLoaded === result.bytesTotal) {
        commitData({command: 'progress', result: {
          bytesLoaded: result.bytesLoaded,
          bytesTotal: result.bytesTotal
        }});
        lastProgressSent = Date.now();
      }

      var tags = result.tags;
      for (var n = tags.length; tagsProcessed < n; tagsProcessed++) {
        var tag = tags[tagsProcessed];
        if ('id' in tag) {
          var symbol = defineSymbol(tag, symbols);
          commitData(symbol, symbol.transferables);
          continue;
        }

        switch (tag.code) {
          case SWF_TAG_CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA:
            frame.sceneData = tag;
            break;
          case SWF_TAG_CODE_DEFINE_SCALING_GRID:
            var symbolUpdate = {
              isSymbol: true,
              id: tag.symbolId,
              updates: {
                scale9Grid: tag.splitter
              }
            };
            commitData(symbolUpdate);
            break;
          case SWF_TAG_CODE_DO_ABC:
          case SWF_TAG_CODE_DO_ABC_:
            var abcBlocks = frame.abcBlocks;
            if (abcBlocks)
              abcBlocks.push({data: tag.data, flags: tag.flags});
            else
              frame.abcBlocks = [{data: tag.data, flags: tag.flags}];
            break;
          case SWF_TAG_CODE_DO_ACTION:
            var actionBlocks = frame.actionBlocks;
            if (actionBlocks)
              actionBlocks.push(tag.actionsData);
            else
              frame.actionBlocks = [tag.actionsData];
            break;
          case SWF_TAG_CODE_DO_INIT_ACTION:
            var initActionBlocks = frame.initActionBlocks ||
                                   (frame.initActionBlocks = []);
            initActionBlocks.push({spriteId: tag.spriteId, actionsData: tag.actionsData});
            break;
          case SWF_TAG_CODE_START_SOUND:
            var startSounds = frame.startSounds;
            if (!startSounds)
              frame.startSounds = startSounds = [];
            startSounds.push(tag);
            break;
          case SWF_TAG_CODE_SOUND_STREAM_HEAD:
            try {
              // TODO: make transferable
              soundStream = createSoundStream(tag);
              frame.soundStream = soundStream.info;
            } catch (e) {
              // ignoring if sound stream codec is not supported
              // console.error('ERROR: ' + e.message);
            }
            break;
          case SWF_TAG_CODE_SOUND_STREAM_BLOCK:
            if (soundStream) {
              frame.soundStreamBlock = soundStream.decode(tag.data);
            }
            break;
          case SWF_TAG_CODE_EXPORT_ASSETS:
            var exports = frame.exports;
            if (exports)
              frame.exports = exports.concat(tag.exports);
            else
              frame.exports = tag.exports.slice(0);
            break;
          case SWF_TAG_CODE_SYMBOL_CLASS:
            var symbolClasses = frame.symbolClasses;
            if (symbolClasses)
              frame.symbolClasses = symbolClasses.concat(tag.exports);
            else
              frame.symbolClasses = tag.exports.slice(0);
            break;
          case SWF_TAG_CODE_FRAME_LABEL:
            frame.labelName = tag.name;
            break;
          case SWF_TAG_CODE_PLACE_OBJECT:
          case SWF_TAG_CODE_PLACE_OBJECT2:
          case SWF_TAG_CODE_PLACE_OBJECT3:
            depths[tag.depth] = tag;
            break;
          case SWF_TAG_CODE_REMOVE_OBJECT:
          case SWF_TAG_CODE_REMOVE_OBJECT2:
            depths[tag.depth] = null;
            break;
          case SWF_TAG_CODE_SET_BACKGROUND_COLOR:
            frame.bgcolor = tag.color;
            break;
          case SWF_TAG_CODE_SHOW_FRAME:
            frame.repeat = tag.repeat;
            frame.depths = depths;
            frame.complete = tag.eot;
            commitData(frame);
            depths = { };
            frame = { type: 'frame' };
            break;
        }
      }
    },
    oncomplete: function(result) {
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
    }
  };
}
function parseBytes(bytes, commitData) {
  SWF.parse(bytes, createParsingContext(commitData));
}

function ResourceLoader(scope) {
  this.subscription = null;

  var self = this;
  if (!isWorker) {
    this.messenger = {
      postMessage : function(data) {
        self.onmessage({data:data});
      }
    };
  } else {
    this.messenger = scope;
    scope.onmessage = function(event) {
      self.listener(event.data);
    };
  }
}

ResourceLoader.prototype = {
  terminate: function() {
    this.messenger = null;
    this.listener = null;
  },
  onmessage: function(event) {
    this.listener(event.data);
  },
  postMessage: function(data) {
    this.listener && this.listener(data);
  },
  listener: function(data) {
    if (this.subscription) {
      this.subscription.callback(data.data, data.progress);
    } else if (data === 'pipe:') {
      // progressive data loading is requested, replacing onmessage handler
      // for the following messages
      this.subscription = {
        subscribe: function(callback) {
          this.callback = callback;
        }
      };
      this.parseLoadedData(this.messenger, this.subscription);
    } else {
      this.parseLoadedData(this.messenger, data);
    }
  },

  parseLoadedData: function(loader, request, context) {
    function commitData(data, transferables) {
      try {
        loader.postMessage(data, transferables);
      } catch (ex) {
        // Attempting to fix IE10/IE11 transferables by retrying without
        // Transerables.
        if (ex != 'DataCloneError') {
          throw ex;
        }
        loader.postMessage(data);
      }
    }

    if (request instanceof ArrayBuffer) {
      parseBytes(request, commitData);
    } else if ('subscribe' in request) {
      var pipe = SWF.parseAsync(createParsingContext(commitData));
      request.subscribe(function (data, progress) {
        if (data) {
          pipe.push(data, progress);
        } else {
          pipe.close();
        }
      });
    } else if (typeof FileReaderSync !== 'undefined') {
      var reader = new FileReaderSync();
      var buffer = reader.readAsArrayBuffer(request);
      parseBytes(buffer, commitData);
    } else {
      var reader = new FileReader();
      reader.onload = function () {
        parseBytes(this.result, commitData);
      };
      reader.readAsArrayBuffer(request);
    }
  }
};

if (isWorker) {
  var loader = new ResourceLoader(this);
}
