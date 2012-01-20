var arr = [
	[0x00, 0x00, 0x00, 0x00],
	[0x01, 0x00, 0x00, 0x00],
    [0x02, 0x00, 0x00, 0x00],
    [0x04, 0x00, 0x00, 0x00],
    [0x08, 0x00, 0x00, 0x00],
    [0x10, 0x00, 0x00, 0x00],
    [0x20, 0x00, 0x00, 0x00],
    [0x40, 0x00, 0x00, 0x00],
    [0x80, 0x00, 0x00, 0x00],
    [0x1b, 0x00, 0x00, 0x00],
    [0x36, 0x00, 0x00, 0x00]
]; 

var sum = 0;

for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[i].length; j++) {
        arr[i][j] = sum;
        sum ++;
    }
}

for (var i = 0; i < arr.length; i++) {
	for (var j = 0; j < arr[i].length; j++) {
		sum += arr[i][j];
	}
}

trace("Array: " + arr);

trace("Sum: " + sum);

function byteArrayToHexStr(b) {
    var s = '';
    for (var i = 0; i < b.length; i++) {
        s += b[i].toString(16) + ' ';
    }
    return s;
}

var byteArray = new Array(32);
for (var i = 0; i < byteArray.length; i++) {
    byteArray[i] = i;
}

trace(byteArrayToHexStr(byteArray));

function encodeUTF8(str) {  // encode multi-byte string into utf-8 multiple single-byte characters 
	str = str.replace(
		/[\u0080-\\u07ff]/g,  // U+0080 - U+07FF = 2-byte chars
		function(c) { 
			var cc = c.charCodeAt(0);
			return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
	);
	str = str.replace(
		/[\\u0800-\\uffff]/g,  // U+0800 - U+FFFF = 3-byte chars
		function(c) { 
			var cc = c.charCodeAt(0); 
			return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
	);
	return str;
}

function decodeUTF8(str) {  // decode utf-8 encoded string back into multi-byte characters
	str = str.replace(
		/[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
		function(c) { 
			var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
			return String.fromCharCode(cc);
		}
	);
	str = str.replace(
		/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
		function(c) { 
			var cc = (c.charCodeAt(0) & 0x0f) << 12 | (c.charCodeAt(1) & 0x3f << 6) | c.charCodeAt(2) & 0x3f; 
			return String.fromCharCode(cc);
		}
	);
	return str;
}


trace(encodeUTF8("Hello \u00a9 World"));

trace(decodeUTF8(encodeUTF8("Hello \u00a9 World")));