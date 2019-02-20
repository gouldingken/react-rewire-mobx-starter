/**
 * Creates a new instance of MaskedTextureShaderPass.
 * @class
 * @returns An instance of MaskedTextureShaderPass.
 * @example
 * var instance = new MaskedTextureShaderPass();
 */
import AShaderPass from "./AShaderPass";
import {Color} from "three-full";

export default class MaskedTextureShaderPass extends AShaderPass {

    constructor() {
        super();
    };

    get uniforms() {
        return {
            "background": {value: null},
            "mask": {value: null},
            "foreground": {value: null},
            "maskColor": {value: new Color(255, 0, 0)},
        };
    }

    get fragmentShader() {
        // language=GLSL
        return `
        uniform sampler2D background;
        uniform sampler2D mask;
        uniform sampler2D foreground;
        uniform vec3 maskColor;

        varying vec2 vUv;

        void main() {
            vec4 sample = texture2D(mask, vUv);
                    
            if (sample.a == 0.) {//ignore transparent
                gl_FragColor = vec4( 0. , 0. , 0. , 0. );
            } else {
                if (sample.rgb == maskColor) {
                    gl_FragColor = texture2D(foreground, vUv);
                } else {
                    gl_FragColor = texture2D(background, vUv);
                }
            }										
        }
        `;
    }
}
