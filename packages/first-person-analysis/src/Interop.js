import PolyOffset from "./geometry/PolyOffset";
import {SpeckleData} from "speckle-direct";

/**
 * Creates a new instance of Interop.
 * @class
 * @returns An instance of Interop.
 * @example
 * var instance = new Interop();
 */
export default class Interop {

    constructor(sceneData) {
        this.sceneData = sceneData;
        this.speckleData = new SpeckleData({scale: 0.1});
    };

    UpdateObjects(response, command, params) {
        const objectsToAdd = [];
        response.resources.forEach((resource, i) => {
            if (command === 'mesh') {
                const mesh = this.speckleData.getMesh(resource);
                if (mesh) {
                    objectsToAdd.push(mesh);
                }
            }
            if (command === 'paths') {
                const outline = this.speckleData.getCurves(resource);
                if (outline) {
                    objectsToAdd.push(outline);
                    const polyOffset = new PolyOffset(outline);
                    this.sceneData.polyOffsets.push(polyOffset);
                }
            }
        });
        if (params.mode === 'target') {
            this.sceneData.setViewTargets(objectsToAdd, params.targetId);
        } else {
            this.sceneData.updateObjects(objectsToAdd);
        }
        // this.sceneData.updateObjects(objectsToAdd);

    }

}
