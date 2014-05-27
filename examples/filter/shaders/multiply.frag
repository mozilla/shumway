precision mediump float;
uniform sampler2D u_image;
uniform vec4 u_color;
varying vec2 v_texCoord;
void main() {
  gl_FragColor = texture2D(u_image, v_texCoord) * vec4(1.9, 1.0, 1.0, 1.0);
  gl_FragColor = texture2D(u_image, v_texCoord) * u_color;
}