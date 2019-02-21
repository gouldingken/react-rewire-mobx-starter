/**
 * Creates a new instance of HalveScaleShaderPass.
 * @class
 * @returns An instance of HalveScaleShaderPass.
 * @example
 * var instance = new HalveScaleShaderPass();
 */
import AShaderPass from "./AShaderPass";
import {Color} from "three-full";

export default class HalveScaleShaderPass extends AShaderPass {

    constructor() {
        super();
    };

    get uniforms() {
        return {
            "tDiffuse": {value: null},
            "uTexelSize": {value: 1.0},
            "uImageSize": {value: 1024.0},
            "uHalfTexelSize": {value: 0.5}
        };
    }

    get fragmentShader() {
        // language=GLSL
        return `
        uniform sampler2D tDiffuse;
        uniform float uTexelSize;
        uniform float uHalfTexelSize;
        uniform float uImageSize;

        varying vec2 vUv;

        void main() {

            if (vUv.x > uImageSize) {
                gl_FragColor = vec4(0. ,1., 0., 1.);
                return;
            }
            if ((1. - vUv.y) > uImageSize) {
                //TEMP using this to visualize which shader level is reached
                if (uImageSize == 0.03125) {//16
                    gl_FragColor = vec4(0. ,1., 1., 1.);	
                    return;
                }
                if (uImageSize == 0.0625) {//32
                    gl_FragColor = vec4(0.5 ,0.5, 1., 1.);	
                    return;
                }
                if (uImageSize == 0.125) {//64
                    gl_FragColor = vec4(0.5 ,0.5, 0., 1.);	
                    return;
                }
                gl_FragColor = vec4(0. ,1., 0., 1.);	
                return;
            }
            //read original texture
            vec4 t = texture2D(tDiffuse, vUv);

            //expand the UVs and then read data from neighbours
                float oneMinusHalfTexelSize = 1.0 - uHalfTexelSize;
            vec2 expandedUv = vec2(
                (vUv.x - uHalfTexelSize) * 2.0 + uHalfTexelSize,
                (vUv.y - oneMinusHalfTexelSize) * 2.0 + oneMinusHalfTexelSize
            );
            
            vec3 v1 = texture2D(tDiffuse, expandedUv).rgb;
            vec3 v2 = texture2D(tDiffuse, expandedUv + vec2(uTexelSize, 0.0)).rgb;
            vec3 v3 = texture2D(tDiffuse, expandedUv + vec2(uTexelSize, -uTexelSize)).rgb;
            vec3 v4 = texture2D(tDiffuse, expandedUv + vec2(0.0, -uTexelSize)).rgb;

            //avg of values
            vec3 final = (v1 + v2 + v3 + v4) / 4.;
            
            gl_FragColor = vec4(final ,1.);					
        }`;
    }
}
