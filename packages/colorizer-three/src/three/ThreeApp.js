import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    LoadingManager,
    MeshLambertMaterial,
    DoubleSide,
    FrontSide,
    HemisphereLight,
    DirectionalLight,
    Box3,
    ExtrudeBufferGeometry,
    Shape,
    AmbientLight,
    PlaneGeometry,
    BasicShadowMap,
    TextureLoader,
    CubeGeometry,
    DirectionalLightHelper,
    CameraHelper,
    PCFSoftShadowMap,
    MeshPhongMaterial, LineBasicMaterial, Color
} from 'three';
import {Math as ThreeMath} from 'three';
import OrbitControls from 'orbit-controls-es6';
import OBJLoader from "./core/OBJLoader";
import ShapeExtrude from "./ShapeExtrude";
import MeshTween from "./MeshTween";
import Converter from "./Converter";
import {Emitter} from "sasaki-core";
import HatchShader from "./shaders/HatchShader";

/**
 * Creates a new instance of ThreeApp.
 * @class
 * @returns An instance of ThreeApp.
 * @example
 * var instance = new ThreeApp();
 */
export default class ThreeApp extends Emitter {
    constructor(holder, dataHandler, settings) {
        super();
        this.tweenObjects = [];
        this.materialObjects = [];
        this.optionObjects = [];
        this.holder = holder;
        this.settings = settings || {};

        /** @type ADataHandler */
        this.dataHandler = dataHandler;

        const width = this.holder.offsetWidth;
        const height = this.holder.offsetHeight;

        this.scene = new Scene();
        this.camera = new PerspectiveCamera(
            75,
            width / height,
            0.01,
            10000
        );
        this.camera.position.x = 10;
        this.camera.position.z = 10;
        this.camera.position.y = 10;

        this.renderer = new WebGLRenderer({antialias: true});
        this.renderer.setClearColor('#eeeeee');
        this.renderer.setSize(width, height);
        holder.appendChild(this.renderer.domElement);

        const material = new MeshBasicMaterial({color: '#433F81'});

        const light = new HemisphereLight('#fffce8', '#080820', 0.5);
        this.scene.add(light);

        const directionalLight = new DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(80, 100, -80);
        directionalLight.target.position.set(0, 0, 0);

        if (settings.useShadows) {

            this.renderer.shadowMap.enabled = true;
            // this.renderer.shadowMap.type = BasicShadowMap;
            this.renderer.shadowMap.type = PCFSoftShadowMap;
            this.setupShadowLight(directionalLight, true);

            this.addBasePlane();
        }
        this.scene.add(directionalLight);

        const ambient = new AmbientLight(0x404040, 0.7); // soft white light
        this.scene.add(ambient);

        const manager = this.getLoadingManager();

        const defaultMaterial = new MeshLambertMaterial({
            color: '#cac1df',
            side: DoubleSide,
            // transparent: true,
            // opacity: 0.7
        });

        const getId = (name) => {
            const bits = name.split(' ');
            let id = false;
            bits.forEach((bit, i) => {
                if (!id && bit.indexOf('_') > 0) {
                    id = bit;
                }
            });
            return id;
        };

        this.objectsById = {};

        const traverseAndId = (object) => {
            object.traverse((child) => {
                // console.log('CHILD ' + child.name + ':' + child.type);
                if (child.type === 'Mesh') {
                    const id = getId(child.name);
                    if (id) {
                        this.objectsById[id] = child;
                    }
                }
                // setMaterials(child, mat, cast, receive);

            });
        };

        const setMaterials = function (object, material, cast, receive) {
            object.traverse(function (child) {
                if (child instanceof Mesh) {
                    child.material = material;
                    child.castShadow = cast;
                    child.receiveShadow = receive;
                }
            });
        };

        if (this.dataHandler.useExtrudes) {
            this.dataHandler.getExtrudeObjects((extrudes) => {

                const meshTweens = {};
                extrudes.forEach((extrude, i) => {
                    if (extrude.tweenPaths) {
                        // console.log(extrude.group + ' -- tween extrude: ' + extrude.fromKey + ' -> ' + extrude.toKey);

                        if (!meshTweens[extrude.group]) {
                            meshTweens[extrude.group] = new MeshTween(this.scene, extrude.group);
                            this.tweenObjects.push(meshTweens[extrude.group]);
                        }
                        const meshTween = meshTweens[extrude.group];

                        extrude.tweenPaths.forEach((path, i) => {
                            let useOffset = extrude.offset && i > 0 && i < extrude.tweenPaths.length - 1;
                            let along = i / (extrude.tweenPaths.length - 1);
                            let depth = ThreeMath.lerp(extrude.fromDepth, extrude.toDepth, along);
                            let zPos = ThreeMath.lerp(extrude.fromZ, extrude.toZ, along);
                            let shapeExtrude = new ShapeExtrude(path, depth + ((useOffset) ? extrude.offset : 0), this.getColoredMaterial(extrude.color, 1, extrude.hatch));
                            if (this.settings.useShadows) {
                                shapeExtrude.mesh.castShadow = true;
                            }
                            this.addMaterialObject(shapeExtrude.mesh, extrude.color, extrude.id);
                            shapeExtrude.mesh.translateZ(zPos);
                            meshTween.add(shapeExtrude.mesh, extrude.fromKey, extrude.toKey);
                        });
                    } else if (extrude.path) {
                        let shapeExtrude = new ShapeExtrude(extrude.path, extrude.depth, this.getColoredMaterial(extrude.color, 1, extrude.hatch));
                        shapeExtrude.mesh.translateZ(extrude.z);
                        if (this.settings.useShadows) {
                            shapeExtrude.mesh.castShadow = !extrude.hatch;
                        }
                        if (extrude.option) {
                            this.optionObjects.push({object: shapeExtrude.mesh, option: extrude.option});
                        }
                        this.scene.add(shapeExtrude.mesh);

                    } else if (extrude.type === 'mesh') {//TODO rename 'extrude' to something more generic
                        let material = this.getColoredMaterial(extrude.color, 1, extrude.hatch);
                        let generateUvs = false;
                        if (extrude.properties && extrude.properties.texture) {
                            const texture = new TextureLoader().load(extrude.properties.texture);
                            material = new MeshPhongMaterial({map: texture});
                            generateUvs = true;
                        }
                        let mesh = Converter.getMesh(extrude, material, generateUvs);
                        if (extrude.properties && extrude.properties.receiveShadow) {
                            mesh.receiveShadow = true;
                        }
                        if (extrude.option) {
                            this.optionObjects.push({object: mesh, option: extrude.option});
                        }

                        this.scene.add(mesh);
                    } else if (extrude.type === 'curves') {
                        extrude.curves.forEach((segment, i) => {
                            let line = Converter.getLine(segment, this.getColoredLineMaterial(extrude.color, 0.7));
                            if (extrude.option) {
                                this.optionObjects.push({object: line, option: extrude.option});
                            }
                            this.scene.add(line);
                        });

                    }
                });

                this.emit('objects-ready');
            });
        }

        if (this.dataHandler.useObjLoader) {
            const loader = new OBJLoader(manager);
            loader.load(this.dataHandler.objFile, (object) => {
                object.position.y = 0;
                this.scene.add(object);
                traverseAndId(object);
                setMaterials(object, defaultMaterial, false, false);

                let scale = 0.01;
                object.scale.set(scale, scale, scale);
                const bbox = new Box3().setFromObject(object);
                object.position.x = -bbox.max.x / 2;
                object.position.y = -bbox.max.y / 2;
                object.position.z = -bbox.max.z / 2;

                Object.keys(this.objectsById).forEach((id) => {
                    this.setMaterial(id, this.dataHandler.getColor(id))
                });
            });
        }


        // this.cube = new Mesh(geometry, materialA);
        // this.cube.position.y = 2;
        // this.scene.add(this.cube);


        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enabled = true;
        controls.maxDistance = 1500;
        controls.minDistance = 0;

        this.size = {width: 0, height: 0};

        this.start();
    };

    getColoredLineMaterial(color, opacity = 1) {
        if (!this.coloredLineMaterials) this.coloredLineMaterials = {};
        const matId = color + '_' + opacity;
        if (!this.coloredLineMaterials[matId]) {
            const settings = {
                color: color,
                // linewidth: width -- Note: linewidth property is not supported on most WegGL platforms
                //consider using MeshLine implementation when thick lines are needed
            };
            if (opacity !== 1) {
                settings.transparent = true;
                settings.opacity = opacity;
            }
            this.coloredLineMaterials[matId] = new LineBasicMaterial(settings);
        }
        return this.coloredLineMaterials[matId];
    }

    getColoredMaterial(color, opacity, hatch) {
        if (!this.coloredMaterials) this.coloredMaterials = {};
        const matId = color + '_' + opacity + '_' + hatch;
        if (!this.coloredMaterials[matId]) {
            if (hatch) {
                this.coloredMaterials[matId] = new HatchShader({color: color, spacing: 4, darken: 0.8}).getMaterial();
            } else {
                const settings = {
                    color: color,
                    side: DoubleSide
                };
                if (opacity !== 1) {
                    settings.transparent = true;
                    settings.opacity = opacity;
                }
                this.coloredMaterials[matId] = new MeshPhongMaterial(settings);
            }
        }
        return this.coloredMaterials[matId];
    }

    setMaterial(id, color) {
        if (!this.objectsById || !this.objectsById[id]) return;
        const child = this.objectsById[id];
        if (!color) {
            child.visible = false;
        } else {
            child.visible = true;
            child.material = this.getColoredMaterial(color);
            child.castShadow = true;
            child.receiveShadow = false;
        }


    }

    getLoadingManager() {
        const manager = new LoadingManager();
        manager.onStart = function (url, itemsLoaded, itemsTotal) {
            //console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        };

        manager.onLoad = function () {
            //console.log('Loading complete!');
        };


        manager.onProgress = function (url, itemsLoaded, itemsTotal) {
            //console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
        };

        manager.onError = function (url) {
            //console.log('There was an error loading ' + url);
        };
        return manager;
    }

    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate.bind(this))
        }
    }

    stop() {
        cancelAnimationFrame(this.frameId)
    }

    animate() {
        this.checkSizeChange();
        this.updateScene();
        this.renderScene();
        this.frameId = requestAnimationFrame(this.animate.bind(this));
    }

    updateRendererSize() {
        const width = this.holder.offsetWidth;
        const height = this.holder.offsetHeight;

        //TODO for ortho
        // this.camera.left = 0;
        // this.camera.right = width;
        // this.camera.top = 0;
        // this.camera.bottom = -height;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.size.width = width;
        this.size.height = height;
        this.needsRender = true;
    }

    renderScene() {
        this.renderer.render(this.scene, this.camera);
    }

    checkSizeChange() {
        //an approach to handle code that requires a listener + event to make it behave more like a reactive component...
        //the downside is that it runs this check every animation frame, but that may not be as often as window resize events
        //and it's similar to recommended approaches for optimizing resize: https://developer.mozilla.org/en-US/docs/Web/Events/resize

        const width = this.holder.offsetWidth;
        const height = this.holder.offsetHeight;

        if (width !== this.size.width || height !== this.size.height) {
            console.log('SIZE UPDATE');
            this.updateRendererSize();
        }

    }

    setupShadowLight(light, useHelper) {
        const size = this.settings.shadowSize || 100;

        light.shadow.camera.near = 10;
        light.shadow.camera.far = size * 3;
        //
        light.shadow.mapSize.width = 2048;  // default 512
        light.shadow.mapSize.height = 2048;
        //

        light.shadow.camera.left = -size / 2;
        light.shadow.camera.right = size / 2;
        light.shadow.camera.top = size / 2;
        light.shadow.camera.bottom = -size / 2;

        light.castShadow = true;

        if (useHelper) {
            const helper = new CameraHelper(light.shadow.camera);
            this.scene.add(helper);
        }

    }

    updateScene() {
        if (!this.time) this.time = 0.1;
        this.time += 0.002;
        this.dataHandler.setTime(this.time);
        // console.log('UPDATE SCENE');
        this.tweenObjects.forEach((tweenObj, i) => {
            if (tweenObj.tick) {
                tweenObj.tick();
            }
        });
        Object.keys(this.objectsById).forEach((id) => {
            this.setMaterial(id, this.dataHandler.getColor(id))
        });
    }

    addExtrudeTest() {

        const shape = new Shape();
        const path = [
            {x: 0, y: 0},
            {x: 10, y: 0},
            {x: 10, y: 10},
            {x: 0, y: 10}];
        path.forEach((pos, i) => {
            if (i === 0) {
                shape.moveTo(pos.x, pos.y);
            } else {
                shape.lineTo(pos.x, pos.y);
            }
        });

        const extrudeSettings = {
            steps: 1,
            depth: 10,
            bevelEnabled: false
        };

        const geometry = new ExtrudeBufferGeometry(shape, extrudeSettings);
        const material = new MeshPhongMaterial({
            color: '#aef733',
            side: FrontSide,
            // opacity: 0.95,
            // transparent: true
        });
        const mesh = new Mesh(geometry, material);
        if (this.settings.useShadows) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        }
        mesh.rotateX(-Math.PI / 2);
        this.scene.add(mesh);
    }

    addBox() {
        const geometry = new BoxGeometry(20, 20, 20);
        const material = new MeshPhongMaterial({
            color: '#aef733',
            side: FrontSide,
            // opacity: 0.95,
            // transparent: true
        });
        const box = new Mesh(geometry, material);
        // box.position.set(10, 0, 100);
        box.rotation.set(Math.PI / 2, Math.PI / 4, Math.PI / 8);
        // box.rotateX(-Math.PI / 2);

        if (this.settings.useShadows) {
            box.castShadow = true;
            box.receiveShadow = true;
        }
        this.scene.add(box);
    }

    addBasePlane() {
        return;
        // this.addExtrudeTest();
        // this.addBox();

        const geometry = new PlaneGeometry(100, 100, 1);
        const material = new MeshPhongMaterial({
            color: '#f7f7f7',
            side: FrontSide,
            // opacity: 0.95,
            // transparent: true
        });
        this.basePlane = new Mesh(geometry, material);
        // this.basePlane.position.set(10, 0, 100);
        this.basePlane.rotation.set(-Math.PI / 2, 0, 0);
        // this.basePlane.rotateX(-Math.PI / 2);

        if (this.settings.useShadows) {
            // this.basePlane.castShadow = true;
            this.basePlane.receiveShadow = true;
        }
        this.scene.add(this.basePlane);
    }

    addMaterialObject(mesh, color, id) {
        const material = new MeshPhongMaterial({color: color});
        // const materialDim = new MeshBasicMaterial({
        //     color: color,
        //     wireframe: true
        // });
        const materialDim = new MeshPhongMaterial({
            color: color,
            side: FrontSide,
            opacity: 0.1,
            transparent: true
        });
        const materialObj = {
            id: id,
            setHighlight: (highlight) => {
                if (!mesh.visible) return;
                if (highlight) {
                    mesh.material = material;
                    if (this.settings.useShadows) {
                        mesh.castShadow = true;
                    }
                } else {
                    mesh.material = materialDim;
                    if (this.settings.useShadows) {
                        mesh.castShadow = false;
                    }
                }
            }
        };

        this.materialObjects.push(materialObj);

    }
}
