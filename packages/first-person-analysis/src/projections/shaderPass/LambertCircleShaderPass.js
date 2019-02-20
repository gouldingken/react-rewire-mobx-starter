/**
 * Creates a new instance of LambertCircleShaderPass.
 * @class
 * @returns An instance of LambertCircleShaderPass.
 * @example
 * var instance = new LambertCircleShaderPass();
 */
import AShaderPass from "./AShaderPass";

export default class LambertCircleShaderPass extends AShaderPass {

    constructor() {
        super();
    };

    get vertexShader() {
        // language=GLSL
        return `
        #define M_RT2 1.41421356237
        varying vec2 vUv;
        void main() {
            vUv = vec2( M_RT2 - uv.x * 2. * M_RT2 , M_RT2 - uv.y * 2. * M_RT2 );
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
            float longitude = atan(sphere_pnt.y, sphere_pnt.x); //use -ve to look up at sky, +ve to look down at ground 
            float latitude = acos(sphere_pnt.z / r);
                
            vec3 dir = vec3(
                - sin( longitude ) * sin( latitude ),
                - cos( latitude ),
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
