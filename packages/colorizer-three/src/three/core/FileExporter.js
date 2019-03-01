import {GLTFExporter} from "three-full";

/**
 * Creates a new instance of FileExporter.
 * @class
 * @returns An instance of FileExporter.
 * @example
 * var instance = new FileExporter();
 */

export default class FileExporter {

    constructor() {
    };

    static saveScene(scene, filename) {
        const gltfExporter = new GLTFExporter();

        const options = {
            onlyVisible: false,
        };
        gltfExporter.parse(scene, function (result) {
            const output = JSON.stringify(result, null, 2);
            console.log(output);
            FileExporter.saveString(output, filename);
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
}
