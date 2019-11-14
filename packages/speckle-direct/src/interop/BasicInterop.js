/**
 * Creates a new instance of BasicInterop.
 * @class
 * @returns An instance of BasicInterop.
 * @example
 * var instance = new BasicInterop();
 */
import {FilePersist} from "colorizer-three";
import {DefaultLoadingManager, FileLoader} from "three-full";

export default class BasicInterop {

    constructor() {
    };

    saveTextToFile(options) {
        //{title: 'Save scene', data: data, ext: 'gltf'}
        FilePersist.saveString(options.data, 'scene.gltf');
    }

    setWindowSize() {
        window.alert('Please open in 3D addin to set window size');
    }

    getSelectedPaths() {
        window.alert('Please open in 3D addin to get paths');
    }

    getSelectedMesh(options) {
        window.alert('Please open in 3D addin to get mesh');
    }

    getActiveView(options) {
        window.alert('Please open in 3D addin to get view');
    }

    pageLoad() {

    }

    getLoadFileData(options) {
        if (!options.onLoad) return;//no point loading
        if (!options.onError) {
            options.onError = (e) => {
                console.log(e);
            }
        }
        const url = './data/viewPoints.gltf';
        //ported from GLTFLoader.load() in three.js\examples\js\loaders\GLTFLoader.js
        const loadingManager = new DefaultLoadingManager();
        const fileLoader = new FileLoader(loadingManager);

        fileLoader.setResponseType('arraybuffer');

        fileLoader.load(url, function (data) {
            try {
                options.onLoad(data);
            } catch (e) {
                if (options.onError !== undefined) {
                    options.onError(e);
                } else {
                    throw e;
                }
            }
        }, options.onProgress, options.onError);
    }
}
