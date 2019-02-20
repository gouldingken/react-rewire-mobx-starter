/**
 * Creates a new instance of HatchShader.
 * @class
 * @returns An instance of HatchShader.
 * @example
 * var instance = new HatchShader();
 */
import CustomShader from "./CustomShader";
import {Color, UniformsLib, UniformsUtils} from "three-full";

export default class HatchShader extends CustomShader {

    constructor(props) {
        super(props);
    }

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
        uniform float spacing;
        uniform float darken;
        uniform vec3 color;
//        uniform vec3 pointLightColor[MAX_POINT_LIGHTS];
//        uniform vec3 pointLightPosition[MAX_POINT_LIGHTS];
//        uniform float pointLightDistance[MAX_POINT_LIGHTS];
        
        void main() {
        
            vec3 outColor = vec3( 0.0 );
            
            float w = float(spacing);
            float m = mod( gl_FragCoord.x - gl_FragCoord.y , w );
        
            float a = 0.7;
            if( m == 0.0 ) {
                outColor = color;
            } else {
                outColor = color * darken;
                a = 0.5;
            }
            
            gl_FragColor = vec4( outColor, a );
//            vec4 lights = vec4(0.0, 0.0, 0.0, 1.0);
//            for(int i = 0; i < MAX_POINT_LIGHTS; i++) {
//                vec3 lightVector = normalize(vPosition - pointLightPosition[i]);
//                lights.rgb += clamp(dot(-lightVector, vNormal), 0.0, 1.0) * pointLightColor[i];
//            }
            
//            gl_FragColor = vec4( outColor, 1.0 ) * lights;
        
        }
        `;
    }

    get useLights() { return true; }

    get customUniforms() {
        return UniformsUtils.merge([UniformsLib['lights'], {
            spacing: {value: this.props.spacing || 5},
            darken: {value: this.props.darken || 0.5},
            color: {type: "c", value: new Color(this.props.color || '#fac502')},
        }]);
    }
}
