varying float intensity;
void main() {
  vec3 glow = vec3(1.0, 1.0, 0) * intensity * 2.0;
    gl_FragColor = vec4( glow, 1.0 );
}