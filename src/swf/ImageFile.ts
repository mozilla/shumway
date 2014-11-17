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
  enum ImageTypeMagicHeaderBytes {
    JPG = 0xffd8ff,
    PNG = 0x89504e,
    GIF = 0x474946
  }

  var mimetypesForHeaders = {};
  mimetypesForHeaders[ImageTypeMagicHeaderBytes.JPG] = 'image/jpeg';
  mimetypesForHeaders[ImageTypeMagicHeaderBytes.PNG] = 'image/png';
  mimetypesForHeaders[ImageTypeMagicHeaderBytes.GIF] = 'image/gif';

  export class ImageFile {
    data: Uint8Array;
    bytesLoaded: number;
    image: any; // Image
    mimeType: string;
    type: number = 4;
    decodingPromise: Promise<any>;
    width: number;
    height: number;

    constructor(header: Uint8Array, fileLength: number) {
      this.bytesLoaded = header.length;
      if (header.length === fileLength) {
        this.data = header;
      } else {
        this.data = new Uint8Array(fileLength);
        this.data.set(header);
      }
      this.setMimetype();
      this.processLoadedData();
    }

    get bytesTotal() {
      return this.data.length;
    }

    appendLoadedData(data: Uint8Array) {
      this.data.set(data, this.bytesLoaded);
      this.bytesLoaded += data.length;
      this.processLoadedData();
    }
    private processLoadedData() {
      if (this.bytesLoaded === this.data.length) {
        var image = this.image = new Image();
        image.src = URL.createObjectURL(new Blob([this.data], {type: this.mimeType}));
        //this.data = null;
        this.decodingPromise = new Promise(function(resolve, reject) {
          image.onload = resolve;
          image.onerror = resolve;
        }).then(this.decodeImage.bind(this));
      }
    }

    private setMimetype() {
      var magic = (this.data[0] << 16) | (this.data[1] << 8) | this.data[2];
      this.mimeType = mimetypesForHeaders[magic];
    }

    private decodeImage() {
      this.width = this.image.width;
      this.height = this.image.height;
    }
  }
}
