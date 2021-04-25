uniform vec3 colorBack;
uniform vec3 colorFront;

uniform float uStart;
uniform float uEnd;

varying vec4 vPosition;

void main()
{
  vec3 color = vec3(0.0353, 1.0, vPosition.z / 50.0);
  float force = smoothstep(uStart, uEnd, vPosition.z);
  color = mix(colorBack, colorFront, vec3(force));

  gl_FragColor = vec4(color, 1.0);
}