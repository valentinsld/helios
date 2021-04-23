varying float intensity;
uniform float intensityMultiplicator;
uniform vec3 color;
void main() {
  vec3 glow = color.rgb * intensity * intensityMultiplicator;
    gl_FragColor = vec4( glow, 1.0 );
}