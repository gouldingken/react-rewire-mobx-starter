/**
 * AFeedbackScene - provides a base class for frame compositing shaders that feed the previous frame back into the shader
 * @class
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
    UnsignedByteType,
} from 'three-full';

export default class AFeedbackScene {
    constructor(renderer, width, height) {
        this.renderer = renderer;
        this.material = this.rawShader.getMaterial();
        this.initScene(width, height);
        this.setSize(width, height);
    };

    get rawShader() {
        throw 'rawShader must be implemented for subclass of ACubemapReprojector';
    }

    initScene(width, height) {
        this.scene = new Scene();
        this.quad = new Mesh(
            new PlaneBufferGeometry(1, 1),
            this.material
        );
        this.scene.add(this.quad);
        // this.camera = new OrthographicCamera(1 / -2, 1 / 2, 1 / 2, 1 / -2, -10000, 10000);
        this.camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
        this.camera.position.z = 2;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

    }

    setSize(width, height) {
        this.width = width;
        this.height = height;

        this.quad.scale.set(this.width, this.height, 1);

        this.camera.left = this.width / 2;
        this.camera.right = this.width / -2;
        this.camera.top = this.height / 2;
        this.camera.bottom = this.height / -2;

        this.camera.updateProjectionMatrix();

        this.output = this.createRenderTarget();

        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createRenderTarget() {
        return new WebGLRenderTarget(this.width, this.height, {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            format: RGBAFormat,
            type: UnsignedByteType
        });
    }
}
