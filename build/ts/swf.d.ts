/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
declare module Shumway.SWF.Parser {
    function readSi8($bytes: any, $stream: any): any;
    function readSi16($bytes: any, $stream: any): any;
    function readSi32($bytes: any, $stream: any): any;
    function readUi8($bytes: any, $stream: any): any;
    function readUi16($bytes: any, $stream: any): any;
    function readUi32($bytes: any, $stream: any): any;
    function readFixed($bytes: any, $stream: any): number;
    function readFixed8($bytes: any, $stream: any): number;
    function readFloat16($bytes: any, $stream: any): number;
    function readFloat($bytes: any, $stream: any): any;
    function readDouble($bytes: any, $stream: any): any;
    function readEncodedU32($bytes: any, $stream: any): any;
    function readBool($bytes: any, $stream: any): boolean;
    function align($bytes: any, $stream: any): void;
    function readSb($bytes: any, $stream: any, size: any): number;
    function readUb($bytes: any, $stream: any, size: any): number;
    function readFb($bytes: any, $stream: any, size: any): number;
    function readString($bytes: any, $stream: any, length: any): string;
}
declare module Shumway.SWF.Parser.LowLevel {
    function defineImage($bytes: Uint8Array, $stream: Stream, $: any, swfVersion: any, tagCode: number, tagEnd: number, jpegTables: Uint8Array): any;
    function defineFont($bytes: any, $stream: any, $: any, swfVersion: any, tagCode: any): any;
    function soundStreamHead($bytes: any, $stream: any, tagEnd: number): any;
    function defineBitmap(bytes: any, stream: any, $: any, swfVersion: any, tagCode: number, tagEnd: number): any;
    function defineFont2($bytes: any, $stream: any, $: any, swfVersion: any, tagCode: any, tagEnd: any): any;
    function defineFont4($bytes: any, $stream: any, $: any, swfVersion: any, tagCode: any, tagEnd: any): any;
    function defineScene($bytes: any, $stream: any, $: any): any;
    function rgb($bytes: any, $stream: any): number;
    var tagHandlers: any;
    function readHeader($bytes: any, $stream: any): {
        frameRate: any;
        frameCount: any;
        bounds: Bounds;
    };
}
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
declare module Shumway.SWF.Parser {
    enum BitmapFormat {
        /**
         * 8-bit color mapped image.
         */
        FORMAT_COLORMAPPED = 3,
        /**
         * 15-bit RGB image.
         */
        FORMAT_15BPP = 4,
        /**
         * 24-bit RGB image, however stored as 4 byte value 0x00RRGGBB.
         */
        FORMAT_24BPP = 5,
    }
    function defineBitmap(tag: any): {
        definition: ImageDefinition;
        type: string;
    };
}
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
declare module Shumway.SWF.Parser {
    function defineButton(tag: any, dictionary: any): any;
}
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
declare module Shumway.SWF.Parser {
    function defineFont(tag: any): {
        type: string;
        id: any;
        name: any;
        bold: boolean;
        italic: boolean;
        codes: any;
        metrics: any;
        data: any;
        originalSize: boolean;
    };
}
declare module Shumway.SWF.Parser {
    /**
     * Parses JPEG chunks and reads image width and height information. JPEG data
     * in SWFs is encoded in chunks and not directly decodable by the JPEG parser.
     */
    function parseJpegChunks(image: any, bytes: Uint8Array, chunks: Uint8Array[]): Uint8Array[];
    /**
     * Extracts PNG width and height information.
     */
    function parsePngHeaders(image: any, bytes: Uint8Array): void;
    interface ImageDefinition {
        type: string;
        id: number;
        width: number;
        height: number;
        mimeType: string;
        data: Uint8Array;
        dataType?: ImageType;
        image: any;
    }
    interface DefineImageTag {
        id: number;
        imgData: Uint8Array;
        mimeType: string;
        alphaData: boolean;
        jpegTables: Uint8Array;
    }
    function defineImage(tag: DefineImageTag): ImageDefinition;
}
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
declare module Shumway.SWF.Parser {
    function defineLabel(tag: any): {
        type: string;
        id: any;
        fillBounds: any;
        matrix: any;
        tag: {
            hasText: boolean;
            initialText: string;
            html: boolean;
            readonly: boolean;
        };
        records: any;
        coords: any;
        static: boolean;
        require: any;
    };
}
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
declare module Shumway.SWF.Parser {
    function defineShape(tag: any): {
        type: string;
        id: any;
        fillBounds: any;
        lineBounds: any;
        morphFillBounds: any;
        morphLineBounds: any;
        shape: PlainObjectShapeData;
        transferables: ArrayBuffer[];
        require: any[];
    };
}
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
declare module Shumway.SWF.Parser {
    function defineSound(tag: any): {
        type: string;
        id: any;
        sampleRate: number;
        channels: number;
        pcm: any;
        packaged: any;
    };
    interface DecodedSound {
        streamId: number;
        samplesCount: number;
        pcm?: Float32Array;
        data?: Uint8Array;
        seek?: number;
    }
    class SoundStream {
        streamId: number;
        samplesCount: number;
        sampleRate: number;
        channels: number;
        format: any;
        currentSample: number;
        decode: (block: Uint8Array) => DecodedSound;
        constructor(samplesCount: any, sampleRate: any, channels: any);
        static FromTag(tag: any): SoundStream;
    }
}
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
declare module Shumway.SWF.Parser {
    function defineText(tag: any): {
        type: string;
        id: any;
        fillBounds: any;
        variableName: any;
        tag: any;
        bold: boolean;
        italic: boolean;
    };
}
declare module Shumway.SWF {
    var timelineBuffer: Tools.Profiler.TimelineBuffer;
    function enterTimeline(name: string, data?: any): void;
    function leaveTimeline(data?: any): void;
}
declare module Shumway.SWF {
    var parserOptions: any;
    var traceLevel: any;
}
declare module Shumway.JPEG {
    class JpegImage {
        width: number;
        height: number;
        jfif: {
            version: {
                major: number;
                minor: number;
            };
            densityUnits: number;
            xDensity: number;
            yDensity: number;
            thumbWidth: number;
            thumbHeight: number;
            thumbData: Uint8Array;
        };
        adobe: {
            version: number;
            flags0: number;
            flags1: number;
            transformCode: number;
        };
        components: any;
        numComponents: number;
        decodeTransform: boolean;
        colorTransform: boolean;
        parse(data: any): void;
        _getLinearizedBlockData(width: number, height: number): Uint8Array;
        _isColorConversionNeeded(): boolean;
        _convertYccToRgb(data: Uint8Array): Uint8Array;
        _convertYcckToRgb(data: Uint8Array): Uint8Array;
        _convertYcckToCmyk(data: Uint8Array): Uint8Array;
        _convertCmykToRgb(data: Uint8Array): Uint8Array;
        getData(width: number, height: number, forceRGBoutput: boolean): Uint8Array;
        copyToImageData(imageData: ImageData): void;
    }
}
declare module Shumway.SWF {
    var StreamNoDataError: {};
    class Stream {
        bytes: Uint8Array;
        pos: number;
        end: number;
        bitBuffer: number;
        bitLength: number;
        align: () => void;
        ensure: (size: number) => void;
        remaining: () => number;
        substream: (begin: number, end: number) => Stream;
        push: (data) => void;
        getUint16: (offset: number, le: boolean) => number;
        constructor(buffer: any, offset?: number, length?: number, maxLength?: number);
    }
}
declare module Shumway.SWF {
    var MP3WORKER_PATH: string;
    class MP3DecoderSession {
        private _sessionId;
        private _onworkermessageBound;
        private _worker;
        onframedata: (frameData: Uint8Array, channels: number, sampleRate: number, bitRate: number) => void;
        onid3tag: (tagData: any) => void;
        onclosed: () => void;
        onerror: (error: string) => void;
        constructor();
        private onworkermessage(e);
        pushAsync(data: any): void;
        close(): void;
        static processAll(data: Uint8Array): Promise<{
            data: Uint8Array;
            id3Tags: any;
        }>;
    }
}
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
declare module Shumway.SWF {
    import Parser = Shumway.SWF.Parser;
    enum CompressionMethod {
        None = 0,
        Deflate = 1,
        LZMA = 2,
    }
    class SWFFile {
        compression: CompressionMethod;
        swfVersion: number;
        useAVM1: boolean;
        backgroundColor: number;
        bounds: Bounds;
        frameRate: number;
        frameCount: number;
        attributes: any;
        sceneAndFrameLabelData: any;
        bytesLoaded: number;
        bytesTotal: number;
        pendingUpdateDelays: number;
        framesLoaded: number;
        frames: SWFFrame[];
        abcBlocks: ABCBlock[];
        dictionary: DictionaryEntry[];
        fonts: {
            name: string;
            style: string;
            id: number;
        }[];
        data: Uint8Array;
        env: any;
        symbolClassesMap: string[];
        symbolClassesList: {
            id: number;
            className: string;
        }[];
        eagerlyParsedSymbolsMap: EagerlyParsedDictionaryEntry[];
        eagerlyParsedSymbolsList: EagerlyParsedDictionaryEntry[];
        private _uncompressedLength;
        private _uncompressedLoadedLength;
        private _dataView;
        private _dataStream;
        private _decompressor;
        private _jpegTables;
        private _endTagEncountered;
        private _loadStarted;
        private _lastScanPosition;
        private _currentFrameLabel;
        private _currentSoundStreamHead;
        private _currentSoundStreamBlock;
        private _currentControlTags;
        private _currentActionBlocks;
        private _currentInitActionBlocks;
        private _currentExports;
        constructor(initialBytes: Uint8Array, length: number, env: any);
        appendLoadedData(bytes: Uint8Array): void;
        finishLoading(): void;
        getSymbol(id: number): any;
        getParsedTag(unparsed: UnparsedTag): any;
        private readHeaderAndInitialize(initialBytes);
        private parseHeaderContents();
        private processFirstBatchOfDecompressedData(data);
        private processDecompressedData(data);
        private scanLoadedData();
        private scanTagsToOffset(endOffset, rootTimelineMode);
        /**
         * Parses tag header information at the current seek offset and stores it in the given object.
         *
         * Public so it can be used by tools to parse through entire SWFs.
         */
        parseNextTagHeader(target: UnparsedTag): boolean;
        private scanTag(tag, rootTimelineMode);
        parseSpriteTimeline(spriteTag: DictionaryEntry): any;
        private jumpToNextTag(currentTagLength);
        private emitTagSlopWarning(tag, tagEnd);
        private finishFrame();
        private setFileAttributes(tagLength);
        private setSceneAndFrameLabelData(tagLength);
        private addControlTag(tagCode, byteOffset, tagLength);
        private addLazySymbol(tagCode, byteOffset, tagLength);
        private decodeEmbeddedFont(unparsed);
        private registerEmbeddedFont(unparsed);
        private decodeEmbeddedImage(unparsed);
    }
    class SWFFrame {
        controlTags: UnparsedTag[];
        labelName: string;
        soundStreamHead: Parser.SoundStream;
        soundStreamBlock: Uint8Array;
        actionBlocks: Uint8Array[];
        initActionBlocks: InitActionBlock[];
        exports: SymbolExport[];
        constructor(controlTags?: UnparsedTag[], labelName?: string, soundStreamHead?: Parser.SoundStream, soundStreamBlock?: Uint8Array, actionBlocks?: Uint8Array[], initActionBlocks?: InitActionBlock[], exports?: SymbolExport[]);
    }
    class ABCBlock {
        name: string;
        flags: number;
        data: Uint8Array;
    }
    class InitActionBlock {
        spriteId: number;
        actionsData: Uint8Array;
    }
    class SymbolExport {
        symbolId: number;
        className: string;
        constructor(symbolId: number, className: string);
    }
    class UnparsedTag {
        tagCode: number;
        byteOffset: number;
        byteLength: number;
        constructor(tagCode: number, byteOffset: number, byteLength: number);
    }
    class DictionaryEntry extends UnparsedTag {
        id: number;
        constructor(id: number, tagCode: number, byteOffset: number, byteLength: number);
    }
    class EagerlyParsedDictionaryEntry extends DictionaryEntry {
        type: string;
        definition: Object;
        env: any;
        ready: boolean;
        constructor(id: number, unparsed: UnparsedTag, type: string, definition: any, env: any);
    }
    interface DisplayListTag {
        depth: number;
    }
    interface PlaceObjectTag extends DisplayListTag {
        flags: number;
        symbolId?: number;
        matrix?: any;
        cxform?: any;
        ratio?: number;
        name?: string;
        clipDepth?: number;
        filters?: any[];
        blendMode?: number;
        bmpCache?: number;
        visibility?: number;
    }
}
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
declare module Shumway {
    class ImageFile {
        env: any;
        data: Uint8Array;
        bytesLoaded: number;
        image: any;
        mimeType: string;
        type: number;
        width: number;
        height: number;
        constructor(header: Uint8Array, fileLength: number, env: any);
        bytesTotal: number;
        appendLoadedData(data: Uint8Array): void;
        private setMimetype();
    }
}
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
declare module Shumway {
    class LoadProgressUpdate {
        bytesLoaded: number;
        framesLoaded: number;
        constructor(bytesLoaded: number, framesLoaded: number);
    }
    interface ILoadListener {
        onLoadOpen: (any) => void;
        onLoadProgress: (update: LoadProgressUpdate) => void;
        onNewEagerlyParsedSymbols: (symbols: SWF.EagerlyParsedDictionaryEntry[], delta: number) => Promise<any>;
        onImageBytesLoaded: () => void;
        onLoadComplete: () => void;
        onLoadError: () => void;
    }
    class FileLoader {
        _url: string;
        _file: any;
        private _listener;
        private _env;
        private _loadingServiceSession;
        private _delayedUpdatesPromise;
        private _lastDelayedUpdate;
        private _bytesLoaded;
        private _queuedInitialData;
        constructor(listener: ILoadListener, env: any);
        loadFile(request: any): void;
        abortLoad(): void;
        loadBytes(bytes: Uint8Array): void;
        processLoadOpen(): void;
        processNewData(data: Uint8Array, progressInfo: {
            bytesLoaded: number;
            bytesTotal: number;
        }): void;
        processError(error: any): void;
        processLoadClose(): void;
        private processSWFFileUpdate(file, previousEagerlyParsedSymbolsCount, previousFramesLoaded);
    }
}
