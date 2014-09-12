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
module Shumway.SWF.Parser {
  import Inflate = Shumway.ArrayUtilities.Inflate;
  import SwfTag = Shumway.SWF.Parser.SwfTag;

  function readTags(context, stream, swfVersion, final, onprogress, onexception): boolean {
    function rollback(): boolean {
      // recovering the stream state
      stream.pos = lastSuccessfulPosition;
      context._readTag = tag;
      return false;
    }

    var tags = context.tags;
    var bytes = stream.bytes;
    var lastSuccessfulPosition;

    var tag: ISwfTagData = null;
    if (context._readTag) {
      tag = context._readTag;
      context._readTag = null;
    }

    try {
      while (stream.pos < stream.end) {
        // this loop can be interrupted at any moment by `return rollback();`
        // saving last data/position for the rollback method.
        lastSuccessfulPosition = stream.pos;

        if (stream.pos + 2 > stream.end) {
          return rollback();
        }

        var tagCodeAndLength = readUi16(bytes, stream);
        if (!tagCodeAndLength) {
          // end of tags
          final = true;
          break;
        }

        var tagCode = tagCodeAndLength >> 6;
        var length = tagCodeAndLength & 0x3f;
        if (length === 0x3f) {
          if (stream.pos + 4 > stream.end) {
            return rollback();
          }

          length = readUi32(bytes, stream);
        }

        if (tag) {
          if (tagCode === 1 && tag.code === 1) {
            // counting ShowFrame
            tag.repeat++;
            stream.pos += length;
            continue;
          }
          tags.push(tag);
          if (onprogress && tag.id !== undefined) {
            context.bytesLoaded = (context.bytesTotal * stream.pos / stream.end) | 0;
            onprogress(context);
          }
          tag = null;
        }

        if (stream.pos + length > stream.end) {
          return rollback();
        }

        var substream = stream.substream(stream.pos, stream.pos += length);
        var subbytes = substream.bytes;
        var nextTag: ISwfTagData = { code: tagCode };

        if (tagCode === SwfTag.CODE_DEFINE_SPRITE) {
          nextTag.type = 'sprite';
          nextTag.id = readUi16(subbytes, substream);
          nextTag.frameCount = readUi16(subbytes, substream);
          var controlTags = nextTag.tags = [];
          var isEnoughData = readTags(nextTag, substream, swfVersion, true, null, null);
          if (!isEnoughData) {
            Debug.error('Invalid SWF tag structure');
          }
          // Even though invalid according to the SWF spec, some files have nested definition tags.
          // We handle this case by adding all non-control tags of a sprite to the main-timeline's tag list.
          for (var i = 0; i < controlTags.length; i++) {
            switch (controlTags[i].code) {
              case SwfTag.CODE_SHOW_FRAME:
              case SwfTag.CODE_START_SOUND:
              case SwfTag.CODE_PLACE_OBJECT:
              case SwfTag.CODE_FRAME_LABEL:
              case SwfTag.CODE_PLACE_OBJECT2:
              case SwfTag.CODE_SOUND_STREAM_HEAD:
              case SwfTag.CODE_REMOVE_OBJECT:
              case SwfTag.CODE_SOUND_STREAM_HEAD2:
              case SwfTag.CODE_REMOVE_OBJECT2:
              case SwfTag.CODE_SOUND_STREAM_BLOCK:
              case SwfTag.CODE_DO_ACTION:
              case SwfTag.CODE_DO_INIT_ACTION:
              case SwfTag.CODE_END:
                continue;
            }
            tags.push(controlTags.splice(i, 1)[0]);
          }
        } else if (tagCode === 1) {
          nextTag.repeat = 1;
        } else {
          var handler = tagHandler[tagCode];
          if (handler) {
            handler(subbytes, substream, nextTag, swfVersion, tagCode);
          }
        }

        tag = nextTag;
      }
      if ((tag && final) || (stream.pos >= stream.end)) {
        if (tag) {
          tag.finalTag = true; // note: 'eot' is reserved by handlers
          tags.push(tag);
        }
        if (onprogress) {
          context.bytesLoaded = context.bytesTotal;
          onprogress(context);
        }
      } else {
        context._readTag = tag;
      }
    } catch (e) {
      onexception && onexception(e);
      throw e;
    }
    return true;
  }

  class HeadTailBuffer {
    private _bufferSize: number;
    private _buffer: Uint8Array;
    private _pos: number;

    constructor(defaultSize:number = 16) {
      this._bufferSize = defaultSize;
      this._buffer = new Uint8Array(this._bufferSize);
      this._pos = 0;
    }

    push(data: Uint8Array, need?: number) {
      var bufferLengthNeed = this._pos + data.length;
      if (this._bufferSize < bufferLengthNeed) {
        var newBufferSize = this._bufferSize;
        while (newBufferSize < bufferLengthNeed) {
          newBufferSize <<= 1;
        }
        var newBuffer = new Uint8Array(newBufferSize);
        if (this._bufferSize > 0) {
          newBuffer.set(this._buffer);
        }
        this._buffer = newBuffer;
        this._bufferSize = newBufferSize;
      }
      this._buffer.set(data, this._pos);
      this._pos += data.length;
      if (need) {
        return this._pos >= need;
      }
    }

    getHead(size: number) {
      return this._buffer.subarray(0, size);
    }

    getTail(offset: number) {
      return this._buffer.subarray(offset, this._pos);
    }

    removeHead(size: number) {
      var tail = this.getTail(size);
      this._buffer = new Uint8Array(this._bufferSize);
      this._buffer.set(tail);
      this._pos = tail.length;
    }

    get arrayBuffer() {
      return this._buffer.buffer;
    }

    get length() {
      return this._pos;
    }

    getBytes(): Uint8Array {
      return this._buffer.subarray(0, this._pos);
    }

    createStream() {
      return new Stream(this.arrayBuffer, 0, this.length);
    }
  }

  export interface ProgressInfo {
    bytesLoaded: number;
    bytesTotal: number;
  }

  export interface IPipe {
    push(data: Uint8Array, progressInfo: ProgressInfo);
    close();
  }

  class CompressedPipe implements IPipe {
    private _inflate: Inflate;
    private _progressInfo: ProgressInfo;

    constructor (target) {
      this._inflate = new Inflate(true);
      this._inflate.onData = function (data: Uint8Array) {
        target.push(data, this._progressInfo);
      }.bind(this);
    }

    push(data: Uint8Array, progressInfo: ProgressInfo) {
      this._progressInfo = progressInfo;
      this._inflate.push(data);
    }

    close() {
      this._inflate = null;
    }
  }

  interface SwfInfo {
    swfVersion: number;
    parseTime: number;
    bytesLoaded: number;
    bytesTotal: number;
    fileAttributes: any;
    tags: any[]
  }

  class BodyParser implements IPipe {
    swf: SwfInfo;

    _buffer: HeadTailBuffer;
    _initialize: boolean;
    _totalRead: number;
    _length: number;
    _options: any;

    constructor(swfVersion: number, length: number, options: any) {
      this.swf = {
        swfVersion: swfVersion,
        parseTime: 0,
        bytesLoaded: undefined,
        bytesTotal: undefined,
        fileAttributes: undefined,
        tags: undefined
      };
      this._buffer = new HeadTailBuffer(32768);
      this._initialize = true;
      this._totalRead = 0;
      this._length = length;
      this._options = options;
    }

    push(data: Uint8Array, progressInfo: ProgressInfo) {
      if (data.length === 0) {
        return;
      }

      var swf = this.swf;
      var swfVersion = swf.swfVersion;
      var buffer = this._buffer;
      var options = this._options;
      var stream;

      var finalBlock = false;
      if (progressInfo) {
        swf.bytesLoaded = progressInfo.bytesLoaded;
        swf.bytesTotal = progressInfo.bytesTotal;
        finalBlock = progressInfo.bytesLoaded >= progressInfo.bytesTotal;
      }

      if (this._initialize) {
        var PREFETCH_SIZE = 17 /* RECT */ +
          4  /* Frames rate and count */ +
          6  /* FileAttributes */;
        if (!buffer.push(data, PREFETCH_SIZE))
          return;

        stream = buffer.createStream();
        var bytes = stream.bytes;
        readHeader(bytes, stream, swf, null, null);

        // reading FileAttributes tag, this tag shall be first in the file
        var nextTagHeader = readUi16(bytes, stream);
        var FILE_ATTRIBUTES_LENGTH = 4;
        if (nextTagHeader == ((SwfTag.CODE_FILE_ATTRIBUTES << 6) | FILE_ATTRIBUTES_LENGTH)) {
          if (stream.pos + FILE_ATTRIBUTES_LENGTH > stream.end) {
            Debug.error('Not enough data.');
          }

          var substream = stream.substream(stream.pos, stream.pos += FILE_ATTRIBUTES_LENGTH);
          var handler = tagHandler[SwfTag.CODE_FILE_ATTRIBUTES];
          var fileAttributesTag = {code: SwfTag.CODE_FILE_ATTRIBUTES};
          handler(substream.bytes, substream, fileAttributesTag, swfVersion, SwfTag.CODE_FILE_ATTRIBUTES);
          swf.fileAttributes = fileAttributesTag;
        } else {
          stream.pos -= 2; // FileAttributes tag was not found -- re-winding
          swf.fileAttributes = {}; // using empty object here, defaults all attributes to false
        }

        if (options.onstart)
          options.onstart(swf);

        swf.tags = [];

        this._initialize = false;
      } else {
        buffer.push(data);
        stream = buffer.createStream();
      }

      var readStartTime = performance.now();
      readTags(swf, stream, swfVersion, finalBlock, options.onprogress, options.onexception);
      swf.parseTime += performance.now() - readStartTime;

      var read = stream.pos;
      buffer.removeHead(read);
      this._totalRead += read;

      if (options.oncomplete && swf.tags[swf.tags.length - 1].finalTag) {
        options.oncomplete(swf);
      }
    }

    close() {}
  }

  export function parseAsync(options) {
    var buffer = new HeadTailBuffer();
    var target: IPipe = null;

    var pipe: IPipe = {
      push: function (data: Uint8Array, progressInfo: ProgressInfo) {
        if (target !== null) {
          return target.push(data, progressInfo);
        }
        if (!buffer.push(data, 8)) {
          return null;
        }
        var bytes = buffer.getHead(8);
        var magic1 = bytes[0];
        var magic2 = bytes[1];
        var magic3 = bytes[2];

        // check for SWF
        if ((magic1 === 70 || magic1 === 67) && magic2 === 87 && magic3 === 83) {
          var swfVersion = bytes[3];
          var compressed = magic1 === 67;
          parseSWF(compressed, swfVersion, progressInfo);
          buffer = null;
          return;
        }

        var isImage = false;
        var imageType;

        // check for JPG
        if (magic1 === 0xff && magic2 === 0xd8 && magic3 === 0xff) {
          isImage = true;
          imageType = 'image/jpeg';
        } else if (magic1 === 0x89 && magic2 === 0x50 && magic3 === 0x4e) {
          isImage = true;
          imageType = 'image/png';
        }

        if (isImage) {
          parseImage(data, progressInfo.bytesTotal, imageType);
        }
        buffer = null;
      },
      close: function () {
        if (buffer) {
          // buffer was closed: none or few bytes were received
          var symbol = {
            command: 'empty',
            data: buffer.getBytes()
          };
          options.oncomplete && options.oncomplete(symbol);
        }
        if (target !== undefined && target.close) {
          target.close();
        }
      }
    };

    function parseSWF(compressed, swfVersion, progressInfo) {
      var stream = buffer.createStream();
      stream.pos += 4;
      var fileLength = readUi32(null, stream);
      var bodyLength = fileLength - 8;

      target = new BodyParser(swfVersion, bodyLength, options);
      if (compressed) {
        target = new CompressedPipe(target);
      }
      target.push(buffer.getTail(8), progressInfo);
    }

    function parseImage(data, bytesTotal, type) {
      var buffer = new Uint8Array(bytesTotal);
      buffer.set(data);
      var bufferPos = data.length;

      target = {
        push: function (data: Uint8Array, progressInfo: ProgressInfo) {
          buffer.set(data, bufferPos);
          bufferPos += data.length;
        },
        close: function () {
          var props: any = {};
          var chunks;
          if (type == 'image/jpeg') {
            chunks = parseJpegChunks(props, buffer);
          } else {
            parsePngHeaders(props, buffer);
            chunks = [buffer.subarray(0, bufferPos)];
          }
          var length = 0, pos = 0;
          chunks.forEach(function (chunk) {
            length += chunk.byteLength;
          });
          var data = new Uint8Array(length);
          chunks.forEach(function (chunk) {
            data.set(chunk, pos);
            pos += chunk.byteLength;
          });
          props.id = 0;
          props.data = data;
          props.mimeType = type;
          var symbol = {
            command: 'image',
            type: 'image',
            props: props
          };
          options.oncomplete && options.oncomplete(symbol);
        }
      };
    }

    return pipe;
  }

  export function parse(buffer, options = {}) {
    var pipe = parseAsync(options);
    var bytes = new Uint8Array(buffer);
    var progressInfo: ProgressInfo = { bytesLoaded: bytes.length, bytesTotal: bytes.length };
    pipe.push(bytes, progressInfo);
    pipe.close();
  }
}

