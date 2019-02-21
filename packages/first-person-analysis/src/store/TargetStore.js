import {action, computed, decorate, observable} from "mobx";

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
            this.viewTargets[targetId] = {
                id: targetId,
                name: 'none',
                color: '#cccccc',
                currentPoint: {available: 0, occluded: 0}
            };
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

    setCurrentValues(sensor) {
        for (let i = 1; i <= 3; i++) {
            let viewTarget = this.getViewTarget('target' + i);
            viewTarget.currentPoint.available = sensor.values['c' + i].f;
            viewTarget.currentPoint.occluded = sensor.values['c' + i].o;
        }
    }

    get channels() {
        return {
            channel1: this.getViewTarget('target1').color,
            channel2: this.getViewTarget('target2').color,
            channel3: this.getViewTarget('target3').color,
        };
    }
}


decorate(TargetStore, {
    viewTargets: observable,
    channels: computed,
    setCurrentValues: action,
});
