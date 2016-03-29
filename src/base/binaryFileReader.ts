/*
 * Copyright 2014 Mozilla Foundation
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

module Shumway {
  declare var XMLHttpRequest;
  import unexpected = Shumway.Debug.unexpected;

  export interface BinaryFileReaderProgressInfo {
    loaded: number;
    total: number;
  }

  export class BinaryFileReader {
    url: string;
    method: string;
    mimeType: string;
    data: any;
    xhr: XMLHttpRequest;

    constructor(url: string, method?: string, mimeType?: string, data?) {
      this.url = url;
      this.method = method;
      this.mimeType = mimeType;
      this.data = data;
    }

    readAll(progress: (response: any, loaded: number, total: number) => void,
            complete: (response: any, error?: any) => void) {
      var url = this.url;
      var xhr = this.xhr = new XMLHttpRequest({mozSystem: true});
      var async = true;
      xhr.open(this.method || "GET", this.url, async);
      xhr.responseType = "arraybuffer";
      if (progress) {
        xhr.onprogress = function (event) {
          progress(xhr.response, event.loaded, event.total);
        };
      }
      xhr.onreadystatechange = function (event) {
        if (xhr.readyState === 4) {
          if (xhr.status !== 200 && xhr.status !== 0 || xhr.response === null) {
            unexpected("Path: " + url + " not found.");
            complete(null, xhr.statusText);
            return;
          }
          complete(xhr.response);
        }
      };
      if (this.mimeType) {
        xhr.setRequestHeader("Content-Type", this.mimeType);
      }
      xhr.send(this.data || null);
    }

    readChunked(chunkSize: number /* int */,
              ondata: (data: Uint8Array, progress:BinaryFileReaderProgressInfo) => void,
              onerror: (err: any) => void,
              onopen?: () => void,
              oncomplete?: () => void,
              onhttpstatus?: (location: string, status: string, responseHeaders: any) => void) {
      if (chunkSize <= 0) {
        this.readAsync(ondata, onerror, onopen, oncomplete, onhttpstatus);
        return;
      }

      var position = 0;
      var buffer = new Uint8Array(chunkSize);
      var read = 0, total;
      this.readAsync(
        function (data: Uint8Array, progress: BinaryFileReaderProgressInfo) {
          total = progress.total;
          var left = data.length, offset = 0;
          while (position + left >= chunkSize) {
            var tailSize = chunkSize - position;
            buffer.set(data.subarray(offset, offset + tailSize), position);
            offset += tailSize;
            left -= tailSize;
            read += chunkSize;
            ondata(buffer, {loaded: read, total: total});
            position = 0;
          }
          buffer.set(data.subarray(offset), position);
          position += left;
        },
        onerror,
        onopen,
        function () {
          if (position > 0) {
            read += position;
            ondata(buffer.subarray(0, position), {loaded: read, total: total});
            position = 0;
          }
          oncomplete && oncomplete();
        },
        onhttpstatus);
    }

    readAsync(ondata: (data: Uint8Array, progress:BinaryFileReaderProgressInfo) => void,
              onerror: (err: any) => void,
              onopen?: () => void,
              oncomplete?: () => void,
              onhttpstatus?: (location: string, status: string, responseHeaders: any) => void) {
      var xhr = this.xhr = new XMLHttpRequest({mozSystem: true});
      var url = this.url;
      var loaded = 0;
      var total = 0;
      xhr.open(this.method || "GET", url, true);
      xhr.responseType = 'moz-chunked-arraybuffer';
      var isNotProgressive = xhr.responseType !== 'moz-chunked-arraybuffer';
      if (isNotProgressive) {
        xhr.responseType = 'arraybuffer';
      }
      xhr.onprogress = function (e) {
        if (isNotProgressive) {
          return;
        }
        loaded = e.loaded;
        total = e.total;
        var bytes = new Uint8Array(xhr.response);
        // The event's `loaded` and `total` properties are sometimes lower than the actual
        // number of loaded bytes. In that case, increase them to that value.
        loaded = Math.max(loaded, bytes.byteLength);
        total = Math.max(total, bytes.byteLength);
        ondata(bytes, { loaded: loaded, total: total });
      };
      xhr.onreadystatechange = function (event) {
        if (xhr.readyState === 2 && onhttpstatus) {
          onhttpstatus(url, xhr.status, xhr.getAllResponseHeaders());
        }
        if (xhr.readyState === 4) {
          // Failed loads can be detected through either the status code or the fact that nothing
          // has been loaded.
          // Note: Just checking that `xhr.response` is set doesn't work, as Firefox enables
          // chunked loading, and in that mode `response` is only set in the `onprogress` handler.
          if (xhr.status !== 200 && xhr.status !== 0 ||
              xhr.response === null && (total === 0 || loaded !== total))
          {
            onerror(xhr.statusText);
            return;
          }
          if (isNotProgressive) {
            var buffer = xhr.response;
            ondata(new Uint8Array(buffer), { loaded: buffer.byteLength, total: buffer.byteLength });
          }
        }
      };
      xhr.onload = function () {
        if (oncomplete) {
          oncomplete();
        }
      };
      if (this.mimeType) {
        xhr.setRequestHeader("Content-Type", this.mimeType);
      }
      xhr.send(this.data || null);
      if (onopen) {
        onopen();
      }
    }

    abort() {
      if (this.xhr) {
        this.xhr.abort();
        this.xhr = null;
      }
    }
  }
}

