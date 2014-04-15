FILTERS.colortransform = function(u8, width, height, rMul, gMul, bMul, rAdd, gAdd, bAdd) {
  width = width|0;
  height = height|0;
  var u32 = new Int32Array(u8.buffer);
  var pui8 = 0|0;
  //var pi32 = pui8|0;
  var n = Math.imul(width << 2, height)|0;
  var o = 0, p = (0.0), q = (0.0), r = (0.0), s = 0, t = 0, u = 0, v = 0, w = 0;
  height = pui8 + n|0;
  if ((n|0) > 0) { o = pui8; } else { return; }
  while(1){
    p = +(u8[pui8      ]|0) * rMul + rAdd;
    q = +(u8[pui8 + 1|0]|0) * gMul + gAdd;
    r = +(u8[pui8 + 2|0]|0) * bMul + bAdd;
    s =   u8[pui8 + 3|0]|0;
    if (p > (255.0)) { t = 255; } else { t = p<(0.0) ? 0 : ~~p; }
    if (q > (255.0)) { u = 65280; } else { u = q<(0.0) ? 0 : ~~q<<8; }
    if (r > (255.0)) { v = 16711680; } else { v = r<(0.0) ? 0 : ~~r<<16; }
    u32[o>>2] = u | t | v | (~~s<<24);
    pui8 = o + 4|0;
    if (pui8>>>0 < height>>>0) { o = pui8; } else { break; }
  }
}
