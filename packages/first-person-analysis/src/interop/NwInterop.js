/**
 * Creates a new instance of NwInterop.
 * @class
 * @returns An instance of NwInterop.
 * @example
 * var instance = new NwInterop();
 */
import BasicInterop from "./BasicInterop";
import {DefaultLoadingManager, FileLoader} from "three-full";

export default class NwInterop extends BasicInterop {

    static get supported() {
        return !!window.require;
    }

    chooseFile(accept, saveAs, callback) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        if (accept) {
            input.setAttribute('accept', accept);
        }
        if (saveAs) {//can be string or bool
            if (typeof saveAs === 'string') {
                input.setAttribute('nwsaveas', saveAs); // absolute path works
            } else {
                input.setAttribute('nwsaveas', '');
            }
        }
        input.addEventListener('change', ({target}) => {
            // target.files[0].path
            callback(target.value);
            if (input.parentNode) {
                input.parentNode.removeChild(input);
            }
        });
        input.click();
    };

    saveTextToFile(options) {
        const fs = window.require('fs');
        this.chooseFile('.gltf', 'scene.gltf', (filepath) => {
            fs.writeFile(filepath, options.data, function (err) {
                if (err) {
                    window.alert('Not Saved ' + err);
                    // throw err;
                } else {
                    console.log('Saved ' + filepath);
                    if (options.onSave) {
                        options.onSave(filepath);
                    }
                }
            });
        });

    }

    getLoadFileData(options) {
        if (!options.onLoad) return;//no point loading
        if (!options.onError) {
            options.onError = (e) => {
                console.log(e);
            }
        }
        const fs = window.require('fs');
        this.chooseFile('.gltf', false, (filepath) => {
            fs.readFile(filepath, 'utf-8', (err, data) => {
                if (err) {
                    options.onError(err);
                } else {
                    options.onLoad(data);
                }
            });
        });
    }
}
