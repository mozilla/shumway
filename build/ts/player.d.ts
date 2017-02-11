/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
/// <reference path="swf.d.ts" />
/// <reference path="flash.d.ts" />
/// <reference path="../../src/flash/avm1.d.ts" />
declare module Shumway.Player {
    var timelineBuffer: Tools.Profiler.TimelineBuffer;
    var counter: Metrics.Counter;
    var writer: any;
    function enterTimeline(name: string, data?: any): void;
    function leaveTimeline(name: string, data?: any): void;
}
declare module Shumway {
    var playerOptions: any;
    var frameEnabledOption: any;
    var timerEnabledOption: any;
    var pumpEnabledOption: any;
    var pumpRateOption: any;
    var frameRateOption: any;
    var tracePlayerOption: any;
    var traceMouseEventOption: any;
    var frameRateMultiplierOption: any;
    var dontSkipFramesOption: any;
    var playAllSymbolsOption: any;
    var playSymbolOption: any;
    var playSymbolFrameDurationOption: any;
    var playSymbolCountOption: any;
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
    class FrameScheduler {
        private static STATS_TO_REMEMBER;
        private static MAX_DRAWS_TO_SKIP;
        private static INTERVAL_PADDING_MS;
        private static SPEED_ADJUST_RATE;
        private _drawStats;
        private _drawStatsSum;
        private _drawStarted;
        private _drawsSkipped;
        private _expectedNextFrameAt;
        private _onTime;
        private _trackDelta;
        private _delta;
        private _onTimeDelta;
        constructor();
        shallSkipDraw: boolean;
        nextFrameIn: number;
        isOnTime: boolean;
        startFrame(frameRate: any): void;
        endFrame(): void;
        startDraw(): void;
        endDraw(): void;
        skipDraw(): void;
        setDelta(value: any): void;
        startTrackDelta(): void;
        endTrackDelta(): void;
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
declare module Shumway.Remoting.Player {
    import flash = Shumway.AVMX.AS.flash;
    import Stage = flash.display.Stage;
    import Graphics = flash.display.Graphics;
    import NetStream = flash.net.NetStream;
    import BitmapData = flash.display.BitmapData;
    import DisplayObject = flash.display.DisplayObject;
    import Bounds = Shumway.Bounds;
    import IDataInput = Shumway.ArrayUtilities.IDataInput;
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    class PlayerChannelSerializer {
        /**
         * Output buffer that the serializer writes to.
         */
        output: DataBuffer;
        outputAssets: any[];
        phase: RemotingPhase;
        roots: DisplayObject[];
        constructor();
        remoteObjects(): void;
        remoteReferences(): void;
        writeEOF(): void;
        /**
         * Serializes dirty display objects starting at the specified root |displayObject| node.
         */
        writeDirtyDisplayObjects(displayObject: DisplayObject, clearDirtyDescendentsFlag: boolean): void;
        writeStage(stage: Stage): void;
        writeCurrentMouseTarget(stage: Stage, currentMouseTarget: flash.display.InteractiveObject): void;
        writeGraphics(graphics: Graphics): void;
        writeNetStream(netStream: NetStream, bounds: Bounds): void;
        writeDisplayObjectRoot(displayObject: DisplayObject): void;
        writeBitmapData(bitmapData: BitmapData): void;
        writeTextContent(textContent: Shumway.TextContent): void;
        /**
         * Writes the number of display objects this display object clips.
         */
        writeClippedObjectsCount(displayObject: DisplayObject): void;
        writeUpdateFrame(displayObject: DisplayObject): void;
        /**
         * Visit remotable child objects that are not otherwise visited.
         */
        writeDirtyAssets(displayObject: DisplayObject): void;
        writeDrawToBitmap(bitmapData: flash.display.BitmapData, source: Shumway.Remoting.IRemotable, matrix?: flash.geom.Matrix, colorTransform?: flash.geom.ColorTransform, blendMode?: string, clipRect?: flash.geom.Rectangle, smoothing?: boolean): void;
        private _writeMatrix(matrix);
        private _writeRectangle(bounds);
        private _writeAsset(asset);
        private _writeFilters(filters);
        private _writeColorTransform(colorTransform);
        writeRequestBitmapData(bitmapData: BitmapData): void;
    }
    interface FocusEventData {
        type: FocusEventType;
    }
    class PlayerChannelDeserializer {
        private sec;
        private input;
        private inputAssets;
        constructor(sec: ISecurityDomain, input: IDataInput, inputAssets: any[]);
        read(): any;
        private _readFocusEvent();
        private _readMouseEvent();
        private _readKeyboardEvent();
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
declare module Shumway.Player {
    import flash = Shumway.AVMX.AS.flash;
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    import BitmapData = flash.display.BitmapData;
    import IBitmapDataSerializer = flash.display.IBitmapDataSerializer;
    import IAssetResolver = Timeline.IAssetResolver;
    import IFSCommandListener = flash.system.IFSCommandListener;
    import IVideoElementService = flash.net.IVideoElementService;
    import IRootElementService = flash.display.IRootElementService;
    import ICrossDomainSWFLoadingWhitelist = flash.system.ICrossDomainSWFLoadingWhitelist;
    import CrossDomainSWFLoadingWhitelistResult = flash.system.CrossDomainSWFLoadingWhitelistResult;
    import VideoControlEvent = Shumway.Remoting.VideoControlEvent;
    import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
    import DisplayParameters = Shumway.Remoting.DisplayParameters;
    import IGFXService = Shumway.Remoting.IGFXService;
    import IGFXServiceObserver = Shumway.Remoting.IGFXServiceObserver;
    /**
     * Base class implementation of the IGFXServer. The different transports shall
     * inherit this class
     */
    class GFXServiceBase implements IGFXService {
        _observers: IGFXServiceObserver[];
        sec: ISecurityDomain;
        constructor(sec: ISecurityDomain);
        addObserver(observer: IGFXServiceObserver): void;
        removeObserver(observer: IGFXServiceObserver): void;
        update(updates: DataBuffer, assets: any[]): void;
        updateAndGet(updates: DataBuffer, assets: any[]): any;
        frame(): void;
        videoControl(id: number, eventType: VideoControlEvent, data: any): any;
        registerFont(syncId: number, data: Uint8Array): Promise<any>;
        registerImage(syncId: number, symbolId: number, imageType: ImageType, data: Uint8Array, alphaData: Uint8Array): Promise<any>;
        fscommand(command: string, args: string): void;
        processUpdates(updates: DataBuffer, assets: any[]): void;
        processDisplayParameters(displayParameters: DisplayParameters): void;
        processVideoEvent(id: number, eventType: VideoPlaybackEvent, data: any): void;
    }
    /**
     * Shumway Player
     *
     * This class brings everything together. Loads the swf, runs the event loop and
     * synchronizes the frame tree with the display list.
     */
    class Player implements IBitmapDataSerializer, IFSCommandListener, IVideoElementService, IAssetResolver, IRootElementService, ICrossDomainSWFLoadingWhitelist {
        sec: ISecurityDomain;
        _stage: flash.display.Stage;
        private _loader;
        private _loaderInfo;
        private _frameTimeout;
        private _eventLoopIsRunning;
        private _framesPlayed;
        framesPlayed: number;
        private _writer;
        private _gfxService;
        private _gfxServiceObserver;
        /**
         * If set, overrides SWF file background color.
         */
        defaultStageColor: number;
        /**
         * Movie parameters, such as flashvars.
         */
        movieParams: MapObject<string>;
        /**
         * Initial stage alignment: l|r|t|tr|tl.
         */
        stageAlign: string;
        /**
         * Initial stage scaling: showall|noborder|exactfit|noscale.
         */
        stageScale: string;
        /**
         * Initial display parameters.
         */
        displayParameters: DisplayParameters;
        /**
         * Timestamp of initialization start of the player itself, including iframe creation.
         */
        initStartTime: number;
        /**
         * Time since the last time we've synchronized the display list.
         */
        private _lastPumpTime;
        /**
         * Page Visibility API visible state.
         */
        _isPageVisible: boolean;
        /**
         * Page focus state.
         */
        _hasFocus: boolean;
        /**
         * Stage current mouse target.
         */
        private _currentMouseTarget;
        /**
         * Indicates whether the |currentMouseTarget| has changed since the last time it was synchronized.
         */
        private _currentMouseTargetIsDirty;
        currentMouseTarget: flash.display.InteractiveObject;
        /**
         * Page URL that hosts SWF.
         */
        private _pageUrl;
        /**
         * SWF URL.
         */
        private _swfUrl;
        /**
         * Loader URL, can be different from SWF URL.
         */
        private _loaderUrl;
        constructor(sec: ISecurityDomain, gfxService: IGFXService);
        /**
         * Movie stage object.
         */
        stage: flash.display.Stage;
        /**
         * Whether we can get away with rendering at a lower rate.
         */
        private _shouldThrottleDownRendering();
        /**
         * Whether we can get away with executing frames at a lower rate.
         */
        private _shouldThrottleDownFrameExecution();
        pageUrl: string;
        loaderUrl: string;
        swfUrl: string;
        load(url: string, buffer?: ArrayBuffer): void;
        private createLoaderContext();
        private _pumpDisplayListUpdates();
        syncDisplayObject(displayObject: flash.display.DisplayObject, async: boolean): DataBuffer;
        requestBitmapData(bitmapData: BitmapData): DataBuffer;
        drawToBitmap(bitmapData: flash.display.BitmapData, source: Shumway.Remoting.IRemotable, matrix?: flash.geom.Matrix, colorTransform?: flash.geom.ColorTransform, blendMode?: string, clipRect?: flash.geom.Rectangle, smoothing?: boolean): void;
        registerEventListener(id: number, listener: (eventType: VideoPlaybackEvent, data: any) => void): void;
        notifyVideoControl(id: number, eventType: VideoControlEvent, data: any): any;
        executeFSCommand(command: string, args: string): void;
        requestRendering(): void;
        /**
         * Update the frame container with the latest changes from the display list.
         */
        private _pumpUpdates();
        private _leaveSyncLoop();
        private _getFrameInterval();
        private _enterEventLoop();
        private _leaveEventLoop();
        private _enterRootLoadingLoop();
        private _eventLoopTick();
        private _tracePlayer();
        private _playAllSymbols();
        registerFont(symbol: Timeline.EagerlyResolvedSymbol, data: Uint8Array): void;
        registerImage(symbol: Timeline.EagerlyResolvedSymbol, imageType: ImageType, data: Uint8Array, alphaData: Uint8Array): void;
        private _crossDomainSWFLoadingWhitelist;
        addToSWFLoadingWhitelist(domain: string, insecure: boolean, ownDomain: boolean): void;
        checkDomainForSWFLoading(domain: string): CrossDomainSWFLoadingWhitelistResult;
    }
}
declare module Shumway {
    import AXSecurityDomain = Shumway.AVMX.AXSecurityDomain;
    enum AVM2LoadLibrariesFlags {
        Builtin = 1,
        Playerglobal = 2,
        Shell = 4,
    }
    function createSecurityDomain(libraries: AVM2LoadLibrariesFlags): Promise<AXSecurityDomain>;
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
declare module Shumway.Player {
    class ShumwayComExternalInterface implements IExternalInterfaceService {
        private _externalCallback;
        enabled: boolean;
        initJS(callback: (functionName: string, args: any[]) => any): void;
        registerCallback(functionName: string): void;
        unregisterCallback(functionName: string): void;
        eval(expression: string): any;
        call(request: string): any;
        getId(): string;
    }
    class ShumwayComFileLoadingService implements IFileLoadingService {
        private _baseUrl;
        private _nextSessionId;
        private _sessions;
        init(baseUrl: string): void;
        private _notifySession(session, args);
        createSession(): FileLoadingSession;
        resolveUrl(url: string): string;
        navigateTo(url: any, target: any): void;
    }
    class ShumwayComClipboardService implements IClipboardService {
        setClipboard(data: string): void;
    }
    class ShumwayComTelemetryService implements ITelemetryService {
        reportTelemetry(data: any): void;
    }
    class BrowserFileLoadingService implements IFileLoadingService {
        private _baseUrl;
        private _fileReadChunkSize;
        createSession(): {
            open: (request: any) => void;
            close: () => void;
        };
        init(baseUrl: string, fileReadChunkSize?: number): void;
        resolveUrl(url: string): string;
        navigateTo(url: string, target: string): void;
    }
    class ShumwayComResourcesLoadingService implements ISystemResourcesLoadingService {
        private _pendingPromises;
        constructor(preload: boolean);
        private _onSystemResourceCallback(id, data);
        load(id: SystemResourceId): Promise<any>;
    }
    class BrowserSystemResourcesLoadingService implements ISystemResourcesLoadingService {
        builtinPath: string;
        viewerPlayerglobalInfo: {
            abcs: string;
            catalog: string;
        };
        shellPath: string;
        constructor(builtinPath: string, viewerPlayerglobalInfo?: {
            abcs: string;
            catalog: string;
        }, shellPath?: string);
        load(id: SystemResourceId): Promise<any>;
        private _promiseFile(path, responseType);
    }
    class BaseLocalConnectionService implements ILocalConnectionService {
        protected _localConnections: any;
        createConnection(connectionName: string, receiver: ILocalConnectionReceiver): LocalConnectionConnectResult;
        closeConnection(connectionName: string, receiver: ILocalConnectionReceiver): LocalConnectionCloseResult;
        hasConnection(connectionName: string): boolean;
        _sendMessage(connectionName: string, methodName: string, argsBuffer: ArrayBuffer, sender: ILocalConnectionSender, senderDomain: string, senderIsSecure: boolean): any;
        send(connectionName: string, methodName: string, argsBuffer: ArrayBuffer, sender: ILocalConnectionSender, senderDomain: string, senderIsSecure: boolean): void;
        allowDomains(connectionName: string, receiver: ILocalConnectionReceiver, domains: string[], secure: boolean): void;
    }
    class ShumwayComLocalConnectionService extends BaseLocalConnectionService {
        createConnection(connectionName: string, receiver: ILocalConnectionReceiver): LocalConnectionConnectResult;
        closeConnection(connectionName: string, receiver: ILocalConnectionReceiver): LocalConnectionCloseResult;
        hasConnection(connectionName: string): boolean;
        _sendMessage(connectionName: string, methodName: string, argsBuffer: ArrayBuffer, sender: ILocalConnectionSender, senderDomain: string, senderIsSecure: boolean): void;
        allowDomains(connectionName: string, receiver: ILocalConnectionReceiver, domains: string[], secure: boolean): void;
    }
    class PlayerInternalLocalConnectionService extends BaseLocalConnectionService {
        createConnection(connectionName: string, receiver: ILocalConnectionReceiver): LocalConnectionConnectResult;
        closeConnection(connectionName: string, receiver: ILocalConnectionReceiver): LocalConnectionCloseResult;
        hasConnection(connectionName: string): boolean;
        _sendMessage(connectionName: string, methodName: string, argsBuffer: ArrayBuffer, sender: ILocalConnectionSender, senderURL: string): void;
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
declare module Shumway.Player.Window {
    import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    import VideoControlEvent = Shumway.Remoting.VideoControlEvent;
    class WindowGFXService extends GFXServiceBase {
        private _peer;
        private _assetDecodingRequests;
        constructor(sec: ISecurityDomain, peer: Shumway.Remoting.ITransportPeer);
        update(updates: DataBuffer, assets: any[]): void;
        updateAndGet(updates: DataBuffer, assets: any[]): any;
        frame(): void;
        videoControl(id: number, eventType: VideoControlEvent, data: any): any;
        registerFont(syncId: number, data: Uint8Array): Promise<any>;
        registerImage(syncId: number, symbolId: number, imageType: ImageType, data: Uint8Array, alphaData: Uint8Array): Promise<any>;
        fscommand(command: string, args: string): void;
        private onWindowMessage(data);
    }
}
