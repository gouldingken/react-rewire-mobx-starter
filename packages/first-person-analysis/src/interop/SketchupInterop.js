/**
 * Creates a new instance of SketchUpInterop.
 * @class
 * @returns An instance of SketchUpInterop.
 * @example
 * var instance = new SketchUpInterop();
 */
import BasicInterop from "./BasicInterop";

export default class SketchUpInterop extends BasicInterop {

    static get supported() {
        return !!window.sketchup;
    }

    saveTextToFile(options) {
        //{title: 'Save scene', data: data, ext: 'gltf'}
        return window.sketchup.saveTextToFile(options);
    }

    getSelectedPaths() {
        return window.sketchup.getSelectedPaths();
    }

    getActiveView() {
        return window.sketchup.getActiveView();
    }

    pageLoad() {
        return window.sketchup.pageLoad();
    }

    setWindowSize(size) {
        window.sketchup.setWindowSize(size)
    }

    getSelectedMesh(options) {
        return window.sketchup.getSelectedMesh(options);
    }
}
