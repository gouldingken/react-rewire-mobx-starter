/**
 * Creates a new instance of AdderShaderPass.
 * @class
 * @returns An instance of AdderShaderPass.
 * @example
 * var instance = new AdderShaderPass();
 */
import AShaderPass from "./AShaderPass";

export default class AdderShaderPass extends AShaderPass {

    constructor() {
        super();
    };

    get uniforms() {
        return {
            "tDiffuse": {value: null},
            "tDiffuseB": {value: null},
        };
    }

    get fragmentShader() {
        // language=GLSL
        return `
uniform sampler2D tDiffuseA;
uniform sampler2D tDiffuseB;

varying vec2 vUv;

float toVal(vec4 texelColour) {
    float prec = 10000.0;
    vec3 dv = texelColour.xyz * 255.0;
    float val = (dv.r * 256.0 * 256.0) + (dv.g * 256.0) + dv.b;
    val = val / prec;

    return val;
}
vec4 fromVal(float val) {
    float prec = 10000.0;
    val = val * prec;

    float r = 0.0;
    float g = 0.0;
    float b = val;

    if (val > 255.0) {
        g = floor(val / 256.0);
        b = b - (g * 256.0);//mod?

        if (g > 255.0) {
            r = floor(g / 256.0);
            g = g - (r * 256.0);
        }
    }

    return vec4(r/255.0, g/255.0, b/255.0, 1.0);
}

void main() {			                
    vec4 sA = texture2D(tDiffuseA, vUv);
    vec4 sB = texture2D(tDiffuseB, vUv);
    
    float vA = toVal(sA);
    float vB = toVal(sB);
    
    gl_FragColor = fromVal(vA + vB);                    
}`;
    }
}
