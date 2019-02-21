/**
 * Creates a new instance of AShaderPass.
 * @class
 * @returns An instance of AShaderPass.
 * @example
 * var instance = new AShaderPass();
 */
export default class AShaderPass {

    constructor() {
    };

    get uniforms() {
        return {
            "map": {value: null},
        };
    }

    get vertexShader() {
        // language=GLSL
        return `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }`;
    }

    get fragmentShader() {
        throw 'AShaderPass ->  fragmentShader must be implemented in subclass';
    }
}
