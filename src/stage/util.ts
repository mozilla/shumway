/// <reference path='all.ts'/>
module Shumway.Util {
  var release = false;

  export class Color {
    private static colorCache;

    public static colorToNumber(color) {
      return color[0] << 24 | color[1] << 16 | color[2] << 8 | color[3];
    }

    public static parseColor(color) {
      if (!Color.colorCache) {
        Color.colorCache = Object.create(null);
      }
      if (Color.colorCache[color]) {
        return Color.colorCache[color];
      }
      // TODO: Obviously slow, but it will do for now.
      var span = document.createElement('span');
      document.body.appendChild(span);
      span.style.backgroundColor = color;
      var rgb = getComputedStyle(span).backgroundColor;
      document.body.removeChild(span);
      var m = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(rgb);
      if (!m) m = /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(rgb);
      var result = new Float32Array(4);
      result[0] = parseFloat(m[1]) / 255;
      result[1] = parseFloat(m[2]) / 255;
      result[2] = parseFloat(m[3]) / 255;
      result[3] = m[4] ? parseFloat(m[4]) / 255 : 1;
      return Color.colorCache[color] = result;
    }
  }

  export function clamp(x: number, min: number, max: number): number {
    if (x < min) {
      return min;
    } else if (x > max) {
      return max;
    }
    return x;
  }
}