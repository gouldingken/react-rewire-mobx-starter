/**
 * Creates a new instance of CubemapToLambertCircle.
 * @class
 * @returns An instance of CubemapToLambertCircle.
 * @example
 * var instance = new CubemapToLambertCircle();
 */
import {CustomRawShader} from "colorizer-three";

export default class CubemapToLambertCircle {

    constructor(renderer) {

    };
}

class EqualAreaCircleShader extends CustomRawShader {

    get vertexShader() {
        // language=GLSL
        return `
attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vUv;

void main()  {
	vUv = vec2( 1.5 - uv.x * 3. , 1.5 - uv.y * 3. );
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
        `;
    }

    get fragmentShader() {
        // language=GLSL
        return `
precision mediump float;

uniform samplerCube map;

varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

void main()  {

	vec2 uv = vUv;

    // Project to Sphere
    float x2y2 = uv.x * uv.x + uv.y * uv.y;
    //vec3 sphere_pnt = vec3(2. * uv, x2y2 - 1.) / (x2y2 + 1.);
    vec3 sphere_pnt = vec3(
      uv.x * sqrt(1. - x2y2 / 4.), 
      uv.y * sqrt(1. - x2y2 / 4.), 
      x2y2 / 2. - 1.
    );
    
    // Convert to Spherical Coordinates
    float r = length(sphere_pnt);
    float longitude = atan(sphere_pnt.y, sphere_pnt.x);
    float latitude = acos(sphere_pnt.z / r);

	vec3 dir = vec3(
		- sin( longitude ) * sin( latitude ),
		- cos( latitude ), // negative looks up, positive looks down
		- cos( longitude ) * sin( latitude )
	);
	normalize( dir );
	
	if (sphere_pnt.z > 0.) {
	    gl_FragColor = vec4( 0. , 0. , 0. , 0. );
	} else {
	    gl_FragColor = vec4( textureCube( map, dir ).rgb, 1. );
	}
}
        `;
    }
}