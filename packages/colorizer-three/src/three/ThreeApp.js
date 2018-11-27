import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    LoadingManager,
    MeshLambertMaterial,
    DoubleSide, FrontSide, HemisphereLight, DirectionalLight, Box3, ExtrudeBufferGeometry, Shape
} from 'three';
import OrbitControls from 'orbit-controls-es6';
import OBJLoader from "./core/OBJLoader";
import ShapeExtrude from "./ShapeExtrude";
import MeshTween from "./MeshTween";

/**
 * Creates a new instance of ThreeApp.
 * @class
 * @returns An instance of ThreeApp.
 * @example
 * var instance = new ThreeApp();
 */
export default class ThreeApp {
    constructor(holder, dataHandler) {
        this.holder = holder;

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
        this.camera.position.z = 10;
        this.camera.position.x = 10;
        this.camera.position.y = 10;

        this.renderer = new WebGLRenderer({antialias: true});
        this.renderer.setClearColor('#ffffff');
        this.renderer.setSize(width, height);
        holder.appendChild(this.renderer.domElement);

        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({color: '#433F81'});

        const light = new HemisphereLight(0xffffbb, 0x080820, 0.6);
        this.scene.add(light);

        const directionalLight = new DirectionalLight(0xffffff, 0.6);
        this.scene.add(directionalLight);

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
            const extrudes = this.dataHandler.getExtrudeObjects();

            extrudes.forEach((extrude, i) => {
                if (extrude.tweenPaths) {
                    const meshTween = new MeshTween(this.scene);
                    extrude.tweenPaths.forEach((path, i) => {
                        let shapeExtrude = new ShapeExtrude(path, extrude.depth, extrude.color);
                        meshTween.add(shapeExtrude.mesh);
                    });
                    meshTween.group.translateZ(extrude.z);

                    let dir = 1;
                    setInterval(() => {
                        dir *= -1;
                    }, 2000);

                    setInterval(() => {//TEMP for testing
                        if (dir > 0) {
                            meshTween.next(false);
                        } else {
                            meshTween.prev(false);
                        }
                    }, 30);

                } else if (extrude.path) {
                    let shapeExtrude = new ShapeExtrude(extrude.path, extrude.depth, extrude.color);
                    shapeExtrude.mesh.translateZ(extrude.z);
                    this.scene.add(shapeExtrude.mesh);
                }
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

    getColoredMaterial(color) {
        if (!this.coloredMaterials) this.coloredMaterials = {};
        if (!this.coloredMaterials[color]) {
            this.coloredMaterials[color] = new MeshLambertMaterial({
                color: color,
                side: DoubleSide,
                transparent: true,
                opacity: 0.75,
            });
        }
        return this.coloredMaterials[color];
    }

    setMaterial(id, color) {
        if (!this.objectsById || !this.objectsById[id]) return;
        const child = this.objectsById[id];
        if (!color) {
            child.visible = false;
        } else {
            child.visible = true;
            child.material = this.getColoredMaterial(color);
            child.castShadow = false;
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

    updateScene() {
        if (!this.time) this.time = 0.1;
        this.time += 0.002;
        this.dataHandler.setTime(this.time);
        Object.keys(this.objectsById).forEach((id) => {
            this.setMaterial(id, this.dataHandler.getColor(id))
        });
    }
}
