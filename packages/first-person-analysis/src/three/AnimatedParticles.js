import {
    BufferGeometry,
    AdditiveBlending,
    NormalBlending,
    Points,
    // AxisHelper,
    Vector2,
    Vector3,
    ImageUtils,
    BufferAttribute,
    ShaderMaterial
} from 'three-full';

export default class AnimatedParticles {
    static _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static _clamp(obj, props, min, max) {
        for (let prop of props) {
            obj[prop] = Math.min(Math.max(obj[prop], min), max);
        }
    }

    static _attributeKeys(propKeys) {
        const keyMatch = {
            'position': ['position', 'position_to'],//special case since 'position' is hard-coded in ThreeJSs
        };

        for (let k of propKeys) {
            keyMatch[k] = [k + '_from', k + '_to']
        }
        return keyMatch;
    }

    constructor(numberOfPoints) {
        this.showAxisHelper = false;
        this.tweenTransforms = false;

        this.animationTime = 0;
        this.animationPos = 0;

        this.minimumColorValue = 0.15;//useful for ensuring colors 'glow' white when overlapping

        this.easingFunction = (v) => {
            return v
        };

        this.numberOfPoints = numberOfPoints;
        this.fromProperties = {
            r: new Float32Array(this.numberOfPoints),
            g: new Float32Array(this.numberOfPoints),
            b: new Float32Array(this.numberOfPoints),
            a: new Float32Array(this.numberOfPoints),
            size: new Float32Array(this.numberOfPoints),
        };
        this.toProperties = {
            r: new Float32Array(this.numberOfPoints),
            g: new Float32Array(this.numberOfPoints),
            b: new Float32Array(this.numberOfPoints),
            a: new Float32Array(this.numberOfPoints),
            size: new Float32Array(this.numberOfPoints),
        };

        this.fromPositions = new Float32Array(this.numberOfPoints * 3);
        this.toPositions = new Float32Array(this.numberOfPoints * 3);

        this.geometry = new BufferGeometry();

        //TODO add sprite support back in...
        this.additiveMaterial = this.getMaterial(AdditiveBlending, null, 32);
        this.normalFlatMaterial = this.getMaterial(NormalBlending, null, 23);
        this.normalMaterial = this.getMaterial(NormalBlending, null, 23);
        this.squareMaterial = this.getMaterial(NormalBlending, null, 23);

        this.activeMaterial = this.squareMaterial;

        const keys = Object.keys(this.fromProperties);
        for (let i = 0; i < this.numberOfPoints; i++) {
            for (let k of keys) {
                this.fromProperties[k][i] = 0.1;
                this.toProperties[k][i] = 0.1;
            }
        }

        this.particles = new Points(this.geometry, this.activeMaterial);
        // this.particles.rotateX(-Math.PI / 2);
        this.particles.frustumCulled = false;//prevent hiding
        if (this.showAxisHelper) {
            // this.axisHelper = new AxisHelper(300);
        }

        this.screenPosition = new Vector2(0, 0);

        this.transformation = {
            position: {
                from: new Vector3(0, 0, 0),
                to: new Vector3(0, 0, 0),
            },
            scale: {
                from: 1,
                to: 1
            }
        };
    }

    setStyleMode(style) {
        if (style === 'squares') {
            this.activeMaterial = this.squareMaterial;
        } else if (style === 'glow') {
            this.activeMaterial = this.additiveMaterial;
        } else if (style === 'flat') {
            this.activeMaterial = this.normalFlatMaterial;
        } else {
            this.activeMaterial = this.normalMaterial;
        }
        this.particles.material = this.activeMaterial;
    }

    getTextureMaterial(blending, file, discW) {
        const discTexture = ImageUtils.loadTexture('./assets/' + file);
        const textW = 32;

        const discArea = Math.PI * (discW / 2) * (discW / 2);
        const discAreaPercent = discArea / (textW * textW);

        return this.getMaterial(blending, discTexture, discAreaPercent);
    };

    getMaterial(blending, texture, areaPercent) {
        //photoshop blending options: https://www.npmjs.com/package/glsl-blend
        //but the problem with a true multiply mode is that we can't access the background map textures
        //so we can't multiply those values with the dots
        //we could try postprocessing to at least manipulate the js output...
        //https://www.npmjs.com/package/postprocessing
        //actually, we can use mix-blend-mode: multiply; on the CSS for the canvas!!!

        //another approach to using shader glsl files and importing them into js https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk.js
        const vertexShader = () => {
            // language=GLSL
            return `
        attribute float size_from;
        attribute float size_to;
        
        attribute float r_from;
        attribute float g_from;
        attribute float b_from; 
        attribute float a_from; 
        
        attribute float r_to;
        attribute float g_to;
        attribute float b_to;
        attribute float a_to;
         
        attribute vec3 position_to;

        varying vec4 vColor;
        varying float size_c;
        uniform float animationPos;
        uniform float textureArea;
        uniform float textureLod;
         
        void main() {
            vec4 pos = vec4(position * (1.0 - animationPos) + position_to * animationPos, 1.0);
            vColor = vec4(
                r_from * (1.0 - animationPos) + r_to * animationPos,
                g_from * (1.0 - animationPos) + g_to * animationPos,
                b_from * (1.0 - animationPos) + b_to * animationPos,            
                a_from * (1.0 - animationPos) + a_to * animationPos            
            );
            size_c = size_from * (1.0 - animationPos) + size_to * animationPos;
            
//            pos.x = 30.0;         
            
            if (vColor.a == 0.0) {
                size_c = 0.0;
                gl_PointSize = 1.0;
            } else {
                if (size_c > textureLod) {
                    gl_PointSize = size_c / textureArea; //account for reduced "area" of filled sprite vs square by increasing size           
                } else {
                    gl_PointSize = size_c; 
                }
            }    
            
            gl_Position = projectionMatrix * modelViewMatrix * pos;
        
        }
        `
        };
        const fragmentShader = () => {
            // language=GLSL
            return `
            varying vec4 vColor;
            varying float size_c;
            uniform sampler2D texture;
            uniform float textureLod;
			
			void main() {
			    
			    if (size_c > textureLod) {
                    gl_FragColor = clamp(vColor * texture2D( texture, gl_PointCoord ), 0.0, 1.0);			    
			    } else {
			        gl_FragColor = vColor;//if small, render as square
			    }
                
			}
        `
        };

        //"position" is used internally by ThreeJS so the name cannot change
        this.geometry.addAttribute('position', new BufferAttribute(this.fromPositions, 3));
        this.geometry.addAttribute('position_to', new BufferAttribute(this.toPositions, 3));

        const keys = Object.keys(this.fromProperties);
        for (let k of keys) {
            this.geometry.addAttribute(k + '_from', new BufferAttribute(this.fromProperties[k], 1));
            this.geometry.addAttribute(k + '_to', new BufferAttribute(this.toProperties[k], 1));
        }


        return new ShaderMaterial({
            uniforms: {
                texture: {type: "t", value: texture},
                textureArea: {value: areaPercent},
                // textureLod: {value:10000},//{value: (!!texture) ? 2 : 100000},//use halfway because size will usually be set to a round number and this prevents late "popping"
                textureLod: {value: (!!texture) ? 2 : 100000},//use halfway because size will usually be set to a round number and this prevents late "popping"
                animationPos: {value: this.animationPos}
            },
            depthWrite: true,
            // premultipliedAlpha: true,//This gives a different "GLOW" effect (and may also be needed for PNG to render correctly)
            transparent: true,
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader(),
            blending: blending,
        });
    }

    /**
     * set the properties to which to animate using an optional easing function
     * @param {Object[]} properties - an array of objects
     *      @param {Number} [properties[].x] - x position
     *      @param {Number} [properties[].y] - y position
     *      @param {Number} [properties[].size] - size in pixels
     *      @param {string} [properties[].color] - color in hex format (#ff0000)
     * @param {Function} [easingFn] - an easing function such as those found in the 'eases' package https://www.npmjs.com/package/eases
     */
    setProperties(properties, easingFn) {
        const propKeys = Object.keys(this.fromProperties);

        if (easingFn) {
            this.easingFunction = easingFn;
        }

        const keysWithChanges = {};

        const keyMatch = AnimatedParticles._attributeKeys(propKeys);

        //when setProperties is called, we switch the from position to be the current position of the nodes (even if in the middle of an animation)
        //these values are calculated internally in the shader, but we don't have access to them there

        const n = properties.length;
        if (!this.animationComplete) {
            // console.time('copyFromPrevious');
            for (let i = 0; i < n; i++) {
                for (let k of propKeys) {
                    const currentVal = this.fromProperties[k][i] * (1 - this.animationPos) + this.toProperties[k][i] * this.animationPos;
                    if (this.fromProperties[k][i] !== currentVal) {
                        this.fromProperties[k][i] = currentVal;
                        keysWithChanges[k] = true;
                    }
                }
                this.fromPositions[i * 3] = this.fromPositions[i * 3] * (1 - this.animationPos) + this.toPositions[i * 3] * this.animationPos;
                this.fromPositions[i * 3 + 1] = this.fromPositions[i * 3 + 1] * (1 - this.animationPos) + this.toPositions[i * 3 + 1] * this.animationPos;
            }

            this.transformation.position.from = this.transformation.position.from.lerp(this.transformation.position.from, this.animationPos);
            this.transformation.scale.from = this.transformation.scale.from * (1 - this.animationPos) + this.transformation.scale.to * this.animationPos;

            // console.timeEnd('copyFromPrevious');
        }

        // console.time('updateArrays');
        const keyCnt = propKeys.length;
        for (let i = 0; i < n; i++) {
            let obj = properties[i];
            if (obj.color) {
                this.injectRGB(obj, obj.color)
            }
            if (obj._visible === false) {
                obj.a = 0;
                obj.x = 0;
                obj.y = 0;
            }
            AnimatedParticles._clamp(obj, ['r', 'g', 'b', 'a'], 0, 1);
            for (let j = 0; j < keyCnt; j++) {
                const k = propKeys[j];
                if (obj[k] !== null) {
                    if (this.toProperties[k][i] !== obj[k]) {
                        this.toProperties[k][i] = obj[k];
                        keysWithChanges[k] = true;
                    }
                }
            }
            if (obj.x !== null) {
                if (this.toPositions[i * 3] !== obj.x) {
                    this.toPositions[i * 3] = obj.x;
                    keysWithChanges['position'] = true;
                }
            }
            if (obj.y !== null) {
                if (this.toPositions[i * 3 + 1] !== obj.y) {
                    this.toPositions[i * 3 + 1] = obj.y;
                    keysWithChanges['position'] = true;
                }
            }
            if (obj.z !== null) {
                if (this.toPositions[i * 3 + 2] !== obj.z) {
                    this.toPositions[i * 3 + 2] = obj.z;
                    keysWithChanges['position'] = true;
                }
            }
        }
        // console.timeEnd('updateArrays');


        for (let key of Object.keys(keysWithChanges)) {
            for (let attr of keyMatch[key]) {
                // console.log(`Needs update ${attr}`);
                this.geometry.attributes[attr].needsUpdate = true;
            }
        }

        this.startAnimation();
    }

    startAnimation() {
        //TODO if we set the same targets twice it won't call needsUpdate, but it will reset the animation
        this.setAnimationTime(0);
        this.animationComplete = false;
    }


    setEndToStart() {
        const propKeys = Object.keys(this.fromProperties);
        const keyMatch = AnimatedParticles._attributeKeys(propKeys);
        const n = this.numberOfPoints;
        // console.time('setEndToStart');
        for (let i = 0; i < n; i++) {
            for (let k of propKeys) {
                this.fromProperties[k][i] = this.toProperties[k][i];
            }
            this.fromPositions[i * 3] = this.toPositions[i * 3];
            this.fromPositions[i * 3 + 1] = this.toPositions[i * 3 + 1];
            this.fromPositions[i * 3 + 2] = this.toPositions[i * 3 + 2];
        }

        //once they are all reset, we need to push these changes through
        for (let key of Object.keys(keyMatch)) {
            for (let attr of keyMatch[key]) {
                // console.log(`Needs update ${attr}`);
                this.geometry.attributes[attr].needsUpdate = true;
            }
        }
        // this.geometry.verticesNeedUpdate = true;
        this.geometry.computeBoundingSphere();//if we don't recompute, then the point cloud object may be hidden if the current boundingSphere is not in view

        this.transformation.position.from = this.transformation.position.to;
        this.transformation.scale.from = this.transformation.scale.to;
        // console.timeEnd('setEndToStart');
    }

    setAnimationTime(val) {
        this.animationTime = Math.max(0, Math.min(1, val));
        this.animationPos = this.easingFunction(this.animationTime);
        this.activeMaterial.uniforms.animationPos.value = this.animationPos;

        if (!this.animationComplete) {
            this.updateTransforms();

            if (this.animationTime === 1) {
                this.animationComplete = true;
                this.setEndToStart();
            }
        }
    }

    step(amt) {
        const wasComplete = this.animationComplete;
        this.setAnimationTime(this.animationTime + amt);
        return !(wasComplete && this.animationComplete);//only report that nothing changes if it's complete and was complete already (to capture last frame)
    }

    getObject() {
        if (this.showAxisHelper) {
            return [this.particles];//this.axisHelper,
        }
        return [this.particles];
    }

    transform(position, scale, animate) {
        return;//TEMP disabling transforms...
        const pos = new Vector2(position.x - this.screenPosition.x, position.y);// - this.screenPosition.y);

        const hasChange = pos.x !== this.transformation.position.to.x ||
            -pos.y !== this.transformation.position.to.y ||
            scale !== this.transformation.scale.to;
        if (hasChange) {
            if (animate) {
                this.transformation.position.to = new Vector3(pos.x, -pos.y, 0);//Note negative y
                this.transformation.scale.to = scale;
                this.startAnimation();
            } else {
                this.transformation.position.to = new Vector3(pos.x, -pos.y, 0);//Note negative y
                this.transformation.scale.to = scale;
                this.transformation.position.from = new Vector3(pos.x, -pos.y, 0);//Note negative y
                this.transformation.scale.from = scale;
                this.updateTransforms();
            }
        }

        return hasChange;
    }

    injectRGB(obj, color) {
        let rgb = AnimatedParticles._hexToRgb(color);
        const minColor = this.minimumColorValue;
        if (!rgb) {
            obj.r = 0;
            obj.g = 0;
            obj.b = 0;
            obj.a = 0;
            return;
        }
        obj.r = Math.max(minColor, rgb.r / 255);
        obj.g = Math.max(minColor, rgb.g / 255);
        obj.b = Math.max(minColor, rgb.b / 255);
        if (obj.a === undefined) {
            obj.a = 1;
        }

    }

    updateTransforms() {
        return;//TEMP disabling transforms...
        let currentPos;
        let currentScale;
        if (this.tweenTransforms) {
            currentPos = this.transformation.position.from.lerp(this.transformation.position.to, this.animationPos);
            currentScale = this.transformation.scale.from * (1 - this.animationPos) + this.transformation.scale.to * this.animationPos;
        } else {
            currentPos = this.transformation.position.to;
            currentScale = this.transformation.scale.to;
        }

        this.particles.position.set(currentPos.x, currentPos.y, currentPos.z);
        this.particles.scale.set(currentScale, currentScale, 1);

        if (this.showAxisHelper) {
            // this.axisHelper.position.set(currentPos.x, currentPos.y, currentPos.z);
            // this.axisHelper.position.set(currentPos.x / 100, currentPos.y / 100, currentPos.z / 100);
        }
    }
}
