/**
 * @license
 *
 * Shumway - A Flash™ runtime for iOS 5, written in pure JavaScript
 *
 * Copyright (c) 2010-2011 Tobias Schneider
 * Copyright (c) 2010-2011 uxebu Consulting Ltd. & Co. KG
 */

;(function(window){

'use strict';

/** @namespace */
var ns = window.Shumway = {};

var fcc = String.fromCharCode;
var max = Math.max;
var pow = Math.pow;
var push = [].push;
var slice = [].slice;

/**
 * @param {String} msg
 */
function fail(msg){
	throw Error(msg);
}

/**
 * @class SwfStream
 * @param {ArrayBuffer} buffer
 * @param {Number} offset (optional)
 */
var SwfStream = function(buffer, offset){
	var view = new DataView(buffer, offset || 0);
	view.__proto__ = SwfStream.prototype;
	view.bitBuffer = 0;
	view.bitsAvailable = 0;
	view.bytePos = 0;
	return view;
};
var proto = SwfStream.prototype;
proto.__proto__ = DataView.prototype;

/**
 *
 */
proto.align = function(){
	this.bitBuffer = this.bitsAvailable = 0;
};

/**
 * @param {Number} count
 * @returns {Number}
 */
proto.readBits = function(count){
	var val = this.readUnsignedBits(count);
	return val >> count - 1 ? ~val + 1 : val;
};

/**
 * Reads a 8-bit value.
 *
 * @returns {Number} int8
 */
proto.readByte = function(){
	return this.getInt8(this.bytePos++);
};

/**
 * @param {Number} count (optional)
 * @param {Number} precision (optional) 
 * @returns {Number}
 */
proto.readFixedPointBits = function(count, precision){
	return this.readBits(count || 16) * pow(2, -(precision || 16));
};

/**
 * Reads a 32-bit little-endian value.
 *
 * @returns {Number} int32
 */
proto.readInt = function(){
	var val = this.getInt32(this.bytePos, 1);
	this.bytePos += 4;
	return val;
};

/**
 * @returns {Rectangle}
 */
proto.readRect = function(){
	var numBits = this.readUnsignedBits(5);
	var x = this.readBits(numBits) / 20;
	var width = this.readBits(numBits) / 20 - x;
	var y = this.readBits(numBits) / 20;
	var height = this.readBits(numBits) / 20 - y;
	this.align();
	return { x: x, y: y, width: width, height: height };
};

/**
 * Reads a 16-bit little-endian value.
 *
 * @returns {Number} int16
 */
proto.readShort = function(){
	var val = this.getInt16(this.bytePos, 1);
	this.bytePos += 2;
	return val;
};

/**
 * @param {Number} length (optional)
 * @returns {String}
 */
proto.readString = function(length){
	if(length){
		var codes = this.slice(
			this.bytePos,
			this.bytePos += length
		);
		var i = length;
		if(!codes[--i]){
			codes.pop();
		}
	}else{
		var code, codes = [];
		var i = 0;
		var pos = this.bytePos;
		while(code = this.getUint8(pos++)){
			codes[i++] = code;
		}
		this.bytePos = pos;
	}
	return fcc.apply(null, codes);
};

/**
 * @param {Number} count
 * @returns {Number}
 */
proto.readUnsignedBits = function(count){
	var buffer = this.bitBuffer;
	var bufflen = this.bitsAvailable;
	var val = 0;
	while(count > bufflen){
		buffer = buffer << 8 | this.getUint8(this.bytePos++);
		bufflen += 8;
	}
	var i = count;
	while(i--){
		val = val * 2 + (buffer >> --bufflen & 0x01);
	}
	this.bitBuffer = buffer;
	this.bitsAvailable = bufflen;
	return val;
};

/**
 * Reads an unsigned 8-bit value.
 *
 * @returns {Number} uint8
 */
proto.readUnsignedByte = function(){
	return this.getUint8(this.bytePos++);
};

/**
 * Reads an unsigned 32-bit little-endian value.
 *
 * @returns {Number} uint32
 */
proto.readUnsignedInt = function(){
	var val = this.getUint32(this.bytePos, 1);
	this.bytePos += 4;
	return val;
};

/**
 * Reads an unsigned 16-bit little-endian value.
 *
 * @returns {Number} uint16
 */
proto.readUnsignedShort = function(){
	var val = this.getUint16(this.bytePos, 1);
	this.bytePos += 2;
	return val;
};

/**
 * @param {Number} begin
 * @param {Number} end (optional)
 * @returns {Array}
 */
proto.slice = function(begin, end){
	return slice.call(this.buffer, begin, end);
};

var codeLengthOrder =
	[16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

var distanceCodes = [];
var distanceExtraBits = [];
for(var i = 0, j = 0, code = 1; i < 30; ++i){
	distanceCodes[i] = code;
	code += 1 << (distanceExtraBits[i] = ~~((j += i > 2 ? 1 : 0) / 2));
}

var bitLengths = [];
for(var i = 0; i < 32; ++i){
	bitLengths[i] = 5;
}
var fixedDistanceTable = buildHuffmanTable(bitLengths);

var lengthCodes = [];
var lengthExtraBits = [];
for(var i = 0, j = 0, code = 3; i < 29; ++i){
	lengthCodes[i] = code - (i == 28 ? 1 : 0);
	code += 1 << (lengthExtraBits[i] = ~~((j += i > 4 ? 1 : 0) / 4 % 6));
}

for(var i = 0; i < 287; ++i){
	bitLengths[i] = i < 144 || i > 279 ? 8 : i < 256 ? 9 : 7;
}
var fixedLiteralTable = buildHuffmanTable(bitLengths);

/**
 * @param {Array} bitLengths
 * @returns {Uint32Array}
 */
function buildHuffmanTable(bitLengths){
	var maxBits = max.apply(null, bitLengths);
	var numLengths = bitLengths.length;
	var size = 0x01 << maxBits;
	var table = [];
	for(var code = 0, len = 1, skip = 2;
		len <= maxBits;
		code <<= 1, ++len, skip <<= 1){
		for(var i = 0; i < numLengths; ++i){
			if(bitLengths[i] === len){
				var lsb = 0;
				for(var j = 0; j < len; ++j){
					lsb = lsb * 2 + (code >> j & 0x01);
				}
				for(var k = lsb; k < size; k += skip){
					table[k] = (len << 16) | i;
				}
				++code;
			}
		}
	}
	table.maxBits = maxBits;
	return table;
}

/**
 * @class ZlibFilter
 * @param {DataView} view
 * @param {Number} offset (optional)
 */
var ZlibFilter = function(view, offset){
	if(!(this instanceof ZlibFilter)){
		return new ZlibFilter(view, offset);
	}
	/** @default view.bytePos */
	offset || (offset = view.bytePos);
	this.bitBuffer = 0;
	this.bitsAvailable = 0;
	this.buffer = [];
	this.byteLength = 0;
	this.byteOffset = 0;
	this.bytePos = 0;
	this.view = view;
	this._bitBuffer = 0;
	this._bitsAvailable = 0;
	var hdr = view.getUint16(offset);
	this._bytePos = offset + 2;
	if(hdr & 0x0f00 != 0x0800){
		fail();
	}
    if(hdr % 31){
		fail();
	}
	if(hdr & 0x20){
		fail();
	}
};
proto = ZlibFilter.prototype;
proto.__proto__ = SwfStream.prototype;

/**
 * @param {Object} codeTable
 * @returns {Number}
 */
proto.decode = function(codeTable){
	var buffer = this._bitBuffer;
	var bufflen = this._bitsAvailable;
	var maxBits = codeTable.maxBits;
	while(maxBits > bufflen){
	     buffer |= this.view.getUint8(this._bytePos++) << bufflen;
	     bufflen += 8;
	}
	var code = codeTable[buffer & (0x01 << maxBits) - 1];
	var len = code >> 16;
	if(!len){
		fail();
	}
	this._bitBuffer = buffer >>> len;
	this._bitsAvailable = bufflen - len;
	return code & 0xffff;
};

/**
 * Gets an unsigned 8-bit value.
 *
 * @param {Number} offset
 * @returns {Number} uint8 
 */
proto.getUint8 = function(offset){
	while(this.byteLength <= this.bytePos){
		this.readBlock();
	}
	return this.buffer[offset];
};

/**
 * @param {Uint32Array} literalTable
 * @param {Uint32Array} distanceTable
 */
proto.inflate = function(literalTable, distanceTable){
	var buffer = this.buffer;
	var bufflen = this.byteLength;
	for(var sym; (sym = this.decode(literalTable)) !== 256;){
		if(sym < 256){
			buffer[bufflen++] = sym;
		}else{
			sym -= 257;
			var len = lengthCodes[sym] + this.readZbits(lengthExtraBits[sym]);
			sym = this.decode(distanceTable);
			var distance = distanceCodes[sym] +
				this.readZbits(distanceExtraBits[sym]);
			var i = bufflen - distance;
			while(len--){
				buffer[bufflen++] = buffer[i++];
			}
		}
	}
	this.byteLength = bufflen;
};

/*
 *
 */
proto.readBlock = function(){
	if(this.eof){
		fail();
	}
	var hdr = this.readZbits(3);
	console.log(hdr >> 1);
	switch(hdr >> 1){
		case 0:
 			this._bitBuffer = this._bitsAvailable = 0;
			var view = this.view;
			var pos = this._bytePos;
 			var len = view.getUint16(pos);
			console.log(len);
			var nlen = view.getUint16(pos + 2);
			if(~nlen & 0xffff !== len){
				fail();
			}
			var begin = pos + 4;
			var end = this._bytePos = begin + len;
			push.apply(this.buffer, view.slice(begin, end));
			this.byteLength += len;
			break;
		case 1:
			this.inflate(fixedLiteralTable, fixedDistanceTable);
			break;
		case 2:
			var bitLengths = [];
			var numLiteralCodes = this.readZbits(5) + 257;
			var numDistanceCodes = this.readZbits(5) + 1;
			var numCodes = numLiteralCodes + numDistanceCodes;
			var numCodelengthCodes = this.readZbits(4) + 4;
			for(var i = 0; i < 19; ++i){
				bitLengths[codeLengthOrder[i]] =
					i < numCodelengthCodes ? this.readZbits(3) : 0;
			}
			var codeLengthTable = buildHuffmanTable(bitLengths);
			bitLengths = [];
			for(var i = 0, prevSym = 0; i < numCodes;){
				var k = 1;
				var sym = this.decode(codeLengthTable);
				switch(sym){
					case 16:
						k = this.readZbits(2) + 3;
						sym = prevSym;
						break;
					case 17:
						k = this.readZbits(3) + 3;
						sym = 0;
						break;
					case 18:
						k = this.readZbits(7) + 11;
						sym = 0;
						break;
					default:
						prevSym = sym;
				}
				while(k--){
					bitLengths[i++] = sym;
				}
			}
			var distanceTable = buildHuffmanTable(
				bitLengths.splice(numLiteralCodes, numDistanceCodes)
			);
			var literalTable = buildHuffmanTable(bitLengths);
			this.inflate(literalTable, distanceTable);
			break;
		default:
 			fail();
	}
	this.eof = hdr & 0x01;
};

/**
 * Reads a 8-bit value.
 *
 * @returns {Number} int8
 */
proto.readByte = function(){
	while(this.byteLength <= this.bytePos){
		this.readBlock();
	}
	var val = this.buffer[this.bytePos++];
	return val >> 7 ? ~val + 1 : val;
};

/**
 * Reads a 32-bit little-endian value.
 *
 * @returns {Number} int32
 */
proto.readInt = function(){
	var pos = this.bytePos += 4;
	while(this.byteLength < pos){
		this.readBlock();
	}
	var buffer = this.buffer;
	return buffer[pos - 4] | (buffer[pos - 3] << 8) |
		(buffer[pos - 2] << 16) | (buffer[pos - 1] << 24);
};

/**
 * Reads a 16-bit little-endian value.
 *
 * @returns {Number} int16
 */
proto.readShort = function(){
	var pos = this.bytePos += 2;
	while(this.byteLength < pos){
		this.readBlock();
	}
	var buffer = this.buffer;
	var val = buffer[pos - 2] | buffer[pos - 1] << 8;
	return val >> 7 ? ~val + 1 : val;
};

/**
 * Reads an unsigned 8-bit value.
 *
 * @returns {Number} uint8
 */
proto.readUnsignedByte = function(){
	while(this.byteLength <= this.bytePos){
		this.readBlock();
	}
	return this.buffer[this.bytePos++];
};

/**
 * Reads an unsigned 32-bit little-endian value.
 *
 * @returns {Number} uint32
 */
proto.readUnsignedInt = function(){
	var pos = this.bytePos += 4;
	while(this.byteLength < pos){
		this.readBlock();
	}
	var buffer = this.buffer;
	var val = buffer[pos - 4] | (buffer[pos - 3] << 8) |
		(buffer[pos - 2] << 16) | (buffer[pos - 1] << 24);
	return val >>> 0;
};

/**
 * Reads an unsigned 16-bit little-endian value.
 *
 * @returns {Number} uint16
 */
proto.readUnsignedShort = function(){
	var pos = this.bytePos += 2;
	while(this.byteLength < pos){
		this.readBlock();
	}
	var buffer = this.buffer;
	return buffer[pos - 2] | buffer[pos - 1] << 8;
};

/**
 * @param {Number} count
 * @return {Number}
 */
proto.readZbits = function(count){
	var buffer = this._bitBuffer;
	var bufflen = this._bitsAvailable;
	while(count > bufflen){
		buffer |= this.view.getUint8(this._bytePos++) << bufflen;
		bufflen += 8;
	}
	this._bitBuffer = buffer >>> count;
	this._bitsAvailable = bufflen - count;
	return buffer & ((0x01 << count) - 1);
};

/**
 * @param {Number} begin
 * @param {Number} end (optional)
 * @returns {Array}
 */
proto.slice = function(begin, end){
	while(this.byteLength <= end){
		this.readBlock();
	}
	return slice.call(this.buffer, begin, end);
};

/**
 * @param {HTMLElement|String} node
 * @param {Object} params (optional)
 * @returns
 */
ns.parse = function(buffer){
	//var url = params.src || params.data;
	//var xhr = new XMLHttpRequest;
	//xhr.open('GET', url);
	//xhr.responseType = 'arraybuffer';
	//xhr.onload = function(){
		var start = +new Date;
		var stream = new SwfStream(buffer);
		var b1 = stream.readByte();
		var b2 = stream.readByte();
		var b3 = stream.readByte();
		var b4 = stream.readByte();
		if(b2 === 87 && b3 === 83){
			var filelen = stream.readUnsignedInt();
			if(b1 === 67){
				stream = ZlibFilter(stream, stream.bytePos);
			}else if(b1 !== 70){
				fail();
			}
			var version = b4;
		}else if(b1 === 0xff && b2 === 0xd8 && b3 === 0xff && b4 === 0xe0){
			// JPG
		}else if(b1 & 0x89 && b2 === 80 && b3 === 71 && b4 === 78){
			// PNG
		}else if(b1 === 71 && b2 === 73 && b3 === 70 && b4 === 56){
			// GIF
		}else{
			fail();
		}
		var frameSize = stream.readRect();
		var frameRate = stream.readUnsignedShort() / 256;
		var frameCount = stream.readUnsignedShort();
		do{
			var hdr = stream.readUnsignedShort();
			var tagCode = hdr >> 6;
			var taglen = hdr & 0x3f;
			if(taglen === 0x3f){
				taglen = stream.readUnsignedInt();
			}
			switch(tagCode){
				default:
					stream._bytePos += taglen;
			}
		}while(tagCode);
		console.log(stream._bytePos);
	//};
	//xhr.onerror = function(){
	//	fail();
	//}
	//xhr.send();
};

})(this);
