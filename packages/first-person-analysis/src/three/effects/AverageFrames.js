import {CustomRawShader} from "colorizer-three";
import AFeedbackScene from "./AFeedbackScene";

/**
 * Creates a new instance of AverageFrames.
 * @class
 * @returns An instance of AverageFrames.
 * @example
 * var instance = new AverageFrames();
 */
export default class AverageFrames extends AFeedbackScene {
    constructor(renderer, width, height) {
        super(renderer, width, height);

        this.timer = 0;
        this.renderTargetA = this.createRenderTarget();
        this.renderTargetB = this.createRenderTarget();

    };

    get rawShader() {
        if (!this.averageFramesShader) {
            this.averageFramesShader = new AverageFramesShader();
        }
        return this.averageFramesShader;
    }

    clear() {
        this.timer = 0;
    }

    render(renderTargetScene, frameCount) {
        const {uniforms} = this.material;


        //Update time
        this.timer += 1;
        if (this.timer < frameCount) {
            // geomRender(textureG);
            //Draw to textureB
            this.renderer.render(this.scene, this.camera, this.renderTargetB, true);

            //Swap textureA and B
            const t = this.renderTargetA;
            this.renderTargetA = this.renderTargetB;
            this.renderTargetB = t;
            this.material.map = this.renderTargetB.texture;
            uniforms.bufferTexture.value = this.renderTargetA.texture;
            uniforms.sceneTexture.value = renderTargetScene.texture;
            uniforms.time.value = Math.round(this.timer);
        }
        this.renderer.render(this.scene, this.camera);

    }
}

class AverageFramesShader extends CustomRawShader {
    bufferTexture;
    sceneTexture;

    get fragmentShader() {
        // language=GLSL
        return `
precision mediump float;
varying vec2 vUv;
uniform sampler2D bufferTexture;//Our input texture
uniform sampler2D sceneTexture;
uniform float time;
void main() {
    vec4 sum = texture2D(bufferTexture, vUv);
    vec4 src = texture2D(sceneTexture, vUv);
    sum.rgb = sum.rgb * (time-1.) / time + src.rgb / time;
    if (time == 0.) {
        gl_FragColor = vec4(0., 0., 0., 1.);
    } else {
        gl_FragColor = sum;
    }
 }
        `;
    }

    get customUniforms() {
        return {
            time: {type: "f", value: 0},
            bufferTexture: {type: "t", value: this.bufferTexture},
            sceneTexture: {type: "t", value: this.sceneTexture}
        };
    }
}