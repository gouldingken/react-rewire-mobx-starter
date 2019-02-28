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
            if (command === 'view') {
                this.sceneData.setCameraView(resource);
            }
            if (command === 'mesh') {
                const mesh = this.speckleData.getMesh(resource);
                if (mesh) {
                    if (params.mode === 'target') {
                        if (!mesh.properties) mesh.properties = {};
                        mesh.properties.basicMaterial = true;
                    }
                    if (params.mode === 'mesh-points') {
                        this.sceneData.addPointsMesh(mesh);

                    } else {
                        objectsToAdd.push(mesh);
                    }
                }
            }
            if (command === 'paths') {
                const outline = this.speckleData.getCurves(resource);
                if (outline) {
                    objectsToAdd.push(outline);
                    this.sceneData.addOutline(outline);
                }
            }
        });
        if (command !== 'view') {
            if (params.mode === 'target') {
                this.sceneData.setViewTargets(objectsToAdd, params.targetId);
            } else if (params.mode === 'blocker') {
                this.sceneData.setViewBlockers(objectsToAdd);
            } else {
                this.sceneData.updateObjects(objectsToAdd, command);
            }
        }
        // this.sceneData.updateObjects(objectsToAdd);

    }

}
