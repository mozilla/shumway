precision mediump float;
uniform sampler2D u_image;
uniform mat4 u_colorMatrix;
uniform vec4 u_vector;
varying vec2 v_texCoord;
void main() {
  gl_FragColor = u_colorMatrix * texture2D(u_image, v_texCoord) + u_vector;
}