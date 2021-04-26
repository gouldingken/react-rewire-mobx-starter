import React, {Component} from 'react';
import {observer} from "mobx-react";
import createREGL from "regl";
import {loadFromSrc} from "../core/utils";

export default class ShadowAnimation extends Component {
    constructor(props) {
        super(props);
        this.loadedTextures = {};
        this.counter = 0;
        this.study = 'skanska-2d';//TODO make prop
    }

    setupCanvas(canvas) {
        if (this.regl) {
            //console.warn('REGL already created!!');
            return;//We only need to do this once, but setupCanvas is called each time a prop changes
        }
        this.regl = createREGL(canvas);
        const {regl} = this;
        this.draw = regl({
            // language=GLSL
            vert: `
                precision mediump float;
                attribute vec2 position;
                varying vec2 uv;
                void main () {
                    uv = 0.5 * (position + 1.0);
                    gl_Position = vec4(position, 0, 1);

                    //                 gl_Position = vec4(position, 0, 1);
                }
            `,
            // language=GLSL
            frag: `
                precision mediump float;
                uniform sampler2D textureBefore;
                uniform sampler2D textureAfter;
                uniform sampler2D textureAlt;
                uniform sampler2D textureGfx;

                uniform int frame;
                varying vec2 uv;

                //https://gist.github.com/EliCDavis/f35a9e4afb8e1c9ae94cce8f3c2c9b9a
                int AND(int n1, int n2){
                    float v1 = float(n1);
                    float v2 = float(n2);

                    int byteVal = 1;
                    int result = 0;

                    for (int i = 0; i < 32; i++){
                        bool keepGoing = v1>0.0 || v2 > 0.0;
                        if (keepGoing){

                            bool addOn = mod(v1, 2.0) > 0.0 && mod(v2, 2.0) > 0.0;

                            if (addOn){
                                result += byteVal;
                            }

                            v1 = floor(v1 / 2.0);
                            v2 = floor(v2 / 2.0);
                            byteVal *= 2;
                        } else {
                            return result;
                        }
                    }
                    return result;
                }

                void main () {
                    vec2 v_texcoord = vec2(uv.s, 1.0 - uv.t);
                    vec4 c = texture2D(textureBefore, v_texcoord);
                    vec4 c2 = texture2D(textureAfter, v_texcoord);
                    vec4 c3 = texture2D(textureAlt, v_texcoord);
                    vec4 gfx = texture2D(textureGfx, v_texcoord);

                    float fr = float(frame);
                    int activeByte = int(c.r * 255.);
                    int activeByte2 = int(c2.r * 255.);
                    int activeByte3 = int(c3.r * 255.);

                    if (frame > 15) {
                        activeByte = int(c.b * 255.);
                        activeByte2 = int(c2.b * 255.);
                        activeByte3 = int(c3.b * 255.);
                        fr = fr-16.;
                    } else if (frame > 7) {
                        activeByte = int(c.g * 255.);
                        activeByte2 = int(c2.g * 255.);
                        activeByte3 = int(c3.g * 255.);
                        fr = fr-8.;
                    }

                    int mask = int(pow(2., 7. - fr));
                    //See bit shifting examples here: C:\\Users\\kgoulding\\Documents\\Development\\JavaScript\\js-misc-rnd\\TopoViewer\\mrdoob\\js\\GPUParticleSystem.js

                    bool activeShadow = AND(mask, activeByte) > 0;
                    bool activeShadow2 = AND(mask, activeByte2) > 0;
                    bool activeShadow3 = AND(mask, activeByte3) > 0;
                    vec4 color;
                    if (activeShadow) {
                        color = vec4(0., 0.4, 0.2, 1.);
                    } else if (activeShadow2 || activeShadow3) {
                        if (activeShadow3 && !activeShadow2) {
                            color = vec4(0.6, 0., 0.2, 1.);
                        } else if (!activeShadow3 && activeShadow2) {
                            color = vec4(0.2, 0., 0.6, 1.);
                        } else { //BOTH
                            color = vec4(0.4, 0., 0.6, 1.);
                        }
                    } else {
                        color = vec4(1., 1., 1., 1.);
                    }
                    gl_FragColor = color * gfx;
                }
            `,
            attributes: {
                position: [
                    0, 4,
                    -4, -4,
                    4, -4,
                ]
            },

            uniforms: {
                textureBefore: regl.prop('before'),
                textureAfter: regl.prop('after'),
                textureAlt: regl.prop('alt'),
                textureGfx: regl.prop('gfx'),
                frame: regl.prop('frame'),
            },

            count: 3
        });
        this.start();
    }

    redraw() {
        //NOTE redraw does not call re-render, but updates the canvas using WebGL
        //properties such as counter are not stored in component state because they don't
        //require DOM changes
        let imageNum = Math.floor(this.counter / 24) * 24;
        const images = {
            before: this.loadedTextures['before_' + imageNum],
            after: this.loadedTextures['after_' + imageNum],
            alt: this.loadedTextures['alt_' + imageNum],
            gfx: this.loadedTextures['gfx'],
        }
        // console.log(imageNum, images.before)
        if (!(images.before && images.after)) return;

        this.draw({
            ...images,
            frame: this.counter % 24
        });
    };

    async loadImages(num) {
        const {regl, study} = this;
        const optionToCompare = 'option2';
        const altOption = 'option1';

        this.loadedTextures['before_' + num] = regl.texture(await loadFromSrc(`studies/${study}/data/context/bitmask_${num}.png`));
        this.loadedTextures['after_' + num] = regl.texture(await loadFromSrc(`studies/${study}/data/${optionToCompare}/bitmask_${num}.png`));
        this.loadedTextures['alt_' + num] = regl.texture(await loadFromSrc(`studies/${study}/data/${altOption}/bitmask_${num}.png`));
        this.loadedTextures['gfx'] = regl.texture(await loadFromSrc(`studies/${study}/img/linework.png`));
    }

    async loadMetaData() {
        const response = await fetch(`studies/${this.study}/data/jsonData.json`);
        return await response.json();
    }

    async start() {
        const jsonData = await this.loadMetaData();
        for (let i = 0; i < jsonData.imageList.length; i += 24) {//24 bits available for RGB (alpha not reliable)
            await this.loadImages(i);
        }

        this.redraw();
        // setInterval(() => {
        //     this.counter++;
        //     if (this.counter >= jsonData.imageList.length) this.counter = 0;
        //     // counter = 17;/
        //     this.redraw();
        // }, 30)
    }

    render() {
        const {store, minute, minuteStep} = this.props;
        const {width, height} = store.uiStore.canvasSize;

        const minNum = Math.floor(minute / minuteStep);
        if (this.counter !== minNum) {
            this.counter = minNum;
            console.log(this.counter);
            this.redraw();
        }

        return (
            <div className="ShadowAnimation">
                <canvas width={width} height={height}  ref={(e) => this.setupCanvas(e)}/>
            </div>
        );
    }
}
ShadowAnimation.defaultProps = {
    minuteStep: 3
}
observer(ShadowAnimation);
