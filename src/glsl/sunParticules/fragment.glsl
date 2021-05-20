uniform vec3 uColor;

void main()
{
  vec2 newCoord = gl_PointCoord;

  // LightPoint Patern
  float strength = distance(vec2(0.5, 0.5), newCoord);
  // strength = 1.0 - strength * 1.2;
  // strength = pow(strength, 1.5);
  // strength = min(strength, 0.25);
  float opacity = 1.0 - smoothstep(0.1, 0.5, strength);
  opacity *= 0.3;

  // float opacity = 1.0 - smoothstep(0.6 , 1.0, vHeight);
  gl_FragColor = vec4(uColor, opacity);
}