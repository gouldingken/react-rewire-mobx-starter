/**
 * Creates a new instance of ACubemapReprojector.
 * @class
 * @returns An instance of ACubemapReprojector.
 * @example
 * var instance = new ACubemapReprojector();
 */

import {
    Scene,
    Mesh,
    PlaneBufferGeometry,
    OrthographicCamera,
    WebGLRenderTarget,
    LinearFilter,
    ClampToEdgeWrapping,
    RGBAFormat,
    UnsignedByteType, CubeCamera,
} from 'three';

export default class ACubemapReprojector {

    constructor(renderer, provideCubeCamera, squareSize) {
        this.width = 1;
        this.height = 1;
        this.renderer = renderer;
        this.material = this.rawShader.getMaterial();
        const square = squareSize;
        this.initScene();
        this.setSize(square, square);
        this.cubeMapSize = square;

        if (provideCubeCamera) {
            this.getCubeCamera(square)
        }
    };

    get rawShader() {
        throw 'rawShader must be implemented for subclass of ACubemapReprojector';
    }

    initScene() {
        this.scene = new Scene();
        this.quad = new Mesh(
            new PlaneBufferGeometry(1, 1),
            this.material
        );
        this.scene.add(this.quad);
        this.camera = new OrthographicCamera(1 / -2, 1 / 2, 1 / 2, 1 / -2, -10000, 10000);

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

    }

    setSize(width, height) {
        this.width = width;
        this.height = height;

        this.quad.scale.set(this.width, this.height, 1);

        this.camera.left = this.width / -2;
        this.camera.right = this.width / 2;
        this.camera.top = this.height / 2;
        this.camera.bottom = this.height / -2;

        this.camera.updateProjectionMatrix();

        this.output = new WebGLRenderTarget(this.width, this.height, {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            format: RGBAFormat,
            type: UnsignedByteType
        });

        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    display(position, scene, angle) {
        const autoClear = this.renderer.autoClear;
        this.renderer.autoClear = true;
        this.cubeCamera.position.copy(position);
        this.cubeCamera.rotateY(angle);
        this.cubeCamera.updateCubeMap(this.renderer, scene);
        this.renderer.autoClear = autoClear;

        this.displayOnCanvas(this.cubeCamera);
    }

    getCubeCamera(size) {
        this.cubeCamera = new CubeCamera(.1, 100000, Math.min(this.cubeMapSize, size));
        return this.cubeCamera;
    }

    displayOnCanvas(cubeCamera) {
        this.quad.material.uniforms.map.value = cubeCamera.renderTarget.texture;
        this.renderer.render(this.scene, this.camera);
    }
}
