/**
 * Creates a new instance of CustomRawShader.
 * @class
 * @returns An instance of CustomRawShader.
 * @example
 * var instance = new CustomRawShader();
 */
import {RawShaderMaterial, DoubleSide} from "three-full";

export default class CustomRawShader {

    constructor() {
    };

    get vertexShader() {
        // language=GLSL
        return `
attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vUv;

void main()  {

	vUv = vec2( 1.- uv.x, uv.y );
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
        `;
    }

    get fragmentShader() {
        throw 'CustomRawShader -> fragmentShader must be defined in overriding class';
    }

    get customUniforms() {
        return { map: {type: 't', value: null}};
    }

    getMaterial() {
        let parameters = {
            uniforms: this.customUniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            side: DoubleSide
        };
        return new RawShaderMaterial(parameters);
    }
}
