precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_textureSize;
varying vec2 v_texCoord;
void main() {
  const int sampleRadius = 10;
  const int samples = sampleRadius * 2 + 1;
  vec2 one = vec2(1.0, 1.0) / u_textureSize;
  vec4 color = vec4(0, 0, 0, 0);
  for (int i = -sampleRadius; i <= sampleRadius; i++) {
    color += texture2D(u_image, v_texCoord + vec2(float(i) * one.x, 0));
  }
  color /= float(samples);
  gl_FragColor = color;
}