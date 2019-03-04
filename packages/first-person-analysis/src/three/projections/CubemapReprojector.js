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
    UnsignedByteType, EffectComposer, CopyShader
} from 'three-full';
import LambertCylinderShaderPass from "./shaderPass/LambertCylinderShaderPass";
import LambertCircleShaderPass from "./shaderPass/LambertCircleShaderPass";
import PosterizeShaderPass from "./shaderPass/PosterizeShaderPass";
import HalveScaleShaderPass from "./shaderPass/HalveScaleShaderPass";
import MaskedTextureShaderPass from "./shaderPass/MaskedTextureShaderPass";
import PixelData from "./PixelData";

export default class CubemapReprojector {
    constructor(renderer, squareSize, bgColor, cylinderMode, posterize) {
        this.width = squareSize;
        this.height = squareSize;
        this.cylinderMode = cylinderMode;
        this.posterize = posterize;
        this.enabled = true;

        this.storedTextures = {};

        this.renderer = renderer;

        this.bgColor = (typeof bgColor === 'string') ? new Color(bgColor) : bgColor;

        this.cubeCamera = new CubeCamera(.1, 100000, 256);
        this.cubeCamera.rotation.y = -Math.PI / 2;//rotate so that N is up

        this.numberOfReductions = 4;

        if (cylinderMode) {
            this.height = Math.round(this.width / Math.PI);
        }
        const size = this.getSize();

        this.output = new WebGLRenderTarget(size.Width, size.Height, {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            format: RGBAFormat,
            type: UnsignedByteType
        });

        this.graphicsOutput = new WebGLRenderTarget(size.Width, size.Height, {
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

        this.createEffectComposer(this.posterize, size);
    };

    updateChannels(channels) {
        if (channels.channel1) this.posterizer.uniforms['targetColorR'].value = new Color(channels.channel1);
        if (channels.channel2) this.posterizer.uniforms['targetColorG'].value = new Color(channels.channel2);
        if (channels.channel3) this.posterizer.uniforms['targetColorB'].value = new Color(channels.channel3);
    }

    get aspectRatio() {
        return this.width / this.height;
    }

    getSize() {
        return {
            Width: this.width,
            Height: this.height
        }
    }

    createEffectComposer(posterize, size) {
        if (posterize) {//can either use masking or a posterizer with the bgColor
            this.composer = new EffectComposer(this.renderer, this.output);
            this.composer.addPass(this.lambertCircle);

            //graphic composer simply reprojects the image, but doesn't posterize or reduce
            this.graphicComposer = new EffectComposer(this.renderer, this.graphicsOutput);
            this.graphicComposer.addPass(this.lambertCircle);
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
            this.posterizer = new ShaderPass(new PosterizeShaderPass());
            if (bgColor.channel1) this.posterizer.uniforms['targetColorR'].value = bgColor.channel1;
            if (bgColor.channel2) this.posterizer.uniforms['targetColorG'].value = bgColor.channel2;
            if (bgColor.channel3) this.posterizer.uniforms['targetColorB'].value = bgColor.channel3;
            // this.posterizer.renderToScreen = true;
            this.composer.addPass(this.posterizer);

            if (this.numberOfReductions % 2 === 1) {
                this.composer.addPass(new ShaderPass(CopyShader));
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

            this.lambertCircle.renderToScreen = true;
            this.composer.addPass(this.lambertCircle);

            this.textureMaskPass = new ShaderPass(new MaskedTextureShaderPass());
            this.textureMaskPass.renderToScreen = true;
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

    invalidate() {
        this._needsRedraw = true;
    };

    addReducer(composer, imageSize, renderToScreen, enabled) {
        const res = this.getSize().Width;
        const texelSize = 1.0 / res;
        const effect = new ShaderPass(new HalveScaleShaderPass());
        effect.uniforms['uImageSize'].value = imageSize / res;
        effect.uniforms['uTexelSize'].value = texelSize;
        effect.uniforms['uHalfTexelSize'].value = texelSize / 2.0;
        effect.renderToScreen = renderToScreen;
        effect.enabled = enabled;
        composer.addPass(effect);
        if (renderToScreen) {
            this.lastReducer = effect;
        }
        console.log(`Added Reducer: ${imageSize} : ${imageSize / res} renderToScreen:${renderToScreen}`);
    }

    display(position, scene) {
        this.renderLambert(position, scene, true);
    }

    renderLambert(position, scene, toScreen) {
        this.lambertCircle.renderToScreen = toScreen;
        this.cubeCamera.position.copy(position);
        this.cubeCamera.update(this.renderer, scene);//TODO was updateCubeMap but this is deprecated?

        this.lambertCircle.uniforms['map'].value = this.cubeCamera.renderTarget.texture;
        if (toScreen) {
            this.composer.render();
        } else {
            //When not rendering to screen, this.graphicsOutput can be used to access the graphics
            this.graphicComposer.render();
        }
    }

    calculateAreas(positions, scene) {
        const pixelSets = [];
        if (!this.enabled) return pixelSets;
        this.lambertCircle.renderToScreen = false;
        if (this.lastReducer) this.lastReducer.renderToScreen = false;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            this.positionCubeCamera(position, scene);

            this.lambertCircle.uniforms['map'].value = this.cubeCamera.renderTarget.texture;
            this.composer.render();

            const reducedSize = this.getReducedSize(-1);

            let pixels = this.grabPixels(this.output);
            pixelSets.push({pixels: pixels, reducedSize: reducedSize});

            if (this.saveADebugImage) {
                const name = 'calculatePositions_';
                PixelData.saveImage(name, pixels, reducedSize.Width, reducedSize.Height);
            }
        }
        this.saveADebugImage = false;
        return pixelSets;
    };

    positionCubeCamera(position, scene) {
        // console.log(`Position camera ${position.x},${position.z}`);

        if (!this._needsRedraw) {
            if (this.cubeCamera.position.x === position.x && this.cubeCamera.position.y === position.y && this.cubeCamera.position.z === position.z) return;
        }

        this.cubeCamera.position.copy(position);
        this.cubeCamera.update(this.renderer, scene);

        this._needsRedraw = false;
    };

    grabPixels(output) {
        const size = this.getSize();
        const reducedSize = this.getReducedSize(-1);
        const readW = reducedSize.Width;
        const readH = reducedSize.Height;
        const pixels = new Uint8Array(4 * readW * readH);
        this.renderer.readRenderTargetPixels(output, 0, size.Height - readH, readW, readH, pixels);
        return pixels;
    };

    getReducedSize(offset) {
        const size = this.getSize();

        for (let i = 0; i < (this.numberOfReductions + offset); i++) {
            size.Width /= 2;
            size.Height /= 2;
        }

        return {
            Width: Math.round(size.Width),
            Height: Math.round(size.Height)
        };
    };


}
