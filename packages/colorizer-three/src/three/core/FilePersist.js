import {GLTFExporter, GLTFLoader} from "three-full";

/**
 * Creates a new instance of FilePersist.
 * @class
 * @returns An instance of FilePersist.
 * @example
 * var instance = new FilePersist();
 */

export default class FilePersist {

    constructor() {
    };

    static saveScene(scene, saveCallback) {
        const gltfExporter = new GLTFExporter();

        if (!saveCallback) {
            saveCallback = (output) => {
                FilePersist.saveString(output, 'scene.gltf');
            };
        }

        const options = {
            onlyVisible: false,
        };
        gltfExporter.parse(scene, function (result) {
            const output = JSON.stringify(result, null, 2);
            saveCallback(output);

        }, options);
    }

    static saveString(text, filename) {
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link); // Firefox workaround, see #6594

        function save(blob, filename) {
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        }

        save(new Blob([text], {type: 'text/plain'}), filename);
    }

    static loadSceneData(dataStr, callback) {
        //Note that this does not support textures etc that may be referenced within the gltf file

        const loader = new GLTFLoader();
        loader.parse(dataStr, '', (gltf) => {
            callback(gltf.scene);
        }, (error) => console.log(error))
    }

    static loadScene(gltfFile, callback) {
        // Instantiate a loader
        const loader = new GLTFLoader();

        // // Optional: Provide a DRACOLoader instance to decode compressed mesh data
        //         THREE.DRACOLoader.setDecoderPath( '/examples/js/libs/draco' );
        //         loader.setDRACOLoader( new THREE.DRACOLoader() );

        // Load a glTF resource
        loader.load(gltfFile,
            // called when the resource is loaded
            function (gltf) {
                callback(gltf.scene);
                // gltf.animations; // Array<THREE.AnimationClip>
                // gltf.scene; // THREE.Scene
                // gltf.scenes; // Array<THREE.Scene>
                // gltf.cameras; // Array<THREE.Camera>
                // gltf.asset; // Object

            },
            // called while loading is progressing
            function (xhr) {

                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');

            }
        );
    }
}
