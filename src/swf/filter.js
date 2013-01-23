/**
 * Applies a blur box-filter, averaging pixel values in a box with radius (bw x bh).
 *
 * For example:
 *
 * +---+---+---+---+
 * | a | b | c | d |
 * +---+---+---+---+
 * | e | f | g | h |
 * +---+---+---+---+
 * | i | j | k | l |
 * +---+---+---+---+
 * | m | n | o | p |
 * +---+---+---+---+
 *
 * The output value of pixel |k| when |bw = bh = 1| is computed as: (f + g + h + j + k +
 * l + n + o + p) / 9. The total running time is O(w * h * bw * bh). We can do better if
 * we split the filter in two passes: horizontal and vertical.
 *
 * In the horizontal and vertical direction we can compute the blur using a sliding window
 * sum of length: (bw * 2 + 1) and (bh * 2 + 1) respectively. For instance, in the horizontal
 * direction:
 *
 * +---+---+---+---+---+---
 * | e | f | g | h | .... |
 * +---+---+---+---+---+---
 * |<-- hf  -->|
 *     |<-- hg  -->|
 *         |<-- hh  -->|
 *
 * hf = (e + f + g) / 3
 * hg = (f + g + h) / 3
 * hh = (g + h + .) / 3
 *
 * In the vertical direction, for |k| we get:
 *
 * vk = (hg + hk + ho) / 3 =
 *    = (f + g + h) / 3 + (j + k + l) / 3 + (n + o + p) / 3
 *    = (f + g + h + j + k + l + n + o + p) / 9
 *    = the original box filter.
 *
 * Each pass runs in O(w * h), independent of the box-filter size.
 */

/**
 * buffer Uint8Array
 * w      buffer width
 * h      buffer height
 * bw     blur width
 * bh     blur height
 */
function blur(buffer, w, h, bw, bh) {
  blurH(buffer, w, h, bw);
  blurV(buffer, w, h, bh);
}

function blurH(buffer, w, h, bw) {
  var line = new Uint8Array(w * 4);
  // slide window
  var slide = (bw << 1) + 1;
  var divTable = new Uint8Array(slide * 256);
  for (var i = 0; i < divTable.length; i++) {
    divTable[i] = i / slide;
  }
  for (var y = 0; y < h; y++) {
    var r = 0, g = 0, b = 0, a = 0;
    var pLine = y * (w << 2);

    // fill window
    for (var p = pLine, e = p + ((1 + (bw << 1)) << 2); p < e; p += 4) {
      r = (r + buffer[p + 0]) | 0;
      g = (g + buffer[p + 1]) | 0;
      b = (b + buffer[p + 2]) | 0;
      a = (a + buffer[p + 3]) | 0;
    }

    for (var p = pLine + (bw << 2), e = p + ((w - bw) << 2), k = (bw << 2),
             o = pLine, i = p + ((bw + 1) << 2);
         p < e;
         p += 4, k += 4, i += 4, o += 4) {
      line[k + 0] = divTable[r | 0];
      line[k + 1] = divTable[g | 0];
      line[k + 2] = divTable[b | 0];
      line[k + 3] = divTable[a | 0];

      r = (r + buffer[i + 0] - buffer[o + 0]) | 0;
      g = (g + buffer[i + 1] - buffer[o + 1]) | 0;
      b = (b + buffer[i + 2] - buffer[o + 2]) | 0;
      a = (a + buffer[i + 3] - buffer[o + 3]) | 0;
    }

    buffer.set(line, pLine);
  }
}

function blurV(buffer, w, h, bh) {
  var column = new Uint8Array(h * 4);
  var wordBuffer = new Uint32Array(buffer.buffer);
  var wordColumn = new Uint32Array(column.buffer);
  var stride = w << 2;

  var slide = (bh << 1) + 1;
  var divTable = new Uint8Array(slide * 256);
  for (var i = 0; i < divTable.length; i++) {
    divTable[i] = i / slide;
  }

  for (var x = 0; x < w; x++) {
    var r = 0, g = 0, b = 0, a = 0;
    var pColumn = x << 2;

    // fill window
    for (var p = pColumn, e = p + ((1 + (bh << 1)) * stride); p < e; p += stride) {
      r = (r + buffer[p + 0]) | 0;
      g = (g + buffer[p + 1]) | 0;
      b = (b + buffer[p + 2]) | 0;
      a = (a + buffer[p + 3]) | 0;
    }

    // slide window
    for (var p = pColumn + (bh * stride),
             e = p + ((h - bh) * stride), k = (bh << 2),
             o = pColumn,
             i = p + ((bh + 1) * stride);
         p < e;
         p += stride, k += 4, i += stride, o += stride) {

      column[k + 0] = divTable[r | 0];
      column[k + 1] = divTable[g | 0];
      column[k + 2] = divTable[b | 0];
      column[k + 3] = divTable[a | 0];

      r = (r + buffer[i + 0] - buffer[o + 0]) | 0;
      g = (g + buffer[i + 1] - buffer[o + 1]) | 0;
      b = (b + buffer[i + 2] - buffer[o + 2]) | 0;
      a = (a + buffer[i + 3] - buffer[o + 3]) | 0;
    }

    for (var p = x, e = p + h * w, i = 0; p < e; p += w, i ++) {
      wordBuffer[p] = wordColumn[i];
    }
  }
}