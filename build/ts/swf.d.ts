/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
declare module Shumway.SWF.Parser.LowLevel {
    function parseRgb(stream: any): number;
    function parseDefineImageTag(stream: Stream, swfVersion: number, tagCode: number, tagEnd: number, jpegTables: Uint8Array): ImageTag;
    function parseDefineFontTag(stream: Stream, swfVersion: number, tagCode: number): FontTag;
    function parseSoundStreamHeadTag(stream: Stream, tagEnd: number): SoundStreamHeadTag;
    function parseDefineBitmapTag(stream: Stream, swfVersion: number, tagCode: number, tagEnd: number): BitmapTag;
    function parseDefineFont2Tag(stream: Stream, swfVersion: number, tagCode: number, tagEnd: number): FontTag;
    function parseDefineFont4Tag(stream: Stream, swfVersion: number, tagCode: number, tagEnd: number): FontTag;
    function parseDefineSceneTag(stream: Stream, tagCode: number): SceneTag;
    var tagHandlers: any;
    function parseHeader(stream: Stream): {
        frameRate: number;
        frameCount: number;
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
    const enum BitmapFormat {
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
    function defineBitmap(tag: BitmapTag): {
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
    function defineButton(tag: ButtonTag, dictionary: any): any;
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
    function defineFont(tag: FontTag): {
        type: string;
        id: number;
        name: string;
        bold: boolean;
        italic: boolean;
        codes: any;
        metrics: any;
        data: Uint8Array;
        originalSize: boolean;
    };
}
declare module Shumway.SWF.Parser {
    /**
     * Parses JPEG chunks and reads image width and height information. JPEG data
     * in SWFs is encoded in chunks and not directly decodable by the JPEG parser.
     */
    function parseJpegChunks(bytes: Uint8Array, chunks: Uint8Array[]): void;
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
    interface JPEGTablesState {
        data: Uint8Array;
        parsedChunks?: Uint8Array[];
    }
    function defineImage(tag: ImageTag): ImageDefinition;
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
    function defineLabel(tag: StaticTextTag): {
        type: string;
        id: number;
        fillBounds: Bbox;
        matrix: Matrix;
        tag: {
            hasText: boolean;
            initialText: string;
            html: boolean;
            readonly: boolean;
        };
        records: TextRecord[];
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
    function defineShape(tag: ShapeTag): {
        type: string;
        id: number;
        fillBounds: Bbox;
        lineBounds: Bbox;
        morphFillBounds: Bbox;
        morphLineBounds: Bbox;
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
    function defineSound(tag: SoundTag): {
        type: string;
        id: number;
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
    function defineText(tag: TextTag): {
        type: string;
        id: number;
        fillBounds: Bbox;
        variableName: string;
        tag: TextTag;
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
declare module Shumway.SWF {
    var StreamNoDataError: {};
    class Stream {
        bytes: Uint8Array;
        view: DataView;
        pos: number;
        end: number;
        bitBuffer: number;
        bitLength: number;
        constructor(buffer: any, offset?: number, length?: number, maxLength?: number);
        align(): void;
        ensure(size: number): void;
        remaining(): number;
        substream(begin: number, end: number): Stream;
        push(data: any): void;
        readSi8(): number;
        readSi16(): number;
        readSi32(): number;
        readUi8(): number;
        readUi16(): number;
        readUi32(): number;
        readFixed(): number;
        readFixed8(): number;
        readFloat16(): number;
        readFloat(): number;
        readDouble(): number;
        readEncodedU32(): number;
        readBool(): boolean;
        readSb(size: number): number;
        readUb(size: number): number;
        readFb(size: number): number;
        readString(length: number): string;
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
    const enum CompressionMethod {
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
        actionBlocks: ActionBlock[];
        initActionBlocks: InitActionBlock[];
        exports: SymbolExport[];
        constructor(controlTags?: UnparsedTag[], labelName?: string, soundStreamHead?: Parser.SoundStream, soundStreamBlock?: Uint8Array, actionBlocks?: ActionBlock[], initActionBlocks?: InitActionBlock[], exports?: SymbolExport[]);
    }
    class ABCBlock {
        name: string;
        flags: number;
        data: Uint8Array;
    }
    class ActionBlock {
        actionsData: Uint8Array;
        precedence: number;
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
