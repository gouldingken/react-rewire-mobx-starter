/**
 * Creates a new instance of CubemapReprojector.
 * @class
 * @returns An instance of CubemapReprojector.
 * @example
 * var instance = new CubemapReprojector();
 */

import {
    Color,
    CubeCamera,
    WebGLRenderTarget,
    ShaderPass,
    LinearFilter,
    ClampToEdgeWrapping,
    RGBAFormat,
    UnsignedByteType,
} from 'three';
import LambertCylinderShaderPass from "./shaderPass/LambertCylinderShaderPass";
import LambertCircleShaderPass from "./shaderPass/LambertCircleShaderPass";

export default class CubemapReprojector {
    constructor(renderer, squareSize, bgColor, cylinderMode, posterize) {
        this.width = squareSize;
        this.height = squareSize;
        this.cylinderMode = cylinderMode;

        this.storedTextures = {};

        this.renderer = renderer;

        this.bgColor = (typeof bgColor === 'string') ? new Color(bgColor) : bgColor;

        this.cubeCamera = new CubeCamera(.1, 100000, 256);
        this.cubeCamera.rotation.y = -Math.PI / 2;//rotate so that N is up

        this.numberOfReductions = 4;

        const size = this.getSize();

        this.output = new WebGLRenderTarget(size.Width, size.Height, {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            format: RGBAFormat,
            type: UnsignedByteType
        });

        if (cylinderMode) {
            this.lambertCircle = new ShaderPass(new LambertCylinderShaderPass());
        } else {
            this.lambertCircle = new ShaderPass(new LambertCircleShaderPass());
        }

        this.createEffectComposer(posterize);

    };


    getSize() {
        return {
            Width: this.width,
            Height: this.height
        }
    }

    createEffectComposer(posterize) {
        if (posterize) {//can either use masking or a posterizer with the bgColor
            this.composer = new EffectComposer(this.renderer, this.output);

            this.composer.addPass(this.lambertCircle);
            let bgColor = this.bgColor;
            if (typeof bgColor === 'string') {
                bgColor = {channel1: new Color(bgColor)};
            }
            if (!bgColor.channel1) {
                bgColor = {channel1: bgColor};
            }
            Object.keys(bgColor).forEach((k) => {
                var color = bgColor[k];
                if (typeof color === 'string') {
                    bgColor[k] = new Color(color);
                }
            });
            this.posterizer = new ShaderPass(PosterizeShader);
            if (bgColor.channel1) this.posterizer.uniforms['targetColorR'].value = bgColor.channel1;
            if (bgColor.channel2) this.posterizer.uniforms['targetColorG'].value = bgColor.channel2;
            if (bgColor.channel3) this.posterizer.uniforms['targetColorB'].value = bgColor.channel3;
            // this.posterizer.renderToScreen = true;
            this.composer.addPass(this.posterizer);

            if (this.numberOfReductions % 2 === 1) {
                this.composer.addPass(new ShaderPass(DoNothingShader));
            }

            let imageSize = size.Width;
            for (let i = 0; i < this.numberOfReductions; i++) {
                imageSize /= 2;
                this.addReducer(this.composer, imageSize, i === this.numberOfReductions - 1, true);
            }
        } else {
            this.combinedOutput = new WebGLRenderTarget(size.Width, size.Height, {
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                wrapS: ClampToEdgeWrapping,
                wrapT: ClampToEdgeWrapping,
                format: RGBAFormat,
                type: UnsignedByteType
            });

            this.composer = new EffectComposer(this.renderer, this.output);
            this.combinedComposer = new EffectComposer(this.renderer, this.combinedOutput);

            // this.lambertCircle.renderToScreen = true;//TEMP
            this.composer.addPass(this.lambertCircle);

            this.textureMaskPass = new ShaderPass(MaskedTextureShader);
            // this.textureMaskPass.renderToScreen = true;//TEMP
            this.combinedComposer.addPass(this.textureMaskPass);

            if (this.numberOfReductions % 2 === 0) {
                this.combinedComposer.addPass(new ShaderPass(CopyShader));
            }

            let imageSize = size.Width;
            for (let i = 0; i < this.numberOfReductions; i++) {
                imageSize /= 2;
                this.addReducer(this.combinedComposer, imageSize, i === this.numberOfReductions - 1, true);
            }
        }
    }
}
