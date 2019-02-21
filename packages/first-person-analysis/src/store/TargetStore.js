import {action, autorun, decorate, observable} from "mobx";

/**
 * Creates a new instance of TargetStore.
 * @class
 * @returns An instance of TargetStore.
 * @example
 * var instance = new TargetStore();
 */
export default class TargetStore {

    viewTargets = {};

    constructor() {
    };


    getViewTarget(targetId) {
        if (!this.viewTargets[targetId]) {
            this.viewTargets[targetId] = {id: targetId, name: 'none', color:'#cccccc', currentPoint: {available: 0, occluded: 0}};
        }
        return this.viewTargets[targetId];
    }
    setTargetObjects(targetId, threeObjects) {
        const viewTarget = this.getViewTarget(targetId);
        viewTarget.threeObjects = threeObjects;
        if (threeObjects.length > 0 && threeObjects[0].userData) {
            const meta = threeObjects[0].userData.meta;
            viewTarget.color = meta.color;
            viewTarget.name = meta.name;
        }

    }
}


decorate(TargetStore, {
    viewTargets: observable,
});
