precision mediump float;

varying vec4 vColor;
uniform sampler2D uSampler[8];
varying vec2 vCoordinate;
varying float vKind;
varying float vSampler;

void main() {
  // gl_FragColor = vColor;
  // gl_FragColor = vec4(vTextureCoordinate.x, vTextureCoordinate.y, 0, 0.5);
  // gl_FragColor = gl_FragColor; // + texture2D(uSampler, vCoordinate);
  // gl_FragColor = texture2D(uSampler[0], vCoordinate);

  int kind = int(floor(vKind + 0.5));
  if (kind == 0) {
    gl_FragColor = vColor;
  } else if (kind == 1) {
    int sampler = int(floor(vSampler + 0.5));
    if (sampler == 0) {
      gl_FragColor = vColor * texture2D(uSampler[0], vCoordinate);
    } else if (sampler == 1) {
      gl_FragColor = vColor * texture2D(uSampler[1], vCoordinate);
    } else if (sampler == 2) {
      gl_FragColor = vColor * texture2D(uSampler[2], vCoordinate);
    } else if (sampler == 3) {
      gl_FragColor = vColor * texture2D(uSampler[3], vCoordinate);
    } else if (sampler == 4) {
      gl_FragColor = vColor * texture2D(uSampler[4], vCoordinate);
    } else if (sampler == 5) {
      gl_FragColor = vColor * texture2D(uSampler[5], vCoordinate);
    } else if (sampler == 6) {
      gl_FragColor = vColor * texture2D(uSampler[6], vCoordinate);
    } else if (sampler == 7) {
      gl_FragColor = vColor * texture2D(uSampler[7], vCoordinate);
    }
  } else {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
}