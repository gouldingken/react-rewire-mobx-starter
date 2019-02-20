/**
 * Creates a new instance of CustomShader.
 * @class
 * @returns An instance of CustomShader.
 * @example
 * var instance = new CustomShader();
 */
import {ShaderMaterial} from "three-full";

export default class CustomShader {

    constructor(props) {
        this.props = props;
    };

    get vertexShader() {
        // language=GLSL
        return `
        void main() 
        {
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition;
        }
        `;
    }

    get fragmentShader() {
        // language=GLSL
        return `
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
        `;
    }

    get useLights() {
        return false;
    }

    get customUniforms() {
        return {};
    }

    getMaterial() {
        let parameters = {
            uniforms: this.customUniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            lights: this.useLights,
            transparent: true
        };
        return new ShaderMaterial(parameters);
    }
}
