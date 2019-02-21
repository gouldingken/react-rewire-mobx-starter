/**
 * Creates a new instance of PosterizeShaderPass. This shader will take 3 specific colors and
 * split them into exact RGB channels so they can be summed independently
 * @class
 * @returns An instance of PosterizeShaderPass.
 * @example
 * const posterizer = new ShaderPass(new PosterizeShaderPass());
 */
import AShaderPass from "./AShaderPass";
import {Color} from "three-full";

export default class PosterizeShaderPass extends AShaderPass {

    constructor() {
        super();
    };

    get uniforms() {
        return {
            "tDiffuse": {value: null},
            "targetColorR": {value: new Color(255, 0, 0)},
            "targetColorG": {value: new Color(255, 0, 0)},
            "targetColorB": {value: new Color(255, 0, 0)},
        };
    }

    get fragmentShader() {
        // language=GLSL
        return `
        uniform sampler2D tDiffuse;
        uniform vec3 targetColorR;
        uniform vec3 targetColorG;
        uniform vec3 targetColorB;
        
        varying vec2 vUv;
        
        void main() {			                
            vec4 s = texture2D(tDiffuse, vUv);
            
            if (s.a == 0.) {//ignore transparent
                gl_FragColor = vec4( 0. , 1. , 0. , 1. );
            } else {
                if (s.rgb == targetColorR) {
                    gl_FragColor = vec4( 1. , 0. , 0. , 1. );
                } else if (s.rgb == targetColorG) {
                    gl_FragColor = vec4( 0. , 1. , 0. , 1. );
                } else if (s.rgb == targetColorB) {
                    gl_FragColor = vec4( 0. , 0. , 1. , 1. );
                } else {
                    gl_FragColor = vec4( 0. , 0. , 0. , 1. );
                }
            }
                                
        }`;
    }
}
