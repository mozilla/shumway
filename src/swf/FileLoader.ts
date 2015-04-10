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
  6. `LoaderInfo#getSymbolById` invokes `Timeline.IAssetResolver#registerFontOrImage`. The singleton
     implementation of `IAssetResolver` is the active instance of `Player`.
  7. `Player#registerFontOrImage` send sync message to GFX side requesting decoding of asset.
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
module Shumway {
  import assert = Shumway.Debug.assert;
  import SWFFile = Shumway.SWF.SWFFile;

  // Minimal amount of data to load before starting to parse. Chosen fairly arbitrarily.
  var MIN_LOADED_BYTES = 8192;

  export class LoadProgressUpdate {
    constructor(public bytesLoaded: number, public framesLoaded: number) {
    }
  }
  export interface ILoadListener {
    onLoadOpen: (any) => void;
    onLoadProgress: (update: LoadProgressUpdate) => void;
    onNewEagerlyParsedSymbols: (symbols: SWF.EagerlyParsedDictionaryEntry[],
                                delta: number) => Promise<any>;
    onImageBytesLoaded: () => void;
    onLoadComplete: () => void;
    onLoadError: () => void;
  }

  export class FileLoader {
    _url: string;
    _file: any; // {SWFFile|ImageFile}

    private _listener: ILoadListener;
    private _loadingServiceSession: FileLoadingSession;
    private _delayedUpdatesPromise: Promise<any>;
    private _lastDelayedUpdate: LoadProgressUpdate;
    private _bytesLoaded: number;
    private _queuedInitialData: Uint8Array;


    constructor(listener: ILoadListener) {
      release || assert(listener);
      this._file = null;
      this._listener = listener;
      this._loadingServiceSession = null;
      this._delayedUpdatesPromise = null;
      this._bytesLoaded = 0;
    }

    // TODO: strongly type
    loadFile(request: any) {
      this._url = request.url;
      SWF.enterTimeline('Load file', request.url);
      this._bytesLoaded = 0;
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
    loadBytes(bytes: Uint8Array) {
      SWF.enterTimeline('Load bytes');
      this.processLoadOpen();
      this.processNewData(bytes, {bytesLoaded: bytes.length, bytesTotal: bytes.length});
      this.processLoadClose();
      // SWF.leaveTimeline happens in processLoadClose.
    }
    processLoadOpen() {
      release || assert(!this._file);
    }
    processNewData(data: Uint8Array, progressInfo: {bytesLoaded: number; bytesTotal: number}) {
      this._bytesLoaded += data.length;
      if (this._bytesLoaded < MIN_LOADED_BYTES && this._bytesLoaded < progressInfo.bytesTotal) {
        if (!this._queuedInitialData) {
          this._queuedInitialData = new Uint8Array(Math.min(MIN_LOADED_BYTES,
                                                            progressInfo.bytesTotal));
        }
        this._queuedInitialData.set(data, this._bytesLoaded - data.length);
        return;
      } else if (this._queuedInitialData) {
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
        file = this._file = createFileInstanceForHeader(data, progressInfo.bytesTotal);
        this._listener.onLoadOpen(file);
      } else {
        if (file instanceof SWFFile) {
          eagerlyParsedSymbolsCount = file.eagerlyParsedSymbolsList.length;
          previousFramesLoaded = file.framesLoaded;
        }
        file.appendLoadedData(data);
      }
      if (file instanceof SWFFile) {
        this.processSWFFileUpdate(file, eagerlyParsedSymbolsCount, previousFramesLoaded);
      } else {
        release || assert(file instanceof ImageFile);
        this._listener.onLoadProgress(new LoadProgressUpdate(progressInfo.bytesLoaded, -1));
        if (progressInfo.bytesLoaded === progressInfo.bytesTotal) {
          this._listener.onImageBytesLoaded();
        }
      }
    }
    processError(error) {
      Debug.warning('Loading error encountered:', error);
    }
    processLoadClose() {
      var file = this._file;
      if (file instanceof SWFFile) {
        var eagerlyParsedSymbolsCount = file.eagerlyParsedSymbolsList.length;
        var previousFramesLoaded = file.framesLoaded;

        file.finishLoading();

        this.processSWFFileUpdate(file, eagerlyParsedSymbolsCount, previousFramesLoaded);
      }
      if (!file || file.bytesLoaded !== file.bytesTotal) {
        Debug.warning("Not Implemented: processing loadClose when loading was aborted");
      } else {
        SWF.leaveTimeline();
      }
    }

    private processSWFFileUpdate(file: SWFFile, previousEagerlyParsedSymbolsCount: number,
                                 previousFramesLoaded: number) {
      var promise;
      var eagerlyParsedSymbolsDelta = file.eagerlyParsedSymbolsList.length -
                                      previousEagerlyParsedSymbolsCount;
      if (!eagerlyParsedSymbolsDelta) {
        var update = this._lastDelayedUpdate;
        if (!update) {
          release || assert(file.framesLoaded === file.frames.length);
          this._listener.onLoadProgress(new LoadProgressUpdate(file.bytesLoaded,
                                                               file.framesLoaded));
        } else {
          release || assert(update.framesLoaded <= file.frames.length);
          update.bytesLoaded = file.bytesLoaded;
          update.framesLoaded = file.frames.length;
        }
        return;
      }
      promise = this._listener.onNewEagerlyParsedSymbols(file.eagerlyParsedSymbolsList,
                                                         eagerlyParsedSymbolsDelta);
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
        if (!release && SWF.traceLevel.value > 0) {
          console.log("Reducing pending update delays from " + file.pendingUpdateDelays + " to " +
                      (file.pendingUpdateDelays - 1));
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
    }
  }

  function createFileInstanceForHeader(header: Uint8Array, fileLength: number): any {
    var magic = (header[0] << 16) | (header[1] << 8) | header[2];

    if ((magic & 0xffff) === FileTypeMagicHeaderBytes.SWF) {
      return new SWFFile(header, fileLength);
    }

    if (magic === FileTypeMagicHeaderBytes.JPG || magic === FileTypeMagicHeaderBytes.PNG ||
        magic === FileTypeMagicHeaderBytes.GIF) {
      return new ImageFile(header, fileLength);
    }

    // TODO: throw instead of returning null? Perhaps?
    return null;
  }

  enum FileTypeMagicHeaderBytes {
    SWF = 0x5753,
    JPG = 0xffd8ff,
    PNG = 0x89504e,
    GIF = 0x474946
  }
}
