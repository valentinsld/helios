varying vec3 vColor;
varying vec4 vPosition;

float sdTriangle(in vec2 p, in vec2 p0, in vec2 p1, in vec2 p2) {
	vec2 e0 = p1 - p0;
	vec2 e1 = p2 - p1;
	vec2 e2 = p0 - p2;

	vec2 v0 = p - p0;
	vec2 v1 = p - p1;
	vec2 v2 = p - p2;

	vec2 pq0 = v0 - e0*clamp( dot(v0,e0)/dot(e0,e0), 0.0, 1.0 );
	vec2 pq1 = v1 - e1*clamp( dot(v1,e1)/dot(e1,e1), 0.0, 1.0 );
	vec2 pq2 = v2 - e2*clamp( dot(v2,e2)/dot(e2,e2), 0.0, 1.0 );
    
    float s = e0.x*e2.y - e0.y*e2.x;
    vec2 d = min( min( vec2( dot( pq0, pq0 ), s*(v0.x*e0.y-v0.y*e0.x) ),
                       vec2( dot( pq1, pq1 ), s*(v1.x*e1.y-v1.y*e1.x) )),
                       vec2( dot( pq2, pq2 ), s*(v2.x*e2.y-v2.y*e2.x) ));

	return -sqrt(d.x)*sign(d.y);
}

//http://thndl.com/square-shaped-shaders.html
float polygon(vec2 p, int vertices, float size) {
    float a = atan(p.x, p.y) + 0.2; 
    float b = 6.28319 / float(vertices);
    return cos(floor(0.5 + a / b) * b - a) * length(p) - size;
}

void main()
{
  // LightPoint Patern
  float strength = distance(vec2(0.5, 0.5), gl_PointCoord);
  strength = 1.0 - strength;
  strength = pow(strength, 3.0);

  // Final Color
  vec3 color = mix(vec3(0.0), vColor, strength);

  float opacity = 1.0 - smoothstep(100.0, 500.0, vPosition.y);
  gl_FragColor = vec4(color, opacity);


  // float d = 1.0 - polygon(gl_PointCoord - vec2(0.5, 0.5), 3, 0.01);
  // float opacity = smoothstep(0.6, 0.98, d);
  // vec3 color = vColor * d;

  // gl_FragColor = vec4(vColor, opacity);
}