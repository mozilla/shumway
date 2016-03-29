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

module RtmpJs.MP4.Iso {
  import utf8decode = Shumway.StringUtilities.utf8decode;

  var START_DATE = -2082844800000;  /* midnight after Jan. 1, 1904 */
  var DEFAULT_MOVIE_MATRIX: number[] = [1.0, 0, 0, 0, 1.0, 0, 0, 0, 1.0];
  var DEFAULT_OP_COLOR: number[] = [0, 0, 0];

  function concatArrays<T>(arg0: T[], ...args: T[][]): T[] {
    return Array.prototype.concat.apply(arg0, args);
  }

  function writeInt32(data: Uint8Array, offset: number, value: number) {
    data[offset] = (value >> 24) & 255;
    data[offset + 1] = (value >> 16) & 255;
    data[offset + 2] = (value >> 8) & 255;
    data[offset + 3] = value & 255;
  }

  function decodeInt32(s: string): number {
    return (s.charCodeAt(0) << 24) | (s.charCodeAt(1) << 16) |
           (s.charCodeAt(2) << 8) | s.charCodeAt(3);
  }

  function encodeDate(d: number): number  {
    return ((d - START_DATE) / 1000) | 0;
  }

  function encodeFloat_16_16(f: number): number {
    return (f * 0x10000) | 0;
  }

  function encodeFloat_2_30(f: number): number {
    return (f * 0x40000000) | 0;
  }

  function encodeFloat_8_8(f: number): number {
    return (f * 0x100) | 0;
  }

  function encodeLang(s: string): number {
    return ((s.charCodeAt(0) & 0x1F) << 10) | ((s.charCodeAt(1) & 0x1F) << 5) | (s.charCodeAt(2) & 0x1F);
  }

  export class Box {
    public offset: number;
    public size: number;

    public boxtype: string;
    public userType: Uint8Array;

    public constructor(boxtype: string, extendedType?: Uint8Array) {
      this.boxtype = boxtype;
      if (boxtype === 'uuid') {
        this.userType = extendedType;
      }
    }

    /**
     * @param offset Position where writing will start in the output array
     * @returns {number} Size of the written data
     */
    public layout(offset: number): number {
      this.offset = offset;
      var size = 8;
      if (this.userType) {
        size += 16;
      }
      this.size = size;
      return size;
    }

    /**
     * @param data Output array
     * @returns {number} Amount of written bytes by this Box and its children only.
     */
    public write(data: Uint8Array): number {
      writeInt32(data, this.offset, this.size);
      writeInt32(data, this.offset + 4, decodeInt32(this.boxtype));
      if (!this.userType) {
        return 8;
      }
      data.set(this.userType, this.offset + 8);
      return 24;
    }

    public toUint8Array(): Uint8Array {
      var size = this.layout(0);
      var data = new Uint8Array(size);
      this.write(data);
      return data;
    }
  }

  export class FullBox extends Box {
    public version: number;
    public flags: number;

    constructor(boxtype: string, version: number = 0, flags: number = 0) {
      super(boxtype);
      this.version = version;
      this.flags = flags;
    }

    public layout(offset: number): number {
      this.size = super.layout(offset) + 4;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, (this.version << 24) | this.flags);
      return offset + 4;
    }
  }

  export class FileTypeBox extends Box {
    public majorBrand: string;
    public minorVersion: number;
    public compatibleBrands: string[];

    constructor(majorBrand: string, minorVersion: number, compatibleBrands: string[]) {
      super('ftype');
      this.majorBrand = majorBrand;
      this.minorVersion = minorVersion;
      this.compatibleBrands = compatibleBrands;
    }

    public layout(offset: number): number {
      this.size = super.layout(offset) + 4 * (2 + this.compatibleBrands.length);
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, decodeInt32(this.majorBrand));
      writeInt32(data, this.offset + offset + 4, this.minorVersion);
      offset += 8;
      this.compatibleBrands.forEach((brand: string) => {
        writeInt32(data, this.offset + offset, decodeInt32(brand));
        offset += 4;
      }, this);
      return offset;
    }
  }

  export class BoxContainerBox extends Box {
    public children: Box[];
    constructor(type: string, children: Box[]) {
      super(type);
      this.children = children;
    }

    public layout(offset: number): number {
      var size = super.layout(offset);
      this.children.forEach((child) => {
        if (!child) {
          return; // skipping undefined
        }
        size += child.layout(offset + size);
      });
      return (this.size = size);
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      this.children.forEach((child) => {
        if (!child) {
          return; // skipping undefined
        }
        offset += child.write(data);
      });
      return offset;
    }
  }

  export class MovieBox extends BoxContainerBox {
    constructor(public header: MovieHeaderBox,
                public tracks: Box[],
                public extendsBox: MovieExtendsBox,
                public userData: Box) {
      super('moov', concatArrays<Box>([header], tracks, [extendsBox, userData]));
    }
  }

  export class MovieHeaderBox extends FullBox {
    constructor(public timescale: number,
                public duration: number,
                public nextTrackId: number,
                public rate: number = 1.0,
                public volume: number = 1.0,
                public matrix: number[] = DEFAULT_MOVIE_MATRIX,
                public creationTime: number = START_DATE,
                public modificationTime: number = START_DATE) {
      super('mvhd', 0, 0);
    }

    public layout(offset: number): number {
      this.size = super.layout(offset) + 16 + 4 + 2 + 2 + 8 + 36 + 24 + 4;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      // Only version 0
      writeInt32(data, this.offset + offset, encodeDate(this.creationTime));
      writeInt32(data, this.offset + offset + 4, encodeDate(this.modificationTime));
      writeInt32(data, this.offset + offset + 8, this.timescale);
      writeInt32(data, this.offset + offset + 12, this.duration);
      offset += 16;
      writeInt32(data, this.offset + offset, encodeFloat_16_16(this.rate));
      writeInt32(data, this.offset + offset + 4, encodeFloat_8_8(this.volume) << 16);
      writeInt32(data, this.offset + offset + 8, 0);
      writeInt32(data, this.offset + offset + 12, 0);
      offset += 16;
      writeInt32(data, this.offset + offset, encodeFloat_16_16(this.matrix[0]));
      writeInt32(data, this.offset + offset + 4, encodeFloat_16_16(this.matrix[1]));
      writeInt32(data, this.offset + offset + 8, encodeFloat_16_16(this.matrix[2]));
      writeInt32(data, this.offset + offset + 12, encodeFloat_16_16(this.matrix[3]));
      writeInt32(data, this.offset + offset + 16, encodeFloat_16_16(this.matrix[4]));
      writeInt32(data, this.offset + offset + 20, encodeFloat_16_16(this.matrix[5]));
      writeInt32(data, this.offset + offset + 24, encodeFloat_2_30(this.matrix[6]));
      writeInt32(data, this.offset + offset + 28, encodeFloat_2_30(this.matrix[7]));
      writeInt32(data, this.offset + offset + 32, encodeFloat_2_30(this.matrix[8]));
      offset += 36;
      writeInt32(data, this.offset + offset, 0);
      writeInt32(data, this.offset + offset + 4, 0);
      writeInt32(data, this.offset + offset + 8, 0);
      writeInt32(data, this.offset + offset + 12, 0);
      writeInt32(data, this.offset + offset + 16, 0);
      writeInt32(data, this.offset + offset + 20, 0);
      offset += 24;
      writeInt32(data, this.offset + offset, this.nextTrackId);
      offset += 4;
      return offset;
    }
  }

  export const enum TrackHeaderFlags {
    TRACK_ENABLED = 0x000001,
    TRACK_IN_MOVIE = 0x000002,
    TRACK_IN_PREVIEW = 0x000004,
  }

  export class TrackHeaderBox extends FullBox {
    constructor(flags: number,
                public trackId: number,
                public duration: number,
                public width: number,
                public height: number,
                public volume: number,
                public alternateGroup: number = 0,
                public layer: number = 0,
                public matrix: number[] = DEFAULT_MOVIE_MATRIX,
                public creationTime: number = START_DATE,
                public modificationTime: number = START_DATE) {
      super('tkhd', 0, flags);
    }
    public layout(offset: number): number {
      this.size = super.layout(offset) + 20 + 8 + 6 + 2 + 36 + 8;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      // Only version 0
      writeInt32(data, this.offset + offset, encodeDate(this.creationTime));
      writeInt32(data, this.offset + offset + 4, encodeDate(this.modificationTime));
      writeInt32(data, this.offset + offset + 8, this.trackId);
      writeInt32(data, this.offset + offset + 12, 0);
      writeInt32(data, this.offset + offset + 16, this.duration);
      offset += 20;
      writeInt32(data, this.offset + offset, 0);
      writeInt32(data, this.offset + offset + 4, 0);
      writeInt32(data, this.offset + offset + 8, (this.layer << 16) | this.alternateGroup);
      writeInt32(data, this.offset + offset + 12, encodeFloat_8_8(this.volume) << 16);
      offset += 16;
      writeInt32(data, this.offset + offset, encodeFloat_16_16(this.matrix[0]));
      writeInt32(data, this.offset + offset + 4, encodeFloat_16_16(this.matrix[1]));
      writeInt32(data, this.offset + offset + 8, encodeFloat_16_16(this.matrix[2]));
      writeInt32(data, this.offset + offset + 12, encodeFloat_16_16(this.matrix[3]));
      writeInt32(data, this.offset + offset + 16, encodeFloat_16_16(this.matrix[4]));
      writeInt32(data, this.offset + offset + 20, encodeFloat_16_16(this.matrix[5]));
      writeInt32(data, this.offset + offset + 24, encodeFloat_2_30(this.matrix[6]));
      writeInt32(data, this.offset + offset + 28, encodeFloat_2_30(this.matrix[7]));
      writeInt32(data, this.offset + offset + 32, encodeFloat_2_30(this.matrix[8]));
      offset += 36;
      writeInt32(data, this.offset + offset, encodeFloat_16_16(this.width));
      writeInt32(data, this.offset + offset + 4, encodeFloat_16_16(this.height));
      offset += 8;
      return offset;
    }
  }

  export class MediaHeaderBox extends FullBox  {
    constructor(public timescale: number,
                public duration: number,
                public language: string = 'unk',
                public creationTime: number = START_DATE,
                public modificationTime: number = START_DATE) {
      super('mdhd', 0, 0);
    }
    public layout(offset: number): number {
      this.size = super.layout(offset) + 16 + 4;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      // Only version 0
      writeInt32(data, this.offset + offset, encodeDate(this.creationTime));
      writeInt32(data, this.offset + offset + 4, encodeDate(this.modificationTime));
      writeInt32(data, this.offset + offset + 8, this.timescale);
      writeInt32(data, this.offset + offset + 12, this.duration);
      writeInt32(data, this.offset + offset + 16, encodeLang(this.language) << 16);
      return offset + 20;
    }
  }

  export class HandlerBox extends FullBox {
    private _encodedName: Uint8Array;

    constructor(public handlerType: string,
                public name: string) {
      super('hdlr', 0, 0);
      this._encodedName = utf8decode(this.name);
    }
    public layout(offset: number): number {
      this.size = super.layout(offset) + 8 + 12 + (this._encodedName.length + 1);
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, 0);
      writeInt32(data, this.offset + offset + 4, decodeInt32(this.handlerType));
      writeInt32(data, this.offset + offset + 8, 0);
      writeInt32(data, this.offset + offset + 12, 0);
      writeInt32(data, this.offset + offset + 16, 0);
      offset += 20;
      data.set(this._encodedName, this.offset + offset);
      data[this.offset + offset + this._encodedName.length] = 0;
      offset += this._encodedName.length + 1;
      return offset;
    }
  }

  export class SoundMediaHeaderBox extends FullBox {
    constructor(public balance: number = 0.0) {
      super('smhd', 0, 0);
    }

    public layout(offset: number): number {
      this.size = super.layout(offset) + 4;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, encodeFloat_8_8(this.balance) << 16);
      return offset + 4;
    }
  }

  export class VideoMediaHeaderBox extends FullBox {
    constructor(public graphicsMode: number = 0,
                public opColor: number[] = DEFAULT_OP_COLOR) {
      super('vmhd', 0, 0);
    }

    public layout(offset: number): number {
      this.size = super.layout(offset) + 8;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, (this.graphicsMode << 16) | this.opColor[0]);
      writeInt32(data, this.offset + offset + 4, (this.opColor[1] << 16) | this.opColor[2]);
      return offset + 8;
    }
  }

  export var SELF_CONTAINED_DATA_REFERENCE_FLAG = 0x000001;

  export class DataEntryUrlBox extends FullBox {
    private _encodedLocation: Uint8Array;

    constructor(flags: number,
                public location: string = null) {
      super('url ', 0, flags);
      if (!(flags & SELF_CONTAINED_DATA_REFERENCE_FLAG)) {
        this._encodedLocation = utf8decode(location);
      }
    }

    public layout(offset: number): number {
      var size = super.layout(offset);
      if (this._encodedLocation) {
        size += this._encodedLocation.length + 1;
      }
      return (this.size = size);
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      if (this._encodedLocation) {
        data.set(this._encodedLocation, this.offset + offset);
        data[this.offset + offset + this._encodedLocation.length] = 0;
        offset += this._encodedLocation.length;
      }
      return offset;
    }
  }

  export class DataReferenceBox extends FullBox {
    constructor(public entries: Box[]) {
      super('dref', 0, 0);
    }

    public layout(offset: number): number {
      var size = super.layout(offset) + 4;
      this.entries.forEach((entry) => {
        size += entry.layout(offset + size);
      });
      return (this.size = size);
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, this.entries.length);
      this.entries.forEach((entry) => {
        offset += entry.write(data);
      });
      return offset;
    }
  }

  export class DataInformationBox extends BoxContainerBox {
    constructor(public dataReference: Box) {
      super('dinf', [dataReference]);
    }
  }

  export class SampleDescriptionBox extends FullBox {
    constructor(public entries: Box[]) {
      super('stsd', 0, 0);
    }

    public layout(offset: number): number {
      var size = super.layout(offset);
      size += 4;
      this.entries.forEach((entry) => {
        size += entry.layout(offset + size);
      });
      return (this.size = size);
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, this.entries.length);
      offset += 4;
      this.entries.forEach((entry) => {
        offset += entry.write(data);
      });
      return offset;
    }
  }

  export class SampleTableBox extends BoxContainerBox {
    constructor(public sampleDescriptions: SampleDescriptionBox,
                public timeToSample: Box,
                public sampleToChunk: Box,
                public sampleSizes: Box, // optional?
                public chunkOffset: Box) {
      super('stbl', [sampleDescriptions, timeToSample, sampleToChunk, sampleSizes, chunkOffset]);
    }
  }

  export class MediaInformationBox extends BoxContainerBox {
    constructor(public header: Box, // SoundMediaHeaderBox|VideoMediaHeaderBox
                public info: DataInformationBox,
                public sampleTable: SampleTableBox) {
      super('minf', [header, info, sampleTable]);
    }
  }

  export class MediaBox extends BoxContainerBox {
    constructor(public header: MediaHeaderBox,
                public handler: HandlerBox,
                public info: MediaInformationBox) {
      super('mdia', [header, handler, info]);
    }
  }

  export class TrackBox extends BoxContainerBox {
    constructor(public header: TrackHeaderBox,
                public media: Box) {
      super('trak', [header, media]);
    }
  }

  export class TrackExtendsBox extends FullBox {
    constructor(public trackId: number,
                public defaultSampleDescriptionIndex: number,
                public defaultSampleDuration: number,
                public defaultSampleSize: number,
                public defaultSampleFlags: number) {
      super('trex', 0, 0);
    }

    public layout(offset: number): number {
      this.size = super.layout(offset) + 20;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, this.trackId);
      writeInt32(data, this.offset + offset + 4, this.defaultSampleDescriptionIndex);
      writeInt32(data, this.offset + offset + 8, this.defaultSampleDuration);
      writeInt32(data, this.offset + offset + 12, this.defaultSampleSize);
      writeInt32(data, this.offset + offset + 16, this.defaultSampleFlags);
      return offset + 20;
    }
  }

  export class MovieExtendsBox extends BoxContainerBox {
    constructor(public header: Box,
                public tracDefaults: TrackExtendsBox[],
                public levels: Box) {
      super('mvex', concatArrays<Box>([header], tracDefaults, [levels]));
    }
  }

  export class MetaBox extends FullBox {
    constructor(public handler: Box,
                public otherBoxes: Box[]) {
      super('meta', 0, 0);
    }
    public layout(offset: number): number {
      var size = super.layout(offset);
      size += this.handler.layout(offset + size);
      this.otherBoxes.forEach((box) => {
        size += box.layout(offset + size);
      });
      return (this.size = size);
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      offset += this.handler.write(data);
      this.otherBoxes.forEach((box) => {
        offset += box.write(data);
      });
      return offset;
    }
  }

  export class MovieFragmentHeaderBox extends FullBox  {
    constructor(public sequenceNumber: number) {
      super('mfhd', 0, 0);
    }

    public layout(offset: number): number {
      this.size = super.layout(offset) + 4;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, this.sequenceNumber);
      return offset + 4;
    }
  }

  export const enum TrackFragmentFlags {
    BASE_DATA_OFFSET_PRESENT = 0x000001,
    SAMPLE_DESCRIPTION_INDEX_PRESENT = 0x000002,
    DEFAULT_SAMPLE_DURATION_PRESENT = 0x000008,
    DEFAULT_SAMPLE_SIZE_PRESENT = 0x0000010,
    DEFAULT_SAMPLE_FLAGS_PRESENT = 0x000020,
  }

  export class TrackFragmentHeaderBox extends FullBox {
    constructor(flags: number,
                public trackId: number,
                public baseDataOffset: number,
                public sampleDescriptionIndex: number,
                public defaultSampleDuration: number,
                public defaultSampleSize: number,
                public defaultSampleFlags: number) {
      super('tfhd', 0, flags);
    }

    public layout(offset: number): number {
      var size = super.layout(offset) + 4;
      var flags = this.flags;
      if (!!(flags & TrackFragmentFlags.BASE_DATA_OFFSET_PRESENT)) {
        size += 8;
      }
      if (!!(flags & TrackFragmentFlags.SAMPLE_DESCRIPTION_INDEX_PRESENT)) {
        size += 4;
      }
      if (!!(flags & TrackFragmentFlags.DEFAULT_SAMPLE_DURATION_PRESENT)) {
        size += 4;
      }
      if (!!(flags & TrackFragmentFlags.DEFAULT_SAMPLE_SIZE_PRESENT)) {
        size += 4;
      }
      if (!!(flags & TrackFragmentFlags.DEFAULT_SAMPLE_FLAGS_PRESENT)) {
        size += 4;
      }
      return (this.size = size);
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      var flags = this.flags;
      writeInt32(data, this.offset + offset, this.trackId);
      offset += 4;
      if (!!(flags & TrackFragmentFlags.BASE_DATA_OFFSET_PRESENT)) {
        writeInt32(data, this.offset + offset, 0);
        writeInt32(data, this.offset + offset + 4, this.baseDataOffset);
        offset += 8;
      }
      if (!!(flags & TrackFragmentFlags.SAMPLE_DESCRIPTION_INDEX_PRESENT)) {
        writeInt32(data, this.offset + offset, this.sampleDescriptionIndex);
        offset += 4;
      }
      if (!!(flags & TrackFragmentFlags.DEFAULT_SAMPLE_DURATION_PRESENT)) {
        writeInt32(data, this.offset + offset, this.defaultSampleDuration);
        offset += 4;
      }
      if (!!(flags & TrackFragmentFlags.DEFAULT_SAMPLE_SIZE_PRESENT)) {
        writeInt32(data, this.offset + offset, this.defaultSampleSize);
        offset += 4;
      }
      if (!!(flags & TrackFragmentFlags.DEFAULT_SAMPLE_FLAGS_PRESENT)) {
        writeInt32(data, this.offset + offset, this.defaultSampleFlags);
        offset += 4;
      }
      return offset;
    }
  }

  export class TrackFragmentBaseMediaDecodeTimeBox extends FullBox {
    constructor(public baseMediaDecodeTime: number) {
      super('tfdt', 0, 0);
    }

    public layout(offset: number): number {
      this.size = super.layout(offset) + 4;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, this.baseMediaDecodeTime);
      return offset + 4;
    }
  }

  export class TrackFragmentBox extends BoxContainerBox {
    constructor(public header: TrackFragmentHeaderBox,
                public decodeTime: TrackFragmentBaseMediaDecodeTimeBox, // move after run?
                public run: TrackRunBox) {
      super('traf', [header, decodeTime, run]);
    }
  }

  export const enum SampleFlags {
    IS_LEADING_MASK = 0x0C000000,
    SAMPLE_DEPENDS_ON_MASK = 0x03000000,
    SAMPLE_DEPENDS_ON_OTHER = 0x01000000,
    SAMPLE_DEPENDS_ON_NO_OTHERS = 0x02000000,
    SAMPLE_IS_DEPENDED_ON_MASK = 0x00C00000,
    SAMPLE_HAS_REDUNDANCY_MASK = 0x00300000,
    SAMPLE_PADDING_VALUE_MASK = 0x000E0000,
    SAMPLE_IS_NOT_SYNC = 0x00010000,
    SAMPLE_DEGRADATION_PRIORITY_MASK = 0x0000FFFF,
  }

  export const enum TrackRunFlags {
    DATA_OFFSET_PRESENT = 0x000001,
    FIRST_SAMPLE_FLAGS_PRESENT = 0x000004,
    SAMPLE_DURATION_PRESENT = 0x000100,
    SAMPLE_SIZE_PRESENT = 0x000200,
    SAMPLE_FLAGS_PRESENT = 0x000400,
    SAMPLE_COMPOSITION_TIME_OFFSET = 0x000800,
  }

  export interface TrackRunSample {
    duration?: number;
    size?: number;
    flags?: number;
    compositionTimeOffset?: number;
  }

  export class TrackRunBox extends FullBox {
    constructor(flags: number,
                public samples: TrackRunSample[],
                public dataOffset?: number,
                public firstSampleFlags?: number) {
      super('trun', 1, flags);
    }

    public layout(offset: number): number {
      var size = super.layout(offset) + 4;
      var samplesCount = this.samples.length;
      var flags = this.flags;
      if (!!(flags & TrackRunFlags.DATA_OFFSET_PRESENT)) {
        size += 4;
      }
      if (!!(flags & TrackRunFlags.FIRST_SAMPLE_FLAGS_PRESENT)) {
        size += 4;
      }
      if (!!(flags & TrackRunFlags.SAMPLE_DURATION_PRESENT)) {
        size += 4 * samplesCount;
      }
      if (!!(flags & TrackRunFlags.SAMPLE_SIZE_PRESENT)) {
        size += 4 * samplesCount;
      }
      if (!!(flags & TrackRunFlags.SAMPLE_FLAGS_PRESENT)) {
        size += 4 * samplesCount;
      }
      if (!!(flags & TrackRunFlags.SAMPLE_COMPOSITION_TIME_OFFSET)) {
        size += 4 * samplesCount;
      }
      return (this.size = size);
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      var samplesCount = this.samples.length;
      var flags = this.flags;
      writeInt32(data, this.offset + offset, samplesCount);
      offset += 4;
      if (!!(flags & TrackRunFlags.DATA_OFFSET_PRESENT)) {
        writeInt32(data, this.offset + offset, this.dataOffset);
        offset += 4;
      }
      if (!!(flags & TrackRunFlags.FIRST_SAMPLE_FLAGS_PRESENT)) {
        writeInt32(data, this.offset + offset, this.firstSampleFlags);
        offset += 4;
      }
      for (var i = 0; i < samplesCount; i++) {
        var sample = this.samples[i];
        if (!!(flags & TrackRunFlags.SAMPLE_DURATION_PRESENT)) {
          writeInt32(data, this.offset + offset, sample.duration);
          offset += 4;
        }
        if (!!(flags & TrackRunFlags.SAMPLE_SIZE_PRESENT)) {
          writeInt32(data, this.offset + offset, sample.size);
          offset += 4;
        }
        if (!!(flags & TrackRunFlags.SAMPLE_FLAGS_PRESENT)) {
          writeInt32(data, this.offset + offset, sample.flags);
          offset += 4;
        }
        if (!!(flags & TrackRunFlags.SAMPLE_COMPOSITION_TIME_OFFSET)) {
          writeInt32(data, this.offset + offset, sample.compositionTimeOffset);
          offset += 4;
        }
      }
      return offset;
    }
  }

  export class MovieFragmentBox extends BoxContainerBox {
    constructor(public header: MovieFragmentHeaderBox,
                public trafs: TrackFragmentBox[]) {
      super('moof', concatArrays<Box>([header], trafs));
    }
  }

  export class MediaDataBox extends Box {
    constructor(public chunks: Uint8Array[]) {
      super('mdat');
    }

    public layout(offset: number): number {
      var size = super.layout(offset);
      this.chunks.forEach((chunk) => { size += chunk.length; });
      return (this.size = size);
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      this.chunks.forEach((chunk) => {
        data.set(chunk, this.offset + offset);
        offset += chunk.length;
      }, this);
      return offset;
    }
  }


  export class SampleEntry extends Box {
    constructor(format: string,
                public dataReferenceIndex: number) {
      super(format);
    }

    public layout(offset: number): number {
      this.size = super.layout(offset) + 8;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, 0);
      writeInt32(data, this.offset + offset + 4, this.dataReferenceIndex);
      return offset + 8;
    }
  }

  export class AudioSampleEntry extends SampleEntry {
    constructor(codingName: string,
                dataReferenceIndex: number,
                public channelCount: number = 2,
                public sampleSize: number = 16,
                public sampleRate: number = 44100,
                public otherBoxes: Box[] = null) {
      super(codingName, dataReferenceIndex);
    }

    public layout(offset: number): number {
      var size = super.layout(offset) + 20;
      this.otherBoxes && this.otherBoxes.forEach((box) => {
        size += box.layout(offset + size);
      });
      return (this.size = size);
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, 0);
      writeInt32(data, this.offset + offset + 4, 0);
      writeInt32(data, this.offset + offset + 8, (this.channelCount << 16) | this.sampleSize);
      writeInt32(data, this.offset + offset + 12, 0);
      writeInt32(data, this.offset + offset + 16, (this.sampleRate << 16));
      offset += 20;
      this.otherBoxes && this.otherBoxes.forEach((box) => {
        offset += box.write(data);
      });
      return offset;
    }
  }

  export var COLOR_NO_ALPHA_VIDEO_SAMPLE_DEPTH = 0x0018;

  export class VideoSampleEntry extends SampleEntry {
    constructor(codingName: string,
                dataReferenceIndex: number,
                public width: number,
                public height: number,
                public compressorName: string = '',
                public horizResolution: number = 72,
                public vertResolution: number = 72,
                public frameCount: number = 1,
                public depth: number = COLOR_NO_ALPHA_VIDEO_SAMPLE_DEPTH,
                public otherBoxes: Box[] = null) {
      super(codingName, dataReferenceIndex);
      if (compressorName.length > 31) {
        throw new Error('invalid compressor name');
      }
    }

    public layout(offset: number): number {
      var size = super.layout(offset) + 16 + 12 + 4 + 2 + 32 + 2 + 2;
      this.otherBoxes && this.otherBoxes.forEach((box) => {
        size += box.layout(offset + size);
      });
      return (this.size = size);
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      writeInt32(data, this.offset + offset, 0);
      writeInt32(data, this.offset + offset + 4, 0);
      writeInt32(data, this.offset + offset + 8, 0);
      writeInt32(data, this.offset + offset + 12, 0);
      offset += 16;
      writeInt32(data, this.offset + offset, (this.width << 16) | this.height);
      writeInt32(data, this.offset + offset + 4, encodeFloat_16_16(this.horizResolution));
      writeInt32(data, this.offset + offset + 8, encodeFloat_16_16(this.vertResolution));
      offset += 12;
      writeInt32(data, this.offset + offset, 0);
      writeInt32(data, this.offset + offset + 4, (this.frameCount << 16));
      offset += 6; // weird offset
      data[this.offset + offset] = this.compressorName.length;
      for (var i = 0; i < 31; i++) {
        data[this.offset + offset + i + 1] = i < this.compressorName.length ? (this.compressorName.charCodeAt(i) & 127) : 0;
      }
      offset += 32;
      writeInt32(data, this.offset + offset, (this.depth << 16) | 0xFFFF);
      offset += 4;
      this.otherBoxes && this.otherBoxes.forEach((box) => {
        offset += box.write(data);
      });
      return offset;
    }
  }

  export class RawTag extends Box {
    public data: Uint8Array;

    constructor(type: string, data: Uint8Array) {
      super(type);
      this.data = data;
    }
    public layout(offset: number): number {
      this.size = super.layout(offset) + this.data.length;
      return this.size;
    }

    public write(data: Uint8Array): number {
      var offset = super.write(data);
      data.set(this.data, this.offset + offset);
      return offset + this.data.length;
    }
  }
}
