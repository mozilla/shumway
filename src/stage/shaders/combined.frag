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

  if (vKind == 0.0) {
    gl_FragColor = vColor;
  } else if (vKind == 1.0) {
    if (vSampler == 0.0) {
      gl_FragColor = vColor * texture2D(uSampler[0], vCoordinate);
    } else if (vSampler == 1.0) {
      gl_FragColor = vColor * texture2D(uSampler[1], vCoordinate);
    } else if (vSampler == 2.0) {
      gl_FragColor = vColor * texture2D(uSampler[2], vCoordinate);
    } else if (vSampler == 3.0) {
      gl_FragColor = vColor * texture2D(uSampler[3], vCoordinate);
    } else if (vSampler == 4.0) {
      gl_FragColor = vColor * texture2D(uSampler[4], vCoordinate);
    } else if (vSampler == 5.0) {
      gl_FragColor = vColor * texture2D(uSampler[5], vCoordinate);
    } else if (vSampler == 6.0) {
      gl_FragColor = vColor * texture2D(uSampler[6], vCoordinate);
    } else if (vSampler == 7.0) {
      gl_FragColor = vColor * texture2D(uSampler[7], vCoordinate);
    }
  }
}