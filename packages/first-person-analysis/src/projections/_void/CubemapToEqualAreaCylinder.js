/**
 * Creates a new instance of CubemapToEqualAreaCylinder.
 * @class
 * @returns An instance of CubemapToEqualAreaCylinder.
 * @example
 * var instance = new CubemapToEqualAreaCylinder();
 */
import {CustomRawShader} from "colorizer-three";
import ACubemapReprojector from "./ACubemapReprojector";

export default class CubemapToEqualAreaCylinder extends ACubemapReprojector {

    constructor(renderer, provideCubeCamera, squareSize) {
        super(renderer, provideCubeCamera, squareSize);
    };

    get rawShader() {
        return new EqualAreaCylinderShader();
    }
}

class EqualAreaCylinderShader extends CustomRawShader {
    get fragmentShader() {
        // language=GLSL
        return `
precision mediump float;

uniform samplerCube map;

varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

void main()  {

	vec2 uv = vUv;
	float longitude = uv.x * 2. * M_PI - M_PI + M_PI / 2.;
	float latitude = acos(2. * uv.y - 1.);
	vec3 dir = vec3(
		- sin( longitude ) * sin( latitude ),
		cos( latitude ),
		- cos( longitude ) * sin( latitude )
	);
	normalize( dir );
	gl_FragColor = vec4( textureCube( map, dir ).rgb, 1. );

}
        `;
    }
}