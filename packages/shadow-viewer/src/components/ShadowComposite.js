import React, {Component} from 'react';
import {observer} from "mobx-react";
import createREGL from 'regl';
import {loadFromSrc} from "../core/utils";

export default class ShadowComposite extends Component {
    constructor(props) {
        super(props);
        this.loadedTextures = {};
        this.styleNum = 0;
    }

    setupCanvas(canvas) {
        if (this.regl) {
            // console.warn('REGL already created!!');
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
                uniform sampler2D textureA;
                uniform sampler2D textureB;
                uniform sampler2D textureDiff;
                uniform sampler2D textureGfx;
                uniform int style;
                varying vec2 uv;

                float toVal(vec4 texelColour) {
                    float prec = 1.0;
                    float val = texelColour.r * 256.0 * 256.0 + texelColour.g * 256.0 + texelColour.b;
                    val = val / prec;

                    return val * 255.;
                }

                vec4 blendMultiply(vec4 base, vec4 blend) {
                    return base*blend;
                }

                vec4 blendMultiply(vec4 base, vec4 blend, float opacity) {
                    return (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));
                }

                vec4 colorDiff(float v) {
                    if (v <= 5.) return vec4(255./255., 255./255., 255./255., 1.);
                    if (v <= 10.) return vec4(255./255., 255./255., 224./255., 1.);
                    if (v <= 15.) return vec4(255./255., 224./255., 169./255., 1.);
                    if (v <= 20.) return vec4(255./255., 190./255., 132./255., 1.);
                    if (v <= 25.) return vec4(255./255., 0./255., 0./255., 1.);
                    if (v <= 30.) return vec4(230./255., 0./255., 4./255., 1.);
                    if (v <= 35.) return vec4(206./255., 0./255., 14./255., 1.);
                    if (v <= 40.) return vec4(184./255., 0./255., 25./255., 1.);
                    if (v <= 45.) return vec4(160./255., 0./255., 38./255., 1.);
                    if (v <= 50.) return vec4(136./255., 0./255., 53./255., 1.);
                    if (v <= 55.) return vec4(110./255., 0./255., 74./255., 1.);
                    if (v <= 60.) return vec4(78./255., 0./255., 99./255., 1.);
                    return vec4(0./255., 0./255., 128./255., 1.);
                }

                vec4 colorHours(float v) {
                    if (v < 1.) return vec4(255./255., 255./255., 255./255., 1.);
                    if (v < 5.) return vec4(255./255., 255./255., 51./255., 1.);
                    if (v < 10.) return vec4(255./255., 180./255., 19./255., 1.);
                    if (v < 15.) return vec4(255./255., 110./255., 1./255., 1.);
                    if (v < 20.) return vec4(255./255., 51./255., 0./255., 1.);
                    if (v < 25.) return vec4(255./255., 0./255., 97./255., 1.);
                    if (v < 30.) return vec4(204./255., 18./255., 193./255., 1.);
                    if (v < 35.) return vec4(147./255., 18./255., 193./255., 1.);
                    if (v < 40.) return vec4(107./255., 18./255., 193./255., 1.);
                    if (v < 45.) return vec4(39./255., 2./255., 157./255., 1.);
                    return vec4(0./255., 12./255., 110./255., 1.);
                }

                void main () {
                    vec2 v_texcoord = vec2(uv.s, 1.0 - uv.t);
                    vec4 gfx = texture2D(textureGfx, v_texcoord);

                    vec4 color;
                    if (style == 0) {
                        float v = toVal(texture2D(textureDiff, v_texcoord));
                        color = colorDiff(v);
                    } else {
                        float v;
                        if (style == 1) {
                            v = toVal(texture2D(textureA, v_texcoord));
                        } else {
                            v = toVal(texture2D(textureB, v_texcoord));
                        }
                        color = colorHours(v);
                    }
                    gl_FragColor = blendMultiply(color, gfx);
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
                textureA: regl.prop('a'),
                textureB: regl.prop('b'),
                textureDiff: regl.prop('gB'),
                textureGfx: regl.prop('gfx'),
                style: regl.prop('style'),
            },

            count: 3
        });
        this.loadImages();
    }

    redraw() {
        const images = {
            gB: this.loadedTextures['gB'],
            a: this.loadedTextures['a'],
            b: this.loadedTextures['b'],
            gfx: this.loadedTextures['gfx'],
        }
        // console.log(imageNum, images.before)
        if (!(images.gB && images.a && images.b)) return;
        this.draw({
            ...images,
            style: this.styleNum
        });
    };

    async loadImages() {
        const optionToCompare = 'option 1';
        const study = 'skanska-2d';

        this.loadedTextures['gB'] = this.regl.texture(await loadFromSrc(`studies/${study}/data/comp/sums_context_${optionToCompare}_gB.png`));
        this.loadedTextures['a'] = this.regl.texture(await loadFromSrc(`studies/${study}/data/comp/sums_context_${optionToCompare}_a.png`));
        this.loadedTextures['b'] = this.regl.texture(await loadFromSrc(`studies/${study}/data/comp/sums_context_${optionToCompare}_b.png`));
        this.loadedTextures['gfx'] = this.regl.texture(await loadFromSrc(`studies/${study}/img/linework.png`));

        this.redraw();
    }

    render() {
        const {store} = this.props;

        const {width, height} = store.uiStore.canvasSize;
        return (
            <div className="ShadowComposite">
                <canvas width={width} height={height} ref={(e) => this.setupCanvas(e)}/>
            </div>
        );
    }
}
observer(ShadowComposite);
