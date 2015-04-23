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

module Shumway.Shell
{
  class ShellBinaryFileReader {
    public url:string;
    public method:string;
    public mimeType:string;
    public data:string;

    constructor(url, method, mimeType, data) {
      this.url = url;
      this.method = method;
      this.mimeType = mimeType;
      this.data = data;
    }

    readAll(progress, complete) {
      setTimeout(function () {
        console.log('Reading: ' + this.url);
        try {
          complete(read(this.url, 'binary'));
        } catch (e) {
          complete(null, e.message);
        }
      }.bind(this));
    }

    readAsync(ondata, onerror, onopen, oncomplete, onhttpstatus) {
      onopen && setTimeout(onopen);
      this.readAll(null, function (data, err) {
        if (data) {
          ondata(data, { loaded: data.byteLength, total: data.byteLength});
        } else {
          onerror(err);
        }
        oncomplete();
      });
    }
  }

  var shellTelemetry = {
    reportTelemetry: function (data) {
    }
  };

  var shellFileLoadingService = {
    baseUrl: null,
    createSession: function () {
      return {
        open: function (request) {
          var self = this;
          var path = Shumway.FileLoadingService.instance.resolveUrl(request.url);
          new BinaryFileReader(path, request.method, request.mimeType, request.data).readAsync(
            function (data, progress) {
              self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
            },
            function (e) {
              self.onerror(e);
            },
            self.onopen,
            self.onclose,
            self.onhttpstatus);
        }
      };
    },
    setBaseUrl: function (url) {
      shellFileLoadingService.baseUrl = url;
      return url;
    },
    resolveUrl: function (url) {
      return new (<any>URL)(url, shellFileLoadingService.baseUrl).href;
    },
    navigateTo: function (url, target) {
    }
  };

  export function setFileServicesBaseUrl(baseUrl: string) {
    shellFileLoadingService.baseUrl = baseUrl;
  }

  export function initializePlayerServices() {
    Shumway.BinaryFileReader = <typeof BinaryFileReader><any>ShellBinaryFileReader;
    Shumway.Telemetry.instance = shellTelemetry;
    Shumway.FileLoadingService.instance = shellFileLoadingService;
  }
}
