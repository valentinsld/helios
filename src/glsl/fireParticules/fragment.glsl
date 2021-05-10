varying float vHeight;
varying vec3 vColor;
varying vec4 vPosition;

uniform float uHeight;
uniform float uLarge;
uniform float uDisparition;

//http://thndl.com/square-shaped-shaders.html
float polygon(vec2 p, int vertices, float size) {
    float a = atan(p.x, p.y) + 0.2; 
    float b = 6.28319 / float(vertices);
    return cos(floor(0.5 + a / b) * b - a) * length(p) - size;
}

void main()
{
  vec2 newCoord = gl_PointCoord;
  newCoord.x *= 1.5;

  // LightPoint Patern
  float strength = distance(vec2(0.5, 0.5), newCoord);
  strength = 1.0 - strength;
  strength = pow(strength, 3.0);

  // Final Color
  vec3 color = mix(vec3(0.0), vColor, strength);

  float opacity = 1.0 - smoothstep(0.6 , 1.0, vHeight);
  gl_FragColor = vec4(color, opacity);


  // float d = 1.0 - polygon(gl_PointCoord - vec2(0.5, 0.5), 3, 0.01);
  // float opacity = smoothstep(0.6, 0.98, d);
  // vec3 color = vColor * d;

  // gl_FragColor = vec4(vColor, opacity);
}