/// <reference path="avm2.d.ts" />
/// <reference path="swf.d.ts" />
/// <reference path="../../src/flash/avm1.d.ts" />
declare module Shumway.Player {
    import flash = Shumway.AVMX.AS.flash;
    import IBitmapDataSerializer = flash.display.IBitmapDataSerializer;
    import IAssetResolver = Timeline.IAssetResolver;
    import IFSCommandListener = flash.system.IFSCommandListener;
    import IVideoElementService = flash.net.IVideoElementService;
    import IRootElementService = flash.display.IRootElementService;
    import ICrossDomainSWFLoadingWhitelist = flash.system.ICrossDomainSWFLoadingWhitelist;
    interface SWFPlayer extends IBitmapDataSerializer, IFSCommandListener, IVideoElementService, IAssetResolver, IRootElementService, ICrossDomainSWFLoadingWhitelist {
        syncDisplayObject(displayObject: flash.display.DisplayObject, async: boolean): any;
        requestRendering(): any;
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
    interface HTMLParserHandler {
        comment?: (text: string) => void;
        chars?: (text: string) => void;
        start?: (tag: string, attrs: any, unary: boolean) => void;
        end?: (tag: string) => void;
    }
    function HTMLParser(html: string, handler: HTMLParserHandler): void;
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
    import Bounds = Shumway.Bounds;
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    import flash = Shumway.AVMX.AS.flash;
    const enum TextContentFlags {
        None = 0,
        DirtyBounds = 1,
        DirtyContent = 2,
        DirtyStyle = 4,
        DirtyFlow = 8,
        Dirty = 15,
    }
    class TextContent implements Shumway.Remoting.IRemotable {
        _id: number;
        sec: ISecurityDomain;
        private _bounds;
        private _plainText;
        private _backgroundColor;
        private _borderColor;
        private _autoSize;
        private _wordWrap;
        private _scrollV;
        private _scrollH;
        flags: number;
        defaultTextFormat: flash.text.TextFormat;
        textRuns: flash.text.TextRun[];
        textRunData: DataBuffer;
        matrix: flash.geom.Matrix;
        coords: number[];
        constructor(sec: ISecurityDomain, defaultTextFormat?: flash.text.TextFormat);
        parseHtml(htmlText: string, styleSheet: flash.text.StyleSheet, multiline: boolean): void;
        plainText: string;
        bounds: Bounds;
        autoSize: number;
        wordWrap: boolean;
        scrollV: number;
        scrollH: number;
        backgroundColor: number;
        borderColor: number;
        private _serializeTextRuns();
        private _writeTextRun(textRun);
        appendText(newText: string, format?: flash.text.TextFormat): void;
        prependText(newText: string, format?: flash.text.TextFormat): void;
        replaceText(beginIndex: number, endIndex: number, newText: string, format?: flash.text.TextFormat): void;
    }
}
declare module Shumway.AVMX.AS {
    var flashOptions: any;
    var traceEventsOption: any;
    var traceLoaderOption: any;
    var disableAudioOption: any;
    var webAudioOption: any;
    var webAudioMP3Option: any;
    var mediaSourceOption: any;
    var mediaSourceMP3Option: any;
    var flvOption: any;
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
declare module Shumway.Timeline {
    import Bounds = Shumway.Bounds;
    import flash = Shumway.AVMX.AS.flash;
    interface IAssetResolver {
        registerFont(symbol: Timeline.EagerlyResolvedSymbol, data: Uint8Array): void;
        registerImage(symbol: Timeline.EagerlyResolvedSymbol, imageType: ImageType, data: Uint8Array, alphaData: Uint8Array): void;
    }
    interface EagerlyResolvedSymbol {
        syncId: number;
        id: number;
        ready: boolean;
        resolveAssetPromise: PromiseWrapper<any>;
        resolveAssetCallback: (data: any) => void;
    }
    interface SymbolData {
        id: number;
        className: string;
        env: {
            app: AVMX.AXApplicationDomain;
        };
    }
    /**
     * TODO document
     */
    class Symbol {
        ready: boolean;
        resolveAssetPromise: PromiseWrapper<any>;
        data: any;
        isAVM1Object: boolean;
        avm1Context: Shumway.AVM1.AVM1Context;
        symbolClass: ASClass;
        constructor(data: SymbolData, symbolDefaultClass: ASClass);
        id: number;
    }
    class DisplaySymbol extends Symbol {
        fillBounds: Bounds;
        lineBounds: Bounds;
        scale9Grid: Bounds;
        dynamic: boolean;
        constructor(data: SymbolData, symbolClass: ASClass, dynamic: boolean);
        _setBoundsFromData(data: any): void;
    }
    class BinarySymbol extends Symbol {
        buffer: Uint8Array;
        byteLength: number;
        constructor(data: SymbolData, sec: ISecurityDomain);
        static FromData(data: any, loaderInfo: flash.display.LoaderInfo): BinarySymbol;
    }
    class SoundStart {
        soundId: number;
        soundInfo: any;
        constructor(soundId: number, soundInfo: any);
    }
}
declare module RtmpJs.Browser {
    class ShumwayComRtmpSocket {
        static isAvailable: boolean;
        private _socket;
        private _onopen;
        private _ondata;
        private _ondrain;
        private _onerror;
        private _onclose;
        constructor(host: string, port: number, params: any);
        onopen: () => void;
        ondata: (e: {
            data: ArrayBuffer;
        }) => void;
        ondrain: () => void;
        onerror: (e: any) => void;
        onclose: () => void;
        send(buffer: ArrayBuffer, offset: number, count: number): boolean;
        close(): void;
    }
    class ShumwayComRtmpXHR {
        static isAvailable: boolean;
        private _xhr;
        private _onload;
        private _onerror;
        status: number;
        response: any;
        responseType: string;
        onload: () => void;
        onerror: () => void;
        constructor();
        open(method: string, path: string, async?: boolean): void;
        setRequestHeader(header: string, value: string): void;
        send(data?: any): void;
    }
}
declare module RtmpJs {
    interface IChunkedStreamMessage {
        timestamp: number;
        streamId: number;
        chunkedStreamId: number;
        typeId: number;
        data: Uint8Array;
        firstChunk: boolean;
        lastChunk: boolean;
    }
    class ChunkedStream {
        private id;
        private buffer;
        private bufferLength;
        lastStreamId: number;
        lastTimestamp: number;
        lastLength: number;
        lastTypeId: number;
        lastMessageComplete: boolean;
        waitingForBytes: number;
        sentStreamId: number;
        sentTimestamp: number;
        sentLength: number;
        sentTypeId: number;
        onmessage: (message: IChunkedStreamMessage) => void;
        constructor(id: number);
        setBuffer(enabled: boolean): void;
        abort(): void;
        _push(data: Uint8Array, firstChunk: boolean, lastChunk: boolean): void;
    }
    interface IChunkedChannelUserControlMessage {
        type: number;
        data: Uint8Array;
    }
    interface ISendMessage {
        streamId: number;
        typeId: number;
        data: Uint8Array;
        timestamp?: number;
    }
    class ChunkedChannel {
        private state;
        private buffer;
        private bufferLength;
        private chunkSize;
        private chunkStreams;
        private peerChunkSize;
        private peerAckWindowSize;
        private bandwidthLimitType;
        private windowAckSize;
        private bytesReceived;
        private lastAckSent;
        private serverVersion;
        private epochStart;
        private randomData;
        onusercontrolmessage: (message: IChunkedChannelUserControlMessage) => void;
        onack: () => void;
        ondata: (data: Uint8Array) => void;
        onclose: () => void;
        oncreated: () => void;
        onmessage: (message: IChunkedStreamMessage) => void;
        constructor();
        push(data: Uint8Array): void;
        private _initialize();
        setChunkSize(chunkSize: number): void;
        send(chunkStreamId: number, message: ISendMessage): number;
        sendUserControlMessage(type: number, data: Uint8Array): void;
        private _sendAck();
        private _sendMessage(chunkStreamId, message);
        private _getChunkStream(id);
        private _parseChunkedData();
        start(): void;
        stop(error: any): void;
        private _fail(message);
    }
}
declare module RtmpJs {
    interface ITransportConnectedParameters {
        properties: any;
        information: any;
        isError: boolean;
    }
    interface ITransportStreamCreatedParameters {
        transactionId: number;
        commandObject: any;
        streamId: number;
        stream: INetStream;
        isError: boolean;
    }
    interface ITransportResponse {
        commandName: string;
        transactionId: number;
        commandObject: any;
        response: any;
    }
    interface ITransportEvent {
        type: number;
        data: Uint8Array;
    }
    class BaseTransport {
        channel: ChunkedChannel;
        onconnected: (props: ITransportConnectedParameters) => void;
        onstreamcreated: (props: ITransportStreamCreatedParameters) => void;
        onresponse: (response: ITransportResponse) => void;
        onevent: (event: ITransportEvent) => void;
        private _streams;
        constructor();
        connect(properties: any, args?: any): void;
        _initChannel(properties: any, args?: any): ChunkedChannel;
        call(procedureName: string, transactionId: number, commandObject: any, args: any): void;
        createStream(transactionId: number, commandObject: any): void;
        sendCommandOrResponse(commandName: string, transactionId: number, commandObject: any, response?: any): void;
        _setBuffer(streamId: number, ms: number): void;
        _sendCommand(streamId: number, data: Uint8Array): void;
    }
    interface INetStreamData {
        typeId: number;
        data: Uint8Array;
        timestamp: number;
    }
    interface INetStream {
        ondata: (data: INetStreamData) => void;
        onscriptdata: (type: string, ...data: any[]) => void;
        oncallback: (...args: any[]) => void;
        play(name: string, start?: number, duration?: number, reset?: boolean): any;
    }
    interface RtmpConnectionString {
        protocol: string;
        host: string;
        port: number;
        app: string;
    }
    function parseConnectionString(s: string): RtmpConnectionString;
}
declare module RtmpJs.Browser {
    class RtmpTransport extends BaseTransport {
        host: string;
        port: number;
        ssl: boolean;
        constructor(connectionSettings: any);
        connect(properties: any, args?: any): void;
    }
    class RtmptTransport extends BaseTransport {
        baseUrl: string;
        stopped: boolean;
        sessionId: string;
        requestId: number;
        data: Uint8Array[];
        constructor(connectionSettings: any);
        connect(properties: any, args?: any): void;
        tick(): void;
    }
}
/**
 * Copyright 2015 Mozilla Foundation
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
declare module RtmpJs.MP4.Iso {
    class Box {
        offset: number;
        size: number;
        boxtype: string;
        userType: Uint8Array;
        constructor(boxtype: string, extendedType?: Uint8Array);
        /**
         * @param offset Position where writing will start in the output array
         * @returns {number} Size of the written data
         */
        layout(offset: number): number;
        /**
         * @param data Output array
         * @returns {number} Amount of written bytes by this Box and its children only.
         */
        write(data: Uint8Array): number;
        toUint8Array(): Uint8Array;
    }
    class FullBox extends Box {
        version: number;
        flags: number;
        constructor(boxtype: string, version?: number, flags?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class FileTypeBox extends Box {
        majorBrand: string;
        minorVersion: number;
        compatibleBrands: string[];
        constructor(majorBrand: string, minorVersion: number, compatibleBrands: string[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class BoxContainerBox extends Box {
        children: Box[];
        constructor(type: string, children: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class MovieBox extends BoxContainerBox {
        header: MovieHeaderBox;
        tracks: Box[];
        extendsBox: MovieExtendsBox;
        userData: Box;
        constructor(header: MovieHeaderBox, tracks: Box[], extendsBox: MovieExtendsBox, userData: Box);
    }
    class MovieHeaderBox extends FullBox {
        timescale: number;
        duration: number;
        nextTrackId: number;
        rate: number;
        volume: number;
        matrix: number[];
        creationTime: number;
        modificationTime: number;
        constructor(timescale: number, duration: number, nextTrackId: number, rate?: number, volume?: number, matrix?: number[], creationTime?: number, modificationTime?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    const enum TrackHeaderFlags {
        TRACK_ENABLED = 1,
        TRACK_IN_MOVIE = 2,
        TRACK_IN_PREVIEW = 4,
    }
    class TrackHeaderBox extends FullBox {
        trackId: number;
        duration: number;
        width: number;
        height: number;
        volume: number;
        alternateGroup: number;
        layer: number;
        matrix: number[];
        creationTime: number;
        modificationTime: number;
        constructor(flags: number, trackId: number, duration: number, width: number, height: number, volume: number, alternateGroup?: number, layer?: number, matrix?: number[], creationTime?: number, modificationTime?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class MediaHeaderBox extends FullBox {
        timescale: number;
        duration: number;
        language: string;
        creationTime: number;
        modificationTime: number;
        constructor(timescale: number, duration: number, language?: string, creationTime?: number, modificationTime?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class HandlerBox extends FullBox {
        handlerType: string;
        name: string;
        private _encodedName;
        constructor(handlerType: string, name: string);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class SoundMediaHeaderBox extends FullBox {
        balance: number;
        constructor(balance?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class VideoMediaHeaderBox extends FullBox {
        graphicsMode: number;
        opColor: number[];
        constructor(graphicsMode?: number, opColor?: number[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    var SELF_CONTAINED_DATA_REFERENCE_FLAG: number;
    class DataEntryUrlBox extends FullBox {
        location: string;
        private _encodedLocation;
        constructor(flags: number, location?: string);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class DataReferenceBox extends FullBox {
        entries: Box[];
        constructor(entries: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class DataInformationBox extends BoxContainerBox {
        dataReference: Box;
        constructor(dataReference: Box);
    }
    class SampleDescriptionBox extends FullBox {
        entries: Box[];
        constructor(entries: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class SampleTableBox extends BoxContainerBox {
        sampleDescriptions: SampleDescriptionBox;
        timeToSample: Box;
        sampleToChunk: Box;
        sampleSizes: Box;
        chunkOffset: Box;
        constructor(sampleDescriptions: SampleDescriptionBox, timeToSample: Box, sampleToChunk: Box, sampleSizes: Box, chunkOffset: Box);
    }
    class MediaInformationBox extends BoxContainerBox {
        header: Box;
        info: DataInformationBox;
        sampleTable: SampleTableBox;
        constructor(header: Box, info: DataInformationBox, sampleTable: SampleTableBox);
    }
    class MediaBox extends BoxContainerBox {
        header: MediaHeaderBox;
        handler: HandlerBox;
        info: MediaInformationBox;
        constructor(header: MediaHeaderBox, handler: HandlerBox, info: MediaInformationBox);
    }
    class TrackBox extends BoxContainerBox {
        header: TrackHeaderBox;
        media: Box;
        constructor(header: TrackHeaderBox, media: Box);
    }
    class TrackExtendsBox extends FullBox {
        trackId: number;
        defaultSampleDescriptionIndex: number;
        defaultSampleDuration: number;
        defaultSampleSize: number;
        defaultSampleFlags: number;
        constructor(trackId: number, defaultSampleDescriptionIndex: number, defaultSampleDuration: number, defaultSampleSize: number, defaultSampleFlags: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class MovieExtendsBox extends BoxContainerBox {
        header: Box;
        tracDefaults: TrackExtendsBox[];
        levels: Box;
        constructor(header: Box, tracDefaults: TrackExtendsBox[], levels: Box);
    }
    class MetaBox extends FullBox {
        handler: Box;
        otherBoxes: Box[];
        constructor(handler: Box, otherBoxes: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class MovieFragmentHeaderBox extends FullBox {
        sequenceNumber: number;
        constructor(sequenceNumber: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    const enum TrackFragmentFlags {
        BASE_DATA_OFFSET_PRESENT = 1,
        SAMPLE_DESCRIPTION_INDEX_PRESENT = 2,
        DEFAULT_SAMPLE_DURATION_PRESENT = 8,
        DEFAULT_SAMPLE_SIZE_PRESENT = 16,
        DEFAULT_SAMPLE_FLAGS_PRESENT = 32,
    }
    class TrackFragmentHeaderBox extends FullBox {
        trackId: number;
        baseDataOffset: number;
        sampleDescriptionIndex: number;
        defaultSampleDuration: number;
        defaultSampleSize: number;
        defaultSampleFlags: number;
        constructor(flags: number, trackId: number, baseDataOffset: number, sampleDescriptionIndex: number, defaultSampleDuration: number, defaultSampleSize: number, defaultSampleFlags: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class TrackFragmentBaseMediaDecodeTimeBox extends FullBox {
        baseMediaDecodeTime: number;
        constructor(baseMediaDecodeTime: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class TrackFragmentBox extends BoxContainerBox {
        header: TrackFragmentHeaderBox;
        decodeTime: TrackFragmentBaseMediaDecodeTimeBox;
        run: TrackRunBox;
        constructor(header: TrackFragmentHeaderBox, decodeTime: TrackFragmentBaseMediaDecodeTimeBox, run: TrackRunBox);
    }
    const enum SampleFlags {
        IS_LEADING_MASK = 201326592,
        SAMPLE_DEPENDS_ON_MASK = 50331648,
        SAMPLE_DEPENDS_ON_OTHER = 16777216,
        SAMPLE_DEPENDS_ON_NO_OTHERS = 33554432,
        SAMPLE_IS_DEPENDED_ON_MASK = 12582912,
        SAMPLE_HAS_REDUNDANCY_MASK = 3145728,
        SAMPLE_PADDING_VALUE_MASK = 917504,
        SAMPLE_IS_NOT_SYNC = 65536,
        SAMPLE_DEGRADATION_PRIORITY_MASK = 65535,
    }
    const enum TrackRunFlags {
        DATA_OFFSET_PRESENT = 1,
        FIRST_SAMPLE_FLAGS_PRESENT = 4,
        SAMPLE_DURATION_PRESENT = 256,
        SAMPLE_SIZE_PRESENT = 512,
        SAMPLE_FLAGS_PRESENT = 1024,
        SAMPLE_COMPOSITION_TIME_OFFSET = 2048,
    }
    interface TrackRunSample {
        duration?: number;
        size?: number;
        flags?: number;
        compositionTimeOffset?: number;
    }
    class TrackRunBox extends FullBox {
        samples: TrackRunSample[];
        dataOffset: number;
        firstSampleFlags: number;
        constructor(flags: number, samples: TrackRunSample[], dataOffset?: number, firstSampleFlags?: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class MovieFragmentBox extends BoxContainerBox {
        header: MovieFragmentHeaderBox;
        trafs: TrackFragmentBox[];
        constructor(header: MovieFragmentHeaderBox, trafs: TrackFragmentBox[]);
    }
    class MediaDataBox extends Box {
        chunks: Uint8Array[];
        constructor(chunks: Uint8Array[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class SampleEntry extends Box {
        dataReferenceIndex: number;
        constructor(format: string, dataReferenceIndex: number);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class AudioSampleEntry extends SampleEntry {
        channelCount: number;
        sampleSize: number;
        sampleRate: number;
        otherBoxes: Box[];
        constructor(codingName: string, dataReferenceIndex: number, channelCount?: number, sampleSize?: number, sampleRate?: number, otherBoxes?: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    var COLOR_NO_ALPHA_VIDEO_SAMPLE_DEPTH: number;
    class VideoSampleEntry extends SampleEntry {
        width: number;
        height: number;
        compressorName: string;
        horizResolution: number;
        vertResolution: number;
        frameCount: number;
        depth: number;
        otherBoxes: Box[];
        constructor(codingName: string, dataReferenceIndex: number, width: number, height: number, compressorName?: string, horizResolution?: number, vertResolution?: number, frameCount?: number, depth?: number, otherBoxes?: Box[]);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
    class RawTag extends Box {
        data: Uint8Array;
        constructor(type: string, data: Uint8Array);
        layout(offset: number): number;
        write(data: Uint8Array): number;
    }
}
/**
 * Copyright 2015 Mozilla Foundation
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
declare module RtmpJs.MP4 {
    interface MP4Track {
        codecDescription?: string;
        codecId: number;
        language: string;
        timescale: number;
        samplerate?: number;
        channels?: number;
        samplesize?: number;
        framerate?: number;
        width?: number;
        height?: number;
    }
    interface MP4Metadata {
        tracks: MP4Track[];
        duration: number;
        audioTrackId: number;
        videoTrackId: number;
    }
    class MP4Mux {
        private metadata;
        private filePos;
        private cachedPackets;
        private trackStates;
        private audioTrackState;
        private videoTrackState;
        private state;
        private chunkIndex;
        oncodecinfo: (codecs: string[]) => void;
        ondata: (data) => void;
        constructor(metadata: MP4Metadata);
        pushPacket(type: number, data: Uint8Array, timestamp: number): void;
        flush(): void;
        private _checkIfNeedHeaderData();
        private _tryGenerateHeader();
        _chunk(): void;
    }
    function parseFLVMetadata(metadata: any): MP4Metadata;
}
/**
 * Copyright 2015 Mozilla Foundation
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
declare module RtmpJs.FLV {
    interface FLVHeader {
        hasAudio: boolean;
        hasVideo: boolean;
        extra: Uint8Array;
    }
    interface FLVTag {
        type: number;
        needPreprocessing: boolean;
        timestamp: number;
        data: Uint8Array;
    }
    class FLVParser {
        private state;
        private buffer;
        private bufferSize;
        private previousTagSize;
        onHeader: (header: FLVHeader) => void;
        onTag: (tag: FLVTag) => void;
        onClose: () => void;
        onError: (error) => void;
        constructor();
        push(data: Uint8Array): void;
        private _error(message);
        close(): void;
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
declare module Shumway.AVMX.AS.flash.geom {
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    import Bounds = Shumway.Bounds;
    class Matrix extends ASObject {
        static axClass: typeof Matrix;
        static classInitializer(): void;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
        static FromUntyped(object: any): Matrix;
        static FromDataBuffer(input: DataBuffer): Matrix;
        static FROZEN_IDENTITY_MATRIX: Matrix;
        static TEMP_MATRIX: Matrix;
        _data: Float64Array;
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
        /**
         * this = this * other
         */
        concat(other: Matrix): void;
        /**
         * this = other * this
         */
        preMultiply(other: Matrix): void;
        /**
         * target = other * this
         */
        preMultiplyInto(other: Matrix, target: Matrix): void;
        invert(): void;
        invertInto(target: Matrix): void;
        identity(): void;
        createBox(scaleX: number, scaleY: number, rotation?: number, tx?: number, ty?: number): void;
        createGradientBox(width: number, height: number, rotation?: number, tx?: number, ty?: number): void;
        rotate(angle: number): void;
        translate(dx: number, dy: number): void;
        scale(sx: number, sy: number): void;
        deltaTransformPoint(point: Point): Point;
        transformX(x: number, y: number): number;
        transformY(x: number, y: number): number;
        transformPoint(point: Point): Point;
        transformPointInPlace(point: any): Point;
        transformBounds(bounds: Bounds): void;
        getDeterminant(): number;
        getScaleX(): number;
        getScaleY(): number;
        getAbsoluteScaleX(): number;
        getAbsoluteScaleY(): number;
        getSkewX(): number;
        getSkewY(): number;
        copyFrom(other: Matrix): void;
        copyFromUntyped(object: any): void;
        setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): void;
        toTwipsInPlace(): Matrix;
        toPixelsInPlace(): Matrix;
        toSerializedScaleInPlace(): Matrix;
        copyRowTo(row: number, vector3D: Vector3D): void;
        copyColumnTo(column: number, vector3D: Vector3D): void;
        copyRowFrom(row: number, vector3D: Vector3D): void;
        copyColumnFrom(column: number, vector3D: Vector3D): void;
        /**
         * Updates the scale and skew componenets of the matrix.
         */
        updateScaleAndRotation(scaleX: number, scaleY: number, skewX: number, skewY: number): void;
        clone(): Matrix;
        equals(other: Matrix): boolean;
        toString(): string;
        writeExternal(output: DataBuffer): void;
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
declare module Shumway.AVMX.AS.flash.geom {
    class Matrix3D extends ASObject {
        static classInitializer: any;
        static axClass: typeof Matrix3D;
        static FromArray(matrix: any): any;
        private _matrix;
        private _displayObject;
        constructor(v?: any);
        static interpolate(thisMat: flash.geom.Matrix3D, toMat: flash.geom.Matrix3D, percent: number): flash.geom.Matrix3D;
        setTargetDisplayObject(object: flash.display.DisplayObject): void;
        resetTargetDisplayObject(): void;
        rawData: any;
        position: flash.geom.Vector3D;
        determinant: number;
        clone(): flash.geom.Matrix3D;
        copyToMatrix3D(dest: flash.geom.Matrix3D): void;
        append(lhs: flash.geom.Matrix3D): void;
        prepend(rhs: flash.geom.Matrix3D): void;
        invert(): boolean;
        identity(): void;
        decompose(orientationStyle?: string): Float64Vector;
        recompose(components: Float64Vector, orientationStyle?: string): boolean;
        appendTranslation(x: number, y: number, z: number): void;
        appendRotation(degrees: number, axis: flash.geom.Vector3D, pivotPoint?: flash.geom.Vector3D): void;
        appendScale(xScale: number, yScale: number, zScale: number): void;
        prependTranslation(x: number, y: number, z: number): void;
        prependRotation(degrees: number, axis: flash.geom.Vector3D, pivotPoint?: flash.geom.Vector3D): void;
        prependScale(xScale: number, yScale: number, zScale: number): void;
        transformVector(v: flash.geom.Vector3D): flash.geom.Vector3D;
        deltaTransformVector(v: flash.geom.Vector3D): flash.geom.Vector3D;
        transformVectors(vin: any, vout: any): void;
        transpose(): void;
        pointAt(pos: flash.geom.Vector3D, at?: flash.geom.Vector3D, up?: flash.geom.Vector3D): void;
        interpolateTo(toMat: flash.geom.Matrix3D, percent: number): void;
        copyFrom(sourceMatrix3D: flash.geom.Matrix3D): void;
        copyRawDataTo(vector: any, index?: number, transpose?: boolean): void;
        copyRawDataFrom(vector: Float64Vector, index?: number, transpose?: boolean): void;
        copyRowTo(row: number, vector3D: flash.geom.Vector3D): void;
        copyColumnTo(column: number, vector3D: flash.geom.Vector3D): void;
        copyRowFrom(row: number, vector3D: flash.geom.Vector3D): void;
        copyColumnFrom(column: number, vector3D: flash.geom.Vector3D): void;
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
declare module Shumway.AVMX.AS.flash.geom {
    class Orientation3D extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static EULER_ANGLES: string;
        static AXIS_ANGLE: string;
        static QUATERNION: string;
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
declare module Shumway.AVMX.AS.flash.geom {
    /**
     * Initial values for the projection as used in Flash. Only for `root` will a different center
     * be used: constructing an instance manually will get 250,250.
     */
    const enum DefaultPerspectiveProjection {
        FOV = 55,
        CenterX = 250,
        CenterY = 250,
    }
    class PerspectiveProjection extends ASObject {
        static axClass: typeof PerspectiveProjection;
        static classInitializer: any;
        constructor();
        static FromDisplayObject(displayObject: flash.display.DisplayObject): PerspectiveProjection;
        private _displayObject;
        _fieldOfView: number;
        _centerX: number;
        _centerY: number;
        fieldOfView: number;
        projectionCenter: flash.geom.Point;
        focalLength: number;
        toMatrix3D(): flash.geom.Matrix3D;
        clone(): PerspectiveProjection;
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
declare module Shumway.AVMX.AS.flash.geom {
    class Point extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(x?: number, y?: number);
        x: number;
        y: number;
        native_x: number;
        native_y: number;
        Point(x?: number, y?: number): void;
        length: number;
        static interpolate(p1: Point, p2: Point, f: number): Point;
        static distance(p1: Point, p2: Point): number;
        static polar(length: number, angle: number): Point;
        clone(): Point;
        offset(dx: number, dy: number): void;
        equals(toCompare: Point): Boolean;
        subtract(v: Point): Point;
        add(v: Point): Point;
        normalize(thickness: number): void;
        copyFrom(sourcePoint: Point): void;
        setTo(x: number, y: number): void;
        toTwips(): Point;
        toPixels(): Point;
        round(): Point;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.geom {
    import Bounds = Shumway.Bounds;
    class Rectangle extends ASObject implements flash.utils.IExternalizable {
        static axClass: typeof Rectangle;
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        x: number;
        y: number;
        width: number;
        height: number;
        constructor(x?: number, y?: number, width?: number, height?: number);
        static FromBounds(bounds: Bounds): Rectangle;
        native_x: number;
        native_y: number;
        native_width: number;
        native_height: number;
        left: number;
        right: number;
        top: number;
        bottom: number;
        topLeft: Point;
        bottomRight: Point;
        size: Point;
        area: number;
        clone(): Rectangle;
        isEmpty(): boolean;
        setEmpty(): Rectangle;
        inflate(dx: number, dy: number): void;
        inflatePoint(point: Point): void;
        offset(dx: number, dy: number): void;
        offsetPoint(point: Point): void;
        contains(x: number, y: number): boolean;
        containsPoint(point: Point): boolean;
        containsRect(rect: Rectangle): boolean;
        intersection(toIntersect: Rectangle): Rectangle;
        intersects(toIntersect: Rectangle): boolean;
        intersectInPlace(clipRect: Rectangle): Rectangle;
        intersectInPlaceInt32(clipRect: Rectangle): Rectangle;
        union(toUnion: Rectangle): Rectangle;
        unionInPlace(toUnion: Rectangle): Rectangle;
        equals(toCompare: Rectangle): boolean;
        copyFrom(sourceRect: Rectangle): void;
        setTo(x: number, y: number, width: number, height: number): void;
        toTwips(): Rectangle;
        getBaseWidth(angle: number): number;
        getBaseHeight(angle: number): number;
        toPixels(): Rectangle;
        snapInPlace(): Rectangle;
        roundInPlace(): Rectangle;
        toString(): string;
        hashCode(): number;
        writeExternal(output: flash.utils.IDataOutput): void;
        readExternal(input: flash.utils.IDataInput): void;
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
declare module Shumway.AVMX.AS.flash.geom {
    class Transform extends ASObject {
        static classInitializer: any;
        private _displayObject;
        constructor(displayObject: flash.display.DisplayObject);
        matrix: flash.geom.Matrix;
        colorTransform: flash.geom.ColorTransform;
        concatenatedMatrix: flash.geom.Matrix;
        concatenatedColorTransform: flash.geom.ColorTransform;
        pixelBounds: flash.geom.Rectangle;
        matrix3D: flash.geom.Matrix3D;
        getRelativeMatrix3D(relativeTo: flash.display.DisplayObject): flash.geom.Matrix3D;
        perspectiveProjection: flash.geom.PerspectiveProjection;
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
declare module Shumway.AVMX.AS.flash.geom {
    class Utils3D extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static projectVector(m: flash.geom.Matrix3D, v: flash.geom.Vector3D): flash.geom.Vector3D;
        static projectVectors(m: flash.geom.Matrix3D, verts: Float64Vector, projectedVerts: Float64Vector, uvts: Float64Vector): void;
        static pointTowards(percent: number, mat: flash.geom.Matrix3D, pos: flash.geom.Vector3D, at?: flash.geom.Vector3D, up?: flash.geom.Vector3D): flash.geom.Matrix3D;
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
declare module Shumway.AVMX.AS.flash.geom {
    class Vector3D extends ASObject {
        static classInitializer(): void;
        static Create(x: number, y: number, z: number, w: number): Vector3D;
        static X_AXIS: Vector3D;
        static Y_AXIS: Vector3D;
        static Z_AXIS: Vector3D;
        constructor(x?: number, y?: number, z?: number, w?: number);
        x: number;
        y: number;
        z: number;
        w: number;
        native_x: number;
        native_y: number;
        native_z: number;
        native_w: number;
        length: number;
        lengthSquared: number;
        static angleBetween(a: Vector3D, b: Vector3D): number;
        static distance(pt1: Vector3D, pt2: Vector3D): number;
        dotProduct(a: flash.geom.Vector3D): number;
        crossProduct(a: flash.geom.Vector3D): flash.geom.Vector3D;
        normalize(): number;
        scaleBy(s: number): void;
        incrementBy(a: flash.geom.Vector3D): void;
        decrementBy(a: flash.geom.Vector3D): void;
        add(a: flash.geom.Vector3D): flash.geom.Vector3D;
        subtract(a: flash.geom.Vector3D): flash.geom.Vector3D;
        negate(): void;
        equals(toCompare: flash.geom.Vector3D, allFour?: boolean): boolean;
        nearEquals(toCompare: flash.geom.Vector3D, tolerance: number, allFour?: boolean): boolean;
        project(): void;
        copyFrom(sourceVector3D: flash.geom.Vector3D): void;
        setTo(xa: number, ya: number, za: number): void;
        clone(): flash.geom.Vector3D;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.accessibility {
    class Accessibility extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        private static _active;
        static active: boolean;
        static sendEvent(source: flash.display.DisplayObject, childID: number, eventType: number, nonHTML?: boolean): void;
        static updateProperties(): void;
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
declare module Shumway.AVMX.AS.flash.accessibility {
    class AccessibilityImplementation extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        stub: boolean;
        errno: number;
        get_accRole: (childID: number) => number;
        get_accName: (childID: number) => string;
        get_accValue: (childID: number) => string;
        get_accState: (childID: number) => number;
        get_accDefaultAction: (childID: number) => string;
        accDoDefaultAction: (childID: number) => void;
        isLabeledBy: (labelBounds: flash.geom.Rectangle) => boolean;
        getChildIDArray: () => any[];
        accLocation: (childID: number) => any;
        get_accSelection: () => any[];
        get_accFocus: () => number;
        accSelect: (operation: number, childID: number) => void;
        get_selectionAnchorIndex: () => any;
        get_selectionActiveIndex: () => any;
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
declare module Shumway.AVMX.AS.flash.accessibility {
    class AccessibilityProperties extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        name: string;
        description: string;
        shortcut: string;
        silent: boolean;
        forceSimple: boolean;
        noAutoLabeling: boolean;
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
declare module Shumway.AVMX.AS.flash.events {
    class Event extends ASObject {
        static axClass: typeof Event;
        static _instances: Shumway.MapObject<Event>;
        static classInitializer: any;
        static getInstance(type: string, bubbles?: boolean, cancelable?: boolean): Event;
        static getBroadcastInstance(type: string, bubbles?: boolean, cancelable?: boolean): Event;
        /**
         * http://stackoverflow.com/questions/16900176/as3enterframe-event-propagation-understanding-issue
         */
        static isBroadcastEventType(type: string): boolean;
        constructor(type: string, bubbles: boolean, cancelable: boolean);
        static ACTIVATE: string;
        static ADDED: string;
        static ADDED_TO_STAGE: string;
        static CANCEL: string;
        static CHANGE: string;
        static CLEAR: string;
        static CLOSE: string;
        static COMPLETE: string;
        static CONNECT: string;
        static COPY: string;
        static CUT: string;
        static DEACTIVATE: string;
        static ENTER_FRAME: string;
        static FRAME_CONSTRUCTED: string;
        static EXIT_FRAME: string;
        static FRAME_LABEL: string;
        static ID3: string;
        static INIT: string;
        static MOUSE_LEAVE: string;
        static OPEN: string;
        static PASTE: string;
        static REMOVED: string;
        static REMOVED_FROM_STAGE: string;
        static RENDER: string;
        static RESIZE: string;
        static SCROLL: string;
        static TEXT_INTERACTION_MODE_CHANGE: string;
        static SELECT: string;
        static SELECT_ALL: string;
        static SOUND_COMPLETE: string;
        static TAB_CHILDREN_CHANGE: string;
        static TAB_ENABLED_CHANGE: string;
        static TAB_INDEX_CHANGE: string;
        static UNLOAD: string;
        static FULLSCREEN: string;
        static CONTEXT3D_CREATE: string;
        static TEXTURE_READY: string;
        static VIDEO_FRAME: string;
        static SUSPEND: string;
        static AVM1_INIT: string;
        static AVM1_CONSTRUCT: string;
        static AVM1_LOAD: string;
        _type: string;
        _bubbles: boolean;
        _cancelable: boolean;
        _target: Object;
        _currentTarget: Object;
        _eventPhase: number;
        _stopPropagation: boolean;
        _stopImmediatePropagation: boolean;
        _isDefaultPrevented: boolean;
        /**
         * Some events don't participate in the normal capturing and bubbling phase.
         */
        private _isBroadcastEvent;
        type: string;
        bubbles: boolean;
        cancelable: boolean;
        target: Object;
        currentTarget: Object;
        eventPhase: number;
        stopPropagation(): void;
        stopImmediatePropagation(): void;
        preventDefault(): void;
        isDefaultPrevented(): boolean;
        isBroadcastEvent(): boolean;
        clone(): Event;
        toString(): string;
        formatToString(className: string, ...args: string[]): string;
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
declare module Shumway.AVMX.AS.flash.events {
    /**
     * Broadcast Events
     *
     * The logic here is pretty much copied from:
     * http://www.senocular.com/flash/tutorials/orderofoperations/
     */
    class BroadcastEventDispatchQueue {
        /**
         * The queues start off compact but can have null values if event targets are removed.
         * Periodically we compact them if too many null values exist.
         */
        private _queues;
        constructor();
        reset(): void;
        add(type: string, target: EventDispatcher): void;
        remove(type: string, target: EventDispatcher): void;
        dispatchEvent(event: flash.events.Event): void;
        getQueueLength(type: string): number;
    }
    /**
     * The EventDispatcher class is the base class for all classes that dispatch events.
     * The EventDispatcher class implements the IEventDispatcher interface and is the base class for
     * the DisplayObject class. The EventDispatcher class allows any object on the display list to be
     * an event target and as such, to use the methods of the IEventDispatcher interface.
     */
    class EventDispatcher extends ASObject implements IEventDispatcher {
        static axClass: typeof EventDispatcher;
        static broadcastEventDispatchQueue: BroadcastEventDispatchQueue;
        static classInitializer(): void;
        private _target;
        private _captureListeners;
        private _targetOrBubblingListeners;
        protected _fieldsInitialized: boolean;
        constructor(target?: flash.events.IEventDispatcher);
        protected _initializeFields(target: flash.events.IEventDispatcher): void;
        toString(): string;
        /**
         * Don't lazily construct listener lists if all we're doing is looking for listener types that
         * don't exist yet.
         */
        private _getListenersForType(useCapture, type);
        /**
         * Lazily construct listeners lists to avoid object allocation.
         */
        private _getListeners(useCapture);
        addEventListener(type: string, listener: EventHandler, useCapture?: boolean, priority?: number, useWeakReference?: boolean): void;
        removeEventListener(type: string, listener: EventHandler, useCapture?: boolean): void;
        private _hasTargetOrBubblingEventListener(type);
        private _hasCaptureEventListener(type);
        /**
         * Faster internal version of |hasEventListener| that doesn't do any argument checking.
         */
        private _hasEventListener(type);
        hasEventListener(type: string): boolean;
        willTrigger(type: string): boolean;
        /**
         * Check to see if we can skip event dispatching in case there are no event listeners
         * for this |event|.
         */
        private _skipDispatchEvent(event);
        dispatchEvent(event: Event): boolean;
        private static callListeners(list, event, target, currentTarget, eventPhase);
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
declare module Shumway.AVMX.AS.flash.events {
    class EventPhase extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static CAPTURING_PHASE: number;
        static AT_TARGET: number;
        static BUBBLING_PHASE: number;
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
declare module Shumway.AVMX.AS.flash.events {
    class TextEvent extends flash.events.Event {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles: boolean, cancelable: boolean, text: string);
        static LINK: string;
        static TEXT_INPUT: string;
        _text: string;
        text: string;
        clone(): Event;
        toString(): string;
        copyNativeData(event: flash.events.TextEvent): void;
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
declare module Shumway.AVMX.AS.flash.events {
    class ErrorEvent extends flash.events.TextEvent {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, text?: string, id?: number);
        static ERROR: string;
        _id: number;
        private setID(id);
        errorID: number;
        clone(): Event;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.events {
    class AsyncErrorEvent extends flash.events.ErrorEvent {
        static ASYNC_ERROR: string;
        static classInitializer: any;
        $Bgerror: ASError;
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, text?: string, error?: ASError);
        error: ASError;
        clone(): Event;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.events {
    class GameInputEvent extends flash.events.Event {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        device: flash.ui.GameInputDevice;
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, device?: flash.ui.GameInputDevice);
        static DEVICE_ADDED: string;
        static DEVICE_REMOVED: string;
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
declare module Shumway.AVMX.AS.flash.events {
    class GestureEvent extends flash.events.Event {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, phase?: string, localX?: number, localY?: number, ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean);
        static GESTURE_TWO_FINGER_TAP: string;
        private _phase;
        private _localX;
        private _localY;
        private _ctrlKey;
        private _altKey;
        private _shiftKey;
        localX: number;
        localY: number;
        stageX: number;
        stageY: number;
        ctrlKey: boolean;
        altKey: boolean;
        shiftKey: boolean;
        phase: string;
        updateAfterEvent(): void;
        NativeCtor(phase: string, localX: number, localY: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean): void;
        clone(): Event;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.events {
    class HTTPStatusEvent extends flash.events.Event {
        static classInitializer: any;
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, status?: number);
        static HTTP_STATUS: string;
        static HTTP_RESPONSE_STATUS: string;
        private _status;
        _setStatus(value: number): void;
        status: number;
        clone(): Event;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.events {
    interface EventHandler {
        (event: flash.events.Event): void;
    }
    interface IEventDispatcher {
        addEventListener: (type: string, listener: EventHandler, useCapture?: boolean, priority?: number, useWeakReference?: boolean) => void;
        removeEventListener: (type: string, listener: EventHandler, useCapture?: boolean) => void;
        hasEventListener: (type: string) => boolean;
        willTrigger: (type: string) => boolean;
        dispatchEvent: (event: flash.events.Event) => boolean;
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
declare module Shumway.AVMX.AS.flash.events {
    class IOErrorEvent extends flash.events.ErrorEvent {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, text?: string, id?: number);
        static IO_ERROR: string;
        static NETWORK_ERROR: string;
        static DISK_ERROR: string;
        static VERIFY_ERROR: string;
        clone(): Event;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.events {
    class KeyboardEvent extends flash.events.Event {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, charCodeValue?: number, keyCodeValue?: number, keyLocationValue?: number, ctrlKeyValue?: boolean, altKeyValue?: boolean, shiftKeyValue?: boolean);
        static KEY_DOWN: string;
        static KEY_UP: string;
        private _charCode;
        private _keyCode;
        private _keyLocation;
        private _ctrlKey;
        private _altKey;
        private _shiftKey;
        charCode: number;
        keyCode: number;
        keyLocation: number;
        ctrlKey: boolean;
        altKey: boolean;
        shiftKey: boolean;
        clone(): Event;
        toString(): string;
        updateAfterEvent(): void;
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
declare module Shumway.AVMX.AS.flash.events {
    class MouseEvent extends flash.events.Event {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, localX?: number, localY?: number, relatedObject?: flash.display.InteractiveObject, ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean, buttonDown?: boolean, delta?: number);
        static CLICK: string;
        static DOUBLE_CLICK: string;
        static MOUSE_DOWN: string;
        static MOUSE_MOVE: string;
        static MOUSE_OUT: string;
        static MOUSE_OVER: string;
        static MOUSE_UP: string;
        static RELEASE_OUTSIDE: string;
        static MOUSE_WHEEL: string;
        static ROLL_OUT: string;
        static ROLL_OVER: string;
        static MIDDLE_CLICK: string;
        static MIDDLE_MOUSE_DOWN: string;
        static MIDDLE_MOUSE_UP: string;
        static RIGHT_CLICK: string;
        static RIGHT_MOUSE_DOWN: string;
        static RIGHT_MOUSE_UP: string;
        static CONTEXT_MENU: string;
        /**
         * AS3 mouse event names don't match DOM even names, so map them here.
         */
        static typeFromDOMType(name: string): string;
        private _localX;
        private _localY;
        private _movementX;
        private _movementY;
        private _delta;
        private _position;
        private _ctrlKey;
        private _altKey;
        private _shiftKey;
        private _buttonDown;
        private _relatedObject;
        private _isRelatedObjectInaccessible;
        localX: number;
        localY: number;
        stageX: Number;
        stageY: Number;
        movementX: number;
        movementY: number;
        delta: number;
        ctrlKey: boolean;
        altKey: boolean;
        shiftKey: boolean;
        buttonDown: boolean;
        relatedObject: flash.display.InteractiveObject;
        isRelatedObjectInaccessible: boolean;
        updateAfterEvent(): void;
        private _getGlobalPoint();
        clone(): Event;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.events {
    class NetStatusEvent extends flash.events.Event {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, info?: Object);
        private _info;
        info: Object;
        static NET_STATUS: string;
        clone(): Event;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.events {
    class ProgressEvent extends flash.events.Event {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, bytesLoaded?: number, bytesTotal?: number);
        static PROGRESS: string;
        static SOCKET_DATA: string;
        private _bytesLoaded;
        private _bytesTotal;
        bytesLoaded: number;
        bytesTotal: number;
        clone(): Event;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.events {
    class SecurityErrorEvent extends flash.events.ErrorEvent {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, text?: string, id?: number);
        static SECURITY_ERROR: string;
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
declare module Shumway.AVMX.AS.flash.events {
    class StatusEvent extends flash.events.Event {
        static classInitializer: any;
        private _code;
        private _level;
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, code?: string, level?: string);
        level: string;
        code: string;
        clone(): Shumway.AVMX.AS.flash.events.Event;
        toString(): string;
        static STATUS: string;
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
declare module Shumway.AVMX.AS.flash.events {
    class TimerEvent extends flash.events.Event {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles?: boolean, cancelable?: boolean);
        static TIMER: string;
        static TIMER_COMPLETE: string;
        clone(): Event;
        toString(): string;
        updateAfterEvent(): void;
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
declare module Shumway.AVMX.AS.flash.events {
    class TouchEvent extends flash.events.Event {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type: string, bubbles?: boolean, cancelable?: boolean, touchPointID?: number, isPrimaryTouchPoint?: boolean, localX?: number, localY?: number, sizeX?: number, sizeY?: number, pressure?: number, relatedObject?: flash.display.InteractiveObject, ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean);
        static TOUCH_BEGIN: string;
        static TOUCH_END: string;
        static TOUCH_MOVE: string;
        static TOUCH_OVER: string;
        static TOUCH_OUT: string;
        static TOUCH_ROLL_OVER: string;
        static TOUCH_ROLL_OUT: string;
        static TOUCH_TAP: string;
        static PROXIMITY_BEGIN: string;
        static PROXIMITY_END: string;
        static PROXIMITY_MOVE: string;
        static PROXIMITY_OUT: string;
        static PROXIMITY_OVER: string;
        static PROXIMITY_ROLL_OUT: string;
        static PROXIMITY_ROLL_OVER: string;
        private _touchPointID;
        private _isPrimaryTouchPoint;
        private _localX;
        private _localY;
        private _sizeX;
        private _sizeY;
        private _pressure;
        private _relatedObject;
        private _ctrlKey;
        private _altKey;
        private _shiftKey;
        private _isRelatedObjectInaccessible;
        touchPointID: number;
        isPrimaryTouchPoint: boolean;
        localX: number;
        localY: number;
        sizeX: number;
        sizeY: number;
        pressure: number;
        relatedObject: display.InteractiveObject;
        ctrlKey: boolean;
        altKey: boolean;
        shiftKey: boolean;
        stageX: number;
        stageY: number;
        isRelatedObjectInaccessible: boolean;
        clone(): Event;
        toString(): string;
        updateAfterEvent(): void;
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
declare module Shumway.AVMX.AS.flash.events {
    class UncaughtErrorEvent extends flash.events.ErrorEvent {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(type?: string, bubbles?: boolean, cancelable?: boolean, error_in?: any);
        static UNCAUGHT_ERROR: string;
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
declare module Shumway.AVMX.AS.flash.events {
    class UncaughtErrorEvents extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
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
 * Flash bugs to keep in mind:
 *
 * http://aaronhardy.com/flex/displayobject-quirks-and-tips/
 * http://blog.anselmbradford.com/2009/02/12/flash-movie-clip-transformational-properties-explorer-x-y-width-height-more/
 * http://gskinner.com/blog/archives/2007/08/annoying_as3_bu.html
 * http://blog.dennisrobinson.name/getbounds-getrect-unexpected-results/
 *
 */
declare module Shumway.AVMX.AS.flash.display {
    import Bounds = Shumway.Bounds;
    import geom = flash.geom;
    const enum DisplayObjectFlags {
        None = 0,
        /**
         * Display object is visible.
         */
        Visible = 1,
        /**
         * Display object has invalid line bounds.
         */
        InvalidLineBounds = 2,
        /**
         * Display object has invalid fill bounds.
         */
        InvalidFillBounds = 4,
        /**
         * Display object has an invalid matrix because one of its local properties: x, y, scaleX, ...
         * has been mutated.
         */
        InvalidMatrix = 8,
        /**
         * Display object has an invalid inverted matrix because its matrix has been mutated.
         */
        InvalidInvertedMatrix = 16,
        /**
         * Display object has an invalid concatenated matrix because its matrix or one of its
         * ancestor's matrices has been mutated.
         */
        InvalidConcatenatedMatrix = 32,
        /**
         * Display object has an invalid inverted concatenated matrix because its matrix or one of its
         * ancestor's matrices has been mutated. We don't always need to compute the inverted matrix.
         * This is why we use a sepearete invalid flag for it and don't roll it under the
         * |InvalidConcatenatedMatrix| flag.
         */
        InvalidInvertedConcatenatedMatrix = 64,
        /**
         * Display object has an invalid concatenated color transform because its color transform or
         * one of its ancestor's color transforms has been mutated.
         */
        InvalidConcatenatedColorTransform = 128,
        /**
         * The display object's constructor has been executed or any of the derived class constructors
         * have executed. It may be that the derived class doesn't call super, in such cases this flag
         * must be set manually elsewhere.
         */
        Constructed = 256,
        /**
         * Display object has been removed by the timeline but it no longer recieves any event.
         */
        Destroyed = 512,
        /**
         * Indicates wether an AVM1 load event needs to be dispatched on this display object.
         */
        NeedsLoadEvent = 1024,
        /**
         * Display object is owned by the timeline, meaning that it is under the control of the
         * timeline and that a reference to this object has not leaked into AS3 code via the
         * DisplayObjectContainer methods |getChildAt|,  |getChildByName| or through the execution of
         * the symbol class constructor.
         */
        OwnedByTimeline = 2048,
        /**
         * Display object is animated by the timeline. It may no longer be owned by the timeline
         * (|OwnedByTimeline|) but it is still animated by it. If AS3 code mutates any property on the
         * display object, this flag is cleared and further timeline mutations are ignored.
         */
        AnimatedByTimeline = 4096,
        /**
         * MovieClip object has reached a frame with a frame script or ran a frame script that attached
         * a new one to the current frame. To run the script, it has to be appended to the queue of
         * scripts.
         */
        HasFrameScriptPending = 8192,
        /**
         * DisplayObjectContainer contains at least one descendant with the HasFrameScriptPending flag
         * set.
         */
        ContainsFrameScriptPendingChildren = 16384,
        /**
         * Indicates whether this display object is a MorphShape or contains at least one descendant
         * that is.
         */
        ContainsMorph = 32768,
        /**
         * Indicates whether this display object should be cached as a bitmap. The display object may
         * be cached as bitmap even if this flag is not set, depending on whether any filters are
         * applied or if the bitmap is too large or we've run out of memory.
         */
        CacheAsBitmap = 65536,
        /**
         * Indicates whether an AVM1 timeline needs to initialize an object after place object
         * occurred.
         */
        HasPlaceObjectInitPending = 131072,
        /**
         * Indicates whether a transform.perspectiveProjection was set.
         */
        HasPerspectiveProjection = 262144,
        /**
         * Indicates whether this display object has dirty descendents. If this flag is set then the
         * subtree need to be synchronized.
         */
        DirtyDescendents = 536870912,
        /**
         * Masks flags that need to be propagated up when this display object gets added to a parent.
         */
        Bubbling = 536920064,
    }
    const enum DisplayObjectDirtyFlags {
        /**
         * Indicates whether this display object's matrix has changed since the last time it was
         * synchronized.
         */
        DirtyMatrix = 1,
        /**
         * Indicates whether this display object's children list is dirty.
         */
        DirtyChildren = 2,
        /**
         * Indicates whether this display object's graphics has changed since the last time it was
         * synchronized.
         */
        DirtyGraphics = 4,
        /**
         * Indicates whether this display object's text content has changed since the last time it was
         * synchronized.
         */
        DirtyTextContent = 8,
        /**
         * Indicates whether this display object's bitmap data has changed since the last time it was
         * synchronized.
         */
        DirtyBitmapData = 16,
        /**
         * Indicates whether this display object's bitmap data has changed since the last time it was
         * synchronized.
         */
        DirtyNetStream = 32,
        /**
         * Indicates whether this display object's color transform has changed since the last time it
         * was synchronized.
         */
        DirtyColorTransform = 64,
        /**
         * Indicates whether this display object's mask has changed since the last time it was
         * synchronized.
         */
        DirtyMask = 128,
        /**
         * Indicates whether this display object's clip depth has changed since the last time it was
         * synchronized.
         */
        DirtyClipDepth = 256,
        /**
         * Indicates whether this display object's other properties have changed. We need to split this
         * up in multiple bits so we don't serialize as much:
         *
         * So far we only mark these properties here:
         *
         * blendMode,
         * scale9Grid,
         * cacheAsBitmap,
         * filters,
         * visible,
         */
        DirtyMiscellaneousProperties = 512,
        /**
         * All synchronizable properties are dirty.
         */
        Dirty = 1023,
    }
    /**
     * Controls how the visitor walks the display tree.
     */
    const enum VisitorFlags {
        /**
         * None
         */
        None = 0,
        /**
         * Continue with normal traversal.
         */
        Continue = 0,
        /**
         * Not used yet, should probably just stop the visitor.
         */
        Stop = 1,
        /**
         * Skip processing current node.
         */
        Skip = 2,
        /**
         * Visit front to back.
         */
        FrontToBack = 8,
        /**
         * Only visit the nodes matching a certain flag set.
         */
        Filter = 16,
    }
    const enum HitTestingType {
        HitTestBounds = 0,
        HitTestBoundsAndMask = 1,
        HitTestShape = 2,
        Mouse = 3,
        ObjectsUnderPoint = 4,
        Drop = 5,
    }
    const enum HitTestingResult {
        None = 0,
        Bounds = 1,
        Shape = 2,
    }
    interface IAdvancable extends Shumway.IReferenceCountable {
        _initFrame(advance: boolean): void;
        _constructFrame(): void;
    }
    class DisplayObject extends flash.events.EventDispatcher implements IBitmapDrawable, Shumway.Remoting.IRemotable {
        static axClass: typeof DisplayObject;
        /**
         * Every displayObject is assigned an unique integer ID.
         */
        static getNextSyncID(): number;
        /**
         * DisplayObject#name is set to an initial value of 'instanceN', where N is auto-incremented.
         * This is true for all DisplayObjects except for Stage, so it happens in an overrideable
         * method.
         */
        static _instanceID: number;
        static _advancableInstances: WeakList<IAdvancable>;
        static classInitializer(): void;
        static reset(): void;
        static classSymbols: string[];
        static instanceSymbols: string[];
        /**
         * Creates a new display object from a symbol and initializes its animated display properties.
         * Calling its constructor is optional at this point, since that can happen in a later frame
         * phase.
         */
        createAnimatedDisplayObject(symbol: Shumway.Timeline.DisplaySymbol, placeObjectTag: Shumway.SWF.Parser.PlaceObjectTag, callConstructor: boolean): DisplayObject;
        private static _runScripts;
        static _stage: Stage;
        /**
         * Runs one full turn of the frame events cycle.
         *
         * Frame navigation methods on MovieClip can trigger nested frame events cycles. These nested
         * cycles do everything the outermost cycle does, except for broadcasting the ENTER_FRAME
         * event.
         *
         * If runScripts is true, no events are dispatched and Movieclip frame scripts are run. This
         * is true for nested cycles, too. (We keep static state for that.)
         */
        static performFrameNavigation(mainLoop: boolean, runScripts: boolean): void;
        /**
         * Dispatches a frame event on all instances of DisplayObjects.
         */
        static _broadcastFrameEvent(type: string): void;
        constructor();
        protected _initializeFields(): void;
        /**
         * Sets the object's initial name to adhere to the 'instanceN' naming scheme.
         */
        _setInitialName(): void;
        _setParent(parent: DisplayObjectContainer, depth: number): void;
        _setDepth(value: number): void;
        _setFillAndLineBoundsFromWidthAndHeight(width: number, height: number): void;
        _setFillAndLineBoundsFromSymbol(symbol: Timeline.DisplaySymbol): void;
        _setFlags(flags: DisplayObjectFlags): void;
        /**
         * Use this to set dirty flags so that we can also propagate the dirty child bit.
         */
        _setDirtyFlags(flags: DisplayObjectDirtyFlags): void;
        _removeDirtyFlags(flags: DisplayObjectDirtyFlags): void;
        _hasDirtyFlags(flags: DisplayObjectDirtyFlags): boolean;
        _hasAnyDirtyFlags(flags: DisplayObjectDirtyFlags): boolean;
        _toggleFlags(flags: DisplayObjectFlags, on: boolean): void;
        _removeFlags(flags: DisplayObjectFlags): void;
        _hasFlags(flags: DisplayObjectFlags): boolean;
        _hasAnyFlags(flags: DisplayObjectFlags): boolean;
        /**
         * Propagates flags up the display list. Propagation stops if all flags are already set.
         */
        _propagateFlagsUp(flags: DisplayObjectFlags): void;
        /**
         * Propagates flags down the display list. Non-containers just set the flags on themselves.
         *
         * Overridden in DisplayObjectContainer.
         */
        _propagateFlagsDown(flags: DisplayObjectFlags): void;
        _id: number;
        private _flags;
        private _dirtyFlags;
        _root: flash.display.DisplayObject;
        _stage: flash.display.Stage;
        _name: string;
        _parent: flash.display.DisplayObjectContainer;
        _mask: flash.display.DisplayObject;
        /**
         * These are always the most up to date properties. The |_matrix| is kept in sync with
         * these values. This is only true when |_matrix3D| is null.
         */
        _scaleX: number;
        _scaleY: number;
        _skewX: number;
        _skewY: number;
        _z: number;
        _scaleZ: number;
        _rotation: number;
        _rotationX: number;
        _rotationY: number;
        _rotationZ: number;
        _mouseX: number;
        _mouseY: number;
        _width: number;
        _height: number;
        _opaqueBackground: ASObject;
        _scrollRect: flash.geom.Rectangle;
        _filters: any[];
        _blendMode: string;
        _scale9Grid: Bounds;
        _loaderInfo: flash.display.LoaderInfo;
        _accessibilityProperties: flash.accessibility.AccessibilityProperties;
        /**
         * Bounding box excluding strokes.
         */
        _fillBounds: Bounds;
        /**
         * Bounding box including strokes.
         */
        _lineBounds: Bounds;
        _clipDepth: number;
        /**
         * The a, b, c, d components of the matrix are only valid if the InvalidMatrix flag
         * is not set. Don't access this directly unless you can be sure that its components
         * are valid.
         */
        _matrix: flash.geom.Matrix;
        _invertedMatrix: flash.geom.Matrix;
        _concatenatedMatrix: flash.geom.Matrix;
        _invertedConcatenatedMatrix: flash.geom.Matrix;
        _colorTransform: flash.geom.ColorTransform;
        _concatenatedColorTransform: flash.geom.ColorTransform;
        _matrix3D: flash.geom.Matrix3D;
        _perspectiveProjectionFOV: number;
        _perspectiveProjectionCenterX: number;
        _perspectiveProjectionCenterY: number;
        _perspectiveProjection: flash.geom.PerspectiveProjection;
        _depth: number;
        _ratio: number;
        /**
         * Index of this display object within its container's children
         */
        _index: number;
        _isContainer: boolean;
        _maskedObject: flash.display.DisplayObject;
        _mouseOver: boolean;
        _mouseDown: boolean;
        _symbol: Shumway.Timeline.DisplaySymbol;
        _placeObjectTag: Shumway.SWF.Parser.PlaceObjectTag;
        _graphics: flash.display.Graphics;
        /**
         * This is only ever used in classes that can have children, like |DisplayObjectContainer| or
         * |SimpleButton|.
         */
        _children: DisplayObject[];
        /**
         *
         */
        _referenceCount: number;
        /**
         * Finds the nearest ancestor with a given set of flags that are either turned on or off.
         */
        private _findNearestAncestor(flags, on);
        _findFurthestAncestorOrSelf(): DisplayObject;
        /**
         * Tests if this display object is an ancestor of the specified display object.
         */
        _isAncestor(child: DisplayObject): boolean;
        /**
         * Clamps the rotation value to the range (-180, 180).
         */
        private static _clampRotation(value);
        /**
         * Used as a temporary array to avoid allocations.
         */
        private static _path;
        /**
         * Return's a list of ancestors excluding the |last|, the return list is reused.
         */
        private static _getAncestors(node, last);
        /**
         * Computes the combined transformation matrixes of this display object and all of its parents.
         * It is not the same as |transform.concatenatedMatrix|, the latter also includes the screen
         * space matrix.
         */
        _getConcatenatedMatrix(): flash.geom.Matrix;
        _getInvertedConcatenatedMatrix(): flash.geom.Matrix;
        _setMatrix(matrix: flash.geom.Matrix, toTwips: boolean): void;
        /**
         * Returns an updated matrix if the current one is invalid.
         */
        _getMatrix(): geom.Matrix;
        _getInvertedMatrix(): geom.Matrix;
        /**
         * Computes the combined transformation color matrixes of this display object and all of its
         * ancestors.
         */
        _getConcatenatedColorTransform(): flash.geom.ColorTransform;
        _setColorTransform(colorTransform: flash.geom.ColorTransform): void;
        /**
         * Invalidates the fill- and lineBounds of this display object along with all of its ancestors.
         */
        _invalidateFillAndLineBounds(fill: boolean, line: boolean): void;
        _invalidateParentFillAndLineBounds(fill: boolean, line: boolean): void;
        /**
         * Computes the bounding box for all of this display object's content, its graphics and all of
         * its children.
         */
        _getContentBounds(includeStrokes?: boolean): Bounds;
        /**
         * Empty base case: DisplayObject cannot have children, but several distinct subclasses can.
         * Overridden in DisplayObjectContainer, SimpleButton, and AVM1Movie.
         */
        _getChildBounds(bounds: Bounds, includeStrokes: boolean): void;
        /**
         * Gets the bounds of this display object relative to another coordinate space. The
         * transformation matrix from the local coordinate space to the target coordinate space is
         * computed using:
         *
         *   this.concatenatedMatrix * inverse(target.concatenatedMatrix)
         *
         * If the |targetCoordinateSpace| is |null| then assume the identity coordinate space.
         */
        _getTransformedBounds(targetCoordinateSpace: DisplayObject, includeStroke: boolean): Bounds;
        /**
         * Detaches this object from being animated by the timeline. This happens whenever a display
         * property of this object is changed by user code.
         */
        private _stopTimelineAnimation();
        /**
         * Marks this object as having its matrix changed.
         *
         * Propagates flags both up- and (via invalidatePosition) downwards, so is quite costly.
         * TODO: check if we can usefully combine all upwards-propagated flags here.
         */
        private _invalidateMatrix();
        /**
         * Marks this object as having been moved in its parent display object.
         */
        _invalidatePosition(): void;
        /**
         * Animates this object's display properties.
         */
        _animate(placeObjectTag: Shumway.SWF.Parser.PlaceObjectTag): void;
        /**
         * Dispatches an event on this object and all its descendants.
         */
        _propagateEvent(event: flash.events.Event): void;
        x: number;
        _getX(): number;
        y: number;
        _getY(): number;
        /**
         * In Flash player, this always returns a positive number for some reason. This however, is not
         * the case for scaleY.
         */
        scaleX: number;
        scaleY: number;
        scaleZ: number;
        rotation: number;
        rotationX: number;
        rotationY: number;
        rotationZ: number;
        /**
         * The width of this display object in its parent coordinate space.
         */
        /**
         * Attempts to change the width of this display object by changing its scaleX / scaleY
         * properties. The scaleX property is set to the specified |width| value / baseWidth
         * of the object in its parent cooridnate space with rotation applied.
         */
        width: number;
        _getWidth(): number;
        _setWidth(value: number): void;
        /**
         * The height of this display object in its parent coordinate space.
         */
        /**
         * Attempts to change the height of this display object by changing its scaleY / scaleX
         * properties. The scaleY property is set to the specified |height| value / baseHeight
         * of the object in its parent cooridnate space with rotation applied.
         */
        height: number;
        _getHeight(): number;
        _setHeight(value: number): void;
        /**
         * Sets the mask for this display object. This does not affect the bounds.
         */
        mask: DisplayObject;
        transform: flash.geom.Transform;
        _getTransform(): geom.Transform;
        private destroy();
        /**
         * Walks up the tree to find this display object's root. An object is classified
         * as a root if its _root property points to itself. Root objects are the Stage,
         * the main timeline object and a Loader's content.
         */
        root: DisplayObject;
        /**
         * Walks up the tree to find this display object's stage, the first object whose
         * |_stage| property points to itself.
         */
        stage: flash.display.Stage;
        name: string;
        parent: DisplayObjectContainer;
        alpha: number;
        blendMode: string;
        scale9Grid: flash.geom.Rectangle;
        _getScale9Grid(): geom.Rectangle;
        /**
         * This is always true if a filter is applied.
         */
        cacheAsBitmap: boolean;
        _getCacheAsBitmap(): boolean;
        /**
         * References to the internal |_filters| array and its BitmapFilter objects are never leaked
         * outside of this class. The get/set filters accessors always return deep clones of this
         * array.
         */
        filters: ASArray;
        _getFilters(): any;
        /**
         * Marks this display object as visible / invisible. This does not affect the bounds.
         */
        visible: boolean;
        z: number;
        getBounds(targetCoordinateSpace: DisplayObject): flash.geom.Rectangle;
        getRect(targetCoordinateSpace: DisplayObject): flash.geom.Rectangle;
        /**
         * Converts a point from the global coordinate space into the local coordinate space.
         */
        globalToLocal(point: flash.geom.Point): flash.geom.Point;
        /**
         * Converts a point form the local coordinate sapce into the global coordinate space.
         */
        localToGlobal(point: flash.geom.Point): flash.geom.Point;
        globalToLocal3D(point: flash.geom.Point): flash.geom.Vector3D;
        localToGlobal3D(point: flash.geom.Point): flash.geom.Vector3D;
        local3DToGlobal(point3d: flash.geom.Vector3D): flash.geom.Point;
        /**
         * Tree visitor that lets you skip nodes or return early.
         */
        visit(visitor: (DisplayObject) => VisitorFlags, visitorFlags: VisitorFlags, displayObjectFlags?: DisplayObjectFlags): void;
        /**
         * Returns the loader info for this display object's root.
         */
        loaderInfo: flash.display.LoaderInfo;
        /**
         * Only these objects can have graphics.
         */
        _canHaveGraphics(): boolean;
        /**
         * Gets the graphics object of this object. Shapes, MorphShapes, and Sprites override this.
         */
        _getGraphics(): flash.display.Graphics;
        /**
         * Only these objects can have text content.
         */
        _canHaveTextContent(): boolean;
        /**
         * Gets the text content of this object. StaticTexts and TextFields override this.
         */
        _getTextContent(): Shumway.TextContent;
        /**
         * Lazily construct a graphics object.
         */
        _ensureGraphics(): flash.display.Graphics;
        /**
         * Sets this object's graphics or text content. Happens when an animated Shape or StaticText
         * object is initialized from a symbol or replaced by a timeline command using the same symbol
         * as this object was initialized from.
         */
        _setStaticContentFromSymbol(symbol: Shumway.Timeline.DisplaySymbol): void;
        /**
         * Checks if the bounding boxes of two display objects overlap, this happens in the global
         * coordinate coordinate space.
         *
         * Two objects overlap even if one or both are not on the stage, as long as their bounds
         * in the global coordinate space overlap.
         */
        hitTestObject(other: DisplayObject): boolean;
        /**
         * The |globalX| and |globalY| arguments are in global coordinates. The |shapeFlag| indicates
         * whether the hit test should be on the actual shape of the object or just its bounding box.
         *
         * Note: shapeFlag is optional, but the type coercion will do the right thing for it, so we
         * don't need to take the overhead from being explicit about that.
         */
        hitTestPoint(globalX: number, globalY: number, shapeFlag: boolean): boolean;
        /**
         * Internal implementation of all point intersection checks.
         *
         * _containsPoint is used for
         *  - mouse/drop target finding
         *  - getObjectsUnderPoint
         *  - hitTestPoint
         *
         * Mouse/Drop target finding and getObjectsUnderPoint require checking against the exact shape,
         * and making sure that the checked coordinates aren't hidden through masking or clipping.
         *
         * hitTestPoint never checks for clipping, and masking only for testingType HitTestShape.
         *
         * The `objects` object is used for collecting objects for `getObjectsUnderPoint` or looking
         * for a drop target. If it is supplied, objects for which `_containsPointDirectly` is true are
         * added to it.
         *
         * Overridden in DisplayObjectContainer, Sprite and SimpleButton.
         */
        _containsPoint(globalX: number, globalY: number, localX: number, localY: number, testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult;
        _containsGlobalPoint(globalX: number, globalY: number, testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult;
        /**
         * Fast check if a point can intersect the receiver object. Returns true if
         * - the object is visible OR hit testing is performed for one of the `hitTest{Point,Object}`
         *   methods.
         * - the point is within the receiver's bounds
         * - for testingType values other than HitTestBounds, the point intersects with the a mask,
         *   if the object has one.
         *
         * Note that the callers are expected to have both local and global coordinates available
         * anyway, so _boundsAndMaskContainPoint takes both to avoid recalculating them.
         */
        _boundsAndMaskContainPoint(globalX: number, globalY: number, localX: number, localY: number, testingType: HitTestingType): HitTestingResult;
        /**
         * Tests if the receiver's own visual content intersects with the given point.
         * In the base implementation, this just returns false, because not all DisplayObjects can
         * ever match.
         * Overridden in Shape, MorphShape, Sprite, Bitmap, Video, and TextField.
         */
        _containsPointDirectly(localX: number, localY: number, globalX: number, globalY: number): boolean;
        scrollRect: flash.geom.Rectangle;
        _getScrollRect(): flash.geom.Rectangle;
        /**
         * Sets the opaque background color. By default this is |null|, which indicates that no opaque
         * color is set. Otherwise this is an unsinged number.
         */
        opaqueBackground: any;
        /**
         * Returns the distance between this object and a given ancestor.
         */
        private _getDistance(ancestor);
        /**
         * Finds the nearest common ancestor with a given node.
         */
        findNearestCommonAncestor(node: DisplayObject): DisplayObject;
        /**
         * Returns the current mouse position relative to this object.
         */
        _getLocalMousePosition(): flash.geom.Point;
        mouseX: number;
        mouseY: number;
        debugName(withFlags?: boolean): string;
        debugNameShort(): string;
        hashCode(): number;
        getAncestorCount(): number;
        debugTrace(writer?: IndentingWriter, maxDistance?: number, name?: string): void;
        _addReference(): void;
        _removeReference(): void;
        /**
         * Returns script precedence sequence based on placeObjectTag. Creates every
         * time a new array, so it's safe to modify it.
         * @private
         */
        _getScriptPrecedence(): number[];
        accessibilityProperties: flash.accessibility.AccessibilityProperties;
        blendShader: any;
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
declare module Shumway.AVMX.AS.flash.display {
    class Bitmap extends flash.display.DisplayObject {
        static classInitializer: any;
        _symbol: BitmapSymbol;
        applySymbol(): void;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(bitmapData?: flash.display.BitmapData, pixelSnapping?: string, smoothing?: boolean);
        _pixelSnapping: string;
        _smoothing: boolean;
        _bitmapData: flash.display.BitmapData;
        pixelSnapping: string;
        smoothing: boolean;
        bitmapData: flash.display.BitmapData;
        _getContentBounds(includeStrokes?: boolean): Bounds;
        _containsPointDirectly(localX: number, localY: number, globalX: number, globalY: number): boolean;
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
declare module Shumway.AVMX.AS.flash.display {
    class Shape extends flash.display.DisplayObject {
        static axClass: typeof Shape;
        static classInitializer: any;
        _symbol: ShapeSymbol;
        applySymbol(): void;
        constructor();
        protected _initializeFields(): void;
        _canHaveGraphics(): boolean;
        _getGraphics(): flash.display.Graphics;
        graphics: flash.display.Graphics;
        _containsPointDirectly(localX: number, localY: number, globalX: number, globalY: number): boolean;
    }
    class ShapeSymbol extends Timeline.DisplaySymbol {
        graphics: flash.display.Graphics;
        constructor(data: Timeline.SymbolData, symbolClass: ASClass);
        static FromData(data: Timeline.SymbolData, loaderInfo: flash.display.LoaderInfo): ShapeSymbol;
        processRequires(dependencies: any[], loaderInfo: flash.display.LoaderInfo): void;
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
declare module Shumway.AVMX.AS.flash.display {
    class InteractiveObject extends flash.display.DisplayObject {
        static classInitializer: any;
        constructor();
        protected _initializeFields(): void;
        _tabEnabled: boolean;
        _tabIndex: number;
        _focusRect: any;
        _mouseEnabled: boolean;
        _doubleClickEnabled: boolean;
        _accessibilityImplementation: flash.accessibility.AccessibilityImplementation;
        _softKeyboardInputAreaOfInterest: flash.geom.Rectangle;
        _needsSoftKeyboard: boolean;
        _contextMenu: flash.ui.ContextMenu;
        tabEnabled: boolean;
        tabIndex: number;
        /**
         * The given |focusRect| can be one of: |true|, |false| or |null|.
         */
        focusRect: any;
        mouseEnabled: boolean;
        doubleClickEnabled: boolean;
        accessibilityImplementation: flash.accessibility.AccessibilityImplementation;
        softKeyboardInputAreaOfInterest: flash.geom.Rectangle;
        needsSoftKeyboard: boolean;
        contextMenu: flash.ui.ContextMenu;
        requestSoftKeyboard(): boolean;
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
declare module Shumway.AVMX.AS.flash.display {
    class SimpleButton extends flash.display.InteractiveObject {
        static axClass: typeof SimpleButton;
        static classInitializer: any;
        _symbol: ButtonSymbol;
        applySymbol(): void;
        protected _initializeFields(): void;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(upState?: flash.display.DisplayObject, overState?: flash.display.DisplayObject, downState?: flash.display.DisplayObject, hitTestState?: flash.display.DisplayObject);
        _initFrame(advance: boolean): void;
        _constructFrame(): void;
        private _useHandCursor;
        private _enabled;
        private _trackAsMenu;
        private _upState;
        private _overState;
        private _downState;
        private _hitTestState;
        private _currentState;
        useHandCursor: boolean;
        enabled: boolean;
        trackAsMenu: boolean;
        upState: flash.display.DisplayObject;
        overState: flash.display.DisplayObject;
        downState: flash.display.DisplayObject;
        hitTestState: flash.display.DisplayObject;
        soundTransform: flash.media.SoundTransform;
        /**
         * Override of DisplayObject#_containsPoint that applies the test on hitTestState if
         * that is defined.
         */
        _containsPoint(globalX: number, globalY: number, localX: number, localY: number, testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult;
        /**
         * Override of DisplayObject#_getChildBounds that retrieves the current hitTestState's bounds.
         */
        _getChildBounds(bounds: Bounds, includeStrokes: boolean): void;
        _propagateFlagsDown(flags: DisplayObjectFlags): void;
        _updateButton(): void;
    }
    class ButtonState {
        symbol: Timeline.DisplaySymbol;
        placeObjectTag: SWF.Parser.PlaceObjectTag;
        constructor(symbol: Timeline.DisplaySymbol, placeObjectTag: SWF.Parser.PlaceObjectTag);
    }
    class ButtonSymbol extends Timeline.DisplaySymbol {
        upState: ButtonState;
        overState: ButtonState;
        downState: ButtonState;
        hitTestState: ButtonState;
        loaderInfo: flash.display.LoaderInfo;
        constructor(data: Timeline.SymbolData, loaderInfo: flash.display.LoaderInfo);
        static FromData(data: any, loaderInfo: flash.display.LoaderInfo): ButtonSymbol;
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
declare module Shumway.AVMX.AS.flash.display {
    const enum LookupChildOptions {
        DEFAULT = 0,
        IGNORE_CASE = 1,
        INCLUDE_NON_INITIALIZED = 2,
    }
    class DisplayObjectContainer extends flash.display.InteractiveObject {
        static bindings: string[];
        static classSymbols: string[];
        static classInitializer: any;
        constructor();
        protected _initializeFields(): void;
        private _tabChildren;
        private _mouseChildren;
        /**
         * This object's children have changed.
         */
        private _invalidateChildren();
        /**
         * Propagates flags down the display list. Propagation stops if all flags are already set.
         */
        _propagateFlagsDown(flags: DisplayObjectFlags): void;
        /**
         * Calls the constructors of new children placed by timeline commands.
         */
        _constructChildren(): void;
        _enqueueFrameScripts(): void;
        numChildren: number;
        _getNumChildren(): number;
        textSnapshot: flash.text.TextSnapshot;
        tabChildren: boolean;
        _getTabChildren(): boolean;
        _setTabChildren(enable: boolean): void;
        mouseChildren: boolean;
        _getMouseChildren(): boolean;
        _setMouseChildren(enable: boolean): void;
        addChild(child: DisplayObject): DisplayObject;
        /**
         * Adds a child at a given index. The index must be within the range [0 ... children.length].
         * Note that this is different than the range setChildIndex expects.
         */
        addChildAt(child: DisplayObject, index: number): DisplayObject;
        /**
         * Adds a timeline object to this container. The new child is added after the last object that
         * exists at a smaller depth, or before the first object that exists at a greater depth. If no
         * other timeline object is found, the new child is added to the front(top) of all other
         * children.
         *
         * Note that this differs from `addChildAt` in that the depth isn't an index in the `children`
         * array, and doesn't have to be in the dense range [0..children.length].
         */
        addTimelineObjectAtDepth(child: flash.display.DisplayObject, depth: number): void;
        removeChild(child: DisplayObject): DisplayObject;
        removeChildAt(index: number): DisplayObject;
        getChildIndex(child: DisplayObject): number;
        /**
         * Sets the index of a child. The index must be within the range [0 ... children.length - 1].
         */
        setChildIndex(child: DisplayObject, index: number): void;
        getChildAt(index: number): DisplayObject;
        /**
         * Returns the timeline object that exists at the specified depth.
         */
        getTimelineObjectAtDepth(depth: number): flash.display.DisplayObject;
        /**
         * Returns the last child index that is covered by the clip depth.
         */
        getClipDepthIndex(depth: number): number;
        getChildByName(name: string): DisplayObject;
        /**
         * Returns the child display object instance that exists at given index without creating a
         * reference nor taking ownership.
         */
        _lookupChildByIndex(index: number, options: LookupChildOptions): DisplayObject;
        /**
         * Returns the child display object that exists with given name without creating a reference
         * nor taking ownership.
         */
        _lookupChildByName(name: string, options: LookupChildOptions): DisplayObject;
        /**
         * Override of DisplayObject#_containsPoint that takes children into consideration.
         */
        _containsPoint(globalX: number, globalY: number, localX: number, localY: number, testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult;
        _containsPointImpl(globalX: number, globalY: number, localX: number, localY: number, testingType: HitTestingType, objects: DisplayObject[], skipBoundsCheck: boolean): HitTestingResult;
        private _getUnclippedChildren(testingType, globalX, globalY);
        /**
         * Override of DisplayObject#_getChildBounds that union all childrens's
         * bounds into the bounds.
         */
        _getChildBounds(bounds: Bounds, includeStrokes: boolean): void;
        /**
         * Returns an array of all leaf objects under the given point in global coordinates.
         * A leaf node in this context is an object that itself contains visual content, so it can be
         * any of Shape, Sprite, MovieClip, Bitmap, Video, and TextField.
         * Note that, while the Flash documentation makes it sound like it doesn't, the result also
         * contains the receiver object if that matches the criteria above.
         */
        getObjectsUnderPoint(globalPoint: flash.geom.Point): ASArray;
        areInaccessibleObjectsUnderPoint(point: flash.geom.Point): boolean;
        contains(child: DisplayObject): boolean;
        swapChildrenAt(index1: number, index2: number): void;
        private _swapChildrenAt(index1, index2);
        swapChildren(child1: DisplayObject, child2: DisplayObject): void;
        removeChildren(beginIndex?: number, endIndex?: number): void;
        hashCode(): number;
        /**
         * This is a very slow recursive function that should not be used in performance critical code.
         */
        getAncestorCount(): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class JointStyle extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static ROUND: string;
        static BEVEL: string;
        static MITER: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class CapsStyle extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static ROUND: string;
        static NONE: string;
        static SQUARE: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class LineScaleMode extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static NORMAL: string;
        static VERTICAL: string;
        static HORIZONTAL: string;
        static NONE: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class GradientType extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static LINEAR: string;
        static RADIAL: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class SpreadMethod extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static PAD: string;
        static REFLECT: string;
        static REPEAT: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class InterpolationMethod extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static RGB: string;
        static LINEAR_RGB: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class GraphicsBitmapFill extends ASObject implements IGraphicsFill, IGraphicsData {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(bitmapData?: flash.display.BitmapData, matrix?: flash.geom.Matrix, repeat?: boolean, smooth?: boolean);
        bitmapData: flash.display.BitmapData;
        matrix: flash.geom.Matrix;
        repeat: boolean;
        smooth: boolean;
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
declare module Shumway.AVMX.AS.flash.display {
    class GraphicsEndFill extends ASObject implements IGraphicsFill, IGraphicsData {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
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
declare module Shumway.AVMX.AS.flash.display {
    class GraphicsGradientFill extends ASObject implements IGraphicsFill, IGraphicsData {
        static classInitializer: any;
        constructor(type?: string, colors?: ASArray, alphas?: ASArray, ratios?: ASArray, matrix?: any, spreadMethod?: any, interpolationMethod?: string, focalPointRatio?: number);
        colors: ASArray;
        alphas: ASArray;
        ratios: ASArray;
        matrix: flash.geom.Matrix;
        focalPointRatio: number;
        type: string;
        spreadMethod: any;
        interpolationMethod: string;
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
declare module Shumway.AVMX.AS.flash.display {
    class GraphicsPath extends ASObject implements IGraphicsPath, IGraphicsData {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(commands?: Int32Vector, data?: Int32Vector, winding?: string);
        commands: Int32Vector;
        data: Int32Vector;
        _winding: string;
        winding: string;
        moveTo: (x: number, y: number) => void;
        lineTo: (x: number, y: number) => void;
        curveTo: (controlX: number, controlY: number, anchorX: number, anchorY: number) => void;
        cubicCurveTo: (controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number) => void;
        wideLineTo: (x: number, y: number) => void;
        wideMoveTo: (x: number, y: number) => void;
        ensureLists: () => void;
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
declare module Shumway.AVMX.AS.flash.display {
    class GraphicsPathCommand extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static NO_OP: number;
        static MOVE_TO: number;
        static LINE_TO: number;
        static CURVE_TO: number;
        static WIDE_MOVE_TO: number;
        static WIDE_LINE_TO: number;
        static CUBIC_CURVE_TO: number;
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
declare module Shumway.AVMX.AS.flash.display {
    class GraphicsPathWinding extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static EVEN_ODD: string;
        static NON_ZERO: string;
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
declare module Shumway.AVMX.AS.flash.display {
    class GraphicsSolidFill extends ASObject implements IGraphicsFill, IGraphicsData {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(color?: number, alpha?: number);
        color: number;
        alpha: number;
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
declare module Shumway.AVMX.AS.flash.display {
    class GraphicsStroke extends ASObject implements IGraphicsStroke, IGraphicsData {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(thickness?: number, pixelHinting?: boolean, scaleMode?: string, caps?: string, joints?: string, miterLimit?: number, fill?: flash.display.IGraphicsFill);
        thickness: number;
        pixelHinting: boolean;
        miterLimit: number;
        fill: flash.display.IGraphicsFill;
        scaleMode: string;
        caps: string;
        joints: string;
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
declare module Shumway.AVMX.AS.flash.display {
    class GraphicsTrianglePath extends ASObject implements IGraphicsPath, IGraphicsData {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(vertices?: Float64Vector, indices?: Int32Vector, uvtData?: Float64Vector, culling?: string);
        indices: Int32Vector;
        vertices: Float64Vector;
        uvtData: Float64Vector;
        _culling: string;
        culling: string;
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
declare module Shumway.AVMX.AS.flash.display {
    interface IDrawCommand {
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
declare module Shumway.AVMX.AS.flash.display {
    interface IGraphicsData {
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
declare module Shumway.AVMX.AS.flash.display {
    interface IGraphicsFill {
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
declare module Shumway.AVMX.AS.flash.display {
    interface IGraphicsPath {
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
declare module Shumway.AVMX.AS.flash.display {
    interface IGraphicsStroke {
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
declare module Shumway.AVMX.AS.flash.display {
    import Bounds = Shumway.Bounds;
    import DisplayObject = flash.display.DisplayObject;
    import ShapeData = Shumway.ShapeData;
    class Graphics extends ASObject implements Shumway.Remoting.IRemotable {
        static classInitializer: any;
        constructor();
        static FromData(data: any, loaderInfo: LoaderInfo): Graphics;
        getGraphicsData(): ShapeData;
        getUsedTextures(): BitmapData[];
        _id: number;
        private _graphicsData;
        private _textures;
        private _lastX;
        private _lastY;
        private _boundsIncludeLastCoordinates;
        /**
         * Determine by how much the lineBounds are larger than the fillBounds.
         */
        private _topLeftStrokeWidth;
        private _bottomRightStrokeWidth;
        /**
         * Indicates whether this graphics object has changed since the last time it was synchronized.
         */
        _isDirty: boolean;
        /**
         * Flash special-cases lines that are 1px and 3px wide.
         * They're offset by 0.5px to the bottom-right.
         */
        private _setStrokeWidth(width);
        /**
         * Bounding box excluding strokes.
         */
        private _fillBounds;
        /**
         * Bounding box including strokes.
         */
        private _lineBounds;
        /**
         * Back reference to the display object that references this graphics object. This is
         * needed so that we can propagate invalid / dirty bits whenever the graphics object
         * changes.
         */
        _parent: DisplayObject;
        _setParent(parent: DisplayObject): void;
        _invalidate(): void;
        _getContentBounds(includeStrokes?: boolean): Bounds;
        clear(): void;
        /**
         * Sets a solid color and opacity as the fill for subsequent drawing commands.
         *
         * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/display/Graphics.html#beginFill%28%29
         * @param color
         * @param alpha While any Number is a valid input, the value is clamped to [0,1] and then scaled
         * to an integer in the interval [0,0xff].
         */
        beginFill(color: number, alpha?: number): void;
        beginGradientFill(type: string, colors: ASArray, alphas: ASArray, ratios: ASArray, matrix?: flash.geom.Matrix, spreadMethod?: string, interpolationMethod?: string, focalPointRatio?: number): void;
        beginBitmapFill(bitmap: flash.display.BitmapData, matrix?: flash.geom.Matrix, repeat?: boolean, smooth?: boolean): void;
        endFill(): void;
        lineStyle(thickness: number, color?: number, alpha?: number, pixelHinting?: boolean, scaleMode?: string, caps?: string, joints?: string, miterLimit?: number): void;
        lineGradientStyle(type: string, colors: ASArray, alphas: ASArray, ratios: ASArray, matrix?: flash.geom.Matrix, spreadMethod?: string, interpolationMethod?: string, focalPointRatio?: number): void;
        lineBitmapStyle(bitmap: flash.display.BitmapData, matrix?: flash.geom.Matrix, repeat?: boolean, smooth?: boolean): void;
        drawRect(x: number, y: number, width: number, height: number): void;
        drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number, ellipseHeight: number): void;
        drawRoundRectComplex(x: number, y: number, width: number, height: number, topLeftRadius: number, topRightRadius: number, bottomLeftRadius: number, bottomRightRadius: number): void;
        drawCircle(x: number, y: number, radius: number): void;
        /**
         * Here x and y are the top-left coordinates of the bounding box of the
         * ellipse not the center as is the case for circles.
         */
        drawEllipse(x: number, y: number, width: number, height: number): void;
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void;
        cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void;
        copyFrom(sourceGraphics: flash.display.Graphics): void;
        drawPath(commands: GenericVector, data: GenericVector, winding?: string): void;
        drawTriangles(vertices: GenericVector, indices?: GenericVector, uvtData?: GenericVector, culling?: string): void;
        drawGraphicsData(graphicsData: GenericVector): void;
        /**
         * Tests if the specified point is within this graphics path.
         */
        _containsPoint(x: number, y: number, includeLines: boolean, ratio: number): boolean;
        private _fillContainsPoint(x, y, ratio);
        private _linesContainsPoint(x, y, ratio);
        /**
         * Bitmaps are specified the same for fills and strokes, so we only need to serialize them
         * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
         * be one of PathCommand.BeginBitmapFill and PathCommand.LineStyleBitmap.
         *
         * This method doesn't actually write anything if the `skipWrite` argument is true. In that
         * case, it only does arguments checks so the right exceptions are thrown.
         */
        private _writeBitmapStyle(pathCommand, bitmap, matrix, repeat, smooth, skipWrite);
        /**
         * Gradients are specified the same for fills and strokes, so we only need to serialize them
         * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
         * be one of PathCommand.BeginGradientFill and PathCommand.LineStyleGradient.
         *
         * This method doesn't actually write anything if the `skipWrite` argument is true. In that
         * case, it only does arguments checks so the right exceptions are thrown.
         */
        private _writeGradientStyle(pathCommand, type, colors_, alphas_, ratios_, matrix, spreadMethod, interpolationMethod, focalPointRatio, skipWrite);
        private _extendBoundsByPoint(x, y);
        private _extendBoundsByX(x);
        private _extendBoundsByY(y);
        private _applyLastCoordinates(x, y);
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
declare module Shumway.AVMX.AS.flash.display {
    import Timeline = Shumway.Timeline;
    class Sprite extends flash.display.DisplayObjectContainer {
        static classInitializer: any;
        _symbol: SpriteSymbol;
        applySymbol(): void;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        protected _initializeFields(): void;
        private _buttonMode;
        private _dropTarget;
        private _hitArea;
        private _useHandCursor;
        private _dragMode;
        private _dragDeltaX;
        private _dragDeltaY;
        private _dragBounds;
        _hitTarget: flash.display.Sprite;
        _addFrame(frame: Shumway.SWF.SWFFrame): void;
        _initializeChildren(frame: Shumway.SWF.SWFFrame): void;
        _processControlTags(tags: any[], backwards: boolean): void;
        _removeAnimatedChild(child: flash.display.DisplayObject): void;
        _canHaveGraphics(): boolean;
        _getGraphics(): flash.display.Graphics;
        graphics: flash.display.Graphics;
        buttonMode: boolean;
        dropTarget: flash.display.DisplayObject;
        hitArea: flash.display.Sprite;
        useHandCursor: boolean;
        soundTransform: flash.media.SoundTransform;
        /**
         * Returns the current mouse position relative to this object.
         */
        _getDragMousePosition(): flash.geom.Point;
        startDrag(lockCenter?: boolean, bounds?: flash.geom.Rectangle): void;
        stopDrag(): void;
        _updateDragState(dropTarget?: DisplayObject): void;
        startTouchDrag(touchPointID: number, lockCenter?: boolean, bounds?: flash.geom.Rectangle): void;
        stopTouchDrag(touchPointID: number): void;
        _containsPoint(globalX: number, globalY: number, localX: number, localY: number, testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult;
        _containsPointDirectly(localX: number, localY: number, globalX: number, globalY: number): boolean;
    }
    class SpriteSymbol extends Timeline.DisplaySymbol {
        numFrames: number;
        frames: any[];
        labels: flash.display.FrameLabel[];
        isRoot: boolean;
        avm1Name: string;
        loaderInfo: flash.display.LoaderInfo;
        constructor(data: Timeline.SymbolData, loaderInfo: flash.display.LoaderInfo);
        static FromData(data: any, loaderInfo: flash.display.LoaderInfo): SpriteSymbol;
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
declare module Shumway.AVMX.AS.flash.display {
    /**
     * Controls how to behave on inter-frame navigation.
     */
    const enum FrameNavigationModel {
        SWF1 = 1,
        SWF9 = 9,
        SWF10 = 10,
    }
    interface FrameScript {
        (any?: any): any;
        precedence?: number[];
        context?: MovieClip;
    }
    class MovieClip extends flash.display.Sprite implements IAdvancable {
        static frameNavigationModel: FrameNavigationModel;
        static axClass: typeof MovieClip;
        private static _callQueue;
        static classInitializer(): void;
        static reset(): void;
        static classSymbols: string[];
        static instanceSymbols: string[];
        static runFrameScripts(): void;
        static runAvm1FrameScripts(): void;
        applySymbol(): void;
        private _initAvm1Data();
        private _initAvm1FrameData(frameIndex, frameInfo);
        private _addAvm1FrameScripts(frameIndex, actionsBlocks);
        /**
         * AVM1 InitActionBlocks are executed once, before the children are initialized for a frame.
         * That matches AS3's enterFrame event, so we can add an event listener that just bails
         * as long as the target frame isn't reached, and executes the InitActionBlock once it is.
         *
         * After that, the listener removes itself.
         */
        private _addAvm1InitActionBlocks(frameIndex, actionsBlocks);
        /**
         * Field holding the as2 object associated with this MovieClip instance.
         *
         * This field is only ever populated by the AVM1 runtime, so can only be used for MovieClips
         * used in the implementation of an AVM1 display list.
         */
        private _as2Object;
        removeChildAt(index: number): DisplayObject;
        constructor();
        protected _initializeFields(): void;
        _addFrame(frameInfo: any): void;
        _initFrame(advance: boolean): void;
        _constructFrame(): void;
        _enqueueFrameScripts(): void;
        private _currentFrame;
        private _nextFrame;
        private _totalFrames;
        private _frames;
        private _frameScripts;
        private _scenes;
        private _enabled;
        private _isPlaying;
        private _stopped;
        private _trackAsMenu;
        private _allowFrameNavigation;
        private _sounds;
        private _buttonFrames;
        private _currentButtonState;
        currentFrame: number;
        framesLoaded: number;
        totalFrames: number;
        trackAsMenu: boolean;
        scenes: ASArray;
        currentScene: Scene;
        currentLabel: string;
        currentLabels: {
            value: FrameLabel[];
        };
        currentFrameLabel: string;
        enabled: boolean;
        isPlaying: boolean;
        play(): void;
        stop(): void;
        /**
         * Resolves frame and scene into absolute frame number. If scene is not specified,
         * the current scene is used. In legacy mode, it might return `undefined` if frame/scene
         * was not found.
         */
        _getAbsFrameNumber(frame: string, sceneName: string): number;
        /**
         * Implementation for both gotoAndPlay and gotoAndStop.
         *
         * Technically, we should throw all errors from those functions directly so the stack is
         * correct.
         * We might at some point do that by explicitly inlining this function using some build step.
         */
        private _gotoFrame(frame, sceneName);
        private _gotoFrameAbs(frame);
        private _advanceFrame();
        private _seekToFrame(frame);
        /**
         * Because that's how it's mostly used, the current frame is stored as an offset into the
         * entire timeline. Sometimes, we need to know which scene it falls into. This utility
         * function answers that.
         */
        private _sceneForFrameIndex(frameIndex);
        /**
         * Frame indices are stored as offsets into the entire timline, whereas labels are stored
         * in their scenes. This utility function iterates over scenes and their labels to find
         * the label clostest to, but not after the target frame.
         */
        private _labelForFrame(frame);
        callFrame(frame: number): void;
        queueAvm1FrameScripts(frame: number, queue: Array<FrameScript>): void;
        nextFrame(): void;
        prevFrame(): void;
        gotoAndPlay(frame: any, scene?: string): void;
        gotoAndStop(frame: any, scene?: string): void;
        /**
         * Takes pairs of `frameIndex`, `script` arguments and adds the `script`s to the `_frameScripts`
         * Array.
         *
         * Undocumented method used to implement the old timeline concept in AS3.
         */
        addFrameScript(frameIndex: number, script: FrameScript): void;
        _isFullyLoaded: boolean;
        _registerStartSounds(frameNum: number, soundStartInfo: any): void;
        _initSoundStream(streamInfo: any): void;
        _addSoundStreamBlock(frameNum: number, streamBlock: any): void;
        private _syncSounds(frameNum);
        addScene(name: string, labels_: FrameLabel[], offset: number, numFrames: number): void;
        addFrameLabel(name: string, frame: number): void;
        prevScene(): void;
        nextScene(): void;
        _containsPointImpl(globalX: number, globalY: number, localX: number, localY: number, testingType: HitTestingType, objects: DisplayObject[], skipBoundsCheck: boolean): HitTestingResult;
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
declare module Shumway.AVMX.AS.flash.display {
    class MovieClipSoundStream {
        private movieClip;
        private data;
        private seekIndex;
        private position;
        private element;
        private soundStreamAdapter;
        private wasFullyLoaded;
        private decode;
        private expectedFrame;
        private waitFor;
        constructor(streamInfo: SWF.Parser.SoundStream, movieClip: MovieClip);
        appendBlock(frameNum: number, streamBlock: Uint8Array): void;
        playFrame(frameNum: number): void;
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
declare module Shumway.AVMX.AS.flash.display {
    class Stage extends flash.display.DisplayObjectContainer {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        /**
         * Indicates whether the stage object has changed since the last time it was synchronized.
         */
        _isDirty: boolean;
        constructor();
        private _frameRate;
        private _scaleMode;
        private _align;
        private _stageWidth;
        private _stageHeight;
        private _showDefaultContextMenu;
        private _focus;
        private _colorCorrection;
        private _colorCorrectionSupport;
        private _stageFocusRect;
        private _quality;
        private _displayState;
        private _fullScreenSourceRect;
        private _mouseLock;
        private _stageVideos;
        private _stage3Ds;
        private _colorARGB;
        private _fullScreenWidth;
        private _fullScreenHeight;
        private _wmodeGPU;
        private _softKeyboardRect;
        private _allowsFullScreen;
        private _allowsFullScreenInteractive;
        private _contentsScaleFactor;
        private _displayContextInfo;
        private _timeout;
        private _stageContainerWidth;
        private _stageContainerHeight;
        /**
         * The |invalidate| function was called on the stage. This flag indicates that
         * the |RENDER| event gets fired right before the stage is rendered.
         */
        private _invalidated;
        setRoot(root: MovieClip): void;
        frameRate: number;
        scaleMode: string;
        align: string;
        stageWidth: number;
        _setInitialName(): void;
        /**
         * Non-AS3-available setter. In AS3, the `stageWidth` setter is silently ignored.
         */
        setStageWidth(value: number): void;
        stageHeight: number;
        /**
         * Non-AS3-available setter. In AS3, the `stageHeight` setter is silently ignored.
         */
        setStageHeight(value: number): void;
        /**
         * Almost the same as color setter, except it preserves alpha channel.
         * @param value
         */
        setStageColor(value: number): void;
        /**
         * Non-AS3-available setter. Notifies the stage that the dimensions of the stage container have changed.
         */
        setStageContainerSize(width: number, height: number, pixelRatio: number): void;
        showDefaultContextMenu: boolean;
        focus: flash.display.InteractiveObject;
        colorCorrection: string;
        colorCorrectionSupport: string;
        stageFocusRect: boolean;
        quality: string;
        displayState: string;
        fullScreenSourceRect: flash.geom.Rectangle;
        mouseLock: boolean;
        stageVideos: any;
        stage3Ds: GenericVector;
        color: number;
        alpha: number;
        fullScreenWidth: number;
        fullScreenHeight: number;
        wmodeGPU: boolean;
        softKeyboardRect: flash.geom.Rectangle;
        allowsFullScreen: boolean;
        allowsFullScreenInteractive: boolean;
        contentsScaleFactor: number;
        displayContextInfo: string;
        removeChildAt(index: number): flash.display.DisplayObject;
        swapChildrenAt(index1: number, index2: number): void;
        width: number;
        height: number;
        mouseChildren: boolean;
        numChildren: number;
        tabChildren: boolean;
        addChild(child: DisplayObject): DisplayObject;
        addChildAt(child: DisplayObject, index: number): DisplayObject;
        setChildIndex(child: DisplayObject, index: number): void;
        addEventListener(type: string, listener: (event: events.Event) => void, useCapture: boolean, priority: number, useWeakReference: boolean): void;
        hasEventListener(type: string): boolean;
        willTrigger(type: string): boolean;
        dispatchEvent(event: events.Event): boolean;
        invalidate(): void;
        isFocusInaccessible(): boolean;
        requireOwnerPermissions(): void;
        render(): void;
        name: string;
        mask: DisplayObject;
        visible: boolean;
        x: number;
        y: number;
        z: number;
        scaleX: number;
        scaleY: number;
        scaleZ: number;
        rotation: number;
        rotationX: number;
        rotationY: number;
        rotationZ: number;
        cacheAsBitmap: boolean;
        opaqueBackground: any;
        scrollRect: flash.geom.Rectangle;
        filters: ASArray;
        blendMode: string;
        transform: flash.geom.Transform;
        accessibilityProperties: flash.accessibility.AccessibilityProperties;
        scale9Grid: flash.geom.Rectangle;
        tabEnabled: boolean;
        tabIndex: number;
        focusRect: any;
        mouseEnabled: boolean;
        accessibilityImplementation: flash.accessibility.AccessibilityImplementation;
        textSnapshot: text.TextSnapshot;
        contextMenu: flash.ui.ContextMenu;
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
declare module Shumway.AVMX.AS.flash.display {
    class ActionScriptVersion extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static ACTIONSCRIPT2: number;
        static ACTIONSCRIPT3: number;
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
declare module Shumway.AVMX.AS.flash.display {
    class BlendMode extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static NORMAL: string;
        static LAYER: string;
        static MULTIPLY: string;
        static SCREEN: string;
        static LIGHTEN: string;
        static DARKEN: string;
        static ADD: string;
        static SUBTRACT: string;
        static DIFFERENCE: string;
        static INVERT: string;
        static OVERLAY: string;
        static HARDLIGHT: string;
        static ALPHA: string;
        static ERASE: string;
        static SHADER: string;
        /**
         * Returns the blend mode string from the numeric value that appears in the
         * swf file.
         */
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class ColorCorrection extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static DEFAULT: string;
        static ON: string;
        static OFF: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class ColorCorrectionSupport extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static UNSUPPORTED: string;
        static DEFAULT_ON: string;
        static DEFAULT_OFF: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class FocusDirection extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static TOP: string;
        static BOTTOM: string;
        static NONE: string;
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
declare module Shumway.AVMX.AS.flash.display {
    class FrameLabel extends flash.events.EventDispatcher {
        static classInitializer: any;
        constructor(name: string, frame: number);
        private _name;
        private _frame;
        name: string;
        frame: number;
        clone(): FrameLabel;
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
declare module Shumway.AVMX.AS.flash.display {
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    /**
     * Holds blobs of bitmap data in various formats and lets you do basic pixel operations. When
     * data is unpacked, it is stored as premultiplied ARGB since it's what the SWF encodes bitmaps
     * as.  This way we don't have to do unecessary byte conversions.
     */
    class BitmapData extends ASObject implements IBitmapDrawable, Shumway.Remoting.IRemotable {
        static axClass: typeof BitmapData;
        static classInitializer(): void;
        _symbol: BitmapSymbol;
        applySymbol(): void;
        static MAXIMUM_WIDTH: number;
        static MAXIMUM_HEIGHT: number;
        static MAXIMUM_DIMENSION: number;
        constructor(width: number, height: number, transparent?: boolean, fillColorARGB?: number);
        private _setData(data, type);
        /**
         * Back references to Bitmaps that use this BitmapData. These objects need to be marked as dirty
         * when this bitmap data becomes dirty.
         */
        private _bitmapReferrers;
        _addBitmapReferrer(bitmap: flash.display.Bitmap): void;
        _removeBitmapReferrer(bitmap: flash.display.Bitmap): void;
        /**
         * Called whenever the contents of this bitmap data changes.
         */
        private _invalidate();
        _transparent: boolean;
        _rect: flash.geom.Rectangle;
        _id: number;
        _locked: boolean;
        /**
         * Image format stored in the |_data| buffer.
         */
        _type: ImageType;
        /**
         * Actual image bytes as raw pixel data of the format given by `_type`.
         */
        _data: Uint8Array;
        /**
         * Data buffer wrapped around the |_data| buffer.
         */
        _dataBuffer: DataBuffer;
        /**
         * Int32Array view on |_data| useful when working with 4 bytes at a time. Endianess is
         * important here, so if |_type| is PremultipliedAlphaARGB as is usually the case for
         * bitmap data, then |_view| values are actually BGRA (on little-endian machines).
         */
        _view: Int32Array;
        /**
         * Indicates whether this bitmap data's data buffer has changed since the last time it was
         * synchronized.
         */
        _isDirty: boolean;
        /**
         * Indicates whether this bitmap data's data buffer has changed on the remote end and needs to
         * be read back before any pixel operations can be performed.
         */
        _isRemoteDirty: boolean;
        /**
         * If non-null then this value indicates that the bitmap is filled with a solid color. This is
         * useful for optimizations.
         */
        _solidFillColorPBGRA: any;
        /**
         * Temporary rectangle that is used to prevent allocation.
         */
        private static _temporaryRectangle;
        private _getTemporaryRectangleFrom(rect);
        getDataBuffer(): DataBuffer;
        _getContentBounds(): Bounds;
        /**
         * TODO: Not tested.
         */
        private _getPixelData(rect);
        /**
         * TODO: Not tested.
         */
        private _putPixelData(rect, input);
        width: number;
        height: number;
        rect: flash.geom.Rectangle;
        transparent: boolean;
        clone(): flash.display.BitmapData;
        /**
         * Returns an straight alpha RGB pixel value 0x00RRGGBB.
         */
        getPixel(x: number, y: number): number;
        /**
         * Returns an straight alpha ARGB pixel value 0xAARRGGBB.
         */
        getPixel32(x: number, y: number): number;
        setPixel(x: number, y: number, uARGB: number): void;
        setPixel32(x: number, y: number, uARGB: number): void;
        applyFilter(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, filter: flash.filters.BitmapFilter): void;
        colorTransform(rect: flash.geom.Rectangle, colorTransform: flash.geom.ColorTransform): void;
        compare(otherBitmapData: flash.display.BitmapData): ASObject;
        copyChannel(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, sourceChannel: number, destChannel: number): void;
        /**
         * Copies a rectangular region of pixels into the current bitmap data.
         */
        copyPixels(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, alphaBitmapData?: flash.display.BitmapData, alphaPoint?: flash.geom.Point, mergeAlpha?: boolean): void;
        private _copyPixelsAndMergeAlpha(s, sX, sY, sStride, t, tX, tY, tStride, tW, tH);
        dispose(): void;
        draw(source: flash.display.IBitmapDrawable, matrix?: flash.geom.Matrix, colorTransform?: flash.geom.ColorTransform, blendMode?: string, clipRect?: flash.geom.Rectangle, smoothing?: boolean): void;
        drawWithQuality(source: flash.display.IBitmapDrawable, matrix?: flash.geom.Matrix, colorTransform?: flash.geom.ColorTransform, blendMode?: string, clipRect?: flash.geom.Rectangle, smoothing?: boolean, quality?: string): void;
        fillRect(rect: flash.geom.Rectangle, uARGB: number): void;
        floodFill(x: number, y: number, color: number): void;
        generateFilterRect(sourceRect: flash.geom.Rectangle, filter: flash.filters.BitmapFilter): flash.geom.Rectangle;
        getColorBoundsRect(mask: number, color: number, findColor?: boolean): flash.geom.Rectangle;
        getPixels(rect: flash.geom.Rectangle): flash.utils.ByteArray;
        copyPixelsToByteArray(rect: flash.geom.Rectangle, data: flash.utils.ByteArray): void;
        getVector(rect: flash.geom.Rectangle): Uint32Vector;
        hitTest(firstPoint: flash.geom.Point, firstAlphaThreshold: number, secondObject: ASObject, secondBitmapDataPoint?: flash.geom.Point, secondAlphaThreshold?: number): boolean;
        merge(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number): void;
        noise(randomSeed: number, low?: number, high?: number, channelOptions?: number, grayScale?: boolean): void;
        paletteMap(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, redArray?: any[], greenArray?: any[], blueArray?: any[], alphaArray?: any[]): void;
        perlinNoise(baseX: number, baseY: number, numOctaves: number, randomSeed: number, stitch: boolean, fractalNoise: boolean, channelOptions?: number, grayScale?: boolean, offsets?: any[]): void;
        pixelDissolve(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, randomSeed?: number, numPixels?: number, fillColor?: number): number;
        scroll(x: number, y: number): void;
        setPixels(rect: flash.geom.Rectangle, inputByteArray: flash.utils.ByteArray): void;
        setVector(rect: flash.geom.Rectangle, inputVector: Uint32Vector): void;
        threshold(sourceBitmapData: flash.display.BitmapData, sourceRect: flash.geom.Rectangle, destPoint: flash.geom.Point, operation: string, threshold: number, color?: number, mask?: number, copySource?: boolean): number;
        lock(): void;
        unlock(changeRect?: flash.geom.Rectangle): void;
        histogram(hRect?: flash.geom.Rectangle): GenericVector;
        encode(rect: flash.geom.Rectangle, compressor: ASObject, byteArray?: flash.utils.ByteArray): flash.utils.ByteArray;
        /**
         * Ensures that we have the most up-to-date version of the bitmap data. If a call to
         * |BitmpaData.draw| was made since the last time this method was called, then we need to send
         * a synchronous message to the GFX remote requesting the latest image data.
         *
         * Here we also normalize the image format to |ImageType.StraightAlphaRGBA|. We only need the
         * normalized pixel data for pixel operations, so we defer image decoding as late as possible.
         */
        private _ensureBitmapData();
    }
    interface IBitmapDataSerializer {
        drawToBitmap(bitmapData: flash.display.BitmapData, source: flash.display.IBitmapDrawable, matrix: flash.geom.Matrix, colorTransform: flash.geom.ColorTransform, blendMode: string, clipRect: flash.geom.Rectangle, smoothing: boolean): any;
        requestBitmapData(bitmapData: BitmapData): DataBuffer;
    }
    class BitmapSymbol extends Timeline.DisplaySymbol implements Timeline.EagerlyResolvedSymbol {
        width: number;
        height: number;
        syncId: number;
        data: Uint8Array;
        type: ImageType;
        private sharedInstance;
        constructor(data: Timeline.SymbolData, sec: ISecurityDomain);
        static FromData(data: any, loaderInfo: LoaderInfo): BitmapSymbol;
        getSharedInstance(): any;
        createSharedInstance(): any;
        resolveAssetCallback: any;
        private _unboundResolveAssetCallback(data);
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
declare module Shumway.AVMX.AS.flash.display {
    class BitmapDataChannel extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static RED: number;
        static GREEN: number;
        static BLUE: number;
        static ALPHA: number;
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
declare module Shumway.AVMX.AS.flash.display {
    class BitmapEncodingColorSpace extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static COLORSPACE_AUTO: string;
        static COLORSPACE_4_4_4: string;
        static COLORSPACE_4_2_2: string;
        static COLORSPACE_4_2_0: string;
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
declare module Shumway.AVMX.AS.flash.display {
    interface IBitmapDrawable {
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
declare module Shumway.AVMX.AS.flash.display {
    class JPEGEncoderOptions extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(quality?: number);
        quality: number;
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
declare module Shumway.AVMX.AS.flash.display {
    import LoaderContext = flash.system.LoaderContext;
    import events = flash.events;
    import ILoadListener = Shumway.ILoadListener;
    class Loader extends flash.display.DisplayObjectContainer implements IAdvancable, ILoadListener {
        static axClass: typeof Loader;
        static runtimeStartTime: number;
        private static _rootLoader;
        private static _loadQueue;
        private static _embeddedContentLoadCount;
        /**
         * Creates or returns the root Loader instance. The loader property of that instance's
         * LoaderInfo object is always null. Also, no OPEN event ever gets dispatched.
         */
        static getRootLoader(): Loader;
        static reset(): void;
        static classInitializer(): void;
        static classSymbols: string[];
        static instanceSymbols: string[];
        /**
         * In each turn of the event loop, Loader events are processed in two batches:
         * first INIT and COMPLETE events are dispatched for all active Loaders, then
         * OPEN and PROGRESS.
         *
         * A slightly weird result of this is that INIT and COMPLETE are dispatched at
         * least one turn later than the other events: INIT is dispatched after the
         * content has been created. That, in turn, happens under
         * `DisplayObject.performFrameNavigation` in reaction to enough data being
         * marked as available - which happens in the second batch of Loader event
         * processing.
         */
        static processEvents(): void;
        private static processEarlyEvents();
        private static processLateEvents();
        constructor();
        _setStage(stage: Stage): void;
        _initFrame(advance: boolean): void;
        _constructFrame(): void;
        addChild(child: DisplayObject): DisplayObject;
        addChildAt(child: DisplayObject, index: number): DisplayObject;
        removeChild(child: DisplayObject): DisplayObject;
        removeChildAt(index: number): DisplayObject;
        setChildIndex(child: DisplayObject, index: number): void;
        private _content;
        private _contentID;
        private _contentLoaderInfo;
        private _uncaughtErrorEvents;
        private _fileLoader;
        private _imageSymbol;
        private _loadStatus;
        private _loadingType;
        private _queuedLoadUpdate;
        /**
         * No way of knowing what's in |data|, so do a best effort to print out some meaninfgul debug
         * info.
         */
        private _describeData(data);
        content: flash.display.DisplayObject;
        contentLoaderInfo: flash.display.LoaderInfo;
        _getJPEGLoaderContextdeblockingfilter(context: flash.system.LoaderContext): number;
        uncaughtErrorEvents: events.UncaughtErrorEvents;
        private _canLoadSWFFromDomain(url);
        load(request: flash.net.URLRequest, context?: LoaderContext): void;
        loadBytes(data: flash.utils.ByteArray, context?: LoaderContext): void;
        close(): void;
        _unload(stopExecution: boolean, gc: boolean): void;
        unload(): void;
        unloadAndStop(gc: boolean): void;
        private _applyLoaderContext(context);
        onLoadOpen(file: any): void;
        onLoadProgress(update: LoadProgressUpdate): void;
        onNewEagerlyParsedSymbols(dictionaryEntries: SWF.EagerlyParsedDictionaryEntry[], delta: number): Promise<any>;
        onImageBytesLoaded(): void;
        private _applyDecodedImage(symbol);
        private _applyLoadUpdate(update);
        onLoadComplete(): void;
        onLoadError(): void;
        private _addScenesToMovieClip(mc, sceneData, numFrames);
        private createContentRoot(symbol, sceneData);
        private _createAVM1Context();
        /**
         * Create an AVM1Movie container and wrap the root timeline into it.
         * This associates the AVM1Context with this AVM1 MovieClip tree,
         * including potential nested SWFs.
         */
        private _createAVM1Movie(root);
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
declare module Shumway.AVMX.AS.flash.display {
    import SWFFrame = Shumway.SWF.SWFFrame;
    class LoaderInfo extends flash.events.EventDispatcher {
        static classInitializer: any;
        static axClass: typeof LoaderInfo;
        static CtorToken: {};
        constructor(token: Object);
        reset(): void;
        setFile(file: any): void;
        static getLoaderInfoByDefinition(object: Object): flash.display.LoaderInfo;
        _url: string;
        _loaderUrl: string;
        _file: any;
        _bytesLoaded: number;
        _bytesTotal: number;
        _applicationDomain: system.ApplicationDomain;
        _parameters: Object;
        _allowCodeImport: boolean;
        _checkPolicyFile: boolean;
        _width: number;
        _height: number;
        _sharedEvents: flash.events.EventDispatcher;
        _parentSandboxBridge: Object;
        _childSandboxBridge: Object;
        _loader: flash.display.Loader;
        _content: flash.display.DisplayObject;
        _bytes: flash.utils.ByteArray;
        _abcBlocksLoaded: number;
        _mappedSymbolsLoaded: number;
        _fontsLoaded: number;
        _uncaughtErrorEvents: flash.events.UncaughtErrorEvents;
        /**
         * Use this to ignore any user code.
         */
        _allowCodeExecution: boolean;
        _dictionary: Shumway.Timeline.Symbol[];
        _avm1Context: Shumway.AVM1.AVM1Context;
        loaderURL: string;
        url: string;
        isURLInaccessible: boolean;
        bytesLoaded: number;
        bytesTotal: number;
        applicationDomain: flash.system.ApplicationDomain;
        app: AXApplicationDomain;
        swfVersion: number;
        actionScriptVersion: number;
        frameRate: number;
        width: number;
        height: number;
        contentType: string;
        sharedEvents: flash.events.EventDispatcher;
        parentSandboxBridge: Object;
        childSandboxBridge: Object;
        sameDomain: boolean;
        childAllowsParent: boolean;
        parentAllowsChild: boolean;
        loader: flash.display.Loader;
        content: flash.display.DisplayObject;
        bytes: flash.utils.ByteArray;
        parameters: Object;
        uncaughtErrorEvents: flash.events.UncaughtErrorEvents;
        getSymbolResolver(classDefinition: AXClass, symbolId: number): () => any;
        getSymbolById(id: number): Shumway.Timeline.Symbol;
        getRootSymbol(): flash.display.SpriteSymbol;
        private _syncAVM1Attributes(symbol);
        getFrame(sprite: {
            frames: SWFFrame[];
        }, index: number): SWFFrame;
        private resolveClassSymbol(classDefinition, symbolId);
    }
    interface IRootElementService {
        pageUrl: string;
        swfUrl: string;
        loaderUrl: string;
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
declare module Shumway.AVMX.AS.flash.display {
    class MorphShape extends flash.display.DisplayObject {
        static classSymbols: string[];
        static instanceSymbols: string[];
        static axClass: typeof MorphShape;
        static classInitializer: any;
        _symbol: MorphShapeSymbol;
        applySymbol(): void;
        constructor();
        _canHaveGraphics(): boolean;
        _getGraphics(): flash.display.Graphics;
        graphics: flash.display.Graphics;
        _containsPointDirectly(localX: number, localY: number, globalX: number, globalY: number): boolean;
    }
    class MorphShapeSymbol extends flash.display.ShapeSymbol {
        morphFillBounds: Bounds;
        morphLineBounds: Bounds;
        constructor(data: Timeline.SymbolData, sec: ISecurityDomain);
        static FromData(data: any, loaderInfo: flash.display.LoaderInfo): MorphShapeSymbol;
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
declare module Shumway.AVMX.AS.flash.display {
    class NativeMenu extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
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
declare module Shumway.AVMX.AS.flash.display {
    class NativeMenuItem extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        _enabled: boolean;
        enabled: boolean;
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
declare module Shumway.AVMX.AS.flash.display {
    class PNGEncoderOptions extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(fastCompression?: boolean);
        fastCompression: boolean;
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
declare module Shumway.AVMX.AS.flash.display {
    class PixelSnapping extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static NEVER: string;
        static ALWAYS: string;
        static AUTO: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class SWFVersion extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static FLASH1: number;
        static FLASH2: number;
        static FLASH3: number;
        static FLASH4: number;
        static FLASH5: number;
        static FLASH6: number;
        static FLASH7: number;
        static FLASH8: number;
        static FLASH9: number;
        static FLASH10: number;
        static FLASH11: number;
        static FLASH12: number;
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
declare module Shumway.AVMX.AS.flash.display {
    class Scene extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(name: string, labels: {
            value: FrameLabel[];
        }, offset: number, numFrames: number);
        _name: string;
        offset: number;
        _numFrames: number;
        _labels: {
            value: FrameLabel[];
        };
        name: string;
        labels: {
            value: FrameLabel[];
        };
        numFrames: number;
        clone(): Scene;
        getLabelByName(name: string, ignoreCase: boolean): FrameLabel;
        getLabelByFrame(frame: number): FrameLabel;
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
declare module Shumway.AVMX.AS.flash.display {
    class StageAlign extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static TOP: string;
        static LEFT: string;
        static BOTTOM: string;
        static RIGHT: string;
        static TOP_LEFT: string;
        static TOP_RIGHT: string;
        static BOTTOM_LEFT: string;
        static BOTTOM_RIGHT: string;
        static fromNumber(n: number): string;
        /**
         * Looks like the Flash player just searches for the "T", "B", "L", "R" characters and
         * maintains an internal bit field for alignment, for instance it's possible to set the
         * alignment value "TBLR" even though there is no enum for it.
         */
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class StageDisplayState extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static FULL_SCREEN: string;
        static FULL_SCREEN_INTERACTIVE: string;
        static NORMAL: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class StageQuality extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static LOW: string;
        static MEDIUM: string;
        static HIGH: string;
        static BEST: string;
        static HIGH_8X8: string;
        static HIGH_8X8_LINEAR: string;
        static HIGH_16X16: string;
        static HIGH_16X16_LINEAR: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class StageScaleMode extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static SHOW_ALL: string;
        static EXACT_FIT: string;
        static NO_BORDER: string;
        static NO_SCALE: string;
        static SHOW_ALL_LOWERCASE: string;
        static EXACT_FIT_LOWERCASE: string;
        static NO_BORDER_LOWERCASE: string;
        static NO_SCALE_LOWERCASE: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.display {
    class TriangleCulling extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static NONE: string;
        static POSITIVE: string;
        static NEGATIVE: string;
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
 * AVM1Movie is the reflection of AVM1 SWFs loaded into AVM2 content. Since AVM1 content is
 * completely opaque to AVM2 content, it's not a DisplayObjectContainer, even though it contains
 * nested children. This is because the two worlds are completely separated from each other[1], and
 * each AVM1 SWF is entirely isolated from everything else.
 *
 * This causes a few headaches because we implement the AVM1 display list in terms of the AVM2
 * display list: each AVM1 MovieClip is a wrapper around an AVM2 MovieClip instance, which is
 * what's actually on stage. Theoretically, the top-most AVM2 MovieClip for an AVM1 SWF isn't
 * supposed to have a parent. However, we need it to be part of the stage's display tree in order
 * to take part in rendering.
 *
 * Therefore, the AVM2 MovieClip wrapped by an AVM1Movie gets the latter set as its parent, even
 * though AVM1Movie isn't a DisplayObjectContainer. We borrow methods from that and generally
 * pretend that AVM1Movie is a container in some places to pull that off.
 *
 * [1]: If you ignore the undocumented `call` and `addCallback` methods for a moment.
 */
declare module Shumway.AVMX.AS.flash.display {
    class AVM1Movie extends flash.display.DisplayObject implements IAdvancable {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(level0: DisplayObject);
        private _content;
        private _constructed;
        call(functionName: string): any;
        addCallback(functionName: string, closure: ASFunction): void;
        _addFrame(frame: Shumway.SWF.SWFFrame): void;
        _initFrame(advance: boolean): void;
        _constructFrame(): void;
        _enqueueFrameScripts(): void;
        _propagateFlagsDown(flags: DisplayObjectFlags): void;
        /**
         * AVM1Movie only takes the AVM1 content into consideration when testing points against
         * bounding boxes, not otherwise.
         */
        _containsPoint(globalX: number, globalY: number, localX: number, localY: number, testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult;
        /**
         * Override of DisplayObject#_getChildBounds that retrieves the AVM1 content's bounds.
         */
        _getChildBounds(bounds: Bounds, includeStrokes: boolean): void;
        _getLevelForRoot(root: DisplayObject): number;
        _getRootForLevel(level: number): DisplayObject;
        _addRoot(level: number, root: DisplayObject): void;
        _removeRoot(level: number): boolean;
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
declare module Shumway.AVMX.AS.flash.errors {
    class IllegalOperationError extends ASError {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(message?: string, id?: number);
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
declare module Shumway.AVMX.AS.flash.external {
    class ExternalInterface extends ASObject {
        static classInitializer: any;
        constructor();
        static $BgmarshallExceptions: boolean;
        private static initialized;
        private static registeredCallbacks;
        static ensureInitialized(): void;
        static call(functionName: string): any;
        static addCallback(functionName: string, closure: AXFunction): void;
        static available: boolean;
        static objectID: string;
        static _addCallback(functionName: string, closure: Function): void;
        static _removeCallback(functionName: string): void;
        static _evalJS(expression: string): string;
        private static _callIn(functionName, args);
        static _callOut(request: string): string;
        static convertToXML(s: String): ASXML;
        static convertToXMLString(obj: any): String;
        static convertFromXML(xml: any): any;
        static convertToJSString(obj: any): string;
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
declare module Shumway.AVMX.AS.flash.filters {
    class BitmapFilterQuality extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static LOW: number;
        static MEDIUM: number;
        static HIGH: number;
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
declare module Shumway.AVMX.AS.flash.filters {
    class BitmapFilterType extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static INNER: string;
        static OUTER: string;
        static FULL: string;
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
declare module Shumway.AVMX.AS.flash.filters {
    import Rectangle = flash.geom.Rectangle;
    class BitmapFilter extends ASObject {
        static axClass: typeof BitmapFilter;
        static classInitializer: any;
        private static EPS;
        private static blurFilterStepWidths;
        static _updateBlurBounds(bounds: Rectangle, blurX: number, blurY: number, quality: number, isBlurFilter?: boolean): void;
        constructor();
        _updateFilterBounds(bounds: Rectangle): void;
        _serialize(message: any): void;
        clone(): BitmapFilter;
    }
    class GradientArrays {
        static colors: any[];
        static alphas: any[];
        static ratios: any[];
        static sanitize(colors: any[], alphas: any[], ratios: any[]): void;
        static sanitizeColors(colors: number[], maxLen?: number): number[];
        static sanitizeAlphas(alphas: number[], maxLen?: number, minLen?: number, value?: number): number[];
        static sanitizeRatios(ratios: number[], maxLen?: number, minLen?: number, value?: number): number[];
        static initArray(len: number, value?: number): number[];
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
declare module Shumway.AVMX.AS.flash.filters {
    import Rectangle = flash.geom.Rectangle;
    class BevelFilter extends flash.filters.BitmapFilter {
        static axClass: typeof BevelFilter;
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        static FromUntyped(obj: any): BevelFilter;
        constructor(distance?: number, angle?: number, highlightColor?: number, highlightAlpha?: number, shadowColor?: number, shadowAlpha?: number, blurX?: number, blurY?: number, strength?: number, quality?: number, type?: string, knockout?: boolean);
        _updateFilterBounds(bounds: Rectangle): void;
        private _distance;
        private _angle;
        private _highlightColor;
        private _highlightAlpha;
        private _shadowColor;
        private _shadowAlpha;
        private _blurX;
        private _blurY;
        private _knockout;
        private _quality;
        private _strength;
        private _type;
        distance: number;
        angle: number;
        highlightColor: number;
        highlightAlpha: number;
        shadowColor: number;
        shadowAlpha: number;
        blurX: number;
        blurY: number;
        knockout: boolean;
        quality: number;
        strength: number;
        type: string;
        clone(): BitmapFilter;
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
declare module Shumway.AVMX.AS.flash.filters {
    import Rectangle = flash.geom.Rectangle;
    class BlurFilter extends flash.filters.BitmapFilter {
        static axClass: typeof BlurFilter;
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        static FromUntyped(obj: any): BlurFilter;
        constructor(blurX?: number, blurY?: number, quality?: number);
        _updateFilterBounds(bounds: Rectangle): void;
        _serialize(message: any): void;
        private _blurX;
        private _blurY;
        private _quality;
        blurX: number;
        blurY: number;
        quality: number;
        clone(): BitmapFilter;
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
declare module Shumway.AVMX.AS.flash.filters {
    class ColorMatrixFilter extends flash.filters.BitmapFilter {
        static axClass: typeof ColorMatrixFilter;
        static classInitializer: any;
        static FromUntyped(obj: {
            matrix: number[];
        }): any;
        constructor(matrix?: ASArray);
        _serialize(message: any): void;
        private _matrix;
        matrix: ASArray;
        clone(): BitmapFilter;
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
declare module Shumway.AVMX.AS.flash.filters {
    class ConvolutionFilter extends flash.filters.BitmapFilter {
        static axClass: typeof ConvolutionFilter;
        static classInitializer: any;
        static FromUntyped(obj: any): ConvolutionFilter;
        constructor(matrixX?: number, matrixY?: number, matrix?: ASArray, divisor?: number, bias?: number, preserveAlpha?: boolean, clamp?: boolean, color?: number, alpha?: number);
        private _expandArray(a, newLen, value?);
        private _matrix;
        private _matrixX;
        private _matrixY;
        private _divisor;
        private _bias;
        private _preserveAlpha;
        private _clamp;
        private _color;
        private _alpha;
        matrix: ASArray;
        matrixX: number;
        matrixY: number;
        divisor: number;
        bias: number;
        preserveAlpha: boolean;
        clamp: boolean;
        color: number;
        alpha: number;
        clone(): BitmapFilter;
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
declare module Shumway.AVMX.AS.flash.filters {
    class DisplacementMapFilterMode extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static WRAP: string;
        static CLAMP: string;
        static IGNORE: string;
        static COLOR: string;
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
declare module Shumway.AVMX.AS.flash.filters {
    class DisplacementMapFilter extends flash.filters.BitmapFilter {
        static axClass: typeof DisplacementMapFilter;
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        static FromUntyped(obj: any): DisplacementMapFilter;
        constructor(mapBitmap?: flash.display.BitmapData, mapPoint?: flash.geom.Point, componentX?: number, componentY?: number, scaleX?: number, scaleY?: number, mode?: string, color?: number, alpha?: number);
        private _mapBitmap;
        private _mapPoint;
        private _componentX;
        private _componentY;
        private _scaleX;
        private _scaleY;
        private _mode;
        private _color;
        private _alpha;
        mapBitmap: flash.display.BitmapData;
        mapPoint: flash.geom.Point;
        componentX: number;
        componentY: number;
        scaleX: number;
        scaleY: number;
        mode: string;
        color: number;
        alpha: number;
        clone(): BitmapFilter;
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
declare module Shumway.AVMX.AS.flash.filters {
    import Rectangle = flash.geom.Rectangle;
    class DropShadowFilter extends flash.filters.BitmapFilter {
        static axClass: typeof DropShadowFilter;
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        static FromUntyped(obj: any): DropShadowFilter;
        constructor(distance?: number, angle?: number, color?: number, alpha?: number, blurX?: number, blurY?: number, strength?: number, quality?: number, inner?: boolean, knockout?: boolean, hideObject?: boolean);
        _updateFilterBounds(bounds: Rectangle): void;
        private _distance;
        private _angle;
        private _color;
        private _alpha;
        private _blurX;
        private _blurY;
        private _hideObject;
        private _inner;
        private _knockout;
        private _quality;
        private _strength;
        distance: number;
        angle: number;
        color: number;
        alpha: number;
        blurX: number;
        blurY: number;
        hideObject: boolean;
        inner: boolean;
        knockout: boolean;
        quality: number;
        strength: number;
        clone(): BitmapFilter;
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
declare module Shumway.AVMX.AS.flash.filters {
    import Rectangle = flash.geom.Rectangle;
    class GlowFilter extends flash.filters.BitmapFilter {
        static axClass: typeof GlowFilter;
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        static FromUntyped(obj: any): GlowFilter;
        constructor(color?: number, alpha?: number, blurX?: number, blurY?: number, strength?: number, quality?: number, inner?: boolean, knockout?: boolean);
        _updateFilterBounds(bounds: Rectangle): void;
        private _color;
        private _alpha;
        private _blurX;
        private _blurY;
        private _inner;
        private _knockout;
        private _quality;
        private _strength;
        color: number;
        alpha: number;
        blurX: number;
        blurY: number;
        inner: boolean;
        knockout: boolean;
        quality: number;
        strength: number;
        clone(): BitmapFilter;
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
declare module Shumway.AVMX.AS.flash.filters {
    import Rectangle = flash.geom.Rectangle;
    class GradientBevelFilter extends flash.filters.BitmapFilter {
        static axClass: typeof GradientBevelFilter;
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        static FromUntyped(obj: any): GradientBevelFilter;
        constructor(distance?: number, angle?: number, colors?: ASArray, alphas?: ASArray, ratios?: ASArray, blurX?: number, blurY?: number, strength?: number, quality?: number, type?: string, knockout?: boolean);
        _updateFilterBounds(bounds: Rectangle): void;
        private _distance;
        private _angle;
        private _colors;
        private _alphas;
        private _ratios;
        private _blurX;
        private _blurY;
        private _knockout;
        private _quality;
        private _strength;
        private _type;
        distance: number;
        angle: number;
        colors: ASArray;
        alphas: ASArray;
        ratios: ASArray;
        blurX: number;
        blurY: number;
        knockout: boolean;
        quality: number;
        strength: number;
        type: string;
        clone(): BitmapFilter;
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
declare module Shumway.AVMX.AS.flash.filters {
    import Rectangle = flash.geom.Rectangle;
    class GradientGlowFilter extends flash.filters.BitmapFilter {
        static axClass: typeof GradientGlowFilter;
        static classInitializer: any;
        static FromUntyped(obj: any): GradientGlowFilter;
        constructor(distance?: number, angle?: number, colors?: ASArray, alphas?: ASArray, ratios?: ASArray, blurX?: number, blurY?: number, strength?: number, quality?: number, type?: string, knockout?: boolean);
        _updateFilterBounds(bounds: Rectangle): void;
        private _distance;
        private _angle;
        private _colors;
        private _alphas;
        private _ratios;
        private _blurX;
        private _blurY;
        private _knockout;
        private _quality;
        private _strength;
        private _type;
        distance: number;
        angle: number;
        colors: ASArray;
        alphas: ASArray;
        ratios: ASArray;
        blurX: number;
        blurY: number;
        knockout: boolean;
        quality: number;
        strength: number;
        type: string;
        clone(): BitmapFilter;
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
declare module Shumway.AVMX.AS.flash.geom {
    class ColorTransform extends ASObject {
        static axClass: typeof ColorTransform;
        static classInitializer(): void;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(redMultiplier?: number, greenMultiplier?: number, blueMultiplier?: number, alphaMultiplier?: number, redOffset?: number, greenOffset?: number, blueOffset?: number, alphaOffset?: number);
        static FROZEN_IDENTITY_COLOR_TRANSFORM: ColorTransform;
        static TEMP_COLOR_TRANSFORM: ColorTransform;
        redMultiplier: number;
        greenMultiplier: number;
        blueMultiplier: number;
        alphaMultiplier: number;
        redOffset: number;
        greenOffset: number;
        blueOffset: number;
        alphaOffset: number;
        native_redMultiplier: number;
        native_greenMultiplier: number;
        native_blueMultiplier: number;
        native_alphaMultiplier: number;
        native_redOffset: number;
        native_greenOffset: number;
        native_blueOffset: number;
        native_alphaOffset: number;
        ColorTransform(redMultiplier?: number, greenMultiplier?: number, blueMultiplier?: number, alphaMultiplier?: number, redOffset?: number, greenOffset?: number, blueOffset?: number, alphaOffset?: number): void;
        color: number;
        concat(second: ColorTransform): void;
        preMultiply(second: ColorTransform): void;
        copyFrom(sourceColorTransform: ColorTransform): void;
        copyFromUntyped(object: any): void;
        setTo(redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number, redOffset: number, greenOffset: number, blueOffset: number, alphaOffset: number): void;
        clone(): ColorTransform;
        convertToFixedPoint(): ColorTransform;
        equals(other: ColorTransform): boolean;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.media {
    class Camera extends flash.events.EventDispatcher {
        static classInitializer: any;
        constructor();
        static names: ASArray;
        static isSupported: boolean;
        static getCamera(name?: string): flash.media.Camera;
        static _scanHardware(): void;
        activityLevel: number;
        bandwidth: number;
        currentFPS: number;
        fps: number;
        height: number;
        index: number;
        keyFrameInterval: number;
        loopback: boolean;
        motionLevel: number;
        motionTimeout: number;
        muted: boolean;
        name: string;
        quality: number;
        width: number;
        setCursor(value: boolean): void;
        setKeyFrameInterval(keyFrameInterval: number): void;
        setLoopback(compress?: boolean): void;
        setMode(width: number, height: number, fps: number, favorArea?: boolean): void;
        setMotionLevel(motionLevel: number, timeout?: number): void;
        setQuality(bandwidth: number, quality: number): void;
        drawToBitmapData(destination: flash.display.BitmapData): void;
        copyToByteArray(rect: flash.geom.Rectangle, destination: flash.utils.ByteArray): void;
        copyToVector(rect: flash.geom.Rectangle, destination: Float64Vector): void;
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
declare module Shumway.AVMX.AS.flash.media {
    class ID3Info extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        songName: string;
        artist: string;
        album: string;
        year: string;
        comment: string;
        genre: string;
        track: string;
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
declare module Shumway.AVMX.AS.flash.media {
    class Microphone extends flash.events.EventDispatcher {
        static classInitializer: any;
        constructor();
        static names: ASArray;
        static isSupported: boolean;
        static getMicrophone(index?: number): flash.media.Microphone;
        static getEnhancedMicrophone(index?: number): flash.media.Microphone;
        rate: number;
        codec: string;
        framesPerPacket: number;
        encodeQuality: number;
        noiseSuppressionLevel: number;
        enableVAD: boolean;
        activityLevel: number;
        gain: number;
        index: number;
        muted: boolean;
        name: string;
        silenceLevel: number;
        silenceTimeout: number;
        useEchoSuppression: boolean;
        soundTransform: flash.media.SoundTransform;
        enhancedOptions: any;
        setSilenceLevel(silenceLevel: number, timeout?: number): void;
        setUseEchoSuppression(useEchoSuppression: boolean): void;
        setLoopBack(state?: boolean): void;
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
declare module Shumway.AVMX.AS.flash.media {
    class Sound extends flash.events.EventDispatcher {
        static classInitializer: any;
        _symbol: SoundSymbol;
        applySymbol(): void;
        static initializeFromPCMData(sec: ISecurityDomain, data: any): Sound;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(stream?: flash.net.URLRequest, context?: flash.media.SoundLoaderContext);
        private _playQueue;
        private _soundData;
        private _stream;
        private _url;
        _isURLInaccessible: boolean;
        private _length;
        _isBuffering: boolean;
        private _bytesLoaded;
        private _bytesTotal;
        private _id3;
        url: string;
        isURLInaccessible: boolean;
        length: number;
        isBuffering: boolean;
        bytesLoaded: number;
        bytesTotal: number;
        id3: flash.media.ID3Info;
        loadCompressedDataFromByteArray(bytes: flash.utils.ByteArray, bytesLength: number): void;
        loadPCMFromByteArray(bytes: flash.utils.ByteArray, samples: number, format?: string, stereo?: boolean, sampleRate?: number): void;
        play(startTime?: number, loops?: number, sndTransform?: flash.media.SoundTransform): flash.media.SoundChannel;
        close(): void;
        extract(target: flash.utils.ByteArray, length: number, startPosition?: number): number;
        load(request: flash.net.URLRequest, context?: SoundLoaderContext): void;
    }
    class SoundSymbol extends Timeline.Symbol {
        channels: number;
        sampleRate: number;
        pcm: Float32Array;
        packaged: any;
        constructor(data: Timeline.SymbolData, sec: ISecurityDomain);
        static FromData(data: any, loaderInfo: display.LoaderInfo): SoundSymbol;
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
declare module Shumway.AVMX.AS.flash.media {
    class SoundChannel extends flash.events.EventDispatcher implements ISoundSource {
        static classInitializer: any;
        _symbol: SoundChannel;
        constructor();
        static initializeFromAudioElement(sec: ISecurityDomain, element: HTMLAudioElement): SoundChannel;
        _element: any;
        _sound: flash.media.Sound;
        private _audioChannel;
        private _pcmData;
        private _playing;
        private _position;
        _soundTransform: flash.media.SoundTransform;
        private _leftPeak;
        private _rightPeak;
        position: number;
        soundTransform: flash.media.SoundTransform;
        leftPeak: number;
        rightPeak: number;
        playing: boolean;
        stop(): void;
        _playSoundDataViaAudio(soundData: any, startTime: any, loops: any): void;
        _playSoundDataViaChannel(soundData: any, startTime: any, loops: any): void;
        stopSound(): void;
        updateSoundLevels(volume: number): void;
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
declare module Shumway.AVMX.AS.flash.media {
    class SoundLoaderContext extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(bufferTime?: number, checkPolicyFile?: boolean);
        bufferTime: number;
        checkPolicyFile: boolean;
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
declare module Shumway.AVMX.AS.flash.media {
    interface ISoundSource {
        soundTransform: flash.media.SoundTransform;
        updateSoundLevels(volume: number): any;
        stopSound(): any;
    }
    class SoundMixer extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        private static _masterVolume;
        private static _registeredSoundSources;
        private static _bufferTime;
        static _soundTransform: flash.media.SoundTransform;
        static bufferTime: number;
        static soundTransform: flash.media.SoundTransform;
        static audioPlaybackMode: string;
        static useSpeakerphoneForVoice: boolean;
        static stopAll(): void;
        static computeSpectrum(outputArray: flash.utils.ByteArray, FFTMode?: boolean, stretchFactor?: number): void;
        static areSoundsInaccessible(): boolean;
        static _getMasterVolume(): number;
        static _setMasterVolume(volume: any): void;
        static _registerSoundSource(source: ISoundSource): void;
        static _unregisterSoundSource(source: ISoundSource): void;
        static _updateSoundSource(source: ISoundSource): void;
        static _updateAllSoundSources(): void;
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
declare module Shumway.AVMX.AS.flash.media {
    class SoundTransform extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(vol?: number, panning?: number);
        private _volume;
        private _leftToLeft;
        private _leftToRight;
        private _rightToRight;
        private _rightToLeft;
        volume: number;
        leftToLeft: number;
        leftToRight: number;
        rightToRight: number;
        rightToLeft: number;
        pan: number;
        _updateTransform(): void;
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
declare module Shumway.AVMX.AS.flash.media {
    class StageVideo extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        viewPort: flash.geom.Rectangle;
        pan: flash.geom.Point;
        zoom: flash.geom.Point;
        depth: number;
        videoWidth: number;
        videoHeight: number;
        colorSpaces: Float64Vector;
        attachNetStream(netStream: flash.net.NetStream): void;
        attachCamera(theCamera: flash.media.Camera): void;
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
declare module Shumway.AVMX.AS.flash.media {
    class StageVideoAvailability extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static AVAILABLE: string;
        static UNAVAILABLE: string;
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
declare module Shumway.AVMX.AS.flash.media {
    class Video extends flash.display.DisplayObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        _symbol: VideoSymbol;
        applySymbol(): void;
        protected _initializeFields(): void;
        constructor(width?: number, height?: number);
        _deblocking: number;
        _smoothing: boolean;
        _videoWidth: number;
        _videoHeight: number;
        _netStream: flash.net.NetStream;
        _camera: flash.media.Camera;
        deblocking: number;
        smoothing: boolean;
        videoWidth: number;
        videoHeight: number;
        _containsPointDirectly(localX: number, localY: number, globalX: number, globalY: number): boolean;
        clear(): void;
        attachNetStream(netStream: flash.net.NetStream): void;
        attachCamera(camera: flash.media.Camera): void;
    }
    class VideoSymbol extends Timeline.DisplaySymbol {
        width: number;
        height: number;
        deblocking: number;
        smoothing: boolean;
        codec: number;
        constructor(data: Timeline.SymbolData, sec: ISecurityDomain);
        static FromData(data: any, loaderInfo: display.LoaderInfo): VideoSymbol;
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
declare module Shumway.AVMX.AS.flash.media {
    class VideoStreamSettings extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        width: number;
        height: number;
        fps: number;
        quality: number;
        bandwidth: number;
        keyFrameInterval: number;
        codec: string;
        setMode: (width: number, height: number, fps: number) => void;
        setQuality: (bandwidth: number, quality: number) => void;
        setKeyFrameInterval: (keyFrameInterval: number) => void;
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
declare module Shumway.AVMX.AS.flash.net {
    class FileFilter extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(description: string, extension: string, macType?: string);
        private _description;
        private _extension;
        private _macType;
        description: string;
        extension: string;
        macType: string;
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
declare module Shumway.AVMX.AS.flash.net {
    class FileReference extends flash.events.EventDispatcher {
        static classInitializer: any;
        constructor();
        load: () => void;
        save: (data: any, defaultFileName?: string) => void;
        creationDate: ASDate;
        creator: string;
        modificationDate: ASDate;
        name: string;
        size: number;
        type: string;
        cancel(): void;
        download(request: flash.net.URLRequest, defaultFileName?: string): void;
        upload(request: flash.net.URLRequest, uploadDataFieldName?: string, testUpload?: boolean): void;
        data: flash.utils.ByteArray;
        browse(typeFilter?: ASArray): boolean;
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
declare module Shumway.AVMX.AS.flash.net {
    class FileReferenceList extends flash.events.EventDispatcher {
        static classInitializer: any;
        constructor();
        fileList: ASArray;
        browse(typeFilter?: ASArray): boolean;
    }
}
/**
 * Copyright 2015 Mozilla Foundation
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
declare module Shumway.AVMX.AS.flash.net {
    class LocalConnection extends flash.events.EventDispatcher implements ILocalConnectionReceiver {
        static classInitializer: any;
        constructor();
        static isSupported: boolean;
        private _domain;
        private _secure;
        private _client;
        private _connectionName;
        private _allowedInsecureDomains;
        private _allowedSecureDomains;
        close(): void;
        connect(connectionName: string): void;
        send(connectionName: string, methodName: string, ...args: any[]): void;
        client: ASObject;
        allowDomain(...domains: string[]): void;
        allowInsecureDomain(...domains: string[]): void;
        private _allowDomains(domains, secure);
        handleMessage(methodName: string, argsBuffer: ArrayBuffer): void;
        domain: string;
        isPerUser: boolean;
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
declare module Shumway.AVMX.AS.flash.net {
    class NetConnection extends flash.events.EventDispatcher {
        static classInitializer: any;
        constructor();
        close(): void;
        addHeader(operation: string, mustUnderstand?: Boolean, param?: Object): void;
        call(command: string, responder: Responder): void;
        static _defaultObjectEncoding: number;
        static defaultObjectEncoding: number;
        private _connected;
        private _uri;
        private _client;
        private _objectEncoding;
        private _proxyType;
        private _usingTLS;
        private _protocol;
        private _rtmpConnection;
        private _rtmpCreateStreamCallbacks;
        connected: boolean;
        uri: string;
        connect(command: string): void;
        _createRtmpStream(callback: any): void;
        client: ASObject;
        objectEncoding: number;
        proxyType: string;
        connectedProxyType: string;
        usingTLS: boolean;
        protocol: string;
        maxPeerConnections: number;
        nearID: string;
        farID: string;
        nearNonce: string;
        farNonce: string;
        unconnectedPeerStreams: ASArray;
        invoke(index: number): any;
        private _invoke(index, args);
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
declare module Shumway.AVMX.AS.flash.net {
    import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
    import VideoControlEvent = Shumway.Remoting.VideoControlEvent;
    import ISoundSource = flash.media.ISoundSource;
    class NetStream extends flash.events.EventDispatcher implements ISoundSource {
        _isDirty: boolean;
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(connection: flash.net.NetConnection, peerID?: string);
        _connection: flash.net.NetConnection;
        _peerID: string;
        _id: number;
        private _resourceName;
        private _metaData;
        /**
         * Only one video can be attached to this |NetStream| object. If we attach another video, then
         * the previous attachement is lost. (Validated through experimentation.)
         */
        _videoReferrer: flash.media.Video;
        private _videoStream;
        private _contentTypeHint;
        static DIRECT_CONNECTIONS: string;
        static CONNECT_TO_FMS: string;
        attach: (connection: flash.net.NetConnection) => void;
        close: () => void;
        attachAudio: (microphone: flash.media.Microphone) => void;
        attachCamera: (theCamera: flash.media.Camera, snapshotMilliseconds?: number) => void;
        send: (handlerName: string) => void;
        bufferTime: number;
        maxPauseBufferTime: number;
        backBufferTime: number;
        backBufferLength: number;
        step: (frames: number) => void;
        bufferTimeMax: number;
        receiveAudio: (flag: boolean) => void;
        receiveVideo: (flag: boolean) => void;
        receiveVideoFPS: (FPS: number) => void;
        pause: () => void;
        resume: () => void;
        togglePause: () => void;
        seek: (offset: number) => void;
        publish: (name?: string, type?: string) => void;
        time: number;
        currentFPS: number;
        bufferLength: number;
        liveDelay: number;
        bytesLoaded: number;
        bytesTotal: number;
        decodedFrames: number;
        videoCodec: number;
        audioCodec: number;
        onPeerConnect: (subscriber: flash.net.NetStream) => boolean;
        call: () => void;
        _inBufferSeek: boolean;
        private _info;
        private _soundTransform;
        private _checkPolicyFile;
        private _client;
        private _objectEncoding;
        dispose(): void;
        _getVideoStreamURL(): string;
        play(url: string): void;
        play2(param: flash.net.NetStreamPlayOptions): void;
        info: flash.net.NetStreamInfo;
        multicastInfo: flash.net.NetStreamMulticastInfo;
        soundTransform: flash.media.SoundTransform;
        checkPolicyFile: boolean;
        client: ASObject;
        objectEncoding: number;
        multicastPushNeighborLimit: number;
        multicastWindowDuration: number;
        multicastRelayMarginDuration: number;
        multicastAvailabilityUpdatePeriod: number;
        multicastFetchPeriod: number;
        multicastAvailabilitySendToAll: boolean;
        farID: string;
        nearNonce: string;
        farNonce: string;
        peerStreams: ASArray;
        audioReliable: boolean;
        videoReliable: boolean;
        dataReliable: boolean;
        audioSampleAccess: boolean;
        videoSampleAccess: boolean;
        appendBytes(bytes: flash.utils.ByteArray): void;
        appendBytesAction(netStreamAppendBytesAction: string): void;
        useHardwareDecoder: boolean;
        useJitterBuffer: boolean;
        videoStreamSettings: flash.media.VideoStreamSettings;
        invoke(index: number): any;
        invokeWithArgsArray(index: number, p_arguments: ASArray): any;
        inBufferSeek: boolean;
        private _invoke(index, args);
        private _notifyVideoControl(eventType, data);
        processVideoEvent(eventType: VideoPlaybackEvent, data: any): void;
        stopSound(): void;
        updateSoundLevels(volume: number): void;
    }
    interface IVideoElementService {
        registerEventListener(id: number, listener: (eventType: VideoPlaybackEvent, data: any) => void): any;
        notifyVideoControl(id: number, eventType: VideoControlEvent, data: any): any;
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
declare module Shumway.AVMX.AS.flash.net {
    class NetStreamInfo extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(curBPS: number, byteCount: number, maxBPS: number, audioBPS: number, audioByteCount: number, videoBPS: number, videoByteCount: number, dataBPS: number, dataByteCount: number, playbackBPS: number, droppedFrames: number, audioBufferByteLength: number, videoBufferByteLength: number, dataBufferByteLength: number, audioBufferLength: number, videoBufferLength: number, dataBufferLength: number, srtt: number, audioLossRate: number, videoLossRate: number, metaData?: ASObject, xmpData?: ASObject, uri?: string, resourceName?: string, isLive?: boolean);
        currentBytesPerSecond: number;
        byteCount: number;
        maxBytesPerSecond: number;
        audioBytesPerSecond: number;
        audioByteCount: number;
        videoBytesPerSecond: number;
        videoByteCount: number;
        dataBytesPerSecond: number;
        dataByteCount: number;
        playbackBytesPerSecond: number;
        droppedFrames: number;
        audioBufferByteLength: number;
        videoBufferByteLength: number;
        dataBufferByteLength: number;
        audioBufferLength: number;
        videoBufferLength: number;
        dataBufferLength: number;
        SRTT: number;
        audioLossRate: number;
        videoLossRate: number;
        metaData: ASObject;
        xmpData: ASObject;
        uri: string;
        resourceName: string;
        isLive: boolean;
        _curBPS: number;
        _byteCount: number;
        _maxBPS: number;
        _audioBPS: number;
        _audioByteCount: number;
        _videoBPS: number;
        _videoByteCount: number;
        _dataBPS: number;
        _dataByteCount: number;
        _playbackBPS: number;
        _droppedFrames: number;
        _audioBufferByteLength: number;
        _videoBufferByteLength: number;
        _dataBufferByteLength: number;
        _audioBufferLength: number;
        _videoBufferLength: number;
        _dataBufferLength: number;
        _srtt: number;
        _audioLossRate: number;
        _videoLossRate: number;
        _metaData: ASObject;
        _xmpData: ASObject;
        _uri: string;
        _resourceName: string;
        _isLive: boolean;
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
declare module Shumway.AVMX.AS.flash.net {
    class NetStreamMulticastInfo extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(sendDataBytesPerSecond: number, sendControlBytesPerSecond: number, receiveDataBytesPerSecond: number, receiveControlBytesPerSecond: number, bytesPushedToPeers: number, fragmentsPushedToPeers: number, bytesRequestedByPeers: number, fragmentsRequestedByPeers: number, bytesPushedFromPeers: number, fragmentsPushedFromPeers: number, bytesRequestedFromPeers: number, fragmentsRequestedFromPeers: number, sendControlBytesPerSecondToServer: number, receiveDataBytesPerSecondFromServer: number, bytesReceivedFromServer: number, fragmentsReceivedFromServer: number, receiveDataBytesPerSecondFromIPMulticast: number, bytesReceivedFromIPMulticast: number, fragmentsReceivedFromIPMulticast: number);
        _sendDataBytesPerSecond: number;
        _sendControlBytesPerSecond: number;
        _receiveDataBytesPerSecond: number;
        _receiveControlBytesPerSecond: number;
        _bytesPushedToPeers: number;
        _fragmentsPushedToPeers: number;
        _bytesRequestedByPeers: number;
        _fragmentsRequestedByPeers: number;
        _bytesPushedFromPeers: number;
        _fragmentsPushedFromPeers: number;
        _bytesRequestedFromPeers: number;
        _fragmentsRequestedFromPeers: number;
        _sendControlBytesPerSecondToServer: number;
        _receiveDataBytesPerSecondFromServer: number;
        _bytesReceivedFromServer: number;
        _fragmentsReceivedFromServer: number;
        _receiveDataBytesPerSecondFromIPMulticast: number;
        _bytesReceivedFromIPMulticast: number;
        _fragmentsReceivedFromIPMulticast: number;
        sendDataBytesPerSecond: number;
        sendControlBytesPerSecond: number;
        receiveDataBytesPerSecond: number;
        receiveControlBytesPerSecond: number;
        bytesPushedToPeers: number;
        fragmentsPushedToPeers: number;
        bytesRequestedByPeers: number;
        fragmentsRequestedByPeers: number;
        bytesPushedFromPeers: number;
        fragmentsPushedFromPeers: number;
        bytesRequestedFromPeers: number;
        fragmentsRequestedFromPeers: number;
        sendControlBytesPerSecondToServer: number;
        receiveDataBytesPerSecondFromServer: number;
        bytesReceivedFromServer: number;
        fragmentsReceivedFromServer: number;
        receiveDataBytesPerSecondFromIPMulticast: number;
        bytesReceivedFromIPMulticast: number;
        fragmentsReceivedFromIPMulticast: number;
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
declare module Shumway.AVMX.AS.flash.net {
    class NetStreamPlayOptions extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        streamName: string;
        oldStreamName: string;
        start: number;
        len: number;
        offset: number;
        transition: string;
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
declare module Shumway.AVMX.AS.flash.net {
    class Responder extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(result: ASFunction, status?: ASFunction);
        private _result;
        private _status;
        ctor(result: ASFunction, status: ASFunction): void;
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
declare module Shumway.AVMX.AS.flash.net {
    class SharedObject extends flash.events.EventDispatcher {
        static classInitializer: any;
        constructor();
        static _sharedObjects: any;
        private static _defaultObjectEncoding;
        static deleteAll(url: string): number;
        static getDiskUsage(url: string): number;
        private static _create(path, data, encoding);
        static getLocal(name: string, localPath?: string, secure?: boolean): SharedObject;
        static getRemote(name: string, remotePath?: string, persistence?: any, secure?: boolean): flash.net.SharedObject;
        static defaultObjectEncoding: number;
        private _path;
        private _data;
        private _fps;
        private _objectEncoding;
        private _pendingFlushId;
        data: Object;
        objectEncoding: number;
        client: ASObject;
        setDirty(propertyName: string): void;
        connect(myConnection: NetConnection, params?: string): void;
        send(): void;
        close(): void;
        flush(minDiskSpace?: number): string;
        clear(): void;
        size: number;
        fps: number;
        setProperty(propertyName: string, value?: any): void;
        private queueFlush();
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
declare module Shumway.AVMX.AS.flash.net {
    class Socket extends flash.events.EventDispatcher implements flash.utils.IDataInput, flash.utils.IDataOutput {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(host?: string, port?: number);
        timeout: number;
        connect: (host: string, port: number) => void;
        close: () => void;
        bytesAvailable: number;
        connected: boolean;
        objectEncoding: number;
        endian: string;
        bytesPending: number;
        readBytes(bytes: flash.utils.ByteArray, offset?: number, length?: number): void;
        writeBytes(bytes: flash.utils.ByteArray, offset?: number, length?: number): void;
        writeBoolean(value: boolean): void;
        writeByte(value: number): void;
        writeShort(value: number): void;
        writeInt(value: number): void;
        writeUnsignedInt(value: number): void;
        writeFloat(value: number): void;
        writeDouble(value: number): void;
        writeMultiByte(value: string, charSet: string): void;
        writeUTF(value: string): void;
        writeUTFBytes(value: string): void;
        readBoolean(): boolean;
        readByte(): number;
        readUnsignedByte(): number;
        readShort(): number;
        readUnsignedShort(): number;
        readInt(): number;
        readUnsignedInt(): number;
        readFloat(): number;
        readDouble(): number;
        readMultiByte(length: number, charSet: string): string;
        readUTF(): string;
        readUTFBytes(length: number): string;
        flush(): void;
        writeObject(object: any): void;
        readObject(): any;
        internalGetSecurityErrorMessage(host: any, port: any): string;
        internalConnect(host: any, port: any): void;
        didFailureOccur(): boolean;
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
declare module Shumway.AVMX.AS.flash.net {
    import Event = flash.events.Event;
    class URLLoader extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(request?: flash.net.URLRequest);
        $Bgdata: any;
        $BgdataFormat: string;
        $BgbytesLoaded: number;
        $BgbytesTotal: number;
        data: any;
        dataFormat: string;
        bytesLoaded: number;
        bytesTotal: number;
        private _stream;
        private _httpResponseEventBound;
        _ignoreDecodeErrors: boolean;
        load(request: URLRequest): void;
        close(): void;
        complete(): void;
        addEventListener(type: string, listener: (event: Event) => void, useCapture?: boolean, priority?: number, useWeakReference?: boolean): void;
        private onStreamOpen(e);
        private onStreamComplete(e);
        private onStreamProgress(e);
        private onStreamIOError(e);
        private onStreamHTTPStatus(e);
        private onStreamHTTPResponseStatus(e);
        private onStreamSecurityError(e);
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
declare module Shumway.AVMX.AS.flash.net {
    class URLRequest extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static bindings: string[];
        constructor(url?: string);
        _checkPolicyFile: boolean;
        private _url;
        private _data;
        private _method;
        private _contentType;
        private _requestHeaders;
        private _digest;
        url: string;
        data: ASObject;
        method: string;
        contentType: string;
        requestHeaders: ASArray;
        digest: string;
        _toFileRequest(): any;
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
declare module Shumway.AVMX.AS.flash.net {
    class URLRequestHeader extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(name?: string, value?: string);
        name: string;
        value: string;
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
declare module Shumway.AVMX.AS.flash.net {
    class URLStream extends flash.events.EventDispatcher implements flash.utils.IDataInput {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        private _buffer;
        private _writePosition;
        private _session;
        private _connected;
        connected: boolean;
        bytesAvailable: number;
        objectEncoding: number;
        endian: string;
        diskCacheEnabled: boolean;
        position: number;
        length: number;
        load(request: flash.net.URLRequest): void;
        readBytes(bytes: flash.utils.ByteArray, offset?: number, length?: number): void;
        readBoolean(): boolean;
        readByte(): number;
        readUnsignedByte(): number;
        readShort(): number;
        readUnsignedShort(): number;
        readUnsignedInt(): number;
        readInt(): number;
        readFloat(): number;
        readDouble(): number;
        readMultiByte(length: number, charSet: string): string;
        readUTF(): string;
        readUTFBytes(length: number): string;
        close(): void;
        readObject(): any;
        stop(): void;
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
declare module Shumway.AVMX.AS.flash.net {
    class URLVariables extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(source?: string);
        _ignoreDecodingErrors: boolean;
        decode(source: string): void;
        toString(): string;
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
declare module Shumway.AVMX.AS.flash.sensors {
    class Accelerometer extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        isSupported: boolean;
        muted: boolean;
        setRequestedUpdateInterval(interval: number): void;
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
declare module Shumway.AVMX.AS.flash.sensors {
    class Geolocation extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        isSupported: boolean;
        muted: boolean;
        setRequestedUpdateInterval(interval: number): void;
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
declare module Shumway.AVMX.AS.flash.system {
    import AXApplicationDomain = Shumway.AVMX.AXApplicationDomain;
    class ApplicationDomain extends ASObject {
        axDomain: AXApplicationDomain;
        constructor(parentDomainOrAXDomain?: any);
        static currentDomain: flash.system.ApplicationDomain;
        static MIN_DOMAIN_MEMORY_LENGTH: number;
        parentDomain: flash.system.ApplicationDomain;
        domainMemory: flash.utils.ByteArray;
        getDefinition(name: string): Object;
        hasDefinition(name: string): boolean;
        private getDefinitionImpl(name);
        getQualifiedDefinitionNames(): GenericVector;
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
declare module Shumway.AVMX.AS.flash.system {
    class Capabilities extends ASObject {
        static classInitializer: any;
        constructor();
        private static _hasAccessibility;
        private static _language;
        private static _manufacturer;
        private static _os;
        private static _playerType;
        private static _version;
        private static _screenDPI;
        static isEmbeddedInAcrobat: boolean;
        static hasEmbeddedVideo: boolean;
        static hasAudio: boolean;
        static avHardwareDisable: boolean;
        static hasAccessibility: boolean;
        static hasAudioEncoder: boolean;
        static hasMP3: boolean;
        static hasPrinting: boolean;
        static hasScreenBroadcast: boolean;
        static hasScreenPlayback: boolean;
        static hasStreamingAudio: boolean;
        static hasStreamingVideo: boolean;
        static hasVideoEncoder: boolean;
        static isDebugger: boolean;
        static localFileReadDisable: boolean;
        static language: string;
        static manufacturer: string;
        static os: string;
        static cpuArchitecture: string;
        static playerType: string;
        static serverString: string;
        static version: string;
        /**
         * This can be "color", "gray" or "bw" for black and white. I don't know when you'd have anything
         * other than "color".
         */
        static screenColor: string;
        static pixelAspectRatio: number;
        static screenDPI: number;
        static screenResolutionX: number;
        static screenResolutionY: number;
        static touchscreenType: string;
        static hasIME: boolean;
        static hasTLS: boolean;
        static maxLevelIDC: string;
        static supports32BitProcesses: boolean;
        static supports64BitProcesses: boolean;
        static _internal: number;
        static hasMultiChannelAudio(type: string): boolean;
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
declare module Shumway.AVMX.AS.flash.system {
    interface IFSCommandListener {
        executeFSCommand(command: string, args: string): any;
    }
    function fscommand(sec: ISecurityDomain, command: string, args: string): void;
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
declare module Shumway.AVMX.AS.flash.system {
    class ImageDecodingPolicy extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static ON_DEMAND: string;
        static ON_LOAD: string;
    }
}
/**
 * Copyright 2015 Mozilla Foundation
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
declare module Shumway.AVMX.AS.flash.system {
    class LoaderContext extends ASObject {
        static classInitializer: any;
        static instanceSymbols: string[];
        private $BgcheckPolicyFile;
        private $BgapplicationDomain;
        private $BgsecurityDomain;
        private $BgallowCodeImport;
        private $BgrequestedContentParent;
        private $Bgparameters;
        private $BgimageDecodingPolicy;
        _avm1Context: AVM1.AVM1Context;
        constructor(checkPolicyFile?: boolean, applicationDomain?: flash.system.ApplicationDomain, securityDomain?: flash.system.SecurityDomain);
        imageDecodingPolicy: string;
        parameters: ASObject;
        requestedContentParent: flash.display.DisplayObjectContainer;
        allowCodeImport: boolean;
        securityDomain: flash.system.SecurityDomain;
        applicationDomain: flash.system.ApplicationDomain;
        checkPolicyFile: boolean;
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
declare module Shumway.AVMX.AS.flash.system {
    class JPEGLoaderContext extends flash.system.LoaderContext {
        static axClass: typeof JPEGLoaderContext;
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(deblockingFilter?: number, checkPolicyFile?: boolean, applicationDomain?: flash.system.ApplicationDomain, securityDomain?: flash.system.SecurityDomain);
        deblockingFilter: number;
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
declare module Shumway.AVMX.AS.flash.system {
    class MessageChannel extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        messageAvailable: boolean;
        state: string;
        send(arg: any, queueLimit?: number): void;
        receive(blockUntilReceived?: boolean): any;
        close(): void;
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
declare module Shumway.AVMX.AS.flash.system {
    class MessageChannelState extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static OPEN: string;
        static CLOSING: string;
        static CLOSED: string;
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
declare module Shumway.AVMX.AS.flash.system {
    class Security extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static REMOTE: string;
        static LOCAL_WITH_FILE: string;
        static LOCAL_WITH_NETWORK: string;
        static LOCAL_TRUSTED: string;
        static APPLICATION: string;
        private static _exactSettings;
        private static _sandboxType;
        static exactSettings: boolean;
        static disableAVM1Loading: boolean;
        static sandboxType: string;
        static pageDomain: string;
        static allowDomain(): void;
        static allowInsecureDomain(): void;
        static loadPolicyFile(url: string): void;
        static showSettings(panel?: string): void;
        static duplicateSandboxBridgeInputArguments(toplevel: ASObject, args: ASArray): ASArray;
        static duplicateSandboxBridgeOutputArgument(toplevel: ASObject, arg: any): any;
    }
    const enum CrossDomainSWFLoadingWhitelistResult {
        /**
         * The requested domain belongs to the same domain as SWF's.
         */
        OwnDomain = 0,
        /**
         * The requested domain belongs to the other domain than SWF's.
         */
        Remote = 1,
        /**
         * The requested domain is not whitelisted.
         */
        Failed = 2,
    }
    interface ICrossDomainSWFLoadingWhitelist {
        addToSWFLoadingWhitelist(domain: string, insecure: boolean, ownDomain: boolean): any;
        checkDomainForSWFLoading(domain: string): CrossDomainSWFLoadingWhitelistResult;
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
declare module Shumway.AVMX.AS.flash.system {
    class SecurityDomain extends ASObject {
        static classInitializer: any;
        constructor();
        static currentDomain: flash.system.SecurityDomain;
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
declare module Shumway.AVMX.AS.flash.system {
    class SecurityPanel extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static DEFAULT: string;
        static PRIVACY: string;
        static LOCAL_STORAGE: string;
        static MICROPHONE: string;
        static CAMERA: string;
        static DISPLAY: string;
        static SETTINGS_MANAGER: string;
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
declare module Shumway.AVMX.AS.flash.system {
    class TouchscreenType extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static FINGER: string;
        static STYLUS: string;
        static NONE: string;
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
declare module Shumway.AVMX.AS.flash.text {
    class AntiAliasType extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static NORMAL: string;
        static ADVANCED: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.text {
    class FontStyle extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static REGULAR: string;
        static BOLD: string;
        static ITALIC: string;
        static BOLD_ITALIC: string;
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
declare module Shumway.AVMX.AS.flash.text {
    class FontType extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static EMBEDDED: string;
        static EMBEDDED_CFF: string;
        static DEVICE: string;
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
declare module Shumway.AVMX.AS.flash.text {
    class Font extends ASObject implements Shumway.Remoting.IRemotable {
        static axClass: typeof Font;
        private static _fonts;
        private static _fontsBySymbolId;
        private static _fontsByName;
        static DEVICE_FONT_METRICS_WIN: Object;
        static DEVICE_FONT_METRICS_LINUX: Object;
        static DEVICE_FONT_METRICS_MAC: Object;
        static DEVICE_FONT_METRICS_BUILTIN: Object;
        static DEFAULT_FONT_SANS: string;
        static DEFAULT_FONT_SERIF: string;
        static DEFAULT_FONT_TYPEWRITER: string;
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        private _initializeFields();
        private static _deviceFontMetrics;
        private static _getFontMetrics(name, style);
        static resolveFontName(name: string): string;
        _symbol: FontSymbol;
        applySymbol(): void;
        constructor();
        static getBySymbolId(id: number): Font;
        static getByNameAndStyle(name: string, style: string): Font;
        static getDefaultFont(): Font;
        private _fontName;
        _fontFamily: string;
        private _fontStyle;
        private _fontType;
        _id: number;
        ascent: number;
        descent: number;
        leading: number;
        advances: number[];
        static enumerateFonts(enumerateDeviceFonts?: boolean): ASArray;
        static registerFont(font: ASClass): void;
        /**
         * Registers a font symbol as available in the system.
         *
         * Firefox decodes fonts synchronously, allowing us to do the decoding upon first actual use.
         * All we need to do here is let the system know about the family name and ID, so that both
         * TextFields/Labels referring to the font's symbol ID as well as HTML text specifying a font
         * face can resolve the font.
         *
         * For all other browsers, the decoding has been triggered by the Loader at this point.
         */
        static registerFontSymbol(fontMapping: {
            name: string;
            style: string;
            id: number;
        }, loaderInfo: flash.display.LoaderInfo): void;
        static resolveFontSymbol(loaderInfo: flash.display.LoaderInfo, id: number, syncId: number, key: string): Font;
        fontName: string;
        fontStyle: string;
        fontType: string;
        hasGlyphs(str: string): boolean;
    }
    class FontSymbol extends Timeline.Symbol implements Timeline.EagerlyResolvedSymbol {
        name: string;
        bold: boolean;
        italic: boolean;
        codes: number[];
        originalSize: boolean;
        metrics: any;
        syncId: number;
        constructor(data: Timeline.SymbolData, sec: ISecurityDomain);
        static FromData(data: any, loaderInfo: display.LoaderInfo): FontSymbol;
        resolveAssetCallback: any;
        private _unboundResolveAssetCallback(data);
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
declare module Shumway.AVMX.AS.flash.text {
    class GridFitType extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static NONE: string;
        static PIXEL: string;
        static SUBPIXEL: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.text {
    class StaticText extends flash.display.DisplayObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        _symbol: TextSymbol;
        applySymbol(): void;
        constructor();
        _canHaveTextContent(): boolean;
        _getTextContent(): Shumway.TextContent;
        _textContent: Shumway.TextContent;
        text: string;
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
declare module Shumway.AVMX.AS.flash.text {
    interface Style {
        color?: string;
        display?: string;
        fontFamily?: string;
        fontSize?: any;
        fontStyle?: string;
        fontWeight?: string;
        kerning?: any;
        leading?: any;
        letterSpacing?: any;
        marginLeft?: any;
        marginRight?: any;
        textAlign?: string;
        textDecoration?: string;
        textIndent?: any;
    }
    class StyleSheet extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        private _rules;
        styleNames: ASArray;
        getStyle(styleName: string): Style;
        applyStyle(textFormat: TextFormat, styleName: string): TextFormat;
        setStyle(styleName: string, styleObject: Style): void;
        hasStyle(styleName: string): boolean;
        clear(): void;
        transform(formatObject: ASObject): TextFormat;
        parseCSS(css: string): void;
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
declare module Shumway.AVMX.AS.flash.text {
    class TextDisplayMode extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static LCD: string;
        static CRT: string;
        static DEFAULT: string;
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
declare module Shumway.AVMX.AS.flash.text {
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    class TextField extends flash.display.InteractiveObject {
        static classSymbols: string[];
        static instanceSymbols: string[];
        static classInitializer: any;
        _symbol: TextSymbol;
        applySymbol(): void;
        constructor();
        protected _initializeFields(): void;
        _setFillAndLineBoundsFromSymbol(symbol: Timeline.DisplaySymbol): void;
        _setFillAndLineBoundsFromWidthAndHeight(width: number, height: number): void;
        _canHaveTextContent(): boolean;
        _getTextContent(): Shumway.TextContent;
        _getContentBounds(includeStrokes?: boolean): Bounds;
        _containsPointDirectly(localX: number, localY: number, globalX: number, globalY: number): boolean;
        private _invalidateContent();
        _textContent: Shumway.TextContent;
        _lineMetricsData: DataBuffer;
        static isFontCompatible(fontName: string, fontStyle: string): boolean;
        _alwaysShowSelection: boolean;
        _antiAliasType: string;
        _autoSize: string;
        _background: boolean;
        _backgroundColor: number;
        _border: boolean;
        _borderColor: number;
        _bottomScrollV: number;
        _caretIndex: number;
        _condenseWhite: boolean;
        _embedFonts: boolean;
        _gridFitType: string;
        _htmlText: string;
        _length: number;
        _textInteractionMode: string;
        _maxChars: number;
        _maxScrollH: number;
        _maxScrollV: number;
        _mouseWheelEnabled: boolean;
        _multiline: boolean;
        _numLines: number;
        _displayAsPassword: boolean;
        _restrict: string;
        _scrollH: number;
        _scrollV: number;
        _selectable: boolean;
        _selectedText: string;
        _selectionBeginIndex: number;
        _selectionEndIndex: number;
        _sharpness: number;
        _styleSheet: flash.text.StyleSheet;
        _textColor: number;
        _textHeight: number;
        _textWidth: number;
        _thickness: number;
        _type: string;
        _wordWrap: boolean;
        _useRichTextClipboard: boolean;
        alwaysShowSelection: boolean;
        antiAliasType: string;
        autoSize: string;
        background: boolean;
        backgroundColor: number;
        border: boolean;
        borderColor: number;
        bottomScrollV: number;
        caretIndex: number;
        condenseWhite: boolean;
        defaultTextFormat: flash.text.TextFormat;
        embedFonts: boolean;
        gridFitType: string;
        htmlText: string;
        length: number;
        textInteractionMode: string;
        maxChars: number;
        maxScrollH: number;
        maxScrollV: number;
        mouseWheelEnabled: boolean;
        multiline: boolean;
        numLines: number;
        displayAsPassword: boolean;
        restrict: string;
        scrollH: number;
        scrollV: number;
        selectable: boolean;
        selectedText: string;
        selectionBeginIndex: number;
        selectionEndIndex: number;
        sharpness: number;
        styleSheet: flash.text.StyleSheet;
        text: string;
        textColor: number;
        textHeight: number;
        textWidth: number;
        thickness: number;
        type: string;
        wordWrap: boolean;
        useRichTextClipboard: boolean;
        copyRichText(): void;
        pasteRichText(richText: string): void;
        getXMLText(beginIndex: number, endIndex?: number): string;
        insertXMLText(beginIndex: number, endIndex: number, richText: String, pasting: Boolean): void;
        private _ensureLineMetrics();
        appendText(newText: string): void;
        getCharBoundaries(charIndex: number): flash.geom.Rectangle;
        getCharIndexAtPoint(x: number, y: number): number;
        getFirstCharInParagraph(charIndex: number): number;
        getLineIndexAtPoint(x: number, y: number): number;
        getLineIndexOfChar(charIndex: number): number;
        getLineLength(lineIndex: number): number;
        getLineMetrics(lineIndex: number): flash.text.TextLineMetrics;
        getLineOffset(lineIndex: number): number;
        getLineText(lineIndex: number): string;
        getParagraphLength(charIndex: number): number;
        /**
         * Returns a TextFormat object that contains the intersection of formatting information for the
         * range of text between |beginIndex| and |endIndex|.
         */
        getTextFormat(beginIndex?: number, endIndex?: number): flash.text.TextFormat;
        getTextRuns(beginIndex?: number, endIndex?: number): ASArray;
        getRawText(): string;
        replaceSelectedText(value: string): void;
        replaceText(beginIndex: number, endIndex: number, newText: string): void;
        setSelection(beginIndex: number, endIndex: number): void;
        setTextFormat(format: flash.text.TextFormat, beginIndex?: number, endIndex?: number): void;
        getImageReference(id: string): flash.display.DisplayObject;
    }
    class TextSymbol extends Timeline.DisplaySymbol {
        color: number;
        size: number;
        face: string;
        bold: boolean;
        italic: boolean;
        align: string;
        leftMargin: number;
        rightMargin: number;
        indent: number;
        leading: number;
        multiline: boolean;
        wordWrap: boolean;
        embedFonts: boolean;
        selectable: boolean;
        border: boolean;
        initialText: string;
        html: boolean;
        displayAsPassword: boolean;
        type: string;
        maxChars: number;
        autoSize: string;
        variableName: string;
        textContent: Shumway.TextContent;
        constructor(data: Timeline.SymbolData, sec: ISecurityDomain);
        static FromTextData(data: any, loaderInfo: flash.display.LoaderInfo): TextSymbol;
        /**
         * Turns raw DefineLabel tag data into an object that's consumable as a text symbol and then
         * passes that into `FromTextData`, returning the resulting TextSymbol.
         *
         * This has to be done outside the SWF parser because it relies on any used fonts being
         * available as symbols, which isn't the case in the SWF parser.
         */
        static FromLabelData(data: any, loaderInfo: flash.display.LoaderInfo): TextSymbol;
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
declare module Shumway.AVMX.AS.flash.text {
    class TextFieldAutoSize extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static NONE: string;
        static LEFT: string;
        static CENTER: string;
        static RIGHT: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.text {
    class TextFieldType extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static INPUT: string;
        static DYNAMIC: string;
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
declare module Shumway.AVMX.AS.flash.text {
    class TextFormat extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(font?: string, size?: Object, color?: Object, bold?: Object, italic?: Object, underline?: Object, url?: string, target?: string, align?: string, leftMargin?: Object, rightMargin?: Object, indent?: Object, leading?: Object);
        private static measureTextField;
        private _align;
        private _blockIndent;
        private _bold;
        private _bullet;
        private _color;
        private _display;
        private _font;
        private _indent;
        private _italic;
        private _kerning;
        private _leading;
        private _leftMargin;
        private _letterSpacing;
        private _rightMargin;
        private _size;
        private _tabStops;
        private _target;
        private _underline;
        private _url;
        align: string;
        blockIndent: Object;
        bold: Object;
        bullet: Object;
        color: Object;
        display: string;
        font: string;
        style: string;
        indent: Object;
        italic: Object;
        kerning: Object;
        leading: Object;
        leftMargin: Object;
        letterSpacing: Object;
        rightMargin: Object;
        size: Object;
        tabStops: ASArray;
        target: string;
        underline: Object;
        url: string;
        /**
         * All integer values on TextFormat are typed as Object and coerced to ints using the following
         * "algorithm":
         * - if the supplied value is null or undefined, the field is set to null
         * - else if coercing to number results in NaN or the value is greater than MAX_INT, set to
         *   -0x80000000
         * - else, round the coerced value using half-even rounding
         */
        private static coerceNumber(value);
        /**
         * Boolean values are only stored as bools if they're not undefined or null. In that case,
         * they're stored as null.
         */
        private static coerceBoolean(value);
        clone(): TextFormat;
        equals(other: TextFormat): boolean;
        merge(other: TextFormat): void;
        intersect(other: TextFormat): void;
        transform(formatObject: Style): TextFormat;
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
declare module Shumway.AVMX.AS.flash.text {
    class TextFormatAlign extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static LEFT: string;
        static CENTER: string;
        static RIGHT: string;
        static JUSTIFY: string;
        static START: string;
        static END: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.text {
    class TextFormatDisplay extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static INLINE: string;
        static BLOCK: string;
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
declare module Shumway.AVMX.AS.flash.text {
    class TextInteractionMode extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static NORMAL: string;
        static SELECTION: string;
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
declare module Shumway.AVMX.AS.flash.text {
    class TextLineMetrics extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(x: number, width: number, height: number, ascent: number, descent: number, leading: number);
        x: number;
        width: number;
        height: number;
        ascent: number;
        descent: number;
        leading: number;
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
declare module Shumway.AVMX.AS.flash.text {
    class TextRun extends ASObject {
        static classInitializer: any;
        constructor(beginIndex: number, endIndex: number, textFormat: flash.text.TextFormat);
        _beginIndex: number;
        _endIndex: number;
        _textFormat: flash.text.TextFormat;
        beginIndex: number;
        endIndex: number;
        textFormat: TextFormat;
        clone(): TextRun;
        containsIndex(index: number): boolean;
        intersects(beginIndex: number, endIndex: number): boolean;
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
declare module Shumway.AVMX.AS.flash.text {
    class TextSnapshot extends ASObject {
        static classInitializer: any;
        constructor();
        charCount: number;
        findText(beginIndex: number, textToFind: string, caseSensitive: boolean): number;
        getSelected(beginIndex: number, endIndex: number): boolean;
        getSelectedText(includeLineEndings?: boolean): string;
        getText(beginIndex: number, endIndex: number, includeLineEndings?: boolean): string;
        getTextRunInfo(beginIndex: number, endIndex: number): ASArray;
        hitTestTextNearPos(x: number, y: number, maxDistance?: number): number;
        setSelectColor(hexColor?: number): void;
        setSelected(beginIndex: number, endIndex: number, select: boolean): void;
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
declare module Shumway.AVMX.AS.flash.trace {
    class Trace extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static OFF: number;
        static METHODS: number;
        static METHODS_WITH_ARGS: number;
        static METHODS_AND_LINES: number;
        static METHODS_AND_LINES_WITH_ARGS: number;
        static FILE: any;
        static LISTENER: any;
        static setLevel(l: number, target?: number): any;
        static getLevel(target?: number): number;
        static setListener(f: ASFunction): any;
        static getListener(): ASFunction;
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
declare module Shumway.AVMX.AS.flash.ui {
    class ContextMenu extends flash.display.NativeMenu {
        static classInitializer: any;
        constructor();
        static isSupported: boolean;
        _builtInItems: flash.ui.ContextMenuBuiltInItems;
        _customItems: any[];
        _link: flash.net.URLRequest;
        _clipboardMenu: boolean;
        _clipboardItems: flash.ui.ContextMenuClipboardItems;
        builtInItems: flash.ui.ContextMenuBuiltInItems;
        customItems: ASArray;
        link: flash.net.URLRequest;
        clipboardMenu: boolean;
        clipboardItems: flash.ui.ContextMenuClipboardItems;
        hideBuiltInItems(): void;
        clone(): ContextMenu;
        cloneLinkAndClipboardProperties(c: flash.ui.ContextMenu): void;
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
declare module Shumway.AVMX.AS.flash.ui {
    class ContextMenuBuiltInItems extends ASObject {
        static classInitializer: any;
        constructor();
        private _save;
        private _zoom;
        private _quality;
        private _play;
        private _loop;
        private _rewind;
        private _forwardAndBack;
        private _print;
        save: boolean;
        zoom: boolean;
        quality: boolean;
        play: boolean;
        loop: boolean;
        rewind: boolean;
        forwardAndBack: boolean;
        print: boolean;
        clone(): ContextMenuBuiltInItems;
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
declare module Shumway.AVMX.AS.flash.ui {
    class ContextMenuClipboardItems extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        _cut: boolean;
        _copy: boolean;
        _paste: boolean;
        _clear: boolean;
        _selectAll: boolean;
        cut: boolean;
        copy: boolean;
        paste: boolean;
        clear: boolean;
        selectAll: boolean;
        clone(): ContextMenuClipboardItems;
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
declare module Shumway.AVMX.AS.flash.ui {
    class ContextMenuItem extends flash.display.NativeMenuItem {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor(caption: string, separatorBefore?: boolean, enabled?: boolean, visible?: boolean);
        clone: () => flash.ui.ContextMenuItem;
        _caption: string;
        _separatorBefore: boolean;
        _visible: boolean;
        _enabled: boolean;
        caption: string;
        separatorBefore: boolean;
        visible: boolean;
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
declare module Shumway.AVMX.AS.flash.ui {
    class GameInput extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        numDevices: number;
        isSupported: boolean;
        static getDeviceAt(index: number): flash.ui.GameInputDevice;
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
declare module Shumway.AVMX.AS.flash.ui {
    class GameInputControl extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        numValues: number;
        index: number;
        relative: boolean;
        type: string;
        hand: string;
        finger: string;
        device: flash.ui.GameInputDevice;
        getValueAt(index?: number): number;
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
declare module Shumway.AVMX.AS.flash.ui {
    class GameInputControlType extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static MOVEMENT: string;
        static ROTATION: string;
        static DIRECTION: string;
        static ACCELERATION: string;
        static BUTTON: string;
        static TRIGGER: string;
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
declare module Shumway.AVMX.AS.flash.ui {
    class GameInputDevice extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static MAX_BUFFER_SIZE: number;
        numControls: number;
        sampleInterval: number;
        enabled: boolean;
        id: string;
        name: string;
        getControlAt(i: number): flash.ui.GameInputControl;
        startCachingSamples(numSamples: number, controls: GenericVector): void;
        stopCachingSamples(): void;
        getCachedSamples(data: flash.utils.ByteArray, append?: boolean): number;
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
declare module Shumway.AVMX.AS.flash.ui {
    class GameInputFinger extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static THUMB: string;
        static INDEX: string;
        static MIDDLE: string;
        static UNKNOWN: string;
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
declare module Shumway.AVMX.AS.flash.ui {
    class GameInputHand extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static RIGHT: string;
        static LEFT: string;
        static UNKNOWN: string;
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
declare module Shumway.AVMX.AS.flash.ui {
    /**
     * Dispatches AS3 keyboard events to the focus event dispatcher.
     */
    class KeyboardEventDispatcher {
        private _lastKeyCode;
        private _captureKeyPress;
        private _charCodeMap;
        target: flash.events.EventDispatcher;
        /**
         * Converts DOM keyboard event data into AS3 keyboard events.
         */
        dispatchKeyboardEvent(event: KeyboardEventData): void;
    }
    interface KeyboardEventData {
        type: string;
        keyCode: number;
        charCode: number;
        location: number;
        ctrlKey: boolean;
        altKey: boolean;
        shiftKey: boolean;
    }
    class Keyboard extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static capsLock: boolean;
        static numLock: boolean;
        static hasVirtualKeyboard: boolean;
        static physicalKeyboardType: string;
        static isAccessible(): boolean;
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
declare module Shumway.AVMX.AS.flash.ui {
    import InteractiveObject = flash.display.InteractiveObject;
    /**
     * Dispatches AS3 mouse events.
     */
    class MouseEventDispatcher {
        stage: flash.display.Stage;
        currentTarget: flash.display.InteractiveObject;
        /**
         * Finds the interactive object on which the event is dispatched.
         */
        private _findTarget(point, testingType);
        /**
         * Converts DOM mouse event data into AS3 mouse events.
         */
        private _dispatchMouseEvent(target, type, data, relatedObject?);
        /**
         * Handles the mouse event and returns the target on which the event was dispatched.
         */
        handleMouseEvent(data: MouseEventAndPointData): InteractiveObject;
    }
    const enum MouseButtonFlags {
        Left = 1,
        Middle = 2,
        Right = 4,
    }
    interface MouseEventAndPointData {
        type: string;
        point: flash.geom.Point;
        ctrlKey: boolean;
        altKey: boolean;
        shiftKey: boolean;
        buttons: MouseButtonFlags;
    }
    class Mouse extends ASObject {
        static axClass: typeof Mouse;
        static classInitializer(): void;
        constructor();
        static _cursor: string;
        static supportsCursor: boolean;
        static cursor: string;
        static supportsNativeCursor: boolean;
        static hide(): void;
        static show(): void;
        static registerCursor(name: string, cursor: flash.ui.MouseCursorData): void;
        static unregisterCursor(name: string): void;
        static _currentPosition: flash.geom.Point;
        /**
         * Remembers the current mouse position.
         */
        static updateCurrentPosition(value: flash.geom.Point): void;
        static draggableObject: flash.display.Sprite;
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
declare module Shumway.AVMX.AS.flash.ui {
    class MouseCursor extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static AUTO: string;
        static ARROW: string;
        static BUTTON: string;
        static HAND: string;
        static IBEAM: string;
        static fromNumber(n: number): string;
        static toNumber(value: string): number;
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
declare module Shumway.AVMX.AS.flash.ui {
    class MouseCursorData extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        data: GenericVector;
        hotSpot: flash.geom.Point;
        frameRate: number;
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
declare module Shumway.AVMX.AS.flash.ui {
    class Multitouch extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static inputMode: string;
        static supportsTouchEvents: boolean;
        static supportsGestureEvents: boolean;
        static supportedGestures: GenericVector;
        static maxTouchPoints: number;
        static mapTouchToMouse: boolean;
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
declare module Shumway.AVMX.AS.flash.ui {
    class MultitouchInputMode extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static NONE: string;
        static GESTURE: string;
        static TOUCH_POINT: string;
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
declare module Shumway.AVMX.AS.flash.utils {
    class Endian extends ASObject {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        constructor();
        static BIG_ENDIAN: string;
        static LITTLE_ENDIAN: string;
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
declare module Shumway.AVMX.AS.flash.utils {
    interface IDataInput2 extends flash.utils.IDataInput {
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
declare module Shumway.AVMX.AS.flash.utils {
    interface IDataOutput2 extends flash.utils.IDataOutput {
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
declare module Shumway.AVMX.AS.flash.utils {
    interface IExternalizable {
        writeExternal: (output: flash.utils.IDataOutput) => void;
        readExternal: (input: flash.utils.IDataInput) => void;
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
declare module Shumway.AVMX.AS.flash.utils {
    class Timer extends flash.events.EventDispatcher {
        static classInitializer: any;
        static classSymbols: string[];
        static instanceSymbols: string[];
        /**
         * This lets you toggle timer event dispatching which is useful when trying to profile other
         * parts of the system.
         */
        static dispatchingEnabled: boolean;
        constructor(delay: number, repeatCount: number);
        _delay: number;
        _repeatCount: number;
        _iteration: number;
        _running: boolean;
        _interval: number;
        running: boolean;
        delay: number;
        repeatCount: number;
        currentCount: number;
        reset(): void;
        stop(): void;
        start(): void;
        private _tick();
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
declare module Shumway.AVMX.AS.flash.utils {
    class SetIntervalTimer extends flash.utils.Timer {
        static classInitializer: any;
        constructor(closure: ASFunction, delay: number, repeats: boolean, rest: ASArray);
        static intervalArray: ASArray;
        static _clearInterval: (id: number) => void;
        reference: number;
        closure: ASFunction;
        rest: ASArray;
        onTimer: (event: flash.events.Event) => void;
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
import flashPackage = Shumway.AVMX.AS.flash;
interface ISecurityDomain {
    player: Shumway.Player.SWFPlayer;
    flash?: {
        display: {
            EventDispatcher: typeof flashPackage.events.EventDispatcher;
            DisplayObject: typeof flashPackage.display.DisplayObject;
            DisplayObjectContainer: typeof flashPackage.display.DisplayObjectContainer;
            InteractiveObject: typeof flashPackage.display.InteractiveObject;
            AVM1Movie: typeof flashPackage.display.AVM1Movie;
            Stage: typeof flashPackage.display.Stage;
            Loader: typeof flashPackage.display.Loader;
            LoaderInfo: typeof flashPackage.display.LoaderInfo;
            MovieClip: typeof flashPackage.display.MovieClip;
            Sprite: typeof flashPackage.display.Sprite;
            Shape: typeof flashPackage.display.Shape;
            MorphShape: typeof flashPackage.display.MorphShape;
            Graphics: typeof flashPackage.display.Graphics;
            Bitmap: typeof flashPackage.display.Bitmap;
            BitmapData: typeof flashPackage.display.BitmapData;
            SimpleButton: typeof flashPackage.display.SimpleButton;
            Scene: typeof flashPackage.display.Scene;
            FrameLabel: typeof flashPackage.display.FrameLabel;
        };
        events: {
            EventDispatcher: typeof flashPackage.events.EventDispatcher;
            Event: typeof flashPackage.events.Event;
            KeyboardEvent: typeof flashPackage.events.KeyboardEvent;
            MouseEvent: typeof flashPackage.events.MouseEvent;
            ProgressEvent: typeof flashPackage.events.ProgressEvent;
            ErrorEvent: typeof flashPackage.events.ErrorEvent;
            GestureEvent: typeof flashPackage.events.GestureEvent;
            StatusEvent: typeof flashPackage.events.StatusEvent;
            HTTPStatusEvent: typeof flashPackage.events.HTTPStatusEvent;
            IOErrorEvent: typeof flashPackage.events.IOErrorEvent;
            NetStatusEvent: typeof flashPackage.events.NetStatusEvent;
            TextEvent: typeof flashPackage.events.TextEvent;
            TimerEvent: typeof flashPackage.events.TimerEvent;
            TouchEvent: typeof flashPackage.events.TouchEvent;
            UncaughtErrorEvents: typeof flashPackage.events.UncaughtErrorEvents;
            AsyncErrorEvent: typeof flashPackage.events.AsyncErrorEvent;
        };
        filters: {
            BitmapFilter: typeof flashPackage.filters.BitmapFilter;
            BlurFilter: typeof flashPackage.filters.BlurFilter;
            DropShadowFilter: typeof flashPackage.filters.DropShadowFilter;
            GlowFilter: typeof flashPackage.filters.GlowFilter;
            BevelFilter: typeof flashPackage.filters.BevelFilter;
            ColorMatrixFilter: typeof flashPackage.filters.ColorMatrixFilter;
            ConvolutionFilter: typeof flashPackage.filters.ConvolutionFilter;
            DisplacementMapFilter: typeof flashPackage.filters.DisplacementMapFilter;
            GradientBevelFilter: typeof flashPackage.filters.GradientBevelFilter;
            GradientGlowFilter: typeof flashPackage.filters.GradientGlowFilter;
        };
        text: {
            StaticText: typeof flashPackage.text.StaticText;
            TextField: typeof flashPackage.text.TextField;
            TextFormat: typeof flashPackage.text.TextFormat;
            TextRun: typeof flashPackage.text.TextRun;
            TextLineMetrics: typeof flashPackage.text.TextLineMetrics;
            Font: typeof flashPackage.text.Font;
        };
        ui: {
            Mouse: typeof flashPackage.ui.Mouse;
            ContextMenu: typeof flashPackage.ui.ContextMenu;
            ContextMenuBuiltInItems: typeof flashPackage.ui.ContextMenuBuiltInItems;
            ContextMenuClipboardItems: typeof flashPackage.ui.ContextMenuClipboardItems;
        };
        geom: {
            Point: typeof flashPackage.geom.Point;
            Rectangle: typeof flashPackage.geom.Rectangle;
            Matrix: typeof flashPackage.geom.Matrix;
            Matrix3D: typeof flashPackage.geom.Matrix3D;
            Vector3D: typeof flashPackage.geom.Vector3D;
            ColorTransform: typeof flashPackage.geom.ColorTransform;
            Transform: typeof flashPackage.geom.Transform;
            PerspectiveProjection: typeof flashPackage.geom.PerspectiveProjection;
        };
        net: {
            URLRequest: typeof flashPackage.net.URLRequest;
            URLRequestHeader: typeof flashPackage.net.URLRequestHeader;
            URLStream: typeof flashPackage.net.URLStream;
            NetStreamInfo: typeof flashPackage.net.NetStreamInfo;
            URLVariables: typeof flashPackage.net.URLVariables;
            URLLoader: typeof flashPackage.net.URLLoader;
            SharedObject: typeof flashPackage.net.SharedObject;
        };
        utils: {
            ByteArray: typeof flashPackage.utils.ByteArray;
        };
        media: {
            Sound: typeof flashPackage.media.Sound;
            SoundChannel: typeof flashPackage.media.SoundChannel;
            SoundTransform: typeof flashPackage.media.SoundTransform;
            Video: typeof flashPackage.media.Video;
            ID3Info: typeof flashPackage.media.ID3Info;
        };
        system: {
            LoaderContext: typeof flashPackage.system.LoaderContext;
            JPEGLoaderContext: typeof flashPackage.system.JPEGLoaderContext;
            ApplicationDomain: typeof flashPackage.system.ApplicationDomain;
            SecurityDomain: typeof flashPackage.system.SecurityDomain;
            fscommand: typeof flashPackage.system.fscommand;
        };
    };
}
declare module Shumway.AVMX.AS {
    function constructClassFromSymbol(symbol: Timeline.Symbol, axClass: ASClass): any;
}
