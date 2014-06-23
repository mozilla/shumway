precision mediump float;
uniform sampler2D u_image;
uniform vec4 u_color;
varying vec2 v_texCoord;
void main() {
  // gl_FragColor = u_matrix * texture2D(u_image, v_texCoord) + u_vector;
  gl_FragColor = u_color * texture2D(u_image, v_texCoord).a;
}